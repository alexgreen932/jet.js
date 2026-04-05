// _if.js

import isStaticOrDynamic from "../helpers/isStaticOrDynamic.js";

//used both in _if _pl

/**
 * Главный вычислитель условия (универсальный).
 * @param {object} ctx - контекст компонента (this)
 * @param {string} expr - строка условия из j-if
 * @returns {boolean}
 *
 * Main condition evaluator (universal).
 * Evaluates any j-if expression in the component's context.
 */
export function evaluateCondition(ctx, expr) {
  expr = (expr || "").trim();
  if (!expr) return false;

  // ✅ support top-level negation
  if (expr.startsWith("!")) {
    const inner = expr.slice(1).trim().replace(/^\((.*)\)$/, "$1");
    return !evaluateCondition(ctx, inner);
  }

  // ✅ complex logical expressions
  if (expr.includes("||") || expr.includes("&&")) {
    return evaluateLogicalCondition(ctx, expr);
  }

  // ✅ method call
  if (isMethodCall(expr)) {
    return runMethodCondition(ctx, expr);
  }

  // ✅ comparison
  if (hasComparisonOperator(expr)) {
    return evaluateComparison(ctx, expr);
  }

  // ✅ simple flag/value
  const value = evaluateValue(ctx, expr);

  // track simple dynamic paths too
  trackIfDynamic(ctx, expr, value);

  return !!value;
}

/**
 * Оценивает сложное условие с логическими операторами && и ||
 * ✅ Приоритет как в JS: сначала &&, потом ||
 *
 * @param {object} ctx
 * @param {string} conditionStr
 * @returns {boolean}
 *
 * Evaluates a complex condition with logical operators && and ||.
 * Follows JS precedence: evaluates && groups first, then applies ||.
 */
function evaluateLogicalCondition(ctx, conditionStr) {
  // Разбиваем по OR: "a && b || c && d" => ["a && b", "c && d"]
  // Split by OR: "a && b || c && d" → ["a && b", "c && d"]
  const orGroups = conditionStr
    .split("||")
    .map(s => s.trim())
    .filter(Boolean);

  for (const group of orGroups) {
    // Внутри группы разбиваем по AND: "a && b && c"
    // Inside each group, split by AND: "a && b && c"
    const andParts = group
      .split("&&")
      .map(s => s.trim())
      .filter(Boolean);

    let andOk = true;

    for (const part of andParts) {
      const partOk = !!evaluateSingleCondition(ctx, part);
      // Evaluate each part as a single condition
      // Оценить каждую часть как одиночное условие
      if (!partOk) {
        andOk = false;
        break; // short‑circuit for &&: if one part is false, the whole group is false
        // короткое замыкание для &&: если одна часть ложна, вся группа ложна
      }
    }

    if (andOk) return true; // short‑circuit for ||: if one group is true, the whole condition is true
    // короткое замыкание для ||: если одна группа истинна, всё условие истинно
  }

  return false;
}

/**
 * Оценивает одиночное условие (без && / ||)
 * @param {object} ctx
 * @param {string} expr
 * @returns {boolean}
 *
 * Evaluates a single condition (without && / ||).
 * Handles negations (!), method calls, comparisons, and simple values.
 */
function evaluateSingleCondition(ctx, expr) {
  expr = (expr || "").trim();
  if (!expr) return false;

  //console.log(`%c "${expr}"`, $.red);

  // Поддержка отрицания: !cond1, !someMethod(), !(a==b) (упрощённо)
  // Support for negation: !cond1, !someMethod(), !(a==b) (simplified)
  if (expr.startsWith("!")) {
    // ✅ Упрощение: убираем внешние скобки, если есть
    // Simplification: remove outer parentheses if present
    const inner = expr
      .slice(1)
      .trim()
      .replace(/^\(|\)$/g, "");
    return !evaluateCondition(ctx, inner);
    // Recursively evaluate the inner condition and negate the result
    // Рекурсивно оценить внутреннее условие и инвертировать результат
  }

  if (isMethodCall(expr)) {
    return runMethodCondition(ctx, expr);
    // Run method safely for single condition
    // Безопасно выполнить метод для одиночного условия
  }

  // ✅ MODIFIED: сравнения определяем одним хелпером
  // ✅ MODIFIED: detect comparisons with a single helper
  if (hasComparisonOperator(expr)) {
    return evaluateComparison(ctx, expr);
  }

  return !!evaluateValue(ctx, expr);
}

