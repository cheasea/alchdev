function onSelectStop() {
    let reagents = [];
    let x = 0, y = 0;

    let selected = $('.ui-selected')
          .not(':data("isDead", 1)')
          .not(':data("no-reaction", true)');
    
    selected.each(function() {
        $(this).data('no-reaction', true);

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
        selected.each(function() {
            $(this).data('no-reaction', false);
        });

        return;
    }

    selected.each(function() {
        $(this).not('.static').selectable('destroy');
    });

    x = Math.floor(x / selected.length);
    y = Math.floor(y / selected.length);

    selected.animate({
        'left': x,
        'top': y
    }, 500, function() {
        let elem = $(this);
        elem.data('no-reaction', true);
        destroyElement(elem);
    });

    placeElements(result, {
        'left': x,
        'top': y
    });

    refreshHint();
    updateCounters();
}