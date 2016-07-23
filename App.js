import validateOptions from 'validate-option';
import path from 'path';

import EventDispatcher from 'foam-event/EventDispatcher';

import * as Vec2 from 'foam-math/Vec2';
import * as Rect from 'foam-geom/Rect';

import Window from './Window';

import ContextGL from 'foam-context-gl/ContextGL';
import Context2d from 'foam-context-2d/Context2d';
import Context2dSvg from 'foam-context-2d-svg/Context2dSvg';

import ResourceType    from './ResourceType';
import SharedResources from './SharedResources';

import Mouse from './Mouse';
import MouseEvent from './MouseEvent';
import TouchGroup from './TouchGroup';
import TouchEvent from './TouchEvent';
import Touch from './Touch';
import Keyboard   from './Keyboard';
import KeyboardEvent from './KeyboardEvent';

import Time from './Time';
import TimeEvent from './TimeEvent';

/*--------------------------------------------------------------------------------------------------------------------*/
// DEFINES
/*--------------------------------------------------------------------------------------------------------------------*/

const Default = Object.freeze({
    WINDOW_WIDTH : 800,
    WINDOW_HEIGHT : 600
});

/**
 * Available context types
 * @readonly
 * @enum {string}
 * @property {string} CONTEXT_2D - foam-context-2d
 * @property {string} CONTEXT_2D_SVG - foam-context2d-svg
 * @property {string} CONTEXT_3D - foam-context-3d
 * @property {string} CONTEXT_NONE - no context
 */
export const ContextType = Object.freeze({
    CONTEXT_2D : '2d',
    CONTEXT_2D_SVG : '2d-svg',
    CONTEXT_3D   : '3d',
    CONTEXT_NONE : 'none'
});

/**
 * App default config.
 * @readonly
 * @type {Object}
 * @property {string} [type=ContextType#CONTEXT_3D] - Context type 2d/3d/none
 * @property {object} [context=null] - Context config
 * @property {object} [element=null] - Target element HTMLCanvasElement / HTMLDomElement
 * @property {object} [elementInput=null] - Target input element for Mouse / Keyboard events
 * @property {object} [elementInputMouse=null] - Target input element for Mouse events
 * @property {object} [elementInputTouch=null] - Target input element for Mouse events
 * @property {object} [elementInputKeyboard=null] - Target input element for Keyboard events
 * @property {boolean} [loop=true} - If true update animation loop is active
 * @property {boolean} [interactive=true] - If true the app can receive user input
 */
export const DefaultConfig = Object.freeze({
    type : ContextType.CONTEXT_3D,
    context : null,
    element : null,
    elementInput : null,
    elementInputMouse : null,
    elementInputTouch : null,
    elementInputKeyboard : null,
    loop : true,
    interactive : true
});

window.requestAnimationFrame = window.requestAnimationFrame ||
                               window.webkitRequestAnimationFrame ||
                               window.mozRequestAnimationFrame;

window.performance = window.performance && window.performance.now ?
    window.performance : {
    offset : window.performance && window.performance.timing && window.performance.timing.navigationStart ?
        window.performance.timing.navigationStart :
        Date.now(),
    now : function(){
        return Date.now() - this.offset;
    }
};

const isSafari = typeof navigator !== 'undefined' && /Version\/[\d\.]+.*Safari/.test(navigator.userAgent);

/*--------------------------------------------------------------------------------------------------------------------*/
// UTILS
/*--------------------------------------------------------------------------------------------------------------------*/

function createFoamContainer(){
    const div = document.body.appendChild(document.createElement('div'));
    div.setAttribute('id','foam-container');
    div.style.width  = window.innerWidth + 'px';
    div.style.height = window.innerHeight + 'px';
    return div;
}

/*--------------------------------------------------------------------------------------------------------------------*/
// FOAM BASE APP
/*--------------------------------------------------------------------------------------------------------------------*/

/**
 * @class App
 * @classdesc The base class for all Foam applications.
 * @augments EventDispatcher
 */
class App extends EventDispatcher{
    /*----------------------------------------------------------------------------------------------------------------*/
    // Constructor
    /*----------------------------------------------------------------------------------------------------------------*/

