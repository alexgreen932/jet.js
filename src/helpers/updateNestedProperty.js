import isStaticOrDynamic from "./isStaticOrDynamic.js";


/**
 * updateNestedProperty(obj, path, value)
 *
 * Универсальная запись по пути (cls, a.b, items[current].title).
 *
 * Главная фича для Jet:
 * - если obj = Jet-компонент (HTMLElement)
 * - и поле read-only (пришло через p: => getter-only)
 *   => пишем в родителя (parent-id)
 * - иначе пишем в собственный state (proxyData/$data)
 */
export default function updateNestedProperty(obj, path, value) {


  // ------------------------------------------------------------
  // 1) Если пришёл Jet компонент (HTMLElement) — решаем куда писать
  // ------------------------------------------------------------
  if (obj instanceof HTMLElement) {
    const el = obj;

    // Jet "истинное" состояние: туда и надо писать
    const state = el.proxyData || el.$data;

    // Если по какой-то причине state нет — пробуем писать в сам элемент (fallback)
    if (!state) {
      return setOnObject(el, path, value, el);
    }

    // Проверяем: является ли root-ключ read-only в $data
    // (то есть prop getter, который нельзя менять)
    const rootKey = getRootKey(path);
    const desc = el.$data ? Object.getOwnPropertyDescriptor(el.$data, rootKey) : null;

    const isReadOnlyProp =
      desc &&
      typeof desc.get === 'function' &&
      typeof desc.set !== 'function' &&
      desc.writable !== true;

    // ------------------------------------------------------------
    // 2) Если это read-only prop — пишем в parent
    // ------------------------------------------------------------
    if (isReadOnlyProp) {
      const parentId = el.getAttribute('parent-id');
      if (parentId) {
        const parentEl = document.getElementById(parentId);

        // Если нашли parent — записываем в ЕГО state
        if (parentEl) {
          const parentState = parentEl.proxyData || parentEl.$data || parentEl;
          return setOnObject(parentState, path, value, parentEl);
        }
      }

      
      return;
    }

    // ------------------------------------------------------------
    // 3) Обычный случай: пишем в свой state
    // ------------------------------------------------------------
    return setOnObject(state, path, value, el);
  }

  // ------------------------------------------------------------
  // 4) Если пришёл обычный объект — просто пишем в него
  // ------------------------------------------------------------
  return setOnObject(obj, path, value, obj);
}

/**
 * Реальная запись по пути в обычный объект.
 * ctx нужен для isStaticOrDynamic (items[current])
 */
function setOnObject(obj, path, value, ctx) {
  const keys = path.split('.');
  let target = obj;

  // Walk to the object that owns the last key
  for (let i = 0; i < keys.length - 1; i++) {
    let key = keys[i];

    const match = key.match(/^([a-zA-Z0-9_$]+)\[([^\]]+)\]$/);
    if (match) {
      const base = match[1];
      const indexKey = match[2];
      const index = isStaticOrDynamic(ctx, indexKey);

      target = target[base];
      if (Array.isArray(target)) {
        target = target[index];
      } else {
        
        return;
      }
    } else {
      target = target[key];
    }

    if (!target) return;
  }

  // --- LAST KEY ---
  const lastKey = keys[keys.length - 1];
  const lastMatch = lastKey.match(/^([a-zA-Z0-9_$]+)\[([^\]]+)\]$/);

  if (lastMatch) {
    const base = lastMatch[1];
    const indexKey = lastMatch[2];
    const index = isStaticOrDynamic(ctx, indexKey);

    if (Array.isArray(target[base])) {
      target[base][index] = value;
    } else {
      
    }
    return;
  }

  // Обычная запись
  target[lastKey] = value;
}

/**
 * Берёт корневой ключ из пути:
 * "cls" -> "cls"
 * "user.name" -> "user"
 * "items[current].title" -> "items"
 */
function getRootKey(path) {
  const first = path.split('.')[0];
  const m = first.match(/^([a-zA-Z0-9_$]+)/);
  return m ? m[1] : first;
}

