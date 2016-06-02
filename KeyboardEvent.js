import Event from 'foam-event/Event';

export default class KeyboardEvent extends Event{
    constructor(type,data){
        super(type,data);
    }
}

KeyboardEvent.KEY_PRESS = 'keypress';
KeyboardEvent.KEY_DOWN = 'keydown';
KeyboardEvent.KEY_UP = 'keyup';
