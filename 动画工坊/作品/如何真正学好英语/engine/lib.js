// Shared node-side helpers for still.js / render.js / test.js / serve.js.
'use strict';
const http = require('http');
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const ROOT = path.resolve(__dirname, '..'); // A
const W = 1920, H = 1080;

const MIME = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.mjs': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8', '.ttf': 'font/ttf', '.otf': 'font/otf', '.woff': 'font/woff', '.woff2': 'font/woff2',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.svg': 'image/svg+xml',
  '.gif': 'image/gif', '.wav': 'audio/wav', '.mp3': 'audio/mpeg', '.ogg': 'audio/ogg', '.flac': 'audio/flac', '.m4a': 'audio/mp4',
  '.mp4': 'video/mp4', '.webm': 'video/webm'
};

/** Static file server for A (127.0.0.1, random port). */
function startServer(root = ROOT, port = 0) {
  return new Promise((resolve, reject) => {
    const srv = http.createServer((req, res) => {
      let p;
      try { p = decodeURIComponent(new URL(req.url, 'http://x').pathname); } catch (e) { res.writeHead(400); return res.end(); }
      const file = path.normalize(path.join(root, p));
      if (!file.startsWith(root)) { res.writeHead(403); return res.end(); }
      fs.stat(file, (err, st) => {
        if (err || !st.isFile()) { res.writeHead(404, { 'Content-Type': 'text/plain' }); return res.end('not found'); }
        res.writeHead(200, { 'Content-Type': MIME[path.extname(file).toLowerCase()] || 'application/octet-stream', 'Content-Length': st.size, 'Cache-Control': 'no-store' });
        fs.createReadStream(file).pipe(res);
      });
    });
    srv.on('error', reject);
    srv.listen(port, '127.0.0.1', () => resolve({ server: srv, port: srv.address().port, close: () => new Promise(r => srv.close(r)) }));
  });
}

/** Flag parser: --key value, --key=value, --flag (boolean), positional args. Repeated --param collects into an array. */
function parseArgs(argv, booleans = []) {
  const out = { _: [], param: [] };
  const set = (k, v) => { if (k === 'param') out.param.push(v); else out[k] = v; };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith('--')) {
      const eq = a.indexOf('=');
      if (eq > 0 && !a.startsWith('--param=') ) { set(a.slice(2, eq), a.slice(eq + 1)); continue; }
      if (a.startsWith('--param=')) { set('param', a.slice(8)); continue; }
      const k = a.slice(2);
      if (booleans.includes(k) || i + 1 >= argv.length || (argv[i + 1].startsWith('--') && isNaN(+argv[i + 1]))) set(k, true);
      else set(k, argv[++i]);
    } else out._.push(a);
  }
  return out;
}

// --enable-unsafe-swiftshader keeps WebGL (SwiftShader) available in headless chromium without a GPU.
const LAUNCH_ARGS = ['--force-color-profile=srgb', '--font-render-hinting=none', '--hide-scrollbars', '--disable-lcd-text', '--mute-audio',
  '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--disable-background-timer-throttling', '--disable-renderer-backgrounding',
  '--disable-backgrounding-occluded-windows', '--run-all-compositor-stages-before-draw', '--disable-checker-imaging', '--disable-partial-raster'];
function launch() { return chromium.launch({ args: LAUNCH_ARGS }); }

/** Build the page query string from CLI options. */
function pageQuery(o) {
  const q = new URLSearchParams();
  if (o.demo) q.set('demo', o.demo === true ? '1' : String(o.demo));
  if (o.storyboard) q.set('storyboard', o.storyboard);
  if (o.from != null && isFinite(o.from)) q.set('from', String(o.from));
  if (o.to != null && isFinite(o.to)) q.set('to', String(o.to));
  if (o.only) q.set('only', o.only);
  if (o.barcode) q.set('barcode', '1');
  if (o.probe) q.set('probe', '1');
  if (o.nothree) q.set('nothree', '1');
  if (o.energy) q.set('energy', o.energy);
  for (const p of o.param || []) { const i = String(p).indexOf('='); if (i > 0) q.set('p.' + p.slice(0, i), p.slice(i + 1)); else q.set('p.' + p, ''); }
  return q.toString();
}

/** Resolve a --storyboard CLI path to a URL relative to engine/. */
function storyboardUrl(p) {
  if (!p) return null;
  const abs = path.resolve(p);
  if (!abs.startsWith(ROOT)) throw new Error('--storyboard must be inside ' + ROOT);
  return '../' + path.relative(ROOT, abs).split(path.sep).join('/');
}

/** Open the engine in a fresh context at the given scale. Returns {page, cdp, info, context, logs, url}. */
async function openEngine(browser, port, opts) {
  const scale = opts.scale || 1;
  const context = await browser.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: scale });
  const page = await context.newPage();
  page.setDefaultTimeout(180000);
  const cdp = await context.newCDPSession(page);
  // the screenshot session needs its own metrics override, otherwise captures come back at 1x
  await cdp.send('Emulation.setDeviceMetricsOverride', { width: W, height: H, deviceScaleFactor: scale, mobile: false });
  const logs = [];
  page.on('console', m => { if (m.type() === 'error' || m.type() === 'warning') logs.push(m.type() + ': ' + m.text()); });
  page.on('pageerror', e => logs.push('pageerror: ' + e.message));
  const url = `http://127.0.0.1:${port}/engine/index.html?${pageQuery(opts)}`;
  await page.goto(url, { waitUntil: 'load', timeout: 180000 });
  const info = await page.evaluate(() => window.__engineReady);
  const dpr = await page.evaluate(() => window.devicePixelRatio);
  if (dpr !== scale) throw new Error(`devicePixelRatio is ${dpr}, expected ${scale}`);
  return { page, cdp, info, context, logs, url };
}

/** Capture the current frame (PNG, or JPEG q100 with fmt='jpeg'): W*scale x H*scale. */
async function capture(cdp, fmt = 'png') {
  const o = { format: fmt, captureBeyondViewport: false, clip: { x: 0, y: 0, width: W, height: H, scale: 1 } };
  if (fmt === 'png') o.optimizeForSpeed = true; else o.quality = 100;
  const r = await cdp.send('Page.captureScreenshot', o);
  return Buffer.from(r.data, 'base64');
}
function pngSize(buf) { return [buf.readUInt32BE(16), buf.readUInt32BE(20)]; }
function fmtTime(t) { return String(+(+t).toFixed(3)); }

function printReport(info, logs, label = '') {
  if (!info) return;
  for (const w of info.warnings || []) console.error(`${label}WARN  ${w}`);
  for (const e of info.errors || []) console.error(`${label}ERROR ${e}`);
  for (const l of logs || []) if (!/ENGINE ERROR/.test(l)) console.error(`${label}page  ${l}`);
}

/** Probe the storyboard (no scene scripts): {total, fps, scenes, music}. */
async function probe(browser, port, opts) {
  const e = await openEngine(browser, port, Object.assign({}, opts, { probe: true, scale: 1 }));
  await e.context.close();
  return e.info;
}

module.exports = { ROOT, W, H, startServer, parseArgs, launch, openEngine, capture, pngSize, fmtTime, printReport, storyboardUrl, pageQuery, probe, LAUNCH_ARGS };
