// node bg_render.js <outdir> <ZL> <F> <CY> <CX> <t1> [t2 ...]
// 4K clean background stills of the s08 climax for the cover. Nothing in A is modified: the page's request for
// scenes/s08.js is answered with an in-memory copy whose learner stands further down the street (ZL), so the lone
// figure sits above B站's bottom overlay;
// F/CY/CX (focal length, principal point) reframe the same camera a little wider and higher for the same reason. All on-screen HTML text and the "retrieval" SVG are hidden.
'use strict';
const fs = require('fs'), path = require('path');
const A = '/tmp/claude-0/-home-user-postgraduate-vocabulary/3d87cc6c-41dd-58c2-802f-d51dc0c78527/scratchpad/anim';
const L = require(A + '/engine/lib');
(async () => {
  const [outdir, zl, fo, cy, cx, ...ts] = process.argv.slice(2); const times = ts.map(Number);
  fs.mkdirSync(outdir, { recursive: true });
  let src = fs.readFileSync(A + '/scenes/s08.js', 'utf8');
  if (!src.includes('var ZL = -51;')) throw new Error('ZL anchor not found');
  src = src.replace('var ZL = -51;', 'var ZL = ' + Number(zl) + ';');
  const camLine = 'var F = 1000, CX = 960, CY = 540, NEAR = 0.6;';
  if (!src.includes(camLine)) throw new Error('camera anchor not found');
  src = src.replace(camLine, 'var F = ' + Number(fo) + ', CX = ' + Number(cx) + ', CY = ' + Number(cy) + ', NEAR = 0.6;');
  const srv = await L.startServer(); const browser = await L.launch();
  try {
    const scale = 2, from = Math.min(...times), to = Math.max(...times) + 1e-3;
    const context = await browser.newContext({ viewport: { width: L.W, height: L.H }, deviceScaleFactor: scale });
    await context.route('**/scenes/s08.js', r => r.fulfill({ status: 200, contentType: 'text/javascript; charset=utf-8', body: src }));
    const page = await context.newPage(); page.setDefaultTimeout(180000);
    const cdp = await context.newCDPSession(page);
    await cdp.send('Emulation.setDeviceMetricsOverride', { width: L.W, height: L.H, deviceScaleFactor: scale, mobile: false });
    await page.goto(`http://127.0.0.1:${srv.port}/engine/index.html?${L.pageQuery({ from, to })}`, { waitUntil: 'load', timeout: 180000 });
    const info = await page.evaluate(() => window.__engineReady); if (info.fatal) throw new Error('engine failed');
    for (const t of times) {
      await page.evaluate(t => window.seek(t), t);
      const n = await page.evaluate(() => {
        let n = 0; const hide = new Set();
        document.querySelectorAll('.scene-root').forEach(r => {
          const tw = document.createTreeWalker(r, NodeFilter.SHOW_TEXT); let x;
          while ((x = tw.nextNode())) { if (!x.nodeValue.trim()) continue; const e = x.parentElement; if (!e || e.closest('svg')) continue; hide.add(e.closest('.split') || e.closest('[aria-label]') || e); }
          r.querySelectorAll('svg[aria-label]').forEach(s => hide.add(s));
        });
        hide.forEach(e => { e.style.setProperty('visibility', 'hidden', 'important'); n++; });
        return n;
      });
      await page.evaluate(() => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))));
      const png = await L.capture(cdp);
      const f = path.join(outdir, 'bg_zl' + zl + '_f' + fo + '_cy' + cy + '_cx' + cx + '_' + L.fmtTime(t) + '.png'); fs.writeFileSync(f, png);
      console.log(f, L.pngSize(png).join('x'), 'hidden', n);
    }
  } finally { await browser.close(); await srv.close(); }
})().catch(e => { console.error(e); process.exit(1); });
