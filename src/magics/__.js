/**
 * Функция для преобразования HTML-строки в массив объектов с заданной структурой
 * @param {string} html - HTML-строка для преобразования
 * @returns {Array} - массив объектов с ключами t, c, a, i
 */
function htmlToArray(html) {
  // Создаём временный элемент для парсинга HTML
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  const root = doc.body.firstChild;

  /**
   * Рекурсивная функция для обработки узла и его дочерних элементов
   * @param {Node} node - текущий узел DOM
   * @returns {Object|string} - объект с данными узла или строка (для текстовых узлов)
   */
  function processNode(node) {
    // Если узел — текстовый, возвращаем его содержимое (с обрезкой пробелов)
    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent.trim();
      return text ? text : null;
    }

    // Если узел — элемент (тег), обрабатываем его
    if (node.nodeType === Node.ELEMENT_NODE) {
      // Базовый объект для текущего элемента
      const element = {
        t: node.tagName.toLowerCase() // имя тега в нижнем регистре
      };

      // Обрабатываем класс
      if (node.className) {
        element.c = node.className;
      }

      // Обрабатываем атрибуты (кроме класса)
      const attributes = {};
      for (const attr of node.attributes) {
        if (attr.name !== 'class') {
          attributes[attr.name] = attr.value;
        }
      }
      if (Object.keys(attributes).length > 0) {
        element.a = attributes;
      }

      // Обрабатываем дочерние элементы
      const children = Array.from(node.childNodes)
        .map(processNode) // рекурсивно обрабатываем каждый дочерний узел
        .filter(child => child !== null); // фильтруем пустые узлы

      // Если есть дочерние элементы, добавляем их в свойство i
      if (children.length > 0) {
        // Если дочерний элемент один и это строка, сохраняем как строку
        if (children.length === 1 && typeof children[0] === 'string') {
          element.i = children[0];
        } else {
          // Иначе сохраняем как массив
          element.i = children;
        }
      }

      return element;
    }

    // Для других типов узлов возвращаем null
    return null;
  }

  // Обрабатываем корневой элемент
  const result = processNode(root);

  // Всегда возвращаем массив, даже если результат — один элемент
  return Array.isArray(result) ? result : [result];
}

// Примеры использования

// Пример 1: простой тег
let eg1 = `<h1>Hello World</h1>`;
console.log(htmlToArray(eg1));
// Вывод: [{ t: 'h1', i: 'Hello World' }]

// Пример 2: вложенные элементы
let eg2 = `
  <div class="box" id="demo-box">
    <h3>Literal mode</h3>
    <p>Hello World</p>
    <p>Count: 1</p>
    <ul>
      <li>One</li>
      <li>Two</li>
      <li>Three</li>
    </ul>
  </div>
`;
console.log(htmlToArray(eg2));
/*
Вывод:
[
  {
    t: "div",
    c: "box",
    a: { id: "demo-box" },
    i: [
      { t: "h3", i: "Literal mode" },
      { t: "p", i: "Hello World" },
      { t: "p", i: "Count: 1" },
      {
        t: "ul",
        i: [
          { t: "li", i: "One" },
          { t: "li", i: "Two" },
          { t: "li", i: "Three" }
        ]
      }
    ]
  }
]
*/
