import { evaluateCondition } from "./evaluateCondition.js";

export function _show(tpl) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(tpl, "text/html");
  const items = doc.querySelectorAll("[j-show]");

  // Если элементов с j-show нет, возвращаем шаблон без изменений
  if (!items.length) return tpl;

  // Определяем, первая ли это отрисовка (до первой отрисовки this._initRendered не установлен)
  const firstRender = !this._initRendered;
  console.log("firstRender:", firstRender);

  items.forEach((item, index) => {
    // Получаем условие из атрибута j-show
    const raw = (item.getAttribute("j-show") || "").trim();
    // Получаем тип анимации (по умолчанию — fade)
    let anime = (item.getAttribute("anime") || "fade").trim();
    if (!anime) anime = "fade";
    // Проверяем, принадлежит ли элемент к группе анимаций
    let grouped = (item.getAttribute("anime-group") || "").trim();
    if (!grouped) grouped = false;

    // Формируем имена классов для входа и выхода
    const inc = `${anime}-in`;
    const out = `${anime}-out`;

    // Вычисляем условие видимости элемента
    const ok = evaluateCondition(this, raw);

    // Запускаем анимацию в зависимости от результата условия
    if (ok) {
      doAnime(item, "in", inc, firstRender, grouped);
    } else {
      doAnime(item, "out", out, firstRender, grouped);
    }
    console.log("firstRender AFTER:", firstRender);
  });

  return doc.body.innerHTML;
}

/**
 * Функция для запуска анимации показа/скрытия элемента
 * @param {Element} item — элемент DOM, к которому применяется анимация
 * @param {"in" | "out"} type — тип анимации: "in" — показать, "out" — скрыть
 * @param {string} anime — имя класса анимации (например, "fade-in")
 * @param {boolean} firstRender — флаг первой отрисовки
 * @param {boolean|string} grouped — флаг группировки анимаций (если true — добавляем задержки)
 */
function doAnime(item, type, anime, firstRender, grouped) {
  // При первой отрисовке:
  // - если элемент должен быть виден, добавляем класс анимации и убираем его через 500 мс
  // - если скрыт, сразу устанавливаем display: none
  if (firstRender) {
    if (type === "in") {
      // Добавляем класс анимации входа
      item.classList.add(anime);
      // Через 500 мс убираем класс, чтобы не накапливать стили
      setTimeout(() => {
        item.classList.remove(anime);
      }, 500);
    } else {
      // При первой отрисовке скрытый элемент сразу скрываем без анимации
      item.style.display = "none";
    }
  } else {
    // При повторной отрисовке (виртуальный DOM):
    // - для показа: добавляем класс анимации, убираем через 500 мс, устанавливаем display: block
    // - для скрытия: добавляем класс анимации выхода, через 500 мс скрываем и убираем класс
    if (type === "in") {
      if (grouped) {
        // Для grouped элементов добавляем задержку 500 мс перед показом
        setTimeout(() => {
          item.style.display = "block";
          item.classList.add(anime);
          setTimeout(() => {
            item.classList.remove(anime);
          }, 500);
        }, 500);
      } else {
        // Обычный случай: сразу показываем с анимацией
        item.style.display = "block";
        item.classList.add(anime);
        setTimeout(() => {
          item.classList.remove(anime);
        }, 500);
      }
    } else {
      // Для скрытия всегда добавляем анимацию выхода
      item.classList.add(anime);
      setTimeout(() => {
        item.classList.remove(anime);
        item.style.display = "none"; // Скрываем после завершения анимации
      }, 500);
    }
  }
}
