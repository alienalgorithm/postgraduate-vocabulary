/* s04  The endless staircase (global 35.592 to 55.592 s, bars 20 to 30 of the Cornfield Chase edit).
 * Music: bars 20 (Am) and 21 (G) are the quiet end of intro_b (energy ~0.20); bar 22 has only 2 beats (the "hiccup");
 * bar 23 (40.592) starts the lift: the bass drops out, sixteenth notes tick on an E pedal (energy 0.20 -> 0.40, the
 * strongest moment of the scene); bars 24 and 25 are the fullest, then it ebbs to bar 29 (51.842, held breath) and
 * bar 30 (53.717) rises into the burst that opens s05. Beat 0.625 s, sixteenth 0.15625 s, all cues from the storyboard.
 *
 * Signature shot "abandon 无限楼梯". The ice-white zigzag that s03 folded out of the forgetting curve morphs (MorphSVG)
 * into four flights of a true isometric Penrose loop and a pen (DrawSVG) closes the rest of it on the downbeat; every
 * step is a word book (spines on the risers, page edges on the sides) and each of the four landings carries the same
 * open page. Geometry: flights of 2, 2, 1, 1 steps, rise r = 32, treads 5r on the rising sides and 4r on the falling
 * ones, so the plan ends displaced by (6r, 6r, 6r), which projects onto the start: one step a beat, one loop per two
 * bars. A faceless learner climbs one step per beat; the motif dot (30 %, grey blue) hovers above the top step like a
 * lamp he can never reach (it lifts a little whenever he arrives under it). Each stroke of a flat, deliberately
 * unlit highlighter (#c8f04a) lands on a beat on a landing and on the big page, and the lavender 熟悉感 gauge jumps a
 * notch while 真的记得 does not move; an unbranded 6-cell progress bar fills a cell per beat and clicks to zero.
 * Bar 22: a light seam slashes down: left 此刻, right 一周后, the same page. On the right the highlighter stays, but four
 * of the seven letters leak out like sand (feTurbulence + feDisplacementMap on the word, grains on a canvas), leaving
 * letter-shaped holes; 真的记得 falls a big step on beat 2 (power4.in) and lands on the lift downbeat, 熟悉感 does not
 * move and only shows a hairline crack. On the same downbeat the floor under the stair breaks away, the books float
 * weightless and tick a small angle on every sixteenth (clockwork), the dot drifts up out of frame. The seam closes
 * in one beat and its light spreads into three shelves; eight books fly to the shelves, their silhouettes morph into
 * cards (MorphSVG outline + CSS 3D flip): the low tier cascades in on sixteenths (重读 raises a puff of dust), the
 * middle tier hovers ticking and lands beat by beat; the two top books followed the dot out of frame and come back
 * face down in a cold volumetric light, each carrying one half of the dot; the camera pushes in on them.
 * Rise (bar 30): the eight cards break into word sand (the letters spell Dunlosky's method names) that funnels into
 * one thin stream; the two face-down cards fly up (s09 brings them back) and each drops a spark; the sparks fall into
 * the stream and become its tip, the dot again at 30 %. Last beat: the stream tightens into one glowing thread, the
 * tip pulls back up a little (anticipation); the last half beat is almost still.
 *
 * Techniques: vector illustration (isometric impossible staircase of word books, faceless learner), shape morph and
 * path drawing (zigzag to staircase, book silhouettes to cards), UI simulation (word book page with highlighter,
 * progress bar, two gauges), split-screen comparison through a light seam, liquid displacement on the page, 2.5D
 * (CSS 3D card flips, perspective deck, camera push, parallax bokeh), particles and generative sand (dust, floor
 * debris, word sand, sparks), volumetric light, chromatic kick; glow, dust, light and stream follow ctx.util.energy(t)
 * and the drum hits (1.875, 5.0, 18.125).
 *
 * HANDOFF in (cut from s03, v1 contract): navy #0c1428 (radial, #121c36 at 60 % 45 %), the ice-white zigzag
 *   (1120,687) up 62 to (1120,625), (1181,590), (1181,528), (1242,493), (1242,431), (1303,396), (1303,334), (1364,299),
 *   #f2f7ff core 3 px with a soft #a9c8ff glow, and the motif dot at (1364,296), 30 %. Frame 0 draws exactly that.
 * HANDOFF out (cut to s05 at global 55.592): navy background, nothing else but one thin glowing vertical thread at
 *   x = 960 from about y = 330 (fading in from 300) down to its tip at (960, 752); the tip is the motif dot, 30 %,
 *   cold white with a faint teal tint (#bfeee6 glow). The picture is still for the last half beat (55.279 to 55.592).
 */
