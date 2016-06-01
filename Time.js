import EventDispatcher from 'foam-event/EventDispatcher';
import TimeEvent from './TimeEvent';

export const State = Object.freeze({
    PAUSED  : 'paused',
    STOPPED : 'stopped',
    RUNNING : 'running'
});

export default class Time extends EventDispatcher {
    /*----------------------------------------------------------------------------------------------------------------*/
    // Constructor
    /*----------------------------------------------------------------------------------------------------------------*/

    constructor(){
        super();

        this._start = 0;
        this._now = 0;
        this._previous = 0;
        this._elapsed = 0;
        this._frame = 0;
        this._delta = 0;

        this._deltaSeconds = 0;

        this._framesElapsed = 0;
        this._secondsElapsed = 0;

        this._reset();
        this._state = State.STOPPED;
    }

    static sharedTime(){
        if(!Time.__sharedTime){
            throw new Error('Time not initialized.');
        }
        return Time.__sharedTime;
    }

    getState(){
        return this._state;
    }

    _reset(){
        this._start = 0;
        this._now = 0;
        this._previous = 0;
        this._elapsed = 0;
        this._frame = 0;
        this._delta = 0;

        this._deltaSeconds = 0;
    }

    /*----------------------------------------------------------------------------------------------------------------*/
    // State check
    /*----------------------------------------------------------------------------------------------------------------*/

    isStopped(){
        return this._state === State.STOPPED;
    }

    isPaused(){
        return this._state === State.PAUSED;
    }

    /*----------------------------------------------------------------------------------------------------------------*/
    // Getter
    /*----------------------------------------------------------------------------------------------------------------*/

    getStart(){
        return this._start;
    }

    getNow(){
        return this._now;
    }

    getSecondsElapsed(){
        return this._secondsElapsed;
    }

    getDelta(){
        return this._delta;
    }

    toString(){
        return `start:   ${this._start} \n
                now:     ${this._now} \n
                prev:    ${this._prev} \n
                elapsed: ${this._secondsElapsed} \n
                frame:   ${this._framesElapsed} \n
                delta:   ${this._deltaSeconds} \n`;

    }
}

Time.__sharedTime = null;