/**
 * Вычисляет "значение" (флаг/ключ/число/строка) через isStaticOrDynamic
 * @param {object} ctx - контекст компонента (this)
 * @param {string} token - токен для вычисления (например, "isVisible", "user.name", "true", "'text'")
 * @returns {any} - вычисленное значение токена
 *
 * Computes a "value" (flag/key/number/string) using isStaticOrDynamic.
 * Resolves tokens like 'isVisible' or 'user.name' to their actual values in the context.
 */
function evaluateValue(ctx, token) {
  token = (token || "").trim();
  if (!token) return undefined;
  // Normalize input: trim whitespace and handle null/undefined
  // Нормализация ввода: убрать пробелы и обработать null/undefined

  // Литералы, чтобы не улетало в поиск ключа data
  // Literals — handle them directly without looking them up in data
  if (token === "true") return true;
  // Return boolean true for string "true"
  // Вернуть булево true для строки "true"
  if (token === "false") return false;
  // Return boolean false for string "false"
  // Вернуть булево false для строки "false"
  if (token === "null") return null;
  // Return null for string "null"
  // Вернуть null для строки "null"
  if (token === "undefined") return undefined;
  // Return undefined for string "undefined"
  // Вернуть undefined для строки "undefined"

  // Проверка на числовой литерал: если строка преобразуется в число без потерь, возвращаем число
  // Check for numeric literal: if the string converts to a number without loss, return the number
  const num = Number(token);
  if (!isNaN(num) && token === String(num)) {
    return num;
    // Return the number if it's a valid numeric literal (e.g., "123", "-45.6")
    // Вернуть число, если это корректный числовой литерал (например, «123», «-45.6»)
  }

  // Проверка на строковый литерал в кавычках
  // Check for string literal in quotes
  if (
    (token.startsWith("'") && token.endsWith("'")) ||
    (token.startsWith('"') && token.endsWith('"'))
  ) {
    // Remove quotes and return the inner string
    // Убрать кавычки и вернуть внутреннюю строку
    return token.slice(1, -1);
  }

  // Для всех остальных случаев (имен переменных, путей данных) используем isStaticOrDynamic
  // For all other cases (variable names, data paths), use isStaticOrDynamic
  return isStaticOrDynamic(ctx, token);
  // Resolve the token (e.g., 'user.name') to its actual value in the component's data
  // Разрешить токен (например, 'user.name') до его актуального значения в данных компонента
}

/**
 * ✅ NEW helper
 * Проверка: есть ли в строке любой поддерживаемый оператор сравнения
 * @param {string} expr - строка условия для проверки
 * @returns {boolean} - true, если найден оператор сравнения, иначе false
 *
 * Checks if the string contains any supported comparison operator.
 * Used to route expressions like "a === b" to evaluateComparison.
 */
function hasComparisonOperator(expr) {
  return /(===|!==|==|!=|>=|<=|>|<)/.test(expr);
  // Test the expression against a regex that matches all comparison operators
  // Проверить выражение на соответствие регулярному выражению, которое ищет все операторы сравнения
}

/**
 * Оценивает условие сравнения:
 * === !== == != >= <= > <
 * @param {object} ctx - контекст компонента (this)
 * @param {string} comparisonStr - строка сравнения (например, "a === b", "x > 10")
 * @returns {boolean} - результат сравнения
 *
 * Evaluates a comparison condition:
 * === !== == != >= <= > <
 */
