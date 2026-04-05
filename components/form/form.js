import "./field-input.js";
import "./field-checkbox.js";
import "./field-input-i.js";
import "./field-textarea.js";
import "./field-encoded.js";
import "./field-select.js";
import "./field-picker.js";
// import "./field-animate.js";
import "./field-range.js";
import "./field-media.js";
import "./field-editor.js";
import "./field-icons.js";

import "./field-richtext.js";

/**
 * ALPHA version
 * some options are experemental
 * some should be improved
 * some deleted
 */
jet({
  name: "jet-form",
  data: {
    fieldsProcessed: [],
    sortedFields: [],
    obj: null, // points to el[path] like el.st
    show: true
  },
  // save: [["show", "save_key_toogle_form"]],
  tpl: html`
    <div class="jf-root form-box {cls}">
      <h3 j-if="title" class="form-title">
        <span j-if="!toggle">{title}</span>
        <span j-if="toggle" class="fg-1 j-click" on-click="show=!show">{title}</span>
        <span j-if="toggle" on-click="show=!show">
          <i j-if="show" class="fa-solid fa-chevron-up"></i>
          <i j-if="!show" class="fa-solid fa-chevron-down"></i>
        </span>
      </h3>
      <div j-if="noToggled()" class="jet-form-fields">
        <j-for data="fieldsProcessed">
          <div class="form-field [type]">
            <label j-if="[$title]" for="[key]">[title]</label>
            <j-tag
              type="[type]"
              prefix="field-"
              d-obj="obj"
              s-prop="[key]"
              s-ops="[ops]"
            ></j-tag>
          </div>
        </j-for>
      </div>
    </div>
  `,

  methods: {
    noToggled() {
      if (!this.toggle) return true; //skip if no props toggle

      if (this.show) {
        return true;
      } else {
        return false;
      }
    },
    addMissedFields() {
      //todo!!! refactor
      // this.fieldsProcessed = this.fields;

      let existingFields = [];
      //form may have no fields
      if (this.fields) {
        existingFields = this.fields.map(v => {
          return v.key;
        });
        //console.log("existingFields:", existingFields);
      }

      const fields = [];

      const keys = Object.keys(this.obj);

      keys.forEach(k => {
        if (existingFields.includes(k)) {
          this.fields.forEach(f => {
            if (f.key === k) {
              fields.push(f);
            }
          });
        } else {
          let field = {
            title: k,
            key: k,
            type: "input"
          };
          fields.push(field);
        }
      });

      this.fieldsProcessed = fields;
    },
    filterExistingKeys(){
      const fields = [];

      const keys = Object.keys(this.obj);

      this.all.forEach(field => {
        //console.log("value:", field.key);
        if (keys.includes(field.key)) {
          fields.push(field);
        }
      });
      return fields;
    },


  },

  mount() {
    //console.log('this.all:', this.all);
    //if has a bungle(d-all=this.all) of fields but should use only fields which object has keys - then via d-all
    if (this.all) {
      this.fields = this.filterExistingKeys();
    }
    this.addMissedFields();
    if (this.toggled) {
      this.show = false;
    }

  },
  css: `
  .form-title{
    display: flex;
    justify-content: space-between;
    align-items: center;
}
    .form-title i{font-size:1rem;cursor:pointer}
  `
});
