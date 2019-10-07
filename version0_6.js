/* TODO:
 * (крестик - не выполнено)
 * === класс Element ===
 * - (x) конструктор счётчика
 * -- имя (учитывать одноимённые)
 * -- (x) добавление картинки на элемент
 * -- (x) создание элемента (div)
 * --- (x) droppable
 * --- (x) draggable
 * - (x) добавление и удаление элемента на поле
 * - (x) передвижение счётчика в определённое место (с анимациями удаления или появления)
 * - (x) клонирование элемента
 */


let board = document.getElementById('board');
let allElements = {};
let allReactions = {};

class Element {
    constructor(str) {
        this.name = str; // название, к которому обращаются
        this.cleanName = name.replace(/\[.+\]$/, ''); // название, которое видит пользователь

        this.class = classes[this.name] || '';
        
        if (settings.images) {
            this.image = labels[this.name];
        }

        this.html = [];
    }

    add(x, y) {
        let elem = document.createElement('div');

        /* CSS-properties */
        elem.style.transition = 'opacity 1s, translate 1s';
        elem.style.opacity = 0;
        elem.style.borderRadius = '10px';
        elem.style.zIndex = '1';

        /* Custom properties */
        elem.style.position = 'abstract';
        elem.style.top = `${y}px`
        elem.style.left = `${x}px`;

        elem.classList = 'element ' + this.class;

        if (this.image) {
            let img = document.createElement('img');

            img.src = MEDIA_URL + this.image;

            elem.appendChild(img);
            elem.classList += ' element-icon img-element';
        } else {
            elem.innerHTML = this.name;
        }

        $(elem).data('elementName', name);
        this.html.push(elem);

        board.appendChild(elem);

        $(elem).draggable({
            scroll: false,
            start: function() {
                let value = $('.element').length + 1;

                $(this).stop();
                $(this).css('z-index', value);
                $(this)[0].style.transition = 'opacity 1s';
            }
        });

        $(elem).droppable({
            accept: '.element:not(:data(isDead, 1))',
            drop: onDrop
        });

        elem.style.opacity = 1;
    }

    delete() {
        let elem = this.html[0];

        if (!elem) return;

        deleteElement(elem);
    }

    move(to) {
        let elem = this.html[0];

        if (!elem) return;

        elem.style.transition = 'opacity 1s, top 1s, left 1s';

        elem.addEventListener('transitionend', function () {
            elem.style.transition = 'opacity 1s';
        });

        elem.style.top = `${to.y}px`;
        elem.style.left = `${to.x}px`;
    }
}

class Reaction {
    constructor(reagents, products) {
        this.reagents = reagents.split('+');
        this.result = products;
    }

    run(pos) {
        this.result.forEach(item => {
            allElements[item].add(pos);
        });
    }
}

for (let elem of inits) {
    countElements(elem);
}

for (let r in reactions) {
    allReactions[r] = new Reaction(r, reactions[r]);

    reactions[r].forEach(elem => {
        countElements(elem);
    });

    r.split('+').forEach(elem => {
        countElements(elem);
        allElements[elem].hasReaction = true;
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
            allElements[counter[1]] = new Element(item);
        }

        let [min, max] = [counter[5], counter[9]];

        if (min) {
            min.split(',').forEach(item => {
                if (allElements[item]) return;

                allElements[item] = new Element(item);
            });
        }

        if (max) {
            max.split(',').forEach(item => {
                if (allElements[item]) return;

                allElements[item] = new Element(item);
            });
        }
    } else {
        if (allElements[name]) return;

        allElements[name] = new Element(name);
    }
}

function deleteElement(html) {
    let elem;

    if (html[0]) {
        elem = html[0];
    } else {
        elem = html;
    }

    $(elem).draggable('disable');
    $(elem).droppable('disable');
    $(elem).data('isDead', 1);

    elem.addEventListener('transitionend', function() {
        elem.remove();
    });

    elem.style.opacity = 0;
}

function onDrop(event, ui) {
    let isReady = ui.helper.data('isDead') !== 1 && $(this).data('isDead') !== 1;

    if (!isReady) {
        return;
    }

    let reagents = [ui.helper.data('elementName'), $(this).data('elementName')];
    let reaction = allReactions[reagents.join('+')];

    if (!reaction) {
        return;
    }

    let pos = $(this).offset();

    /* Reaction */
    deleteElement($(this));
    deleteElement(ui.helper);
    reaction.run(pos);

    refreshHint();
    updateCounters();
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

    result = allReactions[reagents].result;

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
        deleteElement(elem);
    });

    allReactions[result].run({
        x: x,
        y: y
    });

    refreshHint();
    updateCounters();
}
