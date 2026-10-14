(() => {
  document.documentElement.classList.add('js');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // reveal on scroll
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
  }), { rootMargin: '0px 0px -8% 0px' });
  document.querySelectorAll('.rv').forEach((n, k) => { n.style.transitionDelay = (k % 3) * 70 + 'ms'; io.observe(n); });

  // boot log: real lines from last_kernel.log / last_app.log, trimmed
  const el = document.getElementById('boot');
  if (el) {
    // [kind, text]  kind: '' plain, 'k' kernel line, 'b' bold, 'd' dim, 'e' error,
    // 'p' typed command (3rd item = prompt variant), 'x' Expando row, 'w' pause ms
    const L = [
      ['d', 'BdsDxe: loading Boot0002 "UEFI QEMU QEMU USB HARDDRIVE 1-0000:00:02.0-3"'],
      ['d', 'BdsDxe: starting Boot0002 "UEFI QEMU QEMU USB HARDDRIVE 1-0000:00:02.0-3"'],
      ['k', '[uefi] image protection: base=0x7CBBB000 size=0xD07000'],
      ['k', '[info] boot info ready, switching to the kernel stack'],
      ['k', '[info] on the kernel stack, installing the IDT'],
      ['b', '[info] SharpOS 0.1'],
      ['k', '[info] build: 931671e+dirty.1014-2355-pipe-dev'],
      ['k', '[info] boot: UEFI  fw: EDK II / rev 65536'],
      ['k', '[info] caps: TextOutput Shutdown MemoryMap ExternalElf KeyboardInput'],
      ['k', '[info] idt installed'],
      ['k', '[info] memory regions: 83'],
      ['k', '[info] usable pages: 509110'],
      ['k', '[info] heap init ok'],
      ['k', '[info] iface dispatch bridge installed'],
      ['k', '[info] throw-ex shellcode: bytes=150 head=0x000000007D7A6358'],
      ['k', '[info] call-catch-funclet shellcode installed'],
      ['k', '[info] gc collect hook installed (precise once the walker is up)'],
      ['k', '[info] coff-pdata: records=25800 managed=0x00C50000..0x00CF6684'],
      ['k', '[cr3] readstub iced=legacy OK len=0x4'],
      ['k', '[cr3] writestub iced=legacy OK len=0x7'],
      ['k', '[info] pager root activated (clone CR3 live)'],
      ['k', '[info] VA 0 unmapped (null-deref trap)'],
      ['k', '[info] tss: double fault on its own stack (IST1)'],
      ['k', '[info] framebuffer mapped: 1280x800 va=0x80000000 modes=30'],
      ['k', '[info] acpi madt: lapic=0xFEE00000 cpus=1 ioapics=1'],
      ['k', '[info] hpet: freq=100000000 Hz comparators=3 64bit=yes'],
      ['k', '[serial] COM1 own 16550: PRESENT (loopback OK)'],
      ['k', '[gop] 1280x800 base=0x80000000 stride=1280 fmt=1'],
      ['k', '[pci] devs=6 ahci=0:31.2 id=0x8086:0x2922 PASS'],
      ['k', '[usb] xHCI(3.x) at 0:2.0 vid=0x1B36 did=0xD mmio=0xC000000000'],
      ['k', '[ebs] ExitBootServices OK -- POST-EBS substrate LIVE'],
      ['k', '[apic] id=0 ver=0x14 timer=1563 kHz'],
      ['k', '[xhci] port 2 connected speed=4 (usb3) slot=1 functions=storage'],
      ['k', '[xhci] port 4 connected speed=3 (usb2) slot=2 functions=keyboard'],
      ['k', '[xhci] usb keyboard attached as system input'],
      ['k', '[fat] mount=Y FAT32 bps=512 spc=8 lfn:CoreLib.dll sz=16003072 PASS'],
      ['w', 300],
      ['b', '=== CoreClrProbe ==='],
      ['k', '[host] GC heap limit 994 MiB of 1988 MiB usable'],
      ['k', '[host] FileOpen path="\\sharpos\\System.Private.CoreLib.dll"'],
      ['k', '[fsread] done sz=16003072 read_ms=38 total_ms=69'],
      ['k', '[r2r] System.Private.CoreLib: Ready to Run initialized successfully'],
      ['w', 400],
      ['k', 'coreclr_initialize hr=0x0'],
      ['b', '=== S_OK — CoreCLR initialized ==='],
      ['k', '[info] pe launcher start'],
      ['k', '[info] config: \\config\\system.env read'],
      ['k', '[info] app run start: \\bin\\LAUNCHER.EXE'],
      ['w', 600],
      ['', ''],
      ['h', '<span class="c-cy">SharpOS shell</span><span class="c-dim"> — \'help\' for what exists, Tab completes, Up/Down for history, \'exit\' to leave</span>'],
      ['p', "pipegen 100 | KQL 'summarize n = count() by Level'"],
      ['', '[kql] start ms: declared=0 bind1=0 bind2=1 first=5 total=6'],
      ['x', '0'], ['x', '1'], ['x', '2'], ['x', '3'], ['x', '4'],
      ['w', 700],
      ['p', 'DOOM.EXE'],
    ];
    const esc = s => s.replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));
    const prompt = v => '<span class="c-ok">\\home</span>' + (v === 'err' ? '<span class="c-err"> [2]</span>' : '') + ' $ ';
    const kline = t => esc(t)
      .replace(/^(\[[a-z0-9]+\])/, '<span class="c-dim">$1</span>')
      .replace(/\b(OK|PASS|LIVE)\b/g, '<span class="c-ok">$1</span>');
    const fmt = ([k, t]) =>
      k === 'k' ? kline(t)
      : k === 'b' ? `<span class="c-b">${esc(t)}</span>`
      : k === 'd' ? `<span class="c-dim">${esc(t)}</span>`
      : k === 'h' ? t
      : k === 'x' ? `<span class="c-cy">Expando</span><span class="c-dim"> { </span>Level<span class="c-dim"> = </span><span class="c-w">${t}</span><span class="c-dim">, </span>n<span class="c-dim"> = </span><span class="c-w">20</span><span class="c-dim"> }</span>`
      : esc(t);
    const cur = '<span class="cur"></span>';
    if (reduce) {
      el.innerHTML = L.filter(l => l[0] !== 'w').map(l => l[0] === 'p' ? prompt(l[2]) + esc(l[1]) : fmt(l)).join('\n') + ' ' + cur;
    } else {
      let i = 0, html = '';
      const show = s => { el.innerHTML = s; el.scrollTop = el.scrollHeight; };
      const step = () => {
        if (i >= L.length) { show(html + cur); setTimeout(() => { i = 0; html = ''; step(); }, 7000); return; }
        const line = L[i++];
        if (line[0] === 'w') { setTimeout(step, line[1]); return; }
        if (line[0] === 'p') {
          let j = 0; const t = line[1]; const pre = html + prompt(line[2]);
          const typ = () => {
            show(pre + esc(t.slice(0, j)) + cur);
            if (j++ < t.length) setTimeout(typ, 28 + Math.random() * 40);
            else { html = pre + esc(t) + '\n'; setTimeout(step, 350); }
          };
          setTimeout(typ, 500); return;
        }
        html += fmt(line) + '\n';
        show(html + cur);
        setTimeout(step, line[0] === 'k' ? 25 + Math.random() * 70 : 120);
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
