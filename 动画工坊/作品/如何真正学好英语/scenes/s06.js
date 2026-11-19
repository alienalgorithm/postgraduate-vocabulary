/* s06  The 50th word, the encounter star map (global 74.342 to 96.842 s, bars 41 to 52 of the Cornfield Chase edit;
 * 22.5 s). Music: 74.342 the 8 kHz shimmer layer comes in (bar 41, Am); 78.092 G (hit 0.49); 81.842 the deep bass
 * returns (bar 45, F, strength 0.85, the second lift); harmony changes every two bars (85.592 G, 89.342 Am, 93.092 G,
 * about 0.56); bar 52 (94.967) is the fullest bar of the scene. Beat 0.625 s, bar 1.875 s, 16th 0.15625 s.
 *
 * Signature shot "第 50 个词，相遇星图" (signature 3 of the film).
 *  A (0 to 6.875)  The reading page s05 handed over (six lines of light beads) condenses into the real 50-word passage
 *     of story 51 (Source Serif 42 px, world coordinates identical to s05). The camera trucks right (130 px) and the
 *     page narrows to make room for a coverage ring. 49 words light one by one in reading order, one per 16th in bar
 *     41, then the remaining 37 in an accelerating rush over bar 42 beats 1 to 2; every lit word rises 2 px, flashes
 *     and throws a warm mote along an arc into the ring, which fills like a water level. On bar 42 beat 3 the ring
 *     closes at about 98 % with a bounce; its 2 % gap faces evidence and a faint dashed thread links them. evidence
 *     (dotless ı; the dot is the film's motif light, 30 %) is the only word left dark. On G (bar 43) a green pen
 *     ring (#5fd38a) snaps tight around it, the other words drop one step, "noticing" is pinned above it and the
 *     camera pushes in on it. One source block "Hu & Nation, 2000 · Schmidt, 1990" from 0.3125 to 6.8.
 *  B (6.875 to 11.25)  On bar 44 beat 3 the page melts (SVG displacement 0 > 60) into the user's own 4K close-reading
 *     frame (story 51, 86.5 s), which resolves from displacement 60 > 0 through an iris that opens from the i of
 *     evidence; the green ring shrinks onto the motif dot and rides it onto the frame's i. On the deep-bass downbeat
 *     (bar 45) the dissolve is complete, the frame hangs with a 4 deg 3D tilt and a light sweep crosses it (0.9 s),
 *     lighting evidence and 证据 as it passes. Bar 46: the ring slides out from the dot around the frame's evidence and
 *     the camera pushes slowly. Bar 46 beat 3: the frame collapses into the first star (51), the big centre word
 *     evidence fades up at 30 % and the dot flies onto its ı; counter 遇见 1.
 *  C (11.25 to 22.5)  The encounter star map. The eight other real occurrences of evidence in the 70 stories arrive in
 *     three fixed slots (A left, B right, C bottom; never more than three on screen; times from visual_text): a
 *     numbered badge pops, the fragment types in, a light line draws from its evidence (warm gold) to the centre word
 *     and its head lands on the next beat: the counter ticks, a shock ring leaves the word, which grows one step
 *     brighter and warmer (ice white at 1, warm gold at 9). When a fragment's time is up it collapses into a star
 *     that flies onto the map's ellipse, keeps its story number and stays linked by an amber line. Bar 49 (Am): the
 *     map shrinks to 0.86 and moves below y 350 for the two-line headline and its line (Webb, 2007); encounters speed
 *     up from every two beats to every beat and a half. Bar 51 (G): the 9th; then unlabeled encounters streak in from
 *     off screen (lines and pulses only), every beat and from bar 52 every eighth; the counter blurs and keeps
 *     rolling. The map slowly orbits (rotateY -8 to +8 deg, real perspective), stars twinkle with the music energy.
 *     A brightness timeline at the bottom draws the dot's history: a bump per encounter, decaying in between, the
 *     floor slowly rising. Bar 52 beat 3: the camera pulls back and the timeline grows (handoff to s07).
 *
 * Techniques: data visualisation (word-by-word lighting, coverage ring with water fill, counter, brightness timeline),
 * the user's own 4K frame, liquid / iris dissolve (feTurbulence + feDisplacementMap, CSS mask), generative star map,
 * dust and meteors, path drawing and motion along paths (motes, light lines with riding pulses, stars flying to the
 * ellipse), text effects (char pops, typewriter fragments, rolling counter), 2.5D (3D-tilted frame, orbiting star
 * map with perspective, parallax dust, camera truck / push / pull), light (sweep, bloom, rays, shock rings, bokeh),
 * music sync (16th-note lighting, beat-locked arrivals, energy-driven glow, twinkle and pulses).
 *
 * HANDOFF in (cut from s05 at 74.342): frame 0 redraws s05's last frame: background #0a1622, the frosted page div
 *   (x 180, y 260, 1560 x 560, radius 28, same CSS), the passage laid out by s05's rule (greedy wrap to 6 lines,
 *   widest line centred, pitch 72; window.__s05Block wins if it disagrees), 3000 bead lights replayed from s05's own
 *   seeds ('s05:river', hash 's05lu' / 's05lj'), the bead-line glows (ga 0.65) and the warm 30 % motif dot on the i.
 *   Dust and bokeh fade in over the first 1.4 s, so nothing new pops at the cut.
 * HANDOFF out (cut to s07 at 96.842). Last frame (t = 22.5): background #0a1622 with a soft #13293a radial glow; dust;
 *   the star map receded (centre (960, 664), scale 0.80, about 85 % bright, orbit angle about +1.3 deg): 9 stars and their
 *   amber lines, plus the faint rays of the 7 unlabeled encounters, all converging on the empty centre (the centre
 *   word, the star numbers, the counter and all texts are gone by 22.3). The brightness timeline is enlarged: light
 *   teal line (#9fe3d6, 2.6 px + 9 px glow, soft fill below) over x 120 to 1600, baseline y 980, amplitude 150 px
 *   (y = 980 - 150 v), v(tau) = tlValue(tau) for tau in [10.625, 22.5], x = 120 + 1480 (tau - 10.625) / 11.875; one bump
 *   per encounter (16 in all), each decaying, the floor rising. The motif dot (warm gold, full brightness) sits on the
 *   playhead at its right end (1600, about 838). window.__s06Handoff holds {timeline:{x0,x1,base,amp,tau0,tau1,points},
 *   dot:{x,y}, map:{cx,cy,s}, stars:[{x,y,art}]} for s07 to read (set when t reaches the end).
 */