function evaluateComparison(ctx, comparisonStr) {
  // ✅ MODIFIED: берём оператор в правильном порядке приоритетов (сначала длинные)
  // Find the operator using regex (longer operators like === are matched first)
  // Найти оператор с помощью регулярного выражения (более длинные операторы, такие как ===, ищутся первыми)
  const match = comparisonStr.match(/(===|!==|==|!=|>=|<=|>|<)/);
  if (!match) return false;
  // If no operator is found, return false
  // Если оператор не найден, вернуть false

  const operator = match[0];
  // Extract the operator (e.g., "===", ">")
  // Извлечь оператор (например, «===», «>»)

  // ✅ MODIFIED: режем строку по ПЕРВОМУ вхождению оператора (без split, чтобы было стабильнее)
  // Split the string at the first occurrence of the operator
  // Разбить строку по ПЕРВОМУ вхождению оператора (без split для стабильности)
  const opIndex = comparisonStr.indexOf(operator);
  const left = comparisonStr.slice(0, opIndex).trim();
  // Left operand (before the operator)
  // Левый операнд (до оператора)
  const right = comparisonStr.slice(opIndex + operator.length).trim();
  // Right operand (after the operator)
  // Правый операнд (после оператора)

  const leftValue = evaluateValue(ctx, left);
  //console.log(`%c "${leftValue}"`, $.red);
  // Evaluate the left operand using evaluateValue
  // Оценить левый операнд с помощью evaluateValue
  const rightValue = evaluateValue(ctx, right);
  // Evaluate the right operand using evaluateValue
  // Оценить правый операнд с помощью evaluateValue

  // ✅ MODIFIED: трекаем только динамические пути (cls, obj.title...), НЕ литералы ('c-red', 123...)
  // Track dynamic paths for reactivity (skip literals like 'c-red' or 123)
  // Отслеживать динамические пути для реактивности (пропустить литералы вроде 'c-red' или 123)
  trackIfDynamic(ctx, left, leftValue);
  trackIfDynamic(ctx, right, rightValue);

  // ✅ MODIFIED: реальное сравнение под выбранный оператор
  // Perform the actual comparison based on the operator
  // Выполнить реальное сравнение в соответствии с оператором
  switch (operator) {
    case "===":
      return leftValue === rightValue;
    // Strict equality (same type and value)
    // Строгое равенство (тот же тип и значение)
    case "!==":
      return leftValue !== rightValue;
    // Strict inequality
    // Строгое неравенство
    case "==":
      return leftValue == rightValue;
    // Loose equality (with type coercion)
    // Нестрогое равенство (с приведением типов)
    case "!=":
      return leftValue != rightValue;
    // Loose inequality
    // Нестрогое неравенство
    case ">":
      return leftValue > rightValue;
    // Greater than
    // Больше чем
    case "<":
      return leftValue < rightValue;
    // Less than
    // Меньше чем
    case ">=":
      return leftValue >= rightValue;
    // Greater than or equal
    // Больше или равно
    case "<=":
      return leftValue <= rightValue;
    // Less than or equal
    // Меньше или равно
    default:
      return false;
    // Fallback: return false for unknown operators
    // Резервный вариант: вернуть false для неизвестных операторов
  }
}
/**
 * Registers update-checker only for dynamic paths like: cls, obj.title, items[i]
 * Skips literals: 'c-red', 123, true, false, null, undefined
 * @param {object} ctx - контекст компонента
 * @param {string} token - проверяемый токен (путь данных или литерал)
 * @param {any} valueOnRender - значение токена на момент рендера
 *
 * Registers an update checker for dynamic data paths (e.g., cls, obj.title).
 * Does not track static literals (strings, numbers, booleans).
 */
function trackIfDynamic(ctx, token, valueOnRender) {
  if (!ctx || typeof ctx._update_checker !== "function") return;
  // Safety check: ensure ctx exists and has _update_checker method
  // Проверка безопасности: убедиться, что ctx существует и имеет метод _update_checker

  token = (token || "").trim();
  if (!token) return;
  // Normalize token: trim and handle empty strings
  // Нормализовать токен: убрать пробелы и обработать пустые строки

  // ✅ MODIFIED: skip static literals (no point tracking those)
  // Skip tokens that are clearly static literals
  // Пропустить токены, которые явно являются статическими литералами
  if (isLiteral(token)) return;

  // ✅ MODIFIED: call the component method safely
  // Call the _update_checker method to register this path for reactivity tracking
  // Вызвать метод _update_checker для регистрации этого пути в системе отслеживания реактивности
  ctx._update_checker(valueOnRender, token);
}

/**
 * Detects tokens that are definitely static literals (not data paths)
 * @param {string} token - токен для проверки
 * @returns {boolean} - true, если токен — статический литерал, иначе false
 *
 * Detects tokens that are definitely static literals (not data paths).
 * Returns true for strings, numbers, booleans, null, undefined.
 */
