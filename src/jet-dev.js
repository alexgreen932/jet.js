import * as jetMethods from "./methods.js";
import { isStore, subscribeStore } from "./utils/store.js";
import { shortList } from "./helpers/shortList.js";

// Returns a plain string, but keeps template literal behavior correctly.
window.html = (strings, ...values) => String.raw({ raw: strings }, ...values);

// Attach globals
window.$ = {
  debug: false,
  //dev version only for logs
  // log,
  components: [],
  logs: [],
  errors: [],
  proxy: [],
  localstorage: [],
  //log styles
  red: "color: red; background: #FFE6E6; padding: 4px;",
  blue: "color: blue; background: #CFE6FC; padding: 4px;",
  yellow: "color: #000; background: #fff9c4; padding: 4px;",
  grey: "color: #000; background: #eee; padding: 4px;",
  pink: "color: #000; background: #F8BBD0; padding: 4px;",
  green: "color: #000; background: #C8E6C9; padding: 4px;",
  browm: "color: #C8E6C9; background: #C8E6C9; padding: 4px;",
  cyan: "color: #000; background: #E0F7FA; padding: 4px;",
  lime: "color: #000; background: #F9FBE7; padding: 4px;",
  purple: "color: #000; background: #E1BEE7; padding: 4px;",
  indigo: "color: #000; background: #E8EAF6; padding: 4px;"
};

//presets for color log with tan/no tag - to copy/past

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
  if (!window.$.__instances) window.$.__instances = new Map();

  if (!window.$.__uid) window.$.__uid = 0;
  if (!window.$.newId) window.$.newId = () => `j${++window.$.__uid}`;
}

