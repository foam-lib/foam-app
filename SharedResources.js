/**
 * Resources loaded on app startup shared across the application.
 * @type {object}
 * @property {function} dispose - Disposes all loaded resources.
 */
const SharedResources = {};

SharedResources.dispose = function(){
    for(let key in this){
        if(key === 'dispose'){
            continue;
        }
        this[key] = null;
    }
};

export default SharedResources;