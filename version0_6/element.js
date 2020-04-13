function addElement(name, place, no_discover) {
  if (classes[name] === 'group_block') {
    allElements[name].onBoard = true;
    allElements[name].opened = true;

    return;
  }

  let cleanName = clearName(name);
  let outputName = getOutputName(name);
  let elem = document.createElement('div');

  elem.className = `element ${classes[name]}`;
  elem.setAttribute('name', name);

  if (allCounters[name])
    elem.innerHTML = writeCounterValue(name);
  else
    elem.innerHTML = `<span class="elem-text">${cleanName}</span>`;

  if (!allElements[name].hasReaction)
    elem.classList.add('final');

  if (statics.includes(name))
    elem.classList.add('static');

  if (allCounters[name])
    elem.title = outputName.replace(customOutputRegex, allCounters[name].value);
  else
    elem.title = outputName;

  $(elem).data('image', '');
  $(elem).data('elementName', name);

  textOrImage(elem, name);

  board.appendChild(elem);

  if (!no_discover)
    discoverElement(name);

  if (allCounters[name])
    updateCounter(name);

  allElements[name].onBoard = true;
  allElements[name].opened = true;

  if (place) {
    elem.style.transform =
      `translateX(${place.left}px) translateY(${place.top}px)`;
  }

  $(elem).bind("dblclick", e => {
    cloneElement($(elem));
    e.stopPropagation();
  });

  $(elem).unbind("mousedown")

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

    let elem = addElement(item, {
      'top': y,
      'left': x
    });

    let animation = {
      top: y + top,
      left: x + left
    }

    if (!$.browser.msie) {
      $(elem).css('opacity', 0);
    }

    changePos(elem, animation, {
      opacity: 1
    });
  });
}

function changePos(elem, pos, animations = {}) {
  anime({
    targets: elem,
    duration: 600,
    easing: "easeInOutSine",
    translateX: pos.left,
    translateY: pos.top,
    ...animations
  });
}

function deleteElements(value) {
  if (!value || value.length === 0)
    return;

  value.forEach(item => {
    let name = item.getAttribute('name');

    if (statics.includes(name))
      return;

    let hasElem;

    for (let elem of board.childNodes.values()) {
      if (elem === item) {
        hasElem = true;
        break;
      }
    }

    if (!hasElem)
      return;

    item.classList.add('deleted');

    allElements[name].onBoard = false;

    anime({
      targets: item,
      easing: "easeInOutSine",
      duration: 1000,
      opacity: 0
    }).finished.then(() => board.removeChild(item));
  });
}

function deleteGroupBlock(value) {
  let isGroupBlock = classes[value].split(' ').some(item => item === 'group_block');

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
  anime({
    targets: elem,
    keyframes: [
      { 'opacity': 0 },
      { 'opacity': 1 },
      { 'opacity': 0 },
      { 'opacity': 1 },
      { 'opacity': 0 },
      { 'opacity': 1 },
      { 'opacity': 0 },
      { 'opacity': 1 },
    ],
    easing: 'linear',
    duration: 1000
  });
}

function clearName(value) {
  if (!value)
    return;

  return value.replace(/\[.+\]$/, '');
}

function getOutputName(value) {
  if (!value)
    return;

  let cleanName;

  if (settings.output[value]) {
    cleanName = settings.output[value];
  } else if (value.match(/.+\[.+\]/)) {
    cleanName = value.replace(/\[.+\]$/, '');
  }

  if (!cleanName)
    cleanName = value;

  return cleanName;
}

function discoverElement(elem, verbose) {
  let counter = elem.match(matchCounter);
  let name;

  if (counter) {
    name = counter[1];
  } else {
    name = elem;
  }

  if (inArray(name, opened)) return;

  opened.push(name);

  if (verbose === undefined || verbose === true) {
    message(name, "highlight");
  }

  if (settings["stack"]) {
    if (!inArray(name, statics)) addToStack(name);

    if (opened.length === 50) {
      infoMsg(
        'Вы открыли довольно много элементов и, возможно, они уже не помещаются у вас на экране или создают неудобства. Попробуйте включить сортировку по группам нажав <a href="#" onclick="toggleSort(\'group\')">здесь</a> или как показано на рисунке: <br><img src="/img/help/groups.PNG"/>'
      );
    }
  }

  $("#save").show();
  refreshStat();
}

function cloneElement(elem) {
  if (!settings.clone) return;

  let name = elem.data("elementName");
  let pos = elem.offset();

  if (counters[name]) return;

  placeElements([name, name], pos);
  destroyElement(elem);
}
