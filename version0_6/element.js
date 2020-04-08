function addElement(name, place, no_discover) {
  if (classes[name] === 'group_block') {
    allElements[name].onBoard = true;
    allElements[name].opened = true;

    return;
  }

  let cleanName = getOutputName(name);
  let elem = document.createElement('div');

  elem.className = `element ${classes[name]}`;

  if (!allElements[name].hasReaction)
    elem.className += ' final';

  if (statics.includes(name))
    elem.className += ' static';

  elem.setAttribute('name', cleanName)
  elem.innerText = cleanName;
  elem.title = cleanName;

  $(elem).data('image', '');
  $(elem).data('elementName', name);

  textOrImage($(elem), name);

  board.appendChild(elem);

  if (!no_discover)
    discoverElement(name);

  if (allCounters[name])
    updateCounter(name);

  allElements[name].onBoard = true;
  allElements[name].opened = true;

  if (place) {
    $(elem).animate({
      'top': place.top,
      'left': place.left + $(window).scrollLeft()
    }, 0);
  }

  $(elem).bind("dblclick", e => {
    cloneElement($(elem));
    e.stopPropagation();
  });

  $(elem).bind("mousedown", e => {
    $(elem).topZIndex();
    $('#info').html('');
    message(name, 'highlight');
    e.preventDefault();
  });

  if (!$.browser.msie) {
    $(elem).corner();
  }

  $(elem).topZIndex();

  return elem;
}

function placeElements(names, place, firstPush) {
  if (!names) return;

  let x = place.left;
  let y = place.top;

  let r = 20;
  let top, left;
  let start_angle = Math.random() * 2 * Math.PI;

  let filtered = names.filter((item) => {
    let elem = document.querySelector(`#board .element[name="${item}"]:not(.deleted)`);

    if (allCounters[elem] && elem) {
      return false;
    }

    let isGroupBlock;

    if (classes[item])
      isGroupBlock = /\s?group_block/.test(classes[item]);

    if (isGroupBlock) {
      allElements[item].onBoard = true;
      allElements[item].opened = true;

      return false;
    }
    return true;
  });

  let c = filtered.length;
  let a = (2 * Math.PI) / c;

  filtered.forEach((item, index) => {
    let staticElem = statics.includes(item);
    let isOpened;

    if (allElements[item])
      isOpened = allElements[item].opened;

    if (staticElem && isOpened) {
      return;
    }

    top = Math.floor((c - 1) * r * Math.sin(start_angle + index * a));
    left = Math.floor((c - 1) * r * Math.cos(start_angle + index * a));

    if (place.left + left < 0)
      left = place.left;
    if (place.left + left > $(window).width() - 30)
      left = $(window).width() - place.left - 30;
    if (place.top + top < $("#tools").position().top + $("#tools").height()) {
      top = place.top + $('#tools').position().top + $('#tools').height();
    }

    top < 0 ? (top = "-=" + -top + "px") : (top = "+=" + top + "px");
    left < 0 ? (left = "-=" + -left + "px") : (left = "+=" + left + "px");

    let elem = addElement(item, {
      'top': y,
      'left': x
    });

    let animation = {
      top: top,
      left: left
    }

    if (!$.browser.msie) {
      $(elem).css('opacity', 0);
      animation.opacity = 1;
    }

    $(elem).animate(animation, 600);
  });
}

function deleteElements(value) {
  if (!value || value.length === 0)
    return;

  value.forEach(item => {
    let name = item.getAttribute('name');

    if (statics.includes(name))
      return;

    item.className += ' deleted';

    if (allElements[name]) {
      allElements[name].onBoard = false;
    }

    $(item).draggable('disable');
    $(item).fadeOut(1000, () => {
      $(item).remove();
    });
  });
}

function deleteGroupBlock(value) {
  let isGroupBlock = /\s?group_block/.test(classes[value]);

  if (isGroupBlock) {
    allElements[value].onBoard = false;
  }
}

function setElements(type) {
  let errors = [];

  countElements(inits);

  for (let r in reactions) {
    countElements(reactions[r]);

    let reagents = r.split('+');

    reagents.forEach(item => {
      if (item[0] === '-')
        return;

      removeFromArray(item, finals, false);

      if (item === '')
        return;

      if (!allElements[item].canCollected)
        errors.push(item);
    });
  }

  if (!type || type === 'unstyled') {
    update_dictionary(allElements, finals);

    let unstyled = [];

    for (let item in allElements) {
      if (item[0] !== '-' && !classes[item])
        unstyled.push(item)
    }

    return unstyled;
  }

  if (type === 'finals') return finals;
  if (type === 'wrongs') return wrongs;

  let result = {
    unstyled: unstyled,
    wrongs: errors,
    finals: finals
  };

  return result;
}

function countElement(name) {
  let counter = name.match(/set (.+) (.+$)/);

  if (name[0] === "-") return;

  if (counter)
    return;

  name = Conditions.remove(name);

  if (allElements[name]) {
    return;
  }

  allElements[name] = {
    canCollected: true
  };
}

function pulsate(elem) {
  if ($(elem).data('pulsating'))
    return;

  $(elem).data('pulsating', true);
  $(elem).effect('pulsate', {
    'times': 4,
  }, 250, function () {
    $(this).data('pulsating', false);
  });
}

function getOutputName(value) {
  if (!value)
    return;

  let cleanName;

  if (settings.output[value]) {
    cleanName = settings.output[name];
  } else if (name.match(/.+\[.+\]/)) {
    cleanName = value.replace(/\[.+\]$/, '');
  }

  if (!cleanName)
    cleanName = value;

  return cleanName;
}
