import { evaluateCondition } from "./evaluateCondition.js";

// Import function to determine if data is static or dynamic
// Импорт функции для определения, являются ли данные статическими или динамическими
// Используется для получения актуальных значений из контекста компонента

/**
 * Обрабатывает условные директивы j-if в HTML‑шаблоне с поддержкой:
 * - вызовов методов: someMethod(1)
 * - сравнений: a == b, a !== 'x', a === b, a != b, a > b, a <= b
 * - простых флагов: isVisible
 * - логических операторов: &&, ||
 * - отрицаний: !cond, !someMethod()
 *
 * @param {string} tpl - исходный HTML‑шаблон
 * @param {any} [alt=null] - альтернативное значение (не используется)
 * @returns {string} - обработанный HTML с удалёнными элементами по условиям
 *
 * Processes conditional j‑if directives in HTML template with support for:
 * - method calls: someMethod(1)
 * - comparisons: a == b, a !== 'x', a === b, a != b, a > b, a <= b
 * - simple flags: isVisible
 * - logical operators: &&, ||
 * - negations: !cond, !someMethod()
 */
export function _if(tpl) {
  //tag is for debug
  // let tag = this.tagName;
  // //console.log('tag:', tag);
  const parser = new DOMParser();
  // Create a DOM parser to work with HTML as a document object model
  // Создать парсер DOM для работы с HTML как с объектной моделью документа
  const doc = parser.parseFromString(tpl, "text/html");
  // Parse the template string into a DOM document
  // Разобрать строку шаблона в DOM‑документ
  const items = doc.querySelectorAll("[j-if]");
  // Select all elements with the j-if attribute
  // Выбрать все элементы с атрибутом j-if

  if (items.length === 0) return tpl;
  // If no elements with j-if are found, return the original template
  // Если элементов с j-if не найдено, вернуть исходный шаблон

  items.forEach(item => {
    const raw = (item.getAttribute("j-if") || "").trim();
    // if (this.tagName == "MY-APP") {
    //   console.log(`%c raw "${raw}"`, $.red);
    // }

    // Get the raw condition string from the j-if attribute and trim whitespace
    // Получить необработанную строку условия из атрибута j-if и убрать пробелы

    // ✅ ВАЖНО: всегда передаём контекст компонента (this) внутрь вычислений
    // Always pass the component context (this) into the evaluation
    const ok = evaluateCondition(this, raw);
    // if (this.tagName === "DOC-HEADER") {
    //   console.log(`${raw} ok:`, ok);
    // }
    // Evaluate the condition using the component's context
    // Оценить условие с использованием контекста компонента

    if (!ok) item.remove();
    // If the condition is false, remove the element from the DOM
    // Если условие ложно, удалить элемент из DOM
  });

  return doc.body.innerHTML;
  // Return the processed HTML (inner content of the body)
  // Вернуть обработанный HTML (внутреннее содержимое body)
}

