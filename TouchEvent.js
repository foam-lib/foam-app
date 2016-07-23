import Event from 'foam-event/Event';

class TouchEvent extends Event{
    constructor(type,data){
        super(type,data);
    }
}

TouchEvent.TOUCH_BEGIN = 'touchBegin';
TouchEvent.TOUCH_MOVE  = 'touchMove';
TouchEvent.TOUCH_END   = 'touchEnd';

export default TouchEvent;