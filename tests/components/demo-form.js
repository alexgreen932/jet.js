import "../../components/form/form.js";

jet({
  name: "demo-form",
  data: {
    content: {
      title: "Lorem Ipsum",
      text: "Lorem Ipsum dolor sit amet",
      bg: "b-blue-l4",
      fs: "fs-10",
      h_col: "#000",
    },
    fields: [
      { title: "Title", key: "title", type: "input" },
      { title: "Text", key: "text", type: "textarea" },
      { title: "Background", key: "bg", type: "select", ops: "'Blue':'b-blue-l4','Red':'b-red-l4','Green':'b-green-l4'" },
      { title: "Size", key: "fs", type: "select", ops: "'1rem':'fs-10','1.5rem':'fs-15','2rem':'fs-20'," },
      { title: "Heading Color", key: "h_col", type: "input", ops: "color" },
    ]
  },
  tpl: html`
    <div class="w-container-c g-1">
        <h1 class="fs-12">No need to create form, use component jet-form and just add necessary fields as props(more info in docs... coming soon)</h1>
      <div class="br-5 p-1 {content.bg content.fs}">
        <h3 style="color:{content.h_col}">{content.title}</h3>
        <p>{content.text}</p>
      </div>
      <div class="b-grey-l4 br-5 p-1">
        <jet-form
          title="Form, just add props😄"
          d-obj="content"
          d-fields="fields"
        ></jet-form>
      </div>
    </div>
  `
});
