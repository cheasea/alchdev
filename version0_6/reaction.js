function react(r) {
  let reagents = r.sort().join('+');

  if (!reactions[reagents]) {
    logReaction(false, reagents);
    return;
  }

  let result = reactions[reagents];

  result = filterElements(result, {reagents: r});

  if (!reactions[reagents] && messages[reagents]) {
    message(reagents, 'highlight');
  }

  if (result)
    logReaction(result.join(', '), reagents);

  if (messages[reagents]) 
    message(reagents, 'highlight');

  return result;
}

function processCounter(counterString) {
  let counterParsed = parseCounter(counterString);

  let operation = counterParsed.operation,
      value     = counterParsed.value;
      name      = counterParsed.name;
      min       = counterParsed.min;
      max       = counterParsed.max;
      at        = counterParsed.at;

  if (!allElements[name]) {
    allElements[name] = {};
  }

  if (!allCounters[name]) {
    allCounters[name] = {
      min: {},
      max: {},
      at: {},
    };
  }

  if (min) {
    if (min.value) allCounters[name].min.value = min.value;
    if (min.result) {
      allCounters[name].min.result = min.result;
      min.result.forEach((item) => {
        let cleanName = getCleanName(item);

        countElement(cleanName);
        if (allElements[cleanName])
          allElements[cleanName].canCollected = true;
      });
    }
  }

  if (max) {
    if (max.value) allCounters[name].max.value = max.value;
    if (max.result) {
      allCounters[name].max.result = max.result;
      max.result.forEach((item) => {
        let cleanName = getCleanName(item);

        countElement(cleanName);
        if (allElements[cleanName])
          allElements[cleanName].canCollected = true;
      });
    }
  }

  if (at) {
    for (let atValue in at) {
      at[atValue].forEach((item) => {
        let cleanName = getCleanName(item);

        countElement(cleanName);
        if (allElements[cleanName])
          allElements[cleanName].canCollected = true;
      });

      allCounters[name].at[atValue] = at[atValue];
    }
  }

  if (allCounters[name].value === undefined)
    allCounters[name].value = 0;

  if (value === undefined) 
    value = 0;

  if (!operation)
    operation = '=';

  let elements = document.querySelectorAll(`#board .element[name="${name}"]`);

  if (value !== undefined) {
    let getValue = +allCounters[name].value;
    let length = String(value).length - 2;
    let newValue;
    if (length < 0) length = 0;

    switch (operation) {
      case "=":
        newValue = (+value).toFixed(length);
        break;
      case "+":
        newValue = computeExpression(`${getValue} + ${+value}`);
        break;
      case "-":
        newValue = computeExpression(`${getValue} - ${+value}`);
        break;
      case "*":
        newValue = computeExpression(`${getValue} * ${+value}`);
        break;
      case "/":
        newValue = computeExpression(`${getValue} / ${+value}`);
        break;
      case "%":
        newValue = computeExpression(`${getValue} % ${+value}`);
        break;
      case "^":
        newValue = computeExpression(`${getValue} ^ ${+value}`);
        break;
    }

    let counterChecked = checkCounterValue(name, +newValue);

    if (elements && counterChecked)
      pulsate(elements);

    let counterSettings = {
      result: counterChecked,
      name: name
    };

    return counterSettings;
  }
}

