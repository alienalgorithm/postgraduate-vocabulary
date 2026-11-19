#!/usr/bin/env node
// node render.js --out <file.mp4> [--from s] [--to s] [--fps 60] [--scale 1|2] [--crf 17] [--preset medium]
//                [--parallel 4] [--audio auto|none|<file>] [--demo[=gallery]] [--storyboard path]
//                [--param k=v ...] [--nothree] [--barcode] [--capture png|jpeg] [--chunks K] [--x264-threads N] [--force] [--keep-chunks]
// Seeks every frame, captures it and pipes it straight into ffmpeg (no frame files on disk). With --parallel N the
// frame range is split into contiguous chunks (>= N, up to 6 per worker) that N workers (one browser each, a fresh page
// and a fresh ffmpeg per chunk) take from a queue; the chunks are joined with the concat demuxer (-c copy: no re-encode). Frame i of the output is global time from + i/fps, exactly once.
// --scale 2 = 3840x2160 (final film), --scale 1 = 1920x1080 (quick self-checks).
// Output: libx264 high, yuv420p, BT.709 tags, level 5.2 (4K60) / 4.2 (1080p60), -crf 17, -preset medium.
// --audio auto muxes storyboard.music.file (trimmed to [from, to]) as AAC 320k 48 kHz when it exists.
// Exit code 1 on any engine error (unless --force), ffmpeg failure, or a frame-count / size mismatch.
'use strict';
const fs = require('fs');
const path = require('path');
const os = require('os');
const { spawn, execFileSync } = require('child_process');
const L = require('./lib');

const a = L.parseArgs(process.argv.slice(2), ['demo', 'nothree', 'barcode', 'force', 'keep-chunks']);
const fps = +(a.fps || 60), scale = +(a.scale || 1), crf = +(a.crf == null ? 17 : a.crf), preset = a.preset || 'medium';
const parallel = Math.max(1, Math.floor(+(a.parallel || 1))), capFmt = a.capture === 'jpeg' ? 'jpeg' : 'png';
if (!a.out || a.out === true) { console.error('usage: node render.js --out <file.mp4> [--from s] [--to s] [--fps 60] [--scale 1|2] [--crf 17] [--parallel 4]'); process.exit(2); }
if (scale !== 1 && scale !== 2) { console.error('--scale must be 1 or 2'); process.exit(2); }
const OUT = path.resolve(a.out);
const OW = L.W * scale, OH = L.H * scale;

function log(s) { process.stderr.write(s + '\n'); }
function fmtDur(s) { s = Math.round(s); const h = Math.floor(s / 3600), m = Math.floor(s % 3600 / 60), x = s % 60; return (h ? h + 'h' : '') + (h || m ? String(m).padStart(h ? 2 : 1, '0') + 'm' : '') + String(x).padStart(h || m ? 2 : 1, '0') + 's'; }

function encoderArgs(file) {
  const level = scale === 2 ? '5.2' : '4.2';
  const args = ['-hide_banner', '-loglevel', 'error', '-y',
    '-f', 'image2pipe', '-framerate', String(fps), '-c:v', capFmt === 'png' ? 'png' : 'mjpeg', '-threads', '2', '-i', '-',
    '-vf', 'scale=out_color_matrix=bt709:out_range=tv:flags=lanczos+accurate_rnd+full_chroma_int,format=yuv420p',
    '-c:v', 'libx264', '-preset', preset, '-crf', String(crf), '-profile:v', 'high', '-level:v', level,
    '-pix_fmt', 'yuv420p', '-g', String(fps * 2), '-keyint_min', String(Math.round(fps / 2)),
    '-color_primaries', 'bt709', '-color_trc', 'bt709', '-colorspace', 'bt709', '-color_range', 'tv',
    '-r', String(fps)];
  if (a['x264-threads']) args.push('-threads', String(a['x264-threads']));
  args.push('-an', file);
  return args;
}

function ffprobe(file) {
  const j = JSON.parse(execFileSync('ffprobe', ['-v', 'error', '-count_packets', '-show_entries',
    'stream=index,codec_type,codec_name,width,height,r_frame_rate,nb_read_packets,pix_fmt,profile,level,duration:format=duration,size', '-of', 'json', file]).toString());
  const v = j.streams.find(s => s.codec_type === 'video'), au = j.streams.find(s => s.codec_type === 'audio');
  return { v, a: au, duration: +j.format.duration, size: +j.format.size };
}

