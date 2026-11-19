/* s03  The city forgets (30.6583 to 48.5306 s, bars 12 to 18, tension: the theme's bass pulse enters).
 *
 * 名场面一「熄灯之城，遗忘瀑布」. The fully lit night city from s02 goes dark from left to right on the bass pulse
 * (bar 12: a big swath per beat, half the windows in 4 beats; bar 13: only a few windows per beat, flickering out).
 * Every window that dies releases its word as ash; 18 hero words pop out of their windows and crumble letter by
 * letter. What is left lit, from the ground up, is exactly the forgetting curve: 28 buildings on a log-time axis,
 * lit stacks up to R(t) of Ebbinghaus 1885 (smooth fit through his savings data, also replicated by Murre & Dros
 * 2015). On the strong bass of bar 14 an ice-white line is drawn along the tops of the lit stacks, the axes draw,
 * the buildings fall back to 15 %. The motif dot (the light of the "evidence" window, i.e. the tittle of the ı)
 * leaves its window, the letters of "evıdence" burst out of it and ride the curve as text on a path: 2 beats of
 * accelerating plunge down the cliff, then stop-and-go crawl along the tail. At each of the 4 markers (hollow
 * circles on the real data points 20 min, 9 h, 2 days, 31 days) two letters are flung off, fall 20 px and shatter
 * into 40 grains of their own glyph; the dot dims from 100 % to 30 % and cools from ice white to grey blue.
 * From bar 15 thousands of real 考研 words pour out of the curve's origin and flow down the curve; the share that
 * leaves the curve at each point is exactly the drop of R there, so almost all of it spills off the cliff as a
 * waterfall into the abyss (mist rising at the bottom), only a thin trickle reaches the far end. Bar 16 (strong
 * bass) is the fullest, the frame lifts 15 %, and every bass hit > 0.6 lifts it again. The camera slowly pushes in
 * 8 % and pans down 48 px on the cliff. "不是你笨。" slams in on bar 17. From 16.3 s the tail of the curve swings
 * up around x = 1000 and folds into a 4-step zigzag stair outline (staggered polar morph with a springy settle),
 * everything else fades, and the background turns to the navy of s04.
 *
 * Techniques: data visualisation (city = chart, curve through real data points, no numbers), DrawSVG (curve, axes)
 * and motion along a path (text-on-path train, flow particles), generative particles (waterfall of ~3600 grains and
 * 42 readable words, ash, shatter, mist, bokeh), text effects (per-letter train, crumbling hero words, ScrambleText
 * kicker, staggered char reveals and "forgetting" char exits, slam), shape morph (tail to stair zigzag), vector
 * character (faceless learner, head light 40 % to 30 %), light (window glow, source glow, cold flashes on bass
 * hits, abyss gradient, volumetric haze, chroma kick), 2.5D camera with parallax (far city 0.45, bokeh 1.4).
 *
 * HANDOFF in (from s02, its last frame held): on the first bass hit a one-beat dark front sweeps left to right over
 *   s02's lit city (custom transition, align 'after', 0.62 s) and the chart city appears behind it already going dark.
 *   The learner starts exactly as s02 leaves him (s02's drawing, feet at screen (502, 984), scale 0.958, lamp 40 %),
 *   then walks left on the beats of bar 12 to (330, 984) under the cliff and looks up. The motif dot starts in s02's
 *   evidence window at screen (1710, 362), and in bar 13 glides over the dark skyline to the origin of the chart.
 * HANDOFF to s04 (cut, global 48.5306 s). Last frame, camera at identity (screen = layout coordinates):
 *   background navy #0c1428 (radial, #121c36 at 60 % 45 %); everything else gone except
 *   the stair outline, ice white #f2f7ff core 3 px (+ soft glow #a9c8ff 10 px at 0.12), vertices
 *   (1120,687) up 62 to (1120,625), (1181,590), up to (1181,528), (1242,493), (1242,431), (1303,396), (1303,334),
 *   (1364,299)   i.e. riser 62 px, iso tread (+61, -35), 4 steps, ending on a tread at the top;
 *   the motif dot at the top end (1364, 296), brightness 0.30, grey blue (#7d8fb3 core, #3a4a6b halo ~40 px).
 */
