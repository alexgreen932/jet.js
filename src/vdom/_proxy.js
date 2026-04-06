import { isStore } from "../utils/store.js";


export function _proxy(data) {
  const component = this;
  const seen = new WeakMap();

  function createProxy(target, path = "") {
    // ✅ never wrap a store proxy
    if (isStore(target)) return target;

    if (typeof target !== "object" || target === null) return target;
    if (seen.has(target)) return seen.get(target);

    const proxy = new Proxy(target, {
      get(obj, key) {
        const value = Reflect.get(obj, key);

        // ✅ never wrap store values
        if (isStore(value)) return value;

        if (typeof value === "object" && value !== null) {
          return createProxy(value, `${path}${String(key)}.`);
        }

        return value;
      },

      set(obj, key, value) {
        const prev = obj[key];
        if (prev === value) return true;

        // ✅ keep store assignment intact
        if (isStore(value)) {
          obj[key] = value;

          const fullPath = `${path}${String(key)}`;
          document.dispatchEvent(
            new CustomEvent("jreact", { detail: { path: fullPath, key, value, prev } })
          );
          // component._log(`key "${key}" changes to "${value}"`, "proxy");
          console.warn(`%c Key "${key}" changes to "${value}"`, $.grey);
          return true;
        }

        const ok = Reflect.set(obj, key, value);
        const fullPath = `${path}${String(key)}`;

        document.dispatchEvent(
          new CustomEvent("jreact", { detail: { path: fullPath, key, value, prev } })
        );

        // component._log(`key "${key}" changes to "${value}"`, "proxy");
          console.warn(`%c ${component.tagName} ---- Key "${key}" changes to "${value}"`, $.red);
          console.warn(`%c Key "${key}" changes to "${value}"`, $.grey);
        return ok;
      },
    });

    seen.set(target, proxy);
    return proxy;
  }

  return createProxy(data);
}

// function create
