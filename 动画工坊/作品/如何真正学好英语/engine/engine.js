/* Render engine core: storyboard loader, scene builder, deterministic seek, transitions, QA.
 * Page URL parameters:
 *   demo=1 | demo=gallery  use a built-in storyboard (ignores story/storyboard.json)
 *   storyboard=<url>       load another storyboard (relative to engine/)
 *   from=<s>&to=<s>        only load/build scenes visible in [from, to) (plus their neighbours)
 *   only=s01,s02           only load/build these scene ids
 *   barcode=1              draw a frame-index barcode (join verification only)
 *   preview=1              interactive scrubber + play (for humans in a browser)
 *   probe=1                load the storyboard only (no scene scripts)
 *   nothree=1              do not load three.js (ctx.util.three returns null)
 *   p.<key>=<value>        scene parameters, visible as ctx.params.<key>
 */
(function () {
  'use strict';
  var W = 1920, H = 1080, DEFAULT_XFADE = 0.3;
  var params = new URLSearchParams(location.search);
  var gsap = window.gsap;
  var U = window.__utilStatic;

  var E = window.__engine = {
    errors: [], warnings: [], scenes: [], bounds: [], builders: {}, storyboard: null, source: null,
    total: 0, fps: 60, t: null, assets: [], ready: null, music: null, energy: null, defs: null, plugins: {}
  };
  function msg(list, text, scene) { var m = (scene ? '[' + scene + '] ' : '') + text; if (list.indexOf(m) < 0) list.push(m); }
  E.error = function (text, scene) { msg(E.errors, text, scene); console.error('ENGINE ERROR ' + (scene ? '[' + scene + '] ' : '') + text); };
  E.warn = function (text, scene) { msg(E.warnings, text, scene); };
  E.trackAsset = function (p) { E.assets.push(p); };

  var building = null; // id of the scene currently being built / rendered (error attribution)
  var loadingFile = null; E.fileErrors = {};
  window.addEventListener('error', function (ev) {
    var f = (ev.filename || '').split('/').pop();
    var m = 'script error: ' + ev.message + (f ? ' (' + f + ':' + ev.lineno + ')' : '');
    // errors while a scene file is being loaded are reported with the scenes that use it (see init)
    if (loadingFile && f === loadingFile) { (E.fileErrors[f] = E.fileErrors[f] || []).push(m); return; }
    E.error(m, building);
  });
  window.addEventListener('unhandledrejection', function (ev) { E.error('unhandled promise rejection: ' + (ev.reason && ev.reason.stack || ev.reason), building); });

  // ---------- determinism: Math.random is re-seeded per scene build and per rendered frame ----------
  var cur = U.mulberry32(12345), phase = 'init';
  // (three.js uses Math.random for object uuids, ScrambleText for glyphs: all of it is a pure function of scene and time)
  Math.random = function () { return cur(); };
  function reseed(key) { cur = U.mulberry32(U.hashSeed(key)); }
  gsap.ticker.lagSmoothing(0);
  gsap.config({ nullTargetWarn: false });
  gsap.defaults({ overwrite: false });

  // ---------- GSAP plugins ----------
  (function registerPlugins() {
    var names = ['CustomEase', 'SplitText', 'MorphSVGPlugin', 'DrawSVGPlugin', 'MotionPathPlugin', 'ScrambleTextPlugin', 'Physics2DPlugin'];
    names.forEach(function (n) {
      var p = window[n];
      if (!p) { E.error('GSAP plugin ' + n + ' did not load'); return; }
      try { gsap.registerPlugin(p); E.plugins[n] = true; } catch (e) { E.error('could not register ' + n + ': ' + e); }
    });
    // ScrambleText keeps random state between renders (glyph set changes depend on the previous render time).
    // Patch its render so the scrambled glyphs are a pure function of (tween, time).
    if (window.ScrambleTextPlugin) {
      try {
        var d = document.createElement('div'); d.textContent = 'ab';
        var tw = gsap.to(d, { duration: 1, scrambleText: { text: 'cd' }, paused: true });
        tw.progress(0.5, true);
        var proto = null;
        for (var pt = tw._pt; pt; pt = pt._next) if (pt.d && pt.d.charSet) { proto = Object.getPrototypeOf(pt.d); break; }
        tw.kill();
        if (!proto || typeof proto.render !== 'function') throw new Error('plugin internals not found');
        var orig = proto.render;
        proto.render = function (ratio, data) {
          var t = data.tween._time, q = Math.floor(t / data.speed + 1e-6), cs = data.charSet;
          if (data.__q !== q || !data.__chars) {
            var seed = data.__seed || (data.__seed = U.hashSeed((data.original || []).join('') + '|' + (data.text || []).join('') + '|' + (cs.chars || []).join('')));
            var r = U.mulberry32(seed + q * 2654435761), s = '', n = Math.max(cs.length || 0, (data.length || 0) + Math.max(data.lengthDif || 0, 0) + 2), list = cs.chars;
            for (var i = 0; i < n; i++) s += list[Math.floor(r() * list.length)];
            data.__chars = s; data.__q = q;
          }
          data.chars = data.__chars;
          data.prevScrambleTime = t; // timeDif = 0: the plugin never draws its own random glyph set
          return orig.call(this, ratio, data);
        };
        E.plugins.ScrambleTextDeterministic = true;
      } catch (e) { E.error('could not make ScrambleTextPlugin deterministic: ' + e); }
    }
  })();

  // ---------- built-in storyboards ----------
  var DEMO_PALETTE = { bg: '#07080d', bg2: '#141a2e', ink: '#f5efe4', dim: '#9aa3b8', accent: '#ffb547', accent2: '#ff6a3d', cool: '#5ec8ff' };
  var DEMOS = {
    demo: {
      title: 'Engine demo', fps: 60, width: 1920, height: 1080, palette: DEMO_PALETTE,
      music: { file: null, energy: 'engine/test/energy_demo.json', bpm: 120, beat_offset: 0, bar: 1.5, sections: [{ name: 'demo', start: 0, end: 6 }], climax: 4.0 },
      scenes: [
        { id: 'd1', build: 'demo1', file: 'demo.js', start: 0, duration: 3, purpose: 'SplitText, MorphSVG, DrawSVG, MotionPath, particles, counter, glow sweep',
          texts: [{ in: 0.1, out: 2.9, text: '真正学会一个词', role: 'headline' }] },
        { id: 'd2', build: 'demo2', file: 'demo.js', start: 3, duration: 3, purpose: 'three.js word sphere, energy glow, ScrambleText, Physics2D, flow field, liquid',
          transition: { type: 'ink', duration: 0.6, rim: '#ffb547' },
          texts: [{ in: 0.3, out: 3, text: '恍然大悟', role: 'headline' }] }
      ],
      total: 6
    },
    gallery: {
      title: 'Helper gallery', fps: 60, width: 1920, height: 1080, palette: DEMO_PALETTE,
      music: { file: null, energy: 'engine/test/energy_demo.json', bpm: 120, beat_offset: 0, bar: 2.0, sections: [], climax: 2 },
      scenes: [
        { id: 'g1', build: 'gallery1', file: 'demo.js', start: 0, duration: 2, purpose: 'image, sequence, parallax, rays, maskReveal' },
        { id: 'g2', build: 'gallery2', file: 'demo.js', start: 2, duration: 2, purpose: 'typewriter, textPoints particles, chroma, displace', transition: { type: 'wipe', duration: 0.5, angle: 90 } },
        { id: 'g3', build: 'gallery3', file: 'demo.js', start: 4, duration: 2, purpose: 'custom transition in, liquid', transition: { type: 'iris', duration: 0.5 } },
        { id: 'g4', build: 'gallery4', file: 'demo.js', start: 6, duration: 2, purpose: 'transition types', transition: { type: 'liquid', duration: 0.5 } },
        { id: 'g5', build: 'gallery4', file: 'demo.js', start: 8, duration: 2, purpose: 'transition types', transition: { type: 'flash', duration: 0.4 } },
        { id: 'g6', build: 'gallery4', file: 'demo.js', start: 10, duration: 2, purpose: 'transition types', transition: { type: 'zoom', duration: 0.5, align: 'center' } },
        { id: 'g7', build: 'gallery4', file: 'demo.js', start: 12, duration: 2, purpose: 'transition types', transition: { type: 'push', duration: 0.5, angle: 180, align: 'after' } },
        { id: 'g8', build: 'gallery4', file: 'demo.js', start: 14, duration: 2, purpose: 'transition types', transition: { type: 'blur', duration: 0.5 } }
      ],
      total: 16
    }
  };

  // ---------- registry ----------
  window.registerScene = function (name, build) {
    if (typeof build !== 'function') { E.error('registerScene("' + name + '") needs a build function'); return; }
    if (E.builders[name]) E.warn('registerScene("' + name + '") called twice; the last one wins');
    E.builders[name] = build;
  };

  /** 'A/assets/x' | '/abs/.../anim/assets/x' | 'assets/x' | '../assets/x' | data:/http: -> URL relative to engine/ */
  function resolveAsset(p) {
    if (!p) return null;
    p = String(p);
    if (/^(https?:|data:|blob:|\.\.\/)/.test(p)) return p;
    if (p.indexOf('A/') === 0) return '../' + p.slice(2);
    var m = p.match(/(?:^|\/)anim\/(.*)$/);
    if (p[0] === '/' && m) return '../' + m[1];
    if (p[0] === '/') { E.warn('asset ' + p + ' is outside A; copy it into A/assets (node engine/asset.js ...)'); return p; }
    return '../' + p.replace(/^\.\//, '');
  }
  E.resolveAsset = resolveAsset;

  async function loadStoryboard() {
    var demo = params.get('demo');
    if (demo) { E.source = 'demo:' + (DEMOS[demo] ? demo : 'demo'); return JSON.parse(JSON.stringify(DEMOS[demo] || DEMOS.demo)); }
    var src = params.get('storyboard') || '../story/storyboard.json';
    var res;
    try { res = await fetch(src, { cache: 'no-store' }); }
    catch (e) { E.warn('could not fetch ' + src + ' (' + e + '); open the page through still.js/render.js/serve.js, not file://. Using the demo storyboard.'); E.source = 'demo:demo'; return JSON.parse(JSON.stringify(DEMOS.demo)); }
    if (res.status === 404) { E.warn(src + ' not found; using the demo storyboard'); E.source = 'demo:demo'; return JSON.parse(JSON.stringify(DEMOS.demo)); }
    if (!res.ok) throw new Error('storyboard fetch failed: HTTP ' + res.status);
    var txt = await res.text();
    try { E.source = src; return JSON.parse(txt); }
    catch (e) { throw new Error('storyboard.json is not valid JSON: ' + e.message); }
  }

  // ---------- music grid ----------
  function mod(a, n) { return ((a % n) + n) % n; }
  function musicGrid(sb) {
    var m = sb.music || {};
    if (!sb.music) E.warn('storyboard has no "music" field; beat helpers assume 120 bpm, offset 0');
    var bpm = +m.bpm || 120, beatLen = 60 / bpm;
    var offset = +m.beat_offset || 0;
    var bpb = m.bar ? Math.max(1, Math.round(+m.bar / beatLen)) : 4;
    var barLen = m.bar ? +m.bar : beatLen * bpb;
    var total = sb.total || 0;
    var beats = Array.isArray(m.beats) && m.beats.length ? m.beats.map(Number).filter(isFinite).sort(function (a, b) { return a - b; }) : null;
    var bars;
    if (beats) {
      var k0 = 0, bd = Infinity;
      beats.forEach(function (b, i) { var d = Math.abs(b - offset); if (d < bd) { bd = d; k0 = i; } });
      bars = beats.filter(function (b, i) { return mod(i - k0, bpb) === 0; });
      var lastB = beats[beats.length - 1];
      for (var x = lastB + beatLen; x < total + barLen; x += beatLen) beats.push(x);
      var lastBar = bars[bars.length - 1];
      for (var y = lastBar + barLen; y < total + barLen; y += barLen) bars.push(y);
      var firstB = beats[0];
      for (var z = firstB - beatLen; z > -barLen; z -= beatLen) beats.unshift(z);
      var firstBar = bars[0];
      for (var q = firstBar - barLen; q > -barLen; q -= barLen) bars.unshift(q);
    } else {
      beats = []; bars = [];
      var kStart = Math.floor((0 - offset) / beatLen) - 1, kEnd = Math.ceil((total + barLen - offset) / beatLen) + 1;
      for (var k = kStart; k <= kEnd; k++) beats.push(offset + k * beatLen);
      var jStart = Math.floor((0 - offset) / barLen) - 1, jEnd = Math.ceil((total + barLen - offset) / barLen) + 1;
      for (var j = jStart; j <= jEnd; j++) bars.push(offset + j * barLen);
    }
    return { bpm: bpm, beatLen: beatLen, barLen: barLen, beatsPerBar: bpb, offset: offset, beats: beats, bars: bars,
      sections: m.sections || [], climax: m.climax == null ? null : +m.climax, file: m.file || null, url: resolveAsset(m.file) };
  }
  function localGrid(list, start, dur) {
    var out = [];
    list.forEach(function (g) { var l = g - start; if (l > -0.05 && l < dur - 1e-6) out.push(Math.max(0, +l.toFixed(6))); });
    return out;
  }

  // ---------- energy.json ----------
  async function loadEnergy(sb) {
    var m = sb.music || {};
    var src = resolveAsset(params.get('energy') || m.energy || 'music/energy.json');
    try {
      var res = await fetch(src, { cache: 'no-store' });
      if (!res.ok) { E.warn('energy file ' + src + ' not found (HTTP ' + res.status + '); ctx.util.energy() returns 0.5'); return null; }
      var j = await res.json();
      var vals = Array.isArray(j) ? j : (j.energy || j.values || j.rms || j.env || j.e);
      var fps = Array.isArray(j) ? 60 : (+j.fps || +j.rate || (j.hop ? 1 / +j.hop : 60));
      var hits = Array.isArray(j) ? [] : (j.hits || j.drums || j.onsets || j.kicks || j.drum_hits || []);
      if (hits && !Array.isArray(hits) && typeof hits === 'object') { var all = []; for (var k in hits) if (Array.isArray(hits[k])) all = all.concat(hits[k]); hits = all; }
      hits = (hits || []).map(function (h) { return typeof h === 'object' ? +(h.t != null ? h.t : h.time) : +h; }).filter(isFinite).sort(function (a, b) { return a - b; });
      if (!Array.isArray(vals) || !vals.length) { E.warn('energy file ' + src + ' has no "energy" array; ctx.util.energy() returns 0.5'); return { fps: fps, values: null, hits: hits }; }
      var arr = new Float32Array(vals.length), bad = 0;
      for (var i = 0; i < vals.length; i++) { var v = +vals[i]; if (!isFinite(v)) { v = 0; bad++; } arr[i] = Math.min(1, Math.max(0, v)); }
      if (bad) E.warn('energy file has ' + bad + ' non-numeric values (set to 0)');
      return { fps: fps, values: arr, hits: hits, src: src };
    } catch (e) { E.warn('energy file ' + src + ' could not be read (' + e + '); ctx.util.energy() returns 0.5'); return null; }
  }

  // ---------- storyboard normalisation / checks ----------
  function readingTime(s) { var n = String(s || '').replace(/\s/g, '').length; return Math.max(1.6, 0.6 + n / 6); }
  function normTransition(tr, xfade) {
    if (tr == null) { if (xfade != null) return +xfade > 0 ? { type: 'fade', duration: +xfade } : { type: 'cut', duration: 0 }; return null; }
    if (typeof tr === 'string') tr = { type: tr };
    return Object.assign({}, tr);
  }
  function normalise(sb) {
    if (!sb || !Array.isArray(sb.scenes) || !sb.scenes.length) throw new Error('storyboard has no scenes');
    E.fps = +sb.fps || 60;
    var prevEnd = 0;
    sb.scenes.forEach(function (s, i) {
      if (!s.id) throw new Error('scene #' + i + ' has no id');
      s.start = +s.start; s.duration = +s.duration;
      if (!(s.duration > 0) || !(s.start >= 0)) throw new Error('scene ' + s.id + ' needs numeric start >= 0 and duration > 0');
      if (Math.abs(s.start - prevEnd) > 0.002) E.warn('scene ' + s.id + ' starts at ' + s.start + ' but the previous scene ends at ' + prevEnd.toFixed(3) + ' (scenes must be contiguous)');
      prevEnd = s.start + s.duration;
      s.__tr = i === 0 ? null : normTransition(s.transition, s.xfade);
      (s.texts || []).forEach(function (tx) {
        if (/[—–]|――/.test(tx.text || '')) E.warn('text "' + tx.text + '" contains a dash (not allowed on screen)', s.id);
        var need = readingTime(tx.text), have = (+tx.out) - (+tx.in);
        if (isFinite(have) && have + 1e-6 < need) E.warn('text "' + String(tx.text).slice(0, 20) + '" stays ' + have.toFixed(2) + ' s; it needs >= ' + need.toFixed(2) + ' s', s.id);
        if (+tx.out > s.duration + 1e-6) E.warn('text "' + String(tx.text).slice(0, 20) + '" ends after the scene', s.id);
      });
    });
    var last = sb.scenes[sb.scenes.length - 1], end = last.start + last.duration;
    if (sb.total == null) sb.total = end;
    sb.total = +sb.total;
    if (Math.abs(sb.total - end) > 0.002) E.warn('storyboard total ' + sb.total + ' != last scene end ' + end.toFixed(3));
    var ids = {};
    sb.scenes.forEach(function (s) { if (ids[s.id]) throw new Error('duplicate scene id ' + s.id); ids[s.id] = 1; });
    return sb;
  }
  function checkBars(sb, grid) {
    if (!sb.music) return;
    sb.scenes.forEach(function (s) {
      var best = Infinity; grid.bars.forEach(function (b) { best = Math.min(best, Math.abs(b - s.start)); });
      if (best > 0.05) E.warn('scene ' + s.id + ' start ' + s.start + ' is ' + best.toFixed(3) + ' s off the nearest bar line (limit 0.05)');
    });
  }

  function applyPalette(sb) {
    var pal = Object.assign({}, sb.palette || {});
    var alias = { text: 'ink', background: 'bg', muted: 'dim', highlight: 'accent2', primary: 'accent', secondary: 'cool' };
    for (var a in alias) if (pal[a] != null && pal[alias[a]] == null) pal[alias[a]] = pal[a];
    var rs = document.documentElement.style;
    for (var k in pal) if (typeof pal[k] === 'string') rs.setProperty('--' + k, pal[k]);
    var cs = getComputedStyle(document.documentElement), out = {};
    ['bg', 'bg2', 'ink', 'dim', 'accent', 'accent2', 'cool', 'hot', 'line'].forEach(function (k) { out[k] = cs.getPropertyValue('--' + k).trim(); });
    for (var k2 in pal) out[k2] = pal[k2];
    return out;
  }

  // ---------- fonts / three ----------
  async function loadFonts() {
    var faces = [];
    document.fonts.forEach(function (f) { faces.push(f); });
    var res = await Promise.all(faces.map(function (f) { return f.load().then(function () { return null; }, function (e) { return f.family + ' ' + f.weight + ' ' + f.style + ': ' + e; }); }));
    res.forEach(function (r) { if (r) E.error('font failed to load: ' + r); });
    await document.fonts.ready;
    return faces.length;
  }
  async function loadThree() {
    if (params.get('nothree')) { E.noThree = true; return false; }
    try { window.THREE = await import('../node_modules/three/build/three.module.min.js'); return true; }
    catch (e) { E.error('three.js failed to load: ' + e); return false; }
  }

  // ---------- look (vignette + deterministic moving grain) ----------
  var grainEl = null, grainPad = 128;
  function buildLook(stage, look) {
    look = look || {};
    var layer = document.createElement('div'); layer.id = 'look'; stage.appendChild(layer);
    var vig = look.vignette == null ? 0.5 : +look.vignette;
    if (vig > 0) { var v = document.createElement('div'); v.className = 'vignette'; v.style.setProperty('--vig', vig); layer.appendChild(v); }
    var grain = look.grain == null ? 0.05 : +look.grain;
    if (grain > 0) {
      var dpr = window.devicePixelRatio || 1;
      var T = 256, tile = document.createElement('canvas'); tile.width = tile.height = T;
      var tg = tile.getContext('2d'), img = tg.createImageData(T, T), r = U.mulberry32(777);
      for (var i = 0; i < img.data.length; i += 4) { var n = (r() + r() + r()) / 3; var c = Math.round(n * 255); img.data[i] = img.data[i + 1] = img.data[i + 2] = c; img.data[i + 3] = 255; }
      tg.putImageData(img, 0, 0);
      var cv = document.createElement('canvas'); cv.className = 'grain';
      // one grain texel per device pixel; extra pad so the per-frame offset never shows an edge
      cv.width = Math.round((W + grainPad) * dpr); cv.height = Math.round((H + grainPad) * dpr);
      cv.style.width = (W + grainPad) + 'px'; cv.style.height = (H + grainPad) + 'px';
      var g = cv.getContext('2d'); g.fillStyle = g.createPattern(tile, 'repeat'); g.fillRect(0, 0, cv.width, cv.height);
      cv.style.opacity = grain;
      layer.appendChild(cv);
      if (look.grainMove !== false) grainEl = cv;
    }
    var flash = document.createElement('div'); flash.id = 'flash'; flash.style.display = 'none'; stage.insertBefore(flash, layer);
    E.flashEl = flash;
  }
  function moveGrain(t) {
    if (!grainEl) return;
    var f = Math.round(t * 24); // grain changes 24 times per second, like film
    var dx = Math.floor(U.hash(f, 'gx') * grainPad), dy = Math.floor(U.hash(f, 'gy') * grainPad);
    grainEl.style.transform = 'translate(' + (-dx) + 'px,' + (-dy) + 'px)';
  }

  // ---------- barcode (debug, join verification) ----------
  var barcodeEl = null, BARCODE_BITS = 20;
  function buildBarcode(stage) {
    barcodeEl = document.createElement('div'); barcodeEl.id = 'barcode';
    for (var i = 0; i < BARCODE_BITS + 2; i++) { var b = document.createElement('div'); b.className = 'bit'; barcodeEl.appendChild(b); }
    stage.appendChild(barcodeEl);
  }
  function drawBarcode(t) {
    var n = Math.round(t * E.fps), kids = barcodeEl.children;
    kids[0].style.background = '#fff'; kids[1].style.background = '#000';
    for (var i = 0; i < BARCODE_BITS; i++) kids[i + 2].style.background = (n >> i) & 1 ? '#fff' : '#000';
  }

  // ---------- build ----------
  function loadScript(src) {
    return new Promise(function (resolve) {
      var s = document.createElement('script'); s.src = src;
      s.onload = function () { resolve(true); };
      s.onerror = function () { resolve(false); };
      document.head.appendChild(s);
    });
  }
  function placeholder(root, s, why) {
    root.classList.add('placeholder');
    root.innerHTML = '<div class="ph-box"><div class="ph-id"></div><div class="ph-why"></div><div class="ph-purpose"></div></div>';
    root.querySelector('.ph-id').textContent = s.id + '  ' + s.start.toFixed(2) + 's +' + s.duration.toFixed(2) + 's';
    root.querySelector('.ph-why').textContent = why;
    root.querySelector('.ph-purpose').textContent = s.purpose || '';
    root.setAttribute('data-qa', 'off');
  }
  function sceneParams() {
    var out = {};
    params.forEach(function (v, k) { if (k.indexOf('p.') === 0) out[k.slice(2)] = v === '' ? true : (isFinite(+v) ? +v : v); });
    if (params.get('nothree')) out.nothree = true;
    return out;
  }

  async function init() {
    var stage = document.getElementById('stage');
    var sb = normalise(await loadStoryboard());
    E.storyboard = sb; E.total = sb.total;
    var palette = applyPalette(sb);
    var grid = musicGrid(sb);
    E.music = grid;
    checkBars(sb, grid);
    var nFonts = await loadFonts();
    if (params.get('probe')) {
      return { probe: true, total: E.total, fps: E.fps, source: E.source, fonts: nFonts, errors: E.errors, warnings: E.warnings,
        scenes: sb.scenes.map(function (s) { return { id: s.id, start: s.start, duration: s.duration }; }), music: { file: grid.file, url: grid.url, bpm: grid.bpm } };
    }
    var res = await Promise.all([loadThree(), loadEnergy(sb)]);
    E.energy = res[1];
    buildLook(stage, sb.look);
    // global SVG defs (filters for transitions and util.liquid/ink/...): never display:none, so references always resolve
    var defsSvg = U.svgEl('svg', { id: 'engine-defs', width: 0, height: 0, 'aria-hidden': 'true' });
    defsSvg.style.position = 'absolute'; defsSvg.style.left = '0'; defsSvg.style.top = '0';
    stage.appendChild(defsSvg);
    E.defs = U.svgEl('defs', {}, defsSvg);
    if (params.get('barcode')) buildBarcode(stage);

    // which scenes to load: those intersecting [from, to) plus one neighbour on each side (their transitions reach in)
    var from = params.has('from') ? +params.get('from') : -Infinity;
    var to = params.has('to') ? +params.get('to') : Infinity;
    var only = params.get('only') ? params.get('only').split(',') : null;
    var all = sb.scenes.map(function (s, i) {
      return { sb: s, index: i, id: s.id, start: s.start, duration: s.duration, end: s.start + s.duration, tin: null, tout: null };
    });
    var keep = {};
    all.forEach(function (sc, i) {
      var hit = only ? only.indexOf(sc.id) >= 0 : (sc.start < to && sc.end > from);
      if (hit) { keep[i] = 1; if (!only) { if (i > 0) keep[i - 1] = 1; if (i < all.length - 1) keep[i + 1] = 1; } }
    });
    var list = all.filter(function (sc, i) { return keep[i]; });
    var byIndex = {}; list.forEach(function (sc) { byIndex[sc.index] = sc; });

    // load scene scripts (each file once)
    var files = {};
    list.forEach(function (sc) { files[sc.sb.file || ((sc.sb.build || sc.id) + '.js')] = 1; });
    var loaded = {};
    phase = 'build';
    for (var f in files) { building = f; loadingFile = f; reseed('file:' + f); loaded[f] = await loadScript('../scenes/' + f); loadingFile = null; building = null; }

    var anchorEl = document.getElementById('flash');
    for (var i = 0; i < list.length; i++) {
      var sc = list[i], s = sc.sb;
      var file = s.file || ((s.build || sc.id) + '.js');
      var name = s.build || sc.id;
      var wrap = document.createElement('div');
      wrap.className = 'scene'; wrap.dataset.scene = sc.id;
      wrap.style.visibility = 'hidden';
      var root = document.createElement('div'); root.className = 'scene-root';
      wrap.appendChild(root);
      stage.insertBefore(wrap, anchorEl);
      sc.wrap = wrap; sc.root = root; sc.hooks = []; sc.renderHooks = []; sc.shown = true;
      sc.tl = gsap.timeline({ paused: true });
      sc.musicLocal = { beatsLocal: localGrid(grid.beats, sc.start, sc.duration), barsLocal: localGrid(grid.bars, sc.start, sc.duration), beatLen: grid.beatLen, barLen: grid.barLen };
      var builder = E.builders[name];
      if (!builder) {
        sc.failMsg = !loaded[file] ? 'scene file scenes/' + file + ' is missing' : 'scenes/' + file + ' did not call registerScene("' + name + '")';
        placeholder(root, s, loaded[file] ? 'registerScene("' + name + '") missing' : 'scenes/' + file + ' missing');
        sc.failed = true; E.scenes.push(sc); continue;
      }
      var util = window.__makeUtil(sc, E);
      var ctx = makeCtx(sc, s, sb, grid, palette, util);
      building = sc.id; reseed('build:' + sc.id);
      try {
        var r = builder(sc.tl, root, ctx);
        if (r && typeof r.then === 'function') await r;
      } catch (e) {
        E.error('build() threw: ' + (e && e.stack || e), sc.id);
        root.innerHTML = ''; placeholder(root, s, 'build() threw: ' + e); sc.failed = true; sc.hooks = []; sc.renderHooks = [];
      }
      // stray animations (gsap.to/from never added to tl) would run on the wall clock: kill them
      gsap.globalTimeline.getChildren(false, true, true).forEach(function (k) {
        if (k.__sceneTl) return;
        if (k === sc.tl) { k.__sceneTl = true; return; }
        E.warn('an animation was created but not added to tl (it was removed; use tl.add / tl.to)', sc.id);
        k.kill();
      });
      if (sc.tl.duration() > sc.duration + 0.001) E.warn('timeline is ' + sc.tl.duration().toFixed(3) + ' s, longer than the scene (' + sc.duration.toFixed(3) + ' s); the rest is never shown', sc.id);
      // prime: initialise every tween in timeline order, independent of where a render chunk starts
      if (!sc.failed) {
        try { sc.tl.totalTime(sc.tl.duration(), true); sc.tl.totalTime(0, true); }
        catch (e) { E.error('timeline failed while priming: ' + (e && e.stack || e), sc.id); }
      }
      building = null;
      E.scenes.push(sc);
    }
    phase = 'render';
    await Promise.all(E.assets); E.assets = [];

    // transitions between consecutive loaded scenes
    for (var k = 0; k < list.length; k++) {
      var b = list[k];
      if (b.index === 0) continue;
      var a = byIndex[b.index - 1];
      var spec = b.tin || (a && a.tout) || b.sb.__tr || { type: 'fade', duration: DEFAULT_XFADE };
      spec = Object.assign({ type: 'fade', duration: DEFAULT_XFADE, align: 'before' }, spec);
      if (spec.type === 'cut' || spec.type === 'none') spec.duration = 0;
      var maxD = 0.5 * Math.min(b.duration, a ? a.duration : b.duration);
      if (spec.duration > maxD) { E.warn('transition into ' + b.id + ' is ' + spec.duration + ' s; clamped to ' + maxD.toFixed(3) + ' s (half the shorter scene)', b.id); spec.duration = maxD; }
      if (TRANSITIONS[spec.type] == null && spec.type !== 'custom' && spec.type !== 'cut' && spec.type !== 'none') { E.error('unknown transition type "' + spec.type + '"', b.id); spec.type = 'fade'; }
      if (spec.type === 'custom' && typeof spec.fn !== 'function') { E.error('custom transition needs fn(p, info)', b.id); spec.type = 'fade'; }
      var d = +spec.duration, w0 = spec.align === 'after' ? b.start : spec.align === 'center' ? b.start - d / 2 : b.start - d;
      var bd = { a: a || null, b: b, spec: spec, w0: w0, w1: w0 + d, ease: gsap.parseEase(spec.ease || (spec.type === 'fade' ? 'sine.inOut' : 'power2.inOut')), fx: null };
      if (d > 0) E.bounds.push(bd);
      b.inBound = bd; if (a) a.outBound = bd;
    }
    E.scenes.forEach(function (sc) {
      sc.vis0 = sc.inBound && sc.inBound.w1 > sc.inBound.w0 ? Math.min(sc.start, sc.inBound.w0) : sc.start;
      sc.vis1 = sc.outBound && sc.outBound.w1 > sc.outBound.w0 ? Math.max(sc.end, sc.outBound.w1) : sc.end;
      // a missing scene only blocks rendering if it is actually visible in the requested range; a missing neighbour
      // (loaded only for its transition) is a warning, so authors can render their own scene before the others exist
      var ferr = E.fileErrors[sc.sb.file || ((sc.sb.build || sc.id) + '.js')];
      var msgs = (sc.failMsg ? [sc.failMsg] : []).concat(ferr || []);
      var core = only || (sc.vis0 < to && sc.vis1 > from);
      msgs.forEach(function (m) { if (core) E.error(m, sc.id); else E.warn(m + ' (neighbour outside the requested range)', sc.id); });
      sc.wrap.style.display = 'none'; sc.wrap.style.visibility = ''; sc.shown = false;
    });
    if (params.get('preview')) setupPreview(stage, grid);
    return {
      total: E.total, fps: E.fps, source: E.source, fonts: nFonts, errors: E.errors, warnings: E.warnings, three: !!window.THREE,
      energy: E.energy ? { src: E.energy.src, frames: E.energy.values ? E.energy.values.length : 0, hits: E.energy.hits.length } : null,
      plugins: E.plugins,
      scenes: E.scenes.map(function (sc) { return { id: sc.id, start: sc.start, duration: sc.duration, vis0: sc.vis0, vis1: sc.vis1, failed: !!sc.failed,
        transitionIn: sc.inBound ? { type: sc.inBound.spec.type, duration: sc.inBound.spec.duration, align: sc.inBound.spec.align } : null }; }),
      music: { file: grid.file, url: grid.url, bpm: grid.bpm, bar: grid.barLen }
    };
  }

  function makeCtx(sc, s, sb, grid, palette, util) {
    return {
      id: sc.id, start: sc.start, duration: sc.duration, end: sc.end, width: W, height: H, dpr: window.devicePixelRatio || 1,
      palette: palette, util: util, scene: s, texts: s.texts || [], storyboard: sb, params: sceneParams(),
      music: { bpm: grid.bpm, beat: grid.beatLen, bar: grid.barLen, beatsPerBar: grid.beatsPerBar, offset: grid.offset,
        sections: grid.sections, climax: grid.climax, climaxLocal: grid.climax == null ? null : grid.climax - sc.start },
      beats: sc.musicLocal.beatsLocal, bars: sc.musicLocal.barsLocal,
      onFrame: util.onFrame, THREE: window.THREE || null,
      /** transitionIn(spec): how this scene enters (overrides the storyboard). transitionOut(spec): how it leaves
       * (used unless the next scene declares transitionIn). */
      transitionIn: function (spec) { sc.tin = normTransition(spec); },
      transitionOut: function (spec) { sc.tout = normTransition(spec); }
    };
  }

  // ---------- transitions ----------
  // Every transition is applied to the scene wrappers (div.scene, engine-owned); the author's root inside is untouched.
  // During the window the outgoing scene A is on top (z 2), the incoming B underneath (z 1).
  function filterFor(bd, kind, which, make) {
    bd.fx = bd.fx || {};
    var key = kind + which;
    if (!bd.fx[key]) bd.fx[key] = make('tx-' + bd.b.id + '-' + key);
    return bd.fx[key];
  }
  var TRANSITIONS = {
    fade: function (bd, p, A) { if (A) A.style.opacity = (1 - p).toFixed(4); },
    wipe: function (bd, p, A) { if (A) U.setMask(A, U.maskLinear(W, H, bd.spec.angle == null ? 90 : bd.spec.angle, p, bd.spec.soft == null ? 160 : bd.spec.soft, true)); },
    iris: function (bd, p, A) { if (A) U.setMask(A, U.maskRadial(W, H, bd.spec.x == null ? W / 2 : bd.spec.x, bd.spec.y == null ? H / 2 : bd.spec.y, p, bd.spec.soft == null ? 120 : bd.spec.soft, true)); },
    blur: function (bd, p, A, B) {
      var R = bd.spec.radius || 24;
      if (A) { A.style.filter = 'blur(' + (p * R).toFixed(2) + 'px)'; A.style.opacity = (1 - p).toFixed(4); }
      if (B && p < 0.999) B.style.filter = 'blur(' + ((1 - p) * R).toFixed(2) + 'px)';
    },
    zoom: function (bd, p, A, B) {
      var z = bd.spec.scale || 0.18;
      if (A) { A.style.transform = 'scale(' + (1 + z * p).toFixed(5) + ')'; A.style.opacity = (1 - p).toFixed(4); }
      if (B) B.style.transform = 'scale(' + (1 - z * 0.5 * (1 - p)).toFixed(5) + ')';
    },
    push: function (bd, p, A, B) {
      var ang = (bd.spec.angle == null ? 90 : bd.spec.angle) * Math.PI / 180, dx = Math.sin(ang) * W, dy = -Math.cos(ang) * H;
      if (A) A.style.transform = 'translate3d(' + (-dx * p).toFixed(2) + 'px,' + (-dy * p).toFixed(2) + 'px,0)';
      if (B) B.style.transform = 'translate3d(' + (dx * (1 - p)).toFixed(2) + 'px,' + (dy * (1 - p)).toFixed(2) + 'px,0)';
    },
    flash: function (bd, p, A) {
      var f = E.flashEl, tri = 1 - Math.abs(2 * p - 1);
      f.style.display = 'block'; f.style.background = bd.spec.color || '#fff7e6'; f.style.opacity = Math.min(1, tri * 1.25).toFixed(4);
      if (A && p >= 0.5) A.style.visibility = 'hidden';
    },
    liquid: function (bd, p, A, B, t) {
      var S = bd.spec.scale || 140;
      if (A) { var fa = filterFor(bd, 'liq', 'A', function (id) { return U.liquidFilter(E.defs, id, bd.spec); }); fa.set(S * p, t); A.style.filter = fa.url; A.style.opacity = (1 - p).toFixed(4); }
      if (B && p < 0.999) { var fb = filterFor(bd, 'liq', 'B', function (id) { return U.liquidFilter(E.defs, id, Object.assign({}, bd.spec, { seed: (bd.spec.seed || 7) + 11 })); }); fb.set(S * (1 - p), t); B.style.filter = fb.url; }
    },
    ink: function (bd, p, A) {
      if (!A) return;
      var f = filterFor(bd, 'ink', 'A', function (id) { return U.inkFilter(E.defs, id, Object.assign({ rim: '#ffb547' }, bd.spec, { width: W, height: H })); });
      if (p >= 0.9995) { A.style.visibility = 'hidden'; return; }
      f.set(1 - p); A.style.filter = f.url;
    }
  };
  var fxDirty = [];
  function resetFx() {
    for (var i = 0; i < fxDirty.length; i++) {
      var e = fxDirty[i], s = e.style;
      s.opacity = ''; s.filter = ''; s.transform = ''; s.visibility = ''; s.webkitMaskImage = ''; s.maskImage = ''; s.zIndex = ''; s.clipPath = '';
    }
    fxDirty = [];
    for (var j = 0; j < E.scenes.length; j++) E.scenes[j].txMoving = false;
    if (E.flashEl) E.flashEl.style.cssText = 'display:none';
  }
  function applyBound(bd, t) {
    var lin = (t - bd.w0) / (bd.w1 - bd.w0), p = bd.ease(Math.min(1, Math.max(0, lin)));
    var A = bd.a && bd.a.shown ? bd.a.wrap : null;
    var B = bd.b.shown ? bd.b.wrap : null;
    if (A) { A.style.zIndex = 2; fxDirty.push(A); }
    if (B) { B.style.zIndex = 1; fxDirty.push(B); }
    var sp = bd.spec;
    // scenes moved by the transition itself may leave the frame on purpose: qa() skips 'outside' for them
    if (sp.type === 'push' || sp.type === 'zoom' || sp.type === 'custom') { if (bd.a) bd.a.txMoving = true; bd.b.txMoving = true; }
    if (sp.type === 'custom') {
      try { sp.fn(p, { out: A, in: B, outRoot: bd.a ? bd.a.root : null, inRoot: bd.b.root, t: t, linear: lin, duration: bd.w1 - bd.w0, outScene: bd.a ? bd.a.id : null, inScene: bd.b.id }); }
      catch (e) { E.error('custom transition threw: ' + (e && e.stack || e), bd.b.id); }
    } else TRANSITIONS[sp.type](bd, p, A, B, t);
  }

  // ---------- seek ----------
  async function assetsReady() {
    if (document.fonts.status !== 'loaded') await document.fonts.ready;
    for (var guard = 0; E.assets.length && guard < 5; guard++) { var a = E.assets; E.assets = []; await Promise.all(a); }
    var imgs = [];
    E.scenes.forEach(function (sc) {
      if (!sc.shown) return;
      var list = sc.root.getElementsByTagName('img');
      for (var i = 0; i < list.length; i++) if (list[i].src && (!list[i].complete || !list[i].naturalWidth)) imgs.push(list[i].decode().catch(function () {}));
    });
    if (imgs.length) await Promise.all(imgs);
  }

  async function doSeek(t) {
    t = +t;
    if (!isFinite(t)) throw new Error('seek(t): t must be a number');
    var info = await E.ready;
    if (info && info.fatal) throw new Error('engine failed to start: ' + E.errors.join(' | '));
    E.t = t;
    resetFx();
    // 1. visibility
    for (var i = 0; i < E.scenes.length; i++) {
      var sc = E.scenes[i], vis = t >= sc.vis0 && t < sc.vis1;
      if (!vis) { if (sc.shown) { sc.wrap.style.display = 'none'; sc.shown = false; } continue; }
      if (!sc.shown) { sc.wrap.style.display = 'block'; sc.shown = true; }
    }
    // 2. transitions
    for (var j = 0; j < E.bounds.length; j++) { var bd = E.bounds[j]; if (t >= bd.w0 && t < bd.w1) applyBound(bd, t); }
    // 3. render timelines + per-frame hooks
    for (var k = 0; k < E.scenes.length; k++) {
      var s = E.scenes[k];
      if (!s.shown || s.failed) continue;
      var local = t - s.start, lt = Math.min(Math.max(local, 0), s.duration);
      building = s.id; reseed(s.id + '@' + Math.round(t * 1e4));
      try {
        s.tl.totalTime(lt, false);
        for (var h = 0; h < s.hooks.length; h++) s.hooks[h](local, lt);
        for (var r = 0; r < s.renderHooks.length; r++) s.renderHooks[r](local, lt);
      } catch (e) { E.error('error while rendering t=' + t.toFixed(3) + ': ' + (e && e.stack || e), s.id); }
      building = null;
    }
    moveGrain(t);
    if (barcodeEl) drawBarcode(t);
    await assetsReady();
    return t;
  }
  var chain = Promise.resolve();
  /** seek(t): render global time t; resolves once fonts, images and frame-sequence frames are decoded. Calls are serialised. */
  window.seek = function (t) { var p = chain.then(function () { return doSeek(t); }); chain = p.catch(function () {}); return p; };

  // ---------- state hash (test.js): normalised DOM state of everything visible + a checksum of every visible canvas ----------
  function serialise(node, out) {
    if (node.nodeType === 3) { out.push('#' + node.nodeValue); return; }
    if (node.nodeType !== 1) return;
    var attrs = [];
    for (var i = 0; i < node.attributes.length; i++) {
      var at = node.attributes[i];
      if (at.name === 'style') {
        var st = node.style, decl = [];
        for (var j = 0; j < st.length; j++) decl.push(st[j] + ':' + st.getPropertyValue(st[j]));
        attrs.push('style=' + decl.sort().join(';'));
      } else attrs.push(at.name + '=' + at.value);
    }
    out.push('<' + node.tagName + ' ' + attrs.sort().join(' ') + '>');
    for (var c = node.firstChild; c; c = c.nextSibling) serialise(c, out);
    out.push('</>');
  }
  window.__stateHash = function (raw) {
    var parts = [];
    var scratch = document.createElement('canvas'); scratch.width = 64; scratch.height = 36;
    var g = scratch.getContext('2d', { willReadFrequently: true });
    E.scenes.forEach(function (sc) {
      if (!sc.shown) return;
      serialise(sc.wrap, parts);
      var cvs = sc.wrap.getElementsByTagName('canvas');
      for (var i = 0; i < cvs.length; i++) {
        g.clearRect(0, 0, 64, 36);
        try { g.drawImage(cvs[i], 0, 0, 64, 36); var d = g.getImageData(0, 0, 64, 36).data, s = 0; for (var k = 0; k < d.length; k++) s = (s * 31 + d[k]) >>> 0; parts.push(sc.id + ':canvas' + i + ':' + s); }
        catch (e) { parts.push('canvas-error'); }
      }
    });
    ['look', 'flash'].forEach(function (id) { var e = document.getElementById(id); if (e) serialise(e, parts); });
    // SVG filters referenced by visible elements
    var refs = {}, txt = parts.join('\n'), re = /url\(["']?#([\w-]+)/g, m;
    while ((m = re.exec(txt))) refs[m[1]] = 1;
    Object.keys(refs).sort().forEach(function (id) { var f = document.getElementById(id); if (f) serialise(f, parts); });
    return raw ? parts.join('\n') : U.hashSeed(parts.join('\n')).toString(16);
  };

  // ---------- QA (text inside frame, min size, fonts, overlaps, dashes) ----------
  var FAMILIES = ['Noto Sans SC', 'Noto Serif SC', 'Source Serif 4 Display'];
  function effOpacity(e) {
    var o = 1;
    for (var n = e; n && n.id !== 'stage'; n = n.parentElement) {
      var cs = getComputedStyle(n);
      if (cs.display === 'none' || cs.visibility === 'hidden') return 0;
      o *= parseFloat(cs.opacity);
      if (o < 0.01) return 0;
    }
    return o;
  }
  function blockOf(e) {
    for (var n = e; n && !n.classList.contains('scene-root'); n = n.parentElement) {
      var d = getComputedStyle(n).display;
      if (d !== 'inline' && d !== 'inline-block' && d !== 'contents' && !(n.classList.contains('w') || n.classList.contains('ch') || n.classList.contains('char') || n.classList.contains('word'))) return n;
    }
    return e;
  }
  window.qa = function () {
    var issues = [], blocks = new Map();
    E.scenes.forEach(function (sc) {
      if (!sc.shown || sc.failed) return;
      var tw = document.createTreeWalker(sc.root, NodeFilter.SHOW_TEXT), node;
      while ((node = tw.nextNode())) {
        if (!node.nodeValue.replace(/[\s​ ]/g, '')) continue;
        var e = node.parentElement;
        if (!e || e.closest('[data-qa="off"]') || e.closest('svg defs')) continue;
        var op = effOpacity(e);
        if (op < 0.05) continue;
        var cs = getComputedStyle(e), fs = parseFloat(cs.fontSize);
        var host = e.closest('.split') || e.closest('[aria-label]') || e;
        var snippet = host.textContent.replace(/\s+/g, ' ').trim().slice(0, 24);
        var scale = 1; var r0 = e.getBoundingClientRect(); if (e.offsetHeight) scale = r0.height / e.offsetHeight;
        if (fs * Math.min(1, scale || 1) < 39.5 && !e.closest('svg')) issues.push({ type: 'small', scene: sc.id, text: snippet, detail: 'font-size ' + (fs * Math.min(1, scale || 1)).toFixed(1) + 'px < 40px' });
        if (/[—–]|――/.test(node.nodeValue)) issues.push({ type: 'dash', scene: sc.id, text: snippet, detail: 'dash characters are not allowed on screen' });
        var fam = cs.fontFamily.split(',')[0].replace(/["']/g, '').trim();
        if (FAMILIES.indexOf(fam) < 0) issues.push({ type: 'font', scene: sc.id, text: snippet, detail: 'font-family "' + fam + '" is not one of A/fonts' });
        var rg = document.createRange(); rg.selectNodeContents(node);
        var rects = rg.getClientRects(), b = blockOf(e), entry = blocks.get(b);
        if (!entry) { entry = { scene: sc.id, text: (b.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 24), op: 0, l: Infinity, t: Infinity, r: -Infinity, btm: -Infinity, el: b }; blocks.set(b, entry); }
        entry.op = Math.max(entry.op, op);
        for (var i = 0; i < rects.length; i++) {
          var r = rects[i]; if (r.width < 0.5 || r.height < 0.5) continue;
          entry.l = Math.min(entry.l, r.left); entry.t = Math.min(entry.t, r.top); entry.r = Math.max(entry.r, r.right); entry.btm = Math.max(entry.btm, r.bottom);
          if (!sc.txMoving && (r.left < -1 || r.top < -1 || r.right > W + 1 || r.bottom > H + 1)) issues.push({ type: 'outside', scene: sc.id, text: snippet, detail: 'text box ' + [r.left, r.top, r.right, r.bottom].map(function (v) { return Math.round(v); }).join(',') + ' leaves the 1920x1080 frame' });
        }
      }
    });
    var arr = Array.from(blocks.values()).filter(function (b) { return b.op >= 0.3 && b.r > b.l; });
    for (var i = 0; i < arr.length; i++) for (var j = i + 1; j < arr.length; j++) {
      var a = arr[i], c = arr[j];
      if (a.scene !== c.scene) continue;
      if (a.el.contains(c.el) || c.el.contains(a.el)) continue;
      var ix = Math.min(a.r, c.r) - Math.max(a.l, c.l), iy = Math.min(a.btm, c.btm) - Math.max(a.t, c.t);
      if (ix > 2 && iy > 2) {
        var area = ix * iy, small = Math.min((a.r - a.l) * (a.btm - a.t), (c.r - c.l) * (c.btm - c.t));
        if (area > 0.02 * small) issues.push({ type: 'overlap', scene: a.scene, text: a.text + ' / ' + c.text, detail: 'text blocks overlap ' + Math.round(ix) + 'x' + Math.round(iy) + 'px' });
      }
    }
    var seen = {};
    return issues.filter(function (x) { var k = x.type + x.scene + x.text + x.detail; if (seen[k]) return false; seen[k] = 1; return true; });
  };

  // ---------- preview UI (humans only; wall-clock playback, never used for rendering) ----------
  function setupPreview(stage, grid) {
    document.body.classList.add('preview');
    function fit() { var s = Math.min(innerWidth / W, (innerHeight - 56) / H); stage.style.transform = 'scale(' + s + ')'; }
    addEventListener('resize', fit); fit();
    var bar = document.createElement('div'); bar.id = 'pv';
    bar.innerHTML = '<button id="pvplay">play</button><input id="pvr" type="range" min="0" step="0.001"><span id="pvt"></span>';
    document.body.appendChild(bar);
    var r = bar.querySelector('#pvr'), tt = bar.querySelector('#pvt'), btn = bar.querySelector('#pvplay');
    r.max = E.total;
    var audio = grid.url ? new Audio(grid.url) : null, playing = false, t0 = 0, w0 = 0;
    function show(t) { r.value = t; tt.textContent = t.toFixed(2) + ' / ' + E.total.toFixed(2) + ' s'; return window.seek(t); }
    r.oninput = function () { if (playing) toggle(); show(+r.value); };
    function toggle() {
      playing = !playing; btn.textContent = playing ? 'pause' : 'play';
      if (playing) { t0 = +r.value; w0 = performance.now(); if (audio) { audio.currentTime = t0; audio.play(); } loop(); }
      else if (audio) audio.pause();
    }
    btn.onclick = toggle;
    function loop() {
      if (!playing) return;
      var t = audio ? audio.currentTime : t0 + (performance.now() - w0) / 1000;
      if (t >= E.total) { toggle(); t = E.total; }
      show(t).then(function () { requestAnimationFrame(loop); });
    }
    show(0);
  }

  E.ready = init().catch(function (e) { E.error(String(e && e.stack || e)); return { total: 0, errors: E.errors, warnings: E.warnings, scenes: [], fatal: true }; });
  window.__engineReady = E.ready;
})();
