export default function runPrism(root = document) {
  if (!window.Prism) return;

  // If the root itself is a code block, include it
  if (
    root.nodeType === 1 &&
    root.matches('pre code[class*="language-"]:not([data-prism-highlighted])')
  ) {
    Prism.highlightElement(root);
    root.setAttribute('data-prism-highlighted', 'true');
  }

  // Find only new, not-yet-highlighted blocks inside root
  const blocks = root.querySelectorAll?.(
    'pre code[class*="language-"]:not([data-prism-highlighted])'
  );

  if (!blocks) return;

  blocks.forEach((block) => {
    Prism.highlightElement(block);
    block.setAttribute('data-prism-highlighted', 'true');
  });
}