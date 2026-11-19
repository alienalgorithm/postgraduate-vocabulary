/* s09  The proof, and the two cards (global 124.967 to 143.092 s, 18.125 s, bars 68 to 77 of the Cornfield Chase edit).
 * Music: intro_b, quiet and warm: G G F F G G Am Am G G (bar 77 has only 2 beats). 128.717 (3.75) G to F is the
 * clearest lift of the scene and the two F bars (3.75 to 7.5) are its loudest (energy 0.25 to 0.34, swells at about
 * 5.2 and 6.8); 132.467 (7.5) back to G drops to about 0.22: the card flip is a settling, not a hit; from 139.967
 * (15.0) the last G fades about 9 dB into s10's opening swell. Beat 0.625 s. Every cue below is from the storyboard.
 *
 *  A 0 to 6.875  s08's golden brain city (top view, on its gold graph paper, 1 px at 15 %) is pressed flat into a
 *     gold horizon (y 860) and lands on beat 2 with a flash; the motif dot is squeezed out of it. Two buildings
 *     rise out of that line like s02's skyline, and they ARE the bar chart: left, gold, every
 *     window lit, 480 px = about 80 %; right, cool slate #5b6478, unlit windows, 220 px with a dissolving top under a
 *     dashed 40 % line = under 40 %. The motif dot arcs from the brain's centre onto the gold roof. The
 *     numbers count up riding the roofs and land on the second G downbeat (1.875) with a 0.12 s rebound. On the G to F
 *     change (3.75) the roof dot steps up a notch and a light sweep climbs the gold tower; word motes rise out of its
 *     windows, while the slate tower leaks grey letters down into the ground. 6.1 to 6.875: the towers sink back into
 *     the horizon and the dot flies up out of frame.
 *  B 6.875 to 11.25  The two face-down cards of s04 come back down out of the dark (one beat, accelerating, riding the
 *     swell on bar 71 beat 3), each carrying half of the dot, now warm. On the G downbeat (7.5) they land and flip over
 *     (CSS 3D, 0.5 s, power3.inOut, lifted off the paper): cream faces 自测 and 分散复习 with a soft gold sheen. Caption
 *     char by char from 7.8125. A gold light passes over each word on bar 73 beats 1 and 2.
 *  C 11.25 to 16.875  Am: 自测 slides to the top-left and dims; the 分散复习 card opens like a tri-fold (CSS 3D, flaps
 *     swing out from behind) into a 1400 x 520 glass chart with cream axes. s03's cold forgetting curve stays as a ghost;
 *     the motif dot rides a gold spaced-recall curve: every recall pulse (11.25, 12.5, 14.375, 16.875, i.e. 2, 3 and 4
 *     beats apart) lifts it back to the top, every fall is flatter, and a dashed gold line through the troughs climbs.
 *     Beat ticks on the time axis let a second viewing count the 2, 3, 4. Labelled 示意; no numbers, no day table, and
 *     no text claims that wider gaps are better (Kim & Webb, 2022: equal and expanding gaps work about the same).
 *  D 16.875 to 18.125  On the fourth pulse the gold curve lifts off the paper and bends into an arc; on 17.5 the arc
 *     closes into a ring that shrinks into one warm dot at the frame centre; everything else dims by 15 % with the
 *     music.
 *
 * Techniques: 1 vector illustration (buildings with windows, line icons, cards), 2 shape morphs (warped streets into
 *   graph paper, card into chart, curve into ring into dot), 4 data visualisation (proportional towers, counters,
 *   dashed 40 % line, spaced-recall curve with ghost, envelope and beat ticks), 5 particles (rising word motes,
 *   leaking letters, landing dust, recall sparks, dust and bokeh), 6 2.5D (parallax camera, CSS 3D card flips with
 *   paper shadows, tri-fold unfold), 8 text effects (char rises, counters, gold glow sweeps, ScrambleText), 11 light
 *   (volumetric rays, light sweep, glows, recall beams), 13 music (cues on downbeats, energy drives every glow, the
 *   motes and the camera breathing).
 *
 * HANDOFF in (cut from s08 at 124.967): s08's HANDOFF out: ground #1a1208, gold grid 1 px at 15 % on x = 960 + 60 n
 *   and y = 860 - 60 n, the top view of the brain city (fissure x 960, y about 325 to 1068). Frame 0 redraws exactly
 *   that: the same grid (same half-pixel offsets) and s08's own last frame of the brain as a 4K plate
 *   (assets/s09/s08_brain.png, captured without the look layer), camera at zoom 1. Measured at the cut: mean
 *   difference 2.2/255, the same as one frame of motion.
 * HANDOFF out (to s10 at 143.092, flash transition aligned after): the last frame is the dimmed paper and one warm gold
 *   dot at (960, 540) (core about 9 px, halo about 40 px); nothing else on screen.
 */
