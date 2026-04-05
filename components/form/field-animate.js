import { options_picker } from "../../app/data/options_picker.js";

jet({
  name: "field-animate",
  data: {
    ops: [],        // array of options to render
    opsKey: "",     // (optional) remember which group we used (icons/col/etc)
    show_it: false,
    current: '',
  },

  tpl: html`
    <div class="field-picker-wrap d-animation">
        <div j-if="current" class="d-current">
          {current}
        </div>
        <div j-if="current" class="d-del" on-click="cleanVal()">
          <i class="fa-solid fa-xmark"></i> {__('No Animation')}
        </div>
      <div class="picker-box">
        <ul class="{opsKey}">
          <j-for data="ops">
            <li class="[v]" on-click="selectItem([$v])">[v]</li>
          </j-for>
        </ul>
      </div>
        <div class="d-current" on-click="render()">
         <i class="fa-solid fa-repeat"></i> {__('Repeat')}
        </div>
    </div>
  `,

  methods: {

    selectItem(v) {
      this.obj[this.prop] = v;
      this.current = v;
      this._signal();
    },

    cleanVal() {
      this.obj[this.prop] = "";
      this.current = '';
      this._signal();
    }
  },

  mount() {
    //todo!!! check for group
    // Resolve options list by key (this.ops is likely passed as a string prop)
    if (options_picker[this.ops]) {
      this.opsKey = this.ops;
      this.ops = options_picker[this.ops];
    } else {
      this.opsKey = "";
    }

    // ✅ close if click is outside this component
    const onDocClick = (e) => {
      // "this" here is the component because arrow fn keeps lexical this
      if (!this.contains(e.target)) this.close();
    };

    // Use capture so it also closes even if something stops propagation inside
    document.addEventListener("click", onDocClick, true);

    // Optional: if your framework has unmount/destroy — remove listener there
    // this._onDestroy?.(() => document.removeEventListener("click", onDocClick, true));
    this.current = this.obj[this.prop];
  }
});