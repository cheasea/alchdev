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
  ondrop: onDrop
}).styleCursor(false);

interact('#abyss').dropzone({
  accept: '.element:not(.deleted)',
  ondrop: function (event) {
    deleteElements([event.relatedTarget]);
  }
});

function onDrop(event) {
  let firstElem = event.target,
    secondElem = event.relatedTarget;
  let reagents = [firstElem.getAttribute('name'), secondElem.getAttribute('name')];
  let result = react(reagents);

  if (!result)
    return;

  let rect = firstElem.getBoundingClientRect();
  let pos = {
    left: rect.left,
    top: rect.top
  };

  deleteElements([firstElem, secondElem]);

  /* Reaction */
  placeElements(result, pos);

  refreshHint();
}