(function () {
  'use strict';

  // 300 real headwords from the user's 70 stories (pkg/*/article.json vocab, seeded shuffle; never "evidence"/"abandon")
  var WORDS = 'drudgery remarkably transition satirical haunting fusion migration huddle airship computation capsule fallout sharpen simplicity unreported blameless mosaic frustrate carton amateur outlet successor horizontal grieve berth stuffed panic confess sever absurd pseudonym verdict fastener consume inclination workhouse spores frustration secretive diligent reactor overhaul reassuring premium jingle ration decorate pinpoint disloyal remark spotted naturally circle adjustable ambitious claimed detect seminar relic disposal muscle portion dealer radiation naval unplanned glitch seemingly submission ignorant shutter retrieve react momentary migrate slumber pension utility signage cosmos identity flatten ether meadow vision restore esteemed accumulate earnest convention clearance hound familiarity inheritance outdated lawmaker float tourism productive streaked formation widespread bewilder deity purely president sharp briefly frontier unfinished pliable trustworthy factor scarcity slope niche invoke inventor compress closure tighten loose spacewalk seize welfare sniff evacuate upkeep invisible variety replicate relocate ridicule sentient remedial backbone ambition plainly turnaround provincial restless staggering eclipse humidity volcano disquieting lattice handheld alive voyage circuit eject anatomy scorer widen excessive unanimous spray mandatory maturity hoist regenerate comic blast whisper correctly trickle misty doctrine profitable upgrade summary character rough compute prevalent counterfeit wander attachment aspen moisture stint ordinarily surrogate animation confession performer dockworker screening initiative baffling artwork relay expectancy household deserted accurately contest dweller impulsive boost marker infamous rumble puzzle elastic propulsion masterpiece originally steer boundary biological faculty referendum patent chamber fungus surrounding nervousness tenure label coolness uniformly provenance invoice component sibling luxury undue snatch unproven packaging cultural unsettled execute sanction hitch legislator prosecute maker fabric climber drill pretext nonetheless chiefly amendment inadequate mismatch publication physiology preface prosper mislead perilous conceptual viewer imminent revisit mileage hatch fleeting programmer conclude badge employment solitary beneficiary intensive competitor flagship counterpart attentively frosted airborne acquire satellite signify double malfunction tariff shave locality remote eagerly'.split(' ');

  registerScene('s03', function build(tl, root, ctx) {
    var u = ctx.util, gsap = window.gsap, D = ctx.duration, W = 1920, H = 1080;
    var clamp = u.clamp, lerp = u.lerp, dpr = window.devicePixelRatio || 1;
    function E(n) { return gsap.parseEase(n); }
    var eSine = E('sine.inOut'), eP2o = E('power2.out'), eP2i = E('power2.in'), eP2io = E('power2.inOut'),
      eP3o = E('power3.out'), eP3io = E('power3.inOut'), eP4i = E('power4.in'), eP4io = E('power4.inOut'),
      eExpo = E('expo.out'), eBackZ = E('back.out(1.25)');
    function seg(t, a, b, ease) { var x = clamp((t - a) / (b - a), 0, 1); return ease ? ease(x) : x; }
    function pulse(x, rise, decay) { return x < 0 ? 0 : (1 - Math.exp(-x / rise)) * Math.exp(-x / decay); }
    function TX(s, a, b) { for (var i = 0; i < ctx.texts.length; i++) if (ctx.texts[i].text === s) return ctx.texts[i]; return { in: a, out: b }; }
    function hsh(i, s) { return u.hash(i, 's03' + s); }
    function mixHex(a, b, k) {
      var x = parseInt(a.slice(1), 16), y = parseInt(b.slice(1), 16);
      var r = Math.round(lerp(x >> 16, y >> 16, k)), g = Math.round(lerp((x >> 8) & 255, (y >> 8) & 255, k)), bl = Math.round(lerp(x & 255, y & 255, k));
      return 'rgb(' + r + ',' + g + ',' + bl + ')';
    }
    function rgbA(hex, a) { var x = parseInt(hex.slice(1), 16); return 'rgba(' + (x >> 16) + ',' + ((x >> 8) & 255) + ',' + (x & 255) + ',' + a.toFixed(4) + ')'; }

    // ---------------- transition in: on the first bass hit a soft dark front wipes s02's held last frame from left to
    // right (one beat). s03's own lights-out wave runs ahead of it, so the front reveals a city that is already going
    // dark; the learner and the motif dot sit exactly where s02 leaves them, so they do not jump. ----------------
    var WIPE_W = 2600;
    ctx.transitionIn({ type: 'custom', duration: 0.62, align: 'after', ease: 'none', fn: function (p, i) {
      if (!i.out) return;
      var X = -340 + p * WIPE_W, m = 'linear-gradient(90deg, rgba(0,0,0,0) ' + (X - 340).toFixed(1) + 'px, rgba(0,0,0,1) ' + X.toFixed(1) + 'px)';
      i.out.style.webkitMaskImage = m; i.out.style.maskImage = m;
    } });

    // ---------------- timing (local s, from the music grid) ----------------
    var BEAT = [];
    for (var bk = 0; bk < 24; bk++) BEAT.push(u.beat(bk));
    var T_DRAW = u.bar(2);                     // 5.106 bar 14, strong bass: curve + axes draw
    var T_SLIDE = BEAT[9];                     // 5.745 dot leaves its window, train starts
    var T_M = [BEAT[11], BEAT[13], BEAT[15], BEAT[18]];   // 7.021 8.298 9.574 11.489 markers
    var T_FALL = u.bar(3);                     // 7.660 bar 15: the waterfall gushes
    var T_FULL = u.bar(4);                     // 10.213 bar 16: fullest, frame lifts 15 %
    var T_NOT = u.bar(5);                      // 12.766 bar 17: 不是你笨。
    var T_B18 = u.bar(6);                      // 15.319 bar 18
    var T_FOLD = 16.3, T_FOLD_END = 17.7;
    var tx = {
      yl: TX('记得的', 5.106, 17.75), xl: TX('时间', 5.106, 17.75), kick: TX('forgetting curve', 5.745, 12.145),
      ev: TX('evidence', 5.745, 11.745), head: TX('不复习，新学的东西会很快忘掉，', 5.745, 11.945),
      sub: TX('而且一开始，忘得最快。', 7.021, 12.021), src: TX('Ebbinghaus, 1885 · Murre & Dros, 2015', 5.745, 17.75),
      not: TX('不是你笨。', 12.766, 17.4)
    };

    // music energy (normalised to this section's range) and the strong bass hits (> 0.6) from energy.json
    function eN(t) { return clamp((u.energy(t, 0.25) - 0.62) / 0.26, 0, 1); }
    var STRONG = [10.275, 15.387];
    var ready = fetch(u.asset('A/music/energy.json')).then(function (r) { return r.json(); }).then(function (j) {
      var hs = j.hits || [], st = j.hit_strength || [], out = [];
      for (var i = 0; i < hs.length; i++) { var lt = hs[i] - ctx.start; if (lt > 5 && lt < D && (st[i] || 0) > 0.6) out.push(lt); }
      if (out.length) STRONG = out;
    }).catch(function () { /* keep the measured fallback */ });
    function strongPulse(t, dec) { var v = 0; for (var i = 0; i < STRONG.length; i++) { var x = t - STRONG[i]; if (x >= -0.02) v = Math.max(v, pulse(x + 0.02, 0.02, dec)); } return v; }
    function liftAt(t) { return pulse(t - T_FULL + 0.02, 0.05, 1.5) + 0.75 * strongPulse(t, 0.55); }

    // ---------------- the forgetting curve (Ebbinghaus savings, smooth fit) ----------------
    // time axis: u = ln(1 + t/15 min) / ln(1 + 31 d / 15 min); data points 0, 20 min, 1 h, 8.8 h, 1 d, 2 d, 6 d, 31 d
    // fit R(u) = 0.4652 + 0.5348 e^(-u/0.07818) - 0.2574 u (max deviation 0.02 from the 1885 table; shape only)
    var GY = 884, SY = 620, PX0 = 290, PX1 = 1740, AXX = 262;
    function Ru(v) { v = clamp(v, 0, 1); return 0.4652 + 0.5348 * Math.exp(-v / 0.07818) - 0.2574 * v; }
    function curveYx(x) { return GY - SY * Ru((x - PX0) / (PX1 - PX0)); }
    var NS = 420, CP = [], CS = [0], CU = [], CA = [];
    for (var k = 0; k <= NS; k++) {
      var uu = Math.pow(k / NS, 1.7); CU.push(uu); CP.push([PX0 + (PX1 - PX0) * uu, GY - SY * Ru(uu)]);
      if (k) { var ddx = CP[k][0] - CP[k - 1][0], ddy = CP[k][1] - CP[k - 1][1]; CS.push(CS[k - 1] + Math.sqrt(ddx * ddx + ddy * ddy)); }
    }
    for (k = 0; k <= NS; k++) { var ka = Math.max(0, k - 1), kb = Math.min(NS, k + 1); CA.push(Math.atan2(CP[kb][1] - CP[ka][1], CP[kb][0] - CP[ka][0])); }
    var CL = CS[NS];
    function bsearch(arr, v) { var lo = 0, hi = arr.length - 1; while (hi - lo > 1) { var m = (lo + hi) >> 1; if (arr[m] <= v) lo = m; else hi = m; } return lo; }
    var Q = { x: 0, y: 0, a: 0 };
    function atS(s, out) {
      out = out || { x: 0, y: 0, a: 0 };
      if (s <= 0) { out.a = CA[0]; out.x = CP[0][0] + Math.cos(out.a) * s; out.y = CP[0][1] + Math.sin(out.a) * s; return out; }
      if (s >= CL) { out.a = CA[NS]; out.x = CP[NS][0] + Math.cos(out.a) * (s - CL); out.y = CP[NS][1] + Math.sin(out.a) * (s - CL); return out; }
      var i = bsearch(CS, s), f = (s - CS[i]) / (CS[i + 1] - CS[i]);
      out.x = lerp(CP[i][0], CP[i + 1][0], f); out.y = lerp(CP[i][1], CP[i + 1][1], f); out.a = lerp(CA[i], CA[i + 1], f);
      return out;
    }
    function sAtU(v) { var i = bsearch(CU, v); if (i >= NS) return CL; var f = (v - CU[i]) / (CU[i + 1] - CU[i]); return lerp(CS[i], CS[i + 1], clamp(f, 0, 1)); }
    function uOfR(r) { var lo = 0, hi = 1; for (var i = 0; i < 40; i++) { var m = (lo + hi) / 2; if (Ru(m) > r) lo = m; else hi = m; } return (lo + hi) / 2; }
    var U_MK = [0.10590, 0.44798, 0.65788, 1.0];          // 20 min, 8.8 h, 2 d, 31 d on this axis
    var S_M = U_MK.map(sAtU);
    var curveD = 'M' + CP.map(function (p) { return p[0].toFixed(2) + ',' + p[1].toFixed(2); }).join(' L');

    // flow along the curve (waterfall): speed from the drop, a little friction on the tail; time table TT
    var V0 = 150, GS = 760, S_KNEE = sAtU(0.12), VS = [], TT = [0];
    for (k = 0; k <= NS; k++) {
      var dropY = Math.max(0, CP[k][1] - CP[0][1]), vv = Math.sqrt(V0 * V0 + 2 * GS * dropY);
      if (CS[k] > S_KNEE) vv *= Math.exp(-(CS[k] - S_KNEE) / 2200);
      VS.push(Math.max(220, vv));
      if (k) TT.push(TT[k - 1] + (CS[k] - CS[k - 1]) * 2 / (VS[k] + VS[k - 1]));
    }
    var TTEND = TT[NS];
    function flowAt(tau, out) {   // along-curve state after travelling tau seconds from the origin
      if (tau <= 0) { out.x = CP[0][0]; out.y = CP[0][1]; out.a = CA[0]; out.v = VS[0]; out.s = 0; return out; }
      if (tau >= TTEND) { var e = (tau - TTEND) * VS[NS]; out.a = CA[NS]; out.x = CP[NS][0] + Math.cos(out.a) * e; out.y = CP[NS][1] + Math.sin(out.a) * e; out.v = VS[NS]; out.s = CL + e; return out; }
      var i = bsearch(TT, tau), f = (tau - TT[i]) / (TT[i + 1] - TT[i]);
      out.x = lerp(CP[i][0], CP[i + 1][0], f); out.y = lerp(CP[i][1], CP[i + 1][1], f); out.a = lerp(CA[i], CA[i + 1], f);
      out.v = lerp(VS[i], VS[i + 1], f); out.s = lerp(CS[i], CS[i + 1], f); return out;
    }
    function tauOfS(s) { if (s >= CL) return TTEND; var i = bsearch(CS, s), f = (s - CS[i]) / (CS[i + 1] - CS[i]); return lerp(TT[i], TT[i + 1], f); }

    // ---------------- camera (one pure function of t; CSS for the planes, the same maths in the canvases) ----------------
    var O = { x: 520, y: 640 };
    var camN = u.makeNoise('s03cam');
    var T_PUSH1 = 13.4, T_BACK0 = 15.7, T_BACK1 = 17.55;
    function camAt(t) {
      var k = eSine(seg(t, T_FALL, T_PUSH1)) * (1 - eP2io(seg(t, T_BACK0, T_BACK1)));
      var settle = 1 - eSine(seg(t, 0, T_DRAW));                       // opening: a slow settle after the cut
      var z = 1 + 0.08 * k + 0.012 * settle, pan = 48 * k - 10 * settle;
      var sh = t >= T_NOT ? 3.2 * Math.exp(-(t - T_NOT) / 0.16) : 0;
      return { z: z, tx: O.x * (1 - z) + sh * camN.noise2(t * 13, 0.3), ty: O.y * (1 - z) - pan + sh * camN.noise2(0.7, t * 13) };
    }
    function camD(c, d) { var z = 1 + (c.z - 1) * d; return { z: z, tx: O.x * (1 - z) + (c.tx - O.x * (1 - c.z)) * d, ty: O.y * (1 - z) + (c.ty - O.y * (1 - c.z)) * d }; }

    // ---------------- the city: 28 chart buildings (data) + a far skyline ----------------
    var RB = u.rand('s03-city');
    var PITCH = (PX1 - PX0) / 27, ROW0 = GY - 18, ROWP = 21, WW = 12, WH = 14;
    var WCOL = ['#a9c8ff', '#cfe6ff', '#8fb2ec', '#e6eefc', '#7fa6e0'];
    var blds = [], wins = [];
    for (var bi = 0; bi < 28; bi++) {
      var c0 = PX0 + PITCH * bi, cols = [c0, c0 + 20];
      var cyMin = Math.min(curveYx(cols[0]), curveYx(cols[1]));
      var top = GY - RB.range(330, 650);
      top = Math.max(150, Math.min(top, cyMin - 26));
      if (bi === 0) top = cyMin - 30;
      var bl = { i: bi, x0: c0 - 11, x1: c0 + 31, top: top, roof: RB.int(0, 4), dark: [], lit: 0 };
      blds.push(bl);
      for (var ci = 0; ci < 2; ci++) {
        var colWins = [];
        for (var r = 0; ; r++) {
          var wy = ROW0 - ROWP * r;
          if (wy - WH / 2 < top + 10) break;
          var w = { x: cols[ci], y: wy, b: bi, c: ci, ci: RB.int(0, WCOL.length - 1), b0: RB.range(0.72, 1.0), off: 1e9, kind: 0, ph: RB(), ash: null, hero: -1 };
          w.keep = (wy - WH / 2) >= curveYx(cols[ci]) + 1;
          colWins.push(w); wins.push(w);
        }
        // dark-destined windows, top first
        bl.dark.push(colWins.filter(function (q) { return !q.keep; }).reverse());
      }
    }
    var EVW = null;   // the evidence window: the topmost lit window of building 0, left column
    wins.forEach(function (q) { if (q.b === 0 && q.c === 0 && q.keep && (!EVW || q.y < EVW.y)) EVW = q; });
    EVW.b0 = 1.25; EVW.ci = 3;

    // lights-out schedule: half of ALL windows are dark after bar 12 (4 big waves), the rest in bar 13 (fewer, flickering)
    var NALL = wins.length, NDARK = wins.filter(function (q) { return !q.keep; }).length;
    var F4 = clamp(0.5 * NALL / NDARK, 0.6, 0.92), REM = 1 - F4;
    var FC = [F4 * 0.42, F4 * 0.70, F4 * 0.88, F4, F4 + REM * 0.40, F4 + REM * 0.68, F4 + REM * 0.87, 1.0];
    var RW = u.rand('s03-waves');
    blds.forEach(function (b) {
      b.dark.forEach(function (list) {
        var n = list.length;
        list.forEach(function (q, j) {
          var kb = 0; while (kb < 7 && j >= Math.round(FC[kb] * n)) kb++;
          q.beat = kb;
          if (kb < 4) { q.kind = 1; q.off = BEAT[kb] + 0.42 * (q.x - 262) / 1510 + RW.range(0, 0.035); }
          else { q.kind = 2; q.off = BEAT[kb] + RW.range(0.0, 0.5); q.fk = RW.range(0.75, 1.3); }
          if (RW() < 0.6) q.ash = { ch: String.fromCharCode(97 + RW.int(0, 25)), sz: RW.range(10, 15), vx: RW.range(-14, 14), vy: RW.range(12, 40), g: RW.range(40, 90), w: RW.range(-3, 3), r0: RW.range(-0.5, 0.5), life: RW.range(1.2, 2.0), sway: RW.range(3, 9), ph: RW() * 6.28 };
        });
      });
    });
    function darkProg(t) { var v = 0, prev = 0; for (var i = 0; i < 8; i++) { v += (FC[i] - prev) * seg(t, BEAT[i], BEAT[i] + (i < 4 ? 0.45 : 0.6), eP2o); prev = FC[i]; } return v; }

    // hero words: 4 per beat in bar 12 (spread over the width, alternating heights), 2 more early in bar 13 (left)
    var RH = u.rand('s03-hero'), HERO = [], usedW = {};
    var heroWords = RH.shuffle(WORDS.filter(function (s) { return s.length >= 5 && s.length <= 9; })).slice(0, 24);
    function heroClash(q, len) {
      for (var i = 0; i < HERO.length; i++) {
        var o = HERO[i]; if (Math.abs(o.w.off - q.off) > 1.6) continue;
        var w1 = 25 * len + 20, w2 = 25 * o.word.length + 20;
        if (Math.abs(o.w.x - q.x) < (w1 + w2) / 2 + 30 && Math.abs(o.w.y - q.y) < 90) return true;
      }
      return false;
    }
    function pickHero(beat, x0, x1, ty) {
      var best = null, bd = 1e9, len = heroWords[HERO.length].length;
      wins.forEach(function (q) {
        if (q.kind === 0 || q.beat !== beat || q.x < x0 || q.x > x1 || q.hero >= 0 || heroClash(q, len)) return;
        var d = Math.abs(q.y - ty) + 0.3 * Math.abs(q.x - (x0 + x1) / 2) + RH() * 30;
        if (d < bd) { bd = d; best = q; }
      });
      return best;
    }
    var BANDS = [[300, 640], [660, 1010], [1030, 1390], [1410, 1750]];
    for (var hb = 0; hb < 4; hb++) for (var bb = 0; bb < 4; bb++) {
      var hq = pickHero(hb, BANDS[bb][0], BANDS[bb][1], hb % 2 ? 470 : 300);
      if (hq) { hq.hero = HERO.length; HERO.push({ w: hq, word: heroWords[HERO.length] }); }
    }
    [[4, 0, 380], [5, 1, 430]].forEach(function (s) { var q = pickHero(s[0], BANDS[s[1]][0], BANDS[s[1]][1], s[2]); if (q) { q.hero = HERO.length; HERO.push({ w: q, word: heroWords[HERO.length] }); } });

    // far skyline (depth 0.45), only lit until the waves pass
    var RF = u.rand('s03-far'), far = [], farWins = [], FAR_LAST = 0;
    for (var fx = -60; fx < 1990;) {
      var fw = RF.range(30, 70), fh = RF.range(90, 330), ft = GY - 20 - fh;
      far.push({ x: fx, w: fw, top: ft });
      for (var wx = fx + 5; wx < fx + fw - 6; wx += 9) for (var wy2 = ft + 8; wy2 < GY - 26; wy2 += 11) {
        if (RF() < 0.42) continue;
        var kbf = RF() < 0.88 ? (RF() < 0.45 ? 0 : RF() < 0.55 ? 1 : RF() < 0.6 ? 2 : 3) : 4 + RF.int(0, 2);
        var off = BEAT[kbf] + (kbf < 4 ? 0.42 * clamp((wx - 100) / 1700, 0, 1) + RF.range(0, 0.06) : RF.range(0, 0.5));
        FAR_LAST = Math.max(FAR_LAST, off);
        farWins.push({ x: wx, y: wy2, off: off, b0: RF.range(0.35, 0.8), c: RF.int(0, 2) });
      }
      fx += fw + RF.range(-6, 10);
    }

    // ---------------- sprites ----------------
    function mkCv(w, h) { var c = document.createElement('canvas'); c.width = Math.max(1, Math.ceil(w * dpr)); c.height = Math.max(1, Math.ceil(h * dpr)); var g = c.getContext('2d'); g.scale(dpr, dpr); return { c: c, g: g, w: w, h: h }; }
    var glowSpr = (function () {
      var s = mkCv(48, 48), g = s.g, gr = g.createRadialGradient(24, 24, 0, 24, 24, 24);
      gr.addColorStop(0, 'rgba(160,195,255,0.85)'); gr.addColorStop(0.28, 'rgba(130,170,240,0.32)'); gr.addColorStop(1, 'rgba(110,150,230,0)');
      g.fillStyle = gr; g.fillRect(0, 0, 48, 48); return s;
    })();
    var mctx = document.createElement('canvas').getContext('2d');
    function textSprite(str, font, px, color, glowCol, glowR) {
      mctx.font = font; var tw = mctx.measureText(str).width, pad = Math.ceil(glowR * 2 + 6);
      var s = mkCv(tw + pad * 2, px * 1.5 + pad * 2), g = s.g;
      g.font = font; g.textBaseline = 'middle'; g.fillStyle = color;
      if (glowR > 0) { g.shadowColor = glowCol; g.shadowBlur = glowR * dpr; g.fillText(str, pad, s.h / 2); g.shadowBlur = 0; }
      g.fillText(str, pad, s.h / 2);
      s.tw = tw; return s;
    }
    // ash letters a..z, two tints
    var ASH = { ice: {}, grey: {} };
    for (var ac = 0; ac < 26; ac++) {
      var ch = String.fromCharCode(97 + ac);
      ASH.ice[ch] = textSprite(ch, 'italic 400 30px "Source Serif 4 Display"', 30, '#cfe0fb', 'rgba(150,190,255,0.7)', 4);
      ASH.grey[ch] = textSprite(ch, 'italic 400 30px "Source Serif 4 Display"', 30, '#5d6f95', 'rgba(0,0,0,0)', 0);
    }
    // hero words: per-letter sprites
    HERO.forEach(function (h, i) {
      var ital = i % 3 !== 1, px = ital ? 46 : 44, font = (ital ? 'italic ' : '') + '400 ' + px + 'px "Source Serif 4 Display"';
      mctx.font = font;
      var widths = h.word.split('').map(function (c) { return mctx.measureText(c).width; }), tot = widths.reduce(function (a, b) { return a + b; }, 0);
      var acc = -tot / 2, Rl = u.rand('s03-hl' + i);
      h.cx = clamp(h.w.x, tot / 2 + 30, 1890 - tot / 2);
      h.letters = h.word.split('').map(function (c, j) {
        var L = { ch: c, dx: acc + widths[j] / 2, ice: textSprite(c, font, px, '#e6eefc', 'rgba(160,200,255,0.85)', 9), grey: textSprite(c, font, px, '#6c7ea3', 'rgba(0,0,0,0)', 0),
          vx: Rl.range(-30, 30), g: Rl.range(260, 420), w: Rl.range(-2.4, 2.4), life: Rl.range(1.25, 1.85), sway: Rl.range(4, 12), ph: Rl() * 6.28 };
        acc += widths[j]; return L;
      });
      h.t0 = h.w.off;
    });

    // ---------------- static layers rendered once ----------------
    var farBodies = mkCv(W, H), chartBodies = mkCv(W, H);
    (function () {
      var g = farBodies.g;
      far.forEach(function (b) { g.fillStyle = '#0b1325'; g.fillRect(b.x, b.top, b.w, GY - b.top + 4); g.fillStyle = 'rgba(70,95,150,0.25)'; g.fillRect(b.x, b.top, b.w, 1.5); });
      g = chartBodies.g;
      blds.forEach(function (b) {
        var w = b.x1 - b.x0;
        var gr = g.createLinearGradient(b.x0, 0, b.x1, 0);
        gr.addColorStop(0, '#111b33'); gr.addColorStop(0.18, '#0c1428'); gr.addColorStop(1, '#090f1f');
        g.fillStyle = gr; g.fillRect(b.x0, b.top, w, GY - b.top);
        g.fillStyle = 'rgba(120,150,210,0.32)'; g.fillRect(b.x0, b.top, w, 1.5);        // moonlit roof edge
        g.fillStyle = 'rgba(120,150,210,0.14)'; g.fillRect(b.x0, b.top, 1.2, GY - b.top); // moonlit left edge
        g.fillStyle = '#0c1428';
        if (b.roof === 1) { g.fillRect(b.x0 + 8, b.top - 14, 14, 14); }
        else if (b.roof === 2) { g.fillRect(b.x0 + w / 2 - 0.8, b.top - 34, 1.6, 34); g.fillStyle = 'rgba(160,190,240,0.5)'; g.fillRect(b.x0 + w / 2 - 1.5, b.top - 36, 3, 3); }
        else if (b.roof === 3) { g.fillRect(b.x0 + 4, b.top - 8, w - 8, 8); }
      });
    })();

    // ---------------- DOM layers (z order) ----------------
    var sky = u.el('div', { cls: 'fill', parent: root, style: { background: 'linear-gradient(180deg, #0c1428 0%, #090e1c 42%, #070b16 68%, #05080f 100%)' } });
    var cityGlow = u.el('div', { cls: 'fill', parent: root, style: { background: 'radial-gradient(ellipse 72% 42% at 52% 78%, rgba(90,130,210,0.30) 0%, rgba(70,110,190,0.12) 45%, rgba(60,100,180,0) 75%)' } });
    var coldTop = u.el('div', { cls: 'fill', parent: root, style: { background: 'radial-gradient(ellipse 46% 52% at 12% 0%, rgba(150,180,240,0.10) 0%, rgba(150,180,240,0) 70%)', opacity: 0 } });
    var abyss = u.el('div', { cls: 'fill', parent: root, style: { background: 'linear-gradient(180deg, rgba(3,5,10,0) 58%, rgba(3,5,10,0.55) 80%, rgba(2,3,7,0.9) 100%)', opacity: 0 } });
    var navy = u.el('div', { cls: 'fill', parent: root, style: { background: 'radial-gradient(ellipse 75% 70% at 60% 45%, #121c36 0%, #0c1428 60%, #0a1122 100%)', opacity: 0 } });
    void sky;

    var backCv = u.canvas(root, drawBack);
    var planeU = u.el('div', { cls: 'fill', parent: root, style: { transformOrigin: '0 0' } });
    var fxCv = u.canvas(root, drawFx);
    var planeO = u.el('div', { cls: 'fill', parent: root, style: { transformOrigin: '0 0' } });
    var hud = u.el('div', { cls: 'fill', parent: root });
    void backCv; void fxCv;
    // the dark band that rides behind the wipe front during the transition in (top of this scene)
    var band = u.el('div', { cls: 'fill', parent: root, style: { display: 'none' } });
    var T_WIPE = 0.62;

    // ---------------- SVG: axes, curve, markers (planeU) ----------------
    var svgU = u.svg(planeU);
    var AX_COL = '#8fa3c8';
    var yAxis = u.path(svgU, 'M' + AXX + ',' + (GY + 6) + ' L' + AXX + ',206', { stroke: AX_COL, 'stroke-width': 2.2, opacity: 0.75 });
    var xAxis = u.path(svgU, 'M' + (AXX - 6) + ',' + GY + ' L1798,' + GY, { stroke: AX_COL, 'stroke-width': 2.2, opacity: 0.75 });
    var yArrow = u.path(svgU, 'M' + (AXX - 9) + ',220 L' + AXX + ',203 L' + (AXX + 9) + ',220', { stroke: AX_COL, 'stroke-width': 2.2, opacity: 0 });
    var xArrow = u.path(svgU, 'M1784,' + (GY - 9) + ' L1801,' + GY + ' L1784,' + (GY + 9), { stroke: AX_COL, 'stroke-width': 2.2, opacity: 0 });
    gsap.set([yAxis, xAxis], { drawSVG: '0% 0%' });

    function curveStrokes(parent, d) {
      return [
        u.path(parent, d, { stroke: '#6f95d8', 'stroke-width': 22, opacity: 0.07 }),
        u.path(parent, d, { stroke: '#a9c8ff', 'stroke-width': 10, opacity: 0.17 }),
        u.path(parent, d, { stroke: '#f2f7ff', 'stroke-width': 3.6, opacity: 1 })
      ];
    }
    var curveG = u.svgEl('g', {}, svgU);
    var curveP = curveStrokes(curveG, curveD);
    gsap.set(curveP, { drawSVG: '0% 0%' });

    // markers on the real data points (hollow 18 px circles; flash when the dot passes)
    var MK = S_M.map(function (s) { var q = atS(s, {}); return { x: q.x, y: q.y }; });
    var mkG = u.svgEl('g', {}, svgU);
    var mkFill = [], mkRing = [];
    MK.forEach(function (m) {
      var gm = u.svgEl('g', {}, mkG);
      mkFill.push(u.svgEl('circle', { cx: m.x, cy: m.y, r: 9, fill: '#eaf2ff', opacity: 0 }, gm));
      mkRing.push(u.svgEl('circle', { cx: m.x, cy: m.y, r: 9, fill: '#070b16', stroke: '#dfe9ff', 'stroke-width': 2.2, opacity: 0.75 }, gm));
      m.g = gm;
    });
    // the draw-head passes marker k when eP4io(p) * CL = S_M[k]: solve for p
    function invEase(ease, y) { var lo = 0, hi = 1; for (var i = 0; i < 40; i++) { var m = (lo + hi) / 2; if (ease(m) < y) lo = m; else hi = m; } return (lo + hi) / 2; }
    MK.forEach(function (m, i) {
      var tk = T_DRAW + 1.4 * invEase(eP4io, S_M[i] / CL);
      tl.fromTo(m.g, { scale: 0, svgOrigin: m.x + ' ' + m.y }, { scale: 1, duration: 0.35, ease: 'back.out(2.4)' }, tk - 0.02);
      tl.fromTo(mkFill[i], { opacity: 0.95 }, { opacity: 0, duration: 0.7, ease: 'power2.out' }, T_M[i]);
      tl.to(mkRing[i], { opacity: 1, stroke: '#ffffff', duration: 0.2 }, T_M[i]);
    });
    tl.to(mkG, { opacity: 0, duration: 0.45, ease: 'power2.in' }, 15.95);

    // fold phase: head part (static d) and tail part (d rebuilt every frame)
    var U_P = (1120 - PX0) / (PX1 - PX0), S_P = sAtU(U_P), PIV = atS(S_P, {});
    var ZV = [[PIV.x, PIV.y]];
    for (var zi = 0; zi < 4; zi++) { var lz = ZV[ZV.length - 1]; ZV.push([lz[0], lz[1] - 62]); lz = ZV[ZV.length - 1]; ZV.push([lz[0] + 61, lz[1] - 35]); }
    var NZ = 96, ZP = [], TP = [], TPol = [], ZPol = [];
    for (var j = 0; j <= NZ; j++) {
      var sgi = Math.min(7, Math.floor(j / 12)), fz = j === NZ ? 1 : (j - sgi * 12) / 12;
      ZP.push([lerp(ZV[sgi][0], ZV[sgi + 1][0], fz), lerp(ZV[sgi][1], ZV[sgi + 1][1], fz)]);
      var qz = atS(S_P + (CL - S_P) * j / NZ, {}); TP.push([qz.x, qz.y]);
    }
    // polar coordinates around the pivot so the tail swings UP (rotates) instead of sliding across
    for (j = 0; j <= NZ; j++) {
      var a0 = Math.atan2(TP[j][1] - PIV.y, TP[j][0] - PIV.x), r0 = Math.hypot(TP[j][0] - PIV.x, TP[j][1] - PIV.y);
      var a1 = Math.atan2(ZP[j][1] - PIV.y, ZP[j][0] - PIV.x), r1 = Math.hypot(ZP[j][0] - PIV.x, ZP[j][1] - PIV.y);
      TPol.push([a0, r0]); ZPol.push([a1, r1]);
    }
    var headD = 'M' + CP.filter(function (p) { return p[0] <= PIV.x; }).map(function (p) { return p[0].toFixed(2) + ',' + p[1].toFixed(2); }).join(' L') + ' L' + PIV.x.toFixed(2) + ',' + PIV.y.toFixed(2);
    function polyD(P) { var s = 'M' + P[0][0].toFixed(2) + ',' + P[0][1].toFixed(2); for (var i = 1; i < P.length; i++) s += ' L' + P[i][0].toFixed(2) + ',' + P[i][1].toFixed(2); return s; }
    var foldG = u.svgEl('g', { opacity: 0 }, svgU);
    var headP = curveStrokes(foldG, headD);
    var tailP = curveStrokes(foldG, polyD(TP));
    var FOLD_P = [];
    for (j = 0; j <= NZ; j++) FOLD_P.push([0, 0]);
    function foldPts(t) {
      for (var i = 0; i <= NZ; i++) {
        var f = i / NZ, st = T_FOLD + 0.42 * (1 - f);
        var e = eBackZ(seg(t, st, st + 0.98));
        if (i === 0 || e <= 0) { FOLD_P[i][0] = TP[i][0]; FOLD_P[i][1] = TP[i][1]; continue; }
        var a = lerp(TPol[i][0], ZPol[i][0], e), rr = lerp(TPol[i][1], ZPol[i][1], e);
        FOLD_P[i][0] = PIV.x + Math.cos(a) * rr; FOLD_P[i][1] = PIV.y + Math.sin(a) * rr;
      }
      return FOLD_P;
    }
    tl.set(curveG, { opacity: 0 }, T_FOLD);
    tl.set(foldG, { opacity: 1 }, T_FOLD);
    tl.fromTo(headP, { drawSVG: '0% 100%' }, { drawSVG: '100% 100%', duration: 1.0, ease: 'power2.in' }, T_FOLD + 0.05);
    tl.to(headP, { opacity: 0, duration: 0.5, ease: 'power1.in' }, T_FOLD + 0.55);
    // the final outline: s04 style, ice white 3 px, softer glow
    tl.to(tailP[0], { opacity: 0, duration: 0.6 }, 17.1);
    tl.to(tailP[1], { opacity: 0.12, duration: 0.6 }, 17.1);
    tl.to(tailP[2], { attr: { 'stroke-width': 3 }, duration: 0.6 }, 17.1);

    // axes: draw on bar 14, retract during the fold
    tl.to([yAxis, xAxis], { drawSVG: '0% 100%', duration: 1.0, ease: 'power3.inOut' }, T_DRAW);
    tl.to([yArrow, xArrow], { opacity: 0.75, duration: 0.3 }, T_DRAW + 0.85);
    tl.to([yAxis, xAxis], { drawSVG: '100% 100%', duration: 0.9, ease: 'power2.in' }, 16.45);
    tl.to([yArrow, xArrow], { opacity: 0, duration: 0.3 }, 16.45);
    tl.to(curveP, { drawSVG: '0% 100%', duration: 1.4, ease: 'power4.inOut' }, T_DRAW);

    // the chart SVG gets its camera inside the SVG (repainted at full resolution every frame, no raster reuse)
    var camG = u.svgEl('g', {}, svgU);
    Array.prototype.slice.call(svgU.childNodes).forEach(function (n) { if (n !== camG) camG.appendChild(n); });

    // ---------------- labels in the plane (move with the chart) ----------------
    var yl = u.text(planeO, '记得的', 'small', { x: AXX - 22, y: 262, anchor: 'right', style: { fontSize: '44px', color: '#a9bad8' } });
    var xl = u.text(planeO, '时间', 'small', { x: 1756, y: 930, anchor: 'right', style: { fontSize: '44px', color: '#a9bad8' } });
    gsap.set([yl, xl], { opacity: 0 });
    tl.fromTo(yl, { opacity: 0, y: 14 }, { opacity: 0.95, y: 0, duration: 0.6, ease: 'power3.out' }, tx.yl.in);
    tl.fromTo(xl, { opacity: 0, x: -18 }, { opacity: 0.95, x: 0, duration: 0.6, ease: 'power3.out' }, tx.xl.in + 0.25);
    tl.to([yl, xl], { opacity: 0, duration: 0.35, ease: 'power2.in' }, Math.min(tx.yl.out, tx.xl.out) - 0.35);

    // ---------------- the learner: s02's figure exactly (feet at screen (502, 984), scale 0.958), then he walks on the
    // beats of bar 12 to stand under the cliff and looks up. Drawn on the fx canvas, a pure function of t. ----------------
    var LS = 0.958, L_X0 = 502, L_X1 = 330, L_Y = 984, T_W0 = BEAT[1], T_W1 = BEAT[5];
    function learnerFade(t) { return 1 - seg(t, 16.4, 17.4, eP2i); }
    function learnerX(t) { return lerp(L_X0, L_X1, seg(t, T_W0, T_W1)); }
    function drawLearner(g, t, c) {
      var k = learnerFade(t); if (k <= 0.002) return;
      var dp = darkProg(t), hb = (0.4 - 0.1 * dp) * (1 + 0.12 * eN(t));
      var dist = L_X0 - learnerX(t), ph = Math.PI * dist / 43, walking = t > T_W0 && t < T_W1;
      var up = seg(t, T_DRAW - 0.4, T_DRAW + 0.8, eSine) + 0.6 * seg(t, T_FALL, T_FALL + 1.2, eSine);   // head goes back, looks up
      var br = Math.sin(t * 1.7) * 1.1 * (walking ? 0 : 1), bob = walking ? -2.5 * Math.abs(Math.sin(ph)) : 0;
      var hx = 8 - 4 * up, hy = -240 + br * 0.6 - 6 * up + bob;
      g.save(); g.translate(c.tx, c.ty); g.scale(c.z, c.z); g.translate(learnerX(t), L_Y); g.scale(LS, LS);
      g.globalCompositeOperation = 'source-over'; g.globalAlpha = k;
      g.lineCap = 'round'; g.lineJoin = 'round';
      var sh = g.createRadialGradient(0, 0, 0, 0, 0, 46); sh.addColorStop(0, 'rgba(0,0,0,.55)'); sh.addColorStop(1, 'rgba(0,0,0,0)');
      g.save(); g.scale(1, 0.22); g.fillStyle = sh; g.fillRect(-50, -50, 100, 100); g.restore();
      g.translate(0, bob);
      g.save(); g.translate(-19, -166 + br * 0.4); g.rotate(-0.16);
      g.fillStyle = '#0d1630'; g.strokeStyle = '#cfdcf5'; g.lineWidth = 4;
      g.beginPath(); g.roundRect(-16, -33, 32, 66, 4); g.fill(); g.stroke();
      g.lineWidth = 1.6; g.strokeStyle = 'rgba(207,220,245,.6)';
      g.beginPath(); g.moveTo(-9, -24); g.lineTo(-9, 24); g.moveTo(-3, -24); g.lineTo(-3, 24); g.stroke();
      g.restore();
      // legs: standing pose of s02 at rest; a walk cycle tied to the distance (feet do not slide), heading left
      var f0 = -18, f1 = 15, l0 = 0, l1 = 0;
      if (walking) {   // feet swap every 43 px of travel: the stance foot drifts back, the swing foot lifts and goes forward (left)
        var cph = Math.cos(ph), sph = Math.sin(ph);
        f0 = -1.5 - 16.5 * cph; f1 = -1.5 + 16.5 * cph;
        l0 = 10 * Math.max(0, -sph); l1 = 10 * Math.max(0, sph);
      }
      g.strokeStyle = 'rgba(214,226,248,0.94)'; g.lineWidth = 6;
      g.beginPath();
      g.moveTo(hx * 0.4, hy + 25); g.lineTo(0, -198 + br);
      g.moveTo(0, -198 + br); g.quadraticCurveTo(4 + 3 * up, -152, -3, -108);
      g.moveTo(-3, -108); g.lineTo((-3 + f0) / 2 - 4 - l0 * 0.6, -56 - l0 * 0.5); g.lineTo(f0, -3 - l0 - bob);
      g.moveTo(-3, -108); g.lineTo((-3 + f1) / 2 + 3 - l1 * 0.6, -56 - l1 * 0.5); g.lineTo(f1, -3 - l1 - bob);
      var sw = walking ? 7 * Math.sin(ph) : 0;
      g.moveTo(1, -190 + br); g.lineTo(17 + sw * 0.5, -150 + br * 0.6); g.lineTo(21 + sw, -112);
      g.moveTo(-1, -190 + br); g.lineTo(-27, -160 + br * 0.6); g.lineTo(-9, -134 + br * 0.4);
      g.stroke();
      var hg = g.createRadialGradient(hx - 6, hy - 7, 2, hx, hy, 23);
      hg.addColorStop(0, 'rgba(236,244,255,' + (0.55 + 0.45 * hb).toFixed(3) + ')');
      hg.addColorStop(0.55, 'rgba(169,200,255,' + (0.45 + 0.5 * hb).toFixed(3) + ')');
      hg.addColorStop(1, 'rgba(110,150,225,' + (0.5 + 0.4 * hb).toFixed(3) + ')');
      g.fillStyle = hg; g.beginPath(); g.arc(hx, hy, 23, 0, 6.2832); g.fill();
      // head lamp (as in s02)
      g.globalCompositeOperation = 'lighter';
      glowDisc(g, hx, hy, 92, 'rgba(127,166,224,', 0.30 * hb * k); glowDisc(g, hx, hy, 34, 'rgba(190,215,255,', 0.32 * hb * k);
      g.restore();
    }

    // ---------------- "evıdence" as a text-on-path train; the motif dot is the tittle of the ı ----------------
    var EV_PX = 64, EV_FONT = 'italic 400 64px "Source Serif 4 Display"';
    var LET = ['e', 'v', 'ı', 'd', 'e', 'n', 'c', 'e'], IDX_I = 2;
    mctx.font = EV_FONT;
    var LW = LET.map(function (c) { return mctx.measureText(c).width; });
    var CEN = [], accw = 0;
    LET.forEach(function (c, i) { CEN.push(accw + LW[i] / 2); accw += LW[i]; });
    var OFF = CEN.map(function (c) { return c - CEN[IDX_I]; });
    var TOFF = { x: 6, y: -44 }, DOT_R = 4.4;   // measured below
    (function () {
      var S = 220, ox = 60, oy = 160;
      function ink(c) { var cv = document.createElement('canvas'); cv.width = cv.height = S; var g = cv.getContext('2d', { willReadFrequently: true }); g.font = EV_FONT; g.fillStyle = '#fff'; g.fillText(c, ox, oy); return g.getImageData(0, 0, S, S).data; }
      var a = ink('i'), b = ink('ı'), sx = 0, sy = 0, n = 0, x0 = 1e9, x1 = -1e9;
      for (var y = 0; y < S; y++) for (var x = 0; x < S; x++) { var i = (y * S + x) * 4 + 3, dl = a[i] - b[i]; if (dl > 60) { sx += x * dl; sy += y * dl; n += dl; if (x < x0) x0 = x; if (x > x1) x1 = x; } }
      if (n > 0) { TOFF.x = sx / n - ox - LW[IDX_I] / 2; TOFF.y = sy / n - oy; DOT_R = clamp((x1 - x0 + 1) / 2, 3.5, 6); }
    })();
    // shatter grains: 40 ink points per letter (letter frame: origin at the centre of the baseline)
    var GRAIN = LET.map(function (c, li) {
      var S = 120, cv = document.createElement('canvas'); cv.width = cv.height = S;
      var g = cv.getContext('2d', { willReadFrequently: true }); g.font = EV_FONT; g.fillStyle = '#fff';
      g.fillText(c, 60 - LW[li] / 2, 90);
      var d = g.getImageData(0, 0, S, S).data, pts = [];
      for (var y = 0; y < S; y += 2) for (var x = 0; x < S; x += 2) if (d[(y * S + x) * 4 + 3] > 140) pts.push([x - 60, y - 90]);
      var Rg = u.rand('s03-grain' + li), out = [];
      for (var i = 0; i < 40; i++) {
        var p = pts.length ? pts[Rg.int(0, pts.length - 1)] : [0, -20];
        out.push({ x: p[0], y: p[1], vx: Rg.range(-55, 55), vy: Rg.range(-60, 10), g: Rg.range(40, 110), life: Rg.range(0.8, 1.5), r: Rg.range(0.9, 1.9) });
      }
      return out;
    });

    var train = u.el('div', { cls: 'abs', parent: planeO, style: { left: '0px', top: '0px', width: '1px', height: '1px' } });
    var probe = u.el('span', { cls: 't-en', parent: train, style: { position: 'absolute', left: '0px', top: '0px', fontSize: EV_PX + 'px', lineHeight: EV_PX + 'px' }, html: 'e<span style="display:inline-block;width:0;height:0"></span>' });
    var BASE = probe.lastChild.offsetTop; probe.remove();
    var letEls = LET.map(function (c, i) {
      return u.el('span', { cls: 'ch t-en', text: c, parent: train, style: {
        position: 'absolute', left: (-EV_PX / 2) + 'px', top: (-BASE).toFixed(2) + 'px', width: EV_PX + 'px', textAlign: 'center', fontSize: EV_PX + 'px', lineHeight: EV_PX + 'px',
        letterSpacing: '0', color: '#eaf1ff', transformOrigin: (EV_PX / 2) + 'px ' + BASE.toFixed(2) + 'px', opacity: 0, whiteSpace: 'pre' } });
    });

    // train motion: the ı's arc position. Plunge (power4.in) to marker 1, then stop-and-go to markers 2, 3, 4
    function sTr(t) {
      if (t <= T_SLIDE) return 0;
      if (t < T_M[0]) return S_M[0] * eP4i(seg(t, T_SLIDE, T_M[0]));
      if (t < T_M[1]) return lerp(S_M[0], S_M[1], eP2io(seg(t, T_M[0], T_M[1])));
      if (t < T_M[2]) return lerp(S_M[1], S_M[2], eP2io(seg(t, T_M[1], T_M[2])));
      if (t < T_M[3]) return lerp(S_M[2], S_M[3], eSine(seg(t, T_M[2], T_M[3])));
      return CL;
    }
    // drop schedule: front pair at marker 1, ..., e and ı at marker 4 (the ı last, its dot stays)
    var TD = []; TD[7] = T_M[0]; TD[6] = T_M[0] + 0.07; TD[5] = T_M[1]; TD[4] = T_M[1] + 0.07; TD[3] = T_M[2]; TD[1] = T_M[2] + 0.07; TD[0] = T_M[3]; TD[2] = T_M[3] + 0.07;
    var FALL_D = 0.22, LIFT = 5;
    var WIN0 = { x: EVW.x, y: EVW.y };
    function onPath(k, t, out) {
      var q = atS(sTr(t) + OFF[k], Q), nx = Math.sin(q.a), ny = -Math.cos(q.a);
      out.x = q.x + nx * LIFT; out.y = q.y + ny * LIFT; out.a = q.a; return out;
    }
    var LP = LET.map(function () { return { x: 0, y: 0, a: 0, op: 0, sc: 1, vis: false }; });
    var DROPST = LET.map(function (c, k) {   // state at the drop moment and at the shatter moment (pure, precomputed)
      var p1 = onPath(k, TD[k], {}), p0 = onPath(k, TD[k] - 1 / 240, {});
      var vx = (p1.x - p0.x) * 240, vy = (p1.y - p0.y) * 240, spin = (hsh(k, 'spin') - 0.5) * 5;
      var st = { x: p1.x, y: p1.y, a: p1.a, vx: vx * 0.4, vy: vy * 0.4, spin: spin };
      var dt = FALL_D;
      st.sx = st.x + st.vx * dt; st.sy = st.y + st.vy * dt + 0.5 * 900 * dt * dt; st.sa = st.a + spin * dt;
      st.svx = st.vx * 0.3; st.svy = (st.vy + 900 * dt) * 0.2;
      return st;
    });
    function letterPose(k, t, out) {
      out.vis = false;
      if (t < T_SLIDE || t >= TD[k] + FALL_D + 0.06) return out;
      if (t >= TD[k]) {
        var d = DROPST[k], dt = t - TD[k];
        out.x = d.x + d.vx * dt; out.y = d.y + d.vy * dt + 0.5 * 900 * dt * dt; out.a = d.a + d.spin * dt;
        out.op = 1 - seg(t, TD[k] + FALL_D, TD[k] + FALL_D + 0.06); out.sc = 1; out.vis = out.op > 0.001; return out;
      }
      onPath(k, t, out); out.sc = 1;
      var dl = 0.035 * Math.abs(k - IDX_I), p = eExpo(seg(t, T_SLIDE + dl, T_SLIDE + dl + 0.6));
      out.x = lerp(WIN0.x, out.x, p); out.y = lerp(WIN0.y, out.y, p); out.a = lerp(0, out.a, p);
      out.op = seg(t, T_SLIDE + dl, T_SLIDE + dl + 0.18); out.sc = lerp(0.68, 1, p); out.vis = true;
      return out;
    }
    function nDropped(t) { var n = 0; for (var k = 0; k < 8; k++) if (t >= TD[k]) n++; return n; }

    // the motif dot
    var restA = { x: CP[NS][0], y: CP[NS][1] };
    var IPOSE = { x: 0, y: 0, a: 0, sc: 1 };
    function tittle(t) {
      letterPose(IDX_I, Math.min(t, TD[IDX_I] - 1e-4), IPOSE);
      var ca = Math.cos(IPOSE.a), sa = Math.sin(IPOSE.a), sc = IPOSE.sc == null ? 1 : IPOSE.sc;
      return [IPOSE.x + (ca * TOFF.x - sa * TOFF.y) * sc, IPOSE.y + (sa * TOFF.x + ca * TOFF.y) * sc];
    }
    var T_IDROP = TD[IDX_I], DOT_AT_DROP = null;
    var P_S02 = { x: 1710, y: 362 }, T_G0 = BEAT[4], T_G1 = BEAT[7];
    function dotPos(t) {
      if (t < T_G0) return [P_S02.x, P_S02.y];
      if (t < T_G1) { var gq = eP3io(seg(t, T_G0, T_G1)); return bez4([P_S02.x, P_S02.y], [1460, 150], [560, 110], [WIN0.x, WIN0.y], gq); }
      if (t < T_SLIDE) return [WIN0.x, WIN0.y];
      if (t < T_IDROP) {
        var tp = tittle(t), h = eP3o(seg(t, T_SLIDE, T_SLIDE + 0.32));
        return [lerp(WIN0.x, tp[0], h), lerp(WIN0.y, tp[1], h)];
      }
      if (!DOT_AT_DROP) DOT_AT_DROP = tittle(T_IDROP - 1e-4);
      if (t < T_FOLD) { var r = eP3io(seg(t, T_IDROP, T_IDROP + 0.7)); return [lerp(DOT_AT_DROP[0], restA.x, r), lerp(DOT_AT_DROP[1], restA.y - 3, r) - 6 * Math.sin(Math.PI * r)]; }
      var P = foldPts(t); return [P[NZ][0], P[NZ][1] - 3];
    }
    function bez4(p0, p1, p2, p3, s) {
      var a = 1 - s;
      return [a * a * a * p0[0] + 3 * a * a * s * p1[0] + 3 * a * s * s * p2[0] + s * s * s * p3[0], a * a * a * p0[1] + 3 * a * a * s * p1[1] + 3 * a * s * s * p2[1] + s * s * s * p3[1]];
    }
    var LEVEL = [1.0, 0.82, 0.65, 0.48, 0.30];
    function dotBright(t) {
      var b = LEVEL[0];
      for (var i = 0; i < 4; i++) b += (LEVEL[i + 1] - LEVEL[i]) * seg(t, T_M[i], T_M[i] + 0.45, eP2o);
      for (i = 0; i < 4; i++) b += 0.7 * pulse(t - T_M[i], 0.012, 0.22);
      if (t < T_SLIDE) b += 0.08 * u.beatPulse(t, 0.3);
      b += 0.5 * pulse(t - T_SLIDE, 0.02, 0.3) + 0.6 * pulse(t - T_G1, 0.015, 0.3);
      return b;
    }
    function dotCool(t) { return clamp((dotBright(t) - 0.3) / 0.7, 0, 1); }

    // ---------------- HUD text ----------------
    var kick = u.text(hud, '', 'en', { x: 880, y: 92, anchor: 'left', style: { fontSize: '60px', color: '#9ec0f0', letterSpacing: '0.01em' } });
    var head = u.text(hud, '', 'headline', { x: 880, y: 156, anchor: 'top-left', html: '<span style="font-size:104px">不复习，</span><br>新学的东西会<span style="color:#ffffff;text-shadow:0 0 18px rgba(160,200,255,0.45)">很快忘掉</span>，', style: { fontSize: '84px', lineHeight: '1.16', color: '#dde6f5' } });
    var sub = u.text(hud, '', 'line', { x: 880, y: 428, anchor: 'top-left', html: '而且一开始，<span style="color:#f6f9ff;text-shadow:0 0 16px rgba(160,200,255,0.5)">忘得最快</span>。', style: { fontSize: '60px', color: '#b4c3de' } });
    var notEl = u.text(hud, '不是你笨。', 'headline', { x: 960, y: 176, style: { fontSize: '128px', color: '#eef4ff', letterSpacing: '0.06em' } });
    var src = u.text(hud, 'Ebbinghaus, 1885 · Murre & Dros, 2015', 'source', { x: 1856, y: 1028, anchor: 'bottom-right', style: { color: '#93a4c4' } });
    var headCh = u.splitChars(head), subCh = u.splitChars(sub);

    gsap.set([kick, src], { opacity: 0 });
    tl.set(kick, { opacity: 1 }, tx.kick.in);
    tl.to(kick, { duration: 1.1, scrambleText: { text: 'forgetting curve', chars: 'lowerCase', revealDelay: 0.35, speed: 0.6 }, ease: 'none' }, tx.kick.in);
    tl.to(kick, { opacity: 0, x: 24, filter: 'blur(6px)', duration: 0.38, ease: 'power2.in' }, tx.kick.out - 0.38);

    gsap.set(headCh, { opacity: 0 });
    tl.fromTo(headCh, { opacity: 0, y: 46, filter: 'blur(10px)' }, { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.75, ease: 'power4.out', stagger: 0.04 }, tx.head.in);
    tl.to(headCh, { opacity: 0, y: 40, rotation: function (i) { return (hsh(i, 'hr') - 0.5) * 24; }, filter: 'blur(7px)', duration: 0.28, ease: 'power2.in', stagger: 0.005 }, tx.head.out - 0.28 - 0.005 * (headCh.length - 1));

    gsap.set(subCh, { opacity: 0 });
    var subChroma = u.chroma(sub, { amount: 0 });
    tl.fromTo(subCh, { opacity: 0, y: 34, filter: 'blur(8px)' }, { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.6, ease: 'power4.out', stagger: 0.035 }, tx.sub.in);
    tl.fromTo(subChroma.state, { amount: 0 }, { keyframes: [{ amount: 7, duration: 0.06 }, { amount: 0, duration: 0.35, ease: 'power2.out' }] }, tx.sub.in + 0.36);
    tl.to(subCh, { opacity: 0, y: 36, rotation: function (i) { return (hsh(i, 'sr') - 0.5) * 24; }, filter: 'blur(7px)', duration: 0.28, ease: 'power2.in', stagger: 0.006 }, tx.sub.out - 0.28 - 0.006 * (subCh.length - 1));

    tl.fromTo(src, { opacity: 0 }, { opacity: 0.68, duration: 0.7, ease: 'power2.out' }, tx.src.in);
    tl.to(src, { opacity: 0, duration: 0.35, ease: 'power2.in' }, tx.src.out - 0.35);

    // 不是你笨。 slams in on bar 17 and holds
    var notCh = u.splitChars(notEl);
    gsap.set(notEl, { opacity: 0, scale: 1.45 }); gsap.set(notCh, { filter: 'blur(16px)' });
    var notChroma = u.chroma(notEl, { amount: 0 });
    var notGlow = u.energyGlow(notEl, { color: '#a9c8ff', min: 10, max: 30, hit: 0.35, amount: 0 });
    tl.to(notEl, { opacity: 1, duration: 0.12, ease: 'power1.in' }, T_NOT - 0.13);
    tl.to(notEl, { scale: 0.975, duration: 0.13, ease: 'power4.in' }, T_NOT - 0.13);
    tl.to(notCh, { filter: 'blur(0px)', duration: 0.13, ease: 'power4.in' }, T_NOT - 0.13);
    tl.to(notEl, { scale: 1, duration: 0.5, ease: 'back.out(2.2)' }, T_NOT);
    tl.fromTo(notChroma.state, { amount: 0 }, { keyframes: [{ amount: 6, duration: 0.04 }, { amount: 0, duration: 0.4, ease: 'power2.out' }] }, T_NOT);
    tl.fromTo(notGlow.state, { amount: 0 }, { amount: 1, duration: 0.5, ease: 'power2.out' }, T_NOT);
    tl.to(notEl, { opacity: 0, scale: 1.03, duration: 0.4, ease: 'power2.in' }, tx.not.out - 0.4);
    tl.to(notCh, { filter: 'blur(8px)', duration: 0.4, ease: 'power2.in' }, tx.not.out - 0.4);
    tl.to(notGlow.state, { amount: 0, duration: 0.4 }, tx.not.out - 0.4);

    // ---------------- per-frame DOM state ----------------
    u.onFrame(function (t) {
      var c = camAt(t), m = 'matrix(' + c.z.toFixed(5) + ',0,0,' + c.z.toFixed(5) + ',' + c.tx.toFixed(3) + ',' + c.ty.toFixed(3) + ')';
      camG.setAttribute('transform', 'matrix(' + c.z.toFixed(5) + ' 0 0 ' + c.z.toFixed(5) + ' ' + c.tx.toFixed(3) + ' ' + c.ty.toFixed(3) + ')');
      planeO.style.transform = m;
      // sky: darker with every wave, colder top light once the chart is drawn, abyss, navy at the end
      var dp = darkProg(t);
      cityGlow.style.opacity = (1 - 0.85 * dp).toFixed(4);
      coldTop.style.opacity = (seg(t, T_DRAW, T_DRAW + 1.5) * (1 - seg(t, 16.0, 17.4))).toFixed(4);
      abyss.style.opacity = (0.4 * dp + 0.6 * seg(t, T_DRAW, T_FALL + 1.0, eSine)).toFixed(4);
      navy.style.opacity = eSine(seg(t, 16.1, 17.65)).toFixed(4);
      if (t < T_WIPE) {
        var X = -340 + clamp(t / T_WIPE, 0, 1) * WIPE_W;
        band.style.display = '';
        band.style.background = 'linear-gradient(90deg, rgba(4,6,12,0) ' + (X - 820).toFixed(1) + 'px, rgba(4,6,12,0.72) ' + (X - 380).toFixed(1) + 'px, rgba(4,6,12,0.72) ' + (X + 30).toFixed(1) + 'px, rgba(4,6,12,0) ' + (X + 31).toFixed(1) + 'px)';
      } else { band.style.display = 'none'; band.style.background = ''; }
      [coldTop, abyss, navy, cityGlow].forEach(function (e) { var hide = parseFloat(e.style.opacity) < 0.002; if (e._h !== hide) { e.style.display = hide ? 'none' : ''; e._h = hide; } });
      // train letters
      var nd = nDropped(t), col = mixHex('#eaf1ff', '#a2b3d1', nd / 8);
      var gl = 0.42 * dotCool(t);
      var sh = '0 0 3px rgba(5,8,16,0.9), 0 0 12px rgba(5,8,16,0.6), 0 0 16px rgba(150,190,255,' + gl.toFixed(3) + ')';
      for (var k = 0; k < 8; k++) {
        var p = letterPose(k, t, LP[k]), e = letEls[k];
        if (!p.vis) { p.x = 0; p.y = 0; p.a = 0; p.sc = 1; p.op = 0; }
        e.style.opacity = p.op.toFixed(4);
        e.style.transform = 'translate(' + p.x.toFixed(2) + 'px,' + p.y.toFixed(2) + 'px) rotate(' + (p.a * 57.29578).toFixed(3) + 'deg) scale(' + p.sc.toFixed(4) + ')';
        e.style.color = col; e.style.textShadow = sh;
      }
      // tail morph
      if (t >= T_FOLD - 0.01) tailPath(polyD(foldPts(t)));
      else tailPath(TPD0);
    });
    var TPD0 = polyD(TP), lastTail = '';
    function tailPath(d) { if (d === lastTail) return; lastTail = d; tailP.forEach(function (p) { p.setAttribute('d', d); }); }

    // ---------------- waterfall: particles ----------------
    var RP = u.rand('s03-flow');
    function flux(t) {
      var env = 0;
      if (t >= T_FALL) {
        env = lerp(0, 1.55, seg(t, T_FALL, T_FALL + 0.22, eP2o));
        env = lerp(env, 1.0, seg(t, T_FALL + 0.35, T_FALL + 1.2, eSine));
        env += 0.45 * pulse(t - T_FULL, 0.05, 1.2) + 0.25 * strongPulse(t, 0.8);
        env *= lerp(1, 0.82, seg(t, T_NOT, T_NOT + 1.0)) * (1 - seg(t, 15.7, 16.45, eP2i));
      }
      return env * (0.6 + 0.8 * eN(t));
    }
    var NP = 5200, PTS = [];
    (function () {
      var dtS = 1 / 240, cum = [0], ts = [T_FALL];
      for (var t = T_FALL; t < 16.5; t += dtS) { cum.push(cum[cum.length - 1] + flux(t + dtS / 2) * dtS); ts.push(t + dtS); }
      var tot = cum[cum.length - 1];
      var Rinv = 1 - Ru(1);
      for (var i = 0; i < NP; i++) {
        var target = (i + RP()) / NP * tot, j = bsearch(cum, target), f = (target - cum[j]) / Math.max(1e-9, cum[j + 1] - cum[j]);
        var p = { ts: lerp(ts[j], ts[Math.min(j + 1, ts.length - 1)], f), f: RP.range(0.85, 1.22), off: Math.pow(RP(), 1.6) * 11, a: RP.range(0.45, 1.0),
          w: RP() < 0.55 ? 0 : RP() < 0.7 ? 1 : 2, ph: RP() * 6.28 };
        var q = RP();
        if (q < Rinv) {
          var ud = uOfR(1 - q), sd = sAtU(ud), tau = tauOfS(sd);
          p.ad = tau / p.f;
          var fs = flowAt(tau, {});
          var nx = Math.sin(fs.a), ny = -Math.cos(fs.a);
          p.dx = fs.x + nx * p.off; p.dy = fs.y + ny * p.off;
          var vv = fs.v * p.f * 0.35, cliff = 1 - seg(ud, 0.1, 0.2);
          p.cliff = cliff;
          p.dvx = Math.cos(fs.a) * vv + lerp(RP.range(-20, 50), RP.range(50, 240), cliff); p.dvy = Math.sin(fs.a) * vv + RP.range(-40, 60);
          p.sway = RP.range(-10, 10);
          p.life = p.ad + 2.0;
        } else { p.ad = 1e9; p.life = TTEND / p.f; p.rider = true; }
        PTS.push(p);
      }
      PTS.sort(function (a, b) { return a.ts - b.ts; });
    })();
    var PT_TS = PTS.map(function (p) { return p.ts; });
    var MAXLIFE = PTS.reduce(function (m, p) { return Math.max(m, p.life); }, 0);
    var GRAV = 820;

    // readable words in the waterfall (the foreground ~40)
    var FW = [], RWd = u.rand('s03-fw');
    var fwWords = RWd.shuffle(WORDS.filter(function (s) { return s.length >= 5 && s.length <= 9; })).slice(0, 19);
    var LANES = [60, 230, 130, 300, 90, 260, 170, 40, 210, 320];
    function fwPose(it, wa, out) {   // pose of a waterfall word at age wa (pure)
      if (wa < it.ad) { flowAt(it.ta + wa, FS0); var nx = Math.sin(FS0.a), ny = -Math.cos(FS0.a), lf = it.px * 0.42 + 4; out.x = FS0.x + nx * lf; out.y = FS0.y + ny * lf; out.r = FS0.a; out.d = -1; return out; }
      var d = wa - it.ad, ex = 1 - Math.exp(-d / it.tauD);
      out.x = it.dx + it.dvx * it.tauD * ex + it.sway * Math.sin(it.ph + d * 2.2) * Math.min(1, d);
      out.y = it.dy + it.vT * d + (it.dvy - it.vT) * it.tauD * ex;
      out.r = lerp(it.da * 0.6, 0, eP2o(seg(d, 0, 0.4))) + it.spin * d; out.d = d; return out;
    }
    var FS0 = { x: 0, y: 0, a: 0, v: 0, s: 0 };
    fwWords.forEach(function (wd, i) {
      var ital = RWd() < 0.62, px = Math.round(RWd.range(40, 54)), font = (ital ? 'italic ' : '') + '400 ' + px + 'px "Source Serif 4 Display"';
      var ice = textSprite(wd, font, px, '#e8f0ff', 'rgba(160,200,255,0.9)', 10), grey = textSprite(wd, font, px, '#6c7ea3', 'rgba(0,0,0,0)', 0);
      var best = null;
      for (var tries = 0; tries < 40 && !best; tries++) {
        var ts0 = lerp(T_FALL + 0.12, 15.45, (i + 0.5) / fwWords.length) + RWd.range(-0.12, 0.12);
        var ua = i % 2 ? RWd.range(0.035, 0.07) : RWd.range(0.008, 0.03), ud = ua + RWd.range(0.008, 0.016), ta = tauOfS(sAtU(ua)), td = tauOfS(sAtU(ud));
        var fs = flowAt(td, {});
        var it = { ts: ts0, ta: ta, ad: td - ta, px: px, ice: ice, grey: grey, tw: ice.tw,
          dx: fs.x, dy: fs.y, da: fs.a, dvx: LANES[(i + tries) % LANES.length] + RWd.range(-20, 20), dvy: RWd.range(20, 90),
          spin: RWd.range(-0.9, 0.9), vT: RWd.range(230, 310), tauD: RWd.range(0.5, 0.7), sway: RWd.range(8, 20), ph: RWd() * 6.28, life: 0 };
        it.life = it.ad + 3.0;
        // reject if its box comes within reach of an earlier word's box while both are bright
        var ok = true, P1 = {}, P2 = {};
        for (var j = 0; j < FW.length && ok; j++) {
          var o = FW[j];
          for (var tt = Math.max(it.ts, o.ts); tt < Math.min(it.ts + 2.4, o.ts + 2.4); tt += 0.05) {
            fwPose(it, tt - it.ts, P1); fwPose(o, tt - o.ts, P2);
            if (P1.y > 1000 || P2.y > 1000) continue;
            var c1 = Math.abs(Math.cos(P1.r)), s1 = Math.abs(Math.sin(P1.r)), c2 = Math.abs(Math.cos(P2.r)), s2 = Math.abs(Math.sin(P2.r));
            var hx = (it.tw * c1 + it.px * s1 + o.tw * c2 + o.px * s2) / 2, hy = (it.tw * s1 + it.px * c1 + o.tw * s2 + o.px * c2) / 2;
            if (Math.abs(P1.x - P2.x) < hx + 20 && Math.abs(P1.y - P2.y) < hy + 10) { ok = false; break; }
          }
        }
        if (ok) best = it;
      }
      if (best) FW.push(best);
    });

    // mist and bokeh
    var MIST = [], RM = u.rand('s03-mist');
    for (var mi = 0; mi < 9; mi++) MIST.push({ x: RM.range(300, 820), y: RM.range(960, 1110), r: RM.range(150, 300), vx: RM.range(-8, 8), vy: RM.range(-22, -10), ph: RM() * 6.28 });
    var BOK = [], RBk = u.rand('s03-bok');
    [[90, 140], [1830, 120], [60, 980], [1860, 990], [520, 1060], [1500, 40], [1890, 560], [980, 1070]].forEach(function (p) { BOK.push({ x: p[0], y: p[1], r: RBk.range(50, 110), a: RBk.range(0.012, 0.024), ph: RBk() * 6.28 }); });

    // ---------------- canvas: back (city, windows, ash, hero words) ----------------
    function winB(q, t) {
      if (t < q.off) return 1;
      var x = t - q.off;
      if (q.kind === 1) { if (x < 0.03) return 1.4; return 1.4 * Math.exp(-(x - 0.03) / 0.05); }
      var s = q.fk || 1;
      x /= s;
      if (x < 0.05) return 0.25; if (x < 0.1) return 1.0; if (x < 0.16) return 0.12; if (x < 0.22) return 0.7; if (x < 0.36) return 0.7 * (1 - (x - 0.22) / 0.14);
      return 0;
    }
    function drawBack(g, t) {
      var c = camAt(t);
      var fadeB = 1 - 0.85 * seg(t, T_DRAW, T_DRAW + 1.2, eP2io);
      var endF = 1 - seg(t, 16.0, 17.5, eSine);
      if (endF <= 0) return;
      // far skyline
      var cf = camD(c, 0.45);
      g.save(); g.translate(cf.tx, cf.ty); g.scale(cf.z, cf.z);
      g.globalAlpha = 0.95 * fadeB * endF; g.drawImage(farBodies.c, 0, 0, W, H);
      if (t < FAR_LAST + 0.3) {
        var FC2 = ['#6f8fc8', '#8fb2ec', '#a9c8ff'];
        for (var cc = 0; cc < 3; cc++) {
          g.fillStyle = FC2[cc];
          for (var i = 0; i < farWins.length; i++) {
            var fw = farWins[i]; if (fw.c !== cc) continue;
            var b = t < fw.off ? 1 : Math.exp(-(t - fw.off) / 0.07);
            if (b < 0.02) continue;
            g.globalAlpha = fw.b0 * b * endF; g.fillRect(fw.x, fw.y, 4, 5);
          }
        }
      }
      g.restore();
      // chart city
      g.save(); g.translate(c.tx, c.ty); g.scale(c.z, c.z);
      g.globalAlpha = fadeB * endF; g.drawImage(chartBodies.c, 0, 0, W, H);
      var dimK = (1 - 0.36 * seg(t, T_DRAW, T_DRAW + 1.2, eP2io) - 0.2 * seg(t, T_FALL, T_FALL + 2.0, eSine)) * (1 + 0.15 * liftAt(t)) * endF;
      // glow pass
      g.globalCompositeOperation = 'lighter';
      for (i = 0; i < wins.length; i++) {
        var q = wins[i], bb = winB(q, t) * q.b0 * dimK; if (bb < 0.02) continue;
        g.globalAlpha = Math.min(1, 0.2 * bb); g.drawImage(glowSpr.c, q.x - 22, q.y - 24, 44, 48);
      }
      g.globalCompositeOperation = 'source-over';
      // crisp windows, grouped by colour
      var cool = seg(t, 0, T_DRAW + 1.2);
      for (var wc = 0; wc < WCOL.length; wc++) {
        g.fillStyle = cool > 0.5 && wc === 3 ? '#cfe0fb' : WCOL[wc];
        for (i = 0; i < wins.length; i++) {
          q = wins[i]; if (q.ci !== wc) continue;
          bb = winB(q, t) * q.b0 * dimK; if (bb < 0.02) continue;
          g.globalAlpha = Math.min(1, bb); g.fillRect(q.x - WW / 2, q.y - WH / 2, WW, WH);
        }
      }
      // the abyss opens under the cliff: the lit stacks there sink into the dark behind the waterfall
      var ab = seg(t, T_FALL - 0.4, T_FALL + 1.8, eSine) * endF;
      if (ab > 0.003) {
        var agr = g.createRadialGradient(470, 860, 40, 470, 860, 720);
        agr.addColorStop(0, 'rgba(3,5,10,' + (0.93 * ab).toFixed(4) + ')'); agr.addColorStop(0.45, 'rgba(3,5,10,' + (0.78 * ab).toFixed(4) + ')'); agr.addColorStop(1, 'rgba(3,5,10,0)');
        g.globalAlpha = 1; g.fillStyle = agr; g.fillRect(-260, 140, 1460, 1000);
      }
      // ash letters from dead windows
      for (i = 0; i < wins.length; i++) {
        q = wins[i]; var a = q.ash; if (!a || t < q.off) continue;
        var dt = t - q.off; if (dt > a.life) continue;
        var ax = q.x + a.vx * dt + a.sway * Math.sin(a.ph + dt * 3.1), ay = q.y + a.vy * dt + 0.5 * a.g * dt * dt;
        var al = (1 - dt / a.life) * seg(dt, 0, 0.12) * endF, k2 = seg(dt, 0.2, 1.0);
        var spr = ASH.ice[a.ch], sz = a.sz / 30;
        g.save(); g.translate(ax, ay); g.rotate(a.r0 + a.w * dt);
        g.globalAlpha = 0.8 * al * (1 - k2); g.drawImage(spr.c, -spr.w * sz / 2, -spr.h * sz / 2, spr.w * sz, spr.h * sz);
        spr = ASH.grey[a.ch]; g.globalAlpha = 0.9 * al * k2; g.drawImage(spr.c, -spr.w * sz / 2, -spr.h * sz / 2, spr.w * sz, spr.h * sz);
        g.restore();
      }
      // hero words: pop out of their window, hold, crumble letter by letter
      for (i = 0; i < HERO.length; i++) {
        var h = HERO[i], ht = t - h.t0; if (ht < 0 || ht > 2.6) continue;
        var rise = eP3o(seg(ht, 0, 0.32)), baseY = h.w.y - 6 - 40 * rise, appear = seg(ht, 0, 0.16);
        for (var li = 0; li < h.letters.length; li++) {
          var L = h.letters[li], lt = ht - 0.55 - li * 0.045;
          var lx = h.cx + L.dx, ly = baseY, rot = 0, la = appear, kk = 0;
          if (lt > 0) {
            if (lt > L.life) continue;
            lx += L.vx * lt + L.sway * Math.sin(L.ph + lt * 3.4) * seg(lt, 0, 0.5); ly += 0.5 * L.g * lt * lt; rot = L.w * lt;
            la = 1 - seg(lt, 0.15, L.life); kk = seg(lt, 0.05, 0.75);
          }
          la *= endF; if (la <= 0.005) continue;
          g.save(); g.translate(lx, ly); g.rotate(rot);
          if (kk < 1) { g.globalAlpha = la * (1 - kk); g.drawImage(L.ice.c, -L.ice.w / 2, -L.ice.h / 2, L.ice.w, L.ice.h); }
          if (kk > 0) { g.globalAlpha = la * kk; g.drawImage(L.grey.c, -L.grey.w / 2, -L.grey.h / 2, L.grey.w, L.grey.h); }
          g.restore();
        }
      }
      g.restore();
    }

    // ---------------- canvas: fx (waterfall, grains, dot, sparks, mist, bokeh) ----------------
    var BC = ['#f2f7ff', '#cfe0fb', '#a7bde6', '#8195c0', '#5b6d93', '#3a4a6b'], BA = [0.1, 0.2, 0.33, 0.5, 0.7, 0.92], BWD = [1.0, 1.6, 2.4];
    var BUCK = []; for (var bq = 0; bq < 6 * 6 * 3; bq++) BUCK.push([]);
    var GLOWB = [];
    function aIdx(a) { return a < 0.15 ? 0 : a < 0.27 ? 1 : a < 0.42 ? 2 : a < 0.6 ? 3 : a < 0.8 ? 4 : 5; }
    var WP = {}, FS = { x: 0, y: 0, a: 0, v: 0, s: 0 }, RA = { x: 0, y: 0, a: 0 }, RBQ = { x: 0, y: 0, a: 0 }, riverN = u.makeNoise('s03river');
    function glowDisc(g, x, y, rad, rgb, a) {
      if (a <= 0.002 || rad <= 0.5) return;
      var gr = g.createRadialGradient(x, y, 0, x, y, rad);
      gr.addColorStop(0, rgb + a.toFixed(4) + ')'); gr.addColorStop(0.35, rgb + (a * 0.42).toFixed(4) + ')'); gr.addColorStop(1, rgb + '0)');
      g.fillStyle = gr; g.fillRect(x - rad, y - rad, rad * 2, rad * 2);
    }
    function spark(g, x, y, a, s) { glowDisc(g, x, y, 30 * s, 'rgba(170,210,255,', 0.5 * a); glowDisc(g, x, y, 7 * s, 'rgba(244,249,255,', a); }
    function streak(g, x, y, len, a) {
      if (a <= 0.003) return;
      g.save(); g.translate(x, y); g.scale(1, 0.02);
      var gr = g.createRadialGradient(0, 0, 0, 0, 0, len);
      gr.addColorStop(0, 'rgba(205,228,255,' + Math.min(1, a).toFixed(4) + ')'); gr.addColorStop(0.3, 'rgba(140,185,255,' + (0.4 * Math.min(1, a)).toFixed(4) + ')'); gr.addColorStop(1, 'rgba(120,170,255,0)');
      g.fillStyle = gr; g.fillRect(-len, -len, len * 2, len * 2); g.restore();
    }

    function drawFx(g, t) {
      var c = camAt(t), en = eN(t), lift = liftAt(t), gain = 1 + 0.15 * lift + 0.12 * en;
      var endF = 1 - seg(t, 16.6, 17.6, eSine);
      g.save(); g.translate(c.tx, c.ty); g.scale(c.z, c.z);
      g.globalCompositeOperation = 'lighter';

      // curve draw head
      var dpp = seg(t, T_DRAW, T_DRAW + 1.4);
      if (dpp > 0 && dpp < 1) { var hq = atS(eP4io(dpp) * CL, Q); spark(g, hq.x, hq.y, 0.95, 1.2); streak(g, hq.x, hq.y, 160, 0.5); }
      // axes heads
      var ap = seg(t, T_DRAW, T_DRAW + 1.0);
      if (ap > 0 && ap < 1) { var ae = eP3io(ap); spark(g, AXX, GY + 6 - (GY + 6 - 206) * ae, 0.5, 0.7); spark(g, AXX - 6 + (1798 - AXX + 6) * ae, GY, 0.5, 0.7); }

      // source glow (the spring the words pour out of)
      var fl = flux(t), flL = 0.5 * (flux(t - 0.3) + flux(t - 0.6));
      if (fl > 0.01) {
        glowDisc(g, CP[0][0], CP[0][1], 170, 'rgba(120,160,235,', 0.16 * fl * gain);
        glowDisc(g, CP[0][0], CP[0][1], 44, 'rgba(220,235,255,', 0.4 * Math.min(1.4, fl) * gain);
      }

      // the river riding the curve: its width and light are the flow volume, i.e. R at that point
      if (fl > 0.01) {
        var flS = Math.min(1.4, 0.5 * (fl + flL));
        g.lineCap = 'round';
        for (var rs = 0; rs < 70; rs++) {
          var s0 = CL * Math.pow(rs / 70, 1.6), s1 = CL * Math.pow((rs + 1) / 70, 1.6);
          var ra = atS(s0, RA), rb = atS(s1, RBQ);
          var vol = Ru((ra.x - PX0) / (PX1 - PX0)), tm = tauOfS(s0);
          var nz = 0.65 + 0.45 * riverN.noise2(tm * 2.6 - t * 2.6, 0.5);
          var wdt = 3 + 30 * Math.pow(vol, 1.7) * flS, nxr = Math.sin(ra.a), nyr = -Math.cos(ra.a), lo = wdt * 0.32;
          g.strokeStyle = '#7fa6e0'; g.globalAlpha = Math.min(1, 0.06 * vol * flS * nz * gain * endF); g.lineWidth = wdt * 2.2;
          g.beginPath(); g.moveTo(ra.x + nxr * lo, ra.y + nyr * lo); g.lineTo(rb.x + nxr * lo, rb.y + nyr * lo); g.stroke();
          g.strokeStyle = '#cfe0fb'; g.globalAlpha = Math.min(1, 0.16 * vol * flS * nz * gain * endF); g.lineWidth = wdt * 0.55;
          g.beginPath(); g.moveTo(ra.x + nxr * lo * 0.6, ra.y + nyr * lo * 0.6); g.lineTo(rb.x + nxr * lo * 0.6, rb.y + nyr * lo * 0.6); g.stroke();
        }
      }

      // the body of the waterfall: a soft sheet of light from the cliff down into the abyss
      if (flL > 0.01) {
        var shA = Math.min(1.3, flL) * (0.75 + 0.35 * en) * gain * endF;
        var cg = g.createLinearGradient(0, 260, 0, 1080);
        cg.addColorStop(0, 'rgba(170,205,255,' + (0.16 * shA).toFixed(4) + ')'); cg.addColorStop(0.35, 'rgba(140,180,245,' + (0.085 * shA).toFixed(4) + ')');
        cg.addColorStop(0.75, 'rgba(110,150,225,' + (0.035 * shA).toFixed(4) + ')'); cg.addColorStop(1, 'rgba(100,140,220,0)');
        g.globalAlpha = 1; g.fillStyle = cg; g.beginPath();
        var kneeS = sAtU(0.16);
        for (var cs2 = 0; cs2 <= 24; cs2++) { var cq = atS(kneeS * cs2 / 24, RA); if (cs2) g.lineTo(cq.x + 4, cq.y); else g.moveTo(cq.x + 4, cq.y); }
        var sw = 18 * Math.sin(t * 1.3);
        g.bezierCurveTo(640, 760, 700 + sw, 900, 760 + sw, 1090);
        g.lineTo(340 - sw * 0.5, 1090); g.bezierCurveTo(330, 900, 300, 600, CP[0][0] + 2, CP[0][1]);
        g.closePath(); g.fill();
        // bright lip where the river breaks over the cliff
        var lip = atS(sAtU(0.03), RA);
        glowDisc(g, lip.x + 18, lip.y + 10, 120, 'rgba(160,200,255,', 0.12 * shA);
      }

      // waterfall particles (bucketed strokes)
      if (t >= T_FALL && t < T_FALL + 12) {
        for (var b = 0; b < BUCK.length; b++) BUCK[b].length = 0;
        GLOWB.length = 0;
        var i0 = bsearch(PT_TS, t - MAXLIFE);
        for (var i = Math.max(0, i0 - 1); i < PTS.length; i++) {
          var p = PTS[i], age = t - p.ts;
          if (age < 0) break;
          if (age > p.life) continue;
          var x, y, vx, vy, fall = 0, al = p.a;
          if (age < p.ad) {
            flowAt(age * p.f, FS);
            var nx = Math.sin(FS.a), ny = -Math.cos(FS.a);
            x = FS.x + nx * p.off; y = FS.y + ny * p.off; vx = Math.cos(FS.a) * FS.v * p.f; vy = Math.sin(FS.a) * FS.v * p.f;
            if (p.rider) al *= 1 - seg(FS.s, CL - 150, CL);
            al *= lerp(1, 0.38, seg(FS.s, S_KNEE, S_KNEE + 260));
          } else {
            fall = age - p.ad;
            x = p.dx + p.dvx * fall + p.sway * Math.sin(p.ph + fall * 2.6) * fall; y = p.dy + p.dvy * fall + 0.5 * GRAV * fall * fall;
            vx = p.dvx; vy = p.dvy + GRAV * fall;
            al *= Math.min(1, 1.3 * Math.exp(-fall / 1.05)) * (1 - seg(y, 980, 1110)) * lerp(0.22, 1.15, p.cliff);
          }
          al *= seg(age, 0, 0.08) * gain * endF;
          if (al < 0.03) continue;
          var ci = fall <= 0 ? 0 : Math.min(5, Math.floor(fall / 0.26));
          var k = fall > 0 ? 0.04 : 0.01, cap = fall > 0 ? (p.cliff > 0.5 ? 60 : 26) : (FS.s > S_KNEE ? 4 : 8), lx = vx * k, ly = vy * k, ll = Math.sqrt(lx * lx + ly * ly);
          if (ll > cap) { lx *= cap / ll; ly *= cap / ll; }
          var bk = BUCK[(ci * 6 + aIdx(al)) * 3 + p.w];
          bk.push(x - lx, y - ly, x, y);
          if (ci <= 2) GLOWB.push(x - lx, y - ly, x, y);
        }
        g.lineCap = 'round';
        // bloom pass
        if (GLOWB.length) {
          g.strokeStyle = '#8fb4f4'; g.globalAlpha = Math.min(1, 0.055 * gain); g.lineWidth = 9; g.beginPath();
          for (var gi = 0; gi < GLOWB.length; gi += 4) { g.moveTo(GLOWB[gi], GLOWB[gi + 1]); g.lineTo(GLOWB[gi + 2], GLOWB[gi + 3]); }
          g.stroke();
        }
        for (var cc = 0; cc < 6; cc++) for (var aa = 0; aa < 6; aa++) for (var ww = 0; ww < 3; ww++) {
          var L = BUCK[(cc * 6 + aa) * 3 + ww]; if (!L.length) continue;
          g.strokeStyle = BC[cc]; g.globalAlpha = BA[aa]; g.lineWidth = BWD[ww]; g.beginPath();
          for (var li = 0; li < L.length; li += 4) { g.moveTo(L[li], L[li + 1]); g.lineTo(L[li + 2], L[li + 3]); }
          g.stroke();
        }
      }

      // mist rising at the foot of the waterfall
      if (flL > 0.01) {
        for (var m = 0; m < MIST.length; m++) {
          var mm = MIST[m], tt = t - T_FALL;
          var mx = mm.x + mm.vx * tt + 30 * Math.sin(mm.ph + tt * 0.35), my = mm.y + mm.vy * tt;
          glowDisc(g, mx, my, mm.r * (1 + 0.04 * tt), 'rgba(140,170,225,', 0.075 * Math.min(1.2, flL) * (0.7 + 0.4 * en) * endF);
        }
      }

      // readable words in the waterfall
      g.globalCompositeOperation = 'source-over';
      for (var wi = 0; wi < FW.length; wi++) {
        var fwd = FW[wi], wa = t - fwd.ts; if (wa < 0 || wa > fwd.life) continue;
        var wp = fwPose(fwd, wa, WP), wx = wp.x, wy = wp.y, wr = wp.r, walpha = seg(wa, 0, 0.2), wk = 0;
        if (wp.d >= 0) { walpha *= Math.exp(-wp.d / 1.7) * (1 - seg(wy, 960, 1090)); wk = seg(wp.d, 0.25, 1.6); }
        walpha *= endF * Math.min(1.15, gain);
        if (walpha < 0.01) continue;
        g.save(); g.translate(wx, wy); g.rotate(wr);
        if (wk < 1) { g.globalAlpha = Math.min(1, walpha * (1 - wk)); g.drawImage(fwd.ice.c, -fwd.ice.w / 2, -fwd.ice.h / 2, fwd.ice.w, fwd.ice.h); }
        if (wk > 0) { g.globalAlpha = Math.min(1, walpha * wk); g.drawImage(fwd.grey.c, -fwd.grey.w / 2, -fwd.grey.h / 2, fwd.grey.w, fwd.grey.h); }
        g.restore();
      }
      g.globalCompositeOperation = 'lighter';

      // shatter grains of the dropped letters
      for (var lk = 0; lk < 8; lk++) {
        var t0 = TD[lk] + FALL_D, gt = t - t0; if (gt < 0 || gt > 1.6) continue;
        var ds = DROPST[lk], ca = Math.cos(ds.sa), sa = Math.sin(ds.sa), gr = GRAIN[lk];
        for (var gq = 0; gq < gr.length; gq++) {
          var G = gr[gq]; if (gt > G.life) continue;
          var ox = ds.sx + ca * G.x - sa * G.y, oy = ds.sy + sa * G.x + ca * G.y;
          var px = ox + (G.vx + ds.svx) * gt, py = oy + (G.vy + ds.svy) * gt + 0.5 * G.g * gt * gt;
          var ga = (1 - gt / G.life), gk = seg(gt, 0.1, 0.8);
          g.globalAlpha = Math.min(1, 0.9 * ga);
          g.fillStyle = gk < 0.5 ? '#dfe9ff' : '#7d8fb3';
          g.beginPath(); g.arc(px, py, G.r * (1 - 0.3 * gk), 0, 6.2832); g.fill();
        }
        if (gt < 0.25) { glowDisc(g, ds.sx, ds.sy - 22, 46, 'rgba(170,205,255,', 0.35 * (1 - gt / 0.25)); }
      }

      // marker rings when the dot passes
      for (var mk = 0; mk < 4; mk++) {
        var rt = t - T_M[mk];
        if (rt > 0 && rt < 0.8) {
          var rr = 9 + 48 * eExpo(rt / 0.8);
          g.globalAlpha = 0.8 * Math.pow(1 - rt / 0.8, 1.5); g.strokeStyle = '#dfe9ff'; g.lineWidth = 2 * (1 - rt / 0.8) + 0.6;
          g.beginPath(); g.arc(MK[mk].x, MK[mk].y, rr, 0, 6.2832); g.stroke();
          glowDisc(g, MK[mk].x, MK[mk].y, 40, 'rgba(190,215,255,', 0.5 * (1 - rt / 0.8));
        }
      }
      g.globalAlpha = 1;

      // the motif dot
      if (t < T_FOLD_END + 0.5) {
        var dpos = dotPos(t), db = dotBright(t), dc = dotCool(t);
        var haloRGB = 'rgba(' + Math.round(lerp(58, 169, dc)) + ',' + Math.round(lerp(74, 200, dc)) + ',' + Math.round(lerp(107, 255, dc)) + ',';
        // comet tail while moving
        var prev = dotPos(t - 1 / 30), mv = Math.hypot(dpos[0] - prev[0], dpos[1] - prev[1]);
        if (mv > 1.5) {
          var prevP = dpos; g.lineCap = 'round';
          for (var ti = 1; ti <= 18; ti++) {
            var pp = dotPos(t - ti * 0.012), fr = 1 - ti / 19;
            g.strokeStyle = haloRGB + (0.5 * Math.min(db, 1.3) * fr).toFixed(4) + ')'; g.lineWidth = DOT_R * 2.1 * fr + 0.4;
            g.beginPath(); g.moveTo(prevP[0], prevP[1]); g.lineTo(pp[0], pp[1]); g.stroke(); prevP = pp;
          }
        }
        glowDisc(g, dpos[0], dpos[1], 150 * (0.75 + 0.3 * db), haloRGB, 0.08 * Math.min(db, 1.6) * (0.85 + 0.3 * en));
        glowDisc(g, dpos[0], dpos[1], 40 * (0.8 + 0.3 * db), haloRGB, 0.4 * Math.min(db, 1.6) + 0.1);
        glowDisc(g, dpos[0], dpos[1], DOT_R * 3, 'rgba(225,238,255,', 0.75 * Math.min(db, 1.3) * (0.4 + 0.6 * dc));
        g.globalCompositeOperation = 'source-over';
        g.globalAlpha = clamp(0.5 + 0.6 * db, 0, 1);
        var core = mixHex('#7d8fb3', '#f6faff', dc);
        g.fillStyle = core; g.beginPath(); g.arc(dpos[0], dpos[1], DOT_R, 0, 6.2832); g.fill();
        g.globalAlpha = 1; g.globalCompositeOperation = 'lighter';
        var fl2 = 0.06 * dc;
        for (var mi2 = 0; mi2 < 4; mi2++) fl2 += 0.7 * pulse(t - T_M[mi2], 0.01, 0.3);
        fl2 += 0.6 * pulse(t - T_SLIDE, 0.01, 0.3);
        streak(g, dpos[0], dpos[1], 320 * (0.6 + 0.6 * Math.min(1, fl2)), fl2);
      }

      // glint up the finished stair outline (hand-off to s04)
      var gp = seg(t, 17.2, 17.78, eP2io);
      if (gp > 0 && gp < 1) {
        var gx = gp * 8, gs = Math.min(7, Math.floor(gx)), gf = gx - gs;
        var gxx = lerp(ZV[gs][0], ZV[gs + 1][0], gf), gyy = lerp(ZV[gs][1], ZV[gs + 1][1], gf);
        spark(g, gxx, gyy, 0.8 * Math.sin(Math.PI * gp), 0.9);
      }
      g.restore();

      drawLearner(g, t, c);
      // foreground bokeh (depth 1.4)
      g.globalCompositeOperation = 'lighter';
      var cb = camD(c, 1.4);
      var envB = seg(t, 0, 1.0) * (1 - seg(t, 16.2, 17.4));
      for (var bo = 0; bo < BOK.length; bo++) {
        var B = BOK[bo];
        var bx = cb.tx + cb.z * (B.x + 16 * Math.sin(B.ph + t * 0.2)), by = cb.ty + cb.z * (B.y + 12 * Math.cos(B.ph + t * 0.17));
        var ba = B.a * envB * (0.75 + 0.5 * en) * (1 + 0.8 * lift);
        var bg2 = g.createRadialGradient(bx, by, 0, bx, by, B.r);
        bg2.addColorStop(0, 'rgba(127,166,224,' + (ba * 0.7).toFixed(4) + ')'); bg2.addColorStop(0.7, 'rgba(127,166,224,' + (ba * 0.8).toFixed(4) + ')');
        bg2.addColorStop(1, 'rgba(127,166,224,0)');
        g.fillStyle = bg2; g.beginPath(); g.arc(bx, by, B.r, 0, 6.2832); g.fill();
      }
      // bass lift: a cold bloom over the waterfall side (bar 16 and every strong hit) and a breath on 不是你笨。
      var la = 0.11 * lift + 0.05 * pulse(t - T_NOT, 0.02, 0.35);
      if (la > 0.002) {
        g.save(); g.translate(500, 560); g.scale(1.15, 1.35);
        var lgr = g.createRadialGradient(0, 0, 0, 0, 0, 900);
        lgr.addColorStop(0, 'rgba(190,215,255,' + (0.55 * la).toFixed(4) + ')'); lgr.addColorStop(0.45, 'rgba(150,185,255,' + (0.18 * la).toFixed(4) + ')'); lgr.addColorStop(1, 'rgba(150,185,255,0)');
        g.fillStyle = lgr; g.fillRect(-900, -900, 1800, 1800); g.restore();
      }
      // shockwave from 不是你笨。 (screen space, the HUD does not move)
      var nt = t - T_NOT;
      if (nt > 0 && nt < 1.0) {
        var nr = 60 + 760 * eExpo(nt / 1.0), na = Math.pow(1 - nt, 1.6);
        g.save(); g.translate(960, 176); g.scale(1, 0.5);
        g.strokeStyle = 'rgba(200,222,255,' + (0.26 * na).toFixed(4) + ')'; g.lineWidth = 2; g.beginPath(); g.arc(0, 0, nr, 0, 6.2832); g.stroke();
        g.strokeStyle = 'rgba(140,180,255,' + (0.09 * na).toFixed(4) + ')'; g.lineWidth = 34; g.beginPath(); g.arc(0, 0, nr, 0, 6.2832); g.stroke();
        g.restore();
      }
      g.globalCompositeOperation = 'source-over';
    }

    return ready;
  });
})();
