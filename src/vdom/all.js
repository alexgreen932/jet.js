// ======================================================
// РЕНДЕРИНГ В РЕЖИМЕ ДЕРЕВА ОБЪЕКТОВ (LITERAL RENDER MODE)
//
// Первый рендеринг:
// - создаём DOM из дерева
// - добавляем его в элемент
// - сохраняем дерево как старое для сравнения
//
// Последующие рендеринги:
// - создаём новое дерево
// - сравниваем со старым деревом
// - обновляем только изменённые части
// - сохраняем новое дерево как старое
// ======================================================
export function _renderLiteral() {
  // Получаем текущее дерево
  // Если this.l — функция, вызываем её
  // Если this.l — массив, используем напрямую
  const newTree = this._getLiteralTree();

  // Проверка безопасности: дерево должно быть массивом
  if (!Array.isArray(newTree)) {
    return;
  }

  // --------------------------------------------
  // Первый рендеринг: старого дерева ещё нет
  // --------------------------------------------
  if (!this._vdom) {
    this.innerHTML = ""; // Очищаем содержимое элемента

    const fragment = this._l(newTree); // Создаём фрагмент DOM из нового дерева
    this.appendChild(fragment); // Добавляем фрагмент в элемент

    // Сохраняем копию дерева как старое виртуальное дерево для следующего сравнения
    this._vdom = this._cloneTree(newTree);
    return;
  }

  // --------------------------------------------
  // Повторный рендеринг: обновляем старое дерево до нового
  // --------------------------------------------
  const oldTree = this._vdom; // Берём старое дерево из хранилища
  const max = Math.max(oldTree.length, newTree.length); // Определяем максимальную длину деревьев

  // Проходим по всем элементам деревьев и обновляем их
  for (let i = 0; i < max; i++) {
    this._patch(this, oldTree[i], newTree[i], i);
  }

  // Сохраняем новое дерево как следующее старое
  this._vdom = this._cloneTree(newTree);
}

// ======================================================
// Возвращает текущее дерево объектов
// ======================================================
// _getLiteralTree() {
//   if (typeof this.l === "function") {
//     return this.l.call(this); // Если l — функция, возвращаем результат её вызова
//   }
//   return this.l; // Иначе возвращаем l напрямую
// }

export function _getLiteralTree() {
  if (this._mode === "literal") {
    if (typeof this._lSource === "function") {
      return this._lSource.call(this);
    }
    return this._lSource || [];
  }

  if (this._mode === "tpl") {
    const processedTpl = this._preProcessor(this._tplSource);

    //dev only - check literals
    // check only on tags for not console whole app
    // if (this.tagName === "ADMIN-HEADER") {
    //   console.log(
    //     `%c ${this.tagName} literal:`,
    //     $.green,
    //     this._htmlToArray(processedTpl)
    //   );
    // }

    return this._htmlToArray(processedTpl);
  }

  return [];
}

// ======================================================
// Преобразует массив дерева объектов в реальные узлы DOM
// Возвращает DocumentFragment
// ======================================================
export function _l(tree) {
  const fragment = document.createDocumentFragment(); // Создаём фрагмент документа

  tree.forEach(node => {
    const element = this.createElement(node); // Создаём реальный узел DOM из виртуального узла
    if (element) {
      fragment.appendChild(element); // Добавляем узел в фрагмент
    }
  });

  return fragment; // Возвращаем фрагмент с узлами
}

// ======================================================
// МЕТОД PATCH: ОБНОВЛЕНИЕ DOM
// Сравнивает старый и новый виртуальные узлы и обновляет соответствующий реальный узел DOM
// parent.childNodes[index] даёт позицию реального узла DOM
// ======================================================
export function _patch(parent, oldNode, newNode, index = 0) {
  const realNode = parent.childNodes[index];

  // 1) add new node at correct position
  if (!oldNode && newNode) {
    const newElement = this.createElement(newNode);
    const anchor = parent.childNodes[index] || null;
    parent.insertBefore(newElement, anchor);
    return;
  }

  // 2) remove old node
  if (oldNode && !newNode) {
    if (realNode) {
      parent.removeChild(realNode);
    }
    return;
  }

  // 3) both missing
  if (!oldNode && !newNode) {
    return;
  }

  const oldNorm = this._normalizeVNode(oldNode);
  const newNorm = this._normalizeVNode(newNode);

  // 4) replace if tag differs
  if (oldNorm.t !== newNorm.t) {
    const newElement = this.createElement(newNode);
    if (realNode) {
      parent.replaceChild(newElement, realNode);
    }
    return;
  }

  // 5) text node update
  if (newNorm.t === "#text") {
    if (oldNorm.i !== newNorm.i && realNode) {
      realNode.textContent = newNorm.i;
    }
    return;
  }

  // 6) same tag
  this._updateAttributes(realNode, oldNorm, newNorm);
  this._patchChildren(realNode, oldNorm, newNorm);
}

