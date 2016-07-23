import * as Vec2 from 'foam-math/Vec2';
import * as Rect from 'foam-geom/Rect';
import EventDispatcher from 'foam-event/EventDispatcher';

/**
 * Window
 * @class Window
 * @classdesc Window representation
 * @extends EventDispatcher
 */
function Window(){
    EventDispatcher.call(this);
    this._bounds = Rect.create();
    this._boundsNormalized = Rect.create();
    this._center = [0,0];
    this._aspectRatio = -1;
    this._contentScale = -1;
    this._fullscreen = false;
}

Window.prototype = Object.create(EventDispatcher.prototype);

/**
 * Returns the window´s bounds.
 * @param {number[]} [out] - Optional out
 * @returns {number[]}
 */
Window.prototype.getBounds = function(out){
    return Rect.set(out || Rect.create(),this._bounds);
};

/**
 * Returns the window´s bounds normalized.
 * @param {number[]} [out] - Optional out
 * @returns {number[]}
 */
Window.prototype.getBoundsNormalized = function(out){
    return Rect.set(out || Rect.create(),this._boundsNormalized);
};

/**
 * Returns the window´s size.
 * @param {number[]} [out] - Optional out
 * @returns {number[]}
 */
Window.prototype.getSize = function(out){
    return Vec2.set2(out || Vec2.create(),this._bounds[2],this._bounds[3]);
};

/**
 * Returns the window´s width.
 * @returns {number}
 */
Window.prototype.getWidth = function(){
    return this._bounds[2];
};

/**
 * Returns the windows´s height.
 * @returns {number}
 */
Window.prototype.getHeight = function(){
    return this._bounds[3];
};

/**
 * Returns the window´s size normalized.
 * @param {number[]} [out] - Optional out
 * @returns {number[]}
 */
Window.prototype.getSizeNormalized = function(out){
    return Vec2.set2(out || Vec2.create(),this._boundsNormalized[2],this._boundsNormalized[3]);
};

/**
 * Returns the window´s bounds center.
 * @param {number[]} [out] - Optional out
 * @returns {number[]}
 */
Window.prototype.getCenter = function(out){
    return Vec2.set(out || Vec2.create(),this._center);
};

/**
 * Returns the window´s aspect ratio.
 * @returns {number}
 */
Window.prototype.getAspectRatio = function(){
    return this._aspectRatio;
};

/**
 * Returns the window´s content scale.
 * @returns {number}
 */
Window.prototype.getContentScale = function(){
    return this._contentScale;
};

/**
 * Returns true if the window is currently in fullscreen mode.
 * @returns {boolean}
 */
Window.prototype.isFullscreen = function(){
    return this._fullscreen;
};

Window.prototype.makeShared = function(){
    Window.__sharedWindow = this;
};

/**
 * Returns the shared window instance.
 * @returns {Window|null}
 */
Window.sharedWindow = function(){
    return Window.__sharedWindow;
};

Window.__sharedWindow = null;

export default Window;