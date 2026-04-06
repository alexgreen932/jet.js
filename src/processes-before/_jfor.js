// new method – keep it simple, but add a few “prevent” helpers
import resolveDataPath from "../helpers/resolveDataPath.js";

export function _jfor(tpl) {
  
  const parser = new DOMParser();
  const doc = parser.parseFromString(tpl, "text/html");

  // ✅ helper: escape string for single-quoted JS literal inside HTML attrs: on-click="x='...'"
  function escapeForSingleQuotes(str) {
    return String(str)
      .replace(/\\/g, "\\\\") // backslash first
      .replace(/'/g, "\\'") // single quote
      .replace(/\n/g, "\\n") // keep handlers safe
      .replace(/\r/g, "\\r");
  }

  // ✅ helper: return a JS literal for handler/conditions (your [$...] syntax)
  function toJsLiteral(val) {
    if (val === null) return "null";
    if (val === undefined) return "undefined";
    const t = typeof val;
    if (t === "string") return `'${escapeForSingleQuotes(val)}'`;
    if (t === "number" || t === "boolean") return String(val);

    // Prevent: objects/functions in handlers can be a mess.
    try {
      return `'${escapeForSingleQuotes(JSON.stringify(val))}'`;
    } catch (e) {
      return "undefined";
    }
  }

  // ✅ helper: allow simple nested paths like [user.name]
  // Also supports legacy-ish [e.title] by stripping leading "e."
  function getByPath(obj, path) {
    if (!path) return undefined;
    path = path.trim();

    if (path.startsWith("e.")) path = path.slice(2);

    if (!path.includes(".")) return obj?.[path];

    return path.split(".").reduce((acc, key) => {
      if (acc == null) return undefined;
      return acc[key];
    }, obj);
  }

  // ✅ helper: evaluate an expression against current (item, index)
  // This is used by BOTH: normal [expr] and dynamic [[expr]]
  function evalExpr(expr, item, index) {
    expr = (expr ?? "").trim();
    

    if (expr === "i") return index;

    if (expr === "e") return item;

    // if item is an object, allow keys / dot paths
    if (item && typeof item === "object") {
      return getByPath(item, expr);
    }

    return undefined;
  }

  // ✅ helper: build SAFE bracket notation for dynamic keys
  // turns key -> 3   => [3]
  // turns key -> "tab1" => ['tab1']
  function keyToBracket(key) {
    if (key === null || key === undefined) return "";

    // If it's already a number, use it
    if (typeof key === "number") return String(key);

    // If it's a numeric string like "0" or "12", treat as number index
    const s = String(key).trim();
    if (/^\d+$/.test(s)) return s;

    // Otherwise treat as string key: ['something']
    // JSON.stringify adds quotes + escaping safely (we remove outer quotes? no: we WANT quotes)
    return JSON.stringify(s);
  }

  // Find all <j-for data="...">
  const elements = doc.querySelectorAll("j-for");

  elements.forEach(element => {
    const forValue = element.getAttribute("data");
    
    element.removeAttribute("data");

    const evalArray = resolveDataPath(this, forValue);
    //DEBUG BLOCK
    // if (this.tagName === "MY-APP") {
    //   //undifined
    //   //undifined
    // }

    if (!Array.isArray(evalArray)) {
      element.replaceWith(doc.createTextNode(""));
      return;
    }

    // Track updates
    // this._update_checker(evalArray, forValue);//no need any more, let it listen data change

    const content = element.innerHTML;
    const fragment = doc.createDocumentFragment();

    evalArray.forEach((item, index) => {
      // ---------------------------------------------
      // PASS 1: handle dynamic bracket syntax [[...]]
      //
      // WHY:
      // - Normal regex /\[([^\]]+)\]/ breaks on tabs[[i]]
      // - So we resolve [[i]] FIRST, and replace it with a SAFE TOKEN,
      //   then later restore token -> [resolvedKey]
      //
      // Example:
      //   tabs[[i]]   -> tabs[0]
      //   tabs[[id]]  -> tabs['tab-1']   (if id is string)
      // ---------------------------------------------
      const dynTokens = []; // store resolved keys per iteration

      let replacedInner = content.replace(
        /\[\[([\s\S]+?)\]\]/g,
        (match, innerExprRaw) => {
          const innerExpr = innerExprRaw.trim();

          // Evaluate inner expression (supports i, e, title, e.id, etc)
          const keyVal = evalExpr(innerExpr, item, index);

          // If undefined, remove safely (prevents leaving broken brackets)
          if (keyVal === undefined) return "";

          // Convert evaluated key into valid bracket content: 0 OR "tab1"
          const bracketContent = keyToBracket(keyVal);
          if (bracketContent === "") return "";

          // Use a token so PASS 2 won't try to process the produced [ ... ]
          const token = `§§JET_DYN_${dynTokens.length}§§`;
          dynTokens.push(bracketContent);

          return token;
        }
      );

      // ---------------------------------------------
      // PASS 2: handle normal [expr] replacements
      // (your original logic, unchanged in spirit)
      // ---------------------------------------------
      replacedInner = replacedInner.replace(
        /\[([^\]]+)\]/g,
        (match, exprRaw) => {
          let expr = exprRaw.trim();
          let asLiteral = false;

          if (expr.startsWith("$")) {
            asLiteral = true;
            expr = expr.slice(1).trim();
          }

          // Special cases
          if (expr === "i") return String(index);

          if (expr === "e") {
            if (asLiteral) return toJsLiteral(item);
            return item == null ? "" : String(item);
          }

          const val = evalExpr(expr, item, index);

          if (val === undefined) return "";

          if (asLiteral) return toJsLiteral(val);

          return val == null ? "" : String(val);
        }
      );

      // ---------------------------------------------
      // RESTORE: convert tokens back to real bracket notation
      // token -> [resolvedKey]
      // ---------------------------------------------
      if (dynTokens.length) {
        dynTokens.forEach((bracketContent, n) => {
          const tokenRe = new RegExp(`§§JET_DYN_${n}§§`, "g");
          replacedInner = replacedInner.replace(tokenRe, `[${bracketContent}]`);
        });
      }

      // Parse HTML chunk into real nodes
      const tempDiv = doc.createElement("div");
      tempDiv.innerHTML = replacedInner;

      while (tempDiv.firstChild) fragment.appendChild(tempDiv.firstChild);
    });

    element.replaceWith(fragment);
  });

  return doc.body.innerHTML;
}
