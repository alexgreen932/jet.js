import { options_picker } from "./options/options_picker.js";

jet({
  name: "field-picker",

  data: {
    ops: [], // original options
    filteredOps: [], // rendered options after filter
    opsKey: "",
    show_it: false,
    filter: ""
  },

  tpl: html`
    <div class="field-picker-wrap">
      <div class="field-picker">
        <div class="d-select {cls(show_it)}" on-click="toggle()">
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
        <!-- //todo   -->
        <!-- 
        <input
          j-if="opsKey=='icons'"
          type="text"
          placeholder="Filter icons..."
          j-model="filter"
          on-input="updateFilter(this.value)"
          class="picker-filter"
        >
        <p>---{filter}</p> -->

        <ul class="{opsKey}">
          <j-for data="ops">
            <li j-if="opsKey=='bg'" class="[e]" on-click="selectItem([$e])"></li>
            <li j-if="opsKey=='col'" class="[e]" on-click="selectItem([$e])">Aa</li>
            <li j-if="opsKey=='icons'" on-click="selectItem([$e])"><i class="fa-solid [e]"></i></li>
          </j-for>
        </ul>
      </div>
    </div>
  `,

  methods: {
    cls(v) {
      return v ? "doClose" : "doOpen";
    },

    toggle() {
      this.show_it = !this.show_it;

      // optional: reset filtered list when opening
      if (this.show_it && this.opsKey === "icons") {
        this.applyFilter();
      }

      // this._signal("jreact");
    },

    close() {
      if (!this.show_it) return;
      this.show_it = false;
      // this._signal("jreact");
    },

    selectItem(v) {
      if (this.opsKey !=='icons') {
          this.obj[this.prop] = v;
      } else {
        this.obj[this.prop] = 'fa-solid ' + v;
      }
    
      // this._signal("jreact");
      // this.close();
    },

    cleanVal() {
      this.obj[this.prop] = "";
      this.close();
      // this._signal("jreact");
    },

    updateFilter(value) {
      console.log("value:", value);
      this.filter = value;
      this.applyFilter();
      // this._signal("jreact");
    },

    applyFilter() {
      // only for icons
      if (this.opsKey !== "icons") {
        this.filteredOps = this.ops;
        return;
      }

      const search = (this.filter || "").trim().toLowerCase();
      console.log("this.filter:", this.filter);

      // no filter or too short = show all
      if (!search || search.length < 2) {
        this.filteredOps = this.ops;
        return;
      }

      this.filteredOps = this.ops.filter(icon =>
        icon.toLowerCase().includes(search)
      );
    }
  },

  mount() {
    if (options_picker[this.ops]) {
      this.opsKey = this.ops;
      this.ops = options_picker[this.ops];
    } else {
      this.opsKey = "";
      this.ops = [];
    }
    // console.log("this.opsKey:", this.opsKey);
    // console.log("this.ops:", this.ops);

    // initial filtered list
    this.filteredOps = this.ops;

    const onDocClick = e => {
      if (!this.contains(e.target)) this.close();
    };

    document.addEventListener("click", onDocClick, true);

    // if later you add destroy/unmount, remove listener there
    // this._onDestroy?.(() => document.removeEventListener("click", onDocClick, true));
  }
});
