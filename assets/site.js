(() => {
  // quick-start tabs
  const tabs = Array.from(document.querySelectorAll('.tabs button'));
  const panels = Array.from(document.querySelectorAll('.panel'));
  tabs.forEach(b => b.addEventListener('click', () => {
    tabs.forEach(x => x.setAttribute('aria-selected', String(x === b)));
    panels.forEach(p => p.classList.toggle('on', p.id === 'p-' + b.dataset.t));
  }));

  // copy buttons: strip comment lines and trailing comments
  document.querySelectorAll('.copy').forEach(b => {
    const label = b.textContent;
    const pre = b.parentElement.querySelector('pre');
    if (!pre) return;
    b.addEventListener('click', async () => {
      const txt = pre.innerText.split('\n')
        .filter(l => !l.trim().startsWith('#'))
        .map(l => l.replace(/\s+#.*$/, ''))
        .join('\n').trim();
      try { await navigator.clipboard.writeText(txt); b.textContent = b.dataset.done || 'copied'; }
      catch { b.textContent = b.dataset.fail || 'failed'; }
      setTimeout(() => { b.textContent = label; }, 1500);
    });
  });
})();
