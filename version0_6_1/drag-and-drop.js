interact('#board .element:not(.deleted)').draggable({
  listeners: {
    start(event) {
      anime.remove(event.target);
      event.target.style.opacity = 1;
    },
    move(event) {
      event.target.style.transform = `translateX(${event.rect.left}px) translateY(${event.rect.top}px)`;
    }
  }
}).dropzone({
  accept: '.element:not(.deleted)',
  ondrop: onDrop
}).on("down", function (event) {
  let elem = event.currentTarget;
  let name = elem.getAttribute('name');
  $(elem).topZIndex();
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
