jet({
  name: "demo-todos",
  data: {
    items: [
      "Lorem ipsum dolor sit amet consectetur adipisicing elit.",
      "Dolores explicabo corporis tempora ut ex quo odit quaerat voluptates."
    ],
    new: "New Todo"
  },
  tpl: html`
    <div class="fd-c g-1" style="max-width:700px">
      <h1 class="c-blue fs-15">Add, delete, move your todo</h1>
      <ul class="fd-c g-05" drag="items">
        <j-for data="items">
          <li class="jc-b b-grey-l4 br-5 p-05 fade-bottom-in">
            <div>[e]</div>
            <div class="ai-c g-05 fs-12">
              <div class="c-click" on-click="del([i])">🞪</div>
              <div class="c-move">⋮⋮</div>
            </div>
          </li>
        </j-for>
      </ul>
      <div class="b-blue-l5 br-5 p-1 fd-c g-1">
        <input type="text" j-model="new" />
        <button class="but-blue w-20 br-5" on-click="add()">Add New</button>
      </div>
    </div>
  `,
  methods: {
    add() {
      this.items.push(this.new);
    },
    del(i) {
       this.items.splice(i, 1);
    },
  }
});
