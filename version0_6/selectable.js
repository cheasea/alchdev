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
      item.className += ' deleted';

    let pos = {
      x: item.offsetLeft,
      y: item.offsetTop
    };

    x += pos.x;
    y += pos.y;
    reagents.push(name);
  });

  result = react(reagents);

  if (!result) {
    selected.forEach(item => {
      item.className = item.className.replace(/\sdeleted/, '');
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

  selected.forEach(item => {
    item
  });

  x = Math.floor(x / selected.length);
  y = Math.floor(y / selected.length);

  $(selected).animate({
    'left': x,
    'top': y,
  }, 500, () => {
    deleteElements(selected);
  });

  placeElements(result, {
    'left': x,
    'top': y,
  });

  refreshHint();
}
