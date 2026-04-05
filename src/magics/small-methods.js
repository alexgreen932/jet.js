//small-methods
// import { __ } from "./i18n.js";
// export default { __ };

// export { __ } from "./i18n.js";

// export function _r(){
//   this.render();
// }

export function _() {}

//listen signal
export function _ls(event = "jreact") {
  if (Array.isArray(event)) {
    event.forEach(e => {
      document.addEventListener(e, () => this.render());
    });
  } else {
    document.addEventListener(event, () => {
      
      this.render();
    });
  }
}

//create custom even



export function _signal(ev = "jreact") {
  
  const e = new Event(ev, { bubbles: true });
  document.dispatchEvent(e); 
}

export function _inner() {
  let inner = this.querySelector("template").innerHTML;
  this.inner = inner;
}

/**
 * Show/hide external UI based on this.edit
 */
export function j_form_sync_visibility() {
  const show = !!this.edit;
  if (this._j_form_el) this._j_form_el.style.display = show ? "" : "none";
  if (this._j_toolbar_el) this._j_toolbar_el.style.display = ""; // toolbar always visible
}
