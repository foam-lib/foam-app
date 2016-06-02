import * as Vec2 from 'foam-math/Vec2';
import * as Rect from 'foam-geom/Rect';
import EventDispatcher from 'foam-event/EventDispatcher';

function Window(){
    EventDispatcher.call(this);
    this._bounds = Rect.create();
    this._boundsNormalized = Rect.create();
    this._center = [0,0];
    this._aspectRatio = -1;
    this._contentScale = -1;
    this._fullscreen = false;
}

Window.prototype = Object.create(EventDispatcher.prototype);

Window.prototype.getBounds = function(out){
    return Rect.set(out || Rect.create(),this._bounds);
};

Window.prototype.getBoundsNormalized = function(out){
    return Rect.set(out || Rect.create(),this._boundsNormalized);
};

Window.prototype.getSize = function(out){
    return Vec2.set2(out || Vec2.create(),this._bounds[2],this._bounds[3]);
};

Window.prototype.getWidth = function(){
    return this._bounds[2];
};

Window.prototype.getHeight = function(){
    return this._bounds[3];
};

Window.prototype.getSizeNormalized = function(out){
    return Vec2.set2(out || Vec2.create(),this._boundsNormalized[2],this._boundsNormalized[3]);
};

Window.prototype.getCenter = function(out){
    return Vec2.set(out || Vec2.create(),this._center);
};

Window.prototype.getAspectRatio = function(){
    return this._aspectRatio;
};

Window.prototype.getContentScale = function(){
    return this._contentScale;
};

Window.prototype.isFullscreen = function(){
    return this._fullscreen;
};

Window.prototype.makeShared = function(){
    Window.__sharedWindow = this;
};

Window.sharedWindow = function(){
    return Window.__sharedWindow;
};

Window.__sharedWindow = null;

export default Window;