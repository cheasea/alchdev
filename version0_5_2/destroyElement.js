function destroyElement(element, anim = true) {
    element = element.filter('.element').not('.static'); //filter unkillable statics
    element.draggable('disable');
    element.droppable('disable');
    //element.effect(destroy_effects[Math.floor(Math.random()*destroy_effects.length)],{},1000, function(){element.remove();})
    if (anim) element.fadeOut(1000, function () {
        element.remove();
    });
    else element.remove();
    element.data("isDead", 1);
}