    /**
     * Constructor
     * @param config
     * @param resources
     * @returns {App}
     * @private
     */
    constructor(config,resources){
        if(App.__sharedApp){
            throw new Error('Class is singleton.');
        }
        super();

        this.__contextType = config.type;
        this.__elementContext = null;

        /* CONTEXT */

        let element;
        if(this.__contextType !== ContextType.CONTEXT_NONE){
            const isCanvas = config.element instanceof HTMLCanvasElement;

            //validate context element svg
            if(this.__contextType === ContextType.CONTEXT_2D_SVG){
                if(isCanvas){
                    throw new Error(`Wrong context element type passed for context ${this.__contextType}`);
                }
                element = config.element || createFoamContainer();

            //validate context element
            } else {
                element = isCanvas ? config.element : (()=>{
                    let target = config.element instanceof Element ? config.element : document.body;
                    let canvas = target.appendChild(document.createElement('canvas'));
                    canvas.width  = Default.WINDOW_WIDTH;
                    canvas.height = Default.WINDOW_HEIGHT;
                    canvas.style.width  = canvas.width + 'px';
                    canvas.style.height = canvas.height + 'px';
                    canvas.setAttribute('tabIndex',''+1);
                    canvas.focus();
                    return canvas;
                })();
            }

        } else {
            element = config.element || createFoamContainer();
        }

        this.__elementContext = element;
        const size = [this.__elementContext.offsetWidth,this.__elementContext.offsetHeight];

        /* WINDOW */

        this.__window = new Window();
        this.__window.makeShared();

        this.__window._bounds = Rect.create2v([0, 0], size);
        this.__window._boundsNormalized = Rect.normalized(this.__window._bounds);
        this.__window._aspectRatio = Rect.getAspectRatio(this.__window._bounds);
        this.__window._center = Rect.getCenter(this.__window._bounds);
        this.__window._fullscreen = false;
        this.__window._contentScale = 1;

        /* CONTEXT CREATE*/

        this._ctx = null;

        switch(config.type){
            // Create 2d context
            case ContextType.CONTEXT_2D:
                this._ctx = new Context2d(this.__elementContext,config.context);
                this._ctx.makeShared();
                break;

            //Create 2d svg context
            case ContextType.CONTEXT_2D_SVG:
                this._ctx = new Context2dSvg(this.__elementContext,config.context);
                this._ctx.makeShared();
                break;

            // Create 3d context
            case ContextType.CONTEXT_3D:
                if(!window.WebGLRenderingContext){
                    this.onContextNotAvailable();
                    return this;
                }
                this._ctx = new ContextGL(this.__elementContext,config.context);
                this._ctx.makeShared();
                break;

            // No context
            case ContextType.CONTEXT_NONE:
                break;
        }

        /* INPUT */

        let elementInput = config.elementInput || this.__elementContext || document.body;

        // input receiver mouse, touch, keyboard
        this.__elementInputMouse = config.elementInputMouse || elementInput;
        this.__elementInputTouch = config.elementInputTouch || this.__elementInputMouse;
        this.__elementInputKeyboard = config.elementInputKeyboard || elementInput;

        this.__mouseTime = null;
        this.__mouse = new Mouse();
        this.__touchGroup = new TouchGroup();
        this.__keyboard = new Keyboard();

        if(config.interactive){
            const self = this;
            const mouse = this.__mouse;
            const touchGroup = this.__touchGroup;

            function updateMousePosition(x,y){
                const width  = self.__window.getWidth();
                const height = self.__window.getHeight();
                mouse._positionPrev[0] = mouse._position[0];
                mouse._positionPrev[1] = mouse._position[1];
                mouse._position[0] = x;
                mouse._position[1] = y;
                mouse._positionPrevNormalized[0] = mouse._positionPrev[0] / width;
                mouse._positionPrevNormalized[1] = mouse._positionPrev[1] / height;
                mouse._positionNormalized[0] = x / width;
                mouse._positionNormalized[1] = y / height;
                mouse._positionDelta[0] = x - mouse._positionPrev[0];
                mouse._positionDelta[1] = y - mouse._positionPrev[1];
            }

            this.__elementInputMouse.addEventListener('mousedown', function onMouseDown(e){
                const x = e.x;
                const y = e.y;
                mouse._positionPrev[0] = mouse._position[0] = x;
                mouse._positionPrev[1] = mouse._position[1] = y;
                mouse._positionPrevNormalized[0] = mouse._positionNormalized[0] = x / self.__window.getWidth();
                mouse._positionPrevNormalized[1] = mouse._positionNormalized[1] = y / self.__window.getHeight();
                mouse._positionDelta[0] = 0;
                mouse._positionDelta[1] = 0;
                mouse._down = true;
                mouse.dispatchEvent(new MouseEvent(MouseEvent.MOUSE_DOWN));
            });

            this.__elementInputMouse.addEventListener('mouseup', function onMouseUp(e){
                updateMousePosition(e.x,e.y);
                mouse._down = false;
                mouse.dispatchEvent(new MouseEvent(MouseEvent.MOUSE_UP));
            });

            this.__elementInputMouse.addEventListener('mousemove', function onMouseMove(e){
                updateMousePosition(e.x,e.y);
                mouse.dispatchEvent(new MouseEvent(mouse._down ? MouseEvent.MOUSE_DRAG : MouseEvent.MOUSE_MOVE));
            });

            this.__elementInputMouse.addEventListener('mousenter', function onMouseEnter(){
                mouse.dispatchEvent(new MouseEvent(MouseEvent.MOUSE_ENTER));
            });

            this.__elementInputMouse.addEventListener('mouseout',  function onMouseOut(){
                mouse.dispatchEvent(new MouseEvent(MouseEvent.MOUSE_OUT));
            });

            function onMouseWheel(e){
                mouse._wheelDirection = e.detail < 0 ? 1 : (e.wheelDelta > 0) ? 1 : -1;
                mouse.dispatchEvent(new MouseEvent(MouseEvent.MOUSE_WHEEL));
            }

            this.__elementInputMouse.addEventListener('mousewheel', onMouseWheel);
            this.__elementInputMouse.addEventListener('DOMMouseScroll', onMouseWheel);

            //first receiver mouse
            this.__mouse.addEventListener(MouseEvent.MOUSE_DOWN,function onMouseDownFirstResponder(e){
                self.onMouseDown(e);
            });

            this.__mouse.addEventListener(MouseEvent.MOUSE_DRAG,function onMouseDragFirstResponder(e){
                self.onMouseDrag(e);
            });

            this.__mouse.addEventListener(MouseEvent.MOUSE_UP,function onMouseUpFirstResponder(e){
                self.onMouseUp(e);
            });

            this.__mouse.addEventListener(MouseEvent.MOUSE_MOVE,function onMouseMoveFirstResponder(e){
                self.onMouseMove(e);
            });

            this.__mouse.addEventListener(MouseEvent.MOUSE_WHEEL,function onMouseWheelFirstResponder(e){
                self.onMouseWheel(e);
            });

            this.__mouse.addEventListener(MouseEvent.MOUSE_ENTER,function onMouseEnterFirstResponder(e){
                self.onMouseEnter(e);
            });

            this.__mouse.addEventListener(MouseEvent.MOUSE_OUT, function onMouseOutFirstResponder(e){
                self.onMouseOut(e);
            });

            function updateTouchPosition(touch,x,y){
                const xlast = touch._position[0];
                const ylast = touch._position[1];
                const width  = self.__window._bounds[2];
                const height = self.__window._bounds[3];
                touch._positionPrev[0] = xlast;
                touch._positionPrev[1] = ylast;
                touch._positionPrevNormalized[0] = xlast / width;
                touch._positionPrevNormalized[1] = ylast / height;
                touch._position[0] = x;
                touch._position[1] = y;
                touch._positionNormalized[0] = x / width;
                touch._positionNormalized[1] = y / height;
            }

            this.__elementInputTouch.addEventListener('touchstart',function onTouchStart(e){
                const touches = e.touches;
                for(let i = 0; i < touches.length; ++i){
                    const touch = touches[i];
                    const id = touch.identifier;
                    //other touches, but old touch still hold
                    if(touchGroup._touchMap[id]){
                        continue;
                    }
                    const x = touch.x;
                    const y = touch.y;
                    const touch_ = touchGroup._touchMap[id] = new Touch();
                    touch_.id = id;
                    touch_._position[0] = touch_._positionPrev[0] = x;
                    touch_._position[1] = touch_._positionPrev[1] = y;
                    touch_._positionNormalized[0] = touch_._positionNormalized[0] = x / self.__window.getWidth();
                    touch_._positionNormalized[1] = touch_._positionNormalized[1] = y / self.__window.getHeight();
                    touchGroup._touchOrder.push(id);
                    touchGroup.dispatchEvent(new TouchEvent(TouchEvent.TOUCH_BEGIN,{touch:touch_}));
                }
            });

            this.__elementInputTouch.addEventListener('touchend',function onTouchEnd(e){
                const touches = e.touches;
                for(let trackedId in touchGroup._touchMap){
                    let ended = true;
                    for(let i = 0; i < touches.length; ++i){
                        if(touches[i].identifier === +trackedId){
                            ended = false;
                            break;
                        }
                    }
                    if(!ended){
                        continue;
                    }
                    const tracked = touchGroup._touchMap[trackedId];
                    updateTouchPosition(tracked,tracked.x,tracked.y);
                    touchGroup.dispatchEvent(
                        new TouchEvent(TouchEvent.TOUCH_END,{touch:tracked})
                    );
                    delete touchGroup._touchMap[trackedId];
                    touchGroup._touchOrder.splice(touchGroup._touchOrder.indexOf(trackedId),1);
                }
            });

            this.__elementInputTouch.addEventListener('touchmove',function onTouchMove(e){
                const touches = e.touches;
                for(let i = 0; i < touches.length; ++i){
                    const touch = touches[i];
                    const tracked = touchGroup._touchMap[''+touch.identifier];
                    if(!tracked){
                        continue;
                    }
                    updateTouchPosition(tracked,touch.x,touch.y);
                    touchGroup.dispatchEvent(new TouchEvent(TouchEvent.TOUCH_MOVE,{touch:tracked}));
                }
            });

            this.__touchGroup.addEventListener(TouchEvent.TOUCH_BEGIN,function onTouchBeginFirstReceiver(e){
                self.onTouchBegin(e);
            });
            this.__touchGroup.addEventListener(TouchEvent.TOUCH_END,function onTouchEndFirstReceiver(e){
                self.onTouchEnd(e);
            });
            this.__touchGroup.addEventListener(TouchEvent.TOUCH_MOVE, function onTouchMoveFirstReceiver(e){
                self.onTouchMove(e);
            });

            function keyEventData(e){
                return {
                    altKey : e.altKey,
                    charCode : e.charCode,
                    code : e.code,
                    ctrlKey: e.ctrlKey,
                    keyCode: e.keyCode,
                    keyIdentifier: e.keyIdentifier,
                    metaKey: e.metaKey,
                    shiftKey: e.shiftKey,
                    timeStamp: e.timeStamp,
                    which: e.which
                };
            }

            this.__elementInputKeyboard.addEventListener('keydown', function onKeyDown(e){
                self.__keyboard.dispatchEvent(new KeyboardEvent(KeyboardEvent.KEY_DOWN,keyEventData(e)));
            });

            this.__elementInputKeyboard.addEventListener('keypress',function onKeyPress(e){
                self.__keyboard.dispatchEvent(new KeyboardEvent(KeyboardEvent.KEY_PRESS,keyEventData(e)));
            });

            this.__elementInputKeyboard.addEventListener('keyup',function onKeyUp(e){
                self.__keyboard.dispatchEvent(new KeyboardEvent(KeyboardEvent.KEY_UP,keyEventData(e)));
            });

            this.__keyboard.addEventListener(KeyboardEvent.KEY_DOWN,function onKeyDownFirstResponder(e){
                self.onKeyDown(e);
            });

            this.__keyboard.addEventListener(KeyboardEvent.KEY_PRESS,function onKeyPressFirstResponder(e){
               self.onKeyPress(e);
            });

            this.__keyboard.addEventListener(KeyboardEvent.KEY_UP,function onKeyUp(e){
                self.onKeyUp(e);
            });
        }

        this.__time = new Time();
        this.__time.makeShared();
        this.__time._start = performance.now();

        //make shared
        App.__sharedApp = this;

        // Call init overridden
        this.setup(resources);

        // Init update
        this.__loop = config.loop;
        this.__tick = null;
        this.__tickRequest = null;

        // no loop tick
        if(!this.__loop){
            this.update(0);
        // init tick
        } else {
            //TODO: Add fixed step + manual stepping
            let self = this;
            this.__tick = function(timestamp){
                self.__time._prev = self.__time._now;

                self.__time._now = timestamp;
                self.__time._elapsed = Math.max(0,timestamp - self.__time._start);
                self.__time._secondsElapsed = self.__time._elapsed * 0.001;

                self.__time._frame = timestamp - self.__time._prev;
                self.__time._delta = self.__time._frame * 0.001;

                self.update(self.__time._delta,timestamp);

                self.__time._framesElapsed++;
                self.__tickRequest = requestAnimationFrame(self.__tick);
            };
            this.__tick(0);
        }
    }

