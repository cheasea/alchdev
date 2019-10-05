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

class Element {
    constructor(str) {
        this.name = str; // название, к которому обращаются
        this.cleanName = name.replace(/\[.+\]$/, ''); // название, которое видит пользователь

        this.class = classes[this.name];
        
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

        elem.setAttribute('name', this.name);
        this.html.push(elem);

        board.appendChild(elem);

        $(elem).draggable({
            scroll: false,
            start: function () {
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

        $(elem).draggable('disable');
        $(elem).droppable('disable');
        $(elem).data('isDead', 1);

        elem.addEventListener('transitionend', function () {
            elem.remove();
        });

        elem.style.opacity = 0;
    }

    // to это объект со свойствами x и y - координаты, куда нужно передвинуть элемент
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
    constructor (reagents, products) {
        this.reagents = reagents.split("+");
        this.products;
    }
}

let reactionList = [];
let elementList = [];

for (r in reactions) reactionObjects.push(Reaction(r, reactions[r]));
for (r in reactions) reactionObjects.push(Reaction(r, reactions[r]));