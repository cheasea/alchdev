var Parser = require("expr-eval").Parser;
var parser = new Parser({
  operators: {
    logical: false,
    comparison: false,
    concatenate: false,
    conditional: false,
    "in": false,
    assignment: false,
    array: false,
    fndef: false,
  },
});
parser.functions.random = function (n) {
  return 42;
};
$("#err_msg").dialog("close");

$("#board").empty();
$("#board").prependTo($("body"))

$("#order_group").empty();
$("#order_123").empty();
$("#order_abc").empty();
var opened = [];

let allElements = {};
let allCounters = {};

if (settings.counterOutputChar)
  settings.counterOutputChar = settings.counterOutputChar.replace(
    /[.*+?^${}()|[\]\\]/g,
    "\\$&"
  );
else settings.counterOutputChar = "@";

let customOutputRegex = new RegExp(
  settings.counterOutputChar || "@",
  "g"
);

if (!settings.output) settings.output = {};

for (let elem of inits) {
  let cleanName = getCleanName(elem);

  countElement(cleanName);
  allElements[cleanName].canCollected = true;
}

for (let r in reactions) {
  reactions[r].forEach((elem) => {
    let cleanName = getCleanName(elem);

    countElement(cleanName);
    if (allElements[cleanName]) {
      allElements[cleanName].canCollected = true;
    }
  });

  r.split("+").forEach((elem) => {
    let cleanName = getCleanName(elem);

    countElement(cleanName);
    allElements[cleanName].hasReaction = true;
  });
}

function getCleanName(elem) {
  while (elem.charAt(0) === "-") {
    elem = elem.slice(1);
  }

  if (elem.match(/set (.+) (.+$)/)) {
    let counter = elem.split(" ");
    let isName = 0,
      name = [];

    counter.forEach((item) => {
      if (isName === 2) return;

      if (item === "set") {
        isName = 1;
        return;
      }

      if (item === "min" || item === "max" || item === "at") {
        isName = 2;
        return;
      }

      if (item.match(/\+|\-|\=|\*|\/|\^|\%/)) {
        isName = 2;
        return;
      }

      if (isName === 1) {
        name.push(item);
      }
    });

    elem = name.join("");
  }

  elem = Conditions.remove(elem);

  return elem;
}

// принимает значение вида {...} <остальные аргументы>
// возвращает объект с массивом результатов и индексом, когда закрываются все пары {} или -1 в случае ошибки
function processingBrackets(str) {
  if (!str) return null;
  let bracketsCounter = 0,
    lastIndex = 1,
    res = {
      result: [],
      index: -1,
    }, afterComma = false;
  for (let i = 0; i < str.length; i++) {
    let sym = str[i];
    if (afterComma) {
      if (sym == " ") {
        lastIndex = i + 1;
        continue;
      } else {
        afterComma = false;
      }
    }
    switch (sym) {
      case "{":
        bracketsCounter++;
        break;

      case "}":
        bracketsCounter--;
        break;

      case ",":
        if (bracketsCounter === 1) {
          res.result.push(str.slice(lastIndex, i));
          lastIndex = i + 1;
          afterComma = true;
        }
        break;
    }
    if (bracketsCounter <= 0) {
      res.index = i;
      let addLast = str.slice(lastIndex, i);
      if (addLast) res.result.push(addLast);
      break;
    }
  }
  return res;
}

// посчитать значение выражения
function computeExpression(str) {
  try {
    let parsed = Parser.parse(str);
    let vars = parsed.variables();
    let toEval = {},
      res,
      cleanName;
    for (let v of vars) {
      cleanName = v.replace("_", " ");
      let counterValue = getCounterValue(cleanName);

      if (counterValue === undefined) {
        errMsg(
          `Возникла ошибка при вычислении выражения "${str}": неизвестно значение счётчика "${cleanName}".
                    Помните, что в вычисляемом выражении в названии счётчиков пробелы заменяются на нижнее подчёркивание, то есть _`
        );
        return 0;
      }

      toEval[v] = +allCounters[cleanName].value;
    }
    res = Number(parsed.evaluate(toEval));
    if (isNaN(res)) throw "значение не является числом";
    return res;
  } catch (e) {
    errMsg(`Возникла ошибка при вычислении выражения "${str}": ${e}`);
    return 0;
  }
}