    /**
     * Callback on context not available.
     */
    onContextNotAvailable(){}

    /*----------------------------------------------------------------------------------------------------------------*/
    // Shared
    /*----------------------------------------------------------------------------------------------------------------*/

    /**
     * Returns a shared app instance.
     * @returns {null|App}
     */
    static sharedApp(){
        if(!App.__sharedApp){
            new Error('App not initialized yet.');
        }
        return App.__sharedApp;
    }

    /*----------------------------------------------------------------------------------------------------------------*/
    // User overrides
    /*----------------------------------------------------------------------------------------------------------------*/

    /**
     * Called once after resource loading and context setup for initializing app properties. Must be overridden by user.
     */
    setup(){
        throw new Error('setup() not implemented.');
    }

    /**
     * Tick callback, optional.
     * @param delta
     */
    update(delta){};

    /*----------------------------------------------------------------------------------------------------------------*/
    // Update
    /*----------------------------------------------------------------------------------------------------------------*/

    /**
     * Stops the update loop.
     * @category Update Loop
     */
    stopUpdate(){
        if(!this.__loop || !this.__tickRequest){
            return;
        }
        window.cancelAnimationFrame(this.__tickRequest);
        this.__tickRequest = null;
        this.dispatchEvent(new TimeEvent(TimeEvent.TIME_STOP,{timestamp:performance.now()}));
    }

