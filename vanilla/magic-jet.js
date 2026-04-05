import smoothScroll from "./coms/smoothScroll.js";
import dropInner from "./coms/dropInner.js";
import slideshow from "./coms/slideshow.js";
import parallax from "./coms/parallax.js";
import { modal } from "./coms/modal.js";
import ratio from "./coms/ratio.js";
import tabs from "./coms/tabs.js";

import { animate } from "./coms/animate.js";

// Run everything once
function runUI() {
  smoothScroll();
  dropInner();
  slideshow();
  parallax();
  modal();
  animate();
  ratio();
  tabs();
}

// Start when DOM is ready, then watch for DOM changes
function initMagicJet() {
  runUI();

  // Debounced observer (dynamic pages / DOM changes)
  let timer = null;

  const observer = new MutationObserver(() => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      runUI();
    }, 50);
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initMagicJet);
} else {
  initMagicJet();
}
