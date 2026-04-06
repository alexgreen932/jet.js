import resolveDataPath from "../helpers/resolveDataPath.js";
import updateNestedProperty from "../helpers/updateNestedProperty.js";

function defineReactiveProp(target, key, descriptor) {
  Object.defineProperty(target, key, {
    enumerable: true,
    configurable: true,
    ...descriptor
  });
}

function parseStaticValue(value) {
  const v = String(value).trim();

  if (v === "true") return true;
  if (v === "false") return false;
  if (v === "null") return null;
  if (v === "undefined") return undefined;
  if (v !== "" && !isNaN(v)) return Number(v);

  return v;
}

function parseJsonValue(encoded) {
  const raw = decodeURIComponent(String(encoded).trim());
  return JSON.parse(raw);
}

function warnMissingProp(component, attrName, path) {
  console.warn(
    `[Jet] Missing dynamic prop "${attrName}" on <${component.tagName.toLowerCase()}>. ` +
      `Path "${path}" was not found in parent component.`
  );
}

export function _propsToData() {
  this.$data = this.$data || {};

  const parentId = this.getAttribute("parent-id");
  const parentEl = parentId ? $.__instances.get(parentId) : null;

  const readScope = parentEl;
  const writeScope =
    parentEl?.$data || parentEl?.__data || parentEl?.data || parentEl;

  for (const attr of this.attributes) {
    const name = attr.name;
    const rawValue = attr.value ?? "";

    // -------------------------
    // Dynamic props: d-*
    // -------------------------
    if (name.startsWith("d-")) {
      if (!parentEl) continue;

      const key = name.slice(2).trim();

      // If no value:
      // <com-child d-title>
      // then path becomes "title"
      //
      // If value exists:
      // <com-child d-user="post.author.name">
      // then path becomes "post.author.name"
      const path = rawValue.trim() || key;
      if (this.tagName === "DOC-MENU") {
        console.log(`${this.tagName} path:`, path);
      }

      const testValue = resolveDataPath(readScope, path);

      if (typeof testValue === "undefined") {
        warnMissingProp(this, name, path);
      }

      const descriptor = {
        get: () => resolveDataPath(readScope, path),
        set: v => {
          if (!writeScope) {
            console.warn(
              `[Jet] Cannot set dynamic prop "${key}" on <${this.tagName.toLowerCase()}> because parent write scope is missing.`
            );
            return;
          }

          updateNestedProperty(writeScope, path, v);

          if (typeof parentEl.dispatchEvent === "function") {
            parentEl.dispatchEvent(new Event("jreact", { bubbles: true }));
          }
        }
      };

      defineReactiveProp(this, key, descriptor);
      defineReactiveProp(this.$data, key, descriptor);
      continue;
    }

    // -------------------------
    // Static props: s-*
    // -------------------------
    if (name.startsWith("s-")) {
      const key = name.slice(2).trim();
      const val = parseStaticValue(rawValue);

      this.$data[key] = val;
      this[key] = val;
      continue;
    }

    // -------------------------
    // JSON props: json-*
    // -------------------------
    if (name.startsWith("json-")) {
      const key = name.slice(5).trim();

      try {
        const val = parseJsonValue(rawValue);
        this.$data[key] = val;
        this[key] = val;
      } catch (err) {
        console.warn(
          `[Jet] Bad JSON prop "${name}" on <${this.tagName.toLowerCase()}>:`,
          rawValue
        );
      }

      continue;
    }
  }

  // -------------------------
  // Listen to parent updates once
  // -------------------------
  if (parentEl && !this.__parentReactiveBound) {
    this.__parentReactiveBound = true;
    this.__parentRef = parentEl;
    this.__parentReactiveHandler = () => this.render();

    parentEl.addEventListener("jreact", this.__parentReactiveHandler);
  }
}