(function () {
  'use strict';

  registerScene('s04', function build(tl, root, ctx) {
    var u = ctx.util, gsap = window.gsap, D = ctx.duration, W = 1920, H = 1080;
    var clamp = u.clamp, lerp = u.lerp;
    function E(n) { return gsap.parseEase(n); }
    var eSine = E('sine.inOut'), eSineI = E('sine.in'), eSineO = E('sine.out'), eP2o = E('power2.out'), eP2i = E('power2.in'),
      eP2io = E('power2.inOut'), eP3o = E('power3.out'), eP3i = E('power3.in'), eP3io = E('power3.inOut'), eP4i = E('power4.in'),
      eExpo = E('expo.out'), eBack = E('back.out(1.7)'), eBack3 = E('back.out(2.6)');
    function seg(t, a, b, ease) { var x = clamp((t - a) / (b - a), 0, 1); return ease ? ease(x) : x; }
    function pulse(x, rise, decay) { return x < 0 ? 0 : (1 - Math.exp(-x / rise)) * Math.exp(-x / decay); }
    function hsh(i, s) { return u.hash(i, 's04' + s); }
    function iso(fn) { return function (g, t, info) { g.save(); try { fn(g, t, info); } finally { g.restore(); } }; }
    function TX(s) { for (var i = 0; i < ctx.texts.length; i++) if (ctx.texts[i].text === s) return ctx.texts[i]; throw new Error('s04: storyboard text missing: ' + s); }
    function esc(s) { return s.replace(/&/g, '&amp;').replace(/</g, '&lt;'); }
    function mark(str, sub, style) {   // the exact storyboard string, one substring wrapped in a styled span
      var i = str.indexOf(sub); if (i < 0) throw new Error('s04: "' + sub + '" not in "' + str + '"');
      return esc(str.slice(0, i)) + '<span style="' + style + '">' + esc(sub) + '</span>' + esc(str.slice(i + sub.length));
    }
    function mixHex(a, b, k) {
      var x = parseInt(a.slice(1), 16), y = parseInt(b.slice(1), 16);
      var r = Math.round(lerp(x >> 16, y >> 16, k)), g = Math.round(lerp((x >> 8) & 255, (y >> 8) & 255, k)), bl = Math.round(lerp(x & 255, y & 255, k));
      return '#' + ((1 << 24) | (r << 16) | (g << 8) | bl).toString(16).slice(1);
    }

    // ---------------- music grid (local s; storyboard cues) ----------------
    var BEAT = 0.625, S16 = BEAT / 4;
    var STROKES = [1.25, 1.875, 3.125];
    var T_SPLIT = 3.75, T_DROP = 4.375, T_LIFT = 5.0, T_CLOSE = 6.25, T_CARDS = 6.875;
    var T_TOPDESC = 10.625, T_HANG = 12.5, T_TICK = [14.375, 16.25], T_LOW = 16.25, T_RISE = 18.125, T_LINE = 19.375, T_STILL = 19.6875;
    var HITS = [1.875, 5.0, 18.125];
    var tx = {
      ab: TX('abandon'), h1: TX('反复看，当下觉得记住了；'), src1: TX('Roediger & Karpicke, 2006'), fam: TX('熟悉感'), real: TX('真的记得'),
      now: TX('此刻'), wk: TX('一周后'), h2: TX('一周后，反而记得更少。'), l2: TX('最常见的学习方法，反复读、划重点，研究评估效果偏低。'),
      src2: TX('Dunlosky et al., 2013'), hi: TX('效果高'), mid: TX('中等'), low: TX('偏低'), l3: TX('10 种学习方法里，被评为效果最高的只有 2 种。')
    };
    function eN(t) { return clamp((u.energy(t, 0.2) - 0.18) / 0.3, 0, 1); }   // 0.2 (quiet) .. 0.48 (fullest lift bars)

    // ---------------- the impossible staircase (isometric; plan units, projected) ----------------
    // flights of 5, 5, 1, 1 steps, tread 3r: the plan ends displaced by (12r, 12r, 12r), which projects onto the start.
    // Every step is a stack of three word books (TH = 3r), each landing is a square platform with an open book on it.
    var RR = 30, LT = 3 * RR, WD = 84, TH = 3 * RR, NBK = 3;
    var SIDES = [{ dx: 1, dy: 0, n: 5 }, { dx: 0, dy: 1, n: 5 }, { dx: -1, dy: 0, n: 1 }, { dx: 0, dy: -1, n: 1 }];
    var SC = 1, C30 = Math.cos(Math.PI / 6), OX = 0, OY = 0;
    var FIT = { x0: 1010, x1: 1870, y0: 380, y1: 900 };
    function PXs(x, y) { return OX + (x - y) * C30 * SC; }
    function PYs(x, y, z) { return OY + ((x + y) * 0.5 - z) * SC; }
    var BOX = [], PTS = [], STEP = {}, LAND = [];
    function addBox(kind, cx, cy, z, hx, hy, axis, side, k) {
      var land = kind === 'land';
      var b = { i: BOX.length, kind: kind, cx: cx, cy: cy, z: z, hx: hx, hy: hy, axis: axis, side: side, k: k, pt: PTS.length - 1, land: land };
      BOX.push(b); if (land) { b.li = LAND.length; LAND.push(b); } else STEP[side + '_' + k] = b;
      return b;
    }
    PTS.push([0, 0, 0]); addBox('land', 0, 0, 0, WD / 2, WD / 2, 'x', 3, -1);
    (function () {
      var cx = 0, cy = 0, cz = 0;
      SIDES.forEach(function (s, si) {
        var x = cx + s.dx * WD / 2, y = cy + s.dy * WD / 2;
        PTS.push([x, y, cz]);
        for (var k = 0; k < s.n; k++) {
          cz += RR; PTS.push([x, y, cz]);
          x += s.dx * LT; y += s.dy * LT; PTS.push([x, y, cz]);
          addBox('step', x - s.dx * LT / 2, y - s.dy * LT / 2, cz, s.dx ? LT / 2 : WD / 2, s.dx ? WD / 2 : LT / 2, s.dx ? 'x' : 'y', si, k);
        }
        cx = x + s.dx * WD / 2; cy = y + s.dy * WD / 2;
        PTS.push([cx, cy, cz]);
        if (si < 3) addBox('land', cx, cy, cz, WD / 2, WD / 2, si % 2 ? 'x' : 'y', si, -1);
      });
    })();
    // PTS: 0 L0, 1 e0, 2..11 side 0 (riser top, tread end) x5, 12 L1, 13 e1, 14..23 side 1, 24 L2, 25 e2, 26 rt20, 27 te20,
    //      28 L3, 29 e3, 30 rt30, 31 te30, 32 L0' (projects onto 0)
    (function () {
      var x0 = 1e9, x1 = -1e9, y0 = 1e9, y1 = -1e9;
      BOX.forEach(function (b) {
        [[-1, -1], [1, -1], [1, 1], [-1, 1]].forEach(function (c) {
          var x = b.cx + c[0] * b.hx, y = b.cy + c[1] * b.hy;
          [b.z, b.z - TH].forEach(function (z) { var px = PXs(x, y), py = PYs(x, y, z); x0 = Math.min(x0, px); x1 = Math.max(x1, px); y0 = Math.min(y0, py); y1 = Math.max(y1, py); });
        });
      });
      SC = Math.min(1.05, (FIT.x1 - FIT.x0) / (x1 - x0), (FIT.y1 - FIT.y0) / (y1 - y0));
      OX = (FIT.x0 + FIT.x1) / 2 - SC * (x0 + x1) / 2; OY = (FIT.y0 + FIT.y1) / 2 - SC * (y0 + y1) / 2;
    })();
    var SP = PTS.map(function (p) { return [PXs(p[0], p[1]), PYs(p[0], p[1], p[2])]; });
    var SL = [0];
    for (var pi = 1; pi < SP.length; pi++) SL.push(SL[pi - 1] + Math.hypot(SP[pi][0] - SP[pi - 1][0], SP[pi][1] - SP[pi - 1][1]));
    var SLTOT = SL[SL.length - 1];
    BOX.forEach(function (b) {
      b.depth = b.cx + b.cy + b.z - TH / 2;
      b.sl = b.land ? SL[b.pt] : (SL[b.pt - 1] + SL[b.pt]) / 2;
      b.scx = PXs(b.cx, b.cy); b.scy = PYs(b.cx, b.cy, b.z - TH / 2);
      b.topx = PXs(b.cx, b.cy); b.topy = PYs(b.cx, b.cy, b.z);
    });
    var ORDER = paintOrder();
    var STAIR_C = [(FIT.x0 + FIT.x1) / 2, (FIT.y0 + FIT.y1) / 2];
    var B_START = STEP['0_3'];
    function atSL(s) {
      s = ((s % SLTOT) + SLTOT) % SLTOT;
      var lo = 0, hi = SL.length - 1;
      while (hi - lo > 1) { var m = (lo + hi) >> 1; if (SL[m] <= s) lo = m; else hi = m; }
      var f = (s - SL[lo]) / Math.max(1e-6, SL[lo + 1] - SL[lo]);
      return [lerp(SP[lo][0], SP[lo + 1][0], f), lerp(SP[lo][1], SP[lo + 1][1], f), lo];
    }

    // book colours per box (cold, muted); three-tone iso shading
    var SPINES = ['#3d5f9a', '#47609a', '#33568a', '#55599a', '#2f6a84', '#4d66a0', '#665a96', '#3a4f86', '#40709e', '#4c5590'];
    function shade(c, f) { return mixHex(c, '#05080f', 1 - f); }
    BOX.forEach(function (b, i) {
      var cs = [0, 1, 2].map(function (k) { return SPINES[Math.floor(hsh(i * 3 + k, 'c') * SPINES.length)]; });
      var ps = [0, 1, 2].map(function (k) { return mixHex('#8896b4', '#b4c0d8', hsh(i * 3 + k, 'p')); });
      var c1 = cs[0], xSpine = b.axis === 'x';
      b.fx = { spine: xSpine, key: 'x' + i, fill: [0, 1, 2].map(function (k) { return xSpine ? shade(cs[k], 0.7) : shade(ps[k], 0.62); }), edge: cs.map(function (c) { return shade(c, 0.55); }) };
      b.fy = { spine: !xSpine, key: 'y' + i, fill: [0, 1, 2].map(function (k) { return !xSpine ? shade(cs[k], 0.9) : shade(ps[k], 0.82); }), edge: cs.map(function (c) { return shade(c, 0.75); }) };
      b.top0 = b.land ? '#5b6f9c' : mixHex(c1, '#e6eefc', 0.22); b.top1 = b.land ? '#4a5d8a' : mixHex(c1, '#0c1428', 0.12);
      b.lift = hsh(i, 'lift'); b.drift = (hsh(i, 'dr') - 0.5) * 50;
      b.tick = (hsh(i, 'tk') < 0.5 ? -1 : 1) * (1.3 + 1.6 * hsh(i, 'tk2'));   // degrees per sixteenth
    });

    // ---------------- world camera (phase one only; identity from the split on) ----------------
    var camN = u.makeNoise('s04cam');
    function camAt(t) {
      var a = eSine(seg(t, 0.3, 3.6)), back = eP3io(seg(t, 3.55, 4.15));
      var z = 1 + 0.03 * a * (1 - back);
      z += 0.004 * u.barPulse(Math.max(0, t), 0.3) * (1 - back) * seg(t, 0.8, 1.2);
      var sh = t >= T_LIFT ? 5 * Math.exp(-(t - T_LIFT) / 0.2) : 0;
      return { z: z, x: -12 * a * (1 - back) + sh * camN.noise2(t * 17, 0.3), y: -6 * a * (1 - back) + sh * camN.noise2(0.7, t * 17) };
    }
    var CAM_O = STAIR_C;
    function camPt(t, x, y) { var c = camAt(t); return [CAM_O[0] + (x - CAM_O[0]) * c.z + c.x, CAM_O[1] + (y - CAM_O[1]) * c.z + c.y]; }
    function camCss(c) { return 'translate(' + c.x.toFixed(2) + 'px,' + c.y.toFixed(2) + 'px) scale(' + c.z.toFixed(5) + ')'; }
    function worldAlpha(t) {
      if (t < 3.6) return 1;
      if (t < T_LIFT) return lerp(1, 0.14, eP2io(seg(t, 3.6, 4.1)));
      if (t < T_CLOSE) return lerp(0.14, 0.32, eP2o(seg(t, T_LIFT, T_LIFT + 0.5)));
      return lerp(0.32, 1, eP2io(seg(t, T_CLOSE, T_CLOSE + 0.45)));
    }

    // ---------------- layers ----------------
    var bg = u.el('div', { cls: 'fill', parent: root, style: { zIndex: 0, background: 'radial-gradient(ellipse 75% 70% at 60% 45%, #121c36 0%, #0c1428 60%, #0a1122 100%)' } });
    var backCv = u.canvas(root, iso(function (g, t) { drawBack(g, t); }));
    backCv.canvas.style.zIndex = 0;
    var world = u.el('div', { cls: 'fill', parent: root, style: { transformOrigin: CAM_O[0] + 'px ' + CAM_O[1] + 'px', zIndex: 1 } });
    var stairCv = u.canvas(world, iso(function (g, t) { drawStairs(g, t); }));
    var loopSvg = u.svg(world);
    var rays = u.rays(root, { x: 992, y: -170, direction: 180, color: '#dfe9ff', count: 9, spread: 28, length: 1150, opacity: 0, blur: 12, sway: 2, seed: 4 });
    rays.el.style.zIndex = 2;
    var learnCv = u.canvas(root, iso(function (g, t) { drawLearner(g, t); }));
    learnCv.canvas.style.transformOrigin = CAM_O[0] + 'px ' + CAM_O[1] + 'px'; learnCv.canvas.style.zIndex = 2;
    var rightTint = u.el('div', { cls: 'abs', parent: root, style: { left: '960px', top: '0px', width: '960px', height: '1080px', opacity: 0, zIndex: 4,
      background: 'linear-gradient(90deg, rgba(3,6,14,0.66) 0%, rgba(4,8,18,0.46) 40%, rgba(4,8,18,0.38) 100%)' } });
    var debrisCv = u.canvas(root, iso(function (g, t) { drawDebris(g, t); }));
    debrisCv.canvas.style.zIndex = 4;
    var hudL = u.el('div', { cls: 'fill', parent: root, style: { zIndex: 5 } });
    var rightBox = u.el('div', { cls: 'fill', parent: root, style: { zIndex: 5, clipPath: 'inset(0px 0px 0px 960px)' } });
    var seam = u.el('div', { cls: 'abs', parent: root, style: { left: '958px', top: '290px', width: '4px', height: '790px', zIndex: 6, transformOrigin: '50% 0%',
      background: 'linear-gradient(180deg, rgba(240,247,255,0) 0%, #f2f7ff 5%, #f2f7ff 90%, rgba(240,247,255,0) 100%)',
      boxShadow: '0 0 14px rgba(207,230,255,0.9), 0 0 44px rgba(127,166,224,0.65), 0 0 120px rgba(127,166,224,0.35)' } });
    var coneCv = u.canvas(root, iso(function (g, t) { drawCone(g, t); }));
    coneCv.canvas.style.zIndex = 7;
    var deck = u.el('div', { cls: 'fill', parent: root, style: { zIndex: 8 } });
    var C_X = 992, ROW = { top: 300, mid: 560, bot: 820 }, CW = 300, CH = 160, PITCH = 316, S0 = 0.9, PUSH = 0.12, SHIFT = -20;
    var deckCam = u.el('div', { cls: 'fill', parent: deck, style: { transformOrigin: C_X + 'px ' + ROW.top + 'px', perspective: '1500px', perspectiveOrigin: C_X + 'px 520px' } });
    var morphSvg = u.svg(root); morphSvg.style.zIndex = 9; morphSvg.style.position = 'absolute';
    var sandCv = u.canvas(root, iso(function (g, t) { drawSand(g, t); }));
    sandCv.canvas.style.zIndex = 9;
    var fxCv = u.canvas(root, iso(function (g, t) { drawFx(g, t); }));
    fxCv.canvas.style.zIndex = 9;
    var txt = u.el('div', { cls: 'fill', parent: root, style: { zIndex: 10 } });
    gsap.set(seam, { scaleY: 0, opacity: 0 });

    function deckK(t) { return eSine(seg(t, T_HANG, T_RISE)); }
    function deckS(t) { return S0 * (1 + PUSH * deckK(t)); }
    function deckPt(t, x, y) { var s = deckS(t); return [C_X + (x - C_X) * s, ROW.top + (y - ROW.top) * s + SHIFT * deckK(t)]; }

    // ---------------- dust and bokeh (energy driven) ----------------
    var dust = u.particles(root, { count: 150, seed: 's04dust', colors: ['#a9c8ff', '#dfe9ff', '#7fa6e0'], size: [0.7, 2.0], speed: [5, 16], angle: -84, spread: 30, twinkle: 0.6, energy: 0.8 });
    dust.canvas.style.zIndex = 0;
    var bokeh = u.particles(root, { count: 16, seed: 's04bok', colors: ['#7fa6e0', '#9b8cff'], size: [9, 22], speed: [3, 8], angle: -70, soft: true, energy: 0.6 });
    bokeh.canvas.style.zIndex = 3;
    tl.fromTo(dust.state, { opacity: 0 }, { opacity: 1, duration: 1.4, ease: 'sine.inOut' }, 0.1);
    tl.fromTo(bokeh.state, { opacity: 0 }, { opacity: 0.5, duration: 1.4, ease: 'sine.out' }, 0.25);
    tl.to(bokeh.state, { opacity: 0.18, duration: 0.5 }, T_SPLIT);
    tl.to(bokeh.state, { opacity: 0.42, duration: 0.8 }, T_CLOSE);
    tl.to([dust.state, bokeh.state], { opacity: 0, duration: 1.0, ease: 'power2.in' }, T_RISE + 0.2);

    // ---------------- the word book (DOM, so the word is real text) ----------------
    var BW = 520, BH = 264, PAGE_W = (BW - 24) / 2, BOOK_Y = 600;
    var WORD_FONT = 'italic 400 60px "Source Serif 4 Display"';
    var mctx = document.createElement('canvas').getContext('2d');
    mctx.font = WORD_FONT; var WORD_W = mctx.measureText('abandon').width;
    var HL = [{ w: 0, h: 36, y: 6, r: -1.6 }, { w: 14, h: 50, y: 2, r: 0.9 }, { w: 28, h: 64, y: 4, r: -0.7 }];   // thicker every pass
    var WORD_TOP = 56;
    function makeBook(parent, cx, cy, full, id) {
      var b = u.el('div', { cls: 'abs', parent: parent, style: { left: (cx - BW / 2) + 'px', top: (cy - BH / 2) + 'px', width: BW + 'px', height: BH + 'px' } });
      u.el('div', { cls: 'abs', parent: b, style: { left: '-14px', top: '-10px', width: (BW + 28) + 'px', height: (BH + 26) + 'px', borderRadius: '12px',
        background: 'linear-gradient(170deg, #22345c 0%, #16233f 100%)', border: '2px solid rgba(160,185,235,0.35)',
        boxShadow: '0 30px 70px rgba(0,0,0,0.6), 0 0 60px rgba(127,166,224,0.12)' } });
      var pages = [];
      for (var p = 0; p < 2; p++) {
        pages.push(u.el('div', { cls: 'abs', parent: b, style: { left: (p ? BW / 2 + 1 : 11) + 'px', top: '4px', width: PAGE_W + 'px', height: (BH - 8) + 'px', overflow: 'hidden',
          borderRadius: p ? '2px 8px 8px 2px' : '8px 2px 2px 8px',
          background: p ? 'linear-gradient(90deg, #aeb8cb 0%, #d3dbe8 9%, #dbe2ee 70%, #cdd5e3 100%)' : 'linear-gradient(90deg, #cdd5e3 0%, #dbe2ee 30%, #d3dbe8 91%, #aeb8cb 100%)' } }));
      }
      for (var li = 0; li < 7; li++) u.el('div', { cls: 'abs', parent: pages[0], style: { left: '26px', top: (36 + li * 29) + 'px', height: '7px', borderRadius: '4px',
        width: (li % 3 === 0 ? 96 : 150 + 46 * hsh(li, 'lp' + id)) + 'px', background: li % 3 === 0 ? 'rgba(30,42,70,0.45)' : 'rgba(40,52,80,0.2)' } });
      var rp = pages[1];
      var hls = HL.map(function (s, i) {
        var w = WORD_W + 26 + s.w, h = s.h;
        return u.el('div', { cls: 'abs', parent: rp, style: { left: ((PAGE_W - w) / 2 + (i % 2 ? 3 : -3)) + 'px', top: (WORD_TOP + 46 - h / 2 + s.y) + 'px', width: w + 'px', height: h + 'px',
          background: '#c8f04a', opacity: 0.5, borderRadius: '9px 15px 11px 17px / 13px 9px 15px 11px', transform: 'rotate(' + s.r + 'deg)',
          clipPath: full ? 'inset(0% 0% 0% 0%)' : 'inset(0% 100% 0% 0%)' } });
      });
      var word = u.el('div', { cls: 'abs', parent: rp, text: 'abandon', style: { left: '0px', top: WORD_TOP + 'px', width: PAGE_W + 'px', textAlign: 'center',
        font: WORD_FONT, lineHeight: '92px', color: '#121a2e', letterSpacing: '0.005em' } });
      for (var di = 0; di < 4; di++) u.el('div', { cls: 'abs', parent: rp, style: { left: '26px', top: (166 + di * 22) + 'px', height: '6px', borderRadius: '3px',
        width: (di === 0 ? 74 : 124 + 64 * hsh(di, 'rp' + id)) + 'px', background: di === 0 ? 'rgba(30,42,70,0.4)' : 'rgba(40,52,80,0.18)' } });
      u.el('div', { cls: 'abs', parent: b, style: { left: (BW / 2 - 18) + 'px', top: '4px', width: '36px', height: (BH - 8) + 'px',
        background: 'linear-gradient(90deg, rgba(10,16,32,0) 0%, rgba(10,16,32,0.32) 48%, rgba(10,16,32,0.38) 50%, rgba(10,16,32,0.32) 52%, rgba(10,16,32,0) 100%)' } });
      return { el: b, word: word, hls: hls, page: rp };
    }
    var BOOK_AX = 650, BOOK_BX = 1610;
    var bookA = makeBook(hudL, BOOK_AX, BOOK_Y, false, 'a');
    var bookB = makeBook(rightBox, BOOK_BX, BOOK_Y, true, 'b');
    bookB.el.style.filter = 'saturate(0.72) brightness(0.9)';   // a week later: the same page, colder
    gsap.set(bookA.el, { opacity: 0 });
    tl.fromTo(bookA.el, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.55, ease: 'power3.out' }, tx.ab.in - 0.12);
    STROKES.forEach(function (ts, i) {
      tl.fromTo(bookA.hls[i], { clipPath: 'inset(0% 100% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.3, ease: 'power2.out', immediateRender: false }, ts);
    });
    tl.to(bookA.el, { opacity: 0, y: 18, duration: 0.25, ease: 'power2.in' }, tx.ab.out - 0.25);
    // the clone slides out of the seam
    gsap.set(bookB.el, { opacity: 0 });
    tl.fromTo(bookB.el, { opacity: 0 }, { opacity: 1, duration: 0.12, ease: 'power1.out', immediateRender: false }, T_SPLIT);
    tl.fromTo(bookB.el, { x: -(BOOK_BX - 960 - BW / 2 + 40) }, { x: 0, duration: 0.6, ease: 'expo.out', immediateRender: false }, T_SPLIT);
    tl.to(bookB.el, { x: -(BOOK_BX - 960 + BW / 2), duration: 0.42, ease: 'power3.in' }, T_CLOSE);
    tl.to(bookB.el, { opacity: 0, duration: 0.25, ease: 'power2.in' }, T_CLOSE + 0.05);

    // right page: four of seven letters leak away like sand, letter-shaped holes stay (a . . n . o .)
    var DROP = [1, 2, 4, 6], KEEP = [0, 3, 5];
    var holes = u.el('div', { cls: 'abs', parent: bookB.page, attrs: { 'data-qa': 'off' }, style: { left: '0px', top: WORD_TOP + 'px', width: PAGE_W + 'px', textAlign: 'center',
      font: WORD_FONT, lineHeight: '92px', color: 'transparent', WebkitTextStroke: '1.3px rgba(24,34,58,0.55)', letterSpacing: '0.005em', opacity: 0 } });
    holes.innerHTML = 'abandon'.split('').map(function (ch, i) { return '<span style="' + (DROP.indexOf(i) < 0 ? 'visibility:hidden' : '') + '">' + ch + '</span>'; }).join('');
    bookB.page.insertBefore(holes, bookB.word);
    var bChars = u.splitChars(bookB.word);
    var liq = u.liquid(bookB.word, { scale: 24, freq: 0.035, octaves: 2, seed: 11, drift: 30, speed: 0.6 });
    var T_LEAK0 = T_SPLIT + 0.2, LEAK_ORDER = [1, 4, 2, 6], LEAK_EACH = 0.1, LEAK_T = {};
    LEAK_ORDER.forEach(function (ci, k) { LEAK_T[ci] = T_LEAK0 + k * LEAK_EACH + 0.03 * hsh(ci, 'lk'); });
    DROP.forEach(function (ci) { tl.to(bChars[ci], { opacity: 0, y: 14, duration: 0.55, ease: 'power2.in' }, LEAK_T[ci]); });
    tl.fromTo(liq.state, { amount: 0 }, { amount: 1, duration: 0.4, ease: 'power2.in', immediateRender: false }, T_LEAK0 - 0.12);
    tl.to(liq.state, { amount: 0, duration: 0.35 }, T_LEAK0 + 4 * LEAK_EACH + 0.45);
    tl.fromTo(holes, { opacity: 0 }, { opacity: 1, duration: 0.8, ease: 'power2.out', immediateRender: false }, T_LEAK0 + 0.25);
    var sandPts = u.textPoints('abandon', { font: WORD_FONT, step: 2, seed: 3, max: 1100 });
    var LB = [], acc = 0; mctx.font = WORD_FONT; 'abandon'.split('').forEach(function (ch) { var w = mctx.measureText(ch).width; LB.push(acc + w); acc += w; });
    var GRAINS = [];
    sandPts.forEach(function (p, i) {
      var lx = p.x - (W / 2 - WORD_W / 2), li = 0; while (li < 6 && lx > LB[li]) li++;
      if (DROP.indexOf(li) < 0) return;
      GRAINS.push({ x: p.x - W / 2 + PAGE_W / 2, y: p.y - H / 2 + WORD_TOP + 46, t0: LEAK_T[li] + 0.05 + 0.4 * hsh(i, 'g0'), vx: (hsh(i, 'gx') - 0.5) * 16,
        vy: 12 + 30 * hsh(i, 'gy'), life: 0.8 + 0.6 * hsh(i, 'gl'), r: 0.6 + 0.8 * hsh(i, 'gr') });
    });
    var grainCv = u.canvas(bookB.page, iso(function (g, t) {
      for (var i = 0; i < GRAINS.length; i++) {
        var q = GRAINS[i], a = t - q.t0; if (a < 0 || a > q.life) continue;
        var k = a / q.life;
        g.globalAlpha = 0.85 * (1 - k * k); g.fillStyle = '#1d2840';
        g.beginPath(); g.arc(q.x + q.vx * a, q.y + q.vy * a + 140 * a * a, q.r, 0, 6.2832); g.fill();
      }
    }), { width: PAGE_W, height: BH - 8 });

    // ---------------- gauges ----------------
    var GY0 = 388, GHT = 412, NOTCH = 0.18;
    function makeGauge(parent, x, label, kind) {
      var fam = kind === 'fam';
      var wrap = u.el('div', { cls: 'abs', parent: parent, style: { left: (x - 40) + 'px', top: GY0 + 'px', width: '80px', height: GHT + 'px' } });
      var tube = u.el('div', { cls: 'abs', parent: wrap, style: { left: '0px', top: '0px', width: '80px', height: GHT + 'px', borderRadius: '40px',
        background: 'rgba(7,12,26,0.72)', border: '2px solid ' + (fam ? 'rgba(190,180,255,0.45)' : 'rgba(170,195,240,0.32)'),
        boxShadow: fam ? '0 0 30px rgba(155,140,255,0.5), 0 0 80px rgba(155,140,255,0.25), inset 0 0 22px rgba(155,140,255,0.18)' : 'inset 0 0 14px rgba(0,0,0,0.55)' } });
      var fill = u.el('div', { cls: 'abs', parent: tube, style: { left: '6px', top: '6px', width: '64px', height: (GHT - 16) + 'px', borderRadius: '32px',
        background: fam ? 'linear-gradient(0deg, rgba(126,104,255,0.55) 0%, rgba(176,160,255,0.40) 45%, rgba(214,204,255,0.30) 80%, rgba(236,230,255,0.55) 100%)' : '#7fa6e0',
        boxShadow: fam ? 'inset 0 0 0 2.5px rgba(232,226,255,0.9), inset 0 0 26px rgba(196,182,255,0.55), inset 0 -40px 60px rgba(120,96,255,0.35)' : 'none' } });
      var men = u.el('div', { cls: 'abs', parent: wrap, style: { left: '10px', width: '60px', height: '3px', borderRadius: '2px', top: '0px',
        background: fam ? '#ece8ff' : '#e6eefc', boxShadow: fam ? '0 0 12px #b9aeff, 0 0 26px rgba(155,140,255,0.8)' : 'none' } });
      for (var n = 1; n * NOTCH < 0.99; n++) u.el('div', { cls: 'abs', parent: wrap, style: { left: '88px', top: (6 + (1 - n * NOTCH) * (GHT - 16) - 1) + 'px', width: '12px', height: '2px', background: 'rgba(190,205,240,0.32)' } });
      var lab = u.text(parent, label, 'small', { x: x, y: GY0 + GHT + 48, style: { fontSize: '44px', fontWeight: 700, letterSpacing: '0.04em', color: fam ? '#cfc6ff' : '#b9cff2' } });
      return { wrap: wrap, fill: fill, men: men, lab: lab, tube: tube };
    }
    function setLevel(gg, v) {
      v = clamp(v, 0, 1);
      var hIn = GHT - 16, top = (1 - v) * hIn;
      gg.fill.style.clipPath = 'inset(' + top.toFixed(2) + 'px 0px 0px 0px round 32px)';
      gg.men.style.top = (6 + top - 1.5).toFixed(2) + 'px';
    }
    var GX = [112, 292];
    var gA = [makeGauge(hudL, GX[0], tx.fam.text, 'fam'), makeGauge(hudL, GX[1], tx.real.text, 'real')];
    var gB = [makeGauge(rightBox, GX[0] + 960, tx.fam.text, 'fam'), makeGauge(rightBox, GX[1] + 960, tx.real.text, 'real')];
    function famLv(t) { var v = 2 * NOTCH; STROKES.forEach(function (s) { v += NOTCH * eBack3(seg(t, s, s + 0.12)); }); return v; }
    var REAL_HI = 0.5, REAL_LO = 0.24;
    function realB(t) {
      if (t < T_DROP) return REAL_HI;
      if (t < T_LIFT) return lerp(REAL_HI, REAL_LO, eP4i(seg(t, T_DROP, T_LIFT)));
      var a = t - T_LIFT; return REAL_LO + 0.06 * Math.abs(Math.sin(a * 13)) * Math.exp(-a / 0.12);
    }
    var crackSvg = u.svgEl('svg', { width: 80, height: GHT, viewBox: '0 0 80 ' + GHT, style: 'position:absolute;left:0;top:0;overflow:visible' }, gB[0].wrap);
    var crackD = 'M58,' + (GHT * 0.08) + ' L44,' + (GHT * 0.18) + ' L53,' + (GHT * 0.26) + ' L36,' + (GHT * 0.39) + ' L47,' + (GHT * 0.47) + ' L30,' + (GHT * 0.6) + ' L41,' + (GHT * 0.68) + ' L27,' + (GHT * 0.8);
    var crack = u.svgEl('path', { d: crackD, fill: 'none', stroke: '#f4f1ff', 'stroke-width': 1.6, 'stroke-linejoin': 'round', opacity: 0 }, crackSvg);
    tl.fromTo(crack, { drawSVG: '0%', opacity: 1 }, { drawSVG: '100%', duration: 0.14, ease: 'power2.out', immediateRender: false }, T_LIFT);
    tl.to(crack, { opacity: 0.55, duration: 0.5 }, T_LIFT + 0.2);
    gA.forEach(function (gg, i) {
      gsap.set([gg.wrap, gg.lab], { opacity: 0 });
      tl.fromTo(gg.wrap, { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.5, ease: 'power3.out' }, tx.ab.in + 0.06 * i);
      tl.fromTo(gg.lab, { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.35, ease: 'power2.out' }, tx.fam.in + 0.06 * i);
      tl.to([gg.wrap, gg.lab], { opacity: 0, duration: 0.25, ease: 'power2.in' }, tx.fam.out - 0.25);
    });
    gB.forEach(function (gg) {
      gsap.set([gg.wrap, gg.lab], { opacity: 0 });
      tl.fromTo([gg.wrap, gg.lab], { opacity: 0 }, { opacity: 1, duration: 0.12, ease: 'power1.out', immediateRender: false }, T_SPLIT);
      tl.fromTo([gg.wrap, gg.lab], { x: -(GX[1] + 130) }, { x: 0, duration: 0.6, ease: 'expo.out', immediateRender: false }, T_SPLIT);
      tl.to([gg.wrap, gg.lab], { x: -(GX[1] + 130), duration: 0.42, ease: 'power3.in' }, T_CLOSE);
      tl.to([gg.wrap, gg.lab], { opacity: 0, duration: 0.25, ease: 'power2.in' }, T_CLOSE + 0.05);
    });

    // ---------------- progress bar: six cells, one per beat, clicks to zero on the hiccup bar ----------------
    var BAR_Y = 152;
    var bar = u.el('div', { cls: 'abs', parent: hudL, style: { left: '360px', top: (BAR_Y - 8) + 'px', width: '1200px', height: '16px', borderRadius: '8px', transformOrigin: '50% 50%',
      background: 'rgba(160,185,235,0.13)', border: '1px solid rgba(190,210,245,0.18)' } });
    var barFill = u.el('div', { cls: 'abs', parent: bar, style: { left: '0px', top: '0px', width: '100%', height: '100%', borderRadius: '8px',
      background: 'linear-gradient(90deg, #6d8fcf 0%, #a9c8ff 70%, #eef5ff 100%)' } });
    for (var cdv = 1; cdv < 6; cdv++) u.el('div', { cls: 'abs', parent: bar, style: { left: (cdv * 200 - 1) + 'px', top: '-1px', width: '2px', height: '16px', background: 'rgba(12,20,40,0.85)' } });
    var barFlash = u.el('div', { cls: 'abs', parent: bar, style: { left: '-6px', top: '-6px', right: '-6px', bottom: '-6px', borderRadius: '12px', background: '#f2f7ff', boxShadow: '0 0 24px #cfe6ff', opacity: 0 } });
    var T_CLICK = T_SPLIT + 0.05;
    gsap.set(bar, { opacity: 0 });
    tl.fromTo(bar, { opacity: 0 }, { opacity: 1, duration: 0.45, ease: 'power2.out' }, 0.1);
    tl.to(bar, { scaleX: 0, opacity: 0, duration: 0.3, ease: 'power3.in' }, T_CLICK + 0.08);
    function barCells(t) {
      if (t >= T_CLICK) return 0;
      var n = 0; for (var k = 1; k <= 6; k++) { var tk = k * BEAT; n += seg(t, tk, tk + (k === 6 ? 0.04 : 0.12), eExpo); }
      return n;
    }

    // ---------------- phase one texts ----------------
    var TXT_COLD = '#e6eefc', SH_COLD = '0 0 26px rgba(127,166,224,0.25), 0 2px 10px rgba(4,8,18,0.8)';
    var h1 = u.text(txt, '', 'line', { x: 960, y: 92, html: mark(tx.h1.text, '觉得', 'color:#c9bfff;text-shadow:0 0 22px rgba(155,140,255,0.6)'),
      style: { fontSize: '56px', lineHeight: '66px', color: TXT_COLD, textShadow: SH_COLD } });
    var h1c = u.splitChars(h1);
    gsap.set(h1c, { opacity: 0 });
    tl.fromTo(h1c, { opacity: 0, y: 44, filter: 'blur(10px)' }, { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.7, ease: 'power4.out', stagger: 0.035 }, tx.h1.in);
    tl.to(h1c, { opacity: 0, y: -26, filter: 'blur(8px)', duration: 0.24, ease: 'power2.in', stagger: 0.004 }, tx.h1.out - 0.29);

    var h2 = u.text(txt, '', 'headline', { x: 960, y: 214, html: mark(tx.h2.text, '更少', 'color:#ffffff;text-shadow:0 0 24px rgba(207,230,255,0.55)'),
      style: { fontSize: '96px', color: TXT_COLD, textShadow: SH_COLD } });
    var lessEl = h2.querySelector('span');
    var h2c = u.splitChars(h2);
    var lessChroma = u.chroma(lessEl, { amount: 0 });
    gsap.set(h2c, { opacity: 0 });
    tl.fromTo(h2c, { opacity: 0, y: -10, scale: 1.08, filter: 'blur(12px)' }, { opacity: 1, y: 0, scale: 1, filter: 'blur(0px)', duration: 0.6, ease: 'expo.out', stagger: 0.03 }, tx.h2.in);
    tl.fromTo(lessChroma.state, { amount: 0 }, { keyframes: [{ amount: 9, duration: 0.05 }, { amount: 3, duration: 0.08 }, { amount: 7, duration: 0.05 }, { amount: 0, duration: 0.4, ease: 'power2.out' }], immediateRender: false }, T_LIFT);
    tl.to(h2c, { opacity: 0, y: 30, filter: 'blur(8px)', duration: 0.24, ease: 'power2.in', stagger: 0.004 }, tx.h2.out - 0.28);

    var LAB_STYLE = { fontSize: '52px', fontWeight: 700, letterSpacing: '0.3em', color: TXT_COLD, textShadow: '0 0 18px rgba(169,200,255,0.45)' };
    var labNow = u.text(txt, tx.now.text, 'small', { x: 922, y: 336, anchor: 'right', style: LAB_STYLE });
    var labWk = u.text(rightBox, tx.wk.text, 'small', { x: 1004, y: 336, anchor: 'left', style: Object.assign({}, LAB_STYLE, { color: '#aebbd6', textShadow: 'none' }) });
    gsap.set([labNow, labWk], { opacity: 0 });
    tl.fromTo(labNow, { opacity: 0, x: 36 }, { opacity: 1, x: 0, duration: 0.45, ease: 'expo.out' }, tx.now.in);
    tl.fromTo(labWk, { opacity: 0, x: -36 }, { opacity: 1, x: 0, duration: 0.45, ease: 'expo.out' }, tx.wk.in);
    tl.to([labNow, labWk], { opacity: 0, duration: 0.25, ease: 'power2.in' }, tx.now.out - 0.25);

    var SRC_STYLE = { color: '#93a4c4' };
    var src1 = u.text(txt, tx.src1.text, 'source', { x: 1860, y: 1040, anchor: 'bottom-right', style: SRC_STYLE });
    gsap.set(src1, { opacity: 0 });
    tl.fromTo(src1, { opacity: 0 }, { opacity: 0.7, duration: 0.5, ease: 'power2.out' }, tx.src1.in);
    tl.to(src1, { opacity: 0, duration: 0.25, ease: 'power2.in' }, tx.src1.out - 0.25);

    // seam and the right-half tint; the seam closes in one beat and its light spreads into the shelves
    tl.set(seam, { opacity: 1 }, T_SPLIT - 0.01);
    tl.fromTo(seam, { scaleY: 0 }, { scaleY: 1, duration: 0.5, ease: 'expo.out', immediateRender: false }, T_SPLIT);
    tl.to(seam, { scaleY: 0, transformOrigin: '50% 50%', duration: BEAT, ease: 'power3.inOut' }, T_CLOSE);
    tl.set(seam, { opacity: 0 }, T_CLOSE + BEAT + 0.01);
    tl.fromTo(rightTint, { opacity: 0 }, { opacity: 1, duration: 0.5, ease: 'power2.out', immediateRender: false }, T_SPLIT);
    tl.to(rightTint, { opacity: 0, duration: BEAT, ease: 'power2.inOut' }, T_CLOSE);

    // ---------------- the loop line: s03's zigzag morphs into four flights, a pen closes the rest ----------------
    var ZV = [[1120, 687], [1120, 625], [1181, 590], [1181, 528], [1242, 493], [1242, 431], [1303, 396], [1303, 334], [1364, 299]];
    var ZIDX = [1, 2, 3, 4, 5, 6, 7, 8, 9];                           // e0 .. te03: the four risers of s0_0 .. s0_3
    var ZMAP = [0, 1, 2, 3, 4, 5, 6, 7, 8];
    var PIDX = []; for (var pk = 9; pk <= 32; pk++) PIDX.push(pk); PIDX.push(1);   // te03 round the loop back to e0 (the pen)
    function polyD(pts) { return 'M' + pts.map(function (p) { return p[0].toFixed(2) + ',' + p[1].toFixed(2); }).join(' L'); }
    var zigFrom = polyD(ZMAP.map(function (j) { return ZV[j]; })), zigTo = polyD(ZIDX.map(function (j) { return SP[j]; }));
    var penD = polyD(PIDX.map(function (j) { return SP[j]; }));
    var LINE_ATTR = { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', fill: 'none' };
    var zigGlow = u.path(loopSvg, zigFrom, Object.assign({ stroke: '#a9c8ff', 'stroke-width': 10, opacity: 0.12 }, LINE_ATTR));
    var zigLine = u.path(loopSvg, zigFrom, Object.assign({ stroke: '#f2f7ff', 'stroke-width': 3 }, LINE_ATTR));
    var penGlow = u.path(loopSvg, penD, Object.assign({ stroke: '#a9c8ff', 'stroke-width': 10, opacity: 0.12 }, LINE_ATTR));
    var penLine = u.path(loopSvg, penD, Object.assign({ stroke: '#f2f7ff', 'stroke-width': 3 }, LINE_ATTR));
    var T_MORPH = 0.3, PEN0 = 0.18, PEN1 = 0.62;
    // the zigzag's nine vertices slide onto the four risers of the first flight (a point-for-point morph, computed per frame)
    var ZFROM = ZMAP.map(function (j) { return ZV[j]; }), ZTO = ZIDX.map(function (j) { return SP[j]; }), eMorph = E('power2.inOut'), lastZ = null;
    u.onFrame(function (t) {
      var m = eMorph(seg(t, 0, T_MORPH)), key = m.toFixed(5);
      if (key === lastZ) return; lastZ = key;
      var d = polyD(ZFROM.map(function (p, i) { return [lerp(p[0], ZTO[i][0], m), lerp(p[1], ZTO[i][1], m)]; }));
      zigLine.setAttribute('d', d); zigGlow.setAttribute('d', d);
    });
    tl.fromTo([penLine, penGlow], { drawSVG: '0% 0%' }, { drawSVG: '0% 100%', duration: PEN1 - PEN0, ease: 'power3.out' }, PEN0);
    tl.to([zigLine, penLine], { attr: { 'stroke-width': 2.2 }, opacity: 0.22, duration: 1.0, ease: 'sine.inOut' }, 0.7);
    tl.to([zigGlow, penGlow], { opacity: 0.05, duration: 1.0, ease: 'sine.inOut' }, 0.7);
    tl.to([zigLine, penLine, zigGlow, penGlow], { opacity: 0, duration: 0.2, ease: 'power2.in' }, T_LIFT);
    // when each box materialises: the zigzag boxes as the morph lands (top first), the rest as the pen passes them
    var PEN_S0 = SL[9], PEN_LEN = SL[32] - SL[9] + SL[1];
    var ePen = E('power3.out');
    function tOfPen(frac) { var lo = 0, hi = 1; for (var i = 0; i < 40; i++) { var m = (lo + hi) / 2; if (ePen(m) < frac) lo = m; else hi = m; } return PEN0 + (lo + hi) / 2 * (PEN1 - PEN0); }
    var ZIG_ORDER = [STEP['0_3'], STEP['0_2'], STEP['0_1'], STEP['0_0']];
    BOX.forEach(function (b) {
      var zi = ZIG_ORDER.indexOf(b);
      if (zi >= 0) b.tIn = 0.12 + 0.035 * zi;   // as the morph lands
      else b.tIn = tOfPen(clamp((((b.sl - PEN_S0) % SLTOT) + SLTOT) % SLTOT / PEN_LEN, 0, 1)) - 0.05;
    });

    // ---------------- deck: shelves, tier labels, cards ----------------
    var PLANK = { top: ROW.top + CH / 2 + 4, mid: ROW.mid + CH / 2 + 4, bot: ROW.bot + CH / 2 + 4 };
    var shelfSvg = u.svgEl('svg', { width: W, height: H, viewBox: '0 0 ' + W + ' ' + H, style: 'position:absolute;left:0;top:0;overflow:visible' }, deckCam);
    var planks = [['top', '#dfe9ff', 0.55], ['mid', '#a9bde6', 0.42], ['bot', '#7f8daa', 0.34]].map(function (p) {
      var y = PLANK[p[0]], d = 'M' + (C_X - 830) + ',' + y + ' L' + (C_X + 830) + ',' + y;
      var gl = u.path(shelfSvg, d, { stroke: p[1], 'stroke-width': 9, opacity: p[2] * 0.22 });
      var ln = u.path(shelfSvg, d, { stroke: p[1], 'stroke-width': 2, opacity: p[2] + 0.2 });
      return [gl, ln];
    });
    planks.forEach(function (pp, i) {
      tl.fromTo(pp, { drawSVG: '50% 50%' }, { drawSVG: '0% 100%', duration: 0.5, ease: 'power3.out', immediateRender: true }, T_CLOSE + 0.32 + 0.04 * i);
      tl.to(pp, { opacity: 0, duration: 0.45, ease: 'power2.in' }, T_RISE + 0.05 * i);
    });
    var TIER = [['top', tx.hi, '#e6eefc'], ['mid', tx.mid, '#b6c4de'], ['bot', tx.low, '#8a97b0']].map(function (q, i) {
      var e = u.text(txt, q[1].text, 'small', { x: 104, y: 0, style: { fontSize: '44px', fontWeight: 700, letterSpacing: '0.06em', color: q[2] } });
      gsap.set(e, { opacity: 0 });
      tl.fromTo(e, { opacity: 0, x: -30 }, { opacity: 1, x: 0, duration: 0.45, ease: 'power3.out' }, q[1].in + 0.05 * i);
      tl.to(e, { opacity: 0, duration: 0.25, ease: 'power2.in' }, q[1].out - 0.25);
      return { el: e, row: q[0] };
    });

    var CARDS = [
      { name: '总结', row: 'bot', col: -2 }, { name: '关键词记忆法', row: 'bot', col: -1 }, { name: '文本意象法', row: 'bot', col: 0 },
      { name: '划线', row: 'bot', col: 1, hl: true }, { name: '重读', row: 'bot', col: 2, hl: true, dust: true },
      { name: '精细提问', row: 'mid', col: -1 }, { name: '自我解释', row: 'mid', col: 0 }, { name: '交错练习', row: 'mid', col: 1 },
      { back: true, row: 'top', off: -170 }, { back: true, row: 'top', off: 170 }
    ];
    var HOVER_BOT = -26, HOVER_MID = -66, TOP_OFF = -900;
    CARDS.forEach(function (c, i) {
      c.idx = i;
      c.x = C_X + (c.back ? c.off : c.col * PITCH); c.y = ROW[c.row];
      if (!c.back) { var e = TX(c.name); c.tin = e.in; c.tout = e.out; }
      var w = u.el('div', { cls: 'abs', parent: deckCam, style: { left: (c.x - CW / 2) + 'px', top: (c.y - CH / 2) + 'px', width: CW + 'px', height: CH + 'px', transformStyle: 'preserve-3d' } });
      var inner = u.el('div', { cls: 'abs', parent: w, style: { left: '0px', top: '0px', width: CW + 'px', height: CH + 'px', transformStyle: 'preserve-3d' } });
      var face = u.el('div', { cls: 'abs', parent: inner, style: { left: '0px', top: '0px', width: CW + 'px', height: CH + 'px' } });
      var low = c.row === 'bot';
      var glass = u.el('div', { cls: 'abs', parent: face, style: { left: '0px', top: '0px', width: CW + 'px', height: CH + 'px', borderRadius: '18px',
        background: c.back ? 'linear-gradient(160deg, #18223e 0%, #0b1224 100%)' : 'linear-gradient(160deg, rgba(74,104,170,0.58) 0%, rgba(18,30,62,0.88) 100%)',
        border: '1.5px solid ' + (c.back ? 'rgba(170,190,240,0.32)' : 'rgba(190,212,255,0.4)'),
        boxShadow: '0 22px 46px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.2)' } });
      u.el('div', { cls: 'abs', parent: glass, style: { left: '0px', top: '0px', width: CW + 'px', height: (CH * 0.5) + 'px', borderRadius: '18px 18px 40px 40px',
        background: 'linear-gradient(180deg, rgba(255,255,255,0.07), rgba(255,255,255,0))' } });
      c.w = w; c.inner = inner; c.face = face; c.glass = glass;
      gsap.set([w, inner], { force3D: true });   // same transform string whatever order frames are rendered in
      if (c.back) {
        u.el('div', { cls: 'abs', parent: face, style: { left: '10px', top: '10px', right: '10px', bottom: '10px', borderRadius: '11px', border: '1px solid rgba(160,180,230,0.16)' } });
        c.halo = u.el('div', { cls: 'abs', parent: face, style: { left: (CW / 2 - 90) + 'px', top: (CH / 2 - 90) + 'px', width: '180px', height: '180px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(220,234,255,0.8) 0%, rgba(169,200,255,0.42) 14%, rgba(127,166,224,0.14) 40%, rgba(127,166,224,0) 70%)' } });
        c.core = u.el('div', { cls: 'abs', parent: face, style: { left: (CW / 2 - 10) + 'px', top: (CH / 2 - 10) + 'px', width: '20px', height: '20px', borderRadius: '50%', boxShadow: '0 0 14px rgba(200,222,255,0.8)',
          background: 'radial-gradient(circle, #f4f9ff 0%, #a9c8ff 60%, #7d8fb3 100%)' } });
        c.flash = u.el('div', { cls: 'abs', parent: face, style: { left: (CW / 2 - 46) + 'px', top: (CH / 2 - 46) + 'px', width: '92px', height: '92px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(240,246,255,0.95) 0%, rgba(200,220,255,0.45) 22%, rgba(169,200,255,0) 62%)', opacity: 0 } });
      } else {
        if (c.hl) c.stripe = u.el('div', { cls: 'abs', parent: glass, style: { left: (CW / 2 - 30 - 23 * c.name.length) + 'px', top: (CH / 2 - 6) + 'px', width: (60 + 46 * c.name.length) + 'px', height: '30px',
          background: '#c8f04a', opacity: 0.45, borderRadius: '8px 14px 9px 15px', transform: 'rotate(-1.5deg)' } });
        c.label = u.el('div', { cls: 'abs', parent: face, text: c.name, style: { font: '700 46px "Noto Sans SC"', left: '0px', top: '0px', width: CW + 'px', height: CH + 'px', lineHeight: CH + 'px', textAlign: 'center',
          color: '#e9f0ff', letterSpacing: '0.02em', textShadow: '0 0 16px rgba(169,200,255,0.35)' } });
      }
    });
    var NAMED = CARDS.filter(function (c) { return !c.back; }), TOPC = CARDS.filter(function (c) { return c.back; });
    // which book becomes which card: the two books under the dot go up with it; the rest pair by screen x
    var TOP_BOOKS = [STEP['0_2'], STEP['0_3']];
    var FALL = LAND.concat([STEP['2_0'], STEP['3_0']]);   // the platforms and the two joining steps fall with the floor
    FALL.forEach(function (b, i) { b.fall = true; b.fdl = 0.04 + 0.1 * hsh(i, 'fdl'); b.fvx = (b.topx - STAIR_C[0]) * 0.35 + (hsh(i, 'fvx') - 0.5) * 80; b.fvy = -60 - 80 * hsh(i, 'fvy'); b.fsp = (hsh(i, 'fsp') - 0.5) * 3; });
    TOP_BOOKS.forEach(function (b, i) { b.topCard = TOPC[i]; TOPC[i].book = b; });
    var others = BOX.filter(function (b) { return TOP_BOOKS.indexOf(b) < 0 && !b.fall; }).sort(function (a, b) { return a.topx - b.topx || a.topy - b.topy; });
    var namedByX = NAMED.slice().sort(function (a, b) { return a.x - b.x || a.y - b.y; });
    others.forEach(function (b, i) { b.card = namedByX[i]; namedByX[i].book = b; });
    // flip times: the low tier cascades on sixteenths and lands on its text time; the middle tier flips on the next
    // sixteenths and hovers until its beat
    NAMED.forEach(function (c) {
      if (c.row === 'bot') { c.tf = c.tin - 0.12; c.land = c.tin; c.hov = HOVER_BOT; }
      else { c.tf = 7.5 + S16 * (1 + NAMED.filter(function (d) { return d.row === 'mid'; }).indexOf(c)); c.land = c.tin; c.hov = HOVER_MID; }
      var b = c.book, hp = deckPt(c.tf, c.x, c.y + c.hov);
      b.tf = c.tf; b.tGo = Math.max(T_CLOSE, c.tf - 0.75); b.tx = hp[0]; b.ty = hp[1];
      b.ts = 0.82 * CW * S0 / boxWidth(b);
    });
    TOP_BOOKS.forEach(function (b, i) {
      b.tf = T_CARDS; b.tGo = T_CLOSE; b.tx = b.topx + 200 + 40 * i; b.ty = -280; b.ts = 1.2; b.up = true;
    });
    function boxWidth(b) { return (b.hx + b.hy) * 2 * C30 * SC; }

    // DOM card motion
    var T_FLYUP = T_RISE + 4 * S16;   // 18.75
    CARDS.forEach(function (c) {
      if (c.back) {
        // they come back down the light from high and far away (never through the caption at the top)
        gsap.set(c.w, { opacity: 0, y: -260, z: -1400, rotationX: 18 });
        tl.to(c.w, { y: 0, z: 0, rotationX: 0, duration: T_HANG - T_TOPDESC, ease: 'power2.out' }, T_TOPDESC);
        tl.to(c.w, { opacity: 1, duration: 0.45, ease: 'power1.out' }, T_TOPDESC);
        tl.to(c.w, { y: TOP_OFF - 60, rotationX: -24, duration: 0.5, ease: 'power3.in' }, T_FLYUP);
        return;
      }
      gsap.set(c.w, { opacity: 0, rotationY: -90, y: c.hov });
      tl.set(c.w, { opacity: 1 }, c.tf);
      tl.to(c.w, { rotationY: 0, duration: 0.3, ease: 'back.out(1.4)' }, c.tf);
      var dropAt = c.row === 'bot' ? c.tf : c.land - 0.18;
      tl.to(c.w, { y: 0, duration: c.land - dropAt, ease: 'power2.in' }, dropAt);
      tl.fromTo(c.inner, { scaleY: 1, scaleX: 1 }, { keyframes: [{ scaleY: 0.96, scaleX: 1.025, duration: 0.06, ease: 'power2.out' }, { scaleY: 1, scaleX: 1, duration: 0.4, ease: 'back.out(1.6)' }], immediateRender: false }, c.land);
      if (c.row === 'mid') {   // the name appears as it lands
        gsap.set(c.label, { opacity: 0 });
        tl.fromTo(c.label, { opacity: 0, scale: 1.25, filter: 'blur(8px)' }, { opacity: 1, scale: 1, filter: 'blur(0px)', duration: 0.3, ease: 'power3.out', immediateRender: false }, c.tin - 0.06);
      }
      var ch = u.splitChars(c.label);
      tl.to(ch, { opacity: 0, y: 26, rotation: function (j) { return (hsh(c.idx * 10 + j, 'nr') - 0.5) * 30; }, filter: 'blur(5px)', duration: 0.24, ease: 'power2.in', stagger: 0.025 },
        c.tout - 0.24 - 0.025 * (ch.length - 1) - 0.012 * (7 - c.idx));
    });
    // shatter order on the rise: low tier then middle tier, one sixteenth each
    var SHATTER = NAMED.slice().sort(function (a, b) { return (a.row === 'bot' ? 0 : 1) - (b.row === 'bot' ? 0 : 1) || a.x - b.x; });
    SHATTER.forEach(function (c, k) { c.ts = T_RISE + k * S16; tl.to(c.glass, { opacity: 0, duration: 0.12, ease: 'power2.in' }, c.ts); tl.set(c.w, { opacity: 0 }, c.ts + 0.13); });

    // MorphSVG outlines: each book's silhouette becomes its card's rounded rectangle
    function rrectD(cx, cy, w, h, r) {
      var x0 = cx - w / 2, y0 = cy - h / 2, x1 = cx + w / 2, y1 = cy + h / 2;
      return 'M' + (x0 + r) + ',' + y0 + ' L' + (x1 - r) + ',' + y0 + ' Q' + x1 + ',' + y0 + ' ' + x1 + ',' + (y0 + r) + ' L' + x1 + ',' + (y1 - r) + ' Q' + x1 + ',' + y1 + ' ' + (x1 - r) + ',' + y1 +
        ' L' + (x0 + r) + ',' + y1 + ' Q' + x0 + ',' + y1 + ' ' + x0 + ',' + (y1 - r) + ' L' + x0 + ',' + (y0 + r) + ' Q' + x0 + ',' + y0 + ' ' + (x0 + r) + ',' + y0 + ' Z';
    }
    NAMED.forEach(function (c) {
      var b = c.book, t0 = c.tf - 0.06, hex = boxHull(b, t0);
      var hp = deckPt(c.tf, c.x, c.y + c.hov), s = deckS(c.tf);
      var dTo = rrectD(hp[0], hp[1], CW * s, CH * s, 18 * s);
      var glow = u.path(morphSvg, polyD(hex) + ' Z', { stroke: '#a9c8ff', 'stroke-width': 9, opacity: 0, fill: 'none' });
      var core = u.path(morphSvg, polyD(hex) + ' Z', { stroke: '#f2f7ff', 'stroke-width': 2, opacity: 0, fill: 'none' });
      tl.to([core, glow], { morphSVG: { shape: dTo, type: 'linear' }, duration: 0.22, ease: 'power3.inOut' }, t0);
      tl.fromTo(core, { opacity: 0 }, { opacity: 0.95, duration: 0.05, immediateRender: false }, t0);
      tl.fromTo(glow, { opacity: 0 }, { opacity: 0.22, duration: 0.05, immediateRender: false }, t0);
      tl.to([core, glow], { opacity: 0, duration: 0.26, ease: 'power2.in' }, t0 + 0.22);
    });

    // ---------------- phase two texts ----------------
    var l2 = u.text(txt, '', 'line', { x: 960, y: 135,
      html: mark(tx.l2.text, '研究评估效果偏低。', 'display:block').replace('偏低', '<span style="color:#ffffff;text-shadow:0 0 16px rgba(169,200,255,0.55)">偏低</span>'),
      style: { fontSize: '52px', lineHeight: '68px', color: '#dfe7f6', textShadow: SH_COLD } });
    var l3 = u.text(txt, '', 'line', { x: 960, y: 952, html: mark(tx.l3.text, '只有 2 种', 'color:#ffffff;text-shadow:0 0 18px rgba(207,230,255,0.65)'),
      style: { fontSize: '52px', lineHeight: '62px', color: '#dfe7f6', textShadow: SH_COLD } });
    var src2 = u.text(txt, tx.src2.text, 'source', { x: 1860, y: 1040, anchor: 'bottom-right', style: SRC_STYLE });
    [[l2, tx.l2, 36, -22], [l3, tx.l3, 0, 0]].forEach(function (p) {
      var ch = u.splitChars(p[0]);
      gsap.set(ch, { opacity: 0 });
      tl.fromTo(ch, { opacity: 0, y: p[2], scale: p[2] ? 1 : 1.25, filter: 'blur(8px)' }, { opacity: 1, y: 0, scale: 1, filter: 'blur(0px)', duration: 0.55, ease: 'power4.out', stagger: 0.022 }, p[1].in);
      tl.to(ch, { opacity: 0, y: p[3], filter: 'blur(6px)', duration: 0.22, ease: 'power2.in', stagger: 0.003 }, p[1].out - 0.22 - 0.003 * (ch.length - 1));
    });
    gsap.set(src2, { opacity: 0 });
    tl.fromTo(src2, { opacity: 0 }, { opacity: 0.7, duration: 0.5, ease: 'power2.out' }, tx.src2.in);
    tl.to(src2, { opacity: 0, duration: 0.25, ease: 'power2.in' }, tx.src2.out - 0.25);

    // ---------------- per-frame DOM state ----------------
    function tickSnap(t, t0) { var k = (t - t0) / S16, n = Math.floor(k); return n + eBack3(clamp((k - n) / 0.38, 0, 1)); }
    u.onFrame(function (t) {
      var c = camAt(t), css = camCss(c), wa = worldAlpha(t);
      world.style.transform = css; world.style.opacity = wa.toFixed(4);
      learnCv.canvas.style.transform = css;
      setLevel(gA[0], famLv(t)); setLevel(gA[1], REAL_HI);
      setLevel(gB[0], famLv(T_SPLIT)); setLevel(gB[1], realB(t));
      var cells = barCells(t);
      barFill.style.clipPath = 'inset(0px ' + ((1 - cells / 6) * 100).toFixed(3) + '% 0px 0px round 8px)';
      var bf = pulse(t - T_CLICK, 0.01, 0.12);
      barFlash.style.opacity = (0.9 * bf).toFixed(4);
      seam.style.filter = 'brightness(' + (0.85 + 0.35 * eN(t) + 0.6 * pulse(t - T_SPLIT, 0.01, 0.3)).toFixed(3) + ')';
      // deck camera push
      var k = deckK(t), s = deckS(t);
      deckCam.style.transform = 'translate(0px,' + (SHIFT * k).toFixed(2) + 'px) scale(' + s.toFixed(5) + ')';
      TIER.forEach(function (q) { q.el.style.top = deckPt(t, C_X, ROW[q.row])[1].toFixed(2) + 'px'; });
      // cards: hovering middle tier ticks like clockwork; low tier desaturated; at the held breath all but two fade
      var low = seg(t, T_LOW - 0.1, T_LOW + 0.6, eSine);
      NAMED.forEach(function (cd, i) {
        var rot = 0, bob = 0;
        if (cd.row === 'mid' && t > cd.tf && t < cd.land) { rot = 1.6 * Math.sin(Math.PI / 2 * tickSnap(t, cd.tf) + i); bob = 3 * Math.sin(t * 3.1 + i); }
        cd.inner.style.rotate = rot.toFixed(3) + 'deg'; cd.inner.style.translate = '0px ' + bob.toFixed(2) + 'px';
        var sat = lerp(cd.row === 'bot' ? 0.5 : 1, 0.4, low), br = lerp(cd.row === 'bot' ? 0.86 : 1, 0.6, low);
        var f = 'saturate(' + sat.toFixed(3) + ') brightness(' + br.toFixed(3) + ')';
        if (cd._f !== f) { cd.face.style.filter = f; cd._f = f; }
      });
      TOPC.forEach(function (cd, i) {
        var sway = t > T_HANG - 0.2 ? 2 * Math.sin(Math.PI / 4 * tickSnap(t, T_HANG) + i * 2.2) * seg(t, T_HANG - 0.2, T_HANG + 0.5) : 0;
        cd.inner.style.rotate = sway.toFixed(3) + 'deg';
        var fl = 0; T_TICK.forEach(function (tk) { fl = Math.max(fl, pulse(t - tk, 0.015, 0.24)); });
        var hop = 0; if (t > T_RISE && t < T_FLYUP + 0.1) { var kk = (t - T_RISE) / S16; hop = Math.exp(-(kk - Math.floor(kk)) * 4) * (1 - seg(t, 18.594, 18.7)); }
        var gave = seg(t, 18.594, 18.7);   // the spark has been dropped
        var en = eN(t);
        cd.flash.style.opacity = (0.95 * Math.max(fl, 0.7 * hop)).toFixed(4);
        cd.core.style.opacity = ((0.55 + 0.25 * en + 0.2 * fl) * (1 - 0.7 * gave)).toFixed(4);
        cd.halo.style.opacity = ((0.4 + 0.3 * en + 0.3 * fl + 0.3 * hop) * (1 - 0.8 * gave)).toFixed(4);
        cd.halo.style.transform = 'scale(' + (0.9 + 0.12 * en + 0.15 * fl + 0.2 * hop).toFixed(4) + ')';
      });
      // volumetric top light: faint over the stairs, strong over the two face-down cards
      var ro = 0.12 * seg(t, 0.3, 1.6, eSine) * (1 - seg(t, 3.6, 4.1)) + 0.5 * eSine(seg(t, T_TOPDESC, T_HANG + 0.3)) * (1 - seg(t, T_RISE, T_RISE + 0.8));
      rays.state.opacity = ro * (0.75 + 0.45 * eN(t));
      var rOn = rays.state.opacity > 0.004; if (rays.el._on !== rOn) { rays.el.style.display = rOn ? '' : 'none'; rays.el._on = rOn; }
      learnCv.state.opacity = (t >= 0 && t <= 6.7) ? wa : 0;
      coneCv.state.opacity = (t >= T_TOPDESC && t <= T_RISE + 0.9) ? 1 : 0;
      sandCv.state.opacity = t > T_RISE ? 1 : 0;
      debrisCv.state.opacity = (t >= T_LIFT && t <= T_LIFT + 1.6) ? 1 : 0;
      stairCv.state.opacity = t < 8.2 ? 1 : 0;
    });

    // ---------------- the learner (faceless line figure, head light 30 %) ----------------
    var HALF = BEAT / 2;   // one step per eighth note: twelve steps, one loop per two bars
    var WALK = ['0_3', '0_4', '1_0', '1_1', '1_2', '1_3', '1_4', '2_0', '3_0', '0_0', '0_1', '0_2', '0_3'].map(function (k) { return STEP[k]; });
    var WALK_S = [WALK[0].sl];
    for (var wi = 1; wi < WALK.length; wi++) { var sN = WALK[wi].sl; while (sN <= WALK_S[wi - 1]) sN += SLTOT; WALK_S.push(sN); }
    function learnerAt(t) {
      var tt = clamp(t, 0, T_SPLIT), k = Math.min(11, Math.floor(tt / HALF)), f = (tt - k * HALF) / HALF;
      if (tt >= T_SPLIT) { k = 11; f = 1; }
      var s = lerp(WALK_S[k], WALK_S[k + 1], E('power2.inOut')(f));
      var p = atSL(s), side = 0;
      for (var q = 0; q < 4; q++) if (s % SLTOT >= SL[LAND[q].pt] - 1e-6) side = q;
      return { x: p[0], y: p[1], side: side, f: f };
    }
    function drawLearner(g, t) {
      if (t < 0 || t > 6.7) return;
      var p = learnerAt(t), fade = seg(t, 0.22, 0.48) * (1 - seg(t, 5.9, 6.6));
      if (fade <= 0.001) return;
      var fl = 0, tilt = 0, dx = 0;
      if (t > T_LIFT) {   // weightless: he rises with his step and drifts off
        var xf = boxXf(B_START, Math.min(t, T_CLOSE)); dx = xf.x - B_START.scx; fl = xf.y - B_START.scy - 30 * eSine(seg(t, T_LIFT, T_LIFT + 1.6)); tilt = 0.25 * eSine(seg(t, T_LIFT, 6.6));
      }
      var face = (p.side === 0 || p.side === 3) ? 1 : -1;
      var walking = t < T_SPLIT, ph = walking ? (t / HALF) * Math.PI : 0, sw = Math.sin(ph) * (walking ? 1 : 0), bob = walking ? Math.abs(Math.cos(ph)) * 2.2 : 0;
      var reach = seg(t, T_SPLIT - 0.1, T_SPLIT + 0.35, eP3o) * (1 - seg(t, T_LIFT + 0.4, T_LIFT + 1.2));
      var S = 0.55;
      g.save();
      g.translate(p.x + dx, p.y + fl); g.rotate(tilt * face);
      g.globalAlpha = 0.5 * fade * (t > T_LIFT ? 0.4 : 1);
      g.fillStyle = 'rgba(0,0,0,0.6)'; g.beginPath(); g.ellipse(0, 1, 20, 5, 0, 0, 6.2832); g.fill();
      g.scale(S * face, S);
      g.globalAlpha = 0.9 * fade;
      g.strokeStyle = '#cfe6ff'; g.lineWidth = 6; g.lineCap = 'round'; g.lineJoin = 'round';
      var hipY = -92 - bob;
      function leg(a) { var kx = Math.sin(a) * 46, ky = hipY + Math.cos(a) * 46; g.moveTo(0, hipY); g.lineTo(kx, ky); g.lineTo(kx + Math.sin(a) * 46, ky + Math.cos(a) * 46); }
      g.beginPath(); leg(0.36 * sw + (t > T_LIFT ? 0.2 : 0)); leg(-0.36 * sw - (t > T_LIFT ? 0.15 : 0)); g.stroke();
      g.beginPath(); g.moveTo(0, hipY); g.lineTo(-7, hipY - 82); g.stroke();
      // left arm swings, or reaches up for the lamp when he is back under it
      var ax = -7 + 26 * Math.sin(-0.5 * sw), ay = hipY - 76 + 34;
      var rx = lerp(ax, -2, reach), ry = lerp(ay, hipY - 140, reach), hx2 = lerp(-7 + 34 * Math.sin(-0.5 * sw) + 6, 4, reach), hy2 = lerp(hipY - 76 + 60, hipY - 196, reach);
      g.beginPath(); g.moveTo(-7, hipY - 76); g.lineTo(rx, ry); g.lineTo(hx2, hy2); g.stroke();
      // right arm holds the word book
      g.beginPath(); g.moveTo(-7, hipY - 76); g.lineTo(9, hipY - 40); g.lineTo(18, hipY - 10); g.stroke();
      g.save(); g.translate(20, hipY - 40); g.rotate(-0.25);
      g.fillStyle = '#0b1325'; g.strokeStyle = '#cfe6ff'; g.lineWidth = 4; g.fillRect(-4, -26, 30, 44); g.strokeRect(-4, -26, 30, 44);
      g.fillStyle = 'rgba(200,240,74,0.8)'; g.fillRect(2, -8, 18, 6);
      g.restore();
      var hx = -13, hy = hipY - 109, en = eN(t);
      var hg = g.createRadialGradient(hx, hy, 0, hx, hy, 74);
      hg.addColorStop(0, 'rgba(169,200,255,' + (0.4 * (1 + 0.2 * en)).toFixed(4) + ')'); hg.addColorStop(1, 'rgba(169,200,255,0)');
      g.fillStyle = hg; g.fillRect(hx - 74, hy - 74, 148, 148);
      var og = g.createRadialGradient(hx - 4, hy - 6, 2, hx, hy, 23);
      og.addColorStop(0, '#dfe9ff'); og.addColorStop(0.55, '#8fa9d6'); og.addColorStop(1, '#5d77a8');
      g.globalAlpha = 0.6 * fade; g.fillStyle = og; g.beginPath(); g.arc(hx, hy, 23, 0, 6.2832); g.fill();
      g.restore();
    }

    // ---------------- drawing the staircase ----------------
    function quad(g, a, b, c, d) { g.beginPath(); g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); g.lineTo(c[0], c[1]); g.lineTo(d[0], d[1]); g.closePath(); }
    function L2p(a, b, f) { return [lerp(a[0], b[0], f), lerp(a[1], b[1], f)]; }
    function bookFace(g, T1, T2, B1, B2, f) {
      for (var k = 0; k < NBK; k++) {
        var f0 = k / NBK, f1 = (k + 1) / NBK, h = f1 - f0;
        quad(g, L2p(T1, B1, f0), L2p(T2, B2, f0), L2p(T2, B2, f1), L2p(T1, B1, f1)); g.fillStyle = f.fill[k]; g.fill();
        if (f.spine) {   // spine: two bands and a title block
          g.strokeStyle = 'rgba(226,234,252,0.30)'; g.lineWidth = 1;
          [0.2, 0.8].forEach(function (rf) { var A1 = L2p(T1, B1, f0 + rf * h), A2 = L2p(T2, B2, f0 + rf * h); g.beginPath(); g.moveTo(A1[0], A1[1]); g.lineTo(A2[0], A2[1]); g.stroke(); });
          var u0 = 0.3 + 0.2 * hsh(k, f.key), u1 = u0 + 0.24;
          var a1 = L2p(L2p(T1, T2, u0), L2p(B1, B2, u0), f0 + 0.36 * h), a2 = L2p(L2p(T1, T2, u1), L2p(B1, B2, u1), f0 + 0.36 * h),
            a3 = L2p(L2p(T1, T2, u1), L2p(B1, B2, u1), f0 + 0.64 * h), a4 = L2p(L2p(T1, T2, u0), L2p(B1, B2, u0), f0 + 0.64 * h);
          quad(g, a1, a2, a3, a4); g.fillStyle = 'rgba(226,234,252,0.32)'; g.fill();
        } else {         // page edges between two covers
          g.strokeStyle = 'rgba(20,28,48,0.22)'; g.lineWidth = 0.8;
          for (var r = 1; r < 4; r++) { var ff = f0 + (0.12 + r * 0.19) * h; var A1 = L2p(T1, B1, ff), A2 = L2p(T2, B2, ff); g.beginPath(); g.moveTo(A1[0], A1[1]); g.lineTo(A2[0], A2[1]); g.stroke(); }
          g.strokeStyle = f.edge[k]; g.lineWidth = 2.6;
          [f0 + 0.06 * h, f1 - 0.06 * h].forEach(function (ff2) { var A1 = L2p(T1, B1, ff2), A2 = L2p(T2, B2, ff2); g.beginPath(); g.moveTo(A1[0], A1[1]); g.lineTo(A2[0], A2[1]); g.stroke(); });
        }
        if (k) { var m1 = L2p(T1, B1, f0), m2 = L2p(T2, B2, f0); g.strokeStyle = 'rgba(4,7,16,0.7)'; g.lineWidth = 1.3; g.beginPath(); g.moveTo(m1[0], m1[1]); g.lineTo(m2[0], m2[1]); g.stroke(); }
      }
    }
    // painter's order for axis-aligned boxes: separated along x, y or z means the lower one is farther
    function paintOrder() {
      var n = BOX.length, before = BOX.map(function () { return []; }), indeg = BOX.map(function () { return 0; });
      function ext(b) { return { x0: b.cx - b.hx, x1: b.cx + b.hx, y0: b.cy - b.hy, y1: b.cy + b.hy, z0: b.z - TH, z1: b.z }; }
      function scr(b) { var e = ext(b); return { l: PXs(e.x0, e.y1), r: PXs(e.x1, e.y0), t: PYs(e.x0, e.y0, e.z1), b: PYs(e.x1, e.y1, e.z0) }; }
      var E2 = BOX.map(ext), S2 = BOX.map(scr), eps = 0.5;
      for (var i = 0; i < n; i++) for (var j = i + 1; j < n; j++) {
        var a = E2[i], c = E2[j], sa = S2[i], sc = S2[j];
        if (sa.r <= sc.l || sc.r <= sa.l || sa.b <= sc.t || sc.b <= sa.t) continue;
        var first = null;
        if (a.x1 <= c.x0 + eps) first = i; else if (c.x1 <= a.x0 + eps) first = j;
        else if (a.y1 <= c.y0 + eps) first = i; else if (c.y1 <= a.y0 + eps) first = j;
        else if (a.z1 <= c.z0 + eps) first = i; else if (c.z1 <= a.z0 + eps) first = j;
        if (first == null) continue;
        var second = first === i ? j : i; before[first].push(second); indeg[second]++;
      }
      var out = [], done = BOX.map(function () { return false; });
      while (out.length < n) {
        var ready = []; for (var q = 0; q < n; q++) if (!done[q] && indeg[q] === 0) ready.push(q);
        if (!ready.length) for (var q2 = 0; q2 < n; q2++) if (!done[q2]) ready.push(q2);
        ready.sort(function (x, y) { return BOX[x].depth - BOX[y].depth; });
        var k = ready[0]; done[k] = true; out.push(BOX[k]); before[k].forEach(function (m) { indeg[m]--; });
      }
      return out;
    }
    function boxCorners(b) {
      var x0 = b.cx - b.hx, x1 = b.cx + b.hx, y0 = b.cy - b.hy, y1 = b.cy + b.hy, zt = b.z, zb = b.z - TH;
      function P(x, y, z) { return [PXs(x, y), PYs(x, y, z)]; }
      return { A: P(x0, y0, zt), B: P(x1, y0, zt), C: P(x1, y1, zt), D: P(x0, y1, zt), Bb: P(x1, y0, zb), Cb: P(x1, y1, zb), Db: P(x0, y1, zb) };
    }
    function drawBox(g, b, alpha, dy, hlN) {
      if (alpha <= 0.002) return;
      var K = boxCorners(b);
      function Q2(p) { return [p[0], p[1] + dy]; }
      var A = Q2(K.A), B = Q2(K.B), C = Q2(K.C), Dd = Q2(K.D), Bb = Q2(K.Bb), Cb = Q2(K.Cb), Db = Q2(K.Db);
      g.globalAlpha = alpha;
      bookFace(g, B, C, Bb, Cb, b.fx);
      bookFace(g, Dd, C, Db, Cb, b.fy);
      quad(g, A, B, C, Dd);
      var tg = g.createLinearGradient(A[0], A[1], C[0], C[1]);
      tg.addColorStop(0, b.top0); tg.addColorStop(1, b.top1);
      g.fillStyle = tg; g.fill();
      var ins = 0.13, I1 = L2p(A, C, ins), I3 = L2p(C, A, ins), I2 = L2p(B, Dd, ins), I4 = L2p(Dd, B, ins);
      quad(g, I1, I2, I3, I4); g.strokeStyle = 'rgba(225,235,255,0.16)'; g.lineWidth = 1; g.stroke();
      g.strokeStyle = 'rgba(214,228,255,0.32)'; g.lineWidth = 1.1;
      g.beginPath(); g.moveTo(A[0], A[1]); g.lineTo(B[0], B[1]); g.moveTo(A[0], A[1]); g.lineTo(Dd[0], Dd[1]);
      g.moveTo(B[0], B[1]); g.lineTo(Bb[0], Bb[1]); g.lineTo(Cb[0], Cb[1]); g.lineTo(Db[0], Db[1]); g.lineTo(Dd[0], Dd[1]); g.moveTo(C[0], C[1]); g.lineTo(Cb[0], Cb[1]); g.stroke();
      g.strokeStyle = 'rgba(238,245,255,0.8)'; g.lineWidth = 1.8;
      g.beginPath(); g.moveTo(B[0], B[1]); g.lineTo(C[0], C[1]); g.lineTo(Dd[0], Dd[1]); g.stroke();
      if (b.land) {   // a small open copy of the same word book, with the same flat highlighter
        var bs = Math.min(b.hx, b.hy) / 46;
        var Q = function (x, y) { return [PXs(b.cx + x * bs, b.cy + y * bs), PYs(b.cx + x * bs, b.cy + y * bs, b.z) + dy]; };
        [[-38, -3], [3, 38]].forEach(function (r, pi2) {
          quad(g, Q(r[0], -28), Q(r[1], -28), Q(r[1], 28), Q(r[0], 28)); g.fillStyle = pi2 ? '#d3dbe9' : '#c4cede'; g.fill();
          g.strokeStyle = 'rgba(40,52,80,0.35)'; g.lineWidth = 0.8;
          for (var li = 0; li < 4; li++) { var yy = -18 + li * 11, a1 = Q(r[0] + 6, yy), a2 = Q(r[1] - 6 - (li % 2) * 8, yy); g.beginPath(); g.moveTo(a1[0], a1[1]); g.lineTo(a2[0], a2[1]); g.stroke(); }
        });
        if (hlN > 0) {
          var wNow = 28 * clamp(hlN, 0, 1);
          quad(g, Q(7, -15), Q(7 + wNow, -15), Q(7 + wNow, -7), Q(7, -7)); g.fillStyle = 'rgba(200,240,74,0.85)'; g.fill();
        }
      }
      g.globalAlpha = 1;
    }
    function landHL(b, t) { return b.li >= 1 ? seg(t, STROKES[b.li - 1], STROKES[b.li - 1] + 0.3, eP2o) : 0; }
    // the hull of a box as drawn (A B Bb Cb Db D), under its float transform: the start shape of its card morph
    function boxHull(b, t) {
      var K = boxCorners(b), xf = boxXf(b, t), sq = squashOf(b, t), ang = xf.rot * Math.PI / 180, cs = Math.cos(ang), sn = Math.sin(ang);
      return [K.A, K.B, K.Bb, K.Cb, K.Db, K.D].map(function (p) {
        var x = (p[0] - b.scx) * xf.s * sq, y = (p[1] - b.scy) * xf.s;
        return [xf.x + x * cs - y * sn, xf.y + x * sn + y * cs];
      });
    }
    function tickAngle(t, d) { return t <= T_LIFT ? 0 : d * tickSnap(t, T_LIFT); }
    function boxXf(b, t) {
      var x = b.scx, y = b.scy, rot = 0, s = 1;
      if (t > T_LIFT) {
        var f = eSine(seg(t, T_LIFT, T_LIFT + 2.2));
        x += (b.scx - STAIR_C[0]) * 0.2 * f + b.drift * f;
        y += -(24 + 44 * b.lift) * f + (b.scy - STAIR_C[1]) * 0.1 * f;
        rot = tickAngle(t, b.tick);
      }
      if (b.tf != null && t > b.tGo) {
        var p = b.up ? eP2i(seg(t, b.tGo, b.tf)) : eP3io(seg(t, b.tGo, b.tf));
        var mx = (x + b.tx) / 2, my = Math.min(y, b.ty) - (b.up ? 0 : 140);
        var nx = (1 - p) * (1 - p) * x + 2 * (1 - p) * p * mx + p * p * b.tx, ny = (1 - p) * (1 - p) * y + 2 * (1 - p) * p * my + p * p * b.ty;
        if (b.up) { var px2 = eP2o(seg(t, b.tGo, b.tf)); nx = lerp(x, b.tx, px2); ny = lerp(y, b.ty, p); }
        x = nx; y = ny; rot = lerp(rot, 0, p); s = lerp(1, b.ts, p);
      }
      return { x: x, y: y, rot: rot, s: s };
    }
    function squashOf(b, t) { return b.tf == null || b.up ? 1 : Math.cos(Math.PI / 2 * seg(t, b.tf - 0.1, b.tf)); }

    function drawStairs(g, t) {
      if (t < T_LIFT) {
        drawFloor(g, t);
        for (var oi = 0; oi < ORDER.length; oi++) {
          var b = ORDER[oi], ap = seg(t, b.tIn, b.tIn + 0.2, eP2o);
          if (ap <= 0) continue;
          var dy = -18 * (1 - eBack(seg(t, b.tIn, b.tIn + 0.38)));
          drawBox(g, b, ap, dy, b.land ? landHL(b, t) : 0);
        }
        return;
      }
      // the lift: weightless books, a tick of rotation on every sixteenth, then each flies to its shelf
      for (var oj = 0; oj < ORDER.length; oj++) {
        var bb = ORDER[oj];
        if (bb.fall || (bb.tf != null && t >= bb.tf)) continue;
        var xf = boxXf(bb, t), sq = squashOf(bb, t);
        g.save();
        g.translate(xf.x, xf.y); g.rotate(xf.rot * Math.PI / 180); g.scale(xf.s * Math.max(0.02, sq), xf.s); g.translate(-bb.scx, -bb.scy);
        drawBox(g, bb, 1, 0, bb.land ? landHL(bb, t) : 0);
        g.restore();
      }
    }

    // ---------------- the floor under the stair, and how it breaks away on the lift ----------------
    var FL = [], CELL = 46, ZF = -TH - 46;
    (function () {
      var x0 = 1e9, x1 = -1e9, y0 = 1e9, y1 = -1e9;
      BOX.forEach(function (b) { x0 = Math.min(x0, b.cx - b.hx); x1 = Math.max(x1, b.cx + b.hx); y0 = Math.min(y0, b.cy - b.hy); y1 = Math.max(y1, b.cy + b.hy); });
      x0 -= CELL * 2; y0 -= CELL * 2; x1 += CELL * 2; y1 += CELL * 2;
      var mx = (x0 + x1) / 2, my = (y0 + y1) / 2, rx = (x1 - x0) / 2, ry = (y1 - y0) / 2, n = 0;
      for (var x = x0; x < x1; x += CELL) for (var y = y0; y < y1; y += CELL) {
        var d = Math.max(Math.abs(x + CELL / 2 - mx) / rx, Math.abs(y + CELL / 2 - my) / ry);
        var wgt = clamp(1 - d, 0, 1); if (wgt <= 0.02) continue;
        var pts = [[x, y], [x + CELL, y], [x + CELL, y + CELL], [x, y + CELL]].map(function (p) { return [PXs(p[0], p[1]), PYs(p[0], p[1], ZF)]; });
        var c = [(pts[0][0] + pts[2][0]) / 2, (pts[0][1] + pts[2][1]) / 2];
        FL.push({ pts: pts, c: c, w: Math.pow(wgt, 0.7), dl: 0.22 * d + 0.08 * hsh(n, 'fd'), spin: (hsh(n, 'fs') - 0.5) * 5, vx: (hsh(n, 'fx') - 0.5) * 60 + (c[0] - STAIR_C[0]) * 0.15, vy: -30 - 40 * hsh(n, 'fy') });
        n++;
      }
    })();
    function drawFloor(g, t) {
      var a = seg(t, 0.1, 0.7, eP2o);
      if (a <= 0.003) return;
      for (var i = 0; i < FL.length; i++) {
        var c = FL[i];
        quad(g, c.pts[0], c.pts[1], c.pts[2], c.pts[3]);
        g.fillStyle = 'rgba(70,96,150,' + (0.16 * c.w * a).toFixed(4) + ')'; g.fill();
        g.strokeStyle = 'rgba(169,200,255,' + (0.2 * c.w * a).toFixed(4) + ')'; g.lineWidth = 1; g.stroke();
      }
    }
    function drawDebris(g, t) {
      var tau0 = t - T_LIFT; if (tau0 < 0 || tau0 > 1.6) return;
      for (var fi = 0; fi < ORDER.length; fi++) {
        var fb = ORDER[fi]; if (!fb.fall) continue;
        var ft = Math.max(0, tau0 - fb.fdl), fa = 0.5 * (1 - seg(ft, 0.3, 1.0, eP2i));
        if (fa <= 0.003) continue;
        g.save();
        g.translate(fb.scx + fb.fvx * ft, fb.scy + fb.fvy * ft + 0.5 * 1700 * ft * ft); g.rotate(fb.fsp * ft); g.scale(1 - 0.18 * ft, 1 - 0.18 * ft); g.translate(-fb.scx, -fb.scy);
        drawBox(g, fb, fa, 0, fb.land ? landHL(fb, t) : 0);
        g.restore();
      }
      for (var i = 0; i < FL.length; i++) {
        var c = FL[i], tau = tau0 - c.dl; if (tau < -c.dl) continue;
        tau = Math.max(0, tau);
        var al = c.w * (1 - seg(tau, 0.25, 0.95, eP2i));
        if (al <= 0.003) continue;
        var ox = c.vx * tau, oy = c.vy * tau + 0.5 * 1500 * tau * tau, ang = c.spin * tau;
        g.save(); g.translate(c.c[0] + ox, c.c[1] + oy); g.rotate(ang); g.scale(1 - 0.3 * tau, 1 - 0.3 * tau); g.translate(-c.c[0], -c.c[1]);
        quad(g, c.pts[0], c.pts[1], c.pts[2], c.pts[3]);
        g.fillStyle = 'rgba(90,120,180,' + (0.2 * al).toFixed(4) + ')'; g.fill();
        g.strokeStyle = 'rgba(200,222,255,' + (0.4 * al).toFixed(4) + ')'; g.lineWidth = 1.2; g.stroke();
        g.restore();
      }
    }

    // ---------------- background: a giant faint echo of the loop ----------------
    var ECHO = SP.map(function (p) { return [(p[0] - STAIR_C[0]) * 2.4 + 820, (p[1] - STAIR_C[1]) * 2.4 + 600]; });
    function strokeLine(g, pts, w, col, a) {
      if (a <= 0.002 || pts.length < 2) return;
      g.globalAlpha = a; g.strokeStyle = col; g.lineWidth = w; g.lineJoin = 'round'; g.lineCap = 'round';
      g.beginPath(); g.moveTo(pts[0][0], pts[0][1]); for (var i = 1; i < pts.length; i++) g.lineTo(pts[i][0], pts[i][1]); g.stroke(); g.globalAlpha = 1;
    }
    function drawBack(g, t) {
      var a = 0.05 * seg(t, 0.3, 1.6) * (1 - 0.6 * seg(t, 3.6, 4.1)) * (1 - seg(t, T_LIFT, T_LIFT + 0.6));
      if (a <= 0.002) return;
      g.translate(-30 * seg(t, 0, 6), -14 * seg(t, 0, 6));
      strokeLine(g, ECHO, 3, '#a9c8ff', a * (0.8 + 0.4 * eN(t)));
      g.translate(1260, -300); g.scale(0.5, 0.5); g.translate(-760, -560);
      strokeLine(g, ECHO, 4, '#a9c8ff', 0.6 * a);
    }

    // ---------------- fx: the motif dot, flashes, dust, trails, sparks ----------------
    function glowDisc(g, x, y, rad, rgb, a) {
      if (a <= 0.002 || rad <= 0.5) return;
      var gr = g.createRadialGradient(x, y, 0, x, y, rad);
      gr.addColorStop(0, rgb + clamp(a, 0, 1).toFixed(4) + ')'); gr.addColorStop(0.35, rgb + clamp(a * 0.42, 0, 1).toFixed(4) + ')'); gr.addColorStop(1, rgb + '0)');
      g.fillStyle = gr; g.fillRect(x - rad, y - rad, rad * 2, rad * 2);
    }
    var Z_TOP = [1364, 296];
    var HOV = [B_START.topx, B_START.topy - 180];
    function orbPos(t) {
      if (t < BEAT) { var e = eP3io(seg(t, 0.05, BEAT)); return [lerp(Z_TOP[0], HOV[0], e), lerp(Z_TOP[1], HOV[1], e) - 60 * Math.sin(Math.PI * e)]; }
      var bob = 5 * Math.sin((t - BEAT) * 2.2) * seg(t, BEAT, BEAT + 0.6);
      var dodge = 18 * Math.exp(-Math.pow((t - (T_SPLIT + 0.2)) / 0.45, 2));   // he arrives under it, it lifts out of reach
      var p = [HOV[0], HOV[1] + bob - dodge];
      if (t < T_SPLIT + 0.4) p = camPt(t, p[0], p[1]);
      if (t > T_LIFT) { var up = eSineI(seg(t, T_LIFT, T_LIFT + 1.5)); p[1] -= (HOV[1] + 160) * up; p[0] += 70 * up + 10 * Math.sin((t - T_LIFT) * 3); }
      return p;
    }
    var RD = u.rand('s04dust2'), DUST = [];
    var C_REREAD = CARDS[4];
    for (var dk = 0; dk < 70; dk++) DUST.push({ card: C_REREAD, x: RD.range(-150, 150), y: RD.range(-4, 4), vx: RD.range(-90, 90), vy: RD.range(-110, -20), t0: C_REREAD.land + RD.range(0, 0.06), life: RD.range(0.6, 1.3), r: RD.range(0.7, 2.0), g: 120 });
    NAMED.forEach(function (c) { for (var k = 0; k < 14; k++) DUST.push({ card: c, x: RD.range(-140, 140), y: -3, vx: RD.range(-50, 50), vy: RD.range(-60, -10), t0: c.land, life: RD.range(0.4, 0.8), r: RD.range(0.6, 1.4), g: 80 }); });
    function drawFx(g, t) {
      var en = eN(t);
      g.globalCompositeOperation = 'lighter';
      // drum hits: a cold breath of light
      var hp = 0; HITS.forEach(function (h) { hp = Math.max(hp, pulse(t - h, 0.01, 0.3)); });
      if (hp > 0.01) {
        var hc = t < T_LIFT + 1 ? [STAIR_C[0], STAIR_C[1]] : t < T_RISE ? [960, 600] : [960, 520];
        glowDisc(g, hc[0], hc[1], 640, 'rgba(150,185,255,', 0.07 * hp);
      }
      // the stair lands on the downbeat: a sparkle where the zigzag ended
      var sp = pulse(t, 0.01, 0.28);
      if (sp > 0.01) { glowDisc(g, Z_TOP[0], Z_TOP[1] + 4, 80, 'rgba(190,215,255,', 0.5 * sp); }
      // progress bar click
      var bk = pulse(t - T_CLICK, 0.008, 0.18);
      if (bk > 0.01) { glowDisc(g, 1560, BAR_Y, 70, 'rgba(200,225,255,', 0.7 * bk); glowDisc(g, 1560, BAR_Y, 12, 'rgba(250,252,255,', bk); }
      // seam flash
      var sf = pulse(t - T_SPLIT, 0.012, 0.28);
      if (sf > 0.01) {
        g.save(); g.translate(960, 600); g.scale(0.09, 1);
        var gr = g.createRadialGradient(0, 0, 0, 0, 0, 900); gr.addColorStop(0, 'rgba(225,238,255,' + (0.55 * sf).toFixed(4) + ')'); gr.addColorStop(1, 'rgba(160,190,255,0)');
        g.fillStyle = gr; g.fillRect(-900, -900, 1800, 1800); g.restore();
      }
      // the lift: a cold ring from the stair's foot as the floor breaks
      var lf = pulse(t - T_LIFT, 0.01, 0.35);
      if (lf > 0.01) {
        var fc = [STAIR_C[0], STAIR_C[1] + 150];
        glowDisc(g, fc[0], fc[1], 520, 'rgba(160,190,255,', 0.22 * lf);
        var rq = seg(t, T_LIFT, T_LIFT + 0.55), rr = 40 + 460 * eExpo(rq);
        g.save(); g.translate(fc[0], fc[1]); g.scale(1, 0.5); g.strokeStyle = 'rgba(200,222,255,' + (0.36 * (1 - rq)).toFixed(4) + ')'; g.lineWidth = 3; g.beginPath(); g.arc(0, 0, rr, 0, 6.2832); g.stroke(); g.restore();
      }
      // book trails while they fly to the shelves (and up, for the top two)
      BOX.forEach(function (b) {
        if (b.tf == null) return;
        var p = seg(t, b.tGo, b.tf); if (p <= 0 || p >= 1) return;
        var xf = boxXf(b, t);
        glowDisc(g, xf.x, xf.y, 90, 'rgba(160,190,255,', 0.16 * Math.sin(Math.PI * p));
      });
      // shelf landing glints
      NAMED.forEach(function (c) { var k = pulse(t - c.land, 0.01, 0.25); if (k > 0.01) { var q = deckPt(t, c.x, PLANK[c.row]); glowDisc(g, q[0], q[1], 170, 'rgba(180,205,255,', 0.3 * k); } });
      // dust
      g.fillStyle = '#a9c0e8';
      for (var i = 0; i < DUST.length; i++) {
        var d = DUST[i], a = t - d.t0; if (a < 0 || a > d.life) continue;
        var k2 = a / d.life, base = deckPt(t, d.card.x + d.x, PLANK[d.card.row] + d.y);
        g.globalAlpha = 0.55 * (1 - k2) * (0.8 + 0.4 * en);
        g.beginPath(); g.arc(base[0] + d.vx * a, base[1] + d.vy * a + 0.5 * d.g * a * a, d.r, 0, 6.2832); g.fill();
      }
      g.globalAlpha = 1;
      // the motif dot (grey blue, 30 %) wrapped in the lavender halo of familiarity
      if (t < T_LIFT + 1.6) {
        var dp = orbPos(t), fam = clamp((famLv(Math.min(t, T_SPLIT)) - 0.3) / 0.6, 0, 1), da = t < T_LIFT ? 1 : 1 - seg(t, T_LIFT + 1.1, T_LIFT + 1.5);
        var halo = fam * (0.75 + 0.35 * en);
        if (halo * da > 0.003) {
          var hr = 26 + 64 * fam, hgr = g.createRadialGradient(dp[0], dp[1], 0, dp[0], dp[1], hr);
          hgr.addColorStop(0, 'rgba(155,140,255,0)'); hgr.addColorStop(0.16, 'rgba(155,140,255,0)'); hgr.addColorStop(0.3, 'rgba(165,150,255,' + (0.5 * halo * da).toFixed(4) + ')');
          hgr.addColorStop(0.6, 'rgba(155,140,255,' + (0.14 * halo * da).toFixed(4) + ')'); hgr.addColorStop(1, 'rgba(155,140,255,0)');
          g.fillStyle = hgr; g.fillRect(dp[0] - hr, dp[1] - hr, hr * 2, hr * 2);
        }
        glowDisc(g, dp[0], dp[1], 120, 'rgba(58,74,107,', 0.05 * da);
        glowDisc(g, dp[0], dp[1], 36, 'rgba(120,150,200,', 0.28 * da * (0.85 + 0.3 * en));
        glowDisc(g, dp[0], dp[1], 13, 'rgba(225,238,255,', 0.16 * da);
        g.globalCompositeOperation = 'source-over';
        g.globalAlpha = da * 0.75; g.fillStyle = '#7d8fb3'; g.beginPath(); g.arc(dp[0], dp[1], 4.6, 0, 6.2832); g.fill();
        g.globalAlpha = 1; g.globalCompositeOperation = 'lighter';
      }
      // the two face-down cards fly up with light trails, then drop their sparks
      TOPC.forEach(function (c) {
        var k = seg(t, T_FLYUP + 0.08, T_FLYUP + 0.5, eP3i); if (k <= 0 || k >= 1) return;
        var q = deckPt(t, c.x, c.y);
        g.save(); g.translate(q[0], q[1] - 900 * k + 120); g.scale(0.08, 1);
        var gr2 = g.createRadialGradient(0, 0, 0, 0, 0, 420); gr2.addColorStop(0, 'rgba(210,228,255,' + (0.38 * Math.sin(Math.PI * k)).toFixed(4) + ')'); gr2.addColorStop(1, 'rgba(160,190,255,0)');
        g.fillStyle = gr2; g.fillRect(-420, -420, 840, 840); g.restore();
      });
      g.globalCompositeOperation = 'source-over';
    }

    // ---------------- the cold volumetric cone over the two face-down cards ----------------
    var RM = u.rand('s04motes'), MOTES = [];
    for (var mi = 0; mi < 70; mi++) MOTES.push({ x: RM.range(-1, 1), y: RM(), sp: RM.range(8, 22), r: RM.range(0.6, 1.8), ph: RM() * 6.28, tw: RM.range(1, 3) });
    function drawCone(g, t) {
      var a = eSine(seg(t, T_TOPDESC + 0.2, T_HANG + 0.3)) * (1 - seg(t, T_RISE, T_RISE + 0.75));
      if (a <= 0.002) return;
      var en = eN(t), flick = 0; T_TICK.forEach(function (tk) { flick = Math.max(flick, pulse(t - tk, 0.015, 0.3)); });
      var k = a * (0.8 + 0.3 * en + 0.35 * flick) * (1 + 0.25 * seg(t, T_LOW, T_LOW + 0.6, eSine));
      g.globalCompositeOperation = 'lighter';
      var ax = C_X, ay = -160, by = deckPt(t, C_X, PLANK.top)[1] + 30, hw = 400 * deckS(t);
      var lg = g.createLinearGradient(0, ay, 0, by);
      lg.addColorStop(0, 'rgba(220,234,255,0)'); lg.addColorStop(0.35, 'rgba(214,230,255,' + (0.10 * k).toFixed(4) + ')');
      lg.addColorStop(0.85, 'rgba(200,222,255,' + (0.16 * k).toFixed(4) + ')'); lg.addColorStop(1, 'rgba(200,222,255,0)');
      g.fillStyle = lg; g.beginPath(); g.moveTo(ax - 30, ay); g.lineTo(ax + 30, ay); g.lineTo(ax + hw, by); g.lineTo(ax - hw, by); g.closePath(); g.fill();
      var lg2 = g.createLinearGradient(0, ay, 0, by);
      lg2.addColorStop(0, 'rgba(235,243,255,0)'); lg2.addColorStop(0.5, 'rgba(235,243,255,' + (0.08 * k).toFixed(4) + ')'); lg2.addColorStop(1, 'rgba(235,243,255,0)');
      g.fillStyle = lg2; g.beginPath(); g.moveTo(ax - 12, ay); g.lineTo(ax + 12, ay); g.lineTo(ax + 220, by); g.lineTo(ax - 220, by); g.closePath(); g.fill();
      var py = deckPt(t, C_X, PLANK.top)[1];
      g.save(); g.translate(C_X, py); g.scale(1, 0.12);
      var pg = g.createRadialGradient(0, 0, 0, 0, 0, 520); pg.addColorStop(0, 'rgba(210,228,255,' + (0.5 * k).toFixed(4) + ')'); pg.addColorStop(1, 'rgba(210,228,255,0)');
      g.fillStyle = pg; g.fillRect(-520, -520, 1040, 1040); g.restore();
      for (var i = 0; i < MOTES.length; i++) {
        var m = MOTES[i], yy = ((m.y * (by - 40) + t * m.sp) % (by - 40)) + 20, wdt = lerp(40, hw, (yy - ay) / (by - ay));
        var xx = ax + m.x * wdt * 0.9 + 6 * Math.sin(t * 0.7 + m.ph);
        glowDisc(g, xx, yy, m.r * 4, 'rgba(225,238,255,', 0.5 * k * (0.5 + 0.5 * Math.sin(t * m.tw + m.ph)));
      }
      g.globalCompositeOperation = 'source-over';
    }

    // ---------------- the rise: word sand, one thin stream, the sparks become its tip ----------------
    var SX = 960, Y_TOP = 330, Y_TIP_MAX = 800, Y_TIP_END = 752, T_TIP0 = T_RISE + 0.15;
    function topY(t) { return lerp(650, Y_TOP, eSine(seg(t, 19.2, 19.5))); }   // stays below the middle tier until it has broken up
    function tipY(t) {
      if (t < T_LINE) return lerp(700, Y_TIP_MAX, eSineO(seg(t, T_TIP0, T_LINE)));
      return lerp(Y_TIP_MAX, Y_TIP_END, eP2o(seg(t, T_LINE, T_STILL)));
    }
    function joinY(ta, y0, r) { var a = topY(ta) + 20; return lerp(a, Math.max(a + 20, Math.min(tipY(ta) - 30, y0 - 30)), r); }
    var METHOD_EN = ['summarization', 'keyword mnemonic', 'imagery for text', 'highlighting', 'rereading', 'elaborative interrogation', 'self explanation', 'interleaved practice'];
    var SAND = [], RS = u.rand('s04sand');
    NAMED.forEach(function (c, ci) {
      var letters = METHOD_EN[ci].replace(/ /g, '');
      for (var k = 0; k < 170; k++) {
        var lx = RS.range(-CW / 2 + 10, CW / 2 - 10), ly = RS.range(-CH / 2 + 10, CH / 2 - 10);
        var t0 = c.ts + RS.range(0, 0.1);
        var p0 = deckPt(t0, c.x + lx, c.y + ly);
        var arrive = Math.min(t0 + RS.range(0.32, 0.62), 19.45);
        var yj = joinY(arrive, p0[1], RS());
        SAND.push({ x0: p0[0], y0: p0[1], t0: t0, ta: arrive, yj: yj, jit: RS.gauss() * 2.5, vs: RS.range(380, 620), r: RS.range(0.6, 1.7), ph: RS() * 6.28,
          ch: RS() < 0.14 ? letters[k % letters.length] : null, lift: RS.range(10, 60) });
      }
    });
    ['mid', 'bot'].forEach(function (row) {
      for (var k = 0; k < 70; k++) {
        var t0 = T_RISE + RS.range(0, 0.6), p0 = deckPt(t0, RS.range(C_X - 820, C_X + 820), PLANK[row]);
        var ta2 = Math.min(t0 + RS.range(0.4, 0.7), 19.45);
        SAND.push({ x0: p0[0], y0: p0[1], t0: t0, ta: ta2, yj: joinY(ta2, p0[1], RS()), jit: RS.gauss() * 2, vs: RS.range(380, 600), r: RS.range(0.5, 1.1), ph: 0, ch: null, lift: 20 });
      }
    });
    var LSPR = {};
    (function () {
      var dprx = window.devicePixelRatio || 1, LET = 'abcdefghijklmnopqrstuvwxyz';
      for (var i = 0; i < LET.length; i++) {
        var c = document.createElement('canvas'), s = 24; c.width = c.height = Math.ceil(s * dprx);
        var gg = c.getContext('2d'); gg.scale(dprx, dprx); gg.font = 'italic 400 15px "Source Serif 4 Display"'; gg.textAlign = 'center'; gg.textBaseline = 'middle';
        gg.fillStyle = '#dff3ff'; gg.fillText(LET[i], s / 2, s / 2); LSPR[LET[i]] = c;
      }
    })();
    var T_SPARK = T_RISE + 3 * S16, T_SPARK_IN = T_LINE - 0.02;
    function sparkPos(c, t) {
      var q0 = deckPt(T_SPARK, c.x, c.y), p = eP2i(seg(t, T_SPARK, T_SPARK_IN)), tipEnd = [SX, tipY(T_SPARK_IN)];
      var cx = q0[0] + (c.off < 0 ? 40 : -40), cy = q0[1] + 260;
      return [(1 - p) * (1 - p) * q0[0] + 2 * (1 - p) * p * cx + p * p * tipEnd[0], (1 - p) * (1 - p) * q0[1] + 2 * (1 - p) * p * cy + p * p * tipEnd[1]];
    }
    function drawSand(g, t) {
      if (t <= T_RISE) return;
      var en = eN(t);
      g.globalCompositeOperation = 'lighter';
      var yt = tipY(t);
      // the stream: thin, faint while it gathers, a glowing thread from the last beat on
      var st = seg(t, T_TIP0, T_TIP0 + 0.5, eP2o), thr = seg(t, T_LINE - 0.12, T_LINE + 0.2, eP2o);
      if (st > 0) {
        var y0s = topY(t);
        var lg = g.createLinearGradient(0, y0s - 30, 0, yt);
        lg.addColorStop(0, 'rgba(190,238,230,0)'); lg.addColorStop(0.18, 'rgba(200,236,240,1)'); lg.addColorStop(1, 'rgba(230,246,255,1)');
        g.strokeStyle = lg; g.lineCap = 'round';
        var wob = (1 - thr) * 1.6;
        g.globalAlpha = (0.32 + 0.5 * thr) * st * (0.85 + 0.3 * en);
        g.lineWidth = lerp(1.6, 2.6, thr); g.beginPath(); g.moveTo(SX + wob * Math.sin(t * 9), y0s - 30); g.lineTo(SX, yt); g.stroke();
        g.globalAlpha = (0.08 + 0.12 * thr) * st; g.lineWidth = lerp(10, 16, thr); g.stroke();
        g.globalAlpha = 0.05 * thr; g.lineWidth = 44; g.stroke();
        g.globalAlpha = 1;
      }
      // grains
      for (var si = 0; si < SAND.length; si++) {
        var S = SAND[si], a3 = t - S.t0; if (a3 < 0) continue;
        var x, y, al = seg(a3, 0, 0.1);
        if (t < S.ta) {
          var q = eP2io(seg(t, S.t0, S.ta));
          var c1x = S.x0, c1y = S.y0 - S.lift, c2x = SX + (S.x0 - SX) * 0.12, c2y = S.yj - 40;
          var mq = 1 - q;
          x = mq * mq * mq * S.x0 + 3 * mq * mq * q * c1x + 3 * mq * q * q * c2x + q * q * q * (SX + S.jit);
          y = mq * mq * mq * S.y0 + 3 * mq * mq * q * c1y + 3 * mq * q * q * c2y + q * q * q * S.yj;
          x += 5 * Math.sin(S.ph + a3 * 7) * (1 - q);
        } else {
          var yy = S.yj + S.vs * (t - S.ta); if (yy >= yt) continue;
          x = SX + S.jit * (1 - seg(t, T_LINE - 0.1, T_LINE + 0.15)); y = yy; al *= 0.8;
        }
        if (S.ch) { g.globalAlpha = 0.85 * al; g.drawImage(LSPR[S.ch], x - 12, y - 12, 24, 24); g.globalAlpha = 1; }
        else glowDisc(g, x, y, S.r * 4, y > 0 && t > S.ta ? 'rgba(170,236,226,' : 'rgba(210,228,255,', 0.75 * al);
      }
      // the sparks the two cards drop: they fall into the stream and become its tip
      if (t > T_SPARK && t < T_SPARK_IN + 0.05) {
        TOPC.forEach(function (c) {
          var p = sparkPos(c, t);
          for (var k = 1; k <= 5; k++) { var pp = sparkPos(c, t - k * 0.025); glowDisc(g, pp[0], pp[1], 9 - k, 'rgba(225,238,255,', 0.35 * (1 - k / 6)); }
          glowDisc(g, p[0], p[1], 30, 'rgba(190,215,255,', 0.45); glowDisc(g, p[0], p[1], 6, 'rgba(250,252,255,', 0.95);
        });
      }
      // the tip: the dot again, 30 %, cold with a teal hint
      var tipOn = seg(t, T_SPARK_IN - 0.03, T_LINE + 0.1);
      var merge = pulse(t - T_SPARK_IN, 0.01, 0.2);
      glowDisc(g, SX, yt, 90, 'rgba(191,238,230,', (0.05 + 0.25 * merge) * Math.max(tipOn, 0.4 * st));
      glowDisc(g, SX, yt, 30, 'rgba(160,200,230,', (0.26 + 0.4 * merge) * Math.max(tipOn, 0.5 * st) * (0.85 + 0.3 * en));
      glowDisc(g, SX, yt, 11, 'rgba(230,246,255,', (0.3 + 0.5 * merge) * Math.max(tipOn, 0.4 * st));
      g.globalCompositeOperation = 'source-over';
      if (tipOn > 0) { g.globalAlpha = 0.8 * tipOn; g.fillStyle = '#8aa6c4'; g.beginPath(); g.arc(SX, yt, 4.6, 0, 6.2832); g.fill(); g.globalAlpha = 1; }
    }
  });
})();
