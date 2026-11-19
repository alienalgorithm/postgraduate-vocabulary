/* s10  The light comes home, the method card freezes (global 143.092 to 169.342 s, 26.25 s, bars 78 to 91 of the
 * Cornfield Chase edit: the opening swell returns, F F G G Am Am G G Am Am G G F F; beat 0.625 s, bar 1.875 s).
 * Music: 143.092 is almost silent, the swell peaks near 146.217 (about 0.40); the hits of the edit are the chord
 * changes every two bars: 143.092, 146.842 (G, the same chord slot as s01's "片尾，考你。"), 150.592 (Am),
 * 154.342 (G), 158.092 (G to Am), 161.842 (last G, the high layer re-enters), 165.592 (final F); the fade-out
 * starts on 166.217 and is silent by 169.342.
 *
 *  A 0 to 3.75   Warm white light spreads out of the motif dot (custom iris, 0.6 s, the dot stays at (960, 540)) and
 *     uncovers cream paper. The dot blinks like a text cursor on every beat. 还记得开头那个词吗？ fades in char by
 *     char from 0.3125. On bar 79 (1.875) the s01 word card comes back in the same place, now warm paper with a gold
 *     edge (scale 0.8 to 1, expo.out): only "n. 证据" and 8 blanks; the dot dips and flies into the input slot left
 *     of the blanks and blinks there; a thin gold countdown ring draws round the card in exactly one bar (linear).
 *     3.125: the letters start to scramble (deterministic, 22 glyphs/s) and the dot hops over to hover above the ı.
 *     3.75 (G, hit): the ring closes, the scramble locks to "evıdence" and the dot lands on the ı with back.out(1.8)
 *     on that very frame (the light comes home, as in s01 but warm gold); a gold shock ring leaves the card.
 *  B 3.75 to 10.0  4.375: a gold arc draws over the card (DrawSVG, linear) and its tip lights 15 line-art thumbnails,
 *     one per sixteenth note (to 6.5625 = 149.654): the 15 readable appearances of the word in the film (s01 card,
 *     s02 window, s03 curve, s06 page, s06 video frame, s06 star-map centre, 8 encounter stars, s07 timeline).
 *     Lines 这个视频里，你已经遇见它十几次； (4.375) and 刚才想起它的那一下，就是方法本身。 (5.625).
 *     7.5 (Am, hit): the thumbnails burst into gold motes that run along the arc (motion paths) and pour into the dot;
 *     9.375: the dot steps up one notch and hops. 10.0: card and lines recede and fade; the dot stays.
 *  C 10.0 to 14.375  The dot glides over to the right; 多看一遍， writes on 10.625, 不如合上书想一遍 on 10.9375 (想 in
 *     gold); on the G downbeat 11.25 (hit) the dot drops in as the full stop and rings once. Stillness.
 *  D 14.375 to 26.25  The quote turns to gold dust that converges on the centre; the method card flies in from depth
 *     (rotateX 70 to 0, translateZ -800 to 0, lands on the Am downbeat 15.0 with a 3 % rebound) under the dot.
 *     Title + 读 (15.0), 想 (15.625), 隔 (16.25), 用 (16.875), the habit line + 66-cell check-in strip (17.5; one
 *     segment of 11 per beat, cell 41 stays empty), sources (18.125). 18.75 (last G, hit, high layer): a warm light
 *     sweeps the card and a glint runs round its gold edge, the signature fades in, the dot leaves the full stop on a
 *     slow arc; 22.5 (final F, hit): it lands in the empty gold socket at the card's top-right corner, one last warm
 *     ring, and the very slow push (1.00 to 1.015) stops on that frame. Freeze to the end (only grain and a faint
 *     breath of the dot).
 *
 * Techniques: 9 UI mock (warm recall card with countdown ring, method card with check-in strip), 8 text effects
 *   (scramble decode, char reveals, wipe reveals), 3 MotionPath/DrawSVG (the drop arc, the gold arc, mote paths, the
 *   final flight, the edge glint), 5 particles (recall motes, the quote turning to gold dust, floating gold dust),
 *   6 2.5D (CSS 3D card flight with paper thickness, soft shadows, parallax dust), 11 light (paper fibre texture,
 *   warm iris of light, shock rings, light sweep, glows, vignette), 13 music (every move on a beat or hit; the dot,
 *   glows and dust follow ctx.util.energy).
 *
 * HANDOFF in (from s09, custom transition aligned after, 0.6 s): s09 holds its last frame (warm dark graph paper and
 *   one gold dot at (960, 540), core about 9 px, halo about 40 px); this scene is put on top and revealed through a
 *   growing soft circle centred on the dot, with a warm white light front. HANDOFF out: last scene, freeze frame.
 */
