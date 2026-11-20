// Typography layer in HTML/CSS, rendered with a transparent background.
// Usage: node text.js <fmt> <dsf>
// Writes work/text_<fmt>_<mode>.png for modes all (final colours), mask (all text solid),
// head, hot, sub, acc, gold (alpha masks of single elements for glows), and
// work/text_<fmt>.json (DOM rects, per-glyph rects, visible strings).
const fs = require('fs');
const path = require('path');
let chromium;
try { ({ chromium } = require('playwright')); } catch (e) { ({ chromium } = require('/opt/node-tools/node_modules/playwright')); }

const ROOT = path.dirname(__dirname);
const fmt = process.argv[2];
const dsf = parseFloat(process.argv[3] || '2');
const F = JSON.parse(fs.readFileSync(path.join(__dirname, 'formats.json'), 'utf8'))[fmt];
const L = F.text;
const C = JSON.parse(fs.readFileSync(path.join(__dirname, 'copy.json'), 'utf8'));
const ONLY = { head: '#head', hot: '#head .hot', sub: '#sub', acc: '#sub .acc', gold: '#sub .gold' };

function html(mode) {
  const font = f => 'file://' + path.join(ROOT, 'fonts', f);
  const solid = mode !== 'all';
  const H = L.head, S = L.sub;
  const metal = solid ? 'color:#fff;' : `
      background: linear-gradient(180deg, #ffffff 0%, #fbfcfe 24%, #e3e9f1 44%, #b4c0cf 50.5%, #cfd8e3 53%, #f6f1e6 74%, #ffe3ad 100%);
      -webkit-background-clip: text; background-clip: text; color: transparent;`;
  const hot = solid ? 'color:#fff;' : `
      background: linear-gradient(180deg, #fffdf6 0%, #fff4d6 30%, #ffe0a0 50%, #ffc565 74%, #ffab45 100%);
      -webkit-background-clip: text; background-clip: text; color: transparent;`;
  const only = ONLY[mode] ? `#stage .t, #stage .t * { visibility: hidden; } ${ONLY[mode]}, ${ONLY[mode]} * { visibility: visible !important; }` : '';
  return `<!doctype html><html><head><meta charset="utf-8"><style>
  @font-face { font-family: H900; src: url('${font(H.font)}'); }
  @font-face { font-family: S500; src: url('${font(S.font)}'); }
  html, body { margin: 0; padding: 0; background: transparent; }
  #stage { position: relative; width: ${L.cssW}px; height: ${L.cssH}px; overflow: hidden; }
  .t { position: absolute; white-space: nowrap; }
  #head { left: ${H.left}px; top: ${H.top}px; font-family: H900; line-height: 1; }
  #head .l { display: block; width: max-content; letter-spacing: ${H.track}em; ${metal} }
  #head .l1 { font-size: ${H.size1}px; }
  #head .l2 { font-size: ${H.size2}px; margin-top: ${H.gap}px; }
  #head .hot { ${hot} }
  #sub { left: ${S.left}px; top: ${S.top}px; font-family: S500; font-size: ${S.size}px; letter-spacing: ${S.track}em;
         color: ${solid ? '#fff' : S.color}; line-height: 1; }
  #sub .acc { color: ${solid ? '#fff' : S.accColor}; }
  #sub .gold { color: ${solid ? '#fff' : S.goldColor}; }
  ${only}
  </style></head><body><div id="stage">
  <div id="head" class="t"><span class="l l1">${C.head1}</span><span class="l l2"><span class="hot">${C.head2_hot}</span>${C.head2_rest}</span></div>
  <div id="sub" class="t">${C.sub_a}<span class="acc">${C.sub_acc}</span>${C.sub_b}<span class="gold">${C.sub_gold}</span>${C.sub_c}</div>
  </div></body></html>`;
}

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: L.cssW, height: L.cssH }, deviceScaleFactor: dsf });
  const out = {};
  for (const mode of ['all', 'mask', 'head', 'hot', 'sub', 'acc', 'gold']) {
    const file = path.join(ROOT, 'work', `text_${fmt}_${mode}.html`);
    fs.writeFileSync(file, html(mode));
    await page.goto('file://' + file);
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(150);
    await page.screenshot({ path: path.join(ROOT, 'work', `text_${fmt}_${mode}.png`), omitBackground: true, clip: { x: 0, y: 0, width: L.cssW, height: L.cssH } });
    if (mode === 'all') {
      out.rects = await page.evaluate(() => {
        const r = {};
        for (const [k, sel] of [['head1', '#head .l1'], ['head2', '#head .l2'], ['hot', '#head .hot'], ['sub', '#sub'], ['acc', '#sub .acc'], ['gold', '#sub .gold']]) {
          const el = document.querySelector(sel); if (!el) continue;
          const b = el.getBoundingClientRect();
          r[k] = { box: [b.left, b.top, b.right, b.bottom], text: el.textContent };
        }
        // per-glyph boxes (for the cap-height checks), all text nodes of each line
        r.chars = [];
        for (const [line, sel] of [['l1', '#head .l1'], ['l2', '#head .l2'], ['sub', '#sub']]) {
          const tw = document.createTreeWalker(document.querySelector(sel), NodeFilter.SHOW_TEXT);
          let node;
          while ((node = tw.nextNode())) {
            for (let i = 0; i < node.length; i++) {
              const rg = document.createRange(); rg.setStart(node, i); rg.setEnd(node, i + 1);
              const b = rg.getBoundingClientRect();
              r.chars.push({ line, ch: node.data[i], box: [b.left, b.top, b.right, b.bottom] });
            }
          }
        }
        r.fontsOk = [...document.fonts].map(f => f.family + ':' + f.status);
        return r;
      });
      out.strings = await page.evaluate(() => document.getElementById('stage').innerText);
    }
  }
  out.cssW = L.cssW; out.cssH = L.cssH; out.dsf = dsf;
  fs.writeFileSync(path.join(ROOT, 'work', `text_${fmt}.json`), JSON.stringify(out, null, 1));
  console.log('text layer', fmt, JSON.stringify(out.rects.fontsOk));
  await browser.close();
})().catch(e => { console.error(e); process.exit(1); });
