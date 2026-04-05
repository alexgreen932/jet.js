

export default function showPopup(errors) {
console.log('errors in showPopup -------', errors);
  console.log("errors==========", errors);
  let error_box = document.getElementById('error-box');
  if (errors.length > 0 && !error_box ) {

    let pop = `<div id="error-box" style="position: fixed; top: 50px; bottom: 50px; left: 50%; width: 80%; margin-left: -40%; background: #282E3E; color: #fff!important; padding: 1rem; border-radius: 5px; overflow: auto; z-index: 20; display: flex; flex-direction: column; gap: 1rem:overflow-y:auto"></div>`;

    document.body.insertAdjacentHTML("beforeend", pop);

    let box = document.getElementById("error-box");

    // Используем map для преобразования массива в HTML и join для склеивания
    let listHtml = $.errors
      .map(value => `<li style="padding: 0.5rem 0;border-bottom: dashed 1px #888;">${value}</li>`)
      .join("");

    box.innerHTML = `<h1 style="margin:0; font-size: 2rem;color:#f00;">Errors</h1><ul style="list-style: none; padding: 0; margin: 0;">${listHtml}</ul>`;
  }
}