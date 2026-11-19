// node shoot.js <html> <outprefix> : renders <html> at its #stage size (DPR 1) three ways:
//   <outprefix>.png (final), <outprefix>_notext.png (text hidden, for contrast sampling), and writes
//   <outprefix>_layout.json: every text element's box (getBoundingClientRect), per-line boxes and fills,
//   the strings placed, and the headline ink height from canvas measureText (for the feed-size check).
'use strict';
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path');
(async () => {
  const [html, out] = process.argv.slice(2);
  const browser = await chromium.launch();
  try {
    const page = await browser.newPage({ viewport: { width: 400, height: 300 }, deviceScaleFactor: 1 });
    await page.goto('file://' + path.resolve(html), { waitUntil: 'load' });
    await page.evaluate(() => document.fonts.ready);
    const size = await page.evaluate(() => { const r = document.getElementById('stage').getBoundingClientRect(); return [r.width, r.height]; });
    await page.setViewportSize({ width: size[0], height: size[1] });
    await page.evaluate(async () => { await document.fonts.ready; await Promise.all(['900 100px CoverSerif', '500 100px CoverSans', 'italic 400 100px CoverItalic'].map(f => document.fonts.load(f, '你背过单词后来都去哪了4K动画retrieval'))); });
    const layout = await page.evaluate(() => {
      const css = getComputedStyle(document.documentElement);
      const resolve = v => v.split(',').map(s => { s = s.trim(); const m = s.match(/^var\((--[\w-]+)\)$/); return m ? css.getPropertyValue(m[1]).trim() : s; });
      const box = r => ({ x0: r.left, y0: r.top, x1: r.right, y1: r.bottom });
      const els = [...document.querySelectorAll('.t')].map(e => {
        const parts = [...e.querySelectorAll('[data-fill]')];
        const lines = (parts.length ? parts : [e]).map(p => {
          const rg = document.createRange(); rg.selectNodeContents(p);
          // per-glyph boxes (one Range per character) for the glyph-level contrast check
          const glyphs = []; const tw = document.createTreeWalker(p, NodeFilter.SHOW_TEXT); let n;
          while ((n = tw.nextNode())) for (let i = 0; i < n.length; i++) {
            const ch = n.nodeValue[i]; if (!ch.trim()) continue;
            const g = document.createRange(); g.setStart(n, i); g.setEnd(n, i + 1); glyphs.push({ ch, box: box(g.getBoundingClientRect()) });
          }
          return { text: p.textContent, fill: resolve(p.dataset.fill || e.dataset.fill), box: box(rg.getBoundingClientRect()), glyphs };
        });
        const cs = getComputedStyle(e);
        return { id: e.id, role: e.dataset.role, text: e.innerText.replace(/\n/g, ' / '), raw: e.textContent, font: cs.fontWeight + ' ' + cs.fontSize + ' ' + cs.fontFamily, fontSize: parseFloat(cs.fontSize), box: box(e.getBoundingClientRect()), lines };
      });
      // headline ink height per CJK glyph from the real font metrics
      const hl = document.querySelector('[data-role=headline]'), cs = getComputedStyle(hl);
      const cv = document.createElement('canvas').getContext('2d'); cv.font = cs.fontWeight + ' ' + cs.fontSize + ' ' + cs.fontFamily;
      const ink = [...hl.textContent].filter(c => /[一-鿿]/.test(c)).map(c => { const m = cv.measureText(c); return { c, h: m.actualBoundingBoxAscent + m.actualBoundingBoxDescent }; });
      return { els, ink, allText: [...document.querySelectorAll('#stage *')].filter(e => e.children.length === 0 || e.classList.contains('t')).map(e => e.textContent).join(' | ') };
    });
    layout.size = size;
    const shot = async (cls, f) => {
      await page.evaluate(c => { document.body.className = c; }, cls);
      await page.evaluate(() => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))));
      await page.screenshot({ path: f, clip: { x: 0, y: 0, width: size[0], height: size[1] } });
    };
    await shot('', out + '.png');
    await shot('notext', out + '_notext.png');
    await page.evaluate(() => { document.body.className = ''; });
    fs.writeFileSync(out + '_layout.json', JSON.stringify(layout, null, 1));
    console.log(out, size.join('x'), layout.els.map(e => e.id + ' ' + JSON.stringify(e.box)).join('  '));
  } finally { await browser.close(); }
})().catch(e => { console.error(e); process.exit(1); });
