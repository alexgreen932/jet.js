import resolveDataPath from "../helpers/resolveDataPath.js";

/**
 * Preprocess template:
 * - finds elements with [drag]
 * - marks container so we can initialize drag on real DOM later
 * - does NOT attach listeners here, because this is only a parsed HTML string
 */
export function _drag(tpl) {
  // Fast exit if no drag attribute exists
  if (!tpl.includes("drag")) return tpl;

  // Parse template string into temporary DOM
  const doc = new DOMParser().parseFromString(tpl, "text/html");

  // Find all drag containers
  const containers = doc.querySelectorAll("[drag]");
  

  containers.forEach(container => {
    const dragKey = container.getAttribute("drag");

    // Save drag path into data attribute for runtime use
    container.setAttribute("data-jet-drag", dragKey);

    // Optional helper class for styling/debugging
    container.classList.add("jet-drag-container");
  });

  // Return updated HTML string
  return doc.body.innerHTML;
}

/**
 * Init drag-and-drop on the REAL rendered DOM.
 * Call this after render(), connectedCallback(), or after template output is mounted.
 */
export function _initDrag() {

  // Find all drag containers inside current component
  const containers = this.querySelectorAll("[data-jet-drag]");
  

  containers.forEach(container => {
    // Avoid double init on rerender
    if (container._jetDragReady) return;
    container._jetDragReady = true;

    // Function to refresh draggable attributes on current children
    const refreshItems = () => {
      const items = Array.from(container.children);

      items.forEach((item, index) => {
        // Only direct iterated children become draggable
        item.setAttribute("draggable", "true");
        item.dataset.dragIndex = index;
        

        // Avoid rebinding the same child multiple times
        if (item._jetDragBound) return;
        item._jetDragBound = true;

        // Start dragging
        item.addEventListener("dragstart", e => {
          item.classList.add("dragging");
          e.dataTransfer.effectAllowed = "move";
          e.dataTransfer.setData("text/plain", item.dataset.dragIndex);
        });

        // End dragging
        item.addEventListener("dragend", () => {
          item.classList.remove("dragging");

          // Reindex after visual move
          Array.from(container.children).forEach((child, i) => {
            child.dataset.dragIndex = i;
          });
        });
      });
    };

    // Initial setup
    refreshItems();

    // Allow dropping
    container.addEventListener("dragover", e => {
      e.preventDefault();

      const dragging = container.querySelector(".dragging");
      if (!dragging) return;

      const afterElement = getDragAfterElement(container, e.clientY);

      // Move element visually while dragging
      if (!afterElement) {
        container.appendChild(dragging);
      } else if (afterElement !== dragging) {
        container.insertBefore(dragging, afterElement);
      }
    });

    // Final drop: update data array
    container.addEventListener("drop", e => {
      e.preventDefault();

      const dragPath = container.getAttribute("data-jet-drag");
      const array = resolveDataPath(this, dragPath);

      if (!Array.isArray(array)) {
        
        return;
      }

      // Index before move
      const fromIndex = parseInt(e.dataTransfer.getData("text/plain"), 10);

      // Current visual order after dragover rearranged the DOM
      const children = Array.from(container.children);

      // The dragged element is already in its new visual position
      const dragging = container.querySelector(".dragging");
      if (!dragging) return;


      const toIndex = children.indexOf(dragging);

      if (fromIndex === -1 || toIndex === -1 || fromIndex === toIndex) {
        dragging.classList.remove("dragging");
        return;
      }

      // Update actual data array
      moveArrayItem(array, fromIndex, toIndex);      

      //do event - for using in components eg add button 'Save order'
      container.dispatchEvent(new Event("sortupdate", { bubbles: true }));

      // Cleanup class
      dragging.classList.remove("dragging");

      // Force rerender so DOM matches real data
      this.render?.();

      // If your system does not fully recreate DOM, refresh indexes again
      refreshItems();
    });
  });
}

/**
 * Move one item inside array from one index to another
 */
function moveArrayItem(arr, fromIndex, toIndex) {
  if (!Array.isArray(arr)) return;
  if (fromIndex < 0 || toIndex < 0) return;
  if (fromIndex >= arr.length || toIndex >= arr.length) return;

  const movedItem = arr.splice(fromIndex, 1)[0];
  arr.splice(toIndex, 0, movedItem);
}

/**
 * Find the element after which dragged element should be placed.
 * This uses mouse Y position and compares it with the center of each item.
 */
function getDragAfterElement(container, mouseY) {
  const draggableElements = [
    ...container.querySelectorAll('[draggable="true"]:not(.dragging)')
  ];

  let closest = {
    offset: Number.NEGATIVE_INFINITY,
    element: null
  };

  draggableElements.forEach(child => {
    const box = child.getBoundingClientRect();

    // Distance from mouse to center of element
    const offset = mouseY - box.top - box.height / 2;

    // We want the nearest element above the cursor
    if (offset < 0 && offset > closest.offset) {
      closest = {
        offset,
        element: child
      };
    }
  });

  return closest.element;
}
