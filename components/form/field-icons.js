import { icons } from "./options/icons.js";

jet({
  name: "field-icons",

  data: {
    icons: icons,
    show_it: false,
    // show_it: true,
  },

  tpl: html`
    <div class="field-picker-wrap">
      <div class="field-picker">
        <div class="d-select {cls(show_it)}" on-click="show_it=!show_it">
          <div class="fg-1">
            <span j-if="show_it==false">{__('Select')}</span>
            <span j-if="show_it==true">{__('Close')}</span>
          </div>
        </div>

        <div class="d-del fs-8" on-click="cleanVal()">
          <i class="fa-solid fa-xmark"></i>
        </div>
      </div>

      <div j-if="show_it==true" class="picker-box">
        <input type="text" placeholder="Filter icons..." on-click="fastFilter()"/>
        <ul class="icons">
          <j-for data="icons">
            <li data="[e]" on-click="selectItem([$e])">
              <i class="fa-solid [e]"></i>
            </li>
          </j-for>
        </ul>
      </div>
    </div>
  `,

  methods: {
    cls(v) {
      return v ? "doClose" : "doOpen";
    },

    close() {
      if (!this.show_it) return;
      this.show_it = false;
    },

    selectItem(v) {
      this.obj[this.prop] = "fa-solid " + v;
    },

    cleanVal() {
      this.obj[this.prop] = "";
      this.close();
    },

    //new test
    // Дебаунс-функция для задержки обработки ввода
    debounce(func, wait) {
      let timeout;
      return function executedFunction(...args) {
        const later = () => {
          clearTimeout(timeout);
          func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
      };
    },

    // Оптимизированная фильтрация - run on input click, for it could see filter which on load not rendered
    fastFilter() {
      const input = this.querySelector("input");

      // Сохраняем ссылки на элементы один раз
      const listItems = Array.from(this.querySelectorAll("li"));

      // Обработчик фильтрации с дебаунсом
      const handleFilter = this.debounce(() => {
        const search = input.value.toLowerCase().trim();

        // Если строка поиска пустая — показываем все элементы
        if (!search) {
          listItems.forEach(item => {
            item.classList.remove("hidden");
          });
          return;
        }

        // Фильтруем элементы
        listItems.forEach(item => {
          const data = item.getAttribute("data");
          if (data && data.toLowerCase().includes(search)) {
            item.classList.remove("hidden");
          } else {
            item.classList.add("hidden");
          }
        });
      }, 300); // Задержка 300 мс

    input.addEventListener("input", handleFilter);
    }
  },

  mount() {
    const onDocClick = e => {
      if (!this.contains(e.target)) this.close();
    };

    document.addEventListener("click", onDocClick, true);
  }
});
