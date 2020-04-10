const selection = new Selection({
  class: 'ui-selectable-helper',
  frame: document,
  startThreshold: 0,
  tapMode: 'touch',
  selectables: ['#board .element:not(.deleted)'],
  startareas: ['body'],
  boundaries: ['body'],
  selectionAreaContainer: 'body',
});

selection
  .on('beforestart', (evt) => {
    $('#info').html('');

    return !evt.oe.composedPath().some((item) => {
      if (item.classList) return item.classList.contains('element');
    });
  })
  .on('move', (evt) => {
    let added = evt.changed.added;
    let removed = evt.changed.removed;

    if (added.length > 0) {
      added.forEach((item) => {
        item.className += ' selected';
      });
    }

    if (removed.length > 0) {
      removed.forEach((item) => {
        item.className = item.className.replace(' selected', '');
      });
    }
  })
  .on('stop', (evt) => {
    let selected = evt.selected;

    if (selected.length > 0) {
      selected.forEach((item) => {
        item.className = item.className.replace(' selected', '');
      });

      onSelectStop(selected);
    }
  });

function onSelectStop(selected) {
  let reagents = [];
  let x = 0;
  let y = 0;

  selected.forEach(item => {
    let name = item.getAttribute('name');

    if (!statics.includes(name))
      item.classList.add('deleted');

    let rect = item.getBoundingClientRect();

    let pos = {
      x: rect.left,
      y: rect.top
    };

    x += pos.x;
    y += pos.y;
    reagents.push(name);
  });

  result = react(reagents);

  if (!result) {
    selected.forEach(item => {
      item.classList.remove('deleted');
    });

    return;
  }

  let hasCounter;

  if (reactions[reagents.sort().join("+")]) {
    let counter = reactions[reagents.sort().join("+")].find((item) => {
      return item.match(/set .+ .+$/);
    });

    if (counter) hasCounter = true;
  }

  x = Math.floor(x / selected.length);
  y = Math.floor(y / selected.length);

  anime({
    targets: selected,
    translateX: x,
    translateY: y,
    easing: "easeInOutSine",
    duration: 400
  });

  deleteElements(selected);

  placeElements(result, {
    'left': x,
    'top': y,
  });

  refreshHint();
}