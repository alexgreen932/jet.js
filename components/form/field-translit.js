jet({
  name: "field-input",
  static: true,
  tpl: html`
    <input type="text" />
  `,
  methods: {
    inputType() {
      return this.ops ? this.ops : "text";
    }
  },
  mount() {
    const inp = this.querySelector("input");
    if (!inp) return;

    // initial value
    inp.value = this.obj?.[this.prop] ?? "";

    inp.addEventListener("input", e => {
      if (!this.obj || !this.prop) return;
      this.obj[this.prop] = e.target.value; // ✅ hits Proxy.set in parent data
      this._signal();

      //todo!!! TEMP solution send signal after delay for it do not jumping. It gives a delay

      // setTimeout(() => {
      //   let item = this.querySelector("input");
      //   let loader = this.querySelector(".save-loader ");
      //   if (!loader) {
      //     item.insertAdjacentHTML(
      //       "beforebegin",
      //       `<div class="save-loader"></div>`
      //     );
      //   }
      //   setTimeout(() => {
      //     this._signal();
      //   }, 600);
      // }, 3000);
    });
  }
});
