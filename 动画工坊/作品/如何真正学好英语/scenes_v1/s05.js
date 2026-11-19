/* s05  A river of light (71.5094 to 89.3817 s, bars 28 to 34, lift: the theme comes back on the downbeat).
 *
 * 名场面「一河星光」. The first warm light of the film. On the warm chord of bar 28 the thin stream of word sand that
 * s04 pours down lands on a dark plain and floods out along a channel (SVG liquid displacement 0 > 40 > 12 px), the
 * camera cranes from almost straight down (80 deg) to a 35 deg oblique view in 2 bars, and the channel becomes a
 * wide river made of ~3000 points of light (seeded simplex wobble, teal #3cc6a8 to warm gold #ffcf70) whose current
 * is the integral of the music energy (0.8 to 1.2 x, a surge on the bass of bar 30). Six real sentences from the
 * user's stories (01, 03, 05, 11, 12, 16) ride the current as ribbons of light, letter by letter along the curve of
 * the river, readable near the camera (>= 40 px) and breaking up into points of light in the distance. The faceless
 * learner stands in the shallows; light spreads from his feet in rings and his head lamp turns from cold blue to
 * pale gold (#ffe2b0, 50 %): the first warm light of the film. On the three beats of bar 31 three of the user's own
 * watercolour illustrations float in as paper lanterns (01, 61, 70; 580, 460 and 360 px wide so that cards and tags
 * never touch) with paper name tags; 60, 54, 41 and 35 glow far away as out-of-focus lanterns. While the lanterns are
 * on the water the river's letters dissolve into light (the first two sentences for good, so their remains never cross
 * the ones that follow). The bass of bar 32 lifts the whole river one step (a wave of light runs upstream to
 * downstream); on beat 4 it dims one step for the last line, and 34 small candle lights appear one by one far down the
 * river (one per study in Nakanishi's meta-analysis: an easter egg, no number on screen apart from the line). From
 * bar 34 beat 3 the camera dives at the water: every point of light and every sentence ribbon straightens into the
 * six lines of s06's reading page (match cut).
 *
 * Techniques: liquid displacement (feTurbulence + feDisplacementMap birth of the river), generative particles
 * (flow-field river, word sand, candles, bokeh), motion along a path (text on the river spline, lanterns drifting with
 * the current), the user's own artwork (3 lanterns + 4 bokeh lanterns), faceless vector character, 2.5D camera
 * (real ground-plane projection, crane tilt, dolly, dive; parallax for free), light (lantern glow and reflections,
 * warm haze, light shafts, scrims), text effects (char pops with back.out, blur rise, gradient kicker), music sync
 * (energy-driven current, glow, brightness; hits flash glints).
 *
 * HANDOFF in (liquid, 0.8 s, from the storyboard): during t in [-0.8, 0] this scene shows a thin vertical stream of word
 *   sand falling from the top edge at x ~ 960 onto a small pool of light at about (1060, 470) on a near-black teal
 *   plain. s04 ends on "a thin stream of light flowing down"; the liquid transition melts one into the other.
 * HANDOFF out (cut, global 89.3817 s). Last frame: background #0a1622 (plain, vignette from the engine); six
 *   horizontal lines of warm white light beads (#fff1c9 core, soft gold glow) exactly where s06's 50-word passage
 *   lines sit if it is set in Source Serif 4 Display 400 42 px, left aligned at x = 960 - WRAP/2 (WRAP chosen at build
 *   so that the passage wraps into 6 lines, about 1300 px), line pitch 72 px, centred on y = 540 (line centres
 *   360 432 504 576 648 720). Each bead line spans the measured width of its passage line. window.__s05Block holds
 *   {left, wrap, pitch, lines:[{y, width, text}]} for s06 to read.
 */
