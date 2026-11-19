/* s04  The endless staircase (48.5306 to 71.5094 s, bars 19 to 27; tension theme, then the "breath" bars 26 and 27).
 *
 * 名场面「abandon 无限楼梯」. The ice-white zigzag that s03 folded out of the forgetting curve re-proportions into one
 * flight of an isometric Penrose staircase, and the motif dot rides the pen tip round the rest of the loop: every step
 * materialises as a stack of two word books (spines on the risers, page edges on the sides), the loop closes on bar 19
 * beat 3. The construction is a true isometric impossible loop: four flights of 5, 5, 2 and 2 steps plus four
 * landings, r = 20, tread = 120, so the plan path ends displaced by (360, 360, 360), which projects to the start.
 * In the courtyard of the loop stands one open word book on the same page, "abandon". A faceless learner climbs one
 * step a beat, one loop per two bars; every landing (beats 1 and 3) adds another stroke of a flat, deliberately
 * unlit yellow-green highlighter (#c8f04a), the lavender "熟悉感" gauge jumps a notch, "真的记得" creeps after it,
 * and an unbranded progress bar fills and clicks back to zero on bars 21 and 23.
 * Bar 22 (strong bass): a light seam slashes down the middle. The page is cloned through the seam: left 此刻, right
 * 一周后. On the right the letters leak out from under the highlighter like sand (feTurbulence + feDisplacementMap on
 * the page word only, grains on a canvas inside the page), leaving letter-shaped holes; 真的记得 falls on beat 3 and
 * lands on beat 4, 熟悉感 does not move and only shows a hairline crack; 更少 gets a chromatic kick.
 * Bar 24 (strong bass): the split closes, the staircase collapses. Eight books spin out of the wreck, turn edge-on and
 * flip (CSS 3D) into method cards that hover over a three-tier shelf and drop onto it beat by beat (中等 then 偏低; the
 * 划线 and 重读 cards carry the same flat highlighter). Two books shoot up out of frame with the motif dot and, on
 * bar 26 where the bass drops out, come back down face down into a cold volumetric light, swaying; the dot on their
 * backs is wrapped in the lavender halo of familiarity while its core stays dark, and flashes on the two ticks.
 * Bar 27 beat 3: the two cards fly up (s09 brings them back), the other eight shatter into word sand that runs down
 * into one thin stream towards the lower left, where s05 turns it into a river.
 *
 * Techniques: vector illustration (impossible staircase of books, faceless learner), UI simulation (word-book page
 * with highlighter, unbranded progress bar, two gauges with notches), split-screen comparison through a light seam,
 * liquid displacement on the page, 2.5D (CSS 3D card flips, parallax, camera push), particles (dust, word sand,
 * debris), DrawSVG shelves, chroma kick, volumetric light; every stroke, reset, drop and card landing is on the grid,
 * glow, dust and light follow ctx.util.energy(t) and the drum hits.
 *
 * HANDOFF in (cut from s03): navy #0c1428 (radial, #121c36 at 60 % 45 %), the ice-white zigzag (1120,687) up to
 * (1364,299) and the motif dot at (1364,296) at 30 %. Frame 0 here draws exactly that.
 * HANDOFF out (liquid 0.8 s, set on s05): the eight cards' glass breaks into word sand that funnels into one thin
 *   cold-teal thread at x = 984 falling straight out of the bottom edge (s05 catches it falling in from the top edge at
 *   x ~ 960); the card names, tier labels, bottom line and source stay until 22.834 s as the texts require.
 * Determinism: every canvas draw runs inside save/restore (no context state leaks between frames); verified with
 *   test.js (16 instants x 3 seek orders, byte-identical).
 */
