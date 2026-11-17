const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 800, height: 800 }, deviceScaleFactor: 2 });
  for (const n of process.argv.slice(2)) {
    await p.goto('file://' + __dirname + '/html/' + n + '.html');
    await p.evaluate(() => document.fonts.ready);
    await p.waitForTimeout(300);
    await p.screenshot({ path: __dirname + '/out/' + n + '.png' });
    console.log(n);
  }
  await b.close();
})();
