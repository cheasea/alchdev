const selection = new Selection({
  class: 'ui-selectable-helper',
  frame: document,
  startThreshold: 0,
  tapMode: 'touch',
  selectables: ['.element'],
  startareas: ['body'],
  boundaries: ['body'],
  selectionAreaContainer: 'body'
});

selection.on('beforestart', evt => {
  return !evt.oe.path.some(item => {
    if (item.classList)
      return item.classList.contains('element')
  });
}).on('move', evt => {
  let added = evt.changed.added;
  let removed = evt.changed.removed;

  if (added.length > 0) {
    added.forEach(item => {
      item.className += ' selected';
    });
  }

  if (removed.length > 0) {
    removed.forEach(item => {
      item.className = item.className.replace(' selected', '');
    });
  }
}).on('stop', evt => {
  let selected = evt.selected;

  if (selected.length > 0) {
    selected.forEach(item => {
      item.className = item.className.replace(' selected', '');
    });

    onSelectStop(selected);
  }
});
