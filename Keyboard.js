import EventDispatcher from 'foam-event/EventDispatcher';

/**
 * Keyboard
 * @class Keyboard
 * @classdesc Keyboard input representation.
 * @extends EventDispatcher
 */
class Keyboard extends EventDispatcher{
    constructor(){
        if(Keyboard.__sharedKeyboard){
            throw new Error('Class is singleton.');
        }
        super();
        Keyboard.__sharedKeyboard = this;
    }

    /**
     * Returns a shared keyboard instance.
     * @returns {null|Keyboard}
     */
    static sharedKeyboard(){
        return Keyboard.__sharedKeyboard;
    }
}

Keyboard.__sharedKeyboard = null;

export default Keyboard;