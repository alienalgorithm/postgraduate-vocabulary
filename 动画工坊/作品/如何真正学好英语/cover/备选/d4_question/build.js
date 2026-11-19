// node build.js [--preview]   renders master_16x9.png, master_4x3.png (+ bg_*.png without text, layout_*.json)
// --preview: quarter-size quick look only (preview_16x9.png / preview_4x3.png)
'use strict';
const path = require('path'), fs = require('fs');
const { chromium } = require('playwright');
const D = __dirname;
const preview = process.argv.includes('--preview');
(async () => {
  const browser = await chromium.launch({ args: ['--allow-file-access-from-files'] });
  try {
    for (const v of ['16x9', '4x3']) {
      const W = v === '16x9' ? 3840 : 2880, H = 2160;
      const dsf = preview ? 0.25 : 1;
      const ctx = await browser.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: dsf });
      const page = await ctx.newPage();
      const shoot = async (mode, file) => {
        await page.goto('file://' + path.join(D, 'cover.html') + `?v=${v}&mode=${mode}`);
        await page.evaluate(() => window.coverReady);
        await page.evaluate(() => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))));
        await page.locator('#stage').screenshot({ path: path.join(D, file) });
      };
      if (preview) { await shoot('full', `preview_${v}.png`); await ctx.close(); continue; }
      await shoot('full', `master_${v}.png`);
      // layout numbers straight from the DOM of the full render
      const lay = await page.evaluate(() => {
        const out = { ver: COVER.ver, W: COVER.W, H: COVER.H, texts: [] };
        const fontOk = document.fonts.check('900 100px SC900') && document.fonts.check('100px Serif900') && document.fonts.check('100px SC500');
        out.fontsLoaded = fontOk;
        for (const id of ['kicker', 'head', 'sub']) {
          const e = document.getElementById(id);
          const r = e.getBoundingClientRect();
          // per-colour runs (fill colours actually used inside the element)
          const runs = [];
          e.querySelectorAll('span').forEach(s => { if (s.children.length === 0 && s.textContent.trim()) runs.push({ text: s.textContent, color: getComputedStyle(s).color, box: (b => [b.left, b.top, b.right, b.bottom])(s.getBoundingClientRect()) }); });
          if (!runs.length) runs.push({ text: e.textContent, color: getComputedStyle(e).color, box: [r.left, r.top, r.right, r.bottom] });
          // ink metrics of the element's font
          const cs = getComputedStyle(e);
          const c = document.createElement('canvas').getContext('2d');
          c.font = `${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
          const m = c.measureText(e.textContent.replace(/[，？。·《》\s]/g, ''));
          out.texts.push({ id, text: e.textContent, font: cs.fontFamily, size: parseFloat(cs.fontSize), box: [r.left, r.top, r.right, r.bottom],
            inkHeight: m.actualBoundingBoxAscent + m.actualBoundingBoxDescent, runs,
            lines: id === 'head' ? [...e.querySelectorAll('.ln')].map(l => (b => [b.left, b.top, b.right, b.bottom])(l.getBoundingClientRect())) : null });
        }
        // key subjects (not text): the brain core and the learner, from the layout numbers
        const C = COVER.C, BS = C.brain.h / 1488, FS = C.fig.h / 558;
        out.subjects = {
          brainCore: [C.brain.cx - 1189 / 2 * BS, C.brain.top, C.brain.cx + 1189 / 2 * BS, C.brain.top + C.brain.h],
          learner: [C.fig.x, C.fig.feet - C.fig.h, C.fig.x + 136 * FS, C.fig.feet] };
        return out;
      });
      fs.writeFileSync(path.join(D, `layout_${v}.json`), JSON.stringify(lay, null, 1));
      await shoot('notext', `work/bg_${v}.png`);
      await ctx.close();
      console.log(v, 'rendered', lay.fontsLoaded ? 'fonts ok' : 'FONTS MISSING');
    }
  } finally { await browser.close(); }
})();
