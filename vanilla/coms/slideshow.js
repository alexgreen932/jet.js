// slideshow.js
// Минималистичный слайдшоу-компонент на классах (без data-атрибутов)
// Плагины (arrows / dots / thumbs) генерируются автоматически по классам.

export default function slideshow() {
  // Инициализация всех слайдеров на странице
  document.querySelectorAll('.ss').forEach(initSlider);
}

/**
 * Инициализация одного слайдера
 * @param {HTMLElement} el - контейнер .ss (например <ul class="ss ...">)
 */
function initSlider(el) {
  // Чтобы не инициализировать один и тот же элемент дважды
  if (el._ss) return;

  const slides = Array.from(el.querySelectorAll(':scope > li'));
  if (!slides.length) return;

  // -------- Настройки из классов --------

  // Эффект: sse-fade | sse-scale | ...
  const effect = getClassValue(el, 'sse-', 'fade');

  // Задержка между сменами слайдов (autoplay delay): ssd-5000
  const delay = getClassNumber(el, 'ssd-', 5000);

  // Длительность анимации перехода: ss-duration-400
  // (ты писал: ss-duration-4000 etc)
  const transition = getClassNumber(el, 'ss-duration-', 600);

  const autoplay = el.classList.contains('ss-autoplay');
  const useArrows = el.classList.contains('ss-arrows');
  const useDots = el.classList.contains('ss-dots');
  const useThumbs = el.classList.contains('ss-thumbs');

  // -------- Внутреннее состояние --------
  const state = {
    el,
    slides,
    effect,
    delay,
    transition,
    index: 0,
    timer: null,
    navEl: null,       // контейнер dots/thumbs
    arrowsEl: null,    // контейнер стрелок
    destroyed: false,
  };

  // Сохраним ссылку, чтобы можно было проверить/уничтожить при необходимости
  el._ss = state;

  // -------- Базовая подготовка DOM/стилей --------

  // Важно: у тебя li абсолютные. Мы гарантируем, что все слайды "на месте".
  slides.forEach((li, i) => {
    li.style.display = 'block';
    li.style.opacity = '0';
    li.style.pointerEvents = 'none'; // чтобы не кликались невидимые слои
    // transform трогаем в эффектах
    li.classList.remove('active');
    if (i === 0) li.classList.add('active');
  });

  // Сразу покажем первый
  applyEffect(state, 0, true);

  // -------- Плагины --------
  if (useArrows) mountArrows(state);
  if (useDots || useThumbs) mountNav(state, useThumbs ? 'thumbs' : 'dots');

  // -------- Автоплей --------
  if (autoplay) startAutoplay(state);

  // -------- Уборка таймера при удалении элемента из DOM --------
  // События "remove" нет, поэтому используем MutationObserver.
  // Это лёгкий и надежный способ понять, что .ss больше нет в документе.
  const mo = new MutationObserver(() => {
    if (!document.contains(el)) {
      destroySlider(state);
      mo.disconnect();
    }
  });
  mo.observe(document.documentElement, { childList: true, subtree: true });
}

/* ------------------------------------------------------------------ */
/* --------------------------- ПЛАГИНЫ ------------------------------- */
/* ------------------------------------------------------------------ */

/**
 * Генерация стрелок (prev/next)
 */
function mountArrows(state) {
  // Чтобы не создать дважды
  if (state.arrowsEl) return;

  const addon = document.createElement('div');
  addon.className = 'ss-arrow-nav';

  addon.innerHTML = `
    <i class="fa-solid fa-angle-left ss-nav-prev" role="button" tabindex="0" aria-label="Previous slide"></i>
    <i class="fa-solid fa-angle-right ss-nav-next" role="button" tabindex="0" aria-label="Next slide"></i>
  `;

  state.el.appendChild(addon);
  state.arrowsEl = addon;

  const prevBtn = addon.querySelector('.ss-nav-prev');
  const nextBtn = addon.querySelector('.ss-nav-next');

  // Клик
  prevBtn.addEventListener('click', () => go(state, -1));
  nextBtn.addEventListener('click', () => go(state, +1));

  // Enter/Space для доступности
  addon.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      const t = e.target;
      if (t.classList.contains('ss-nav-prev')) go(state, -1);
      if (t.classList.contains('ss-nav-next')) go(state, +1);
    }
  });
}

