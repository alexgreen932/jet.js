// _dc.js - dynamic component
export function _dynamicTag(tpl) {
  if (!tpl || typeof tpl !== "string") return tpl;

  const doc = new DOMParser().parseFromString(tpl, "text/html");
  const nodes = doc.querySelectorAll("j-tag");

  nodes.forEach((ph) => {
    const type = (ph.getAttribute("type") || "").trim();
    const prefix = ph.getAttribute("prefix") || "";
    const tag = (prefix + type).trim();
    //dev/debug
    // if (this.tagName =='JET-TITLE') {
    //    console.log('tag:', tag);
    // }

    // custom elements must have a dash - no need check for dash as it used for dynamic heading h1, h2 etc and maybe for any native html tags
    // if (!tag.includes("-")) return;

    const el = doc.createElement(tag);

    // copy attrs except type/prefix
    for (const { name, value } of [...ph.attributes]) {
      if (name === "type" || name === "prefix") continue;
      el.setAttribute(name, value);
    }

    // move children
    while (ph.firstChild) el.appendChild(ph.firstChild);

    ph.replaceWith(el);
  });

  // ✅ return the transformed HTML string
  return doc.body.innerHTML;
}