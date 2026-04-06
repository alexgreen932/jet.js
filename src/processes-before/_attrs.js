import isStaticOrDynamic from '../helpers/isStaticOrDynamic.js';
import { handleDynamic } from '../helpers/attrHandlers.js';
import handleOn from '../helpers/handleOn.js';
import getElementsByAttributePrefix from '../helpers/getElementsByAttributePrefix.js';

// Prefixes mapped to their respective handler functions
const handlers = {
  'd-': handleDynamic,
  // 's-': handleDynamic,//todo static 's-' no need parent
  'on-': handleOn, // ✅ теперь обрабатываем on-click / on-mouseover и т.д.
  'j-html': handleHtml, 
  'j-encoded': handeEncoded, 
};

/**
 * doAttr: Handles all dynamic attribute bindings.
 * IMPORTANT:
 *  - Здесь мы работаем с HTML-СТРОКОЙ через DOMParser (виртуальный DOM),
 *    поэтому НЕЛЬЗЯ вызывать _events() отсюда (реального DOM ещё нет).
 *
 * @param {string} tpl - HTML string template
 * @returns {string} - Final rendered HTML string
 */
export function _attrs(tpl) {
  const { doc, matchedElements } = getElementsByAttributePrefix(
    ['on-', 'j-html', 'd-', 's-', 'j-encoded'],
    tpl
  );

  matchedElements.forEach((el) => {
    Array.from(el.attributes).forEach((attr) => {
      const value = (attr.value || '').trim();

      for (const prefix in handlers) {
        if (attr.name.startsWith(prefix)) {
          // ✅ здесь можно подключать data_update_checker и т.д. (если нужно)
          handlers[prefix](el, attr, value, this);
          break;
        }
      }
    });
  });

  return doc.body.innerHTML;
}

//small handlers
function handleHtml(el, attr, value, context) {
//
  el.innerHTML = isStaticOrDynamic(context, value);
}


//todo remove iv not used and refference too
function handeEncoded(el, attr, value, context) {

  let raw = isStaticOrDynamic(context, value);
  let decoded = decodeURIComponent(raw);
  el.innerHTML = decoded;
}



