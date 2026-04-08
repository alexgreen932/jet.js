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
 * some options are experimental
 * some should be improved
 * some deleted
 */
jet({
  name: "jet-form",
  data: {
    fieldsProcessed: [],
    obj: null,
    show: true
  },

  tpl: html`
    <div class="jf-root form-box {cls}">
      <h3 j-if="title" class="form-title">
        <span j-if="!toggle">{title}</span>

        <span j-if="toggle" class="fg-1 j-click" on-click="show=!show">
          {title}
        </span>

        <span j-if="toggle" on-click="show=!show">
          <i j-if="show" class="fa-solid fa-chevron-up"></i>
          <i j-if="!show" class="fa-solid fa-chevron-down"></i>
        </span>
      </h3>

      <div j-if="noToggled()" class="jet-form-fields">
        <j-for data="fieldsProcessed">
          <div class="form-field [type]">
            <label j-if="[title]" for="[key]">[title]</label>

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
      if (!this.toggle) return true;
      return !!this.show;
    },

    /**
     * Build final array of fields for render.
     *
     * Modes:
     * 1. selected -> render only selected fields existing in object
     * 2. fields    -> render configured fields + missed object keys as default inputs
     * 3. none      -> render all object keys as default inputs
     */
    buildFields() {
      if (!this.obj || typeof this.obj !== "object") {
        this.fieldsProcessed = [];
        return;
      }

      const objKeys = Object.keys(this.obj);
      const processed = [];

      // ---------------------------------------
      // MODE 1: selected
      // render ONLY selected fields
      // ---------------------------------------
      if (Array.isArray(this.selected) && this.selected.length) {
        this.selected.forEach(field => {
          if (!field?.key) return;
          if (!objKeys.includes(field.key)) return;

          processed.push({
            title: field.title ?? field.key,
            key: field.key,
            type: field.type ?? "input",
            ops: field.ops ?? ""
          });
        });

        this.fieldsProcessed = processed;
        return;
      }

      // ---------------------------------------
      // MODE 2: fields
      // render configured fields if object has such key
      // then auto-add missed keys from object
      // ---------------------------------------
      if (Array.isArray(this.fields) && this.fields.length) {
        const existingConfiguredKeys = [];

        this.fields.forEach(field => {
          if (!field?.key) return;
          if (!objKeys.includes(field.key)) return;

          existingConfiguredKeys.push(field.key);

          processed.push({
            title: field.title ?? field.key,
            key: field.key,
            type: field.type ?? "input",
            ops: field.ops ?? ""
          });
        });

        // add missed keys from object as simple input fields
        objKeys.forEach(key => {
          if (existingConfiguredKeys.includes(key)) return;

          processed.push({
            title: key,
            key,
            type: "input",
            ops: ""
          });
        });

        this.fieldsProcessed = processed;
        return;
      }

      // ---------------------------------------
      // MODE 3: no fields at all
      // render all object keys as simple inputs
      // ---------------------------------------
      objKeys.forEach(key => {
        processed.push({
          title: key,
          key,
          type: "input",
          ops: ""
        });
      });

      this.fieldsProcessed = processed;
    }
  },

  mount() {
    this.buildFields();

    // was: this.toggled
    // but in template/methods you use "toggle"
    if (this.toggle) {
      this.show = false;
    }
  },

  css: `
    .form-title{
      display:flex;
      justify-content:space-between;
      align-items:center
    }
    .form-title i{
      font-size:1rem;
      cursor:pointer
    }
  `
});