function isLiteral(token) {
  // Quoted string: matches 'text' or "text"
  // Строковый литерал в кавычках: соответствует 'text' или "text"
  if (
    (token.startsWith("'") && token.endsWith("'")) ||
    (token.startsWith('"') && token.endsWith('"'))
  ) {
    return true;
  }

  // Booleans: true, false
  // Булевы значения: true, false
  if (token === "true" || token === "false") return true;

  // Null and undefined
  // null и undefined
  if (token === "null" || token === "undefined") return true;

  // Numbers: try to parse as number; if successful and string representation matches, it's a number literal
  // Числа: попытка распарсить как число; если успешно и строковое представление совпадает, это числовой литерал
  const num = Number(token);
  if (!isNaN(num) && token === String(num)) {
    return true;
  }

  return false;
  // If none of the above, assume it's a dynamic data path (e.g., user.name, items[0])
  // Если ни одно из условий не выполнено, считаем, что это динамический путь данных (например, user.name, items[0])
}

/**
 * Проверка на вызов метода: something(...)
 * @param {string} expr - строка условия для проверки
 * @returns {boolean} - true, если строка соответствует формату вызова метода, иначе false
 *
 * Checks if the expression is a method call: something(...)
 * Uses regex to match pattern: letters/digits/underscore + parentheses with arguments
 */
function isMethodCall(expr) {
  // Regex pattern:
  // ^ — start of string
  // [a-zA-Z0-9_]+ — one or more letters, digits, or underscores (method name)
  // \( — literal opening parenthesis
  // (.*?) — any characters (non‑greedy) for arguments
  // \) — literal closing parenthesis
  // $ — end of string
  //
  // Шаблон регулярного выражения:
  // ^ — начало строки
  // [a-zA-Z0-9_]+ — одна или более букв, цифр или подчёркиваний (имя метода)
  // \( — буквальная открывающая скобка
  // (.*?) — любые символы (нежадно) для аргументов
  // \) — буквальная закрывающая скобка
  // $ — конец строки
  return /^([a-zA-Z0-9_]+)\((.*?)\)$/.test(expr);
}

/**
 * Выполняет метод из условия j-if
 * Поддерживает:
 * - showOne()
 * - showWithArg(show_true)
 * - showWithArg('hello')
 * - showWithArg(123)
 *
 * Runs a method from j-if condition.
 * Supports:
 * - showOne()
 * - showWithArg(show_true)
 * - showWithArg('hello')
 * - showWithArg(123)
 */
function runMethodCondition(ctx, expr) {
  const parsed = parseMethodCall(expr);
  if (!parsed) return false;

  const { methodName, argTokens } = parsed;

  // Проверяем, что метод существует
  // Check that method exists
  if (!ctx || typeof ctx[methodName] !== "function") {
    return false;
  }

  // Преобразуем аргументы из строк в реальные значения
  // Convert arg strings into real values
  const args = argTokens.map(token => {
    const value = evaluateValue(ctx, token);

    // Если аргумент динамический — трекаем его для реактивности
    // If argument is dynamic — track it for reactivity
    trackIfDynamic(ctx, token, value);

    return value;
  });

  try {
    // Вызываем метод напрямую в контексте компонента
    // Call the method directly in component context
    return !!ctx[methodName](...args);
  } catch (err) {
    console.warn(`j-if method error in "${expr}":`, err);
    return false;
  }
}

/**
 * Разбирает вызов метода вида: someMethod(a, b, 'text')
 * @param {string} expr
 * @returns {{ methodName: string, argTokens: string[] } | null}
 *
 * Parses a method call like: someMethod(a, b, 'text')
 */
function parseMethodCall(expr) {
  const match = expr.match(/^([a-zA-Z0-9_]+)\((.*?)\)$/);
  if (!match) return null;

  const methodName = match[1];
  const rawArgs = match[2].trim();

  // Нет аргументов
  // No arguments
  if (!rawArgs) {
    return {
      methodName,
      argTokens: []
    };
  }

  // Простой split по запятой
  // Simple split by comma
  // Для текущего beta-случая этого достаточно
  // For current beta-case this is enough
  const argTokens = rawArgs
    .split(",")
    .map(s => s.trim())
    .filter(Boolean);

  return {
    methodName,
    argTokens
  };
}
