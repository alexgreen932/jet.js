import resolveDataPath from "../helpers/resolveDataPath.js";
import updateNestedProperty from "../helpers/updateNestedProperty.js";
// import isStaticOrDynamic from "../helpers/isStaticOrDynamic.js";



/**
 *
 * closes editing items in loop or similar usage
 * @param {*} list array or its key
 * @param {*} key kek which should be done fase
 * @returns
 */
export function $closeAll(list, key = "edit") {
  if (!list || !key) return;

  //list can be this.key of 'key'(key of this) or deep key like this.content.section
  let arr = list;
  if (!Array.isArray(arr)) {
    arr = resolveDataPath(this, list);
  }
  if (!Array.isArray(arr)) return;
  arr.forEach(e => (e[key] = false));
}

/**
 * Used to hichlite active menu in loop
 * return class isActive if the same
 * @param {*} current  current value/index in component
 * @param {*} val value/index of element
 * @returns
 */

export function $active(current, val) {
  if (!current || !val) return;

  const evolveCurrent = resolveDataPath(this, current);

  let out;
  if (evolveCurrent === val) {
    out = "isActive";
  }

  return out;
}

export function $s(ev = "jreact") {
  const e = new Event(ev, { bubbles: true });
  document.dispatchEvent(e);
}
