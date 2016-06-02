import EventDispatcher from 'foam-event/EventDispatcher';

export default class Keyboard extends EventDispatcher{
    constructor(){
        if(Keyboard.__sharedKeyboard){
            throw new Error('Class is singleton.');
        }
        super();
        Keyboard.__sharedKeyboard = this;
    }
}

Keyboard.__sharedKeyboard = null;