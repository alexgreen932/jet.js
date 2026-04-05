export default function accordion() {
  document.querySelectorAll('.j-accordion').forEach(acc => {
    const items = acc.querySelectorAll('li');

    items.forEach(item => {
      const h = item.querySelector('h3');
      const c = item.querySelector('.d-content');
      if (!h || !c) return;

      h.addEventListener('click', () => {
        // close others smoothly
        items.forEach(i => {
          const panel = i.querySelector('.d-content');
          if (!panel) return;
          if (panel !== c && panel.classList.contains('in')) {
            panel.classList.remove('in');
            panel.classList.add('out');
          }
        });

        // open current
        // (if it was mid-closing with 'out', drop it so open anim restarts cleanly)
        c.classList.remove('out');
        // force reflow so removing 'out' doesn't merge with adding 'in'
        void c.offsetWidth;
        c.classList.add('in');
      });

      // remove 'out' after the close transition finishes
      c.addEventListener('transitionend', (e) => {
        if (e.propertyName === 'max-height' && !c.classList.contains('in')) {
          c.classList.remove('out');
        }
      });
    });
  });
}
