import resolveDynamicIndex from "./helpers/resolveDynamicIndex.js";

function escapeDangerCode(str) {
  return str.replace(
    /[<>&"'`]/g,
    c =>
      ({
        "<": "&lt;",
        ">": "&gt;",
        "&": "&amp;",
        '"': "&quot;",
        "'": "&#x27;",
        "`": "&#x60;"
      }[c])
  );
}

/**
 * ✅ MODIFIED: allow dot-path method names too (app.fn(), utils.test(), etc.)
 */
function isMethodCall(str) {
  return /^([a-zA-Z0-9_.]+)\((.*?)\)$/.test(str);
}

/**
 * optional: detect "simple token" (identifier, dot path, bracket access)
 */
function looksResolvableToken(token) {
  // examples: cls1, data.title, e.class, items[i].title, $el, foo_bar
  return /^[a-zA-Z0-9_$]+(\.[a-zA-Z0-9_$]+|\[[^\]]+\])*$/.test(token);
}

/**
 * ✅ NEW: Replace Jet-style [something] inside a method call string
 * Example: isActive('[e.slug]') => isActive('pages')
 *
 * We only replace bracket chunks that look like simple paths: e.slug, ops.current, etc.
 * This keeps it from touching normal JS brackets that contain spaces or operators.
 */
function resolveJetBracketsInside(str, ctx) {
  return str.replace(/\[([a-zA-Z0-9_$.\[\]]+)\]/g, (_, inner) => {
    const v = resolveDynamicIndex(inner, ctx);
    // If undefined/null, keep empty string so method still runs
    return v === undefined || v === null ? "" : String(v);
  });
}

export default function j_interpolation(tpl) {
  if (!tpl || !tpl.includes("{")) return tpl;

  return tpl.replace(/(?<!\$)\{(.*?)\}/g, (_, raw) => {
    let expr = raw.trim();
    if (!expr) return "";

    // 1) whole expression is a method call: {hello(1)}
    if (isMethodCall(expr)) {
      // ✅ NEW: resolve [e.slug] style tokens inside args before executing
      const safeExpr = resolveJetBracketsInside(expr, this);

      const out = this._executeMethod(safeExpr);
      return out !== undefined ? escapeDangerCode(String(out)) : "";
    }

    // 2) multi-token: {cls1 cls2 cls3 ...}
    if (expr.includes(" ")) {
      const tokens = expr.split(/\s+/).filter(Boolean);

      const resolvedTokens = tokens
        .map(tok => {
          // ✅ Keep your existing: static tokens inside single quotes
          if (tok.length >= 2 && tok.startsWith("'") && tok.endsWith("'")) {
            return tok.slice(1, -1);
          }

          /**
           * ✅ NEW: method calls INSIDE multi-token blocks
           * Example token: isActive('[e.slug]')
           */
          if (isMethodCall(tok)) {
            const safeTok = resolveJetBracketsInside(tok, this);
            const out = this._executeMethod(safeTok);

            // Optional: track updates if you want re-render when deps change.
            // We can’t easily know deps here without parsing args deeply,
            // but resolvingJetBracketsInside() already calls resolveDynamicIndex()
            // which is usually enough to trigger your dependency tracking elsewhere.

            if (out === undefined || out === null || out === false) return "";
            if (Array.isArray(out)) return out.filter(Boolean).join(" ");
            return String(out);
          }

          // Resolve normal tokens (cls, e.cls, items[i].title, etc.)
          if (looksResolvableToken(tok)) {
            const val = resolveDynamicIndex(tok, this);

            // ✅ watch THIS token (cls), not the whole "{'fs-15' cls}"
            this._update_checker(val, tok);

            if (val === undefined || val === null || val === false) return "";
            if (Array.isArray(val)) return val.filter(Boolean).join(" ");
            return String(val);
          }

          // Otherwise treat as literal (btn, is-active, etc.)
          return tok;
        })
        .join(" ")
        .replace(/\s+/g, " ")
        .trim();

      return resolvedTokens ? escapeDangerCode(resolvedTokens) : "";
    }

    // 3) single token/path: {text} / {user.name} / {items[i].title}
    const resolvedValue = resolveDynamicIndex(expr, this);
    this._update_checker(resolvedValue, expr);

    if (
      resolvedValue === undefined ||
      resolvedValue === null ||
      resolvedValue === false
    )
      return "";

    const finalValue = Array.isArray(resolvedValue)
      ? resolvedValue.filter(Boolean).join(" ")
      : String(resolvedValue);

    return escapeDangerCode(finalValue);
  });
}
