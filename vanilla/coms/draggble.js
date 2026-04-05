// utils/coms/draggable.js
// Make all elements with `.js-draggable` class draggable.
// Safe to call many times: only new elements get listeners.

export default function draggable() {

    
  // Select only not-yet-initialized draggables
  const draggables = document.querySelectorAll('.js-draggable:not([data-draggable-init])');

  if (!draggables.length) return;

  draggables.forEach((modal) => {
    // Mark as initialized so we don't bind twice on the same element
    modal.setAttribute('data-draggable-init', '1');

    // Try to find a drag handle inside the modal.
    // If none -> whole modal is draggable.
    const handle = modal.querySelector('.js-draggable-handle') || modal;

    let isDragging = false;
    let startX = 0;
    let startY = 0;
    let startLeft = 0;
    let startTop = 0;

    handle.addEventListener('mousedown', (e) => {
      // Don't start drag when clicking form controls
      if (e.target.closest('input, textarea, select, button, a')) {
        return;
      }

      isDragging = true;

      // Ensure fixed so we can move freely on the viewport
      modal.style.position = 'fixed';

      const rect = modal.getBoundingClientRect();

      startX = e.clientX;
      startY = e.clientY;
      startLeft = rect.left;
      startTop = rect.top;

      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup', onMouseUp);

      e.preventDefault();
    });

    function onMouseMove(e) {
      if (!isDragging) return;

      const dx = e.clientX - startX;
      const dy = e.clientY - startY;

      let newLeft = startLeft + dx;
      let newTop = startTop + dy;

      const rect = modal.getBoundingClientRect();
      const maxLeft = window.innerWidth - rect.width;
      const maxTop = window.innerHeight - rect.height;

      if (newLeft < 0) newLeft = 0;
      if (newTop < 0) newTop = 0;
      if (newLeft > maxLeft) newLeft = maxLeft;
      if (newTop > maxTop) newTop = maxTop;

      modal.style.left = `${newLeft}px`;
      modal.style.top = `${newTop}px`;
      modal.style.transform = 'none'; // remove initial centering
    }

    function onMouseUp() {
      if (!isDragging) return;
      isDragging = false;

      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    }
  });
}