(function () {
  'use strict';

  var PASSAGE_FALLBACK = 'Yet the 1997 trees were seedlings, not elderly mothers. In February 2023, three researchers combed through the field evidence. They judged it too sparse, inconsistent, or ambiguous to demonstrate that shared networks are widespread. In 26 field studies, networks helped and hindered seedlings about equally often, with neutral effects predominating.';

  registerScene('s06', async function build(tl, root, ctx) {
    var u = ctx.util, gsap = window.gsap, D = ctx.duration, W = 1920, H = 1080;
    var clamp = u.clamp, lerp = u.lerp, dpr = window.devicePixelRatio || 1;
    function E(n) { return gsap.parseEase(n); }
    var eSine = E('sine.inOut'), eP2o = E('power2.out'), eP2i = E('power2.in'), eP2io = E('power2.inOut'),
      eP3o = E('power3.out'), eP3i = E('power3.in'), eP3io = E('power3.inOut'), eExpo = E('expo.out'), eBack = E('back.out(1.7)'),
      eExpoIn = E('expo.in');
    function seg(t, a, b, ease) { var x = clamp((t - a) / (b - a), 0, 1); return ease ? ease(x) : x; }
    function pulse(x, rise, decay) { return x < 0 ? 0 : (1 - Math.exp(-x / rise)) * Math.exp(-x / decay); }
    function TX(s) {
      for (var i = 0; i < ctx.texts.length; i++) if (ctx.texts[i].text === s) return ctx.texts[i];
      throw new Error('s06: text missing from the storyboard: ' + s);
    }
    var VTS = ctx.scene.visual_text || [];
    function VT(id) { for (var i = 0; i < VTS.length; i++) if (VTS[i].id === id) return VTS[i]; throw new Error('s06: visual_text missing: ' + id); }
    function hexRgb(h) { var x = parseInt(h.slice(1), 16); return [x >> 16, (x >> 8) & 255, x & 255]; }
    function mixRgb(a, b, k) { return [Math.round(lerp(a[0], b[0], k)), Math.round(lerp(a[1], b[1], k)), Math.round(lerp(a[2], b[2], k))]; }
    function rgba(c, a) { return 'rgba(' + c[0] + ',' + c[1] + ',' + c[2] + ',' + clamp(a, 0, 1).toFixed(4) + ')'; }
    function esc(s) { return s.replace(/&/g, '&amp;').replace(/</g, '&lt;'); }
    function mark(str, subs, style) {
      var out = '', pos = 0;
      subs.forEach(function (sub) {
        var i = str.indexOf(sub, pos); if (i < 0) throw new Error('s06: "' + sub + '" not in "' + str + '"');
        out += esc(str.slice(pos, i)) + (style.indexOf('EVI;') === 0 ? '<span class="evi" style="' + style.slice(4) + '">' : '<span style="' + style + '">') + esc(sub) + '</span>'; pos = i + sub.length;
      });
      return out + esc(str.slice(pos));
    }

    await Promise.all([
      document.fonts.load('400 42px "Source Serif 4 Display"'),
      document.fonts.load('italic 400 120px "Source Serif 4 Display"'),
      document.fonts.load('500 40px "Noto Sans SC"'),
      document.fonts.load('700 40px "Noto Sans SC"'),
      document.fonts.load('900 84px "Noto Sans SC"')
    ]);

    // ================= music grid (local s; storyboard cues) =================
    var BEAT = 0.625, S16 = BEAT / 4;
    var T_ACC = 1.875;     // bar 42: the remaining 37 words in a rush
    var T_FULL = 3.125;    // bar 42 beat 3: 49 lit, ring closes at about 98 %
    var T_G = 3.75;        // bar 43 (G): noticing
    var T_DIS = 6.875;     // bar 44 beat 3: the page melts
    var T_BASS = 7.5;      // bar 45: deep bass returns, dissolve done, sweep
    var T_RING = 9.375;    // bar 46: green ring slides onto the frame's evidence, slow push
    var T_STAR = 10.625;   // bar 46 beat 3: frame -> first star, centre word, counter 1
    var T_IGN = 11.25;     // bar 47 (G): star 51 ignites, f1
    var T_AM = 15.0;       // bar 49 (Am): map shrinks, titles, faster encounters
    var T_FREE = 19.375;   // unlabeled encounters every beat
    var T_8TH = 20.625;    // bar 52: every eighth, counter rolls
    var T_BACK = 21.875;   // bar 52 beat 3: pull back, timeline grows
    var T_TXTOUT = 22.3;
    function eN(t) { return clamp((u.energy(t, 0.08) - 0.6) / 0.3, 0, 1); }

    // ================= palette =================
    var C_ICE = hexRgb('#dfe9ff'), C_FROST = hexRgb('#cfe6ff'), C_COLDW = hexRgb('#8fa6c6'), C_WARMW = hexRgb('#fff3df'),
      C_FLARE = hexRgb('#fff1c9'), C_GOLD = hexRgb('#ffcf70'), C_AMBER = hexRgb('#ffb547'), C_PALE = hexRgb('#ffe2b0'),
      C_GREEN = hexRgb('#5fd38a'), C_TEAL = hexRgb('#3cc6a8'), C_TLINE = hexRgb('#9fe3d6');

    // sprites (s05's recipe, so the beads match exactly at the cut)
    function makeSprite(rgb, core) {
      var R = Math.round(24 * dpr), c = document.createElement('canvas'); c.width = c.height = R * 2;
      var g = c.getContext('2d'), gr = g.createRadialGradient(R, R, 0, R, R, R);
      gr.addColorStop(0, rgba(mixRgb(rgb, [255, 255, 255], core), 1)); gr.addColorStop(0.18, rgba(rgb, 0.95));
      gr.addColorStop(0.42, rgba(rgb, 0.32)); gr.addColorStop(0.7, rgba(rgb, 0.08)); gr.addColorStop(1, rgba(rgb, 0));
      g.fillStyle = gr; g.fillRect(0, 0, R * 2, R * 2); return c;
    }
    var SPR_W = makeSprite(C_FLARE, 0.6), SPR_SOFT_GOLD = makeSprite([255, 196, 110], 0.1), SPR_AMBER = makeSprite([255, 166, 64], 0.55),
      SPR_ICE = makeSprite([170, 205, 255], 0.5), SPR_TEAL = makeSprite([70, 190, 170], 0.3), SPR_GREEN = makeSprite(C_GREEN, 0.4);
    function glowDisc(g, x, y, r, rgb, a) {
      if (a <= 0.003 || r <= 0.3) return;
      var gr = g.createRadialGradient(x, y, 0, x, y, r);
      gr.addColorStop(0, rgba(rgb, a)); gr.addColorStop(0.35, rgba(rgb, a * 0.45)); gr.addColorStop(1, rgba(rgb, 0));
      g.fillStyle = gr; g.fillRect(x - r, y - r, r * 2, r * 2);
    }

    // ================= the passage: exactly s05's layout =================
    var mc = document.createElement('canvas').getContext('2d');
    var passage = VT('passage').text || PASSAGE_FALLBACK;
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
    var PITCH = 72, BL_LEFT = Math.round(960 - MAXW / 2), NL = PL.length;   // s05's rule: the widest line is centred
    var S5 = window.__s05Block;   // s05 (built just before, as our neighbour) is the reference when it is there
    if (S5 && S5.wrap === WRAP && S5.lines && S5.lines.length === NL && isFinite(S5.left) && S5.left !== BL_LEFT) { console.warn('s06: taking the page left edge from s05 (' + S5.left + ' vs ' + BL_LEFT + ')'); BL_LEFT = S5.left; }
    var INK = 0, EVI = null, WORDS = [];
    var BLOCK = PL.map(function (s, i) {
      var spans = [], pos = 0, ink = 0, y = 540 + (i - (NL - 1) / 2) * PITCH;
      s.split(' ').forEach(function (w) {
        var x0 = mc.measureText(s.slice(0, pos)).width, x1 = mc.measureText(s.slice(0, pos + w.length)).width;
        var isE = /^evidence/.test(w);
        if (isE) EVI = { line: i, x0: BL_LEFT + x0, x1: BL_LEFT + x1, pre: s.slice(0, pos), word: w };
        else { spans.push([x0 + 2, x1 - 2]); ink += x1 - x0 - 4; }
        WORDS.push({ text: w, line: i, x: BL_LEFT + x0, w: x1 - x0, y: y, baseline: y + XH / 2, evi: isE });
        pos += w.length + 1;
      });
      INK += ink;
      return { y: y, baseline: y + XH / 2, width: mc.measureText(s).width, text: s, spans: spans, ink: ink };
    });
    function findDot(font, sz) {   // rasterise "i" large and find its dot (centre offset from the pen position, radius)
      var S = 8, c = document.createElement('canvas'); c.width = 80 * S * sz / 42; c.height = 100 * S * sz / 42;
      c.width = Math.ceil(c.width); c.height = Math.ceil(c.height);
      var g = c.getContext('2d'); g.font = font.replace(/\d+px/, (sz * S) + 'px'); g.textBaseline = 'alphabetic'; g.fillStyle = '#fff';
      var BX = Math.round(16 * S * sz / 42), BY = Math.round(75 * S * sz / 42); g.fillText('i', BX, BY);
      var d = g.getImageData(0, 0, c.width, c.height).data, rows = [];
      for (var y = 0; y < c.height; y++) { var on = 0, sx = 0; for (var x = 0; x < c.width; x++) { var a = d[(y * c.width + x) * 4 + 3]; if (a > 100) { on++; sx += x; } } rows.push([on, on ? sx / on : 0]); }
      var top = 0; while (top < rows.length && !rows[top][0]) top++;
      var bot = top; while (bot < rows.length && rows[bot][0]) bot++;
      var cx = 0, n = 0; for (var r = top; r < bot; r++) { cx += rows[r][1]; n++; }
      return { dx: (cx / Math.max(1, n) - BX) / S, dy: (BY - (top + bot) / 2) / S, r: (bot - top) / S / 2 };
    }
    if (!EVI) throw new Error('s06: evidence not found in the passage');
    var DOT = findDot(PFONT, PFS);
    mc.font = PFONT;
    EVI.dotX = EVI.x0 + mc.measureText('ev').width + DOT.dx;
    EVI.dotY = BLOCK[EVI.line].baseline - DOT.dy;
    EVI.dotR = DOT.r;
    EVI.cx = (EVI.x0 + EVI.x1) / 2 - 4; EVI.cy = BLOCK[EVI.line].y - 2;
    EVI.dotless = EVI.word.replace('i', 'ı');
    if (window.__s05Block && window.__s05Block.evidence && Math.abs(window.__s05Block.evidence.dotX - EVI.dotX) > 0.5) console.warn('s06: passage layout differs from s05');

    // reading order and lighting times: one per 16th in bar 41 (12 words), the remaining 37 accelerate through bar 42
    var LIT = WORDS.filter(function (w) { return !w.evi; });
    (function () {
      LIT.forEach(function (w, j) {
        if (j < 12) w.t = j * S16;
      });
      var n2 = LIT.length - 12, tt = T_ACC, ds = [], sum = 0;
      for (var j = 0; j < n2 - 1; j++) { var d = 0.02 + 0.058 * Math.pow(1 - j / (n2 - 2), 4.4); ds.push(d); sum += d; }
      var k = (3.0 - T_ACC) / sum;
      for (var m = 0; m < n2; m++) { LIT[12 + m].t = tt; if (m < n2 - 1) tt += ds[m] * k; }
      LIT.forEach(function (w, j) {
        var fl = j < 12 ? 0.5 : lerp(0.42, 0.125, clamp((w.t - T_ACC) / (3.0 - T_ACC), 0, 1));
        w.land = w.t + fl; w.j = j;
        w.cx = w.x + w.w / 2; w.cy = w.y - 4;
        w.lift = 110 + 90 * u.hash(j, 's06mote');
      });
    })();

    // ================= s05's beads, replayed from its own seeds =================
    var BEADS = [];
    (function () {
      var R = u.rand('s05:river');
      for (var i = 0; i < 3000; i++) {
        R.gauss(); R(); R.range(0.8, 1.2); R.range(0.75, 2.1); R(); R(); R(); R.range(0.5, 1.6); R();
        var a = R.range(0.45, 1); R();
        var v = u.hash(i, 's05lu') * INK, li = 0;
        while (li < NL - 1 && v > BLOCK[li].ink) { v -= BLOCK[li].ink; li++; }
        var sp = BLOCK[li].spans, k = 0;
        while (k < sp.length - 1 && v > sp[k][1] - sp[k][0]) { v -= sp[k][1] - sp[k][0]; k++; }
        var tx = sp[k][0] + clamp(v, 0, sp[k][1] - sp[k][0]), lj = (u.hash(i, 's05lj') - 0.5) * 12;
        BEADS.push({ x: BL_LEFT + tx, y: BLOCK[li].y + lj * 0.25, r: 1.4 + 0.6 * a, a: (0.5 + 0.4 * a) * 0.7 });
      }
    })();

    // ================= camera of the page (A) =================
    // screen = P + z (world - P) + O ; P = evidence centre
    function camA(t) {
      var k = eP2io(seg(t, 0, T_ACC));
      return { ox: -130 * k, oy: 30 * k, z: 1 + 0.05 * eSine(seg(t, T_G, 6.8)) + 0.035 * eP2i(seg(t, T_DIS, T_BASS)) };
    }
    function scrA(wx, wy, c) { return [EVI.cx + c.z * (wx - EVI.cx) + c.ox, EVI.cy + c.z * (wy - EVI.cy) + c.oy]; }

    // coverage ring (world coordinates; on screen at about (1712, 590), r 108)
    var RING = { x: 1842, y: 560, r: 108 };
    var GAPC = Math.atan2(EVI.cy - RING.y, EVI.x1 - RING.x);    // the 2 % gap faces evidence
    var GAPW = 0.02 * Math.PI * 2;
    var RA0 = GAPC + GAPW / 2;                                  // arc starts just past the gap, clockwise
    function ringFill(t) {     // 0..1 of 98 %
      var s = 0;
      for (var i = 0; i < LIT.length; i++) { var w = LIT[i]; if (t > w.land) s += eP2o(seg(t, w.land, w.land + (w.j < 12 ? 0.16 : 0.08))); }
      return s / LIT.length;
    }
    function ringBounce(t) { var x = t - T_FULL; return x < 0 ? 0 : 0.016 * Math.sin(x * 26) * Math.exp(-x / 0.16); }

    // ================= the frame (B) =================
    var FX = 240, FY = 135, FW = 1440, FH = 810, FOX = FX + FW / 2, FOY = FY + FH / 2, PERSP = 1800;
    var FK = FW / 1920;   // frame px (1920 scale) -> layout px
    var FR_I = { x: 1484.25 * FK, y: 527.75 * FK, r: 7.5 * FK };              // the i dot of evidence in the frame
    var FR_E = { x0: 1360 * FK, x1: 1806 * FK, y0: 521 * FK, y1: 598 * FK };    // "evidence" (without the period)
    var FR_Z = { x0: 1487.5 * FK, x1: 1653 * FK, y0: 642 * FK, y1: 708 * FK };  // 证据。
    function frameState(t) {
      var FST = {};
      var settle = 1 + 0.06 * (1 - eP3o(seg(t, T_DIS, T_BASS + 0.1)));
      var push = 0.035 * eSine(seg(t, T_RING, T_STAR));
      var sh = seg(t, T_STAR, T_IGN);
      var st = starScreen(0, T_IGN);
      FST.s = (settle + push) * lerp(1, 0.012, eP2i(sh));
      FST.tx = (st.x - FOX) * eP3i(sh); FST.ty = (st.y - FOY) * eP3i(sh);
      FST.rot = -4 * (1 - eP2io(sh));
      return FST;
    }
    function frameProject(lx, ly, f) {
      var a = f.rot * Math.PI / 180, px = (lx - FW / 2) * f.s, py = (ly - FH / 2) * f.s;
      var x1 = px * Math.cos(a), z1 = -px * Math.sin(a), w = 1 - z1 / PERSP;
      return [FOX + f.tx + x1 / w, FOY + f.ty + py / w, f.s / w];
    }

    // ================= the star map (C) =================
    function mapState(t) {
      var MAP = {}, k1 = eP3io(seg(t, T_AM, T_AM + 0.6)), k2 = eP2io(seg(t, T_BACK, D));
      MAP.cx = 960; MAP.cy = lerp(lerp(500, 652, k1), 664, k2); MAP.s = lerp(lerp(1, 0.86, k1), 0.8, k2);
      MAP.th = 8 * Math.PI / 180 * Math.sin(0.42 * (t - 15.4));
      MAP.a = 1 - 0.15 * k2;
      return MAP;
    }
    var FOCAL = 1400, ERX = 560, ERY = 270;
    function project(mx, my, mz, M) {   // map units (centred on the word) -> screen
      var c = Math.cos(M.th), s = Math.sin(M.th);
      var x = mx * c + mz * s, z = -mx * s + mz * c, k = FOCAL / (FOCAL + z);
      return [M.cx + M.s * x * k, M.cy + M.s * my * k, k, z];
    }

    // fragments (visual_text f1..f8) and the stars
    var ARTS = { f1: 233, f2: 309, f3: 195, f4: 214, f5: 328, f6: 347, f7: 252, f8: 290 };
    var FR = ['f1', 'f2', 'f3', 'f4', 'f5', 'f6', 'f7', 'f8'].map(function (id) {
      var v = VT(id);
      return { id: id, text: v.text, art: v.article, slot: v.slot, tIn: v.in, tOut: v.out, ang: ARTS[id] };
    });
    var STARS = [{ art: '51', ang: 271, born: T_IGN, frag: null }];
    FR.forEach(function (f) { STARS.push({ art: f.art, ang: f.ang, born: f.tOut + 0.55, frag: f }); f.star = STARS[STARS.length - 1]; });
    STARS.forEach(function (s, i) {
      var a = s.ang * Math.PI / 180;
      s.mx = ERX * Math.cos(a); s.my = ERY * Math.sin(a); s.mz = (u.hash(i, 's06z') - 0.5) * 220;
      s.ph = u.hash(i, 's06ph') * 6.283; s.i = i;
    });
    // arrivals at the centre (each = one encounter): video, the 8 fragments (head lands one beat after the fragment)
    // and the unlabeled ones (every beat from 19.375, every eighth from 20.625; each travels one eighth)
    var TYPE = 0.32;   // a fragment types in over 0.32 s; its line leaves once evidence is typed and lands on the next beat
    FR.forEach(function (f) {
      var nc = f.text.replace(/\s/g, '').length, ie = f.text.indexOf('evidence') + 'evidence'.length, ce = f.text.slice(0, ie).replace(/\s/g, '').length;
      f.launch = f.tIn + 0.04 + TYPE * ce / nc; f.arrive = f.tIn + 0.625;
    });
    var METEOR_L = [19.375, 20.0, 20.625, 20.9375, 21.25, 21.5625, 21.875];   // the last one lands on bar 52 beat 3.5
    var METEORS = METEOR_L.map(function (L, i) {
      var angs = [200, 338, 158, 22, 222, 312, 180, 2], a = angs[i] * Math.PI / 180;
      return { launch: L, arrive: L + 0.3125, ang: a, ox: 960 + 1250 * Math.cos(a), oy: 560 + 900 * Math.sin(a), i: i };
    });
    var ARR = [T_STAR].concat(FR.map(function (f) { return f.arrive; }), METEORS.map(function (m) { return m.arrive; }));
    function nSmooth(t) { var n = 0; for (var i = 0; i < ARR.length; i++) if (t >= ARR[i]) n += i === 0 ? 1 : eP2o(seg(t, ARR[i], ARR[i] + 0.3)); return n; }
    function centreLook(t) {    // brightness 0.3 (1st) .. 1 (9th); warmth ice > pale gold > warm gold; extra bloom after
      var n = nSmooth(t), k = clamp((n - 1) / 8, 0, 1), ext = clamp((n - 9) / 8, 0, 1);
      var col = k < 0.85 ? mixRgb(C_ICE, C_PALE, k / 0.85) : mixRgb(C_PALE, C_GOLD, (k - 0.85) / 0.15);
      return { b: 0.3 + 0.7 * k, k: k, ext: ext, col: col };
    }

    // centre word geometry (120 px italic, dotless i; the dot is the motif light)
    var CFONT = 'italic 400 120px "Source Serif 4 Display"', CWORD = 'evıdence';
    mc.font = CFONT;
    var CM = mc.measureText(CWORD), CW = CM.width, CA = CM.actualBoundingBoxAscent, CDs = CM.actualBoundingBoxDescent;
    var CEV = mc.measureText('ev').width, CDOT = findDot(CFONT, 120);
    function centreGeo(M) {   // pen position and ı dot on screen
      var s = M.s, x0 = M.cx - CW * s / 2, base = M.cy + (CA - CDs) * s / 2;
      return { s: s, x0: x0, base: base, dx: x0 + (CEV + CDOT.dx) * s, dy: base - CDOT.dy * s, dr: CDOT.r * s };
    }

    function starScreen(i, t) {
      var S = STARS[i], M = mapState(t), p = project(S.mx, S.my, S.mz, M);
      return { x: p[0], y: p[1], k: p[2], z: p[3] };
    }

    // ================= layers =================
    var bg = u.el('div', { cls: 'fill', parent: root, style: { background: '#0a1622' } });
    var bgA = u.el('div', { cls: 'fill', parent: root, style: { background: 'radial-gradient(ellipse 60% 55% at 46% 50%, #10283a 0%, rgba(10,22,34,0) 72%)', opacity: 0 } });
    var bgG = u.el('div', { cls: 'fill', parent: root, style: { background: 'radial-gradient(ellipse 62% 58% at 50% 50%, #133a2e 0%, rgba(12,30,28,0.6) 45%, rgba(10,22,34,0) 78%)', opacity: 0 } });
    var bgM = u.el('div', { cls: 'fill', parent: root, style: { background: 'radial-gradient(ellipse 58% 52% at 50% 50%, #13293a 0%, rgba(10,22,34,0) 74%)', opacity: 0 } });
    function fresh(fn) { return function (g, t) { g.save(); try { fn(g, t); } finally { g.restore(); } }; }
    var back = u.canvas(root, fresh(function (g, t) { drawBack(g, t); }));
    var pageGroup = u.el('div', { cls: 'fill', parent: root, style: { visibility: 'visible' } });
    var world = u.el('div', { cls: 'fill', parent: pageGroup, style: { transformOrigin: '0px 0px' } });
    var page = u.el('div', { cls: 'abs', parent: world, style: { left: '180px', top: '260px', width: '1560px', height: '560px', borderRadius: '28px',
      background: 'linear-gradient(160deg, rgba(24,46,64,.46), rgba(14,30,44,.40))', border: '1.5px solid rgba(190,225,235,.10)',
      boxShadow: '0 30px 80px rgba(0,0,0,.35), inset 0 1px 0 rgba(220,240,250,.06)' } });
    var pass = u.canvas(pageGroup, fresh(function (g, t) { drawPassage(g, t); }));
    var frameHalo = u.el('div', { cls: 'abs', parent: root, style: { left: (FX - 120) + 'px', top: (FY - 100) + 'px', width: (FW + 240) + 'px', height: (FH + 200) + 'px',
      background: 'radial-gradient(ellipse 50% 50% at 50% 50%, rgba(95,211,138,.20) 0%, rgba(60,198,168,.08) 45%, rgba(0,0,0,0) 70%)', opacity: 0 } });
    var frameGroup = u.el('div', { cls: 'abs', parent: root, style: { left: FX + 'px', top: FY + 'px', width: FW + 'px', height: FH + 'px', transformOrigin: '50% 50%', opacity: 0, visibility: 'hidden' } });
    var frameInner = u.el('div', { cls: 'fill', parent: frameGroup, style: { width: FW + 'px', height: FH + 'px', borderRadius: '16px', overflow: 'hidden',
      boxShadow: '0 40px 110px rgba(0,0,0,.55), 0 0 0 1.5px rgba(160,235,200,.22)' } });
    u.image('assets/frames/51_86.5.png', { parent: frameInner, x: 0, y: 0, anchor: 'top-left', width: FW, height: FH });
    function frameGlow(b, rgb) {
      var pad = 46;
      return u.el('div', { cls: 'abs', parent: frameInner, style: { left: (b.x0 - pad) + 'px', top: (b.y0 - pad * 0.7) + 'px', width: (b.x1 - b.x0 + pad * 2) + 'px', height: (b.y1 - b.y0 + pad * 1.4) + 'px',
        background: 'radial-gradient(ellipse 50% 50% at 50% 50%, rgba(' + rgb + ',.55) 0%, rgba(' + rgb + ',.18) 45%, rgba(0,0,0,0) 72%)', mixBlendMode: 'screen', opacity: 0 } });
    }
    var glowE = frameGlow(FR_E, '255,236,190'), glowZ = frameGlow(FR_Z, '200,255,225');
    var bassFlash = u.el('div', { cls: 'fill', parent: frameInner, style: { width: FW + 'px', height: FH + 'px', mixBlendMode: 'screen', opacity: 0,
      background: 'radial-gradient(ellipse 60% 60% at 77% 49%, rgba(240,255,236,.55) 0%, rgba(160,240,200,.18) 40%, rgba(0,0,0,0) 75%)' } });
    var sweep = u.el('div', { cls: 'abs', parent: frameInner, style: { left: '0px', top: '-10%', width: '520px', height: '120%', mixBlendMode: 'screen',
      background: 'linear-gradient(90deg, rgba(255,250,235,0) 0%, rgba(255,246,222,.10) 30%, rgba(255,250,236,.42) 50%, rgba(255,246,222,.10) 70%, rgba(255,250,235,0) 100%)', transform: 'translateX(-700px) skewX(-14deg)' } });
    var fx = u.canvas(root, fresh(function (g, t) { drawFx(g, t); }));
    var scrimTop = u.el('div', { cls: 'fill', parent: root, style: { background: 'linear-gradient(180deg, rgba(6,14,22,.86) 0%, rgba(6,14,22,.62) 20%, rgba(6,14,22,.2) 32%, rgba(6,14,22,0) 40%)', opacity: 0 } });
    var hud = u.el('div', { cls: 'fill', parent: root });

    // ---- background tones ----
    tl.fromTo(bgA, { opacity: 0 }, { opacity: 0.8, duration: T_FULL, ease: 'power1.inOut' }, 0);
    tl.to(bgA, { opacity: 0, duration: 0.8, ease: 'power2.in' }, T_DIS);
    tl.fromTo(bgG, { opacity: 0 }, { opacity: 1, duration: 0.7, ease: 'power2.out' }, T_DIS);
    tl.to(bgG, { opacity: 0, duration: 0.9, ease: 'power2.inOut' }, T_STAR);
    tl.fromTo(bgM, { opacity: 0 }, { opacity: 1, duration: 1.2, ease: 'power2.inOut' }, T_STAR);
    tl.fromTo(frameHalo, { opacity: 0 }, { opacity: 1, duration: 0.6, ease: 'power2.out' }, T_DIS + 0.2);
    tl.to(frameHalo, { opacity: 0, duration: 0.5, ease: 'power2.in' }, T_STAR);

    // ---- the page: narrows during the truck, melts at the dissolve ----
    tl.fromTo(page, { width: 1560 }, { width: 1460, duration: T_ACC, ease: 'power2.inOut' }, 0);
    var liqPage = u.liquid(pageGroup, { scale: 60, freq: 0.009, octaves: 2, seed: 23, drift: 40, speed: 0.5 });
    tl.fromTo(liqPage.state, { amount: 0 }, { amount: 1, duration: BEAT, ease: 'power2.in' }, T_DIS);
    var fiDis = frameProject(FR_I.x, FR_I.y, frameState(T_DIS));
    u.onFrame(function (t) {   // the page melts away from the same point the frame opens from (only during the dissolve)
      var p = eP2io(seg(t, T_DIS, T_BASS)), m = '';
      if (p > 0 && p < 1) { var R = p * 2100, sf = 360; m = 'radial-gradient(circle at ' + fiDis[0].toFixed(1) + 'px ' + fiDis[1].toFixed(1) + 'px, transparent ' + Math.max(0, R - sf).toFixed(1) + 'px, #000 ' + R.toFixed(1) + 'px)'; }
      if (pageGroup.__m !== m) { pageGroup.style.webkitMaskImage = m; pageGroup.style.maskImage = m; pageGroup.__m = m; }
    });
    tl.fromTo(pageGroup, { opacity: 1 }, { opacity: 0, duration: BEAT - 0.06, ease: 'power2.in' }, T_DIS + 0.06);
    tl.set(pageGroup, { visibility: 'hidden' }, T_BASS + 0.01);
    tl.set(liqPage.state, { amount: 0 }, T_BASS + 0.02);
    tl.fromTo(pass.state, { opacity: 1 }, { opacity: 0, duration: 0.01 }, T_BASS + 0.01);

    // ---- the frame: liquid + iris in from the i of evidence ----
    var liqFrame = u.liquid(frameInner, { scale: 60, freq: 0.008, octaves: 2, seed: 41, drift: 30, speed: 0.5 });
    var iris = u.maskReveal(frameGroup, { type: 'radial', x: FR_I.x, y: FR_I.y, soft: 320 });
    tl.set(frameGroup, { visibility: 'visible' }, T_DIS);
    tl.fromTo(frameGroup, { opacity: 0 }, { opacity: 1, duration: 0.5, ease: 'power2.out' }, T_DIS);
    tl.fromTo(liqFrame.state, { amount: 1 }, { amount: 0, duration: BEAT, ease: 'power2.out' }, T_DIS);
    tl.fromTo(iris.state, { p: 0 }, { p: 1, duration: BEAT, ease: 'power2.inOut' }, T_DIS);
    tl.to(frameGroup, { opacity: 0, duration: 0.2, ease: 'power2.in' }, T_IGN - 0.2);
    tl.set(frameGroup, { visibility: 'hidden' }, T_IGN);
    // sweep (bar 45 downbeat, 0.9 s) and the words it lights
    tl.fromTo(bassFlash, { opacity: 0 }, { opacity: 1, duration: 0.05, ease: 'none' }, T_BASS - 0.03);
    tl.to(bassFlash, { opacity: 0, duration: 0.7, ease: 'power2.out' }, T_BASS + 0.02);
    tl.fromTo(sweep, { x: -700 }, { x: FW + 200, duration: 0.9, ease: 'power1.inOut' }, T_BASS);
    function sweepAt(lx) { // time the sweep centre crosses frame x (inverse of the power1.inOut tween, by search)
      var lo = 0, hi = 1, e1 = E('power1.inOut');
      for (var i = 0; i < 30; i++) { var m = (lo + hi) / 2; if (-700 + (FW + 900) * e1(m) + 260 < lx) lo = m; else hi = m; }
      return T_BASS + 0.9 * lo;
    }
    var tE = sweepAt((FR_E.x0 + FR_E.x1) / 2), tZ = sweepAt((FR_Z.x0 + FR_Z.x1) / 2);
    tl.fromTo(glowE, { opacity: 0 }, { opacity: 1, duration: 0.18, ease: 'power2.out' }, tE - 0.12);
    tl.to(glowE, { opacity: 0.32, duration: 0.9, ease: 'power2.inOut' }, tE + 0.1);
    tl.fromTo(glowZ, { opacity: 0 }, { opacity: 1, duration: 0.18, ease: 'power2.out' }, tZ - 0.1);
    tl.to(glowZ, { opacity: 0.22, duration: 0.9, ease: 'power2.inOut' }, tZ + 0.12);

    // ================= HUD text =================
    var tx = {
      h1: TX('每 50 个词，最多 1 个生词，'), src1: TX('Hu & Nation, 2000 · Schmidt, 1990'), l1: TX('读起来才轻松。'),
      pct: TX('约 98%'), en: TX('noticing'), vid: TX('第 51 篇《林下之网》精读视频'), meet: TX('遇见'),
      h2: TX('一个生词，在上下文里遇到约 10 次，'), h3: TX('才会有明显收获；'), l2: TX('想真正掌握，往往还要更多次。'), src2: TX('Webb, 2007')
    };
    var GOLD_HL = 'color:#ffcf70;text-shadow:0 0 22px rgba(255,190,90,.45),0 0 60px rgba(255,170,70,.2)';
    var TXT_L = BL_LEFT - 130;
    var h1 = u.text(hud, '', 'headline', { x: TXT_L, y: 62, anchor: 'top-left', html: mark(tx.h1.text, ['最多 1 个生词'], GOLD_HL), style: { fontSize: '84px', color: '#fff3df', textShadow: '0 0 26px rgba(255,226,176,.18)' } });
    var l1 = u.text(hud, tx.l1.text, 'line', { x: TXT_L + 2, y: 180, anchor: 'top-left', style: { fontSize: '54px', color: '#d6efe6', textShadow: '0 0 18px rgba(60,198,168,.25)' } });
    function srcText(s) { return u.text(hud, s, 'source', { x: 1856, y: 1034, anchor: 'bottom-right', style: { color: '#9fc4b8', opacity: 0 } }); }
    var src1 = srcText(tx.src1.text), src2 = srcText(tx.src2.text);
    // noticing: pinned above evidence (screen position of the word is fixed: the camera pushes about it)
    var NOT_X = EVI.cx - 130, NOT_Y = 228;
    var enT = u.text(hud, tx.en.text, 'en', { x: NOT_X, y: NOT_Y, style: { fontSize: '72px', color: '#7fe3a6', textShadow: '0 0 24px rgba(95,211,138,.55), 0 0 60px rgba(95,211,138,.22)' } });
    // 约 98 %: rides the ring (positioned per frame), pops inside it
    var pctBox = u.el('div', { cls: 'abs', parent: hud, style: { left: '0px', top: '0px' } });
    var pct = u.el('div', { cls: 'abs', parent: pctBox, html: '<span style="display:block;font-size:40px;line-height:44px;font-weight:700;color:#cfe6e0;letter-spacing:.06em">约</span><span style="font-size:0px;line-height:0"> </span><span class="tnum" style="display:block;font-size:64px;line-height:66px;font-weight:900;color:#ffcf70;text-shadow:0 0 24px rgba(255,190,90,.5)">98%</span>',
      style: { fontFamily: 'var(--sans)', whiteSpace: 'pre', textAlign: 'center' } });
    gsap.set(pct, { xPercent: -50, yPercent: -50 });
    // the video label (bottom left)
    var vid = u.text(hud, tx.vid.text, 'small', { x: 64, y: 1040, anchor: 'bottom-left', style: { color: '#bfe3d3', letterSpacing: '.08em', paddingLeft: '30px' } });
    var vidTri = u.el('div', { cls: 'abs', parent: vid, style: { left: '2px', top: '50%', width: '0px', height: '0px', marginTop: '-9px', borderLeft: '16px solid #5fd38a', borderTop: '9px solid transparent', borderBottom: '9px solid transparent', opacity: 0 } });
    // counter (top right): 遇见 + rolling number
    var ctrPanel = u.el('div', { cls: 'abs', parent: hud, style: { left: '1740px', top: '32px', width: '140px', height: '178px', borderRadius: '22px',
      background: 'linear-gradient(160deg, rgba(20,40,56,.62), rgba(10,22,34,.55))', border: '1.5px solid rgba(255,207,112,.26)', boxShadow: '0 20px 50px rgba(0,0,0,.35), inset 0 1px 0 rgba(255,240,210,.08)', opacity: 0 } });
    var meet = u.text(hud, tx.meet.text, 'small', { x: 1812, y: 68, anchor: 'center', style: { color: '#cfe6e0', fontWeight: 700, letterSpacing: '.14em', paddingLeft: '.14em', opacity: 0 } });
    var numWin = u.el('div', { cls: 'abs', parent: hud, style: { left: '1756px', top: '120px', width: '108px', height: '82px', overflow: 'hidden', opacity: 0 } });
    function numEl() { return u.el('div', { cls: 'abs tnum', parent: numWin, style: { left: '0px', top: '0px', width: '108px', fontFamily: 'var(--sans)', fontWeight: 900, fontSize: '72px', lineHeight: '82px',
      color: '#ffcf70', textAlign: 'center', whiteSpace: 'pre', textShadow: '0 0 24px rgba(255,190,90,.5)' } }); }
    var numA = numEl(), numB = numEl();
    // phase C titles
    var h2 = u.text(hud, '', 'headline', { x: 120, y: 50, anchor: 'top-left', html: mark(tx.h2.text, ['约 10 次'], GOLD_HL), style: { fontSize: '74px', color: '#fff3df', textShadow: '0 0 26px rgba(255,226,176,.18)' } });
    var h3 = u.text(hud, tx.h3.text, 'headline', { x: 120, y: 166, anchor: 'top-left', style: { fontSize: '74px', color: '#fff3df', textShadow: '0 0 26px rgba(255,226,176,.18)' } });
    var l2 = u.text(hud, '', 'line', { x: 122, y: 274, anchor: 'top-left', html: mark(tx.l2.text, ['更多次'], 'color:#ffcf70'), style: { fontSize: '52px', color: '#d6efe6', textShadow: '0 0 18px rgba(0,0,0,.6)' } });

    var h1Ch = u.splitChars(h1), l1Ch = u.splitChars(l1), enCh = u.splitChars(enT), vidCh = u.splitChars(vid),
      h2Ch = u.splitChars(h2), h3Ch = u.splitChars(h3), l2Ch = u.splitChars(l2);
    gsap.set([h1Ch, l1Ch, enCh, vidCh, h2Ch, h3Ch, l2Ch], { opacity: 0 });
    gsap.set(pct, { opacity: 0 });

    function pop(chars, at, st) {
      tl.fromTo(chars, { opacity: 0, filter: 'blur(12px)' }, { opacity: 1, filter: 'blur(0px)', duration: 0.45, ease: 'power2.out', stagger: st }, at);
      tl.fromTo(chars, { y: 46, scale: 0.72 }, { y: 0, scale: 1, duration: 0.7, ease: 'back.out(1.8)', stagger: st }, at);
    }
    function rise(chars, at, st) {
      tl.fromTo(chars, { opacity: 0, y: 26, filter: 'blur(7px)' }, { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.55, ease: 'power3.out', stagger: st }, at);
    }
    function outUp(chars, at, dur) { tl.to(chars, { opacity: 0, y: -30, filter: 'blur(9px)', duration: dur, ease: 'power2.in', stagger: 0.004 }, at - dur - 0.004 * (chars.length - 1)); }
    function outDown(chars, at, dur) { tl.to(chars, { opacity: 0, y: 22, filter: 'blur(9px)', duration: dur, ease: 'power2.in', stagger: 0.004 }, at - dur - 0.004 * (chars.length - 1)); }
    function srcIn(el, at) { tl.fromTo(el, { opacity: 0, x: 26 }, { opacity: 1, x: 0, duration: 0.6, ease: 'power3.out' }, at); }
    function srcOut(el, at) { tl.to(el, { opacity: 0, duration: 0.3, ease: 'power2.in' }, at - 0.3); }

    // A
    pop(h1Ch, tx.h1.in, 0.03);
    srcIn(src1, tx.src1.in);
    rise(l1Ch, tx.l1.in, 0.035);
    tl.fromTo(pct, { opacity: 0, scale: 1.6, filter: 'blur(8px)' }, { opacity: 1, scale: 1, filter: 'blur(0px)', duration: 0.45, ease: 'power3.out' }, tx.pct.in);
    tl.fromTo(enCh, { opacity: 0, y: 18, filter: 'blur(8px)' }, { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.6, ease: 'power3.out', stagger: 0.035 }, tx.en.in + 0.06);
    outUp(h1Ch, tx.h1.out, 0.3); outDown(l1Ch, tx.l1.out, 0.3); outUp(enCh, tx.en.out, 0.3);
    tl.to(pct, { opacity: 0, scale: 1.12, filter: 'blur(6px)', duration: 0.3, ease: 'power2.in' }, tx.pct.out - 0.3);
    srcOut(src1, tx.src1.out);
    // B
    rise(vidCh, tx.vid.in, 0.02);
    tl.fromTo(vidTri, { opacity: 0, x: -10 }, { opacity: 1, x: 0, duration: 0.4, ease: 'power3.out' }, tx.vid.in);
    tl.to(vidTri, { opacity: 0, duration: 0.25, ease: 'power2.in' }, tx.vid.out - 0.25);
    tl.to(vidCh, { opacity: 0, duration: 0.25, ease: 'power2.in', stagger: 0.003 }, tx.vid.out - 0.25 - 0.003 * (vidCh.length - 1));
    // counter
    tl.fromTo(ctrPanel, { opacity: 0, y: -14 }, { opacity: 1, y: 0, duration: 0.5, ease: 'power3.out' }, tx.meet.in);
    tl.fromTo(meet, { opacity: 0 }, { opacity: 1, duration: 0.4, ease: 'power2.out' }, tx.meet.in);
    tl.fromTo(numWin, { opacity: 0 }, { opacity: 1, duration: 0.4, ease: 'power2.out' }, tx.meet.in);
    tl.to([ctrPanel, meet, numWin], { opacity: 0, duration: 0.3, ease: 'power2.in' }, tx.meet.out - 0.3);
    // C titles
    tl.fromTo(scrimTop, { opacity: 0 }, { opacity: 1, duration: 0.8, ease: 'power2.out' }, tx.h2.in - 0.2);
    tl.to(scrimTop, { opacity: 0, duration: 0.5, ease: 'power2.in' }, tx.h2.out - 0.5);
    pop(h2Ch, tx.h2.in, 0.026);
    pop(h3Ch, tx.h3.in, 0.04);
    rise(l2Ch, tx.l2.in, 0.03);
    srcIn(src2, tx.src2.in);
    outUp(h2Ch, tx.h2.out, 0.3); outUp(h3Ch, tx.h3.out, 0.3); outDown(l2Ch, tx.l2.out, 0.3);
    srcOut(src2, tx.src2.out);

    // ================= fragments (DOM, slots A B C) =================
    var SLOT = { A: { x: 80, y: 770, max: 656 }, B: { x: 1100, y: 770, max: 656 }, C: { x: 560, y: 910, max: 716, center: true } };
    var rootRect = root.getBoundingClientRect();
    FR.forEach(function (f) {
      var S = SLOT[f.slot];
      var box = u.el('div', { cls: 'abs', parent: hud, style: { left: S.x + 'px', top: '0px', visibility: 'visible' } });
      var badge = u.el('div', { cls: 'abs', parent: box, style: { left: '0px', top: '0px', width: '64px', height: '64px', borderRadius: '50%', border: '2px solid rgba(255,181,71,.75)',
        background: 'radial-gradient(circle at 50% 40%, rgba(60,40,18,.85), rgba(14,22,30,.85))', boxShadow: '0 0 18px rgba(255,181,71,.35)' } });
      var num = u.el('div', { cls: 'abs tnum', parent: badge, text: f.art, style: { left: '0px', top: '0px', width: '60px', height: '60px', lineHeight: '60px', textAlign: 'center',
        fontFamily: 'var(--sans)', fontWeight: 700, fontSize: '40px', color: '#ffdca0', letterSpacing: '0' } });
      var txt = u.el('div', { cls: 'abs', parent: box, html: mark(f.text, ['evidence'], 'EVI;color:#ffb547;text-shadow:0 0 18px rgba(255,181,71,.6),0 0 44px rgba(255,160,60,.25)'),
        style: { left: '84px', top: '0px', fontFamily: 'var(--serif-en)', fontWeight: 400, fontSize: '44px', lineHeight: '52px', color: '#dfe9ff', whiteSpace: 'nowrap', textShadow: '0 0 16px rgba(0,0,0,.7)' } });
      if (txt.offsetWidth > S.max) { txt.style.whiteSpace = 'normal'; txt.style.width = S.max + 'px'; txt.style.textWrap = 'balance'; }
      var tw = txt.offsetWidth, th = txt.offsetHeight;
      if (txt.style.whiteSpace === 'normal') {   // shrink-wrap the balanced lines
        var rr = document.createRange(); rr.selectNodeContents(txt); var rs = rr.getClientRects(), mx = 0;
        for (var q = 0; q < rs.length; q++) mx = Math.max(mx, rs[q].right - txt.getBoundingClientRect().left);
        tw = Math.ceil(mx);
      }
      var bw = 84 + tw, bh = Math.max(64, th);
      var left = S.center ? 960 - bw / 2 : S.x;
      box.style.left = left + 'px'; box.style.top = (S.y - bh / 2) + 'px'; box.style.width = bw + 'px'; box.style.height = bh + 'px';
      badge.style.top = (bh / 2 - 32) + 'px'; txt.style.top = (bh / 2 - th / 2) + 'px';
      var chars = u.splitChars(txt);
      var ev = txt.querySelector('span.evi'), er = ev.getBoundingClientRect();
      f.ex = er.left - rootRect.left + er.width / 2; f.ey = er.top - rootRect.top + er.height / 2 + 2; f.ew = er.width;
      f.box = box; f.badge = badge; f.txt = txt;
      gsap.set(box, { transformOrigin: (f.ex - left).toFixed(1) + 'px ' + (f.ey - (S.y - bh / 2)).toFixed(1) + 'px' });
      gsap.set(box, { opacity: 0 });
      // in: badge pops on the beat, the fragment types in (0.4 s)
      tl.set(box, { opacity: 1 }, f.tIn);
      tl.fromTo(badge, { scale: 1.7, opacity: 0, filter: 'blur(6px)' }, { scale: 1, opacity: 1, filter: 'blur(0px)', duration: 0.42, ease: 'power3.out' }, f.tIn);
      var tch = chars.filter(function (c) { return !/^\s$/.test(c.textContent); });
      tl.fromTo(tch, { opacity: 0 }, { opacity: 1, duration: 0.03, ease: 'none', stagger: TYPE / tch.length }, f.tIn + 0.04);
      var evc = ev.querySelectorAll('.ch');   // evidence flashes as it is typed
      tl.fromTo(evc, { textShadow: '0 0 30px rgba(255,236,190,1), 0 0 70px rgba(255,190,90,.8)' }, { textShadow: '0 0 18px rgba(255,181,71,.6), 0 0 44px rgba(255,160,60,.25)', duration: 0.6, ease: 'power2.out', stagger: TYPE / tch.length }, f.launch - 8 * TYPE / tch.length);
      // out: collapses into its evidence (which becomes the star), ending on the out time
      tl.to(box, { opacity: 0, filter: 'blur(8px)', duration: 0.3, ease: 'power2.in' }, f.tOut - 0.3);
      tl.set(box, { visibility: 'hidden' }, f.tOut);
    });

    // star labels (DOM 40 px; positioned per frame next to their star, outside the ellipse)
    STARS.forEach(function (S) {
      S.lab = u.el('div', { cls: 'abs tnum', parent: hud, text: S.art, style: { left: '0px', top: '0px', fontFamily: 'var(--sans)', fontWeight: 700, fontSize: '40px', lineHeight: '1',
        color: '#ffd89a', textShadow: '0 0 14px rgba(255,181,71,.55), 0 0 4px rgba(0,0,0,.8)', opacity: 0, visibility: 'hidden' } });
    });

    // ================= per frame: DOM positions =================
    var lastNum = '';
    u.onFrame(function (t) {
      var c = camA(t);
      world.style.transform = 'translate(' + (EVI.cx * (1 - c.z) + c.ox).toFixed(3) + 'px,' + (EVI.cy * (1 - c.z) + c.oy).toFixed(3) + 'px) scale(' + c.z.toFixed(5) + ')';
      var rp = scrA(RING.x, RING.y, c);
      pctBox.style.transform = 'translate(' + rp[0].toFixed(2) + 'px,' + (rp[1] + 2).toFixed(2) + 'px)';
      // frame
      var f = frameState(clamp(t, T_DIS, T_IGN));
      frameGroup.style.transform = 'translate(' + f.tx.toFixed(2) + 'px,' + f.ty.toFixed(2) + 'px) perspective(' + PERSP + 'px) rotateY(' + f.rot.toFixed(3) + 'deg) scale(' + f.s.toFixed(5) + ')';
      // star labels
      var lo = 1 - seg(t, T_TXTOUT - 0.3, T_TXTOUT);
      STARS.forEach(function (S, i) {
        var a = seg(t, S.born, S.born + 0.35, eP2o) * lo;
        if (a <= 0.002) { S.lab.style.visibility = 'hidden'; S.lab.style.opacity = '0'; S.lab.style.transform = 'none'; return; }
        var p = starScreen(i, t), M = mapState(t), dx = p.x - M.cx, dy = p.y - M.cy, d = Math.hypot(dx, dy) || 1;
        var off = 34 + 6 * (1 - a);
        var lx = p.x + dx / d * off + (dx / d) * 14, ly = p.y + dy / d * off * 0.92;
        S.lab.style.visibility = 'visible';
        S.lab.style.opacity = clamp(a * (0.75 + 0.25 * p.k), 0, 1).toFixed(4);
        S.lab.style.transform = 'translate(' + lx.toFixed(2) + 'px,' + ly.toFixed(2) + 'px) translate(-50%,-50%) scale(' + (1.14 - 0.14 * a).toFixed(4) + ')';
      });
      // counter: integer steps roll in 0.2 s; from bar 52 it keeps rolling, faster and blurred
      var v = counterValue(t), n = Math.floor(v), fr = v - n;
      var key = n + '|' + fr.toFixed(3);
      if (key !== lastNum) {
        lastNum = key;
        if (numA.textContent !== String(n)) numA.textContent = String(n);
        if (numB.textContent !== String(n + 1)) numB.textContent = String(n + 1);
        numA.style.transform = 'translateY(' + (-fr * 30).toFixed(2) + 'px)'; numA.style.opacity = clamp(1 - 2 * fr, 0, 1).toFixed(3);
        numB.style.transform = 'translateY(' + ((1 - fr) * 30).toFixed(2) + 'px)'; numB.style.opacity = clamp(2 * fr - 1, 0, 1).toFixed(3);
      }
      var rate = counterRate(t);
      var bl = clamp((rate - 2.5) / 9, 0, 1) * 4.5, fs = bl > 0.05 ? 'blur(' + bl.toFixed(2) + 'px)' : '';
      if (numA.style.filter !== fs) { numA.style.filter = fs; numB.style.filter = fs; }
    });
    function counterValue(t) {
      var v = 1;
      for (var i = 1; i < ARR.length; i++) {
        if (ARR[i] >= T_8TH) break;
        v += eBack(seg(t, ARR[i] - 0.02, ARR[i] + 0.2));
      }
      if (t > T_8TH) { var x = t - T_8TH; v += 3.2 * x + 3.6 * x * x; }
      return v;
    }
    function counterRate(t) { return t > T_8TH ? 3.2 + 7.2 * (t - T_8TH) : 0; }

    // ================= drawing: the passage canvas (camera space) =================
    function setCam(g, c) { g.setTransform(dpr * c.z, 0, 0, dpr * c.z, dpr * (EVI.cx * (1 - c.z) + c.ox), dpr * (EVI.cy * (1 - c.z) + c.oy)); }
    var MOTE_TRAIL = 7;
    function bez(p0, p1, p2, s) { var a = 1 - s; return [a * a * p0[0] + 2 * a * s * p1[0] + s * s * p2[0], a * a * p0[1] + 2 * a * s * p1[1] + s * s * p2[1]]; }
    function ringHead(t) { var f = ringFill(t) * 0.98 + ringBounce(t); return RA0 + f * Math.PI * 2; }
    function drawPassage(g, t) {
      var c = camA(t), en = eN(t);
      setCam(g, c);
      // s05's beads fade as the glyphs condense out of them
      var bf = t < 0 ? 1 : 1 - seg(t, 0.0, 0.26, eP2o), blf = t < 0 ? 1 : 1 - seg(t, 0.0, 0.12, eP2o);
      if (bf > 0.003) {
        g.globalCompositeOperation = 'lighter';
        for (var i = 0; i < BEADS.length; i++) {
          var b = BEADS[i], sz = b.r * 3 * (1 - 0.4 * (1 - bf));
          g.globalAlpha = b.a * bf; g.drawImage(SPR_W, b.x - sz, b.y - sz, sz * 2, sz * 2);
        }
        for (var li = 0; li < NL; li++) {
          var bl2 = BLOCK[li];
          for (var wi = 0; wi < bl2.spans.length; wi++) {
            var x0s = BL_LEFT + bl2.spans[wi][0], ww2 = bl2.spans[wi][1] - bl2.spans[wi][0];
            g.globalAlpha = 0.3 * 0.65 * blf; g.drawImage(SPR_SOFT_GOLD, x0s - 14, bl2.y - 22, ww2 + 28, 44);
            g.globalAlpha = 0.4 * 0.65 * blf; g.drawImage(SPR_W, x0s - 4, bl2.y - 5, ww2 + 8, 10);
          }
        }
        g.globalAlpha = 1;
      }
      var gin = t < 0 ? 0 : seg(t, 0.03, 0.4, eP2o);
      var dim = 1 - 0.52 * seg(t, T_G, T_G + 0.5, eP2o);
      g.globalCompositeOperation = 'source-over';
      g.font = PFONT; g.textBaseline = 'alphabetic';
      // lit-word flashes under the glyphs
      g.globalCompositeOperation = 'lighter';
      for (var j = 0; j < LIT.length; j++) {
        var w = LIT[j], x = t - w.t;
        if (x < 0 || x > 0.6) continue;
        var fa = pulse(x, 0.02, 0.16) * (0.9 + 0.3 * en);
        g.globalAlpha = clamp(fa * 0.9, 0, 1); g.drawImage(SPR_SOFT_GOLD, w.x - 22, w.y - 34, w.w + 44, 64);
        g.globalAlpha = clamp(fa * 0.5, 0, 1); g.drawImage(SPR_W, w.x - 6, w.y - 9, w.w + 12, 18);
      }
      g.globalAlpha = 1; g.globalCompositeOperation = 'source-over';
      for (var k = 0; k < WORDS.length; k++) {
        var wd = WORDS[k];
        if (wd.evi) {
          var na = seg(t, T_G, T_G + 0.4, eP2o);
          g.fillStyle = rgba(mixRgb(C_FROST, [236, 255, 244], na), gin * lerp(0.5, 0.96, na));
          if (na > 0) {   // a green glow behind the noticed word (sprite, not canvas shadowBlur: that rasterises differently per page)
            g.globalCompositeOperation = 'lighter'; g.globalAlpha = 0.5 * na;
            g.drawImage(SPR_GREEN, wd.x - 26, wd.y - 34, wd.w + 52, 64);
            g.globalAlpha = 1; g.globalCompositeOperation = 'source-over';
          }
          g.fillText(EVI.dotless, wd.x, wd.baseline);
          continue;
        }
        var lit = t >= wd.t ? 1 : 0, fx2 = t - wd.t;
        var flash = lit ? pulse(fx2, 0.015, 0.12) : 0;
        var lift = lit ? 2 * eP3o(seg(t, wd.t, wd.t + 0.2)) : 0;
        var col = lit ? mixRgb(C_WARMW, [255, 255, 255], flash) : C_COLDW;
        var al = lit ? (0.95 * dim + 0.05) : 0.3 * gin;
        if (!lit && gin <= 0) continue;
        g.fillStyle = rgba(col, al);
        g.fillText(wd.text, wd.x, wd.baseline - lift);
      }
      // coverage ring (appears as the camera trucks; fades with the texts)
      var ra = seg(t, 0.15, 0.9, eP2o) * (1 - seg(t, 6.5, 6.85, eP2i));
      if (ra > 0.003) drawRing(g, t, ra, en);
      // motes: from each lit word along an arc into the ring's head
      if (t < T_FULL + 0.3) {
        g.globalCompositeOperation = 'lighter';
        for (var m = 0; m < LIT.length; m++) {
          var wm = LIT[m];
          if (t < wm.t || t > wm.land + 0.25) continue;
          var hA = ringHead(wm.land), tgt = [RING.x + RING.r * Math.cos(hA), RING.y + RING.r * Math.sin(hA)];
          var p0 = [wm.cx, wm.cy], p1 = [(wm.cx + tgt[0]) / 2, Math.min(wm.cy, tgt[1]) - wm.lift];
          var s = eP2io(seg(t, wm.t, wm.land));
          if (t <= wm.land) {
            for (var q = MOTE_TRAIL; q >= 0; q--) {
              var sq = clamp(s - q * 0.035, 0, 1), pp = bez(p0, p1, tgt, sq), ka = (1 - q / (MOTE_TRAIL + 1));
              var rr = (2.6 - 1.6 * q / MOTE_TRAIL) * (1 + 0.3 * en);
              g.globalAlpha = clamp(0.85 * ka * ka, 0, 1); g.drawImage(SPR_W, pp[0] - rr * 3, pp[1] - rr * 3, rr * 6, rr * 6);
            }
          } else {     // landing spark
            var ls = (t - wm.land) / 0.25;
            g.globalAlpha = clamp(0.9 * (1 - ls), 0, 1); var rs2 = 5 + 10 * ls;
            g.drawImage(SPR_SOFT_GOLD, tgt[0] - rs2 * 2, tgt[1] - rs2 * 2, rs2 * 4, rs2 * 4);
          }
        }
        g.globalAlpha = 1; g.globalCompositeOperation = 'source-over';
      }
      g.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    function drawRing(g, t, ra, en) {
      var F = clamp(ringFill(t) * 0.98 + ringBounce(t), 0, 0.999), x = RING.x, y = RING.y, r = RING.r;
      var closed = seg(t, T_FULL, T_FULL + 0.3, eP2o);
      // water level inside (sloshing on every landing)
      var slosh = 0;
      for (var i = 0; i < LIT.length; i++) { var dx = t - LIT[i].land; if (dx > 0 && dx < 0.8) slosh += Math.exp(-dx / 0.25) * 0.5; }
      slosh = Math.min(slosh, 2.2) + 0.6 * pulse(t - T_FULL, 0.02, 0.3);
      var lvl = y + (r - 10) - 2 * (r - 10) * clamp(ringFill(t) * 0.98, 0, 1);
      g.save(); g.beginPath(); g.arc(x, y, r - 10, 0, Math.PI * 2); g.clip();
      g.beginPath(); g.moveTo(x - r, y + r);
      for (var sx = -r; sx <= r; sx += 6) g.lineTo(x + sx, lvl + Math.sin(sx * 0.06 + t * 5.2) * (2 + 3 * slosh) + Math.sin(sx * 0.13 - t * 3.1) * 1.2 * slosh);
      g.lineTo(x + r, y + r); g.closePath();
      var wg = g.createLinearGradient(0, lvl, 0, y + r);
      wg.addColorStop(0, rgba(C_GOLD, (0.3 + 0.08 * en) * ra)); wg.addColorStop(0.5, rgba(C_AMBER, 0.16 * ra)); wg.addColorStop(1, rgba(mixRgb(C_AMBER, C_TEAL, 0.5), 0.07 * ra));
      g.fillStyle = wg; g.fill();
      g.beginPath();
      for (var sx2 = -r; sx2 <= r; sx2 += 6) { var yy = lvl + Math.sin(sx2 * 0.06 + t * 5.2) * (2 + 3 * slosh) + Math.sin(sx2 * 0.13 - t * 3.1) * 1.2 * slosh; if (sx2 === -r) g.moveTo(x + sx2, yy); else g.lineTo(x + sx2, yy); }
      g.strokeStyle = rgba(C_FLARE, 0.35 * ra); g.lineWidth = 1.6; g.stroke();
      g.restore();
      // track
      g.lineCap = 'round';
      g.strokeStyle = rgba([143, 166, 198], 0.16 * ra); g.lineWidth = 2;
      g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.stroke();
      if (F > 0.002) {
        var a1 = RA0 + F * Math.PI * 2;
        g.globalCompositeOperation = 'lighter';
        g.strokeStyle = rgba(C_AMBER, (0.14 + 0.1 * en) * ra); g.lineWidth = 20;
        g.beginPath(); g.arc(x, y, r, RA0, a1); g.stroke();
        g.globalCompositeOperation = 'source-over';
        var cg = g.createConicGradient(RA0, x, y);
        cg.addColorStop(0, rgba(C_FLARE, ra)); cg.addColorStop(0.6, rgba(C_GOLD, ra)); cg.addColorStop(1, rgba(C_AMBER, ra));
        g.strokeStyle = cg; g.lineWidth = 7;
        g.beginPath(); g.arc(x, y, r, RA0, a1); g.stroke();
        // the head spark
        g.globalCompositeOperation = 'lighter';
        var hx = x + r * Math.cos(a1), hy = y + r * Math.sin(a1);
        g.globalAlpha = ra * (0.7 + 0.3 * en); g.drawImage(SPR_W, hx - 10, hy - 10, 20, 20);
        g.globalAlpha = 1; g.globalCompositeOperation = 'source-over';
      }
      // the gap (2 %): two ticks, a faint ice glow and a dashed thread to evidence
      if (closed > 0) {
        var gx = x + r * Math.cos(GAPC), gy = y + r * Math.sin(GAPC);
        g.globalCompositeOperation = 'lighter';
        glowDisc(g, gx, gy, 26, C_FROST, 0.35 * closed * ra * (0.8 + 0.4 * u.beatPulse(t, 0.3)));
        g.globalCompositeOperation = 'source-over';
        var d = seg(t, T_FULL + 0.05, T_FULL + 0.5, eP2o);
        var ex = EVI.x1 + 14, ey = EVI.cy + 4;
        g.save(); g.setLineDash([7, 10]); g.lineDashOffset = -t * 22;
        g.strokeStyle = rgba(C_FROST, 0.38 * ra * closed); g.lineWidth = 2;
        g.beginPath(); g.moveTo(gx - 6 * Math.cos(GAPC), gy - 6 * Math.sin(GAPC)); g.lineTo(lerp(gx, ex, d), lerp(gy, ey, d)); g.stroke();
        g.restore();
      }
    }

    // ================= drawing: back canvas (screen space) =================
    var DUST = [];
    (function () {
      var R = u.rand('s06:dust');
      for (var i = 0; i < 240; i++) DUST.push({ x: R.range(-1300, 1300), y: R.range(-760, 760), z: R.range(-600, 900), r: R.range(0.5, 1.7), a: R.range(0.25, 0.9), ph: R() * 6.28, fq: R.range(0.3, 1.2), warm: R() < 0.3, vy: R.range(4, 14) });
    })();
    var TL_X0 = 120, TL_X1 = 1600;
    function tlGeo(t) { var k = eP2io(seg(t, T_BACK, D)); return { base: lerp(1040, 980, k), amp: lerp(44, 150, k) }; }
    function tlValue(tau) {
      if (tau < T_STAR) return 0;
      var v = 0.06, n = 0;
      for (var i = 0; i < ARR.length; i++) {
        var x = tau - ARR[i]; if (x < 0) continue;
        n++;
        v += 0.42 * (1 - Math.exp(-x / 0.05)) * Math.exp(-x / 0.95);
        v += 0.045 * eP2o(clamp(x / 0.8, 0, 1));
      }
      return 1 - Math.exp(-1.7 * v);
    }
    function tlX(tau) { return TL_X0 + (TL_X1 - TL_X0) * (tau - T_STAR) / (D - T_STAR); }
    function drawBack(g, t) {
      var en = eN(t), M = mapState(t), mapA = seg(t, T_STAR, T_STAR + 0.8, eP2o);
      // dust: three depths, rotating with the map (parallax)
      var warmK = seg(t, 0, D), dustIn = t < 0 ? 0 : seg(t, 0, 1.4, eSine);
      g.globalCompositeOperation = 'lighter';
      var th = t < T_STAR ? 0.03 * Math.sin(t * 0.3) : M.th;
      var cs = Math.cos(th), sn = Math.sin(th);
      for (var i = 0; i < DUST.length; i++) {
        var d = DUST[i], yy = ((d.y - d.vy * t + 760) % 1520 + 1520) % 1520 - 760;
        var x = d.x * cs + d.z * sn, z = -d.x * sn + d.z * cs, k = FOCAL / (FOCAL + z);
        var sx = 960 + x * k, sy = 540 + yy * k;
        if (sx < -20 || sx > W + 20 || sy < -20 || sy > H + 20) continue;
        var tw = 0.55 + 0.45 * Math.sin(d.ph + t * d.fq * 6.283);
        var a = d.a * tw * (0.45 + 0.4 * en) * clamp(k, 0.4, 1.3) * 0.6 * dustIn;
        var rr = d.r * k * (1 + 0.3 * en);
        g.globalAlpha = clamp(a, 0, 1);
        g.drawImage(d.warm && warmK > 0.3 ? SPR_AMBER : SPR_ICE, sx - rr * 3, sy - rr * 3, rr * 6, rr * 6);
      }
      g.globalAlpha = 1;
      if (t >= T_STAR - 0.1) drawMapBack(g, t, M, mapA, en);
      // the brightness timeline
      var ta = seg(t, T_STAR + 0.15, T_STAR + 0.6, eP2o) * (t < T_STAR + 0.15 ? 0 : 1);
      if (ta > 0.003) drawTimeline(g, t, ta, en);
      g.globalCompositeOperation = 'source-over';
      if (t >= T_STAR - 0.05) drawCentreWord(g, t);
    }
    function drawMapBack(g, t, M, mapA, en) {
      var cl = centreLook(t), cg = centreGeo(M);
      g.globalCompositeOperation = 'lighter';
      // volumetric rays from the word (grow with every encounter)
      var rayA = (0.012 + 0.03 * cl.k + 0.025 * cl.ext) * (0.75 + 0.5 * en) * mapA * M.a;
      if (rayA > 0.002) {
        for (var r = 0; r < 14; r++) {
          var ang = r / 14 * Math.PI * 2 + t * 0.05 + 0.3 * Math.sin(r * 2.3), len = 900 * M.s, half = 0.035 + 0.02 * ((r * 7) % 3) / 2;
          var lg = g.createRadialGradient(M.cx, M.cy, 40 * M.s, M.cx, M.cy, len);
          lg.addColorStop(0, rgba(mixRgb(C_PALE, C_AMBER, cl.k), rayA * (r % 2 ? 0.7 : 1.2))); lg.addColorStop(1, rgba(C_AMBER, 0));
          g.fillStyle = lg; g.beginPath(); g.moveTo(M.cx, M.cy);
          g.lineTo(M.cx + Math.cos(ang - half) * len, M.cy + Math.sin(ang - half) * len * 0.75);
          g.lineTo(M.cx + Math.cos(ang + half) * len, M.cy + Math.sin(ang + half) * len * 0.75); g.closePath(); g.fill();
        }
      }
      // the orbit (an astrolabe ellipse through the stars), very faint
      g.globalCompositeOperation = 'source-over';
      g.strokeStyle = rgba([150, 190, 210], 0.07 * mapA * M.a); g.lineWidth = 1.2;
      g.beginPath();
      for (var s = 0; s <= 96; s++) { var a = s / 96 * Math.PI * 2, p = project(ERX * Math.cos(a), ERY * Math.sin(a), 0, M); if (s) g.lineTo(p[0], p[1]); else g.moveTo(p[0], p[1]); }
      g.stroke();
      g.strokeStyle = rgba([150, 190, 210], 0.045 * mapA * M.a);
      g.beginPath();
      for (var s2 = 0; s2 <= 96; s2++) { var a2 = s2 / 96 * Math.PI * 2, p2 = project(ERX * 1.32 * Math.cos(a2), ERY * 1.32 * Math.sin(a2), 0, M); if (s2) g.lineTo(p2[0], p2[1]); else g.moveTo(p2[0], p2[1]); }
      g.stroke();
      // light lines: star (or fragment) to the word
      g.globalCompositeOperation = 'lighter';
      for (var i = 0; i < STARS.length; i++) {
        var L = lineState(i, t, M, cg);
        if (!L) continue;
        strokeLine(g, L.x0, L.y0, L.x1, L.y1, L.a * M.a, en);
      }
      // the unlabeled encounters' rays (persist faintly)
      for (var m = 0; m < METEORS.length; m++) {
        var me = METEORS[m];
        if (t < me.launch) continue;
        var e1 = endOnWord(me.ox, me.oy, M);
        var pr = eExpoIn(seg(t, me.launch, me.arrive));
        var hx = lerp(me.ox, e1[0], pr), hy = lerp(me.oy, e1[1], pr);
        var fade = 0.55 * (1 - 0.6 * seg(t, me.arrive, me.arrive + 1.2, eP2o));
        strokeLine(g, me.ox, me.oy, hx, hy, fade * M.a, en);
      }
      g.globalCompositeOperation = 'source-over';
    }
    function endOnWord(x, y, M) {   // where a line towards the centre meets the word's halo ellipse
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
    // a star's line: from the fragment's evidence while it is up (drawn in, head = pulse), then from the flying star
    function lineState(i, t, M, cg) {
      var S = STARS[i], f = S.frag;
      var lo = 1 - 0.0 * seg(t, T_TXTOUT, D);
      if (!f) {   // star 51: line appears as it ignites
        if (t < T_IGN) return null;
        var p = starScreen(0, t), e = endOnWord(p.x, p.y, M), d = eP3io(seg(t, T_IGN, T_IGN + 0.5));
        return { x0: p.x, y0: p.y, x1: lerp(p.x, e[0], d), y1: lerp(p.y, e[1], d), a: 0.6 * lo, head: d };
      }
      if (t < f.launch) return null;
      var o = fragOrigin(f, t), e2 = endOnWord(o.x, o.y, M), d2 = eP3io(seg(t, f.launch, f.arrive));
      return { x0: o.x, y0: o.y, x1: lerp(o.x, e2[0], d2), y1: lerp(o.y, e2[1], d2), a: 0.6 * lo, head: d2 };
    }
    function fragOrigin(f, t) {    // the outer end of a fragment's line: its evidence, then the star flying to the map
      if (t <= f.tOut) return { x: f.ex, y: f.ey, k: 1, fly: 0 };
      var i = f.star.i, p = starScreen(i, t), s = eP3io(seg(t, f.tOut, f.star.born));
      if (s >= 1) return { x: p.x, y: p.y, k: p.k, fly: 1 };
      var M = mapState(t), mid = [(f.ex + p.x) / 2, (f.ey + p.y) / 2], dx = mid[0] - M.cx, dy = mid[1] - M.cy, dd = Math.hypot(dx, dy) || 1;
      var c1 = [mid[0] + dx / dd * 160, mid[1] + dy / dd * 160];
      var q = bez([f.ex, f.ey], c1, [p.x, p.y], s);
      return { x: q[0], y: q[1], k: p.k, fly: s };
    }
    function drawTimeline(g, t, ta, en) {
      var G = tlGeo(t), now = Math.min(t, D);
      g.globalCompositeOperation = 'source-over';
      // axis
      g.strokeStyle = rgba(C_TLINE, 0.12 * ta); g.lineWidth = 1.2;
      g.beginPath(); g.moveTo(TL_X0, G.base + 0.5); g.lineTo(TL_X1, G.base + 0.5); g.stroke();
      var N = Math.max(2, Math.ceil((now - T_STAR) / 0.02));
      var pts = [];
      for (var i = 0; i <= N; i++) { var tau = T_STAR + (now - T_STAR) * i / N; pts.push([tlX(tau), G.base - G.amp * tlValue(tau)]); }
      // soft fill under the curve
      var fg = g.createLinearGradient(0, G.base - G.amp, 0, G.base);
      fg.addColorStop(0, rgba(C_TLINE, 0.16 * ta)); fg.addColorStop(1, rgba(C_TLINE, 0.0));
      g.fillStyle = fg; g.beginPath(); g.moveTo(pts[0][0], G.base);
      pts.forEach(function (p) { g.lineTo(p[0], p[1]); }); g.lineTo(pts[pts.length - 1][0], G.base); g.closePath(); g.fill();
      g.globalCompositeOperation = 'lighter';
      g.lineJoin = 'round'; g.lineCap = 'round';
      g.beginPath(); pts.forEach(function (p, k) { if (k) g.lineTo(p[0], p[1]); else g.moveTo(p[0], p[1]); });
      g.strokeStyle = rgba(C_TLINE, 0.18 * ta * (0.8 + 0.4 * en)); g.lineWidth = 9; g.stroke();
      g.strokeStyle = rgba(C_TLINE, 0.95 * ta); g.lineWidth = 2.6; g.stroke();
      g.globalCompositeOperation = 'source-over';
      TL_LAST.x = pts[pts.length - 1][0]; TL_LAST.y = pts[pts.length - 1][1]; TL_LAST.pts = pts; TL_LAST.base = G.base; TL_LAST.amp = G.amp;
    }
    var TL_LAST = { x: TL_X0, y: 1040, pts: [], base: 1040, amp: 44 };

    // ================= drawing: fx canvas (screen space) =================
    var BOKEH = [];
    (function () {
      var R = u.rand('s06:bokeh');
      for (var i = 0; i < 16; i++) BOKEH.push({ x: R.range(-100, 2020), y: R.range(-60, 1140), r: R.range(26, 74), a: R.range(0.025, 0.07), ph: R() * 6.28, sp: R.range(6, 18), warm: R() < 0.5, d: R.range(1.3, 1.9) });
    })();
    function dotPos(t) {
      var c = camA(Math.min(t, T_DIS)), p0 = scrA(EVI.dotX, EVI.dotY, c);
      if (t < T_DIS) return { x: p0[0], y: p0[1], r: EVI.dotR * c.z, b: 0.3 };
      var fi = frameProject(FR_I.x, FR_I.y, frameState(Math.min(t, T_STAR)));
      if (t < T_BASS) {
        var s = eP3io(seg(t, T_DIS, T_BASS));
        return { x: lerp(p0[0], fi[0], s), y: lerp(p0[1], fi[1], s) - 60 * Math.sin(Math.PI * s), r: lerp(EVI.dotR * c.z, FR_I.r * fi[2], s), b: 0.3 };
      }
      if (t < T_STAR) return { x: fi[0], y: fi[1], r: FR_I.r * fi[2], b: 0.3 };
      var M = mapState(t), cg = centreGeo(M), cl = centreLook(t);
      if (t < T_IGN) {
        var s2 = eP3io(seg(t, T_STAR, T_IGN));
        return { x: lerp(fi[0], cg.dx, s2), y: lerp(fi[1], cg.dy, s2) - 90 * Math.sin(Math.PI * s2), r: lerp(FR_I.r * fi[2], cg.dr, s2), b: 0.3, centre: s2 };
      }
      var T_DROP = 22.0;
      if (t < T_DROP) return { x: cg.dx, y: cg.dy, r: cg.dr, b: cl.b, centre: 1 };
      var tg = tlGeo(D), ex = TL_X1, ey = tg.base - tg.amp * tlValue(D);
      var s3 = eP3io(seg(t, T_DROP, 22.45));
      return { x: lerp(cg.dx, ex, s3), y: lerp(cg.dy, ey, s3) - 120 * Math.sin(Math.PI * s3), r: lerp(cg.dr, 5.5, s3), b: cl.b, centre: 1 };
    }
    function drawDot(g, t, p) {
      var r = p.r, b = p.b, k = clamp((b - 0.3) / 0.7, 0, 1);
      var halo = mixRgb([255, 214, 150], C_GOLD, k), mid = mixRgb([240, 190, 120], C_AMBER, k), core = mixRgb([214, 178, 118], [255, 236, 196], k);
      var breath = 1 + 0.1 * u.barPulse(t, 0.6) + 0.15 * u.beatPulse(t, 0.2) * k;
      var sc = clamp(r / EVI.dotR, 0.8, 2.2), cm = p.centre || 0;
      g.globalCompositeOperation = 'lighter';
      glowDisc(g, p.x, p.y, lerp(90 * sc, 70 + 80 * k, cm), halo, lerp(0.05, 0.05 + 0.16 * k, cm) * breath);
      glowDisc(g, p.x, p.y, lerp(30 * sc, 20 + 10 * k, cm), mid, lerp(0.26, 0.26 + 0.3 * k, cm) * breath);
      glowDisc(g, p.x, p.y, lerp(11 * sc, 9 + 2 * k, cm), mixRgb([255, 236, 200], [255, 248, 230], k), 0.3 + 0.55 * k);
      g.globalCompositeOperation = 'source-over';
      g.globalAlpha = 0.8 + 0.2 * k; g.fillStyle = rgba(core, 1); g.beginPath(); g.arc(p.x, p.y, r, 0, 6.2832); g.fill(); g.globalAlpha = 1;
    }
    function greenRing(t) {    // {x, y, rx, ry, a, rot, open}
      if (t < T_G || t > T_IGN) return null;
      var c = camA(Math.min(t, T_DIS)), ec = scrA(EVI.cx, EVI.cy, c);
      var rx0 = ((EVI.x1 - EVI.x0) / 2 + 19) * c.z, ry0 = 43 * c.z;
      var snap = seg(t, T_G, T_G + 0.5), k = eBack(snap);
      var R = { x: ec[0], y: ec[1], rx: rx0 * lerp(2.6, 1, k), ry: ry0 * lerp(2.6, 1, k), a: seg(t, T_G, T_G + 0.18), rot: -4 + 10 * (1 - k), draw: eP3o(snap) };
      if (t >= T_DIS) {
        var d = dotPos(t), s = eP3io(seg(t, T_DIS, T_BASS - 0.05));
        R.x = lerp(ec[0], d.x, s); R.y = lerp(ec[1], d.y, s); R.rx = lerp(rx0, 17, s); R.ry = lerp(ry0, 17, s); R.rot = -4 * (1 - s);
        if (t >= T_RING) {
          var f = frameState(t), a1 = frameProject(FR_E.x0, (FR_E.y0 + FR_E.y1) / 2, f), a2 = frameProject(FR_E.x1, (FR_E.y0 + FR_E.y1) / 2, f),
            b1 = frameProject((FR_E.x0 + FR_E.x1) / 2, FR_E.y0, f), b2 = frameProject((FR_E.x0 + FR_E.x1) / 2, FR_E.y1, f);
          var s2 = eP3io(seg(t, T_RING, T_RING + 0.6));
          var tx2 = (a1[0] + a2[0]) / 2, ty2 = (b1[1] + b2[1]) / 2, trx = (a2[0] - a1[0]) / 2 + 30, tr_y = (b2[1] - b1[1]) / 2 + 26;
          R.x = lerp(d.x, tx2, s2); R.y = lerp(d.y, ty2, s2); R.rx = lerp(17, trx, s2); R.ry = lerp(17, tr_y, s2); R.rot = -3 * s2;
          if (t >= T_STAR) {
            var s3 = seg(t, T_STAR, T_STAR + 0.35, eP2i);
            R.a *= 1 - s3; R.rx *= 1 - 0.6 * s3; R.ry *= 1 - 0.6 * s3;
          }
        }
      }
      return R;
    }
    function drawGreenRing(g, t, R, en) {
      if (!R || R.a <= 0.003) return;
      var bp = u.beatPulse(t, 0.22);
      g.save(); g.translate(R.x, R.y); g.rotate(R.rot * Math.PI / 180);
      var a0 = -Math.PI * 0.62, sweepA = Math.PI * 2.14 * R.draw;
      g.lineCap = 'round';
      g.globalCompositeOperation = 'lighter';
      g.strokeStyle = rgba(C_GREEN, 0.24 * R.a * (1 + 0.6 * bp)); g.lineWidth = 12;
      g.beginPath(); g.ellipse(0, 0, R.rx, R.ry, 0, a0, a0 + sweepA); g.stroke();
      g.globalCompositeOperation = 'source-over';
      g.strokeStyle = rgba([120, 232, 160], 0.95 * R.a); g.lineWidth = 3.4;
      g.beginPath(); g.ellipse(0, 0, R.rx, R.ry, 0, a0, a0 + sweepA); g.stroke();
      g.restore();
    }
    function drawFx(g, t) {
      var en = eN(t);
      // phase A/B: the green notice ring, its leader to "noticing", the motif dot
      var R = greenRing(t);
      drawGreenRing(g, t, R, en);
      if (R && t < 6.85) {   // leader line to the label
        var la = seg(t, T_G + 0.1, T_G + 0.45, eP3o) * (1 - seg(t, 6.5, 6.8, eP2i));
        if (la > 0.003) {
          var ax = R.x + 0.18 * R.rx, ay = R.y - R.ry - 2, bx = NOT_X + 30, by = NOT_Y + 46;
          g.strokeStyle = rgba([120, 232, 160], 0.75 * la); g.lineWidth = 2; g.lineCap = 'round';
          g.beginPath(); g.moveTo(ax, ay); g.lineTo(lerp(ax, bx, la), lerp(ay, by, la)); g.stroke();
          g.globalCompositeOperation = 'lighter'; glowDisc(g, ax, ay, 10, C_GREEN, 0.6 * la); g.globalCompositeOperation = 'source-over';
        }
      }
      if (t >= T_STAR - 0.05) drawMapFx(g, t, en);
      var dp = dotPos(t);
      drawDot(g, t, dp);
      // foreground bokeh (parallax 1.3 to 1.9; rotates with the map in C)
      var ba = (0.7 + 0.5 * en) * (t < 0 ? 0 : seg(t, 0.2, 1.8, eSine)), M = mapState(t);
      g.globalCompositeOperation = 'lighter';
      for (var i = 0; i < BOKEH.length; i++) {
        var b = BOKEH[i];
        var shift = t < T_STAR ? -camA(t).ox * 0.5 * b.d : -M.th * 900 * b.d;
        var bx = ((b.x + shift + 140) % 2200 + 2200) % 2200 - 140, by = b.y - b.sp * t + 18 * Math.sin(t * 0.5 + b.ph);
        by = ((by + 120) % 1320 + 1320) % 1320 - 120;
        g.globalAlpha = clamp(b.a * ba, 0, 1);
        var bs = b.r * 2.4; g.drawImage(b.warm ? SPR_SOFT_GOLD : SPR_TEAL, bx - bs, by - bs, bs * 2, bs * 2);
      }
      g.globalAlpha = 1; g.globalCompositeOperation = 'source-over';
    }
    function drawMapFx(g, t, en) {
      var M = mapState(t), cg = centreGeo(M), cl = centreLook(t);
      // bloom behind the word
      g.globalCompositeOperation = 'lighter';
      var bloom = (0.1 + 0.3 * cl.k + 0.18 * cl.ext) * (0.85 + 0.3 * en) * seg(t, T_STAR, T_IGN + 0.4, eP2o) * M.a;
      glowDisc(g, M.cx, M.cy, (300 + 200 * cl.k + 120 * cl.ext) * M.s, mixRgb(C_FROST, C_AMBER, cl.k), bloom * 0.55);
      glowDisc(g, M.cx, M.cy, (150 + 80 * cl.k) * M.s, mixRgb(C_ICE, C_GOLD, cl.k), bloom * 0.6);
      // shock rings on every arrival
      for (var i = 1; i < ARR.length; i++) {
        var x = t - ARR[i]; if (x < 0 || x > 0.9) continue;
        var rr = (275 + 330 * eP3o(x / 0.9)) * M.s;
        g.strokeStyle = rgba(mixRgb(C_PALE, C_AMBER, cl.k), 0.3 * (1 - x / 0.9) * M.a); g.lineWidth = 1.6;
        g.beginPath(); g.ellipse(M.cx, M.cy, rr, rr * 0.36, 0, 0, Math.PI * 2); g.stroke();
      }
      // pulses riding the lines in, the meteors' heads
      for (var s = 0; s < STARS.length; s++) {
        var S = STARS[s], L = lineState(s, t, M, cg);
        if (!L) continue;
        if (L.head < 1 && L.head > 0.015) {
          var hx = L.x1, hy = L.y1;
          g.globalAlpha = 0.95; g.drawImage(SPR_W, hx - 14, hy - 14, 28, 28);
          g.globalAlpha = 0.6; g.drawImage(SPR_SOFT_GOLD, hx - 36, hy - 36, 72, 72);
        }
        // ambient pulses: on beats, one star sends a pulse in (energy-driven)
        if (t > S.born + 0.4) {
          var bt = Math.floor((t - S.born) / BEAT), ph = (t - S.born) / BEAT - bt;
          if (u.hash(bt * 13 + s, 's06amb') < 0.32 + 0.3 * en) {
            var pp = eP2io(clamp(ph / 0.9, 0, 1));
            g.globalAlpha = 0.7 * Math.sin(Math.PI * clamp(ph / 0.9, 0, 1)) * M.a;
            var ax = lerp(L.x0, L.x1, pp), ay = lerp(L.y0, L.y1, pp);
            g.drawImage(SPR_AMBER, ax - 9, ay - 9, 18, 18);
          }
        }
      }
      for (var m = 0; m < METEORS.length; m++) {
        var me = METEORS[m]; if (t < me.launch || t > me.arrive + 0.05) continue;
        var e1 = endOnWord(me.ox, me.oy, M), pr = eExpoIn(seg(t, me.launch, me.arrive));
        var mx = lerp(me.ox, e1[0], pr), my = lerp(me.oy, e1[1], pr);
        g.globalAlpha = 1; g.drawImage(SPR_W, mx - 16, my - 16, 32, 32);
        g.globalAlpha = 0.7; g.drawImage(SPR_SOFT_GOLD, mx - 46, my - 46, 92, 92);
      }
      g.globalAlpha = 1;
      // a fragment condenses into its star: its evidence draws the light in as the words fade
      for (var c2 = 0; c2 < FR.length; c2++) {
        var fq = FR[c2], cx2 = t - (fq.tOut - 0.34);
        if (cx2 < 0 || cx2 > 0.4) continue;
        var cs2 = cx2 / 0.34, ca = Math.sin(Math.PI * clamp(cs2, 0, 1)) * (cs2 < 1 ? 1 : 1 - (cx2 - 0.34) / 0.06);
        var wdt = fq.ew * (1 - 0.85 * eP2i(clamp(cs2, 0, 1)));
        g.globalAlpha = clamp(0.8 * ca, 0, 1); g.drawImage(SPR_SOFT_GOLD, fq.ex - wdt / 2 - 20, fq.ey - 30, wdt + 40, 60);
        g.globalAlpha = clamp(ca, 0, 1); g.drawImage(SPR_W, fq.ex - wdt / 2 - 6, fq.ey - 8, wdt + 12, 16);
      }
      g.globalAlpha = 1;
      // stars (with the flying ones)
      for (var k = 0; k < STARS.length; k++) {
        var S2 = STARS[k], f = S2.frag, p, fly = 1, kz = 1;
        if (!f) { if (t < T_IGN - 0.05) continue; var q0 = starScreen(0, t); p = { x: q0.x, y: q0.y }; kz = q0.k; }
        else { if (t < f.tOut) continue; var o = fragOrigin(f, t); p = { x: o.x, y: o.y }; fly = o.fly; kz = o.k; }
        var age = t - S2.born, ign = age >= 0 ? pulse(age, 0.02, 0.35) : 0;
        var tw = 0.8 + 0.2 * Math.sin(S2.ph + t * 2.3) + 0.35 * en * u.beatPulse(t + S2.ph * 0.05, 0.2);
        var sa = (fly < 1 ? 0.9 : 1) * M.a, sz = (3.2 + 2.2 * ign + 0.6 * en) * clamp(kz, 0.85, 1.2);
        glowDisc(g, p.x, p.y, (26 + 60 * ign) * kz, C_GOLD, (0.35 + 0.6 * ign) * tw * sa);
        g.globalAlpha = clamp(sa * tw, 0, 1); g.drawImage(SPR_W, p.x - sz * 3, p.y - sz * 3, sz * 6, sz * 6);
        // four-point flare
        var fl = (14 + 40 * ign + 6 * en) * kz;
        g.globalAlpha = clamp(0.5 * tw * sa, 0, 1); g.drawImage(SPR_W, p.x - fl, p.y - 1.2, fl * 2, 2.4); g.drawImage(SPR_W, p.x - 1.2, p.y - fl * 0.8, 2.4, fl * 1.6);
        g.globalAlpha = 1;
        if (fly < 1 && fly > 0) {   // comet trail while flying
          for (var q = 1; q <= 6; q++) {
            var oq = fragOrigin(f, t - q * 0.025);
            g.globalAlpha = 0.4 * (1 - q / 7); g.drawImage(SPR_AMBER, oq.x - 8, oq.y - 8, 16, 16);
          }
          g.globalAlpha = 1;
        }
      }
      g.globalCompositeOperation = 'source-over';
    }
    function drawCentreWord(g, t) {
      var M = mapState(t), cg = centreGeo(M), cl = centreLook(t), en = eN(t);
      var wa = seg(t, T_STAR, T_IGN, eP2o) * (1 - seg(t, 22.0, T_TXTOUT, eP2i));
      // the centre word (dotless i; the dot is drawn by drawDot)
      if (wa > 0.002) {
        var fs = 120 * cg.s;
        g.font = 'italic 400 ' + fs.toFixed(2) + 'px "Source Serif 4 Display"'; g.textBaseline = 'alphabetic';
        var emerge = seg(t, T_STAR, T_IGN, eP2o), sc = lerp(0.94, 1, emerge);
        g.save(); g.translate(M.cx, cg.base); g.scale(sc, sc); g.translate(-M.cx, -cg.base);
        g.globalCompositeOperation = 'source-over';
        // glow behind the letters (sprites: deterministic, unlike canvas shadowBlur)
        var ga = (0.22 + 0.4 * cl.k + 0.15 * cl.ext) * wa * (0.85 + 0.3 * en), gx = cg.x0 - 70 * cg.s, gy = cg.base - CA * cg.s - 46 * cg.s, gw = CW * cg.s + 140 * cg.s, gh = (CA + CDs) * cg.s + 92 * cg.s;
        g.globalCompositeOperation = 'lighter';
        g.globalAlpha = clamp(ga * (1 - cl.k), 0, 1); g.drawImage(SPR_ICE, gx, gy, gw, gh);
        g.globalAlpha = clamp(ga * cl.k, 0, 1); g.drawImage(SPR_SOFT_GOLD, gx, gy, gw, gh);
        g.globalAlpha = 1; g.globalCompositeOperation = 'source-over';
        g.fillStyle = rgba(cl.col, wa * cl.b);
        g.fillText(CWORD, cg.x0, cg.base);
        g.restore();
      }
      g.globalCompositeOperation = 'source-over';
    }

    // ================= handoff for s07 =================
    u.onFrame(function (t) {
      if (t < D - 0.02) return;
      var M = mapState(D);
      window.__s06Handoff = {
        timeline: { x0: TL_X0, x1: TL_X1, base: tlGeo(D).base, amp: tlGeo(D).amp, tau0: T_STAR, tau1: D,
          points: (function () { var g2 = tlGeo(D), out = []; for (var i = 0; i <= 600; i++) { var tau = T_STAR + (D - T_STAR) * i / 600; out.push([+tlX(tau).toFixed(2), +(g2.base - g2.amp * tlValue(tau)).toFixed(2)]); } return out; })() },
        dot: { x: TL_X1, y: tlGeo(D).base - tlGeo(D).amp * tlValue(D) },
        map: { cx: M.cx, cy: M.cy, s: M.s },
        stars: STARS.map(function (S, i) { var p = starScreen(i, D); return { x: p.x, y: p.y, art: S.art }; })
      };
    });
  });
})();
