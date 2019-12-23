class Reaction {
  // возвращает объект со свойством status:
  // 0 - fail
  // 1 - success
  // 2 - no prefix
  static parsePrefix(str, reagents) {
    let prefix = findElementPrefix.exec(str);
    let operation = prefix[1];
    let elem = prefix[2];
    let e;

    switch (operation) {
      case "-":
        e = getElements(elem).first();
        e.data("toDelete", true);
        return { status: 1 };

      case "--":
        e = getElements(elem)
          .not(".ui-selected")
          .not(":data(toKill,1)")
          .not(":data(maybeKill,1)")
          .first();
        if (e.length == 0)
          e = getElements(elem)
            .not(".ui-selected")
            .not(":data(toKill,1)")
            .first();
        e.data("toKill", "1");

        if (e.length == 0) {
          logReaction(
            "Для этой реакции необходимо, чтобы на поле присутствовал еще " +
              elem,
            reagents
          );
          $("#board .element:data(toKill,1)").data("toKill", "0");
          $("#board .element:data(maybeKill,1)").data("maybeKill", "0");
          return { status: 0 };
        }

        return { status: 1 };

      case "---":
        //удалить всё
        if (elem.length == 0) $("#board .element").data("maybeKill", "1");
        else {
          // удалить одинаковые элементы
          let classExists = false;
          let l;
          for (l in classes_strings)
            if (classes_strings[l] == elem) {
              classExists = true;
              break;
            }

          if (classExists)
            $("#board .element." + l)
              .not(".ui-selected")
              .data("maybeKill", "1");
          else
            getElements(elem)
              .not(".ui-selected")
              .data("maybeKill", "1");
        }
        return elem;

      default:
        return false;
    }
  }

  static process(toProcess) {
    let result = [];

    for (let str of toProcess) {
      // ПЕРВЫЙ ЭТАП: анализ условий
      let goodRes = Conditions.parse(str);
      if (!goodRes) continue;

      // ВТОРОЙ ЭТАП: анализ на наличие удаления элементов
      let prefixFound = parsePrefix(goodRes);
      // если обязательное удаление не выполнено, прерываем цикл
      if (prefixFound.status === 0) return 0;
      else if (prefixFound.status === 1) continue;

      // ТРЕТИЙ ЭТАП: анализ на счётчик
      let changedCounter = changeCounter(str);
      if (changedCounter) {
        result.push(changedCounter);
        continue;
      }

      // ЧЕТВЁРТЫЙ ЭТАП: появление элемента
    }

    let toDelete = $("#board :data(toDelete)");

    if (toDelete[0]) {
      deleteElements(toDelete);
    }

    destroyElement($("#board :data(toKill,1)"));
    destroyElement($("#board :data(maybeKill,1)"));

    return result;
  }

  // reagents - массив с названиями реагентов
  static find(reagents) {
    // находим реакцию
    let reactionKey = r.sort().join("+");
    let toProcess = reactions[reactionKey];

    if (toProcess) {
      let results = this.processReaction(toProcess);

      if (messages[reagents]) message(reagents, "highlight");

      if (results.length === 0) return 0;

      return results;
    } else {
      logReaction(false, reagents);
      return 0;
    }
  }
}

Reaction.findElementPrefix = /^(-{0,3})(.*)/;
