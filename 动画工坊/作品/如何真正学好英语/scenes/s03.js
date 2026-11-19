/* s03  The city forgets (global 22.467 to 35.592 s, 13.125 s, bars 13 to 19: G G F F G G Am; intro_a into intro_b).
 * Signature shot 1: 熄灯之城 and 遗忘瀑布. One bar = 1.875 s = 3 beats of 0.625 s. Local times below.
 *
 * Bar 13 (0.000, the high layer enters): the lights go out from left to right, one big swath per beat. The first swath
 *   is the hand-off itself: a dark front sweeps s02's fully lit city away (power2.out, fast then slower, like the
 *   curve). Dead windows release their letters as ash; 14 hero words pop out of their windows and crumble letter by
 *   letter. At 0.3125 the word "evidence" lights up around the motif dot in s02's 考研 window (the dot is the tittle
 *   of its ı) and flies right to left over the darkening city, letters trailing like a flock, against the darkness.
 * Bar 14 (1.875): the word lands on the roof of building 0 (刚学完) on the downbeat; only one or two windows flicker
 *   out per beat; what is left lit, from the ground up, already is the forgetting curve (28 buildings on a log time
 *   axis, lit up to R(t) of Ebbinghaus 1885, a smooth fit through his savings data, replicated by Murre & Dros 2015).
 * 3.750 (bar 15, intro_b, hit): a spark drops from the dot to the origin and an ice-white line is drawn along the
 *   tops of the lit stacks (two beats, power4.inOut); axes draw; buildings fall back to 15 %. 4.0625 title, labels and
 *   source come in. 4.375: "forgetting curve" decodes; the letters tip over the edge and ride the curve as a train.
 * Markers (hollow 18 px circles on the real data points 20 min, 1 h, 8.8 h, 31 d) land on 5.000, 5.625, 6.250 and
 *   7.500. At the first three two letters are flung off each (fall 20 px, shatter into 40 grains of their own
 *   glyph), at the fourth the last one; only ı and its dot are left, the dot dimmed from 100 % to 30 % and cooled
 *   from ice white to grey blue. The curve flattens but never reaches zero.
 * 5.000 the first strand of words spills over the lip; 5.625 (bar 16, loudest bar of the intro) the waterfall
 *   pours: thousands of grains and ~30 readable real 考研 words flow down the curve; the share that leaves the curve
 *   at each point is the drop of R there, so almost all of it spills off the cliff into the abyss. Flux x energy.
 *   The camera pans down 60 px and pushes in to 1.08 on the cliff. 7.500 (G, the music falls back): the fall hits
 *   the bottom, mist rises, the stream thins. 8.45 to 8.9 the title group leaves (up, fade, 6 px blur) and the ı
 *   draws itself up into its dot, which settles on the end of the line at 30 %.
 * 9.375 (bar 18): "不是你笨。" slams in on one beat and holds, the waterfall still trickles.
 * 11.250 (bar 19, Am, hit): the tail of the curve swings up around x = 1120 (back.inOut: a small dip first, a small
 *   overshoot last) and folds into a 4-step zigzag stair outline, everything else fades, the background turns to the
 *   navy of s04, and the camera returns to identity; a glint runs up the finished stair.
 *
 * Techniques: 4 data visualisation (city = chart, curve through real data points, no numbers), 3 DrawSVG (curve,
 *   axes) and motion along paths (word flight, text-on-path train, flow particles), 5 particles and generative art
 *   (waterfall of ~4600 grains and ~30 readable words, ash, shatter, mist, bokeh), 8 text effects (flock flight,
 *   per-letter train, crumbling hero words, ScrambleText kicker, blur rise, slam with chroma), 2 shape morph (tail to
 *   stair zigzag), 1 vector character (faceless learner, head lamp 40 % to 30 %), 11 light (window glow, source glow,
 *   cold blooms on the hits, abyss gradient, top haze, chroma kick, shockwave), 6 2.5D camera with parallax (far city
 *   0.45, bokeh 1.4), 13 music (energy drives flux, window glow, dot halo, bokeh; every move sits on a beat).
 *
 * HANDOFF in (from s02, its last frame held; custom wipe, align 'after', one beat): s02 leaves the motif dot at
 *   screen (1705, 361) (core about 3.4 px, halo about 30 px) and the learner at screen (502, 984), scale 0.958, lamp
 *   40 %. The camera here starts at identity, so both are drawn exactly there on frame 0.
 * HANDOFF to s04 (cut, global 35.592 s). Last frame, camera at identity (screen = layout coordinates):
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
      eExpo = E('expo.out'), eFold = E('back.inOut(1.2)');
    function seg(t, a, b, ease) { var x = clamp((t - a) / (b - a), 0, 1); return ease ? ease(x) : x; }
    function pulse(x, rise, decay) { return x < 0 ? 0 : (1 - Math.exp(-x / rise)) * Math.exp(-x / decay); }
    function TX(s, a, b) { for (var i = 0; i < ctx.texts.length; i++) if (ctx.texts[i].text === s) return ctx.texts[i]; return { in: a, out: b }; }
    function hsh(i, s) { return u.hash(i, 's03' + s); }
    function mixHex(a, b, k) {
      var x = parseInt(a.slice(1), 16), y = parseInt(b.slice(1), 16);
      var r = Math.round(lerp(x >> 16, y >> 16, k)), g = Math.round(lerp((x >> 8) & 255, (y >> 8) & 255, k)), bl = Math.round(lerp(x & 255, y & 255, k));
      return 'rgb(' + r + ',' + g + ',' + bl + ')';
    }

    // ---------------- timing (local s, from the music grid: beat 0.625, bar 1.875) ----------------
    var BEAT = [];
    for (var bk = 0; bk < 24; bk++) BEAT.push(u.beat(bk));
    var tx = {
      ev: TX('evidence', 0.3125, 8.9), head: TX('不复习，新学的东西会很快忘掉，', 4.0625, 8.9), sub: TX('而且一开始，忘得最快。', 5.0, 8.9),
      yl: TX('记得的', 4.0625, 12.9), xl: TX('时间', 4.0625, 12.9), kick: TX('forgetting curve', 4.375, 8.9),
      src: TX('Ebbinghaus, 1885 · Murre & Dros, 2015', 4.0625, 12.9), not: TX('不是你笨。', 9.375, 12.9)
    };
    var T_EV_IN = tx.ev.in;            // 0.3125 the word lights up around the dot
    var T_LIFT = T_EV_IN + 0.2;        // 0.5125 it lifts off
    var T_DOCK = BEAT[3];              // 1.875  bar 14: lands on the roof of building 0
    var T_DRAW = BEAT[6];              // 3.750  bar 15 (intro_b, hit): curve and axes draw
    var T_DRAW_D = 2 * (BEAT[1] - BEAT[0]);   // two beats
    var T_SLIDE = BEAT[7];             // 4.375  the train starts
    var T_M = [BEAT[8], BEAT[9], BEAT[10], BEAT[12]];   // 5.000 5.625 6.250 7.500 markers
    var T_TRICKLE = BEAT[8];           // 5.000  first strand over the lip
    var T_FALL = BEAT[9];              // 5.625  bar 16: the waterfall pours
    var T_SETTLE = BEAT[12];           // 7.500  bar 17 (G): it hits the bottom, mist, thinning
    var T_OUT = tx.head.out;           // 8.900  title group gone
    var T_RET0 = T_OUT - 0.45, T_RET1 = T_OUT - 0.05;   // the ı draws itself up into its dot
    var T_NOT = BEAT[15];              // 9.375  bar 18: 不是你笨。
    var T_FOLD = BEAT[18];             // 11.250 bar 19 (Am, hit): the tail folds into the stair
    var T_FOLD_END = T_FOLD + 1.65;    // 12.900 settled

    // music: energy normalised to this section's range (0.18 to 0.34), and the structural hits (3.75, 7.5, 11.25)
    function eN(t) { return clamp((u.energy(t, 0.25) - 0.18) / 0.16, 0, 1); }
    var HITS = (u.hits || []).filter(function (h) { return h > 0.5 && h < D - 0.1; });
    if (!HITS.length) HITS = [T_DRAW, T_SETTLE, T_FOLD];
    function hitP(t, dec) { var v = 0; for (var i = 0; i < HITS.length; i++) { var x = t - HITS[i]; if (x >= -0.02) v = Math.max(v, pulse(x + 0.02, 0.02, dec)); } return v; }
    function liftAt(t) { return pulse(t - T_FALL + 0.02, 0.05, 1.3) + 0.45 * hitP(t, 0.5); }

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
    var U_MK = [0.10593, 0.20121, 0.44801, 1.0];          // 20 min, 1 h, 8.8 h, 31 d on this axis
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
    // identity on frame 0 (hand-off), a slow 1.2 % drift in while the lights go out, then on bar 16 a pan down 60 px and
    // a push to 1.08 on the cliff; back to identity during the fold so the last frame matches s04 exactly.
    var O = { x: 520, y: 640 };
    var camN = u.makeNoise('s03cam');
    function camAt(t) {
      var kp = eSine(seg(t, T_FALL, T_FALL + 2.6)), back = 1 - eP2io(seg(t, T_FOLD, T_FOLD + 1.55));
      var z = 1 + lerp(0.012 * eSine(seg(t, 0, T_FALL)), 0.08, kp) * back, pan = 60 * kp * back;
      var sh = t >= T_NOT ? 3.2 * Math.exp(-(t - T_NOT) / 0.16) : 0;
      return { z: z, tx: O.x * (1 - z) + sh * camN.noise2(t * 13, 0.3), ty: O.y * (1 - z) - pan + sh * camN.noise2(0.7, t * 13) };
    }
    function camD(c, d) { var z = 1 + (c.z - 1) * d; return { z: z, tx: O.x * (1 - z) + (c.tx - O.x * (1 - c.z)) * d, ty: O.y * (1 - z) + (c.ty - O.y * (1 - c.z)) * d }; }

    // ---------------- the lights-out front: the first swath is the hand-off wipe itself ----------------
    var WIPE_D = BEAT[1] - BEAT[0], WIPE_W = 2600;
    function wipeX(tt) { return -340 + WIPE_W * eP2o(clamp(tt / WIPE_D, 0, 1)); }
    function frontTime(x) { var p = clamp((x + 340) / WIPE_W, 0, 1); return WIPE_D * (1 - Math.sqrt(1 - p)); }   // inverse of power2.out
    ctx.transitionIn({ type: 'custom', duration: WIPE_D, align: 'after', ease: 'none', fn: function (p, i) {
      if (!i.out) return;
      var X = wipeX(p * WIPE_D), m = 'linear-gradient(90deg, rgba(0,0,0,0) ' + (X - 340).toFixed(1) + 'px, rgba(0,0,0,1) ' + X.toFixed(1) + 'px)';
      i.out.style.webkitMaskImage = m; i.out.style.maskImage = m;
    } });

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
      var roof = RB.int(0, 4);
      if (bi === 0) { top = cyMin - 6; roof = 0; }   // 刚学完: lit to the roof; the word lands just above it
      var bl = { i: bi, x0: c0 - 11, x1: c0 + 31, top: top, roof: roof, dark: [], lit: 0 };
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
        bl.dark.push(colWins.filter(function (q) { return !q.keep; }).reverse());   // dark-destined, top first
      }
    }
    var EVW = null;   // the evidence window: the topmost lit window of building 0, left column (never goes out)
    wins.forEach(function (q) { if (q.b === 0 && q.c === 0 && q.keep && (!EVW || q.y < EVW.y)) EVW = q; });
    EVW.b0 = 1.25; EVW.ci = 3;

    // lights-out: 3 big swaths on the beats of bar 13 (top down in every column, so the lit level sinks to the curve),
    // then in bar 14 only a few windows per beat flicker out
    var FC = [0.46, 0.76, 0.93, 0.965, 0.99, 1.0], NWAVE = FC.length, NBIG = 3;
    var RW = u.rand('s03-waves');
    blds.forEach(function (b) {
      b.dark.forEach(function (list) {
        var n = list.length;
        list.forEach(function (q, j) {
          var kb = 0; while (kb < NWAVE - 1 && j >= Math.round(FC[kb] * n)) kb++;
          q.beat = kb;
          if (kb === 0) { q.kind = 1; q.off = Math.max(0, frontTime(q.x) + RW.range(-0.02, 0.05)); }
          else if (kb < NBIG) { q.kind = 1; q.off = BEAT[kb] + 0.8 * frontTime(q.x) + RW.range(0, 0.035); }
          else { q.kind = 2; q.off = BEAT[kb] + RW.range(0.0, 0.5); q.fk = RW.range(0.75, 1.3); }
          if (RW() < 0.6) q.ash = { ch: String.fromCharCode(97 + RW.int(0, 25)), sz: RW.range(10, 15), vx: RW.range(-14, 14), vy: RW.range(12, 40), g: RW.range(40, 90), w: RW.range(-3, 3), r0: RW.range(-0.5, 0.5), life: RW.range(1.2, 2.0), sway: RW.range(3, 9), ph: RW() * 6.28 };
        });
      });
    });
    function darkProg(t) { var v = 0, prev = 0; for (var i = 0; i < NWAVE; i++) { v += (FC[i] - prev) * seg(t, BEAT[i], BEAT[i] + (i < NBIG ? 0.5 : 0.6), eP2o); prev = FC[i]; } return v; }

    // hero words: 4 per beat in bar 13 (spread over the width, below the word's flight), 2 more in bar 14 (mid, clear of the landed word)
    var RH = u.rand('s03-hero'), HERO = [];
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
    var BANDS = [[330, 640], [660, 1010], [1030, 1390], [1410, 1750]];
    var HTY = [[340, 420, 420, 580], [440, 340, 520, 600], [380, 460, 430, 560]];
    for (var hb = 0; hb < NBIG; hb++) for (var bb = 0; bb < 4; bb++) {
      var hq = pickHero(hb, BANDS[bb][0], BANDS[bb][1], HTY[hb][bb]);
      if (hq) { hq.hero = HERO.length; HERO.push({ w: hq, word: heroWords[HERO.length] }); }
    }
    [[3, 2, 540], [4, 1, 520]].forEach(function (s) { var q = pickHero(s[0], BANDS[s[1]][0], BANDS[s[1]][1], s[2]); if (q) { q.hero = HERO.length; HERO.push({ w: q, word: heroWords[HERO.length] }); } });

    // far skyline (depth 0.45), only lit until the swaths pass
    var RF = u.rand('s03-far'), far = [], farWins = [], FAR_LAST = 0;
    for (var fx = -60; fx < 1990;) {
      var fw = RF.range(30, 70), fh = RF.range(90, 330), ft = GY - 20 - fh;
      far.push({ x: fx, w: fw, top: ft });
      for (var wx = fx + 5; wx < fx + fw - 6; wx += 9) for (var wy2 = ft + 8; wy2 < GY - 26; wy2 += 11) {
        if (RF() < 0.42) continue;
        var kbf = RF() < 0.9 ? (RF() < 0.5 ? 0 : RF() < 0.6 ? 1 : 2) : 3 + RF.int(0, 2);
        var off = kbf === 0 ? Math.max(0, frontTime(wx) + RF.range(-0.02, 0.06)) : kbf < NBIG ? BEAT[kbf] + 0.8 * frontTime(wx) + RF.range(0, 0.05) : BEAT[kbf] + RF.range(0, 0.5);
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
    var ASH = { ice: {}, grey: {} };
    for (var ac = 0; ac < 26; ac++) {
      var ch = String.fromCharCode(97 + ac);
      ASH.ice[ch] = textSprite(ch, 'italic 400 30px "Source Serif 4 Display"', 30, '#cfe0fb', 'rgba(150,190,255,0.7)', 4);
      ASH.grey[ch] = textSprite(ch, 'italic 400 30px "Source Serif 4 Display"', 30, '#5d6f95', 'rgba(0,0,0,0)', 0);
    }
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
    u.el('div', { cls: 'fill', parent: root, style: { background: 'linear-gradient(180deg, #0c1428 0%, #090e1c 42%, #070b16 68%, #05080f 100%)' } });
    var cityGlow = u.el('div', { cls: 'fill', parent: root, style: { background: 'radial-gradient(ellipse 72% 42% at 52% 78%, rgba(90,130,210,0.30) 0%, rgba(70,110,190,0.12) 45%, rgba(60,100,180,0) 75%)' } });
    var coldTop = u.el('div', { cls: 'fill', parent: root, style: { background: 'radial-gradient(ellipse 46% 52% at 12% 0%, rgba(150,180,240,0.10) 0%, rgba(150,180,240,0) 70%)', opacity: 0 } });
    var abyss = u.el('div', { cls: 'fill', parent: root, style: { background: 'linear-gradient(180deg, rgba(3,5,10,0) 58%, rgba(3,5,10,0.55) 80%, rgba(2,3,7,0.9) 100%)', opacity: 0 } });
    var navy = u.el('div', { cls: 'fill', parent: root, style: { background: 'radial-gradient(ellipse 75% 70% at 60% 45%, #121c36 0%, #0c1428 60%, #0a1122 100%)', opacity: 0 } });

    u.canvas(root, drawBack);
    var planeU = u.el('div', { cls: 'fill', parent: root, style: { transformOrigin: '0 0' } });
    u.canvas(root, drawFx);
    var planeO = u.el('div', { cls: 'fill', parent: root, style: { transformOrigin: '0 0' } });
    var hud = u.el('div', { cls: 'fill', parent: root });
    // the dark band that rides just behind the wipe front during the hand-off (top of this scene)
    var band = u.el('div', { cls: 'fill', parent: root, style: { display: 'none' } });

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
    // the draw head passes marker k when eP4io(p) * CL = S_M[k]: solve for p, pop the marker there
    function invEase(ease, y) { var lo = 0, hi = 1; for (var i = 0; i < 40; i++) { var m = (lo + hi) / 2; if (ease(m) < y) lo = m; else hi = m; } return (lo + hi) / 2; }
    MK.forEach(function (m, i) {
      var tk = T_DRAW + T_DRAW_D * invEase(eP4io, S_M[i] / CL);
      tl.fromTo(m.g, { scale: 0, svgOrigin: m.x + ' ' + m.y }, { scale: 1, duration: 0.35, ease: 'back.out(2.4)' }, tk - 0.02);
      tl.fromTo(mkFill[i], { opacity: 0.95 }, { opacity: 0, duration: 0.7, ease: 'power2.out' }, T_M[i]);
      tl.to(mkRing[i], { opacity: 1, stroke: '#ffffff', duration: 0.2 }, T_M[i]);
    });
    tl.to(mkG, { opacity: 0, duration: 0.45, ease: 'power2.in' }, T_FOLD + 0.15);

    // fold phase: head part (static d) and tail part (d rebuilt every frame)
    var U_P = (1120 - PX0) / (PX1 - PX0), S_P = sAtU(U_P), PIV = atS(S_P, {});
    var ZV = [[1120, 687]];   // s04's exact integer vertices (the pivot itself is 0.3 px higher), so the cut is pixel-identical
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
    var FOLD_LAG = 0.5, FOLD_DUR = T_FOLD_END - T_FOLD - FOLD_LAG;   // the tip starts first; every point lands by 12.9
    function foldPts(t) {
      for (var i = 0; i <= NZ; i++) {
        var f = i / NZ, st = T_FOLD + FOLD_LAG * (1 - f);
        if (t <= st) { FOLD_P[i][0] = TP[i][0]; FOLD_P[i][1] = TP[i][1]; continue; }
        var e = eFold(seg(t, st, st + FOLD_DUR));   // back.inOut: dips a little first, overshoots a little, settles
        var a = lerp(TPol[i][0], ZPol[i][0], e), rr = lerp(TPol[i][1], ZPol[i][1], e);
        FOLD_P[i][0] = PIV.x + Math.cos(a) * rr; FOLD_P[i][1] = PIV.y + Math.sin(a) * rr;
      }
      return FOLD_P;
    }
    tl.set(curveG, { opacity: 0 }, T_FOLD);
    tl.set(foldG, { opacity: 1 }, T_FOLD);
    tl.fromTo(headP, { drawSVG: '0% 100%' }, { drawSVG: '100% 100%', duration: 1.25, ease: 'power2.inOut' }, T_FOLD + 0.1);
    tl.to(headP, { opacity: 0, duration: 0.5, ease: 'power1.in' }, T_FOLD + 0.85);
    // the final outline: s04 style, ice white 3 px, softer glow
    tl.to(tailP[0], { opacity: 0, duration: 0.4 }, T_FOLD + 1.4);
    tl.to(tailP[1], { opacity: 0.12, duration: 0.4 }, T_FOLD + 1.4);
    tl.to(tailP[2], { attr: { 'stroke-width': 3 }, duration: 0.4 }, T_FOLD + 1.4);

    // axes: draw with the curve on bar 15, retract during the fold
    tl.to([yAxis, xAxis], { drawSVG: '0% 100%', duration: 1.0, ease: 'power3.inOut' }, T_DRAW);
    tl.to([yArrow, xArrow], { opacity: 0.75, duration: 0.3 }, T_DRAW + 0.85);
    // they leave together with their labels (记得的 / 时间 hold to 12.9), so no label is ever left without its axis
    tl.to([yAxis, xAxis], { drawSVG: '100% 100%', duration: 0.8, ease: 'power2.in' }, tx.yl.out - 0.85);
    tl.to([yArrow, xArrow], { opacity: 0, duration: 0.3 }, tx.yl.out - 0.85);
    tl.to(curveP, { drawSVG: '0% 100%', duration: T_DRAW_D, ease: 'power4.inOut' }, T_DRAW);

    // the chart SVG gets its camera inside the SVG (repainted at full resolution every frame, no raster reuse)
    var camG = u.svgEl('g', {}, svgU);
    Array.prototype.slice.call(svgU.childNodes).forEach(function (n) { if (n !== camG) camG.appendChild(n); });

    // ---------------- labels in the plane (move with the chart) ----------------
    var yl = u.text(planeO, '记得的', 'small', { x: AXX - 22, y: 300, anchor: 'right', style: { fontSize: '44px', color: '#a9bad8' } });
    var xl = u.text(planeO, '时间', 'small', { x: 1756, y: 930, anchor: 'right', style: { fontSize: '44px', color: '#a9bad8' } });
    gsap.set([yl, xl], { opacity: 0 });
    tl.fromTo(yl, { opacity: 0, y: 14 }, { opacity: 0.95, y: 0, duration: 0.6, ease: 'power3.out' }, tx.yl.in);
    tl.fromTo(xl, { opacity: 0, x: -18 }, { opacity: 0.95, x: 0, duration: 0.7, ease: 'power3.out' }, tx.xl.in);
    tl.to(yl, { opacity: 0, duration: 0.4, ease: 'power2.in' }, tx.yl.out - 0.4);
    tl.to(xl, { opacity: 0, duration: 0.4, ease: 'power2.in' }, tx.xl.out - 0.4);

    // ---------------- the learner: s02's figure exactly (feet at screen (502, 984), scale 0.958), then he walks on the
    // beats to stand under the cliff and looks up at the word. Drawn on the fx canvas, a pure function of t. ----------------
    var LS = 0.958, L_X0 = 502, L_X1 = 196, L_Y = 984, T_W0 = BEAT[1], T_W1 = BEAT[5];
    var STRIDE = (L_X0 - L_X1) / Math.round((T_W1 - T_W0) / (BEAT[1] - BEAT[0]) * 2);   // 8 steps in 4 beats: 38.25 px
    function learnerFade(t) { return 1 - seg(t, T_FOLD + 0.2, T_FOLD + 1.2, eP2i); }
    function learnerX(t) { return lerp(L_X0, L_X1, seg(t, T_W0, T_W1)); }
    function drawLearner(g, t, c) {
      var kf = learnerFade(t); if (kf <= 0.002) return;
      var dp = darkProg(t), hb = (0.4 - 0.1 * dp) * (1 + 0.12 * eN(t));
      var dist = L_X0 - learnerX(t), ph = Math.PI * dist / STRIDE, walking = t > T_W0 && t < T_W1;   // a footfall on every beat and half beat
      var up = 0.5 * seg(t, T_DOCK - 0.6, T_DOCK + 0.5, eSine) + 0.5 * seg(t, T_DRAW - 0.4, T_DRAW + 0.8, eSine) + 0.6 * seg(t, T_FALL, T_FALL + 1.2, eSine);
      var br = Math.sin(t * 1.7) * 1.1 * (walking ? 0 : 1), bob = walking ? -2.5 * Math.abs(Math.sin(ph)) : 0;
      var hx = 8 - 4 * up, hy = -240 + br * 0.6 - 6 * up + bob;
      g.save(); g.translate(c.tx, c.ty); g.scale(c.z, c.z); g.translate(learnerX(t), L_Y); g.scale(LS, LS);
      g.globalCompositeOperation = 'source-over'; g.globalAlpha = kf;
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
      // legs: s02's standing pose at rest; a walk cycle tied to the distance (feet do not slide), heading left
      var f0 = -18, f1 = 15, l0 = 0, l1 = 0;
      if (walking) {
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
      g.globalCompositeOperation = 'lighter';   // head lamp (as in s02), 40 % down to 30 %
      glowDisc(g, hx, hy, 92, 'rgba(127,166,224,', 0.30 * hb * kf); glowDisc(g, hx, hy, 34, 'rgba(190,215,255,', 0.32 * hb * kf);
      g.restore();
    }

    // ---------------- "evıdence": flies in as a flock, lands on the roof, then rides the curve as a train. The motif dot
    // is the tittle of the ı. ----------------
    var EV_PX = 64, EV_FONT = 'italic 400 64px "Source Serif 4 Display"';
    var LET = ['e', 'v', 'ı', 'd', 'e', 'n', 'c', 'e'], IDX_I = 2;
    mctx.font = EV_FONT;
    var LW = LET.map(function (c) { return mctx.measureText(c).width; });
    var CEN = [], accw = 0;
    LET.forEach(function (c, i) { CEN.push(accw + LW[i] / 2); accw += LW[i]; });
    var OFF = CEN.map(function (c) { return c - CEN[IDX_I]; });
    var TOFF = { x: 6, y: -44 }, DOT_R = 4.4;   // measured below: the tittle relative to the ı's baseline centre
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
    var CLIP0 = clamp((EV_PX - BASE) / EV_PX, 0, 1), CLIP1 = clamp((EV_PX - BASE + 0.5 * EV_PX) / EV_PX, 0, 1);   // from the baseline to above the x-height
    var letEls = LET.map(function (c) {
      return u.el('span', { cls: 'ch t-en', text: c, parent: train, style: {
        position: 'absolute', left: (-EV_PX / 2) + 'px', top: (-BASE).toFixed(2) + 'px', width: EV_PX + 'px', textAlign: 'center', fontSize: EV_PX + 'px', lineHeight: EV_PX + 'px',
        letterSpacing: '0', color: '#eaf1ff', transformOrigin: (EV_PX / 2) + 'px ' + BASE.toFixed(2) + 'px', opacity: 0, whiteSpace: 'pre' } });
    });

    // flight of the tittle: from s02's 考研 window to the roof of building 0, an arc over the darkening city
    var P_S02 = { x: 1705, y: 361 }, DOCK = { x: 300, y: 190 };
    var FB = [[P_S02.x, P_S02.y], [1585, 170], [840, 66], [DOCK.x, DOCK.y]];
    function bez(s, out) {
      var a = 1 - s, b0 = a * a * a, b1 = 3 * a * a * s, b2 = 3 * a * s * s, b3 = s * s * s;
      out[0] = b0 * FB[0][0] + b1 * FB[1][0] + b2 * FB[2][0] + b3 * FB[3][0]; out[1] = b0 * FB[0][1] + b1 * FB[1][1] + b2 * FB[2][1] + b3 * FB[3][1]; return out;
    }
    function lagOf(k) { return 0.012 * (k - IDX_I); }   // letters left of the ı arrive a little early, the rest trail
    var FA = [0, 0], FB2 = [0, 0];
    function flightRef(k, t, out) {   // tittle reference of letter k before the slide: {x, y, a}
      var lg = lagOf(k), p = eP2io(seg(t, T_LIFT + lg, T_DOCK + lg));
      bez(p, FA); bez(eP2io(seg(t - 1 / 60, T_LIFT + lg, T_DOCK + lg)), FB2);
      var vy = (FA[1] - FB2[1]) * 60;
      out.v = Math.hypot(FA[0] - FB2[0], FA[1] - FB2[1]) * 60;
      out.x = FA[0]; out.y = FA[1];
      out.a = clamp(-vy / 2600, -0.13, 0.13) * (p > 0 && p < 1 ? 1 : 0);
      // landing: sinks 6 px on the downbeat and comes back; then a slow hover until the slide
      var land = 6 * pulse(t - T_DOCK - lg, 0.05, 0.22);
      var hov = 2.2 * Math.sin(6.2832 * (t - T_DOCK) / 2.5) * seg(t, T_DOCK + 0.3, T_DOCK + 1.0) * (1 - seg(t, T_SLIDE - 0.35, T_SLIDE));
      out.y += land + hov;
      return out;
    }

    // train motion: the ı's arc position. Plunge (power4.in) into marker 1, then step to markers 2, 3, 4 on the beats
    function sTr(t) {
      if (t <= T_SLIDE) return 0;
      if (t < T_M[0]) return S_M[0] * eP4i(seg(t, T_SLIDE, T_M[0]));
      if (t < T_M[1]) return lerp(S_M[0], S_M[1], eP3o(seg(t, T_M[0], T_M[1])));
      if (t < T_M[2]) return lerp(S_M[1], S_M[2], eP2io(seg(t, T_M[1], T_M[2])));
      if (t < T_M[3]) return lerp(S_M[2], S_M[3], eP2io(seg(t, T_M[2], T_M[3])));
      return CL;
    }
    // drop schedule: front pair at marker 1, the next pair at marker 2, d and the first e at marker 3, v at marker 4;
    // the ı never drops (it draws itself up into its dot at the end)
    var TD = [T_M[2] + 0.07, T_M[3], Infinity, T_M[2], T_M[1] + 0.07, T_M[1], T_M[0] + 0.07, T_M[0]];
    var FALL_D = 0.22, LIFT = 5;
    function onPath(k, t, out) {
      var q = atS(sTr(t) + OFF[k], Q), nx = Math.sin(q.a), ny = -Math.cos(q.a);
      out.x = q.x + nx * LIFT; out.y = q.y + ny * LIFT; out.a = q.a; return out;
    }
    var DROPST = LET.map(function (c, k) {   // state at the drop moment and at the shatter moment (pure, precomputed)
      if (!isFinite(TD[k])) return null;
      var p1 = onPath(k, TD[k], {}), p0 = onPath(k, TD[k] - 1 / 240, {});
      var vx = (p1.x - p0.x) * 240, vy = (p1.y - p0.y) * 240, spin = (hsh(k, 'spin') - 0.5) * 5;
      var st = { x: p1.x, y: p1.y, a: p1.a, vx: vx * 0.4, vy: vy * 0.4, spin: spin };
      var dt = FALL_D;
      st.sx = st.x + st.vx * dt; st.sy = st.y + st.vy * dt + 0.5 * 900 * dt * dt; st.sa = st.a + spin * dt;
      st.svx = st.vx * 0.3; st.svy = (st.vy + 900 * dt) * 0.2;
      return st;
    });
    var FR = { x: 0, y: 0, a: 0 };
    function dockPose(k, t, out) {   // before the slide: the word, horizontal (banking a little in flight)
      flightRef(k, t, FR);
      var ca = Math.cos(FR.a), sa = Math.sin(FR.a), dx = OFF[k] - TOFF.x, dy = -TOFF.y;
      out.x = FR.x + ca * dx - sa * dy; out.y = FR.y + sa * dx + ca * dy; out.a = FR.a;
      return out;
    }
    var DP = { x: 0, y: 0, a: 0 };
    function letterPose(k, t, out) {
      out.vis = false; out.op = 0; out.sc = 1; out.clip = 0; out.blur = 0;
      if (t < T_EV_IN) return out;
      if (t >= TD[k]) {
        if (t >= TD[k] + FALL_D + 0.06) return out;
        var d = DROPST[k], dt = t - TD[k];
        out.x = d.x + d.vx * dt; out.y = d.y + d.vy * dt + 0.5 * 900 * dt * dt; out.a = d.a + d.spin * dt;
        out.op = 1 - seg(t, TD[k] + FALL_D, TD[k] + FALL_D + 0.06); out.vis = out.op > 0.001; return out;
      }
      if (t < T_SLIDE) {
        dockPose(k, t, out);
        var ap = seg(t, T_EV_IN + 0.045 * Math.abs(k - IDX_I), T_EV_IN + 0.045 * Math.abs(k - IDX_I) + 0.32);   // forms from the ı outwards
        out.op = ap; out.sc = lerp(0.55, 1, eExpo(ap)); out.blur = 6 * (1 - ap) + Math.min(2.5, (FR.v || 0) / 1000); out.y += 10 * (1 - eExpo(ap));
        out.vis = out.op > 0.001; return out;
      }
      onPath(k, t, out);
      var dl = 0.035 * Math.abs(k - IDX_I), p = eExpo(seg(t, T_SLIDE + dl, T_SLIDE + dl + 0.55));   // tips over the edge
      dockPose(k, T_SLIDE, DP);
      out.x = lerp(DP.x, out.x, p); out.y = lerp(DP.y, out.y, p); out.a = lerp(DP.a, out.a, p);
      out.op = 1; out.vis = true;
      // the ı draws its stem up into the dot: clipped from the bottom (the box keeps its size, so QA reads it right)
      if (k === IDX_I && t > T_RET0) { var rr = seg(t, T_RET0, T_RET1); out.clip = eP2i(rr); out.op = 1 - seg(rr, 0.7, 1); out.vis = out.op > 0.001; }
      return out;
    }
    function nDropped(t) { var n = 0; for (var k = 0; k < 8; k++) if (t >= TD[k]) n++; return n; }

    // the motif dot
    var IPOSE = { x: 0, y: 0, a: 0, sc: 1 };
    function tittle(t) {
      letterPose(IDX_I, t, IPOSE);
      var ca = Math.cos(IPOSE.a), sa = Math.sin(IPOSE.a);
      return [IPOSE.x + ca * TOFF.x - sa * TOFF.y, IPOSE.y + sa * TOFF.x + ca * TOFF.y];
    }
    var DOT_AT_RET = null, REST = { x: CP[NS][0], y: CP[NS][1] - 3 };
    function dotPos(t) {
      if (t < T_EV_IN) return [P_S02.x, P_S02.y];
      if (t < T_SLIDE) { flightRef(IDX_I, t, FR); return [FR.x, FR.y]; }
      if (t < T_RET1) return tittle(t);
      if (!DOT_AT_RET) DOT_AT_RET = tittle(T_RET1 - 1e-4);
      if (t < T_FOLD) { var r = eSine(seg(t, T_RET1, T_RET1 + 0.7)); return [lerp(DOT_AT_RET[0], REST.x, r), lerp(DOT_AT_RET[1], REST.y, r)]; }
      var P = foldPts(t); return [P[NZ][0], P[NZ][1] - 3];
    }
    var LEVEL = [1.0, 0.82, 0.65, 0.48, 0.30];
    function dotBright(t) {
      var b = LEVEL[0];
      for (var i = 0; i < 4; i++) b += (LEVEL[i + 1] - LEVEL[i]) * seg(t, T_M[i], T_M[i] + 0.45, eP2o);
      for (i = 0; i < 4; i++) b += 0.7 * pulse(t - T_M[i], 0.012, 0.22);
      if (t < T_SLIDE) b += 0.08 * u.beatPulse(t, 0.3);
      b += 0.5 * pulse(t - T_EV_IN, 0.02, 0.35) + 0.45 * pulse(t - T_DOCK, 0.015, 0.3) + 0.5 * pulse(t - T_DRAW, 0.015, 0.3) + 0.4 * pulse(t - T_SLIDE, 0.02, 0.3);
      b += 0.14 * pulse(t - T_RET0 - 0.3, 0.05, 0.35);
      return b;
    }
    function dotCool(t) { return clamp((dotBright(t) - 0.3) / 0.7, 0, 1); }

    // ---------------- HUD text (screen space): the title group above the flat tail, upper right ----------------
    var kick = u.text(hud, '', 'en', { x: 952, y: 186, anchor: 'left', style: { fontSize: '60px', color: '#9ec0f0', letterSpacing: '0.01em' } });
    var head = u.text(hud, '', 'headline', { x: 948, y: 250, anchor: 'top-left', html: '<span style="font-size:100px">不复习，</span><br>新学的东西会<span style="color:#ffffff;text-shadow:0 0 18px rgba(160,200,255,0.45)">很快忘掉</span>，', style: { fontSize: '78px', lineHeight: '1.16', color: '#dde6f5' } });
    var sub = u.text(hud, '', 'line', { x: 952, y: 486, anchor: 'top-left', html: '而且一开始，<span style="color:#f6f9ff;text-shadow:0 0 16px rgba(160,200,255,0.5)">忘得最快</span>。', style: { fontSize: '60px', color: '#b4c3de' } });
    var notEl = u.text(hud, '不是你笨。', 'headline', { x: 960, y: 176, style: { fontSize: '128px', color: '#eef4ff', letterSpacing: '0.06em' } });
    var src = u.text(hud, 'Ebbinghaus, 1885 · Murre & Dros, 2015', 'source', { x: 1856, y: 1028, anchor: 'bottom-right', style: { color: '#93a4c4' } });
    var headCh = u.splitChars(head), subCh = u.splitChars(sub);

    // kicker decodes on beat 2 of bar 15
    // starts as 16 cipher letters (the right length, no blank frames) and decodes left to right in 0.7 s, so the
    // words are fully readable from 5.08 to 8.5 (3.4 s, more than 0.6 + 16/6 = 3.27 s)
    gsap.set([kick, src], { opacity: 0 });
    kick.textContent = 'qzvxkmjwtb hpyfo';
    tl.set(kick, { opacity: 1 }, tx.kick.in);
    tl.to(kick, { duration: 0.7, scrambleText: { text: 'forgetting curve', chars: 'lowerCase', revealDelay: 0.12, speed: 0.6 }, ease: 'none' }, tx.kick.in);

    gsap.set(headCh, { opacity: 0 });
    tl.fromTo(headCh, { opacity: 0, y: 46, filter: 'blur(10px)' }, { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.75, ease: 'power4.out', stagger: 0.04 }, tx.head.in);

    gsap.set(subCh, { opacity: 0 });
    var subChroma = u.chroma(sub, { amount: 0 });
    // pops in: position and scale spring (back.out), blur and opacity settle without overshoot (a negative blur is invalid CSS)
    tl.fromTo(subCh, { y: 34, scale: 1.12 }, { y: 0, scale: 1, duration: 0.55, ease: 'back.out(1.6)', stagger: 0.03 }, tx.sub.in);
    tl.fromTo(subCh, { opacity: 0, filter: 'blur(8px)' }, { opacity: 1, filter: 'blur(0px)', duration: 0.4, ease: 'power3.out', stagger: 0.03 }, tx.sub.in);
    tl.fromTo(subChroma.state, { amount: 0 }, { keyframes: [{ amount: 7, duration: 0.06 }, { amount: 0, duration: 0.35, ease: 'power2.out' }] }, tx.sub.in + 0.3);

    // title group leaves on 8.9: up, fade, 6 px blur
    var OUT_D = 0.4;
    tl.to(kick, { opacity: 0, y: -22, filter: 'blur(6px)', duration: OUT_D, ease: 'power2.in' }, tx.kick.out - OUT_D);
    tl.to(headCh, { opacity: 0, y: -22, filter: 'blur(6px)', duration: OUT_D, ease: 'power2.in', stagger: 0.006 }, tx.head.out - OUT_D - 0.006 * (headCh.length - 1));
    tl.to(subCh, { opacity: 0, y: -22, filter: 'blur(6px)', duration: OUT_D, ease: 'power2.in', stagger: 0.006 }, tx.sub.out - OUT_D - 0.006 * (subCh.length - 1));

    tl.fromTo(src, { opacity: 0 }, { opacity: 0.68, duration: 0.7, ease: 'power2.out' }, tx.src.in);
    tl.to(src, { opacity: 0, duration: 0.4, ease: 'power2.in' }, tx.src.out - 0.4);

    // 不是你笨。 slams in on bar 18 and holds
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
    var TPD0 = polyD(TP), ZFINAL = polyD(ZV), lastTail = '', lastTip = '';
    function tailPath(d) { if (d === lastTail) return; lastTail = d; tailP.forEach(function (p) { p.setAttribute('d', d); }); }
    var LP = LET.map(function () { return { x: 0, y: 0, a: 0, op: 0, sc: 1, clip: 0, blur: 0, vis: false }; });
    u.onFrame(function (t) {
      var c = camAt(t), m = 'matrix(' + c.z.toFixed(5) + ',0,0,' + c.z.toFixed(5) + ',' + c.tx.toFixed(3) + ',' + c.ty.toFixed(3) + ')';
      camG.setAttribute('transform', 'matrix(' + c.z.toFixed(5) + ' 0 0 ' + c.z.toFixed(5) + ' ' + c.tx.toFixed(3) + ' ' + c.ty.toFixed(3) + ')');
      planeO.style.transform = m;
      // the chart SVG is repainted whole on every frame: a t-dependent, invisible opacity (0.9990 to 0.9999) invalidates
      // all of it, so Chrome never mixes freshly rasterised and retained strips of the morphing tail (seek-order noise)
      svgU.style.opacity = (0.999 + 0.0009 * (((t * 61.803) % 1 + 1) % 1)).toFixed(5);
      // sky: darker with every swath, a cold top haze once the chart is drawn, the abyss, navy at the end
      var dp = darkProg(t);
      cityGlow.style.opacity = (1 - 0.85 * dp).toFixed(4);
      coldTop.style.opacity = (seg(t, T_DRAW, T_DRAW + 1.5) * (1 - seg(t, T_FOLD, T_FOLD + 1.4))).toFixed(4);
      abyss.style.opacity = (0.4 * dp + 0.6 * seg(t, T_DRAW, T_FALL + 1.0, eSine)).toFixed(4);
      navy.style.opacity = eSine(seg(t, T_FOLD + 0.15, D - 0.15)).toFixed(4);
      if (t < WIPE_D) {
        var X = wipeX(t);
        band.style.display = '';
        band.style.background = 'linear-gradient(90deg, rgba(4,6,12,0) ' + (X - 820).toFixed(1) + 'px, rgba(4,6,12,0.72) ' + (X - 380).toFixed(1) + 'px, rgba(4,6,12,0.72) ' + (X + 30).toFixed(1) + 'px, rgba(4,6,12,0) ' + (X + 31).toFixed(1) + 'px)';
      } else { band.style.display = 'none'; band.style.background = ''; }
      [coldTop, abyss, navy, cityGlow].forEach(function (e) { var hide = parseFloat(e.style.opacity) < 0.002; if (e._h !== hide) { e.style.display = hide ? 'none' : ''; e._h = hide; } });
      // letters of the word
      var nd = nDropped(t), col = mixHex('#eaf1ff', '#a2b3d1', nd / 8);
      var gl = 0.28 + 0.3 * dotCool(t) * (t < T_SLIDE ? 1 : 0.6);
      var shd = '0 0 3px rgba(5,8,16,0.9), 0 0 12px rgba(5,8,16,0.6), 0 0 16px rgba(150,190,255,' + gl.toFixed(3) + ')';
      for (var k = 0; k < 8; k++) {
        var p = letterPose(k, t, LP[k]), e = letEls[k];
        if (!p.vis) { p.x = 0; p.y = 0; p.a = 0; p.sc = 1; p.clip = 0; p.op = 0; p.blur = 0; }
        e.style.opacity = p.op.toFixed(4);
        e.style.transform = 'translate(' + p.x.toFixed(2) + 'px,' + p.y.toFixed(2) + 'px) rotate(' + (p.a * 57.29578).toFixed(3) + 'deg) scale(' + p.sc.toFixed(4) + ')';
        e.style.clipPath = p.clip > 0 ? 'inset(0 0 ' + (lerp(CLIP0, CLIP1, p.clip) * 100).toFixed(2) + '% 0)' : 'none';
        e.style.filter = p.blur > 0.05 ? 'blur(' + p.blur.toFixed(2) + 'px)' : 'none';
        e.style.color = col; e.style.textShadow = shd;
      }
      // tail morph; the last marker (31 d) is the tip of the tail, so it rides the tip until it has faded
      var tip = MK[3];
      if (t >= T_FOLD_END) { tailPath(ZFINAL); tip = { x: ZV[8][0], y: ZV[8][1] }; }   // settled: s04's own 9-vertex path string
      else if (t >= T_FOLD - 0.01) { var FPm = foldPts(t); tailPath(polyD(FPm)); tip = { x: FPm[NZ][0], y: FPm[NZ][1] }; }
      else tailPath(TPD0);
      var tipK = tip.x.toFixed(2) + ',' + tip.y.toFixed(2);
      if (tipK !== lastTip) { lastTip = tipK; [mkRing[3], mkFill[3]].forEach(function (c) { c.setAttribute('cx', tip.x.toFixed(2)); c.setAttribute('cy', tip.y.toFixed(2)); }); }
    });

    // ---------------- waterfall: particles ----------------
    var RP = u.rand('s03-flow');
    function flux(t) {
      if (t < T_TRICKLE) return 0;
      var env = 0.3 * seg(t, T_TRICKLE, T_TRICKLE + 0.3, eP2o);            // the first strand over the lip
      env = lerp(env, 1.6, seg(t, T_FALL, T_FALL + 0.2, eP2o));             // bar 16: it pours
      env = lerp(env, 1.1, seg(t, T_FALL + 0.35, T_FALL + 1.3, eSine));
      env = lerp(env, 0.42, seg(t, T_SETTLE, T_SETTLE + 1.4, eSine));       // G, the music falls back: thinning
      env = lerp(env, 0.24, seg(t, T_NOT, T_NOT + 1.2, eSine));             // a thin trickle under 不是你笨。
      env *= 1 - seg(t, T_FOLD, T_FOLD + 0.8, eP2i);
      return env * (0.6 + 0.8 * eN(t));
    }
    var NP = 4600, PTS = [], FLOW_END = T_FOLD + 1.0;
    var FCUM = [0], FTS = [T_TRICKLE];
    (function () {
      var dtS = 1 / 240;
      for (var t = T_TRICKLE; t < FLOW_END; t += dtS) { FCUM.push(FCUM[FCUM.length - 1] + flux(t + dtS / 2) * dtS); FTS.push(t + dtS); }
      var tot = FCUM[FCUM.length - 1];
      var Rinv = 1 - Ru(1);
      for (var i = 0; i < NP; i++) {
        var target = (i + RP()) / NP * tot, j = bsearch(FCUM, target), f = (target - FCUM[j]) / Math.max(1e-9, FCUM[j + 1] - FCUM[j]);
        var p = { ts: lerp(FTS[j], FTS[Math.min(j + 1, FTS.length - 1)], f), f: RP.range(0.85, 1.22), off: Math.pow(RP(), 1.6) * 11, a: RP.range(0.45, 1.0),
          w: RP() < 0.55 ? 0 : RP() < 0.7 ? 1 : 2, ph: RP() * 6.28 };
        var q = RP();
        if (q < Rinv) {   // leaves the curve where R has dropped by q: almost all of it over the cliff
          var ud = uOfR(1 - q), sd = sAtU(ud), tau = tauOfS(sd);
          p.ad = tau / p.f;
          var fs = flowAt(tau, {});
          var nx = Math.sin(fs.a), ny = -Math.cos(fs.a);
          p.dx = fs.x + nx * p.off; p.dy = fs.y + ny * p.off;
          var vv2 = fs.v * p.f * 0.35, cliff = 1 - seg(ud, 0.1, 0.2);
          p.cliff = cliff;
          p.dvx = Math.cos(fs.a) * vv2 + lerp(RP.range(-20, 50), RP.range(50, 240), cliff); p.dvy = Math.sin(fs.a) * vv2 + RP.range(-40, 60);
          p.sway = RP.range(-10, 10);
          p.life = p.ad + 2.0;
        } else { p.ad = 1e9; p.life = TTEND / p.f; p.rider = true; }
        PTS.push(p);
      }
      PTS.sort(function (a, b) { return a.ts - b.ts; });
    })();
    function invFlux(qf) { var tot = FCUM[FCUM.length - 1], target = qf * tot, j = bsearch(FCUM, target), f = (target - FCUM[j]) / Math.max(1e-9, FCUM[j + 1] - FCUM[j]); return lerp(FTS[j], FTS[Math.min(j + 1, FTS.length - 1)], f); }
    var PT_TS = PTS.map(function (p) { return p.ts; });
    var MAXLIFE = PTS.reduce(function (m, p) { return Math.max(m, p.life); }, 0);
    var GRAV = 820;

    // readable words in the waterfall (the foreground ~30), placed by the flux, never touching each other
    var FW = [], RWd = u.rand('s03-fw');
    var fwWords = RWd.shuffle(WORDS.filter(function (s) { return s.length >= 5 && s.length <= 9; })).slice(0, 34);
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
        var ts0 = i === 0 ? T_TRICKLE + 0.04 : clamp(invFlux((i + 0.5) / fwWords.length) + RWd.range(-0.12, 0.12), T_TRICKLE + 0.1, T_FOLD - 0.6);
        var ua = i % 2 ? RWd.range(0.035, 0.07) : RWd.range(0.008, 0.03), ud = ua + RWd.range(0.008, 0.016), ta = tauOfS(sAtU(ua)), td = tauOfS(sAtU(ud));
        var fs = flowAt(td, {});
        var it = { ts: ts0, ta: ta, ad: td - ta, px: px, ice: ice, grey: grey, tw: ice.tw,
          dx: fs.x, dy: fs.y, da: fs.a, dvx: LANES[(i + tries) % LANES.length] + RWd.range(-20, 20), dvy: RWd.range(20, 90),
          spin: RWd.range(-0.9, 0.9), vT: RWd.range(230, 310), tauD: RWd.range(0.5, 0.7), sway: RWd.range(8, 20), ph: RWd() * 6.28, life: 0 };
        it.life = it.ad + 3.0;
        var ok = true, P1 = {}, P2 = {};
        for (var jj = 0; jj < FW.length && ok; jj++) {
          var o = FW[jj];
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
    for (var mi = 0; mi < 9; mi++) MIST.push({ x: RM.range(300, 820), y: RM.range(980, 1120), r: RM.range(150, 300), vx: RM.range(-8, 8), vy: RM.range(-26, -12), ph: RM() * 6.28 });
    function mistEnv(t) { return seg(t, T_SETTLE - 0.9, T_SETTLE + 0.9, eSine) * (1 - seg(t, T_FOLD + 0.2, T_FOLD + 1.4)); }
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
      var fadeB = 1 - 0.85 * seg(t, T_DRAW, T_DRAW + 1.25, eP2io);
      var endF = 1 - seg(t, T_FOLD + 0.1, T_FOLD + 1.5, eSine);
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
      var dimK = (1 - 0.36 * seg(t, T_DRAW, T_DRAW + 1.25, eP2io) - 0.2 * seg(t, T_FALL, T_FALL + 2.0, eSine)) * (1 + 0.15 * liftAt(t) + 0.06 * eN(t)) * endF;
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
      var ab = seg(t, T_TRICKLE - 0.4, T_FALL + 1.6, eSine) * endF;
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
    // s04's motif dot at its frame 0, weighted by w (s04: familiarity (2 x 0.18 - 0.3) / 0.6 = 0.1, energy over 0.18 .. 0.48)
    function dotS04(g, x, y, w, t) {
      var en4 = clamp((u.energy(t, 0.2) - 0.18) / 0.3, 0, 1), fam = 0.1, halo = fam * (0.75 + 0.35 * en4);
      if (halo * w > 0.003) {
        var hr = 26 + 64 * fam, hgr = g.createRadialGradient(x, y, 0, x, y, hr);
        hgr.addColorStop(0, 'rgba(155,140,255,0)'); hgr.addColorStop(0.16, 'rgba(155,140,255,0)'); hgr.addColorStop(0.3, 'rgba(165,150,255,' + (0.5 * halo * w).toFixed(4) + ')');
        hgr.addColorStop(0.6, 'rgba(155,140,255,' + (0.14 * halo * w).toFixed(4) + ')'); hgr.addColorStop(1, 'rgba(155,140,255,0)');
        g.fillStyle = hgr; g.fillRect(x - hr, y - hr, hr * 2, hr * 2);
      }
      glowDisc(g, x, y, 120, 'rgba(58,74,107,', 0.05 * w);
      glowDisc(g, x, y, 36, 'rgba(120,150,200,', 0.28 * w * (0.85 + 0.3 * en4));
      glowDisc(g, x, y, 13, 'rgba(225,238,255,', 0.16 * w);
    }
    function spark(g, x, y, a, s) { glowDisc(g, x, y, 30 * s, 'rgba(170,210,255,', 0.5 * a); glowDisc(g, x, y, 7 * s, 'rgba(244,249,255,', a); }
    function streak(g, x, y, len, a) {
      if (a <= 0.003) return;
      g.save(); g.translate(x, y); g.scale(1, 0.02);
      var gr = g.createRadialGradient(0, 0, 0, 0, 0, len);
      gr.addColorStop(0, 'rgba(205,228,255,' + Math.min(1, a).toFixed(4) + ')'); gr.addColorStop(0.3, 'rgba(140,185,255,' + (0.4 * Math.min(1, a)).toFixed(4) + ')'); gr.addColorStop(1, 'rgba(120,170,255,0)');
      g.fillStyle = gr; g.fillRect(-len, -len, len * 2, len * 2); g.restore();
    }

    // river tables: sample positions along the curve, R^1.7 there, and the light (R) as a function of the distance from
    // the origin (monotonic along this curve), as radial-gradient stops
    var RIV_N = 90, RIV_S = [], RIV_V17 = [], RIV_STOPS = [], RIV_RMAX = 0;
    (function () {
      for (var i = 0; i <= RIV_N; i++) { var sv = CL * Math.pow(i / RIV_N, 1.6), q = atS(sv, {}); RIV_S.push(sv); RIV_V17.push(Math.pow(Ru((q.x - PX0) / (PX1 - PX0)), 1.7)); }
      var end = atS(CL, {}); RIV_RMAX = Math.hypot(end.x - CP[0][0], end.y - CP[0][1]) + 40;
      for (i = 0; i <= 12; i++) { var q2 = atS(CL * Math.pow(i / 12, 1.6), {}), d = Math.hypot(q2.x - CP[0][0], q2.y - CP[0][1]); RIV_STOPS.push([clamp(d / RIV_RMAX, 0, 1), Ru((q2.x - PX0) / (PX1 - PX0))]); }
      RIV_STOPS.push([1, 0]);
    })();

    function drawFx(g, t) {
      var c = camAt(t), en = eN(t), lift = liftAt(t), gain = 1 + 0.15 * lift + 0.12 * en;
      var endF = 1 - seg(t, T_FOLD + 0.4, T_FOLD + 1.5, eSine);
      g.save(); g.translate(c.tx, c.ty); g.scale(c.z, c.z);
      g.globalCompositeOperation = 'lighter';

      // the docked word warms the roof of building 0 a little
      var dock = seg(t, T_DOCK - 0.25, T_DOCK + 0.2) * (1 - seg(t, T_SLIDE, T_SLIDE + 0.4));
      if (dock > 0.01) glowDisc(g, DOCK.x + 20, blds[0].top, 120, 'rgba(150,190,255,', 0.09 * dock * (0.8 + 0.4 * en));
      // a spark drops from the dot to the origin, then the draw head runs along the curve
      var sp = seg(t, T_DRAW - 0.2, T_DRAW, eP2i);
      if (sp > 0 && sp < 1) spark(g, lerp(DOCK.x, CP[0][0], sp), lerp(DOCK.y, CP[0][1], sp), 0.9, 0.9);
      var dpp = seg(t, T_DRAW, T_DRAW + T_DRAW_D);
      if (dpp > 0 && dpp < 1) { var hq = atS(eP4io(dpp) * CL, Q); spark(g, hq.x, hq.y, 0.95, 1.2); streak(g, hq.x, hq.y, 160, 0.5); }
      var ap = seg(t, T_DRAW, T_DRAW + 1.0);
      if (ap > 0 && ap < 1) { var ae = eP3io(ap); spark(g, AXX, GY + 6 - (GY + 6 - 206) * ae, 0.5, 0.7); spark(g, AXX - 6 + (1798 - AXX + 6) * ae, GY, 0.5, 0.7); }

      // source glow (the spring the words pour out of)
      var fl = flux(t), flL = 0.5 * (flux(t - 0.3) + flux(t - 0.6));
      if (fl > 0.01) {
        glowDisc(g, CP[0][0], CP[0][1], 170, 'rgba(120,160,235,', 0.16 * fl * gain);
        glowDisc(g, CP[0][0], CP[0][1], 44, 'rgba(220,235,255,', 0.4 * Math.min(1.4, fl) * gain);
      }

      // the river riding the curve: its width and light are the flow volume, i.e. R at that point. Drawn as two filled
      // ribbons (no stroke joints, so no rings or steps); the light falls off with R along the curve via a radial
      // gradient from the origin, and shimmers with the flow.
      if (fl > 0.01) {
        var flS = Math.min(1.4, 0.5 * (fl + flL)), shim = 0.8 + 0.3 * riverN.noise2(t * 1.7, 0.5);
        // outer glow as three nested ribbons (soft edge in small steps), then the bright core
        for (var lay = 0; lay < 4; lay++) {
          var core = lay === 3, hw = [1.2, 0.85, 0.55, 0.275][lay], sh0 = core ? 0.6 : 1, aK = (core ? 0.16 : 0.022) * flS * shim * gain * endF;
          if (aK < 0.002) continue;
          var Lx = [], Ly = [], Rx = [], Ry = [];
          for (var rs = 0; rs <= RIV_N; rs++) {
            var ra = atS(RIV_S[rs], RA), wdt = (3 + 30 * RIV_V17[rs] * flS) * (0.3 + 0.7 * eSine(clamp(rs / 7, 0, 1))), nxr = Math.sin(ra.a), nyr = -Math.cos(ra.a), cO = wdt * 0.32 * sh0;
            Lx.push(ra.x + nxr * (cO + wdt * hw)); Ly.push(ra.y + nyr * (cO + wdt * hw));
            Rx.push(ra.x + nxr * (cO - wdt * hw)); Ry.push(ra.y + nyr * (cO - wdt * hw));
          }
          var rgr = g.createRadialGradient(CP[0][0], CP[0][1], 0, CP[0][0], CP[0][1], RIV_RMAX);
          for (var st2 = 0; st2 < RIV_STOPS.length; st2++) rgr.addColorStop(RIV_STOPS[st2][0], (core ? 'rgba(207,224,251,' : 'rgba(127,166,224,') + Math.min(1, aK * RIV_STOPS[st2][1]).toFixed(4) + ')');
          g.globalAlpha = 1; g.fillStyle = rgr; g.beginPath(); g.moveTo(Lx[0], Ly[0]);
          for (rs = 1; rs <= RIV_N; rs++) g.lineTo(Lx[rs], Ly[rs]);
          for (rs = RIV_N; rs >= 0; rs--) g.lineTo(Rx[rs], Ry[rs]);
          g.closePath(); g.fill();
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
        var lip = atS(sAtU(0.03), RA);   // bright lip where the river breaks over the cliff
        glowDisc(g, lip.x + 18, lip.y + 10, 120, 'rgba(160,200,255,', 0.12 * shA);
      }

      // waterfall particles (bucketed strokes)
      if (t >= T_TRICKLE) {
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
          var ci2 = fall <= 0 ? 0 : Math.min(5, Math.floor(fall / 0.26));
          var kq = fall > 0 ? 0.04 : 0.01, cap = fall > 0 ? (p.cliff > 0.5 ? 60 : 26) : (FS.s > S_KNEE ? 4 : 8), lx = vx * kq, ly = vy * kq, ll = Math.sqrt(lx * lx + ly * ly);
          if (ll > cap) { lx *= cap / ll; ly *= cap / ll; }
          var bk2 = BUCK[(ci2 * 6 + aIdx(al)) * 3 + p.w];
          bk2.push(x - lx, y - ly, x, y);
          if (ci2 <= 2) GLOWB.push(x - lx, y - ly, x, y);
        }
        g.lineCap = 'round';
        if (GLOWB.length) {   // bloom pass
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

      // mist rising at the foot of the waterfall (from 7.5, when the fall hits the bottom)
      var me = mistEnv(t);
      if (me > 0.003) {
        for (var m = 0; m < MIST.length; m++) {
          var mm = MIST[m], tt = t - (T_SETTLE - 1.0);
          var mx = mm.x + mm.vx * tt + 30 * Math.sin(mm.ph + tt * 0.35), my = mm.y + mm.vy * tt;
          glowDisc(g, mx, my, mm.r * (1 + 0.05 * tt), 'rgba(140,170,225,', 0.13 * me * (0.6 + 0.5 * Math.min(1.2, flL)) * (0.7 + 0.4 * en));
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
        if (!DROPST[lk]) continue;
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
      // a soft ring when the word lands on the roof
      var lt2 = t - T_DOCK;
      if (lt2 > 0 && lt2 < 0.7) {
        g.globalAlpha = 0.5 * Math.pow(1 - lt2 / 0.7, 1.5); g.strokeStyle = '#cfe0fb'; g.lineWidth = 1.6;
        g.save(); g.translate(DOCK.x + 40, blds[0].top - 4); g.scale(1, 0.28); g.beginPath(); g.arc(0, 0, 20 + 150 * eExpo(lt2 / 0.7), 0, 6.2832); g.restore(); g.stroke();
      }
      g.globalAlpha = 1;

      // the motif dot (tittle of the ı). Over the last half second it turns into exactly s04's frame-0 dot (same glows,
      // radius, alpha and the faint lavender ring of familiarity), so nothing pops on the cut
      var dpos = dotPos(t), db = dotBright(t), dc = dotCool(t);
      var w4 = eSine(seg(t, T_FOLD_END - 0.5, D - 0.1)), k3 = 1 - w4;
      var szk = lerp(0.75, 1, seg(t, T_EV_IN, T_EV_IN + 0.4, eSine)), dotR = lerp(3.4, DOT_R, seg(t, T_EV_IN, T_EV_IN + 0.4, eSine));
      var haloRGB = 'rgba(' + Math.round(lerp(58, 169, dc)) + ',' + Math.round(lerp(74, 200, dc)) + ',' + Math.round(lerp(107, 255, dc)) + ',';
      var prev = dotPos(t - 1 / 30), mv = Math.hypot(dpos[0] - prev[0], dpos[1] - prev[1]);
      if (mv > 1.5) {   // comet tail while moving (butt caps: no beads where the segments meet)
        var prevP = dpos; g.lineCap = 'butt';
        for (var ti = 1; ti <= 18; ti++) {
          var pp = dotPos(t - ti * 0.012), fr = 1 - ti / 19;
          g.strokeStyle = haloRGB + (0.5 * Math.min(db, 1.3) * fr * k3).toFixed(4) + ')'; g.lineWidth = dotR * 2.1 * fr + 0.4;
          g.beginPath(); g.moveTo(prevP[0], prevP[1]); g.lineTo(pp[0], pp[1]); g.stroke(); prevP = pp;
        }
      }
      glowDisc(g, dpos[0], dpos[1], 150 * (0.75 + 0.3 * db) * szk, haloRGB, 0.08 * Math.min(db, 1.6) * (0.85 + 0.3 * en) * k3);
      glowDisc(g, dpos[0], dpos[1], 40 * (0.8 + 0.3 * db) * szk, haloRGB, (0.4 * Math.min(db, 1.6) + 0.1) * k3);
      glowDisc(g, dpos[0], dpos[1], dotR * 3, 'rgba(225,238,255,', 0.75 * Math.min(db, 1.3) * (0.4 + 0.6 * dc) * k3);
      if (w4 > 0) dotS04(g, dpos[0], dpos[1], w4, t);
      g.globalCompositeOperation = 'source-over';
      g.globalAlpha = lerp(clamp(0.5 + 0.6 * db, 0, 1), 0.75, w4);
      g.fillStyle = mixHex('#7d8fb3', '#f6faff', dc * k3); g.beginPath(); g.arc(dpos[0], dpos[1], lerp(dotR, 4.6, w4), 0, 6.2832); g.fill();
      g.globalAlpha = 1; g.globalCompositeOperation = 'lighter';
      var fl2 = 0.06 * dc;
      for (var mi2 = 0; mi2 < 4; mi2++) fl2 += 0.7 * pulse(t - T_M[mi2], 0.01, 0.3);
      fl2 += 0.6 * pulse(t - T_SLIDE, 0.01, 0.3) + 0.5 * pulse(t - T_EV_IN, 0.01, 0.35) + 0.45 * pulse(t - T_DOCK, 0.01, 0.3) + 0.5 * pulse(t - T_DRAW, 0.01, 0.3);
      streak(g, dpos[0], dpos[1], 320 * (0.6 + 0.6 * Math.min(1, fl2)), fl2 * k3);

      // glint up the finished stair outline (hand-off to s04)
      var gp = seg(t, T_FOLD_END - 0.6, D - 0.12, eP2io);
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
      var envB = seg(t, 0, 1.0) * (1 - seg(t, T_FOLD, T_FOLD + 1.2));
      for (var bo = 0; bo < BOK.length; bo++) {
        var B = BOK[bo];
        var bx = cb.tx + cb.z * (B.x + 16 * Math.sin(B.ph + t * 0.2)), by = cb.ty + cb.z * (B.y + 12 * Math.cos(B.ph + t * 0.17));
        var ba = B.a * envB * (0.75 + 0.5 * en) * (1 + 0.8 * lift);
        if (ba <= 0.0005) continue;
        var bg2 = g.createRadialGradient(bx, by, 0, bx, by, B.r);
        bg2.addColorStop(0, 'rgba(127,166,224,' + (ba * 0.7).toFixed(4) + ')'); bg2.addColorStop(0.7, 'rgba(127,166,224,' + (ba * 0.8).toFixed(4) + ')');
        bg2.addColorStop(1, 'rgba(127,166,224,0)');
        g.fillStyle = bg2; g.beginPath(); g.arc(bx, by, B.r, 0, 6.2832); g.fill();
      }
      // a cold bloom over the waterfall side on bar 16 and on the hits, and a breath on 不是你笨。
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
  });
})();
