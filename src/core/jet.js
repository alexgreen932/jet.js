import * as componentMethods from "../methods/index.js";
import * as smallMethods from "../methods/small-methods.js";
import * as goodies from "../methods/goodies.js"; //jet.engine only, maybe some will be included im core
import installMethods from "../methods/installMethods.js";
import { isStore, subscribeStore } from "./store.js";
import { shortList } from "../helpers/shortList.js";

function subscribeNestedStores(obj, cmp) {
  if (!obj || typeof obj !== "object") return;

  for (const k of Object.keys(obj)) {
    const v = obj[k];

    if (isStore(v)) {
      cmp.__storeUnsubs ??= [];
      cmp.__storeUnsubs.push(subscribeStore(v, cmp));
    }
  }
}

/**
 * Ensure Jet globals exist once.
 */
function ensureJetGlobals() {
  if (!window.$) {
    window.$ = {
      log: () => {},
      components: [],
      logs: [],
      errors: [],
      proxy: []
    };
  }

  if (!window.$.__instances) window.$.__instances = new Map();

  if (!window.$.__uid) window.$.__uid = 0;
  if (!window.$.newId) window.$.newId = () => `j${++window.$.__uid}`;
}

// Optional registry of component definitions (not required for runtime)
const REGISTRY = new Map();

// function cloneDeep(obj) {
//   if (obj == null) return obj;

//   // If structuredClone fails (Proxy, functions, DOM, etc), fallback safely.
//   if (typeof structuredClone === "function") {
//     try {
//       return structuredClone(obj);
//     } catch (e) {
//       // fallback below
//     }
//   }

//   try {
//     return JSON.parse(JSON.stringify(obj));
//   } catch (e) {
//     // Last fallback: return as-is (better than crashing)
//     return obj;
//   }
// }

/**
 * ✅ IMPORTANT: create a UNIQUE data object per instance
 * Supports:
 * - data: { ... }            (cloned per instance)
 * - data() { return {...} }  (new per instance)
 */
function initData(args, ctx) {
  // 1) if data() factory — safe: user returns new object, but may contain stores
  if (typeof args.data === "function") {
    const raw = args.data.call(ctx) || {};
    return cloneDataPreserveStores(raw);
  }

  // 2) if plain object — clone per instance, but preserve stores
  if (args.data && typeof args.data === "object") {
    return cloneDataPreserveStores(args.data);
  }

  return {};
}

function cloneDataPreserveStores(obj) {
  // If whole object is a store proxy -> return it directly
  if (isStore(obj)) return obj;

  // Only clone plain objects/arrays; keep stores by reference
  if (Array.isArray(obj)) {
    return obj.map(v => cloneDataPreserveStores(v));
  }

  if (obj && typeof obj === "object") {
    const out = {};
    for (const k of Object.keys(obj)) {
      const v = obj[k];
      out[k] = isStore(v) ? v : cloneDataPreserveStores(v);
    }
    return out;
  }

  // primitives
  return obj;
}

/**
 * Main function to register a Jet component as a Custom Element.
 */