(function () {
  'use strict';

  registerScene('s10', function build(tl, root, ctx) {
    var u = ctx.util, gsap = window.gsap, D = ctx.duration, W = 1920, H = 1080, OX = 960, OY = 540;
    var clamp = u.clamp, lerp = u.lerp, PI = Math.PI, TAU = PI * 2;
    var S0 = ctx.start;
    function E(n) { return gsap.parseEase(n); }
    var eSine = E('sine.inOut'), eSineO = E('sine.out'), eP2o = E('power2.out'), eP2i = E('power2.in'), eP2io = E('power2.inOut'),
      eP3o = E('power3.out'), eP3i = E('power3.in'), eP3io = E('power3.inOut'), eExpo = E('expo.out'), eBack18 = E('back.out(1.8)');
    function seg(t, a, b, ease) { var x = clamp((t - a) / (b - a), 0, 1); return ease ? ease(x) : x; }
    function pulse(x, rise, decay) { return x < 0 ? 0 : (1 - Math.exp(-x / rise)) * Math.exp(-x / decay); }
    // a local musical time snapped so that the 60 fps frame nearest to it already shows the event
    function FL(t) { return Math.round((S0 + t) * 60) / 60 - S0 - 0.002; }
    var dpr = window.devicePixelRatio || 1;

    // ---------------- colours ----------------
    var PAPER = '#fbf3e3', CARDC = '#fffaf0', ESP = '#2b1d10', GOLDP = '#c98a22', GOLD = '#d8932a';

    // ---------------- timing (local s; beats 0.625 apart, bars 1.875) ----------------
    var T_REV = 0.6, T_Q = 0.3125, T_ASKOUT = 3.6;
    var T_ANT = 1.6, T_CARD = 1.875, T_SLOT = 2.5, T_SCR = 3.125, T_LOCK = FL(3.75);
    var DROP_D = 0.6, DROP_X0 = 1 / 2.8;                         // back.out(1.8) first reaches 1 at x = 1/(1+1.8)
    var T_DROP0 = T_LOCK - DROP_X0 * DROP_D;
    var T_L1 = 4.375, T_L2 = 5.625, T_ARC0 = 4.375, SIXT = 0.15625, T_ARC1 = T_ARC0 + 14 * SIXT;   // 6.5625
    var T_DIS = 7.5, T_STEP = FL(9.375), T_REC = 10.0, REC_D = 0.3125;
    var T_QM0 = 10.3125, T_QM1 = 10.85, T_QG = 10.9, T_PER = FL(11.25);
    var T_QL1 = 10.625, T_QL2 = 10.9375, T_QOUT = 14.375;
    var T_MC = FL(15.0), T_R2 = 15.625, T_R3 = 16.25, T_R4 = 16.875, T_HAB = 17.5, T_SRC = 18.125, T_SIG = 18.75;
    var T_FIN = FL(22.5);

    // ---------------- music energy (this stretch: about 0.03 at the start, 0.40 peak, 0.2 to 0.3 after) ----------------
    function eN(t) { return clamp(Math.pow(Math.max(0, u.energy(Math.min(t, 23.0), 0.25)) / 0.32, 0.9), 0, 1.25); }
    function smoothStep(a, b, x) { return u.smooth((x - a) / (b - a)); }
    function blink(t) {                                         // soft-edged on/off, phase locked to the beats
      var ph = (((t % 0.625) + 0.625) % 0.625) / 0.625;
      return 1 - smoothStep(0.5, 0.58, ph) + smoothStep(0.92, 1.0, ph);
    }

    // ---------------- camera: very slow push 1.00 to 1.015, stops on the final F ----------------
    function zoomAt(t) { return 1 + 0.015 * eSine(seg(t, 0, T_FIN)); }

    // =====================================================================================================
    // transition in: this scene goes on top of s09's held last frame, revealed through a soft circle that
    // grows out of the dot; the light front itself is drawn on the front canvas.
    // =====================================================================================================
    // edge(p) = outer edge of the soft circle: opaque inside edge - SOFT, transparent beyond edge; 0 at p = 0
    var TR_D = 0.6, TR_SOFT = 170, TR_RMAX = 1112 + TR_SOFT;
    var eTr = E('sine.inOut');
    function trR(t) { return eTr(clamp(t / TR_D, 0, 1)) * TR_RMAX; }
    ctx.transitionIn({ type: 'custom', duration: TR_D, align: 'after', ease: 'sine.inOut', fn: function (p, i) {
      var R = p * TR_RMAX;
      if (i.out) i.out.style.zIndex = 1;
      if (i.in) {
        i.in.style.zIndex = 2;
        var m = 'radial-gradient(circle at 960px 540px, #000 ' + Math.max(0, R - TR_SOFT).toFixed(1) + 'px, rgba(0,0,0,0) ' + R.toFixed(1) + 'px)';
        i.in.style.webkitMaskImage = m; i.in.style.maskImage = m;
      }
    } });

    // =====================================================================================================
    // paper texture (static canvases, drawn once at build)
    // =====================================================================================================
    var nz = u.makeNoise('s10paper');
    function paperCanvas(w, h, base, seed, o) {
      o = o || {};
      var cv = document.createElement('canvas');
      cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr);
      var g = cv.getContext('2d');
      g.scale(dpr, dpr);
      g.fillStyle = base; g.fillRect(0, 0, w, h);
      // soft mottling (low-res fbm, upscaled smoothly)
      var mw = 120, mh = Math.max(2, Math.round(120 * h / w));
      var mc = document.createElement('canvas'); mc.width = mw; mc.height = mh;
      var mg = mc.getContext('2d'), id = mg.createImageData(mw, mh), nn = u.makeNoise(seed + 'm');
      for (var y = 0; y < mh; y++) for (var x = 0; x < mw; x++) {
        var v = nn.noise2(x * 0.06, y * 0.06) * 0.6 + nn.noise2(x * 0.17 + 9, y * 0.17) * 0.4;
        var k = (y * mw + x) * 4;
        if (v > 0) { id.data[k] = 255; id.data[k + 1] = 252; id.data[k + 2] = 240; id.data[k + 3] = Math.round(v * 255 * (o.mottleLight || 0.22)); }
        else { id.data[k] = 168; id.data[k + 1] = 120; id.data[k + 2] = 60; id.data[k + 3] = Math.round(-v * 255 * (o.mottleDark || 0.07)); }
      }
      mg.putImageData(id, 0, 0);
      g.imageSmoothingEnabled = true; g.imageSmoothingQuality = 'high';
      g.drawImage(mc, 0, 0, w, h);
      // fibres
      var R = u.rand(seed + 'f'), nf = Math.round(w * h / (o.fibreArea || 1400));
      g.lineCap = 'round';
      for (var i = 0; i < nf; i++) {
        var fx = R.range(-20, w + 20), fy = R.range(-20, h + 20), len = R.range(8, 46), ang = R.range(0, TAU), bend = R.range(-0.5, 0.5);
        var dark = R() < 0.55;
        g.strokeStyle = dark ? 'rgba(150,104,48,' + R.range(0.035, 0.085).toFixed(3) + ')' : 'rgba(255,255,250,' + R.range(0.25, 0.55).toFixed(3) + ')';
        g.lineWidth = R.range(0.35, 0.9);
        g.beginPath(); g.moveTo(fx, fy);
        g.quadraticCurveTo(fx + Math.cos(ang + bend) * len * 0.5, fy + Math.sin(ang + bend) * len * 0.5, fx + Math.cos(ang) * len, fy + Math.sin(ang) * len);
        g.stroke();
      }
      // fine tooth (device-pixel noise tile)
      var ts = 192, tc = document.createElement('canvas'); tc.width = tc.height = ts;
      var tg = tc.getContext('2d'), td = tg.createImageData(ts, ts), R2 = u.rand(seed + 't');
      for (var j = 0; j < ts * ts; j++) {
        var q = R2(), kk = j * 4;
        if (q < 0.5) { td.data[kk] = 120; td.data[kk + 1] = 84; td.data[kk + 2] = 40; td.data[kk + 3] = Math.round((0.5 - q) * 2 * 26); }
        else { td.data[kk] = 255; td.data[kk + 1] = 255; td.data[kk + 2] = 255; td.data[kk + 3] = Math.round((q - 0.5) * 2 * 30); }
      }
      tg.putImageData(td, 0, 0);
      g.setTransform(1, 0, 0, 1, 0, 0);
      g.fillStyle = g.createPattern(tc, 'repeat'); g.fillRect(0, 0, cv.width, cv.height);
      // a few faint specks
      g.setTransform(dpr, 0, 0, dpr, 0, 0);
      var ns = Math.round(w * h / 9000);
      for (var s = 0; s < ns; s++) {
        g.fillStyle = 'rgba(120,80,30,' + R.range(0.05, 0.16).toFixed(3) + ')';
        g.beginPath(); g.arc(R.range(0, w), R.range(0, h), R.range(0.4, 1.1), 0, TAU); g.fill();
      }
      cv.style.position = 'absolute'; cv.style.left = '0px'; cv.style.top = '0px';
      cv.style.width = w + 'px'; cv.style.height = h + 'px';
      return cv;
    }

    // =====================================================================================================
    // world (camera layer)
    // =====================================================================================================
    var world = u.el('div', { cls: 'fill', parent: root });
    world.style.transformOrigin = OX + 'px ' + OY + 'px';
    var paper = paperCanvas(W, H, PAPER, 's10p');
    world.appendChild(paper);
    // a warm light pool from the top left (static) and a deeper warm edge
    u.el('div', { cls: 'fill', parent: world, style: { background: 'radial-gradient(ellipse 70% 80% at 30% 18%, rgba(255,252,242,0.55) 0%, rgba(255,252,242,0) 60%)' } });
    u.el('div', { cls: 'fill', parent: world, style: { background: 'radial-gradient(ellipse 85% 80% at 50% 46%, rgba(0,0,0,0) 52%, rgba(200,128,48,0.20) 100%)' } });

    // ---------------- floating gold dust (behind the content, two depths) ----------------
    var MOTES = (function () {
      var R = u.rand('s10motes'), a = [];
      for (var i = 0; i < 64; i++) a.push({ x: R.range(0, W), y: R.range(0, H), d: R() < 0.6 ? 0.45 : 1.0, r: R.range(0.7, 2.0), a: R.range(0.22, 0.55),
        vx: R.range(-5, 5), vy: R.range(-11, -3), ph: R() * TAU, f: R.range(0.25, 0.7) });
      return a;
    })();
    function wrap(v, lo, hi) { var n = hi - lo; return ((v - lo) % n + n) % n + lo; }
    var back = u.canvas(world, function (g, t) {
      var tt = Math.min(t, T_FIN), en = eN(t), z = zoomAt(t);
      var app = seg(t, 0.15, 1.4, eP2o);
      for (var i = 0; i < MOTES.length; i++) {
        var m = MOTES[i];
        var x = wrap(m.x + m.vx * tt + 9 * Math.sin(m.ph + tt * 0.33), -30, W + 30), y = wrap(m.y + m.vy * tt + 6 * Math.cos(m.ph * 1.7 + tt * 0.29), -30, H + 30);
        // parallax: the near layer drifts a little more with the push
        var k = (z - 1) * (m.d - 1) * 1.6; x = OX + (x - OX) * (1 + k); y = OY + (y - OY) * (1 + k);
        var tw = 0.6 + 0.4 * Math.sin(m.ph + tt * m.f * TAU);
        var al = m.a * tw * (0.55 + 0.6 * en) * app;
        if (al < 0.01) continue;
        var r = m.r * (m.d > 0.9 ? 1.5 : 1) * (0.85 + 0.35 * en);
        g.fillStyle = 'rgba(232,170,72,' + (al * 0.28).toFixed(3) + ')';
        g.beginPath(); g.arc(x, y, r * 3.2, 0, TAU); g.fill();
        g.fillStyle = 'rgba(196,128,32,' + al.toFixed(3) + ')';
        g.beginPath(); g.arc(x, y, r, 0, TAU); g.fill();
      }
    });

    // =====================================================================================================
    // 3D stage: the recall card and the method card
    // =====================================================================================================
    var persp = u.el('div', { cls: 'fill', parent: world });
    persp.style.perspective = '1600px'; persp.style.perspectiveOrigin = '960px 470px';

    // ---------------- the recall card (same place and shape as s01's card) ----------------
    var CARD = { x: 500, y: 170, w: 920, h: 520, r: 40 };
    var CCX = CARD.x + CARD.w / 2, CCY = CARD.y + CARD.h / 2;
    var wOuter = u.el('div', { cls: 'abs', parent: persp, style: { left: CARD.x + 'px', top: CARD.y + 'px', width: CARD.w + 'px', height: CARD.h + 'px', transformOrigin: '50% 50%' } });
    wOuter.style.perspective = '1600px';
    var wInner = u.el('div', { cls: 'abs', parent: wOuter, style: { left: 0, top: 0, width: CARD.w + 'px', height: CARD.h + 'px', transformOrigin: '50% 50%', opacity: 0 } });
    var wShadow = u.el('div', { cls: 'abs', parent: wInner, style: { left: '30px', top: '40px', width: (CARD.w - 60) + 'px', height: (CARD.h - 50) + 'px', borderRadius: '60px',
      boxShadow: '0 40px 90px rgba(110,70,20,0.22), 0 12px 30px rgba(110,70,20,0.12)' } });
    var wFace = u.el('div', { cls: 'abs', parent: wInner, style: { left: 0, top: 0, width: CARD.w + 'px', height: CARD.h + 'px', borderRadius: CARD.r + 'px', overflow: 'hidden',
      background: CARDC, boxShadow: '0 6px 0 #ead9b8, 0 7px 0 rgba(150,104,48,0.18), inset 0 1px 0 rgba(255,255,255,0.9)' } });
    var wTex = paperCanvas(CARD.w, CARD.h, CARDC, 's10wc', { mottleLight: 0.3, mottleDark: 0.05, fibreArea: 1100 });
    wFace.appendChild(wTex);
    u.el('div', { cls: 'abs', parent: wFace, style: { left: 0, top: 0, width: CARD.w + 'px', height: CARD.h + 'px', borderRadius: CARD.r + 'px', border: '2px solid #d9a441', boxSizing: 'border-box' } });
    u.el('div', { cls: 'abs', parent: wFace, style: { left: '36px', top: '88px', width: (CARD.w - 72) + 'px', height: '1.5px', background: 'linear-gradient(90deg, rgba(217,164,65,0), rgba(217,164,65,.55) 20%, rgba(217,164,65,.55) 80%, rgba(217,164,65,0))' } });
    [0, 1, 2].forEach(function (i) {
      u.el('div', { cls: 'abs', parent: wFace, style: { left: (42 + 28 * i) + 'px', top: '38px', width: '14px', height: '14px', borderRadius: '50%',
        background: ['#e2a84a', '#e9c27c', '#f1d9a9'][i] } });
    });
    // the gold sheen that crosses the card at the lock
    var wSheen = u.el('div', { cls: 'abs', parent: wFace, style: { left: '-300px', top: '-140px', width: '170px', height: (CARD.h + 280) + 'px',
      background: 'linear-gradient(90deg, rgba(255,226,170,0) 0%, rgba(255,226,170,.22) 50%, rgba(255,226,170,0) 100%)', transform: 'rotate(18deg)' } });

    // countdown ring round the card (s01's ring path, in card coordinates), one bar, linear
    var ringSvg = u.svgEl('svg', { width: CARD.w, height: CARD.h, viewBox: '0 0 ' + CARD.w + ' ' + CARD.h, class: 'fullsvg' }, wInner);
    ringSvg.style.overflow = 'visible';
    var rx0 = -30, ry0 = -30, rx1 = CARD.w + 30, ry1 = CARD.h + 30, rr = 70;
    var ringD = 'M' + (CARD.w / 2) + ',' + ry0 + ' H' + (rx1 - rr) + ' A' + rr + ',' + rr + ' 0 0 1 ' + rx1 + ',' + (ry0 + rr) + ' V' + (ry1 - rr) +
      ' A' + rr + ',' + rr + ' 0 0 1 ' + (rx1 - rr) + ',' + ry1 + ' H' + (rx0 + rr) + ' A' + rr + ',' + rr + ' 0 0 1 ' + rx0 + ',' + (ry1 - rr) +
      ' V' + (ry0 + rr) + ' A' + rr + ',' + rr + ' 0 0 1 ' + (rx0 + rr) + ',' + ry0 + ' H' + (CARD.w / 2);
    var ringTrack = u.path(ringSvg, ringD, { stroke: '#d9a441', 'stroke-width': 1.2, opacity: 0.22 });
    var ringGlow = u.path(ringSvg, ringD, { stroke: '#f0b45a', 'stroke-width': 9, opacity: 0.22 });
    var ring = u.path(ringSvg, ringD, { stroke: '#c98a22', 'stroke-width': 3 });
    gsap.set([ring, ringGlow], { drawSVG: '0% 0%' });
    gsap.set(ringSvg, { opacity: 0 });
    tl.fromTo(ringSvg, { opacity: 0 }, { opacity: 1, duration: 0.25, ease: 'power1.out' }, T_CARD);
    tl.fromTo([ring, ringGlow], { drawSVG: '0% 0%' }, { drawSVG: '0% 100%', duration: T_LOCK - T_CARD, ease: 'none' }, T_CARD);
    tl.to(ringSvg, { opacity: 0, duration: 0.5, ease: 'power1.in' }, 3.95);

    // ---------------- "evıdence": eight fixed cells (the scramble never moves the layout) ----------------
    var LET = ['e', 'v', 'ı', 'd', 'e', 'n', 'c', 'e'];
    var EVFONT = 'italic 400 140px "Source Serif 4 Display"';
    var mctx = document.createElement('canvas').getContext('2d'); mctx.font = EVFONT;
    var CELLW = LET.map(function (ch) { return mctx.measureText(ch).width + 1.4; });
    var evHtml = '<span class="s10mk" style="display:inline-block;width:0;height:0"></span>' +
      LET.map(function (ch, i) { return '<span class="s10c" style="display:inline-block;text-align:left;width:' + CELLW[i].toFixed(2) + 'px"></span>'; }).join('');
    var ev = u.text(wInner, '', 'en', { x: CARD.w / 2, y: 208, html: evHtml, style: { fontSize: '140px', color: ESP, letterSpacing: '0' } });
    var cells = Array.prototype.slice.call(ev.querySelectorAll('.s10c'));
    var evMk = ev.querySelector('.s10mk');
    var evW = ev.offsetWidth, evH = ev.offsetHeight;
    var evL = CARD.w / 2 - evW / 2, evT = 208 - evH / 2;           // card px
    var BASE = evT + evMk.offsetTop;                              // baseline (card px)
    var cellX = cells.map(function (c) { return evL + c.offsetLeft; });
    // the 8 blanks
    var blanks = cells.map(function (c, i) {
      return u.el('div', { cls: 'abs', parent: wInner, style: { left: (cellX[i] + 6) + 'px', top: (BASE + 20) + 'px', width: Math.max(18, CELLW[i] - 14) + 'px', height: '5px', borderRadius: '3px',
        background: 'linear-gradient(90deg, #e2ad55, #c98a22)', opacity: 0.85 } });
    });
    // meaning
    var mean = u.text(wInner, '', 'line', { x: CARD.w / 2, y: 382, html: '<span style="font-family:\'Source Serif 4 Display\';font-style:italic;font-weight:400;color:#b07a26;letter-spacing:0">n.</span> 证据', style: { fontSize: '60px', color: ESP } });

    // the tittle of a real "i" in this font, placed on the ı (card px)
    var TIT = { x: cellX[2] + 30, y: BASE - 96 }, DOT_R = 9;
    (function () {
      var font = EVFONT, Sz = 400;
      function ink(ch) { var c = document.createElement('canvas'); c.width = c.height = Sz; var g = c.getContext('2d', { willReadFrequently: true }); g.font = font; g.fillStyle = '#fff'; g.fillText(ch, 100, 300); return g.getImageData(0, 0, Sz, Sz).data; }
      var a = ink('i'), b = ink('ı'), sx = 0, sy = 0, n = 0, x0 = 1e9, x1 = -1e9;
      for (var y = 0; y < Sz; y++) for (var x = 0; x < Sz; x++) { var k = (y * Sz + x) * 4 + 3, dl = a[k] - b[k]; if (dl > 60) { sx += x * dl; sy += y * dl; n += dl; if (x < x0) x0 = x; if (x > x1) x1 = x; } }
      if (n > 0) { TIT.x = cellX[2] + sx / n - 100; TIT.y = BASE + sy / n - 300; DOT_R = clamp((x1 - x0 + 1) / 2 + 1.5, 8.5, 11); }
      else console.warn('s10: tittle measure failed, using the default');
    })();
    function cardScale(t) { return (0.8 + 0.2 * eExpo(seg(t, T_CARD, T_CARD + 0.95))) * (1 + 0.012 * pulse(t - T_LOCK, 0.03, 0.22)); }
    function cardMap(px, py, t) {                                 // card px -> world px (wInner scale about the card centre)
      var s = cardScale(t), cx = CARD.w / 2, cy = CARD.h / 2;
      return [CARD.x + cx + (px - cx) * s, CARD.y + cy + (py - cy) * s];
    }
    var TITW = [CARD.x + TIT.x, CARD.y + TIT.y];                 // at scale 1
    var SLOT = [CARD.x + cellX[0] - 30, CARD.y + BASE - 36];       // the input slot: left of the first blank, mid x-height

    // ---------------- captions under the card ----------------
    function charsOf(el) { return u.splitChars(el); }
    var question = u.text(world, '还记得开头那个词吗？', 'line', { x: 960, y: 830, style: { fontSize: '60px', color: ESP } });
    var qCh = charsOf(question);
    gsap.set(qCh, { opacity: 0, y: 18 });
    tl.fromTo(qCh, { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out', stagger: 0.045 }, T_Q);
    tl.to(question, { opacity: 0, y: -8, duration: 0.22, ease: 'power2.in' }, T_ASKOUT - 0.22);

    var line1 = u.text(world, '', 'line', { x: 960, y: 800, html: '这个视频里，你已经遇见它<span style="color:#c07f1c">十几次</span>；', style: { fontSize: '52px', color: ESP } });
    var line2 = u.text(world, '', 'line', { x: 960, y: 880, html: '刚才<span style="color:#c07f1c">想起</span>它的那一下，就是方法本身。', style: { fontSize: '52px', color: ESP } });
    var l1Ch = charsOf(line1), l2Ch = charsOf(line2);
    gsap.set(l1Ch.concat(l2Ch), { opacity: 0, y: 20 });
    tl.fromTo(l1Ch, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.6, ease: 'expo.out', stagger: 0.03 }, T_L1);
    tl.fromTo(l2Ch, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.6, ease: 'expo.out', stagger: 0.03 }, T_L2);

    // recede (card and lines), the dot stays
    tl.fromTo(wOuter, { scale: 1, opacity: 1 }, { scale: 0.86, opacity: 0, duration: REC_D, ease: 'power2.in' }, T_REC);
    tl.to([line1, line2], { opacity: 0, y: -10, duration: REC_D, ease: 'power2.in' }, T_REC);

    // =====================================================================================================
    // recall montage: the gold arc and 15 thumbnails
    // =====================================================================================================
    var ARC = (function () {
      var pts = [], N = 420, L = 0;
      for (var i = 0; i <= N; i++) {
        var x = 176 + (1744 - 176) * i / N, uu = (x - 960) / 784;
        var y = 88 + 168 * Math.pow(Math.abs(uu), 3.1);
        if (i) L += Math.hypot(x - pts[i - 1].x, y - pts[i - 1].y);
        pts.push({ x: x, y: y, s: L });
      }
      return { pts: pts, len: L };
    })();
    function arcAt(s) {
      var p = ARC.pts, lo = 0, hi = p.length - 1;
      s = clamp(s, 0, ARC.len);
      while (hi - lo > 1) { var m = (lo + hi) >> 1; if (p[m].s < s) lo = m; else hi = m; }
      var f = (s - p[lo].s) / Math.max(1e-6, p[hi].s - p[lo].s);
      return { x: lerp(p[lo].x, p[hi].x, f), y: lerp(p[lo].y, p[hi].y, f), dx: p[hi].x - p[lo].x, dy: p[hi].y - p[lo].y };
    }
    var NTH = 15, THS = [];
    for (var ti = 0; ti < NTH; ti++) THS.push(ARC.len * ti / (NTH - 1));
    var arcSvg = u.svg(world);
    var arcD = 'M' + ARC.pts.map(function (q) { return q.x.toFixed(1) + ',' + q.y.toFixed(1); }).join(' L');
    var arcGlow = u.path(arcSvg, arcD, { stroke: '#f0b45a', 'stroke-width': 10, opacity: 0.22 });
    var arcLine = u.path(arcSvg, arcD, { stroke: '#cf9330', 'stroke-width': 2.4 });
    gsap.set([arcGlow, arcLine], { drawSVG: '0% 0%' });
    tl.fromTo([arcGlow, arcLine], { drawSVG: '0% 0%' }, { drawSVG: '0% 100%', duration: T_ARC1 - T_ARC0, ease: 'none' }, T_ARC0);
    tl.to([arcGlow, arcLine], { opacity: 0, duration: 0.9, ease: 'power1.in' }, 8.4);

    // line-art icons (72 px badges, no text) for the 15 appearances, in film order
    var STK = '#a8741f', GF = '#e3a63e';
    function star5(r1, r2, rot) {
      var d = '';
      for (var k = 0; k < 10; k++) { var a = rot + k * PI / 5 - PI / 2, r = k % 2 ? r2 : r1; d += (k ? 'L' : 'M') + (r * Math.cos(a)).toFixed(2) + ',' + (r * Math.sin(a)).toFixed(2); }
      return d + 'Z';
    }
    function iconHTML(i) {
      var s = 'fill="none" stroke="' + STK + '" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"';
      if (i === 0) return '<rect x="-23" y="-15" width="46" height="30" rx="6" ' + s + '/>' +
        '<circle cx="-16" cy="-8.5" r="1.7" fill="' + STK + '"/><circle cx="-11" cy="-8.5" r="1.7" fill="' + STK + '"/><circle cx="-6" cy="-8.5" r="1.7" fill="' + STK + '"/>' +
        '<path d="M-13 7 H13" ' + s + '/><circle cx="-3" cy="0" r="2.8" fill="' + GF + '"/>';
      if (i === 1) {
        var w = '<path d="M-14 22 V-20 H14 V22 M-22 22 H22" ' + s + '/>';
        for (var r = 0; r < 4; r++) for (var c = 0; c < 3; c++) {
          var lit = (r === 1 && c === 1);
          w += '<rect x="' + (-10 + c * 7.5) + '" y="' + (-15 + r * 8.5) + '" width="4.6" height="4.6" rx="0.8" ' + (lit ? 'fill="' + GF + '" stroke="' + STK + '" stroke-width="1"' : 'fill="none" stroke="' + STK + '" stroke-width="1.3"') + '/>';
        }
        return w;
      }
      if (i === 2) return '<path d="M-21 -19 V18 H22" ' + s + '/><path d="M-18 -14 C-11 8, -1 12, 21 13.5" ' + s + '/><circle cx="-12.2" cy="-1.5" r="3" fill="' + GF + '"/>';
      if (i === 3) return '<path d="M-15 -21 H7 L15 -13 V21 H-15 Z M7 -21 V-13 H15" ' + s + '/>' +
        '<path d="M-10 -9 H8 M-10 -2 H10 M-10 5 H10 M-10 12 H3" fill="none" stroke="' + STK + '" stroke-width="1.6" stroke-linecap="round"/>' +
        '<path d="M-3 5 H6" stroke="' + GF + '" stroke-width="4" stroke-linecap="round"/>';
      if (i === 4) return '<rect x="-24" y="-16" width="48" height="30" rx="4" ' + s + '/><path d="M-5 -8 L7 -1 L-5 6 Z" fill="' + GF + '" stroke="' + STK + '" stroke-width="1.6" stroke-linejoin="round"/>' +
        '<path d="M-24 21 H24" fill="none" stroke="' + STK + '" stroke-width="1.6" stroke-linecap="round" opacity="0.5"/><path d="M-24 21 H-2" stroke="' + GF + '" stroke-width="2.6" stroke-linecap="round"/>';
      if (i === 5) return '<path d="M0 -13 Q2 -2 13 0 Q2 2 0 13 Q-2 2 -13 0 Q-2 -2 0 -13 Z" fill="' + GF + '" stroke="' + STK + '" stroke-width="1.6" stroke-linejoin="round"/>' +
        '<path d="M-6 -6 L-17 -16 M7 -6 L18 -14 M7 6 L17 16 M-6 6 L-18 15" fill="none" stroke="' + STK + '" stroke-width="1.5" stroke-linecap="round"/>' +
        '<circle cx="-19" cy="-17" r="2.2" fill="' + STK + '"/><circle cx="20" cy="-15" r="2.2" fill="' + STK + '"/><circle cx="19" cy="17" r="2.2" fill="' + STK + '"/><circle cx="-20" cy="16" r="2.2" fill="' + STK + '"/>';
      if (i >= 6 && i <= 13) {
        var k = i - 6, ang = (-90 + k * 45) * PI / 180;
        return '<path d="' + star5(14, 6, k * 0.12) + '" ' + s + '/>' +
          '<circle cx="' + (21 * Math.cos(ang)).toFixed(2) + '" cy="' + (21 * Math.sin(ang)).toFixed(2) + '" r="2.6" fill="' + GF + '"/>';
      }
      // 14: the brightness timeline
      return '<path d="M-24 14 H24" ' + s + '/>' + [-18, -9, 0, 9, 18].map(function (x, j) {
        var r = [1.8, 2.5, 3.3, 4.2, 5.4][j];
        return '<circle cx="' + x + '" cy="' + (14 - 9 - r) + '" r="' + r + '" ' + (j === 4 ? 'fill="' + GF + '" stroke="' + STK + '" stroke-width="1.2"' : 'fill="none" stroke="' + STK + '" stroke-width="1.6"') + '/>';
      }).join('') + '<path d="M-18 -16 L18 -16" stroke="none"/>';
    }
    var ICONS = [];
    for (var ii = 0; ii < NTH; ii++) {
      var pos = arcAt(THS[ii]);
      var g0 = u.svgEl('g', { transform: 'translate(' + pos.x.toFixed(2) + ',' + pos.y.toFixed(2) + ')' }, arcSvg);
      var gi = u.svgEl('g', {}, g0);
      var glow = u.svgEl('circle', { cx: 0, cy: 0, r: 58, fill: 'url(#s10icoGlow)', opacity: 0 }, gi);
      u.svgEl('circle', { cx: 0, cy: 0, r: 35.5, fill: 'rgba(150,100,40,0.10)' }, gi);
      var badge = u.svgEl('circle', { cx: 0, cy: 0, r: 33, fill: CARDC, stroke: '#d9a441', 'stroke-width': 2 }, gi);
      var art = u.svgEl('g', {}, gi); art.innerHTML = iconHTML(ii);
      gsap.set(gi, { opacity: 0, scale: 0.4, transformOrigin: '50% 50%' });
      ICONS.push({ x: pos.x, y: pos.y, g: gi, glow: glow, t: T_ARC0 + ii * SIXT });
    }
    (function () {
      var defs = u.svgEl('defs', {}, arcSvg);
      var rg = u.svgEl('radialGradient', { id: 's10icoGlow' }, defs);
      u.svgEl('stop', { offset: '0%', 'stop-color': '#ffcf70', 'stop-opacity': 0.9 }, rg);
      u.svgEl('stop', { offset: '45%', 'stop-color': '#ffb547', 'stop-opacity': 0.35 }, rg);
      u.svgEl('stop', { offset: '100%', 'stop-color': '#ffb547', 'stop-opacity': 0 }, rg);
    })();
    ICONS.forEach(function (ic, i) {
      tl.fromTo(ic.g, { opacity: 0, scale: 0.4 }, { opacity: 1, scale: 1, duration: 0.42, ease: 'back.out(2.2)' }, ic.t);
      tl.fromTo(ic.glow, { opacity: 0 }, { opacity: 1, duration: 0.05, ease: 'none' }, ic.t);
      tl.to(ic.glow, { opacity: 0.18, duration: 0.5, ease: 'power2.out' }, ic.t + 0.05);
      // Am: all burst into motes (outer ones first, a 32nd apart)
      var td = T_DIS;
      tl.to(ic.glow, { opacity: 1, duration: 0.06, ease: 'none' }, td);
      tl.to(ic.g, { opacity: 0, scale: 1.18, duration: 0.42, ease: 'power2.in' }, td + 0.02);
    });

    // mote paths: along the arc to the point above the ı, then down into it
    var TOP_S = (function () { var best = 0, bd = 1e9; for (var i = 0; i < ARC.pts.length; i++) { var d = Math.abs(ARC.pts[i].x - TITW[0]); if (d < bd) { bd = d; best = ARC.pts[i].s; } } return best; })();
    var MPATH = ICONS.map(function (ic, i) {
      var p = [], s0 = THS[i], dir = TOP_S >= s0 ? 1 : -1, sEnd = TOP_S - dir * 70, steps;
      if (Math.abs(TOP_S - s0) > 75) {
        steps = Math.max(2, Math.round(Math.abs(sEnd - s0) / 6));
        for (var k = 0; k <= steps; k++) { var q = arcAt(lerp(s0, sEnd, k / steps)); p.push([q.x, q.y]); }
      } else p.push([ic.x, ic.y]);
      var a0 = p[p.length - 1], cpt = arcAt(TOP_S), end = [TITW[0], TITW[1]];
      var c1 = [cpt.x, cpt.y + 10];
      for (var k2 = 1; k2 <= 40; k2++) {
        var w = k2 / 40, a = 1 - w;
        p.push([a * a * a0[0] + 2 * a * w * c1[0] + w * w * end[0], a * a * a0[1] + 2 * a * w * c1[1] + w * w * end[1]]);
      }
      var L = [0];
      for (var k3 = 1; k3 < p.length; k3++) L.push(L[k3 - 1] + Math.hypot(p[k3][0] - p[k3 - 1][0], p[k3][1] - p[k3 - 1][1]));
      return { p: p, L: L, len: L[L.length - 1] };
    });
    function mpAt(mp, q) {
      var s = clamp(q, 0, 1) * mp.len, L = mp.L, lo = 0, hi = L.length - 1;
      while (hi - lo > 1) { var m = (lo + hi) >> 1; if (L[m] < s) lo = m; else hi = m; }
      var f = (s - L[lo]) / Math.max(1e-6, L[hi] - L[lo]);
      return [lerp(mp.p[lo][0], mp.p[hi][0], f), lerp(mp.p[lo][1], mp.p[hi][1], f), mp.p[hi][0] - mp.p[lo][0], mp.p[hi][1] - mp.p[lo][1]];
    }
    var RMOTES = (function () {
      var R = u.rand('s10recall'), a = [];
      ICONS.forEach(function (ic, i) {
        var mp = MPATH[i];
        for (var k = 0; k < 30; k++) {
          var ang = R() * TAU, rad = Math.sqrt(R()) * 30;
          var dur = 0.5 + mp.len / 1350 + R.range(-0.08, 0.1), del = R.range(0, 0.28);
          a.push({ i: i, ox: Math.cos(ang) * rad, oy: Math.sin(ang) * rad, t0: T_DIS + 0.02 + del, dur: dur, amp: R.range(-16, 16), ph: R() * TAU,
            r: R.range(1.3, 3.0), hue: R() });
        }
      });
      return a;
    })();
    var RM_LAST = RMOTES.reduce(function (m, p) { return Math.max(m, p.t0 + p.dur); }, 0);
    function absorbed(t) {                                        // fraction of the recall motes that reached the dot
      if (t < T_DIS) return 0;
      var n = 0; for (var i = 0; i < RMOTES.length; i++) if (t >= RMOTES[i].t0 + RMOTES[i].dur) n++;
      return n / RMOTES.length;
    }

    // =====================================================================================================
    // the quote
    // =====================================================================================================
    var QFONT = '900 112px "Noto Serif SC"', QLS = 112 * 0.04;
    function quoteLine(chars, y, goldIdx, dotIdx) {
      var html = chars.map(function (c, i) {
        var st = 'display:inline-block;';
        if (i === goldIdx) st += 'color:#c98a22;';
        return (i === dotIdx ? '<span class="s10qm" style="display:inline-block;width:0;height:0"></span>' : '') + '<span class="s10q" style="' + st + '">' + c + '</span>';
      }).join('');
      return u.text(world, '', 'serif', { x: 960, y: y, html: '<span class="s10qb" style="display:inline-block;width:0;height:0"></span>' + html, style: { fontSize: '112px', color: ESP, letterSpacing: '0.04em', lineHeight: '1.2' } });
    }
    var Q1Y = 372, Q2Y = 536;                                     // 164 px apart: the CJK glyph boxes do not touch
    var q1 = quoteLine(['多', '看', '一', '遍', '，'], Q1Y, -1, -1);
    var q2 = quoteLine(['不', '如', '合', '上', '书', '想', '一', '遍', '。'], Q2Y, 5, 8);
    var q1Ch = Array.prototype.slice.call(q1.querySelectorAll('.s10q')), q2Ch = Array.prototype.slice.call(q2.querySelectorAll('.s10q'));
    var q2Dot = q2Ch[8];
    gsap.set(q2Dot, { opacity: 0 });                              // the full stop is the motif dot
    var q2Vis = q2Ch.slice(0, 8);
    function qWrite(chs, at, each) {
      tl.fromTo(chs, { opacity: 0, y: 14, scale: 1.08, clipPath: 'inset(0% 100% 0% 0%)' },
        { opacity: 1, y: 0, scale: 1, clipPath: 'inset(0% -10% 0% 0%)', duration: each > 0.05 ? 0.42 : 0.3, ease: 'power3.out', stagger: each }, at);
    }
    gsap.set(q1Ch.concat(q2Vis), { opacity: 0 });
    qWrite(q1Ch, T_QL1, 0.0625);
    qWrite(q2Vis, T_QL2, 0.03);
    tl.to([q1, q2], { opacity: 0, duration: 0.12, ease: 'power1.in' }, T_QOUT);
    // where the full stop sits (world px): glyph origin from a marker, ink centroid from the font
    var PER = (function () {
      var mk = q2.querySelector('.s10qm'), w = q2.offsetWidth, h = q2.offsetHeight;
      var ox = 960 - w / 2 + mk.offsetLeft, base = Q2Y - h / 2 + mk.offsetTop;
      var Sz = 300, c = document.createElement('canvas'); c.width = c.height = Sz;
      var g = c.getContext('2d', { willReadFrequently: true }); g.font = QFONT; g.fillStyle = '#fff'; g.fillText('。', 60, 200);
      var d = g.getImageData(0, 0, Sz, Sz).data, sx = 0, sy = 0, n = 0;
      for (var y = 0; y < Sz; y++) for (var x = 0; x < Sz; x++) { var a = d[(y * Sz + x) * 4 + 3]; if (a > 40) { sx += x * a; sy += y * a; n += a; } }
      if (!n) return [ox + 30, base - 20];
      return [ox + sx / n - 60, base + sy / n - 200];
    })();
    var QHOVER = [PER[0] + 44, Q1Y - 4];
    // quote glyph points for the dust (same font, same placement)
    var QPTS = (function () {
      var out = [], c = document.createElement('canvas'); c.width = W; c.height = H;
      var g = c.getContext('2d', { willReadFrequently: true });
      g.font = QFONT; g.fillStyle = '#fff'; g.textBaseline = 'alphabetic'; g.letterSpacing = QLS + 'px';
      [[q1, '多看一遍，', Q1Y], [q2, '不如合上书想一遍', Q2Y]].forEach(function (L) {
        var mk = L[0].querySelector('.s10qb'), w = L[0].offsetWidth, h = L[0].offsetHeight;
        g.fillText(L[1], 960 - w / 2 + mk.offsetLeft, L[2] - h / 2 + mk.offsetTop);
      });
      var d = g.getImageData(0, 0, W, H).data, R = u.rand('s10qd');
      for (var y = 0; y < H; y += 4) for (var x = 0; x < W; x += 4) {
        if (d[(y * W + x) * 4 + 3] > 140) out.push({ x: x + R.range(-1, 1), y: y + R.range(-1, 1) });
      }
      out = R.shuffle(out).slice(0, 2400);
      out.forEach(function (p) {
        p.gold = p.x > 1000 && p.x < 1140 && p.y > 470;                // roughly the 想 glyph
        p.del = R.range(0, 0.1); p.dur = R.range(0.5, 0.78); p.tx = 960 + R.gauss() * 120; p.ty = 470 + R.gauss() * 70;
        p.sw = R.range(-0.9, 0.9); p.r = R.range(1.4, 2.6);
      });
      return out;
    })();

    // =====================================================================================================
    // the method card
    // =====================================================================================================
    var MC = { x: 210, y: 36, w: 1500, h: 900, r: 28 };
    var mShadow = u.el('div', { cls: 'abs', parent: persp, style: { left: (MC.x + 40) + 'px', top: (MC.y + 50) + 'px', width: (MC.w - 80) + 'px', height: (MC.h - 60) + 'px', borderRadius: '60px',
      background: 'rgba(120,80,30,0.10)', boxShadow: '0 50px 110px rgba(110,70,20,0.24), 0 14px 34px rgba(110,70,20,0.12)', opacity: 0, transformOrigin: '50% 50%' } });
    var mCard = u.el('div', { cls: 'abs', parent: persp, style: { left: MC.x + 'px', top: MC.y + 'px', width: MC.w + 'px', height: MC.h + 'px', transformOrigin: '50% 50%', opacity: 0 } });
    var mFace = u.el('div', { cls: 'abs', parent: mCard, style: { left: 0, top: 0, width: MC.w + 'px', height: MC.h + 'px', borderRadius: MC.r + 'px', overflow: 'hidden', background: CARDC,
      boxShadow: '0 6px 0 #e8d6b2, 0 7px 0 rgba(150,104,48,0.2), inset 0 1px 0 rgba(255,255,255,0.9)' } });
    mFace.appendChild(paperCanvas(MC.w, MC.h, CARDC, 's10mc', { mottleLight: 0.3, mottleDark: 0.05, fibreArea: 1100 }));
    // gold foil edge (outer) and a fine inner rule
    u.el('div', { cls: 'abs', parent: mFace, style: { left: 0, top: 0, width: MC.w + 'px', height: MC.h + 'px', borderRadius: MC.r + 'px', border: '2.5px solid #d4a24c', boxSizing: 'border-box' } });
    u.el('div', { cls: 'abs', parent: mFace, style: { left: '14px', top: '14px', width: (MC.w - 28) + 'px', height: (MC.h - 28) + 'px', borderRadius: (MC.r - 10) + 'px', border: '1px solid rgba(201,138,34,0.42)', boxSizing: 'border-box' } });
    var mGlow = u.el('div', { cls: 'abs', parent: mCard, style: { left: 0, top: 0, width: MC.w + 'px', height: MC.h + 'px', borderRadius: MC.r + 'px', boxShadow: '0 0 0 2px rgba(255,200,110,0.9), 0 0 46px rgba(255,180,80,0.55)', opacity: 0 } });
    // the warm light sweep (inside the face)
    var sweep = u.el('div', { cls: 'abs', parent: mFace, style: { left: 0, top: '-300px', width: '560px', height: (MC.h + 600) + 'px', transform: 'translateX(-900px) rotate(24deg)',
      background: 'linear-gradient(90deg, rgba(255,214,140,0) 0%, rgba(255,214,140,.22) 38%, rgba(255,246,222,.55) 50%, rgba(255,214,140,.22) 62%, rgba(255,214,140,0) 100%)', mixBlendMode: 'multiply' } });
    var sweepHi = u.el('div', { cls: 'abs', parent: mFace, style: { left: 0, top: '-300px', width: '560px', height: (MC.h + 600) + 'px', transform: 'translateX(-900px) rotate(24deg)',
      background: 'linear-gradient(90deg, rgba(255,240,200,0) 40%, rgba(255,244,214,.75) 50%, rgba(255,240,200,0) 60%)', mixBlendMode: 'screen' } });
    tl.fromTo([sweep, sweepHi], { x: -900 }, { x: MC.w + 500, duration: 1.25, ease: 'power2.inOut' }, T_SIG);

    // content block: left edge 173, width 1155 (card px)
    var BX = 173, BW = 1155;
    var title = u.text(mCard, '如何真正学好英语', 'headline', { x: MC.w / 2, y: 76, style: { fontSize: '72px', color: ESP, letterSpacing: '0.14em', lineHeight: '1.2' } });
    var tCh = charsOf(title);
    var divider = u.el('div', { cls: 'abs', parent: mCard, style: { left: BX + 'px', top: '138px', width: BW + 'px', height: '2px',
      background: 'linear-gradient(90deg, rgba(201,138,34,0), rgba(201,138,34,.7) 12%, rgba(201,138,34,.7) 88%, rgba(201,138,34,0))', transformOrigin: '50% 50%' } });
    var ROWS = [['读', '爱读的、读得懂的，大量读，大量听。'], ['想', '合上书，把它想起来。'], ['隔', '隔几天，再想一次。'], ['用', '说出来，写出来，看看卡在哪。']];
    // row pitch 112: the 78 px serif glyph boxes (1.45 em) never touch, so QA sees no overlap
    var ROWY = [204, 316, 428, 540], ROWT = [T_MC, T_R2, T_R3, T_R4], GSZ = 78;
    var rowEls = ROWS.map(function (r, i) {
      var row = u.el('div', { cls: 'abs', parent: mCard, style: { left: BX + 'px', top: (ROWY[i] - 56) + 'px', height: '112px', display: 'flex', alignItems: 'center' } });
      var big = u.el('div', { parent: row, text: r[0], style: { fontFamily: 'var(--serif-cn)', fontWeight: 900, fontSize: GSZ + 'px', lineHeight: '1', width: GSZ + 'px', color: GOLDP,
        textShadow: '0 0 22px rgba(255,190,90,0.35)', transformOrigin: '50% 55%' } });
      var txt = u.el('div', { parent: row, text: r[1], style: { fontFamily: 'var(--sans)', fontWeight: 700, fontSize: '44px', lineHeight: '1.3', letterSpacing: '0.05em', color: ESP, marginLeft: '34px', whiteSpace: 'pre' } });
      return { row: row, big: big, txt: txt };
    });
    var habit = u.text(mCard, '每天定时做一点，慢慢成习惯；偶尔漏一天，影响不大。', 'line', { x: BX, y: 632, anchor: 'left', style: { fontSize: '44px', fontWeight: 700, lineHeight: '1.3', letterSpacing: '0.05em', color: ESP } });
    // the 66-cell check-in strip (no dates, no numbers); cell 41 stays empty
    var NC = 66, PITCH = BW / NC, CS = 13.5, BARY = 694;
    var barSvg = u.svgEl('svg', { width: MC.w, height: MC.h, viewBox: '0 0 ' + MC.w + ' ' + MC.h, class: 'fullsvg' }, mCard);
    var cellsOut = [], cellsIn = [];
    for (var ci = 0; ci < NC; ci++) {
      var cx0 = BX + ci * PITCH + (PITCH - CS) / 2;
      cellsOut.push(u.svgEl('rect', { x: cx0.toFixed(2), y: (BARY - CS / 2).toFixed(2), width: CS, height: CS, rx: 3.5, fill: 'none', stroke: 'rgba(201,138,34,0.5)', 'stroke-width': 1.4 }, barSvg));
      if (ci !== 40) cellsIn.push(u.svgEl('rect', { x: (cx0 + 0.7).toFixed(2), y: (BARY - CS / 2 + 0.7).toFixed(2), width: CS - 1.4, height: CS - 1.4, rx: 3, fill: 'url(#s10cell)', opacity: 0 }, barSvg));
      else cellsIn.push(null);
    }
    (function () {
      var defs = u.svgEl('defs', {}, barSvg), lg = u.svgEl('linearGradient', { id: 's10cell', x1: 0, y1: 0, x2: 0, y2: 1 }, defs);
      u.svgEl('stop', { offset: '0%', 'stop-color': '#f6c66a' }, lg); u.svgEl('stop', { offset: '100%', 'stop-color': '#c98a22' }, lg);
    })();
    gsap.set(cellsOut, { opacity: 0 });
    var SRC = ['Krashen, 1982 · Hu & Nation, 2000 · Nakanishi, 2015', 'Roediger & Karpicke, 2006 · Cepeda et al., 2006', 'Swain, 1985 · Lally et al., 2010'];
    var srcEls = SRC.map(function (s, i) {
      return u.text(mCard, s, 'source', { x: BX, y: 746 + 54 * i, anchor: 'left', style: { fontSize: '40px', color: '#6b5640', lineHeight: '1.25' } });
    });
    // the empty gold socket at the top-right corner (the dot lands in it on the final F)
    var SOCK = { x: MC.w - 70, y: 70 };
    var sockSvg = u.svgEl('svg', { width: MC.w, height: MC.h, viewBox: '0 0 ' + MC.w + ' ' + MC.h, class: 'fullsvg' }, mCard);
    var sockG = u.svgEl('g', { transform: 'translate(' + SOCK.x + ',' + SOCK.y + ')' }, sockSvg);
    u.svgEl('circle', { cx: 0, cy: 0, r: 18, fill: 'none', stroke: '#d4a24c', 'stroke-width': 1.6 }, sockG);
    u.svgEl('circle', { cx: 0, cy: 0, r: 25, fill: 'none', stroke: 'rgba(201,138,34,0.35)', 'stroke-width': 1, 'stroke-dasharray': '2 5' }, sockG);
    // gold edge glint (runs round the foil edge with the sweep)
    var edgeSvg = u.svgEl('svg', { width: MC.w, height: MC.h, viewBox: '0 0 ' + MC.w + ' ' + MC.h, class: 'fullsvg' }, mCard);
    edgeSvg.style.overflow = 'visible';
    var er = MC.r, ew = MC.w - 1.25, eh = MC.h - 1.25, e0 = 1.25;
    var edgeD = 'M' + (e0 + er) + ',' + e0 + ' H' + (ew - er) + ' A' + er + ',' + er + ' 0 0 1 ' + ew + ',' + (e0 + er) + ' V' + (eh - er) + ' A' + er + ',' + er + ' 0 0 1 ' + (ew - er) + ',' + eh +
      ' H' + (e0 + er) + ' A' + er + ',' + er + ' 0 0 1 ' + e0 + ',' + (eh - er) + ' V' + (e0 + er) + ' A' + er + ',' + er + ' 0 0 1 ' + (e0 + er) + ',' + e0;
    var glintG = u.path(edgeSvg, edgeD, { stroke: '#ffd98a', 'stroke-width': 9, opacity: 0.0 });
    var glint = u.path(edgeSvg, edgeD, { stroke: '#fff6dc', 'stroke-width': 3, opacity: 0.0 });
    gsap.set([glint, glintG], { drawSVG: '0% 0%' });
    tl.fromTo([glint, glintG], { drawSVG: '0% 0%' }, { drawSVG: '22% 34%', duration: 0.6, ease: 'power1.in' }, T_SIG);
    tl.to([glint, glintG], { drawSVG: '88% 100%', duration: 1.0, ease: 'power1.out' }, T_SIG + 0.6);
    tl.fromTo(glint, { opacity: 0 }, { opacity: 0.95, duration: 0.2 }, T_SIG);
    tl.fromTo(glintG, { opacity: 0 }, { opacity: 0.45, duration: 0.2 }, T_SIG);
    tl.to([glint, glintG], { opacity: 0, duration: 0.4, ease: 'power1.in' }, T_SIG + 1.25);

    // reveals on the beats
    gsap.set(tCh, { opacity: 0, y: 26 });
    gsap.set(divider, { scaleX: 0 });
    rowEls.forEach(function (r) { gsap.set(r.big, { opacity: 0, scale: 1.6 }); gsap.set(r.txt, { opacity: 0, x: -18, clipPath: 'inset(0% 100% 0% 0%)' }); });
    gsap.set(habit, { opacity: 0, clipPath: 'inset(0% 100% 0% 0%)' });
    gsap.set(srcEls, { opacity: 0, y: 10 });
    tl.fromTo(tCh, { opacity: 0, y: 26 }, { opacity: 1, y: 0, duration: 0.7, ease: 'expo.out', stagger: 0.035 }, T_MC);
    tl.fromTo(divider, { scaleX: 0 }, { scaleX: 1, duration: 0.8, ease: 'expo.out' }, T_MC + 0.05);
    rowEls.forEach(function (r, i) {
      tl.fromTo(r.big, { opacity: 0, scale: 1.6 }, { opacity: 1, scale: 1, duration: 0.5, ease: 'back.out(2.4)' }, ROWT[i]);
      tl.fromTo(r.txt, { opacity: 0, x: -18, clipPath: 'inset(0% 100% 0% 0%)' }, { opacity: 1, x: 0, clipPath: 'inset(0% -2% 0% 0%)', duration: 0.6, ease: 'power3.out' }, ROWT[i] + 0.06);
    });
    tl.fromTo(habit, { opacity: 0, clipPath: 'inset(0% 100% 0% 0%)' }, { opacity: 1, clipPath: 'inset(0% -2% 0% 0%)', duration: 0.7, ease: 'power3.out' }, T_HAB);
    tl.fromTo(cellsOut, { opacity: 0 }, { opacity: 1, duration: 0.3, ease: 'power1.out', stagger: 0.003 }, T_HAB);
    for (var sgi = 0; sgi < 6; sgi++) {
      var segCells = cellsIn.slice(sgi * 11, sgi * 11 + 11).filter(Boolean);
      tl.fromTo(segCells, { opacity: 0 }, { opacity: 1, duration: 0.12, ease: 'power1.out', stagger: 0.022 }, T_HAB + sgi * 0.625);
    }
    tl.fromTo(srcEls, { opacity: 0, y: 10 }, { opacity: 0.68, y: 0, duration: 0.7, ease: 'power2.out', stagger: 0.1 }, T_SRC);

    // signature under the card
    var sig = u.text(world, 'B站UP主 朋克英语', 'line', { x: 960, y: 994, style: { fontSize: '56px', fontWeight: 700, color: ESP, letterSpacing: '0.1em' } });
    var sigW = sig.offsetWidth;
    var sigDots = [-1, 1].map(function (sd) {
      return u.el('div', { cls: 'abs', parent: world, style: { left: (960 + sd * (sigW / 2 + 34) - 5) + 'px', top: '989px', width: '10px', height: '10px', borderRadius: '50%', background: '#d8932a',
        boxShadow: '0 0 10px rgba(255,180,80,0.6)' } });
    });
    gsap.set(sig, { opacity: 0, y: 18 }); gsap.set(sigDots, { scale: 0, opacity: 0 });
    tl.fromTo(sig, { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: 0.9, ease: 'power3.out' }, T_SIG);
    tl.fromTo(sigDots, { scale: 0, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.6, ease: 'back.out(2.5)', stagger: 0.08 }, T_SIG + 0.25);

    // method card flight: from depth, rotateX 70 to 0, translateZ -800 to 0, lands on 15.0 with a 3 % rebound
    var MC_T0 = 14.375, eB09 = E('back.out(0.9)'), B09X = 1 / 1.9;   // back.out(0.9) peaks about 1.03
    function mcP(t) { return t < MC_T0 ? 0 : eB09(Math.min(1, B09X * (t - MC_T0) / (T_MC - MC_T0))); }
    var SOCKW = [MC.x + SOCK.x, MC.y + SOCK.y];

    // =====================================================================================================
    // the motif dot: one pure function of t
    // =====================================================================================================
    function bez(p0, p1, p2, p3, s) {
      var a = 1 - s;
      return [a * a * a * p0[0] + 3 * a * a * s * p1[0] + 3 * a * s * s * p2[0] + s * s * s * p3[0], a * a * a * p0[1] + 3 * a * a * s * p1[1] + 3 * a * s * s * p2[1] + s * s * s * p3[1]];
    }
    var C0 = [960, 540];
    var HOVER = [TITW[0], TITW[1] - 64];
    function hop(t, t0, h1, d1, h2, d2) {
      var x = t - t0;
      if (x < 0) return 0;
      if (x < d1) { var a = x / d1; return h1 * 4 * a * (1 - a); }
      if (x < d1 + d2) { var b = (x - d1) / d2; return h2 * 4 * b * (1 - b); }
      return 0;
    }
    function dotPos(t) {
      if (t < T_ANT) return C0;
      if (t < T_CARD) return [C0[0], C0[1] + 10 * seg(t, T_ANT, T_CARD, eP2io)];                     // dip
      if (t < T_SLOT) return bez([C0[0], C0[1] + 10], [C0[0] + 30, C0[1] - 150], [SLOT[0] + 60, SLOT[1] - 80], SLOT, seg(t, T_CARD, T_SLOT, eP3io));
      if (t < T_SCR) return SLOT;
      var tw = cardMap(TIT.x, TIT.y, t);
      if (t < T_DROP0) return bez(SLOT, [SLOT[0] + 10, SLOT[1] - 110], [HOVER[0] - 50, HOVER[1] - 30], HOVER, seg(t, T_SCR, T_DROP0, eP2io));
      if (t < T_DROP0 + DROP_D) return [tw[0], lerp(HOVER[1], tw[1], eBack18(seg(t, T_DROP0, T_DROP0 + DROP_D)))];
      if (t < T_QM0) return [tw[0], tw[1] - hop(t, T_STEP, 18, 0.34, 3.5, 0.16)];
      // to the quote: an arc over line 1, a short gather, the fall into the full stop on the G downbeat
      if (t < T_QM1) return bez(TITW, [TITW[0] + 160, TITW[1] - 120], [QHOVER[0] - 120, QHOVER[1] - 140], QHOVER, seg(t, T_QM0, T_QM1, eP2io));
      if (t < T_QG) return [QHOVER[0], QHOVER[1] - 6 * seg(t, T_QM1, T_QG, eSineO)];
      if (t < T_PER) { var f = seg(t, T_QG, T_PER, eP2i); return [lerp(QHOVER[0], PER[0], f), lerp(QHOVER[1] - 6, PER[1], f)]; }
      if (t < T_SIG) return [PER[0], PER[1] - hop(t, T_PER, 11, 0.2, 3, 0.12)];
      // last flight: a slow arc to the socket, lands on the final F
      if (t < T_FIN) return bez(PER, [PER[0] + 150, PER[1] - 40], [SOCKW[0] + 70, SOCKW[1] + 230], SOCKW, seg(t, T_SIG, T_FIN, eP2io));
      return [SOCKW[0], SOCKW[1] - hop(t, T_FIN, 7, 0.2, 2, 0.12)];
    }
    function dotBright(t) {
      var en = eN(t), b = 0.82;
      if (t < T_SCR) b *= 1.25 * (0.45 + 0.55 * blink(t));                       // the blinking cursor (alone on the paper: a little brighter)
      b += 0.25 * seg(t, T_ANT, T_CARD, eP2io) * (1 - seg(t, T_CARD + 0.2, T_SLOT));
      b += 1.0 * pulse(t - T_LOCK, 0.012, 0.32);
      b += 0.45 * absorbed(t) + 0.25 * smooth01(seg(t, T_STEP, T_STEP + 0.15)) + 0.6 * pulse(t - T_STEP, 0.01, 0.25);
      b += 0.7 * pulse(t - T_PER, 0.012, 0.3) + 0.5 * pulse(t - T_MC, 0.02, 0.4) + 0.45 * pulse(t - T_SIG, 0.02, 0.4) + 0.9 * pulse(t - T_FIN, 0.012, 0.4);
      b *= 0.85 + 0.3 * en;
      if (t > T_FIN + 0.6) b *= 1 + 0.035 * Math.sin((t - T_FIN) * TAU / 2.5);  // a faint breath in the freeze
      else if (t >= T_LOCK) b *= 1 + 0.06 * u.beatPulse(t, 0.2);
      return b;
    }
    function smooth01(x) { return u.smooth(x); }
    function dotRadius(t) {
      var r = DOT_R;
      if (t >= T_QM0 && t < T_SIG) r = lerp(DOT_R, 10.5, seg(t, T_QM0, T_PER));       // a full stop of a 112 px serif
      else if (t >= T_SIG) r = lerp(10.5, DOT_R, seg(t, T_SIG, T_FIN, eP2io));
      if (t < T_SCR) r *= 1 + 0.12 * (1 - seg(t, T_SCR - 0.3, T_SCR));
      return r * (1 - 0.12 * seg(t, T_ANT, T_CARD, eP2io) * (1 - seg(t, T_CARD, T_CARD + 0.2)));
    }
    function drawDot(g, x, y, b, r) {
      b = Math.max(0, b);
      var bb = Math.min(1.7, b), hr = 46 + 38 * bb;
      var h = g.createRadialGradient(x, y, 0, x, y, hr);
      h.addColorStop(0, 'rgba(255,186,80,' + Math.min(0.95, 0.72 * bb).toFixed(3) + ')');
      h.addColorStop(0.16, 'rgba(255,178,66,' + Math.min(0.75, 0.48 * bb).toFixed(3) + ')');
      h.addColorStop(0.45, 'rgba(255,172,60,' + (0.14 * bb).toFixed(3) + ')');
      h.addColorStop(1, 'rgba(255,170,60,0)');
      g.fillStyle = h; g.fillRect(x - hr, y - hr, 2 * hr, 2 * hr);
      // a faint horizontal streak (anamorphic, as in s01)
      var sl = 70 + 70 * bb, st = g.createLinearGradient(x - sl, 0, x + sl, 0);
      st.addColorStop(0, 'rgba(255,190,90,0)'); st.addColorStop(0.5, 'rgba(255,200,110,' + (0.4 * Math.max(0, bb - 0.75)).toFixed(3) + ')'); st.addColorStop(1, 'rgba(255,190,90,0)');
      g.fillStyle = st; g.fillRect(x - sl, y - 1.2, 2 * sl, 2.4);
      var c = g.createRadialGradient(x - r * 0.28, y - r * 0.32, 0, x, y, r);
      c.addColorStop(0, '#fffdf3'); c.addColorStop(0.4, '#ffe09a'); c.addColorStop(0.8, '#eda844'); c.addColorStop(1, '#d08a24');
      g.globalAlpha = clamp(0.45 + 0.55 * b, 0, 1);
      g.fillStyle = c; g.beginPath(); g.arc(x, y, r, 0, TAU); g.fill();
      g.strokeStyle = 'rgba(176,108,24,0.55)'; g.lineWidth = 1; g.stroke();
      g.globalAlpha = 1;
    }
    function glowDisc(g, x, y, r, rgb, a) {
      if (a <= 0.003 || r <= 0) return;
      var gr = g.createRadialGradient(x, y, 0, x, y, r);
      gr.addColorStop(0, 'rgba(' + rgb + ',' + a.toFixed(3) + ')'); gr.addColorStop(1, 'rgba(' + rgb + ',0)');
      g.fillStyle = gr; g.fillRect(x - r, y - r, 2 * r, 2 * r);
    }
    function ringAt(g, x, y, rad, a, w) {
      if (a <= 0.003) return;
      g.strokeStyle = 'rgba(214,146,40,' + a.toFixed(3) + ')'; g.lineWidth = w;
      g.beginPath(); g.arc(x, y, rad, 0, TAU); g.stroke();
      g.strokeStyle = 'rgba(255,196,96,' + (a * 0.35).toFixed(3) + ')'; g.lineWidth = w * 4;
      g.beginPath(); g.arc(x, y, rad, 0, TAU); g.stroke();
    }
    function rrect(g, x, y, w, h, r) { g.beginPath(); g.roundRect(x, y, w, h, r); }

    // =====================================================================================================
    // per-frame state that is not a tween (camera, recall card, scramble, method card flight)
    // =====================================================================================================
    var POOL = 'abcdefghkmnopqrstuvwxyz';
    var lastTxt = [], lastCol = [], lastSh = [], lastXg = '';
    u.onFrame(function (t) {
      world.style.transform = 'scale(' + zoomAt(t).toFixed(6) + ')';
      // recall card: entry scale + small tilt + the bump on the lock
      var s = cardScale(t), op = seg(t, T_CARD, T_CARD + 0.28, eP2o), rx = 9 * (1 - eExpo(seg(t, T_CARD, T_CARD + 0.95)));
      wInner.style.opacity = op.toFixed(4);
      wInner.style.transform = op > 0 ? 'rotateX(' + rx.toFixed(3) + 'deg) scale(' + s.toFixed(5) + ')' : 'scale(0.8)';
      wSheen.style.transform = 'translateX(' + (1700 * eP3o(seg(t, T_LOCK, T_LOCK + 0.9))).toFixed(1) + 'px) rotate(18deg)';
      // scramble: letters wake left to right from 3.125, change 22 times a second, all lock on the G downbeat
      for (var i = 0; i < 8; i++) {
        var wake = T_SCR + i * 0.035, txt, col, sh;
        if (t < wake) { txt = ''; col = ESP; sh = ''; }
        else if (t < T_LOCK) {
          var k = Math.floor((t - T_SCR) * 22);
          txt = POOL.charAt(Math.floor(u.hash(k * 13 + i * 101, 's10scr') * POOL.length));
          col = '#b8894a'; sh = '';
        } else {
          txt = LET[i]; col = ESP;
          var fl = pulse(t - T_LOCK, 0.01, 0.45);
          sh = fl > 0.01 ? '0 0 ' + (8 + 30 * fl).toFixed(1) + 'px rgba(255,180,70,' + (0.85 * fl).toFixed(3) + ')' : '';
        }
        if (lastTxt[i] !== txt) { cells[i].textContent = txt; lastTxt[i] = txt; }
        if (lastCol[i] !== col) { cells[i].style.color = col; lastCol[i] = col; }
        if (lastSh[i] !== sh) { cells[i].style.textShadow = sh; lastSh[i] = sh; }
      }
      var bo = t < T_LOCK ? 0.85 : 0.85 * (1 - seg(t, T_LOCK, T_LOCK + 0.35, eP2o));
      for (var j = 0; j < 8; j++) blanks[j].style.opacity = bo.toFixed(3);
      // method card
      var P = mcP(t);
      if (t < MC_T0) {                                            // every property written on every frame: no seek history
        mCard.style.opacity = '0'; mShadow.style.opacity = '0';
        mCard.style.transform = 'translateZ(-800px) rotateX(70deg)'; mShadow.style.transform = 'scale(0.7) translateY(60px)';
      }
      else {
        var z = -800 * (1 - P), th = 70 * (1 - P);
        mCard.style.opacity = seg(t, MC_T0, MC_T0 + 0.18).toFixed(4);
        mCard.style.transform = 'translateZ(' + z.toFixed(2) + 'px) rotateX(' + th.toFixed(3) + 'deg)';
        var sp = clamp(P, 0, 1);
        mShadow.style.opacity = (seg(t, MC_T0, MC_T0 + 0.3) * (0.25 + 0.75 * sp * sp)).toFixed(4);
        mShadow.style.transform = 'scale(' + (0.7 + 0.3 * sp).toFixed(4) + ') translateY(' + (60 * (1 - sp)).toFixed(1) + 'px)';
      }
      mGlow.style.opacity = (0.75 * pulse(t - T_MC, 0.02, 0.5) + 0.35 * pulse(t - T_FIN, 0.03, 0.6)).toFixed(4);
      // 想 breathes with the music while the quote holds (a pure function of t: written every frame it changes)
      var xg = 0.45 + 0.35 * eN(clamp(t, T_QL2, T_QOUT)) + 0.5 * pulse(t - T_PER, 0.02, 0.5) + 0.3 * pulse(t - 13.125, 0.03, 0.5);
      var sh2 = '0 0 ' + (14 + 16 * xg).toFixed(1) + 'px rgba(255,186,80,' + Math.min(0.8, 0.5 * xg).toFixed(3) + ')';
      if (sh2 !== lastXg) { q2Ch[5].style.textShadow = sh2; lastXg = sh2; }
    });

    // =====================================================================================================
    // front canvas: light front, shock rings, arc spark, recall motes, quote dust, the dot
    // =====================================================================================================
    var front = u.canvas(world, function (g, t) {
      var en = eN(t);
      // 1. the light front of the reveal (warm white, a little gold so it reads on the dark too)
      if (t < TR_D + 0.25) {
        var R = trR(t), fa = 1 - seg(t, TR_D - 0.15, TR_D + 0.25);
        if (R > 2 && fa > 0) {
          // the front: brightest just inside the solid part of the circle, a gold fringe in the soft edge
          var rIn = R - TR_SOFT, r0 = Math.max(0, rIn - 230), r1 = R;
          var gr = g.createRadialGradient(960, 540, r0, 960, 540, r1), span = r1 - r0;
          gr.addColorStop(0, 'rgba(255,244,222,0)');
          gr.addColorStop(clamp((rIn - 10 - r0) / span, 0, 1), 'rgba(255,248,234,' + (0.95 * fa).toFixed(3) + ')');
          gr.addColorStop(clamp((rIn + 70 - r0) / span, 0, 1), 'rgba(255,212,140,' + (0.85 * fa).toFixed(3) + ')');
          gr.addColorStop(1, 'rgba(255,196,110,' + (0.6 * fa).toFixed(3) + ')');
          g.fillStyle = gr; g.fillRect(0, 0, W, H);
        }
        // overexposed paper that settles to cream
        var ex = 1 - seg(t, 0.05, 0.95, eSineO);
        if (ex > 0) { g.fillStyle = 'rgba(255,251,242,' + (0.55 * ex).toFixed(3) + ')'; g.fillRect(0, 0, W, H); }
      }
      // 2. lock: gold shock ring off the card edge + bloom at the dot
      var tau = t - T_LOCK;
      if (tau > 0 && tau < 1.3) {
        g.save();
        for (var e = 0; e < 2; e++) {
          var tt = tau - e * 0.08; if (tt <= 0) continue;
          var sz = 30 + 300 * eExpo(clamp(tt / 1.1, 0, 1)), a = Math.pow(1 - clamp(tt / 1.15, 0, 1), 1.5) * (e ? 0.4 : 0.8);
          rrect(g, CARD.x - sz, CARD.y - sz, CARD.w + 2 * sz, CARD.h + 2 * sz, CARD.r + sz);
          g.strokeStyle = 'rgba(255,190,90,' + (a * 0.3).toFixed(3) + ')'; g.lineWidth = 14; g.stroke();
          g.strokeStyle = 'rgba(207,140,36,' + a.toFixed(3) + ')'; g.lineWidth = 2.6; g.stroke();
        }
        g.restore();
      }
      // 3. the arc tip spark while the thumbnails light
      if (t >= T_ARC0 && t < T_ARC1 + 0.3) {
        var sa = ARC.len * seg(t, T_ARC0, T_ARC1), ap = arcAt(sa), fade = 1 - seg(t, T_ARC1, T_ARC1 + 0.3);
        glowDisc(g, ap.x, ap.y, 34, '255,196,96', 0.55 * fade);
        glowDisc(g, ap.x, ap.y, 7, '255,248,228', 0.95 * fade);
      }
      for (var ic = 0; ic < NTH; ic++) {                          // each light-up flashes once
        var x = t - ICONS[ic].t;
        if (x > 0 && x < 0.7) { var pa = pulse(x, 0.01, 0.16); ringAt(g, ICONS[ic].x, ICONS[ic].y, 34 + 30 * eP2o(clamp(x / 0.6, 0, 1)), 0.55 * (1 - x / 0.7), 1.6); glowDisc(g, ICONS[ic].x, ICONS[ic].y, 60, '255,200,100', 0.35 * pa); }
      }
      // 4. recall motes along the arc into the dot
      if (t >= T_DIS && t < RM_LAST + 0.05) {
        g.save(); g.lineCap = 'round';
        var dp = dotPos(t);
        for (var m = 0; m < RMOTES.length; m++) {
          var pm = RMOTES[m], lx = (t - pm.t0) / pm.dur;
          if (lx < 0 || lx >= 1) continue;
          var q = eP2i(lx), mp = MPATH[pm.i], P0 = mpAt(mp, q), P1 = mpAt(mp, Math.max(0, eP2i(Math.max(0, lx - 0.06))));
          var dl = Math.hypot(P0[2], P0[3]) || 1, nx = -P0[3] / dl, ny = P0[2] / dl;
          var off = pm.amp * Math.sin(pm.ph + q * 8) * Math.pow(1 - q, 1.5), spread = 1 - q;
          var px = P0[0] + nx * off + pm.ox * spread * 0.6, py = P0[1] + ny * off + pm.oy * spread * 0.6;
          if (q > 0.92) { var k2 = (q - 0.92) / 0.08; px = lerp(px, dp[0], k2); py = lerp(py, dp[1], k2); }
          var al = Math.min(1, lx / 0.08) * (0.95 - 0.25 * q) * (0.85 + 0.3 * en);
          var qx = P1[0] + nx * off + pm.ox * spread * 0.6, qy = P1[1] + ny * off + pm.oy * spread * 0.6;
          g.strokeStyle = 'rgba(214,146,40,' + (0.45 * al).toFixed(3) + ')'; g.lineWidth = pm.r * 0.9;
          g.beginPath(); g.moveTo(qx, qy); g.lineTo(px, py); g.stroke();
          glowDisc(g, px, py, pm.r * 3.4, '255,190,90', 0.38 * al);
          g.fillStyle = pm.hue < 0.5 ? 'rgba(206,134,30,' + al.toFixed(3) + ')' : 'rgba(234,168,62,' + al.toFixed(3) + ')';
          g.beginPath(); g.arc(px, py, pm.r, 0, TAU); g.fill();
        }
        g.restore();
      }
      // 5. the quote turns to gold dust that converges on the centre while the card flies in
      if (t >= T_QOUT && t < T_QOUT + 1.0) {
        for (var qi = 0; qi < QPTS.length; qi++) {
          var p = QPTS[qi], lq = (t - T_QOUT - p.del) / p.dur;
          if (lq >= 1) continue;
          lq = Math.max(0, lq);
          var qq = eP3i(lq), ang = p.sw * (1 - qq) * qq * 1.4;
          var dx = lerp(p.x, p.tx, qq) - 960, dy = lerp(p.y, p.ty, qq) - 470;
          var X = 960 + dx * Math.cos(ang) - dy * Math.sin(ang), Y = 470 + dx * Math.sin(ang) + dy * Math.cos(ang);
          var col = seg(t, T_QOUT, T_QOUT + 0.2);
          var aa = (1 - lq * lq) * (0.95);
          var rr2 = p.r * (1 - 0.5 * lq);
          if (col < 1) { g.fillStyle = 'rgba(43,29,16,' + (aa * (1 - col)).toFixed(3) + ')'; g.beginPath(); g.arc(X, Y, rr2, 0, TAU); g.fill(); }
          g.fillStyle = (p.gold ? 'rgba(232,160,50,' : 'rgba(212,142,36,') + (aa * col).toFixed(3) + ')';
          g.beginPath(); g.arc(X, Y, rr2, 0, TAU); g.fill();
        }
        var cf = pulse(t - (T_QOUT + 0.55), 0.06, 0.25);
        glowDisc(g, 960, 470, 260, '255,196,110', 0.22 * cf);
      }
      // 6. card landing breath (a soft ring off the method card edge)
      var tl2 = t - T_MC;
      if (tl2 > 0 && tl2 < 1.1) {
        var sz2 = 10 + 120 * eExpo(clamp(tl2 / 1.0, 0, 1)), a2 = Math.pow(1 - clamp(tl2 / 1.05, 0, 1), 1.6) * 0.45;
        rrect(g, MC.x - sz2, MC.y - sz2, MC.w + 2 * sz2, MC.h + 2 * sz2, MC.r + sz2);
        g.strokeStyle = 'rgba(207,140,36,' + a2.toFixed(3) + ')'; g.lineWidth = 2; g.stroke();
      }
      // 7. the dot (and its rings)
      var d = dotPos(t), b = dotBright(t), r = dotRadius(t);
      var lockR = t - T_LOCK; if (lockR > 0 && lockR < 0.9) ringAt(g, d[0], d[1], 10 + 90 * eP2o(lockR / 0.9), 0.75 * (1 - lockR / 0.9), 2);
      var perR = t - T_PER; if (perR > 0 && perR < 1.1) ringAt(g, d[0], d[1], 12 + 110 * eP2o(perR / 1.1), 0.7 * (1 - perR / 1.1), 1.5);
      var finR = t - T_FIN; if (finR > 0 && finR < 1.6) {
        ringAt(g, d[0], d[1], 16 + 190 * eP2o(finR / 1.6), 0.8 * Math.pow(1 - finR / 1.6, 1.2), 2.2);
        if (finR > 0.12) ringAt(g, d[0], d[1], 16 + 120 * eP2o((finR - 0.12) / 1.48), 0.4 * Math.pow(1 - (finR - 0.12) / 1.48, 1.2), 1.4);
      }
      // a faint trail while it flies
      var moving = (t > T_CARD && t < T_SLOT) || (t > T_SCR && t < T_LOCK) || (t > T_QM0 && t < T_PER) || (t > T_SIG && t < T_FIN);
      if (moving) {
        for (var tr = 1; tr <= 6; tr++) { var dq = dotPos(t - tr * 0.022); glowDisc(g, dq[0], dq[1], r * 1.8, '240,170,70', 0.16 * (1 - tr / 7)); }
      }
      // after the final landing the dot lights the card from its corner (it stays, the frame is frozen)
      var lit = seg(t, T_FIN - 0.05, T_FIN + 0.9, eP2o);
      if (lit > 0) {
        var lg = g.createRadialGradient(d[0], d[1], 0, d[0], d[1], 900);
        lg.addColorStop(0, 'rgba(255,196,110,' + (0.16 * lit).toFixed(3) + ')');
        lg.addColorStop(0.35, 'rgba(255,200,120,' + (0.06 * lit).toFixed(3) + ')');
        lg.addColorStop(1, 'rgba(255,200,120,0)');
        g.fillStyle = lg; g.fillRect(d[0] - 900, d[1] - 900, 1800, 1800);
      }
      drawDot(g, d[0], d[1], b, r);
    });
  });
})();