(function () {
  'use strict';

  var SENTS = [
    { a: '01', s: 'Its wits are as versatile as its anatomy.' },
    { a: '03', s: 'The backlash was a grassroots outcry.' },
    { a: '05', s: 'The architect was candid, admitting many mistakes.' },
    { a: '11', s: 'Marshall made himself the guinea pig.' },
    { a: '12', s: 'The revelation had come two years previously.' },
    { a: '16', s: 'Its authors cautioned that correlation is not causation.' }
  ];
  var PASSAGE_FALLBACK = 'Yet the 1997 trees were seedlings, not elderly mothers. In February 2023, three researchers combed through the field evidence. They judged it too sparse, inconsistent, or ambiguous to demonstrate that shared networks are widespread. In 26 field studies, networks helped and hindered seedlings about equally often, with neutral effects predominating.';

  registerScene('s05', async function build(tl, root, ctx) {
    var u = ctx.util, gsap = window.gsap, D = ctx.duration, W = 1920, H = 1080;
    var clamp = u.clamp, lerp = u.lerp, dpr = window.devicePixelRatio || 1;
    function E(n) { return gsap.parseEase(n); }
    var eSine = E('sine.inOut'), eP2o = E('power2.out'), eP2i = E('power2.in'), eP2io = E('power2.inOut'),
      eP3o = E('power3.out'), eP3i = E('power3.in'), eP3io = E('power3.inOut'), eExpo = E('expo.out'),
      eBack = E('back.out(1.25)');
    function seg(t, a, b, ease) { var x = clamp((t - a) / (b - a), 0, 1); return ease ? ease(x) : x; }
    function pulse(x, rise, decay) { return x < 0 ? 0 : (1 - Math.exp(-x / rise)) * Math.exp(-x / decay); }
    function TX(s) {
      for (var i = 0; i < ctx.texts.length; i++) if (ctx.texts[i].text === s) return ctx.texts[i];
      throw new Error('s05: text missing from the storyboard: ' + s);
    }
    function hsh(i, s) { return u.hash(i, 's05' + s); }
    function hexRgb(h) { var x = parseInt(h.slice(1), 16); return [x >> 16, (x >> 8) & 255, x & 255]; }
    function mixRgb(a, b, k) { return [Math.round(lerp(a[0], b[0], k)), Math.round(lerp(a[1], b[1], k)), Math.round(lerp(a[2], b[2], k))]; }
    function rgba(c, a) { return 'rgba(' + c[0] + ',' + c[1] + ',' + c[2] + ',' + clamp(a, 0, 1).toFixed(4) + ')'; }

    await Promise.all([
      document.fonts.load('400 46px "Source Serif 4 Display"'),
      document.fonts.load('italic 400 46px "Source Serif 4 Display"'),
      document.fonts.load('700 42px "Noto Sans SC"')
    ]);

    // ---------------- music grid (local s) ----------------
    var T_TILT = u.bar(2);        // 5.106  bar 30: bass, current surges, camera settles at 35 deg
    var T_HEAD2 = u.beat(11);     // 7.021  bar 30 beat 4
    var T_LAN = [u.beat(12), u.beat(13), u.beat(14)];   // 7.659 8.298 8.936 bar 31 beats 1 2 3
    var T_LIFT = u.bar(4);        // 10.213 bar 32: strong bass, river one step brighter
    var T_LAST = u.beat(19);      // 12.128 bar 32 beat 4: last line, river one step darker
    var T_DIVE = u.beat(26);      // 16.596 bar 34 beat 3: the dive
    var BEAT = ctx.music.beat;
    function eN(t) { return clamp((u.energy(t, 0.08) - 0.62) / 0.3, 0, 1); }

    // ---------------- current: integral of the energy-driven speed (pure function of t via a table) ----------------
    function speedMul(t) {
      return 0.8 + 0.4 * eN(t) + 1.05 * pulse(t - T_TILT - 0.07, 0.05, 0.55) + 0.55 * pulse(t - T_LIFT - 0.06, 0.05, 0.5)
        + 2.6 * seg(t, T_DIVE, D, eP2i);
    }
    var FP_T0 = -2, FP_DT = 1 / 120, FP_N = Math.ceil((D + 1.5 - FP_T0) / FP_DT) + 2, FP = new Float64Array(FP_N);
    (function () { var acc = 0; for (var i = 0; i < FP_N; i++) { FP[i] = acc; acc += speedMul(FP_T0 + i * FP_DT) * FP_DT; } })();
    function flowPos(t) {
      var x = (t - FP_T0) / FP_DT, i = Math.floor(x);
      if (i < 0) return (t - FP_T0) * 0.9;
      if (i >= FP_N - 1) return FP[FP_N - 1];
      return FP[i] + (FP[i + 1] - FP[i]) * (x - i);
    }

    // ---------------- the river in world coordinates (ground plane X, Z; Z grows away from the camera) ----------------
    var RIVER_PTS = [[-660, -1000], [-480, -790], [-315, -590], [-120, -335], [190, -96], [640, 160],
      [1060, 420], [1440, 760], [1610, 1250], [1700, 1900], [1680, 2700], [1600, 3600]];
    var STEP = 4, RX = [], RZ = [], RTX = [], RTZ = [], RL;
    (function () {
      var poly = [], P = RIVER_PTS;
      for (var i = 0; i < P.length - 1; i++) {
        var p0 = P[Math.max(0, i - 1)], p1 = P[i], p2 = P[i + 1], p3 = P[Math.min(P.length - 1, i + 2)];
        for (var k = 0; k < 60; k++) {
          var t = k / 60, t2 = t * t, t3 = t2 * t;
          poly.push([0.5 * (2 * p1[0] + (-p0[0] + p2[0]) * t + (2 * p0[0] - 5 * p1[0] + 4 * p2[0] - p3[0]) * t2 + (-p0[0] + 3 * p1[0] - 3 * p2[0] + p3[0]) * t3),
            0.5 * (2 * p1[1] + (-p0[1] + p2[1]) * t + (2 * p0[1] - 5 * p1[1] + 4 * p2[1] - p3[1]) * t2 + (-p0[1] + 3 * p1[1] - 3 * p2[1] + p3[1]) * t3)]);
        }
      }
      poly.push(P[P.length - 1]);
      var cum = [0];
      for (var j = 1; j < poly.length; j++) cum.push(cum[j - 1] + Math.hypot(poly[j][0] - poly[j - 1][0], poly[j][1] - poly[j - 1][1]));
      RL = cum[cum.length - 1];
      var n = Math.floor(RL / STEP), q = 0;
      for (var m = 0; m <= n; m++) {
        var s = m * STEP;
        while (q < cum.length - 2 && cum[q + 1] < s) q++;
        var f = (s - cum[q]) / Math.max(1e-6, cum[q + 1] - cum[q]);
        RX.push(lerp(poly[q][0], poly[q + 1][0], f)); RZ.push(lerp(poly[q][1], poly[q + 1][1], f));
      }
      for (var m2 = 0; m2 < RX.length; m2++) {
        var a = Math.max(0, m2 - 3), b = Math.min(RX.length - 1, m2 + 3), dx = RX[b] - RX[a], dz = RZ[b] - RZ[a], l = Math.hypot(dx, dz) || 1;
        RTX.push(dx / l); RTZ.push(dz / l);
      }
    })();
    var RN = RX.length;
    var RA = { x: 0, z: 0, tx: 1, tz: 0 };
    function rAt(s) {   // writes into RA (no allocation): centre point and unit tangent at arc length s
      var x = clamp(s / STEP, 0, RN - 1.001), i = Math.floor(x), f = x - i;
      RA.x = RX[i] + (RX[i + 1] - RX[i]) * f; RA.z = RZ[i] + (RZ[i + 1] - RZ[i]) * f;
      RA.tx = RTX[i] + (RTX[i + 1] - RTX[i]) * f; RA.tz = RTZ[i] + (RTZ[i + 1] - RTZ[i]) * f;
      return RA;
    }
    function halfW(s) { return 300 - 60 * clamp(s / RL, 0, 1); }
    function nearestS(X, Z) { var best = 0, bd = 1e18; for (var i = 0; i < RN; i++) { var d = (RX[i] - X) * (RX[i] - X) + (RZ[i] - Z) * (RZ[i] - Z); if (d < bd) { bd = d; best = i; } } return best * STEP; }

    // ---------------- camera: crane from 80 deg (almost straight down) to 35 deg in 2 bars, slow dolly, then the dive ----------------
    var F = 1250, CAM = { phi: 0, sp: 1, cp: 0, D: 1250, Tx: 0, Tz: 0, tilt: 0, dive: 0 };
    function cam(t) {
      var tilt = seg(t, -0.25, T_TILT, eSine), drift = seg(t, 1.0, T_DIVE + 0.6, eSine), dive = eP2io(seg(t, T_DIVE, T_DIVE + 1.05));
      var look = seg(t, T_LAST - 0.6, T_DIVE + 0.3, eSine);   // during the last line the camera lifts its gaze downstream
      var phi = lerp(80, 35, tilt) - 0.8 * look;
      phi = lerp(phi, 82, dive);
      CAM.phi = phi; CAM.sp = Math.sin(phi * Math.PI / 180); CAM.cp = Math.cos(phi * Math.PI / 180);
      CAM.D = lerp(1250, 820, dive);
      CAM.Tx = lerp(-250, -20, tilt) + 24 * drift + 10 * look + 160 * dive;
      CAM.Tz = lerp(-390, -40, tilt) + 80 * drift + 40 * look + 160 * dive;
      CAM.tilt = tilt; CAM.dive = dive;
      return CAM;
    }
    var PJ = [0, 0, 1];
    function proj(c, X, Z) {   // writes into PJ: screen x, y and the scale k (px per world unit) at that point
      var q = Z - c.Tz, zc = c.D + q * c.cp;
      if (zc < 90) zc = 90;
      var k = F / zc;
      PJ[0] = 960 + (X - c.Tx) * k; PJ[1] = 540 - q * c.sp * k; PJ[2] = k;
      return PJ;
    }

    // ---------------- key places ----------------
    var S_LAND = nearestS(-150, -300);                    // where s04's falling stream lands and the river is born
    var LEARN = { X: -470, Z: -545 };                     // the learner, in the left shallows near the camera
    var S_LEARN = nearestS(LEARN.X, LEARN.Z);

    // ---------------- palette ----------------
    var C_TEAL = hexRgb('#3cc6a8'), C_GOLD = hexRgb('#ffcf70'), C_FLARE = hexRgb('#fff1c9'), C_DEEP = hexRgb('#0e2a2c'),
      C_WARMW = hexRgb('#fff3df'), C_LAMP = hexRgb('#ffe2b0'), C_COLD = hexRgb('#a9c8ff');
    function warmth(t) { return 0.22 + 0.33 * seg(t, -0.2, 2.6, eP2o) + 0.17 * seg(t, T_LIFT - 0.1, T_LIFT + 1.0, eP2o) + 0.1 * seg(t, T_LAST, D, eSine); }
    // brightness of the whole river: forms, one step up on bar 32, one step down for the last line, swells in the dive
    function level(t) {
      var v = lerp(0.55, 1.0, seg(t, -0.4, 1.6, eP2o));
      v *= 1 + 0.32 * seg(t, T_LIFT - 0.02, T_LIFT + 0.3, eP3o);
      v *= 1 - 0.32 * seg(t, T_LAST - 0.15, T_LAST + 0.45, eP2io);
      v *= 1 + 0.55 * seg(t, T_DIVE, T_DIVE + 0.8, eP2io);
      return v;
    }

    // sprites: soft dots in 10 colours from teal to gold to flare, plus warm white
    var SPR = [];
    function makeSprite(rgb, core) {
      var R = Math.round(24 * dpr), c = document.createElement('canvas'); c.width = c.height = R * 2;
      var g = c.getContext('2d'), gr = g.createRadialGradient(R, R, 0, R, R, R);
      gr.addColorStop(0, rgba(mixRgb(rgb, [255, 255, 255], core), 1)); gr.addColorStop(0.18, rgba(rgb, 0.95));
      gr.addColorStop(0.42, rgba(rgb, 0.32)); gr.addColorStop(0.7, rgba(rgb, 0.08)); gr.addColorStop(1, rgba(rgb, 0));
      g.fillStyle = gr; g.fillRect(0, 0, R * 2, R * 2); return c;
    }
    for (var si = 0; si < 10; si++) SPR.push(makeSprite(si < 7 ? mixRgb(C_TEAL, C_GOLD, si / 6) : mixRgb(C_GOLD, C_FLARE, (si - 6) / 3), 0.35));
    var SPR_AMBER = makeSprite([255, 166, 64], 0.55), SPR_W = makeSprite(C_FLARE, 0.6), SPR_SOFT_GOLD = makeSprite([255, 196, 110], 0.1), SPR_SOFT_TEAL = makeSprite([70, 190, 170], 0.05);
    function sprIdx(v) { return Math.round(clamp(v, 0, 1) * 9); }

    // ---------------- layers ----------------
    var bg = u.el('div', { cls: 'fill', parent: root, style: { background: 'radial-gradient(ellipse 80% 70% at 72% 30%, #0f2a2a 0%, #071413 55%, #040b0b 100%)' } });
    var bgEnd = u.el('div', { cls: 'fill', parent: root, style: { background: '#0a1622', opacity: 0 } });
    var back = u.canvas(root, function (g, t) { drawBack(g, t); });
    var lanLayer = u.el('div', { cls: 'fill', parent: root });
    var front = u.canvas(root, function (g, t) { drawFront(g, t); });
    var scrimTop = u.el('div', { cls: 'fill', parent: root, style: { background: 'linear-gradient(180deg, rgba(3,10,11,.86) 0%, rgba(3,10,11,.62) 22%, rgba(3,10,11,.22) 38%, rgba(3,10,11,0) 48%)', opacity: 0 } });
    var scrimBot = u.el('div', { cls: 'fill', parent: root, style: { background: 'linear-gradient(0deg, rgba(3,9,10,.9) 0%, rgba(3,9,10,.66) 15%, rgba(3,9,10,.25) 26%, rgba(3,9,10,0) 34%)', opacity: 0 } });
    var hud = u.el('div', { cls: 'fill', parent: root });

    // liquid birth of the river: displacement 0 > 40 px > 12 px in 1.6 s, then off (full-frame filters are slow at 4K)
    var liq = u.liquid(back.canvas, { scale: 40, freq: 0.0075, octaves: 2, seed: 11, drift: 50, speed: 0.4 });
    u.onFrame(function (t) {
      liq.state.amount = t < 0.6 ? seg(t, -0.8, 0.6, eP2o) : t < 1.6 ? lerp(1, 0.3, seg(t, 0.6, 1.6, eSine)) : lerp(0.3, 0, seg(t, 1.6, 2.7, eSine));
    });

    // ---------------- river particles ----------------
    var NP = 3000, PS = [];
    (function () {
      var R = u.rand('s05:river');
      for (var i = 0; i < NP; i++) {
        var w = clamp(R.gauss() * 0.4, -1, 1);
        PS.push({ s0: R() * RL, w: w, vf: R.range(0.8, 1.2) * (1.12 - 0.38 * Math.abs(w)), r: R.range(0.75, 2.1) * (R() < 0.07 ? 2.1 : 1),
          h: R(), ph: R() * 6.283, fq: R.range(0.5, 1.6), nz: R() * 40, a: R.range(0.45, 1), stg: R() });
      }
    })();
    var NSK = 240, SK = [];
    (function () {
      var R = u.rand('s05:streak');
      for (var i = 0; i < NSK; i++) SK.push({ s0: R() * RL, w: clamp(R.gauss() * 0.36, -0.95, 0.95), vf: R.range(1.0, 1.35), len: R.range(30, 90), a: R.range(0.25, 0.7), h: R(), nz: R() * 40 });
    })();
    var V_RIVER = 118, V_TEXT = 98;

    // reveal: the river floods out along its channel from the landing point
    function revealR(t) { return t < 0 ? 40 + 50 * clamp(1 + t / 0.8, 0, 1) : 90 + 1500 * eSine(seg(t, 0, 1.6)) + RL * eP2i(seg(t, 1.2, 3.6)); }
    function widthK(t) { return 0.05 + 0.95 * eP3o(seg(t, -0.3, 1.6)); }

    // ---------------- s06's page: six lines the river becomes ----------------
    var mc = document.createElement('canvas').getContext('2d');
    var passage = PASSAGE_FALLBACK;
    try {
      var s06 = (ctx.storyboard.scenes || []).filter(function (s) { return s.id === 's06'; })[0];
      var vt = s06 && (s06.visual_text || []).filter(function (v) { return v.id === 'passage'; })[0];
      if (vt && vt.text) passage = vt.text;
    } catch (e) { }
    var PFONT = '400 42px "Source Serif 4 Display"';
    function wrapLines(maxW) {
      mc.font = PFONT;
      var words = passage.split(/\s+/), lines = [], cur = '';
      words.forEach(function (w) { var tt = cur ? cur + ' ' + w : w; if (cur && mc.measureText(tt).width > maxW) { lines.push(cur); cur = w; } else cur = tt; });
      if (cur) lines.push(cur);
      return lines;
    }
    var WRAP = 1360, PL = wrapLines(WRAP);
    while (PL.length < 6 && WRAP > 900) { WRAP -= 10; PL = wrapLines(WRAP); }
    while (PL.length > 6 && WRAP < 1700) { WRAP += 10; PL = wrapLines(WRAP); }
    mc.font = PFONT;
    var PITCH = 72, BL_LEFT = 960 - WRAP / 2, NL = PL.length;
    var INK = 0;
    var BLOCK = PL.map(function (s, i) {
      var spans = [], pos = 0, ink = 0;
      s.split(' ').forEach(function (w) {
        var x0 = mc.measureText(s.slice(0, pos)).width, x1 = mc.measureText(s.slice(0, pos + w.length)).width;
        spans.push([x0 + 2, x1 - 2]); ink += x1 - x0 - 4; pos += w.length + 1;
      });
      INK += ink;
      return { y: 540 + (i - (NL - 1) / 2) * PITCH, width: mc.measureText(s).width, text: s, spans: spans, ink: ink };
    });
    window.__s05Block = { left: BL_LEFT, wrap: WRAP, pitch: PITCH, font: PFONT, lines: BLOCK.map(function (b) { return { y: b.y, width: b.width, text: b.text }; }) };
    // particle targets: points on the words of the six lines (gaps at the spaces), spread by ink length
    PS.forEach(function (p, i) {
      var v = hsh(i, 'lu') * INK, li = 0;
      while (li < NL - 1 && v > BLOCK[li].ink) { v -= BLOCK[li].ink; li++; }
      var sp = BLOCK[li].spans, k = 0;
      while (k < sp.length - 1 && v > sp[k][1] - sp[k][0]) { v -= sp[k][1] - sp[k][0]; k++; }
      p.li = li; p.tx = sp[k][0] + clamp(v, 0, sp[k][1] - sp[k][0]); p.lj = (hsh(i, 'lj') - 0.5) * 9;
    });
    function morphK(t, stg) { return eP3io(seg(t, T_DIVE + 0.22 + 0.3 * stg, T_DIVE + 1.0 + 0.22 * stg)); }
    function blockAmt(t) { return seg(t, T_DIVE + 0.3, D - 0.06, eP2io); }
    function glowAmt(t) { return seg(t, T_DIVE + 0.95, D - 0.04, eP2i); }

    // ---------------- sentence ribbons ----------------
    var FS = 50, SFONT = '400 50px "Source Serif 4 Display"';
    mc.font = SFONT;
    var SR = SENTS.map(function (o, i) {
      var str = o.s, gl = [], prev = 0;
      for (var j = 0; j < str.length; j++) {
        var adv = mc.measureText(str.slice(0, j + 1)).width;
        gl.push({ ch: str[j], c: (prev + adv) / 2, w: adv - prev, dot: hsh(i * 100 + j, 'gd') });
        prev = adv;
      }
      return { s: str, len: prev, gl: gl };
    });
    // lane (fraction of the half width; negative = left bank) and where the head is at t = 0 (arc length)
    var LANES = [-0.58, -0.02, 0.52];
    var SCHED = [
      { i: 0, lane: 0, head0: S_LAND + 450, era: 1 },
      { i: 1, lane: 2, head0: S_LAND + 200, era: 1 },
      { i: 2, lane: 1, head0: S_LAND - 350, era: 0 },
      { i: 3, lane: 0, head0: S_LAND - 880, era: 2 },
      { i: 4, lane: 2, head0: S_LAND - 940, era: 2 },
      { i: 5, lane: 1, head0: S_LAND - 1750, era: 2 }
    ];
    // legibility of the river text: full in groups 1 and 3, dissolved into light while the lanterns are on the water
    // era 1 sentences dissolve for good on the lantern beat (their remains would cross the sentences that follow them)
    function textA(t, era) {
      var intro = seg(t, 0.35, 1.5, eP2o), off = seg(t, T_HEAD2 - 0.7, T_HEAD2 + 0.2, eP2io), back = era === 1 ? 0 : seg(t, 11.7, 12.5, eP2io);
      return intro * (1 - off + back);
    }
    // final line of each sentence in the page block (top to bottom)
    var SENT_LINE = [1, 5, 2, 0, 4, 3];

    // ---------------- keep-out zones (screen), recomputed every frame before drawing ----------------
    var KO = [];
    function koAmount(x, y) {
      var m = 0;
      for (var i = 0; i < KO.length; i++) {
        var z = KO[i]; if (z.a <= 0) continue;
        var dx = Math.max(z.l - x, 0, x - z.r), dy = Math.max(z.t - y, 0, y - z.b);
        var d = Math.hypot(dx, dy), v = z.a * (1 - clamp(d / z.f, 0, 1));
        if (v > m) m = v;
      }
      return m;
    }

    // ---------------- HUD text ----------------
    var tx = {
      en1: TX('comprehensible input'), h1: TX('大量接触自己基本能听懂、读懂的内容，'), l1: TX('是学会一门语言的基础。'), src1: TX('Krashen, 1982'),
      h2: TX('找到你真正想看、想读的英语。'), tagA: TX('越狱的章鱼'), tagB: TX('鲸歌易帜'), tagC: TX('写给外星人的一张唱片'), src2: TX('Masgoret & Gardner, 2003'),
      l3: TX('34 项研究的汇总：大量阅读能明显提高阅读能力。'), src3: TX('Nakanishi, 2015')
    };
    var GOLD_HL = 'color:#ffcf70;text-shadow:0 0 22px rgba(255,190,90,.45),0 0 60px rgba(255,170,70,.22)';
    var en1 = u.text(hud, 'comprehensible input', 'en', { x: 960, y: 100, cls: 'grad-text', style: { fontSize: '78px', backgroundImage: 'linear-gradient(90deg, #c6f3e4 0%, #ffe9c6 46%, #ffcf70 100%)', letterSpacing: '0.01em' } });
    var h1 = u.text(hud, '', 'headline', { x: 960, y: 236, html: '大量接触自己<span style="' + GOLD_HL + '">基本能听懂、读懂</span>的内容，', style: { fontSize: '84px', color: '#fff3df', textShadow: '0 0 26px rgba(255,226,176,.22)' } });
    var l1 = u.text(hud, '是学会一门语言的基础。', 'line', { x: 960, y: 350, style: { fontSize: '56px', color: '#d6efe6', textShadow: '0 0 20px rgba(60,198,168,.25)' } });
    var h2 = u.text(hud, '', 'headline', { x: 960, y: 180, html: '找到你<span style="' + GOLD_HL + '">真正想看、想读</span>的英语。', style: { fontSize: '88px', color: '#fff3df', textShadow: '0 0 26px rgba(255,226,176,.24)' } });
    var l3 = u.text(hud, '', 'line', { x: 960, y: 928, html: '34 项研究的汇总：<span style="' + GOLD_HL + '">大量阅读</span>能明显提高阅读能力。', style: { fontSize: '56px', color: '#fff3df', textShadow: '0 0 18px rgba(0,0,0,.6)' } });
    function srcText(s) { return u.text(hud, s, 'source', { x: 1856, y: 1028, anchor: 'bottom-right', style: { color: '#9fc4b8', opacity: 0 } }); }
    var src1 = srcText(tx.src1.text), src2 = srcText(tx.src2.text), src3 = srcText(tx.src3.text);
    var enCh = u.splitChars(en1), h1Ch = u.splitChars(h1), l1Ch = u.splitChars(l1), h2Ch = u.splitChars(h2), l3Ch = u.splitChars(l3);
    gsap.set([enCh, h1Ch, l1Ch, h2Ch, l3Ch], { opacity: 0 });

    // group 1: 'comprehensible input' rises out of the light, the headline pops in char by char, the line follows
    tl.fromTo(enCh, { opacity: 0, y: 24, filter: 'blur(8px)' }, { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.9, ease: 'power3.out', stagger: 0.028 }, tx.en1.in);
    // pops: position and scale overshoot (back.out), opacity and blur never do (a negative blur would be invalid CSS)
    function pop(chars, at, st) {
      tl.fromTo(chars, { opacity: 0, filter: 'blur(12px)' }, { opacity: 1, filter: 'blur(0px)', duration: 0.5, ease: 'power2.out', stagger: st }, at);
      tl.fromTo(chars, { y: 48, scale: 0.55 }, { y: 0, scale: 1, duration: 0.72, ease: 'back.out(1.8)', stagger: st }, at);
    }
    pop(h1Ch, tx.h1.in, 0.032);
    tl.fromTo(l1Ch, { opacity: 0, y: 26, filter: 'blur(6px)' }, { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.6, ease: 'power3.out', stagger: 0.03 }, tx.l1.in);
    tl.fromTo(src1, { opacity: 0, x: 26 }, { opacity: 1, x: 0, duration: 0.6, ease: 'power3.out' }, tx.src1.in);
    // out: up and blurred (6.5 to 6.8 s), each ending exactly on its storyboard out time
    function outUp(chars, at, dur) { tl.to(chars, { opacity: 0, y: -34, filter: 'blur(9px)', duration: dur, ease: 'power2.in', stagger: 0.004 }, at - dur - 0.004 * (chars.length - 1)); }
    outUp(l1Ch, tx.l1.out, 0.3); outUp(enCh, tx.en1.out, 0.3); outUp(h1Ch, tx.h1.out, 0.3);
    tl.to(src1, { opacity: 0, duration: 0.3, ease: 'power2.in' }, tx.src1.out - 0.3);

    // group 2
    pop(h2Ch, tx.h2.in, 0.034);
    tl.fromTo(src2, { opacity: 0, x: 26 }, { opacity: 1, x: 0, duration: 0.6, ease: 'power3.out' }, tx.src2.in);
    outUp(h2Ch, tx.h2.out, 0.36);
    tl.to(src2, { opacity: 0, duration: 0.3, ease: 'power2.in' }, tx.src2.out - 0.3);

    // group 3
    tl.fromTo(l3Ch, { opacity: 0, y: 30, filter: 'blur(8px)' }, { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.55, ease: 'power3.out', stagger: 0.014 }, tx.l3.in);
    tl.fromTo(src3, { opacity: 0, x: 26 }, { opacity: 1, x: 0, duration: 0.6, ease: 'power3.out' }, tx.src3.in);
    tl.to(l3Ch, { opacity: 0, y: -18, filter: 'blur(8px)', duration: 0.24, ease: 'power2.in', stagger: 0.002 }, tx.l3.out - 0.24 - 0.002 * (l3Ch.length - 1));
    tl.to(src3, { opacity: 0, duration: 0.3, ease: 'power2.in' }, tx.src3.out - 0.3);

    // scrims follow the text groups; the top one also stands for the far haze
    tl.fromTo(scrimTop, { opacity: 0.35 }, { opacity: 1, duration: 0.7, ease: 'power2.out' }, tx.en1.in - 0.2);
    tl.to(scrimTop, { opacity: 0.55, duration: 0.5, ease: 'sine.inOut' }, tx.h1.out);
    tl.to(scrimTop, { opacity: 1, duration: 0.4, ease: 'sine.inOut' }, tx.h2.in - 0.3);
    tl.to(scrimTop, { opacity: 0.3, duration: 0.8, ease: 'sine.inOut' }, tx.h2.out);
    tl.fromTo(scrimBot, { opacity: 0 }, { opacity: 1, duration: 0.6, ease: 'power2.inOut' }, T_LAST - 0.2);
    tl.to(scrimBot, { opacity: 0, duration: 0.5, ease: 'power2.in' }, tx.l3.out - 0.2);
    tl.to(scrimTop, { opacity: 0, duration: 0.6, ease: 'power2.in' }, T_DIVE);
    tl.fromTo(bgEnd, { opacity: 0 }, { opacity: 1, duration: D - T_DIVE - 0.25, ease: 'power2.in' }, T_DIVE + 0.1);

    // ---------------- lanterns: the user's watercolours as paper lanterns on the river ----------------
    var LAN = [
      { n: '01', title: tx.tagA, t: T_LAN[0], x: 628, y: 884, w: 580, rot: -1.4, drift: 300 },
      { n: '61', title: tx.tagB, t: T_LAN[1], x: 1172, y: 736, w: 460, rot: 1.1, drift: 190 },
      { n: '70', title: tx.tagC, t: T_LAN[2], x: 1656, y: 604, w: 360, rot: -0.8, drift: 120 }
    ];
    var IMG_W = 760;   // layout width of every lantern image (source 1536 px: sharp at 4K up to 768 css px)
    LAN.forEach(function (L, i) {
      // world anchor = inverse projection of the designed rest point at the resting camera
      var c = cam(L.t + 1.2), q = 0;
      // solve 540 - q*sp*k = y with k = F/(D + q*cp)  =>  a*(D + q*cp) = q*sp*F
      var a = 540 - L.y;
      q = a * c.D / (c.sp * F - a * c.cp);
      var k = F / (c.D + q * c.cp);
      L.X = c.Tx + (L.x - 960) / k; L.Z = c.Tz + q; L.ww = L.w / k;
      L.s = nearestS(L.X, L.Z);
      var el = u.el('div', { cls: 'abs', parent: lanLayer, style: { left: '0px', top: '0px', width: IMG_W + 'px', height: (IMG_W / 1.5) + 'px', transformOrigin: '50% 100%', opacity: 0 } });
      u.el('div', { cls: 'abs', parent: el, style: { left: '-30%', top: '-38%', width: '160%', height: '176%', borderRadius: '50%', background: 'radial-gradient(closest-side, rgba(255,204,120,.42) 0%, rgba(255,170,80,.16) 50%, rgba(255,160,70,0) 100%)' } });
      var card = u.el('div', { cls: 'abs', parent: el, style: { left: '0px', top: '0px', width: IMG_W + 'px', height: (IMG_W / 1.5) + 'px', borderRadius: '26px', background: 'linear-gradient(160deg, #fff9ec, #f2dfbb)',
        boxShadow: '0 0 0 2px rgba(255,240,210,.75), 0 0 54px rgba(255,196,104,.55), 0 0 120px rgba(255,170,70,.25), 0 30px 70px rgba(0,0,0,.55)' } });
      u.image('assets/illus/' + L.n + '.jpg', { parent: card, x: 12, y: 12, anchor: 'top-left', width: IMG_W - 24, height: (IMG_W - 24) / 1.5, fit: 'cover', radius: 17 });
      // lit from within: warm centre, paper-dark rim
      u.el('div', { cls: 'abs', parent: card, style: { left: '12px', top: '12px', width: (IMG_W - 24) + 'px', height: ((IMG_W - 24) / 1.5) + 'px', borderRadius: '17px',
        background: 'radial-gradient(ellipse 70% 65% at 50% 46%, rgba(255,236,190,.22), rgba(255,236,190,0) 70%)', boxShadow: 'inset 0 0 38px rgba(110,62,18,.42)', mixBlendMode: 'screen' } });
      L.el = el;
      // paper tag on a thread (text is never scaled: 42 px)
      var tag = u.el('div', { cls: 'abs', parent: lanLayer, style: { left: '0px', top: '0px', transformOrigin: '50% 0%', opacity: 0 } });
      u.el('div', { cls: 'abs', parent: tag, style: { left: '-1px', top: '0px', width: '2px', height: '26px', background: 'linear-gradient(180deg, rgba(255,236,200,.2), rgba(255,236,200,.85))' } });
      var paper = u.el('div', { cls: 'abs', parent: tag, text: L.title.text, style: { left: '0px', top: '24px', transform: 'translateX(-50%)', whiteSpace: 'nowrap', padding: '4px 20px 6px', borderRadius: '9px',
        font: '700 41px/1.25 var(--sans)', letterSpacing: '0.04em', color: '#2b1d10', background: 'linear-gradient(180deg, #fffaf0, #efdcb6)',
        boxShadow: '0 10px 24px rgba(0,0,0,.5), 0 0 22px rgba(255,200,110,.38)' } });
      L.tag = tag; L.paper = paper;
    });
    // poses of the lanterns (computed in onFrame, used by the DOM and by the canvases)
    function lanState(L, t) {
      var arr = seg(t, L.t - 1.05, L.t, eBack), fadeIn = seg(t, L.t - 1.05, L.t - 0.45, eP2o);
      var leave = seg(t, 11.45, 12.1, eP2i);
      var ds = -L.drift * (1 - arr) + 14 * Math.max(0, t - L.t) + 520 * leave;
      rAt(L.s);
      var X = L.X + RA.tx * ds, Z = L.Z + RA.tz * ds;
      var c = cam(t), p = proj(c, X, Z);
      var ph = (t - L.t) * 6.2832 / 3;
      var bob = 7 * Math.sin(ph) * seg(t, L.t - 0.3, L.t + 0.5), rise = 34 * (1 - arr);
      var w = Math.min(L.ww * p[2], 740);
      return { x: p[0], y: p[1] + rise - bob, w: w, h: w / 1.5, k: p[2], op: fadeIn * (1 - leave), rot: L.rot + 1.3 * Math.sin(ph + 0.8), ry: 5 * Math.sin(ph * 0.7 + i3(L)), ph: ph, arr: arr };
    }
    function i3(L) { return L.n === '01' ? 0 : L.n === '61' ? 2 : 4; }
    var LS = [null, null, null];
    u.onFrame(function (t) {
      KO.length = 0;
      LAN.forEach(function (L, i) {
        var s = lanState(L, t); LS[i] = s;
        var sc = s.w / IMG_W;
        L.el.style.opacity = s.op.toFixed(4);
        L.el.style.visibility = s.op > 0.002 ? 'visible' : 'hidden';
        L.el.style.transform = 'translate(' + (s.x - IMG_W / 2).toFixed(2) + 'px,' + (s.y - IMG_W / 1.5).toFixed(2) + 'px) perspective(1400px) rotateY(' + s.ry.toFixed(3) + 'deg) rotate(' + s.rot.toFixed(3) + 'deg) scale(' + sc.toFixed(5) + ')';
        // tag hangs under the card; its own visibility follows the storyboard in/out
        var tin = seg(t, L.title.in, L.title.in + 0.22, eP3o), tout = 1 - seg(t, L.title.out - 0.2, L.title.out, eP2i);
        var top = s.y + 10, swing = 2.6 * Math.sin(s.ph * 1.3 + 1.1);
        L.tag.style.opacity = (tin * tout).toFixed(4);
        L.tag.style.visibility = tin * tout > 0.002 ? 'visible' : 'hidden';
        L.tag.style.transform = 'translate(' + s.x.toFixed(2) + 'px,' + (top + 18 * (1 - tin)).toFixed(2) + 'px) rotate(' + swing.toFixed(3) + 'deg)';
        if (s.op > 0.02) KO.push({ l: s.x - s.w / 2 - 20, r: s.x + s.w / 2 + 20, t: s.y - s.h - 20, b: s.y + 90, f: 60, a: s.op });
      });
      // text zones: top while groups 1 and 2 are up, bottom for the last line, the learner always
      var top = Math.max(seg(t, tx.en1.in - 0.3, tx.en1.in + 0.3) * (1 - seg(t, tx.h1.out - 0.2, tx.h1.out + 0.1)), seg(t, tx.h2.in - 0.3, tx.h2.in + 0.2) * (1 - seg(t, tx.h2.out - 0.2, tx.h2.out + 0.1)));
      if (top > 0) KO.push({ l: -100, r: 2020, t: -100, b: 395, f: 90, a: top });
      var bot = seg(t, T_LAST - 0.3, T_LAST + 0.2) * (1 - seg(t, tx.l3.out, tx.l3.out + 0.15));
      if (bot > 0) KO.push({ l: -100, r: 2020, t: 870, b: 1200, f: 90, a: bot });
      var srcOn = Math.max(seg(t, tx.src1.in - 0.2, tx.src1.in) * (1 - seg(t, tx.src1.out, tx.src1.out + 0.1)), seg(t, tx.src2.in - 0.2, tx.src2.in) * (1 - seg(t, tx.src2.out, tx.src2.out + 0.1)), bot);
      if (srcOn > 0) KO.push({ l: 1380, r: 2020, t: 960, b: 1200, f: 60, a: srcOn });
      var lp = learnerPose(t);
      if (lp.a > 0.05) KO.push({ l: lp.x - 70 * lp.s, r: lp.x + 70 * lp.s, t: lp.y - 300 * lp.s, b: lp.y + 30, f: 50, a: lp.a });
    });

    // far lanterns (60, 54, 41, 35): pre-blurred, they are only bokeh
    var FAR = [{ n: '60', s: 0.47, w: 0.46, sz: 150, ph: 0.3 }, { n: '54', s: 0.53, w: -0.5, sz: 140, ph: 1.7 }, { n: '41', s: 0.6, w: 0.3, sz: 130, ph: 2.9 }, { n: '35', s: 0.67, w: -0.25, sz: 120, ph: 4.4 }];
    await Promise.all(FAR.map(function (f) {
      var im = new Image(); im.decoding = 'sync'; im.src = u.asset('assets/illus/' + f.n + '.jpg');
      return im.decode().then(function () {
        var cw = Math.round(f.sz * dpr * 1.25), ch = Math.round(cw / 1.5), pad = Math.round(14 * dpr);
        var c = document.createElement('canvas'); c.width = cw + pad * 2; c.height = ch + pad * 2;
        var g = c.getContext('2d'); g.filter = 'blur(' + (9 * dpr).toFixed(1) + 'px)';
        g.fillStyle = '#f5e2bd'; g.fillRect(pad - 3 * dpr, pad - 3 * dpr, cw + 6 * dpr, ch + 6 * dpr);
        g.drawImage(im, pad, pad, cw, ch);
        f.cv = c; f.pad = pad / dpr / 1.25;
      }, function () { f.cv = null; });
    }));

    // the 34 candles (one per study) far down the river
    var CANDLES = [];
    (function () {
      var R = u.rand('s05:candles');
      for (var i = 0; i < 34; i++) CANDLES.push({ s: 0.31 + 0.3 * (i / 33) + R.range(-0.006, 0.006), w: ((i * 0.618) % 1) * 1.5 - 0.75, t: T_LAST + 0.25 + i * 0.075, ph: R() * 6.28 });
    })();

    // ---------------- the learner ----------------
    function learnerPose(t) {
      var c = cam(t), p = proj(c, LEARN.X, LEARN.Z);
      var a = 1 - seg(t, T_DIVE + 0.1, T_DIVE + 0.7, eP2i);
      return { x: p[0], y: p[1], s: p[2] * 0.78, a: a, vs: lerp(0.66, 1, seg(t, -0.25, T_TILT * 0.8, eSine)) };
    }
    function glowDisc(g, x, y, r, rgb, a) {
      if (a <= 0.003) return;
      var gr = g.createRadialGradient(x, y, 0, x, y, r);
      gr.addColorStop(0, rgba(rgb, a)); gr.addColorStop(0.35, rgba(rgb, a * 0.45)); gr.addColorStop(1, rgba(rgb, 0));
      g.fillStyle = gr; g.beginPath(); g.arc(x, y, r, 0, 6.2832); g.fill();
    }
    function drawLearner(g, t) {
      var lp = learnerPose(t); if (lp.a <= 0.003) return;
      var flip = seg(t, -0.05, 0.6, eP2io);                       // head lamp: cold blue to pale gold on the downbeat
      var lamp = mixRgb(C_COLD, C_LAMP, flip), hb = 0.5 * (1 + 0.14 * eN(t)) * (1 + 0.25 * u.hitPulse(t, 0.25));
      var br = Math.sin(t * 1.6) * 1.1, look = seg(t, 0.4, 3.5, eSine);
      g.save(); g.translate(lp.x, lp.y); g.scale(lp.s, lp.s * lp.vs);
      g.globalAlpha = lp.a; g.globalCompositeOperation = 'source-over'; g.lineCap = 'round'; g.lineJoin = 'round';
      // legs in the water: the lower part is dissolved into light
      var hx = 6 + 4 * look, hy = -240 + br * 0.6 - 4 * look;
      // book
      g.save(); g.translate(-19, -166 + br * 0.4); g.rotate(-0.16);
      g.fillStyle = '#10221f'; g.strokeStyle = rgba(mixRgb([207, 220, 245], C_WARMW, flip), 0.95); g.lineWidth = 4;
      g.beginPath(); g.roundRect(-16, -33, 32, 66, 4); g.fill(); g.stroke();
      g.lineWidth = 1.6; g.strokeStyle = rgba(mixRgb([207, 220, 245], C_WARMW, flip), 0.6);
      g.beginPath(); g.moveTo(-9, -24); g.lineTo(-9, 24); g.moveTo(-3, -24); g.lineTo(-3, 24); g.stroke();
      g.restore();
      var lg = g.createLinearGradient(0, -110, 0, 0);
      var bodyC = mixRgb([214, 226, 248], [255, 238, 214], flip);
      lg.addColorStop(0, rgba(bodyC, 0.95)); lg.addColorStop(0.55, rgba(bodyC, 0.75)); lg.addColorStop(1, rgba(mixRgb(C_TEAL, C_GOLD, 0.5), 0.0));
      g.strokeStyle = rgba(bodyC, 0.95); g.lineWidth = 6;
      g.beginPath();
      g.moveTo(hx * 0.4, hy + 25); g.lineTo(0, -198 + br);
      g.moveTo(0, -198 + br); g.quadraticCurveTo(4, -152, -3, -108);
      g.moveTo(1, -190 + br); g.lineTo(18, -150 + br * 0.6); g.lineTo(24, -112);
      g.moveTo(-1, -190 + br); g.lineTo(-27, -160 + br * 0.6); g.lineTo(-9, -134 + br * 0.4);
      g.stroke();
      g.strokeStyle = lg;
      g.beginPath();
      g.moveTo(-3, -108); g.lineTo(-14, -56); g.lineTo(-18, -4);
      g.moveTo(-3, -108); g.lineTo(9, -56); g.lineTo(15, -4);
      g.stroke();
      g.restore();
      // the head stays round whatever the squash of the body
      g.save(); g.translate(lp.x + hx * lp.s, lp.y + hy * lp.s * lp.vs); g.scale(lp.s, lp.s); hx = 0; hy = 0;
      g.globalAlpha = lp.a;
      var hg = g.createRadialGradient(hx - 6, hy - 7, 2, hx, hy, 23);
      hg.addColorStop(0, rgba(mixRgb([236, 244, 255], [255, 249, 236], flip), 0.6 + 0.4 * hb));
      hg.addColorStop(0.55, rgba(lamp, 0.5 + 0.45 * hb));
      hg.addColorStop(1, rgba(mixRgb([110, 150, 225], [232, 170, 92], flip), 0.55 + 0.4 * hb));
      g.fillStyle = hg; g.beginPath(); g.arc(hx, hy, 23, 0, 6.2832); g.fill();
      g.globalCompositeOperation = 'lighter';
      glowDisc(g, hx, hy, 110, lamp, 0.34 * hb * lp.a); glowDisc(g, hx, hy, 38, lamp, 0.36 * hb * lp.a);
      g.restore();
    }

    // ---------------- BACK canvas: plain, haze, river body, light shafts, far lanterns, particles, ribbons, ripples ----------------
    var BANK_L = [], BANK_R = [], BANK_SAMPLES = 90;
    var LOWK = 1 / 6, LOW = document.createElement('canvas'); LOW.width = Math.round(W * LOWK); LOW.height = Math.round(H * LOWK);
    var LOWG = LOW.getContext('2d');
    function drawBack(g, t) {
      var c = cam(t), lv = level(t), en = eN(t), wk = warmth(t), hit = u.hitPulse(t, 0.3), wK = widthK(t), rev = revealR(t);
      var fp = flowPos(t), endA = 1 - seg(t, T_DIVE + 0.35, T_DIVE + 1.1, eP2io), blk = blockAmt(t);
      g.globalCompositeOperation = 'source-over';

      // warm haze where the river goes into the distance (the first warm light), rises with the music
      var far = rAt(RL * 0.62); proj(c, far.x, far.z);
      var hzX = clamp(PJ[0], 900, 2300), hzY = clamp(PJ[1], -200, 600);
      var hz = (0.1 + 0.16 * seg(t, -0.2, 3, eP2o) + 0.08 * seg(t, T_LIFT - 0.1, T_LIFT + 0.8, eP2o)) * (0.85 + 0.3 * en) * endA;
      var hzg = g.createRadialGradient(hzX, hzY, 0, hzX, hzY, 980);
      hzg.addColorStop(0, rgba([255, 207, 112], hz)); hzg.addColorStop(0.35, rgba([220, 150, 80], hz * 0.38)); hzg.addColorStop(1, rgba([60, 90, 80], 0));
      g.fillStyle = hzg; g.fillRect(0, 0, W, H);

      // river body: banks projected, three polygons (feathered edge, body, bright core)
      var s0 = Math.max(0, S_LAND - rev - 200), s1 = Math.min(RL, S_LAND + rev + 200);
      BANK_L.length = 0; BANK_R.length = 0;
      for (var b = 0; b <= BANK_SAMPLES; b++) {
        var sb = lerp(s0, s1, b / BANK_SAMPLES), ra = rAt(sb), hw = halfW(sb) * wK;
        var rv = clamp((rev - Math.abs(sb - S_LAND)) / 220, 0, 1); hw *= 0.15 + 0.85 * rv;
        var nx = -ra.tz, nz = ra.tx, cx0 = ra.x, cz0 = ra.z;
        proj(c, cx0 + nx * hw, cz0 + nz * hw); BANK_L.push(PJ[0], PJ[1]);
        proj(c, cx0 - nx * hw, cz0 - nz * hw); BANK_R.push(PJ[0], PJ[1]);
      }
      // the body is drawn small (1/6) and scaled up: the bilinear upscale is a free, smooth feather at any resolution
      function poly(q, scale, fill) {
        q.beginPath();
        for (var i = 0; i <= BANK_SAMPLES; i++) {
          var lx = BANK_L[i * 2], ly = BANK_L[i * 2 + 1], rx = BANK_R[i * 2], ry = BANK_R[i * 2 + 1], mx = (lx + rx) / 2, my = (ly + ry) / 2;
          var x = mx + (lx - mx) * scale, y = my + (ly - my) * scale; if (i === 0) q.moveTo(x, y); else q.lineTo(x, y);
        }
        for (var j = BANK_SAMPLES; j >= 0; j--) {
          var lx2 = BANK_L[j * 2], ly2 = BANK_L[j * 2 + 1], rx2 = BANK_R[j * 2], ry2 = BANK_R[j * 2 + 1], mx2 = (lx2 + rx2) / 2, my2 = (ly2 + ry2) / 2;
          q.lineTo(mx2 + (rx2 - mx2) * scale, my2 + (ry2 - my2) * scale);
        }
        q.closePath(); q.fillStyle = fill; q.fill();
      }
      var bodyA = endA * clamp(rev / 300, 0, 1);
      if (bodyA > 0.003) {
        var q = LOWG;
        q.setTransform(1, 0, 0, 1, 0, 0); q.clearRect(0, 0, LOW.width, LOW.height); q.setTransform(LOWK, 0, 0, LOWK, 0, 0);
        q.globalCompositeOperation = 'source-over';
        poly(q, 1.3, rgba([9, 31, 31], 0.3 * bodyA));
        poly(q, 1.1, rgba([11, 36, 37], 0.45 * bodyA));
        poly(q, 0.94, rgba(C_DEEP, 0.7 * bodyA));
        q.globalCompositeOperation = 'lighter';
        poly(q, 0.62, rgba(mixRgb([20, 70, 62], [70, 52, 24], wk * 0.6), (0.18 + 0.1 * en) * lv * bodyA));
        poly(q, 0.3, rgba(mixRgb([30, 96, 84], [110, 80, 34], wk * 0.7), (0.12 + 0.08 * en) * lv * bodyA));
        g.imageSmoothingEnabled = true; g.imageSmoothingQuality = 'high';
        g.drawImage(LOW, 0, 0, W, H);
      }

      // soft light shafts from the warm haze, slowly sweeping (volumetric light)
      g.globalCompositeOperation = 'lighter';
      for (var sh = 0; sh < 7; sh++) {
        var ang = 2.5 + sh * 0.075 + 0.035 * Math.sin(t * 0.21 + sh * 1.7), len = 2300;
        var sa = (0.011 + 0.009 * en) * seg(t, 0.2, 3.2, eSine) * endA * (sh % 2 ? 0.8 : 1.2) * (1 + 0.4 * seg(t, T_LIFT, T_LIFT + 0.8, eP2o));
        if (sa <= 0.002) continue;
        var ex = hzX + Math.cos(ang) * len, ey = hzY + Math.sin(ang) * len, half = 0.02 + 0.006 * (sh % 3);
        var lgr = g.createLinearGradient(hzX, hzY, ex, ey);
        lgr.addColorStop(0, rgba([255, 214, 140], sa)); lgr.addColorStop(0.6, rgba([255, 200, 120], sa * 0.35)); lgr.addColorStop(1, rgba([255, 200, 120], 0));
        g.fillStyle = lgr; g.beginPath(); g.moveTo(hzX, hzY);
        g.lineTo(hzX + Math.cos(ang - half) * len, hzY + Math.sin(ang - half) * len); g.lineTo(hzX + Math.cos(ang + half) * len, hzY + Math.sin(ang + half) * len); g.closePath(); g.fill();
      }

      // far lanterns (bokeh) on the far river
      var farA = seg(t, T_LAN[0] - 0.6, T_LAN[2] + 0.4, eP2o) * endA;
      if (farA > 0.003) {
        FAR.forEach(function (f, i) {
          if (!f.cv) return;
          var sF = RL * f.s + 10 * Math.max(0, t - 7), ra = rAt(sF), hw = halfW(sF);
          proj(c, ra.x - ra.tz * hw * f.w, ra.z + ra.tx * hw * f.w);
          var x = PJ[0], y = PJ[1] - 6 * Math.sin(t * 2.1 + f.ph), k = PJ[2], wd = f.sz * k / 0.75 * 0.62;
          if (x < -300 || x > W + 300 || y < -300 || y > H + 300) return;
          var a = farA * (0.62 + 0.12 * Math.sin(t * 1.3 + f.ph)) * (0.85 + 0.25 * en) * (1 - koAmount(x, y - wd / 3));
          g.globalCompositeOperation = 'lighter';
          var sz = wd * 2.2; g.globalAlpha = a * 0.8; g.drawImage(SPR_SOFT_GOLD, x - sz, y - wd / 1.5 / 2 - sz, sz * 2, sz * 2);
          g.globalCompositeOperation = 'source-over'; g.globalAlpha = a * 0.9;
          var pw = wd * (1 + 2 * f.pad / f.sz), ph = pw * f.cv.height / f.cv.width;
          g.drawImage(f.cv, x - pw / 2, y - ph, pw, ph);
          g.globalCompositeOperation = 'lighter'; g.globalAlpha = a * 0.75; g.drawImage(SPR_SOFT_GOLD, x - pw * 0.62, y - ph * 1.08, pw * 1.24, ph * 1.16);
          g.globalAlpha = a * 0.35; g.drawImage(f.cv, x - pw / 2, y - ph, pw, ph);
          // reflection streaks
          g.globalCompositeOperation = 'lighter';
          for (var r = 0; r < 4; r++) { g.globalAlpha = a * (0.32 - r * 0.06); g.fillStyle = 'rgb(255,200,120)'; var rw = wd * (0.7 - r * 0.12) * (0.8 + 0.2 * Math.sin(t * 3 + r + f.ph)); g.fillRect(x - rw / 2, y + 4 + r * 7 * k, rw, 2.2 * k); }
          g.globalAlpha = 1;
        });
      }

      // ripples under the learner: light spreads from his feet
      g.globalCompositeOperation = 'lighter';
      var lpz = learnerPose(t);
      if (lpz.a > 0.01) {
        var feet = proj(c, LEARN.X, LEARN.Z), fx = feet[0], fy = feet[1], fk = feet[2], sq = 0.25 + 0.75 * c.sp * c.sp;
        var spread = seg(t, -0.05, 1.8, eP3o), pool = (0.25 + 0.55 * spread) * lpz.a * (0.9 + 0.3 * en);
        g.save(); g.translate(fx, fy); g.scale(1, sq);
        glowDisc(g, 0, 0, (90 + 230 * spread) * fk, mixRgb(C_TEAL, C_LAMP, 0.35 + 0.5 * seg(t, 0, 1.2)), 0.36 * pool);
        glowDisc(g, 0, 0, (30 + 60 * spread) * fk, C_LAMP, 0.5 * pool);
        for (var rr = 0; rr < 5; rr++) {
          var age = ((t + 0.0) - rr * BEAT * 2);
          var cyc = age < 0 ? -1 : age % (BEAT * 10);
          if (cyc < 0 || cyc > 3.2) continue;
          var rad = (40 + 300 * eP2o(cyc / 3.2)) * fk, ra2 = 0.42 * (1 - cyc / 3.2) * lpz.a;
          g.strokeStyle = rgba(mixRgb(C_TEAL, C_LAMP, 0.6), ra2); g.lineWidth = 2.2 * fk / Math.max(0.4, sq);
          g.beginPath(); g.arc(0, 0, rad, 0, 6.2832); g.stroke();
        }
        g.restore();
      }

      // river particles
      var V = fp * V_RIVER, brightAll = lv * (0.82 + 0.46 * en) * (1 + 0.35 * hit);
      var liftWave = T_LIFT <= t ? clamp((t - T_LIFT) / 0.9, 0, 1) : -1;
      for (var i = 0; i < NP; i++) {
        var p = PS[i];
        var s = p.s0 + V * p.vf; s = s - RL * Math.floor(s / RL);
        var dS = Math.abs(s - S_LAND), rv2 = clamp((rev - dS) / 160, 0, 1);
        var m = blk > 0 ? morphK(t, p.stg) : 0;
        if (rv2 <= 0 && m <= 0) continue;
        var ra3 = rAt(s), hw3 = halfW(s) * wK * (0.15 + 0.85 * rv2);
        var wob = u.noise3(s * 0.004, p.nz, t * 0.22) * 22;
        var ww = p.w * hw3 + wob;
        var X = ra3.x - ra3.tz * ww, Z = ra3.z + ra3.tx * ww;
        proj(c, X, Z);
        var x = PJ[0], y = PJ[1], k = PJ[2];
        var tw = 0.62 + 0.38 * Math.sin(p.ph + t * p.fq * 6.283);
        var fog = seg(k, 0.36, 0.78);
        var edge = 1 - 0.5 * p.w * p.w;
        var a = p.a * tw * fog * edge * brightAll * Math.max(rv2, m);
        var col = sprIdx(p.h * 0.5 + wk * 0.62 + (1 - fog) * 0.18 - 0.12 + 0.15 * hit * p.a);
        if (liftWave >= 0) { var wv = Math.exp(-Math.pow((s / RL - liftWave * 1.3) / 0.06, 2)) * (1 - liftWave * 0.7); a *= 1 + 1.4 * wv; col = sprIdx(col / 9 + 0.3 * wv); }
        var r = p.r * k * (0.9 + 0.3 * en);
        if (m > 0) {
          var bl = BLOCK[p.li], txx = BL_LEFT + p.tx, tyy = bl.y + p.lj * (1 - 0.55 * m);
          x = lerp(x, txx, m); y = lerp(y, tyy, m);
          r = lerp(r, 1.5 + 0.6 * p.a, m); a = lerp(a, 0.55 + 0.45 * p.a, m); if (m > 0.5) col = 9;
        }
        if (x < -40 || x > W + 40 || y < -40 || y > H + 40 || a < 0.01) continue;
        var sz = r * 3.0;
        g.globalAlpha = clamp(a, 0, 1);
        g.drawImage(m > 0.5 ? SPR_W : SPR[col], x - sz, y - sz, sz * 2, sz * 2);
      }
      // current streaks (the sense of flow), not in the block
      g.lineCap = 'round';
      var VS = fp * V_RIVER * 1.18;
      for (var j2 = 0; j2 < NSK; j2++) {
        var q2 = SK[j2], s2 = q2.s0 + VS * q2.vf; s2 = s2 - RL * Math.floor(s2 / RL);
        var rv3 = clamp((rev - Math.abs(s2 - S_LAND)) / 160, 0, 1); if (rv3 <= 0) continue;
        var ra4 = rAt(s2), hw4 = halfW(s2) * wK * (0.15 + 0.85 * rv3), w4 = q2.w * hw4 + u.noise3(s2 * 0.004, q2.nz, t * 0.22) * 22;
        proj(c, ra4.x - ra4.tz * w4, ra4.z + ra4.tx * w4); var x1 = PJ[0], y1 = PJ[1], k1 = PJ[2];
        var ln = q2.len * (0.8 + 0.6 * en + 0.9 * seg(t, T_DIVE, D, eP2i));
        proj(c, ra4.x - ra4.tz * w4 - ra4.tx * ln, ra4.z + ra4.tx * w4 - ra4.tz * ln); var x2 = PJ[0], y2 = PJ[1];
        var aa = q2.a * rv3 * seg(k1, 0.4, 0.8) * lv * (0.7 + 0.5 * en) * endA * 0.5;
        if (aa < 0.01) continue;
        g.globalAlpha = clamp(aa, 0, 1); g.strokeStyle = rgba(mixRgb(C_TEAL, C_GOLD, clamp(q2.h * 0.5 + wk * 0.6, 0, 1)), 1); g.lineWidth = 1.3 * k1;
        g.beginPath(); g.moveTo(x1, y1); g.lineTo(x2, y2); g.stroke();
      }
      g.globalAlpha = 1;

      // lantern light on the water: pools and broken reflections
      LAN.forEach(function (L, i) {
        var s3 = LS[i]; if (!s3 || s3.op <= 0.01) return;
        var k3 = s3.k, sq3 = 0.3 + 0.7 * c.sp * c.sp, a3 = s3.op * (0.85 + 0.3 * en);
        g.save(); g.translate(s3.x, s3.y + 6); g.scale(1, sq3 * 0.6);
        glowDisc(g, 0, 0, s3.w * 0.72, [255, 190, 100], 0.32 * a3);
        g.restore();
        for (var r2 = 0; r2 < 7; r2++) {
          var ry = s3.y + 14 + r2 * 9 * k3, rw2 = s3.w * (0.62 - r2 * 0.07) * (0.75 + 0.25 * Math.sin(t * 2.6 + r2 * 1.9 + i));
          var off = 10 * k3 * Math.sin(t * 1.7 + r2 * 2.3 + i);
          if (rw2 <= 2) continue;
          g.globalAlpha = a3 * (0.36 - r2 * 0.045); g.fillStyle = r2 % 2 ? 'rgb(255,214,150)' : 'rgb(255,186,98)';
          g.fillRect(s3.x - rw2 / 2 + off, ry, rw2, 2.4 * k3);
        }
        // landing ring
        var ag = t - L.t;
        if (ag > -0.05 && ag < 2.2) {
          g.save(); g.translate(s3.x, s3.y + 4); g.scale(1, sq3 * 0.5);
          g.globalAlpha = 0.5 * (1 - ag / 2.2); g.strokeStyle = 'rgb(255,214,150)'; g.lineWidth = 2.5 * k3;
          g.beginPath(); g.arc(0, 0, s3.w * (0.45 + 0.6 * eP2o(clamp(ag / 2.2, 0, 1))), 0, 6.2832); g.stroke();
          g.restore();
        }
        g.globalAlpha = 1;
      });

      // 34 candles far down the river (one per study)
      var cA = endA;
      for (var ci = 0; ci < CANDLES.length; ci++) {
        var cd = CANDLES[ci], ca = seg(t, cd.t, cd.t + 0.35, eP2o) * cA; if (ca <= 0.003) continue;
        var sC = RL * cd.s + 20 * (t - cd.t), raC = rAt(sC), hwC = halfW(sC);
        proj(c, raC.x - raC.tz * hwC * cd.w, raC.z + raC.tx * hwC * cd.w);
        var xC = PJ[0], yC = PJ[1] - 1.5 * Math.sin(t * 2.4 + cd.ph), kC = PJ[2];
        var pop = 1 + 1.2 * pulse(t - cd.t, 0.03, 0.25);
        g.globalAlpha = clamp(ca * 0.9, 0, 1);
        // a small candle boat: warm halo, amber flame (taller than wide), a white core, a long reflection
        var fl = 1 + 0.12 * Math.sin(t * 9.1 + cd.ph) + 0.08 * Math.sin(t * 13.7 + cd.ph * 2);
        g.globalAlpha = clamp(ca * 0.55, 0, 1); var szC = 26 * kC * pop; g.drawImage(SPR_AMBER, xC - szC, yC - 5 * kC - szC, szC * 2, szC * 2);
        g.globalAlpha = clamp(ca, 0, 1); g.drawImage(SPR_AMBER, xC - 5.5 * kC * pop, yC - 15 * kC * pop * fl, 11 * kC * pop, 20 * kC * pop * fl);
        g.drawImage(SPR_W, xC - 2.6 * kC, yC - 9 * kC * fl, 5.2 * kC, 8 * kC * fl);
        g.globalAlpha = clamp(ca * 0.8, 0, 1); g.fillStyle = 'rgb(255,226,170)'; g.fillRect(xC - 7 * kC, yC - 0.8 * kC, 14 * kC, 1.6 * kC);
        var rg = g.createLinearGradient(0, yC + 2 * kC, 0, yC + 24 * kC); rg.addColorStop(0, 'rgba(255,181,71,0.5)'); rg.addColorStop(1, 'rgba(255,181,71,0)');
        g.globalAlpha = clamp(ca, 0, 1); g.fillStyle = rg; g.fillRect(xC - 1.4 * kC, yC + 2 * kC, 2.8 * kC, 22 * kC);
      }
      g.globalAlpha = 1;

      // sentence ribbons
      drawSentences(g, t, c);

      // s04's falling word sand (screen space), draining into the river
      drawStream(g, t, c);

      // the block's glow lines (the page s06 opens on)
      if (blk > 0) {
        g.globalCompositeOperation = 'lighter';
        for (var li = 0; li < NL; li++) {
          var bl2 = BLOCK[li];
          for (var wi = 0; wi < bl2.spans.length; wi++) {
            var x0s = BL_LEFT + bl2.spans[wi][0], x1s = BL_LEFT + bl2.spans[wi][1], ww2 = x1s - x0s;
            var ga = glowAmt(t);
            g.globalAlpha = 0.34 * ga; g.drawImage(SPR_SOFT_GOLD, x0s - 14, bl2.y - 22, ww2 + 28, 44);
            g.globalAlpha = 0.45 * ga; g.drawImage(SPR_W, x0s - 4, bl2.y - 5, ww2 + 8, 10);
          }
        }
        g.globalAlpha = 1;
      }
      g.globalCompositeOperation = 'source-over';
    }

    // place a sentence on its lane, walking back from the head so that the SCREEN spacing of the letters is their
    // advance x the local scale (letters never crowd where the river recedes). Fills GX/GY/GK/GA/GS per glyph.
    var GX = [], GY = [], GK = [], GA = [], GS = [];
    function placeSentence(c, S, head, lane, wK) {
      var s = head, n = S.gl.length;
      for (var j = n - 1; j >= 0; j--) {
        var sc = clamp(s, 0, RL - 8), ra = rAt(sc), hw = halfW(sc) * wK, w0 = lane * hw;
        var bx = ra.x - ra.tz * w0, bz = ra.z + ra.tx * w0;
        proj(c, bx, bz); var x0 = PJ[0], y0 = PJ[1], k0 = PJ[2];
        var rb = rAt(sc + 6), hwb = halfW(sc + 6) * wK, wb = lane * hwb;
        proj(c, rb.x - rb.tz * wb, rb.z + rb.tx * wb);
        var dx = PJ[0] - x0, dy = PJ[1] - y0, ka = Math.hypot(dx, dy) / 6, ang = Math.atan2(dy, dx);
        if (s < 0) { x0 += Math.cos(ang) * s * k0; y0 += Math.sin(ang) * s * k0; }
        GX[j] = x0; GY[j] = y0; GK[j] = k0; GA[j] = ang; GS[j] = s;
        if (j > 0) s -= (S.gl[j].c - S.gl[j - 1].c) * k0 / Math.max(ka, 0.15 * k0);
      }
      return s;
    }
    function drawSentences(g, t, c) {
      var fpt = flowPos(t) - flowPos(0), wK = widthK(t), rev = revealR(t), blk = blockAmt(t);
      var sq = 0.84 + 0.16 * c.sp, en = eN(t), lv = level(t);
      g.font = SFONT; g.textBaseline = 'alphabetic'; g.textAlign = 'center';
      for (var n = 0; n < SCHED.length; n++) {
        var sc = SCHED[n], S = SR[sc.i], head = sc.head0 + V_TEXT * fpt, lane = LANES[sc.lane], ta = textA(t, sc.era);
        var mS = blk > 0 ? morphK(t, 0.15 + 0.12 * n) : 0;
        if (head < -200 && mS <= 0) continue;
        var tail = placeSentence(c, S, head, lane, wK);
        if (tail > RL && mS <= 0) continue;
        var line = BLOCK[SENT_LINE[n] % NL], N = S.gl.length;
        // ribbon of light under the text
        g.globalCompositeOperation = 'lighter';
        for (var j0 = 0; j0 < N; j0 += 2) {
          var sR = GS[j0]; if (sR < 0 || sR > RL) continue;
          var rvR = clamp((rev - Math.abs(sR - S_LAND)) / 160, 0, 1); if (rvR <= 0) continue;
          var k = GK[j0], x = GX[j0] + Math.sin(GA[j0]) * FS * 0.3 * k, y = GY[j0] - Math.cos(GA[j0]) * FS * 0.3 * k * sq;
          if (mS > 0) { x = lerp(x, BL_LEFT + line.width * (S.gl[j0].c / S.len), mS); y = lerp(y, line.y, mS); k = lerp(k, 1, mS); }
          var taper = Math.sin(Math.PI * (j0 + 0.5) / N), aR = 0.15 * taper * rvR * lv * (0.8 + 0.4 * en) * seg(k, 0.45, 0.85) * (1 - koAmount(x, y) * 0.8) * (0.45 + 0.55 * ta);
          if (aR < 0.004) continue;
          var szR = 24 * k; g.globalAlpha = aR; g.drawImage(SPR_SOFT_GOLD, x - szR * 1.5, y - szR, szR * 3, szR * 2);
        }
        // glyphs and their points of light
        for (var j = 0; j < N; j++) {
          var G = S.gl[j]; if (G.ch === ' ') continue;
          var sG = GS[j], inRiver = sG >= 0 && sG <= RL;
          if (!inRiver && !(mS > 0)) continue;
          var x0 = GX[j], y0 = GY[j], k0 = GK[j], ang = GA[j];
          var rvG = clamp((rev - Math.abs(clamp(sG, 0, RL) - S_LAND)) / 120, 0, 1);
          var px = FS * k0 * sq;
          var aSize = seg(px, 40, 46, eSine);                    // readable (>= 40 px) or dissolving into a point of light
          var leg = clamp(ta * 1.6 - G.dot * 0.6, 0, 1);          // the lantern beat dissolves the letters, staggered
          var ko = koAmount(x0, y0);
          // letters never meet the frame edge: within 110 px of it they turn into points of light
          var edge = Math.min(seg(x0, 10, 120), seg(W - x0, 10, 120), seg(y0, 10, 120), seg(H - y0, 10, 140));
          var vis = rvG * (inRiver ? 1 : 0), keep = aSize * leg * (1 - ko) * (mS > 0 ? 1 : edge);
          var aG = vis * keep * (1 - seg(mS, 0.15, 0.7));
          var aD = vis * (1 - keep) * seg(k0, 0.3, 0.6) * (0.45 + 0.55 * G.dot) * (1 - 0.6 * ko);
          var gx = x0, gy = y0, gk = k0, gang = ang, gsq = sq;
          if (mS > 0) {
            gx = lerp(x0, BL_LEFT + line.width * (G.c / S.len), mS); gy = lerp(y0, line.y, mS); gk = lerp(k0, 0.9, mS); gang = lerp(ang, 0, mS); gsq = lerp(sq, 1, mS);
            aD = lerp(aD, 0.6, seg(mS, 0.2, 0.6)) * (1 - 0.65 * seg(mS, 0.6, 1));
          }
          if (aG > 0.004 && gx > -60 && gx < W + 60 && gy > -60 && gy < H + 60) {
            var cs = Math.cos(gang), sn = Math.sin(gang);
            g.setTransform(dpr * gk * cs, dpr * gk * sn, -dpr * gk * gsq * sn, dpr * gk * gsq * cs, dpr * gx, dpr * gy);
            g.globalCompositeOperation = 'source-over';
            g.shadowColor = 'rgba(255,190,96,0.8)'; g.shadowBlur = 11 * dpr * gk;
            g.globalAlpha = clamp(aG * (0.9 + 0.1 * en), 0, 1);
            g.fillStyle = '#fff3df';
            g.fillText(G.ch, 0, FS * 0.34);
            g.shadowBlur = 0; g.shadowColor = 'rgba(0,0,0,0)';
            g.setTransform(dpr, 0, 0, dpr, 0, 0);
          }
          if (aD > 0.01 && gx > -40 && gx < W + 40 && gy > -40 && gy < H + 40) {
            g.globalCompositeOperation = 'lighter';
            var szD = (2.0 + 1.4 * G.dot) * gk * 2.6; g.globalAlpha = clamp(aD * lv, 0, 1);
            g.drawImage(mS > 0.5 ? SPR_W : SPR[8], gx - szD, gy - FS * 0.2 * gk - szD, szD * 2, szD * 2);
          }
        }
      }
      g.globalAlpha = 1; g.globalCompositeOperation = 'source-over'; g.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    // s04's stream of word sand falling from the top edge into the pool where the river is born
    var GRAINS = [];
    (function () {
      var R = u.rand('s05:sand'), L = 'abcdefghijklmnopqrstuvwxyz';
      for (var i = 0; i < 260; i++) GRAINS.push({ ph: R(), x: R.gauss() * 7, ch: L[Math.floor(R() * 26)], sz: R.range(11, 17), rot: R.range(-3, 3), a: R.range(0.5, 1), letter: R() < 0.45 });
    })();
    var T_FALL = 0.55, T_STOP = 0.22;
    function drawStream(g, t, c) {
      if (t > T_STOP + T_FALL + 0.1) return;
      var ra = rAt(S_LAND); proj(c, ra.x, ra.z); var lx = PJ[0], ly = PJ[1];
      g.globalCompositeOperation = 'lighter';
      // splash glow where it lands
      var sp = (1 - seg(t, 0.1, 0.9, eP2i)) * clamp(1 + (t + 0.8) / 0.3, 0, 1);
      glowDisc(g, lx, ly, 120, [200, 236, 222], 0.3 * sp); glowDisc(g, lx, ly, 40, [255, 246, 226], 0.5 * sp);
      g.font = '400 16px "Source Serif 4 Display"'; g.textAlign = 'center'; g.textBaseline = 'middle';
      for (var i = 0; i < GRAINS.length; i++) {
        var gr = GRAINS[i];
        // phase along the fall (0 top, 1 landed); emitted at te = t - phase*T_FALL, the stream stops emitting at T_STOP
        var ph = (t / T_FALL + gr.ph) % 1; if (ph < 0) ph += 1;
        var te = t - ph * T_FALL; if (te > T_STOP) continue;
        var thin = clamp(1 - (te - (T_STOP - 0.5)) / 0.5, 0.25, 1);
        var e = ph * ph;                  // accelerates
        var x0 = 960 + gr.x * 2.2 * thin, y0 = -30;
        var x = lerp(x0, lx + gr.x * 0.6, e) + Math.sin(ph * 3.14) * 40 * (lx - 960) / 300 * 0.3;
        var y = lerp(y0, ly, e);
        var a = gr.a * (0.55 + 0.45 * thin) * (1 - seg(ph, 0.92, 1));
        g.globalAlpha = clamp(a, 0, 1);
        if (gr.letter) {
          g.save(); g.translate(x, y); g.rotate(gr.rot * ph); g.fillStyle = 'rgba(214,240,232,1)'; g.font = '400 ' + gr.sz.toFixed(1) + 'px "Source Serif 4 Display"'; g.fillText(gr.ch, 0, 0); g.restore();
        } else {
          var sz = 4.2; g.drawImage(SPR[3], x - sz, y - sz, sz * 2, sz * 2);
        }
      }
      g.globalAlpha = 1; g.globalCompositeOperation = 'source-over';
    }

    // ---------------- FRONT canvas: the learner and out-of-focus foreground sparkles ----------------
    var BOK = [];
    (function () {
      var R = u.rand('s05:bokeh');
      for (var i = 0; i < 16; i++) BOK.push({ x: R.range(-100, 2020), y: R.range(860, 1180), r: R.range(18, 46), sp: R.range(18, 40), ph: R() * 6.28, warm: R() < 0.55, a: R.range(0.06, 0.16) });
    })();
    var FLY = [];
    (function () {
      var R = u.rand('s05:fireflies');
      for (var i = 0; i < 48; i++) FLY.push({ x: R.range(-60, 1500), y: R.range(120, 860), z: R.range(0.4, 1.3), ph: R() * 6.28, fq: R.range(0.25, 0.6), warm: R() < 0.7, n: R() * 50 });
    })();
    function drawFront(g, t) {
      var c = cam(t), en = eN(t), lv = level(t), endA = 1 - seg(t, T_DIVE, T_DIVE + 0.6, eP2i);
      // fireflies over the dark banks (they drift, rise slowly and blink; brighter with the music)
      var ffA = seg(t, 0.8, 3.0, eSine) * endA;
      if (ffA > 0.003) {
        g.globalCompositeOperation = 'lighter';
        for (var fi = 0; fi < FLY.length; fi++) {
          var f = FLY[fi];
          var x = f.x + 70 * u.noise3(f.n, t * 0.07, 1.3) - (c.Tx + 20) * 0.35 * f.z, y = f.y + 46 * u.noise3(f.n + 7, t * 0.06, 2.1) - 7 * t * f.z + (c.Tz + 40) * 0.25 * f.z;
          var blink = Math.pow(0.5 + 0.5 * Math.sin(f.ph + t * f.fq * 6.283), 3);
          var a = ffA * (0.15 + 0.85 * blink) * (0.55 + 0.6 * en) * (1 - koAmount(x, y)) * 0.75;
          if (a < 0.01) continue;
          var r = (2.2 + 1.6 * f.z) * (1 + 0.25 * en);
          g.globalAlpha = clamp(a * 0.5, 0, 1); g.drawImage(f.warm ? SPR_SOFT_GOLD : SPR_SOFT_TEAL, x - r * 6, y - r * 6, r * 12, r * 12);
          g.globalAlpha = clamp(a, 0, 1); g.drawImage(f.warm ? SPR[8] : SPR[2], x - r * 1.6, y - r * 1.6, r * 3.2, r * 3.2);
        }
        g.globalAlpha = 1; g.globalCompositeOperation = 'source-over';
      }
      drawLearner(g, t);
      // foreground bokeh drifting with the current (parallax 1.5x)
      g.globalCompositeOperation = 'lighter';
      var fa = seg(t, 0.3, 2.2, eP2o) * endA * lv;
      if (fa > 0.003) {
        for (var i = 0; i < BOK.length; i++) {
          var b = BOK[i], x = ((b.x + b.sp * flowPos(t) * 2.2 - c.Tx * 1.5) % 2200 + 2200) % 2200 - 140, y = b.y - b.sp * 0.6 * t + 14 * Math.sin(t * 0.7 + b.ph) + (c.Tz + 40) * 0.9;
          var a = b.a * fa * (0.8 + 0.4 * en) * (0.7 + 0.3 * Math.sin(t * 1.1 + b.ph));
          g.globalAlpha = clamp(a, 0, 1);
          var sz = b.r * 2.2; g.drawImage(b.warm ? SPR_SOFT_GOLD : SPR_SOFT_TEAL, x - sz, y - sz, sz * 2, sz * 2);
        }
      }
      g.globalAlpha = 1; g.globalCompositeOperation = 'source-over';
    }
  });
})();