    /**
     * Restarts the update loop if it has been stopped.
     * @category Update Loop
     */
    restartUpdate(){
        if(!this.__loop || this.__tickRequest){
            return;
        }
        const time = this.__time;
        time._framesElapsed = 0;
        time._start = time._now = performance.now();
        time._previous = 0;
        time._elapsed = 0;
        time._frame = 0;
        time._delta = 0;
        time._deltaSeconds = 0;
    }

    /**
     * Resumes the update loop if it has been stopped.
     * @category Update Loop
     */
    resumeUpdate(){}

    /**
     * Callback on update loop stop.
     * @category Update Loop
     */
    onStopUpdate(){};

    /**
     * Callback on update loop restart.
     * @category Update Loop
     */
    onRestartUpdate(){};

    /**
     * Callback on update loop resume.
     * @category Update Loop
     */
    onResumeUpdate(){};

    /*----------------------------------------------------------------------------------------------------------------*/
    // Time shortcuts
    /*----------------------------------------------------------------------------------------------------------------*/

    /**
     * Returns app time representation.
     * @category Time
     * @returns {Time}
     */
    getTime(){
        return this.__time;
    }

    /**
     * Returns the time elapsed since app start in seconds.
     * @category Time
     * @returns {number}
     */
    getSecondsElapsed(){
        return this.__time._secondsElapsed;
    }

