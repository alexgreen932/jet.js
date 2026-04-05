// import { isStaticOrDynamic, resolveDataPath } from '../helpers.js';
import isStaticOrDynamic from "./isStaticOrDynamic.js";



export function handleHtml(el, attr, value, context) {
	el.innerHTML = isStaticOrDynamic(context, value);
}

//todo rm
// export function handleEl(el, attr, value, context) {
// 	el.setAttribute('data-parent', context.tagName.toLowerCase());
// }

export function handleGrid(el, attr, value, context) {
	el.setAttribute('parent-data', context.tagName.toLowerCase());
}


//todo  rmi
export function handleIteration(el, attr, value, context) {
	el.setAttribute('parent-data', context.tagName.toLowerCase());
}

//props handlers
export function handleDynamic(el, attr, value, context) {
  // stamp parent id so child can read parent's data
  el.setAttribute('parent-id', context.__jid);

  // optional debug
  // el.setAttribute('parent-data', context.tagName.toLowerCase());
}


