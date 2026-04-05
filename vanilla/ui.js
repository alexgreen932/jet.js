import smoothScroll from "./coms/smoothScroll.js";
import runPrism from "./coms/runPrism.js";
import { helpers } from "./helpers.js";
//will be a few more for adding in 

// import { animate } from "./coms/animate.js";

// Run everything once
function runUI() {
  smoothScroll();
  runPrism();
  helpers();
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
