/**
 * Компонент dropInner — реализует выпадающее меню с управлением состоянием.
 * 
 * Функционал:
 * - Переключение класса `isActive` по клику на триггер (j-trigger)
 * - Закрытие по клику на элемент с классом `d-close` (если присутствует внутри d-inner)
 * - Закрытие при клике за пределами контейнера `.drop-inner`
 * - Предотвращение закрытия при клике внутри контейнера
 *
 * @example
 * <div class="drop-inner">
 *   <i class="j-trigger fa-solid fa-bars"></i>
 *   <div class="d-inner drop-right">
 *     <i class="d-close fa-solid fa-xmark"></i>
 *     Lorem ipsum
 *   </div>
 * </div>
 */
export default function dropInner() {
  // Обработчик клика вне элемента
  function handleOutsideClick(event) {
    document.querySelectorAll('.drop-inner').forEach(container => {
      const inner = container.querySelector('.d-inner');
      
      // Если inner существует и имеет класс isActive
      if (inner && inner.classList.contains('isActive')) {
        // Проверяем, клик был вне контейнера
        if (!container.contains(event.target)) {
          inner.classList.remove('isActive');
        }
      }
    });
  }

  // Инициализация всех экземпляров drop-inner
  document.querySelectorAll('.drop-inner').forEach(container => {
    const trigger = container.querySelector('.j-trigger');
    const inner = container.querySelector('.d-inner');
    const close = inner?.querySelector('.d-close'); // Ищем d-close внутри d-inner

    // Проверка обязательных элементов
    if (!trigger || !inner) return;

    // Переключение состояния по клику на триггер
    trigger.addEventListener('click', (e) => {
      e.stopPropagation(); // Предотвращаем распространение события
      inner.classList.toggle('isActive');
    });

    // Закрытие по клику на d-close (если элемент существует)
    if (close) {
      close.addEventListener('click', (e) => {
        e.stopPropagation();
        inner.classList.remove('isActive');
      });
    }

    // Предотвращаем закрытие при клике внутри drop-inner
    container.addEventListener('click', (e) => {
      e.stopPropagation();
    });
  });

  // Вешаем обработчик на document для отслеживания кликов вне элементов
  document.addEventListener('click', handleOutsideClick);
}
