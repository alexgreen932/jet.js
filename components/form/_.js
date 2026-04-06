jet({
  name: "field-richtext",
  static: true,
  tpl: html`
  <div>
    <button class="raise" onclick="toggleDarkLight()"><i class="fas fa-adjust"></i></button>
    <button class="raise" title="Negrito" onclick="execCmd('bold');"><i class="fas fa-bold"></i></button>
    <button class="raise" onclick="execCmd('italic');"><i class="fas fa-italic"></i></button>
    <button class="raise" onclick="execCmd('underline');"><i class="fas fa-underline"></i></button>
    <button class="raise" onclick="execCmd('removeFormat');"><i class="fas fa-remove-format"></i></button>
    <button class="raise" onclick="execCmd('strikeThrough');"><i class="fas fa-strikethrough"></i></button>
    <button class="raise" onclick="execCmd('justifyLeft');"><i class="fas fa-align-left"></i></button>
    <button class="raise" onclick="execCmd('justifyCenter');"><i class="fas fa-align-center"></i></button>
    <button class="raise" onclick="execCmd('justifyRight');"><i class="fas fa-align-right"></i></button>
    <button class="raise" onclick="execCmd('justifyFull');"><i class="fas fa-align-justify"></i></button>
    <button class="raise" onclick="execCmd('cut');"><i class="fas fa-cut"></i></button>
    <button class="raise" onclick="execCmd('copy');"><i class="fas fa-copy"></i></button>
    <button class="raise" onclick="execCmd('indent');"><i class="fas fa-indent"></i></button>
    <button class="raise" onclick="execCmd('outdent');"><i class="fas fa-outdent"></i></button>
    <button class="raise" onclick="execCmd('subscript');"><i class="fas fa-subscript"></i></button>
    <button class="raise" onclick="execCmd('superscript');"><i class="fas fa-superscript"></i></button>
    <button class="raise" onclick="execCmd('undo');"><i class="fas fa-undo"></i></button>
    <button class="raise" onclick="execCmd('redo');"><i class="fas fa-redo"></i></button>
    <button class="raise" onclick="execCmd('insertUnorderedList');"><i class="fas fa-list-ul"></i></button>
    <button class="raise" onclick="execCmd('insertOrderedList');"><i class="fas fa-list-ol"></i></button>
    <button class="raise" onclick="execCmd('insertParagraph');"><i class="fas fa-paragraph"></i></button>
    <select class="raise" onchange="execCommandWithArg('formatBlock', this.value);">
      <option value="H1">H1</option>
      <option value="H2">H2</option>
      <option value="H3">H3</option>
      <option value="H4">H4</option>
      <option value="H5">H5</option>
      <option value="H6">H6</option>
    </select>
    <button class="raise" onclick="execCmd('insertHorizontalRule');">HR</button>
    <button class="raise" onclick="execCmd('createLink', prompt('Enter a URL', 'http://'));"><i
        class="fas fa-link"></i></button>
    <button class="raise" onclick="execCmd('unlink');"><i class="fas fa-unlink"></i></button>
    <button class="raise" onclick="toggleSource();"><i class="fas fa-code"></i></button>
    <br>
    <button class="raise" onclick="toggleEdit();">Toggle Edit</button>
    <select class="raise" onchange="execCommandWithArg('fontName', this.value);">
      <option value="Arial">Arial</option>
      <option value="Comic Sans MS">Comic Sans MS</option>
      <option value="Courier">Courier</option>
      <option value="Georgia">Georgia</option>
      <option value="Tahoma">Tahoma</option>
      <option value="Times New Roman">Times New Roman</option>
      <option value="Verdana">Verdana</option>
    </select>
    <select class="raise" onchange="execCommandWithArg('fontSize', this.value);">
      <option value="1">1</option>
      <option value="2">2</option>
      <option value="3">3</option>
      <option value="4">4</option>
      <option value="5">5</option>
      <option value="6">6</option>
      <option value="7">7</option>
    </select>
    Fore Color: <input type="color" onchange="execCommandWithArg('foreColor', this.value);">
    Background: <input type="color" onchange="execCommandWithArg('hiliteColor', this.value);">
    <button class="raise" onclick="execCommandWithArg('insertImage', prompt('Enter the image URL', ''));"><i
        class="fas fa-file-image"></i></button>
    <button class="raise" onclick="execCmd('selectAll');">Select All</i></button>
  </div>
  <iframe name="richTextField" style="width: 1200px; height: 1000px;"></iframe>
  `,
  methods: {

  },
  mount() {

  }
});