// let findCounterOperation = /(\+|-|=|\*|\/|%|\^)\s*(?:([+-]?(?:\d*[.])?\d+)|{(.*?)})/;
// let findCounterSetting = /((min|max|at)\s*([+-]?(?:\d*[.])?\d+)\s*)({.*})?/;
// let findCounterArgument = new RegExp(`(?:(${findCounterSetting.source})|(${findCounterOperation.source}))`);

let findCounterArg = /\s+(min|max|at|\+|-|=|\*|\/|%|\^)\s*(.*)/;
let findOperation = /(\+|-|=|\*|\/|%|\^)\s*(?:([+-]?(?:\d*[.])?\d+)|{(.*?)})/;
let findCounterSetting = /((min|max|at)\s*(?:([+-]?(?:\d*[.])?\d+)|{(.*?)})\s*)({.*})?/;

// str имеет вид set <название счётчика> <аргументы>
// <аргументы> - это min, max, at и операции изменения значения
function parseCounter(str) {
  let origStr = str;
  str = str.substr(4); // убираем set, остаётся <название счётчика> <аргументы>
  let counter = {},
    nextArgInfo = findCounterArg.exec(str);

  if (nextArgInfo && nextArgInfo.index > 0) {
    // если есть аргументы
    counter.name = str.substr(0, nextArgInfo.index); // ставим название до начала первого аргумента
    str = str.substr(nextArgInfo.index); // остаются только <аргументы>

    while (nextArgInfo) {
      // пока есть аргументы
      let counterSetting = findCounterSetting.exec(str),
        endPos;

      if (counterSetting) {
        // если это min, max или at
        endPos = counterSetting[1].length;
        let settingName = counterSetting[2],
          settingValue =
            counterSetting[3] || computeExpression(counterSetting[4]),
          settingResult = processingBrackets(counterSetting[5]);

        counter[settingName] = counter[settingName] || {};

        if (settingName === "at") {
          if (settingResult) counter.at[settingValue] = settingResult.result;
        } else {
          counter[settingName].value = settingValue;
          if (settingResult) counter[settingName].result = settingResult.result;
        }

        if (settingResult) {
          countElements(settingResult.result);
          endPos +=
            settingResult.index === -1 ?
              settingResult.length :
              settingResult.index;
        }

        str = str.substr(endPos);
      } else {
        // иначе это операция изменения значения
        let operationInfo = findOperation.exec(nextArgInfo);
        if (!operationInfo) {
          errMsg(
            `Во время анализа "${origStr}" произошла ошибка. Пожалуйста, проверьте код ещё раз.`
          );
          break;
        }

        counter.operation = operationInfo[1];

        counter.value = String(
          operationInfo[2] || computeExpression(operationInfo[3])
        );

        endPos = operationInfo[0].length;

        str = str.substr(endPos);
      }

      nextArgInfo = findCounterArg.exec(str);
    }
  } else {
    counter.name = str;
  }

  return counter;
}

function getElements(name) {
  let element = $(`#board .element:data(elementName,"${name}")`).not(
    ":data(isDead,1)"
  );

  if (element[0]) {
    return element;
  // for group blocks check .onBoard property
  } else if (allElements[name] && allElements[name].onBoard) {
    return [true];
  } else {
    return [];
  }
}

// возвращает значение счётчика, если он существует (иначе undefined)
function getCounterValue(name) {
  let counter = allCounters[name];
  if (counter === undefined) return undefined;
  else return counter.value;
}

// возвращает число или значение счётчика
function getNumber(str) {
  let number = Number(str);

  // если это не число
  if (isNaN(number)) {
    number = getCounterValue(str);

    if (number === undefined) {
      // errMsg(`Не удалось найти значение счётчика с названием "${str}"`);
      return undefined;
    }
  }

  return +number;
}

function isElementOpened(name) {
  let elem = allElements[name];
  if (elem === undefined) return false;
  else return elem.opened;
}

function countElements(elements) {
  elements.forEach((element) => {
    countElement(element);
  });
}

function textOrImage(elem, name, checkingValue = true) {
  let cleanName = name;

  if (settings.output[name])
    cleanName = settings.output[name];
  else if (name.match(/.+\[.+\]/))
    cleanName = name.replace(/\[.+\]$/, '');

  let filename;
  let counterText;

  if (labels[name])
    filename = MEDIA_URL + labels[name];

  if (checkingValue && allCounters[name])
    counterText = `${name}: ${allCounters[name].value}`;

  if (settings.images && filename) {
    let img = document.createElement('img');

    img.src = filename;
    img.classList = 'element-icon';
    img.draggable = false;

    img.addEventListener('mousedown', event => {
      event.preventDefault();
    });

    $(elem).html("");
    elem.appendChild(img);
    elem.classList.add('img-element');

    $(elem).data("image", filename);

    if (allCounters[name] && !settings.output[name])
      settings.output[name] = `(${settings.counterOutputChar})`;

    if (checkingValue && allCounters[name])
      elem.append(writeCounterValue(name, true));

    $(img).error(() => {
      let elementSpan = document.createElement("span");
      elementSpan.classList.add("elem-text");
      elementSpan.innerText = counterText || cleanName
      
      $(elem).html("");
      elem.append(elementSpan);

      elem.classList.remove('img-element');
      elem.classList.remove('img-stack-element');
      $(elem).data('image', false);
    });
  }
}

