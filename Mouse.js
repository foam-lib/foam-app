import EventDispatcher from 'foam-event/EventDispatcher';
import * as Vec2 from 'foam-math/Vec2';

/**
 * Mouse
 * @class Mouse
 * @classdesc Mouse input representation.
 * @extends EventDispatcher
 */
class Mouse extends EventDispatcher{
    /*----------------------------------------------------------------------------------------------------------------*/
    // Constructor
    /*----------------------------------------------------------------------------------------------------------------*/

    /**
     * Constructor
     * @returns {Mouse}
     * @private
     */
    constructor(){
        if(Mouse.__sharedMouse){
            throw new Error('Class is singleton.');
        }
        super();

        this._position = Vec2.create();
        this._positionPrev = Vec2.create();
        this._positionDelta = Vec2.create();

        this._positionNormalized = Vec2.create();
        this._positionPrevNormalized = Vec2.create();

        this._down = false;
        this._button = null;
        this._up = false;
        this._move = this._movePrev = false;
        this._leave = this._enter = false;
        this._wheelDelta = 0;
        this._wheelDirection = 0;

        Mouse.__sharedMouse = this;
    }

    /**
     * Returns a shared mouse instance.
     * @returns {Mouse}
     */
    static sharedMouse(){
        if(!Mouse.__sharedMouse){
            throw new Error('Mouse not initialized.')
        }
        return Mouse.__sharedMouse;
    }

    /*----------------------------------------------------------------------------------------------------------------*/
    // Getter
    /*----------------------------------------------------------------------------------------------------------------*/

    /**
     * Returns the mouse current position.
     * @param {number[]} [out] - Optional out
     * @returns {number[]}
     */
    getPosition(out){
        return Vec2.set(out || Vec2.create(), this._position);
    }

    /**
     * Returns the mouse previous position.
     * @param {number[]} [out] - Optional out
     * @returns {number[]}
     */
    getPositionPrev(out){
        return Vec2.set(out || Vec2.create(), this._positionPrev);
    }

    /**
     * Returns the current mouse x-coordinate.
     * @returns {number}
     */
    getPositionX(){
        return this._position[0];
    }

    /**
     * Returns the current mouse y-coordinate.
     * @returns {number}
     */
    getPositionY(){
        return this._position[1];
    }

    /**
     * Returns the previous mouse x-coordinate.
     * @returns {number}
     */
    getPositionXPrev(){
        return this._positionPrev[0];
    }

    /**
     * Returns the previous mouse y-coordinate.
     * @returns {number}
     */
    getPositionYPrev(){
        return this._positionPrev[1];
    }

    /**
     * Returns the current normalized mouse position.
     * @param {number[]} [out] - Optional out
     * @returns {number[]}
     */
    getPositionNormalized(out){
        return Vec2.set(out || Vec2.create(), this._positionNormalized);
    }

    /**
     * Returns the previous normalized mouse position.
     * @param {number[]} [out] - Optional out
     * @returns {number[]}
     */
    getPositionPrevNormalized(out){
        return Vec2.set(out || Vec2.create(), this._positionPrevNormalized);
    }

    /**
     * Returns the current normalized mouse x-coordinate.
     * @returns {number}
     */
    getPositionXNormalized(){
        return this._positionNormalized[0];
    }

    /**
     * Returns the current normalized mouse y-coordinate.
     * @returns {number}
     */
    getPositionYNormalized(){
        return this._positionNormalized[1];
    }

    /**
     * Returns the previous normalized mouse x-coordinate.
     * @returns {number}
     */
    getPositionXPrevNormalized(){
        return this._positionPrevNormalized[0];
    }

    /**
     * Returns the previous normalized mouse y-coordinate.
     * @returns {number}
     */
    getPositionYPrevNormalized(){
        return this._positionPrevNormalized[1];
    }

    /**
     * Returns the mouse wheel delta.
     * @returns {number}
     */
    getWheelDelta(){
        return this._wheelDelta;
    }

    /**
     * Returns the mouse wheel direction.
     * @returns {number}
     */
    getWheelDirection(){
        return this._wheelDirection;
    }

    /**
     * Returns true if the mouse is down.
     * @returns {boolean}
     */
    isDown(){
        return this._down
    }

    isPressed(){

    }

    isDragged(){

    }

    didMove(){

    }

    didEnter(){

    }

    didLeave(){

    }

    isLeftDown(){

    }

    isRightDown(){

    }

    isMiddleDown(){

    }

    /*----------------------------------------------------------------------------------------------------------------*/
    // Description
    /*----------------------------------------------------------------------------------------------------------------*/

    /**
     * Returns a state string description.
     * @returns {string}
     */
    toString(){
        return `position:         ${this._position} \n
                positionPrev:     ${this._positionPrev} \n
                positionNorm:     ${this._positionNormalized} \n
                positionPrevNorm: ${this._positionPrevNormalized} \n
                down:             ${this._down} \n
                move:             ${this._move} \n
                wheelDelta:       ${this._wheelDelta} \n
                wheelDirection:   ${this._wheelDirection} \n`;
    }
}

Mouse.__sharedMouse = null;

export default Mouse;