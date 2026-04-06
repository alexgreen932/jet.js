/**
 * Функция для преобразования HTML-строки в массив объектов с заданной структурой
 * @param {string} html - HTML-строка для преобразования
 * @returns {Array} - массив объектов с ключами t, c, a, i
 */
export function _htmlToArray(html) {
  // console.log('_htmlToArray is ON');

  // Защита: если пришла не строка или пустое значение
  if (typeof html !== 'string' || !html.trim()) {
    return [];
  }

  // Создаём временный элемент для парсинга HTML
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');

  /**
   * Рекурсивная функция для обработки узла и его дочерних элементов
   * @param {Node} node - текущий узел DOM
   * @returns {Object|string|null} - объект с данными узла, строка (для текстовых узлов) или null
   */
  function processNode(node) {
    // Если узел — текстовый, возвращаем его содержимое
    // trim() оставляем пока для простоты, чтобы не тащить пустые переносы/отступы из шаблона
    // Позже можно сделать более умную обработку пробелов, если понадобится
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

      // Обрабатываем class отдельно в c
      // Лучше брать через getAttribute('class'), а не className
      // Так поведение более предсказуемо
      const className = node.getAttribute('class');
      if (className) {
        element.c = className;
      }

      // Обрабатываем атрибуты (кроме class)
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

  // ВАЖНО:
  // раньше брался только doc.body.firstChild, и если в tpl было 2+ корневых узла,
  // остальные терялись
  // Поэтому обрабатываем все дочерние узлы body
  const result = Array.from(doc.body.childNodes)
    .map(processNode)
    .filter(node => node !== null);

  // Всегда возвращаем массив
  return result;
}