function createShortcut(name, checkingValue) {
  let elem = document.createElement('span');
  let cleanName = clearName(name);

  $(elem).data('elementName', name);
  elem.setAttribute('name', cleanName);
  elem.className = `element ${classes[name]}`;

  if (finals.includes(name))
    elem.classList.add('final');

  textOrImage(elem, name, checkingValue);

  if (elem.innerHTML === '')
    elem.append(cleanName);

  if ($(elem).data('image')) {
    elem.classList.add('img-stack-element');
    elem.classList.remove('img-element');
  } else {
    let recipe = '';

    if (recipes[name])
      recipe = recipes[name].join('; ');

    elem.title = recipe;
  }

  $(elem).draggable({
    distance: 5,
    helper: function () {
      return addElement(name, {
        top: 0,
        left: 0,
      });
    },
    stop: function (event, ui) {
      if (!ui.helper.data("isDead")) {
        addElement(name, ui.helper.offset());
        refreshHint();
      }
    },
  });

  return $(elem);
}

function addToStack(name) {
  var preHeight = $("#order_123").height();
  // discover order
  var o = createShortcut(name, false);
  o.appendTo($("#order_123"));

  // alphabetical order
  var o = createShortcut(name, false);
  var i = 0;
  var sorted = opened.slice(0).sort();
  if (sorted.length > 1) {
    while (name > sorted[i]) i++;
    if (i < 1) o.prependTo($("#order_abc"));
    else
      o.insertAfter($("#order_abc").children(".element:eq(" + (i - 1) + ")"));
  } else o.appendTo($("#order_abc"));

  // groups order

  var o = createShortcut(name, false);

  if (classes[name]) {
    if ($.isArray(classes[name]))
      var cur_class = classes[name][0].split(" ")[0];
    else var cur_class = classes[name].split(" ")[0];
  } else var cur_class = "abstract";

  if (classes[name]) var group = "_" + cur_class;
  else var group = "_no_group";
  if (
    $("#order_group")
      .children("." + group)
      .size() === 0
  ) {
    var groupBox = $("<span/>", {
      "class": group + " element " + classes[name],
      text: "[" + classes_strings[cur_class] + "]",
      style: "display:inline-block;",
    }).appendTo($("#order_group"));
    var ul = $("<div/>", {
      "class": classes[name] + " group_block",
    }).appendTo(groupBox);

    groupBox.mouseenter(function () {
      ul.show(200);
      ul.topZIndex();
    });
    groupBox.mouseleave(function () {
      ul.hide(200);
    });
    groupBox.click(function () {
      // show group-dialog - box with elements

      if (!$("#gd" + group).length) {
        $("<div/>", {
          id: "gd" + group,
          "class": "gd",
        }).dialog({
          zIndex: 0,
          stack: false,
        });
        $("#gd" + group)
          .dialog("widget")
          .topZIndex()
          .addClass("no-select");
        $("#gd" + group)
          .dialog("widget")
          .click(function () {
            $(this).topZIndex();
          });
        $("#order_group")
          .children("." + group)
          .children(".group_block")
          .children(".element")
          .each(function (index) {
            createShortcut($(this).data("elementName")).appendTo(
              $("#gd" + group)
            );
          });
      } else {
        $("#gd" + group).dialog("open");
      }
    });
  }
  if (!groupBox) var groupBox = $("#order_group").children("." + group);
  if (!ul) var ul = groupBox.children(".group_block");
  var li = ul.append(o);
  if ($("#gd" + group).length) {
    createShortcut(name).appendTo($("#gd" + group));
  }

  //and resize window after all
  var postHeight = $("#order_123").height();
  if (typeof VK != "undefined" && VK.callMethod) {
    var deltaHeight = postHeight - preHeight;
    var newHeight = $(window).height() + deltaHeight;
    VK.callMethod("resizeWindow", $(window).width(), newHeight);
  }
}

