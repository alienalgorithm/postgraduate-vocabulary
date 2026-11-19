/* s07  Trough and build-up (global 96.842 to 111.842 s, bars 53 to 60 of the Cornfield Chase edit; 15 s).
 * Music: build_2, one full F G Am G round that swells without a break (energy 0.83 to 0.97); harmony changes every
 * two bars: 96.842 F, 100.592 G, 104.342 Am, 108.092 G (hits 0.55 to 0.6). Beat 0.625 s, 16th 0.15625, 32nd 0.078125.
 * The picture runs against the music: it gets darker and gathers in while the music climbs; the colour temperature
 * never drops (s06's deep teal is darkened and desaturated, the amber lines and the motif dot only dim, the lamp is
 * neutral white). The last half beat is black while the music keeps going.
 *
 *  A (0 to 3.75, bars 53 to 54, F)  Cut from s06's last frame (redrawn here from s06's own seeds and formulas). The
 *     star map's amber lines go dark one by one on 16ths and the map drifts up and away while the brightness timeline
 *     of evidence zooms to full screen (bar 53 beat 3). The playhead keeps running: no more encounters, so the curve
 *     sags and the motif dot on it dims (brightness = how much is still remembered). On 16ths from beat 2 every dip
 *     between two bumps drains: a dashed ghost line stays at the old water level, the space under it turns dark
 *     (#0e2a2c 60 %, hatched) and drops leak out of the bottom; on bar 54 beat 3 the long final sag drains too.
 *     Texts: evidence (left end of the line), 可是，遇见了，还会忘。 (char pops on beats 1.5, 2 and 3), Ebbinghaus, 1885.
 *  B (3.75 to 7.5, bars 55 to 56, G)  The camera pulls back (power3.out from the downbeat): the line is the front row
 *     of a perspective ridgeline of 300 memory lines (one word each, no text), a new batch of 13 drawing in on every
 *     16th; all of them sag to the right, more and more. 光是读过，还不够。 and Waring & Takaki, 2003 on beat 2.
 *  C (7.5 to 9.375, bar 57, Am)  The desk lamp switches on (neutral white cone, two 32nd flickers) and the lines fold
 *     into an open book, back rows first: 26 become the lines of text on the two pages, 273 the page edges of the
 *     block, the evidence line the near edge of the top page. The paper fades in under the lamp, the faceless learner
 *     appears behind the book (3 px warm-white strokes, head lamp 25 %), the motif dot slides into the gutter.
 *  D (9.375 to 11.25, bar 58)  The hands reach for the far corners, the halves lift 9 deg (anticipation) while the
 *     lamp trembles on every 16th; from 10.75 the halves slam shut (power4.in, both halves CSS 3D covers + canvas
 *     pages in the same projection), landing on the G downbeat at 11.25.
 *  E (11.25 to 13.125, bar 59, G)  Bang: camera shake 2 %, a dust puff along the desk; the lamp cone (SVG, MorphSVG)
 *     is pinched into a vertical slit: the light is caught in the spine, the motif dot squeezed up into it. 合上书。
 *     (140 px) slams in. Only the slit and a faint outline remain.
 *  F (13.125 to 15, bar 60)  Everything else goes out, the vignette closes in, the leftover light is sucked into the
 *     spine; the slit flickers on 16ths, from beat 3 (14.375) on 32nds, energy driven; 14.6875 black (grain only).
 *
 * Techniques: data visualisation (timeline with drained "lost water" regions, a 300-row perspective ridgeline),
 * morphing (lines folding into pages and text lines, MorphSVG lamp cone into a slit), faceless character, 2.5D/3D
 * (perspective ridgeline, book in a CSS-perspective projection with CSS 3D matrix3d covers), light (volumetric lamp
 * cone, light pool, slit glow, vignette), particles (leak drops, slam dust, light sucked into the spine), text effects
 * (char pops, slam), music sync (16th batches, 16th/32nd flicker, energy-driven glow and tremble).
 *
 * HANDOFF in (cut from s06 at 96.842): s06's last frame: bg #0a1622 + #13293a glow, star map (centre 960,664, scale
 *   0.8, 9 stars and amber lines with their pulses, 7 faint meteor rays, amber bloom and rays), dust and bokeh from
 *   s06's seeds, the timeline x 120..1600, baseline 980, amp 150 (16 bumps) and the motif dot (warm gold, full) at its
 *   right end. These numbers are copied here (CY0, METEOR_L, s06's formulas) because a render chunk may start inside
 *   s07 without s06 ever reaching its last frame; measured at the cut: mean difference 1.5/255 (motion only).
 * HANDOFF out (cut to s08 at 111.842): the last half beat (14.6875 to 15) is black. Before that, the closed book
 *   stands at the centre: the seam (the trapped light) is the vertical line x = 960 from y 371 (far top) to y 838
 *   (desk), brightest on the near face (y 593 to 838); the motif dot sits in it at (960, ~715); the learner's head was
 *   at (960, 300), r 40. window.__s07Handoff holds these numbers.
 */
