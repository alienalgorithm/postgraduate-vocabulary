/* ctx.util : deterministic helpers for scene authors.
 * Every helper is a pure function of (seed, timeline time). Nothing reads the wall clock, Math.random,
 * requestAnimationFrame, setTimeout or CSS animations. All times passed to helpers and onFrame callbacks
 * are SCENE-LOCAL seconds (0 = scene start). A fresh util object is made per scene (window.__makeUtil).
 * Layout units are 1920x1080 CSS px; canvases and WebGL are allocated at devicePixelRatio (2 for 4K).
 */
(function () {
  'use strict';
  var W = 1920, H = 1080;
  var SVGNS = 'http://www.w3.org/2000/svg';

  // =====================================================================================
  // static (shared) helpers
  // =====================================================================================
  function hashSeed(seed) {
    var s = String(seed == null ? 0 : seed), h = 2166136261 >>> 0;
    for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619) >>> 0; }
    return h >>> 0;
  }
  function mulberry32(a) {
    a = a >>> 0;
    return function () {
      a = (a + 0x6D2B79F5) >>> 0;
      var t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  /** rand(seed) -> r(): float in [0,1). r.range(a,b), r.int(a,b) inclusive, r.pick(arr), r.sign(), r.shuffle(arr), r.gauss() */
  function rand(seed) {
    var f = mulberry32(hashSeed(seed));
    var r = function () { return f(); };
    r.range = function (a, b) { return a + (b - a) * f(); };
    r.int = function (a, b) { return Math.floor(a + (b - a + 1) * f()); };
    r.pick = function (arr) { return arr[Math.floor(f() * arr.length)]; };
    r.sign = function () { return f() < 0.5 ? -1 : 1; };
    r.shuffle = function (arr) { var a = arr.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(f() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; } return a; };
    r.gauss = function () { var u = 1 - f(), v = f(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(6.283185307 * v); };
    return r;
  }
  /** hash(i, seed) -> float in [0,1), stateless */
  function hash(i, seed) { return mulberry32(hashSeed((seed == null ? 0 : seed) + ':' + i))(); }

  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
  function lerp(a, b, t) { return a + (b - a) * t; }
  function mod(a, n) { return ((a % n) + n) % n; }
  function smooth(t) { t = clamp(t, 0, 1); return t * t * (3 - 2 * t); }
  /** map v from [a,b] to [c,d], clamped */
  function remap(v, a, b, c, d) { return c + (d - c) * clamp((v - a) / (b - a), 0, 1); }

  // ---------- simplex noise (seeded, 3D; returns -1..1) ----------
  function makeNoise(seed) {
    var r = mulberry32(hashSeed('noise:' + (seed == null ? 0 : seed)));
    var p = new Uint8Array(256), i;
    for (i = 0; i < 256; i++) p[i] = i;
    for (i = 255; i > 0; i--) { var j = Math.floor(r() * (i + 1)); var tmp = p[i]; p[i] = p[j]; p[j] = tmp; }
    var perm = new Uint8Array(512), pm12 = new Uint8Array(512);
    for (i = 0; i < 512; i++) { perm[i] = p[i & 255]; pm12[i] = perm[i] % 12; }
    var g = [1, 1, 0, -1, 1, 0, 1, -1, 0, -1, -1, 0, 1, 0, 1, -1, 0, 1, 1, 0, -1, -1, 0, -1, 0, 1, 1, 0, -1, 1, 0, 1, -1, 0, -1, -1];
    var F3 = 1 / 3, G3 = 1 / 6;
    function noise3(xin, yin, zin) {
      var n0 = 0, n1 = 0, n2 = 0, n3 = 0;
      var s = (xin + yin + zin) * F3;
      var i = Math.floor(xin + s), j = Math.floor(yin + s), k = Math.floor(zin + s);
      var t = (i + j + k) * G3;
      var x0 = xin - (i - t), y0 = yin - (j - t), z0 = zin - (k - t);
      var i1, j1, k1, i2, j2, k2;
      if (x0 >= y0) {
        if (y0 >= z0) { i1 = 1; j1 = 0; k1 = 0; i2 = 1; j2 = 1; k2 = 0; }
        else if (x0 >= z0) { i1 = 1; j1 = 0; k1 = 0; i2 = 1; j2 = 0; k2 = 1; }
        else { i1 = 0; j1 = 0; k1 = 1; i2 = 1; j2 = 0; k2 = 1; }
      } else {
        if (y0 < z0) { i1 = 0; j1 = 0; k1 = 1; i2 = 0; j2 = 1; k2 = 1; }
        else if (x0 < z0) { i1 = 0; j1 = 1; k1 = 0; i2 = 0; j2 = 1; k2 = 1; }
        else { i1 = 0; j1 = 1; k1 = 0; i2 = 1; j2 = 1; k2 = 0; }
      }
      var x1 = x0 - i1 + G3, y1 = y0 - j1 + G3, z1 = z0 - k1 + G3;
      var x2 = x0 - i2 + 2 * G3, y2 = y0 - j2 + 2 * G3, z2 = z0 - k2 + 2 * G3;
      var x3 = x0 - 1 + 3 * G3, y3 = y0 - 1 + 3 * G3, z3 = z0 - 1 + 3 * G3;
      var ii = i & 255, jj = j & 255, kk = k & 255;
      var t0 = 0.6 - x0 * x0 - y0 * y0 - z0 * z0;
      if (t0 > 0) { var a = pm12[ii + perm[jj + perm[kk]]] * 3; t0 *= t0; n0 = t0 * t0 * (g[a] * x0 + g[a + 1] * y0 + g[a + 2] * z0); }
      var t1 = 0.6 - x1 * x1 - y1 * y1 - z1 * z1;
      if (t1 > 0) { var b = pm12[ii + i1 + perm[jj + j1 + perm[kk + k1]]] * 3; t1 *= t1; n1 = t1 * t1 * (g[b] * x1 + g[b + 1] * y1 + g[b + 2] * z1); }
      var t2 = 0.6 - x2 * x2 - y2 * y2 - z2 * z2;
      if (t2 > 0) { var c = pm12[ii + i2 + perm[jj + j2 + perm[kk + k2]]] * 3; t2 *= t2; n2 = t2 * t2 * (g[c] * x2 + g[c + 1] * y2 + g[c + 2] * z2); }
      var t3 = 0.6 - x3 * x3 - y3 * y3 - z3 * z3;
      if (t3 > 0) { var d = pm12[ii + 1 + perm[jj + 1 + perm[kk + 1]]] * 3; t3 *= t3; n3 = t3 * t3 * (g[d] * x3 + g[d + 1] * y3 + g[d + 2] * z3); }
      return 32 * (n0 + n1 + n2 + n3);
    }
    function noise2(x, y) { return noise3(x, y, 0.5); }
    /** fbm(x,y,z,octaves=4): fractal sum, -1..1 */
    function fbm(x, y, z, oct) { oct = oct || 4; var s = 0, a = 0.5, f = 1, n = 0; for (var o = 0; o < oct; o++) { s += a * noise3(x * f, y * f, (z || 0) * f); n += a; a *= 0.5; f *= 2; } return s / n; }
    return { noise3: noise3, noise2: noise2, fbm: fbm };
  }
  var NOISE = makeNoise('film');

  // ---------- colours ----------
  var cctx = null;
  function cssVar(v) {
    if (typeof v === 'string' && v.indexOf('var(') === 0) {
      var name = v.slice(4, -1).split(',')[0].trim();
      return getComputedStyle(document.documentElement).getPropertyValue(name).trim() || '#ffffff';
    }
    return v;
  }
  /** rgba(color) -> [r,g,b,a] (0-255, a 0-1). Accepts #hex, rgb(), named colours and var(--x). */
  function rgba(color) {
    if (!cctx) cctx = document.createElement('canvas').getContext('2d');
    cctx.fillStyle = '#000'; cctx.fillStyle = cssVar(color);
    var s = cctx.fillStyle;
    if (s[0] === '#') { var n = parseInt(s.slice(1), 16); return [n >> 16 & 255, n >> 8 & 255, n & 255, 1]; }
    var m = s.match(/rgba?\(([^)]+)\)/); if (m) { var p = m[1].split(',').map(parseFloat); return [p[0], p[1], p[2], p[3] == null ? 1 : p[3]]; }
    return [255, 255, 255, 1];
  }
  function withAlpha(color, a) { var c = rgba(color); return 'rgba(' + c[0] + ',' + c[1] + ',' + c[2] + ',' + a + ')'; }
  /** mixColor(a, b, t) -> 'rgb(...)' (sRGB lerp) */
  function mixColor(a, b, t) { var x = rgba(a), y = rgba(b); return 'rgba(' + Math.round(lerp(x[0], y[0], t)) + ',' + Math.round(lerp(x[1], y[1], t)) + ',' + Math.round(lerp(x[2], y[2], t)) + ',' + (+lerp(x[3], y[3], t).toFixed(4)) + ')'; }

  // ---------- DOM ----------
  /** el(tag, {cls, text, html, style, attrs, parent}) */
  function el(tag, o) {
    o = o || {};
    var e = document.createElement(tag || 'div');
    if (o.cls) e.className = o.cls;
    if (o.text != null) e.textContent = o.text;
    if (o.html != null) e.innerHTML = o.html;
    if (o.style) for (var k in o.style) { if (k.indexOf('--') === 0) e.style.setProperty(k, o.style[k]); else e.style[k] = o.style[k]; }
    if (o.attrs) for (var a in o.attrs) e.setAttribute(a, o.attrs[a]);
    if (o.parent) o.parent.appendChild(e);
    return e;
  }
  function svgEl(tag, attrs, parent) {
    var e = document.createElementNS(SVGNS, tag);
    if (attrs) for (var k in attrs) if (attrs[k] != null) e.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(e);
    return e;
  }
  /** curve(points [[x,y],...] | [{x,y}], {tension:0.5, closed:false}) -> smooth SVG path d (Catmull-Rom). */
  function curve(pts, o) {
    o = o || {};
    var p = pts.map(function (q) { return Array.isArray(q) ? q : [q.x, q.y]; });
    var k = (o.tension == null ? 0.5 : o.tension), n = p.length;
    if (n < 2) return '';
    var d = 'M' + p[0][0] + ',' + p[0][1];
    for (var i = 0; i < (o.closed ? n : n - 1); i++) {
      var p0 = p[o.closed ? mod(i - 1, n) : Math.max(i - 1, 0)], p1 = p[i], p2 = p[(i + 1) % n], p3 = p[o.closed ? (i + 2) % n : Math.min(i + 2, n - 1)];
      var c1x = p1[0] + (p2[0] - p0[0]) * k / 3, c1y = p1[1] + (p2[1] - p0[1]) * k / 3;
      var c2x = p2[0] - (p3[0] - p1[0]) * k / 3, c2y = p2[1] - (p3[1] - p1[1]) * k / 3;
      d += ' C' + c1x.toFixed(2) + ',' + c1y.toFixed(2) + ' ' + c2x.toFixed(2) + ',' + c2y.toFixed(2) + ' ' + p2[0] + ',' + p2[1];
    }
    return d + (o.closed ? 'Z' : '');
  }

  // ---------- CSS masks (used by util.maskReveal and engine transitions) ----------
  /** visible part grows along `angle` (deg, CSS convention: 90 = left->right) as p goes 0 -> 1 */
  function maskLinear(w, h, angle, p, soft, invert) {
    var a = angle * Math.PI / 180, L = Math.abs(w * Math.sin(a)) + Math.abs(h * Math.cos(a));
    var pos = p * (L + soft);
    var c1 = invert ? 'transparent' : '#000', c2 = invert ? '#000' : 'transparent';
    return 'linear-gradient(' + angle + 'deg, ' + c1 + ' ' + (pos - soft).toFixed(2) + 'px, ' + c2 + ' ' + pos.toFixed(2) + 'px)';
  }
  /** visible disc grows from (x,y) as p goes 0 -> 1 (invert: a hole grows instead) */
  function maskRadial(w, h, x, y, p, soft, invert) {
    var R = Math.max(Math.hypot(x, y), Math.hypot(w - x, y), Math.hypot(x, h - y), Math.hypot(w - x, h - y));
    var r = p * (R + soft);
    var c1 = invert ? 'transparent' : '#000', c2 = invert ? '#000' : 'transparent';
    return 'radial-gradient(circle at ' + x + 'px ' + y + 'px, ' + c1 + ' ' + Math.max(0, r - soft).toFixed(2) + 'px, ' + c2 + ' ' + r.toFixed(2) + 'px)';
  }
  function setMask(e, m) { e.style.webkitMaskImage = m; e.style.maskImage = m; }

  // ---------- SVG filters (used by util.liquid/ink/displace/chroma and engine transitions) ----------
  function fx(tag, attrs, parent) { return svgEl(tag, attrs, parent); }
  /** ink filter: content appears through thresholded noise (optionally biased to grow from a point) with a coloured rim.
   * set(v): v 0 = invisible .. 1 = fully visible. */
  function inkFilter(defs, id, o) {
    o = o || {};
    var w = o.width || W, h = o.height || H;
    var f = fx('filter', { id: id, x: 0, y: 0, width: '100%', height: '100%', filterUnits: 'objectBoundingBox', 'color-interpolation-filters': 'sRGB' }, defs);
    fx('feTurbulence', { type: 'fractalNoise', baseFrequency: o.freq || 0.009, numOctaves: o.octaves || 4, seed: o.seed == null ? 3 : o.seed, result: 'noise' }, f);
    var src = 'noise';
    if (o.from !== false) {
      var fxp = o.from && o.from.x != null ? o.from.x : w / 2, fyp = o.from && o.from.y != null ? o.from.y : h / 2;
      var R = Math.max(Math.hypot(fxp, fyp), Math.hypot(w - fxp, fyp), Math.hypot(fxp, h - fyp), Math.hypot(w - fxp, h - fyp));
      var svgTxt = '<svg xmlns="http://www.w3.org/2000/svg" width="' + w + '" height="' + h + '"><defs><radialGradient id="g" gradientUnits="userSpaceOnUse" cx="' + fxp + '" cy="' + fyp + '" r="' + R + '"><stop offset="0" stop-color="#000"/><stop offset="1" stop-color="#fff"/></radialGradient></defs><rect width="' + w + '" height="' + h + '" fill="url(#g)"/></svg>';
      fx('feImage', { href: 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svgTxt), x: 0, y: 0, width: w, height: h, preserveAspectRatio: 'none', result: 'grad' }, f);
      var a = o.noise == null ? 0.45 : o.noise;
      fx('feComposite', { in: 'noise', in2: 'grad', operator: 'arithmetic', k1: 0, k2: a * 1.6, k3: 1 - a, k4: -a * 0.3, result: 'v' }, f);
      src = 'v';
    }
    var K = o.sharpness || 14;
    var m1 = fx('feColorMatrix', { in: src, type: 'matrix', values: '', result: 'mask' }, f);
    fx('feComposite', { in: 'SourceGraphic', in2: 'mask', operator: 'in', result: 'shown' }, f);
    var m2 = null;
    if (o.rim) {
      m2 = fx('feColorMatrix', { in: src, type: 'matrix', values: '', result: 'mask2' }, f);
      fx('feComposite', { in: 'mask2', in2: 'mask', operator: 'out', result: 'ring' }, f);
      fx('feFlood', { 'flood-color': cssVar(o.rim), 'flood-opacity': o.rimOpacity == null ? 1 : o.rimOpacity, result: 'rc' }, f);
      fx('feComposite', { in: 'rc', in2: 'ring', operator: 'in', result: 'ringc' }, f);
      fx('feComposite', { in: 'ringc', in2: 'SourceAlpha', operator: 'in', result: 'ringc2' }, f);
      var mg = fx('feMerge', {}, f); fx('feMergeNode', { in: 'shown' }, mg); fx('feMergeNode', { in: 'ringc2' }, mg);
    }
    var rw = o.rimWidth == null ? 0.05 : o.rimWidth, last = null;
    function row(th) { return '0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  ' + (-K) + ' 0 0 0 ' + (K * th).toFixed(4); }
    return {
      id: id, url: 'url(#' + id + ')', el: f,
      set: function (v) {
        var th = lerp(-0.12, 1.2, clamp(v, 0, 1)), key = th.toFixed(4);
        if (key === last) return; last = key;
        m1.setAttribute('values', row(th));
        if (m2) m2.setAttribute('values', row(th + rw));
      }
    };
  }
  /** liquid filter: displacement by drifting fractal noise. set(scale, t) */
  function liquidFilter(defs, id, o) {
    o = o || {};
    var m = o.margin == null ? 0.12 : o.margin;
    var f = fx('filter', { id: id, x: (-m * 100) + '%', y: (-m * 100) + '%', width: ((1 + 2 * m) * 100) + '%', height: ((1 + 2 * m) * 100) + '%', filterUnits: 'objectBoundingBox', 'color-interpolation-filters': 'sRGB' }, defs);
    fx('feTurbulence', { type: o.type || 'fractalNoise', baseFrequency: o.freq || 0.006, numOctaves: o.octaves || 2, seed: o.seed == null ? 7 : o.seed, result: 'n' }, f);
    var off = fx('feOffset', { in: 'n', dx: 0, dy: 0, result: 'no' }, f);
    var dm = fx('feDisplacementMap', { in: 'SourceGraphic', in2: 'no', scale: 0, xChannelSelector: 'R', yChannelSelector: 'G' }, f);
    var drift = o.drift == null ? 60 : o.drift, speed = o.speed == null ? 0.35 : o.speed, last = null;
    return {
      id: id, url: 'url(#' + id + ')', el: f,
      set: function (scale, t) {
        t = t || 0;
        var dx = (Math.sin(t * speed * 2.1) * drift).toFixed(2), dy = (Math.cos(t * speed * 1.7) * drift).toFixed(2), s = (+scale).toFixed(2);
        var key = s + '|' + dx + '|' + dy; if (key === last) return; last = key;
        dm.setAttribute('scale', s); off.setAttribute('dx', dx); off.setAttribute('dy', dy);
      }
    };
  }

  window.__utilStatic = {
    rand: rand, hash: hash, hashSeed: hashSeed, mulberry32: mulberry32, makeNoise: makeNoise,
    clamp: clamp, lerp: lerp, smooth: smooth, maskLinear: maskLinear, maskRadial: maskRadial, setMask: setMask,
    inkFilter: inkFilter, liquidFilter: liquidFilter, svgEl: svgEl, cssVar: cssVar
  };

  // =====================================================================================
  // per-scene util
  // =====================================================================================
  var ROLE_CLASS = { headline: 't-headline', mega: 't-mega', title: 't-title', line: 't-line', body: 't-body', small: 't-small', en: 't-en', source: 't-source', label: 't-label', serif: 't-serif' };

  function makeUtil(scene, engine) {
    var root = scene.root;
    var hooks = scene.hooks;
    var music = scene.musicLocal;
    var sid = scene.id;
    var uid = 0;
    function nextId(kind) { return 'u-' + sid.replace(/[^\w-]/g, '_') + '-' + kind + '-' + (uid++); }
    function dprNow() { return window.devicePixelRatio || 1; }

    /** onFrame(fn): fn(t, tc) every rendered frame while the scene is visible. t = scene-local time (can be < 0 or
     * > duration during transitions), tc = t clamped to [0, duration]. Draw ONLY from t (no accumulated state). */
    function onFrame(fn) { hooks.push(fn); return fn; }
    // helpers draw in render hooks, which run after the timeline AND after every onFrame callback of the frame,
    // so an onFrame callback may set a helper's state (e.g. liq.state.amount = f(t)) and it is used the same frame.
    function onRender(fn) { scene.renderHooks.push(fn); return fn; }

    /** asset(path) -> URL usable in src/href. Accepts 'assets/x.jpg', 'A/assets/x.jpg', '/abs/.../anim/assets/x.jpg'. */
    function asset(p) { return engine.resolveAsset(p); }

    // ---------- text ----------
    /** text(parent, str, role, {x, y, anchor, align, cls, html, style, maxWidth}) -> absolutely positioned text.
     * role: headline|mega|title|line|body|small|en|source|label|serif or any class. anchor: center (default), left,
     * right, top, bottom, top-left, top-right, bottom-left, bottom-right. Uses GSAP xPercent/yPercent, so later
     * x/y/scale tweens compose with the anchoring. */
    function text(parent, str, role, o) {
      o = o || {};
      var cls = (ROLE_CLASS[role] || role || '') + ' abs' + (o.cls ? ' ' + o.cls : '');
      var e = el('div', { cls: cls, parent: parent || root, style: o.style });
      if (o.html != null) e.innerHTML = o.html; else e.textContent = str;
      var anchor = o.anchor || 'center';
      var x = o.x == null ? W / 2 : o.x, y = o.y == null ? H / 2 : o.y;
      e.style.left = x + 'px'; e.style.top = y + 'px';
      if (o.maxWidth) { e.style.width = o.maxWidth + 'px'; e.style.whiteSpace = 'normal'; }
      var xp = anchor.indexOf('left') >= 0 ? 0 : anchor.indexOf('right') >= 0 ? -100 : -50;
      var yp = anchor.indexOf('top') >= 0 ? 0 : anchor.indexOf('bottom') >= 0 ? -100 : -50;
      e.style.textAlign = o.align || (xp === 0 ? 'left' : xp === -100 ? 'right' : 'center');
      window.gsap.set(e, { xPercent: xp, yPercent: yp });
      return e;
    }
    /** fitText(el, maxWidth, {min:40}) shrinks font-size until el fits (never below min). */
    function fitText(e, maxWidth, o) {
      o = o || {};
      var min = o.min == null ? 40 : o.min;
      var fs = parseFloat(getComputedStyle(e).fontSize), guard = 0;
      while (e.scrollWidth > maxWidth && fs > min && guard++ < 300) { fs = Math.max(min, fs - 2); e.style.fontSize = fs + 'px'; }
      return fs;
    }

    // ---------- splitChars (CJK aware) ----------
    var CLOSERS = '，。、；：？！）」』”’》〉】〕…,.;:?!)]}%»';
    var OPENERS = '（「『“‘《〈【〔([{«';
    function isLatinish(ch) { return /[A-Za-z0-9À-ɏ'’\-]/.test(ch); }
    function graphemes(s) {
      if (window.Intl && Intl.Segmenter) { var out = []; var it = new Intl.Segmenter('zh', { granularity: 'grapheme' }).segment(s); for (var seg of it) out.push(seg.segment); return out; }
      return Array.from(s);
    }
    /** splitChars(el) -> array of <span class="ch"> (inline-block, animatable). Keeps nested elements and <br>.
     * Latin words and CJK char + trailing punctuation stay in nowrap groups (<span class="w">), so lines never break
     * inside a word or start with "，". Also sets el.chars. For SplitText use util.split(). */
    function splitChars(target) {
      var chars = [];
      function splitTextNode(node) {
        var gs = graphemes(node.nodeValue);
        var frag = document.createDocumentFragment();
        var group = null, groupKind = null, pendingOpen = [];
        function flush() { if (group) { frag.appendChild(group); group = null; groupKind = null; } }
        function mk(ch) { var s = document.createElement('span'); s.className = 'ch'; s.textContent = ch; chars.push(s); return s; }
        for (var i = 0; i < gs.length; i++) {
          var ch = gs[i];
          if (ch === '\n' || ch === '\r\n') { flush(); while (pendingOpen.length) frag.appendChild(pendingOpen.shift()); frag.appendChild(document.createElement('br')); continue; }
          if (/^\s+$/.test(ch)) { flush(); var sp = mk(ch); sp.className = 'ch sp'; sp.textContent = ' '; frag.appendChild(sp); frag.appendChild(document.createTextNode('​')); continue; }
          if (OPENERS.indexOf(ch) >= 0) { flush(); pendingOpen.push(mk(ch)); continue; }
          if (CLOSERS.indexOf(ch) >= 0 && group) { group.appendChild(mk(ch)); groupKind = 'closed'; continue; }
          var kind = isLatinish(ch) ? 'latin' : 'cjk';
          if (!(group && kind === 'latin' && groupKind === 'latin')) { flush(); group = document.createElement('span'); group.className = 'w'; groupKind = kind; }
          while (pendingOpen.length) group.appendChild(pendingOpen.shift());
          group.appendChild(mk(ch));
        }
        flush();
        if (pendingOpen.length) { var g = document.createElement('span'); g.className = 'w'; pendingOpen.forEach(function (p) { g.appendChild(p); }); frag.appendChild(g); }
        node.parentNode.replaceChild(frag, node);
      }
      var gradBg = /grad-/.test(target.className) ? getComputedStyle(target).backgroundImage : null;
      (function walk(n) {
        Array.prototype.slice.call(n.childNodes).forEach(function (k) {
          if (k.nodeType === 3) { if (k.nodeValue.length) splitTextNode(k); }
          else if (k.nodeType === 1 && k.tagName !== 'BR') walk(k);
        });
      })(target);
      target.chars = chars;
      target.classList.add('split');
      gradToChars(target, chars, gradBg);
      return chars;
    }
    // a gradient text fill (.grad-*) does not survive per-char transforms; give every char its own slice of it
    function gradToChars(target, chars, gradBg) {
      if (!gradBg || gradBg === 'none') return;
      target.classList.add('split');
      var pr = target.getBoundingClientRect(), w = target.offsetWidth, h = target.offsetHeight, k = pr.width ? w / pr.width : 1;
      chars.forEach(function (c) {
        var r = c.getBoundingClientRect();
        c.style.backgroundImage = gradBg; c.style.backgroundRepeat = 'no-repeat';
        c.style.backgroundSize = w + 'px ' + h + 'px';
        c.style.backgroundPosition = (-(r.left - pr.left) * k) + 'px ' + (-(r.top - pr.top) * k) + 'px';
        c.style.webkitBackgroundClip = 'text'; c.style.backgroundClip = 'text'; c.style.webkitTextFillColor = 'transparent';
      });
    }
    /** split(el, vars) -> GSAP SplitText instance (chars/words/lines arrays). Defaults: type 'chars,words', no autoSplit
     * (fonts are already loaded), aria 'none'. Pass {mask:'chars'|'words'|'lines'} for masked reveals. */
    function split(target, vars) {
      if (!window.SplitText) { engine.error('SplitText is not loaded', sid); return { chars: [], words: [], lines: [] }; }
      var v = Object.assign({ type: 'chars,words', aria: 'none', autoSplit: false }, vars || {});
      var gradBg = /grad-/.test(target.className) ? getComputedStyle(target).backgroundImage : null;
      var sp = window.SplitText.create(target, v);
      if (gradBg && sp.chars && sp.chars.length) gradToChars(target, sp.chars, gradBg);
      target.chars = sp.chars && sp.chars.length ? sp.chars : target.chars;
      return sp;
    }
    /** typewriter(el, {duration, ease:'none', cursor:false}) -> tween revealing chars one by one (uses splitChars). */
    function typewriter(target, o) {
      o = o || {};
      var chars = target.chars || splitChars(target);
      window.gsap.set(chars, { opacity: 0 });
      var cur = null;
      if (o.cursor) { cur = el('span', { cls: 'tw-cursor', text: '|', parent: target, attrs: { 'data-qa': 'off' } }); }
      var tw = window.gsap.to(chars, { opacity: 1, duration: 0.001, stagger: { each: (o.duration == null ? 1.2 : o.duration) / Math.max(1, chars.length), ease: o.ease || 'none' } });
      if (cur) {
        onRender(function (t) { cur.style.opacity = (Math.floor(t * 2.2) % 2) ? '0' : '1'; });
      }
      return tw;
    }

    // ---------- images and frame sequences ----------
    function place(e, o) {
      if (o.x != null || o.y != null) {
        var anchor = o.anchor || 'center';
        e.style.left = (o.x == null ? W / 2 : o.x) + 'px'; e.style.top = (o.y == null ? H / 2 : o.y) + 'px';
        var xp = anchor.indexOf('left') >= 0 ? 0 : anchor.indexOf('right') >= 0 ? -100 : -50;
        var yp = anchor.indexOf('top') >= 0 ? 0 : anchor.indexOf('bottom') >= 0 ? -100 : -50;
        window.gsap.set(e, { xPercent: xp, yPercent: yp });
      }
      if (o.width != null) e.style.width = o.width + 'px';
      if (o.height != null) e.style.height = o.height + 'px';
      if (o.fit) e.style.objectFit = o.fit;
      if (o.radius != null) e.style.borderRadius = o.radius + 'px';
    }
    function checkRes(img, src, o) {
      var cssW = o.width || img.getBoundingClientRect().width || img.naturalWidth;
      var need = Math.ceil(cssW * 2 * (o.maxScale || 1));
      if (img.naturalWidth && img.naturalWidth + 2 < need && !o.allowSoft) engine.warn('image ' + src + ' is ' + img.naturalWidth + ' px wide but shown ' + Math.round(cssW * (o.maxScale || 1)) + ' css px wide; 4K needs >= ' + need + ' px (pass {allowSoft:true} if intended)', sid);
    }
    /** image(src, {parent, x, y, anchor, width, height, fit:'cover'|'contain', radius, cls, style, maxScale, allowSoft})
     * -> <img class="abs">. The engine waits until it is decoded before any frame. Warns if it will look soft at 4K
     * (natural width < 2 x displayed width x maxScale). */
    function image(src, o) {
      o = o || {};
      var url = asset(src);
      var img = el('img', { cls: 'abs img' + (o.cls ? ' ' + o.cls : ''), style: o.style, parent: o.parent || root });
      img.decoding = 'sync'; img.draggable = false; img.alt = '';
      place(img, o);
      img.src = url;
      engine.trackAsset(img.decode().then(function () { checkRes(img, src, o); }, function (e) { engine.error('image failed to load: ' + src + ' (' + e + ')', sid); }));
      return img;
    }
    /** preload(src) -> URL. Decodes an image the page uses outside util.image (CSS background-image, SVG <image>,
     * three.js textures); seek() waits for it, so the first frame never shows a missing picture. */
    function preload(src) {
      var url = asset(src), im = new Image();
      im.decoding = 'sync'; im.src = url;
      engine.trackAsset(im.decode().catch(function (e) { engine.error('preload failed: ' + src + ' (' + e + ')', sid); }));
      return url;
    }
    /** sequence(dir, {fps, count, start:0, loop:false, hold:true, pattern:'f_%04d.jpg', ...image opts})
     * Frame sequence made by `node engine/asset.js clip ...` (dir has manifest.json, so fps/count are optional).
     * Shows frame floor((t - start) * fps) at scene-local time t. Returns {img, state:{offset}}. */
    function sequence(dir, o) {
      o = o || {};
      var base = asset(dir).replace(/\/$/, '');
      var man = {};
      try { var x = new XMLHttpRequest(); x.open('GET', base + '/manifest.json', false); x.send(); if (x.status === 200) man = JSON.parse(x.responseText); } catch (e) { }
      var fps = o.fps || man.fps || 30, count = o.count || man.count, pattern = o.pattern || man.pattern || 'f_%04d.jpg';
      if (!count) { engine.error('sequence(' + dir + '): no count and no manifest.json', sid); count = 1; }
      var img = el('img', { cls: 'abs img' + (o.cls ? ' ' + o.cls : ''), style: o.style, parent: o.parent || root });
      img.decoding = 'sync'; img.alt = '';
      place(img, o);
      function name(i) { return base + '/' + pattern.replace(/%0(\d)d/, function (_, n) { var s = String(i + 1); while (s.length < +n) s = '0' + s; return s; }); }
      var state = { offset: 0 }, cur = -1, start = o.start || 0;
      function show(i) {
        if (i === cur) return; cur = i;
        img.src = name(i);
        engine.trackAsset(img.decode().catch(function (e) { engine.error('sequence frame failed: ' + name(i) + ' (' + e + ')', sid); }));
      }
      show(0);
      engine.trackAsset(img.decode().then(function () { checkRes(img, dir, o); }, function () { }));
      onRender(function (t) {
        var i = Math.floor((t - start + state.offset) * fps + 1e-6);
        if (o.loop) i = mod(i, count); else i = clamp(i, 0, count - 1);
        show(i);
      });
      return { img: img, state: state, count: count, fps: fps };
    }

    // ---------- counter ----------
    function fmtNumber(v, o) {
      var s = v.toFixed(o.decimals || 0);
      if (o.separator) { var p = s.split('.'); p[0] = p[0].replace(/\B(?=(\d{3})+(?!\d))/g, o.separator); s = p.join('.'); }
      return (o.prefix || '') + s + (o.suffix || '');
    }
    /** counter(el, {from:0, to, duration:1.2, ease:'power2.out', decimals:0, prefix:'', suffix:'', separator:''})
     * -> tween. tl.add(ctx.util.counter(el, {...}), at). Uses tabular digits so the width does not jitter. */
    function counter(e, o) {
      o = o || {};
      var proxy = { v: o.from == null ? 0 : o.from }, last = null;
      function write() { var s = fmtNumber(proxy.v, o); if (s !== last) { e.textContent = s; last = s; } }
      write();
      e.classList.add('tnum');
      onRender(write);
      return window.gsap.to(proxy, { v: o.to, duration: o.duration == null ? 1.2 : o.duration, ease: o.ease || 'power2.out' });
    }

    // ---------- SVG ----------
    /** svg(parent, attrs) -> full-frame <svg viewBox="0 0 1920 1080"> (user units = CSS px). */
    function svg(parent, attrs) { return svgEl('svg', Object.assign({ viewBox: '0 0 ' + W + ' ' + H, width: W, height: H, class: 'fullsvg' }, attrs || {}), parent || root); }
    /** path(svg, d, attrs) -> <path> with stroke defaults (accent, 4px, round caps) */
    function path(parent, d, attrs) { return svgEl('path', Object.assign({ d: d, fill: 'none', stroke: 'var(--accent)', 'stroke-width': 4, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, attrs || {}), parent); }
    /** line(svg, x1, y1, x2, y2, attrs) -> <path> straight line (DrawSVG / drawPath ready) */
    function line(parent, x1, y1, x2, y2, attrs) { return path(parent, 'M' + x1 + ',' + y1 + ' L' + x2 + ',' + y2, attrs); }
    /** drawPath(pathEl, {duration:1.2, ease:'power2.inOut', from:0, to:1, head:element|null}) -> tween.
     * Draws a stroke with stroke-dashoffset; optional head rides the tip. (DrawSVGPlugin works too: tl.from(p,{drawSVG:0}).) */
    function drawPath(p, o) {
      o = o || {};
      var L = p.getTotalLength();
      if (!(L > 0)) engine.warn('drawPath: path has zero length (is it attached to the DOM?)', sid);
      var proxy = { p: o.from || 0 };
      p.style.strokeDasharray = L + ' ' + (L + 2);
      var head = o.head || null, isSvgHead = head && head.namespaceURI === SVGNS && head.tagName !== 'svg';
      var last = -1;
      function write() {
        var v = clamp(proxy.p, 0, 1);
        if (v === last) return; last = v;
        p.style.strokeDashoffset = (L * (1 - v)).toFixed(3);
        p.style.visibility = v <= 1e-4 ? 'hidden' : '';
        if (head) {
          var pt = p.getPointAtLength(L * v);
          if (isSvgHead) { if (head.tagName === 'circle' || head.tagName === 'ellipse') { head.setAttribute('cx', pt.x); head.setAttribute('cy', pt.y); } else head.setAttribute('transform', 'translate(' + pt.x + ',' + pt.y + ')'); }
          else { head.style.left = pt.x + 'px'; head.style.top = pt.y + 'px'; }
          head.style.visibility = v <= 1e-4 ? 'hidden' : '';
        }
      }
      write();
      onRender(write);
      return window.gsap.to(proxy, { p: o.to == null ? 1 : o.to, duration: o.duration == null ? 1.2 : o.duration, ease: o.ease || 'power2.inOut' });
    }
    /** pointAt(pathEl, fraction) -> {x, y} */
    function pointAt(p, f) { var L = p.getTotalLength(); var q = p.getPointAtLength(L * clamp(f, 0, 1)); return { x: q.x, y: q.y }; }

    // ---------- glow sweep ----------
    /** glowSweep(el, {duration:1.1, ease:'power1.inOut', color:'#fff', band:0.16, angle:105, glow:'rgba(255,220,160,.55)', glowSize:18})
     * -> tween. A bright band sweeps across solid-coloured text (plain or split). tl.add(ctx.util.glowSweep(el), at). */
    function glowSweep(e, o) {
      o = o || {};
      var cs = getComputedStyle(e);
      var base = o.base || cs.color, hi = o.color || '#ffffff';
      var w = e.offsetWidth || e.getBoundingClientRect().width, h = e.offsetHeight || 1;
      var band = (o.band == null ? 0.16 : o.band) * w, angle = o.angle == null ? 105 : o.angle;
      var grad = 'linear-gradient(' + angle + 'deg, ' + base + ' 0px, ' + base + ' calc(var(--sw) - ' + band + 'px), ' + hi + ' var(--sw), ' + base + ' calc(var(--sw) + ' + band + 'px), ' + base + ' ' + (w * 3) + 'px)';
      var targets = e.chars && e.chars.length ? e.chars : [e];
      var er = e.getBoundingClientRect(), sx = er.width ? w / er.width : 1;
      targets.forEach(function (t) {
        var off = 0, offy = 0;
        if (t !== e) { var r = t.getBoundingClientRect(); off = (r.left - er.left) * sx; offy = (r.top - er.top) * sx; }
        t.style.backgroundImage = grad; t.style.backgroundRepeat = 'no-repeat';
        t.style.backgroundSize = (t === e ? '100% 100%' : (w + 'px ' + h + 'px'));
        t.style.backgroundPosition = (-off) + 'px ' + (-offy) + 'px';
        t.style.webkitBackgroundClip = 'text'; t.style.backgroundClip = 'text';
        t.style.webkitTextFillColor = 'transparent'; t.style.color = 'transparent'; t.style.textShadow = 'none';
      });
      if (o.glow !== false) e.style.filter = 'drop-shadow(0 0 ' + (o.glowSize || 18) + 'px ' + (o.glow || 'rgba(255,220,160,.55)') + ')';
      var proxy = { p: 0 }, from = -band * 2, to = w + band * 2, last = null;
      function write() { var v = (from + (to - from) * clamp(proxy.p, 0, 1)).toFixed(2); if (v !== last) { e.style.setProperty('--sw', v + 'px'); last = v; } }
      write();
      onRender(write);
      return window.gsap.to(proxy, { p: 1, duration: o.duration == null ? 1.1 : o.duration, ease: o.ease || 'power1.inOut' });
    }

    // ---------- canvas (generic generative layer) ----------
    /** canvas(parent, draw(g, t, info), {x, y, width, height, keep:false, cls}) -> info {canvas, ctx, width, height, dpr, state}
     * A 2D canvas allocated at devicePixelRatio; draw() is called every frame with the context already scaled, so
     * you draw in CSS px. Draw ONLY from t (pure function of time). state.opacity = 0 skips drawing. */
    function canvas(parent, draw, o) {
      o = o || {};
      var dpr = dprNow();
      var x = o.x || 0, y = o.y || 0, w = o.width || W, h = o.height || H;
      var cv = el('canvas', { cls: 'abs layer-canvas' + (o.cls ? ' ' + o.cls : ''), parent: parent || root });
      cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr);
      cv.style.left = x + 'px'; cv.style.top = y + 'px'; cv.style.width = w + 'px'; cv.style.height = h + 'px';
      var g = cv.getContext('2d');
      var info = { canvas: cv, ctx: g, width: w, height: h, dpr: dpr, state: Object.assign({ opacity: 1 }, o.state || {}) };
      var blank = false;
      info.draw = function (t) {
        if (info.state.opacity <= 0.001) {
          if (!blank) { g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, cv.width, cv.height); blank = true; }
          cv.style.opacity = '0'; return;
        }
        blank = false;
        cv.style.opacity = info.state.opacity >= 0.999 ? '' : info.state.opacity.toFixed(4);
        g.setTransform(1, 0, 0, 1, 0, 0);
        if (!o.keep) g.clearRect(0, 0, cv.width, cv.height);
        g.setTransform(dpr, 0, 0, dpr, 0, 0);
        g.globalAlpha = 1; g.globalCompositeOperation = 'source-over';
        draw(g, t, info);
      };
      onRender(function (t) { info.draw(t * (o.timeScale == null ? 1 : o.timeScale) + (o.timeOffset || 0)); });
      return info;
    }

    // ---------- particles ----------
    var spriteCache = {};
    function sprite(color, soft, dpr) {
      var key = color + '|' + soft + '|' + dpr;
      if (spriteCache[key]) return spriteCache[key];
      var R = Math.round(32 * dpr), c = document.createElement('canvas'); c.width = c.height = R * 2;
      var g = c.getContext('2d'), gr = g.createRadialGradient(R, R, 0, R, R, R);
      gr.addColorStop(0, color); gr.addColorStop(soft ? 0.18 : 0.42, color);
      gr.addColorStop(soft ? 0.4 : 0.55, withAlpha(color, soft ? 0.35 : 0.0));
      gr.addColorStop(1, withAlpha(color, 0));
      g.fillStyle = gr; g.fillRect(0, 0, R * 2, R * 2);
      spriteCache[key] = c; return c;
    }
    /** particles(parent, opts) -> field {canvas, state, points(t), draw(t)}
     * opts: count=160, seed=1, area={x,y,w,h}, colors=[accent, ink], size=[1.2,3.6] (radius px), speed=[8,30] px/s,
     *   angle=-90 (deg, -90 = up), spread=40 (deg), twinkle=0.5, glow=true, soft=false, layers=3 (parallax depth),
     *   blend='lighter', targets=null ([{x,y}] to assemble into, e.g. util.textPoints), wobble=12 px, timeScale=1,
     *   energy=0 (0..1: how much music energy boosts brightness and size)
     * state (tween it): opacity=1, morph=0 (0 free .. 1 at targets), scale=1, x=0, y=0, spread=1, brightness=1, speed=1 */
    function particles(parent, o) {
      o = o || {};
      var area = o.area || { x: 0, y: 0, w: W, h: H };
      var count = o.count == null ? 160 : o.count;
      var R = rand(o.seed == null ? 1 : o.seed);
      var colors = (o.colors || ['var(--accent)', 'var(--ink)']).map(cssVar);
      var size = o.size || [1.2, 3.6], speed = o.speed || [8, 30];
      var ang = (o.angle == null ? -90 : o.angle) * Math.PI / 180, spr = (o.spread == null ? 40 : o.spread) * Math.PI / 180;
      var layers = o.layers || 3, wob = o.wobble == null ? 12 : o.wobble, tw = o.twinkle == null ? 0.5 : o.twinkle;
      var targets = o.targets || null, eAmt = o.energy || 0;
      var parts = [];
      for (var i = 0; i < count; i++) {
        var layer = Math.floor(R() * layers), depth = (layer + 1) / layers;
        var a = ang + (R() - 0.5) * spr, sp = R.range(speed[0], speed[1]) * (0.45 + 0.55 * depth);
        parts.push({
          x: R() * area.w, y: R() * area.h, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp,
          r: R.range(size[0], size[1]) * (0.55 + 0.45 * depth), depth: depth,
          ph: R() * Math.PI * 2, fq: R.range(0.25, 0.9), wph: R() * Math.PI * 2, wfq: R.range(0.08, 0.3),
          a: R.range(0.35, 1) * (0.5 + 0.5 * depth), col: colors[Math.floor(R() * colors.length)],
          stg: R(), tgt: targets && targets.length ? targets[i % targets.length] : null, jx: (R() - 0.5), jy: (R() - 0.5)
        });
      }
      var margin = 40;
      var field = canvas(parent, function (g, t, info) {
        var st = info.state, dpr = info.dpr;
        var en = eAmt ? lerp(1, 0.55 + 0.9 * energy(t), eAmt) : 1;
        g.globalCompositeOperation = o.blend || 'lighter';
        for (var i = 0; i < parts.length; i++) {
          var p = parts[i], q = pos(p, t, st);
          var twk = 1 - tw * 0.5 * (1 + Math.sin(p.ph + t * p.fq * 6.283));
          var alpha = clamp(p.a * twk * st.brightness * en, 0, 1);
          if (alpha < 0.004) continue;
          var r = p.r * st.scale * (eAmt ? lerp(1, 0.8 + 0.5 * energy(t), eAmt) : 1);
          g.globalAlpha = alpha;
          if (o.glow === false) { g.fillStyle = p.col; g.beginPath(); g.arc(q[0], q[1], r, 0, 6.2832); g.fill(); }
          else { var s = r * (o.soft ? 5 : 3.2); g.drawImage(sprite(p.col, !!o.soft, dpr), q[0] - s, q[1] - s, s * 2, s * 2); }
        }
      }, { state: { morph: 0, scale: 1, x: 0, y: 0, spread: 1, brightness: 1, speed: 1, opacity: o.opacity == null ? 1 : o.opacity }, timeScale: o.timeScale, cls: o.cls });
      function pos(p, t, st) {
        var tt = t * st.speed;
        var fx = area.x + mod(p.x + p.vx * tt + Math.sin(p.wph + t * p.wfq * 6.283) * wob, area.w + margin * 2) - margin;
        var fy = area.y + mod(p.y + p.vy * tt + Math.cos(p.wph * 1.3 + t * p.wfq * 5.1) * wob, area.h + margin * 2) - margin;
        if (p.tgt && st.morph > 0) {
          var m = clamp(st.morph * 1.6 - p.stg * 0.6, 0, 1); m = m * m * (3 - 2 * m);
          var tx = p.tgt.x + (p.jx * 2 + Math.sin(t * 1.7 + p.ph) * 0.6) * st.spread, ty = p.tgt.y + (p.jy * 2 + Math.cos(t * 1.3 + p.ph) * 0.6) * st.spread;
          fx = fx + (tx - fx) * m; fy = fy + (ty - fy) * m;
        }
        return [fx + st.x * p.depth, fy + st.y * p.depth];
      }
      field.points = function (t) { return parts.map(function (p) { return pos(p, t, field.state); }); };
      return field;
    }

    /** flow(parent, opts) -> generative flow field: strands that drift through simplex noise, with trails.
     * opts: count=500, seed=1, colors=[cool, accent], area, scale=0.0022 (noise frequency), strength=140 (px swirl),
     *   drift=[18,40] px/s, angle=0 (deg drift direction), trail=0.5 (s), steps=8, width=[0.6,1.8], alpha=[0.15,0.6],
     *   blend='lighter', evolve=0.06 (noise change per s), energy=0
     * state: opacity, brightness, strength (multiplier), speed (multiplier), x, y */
    function flow(parent, o) {
      o = o || {};
      var area = o.area || { x: 0, y: 0, w: W, h: H };
      var R = rand('flow:' + (o.seed == null ? 1 : o.seed));
      var N = makeNoise(o.seed == null ? 1 : o.seed);
      var colors = (o.colors || ['var(--cool)', 'var(--accent)']).map(cssVar);
      var cnt = o.count == null ? 500 : o.count, scale = o.scale || 0.0022, str = o.strength == null ? 140 : o.strength;
      var drift = o.drift || [18, 40], ang = (o.angle || 0) * Math.PI / 180, steps = o.steps || 8, trail = o.trail == null ? 0.5 : o.trail;
      var wid = o.width || [0.6, 1.8], al = o.alpha || [0.15, 0.6], evolve = o.evolve == null ? 0.06 : o.evolve, eAmt = o.energy || 0;
      var ps = [];
      for (var i = 0; i < cnt; i++) {
        var sp = R.range(drift[0], drift[1]);
        ps.push({ x: R() * area.w, y: R() * area.h, vx: Math.cos(ang) * sp, vy: Math.sin(ang) * sp, z: R() * 10, w: R.range(wid[0], wid[1]), a: R.range(al[0], al[1]), col: colors[Math.floor(R() * colors.length)] });
      }
      var M = 60;
      function at(p, t, st) {
        var bx = mod(p.x + p.vx * t * st.speed, area.w + 2 * M) - M, by = mod(p.y + p.vy * t * st.speed, area.h + 2 * M) - M;
        var n1 = N.noise3(bx * scale, by * scale, p.z + t * evolve), n2 = N.noise3(bx * scale + 31.7, by * scale - 12.3, p.z - t * evolve);
        var s = str * st.strength;
        return [area.x + bx + n1 * s + st.x, area.y + by + n2 * s + st.y, bx, by];
      }
      var field = canvas(parent, function (g, t, info) {
        var st = info.state;
        var en = eAmt ? lerp(1, 0.55 + 0.9 * energy(t), eAmt) : 1;
        g.globalCompositeOperation = o.blend || 'lighter';
        g.lineCap = 'round'; g.lineJoin = 'round';
        var dt = trail / steps;
        for (var i = 0; i < ps.length; i++) {
          var p = ps[i], prev = at(p, t, st);
          g.strokeStyle = p.col; g.lineWidth = p.w;
          for (var k = 1; k <= steps; k++) {
            var q = at(p, t - k * dt, st);
            if (Math.abs(q[2] - prev[2]) > area.w / 2 || Math.abs(q[3] - prev[3]) > area.h / 2) break; // wrapped
            g.globalAlpha = clamp(p.a * st.brightness * en * (1 - (k - 1) / steps), 0, 1);
            g.beginPath(); g.moveTo(prev[0], prev[1]); g.lineTo(q[0], q[1]); g.stroke();
            prev = q;
          }
        }
      }, { state: { brightness: 1, strength: 1, speed: 1, x: 0, y: 0, opacity: o.opacity == null ? 1 : o.opacity }, timeScale: o.timeScale, cls: o.cls });
      return field;
    }

    /** textPoints(str, {font:'900 360px "Noto Sans SC"', x:960, y:540, step:7, max:1200, seed:1, letterSpacing:0})
     * -> [{x,y}] sampled from the glyph shapes (centred at x,y), deterministically shuffled. Use as particles targets. */
    function textPoints(str, o) {
      o = o || {};
      var font = o.font || '900 360px "Noto Sans SC"', step = o.step || 7;
      var c = document.createElement('canvas'); c.width = W; c.height = H;
      var g = c.getContext('2d', { willReadFrequently: true });
      g.font = font; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillStyle = '#fff';
      if (o.letterSpacing) g.letterSpacing = o.letterSpacing + 'px';
      g.fillText(str, o.x == null ? W / 2 : o.x, o.y == null ? H / 2 : o.y);
      var data = g.getImageData(0, 0, W, H).data, pts = [];
      for (var y = 0; y < H; y += step) for (var x = 0; x < W; x += step) if (data[(y * W + x) * 4 + 3] > 128) pts.push({ x: x, y: y });
      pts = rand(o.seed == null ? 1 : o.seed).shuffle(pts);
      if (o.max && pts.length > o.max) pts = pts.slice(0, o.max);
      return pts;
    }

    // ---------- SVG filter effects ----------
    function useFilter(target, f, on) { var v = on ? f.url : ''; if (target.__fx !== v) { target.style.filter = v; target.__fx = v; } }
    /** liquid(target, {amount:0, scale:80, freq:0.006, octaves:2, seed:7, drift:60, speed:0.35}) -> {state:{amount}, filter}
     * SVG displacement (feTurbulence + feDisplacementMap) that flows over time. Tween state.amount 0..1. The filter is
     * removed when amount is 0 (no cost). */
    function liquid(target, o) {
      o = o || {};
      var f = liquidFilter(engine.defs, nextId('liquid'), o);
      var state = { amount: o.amount || 0 }, S = o.scale == null ? 80 : o.scale;
      onRender(function (t) { var on = state.amount > 0.001; if (on) f.set(state.amount * S, t); useFilter(target, f, on); });
      return { state: state, filter: f };
    }
    /** ink(target, {seed:3, freq:0.009, octaves:4, sharpness:14, from:{x,y}|false, noise:0.45, rim:'var(--accent)'|null, rimWidth:0.05, width, height})
     * -> {state:{p}}: ink/burn reveal through thresholded noise. p 0 = hidden, 1 = fully shown (filter removed).
     * `from` is in the target's own CSS px (default its centre); false = noise only. */
    function ink(target, o) {
      o = o || {};
      var w = o.width || target.offsetWidth || W, h = o.height || target.offsetHeight || H;
      var f = inkFilter(engine.defs, nextId('ink'), Object.assign({}, o, { width: w, height: h }));
      var state = { p: o.p == null ? 0 : o.p };
      onRender(function () {
        var p = state.p;
        if (p <= 0.0005) { target.style.visibility = 'hidden'; useFilter(target, f, false); return; }
        target.style.visibility = '';
        if (p >= 0.9995) { useFilter(target, f, false); return; }
        f.set(p); useFilter(target, f, true);
      });
      return { state: state, filter: f };
    }
    /** displace(target, {map:'assets/x.png'|null (null = noise), scale:60, freq:0.01, width, height}) -> {state:{amount}}
     * Displacement by an image map (R = x, G = y) or by static noise. */
    function displace(target, o) {
      o = o || {};
      var id = nextId('disp');
      var w = o.width || target.offsetWidth || W, h = o.height || target.offsetHeight || H;
      var f = svgEl('filter', { id: id, x: '-10%', y: '-10%', width: '120%', height: '120%', 'color-interpolation-filters': 'sRGB' }, engine.defs);
      if (o.map) svgEl('feImage', { href: asset(o.map), x: 0, y: 0, width: w, height: h, preserveAspectRatio: 'none', result: 'm' }, f);
      else svgEl('feTurbulence', { type: 'turbulence', baseFrequency: o.freq || 0.01, numOctaves: o.octaves || 2, seed: o.seed || 1, result: 'm' }, f);
      var dm = svgEl('feDisplacementMap', { in: 'SourceGraphic', in2: 'm', scale: 0, xChannelSelector: 'R', yChannelSelector: 'G' }, f);
      var ff = { url: 'url(#' + id + ')' }, state = { amount: o.amount || 0 }, S = o.scale == null ? 60 : o.scale, last = null;
      onRender(function () { var on = state.amount > 0.001; if (on) { var s = (state.amount * S).toFixed(2); if (s !== last) { dm.setAttribute('scale', s); last = s; } } useFilter(target, ff, on); });
      return { state: state, filter: ff };
    }
    /** chroma(target, {amount:0, angle:0}) -> {state:{amount}}: RGB split (chromatic aberration), amount in px. */
    function chroma(target, o) {
      o = o || {};
      var id = nextId('chroma');
      var f = svgEl('filter', { id: id, x: '-5%', y: '-5%', width: '110%', height: '110%', 'color-interpolation-filters': 'sRGB' }, engine.defs);
      svgEl('feColorMatrix', { in: 'SourceGraphic', type: 'matrix', values: '1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0', result: 'r' }, f);
      svgEl('feColorMatrix', { in: 'SourceGraphic', type: 'matrix', values: '0 0 0 0 0  0 1 0 0 0  0 0 0 0 0  0 0 0 1 0', result: 'g' }, f);
      svgEl('feColorMatrix', { in: 'SourceGraphic', type: 'matrix', values: '0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0', result: 'b' }, f);
      var or = svgEl('feOffset', { in: 'r', dx: 0, dy: 0, result: 'ro' }, f);
      var ob = svgEl('feOffset', { in: 'b', dx: 0, dy: 0, result: 'bo' }, f);
      svgEl('feBlend', { in: 'ro', in2: 'g', mode: 'screen', result: 'rg' }, f);
      svgEl('feBlend', { in: 'rg', in2: 'bo', mode: 'screen' }, f);
      var ff = { url: 'url(#' + id + ')' }, state = { amount: o.amount || 0 }, a = (o.angle || 0) * Math.PI / 180, last = null;
      onRender(function () {
        var on = state.amount > 0.05;
        if (on) { var dx = (Math.cos(a) * state.amount).toFixed(2), dy = (Math.sin(a) * state.amount).toFixed(2), k = dx + dy; if (k !== last) { or.setAttribute('dx', dx); or.setAttribute('dy', dy); ob.setAttribute('dx', -dx); ob.setAttribute('dy', -dy); last = k; } }
        useFilter(target, ff, on);
      });
      return { state: state, filter: ff };
    }
    /** maskReveal(el, {type:'linear'|'radial', angle:90, soft:120, x, y, invert:false, p:0}) -> {state:{p}}
     * Soft-edged wipe (linear, along angle) or iris (radial, from x,y in the element's px). p 0 hidden .. 1 shown. */
    function maskReveal(e, o) {
      o = o || {};
      var w = o.width || e.offsetWidth || W, h = o.height || e.offsetHeight || H;
      var state = { p: o.p == null ? 0 : o.p }, soft = o.soft == null ? 120 : o.soft, last = null;
      onRender(function () {
        var p = clamp(state.p, 0, 1), k = p.toFixed(5);
        if (k === last) return; last = k;
        if (p >= 0.9999 && !o.invert) { setMask(e, ''); return; }
        setMask(e, o.type === 'radial' ? maskRadial(w, h, o.x == null ? w / 2 : o.x, o.y == null ? h / 2 : o.y, p, soft, o.invert) : maskLinear(w, h, o.angle == null ? 90 : o.angle, p, soft, o.invert));
      });
      return { state: state };
    }

    // ---------- camera / parallax / light ----------
    /** parallax(parent, depths=[0.3,0.6,1,1.5], {origin:[960,540], shake:0}) -> {layers:[div...], state}
     * Full-frame layers that move with a virtual camera: layer d gets translate(-x*d, -y*d), scale 1+(zoom-1)*d,
     * rotate rotate*d. state: x, y, zoom=1, rotate=0 (deg), shake=0 (px of deterministic handheld drift). */
    function parallax(parent, depths, o) {
      o = o || {};
      depths = depths || [0.3, 0.6, 1, 1.5];
      var org = o.origin || [W / 2, H / 2];
      var layers = depths.map(function (d, i) { var l = el('div', { cls: 'fill layer', parent: parent || root }); l.style.transformOrigin = org[0] + 'px ' + org[1] + 'px'; l.dataset.depth = d; return l; });
      var state = { x: 0, y: 0, zoom: 1, rotate: 0, shake: o.shake || 0 };
      var N = makeNoise('shake:' + sid);
      onRender(function (t) {
        var sx = state.shake ? N.noise3(t * 0.45, 1.3, 0) * state.shake : 0, sy = state.shake ? N.noise3(4.1, t * 0.4, 0) * state.shake : 0;
        layers.forEach(function (l, i) {
          var d = depths[i];
          l.style.transform = 'translate3d(' + (-(state.x + sx) * d).toFixed(2) + 'px,' + (-(state.y + sy) * d).toFixed(2) + 'px,0) scale(' + (1 + (state.zoom - 1) * d).toFixed(5) + ') rotate(' + (state.rotate * d).toFixed(3) + 'deg)';
        });
      });
      return { layers: layers, state: state };
    }
    /** rays(parent, {x:960, y:-120, direction:180, color:'var(--accent)', count:10, spread:70, length:1500, opacity:0.45, blur:10, sway:4, seed})
     * -> {el, state:{opacity, rotate, length}}: soft volumetric light rays from a point (CSS conic gradient + radial falloff). */
    function rays(parent, o) {
      o = o || {};
      var x = o.x == null ? W / 2 : o.x, y = o.y == null ? -120 : o.y, len = o.length || 1500;
      var col = cssVar(o.color || 'var(--accent)'), n = o.count || 10, spread = o.spread || 70;
      var r = rand('rays:' + (o.seed || 1)), stops = [], step = spread / n;
      for (var i = 0; i < n; i++) {
        // angles inside [0, spread]; the gradient starts at (direction - spread/2)
        var a0 = i * step + r.range(0, step * 0.2), wdt = r.range(step * 0.35, step * 0.8), al = r.range(0.45, 1);
        stops.push('transparent ' + a0.toFixed(2) + 'deg', withAlpha(col, al) + ' ' + (a0 + wdt / 2).toFixed(2) + 'deg', 'transparent ' + (a0 + wdt).toFixed(2) + 'deg');
      }
      var dir = o.direction == null ? 180 : o.direction; // CSS conic angle: 0 = up, 90 = right, 180 = down
      var e = el('div', { cls: 'abs rays', parent: parent || root });
      e.style.left = (x - len) + 'px'; e.style.top = (y - len) + 'px'; e.style.width = (len * 2) + 'px'; e.style.height = (len * 2) + 'px';
      e.style.background = 'conic-gradient(from ' + (dir - spread / 2) + 'deg at 50% 50%, transparent 0deg, ' + stops.join(', ') + ', transparent ' + spread + 'deg, transparent 360deg)';
      var m = 'radial-gradient(circle at 50% 50%, #000 0%, rgba(0,0,0,.55) 35%, transparent 70%)';
      setMask(e, m);
      e.style.filter = 'blur(' + (o.blur == null ? 10 : o.blur) + 'px)';
      e.style.mixBlendMode = o.blend || 'screen';
      var state = { opacity: o.opacity == null ? 0.45 : o.opacity, rotate: o.rotate || 0 }, sway = o.sway == null ? 4 : o.sway;
      onRender(function (t) {
        e.style.opacity = state.opacity.toFixed(4);
        e.style.transform = 'rotate(' + (state.rotate + Math.sin(t * 0.37) * sway).toFixed(3) + 'deg)';
      });
      return { el: e, state: state };
    }

    // ---------- music: beats, bars, energy, drum hits ----------
    /** beat(n): local time of beat n (beat 0 = first beat at/after scene start). Fractions allowed. */
    function beat(n) { return gridAt(music.beatsLocal, music.beatLen, n || 0); }
    /** bar(n): local time of bar line n (bar 0 = first bar line at/after scene start, normally 0). */
    function bar(n) { return gridAt(music.barsLocal, music.barLen, n || 0); }
    function gridAt(list, step, n) {
      var i = Math.floor(n), f = n - i;
      function at(k) { if (k < list.length) return list[k]; var last = list.length ? list[list.length - 1] : 0, lk = list.length ? list.length - 1 : 0; return last + (k - lk) * step; }
      return at(i) + (f ? (at(i + 1) - at(i)) * f : 0);
    }
    /** snap(t, 'beat'|'bar'|'half'): nearest grid time to local time t */
    function snap(t, unit) {
      var list = unit === 'bar' ? music.barsLocal : music.beatsLocal;
      if (unit === 'half') { list = []; for (var i = 0; i < music.beatsLocal.length; i++) { list.push(music.beatsLocal[i]); list.push(music.beatsLocal[i] + music.beatLen / 2); } }
      var best = t, bd = Infinity;
      list.forEach(function (b) { var d = Math.abs(b - t); if (d < bd) { bd = d; best = b; } });
      return best;
    }
    function lastBefore(list, t) { var lo = 0, hi = list.length - 1, ans = -1; while (lo <= hi) { var mid = (lo + hi) >> 1; if (list[mid] <= t + 1e-9) { ans = mid; lo = mid + 1; } else hi = mid - 1; } return ans; }
    /** beatPulse(t, decay=0.18) -> 1 on each beat, decaying exponentially (0..1). */
    function beatPulse(t, decay) { var T = t + scene.start, l = engine.music.beats, i = lastBefore(l, T); return i < 0 ? 0 : Math.exp(-(T - l[i]) / (decay || 0.18)); }
    /** barPulse(t, decay=0.35) -> 1 on each bar line, decaying. */
    function barPulse(t, decay) { var T = t + scene.start, l = engine.music.bars, i = lastBefore(l, T); return i < 0 ? 0 : Math.exp(-(T - l[i]) / (decay || 0.35)); }
    /** energyAt(T): music energy (0..1) at GLOBAL time T; 0.5 when music/energy.json is missing. */
    function energyAt(T) {
      var en = engine.energy;
      if (!en || !en.values || !en.values.length) return 0.5;
      var x = T * en.fps, i = Math.floor(x), f = x - i, v = en.values, n = v.length;
      if (i < 0) return v[0]; if (i >= n - 1) return v[n - 1];
      return v[i] + (v[i + 1] - v[i]) * f;
    }
    /** energy(t, smooth=0): music energy (0..1) at scene-local time t; smooth = averaging window in s (centred). */
    function energy(t, sm) {
      var T = t + scene.start;
      if (!sm) return energyAt(T);
      var n = 8, s = 0; for (var i = 0; i < n; i++) s += energyAt(T - sm / 2 + sm * (i + 0.5) / n); return s / n;
    }
    /** hitPulse(t, decay=0.22) -> 1 at each drum hit (energy.json "hits"), decaying exponentially; 0 if no hits. */
    function hitPulse(t, decay) {
      var en = engine.energy; if (!en || !en.hits || !en.hits.length) return 0;
      var T = t + scene.start, i = lastBefore(en.hits, T);
      return i < 0 ? 0 : Math.exp(-(T - en.hits[i]) / (decay || 0.22));
    }
    var hitsLocal = (engine.energy && engine.energy.hits || []).map(function (h) { return +(h - scene.start).toFixed(6); }).filter(function (h) { return h > -0.05 && h < scene.duration; });
    /** energyVars(el): sets CSS variables every frame: --e (energy 0..1), --hit (drum hit pulse), --beat (beat pulse). */
    function energyVars(e, o) {
      o = o || {};
      onRender(function (t) {
        e.style.setProperty('--e', energy(t, o.smooth || 0.08).toFixed(4));
        e.style.setProperty('--hit', hitPulse(t, o.decay).toFixed(4));
        e.style.setProperty('--beat', beatPulse(t, o.beatDecay).toFixed(4));
      });
    }
    /** energyGlow(el, {color:'var(--accent)', min:8, max:44, hit:0.5, smooth:0.08, mode:'text'|'filter', state})
     * -> {state:{amount}}: glow radius follows the music energy, drum hits flash it. mode 'text' uses text-shadow
     * (text only, cheap); 'filter' uses drop-shadow (any element). Tween state.amount (default 1) to fade it. */
    function energyGlow(e, o) {
      o = o || {};
      var col = o.color || 'var(--accent)', state = { amount: o.amount == null ? 1 : o.amount };
      var c1 = withAlpha(col, 0.85), c2 = withAlpha(col, 0.45), mode = o.mode || 'text', last = null;
      onRender(function (t) {
        var a = state.amount;
        if (a <= 0.001) { if (last !== '') { if (mode === 'text') e.style.textShadow = ''; else e.style.filter = ''; last = ''; } return; }
        var en = energy(t, o.smooth == null ? 0.08 : o.smooth), hp = hitPulse(t, o.decay);
        var r = (lerp(o.min == null ? 8 : o.min, o.max == null ? 44 : o.max, en) * (1 + (o.hit == null ? 0.5 : o.hit) * hp)) * a;
        var v = mode === 'text'
          ? '0 0 ' + (r * 0.45).toFixed(1) + 'px ' + c1 + ', 0 0 ' + r.toFixed(1) + 'px ' + c2 + ', 0 0 ' + (r * 2.2).toFixed(1) + 'px ' + withAlpha(col, 0.25 * a)
          : 'drop-shadow(0 0 ' + (r * 0.5).toFixed(1) + 'px ' + c1 + ') drop-shadow(0 0 ' + r.toFixed(1) + 'px ' + c2 + ')';
        if (v === last) return; last = v;
        if (mode === 'text') e.style.textShadow = v; else e.style.filter = v;
      });
      return { state: state };
    }

    // ---------- three.js ----------
    /** three(parent, setup(THREE, g) -> update(t, g), {x,y,width,height, fov:35, near:0.1, far:2000, cameraZ:10,
     *   antialias:true, clearColor:null (transparent), toneMapping:false})
     * WebGL canvas at devicePixelRatio, rendered ONLY from timeline time: every frame update(t, g) runs (if returned),
     * then renderer.render(g.scene, g.camera). g = {THREE, renderer, scene, camera, canvas, width, height, dpr, state,
     * textTexture(text, o), textSprite(text, o), pxToWorld(dist)}. Rendering is skipped while state.opacity is 0.
     * Returns g, or null if WebGL is unavailable (an engine error is recorded). */
    function three(parent, setup, o) {
      o = o || {};
      var THREE = window.THREE;
      if (!THREE) { if (engine.noThree) engine.warn('three.js disabled (--nothree): WebGL layer skipped', sid); else engine.error('three.js is not loaded', sid); return null; }
      var dpr = dprNow(), x = o.x || 0, y = o.y || 0, w = o.width || W, h = o.height || H;
      var cv = el('canvas', { cls: 'abs layer-gl', parent: parent || root });
      cv.style.left = x + 'px'; cv.style.top = y + 'px'; cv.style.width = w + 'px'; cv.style.height = h + 'px';
      var renderer;
      try {
        renderer = new THREE.WebGLRenderer({ canvas: cv, antialias: o.antialias !== false, alpha: true, premultipliedAlpha: true, preserveDrawingBuffer: true, powerPreference: 'high-performance' });
      } catch (e) { engine.error('WebGL is unavailable: ' + e, sid); cv.remove(); return null; }
      renderer.setPixelRatio(dpr);
      renderer.setSize(w, h, false);
      if (o.clearColor != null) renderer.setClearColor(new THREE.Color(cssVar(o.clearColor)), 1); else renderer.setClearColor(0x000000, 0);
      if (o.toneMapping) { renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = o.exposure || 1; }
      var scene3 = new THREE.Scene();
      var camera = new THREE.PerspectiveCamera(o.fov || 35, w / h, o.near || 0.1, o.far || 2000);
      camera.position.set(0, 0, o.cameraZ == null ? 10 : o.cameraZ);
      var g = { THREE: THREE, renderer: renderer, scene: scene3, camera: camera, canvas: cv, width: w, height: h, dpr: dpr, state: { opacity: 1 } };
      /** world units per CSS px at distance dist from the camera */
      g.pxToWorld = function (dist) { return 2 * Math.tan(camera.fov * Math.PI / 360) * dist / h; };
      /** textTexture(text, {font:'700 64px "Noto Sans SC"', color:'#fff', glow:null, glowSize:16, padding:16, res:2*dpr})
       * -> CanvasTexture (sRGB, mipmapped) + .userData {w,h} in CSS px of the drawn text. */
      g.textTexture = function (txt, to) {
        to = to || {};
        var font = to.font || '700 64px "Noto Sans SC"', res = to.res || Math.max(2, dpr * 2), pad = to.padding == null ? 16 : to.padding;
        var c = document.createElement('canvas'), cx = c.getContext('2d');
        cx.font = font;
        var m = cx.measureText(txt), tw = Math.ceil(m.width), fh = parseFloat(/(\d+(\.\d+)?)px/.exec(font)[1]);
        var cw = tw + pad * 2, ch = Math.ceil(fh * 1.35) + pad * 2;
        c.width = Math.ceil(cw * res); c.height = Math.ceil(ch * res);
        cx.scale(res, res); cx.font = font; cx.textAlign = 'center'; cx.textBaseline = 'middle';
        if (to.glow) { cx.shadowColor = cssVar(to.glow); cx.shadowBlur = (to.glowSize || 16) * res; }
        cx.fillStyle = cssVar(to.color || '#ffffff');
        cx.fillText(txt, cw / 2, ch / 2 + fh * 0.04);
        var tex = new THREE.CanvasTexture(c);
        tex.colorSpace = THREE.SRGBColorSpace;
        tex.generateMipmaps = true; tex.minFilter = THREE.LinearMipmapLinearFilter; tex.magFilter = THREE.LinearFilter;
        tex.anisotropy = renderer.capabilities.getMaxAnisotropy();
        tex.userData = { w: cw, h: ch };
        return tex;
      };
      /** textSprite(text, {px:48 (on-screen height in CSS px at distance `at`), at:cameraZ, blending:'normal'|'additive', opacity:1, ...textTexture opts})
       * -> THREE.Sprite sized so it appears `px` tall when `at` units from the camera. */
      g.textSprite = function (txt, so) {
        so = so || {};
        var tex = g.textTexture(txt, so);
        var mat = new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false, opacity: so.opacity == null ? 1 : so.opacity, blending: so.blending === 'additive' ? THREE.AdditiveBlending : THREE.NormalBlending });
        var sp = new THREE.Sprite(mat);
        var fh = parseFloat(/(\d+(\.\d+)?)px/.exec(so.font || '700 64px')[1]);
        var unit = g.pxToWorld(so.at == null ? camera.position.z : so.at) * (so.px || 48) / fh;
        sp.scale.set(tex.userData.w * unit, tex.userData.h * unit, 1);
        return sp;
      };
      var update = null;
      try { update = setup(THREE, g); } catch (e) { engine.error('three setup threw: ' + (e && e.stack || e), sid); }
      var blank = true;
      onRender(function (t) {
        var op = g.state.opacity;
        cv.style.opacity = op >= 0.999 ? '' : op.toFixed(4);
        if (op <= 0.001) { if (!blank) { renderer.setRenderTarget(null); renderer.clear(); blank = true; } return; }
        blank = false;
        if (typeof update === 'function') update(t, g);
        renderer.render(scene3, camera);
      });
      return g;
    }

    return {
      // randomness and math
      rand: rand, hash: hash, clamp: clamp, lerp: lerp, mod: mod, smooth: smooth, remap: remap,
      noise3: NOISE.noise3, noise2: NOISE.noise2, fbm: NOISE.fbm, makeNoise: makeNoise,
      rgba: rgba, withAlpha: withAlpha, mixColor: mixColor, cssVar: cssVar,
      // DOM and text
      el: function (tag, o) { o = o || {}; if (o.parent === undefined) o.parent = root; return el(tag, o); },
      text: text, fitText: fitText, splitChars: splitChars, split: split, typewriter: typewriter,
      asset: asset, image: image, preload: preload, sequence: sequence, counter: counter,
      // SVG
      svg: svg, svgEl: svgEl, path: path, line: line, curve: curve, drawPath: drawPath, pointAt: pointAt,
      // effects
      glowSweep: glowSweep, canvas: canvas, particles: particles, flow: flow, textPoints: textPoints,
      liquid: liquid, ink: ink, displace: displace, chroma: chroma, maskReveal: maskReveal,
      parallax: parallax, rays: rays, three: three,
      // music
      beat: beat, bar: bar, snap: snap, beatPulse: beatPulse, barPulse: barPulse,
      energy: energy, energyAt: energyAt, hitPulse: hitPulse, hits: hitsLocal, energyVars: energyVars, energyGlow: energyGlow,
      beats: music.beatsLocal, bars: music.barsLocal, beatLen: music.beatLen, barLen: music.barLen,
      onFrame: onFrame, roleClass: function (r) { return ROLE_CLASS[r] || r; }
    };
  }

  window.__makeUtil = makeUtil;
})();
