jet({
  name: "field-checkbox",

  tpl: html`
    <input id="{prop}" type="checkbox" />
  `,

  mount() {
    const inp = this.querySelector("input");
    if (!inp) return;

    // ✅ set initial checked state
    inp.checked = !!this.obj?.[this.prop];
    console.log('this.obj:', this.obj);
    console.log('this.prop:', this.prop);
    // console.log('this.obj?.[this.prop]-----', this.obj.[this.prop]);

    // ✅ update data on change
    inp.addEventListener("change", e => {
      if (!this.obj || !this.prop) return;

      this.obj[this.prop] = e.target.checked;
      // this.$s();
    // console.log('this.obj?.[this.prop]:', this.obj.[this.prop]);
    });
  }
});