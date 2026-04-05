jet({
  name: "demo-save",
  data: { cls: "b-blue-l4" },
  save:[['cls','loc_stor_key']],
  tpl: html`
    <div class="fd-c g-1">
      <h1>Save data to Localstorage</h1>
      <div class="br-8 p-1 {cls}">
        Change background below, and refresh page. You will see that browser
        saved selected background. It's Jet Magic and it's with a single line
      </div>
      <select class="w-30" j-model="cls">
        <option value="b-blue-l4">Blue</option>
        <option value="b-red-l4">Red</option>
        <option value="b-green-l4">Green</option>
      </select>
    </div>
  `
});