function getModId() {
  var regex = /[^\d]*(\d+)[^\d]*/gm;
  var res = regex.exec($("#load")[0].onclick.toString());
  return res[1];
}

function save(to){
  var a = $('#board').children('.element');
  var elements = [];
  $('#board').children('.element').each(function(){
      elements.push({'name':$(this).data('elementName'), 'offset':$(this).offset()});
  });
  var data = {"opened":opened, "recipes":recipes, "elements": elements, "counters":allCounters, "allElements": allElements};
  
  var success = function() {
      $('#save').fadeOut();
  };
  var error = function() {
      alert("Не удалось сохранить игру.");
  };
  
  if (use_local_storage_to_save) {
      try {
          window.localStorage[local_mod_save_key] = $.toJSON(data);
          success();
      } catch(e) {
          error();
      }
  } else {
      var saveToServer = function() {
          $.post(to,{"data": $.toJSON(data)}, function(data){
              if(data=='OK'){
                  success();
              }
              else{
                  error();
              }
          });
      };
      
      if (typeof(VK_api) != 'undefined') {
          VK_StorageSetJSON({
              key: local_mod_save_key,
              value: $.toJSON(data),
              success: success,
              error: saveToServer
          });
      } else {
          saveToServer();
      }
  }
}

function load(str){
  var load_data = function(data) {
      $('#info').html('');
      $('.element').remove();
      $('#order_123').empty();
      $('#order_abc').empty();
      $('#order_group').empty();
      $('#stack').show();
      opened = [];
      recipes ={};
      allCounters = data.counters;
      allElements = data.allElements || {};
      //recipes = data.recipes;
      $('#recipe_list').empty();
      for(var i in data.recipes){
          for(var j in data.recipes[i]){
              update_recipes(i, data.recipes[i][j]);
          }
      }
      for(var i in data.opened){
          discoverElement(data.opened[i], false);
      }
      $.each(data.elements, function(key, val){
          addElement(val.name, val.offset, true);
      });
      for (let counterName in allCounters) {
        updateCounter(counterName);
      };
      refreshStat();
  };
  var error = function() {
      log('Не удалось загрузить эту игру.');
  };
  
  var loadFromServer = function() {
      $.getJSON(str, function(data) {
          if(data){
              load_data(data);
          }else{
              error();
          }
      });
  };
  if (typeof(VK_api) != 'undefined') {
      VK_StorageGetJSON({
          key: local_mod_save_key,
          success: load_data,
          error: loadFromServer
      });
  } else if (use_local_storage_to_save) {
      var data = window.localStorage[local_mod_save_key];
      try {
          data = $.evalJSON(data);
      } catch (e) {
          data = null;
      }
      if (data) {
          load_data(data);
      } else {
          loadFromServer();
      }
  } else {
      loadFromServer();
  }
}

let isSaving = false;

$("#save a")[0].onclick = () => {
  if (isSaving) return;

  isSaving = true;
  stopGame();

  $("#save").append(
    '<span id="save_msg">(игра сохраняется<span id="loader"></span>)</span>'
  );

  let checkingAnimation = setInterval(() => {
    let count = 0;
    let animation = $(".element:animated");

    if (!animation[0]) {
      save(`/versions/${getModId()}/save/`);
      $("#save_msg").remove();

      clearInterval(checkingAnimation);
      runGame();
      isSaving = false;
    } else {
      if (count <= 3) $("#loader").append(".");
      count++;
    }
  }, 500);
};

function stopGame() {
  interactElement.draggable(false);
  interactElement.dropzone(false);
  selection.disable();
}

function runGame() {
  interactElement.draggable(true);
  interactElement.dropzone(true);
  selection.enable();
}

$("body").selectable('disable');

function updateCounter(name) {
  let elements = document.querySelectorAll(`#board .element[name="${name}"]`);

  if (elements.length === 0)
    return;

  elements.forEach(item => {
    let value = item.querySelector('.counter-value');

    if (value)
      value.innerText = allCounters[name].value;
  });
}

function getStandartCounterFormat(name) {
  // очищаем от []
  let clearedName = clearName(name);
  let outputChar = settings.counterOutputChar;
  return `${clearedName}: ${outputChar}`
}

