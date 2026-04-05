jet({
  name: "field-editor",

  data: {
    rows: 8,
    cols: 20,
    mode: "editor", // editor | text

    // simple link popup
    show_link_popup: false,
    link_text: "",
    link_url: "",

    // saved selection for link dialog
    saved_range: null,
    saved_text: ""
  },

  tpl: html`
    <div j-if="mode=='editor'" class="editor-all-wrap">
      <div class="editor-toolbar jc-b">
        <div class="d-icons">
          <!-- Undo / Redo -->
          <button type="button" title="Undo" on-click="command('undo')">
            <i class="fa-solid fa-rotate-left"></i>
          </button>
          <button type="button" title="Redo" on-click="command('redo')">
            <i class="fa-solid fa-rotate-right"></i>
          </button>

          <!-- Text styles -->
          <button type="button" title="Bold" on-click="command('bold')">
            <b>B</b>
          </button>
          <button type="button" title="Italic" on-click="command('italic')">
            <i>I</i>
          </button>
          <button
            type="button"
            title="Underline"
            on-click="command('underline')"
          >
            <u>U</u>
          </button>

          <!-- Lists -->
          <button
            type="button"
            title="Ordered list"
            on-click="command('insertOrderedList')"
          >
            <i class="fa-solid fa-list-ol"></i>
          </button>
          <button
            type="button"
            title="Unordered list"
            on-click="command('insertUnorderedList')"
          >
            <i class="fa-solid fa-list-ul"></i>
          </button>

          <!-- Align -->
          <button
            type="button"
            title="Align left"
            on-click="command('justifyLeft')"
          >
            <i class="fa-solid fa-align-left"></i>
          </button>
          <button
            type="button"
            title="Align center"
            on-click="command('justifyCenter')"
          >
            <i class="fa-solid fa-align-center"></i>
          </button>
          <button
            type="button"
            title="Align right"
            on-click="command('justifyRight')"
          >
            <i class="fa-solid fa-align-right"></i>
          </button>
          <button
            type="button"
            title="Justify"
            on-click="command('justifyFull')"
          >
            <i class="fa-solid fa-align-justify"></i>
          </button>

          <!-- Link -->
          <button type="button" title="Insert link" on-click="doLink()">
            <i class="fa-solid fa-link"></i>
          </button>
          <button
            type="button"
            title="Remove link"
            on-click="command('unlink')"
          >
            <i class="fa-solid fa-link-slash"></i>
          </button>

          <!-- Remove formatting -->
          <button
            type="button"
            title="Remove formatting"
            on-click="command('removeFormat')"
          >
            <i class="fa-solid fa-eraser"></i>
          </button>
        </div>

        <!-- Switch mode -->
        <div class="d-icons">
          <button j-if="mode=='editor'" type="button" on-click="toggleMode()">
            <i class="fa-solid fa-code"></i>
          </button>
        </div>
      </div>
      <div
        class="inline-field"
        contenteditable="true"
        on-input="editorValue()"
        on-blur="editorValue()"
      ></div>
    </div>

    <div j-if="mode=='text'" class="editor-wrap" j-if="mode=='text'">
      <div class="editor-toolbar jc-e">
        <button type="button" on-click="toggleMode()">
          <i class="fa-solid fa-pen"></i>
        </button>
      </div>
      <textarea
        class="editor-textarea"
        rows="{rows}"
        cols="{cols}"
        spellcheck="false"
        on-input="textValue()"
        on-blur="textValue()"
      ></textarea>
    </div>
  `,

  methods: {
    //link
    doLink() {
      document.execCommand("createLink", prompt("Enter a URL", "http://"));
    },
    /* -----------------------------------------
       Small helpers
    ----------------------------------------- */

    getValue() {
      return this.obj?.[this.prop] ?? "";
    },

    setValue(v) {
      if (!this.obj || !this.prop) return;
      this.obj[this.prop] = v ?? "";
      this.dispatchEvent(new Event("jreact", { bubbles: true }));
    },

    // Read value from currently visible control
    pullCurrentValue() {
      if (this.mode === "editor") {
        const editor = this.querySelector(".inline-field");
        if (editor) this.setValue(editor.innerHTML);
      } else {
        const text = this.querySelector("textarea");
        if (text) this.setValue(text.value);
      }
    },

    // Write saved value into currently visible control
    syncValue() {
      const value = this.getValue();

      if (this.mode === "editor") {
        const editor = this.querySelector(".inline-field");
        if (editor && editor.innerHTML !== value) {
          editor.innerHTML = value || "<p></p>";
        }
      } else {
        const text = this.querySelector("textarea");
        if (text && text.value !== value) {
          text.value = value;
        }
      }
    },

    // Needed because j-if recreates DOM
    syncAfterRender() {
      requestAnimationFrame(() => {
        this.syncValue();
      });
    },

    focusEditor() {
      const editor = this.querySelector(".inline-field");
      if (editor) editor.focus();
    },

    /* -----------------------------------------
       Main editor logic
    ----------------------------------------- */

    command(command, value = null) {
      if (this.mode !== "editor") return;

      const editor = this.querySelector(".inline-field");
      if (!editor) return;

      editor.focus();

      try {
        document.execCommand(command, false, value);
      } catch (err) {
        console.warn("Command failed:", command, err);
      }

      this.editorValue();
      editor.focus();
    },

    toggleMode() {
      // save current mode content
      this.pullCurrentValue();

      // switch mode
      this.mode = this.mode === "editor" ? "text" : "editor";

      // wait until new DOM appears, then sync
      this.syncAfterRender();
    },

    editorValue() {
      const editor = this.querySelector(".inline-field");
      if (!editor) return;
      this.setValue(editor.innerHTML);
    },

    textValue() {
      const text = this.querySelector("textarea");
      if (!text) return;
      this.setValue(text.value);
    }
  },

  mount() {
    this.syncAfterRender();
  }
});
