import "./components/hello-world.js";
import "./components/demo-todos.js";
import "./components/demo-form.js";

jet({
  name: "demo-apps",
  data: {
    menu: ["Hello World", "Todos", "Form"],
    idx: 0,
    current: "Hello World"
  },
  //save current index and val in localstorage - jet-core magic
  save:[['idx', 'localstorage_key_idx'],['current', 'localstorage_key_current']],
  tpl: html`
    <div class="p-1" style="margin-left:320px">

      <hello-world j-if="current=='Hello World'"></hello-world>
      <demo-todos j-if="current=='Todos'"></demo-todos>
      <demo-form j-if="current=='Form'"></demo-form>

    </div>
    <div class="menu p-1 b-blue-grey-l5 fd-c ai-c">
    <img src="../img/logo.svg" width=200 />
      <j-for data="menu">
      <a class="w-100 {isActive([i])}" href="#" on-click.prevent="onClick([$e],[i])"/>[e]</a>
      </j-for>
      <a class="w-100" href="../"/>Back to Main</a>
    </div>
  `,
  methods: {
    onClick(v, i) {
      this.current = v;
      this.idx = i;
    },
    isActive(i) {
      if (this.idx == i) return "isActive";
    }
  }
});