// возвращает HTML-элемент с текстом счётчика (учитывает кастомный аутпут)
function writeCounterValue(name, isDiv) {
  // берём имя кастомного аптпута в настройках, или если его нет, то берём стандартное имя Counter: @
  let counterOutputName = settings.output[name] || getStandartCounterFormat(name);

  // разделяем строку кастомного аутпута по символу кастомного аутпута
  // пример: C@ounter: @ -> ['C', 'ounter: ', '']
  counterOutputName = counterOutputName.split(
    customOutputRegex,
  );

  // главный HTML-элемент, куда добавляются весь текст и значения счётчика
  let rootElement = document.createElement(isDiv ? "div" : "span");
  rootElement.classList.add("elem-text");

  // span со значением счётчика
  let counterValueSpan = document.createElement("span");
  counterValueSpan.classList.add("counter-value")
  counterValueSpan.innerText = allCounters[name].value;

  // теперь нам надо между каждым элементом массива добавить span со значением счётчика
  // для этого делаем цикл для всех элементов массива кроме последнего
  for (let i = 0; i < counterOutputName.length - 1; i++)
    rootElement.append(counterOutputName[i], counterValueSpan);
  // также добавить последний элемент
  rootElement.append(counterOutputName[counterOutputName.length-1])

  return rootElement;
}

function applySettings(settings) {
  $(document).unbind("dblclick");

  if (settings["add"]) {
    $(document).bind("dblclick", function (e) {
      let spawned = [];

      let filtered = inits.map((item) => {
        let counter = item.match(matchCounter);

        if (counter || counters[item]) {
          let name;

          if (counter) {
            name = counter[1];
          } else {
            name = item;
          }

          if (spawned.indexOf(name) !== -1) return;

          spawned.push(name);
          return name;
        } else {
          return item;
        }
      });

      filtered = filtered.filter((item) => {
        return typeof item !== "undefined";
      });

      placeElements(filtered, {
        top: e.pageY,
        left: e.pageX,
      });

      refreshHint();
      e.stopPropagation();
    });
  }

  if (settings['images']) {
    let abyss = document.querySelector('#abyss');
    $('#abyss').unbind('click');
    abyss.addEventListener('click', () => {
      let abyss = document.querySelector('#abyss');
      let everyElement = document.querySelectorAll('#board .element:not(.deleted):not(.static)');

      anime({
        targets: everyElement,
        translateX: abyss.offsetLeft + 35,
        translateY: abyss.offsetTop + 35,
        duration: 1000,
        easing: "easeInOutSine"
      });

      deleteElements(everyElement);
    });
  }
}

var wrongs = [];
var finals = [];

function gameInit() {
  if (!inited) {
    inited = true;
    $("#board").children(".element").remove();
    $("#board").show();
    $("#info").empty();
    if (finals.length == 0) {
      $("#vote_stats").hide();
      $("#vote_result").hide();
      $("#abyss").droppable({
        drop: function (e, ui) {
          destroyElement(ui.helper);
          refreshHint();
        },
      });
      $("#stack-btn").hide();
      $("#help").dialog({
        autoOpen: false,
        position: "right",
        open: renderHint,
      });
      $("#element_hint").dialog({
        autoOpen: false,
        width: 320,
      });
      $("#payment_dialog")
        .dialog({
          autoOpen: false,
          width: "auto",
        })
        .bind("dialogclose", function () {
          getHintCount();
        });
      $("#recipe_list").dialog({
        autoOpen: false,
        position: "left",
      });
      $("#err_msg").dialog({
        autoOpen: false,
      });
      $("#info_msg").dialog({
        autoOpen: false,
        width: 500,
      });
      $("#welcome_dialog").dialog({
        autoOpen: $.cookie("welcomed") ? false : true,
        width: 800,
      });
      $("#elementFilter").keyup(function (event) {
        filterStack($("#elementFilter").val());
      });

      applySettings(settings);

      toggleSort($("#order").val());

      sortKeys(reactions);
      var test1 = test();
      var total = test1.total;
      finals = test1.finals;

      let errors = [];

      for (let elem in allElements) {
        if (allElements[elem].canCollected) continue;

        errors.push(elem);
      }

      if (errors.length > 0) {
        errMsg(
          "В этом моде не удастся открыть все элементы, потому что некоторые из них невозможно получить: " +
          errors.join(",")
        );
      }

      element_count = Object.keys(allElements).length;
      refreshStat();
    }

    if (settings.debug == "true") console.log("Game Inited.");
    //so.. we are ready, lets go
    placeElements(filterElements(inits), {
      top: $("#stack").offset().top + $("#stack").height() + 200,
      left: $("body").width() / 2 - 100,
    }, true);
  }
}

let inited = false;

gameInit();
