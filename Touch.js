import * as Vec2 from 'foam-math/Vec2';

function Touch(){
    this._id = 0;
    this._positionPrev = Vec2.create();
    this._positionPrevNormalized = Vec2.create();
    this._position = Vec2.create();
    this._positionNormalized = Vec2.create();
    this._positionDelta = Vec2.create();
    this._direction = Vec2.create();
}

Touch.prototype.getId = function(){
    return this._id;
};

Touch.prototype.getPosition = function(out){
    return Vec2.set(out || Vec2.create(),this._position);
};

Touch.prototype.getPositionNormalized = function(out){
    return Vec2.set(out || Vec2.create(),this._positionNormalized);
};

Touch.prototype.getPositionPrev = function(out){
    return Vec2.set(out || Vec2.create(),this._positionPrev);
};

Touch.prototype.getPositionPrevNormalized = function(out){
    return Vec2.set(out || Vec2.create(),this._positionPrevNormalized);
};

Touch.prototype.getDelta = function(out){
    return Vec2.set(out || Vec2.create(), out);
};

Touch.prototype.getDirection = function(out){
    return Vec2.set(out || Vec2.create(), out);
};

export default Touch;
