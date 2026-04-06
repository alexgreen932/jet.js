
export function _css(str) {
    str = minifyCSS(str);
  const sid = `jet-style`;
  if (!document.getElementById(sid)) {
    const style = document.createElement("style");
    style.id = sid;
    style.innerText = str;
    document.head.appendChild(style);
  } else {
    let style = document.getElementById(sid);
    
    style.append(str);
  }
}

function minifyCSS(css) {
  return css
    .replace(/\s+/g, " ") // Заменяем все пробелы/табуляции на один пробел
    .replace(/\{\s+/g, "{") // Убираем пробелы после {
    .replace(/\s+\}/g, "}") // Убираем пробелы перед }
    .replace(/;\s+/g, ";") // Убираем пробелы после ;
    .replace(/:\s+/g, ":") // Убираем пробелы после :
    .trim(); // Убираем пробелы в начале и конце
}
