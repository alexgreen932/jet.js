import resolveDataPath from "../helpers/resolveDataPath.js";
/**
 *
 * @param {*} tpl
 * @returns
 */

//TODO PREVENT MULTIPLE IF EXISTS
export function _st(tpl) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(tpl, "text/html");
  const items = doc.querySelectorAll("[st]");

  if (items.length === 0) return tpl;

  items.forEach(item => {
    let objKey = (item.getAttribute("st") || "").trim();

    //if no value, but attribute exists key is 'st'
    if (!objKey) {
      objKey = "st";
    }

    const obj = resolveDataPath(this, objKey);

    if (typeof obj == "object") {
      for (const [key, value] of Object.entries(obj)) {
        
        if (key && value) {
          item.style[key] = value;
        }
      }
    }

    item.removeAttribute("st");
  });
  return doc.body.innerHTML;
}
