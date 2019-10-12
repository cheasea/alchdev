$('#err_msg').dialog('close');

$('#info').empty();
$('#board').empty();

$('#order_group').empty();
$('#order_123').empty();
$('#order_abc').empty();
var opened = [];

let allElements = {};
let allCounters = {};

for (let elem of inits) {
    countElements(elem);
}

for (let r in reactions) {
    reactions[r].forEach(elem => {
        countElements(elem);
    });

    r.split('+').forEach(elem => {
        countElements(elem);
        allElements[elem].hasReaction = true;
    });
}

function deleteElements(name) {
    name.each(function() {
        $(this).data('isDead', 1);
        $(this).draggable('disable');
        $(this).fadeOut(1000, function() {
            $(this).remove();
        });
    });
}

function countElements(name) {
    let counter = name.match(matchCounter);

    if (name[0] === '-') return;

    if (!counter) {
        name = name.replace(matchCond, '');
    }

    if (counter) {
        if (!allElements[counter[1]]) {
            allElements[counter[1]] = {};
        }

        let [min, max] = [counter[5], counter[9]];

        if (min) {
            min.split(',').forEach(item => {
                if (allElements[item]) return;

                allElements[item] = {};
            });
        }

        if (max) {
            max.split(',').forEach(item => {
                if (allElements[item]) return;

                allElements[item] = {};
            });
        }
    } else {
        if (allElements[name]) return;

        allElements[name] = {};
    }
}

function textOrImage(a, name, checkingValue = true) {
    let cleanName;

    if (name.match(/.+\[.+\]/)) {
        cleanName = name.replace(/\[.+\]$/, '');
    } else {
        cleanName = name;
    }

    let filename;
    let counterText;

    if (labels[name]) {
        filename = MEDIA_URL + labels[name];
    }

    if (counters[name] && checkingValue) {
        counterText = `${name} (${counters[name].value})`;
    }

    if (filename && settings.images) {
        let img = $('<img/>', {
            src: filename,
            'class': 'element-icon'
        });
        img.mousedown(function (e) {
            e.preventDefault();
        });

        a.append(img);
        a.addClass('img-element');
        a.data('image', filename);

        img.error(function () {
            if (counterText) a.text(counterText)
            else a.text(cleanName);

            a.removeClass('img-element');
            a.removeClass('img-stack-element');
            a.data('image', false);
        });
    } else {
        if (counterText) a.text(counterText)
        else a.text(cleanName);
    }
}

function createShortcut(name, checkingValue) {
    var o = $("<span/>", {
        'class': 'element ' + classes[name]
    });
    if (inArray(name, finals))
        o.addClass('final');
    textOrImage(o, name, checkingValue);
    if (o.data('image')) {
        o.attr('title', name)
        o.addClass('img-stack-element');
        o.removeClass('img-element');
    } else
        o.attr('title', ((recipes[name] === undefined) ? '' : recipes[name].join('; ')));
    o.draggable({
        distance: 5,
        helper: function () {
            return addElement(name, {
                top: 0,
                left: 0
            });
        },
        stop: function (event, ui) {
            if (!ui.helper.data("isDead")) {
                addElement(name, ui.helper.offset()).appendTo('#board');
                refreshHint();
            }
        }
    });
    o.data("elementName", name);
    return o;
}

