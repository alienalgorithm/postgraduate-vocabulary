#!/usr/bin/env node
// node still.js [--scale 1|2] [--scene sNN] [--demo[=gallery]] [--storyboard path] [--outdir dir] [--prefix p]
//               [--param k=v ...] [--nothree] [--no-qa] [--barcode] <t1> <t2> ...
// Writes A/stills/t_<seconds>.png (global seconds; with --scene the times are relative to that scene's start).
// --scale 1 = 1920x1080 (quick checks), --scale 2 = 3840x2160 (4K detail). Prints QA issues (text size, overflow,
// overlap, fonts, dashes) for every still; exit code 3 if any QA issue, 1 on engine errors.
'use strict';
const fs = require('fs');
const path = require('path');
const L = require('./lib');

(async () => {
  const a = L.parseArgs(process.argv.slice(2), ['demo', 'no-qa', 'barcode', 'nothree']);
  const scale = +(a.scale || 1);
  if (scale !== 1 && scale !== 2) { console.error('--scale must be 1 or 2'); process.exit(2); }
  let times = a._.map(Number);
  if (!times.length || times.some(t => !isFinite(t))) { console.error('usage: node still.js [--scale 1|2] [--scene sNN] [--demo] <t1> <t2> ...'); process.exit(2); }
  const outdir = path.resolve(a.outdir || path.join(L.ROOT, 'stills'));
  fs.mkdirSync(outdir, { recursive: true });
  const srv = await L.startServer();
  const browser = await L.launch();
  let code = 0;
  try {
    const common = { demo: a.demo, storyboard: L.storyboardUrl(a.storyboard), param: a.param, nothree: a.nothree, energy: a.energy };
    if (a.scene) {
      const info = await L.probe(browser, srv.port, common);
      const sc = (info.scenes || []).find(s => s.id === a.scene);
      if (!sc) throw new Error('scene ' + a.scene + ' not in storyboard');
      times = times.map(t => +(sc.start + t).toFixed(6));
    }
    const from = Math.min(...times), to = Math.max(...times) + 1e-3;
    const { page, cdp, info, logs } = await L.openEngine(browser, srv.port, Object.assign({ scale, from, to, barcode: a.barcode }, common));
    L.printReport(info, logs);
    if (info.fatal) throw new Error('engine failed to start');
    for (const t of times) {
      await page.evaluate(t => window.seek(t), t);
      const png = await L.capture(cdp);
      const [w, h] = L.pngSize(png);
      const file = path.join(outdir, `${a.prefix || ''}t_${L.fmtTime(t)}.png`);
      fs.writeFileSync(file, png);
      let line = `${file}  ${w}x${h}`;
      if (!a['no-qa']) {
        const issues = await page.evaluate(() => window.qa());
        if (issues.length) { line += `  QA ${issues.length} issue(s)`; code = code || 3; }
        console.log(line);
        for (const i of issues) console.log(`    ${i.type.padEnd(8)} [${i.scene}] "${i.text}"  ${i.detail}`);
      } else console.log(line);
    }
    const late = await page.evaluate(() => ({ errors: window.__engine.errors, warnings: window.__engine.warnings }));
    for (const e of late.errors.filter(e => !info.errors.includes(e))) console.error('ERROR ' + e);
    for (const w of late.warnings.filter(w => !info.warnings.includes(w))) console.error('WARN  ' + w);
    if (late.errors.length) code = 1;
  } catch (e) {
    console.error('still.js failed: ' + (e && e.stack || e)); code = 1;
  } finally {
    await browser.close(); await srv.close();
  }
  process.exit(code);
})();
