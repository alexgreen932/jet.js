// const prefixMap = {
//   blur: "fb-",
//   opacity: "o-",
//   fs: "fs-",
//   height: "h",
//   height_rem: "hr",
//   line_height: "lh",
//   width: "w",
//   br: "br-",
//   showVal: "",
//   pre: null,
//   post: null
// };

jet({
  name: "field-range",
  data: {
    min: 0,
    max: 10,
    step: 1,
    prefix: "",
    cls: ""
  },
  static: true,
  tpl: html`
    <input type="range" min="{min}" max="{max}" step="{step}" /> ---{cls}
  `,
  methods: {
    initializeOps() {
      this.prefix = this.ops + "-";

      //if not default min/max/step
      switch (this.ops) {
        case "br":
          this.min = 0;
          this.max = 50;
          this.step = 1;
          break;
        case "fs":
          this.min = 8;
          this.max = 50;
          break;
        case "abs_pos":
          this.min = -200;
          this.max = 200;
          break;
        case "opacity":
          // this.pre = '0.';//todo
          break;
        default:
          this.min = 0;
          this.max = 10;
          this.step = 1;
          break;
      }
    },
    numVal(v) {
      if (!v) return 0;
      return v.replace(this.prefix, "");
    },
    returnClass(v) {
      return this.prefix + v;
    }
  },
  mount() {
    //dev
    this.ops;
    console.log(`%c Ops "${this.ops}"`, $.st.blue);

    //initilize ops
    this.initializeOps();
    // this.render();
    this.$r;
    //---
    const inp = this.querySelector("input");
    if (!inp) return;

    // initial value
    inp.value = this.numVal(this.obj?.[this.prop]);
    // console.log('numVal(this.obj?.[this.prop]):', this.numVal(this.obj?.[this.prop]));

    inp.addEventListener("input", e => {
      if (!this.obj || !this.prop) return;
      this.cls = this.returnClass(e.target.value); // ✅ hits Proxy.set in parent data
      this.obj[this.prop] = this.cls; // ✅ hits Proxy.set in parent data
      // console.log('this.returnClass(e.target.value):', this.returnClass(e.target.value));
      this.$s;
    });
  }
});

// function numVal(){}
// function returnClass(){},