function addToStack(name) {
    var preHeight = $('#order_123').height();
    // discover order
    var o = createShortcut(name, false);
    o.appendTo($('#order_123'));

    // alphabetical order
    var o = createShortcut(name, false);
    var i = 0;
    var sorted = opened.slice(0).sort();
    if (sorted.length > 1) {
        while (name > sorted[i]) i++;
        if (i < 1)
            o.prependTo($('#order_abc'));
        else
            o.insertAfter($('#order_abc').children('.element:eq(' + (i - 1) + ')'));
    } else
        o.appendTo($('#order_abc'));

    // groups order

    var o = createShortcut(name, false);

    if (classes[name]) {
        if ($.isArray(classes[name]))
            var cur_class = classes[name][0].split(' ')[0];
        else
            var cur_class = classes[name].split(' ')[0];
    } else
        var cur_class = 'abstract';

    if (classes[name])
        var group = '_' + cur_class;
    else
        var group = '_no_group';
    if ($('#order_group').children('.' + group).size() === 0) {
        var groupBox = $('<span/>', {
            'class': group + ' element ' + classes[name],
            text: '[' + classes_strings[cur_class] + ']',
            style: 'display:inline-block;'
        }).appendTo($('#order_group'));
        var ul = $('<div/>', {
            'class': classes[name] + ' group_block'
        }).appendTo(groupBox);

        groupBox.mouseenter(function () {
            ul.show(200);
            ul.topZIndex();
        });
        groupBox.mouseleave(function () {
            ul.hide(200);

        });
        groupBox.click(function () { // show group-dialog - box with elements

            if (!$('#gd' + group).length) {
                $('<div/>', {
                    id: 'gd' + group,
                    'class': 'gd'
                }).dialog({
                    zIndex: 0,
                    stack: false
                });
                $('#gd' + group).dialog('widget').topZIndex().addClass('no-select');
                $('#gd' + group).dialog('widget').click(function () {
                    $(this).topZIndex();
                });
                $('#order_group').children('.' + group).children('.group_block').children('.element').each(
                    function (index) {
                        createShortcut($(this).data('elementName')).appendTo($('#gd' + group));
                    });
            } else {
                $('#gd' + group).dialog('open');
            }

        });

    }
    if (!groupBox) var groupBox = $('#order_group').children('.' + group);
    if (!ul) var ul = groupBox.children('.group_block');
    var li = ul.append(o);
    if ($('#gd' + group).length) {
        createShortcut(name).appendTo($('#gd' + group));
    }

    //and resize window after all
    var postHeight = $('#order_123').height();
    if (typeof (VK) != 'undefined' && VK.callMethod) {
        var deltaHeight = postHeight - preHeight;
        var newHeight = $(window).height() + deltaHeight;
        VK.callMethod('resizeWindow', $(window).width(), newHeight);
    }
}

function discoverElement(elem, verbose) {
    let counter = elem.match(matchCounter);
    let name;

    if (counter) {
        name = counter[1];
    } else {
        name = elem;
    }

    if (inArray(name, opened)) return;

    opened.push(name);

    if (verbose === undefined || verbose === true) {
        message(name, 'highlight');
    }

    if (settings['stack']) {
        if (!inArray(name, statics)) addToStack(name);

        if (opened.length === 50) {
            infoMsg('Вы открыли довольно много элементов и, возможно, они уже не помещаются у вас на экране или создают неудобства. Попробуйте включить сортировку по группам нажав <a href="#" onclick="toggleSort(\'group\')">здесь</a> или как показано на рисунке: <br><img src="/img/help/groups.PNG"/>');
        }
    }

    $('#save').show();
    refreshStat();
}

function pulsate(el) {
    if (el.data('pulsating')) return;
    el.data('pulsating', true)
    el.effect('pulsate', {
        "times": 4
    }, 250, function () {
        $(this).data('pulsating', false);
    });
}

function cloneElement(elem) {
    if (!settings.clone) return;

    let name = elem.data('elementName');
    let pos = elem.offset();

    if (counters[name]) return;

    placeElements([name, name], pos);
    destroyElement(elem);
}

function onSelectStop() {
    let reagents = [];
    let x = 0,
        y = 0;

    let selected = $('.ui-selected').not(':data("isDead", 1)');

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

function destroyElement(element, anim = true) {
    element = element.filter('.element').not('.static').not(':data(isDeleting, 1)'); 

    if (!element[0]) return;
    
    element.data('isDeleting', 1)
    element.data('isDead', 1);
    element.draggable('disable');
    element.droppable('disable');

    if (anim) {
        element.fadeIn(0);
        element.fadeOut(1000, function() {
            element.remove();
        });
    } else {
        element.fadeIn(0);
        element.remove();
    }
}

function getModId() {
    var regex = /[^\d]*(\d+)[^\d]*/gm;
    var res = regex.exec($('#load')[0].onclick.toString());
    return res[1];
}

let isSaving = false;

$('#save a')[0].onclick = () => {
    if (isSaving) return;

    isSaving = true;
    stopGame();

    $('#save').append('<span id="save_msg">(игра сохраняется<span id="loader"></span>)</span>');

    let checkingAnimation = setInterval(() => {
        let count = 0;
        let animation = $('.element:animated');

        if (!animation[0]) {
            save(`/versions/${getModId()}/save/`);
            $('#save_msg').remove();

            clearInterval(checkingAnimation);
            runGame();
            isSaving = false;
        } else {
            if (count <= 3) $('#loader').append('.');
            count++;
        }
    }, 500);
}

function stopGame() {
    $('.element').draggable('disable');
    $('.element').droppable('disable');
    $('body').selectable('disable');
}

function runGame() {
    $('.element').draggable('enable');
    $('.element').droppable('enable');
    $('body').selectable('enable');
}

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
    },
    selected: function (e, ui) {
        var el = $(ui.selected);
        el.css('margin-top', "0px");
        el.css('margin-left', "0px");
    }
})

