import resolveDynamicIndex from "../helpers/resolveDynamicIndex.js";

/**
 * Two-way binding for inputs/selects/textarea.
 * Supports:
 *  - j-model="title"        -> this.title
 *  - j-model="obj.bg"       -> this.obj.bg
 *  - j-model="arr[0].name"  -> works via resolveDynamicIndex helper
 */
export function _model() {
  const items = this.querySelectorAll("[j-model]");
  if (!items.length) return;

  items.forEach((item) => {
    const keyPath = item.getAttribute("j-model")?.trim();
    if (!keyPath) return;

    // ---------- INIT UI VALUE ----------
    const current = resolveDynamicIndex(keyPath, this);

    if (current !== undefined) {
      if (item.tagName === "TEXTAREA") {
        item.value = String(current);
      } else if (item.type === "checkbox") {
        item.checked = Boolean(current);
      } else {
        item.value = current;
      }
    }

    // ---------- WRITE BACK ----------
    const updateModel = (e) => {
      let newValue = e.target.value;

      if (item.type === "checkbox") {
        newValue = e.target.checked;
      }

      // nested path: "obj.bg"
      if (keyPath.includes(".")) {
        const parts = keyPath.split(".");
        const lastKey = parts.pop();
        const rootPath = parts.join(".");

        const rootObj = resolveDynamicIndex(rootPath, this);

        if (rootObj && typeof rootObj === "object" && lastKey) {
          rootObj[lastKey] = newValue;
        }
      } else {
        // simple key: "title"
        this[keyPath] = newValue;
      }

      // this.dispatchEvent(new Event("jreact", { bubbles: true }));
    };

    item.addEventListener("input", updateModel);
    item.addEventListener("change", updateModel);
  });
}