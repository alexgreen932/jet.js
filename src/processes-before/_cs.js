import resolveDataPath from "../helpers/resolveDataPath.js";
/**
 * add all classes from an object, jet.css principal is to use a few small classes instead one(ailWind.css style). So it's better to group them in a single object and better name object 'cs', thet attribute 'cs' can have no value, what makes code smaller and easier
 * @param {*} tpl
 * @returns
 */

//TODO PREVENT MULTIPLE IF EXISTS
export function _cs(tpl) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(tpl, "text/html");
  const items = doc.querySelectorAll("[cs]");

  if (items.length === 0) return tpl;

  items.forEach(item => {
    let objKey = (item.getAttribute("cs") || "").trim();
    

    //if no value, but attribute exists key is 'cs'
    if (!objKey) {
      objKey = "cs";
    }

    const obj = resolveDataPath(this, objKey);
    
    if (typeof obj =='object') {
      Object.values(obj).forEach(value => {
        if (value) {
          item.classList.add(value);
        }
      });
    }

    item.removeAttribute("cs");
  });
  return doc.body.innerHTML;
}
