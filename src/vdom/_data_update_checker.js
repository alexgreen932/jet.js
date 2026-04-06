import deepClone from "../helpers/deepClone.js";

function isEqual(a, b) {
  return JSON.stringify(a) === JSON.stringify(b);
}

export function _data_update_checker() {

  // const notChecking = ["FIELD-INPUT", "JET-FORM", "ELEMENT-EDIT"];
  const notChecking = [];

    if (notChecking.includes(this.tagName)) {

    
    return;
  }

  if (this.static || notChecking.includes(this.tagName)) {return;}

  // Prevent duplicate setup
  if (this._j_data_watch) return;

  // Create watcher once
  this._j_data_watch = {
    snapshot: deepClone(this.$data ?? this.data ?? {}),
    renderQueued: false,
    controller: new AbortController()
  };

  document.addEventListener(
    "jreact",
    () => {
    //
      
      if (this.noAutoRender === true) return;

      const watch = this._j_data_watch;
      const currentData = this.$data ?? this.data ?? {};

      if (isEqual(currentData, watch.snapshot)) return;
    //

      watch.snapshot = deepClone(currentData);

      if (watch.renderQueued) return;
      watch.renderQueued = true;

      queueMicrotask(() => {
        watch.renderQueued = false;
        this.render();
        this.j_form_sync_visibility?.();
      });
    },
    { signal: this._j_data_watch.controller.signal }
  );
}