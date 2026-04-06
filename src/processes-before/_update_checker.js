//_update_checker.js

//todo!!! remove if not used

import isStaticOrDynamic from "../helpers/isStaticOrDynamic.js";
// Import function to determine if data is static or dynamic
// Импорт функции для определения, являются ли данные статическими или динамическими
// Функция анализирует, может ли значение меняться после инициализации компонента

import deepClone from "../helpers/deepClone.js";
// Import function for deep cloning of objects
// Импорт функции глубокого клонирования объектов
// Необходимо для сохранения «снимка» состояния без ссылок на оригинал

/**
 * Register a reactive "watch" for a given data path.
 * IMPORTANT: Must NOT add a new event listener on every render.
 * We store watchers in a Map and attach ONE "jreact" listener per component instance.
 *
 * Регистрирует реактивное наблюдение («watch») за указанным путём данных.
 * ВАЖНО: Нельзя добавлять новый обработчик событий при каждом рендере — это приведёт к утечкам памяти.
 * Наблюдатели хранятся в Map, для каждого экземпляра компонента прикрепляется ОДИН обработчик «jreact».
 * Это гарантирует, что даже при множественных вызовах _update_checker будет только один слушатель.
 */
export function _update_checker(valueOnRender, path) {

  // List of component tags that should not be checked for updates (performance optimization)
  // Список тегов компонентов, которые не должны проверяться на обновления (оптимизация производительности)
  // Эти компоненты либо не требуют реактивности, либо управляются отдельно
  let notChecking = ["FIELD-INPUT", "JET-FORM", 'ELEMENT-EDIT'];

  // Skip execution if the component is static or belongs to the exclusion list
  // Пропустить выполнение, если компонент статический или входит в список исключений
  // Это предотвращает ненужные проверки для неизменяемых или управляемых вручную компонентов
  if (this.static || notChecking.includes(this.tagName)) return;

  // Initialize the component's watch system once (on first call)
  // Инициализировать систему наблюдения компонента один раз (при первом вызове)
  // Проверка !this._j_watch гарантирует, что инициализация произойдёт только один раз
  if (!this._j_watch) {
    this._j_watch = {
      map: new Map(), // Map to store paths and their snapshots (path -> snapshot)
                     // Map для хранения путей и их снимков (путь -> снимок)
                     // Ключ — строка пути (например, "user.profile.name"), значение — клонированное состояние
      renderQueued: false, // Flag indicating whether a render is already queued (debounce mechanism)
                         // Флаг, указывающий, поставлен ли рендер в очередь (механизм debounce)
                         // Предотвращает множественные рендеры в одном тике
      controller: new AbortController() // Controller to manage event listener lifecycle
                                   // Контроллер для управления жизненным циклом обработчика событий
                                   // Позволяет безопасно удалить обработчик при уничтожении компонента
    };

    // Attach a single "jreact" event listener for the component instance
    // Прикрепить единственный обработчик события «jreact» для экземпляра компонента
    // Использование одного слушателя на компонент — ключевая оптимизация
    document.addEventListener(
      "jreact",
      ev => {
        const watch = this._j_watch;
        const detailPath = ev?.detail?.path; // Путь данных, который изменился (может быть null)

        // Optional: Allow disabling auto‑render globally for this component instance
        // Опционально: разрешить отключение автоматического рендера глобально для этого экземпляра компонента
        // Если разработчик установил this.noAutoRender = true, компонент не будет автоматически перерисовываться
        if (this.noAutoRender === true) return;

        // Get the component's tag name and convert it to uppercase for comparison
        // Получить имя тега компонента и преобразовать его в верхний регистр для сравнения
        const tag = String(this.tagName || "").toUpperCase();//TODO RMI(ReMoveIf not used)

        // If the event specifies a changed path, check if it's relevant to this component
        // Если событие указывает на изменённый путь, проверить, относится ли он к этому компоненту
        // Это позволяет пропустить проверку всех путей, если событие точно не затрагивает компонент
        if (detailPath) {
          let relevant = false;

          // Iterate over all watched paths to check relevance
          // Перебрать все отслеживаемые пути для проверки релевантности
          for (const watchedPath of watch.map.keys()) {
            // Paths are considered relevant if:
            // - They are identical (e.g., "user" === "user")
            // - The changed path starts with the watched path (e.g., "user.name" for "user")
            // - The watched path starts with the changed path (e.g., "user" for "user.name")
            // Пути считаются релевантными, если:
            // - Они идентичны (например, «user» === «user»)
            // - Изменённый путь начинается с отслеживаемого (например, «user.name» для «user»)
            // - Отслеживаемый путь начинается с изменённого (например, «user» для «user.name»)
            if (
              detailPath === watchedPath ||
              detailPath.startsWith(watchedPath + ".") ||
              watchedPath.startsWith(detailPath + ".")
            ) {
              relevant = true;
              break; // Early exit: no need to check further
                    // Ранний выход: нет необходимости проверять дальше
            }
          }

          // Skip further processing if the changed path is not relevant
          // Пропустить дальнейшую обработку, если изменённый путь не релевантен
          // Это существенно снижает нагрузку при большом количестве наблюдаемых путей
          if (!relevant) return;
        }

        // Flag to track if any watched data has changed
        // Флаг для отслеживания, изменились ли какие‑либо отслеживаемые данные
        let changed = false;

        // Iterate over all registered paths and compare current values with snapshots
        // Перебрать все зарегистрированные пути и сравнить текущие значения со снимками
        for (const [p, snap] of watch.map.entries()) {
          // Get current value using the helper function
          // Получить текущее значение с помощью вспомогательной функции
          // isStaticOrDynamic учитывает контекст компонента и тип данных
          const current = isStaticOrDynamic(this, p);

          // Check if both current and snapshot are objects (to decide comparison strategy)
          // Проверить, являются ли текущее значение и снимок объектами (чтобы выбрать стратегию сравнения)
          const bothObjects =
            current &&
            snap &&
            typeof current === "object" &&
            typeof snap === "object";

          // Determine if values differ:
          // - For objects: compare JSON strings (suitable for small data, O(n) but simple)
          // - For primitives: use strict equality (O(1))
          // Определить, различаются ли значения:
          // - Для объектов: сравнить строки JSON (подходит для небольших данных, O(n), но просто)
          // - Для примитивов: использовать строгое равенство (O(1))
          const isDiff = bothObjects
            ? JSON.stringify(current) !== JSON.stringify(snap)
            : current !== snap;

          // If a difference is found:
          // - Update the snapshot with a deep clone of the current value (to avoid reference issues)
          // - Set the `changed` flag to true (to trigger re-render)
          // Если найдено различие:
          // - Обновить снимок глубоким клонированием текущего значения (чтобы избежать проблем с ссылками)
          // - Установить флаг `changed` в true (чтобы запустить перерендер)
          if (isDiff) {
            watch.map.set(p, deepClone(current)); // Сохраняем новый снимок
            changed = true;
          }
        }

        // Skip rendering if no changes were detected
        // Пропустить рендер, если изменений не обнаружено
        // Экономия ресурсов: рендер не запускается без реальных изменений
        if (!changed) return;

        // Debounce: ensure only one render per tick, even if multiple events occur
        // Debounce: гарантировать только один рендер за такт, даже если произошло несколько событий
        // Защита от «дрожания» — предотвращает каскадные рендеры
        if (watch.renderQueued) return;
        watch.renderQueued = true;

        // Queue a microtask to perform rendering after the current task completes
        // Поставить в очередь микрозадачу для выполнения рендера после завершения текущей задачи
        // queueMicrotask выполняется после текущего макрозадачного цикла, но до следующего рендера браузера
        queueMicrotask(() => {
          watch.renderQueued = false; // Сбрасываем флаг после выполнения
          // console.log(`${this.tagName} RE RENDERED`); // Отладка: вывод в консоль

          // Trigger component re‑rendering
          // Запустить перерендер компонента
          this.render();

          // Synchronize external UI elements (e.g., form visibility)
          // Синхронизировать внешние элементы интерфейса (например, видимость формы)
          this.j_form_sync_visibility?.();
        });
      },
      { signal: this._j_watch.controller.signal }
    );
  }

  // Register or update the snapshot for the given path in the Map
  // (duplicates are prevented by Map's key uniqueness)
  // Зарегистрировать или обновить снимок для указанного пути в Map
  // (дубликаты предотвращаются уникальностью ключей Map)
  this._j_watch.map.set(path, deepClone(valueOnRender));
}
