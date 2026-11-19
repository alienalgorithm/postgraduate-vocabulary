// node render.js : renders cover.html for both aspects -> master PNG, text-free background PNG, layout JSON
'use strict';
const path = require('path'), fs = require('fs');
const { chromium } = require('playwright');
const D = __dirname;
(async () => {
  const browser = await chromium.launch();
  try {
    for (const [a, W, H] of [['16x9', 3840, 2160], ['4x3', 2880, 2160]]) {
      const page = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
      await page.goto('file://' + path.join(D, 'cover.html') + '?a=' + a);
      await page.evaluate(() => window.ready);
      await page.evaluate(() => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))));
      const lay = await page.evaluate(() => window.layout());
      const fonts = await page.evaluate(() => [...document.fonts].map(f => f.family + ' ' + f.weight + ' ' + f.status));
      lay.fonts = fonts;
      fs.writeFileSync(path.join(D, `layout_${a}.json`), JSON.stringify(lay, null, 1));
      await page.screenshot({ path: path.join(D, `cover_${a}_master.png`), clip: { x: 0, y: 0, width: W, height: H } });
      await page.evaluate(() => window.hideText(true));
      await page.evaluate(() => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))));
      await page.screenshot({ path: path.join(D, `bg_${a}.png`), clip: { x: 0, y: 0, width: W, height: H } });
      console.log(a, 'done', fonts.join(', '));
      await page.close();
    }
  } finally { await browser.close(); }
})();
