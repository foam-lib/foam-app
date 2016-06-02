import EventDispatcher from 'foam-event/EventDispatcher';
import Touch from './Touch';

function TouchGroup(){
    EventDispatcher.call(this);

    this._touchMap = {};
    this._touchOrder = [];
}

TouchGroup.prototype = Object.create(EventDispatcher.prototype);

TouchGroup.prototype.getTouchMap = function(){
    return this._touchMap;
};

TouchGroup.prototype.getTouchOrder = function(){
    return this._touchOrder;
};

export default TouchGroup;