/** Render frames [f0, f1) (global frame indices) into chunk file `file`. */
async function renderChunk(browser, id, f0, f1, srvPort, common, progress, abort) {
  let ff = null, eng = null;
  try {
    const t0 = f0 / fps, t1 = f1 / fps;
    eng = await L.openEngine(browser, srvPort, Object.assign({ scale, from: t0, to: t1 }, common));
    if (eng.info.fatal) throw new Error('engine failed to start: ' + (eng.info.errors || []).join(' | '));
    if (id === 0) L.printReport(eng.info, eng.logs, '');
    if ((eng.info.errors || []).length && !a.force) throw new Error('engine errors (use --force to render anyway): ' + eng.info.errors.join(' | '));
    const file = progress.chunkFile(id);
    ff = spawn('ffmpeg', encoderArgs(file), { stdio: ['pipe', 'ignore', 'pipe'] });
    let ffErr = '', ffDone = false, ffCode = null;
    ff.stderr.on('data', d => { ffErr += d; });
    const ffExit = new Promise(r => ff.on('close', c => { ffDone = true; ffCode = c; r(c); }));
    ff.stdin.on('error', () => { });
    const early = ffExit.then(() => { throw new Error('ffmpeg exited early: ' + ffErr.trim()); });
    early.catch(() => { });
    const write = buf => {
      if (ffDone) return Promise.reject(new Error('ffmpeg exited early: ' + ffErr.trim()));
      if (ff.stdin.write(buf)) return Promise.resolve();
      return Promise.race([new Promise(res => ff.stdin.once('drain', res)), early]);
    };
    let pending = Promise.resolve();
    for (let f = f0; f < f1; f++) {
      if (abort.flag) throw new Error('aborted');
      await eng.page.evaluate(t => window.seek(t), f / fps);
      const img = await L.capture(eng.cdp, capFmt);
      if (f === f0 && capFmt === 'png') { const [w, h] = L.pngSize(img); if (w !== OW || h !== OH) throw new Error(`captured ${w}x${h}, expected ${OW}x${OH}`); }
      await pending;          // at most one frame queued while the next one is being drawn
      pending = write(img);
      progress.tick(id);
      if ((f - f0) % 60 === 59) {
        const errs = await eng.page.evaluate(() => window.__engine.errors.slice());
        if (errs.length && !a.force) throw new Error('engine error while rendering: ' + errs.join(' | '));
      }
    }
    await pending;
    ff.stdin.end();
    const code = await ffExit;
    if (code !== 0) throw new Error('ffmpeg failed (' + code + '): ' + ffErr.trim());
    const late = await eng.page.evaluate(() => ({ e: window.__engine.errors.slice(), w: window.__engine.warnings.slice() }));
    for (const w of late.w) if (!(eng.info.warnings || []).includes(w)) log(`[chunk ${id}] WARN  ${w}`);
    if (late.e.length && !a.force) throw new Error('engine errors: ' + late.e.join(' | '));
    return file;
  } finally {
    if (ff && !ff.killed && ff.exitCode == null) { try { ff.stdin.destroy(); ff.kill('SIGKILL'); } catch (e) { } }
    if (eng) await eng.context.close().catch(() => { });
  }
}

/** P workers (one browser each) take contiguous chunks from a queue; each chunk gets a fresh page that builds only
 * the scenes it needs, so memory and WebGL contexts stay bounded and slow chunks do not leave workers idle. */
async function runPool(P, bounds, srvPort, common, progress, abort) {
  const K = bounds.length - 1, files = new Array(K);
  let next = 0;
  async function worker() {
    const browser = await L.launch();
    try {
      while (!abort.flag) {
        const i = next++;
        if (i >= K) break;
        files[i] = await renderChunk(browser, i, bounds[i], bounds[i + 1], srvPort, common, progress, abort);
      }
    } catch (e) { abort.flag = true; throw e; }
    finally { await browser.close().catch(() => { }); }
  }
  await Promise.all(Array.from({ length: P }, worker));
  return files;
}

