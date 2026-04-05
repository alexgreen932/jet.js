/**
 * Super simple Parallax (old-school, readable)
 * --------------------------------------------
 * Default behavior:
 * - If NO jpo-* class is present → speed = 0.1
 * - jpo-4  => 0.4
 * - jpo-10 => 1.0
 * - Only moves DOWN
 * - Starts at background-position: 50% 50%
 * - Stops when image is not tall enough
 */

export default function parallax() {
  const items = Array.from(document.querySelectorAll(".j-parallax"));
  if (!items.length) return () => {};

  // -------------------------------------------------
  // DEFAULT SPEED (change this if 0.1 feels too weak)
  // -------------------------------------------------
  const DEFAULT_SPEED = 0.1; // px per scroll px

  const STOP_GAP_PX = 10;

  const state = items.map((el) => {
    el.style.backgroundPosition = "50% 50%";

    if (!el.style.backgroundSize) el.style.backgroundSize = "cover";
    if (!el.style.backgroundRepeat) el.style.backgroundRepeat = "no-repeat";

    // If no jpo-* class → DEFAULT_SPEED is used
    const speed = getSpeedFromClasses(el.classList, DEFAULT_SPEED);

    const item = {
      el,
      speed,
      imgW: 0,
      imgH: 0,
      maxShiftPx: 0,
    };

    const url = getBackgroundImageUrl(el);
    if (url) {
      const img = new Image();
      img.onload = () => {
        item.imgW = img.naturalWidth;
        item.imgH = img.naturalHeight;
        item.maxShiftPx = calcMaxShiftPx(el, item.imgW, item.imgH, STOP_GAP_PX);
        updateOne(item);
      };
      img.src = url;
    }

    return item;
  });

  function onScroll() {
    for (const item of state) updateOne(item);
  }

  function onResize() {
    for (const item of state) {
      if (item.imgW && item.imgH) {
        item.maxShiftPx = calcMaxShiftPx(
          item.el,
          item.imgW,
          item.imgH,
          STOP_GAP_PX
        );
      }
      updateOne(item);
    }
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onResize, { passive: true });

  onResize();

  function stopParallax() {
    window.removeEventListener("scroll", onScroll);
    window.removeEventListener("resize", onResize);
  }

  return stopParallax;

  // ---------------------
  // Internal helpers
  // ---------------------

  function updateOne(item) {
    const { el, speed, maxShiftPx } = item;

    const scrollY = window.pageYOffset || document.documentElement.scrollTop || 0;
    const rect = el.getBoundingClientRect();
    const elTop = rect.top + scrollY;

    let relative = scrollY - elTop;
    if (relative < 0) relative = 0;

    let shift = relative * speed;
    if (shift < 0) shift = 0;

    if (maxShiftPx > 0 && shift > maxShiftPx) shift = maxShiftPx;

    el.style.backgroundPosition = `50% calc(50% + ${shift}px)`;
  }
}

/**
 * Reads speed from jpo-* classes.
 * If none found → returns defaultSpeed.
 */
function getSpeedFromClasses(classList, defaultSpeed) {
  for (const cls of classList) {
    if (!cls.startsWith("jpo-")) continue;

    const raw = cls.slice(4);
    const num = parseInt(raw, 10);

    if (Number.isNaN(num)) return defaultSpeed;

    const speed = num / 10;
    return speed > 0 ? speed : defaultSpeed;
  }

  // No jpo-* class found → use default
  return defaultSpeed;
}

function getBackgroundImageUrl(el) {
  const bg = getComputedStyle(el).backgroundImage;
  if (!bg || bg === "none") return null;

  const match = bg.match(/url\(["']?(.*?)["']?\)/i);
  return match ? match[1] : null;
}

function calcMaxShiftPx(el, imgW, imgH, stopGapPx) {
  const rect = el.getBoundingClientRect();
  const elW = rect.width;
  const elH = rect.height;

  if (!imgW || !imgH || !elW || !elH) return 0;

  const scale = Math.max(elW / imgW, elH / imgH);
  const bgH = imgH * scale;
  const extraH = bgH - elH;

  if (extraH <= 0) return 0;

  const maxShift = extraH / 2 - stopGapPx;
  return maxShift > 0 ? maxShift : 0;
}