    /**
     * Returns the number of frames elapsed since app start.
     * @category Time
     * @returns {number}
     */
    getFramesElapsed(){
        return this.__time._framesElapsed;
    }

    /**
     * Returns the delta time.
     * @category Time
     * @returns {number}
     */
    getDelta(){
        return this.__time._delta;
    }

    /*----------------------------------------------------------------------------------------------------------------*/
    // Context
    /*----------------------------------------------------------------------------------------------------------------*/

    /**
     * Returns the type of context the app has been initialized with.
     * @category Context
     * @returns {*}
     */
    getContextType(){
        return this.__contextType;
    }

    /**
     * Returns the context´s underlying element.
     * @category Context
     * @returns {*|null}
     */
    getContextElement(){
        return this.__elementContext;
    }

    /*----------------------------------------------------------------------------------------------------------------*/
    // Screen
    /*----------------------------------------------------------------------------------------------------------------*/

    /**
     * Returns the screen´s device pixel ratio.
     * @category Screen
     * @returns {number}
     */
    getScreenContentScale(){
        return window.devicePixelRatio;
    };

    /*----------------------------------------------------------------------------------------------------------------*/
    // Window
    /*----------------------------------------------------------------------------------------------------------------*/

    /**
     * Sets the context window width and height.
     * @category Window
     * @param v
     * @param contentScale
     */
    setWindowSize(v,contentScale){
        this.setWindowSize2(v[0],v[1],contentScale);
    }

    /**
     * Sets the context window width and height
     * @category Window.
     * @param w
     * @param h
     * @param contentScale
     */
    setWindowSize2(w,h,contentScale){
        contentScale = contentScale === undefined ? 1.0 : contentScale;
        if(w === this.__window._bounds[2] &&
           h === this.__window._bounds[3] &&
           contentScale === this.__window._contentScale){
            return;
        }

        this.__window._contentScale = contentScale;
        let ws = w * this.__window._contentScale;
        let hs = h * this.__window._contentScale;

        this.__window._bounds = Rect.setSize2(this.__window._bounds,ws,hs);
        this.__window._center = Rect.getCenter(this.__window._bounds, this.__window._center);
        this.__window._aspectRatio = Rect.getAspectRatio(this.__window._bounds);

        if(this.__elementContext instanceof HTMLCanvasElement){
            this.__elementContext.width = ws;
            this.__elementContext.height = hs;
        }

        if(this.__elementContext === document.body){
            return;
        }

        this.__elementContext.style.width = w + 'px';
        this.__elementContext.style.height = h + 'px';

        if(this._ctx instanceof Context2dSvg){
            this._ctx.updateSize();
        }
    }

    /**
     * Returns the current context window size.
     * @category Window
     * @param {number[]} [out] - Optional out
     * @returns {number[]}
     */
    getWindowSize(out){
        return this.__window.getSize(out);
    }

    /**
     * Returns the current context window width.
     * @category Window
     * @returns {number}
     */
    getWindowWidth(){
        return this.__window.getWidth();
    }