// ======================================================
// НОРМАЛИЗАЦИЯ ВИРТУАЛЬНОГО УЗЛА
// Преобразует текстовый дочерний узел в унифицированный виртуальный узел
// Пример: "hello" -> { t:"#text", i:"hello" }
// ======================================================
export function _normalizeVNode(node) {
  if (typeof node === "string" || typeof node === "number") {
    return { t: "#text", i: String(node) }; // Текстовый узел преобразуем в объект
  }

  if (!node || typeof node !== "object") {
    return { t: "#text", i: "" }; // Некорректный узел — пустой текстовый узел
  }

  // Возвращаем нормализованный объект узла с заполненными свойствами
  return {
    t: node.t || "div", // тег (по умолчанию div)
    c: node.c || "", // класс (по умолчанию пустая строка)
    a: node.a || {}, // атрибуты (по умолчанию пустой объект)
    i: node.i // содержимое
  };
}

// ======================================================
// ОБНОВЛЕНИЕ АТРИБУТОВ РЕАЛЬНОГО ЭЛЕМЕНТА
// Обновляет класс и атрибуты существующего реального элемента
// ======================================================
export function _updateAttributes(element, oldNode, newNode) {
  if (!element || element.nodeType !== 1) return; // Проверяем, что элемент существует и является узлом типа 1 (элемент)

  const oldClass = oldNode.c || ""; // Старый класс
  const newClass = newNode.c || ""; // Новый класс

  // Обновляем класс, если он изменился
  if (oldClass !== newClass) {
    if (newClass) {
      element.setAttribute("class", newClass); // Устанавливаем новый класс
    } else {
      element.removeAttribute("class"); // Удаляем атрибут class, если новый класс пустой
    }
  }

  const oldAttrs = oldNode.a || {}; // Старые атрибуты
  const newAttrs = newNode.a || {}; // Новые атрибуты

  // Удаляем атрибуты, которые больше не присутствуют в новом узле
  Object.keys(oldAttrs).forEach(key => {
    if (!(key in newAttrs)) {
      element.removeAttribute(key);
    }
  });

  // Добавляем или обновляем новые атрибуты
  Object.entries(newAttrs).forEach(([key, value]) => {
    if (value === null || value === undefined || value === false) {
      element.removeAttribute(key); // Удаляем атрибут, если значение null/undefined/false
      return;
    }

    if (value === true) {
      element.setAttribute(key, ""); // Для булевых атрибутов устанавливаем пустое значение
      return;
    }

    // Обновляем атрибут, только если его значение изменилось
    if (oldAttrs[key] !== value) {
      element.setAttribute(key, String(value));
    }
  });
}

// ======================================================
// ОБНОВЛЕНИЕ ДОЧЕРНИХ УЗЛОВ / ТЕКСТОВОГО СОДЕРЖИМОГО
// ======================================================
export function _patchChildren(element, oldNode, newNode) {
  const oldContent = oldNode.i;
  const newContent = newNode.i;

  const oldIsArray = Array.isArray(oldContent);
  const newIsArray = Array.isArray(newContent);

  // 1) text -> text
  if (!oldIsArray && !newIsArray) {
    const oldText = oldContent == null ? "" : String(oldContent);
    const newText = newContent == null ? "" : String(newContent);

    if (oldText !== newText) {
      element.textContent = newText;
    }
    return;
  }

  // 2) text <-> array
  if (oldIsArray !== newIsArray) {
    element.innerHTML = "";

    if (newIsArray) {
      newContent.forEach(child => {
        element.appendChild(this.createElement(child));
      });
    } else if (newContent !== undefined && newContent !== null) {
      element.textContent = String(newContent);
    }

    return;
  }

  // 3) array -> array
  const max = Math.max(oldContent.length, newContent.length);

  // IMPORTANT: go backwards, so removals do not break indexes
  for (let i = max - 1; i >= 0; i--) {
    this._patch(element, oldContent[i], newContent[i], i);
  }
}

// ======================================================
// ГЛУБОКОЕ КОПИРОВАНИЕ ДЕРЕВА
// Создаёт полную копию дерева для безопасного хранения старого состояния
// Используется для сравнения при следующем рендеринге
// ======================================================
export function _cloneTree(tree) {
  // Используем JSON.parse(JSON.stringify()) для глубокого клонирования
  // Это простой способ скопировать объект/массив со всеми вложенными данными
  return JSON.parse(JSON.stringify(tree));
}