function updateCounters() {
    for (let name in allCounters) {
        let elem = $(`#board .element:data(elementName,"${name}")`);

        if (!elem) continue;

        elem.text(`${name}: ${allCounters[name].value}`);
    }
}

function react(r, b = false) {
    var reagents = r.sort().join('+');
    var results = [];
    if (b || reactions[reagents]) {
        var resultsTemp = []
        if (b) resultsTemp = r;
        else
            for (var i in reactions[reagents]) {
                resultsTemp.push(reactions[reagents][i])
            }
        for (var i = 0; i < resultsTemp.length; i++) {
            if (name = parseConditions(resultsTemp[i])) {
                // BEGIN processing counters
                let counter = resultsTemp[i].match(/set (.+) (.+$)/);

                if (counter) {
                    let name = counter[1];
                    let values = counter[2];

                    if (!allElements[name]) {
                        allElements[name] = {};
                    }

                    if (!allCounters[name]) {
                        allCounters[name] = {};
                    }

                    let setValue = values.match(/([+|\-|=])(\d+(?:\.\d+)?)/);
                    let elem = $(`#board .element:data(elementName,"${name}")`);
                    if (setValue) {
                        let operation = setValue[1];
                        let getValue = +allCounters[name].value;
                        let length = +setValue[2].length - 2;

                        if (length < 0) length = 0;

                        switch (operation) {
                            case '=': 
                                allCounters[name].value = (+setValue[2]).toFixed(length);
                                break;
                            case '+':
                                allCounters[name].value = (getValue + +setValue[2]).toFixed(length);
                                break;
                            case '-':
                                allCounters[name].value = (getValue - +setValue[2]).toFixed(length);
                                break;
                        }

                        if (elem[0]) pulsate(elem);
                    }

                    if (!elem[0]) {
                        resultsTemp.push(name);
                    }
                } else if (name.charAt(0) == '-') { //name starts with at least one minus
                    name = name.substr(1);
                    if (name.charAt(0) == '-') { //second minus found - necessary element
                        name = name.substr(1);
                        if (name.charAt(0) == '-') { //third minus found - clear
                            if (name.length == 1) //clear all
                                $('#board .element').data('maybeKill', '1');
                            else { //clear identical elements
                                name = name.substr(1);
                                var classExists = false
                                var l;
                                for (l in classes_strings)
                                    if (classes_strings[l] == name) {
                                        classExists = true
                                        break
                                    }

                                if (classExists)
                                    $('#board .element.' + l).not('.ui-selected').data('maybeKill', '1');
                                else
                                    $('#board .element:data(elementName,"' + name + '")').not('.ui-selected').data('maybeKill', '1');
                            }
                        } else { //double minus - required element
                            var e = $('#board .element:data(elementName,"' + name + '")').not('.ui-selected').not(':data(toKill,1)').not(':data(maybeKill,1)').first();
                            if (e.length == 0)
                                e = $('#board .element:data(elementName,"' + name + '")').not('.ui-selected').not(':data(toKill,1)').first();
                            e.data('toKill', '1');
                            if (e.length == 0) { //fail reaction
                                logReaction('Для этой реакции необходимо, чтобы на поле присутствовал еще ' + name, reagents);
                                $('#board .element:data(toKill,1)').data('toKill', '0');
                                $('#board .element:data(maybeKill,1)').data('maybeKill', '0');
                                return 0;
                            }
                        }
                    } else if (name.charAt(0) == '?') {
                        name = name.substr(1);
                        if (!inArray(name, opened)) {
                            logReaction('Эта реакция будет работать если открыть ' + name, reagents);
                            return 0;
                        }
                    } else { //only one minus - unnecessary element
                        var e = $('#board .element:data(elementName,"' + name + '")');
                        e.data('toDelete', true);
                    }
                } else {
                    results.push(name);

                    if (!inArray(name, r)) {
                        var reaction = reagents; //+' = '+reactions[reagents].join(', ');
                        update_recipes(name, reaction);
                    }
                }
            }
        }
        //start reaction

        let toDelete = $('#board :data(toDelete)');

        if (toDelete[0]) {
            deleteElements(toDelete);
        }

        destroyElement($('#board :data(toKill,1)'));
        destroyElement($('#board :data(maybeKill,1)'));

        if (!reactions[reagents] && messages[reagents]) {
            message(reagents, 'highlight');
        }

        if (results.length === 0) return 0;

        if (!b) logReaction(results.join(', '), reagents);
        if (messages[reagents]) message(reagents, 'highlight');
        
        return results;
    } else {
        logReaction(false, reagents);
        return 0;
    }
}

