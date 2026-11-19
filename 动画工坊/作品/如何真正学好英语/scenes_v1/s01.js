/* s01  Cold open and hook (0 to 10.2328 s, bars 0 to 3, intro pass 1).
 *
 * A cold light dot breathes in the dark among three depth layers of real 考研 word dust, launches through the dust,
 * tears a thread of light that draws a frosted-glass word card, and lands as the dot on the ı of "evidence" on the
 * downbeat of bar 1. "先记住这个词。" then "片尾，考你。" slams on bar 2 beat 3 with a shockwave that pushes the dust
 * apart and a quarter countdown arc (foreshadowing the ring of s11). The card flips out and the dot drifts away.
 *
 * Techniques: light and texture (grain, heavy vignette, cold glow, anamorphic streaks), DrawSVG (card outline torn
 * by the dot, quarter countdown arc), MotionPath + CustomEase (launch along an arc, drop with a bounce), typewriter
 * with glints, UI mock (frosted glass app card, no brand), generative word dust in 3 parallax layers (lit by the
 * dot, pushed by the shockwave), 2.5D (CSS 3D flip, parallax camera, foreground bokeh), music (energy breathing).
 *
 * HANDOFF to s02 (cut, global 10.2328 s): on the last frame the motif dot is at rest at SCREEN (1336, 262)
 * (1920x1080 px), core radius 6 px (#f4f9ff core, #cfe6ff glow), halo radius ~50 px, brightness ~0.7. The card is
 * gone (edge-on), the dust is faint (about 35 %), the background has warmed from #05070c to night blue #0a1020.
 */
