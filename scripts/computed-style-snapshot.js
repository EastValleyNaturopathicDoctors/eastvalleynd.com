/**
 * Computed-style snapshot — a render-equivalence check for CSS refactors.
 *
 * Loads each route in a same-origin iframe at desktop and phone widths, and
 * for every element in <body> hashes its full getComputedStyle() (plus any
 * ::before/::after that has content). Snapshot before a change, snapshot after,
 * diff with `extract/style_snapshot_diff.py`: zero differing hashes means the
 * CSS renders identically on those pages. Menus are also snapped in their open
 * state; animations/transitions are frozen so timing cannot create noise.
 *
 * Run it against the production build on http://127.0.0.1:4322/ (`npm run
 * preview`), from a tab on that origin — paste into DevTools, or pass the
 * function to the chrome-devtools MCP `evaluate_script` with a `filePath`
 * inside the repo (site/node_modules/ is gitignored and handy). 26 routes × 2
 * widths × 2 states took ~70 s and produced ~87,000 hashes. Used for D102.
 */
async () => {
  const routes = ['/', '/about/', '/conditions/', '/services/', '/resources/', '/blog/', '/contact/',
    '/schedule-appointment/', '/new-patient-appointment-request/', '/webinars/', '/physicians/',
    '/physicians/jason-porter/', '/physicians/jennifer-nevels/', '/heart-rate-variability-training/',
    '/conditions/cancer-support/', '/conditions/childhood-behavioral-disorders/', '/iv-therapy/',
    '/the-best-cookware-for-non-toxic-cooking/', '/how-dirty-is-your-soap/', '/404.html',
    '/forms-and-handouts/', '/neurofeedback/', '/mens-health/', '/qeeg-brain-mapping/',
    '/about/our-mission/', '/conditions/gut-health/'];
  const widths = [1280, 375];
  const hash = s => { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return (h >>> 0).toString(16); };
  const out = {}; const t0 = Date.now();
  const holder = document.createElement('div'); holder.style.cssText = 'position:fixed;left:0;top:0;z-index:9999;background:#fff'; document.body.appendChild(holder);
  for (const w of widths) {
    const f = document.createElement('iframe'); f.style.cssText = `width:${w}px;height:900px;border:0`; holder.appendChild(f);
    for (const r of routes) {
      await new Promise(res => { f.onload = res; f.src = r + '?v=' + Date.now(); });
      const d = f.contentDocument, win = f.contentWindow;
      const st = d.createElement('style'); st.textContent = '*,*::before,*::after{animation:none!important;transition:none!important}'; d.head.appendChild(st);
      await d.fonts.ready; await new Promise(res => setTimeout(res, 200));
      const snap = label => {
        const rows = [];
        for (const el of d.querySelectorAll('body, body *')) {
          if (el.tagName === 'SCRIPT' || el.tagName === 'STYLE') continue;
          const parts = []; let n = el;
          while (n && n !== d.documentElement) { const p = n.parentElement; const idx = p ? Array.prototype.indexOf.call(p.children, n) : 0; const cn = typeof n.className === 'string' && n.className.trim() ? '.' + n.className.trim().split(/\s+/).join('.') : ''; parts.unshift(n.tagName.toLowerCase() + cn + ':' + idx); n = p; }
          const path = parts.join('>');
          let s = ''; const cs = win.getComputedStyle(el); for (let i = 0; i < cs.length; i++) { const k = cs[i]; s += k + ':' + cs.getPropertyValue(k) + ';'; }
          const row = [path, hash(s)];
          for (const ps of ['::before', '::after']) { const pc = win.getComputedStyle(el, ps); if (pc.content && pc.content !== 'none' && pc.content !== 'normal') { let t = ''; for (let i = 0; i < pc.length; i++) { const k = pc[i]; t += k + ':' + pc.getPropertyValue(k) + ';'; } row.push(ps, hash(t)); } }
          rows.push(row);
        }
        out[`${w}|${r}|${label}`] = rows;
      };
      snap('base');
      const nav = d.querySelector('.mainnav');
      if (nav) {
        if (w < 980) { nav.classList.add('nav-open'); d.body.classList.add('nav-locked'); d.querySelectorAll('.mobilenav-group').forEach(g => g.open = true); }
        else { d.querySelectorAll('.navitem.has-sub').forEach(n => n.classList.add('is-open')); }
        d.querySelectorAll('details').forEach(x => x.open = true);
        await new Promise(res => setTimeout(res, 100));
        snap('open');
      }
    }
    f.remove();
  }
  holder.remove();
  out.__meta = { ms: Date.now() - t0, keys: Object.keys(out).length };
  return out;
}
