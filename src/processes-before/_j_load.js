import resolveDataPath from "../helpers/resolveDataPath.js";

export function _j_load(html) {
  if (!html.includes("j-load")) return html;

  const doc = new DOMParser().parseFromString(html, "text/html");
  const items = doc.querySelectorAll("[j-load]");

  items.forEach(el => {
    const raw = (el.getAttribute("j-load") || "").trim();
    const value = resolveDataPath(this, raw);

    if (!isTrue(value)) {
      el.outerHTML = `
        <div class="jc-c jet-load-wrap">
          <div class="jet-loader">
            <span>Loading...</span>
          </div>
        </div>
      `;
    } else {
      el.removeAttribute("j-load");
    }
  });

  return doc.body.innerHTML;
}

function isTrue(v) {
  if (v == null) return false;
  if (typeof v === "boolean") return v;
  if (typeof v === "number") return true;
  if (typeof v === "string") return v.trim().length > 0;
  if (Array.isArray(v)) return v.length > 0;
  if (typeof v === "object") return Object.keys(v).length > 0;
  return false;
}