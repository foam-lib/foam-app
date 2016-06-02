let SharedResources = {};

SharedResources.dispose = function(){
    for(let key in this){
        if(key === 'dispose'){
            continue;
        }
        this[key] = null;
    }
};


export default SharedResources;