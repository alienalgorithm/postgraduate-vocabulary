// node cap.js <outdir> <t1> <t2> ... : 4K stills from the film with on-screen HTML text hidden and the s03 chart axes hidden.
// Read-only use of the film engine in A (adapted from A/stills/cover/clean.js).
'use strict';
const fs = require('fs'), path = require('path');
const A = '/tmp/claude-0/-home-user-postgraduate-vocabulary/3d87cc6c-41dd-58c2-802f-d51dc0c78527/scratchpad/anim';
const L = require(A + '/engine/lib');
(async () => {
  const outdir = process.argv[2]; const times = process.argv.slice(3).map(Number);
  fs.mkdirSync(outdir, { recursive: true });
  const srv = await L.startServer(); const browser = await L.launch();
  try {
    const { page, cdp } = await L.openEngine(browser, srv.port, { scale: 2, from: Math.min(...times), to: Math.max(...times) + 1e-3 });
    for (const t of times) {
      await page.evaluate(t => window.seek(t), t);
      const n = await page.evaluate(() => {
        let n = 0;
        document.querySelectorAll('.scene-root').forEach(r => {
          const tw = document.createTreeWalker(r, NodeFilter.SHOW_TEXT); let x; const hide = new Set();
          while ((x = tw.nextNode())) { if (!x.nodeValue.trim()) continue; const e = x.parentElement; if (!e || e.closest('svg')) continue; hide.add(e.closest('.split') || e.closest('[aria-label]') || e); }
          r.querySelectorAll('svg path').forEach(p => { if ((p.getAttribute('stroke') || '').toLowerCase() === '#8fa3c8') hide.add(p); });
          hide.forEach(e => { e.style.setProperty('visibility', 'hidden', 'important'); n++; });
        });
        return n;
      });
      await page.evaluate(() => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))));
      const png = await L.capture(cdp);
      const f = path.join(outdir, 'k_' + L.fmtTime(t) + '.png'); fs.writeFileSync(f, png);
      console.log(f, L.pngSize(png).join('x'), 'hidden', n);
    }
  } finally { await browser.close(); await srv.close(); }
})();
