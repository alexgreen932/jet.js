// tabs.js
export default function tabs() {
  initTabs();
  openTabFromHash(); // on load

  // optional: open when user uses back/forward or manually changes hash
  window.addEventListener("hashchange", openTabFromHash);
}

const ANIM_MS = 500; // keep in sync with your CSS animation duration

function initTabs() {
  const items = document.querySelectorAll(".j-tabs");

  items.forEach((wrap, index) => {
    const tabsId = `j-tabs-${index + 1}`;
    wrap.id = tabsId;

    const tabLinks = wrap.querySelectorAll(".d-tabs a");
    const tabContents = wrap.querySelectorAll(".d-tab-content li");

    // assign ids/hrefs + default first active
    tabLinks.forEach((link, i) => {
      const targetId = `${tabsId}-${i + 1}`;
      link.setAttribute("href", `#${targetId}`);

      if (i === 0) link.classList.add("is-active");

      link.addEventListener("click", () => {
        // let the hash update naturally via the href
        // then open based on that id
        openTab(wrap, targetId);
      });
    });

    tabContents.forEach((li, i) => {
      const contentId = `${tabsId}-${i + 1}`;
      li.id = contentId;

      if (i === 0) li.classList.add("d-active");
    });
  });
}

function openTabFromHash() {
  const hash = window.location.hash; // like "#j-tabs-1-2"
  if (!hash) return;

  const targetId = hash.replace("#", "");
  const targetEl = document.getElementById(targetId);
  if (!targetEl) return; // hash doesn't match any tab content on page

  const wrap = targetEl.closest(".j-tabs");
  if (!wrap) return;

  openTab(wrap, targetId);

  // optional: if you want to scroll to the tabs block when opened by hash
  wrap.scrollIntoView({ behavior: "smooth", block: "start" });
}

function openTab(wrap, targetId) {
  const tabLinks = wrap.querySelectorAll(".d-tabs a");
  const tabContents = wrap.querySelectorAll(".d-tab-content li");

  // remove active from tabs
  tabLinks.forEach((a) => a.classList.remove("is-active"));

  // start fade-out for all contents
  tabContents.forEach((li) => {
    li.classList.add("d-out");

    setTimeout(() => {
      li.classList.remove("d-out", "d-active");
    }, ANIM_MS);
  });

  // after fade-out, activate the requested one
  setTimeout(() => {
    // activate link that points to this id
    const activeLink = wrap.querySelector(`.d-tabs a[href="#${targetId}"]`);
    if (activeLink) activeLink.classList.add("is-active");

    const current = document.getElementById(targetId);
    if (current) current.classList.add("d-active");
  }, ANIM_MS);
}