    /**
     * Returns the current context window height.
     * @category Window
     * @returns {number}
     */
    getWindowHeight(){
        return this.__window.getHeight();
    }

    /**
     * Returns the current context window bounds.
     * @category Window
     * @param {number[]} [out] - Optional out
     * @returns {number[]}
     */
    getWindowBounds(out){
        return this.__window.getBounds(out);
    }

    /**
     * Returns the current context window center.
     * @category Window
     * @param {number[]} [out] - Optional out
     * @returns {number[]}
     */
    getWindowCenter(out){
        return this.__window.getCenter(out);
    }

    /**
     * Returns the current context window aspect ratio.
     * @category Window
     * @returns {number}
     */
    getWindowAspectRatio(){
        return this.__window.getAspectRatio();
    }

    /**
     * Enables / disables the current context window fullscreen mode
     * @category Window
     * @param enable
     */
    setWindowFullscreen(enable){
        const isDocumentFullScreen = document.fullScreen ||
                                     document.mozFullScreen ||
                                     document.webkitIsFullScreen;
        const isWindowFullscreen = this.__window.isFullscreen();
        if(( enable &&  isWindowFullscreen &&  isDocumentFullScreen) ||
           (!enable && !isWindowFullscreen && !isDocumentFullScreen)){
            return;
        }

        if(enable){
            this.__window._fullscreen = true;

            if(this.__elementContext.requestFullScreen){
                this.__elementContext.requestFullScreen();
            }
            else if(this.__elementContext.webkitRequestFullScreen){
                this.__elementContext.webkitRequestFullScreen();
            }
            else if(this.__elementContext.mozRequestFullScreen){
                this.__elementContext.mozRequestFullScreen();
            }
        }
        else {
            this.__window._fullscreen = false;

            if(document.exitFullscreen){
                document.exitFullscreen();
            }
            else if(document.webkitExitFullscreen){
                document.webkitExitFullscreen();
            }
            else if(document.mozCancelFullScreen){
                document.mozCancelFullScreen();
            }
        }
    }

    /**
     * Returns true if the current context window is fullscreen.
     * @category Window
     * @returns {boolean}
     */
    isWindowFullscreen(){
        return this.__window.isFullscreen();
    }

    /*----------------------------------------------------------------------------------------------------------------*/
    // Input callback app first receiver
    /*----------------------------------------------------------------------------------------------------------------*/

    /**
     * Callback on mouse down event.
     * @category User Input
     * @param e
     */
    onMouseDown(e){}

    /**
     * Callback on mouse drag event.
     * @category User Input
     * @param e
     */
    onMouseDrag(e){}

    /**
     * Callback on mouse up event.
     * @category User Input
     * @param e
     */
    onMouseUp(e){}

    /**
     * Callback on mouse double click event.
     * @category User Input
     * @param e
     */
    onMouseDblClick(e){}

    /**
     * Callback on mouse move event.
     * @category User Input
     * @param e
     */
    onMouseMove(e){}

    /**
     * Callback on mouse enter event.
     * @category User Input
     * @param e
     */
    onMouseEnter(e){}

    /**
     * Callback on mouse out event.
     * @category User Input
     * @param e
     */
    onMouseOut(e){}

    /**
     * Callback on mouse wheel event.
     * @category User Input
     * @param e
     */
    onMouseWheel(e){}

    /**
     * Callback on touch begin event.
     * @category User Input
     * @param e
     */
    onTouchBegin(e){}

    /**
     * Callback on touch move event.
     * @category User Input
     * @param e
     */
    onTouchMove(e){}

    /**
     * Callback on touch end event.
     * @category User Input
     * @param e
     */
    onTouchEnd(e){}

    /**
     * Callback on key down event.
     * @category User Input
     * @param e
     */
    onKeyDown(e){}

    /**
     * Callback on key press event.
     * @category User Input
     * @param e
     */
    onKeyPress(e){};

    /**
     * Callback on key up event.
     * @category User Input
     * @param e
     */
    onKeyUp(e){}

    /*----------------------------------------------------------------------------------------------------------------*/
    // Shortcut input getter
    /*----------------------------------------------------------------------------------------------------------------*/

    /**
     * Returns the mouse current position.
     * @category User Input
     * @param out
     * @returns {*}
     */
    getMousePosition(out){
        return this.__mouse.getPosition(out);
    }

    /**
     * Returns the mouse previous position.
     * @category User Input
     * @param out
     * @returns {*}
     */
    getMousePositionPrev(out){
        return this.__mouse.getPositionPrev(out);
    }

    /**
     * Returns the current normalized mouse position.
     * @category User Input
     * @param out
     * @returns {*}
     */
    getMousePositionNormalized(out){
        return this.__mouse.getPositionNormalized(out);
    }

