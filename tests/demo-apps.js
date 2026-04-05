import "./components/hello-world.js";
import "./components/demo-todos.js";
import "./components/demo-form.js";
import "./components/demo-tabs.js";
import "./components/demo-save.js";

jet({
  name: "demo-apps",
  data: {
    menu: ["Hello World", "Todos", "Tabs", "Form", "Localstorage"],
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
      <demo-tabs j-if="current=='Tabs'"></demo-tabs>
      <demo-save j-if="current=='Localstorage'"></demo-save>

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
  },
  css:`.menu{position:fixed;top:0;bottom:0;left:0;overflow:auto;width:300px}.menu a{padding:5px 8px;border-bottom:dashed 1px #989eb6}.menu a:last-child{border-bottom-width:0}.menu a:hover{background:rgba(0,0,0,0.1)}.menu a.isActive{background:#fff}`
});
