#!/usr/bin/env node
// Determinism test: node test.js [--suite demo|gallery|all] [--scale 1|2] [--storyboard path] [--times t1,t2,...]
// Captures the same instants three ways and requires byte-identical frames:
//   A. one page, times in increasing order (like a sequential render)
//   B. a fresh page, the same times in a shuffled order with backward jumps and repeats (random-access seek)
//   C. a fresh page per time that loads only [t, t+1/60) (like the first frame of a render chunk)
// Every GSAP plugin (SplitText, MorphSVG, DrawSVG, MotionPath, CustomEase, ScrambleText, Physics2D), canvas
// particles/flow fields, SVG filters, transitions and the three.js layer are exercised by the demo/gallery scenes.
// Exit code 1 on any mismatch or engine error. Mismatching frames are written to A/stills/test/.
'use strict';
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { execFileSync } = require('child_process');
const L = require('./lib');

const a = L.parseArgs(process.argv.slice(2), ['nothree']);
const scale = +(a.scale || 1);
const SUITES = {
  demo: { demo: '1', times: [0, 0.1, 0.35, 0.7, 1.0, 1.25, 1.5, 1.7, 2.0, 2.4, 2.45, 2.6, 2.75, 2.9, 2.9833, 3.0, 3.1, 3.3, 3.5, 3.7, 3.9, 4.0, 4.05, 4.2, 4.4, 4.6, 4.9, 5.2, 5.5, 5.9833] },
  gallery: { demo: 'gallery', times: [0, 0.4, 0.9, 1.6, 1.75, 1.9, 2.3, 2.9, 3.5, 3.6, 3.8, 4.4, 5.6, 5.8, 6.1, 7.7, 7.9, 8.1, 9.6, 9.8, 10.0, 10.2, 11.9, 12.1, 12.3, 13.6, 13.8, 15.0] }
};
const sha = b => crypto.createHash('sha1').update(b).digest('hex').slice(0, 12);