(async () => {
  const T0 = Date.now();
  const srv = await L.startServer();
  let code = 0, tmpDir = null;
  try {
    const common = { demo: a.demo, storyboard: L.storyboardUrl(a.storyboard), param: a.param, nothree: a.nothree, barcode: a.barcode, energy: a.energy };
    // probe the storyboard for total / music
    const pb = await L.launch();
    const info = await L.probe(pb, srv.port, common);
    await pb.close();
    if (info.fatal) throw new Error('storyboard failed: ' + (info.errors || []).join(' | '));
    const from = a.from == null ? 0 : +a.from, to = a.to == null ? info.total : +a.to;
    const f0 = Math.round(from * fps), f1 = Math.round(to * fps), N = f1 - f0;
    if (!(N > 0)) throw new Error(`nothing to render: from ${from} to ${to}`);
    if (Math.abs(from * fps - f0) > 1e-6 || Math.abs(to * fps - f1) > 1e-6) log(`note: --from/--to rounded to frames ${f0}..${f1}`);
    const P = Math.min(parallel, Math.max(1, Math.floor(N / 30)));
    // chunks: at least P, up to 6 per worker, each >= 90 frames (or --chunks K)
    const K = a.chunks ? Math.max(1, Math.min(+a.chunks, N)) : Math.max(P, Math.min(P * 6, Math.floor(N / 90)));
    const bounds = []; for (let i = 0; i <= K; i++) bounds.push(f0 + Math.round(N * i / K));
    tmpDir = fs.mkdtempSync(path.join(path.dirname(OUT), '.render-'));
    log(`render ${OW}x${OH} @ ${fps} fps, frames ${f0}..${f1 - 1} (${N}), ${(N / fps).toFixed(3)} s, ${K} chunk(s) on ${P} worker(s), crf ${crf}, ${preset}, capture ${capFmt}${a.nothree ? ', nothree' : ''}`);

    const done = new Array(K).fill(0), abort = { flag: false };
    let lastLog = 0;
    const progress = {
      chunkFile: i => path.join(tmpDir, `chunk_${String(i).padStart(3, '0')}.mp4`),
      tick: i => {
        done[i]++;
        const now = Date.now(), tot = done.reduce((x, y) => x + y, 0);
        if (now - lastLog > 10000 || tot === N) {
          lastLog = now; const el = (now - T0) / 1000, rate = tot / el;
          log(`  ${tot}/${N} frames  ${(100 * tot / N).toFixed(1)}%  ${rate.toFixed(2)} fps  elapsed ${fmtDur(el)}  eta ${fmtDur((N - tot) / Math.max(rate, 1e-6))}`);
        }
      }
    };
    const files = await runPool(P, bounds, srv.port, common, progress, abort);
    const tRender = (Date.now() - T0) / 1000;

    // verify chunks, then join losslessly
    let sum = 0;
    files.forEach((f, i) => {
      const p = ffprobe(f), want = bounds[i + 1] - bounds[i], got = +p.v.nb_read_packets;
      if (got !== want) throw new Error(`chunk ${i} has ${got} frames, expected ${want}`);
      sum += got;
    });
    const list = path.join(tmpDir, 'list.txt');
    fs.writeFileSync(list, files.map(f => `file '${f.replace(/'/g, "'\\''")}'`).join('\n') + '\n');
    let audio = null;
    if (a.audio && a.audio !== 'auto' && a.audio !== 'none') audio = path.resolve(a.audio);
    else if (a.audio !== 'none' && info.music && info.music.url) {
      const p = path.resolve(L.ROOT, 'engine', info.music.url);
      if (fs.existsSync(p)) audio = p; else log(`note: music file ${info.music.file} not found; rendering without audio`);
    }
    const args = ['-hide_banner', '-loglevel', 'error', '-y', '-f', 'concat', '-safe', '0', '-i', list];
    if (audio) args.push('-ss', String(from), '-t', String(N / fps), '-i', audio, '-map', '0:v:0', '-map', '1:a:0', '-c:a', 'aac', '-b:a', '320k', '-ar', '48000', '-ac', '2');
    else args.push('-map', '0:v:0');
    args.push('-c:v', 'copy', '-movflags', '+faststart', OUT);
    execFileSync('ffmpeg', args, { stdio: ['ignore', 'inherit', 'inherit'] });

    const p = ffprobe(OUT), frames = +p.v.nb_read_packets;
    const tAll = (Date.now() - T0) / 1000;
    const ok = frames === N && +p.v.width === OW && +p.v.height === OH;
    console.log(`${OUT}`);
    console.log(`  ${p.v.codec_name} ${p.v.profile} L${p.v.level / 10} ${p.v.pix_fmt} ${p.v.width}x${p.v.height} ${p.v.r_frame_rate} fps, ${frames} frames (expected ${N}), ${p.duration.toFixed(3)} s, ${(p.size / 1048576).toFixed(1)} MB${p.a ? ', audio ' + p.a.codec_name : ', no audio'}`);
    console.log(`  render ${fmtDur(tRender)} (${(N / tRender).toFixed(2)} fps, ${(tRender / N * 1000).toFixed(0)} ms/frame wall), total ${fmtDur(tAll)}; a 3-minute film (${180 * fps} frames) at this speed: ~${fmtDur(180 * fps * tRender / N)}`);
    if (!ok) { console.error('  MISMATCH: expected ' + N + ' frames at ' + OW + 'x' + OH); code = 1; }
    if (sum !== N) { console.error('  chunk frame sum ' + sum + ' != ' + N); code = 1; }
  } catch (e) {
    console.error('render.js failed: ' + (e && e.stack || e)); code = 1;
  } finally {
    await srv.close();
    if (tmpDir && !a['keep-chunks']) fs.rmSync(tmpDir, { recursive: true, force: true });
    else if (tmpDir) log('chunks kept in ' + tmpDir);
  }
  process.exit(code);
})();
