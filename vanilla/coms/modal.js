

export function modal() {
  // pt should select by href, not class or attribute, as want to use it WP
  const items = document.querySelectorAll('a[href^="#jm-"]');

  // Stop execution if no triggers
  if (!items.length) return;

  items.forEach(link => {
    // get modal element by href="#jm-test"
    let modalId = link.getAttribute('href');
    if (!modalId) return;

    let toggleIn = 'ja-fade-in-top';
    let toggleOut = 'ja-fade-out-top';
    //get target 
    modalId = modalId.slice(1);
    let modal = document.getElementById(modalId);

    //change default effects
    if (modal.classList.contains('jm-scale')) {
      toggleIn = 'ja-scale-in';
      toggleOut = 'ja-scale-out';
    } else if (modal.classList.contains('jm-fade')) {
      toggleIn = 'ja-fade-in';
      toggleOut = 'ja-fade-out';
    }


    // stop default jump-to-anchor
    link.addEventListener('click', (e) => {
      e.preventDefault();
      let checkBg = document.querySelector('.jm-bg');
      if (!checkBg) {
        modal.insertAdjacentHTML('beforebegin', `<div class="jm-bg jm-close jp ja-fade-in ja-display"></div>`);
        modal.classList.add('ja-display', 'jp', toggleIn);
      }
      close();//add close function

    });

    function close() {
      document.querySelectorAll('.jm-close').forEach(item => {
        item.addEventListener('click', () => {
          console.log('clicked');
          let bg = document.querySelector('.jm-bg');
          let modal = document.querySelector('.jm');
          if (bg) {
            bg.classList.add('ja-fade-out');
          }
          modal.classList.add(toggleOut);
          //clean classes and remove bg
          //wait for fading effect
          setTimeout(() => {
            bg.remove();
            modal.classList.remove(toggleIn, toggleOut, 'ja-display', 'jp');
          }, 1000);

        })
      })
    }



    // modalId = modalId.slice(1);
    // const modalElement = 
    // if (!modalElement) return;

    // // toggle classes by default
    // let toggleIn = 'ja-fade-in-top';
    // let toggleOut = 'ja-fade-out-top';

    // // todo set toggle classes (simple version)
    // // if modal has ja-scale-in => use ja-scale-out
    // // if modal has ja-fade-in => use ja-fade-out
    // // (you can extend later)
    // if (modalElement.classList.contains('ja-scale-in')) {
    //   toggleIn = 'ja-scale-in';
    //   toggleOut = 'ja-scale-out';
    // } else if (modalElement.classList.contains('ja-fade-in')) {
    //   toggleIn = 'ja-fade-in';
    //   toggleOut = 'ja-fade-out';
    // } else if (modalElement.classList.contains('ja-fade-in-top')) {
    //   toggleIn = 'ja-fade-in-top';
    //   toggleOut = 'ja-fade-out-top';
    // }

    // // Open the modal
    // link.addEventListener('click', () => {
    //   // 1) close any other opened modal (simple global close)
    //   // (this prevents multiple open modals / multiple backgrounds)
    //   const opened = document.querySelector('.jm.jp');
    //   if (opened && opened !== modalElement) {
    //     opened.classList.remove('ja-fade-in-top', 'ja-fade-in', 'ja-scale-in', 'ja-display');
    //     opened.classList.add('ja-fade-out-top', 'ja-fade-out', 'ja-scale-out', 'ja-display');
    //     const oldBg = opened.previousElementSibling;
    //     if (oldBg && oldBg.classList.contains('jm-bg')) oldBg.remove();
    //   }

    //   // 2) create background BEFORE modal (so it works even if modal is deep in DOM)
    //   // yes, you can do insertAdjacentHTML here
    //   // but first remove existing bg if somehow exists
    //   const prev = modalElement.previousElementSibling;
    //   if (prev && prev.classList.contains('jm-bg')) prev.remove();

    //   modalElement.insertAdjacentHTML('beforebegin', `<div class="jm-bg jm-close"></div>`);

    //   // 3) show + animate
    //   modalElement.classList.remove(toggleOut); // Remove hide class if opened again
    //   modalElement.classList.add('jp');         // service class which activates animation
    //   modalElement.classList.add(toggleIn);
    // });
  });

  // Close logic (ONE listener, not inside forEach)
  // doc can have a few close elements: background, close icon, button, etc.
  // document.addEventListener('click', (event) => {
  //   // only if click is on a close element
  //   const closeItem = event.target.closest('.jm-close');
  //   if (!closeItem) return;

  //   // find opened modal (your "jp" service class helps)
  //   const modalElement = document.querySelector('.jm.jp');
  //   if (!modalElement) return;

  //   // detect which animation to use for THIS modal (same logic as open, repeated but simple)
  //   let toggleIn = 'ja-fade-in-top';
  //   let toggleOut = 'ja-fade-out-top';

  //   if (modalElement.classList.contains('ja-scale-in')) {
  //     toggleIn = 'ja-scale-in';
  //     toggleOut = 'ja-scale-out';
  //   } else if (modalElement.classList.contains('ja-fade-in')) {
  //     toggleIn = 'ja-fade-in';
  //     toggleOut = 'ja-fade-out';
  //   } else if (modalElement.classList.contains('ja-fade-in-top')) {
  //     toggleIn = 'ja-fade-in-top';
  //     toggleOut = 'ja-fade-out-top';
  //   }

  //   // remove bg (bg is right before modal)
  //   const bg = modalElement.previousElementSibling;
  //   if (bg && bg.classList.contains('jm-bg')) bg.remove();

  //   // animate out
  //   modalElement.classList.remove(toggleIn);
  //   modalElement.classList.add(toggleOut);

  //   // optional: after animation remove "jp" service class
  //   // (so querySelector('.jm.jp') finds only really opened modals)
  //   modalElement.addEventListener(
  //     'animationend',
  //     () => {
  //       modalElement.classList.remove('jp');
  //     },
  //     { once: true }
  //   );
  // });

  // ESC close (optional but useful)
  // document.addEventListener('keydown', (e) => {
  //   if (e.key !== 'Escape') return;

  //   const modalElement = document.querySelector('.jm.jp');
  //   if (!modalElement) return;

  //   const bg = modalElement.previousElementSibling;
  //   if (bg && bg.classList.contains('jm-bg')) bg.remove();

  //   // simple: always use fade-out-top on ESC (or repeat detection like above)
  //   modalElement.classList.remove('ja-fade-in-top', 'ja-fade-in', 'ja-scale-in');
  //   modalElement.classList.add('ja-fade-out-top');

  //   modalElement.addEventListener(
  //     'animationend',
  //     () => modalElement.classList.remove('jp'),
  //     { once: true }
  //   );
  // });
}