    /**
     * Returns the previous normalized mouse position.
     * @category User Input
     * @param out
     * @returns {*}
     */
    getMousePositionPrevNormalized(out){
        return this.__mouse.getPositionPrevNormalized(out);
    }

    /**
     * Returns the current mouse x-coordinate.
     * @category User Input
     * @returns {*}
     */
    getMousePositionX(){
        return this.__mouse.getPositionX();
    }

    /**
     * Returns the current mouse y-coordinate.
     * @category User Input
     * @returns {*}
     */
    getMousePositionY(){
        return this.__mouse.getPositionY();
    }

    /**
     * Returns the previous mouse x-coordinate.
     * @category User Input
     * @returns {*}
     */
    getMousePositionXPrev(){
        return this.__mouse.getPositionXPrev();
    }

    /**
     * Returns the previous mouse y-coordinate.
     * @category User Input
     * @returns {*}
     */
    getMousePositionYPrev(){
        return this.__mouse.getPositionYPrev();
    }

    /**
     * Returns the current normalized mouse x-coordinate.
     * @category User Input
     * @returns {*}
     */
    getMousePositionXNormalized(){
        return this.__mouse.getPositionXNormalized();
    }

    /**
     * Returns the current normalized mouse y-coordinate.
     * @category User Input
     * @returns {*}
     */
    getMousePositionYNormalized(){
        return this.__mouse.getPositionYNormalized();
    }

    /**
     * Returns the previous normalized mouse x-coordinate.
     * @category User Input
     * @returns {*}
     */
    getMousePositionXPrevNormalized(){
        return this.__mouse.getPositionXPrevNormalized();
    }

    /**
     * Returns the previous normalized mouse y-coordinate.
     * @category User Input
     * @returns {*}
     */
    getMousePositionYPrevNormalized(){
        return this.__mouse.getPositionYPrevNormalized();
    }

    /**
     * Returns the mouse wheel delta.
     * @category User Input
     * @returns {*}
     */
    getMouseWheelDelta(){
        return this.__mouse.getWheelDelta();
    }

    /**
     * Returns the mouse wheel direction.
     * @category User Input
     * @returns {*}
     */
    getMouseWheelDirection(){
        return this.__mouse.getWheelDirection();
    }

    /**
     * Returns true if the mouse is down.
     * @category User Input
     * @returns {*}
     */
    isMouseDown(){
        return this.__mouse.isDown();
    }

    /*----------------------------------------------------------------------------------------------------------------*/
    // Frame
    /*----------------------------------------------------------------------------------------------------------------*/

    saveFrameBitmapData(){}
}

App.__sharedApp = null;

/*--------------------------------------------------------------------------------------------------------------------*/
// APP LOAD RESOURCES
/*--------------------------------------------------------------------------------------------------------------------*/

function request(src,type,onSuccess,onError){
    const request_ = new XMLHttpRequest();
    request_.open('GET',src);
    request_.repsonseType = type;
    request_.addEventListener('readystatechange',function onChange(){
        if(this.readyState === 4){
            switch(this.status){
                case 200:
                    onSuccess(this.response);
                    break;
                case 404:
                    onError();
                    break;
            }
        }
    });
    request_.send();
}

function createElement(html){
    var template = document.createElement('template');
    template.innerHTML = html;
    return template.content.firstChild;
}

function loadResource(index,resource,onSuccess,onError,strict){
    let type = resource.type;
    let src  = resource.src;

    if(!src){
        console.log(`Warning: Resource ${type ? `of type '${type}'` : ''} ${index !== null ? `at index ${index}` : ''} has no path.`);
        return;
    }

    src  = path.normalize(src);
    type = type || ResourceType.TEXT;

    if(type !== ResourceType.TEXT &&
       type !== ResourceType.IMAGE &&
       type !== ResourceType.JSON &&
       type !== ResourceType.VIDEO &&
       type !== ResourceType.ARRAY_BUFFER){

        console.log(`Warning: Resource '${src}' of type '${type}' ${index !== null ? `at index ${index}` : ''} is not supported.`);
    }

    function onSuccess_(response){
        onSuccess(index,src,response);
    }

    function onError_(){
        console.log(`Warning: Failed to load resource '${src}' of type '${type}' ${index !== null ? `at index ${index}` : ''}.`);
        if(strict){
            onError(src);
        }
    }

    switch(type){
        case ResourceType.IMAGE:
            const image = new Image();
            image.addEventListener('load',()=>{
                onSuccess_(image);
            });
            image.addEventListener('error',onError_);
            image.src = src;
            break;

        case ResourceType.JSON:
            request(src,type, function(response){
                onSuccess_(JSON.parse(response));
            },onError_);
            break;

        case ResourceType.VIDEO:
            //TODO: Fix Safari

            const video  = document.createElement('video');
            const source = document.createElement('source');

            let videoType = path.extname(src).substring(1);
            switch(videoType){
                case 'ogm':
                case 'ogv':
                    videoType = 'ogg';
                    break;
                case 'ogg':
                case 'mp4':
                case 'webm':
                    break;
                default:
                    throw new Error(`Video type not supported '${videoType}'`);
                    break;
            }

            //chrome/firefox
            if(!isSafari){
                video.addEventListener('canplay', function(){
                    onSuccess_(video);
                });
            }

            video.setAttribute('muted','');
            video.setAttribute('preload','');
            video.setAttribute('loop','');
            video.setAttribute('muted','');

            source.setAttribute('type',`video/${videoType}`);
            source.setAttribute('src',src);

            video.appendChild(source);

            if(isSafari){
                onSuccess_(video);
                console.warn('Video resources currently not supported in safari.')
            }
            break;

        default:
            request(src,type,onSuccess_,onError_);
            break;
    }
}

