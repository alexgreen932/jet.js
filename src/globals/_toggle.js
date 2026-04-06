export function _toggle(el, anime = "fade") {
  const element = this.querySelector(el);

  // Защита от отсутствия элемента
  if (!element) return;

  const inc = `${anime}-in`;
  const out = `${anime}-out`;

  const isVisible = element.classList.contains("j-visible");
  const animationClass = isVisible ? out : inc;
  const fromClass = isVisible ? "j-visible" : "j-hidden";
  const toClass = isVisible ? "j-hidden" : "j-visible";

  // Применяем анимационные классы
  element.classList.add("jp", animationClass);
  element.classList.remove(fromClass);

  // Ждём окончания анимации
  const onAnimationEnd = () => {
    element.classList.remove("jp", animationClass);
    element.classList.add(toClass);
    element.removeEventListener("animationend", onAnimationEnd);
  };

  element.addEventListener("animationend", onAnimationEnd);

  // Резервный таймер на случай сбоя события
  setTimeout(() => {
    if (element.classList.contains("jp")) {
      onAnimationEnd();
    }
  }, 1000);
}
