jet({
  name: "field-encoded",
  data: { rows: 4, cols: 20 },

  // no {val} inside
  tpl: html`<textarea rows="{rows}" cols="{cols}"></textarea>`,

  methods: {
    fieldOps() {
      this.rows = this.ops?.[0] ?? 5;
      this.cols = this.ops?.[1] ?? 20;
    },

    syncValue() {
      const el = this.querySelector("textarea");
      if (!el) return;
      el.value = decodeURIComponent(this.obj?.[this.prop]) ?? "";
    }
  },

  mount() {
    this.fieldOps();

    // 🔥 important: wait until possible rerender from fieldOps finishes
    queueMicrotask(() => {
      this.syncValue();

      const el = this.querySelector("textarea");
      if (!el) return;

      el.addEventListener("input", (e) => {
        if (!this.obj || !this.prop) return;
        this.obj[this.prop] = encodeURIComponent(e.target.value);
        console.log('encoded ----- ----> ', this.obj[this.prop]);

        if (this.j_r) this.dispatchEvent(new Event("jreact", { bubbles: true }));
      });
    });
  }
});