function loadResourceBundle(bundle,onSuccess,onError,onProcess,strict){
    strict    = strict === undefined ? true : strict;
    onSuccess = onSuccess || function(){};
    onError   = onError   || function(){};
    onProcess = onProcess || function(){};

    const keys   = Object.keys(bundle);
    let numFiles = keys.length;

    //no resources, go
    if(numFiles === 0){
        onSuccess();
        return;
    }

    let numFilesLoaded = 0;
    let error = false;

    function onFileProcessed(index,num,src){
        onProcess({
            index : index,
            num : num,
            src : src
        });
        if(index === num){
            onSuccess(SharedResources);
        }
    }

    function onError_(){
        if(!strict){
            numFiles--;
            onFileProcessed();
            return;
        }
        onError();
        error = true;
    }

    let index = 0;
    for(let resource in bundle){
        loadResource(index++,bundle[resource],
            function(index,src,resource){
                SharedResources[keys[index]] = resource;
                numFilesLoaded++;
                onFileProcessed(numFilesLoaded,numFiles,src);
            },
            onError_,
            strict
        );
        if(error){
            return;
        }
    }
}

/*--------------------------------------------------------------------------------------------------------------------*/
// APP CREATE / DELETE
/*--------------------------------------------------------------------------------------------------------------------*/

/**
 * Creates a new Foam App instance with optional config and resources.
 *
 * @param appObj
 * @param [onError] - Optional on resource error callback.
 * @param [onProcess] - Optional on resource load process callback.
 * @param [onLoad] - Optional on resources loaded callback
 * @param onError
 * @param onProcess
 *
 * @example
 * CreateApp({
 *    setup  : function(){},
 *    update : function(delta){}
 * });
 *
 * CreateApp({
 *   config : {
 *      canvas : someTargetCanvas
 *   },
 *   setup : function(){},
 *   update ; function(delta){}
 * });
 *
 * @example
 * //config
 * let config = {
 *    type: 3d,
 *    canvas : someTargetCanvas
 * };
 */
export function CreateApp(appObj, onError, onProcess, onLoad){
    appObj.config    = appObj.config || {};
    appObj.resources = appObj.resources || {};
    onLoad = onLoad || function(resources,cb){cb(resources);};

    if(!appObj.update){
        appObj.config.loop = false;
    }

    appObj.config = validateOptions(appObj.config,DefaultConfig);

    //check if context type is valid
    if(appObj.config.type && !(
        appObj.config.type === ContextType.CONTEXT_2D ||
        appObj.config.type === ContextType.CONTEXT_2D_SVG ||
        appObj.config.type === ContextType.CONTEXT_3D ||
        appObj.config.type === ContextType.CONTEXT_NONE)){
        throw new Error(`Context type '${appObj.config.type}' not supported.`)
    }

    //TODO: Add dynamic context type loading here

    loadResourceBundle(appObj.resources, function createAppInstance(resources){
        onLoad(resources,function onResourcesProcessed(resources){
            class FoamApp extends App{
                constructor(){
                    super(appObj.config,resources);
                }
            }
            // copy app object to instance
            for(let p in appObj){
                if(p === 'config' || p === 'resources'){
                    continue;
                }
                FoamApp.prototype[p] = appObj[p];
            }

            new FoamApp();
        });
    }, onError, onProcess, appObj.config.strict);
}

/**
 * Completely deletes a Foam App instance.
 * @param app
 */
export function DeleteApp(app){
    //free context
    //free app
    App.__sharedApp = null;
    //free shared resources
    SharedResources.dispose();
}