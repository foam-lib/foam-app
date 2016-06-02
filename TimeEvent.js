import Event from 'foam-event/Event';

export default class TimeEvent extends Event{
   constructor(type,data){
       super(type,data);
   }
}

TimeEvent.TIME_STOP   = 'stop';
TimeEvent.TIME_START  = 'start';
TimeEvent.TIME_PAUSE  = 'pause';
TimeEvent.TIME_RESUME = 'resume';