function processNegativeElem(value) {
  let toDelete;

  if (value === '---') {
    toDelete = document.querySelectorAll('#board .element');

    return toDelete;
  }

  let isClearClasses = value.match(/---(.+)/);

  if (isClearClasses) {
    if (isClearClasses[0].length !== value.length)
      return;

    let elemClass;
    let classExists;

    for (elemClass in classes_strings) {
      if (elemClass === isClearClasses[1]) {
        classExists = true;
        break;
      }
    }

    if (classExists) {
      toDelete = document.querySelectorAll(`#board .element[name="${isClearClasses[1]}"]`);

      deleteGroupBlock(isClearClasses[1]);
    } else {
      toDelete = document.querySelectorAll(`#board .element .${elemClass}`);
    }

    return toDelete;
  }

  let isRequiredElem = value.match(/--(.+)/);

  if (isRequiredElem) {
    if (isRequiredElem[0].length !== value.length)
      return;
    
    toDelete = document.querySelectorAll(`#board .element[name="${isRequiredElem[1]}"]`);

    if (!toDelete) {
      logReaction(`Для этой реакции необходимо, чтобы на поле присутствовал ещё ${name}`, reagents);
      return;
    }

    deleteGroupBlock(isRequiredElem[1]);

    return toDelete;
  }

  let isNegativeElem = value.match(/-(.+)/);

  if (isNegativeElem) {
    if (isNegativeElem[0].length !== value.length)
      return;
    
    toDelete = document.querySelectorAll(`#board .element[name="${isNegativeElem[1]}"]`);

    deleteGroupBlock(isNegativeElem[1]);

    return toDelete;
  }

  let isOpenedElem = value.match(/-\?(.+)/);

  if (isOpenedElem) {
    if (isOpenedElem[0].length !== value.length)
      return;
    
    if (!allElements[isOpenedElem[1]].opened) {
      logReaction(`Эта реакция будет работать, если открыть ${isOpenedElem[1]}`, reagents);
      return;
    }
  }
}

function filterElements(array, settings = {reagents: []}) {
  let result = [];

  for (let elem in array) {
    let name = Conditions.parse(array[elem]);

    if (!name) continue;

    let isCounter = /^set (.+$)/.test(name);

    if (isCounter) {
      let counterChecked = processCounter(name);

      if (!counterChecked || !counterChecked.result) {
        return;
      }

      result = result.concat(counterChecked.result);
      name = counterChecked.name;

      if (allElements[name] && !allElements[name].onBoard) {
        if (!result.includes(name))
          result.push(name);
      }
    } else if (name[0] === '-') {
      let toDelete = processNegativeElem(name);
      deleteElements(toDelete);
    } else {
      result.push(name);

      if (!settings['reagents'].includes(name)) {
        let reagents = settings['reagents'].sort().join('+');
        update_recipes(name, reagents);
      }
    }
  }

  return result;
}

function checkCounterValue(name, value) {
  let min    = allCounters[name].min;
  let max    = allCounters[name].max;
  let at     = allCounters[name].at;
  let result = [];

  if (min.value !== undefined && value < min.value) {
    if (min.result === undefined) {
      logReaction(`Эта реакция невозможна, т.к. ${name} не может быть меньше ${min.value}`);
      return 0;
    } else {
      allCounters[name].value = min.value;

      if (min.result.length > 0) {
        let minResult = filterElements(min.result);
        result = result.concat(minResult);
      }

      if (at[min.value]) {
        let atResult = filterElements(at[min.value]);
        result = result.concat(atResult);
      }

      return result;
    }
  }

  if (max.value !== undefined && value > max.value) {
    if (!max.result || max.result.length === 0) {
      logReaction(`Эта реакция невозможна, т.к. ${name} не может быть больше ${max.value}`);
      return 0;
    } else {
      allCounters[name].value = max.value;

      if (max.result.length > 0) {
        let maxResult = filterElements(max.result);
        result = result.concat(maxResult);
      }

      if (at[max.value]) {
        let atResult = filterElements(at[max.value]);
        result = result.concat(atResult);
      }

      return result;
    }
  }

  if (at[value]) {
    let atResult = filterElements(at[value]);
    result = result.concat(atResult);
  }

  allCounters[name].value = value;
  updateCounter(name);

  return result;
}

function logReaction(result = 'Нет реакции', reagents) {
  if (!settings.reaction)
    return;

  $('#info').html('');
  
  if (reagents)
    $('#info').text(`${reagents} = ${result}`);
  else 
    $('#info').text(`${result}`);

	$('#info').append('<br>');
}
