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

        this.html = []; // div элементов в поле
    }

    add(x, y) {
        let elem = document.createElement('div');

        /* CSS-properties */
        elem.style.transition = 'opacity 1s, translate 1s';
        elem.style.opacity = 0;
        elem.style.borderRadius = '10px';

        /* Custom properties */
        elem.style.position = 'abstract';
        elem.style.top = `${y}px`
        elem.style.left = `${x}px`;

        elem.classList = 'element ' + this.class;
        elem.innerHTML = this.name;

        elem.setAttribute('name', this.name);
        this.html.push(elem);

        board.appendChild(elem);

        $(elem).draggable({
            scroll: false,
            start: function() {
                $(this).stop();
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

    move(to) {
        let elem = this.html[0];

        if (!elem) return;

        elem.style.transition = 'opacity 1s, top 1s, left 1s';

        elem.addEventListener('transitionend', function() {
            elem.style.transition = 'opacity 1s';
        });

        elem.style.top = `${to.y}px`;
        elem.style.left = `${to.x}px`;
    }
}