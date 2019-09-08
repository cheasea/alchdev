function addElement(name, place, no_discover) {
    var cleanName = name.replace(/\[.+\]$/, '');
    var a = $('<div/>', {
        'class': 'element ' + classes[name],
        'title': cleanName
    }).appendTo('#board');
    if (inArray(name, finals))
        a.addClass('final');
    a.data('image', '');
    a.data("elementName", name);
    if (inArray(name, statics)) a.addClass('static');
    if (!no_discover) discoverElement(name);

    // a.html(parseBBCode($('<div/>').text(name).html()));
    textOrImage(a, cleanName);

    if (place !== undefined) {

        //a.offset({top: place.top+$(window).scrollTop(), left: place.left+$(window).scrollLeft()});
        a.animate({
            "top": place.top,
            "left": place.left + $(window).scrollLeft()
        }, 0);
    }
    a.draggable({
        scroll: false
    });
    a.droppable({
        accept: '.element:not(:data(isDead,1))',
        drop: onDrop
    });
    a.click(function () {});
    a.bind("dblclick", function (e) {
        cloneElement(a);
        e.stopPropagation();
    });
    a.bind("mousedown", function (e) {
        a.topZIndex();
        $('#info').html('');
        message(name, 'highlight');
        e.preventDefault();
    });

    if (!$.browser.msie) a.corner();
    a.topZIndex();
    return a;
}