
export default function errorLog() {
renderErrorLog();
document.body.addEventListener('console_log', renderErrorLog());

}

function renderErrorLog() {
    if ($.errors && $.errors > 0) {
        let pop = `<div id="error-box" style="position: fixed; top: 50px; bottom: 50px; left: 50%; width: 80%; margin-left: -40%; background: #282E3E; color: #cad0e2; padding: 1rem; border-radius: 5px; overflow: auto; z-index: 20; display: flex; flex-direction: column; gap: 1rem"></div>`;

        document.body.insertAdjacentHTML('beforeend', pop);

        let box = document.getElementById('error-box');

        // Используем map для преобразования массива в HTML и join для склеивания
        let listHtml = $.errors
            .map(value => `<li style="padding: 0.5rem 0;">${value}</li>`)
            .join('');

        box.innerHTML = `<h1>Errors</h1><ul style="list-style: none; padding: 0; margin: 0;">${listHtml}</ul>`;
    }

}

