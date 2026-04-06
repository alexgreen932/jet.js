jet({
  data: {
    tabs: ["",
      {
        title: "Uno",
        content:
          "<h3>Content for tab 1</h3><p>Lorem ipsum dolor sit amet consectetur adipisicing elit.</p>"
      },
      {
        title: "Dos",
        content:
          "<h3>Content for tab 2</h3><p>Ipsum quas voluptas natus vitae, beatae necessitatibus ratione.</p>"
      },
      {
        title: "Tres",
        content:
          "<h3>Content for tab 3</h3><p>Qui perferendis totam in consequatur unde qui ullam rerum.</p>"
      },
      {
        title: "Cuatro",
        content:
          "<h3>Content for tab 4</h3><p>Ut molestiae mollitia et praesentium optio in explicabo quia ea corporis.</p>"
      }
    ],
    current: 0
  },
  name: "demo-tabs",
  tpl: html`
    <ul class="tabs fd-r">
      <j-for data="tabs">
        <li class="j-click{isActive([i])}" on-click="current=[i]">[title]</li>
      </j-for>
    </ul>
    <j-for data="tabs">
      <div j-if="current==[i]" j-html="tabs[[i]].content"></div>
    </j-for>
  `,
  methods:{
    isActive(i) {
      if (this.current == i) return " isActive";
    }
  },
  css: `.tabs{border-bottom:1px solid #bfcfe6;margin-bottom:1rem}.tabs li{border-radius:5px 5px 0 0;padding:5px 20px}.tabs li:hover{background:rgba(0,0,0,0.1)}.tabs li.isActive{background:#bfcfe6}`,
});