function applySettings(settings) {
    $(document).unbind("dblclick");
    if (settings['add']) {
        $(document).bind("dblclick", function (e) {
            placeElements(react(inits, true), {
                top: e.pageY,
                left: e.pageX
            });
            refreshHint();
            e.stopPropagation();
        });
    } else {
        $(document).bind("dblclick", function (e) {});
    }
}

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

let inited = false;

var wrongs = [];
var finals = [];

function test(type) {
    let elements = [];
    let cleanName;

    for (let i in inits) {
        if (!inArray(inits[i], elements)) {
            elements.push(inits[i]);
        }
    }

    for (var i in reactions) {
        for (var j in reactions[i]) {
            var counterParsed = reactions[i][j].match(matchCounter);
            if (counterParsed && counterParsed[1] != undefined) {
                if (counterParsed[5]) elements = elements.concat(counterParsed[5].split(","));
                if (counterParsed[9]) elements = elements.concat(counterParsed[9].split(","));
            }
            cleanName = clearName(reactions[i][j]);
            if (cleanName.charAt(0) != '-' && !inArray(cleanName, elements)) {
                elements.push(cleanName);
            }
        }
    }
    if (type == 'total') return elements;
    if (type === undefined || type == 'unstyled') {
        update_dictionary(elements, finals);
    }
    for (var i in reactions) {
        var leftsiders = i.split('+');
        for (var j in leftsiders) {
            if (leftsiders[j].charAt(0) != '-')
                removeFromArray(leftsiders[j], finals, false);
            if (type == 'finals') return finals;

            if (leftsiders[j].charAt(0) != '-' && !inArray(leftsiders[j], elements) && !inArray(leftsiders[j], wrongs)) {
                wrongs.push(leftsiders[j]);
            }
        }
    }
    if (type == 'wrongs') return wrongs;


    var unstyled = [];
    if (type === undefined || type == 'unstyled') {
        for (var i in elements) {
            if (elements[i].charAt(0) != '-' && classes[elements[i]] === undefined)
                unstyled.push(elements[i]);
        }
    }
    if (type == 'unstyled') return unstyled;
    var result = [];
    result.total = elements;
    result.unstyled = unstyled;
    result.wrongs = wrongs;
    result.finals = finals;

    return result;
}

function gameInit() {
    if (!inited) {
        inited = true;
        $('#board').children('.element').remove();
        if (finals.length == 0) {
            $("#vote_stats").hide();
            $("#vote_result").hide();
            $("#abyss").droppable({
                drop: function (e, ui) {
                    destroyElement(ui.helper);
                    refreshHint();
                }
            });
            $('#stack-btn').hide();
            $("#help").dialog({
                autoOpen: false,
                position: 'right',
                open: renderHint
            });
            $("#element_hint").dialog({
                autoOpen: false,
                width: 320
            });
            $("#payment_dialog").dialog({
                autoOpen: false,
                width: 'auto'
            }).bind('dialogclose', function () {
                getHintCount();
            });
            $("#recipe_list").dialog({
                autoOpen: false,
                position: 'left'
            });
            $("#err_msg").dialog({
                autoOpen: false
            });
            $("#info_msg").dialog({
                autoOpen: false,
                width: 500
            });
            $("#welcome_dialog").dialog({
                autoOpen: ($.cookie('welcomed') ? false : true),
                width: 800
            });
            $("#elementFilter").keyup(function (event) {
                filterStack($("#elementFilter").val());
            });
            $("#showHelp").click(function () {
                if ($('#help').dialog('isOpen')) $('#help').dialog('close');
                else $('#help').dialog('open');

                reachGoal('SHOW_HINTS');
            });

            applySettings(settings);

            if (settings['add']) {
                $(document).unbind('dblclick');
                $(document).bind('dblclick', function (e) {
                    let spawned = [];

                    let filtered = inits.map(item => {
                        let counter = item.match(matchCounter);

                        if (counter || counters[item]) {
                            let name;

                            if (counter) {
                                name = counter[1];
                            } else {
                                name = item;
                            }

                            if (spawned.indexOf(name) !== -1) return;

                            spawned.push(name);
                            return name;
                        } else {
                            return item;
                        }
                    });

                    filtered = filtered.filter(item => {
                        return (typeof item !== 'undefined')
                    });

                    placeElements(filtered, {
                        top: e.pageY,
                        left: e.pageX
                    });

                    refreshHint();
                    e.stopPropagation();
                });
            }

            toggleSort($('#order').val());

            sortKeys(reactions);
            var test1 = test();
            var total = test1.total;
            finals = test1.finals;
            wrongs = test1.wrongs;

            element_count = Object.keys(allElements).length;
            refreshStat();
        }

        if (settings.debug == "true") console.log("Game Inited.");
        //so.. we are ready, lets go
        placeElements(react(inits, true), {
            top: $('#stack').offset().top + $('#stack').height() + 200,
            left: $('body').width() / 2 - 100
        }, true);
        updateCounters();
    }
}