// Optional registry of component definitions (not required for runtime)
const REGISTRY = new Map();

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
          "__j_watch_attached"
          // ...Object.keys(componentMethods)
        ];

        // Привязываем пользовательские методы напрямую к экземпляру компонента,
        // чтобы можно было вызывать их как this.someMethod()
        for (const [key, fn] of Object.entries(this.methods)) {
          if (reserved.includes(key)) {
            //todo!! error popup fir jet-dev version

            continue;
          }
          if (typeof fn === "function") {
            this[key] = fn.bind(this); // Привязываем контекст this к методу
          }
        }

        // ------------------------------------------------------------
        // 2) Bind methods
        // ------------------------------------------------------------

        Object.entries(jetMethods).forEach(([name, fn]) => {
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
        // this.id = this.__jid;

        // ------------------------------------------------------------
        // 8) Inject CSS once per component type (optional)
        // ------------------------------------------------------------
        if (args.css) this._css(args.css);

        // ------------------------------------------------------------
        // 9) Convert s-* props into getters inside this.$data
        // BEFORE proxy is created
        // ------------------------------------------------------------
        // this._propsToData?.(); --moved to prepros

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

        //data checker
        // this._data_update_checker(this.$data);
        //

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

        //todo redo slots
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

        //shorthands for some methods
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

        //new(virtial DOM) data rendering
        if (args.l) {
          this._mode = "literal";
          this._lSource = args.l;
          this._tplSource = null;
        } else if (args.tpl || args.wrapper) {
          //component wrapper creates tpl from innerHTML, requres when page need to have "phisical code" on page eg php for SEO
          if (args.wrapper) {
            this._mode = "tpl";
            this._tplSource = this.innerHTML;
            this._lSource = null;
          } else {
            this._mode = "tpl";
            this._tplSource = args.tpl;
            this._lSource = null;
          }
        } else {
          this._mode = null;
          this._tplSource = null;
          this._lSource = null;
        }
        // ------------------------------------------------------
        // 4) Внутреннее хранилище для режима виртуального дерева
        // ------------------------------------------------------
        // this._vdom = предыдущее дерево
        // Нужно для сравнения старого и нового дерева при повторном рендеринге
        this._vdom = null;

        // ------------------------------------------------------------
        // 20) Optional mount hook (kept)
        // ------------------------------------------------------------
        // if (args.mount) {
        //   if (typeof args.mount === "function") {
        //     args.mount.call(this);
        //   } else if (Array.isArray(args.mount)) {
        //     args.mount.forEach(fn => fn.call(this));
        //   }
        // }

        //todo!!! check if i need it, if not remove
        // ------------------------------------------------------------
        // 21) Watchers (kept)
        // ------------------------------------------------------------
        // if (args.watch) {
        //   args.watch.forEach(w => {
        //     const handler = w.run.bind(this);
        //     const evn = w.on ? w.on : "jreact";
        //     document.addEventListener(evn, handler);

        //     this._watchers ??= [];
        //     this._watchers.push({ on: w.on, handler });
        //   });
        // }

        //magics - save to localstorage
        if (args.save) {
          this._save?.(args.save);
        }

        if (args.watch) {
          document.addEventListener("jreact", () => {
            if (typeof args.watch === "function") {
              args.watch.call(this);
            } else if (Array.isArray(args.watch)) {
              args.watch.forEach(fn => fn.call(this));
            }
          });
        }

        // ------------------------------------------------------------
        // 22) Save localstorage (kept)
        // ------------------------------------------------------------
        if (args.save) {
          this._localstorage?.(args.save);
        }

        //dev only
        // ------------------------------------------------------------
        // 23) Debug inspect mode (kept)
        // ------------------------------------------------------------
        this.addEventListener("click", e => {
          if ($.devtoolsEnabled && e.ctrlKey) {
            $.inspectComponent?.(this);
          }
        });

        //dev only
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
        // );
      }

      // ======================================================
      // ОСНОВНОЙ МЕТОД РЕНДЕРИНГА
      // Определяет, какой режим использовать:
      // - режим дерева объектов (l)
      // - старый режим шаблона (tpl)
      // ======================================================
      render() {
        if (this._mode === "literal" || this._mode === "tpl") {
          this._renderLiteral();
        }

        this._model?.();
        this._events?.();
        this._initDrag();

        // real DOM listener, only once
        // this._initShow?.();
        this._showAfter();
        this._initRendered = true;

        if (typeof this.__onUpdated === "function") {
          this.__onUpdated.call(this);
        }

        this._showReady = true;
      }

      // ======================================================
      // Создаёт один реальный узел DOM из одного виртуального узла
      //
      // Поддерживаемый формат:
      // {
      //   t: 'div',      // тег элемента
      //   c: 'box',     // класс элемента
      //   a: { id:'x', href:'#' }, // атрибуты
      //   i: 'text'     // содержимое
      // }
      //
      // или
      //
      // {
      //   t: 'ul',
      //   i: [
      //     { t:'li', i:'One' },
      //     { t:'li', i:'Two' }
      //   ]
      // }
      // ======================================================
      createElement(node) {
        if (typeof node === "string") {
          return document.createTextNode(node);
        }

        if (!node || !node.t) {
          return document.createTextNode("");
        }

        const el = document.createElement(node.t);

        // attributes
        if (node.a) {
          Object.entries(node.a).forEach(([key, value]) => {
            if (value != null) el.setAttribute(key, value);
          });
        }

        // class shortcut
        if (node.c) {
          el.className = node.c;
        }

        // inner / children
        if (Array.isArray(node.i)) {
          node.i.forEach(child => {
            el.appendChild(this.createElement(child));
          });
        } else if (node.i != null) {
          el.appendChild(this.createElement(node.i));
        }

        return el;
      }

      connectedCallback() {
        if (this.__didConnect) return;
        this.__didConnect = true;

        if (!this.hasAttribute("id")) {
          this.setAttribute("id", this.__jid);
        }

        this._propsToData?.();
        // this._staticPropsForHtml?.(); // if it reads attrs, better here too
        this.render();

        this._data_update_checker(this.$data);

        if (args.mount) {
          if (typeof args.mount === "function") {
            args.mount.call(this);
          } else if (Array.isArray(args.mount)) {
            args.mount.forEach(fn => fn.call(this));
          }
        }

        if (typeof this.__onConnected === "function") {
          this.__onConnected.call(this);
        }
      }

      // connectedCallback() {

      //   if (this.__didConnect) return;
      //   this.__didConnect = true;

      //   if (!this.hasAttribute("id")) {
      //     this.setAttribute("id", this.__jid);
      //   }

      //   this._propsToData?.();
      //   this.render();
      //   this._data_update_checker(this.$data);

      //here one thing i have to add to new
      //   if (Array.isArray(this.args.listeners)) {
      //     this._boundListeners = [];
      //     for (let entry of this.args.listeners) {
      //       this.jListener?.(...entry);
      //     }
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

//for import usage
export { jet, REGISTRY };

// Экспортируем функцию jet в глобальную область видимости окна
window.jet = jet;
