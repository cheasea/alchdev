interact('#board .element:not(.deleted)').draggable({
  listeners: {
    move(event) {
      anime({
        targets: event.target,
        translateX: `+=${event.dx}`,
        translateY: `+=${event.dy}`,
        duration: 0
      });
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