gameInit();

function addElement(name, place, no_discover) {
    let cleanName;

    if (name.match(/.+\[.+\]/)) {
        cleanName = name.replace(/\[.+\]$/, '');
    } else {
        cleanName = name;
    }

    var a = $('<div/>', {
        'class': 'element ' + classes[name],
        'title': cleanName
    }).appendTo('#board');
    if (allElements[name].hasReaction !== true) 
        a.addClass('final');
    a.data('image', '');
    a.data("elementName", name);
    if (inArray(name, statics)) a.addClass('static');
    if (!no_discover) discoverElement(name);

    // a.html(parseBBCode($('<div/>').text(name).html()));
    textOrImage(a, name);

    if (place !== undefined) {

        //a.offset({top: place.top+$(window).scrollTop(), left: place.left+$(window).scrollLeft()});
        a.animate({
            "top": place.top,
            "left": place.left + $(window).scrollLeft()
        }, 0);
    }
    a.draggable({
        scroll: false,
        start: function () {
            if ($(this).data('isDead')) return;
            $(this).stop();
            $(this).css('opacity', 1)
        }
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

function placeElements(names, place, firstPush) {
    var x = place.left,
        y = place.top;
    var top, left, radius = 20,
        start_angle = Math.random() * 2 * Math.PI;
    var e;

    let filtered = names.filter(item => {
        if (counters[item] && $(`#board .element:data(elementName,"${item}"):data(no-counter,0)`)[0]) {
            return false;
        }

        let counter = item.match(matchCounter);

        if (counter && $(`#board .element:data(elementName,"${counter[1]}")`)[0]) {
            return false;
        }

        if (counter && classes[counter[1]] === 'group_block') {
            addElement(counter[1], {
                'top': 0,
                'left': 0
            });

            return false;
        } else if (classes[item] === 'group_block') {
            addElement(item, {
                'top': 0,
                'left': 0
            });

            return false;
        }

        return true;
    });

    let c = filtered.length;
    let a = 2 * Math.PI / c;

    for (var i in filtered) {
        var staticElement = inArray(filtered[i], statics);

        if (!staticElement || (staticElement && !inArray(filtered[i], opened))) {
            top = Math.floor((c - 1) * radius * Math.sin(start_angle + i * a));
            left = Math.floor((c - 1) * radius * Math.cos(start_angle + i * a));
            // do not put elements behind screen edges
            if (place.left + left < 0)
                left = left - (place.left + left);
            if (place.left + left > $(window).width() - 30)
                left = $(window).width() - place.left - 30;
            if (place.top + top < $('#tools').position().top + $('#tools').height())
                top = top - (place.top + top) + $('#tools').position().top + $('#tools').height();
            top < 0 ? top = "-=" + (-top) + "px" : top = "+=" + top + "px";
            left < 0 ? left = "-=" + (-left) + "px" : left = "+=" + left + "px";
            e = addElement(filtered[i], {
                "top": y,
                "left": x
            });
            var anim = {
                top: top,
                left: left
            };
            if (!$.browser.msie) {
                e.css('opacity', '0');
                anim.opacity = 1;
            }
            e.animate(anim, 600);
        }
    }
}

if (wrongs.length > 0) {
    errMsg('В этом моде не удастся открыть все элементы, потому что некоторые из них невозможно получить: ' + wrongs.join(","));
}
