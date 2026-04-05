import isStaticOrDynamic from "./isStaticOrDynamic.js";

/**
 * Resolves a dot-path with optional array access like "items[current].title"
 * @param {Object} obj - The base object to resolve from.
 * @param {string} path - Path like "items[current].title" or "items[0].desc"
 * @returns {*} - The resolved value or undefined
 */
export default function resolveDataPath(obj, path) {
  // console.log('obj:', obj);
  // console.log('path:', path);
  if (!obj || typeof obj !== "object") return undefined;

  const parts = path.split(".");
  let current = obj;

  for (let part of parts) {
    if (!current) break;

    // Match array access like items[0] or items[current]
    const match = part.match(/^([a-zA-Z0-9_$]+)\[([^\]]+)\]$/);
    if (match) {
      const baseKey = match[1]; // e.g., "items"
      // console.log('baseKey: ', baseKey);
      const indexKey = match[2]; // e.g., "0" or "current"
      // console.log('indexKey: ', indexKey);

      // 👇 Resolve the array using resolveDataPath — to support nested objects
      const arr = resolveDataPath(current, baseKey);
      // console.log('arr: ', arr);
      if (!Array.isArray(arr)) {
        console.warn(`resolveDataPath: '${baseKey}' is not an array.`);
        return undefined;
      }

      const index = isStaticOrDynamic(obj, indexKey);
      // console.log('[resolveDataPath] indexKey:', indexKey, '→ index:', index);

      current = arr[index];
    } else {
      // Standard dot access
      current = current[part];
    }
  }

  return current;
}
