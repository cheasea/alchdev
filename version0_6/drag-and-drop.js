interact('.element').draggable({
  listeners: {
    move (event) {
      let x = +event.target.getAttribute('x');
      let y = +event.target.getAttribute('y');

      let newPosition = {
        x: x + event.dx,
        y: y + event.dy
      };

      event.target.style.transform =
        `translate(${newPosition.x}px, ${newPosition.y}px)`;

      event.target.setAttribute('x', newPosition.x);
      event.target.setAttribute('y', newPosition.y);
    }
  }
});

interact('.element').dropzone({
  accept: '.element:not(.deleted)',
  overlap: 0.25,
  ondrop: function(event) {
    let firstElement = event.target;
    let secondElement = event.relatedTarget;

    onDrop(firstElement, secondElement);
  }
});

function onDrop(firstElem, secondElem) {
  let reagents = [firstElem.getAttribute('name'), secondElem.getAttribute('name')];
  let result = react(reagents);

  if (!result)
    return;

  let translate = firstElem.style.transform.match(/translate\((\d+)px, (\d+)px\)/);
  let pos = {
    x: translate[1],
    y: translate[2]
  };

  deleteElements([firstElem, secondElem]);

  /* Reaction */
  placeElements(result, pos);

  refreshHint();
}
