(() => {
  if (/(^|\.)sharpos\.org$/.test(location.hostname)) { location.replace('https://sharpos.net' + location.pathname + location.search + location.hash); return; }
  document.documentElement.classList.add('js');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // reveal on scroll
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
  }), { rootMargin: '0px 0px -8% 0px' });
  document.querySelectorAll('.rv').forEach((n, k) => { n.style.transitionDelay = (k % 3) * 70 + 'ms'; io.observe(n); });

  // boot log: the full session is static HTML inside <pre id="boot">;
  // with JS and no reduced-motion preference we replay it line by line.
  const el = document.getElementById('boot');
  if (el && !reduce) {
    const lines = el.innerHTML.split('\n');
    const cur = '<span class="cur"></span>';
    const PROMPT = '<span class="c-ok">\\home</span> $ ';
    const pauseBefore = t => t.startsWith('<span class="c-b">===') ? 350 : t.startsWith('<span class="c-cy">SharpOS shell') ? 600 : 0;
    let i = 0, html = '';
    const show = s => { el.innerHTML = s; el.scrollTop = el.scrollHeight; };
    const step = () => {
      if (i >= lines.length) { show(html + cur); setTimeout(() => { i = 0; html = ''; step(); }, 7000); return; }
      const line = lines[i++];
      if (line.startsWith(PROMPT)) {
        const t = line.slice(PROMPT.length); let j = 0; const pre = html + PROMPT;
        const typ = () => {
          show(pre + t.slice(0, j) + cur);
          if (j++ < t.length) setTimeout(typ, 28 + Math.random() * 40);
          else { html = pre + t + '\n'; setTimeout(step, 350); }
        };
        setTimeout(typ, 500); return;
      }
      const go = () => { html += line + '\n'; show(html + cur); setTimeout(step, line.startsWith('<span class="c-dim">[') ? 25 + Math.random() * 70 : 120); };
      const w = pauseBefore(line); w ? setTimeout(go, w) : go();
    };
    el.innerHTML = '';
    setTimeout(step, 400);
  }

  // last commit of the SharpOS repo: static fallback in HTML, live value from GitHub
  const bEl = document.querySelector('[data-build]'), tEl = document.querySelector('[data-updated]');
  if (bEl && tEl) {
    fetch('https://api.github.com/repos/daniilvaino/SharpOS/commits/main', { headers: { Accept: 'application/vnd.github+json' } })
      .then(r => r.ok ? r.json() : null)
      .then(d => {
        if (!d || !d.sha) return;
        bEl.textContent = d.sha.slice(0, 7);
        const date = new Date(d.commit.committer.date);
        tEl.dateTime = date.toISOString().slice(0, 10);
        tEl.textContent = date.toLocaleDateString(document.documentElement.lang, { day: 'numeric', month: 'long', year: 'numeric' });
      }).catch(() => {});
  }

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
