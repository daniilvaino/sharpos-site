(() => {
  document.documentElement.classList.add('js');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // falling portraits in the background: a fixed canvas behind the page,
  // a few dozen small sprites drifting down. Off under reduced-motion.
  if (!reduce) {
    const cv = document.createElement('canvas');
    cv.className = 'snow'; cv.setAttribute('aria-hidden', 'true');
    document.body.prepend(cv);
    const ctx = cv.getContext('2d');
    const css = document.querySelector('link[rel="stylesheet"]').href;
    const img = new Image(); img.src = css.replace(/assets\/site\.css.*$/, 'media/mascot.webp');
    let W = 0, H = 0, dpr = 1, flakes = [], last = 0, raf = 0, lastS = 0;
    const rnd = (a, b) => a + Math.random() * (b - a);
    // the sprite is pre-scaled once to its largest on-screen size, so each
    // frame samples a small bitmap instead of the 436x512 source
    const sp = document.createElement('canvas');
    const SMAX = 56;
    const prescale = () => {
      sp.height = Math.ceil(SMAX * dpr); sp.width = Math.ceil(sp.height * img.naturalWidth / img.naturalHeight);
      sp.getContext('2d').drawImage(img, 0, 0, sp.width, sp.height);
    };
    // full strength in the margins, dimmed inside the 1040px text column
    const COL = 520;
    const fade = (x) => { const d = Math.abs(x - W / 2) - COL; return d >= 24 ? 1 : d <= -24 ? 0.3 : 0.3 + 0.7 * (d + 24) / 48; };
    const make = (fresh) => {
      const z = Math.random();                       // depth: 0 far, 1 near
      const s = 22 + z * 34;                         // sprite height in css px
      return { x: rnd(-s, W + s), y: fresh ? -s * 1.3 : rnd(-s, H), s, z,
        vy: 14 + z * 26, ph: rnd(0, Math.PI * 2), sw: rnd(6, 18), swv: rnd(0.4, 0.9),
        r: rnd(-0.4, 0.4), rv: rnd(-0.35, 0.35), a: 0.18 + z * 0.22 };
    };
    const size = () => {
      // the canvas is sized to the large viewport (100lvh), so the mobile
      // address bar sliding in and out does not change it; the backing
      // store is only reallocated when its pixel size really changes
      W = cv.clientWidth; H = cv.clientHeight;
      const d = Math.min(devicePixelRatio || 1, 2), bw = Math.round(W * d), bh = Math.round(H * d);
      if (d !== dpr) { dpr = d; prescale(); }
      if (bw !== cv.width || bh !== cv.height) { cv.width = bw; cv.height = bh; }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const n = Math.round(Math.min(Math.max(W * H / 42000, 10), 36));
      while (flakes.length < n) flakes.push(make(false));
      flakes.length = n;
    };
    const tick = (t) => {
      const dt = Math.min((t - last) / 1000, 0.05); last = t;
      // scrolling moves the snow with the page, near flakes more than far ones
      const sy = scrollY, ds = sy - lastS; lastS = sy;
      ctx.clearRect(0, 0, W, H);
      const ar = sp.width / sp.height;
      for (const f of flakes) {
        f.y += f.vy * dt - ds * (0.35 + 0.65 * f.z); f.ph += f.swv * dt; f.r += f.rv * dt;
        const top = -f.s * 1.5, bot = H + f.s * 1.5;
        if (f.y > bot) Object.assign(f, make(true));
        else if (f.y < top) { f.y += bot - top; f.x = rnd(-f.s, W + f.s); }
        const x = f.x + Math.sin(f.ph) * f.sw, h = f.s, w = h * ar;
        ctx.globalAlpha = f.a * fade(x);
        ctx.setTransform(dpr, 0, 0, dpr, x * dpr, f.y * dpr);
        ctx.rotate(f.r);
        ctx.drawImage(sp, -w / 2, -h / 2, w, h);
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.globalAlpha = 1;
      raf = requestAnimationFrame(tick);
    };
    const start = () => { if (!raf) { last = performance.now(); lastS = scrollY; raf = requestAnimationFrame(tick); } };
    const stop = () => { cancelAnimationFrame(raf); raf = 0; };
    addEventListener('resize', size);
    document.addEventListener('visibilitychange', () => document.hidden ? stop() : start());
    img.onload = () => { dpr = 0; size(); start(); };
  }

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
