(() => {
  document.documentElement.classList.add('js');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // reveal on scroll
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
  }), { rootMargin: '0px 0px -8% 0px' });
  document.querySelectorAll('.rv').forEach((n, k) => { n.style.transitionDelay = (k % 3) * 70 + 'ms'; io.observe(n); });

  // boot log typing
  const el = document.getElementById('boot');
  if (el) {
    const L = [
      ['c-dim', 'BdsDxe: loading Boot0001 "UEFI QEMU HARDDISK"'],
      ['c-dim', 'BdsDxe: starting \\EFI\\BOOT\\BOOTX64.EFI'],
      ['', ''],
      ['c-b', 'SharpOS 0.1 (NativeAOT/UEFI) x86_64'],
      ['ok', 'GOP framebuffer 1280x800'],
      ['ok', 'ExitBootServices'],
      ['ok', 'paging: CR3 loaded, identity map'],
      ['ok', 'IDT: 256 vectors via Iced stubs'],
      ['ok', 'GC: mark-sweep, precise stack scan'],
      ['ok', 'local APIC timer 100 Hz, HPET'],
      ['ok', 'xHCI: 3 devices, HID keyboard'],
      ['ok', 'FAT32 mounted \\'],
      ['ok', 'CoreCLR host ready'],
      ['c-p', 'INIT=\\bin\\LAUNCHER.EXE'],
      ['', ''],
      ['p', "pipegen 100 | KQL 'summarize n = count() by Level'"],
      ['', '[kql] start ms: declared=0 bind1=0 bind2=1 first=5 total=6'],
      ['x', '0'], ['x', '1'], ['x', '2'], ['x', '3'], ['x', '4'],
      ['p', 'DOOM.EXE'],
    ];
    const esc = s => s.replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));
    const prompt = '<span class="c-ok">\\home $</span> ';
    const fmt = ([k, t]) => k === 'ok' ? `<span class="c-ok">[  OK  ]</span> ${esc(t)}`
      : k === 'x' ? `<span class="c-ok">Expando</span> { Level = <span class="c-n">${t}</span>, n = <span class="c-n">20</span> }`
      : k === 'p' ? prompt + esc(t)
      : k ? `<span class="${k}">${esc(t)}</span>` : esc(t);
    if (reduce) {
      el.innerHTML = L.map(fmt).join('\n') + ' <span class="cur"></span>';
    } else {
      let i = 0, html = '';
      const show = s => { el.innerHTML = s; el.scrollTop = el.scrollHeight; };
      const step = () => {
        if (i >= L.length) { show(html + '<span class="cur"></span>'); setTimeout(() => { i = 0; html = ''; step(); }, 5000); return; }
        const line = L[i++];
        if (line[0] === 'p') {
          let j = 0; const t = line[1]; const pre = html + prompt;
          const typ = () => {
            show(pre + esc(t.slice(0, j)) + '<span class="cur"></span>');
            if (j++ < t.length) setTimeout(typ, 28 + Math.random() * 40);
            else { html = pre + esc(t) + '\n'; setTimeout(step, 350); }
          };
          typ(); return;
        }
        html += fmt(line) + '\n';
        show(html + '<span class="cur"></span>');
        setTimeout(step, line[0] === 'ok' ? 110 + Math.random() * 160 : 60);
      };
      setTimeout(step, 400);
    }
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
