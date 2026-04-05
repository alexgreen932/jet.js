export default function ratio() {
  // Select anything that has a class starting with "ratio-"
  // Works for figure, div, section, whatever.
  const items = document.querySelectorAll('[class*="ratio-"]');

  items.forEach((el) => {
    // Find the ratio-* class on this element
    const ratioClass = Array.from(el.classList).find((cls) => cls.startsWith('ratio-'));
    if (!ratioClass) return;

    // Get the raw part: "16-9" from "ratio-16-9"
    const raw = ratioClass.replace('ratio-', '').trim();

    // Split into numbers: ["16", "9"]
    const parts = raw.split('-').filter(Boolean);

    // Need at least 2 parts to form a ratio
    if (parts.length < 2) return;

    // Build aspect-ratio string: "16 / 9"
    const aspectValue = `${parts[0]} / ${parts[1]}`;

    // Apply aspect-ratio
    el.style.aspectRatio = aspectValue;

    // Optional: If there's an <img> directly inside, make it fill nicely
    const img = el.querySelector('img');
    if (img) {
      img.style.width = '100%';
      img.style.height = '100%';
      img.style.objectFit = 'cover';
      // If you prefer: img.style.objectPosition = 'center';
      // (only needed if your images behave weirdly)
    }
  });
}

