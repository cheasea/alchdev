$('body').selectable({
    cancel: '.element:not(:data(isDead,1)), .ui-dialog, #abyss, #info, #stack',
    distance: 2,
    filter: '.element:not(.group_block):not(#stack .element):not(:data(isDead,1))',
    stop: onSelectStop,
    selecting: function (e, ui) {
        var el = $(ui.selecting);
        el.css('margin-top', "-" + el.css('border-top-width'));
        el.css('margin-left', "-" + el.css('border-top-width'));
    },
    unselecting: function (e, ui) {
        var el = $(ui.unselecting);
        el.css('margin-top', "0px");
        el.css('margin-left', "0px");
    }
})