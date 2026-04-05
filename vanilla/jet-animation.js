// vanilla/jet-animation.js
import { animate } from "./coms/animate.js";

function initJetAnimation() {
  animate();

  let timer = null;
  const observer = new MutationObserver(() => {
    clearTimeout(timer);
    timer = setTimeout(() => animate(), 50);
  });

  observer.observe(document.body, { childList: true, subtree: true });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initJetAnimation);
} else {
  initJetAnimation();
}
