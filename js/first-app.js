jet({
  name: "first-app",
  data: {
    menu: [
      { title: "Home", url: "#", target: "_self" },
      { title: "Examples", url: "tests/", target: "_self" },
      {
        title: "Documentation",
        url: "http://magicjet.org/jet-js/",
        target: "_blank"
      }
    ]
  },
  tpl: html`
    <div class="w-container-c ai-c g-1 b-white br-5 p-2 bs-3">
      <img src="img/logo.svg" width="300"/>
      <h1 class="e-flame">Jet.Js</h1>
      <div class="gr-3 g-1">
      <j-for data="menu">
        <a href="[url]" class="but-cyan ph-2 br-5" target="[target]">[title]</a>
      </j-for>
      </div>
    </div>
  `
});
