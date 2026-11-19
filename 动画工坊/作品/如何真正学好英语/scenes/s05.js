/* s05  A river of light (global 55.592 to 74.342 s, bars 31 to 40 of the Cornfield Chase edit; 18.75 s).
 * Music: 55.592 is the strongest hit of the whole score (the burst, strength 1.0: the huge low register comes in, full
 * orchestra, sixteenths driving; arrival F F G G Am Am). 66.842 (bar 37) the drive starts (F G Am G, high layer grows);
 * bar 40 (72.467) is the small peak before s06. Beat 0.625 s, bar 1.875 s; every cue below is a storyboard cue.
 *
 * Signature shot "一河星光" (the first warm light of the film). s04 ends on one thin vertical thread of word sand whose
 * tip is the motif dot. On the burst downbeat the tip strikes the dark plain first: a warm (never white) flare, a
 * shock ring, a horizontal anamorphic streak, a 4 % camera push (expo.out 0.6 s), a spray of sparks; the thread drains
 * into the impact and the river floods out of it along its channel (SVG liquid displacement 0 > 40 > 12 px in 1.6 s).
 * The river is ~3000 points of light on a real ground plane (seeded simplex wobble, teal #3cc6a8 to warm gold #ffcf70)
 * whose current is the integral of the music energy. The dot itself survives as a dim (30 %) but now warm point on the
 * water and rides the current for the whole scene. The faceless learner stands in the shallows: light spreads from his
 * feet and his head lamp flips from cold blue to pale gold (#ffe2b0, 50 %). On G (59.342) the camera cranes from
 * almost straight down to a 35 deg oblique view in two bars and six real sentences from the user's stories (01, 03,
 * 05, 11, 12, 16) condense out of the light and ride the river letter by letter (>= 40 px near the camera, points of
 * light far away). On the three beats of bar 35 (Am) three of the user's own watercolours float in as paper lanterns
 * (01, 61, 70; 720, 600 and 480 px wide, cut 2:1 so the river stays visible between them) with paper name tags; 60,
 * 54, 41 and 35 glow far away as bokeh lanterns. The dot keeps to clear water beside them (its path is keyed so it
 * never hides behind a card or a line of text) and rings softly on every bar line.
 * Bar 37 (drive): the river widens and lifts one step, the lanterns drift away and the learner wades a few steps
 * downstream; on beat 2 the river dims one step for the
 * last line and 34 candle lights appear one by one far down the river (one per study in Nakanishi's meta-analysis,
 * an easter egg; no number on screen apart from the line). Bar 39 (G): the camera dives at the water, every point of
 * light straightens (the three sentences on screen level out, in order, then dissolve into beads); on bar 40 they lie
 * as the six lines of s06's reading page and on beat 2 the dot settles where the dot of evidence's i will be (match cut).
 *
 * Techniques: liquid displacement (feTurbulence + feDisplacementMap birth of the river), generative particles
 * (flow-field river, spray, candles, fireflies, bokeh), motion along a path (text on the river spline, lanterns
 * drifting with the current, the motif dot), the user's own artwork (3 lanterns + 4 bokeh lanterns), faceless vector
 * character, 2.5D camera (real ground-plane projection, push, crane tilt, dolly, dive; parallax for free), light
 * (warm flare, anamorphic streak, lantern glow and reflections, haze, light shafts, scrims), text effects (char pops
 * with back.out, blur rise, gradient kicker), music sync (energy-driven current, glow and brightness; hit glints).
 *
 * HANDOFF in (cut from s04 at global 55.592): s04's last frame is the navy radial background (#121c36 at 60 % 45 %,
 *   #0c1428, #0a1122) with one thin glowing vertical thread at x = 960 from y = 300 down to its tip at (960, 712); the
 *   tip is the motif dot (30 %, cold, #bfeee6 glow). Frame 0 here draws exactly that, plus the first frame of the burst.
 * HANDOFF out (cut to s06 at global 74.342). Last frame: background #0a1622 (plain; the engine's vignette); a faint
 *   frosted reading page (rect x 180, y 260, 1560 x 560, radius 28, fill rgba(18,36,52,.42), 1.5 px border
 *   rgba(190,225,235,.10)); six horizontal lines of soft warm light beads (#fff1c9 core, gold glow, about 55 %) lying
 *   exactly on the words of s06's 50-word passage set in Source Serif 4 Display 400 42 px, greedy word wrap at WRAP
 *   (chosen at build: start 1360, step 10 until exactly 6 lines), left aligned at x = round(960 - widest line / 2), line
 *   pitch 72 px, x-height centres 360 432 504 576 648 720 (baseline = centre + x-height/2). The word "evidence." has no beads:
 *   only the motif dot (warm, 30 %) sits exactly where the dot of its i is. window.__s05Block holds
 *   {font, left, wrap, maxWidth, pitch, xh, lines:[{y, baseline, width, text}], evidence:{line, x0, x1, dotX, dotY, dotR},
 *   page:{x, y, w, h, r}} for s06 to read.
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
    var eSine = E('sine.inOut'), eSineO = E('sine.out'), eP2o = E('power2.out'), eP2i = E('power2.in'), eP2io = E('power2.inOut'),
      eP3o = E('power3.out'), eP3io = E('power3.inOut'), eP4o = E('power4.out'), eExpo = E('expo.out'),
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
    function esc(s) { return s.replace(/&/g, '&amp;').replace(/</g, '&lt;'); }
    function mark(str, subs, style) {   // the exact storyboard string with the given substrings wrapped in styled spans
      var out = '', pos = 0;
      subs.forEach(function (sub) {
        var i = str.indexOf(sub, pos); if (i < 0) throw new Error('s05: "' + sub + '" not in "' + str + '"');
        out += esc(str.slice(pos, i)) + '<span style="' + style + '">' + esc(sub) + '</span>'; pos = i + sub.length;
      });
      return out + esc(str.slice(pos));
    }

    await Promise.all([
      document.fonts.load('400 46px "Source Serif 4 Display"'),
      document.fonts.load('italic 400 46px "Source Serif 4 Display"'),
      document.fonts.load('700 42px "Noto Sans SC"'),
      document.fonts.load('900 84px "Noto Sans SC"')
    ]);

    // ---------------- music grid (local s; storyboard cues) ----------------
    var BEAT = 0.625;
    var T_G = 3.75;                          // bar 33, G: crane tilt starts, sentences condense
    var T_AM = 7.5;                          // bar 35, Am: second title, lanterns on beats 1 2 3
    var T_LAN = [7.5, 8.125, 8.75];
    var T_DRIVE = 11.25;                     // bar 37: drive, river wider and one step brighter, lanterns drift away
    var T_L3 = 11.875;                       // bar 37 beat 2: last line, river one step darker, candles
    var T_DIVE = 15.0;                       // bar 39, G: the dive, ribbons straighten
    var T_PAGE = 16.875;                     // bar 40: six lines of the page
    var T_LAND = 17.5;                       // bar 40 beat 2: the dot settles on the i
    var T_REST = 9.5, T_LEAVE0 = T_DRIVE, T_LEAVE1 = T_DRIVE + 0.6;   // lanterns: designed rest pose, drifting away
    function eN(t) { return clamp((u.energy(t, 0.08) - 0.55) / 0.3, 0, 1); }   // 0.55 .. 0.85 inside this scene

    // ---------------- current: integral of the energy-driven speed (pure function of t via a table) ----------------
    function speedMul(t) {
      return 0.8 + 0.4 * eN(t) + 1.3 * pulse(t, 0.03, 0.8) + 0.7 * pulse(t - T_G - 0.04, 0.05, 0.55)
        + 0.6 * pulse(t - T_DRIVE - 0.04, 0.05, 0.55) + 2.4 * seg(t, T_DIVE, T_PAGE, eP2i) * (1 - seg(t, T_PAGE, T_PAGE + 0.8));
    }
    var FP_T0 = -1, FP_DT = 1 / 120, FP_N = Math.ceil((D + 1.5 - FP_T0) / FP_DT) + 2, FP = new Float64Array(FP_N);
    (function () { var acc = 0; for (var i = 0; i < FP_N; i++) { FP[i] = acc; acc += speedMul(FP_T0 + i * FP_DT) * FP_DT; } })();
    function flowPos(t) {
      var x = (t - FP_T0) / FP_DT, i = Math.floor(x);
      if (i < 0) return (t - FP_T0) * 0.8;
      if (i >= FP_N - 1) return FP[FP_N - 1];
      return FP[i] + (FP[i + 1] - FP[i]) * (x - i);
    }
    var FP0 = flowPos(0);

    // ---------------- the river in world coordinates (ground plane X, Z; Z grows away from the camera) ----------------
    var RIVER_PTS = [[-900, -1300], [-660, -1000], [-480, -790], [-315, -590], [-120, -335], [190, -96], [640, 160],
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
    function nearestS(X, Z) { var best = 0, bd = 1e18; for (var i = 0; i < RN; i++) { var d = (RX[i] - X) * (RX[i] - X) + (RZ[i] - Z) * (RZ[i] - Z); if (d < bd) { bd = d; best = i; } } return best * STEP; }

    // ---------------- key places ----------------
    var S_LAND = nearestS(-150, -300);                    // where s04's thread strikes and the river is born
    var LAND = { x: rAt(S_LAND).x, z: RA.z };
    var LEARN = { X: -600, Z: -560 };                     // the learner, in the left shallows near the camera
    function halfW(s) { return 320 - 70 * clamp(s / RL, 0, 1); }

    // ---------------- camera ----------------
    // t <= 0: straight-ish down (80 deg), the impact point exactly under the thread tip (960, 712). Burst: 4 % push
    // (expo.out 0.6 s) that eases back; G (3.75): crane to 35 deg in two bars; slow dolly; G (15.0): the dive.
    var F = 1250, PHI0 = 80, D0 = 1250;
    var START = (function () {
      var sp = Math.sin(PHI0 * Math.PI / 180), cp = Math.cos(PHI0 * Math.PI / 180), dy = 712 - 540;
      var q = -dy * D0 / (sp * F + dy * cp);
      return { Tx: LAND.x, Tz: LAND.z - q };
    })();
    var REST = { Tx: -60, Tz: -60 };
    var CAM = { phi: 0, sp: 1, cp: 0, D: 1250, Tx: 0, Tz: 0, zm: 1, tilt: 0, dive: 0 };
    function cam(t) {
      var pre = seg(t, 0, T_G, eSine), tilt = seg(t, T_G, T_AM, eP2io), drift = seg(t, T_AM - 0.5, T_DIVE + 0.6, eSine);
      var look = seg(t, T_L3 - 0.4, T_DIVE + 0.3, eSine), dive = eP3io(seg(t, T_DIVE, T_PAGE + 0.3));
      var phi = lerp(PHI0 - 3 * pre, 35, tilt) - 1.2 * look;
      phi = lerp(phi, 84, dive);
      CAM.phi = phi; CAM.sp = Math.sin(phi * Math.PI / 180); CAM.cp = Math.cos(phi * Math.PI / 180);
      CAM.D = lerp(D0, 820, dive);
      CAM.Tx = lerp(START.Tx - 30 * pre, REST.Tx, tilt) + 12 * drift + 10 * look + 160 * dive;
      CAM.Tz = lerp(START.Tz + 25 * pre, REST.Tz, tilt) + 90 * drift + 40 * look + 160 * dive;
      CAM.zm = 1 + 0.04 * eExpo(seg(t, 0, 0.6)) - 0.04 * eSine(seg(t, 0.6, 3.4));
      CAM.tilt = tilt; CAM.dive = dive;
      return CAM;
    }
    var PJ = [0, 0, 1];
    function proj(c, X, Z) {   // writes into PJ: screen x, y and the scale k (px per world unit) at that point
      var q = Z - c.Tz, zc = c.D + q * c.cp;
      if (zc < 90) zc = 90;
      var k = F / zc * c.zm;
      PJ[0] = 960 + (X - c.Tx) * k; PJ[1] = 540 - q * c.sp * k; PJ[2] = k;
      return PJ;
    }
    function zs(x, y, c) { PJ[0] = 960 + (x - 960) * c.zm; PJ[1] = 540 + (y - 540) * c.zm; return PJ; }   // screen-space push
    function unproj(t, sx, sy) {   // the ground point that the camera at time t shows at screen (sx, sy)
      var c = cam(t), a = 540 - sy, q = a * c.D / (c.sp * F * c.zm - a * c.cp), k = F / (c.D + q * c.cp) * c.zm;
      return { X: c.Tx + (sx - 960) / k, Z: c.Tz + q, k: k };
    }

    // ---------------- palette ----------------
    var C_TEAL = hexRgb('#3cc6a8'), C_GOLD = hexRgb('#ffcf70'), C_FLARE = hexRgb('#fff1c9'), C_DEEP = hexRgb('#0e2a2c'),
      C_WARMW = hexRgb('#fff3df'), C_LAMP = hexRgb('#ffe2b0'), C_COLD = hexRgb('#a9c8ff'), C_AMBER = hexRgb('#ffb547');
    function warmth(t) { return 0.22 + 0.33 * seg(t, 0, 2.6, eP2o) + 0.17 * seg(t, T_DRIVE - 0.1, T_DRIVE + 1.0, eP2o) + 0.1 * seg(t, T_L3, D, eSine); }
    // brightness of the whole river: +40 % warm glow on the burst falling back in 1.2 s, one step up on the drive,
    // one step down for the last line, a swell in the dive
    function level(t) {
      var v = lerp(0.6, 1.0, seg(t, 0, 1.4, eP2o));
      v *= 1 + 0.4 * (1 - seg(t, 0, 1.2, eP2o));
      v *= 1 + 0.32 * seg(t, T_DRIVE - 0.02, T_DRIVE + 0.3, eP3o);
      v *= 1 - 0.3 * seg(t, T_L3 - 0.1, T_L3 + 0.45, eP2io);
      v *= 1 + 0.45 * seg(t, T_DIVE, T_DIVE + 0.9, eP2io);
      return v;
    }

    // sprites: soft dots in 10 colours from teal to gold to flare
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
    function glowDisc(g, x, y, r, rgb, a) {
      if (a <= 0.003 || r <= 0.3) return;
      var gr = g.createRadialGradient(x, y, 0, x, y, r);
      gr.addColorStop(0, rgba(rgb, a)); gr.addColorStop(0.35, rgba(rgb, a * 0.45)); gr.addColorStop(1, rgba(rgb, 0));
      g.fillStyle = gr; g.fillRect(x - r, y - r, r * 2, r * 2);
    }

    // ---------------- s06's page: the passage the river becomes (built first: the dot needs the target) ----------------
    var mc = document.createElement('canvas').getContext('2d');
    var passage = PASSAGE_FALLBACK;
    try {
      var s06 = (ctx.storyboard.scenes || []).filter(function (s) { return s.id === 's06'; })[0];
      var vt = s06 && (s06.visual_text || []).filter(function (v) { return v.id === 'passage'; })[0];
      if (vt && vt.text) passage = vt.text;
    } catch (e) { }
    var PFS = 42, PFONT = '400 42px "Source Serif 4 Display"';
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
    var XH = mc.measureText('x').actualBoundingBoxAscent;
    var MAXW = Math.max.apply(null, PL.map(function (l) { return mc.measureText(l).width; }));
    var PITCH = 72, BL_LEFT = Math.round(960 - MAXW / 2), NL = PL.length;   // the block's widest line is centred
    var INK = 0, EVI = null;
    var BLOCK = PL.map(function (s, i) {
      var spans = [], pos = 0, ink = 0, y = 540 + (i - (NL - 1) / 2) * PITCH;
      s.split(' ').forEach(function (w) {
        var x0 = mc.measureText(s.slice(0, pos)).width, x1 = mc.measureText(s.slice(0, pos + w.length)).width;
        if (/^evidence/.test(w)) EVI = { line: i, x0: BL_LEFT + x0, x1: BL_LEFT + x1, pre: s.slice(0, pos) };
        else { spans.push([x0 + 2, x1 - 2]); ink += x1 - x0 - 4; }
        pos += w.length + 1;
      });
      INK += ink;
      return { y: y, baseline: y + XH / 2, width: mc.measureText(s).width, text: s, spans: spans, ink: ink };
    });
    // where the dot of evidence's i sits: rasterise "i" large and find its dot (exact for this font)
    var DOT = (function () {
      var S = 8, c = document.createElement('canvas'); c.width = 60 * S; c.height = 80 * S;
      var g = c.getContext('2d'); g.font = '400 ' + (PFS * S) + 'px "Source Serif 4 Display"'; g.textBaseline = 'alphabetic'; g.fillStyle = '#fff';
      var BX = 10 * S, BY = 60 * S; g.fillText('i', BX, BY);
      var d = g.getImageData(0, 0, c.width, c.height).data, rows = [];
      for (var y = 0; y < c.height; y++) { var on = 0, sx = 0; for (var x = 0; x < c.width; x++) { var a = d[(y * c.width + x) * 4 + 3]; if (a > 100) { on++; sx += x; } } rows.push([on, on ? sx / on : 0]); }
      var top = 0; while (top < rows.length && !rows[top][0]) top++;
      var bot = top; while (bot < rows.length && rows[bot][0]) bot++;
      var cx = 0, n = 0; for (var r = top; r < bot; r++) { cx += rows[r][1]; n++; }
      return { dx: (cx / Math.max(1, n) - BX) / S, dy: (BY - (top + bot) / 2) / S, r: (bot - top) / S / 2 };
    })();
    if (!EVI) throw new Error('s05: evidence not found in the s06 passage');
    mc.font = PFONT;
    EVI.dotX = EVI.x0 + mc.measureText('ev').width + DOT.dx;
    EVI.dotY = BLOCK[EVI.line].baseline - DOT.dy;
    EVI.dotR = DOT.r;
    var PAGE = { x: 180, y: 260, w: 1560, h: 560, r: 28 };
    window.__s05Block = { font: PFONT, left: BL_LEFT, wrap: WRAP, maxWidth: MAXW, pitch: PITCH, xh: XH,
      lines: BLOCK.map(function (b) { return { y: b.y, baseline: b.baseline, width: b.width, text: b.text }; }),
      evidence: { line: EVI.line, x0: EVI.x0, x1: EVI.x1, dotX: EVI.dotX, dotY: EVI.dotY, dotR: EVI.dotR }, page: PAGE };

    // ---------------- layers ----------------
    var bg = u.el('div', { cls: 'fill', parent: root, style: { background: 'radial-gradient(ellipse 80% 70% at 62% 34%, #0f2a2a 0%, #071413 55%, #040b0b 100%)' } });
    var bgNavy = u.el('div', { cls: 'fill', parent: root, style: { background: 'radial-gradient(ellipse 75% 70% at 60% 45%, #121c36 0%, #0c1428 60%, #0a1122 100%)' } });
    var bgEnd = u.el('div', { cls: 'fill', parent: root, style: { background: '#0a1622', opacity: 0 } });
    var page = u.el('div', { cls: 'abs', parent: root, style: { left: PAGE.x + 'px', top: PAGE.y + 'px', width: PAGE.w + 'px', height: PAGE.h + 'px', borderRadius: PAGE.r + 'px',
      background: 'linear-gradient(160deg, rgba(24,46,64,.46), rgba(14,30,44,.40))', border: '1.5px solid rgba(190,225,235,.10)',
      boxShadow: '0 30px 80px rgba(0,0,0,.35), inset 0 1px 0 rgba(220,240,250,.06)', opacity: 0 } });
    var back = u.canvas(root, function (g, t) { drawBack(g, t); });
    var mid = u.canvas(root, function (g, t) { g.imageSmoothingEnabled = true; g.imageSmoothingQuality = 'high'; drawLearner(g, t); });   // under the lanterns: a nearer card hides him
    var lanLayer = u.el('div', { cls: 'fill', parent: root });
    var front = u.canvas(root, function (g, t) { drawFront(g, t); });
    var scrimTop = u.el('div', { cls: 'fill', parent: root, style: { background: 'linear-gradient(180deg, rgba(3,10,11,.86) 0%, rgba(3,10,11,.62) 22%, rgba(3,10,11,.22) 38%, rgba(3,10,11,0) 48%)', opacity: 0 } });
    var scrimBot = u.el('div', { cls: 'fill', parent: root, style: { background: 'linear-gradient(0deg, rgba(3,9,10,.9) 0%, rgba(3,9,10,.66) 15%, rgba(3,9,10,.25) 26%, rgba(3,9,10,0) 34%)', opacity: 0 } });
    var hud = u.el('div', { cls: 'fill', parent: root });

    tl.fromTo(bgNavy, { opacity: 1 }, { opacity: 0, duration: 1.3, ease: 'power2.out' }, 0);
    tl.fromTo(bgEnd, { opacity: 0 }, { opacity: 1, duration: T_LAND + 0.6 - (T_DIVE + 0.3), ease: 'power2.inOut' }, T_DIVE + 0.3);
    tl.fromTo(page, { opacity: 0, scale: 1.03 }, { opacity: 1, scale: 1, duration: 1.6, ease: 'power2.out' }, T_PAGE - 0.3);

    // liquid birth of the river: displacement 0 > 40 px > 12 px in 1.6 s, then off (full-frame filters are slow at 4K)
    var liq = u.liquid(back.canvas, { scale: 40, freq: 0.0075, octaves: 2, seed: 11, drift: 50, speed: 0.4 });
    u.onFrame(function (t) {
      liq.state.amount = t < 0 ? 0 : t < 0.45 ? eP2o(seg(t, 0, 0.45)) : t < 1.6 ? lerp(1, 0.3, seg(t, 0.45, 1.6, eSine)) : lerp(0.3, 0, seg(t, 1.6, 2.6, eSine));
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
    var V_RIVER = 118, V_TEXT = 100;

    // reveal: the river floods out along its channel from the impact point; the width opens from the thread
    function revealR(t) { return t < 0 ? 0 : 30 + 1400 * eExpo(seg(t, 0, 1.4)) + RL * eP2i(seg(t, 0.9, 3.4)); }
    function widthK(t) { return 0.04 + 0.96 * eP3o(seg(t, 0, 1.5)) + 0.08 * seg(t, T_DRIVE - 0.05, T_DRIVE + 0.9, eP3o); }

    // particle targets: points on the words of the six lines (gaps at the spaces; evidence has none), spread by ink length
    PS.forEach(function (p, i) {
      var v = hsh(i, 'lu') * INK, li = 0;
      while (li < NL - 1 && v > BLOCK[li].ink) { v -= BLOCK[li].ink; li++; }
      var sp = BLOCK[li].spans, k = 0;
      while (k < sp.length - 1 && v > sp[k][1] - sp[k][0]) { v -= sp[k][1] - sp[k][0]; k++; }
      p.li = li; p.tx = sp[k][0] + clamp(v, 0, sp[k][1] - sp[k][0]); p.lj = (hsh(i, 'lj') - 0.5) * 12;
    });
    function morphK(t, stg) { return eP3io(seg(t, T_DIVE + 0.35 + 0.7 * stg, T_DIVE + 1.4 + 0.5 * stg)); }
    function blockAmt(t) { return seg(t, T_DIVE + 0.3, T_PAGE + 0.1, eP2io); }
    function glowAmt(t) { return seg(t, T_DIVE + 1.1, T_PAGE + 0.15, eP2i) * (1 - 0.35 * seg(t, T_LAND, D - 0.1, eSine)); }

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
    // lane (fraction of the half width; negative = left bank); `at`: arc length of the head at time `ref`
    var LANES = [-0.6, -0.02, 0.55];
    var SCHED = [
      { i: 0, lane: 0, ref: T_G, at: S_LAND + 760, era: 1 },
      { i: 1, lane: 2, ref: T_G, at: S_LAND + 540, era: 1 },
      { i: 2, lane: 1, ref: T_G, at: S_LAND + 260, era: 1 },
      { i: 3, lane: 0, ref: 12.5, at: S_LAND + 1000, era: 2 },
      { i: 4, lane: 2, ref: 12.5, at: S_LAND + 900, era: 2 },
      { i: 5, lane: 1, ref: 12.5, at: S_LAND + 560, era: 2 }
    ];
    SCHED.forEach(function (sc) { sc.head0 = sc.at - V_TEXT * (flowPos(sc.ref) - FP0); });
    // legibility: wave 1 condenses out of the light on G (3.75) and dissolves before the lanterns; wave 2 after the last line
    function textA(t, era) {
      if (era === 1) return seg(t, T_G - 0.1, T_G + 0.9, eP2o) * (1 - seg(t, 6.9, 7.7, eP2io));
      return seg(t, 12.2, 13.0, eP2io);
    }
    // page line each sentence straightens into: the three on screen at the dive (revelation, correlation, Marshall:
    // top to bottom on the water) keep their order on lines 0, 2, 4, so they never cross; the others arrive as light only
    var SENT_LINE = [1, 5, 3, 4, 0, 2];

    // ---------------- keep-out zones (screen), recomputed every frame before drawing ----------------
    var KO = [], ORBZ = { x: -999, y: -999, a: 0 };
    function orbDim(x, y) { if (ORBZ.a <= 0) return 1; var d = Math.hypot(x - ORBZ.x, y - ORBZ.y); return 1 - ORBZ.a * (1 - seg(d, 14, 46)); }
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
    var en1 = u.text(hud, tx.en1.text, 'en', { x: 960, y: 90, cls: 'grad-text', style: { fontSize: '78px', backgroundImage: 'linear-gradient(90deg, #c6f3e4 0%, #ffe9c6 46%, #ffcf70 100%)', letterSpacing: '0.01em' } });
    var h1 = u.text(hud, '', 'headline', { x: 960, y: 242, html: mark(tx.h1.text, ['基本能听懂、读懂'], GOLD_HL), style: { fontSize: '84px', color: '#fff3df', textShadow: '0 0 26px rgba(255,226,176,.22)' } });
    var l1 = u.text(hud, tx.l1.text, 'line', { x: 960, y: 356, style: { fontSize: '56px', color: '#d6efe6', textShadow: '0 0 20px rgba(60,198,168,.25)' } });
    var h2 = u.text(hud, '', 'headline', { x: 960, y: 140, html: mark(tx.h2.text, ['真正想看、想读'], GOLD_HL), style: { fontSize: '84px', color: '#fff3df', textShadow: '0 0 26px rgba(255,226,176,.24)' } });
    var l3 = u.text(hud, '', 'line', { x: 960, y: 926, html: mark(tx.l3.text, ['大量阅读'], GOLD_HL), style: { fontSize: '56px', color: '#fff3df', textShadow: '0 0 18px rgba(0,0,0,.6)' } });
    function srcText(s) { return u.text(hud, s, 'source', { x: 1856, y: 1032, anchor: 'bottom-right', style: { color: '#9fc4b8', opacity: 0 } }); }
    var src1 = srcText(tx.src1.text), src2 = srcText(tx.src2.text), src3 = srcText(tx.src3.text);
    var enCh = u.splitChars(en1), h1Ch = u.splitChars(h1), l1Ch = u.splitChars(l1), h2Ch = u.splitChars(h2), l3Ch = u.splitChars(l3);
    gsap.set([enCh, h1Ch, l1Ch, h2Ch, l3Ch], { opacity: 0 });

    // group 1 (bar 31 beat 2): 'comprehensible input' rises out of the light, the headline pops in char by char; the
    // line follows on the next downbeat (bar 32)
    tl.fromTo(enCh, { opacity: 0, y: 14, filter: 'blur(8px)' }, { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.9, ease: 'power3.out', stagger: 0.028 }, tx.en1.in);
    // pops: position and scale overshoot (back.out), opacity and blur never do (a negative blur would be invalid CSS)
    function pop(chars, at, st) {
      tl.fromTo(chars, { opacity: 0, filter: 'blur(12px)' }, { opacity: 1, filter: 'blur(0px)', duration: 0.5, ease: 'power2.out', stagger: st }, at);
      tl.fromTo(chars, { y: 48, scale: 0.55 }, { y: 0, scale: 1, duration: 0.72, ease: 'back.out(1.8)', stagger: st }, at);
    }
    pop(h1Ch, tx.h1.in, 0.032);
    tl.fromTo(l1Ch, { opacity: 0, y: 26, filter: 'blur(6px)' }, { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.6, ease: 'power3.out', stagger: 0.03 }, tx.l1.in);
    tl.fromTo(src1, { opacity: 0, x: 26 }, { opacity: 1, x: 0, duration: 0.6, ease: 'power3.out' }, tx.src1.in);
    // out: up and blurred, each ending exactly on its storyboard out time
    function outUp(chars, at, dur) { tl.to(chars, { opacity: 0, y: -34, filter: 'blur(9px)', duration: dur, ease: 'power2.in', stagger: 0.004 }, at - dur - 0.004 * (chars.length - 1)); }
    outUp(l1Ch, tx.l1.out, 0.3); outUp(enCh, tx.en1.out, 0.3); outUp(h1Ch, tx.h1.out, 0.3);
    tl.to(src1, { opacity: 0, duration: 0.3, ease: 'power2.in' }, tx.src1.out - 0.3);

    // group 2 (bar 35, Am)
    pop(h2Ch, tx.h2.in, 0.034);
    tl.fromTo(src2, { opacity: 0, x: 26 }, { opacity: 1, x: 0, duration: 0.6, ease: 'power3.out' }, tx.src2.in);
    outUp(h2Ch, tx.h2.out, 0.3);
    tl.to(src2, { opacity: 0, duration: 0.3, ease: 'power2.in' }, tx.src2.out - 0.3);

    // group 3 (bar 37 beat 2): fades in while the river dims one step
    tl.fromTo(l3Ch, { opacity: 0, y: 30, filter: 'blur(8px)' }, { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.55, ease: 'power3.out', stagger: 0.014 }, tx.l3.in);
    tl.fromTo(src3, { opacity: 0, x: 26 }, { opacity: 1, x: 0, duration: 0.6, ease: 'power3.out' }, tx.src3.in);
    tl.to(l3Ch, { opacity: 0, y: -18, filter: 'blur(8px)', duration: 0.24, ease: 'power2.in', stagger: 0.002 }, tx.l3.out - 0.24 - 0.002 * (l3Ch.length - 1));
    tl.to(src3, { opacity: 0, duration: 0.3, ease: 'power2.in' }, tx.src3.out - 0.3);

    // scrims follow the text groups; the top one also stands for the far haze
    tl.fromTo(scrimTop, { opacity: 0 }, { opacity: 1, duration: 0.7, ease: 'power2.out' }, tx.en1.in - 0.3);
    tl.to(scrimTop, { opacity: 0.5, duration: 0.5, ease: 'sine.inOut' }, tx.h1.out);
    tl.to(scrimTop, { opacity: 1, duration: 0.4, ease: 'sine.inOut' }, tx.h2.in - 0.3);
    tl.to(scrimTop, { opacity: 0.3, duration: 0.8, ease: 'sine.inOut' }, tx.h2.out);
    tl.fromTo(scrimBot, { opacity: 0 }, { opacity: 1, duration: 0.6, ease: 'power2.inOut' }, T_L3 - 0.2);
    tl.to(scrimBot, { opacity: 0, duration: 0.5, ease: 'power2.in' }, tx.l3.out - 0.2);
    tl.to(scrimTop, { opacity: 0, duration: 0.6, ease: 'power2.in' }, T_DIVE);

    // ---------------- lanterns: the user's watercolours as paper lanterns on the river ----------------
    // rest point: (x, y) = bottom centre of the card on screen at about t = 9.5, w = width there
    var LAN = [
      { n: '01', title: tx.tagA, t: T_LAN[0], x: 600, y: 945, w: 720, rot: -1.0, drift: 300 },
      { n: '61', title: tx.tagB, t: T_LAN[1], x: 1110, y: 710, w: 600, rot: 0.9, drift: 200 },
      { n: '70', title: tx.tagC, t: T_LAN[2], x: 1650, y: 470, w: 480, rot: -0.7, drift: 130 }
    ];
    // layout width of every lantern card (source 1536 px: sharp at 4K up to 768 css px); cards are cut 2:1 so that the
    // three of them leave the river visible between them
    var IMG_W = 760, IMG_H = 380;
    LAN.forEach(function (L, i) {
      // world anchor = inverse projection of the designed rest point at the resting camera
      var c = cam(T_REST), a = 540 - L.y;
      var q = a * c.D / (c.sp * F * c.zm - a * c.cp);
      var k = F / (c.D + q * c.cp) * c.zm;
      L.X = c.Tx + (L.x - 960) / k; L.Z = c.Tz + q; L.ww = L.w / k;
      L.s = nearestS(L.X, L.Z);
      L.k0 = k;
      var el = u.el('div', { cls: 'abs', parent: lanLayer, style: { left: '0px', top: '0px', width: IMG_W + 'px', height: IMG_H + 'px', transformOrigin: '50% 100%', opacity: 0, visibility: 'hidden' } });
      u.el('div', { cls: 'abs', parent: el, style: { left: '-30%', top: '-38%', width: '160%', height: '176%', borderRadius: '50%', background: 'radial-gradient(closest-side, rgba(255,204,120,.40) 0%, rgba(255,170,80,.15) 50%, rgba(255,160,70,0) 100%)' } });
      var card = u.el('div', { cls: 'abs', parent: el, style: { left: '0px', top: '0px', width: IMG_W + 'px', height: IMG_H + 'px', borderRadius: '24px', background: 'linear-gradient(160deg, #fff9ec, #f2dfbb)',
        boxShadow: '0 0 0 2px rgba(255,240,210,.75), 0 0 54px rgba(255,196,104,.55), 0 0 120px rgba(255,170,70,.25), 0 30px 70px rgba(0,0,0,.55)' } });
      u.image('assets/illus/' + L.n + '.jpg', { parent: card, x: 12, y: 12, anchor: 'top-left', width: IMG_W - 24, height: IMG_H - 24, fit: 'cover', radius: 15 });
      // lit from within: warm centre, paper-dark rim
      u.el('div', { cls: 'abs', parent: card, style: { left: '12px', top: '12px', width: (IMG_W - 24) + 'px', height: (IMG_H - 24) + 'px', borderRadius: '15px',
        background: 'radial-gradient(ellipse 70% 65% at 50% 46%, rgba(255,236,190,.22), rgba(255,236,190,0) 70%)', boxShadow: 'inset 0 0 38px rgba(110,62,18,.42)', mixBlendMode: 'screen' } });
      L.el = el;
      // paper tag on a thread (text is never scaled: 40 px)
      var tag = u.el('div', { cls: 'abs', parent: lanLayer, style: { left: '0px', top: '0px', transformOrigin: '50% 0%', opacity: 0, visibility: 'hidden' } });
      u.el('div', { cls: 'abs', parent: tag, style: { left: '-1px', top: '0px', width: '2px', height: '22px', background: 'linear-gradient(180deg, rgba(255,236,200,.2), rgba(255,236,200,.85))' } });
      var paper = u.el('div', { cls: 'abs', parent: tag, text: L.title.text, style: { left: '0px', top: '20px', transform: 'translateX(-50%)', whiteSpace: 'nowrap', padding: '3px 20px 5px', borderRadius: '9px',
        font: '700 40px/1.25 var(--sans)', letterSpacing: '0.04em', color: '#2b1d10', background: 'linear-gradient(180deg, #fffaf0, #efdcb6)',
        boxShadow: '0 10px 24px rgba(0,0,0,.5), 0 0 22px rgba(255,200,110,.38)' } });
      L.tag = tag; L.paper = paper;
    });
    // poses of the lanterns (computed in onFrame, used by the DOM and by the canvases)
        function lanState(L, i, t) {
      var arr = seg(t, L.t - 0.95, L.t, eBack), fadeIn = seg(t, L.t - 0.95, L.t - 0.3, eP2o);
      var leave = seg(t, T_LEAVE0, T_LEAVE1, eP2i);
      var ds = -L.drift * (1 - arr) + 16 * (t - T_REST) + 620 * leave;
      rAt(L.s);
      var X = L.X + RA.tx * ds, Z = L.Z + RA.tz * ds;
      var c = cam(t), p = proj(c, X, Z);
      var ph = (t - L.t) * 6.2832 / 3.75;   // two bars per bob
      var bob = 8 * Math.sin(ph) * seg(t, L.t - 0.3, L.t + 0.5), rise = 34 * (1 - arr);
      var w = Math.min(L.ww * p[2], 720);
      return { x: p[0], y: p[1] + rise - bob, w: w, h: w / 2, k: p[2], op: fadeIn * (1 - seg(t, T_LEAVE0 + 0.05, T_LEAVE1, eP2i)), rot: L.rot + 1.2 * Math.sin(ph + 0.8), ry: 5 * Math.sin(ph * 0.7 + i * 2), ph: ph, arr: arr };
    }
    var LS = [null, null, null];

    // far lanterns (60, 54, 41, 35): pre-blurred, they are only bokeh
    var FAR = [{ n: '60', x: 1662, y: 204, w: 72, ph: 0.3 }, { n: '54', x: 1750, y: 180, w: 62, ph: 1.7 }, { n: '41', x: 1830, y: 198, w: 54, ph: 2.9 }, { n: '35', x: 1892, y: 170, w: 46, ph: 4.4 }];
    FAR.forEach(function (f) { var w = unproj(T_REST, f.x, f.y); f.X = w.X; f.Z = w.Z; f.k0 = w.k; f.s = nearestS(w.X, w.Z); f.sz = f.w; });
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
      for (var i = 0; i < 34; i++) CANDLES.push({ s: 0.31 + 0.3 * (i / 33) + R.range(-0.006, 0.006), w: ((i * 0.618) % 1) * 1.5 - 0.75, t: T_L3 + 0.25 + i * 0.075, ph: R() * 6.28 });
    })();

    // ---------------- the motif dot ----------------
    // the thread's tip strikes first, flares warm and settles on the water: warm now, but still only 30 % bright.
    // It rides the current near the left bank, then glides onto the i of evidence while the river becomes the page.
    // Its path is a few keys (screen points while we look down, then river arc length and lane), always downstream and
    // clear of the text and the lanterns; between keys it drifts (Hermite in time) and bobs a little.
    var ORBK = [{ t: 0, x: 960, y: 712 }, { t: 1.2, x: 1012, y: 684 }, { t: T_G, x: 1088, y: 640 }, { t: T_AM, s: 520, lane: -0.78 },
      { t: T_REST, s: 560, lane: -0.8 }, { t: T_DRIVE, s: 600, lane: -0.76 }, { t: 13.5, s: 680, lane: -0.3 }, { t: T_DIVE, s: 750, lane: -0.3 }].map(function (k) {
      if (k.x != null) { var w = unproj(k.t, k.x, k.y); return { t: k.t, X: w.X, Z: w.Z }; }
      var ra = rAt(S_LAND + k.s), hw = halfW(S_LAND + k.s);
      return { t: k.t, X: ra.x - ra.tz * k.lane * hw, Z: ra.z + ra.tx * k.lane * hw };
    });
    function herm(p1, p2, m1, m2, x) { var x2 = x * x, x3 = x2 * x; return (2 * x3 - 3 * x2 + 1) * p1 + (x3 - 2 * x2 + x) * m1 + (-2 * x3 + 3 * x2) * p2 + (x3 - x2) * m2; }
    function orbWorld(t) {
      var K = ORBK, n = K.length, X, Z;
      if (t <= K[1].t) { var e = eExpo(seg(t, 0, K[1].t)); X = lerp(K[0].X, K[1].X, e); Z = lerp(K[0].Z, K[1].Z, e); }
      else if (t >= K[n - 1].t) { X = K[n - 1].X; Z = K[n - 1].Z; }
      else {
        var i = 1; while (i < n - 2 && t > K[i + 1].t) i++;
        var k0 = K[i - 1], k1 = K[i], k2 = K[i + 1], k3 = K[Math.min(n - 1, i + 2)], dt = k2.t - k1.t, x = (t - k1.t) / dt;
        var tin = i === 1 ? 0.35 : 1, tout = i + 2 > n - 1 ? 0 : 1;
        X = herm(k1.X, k2.X, tin * (k2.X - k0.X) / (k2.t - k0.t) * dt, tout * (k3.X - k1.X) / Math.max(1e-6, k3.t - k1.t) * dt, x);
        Z = herm(k1.Z, k2.Z, tin * (k2.Z - k0.Z) / (k2.t - k0.t) * dt, tout * (k3.Z - k1.Z) / Math.max(1e-6, k3.t - k1.t) * dt, x);
      }
      var bob = seg(t, 0.8, 2.0);
      return { X: X + 7 * bob * u.noise3(t * 0.35, 1.7, 3.3), Z: Z + 7 * bob * u.noise3(t * 0.35, 5.1, 9.2) };
    }
    var OS = { x: 960, y: 712, k: 1, a: 1, warm: 0, r: 4.6 };
    function orbState(t) {
      var c = cam(t), ow = orbWorld(t), p = proj(c, ow.X, ow.Z);
      var x = p[0], y = p[1], k = p[2];
      var m = eP3io(seg(t, T_DIVE + 0.5, T_LAND));                   // to the dot of evidence's i
      OS.x = lerp(x, EVI.dotX, m); OS.y = lerp(y, EVI.dotY, m) - 26 * Math.sin(Math.PI * m) * (1 - m);
      OS.k = lerp(clamp(k, 0.75, 1.35), 1, m);
      OS.r = lerp(4.6 * OS.k, EVI.dotR, seg(t, T_PAGE, T_LAND, eSine));
      OS.warm = seg(t, 0, 0.5, eP2o);
      OS.a = 1;
      return OS;
    }

    // ---------------- the learner ----------------
    function wade(t) { return seg(t, T_DRIVE - 0.3, T_DIVE + 0.6, eSine); }
    function learnerPose(t) {
      var w = wade(t), c = cam(t), p = proj(c, LEARN.X + 75 * w, LEARN.Z + 85 * w);
      var a = seg(t, 0.02, 0.28, eP2o) * (1 - seg(t, T_DIVE + 0.1, T_DIVE + 0.8, eP2i));
      return { x: p[0], y: p[1], s: p[2] * 0.78, a: a, vs: lerp(0.62, 1, seg(t, T_G - 0.3, T_AM - 0.5, eSine)) };
    }

    // ---------------- per frame: keep-out zones, lantern DOM ----------------
    u.onFrame(function (t) {
      KO.length = 0;
      LAN.forEach(function (L, i) {
        var s = lanState(L, i, t); LS[i] = s;
        var sc = s.w / IMG_W;
        L.el.style.opacity = s.op.toFixed(4);
        L.el.style.visibility = s.op > 0.002 ? 'visible' : 'hidden';
        L.el.style.transform = 'translate(' + (s.x - IMG_W / 2).toFixed(2) + 'px,' + (s.y - IMG_H).toFixed(2) + 'px) perspective(1400px) rotateY(' + s.ry.toFixed(3) + 'deg) rotate(' + s.rot.toFixed(3) + 'deg) scale(' + sc.toFixed(5) + ')';
        // tag hangs under the card; its own visibility follows the storyboard in/out
        var tin = seg(t, L.title.in, L.title.in + 0.22, eP3o), tout = 1 - seg(t, L.title.out - 0.2, L.title.out, eP2i);
        var top = s.y + 8, swing = 2.4 * Math.sin(s.ph * 1.3 + 1.1);
        L.tag.style.opacity = (tin * tout).toFixed(4);
        L.tag.style.visibility = tin * tout > 0.002 ? 'visible' : 'hidden';
        L.tag.style.transform = 'translate(' + s.x.toFixed(2) + 'px,' + (top + 18 * (1 - tin)).toFixed(2) + 'px) rotate(' + swing.toFixed(3) + 'deg)';
        if (s.op > 0.02) KO.push({ l: s.x - s.w / 2 - 20, r: s.x + s.w / 2 + 20, t: s.y - s.h - 20, b: s.y + 90, f: 60, a: s.op });
      });
      // text zones: top while groups 1 and 2 are up, bottom for the last line, the learner, the dot
      var top = Math.max(seg(t, tx.en1.in - 0.3, tx.en1.in + 0.3) * (1 - seg(t, tx.h1.out - 0.2, tx.h1.out + 0.1)), seg(t, tx.h2.in - 0.3, tx.h2.in + 0.2) * (1 - seg(t, tx.h2.out - 0.2, tx.h2.out + 0.1)));
      if (top > 0) KO.push({ l: -100, r: 2020, t: -100, b: 395, f: 90, a: top });
      var bot = seg(t, T_L3 - 0.3, T_L3 + 0.2) * (1 - seg(t, tx.l3.out, tx.l3.out + 0.15));
      if (bot > 0) KO.push({ l: -100, r: 2020, t: 868, b: 1200, f: 90, a: bot });
      var srcOn = Math.max(seg(t, tx.src1.in - 0.2, tx.src1.in) * (1 - seg(t, tx.src1.out, tx.src1.out + 0.1)), seg(t, tx.src2.in - 0.2, tx.src2.in) * (1 - seg(t, tx.src2.out, tx.src2.out + 0.1)), bot);
      if (srcOn > 0) KO.push({ l: 1360, r: 2020, t: 960, b: 1200, f: 60, a: srcOn });
      var lp = learnerPose(t);
      if (lp.a > 0.05) KO.push({ l: lp.x - 70 * lp.s, r: lp.x + 70 * lp.s, t: lp.y - 300 * lp.s * lp.vs, b: lp.y + 30, f: 50, a: lp.a });
      var o = orbState(t);   // a small clear pool around the dot (river lights only, never the letters)
      ORBZ.x = o.x; ORBZ.y = o.y; ORBZ.a = 0.8 * seg(t, 0.3, 1.0) * (1 - seg(t, T_DIVE + 0.4, T_DIVE + 1.2));
    });

    function drawLearner(g, t) {
      var lp = learnerPose(t); if (lp.a <= 0.003) return;
      var flip = seg(t, 0.22, 0.9, eP2io);                    // head lamp: cold blue to pale gold when the light reaches him
      var lamp = mixRgb(C_COLD, C_LAMP, flip), hb = 0.5 * (1 + 0.14 * eN(t)) * (1 + 0.25 * u.hitPulse(t, 0.25));
      var br = Math.sin(t * 1.6) * 1.1, look = seg(t, 0.4, 3.5, eSine);
      g.save(); g.translate(lp.x, lp.y); g.scale(lp.s, lp.s * lp.vs);
      g.globalAlpha = lp.a; g.globalCompositeOperation = 'source-over'; g.lineCap = 'round'; g.lineJoin = 'round';
      var hx = 6 + 4 * look, hy = -240 + br * 0.6 - 4 * look;
      // book under his arm
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
      g.strokeStyle = lg;   // legs in the water: the lower part dissolves into light
      g.beginPath();
      var stp = Math.sin((t - T_DRIVE) * Math.PI / BEAT) * 9 * Math.sin(Math.PI * wade(t));   // one step a beat
      g.moveTo(-3, -108); g.lineTo(-14 + stp * 0.6, -56); g.lineTo(-18 + stp, -4);
      g.moveTo(-3, -108); g.lineTo(9 - stp * 0.6, -56); g.lineTo(15 - stp, -4);
      g.stroke();
      g.restore();
      // the head stays round whatever the squash of the body
      g.save(); g.translate(lp.x + hx * lp.s, lp.y + hy * lp.s * lp.vs); g.scale(lp.s, lp.s);
      g.globalAlpha = lp.a;
      var hg = g.createRadialGradient(-6, -7, 2, 0, 0, 23);
      hg.addColorStop(0, rgba(mixRgb([236, 244, 255], [255, 249, 236], flip), 0.6 + 0.4 * hb));
      hg.addColorStop(0.55, rgba(lamp, 0.5 + 0.45 * hb));
      hg.addColorStop(1, rgba(mixRgb([110, 150, 225], [232, 170, 92], flip), 0.55 + 0.4 * hb));
      g.fillStyle = hg; g.beginPath(); g.arc(0, 0, 23, 0, 6.2832); g.fill();
      g.globalCompositeOperation = 'lighter';
      glowDisc(g, 0, 0, 110, lamp, 0.34 * hb * lp.a); glowDisc(g, 0, 0, 38, lamp, 0.36 * hb * lp.a);
      g.restore();
    }

    // ---------------- BACK canvas: thread, haze, river body, shafts, far lanterns, particles, ribbons, ripples ----------------
    var BANK_L = [], BANK_R = [], BANK_SAMPLES = 90;
    var LOWK = 1 / 6, LOW = document.createElement('canvas'); LOW.width = Math.round(W * LOWK); LOW.height = Math.round(H * LOWK);
    var LOWG = LOW.getContext('2d');
    function drawBack(g, t) {
      var c = cam(t), lv = level(t), en = eN(t), wk = warmth(t), hit = u.hitPulse(t, 0.3), wK = widthK(t), rev = revealR(t);
      var fp = flowPos(t), endA = 1 - seg(t, T_DIVE + 0.35, T_DIVE + 1.3, eP2io), blk = blockAmt(t);
      g.globalCompositeOperation = 'source-over';
      g.imageSmoothingEnabled = true; g.imageSmoothingQuality = 'high';   // context state persists: set it every frame

      // s04's thread drains into the impact point (screen space; it melts in the liquid displacement)
      drawThread(g, t, c);

      // warm haze where the river goes into the distance (the first warm light), rises with the music
      var far = rAt(RL * 0.62); proj(c, far.x, far.z);
      var hzX = clamp(PJ[0], 900, 2300), hzY = clamp(PJ[1], -200, 600);
      var hz = (0.1 + 0.16 * seg(t, 0, 3, eP2o) + 0.08 * seg(t, T_DRIVE - 0.1, T_DRIVE + 0.8, eP2o)) * (0.85 + 0.3 * en) * endA;
      var hzg = g.createRadialGradient(hzX, hzY, 0, hzX, hzY, 980);
      hzg.addColorStop(0, rgba([255, 207, 112], hz)); hzg.addColorStop(0.35, rgba([220, 150, 80], hz * 0.38)); hzg.addColorStop(1, rgba([60, 90, 80], 0));
      g.fillStyle = hzg; g.fillRect(0, 0, W, H);

      // river body: banks projected, polygons (feathered edge, body, bright core), drawn small and scaled up
      var s0 = Math.max(0, S_LAND - rev - 200), s1 = Math.min(RL, S_LAND + rev + 200);
      BANK_L.length = 0; BANK_R.length = 0;
      for (var b = 0; b <= BANK_SAMPLES; b++) {
        var sb = lerp(s0, s1, b / BANK_SAMPLES), ra = rAt(sb), hw = halfW(sb) * wK;
        var rv = clamp((rev - Math.abs(sb - S_LAND)) / 220, 0, 1); hw *= 0.15 + 0.85 * rv;
        var nx = -ra.tz, nz = ra.tx, cx0 = ra.x, cz0 = ra.z;
        proj(c, cx0 + nx * hw, cz0 + nz * hw); BANK_L.push(PJ[0], PJ[1]);
        proj(c, cx0 - nx * hw, cz0 - nz * hw); BANK_R.push(PJ[0], PJ[1]);
      }
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
        g.drawImage(LOW, 0, 0, W, H);
      }

      // soft light shafts from the warm haze, slowly sweeping (volumetric light)
      g.globalCompositeOperation = 'lighter';
      for (var sh = 0; sh < 7; sh++) {
        var ang = 2.5 + sh * 0.075 + 0.035 * Math.sin(t * 0.21 + sh * 1.7), len = 2300;
        var sa = (0.011 + 0.009 * en) * seg(t, 0.2, 3.2, eSine) * endA * (sh % 2 ? 0.8 : 1.2) * (1 + 0.4 * seg(t, T_DRIVE, T_DRIVE + 0.8, eP2o));
        if (sa <= 0.002) continue;
        var half = 0.02 + 0.006 * (sh % 3);
        var lgr = g.createLinearGradient(hzX, hzY, hzX + Math.cos(ang) * len, hzY + Math.sin(ang) * len);
        lgr.addColorStop(0, rgba([255, 214, 140], sa)); lgr.addColorStop(0.6, rgba([255, 200, 120], sa * 0.35)); lgr.addColorStop(1, rgba([255, 200, 120], 0));
        g.fillStyle = lgr; g.beginPath(); g.moveTo(hzX, hzY);
        g.lineTo(hzX + Math.cos(ang - half) * len, hzY + Math.sin(ang - half) * len); g.lineTo(hzX + Math.cos(ang + half) * len, hzY + Math.sin(ang + half) * len); g.closePath(); g.fill();
      }

      // far lanterns (bokeh) on the far river
      var farA = seg(t, 6.9, T_LAN[2] + 0.2, eP2o) * (1 - seg(t, T_LEAVE0, T_LEAVE1 + 0.3, eP2i)) * endA;
      if (farA > 0.003) {
        FAR.forEach(function (f) {
          if (!f.cv) return;
          var ra = rAt(f.s), dsF = 12 * (t - T_REST) + 300 * seg(t, T_LEAVE0, T_LEAVE1 + 0.3, eP2i);
          proj(c, f.X + ra.tx * dsF, f.Z + ra.tz * dsF);
          var x = PJ[0], y = PJ[1] - 5 * Math.sin(t * 2.1 + f.ph), k = PJ[2], wd = f.w * k / f.k0;
          if (x < -300 || x > W + 300 || y < -300 || y > H + 300) return;
          var a = farA * (0.62 + 0.12 * Math.sin(t * 1.3 + f.ph)) * (0.85 + 0.25 * en);
          g.globalCompositeOperation = 'lighter';
          var sz = wd * 2.6; g.globalAlpha = clamp(a * 1.1, 0, 1); g.drawImage(SPR_SOFT_GOLD, x - sz, y - wd / 1.5 / 2 - sz, sz * 2, sz * 2);
          g.globalCompositeOperation = 'source-over'; g.globalAlpha = a * 0.5;
          var pw = wd * (1 + 2 * f.pad / f.sz), ph = pw * f.cv.height / f.cv.width;
          g.drawImage(f.cv, x - pw / 2, y - ph, pw, ph);
          g.globalCompositeOperation = 'lighter'; g.globalAlpha = a * 0.75; g.drawImage(SPR_SOFT_GOLD, x - pw * 0.62, y - ph * 1.08, pw * 1.24, ph * 1.16);
          g.globalAlpha = a * 0.35; g.drawImage(f.cv, x - pw / 2, y - ph, pw, ph);
          for (var r = 0; r < 4; r++) { g.globalAlpha = a * (0.32 - r * 0.06); g.fillStyle = 'rgb(255,200,120)'; var rw = wd * (0.7 - r * 0.12) * (0.8 + 0.2 * Math.sin(t * 3 + r + f.ph)); g.fillRect(x - rw / 2, y + 4 + r * 7 * k, rw, 2.2 * k); }
          g.globalAlpha = 1;
        });
      }

      // ripples under the learner: light spreads from his feet (on the burst, then every second bar)
      g.globalCompositeOperation = 'lighter';
      var lpz = learnerPose(t);
      if (lpz.a > 0.01) {
        var feet = proj(c, LEARN.X + 75 * wade(t), LEARN.Z + 85 * wade(t)), fx = feet[0], fy = feet[1], fk = feet[2], sqz = 0.25 + 0.75 * c.sp * c.sp;
        var spread = seg(t, 0.2, 1.9, eP3o), pool = (0.1 + 0.7 * spread) * lpz.a * (0.9 + 0.3 * en);
        g.save(); g.translate(fx, fy); g.scale(1, sqz);
        glowDisc(g, 0, 0, (90 + 230 * spread) * fk, mixRgb(C_TEAL, C_LAMP, 0.35 + 0.5 * seg(t, 0, 1.2)), 0.36 * pool);
        glowDisc(g, 0, 0, (30 + 60 * spread) * fk, C_LAMP, 0.5 * pool);
        for (var rr = 0; rr < 6; rr++) {
          var age = t - 0.22 - rr * BEAT * 3;
          if (age < 0 || age > 3.2) continue;
          var rad = (40 + 300 * eP2o(age / 3.2)) * fk, ra2 = 0.42 * (1 - age / 3.2) * lpz.a;
          g.strokeStyle = rgba(mixRgb(C_TEAL, C_LAMP, 0.6), ra2); g.lineWidth = 2.2 * fk / Math.max(0.4, sqz);
          g.beginPath(); g.arc(0, 0, rad, 0, 6.2832); g.stroke();
        }
        g.restore();
      }

      // river particles
      var V = fp * V_RIVER, brightAll = lv * (0.82 + 0.46 * en) * (1 + 0.35 * hit);
      var liftWave = T_DRIVE <= t ? clamp((t - T_DRIVE) / 0.9, 0, 1) : -1;
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
        var a = p.a * tw * fog * edge * brightAll * Math.max(rv2, m) * (1 - 0.7 * koAmount(x, y) * (1 - m)) * (m > 0 ? 1 : orbDim(x, y));
        var col = sprIdx(p.h * 0.5 + wk * 0.74 + (1 - fog) * 0.18 - 0.12 + 0.15 * hit * p.a);
        if (liftWave >= 0) { var wv = Math.exp(-Math.pow((s / RL - liftWave * 1.3) / 0.06, 2)) * (1 - liftWave * 0.7); a *= 1 + 1.4 * wv; col = sprIdx(col / 9 + 0.3 * wv); }
        var r = p.r * k * (1.0 + 0.35 * en);
        if (m > 0) {
          var bl = BLOCK[p.li], txx = BL_LEFT + p.tx, tyy = bl.y + p.lj * (1 - 0.75 * m);
          x = lerp(x, txx, m); y = lerp(y, tyy, m);
          r = lerp(r, 1.4 + 0.6 * p.a, m); a = lerp(a, (0.5 + 0.4 * p.a) * (1 - 0.3 * seg(t, T_LAND, D)), m); if (m > 0.5) col = 9;
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
        var ln = q2.len * (0.8 + 0.6 * en + 0.9 * seg(t, T_DIVE, D, eP2i) + 1.6 * pulse(t, 0.03, 0.6));
        proj(c, ra4.x - ra4.tz * w4 - ra4.tx * ln, ra4.z + ra4.tx * w4 - ra4.tz * ln); var x2 = PJ[0], y2 = PJ[1];
        var aa = q2.a * rv3 * seg(k1, 0.4, 0.8) * lv * (0.7 + 0.5 * en) * endA * 0.5 * (1 - 0.7 * koAmount(x1, y1));
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
          g.globalAlpha = clamp(a3 * (0.5 - r2 * 0.06), 0, 1);   // soft broken glints, not hard lines
          g.drawImage(r2 % 2 ? SPR_SOFT_GOLD : SPR_AMBER, s3.x - rw2 / 2 + off, ry - 4 * k3, rw2, 8 * k3);
        }
        var ag = t - L.t;   // landing ring on its beat
        if (ag > -0.05 && ag < 2.2) {
          g.save(); g.translate(s3.x, s3.y + 4); g.scale(1, sq3 * 0.5);
          g.globalAlpha = 0.5 * (1 - ag / 2.2); g.strokeStyle = 'rgb(255,214,150)'; g.lineWidth = 2.5 * k3;
          g.beginPath(); g.arc(0, 0, s3.w * (0.45 + 0.6 * eP2o(clamp(ag / 2.2, 0, 1))), 0, 6.2832); g.stroke();
          g.restore();
        }
        g.globalAlpha = 1;
      });

      // 34 candles far down the river (one per study)
      for (var ci = 0; ci < CANDLES.length; ci++) {
        var cd = CANDLES[ci], ca = seg(t, cd.t, cd.t + 0.35, eP2o) * endA; if (ca <= 0.003) continue;
        var sC = RL * cd.s + 20 * (t - cd.t), raC = rAt(sC), hwC = halfW(sC);
        proj(c, raC.x - raC.tz * hwC * cd.w, raC.z + raC.tx * hwC * cd.w);
        var xC = PJ[0], yC = PJ[1] - 1.5 * Math.sin(t * 2.4 + cd.ph), kC = PJ[2];
        var pp = 1 + 1.2 * pulse(t - cd.t, 0.03, 0.25);
        var fl = 1 + 0.12 * Math.sin(t * 9.1 + cd.ph) + 0.08 * Math.sin(t * 13.7 + cd.ph * 2);
        g.globalAlpha = clamp(ca * 0.55, 0, 1); var szC = 26 * kC * pp; g.drawImage(SPR_AMBER, xC - szC, yC - 5 * kC - szC, szC * 2, szC * 2);
        g.globalAlpha = clamp(ca, 0, 1); g.drawImage(SPR_AMBER, xC - 5.5 * kC * pp, yC - 15 * kC * pp * fl, 11 * kC * pp, 20 * kC * pp * fl);
        g.drawImage(SPR_W, xC - 2.6 * kC, yC - 9 * kC * fl, 5.2 * kC, 8 * kC * fl);
        g.globalAlpha = clamp(ca * 0.8, 0, 1); g.fillStyle = 'rgb(255,226,170)'; g.fillRect(xC - 7 * kC, yC - 0.8 * kC, 14 * kC, 1.6 * kC);
        var rg = g.createLinearGradient(0, yC + 2 * kC, 0, yC + 24 * kC); rg.addColorStop(0, 'rgba(255,181,71,0.5)'); rg.addColorStop(1, 'rgba(255,181,71,0)');
        g.globalAlpha = clamp(ca, 0, 1); g.fillStyle = rg; g.fillRect(xC - 1.4 * kC, yC + 2 * kC, 2.8 * kC, 22 * kC);
      }
      g.globalAlpha = 1;

      // sentence ribbons
      drawSentences(g, t, c);

      // the page's bead lines (what s06 opens on): one soft glow per word, evidence left dark
      if (blk > 0) {
        g.globalCompositeOperation = 'lighter';
        var ga = glowAmt(t);
        for (var li = 0; li < NL; li++) {
          var bl2 = BLOCK[li];
          for (var wi = 0; wi < bl2.spans.length; wi++) {
            var x0s = BL_LEFT + bl2.spans[wi][0], ww2 = bl2.spans[wi][1] - bl2.spans[wi][0];
            g.globalAlpha = 0.3 * ga; g.drawImage(SPR_SOFT_GOLD, x0s - 14, bl2.y - 22, ww2 + 28, 44);
            g.globalAlpha = 0.4 * ga; g.drawImage(SPR_W, x0s - 4, bl2.y - 5, ww2 + 8, 10);
          }
        }
        g.globalAlpha = 1;
      }
      g.globalCompositeOperation = 'source-over';
      drawOrb(g, t);
    }

    // s04's thread: at t = 0 exactly the s04 picture; it drains into the impact (accelerating) and is gone in 0.34 s
    function drawThread(g, t, c) {
      if (t < 0 || t > 0.36) return;
      var yTop = lerp(300, 712, eP2i(seg(t, 0, 0.34))), yTip = 712;
      var a = 1 - seg(t, 0.22, 0.36);
      var e0 = clamp((u.energy(-0.02, 0.2) - 0.18) / 0.3, 0, 1);
      var p0 = zs(960, yTop, c), x0 = p0[0], y0 = p0[1], p1 = zs(960, yTip, c), x1 = p1[0], y1 = p1[1];
      if (y1 - y0 < 1) return;
      g.save(); g.globalCompositeOperation = 'lighter'; g.lineCap = 'round';
      var lg = g.createLinearGradient(0, y0, 0, y1);
      lg.addColorStop(0, 'rgba(190,238,230,0)'); lg.addColorStop(0.18 * clamp((y1 - y0) / 412, 0.2, 1), 'rgba(200,236,240,1)'); lg.addColorStop(1, 'rgba(230,246,255,1)');
      g.strokeStyle = lg;
      g.globalAlpha = clamp(0.82 * (0.85 + 0.3 * e0) * a, 0, 1); g.lineWidth = 2.6; g.beginPath(); g.moveTo(x0, y0); g.lineTo(x1, y1); g.stroke();
      g.globalAlpha = 0.2 * a; g.lineWidth = 16; g.stroke();
      g.globalAlpha = 0.05 * a; g.lineWidth = 44; g.stroke();
      g.restore();
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
      var fpt = flowPos(t) - FP0, wK = widthK(t), rev = revealR(t), blk = blockAmt(t);
      var sq = 0.84 + 0.16 * c.sp, en = eN(t), lv = level(t);
      g.font = SFONT; g.textBaseline = 'alphabetic'; g.textAlign = 'center';
      for (var n = 0; n < SCHED.length; n++) {
        var sc = SCHED[n], S = SR[sc.i], head = sc.head0 + V_TEXT * fpt, lane = LANES[sc.lane], ta = textA(t, sc.era);
        var mS = blk > 0 ? morphK(t, sc.era === 2 ? 0.45 : 0.15 + 0.2 * n) : 0;   // the visible three move together, in order
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
          if (mS > 0) { x = lerp(x, BL_LEFT + S.gl[j0].c * 0.86, mS); y = lerp(y, line.y, mS); k = lerp(k, 1, mS); }
          var taper = Math.sin(Math.PI * (j0 + 0.5) / N), aR = 0.15 * taper * rvR * lv * (0.8 + 0.4 * en) * seg(k, 0.45, 0.85) * (1 - koAmount(x, y) * 0.8) * (0.3 + 0.7 * ta) * (1 - seg(mS, 0.5, 1));
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
          var gx = x0, gy = y0, gk = k0, gang = ang, gsq = sq;
          if (mS > 0) { gx = lerp(x0, BL_LEFT + G.c * 0.86, mS); gy = lerp(y0, line.y + 14, mS); gk = lerp(k0, 0.86, mS); gang = lerp(ang, 0, mS); gsq = lerp(sq, 1, mS); }
          var px = FS * gk * gsq;
          var aSize = seg(px, 40, 46, eSine);                    // readable (>= 40 px) or dissolving into a point of light
          var leg = clamp(ta * 1.6 - G.dot * 0.6, 0, 1);
          var ko = koAmount(gx, gy);
          // letters never meet the frame edge: within 110 px of it they turn into points of light
          var edge = Math.min(seg(gx, 10, 120), seg(W - gx, 10, 120), seg(gy, 10, 120), seg(H - gy, 10, 140));
          var vis = mS > 0 ? Math.max(rvG * (inRiver ? 1 : 0), seg(mS, 0.05, 0.3)) : rvG * (inRiver ? 1 : 0), keep = aSize * leg * (1 - ko) * edge;
          var aG = vis * keep * (1 - seg(mS, 0.78, 0.99));        // the sentences lie straight for a moment, then become beads
          var aD = vis * (1 - keep) * seg(k0, 0.3, 0.6) * (0.45 + 0.55 * G.dot) * (1 - 0.6 * ko);
          if (mS > 0) aD = lerp(aD, 0.6 * vis, seg(mS, 0.6, 0.85)) * (1 - seg(mS, 0.85, 1));
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

    // ---------------- FRONT canvas: the burst, the learner, the dot, fireflies, foreground bokeh ----------------
    var SPRAY = [];
    (function () {
      var R = u.rand('s05:spray');
      for (var i = 0; i < 170; i++) {
        var an = R() * 6.2832, sp = R.range(260, 1250) * (R() < 0.25 ? 1.5 : 1);
        SPRAY.push({ cx: Math.cos(an), cy: Math.sin(an) * 0.82, v: sp, dr: R.range(2.6, 4.6), life: R.range(0.45, 1.25), r: R.range(1.2, 3.2), warm: R() < 0.7, ph: R() * 6.28 });
      }
    })();
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

    function drawBurst(g, t, c) {
      if (t < 0 || t > 1.4) return;
      var ip = zs(960, 712, c), ix = ip[0], iy = ip[1];
      g.save(); g.globalCompositeOperation = 'lighter';
      // warm bloom: +40 % falling back in 1.2 s (amber, never white)
      var bloom = 1 - seg(t, 0, 1.2, eP2o);
      glowDisc(g, ix, iy, 980, [255, 168, 72], 0.34 * bloom);
      glowDisc(g, ix, iy, 360, [255, 196, 110], 0.42 * bloom);
      glowDisc(g, ix, iy, 90, [255, 226, 170], 0.75 * Math.pow(bloom, 2));
      // shock rings on the water (top view: almost round)
      var sqz = 0.25 + 0.75 * c.sp * c.sp;
      for (var rI = 0; rI < 2; rI++) {
        var tr = t - rI * 0.12; if (tr < 0) continue;
        var pr = eExpo(seg(tr, 0, 1.1)), ra = (1 - seg(tr, 0.05, 1.1)) * (rI ? 0.35 : 0.6);
        if (ra <= 0.003) continue;
        g.save(); g.translate(ix, iy); g.scale(1, sqz);
        g.beginPath(); g.arc(0, 0, 30 + 640 * pr * (rI ? 0.8 : 1), 0, 6.2832);
        g.strokeStyle = rgba(rI ? C_TEAL : [255, 200, 120], ra * 0.22); g.lineWidth = lerp(34, 12, pr) / Math.max(0.5, sqz); g.stroke();
        g.strokeStyle = rgba(rI ? C_TEAL : [255, 214, 150], ra * 0.8); g.lineWidth = lerp(6, 1.6, pr) / Math.max(0.5, sqz); g.stroke();
        g.restore();
      }
      // anamorphic streak: a flat warm line through the impact plus a brighter segment sweeping left to right
      var st = 1 - seg(t, 0.02, 0.7, eP2o);
      if (st > 0.003) {
        var lgS = g.createLinearGradient(0, 0, W, 0);
        lgS.addColorStop(0, 'rgba(255,190,110,0)'); lgS.addColorStop(ix / W, rgba([255, 214, 150], 0.55 * st)); lgS.addColorStop(1, 'rgba(255,190,110,0)');
        g.fillStyle = lgS; g.fillRect(0, iy - 1.6, W, 3.2);
        g.globalAlpha = 0.5 * st; g.drawImage(SPR_SOFT_GOLD, 0, iy - 26, W, 52); g.globalAlpha = 1;
      }
      var sw = seg(t, 0, 0.85, eP2o), swA = Math.sin(Math.PI * sw) * 0.6;
      if (swA > 0.003) {
        var cx = lerp(-500, W + 500, sw), Ls = 1100;
        var lgW = g.createLinearGradient(cx - Ls / 2, 0, cx + Ls / 2, 0);
        lgW.addColorStop(0, 'rgba(255,200,120,0)'); lgW.addColorStop(0.5, rgba([255, 232, 190], swA)); lgW.addColorStop(1, 'rgba(255,200,120,0)');
        g.fillStyle = lgW; g.fillRect(cx - Ls / 2, iy - 2.2, Ls, 4.4);
        g.globalAlpha = swA * 0.6; g.drawImage(SPR_SOFT_GOLD, cx - Ls / 2, iy - 40, Ls, 80); g.globalAlpha = 1;
      }
      // spray of sparks (drag, no gravity: we look straight down)
      for (var i = 0; i < SPRAY.length; i++) {
        var P = SPRAY[i]; if (t > P.life) continue;
        var dist = P.v * (1 - Math.exp(-t * P.dr)) / P.dr, life = 1 - t / P.life;
        var x = ix + P.cx * dist * c.zm, y = iy + P.cy * dist * c.zm;
        var a = life * life * (0.7 + 0.3 * Math.sin(P.ph + t * 30));
        var r = P.r * (0.6 + 0.6 * life);
        g.globalAlpha = clamp(a, 0, 1);
        g.drawImage(P.warm ? SPR[8] : SPR[2], x - r * 3, y - r * 3, r * 6, r * 6);
      }
      g.restore();
    }

    function drawOrb(g, t) {
      var o = orbState(t), x = o.x, y = o.y, wm = o.warm;
      // at t = 0 it is exactly s04's tip (cold, 30 %); the strike flares it warm, then it settles back to 30 %
      var strike = pulse(t, 0.012, 0.32);
      var cold = [191, 238, 230], warm = [255, 214, 150];
      var halo = mixRgb(cold, warm, wm), coreC = mixRgb([138, 166, 196], [214, 178, 118], wm);
      var breath = 1 + 0.1 * u.barPulse(t, 0.6);
      g.save();
      if (t > 0.25) {   // a little dark water around it so it reads as one point, not one of the river's lights
        g.globalCompositeOperation = 'source-over';
        glowDisc(g, x, y, 30 * o.k, [6, 18, 20], 0.5 * seg(t, 0.25, 1.0) * (1 - seg(t, T_PAGE - 0.4, T_LAND)));
      }
      g.globalCompositeOperation = 'lighter';
      glowDisc(g, x, y, 90 * o.k * (1 + 1.5 * strike), halo, (0.05 + 0.5 * strike) * breath);
      glowDisc(g, x, y, 30 * o.k * (1 + 0.8 * strike), mixRgb([160, 200, 230], [240, 190, 120], wm), (0.26 + 0.5 * strike) * breath);
      glowDisc(g, x, y, 11 * o.k, mixRgb([230, 246, 255], [255, 236, 200], wm), 0.3 + 0.6 * strike);
      // a ripple on every bar line while it floats (the music's pulse, and a way for the eye to find it)
      var onWater = seg(t, 0.6, 1.4) * (1 - seg(t, T_DIVE + 0.3, T_DIVE + 1.0));
      if (onWater > 0.01) {
        var bt = u.barPulse(t, 0.9), age = -0.9 * Math.log(Math.max(bt, 1e-4)), c2 = cam(t), sqz = 0.3 + 0.7 * c2.sp * c2.sp;
        if (age < 1.6) {
          g.save(); g.translate(x, y); g.scale(1, sqz); g.globalCompositeOperation = 'lighter';
          g.strokeStyle = rgba(halo, 0.3 * (1 - age / 1.6) * onWater); g.lineWidth = 1.4 / Math.max(0.4, sqz);
          g.beginPath(); g.arc(0, 0, (10 + 46 * eP2o(age / 1.6)) * o.k, 0, 6.2832); g.stroke();
          g.restore();
        }
      }
      g.globalCompositeOperation = 'source-over';
      g.globalAlpha = 0.8; g.fillStyle = rgba(coreC, 1); g.beginPath(); g.arc(x, y, o.r, 0, 6.2832); g.fill();
      g.globalAlpha = 1;
      g.restore();
    }

    function drawFront(g, t) {
      var c = cam(t), en = eN(t), lv = level(t), endA = 1 - seg(t, T_DIVE, T_DIVE + 0.7, eP2i);
      g.imageSmoothingEnabled = true; g.imageSmoothingQuality = 'high';
      drawBurst(g, t, c);
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
      // foreground bokeh drifting with the current (parallax 1.5x)
      g.globalCompositeOperation = 'lighter';
      var fa = seg(t, 0.3, 2.2, eP2o) * endA * lv;
      if (fa > 0.003) {
        for (var i = 0; i < BOK.length; i++) {
          var b = BOK[i], bx = ((b.x + b.sp * flowPos(t) * 2.2 - c.Tx * 1.5) % 2200 + 2200) % 2200 - 140, by = b.y - b.sp * 0.6 * t + 14 * Math.sin(t * 0.7 + b.ph) + (c.Tz + 40) * 0.9;
          var ba = b.a * fa * (0.8 + 0.4 * en) * (0.7 + 0.3 * Math.sin(t * 1.1 + b.ph));
          g.globalAlpha = clamp(ba, 0, 1);
          var bs = b.r * 2.2; g.drawImage(b.warm ? SPR_SOFT_GOLD : SPR_SOFT_TEAL, bx - bs, by - bs, bs * 2, bs * 2);
        }
      }
      g.globalAlpha = 1; g.globalCompositeOperation = 'source-over';
    }
  });
})();