export function modaOLD() {
  // pt should select by href, not class or attribute, as want to use it WP
  const items = document.querySelectorAll('a[href^="#jm-"]');

  // Stop execution if no triggers
  if (!items.length) return;

  items.forEach(link => {
    // get modal element by href="#jm-test"
    let modalId = link.getAttribute('href');
    if (!modalId) return;

    // stop default jump-to-anchor
    link.addEventListener('click', (e) => e.preventDefault());

    modalId = modalId.slice(1);
    const modalElement = document.getElementById(modalId);
    if (!modalElement) return;

    // toggle classes by default
    let toggleIn = 'ja-fade-in-top';
    let toggleOut = 'ja-fade-out-top';

    // todo set toggle classes (simple version)
    // if modal has ja-scale-in => use ja-scale-out
    // if modal has ja-fade-in => use ja-fade-out
    // (you can extend later)
    if (modalElement.classList.contains('ja-scale-in')) {
      toggleIn = 'ja-scale-in';
      toggleOut = 'ja-scale-out';
    } else if (modalElement.classList.contains('ja-fade-in')) {
      toggleIn = 'ja-fade-in';
      toggleOut = 'ja-fade-out';
    } else if (modalElement.classList.contains('ja-fade-in-top')) {
      toggleIn = 'ja-fade-in-top';
      toggleOut = 'ja-fade-out-top';
    }

    // Open the modal
    link.addEventListener('click', () => {
      // 1) close any other opened modal (simple global close)
      // (this prevents multiple open modals / multiple backgrounds)
      const opened = document.querySelector('.jm.jp');
      if (opened && opened !== modalElement) {
        opened.classList.remove('ja-fade-in-top', 'ja-fade-in', 'ja-scale-in', 'ja-display');
        opened.classList.add('ja-fade-out-top', 'ja-fade-out', 'ja-scale-out', 'ja-display');
        const oldBg = opened.previousElementSibling;
        if (oldBg && oldBg.classList.contains('jm-bg')) oldBg.remove();
      }

      // 2) create background BEFORE modal (so it works even if modal is deep in DOM)
      // yes, you can do insertAdjacentHTML here
      // but first remove existing bg if somehow exists
      const prev = modalElement.previousElementSibling;
      if (prev && prev.classList.contains('jm-bg')) prev.remove();

      modalElement.insertAdjacentHTML('beforebegin', `<div class="jm-bg jm-close"></div>`);

      // 3) show + animate
      modalElement.classList.remove(toggleOut); // Remove hide class if opened again
      modalElement.classList.add('jp');         // service class which activates animation
      modalElement.classList.add(toggleIn);
    });
  });

  // Close logic (ONE listener, not inside forEach)
  // doc can have a few close elements: background, close icon, button, etc.
  document.addEventListener('click', (event) => {
    // only if click is on a close element
    const closeItem = event.target.closest('.jm-close');
    if (!closeItem) return;

    // find opened modal (your "jp" service class helps)
    const modalElement = document.querySelector('.jm.jp');
    if (!modalElement) return;

    // detect which animation to use for THIS modal (same logic as open, repeated but simple)
    let toggleIn = 'ja-fade-in-top';
    let toggleOut = 'ja-fade-out-top';

    if (modalElement.classList.contains('ja-scale-in')) {
      toggleIn = 'ja-scale-in';
      toggleOut = 'ja-scale-out';
    } else if (modalElement.classList.contains('ja-fade-in')) {
      toggleIn = 'ja-fade-in';
      toggleOut = 'ja-fade-out';
    } else if (modalElement.classList.contains('ja-fade-in-top')) {
      toggleIn = 'ja-fade-in-top';
      toggleOut = 'ja-fade-out-top';
    }

    // remove bg (bg is right before modal)
    const bg = modalElement.previousElementSibling;
    if (bg && bg.classList.contains('jm-bg')) bg.remove();

    // animate out
    modalElement.classList.remove(toggleIn);
    modalElement.classList.add(toggleOut);

    // optional: after animation remove "jp" service class
    // (so querySelector('.jm.jp') finds only really opened modals)
    modalElement.addEventListener(
      'animationend',
      () => {
        modalElement.classList.remove('jp');
      },
      { once: true }
    );
  });

  // ESC close (optional but useful)
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;

    const modalElement = document.querySelector('.jm.jp');
    if (!modalElement) return;

    const bg = modalElement.previousElementSibling;
    if (bg && bg.classList.contains('jm-bg')) bg.remove();

    // simple: always use fade-out-top on ESC (or repeat detection like above)
    modalElement.classList.remove('ja-fade-in-top', 'ja-fade-in', 'ja-scale-in');
    modalElement.classList.add('ja-fade-out-top');

    modalElement.addEventListener(
      'animationend',
      () => modalElement.classList.remove('jp'),
      { once: true }
    );
  });
}
