import Event from 'foam-event/Event';

/**
 * KeyboardEvent
 * @class KeyboardEvent
 * @classdesc Keyboard input event representation.
 * @augments Event
 */
export default class KeyboardEvent extends Event{
    constructor(type,data){
        super(type,data);
    }
}

/**
 * Key event type key press.
 * @type {string}
 */
KeyboardEvent.KEY_PRESS = 'keypress';

/**
 * Key event type key down.
 * @type {string}
 */
KeyboardEvent.KEY_DOWN = 'keydown';

/**
 * Key event type key up.
 * @type {string}
 */
KeyboardEvent.KEY_UP = 'keyup';
