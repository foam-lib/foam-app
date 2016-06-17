import EventDispatcher from 'foam-event/EventDispatcher';
import * as Vec2 from 'foam-math/Vec2';

export default class Mouse extends EventDispatcher{
    /*----------------------------------------------------------------------------------------------------------------*/
    // Constructor
    /*----------------------------------------------------------------------------------------------------------------*/
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

    static sharedMouse(){
        if(!Mouse.__sharedMouse){
            throw new Error('Mouse not initialized.')
        }
        return Mouse.__sharedMouse;
    }

    /*----------------------------------------------------------------------------------------------------------------*/
    // Getter
    /*----------------------------------------------------------------------------------------------------------------*/

    getPosition(out){
        return Vec2.set(out || Vec2.create(), this._position);
    }

    getPositionPrev(out){
        return Vec2.set(out || Vec2.create(), this._positionPrev);
    }

    getPositionX(){
        return this._position[0];
    }

    getPositionY(){
        return this._position[1];
    }

    getPositionXPrev(){
        return this._positionPrev[0];
    }

    getPositionYPrev(){
        return this._positionPrev[1];
    }

    getPositionNormalized(out){
        return Vec2.set(out || Vec2.create(), this._positionNormalized);
    }

    getPositionPrevNormalized(out){
        return Vec2.set(out || Vec2.create(), this._positionPrevNormalized);
    }

    getPositionXNormalized(){
        return this._positionNormalized[0];
    }

    getPositionYNormalized(){
        return this._positionNormalized[1];
    }

    getPositionXPrevNormalized(){
        return this._positionPrevNormalized[0];
    }

    getPositionYPrevNormalized(){
        return this._positionPrevNormalized[1];
    }

    getWheelDelta(){
        return this._wheelDelta;
    }

    getWheelDirection(){
        return this._wheelDirection;
    }

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

    toString(){
        return `position:         ${this._position} \n
                positionPrev:     ${this._positionPrev} \n
                positionNorm:     ${this._positionNormalized} \n
                positionPrevNorm: ${this._positionPrevNormalized} \n
                down:             ${this._down} \n
                downPrev:         ${this._downPrev} \n
                move:             ${this._move} \n
                movePrev:         ${this._framesElapsed} \n
                leave:            ${this._framesElapsed} \n
                leavePrev:        ${this._framesElapsed} \n
                wheelDelta:       ${this._framesElapsed} \n
                wheelDirection:   ${this._deltaSeconds} \n`;

    }
}

Mouse.__sharedMouse = null;