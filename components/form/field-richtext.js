jet({
  name: "field-richtext",

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
            <span>{ __('Text') }</span>
          </button>
        </div>
      </div>
      <div
        id="editor-area"
        class="editor-area"
        contenteditable="true"
        on-input="editorValue()"
        on-blur="editorValue()"
      ></div>
    </div>

    <div j-if="mode=='text'" class="editor-wrap">
      <div class="editor-toolbar jc-e">
        <button type="button" on-click="toggleMode()">
          <i class="fa-solid fa-pen"></i>
          <span>{ __('Editor') }</span>
        </button>
      </div>
      <textarea
        rows="{rows}"
        cols="{cols}"
        spellcheck="false"
        on-input="textValue()"
        on-blur="textValue()"
      ></textarea>
    </div>
  `,

methods: {
  makeDraggable() {
    const editor = this.querySelector(".editor-area");
    if (!editor) return;

    Array.from(editor.children).forEach((el) => {
      el.setAttribute("draggable", "true");
      el.setAttribute("data-drag-item", "true");
    });

    if (this._dragReady) return;
    this._dragReady = true;

    this._dragItem = null;

    editor.addEventListener("mousedown", (evt) => {
      const item = evt.target.closest("[data-drag-item]");
      if (!item || item.parentNode !== editor) {
        this._dragItem = null;
        return;
      }

      this._dragItem = item;
    });

    editor.addEventListener("dragstart", (evt) => {
      const item = evt.target.closest("[data-drag-item]") || this._dragItem;

      if (!item || item.parentNode !== editor) {
        evt.preventDefault();
        return;
      }

      this._dragItem = item;
      item.classList.add("selected");

      if (evt.dataTransfer) {
        evt.dataTransfer.effectAllowed = "move";
        evt.dataTransfer.setData("text/plain", "drag");
      }
    });

    editor.addEventListener("dragover", (evt) => {
      evt.preventDefault();

      const active = this._dragItem;
      if (!active) return;

      const current = evt.target.closest("[data-drag-item]");
      if (!current || current === active || current.parentNode !== editor) return;

      const next = this.getDragInsertPosition(current, evt.clientY);

      if (next === active) return;
      if (next && next.previousElementSibling === active) return;

      editor.insertBefore(active, next);
    });

    editor.addEventListener("drop", (evt) => {
      evt.preventDefault();
      this.clearDragState();
      this.editorValue();
    });

    editor.addEventListener("dragend", () => {
      this.clearDragState();
      this.editorValue();
    });
  },

  getDragInsertPosition(currentElement, cursorY) {
    const rect = currentElement.getBoundingClientRect();
    const centerY = rect.top + rect.height / 2;

    return cursorY < centerY
      ? currentElement
      : currentElement.nextElementSibling;
  },

  clearDragState() {
    const editor = this.querySelector(".editor-area");
    if (!editor) return;

    editor.querySelectorAll(".selected").forEach((el) => {
      el.classList.remove("selected");
    });

    this._dragItem = null;
  },

  cleanEditorHtml(html) {
    if (!html) return "";

    const wrap = document.createElement("div");
    wrap.innerHTML = html;

    wrap.querySelectorAll("[data-drag-item]").forEach((el) => {
      el.removeAttribute("data-drag-item");
    });

    wrap.querySelectorAll("[draggable]").forEach((el) => {
      el.removeAttribute("draggable");
    });

    wrap.querySelectorAll(".selected").forEach((el) => {
      el.classList.remove("selected");
    });

    return wrap.innerHTML;
  },

  doLink() {
    const url = prompt("Enter a URL", "http://");
    if (!url) return;

    document.execCommand("createLink", false, url);
    this.makeDraggable();
    this.editorValue();
  },

  getValue() {
    return this.obj?.[this.prop] ?? "";
  },

  setValue(v) {
    if (!this.obj || !this.prop) return;

    const clean = this.cleanEditorHtml(v ?? "");
    this.obj[this.prop] = clean;
    this.dispatchEvent(new Event("jreact", { bubbles: true }));
  },

  pullCurrentValue() {
    if (this.mode === "editor") {
      const editor = this.querySelector(".editor-area");
      if (editor) this.setValue(editor.innerHTML);
    } else {
      const text = this.querySelector("textarea");
      if (text) this.setValue(text.value);
    }
  },

  syncValue() {
    const value = this.getValue();

    if (this.mode === "editor") {
      const editor = this.querySelector(".editor-area");
      if (editor && editor.innerHTML !== value) {
        editor.innerHTML = value || "<p></p>";
      }

      this.makeDraggable();
    } else {
      const text = this.querySelector("textarea");
      if (text && text.value !== value) {
        text.value = value;
      }
    }
  },

  syncAfterRender() {
    requestAnimationFrame(() => {
      this.syncValue();
    });
  },

  focusEditor() {
    const editor = this.querySelector(".editor-area");
    if (editor) editor.focus();
  },

  command(command, value = null) {
    if (this.mode !== "editor") return;

    const editor = this.querySelector(".editor-area");
    if (!editor) return;

    editor.focus();

    try {
      document.execCommand(command, false, value);
    } catch (err) {
      console.warn("Command failed:", command, err);
    }

    this.makeDraggable();
    this.editorValue();
    editor.focus();
  },

  toggleMode() {
    this.pullCurrentValue();
    this.mode = this.mode === "editor" ? "text" : "editor";
    this.syncAfterRender();
  },

  editorValue() {
    const editor = this.querySelector(".editor-area");
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
    // alert('Works');
    this.syncAfterRender();
    // this.makeDraggable();
    // const allElements = document.querySelectorAll("#editor-area *");
    // for (const el of allElements) {
    //   el.draggable = true;
    // }
  }
});