/**
 * Генерация навигации (dots или thumbs)
 * @param {'dots'|'thumbs'} type
 */
function mountNav(state, type = 'dots') {
  if (state.navEl) return;

  const nav = document.createElement('div');
  nav.className = `ss-${type}-nav`;

  state.slides.forEach((slide, index) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'ss-nav-item';
    btn.dataset.index = String(index);
    btn.setAttribute('aria-label', `Go to slide ${index + 1}`);

    // thumbs: кладём превью-картинку внутрь кнопки
    if (type === 'thumbs') {
      const img = slide.querySelector('img');
      if (img) {
        const thumb = img.cloneNode(true);
        thumb.classList.add('ss-thumb');
        // Чтобы клики по IMG не ломали логику (мы всё равно используем closest ниже)
        thumb.setAttribute('draggable', 'false');
        btn.appendChild(thumb);
      }
    }

    nav.appendChild(btn);
  });

  state.el.appendChild(nav);
  state.navEl = nav;

  // Делегирование кликов:
  // IMPORTANT: target может быть IMG внутри кнопки, поэтому используем closest()
  nav.addEventListener('click', (e) => {
    const btn = e.target.closest('.ss-nav-item');
    if (!btn) return;
    const index = Number(btn.dataset.index);
    goTo(state, index);
  });

  // Активный пункт
  updateNavActive(state);
}

/* ------------------------------------------------------------------ */
/* ------------------------- НАВИГАЦИЯ ------------------------------- */
/* ------------------------------------------------------------------ */

/**
 * Переход на следующий/предыдущий слайд
 * @param {number} step - например -1 или +1
 */
function go(state, step) {
  const next = (state.index + step + state.slides.length) % state.slides.length;
  goTo(state, next);
}

/**
 * Переход на конкретный индекс
 */
function goTo(state, index) {
  if (state.destroyed) return;
  if (index === state.index) return;

  state.index = clampIndex(index, state.slides.length);
  applyEffect(state, state.index);
  updateNavActive(state);

  // Если есть автоплей — “перезапускаем” таймер, чтобы после клика
  // не было мгновенного автопереключения
  if (state.timer) {
    startAutoplay(state, true);
  }
}

/**
 * Подсветка активной кнопки dots/thumbs
 */
function updateNavActive(state) {
  if (!state.navEl) return;

  const items = state.navEl.querySelectorAll('.ss-nav-item');
  items.forEach((btn, i) => {
    btn.classList.toggle('active', i === state.index);
  });
}

/* ------------------------------------------------------------------ */
/* -------------------------- АНИМАЦИИ ------------------------------- */
/* ------------------------------------------------------------------ */

/**
 * Применение эффекта к текущему слайду
 * @param {boolean} instant - без анимации (на старте)
 */
function applyEffect(state, index, instant = false) {
  const { slides, effect, transition } = state;

  // Сначала “сбросим” все слайды в базовое состояние
  slides.forEach((li) => {
    li.classList.remove('active');
    li.style.transition = instant ? 'none' : '';
    li.style.opacity = '0';
    li.style.pointerEvents = 'none';
  });

  const current = slides[index];
  current.classList.add('active');
  current.style.pointerEvents = 'auto';

  // Включаем переходы (кроме instant)
  // Важно: transition назначаем ДО изменения final-значений
  const t = instant ? 0 : transition;

  switch (effect) {
    case 'fade':
      fadeEffect(slides, index, t);
      break;
    case 'scale':
      scaleEffect(slides, index, t);
      break;
    case 'slide':
      slideEffect(state, index, t);
      break;
    case 'push':
      pushEffect(state, index, t);
      break;
    case 'pull':
      pullEffect(state, index, t);
      break;
    default:
      fadeEffect(slides, index, t);
      break;
  }

  // Если был instant, вернём transition обратно, чтобы следующие переходы были анимированы
  if (instant) {
    requestAnimationFrame(() => {
      slides.forEach((li) => (li.style.transition = ''));
    });
  }
}

// fade: просто меняем opacity
function fadeEffect(slides, index, transition) {
  slides.forEach((li) => {
    li.style.transform = 'none';
    li.style.transition = `opacity ${transition}ms ease`;
  });
  slides[index].style.opacity = '1';
}

