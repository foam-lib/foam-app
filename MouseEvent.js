import Event from 'foam-event/Event';

export default class MouseEvent extends Event{
    constructor(type,data){
        super(type,data);
    }
}

MouseEvent.MOUSE_DOWN = 'mousedown';
MouseEvent.MOUSE_PRESSED = 'mousepressed';
MouseEvent.MOUSE_UP = 'mouseup';
MouseEvent.MOUSE_MOVE = 'mousemove';
MouseEvent.MOUSE_STOP = 'mousestop';
MouseEvent.MOUSE_DRAG = 'mousedrag';
MouseEvent.MOUSE_OUT = 'mouseout';
MouseEvent.MOUSE_ENTER = 'mouseenter';
MouseEvent.MOUSE_LEAVE = 'mouseleave';
MouseEvent.MOUSE_WHEEL = 'mousewheel';