(() => {
  const form = document.querySelector('.search');
  const input = document.querySelector('#help-search');
  const clear = document.querySelector('.clear-search');
  const status = document.querySelector('.search-status');
  const empty = document.querySelector('.no-results');
  const groups = [...document.querySelectorAll('.help-group')];
  const articles = groups.flatMap(group => [...group.querySelectorAll('details')]);
  const normalise = value => value.toLocaleLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const texts = new Map(articles.map(article => [article, normalise(article.textContent + ' ' + article.dataset.terms)]));
  let searching = false;
  let openBeforeSearch = new Set();

  function filter() {
    const words = normalise(input.value.trim()).split(/\s+/).filter(Boolean);
    if (words.length && !searching) {
      openBeforeSearch = new Set(articles.filter(article => article.open));
      searching = true;
    }
    let count = 0;
    for (const article of articles) {
      const matches = words.every(word => texts.get(article).includes(word));
      article.hidden = !matches;
      if (matches) count++;
      if (words.length) article.open = matches;
      else if (searching) article.open = openBeforeSearch.has(article);
    }
    for (const group of groups) group.hidden = ![...group.querySelectorAll('details')].some(article => !article.hidden);
    empty.hidden = count !== 0;
    clear.hidden = words.length === 0;
    status.textContent = words.length ? `${count} ${count === 1 ? 'answer' : 'answers'} found` : '';
    if (!words.length) searching = false;
  }
  function reset() {
    input.value = '';
    filter();
    input.focus();
  }
  function revealTarget() {
    const id = location.hash.slice(1);
    const target = document.getElementById(id);
    if (!target) return;
    if (target.closest('.help-group')) {
      if (input.value) {
        input.value = '';
        filter();
      }
      if (target.tagName === 'DETAILS') target.open = true;
      // A hidden search result must be revealed before the anchor can scroll.
      requestAnimationFrame(() => target.scrollIntoView({block:'start'}));
    }
  }
  form.hidden = false;
  form.addEventListener('submit', event => { event.preventDefault(); filter(); });
  input.addEventListener('input', filter);
  clear.addEventListener('click', reset);
  document.querySelector('#reset-search').addEventListener('click', reset);
  window.addEventListener('hashchange', revealTarget);
  // Clicking a topic that is already the current hash must still clear a search.
  document.querySelectorAll('a[href^="#"]').forEach(link => link.addEventListener('click', () => {
    if (link.hash === location.hash) revealTarget();
  }));
  revealTarget();
})();