function jet(args) {
  ensureJetGlobals();

  // store definition (optional)
  REGISTRY.set(args.name, args);

  if (customElements.get(args.name)) return;

  customElements.define(
    args.name,
    class extends HTMLElement {
      constructor() {
        super();

        // ------------------------------------------------------------
        // 0) Basic component metadata
        // ------------------------------------------------------------
        this.args = args;
        this.methods = args.methods || {};
        this._logs = { errors: [] };

        // ------------------------------------------------------------
        // 1) Reserved names protection
        // ------------------------------------------------------------
        const reserved = [
          "args",
          "methods",
          "tpl",
          "render",
          "template",
          "static",
          "__jid",
          "__jet__",
          "$data",
          "_proxyData",
          "proxyData",
          "proxy",
          "id",
          "connectedCallback",
          "disconnectedCallback",
          "__onConnected",
          "__onDestroyed",
          "__onUpdated",
          "connected",
          "destroyed",
          "updated",
          "created",
          "e",
          "__j_watch_attached",
          ...Object.keys(componentMethods)
        ];

        // ------------------------------------------------------------
        // 2) Bind methods
        // ------------------------------------------------------------
        installMethods(
          this,
          [componentMethods, smallMethods, goodies, this.methods],
          reserved,
          this.tagName
        );

        // ------------------------------------------------------------
        // 3) Bind shared framework methods (kept)
        // ------------------------------------------------------------
        Object.entries(componentMethods).forEach(([name, fn]) => {
          this[name] = fn.bind(this);
        });

        // ------------------------------------------------------------
        // 4) Static mode
        // ------------------------------------------------------------
        this.static = args.static ?? false;

        this.__jet__ = this;

        // ------------------------------------------------------------
        // 5) Optional inner content capture
        // ------------------------------------------------------------
        if (args._inner) {
          this._inner();
        }

        // ------------------------------------------------------------
        // ✅ 6) Create data object (UNIQUE per instance)
        // ------------------------------------------------------------
        this.$data = initData(args, this);

        // ------------------------------------------------------------
        // 7) Give component a unique id and register instance
        // ------------------------------------------------------------
        this.__jid = $.newId();
        $.__instances.set(this.__jid, this);
        this.id = this.__jid;

        // ------------------------------------------------------------
        // 8) Inject CSS once per component type (optional)
        // ------------------------------------------------------------
        if (args.css) this._css(args.css);

        // ------------------------------------------------------------
        // 9) Convert s-* props into getters inside this.$data
        // BEFORE proxy is created
        // ------------------------------------------------------------
        this._propsToData?.();

        // ------------------------------------------------------------
        // 10) Create proxy around data (reactivity)
        // ------------------------------------------------------------
        if (isStore(this.$data)) {
          // this._proxyData = this.$data;
          // this.__unsubscribeStore = subscribeStore(this.$data, this);
          const rawData = this.$data;

          subscribeNestedStores(rawData, this);

          this._proxyData = this._proxy(rawData);
          this.$data = this._proxyData;
        } else {
          this._proxyData = this._proxy(this.$data);
          this.$data = this._proxyData;

          // ✅ NEW: if data contains stores like { ops, menu }
          // subscribe this component to each store
          subscribeNestedStores(this.$data, this);
        }
        // ------------------------------------------------------------
        // 11) Expose proxy keys on the component instance as this.key
        // ------------------------------------------------------------
        for (const key in this._proxyData) {
          if (reserved.includes(key)) continue;

          const desc = Object.getOwnPropertyDescriptor(this.$data, key);
          const hasSetter =
            !desc || typeof desc.set === "function" || desc.writable === true;

          Object.defineProperty(this, key, {
            enumerable: true,
            configurable: true,
            get: () => this._proxyData[key],
            set: hasSetter ? val => (this._proxyData[key] = val) : undefined
          });
        }

        // ------------------------------------------------------------
        // 12) Lifecycle: created()
        // ------------------------------------------------------------
        if (typeof args.created === "function") {
          args.created.call(this);
        }

        // ------------------------------------------------------------
        // 13) Store lifecycle hooks SAFELY
        // ------------------------------------------------------------
        this.__onConnected =
          typeof args.connected === "function" ? args.connected : null;
        this.__onDestroyed =
          typeof args.destroyed === "function" ? args.destroyed : null;
        this.__onUpdated =
          typeof args.updated === "function" ? args.updated : null;

        // ------------------------------------------------------------
        // 14) Template
        // ------------------------------------------------------------
        this.tpl = this._l(args.l);
        // this.tpl =
        //   args.tpl ||
        //   (() =>
        //     this._log?.(
        //       `<div><strong>template (tpl) is missing</strong></div>`
        //     ) || `<div><strong>template (tpl) is missing</strong></div>`);

        // ------------------------------------------------------------
        // 15) Slots support (kept)
        // ------------------------------------------------------------
        if (args.slots) {
          this.j_slots?.(args.slots);
        }

        // ------------------------------------------------------------
        // 16) Wrapper support (kept)
        // ------------------------------------------------------------
        if (args.wrapper) {
          this.jContent = this.innerHTML;
        }

        // ------------------------------------------------------------
        // 17) Standalone HTML props support (kept)
        // ------------------------------------------------------------
        this._staticPropsForHtml?.();

        // Object.defineProperty(this, "$r", {
        //   get: () => {
        //     return this.render();
        //   }
        // });

        //shorthands --------
        // from imported constant like
        // export const shortList = [["$r", "render"], //rest...];

        //shorthand for render - for some reasons do not works if before in shortList
        // Object.defineProperty(this, `$r`, {
        //   get() {
        //     return this.render();
        //   }
        // });

        // export const shortList = [
        //   ["$r", "render"],
        //   ["$s", "_signal"]
        // ];

        if (shortList) {
          shortList.forEach(([name, fn]) => {
            // callable shorthand
            Object.defineProperty(this, `${name}_`, {
              get() {
                return (...args) => this[fn](...args);
              }
            });

            // no-brackets shorthand
            Object.defineProperty(this, name, {
              get() {
                return this[fn]();
              }
            });
          });
        }

        // ------------------------------------------------------------
        // 18) First render
        // ------------------------------------------------------------
        this.render();
        // this.$r = this.render();

        // ------------------------------------------------------------
        // 19) Optional form bridge (kept)
        // ------------------------------------------------------------
        //new
        if (args.form) {
          this.j_form_data = args.form;
          this.j_form_init?.();
        }

        //old
        // if (args.form && typeof args.form === "object") {
        //   this.j_form_data = args.form;
        //   this.j_form_init?.();
        // }

        // ------------------------------------------------------------
        // 20) Optional mount hook (kept)
        // ------------------------------------------------------------
        if (args.mount) {
          if (typeof args.mount === "function") {
            args.mount.call(this);
          } else if (Array.isArray(args.mount)) {
            args.mount.forEach(fn => fn.call(this));
          }
        }

        // ------------------------------------------------------------
        // 21) Watchers (kept)
        // ------------------------------------------------------------
        if (args.watch) {
          args.watch.forEach(w => {
            const handler = w.run.bind(this);
            const evn = w.on ? w.on : "jreact";
            document.addEventListener(evn, handler);

            this._watchers ??= [];
            this._watchers.push({ on: w.on, handler });
          });
        }

        // ------------------------------------------------------------
        // 22) Save localstorage (kept)
        // ------------------------------------------------------------
        if (args._save) {
          this._localstorage?.(args._save);
        }

        // ------------------------------------------------------------
        // 23) Debug inspect mode (kept)
        // ------------------------------------------------------------
        this.addEventListener("click", e => {
          if ($.devtoolsEnabled && e.ctrlKey) {
            $.inspectComponent?.(this);
          }
        });

        // ------------------------------------------------------------
        // 24) Devtools registry (kept)
        // ------------------------------------------------------------
        if (typeof $ !== "undefined" && $.dev) {
          const methods = args.methods ? Object.keys(args.methods) : null;

          const exclusions = [
            "jet-console",
            "coms-render",
            "console-tabs",
            "log-render",
            "console-congig",
            "console-settings",
            "jpopup-errors",
            "jpopup-component"
          ];
          if (!exclusions.includes(args.name)) {
            $.components.push({
              name: args.name,
              data: JSON.stringify(args.data) || "no data",
              props: JSON.stringify(this.j_props_arr) || "no props",
              methods: JSON.stringify(methods) || "no methods"
            });
          }
        }

        // ------------------------------------------------------------
        // 25) Refresh triggers (kept)
        //ls meand lestenSignal
        // ------------------------------------------------------------
        if (args.ls) {
          this._ls?.(args.ls);
        }

        //dev block
        // console.log("constructor check ", this.__('Container Width'));
      }

      render() {
        let tpl = this.tpl;

        tpl = this._loader?.(tpl) ?? tpl;
        tpl = this._errorLog?.(tpl) ?? tpl;
        tpl = this._jfor?.(tpl) ?? tpl;
        tpl = this._for?.(tpl) ?? tpl;
        tpl = this._if?.(tpl) ?? tpl;
        tpl = this._attrs?.(tpl) ?? tpl;
        tpl = this._interpolation?.(tpl) ?? tpl;
        tpl = this._dc?.(tpl) ?? tpl;

        this.innerHTML = tpl;

        this._model?.();
        this._events?.();

        if (typeof this.__onUpdated === "function") {
          this.__onUpdated.call(this);
        }
      }

      connectedCallback() {
        if (typeof this.__onConnected === "function") {
          this.__onConnected.call(this);
        }

        if (Array.isArray(this.args.listeners)) {
          this._boundListeners = [];
          for (let entry of this.args.listeners) {
            this.jListener?.(...entry);
          }
        }
      }

      // disconnectedCallback() {
      //   if (typeof this.__onDestroyed === "function") {
      //     this.__onDestroyed.call(this);
      //   }
      // }

      disconnectedCallback() {
        // ✅ store cleanup
        this.__unsubscribeStore?.();
        this.__storeUnsubs?.forEach(fn => fn?.());
        this.__storeUnsubs = null;

        if (typeof this.__onDestroyed === "function") {
          this.__onDestroyed.call(this);
        }
      }

      //todo!!! seems depricated - remove then
      e(eventName = this.j_r || "data-updated") {
        const event = new Event(eventName, { bubbles: true });
        this.dispatchEvent(event);
      }
    }
  );
}

export { jet, REGISTRY };
