export default function smoothScroll() {
  // Функция для плавной прокрутки с учётом offset
  function smoothScrollTo(targetElement, offsetValue = 0) {
    const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset;
    const adjustedPosition = targetPosition - offsetValue;

    window.scrollTo({
      top: adjustedPosition,
      behavior: 'smooth'
    });
  }

  // Обработчик кликов для элементов с классом smooth-scroll
  document.addEventListener('click', function(event) {
    // Проверяем, был ли клик по элементу с классом smooth-scroll
    const scrollLink = event.target.closest('.smooth-scroll');
    if (!scrollLink) return;

    event.preventDefault(); // Отменяем стандартное поведение

    // Получаем якорь из атрибута href
    const href = scrollLink.getAttribute('href');
    if (!href || !href.startsWith('#')) return;

    const targetId = href.substring(1); // Убираем символ #
    const targetElement = document.getElementById(targetId);
    if (!targetElement) return; // Если элемент не найден — выходим

    // Ищем элемент с классами scroll-offset и offset-XXX
    const offsetElement = targetElement.closest('.scroll-offset') || targetElement;
    let offsetValue = 0;

    if (offsetElement && offsetElement.classList.contains('scroll-offset')) {
      // Ищем класс вида offset-XXX
      const offsetClass = Array.from(offsetElement.classList).find(cls =>
        cls.startsWith('offset-')
      );

      if (offsetClass) {
        // Извлекаем числовое значение из класса
        const offsetStr = offsetClass.replace('offset-', '');
        offsetValue = parseInt(offsetStr, 10);

        // Проверяем валидность числа
        if (isNaN(offsetValue)) {
          offsetValue = 0;
        }
      }
    }

    // Выполняем плавную прокрутку с учётом offset
    smoothScrollTo(targetElement, offsetValue);
  });
};


