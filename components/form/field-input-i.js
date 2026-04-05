jet({
  name: "field-input-i",
  data: {
    tag: null
  },
  tpl: html`
    <span class="inline-field" contenteditable="true" on-input="updateValue()"></span>
  `,
  methods: {
    updateValue() {
      //console.log("updateValue works");
      const field = this.querySelector(".inline-field");
      let v = field.innerText;
      this.obj[this.prop] = v;
      this.dispatchEvent(new Event("jreact", { bubbles: true }));
    }
  },
  mount() {
    //console.log(`${this.tagName} Log obj  =>>>>`, this.obj);
    //console.log(`${this.tagName} Log prop >>>`, this.prop);
    //console.log(`${this.tagName} Log ops ------->>>`, this.ops);
    const field = this.querySelector(".inline-field");
    field.innerText = this.obj[this.prop];
    this.tag = this.ops;
    // const inp = this.querySelector("input");
    // if (!inp) return;

    // // initial value
    // inp.value = this.obj?.[this.prop] ?? "";

    // inp.addEventListener("input", e => {
    //   if (!this.obj || !this.prop) return;
    //   this.obj[this.prop] = e.target.value; // ✅ hits Proxy.set in parent data
    //   this._signal();
    // });
  }
});