(function () {
  'use strict';

  // real headwords from the user's 70 stories (same pool as s02's windows; never "evidence")
  var MOTE_WORDS = ['showcase', 'brick', 'assess', 'signify', 'patron', 'variable', 'shatter', 'alpine', 'invoke', 'rhythmic',
    'proposal', 'humour', 'crevice', 'novelty', 'glare', 'sensation', 'pavement', 'diminish', 'petition', 'metaphor',
    'convene', 'reliable', 'essence', 'ecology', 'pulse', 'acute', 'snapshot', 'colony', 'recapture', 'disclose',
    'monsoon', 'lifespan', 'viable', 'contrast', 'rigid', 'endurance', 'corridor', 'harness', 'recovery', 'debut',
    'vision', 'outcome', 'debris', 'revisit', 'acquire', 'hybrid', 'fibre', 'resolute', 'aperture', 'catalyst'];

  registerScene('s09', function build(tl, root, ctx) {
    var u = ctx.util, gsap = window.gsap, D = ctx.duration, W = 1920, H = 1080;
    var clamp = u.clamp, lerp = u.lerp, PI = Math.PI, TAU = PI * 2;
    function E(n) { return gsap.parseEase(n); }
    var eSine = E('sine.inOut'), eP2o = E('power2.out'), eP2i = E('power2.in'), eP2io = E('power2.inOut'),
      eP3o = E('power3.out'), eP3i = E('power3.in'), eP3io = E('power3.inOut'), eExpo = E('expo.out');
    function seg(t, a, b, ease) { var x = clamp((t - a) / (b - a), 0, 1); return ease ? ease(x) : x; }
    function env(x, rise, decay) { return x < 0 ? 0 : (1 - Math.exp(-x / rise)) * Math.exp(-x / decay); }
    function smooth(x) { x = clamp(x, 0, 1); return x * x * (3 - 2 * x); }
    function TX(s) { for (var i = 0; i < ctx.texts.length; i++) if (ctx.texts[i].text === s) return ctx.texts[i]; throw new Error('s09: storyboard text missing: ' + s); }
    function esc(s) { return s.replace(/&/g, '&amp;').replace(/</g, '&lt;'); }
    function eN(t) { return clamp((u.energy(t, 0.15) - 0.14) / 0.2, 0, 1); }   // 0.14 (fade) .. 0.34 (F swell)
    function rr(g, x, y, w, h, r) { g.beginPath(); g.moveTo(x + r, y); g.lineTo(x + w - r, y); g.quadraticCurveTo(x + w, y, x + w, y + r); g.lineTo(x + w, y + h - r); g.quadraticCurveTo(x + w, y + h, x + w - r, y + h); g.lineTo(x + r, y + h); g.quadraticCurveTo(x, y + h, x, y + h - r); g.lineTo(x, y + r); g.quadraticCurveTo(x, y, x + r, y); g.closePath(); }
    function glowDisc(g, x, y, r, rgb, a) {
      if (a <= 0.002 || r <= 0.5) return;
      var gr = g.createRadialGradient(x, y, 0, x, y, r);
      gr.addColorStop(0, 'rgba(' + rgb + ',' + a + ')'); gr.addColorStop(0.35, 'rgba(' + rgb + ',' + (a * 0.42) + ')'); gr.addColorStop(1, 'rgba(' + rgb + ',0)');
      g.fillStyle = gr; g.beginPath(); g.arc(x, y, r, 0, TAU); g.fill();
    }
    function dotCore(g, x, y, r, a) {
      if (a <= 0.002) return;
      var gr = g.createRadialGradient(x, y, 0, x, y, r);
      gr.addColorStop(0, 'rgba(255,253,244,' + a + ')'); gr.addColorStop(0.55, 'rgba(255,224,150,' + a + ')'); gr.addColorStop(1, 'rgba(255,190,90,' + (a * 0.0) + ')');
      g.fillStyle = gr; g.beginPath(); g.arc(x, y, r, 0, TAU); g.fill();
    }

    // ---------------- cues (local s; storyboard) ----------------
    var BEAT = 0.625;
    var T_TITLE = 0.3125, T_LAB = 0.625, T_LAND = 1.875, T_F = 3.75, T_F2 = 5.625, T_SINK = 6.1, T_OUT = 6.7, T_FALL = 6.875,
      T_FLIP = 7.5, T_CAP1 = 7.8125, T_SW1 = 9.375, T_SW2 = 10.0, T_ANT = 10.625, T_UNF = 11.25, T_CAP2 = 13.125,
      T_FADE = 15.0, T_P4 = 16.875, T_CLOSE = 17.5;
    var PT = [11.25, 12.5, 14.375, 16.875];      // recall pulses: 2, 3, 4 beats apart
    var tx = {
      wk: TX('一周后'), srcA: TX('Karpicke & Roediger, 2008'), gL: TX('反复回想的单词'), gR: TX('只看不想的'),
      nL: TX('约 80%'), nR: TX('不到 40%'), cA: TX('自测'), cB: TX('分散复习'), cap1: TX('自测和分散复习，被评为效果最好的两种方法。'),
      srcB: TX('Dunlosky et al., 2013'), cap2: TX('合上书，把它想起来；隔几天，再想一次。'), en: TX('spacing'), sk: TX('示意'),
      srcC: TX('Cepeda et al., 2006')
    };
    if (window.CustomEase && !window.CustomEase.get('s09fall')) window.CustomEase.create('s09fall', 'M0,0 C0.3,0 0.6,0.55 0.84,0.92 0.92,1.012 0.96,1 1,1');

    // ---------------- stage: background, camera layers, HUD ----------------
    u.el('div', { cls: 'fill', parent: root, style: { background: 'radial-gradient(ellipse 72% 62% at 50% 50%, #1f160b 0%, #1a1208 58%, #100b05 100%)' } });
    var cam = u.parallax(root, [0.35, 1, 1.6]);
    var Lb = cam.layers[0], Lm = cam.layers[1], Lf = cam.layers[2];
    var hud = u.el('div', { cls: 'fill', parent: root });

    // ---------------- camera: settles out of s08's top view, then a slow push that breathes with the music ----------------
    u.onFrame(function (t) {
      var tt = Math.max(0, t);
      cam.state.zoom = 1 + 0.034 * eSine(seg(tt, 0.6, D)) + 0.004 * eN(tt) * seg(tt, 0, 1.2);
    });

    // ---------------- light: dust, rays, bokeh ----------------
    var dust = u.particles(Lb, { count: 150, seed: 's09dust', colors: ['#ffcf70', '#fff1c9', '#ffb547'], size: [0.7, 2.0], speed: [5, 15], angle: -86, spread: 30, twinkle: 0.6, energy: 0.8 });
    var raysA = u.rays(Lb, { x: 700, y: -220, direction: 180, color: '#ffcf70', count: 8, spread: 26, length: 1250, opacity: 0, blur: 12, sway: 2, seed: 9 });
    var raysC = u.rays(Lb, { x: 960, y: -260, direction: 180, color: '#ffe2a0', count: 10, spread: 40, length: 1350, opacity: 0, blur: 12, sway: 2, seed: 19 });
    var bokeh = u.particles(Lf, { count: 14, seed: 's09bok', colors: ['#ffcf70', '#ffb547', '#ff8a4a'], size: [10, 22], speed: [3, 8], angle: -76, soft: true, energy: 0.6 });
    tl.fromTo(dust.state, { opacity: 0 }, { opacity: 1, duration: 1.4, ease: 'power2.out' }, 0.3);
    tl.fromTo(bokeh.state, { opacity: 0 }, { opacity: 0.4, duration: 1.4, ease: 'power2.out' }, 0.3);
    tl.to(bokeh.state, { opacity: 0.18, duration: 2.5, ease: 'sine.inOut' }, T_FADE);
    tl.to(dust.state, { opacity: 0.55, duration: 2.5, ease: 'sine.inOut' }, T_FADE);

    // =====================================================================================================
    // 1. graph paper, and s08's golden brain pressed flat into the horizon
    // =====================================================================================================
    // s08's last frame (its HANDOFF out): a flat gold grid, 1 px at 15 %, x = 960 + 60 n, y = 860 - 60 n, and the top
    // view of the golden brain city around the fissure x = 960 (y about 325 to 1068). The brain is the plate
    // assets/s09/s08_brain.png: s08's own last frame (global 124.9666) captured at 4K without the engine's look layer,
    // crop x 620..1300, y 300..1080 (css px), so the cut is exact; it is clipped to the brain outline plus a dark margin
    // (half width = 0.765 * s08's outerX(z), measured on s08's frame) and pressed flat into the horizon (y 860) by
    // beat 2. Regenerate it after any change to s08's last beat: node ../s09tools/plate.js (scratchpad), crop as above.
    var PL_X = 620, PL_Y = 300, PL_W = 680, PL_H = 780, BR_Y0 = 322, BR_Y1 = 1070;
    function brainHalf(y) {
      var z = (1068 - y) / 743 * 964, a = Math.abs((z - 482) / 482);
      if (a >= 1) return 0;
      var egg = 1 + 0.08 * (482 - z) / 482, lob = 1 + 0.028 * Math.sin(z * 0.021 + 0.6) + 0.016 * Math.sin(z * 0.052 + 2.1);
      return (9 + 362 * egg * lob * Math.pow(1 - Math.pow(a, 2.4), 1 / 2.4)) * 0.765;
    }
    function brainClip(g, m) {   // the outline grown by m px (a dark margin of the plate's own paper around it)
      g.beginPath();
      var y, first = true, y0 = BR_Y0 - m, y1 = Math.min(PL_Y + PL_H, BR_Y1 + m);
      for (y = y0; y <= y1; y += 3) { var hw = brainHalf(clamp(y, BR_Y0 + 6, BR_Y1 - 6)) + m; if (first) { g.moveTo(960 + hw, y); first = false; } else g.lineTo(960 + hw, y); }
      for (y = y1; y >= y0; y -= 3) { var hw2 = brainHalf(clamp(y, BR_Y0 + 6, BR_Y1 - 6)) + m; g.lineTo(960 - hw2, y); }
      g.closePath();
    }
    var plateHold = u.el('div', { cls: 'abs', parent: root, attrs: { 'data-qa': 'off' }, style: { left: '0px', top: '0px', width: '1px', height: '1px', overflow: 'hidden', opacity: 0 } });
    var plate = u.image('assets/s09/s08_brain.png', { parent: plateHold, width: PL_W, height: PL_H, allowSoft: true });
    var T_SLAM = T_LAB;   // the brain lands flat on beat 2
    function squashK(t) { return 1 - eP2i(seg(t, 0, T_SLAM)); }

    var GXS = [], GYS = [];
    for (var gk = -17; gk <= 17; gk++) GXS.push(960 + 60 * gk);
    for (gk = -4; gk <= 15; gk++) GYS.push(860 - 60 * gk);
    u.canvas(Lb, function (g, t) {
      g.translate(120, 120);
      var tt = Math.max(0, t), i, j;
      var base = 0.15 * (1 + 0.15 * eN(tt) * seg(tt, 0, 1));
      var p = new Path2D();
      for (i = 0; i < GXS.length; i++) { p.moveTo(GXS[i] + 0.5, -120); p.lineTo(GXS[i] + 0.5, 1200); }
      for (j = 0; j < GYS.length; j++) { p.moveTo(-120, GYS[j] + 0.5); p.lineTo(2040, GYS[j] + 0.5); }
      g.lineWidth = 1; g.strokeStyle = 'rgba(255,207,112,' + base.toFixed(4) + ')'; g.stroke(p);
      // every 4th line a little stronger (graph paper major lines), fading in once the brain is gone
      var mj = 0.07 * seg(tt, 0.8, 2.0);
      if (mj > 0.002) {
        var pm = new Path2D();
        for (i = 1; i < GXS.length; i += 4) { pm.moveTo(GXS[i] + 0.5, -120); pm.lineTo(GXS[i] + 0.5, 1200); }
        for (j = 0; j < GYS.length; j += 4) { pm.moveTo(-120, GYS[j] + 0.5); pm.lineTo(2040, GYS[j] + 0.5); }
        g.lineWidth = 1.4; g.strokeStyle = 'rgba(255,207,112,' + mj.toFixed(4) + ')'; g.stroke(pm);
      }
      // s08's brain, pressed flat into the horizon
      var k = squashK(tt);
      if (k > 0.002 && plate.complete && plate.naturalWidth) {
        g.save();
        g.translate(0, 860); g.scale(1, k); g.translate(0, -860);
        brainClip(g, 26); g.clip();
        g.globalAlpha = 1 - 0.2 * seg(tt, 0.35, T_SLAM);
        g.drawImage(plate, PL_X, PL_Y, PL_W, PL_H);
        g.restore();
      }
    }, { x: -120, y: -120, width: 2160, height: 1320 });

    // =====================================================================================================
    // 2. the two towers (bar chart) on the horizon
    // =====================================================================================================
    var GY = 860, BW = 240, BRAD = 22;
    var TW = [
      { cx: 700, h: 480, gold: true },
      { cx: 1220, h: 220, gold: false }
    ];
    var WCOL = [24, 76, 128, 180], WW = 36, WH = 22, WTOP = 36, WP_ = 40;
    TW.forEach(function (b, bi) {
      b.x0 = b.cx - BW / 2;
      b.rows = Math.floor((b.h - WTOP - 12) / WP_) + 1;
      b.win = [];
      for (var r = 0; r < b.rows; r++) for (var c = 0; c < 4; c++) b.win.push({ r: r, c: c, ph: u.hash(r * 4 + c, 's09w' + bi) * TAU, fq: 0.6 + 1.4 * u.hash(r * 4 + c, 's09f' + bi) });
    });
    function riseK(t) {
      var k = eP3o(seg(t, T_SLAM - 0.04, T_LAND));
      if (t > T_LAND && t < T_LAND + 0.24) k += 0.022 * Math.sin(PI * (t - T_LAND) / 0.24);   // 0.12 s up, 0.12 s back
      return k * (1 - eP3i(seg(t, T_SINK, T_FALL)));
    }
    function roofY(b, t) { return GY - b.h * riseK(t); }
    function bodyPath(g, x0, top, w, bottom, r) {
      g.beginPath(); g.moveTo(x0, bottom); g.lineTo(x0, top + r); g.quadraticCurveTo(x0, top, x0 + r, top);
      g.lineTo(x0 + w - r, top); g.quadraticCurveTo(x0 + w, top, x0 + w, top + r); g.lineTo(x0 + w, bottom); g.closePath();
    }
    // motes: gold rises out of the gold tower's windows, grey letters leak down out of the slate one
    var GM = [], GL = [];
    (function () {
      var R = u.rand('s09motes');
      for (var i = 0; i < 64; i++) GM.push({ c: R.int(0, 3), r: R.int(2, TW[0].rows - 1), per: R.range(1.5, 2.8), ph: R(), rise: R.range(120, 300), sw: R.range(4, 12), swf: R.range(0.6, 1.6), sz: R.range(1.2, 2.6), hot: R() < 0.35 });
      for (i = 0; i < 16; i++) GM.push({ side: i % 2 ? 1 : -1, off: R.range(0, 44), y0: R.range(560, 850), per: R.range(2.6, 4.2), ph: R(), rise: R.range(260, 460), sw: R.range(6, 16), swf: R.range(0.4, 1.0),
        word: MOTE_WORDS[(i * 7 + 3) % MOTE_WORDS.length], hot: true });
      var letters = 'abcdefghijklmnoprstuvwy';
      for (i = 0; i < 52; i++) GL.push({ c: R.int(0, 3), r: R.int(0, TW[1].rows - 1), per: R.range(1.1, 2.0), ph: R(), vx: R.range(-14, 14), sz: R.range(1.1, 2.2),
        ch: i % 4 === 0 ? letters[R.int(0, letters.length - 1)] : null });
    })();
    function moteGold(t) { return (0.28 * seg(t, 2.0, 2.8) + 0.72 * seg(t, T_F, T_F + 0.35, eP2o)) * (0.55 + 0.6 * eN(t)) * (1 - seg(t, 6.0, 6.6)); }
    function moteGrey(t) { return seg(t, T_F, T_F + 0.3) * (1 - seg(t, 6.0, 6.5)); }

    u.canvas(Lm, function (g, t) {
      if (t < 0 || t > T_FALL + 0.1) return;
      var en = eN(t), bp = u.beatPulse(t, 0.25);
      // horizon line (draws out from the centre, retracts after the towers sink)
      var Lh = lerp(560, 1120, eP3o(seg(t, T_SLAM, T_SLAM + 0.7))) * (1 - eP3i(seg(t, 6.35, T_FALL)));
      var ha = seg(t, T_SLAM - 0.12, T_SLAM), slam = env(t - T_SLAM, 0.02, 0.45);
      if (Lh > 1 && ha > 0) {
        g.lineCap = 'round';
        g.globalAlpha = ha;
        if (slam > 0.01) { g.save(); g.globalCompositeOperation = 'lighter'; var sg0 = g.createLinearGradient(0, GY - 70, 0, GY + 70);
          sg0.addColorStop(0, 'rgba(255,200,110,0)'); sg0.addColorStop(0.5, 'rgba(255,214,140,' + (0.45 * slam) + ')'); sg0.addColorStop(1, 'rgba(255,200,110,0)');
          g.fillStyle = sg0; g.fillRect(960 - Lh / 2 - 60, GY - 70, Lh + 120, 140); g.restore(); }
        g.strokeStyle = 'rgba(255,181,71,' + (0.12 + 0.3 * slam) + ')'; g.lineWidth = 12; g.beginPath(); g.moveTo(960 - Lh / 2, GY); g.lineTo(960 + Lh / 2, GY); g.stroke();
        g.strokeStyle = 'rgba(255,214,140,' + Math.min(1, 0.8 + 0.2 * slam) + ')'; g.lineWidth = 2 + 1.5 * slam; g.beginPath(); g.moveTo(960 - Lh / 2, GY); g.lineTo(960 + Lh / 2, GY); g.stroke();
        g.globalAlpha = 1;
      }
      TW.forEach(function (b, bi) {
        var k = riseK(t); if (k <= 0.001) return;
        var top = GY - b.h * k, x0 = b.x0, bottom = top + b.h;
        // reflection on the paper (strips of falling alpha)
        g.save();
        g.beginPath(); g.rect(x0 - 30, GY + 2, BW + 60, 130); g.clip();
        for (var s = 0; s < 5; s++) {
          var y0 = GY + 2 + s * 26;
          g.save(); g.beginPath(); g.rect(x0 - 30, y0, BW + 60, 26); g.clip();
          g.globalAlpha = (b.gold ? 0.16 : 0.1) * (1 - s / 5);
          g.translate(0, 2 * GY); g.scale(1, -1);
          bodyPath(g, x0, top, BW, GY, BRAD); g.fillStyle = b.gold ? '#c98a22' : '#5b6478'; g.fill();
          g.restore();
        }
        g.restore();
        g.save();
        g.beginPath(); g.rect(x0 - 80, -200, BW + 160, GY + 200); g.clip();
        if (b.gold) {
          // outer glow (one soft shadow), then the body
          var bgr = g.createLinearGradient(0, top, 0, GY);
          bgr.addColorStop(0, '#d99a3e'); bgr.addColorStop(0.5, '#a76a22'); bgr.addColorStop(1, '#6e4313');
          g.save();
          g.shadowColor = 'rgba(255,170,60,' + (0.45 + 0.25 * en).toFixed(3) + ')'; g.shadowBlur = 46 + 18 * en;
          bodyPath(g, x0, top, BW, bottom, BRAD); g.fillStyle = bgr; g.fill();
          g.restore();
          // rim light
          g.strokeStyle = 'rgba(255,226,160,0.85)'; g.lineWidth = 2; bodyPath(g, x0 + 1, top + 1, BW - 2, bottom, BRAD - 1); g.stroke();
          // windows: all lit, breathing with the beat
          b.win.forEach(function (w) {
            var wy = top + WTOP + w.r * WP_, wx = x0 + WCOL[w.c];
            if (wy > GY - 6) return;
            var lv = 0.82 + 0.1 * Math.sin(t * w.fq * 2.2 + w.ph) + 0.12 * bp * ((w.r + w.c) % 2);
            g.fillStyle = 'rgba(255,214,140,' + (0.28 * lv).toFixed(3) + ')'; rr(g, wx - 4, wy - 4, WW + 8, WH + 8, 6); g.fill();
            g.fillStyle = 'rgba(255,241,201,' + clamp(lv, 0, 1).toFixed(3) + ')'; rr(g, wx, wy, WW, WH, 3); g.fill();
          });
          // the light sweep on the G to F change: bottom to top
          var sw = seg(t, T_F, T_F + 0.95, eP2io), swA = sw > 0 && sw < 1 ? Math.sin(PI * sw) : 0;
          if (swA > 0.01) {
            var ys = lerp(GY + 60, top - 70, sw);
            g.save(); bodyPath(g, x0, top, BW, bottom, BRAD); g.clip();
            g.globalCompositeOperation = 'lighter';
            var sg = g.createLinearGradient(0, ys - 90, 0, ys + 90);
            sg.addColorStop(0, 'rgba(255,246,220,0)'); sg.addColorStop(0.5, 'rgba(255,246,220,' + (0.75 * swA * (0.8 + 0.4 * en)) + ')'); sg.addColorStop(1, 'rgba(255,246,220,0)');
            g.fillStyle = sg; g.fillRect(x0, ys - 90, BW, 180);
            g.restore();
          }
        } else {
          // slate tower: same windows, unlit; the top dissolves (under 40 %)
          var fg = g.createLinearGradient(0, top, 0, GY);
          var f1 = clamp(46 / Math.max(1, GY - top), 0, 1);
          fg.addColorStop(0, 'rgba(91,100,120,0)'); fg.addColorStop(f1, 'rgba(91,100,120,1)'); fg.addColorStop(1, 'rgba(70,77,94,1)');
          bodyPath(g, x0, top, BW, bottom, BRAD); g.fillStyle = fg; g.fill();
          b.win.forEach(function (w) {
            var wy = top + WTOP + w.r * WP_, wx = x0 + WCOL[w.c];
            if (wy > GY - 6) return;
            var a = clamp((wy - top - 4) / 46, 0, 1);
            g.fillStyle = 'rgba(66,73,90,' + a.toFixed(3) + ')'; rr(g, wx, wy, WW, WH, 3); g.fill();
            g.fillStyle = 'rgba(120,130,152,' + (0.35 * a).toFixed(3) + ')'; g.fillRect(wx + 3, wy, WW - 6, 1.5);
          });
        }
        g.restore();
      });
      // dashed 40 % line over the slate tower: it stops short of it
      var dl = seg(t, T_LAND + 0.05, T_LAND + 0.5, eP2o) * (1 - seg(t, 6.0, 6.45));
      if (dl > 0.01) {
        var y40 = GY - 240, xa = 1220 - 150, xb = 1220 + 150;
        g.setLineDash([10, 9]); g.lineWidth = 2; g.strokeStyle = 'rgba(176,186,206,' + (0.55 * dl) + ')';
        g.beginPath(); g.moveTo(1220 - 150 * dl, y40); g.lineTo(1220 + 150 * dl, y40); g.stroke(); g.setLineDash([]);
      }
      // gold motes rising (some are tiny real words), grey letters leaking down into the ground
      var mg = moteGold(t), b0 = TW[0], b1 = TW[1], top0 = roofY(b0, t), top1 = roofY(b1, t);
      if (mg > 0.005) {
        g.save(); g.globalCompositeOperation = 'lighter';
        g.font = 'italic 400 17px "Source Serif 4 Display"'; g.textAlign = 'center';
        GM.forEach(function (m, i) {
          var age = ((t / m.per) + m.ph) % 1, x, y, a;
          if (m.word) {   // tiny real words drift up beside the tower, never across the number
            y = Math.min(m.y0, GY - 12) - m.rise * eP2o(age) * riseK(t);
            x = (m.side < 0 ? b0.x0 - 40 - m.off : b0.x0 + BW + 40 + m.off) + m.sw * Math.sin(t * m.swf + i);
            a = Math.sin(PI * age) * mg;
            g.fillStyle = 'rgba(255,226,160,' + (0.62 * a).toFixed(3) + ')'; g.fillText(m.word, x, y);
            return;
          }
          var wy = top0 + WTOP + m.r * WP_ + WH / 2;   // glitter rising inside the tower, gone before the roof
          if (wy > GY - 10) return;
          y = wy - m.rise * eP2o(age); x = b0.x0 + WCOL[m.c] + WW / 2 + 8 + m.sw * Math.sin(t * m.swf + i);
          a = Math.sin(PI * age) * mg * (m.hot ? 1 : 0.7) * smooth((y - top0 - 6) / 40);
          if (a <= 0.01) return;
          glowDisc(g, x, y, m.sz * 5, '255,236,190', 0.4 * a); g.fillStyle = 'rgba(255,252,240,' + (0.95 * a).toFixed(3) + ')'; g.beginPath(); g.arc(x, y, m.sz, 0, TAU); g.fill();
        });
        g.restore();
      }
      var ml = moteGrey(t);
      if (ml > 0.005) {
        g.save(); g.beginPath(); g.rect(b1.x0 - 80, 0, BW + 160, GY + 26); g.clip();
        g.font = 'italic 400 19px "Source Serif 4 Display"'; g.textAlign = 'center';
        GL.forEach(function (m, i) {
          var age = ((t / m.per) + m.ph) % 1, wy = top1 + WTOP + m.r * WP_ + WH;
          if (wy > GY - 8) return;
          var tt2 = age * m.per, y = wy + 40 * tt2 + 0.5 * 260 * tt2 * tt2, x = b1.x0 + WCOL[m.c] + WW / 2 + m.vx * tt2;
          var a = ml * (age < 0.1 ? age / 0.1 : 1) * (1 - smooth((y - (GY - 30)) / 50)) * 0.8;
          if (a <= 0.01) return;
          if (m.ch) { g.fillStyle = 'rgba(196,204,222,' + a.toFixed(3) + ')'; g.fillText(m.ch, x, y); }
          else { g.fillStyle = 'rgba(186,195,214,' + a.toFixed(3) + ')'; g.beginPath(); g.arc(x, y, m.sz, 0, TAU); g.fill(); }
        });
        g.restore();
      }
    });

    // ---------------- numbers ride the roofs; group names with line icons under the horizon ----------------
    var labels = u.el('div', { cls: 'fill', parent: Lm });
    function numLabel(b, pre, to, gold) {
      var e = u.el('div', { cls: 'abs', parent: labels, style: { left: b.cx + 'px', top: '0px', whiteSpace: 'pre', fontFamily: '"Noto Sans SC"', fontWeight: 900, lineHeight: 1.0, textAlign: 'center' } });
      var s1 = u.el('span', { parent: e, text: pre, style: { fontSize: '60px', fontWeight: 700 } });
      var s2 = u.el('span', { parent: e, text: '0', style: { fontSize: '112px' } });
      var s3 = u.el('span', { parent: e, text: '%', style: { fontSize: '72px' } });
      [s1, s2, s3].forEach(function (s) {
        if (gold) s.className = 'grad-gold';
        else s.style.color = '#aab3c6';
      });
      gsap.set(e, { xPercent: -50, yPercent: -100, transformOrigin: '50% 100%' });
      if (gold) e.style.filter = 'drop-shadow(0 0 16px rgba(255,190,90,0.45))';
      return { el: e, num: s2, to: to, b: b };
    }
    var NL = numLabel(TW[0], '约 ', 80, true), NR = numLabel(TW[1], '不到 ', 40, false);
    if ('约 ' + NL.to + '%' !== tx.nL.text || '不到 ' + NR.to + '%' !== tx.nR.text) throw new Error('s09: number text mismatch');
    u.onFrame(function (t) {
      NL.el.style.top = (roofY(TW[0], Math.max(0, t)) - 34).toFixed(2) + 'px';
      NR.el.style.top = (roofY(TW[1], Math.max(0, t)) - 38).toFixed(2) + 'px';
    });
    [NL, NR].forEach(function (n, i) {
      tl.fromTo(n.el, { opacity: 0 }, { opacity: 1, duration: 0.35, ease: 'power2.out' }, T_LAB);
      tl.add(u.counter(n.num, { from: 0, to: n.to, duration: T_LAND - T_LAB, ease: 'power2.out' }), T_LAB);
      tl.to(n.el, { keyframes: [{ scale: 1.1, duration: 0.12, ease: 'power2.out' }, { scale: 1, duration: 0.28, ease: 'back.out(2)' }] }, T_LAND);
      tl.to(n.el, { opacity: 0, scale: 0.94, duration: 0.3, ease: 'power2.in' }, T_OUT - 0.3);
    });
    var glowNL = u.energyGlow(NL.el, { color: '#ffb547', min: 8, max: 24, hit: 0.6, mode: 'filter' });

    function groupLabel(b, str, iconKind, gold) {
      var box = u.el('div', { cls: 'abs', parent: labels, style: { left: b.cx + 'px', top: '914px', display: 'flex', alignItems: 'center', gap: '18px', whiteSpace: 'nowrap' } });
      gsap.set(box, { xPercent: -50, yPercent: -50 });
      var svg = u.svgEl('svg', { width: 72, height: 72, viewBox: '0 0 72 72' }, box);
      svg.style.overflow = 'visible'; svg.style.flex = '0 0 72px';
      var col = gold ? '#ffcf70' : '#8f98ac', paths = [];
      if (iconKind === 'card') {
        paths.push(u.path(svg, 'M14,18 L58,18 Q64,18 64,24 L64,50 Q64,56 58,56 L14,56 Q8,56 8,50 L8,24 Q8,18 14,18 Z', { stroke: col, 'stroke-width': 3 }));
        paths.push(u.path(svg, 'M18,32 L44,32', { stroke: col, 'stroke-width': 3 }));
        paths.push(u.path(svg, 'M18,43 L36,43', { stroke: col, 'stroke-width': 3 }));
        var dot = u.svgEl('circle', { cx: 53, cy: 29, r: 3.6, fill: '#fff1c9' }, svg);
        svg.style.filter = 'drop-shadow(0 0 6px rgba(255,190,90,0.9)) drop-shadow(0 0 16px rgba(255,170,60,0.5))';
        paths.dot = dot;
      } else {
        paths.push(u.path(svg, 'M6,36 Q36,8 66,36 Q36,64 6,36 Z', { stroke: col, 'stroke-width': 3 }));
        paths.push(u.path(svg, 'M36,26 A10,10 0 1,1 35.99,26 Z', { stroke: col, 'stroke-width': 3 }));
        u.svgEl('circle', { cx: 36, cy: 36, r: 3.4, fill: col }, svg);
      }
      var lab = u.el('div', { parent: box, text: str, style: { fontFamily: '"Noto Sans SC"', fontWeight: 700, fontSize: '44px', letterSpacing: '0.06em', color: gold ? '#fff1c9' : '#a4adc0' } });
      if (gold) lab.style.textShadow = '0 0 18px rgba(255,190,90,0.35)';
      return { box: box, svg: svg, paths: paths, lab: lab };
    }
    var GLb = groupLabel(TW[0], tx.gL.text, 'card', true), GRb = groupLabel(TW[1], tx.gR.text, 'eye', false);
    [GLb, GRb].forEach(function (q, i) {
      gsap.set(q.paths, { drawSVG: '0% 0%' });
      tl.to(q.paths, { drawSVG: '0% 100%', duration: 0.6, ease: 'power2.inOut', stagger: 0.08 }, T_LAB);
      var ch = u.splitChars(q.lab);
      tl.fromTo(ch, { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.45, ease: 'power3.out', stagger: 0.04 }, T_LAB + 0.05);
      tl.to(q.box, { opacity: 0, y: 10, duration: 0.3, ease: 'power2.in' }, T_OUT - 0.3);
    });

    // ---------------- HUD: 一周后 and the first source ----------------
    var wk = u.text(hud, tx.wk.text, 'small', { x: 960, y: 116, style: { fontSize: '52px', fontWeight: 700, color: '#ffcf70', letterSpacing: '0.3em', paddingLeft: '0.3em', textShadow: '0 0 20px rgba(255,190,90,0.45)' } });
    var wkCh = u.splitChars(wk);
    var hudSvg = u.svg(hud);
    var wkL = u.line(hudSvg, 852, 118, 760, 118, { stroke: '#ffcf70', 'stroke-width': 1.6, opacity: 0.7 });
    var wkR = u.line(hudSvg, 1068, 118, 1160, 118, { stroke: '#ffcf70', 'stroke-width': 1.6, opacity: 0.7 });
    gsap.set([wkL, wkR], { drawSVG: '0% 0%' });
    tl.fromTo(wkCh, { opacity: 0, y: 22 }, { opacity: 1, y: 0, duration: 0.55, ease: 'power3.out', stagger: 0.08 }, T_TITLE);
    tl.to([wkL, wkR], { drawSVG: '0% 100%', duration: 0.7, ease: 'power2.inOut' }, T_TITLE + 0.1);
    tl.to([wk, wkL, wkR], { opacity: 0, duration: 0.3, ease: 'power2.in' }, T_OUT - 0.3);

    function source(e) {
      var s = u.text(hud, e.text, 'source', { x: 1860, y: 1040, anchor: 'bottom-right', style: { color: '#d9c39a', opacity: 0.72 } });
      tl.fromTo(s, { opacity: 0, x: 24 }, { opacity: 0.72, x: 0, duration: 0.6, ease: 'power3.out' }, e.in);
      tl.to(s, { opacity: 0, duration: 0.25, ease: 'power2.in' }, e.out - 0.25);
      return s;
    }
    source(tx.srcA); source(tx.srcB); source(tx.srcC);

    // =====================================================================================================
    // 3. the two face-down cards of s04 fall back and flip
    // =====================================================================================================
    var CW = 440, CH = 280, CY = 450;
    var shadows = u.el('div', { cls: 'fill', parent: Lm });
    var panelPersp = u.el('div', { cls: 'fill', parent: Lm, style: { perspective: '2400px', perspectiveOrigin: '960px 520px' } });
    var chartBase = null;   // created below (needs the panel first in DOM order)
    var chartTexts = null;
    var cardsWrap = null;

    // ---- chart panel (tri-fold) ----
    var PCX = 960, PCY = 520, PW3 = 1400 / 3, PH = 520;
    var GLASS = 'linear-gradient(172deg, rgba(62,39,17,0.74) 0%, rgba(34,21,9,0.8) 100%)';
    var CREAM = 'linear-gradient(160deg, #fffdf6 0%, #fbf3e3 60%, #f3e6cc 100%)';
    var center = u.el('div', { cls: 'abs', parent: panelPersp, style: { transformStyle: 'preserve-3d' } });
    function facePair(parent, extra) {
      var gl = u.el('div', { cls: 'abs', parent: parent, style: Object.assign({ left: '0px', top: '0px', width: '100%', height: '100%', background: GLASS, borderColor: 'rgba(255,207,112,0.4)', borderStyle: 'solid', borderWidth: '1.5px' }, extra || {}) });
      var cr = u.el('div', { cls: 'abs', parent: parent, style: Object.assign({ left: '0px', top: '0px', width: '100%', height: '100%', background: CREAM, borderColor: '#d8a443', borderStyle: 'solid', borderWidth: '2px' }, extra || {}) });
      return { gl: gl, cr: cr };
    }
    var cFaces = facePair(center, { boxShadow: '0 30px 80px rgba(0,0,0,0.45)' });
    u.el('div', { cls: 'abs', parent: cFaces.cr, style: { left: '12px', top: '12px', right: '12px', bottom: '12px', borderRadius: '14px', border: '1px solid rgba(201,138,34,0.42)' } });
    var cFlash = u.el('div', { cls: 'abs', parent: center, style: { left: '0px', top: '0px', width: '100%', height: '100%', borderRadius: '24px', opacity: 0,
      background: 'radial-gradient(ellipse 75% 70% at 50% 50%, rgba(255,236,190,0.95) 0%, rgba(255,207,112,0.55) 40%, rgba(255,181,71,0.12) 75%, rgba(255,181,71,0) 100%)' } });
    var flapL = u.el('div', { cls: 'abs', parent: center, style: { transformStyle: 'preserve-3d', transformOrigin: '100% 50%', backfaceVisibility: 'hidden' } });
    var flapR = u.el('div', { cls: 'abs', parent: center, style: { transformStyle: 'preserve-3d', transformOrigin: '0% 50%', backfaceVisibility: 'hidden' } });
    var fL = facePair(flapL, { backfaceVisibility: 'hidden', borderRightWidth: '0px', boxShadow: '0 30px 80px rgba(0,0,0,0.4)' });
    var fR = facePair(flapR, { backfaceVisibility: 'hidden', borderLeftWidth: '0px', boxShadow: '0 30px 80px rgba(0,0,0,0.4)' });
    // fold creases
    var creaseL = u.el('div', { cls: 'abs', parent: flapL, style: { right: '0px', top: '0px', width: '2px', height: '100%', background: 'linear-gradient(90deg, rgba(0,0,0,0.35), rgba(255,226,160,0.18))', backfaceVisibility: 'hidden' } });
    var creaseR = u.el('div', { cls: 'abs', parent: flapR, style: { left: '0px', top: '0px', width: '2px', height: '100%', background: 'linear-gradient(90deg, rgba(255,226,160,0.18), rgba(0,0,0,0.35))', backfaceVisibility: 'hidden' } });
    gsap.set([center, flapL, flapR], { force3D: true });

    var CRECT = { x: 1220, y: CY - 8, w: CW * 1.03, h: CH * 1.03 };   // the 分散复习 card at the swap (after its anticipation)
    var PS = { cx: 0, cy: 0, w: 0, h: 0, th: 180, cream: 1, vis: false, left: 0, right: 0, top: 0, bottom: 0, op: 1 };
    function panelState(t) {
      var c = eP3o(seg(t, T_UNF, T_UNF + 0.42));
      PS.vis = t >= T_UNF && t < 17.6;
      PS.cx = lerp(CRECT.x, PCX, c); PS.cy = lerp(CRECT.y, PCY, c);
      PS.w = lerp(CRECT.w, PW3, c); PS.h = lerp(CRECT.h, PH, c);
      PS.th = 180 * (1 - eExpo(seg(t, T_UNF + 0.02, T_UNF + 0.72)));
      PS.cream = 1 - seg(t, T_UNF + 0.02, T_UNF + 0.24, eP2o);
      PS.op = 1 - seg(t, T_P4 + 0.05, T_CLOSE, eP2i);
      // projected outer edges of the flaps (perspective 2400 about x 960)
      var cosT = Math.cos(PS.th * PI / 180), sinT = Math.sin(PS.th * PI / 180), P = 2400;
      var xl = PS.cx - PS.w / 2, xr = PS.cx + PS.w / 2;
      PS.left = cosT > 0 ? 960 + (xl - PS.w * cosT - 960) * P / (P + PS.w * sinT) : xl;
      PS.right = cosT > 0 ? 960 + (xr + PS.w * cosT - 960) * P / (P + PS.w * sinT) : xr;
      PS.top = PS.cy - PS.h / 2; PS.bottom = PS.cy + PS.h / 2;
      return PS;
    }
    u.onFrame(function (t) {
      var s = panelState(t);
      panelPersp.style.display = s.vis ? '' : 'none';   // every style below is still written, so the state is f(t)
      center.style.left = (s.cx - s.w / 2).toFixed(2) + 'px'; center.style.top = (s.cy - s.h / 2).toFixed(2) + 'px';
      center.style.width = s.w.toFixed(2) + 'px'; center.style.height = s.h.toFixed(2) + 'px';
      center.style.opacity = s.op.toFixed(4);
      var open = 1 - s.th / 180, rad = 24 * (1 - open) + 0, radO = lerp(24, 18, open);
      [cFaces.gl, cFaces.cr].forEach(function (e) { e.style.borderRadius = rad.toFixed(2) + 'px'; });
      cFaces.cr.style.opacity = s.cream.toFixed(4);
      [fL.gl, fL.cr].forEach(function (e) { e.style.borderRadius = radO.toFixed(1) + 'px 0px 0px ' + radO.toFixed(1) + 'px'; });
      [fR.gl, fR.cr].forEach(function (e) { e.style.borderRadius = '0px ' + radO.toFixed(1) + 'px ' + radO.toFixed(1) + 'px 0px'; });
      fL.cr.style.opacity = fR.cr.style.opacity = s.cream.toFixed(4);
      cFlash.style.opacity = (0.85 * env(t - T_UNF, 0.025, 0.28)).toFixed(4);
      flapL.style.left = (-s.w).toFixed(2) + 'px'; flapL.style.top = '0px'; flapL.style.width = s.w.toFixed(2) + 'px'; flapL.style.height = s.h.toFixed(2) + 'px';
      flapR.style.left = s.w.toFixed(2) + 'px'; flapR.style.top = '0px'; flapR.style.width = s.w.toFixed(2) + 'px'; flapR.style.height = s.h.toFixed(2) + 'px';
      flapL.style.transform = 'rotateY(' + (-s.th).toFixed(3) + 'deg)';
      flapR.style.transform = 'rotateY(' + s.th.toFixed(3) + 'deg)';
      var hideFl = s.th > 89.5 ? 'hidden' : 'inherit';
      flapL.style.visibility = flapR.style.visibility = hideFl;
    });

    // ---- chart base canvas: axes, ghost forgetting curve, gold area, envelope, ticks ----
    var AXX = 300, AXY = 710, RSC = 370, CX0 = 330, SPX = 105, XEND = 1625;
    function cyR(R) { return AXY - R * RSC; }
    function cxB(xb) { return CX0 + xb * SPX; }
    var PB = [1.7, 3.7, 6.7, 10.7];
    var SEGS = [{ tau: 0.9, a: 0.18 }, { tau: 2.0, a: 0.30 }, { tau: 4.0, a: 0.45 }, { tau: 8.0, a: 0.60 }, { tau: 16, a: 0.72 }];
    var RISE = 0.22, HB_STOP = 10.7 + 0.32;
    var TR = [];
    (function () {
      var prev = SEGS[0].a + (1 - SEGS[0].a) * Math.exp(-PB[0] / SEGS[0].tau); TR.push(prev);
      for (var k = 1; k < 4; k++) { var s = SEGS[k], d = PB[k] - PB[k - 1]; TR.push(s.a + (1 - s.a) * Math.exp(-(d - RISE) / s.tau)); }
    })();
    function Rc(xb) {
      var k = 0; while (k < 4 && xb >= PB[k]) k++;
      if (k === 0) return SEGS[0].a + (1 - SEGS[0].a) * Math.exp(-xb / SEGS[0].tau);
      var d = xb - PB[k - 1], tr = TR[k - 1];
      if (d < RISE) return tr + (1 - tr) * smooth(d / RISE);
      var s = SEGS[k]; return s.a + (1 - s.a) * Math.exp(-(d - RISE) / s.tau);
    }
    function Rg(xb) { return SEGS[0].a + (1 - SEGS[0].a) * Math.exp(-xb / SEGS[0].tau); }
    function headB(t) { return clamp(PB[0] + (t - T_UNF) / BEAT, PB[0], HB_STOP); }
    var TRP = TR.map(function (r, k) { return { x: cxB(PB[k]), y: cyR(r) }; });
    function chartAlpha(t) { return seg(t, T_UNF + 0.08, T_UNF + 0.4) * (1 - seg(t, T_P4 + 0.05, T_CLOSE, eP2i)); }
    function clipPanel(g, s) { g.beginPath(); g.rect(s.left + 2, s.top + 2, s.right - s.left - 4, s.bottom - s.top - 4); g.clip(); }

    chartBase = u.canvas(Lm, function (g, t) {
      var ca = chartAlpha(t); if (ca <= 0.002 || t < T_UNF) return;
      var s = panelState(t);
      g.save(); clipPanel(g, s);
      g.globalAlpha = ca;
      // gold area under the drawn part of the recall curve, fading out towards the moving head
      var hb = headB(t), ap = new Path2D(), xb;
      ap.moveTo(cxB(0), AXY);
      for (xb = 0; xb <= hb; xb += 0.03) ap.lineTo(cxB(xb), cyR(Rc(xb)));
      ap.lineTo(cxB(hb), cyR(Rc(hb))); ap.lineTo(cxB(hb), AXY); ap.closePath();
      var ag = g.createLinearGradient(0, cyR(1), 0, AXY);
      ag.addColorStop(0, 'rgba(255,190,90,0.16)'); ag.addColorStop(1, 'rgba(255,190,90,0)');
      g.fillStyle = ag; g.fill(ap);
      var hxa = cxB(hb), fo = g.createLinearGradient(hxa - 90, 0, hxa, 0);
      fo.addColorStop(0, 'rgba(0,0,0,0)'); fo.addColorStop(1, 'rgba(0,0,0,1)');
      g.globalCompositeOperation = 'destination-out'; g.fillStyle = fo; g.fillRect(hxa - 90, 280, 92, AXY - 270);
      g.globalCompositeOperation = 'source-over';
      // axes (cream hairlines with small arrowheads)
      g.lineCap = 'round'; g.lineJoin = 'round';
      g.strokeStyle = 'rgba(255,241,201,0.62)'; g.lineWidth = 2;
      g.beginPath(); g.moveTo(AXX, AXY + 8); g.lineTo(AXX, 300); g.moveTo(AXX - 8, 312); g.lineTo(AXX, 298); g.lineTo(AXX + 8, 312);
      g.moveTo(AXX - 8, AXY); g.lineTo(XEND, AXY); g.moveTo(XEND - 12, AXY - 8); g.lineTo(XEND + 2, AXY); g.lineTo(XEND - 12, AXY + 8); g.stroke();
      // the "full" level, very faint
      g.setLineDash([3, 9]); g.strokeStyle = 'rgba(255,241,201,0.16)'; g.lineWidth = 1.5;
      g.beginPath(); g.moveTo(AXX + 6, cyR(1)); g.lineTo(XEND - 30, cyR(1)); g.stroke(); g.setLineDash([]);
      // ghost: s03's cold forgetting curve
      var gp = new Path2D();
      for (xb = 0; xb <= 12.4; xb += 0.04) { if (xb) gp.lineTo(cxB(xb), cyR(Rg(xb))); else gp.moveTo(cxB(0), cyR(1)); }
      g.strokeStyle = 'rgba(127,166,224,0.13)'; g.lineWidth = 12; g.stroke(gp);
      g.strokeStyle = 'rgba(169,200,255,0.42)'; g.lineWidth = 3; g.stroke(gp);
      // beat ticks on the time axis as the head passes (count them: 2, 3, 4 between the pulses)
      g.strokeStyle = 'rgba(255,241,201,0.38)'; g.lineWidth = 1.5;
      g.beginPath();
      for (var bt = 1; bt <= Math.floor(hb) && bt <= 11; bt++) { var xt = cxB(bt); g.moveTo(xt, AXY + 2); g.lineTo(xt, AXY + 11); }
      g.stroke();
      // recall marks on the axis + hollow markers on the troughs + the dashed envelope through them
      for (var k = 0; k < 4; k++) {
        var on = seg(t, PT[k], PT[k] + 0.25, eP2o); if (on <= 0) continue;
        var xp = cxB(PB[k]);
        g.strokeStyle = 'rgba(255,207,112,' + (0.9 * on) + ')'; g.lineWidth = 3;
        g.beginPath(); g.moveTo(xp, AXY - 9); g.lineTo(xp, AXY + 9); g.stroke();
        g.strokeStyle = 'rgba(255,214,140,' + (0.85 * on) + ')'; g.lineWidth = 2.2;
        g.beginPath(); g.arc(TRP[k].x, TRP[k].y, 7.5, 0, TAU); g.stroke();
        if (k > 0) {
          var dk = seg(t, PT[k] + 0.08, PT[k] + 0.6, eP2o); if (dk <= 0) continue;
          var a0 = TRP[k - 1], a1 = TRP[k], ux = a1.x - a0.x, uy = a1.y - a0.y, L = Math.sqrt(ux * ux + uy * uy);
          var sx = a0.x + ux / L * 10, sy = a0.y + uy / L * 10, ex = a0.x + ux * dk - ux / L * 10 * dk, ey = a0.y + uy * dk - uy / L * 10 * dk;
          g.setLineDash([10, 9]); g.strokeStyle = 'rgba(255,207,112,0.75)'; g.lineWidth = 2.2;
          g.beginPath(); g.moveTo(sx, sy); g.lineTo(ex, ey); g.stroke(); g.setLineDash([]);
        }
      }
      g.restore();
    });

    // ---- chart texts: 示意 (corner tag) and spacing (beside the curve) ----
    chartTexts = u.el('div', { cls: 'fill', parent: Lm });
    var tag = u.el('div', { cls: 'abs', parent: chartTexts, text: tx.sk.text, style: { right: (1920 - 1636) + 'px', top: '280px', fontFamily: '"Noto Sans SC"', fontWeight: 500, fontSize: '40px', lineHeight: '50px',
      letterSpacing: '0.12em', paddingLeft: '16px', paddingRight: '11px', color: '#e9cf98', border: '1.5px solid rgba(255,207,112,0.5)', borderRadius: '12px', background: 'rgba(26,18,8,0.35)' } });
    tl.fromTo(tag, { opacity: 0, y: -10 }, { opacity: 1, y: 0, duration: 0.5, ease: 'power3.out' }, tx.sk.in);
    tl.to(tag, { opacity: 0, duration: 0.3, ease: 'power2.in' }, tx.sk.out - 0.3);
    var enEl = u.text(chartTexts, '', 'en', { x: 1306, y: 524, style: { color: '#ffd98a' } });
    tl.fromTo(enEl, { opacity: 0 }, { opacity: 1, duration: 0.3, ease: 'power2.out' }, tx.en.in);
    tl.to(enEl, { duration: 0.95, scrambleText: { text: tx.en.text, chars: 'lowerCase', revealDelay: 0.25, speed: 0.6 }, ease: 'none' }, tx.en.in);
    tl.to(enEl, { opacity: 0, duration: 0.3, ease: 'power2.in' }, tx.en.out - 0.3);
    var enGlow = u.energyGlow(enEl, { color: '#ffb547', min: 6, max: 26, hit: 0.5, mode: 'text' });

    // ---- the cards ----
    cardsWrap = u.el('div', { cls: 'fill', parent: Lm, style: { perspective: '1600px', perspectiveOrigin: '960px 450px' } });
    function makeCard(name, cx, side) {
      var c = { cx: cx, side: side };
      c.shadow = u.el('div', { cls: 'abs', parent: shadows, style: { left: (cx - 270 + 16) + 'px', top: (CY - 175 + 34) + 'px', width: '540px', height: '350px', borderRadius: '50%',
        background: 'radial-gradient(ellipse at 50% 50%, rgba(0,0,0,0.62) 0%, rgba(0,0,0,0.38) 38%, rgba(0,0,0,0) 70%)', opacity: 0 } });
      c.wrap = u.el('div', { cls: 'abs', parent: cardsWrap, style: { left: (cx - CW / 2) + 'px', top: (CY - CH / 2) + 'px', width: CW + 'px', height: CH + 'px', transformStyle: 'preserve-3d' } });
      c.flo = u.el('div', { cls: 'abs', parent: c.wrap, style: { left: '0px', top: '0px', width: CW + 'px', height: CH + 'px', transformStyle: 'preserve-3d' } });
      c.inner = u.el('div', { cls: 'abs', parent: c.flo, style: { left: '0px', top: '0px', width: CW + 'px', height: CH + 'px', transformStyle: 'preserve-3d' } });
      var faceSt = { left: '0px', top: '0px', width: CW + 'px', height: CH + 'px', borderRadius: '24px', backfaceVisibility: 'hidden', overflow: 'hidden' };
      // back: the same face-down card as in s04 (navy glass, inner line, the dot), but the dot is warm now
      c.back = u.el('div', { cls: 'abs', parent: c.inner, style: Object.assign({}, faceSt, { background: 'linear-gradient(160deg, #1d2742 0%, #0d1428 100%)', border: '1.5px solid rgba(170,190,240,0.32)',
        boxShadow: '0 26px 60px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.18)' }) });
      u.el('div', { cls: 'abs', parent: c.back, style: { left: '12px', top: '12px', right: '12px', bottom: '12px', borderRadius: '14px', border: '1px solid rgba(160,180,230,0.16)' } });
      u.el('div', { cls: 'abs', parent: c.back, style: { left: '0px', top: '0px', width: '100%', height: '50%', background: 'linear-gradient(180deg, rgba(255,255,255,0.07), rgba(255,255,255,0))' } });
      c.halo = u.el('div', { cls: 'abs', parent: c.back, style: { left: (CW / 2 - 110) + 'px', top: (CH / 2 - 110) + 'px', width: '220px', height: '220px', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(255,236,190,0.8) 0%, rgba(255,207,112,0.4) 15%, rgba(255,181,71,0.12) 42%, rgba(255,181,71,0) 70%)' } });
      c.core = u.el('div', { cls: 'abs', parent: c.back, style: { left: (CW / 2 - 12) + 'px', top: (CH / 2 - 12) + 'px', width: '24px', height: '24px', borderRadius: '50%',
        background: 'radial-gradient(circle, #fffaf0 0%, #ffe2a0 45%, #ffcf70 70%, #c98a22 100%)', boxShadow: '0 0 18px rgba(255,207,112,0.9)' } });
      // front: cream paper, gold line, the method name
      c.front = u.el('div', { cls: 'abs', parent: c.inner, style: Object.assign({}, faceSt, { transform: 'rotateY(180deg)', background: CREAM, border: '2px solid #d8a443',
        boxShadow: '0 26px 60px rgba(0,0,0,0.45), inset 0 0 0 1px rgba(255,255,255,0.55)' }) });
      u.el('div', { cls: 'abs', parent: c.front, style: { left: '12px', top: '12px', right: '12px', bottom: '12px', borderRadius: '14px', border: '1px solid rgba(201,138,34,0.42)' } });
      c.label = u.el('div', { cls: 'abs', parent: c.front, text: name, style: { left: '0px', top: '0px', width: CW + 'px', height: CH + 'px', lineHeight: CH + 'px', textAlign: 'center',
        fontFamily: '"Noto Sans SC"', fontWeight: 900, fontSize: '96px', letterSpacing: '0.04em', paddingLeft: '0.04em', color: '#2b1d10' } });
      c.flash = u.el('div', { cls: 'abs', parent: c.front, style: { left: '0px', top: '0px', width: '100%', height: '100%', background: 'radial-gradient(ellipse 70% 80% at 50% 50%, rgba(255,214,130,0.75) 0%, rgba(255,207,112,0.25) 45%, rgba(255,207,112,0) 80%)', opacity: 0 } });
      c.sheen = u.el('div', { cls: 'abs', parent: c.front, style: { left: '-200px', top: '-80px', width: '150px', height: (CH + 160) + 'px', transform: 'rotate(18deg)', background: 'linear-gradient(90deg, rgba(255,207,112,0) 0%, rgba(255,207,112,0.38) 50%, rgba(255,207,112,0) 100%)' } });
      c.dim = u.el('div', { cls: 'abs', parent: c.front, style: { left: '0px', top: '0px', width: '100%', height: '100%', background: '#1a1208', opacity: 0 } });
      gsap.set([c.wrap, c.flo, c.inner], { force3D: true });
      gsap.set(c.wrap, { autoAlpha: 0 });
      gsap.set(c.front, { opacity: 0 });
      return c;
    }
    var cardA = makeCard(tx.cA.text, 700, -1), cardB = makeCard(tx.cB.text, 1220, 1);
    // gold glow passes over the two words on bar 73 (created before anything moves the labels)
    var swA = u.glowSweep(cardA.label, { duration: 0.9, color: '#d8932a', base: '#2b1d10', glow: false, band: 0.22 });
    var swB = u.glowSweep(cardB.label, { duration: 0.9, color: '#d8932a', base: '#2b1d10', glow: false, band: 0.22 });
    [cardA, cardB].forEach(function (c, i) {
      // fall: one beat, accelerating, a soft catch on the G downbeat
      tl.to(c.wrap, { autoAlpha: 1, duration: 0.001 }, T_FALL);
      tl.fromTo(c.wrap, { y: -540, rotationX: 34, rotationZ: -6 * c.side }, { y: 0, rotationX: 0, rotationZ: 0, duration: T_FLIP - T_FALL, ease: 's09fall', immediateRender: false }, T_FALL);
      tl.fromTo(c.shadow, { opacity: 0, scale: 1.6 }, { opacity: 0.62, scale: 1, duration: T_FLIP - T_FALL, ease: 's09fall', immediateRender: false }, T_FALL);
      // flip on landing (settling)
      tl.fromTo(c.inner, { rotationY: 0 }, { rotationY: 180, duration: 0.5, ease: 'power3.inOut', immediateRender: false }, T_FLIP);
      tl.set(c.front, { opacity: 1 }, T_FLIP + 0.14);
      tl.set(c.back, { opacity: 0 }, T_FLIP + 0.36);
      tl.to(c.shadow, { keyframes: [{ scale: 1.12, opacity: 0.38, duration: 0.25, ease: 'power2.out' }, { scale: 1, opacity: 0.6, duration: 0.3, ease: 'power2.inOut' }] }, T_FLIP);
      tl.fromTo(c.flash, { opacity: 0 }, { keyframes: [{ opacity: 0.85, duration: 0.18, ease: 'power2.out' }, { opacity: 0, duration: 0.55, ease: 'power2.in' }], immediateRender: false }, T_FLIP + 0.26);
      tl.fromTo(c.sheen, { x: 0 }, { x: CW + 360, duration: 0.7, ease: 'power2.inOut', immediateRender: false }, T_FLIP + 0.3);
      // the back's dot glows up just before the flip
      tl.fromTo(c.halo, { scale: 0.85, opacity: 0.8 }, { scale: 1.25, opacity: 1, duration: 0.45, ease: 'power2.in', immediateRender: false }, T_FLIP - 0.45);
    });
    tl.add(swA, T_SW1); tl.add(swB, T_SW2);
    // 自测 slides to the top-left and dims one notch, then leaves with its text
    tl.to(cardA.wrap, { x: 222 - 700, y: 136 - CY, scale: 0.46, duration: 0.75, ease: 'power3.out' }, T_UNF);
    tl.to(cardA.shadow, { x: 222 - 700, y: 136 - CY, scale: 0.46, opacity: 0.35, duration: 0.75, ease: 'power3.out' }, T_UNF);
    tl.to(cardA.dim, { opacity: 0.3, duration: 0.6, ease: 'power2.out' }, T_UNF + 0.1);
    tl.to([cardA.wrap, cardA.shadow], { autoAlpha: 0, duration: 0.3, ease: 'power2.in' }, tx.cA.out - 0.3);
    // 分散复习: anticipation, its word fades, then the card becomes the panel (swap on the Am downbeat)
    tl.to(cardB.wrap, { y: -8, scale: 1.03, duration: T_UNF - T_ANT, ease: 'power2.inOut' }, T_ANT);
    tl.to(cardB.label, { opacity: 0, duration: 0.25, ease: 'power2.in' }, tx.cB.out - 0.25);
    tl.set([cardB.wrap], { autoAlpha: 0 }, T_UNF);
    tl.to(cardB.shadow, { opacity: 0, duration: 0.3, ease: 'power2.out' }, T_UNF);
    // landing / floating: squash on landing, lift during the flip, a slow float while they rest
    u.onFrame(function (t) {
      [cardA, cardB].forEach(function (c, i) {
        var land = t - T_FLIP, sq = land > 0 && land < 0.3 ? Math.sin(PI * land / 0.3) * Math.exp(-land / 0.2) : 0;
        var fl = eP3io(seg(t, T_FLIP, T_FLIP + 0.5)), lift = Math.sin(PI * fl);
        var amp = seg(t, 8.0, 8.8, eSine) * (c === cardB ? 1 - seg(t, 10.2, T_ANT, eSine) : 1);
        var fy = amp * 4 * Math.sin(TAU * (t - 8) / 3.75 + i * 1.3), rz = amp * 0.6 * Math.sin(TAU * (t - 8) / 5 + i * 2.1);
        c.flo.style.transform = 'translate3d(0px,' + fy.toFixed(3) + 'px,' + (70 * lift).toFixed(3) + 'px) rotateZ(' + rz.toFixed(4) + 'deg) scale(' + (1 + 0.03 * sq).toFixed(5) + ',' + (1 - 0.04 * sq).toFixed(5) + ')';
      });
    });

    // ---------------- HUD captions ----------------
    var cap1 = u.text(hud, tx.cap1.text, 'line', { x: 960, y: 916, style: { fontSize: '54px', color: '#fff1c9', textShadow: '0 0 22px rgba(255,190,90,0.35)' } });
    var cap1Ch = u.splitChars(cap1);
    tl.fromTo(cap1Ch, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.5, ease: 'power3.out', stagger: 0.035 }, tx.cap1.in);
    tl.to(cap1, { opacity: 0, y: 8, duration: 0.3, ease: 'power2.in' }, tx.cap1.out - 0.3);
    var c2s = tx.cap2.text, gold = 'color:#ffcf70;text-shadow:0 0 18px rgba(255,190,90,0.55)';
    function wrapSub(str, subs) {
      var out = '', i = 0;
      while (i < str.length) {
        var hit = null; subs.forEach(function (s) { if (!hit && str.substr(i, s.length) === s) hit = s; });
        if (hit) { out += '<span style="' + gold + '">' + esc(hit) + '</span>'; i += hit.length; } else { out += esc(str[i]); i++; }
      }
      return out;
    }
    var cap2 = u.text(hud, '', 'line', { x: 960, y: 140, html: wrapSub(c2s, ['想起来', '再想一次']), style: { fontSize: '60px', color: '#fff1c9', textShadow: '0 0 22px rgba(255,190,90,0.3)' } });
    if (cap2.textContent !== c2s) throw new Error('s09: caption 2 text mismatch');
    var cap2Ch = u.splitChars(cap2);
    tl.fromTo(cap2Ch, { opacity: 0, y: 22 }, { opacity: 1, y: 0, duration: 0.5, ease: 'power3.out', stagger: 0.03 }, tx.cap2.in);
    tl.to(cap2, { opacity: 0, y: -8, duration: 0.3, ease: 'power2.in' }, tx.cap2.out - 0.3);

    // ---------------- light over the whole scene ----------------
    var dimOv = u.el('div', { cls: 'abs', parent: Lm, style: { left: '-200px', top: '-200px', width: '2320px', height: '1480px', background: '#0b0703', opacity: 0 } });
    u.onFrame(function (t) {
      var tt = Math.max(0, t), en = eN(tt);
      var sweep = env(tt - T_F, 0.12, 0.9);
      raysA.state.opacity = (0.08 + 0.2 * sweep + 0.08 * en) * seg(tt, 0.2, 1.4) * (1 - seg(tt, 6.0, 6.9));
      raysC.state.opacity = (0.06 + 0.07 * en + 0.08 * env(tt - T_FLIP, 0.2, 0.8)) * seg(tt, 6.6, 7.6) * (1 - 0.6 * seg(tt, T_FADE, 17.8));
      dimOv.style.opacity = (0.15 * eSine(seg(tt, T_FADE, 17.7))).toFixed(4);
    });

    // =====================================================================================================
    // 4. the motif: roof star, flight, the recall curve and its pulses, the ring, the last dot
    // =====================================================================================================
    var C0 = { x: 960, y: 689 };
    var SPK = [];   // recall sparks
    (function () { var R = u.rand('s09spk'); for (var i = 0; i < 4 * 14; i++) SPK.push({ a: R.range(-PI * 0.95, -PI * 0.05), v: R.range(80, 260), s: R.range(1.2, 2.6), l: R.range(0.5, 0.9) }); })();
    var DUST = [];  // landing dust under the cards
    (function () { var R = u.rand('s09dst'); for (var i = 0; i < 2 * 18; i++) DUST.push({ x: R.range(-0.5, 0.5), vx: R.range(-90, 90), vy: R.range(-60, -10), s: R.range(1, 2.4), l: R.range(0.45, 0.8) }); })();
    function roofDot(t) {   // position of the motif dot in part A
      var b = TW[0], ry = roofY(b, t) - 15;
      var e = eP2io(seg(t, 0.12, 1.75));
      return { x: lerp(C0.x, b.cx, e), y: lerp(C0.y, ry, e) - 150 * Math.sin(PI * e) };
    }
    function flightDot(t) {   // 6.15 to 6.85: up and out of frame
      var p0 = roofDot(6.15), f = eP2i(seg(t, 6.15, 6.85));
      var cx1 = 760, cy1 = 140, x2 = 960, y2 = -90, m = 1 - f;
      return { x: m * m * p0.x + 2 * m * f * cx1 + f * f * x2, y: m * m * p0.y + 2 * m * f * cy1 + f * f * y2 };
    }
    // curve samples (built per frame into these arrays)
    var NSMP = 520, CXa = new Float32Array(NSMP), CYa = new Float32Array(NSMP);
    var NF = 1400, FX = new Float32Array(NF), FY = new Float32Array(NF), FLn = new Float32Array(NF);

    u.canvas(Lm, function (g, t) {
      var tt = Math.max(0, t), en = eN(tt);
      g.lineCap = 'round'; g.lineJoin = 'round';
      // ---- part A: the star on the gold roof ----
      if (tt < 6.9) {
        var p = tt < 6.15 ? roofDot(tt) : flightDot(tt);
        var lvl = (0.72 + 0.28 * seg(tt, T_F, T_F + 0.3, eP2o)) * seg(tt, 0.04, 0.3);
        var hit = env(tt - T_F, 0.04, 0.5) + 0.5 * env(tt - T_LAND, 0.04, 0.35) + 0.4 * env(tt - T_F2, 0.05, 0.5);
        var sc = 1 + 0.3 * seg(tt, T_F, T_F + 0.3, eP2o) + 0.3 * hit;
        g.save(); g.globalCompositeOperation = 'lighter';
        if (tt >= 6.15) {   // comet trail
          for (var q = 1; q <= 12; q++) { var pq = flightDot(tt - q * 0.018); glowDisc(g, pq.x, pq.y, 16 - q, '255,214,140', 0.22 * (1 - q / 13)); }
        }
        glowDisc(g, p.x, p.y, (40 + 22 * en + 26 * hit) * sc, '255,190,90', 0.42 * lvl);
        glowDisc(g, p.x, p.y, 14 * sc, '255,236,190', 0.9 * lvl);
        g.restore();
        dotCore(g, p.x, p.y, 8.5 * sc, seg(tt, 0.04, 0.3));
        // ripples across the roof: landing, the F lift, the second F bar (flat, so they never touch the number)
        if (tt < 6.15) [[T_LAND, 0.55, 80], [T_F, 0.9, 150], [T_F2, 0.5, 110]].forEach(function (rg) {
          var a = tt - rg[0]; if (a < 0 || a > 1.0) return;
          var rx = 12 + rg[2] * eP2o(a / 1.0), ry = rx * 0.11, ry0 = roofY(TW[0], tt);
          g.strokeStyle = 'rgba(255,226,160,' + (rg[1] * (1 - a / 1.0)).toFixed(3) + ')'; g.lineWidth = 2;
          g.beginPath(); g.ellipse(p.x, ry0, rx, ry, 0, 0, TAU); g.stroke();
        });
      }
      // ---- part B: settling dust where the cards land ----
      var la = tt - T_FLIP;
      if (la > 0 && la < 0.9) {
        g.save(); g.globalCompositeOperation = 'lighter';
        DUST.forEach(function (d, i) {
          var c = i < 18 ? cardA : cardB, life = d.l; if (la > life) return;
          var x = c.cx + d.x * CW + d.vx * la, y = CY + CH / 2 + 6 + d.vy * la + 60 * la * la;
          g.fillStyle = 'rgba(255,226,160,' + (0.55 * (1 - la / life)).toFixed(3) + ')';
          g.beginPath(); g.arc(x, y, d.s, 0, TAU); g.fill();
        });
        g.restore();
      }
      // ---- part C/D: the recall curve ----
      if (tt < T_UNF) return;
      var s = panelState(tt), hb = headB(tt);
      var m = eP2io(seg(tt, T_P4, T_CLOSE));                     // curve -> arc
      var span = TAU * (0.84 + 0.16 * eP2o(seg(tt, T_CLOSE, T_CLOSE + 0.3)));
      var ph0 = PI / 2 + (TAU - span) / 2;                       // a horseshoe over the top, its gap closing at the bottom
      var shrink = eP3i(seg(tt, 17.6, 18.0));
      var cmv = eSine(seg(tt, T_CLOSE, 18.0)), ccx = lerp(930, 960, cmv), ccy = lerp(512, 540, cmv), rad = 168 * (1 - shrink);
      var n = Math.max(2, Math.round(NSMP * hb / HB_STOP)), i, x, y;
      if (m <= 0) {
        for (i = 0; i < n; i++) { var xb = hb * i / (n - 1); CXa[i] = cxB(xb); CYa[i] = cyR(Rc(xb)); }
      } else {
        // resample the curve by arc length, so every stretch of it takes an equal stretch of the ring
        var nf = Math.max(2, Math.round(NF * hb / HB_STOP)), j = 0;
        for (i = 0; i < nf; i++) {
          var xf = hb * i / (nf - 1); FX[i] = cxB(xf); FY[i] = cyR(Rc(xf));
          FLn[i] = i ? FLn[i - 1] + Math.sqrt((FX[i] - FX[i - 1]) * (FX[i] - FX[i - 1]) + (FY[i] - FY[i - 1]) * (FY[i] - FY[i - 1])) : 0;
        }
        var Lt = FLn[nf - 1];
        for (i = 0; i < n; i++) {
          var Ls = Lt * i / (n - 1);
          while (j < nf - 2 && FLn[j + 1] < Ls) j++;
          var ff = clamp((Ls - FLn[j]) / Math.max(1e-6, FLn[j + 1] - FLn[j]), 0, 1);
          x = lerp(FX[j], FX[j + 1], ff); y = lerp(FY[j], FY[j + 1], ff);
          var ph = ph0 + span * (i / (n - 1));
          CXa[i] = lerp(x, ccx + rad * Math.cos(ph), m); CYa[i] = lerp(y, ccy + rad * Math.sin(ph), m);
        }
      }
      var appear = seg(tt, T_UNF + 0.08, T_UNF + 0.3);
      g.save();
      if (m <= 0) clipPanel(g, s);
      var cp = new Path2D(); cp.moveTo(CXa[0], CYa[0]); for (i = 1; i < n; i++) cp.lineTo(CXa[i], CYa[i]);
      var soft = 1 - 0.35 * seg(tt, T_FADE, T_P4);          // the light softens with the fade
      var hot = 0.85 + 0.3 * en;
      g.globalAlpha = appear;
      g.globalCompositeOperation = 'lighter';
      g.strokeStyle = 'rgba(255,170,60,' + (0.1 * soft * hot + 0.12 * m) + ')'; g.lineWidth = 18 + 8 * m; g.stroke(cp);
      g.strokeStyle = 'rgba(255,200,110,' + (0.28 * soft * hot + 0.2 * m) + ')'; g.lineWidth = 7 + 3 * m; g.stroke(cp);
      g.globalCompositeOperation = 'source-over';
      g.strokeStyle = 'rgba(255,233,180,' + (0.95) + ')'; g.lineWidth = 3.2 + 1.2 * m; g.stroke(cp);
      g.globalAlpha = 1;
      // recall pulses: a beam up from the trough, a ring, sparks; the rise glows
      g.globalCompositeOperation = 'lighter';
      for (var k = 0; k < 4; k++) {
        var a = tt - PT[k]; if (a < 0 || a > 1.4) continue;
        var str = [1.0, 0.95, 0.9, 0.6][k] * (0.8 + 0.4 * eN(PT[k])) * (1 - m) * (1 - m);
        if (str <= 0.01) continue;
        var bx = cxB(PB[k]), by = TRP[k].y, e1 = env(a, 0.03, 0.42);
        var bg = g.createLinearGradient(0, AXY, 0, 290);
        bg.addColorStop(0, 'rgba(255,207,112,0)'); bg.addColorStop(clamp((AXY - by) / (AXY - 290), 0, 1), 'rgba(255,236,190,' + (0.5 * e1 * str) + ')'); bg.addColorStop(1, 'rgba(255,207,112,0)');
        g.fillStyle = bg; g.fillRect(bx - 16, 290, 32, AXY - 290);
        g.fillStyle = 'rgba(255,246,220,' + (0.7 * e1 * str) + ')'; g.fillRect(bx - 1.2, 300, 2.4, AXY - 300);
        glowDisc(g, bx, by, 70 * str, '255,200,110', 0.55 * e1);
        var rg = 10 + (k === 3 ? 70 : 120) * eP2o(clamp(a / 1.0, 0, 1));
        if (a < 1.0) { g.strokeStyle = 'rgba(255,226,160,' + (0.75 * str * (1 - a)).toFixed(3) + ')'; g.lineWidth = 2.4; g.beginPath(); g.arc(bx, by, rg, 0, TAU); g.stroke(); }
        for (var j = 0; j < 14; j++) {
          var sp = SPK[k * 14 + j]; if (a > sp.l) continue;
          var sx = bx + Math.cos(sp.a) * sp.v * a, sy = by + Math.sin(sp.a) * sp.v * a + 140 * a * a;
          g.fillStyle = 'rgba(255,240,200,' + (0.85 * str * (1 - a / sp.l)).toFixed(3) + ')'; g.beginPath(); g.arc(sx, sy, sp.s, 0, TAU); g.fill();
        }
      }
      g.restore();
      // the motif dot rides the head (its glow follows how much is remembered); at the end it is the last dot
      var hx = CXa[n - 1], hy = CYa[n - 1], Rh = Rc(hb);
      var pk = 0; for (var k2 = 0; k2 < 4; k2++) pk += env(tt - PT[k2], 0.03, 0.35) * (1 - m);
      var fin = seg(tt, 17.6, 18.0, eP2i);
      if (fin > 0) { hx = lerp(hx, ccx, fin); hy = lerp(hy, ccy, fin); }
      var inside = m > 0 || (hx > s.left + 4 && hx < s.right - 4) ? 1 : 0;   // not before the flap has opened over it
      var dl = (0.55 + 0.45 * Rh) * appear * inside;
      g.save(); g.globalCompositeOperation = 'lighter';
      glowDisc(g, hx, hy, (30 + 16 * en + 30 * pk) * (1 + 0.3 * fin), '255,190,90', 0.45 * dl + 0.2 * fin);
      glowDisc(g, hx, hy, 12 + 4 * pk, '255,236,190', 0.8 * dl);
      // the ring collapsing into the centre lights it up
      if (shrink > 0) glowDisc(g, ccx, ccy, 40 + 30 * shrink, '255,200,110', 0.35 * shrink);
      // a soft flash where the two ends of the ring meet (bottom)
      var meet = env(tt - (T_CLOSE + 0.3), 0.03, 0.3);
      if (meet > 0.01) glowDisc(g, ccx, ccy + rad, 46, '255,236,190', 0.6 * meet);
      g.restore();
      dotCore(g, hx, hy, (7 + 2 * pk) * (1 + 0.25 * fin), Math.max(dl, fin));
    });

    // ---------------- DOM order fix: chart base, chart texts and cards above the panel, dim and motif on top ----------------
    // (u.canvas appends to Lm in creation order: build canvas, labels, shadows, panel, chart base, chart texts, cards,
    //  dim overlay, motif canvas.)
  });
})();