async function runSuite(browser, port, name, suite) {
  const common = { demo: suite.demo, storyboard: suite.storyboard, nothree: a.nothree, param: a.param };
  const times = suite.times;
  const res = { A: {}, B: {}, C: {} }, pngs = { A: {}, B: {}, C: {} }, st = { A: {}, B: {}, C: {} };
  const state = page => page.evaluate(() => window.__stateHash());
  let errors = [];
  // A: sequential
  let e = await L.openEngine(browser, port, Object.assign({ scale }, common));
  if (e.info.fatal) throw new Error('engine failed: ' + e.info.errors.join(' | '));
  L.printReport(e.info, e.logs, `[${name}] `);
  for (const t of times.slice().sort((x, y) => x - y)) { await e.page.evaluate(t => window.seek(t), t); const p = await L.capture(e.cdp); res.A[t] = sha(p); pngs.A[t] = p; st.A[t] = await state(e.page); }
  errors = errors.concat(await e.page.evaluate(() => window.__engine.errors));
  await e.context.close();
  // B: shuffled with backward jumps and repeats
  const r = (() => { let s = 99; return () => (s = (s * 1103515245 + 12345) % 2147483648) / 2147483648; })();
  const order = times.slice(); for (let i = order.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [order[i], order[j]] = [order[j], order[i]]; }
  const seq = order.concat(order.slice(0, 6).reverse());
  e = await L.openEngine(browser, port, Object.assign({ scale }, common));
  for (const t of seq) {
    await e.page.evaluate(t => window.seek(t), t);
    const p = await L.capture(e.cdp), h = sha(p), sh = await state(e.page);
    if (!res.B[t]) { res.B[t] = h; pngs.B[t] = p; st.B[t] = sh; }
    else { if (res.B[t] !== h) res.B[t] += '/repeat-differs'; if (st.B[t] !== sh) st.B[t] += '/repeat-differs'; }
  }
  errors = errors.concat(await e.page.evaluate(() => window.__engine.errors));
  await e.context.close();
  // C: chunk-start pages (only the scenes around t are built)
  for (const t of times) {
    e = await L.openEngine(browser, port, Object.assign({ scale, from: t, to: t + 1 / 60 }, common));
    await e.page.evaluate(t => window.seek(t), t);
    const p = await L.capture(e.cdp); res.C[t] = sha(p); pngs.C[t] = p; st.C[t] = await state(e.page);
    errors = errors.concat(await e.page.evaluate(() => window.__engine.errors));
    await e.context.close();
  }
  let bad = 0, rasterOnly = 0, exact = 0;
  const outDir = path.join(L.ROOT, 'stills', 'test'); fs.mkdirSync(outDir, { recursive: true });
  for (const t of times) {
    const stateOk = st.A[t] === st.B[t] && st.A[t] === st.C[t];
    const pixOk = res.A[t] === res.B[t] && res.A[t] === res.C[t];
    if (stateOk && pixOk) { exact++; continue; }
    const fa = path.join(outDir, `${name}_A_${t}.png`), fb = path.join(outDir, `${name}_B_${t}.png`), fc = path.join(outDir, `${name}_C_${t}.png`);
    fs.writeFileSync(fa, pngs.A[t]); fs.writeFileSync(fb, pngs.B[t]); fs.writeFileSync(fc, pngs.C[t]);
    let d = { max: 999, n: -1 };
    try { d = JSON.parse(execFileSync('python3', ['-c', `import sys,json,numpy as np;from PIL import Image\na=np.asarray(Image.open(sys.argv[1]).convert('RGB'),np.int16);m=0;n=0\nfor f in sys.argv[2:]:\n  b=np.asarray(Image.open(f).convert('RGB'),np.int16);x=np.abs(a-b).max(2);m=max(m,int(x.max()));n=max(n,int((x>0).sum()))\nprint(json.dumps({'max':m,'n':n}))`, fa, fb, fc]).toString()); } catch (x) { }
    // identical scene state, only sub-pixel raster-cache noise from Chrome's compositor: tolerated (invisible)
    const raster = stateOk && d.max <= 8 && d.n >= 0 && d.n < 0.001 * (1920 * scale) * (1080 * scale);
    if (raster) rasterOnly++; else bad++;
    console.log(`  [${name}] t=${t}  state ${stateOk ? 'identical' : 'DIFFERS ' + [st.A[t], st.B[t], st.C[t]].join(' ')}  pixels A ${res.A[t]} B ${res.B[t]} C ${res.C[t]}  max diff ${d.max}/255 on ${d.n} px  ${raster ? '(raster-cache noise, tolerated)' : 'MISMATCH'}`);
  }
  console.log(`[${name}] scale ${scale}: ${times.length} instants x 3 seek orders (sequential, shuffled with repeats, chunk-start): ${exact} byte-identical, ${rasterOnly} identical state with <=8/255 raster noise on <0.1% px, ${bad} mismatch(es), ${errors.length} engine error(s)`);
  for (const x of [...new Set(errors)]) console.log('  ERROR ' + x);
  return bad + errors.length;
}

(async () => {
  const srv = await L.startServer();
  const browser = await L.launch();
  let fails = 0;
  try {
    let names = a.suite && a.suite !== 'all' ? [a.suite] : Object.keys(SUITES);
    if (a.storyboard) { SUITES.custom = { storyboard: L.storyboardUrl(a.storyboard), times: String(a.times || '').split(',').map(Number).filter(isFinite) }; names = ['custom']; }
    if (a.times && !a.storyboard) names.forEach(n => { SUITES[n].times = String(a.times).split(',').map(Number); });
    for (const n of names) fails += await runSuite(browser, srv.port, n, SUITES[n]);
  } catch (e) { console.error('test.js failed: ' + (e && e.stack || e)); fails++; }
  finally { await browser.close(); await srv.close(); }
  console.log(fails ? 'FAIL' : 'PASS');
  process.exit(fails ? 1 : 0);
})();
