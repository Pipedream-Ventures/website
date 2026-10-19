(() => {
  const toolbar = document.querySelector('.section-jump');
  const menu = document.querySelector('.section-menu');
  const menuLinks = document.querySelector('.section-links');
  const currentLabel = document.querySelector('.section-current');
  const links = [...document.querySelectorAll('.contents a[href^="#"]')];
  if (!toolbar || !menu || !menuLinks || !currentLabel || !links.length) return;
  const summary = menu.querySelector('summary');
  const pageLabel = currentLabel.textContent;

  const sections = links.map(link => ({
    link,
    target: document.getElementById(link.hash.slice(1)),
  })).filter(section => section.target);
  for (const section of sections) {
    section.menuLink = section.link.cloneNode(true);
    section.menuLink.setAttribute('aria-label', section.link.textContent.trim());
    menuLinks.append(section.menuLink);
  }
  toolbar.hidden = false;
  document.documentElement.classList.add('has-section-nav');

  function updateCurrent() {
    const offset = toolbar.getBoundingClientRect().height
      + document.querySelector('.site-header').getBoundingClientRect().height + 32;
    let current;
    for (const section of sections) {
      if (!section.target.hidden && section.target.getBoundingClientRect().top <= offset) current = section;
    }
    const page = document.documentElement;
    if (page.scrollTop + page.clientHeight >= page.scrollHeight - 2) {
      current = sections.filter(section => !section.target.hidden).at(-1);
    }
    for (const section of sections) {
      for (const link of [section.link, section.menuLink]) {
        if (section === current) link.setAttribute('aria-current', 'location');
        else link.removeAttribute('aria-current');
      }
    }
    currentLabel.textContent = current?.link.textContent || pageLabel;
  }

  menuLinks.addEventListener('click', event => {
    const link = event.target.closest('a[href^="#"]');
    if (!link) return;
    menu.open = false;
    requestAnimationFrame(() => {
      const target = document.getElementById(link.hash.slice(1));
      const focusTarget = target?.querySelector('input[type="search"], h2, h1') || target;
      if (!focusTarget) return;
      if (!focusTarget.matches('input')) focusTarget.setAttribute('tabindex', '-1');
      focusTarget.focus({preventScroll: true});
    });
  });
  document.addEventListener('pointerdown', event => {
    if (menu.open && !menu.contains(event.target)) menu.open = false;
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && menu.open) {
      menu.open = false;
      summary.focus({preventScroll: true});
    }
  });
  menu.addEventListener('focusout', () => requestAnimationFrame(() => {
    if (!menu.contains(document.activeElement)) menu.open = false;
  }));
  let pending = false;
  window.addEventListener('scroll', () => {
    if (pending) return;
    pending = true;
    requestAnimationFrame(() => { pending = false; updateCurrent(); });
  }, {passive: true});
  window.addEventListener('hashchange', () => {
    menu.open = false;
    requestAnimationFrame(updateCurrent);
  });
  window.addEventListener('resize', updateCurrent);
  document.querySelector('#help-search')?.addEventListener('input', () => requestAnimationFrame(updateCurrent));
  updateCurrent();
})();
