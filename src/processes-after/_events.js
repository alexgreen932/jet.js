import updateNestedProperty from "../helpers/updateNestedProperty.js";

/**
 * Jet.js Event Binder
 * Supports:
 * - multiple event_* attrs on one element
 * - direct set: title='Hello'
 * - toggle: show=!show
 * - method call: doSomething(1, 'x')
 *
 * Important:
 * With virtual DOM, the same DOM node can be reused after rerender.
 * So we must rebind the event if its meta changed.
 */
export function _events() {
  const ctx = this;
  const all = this.querySelectorAll("*");

  all.forEach(el => {
    const metas = getEventMetasFromElement(el);
    if (!metas.length) return;

    // store bindings by event name
    // example:
    // el._jetEventBindings = {
    //   click: { encoded, handler }
    // }
    if (!el._jetEventBindings) el._jetEventBindings = {};

    metas.forEach(({ eventName, meta, encoded }) => {
      const existing = el._jetEventBindings[eventName];

      // If exactly same meta already bound, do nothing
      if (existing && existing.encoded === encoded) return;

      // If old binding exists but meta changed, remove old handler first
      if (existing && existing.handler) {
        el.removeEventListener(eventName, existing.handler);
      }

      const handler = e => {
        const mods = Array.isArray(meta.mods) ? meta.mods : [];
        const prevent = mods.includes("prevent") || meta.type === "set";
        const stop = mods.includes("stop");

        if (prevent) e.preventDefault();
        if (stop) e.stopPropagation();

        // ==================================================
        // DEBUG LOGS
        // Uncomment when needed
        // ==================================================
        // console.group(`[Jet _events] ${eventName}`);
        // console.log("META:", meta);
        // console.log("CTX BEFORE:", ctx);
        // ==================================================

        // 1) direct set: title='New Title' OR show=!show
        if (meta.type === "set" && meta.prop) {
          // ==================================================
          // DEBUG LOGS FOR SET
          // ==================================================
          //console.log("SET PROP:", meta.prop);
          //console.log("RAW VALUE:", meta.value, typeof meta.value);

          // toggle support: show=!show
          if (isToggleExpression(meta.prop, meta.value)) {
            const current = getByPath(ctx, meta.prop);

            //console.log("TOGGLE CURRENT:", current, typeof current);

            updateNestedProperty(ctx, meta.prop, !current);

            // console.log(
            //   "RESULT AFTER TOGGLE:",
            //   getByPath(ctx, meta.prop),
            //   typeof getByPath(ctx, meta.prop)
            // );

            // console.groupEnd();
            return;
          }

          const v = evaluateValue(ctx, meta.value);

          //console.log("PARSED VALUE:", v, typeof v);

          updateNestedProperty(ctx, meta.prop, v);

          //console.log(
          //   "RESULT AFTER SET:",
          //   getByPath(ctx, meta.prop),
          //   typeof getByPath(ctx, meta.prop)
          // );

          // console.groupEnd();
          return;
        }

        // 2) method call: someMethod(...)
        if (meta.type === "call" && meta.method) {
          const args = parseArgs(ctx, meta.args);
          const fn = ctx[meta.method];

          // ==================================================
          // DEBUG LOGS FOR METHOD
          // ==================================================
          // console.log("CALL METHOD:", meta.method);
          // console.log("CALL ARGS:", args);

          if (typeof fn === "function") {
            fn.apply(ctx, args);
          } else {
            console.warn(`[Jet _events] Method not found: ${meta.method}`);
          }

          // console.groupEnd();
        }
      };

      el.addEventListener(eventName, handler);

      el._jetEventBindings[eventName] = {
        encoded,
        handler
      };

      // optional beautify
      el.removeAttribute(`event_${eventName}`);
    });
  });
}

/**
 * Safely evaluate a value:
 * 1) literals: 'text', "text", 123, true, false, null
 * 2) path from ctx: a.b.c
 * 3) single key from ctx: title
 */
function evaluateValue(ctx, raw) {
  const str = String(raw ?? "").trim();

  if (
    (str.startsWith("'") && str.endsWith("'")) ||
    (str.startsWith('"') && str.endsWith('"'))
  ) {
    return str.slice(1, -1);
  }

  if (str === "true") return true;
  if (str === "false") return false;
  if (str === "null") return null;

  if (!Number.isNaN(Number(str)) && str !== "") {
    return Number(str);
  }

  if (str.includes(".")) {
    const parts = str.split(".");
    let cur = ctx;
    for (const p of parts) {
      if (cur == null) return undefined;
      cur = cur[p];
    }
    return cur;
  }

  return ctx[str];
}

/**
 * Parse simple args string: "1, 'x', title"
 */
function parseArgs(ctx, argsStr) {
  const s = String(argsStr ?? "").trim();
  if (!s) return [];
  return s.split(",").map(a => evaluateValue(ctx, a.trim()));
}

/**
 * Read all event_* attrs from element
 */
function getEventMetasFromElement(el) {
  const metas = [];

  for (const attr of Array.from(el.attributes)) {
    if (!attr.name.startsWith("event_")) continue;

    const eventName = attr.name.slice("event_".length);
    const encoded = attr.value || "";

    try {
      const raw = decodeURIComponent(encoded);
      const meta = JSON.parse(raw);

      metas.push({ eventName, meta, encoded });
    } catch (err) {
      console.warn("[Jet _events] Bad event meta in", attr.name, encoded);
    }
  }

  return metas;
}

/**
 * Read value by path: a.b.c
 */
function getByPath(ctx, path) {
  const p = String(path ?? "").trim();
  if (!p) return undefined;

  if (!p.includes(".")) return ctx[p];

  const parts = p.split(".");
  let cur = ctx;
  for (const k of parts) {
    if (cur == null) return undefined;
    cur = cur[k];
  }
  return cur;
}

/**
 * Check toggle form:
 * show = !show
 * show = !this.show
 */
function isToggleExpression(prop, value) {
  const left = String(prop ?? "").trim();
  const right = String(value ?? "").trim();

  if (right === `!${left}`) return true;
  if (right === `!this.${left}`) return true;

  return false;
}