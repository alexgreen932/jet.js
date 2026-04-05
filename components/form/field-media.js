jet({
  name: "field-media",

  data: {
    ops: [], // array of options to render
    opsKey: "", // (optional) remember which group we used (icons/col/etc)
    show_it: false,
    show_it: true,
    val: null
  },

  tpl: html`
    <div class="field-picker-wrap">
      <div class="field-picker">
        <div class="d-select {cls(show_it)}" on-click="toggle()">
          <div class="fg-1">
            <span j-if="noVal()">{__('Select')}</span>
            <span j-if="hasVal()">{__('Change')}</span>
            <br />dev---{hasVal()}
          </div>
        </div>

        <div class="d-del fs-8" on-click="cleanVal()">
          <i class="fa-solid fa-xmark"></i>
        </div>
      </div>
    </div>
    <media-manager j-if="show_it" d-close="show_it"></media-manager>
  `,

  methods: {
    cls(v) {
      return v ? "doClose" : "doOpen";
    },
    noVal() {
      // const v = this.obj[this.prop] ? false : true;
      return this.obj[this.prop] ? false : true;
    },
    hasVal() {
      return this.obj[this.prop];
    },

    toggle() {
      this.show_it = !this.show_it;
      this.$r;
    },

    close() {
      if (!this.show_it) return;
      this.show_it = false;
      this.$s;
    },

    selectItem(v) {
      this.obj[this.prop] = v;
      this.$s;
      //   this.close();
    },

    cleanVal() {
      this.obj[this.prop] = "";
      this.close();
      this.$s;
      this.$r;
    }
  },

  mount() {
    this.val = this.obj[this.prop];
    //todo maybe preselect ops for video, zip, etc

    // ✅ close if click is outside this component
    const onDocClick = e => {
      // "this" here is the component because arrow fn keeps lexical this
      if (!this.contains(e.target)) this.close();
    };

    // Use capture so it also closes even if something stops propagation inside
    document.addEventListener("click", onDocClick, true);

    // Optional: if your framework has unmount/destroy — remove listener there
    // this._onDestroy?.(() => document.removeEventListener("click", onDocClick, true));
  }
});

//---------------------------------
jet({
  name: "media-manager",
  //   static: true,
  data: {
    display_as: "grid",
    files: null,
    selected: null
  },
  static: true,
  _save: [["display_as", "media_manager_display_type"]],
  tpl: html`
    <div class="bg-aside">
      <div class="media-manager">
        <div class="d-main">
          <div class="d-header">
            <select
              j-model="filter_type"
              @change="$seveLocal(filter_type, 'mm_layout_state')"
            >
              <option value="">All</option>
              <j-for data=""> </j-for>
              <option v-for="o in options" :key="o" :value="o">{ o }</option>
            </select>
            <input
              type="text"
              j-model="filter_input"
              :placeholder="__('Filter by name')"
            />
            <button on-click="loadFiles">Reload</button>
            <div class="ai-c g-05">
              <label for="files" class="c-white">Upload Files</label>
              <input
                id="files"
                class="p-0"
                type="file"
                on-change="uploadFile($event)"
              />
            </div>
          </div>
          <ul class="d-files {display_as}">
            <j-for data="files">
              <!-- <li on-click="selected=[$name];$s_('image-update')"> -->
              <li on-click="preSelect([$name])">
                <div class="ea-contents" j-if="display_as == 'grid'">
                  <img src="{thumb([$url], [$type])}" />
                  <span>[name]</span>
                </div>
                <div class="ea-contents" j-if="display_as == 'list'">
                  [name]
                </div>
              </li>
            </j-for>
          </ul>
        </div>

        <div class="d-sidebar">
          <div class="d-set">
            <button class="but-indigo br-3" on-click="closeManager()">
              { __('Close') }
            </button>
            <button j-if="display_as=='list'" class="but-teal br-3 fs-11" on-click="displayAs('grid')">
              { __('Display as Grid') }
            </button>
            <button j-if="display_as=='grid'" class="but-teal br-3 fs-11" on-click="displayAs('list')">
              { __('Display as List') }
            </button>
            <!-- <select j-model="display_as" om-input="re()">
              <option value="grid">{ __('Display as Grid') }</option>
              <option value="list">{ __('Display as List') }</option>
            </select> -->
          </div>
          <div class="d-set">
          --{selected}
          <mm-image d-selected="selected"></mm-image>
            <!-- <div j-if="selected">
              <div class="d-preview">
                <img src="media/{selected}" />
                <div class="mm-selected-box">
                  { __('Selected') } <span>{selected}</span>
                </div>
              </div>
            </div> -->

            <button
              class="but-blue br-3"
              :disabled="!selected"
              on-click="$emit('update:modelValue', selectedPath()), $emit('close')"
            >
              { __('Select') }
            </button>
          </div>
        </div>
      </div>
    </div>
  `,

  methods: {
    displayAs(v){
      this.display_as = v;
      this.$r;
    },
    // re(){
    // console.log('re:');
    //   this.render();
    // },
    preSelect(v){
      this.selected = v;
      this._signal('image-update');
    },
    // loadFiles() {
    //   console.log("${this.src}/index.json: ", `${this.src}/index.json`);
    //   let f = "index.php";
    //   f = "index.json"; //dev in html
    //   //todo !!  to .php on prod
    //   //   fetch(`${this.src}/${f}`)
    //   //     .then(res => res.json())
    //   //     .then(data => (this.files = data));
    //   console.log("this.files: ", this.files);
    // }
    getFileId(name) {
      return name.replace(/\./g, "-").replace(/\s+/g, "-");
    },
    thumb(file, type) {
      // console.log('file:', file);
      // console.log('type:', type);
      const ext = type.toLowerCase();
      if (["jpg", "jpeg", "png", "gif", "webp"].includes(ext)) {
        return file; // direct image preview
      }
      if (["mp4", "mov", "avi", "webm"].includes(ext)) {
        return "media/icons/video.png"; // generic video icon
      }
      if (["zip", "rar", "7z", "tar", "gz"].includes(ext)) {
        return "media/icons/zip.png"; // generic archive icon
      }
      return "media/icons/file.png"; // fallback generic file icon
    },
    closeManager() {
      this.close = false;
      console.log("this.close:", this.close);
      // this.$s;
      this._signal("jsidebar");
    }
  },
  async mount() {
    console.log("this.close:", this.close);
    // let url = 'media/index.json';//prod mode
    let url = "media/index.json"; //dev mode
    this.files = await this._fetch(this._base(url));
    console.log("this.files:", this.files);
    this.$r;
  }
});

jet({
  name: "mm-image",
  ls: "image-update",
  tpl: html`
    <div j-if="selected">
      <div class="d-preview">
        <img src="media/{selected}" />
        <div class="mm-selected-box">
          { __('Selected') } <span>{selected}</span>
        </div>
      </div>
    </div>
  `
});