// scale: активный scale(1), остальные scale(0.95) (или 0.9)
function scaleEffect(slides, index, transition) {
  slides.forEach((li) => {
    li.style.transition = `opacity ${transition}ms ease, transform ${transition}ms ease`;
    li.style.transform = 'scale(0.95)';
  });
  slides[index].style.opacity = '1';
  slides[index].style.transform = 'scale(1)';
}

// slide: все слайды стоят в ряд, сдвигаем по X
// function slideEffect(state, index, transition) {
//   const w = state.el.clientWidth || 1;

//   state.slides.forEach((li, i) => {
//     li.style.transition = `transform ${transition}ms ease, opacity ${transition}ms ease`;
//     li.style.opacity = i === index ? '1' : '1'; // при slide обычно все видимы, но можно оставить 1
//     li.style.transform = `translateX(${(i - index) * w}px)`;
//   });
// }

function slideEffect(state, index, transition) {
  const w = state.el.clientWidth || 1;

  state.slides.forEach((li, i) => {
    li.style.transition = `transform ${transition}ms ease, opacity ${transition}ms ease`;

    // 👇 КЛЮЧЕВОЙ МОМЕНТ
    li.style.opacity = i === index ? '1' : '0';

    li.style.transform = `translateX(${(i - index) * w}px)`;
  });
}

// push: активный 0, остальные "справа"
function pushEffect(state, index, transition) {
  const w = state.el.clientWidth || 1;

  state.slides.forEach((li, i) => {
    li.style.transition = `transform ${transition}ms ease, opacity ${transition}ms ease`;
    li.style.opacity = i === index ? '1' : '0';
    li.style.transform = i === index ? 'translateX(0px)' : `translateX(${w}px)`;
  });
}

// pull: активный 0, остальные "слева"
function pullEffect(state, index, transition) {
  const w = state.el.clientWidth || 1;

  state.slides.forEach((li, i) => {
    li.style.transition = `transform ${transition}ms ease, opacity ${transition}ms ease`;
    li.style.opacity = i === index ? '1' : '0';
    li.style.transform = i === index ? 'translateX(0px)' : `translateX(${-w}px)`;
  });
}

/* ------------------------------------------------------------------ */
/* --------------------------- AUTOPLAY ------------------------------ */
/* ------------------------------------------------------------------ */

/**
 * Запуск/перезапуск автоплея
 * @param {boolean} reset - если true, сначала очистить старый таймер
 */
function startAutoplay(state, reset = false) {
  if (reset && state.timer) {
    clearInterval(state.timer);
    state.timer = null;
  }

  // Если слайдер уничтожен или autoplay выключен — ничего не делаем
  if (state.destroyed || !state.el.classList.contains('ss-autoplay')) return;

  // Важно: interval = delay (ssd-), а НЕ transition
  state.timer = setInterval(() => {
    go(state, +1);
  }, state.delay);
}

/**
 * Уничтожение слайдера (чистим интервал и метки)
 */
function destroySlider(state) {
  if (!state || state.destroyed) return;
  state.destroyed = true;

  if (state.timer) {
    clearInterval(state.timer);
    state.timer = null;
  }

  // Можно оставить сгенерированные элементы, но чаще логичнее убрать
  if (state.navEl) state.navEl.remove();
  if (state.arrowsEl) state.arrowsEl.remove();

  // Снимаем ссылку
  if (state.el) delete state.el._ss;
}

/* ------------------------------------------------------------------ */
/* ---------------------------- HELPERS ------------------------------ */
/* ------------------------------------------------------------------ */

/**
 * Берём строковое значение из класса вида prefix-xxxx
 * например: sse-fade -> "fade"
 */
function getClassValue(el, prefix, fallback) {
  const found = Array.from(el.classList).find((c) => c.startsWith(prefix));
  return found ? found.slice(prefix.length) : fallback;
}

/**
 * Берём число из класса вида prefix1234
 * например: ssd-5000 -> 5000
 */
function getClassNumber(el, prefix, fallback) {
  const found = Array.from(el.classList).find((c) => c.startsWith(prefix));
  if (!found) return fallback;

  const n = parseInt(found.slice(prefix.length), 10);
  return Number.isFinite(n) ? n : fallback;
}

function clampIndex(i, len) {
  if (len <= 0) return 0;
  if (i < 0) return 0;
  if (i >= len) return len - 1;
  return i;
}
