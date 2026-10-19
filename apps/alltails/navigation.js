(() => {
  const toolbar = document.querySelector('.section-jump');
  const select = document.querySelector('#section-select');
  const links = [...document.querySelectorAll('.contents a[href^="#"]')];
  if (!toolbar || !select || !links.length) return;

  const sections = links.map(link => ({
    link,
    target: document.getElementById(link.hash.slice(1)),
  })).filter(section => section.target);
  for (const {link} of sections) {
    select.add(new Option(link.textContent, link.hash));
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
      if (section === current) section.link.setAttribute('aria-current', 'location');
      else section.link.removeAttribute('aria-current');
    }
    if (document.activeElement !== select) select.value = current?.link.hash || '';
  }

  select.addEventListener('change', () => {
    if (!select.value) return;
    const target = document.getElementById(select.value.slice(1));
    if (!target) return;
    // The help page clears a search before revealing a hidden topic.
    if (location.hash === select.value) {
      document.querySelector('.contents a[href="' + select.value + '"]')?.click();
      target.scrollIntoView({block: 'start'});
    } else {
      location.hash = select.value;
    }
    select.blur();
  });
  let pending = false;
  window.addEventListener('scroll', () => {
    if (pending) return;
    pending = true;
    requestAnimationFrame(() => { pending = false; updateCurrent(); });
  }, {passive: true});
  window.addEventListener('hashchange', () => requestAnimationFrame(updateCurrent));
  window.addEventListener('resize', updateCurrent);
  document.querySelector('#help-search')?.addEventListener('input', () => requestAnimationFrame(updateCurrent));
  updateCurrent();
})();
