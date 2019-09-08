function onDrop(event, ui) {
    let isReady = ui.helper.data('isDead') !== 1 && $(this).data('isDead') !== 1;

    if (!isReady) {
        return;
    }

    let reagents = [ui.helper.data('elementName'), $(this).data('elementName')];
    let pos = $(this).offset();
    let result = react(reagents);

    if (!result) {
        return;
    }

    /* Reaction */
    destroyElement($(this));
    destroyElement(ui.helper);
    placeElements(result, pos);

    refreshHint();
    updateCounters();
}