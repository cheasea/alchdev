function onSelectStop() {
    let reagents = [];
    let x = 0,
        y = 0;

    let selected = $('.ui-selected');

    selected.each(function () {
        $(this).not('.static').data('isDead', 1);

        let name = $(this).data('elementName');
        let pos = {
            x: $(this).offset().left,
            y: $(this).offset().top
        };

        x += pos.x;
        y += pos.y;
        reagents.push(name);
    });

    result = react(reagents);

    if (!result) {
        selected.each(function () {
            $(this).data('isDead', 0);
        });

        return;
    }

    selected.each(function () {
        $(this).not('.static').selectable('destroy');
    });

    x = Math.floor(x / selected.length);
    y = Math.floor(y / selected.length);

    selected.animate({
        'left': x,
        'top': y
    }, 500, function () {
        let elem = $(this);
        destroyElement(elem);
    });

    placeElements(result, {
        'left': x,
        'top': y
    });

    refreshHint();
    updateCounters();
}