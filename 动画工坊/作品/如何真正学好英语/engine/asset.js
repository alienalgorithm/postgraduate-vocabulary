#!/usr/bin/env node
// Import the user's own assets into A/assets so scenes can use them (the engine only serves files inside A).
//   node asset.js illus <NN> [--out assets/illus/NN.jpg]                 watercolour illustration (1536x1024)
//   node asset.js frame <NN|video.mp4> <sec> [--out ...] [--png]          one 4K frame of a reading video (JPEG q1 or PNG)
//   node asset.js clip  <NN|video.mp4> <start> <dur> [--fps 30] [--width 1920] [--out assets/clips/name]
//                                                                         frame sequence + manifest.json for util.sequence()
//   node asset.js list                                                    what is in A/assets
// Sources: ILLUS_DIR (default <film>/sources/illus/NN.jpg) and PKG_DIR (default <film>/sources/pkg/NN/video.mp4).
'use strict';
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const L = require('./lib');

const ILLUS_DIR = process.env.ILLUS_DIR || path.join(L.ROOT, 'sources', 'illus');
const PKG_DIR = process.env.PKG_DIR || path.join(L.ROOT, 'sources', 'pkg');
const ASSETS = path.join(L.ROOT, 'assets');

function nn(x) { return /^\d+$/.test(x) ? String(+x).padStart(2, '0') : null; }
function videoOf(x) { const n = nn(x); const p = n ? path.join(PKG_DIR, n, 'video.mp4') : path.resolve(x); if (!fs.existsSync(p)) throw new Error('video not found: ' + p + ' (set PKG_DIR to the folder with NN/video.mp4, or put them in <film>/sources/pkg)'); return p; }
function outPath(o, def) { const p = path.resolve(L.ROOT, o || def); fs.mkdirSync(path.dirname(p), { recursive: true }); return p; }
function rel(p) { return path.relative(L.ROOT, p).split(path.sep).join('/'); }
function ff(args) { execFileSync('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-y', ...args], { stdio: ['ignore', 'inherit', 'inherit'] }); }
function probeSize(f) { const s = execFileSync('ffprobe', ['-v', 'error', '-select_streams', 'v:0', '-show_entries', 'stream=width,height', '-of', 'csv=p=0', f]).toString().trim(); return s.split(',').map(Number); }

const a = L.parseArgs(process.argv.slice(2), ['png']);
const [cmd, x, y, z] = a._;
try {
  if (cmd === 'illus') {
    const n = nn(x); if (!n) throw new Error('usage: asset.js illus <NN>');
    const src = path.join(ILLUS_DIR, n + '.jpg'); if (!fs.existsSync(src)) throw new Error('not found: ' + src + ' (set ILLUS_DIR to the folder with NN.jpg, or put the files in <film>/sources/illus)');
    const out = outPath(a.out, `assets/illus/${n}.jpg`);
    fs.copyFileSync(src, out);
    const [w, h] = probeSize(out);
    console.log(`${rel(out)}  ${w}x${h}  (show at most ${Math.floor(w / 2)} css px wide for full 4K sharpness)`);
  } else if (cmd === 'frame') {
    const v = videoOf(x), t = +y; if (!isFinite(t)) throw new Error('usage: asset.js frame <NN|video> <sec>');
    const tag = (nn(x) || path.basename(v, '.mp4')) + '_' + t;
    const out = outPath(a.out, `assets/frames/${tag}.${a.png ? 'png' : 'jpg'}`);
    ff(['-ss', String(t), '-i', v, '-frames:v', '1', ...(a.png ? [] : ['-q:v', '1']), out]);
    const [w, h] = probeSize(out);
    console.log(`${rel(out)}  ${w}x${h}`);
  } else if (cmd === 'clip') {
    const v = videoOf(x), s = +y, d = +z; if (!isFinite(s) || !(d > 0)) throw new Error('usage: asset.js clip <NN|video> <start> <dur>');
    const fps = +(a.fps || 30), width = +(a.width || 1920);
    const tag = (nn(x) || path.basename(v, '.mp4')) + '_' + s + '_' + d;
    const dir = path.resolve(L.ROOT, a.out || `assets/clips/${tag}`);
    fs.rmSync(dir, { recursive: true, force: true }); fs.mkdirSync(dir, { recursive: true });
    ff(['-ss', String(s), '-t', String(d), '-i', v, '-vf', `fps=${fps},scale=${width}:-2:flags=lanczos`, '-q:v', '2', path.join(dir, 'f_%04d.jpg')]);
    const files = fs.readdirSync(dir).filter(f => /^f_\d{4}\.jpg$/.test(f)).sort();
    const [w, h] = probeSize(path.join(dir, files[0]));
    const man = { fps, count: files.length, width: w, height: h, pattern: 'f_%04d.jpg', source: v, start: s, duration: d };
    fs.writeFileSync(path.join(dir, 'manifest.json'), JSON.stringify(man, null, 1));
    console.log(`${rel(dir)}/  ${files.length} frames ${w}x${h} @ ${fps} fps  (util.sequence('${rel(dir)}'))`);
  } else if (cmd === 'list') {
    (function walk(d) { for (const f of fs.existsSync(d) ? fs.readdirSync(d) : []) { const p = path.join(d, f); if (fs.statSync(p).isDirectory()) { if (fs.existsSync(path.join(p, 'manifest.json'))) console.log(rel(p) + '/  (sequence)'); else walk(p); } else console.log(rel(p)); } })(ASSETS);
  } else {
    console.error(fs.readFileSync(__filename, 'utf8').split('\n').slice(1, 9).join('\n')); process.exit(2);
  }
} catch (e) { console.error('asset.js: ' + e.message); process.exit(1); }
