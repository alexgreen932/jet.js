//todo!!! remove if not used

//fields
import './field-input.js';
import './field-textarea.js';
import './field-select.js';

jet({
    name: "form-fields",
    data: { fields: [], },
    static: true,
    tpl: html`
    <j-for data="fields">
     <div class="form-field">
        <label>[title]</label>
        <j-tag
        type="[type]"
        prefix="field-"
        d-obj="obj"
        s-prop="[key]"
        s-ops="[ops]"
        >
        </j-tag>
      </div>
    </j-for>
  `,
    mount() {

        // //////console.log('this.obj.text - in form-fields:', this.obj.text);
        if (this.preset) {
            let key = this.obj_key;
            this.obj = this.root_obj[key];
            console.log('this.obj processed ----', this.obj);
            this.fields = returnFields(this.obj);
            // console.log('this.fields :', this.fields );
        } else {
            this.fields = this.props_fields;//had to do via props_fields not dorectly as it does,t change if fields are in data, if remove from data it doesn't renders for presets
        }
        // this.render();
        // this._preset_type
        // console.log('this.preset:', this.preset);
        // console.log('------ in form-fields:', this.item);
        console.log('obj ------ in form-fields:', this.obj);
        // this.fields = this.fields;
        console.log('this.fields ------ in form-fields:', this.fields);
        // console.log('fields ------ in form-fields:', this.fields);



        // ✅ force one render after fields computed
        this.render();

    }
});



function returnFields(obj) {
    // console.log('-------------------- obj in returnFields', obj);
    let fields = [];

    //get existing keys
    let keys = Object.keys(obj);
    // ////console.log('keys:', keys);
    keys.forEach((e) => {
        //////console.log('e:', e);
        //key exist in fields_preset
        //todo for e !== 'ja' too
        if (e !== 'ja') {
            if (e in $.fields) {
                let field = $.fields[e];
                fields.push(field);
            }
        }

    })
    return fields;
}
