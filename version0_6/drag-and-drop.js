interact('#board .element').draggable({
  listeners: {
    move(event) {
      let stackOffset = document.querySelector("#stack").getBoundingClientRect().top;

      let newPosition = {
        x: event.rect.left + event.dx,
        y: event.rect.top + event.dy + stackOffset
      };

      event.target.style.transform =
        `translate(${newPosition.x}px, ${newPosition.y}px)`;
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