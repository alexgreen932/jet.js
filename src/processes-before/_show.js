import { evaluateCondition } from "./evaluateCondition.js";

/**
 * Preprocessor stage
 *
 * First render:
 * - if condition is true -> keep element, add animation-in class
 * - if condition is false -> remove immediately, no animation
 *
 * Later renders:
 * - do not remove here
 * - let _showAfter() handle animation-out on real DOM
 */
export function _show(tpl) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(tpl, "text/html");
  const items = doc.querySelectorAll("[j-show]");

  if (!items.length) return tpl;

  const firstRender = !this._initRendered;
  console.log("firstRender:", firstRender);

  items.forEach(item => {
    const raw = (item.getAttribute("j-show") || "").trim();

    let anime = (item.getAttribute("anime") || "fade").trim();
    if (!anime) anime = "fade";

    const grouped = item.hasAttribute("anime-group");
    const inc = `${anime}-in`;
    const ok = evaluateCondition(this, raw);

    // first render only
    if (firstRender) {
      if (ok) {
        if (grouped) {
          // optional small delay for grouped items
          item.setAttribute("data-show-delay", "1");
        }

        // setTimeout(() => {
        // }, 500);
        item.classList.add(inc);
      } else {
        if (firstRender) {
          item.classList.add("j-hidden");
          // item.remove();
          // item.style.display = "none";
        }
      }
    }
  });

  return doc.body.innerHTML;
}

/**
 * Real DOM stage
 *
 * Later renders only:
 * - if condition is true -> play animation in
 * - if condition is false -> play animation out, then remove element
 */
export function _showAfter() {
  const items = this.querySelectorAll("[j-show]");
  const firstRender = !this._initRendered;

  // first render was already handled in _show()
  if (firstRender) return;

  items.forEach(item => {
    const raw = (item.getAttribute("j-show") || "").trim();

    let anime = (item.getAttribute("anime") || "fade").trim();
    if (!anime) anime = "fade";

    const grouped = item.hasAttribute("anime-group");
    const inc = `${anime}-in`;
    const out = `${anime}-out`;

    const ok = evaluateCondition(this, raw);

    // clean old classes first
    item.classList.remove(inc, out);

    if (ok) {
      const doIn = () => {
        // force reflow so animation restarts
        void item.offsetWidth;
        item.classList.add(inc);
        item.classList.remove("j-hidden");

        setTimeout(() => {
          item.classList.remove(inc);
          item.classList.remove("j-hidden");
        }, 500);
      };

      if (grouped) {
        setTimeout(doIn, 500);
      } else {
        doIn();
      }
    } else {
      // play out, then remove
      void item.offsetWidth;
      item.classList.add(out);
          item.classList.add("j-hidden");

      setTimeout(() => {
        // item.remove();

        // item.style.display = "none";
        item.classList.remove(out);
          item.classList.add("j-hidden");
      }, 500);
      // this.$s();
    }
  });
}
