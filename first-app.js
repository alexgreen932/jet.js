jet({
  name: "first-app",
  data: {
    menu: [
      { title: "Home", url: "#", target: "_self" },
      {
        title: "Documentation",
        url: "http://magicjet.org/jet-js/",
        target: "_blank"
      }
    ]
  },
  tpl: html`
    <div class="w-container-c jc-c g-1 b-blue-grey-d2 c-white br-5 p-2">
      <h1>Jet.Min.Js</h1>
      <div class="fd-c g-1">
        <a j-for="menu" href="[e.url]" target="[e.target]">[e.title]</a>
      </div>
    </div>
  `
});
