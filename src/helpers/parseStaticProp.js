// helpers/parseStaticProp.js
export function parseStaticProp(raw) {
  if (raw == null) return raw;

  const v = String(raw).trim();
  if (v === "") return "";

  // Try JSON only when it actually looks like JSON or JSON-primitive
  const looksJson =
    v.startsWith("{") ||
    v.startsWith("[") ||
    v.startsWith('"') ||
    v === "true" ||
    v === "false" ||
    v === "null" ||
    /^-?\d+(\.\d+)?$/.test(v);

  if (!looksJson) return v;

  try {
    return JSON.parse(v);
  } catch (e) {
    // If it's "almost JSON" (common in HTML), fall back to string
    return v;
  }
}
