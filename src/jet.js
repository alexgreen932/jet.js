import * as jetMethods from "./methods.js";
import { _htmlToArray } from "./vdom/_htmlToArray";

// ============================================================
// ОЧЕНЬ МАЛАЯ ТЕСТОВАЯ ВЕРСИЯ JET
// Поддерживает два режима рендеринга:
//
// 1. tpl  -> строковый шаблон -> innerHTML
// 2. l    -> дерево объектов -> патч DOM
//
//
// Цели:
// - понять, как дерево объектов связывается с DOM
// - разобраться, как хранятся старое и новое деревья
// - выяснить, как функция render() решает, что делать
// ============================================================

function jet(args) {
  customElements.define(
    args.name,
    class extends HTMLElement {
      constructor() {
        super();

        // ------------------------------------------------------
        // 1) Сохраняем конфигурацию компонента
        // ------------------------------------------------------
        this.args = args; // Сохраняем переданные аргументы в свойство компонента
        this.methods = args.methods || {}; // Получаем методы из аргументов или создаём пустой объект

        // Привязываем пользовательские методы напрямую к экземпляру компонента,
        // чтобы можно было вызывать их как this.someMethod()
        for (const [key, fn] of Object.entries(this.methods)) {
          if (typeof fn === "function") {
            this[key] = fn.bind(this); // Привязываем контекст this к методу
          }
        }

        // ------------------------------------------------------
        // 2) Простые локальные данные
        // Пока без Proxy — просто копируем свойства в экземпляр
        // ------------------------------------------------------
        this.$data = args.data ?? {}; // Получаем данные из аргументов или создаём пустой объект

        for (const [key, value] of Object.entries(this.$data)) {
          this[key] = value; // Копируем каждое свойство данных в экземпляр компонента
        }

        // ------------------------------------------------------------
        // 3) Bind vdom methods (kept)
        // ------------------------------------------------------------
        Object.entries(jetMethods).forEach(([name, fn]) => {
          this[name] = fn.bind(this);
        });




        //new(virtial DOM) data rendering
        if (args.l) {
          this._mode = "literal";
          this._lSource = args.l;
          this._tplSource = null;
        } else if (args.tpl) {
          this._mode = "tpl";
          this._tplSource = args.tpl;
          this._lSource = null;
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



        // ------------------------------------------------------
        // 6) Опциональный вызов mount
        // Вызывается после первого рендеринга
        // ------------------------------------------------------
        if (args.mount) {
          if (typeof args.mount === "function") {
            args.mount.call(this); // Если mount — функция, вызываем её в контексте компонента
          } else if (Array.isArray(args.mount)) {
            // Если mount — массив функций, вызываем каждую в контексте компонента
            args.mount.forEach(fn => fn.call(this));
          }
        }
      }

      // ======================================================
      // ОСНОВНОЙ МЕТОД РЕНДЕРИНГА
      // Определяет, какой режим использовать:
      // - режим дерева объектов (l)
      // - старый режим шаблона (tpl)
      // ======================================================
      render() {
        // console.log("render ", this.tagName);

        if (this._mode === "literal" || this._mode === "tpl") {
          this._renderLiteral();
        }

        this._model?.();
        this._events?.();

        if (typeof this.__onUpdated === "function") {
          this.__onUpdated.call(this);
        }
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

      // ======================================================
      // CALLBACK ПРИ ПОДКЛЮЧЕНИИ КОМПОНЕНТА К DOM
      // Вызывается браузером, когда компонент добавляется в документ
      // ======================================================
      connectedCallback() {
        // console.log("connectedCallback", this.tagName);
        // if (this._didInit) return;
        // this._didInit = true;
        this.render();
        // Проверяем, существует ли метод __onConnected и является ли он функцией
        if (typeof this.__onConnected === "function") {
          this.__onConnected.call(this); // Вызываем метод в контексте компонента
        }
      }

      // ======================================================
      // CALLBACK ПРИ ОТКЛЮЧЕНИИ КОМПОНЕНТА ОТ DOM
      // Вызывается браузером, когда компонент удаляется из документа
      // ======================================================
      disconnectedCallback() {
        // Проверяем, существует ли метод __onDestroyed и является ли он функцией
        if (typeof this.__onDestroyed === "function") {
          this.__onDestroyed.call(this); // Вызываем метод в контексте компонента
        }
      }
    }
  );
}

// Returns a plain string, but keeps template literal behavior correctly.
window.html = (strings, ...values) => String.raw({ raw: strings }, ...values);

// Attach globals
window.$ = {
  // log,
  components: [],
  logs: [],
  errors: [],
  proxy: [],
  localstorage: [],
  debug: false,

  red: "color: red; background: #fff3cd; padding: 4px;",
  blue: "color: blue; background: #CFE6FC; padding: 4px;",
  yellow: "color: #000; background: #fff9c4; padding: 4px;",
  grey: "color: #666; background: #eee; padding: 4px;",
  green: "color: #000; background: #C8E6C9; padding: 4px;",
  browm: "color: #C8E6C9; background: #C8E6C9; padding: 4px;"
};

// Экспортируем функцию jet в глобальную область видимости окна
window.jet = jet;

//preset for color log with tan/no tag
// console.log(`%c ${this.tagName} el: ${v}`, $.grey );
// console.log(`%c ${this.tagName} el: ${v}`, $.blue );
// console.log(`%c el: ${v}`, $.grey );