(function () {
  'use strict';

  registerScene('s07', async function build(tl, root, ctx) {
    var u = ctx.util, gsap = window.gsap, D = ctx.duration, W = 1920, H = 1080;
    var clamp = u.clamp, lerp = u.lerp, dpr = window.devicePixelRatio || 1;
    function E(n) { return gsap.parseEase(n); }
    var eSine = E('sine.inOut'), eP2o = E('power2.out'), eP2i = E('power2.in'), eP2io = E('power2.inOut'),
      eP3o = E('power3.out'), eP3io = E('power3.inOut'), eP4i = E('power4.in'), eExpoI = E('expo.in');
    function seg(t, a, b, ease) { var x = clamp((t - a) / (b - a), 0, 1); return ease ? ease(x) : x; }
    function pulse(x, rise, decay) { return x < 0 ? 0 : (1 - Math.exp(-x / rise)) * Math.exp(-x / decay); }
    function TX(s) {
      for (var i = 0; i < ctx.texts.length; i++) if (ctx.texts[i].text === s) return ctx.texts[i];
      throw new Error('s07: text missing from the storyboard: ' + s);
    }
    function hexRgb(h) { var x = parseInt(h.slice(1), 16); return [x >> 16, (x >> 8) & 255, x & 255]; }
    function mixRgb(a, b, k) { return [Math.round(lerp(a[0], b[0], k)), Math.round(lerp(a[1], b[1], k)), Math.round(lerp(a[2], b[2], k))]; }
    function rgba(c, a) { return 'rgba(' + c[0] + ',' + c[1] + ',' + c[2] + ',' + clamp(a, 0, 1).toFixed(4) + ')'; }
    function esc(s) { return s.replace(/&/g, '&amp;').replace(/</g, '&lt;'); }
    function mark(str, sub, style) {
      var i = str.indexOf(sub); if (i < 0) throw new Error('s07: "' + sub + '" not in "' + str + '"');
      return esc(str.slice(0, i)) + '<span style="' + style + '">' + esc(sub) + '</span>' + esc(str.slice(i + sub.length));
    }

    await Promise.all([
      document.fonts.load('italic 400 48px "Source Serif 4 Display"'),
      document.fonts.load('italic 400 40px "Source Serif 4 Display"'),
      document.fonts.load('700 80px "Noto Sans SC"'),
      document.fonts.load('900 140px "Noto Sans SC"')
    ]);

    // ================= music grid (local s) =================
    var BEAT = 0.625, S16 = BEAT / 4, S32 = BEAT / 8;
    var T_TXT = 0.3125;   // texts in (bar 53, the "and" of beat 1)
    var T_ZOOM = 1.25;    // bar 53 beat 3: the timeline fills the screen
    var T_LAST = 3.125;   // bar 54 beat 3: the final sag drains
    var T_G = 3.75;       // bar 55 (G): pull back, ridgeline batches
    var T_L2 = 4.375;     // bar 55 beat 2: second text
    var T_AM = 7.5;       // bar 57 (Am): lamp on, the lines fold into a book
    var T_REACH = 9.375;  // bar 58: hands reach, lamp trembles
    var T_LIFT = 9.9;     // anticipation: the halves lift
    var T_FALL = 10.75;   // the slam starts (power4.in)
    var T_SLAM = 11.25;   // bar 59 (G): bang
    var T_DARK = 13.125;  // bar 60: all else goes out, 16th flicker
    var T_F32 = 14.375;   // bar 60 beat 3: 32nd flicker
    var T_BLACK = 14.6875;// the last half beat: black
    function eN(t) { return clamp((u.energy(t, 0.08) - 0.6) / 0.3, 0, 1); }    // s06's mapping (continuity of the map)
    function eB(t) { return clamp((u.energy(t, 0.06) - 0.78) / 0.2, 0, 1); }   // build_2 swells 0.78 .. 0.98
    function since(t, step, from) { if (t < from) return -1; var k = Math.floor((t - from) / step + 1e-6); return t - from - k * step; }
    function tick(t, step, from, decay) { var x = since(t, step, from); return x < 0 ? 0 : Math.exp(-x / decay); }
    function barPulse(t) { return tick(t, 3 * BEAT, 0, 0.5); }

    // ================= palette =================
    var C_TLINE = hexRgb('#9fe3d6'), C_GOLD = hexRgb('#ffcf70'), C_AMBER = hexRgb('#ffb547'), C_PALE = hexRgb('#ffe2b0'),
      C_FROST = hexRgb('#cfe6ff'), C_FLARE = hexRgb('#fff1c9'), C_LOST = hexRgb('#0e2a2c'), C_NEUT = [244, 243, 238],
      C_WARMW = hexRgb('#f2ebdf'), C_INK = [38, 44, 44];
    function makeSprite(rgb, core) {
      var R = Math.round(24 * dpr), c = document.createElement('canvas'); c.width = c.height = R * 2;
      var g = c.getContext('2d'), gr = g.createRadialGradient(R, R, 0, R, R, R);
      gr.addColorStop(0, rgba(mixRgb(rgb, [255, 255, 255], core), 1)); gr.addColorStop(0.18, rgba(rgb, 0.95));
      gr.addColorStop(0.42, rgba(rgb, 0.32)); gr.addColorStop(0.7, rgba(rgb, 0.08)); gr.addColorStop(1, rgba(rgb, 0));
      g.fillStyle = gr; g.fillRect(0, 0, R * 2, R * 2); return c;
    }
    var SPR_W = makeSprite(C_FLARE, 0.6), SPR_SOFT_GOLD = makeSprite([255, 196, 110], 0.1), SPR_AMBER = makeSprite([255, 166, 64], 0.55),
      SPR_ICE = makeSprite([170, 205, 255], 0.5), SPR_TEAL = makeSprite([70, 190, 170], 0.3), SPR_NEUT = makeSprite([236, 234, 226], 0.5),
      SPR_TL = makeSprite([150, 220, 205], 0.4);
    function glowDisc(g, x, y, r, rgb, a) {
      if (a <= 0.003 || r <= 0.3) return;
      var gr = g.createRadialGradient(x, y, 0, x, y, r);
      gr.addColorStop(0, rgba(rgb, a)); gr.addColorStop(0.35, rgba(rgb, a * 0.45)); gr.addColorStop(1, rgba(rgb, 0));
      g.fillStyle = gr; g.fillRect(x - r, y - r, r * 2, r * 2);
    }

    // ================= s06's end state (its own numbers and seeds) =================
    var T6 = 22.5, TS = 10.625;
    var S6 = (ctx.storyboard && ctx.storyboard.scenes || []).filter(function (s) { return s.id === 's06'; })[0] || {};
    var VT6 = S6.visual_text || [];
    var FIN = [11.25, 12.5, 13.75, 15.0, 15.9375, 16.875, 17.8125, 18.75], FOUT = [13.65, 14.9, 16.15, 17.4, 18.55, 19.275, 20.212, 21.15];
    ['f1', 'f2', 'f3', 'f4', 'f5', 'f6', 'f7', 'f8'].forEach(function (id, i) {
      for (var k = 0; k < VT6.length; k++) if (VT6[k].id === id) { FIN[i] = +VT6[k].in; FOUT[i] = +VT6[k].out; }
    });
    var METEOR_L = [19.375, 20.0, 20.625, 20.9375, 21.25, 21.5625, 21.875];   // s06: 7 unlabeled encounters
    var MANG = [200, 338, 158, 22, 222, 312, 180, 2];
    var METEORS = METEOR_L.map(function (L, i) { var a = MANG[i] * Math.PI / 180; return { arrive: L + 0.3125, ox: 960 + 1250 * Math.cos(a), oy: 560 + 900 * Math.sin(a) }; });
    var ARR = [TS].concat(FIN.map(function (x) { return x + 0.625; }), METEORS.map(function (m) { return m.arrive; }));
    var FOCAL = 1400, ERX = 560, ERY = 270, CY0 = 664;                  // s06's map at its last frame: (960, 664), scale 0.8
    var EXT = clamp((ARR.length - 9) / 8, 0, 1);                         // s06's extra bloom after the 9th encounter
    var SANG = [271, 233, 309, 195, 214, 328, 347, 252, 290];
    var STARS = SANG.map(function (a, i) {
      var r = a * Math.PI / 180;
      return { mx: ERX * Math.cos(r), my: ERY * Math.sin(r), mz: (u.hash(i, 's06z') - 0.5) * 220, ph: u.hash(i, 's06ph') * 6.283, born: i === 0 ? 11.25 : FOUT[i - 1] + 0.55 };
    });
    function mapM(t) {
      var t6 = T6 + Math.max(0, t), k = eP3io(seg(t, 0, 2.6));
      return { cx: 960, cy: CY0 - 170 * k, s: 0.8 * (1 - 0.06 * k), th: 8 * Math.PI / 180 * Math.sin(0.42 * (t6 - 15.4)), a: 0.85 };
    }
    function project(mx, my, mz, M) {
      var c = Math.cos(M.th), s = Math.sin(M.th), x = mx * c + mz * s, z = -mx * s + mz * c, k = FOCAL / (FOCAL + z);
      return [M.cx + M.s * x * k, M.cy + M.s * my * k, k];
    }
    function endOnWord(x, y, M) {
      var dx = x - M.cx, dy = y - M.cy, rx = 250 * M.s, ry = 82 * M.s, k = 1 / Math.sqrt((dx * dx) / (rx * rx) + (dy * dy) / (ry * ry));
      return [M.cx + dx * Math.min(1, k), M.cy + dy * Math.min(1, k)];
    }
    function strokeLine(g, x0, y0, x1, y1, a, en) {
      if (a <= 0.003) return;
      var lg = g.createLinearGradient(x0, y0, x1, y1);
      lg.addColorStop(0, rgba(C_AMBER, 0.25 * a)); lg.addColorStop(0.7, rgba(C_AMBER, 0.6 * a)); lg.addColorStop(1, rgba(C_GOLD, 0.85 * a));
      g.strokeStyle = lg; g.lineCap = 'round';
      g.globalAlpha = 0.16 * (0.8 + 0.4 * en); g.lineWidth = 9; g.beginPath(); g.moveTo(x0, y0); g.lineTo(x1, y1); g.stroke();
      g.globalAlpha = 1; g.lineWidth = 1.7; g.stroke();
    }
    var DUST = [];
    (function () {
      var R = u.rand('s06:dust');
      for (var i = 0; i < 240; i++) DUST.push({ x: R.range(-1300, 1300), y: R.range(-760, 760), z: R.range(-600, 900), r: R.range(0.5, 1.7), a: R.range(0.25, 0.9), ph: R() * 6.28, fq: R.range(0.3, 1.2), warm: R() < 0.3, vy: R.range(4, 14) });
    })();
    var BOKEH = [];
    (function () {
      var R = u.rand('s06:bokeh');
      for (var i = 0; i < 16; i++) BOKEH.push({ x: R.range(-100, 2020), y: R.range(-60, 1140), r: R.range(26, 74), a: R.range(0.025, 0.07), ph: R() * 6.28, sp: R.range(6, 18), warm: R() < 0.5, d: R.range(1.3, 1.9) });
    })();
    // s06's brightness timeline value, extended: after the last encounter (22.5) nothing comes, so it is forgotten
    function tlValue6(tau) {
      if (tau < TS) return 0;
      var v = 0.06;
      for (var i = 0; i < ARR.length; i++) {
        var x = tau - ARR[i]; if (x < 0) continue;
        v += 0.42 * (1 - Math.exp(-x / 0.05)) * Math.exp(-x / 0.95);
        v += 0.045 * eP2o(clamp(x / 0.8, 0, 1));
      }
      return 1 - Math.exp(-1.7 * v);
    }
    function heroValue(tau) { return tlValue6(tau) * (tau <= T6 ? 1 : 1 - 0.6 * (1 - Math.exp(-(tau - T6) / 2.2))); }
    var DT = 0.02, TAU_END = T6 + T_AM, HV = [];
    for (var hk = 0; TS + hk * DT <= TAU_END + DT; hk++) HV.push(heroValue(TS + hk * DT));
    var V_END6 = heroValue(T6);
    function tauNow(t) { return T6 + clamp(t, 0, T_AM); }

    // ================= the hero line: 2D zoom (A), then row 0 of the 3D ridgeline (B) =================
    var TC = 17.688, KX = 93.44, AMPW = 560;
    function geoA(t) {
      var k = eP3io(seg(t, 0, T_ZOOM));
      return { x0: lerp(120, 300, k), kx: lerp(1480 / 11.875, KX, k), base: lerp(980, 860, k), amp: lerp(150, AMPW, k) };
    }
    function camB(t) {
      var k = eP3o(seg(t, T_G, 7.4)), k2 = eP2io(seg(t, T_G, 7.4));
      return { x: lerp(0, 245, k2), y: lerp(530, 1064, k), z: lerp(-1000, -1900, k), hy: lerp(330, 320, k) };
    }
    function projRow(X, Y, Z, c) { var d = Z - c.z; return [960 + 1000 * (X - c.x) / d, c.hy + 1000 * (c.y - Y) / d, 1000 / d]; }
    function sagK(t) { return eP2io(seg(t, T_G, T_AM)); }
    function heroDroop(tau, t) { return 1 - 0.25 * sagK(t) * Math.pow(clamp((tau - TS) / 19.4, 0, 1), 1.3); }
    function heroPt(tau, val, t) {
      if (t < T_G) { var g = geoA(t); return [g.x0 + (tau - TS) * g.kx, g.base - g.amp * val]; }
      var p = projRow((tau - TC) * KX, AMPW * val * heroDroop(tau, t), 0, camB(t)); return [p[0], p[1]];
    }
    function heroBase(tau, t) { return heroPt(tau, 0, t); }
    function heroPts(t) {
      var tn = tauNow(t), n = Math.floor((tn - TS) / DT + 1e-6), pts = [];
      for (var k = 0; k <= n; k++) pts.push(heroPt(TS + k * DT, HV[k], t));
      if (TS + n * DT < tn - 1e-6) pts.push(heroPt(tn, heroValue(tn), t));
      return pts;
    }

    // lost-water regions: from each bump's peak to the next encounter (the last one runs to the playhead)
    var REG = [];
    (function () {
      for (var i = 0; i < ARR.length; i++) {
        var a = ARR[i], b = i + 1 < ARR.length ? ARR[i + 1] : null, end = b == null ? a + 1.2 : b, best = -1, bt = a;
        for (var tau = a; tau <= end; tau += DT / 2) { var v = heroValue(tau); if (v > best) { best = v; bt = tau; } }
        REG.push({ ta: bt, tb: b, P: best, ts: b == null ? T_LAST : 0.625 + i * S16, last: b == null });
      }
    })();

    // ================= the ridgeline rows (one word each) =================
    var NR = 300, NT = 26, DZ = 25, NB = 24, RDT = 0.2;
    var ROWS = [];
    (function () {
      var R = u.rand('s07:rows'), per = (NR - 1) / NB;
      for (var j = 1; j < NR; j++) {
        var n = R.int(3, 8), enc = [];
        for (var e = 0; e < n; e++) enc.push(R.range(10.9, 28.4));
        enc.sort(function (p, q) { return p - q; });
        ROWS.push({ j: j, enc: enc, a: R.range(0.22, 0.46), td: R.range(0.6, 1.3), fs: R.range(0.015, 0.05), sag: R.range(0.45, 0.85),
          Z: j * DZ, batch: Math.min(NB - 1, Math.floor((j - 1) / per)), ph: R() * 6.283 });
      }
    })();
    function rowVal(Rw, tau) {
      var v = 0.05;
      for (var i = 0; i < Rw.enc.length; i++) {
        var x = tau - Rw.enc[i]; if (x < 0) break;
        v += 0.42 * (1 - Math.exp(-x / 0.08)) * Math.exp(-x / Rw.td) + Rw.fs * eP2o(clamp(x / 0.8, 0, 1));
      }
      return 1 - Math.exp(-1.7 * v);
    }
    function rowY(Rw, tau, val, t) { return AMPW * Rw.a * val * (1 - (0.25 + 0.5 * sagK(t)) * Rw.sag * Math.pow(clamp((tau - TS) / 19.4, 0, 1), 1.3)); }
    // fixed sampling grid (no shimmer while the playhead moves)
    var RN = Math.ceil((TAU_END - TS) / RDT) + 1;
    ROWS.forEach(function (Rw) { Rw.V = []; for (var k = 0; k < RN; k++) Rw.V.push(rowVal(Rw, TS + k * RDT)); });
    function rowPts(Rw, t, frac) {   // screen points, drawn-in fraction frac of the current span
      var c = camB(t), tn = TS + (tauNow(t) - TS) * frac, n = Math.floor((tn - TS) / RDT + 1e-6), pts = [], base = [];
      for (var k = 0; k <= n; k++) { var tau = TS + k * RDT; pts.push(projRow((tau - TC) * KX, rowY(Rw, tau, Rw.V[k], t), Rw.Z, c)); }
      if (TS + n * RDT < tn - 1e-6) pts.push(projRow((tn - TC) * KX, rowY(Rw, tn, rowVal(Rw, tn), t), Rw.Z, c));
      var b0 = projRow((TS - TC) * KX, 0, Rw.Z, c), b1 = projRow((tn - TC) * KX, 0, Rw.Z, c);
      return { pts: pts, b0: b0, b1: b1 };
    }
    function rowTime(Rw) { return T_G + Rw.batch * S16; }

    // ================= the book (CSS-perspective projection, shared by canvas and the CSS 3D covers) =================
    var BW = 270, BL = 380, BT = 34, BTC = 5, BSQ = 8, AL = 34 * Math.PI / 180, PP = 1500, BX = 960, BY = 700;
    var SA = Math.sin(AL), CA = Math.cos(AL), HTOP = BTC + BT;
    function bookView(u0, v0, h0) { return [BX + u0, BY + v0 * SA - h0 * CA, v0 * CA + h0 * SA]; }
    function persp(X, Y, Z) { var k = PP / (PP - Z); return [960 + (X - 960) * k, 540 + (Y - 540) * k, k]; }
    function hf(q) { return BTC + BT * q; }
    function hg(q) { return BTC + 1 + 2.5 * q; }
    function hOpen(s, q) { return hg(q) + (hf(q) - hg(q)) * (1 - Math.pow(1 - s, 2.5)) + 5 * q * Math.sin(Math.PI * s) * (1 - s); }
    function thetaAt(t) {
      var a = 9 * eP2o(seg(t, T_LIFT, T_FALL));
      if (t < T_FALL) return a;
      var th = 9 + 81 * eP4i(seg(t, T_FALL, T_SLAM));
      if (t > T_SLAM) th -= 2.6 * Math.sin(Math.PI * seg(t, T_SLAM, T_SLAM + 0.16)) * Math.exp(-(t - T_SLAM) / 0.2);
      return th;
    }
    // a point of half `side` (+1 right, -1 left): s along the page width from the gutter, h its open height (page q)
    function bookPt(side, s, h, v0, th, flatH) {
      var c = th / 90, fl = Math.pow(c, 0.6), hh = flatH == null ? h : lerp(h, flatH, fl);
      var r = th * Math.PI / 180, x = s * BW, y = hh - HTOP;
      var xr = x * Math.cos(r) - y * Math.sin(r), yr = x * Math.sin(r) + y * Math.cos(r);
      var V = bookView(side * xr, v0, yr + HTOP - HTOP * (1 - Math.cos(r)));
      return persp(V[0], V[1], V[2]);
    }
    function pagePt(side, s, q, v0, th) { return bookPt(side, s, hOpen(s, q), v0, th, hf(q)); }
    function sigmaPt(sig, q, v0, th, lift) {   // sig in [-1, 1] across the spread
      var side = sig < 0 ? -1 : 1, s = Math.abs(sig);
      return bookPt(side, s, hOpen(s, q) + (lift || 0), v0, th, hf(q) + (lift || 0));
    }

    // ================= morph targets: rows -> text lines, page edges; hero -> top page near edge =================
    var MS = 64, MH = 160;
    var TEXTV = []; for (var tl0 = 0; tl0 < NT; tl0++) TEXTV.push(BL / 2 - 38 - tl0 * (BL - 76) / (NT - 1));   // near to far
    function rowTarget(j) {          // j = 1..NR-1
      if (j <= NT) return { kind: 'text', v: TEXTV[j - 1], q: 1, lift: 0.4 };
      var k = j - NT - 1, ns = NR - 1 - NT;
      return { kind: 'stack', v: BL / 2, q: 0.985 * (1 - k / (ns - 1)), lift: 0 };
    }
    function resample(pts, n) {      // n points evenly by index fraction
      var out = [], L = pts.length - 1;
      for (var i = 0; i < n; i++) { var f = i / (n - 1) * L, a = Math.floor(f), b = Math.min(L, a + 1), w = f - a; out.push([lerp(pts[a][0], pts[b][0], w), lerp(pts[a][1], pts[b][1], w)]); }
      return out;
    }
    var SRC = [], HSRC = resample(heroPts(T_AM - 1e-6), MH);
    ROWS.forEach(function (Rw) { SRC.push(resample(rowPts(Rw, T_AM - 1e-6, 1).pts, MS)); });
    // word dashes for the text lines (deterministic, in sigma units per half)
    var WORDS = [];
    for (var wl = 0; wl < NT; wl++) {
      var R2 = u.rand('s07:words:' + wl), list = [];
      [-1, 1].forEach(function (side) {
        var s = 0.1, end = wl === NT - 1 ? 0.55 : 0.89;   // the last line of a paragraph is short
        if (wl === 9 || wl === 18) s = 0.16;              // paragraph indents
        while (s < end) { var w = R2.range(0.035, 0.14); var e = Math.min(end, s + w); list.push([side, s, e]); s = e + R2.range(0.018, 0.03); }
      });
      WORDS.push(list);
    }

    // ================= layers =================
    var back = u.canvas(root, function (g, t) { drawBack(g, t); });
    var cam = u.el('div', { cls: 'fill', parent: root, style: { transformOrigin: '960px 640px' } });
    var coverBox = u.el('div', { cls: 'fill', parent: cam, style: { perspective: PP + 'px', perspectiveOrigin: '960px 540px', transformStyle: 'preserve-3d', opacity: 0 } });
    function coverEl() {
      return u.el('div', { cls: 'abs', parent: coverBox, style: { left: '0px', top: '0px', width: (BW + BSQ) + 'px', height: (BL + 2 * BSQ) + 'px', transformOrigin: '0px 0px',
        borderRadius: '3px', background: 'linear-gradient(90deg, #1d2a2b 0%, #172224 70%, #121b1c 100%)', boxShadow: 'inset 0 0 0 1.5px rgba(200,220,210,.08)', backfaceVisibility: 'visible' } });
    }
    var coverL = coverEl(), coverR = coverEl();
    var front = u.canvas(cam, function (g, t) { drawFront(g, t); });
    var svg = u.svg(cam, { style: 'mix-blend-mode:screen' });
    var defs = u.svgEl('defs', null, svg);
    var vig = u.el('div', { cls: 'fill', parent: root, style: { pointerEvents: 'none' } });
    var black = u.el('div', { cls: 'fill', parent: root, style: { background: '#000', opacity: 0 } });
    var hud = u.el('div', { cls: 'fill', parent: root });

    // ================= the lamp: body (canvas) and cone (SVG, MorphSVG into the slit) =================
    var LAMP = { base: [1585, 772], elbow: [1650, 505], head: [1452, 334] };
    var AX = [-0.845, 0.534], NRM = [0.534, 0.845];
    var MC = [LAMP.head[0] + AX[0] * 52, LAMP.head[1] + AX[1] * 52];   // mouth centre of the shade
    var PC = [960, 690];
    var SEAM = { x: 960, top: 360, bot: 850 };
    var CONE = [{ m: 56, rx: 520, ry: 200, a: 0.5 }, { m: 40, rx: 430, ry: 165, a: 0.7 }, { m: 26, rx: 330, ry: 125, a: 0.9 }];
    var SLITW = [11, 5, 1.6];
    var blurF = u.svgEl('filter', { id: 's07coneBlur', x: '-10%', y: '-10%', width: '120%', height: '120%' }, defs);
    u.svgEl('feGaussianBlur', { stdDeviation: 7 }, blurF);
    var lampGrad = u.svgEl('linearGradient', { id: 's07lampGrad', gradientUnits: 'userSpaceOnUse', x1: MC[0], y1: MC[1], x2: PC[0] - 120, y2: PC[1] + 40 }, defs);
    var stops = [[0, 0.5], [0.45, 0.16], [1, 0.0]].map(function (s) { return u.svgEl('stop', { offset: s[0], 'stop-color': '#f4f3ee', 'stop-opacity': s[1] }, lampGrad); });
    var coneG = u.svgEl('g', { opacity: 0, filter: 'url(#s07coneBlur)' }, svg);
    function poly(p) { return 'M' + p.map(function (q) { return q[0].toFixed(2) + ',' + q[1].toFixed(2); }).join(' L') + ' Z'; }
    var conePaths = CONE.map(function (C, i) {
      var M1 = [MC[0] - NRM[0] * C.m, MC[1] - NRM[1] * C.m], M2 = [MC[0] + NRM[0] * C.m, MC[1] + NRM[1] * C.m];
      var P1 = [PC[0] - C.rx, PC[1] - 0.35 * C.ry], P2 = [PC[0] + 0.45 * C.rx, PC[1] + C.ry];
      var w = SLITW[i], slit = [[SEAM.x - w, SEAM.top], [SEAM.x - w, SEAM.bot], [SEAM.x + w, SEAM.bot], [SEAM.x + w, SEAM.top]];
      var el = u.svgEl('path', { d: poly([M1, P1, P2, M2]), fill: 'url(#s07lampGrad)', opacity: C.a }, coneG);
      tl.to(el, { morphSVG: { shape: poly(slit), shapeIndex: 0 }, duration: T_SLAM - T_FALL, ease: 'power4.in' }, T_FALL);
      return el;
    });
    tl.to(lampGrad, { attr: { x1: SEAM.x, y1: SEAM.top, x2: SEAM.x, y2: SEAM.bot }, duration: T_SLAM - T_FALL, ease: 'power4.in' }, T_FALL);
    [[0, 0.22], [0.5, 0.95], [1, 0.3]].forEach(function (s, i) {
      tl.to(stops[i], { attr: { offset: s[0], 'stop-opacity': s[1] }, duration: T_SLAM - T_FALL, ease: 'power4.in' }, T_FALL);
    });
    function lampL(t) {   // the lamp's light 0..1 (on at Am with two 32nd flickers; trembles on 16ths; caught at the slam)
      if (t < T_AM) return 0;
      var x = t - T_AM, L;
      if (x < S32) L = 0.7 * x / S32;
      else if (x < 2 * S32) L = lerp(0.7, 0.22, (x - S32) / S32);
      else L = lerp(0.22, 1, eP2o(clamp((x - 2 * S32) / 0.28, 0, 1)));
      if (t >= T_REACH && t < T_SLAM) L *= 1 + (0.05 + 0.06 * eB(t)) * (tick(t, S16, T_REACH, 0.045) - 0.35) * (1 - seg(t, T_FALL, T_SLAM));
      return L * (1 - eP4i(seg(t, T_FALL, T_SLAM)));
    }

    // seam (the trapped light) intensity
    function seamI(t) {
      if (t < T_FALL + 0.3 || t >= T_BLACK) return 0;
      var close = eP4i(seg(t, T_FALL + 0.3, T_SLAM)), en = eB(t), I;
      if (t < T_SLAM) return 0.7 * close;
      var x = t - T_SLAM;
      I = 0.62 + 0.38 * Math.exp(-x / 0.22) + 0.12 * en * u.beatPulse(t, 0.2);
      if (t >= T_DARK && t < T_F32) I = 0.3 + (0.55 + 0.25 * en) * tick(t, S16, T_DARK, 0.05) + 0.1 * seg(t, T_DARK, T_F32);
      else if (t >= T_F32) I = 0.38 + (0.6 + 0.3 * en) * tick(t, S32, T_F32, 0.028);
      return I;
    }

    // ================= per frame: camera, covers, cone, vignette =================
    function shake(t) { var x = t - T_SLAM; if (x < 0 || x > 0.8) return { s: 0, x: 0, y: 0 }; var k = Math.exp(-x / 0.14); return { s: 0.02 * k, x: 7 * k * Math.sin(x * 71), y: 5 * k * Math.sin(x * 53 + 1.3) }; }
    function coverMatrix(side, th) {
      // div local (x, y) -> view space: x along the width (0 at the gutter), y along the spine (top = far end)
      function P(x, y) {
        var r = th * Math.PI / 180, yy = BTC - HTOP, xr = x * Math.cos(r) - yy * Math.sin(r), yr = x * Math.sin(r) + yy * Math.cos(r);
        return bookView(side * xr, -BL / 2 - BSQ + y, yr + HTOP - HTOP * (1 - Math.cos(r)));
      }
      var O = P(0, 0), A = P(1, 0), B = P(0, 1);
      var ex = [A[0] - O[0], A[1] - O[1], A[2] - O[2]], ey = [B[0] - O[0], B[1] - O[1], B[2] - O[2]];
      var ez = [ex[1] * ey[2] - ex[2] * ey[1], ex[2] * ey[0] - ex[0] * ey[2], ex[0] * ey[1] - ex[1] * ey[0]];
      var n = Math.hypot(ez[0], ez[1], ez[2]) || 1; ez = ez.map(function (v) { return v / n; });
      return 'matrix3d(' + [ex[0], ex[1], ex[2], 0, ey[0], ey[1], ey[2], 0, ez[0], ez[1], ez[2], 0, O[0], O[1], O[2], 1].map(function (v) { return (+v).toFixed(5); }).join(',') + ')';
    }
    u.onFrame(function (t) {
      // camera: slow push towards the book from Am, the slam shake
      var push = 0.05 * eSine(seg(t, T_AM, T_SLAM)) + 0.36 * eP2io(seg(t, T_SLAM + 0.1, T_BLACK)), sh = shake(t);
      cam.style.transform = 'translate(' + sh.x.toFixed(2) + 'px,' + sh.y.toFixed(2) + 'px) scale(' + (1 + push + sh.s).toFixed(5) + ')';
      // covers
      var th = thetaAt(t), ca = eP2o(seg(t, 8.6, 9.3)) * (1 - seg(t, T_DARK, T_DARK + 0.5));
      coverBox.style.opacity = ca.toFixed(4);
      coverBox.style.visibility = ca > 0.002 ? 'visible' : 'hidden';
      coverR.style.transform = coverMatrix(1, th); coverL.style.transform = coverMatrix(-1, th);   // always written: no stale state
      // the cone (opacity only; its shape belongs to the morph tweens)
      var L = lampL(t), slitOn = seg(t, T_FALL + 0.25, T_SLAM), si = seamI(t);
      var ca2 = Math.max(L * 0.85, slitOn * 0.9 * (t < T_SLAM ? 1 : si));
      coneG.setAttribute('opacity', (t >= T_BLACK ? 0 : ca2).toFixed(4));
      // vignette closing in on the seam
      var R = t < T_SLAM ? 1700 : t < T_DARK ? lerp(1700, 1000, eSine(seg(t, T_SLAM, T_DARK))) : lerp(1000, 230, eP2i(seg(t, T_DARK, T_BLACK)));
      var va = t < T_SLAM ? 0 : 0.95;
      var css = va ? 'radial-gradient(circle at 960px 600px, rgba(0,0,0,0) ' + (R * 0.42).toFixed(1) + 'px, rgba(0,0,0,' + va + ') ' + R.toFixed(1) + 'px)' : 'none';
      if (vig.__c !== css) { vig.style.background = css; vig.__c = css; }
    });
    tl.set(black, { opacity: 1 }, T_BLACK);

    // ================= drawing: back canvas =================
    function bgCol(t) {
      var k1 = seg(t, 0, T_AM, eSine), k2 = seg(t, T_AM, T_SLAM, eSine), k3 = seg(t, T_SLAM, T_BLACK, eP2i);
      var c = mixRgb([10, 22, 34], [7, 14, 20], k1); c = mixRgb(c, [5, 9, 12], k2); return mixRgb(c, [2, 3, 4], k3);
    }
    function resetCtx(g) { g.lineCap = 'butt'; g.lineJoin = 'miter'; g.setLineDash([]); g.lineDashOffset = 0; g.lineWidth = 1; g.shadowBlur = 0; g.shadowColor = 'rgba(0,0,0,0)'; g.imageSmoothingEnabled = true; g.imageSmoothingQuality = 'high'; }
    function drawBack(g, t) {
      resetCtx(g);
      if (t >= T_BLACK) return;
      var en6 = eN(t), en = eB(t), bc = bgCol(t);
      g.fillStyle = rgba(bc, 1); g.fillRect(0, 0, W, H);
      // the soft glow of s06 (#13293a), darkened and desaturated
      var ga = (1 - seg(t, 0, T_SLAM, eSine) * 0.85) * (1 - seg(t, T_SLAM, T_DARK));
      if (ga > 0.01) {
        var gg = g.createRadialGradient(960, 540, 0, 960, 540, 1114);
        var gc = mixRgb([19, 41, 58], [14, 26, 30], seg(t, 0, T_AM));
        gg.addColorStop(0, rgba(gc, ga)); gg.addColorStop(0.74, rgba(gc, 0)); gg.addColorStop(1, rgba(gc, 0));
        g.save(); g.translate(960, 540); g.scale(1, 0.5045); g.translate(-960, -540); g.fillStyle = gg; g.fillRect(-200, -600, W + 400, H * 2 + 1200); g.restore();
      }
      if (t < 3.0) drawMap(g, t, en6);
      drawDust(g, t, en6);
      if (t >= T_AM - 0.01) { drawDesk(g, t, en); drawLampBody(g, t); drawLearner(g, t, false); }
    }
    function drawMap(g, t, en) {
      var M = mapM(t), t6 = T6 + Math.max(0, t), fadeAll = 1 - seg(t, 0.4, 2.6, eP2io);
      if (fadeAll <= 0.002) return;
      g.globalCompositeOperation = 'lighter';
      // rays from the (now empty) centre
      var rayA = (0.012 + 0.03 + 0.025 * EXT) * (0.75 + 0.5 * en) * M.a * (1 - seg(t, 0, 1.4, eP2o));
      if (rayA > 0.002) {
        for (var r = 0; r < 14; r++) {
          var ang = r / 14 * Math.PI * 2 + t6 * 0.05 + 0.3 * Math.sin(r * 2.3), len = 900 * M.s, half = 0.035 + 0.02 * ((r * 7) % 3) / 2;
          var lg = g.createRadialGradient(M.cx, M.cy, 40 * M.s, M.cx, M.cy, len);
          lg.addColorStop(0, rgba(C_AMBER, rayA * (r % 2 ? 0.7 : 1.2))); lg.addColorStop(1, rgba(C_AMBER, 0));
          g.fillStyle = lg; g.beginPath(); g.moveTo(M.cx, M.cy);
          g.lineTo(M.cx + Math.cos(ang - half) * len, M.cy + Math.sin(ang - half) * len * 0.75);
          g.lineTo(M.cx + Math.cos(ang + half) * len, M.cy + Math.sin(ang + half) * len * 0.75); g.closePath(); g.fill();
        }
      }
      // orbits
      g.globalCompositeOperation = 'source-over';
      [[1, 0.07], [1.32, 0.045]].forEach(function (o) {
        g.strokeStyle = rgba([150, 190, 210], o[1] * M.a * fadeAll); g.lineWidth = 1.2; g.beginPath();
        for (var s = 0; s <= 96; s++) { var a = s / 96 * Math.PI * 2, p = project(ERX * o[0] * Math.cos(a), ERY * o[0] * Math.sin(a), 0, M); if (s) g.lineTo(p[0], p[1]); else g.moveTo(p[0], p[1]); }
        g.stroke();
      });
      // the amber lines go dark one by one (16ths): stars first, then the meteor rays
      g.globalCompositeOperation = 'lighter';
      var li = 0;
      function lineFade(i) { return (1 - 0.88 * eP2o(seg(t, i * S16, i * S16 + 0.35))) * fadeAll; }
      for (var i = 0; i < STARS.length; i++, li++) {
        var p = project(STARS[i].mx, STARS[i].my, STARS[i].mz, M), e = endOnWord(p[0], p[1], M);
        strokeLine(g, p[0], p[1], e[0], e[1], 0.6 * M.a * lineFade(li), en);
        if (t6 > STARS[i].born + 0.4) {   // s06's ambient pulses riding the lines in
          var bt = Math.floor((t6 - STARS[i].born) / BEAT), ph = (t6 - STARS[i].born) / BEAT - bt;
          if (u.hash(bt * 13 + i, 's06amb') < 0.32 + 0.3 * en) {
            var pp = eP2io(clamp(ph / 0.9, 0, 1));
            g.globalAlpha = clamp(0.7 * Math.sin(Math.PI * clamp(ph / 0.9, 0, 1)) * M.a * lineFade(li), 0, 1);
            g.drawImage(SPR_AMBER, lerp(p[0], e[0], pp) - 9, lerp(p[1], e[1], pp) - 9, 18, 18);
            g.globalAlpha = 1;
          }
        }
      }
      for (var m = 0; m < METEORS.length; m++, li++) {
        var me = METEORS[m], e1 = endOnWord(me.ox, me.oy, M), fade = 0.55 * (1 - 0.6 * seg(t6, me.arrive, me.arrive + 1.2, eP2o));
        strokeLine(g, me.ox, me.oy - (CY0 - M.cy) * 0.3, e1[0], e1[1], fade * M.a * lineFade(li), en);
      }
      // bloom at the centre, dimming
      var bloom = (0.1 + 0.3 + 0.18 * EXT) * (0.85 + 0.3 * en) * M.a * (1 - seg(t, 0, 1.8, eP2o));
      glowDisc(g, M.cx, M.cy, (500 + 120 * EXT) * M.s, C_AMBER, bloom * 0.55);
      glowDisc(g, M.cx, M.cy, 230 * M.s, C_GOLD, bloom * 0.6);
      // shock rings still travelling
      for (var a2 = 1; a2 < ARR.length; a2++) {
        var x = t6 - ARR[a2]; if (x < 0 || x > 0.9) continue;
        var rr = (275 + 330 * eP3o(x / 0.9)) * M.s;
        g.strokeStyle = rgba(C_AMBER, 0.4 * (1 - x / 0.9) * M.a); g.lineWidth = 1.6;
        g.beginPath(); g.ellipse(M.cx, M.cy, rr, rr * 0.36, 0, 0, Math.PI * 2); g.stroke();
      }
      // stars
      li = 0;
      for (var k = 0; k < STARS.length; k++, li++) {
        var S = STARS[k], q = project(S.mx, S.my, S.mz, M), kz = q[2], age = t6 - S.born, ign = age >= 0 ? pulse(age, 0.02, 0.35) : 0;
        var tw = 0.8 + 0.2 * Math.sin(S.ph + t6 * 2.3) + 0.35 * en * u.beatPulse(t + S.ph * 0.05, 0.2);
        var sa = M.a * (0.25 + 0.75 * lineFade(li)) * fadeAll, sz = (3.2 + 2.2 * ign + 0.6 * en) * clamp(kz, 0.85, 1.2);
        glowDisc(g, q[0], q[1], (26 + 60 * ign) * kz, C_GOLD, (0.35 + 0.6 * ign) * tw * sa);
        g.globalAlpha = clamp(sa * tw, 0, 1); g.drawImage(SPR_W, q[0] - sz * 3, q[1] - sz * 3, sz * 6, sz * 6);
        var fl = (14 + 40 * ign + 6 * en) * kz;
        g.globalAlpha = clamp(0.5 * tw * sa, 0, 1); g.drawImage(SPR_W, q[0] - fl, q[1] - 1.2, fl * 2, 2.4); g.drawImage(SPR_W, q[0] - 1.2, q[1] - fl * 0.8, 2.4, fl * 1.6);
        g.globalAlpha = 1;
      }
      g.globalCompositeOperation = 'source-over';
    }
    function drawDust(g, t, en) {
      var M = mapM(Math.min(t, 3)), t6 = T6 + Math.max(0, t), cs = Math.cos(M.th), sn = Math.sin(M.th);
      var fade = 1 - 0.75 * seg(t, 0, T_AM, eSine);
      if (t > T_SLAM) fade *= 1 - seg(t, T_SLAM, T_DARK);
      if (fade <= 0.01) return;
      g.globalCompositeOperation = 'lighter';
      for (var i = 0; i < DUST.length; i++) {
        var d = DUST[i], yy = ((d.y - d.vy * t6 + 760) % 1520 + 1520) % 1520 - 760;
        var x = d.x * cs + d.z * sn, z = -d.x * sn + d.z * cs, k = FOCAL / (FOCAL + z);
        var sx = 960 + x * k, sy = 540 + yy * k;
        if (sx < -20 || sx > W + 20 || sy < -20 || sy > H + 20) continue;
        var tw = 0.55 + 0.45 * Math.sin(d.ph + t6 * d.fq * 6.283);
        var a = d.a * tw * (0.45 + 0.4 * en) * clamp(k, 0.4, 1.3) * 0.6 * fade, rr = d.r * k * (1 + 0.3 * en);
        g.globalAlpha = clamp(a, 0, 1);
        g.drawImage(d.warm ? SPR_AMBER : (t < 1.5 ? SPR_ICE : SPR_TL), sx - rr * 3, sy - rr * 3, rr * 6, rr * 6);
      }
      g.globalAlpha = 1; g.globalCompositeOperation = 'source-over';
    }
    // the desk: light pool of the lamp and the book's shadow
    function drawDesk(g, t, en) {
      var L = lampL(t), pa = eP2o(seg(t, T_AM, 8.2));
      if (L > 0.003) {
        g.save(); g.translate(PC[0], PC[1]); g.scale(1, 0.36);
        var pg = g.createRadialGradient(0, 0, 0, 0, 0, 760);
        pg.addColorStop(0, rgba(C_NEUT, 0.17 * L)); pg.addColorStop(0.45, rgba(C_NEUT, 0.07 * L)); pg.addColorStop(1, rgba(C_NEUT, 0));
        g.fillStyle = pg; g.fillRect(-800, -800, 1600, 1600); g.restore();
      }
      // the book's shadow (light from the upper right) and a contact shadow
      var sa = eP2o(seg(t, 8.5, 9.3)) * (0.35 + 0.5 * L);
      if (sa > 0.003) {
        g.save(); g.translate(905, 722); g.scale(1, 0.32);
        var sg = g.createRadialGradient(0, 0, 0, 0, 0, 420);
        sg.addColorStop(0, 'rgba(0,0,0,' + (0.55 * sa).toFixed(3) + ')'); sg.addColorStop(0.7, 'rgba(0,0,0,' + (0.3 * sa).toFixed(3) + ')'); sg.addColorStop(1, 'rgba(0,0,0,0)');
        g.fillStyle = sg; g.fillRect(-440, -440, 880, 880); g.restore();
      }
      // after the slam: a thin pool of slit light on the desk
      var si = seamI(t);
      if (si > 0.003 && t >= T_SLAM - 0.05) {
        g.save(); g.translate(960, 840); g.scale(1, 0.18);
        var cg = g.createRadialGradient(0, 0, 0, 0, 0, 260);
        cg.addColorStop(0, rgba([240, 232, 214], 0.22 * si)); cg.addColorStop(1, rgba([240, 232, 214], 0));
        g.fillStyle = cg; g.fillRect(-280, -280, 560, 560); g.restore();
      }
    }
    function drawLampBody(g, t) {
      var a = seg(t, T_AM, T_AM + 0.3) * (1 - 0.85 * eP2o(seg(t, T_SLAM, T_SLAM + 0.5))) * (1 - seg(t, T_DARK, T_DARK + 0.45)), L = lampL(t);
      if (a <= 0.003) return;
      var lit = 0.25 + 0.75 * L, rim = rgba([200, 204, 200], (0.3 + 0.35 * L) * a);
      g.lineCap = 'round'; g.lineJoin = 'round';
      // base
      g.fillStyle = rgba([14, 18, 20], a); g.strokeStyle = rim; g.lineWidth = 2;
      g.beginPath(); g.ellipse(LAMP.base[0], LAMP.base[1], 74, 15, 0, 0, Math.PI * 2); g.fill(); g.stroke();
      // arms (two thin parallel rods)
      g.strokeStyle = rgba([150, 156, 152], (0.35 + 0.4 * L) * a); g.lineWidth = 4;
      g.beginPath(); g.moveTo(LAMP.base[0], LAMP.base[1] - 6); g.lineTo(LAMP.elbow[0], LAMP.elbow[1]); g.lineTo(LAMP.head[0], LAMP.head[1]); g.stroke();
      g.strokeStyle = rgba([80, 86, 84], 0.8 * a); g.lineWidth = 2;
      g.beginPath(); g.moveTo(LAMP.base[0] + 10, LAMP.base[1] - 8); g.lineTo(LAMP.elbow[0] + 9, LAMP.elbow[1] + 4); g.lineTo(LAMP.head[0] + 8, LAMP.head[1] + 7); g.stroke();
      g.fillStyle = rgba([110, 116, 112], a); g.beginPath(); g.arc(LAMP.elbow[0], LAMP.elbow[1], 6, 0, Math.PI * 2); g.fill();
      // the shade: a dome opening towards the book, with an elliptical mouth
      var hw1 = 58, p3 = [MC[0] + NRM[0] * hw1, MC[1] + NRM[1] * hw1], p4 = [MC[0] - NRM[0] * hw1, MC[1] - NRM[1] * hw1];
      var cb = [MC[0] - AX[0] * 165, MC[1] - AX[1] * 165];
      var sg = g.createLinearGradient(p4[0], p4[1], p3[0], p3[1]);
      sg.addColorStop(0, rgba([70, 76, 74], a)); sg.addColorStop(0.6, rgba([34, 38, 39], a)); sg.addColorStop(1, rgba([16, 19, 20], a));
      g.fillStyle = sg; g.strokeStyle = rgba([214, 214, 208], (0.22 + 0.4 * L) * a); g.lineWidth = 2;
      g.beginPath(); g.moveTo(p4[0], p4[1]); g.quadraticCurveTo(cb[0], cb[1], p3[0], p3[1]); g.closePath(); g.fill(); g.stroke();
      g.save(); g.translate(MC[0], MC[1]); g.rotate(Math.atan2(NRM[1], NRM[0]));
      g.fillStyle = rgba(mixRgb([30, 33, 34], [250, 250, 244], L), a); g.beginPath(); g.ellipse(0, 0, hw1, 13, 0, 0, Math.PI * 2); g.fill();
      g.strokeStyle = rgba([220, 220, 214], (0.3 + 0.5 * L) * a); g.lineWidth = 1.6; g.stroke(); g.restore();
      // bulb glow in the mouth
      if (L > 0.003) {
        g.globalCompositeOperation = 'lighter';
        glowDisc(g, MC[0] + AX[0] * 8, MC[1] + AX[1] * 8, 130, C_NEUT, 0.3 * L * a);
        glowDisc(g, MC[0] + AX[0] * 4, MC[1] + AX[1] * 4, 40, [255, 255, 250], 0.7 * L * a);
        g.globalCompositeOperation = 'source-over';
      }
      g.lineWidth = 1;
    }
    // the faceless learner (s05's single-line figure, scaled 1.8), seated behind the book: everything is drawn behind
    // the book, so the open pages hide the hands' rest and the closed book hides the arms that pressed it shut
    var HEAD = { x: 960, y: 300, r: 40 };
    var SHO = [960, 398], SHW = 42, ARM1 = 138, ARM2 = 138;
    function learnA(t) { return eP2o(seg(t, 7.65, 8.6)) * (1 - eP2i(seg(t, T_FALL + 0.1, T_SLAM - 0.04))); }
    function handPos(side, t) {
      var th = thetaAt(t), reach = eP3io(seg(t, T_REACH, T_REACH + 0.6));
      var grip = bookPt(side, 1.035, hf(0.6), -BL / 2 + 34, th, hf(0.6)), rest = bookPt(side, 0.5, hf(1), -BL / 2 + 46, 0, hf(1));
      var k = reach * (1 - eP2io(clamp((th - 22) / 40, 0, 1)));   // the hands let go while the halves fly up
      return [lerp(rest[0], grip[0], k), lerp(rest[1], grip[1], k) - 10 * Math.sin(Math.PI * reach)];
    }
    function elbow(S, Hn, side) {
      var dx = Hn[0] - S[0], dy = Hn[1] - S[1], d = Math.hypot(dx, dy), L = ARM1 + ARM2;
      if (d >= L - 0.5) return [S[0] + dx * ARM1 / L, S[1] + dy * ARM1 / L];
      var a = (ARM1 * ARM1 - ARM2 * ARM2 + d * d) / (2 * d), h = Math.sqrt(Math.max(0, ARM1 * ARM1 - a * a));
      var ux = dx / d, uy = dy / d, px = -uy, py = ux;   // bend outwards (elbows away from the body)
      if (px * side < 0) { px = -px; py = -py; }
      return [S[0] + ux * a + px * h, S[1] + uy * a + py * h];
    }
    function drawLearner(g, t) {
      var a = learnA(t); if (a <= 0.003) return;
      var L = lampL(t), br = Math.sin(t * 1.7) * 1.4, lit = 0.55 + 0.45 * L;
      var col = mixRgb([170, 160, 144], C_WARMW, lit), sa = (0.45 + 0.4 * lit) * a;
      g.lineCap = 'round'; g.lineJoin = 'round';
      var sh = [SHO[0], SHO[1] + br];
      // spine, fading into the dark behind the book
      var sg = g.createLinearGradient(0, sh[1], 0, 520);
      sg.addColorStop(0, rgba(col, sa)); sg.addColorStop(0.75, rgba(col, sa * 0.35)); sg.addColorStop(1, rgba(col, 0));
      g.strokeStyle = sg; g.lineWidth = 3.5;
      g.beginPath(); g.moveTo(sh[0], HEAD.y + HEAD.r + 6 + br); g.lineTo(sh[0], sh[1]); g.quadraticCurveTo(sh[0] + 3, 470, sh[0] - 2, 520); g.stroke();
      g.strokeStyle = rgba(col, sa);
      g.beginPath(); g.moveTo(sh[0] - SHW, sh[1] + 8); g.quadraticCurveTo(sh[0], sh[1] - 6, sh[0] + SHW, sh[1] + 8); g.stroke();
      if (thetaAt(t) >= 40) drawArms(g, t);
      // the head: a glowing orb at 25 %
      drawHead(g, t, a, br);
    }
    function drawArms(g, t) {
      var a = learnA(t); if (a <= 0.003) return;
      var L = lampL(t), br = Math.sin(t * 1.7) * 1.4, lit = 0.55 + 0.45 * L;
      var col = mixRgb([170, 160, 144], C_WARMW, lit), sa = (0.45 + 0.4 * lit) * a, sh = [SHO[0], SHO[1] + br];
      g.lineCap = 'round'; g.lineJoin = 'round';
      [-1, 1].forEach(function (side) {
        var S = [sh[0] + side * SHW, sh[1] + 8], Hn = handPos(side, t), El = elbow(S, Hn, side);
        g.strokeStyle = rgba(col, sa); g.lineWidth = 3.5;
        g.beginPath(); g.moveTo(S[0], S[1]); g.lineTo(El[0], El[1]); g.lineTo(Hn[0], Hn[1]); g.stroke();
        g.fillStyle = rgba(col, sa); g.beginPath(); g.arc(Hn[0], Hn[1], 5, 0, Math.PI * 2); g.fill();
        if (L > 0.01 && side > 0) {   // the lamp catches the right arm
          g.strokeStyle = rgba(C_NEUT, 0.22 * L * a); g.lineWidth = 7;
          g.beginPath(); g.moveTo(S[0], S[1]); g.lineTo(El[0], El[1]); g.lineTo(Hn[0], Hn[1]); g.stroke();
        }
      });
    }
    function drawHead(g, t, a, br) {
      var hy = HEAD.y + br * 0.8, hb = 0.25 * (1 + 0.15 * eB(t) * u.beatPulse(t, 0.3));
      g.globalCompositeOperation = 'lighter';
      glowDisc(g, HEAD.x, hy, 170, [232, 200, 150], 0.5 * hb * a);
      glowDisc(g, HEAD.x, hy, 64, [246, 220, 176], 0.9 * hb * a);
      g.globalCompositeOperation = 'source-over';
      var hg2 = g.createRadialGradient(HEAD.x - 10, hy - 12, 2, HEAD.x, hy, HEAD.r);
      hg2.addColorStop(0, rgba([252, 240, 218], (0.3 + 1.2 * hb) * a)); hg2.addColorStop(0.55, rgba([226, 196, 148], (0.2 + 0.9 * hb) * a)); hg2.addColorStop(1, rgba([168, 138, 98], (0.14 + 0.6 * hb) * a));
      g.fillStyle = hg2; g.beginPath(); g.arc(HEAD.x, hy, HEAD.r, 0, Math.PI * 2); g.fill();
      g.strokeStyle = rgba([250, 236, 210], 0.22 * a); g.lineWidth = 1.5; g.stroke();
    }

    // ================= drawing: front canvas =================
    function drawFront(g, t) {
      resetCtx(g);
      if (t >= T_BLACK) return;
      var en = eB(t);
      if (t >= T_G && t < T_AM) drawRidge(g, t, en);
      if (t < T_G + 0.9) drawHeroA(g, t, en);
      if (t >= T_AM - 1e-6) drawBook(g, t, en);
      if (t >= T_AM - 0.01 && thetaAt(t) < 40) drawArms(g, t);
      if (t < T_AM) drawDotFree(g, t);
      drawParticles(g, t, en);
      if (t >= T_FALL) drawSeam(g, t, en);
      if (t < 4.5) drawBokeh(g, t, eN(t));
    }
    // A: the full-screen timeline with drained regions and leaking drops
    function drawHeroA(g, t, en) {
      var pts = heroPts(t), a = t < T_G ? 1 : 1 - seg(t, T_G, T_G + 0.9), last = pts[pts.length - 1];
      var b0 = heroBase(TS, t), b1 = heroBase(tauNow(t), t);
      // axis
      g.strokeStyle = rgba(C_TLINE, 0.12 * a); g.lineWidth = 1.2;
      g.beginPath(); g.moveTo(b0[0], b0[1] + 0.5); g.lineTo(Math.max(b1[0], heroBase(T6, t)[0]), b1[1] + 0.5); g.stroke();
      // kept water: soft teal fill under the curve
      var top = heroPt(TS, 1, t)[1];
      var fg = g.createLinearGradient(0, top, 0, b0[1]);
      var kz = seg(t, 0, T_ZOOM);
      fg.addColorStop(0, rgba(C_TLINE, lerp(0.16, 0.18, kz) * a)); fg.addColorStop(1, rgba(C_TLINE, lerp(0, 0.015, kz) * a));
      g.fillStyle = fg; g.beginPath(); g.moveTo(pts[0][0], b0[1]);
      for (var i = 0; i < pts.length; i++) g.lineTo(pts[i][0], pts[i][1]);
      g.lineTo(last[0], b1[1]); g.closePath(); g.fill();
      // lost water
      for (var r = 0; r < REG.length; r++) drawRegion(g, t, REG[r], a);
      // the line
      g.globalCompositeOperation = 'lighter'; g.lineJoin = 'round'; g.lineCap = 'round';
      g.beginPath(); for (var k = 0; k < pts.length; k++) { if (k) g.lineTo(pts[k][0], pts[k][1]); else g.moveTo(pts[k][0], pts[k][1]); }
      var dim = 1 - 0.35 * seg(t, 0, T_G), la = t < T_G ? 1 : 0;
      g.strokeStyle = rgba(C_TLINE, 0.18 * la * dim * (0.8 + 0.4 * en)); g.lineWidth = 9; g.stroke();
      g.strokeStyle = rgba(C_TLINE, 0.95 * la * dim); g.lineWidth = lerp(2.6, 3, seg(t, 0, T_ZOOM)); g.stroke();
      g.globalCompositeOperation = 'source-over';
    }
    function drawRegion(g, t, Rg, a) {
      var p = eP2o(seg(t, Rg.ts, Rg.ts + 0.35)); if (p <= 0.002) return;
      var tb = Rg.last ? tauNow(t) : Rg.tb; if (tb <= Rg.ta + DT) return;
      var lvl = [], crv = [], n = Math.max(2, Math.ceil((tb - Rg.ta) / DT));
      for (var i = 0; i <= n; i++) { var tau = Rg.ta + (tb - Rg.ta) * i / n; lvl.push(heroPt(tau, Rg.P, t)); crv.push(heroPt(tau, heroValue(tau), t)); }
      // dark, hatched space where the water was
      g.save();
      g.beginPath(); g.moveTo(lvl[0][0], lvl[0][1]);
      for (var k = 1; k <= n; k++) g.lineTo(lvl[k][0], lvl[k][1]);
      for (var k2 = n; k2 >= 0; k2--) g.lineTo(lerp(lvl[k2][0], crv[k2][0], p), lerp(lvl[k2][1], crv[k2][1], p));
      g.closePath();
      g.fillStyle = rgba(C_LOST, 0.6 * a); g.fill();
      g.clip();
      var x0 = lvl[0][0], x1 = lvl[n][0], y0 = lvl[0][1] - 4, y1 = Math.max(crv[0][1], crv[n][1]) + 400;
      g.strokeStyle = rgba(C_TLINE, 0.17 * a); g.lineWidth = 1.2; g.beginPath();
      for (var hx = x0 - (y1 - y0); hx < x1 + 10; hx += 11) { g.moveTo(hx, y1); g.lineTo(hx + (y1 - y0), y0); }
      g.stroke(); g.restore();
      // the ghost of the old level (dashed)
      g.save(); g.setLineDash([7, 8]); g.strokeStyle = rgba(C_TLINE, 0.5 * a * p); g.lineWidth = 1.6;
      g.beginPath(); g.moveTo(lvl[0][0], lvl[0][1]); g.lineTo(lerp(lvl[0][0], lvl[n][0], p), lvl[n][1]); g.stroke(); g.restore();
      // drops leaking out of the bottom
      var bx = crv[n][0], base = heroBase(tb, t)[1];
      for (var d = 0; d < 4; d++) {
        var x = t - Rg.ts - d * 0.09 - 0.05; if (x < 0 || x > 0.75) continue;
        var dy = 0.5 * 1500 * x * x, ox = bx - 6 - d * 7 * ((d % 2) ? 1 : -0.6), da = (1 - x / 0.75) * 0.75 * a;
        var len = 4 + 0.03 * 1500 * x;
        var lg = g.createLinearGradient(ox, base + dy - len, ox, base + dy);
        lg.addColorStop(0, rgba(C_TLINE, 0)); lg.addColorStop(1, rgba(C_TLINE, da));
        g.strokeStyle = lg; g.lineWidth = 2.4; g.lineCap = 'round';
        g.beginPath(); g.moveTo(ox, base + 4 + dy - len); g.lineTo(ox, base + 4 + dy); g.stroke();
      }
    }
    // B: the perspective ridgeline (far to near with occlusion), the hero in front
    function drawRidge(g, t, en) {
      var occA = 1 - seg(t, 6.9, T_AM, eSine), c = camB(t), occ = '#000';   // erased (destination-out): the back canvas shows through
      g.lineJoin = 'round'; g.lineCap = 'round';
      for (var i = ROWS.length - 1; i >= 0; i--) {
        var Rw = ROWS[i], tb = rowTime(Rw); if (t < tb) continue;
        var df = eP2o(seg(t, tb, tb + 0.32)), ra = seg(t, tb, tb + 0.1);
        var P = rowPts(Rw, t, Math.max(0.02, df)), pts = P.pts;
        var fog = Math.pow(Rw.j / NR, 0.7);
        // occlusion
        g.globalCompositeOperation = 'destination-out'; g.globalAlpha = occA; g.fillStyle = occ; g.beginPath(); g.moveTo(P.b0[0], P.b0[1]);
        for (var k = 0; k < pts.length; k++) g.lineTo(pts[k][0], pts[k][1]);
        g.lineTo(P.b1[0], P.b1[1]); g.closePath(); g.fill(); g.globalAlpha = 1; g.globalCompositeOperation = 'source-over';
        // line
        var hit = tick(t, S16, tb, 0.12) * (t - tb < S16 ? 1 : 0);
        var col = mixRgb([88, 170, 158], [34, 70, 72], fog), la = lerp(0.85, 0.2, fog) * ra * (0.85 + 0.2 * en + 0.6 * hit);
        g.strokeStyle = rgba(col, la); g.lineWidth = lerp(1.6, 0.8, fog);
        g.beginPath(); for (var k2 = 0; k2 < pts.length; k2++) { if (k2) g.lineTo(pts[k2][0], pts[k2][1]); else g.moveTo(pts[k2][0], pts[k2][1]); }
        g.stroke();
        // the row's own small light at its "now" end
        var e = pts[pts.length - 1], va = Rw.V[Math.min(Rw.V.length - 1, Math.round((tauNow(t) - TS) / RDT))];
        g.globalCompositeOperation = 'lighter'; g.globalAlpha = clamp(0.5 * va * (1 - fog) * ra * df, 0, 1);
        var ds = 6 * (1 - 0.6 * fog); g.drawImage(SPR_TL, e[0] - ds, e[1] - ds, ds * 2, ds * 2);
        g.globalAlpha = 1; g.globalCompositeOperation = 'source-over';
      }
      // the hero (row 0) in front: occlusion and its line
      var hp = heroPts(t), hb0 = heroBase(TS, t), hb1 = heroBase(tauNow(t), t), ha = seg(t, T_G, T_G + 0.5);
      g.globalCompositeOperation = 'destination-out'; g.globalAlpha = occA * ha; g.fillStyle = occ; g.beginPath(); g.moveTo(hb0[0], hb0[1]);
      for (var h = 0; h < hp.length; h++) g.lineTo(hp[h][0], hp[h][1]);
      g.lineTo(hb1[0], hb1[1]); g.closePath(); g.fill(); g.globalAlpha = 1;
      g.globalCompositeOperation = 'lighter';
      g.beginPath(); for (var h2 = 0; h2 < hp.length; h2++) { if (h2) g.lineTo(hp[h2][0], hp[h2][1]); else g.moveTo(hp[h2][0], hp[h2][1]); }
      var dim = 0.65 - 0.15 * sagK(t);   // = drawHeroA's 1 - 0.35 at T_G
      g.strokeStyle = rgba(C_TLINE, 0.16 * dim * (0.8 + 0.4 * en)); g.lineWidth = 8; g.stroke();
      g.strokeStyle = rgba(C_TLINE, 0.95 * dim); g.lineWidth = 2.4; g.stroke();
      g.globalCompositeOperation = 'source-over';
    }
    // the motif dot: brightness = how much is still remembered (only dims; never colder)
    function dotLook(t) {
      var b;
      if (t < T_AM) b = clamp(heroValue(tauNow(t)) / V_END6, 0.3, 1) * (t < 0.05 ? 1 : 1);
      else b = lerp(clamp(heroValue(TAU_END) / V_END6, 0.3, 1), 0.25, seg(t, T_AM, 9.4));
      return { b: b, k: clamp((b - 0.25) / 0.75, 0, 1) };
    }
    function drawDotAt(g, t, x, y, b, k, extra) {
      var halo = mixRgb([214, 168, 104], C_GOLD, k), mid = mixRgb([196, 140, 80], C_AMBER, k), core = mixRgb([226, 196, 150], [255, 236, 196], k);
      var breath = 1 + 0.1 * barPulse(t) + 0.15 * u.beatPulse(t, 0.2) * (0.3 + 0.7 * eB(t)) + (extra || 0);
      g.globalCompositeOperation = 'lighter';
      glowDisc(g, x, y, 70 + 80 * k, halo, (0.05 + 0.16 * k) * breath);
      glowDisc(g, x, y, 20 + 10 * k, mid, (0.18 + 0.38 * k) * breath);
      glowDisc(g, x, y, 9 + 2 * k, mixRgb([240, 214, 170], [255, 248, 230], k), 0.3 + 0.55 * k);
      g.globalCompositeOperation = 'source-over';
      g.globalAlpha = clamp(0.55 + 0.45 * b, 0, 1); g.fillStyle = rgba(core, 1); g.beginPath(); g.arc(x, y, 4 + 1.5 * k, 0, 6.2832); g.fill(); g.globalAlpha = 1;
    }
    function drawDotFree(g, t) {
      var tn = tauNow(t), p = heroPt(tn, heroValue(tn), t), L = dotLook(t);
      drawDotAt(g, t, p[0], p[1], L.b, L.k);
    }
    // C to F: the book
    function rowMorph(j, t, sig) {   // morph progress of row j (0 = hero) at sigma
      var dj = j === 0 ? 0.5 : 0.5 * (1 - j / NR), pd = 0.2 * (1 - Math.abs(sig));
      return eP3io(clamp((t - T_AM - dj - pd) / 0.95, 0, 1));
    }
    function morphLine(src, n, j, t, th, tgtFn) {
      var out = [];
      for (var i = 0; i < n; i++) {
        var sig = -1 + 2 * i / (n - 1), p = rowMorph(j, t, sig), q = tgtFn(sig, th);
        if (p >= 1) { out.push([q[0], q[1]]); continue; }
        var s = src[i], arc = 70 * Math.sin(Math.PI * p) * (0.4 + 0.6 * Math.abs(sig));
        out.push([lerp(s[0], q[0], p), lerp(s[1], q[1], p) - arc]);
      }
      return out;
    }
    function strokePts(g, pts) { g.beginPath(); for (var k = 0; k < pts.length; k++) { if (k) g.lineTo(pts[k][0], pts[k][1]); else g.moveTo(pts[k][0], pts[k][1]); } g.stroke(); }
    function drawBook(g, t, en) {
      var th = thetaAt(t), L = lampL(t), pa = eP2o(seg(t, 8.5, 9.3)), si = seamI(t);
      var dark = 1 - seg(t, T_DARK, T_DARK + 0.5), amb = 0.07;
      var light = function (x, y, nl) { var pool = Math.exp(-(Math.pow((x - PC[0]) / 560, 2) + Math.pow((y - PC[1]) / 230, 2))); return amb + L * (0.25 + 0.75 * nl) * (0.35 + 0.65 * pool); };
      g.lineJoin = 'round'; g.lineCap = 'round';
      if (pa > 0.003) {
        // fore-edge faces (become the top of the closed book)
        [-1, 1].forEach(function (side) {
          var a = pagePt(side, 1, 0, -BL / 2, th), b = pagePt(side, 1, 1, -BL / 2, th), c = pagePt(side, 1, 1, BL / 2, th), d = pagePt(side, 1, 0, BL / 2, th);
          var lv = light((a[0] + c[0]) / 2, (a[1] + c[1]) / 2, 0.3) * 0.85;
          g.fillStyle = rgba(mixRgb([10, 14, 15], [150, 150, 142], clamp(lv, 0, 1)), pa * dark);
          g.beginPath(); g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); g.lineTo(c[0], c[1]); g.lineTo(d[0], d[1]); g.closePath(); g.fill();
        });
        // top page surfaces: strips lit by the lamp (Lambert + pool), darker in the gutter
        var NSTRIP = 64, lampDir = [0.62, 0.78];
        [-1, 1].forEach(function (side) {
          for (var i = 0; i < NSTRIP; i++) {
            var s0 = i / NSTRIP, s1 = (i + 1) / NSTRIP;
            var a = pagePt(side, s0, 1, -BL / 2, th), b = pagePt(side, s1, 1, -BL / 2, th), c = pagePt(side, s1, 1, BL / 2, th), d = pagePt(side, s0, 1, BL / 2, th);
            var dh = (hOpen(s1, 1) - hOpen(s0, 1)) / ((s1 - s0) * BW), nx = -dh * side, ny = 1, nn = Math.hypot(nx, ny);
            var r = th * Math.PI / 180 * side, nrx = nx * Math.cos(r) - ny * Math.sin(r), nry = nx * Math.sin(r) + ny * Math.cos(r);
            var nl = clamp((nrx * lampDir[0] + nry * lampDir[1]) / nn, 0, 1);
            var ao = 0.45 + 0.55 * u.smooth(clamp(((s0 + s1) / 2) / 0.22, 0, 1));
            var lv = light((a[0] + c[0]) / 2, (a[1] + c[1]) / 2, nl) * ao;
            var col = mixRgb([12, 16, 17], [206, 205, 196], clamp(lv, 0, 1));
            g.fillStyle = rgba(col, pa * dark);
            g.beginPath(); g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); g.lineTo(c[0] + 0.4 * side, c[1]); g.lineTo(d[0], d[1]); g.closePath(); g.fill();
            g.strokeStyle = rgba(col, pa * dark); g.lineWidth = 0.8; g.stroke();
          }
        });
      }
      // text lines (rows 1..NT)
      for (var j = 1; j <= NT; j++) {
        var T = rowTarget(j), Rw = ROWS[j - 1], tb = rowTime(Rw);
        var pts = morphLine(SRC[j - 1], MS, j, t, th, function (sig, th2) { return sigmaPt(sig, 1, T.v, th2, T.lift); });
        var p = rowMorph(j, t, 0), landed = seg(t, 9.0, 9.35), fog = Math.pow(j / NR, 0.7);
        var lineA = (1 - landed) * lerp(0.85, 0.2, fog) * (1 - 0.3 * p);
        if (lineA > 0.003) { g.strokeStyle = rgba(mixRgb([88, 170, 158], C_INK, p * pa), lineA); g.lineWidth = lerp(1.6, 1.0, p); strokePts(g, pts); }
        if (landed > 0.003 && pa > 0.003) {
          var ws = WORDS[j - 1], va = landed * pa * dark;
          var mid = sigmaPt(0.5, 1, T.v, th, 0), lv2 = clamp(light(mid[0], mid[1], 0.9), 0, 1);
          g.strokeStyle = rgba(mixRgb([30, 36, 37], [70, 76, 74], 0.4 - 0.4 * lv2), 0.75 * va * (0.6 + 0.4 * lv2)); g.lineWidth = 2.1;
          for (var w = 0; w < ws.length; w++) {
            var wd = ws[w], q0 = sigmaPt(wd[0] * wd[1], 1, T.v, th, T.lift), q1 = sigmaPt(wd[0] * wd[2], 1, T.v, th, T.lift), qm = sigmaPt(wd[0] * (wd[1] + wd[2]) / 2, 1, T.v, th, T.lift);
            g.beginPath(); g.moveTo(q0[0], q0[1]); g.quadraticCurveTo(2 * qm[0] - (q0[0] + q1[0]) / 2, 2 * qm[1] - (q0[1] + q1[1]) / 2, q1[0], q1[1]); g.stroke();
          }
        }
      }
      // near face of the block (between the top page and the bottom page at the near edge)
      if (pa > 0.003) {
        [-1, 1].forEach(function (side) {
          var top = [], bot = [];
          for (var i = 0; i <= 24; i++) { var s = i / 24; top.push(pagePt(side, s, 1, BL / 2, th)); bot.push(pagePt(side, s, 0, BL / 2, th)); }
          var mid = top[12], lv = light(mid[0], mid[1], 0.45) * 0.8;
          var col = mixRgb([14, 18, 19], [168, 166, 156], clamp(lv, 0, 1));
          var gx = g.createLinearGradient(top[0][0], 0, top[24][0], 0);
          gx.addColorStop(0, rgba(mixRgb(col, [236, 230, 214], clamp(0.32 * si, 0, 1)), pa * dark));
          gx.addColorStop(0.18, rgba(mixRgb(col, [236, 230, 214], clamp(0.07 * si, 0, 1)), pa * dark));
          gx.addColorStop(1, rgba(col, pa * dark));
          g.fillStyle = gx; g.beginPath(); g.moveTo(top[0][0], top[0][1]);
          for (var k = 1; k < top.length; k++) g.lineTo(top[k][0], top[k][1]);
          for (var k2 = bot.length - 1; k2 >= 0; k2--) g.lineTo(bot[k2][0], bot[k2][1]);
          g.closePath(); g.fill();
        });
      }
      // page edges (stack rows) and the hero (top page near edge)
      for (var j2 = NT + 1; j2 < NR; j2++) {
        var T2 = rowTarget(j2);
        var pts2 = morphLine(SRC[j2 - 1], MS, j2, t, th, function (sig, th2) { return sigmaPt(sig, T2.q, T2.v, th2, 0); });
        var p2 = rowMorph(j2, t, 0), fog2 = Math.pow(j2 / NR, 0.7);
        var la = lerp(lerp(0.85, 0.2, fog2), (j2 - NT) % 3 === 0 ? 0.3 : 0.08, p2) * dark * (t >= T_SLAM ? 0.1 + 0.22 * si : 1) * (0.4 + 0.6 * Math.max(1 - pa, Math.min(1, L + 0.4)));
        g.strokeStyle = rgba(mixRgb([88, 170, 158], [196, 192, 180], p2), la); g.lineWidth = lerp(1.2, 0.7, p2); strokePts(g, pts2);
      }
      var hpts = morphLine(HSRC, MH, 0, t, th, function (sig, th2) { return sigmaPt(sig, 1, BL / 2, th2, 0); });
      var hp = rowMorph(0, t, 0);
      var hcol = mixRgb(C_TLINE, [222, 220, 210], hp), ha = (0.62 - 0.1 * hp) * dark * (t >= T_SLAM ? 0.3 + 0.7 * si : 1);
      g.globalCompositeOperation = 'lighter';
      g.strokeStyle = rgba(hcol, 0.14 * ha * (1 - hp * 0.6)); g.lineWidth = 8; strokePts(g, hpts);
      g.strokeStyle = rgba(hcol, 0.95 * ha); g.lineWidth = lerp(2.4, 1.6, hp); strokePts(g, hpts);
      g.globalCompositeOperation = 'source-over';
      // the motif dot: rides the hero to the right fore-edge, slides into the gutter, is squeezed up into the seam
      var DL = dotLook(t), dx, dy;
      var slide = eP2io(seg(t, 8.95, T_REACH)), sg = 1 - slide;
      if (hp < 1 || slide <= 0) { var e = hpts[hpts.length - 1]; dx = e[0]; dy = e[1]; }
      else { var q = sigmaPt(Math.max(0.0005, sg), 1, BL / 2, th, 0); dx = q[0]; dy = q[1]; }
      if (slide >= 1) {
        var c = th / 90, sq = eP2io(clamp((c - 0.55) / 0.45, 0, 1));
        var q2 = sigmaPt(0.0005, 1, BL / 2, th, 0), V = bookView(0, BL / 2, lerp(hg(1), BW * 0.5, sq)), P2 = persp(V[0], V[1], V[2]);
        dx = lerp(q2[0], P2[0], sq); dy = lerp(q2[1], P2[1], sq);
      }
      var flick = t >= T_SLAM ? si : 0;
      drawDotAt(g, t, dx, dy, t >= T_SLAM ? 0.25 + 0.3 * si : DL.b, t >= T_SLAM ? 0.2 * si : DL.k, 0.6 * flick);
      DOT.x = dx; DOT.y = dy;
    }
    var DOT = { x: 960, y: 715 };
    // the trapped light: the seam of the closed book (and the light squeezed into the closing gap)
    function drawSeam(g, t, en) {
      var si = seamI(t); if (si <= 0.003) return;
      var th = thetaAt(t);
      var nb = persp.apply(null, bookView(0, BL / 2, 0)), nt = persp.apply(null, bookView(0, BL / 2, BW * Math.min(1, th / 90))), ft = persp.apply(null, bookView(0, -BL / 2, BW * Math.min(1, th / 90)));
      g.globalCompositeOperation = 'lighter'; g.lineCap = 'round';
      var col = [244, 240, 228], warm = [255, 214, 160];
      // wide haze along the seam
      var cy = (ft[1] + nb[1]) / 2 + 40, ry = (nb[1] - ft[1]) / 2 + 90;
      g.save(); g.translate(960, cy); g.scale(1, ry / 70);
      var hz = g.createRadialGradient(0, 0, 0, 0, 0, 70);
      hz.addColorStop(0, rgba(col, 0.2 * si)); hz.addColorStop(0.45, rgba(col, 0.07 * si)); hz.addColorStop(1, rgba(col, 0));
      g.fillStyle = hz; g.fillRect(-70, -70, 140, 140); g.restore();
      var sgr = g.createLinearGradient(0, ft[1], 0, nb[1]), fr = clamp((nt[1] - ft[1]) / Math.max(1, nb[1] - ft[1]), 0.05, 0.95);
      sgr.addColorStop(0, rgba(col, 0)); sgr.addColorStop(fr * 0.35, rgba(col, 0.45)); sgr.addColorStop(fr, rgba(col, 0.8));
      sgr.addColorStop(fr + (1 - fr) * 0.55, rgba(col, 1)); sgr.addColorStop(0.97, rgba(col, 0.75)); sgr.addColorStop(1, rgba(col, 0.2));
      g.strokeStyle = sgr; g.lineCap = 'butt';
      [[16, 0.1], [6, 0.3], [1.8, 1]].forEach(function (L) {
        g.globalAlpha = clamp(L[1] * si, 0, 1); g.lineWidth = L[0];
        g.beginPath(); g.moveTo(nb[0], nb[1] - 1); g.lineTo(nt[0], nt[1]); g.lineTo(ft[0], ft[1]); g.stroke();
      });
      g.globalAlpha = 1;
      // the warm core where the dot is trapped
      glowDisc(g, DOT.x, DOT.y, 60 + 40 * si, warm, 0.22 * si);
      g.globalCompositeOperation = 'source-over';
      // faint outline of the closed book, lit by the slit
      if (t >= T_SLAM) {
        var oa = 0.22 * si * (1 - seg(t, T_DARK, T_DARK + 0.5));
        if (oa > 0.003) {
          var c0 = persp.apply(null, bookView(-HTOP, BL / 2, 0)), c1 = persp.apply(null, bookView(-HTOP, BL / 2, BW)), c2 = persp.apply(null, bookView(HTOP, BL / 2, BW)), c3 = persp.apply(null, bookView(HTOP, BL / 2, 0));
          var c4 = persp.apply(null, bookView(-HTOP, -BL / 2, BW)), c5 = persp.apply(null, bookView(HTOP, -BL / 2, BW));
          g.strokeStyle = rgba(col, oa); g.lineWidth = 1.4;
          g.beginPath(); g.moveTo(c0[0], c0[1]); g.lineTo(c1[0], c1[1]); g.lineTo(c4[0], c4[1]); g.lineTo(c5[0], c5[1]); g.lineTo(c2[0], c2[1]); g.lineTo(c3[0], c3[1]); g.moveTo(c1[0], c1[1]); g.lineTo(c2[0], c2[1]); g.stroke();
        }
      }
    }
    // particles: the slam puff and the leftover light sucked into the spine
    var PUFF = [];
    (function () {
      var R = u.rand('s07:puff');
      for (var i = 0; i < 90; i++) {
        var side = R() < 0.5 ? -1 : 1;
        PUFF.push({ x: 960 + side * R.range(40, 70), y: R.range(822, 842), vx: side * R.range(120, 560), vy: -R.range(15, 90), tau: R.range(0.3, 0.6), r: R.range(0.7, 2.0), a: R.range(0.2, 0.6),
          ty: R.range(560, 830), sd: R.range(0, 0.55), sw: R.sign() * R.range(20, 70) });
      }
      for (var k = 0; k < 140; k++) {   // leftover motes anywhere in the frame
        PUFF.push({ x: R.range(200, 1720), y: R.range(150, 980), vx: 0, vy: 0, tau: 1, r: R.range(0.6, 1.8), a: R.range(0.1, 0.32), ty: R.range(560, 830), sd: R.range(0, 0.6), sw: R.sign() * R.range(30, 120), mote: true, ph: R() * 6.283 });
      }
    })();
    function drawParticles(g, t, en) {
      if (t < T_SLAM) return;
      g.globalCompositeOperation = 'lighter';
      var si = seamI(t);
      for (var i = 0; i < PUFF.length; i++) {
        var P = PUFF[i], x = t - T_SLAM, px, py, a;
        if (P.mote) { px = P.x + 14 * Math.sin(P.ph + t * 0.7); py = P.y - 10 * t + 9 * Math.cos(P.ph + t * 0.5); a = P.a * seg(t, T_SLAM + 0.3, T_DARK) * 0.6; }
        else { var dr = P.tau * (1 - Math.exp(-x / P.tau)); px = P.x + P.vx * dr; py = P.y + P.vy * dr - 9 * x; a = P.a * pulse(x, 0.02, 1.5); }
        if (t >= T_DARK) {
          var s = eExpoI(seg(t, T_DARK + P.sd, T_BLACK - 0.04));
          var tx = 960 + P.sw * Math.sin(Math.PI * s) * (1 - s), ty = P.ty;
          px = lerp(px, tx, s); py = lerp(py, ty, s) - P.sw * 0.5 * Math.sin(Math.PI * s);
          a = Math.max(a, P.a * 0.6) * (0.4 + 0.9 * s) * (s >= 0.999 ? 0 : 1);
        }
        a *= 0.6 + 0.6 * si * (P.mote ? 0.5 : 1) + 0.2 * en;
        if (a <= 0.004) continue;
        g.globalAlpha = clamp(a, 0, 1);
        var rr = P.r * (1 + 0.3 * en);
        g.drawImage(SPR_NEUT, px - rr * 3, py - rr * 3, rr * 6, rr * 6);
      }
      g.globalAlpha = 1; g.globalCompositeOperation = 'source-over';
    }
    function drawBokeh(g, t, en) {
      var M = mapM(Math.min(t, 3)), t6 = T6 + Math.max(0, t), ba = (0.7 + 0.5 * en) * (1 - seg(t, 0.5, 4.4, eSine));
      if (ba <= 0.003) return;
      g.globalCompositeOperation = 'lighter';
      for (var i = 0; i < BOKEH.length; i++) {
        var b = BOKEH[i], shift = -M.th * 900 * b.d;
        var bx = ((b.x + shift + 140) % 2200 + 2200) % 2200 - 140, by = b.y - b.sp * t6 + 18 * Math.sin(t6 * 0.5 + b.ph);
        by = ((by + 120) % 1320 + 1320) % 1320 - 120;
        g.globalAlpha = clamp(b.a * ba, 0, 1);
        var bs = b.r * 2.4; g.drawImage(b.warm ? SPR_SOFT_GOLD : SPR_TEAL, bx - bs, by - bs, bs * 2, bs * 2);
      }
      g.globalAlpha = 1; g.globalCompositeOperation = 'source-over';
    }

    // ================= HUD text =================
    var tx = { en: TX('evidence'), h1: TX('可是，遇见了，还会忘。'), src1: TX('Ebbinghaus, 1885'), l2: TX('光是读过，还不够。'), src2: TX('Waring & Takaki, 2003'), h3: TX('合上书。') };
    var AMB = 'color:#e3b46c;text-shadow:0 0 22px rgba(255,181,71,.28)';
    var h1 = u.text(hud, '', 'headline', { x: 960, y: 84, anchor: 'top', html: mark(tx.h1.text, '还会忘', AMB), style: { fontSize: '112px', color: '#f1ebe0', textShadow: '0 0 26px rgba(255,236,206,.14)' } });
    var evL = u.text(hud, tx.en.text, 'en', { x: 0, y: 0, anchor: 'top-left', style: { fontSize: '48px', color: '#a9dccf', textShadow: '0 0 18px rgba(159,227,214,.35)', opacity: 0 } });
    function srcText(s) { return u.text(hud, s, 'source', { x: 1860, y: 1040, anchor: 'bottom-right', style: { color: '#93b5ab', opacity: 0 } }); }
    var src1 = srcText(tx.src1.text), src2 = srcText(tx.src2.text);
    var l2 = u.text(hud, '', 'line', { x: 960, y: 92, anchor: 'top', html: mark(tx.l2.text, '还不够', AMB), style: { fontSize: '84px', fontWeight: 900, color: '#efe8dc', letterSpacing: '.06em', textShadow: '0 0 24px rgba(255,236,206,.12)' } });
    var h3 = u.text(hud, tx.h3.text, 'headline', { x: 960, y: 156, style: { fontSize: '140px', color: '#f2ebdf', letterSpacing: '.08em', textShadow: '0 0 30px rgba(255,240,214,.22), 0 0 80px rgba(255,226,180,.1)', opacity: 0 } });
    var h1Ch = u.splitChars(h1), l2Ch = u.splitChars(l2);
    gsap.set([h1Ch, l2Ch], { opacity: 0 });
    // resting glyphs carry no filter (a leftover blur(0px) makes Chrome reuse rasters differently per seek history)
    function pop(chars, at, st) {
      tl.fromTo(chars, { opacity: 0, filter: 'blur(10px)' }, { opacity: 1, filter: 'blur(0px)', duration: 0.32, ease: 'power2.out', stagger: st }, at);
      tl.fromTo(chars, { y: 44, scale: 0.78 }, { y: 0, scale: 1, duration: 0.55, ease: 'back.out(1.7)', stagger: st }, at);
      tl.set(chars, { filter: 'none' }, at + 0.33 + st * (chars.length - 1));
    }
    function outUp(chars, at, dur) { tl.fromTo(chars, { filter: 'blur(0px)' }, { opacity: 0, y: -26, filter: 'blur(9px)', duration: dur, ease: 'power2.in', stagger: 0.006, immediateRender: false }, at - dur - 0.006 * (chars.length - 1)); }
    // A: 可是， on the "and" of beat 1, 遇见了， on beat 2, 还会忘。 on beat 3 (忘 lands heavier, then sinks a little)
    var gA = h1Ch.slice(0, 3), gB = h1Ch.slice(3, 7), gC = h1Ch.slice(7);
    pop(gA, T_TXT, 0.05); pop(gB, BEAT, 0.05); pop(gC, 2 * BEAT, 0.07);
    var wang = h1Ch[9];
    tl.to(wang, { y: 9, color: '#b8925a', duration: 2.0, ease: 'sine.inOut' }, 2.0);   // 忘 sinks and fades a little (colour, not opacity)
    outUp(h1Ch, tx.h1.out, 0.25);
    tl.fromTo(evL, { opacity: 0, x: 22 }, { opacity: 1, x: 0, duration: 0.4, ease: 'power3.out' }, tx.en.in);
    tl.to(evL, { opacity: 0, duration: 0.25, ease: 'power2.in' }, tx.en.out - 0.25);
    tl.fromTo(src1, { opacity: 0, x: 26 }, { opacity: 1, x: 0, duration: 0.4, ease: 'power3.out' }, tx.src1.in);
    tl.to(src1, { opacity: 0, duration: 0.25, ease: 'power2.in' }, tx.src1.out - 0.25);
    u.onFrame(function (t) {   // the label rides the left end of the line (written every frame: no stale state)
      var p = heroPt(TS, 0, clamp(t, 0, tx.en.out + 0.05));
      evL.style.left = (p[0] - 4).toFixed(2) + 'px'; evL.style.top = (p[1] + 10).toFixed(2) + 'px';
    });
    // B
    tl.fromTo(l2Ch, { opacity: 0, y: 30, filter: 'blur(8px)' }, { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.42, ease: 'power3.out', stagger: 0.04 }, tx.l2.in);
    tl.set(l2Ch, { filter: 'none' }, tx.l2.in + 0.43 + 0.04 * (l2Ch.length - 1));
    outUp(l2Ch, tx.l2.out, 0.25);
    tl.fromTo(src2, { opacity: 0, x: 26 }, { opacity: 1, x: 0, duration: 0.2, ease: 'power3.out' }, tx.src2.in);
    tl.to(src2, { opacity: 0, duration: 0.2, ease: 'power2.in' }, tx.src2.out - 0.2);
    // E: 合上书。 slams in on the G downbeat
    tl.fromTo(h3, { opacity: 0, scale: 1.42, filter: 'blur(16px)' }, { opacity: 1, scale: 1, filter: 'blur(0px)', duration: 0.16, ease: 'power4.out' }, tx.h3.in);
    tl.set(h3, { filter: 'none' }, tx.h3.in + 0.17);
    tl.fromTo(h3, { filter: 'blur(0px)' }, { opacity: 0, filter: 'blur(10px)', duration: 0.25, ease: 'power2.in', immediateRender: false }, tx.h3.out - 0.25);

    window.__s07Handoff = { seam: { x: 960, top: 371, nearTop: 593, bottom: 838 }, dot: { x: 960, y: 715 }, head: { x: HEAD.x, y: HEAD.y, r: HEAD.r } };
  });
})();
