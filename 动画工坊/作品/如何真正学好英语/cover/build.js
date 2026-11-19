// node build.js : renders master_16x9.png, master_4x3.png, their text-free twins (for contrast sampling) and layout_*.json
'use strict';
const path = require('path'), fs = require('fs');
const { chromium } = require('playwright');
const D = __dirname;
(async () => {
  const browser = await chromium.launch();
  try {
    for (const [key, W, H] of [['16x9', 3840, 2160], ['4x3', 2880, 2160]]) {
      const page = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
      page.on('console', m => console.log('[page]', m.text()));
      page.on('pageerror', e => console.log('[pageerror]', e.message));
      await page.goto('file://' + path.join(D, 'cover.html') + '?layout=' + key);
      await page.waitForFunction(() => window.__ready === true, null, { timeout: 120000 });
      await page.screenshot({ path: path.join(D, 'master_' + key + '.png'), clip: { x: 0, y: 0, width: W, height: H } });
      const info = await page.evaluate(() => window.info());
      await page.evaluate(() => window.render(false));
      await page.screenshot({ path: path.join(D, 'work', 'notext_' + key + '.png'), clip: { x: 0, y: 0, width: W, height: H } });
      fs.writeFileSync(path.join(D, 'work', 'layout_' + key + '.json'), JSON.stringify(info, null, 1));
      console.log(key, 'ok', JSON.stringify(info.ext));
      await page.close();
    }
  } finally { await browser.close(); }
})();
