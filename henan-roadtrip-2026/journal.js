/* Small progressive enhancements; all links and booking details work without JS. */
(() => {
  'use strict';
  const header = document.querySelector('.site-header');
  const dayNav = document.querySelector('.day-navigation');
  const links = [...document.querySelectorAll('.day-link')];
  const days = [...document.querySelectorAll('.day-card')];
  const chapterLinks = [...document.querySelectorAll('.chapter-nav a')];
  const chapters = ['overview', 'booking', 'daily', 'memo'].map(id => document.getElementById(id)).filter(Boolean);
  const topLink = document.querySelector('.floating-top');
  const toggle = document.querySelector('.booking-toggle');
  const details = [...document.querySelectorAll('.booking-item')];
  const mobile = window.matchMedia('(max-width:760px)');
  let lastDay = null;
  let scheduled = false;
  const sync = () => {
    scheduled = false;
    const headerHeight = header ? header.getBoundingClientRect().height : 60;
    const navHeight = mobile.matches && dayNav ? dayNav.getBoundingClientRect().height : 0;
    const threshold = headerHeight + navHeight + (mobile.matches ? 48 : 92);
    let currentDay = null;
    for (const day of days) if (day.getBoundingClientRect().top <= threshold) currentDay = day.id;
    for (const link of links) {
      const active = link.hash === '#' + currentDay;
      if (active) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    }
    // Keep the active day visible without moving the document vertically.
    if (currentDay !== lastDay && mobile.matches && currentDay) {
      const active = links.find(link => link.hash === '#' + currentDay);
      const scroller = document.querySelector('.day-nav-scroll');
      if (active && scroller) {
        const a = active.getBoundingClientRect();
        const r = scroller.getBoundingClientRect();
        if (a.left < r.left || a.right > r.right) scroller.scrollLeft += a.left - r.left - (r.width - a.width) / 2;
      }
    }
    lastDay = currentDay;
    let currentChapter = null;
    for (const section of chapters) if (section.getBoundingClientRect().top <= headerHeight + 150) currentChapter = section.id;
    for (const link of chapterLinks) {
      if (link.hash === '#' + currentChapter) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    }
    if (topLink) topLink.hidden = window.scrollY < 650;
  };
  const queue = () => { if (!scheduled) { scheduled = true; requestAnimationFrame(sync); } };
  addEventListener('scroll', queue, {passive: true});
  addEventListener('resize', queue, {passive: true});
  addEventListener('hashchange', queue);
  if (toggle && details.length) {
    toggle.hidden = false;
    const label = () => { toggle.textContent = details.every(item => item.open) ? '收起全部' : '展开全部'; };
    toggle.addEventListener('click', () => {
      const open = !details.every(item => item.open);
      details.forEach(item => { item.open = open; });
      label(); queue();
    });
    details.forEach(item => item.addEventListener('toggle', () => { label(); queue(); }));
    label();
  }
  // Honour links into a collapsed memo or booking row.
  const revealTarget = () => {
    let target;
    try { target = location.hash ? document.getElementById(decodeURIComponent(location.hash.slice(1))) : null; }
    catch (_) { return; }
    if (!target) return;
    const closed = target.closest('details:not([open])');
    if (closed) closed.open = true;
    queue();
  };
  addEventListener('hashchange', revealTarget);
  revealTarget(); sync();
})();
