interact('#board .element:not(.deleted)').draggable({
  listeners: {
    start(event) {
      event.target.className = event.target.className.replace(/\sanimated/, '');
    },
    move(event) {
      let x = +event.target.getAttribute('x');
      let y = +event.target.getAttribute('y');

      let newPosition = {
        x: x + event.dx,
        y: y + event.dy
      };

      event.target.style.transform =
        `translateX(${newPosition.x}px) translateY(${newPosition.y}px)`;

      event.target.setAttribute('x', newPosition.x);
      event.target.setAttribute('y', newPosition.y);
    }
  }
}).dropzone({
  accept: '.element:not(.deleted)',
  ondrop: function (event) {
    let firstElement = event.target;
    let secondElement = event.relatedTarget;

    onDrop(firstElement, secondElement);
  }
}).styleCursor(false);

interact('#abyss').dropzone({
  accept: '.element:not(.deleted)',
  ondrop: function (event) {
    deleteElements([event.relatedTarget]);
  }
});

function onDrop(firstElem, secondElem) {
  let reagents = [firstElem.getAttribute('name'), secondElem.getAttribute('name')];
  let result = react(reagents);

  if (!result)
    return;

  let translate = firstElem.style.transform.match(/translate\(\-?(\d+(?:\.\d+)?)px, (\-?\d+(?:\.\d+)?)px\)/);
  let pos = {
    x: translate[1],
    y: translate[2]
  };

  deleteElements([firstElem, secondElem]);

  /* Reaction */
  placeElements(result, pos);

  refreshHint();
}