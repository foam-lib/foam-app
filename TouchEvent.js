import Event from 'foam-event/Event';

export default class TouchEvent extends Event{
    constructor(type,data){
        super(type,data);
    }
}

TouchEvent.TOUCH_BEGIN = 'touchBegin';
TouchEvent.TOUCH_MOVE  = 'touchMove';
TouchEvent.TOUCH_END   = 'touchEnd';