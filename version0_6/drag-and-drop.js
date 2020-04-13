interact('#board .element:not(.deleted)').draggable({
  listeners: {
    start(event) {
      anime.remove(event.target);
      event.target.style.opacity = 1;
    },
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
}).on("down", function (event) {
  let name = event.target.getAttribute('name');
  $(event.target).topZIndex();
  $('#info').html('');
  message(name, 'highlight');
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