(function () {
  'use strict';

  registerScene('s04', function build(tl, root, ctx) {
    var u = ctx.util, gsap = window.gsap, D = ctx.duration, W = 1920, H = 1080;
    var clamp = u.clamp, lerp = u.lerp;
    function E(n) { return gsap.parseEase(n); }
    var eSine = E('sine.inOut'), eP2o = E('power2.out'), eP2i = E('power2.in'), eP2io = E('power2.inOut'),
      eP3o = E('power3.out'), eP3i = E('power3.in'), eP3io = E('power3.inOut'), eP4i = E('power4.in'),
      eExpo = E('expo.out'), eBack = E('back.out(1.7)');
    function seg(t, a, b, ease) { var x = clamp((t - a) / (b - a), 0, 1); return ease ? ease(x) : x; }
    function pulse(x, rise, decay) { return x < 0 ? 0 : (1 - Math.exp(-x / rise)) * Math.exp(-x / decay); }
    function hsh(i, s) { return u.hash(i, 's04' + s); }
    function iso(fn) { return function (g, t, info) { g.save(); try { fn(g, t, info); } finally { g.restore(); } }; }
    function TX(s, a, b) { for (var i = 0; i < ctx.texts.length; i++) if (ctx.texts[i].text === s) return ctx.texts[i]; return { in: a, out: b }; }
    function rgba(hex, a) { var x = parseInt(hex.slice(1), 16); return 'rgba(' + (x >> 16) + ',' + ((x >> 8) & 255) + ',' + (x & 255) + ',' + clamp(a, 0, 1).toFixed(4) + ')'; }
    function mixHex(a, b, k) {   // '#rrggbb' in, '#rrggbb' out
      var x = parseInt(a.slice(1), 16), y = parseInt(b.slice(1), 16);
      var r = Math.round(lerp(x >> 16, y >> 16, k)), g = Math.round(lerp((x >> 8) & 255, (y >> 8) & 255, k)), bl = Math.round(lerp(x & 255, y & 255, k));
      return '#' + ((1 << 24) | (r << 16) | (g << 8) | bl).toString(16).slice(1);
    }

    // ---------------- music grid (local s) ----------------
    var BT = []; for (var bk = 0; bk < 40; bk++) BT.push(u.beat(bk));
    var SIDE_T = BT[2] - BT[0];                     // 1.277 s: one flight per half bar
    var T_GROW = BT[2];                             // 1.277 the loop closes (bar 19 beat 3)
    var T_RESET = [u.bar(2), u.bar(4)];             // 5.106 10.213 progress bar clicks to zero
    var STROKES = [BT[2], BT[4], BT[6], BT[8], BT[10]];   // a landing every two beats
    var T_SPLIT = u.bar(3), T_DROP = BT[14], T_LAND = BT[15];   // 7.660 8.936 9.574
    var T_CLOSE = BT[19], T_COL = u.bar(5);         // 12.128 12.766
    var T_HANG = u.bar(7), T_TICK = [BT[29], BT[30]], T_OUT = BT[34];   // 17.872, 18.511 19.149, 21.702
    var tx = {
      ab: TX('abandon', 0.638, 12.4), fam: TX('熟悉感', 1.277, 12.4), real: TX('真的记得', 1.277, 12.4),
      h1: TX('反复看，当下觉得记住了；', 0.638, 7.021), now: TX('此刻', 7.66, 12.4), wk: TX('一周后', 7.66, 12.4),
      h2: TX('一周后，反而记得更少。', 7.66, 12.66), src1: TX('Roediger & Karpicke, 2006', 7.66, 12.66),
      l1: TX('最常见的学习方法，反复读、划重点，', 13.404, 17.004), l2: TX('研究评估效果偏低。', 14.043, 17.043),
      hi: TX('效果高', 13.085, 22.834), mid: TX('中等', 13.085, 22.834), low: TX('偏低', 13.085, 22.834),
      l3: TX('10 种学习方法里，被评为效果最高的只有 2 种。', 17.234, 22.834), src2: TX('Dunlosky et al., 2013', 13.404, 22.834),
      card: TX('精细提问', 13.404, 22.834)
    };
    function eN(t) { return clamp((u.energy(t, 0.2) - 0.55) / 0.32, 0, 1); }

    // ---------------- the impossible staircase (isometric; plan units, projected) ----------------
    // flights of 6, 6, 2 and 2 steps, flat landings, tread = 4 risers: 0.5 * L * (6 - 2) = r * (6 + 2) closes the loop
    var PRM = ctx.params || {};
    var NF = PRM.nf || 6, NB = 2;
    var SC = 1, C30 = Math.cos(Math.PI / 6), OX = 0, OY = 0;
    var RR = PRM.r || 30, LL = 2 * RR * (NF + NB) / (NF - NB), WD = PRM.wd || 78, TH = (PRM.th || 2) * RR;
    var FIT = { x0: 1000, x1: 1850, y0: 318, y1: 905 };   // the right column; the stair is fitted into it
    function PXs(x, y) { return OX + (x - y) * C30 * SC; }
    function PYs(x, y, z) { return OY + ((x + y) * 0.5 - z) * SC; }
    var BOX = [], PTS = [], LAND_IDX = [0];
    var SIDES = [{ dx: 1, dy: 0, n: NF }, { dx: 0, dy: 1, n: NF }, { dx: -1, dy: 0, n: NB }, { dx: 0, dy: -1, n: NB }];
    function addBox(kind, cx, cy, z, axis, side, k) {
      var land = kind === 'land';
      BOX.push({ i: BOX.length, kind: kind, cx: cx, cy: cy, z: z, hx: land ? WD / 2 : (axis === 'x' ? LL / 2 : WD / 2),
        hy: land ? WD / 2 : (axis === 'x' ? WD / 2 : LL / 2), axis: axis, side: side, k: k, pt: PTS.length - 1, land: land });
    }
    PTS.push([0, 0, 0]); addBox('land', 0, 0, 0, 'y', 3, -1);
    (function () {
      var cx = 0, cy = 0, cz = 0;
      SIDES.forEach(function (s, si) {
        var x = cx + s.dx * WD / 2, y = cy + s.dy * WD / 2;
        PTS.push([x, y, cz]);
        for (var k = 0; k < s.n; k++) {
          cz += RR; PTS.push([x, y, cz]);
          x += s.dx * LL; y += s.dy * LL; PTS.push([x, y, cz]);
          addBox('step', x - s.dx * LL / 2, y - s.dy * LL / 2, cz, s.dx ? 'x' : 'y', si, k);
        }
        cx = x + s.dx * WD / 2; cy = y + s.dy * WD / 2;
        PTS.push([cx, cy, cz]); LAND_IDX.push(PTS.length - 1);
        if (si < 3) addBox('land', cx, cy, cz, si % 2 ? 'x' : 'y', si, -1);
      });
    })();
    // fit: projected bounding box of every box at SC 1, then scale and centre it in the right column
    (function () {
      var x0 = 1e9, x1 = -1e9, y0 = 1e9, y1 = -1e9;
      BOX.forEach(function (b) {
        [[-1, -1], [1, -1], [1, 1], [-1, 1]].forEach(function (c) {
          var x = b.cx + c[0] * b.hx, y = b.cy + c[1] * b.hy;
          [b.z, b.z - TH].forEach(function (z) { var px = PXs(x, y), py = PYs(x, y, z); x0 = Math.min(x0, px); x1 = Math.max(x1, px); y0 = Math.min(y0, py); y1 = Math.max(y1, py); });
        });
      });
      SC = Math.min(PRM.sc || 0.86, (FIT.x1 - FIT.x0) / (x1 - x0), (FIT.y1 - FIT.y0) / (y1 - y0));
      OX = (FIT.x0 + FIT.x1) / 2 - SC * (x0 + x1) / 2; OY = (FIT.y0 + FIT.y1) / 2 - SC * (y0 + y1) / 2;
    })();
    // screen polyline of the walking line, arclength
    var SP = PTS.map(function (p) { return [PXs(p[0], p[1]), PYs(p[0], p[1], p[2])]; });
    var SL = [0];
    for (var pi = 1; pi < SP.length; pi++) SL.push(SL[pi - 1] + Math.hypot(SP[pi][0] - SP[pi - 1][0], SP[pi][1] - SP[pi - 1][1]));
    var IA = LAND_IDX[3], IH = LAND_IDX[4];          // Lc centre .. T' centre = flight 4 (the s03 zigzag)
    var S_PEN = SL[IA];                              // the pen draws T -> R -> B -> Lc
    BOX.forEach(function (b) {
      b.depth = b.cx + b.cy + b.z - TH / 2;
      b.sl = b.land ? SL[b.pt] : (SL[b.pt - 1] + SL[b.pt]) / 2;
      b.scx = PXs(b.cx, b.cy); b.scy = PYs(b.cx, b.cy, b.z - TH / 2);
    });
    var ORDER = BOX.slice().sort(function (a, b) { return a.depth - b.depth; });

    // the s03 zigzag and how it maps onto flight 4
    var ZV = [[1120, 687], [1120, 625], [1181, 590], [1181, 528], [1242, 493], [1242, 431], [1303, 396], [1303, 334], [1364, 299]];
    var ZMAP = [IA, IA, IA + 1, IA + 2, IA + 3, IA + 4, IA + 5, IA + 5, IA + 6];
    var T_MORPH = 0.55;
    function morphK(t) { return eP3io(seg(t, 0, T_MORPH)); }
    function penS(t) { return S_PEN * E('power2.inOut')(seg(t, T_MORPH, T_GROW)); }
    function zigPts(t) { var m = morphK(t); return ZV.map(function (v, j) { return [lerp(v[0], SP[ZMAP[j]][0], m), lerp(v[1], SP[ZMAP[j]][1], m)]; }); }
    function atSL(s) {
      if (s <= 0) return [SP[0][0], SP[0][1]];
      var lo = 0, hi = SL.length - 1;
      while (hi - lo > 1) { var m = (lo + hi) >> 1; if (SL[m] <= s) lo = m; else hi = m; }
      var f = (s - SL[lo]) / Math.max(1e-6, SL[lo + 1] - SL[lo]);
      return [lerp(SP[lo][0], SP[lo + 1][0], f), lerp(SP[lo][1], SP[lo + 1][1], f)];
    }
    // when the pen passes each box: it materialises
    function tOfPen(s) { var lo = T_MORPH, hi = T_GROW; for (var i = 0; i < 40; i++) { var m = (lo + hi) / 2; if (penS(m) < s) lo = m; else hi = m; } return (lo + hi) / 2; }
    BOX.forEach(function (b) {
      if (b.side === 3 || b.i === 0 || (b.land && b.side === 2)) b.tIn = 0.36 + 0.05 * (b.side === 3 ? b.k + 1 : b.i === 0 ? 3 : 0);
      else b.tIn = tOfPen(Math.min(b.sl, S_PEN - 1)) - 0.06;
    });

    // per-box book colours (cold, muted); three-tone iso shading: top light, left side mid, right side dark
    var SPINES = ['#3d5f9a', '#47609a', '#33568a', '#55599a', '#2f6a84', '#4d66a0', '#665a96', '#3a4f86', '#40709e', '#4c5590'];
    function shade(c, f) { return mixHex(c, '#05080f', 1 - f); }
    BOX.forEach(function (b, i) {
      var c1 = SPINES[Math.floor(hsh(i, 'c1') * SPINES.length)], c2 = SPINES[Math.floor(hsh(i, 'c2') * SPINES.length)];
      if (c2 === c1) c2 = SPINES[(SPINES.indexOf(c1) + 3) % SPINES.length];
      var p1 = mixHex('#9aa8c4', '#b4c0d8', hsh(i, 'p1')), p2 = mixHex('#8896b4', '#a2b0cc', hsh(i, 'p2'));
      var xSpine = b.axis === 'x';
      b.fx = { a: xSpine ? shade(c1, 0.74) : shade(p1, 0.66), b: xSpine ? shade(c2, 0.66) : shade(p2, 0.6), spine: xSpine, ca: shade(c1, 0.6), cb: shade(c2, 0.55) };
      b.fy = { a: !xSpine ? shade(c1, 0.92) : shade(p1, 0.82), b: !xSpine ? shade(c2, 0.84) : shade(p2, 0.76), spine: !xSpine, ca: shade(c1, 0.8), cb: shade(c2, 0.72) };
      b.top0 = b.land ? '#5b6f9c' : mixHex(c1, '#e6eefc', 0.22); b.top1 = b.land ? '#4a5d8a' : mixHex(c1, '#0c1428', 0.12);
      b.lab = hsh(i, 'lab');
    });

    // ---------------- camera (pure function of t) ----------------
    var camN = u.makeNoise('s04cam');
    var CEN_DX = 0, CEN_DY = 0;   // set once the stair is fitted: the move that centres it in the frame
    function camAt(t) {
      var a = eSine(seg(t, 0.4, T_SPLIT)), back = eP3io(seg(t, T_SPLIT - 0.5, T_SPLIT + 0.7)), ret = eP3io(seg(t, T_CLOSE + 0.12, T_COL - 0.06));
      var z = 1 + 0.035 * a - 0.07 * back * (1 - ret) - 0.035 * a * ret + 0.07 * ret;
      var x = -16 * a * (1 - ret) + CEN_DX * ret, y = -8 * a * (1 - ret) + CEN_DY * ret;
      z += 0.004 * u.barPulse(Math.max(0, t), 0.3) * (1 - back) * (1 - ret) * seg(t, 1.0, 1.4);
      var sh = t >= T_COL ? 8 * Math.exp(-(t - T_COL) / 0.18) : 0;
      return { z: z, x: x + sh * camN.noise2(t * 17, 0.3), y: y + sh * camN.noise2(0.7, t * 17) };
    }
    function camPt(t, x, y) { var c = camAt(t); return [CAM_O[0] + (x - CAM_O[0]) * c.z + c.x, CAM_O[1] + (y - CAM_O[1]) * c.z + c.y]; }
    function camInv(t, X, Y) { var c = camAt(t); return [CAM_O[0] + (X - c.x - CAM_O[0]) / c.z, CAM_O[1] + (Y - c.y - CAM_O[1]) / c.z]; }
    var CAM_O = [(FIT.x0 + FIT.x1) / 2, (FIT.y0 + FIT.y1) / 2];
    CEN_DX = 960 - CAM_O[0]; CEN_DY = 560 - CAM_O[1];
    function camCss(c) { return 'translate(' + c.x.toFixed(2) + 'px,' + c.y.toFixed(2) + 'px) scale(' + c.z.toFixed(5) + ')'; }
    function worldAlpha(t) { return 1 - 0.87 * eP2io(seg(t, T_SPLIT - 0.55, T_SPLIT + 0.3)) * (1 - eP2io(seg(t, T_CLOSE + 0.1, T_CLOSE + 0.5))); }

    // ---------------- layers ----------------
    var bg = u.el('div', { cls: 'fill', parent: root, style: { background: 'radial-gradient(ellipse 75% 70% at 60% 45%, #121c36 0%, #0c1428 60%, #0a1122 100%)' } });
    var rightTint = u.el('div', { cls: 'abs', parent: root, style: { left: '960px', top: '0px', width: '960px', height: '1080px', opacity: 0, zIndex: 4,
      background: 'linear-gradient(90deg, rgba(3,6,14,0.62) 0%, rgba(4,8,18,0.42) 40%, rgba(4,8,18,0.34) 100%)' } });
    var backCv = u.canvas(root, iso(function (g, t) { drawBack(g, t); }));
    var rays = u.rays(root, { x: 960, y: -170, direction: 180, color: '#dfe9ff', count: 9, spread: 30, length: 1150, opacity: 0, blur: 12, sway: 2, seed: 4 });
    var world = u.el('div', { cls: 'fill', parent: root, style: { transformOrigin: CAM_O[0] + 'px ' + CAM_O[1] + 'px', zIndex: 1 } });
    var stairCv = u.canvas(world, iso(function (g, t) { drawStairs(g, t); }));
    var learnCv = u.canvas(root, iso(function (g, t) { drawLearner(g, t); }));
    learnCv.canvas.style.transformOrigin = CAM_O[0] + 'px ' + CAM_O[1] + 'px'; learnCv.canvas.style.zIndex = 2;
    var bookCam = u.el('div', { cls: 'fill', parent: root, style: { transformOrigin: CAM_O[0] + 'px ' + CAM_O[1] + 'px', zIndex: 3 } });
    var rightBox = u.el('div', { cls: 'fill', parent: root, style: { zIndex: 5, clipPath: 'inset(0px 0px 0px 960px)' } });
    var seam = u.el('div', { cls: 'abs', parent: root, style: { left: '958px', top: '226px', width: '4px', height: '854px', zIndex: 6, transformOrigin: '50% 0%',
      background: 'linear-gradient(180deg, rgba(240,247,255,0) 0%, #f2f7ff 5%, #f2f7ff 90%, rgba(240,247,255,0) 100%)',
      boxShadow: '0 0 14px rgba(207,230,255,0.9), 0 0 44px rgba(127,166,224,0.65), 0 0 120px rgba(127,166,224,0.35)' } });
    var hud = u.el('div', { cls: 'fill', parent: root, style: { zIndex: 7 } });
    var coneCv = u.canvas(root, iso(function (g, t) { drawCone(g, t); }));
    coneCv.canvas.style.zIndex = 7;
    var deck = u.el('div', { cls: 'fill', parent: root, style: { zIndex: 8, perspective: '1500px', perspectiveOrigin: '960px 480px' } });
    var sandCv = u.canvas(root, iso(function (g, t) { drawSand(g, t); }));
    sandCv.canvas.style.zIndex = 7;
    var fxCv = u.canvas(root, iso(function (g, t) { drawFx(g, t); }));
    fxCv.canvas.style.zIndex = 9;
    gsap.set(seam, { scaleY: 0, opacity: 0 });

    // ---------------- dust and bokeh (energy driven) ----------------
    var dust = u.particles(backCv.canvas.parentNode, { count: 150, seed: 's04dust', colors: ['#a9c8ff', '#dfe9ff', '#7fa6e0'], size: [0.7, 2.0], speed: [5, 16], angle: -84, spread: 30, twinkle: 0.6, energy: 0.7 });
    dust.canvas.style.zIndex = 0;
    var bokeh = u.particles(root, { count: 16, seed: 's04bok', colors: ['#7fa6e0', '#9b8cff'], size: [9, 22], speed: [3, 8], angle: -70, soft: true, energy: 0.5 });
    bokeh.canvas.style.zIndex = 2;
    tl.fromTo(dust.state, { opacity: 0 }, { opacity: 1, duration: 1.6, ease: 'sine.inOut' }, 0.15);
    tl.fromTo(bokeh.state, { opacity: 0 }, { opacity: 0.55, duration: 1.6, ease: 'sine.out' }, 0.3);
    tl.to(bokeh.state, { opacity: 0.2, duration: 0.6 }, T_SPLIT);
    tl.to(bokeh.state, { opacity: 0.45, duration: 0.8 }, T_CLOSE);
    tl.to([dust.state, bokeh.state], { opacity: 0, duration: 0.6, ease: 'power2.in' }, D - 0.75);

    // ---------------- the word book (DOM, so the word is real text) ----------------
    var BW = 480, BH = 250;
    var WORD_FONT = 'italic 400 56px "Source Serif 4 Display"';
    var mctx = document.createElement('canvas').getContext('2d');
    mctx.font = WORD_FONT; var WORD_W = mctx.measureText('abandon').width;
    var PAGE_W = (BW - 24) / 2;
    var HL = [   // highlighter strokes: thicker and wider each pass ("越涂越厚")
      { w: 0, h: 30, y: 6, r: -1.6 }, { w: 10, h: 38, y: 2, r: 0.9 }, { w: 18, h: 46, y: 4, r: -0.7 }, { w: 26, h: 56, y: 1, r: 1.3 }, { w: 34, h: 66, y: 3, r: -0.4 }
    ];
    function makeBook(parent, cx, cy, full, id) {
      var b = u.el('div', { cls: 'abs', parent: parent, style: { left: (cx - BW / 2) + 'px', top: (cy - BH / 2) + 'px', width: BW + 'px', height: BH + 'px' } });
      u.el('div', { cls: 'abs', parent: b, style: { left: '-14px', top: '-10px', width: (BW + 28) + 'px', height: (BH + 26) + 'px', borderRadius: '12px',
        background: 'linear-gradient(170deg, #22345c 0%, #16233f 100%)', border: '2px solid rgba(160,185,235,0.35)',
        boxShadow: '0 30px 70px rgba(0,0,0,0.6), 0 0 60px rgba(127,166,224,0.12)' } });
      var pages = [];
      for (var p = 0; p < 2; p++) {
        var pg = u.el('div', { cls: 'abs', parent: b, style: { left: (p ? BW / 2 + 1 : 11) + 'px', top: '4px', width: PAGE_W + 'px', height: (BH - 8) + 'px', overflow: 'hidden',
          borderRadius: p ? '2px 8px 8px 2px' : '8px 2px 2px 8px',
          background: p ? 'linear-gradient(90deg, #aeb8cb 0%, #d3dbe8 9%, #dbe2ee 70%, #cdd5e3 100%)' : 'linear-gradient(90deg, #cdd5e3 0%, #dbe2ee 30%, #d3dbe8 91%, #aeb8cb 100%)' } });
        pages.push(pg);
      }
      // left page: entry lines (grey bars) under a faint running head
      var lp = pages[0];
      for (var li = 0; li < 7; li++) u.el('div', { cls: 'abs', parent: lp, style: { left: '24px', top: (34 + li * 28) + 'px', height: '7px', borderRadius: '4px',
        width: (li % 3 === 0 ? 92 : 150 + 40 * hsh(li, 'lp' + id)) + 'px', background: li % 3 === 0 ? 'rgba(30,42,70,0.45)' : 'rgba(40,52,80,0.2)' } });
      // right page: the headword with highlighter strokes under it, then definition bars
      var rp = pages[1];
      var wordTop = 54;
      var hls = HL.map(function (s, i) {
        var w = WORD_W + 26 + s.w, h = s.h;
        return u.el('div', { cls: 'abs', parent: rp, style: { left: ((PAGE_W - w) / 2 + (i % 2 ? 3 : -3)) + 'px', top: (wordTop + 44 - h / 2 + s.y) + 'px', width: w + 'px', height: h + 'px',
          background: '#c8f04a', opacity: 0.5, borderRadius: '9px 15px 11px 17px / 13px 9px 15px 11px', transform: 'rotate(' + s.r + 'deg)',
          clipPath: full ? 'inset(0% 0% 0% 0%)' : 'inset(0% 100% 0% 0%)' } });
      });
      var word = u.el('div', { cls: 'abs', parent: rp, text: 'abandon', style: { left: '0px', top: wordTop + 'px', width: PAGE_W + 'px', textAlign: 'center',
        font: WORD_FONT, lineHeight: '84px', color: '#121a2e', letterSpacing: '0.005em' } });
      for (var di = 0; di < 4; di++) u.el('div', { cls: 'abs', parent: rp, style: { left: '24px', top: (156 + di * 22) + 'px', height: '6px', borderRadius: '3px',
        width: (di === 0 ? 70 : 120 + 60 * hsh(di, 'rp' + id)) + 'px', background: di === 0 ? 'rgba(30,42,70,0.4)' : 'rgba(40,52,80,0.18)' } });
      // gutter shadow
      u.el('div', { cls: 'abs', parent: b, style: { left: (BW / 2 - 18) + 'px', top: '4px', width: '36px', height: (BH - 8) + 'px',
        background: 'linear-gradient(90deg, rgba(10,16,32,0) 0%, rgba(10,16,32,0.32) 48%, rgba(10,16,32,0.38) 50%, rgba(10,16,32,0.32) 52%, rgba(10,16,32,0) 100%)' } });
      return { el: b, word: word, hls: hls, page: rp };
    }

    // book A lives in the courtyard of the loop (camera follows), then moves into the left half
    var BOOK_C = [668, 610];
    var bookA = makeBook(bookCam, BOOK_C[0], BOOK_C[1], false, 'a');
    var bookB = makeBook(rightBox, 960, 610, true, 'b');
    bookB.el.style.filter = 'saturate(0.72) brightness(0.9)';   // a week later: the same page, colder
    gsap.set(bookA.el, { opacity: 0 }); gsap.set(bookA.word, { opacity: 0 });
    tl.fromTo(bookA.el, { opacity: 0, y: 26 }, { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out' }, 0.42);
    tl.fromTo(bookA.word, { opacity: 0 }, { opacity: 1, duration: 0.35, ease: 'power2.out' }, tx.ab.in);
    STROKES.forEach(function (ts, i) {
      tl.fromTo(bookA.hls[i], { clipPath: 'inset(0% 100% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.3, ease: 'power2.out', immediateRender: false }, ts);
    });
    // split: lift to the seam, clone, left copy goes left
    tl.to(bookA.el, { scale: 0.94, opacity: 0, duration: tx.ab.out - T_CLOSE, ease: 'power2.in' }, T_CLOSE);
    gsap.set(bookB.el, { opacity: 0 });
    tl.fromTo(bookB.el, { opacity: 0 }, { opacity: 1, duration: 0.12, ease: 'power1.out', immediateRender: false }, T_SPLIT);
    tl.fromTo(bookB.el, { x: -BW / 2 - 30 }, { x: BOOK_C[0] + 960 - 960, duration: 0.62, ease: 'expo.out', immediateRender: false }, T_SPLIT);
    tl.to(bookB.el, { x: -BW / 2 - 30, duration: 0.22, ease: 'power3.in' }, T_CLOSE);
    tl.to(bookB.el, { opacity: 0, duration: 0.18, ease: 'power2.in' }, T_CLOSE + 0.02);

    // right page: the letters leak away (liquid on the word, grains on a canvas in the page), holes stay
    var holes = u.el('div', { cls: 'abs', parent: bookB.page, text: 'abandon', attrs: { 'data-qa': 'off' }, style: { left: '0px', top: bookB.word.style.top, width: PAGE_W + 'px', textAlign: 'center',
      font: WORD_FONT, lineHeight: '84px', color: 'transparent', WebkitTextStroke: '1.3px rgba(24,34,58,0.55)', letterSpacing: '0.005em', opacity: 0 } });
    bookB.page.insertBefore(holes, bookB.word);
    var bChars = u.splitChars(bookB.word);
    var liq = u.liquid(bookB.word, { scale: 26, freq: 0.035, octaves: 2, seed: 11, drift: 30, speed: 0.6 });
    var T_LEAK0 = T_SPLIT + 0.45, LEAK_EACH = 0.11;
    bChars.forEach(function (c, i) {
      var t0 = T_LEAK0 + i * LEAK_EACH + 0.03 * hsh(i, 'lk');
      tl.to(c, { opacity: 0, y: 14, duration: 0.55, ease: 'power2.in' }, t0);
    });
    tl.fromTo(liq.state, { amount: 0 }, { amount: 1, duration: 0.5, ease: 'power2.in', immediateRender: false }, T_LEAK0 - 0.1);
    tl.to(liq.state, { amount: 0, duration: 0.3 }, T_LEAK0 + 7 * LEAK_EACH + 0.5);
    tl.fromTo(holes, { opacity: 0 }, { opacity: 1, duration: 0.9, ease: 'power2.out', immediateRender: false }, T_LEAK0 + 0.2);
    // sand grains, drawn in page space
    var sandPts = u.textPoints('abandon', { font: WORD_FONT, step: 2, seed: 3, max: 900 });
    mctx.font = WORD_FONT;
    var LB = [], acc = 0; 'abandon'.split('').forEach(function (ch) { var w = mctx.measureText(ch).width; LB.push(acc + w); acc += w; });
    var GRAINS = sandPts.map(function (p, i) {
      var lx = p.x - (W / 2 - WORD_W / 2), li = 0; while (li < 6 && lx > LB[li]) li++;
      return { x: p.x - W / 2 + PAGE_W / 2, y: p.y - H / 2 + 54 + 42, t0: T_LEAK0 + li * LEAK_EACH + 0.05 + 0.4 * hsh(i, 'g0'), vx: (hsh(i, 'gx') - 0.5) * 16,
        vy: 12 + 30 * hsh(i, 'gy'), life: 0.8 + 0.6 * hsh(i, 'gl'), r: 0.6 + 0.8 * hsh(i, 'gr') };
    });
    var grainCv = u.canvas(bookB.page, iso(function (g, t) {
      for (var i = 0; i < GRAINS.length; i++) {
        var q = GRAINS[i], a = t - q.t0; if (a < 0 || a > q.life) continue;
        var k = a / q.life;
        g.globalAlpha = 0.85 * (1 - k * k);
        g.fillStyle = '#1d2840';
        g.beginPath(); g.arc(q.x + q.vx * a, q.y + q.vy * a + 140 * a * a, q.r, 0, 6.2832); g.fill();
      }
    }), { width: PAGE_W, height: BH - 8 });

    // ---------------- gauges ----------------
    var GY0 = 400, GHT = 420;
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
      for (var n = 1; n < 10; n++) u.el('div', { cls: 'abs', parent: wrap, style: { left: '88px', top: (GHT - n * GHT / 10) + 'px', width: n % 5 ? '8px' : '14px', height: '2px', background: 'rgba(190,205,240,0.28)' } });
      var lab = u.text(parent, label, 'small', { x: x, y: GY0 + GHT + 44, style: { fontSize: '44px', fontWeight: 700, letterSpacing: '0.04em', color: fam ? '#cfc6ff' : '#b9cff2' } });
      return { wrap: wrap, fill: fill, men: men, lab: lab, tube: tube };
    }
    function setLevel(gg, v) {
      v = clamp(v, 0, 1);
      var hIn = GHT - 16, top = (1 - v) * hIn;
      gg.fill.style.clipPath = 'inset(' + top.toFixed(2) + 'px 0px 0px 0px round 32px)';
      gg.men.style.top = (6 + top - 1.5).toFixed(2) + 'px';
      gg.men.style.opacity = v > 0.02 ? '1' : '0';
    }
    var GX = [112, 292];
    var gA = [makeGauge(hud, GX[0], '熟悉感', 'fam'), makeGauge(hud, GX[1], '真的记得', 'real')];
    var gB = [makeGauge(rightBox, GX[0] + 960, '熟悉感', 'fam'), makeGauge(rightBox, GX[1] + 960, '真的记得', 'real')];
    function famLv(t) { var v = 0.1; STROKES.forEach(function (s) { v += 0.164 * eBack(seg(t, s, s + 0.16)); }); return v; }
    function realLv(t) { var v = 0.1; STROKES.forEach(function (s) { v += 0.12 * eSine(seg(t, s + 0.15, s + 0.85)); }); return v; }
    var REAL_HI = realLv(T_SPLIT), REAL_LO = 0.15;
    function realB(t) {
      if (t < T_DROP) return REAL_HI;
      if (t < T_LAND) return lerp(REAL_HI, REAL_LO, eP4i(seg(t, T_DROP, T_LAND)));
      var a = t - T_LAND; return REAL_LO + 0.07 * Math.abs(Math.sin(a * 13)) * Math.exp(-a / 0.12);
    }
    // crack on the right 熟悉感 tube
    var crackSvg = u.svgEl('svg', { width: 80, height: GHT, viewBox: '0 0 80 ' + GHT, style: 'position:absolute;left:0;top:0;overflow:visible' }, gB[0].wrap);
    var crackD = 'M58,' + (GHT * 0.05) + ' L44,' + (GHT * 0.16) + ' L53,' + (GHT * 0.24) + ' L36,' + (GHT * 0.37) + ' L47,' + (GHT * 0.45) + ' L30,' + (GHT * 0.58) + ' L41,' + (GHT * 0.66) + ' L27,' + (GHT * 0.78);
    var crack = u.svgEl('path', { d: crackD, fill: 'none', stroke: '#f4f1ff', 'stroke-width': 1.6, 'stroke-linejoin': 'round', opacity: 0 }, crackSvg);
    tl.fromTo(crack, { drawSVG: '0%', opacity: 1 }, { drawSVG: '100%', duration: 0.14, ease: 'power2.out', immediateRender: false }, T_LAND);
    tl.to(crack, { opacity: 0.55, duration: 0.5 }, T_LAND + 0.2);
    // appear / leave
    gA.forEach(function (gg, i) {
      gsap.set([gg.wrap, gg.lab], { opacity: 0 });
      tl.fromTo(gg.wrap, { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' }, tx.fam.in - 0.2 + 0.08 * i);
      tl.fromTo(gg.lab, { opacity: 0 }, { opacity: 1, duration: 0.4, ease: 'power2.out' }, tx.fam.in + 0.08 * i);
      tl.to([gg.wrap, gg.lab], { opacity: 0, duration: 0.3, ease: 'power2.in' }, tx.fam.out - 0.3);
    });
    gB.forEach(function (gg) {
      gsap.set([gg.wrap, gg.lab], { opacity: 0 });
      tl.fromTo([gg.wrap, gg.lab], { opacity: 0 }, { opacity: 1, duration: 0.12, ease: 'power1.out', immediateRender: false }, T_SPLIT);
      tl.fromTo([gg.wrap, gg.lab], { x: -(GX[1] + 120) }, { x: 0, duration: 0.62, ease: 'expo.out', immediateRender: false }, T_SPLIT);
      tl.to([gg.wrap, gg.lab], { x: -(GX[1] + 120), duration: 0.22, ease: 'power3.in' }, T_CLOSE);
      tl.to([gg.wrap, gg.lab], { opacity: 0, duration: 0.18, ease: 'power2.in' }, T_CLOSE + 0.02);
    });

    // ---------------- progress bar ----------------
    var BAR_Y = 236;
    var bar = u.el('div', { cls: 'abs', parent: hud, style: { left: '360px', top: (BAR_Y - 8) + 'px', width: '1200px', height: '16px', borderRadius: '8px',
      background: 'rgba(160,185,235,0.13)', border: '1px solid rgba(190,210,245,0.18)', overflow: 'visible' } });
    var barFill = u.el('div', { cls: 'abs', parent: bar, style: { left: '0px', top: '0px', width: '100%', height: '100%', borderRadius: '8px',
      background: 'linear-gradient(90deg, #6d8fcf 0%, #a9c8ff 70%, #eef5ff 100%)' } });
    var barFlash = u.el('div', { cls: 'abs', parent: bar, style: { left: '-6px', top: '-6px', right: '-6px', bottom: '-6px', borderRadius: '12px', background: '#f2f7ff',
      boxShadow: '0 0 24px #cfe6ff', opacity: 0 } });
    gsap.set(bar, { opacity: 0 });
    tl.fromTo(bar, { opacity: 0 }, { opacity: 1, duration: 0.5, ease: 'power2.out' }, BT[1]);
    tl.to(bar, { left: 120, width: 720, duration: 0.62, ease: 'expo.out' }, T_SPLIT);
    tl.to(bar, { opacity: 0, duration: 0.3, ease: 'power2.in' }, tx.now.out - 0.3);
    function barProg(t) { var tt = Math.max(0, t); var f = (tt % (4 * SIDE_T)) / (4 * SIDE_T); return f; }

    // ---------------- headline 1, headline 2, labels, source ----------------
    var h1 = u.text(hud, '', 'headline', { x: 960, y: 130, html: '反复看，当下<span style="color:#c9bfff;text-shadow:0 0 22px rgba(155,140,255,0.55)">觉得</span>记住了；',
      style: { color: '#e6eefc', textShadow: '0 0 26px rgba(127,166,224,0.25)' } });
    var h1c = u.splitChars(h1);
    gsap.set(h1c, { opacity: 0 });
    tl.fromTo(h1c, { opacity: 0, y: 56, filter: 'blur(10px)' }, { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.8, ease: 'power4.out', stagger: 0.04 }, tx.h1.in);
    tl.to(h1c, { opacity: 0, y: -34, filter: 'blur(8px)', duration: 0.3, ease: 'power2.in', stagger: 0.012 }, tx.h1.out - 0.2);

    var h2 = u.text(hud, '', 'headline', { x: 960, y: 130, html: '一周后，反而记得<span class="less" style="color:#ffffff">更少</span>。',
      style: { color: '#e6eefc', textShadow: '0 0 26px rgba(127,166,224,0.25)' } });
    var lessEl = h2.querySelector('.less');
    var h2c = u.splitChars(h2);
    var lessChroma = u.chroma(lessEl, { amount: 0 });
    gsap.set(h2c, { opacity: 0 });
    tl.fromTo(h2c, { opacity: 0, y: 56, filter: 'blur(10px)' }, { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.75, ease: 'power4.out', stagger: 0.04 }, tx.h2.in);
    tl.fromTo(lessChroma.state, { amount: 0 }, { keyframes: [{ amount: 9, duration: 0.05 }, { amount: 3, duration: 0.08 }, { amount: 7, duration: 0.05 }, { amount: 0, duration: 0.4, ease: 'power2.out' }], immediateRender: false }, T_LAND);
    tl.to(h2c, { opacity: 0, y: 40, filter: 'blur(8px)', duration: 0.3, ease: 'power2.in', stagger: 0.01 }, tx.h2.out - 0.22);

    var labNow = u.text(hud, '此刻', 'small', { x: 480, y: 318, style: { fontSize: '52px', fontWeight: 700, letterSpacing: '0.3em', color: '#e6eefc', textShadow: '0 0 18px rgba(169,200,255,0.45)' } });
    var labWk = u.text(rightBox, '一周后', 'small', { x: 1440, y: 318, style: { fontSize: '52px', fontWeight: 700, letterSpacing: '0.3em', color: '#aebbd6' } });
    gsap.set([labNow, labWk], { opacity: 0 });
    tl.fromTo(labNow, { opacity: 0, x: 40 }, { opacity: 1, x: 0, duration: 0.5, ease: 'power3.out' }, tx.now.in);
    tl.fromTo(labWk, { opacity: 0, x: -40 }, { opacity: 1, x: 0, duration: 0.5, ease: 'power3.out' }, tx.wk.in);
    tl.to([labNow, labWk], { opacity: 0, duration: 0.3, ease: 'power2.in' }, tx.now.out - 0.3);

    var src1 = u.text(hud, 'Roediger & Karpicke, 2006', 'source', { x: 1860, y: 1040, anchor: 'bottom-right', style: { color: '#93a4c4' } });
    gsap.set(src1, { opacity: 0 });
    tl.fromTo(src1, { opacity: 0 }, { opacity: 0.7, duration: 0.6, ease: 'power2.out' }, tx.src1.in);
    tl.to(src1, { opacity: 0, duration: 0.3, ease: 'power2.in' }, tx.src1.out - 0.3);

    // seam and right-half tint
    tl.set(seam, { opacity: 1 }, T_SPLIT - 0.01);
    tl.fromTo(seam, { scaleY: 0 }, { scaleY: 1, duration: 0.5, ease: 'expo.out', immediateRender: false }, T_SPLIT);
    tl.to(seam, { scaleY: 0, transformOrigin: '50% 100%', duration: 0.4, ease: 'power3.in' }, T_CLOSE);
    tl.set(seam, { opacity: 0 }, T_CLOSE + 0.41);
    tl.fromTo(rightTint, { opacity: 0 }, { opacity: 1, duration: 0.6, ease: 'power2.out', immediateRender: false }, T_SPLIT);
    tl.to(rightTint, { opacity: 0, duration: 0.4 }, T_CLOSE);

    // ---------------- shelves, cards, texts of the second half ----------------
    var ROWS = { top: 318, mid: 560, bot: 802 }, CW = 300, CH = 160;
    var PLANK = { top: ROWS.top + CH / 2 + 4, mid: ROWS.mid + CH / 2 + 4, bot: ROWS.bot + CH / 2 + 4 };
    var shelfSvg = u.svg(deck); shelfSvg.style.zIndex = 0;
    var planks = [['top', '#dfe9ff', 0.55], ['mid', '#a9bde6', 0.42], ['bot', '#7f8daa', 0.34]].map(function (p) {
      var y = PLANK[p[0]];
      var gl = u.path(shelfSvg, 'M210,' + y + ' L1730,' + y, { stroke: p[1], 'stroke-width': 9, opacity: p[2] * 0.22 });
      var ln = u.path(shelfSvg, 'M210,' + y + ' L1730,' + y, { stroke: p[1], 'stroke-width': 2, opacity: p[2] + 0.2 });
      return [gl, ln];
    });
    planks.forEach(function (pp, i) {
      tl.fromTo(pp, { drawSVG: '0%' }, { drawSVG: '100%', duration: 0.75, ease: 'power3.out' }, tx.hi.in + 0.06 * i);
      tl.to(pp, { opacity: 0, duration: 0.4, ease: 'power2.in' }, T_OUT + 0.05 * i);
    });
    var tierLab = [['效果高', ROWS.top, '#e6eefc', tx.hi], ['中等', ROWS.mid, '#b6c4de', tx.mid], ['偏低', ROWS.bot, '#8a97b0', tx.low]].map(function (q, i) {
      var e = u.text(deck, q[0], 'small', { x: 104, y: q[1] + 40, style: { fontSize: '44px', fontWeight: 700, letterSpacing: '0.06em', color: q[2] } });
      gsap.set(e, { opacity: 0 });
      tl.fromTo(e, { opacity: 0, x: -30 }, { opacity: 1, x: 0, duration: 0.5, ease: 'power3.out' }, q[3].in + 0.08 * i);
      tl.to(e, { opacity: 0, duration: 0.28, ease: 'power2.in' }, q[3].out - 0.28);
      return e;
    });

    var CARDS = [
      { name: '精细提问', row: 'mid', x: 640, t: BT[21] }, { name: '自我解释', row: 'mid', x: 960, t: BT[22] }, { name: '交错练习', row: 'mid', x: 1280, t: BT[23] },
      { name: '总结', row: 'bot', x: 320, t: BT[24] }, { name: '划线', row: 'bot', x: 640, t: BT[26], hl: true }, { name: '关键词记忆法', row: 'bot', x: 960, t: u.beat(24.5) },
      { name: '文本意象法', row: 'bot', x: 1280, t: BT[25] }, { name: '重读', row: 'bot', x: 1600, t: BT[27], hl: true, dust: true },
      { name: '', row: 'top', x: 800, back: true }, { name: '', row: 'top', x: 1120, back: true }
    ];
    var HOVER = 54;
    CARDS.forEach(function (c, i) {
      c.y = ROWS[c.row];
      var w = u.el('div', { cls: 'abs', parent: deck, style: { left: (c.x - CW / 2) + 'px', top: (c.y - CH / 2) + 'px', width: CW + 'px', height: CH + 'px', transformStyle: 'preserve-3d' } });
      var inner = u.el('div', { cls: 'abs', parent: w, style: { left: '0px', top: '0px', width: CW + 'px', height: CH + 'px', transformStyle: 'preserve-3d' } });
      var low = c.row === 'bot';
      var face = u.el('div', { cls: 'abs', parent: inner, style: { left: '0px', top: '0px', width: CW + 'px', height: CH + 'px' } });
      var glass = u.el('div', { cls: 'abs', parent: face, style: { left: '0px', top: '0px', width: CW + 'px', height: CH + 'px', borderRadius: '18px',
        background: c.back ? 'linear-gradient(160deg, #18223e 0%, #0b1224 100%)' : low ? 'linear-gradient(160deg, rgba(92,100,120,0.5) 0%, rgba(32,38,52,0.82) 100%)' : 'linear-gradient(160deg, rgba(74,104,170,0.55) 0%, rgba(18,30,62,0.85) 100%)',
        border: '1.5px solid ' + (c.back ? 'rgba(170,190,240,0.32)' : low ? 'rgba(170,180,200,0.22)' : 'rgba(190,212,255,0.4)'),
        boxShadow: '0 22px 46px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,' + (low ? 0.08 : 0.2) + ')' } });
      c.w = w; c.inner = inner; c.face = face; c.glass = glass;
      if (c.back) {
        u.el('div', { cls: 'abs', parent: face, style: { left: '10px', top: '10px', right: '10px', bottom: '10px', borderRadius: '11px', border: '1px solid rgba(160,180,230,0.16)' } });
        c.halo = u.el('div', { cls: 'abs', parent: face, style: { left: (CW / 2 - 70) + 'px', top: (CH / 2 - 70) + 'px', width: '140px', height: '140px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(155,140,255,0.0) 0%, rgba(155,140,255,0.0) 10%, rgba(155,140,255,0.55) 22%, rgba(155,140,255,0.16) 45%, rgba(155,140,255,0) 70%)' } });
        c.core = u.el('div', { cls: 'abs', parent: face, style: { left: (CW / 2 - 6) + 'px', top: (CH / 2 - 6) + 'px', width: '12px', height: '12px', borderRadius: '50%', background: '#7d8fb3' } });
        c.flash = u.el('div', { cls: 'abs', parent: face, style: { left: (CW / 2 - 40) + 'px', top: (CH / 2 - 40) + 'px', width: '80px', height: '80px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(240,246,255,0.95) 0%, rgba(200,220,255,0.45) 22%, rgba(169,200,255,0) 60%)', opacity: 0 } });
      } else {
        if (c.hl) c.stripe = u.el('div', { cls: 'abs', parent: glass, style: { left: (CW / 2 - 34 - 22 * c.name.length) + 'px', top: (CH / 2 - 8) + 'px', width: (68 + 44 * c.name.length) + 'px', height: '30px',
          background: '#c8f04a', opacity: 0.45, borderRadius: '8px 14px 9px 15px', transform: 'rotate(-1.5deg)' } });
        c.label = u.el('div', { cls: 'abs', parent: face, text: c.name, style: { font: '700 44px "Noto Sans SC"', left: '0px', top: '0px', width: CW + 'px', height: CH + 'px', lineHeight: CH + 'px', textAlign: 'center',
          color: low ? '#aab3c4' : '#e9f0ff', letterSpacing: '0.02em', textShadow: low ? 'none' : '0 0 16px rgba(169,200,255,0.35)' } });
      }
    });
    // eight books from the staircase become the named cards; two shoot up and come back face down
    var STEPS = BOX.filter(function (b) { return !b.land; });
    function stepOf(side, k) { for (var i = 0; i < STEPS.length; i++) if (STEPS[i].side === side && STEPS[i].k === k) return STEPS[i]; return null; }
    var NAMED = [stepOf(0, 0), stepOf(0, 2), stepOf(0, 4), stepOf(1, 0), stepOf(1, 2), stepOf(1, 4), stepOf(2, 0), stepOf(2, 1)];
    var TOPB = [stepOf(3, 0), stepOf(3, 1)];
    var named = CARDS.filter(function (c) { return !c.back; }).slice().sort(function (a, b) { return a.x - b.x || (a.row === 'mid' ? -1 : 1); });
    NAMED.slice().sort(function (a, b) { return a.scx - b.scx; }).forEach(function (b, i) { b.card = named[i]; named[i].book = b; });
    TOPB.forEach(function (b, i) { b.top = CARDS[8 + i]; });
    named.forEach(function (c, i) {
      c.tf = T_COL + 0.24 + 0.034 * i;        // edge-on: the canvas book hands over to the DOM card
      c.t0 = T_COL + 0.03 * hsh(i, 'fl');
    });
    // DOM card motion
    CARDS.forEach(function (c, i) {
      if (c.back) {
        gsap.set(c.w, { opacity: 0, y: -720, rotationX: 18 });
        tl.set(c.w, { opacity: 1 }, BT[27] - 0.01);
        tl.to(c.w, { y: 0, rotationX: 0, duration: T_HANG - BT[27], ease: 'power3.out' }, BT[27]);
        tl.to(c.w, { scale: 1.12, duration: T_OUT - T_HANG, ease: 'sine.inOut' }, T_HANG);
        tl.to(c.w, { y: -820, rotationX: -25, duration: 0.52, ease: 'power3.in' }, T_OUT);
        return;
      }
      gsap.set(c.w, { opacity: 0, rotationY: 90, y: -HOVER, rotationZ: (hsh(i, 'rz') - 0.5) * 8 });
      tl.set(c.w, { opacity: 1 }, c.tf);
      tl.to(c.w, { rotationY: 0, duration: 0.34, ease: 'back.out(1.4)' }, c.tf);
      var drop = Math.max(c.tf + 0.14, c.t - 0.2);
      tl.to(c.w, { y: 0, rotationZ: 0, duration: c.t - drop, ease: 'power2.in' }, drop);
      tl.fromTo(c.inner, { scaleY: 1, scaleX: 1 }, { keyframes: [{ scaleY: 0.955, scaleX: 1.03, duration: 0.06, ease: 'power2.out' }, { scaleY: 1, scaleX: 1, duration: 0.4, ease: 'back.out(1.6)' }], immediateRender: false }, c.t);
      tl.to(c.w, { opacity: 0.68, duration: 0.8, ease: 'sine.inOut' }, T_HANG);
      tl.to(c.glass, { opacity: 0, duration: 0.26, ease: 'power2.in' }, T_OUT + 0.02 * i);
    });
    // names dissolve last (their out time)
    named.forEach(function (c, i) {
      var ch = u.splitChars(c.label);
      tl.to(ch, { opacity: 0, y: 30, rotation: function (j) { return (hsh(i * 10 + j, 'nr') - 0.5) * 30; }, filter: 'blur(5px)', duration: 0.3, ease: 'power2.in', stagger: 0.03 },
        tx.card.out - 0.3 - 0.03 * (ch.length - 1) - 0.02 * (named.length - 1 - i));
    });
    u.onFrame(function (t) {
      CARDS.forEach(function (c, i) {
        if (c.back) {
          var sway = t > T_HANG - 0.3 ? 2 * Math.sin((t - T_HANG) * 2 * Math.PI / (2 * u.bar(1)) + i * 1.9) * seg(t, T_HANG - 0.3, T_HANG + 0.6) : 0;
          c.inner.style.transform = 'rotateZ(' + sway.toFixed(3) + 'deg)';
          var fl = 0; T_TICK.forEach(function (tk) { fl = Math.max(fl, pulse(t - tk, 0.015, 0.22)); });
          c.flash.style.opacity = (0.95 * fl).toFixed(4);
          c.core.style.opacity = (0.45 + 0.4 * fl).toFixed(4);
          c.halo.style.opacity = (0.55 + 0.35 * eN(t) + 0.3 * fl).toFixed(4);
          c.halo.style.transform = 'scale(' + (0.92 + 0.14 * eN(t) + 0.12 * fl).toFixed(4) + ')';
        } else {
          var bob = t < c.t ? 3.5 * Math.sin(t * 3.1 + i) * seg(t, c.tf, c.tf + 0.3) : 0;
          c.inner.style.translate = '0px ' + bob.toFixed(2) + 'px';
        }
      });
    });

    var l1 = u.text(deck, tx.l1.text || '最常见的学习方法，反复读、划重点，', 'line', { x: 960, y: 104, style: { color: '#dfe7f6' } });
    var l2 = u.text(deck, '', 'line', { x: 960, y: 189, html: '研究评估效果<span style="color:#ffffff;text-shadow:0 0 16px rgba(169,200,255,0.5)">偏低</span>。', style: { color: '#dfe7f6' } });
    var l3 = u.text(deck, '', 'line', { x: 960, y: 934, html: '10 种学习方法里，被评为效果最高的<span style="color:#ffffff;text-shadow:0 0 18px rgba(207,230,255,0.65)">只有 2 种</span>。', style: { color: '#dfe7f6' } });
    var src2 = u.text(deck, 'Dunlosky et al., 2013', 'source', { x: 1860, y: 1040, anchor: 'bottom-right', style: { color: '#93a4c4' } });
    [[l1, tx.l1, 40, -24], [l2, tx.l2, 40, 22], [l3, tx.l3, 0, 0]].forEach(function (p) {
      var ch = u.splitChars(p[0]);
      gsap.set(ch, { opacity: 0 });
      tl.fromTo(ch, { opacity: 0, y: p[2], scale: p[2] ? 1 : 1.25, filter: 'blur(8px)' }, { opacity: 1, y: 0, scale: 1, filter: 'blur(0px)', duration: 0.6, ease: 'power4.out', stagger: 0.026 }, p[1].in);
      tl.to(ch, { opacity: 0, y: p[3], filter: 'blur(6px)', duration: 0.26, ease: 'power2.in', stagger: 0.006 }, p[1].out - 0.26 - 0.006 * (ch.length - 1) * 0.5);
    });
    gsap.set(src2, { opacity: 0 });
    tl.fromTo(src2, { opacity: 0 }, { opacity: 0.7, duration: 0.6, ease: 'power2.out' }, tx.src2.in);
    tl.to(src2, { opacity: 0, duration: 0.28, ease: 'power2.in' }, tx.src2.out - 0.28);

    // ---------------- per-frame DOM state ----------------
    u.onFrame(function (t) {
      var c = camAt(t), css = camCss(c), wa = worldAlpha(t);
      world.style.transform = css; world.style.opacity = wa.toFixed(4);
      learnCv.canvas.style.transform = css;
      // gauges and bar
      setLevel(gA[0], famLv(t)); setLevel(gA[1], realLv(t));
      setLevel(gB[0], famLv(T_SPLIT)); setLevel(gB[1], realB(t));
      var bp = barProg(t);
      barFill.style.clipPath = 'inset(0px ' + ((1 - bp) * 100).toFixed(3) + '% 0px 0px round 8px)';
      var fl = 0; T_RESET.forEach(function (r) { fl = Math.max(fl, pulse(t - r, 0.01, 0.16)); });
      barFlash.style.opacity = (0.85 * fl).toFixed(4);
      bar.style.translate = '0px ' + (fl * 3 * Math.sin(t * 90)).toFixed(2) + 'px';
      // seam glow follows the music
      seam.style.filter = 'brightness(' + (0.85 + 0.35 * eN(t) + 0.6 * pulse(t - T_SPLIT, 0.01, 0.3)).toFixed(3) + ')';
      // volumetric top light: faint over the stairs, strong over the two face-down cards
      var ro = 0.16 * seg(t, 0.4, 1.8, eSine) * (1 - seg(t, T_SPLIT - 0.2, T_SPLIT + 0.4)) + 0.1 * seg(t, T_CLOSE, T_COL) * (1 - seg(t, T_COL + 0.4, T_COL + 1.2))
        + 0.5 * eSine(seg(t, BT[27], T_HANG + 0.3)) * (1 - seg(t, T_OUT, T_OUT + 0.6));
      rays.state.opacity = ro * (0.8 + 0.4 * eN(t));
      var rOn = rays.state.opacity > 0.004; if (rays.el._on !== rOn) { rays.el.style.display = rOn ? '' : 'none'; rays.el._on = rOn; }
      // canvases that have nothing to draw are switched off (no clear, no draw: cheaper at 4K)
      learnCv.state.opacity = (t >= 0.55 && t <= T_COL + 0.7) ? wa : 0;
      coneCv.state.opacity = (t >= BT[27] - 0.15 && t <= T_OUT + 0.75) ? 1 : 0;
      sandCv.state.opacity = t > T_OUT ? 1 : 0;
      backCv.state.opacity = t < T_COL + 0.55 ? 1 : 0;
    });

    // ---------------- the learner (faceless line figure) ----------------
    // path: one flight per half bar; landings on beats 1 and 3
    var SIDE_SEGS = [];
    for (var s = 0; s < 4; s++) {
      var a = LAND_IDX[s], b2 = LAND_IDX[s + 1], hs = [], tot = 0;
      for (var q = a; q < b2; q++) {
        var P0 = PTS[q], P1 = PTS[q + 1], dl = Math.hypot(P1[0] - P0[0], P1[1] - P0[1]);
        if (dl > 0.01) { hs.push({ p0: P0, p1: P1, l: dl, s0: tot, z: P0[2] }); tot += dl; }
      }
      SIDE_SEGS.push({ segs: hs, len: tot });
    }
    function learnerAt(t) {
      var tt = Math.max(0, t), side = Math.floor(tt / SIDE_T + 1e-9) % 4, f = (tt % SIDE_T) / SIDE_T;
      f = lerp(f, eSine(f), 0.45);
      var S = SIDE_SEGS[side], d = f * S.len, k = 0;
      while (k < S.segs.length - 1 && d > S.segs[k].s0 + S.segs[k].l) k++;
      var sg = S.segs[k], lf = (d - sg.s0) / sg.l;
      var x = lerp(sg.p0[0], sg.p1[0], lf), y = lerp(sg.p0[1], sg.p1[1], lf), z = sg.z;
      // smooth hop over each riser
      var into = d - sg.s0;
      if (k > 0 && into < 26) { var pz = S.segs[k - 1].z, e = seg(into, 0, 26, eSine); z = lerp(pz, sg.z, e) + 8 * Math.sin(Math.PI * e); }
      var off = side === 3 ? 0 : 0;   // world positions of flight 4 continue past T' (projection is identical)
      return { x: PXs(x, y), y: PYs(x, y, z) + off, side: side };
    }
    function drawLearner(g, t) {
      if (t < 0.55 || t > T_COL + 0.7) return;
      var p = learnerAt(t), fade = seg(t, 0.6, T_GROW) * (1 - seg(t, T_COL + 0.05, T_COL + 0.55));
      if (fade <= 0.001) return;
      var fall = t > T_COL ? 0.5 * 1600 * Math.pow(t - T_COL, 2) : 0, tilt = t > T_COL ? (t - T_COL) * 2.2 : 0;
      var face = (p.side === 0 || p.side === 3) ? 1 : -1;
      var ph = t / (BT[1] - BT[0]) * Math.PI, sw = Math.sin(ph), bob = Math.abs(Math.cos(ph)) * 2.2;
      var S = 0.62;
      g.save();
      g.translate(p.x, p.y + fall); g.rotate(tilt * face);
      g.globalAlpha = 0.55 * fade;
      g.fillStyle = 'rgba(0,0,0,0.6)'; g.beginPath(); g.ellipse(0, 1, 22, 5, 0, 0, 6.2832); g.fill();
      g.scale(S * face, S);
      g.globalAlpha = 0.9 * fade;
      g.strokeStyle = '#cfe6ff'; g.lineWidth = 6; g.lineCap = 'round'; g.lineJoin = 'round';
      var hipY = -92 - bob;
      function leg(a) { var kx = Math.sin(a) * 46, ky = hipY + Math.cos(a) * 46, k2 = a > 0 ? 0 : 0.35; g.moveTo(0, hipY); g.lineTo(kx, ky); g.lineTo(kx + Math.sin(a - k2) * 46, ky + Math.cos(a - k2) * 46); }
      g.beginPath(); leg(0.36 * sw); leg(-0.36 * sw); g.stroke();
      g.beginPath(); g.moveTo(0, hipY); g.lineTo(-7, hipY - 82); g.stroke();
      // arms: one holds the word book, one swings
      g.beginPath(); g.moveTo(-7, hipY - 76); g.lineTo(-7 + 26 * Math.sin(-0.5 * sw), hipY - 76 + 34); g.lineTo(-7 + 34 * Math.sin(-0.5 * sw) + 6, hipY - 76 + 60); g.stroke();
      g.beginPath(); g.moveTo(-7, hipY - 76); g.lineTo(9, hipY - 40); g.lineTo(18, hipY - 10); g.stroke();
      g.save(); g.translate(20, hipY - 40); g.rotate(-0.25);
      g.fillStyle = '#0b1325'; g.strokeStyle = '#cfe6ff'; g.lineWidth = 4; g.fillRect(-4, -26, 30, 44); g.strokeRect(-4, -26, 30, 44);
      g.fillStyle = 'rgba(200,240,74,0.8)'; g.fillRect(2, -8, 18, 6);
      g.restore();
      // head: a glowing orb at 30 %
      var hx = -13, hy = hipY - 109, en = eN(t);
      var hg = g.createRadialGradient(hx, hy, 0, hx, hy, 74);
      hg.addColorStop(0, 'rgba(169,200,255,' + (0.42 * (1 + 0.15 * en)).toFixed(4) + ')'); hg.addColorStop(1, 'rgba(169,200,255,0)');
      g.fillStyle = hg; g.fillRect(hx - 74, hy - 74, 148, 148);
      var og = g.createRadialGradient(hx - 4, hy - 6, 2, hx, hy, 23);
      og.addColorStop(0, '#f4f9ff'); og.addColorStop(0.55, '#a9c8ff'); og.addColorStop(1, '#6d8fcf');
      g.globalAlpha = 0.62 * fade; g.fillStyle = og; g.beginPath(); g.arc(hx, hy, 23, 0, 6.2832); g.fill();
      g.restore();
    }

    // ---------------- drawing the staircase ----------------
    function quad(g, a, b, c, d) { g.beginPath(); g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); g.lineTo(c[0], c[1]); g.lineTo(d[0], d[1]); g.closePath(); }
    function L2(a, b, f) { return [lerp(a[0], b[0], f), lerp(a[1], b[1], f)]; }
    // a vertical face given its top edge (T1,T2) and bottom edge (B1,B2); two books: spines or page edges
    function bookFace(g, T1, T2, B1, B2, f) {
      for (var k = 0; k < 2; k++) {
        var f0 = k * 0.5, f1 = f0 + 0.5;
        quad(g, L2(T1, B1, f0), L2(T2, B2, f0), L2(T2, B2, f1), L2(T1, B1, f1)); g.fillStyle = k ? f.b : f.a; g.fill();
        if (f.spine) {
          g.strokeStyle = 'rgba(226,234,252,0.30)'; g.lineWidth = 1;
          [0.1, 0.4].forEach(function (rf) { var A1 = L2(T1, B1, f0 + rf), A2 = L2(T2, B2, f0 + rf); g.beginPath(); g.moveTo(A1[0], A1[1]); g.lineTo(A2[0], A2[1]); g.stroke(); });
          var u0 = 0.3 + 0.16 * hsh(k, f.a), u1 = u0 + 0.26;
          var a1 = L2(L2(T1, T2, u0), L2(B1, B2, u0), f0 + 0.17), a2 = L2(L2(T1, T2, u1), L2(B1, B2, u1), f0 + 0.17), a3 = L2(L2(T1, T2, u1), L2(B1, B2, u1), f0 + 0.33), a4 = L2(L2(T1, T2, u0), L2(B1, B2, u0), f0 + 0.33);
          quad(g, a1, a2, a3, a4); g.fillStyle = 'rgba(226,234,252,0.30)'; g.fill();
        } else {
          g.strokeStyle = 'rgba(20,28,48,0.28)'; g.lineWidth = 0.8;
          for (var r = 1; r < 5; r++) { var ff = f0 + 0.07 + r * 0.088; var A1 = L2(T1, B1, ff), A2 = L2(T2, B2, ff); g.beginPath(); g.moveTo(A1[0], A1[1]); g.lineTo(A2[0], A2[1]); g.stroke(); }
          g.strokeStyle = k ? f.cb : f.ca; g.lineWidth = 2.6;
          [f0 + 0.035, f1 - 0.035].forEach(function (ff) { var A1 = L2(T1, B1, ff), A2 = L2(T2, B2, ff); g.beginPath(); g.moveTo(A1[0], A1[1]); g.lineTo(A2[0], A2[1]); g.stroke(); });
        }
      }
      var m1 = L2(T1, B1, 0.5), m2 = L2(T2, B2, 0.5);
      g.strokeStyle = 'rgba(4,7,16,0.75)'; g.lineWidth = 1.4; g.beginPath(); g.moveTo(m1[0], m1[1]); g.lineTo(m2[0], m2[1]); g.stroke();
    }
    function drawBox(g, b, alpha, dy, t, hlN) {
      if (alpha <= 0.002) return;
      var x0 = b.cx - b.hx, x1 = b.cx + b.hx, y0 = b.cy - b.hy, y1 = b.cy + b.hy, zt = b.z, zb = b.z - TH;
      function P(x, y, z) { return [PXs(x, y), PYs(x, y, z) + dy]; }
      var A = P(x0, y0, zt), B = P(x1, y0, zt), C = P(x1, y1, zt), Dd = P(x0, y1, zt), Bb = P(x1, y0, zb), Cb = P(x1, y1, zb), Db = P(x0, y1, zb);
      g.globalAlpha = alpha;
      bookFace(g, B, C, Bb, Cb, b.fx);       // +x face, lower right (darkest)
      bookFace(g, Dd, C, Db, Cb, b.fy);      // +y face, lower left
      // top cover: the lightest surface, lit from the upper left
      quad(g, A, B, C, Dd);
      var tg = g.createLinearGradient(A[0], A[1], C[0], C[1]);
      tg.addColorStop(0, b.top0); tg.addColorStop(1, b.top1);
      g.fillStyle = tg; g.fill();
      var ins = 0.13, I1 = L2(A, C, ins), I3 = L2(C, A, ins), I2 = L2(B, Dd, ins), I4 = L2(Dd, B, ins);
      quad(g, I1, I2, I3, I4); g.strokeStyle = 'rgba(225,235,255,0.16)'; g.lineWidth = 1; g.stroke();
      // edges: silhouette and the cold rim on the front top edges
      g.strokeStyle = 'rgba(214,228,255,0.32)'; g.lineWidth = 1.1;
      g.beginPath(); g.moveTo(A[0], A[1]); g.lineTo(B[0], B[1]); g.moveTo(A[0], A[1]); g.lineTo(Dd[0], Dd[1]);
      g.moveTo(B[0], B[1]); g.lineTo(Bb[0], Bb[1]); g.lineTo(Cb[0], Cb[1]); g.lineTo(Db[0], Db[1]); g.lineTo(Dd[0], Dd[1]); g.moveTo(C[0], C[1]); g.lineTo(Cb[0], Cb[1]); g.stroke();
      g.strokeStyle = 'rgba(238,245,255,0.8)'; g.lineWidth = 1.8;
      g.beginPath(); g.moveTo(B[0], B[1]); g.lineTo(C[0], C[1]); g.lineTo(Dd[0], Dd[1]); g.stroke();
      // landings: a small open copy of the same word book, with the same flat highlighter
      if (b.land) {
        var cx = b.cx, cy = b.cy;
        var Q = function (x, y) { return P(cx + x, cy + y, zt); };
        [[-42, -3], [3, 42]].forEach(function (r, pi) {
          quad(g, Q(r[0], -30), Q(r[1], -30), Q(r[1], 30), Q(r[0], 30)); g.fillStyle = pi ? '#d3dbe9' : '#c4cede'; g.fill();
          g.strokeStyle = 'rgba(40,52,80,0.35)'; g.lineWidth = 0.8;
          for (var li = 0; li < 4; li++) { var yy = -20 + li * 12, a1 = Q(r[0] + 6, yy), a2 = Q(r[1] - 6 - (li % 2) * 9, yy); g.beginPath(); g.moveTo(a1[0], a1[1]); g.lineTo(a2[0], a2[1]); g.stroke(); }
        });
        if (hlN > 0) {
          var th = 6 + 3 * Math.min(4, Math.floor(hlN)), wf = hlN - Math.floor(hlN);
          var wTot = 32, wNow = Math.floor(hlN) >= 1 ? wTot : wTot * wf;
          quad(g, Q(7, -12 - th / 2), Q(7 + wNow, -12 - th / 2), Q(7 + wNow, -12 + th / 2), Q(7, -12 + th / 2)); g.fillStyle = 'rgba(200,240,74,0.82)'; g.fill();
        }
      }
      g.globalAlpha = 1;
    }
    // landing passes (T R B Lc ...) and how many highlighter strokes each landing book carries
    function landHL(li, t) {
      var n = 0;
      for (var k = 1; k <= 12; k++) { if (k % 4 !== li) continue; var tk = k * SIDE_T; if (t >= tk) n += t >= tk + 0.3 ? 1 : seg(t, tk, tk + 0.3, eP2o); }
      return n;
    }
    var LAND_OF_BOX = {}; BOX.forEach(function (b) { if (b.land) LAND_OF_BOX[b.i] = b.side === 3 ? 0 : b.side + 1; });
    function strokeLine(g, pts, w, col, a) {
      if (a <= 0.002 || pts.length < 2) return;
      g.globalAlpha = a; g.strokeStyle = col; g.lineWidth = w; g.lineJoin = 'round'; g.lineCap = 'round';
      g.beginPath(); g.moveTo(pts[0][0], pts[0][1]); for (var i = 1; i < pts.length; i++) g.lineTo(pts[i][0], pts[i][1]); g.stroke(); g.globalAlpha = 1;
    }
    function penPts(t) {
      var s = penS(t), out = [[SP[0][0], SP[0][1]]];
      for (var i = 1; i < SP.length && SL[i] <= s; i++) out.push([SP[i][0], SP[i][1]]);
      if (s > 0 && s < S_PEN) out.push(atSL(s));
      return out;
    }
    function loopLine(g, t, a, wk) {
      var z = zigPts(t), pen = t < T_GROW ? penPts(t) : SP.slice(0, IA + 1);
      var w = lerp(3.0, 2.2, wk), ga = lerp(0.12, 0.17, seg(t, 0.2, 0.8));
      strokeLine(g, z, 10, '#a9c8ff', ga * a); strokeLine(g, pen, 10, '#a9c8ff', ga * a);
      strokeLine(g, z, w, '#f2f7ff', a); strokeLine(g, pen, w, '#f2f7ff', a);
    }

    function drawStairs(g, t) {
      if (t < T_COL) {
        for (var oi = 0; oi < ORDER.length; oi++) {
          var b = ORDER[oi], ap = seg(t, b.tIn, b.tIn + 0.26, eP2o);
          if (ap <= 0) continue;
          var dy = -18 * (1 - eBack(seg(t, b.tIn, b.tIn + 0.4)));
          drawBox(g, b, ap, dy, t, b.land ? landHL(LAND_OF_BOX[b.i], t) : 0);
        }
        var la = 1 - 0.8 * eSine(seg(t, T_GROW + 0.3, T_GROW + 1.6));
        loopLine(g, t, la, seg(t, T_GROW, T_GROW + 1.0));
        // a soft travelling glint round the loop, once per loop, brighter with the music
        if (t > T_GROW + 0.5) {
          var gp = ((t - T_GROW) % (4 * SIDE_T)) / (4 * SIDE_T), gs = gp * SL[IH], gpos = atSL(gs);
          glowDisc(g, gpos[0], gpos[1], 26, 'rgba(200,222,255,', 0.25 + 0.3 * eN(t));
        }
        return;
      }
      drawCollapse(g, t);
    }

    // ---------------- collapse: books spin out, eight become cards, two shoot up, the rest fall ----------------
    var STAIR_C = [PXs(420, 420), PYs(420, 420, 210)];
    var B_LAND = BOX.filter(function (b) { return b.land && b.side === 1; })[0];
    BOX.forEach(function (b, i) {
      var dx = b.scx - STAIR_C[0], dy0 = b.scy - STAIR_C[1], dist = Math.hypot(b.scx - B_LAND.scx, b.scy - B_LAND.scy);
      b.dl = 0.12 * dist / 700;
      b.vx = dx * 0.55 + (hsh(i, 'vx') - 0.5) * 140; b.vy = -120 - 200 * hsh(i, 'vy') + dy0 * 0.25;
      b.w = (hsh(i, 'w') - 0.5) * 7; b.spin = (hsh(i, 'sp') < 0.5 ? -1 : 1) * (0.7 + 0.8 * hsh(i, 'sp2'));
    });
    function drawCollapse(g, t) {
      var tc = t - T_COL;
      for (var oi = 0; oi < ORDER.length; oi++) {
        var b = ORDER[oi], tau = Math.max(0, tc - b.dl);
        g.save();
        if (b.card) {
          var c = b.card, p = eP3io(seg(t, c.t0, c.tf));
          if (p >= 1) { g.restore(); continue; }
          var hw = camInv(t, c.x, c.y - HOVER), hx = hw[0], hy = hw[1], mx = (b.scx + hx) / 2, my = Math.min(b.scy, hy) - 190;
          var px = (1 - p) * (1 - p) * b.scx + 2 * (1 - p) * p * mx + p * p * hx, py = (1 - p) * (1 - p) * b.scy + 2 * (1 - p) * p * my + p * p * hy;
          var rot = b.spin * Math.sin(Math.PI * p) * 0.8, sc = lerp(1, 1.6 / camAt(t).z, p), sxf = Math.cos(p * Math.PI / 2);
          g.translate(px, py); g.rotate(rot); g.scale(sc * Math.max(0.02, sxf), sc); g.translate(-b.scx, -b.scy);
          drawBox(g, b, 1, 0, t, 0);
        } else if (b.top) {
          var q = eP3i(seg(tau, 0, 0.55));
          g.translate(b.scx + 120 * (b.top.x < 960 ? -1 : 1) * q, b.scy - 900 * q); g.rotate(b.spin * q * 1.4); g.translate(-b.scx, -b.scy);
          drawBox(g, b, 1 - seg(tau, 0.4, 0.55), 0, t, 0);
        } else {
          var fx = b.scx + b.vx * tau, fy = b.scy + b.vy * tau + 0.5 * 2300 * tau * tau, fa = 1 - seg(tau, 0.22, 0.62, eP2i);
          if (fa <= 0) { g.restore(); continue; }
          g.translate(fx, fy); g.rotate(b.w * tau); g.scale(1 - 0.25 * tau, 1 - 0.25 * tau); g.translate(-b.scx, -b.scy);
          drawBox(g, b, fa, 0, t, b.land ? landHL(LAND_OF_BOX[b.i], T_COL) : 0);
        }
        g.restore();
      }
      // the walking line snaps
      var la = 0.28 * (1 - seg(tc, 0, 0.18));
      if (la > 0) { strokeLine(g, SP, 2.2, '#f2f7ff', la); }
    }

    // ---------------- background: a giant faint echo of the loop, far dust ----------------
    var ECHO = SP.map(function (p) { return [(p[0] - 1420) * 2.6 + 900, (p[1] - 560) * 2.6 + 600]; });
    function drawBack(g, t) {
      var a = 0.055 * seg(t, 0.3, 1.6) * (1 - 0.6 * seg(t, T_SPLIT - 0.2, T_SPLIT + 0.4) * (1 - seg(t, T_CLOSE, T_COL))) * (1 - seg(t, T_COL, T_COL + 0.5));
      if (a > 0.002) {
        g.save(); g.translate(-30 * seg(t, 0, D), -14 * seg(t, 0, D));
        strokeLine(g, ECHO, 3, '#a9c8ff', a * (0.8 + 0.4 * eN(t)));
        g.translate(1300, -260); g.scale(0.55, 0.55); g.translate(-760, -560);
        strokeLine(g, ECHO, 4, '#a9c8ff', 0.6 * a);
        g.restore();
      }
    }

    // ---------------- fx: motif dot, flashes, sparks, dust, word sand ----------------
    function glowDisc(g, x, y, rad, rgb, a) {
      if (a <= 0.002 || rad <= 0.5) return;
      var gr = g.createRadialGradient(x, y, 0, x, y, rad);
      gr.addColorStop(0, rgb + clamp(a, 0, 1).toFixed(4) + ')'); gr.addColorStop(0.35, rgb + clamp(a * 0.42, 0, 1).toFixed(4) + ')'); gr.addColorStop(1, rgb + '0)');
      g.fillStyle = gr; g.fillRect(x - rad, y - rad, rad * 2, rad * 2);
    }
    var HOV = [OX, OY - 96];
    function dotPos(t) {
      if (t < T_MORPH) { var z = zigPts(t); return [z[8][0], z[8][1] - 3 * (1 - morphK(t))]; }
      if (t < T_GROW) { var p = atSL(penS(t)); return p; }
      var e = eP3io(seg(t, T_GROW + 0.05, T_GROW + 1.1)), a0 = SP[IA];
      var bob = 5 * Math.sin((t - T_GROW) * 1.7) * seg(t, T_GROW + 0.6, T_GROW + 1.6);
      var p2 = [lerp(a0[0], HOV[0], e), lerp(a0[1], HOV[1], e) - 60 * Math.sin(Math.PI * e) + bob];
      if (t >= T_COL) { p2 = camPt(T_COL, p2[0], p2[1]); var up = eP3i(seg(t, T_COL, T_COL + 0.4)); p2[1] -= 620 * up; }
      return p2;
    }
    function dotAlpha(t) {
      return (1 - seg(t, BT[11], T_SPLIT - 0.1)) + seg(t, T_CLOSE, T_CLOSE + 0.35) * (1 - seg(t, T_COL + 0.3, T_COL + 0.42));
    }
    // dust burst at the collapse and when 重读 lands
    var RD = u.rand('s04dust2'), DUST = [];
    BOX.forEach(function (b) { for (var k = 0; k < 18; k++) DUST.push({ w: true, x: b.scx + RD.range(-60, 60), y: b.scy + RD.range(-20, 30), vx: RD.range(-120, 120), vy: RD.range(-160, 40), t0: T_COL + b.dl + RD.range(0, 0.1), life: RD.range(0.7, 1.5), r: RD.range(0.8, 2.4) }); });
    var C_REREAD = CARDS[7];
    for (var dk = 0; dk < 70; dk++) DUST.push({ x: C_REREAD.x + RD.range(-150, 150), y: PLANK.bot - 4 + RD.range(-4, 4), vx: RD.range(-90, 90), vy: RD.range(-110, -20), t0: BT[27] + RD.range(0, 0.06), life: RD.range(0.6, 1.3), r: RD.range(0.7, 2.0), g: 120 });
    named.forEach(function (c) { for (var k = 0; k < 16; k++) DUST.push({ x: c.x + RD.range(-140, 140), y: PLANK[c.row] - 3, vx: RD.range(-50, 50), vy: RD.range(-60, -10), t0: c.t, life: RD.range(0.4, 0.8), r: RD.range(0.6, 1.4), g: 80 }); });
    // word sand: the eight cards and the shelves run down into one thin stream (to the lower left, s05's river)
    var SAND = [], RS = u.rand('s04sand'), STREAM_X = 984;
    var LET = 'abcdefghijklmnopqrstuvwxyz';
    named.forEach(function (c, ci) {
      for (var k = 0; k < 190; k++) {
        var sx0 = c.x + RS.range(-CW / 2 + 8, CW / 2 - 8), sy0 = c.y + RS.range(-CH / 2 + 8, CH / 2 - 8);
        SAND.push({ x0: sx0, y0: sy0, t0: T_OUT + 0.015 * ci + RS.range(0, 0.25), dur: RS.range(0.6, 0.95), ex: STREAM_X + RS.gauss() * 7, ey: 1140 + RS.range(0, 40),
          cx: lerp(sx0, STREAM_X, 0.85) + RS.gauss() * 10, cy: Math.max(sy0, 900) + RS.range(-20, 40), r: RS.range(0.6, 1.8), ch: RS() < 0.16 ? LET[RS.int(0, 25)] : null, ph: RS() * 6.28 });
      }
    });
    ['top', 'mid', 'bot'].forEach(function (row) {
      for (var k = 0; k < 90; k++) { var sx0 = RS.range(220, 1720), sy0 = PLANK[row]; SAND.push({ x0: sx0, y0: sy0, t0: T_OUT + RS.range(0, 0.25), dur: RS.range(0.6, 0.9), ex: STREAM_X + RS.gauss() * 8, ey: 1140, cx: lerp(sx0, STREAM_X, 0.85), cy: Math.max(sy0, 920), r: RS.range(0.5, 1.2), ch: null, ph: 0 }); }
    });
    var LSPR = {};
    (function () {
      var dprx = window.devicePixelRatio || 1;
      for (var i = 0; i < 26; i++) {
        var c = document.createElement('canvas'), s = 24; c.width = c.height = Math.ceil(s * dprx);
        var gg = c.getContext('2d'); gg.scale(dprx, dprx); gg.font = 'italic 400 15px "Source Serif 4 Display"'; gg.textAlign = 'center'; gg.textBaseline = 'middle';
        gg.fillStyle = '#dff3ff'; gg.fillText(LET[i], s / 2, s / 2); LSPR[LET[i]] = c;
      }
    })();
    var RM = u.rand('s04motes'), MOTES = [];
    for (var mi = 0; mi < 70; mi++) MOTES.push({ x: RM.range(-1, 1), y: RM(), sp: RM.range(8, 22), r: RM.range(0.6, 1.8), ph: RM() * 6.28, tw: RM.range(1, 3) });
    function drawCone(g, t) {
      var a = eSine(seg(t, BT[27] - 0.1, T_HANG + 0.35)) * (1 - seg(t, T_OUT + 0.1, T_OUT + 0.7));
      if (a <= 0.002) return;
      var en = eN(t), flick = 0; T_TICK.forEach(function (tk) { flick = Math.max(flick, pulse(t - tk, 0.015, 0.3)); });
      var k = a * (0.85 + 0.25 * en + 0.35 * flick);
      g.globalCompositeOperation = 'lighter';
      // the cone: apex above the frame, wide over the top shelf
      var ax = 960, ay = -160, by = PLANK.top + 30, hw = 420;
      var lg = g.createLinearGradient(0, ay, 0, by);
      lg.addColorStop(0, 'rgba(220,234,255,' + (0.0).toFixed(3) + ')'); lg.addColorStop(0.35, 'rgba(214,230,255,' + (0.10 * k).toFixed(4) + ')');
      lg.addColorStop(0.85, 'rgba(200,222,255,' + (0.16 * k).toFixed(4) + ')'); lg.addColorStop(1, 'rgba(200,222,255,0)');
      g.fillStyle = lg; g.beginPath(); g.moveTo(ax - 30, ay); g.lineTo(ax + 30, ay); g.lineTo(ax + hw, by); g.lineTo(ax - hw, by); g.closePath(); g.fill();
      // softer, narrower core
      var lg2 = g.createLinearGradient(0, ay, 0, by);
      lg2.addColorStop(0, 'rgba(235,243,255,0)'); lg2.addColorStop(0.5, 'rgba(235,243,255,' + (0.08 * k).toFixed(4) + ')'); lg2.addColorStop(1, 'rgba(235,243,255,0)');
      g.fillStyle = lg2; g.beginPath(); g.moveTo(ax - 12, ay); g.lineTo(ax + 12, ay); g.lineTo(ax + 230, by); g.lineTo(ax - 230, by); g.closePath(); g.fill();
      // light pool on the top shelf
      g.save(); g.translate(960, PLANK.top); g.scale(1, 0.12);
      var pg = g.createRadialGradient(0, 0, 0, 0, 0, 520); pg.addColorStop(0, 'rgba(210,228,255,' + (0.5 * k).toFixed(4) + ')'); pg.addColorStop(1, 'rgba(210,228,255,0)');
      g.fillStyle = pg; g.fillRect(-520, -520, 1040, 1040); g.restore();
      // motes drifting down through the light
      for (var i = 0; i < MOTES.length; i++) {
        var m = MOTES[i], yy = ((m.y * (by - 40) + t * m.sp) % (by - 40)) + 20, wdt = lerp(40, hw, (yy - ay) / (by - ay));
        var xx = ax + m.x * wdt * 0.9 + 6 * Math.sin(t * 0.7 + m.ph);
        glowDisc(g, xx, yy, m.r * 4, 'rgba(225,238,255,', 0.5 * k * (0.5 + 0.5 * Math.sin(t * m.tw + m.ph)));
      }
      g.globalCompositeOperation = 'source-over';
    }
    function drawSand(g, t) {
      if (t <= T_OUT) return;
      var en = eN(t);
      g.globalCompositeOperation = 'lighter';
      for (var si = 0; si < SAND.length; si++) {
        var S = SAND[si], a3 = t - S.t0; if (a3 < 0) continue;
        var q = clamp(a3 / S.dur, 0, 1), qe = eP2i(q);
        var x = (1 - qe) * (1 - qe) * S.x0 + 2 * (1 - qe) * qe * S.cx + qe * qe * S.ex, y = (1 - qe) * (1 - qe) * S.y0 + 2 * (1 - qe) * qe * S.cy + qe * qe * S.ey;
        x += 6 * Math.sin(S.ph + a3 * 7) * (1 - qe);
        var al = seg(a3, 0, 0.12) * (1 - 0.5 * seg(q, 0.9, 1));
        var col = q < 0.55 ? 'rgba(210,228,255,' : 'rgba(150,226,214,';
        if (S.ch) { g.globalAlpha = 0.85 * al; g.drawImage(LSPR[S.ch], x - 12, y - 12, 24, 24); g.globalAlpha = 1; }
        else glowDisc(g, x, y, S.r * 4, col, 0.75 * al);
      }
      // the thread itself: thin, bright, falling straight down out of the frame
      var st = seg(t, T_OUT + 0.22, T_OUT + 0.7);
      if (st > 0) {
        var top = lerp(1080, 760, eP2o(st));
        var lg = g.createLinearGradient(0, top, 0, 1080);
        lg.addColorStop(0, 'rgba(160,230,220,0)'); lg.addColorStop(0.25, 'rgba(170,232,224,1)'); lg.addColorStop(1, 'rgba(190,240,232,1)');
        g.strokeStyle = lg; g.lineCap = 'round';
        g.globalAlpha = 0.65 * st * (0.8 + 0.4 * en); g.lineWidth = 2.4; g.beginPath(); g.moveTo(STREAM_X, top); g.lineTo(STREAM_X, 1090); g.stroke();
        g.globalAlpha = 0.16 * st; g.lineWidth = 16; g.stroke(); g.globalAlpha = 1;
      }
      g.globalCompositeOperation = 'source-over';
    }
    function drawFx(g, t) {
      var en = eN(t);
      g.globalCompositeOperation = 'lighter';
      // drum hits: a cold breath of light over the staircase (phase one) or over the shelf
      var hp = u.hitPulse(t, 0.28);
      if (hp > 0.01) {
        var hc = t < T_COL ? camPt(t, CAM_O[0], CAM_O[1]) : [960, 600];
        glowDisc(g, hc[0], hc[1], 620, 'rgba(150,185,255,', 0.07 * hp * worldAlpha(t));
      }
      // seam flash
      var sf = pulse(t - T_SPLIT, 0.012, 0.28);
      if (sf > 0.01) {
        g.save(); g.translate(960, 540); g.scale(0.09, 1);
        var gr = g.createRadialGradient(0, 0, 0, 0, 0, 900); gr.addColorStop(0, 'rgba(225,238,255,' + (0.55 * sf).toFixed(4) + ')'); gr.addColorStop(1, 'rgba(160,190,255,0)');
        g.fillStyle = gr; g.fillRect(-900, -900, 1800, 1800); g.restore();
      }
      // loop closes: sparkle at Lc
      var sp = pulse(t - T_GROW, 0.01, 0.3);
      if (sp > 0.01) { var la0 = camPt(t, SP[IA][0], SP[IA][1]); glowDisc(g, la0[0], la0[1], 70, 'rgba(190,215,255,', 0.6 * sp); glowDisc(g, la0[0], la0[1], 14, 'rgba(244,249,255,', sp); }
      // progress-bar clicks
      T_RESET.forEach(function (r, i) {
        var k = pulse(t - r, 0.008, 0.18); if (k < 0.01) return;
        var bx = i === 0 ? 1560 : 840; glowDisc(g, bx, BAR_Y, 60, 'rgba(200,225,255,', 0.7 * k); glowDisc(g, bx, BAR_Y, 10, 'rgba(250,252,255,', k);
      });
      // collapse flash and ring from the bottom landing
      var cf = pulse(t - T_COL, 0.01, 0.35);
      if (cf > 0.01) {
        var bl = camPt(t, B_LAND.scx, B_LAND.scy);
        glowDisc(g, bl[0], bl[1], 520, 'rgba(160,190,255,', 0.32 * cf);
        var rq = seg(t, T_COL, T_COL + 0.45), rr = 40 + 380 * eExpo(rq);
        g.save(); g.translate(bl[0], bl[1]); g.scale(1, 0.5); g.strokeStyle = 'rgba(200,222,255,' + (0.34 * (1 - rq)).toFixed(4) + ')'; g.lineWidth = 3; g.beginPath(); g.arc(0, 0, rr, 0, 6.2832); g.stroke(); g.restore();
      }
      // book trails while they fly to the shelf
      named.forEach(function (c) {
        var b = c.book, p = eP3io(seg(t, c.t0, c.tf)); if (p <= 0 || p >= 1) return;
        var bs = camPt(t, b.scx, b.scy);
        glowDisc(g, lerp(bs[0], c.x, p), lerp(bs[1], c.y - HOVER, p) - 80 * Math.sin(Math.PI * p), 90, 'rgba(160,190,255,', 0.18 * Math.sin(Math.PI * p));
      });
      // shelf landing glints
      named.forEach(function (c) { var k = pulse(t - c.t, 0.01, 0.25); if (k > 0.01) glowDisc(g, c.x, PLANK[c.row], 170, 'rgba(180,205,255,', 0.32 * k); });
      // dust
      for (var i = 0; i < DUST.length; i++) {
        var d = DUST[i], a = t - d.t0; if (a < 0 || a > d.life) continue;
        var k2 = a / d.life;
        g.globalAlpha = 0.55 * (1 - k2) * (0.8 + 0.4 * en);
        g.fillStyle = '#a9c0e8';
        var dx = d.x + d.vx * a, dy2 = d.y + d.vy * a + 0.5 * (d.g || 220) * a * a;
        if (d.w) { var dq = camPt(t, dx, dy2); dx = dq[0]; dy2 = dq[1]; }
        g.beginPath(); g.arc(dx, dy2, d.r, 0, 6.2832); g.fill();
      }
      g.globalAlpha = 1;
      // the motif dot (dim grey blue, 30 %), wrapped in the lavender halo of familiarity
      var da = dotAlpha(t);
      if (da > 0.003 && t < T_COL + 0.45) {
        var dw = dotPos(t), dp = t < T_COL ? camPt(t, dw[0], dw[1]) : dw, fam = clamp((famLv(t) - 0.1) / 0.82, 0, 1);
        var halo = fam * (0.75 + 0.35 * en);
        if (halo * da > 0.003) {   // the lavender halo of familiarity: a pretty ring, hollow in the middle (as on the card backs)
          var hr = 26 + 64 * fam, hgr = g.createRadialGradient(dp[0], dp[1], 0, dp[0], dp[1], hr);
          hgr.addColorStop(0, 'rgba(155,140,255,0)'); hgr.addColorStop(0.16, 'rgba(155,140,255,0)'); hgr.addColorStop(0.3, 'rgba(165,150,255,' + (0.5 * halo * da).toFixed(4) + ')');
          hgr.addColorStop(0.6, 'rgba(155,140,255,' + (0.14 * halo * da).toFixed(4) + ')'); hgr.addColorStop(1, 'rgba(155,140,255,0)');
          g.fillStyle = hgr; g.fillRect(dp[0] - hr, dp[1] - hr, hr * 2, hr * 2);
        }
        glowDisc(g, dp[0], dp[1], 126, 'rgba(58,74,107,', 0.03 * da);
        glowDisc(g, dp[0], dp[1], 36, 'rgba(58,74,107,', 0.24 * da);
        glowDisc(g, dp[0], dp[1], 13, 'rgba(225,238,255,', 0.1 * da);
        if (t > T_MORPH && t < T_GROW) glowDisc(g, dp[0], dp[1], 34, 'rgba(225,238,255,', 0.55 * seg(t, T_MORPH, T_MORPH + 0.15) * (1 - seg(t, T_GROW - 0.1, T_GROW + 0.2)));
        if (t >= T_COL) { glowDisc(g, dp[0], dp[1] + 40, 60, 'rgba(190,215,255,', 0.5 * da); }
        g.globalCompositeOperation = 'source-over';
        g.globalAlpha = da * 0.7; g.fillStyle = '#7d8fb3'; g.beginPath(); g.arc(dp[0], dp[1], 4.4, 0, 6.2832); g.fill();
        g.globalAlpha = 1; g.globalCompositeOperation = 'lighter';
      }
      // the two top cards fly up with light trails
      if (t > T_OUT) CARDS.slice(8).forEach(function (c) {
        var k = seg(t, T_OUT + 0.15, T_OUT + 0.52, eP3i); if (k <= 0 || k >= 1) return;
        g.save(); g.translate(c.x, c.y - 820 * k + 120); g.scale(0.08, 1);
        var gr2 = g.createRadialGradient(0, 0, 0, 0, 0, 420); gr2.addColorStop(0, 'rgba(210,228,255,' + (0.4 * Math.sin(Math.PI * k)).toFixed(4) + ')'); gr2.addColorStop(1, 'rgba(160,190,255,0)');
        g.fillStyle = gr2; g.fillRect(-420, -420, 840, 840); g.restore();
      });
      g.globalCompositeOperation = 'source-over';
    }
  });
})();
