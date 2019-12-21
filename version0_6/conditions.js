class Conditions {
  // проверяет, истинны ли условия для элемента (возвращает true/false)
  static checkElement(condition) {
    let operation = condition[1];
    let name = condition[2];

    switch (operation) {
      case "+":
        return getElements(name)[0] !== undefined;

      case "-":
        return getElements(name)[0] === undefined;

      case "?":
        return isElementOpened(name);

      case "!":
        return !isElementOpened(name);
    }
  }

  // проверяет, истинны ли условия для счётчика (возвращает true/false)
  static checkCounter(condition) {
    let firstValue = getNumber(condition[1]);
    let operation = condition[2];
    let secondValue = getNumber(condition[3]);

    switch (operation) {
      case ">":
        return firstValue > secondValue;

      case "<":
        return firstValue < secondValue;

      case "=":
      case "==":
        return firstValue == secondValue;

      case ">=":
        return firstValue >= secondValue;

      case "<=":
        return firstValue <= secondValue;

      case "!=":
        return firstValue !== secondValue;
    }
  }

  static remove(elem) {
    let condition = this.findBrackets.exec(elem);

    while (condition) {
      let elementCondition = this.findElementCondition.exec(condition[1]);

      if (elementCondition) {
        elem = elem.replace(elementCondition[0], ""); // FIXME: проверить, убирает ли условия внутри {} также (и исправить)
        condition = this.findBrackets.exec(elem);
        continue;
      }

      let counterCondition = this.findCounterCondition.exec(condition[1]);
      if (counterCondition) {
        elem = elem.replace(counterCondition[0], ""); // FIXME: проверить, убирает ли условия внутри {} также (и исправить)
        condition = this.findBrackets.exec(elem);
        continue;
      }

      break;
    }

    return elem;
  }

  static parse(elem) {
    let isTest = true;

    while (isTest) {
      let condition = this.findBrackets.exec(elem);
      if (!condition) break;

      let elementCondition = this.findElementCondition.exec(condition[1]);

      if (elementCondition) {
        isTest = this.checkElement(elementCondition);
        elem = elem.replace(elementCondition[0], ""); // FIXME: проверить, убирает ли условия внутри {} также (и исправить) (возможно нужно убирть по findBrackets)
        continue;
      }

      let counterCondition = this.findCounterCondition.exec(condition[1]);
      if (counterCondition) {
        isTest = this.checkCounter(counterCondition);
        elem = elem.replace(counterCondition[0], ""); // FIXME: проверить, убирает ли условия внутри {} также (и исправить)
        continue;
      }

      // если нет условий, то прерываем цикл
      break;
    }

    if (isTest) return elem;
    else return false;
  }
}

Conditions.findBrackets = /.*(\(.+\))$/;
Conditions.findElementCondition = /\(-([-+?!])(.+)\)$/;
Conditions.findCounterCondition = /\((.+?)\s*(==|>=|<=|!=|>|<|=)\s*(.+?)\)$/;