(function () {
  'use strict';

  // real 考研 headwords from the user's 70 stories (pkg/*/article.json vocab, seeded sample; never "evidence")
  var WORDS = ['troop', 'millennium', 'sleeve', 'obtain', 'solution', 'temporary', 'purify', 'disregard', 'wheel',
    'alertness', 'enlisted', 'planetary', 'likelihood', 'hindsight', 'audit', 'existence', 'astonishing', 'scatter',
    'rotate', 'spotted', 'facade', 'nightly', 'genius', 'flash', 'unimpressed', 'peculiar', 'backbone', 'accord',
    'drudgery', 'donor', 'microphone', 'creeping', 'fraud', 'abstract', 'shortage', 'conformity', 'overrule',
    'fracture', 'discrepancy', 'popularly', 'worthless', 'essential', 'bundle', 'treacherous', 'weaken', 'lender',
    'willingly', 'purchaser', 'doctoral', 'flicker', 'arrow', 'stage', 'rigorous', 'purity', 'sustained', 'dividend',
    'haven', 'alongside', 'broth', 'cargo', 'cylinder', 'register', 'insistent'];

  registerScene('s01', function build(tl, root, ctx) {
    var u = ctx.util, gsap = window.gsap, D = ctx.duration, W = 1920, H = 1080, OX = 960, OY = 540;
    var clamp = u.clamp, lerp = u.lerp;
    function E(n) { return gsap.parseEase(n); }
    var eSine = E('sine.inOut'), eP2o = E('power2.out'), eP2io = E('power2.inOut'), eP3o = E('power3.out'),
      eP4io = E('power4.inOut'), eExpo = E('expo.out'), eP3i = E('power3.in');
    function seg(t, a, b, ease) { var x = clamp((t - a) / (b - a), 0, 1); return ease ? ease(x) : x; }
    function pulse(x, rise, decay) { return x < 0 ? 0 : (1 - Math.exp(-x / rise)) * Math.exp(-x / decay); }
    if (!window.CustomEase.get('s01drop')) {
      // accelerating fall, crosses the target at x = 0.45 (the downbeat), overshoots about 10 % and settles
      window.CustomEase.create('s01drop', 'M0,0 C0.18,0 0.36,0.62 0.45,1 C0.49,1.17 0.58,1.12 0.66,1.06 C0.74,1.0 0.84,0.985 1,1');
    }
    var eDrop = E('s01drop');

    // ---------------- timing (local s; beats from the music grid) ----------------
    var T_IN = 0.02;                    // first pad chord
    var T_ANT = 1.50, T_LAUNCH = 1.78, T_APEX = 2.36;
    var T_LAND = u.beat(4);             // bar 1 downbeat, 2.573
    var T_DROP_D = (T_LAND - T_APEX) / 0.45;
    var T_TYPE = 2.2, T_STEP = 0.08;    // evidence, one letter per 0.08 s
    var T_MEAN = 3.0;                   // n. 证据
    var T_LINE = u.beat(6) - 0.07;      // 先记住这个词。 first char settles on bar 1 beat 3 (3.850)
    var T_HIT = Math.round(u.beat(10) * 60) / 60 - 0.0025;   // bar 2 beat 3 (6.403): lands on the nearest frame (6.400)
    var T_LINE_OUT = T_HIT - 0.3;
    var T_FLIP = 9.4, T_FLIP_END = 10.15, T_HEAD_OUT = 9.6;
    var T_LIFT = 9.55;                  // dot leaves the ı
    var HANDOFF = { x: 1336, y: 262 };

    // ---------------- geometry (main layer = card plane, camera depth 1) ----------------
    var CARD = { x: 500, y: 170, w: 920, h: 520, r: 40 };
    var CCX = CARD.x + CARD.w / 2, CCY = CARD.y + CARD.h / 2;

    // ---------------- camera: one pure function of t, shared by CSS layers and canvases ----------------
    var camN = u.makeNoise('s01cam');
    function eN(t) { return clamp((u.energy(t, 0.3) - 0.38) / 0.26, 0, 1); }
    function camAt(t) {
      var k = pulse(t - T_HIT, 0.025, 0.32);
      var shake = 4 * Math.exp(-Math.max(0, t - T_HIT) / 0.22) * (t >= T_HIT ? 1 : 0);
      return {
        zoom: 1 + 0.04 * eSine(clamp(t / D, 0, 1)) + 0.012 * k + 0.003 * (eN(t) - 0.5),
        x: 18 * eSine(clamp(t / D, 0, 1)) + shake * camN.noise2(t * 9, 1.1),
        y: -10 * eSine(clamp(t / D, 0, 1)) + shake * camN.noise2(2.7, t * 9)
      };
    }
    function camMap(c, px, py, d) { var s = 1 + (c.zoom - 1) * d; return [OX + (px - OX) * s - c.x * d, OY + (py - OY) * s - c.y * d]; }
    var CAM = camAt(0);

    // ---------------- layers ----------------
    var bg = u.el('div', { cls: 'fill', parent: root, style: { background: 'radial-gradient(ellipse 62% 58% at 50% 44%, #0b1121 0%, #070a13 46%, #05070c 78%)' } });
    var bgEnd = u.el('div', { cls: 'fill', parent: root, style: { background: 'radial-gradient(ellipse 75% 70% at 66% 30%, #141d38 0%, #0a1020 55%, #080c18 100%)', opacity: 0 } });
    tl.to(bgEnd, { opacity: 1, duration: D - 9.45, ease: 'sine.inOut' }, 9.45);
    void bg;

    // ===== word dust: 3 depth layers on one canvas, parallax done here =====
    var R = u.rand('s01-dust');
    var dust = [];
    var COLS = ['#7fa6e0', '#a9c8ff', '#cfe6ff'];
    function addDust(n, d, kindDash, rr, aa) {
      for (var i = 0; i < n; i++) {
        var dash = kindDash && R() < 0.42;
        dust.push({
          x: R.range(-60, W + 60), y: R.range(-60, H + 60), d: d,
          vx: R.range(-5, 5) * (0.4 + d), vy: R.range(-7, -1) * (0.4 + d),
          r: R.range(rr[0], rr[1]), a: R.range(aa[0], aa[1]), dash: dash, len: dash ? R.range(4, 12) : 0,
          ph: R() * 6.283, fq: R.range(0.15, 0.6), wph: R() * 6.283, col: d < 0.3 ? (R() < 0.75 ? 0 : 1) : (R() < 0.5 ? 1 : 2)
        });
      }
    }
    addDust(2100, 0.2, false, [0.45, 1.05], [0.18, 0.55]);
    addDust(760, 0.5, true, [0.8, 1.6], [0.2, 0.52]);
    dust.sort(function (a, b) { return a.col - b.col; });

    // near layer: a few blurred real words (texture only), kept out of the card and the caption slot
    var dpr = window.devicePixelRatio || 1;
    var near = [];
    (function () {
      var Rn = u.rand('s01-near'), tries = 0, words = Rn.shuffle(WORDS.slice());
      function ok(x, y, w) {
        if (x - w / 2 < 1500 && x + w / 2 > 420 && y > 110 && y < 1010) return false;   // card + caption + headroom
        if (x < -40 || x > W + 40 || y < 30 || y > H - 20) return false;
        for (var k = 0; k < near.length; k++) { var o = near[k]; if (Math.abs(o.x - x) < (o.w + w) / 2 + 60 && Math.abs(o.y - y) < 110) return false; }
        return true;
      }
      while (near.length < 22 && tries++ < 4000) {
        var word = words[near.length % words.length];
        var fs = Rn.range(44, 56), ital = Rn() < 0.6;
        var font = (ital ? 'italic ' : '') + '400 ' + fs.toFixed(1) + 'px "Source Serif 4 Display"';
        var mc = document.createElement('canvas').getContext('2d'); mc.font = font;
        var tw = mc.measureText(word).width;
        var x = Rn.range(0, W), y = Rn.range(40, H - 30);
        if (!ok(x, y, tw)) continue;
        var blur = Rn.range(6, 10);
        near.push({ word: word, font: font, fs: fs, w: tw, x: x, y: y, blur: blur, a: Rn.range(0.2, 0.3),
          vx: Rn.range(-6, 6), vy: Rn.range(-5, -1), ph: Rn() * 6.283, soft: null, sharp: null });
      }
      near.forEach(function (n) {
        function render(b) {
          var pad = Math.ceil(b * 3 + 10), cw = Math.ceil(n.w + pad * 2), ch = Math.ceil(n.fs * 1.6 + pad * 2);
          var c = document.createElement('canvas'); c.width = Math.ceil(cw * dpr); c.height = Math.ceil(ch * dpr);
          var g = c.getContext('2d'); g.scale(dpr, dpr); g.filter = 'blur(' + b.toFixed(2) + 'px)';
          g.font = n.font; g.textBaseline = 'middle'; g.fillStyle = '#cfe6ff'; g.fillText(n.word, pad, ch / 2);
          return { c: c, w: cw, h: ch };
        }
        n.soft = render(n.blur); n.sharp = render(1.4);
      });
    })();

    // ===== the motif dot: a pure function of t =====
    var RISE_D = 'M960,540 C992,420 994,252 960,170 C944,132 928,110 905,98';
    var MP = window.MotionPathPlugin, riseRaw = null, riseEl = null;
    if (MP && MP.getRawPath) { riseRaw = MP.getRawPath(RISE_D); MP.cacheRawPathMeasurements(riseRaw); }
    function risePoint(p) {
      if (riseRaw) { var q = MP.getPositionOnPath(riseRaw, clamp(p, 0, 1)); return [q.x, q.y]; }
      if (!riseEl) riseEl = u.svgEl('path', { d: RISE_D }, u.svg(root, { style: 'visibility:hidden' }));
      var r = u.pointAt(riseEl, p); return [r.x, r.y];
    }
    var APEX = risePoint(1);
    var TARGET = { x: 845, y: 330 }, DOT_R = 7;   // measured below from the real glyph
    var REST = { x: 960, y: 520 };
    var nDot = u.makeNoise('s01dot');
    var EXIT = null;   // screen-space bezier for the exit, built after TARGET is known

    function dotMain(t) {
      if (t < T_ANT) {
        var amp = 1 - seg(t, T_ANT - 0.35, T_ANT, u.smooth);
        return [REST.x + 6 * amp * nDot.noise2(t * 0.35, 1.7), REST.y + 5 * amp * nDot.noise2(3.1, t * 0.32)];
      }
      if (t < T_LAUNCH) return [REST.x, lerp(REST.y, 540, seg(t, T_ANT, T_LAUNCH, eP2io))];
      if (t < T_APEX) return risePoint(eP3o(seg(t, T_LAUNCH, T_APEX)));
      if (t < T_APEX + T_DROP_D) {
        var x = seg(t, T_APEX, T_APEX + T_DROP_D);
        return [lerp(APEX[0], TARGET.x, eP2o(x)), lerp(APEX[1], TARGET.y, eDrop(x))];
      }
      if (t < T_FLIP) return [TARGET.x, TARGET.y];
      return [TARGET.x, TARGET.y + 6 * seg(t, T_FLIP, T_LIFT, eP2io)];
    }
    function bez(p0, p1, p2, p3, s) {
      var a = 1 - s;
      return [a * a * a * p0[0] + 3 * a * a * s * p1[0] + 3 * a * s * s * p2[0] + s * s * s * p3[0],
        a * a * a * p0[1] + 3 * a * a * s * p1[1] + 3 * a * s * s * p2[1] + s * s * s * p3[1]];
    }
    function dotScreen(t) {
      if (t >= T_LIFT && EXIT) return bez(EXIT[0], EXIT[1], EXIT[2], EXIT[3], eSine(seg(t, T_LIFT, D - 0.22)));   // then hovers until the cut
      var m = dotMain(t); return camMap(camAt(t), m[0], m[1], 1);
    }
    function dotBright(t) {
      if (t < T_IN) return 0;
      var b = (0.6 + 0.4 * eN(t)) * eP2o(seg(t, T_IN, 0.95));
      b += 0.28 * seg(t, T_ANT, T_LAUNCH, eP2io) * (1 - seg(t, T_APEX, T_APEX + 0.3));
      b += 0.9 * pulse(t - T_LAND, 0.012, 0.28) + 1.0 * pulse(t - T_HIT, 0.012, 0.34);
      b += 0.25 * seg(t, T_FLIP, T_LIFT) * (1 - seg(t, T_LIFT, T_LIFT + 0.5));
      if (t > T_LIFT) b = lerp(b, 0.72, seg(t, T_LIFT, D, eSine));
      return b;
    }
    function dotScale(t) { return 1 - 0.14 * seg(t, T_ANT, T_LAUNCH, eP2io) * (1 - seg(t, T_LAUNCH, T_LAUNCH + 0.2)) - 0.16 * seg(t, T_LIFT, D, eSine); }

    function drawDust(g, t) {
      var c = CAM, en = eN(t);
      var envFar = seg(t, 0.05, 1.5, eP2o), envMid = seg(t, 0.25, 1.8, eP2o), envNear = seg(t, 0.5, 2.2, eP2o);
      var endFade = 1 - 0.65 * seg(t, 9.5, D, eSine), nearEnd = 1 - seg(t, 9.35, 10.1, eSine);
      var eB = (0.8 + 0.45 * en) * (1 + 0.35 * pulse(t - T_HIT, 0.02, 0.5));
      // light memory: where the dot has been in the last 1.5 s (screen space)
      var K = 14, L = [];
      for (var k = 0; k < K; k++) {
        var tk = t - k * 0.11, b = dotBright(tk);
        if (b <= 0.01) continue;
        var p = dotScreen(tk); L.push([p[0], p[1], Math.min(1.3, b) * Math.exp(-k * 0.11 / 0.5)]);
      }
      // haze around the dot (volumetric air)
      var dp = dotScreen(t), db = dotBright(t);
      if (db > 0.01) {
        var hz = g.createRadialGradient(dp[0], dp[1], 0, dp[0], dp[1], 430);
        hz.addColorStop(0, 'rgba(70,110,190,' + (0.11 * Math.min(db, 1.6)).toFixed(4) + ')');
        hz.addColorStop(1, 'rgba(70,110,190,0)');
        g.fillStyle = hz; g.fillRect(dp[0] - 430, dp[1] - 430, 860, 860);
      }
      // shockwave state
      var tau = t - T_HIT, waveR = tau > 0 ? 700 * eExpo(clamp(tau / 1.2, 0, 1)) : -1, waveA = tau > 0 ? Math.pow(1 - clamp(tau / 1.25, 0, 1), 1.3) : 0;
      function shock(sx, sy, d, out) {
        out[0] = sx; out[1] = sy; out[2] = 0;
        if (tau <= 0) return;
        var dx = sx - CCX, dy = sy - CCY, qx = Math.abs(dx) - (CARD.w / 2 - CARD.r), qy = Math.abs(dy) - (CARD.h / 2 - CARD.r);
        var mx = Math.max(qx, 0), my = Math.max(qy, 0), dist = Math.sqrt(mx * mx + my * my) + Math.min(Math.max(qx, qy), 0) - CARD.r;
        var nx, ny, nl;
        if (mx > 0 || my > 0) { nx = mx * (dx < 0 ? -1 : 1); ny = my * (dy < 0 ? -1 : 1); } else { nx = dx; ny = dy; }
        nl = Math.sqrt(nx * nx + ny * ny) || 1; nx /= nl; ny /= nl;
        if (dist < 0) dist = 0;
        if (dist < 699) {
          var ta = -Math.log2(1 - dist / 700) * 1.2 / 10, x = tau - ta;
          if (x > 0) {
            var h = (1 - Math.exp(-x / 0.07)) * (x < 0.18 ? 1 : 1 - eSine(clamp((x - 0.18) / 2.0, 0, 1)));
            var A = (d < 0.3 ? 34 : d < 0.7 ? 66 : 104) * Math.exp(-dist / 820);
            out[0] += nx * A * h; out[1] += ny * A * h;
          }
        }
        var wd = (dist - waveR) / 46; out[2] = Math.exp(-wd * wd) * waveA;
      }
      var o3 = [0, 0, 0];
      function lightAt(x, y) {
        var best = 0;
        for (var k = 0; k < L.length; k++) { var ddx = x - L[k][0], ddy = y - L[k][1], v = Math.exp(-(ddx * ddx + ddy * ddy) / 26000) * L[k][2]; if (v > best) best = v; }
        return best;
      }
      g.globalCompositeOperation = 'lighter';
      var M = 60, lastCol = -1;
      for (var i = 0; i < dust.length; i++) {
        var p = dust[i], env = p.d < 0.3 ? envFar : envMid;
        if (env <= 0) continue;
        var bx = ((p.x + p.vx * t + Math.sin(p.wph + t * 0.31) * 6) % (W + 2 * M) + (W + 2 * M)) % (W + 2 * M) - M;
        var by = ((p.y + p.vy * t + Math.cos(p.wph * 1.3 + t * 0.27) * 5) % (H + 2 * M) + (H + 2 * M)) % (H + 2 * M) - M;
        var s = camMap(c, bx, by, p.d);
        shock(s[0], s[1], p.d, o3);
        var lit = lightAt(o3[0], o3[1]);
        var tw = 0.65 + 0.35 * Math.sin(p.ph + t * p.fq * 6.283);
        var al = clamp((p.a * tw * eB + lit * (p.d < 0.3 ? 0.55 : 0.8) + o3[2] * 0.9) * env * endFade, 0, 1);
        if (al < 0.01) continue;
        if (p.col !== lastCol) { g.fillStyle = COLS[p.col]; lastCol = p.col; }
        g.globalAlpha = al;
        var rr = p.r * (1 + 0.7 * lit + 0.8 * o3[2]);
        if (p.dash) { g.fillRect(o3[0] - p.len / 2, o3[1] - rr * 0.45, p.len, rr * 0.9); }
        else { g.beginPath(); g.arc(o3[0], o3[1], rr, 0, 6.2832); g.fill(); }
      }
      // near words
      g.globalCompositeOperation = 'lighter';
      for (var j = 0; j < near.length; j++) {
        var n = near[j];
        var nx0 = n.x + n.vx * t, ny0 = n.y + n.vy * t + Math.sin(n.ph + t * 0.4) * 4;
        var sn = camMap(c, nx0, ny0, 0.9);
        shock(sn[0], sn[1], 0.9, o3);
        var litn = lightAt(o3[0], o3[1]);
        var an = (n.a * (0.85 + 0.3 * en) + o3[2] * 0.25) * envNear * nearEnd;
        if (an <= 0.004) continue;
        var sc = 1 + (c.zoom - 1) * 0.9;
        var sw = n.soft.w * sc, sh = n.soft.h * sc;
        g.globalAlpha = clamp(an * (1 - 0.55 * litn), 0, 1);
        g.drawImage(n.soft.c, o3[0] - sw / 2, o3[1] - sh / 2, sw, sh);
        if (litn > 0.02) {
          g.globalAlpha = clamp(an * 1.6 * litn, 0, 1);
          g.drawImage(n.sharp.c, o3[0] - n.sharp.w * sc / 2, o3[1] - n.sharp.h * sc / 2, n.sharp.w * sc, n.sharp.h * sc);
        }
      }
      // shockwave ring from the card edge (on the dust plane, so it passes behind the captions)
      g.save(); g.globalAlpha = 1; g.globalCompositeOperation = 'lighter';
      g.translate(OX - c.x, OY - c.y); g.scale(c.zoom, c.zoom); g.translate(-OX, -OY);
      
      if (tau > 0 && tau < 1.3) {
        for (var e = 0; e < 2; e++) {
          var tt = tau - e * 0.07; if (tt <= 0) continue;
          var s = 700 * eExpo(clamp(tt / 1.2, 0, 1)), a = Math.pow(1 - clamp(tt / 1.25, 0, 1), 1.4) * (e ? 0.45 : 0.9);
          var rx = CARD.x - s, ry = CARD.y - s, rw = CARD.w + 2 * s, rh = CARD.h + 2 * s, rad = CARD.r + s;
          g.beginPath(); g.roundRect(rx, ry, rw, rh, rad);
          g.strokeStyle = 'rgba(150,190,255,' + (0.09 * a).toFixed(4) + ')'; g.lineWidth = 30 * (1 - 0.5 * clamp(tt / 1.2, 0, 1)); g.stroke();
          g.strokeStyle = 'rgba(225,238,255,' + a.toFixed(4) + ')'; g.lineWidth = 2.6 - 1.4 * clamp(tt / 1.2, 0, 1); g.stroke();
        }
      }
      g.restore();
      g.globalAlpha = 1; g.globalCompositeOperation = 'source-over';
    }

    // ===== main layer (card plane): CSS camera, perspective for the flip =====
    var main = u.el('div', { cls: 'fill', parent: root });
    main.style.transformOrigin = OX + 'px ' + OY + 'px';
    main.style.perspective = '1600px';
    main.style.perspectiveOrigin = CCX + 'px ' + CCY + 'px';

    // the dust canvas sits behind the main layer
    var dustCv = u.canvas(root, drawDust);
    root.insertBefore(dustCv.canvas, main);

    // quarter countdown arc around the card (foreshadows the ring of s11) and its faint full track
    var ringD = 'M960,140 H1380 A70,70 0 0 1 1450,210 V650 A70,70 0 0 1 1380,720 H540 A70,70 0 0 1 470,650 V210 A70,70 0 0 1 540,140 H960';
    var arcSvg = u.svg(main);
    var track = u.path(arcSvg, ringD, { stroke: '#cfe6ff', 'stroke-width': 1, opacity: 0 });
    var arcGlow = u.path(arcSvg, ringD, { stroke: '#a9c8ff', 'stroke-width': 9, opacity: 0 });
    var arc = u.path(arcSvg, ringD, { stroke: '#eef5ff', 'stroke-width': 2, opacity: 0 });
    var ringLen = arc.getTotalLength();
    gsap.set([arc, arcGlow], { drawSVG: '0% 0%' });

    // ----- the card -----
    var card = u.el('div', { cls: 'abs', parent: main, style: { left: CARD.x + 'px', top: CARD.y + 'px', width: CARD.w + 'px', height: CARD.h + 'px', transformOrigin: '50% 50%' } });
    var glass = u.el('div', { cls: 'abs', parent: card, style: {
      left: 0, top: 0, width: CARD.w + 'px', height: CARD.h + 'px', borderRadius: CARD.r + 'px', overflow: 'hidden',
      background: 'linear-gradient(158deg, rgba(196,222,255,.13) 0%, rgba(120,152,214,.055) 44%, rgba(96,128,196,.085) 100%)',
      backdropFilter: 'blur(16px) saturate(135%)', webkitBackdropFilter: 'blur(16px) saturate(135%)',
      boxShadow: '0 48px 110px rgba(0,0,0,.62), inset 0 1px 0 rgba(235,244,255,.16), inset 0 0 60px rgba(127,166,224,.07)',
      opacity: 0 } });
    var sheen = u.el('div', { cls: 'abs', parent: glass, style: { left: '-420px', top: '-120px', width: '340px', height: (CARD.h + 240) + 'px',
      background: 'linear-gradient(90deg, rgba(220,236,255,0) 0%, rgba(220,236,255,.16) 50%, rgba(220,236,255,0) 100%)', transform: 'rotate(18deg)' } });
    var flipSheen = u.el('div', { cls: 'abs', parent: glass, style: { left: 0, top: 0, width: CARD.w + 'px', height: CARD.h + 'px',
      background: 'linear-gradient(100deg, rgba(207,230,255,0) 20%, rgba(207,230,255,.22) 62%, rgba(255,255,255,.34) 100%)', opacity: 0 } });
    u.el('div', { cls: 'abs', parent: glass, style: { left: '36px', top: '88px', width: (CARD.w - 72) + 'px', height: '1px', background: 'linear-gradient(90deg, rgba(169,200,255,0), rgba(169,200,255,.16) 20%, rgba(169,200,255,.16) 80%, rgba(169,200,255,0))' } });
    var lights = [0, 1, 2].map(function (i) {
      return u.el('div', { cls: 'abs', parent: card, style: { left: (42 + 28 * i) + 'px', top: '38px', width: '14px', height: '14px', borderRadius: '50%',
        background: ['rgba(169,200,255,.62)', 'rgba(169,200,255,.42)', 'rgba(169,200,255,.28)'][i], boxShadow: '0 0 10px rgba(127,166,224,.35)', transform: 'scale(0)' } });
    });

    // outline torn by the dot: two halves from the top centre to the bottom centre
    var oSvg = u.svgEl('svg', { width: CARD.w, height: CARD.h, viewBox: '0 0 ' + CARD.w + ' ' + CARD.h, class: 'fullsvg' }, card);
    oSvg.style.overflow = 'visible';
    var w2 = CARD.w / 2, r = CARD.r, cw = CARD.w, chh = CARD.h;
    var halfR = 'M' + w2 + ',0 H' + (cw - r) + ' A' + r + ',' + r + ' 0 0 1 ' + cw + ',' + r + ' V' + (chh - r) + ' A' + r + ',' + r + ' 0 0 1 ' + (cw - r) + ',' + chh + ' H' + w2;
    var halfL = 'M' + w2 + ',0 H' + r + ' A' + r + ',' + r + ' 0 0 0 0,' + r + ' V' + (chh - r) + ' A' + r + ',' + r + ' 0 0 0 ' + r + ',' + chh + ' H' + w2;
    var oGlow = [u.path(oSvg, halfR, { stroke: '#a9c8ff', 'stroke-width': 8, opacity: 0.16 }), u.path(oSvg, halfL, { stroke: '#a9c8ff', 'stroke-width': 8, opacity: 0.16 })];
    var oLine = [u.path(oSvg, halfR, { stroke: '#e6f0ff', 'stroke-width': 2, opacity: 0.95 }), u.path(oSvg, halfL, { stroke: '#e6f0ff', 'stroke-width': 2, opacity: 0.95 })];
    var halfLen = oLine[0].getTotalLength();
    gsap.set(oGlow.concat(oLine), { drawSVG: '0% 0%', visibility: 'hidden' });

    // ----- evidence: ı (U+0131) carries no dot; the motif dot is its dot -----
    var LET = ['e', 'v', 'ı', 'd', 'e', 'n', 'c', 'e'];
    var evHtml = LET.map(function (ch, i) { return (i === 2 ? '<span class="s01mk" style="display:inline-block;width:0;height:0"></span>' : '') + '<span class="s01lt">' + ch + '</span>'; }).join('');
    var ev = u.text(card, '', 'en', { x: w2, y: 208, html: evHtml, style: { fontSize: '140px', color: '#e9f2ff', letterSpacing: '0.01em' } });
    var lts = Array.prototype.slice.call(ev.querySelectorAll('.s01lt'));
    lts.forEach(function (s) {
      s.style.textShadow = '0 0 calc(10px + 30px * (var(--g) + var(--r))) rgba(170,210,255,calc(0.16 + 0.14 * var(--e, 0.5) + 0.6 * (var(--g) + var(--r))))';
    });
    gsap.set(lts, { opacity: 0, '--g': 0, '--r': 0 });
    u.energyVars(ev);

    var mean = u.text(card, '', 'line', { x: w2, y: 382, html: '<span style="font-family:\'Source Serif 4 Display\';font-style:italic;font-weight:400;color:#a9c8ff;letter-spacing:0">n.</span> 证据', style: { fontSize: '60px', color: '#dfe9ff' } });
    gsap.set(mean, { opacity: 0, y: 26 });

    // measure the tittle of a real "i" in this font, and put the motif dot exactly there on the ı
    (function () {
      var mk = ev.querySelector('.s01mk');
      var cr = card.getBoundingClientRect(), k = cr.width ? CARD.w / cr.width : 1, mr = mk.getBoundingClientRect();
      var ox = CARD.x + (mr.left - cr.left) * k, oy = CARD.y + (mr.top - cr.top) * k;   // glyph origin on the baseline
      var font = 'italic 400 140px "Source Serif 4 Display"', S = 400;
      function ink(ch) { var c = document.createElement('canvas'); c.width = c.height = S; var g = c.getContext('2d', { willReadFrequently: true }); g.font = font; g.fillStyle = '#fff'; g.fillText(ch, 100, 300); return g.getImageData(0, 0, S, S).data; }
      var a = ink('i'), b = ink('ı'), sx = 0, sy = 0, n = 0, x0 = 1e9, x1 = -1e9;
      for (var y = 0; y < S; y++) for (var x = 0; x < S; x++) { var i = (y * S + x) * 4 + 3, dlt = a[i] - b[i]; if (dlt > 60) { sx += x * dlt; sy += y * dlt; n += dlt; if (x < x0) x0 = x; if (x > x1) x1 = x; } }
      if (n > 0) { TARGET.x = ox + sx / n - 100; TARGET.y = oy + sy / n - 300; DOT_R = Math.max(5.5, Math.min(9, (x1 - x0 + 1) / 2)); }
      else ctx.util && console.warn('s01: tittle measure failed');
    })();

    // ----- captions below the card -----
    var line = u.text(main, '先记住这个词。', 'line', { x: 960, y: 832, style: { fontSize: '56px', color: '#c9d8f1' } });
    var lineCh = u.splitChars(line);
    gsap.set(lineCh, { opacity: 0, y: 34, filter: 'blur(8px)' });

    var head = u.text(main, '片尾，考你。', 'headline', { x: 960, y: 842, style: { fontSize: '96px', color: '#f2f6ff' } });
    var headCh = u.splitChars(head);
    head.style.textShadow = '0 0 calc(16px + 40px * var(--k)) rgba(160,200,255,calc(0.2 + 0.55 * var(--k)))';
    gsap.set(head, { opacity: 0, scale: 1.15, '--k': 0 });
    gsap.set(headCh, { filter: 'blur(9px)' });
    var chr = u.chroma(head, { amount: 0, angle: 0 });

    // hit flash (cool, local) and an extra heavy vignette for the cold open
    var flash = u.el('div', { cls: 'fill', parent: root, style: { background: 'radial-gradient(ellipse 52% 46% at 50% 62%, rgba(205,228,255,.26) 0%, rgba(205,228,255,.08) 40%, rgba(205,228,255,0) 72%)', opacity: 0, mixBlendMode: 'screen' } });
    u.el('div', { cls: 'fill', parent: root, style: { background: 'radial-gradient(ellipse 72% 66% at 50% 46%, rgba(0,0,0,0) 46%, rgba(2,3,7,.5) 82%, rgba(2,3,7,.82) 100%)' } });

    // ===== fx canvas over the card: dot, comet tail, sparks, shockwave, streaks, bokeh =====
    var bokeh = [];
    (function () {
      var Rb = u.rand('s01-bokeh');
      [[130, 170], [1790, 130], [80, 910], [1840, 940], [380, 1030], [1590, 40], [1880, 560], [30, 500], [1180, 1050]].forEach(function (p) {
        bokeh.push({ x: p[0], y: p[1], r: Rb.range(46, 104), a: Rb.range(0.035, 0.075), ph: Rb() * 6.283 });
      });
    })();
    var outlineStart = null;   // set below once the crossing time is known

    function drawFx(g, t) {
      var c = CAM, en = eN(t);
      g.globalCompositeOperation = 'lighter';
      // --- d = 1 elements in main-layer coordinates ---
      g.save();
      g.translate(OX - c.x, OY - c.y); g.scale(c.zoom, c.zoom); g.translate(-OX, -OY);
      // outline spark heads (the torn thread)
      if (outlineStart != null) {
        var op = seg(t, outlineStart, outlineStart + 0.9);
        if (op > 0 && op < 1) {
          var pe = eP4io(op), fade = 1 - seg(op, 0.85, 1);
          for (var hIdx = 0; hIdx < 2; hIdx++) {
            var q = oLine[hIdx].getPointAtLength(halfLen * pe);
            spark(g, CARD.x + q.x, CARD.y + q.y, 0.9 * fade, 1);
          }
        }
      }
      // countdown arc head
      var ap = seg(t, T_HIT, T_HIT + 0.75, eExpo);
      if (ap > 0 && t < T_HIT + 1.6) {
        var aq = arc.getPointAtLength(ringLen * 0.25 * ap);
        spark(g, aq.x, aq.y, 0.85 * (1 - seg(t, T_HIT + 0.6, T_HIT + 1.5)), 0.8);
      }
      g.restore();

      // --- the dot (screen space) ---
      var b = dotBright(t);
      if (b > 0.005) {
        var p = dotScreen(t), sc = dotScale(t) * c.zoom;
        // comet tail: one tapered polygon (no beads), fading from the head
        var TP = [p], tLen = 0;
        for (var k = 1; k <= 18; k++) {
          var q2 = dotScreen(t - k * 0.012), lp = TP[TP.length - 1], dx = q2[0] - lp[0], dy = q2[1] - lp[1], dd = Math.sqrt(dx * dx + dy * dy);
          if (dd < 0.6) continue;
          tLen += dd; TP.push(q2);
        }
        if (TP.length > 2 && tLen > 6) {
          var Lf = [], Rt = [], nT = TP.length - 1;
          for (var k2 = 0; k2 <= nT; k2++) {
            var pa = TP[Math.max(0, k2 - 1)], pb = TP[Math.min(nT, k2 + 1)], tx = pb[0] - pa[0], ty = pb[1] - pa[1], tl2 = Math.sqrt(tx * tx + ty * ty) || 1;
            var hw = DOT_R * 0.95 * sc * Math.pow(1 - k2 / nT, 1.3);
            Lf.push([TP[k2][0] - ty / tl2 * hw, TP[k2][1] + tx / tl2 * hw]); Rt.push([TP[k2][0] + ty / tl2 * hw, TP[k2][1] - tx / tl2 * hw]);
          }
          var tg = g.createLinearGradient(p[0], p[1], TP[nT][0], TP[nT][1]);
          tg.addColorStop(0, 'rgba(225,240,255,' + (0.75 * Math.min(b, 1.2)).toFixed(4) + ')');
          tg.addColorStop(0.4, 'rgba(160,200,255,' + (0.3 * Math.min(b, 1.2)).toFixed(4) + ')');
          tg.addColorStop(1, 'rgba(127,166,224,0)');
          g.fillStyle = tg; g.beginPath(); g.moveTo(Lf[0][0], Lf[0][1]);
          for (var k3 = 1; k3 <= nT; k3++) g.lineTo(Lf[k3][0], Lf[k3][1]);
          for (var k4 = nT; k4 >= 0; k4--) g.lineTo(Rt[k4][0], Rt[k4][1]);
          g.closePath(); g.fill();
        }
        // wide haze, halo, inner glow, core
        glowDisc(g, p[0], p[1], 210 * sc * (0.9 + 0.25 * b), 'rgba(110,150,230,', 0.10 * Math.min(b, 1.8));
        glowDisc(g, p[0], p[1], 60 * sc * (0.85 + 0.3 * b + 0.15 * en), 'rgba(160,200,255,', 0.42 * Math.min(b, 1.6));
        glowDisc(g, p[0], p[1], DOT_R * 3.1 * sc, 'rgba(207,230,255,', 0.85 * Math.min(b, 1.3));
        g.globalCompositeOperation = 'source-over';
        g.globalAlpha = clamp(0.55 + 0.6 * b, 0, 1);
        var cg = g.createRadialGradient(p[0], p[1], 0, p[0], p[1], DOT_R * sc);
        cg.addColorStop(0, '#ffffff'); cg.addColorStop(0.55, '#f4f9ff'); cg.addColorStop(0.85, '#d9ebff'); cg.addColorStop(1, 'rgba(207,230,255,0)');
        g.fillStyle = cg; g.beginPath(); g.arc(p[0], p[1], DOT_R * sc, 0, 6.2832); g.fill();
        g.globalAlpha = 1; g.globalCompositeOperation = 'lighter';
        // anamorphic streak: a whisper at rest, a flare on the landing and the hit
        var fl = 0.1 * Math.min(b, 1) + 0.75 * pulse(t - T_LAND, 0.01, 0.3) + 0.85 * pulse(t - T_HIT, 0.01, 0.38);
        streak(g, p[0], p[1], 420 * sc * (0.7 + 0.6 * Math.min(fl, 1)), fl);
        // landing ripple on the ı
        var lr = t - T_LAND;
        if (lr > 0 && lr < 0.8) {
          var rr2 = (10 + 95 * eExpo(lr / 0.8)) * sc;
          g.strokeStyle = 'rgba(214,234,255,' + (0.75 * Math.pow(1 - lr / 0.8, 1.5)).toFixed(4) + ')';
          g.lineWidth = 2 * (1 - lr / 0.8) + 0.5;
          g.beginPath(); g.arc(p[0], p[1], rr2, 0, 6.2832); g.stroke();
        }
      }

      // --- foreground bokeh (depth 1.4), cold and soft ---
      var envB = seg(t, 0.4, 2.4, eP2o) * (1 - 0.6 * seg(t, 9.5, D));
      for (var i = 0; i < bokeh.length; i++) {
        var bo = bokeh[i];
        var bp = camMap(c, bo.x + Math.sin(bo.ph + t * 0.21) * 14, bo.y + Math.cos(bo.ph + t * 0.17) * 10, 1.4);
        var ba = bo.a * envB * (0.75 + 0.5 * en) * (1 + 0.6 * pulse(t - T_HIT, 0.02, 0.5));
        var gg = g.createRadialGradient(bp[0], bp[1], 0, bp[0], bp[1], bo.r);
        gg.addColorStop(0, 'rgba(127,166,224,' + (ba * 0.55).toFixed(4) + ')');
        gg.addColorStop(0.82, 'rgba(127,166,224,' + (ba * 0.8).toFixed(4) + ')');
        gg.addColorStop(0.92, 'rgba(169,200,255,' + ba.toFixed(4) + ')');
        gg.addColorStop(1, 'rgba(127,166,224,0)');
        g.fillStyle = gg; g.beginPath(); g.arc(bp[0], bp[1], bo.r, 0, 6.2832); g.fill();
      }
      g.globalCompositeOperation = 'source-over';
    }
    function glowDisc(g, x, y, rad, rgb, a) {
      if (a <= 0.002 || rad <= 0.5) return;
      var gr = g.createRadialGradient(x, y, 0, x, y, rad);
      gr.addColorStop(0, rgb + a.toFixed(4) + ')'); gr.addColorStop(0.35, rgb + (a * 0.45).toFixed(4) + ')'); gr.addColorStop(1, rgb + '0)');
      g.fillStyle = gr; g.fillRect(x - rad, y - rad, rad * 2, rad * 2);
    }
    function streak(g, x, y, len, a) {
      if (a <= 0.003) return;
      g.save(); g.translate(x, y); g.scale(1, 0.018);
      var gr = g.createRadialGradient(0, 0, 0, 0, 0, len);
      gr.addColorStop(0, 'rgba(200,225,255,' + Math.min(1, a).toFixed(4) + ')'); gr.addColorStop(0.3, 'rgba(140,185,255,' + (0.4 * Math.min(1, a)).toFixed(4) + ')'); gr.addColorStop(1, 'rgba(120,170,255,0)');
      g.fillStyle = gr; g.fillRect(-len, -len, len * 2, len * 2);
      g.restore();
    }
    function spark(g, x, y, a, s) {
      if (a <= 0.003) return;
      glowDisc(g, x, y, 26 * s, 'rgba(170,210,255,', 0.55 * a);
      glowDisc(g, x, y, 6 * s, 'rgba(240,248,255,', a);
    }
    var fxCv = u.canvas(root, drawFx);
    fxCv.canvas.style.mixBlendMode = 'screen';
    root.insertBefore(fxCv.canvas, flash);

    // ===== per-frame camera (before the canvases draw) =====
    u.onFrame(function (t) {
      CAM = camAt(t);
      var s = CAM.zoom;
      main.style.transform = 'translate3d(' + (-CAM.x).toFixed(3) + 'px,' + (-CAM.y).toFixed(3) + 'px,0) scale(' + s.toFixed(5) + ')';
    });

    // exit bezier (screen space): from the ı at lift-off, up and to the right, settling at the handoff point
    (function () {
      var m = dotMain(T_LIFT), p0 = camMap(camAt(T_LIFT), m[0], m[1], 1);
      EXIT = [p0, [p0[0] + 60, p0[1] - 190], [HANDOFF.x - 230, HANDOFF.y - 30], [HANDOFF.x, HANDOFF.y]];
    })();

    // ===== timeline =====
    // the dot crosses the card's top edge (y = 170) during the launch: the outline is torn from that point
    (function () {
      var lo = T_LAUNCH, hi = T_APEX;
      for (var i = 0; i < 40; i++) { var mid = (lo + hi) / 2; if (dotMain(mid)[1] > CARD.y) lo = mid; else hi = mid; }
      outlineStart = (lo + hi) / 2;
    })();
    tl.set(oGlow.concat(oLine), { visibility: 'visible' }, outlineStart);
    tl.fromTo(oLine.concat(oGlow), { drawSVG: '0% 0%' }, { drawSVG: '0% 100%', duration: 0.9, ease: 'power4.inOut' }, outlineStart);
    tl.to(oLine, { stroke: '#8fb2e8', opacity: 0.62, attr: { 'stroke-width': 1.25 }, duration: 0.7, ease: 'power2.out' }, outlineStart + 0.95);
    tl.to(oGlow, { opacity: 0.05, duration: 0.7, ease: 'power2.out' }, outlineStart + 0.95);

    // glass materialises as the thread closes; app lights pop; a sheen crosses the glass
    tl.to(glass, { opacity: 1, duration: 0.9, ease: 'power2.out' }, 2.5);
    lights.forEach(function (l, i) { tl.to(l, { scale: 1, duration: 0.45, ease: 'back.out(3)' }, 2.92 + i * 0.07); });
    tl.to(sheen, { x: CARD.w + 760, duration: 1.3, ease: 'power2.inOut' }, 2.95);

    // evidence types out, one letter per 0.08 s, each with a glint
    lts.forEach(function (s, i) {
      var ti = T_TYPE + i * T_STEP;
      tl.to(s, { opacity: 1, '--g': 1, duration: 0.04, ease: 'none' }, ti);
      tl.to(s, { '--g': 0, duration: 0.65, ease: 'power2.out' }, ti + 0.04);
      // the landing ripple runs through the word from the ı
      var dl = T_LAND + Math.abs(i - 2) * 0.035;
      tl.to(s, { '--r': 0.85, duration: 0.07, ease: 'power2.out' }, dl);
      tl.to(s, { '--r': 0, duration: 0.6, ease: 'power2.in' }, dl + 0.07);
    });

    // meaning rises
    tl.to(mean, { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' }, T_MEAN);

    // 先记住这个词。 char by char (expo.out), first char settles on bar 1 beat 3
    tl.to(lineCh, { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.5, ease: 'expo.out', stagger: 0.05 }, T_LINE);
    tl.to(lineCh, { opacity: 0, y: -16, filter: 'blur(6px)', duration: 0.2, ease: 'power2.in', stagger: 0.012 }, T_LINE_OUT);

    // 片尾，考你。 slams on bar 2 beat 3: scale 1.15 -> 1, chromatic split for 3 frames, glow decays
    tl.to(head, { opacity: 1, '--k': 1, duration: 0.001, ease: 'none' }, T_HIT);
    tl.to(head, { scale: 1, duration: 0.6, ease: 'expo.out' }, T_HIT);
    tl.to(headCh, { filter: 'blur(0px)', duration: 0.16, ease: 'power2.out' }, T_HIT);
    tl.to(head, { '--k': 0.18, duration: 1.4, ease: 'power2.out' }, T_HIT + 0.02);
    tl.to(chr.state, { amount: 11, duration: 0.001, ease: 'none' }, T_HIT);
    tl.to(chr.state, { amount: 0, duration: 0.05, ease: 'power1.in' }, T_HIT + 0.001);
    tl.to(flash, { opacity: 1, duration: 0.001, ease: 'none' }, T_HIT);
    tl.to(flash, { opacity: 0, duration: 0.5, ease: 'power2.out' }, T_HIT + 0.01);
    tl.to(head, { '--k': 0.32, duration: 0.5, ease: 'sine.inOut', yoyo: true, repeat: 1 }, 7.68);

    // quarter countdown arc: draws to 25 % and stops, then fades in 0.8 s
    tl.to([arc, arcGlow], { opacity: 1, duration: 0.01 }, T_HIT);
    tl.to(arcGlow, { opacity: 0.14, duration: 0.01 }, T_HIT + 0.01);
    tl.to(track, { opacity: 0.11, duration: 0.35, ease: 'power2.out' }, T_HIT);
    tl.fromTo([arc, arcGlow], { drawSVG: '0% 0%' }, { drawSVG: '0% 25%', duration: 0.75, ease: 'expo.out' }, T_HIT);
    tl.to([arc, arcGlow, track], { opacity: 0, duration: 0.8, ease: 'power1.inOut' }, T_HIT + 1.2);

    // a second sheen when the line lands on the card
    tl.to(sheen, { x: -60, duration: 0.01 }, T_HIT - 0.3);
    tl.to(sheen, { x: CARD.w + 760, duration: 0.9, ease: 'power3.out' }, T_HIT);

    // exit: the card flips away about Y (perspective 1600 px), its glass catching the light; the headline dissolves
    tl.to(card, { rotationY: -90, duration: T_FLIP_END - T_FLIP, ease: 'power3.in' }, T_FLIP);
    tl.to(flipSheen, { opacity: 1, duration: T_FLIP_END - T_FLIP, ease: 'power2.in' }, T_FLIP);
    tl.to(headCh, { opacity: 0, y: -26, filter: 'blur(10px)', duration: 0.38, ease: 'power2.in', stagger: { each: 0.025, from: 'center' } }, T_HEAD_OUT);

    // keep the timeline exactly as long as the scene
    tl.set({}, {}, D);
  });
})();
