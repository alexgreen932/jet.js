import { options } from "./helpers/options.js";

jet({
  name: "field-select",

  data: {
    ops: [],
    modelPath: "", // becomes "obj.bg", "obj.p", ...
  },

  tpl: html`
    <select id="field-{__jid}" j-model="{modelPath}">
      <j-for data="ops">
        <option value="[v]">[t]</option>
      </j-for>
    </select>
  `,

  methods: {
    customOps(str) {
      // format: "'Text':'value','Text2':'value2'"
      const items = String(str).split(",");
      const arr = [];

      items.forEach((it) => {
      //console.log('it:', it);
        const [key, val] = it.split(":");
        //console.log('key:', key);
        //console.log('val:', val);
        if (!key || !val) return;

        arr.push({
          t: key.trim().slice(1, -1),
          v: val.trim().slice(1, -1),
        });
      });

      this.ops = arr;
    },
  },

  mount() {
    // build the real binding path for j-model
    // s-prop="bg" => modelPath="obj.bg"
    if (this.prop) this.modelPath = `obj.${this.prop}`;
    // load options
    const attr = this.getAttribute("s-ops") || "";
    //console.log('attr:', attr);

    if (attr.includes(",")) {
      this.customOps(attr);
    } else if (options[attr]) {
      this.ops = options[attr];
    }
  },
});