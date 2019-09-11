$('#err_msg').dialog('close');

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
                var counterParsed = resultsTemp[i].match(matchCounter)
                if (counterParsed && counterParsed[1] != undefined) {
                    var counter = {
                        "name": counterParsed[1],
                        "min": counterParsed[3],
                        "max": counterParsed[7],
                        "minResult": counterParsed[5],
                        "maxResult": counterParsed[9],
                        "value": counterParsed[10]
                    }
                    var data = counters[counter.name]
                    if (!data) {
                        data = {}
                        data.name = counter.name
                        data.value = 0
                        if (data.value < data.min) data.value = data.min
                        if (data.value > data.max) data.value = data.max
                        counters[counter.name] = data
                    }

                    if (counter.min !== undefined) data.min = counter.min
                    if (counter.max !== undefined) data.max = counter.max
                    if (counter.minResult !== undefined) data.minResult = counter.minResult
                    if (counter.maxResult !== undefined) data.maxResult = counter.maxResult

                    if (counter.value !== undefined) {
                        var e = $('#board .element:data(elementName,"' + data.name + '")')
                        switch (counter.value.toString().charAt(0)) {
                            case "+":
                                data.value += parseInt(counter.value.substr(1))
                                break;
                            case "-":
                                data.value -= parseInt(counter.value.substr(1))
                                break;
                            case "=":
                                data.value = parseInt(counter.value.substr(1))
                                break;
                        }
                        e.effect('pulsate', {
                            "times": 4
                        }, 250);
                    }

                    var elem = $('#board .element:data(elementName,"' + data.name + '")')[0];

                    if (!elem || !elem.classList.contains('group_block')) {
                        resultsTemp.push(data.name)
                    }

                    if (data.value < data.min) {
                        if (data.minResult !== undefined) {
                            if (data.minResult != '') {
                                var boundResults = data.minResult.split(",")
                                for (var k in boundResults) {
                                    resultsTemp.push(boundResults[k])
                                }
                            }
                            data.value = data.min
                        } else {
                            data.value += parseInt(counter.value.substr(1))
                            logReaction('Эта реакция невозможна, т.к. ' + data.name + ' не может быть меньше ' + data.min, reagents);
                            return 0
                        }

                    }

                    if (data.value > data.max) {
                        if (data.maxResult !== undefined) {
                            if (data.maxResult != '') {
                                var boundResults = data.maxResult.split(",")
                                for (var k in boundResults) {
                                    resultsTemp.push(boundResults[k])
                                }
                            }
                            data.value = data.max
                        } else {
                            data.value -= parseInt(counter.value.substr(1))
                            logReaction('Эта реакция невозможна, т.к. ' + data.name + ' не может быть больше ' + data.max, reagents);
                            return 0
                        }

                    }
                    // END processing counters
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
                                var l
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
                        var e = $('#board .element:data(elementName,"' + name + '")').not('.ui-selected').not(':data(toKill,1)').not(':data(maybeKill,1)').first();
                        e.data('maybeKill', '1');
                    }
                } else {
                    if (!classes[name] || !classes[name].match('group_block')) {
                        results.push(name);
                    } else {
                        addElement(name, {
                            x: 0,
                            y: 0
                        });
                    }
                    if (!inArray(name, r)) {
                        var reaction = reagents; //+' = '+reactions[reagents].join(', ');
                        update_recipes(name, reaction);
                    }
                }
            }
        }
        //start reaction

        destroyElement($('#board :data(toKill,1)'));
        destroyElement($('#board :data(maybeKill,1)'));
        if (!b) logReaction(results.join(', '), reagents);
        message(reagents, 'highlight');
        return results;
    } else {
        logReaction(false, reagents);
        message(reagents, 'highlight');
        return 0;
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
    var elements = []; //inits.slice();
    var cleanName;
    for (var i in inits) {
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
            cleanName = clearName(reactions[i][j])
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
                removeFromArray(leftsiders[j], finals, true);
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
        destroyElement($('#board').children('.element'), false);
        if (finals.length == 0) {
            $("#vote_stats").hide();
            $("#vote_result").hide();
            $("#abyss").droppable({
                drop: function (e, ui) {
                    q
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
            toggleSort($('#order').val());

            sortKeys(reactions);
            var test1 = test();
            var total = test1.total;
            finals = test1.finals;
            wrongs = test1.wrongs;
            element_count = total.length;
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

if (wrongs.length > 0) {
    errMsg('В этом моде не удастся открыть все элементы, потому что некоторые из них невозможно получить.');
}