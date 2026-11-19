/* s02  The night city of memory (global 11.217 to 22.467 s, bars 7 to 12: Am Am G G Am Am, intro_a).
 *
 * The motif dot from s01 lands in the tittle of the ı of "evidence" in the first window of a dark city; the window
 * flickers on like a fluorescent tube on the first two 16ths and is steady on the third. The camera releases from a
 * 2x close-up to the whole skyline (4 parallax layers, expo.out so every district is in frame when it rises) while
 * five districts spring up from the horizon one beat each: 小学, 初中, 高中, 大学, 考研 (a staircase of years). On the G
 * (bar 9) a frosted phone (no brand) flicks word cards, every card throws its word as a light mote into a window:
 * 1 per beat, then 2 per beat (bar 10, "你背过的单词，"), eighths plus the city lighting itself on every 16th (bar 11,
 * Am, "后来都去哪了？"), then 16ths and waves of windows (bar 12). On beat 2 of bar 12 every title glyph shatters into
 * 4 or 5 light shards that arc into the last dark windows (one beat, power3.in); on beat 3 they all land, the whole
 * city is lit, cold white-blue, and holds still for one beat until s03 puts the lights out.
 *
 * Techniques: 1 vector illustration (generated skyline with school clock tower, water tanks, university dome, bell
 *   tower, spire; faceless line learner with a glowing head and a thick word book), 6 2.5D parallax (4 layers +
 *   street + foreground bokeh), 9 UI mock (frosted phone, CSS 3D card flicks, progress bar, buttons), 8 text effects
 *   (staggered blur-rise, glyphs shattered into clipped shards that become light), 3 motion paths (bezier mote and
 *   shard flights with comet tails), 5 particles (s01's word dust continued as stars, motes, shards), 11 light
 *   (window glow, wet-street reflections, mist, bloom, vignette), 13 music (energy drives window glow, dot, title
 *   glow; every light switches on exactly on a 16th of the grid).
 *
 * HANDOFF IN (cut from s01 at global 11.217): the motif dot is at SCREEN (1336, 262) on the first frame, already in
 *   the tittle of ı (camera at 2x); s01's night-blue radial background, heavy vignette and word dust (same seed and
 *   drift, at 35 %) are rebuilt and hand over to the city within 2.5 s.
 *
 * HANDOFF OUT (cut to s03 at global 22.467): from local 10.625 s to the end the picture is still. Near layer (d = 1)
 *   maps world (x, y) to screen (960 + (x - 960) * 0.96, 540 + (y - 540) * 0.96). Street line (BASE) at world y 860.
 *   Districts (world x): 小学 522-707, 初中 727-981, 高中 1001-1255, 大学 1275-1529, 考研 1549-1923; 14 buildings,
 *   all windows lit. The evidence window is the top floor of the 考研 tower (world x 1636-1836, y 324-396); the motif
 *   dot rests at its centre, world (1736, 359) = screen (1705, 361), core about 3.4 px, halo about 30 px. The learner
 *   stands at world (482, 1004) (feet) = screen (502, 984), scale 0.958, head up, head lamp about 40 % cold blue.
 *   Phone and title are gone.
 */
(function () {
  'use strict';

  // word cards on the phone: the 11 words named in the storyboard first, then real headwords from the user's 70 stories
  var CARDS = ['captivity', 'intact', 'withstand', 'scarcely', 'stubborn', 'versatile', 'candid', 'revelation',
    'tentative', 'ambiguous', 'sparse', 'principle', 'blueprint', 'momentous', 'spectacle', 'clarity', 'resilient',
    'curiosity', 'ingenious', 'ephemeral', 'enigma', 'symmetry', 'lantern', 'prolific', 'eminent', 'prudent',
    'botanist', 'agility', 'periodic', 'remedial', 'farewell', 'replicate', 'lyric', 'onlooker', 'ancestry',
    'autonomy', 'pollen', 'glimpsed', 'reservoir', 'catalogue', 'gigantic', 'homemade', 'immensely', 'proclaim',
    'unsettled', 'leftover', 'hover', 'rivet', 'climber', 'delegate', 'infer', 'perch', 'twist', 'ordinance',
    'tighten', 'flavour', 'marshal'];
  // window words (decorative texture, readable in a 4K still): real headwords from the same stories, never "evidence"
  var WIN = ['protester', 'showcase', 'outfit', 'brick', 'initiator', 'assess', 'diver', 'signify', 'patron', 'variable',
    'imaging', 'shatter', 'captive', 'alpine', 'invoke', 'clench', 'coiled', 'chlorine', 'rhythmic', 'steep',
    'proposal', 'humour', 'crevice', 'novelty', 'glare', 'abstract', 'sensation', 'alike', 'imperfect', 'competing',
    'pavement', 'diminish', 'mammal', 'adviser', 'printer', 'navigable', 'annually', 'petition', 'suitor', 'expand',
    'imaginary', 'shopper', 'metaphor', 'convene', 'highway', 'versus', 'reliable', 'backer', 'lecturer', 'undamaged',
    'entrance', 'marketer', 'excess', 'meanwhile', 'blameless', 'essence', 'sheet', 'ecology', 'pulse', 'populace',
    'matter', 'acute', 'clamp', 'displace', 'infancy', 'gamble', 'disposal', 'snapshot', 'forensic', 'freight',
    'colony', 'recapture', 'consumer', 'ancestor', 'disclose', 'criticism', 'emission', 'monsoon', 'lifespan', 'empower',
    'viable', 'secrecy', 'contrast', 'untimely', 'firmly', 'patterns', 'rigid', 'dweller', 'lining', 'endurance',
    'appeal', 'laureate', 'dealer', 'corridor', 'apparel', 'harness', 'recovery', 'debut', 'midday', 'tavern',
    'plummet', 'inventive', 'astronaut', 'infant', 'unlikely', 'iconic', 'inner', 'vision', 'outcome', 'stiff',
    'debris', 'reside', 'revisit', 'acquire', 'rattle', 'hybrid', 'ordinary', 'fibre', 'unsolved', 'marker',
    'resolute', 'gender', 'artwork', 'practical', 'sermon', 'ironic', 'aperture', 'board', 'scheme', 'fictional',
    'digit', 'ambitious', 'undivided', 'station', 'purely', 'resign', 'precisely', 'advocate', 'delivery', 'catalyst',
    'elite', 'deduce', 'trample', 'ration', 'solidify', 'initially', 'dissolve', 'intervene', 'presumed', 'fruitless',
    'likeness', 'awkward', 'portion', 'facade', 'rewind', 'peculiar', 'crimson', 'tissue', 'unstable', 'topple',
    'arduous', 'intake', 'pillar', 'engage', 'foraging', 'ceremony', 'urging', 'genuinely', 'dilemma', 'hesitant',
    'portfolio', 'offset', 'equally', 'buyer', 'eastward', 'motion', 'unmask', 'shuffle', 'broker', 'widely',
    'artery', 'primitive', 'layer', 'volcano', 'uncommon', 'govern', 'tedious', 'devalue', 'narration', 'assemble',
    'scanner', 'campus', 'treatise', 'property', 'archival', 'leather', 'arrogance', 'exceed', 'label', 'workforce',
    'revenue', 'stunted', 'aviation', 'bearings', 'symbolic', 'curator', 'coinage', 'decode', 'intensive', 'loyal',
    'untested', 'payload', 'eager', 'compute', 'commence', 'ascertain', 'discharge', 'inspire', 'porous', 'filament',
    'relish', 'muster', 'assessor', 'temporary', 'bleak', 'exploit', 'cosmic', 'fruitful', 'imprecise', 'mankind',
    'doorway', 'hitherto', 'intensity', 'splinter', 'chunk', 'recipient', 'expansion', 'muscle', 'medicinal',
    'classical', 'sunlight', 'fasten', 'thorough', 'elderly', 'esteemed', 'bookmark', 'implicit', 'spectrum'];

  registerScene('s02', function build(tl, root, ctx) {
    var u = ctx.util, gsap = window.gsap, D = ctx.duration, W = 1920, H = 1080;
    var clamp = u.clamp, lerp = u.lerp, dpr = window.devicePixelRatio || 1;
    function E(n) { return gsap.parseEase(n); }
    var eSine = E('sine.inOut'), eSineO = E('sine.out'), eP2o = E('power2.out'), eP2i = E('power2.in'), eP2io = E('power2.inOut'),
      eP3o = E('power3.out'), eP3i = E('power3.in'), eExpo = E('expo.out'), eBack = E('back.out(1.5)');
    function seg(t, a, b, ease) { var x = clamp((t - a) / (b - a), 0, 1); return ease ? ease(x) : x; }
    function pulse(x, rise, decay) { return x < 0 ? 0 : (1 - Math.exp(-x / rise)) * Math.exp(-x / decay); }
    function B(n) { return u.beat(n); }
    function TX(s, a, b) { for (var i = 0; i < ctx.texts.length; i++) if (ctx.texts[i].text === s) return ctx.texts[i]; return { in: a, out: b }; }
    var BEAT = (ctx.music && ctx.music.beat) || 0.625, S16 = BEAT / 4;

    // ================= timing (local s, all on the music grid: beat 0.625, 16th 0.15625) =================
    // bar 7 (Am) 0: the dot lands, the window flickers on the first two 16ths, steady on the third; the camera pulls back
    // bar 7-8 beats 2..6: five districts rise, one per beat; bar 8: "从小学，背到考研。"
    // bar 9 (G) 3.75: cards flick 1 per beat; bar 10 5.625: title 1, 2 per beat; bar 11 (Am) 7.5: title 2, eighths
    // bar 12 9.375: sixteenths, the city fills; 10.0: the title shatters; 10.625: last windows light, still for a beat
    var tEv = TX('evidence', 0.3125, 10.0);
    var T_LAND = 0, T_FL1 = S16, T_EV = tEv.in, T_EV_OUT = tEv.out;
    var LABELS = ['小学', '初中', '高中', '大学', '考研'];
    var T_ROW = LABELS.map(function (s, i) { return TX(s, B(i + 1), 7.4).in; });
    var T_LAB_OUT = TX('小学', 0.625, 7.4).out;
    var tLine = TX('从小学，背到考研。', B(3), 5.4);
    var T_LINE = tLine.in, T_LINE_OUT = tLine.out;
    var T_PHONE = B(5), T_PHONE_OUT = B(16);
    var T_T1 = TX('你背过的单词，', B(9), B(16)).in, T_T2 = TX('后来都去哪了？', B(12), B(16)).in;
    var T_BREAK = B(16), T_FULL = B(17);
    var FREEZE = T_FULL;                                                                // still frame after this
    var PULL_T = B(6);                                                                  // the pull back ends on bar 9

    var eN = function (t) { return clamp((u.energy(Math.min(t, FREEZE), 0.3) - 0.17) / 0.12, 0, 1); };

    // ================= the near layer: five districts (world px = screen px at camera rest) =================
    var BASE = 860, WW = 44, WH = 17, CG = 8, FP = 27, MG = 10;
    function bw(c, mg) { return 2 * mg + c * WW + (c - 1) * CG; }
    var DIST = [
      { name: '小学', b: [{ c: 1, h: 176, deco: 'flag' }, { c: 2, h: 206, deco: 'clock' }] },
      { name: '初中', b: [{ c: 2, h: 250 }, { c: 1, h: 294, deco: 'tank' }, { c: 1, h: 268 }] },
      { name: '高中', b: [{ c: 1, h: 322 }, { c: 2, h: 356, deco: 'antenna' }, { c: 1, h: 334, deco: 'tank' }] },
      { name: '大学', b: [{ c: 2, h: 392, deco: 'dome' }, { c: 1, h: 436, deco: 'bell' }, { c: 1, h: 408 }] },
      { name: '考研', b: [{ c: 1, h: 474, deco: 'antenna' }, { c: 4, h: 560, deco: 'spire', ev: true, mg: 18 }, { c: 1, h: 506, deco: 'setback' }] }
    ];
    var NEAR = [], WINS = [];
    (function () {
      var x = 522;
      DIST.forEach(function (ds, di) {
        ds.x0 = x;
        ds.b.forEach(function (bd, bi) {
          var mg = bd.mg || MG, w = bw(bd.c, mg);
          NEAR.push({ di: di, x: x, w: w, h: bd.h, top: BASE - bd.h, deco: bd.deco || '', ev: !!bd.ev, mg: mg, cols: bd.c,
            t0: bd.ev ? -10 : T_ROW[di] + bi * 0.05, wins: [] });
          x += w + 5;
        });
        ds.x1 = x - 5; ds.cx = (ds.x0 + ds.x1) / 2;
        x += 15;
      });
    })();
    var EVB = NEAR.filter(function (b) { return b.ev; })[0];
    var EVW = { x: EVB.x + 18, y: EVB.top + 24, w: EVB.w - 36, h: 72 };              // the panorama window (evidence)
    var WP = { x: EVW.x + EVW.w / 2, y: EVW.y + EVW.h / 2 };

    function decoPath(b, p) {
      var x0 = b.x, w = b.w, top = b.top, cx = x0 + w / 2;
      function tri(a, bb, c) { p.moveTo(a[0], a[1]); p.lineTo(bb[0], bb[1]); p.lineTo(c[0], c[1]); p.closePath(); }
      switch (b.deco) {
        case 'flag': { var px = x0 + w * 0.7; p.rect(px, top - 50, 2.4, 50); tri([px + 2, top - 50], [px + 24, top - 44], [px + 2, top - 38]); break; }
        case 'clock': p.rect(cx - 16, top - 40, 32, 40); tri([cx - 21, top - 40], [cx, top - 68], [cx + 21, top - 40]); p.rect(cx - 1, top - 80, 2, 14); break;
        case 'tank': { var tx = x0 + w * 0.28; p.rect(tx, top - 28, 26, 18); tri([tx - 2, top - 28], [tx + 13, top - 38], [tx + 28, top - 28]); p.rect(tx + 3, top - 10, 2.4, 10); p.rect(tx + 20, top - 10, 2.4, 10); break; }
        case 'antenna': { var ax = x0 + w * 0.62; p.rect(ax, top - 66, 2.2, 66); p.rect(ax - 7, top - 46, 16, 2); p.rect(ax - 4, top - 32, 10, 2); p.rect(x0 + 8, top - 12, w - 16, 12); break; }
        case 'dome': p.rect(cx - 36, top - 12, 72, 12); p.moveTo(cx - 31, top - 12); p.arc(cx, top - 12, 31, Math.PI, 0); p.closePath(); p.rect(cx - 4, top - 52, 8, 10); p.rect(cx - 1, top - 64, 2, 13); break;
        case 'bell': p.rect(cx - 15, top - 48, 30, 48); tri([cx - 19, top - 48], [cx, top - 84], [cx + 19, top - 48]); break;
        case 'spire': p.rect(x0 + 22, top - 22, w - 44, 22); p.rect(x0 + 62, top - 40, w - 124, 18); tri([cx - 6, top - 40], [cx, top - 156], [cx + 6, top - 40]); break;
        case 'setback': p.rect(x0 + 8, top - 26, w - 16, 26); p.rect(cx - 1, top - 70, 2.2, 44); break;
      }
    }
    NEAR.forEach(function (b) {
      var p = new Path2D(); p.rect(b.x, b.top, b.w, BASE + 420 - b.top); decoPath(b, p); b.path = p;
      var dp = new Path2D(); decoPath(b, dp); b.decoP = dp;
      var rp = new Path2D(); rp.moveTo(b.x, b.top); rp.lineTo(b.x + b.w, b.top); b.roof = rp;
      var sp = new Path2D(); sp.moveTo(b.x, b.top); sp.lineTo(b.x, BASE); sp.moveTo(b.x + b.w, b.top); sp.lineTo(b.x + b.w, BASE); b.sides = sp;
      // windows: a grid of word slots
      var y0 = b.top + (b.ev ? 24 + 72 + 16 : 24);
      for (var y = y0; y + WH <= BASE - 16; y += FP) for (var c = 0; c < b.cols; c++) {
        var w = { b: b, x: b.x + b.mg + c * (WW + CG), y: y, ton: Infinity, kind: 0 };
        b.wins.push(w); WINS.push(w);
      }
    });

    // grid helpers: every light switches on exactly on a 16th of the music
    function on16(x) { return Math.ceil(x / S16 - 1e-6) * S16; }

    // ================= far and middle layers (generated skylines) =================
    var LAYERS = [
      { d: 0.2, seed: 's02-far', w: [24, 80], h: [70, 236], base: 838, fill: '#141d38', rim: 'rgba(110,138,200,.30)', lw: 2.0, lh: 2.6, sx: 6, sy: 8, occ: 0.40, mg: 4, cols: ['#7fa6e0', '#a9c8ff', '#6f8fc8'], a: [0.22, 0.55] },
      { d: 0.45, seed: 's02-mid2', w: [32, 100], h: [96, 300], base: 848, fill: '#0f1731', rim: 'rgba(100,128,192,.34)', lw: 3.0, lh: 4.0, sx: 8.5, sy: 11, occ: 0.40, mg: 5, cols: ['#7fa6e0', '#a9c8ff', '#cfe6ff'], a: [0.26, 0.62] },
      { d: 0.7, seed: 's02-mid', w: [42, 128], h: [130, 360], base: 856, fill: '#0b1227', rim: 'rgba(96,124,190,.40)', lw: 4.6, lh: 6.2, sx: 11.5, sy: 14.5, occ: 0.38, mg: 7, cols: ['#7fa6e0', '#a9c8ff', '#cfe6ff'], a: [0.32, 0.72] }
    ];
    LAYERS.forEach(function (L, li) {
      var R = u.rand(L.seed), N = u.makeNoise(L.seed), x = -140, path = new Path2D(), rim = new Path2D(), lights = [];
      L.blds = [];
      while (x < 2070) {
        var w = R.range(L.w[0], L.w[1]);
        var env = 0.5 + 0.5 * N.noise2(x * 0.0036, li * 3.1);
        var h = lerp(L.h[0], L.h[1], clamp(env * 0.85 + 0.25 * R(), 0, 1));
        var top = L.base - h;
        path.rect(x, top, w, 420 + h); rim.moveTo(x, top); rim.lineTo(x + w, top);
        if (R() < 0.18 && w > 40) { var bh = R.range(8, 22); path.rect(x + w * 0.3, top - bh, w * 0.4, 24); rim.moveTo(x + w * 0.3, top - bh); rim.lineTo(x + w * 0.7, top - bh); }   // rooftop box
        if (R() < 0.12) path.rect(x + w * R.range(0.3, 0.7), top - R.range(18, 46), 1.6 + L.d, 46);     // antenna
        var occB = L.occ * R.range(0.55, 1.35);
        for (var yy = top + L.mg + 2; yy + L.lh < L.base - 4; yy += L.sy) for (var xx = x + L.mg; xx + L.lw < x + w - L.mg + 0.1; xx += L.sx) {
          if (R() > occB) continue;
          var r = R(), ton;
          if (r < 0.22) ton = on16(0.9 + 2.8 * R());                               // early twinkle while the camera pulls
          else if (r < 0.66) ton = on16(PULL_T + (T_BREAK - PULL_T - 0.01) * Math.pow(R(), 0.6));   // fills in faster and faster
          else ton = T_FULL;                                                        // the rest: the last beat
          lights.push({ x: xx, y: yy, ton: ton, a: R.range(L.a[0], L.a[1]), c: Math.floor(R() * L.cols.length) });
        }
        L.blds.push({ x: x, w: w, top: top });
        x += w + R.range(-10, 9);
      }
      lights.sort(function (a, b) { return a.c - b.c; });
      L.path = path; L.rimP = rim; L.lights = lights;
    });

    // ================= card flicks (heroes): 1 per beat, then 2 per beat, eighths, sixteenths =================
    var SW = [];
    [6, 7, 8].forEach(function (n) { SW.push({ t: B(n), fl: BEAT, ls: 0.42, ph: 1 }); });                 // bar 9
    for (var i = 0; i < 6; i++) SW.push({ t: B(9 + i * 0.5), fl: 2 * S16, ls: 0.28, ph: 2 });             // bar 10
    for (i = 0; i < 6; i++) SW.push({ t: B(12 + i * 0.5), fl: 2 * S16, ls: 0.26, ph: 3 });                // bar 11
    for (i = 0; i < 4; i++) SW.push({ t: B(15 + i * 0.25), fl: S16, ls: 0.13, ph: 4 });                   // bar 12, beat 1
    var Rw = u.rand('s02-wins');
    var order = Rw.shuffle(WINS.slice());
    function takeWin(pred) {
      for (var k = 0; k < order.length; k++) { var w = order[k]; if (w.kind === 0 && pred(w)) { w.kind = 1; return w; } }
      return null;
    }
    // the first five cards land in 小学, 初中, 高中, 大学, 考研: words from every stage of school
    SW.forEach(function (s, k) {
      s.land = s.t + s.fl;
      s.word = CARDS[k % CARDS.length];
      var w = k < 5 ? takeWin(function (w) { return w.b.di === k && !w.b.ev && w.y < w.b.top + 30 + FP * 2; })
        : takeWin(function (w) { return true; });
      if (!w) w = takeWin(function () { return true; });
      s.win = w; w.ton = s.land; w.flash = 1.7; w.kind = 1;
    });
    WINS.forEach(function (w) { w.lvl = Rw.range(0.66, 1.0); w.hue = Math.floor(Rw() * 4); });

    // ================= camera: one pure function of t, shared by canvases and DOM =================
    // close-up (2x) on the first window, pulled back with a fast release (expo.out) so that the districts are in
    // frame when they rise on beats 2 to 6; settled on bar 9, then a very slow retreat to 0.96 until the last beat.
    var C0 = { x: 960, y: 540 };
    var DOT0 = { x: 1336, y: 262 };          // s01 hands the motif dot over here (screen px)
    var Q0 = { x: 1336, y: 336 };            // where the evidence window sits on screen at the cut (fixed below)
    var ePull = E('expo.out');
    function pullS(t) { return ePull(seg(t, 0, PULL_T)); }
    function retreat(t) { return 1 - 0.04 * eSine(seg(t, PULL_T, T_FULL)); }
    var camN = u.makeNoise('s02cam');
    var camT = NaN, camC = {};
    function cam(t, d) {
      if (t !== camT) { camT = t; camC = {}; }
      var key = d.toFixed(3);
      if (camC[key]) return camC[key];
      var S = pullS(t), s = 2 - S;
      var sd = 1 + (s - 1) * d;
      var qx = Q0.x + (WP.x - Q0.x) * S, qy = Q0.y + (WP.y - Q0.y) * S;
      var qdx = WP.x + (qx - WP.x) * d, qdy = WP.y + (qy - WP.y) * d;
      var ox = qdx - WP.x * sd, oy = qdy - WP.y * sd;
      var live = seg(t, 2.5, PULL_T) * (1 - seg(t, T_FULL - 0.8, T_FULL));
      var r = retreat(t) * (1 + 0.003 * (eN(t) - 0.5) * live), rd = 1 + (r - 1) * d;
      ox = C0.x + (ox - C0.x) * rd; oy = C0.y + (oy - C0.y) * rd; sd *= rd;
      ox += 2.4 * live * camN.noise2(t * 0.21, 1.7) * d; oy += 1.5 * live * camN.noise2(3.3, t * 0.19) * d;
      var c = { s: sd, ox: ox, oy: oy };
      camC[key] = c; return c;
    }
    function mp(c, x, y) { return [c.ox + x * c.s, c.oy + y * c.s]; }
    // rows rise from below the horizon (back.out: a small spring at the top), half a second, on their beat
    function riseOff(b, t) { return b.t0 < 0 ? 0 : (1 - eBack(seg(t, b.t0, b.t0 + 0.5))) * (b.h + 170); }

    // ================= layers (bottom to top) =================
    u.el('div', { cls: 'fill', parent: root, style: { background: 'linear-gradient(180deg, #03060e 0%, #060b18 30%, #0a1020 55%, #111b38 76%, #0a1020 100%)' } });
    // CSS radial-gradient(ellipse rx ry at cx cy, stops) drawn on a canvas (pure function of t, no compositor history)
    function ellGrad(g, cx, cy, rx, ry, stops, alpha) {
      if (alpha <= 0.0005) return;
      g.save(); g.globalAlpha = alpha; g.translate(cx, cy); g.scale(rx, ry);
      var gr = g.createRadialGradient(0, 0, 0, 0, 0, 1);
      stops.forEach(function (st) { gr.addColorStop(st[0], st[1]); });
      g.fillStyle = gr; g.fillRect(-cx / rx - 0.01, -cy / ry - 0.01, W / rx + 0.02, H / ry + 0.02);
      g.restore();
    }
    var BG01 = [[0, '#141d38'], [0.55, '#0a1020'], [1, '#080c18']];

    // ---- s01's word dust, continued (same seed, same drift, same camera), fading into faint stars ----
    var Rd = u.rand('s01-dust'), DUST = [];
    function addDust(n, d, kindDash, rr, aa) {
      for (var i = 0; i < n; i++) {
        var dash = kindDash && Rd() < 0.42;
        DUST.push({
          x: Rd.range(-60, W + 60), y: Rd.range(-60, H + 60), d: d,
          vx: Rd.range(-5, 5) * (0.4 + d), vy: Rd.range(-7, -1) * (0.4 + d),
          r: Rd.range(rr[0], rr[1]), a: Rd.range(aa[0], aa[1]), dash: dash, len: dash ? Rd.range(4, 12) : 0,
          ph: Rd() * 6.283, fq: Rd.range(0.15, 0.6), wph: Rd() * 6.283, col: d < 0.3 ? (Rd() < 0.75 ? 0 : 1) : (Rd() < 0.5 ? 1 : 2)
        });
      }
    }
    addDust(2100, 0.2, false, [0.45, 1.05], [0.18, 0.55]);
    addDust(760, 0.5, true, [0.8, 1.6], [0.2, 0.52]);
    DUST.sort(function (a, b) { return a.col - b.col; });
    var DCOLS = ['#7fa6e0', '#a9c8ff', '#cfe6ff'], S01_D = ctx.start;
    var starCv = u.canvas(root, function (g, t) {
      var tf = Math.min(t, FREEZE), T1 = S01_D + tf, M = 60, en = eN(t), zoom = 1.04 + 0.003 * (en - 0.5);
      var c0 = cam(0, 0.12), c = cam(t, 0.12);
      var fade = lerp(0.35, 0.15, seg(t, 0.2, 2.5, eSine));
      var eB = 0.8 + 0.45 * en;
      ellGrad(g, 0.66 * W, 0.30 * H, 0.75 * W, 0.70 * H, BG01, 1 - eSine(seg(t, 0.2, 2.2)));     // s01's background, fading
      var dp = dotPos(t), db = dotB(t), litK = Math.min(1.3, db) * (1 - seg(t, 0.1, 0.9));
      // s01's haze around the dot, gone once the dot is in its window
      if (litK > 0.01) {
        var hz = g.createRadialGradient(dp[0], dp[1], 0, dp[0], dp[1], 430);
        hz.addColorStop(0, 'rgba(70,110,190,' + (0.11 * Math.min(db, 1.6) * (1 - seg(t, 0.1, 0.9))).toFixed(4) + ')');
        hz.addColorStop(1, 'rgba(70,110,190,0)');
        g.fillStyle = hz; g.fillRect(dp[0] - 430, dp[1] - 430, 860, 860);
      }
      g.globalCompositeOperation = 'lighter';
      var lastCol = -1;
      for (var i = 0; i < DUST.length; i++) {
        var p = DUST[i];
        var bx = ((p.x + p.vx * T1 + Math.sin(p.wph + T1 * 0.31) * 6) % (W + 2 * M) + (W + 2 * M)) % (W + 2 * M) - M;
        var by = ((p.y + p.vy * T1 + Math.cos(p.wph * 1.3 + T1 * 0.27) * 5) % (H + 2 * M) + (H + 2 * M)) % (H + 2 * M) - M;
        var sS = 1 + (zoom - 1) * p.d;
        var sx = 960 + (bx - 960) * sS - 18 * p.d, sy = 540 + (by - 540) * sS + 10 * p.d;
        var X = c.ox + (sx - c0.ox) / c0.s * c.s, Y = c.oy + (sy - c0.oy) / c0.s * c.s;
        var ddx = X - dp[0], ddy = Y - dp[1], lit = litK > 0.01 ? Math.exp(-(ddx * ddx + ddy * ddy) / 26000) * litK : 0;
        var tw = 0.65 + 0.35 * Math.sin(p.ph + T1 * p.fq * 6.283);
        var al = clamp((p.a * tw * eB + lit * (p.d < 0.3 ? 0.55 : 0.8)) * fade, 0, 1);
        if (al < 0.01) continue;
        if (p.col !== lastCol) { g.fillStyle = DCOLS[p.col]; lastCol = p.col; }
        g.globalAlpha = al;
        var rr = p.r * (1 + 0.7 * lit) * Math.sqrt(c.s / c0.s);
        if (p.dash) g.fillRect(X - p.len / 2, Y - rr * 0.45, p.len, rr * 0.9);
        else { g.beginPath(); g.arc(X, Y, rr, 0, 6.2832); g.fill(); }
      }
      g.globalAlpha = 1; g.globalCompositeOperation = 'source-over';
    });

    // ---- the city canvas ----
    var GLOW = (function () {                       // soft cold window glow sprite
      var s = 64 * dpr, c = document.createElement('canvas'); c.width = c.height = s;
      var g = c.getContext('2d'), gr = g.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2);
      gr.addColorStop(0, 'rgba(150,190,255,0.9)'); gr.addColorStop(0.25, 'rgba(127,166,224,0.45)'); gr.addColorStop(0.6, 'rgba(110,150,220,0.12)'); gr.addColorStop(1, 'rgba(110,150,220,0)');
      g.fillStyle = gr; g.fillRect(0, 0, s, s); return c;
    })();
    var PANE = [[168, 200, 255], [127, 166, 224], [207, 230, 255], [150, 184, 240]].map(function (c) {
      var cv = document.createElement('canvas'), R2 = dpr * 1.3; cv.width = Math.ceil(WW * R2); cv.height = Math.ceil(WH * R2);
      var g = cv.getContext('2d'); g.scale(R2, R2);
      var gr = g.createLinearGradient(0, 0, 0, WH);
      function m(k, a) { return 'rgba(' + Math.round(c[0] + (255 - c[0]) * k) + ',' + Math.round(c[1] + (255 - c[1]) * k) + ',' + Math.round(c[2] + (255 - c[2]) * k) + ',' + a + ')'; }
      gr.addColorStop(0, m(0.42, 1)); gr.addColorStop(0.5, m(0.12, 1)); gr.addColorStop(1, m(0, 0.92));
      g.fillStyle = gr; g.fillRect(0, 0, WW, WH);
      var hz = g.createRadialGradient(WW / 2, WH * 0.45, 0, WW / 2, WH * 0.45, WW * 0.55);
      hz.addColorStop(0, 'rgba(255,255,255,.28)'); hz.addColorStop(1, 'rgba(255,255,255,0)');
      g.fillStyle = hz; g.fillRect(0, 0, WW, WH);
      g.fillStyle = 'rgba(255,255,255,.45)'; g.fillRect(0, 0, WW, 0.8);
      g.strokeStyle = 'rgba(30,48,92,.35)'; g.lineWidth = 0.8; g.strokeRect(0.4, 0.4, WW - 0.8, WH - 0.8);
      return cv;
    });
    // window-word atlas (dark ink on the lit pane): the card words go to the windows they land in
    SW.forEach(function (s) { if (s.win) s.win.word = s.word; });
    var AR = dpr * 1.3, ACOLS = 24, atlas = document.createElement('canvas');
    (function () {
      var rows = Math.ceil(WINS.length / ACOLS);
      atlas.width = Math.ceil(ACOLS * WW * AR); atlas.height = Math.ceil(rows * WH * AR);
      var ag = atlas.getContext('2d'); ag.scale(AR, AR); ag.textAlign = 'center'; ag.textBaseline = 'middle'; ag.fillStyle = '#0a1430';
      var words = u.rand('s02-winwords').shuffle(WIN.slice());
      WINS.forEach(function (w, i) {
        var word = w.word || words[i % words.length], fs = 11.6;
        ag.font = '400 ' + fs + 'px "Source Serif 4 Display"';
        var mw = ag.measureText(word).width;
        if (mw > WW - 6) { fs = Math.max(8.6, fs * (WW - 6) / mw); ag.font = '400 ' + fs.toFixed(2) + 'px "Source Serif 4 Display"'; }
        var cx = (i % ACOLS) * WW + WW / 2, cy = Math.floor(i / ACOLS) * WH + WH / 2 + 0.6;
        ag.fillText(word, cx, cy);
        w.ax = (i % ACOLS) * WW * AR; w.ay = Math.floor(i / ACOLS) * WH * AR; w.word = word;
      });
    })();

    function winBright(w, t) {
      if (t < w.ton) return 0;
      var x = Math.min(t, FREEZE + 0.6) - w.ton;
      return (x < 0.04 ? x / 0.04 : 1) * w.lvl * (1 + w.flash * Math.exp(-x / 0.24));
    }

    var nearGrad = null, groundGrad = null;
    var cityCv = u.canvas(root, function (g, t) {
      var en = eN(t), eMul = 0.82 + 0.36 * en;
      if (!nearGrad) {
        nearGrad = g.createLinearGradient(0, 160, 0, BASE);
        nearGrad.addColorStop(0, '#0e172d'); nearGrad.addColorStop(0.55, '#0a1124'); nearGrad.addColorStop(1, '#060a16');
        groundGrad = g.createLinearGradient(0, BASE, 0, BASE + 240);
        groundGrad.addColorStop(0, '#0b1224'); groundGrad.addColorStop(0.08, '#070c19'); groundGrad.addColorStop(1, '#03050b');
      }
      var litFar = seg(t, 0.8, T_FULL) * 0.7 + 0.3 * seg(t, T_FULL, T_FULL + 0.2);
      // horizon glow (light pollution grows as the city lights up)
      var ch = cam(t, 0.15);
      g.setTransform(dpr * ch.s, 0, 0, dpr * ch.s, dpr * ch.ox, dpr * ch.oy);
      var hg = g.createLinearGradient(0, 520, 0, 880);
      var ha = 0.10 + 0.22 * litFar + 0.14 * seg(t, T_BREAK, T_FULL + 0.15, eSine);
      hg.addColorStop(0, 'rgba(48,74,140,0)'); hg.addColorStop(0.7, 'rgba(56,86,160,' + (ha * 0.8).toFixed(3) + ')'); hg.addColorStop(1, 'rgba(70,104,180,' + ha.toFixed(3) + ')');
      g.fillStyle = hg; g.fillRect(-600, 520, 3200, 360);

      // far and middle layers
      for (var li = 0; li < LAYERS.length; li++) {
        var L = LAYERS[li], c = cam(t, L.d);
        g.setTransform(dpr * c.s, 0, 0, dpr * c.s, dpr * c.ox, dpr * c.oy);
        g.fillStyle = L.fill; g.fill(L.path);
        g.strokeStyle = L.rim; g.lineWidth = 1.2 / c.s; g.stroke(L.rimP);
        var lastC = -1, ls = L.lights;
        for (var k = 0; k < ls.length; k++) {
          var q = ls[k]; if (t < q.ton) continue;
          var on = Math.min(1, (Math.min(t, FREEZE + 0.6) - q.ton) / 0.12);
          if (q.c !== lastC) { g.fillStyle = L.cols[q.c]; lastC = q.c; }
          g.globalAlpha = q.a * on * (0.88 + 0.2 * en);
          g.fillRect(q.x, q.y, L.lw, L.lh);
        }
        g.globalAlpha = 1;
        // mist at the base of the layer
        var mg = g.createLinearGradient(0, L.base - 120, 0, L.base + 10);
        mg.addColorStop(0, 'rgba(24,38,72,0)'); mg.addColorStop(0.75, 'rgba(26,42,80,' + (0.30 + 0.06 * li) + ')'); mg.addColorStop(1, 'rgba(22,36,70,' + (0.55 + 0.05 * li) + ')');
        g.fillStyle = mg; g.fillRect(-400, L.base - 120, 2900, 130);
        // drifting wisps
        var tw = Math.min(t, FREEZE);
        for (var m = 0; m < 3; m++) {
          var wx = ((m * 820 + li * 330 + tw * (6 + 3 * m) * (li % 2 ? -1 : 1)) % 2800 + 2800) % 2800 - 400, wy = L.base - 40 - 14 * m;
          g.save(); g.translate(wx, wy); g.scale(1, 0.14);
          var wg = g.createRadialGradient(0, 0, 0, 0, 0, 420);
          wg.addColorStop(0, 'rgba(60,90,150,' + (0.09 + 0.02 * li) + ')'); wg.addColorStop(1, 'rgba(60,90,150,0)');
          g.fillStyle = wg; g.fillRect(-420, -420, 840, 840); g.restore();
        }
      }

      // near layer: the five districts
      var cN = cam(t, 1), s = cN.s;
      for (var bi = 0; bi < NEAR.length; bi++) {
        var b = NEAR[bi], off = riseOff(b, t);
        b.litNow = null;
        if (off >= b.h + 160) continue;
        g.setTransform(dpr * s, 0, 0, dpr * s, dpr * cN.ox, dpr * (cN.oy + off * s));
        g.fillStyle = nearGrad; g.fill(b.path);
        g.lineWidth = 1.0 / s; g.strokeStyle = 'rgba(80,106,170,.16)'; g.stroke(b.sides);
        g.strokeStyle = 'rgba(96,124,190,.36)'; g.stroke(b.decoP);
        g.lineWidth = 1.5 / s; g.strokeStyle = 'rgba(130,162,226,.55)'; g.stroke(b.roof);
        // unlit panes
        g.fillStyle = '#0f1730'; g.beginPath();
        var lit = [];
        for (var wi = 0; wi < b.wins.length; wi++) {
          var w = b.wins[wi], br = winBright(w, t);
          if (br > 0.002) lit.push(w, br); else g.rect(w.x, w.y, WW, WH);
        }
        g.fill();
        // lit panes, words, flash
        for (var li2 = 0; li2 < lit.length; li2 += 2) {
          var lw = lit[li2], lb = lit[li2 + 1];
          g.globalAlpha = Math.min(1, lb) * 0.96; g.drawImage(PANE[lw.hue], lw.x, lw.y, WW, WH);
          if (lb > 1.02) { g.globalAlpha = Math.min(1, (lb - 1) * 0.55); g.fillStyle = '#f4f9ff'; g.fillRect(lw.x, lw.y, WW, WH); }
          g.globalAlpha = 0.74 * Math.min(1, lb);
          g.drawImage(atlas, lw.ax, lw.ay, WW * AR, WH * AR, lw.x, lw.y, WW, WH);
        }
        // the clock face of the school
        if (b.deco === 'clock') {
          var ck = seg(t, b.t0 + 0.3125, b.t0 + 0.47);
          if (ck > 0) {
            var cx0 = b.x + b.w / 2, cy0 = b.top - 22;
            g.globalAlpha = ck * 0.9; g.fillStyle = '#cfe6ff'; g.beginPath(); g.arc(cx0, cy0, 8.5, 0, 6.2832); g.fill();
            g.globalAlpha = ck; g.strokeStyle = '#1a2850'; g.lineWidth = 1.6; g.beginPath(); g.moveTo(cx0, cy0); g.lineTo(cx0, cy0 - 6); g.moveTo(cx0, cy0); g.lineTo(cx0 + 4.5, cy0 + 1.5); g.stroke();
          }
        }
        // glow of the lit windows
        g.globalCompositeOperation = 'lighter';
        for (var li3 = 0; li3 < lit.length; li3 += 2) {
          var gw = lit[li3], gb = lit[li3 + 1];
          g.globalAlpha = clamp(0.17 * Math.min(gb, 2.4) * eMul, 0, 1);
          g.drawImage(GLOW, gw.x + WW / 2 - WW * 1.7, gw.y + WH / 2 - WH * 3.4, WW * 3.4, WH * 6.8);
          g.globalAlpha = clamp(0.16 * Math.min(gb, 2.4) * eMul, 0, 1);
          g.drawImage(GLOW, gw.x + WW / 2 - WW * 0.85, gw.y + WH / 2 - WH * 1.4, WW * 1.7, WH * 2.8);
        }
        g.globalCompositeOperation = 'source-over'; g.globalAlpha = 1;
        b.litNow = lit;
      }

      g.setTransform(dpr * s, 0, 0, dpr * s, dpr * cN.ox, dpr * cN.oy);
      var nLit = 0; for (var bk = 0; bk < NEAR.length; bk++) if (NEAR[bk].litNow && riseOff(NEAR[bk], t) < NEAR[bk].h) nLit += NEAR[bk].litNow.length / 2;
      var frac = nLit / WINS.length;
      if (frac > 0.01) {
        g.globalCompositeOperation = 'lighter';
        g.save(); g.translate(1240, 640); g.scale(1, 0.42);
        var cb = g.createRadialGradient(0, 0, 0, 0, 0, 900);
        cb.addColorStop(0, 'rgba(96,136,214,' + (0.16 * frac * eMul).toFixed(4) + ')'); cb.addColorStop(0.55, 'rgba(80,118,200,' + (0.07 * frac * eMul).toFixed(4) + ')'); cb.addColorStop(1, 'rgba(80,118,200,0)');
        g.fillStyle = cb; g.fillRect(-900, -900, 1800, 1800); g.restore();
        g.globalCompositeOperation = 'source-over';
      }
      // low mist in front of the bases
      var lm = g.createLinearGradient(0, BASE - 70, 0, BASE + 4);
      lm.addColorStop(0, 'rgba(30,46,86,0)'); lm.addColorStop(1, 'rgba(34,52,96,0.32)');
      g.fillStyle = lm; g.fillRect(-400, BASE - 70, 2900, 74);
      // the street
      g.fillStyle = groundGrad; g.fillRect(-600, BASE, 3200, 700);
      g.globalAlpha = 0.5 + 0.3 * litFar; g.fillStyle = 'rgba(120,160,232,0.35)'; g.fillRect(-600, BASE, 3200, 1.3);
      // wet-street reflections of the lit windows
      g.globalCompositeOperation = 'lighter';
      for (var bj = 0; bj < NEAR.length; bj++) {
        var nb = NEAR[bj], ll = nb.litNow; if (!ll || riseOff(nb, t) > 1) continue;
        for (var r2 = 0; r2 < ll.length; r2 += 2) {
          var rw = ll[r2], rb = ll[r2 + 1], ry = BASE + 8 + (BASE - rw.y) * 0.2;
          g.globalAlpha = clamp(0.11 * Math.min(rb, 2) * eMul, 0, 1);
          g.drawImage(GLOW, rw.x + WW * 0.18, ry - WH * 0.9, WW * 0.64, WH * 2.6);
        }
      }
      // district base lines: a line of light sweeps out when the row lands (an eighth after its beat)
      for (var di = 0; di < DIST.length; di++) {
        var ds = DIST[di], tb0 = T_ROW[di] + 2 * S16, sp = seg(t, tb0, tb0 + 0.5, eExpo);
        if (sp <= 0) continue;
        var half = (ds.x1 - ds.x0) / 2 + 10, a0 = 0.16 + 0.75 * Math.exp(-Math.max(0, Math.min(t, FREEZE) - tb0) / 0.45);
        g.globalAlpha = a0; g.fillStyle = 'rgba(169,200,255,0.9)';
        g.fillRect(ds.cx - half * sp, BASE - 1.2, 2 * half * sp, 2.4);
        g.globalAlpha = a0 * 0.5;
        g.drawImage(GLOW, ds.cx - half * sp, BASE - 18, 2 * half * sp, 36);
      }
      g.globalAlpha = 1; g.globalCompositeOperation = 'source-over';
    });

    // ---- the evidence window on its own canvas: it is lit by the dot on the very first frame ----
    var evCv = u.canvas(root, function (g, t) {
      var c = cam(t, 1);
      g.setTransform(dpr * c.s, 0, 0, dpr * c.s, dpr * c.ox, dpr * c.oy);
      drawEvWindow(g, t, c.s);
    });

    // ================= evidence: the word, its ı, its window =================
    var nearDom = u.el('div', { cls: 'fill', parent: root, style: { transformOrigin: '0 0' } });
    var LET = ['e', 'v', 'ı', 'd', 'e', 'n', 'c', 'e'];
    var evHtml = LET.map(function (ch, i) { return (i === 2 ? '<span class="s02mk" style="display:inline-block;width:0;height:0"></span>' : '') + ch; }).join('');
    var ev = u.text(nearDom, '', 'en', { x: WP.x, y: WP.y + 1, html: evHtml, style: { fontSize: '56px', color: '#eef5ff', letterSpacing: '0.01em' } });
    ev.style.opacity = 0;
    var TT = { x: WP.x, y: WP.y - 18 }, TR = 2.9, DOT_R01 = 7;
    (function measure() {
      // where the tittle of a real "i" would be (s01 does the same at 140 px): the motif dot goes exactly there
      function tittle(font, S, ox, oy) {
        function ink(ch) { var c = document.createElement('canvas'); c.width = c.height = S; var g = c.getContext('2d', { willReadFrequently: true }); g.font = font; g.fillStyle = '#fff'; g.fillText(ch, ox, oy); return g.getImageData(0, 0, S, S).data; }
        var a = ink('i'), b = ink('ı'), sx = 0, sy = 0, n = 0, x0 = 1e9, x1 = -1e9;
        for (var y = 0; y < S; y++) for (var x = 0; x < S; x++) { var i = (y * S + x) * 4 + 3, dl = a[i] - b[i]; if (dl > 60) { sx += x * dl; sy += y * dl; n += dl; if (x < x0) x0 = x; if (x > x1) x1 = x; } }
        return n > 0 ? { x: sx / n - ox, y: sy / n - oy, r: (x1 - x0 + 1) / 2 } : null;
      }
      var t01 = tittle('italic 400 140px "Source Serif 4 Display"', 400, 100, 300);
      if (t01) DOT_R01 = Math.max(5.5, Math.min(9, t01.r));
      var t56 = tittle('italic 400 56px "Source Serif 4 Display"', 200, 50, 150);
      var mk = ev.querySelector('.s02mk'), er = ev.getBoundingClientRect(), mr = mk.getBoundingClientRect();
      var k = er.width ? ev.offsetWidth / er.width : 1;
      var left = WP.x - ev.offsetWidth / 2, topY = WP.y + 1 - ev.offsetHeight / 2;
      if (t56) { TT.x = left + (mr.left - er.left) * k + t56.x; TT.y = topY + (mr.top - er.top) * k + t56.y; TR = Math.max(2.4, t56.r); }
    })();
    // the cut: at 2x the tittle of ı sits exactly where s01 leaves the dot
    Q0.x = DOT0.x - (TT.x - WP.x) * 2; Q0.y = DOT0.y - (TT.y - WP.y) * 2;

    // a fluorescent tube: flash on the first 16th (the dot lands), dark, flash on the second, steady on the third
    function evLight(t) {
      if (t < 0) return 0;
      if (t < 0.05) return 1.25;
      if (t < T_FL1 - 0.008) return 0.06;
      if (t < T_FL1 + 0.045) return 1.05;
      if (t < T_EV - 0.008) return 0.14;
      return 1 + 0.4 * Math.exp(-(t - T_EV) / 0.12) + 0.5 * pulse(t - (T_EV_OUT - 0.3), 0.06, 0.45);
    }
    function evOpacity(t) {
      if (t < 0) return 0;
      if (t < 0.05) return 0.32;
      if (t < T_FL1) return 0;
      if (t < T_FL1 + 0.045) return 0.45;
      if (t < T_EV) return 0;
      return 1 - seg(t, T_EV_OUT - 2 * S16, T_EV_OUT);
    }
    function drawEvWindow(g, t, s) {
      var L = evLight(t); if (L <= 0) return;
      var mix = seg(t, T_EV_OUT - 0.3, T_EV_OUT + 0.4, eSine);        // glowing panel -> bright pane once the word is gone
      var x = EVW.x, y = EVW.y, w = EVW.w, h = EVW.h;
      var gr = g.createLinearGradient(0, y, 0, y + h);
      gr.addColorStop(0, 'rgba(' + Math.round(lerp(46, 150, mix)) + ',' + Math.round(lerp(72, 186, mix)) + ',' + Math.round(lerp(140, 248, mix)) + ',' + (0.62 * Math.min(L, 1.2)).toFixed(3) + ')');
      gr.addColorStop(1, 'rgba(' + Math.round(lerp(84, 190, mix)) + ',' + Math.round(lerp(122, 218, mix)) + ',' + Math.round(lerp(200, 255, mix)) + ',' + (0.8 * Math.min(L, 1.2)).toFixed(3) + ')');
      g.fillStyle = gr; g.fillRect(x, y, w, h);
      g.globalAlpha = Math.min(1, L) * (1 - 0.6 * mix); g.fillStyle = 'rgba(8,14,32,0.55)';
      g.fillRect(x + w / 3 - 1, y, 2, h); g.fillRect(x + 2 * w / 3 - 1, y, 2, h);
      g.globalAlpha = Math.min(1, L); g.strokeStyle = 'rgba(190,215,255,0.55)'; g.lineWidth = 1.4 / s; g.strokeRect(x, y, w, h);
      g.globalAlpha = 1;
      g.globalCompositeOperation = 'lighter';
      g.globalAlpha = clamp(0.5 * Math.min(L, 1.6), 0, 1);
      g.drawImage(GLOW, x - w * 0.45, y - h * 1.1, w * 1.9, h * 3.2);
      g.globalAlpha = 1; g.globalCompositeOperation = 'source-over';
    }

    // ================= labels (小学 .. 考研), positioned on the street under each district =================
    var labels = DIST.map(function (ds, di) {
      var wrap = u.el('div', { cls: 'abs', parent: root, style: { left: 0, top: 0, width: 0, height: 0 } });
      var lab = u.text(wrap, ds.name, 'small', { x: 0, y: 0, style: { color: '#c8d7f2', letterSpacing: '.18em', textShadow: '0 0 14px rgba(127,166,224,.55)' } });
      gsap.set(lab, { opacity: 0, y: 16 });
      tl.to(lab, { opacity: 1, y: 0, duration: 0.45, ease: 'power3.out' }, T_ROW[di] + 0.02);
      tl.to(lab, { opacity: 0, y: -8, duration: 0.2, ease: 'power2.in' }, T_LAB_OUT - 0.21);
      return wrap;
    });

    // ================= the learner (faceless line figure), drawn on a normal canvas =================
    var LRN = { x: 482, y: 1004, d: 1.06 };
    var headPulseT = SW.map(function (s) { return s.land; });
    function headB(t) {
      var h = 0.4, tt = Math.min(t, FREEZE + 1);
      for (var i = 0; i < headPulseT.length; i++) { var x = tt - headPulseT[i]; if (x > 0 && x < 0.6) h += 0.16 * Math.exp(-x / 0.12); }
      h += 0.35 * pulse(tt - T_FULL, 0.02, 0.3);
      return Math.min(h, 0.95);
    }
    function look(t) { return 0.5 * seg(t, T_T1 - 0.2, T_T1 + 1.0, eSine) + 0.5 * seg(t, T_BREAK, T_BREAK + 0.6, eSine); }
    var figCv = u.canvas(root, function (g, t) {
      var c = cam(t, LRN.d), p = mp(c, LRN.x, LRN.y), s = c.s;
      if (p[0] < -200 || p[1] - 300 * s > H + 50) return;
      var lk = look(t), br = Math.sin(Math.min(t, FREEZE) * 1.7) * 1.1;
      g.save(); g.translate(p[0], p[1]); g.scale(s, s);
      g.lineCap = 'round'; g.lineJoin = 'round';
      var hx = 3 + 5 * lk, hy = -237 + br * 0.6 - 3 * lk;
      // contact shadow on the street
      var sh = g.createRadialGradient(0, 0, 0, 0, 0, 46); sh.addColorStop(0, 'rgba(0,0,0,.55)'); sh.addColorStop(1, 'rgba(0,0,0,0)');
      g.save(); g.scale(1, 0.22); g.fillStyle = sh; g.fillRect(-50, -50, 100, 100); g.restore();
      // the book under the left arm (a thick word book, seen from its spine)
      g.save(); g.translate(-19, -166 + br * 0.4); g.rotate(-0.16);
      g.fillStyle = '#0d1630'; g.strokeStyle = '#cfdcf5'; g.lineWidth = 4;
      g.beginPath(); g.roundRect(-16, -33, 32, 66, 4); g.fill(); g.stroke();
      g.lineWidth = 1.6; g.strokeStyle = 'rgba(207,220,245,.6)';
      g.beginPath(); g.moveTo(-9, -24); g.lineTo(-9, 24); g.moveTo(-3, -24); g.lineTo(-3, 24); g.stroke();
      g.restore();
      g.strokeStyle = 'rgba(214,226,248,0.94)'; g.lineWidth = 6;
      g.beginPath();
      g.moveTo(hx * 0.4, hy + 25); g.lineTo(0, -198 + br);                            // neck
      g.moveTo(0, -198 + br); g.quadraticCurveTo(4, -152, -3, -108);                  // torso
      g.moveTo(-3, -108); g.lineTo(-10, -56); g.lineTo(-18, -3);                      // legs
      g.moveTo(-3, -108); g.lineTo(6, -56); g.lineTo(15, -3);
      g.moveTo(1, -190 + br); g.lineTo(17, -150 + br * 0.6); g.lineTo(21, -112);      // right arm, hanging
      g.moveTo(-1, -190 + br); g.lineTo(-27, -160 + br * 0.6); g.lineTo(-9, -134 + br * 0.4);   // left arm, holding the book
      g.stroke();
      // the head: a glowing sphere, no face
      var hb = headB(t);
      var hg = g.createRadialGradient(hx - 6, hy - 7, 2, hx, hy, 23);
      hg.addColorStop(0, 'rgba(236,244,255,' + (0.55 + 0.45 * hb).toFixed(3) + ')');
      hg.addColorStop(0.55, 'rgba(169,200,255,' + (0.45 + 0.5 * hb).toFixed(3) + ')');
      hg.addColorStop(1, 'rgba(110,150,225,' + (0.5 + 0.4 * hb).toFixed(3) + ')');
      g.fillStyle = hg; g.beginPath(); g.arc(hx, hy, 23, 0, 6.2832); g.fill();
      g.restore();
    });

    // ================= the phone (frosted glass, no brand, no small text) =================
    var phoneWrap = u.el('div', { cls: 'fill', parent: root, style: { perspective: '1500px', perspectiveOrigin: '220px 640px' } });
    var phone = u.el('div', { cls: 'abs', parent: phoneWrap, style: {
      left: '40px', top: '316px', width: '360px', height: '724px', borderRadius: '48px', transformOrigin: '50% 70%', opacity: 0,
      background: 'linear-gradient(165deg, rgba(86,112,170,.92) 0%, rgba(30,44,82,.96) 34%, rgba(14,22,44,.98) 100%)',
      boxShadow: '0 50px 120px rgba(0,0,0,.66), inset 0 0 0 2px rgba(175,205,255,.28), inset 0 2px 0 rgba(235,244,255,.24), 0 0 60px rgba(127,166,224,.10)' } });
    var scr = u.el('div', { cls: 'abs', parent: phone, style: { left: '14px', top: '14px', width: '332px', height: '696px', borderRadius: '36px', overflow: 'hidden',
      background: 'radial-gradient(ellipse 110% 70% at 50% 36%, rgba(38,60,110,.92) 0%, rgba(14,22,46,.95) 62%, rgba(8,13,28,.97) 100%)' } });
    u.el('div', { cls: 'abs', parent: scr, style: { left: '118px', top: '14px', width: '96px', height: '26px', borderRadius: '13px', background: 'rgba(2,4,10,.75)' } });
    var progTrack = u.el('div', { cls: 'abs', parent: scr, style: { left: '40px', top: '74px', width: '252px', height: '6px', borderRadius: '3px', background: 'rgba(190,212,255,.14)', overflow: 'hidden' } });
    var progFill = u.el('div', { cls: 'abs', parent: progTrack, style: { left: 0, top: 0, width: '252px', height: '6px', borderRadius: '3px', transformOrigin: '0 50%', transform: 'scaleX(0)',
      background: 'linear-gradient(90deg, #7fa6e0, #cfe6ff)', boxShadow: '0 0 10px rgba(169,200,255,.6)' } });
    var stack = u.el('div', { cls: 'abs', parent: scr, style: { left: '28px', top: '122px', width: '276px', height: '352px', perspective: '900px', perspectiveOrigin: '50% 40%' } });
    var mcv = document.createElement('canvas').getContext('2d'), CFS = {};
    function cardFont(word) { if (CFS[word]) return CFS[word]; mcv.font = '400 64px "Source Serif 4 Display"'; var w = mcv.measureText(word).width; return (CFS[word] = Math.max(46, Math.min(64, 64 * 228 / w))); }
    var slots = [0, 1, 2, 3].map(function () {
      var c = u.el('div', { cls: 'abs', parent: stack, style: { left: 0, top: 0, width: '276px', height: '352px', borderRadius: '30px', transformOrigin: '50% 100%',
        background: 'linear-gradient(162deg, rgb(78,106,164) 0%, rgb(46,66,116) 48%, rgb(38,56,104) 100%)',
        border: '1.5px solid rgba(205,226,255,.34)', boxShadow: '0 24px 50px rgba(0,0,0,.45), inset 0 1px 0 rgba(240,248,255,.30), inset 0 -40px 80px rgba(10,18,40,.25)' } });
      var word = u.el('div', { cls: 'abs', parent: c, style: { left: '138px', top: '146px', transform: 'translate(-50%,-50%)', fontFamily: '"Source Serif 4 Display"', fontWeight: 400,
        fontSize: '64px', lineHeight: '1.1', color: '#eef4ff', whiteSpace: 'pre', textShadow: '0 0 18px rgba(170,205,255,.35)' } });
      u.el('div', { cls: 'abs', parent: c, style: { left: '78px', top: '236px', width: '120px', height: '9px', borderRadius: '5px', background: 'rgba(200,220,255,.22)' } });
      u.el('div', { cls: 'abs', parent: c, style: { left: '98px', top: '262px', width: '80px', height: '9px', borderRadius: '5px', background: 'rgba(200,220,255,.15)' } });
      return { el: c, word: word, idx: -2 };
    });
    // buttons (pure shapes: a cross and a tick)
    var btnSvg = u.svgEl('svg', { width: 332, height: 120, viewBox: '0 0 332 120', class: 'fullsvg', style: 'left:0;top:520px' }, scr);
    u.svgEl('circle', { cx: 96, cy: 60, r: 36, fill: 'rgba(160,185,235,.08)', stroke: 'rgba(180,205,255,.30)', 'stroke-width': 2 }, btnSvg);
    u.svgEl('path', { d: 'M84,48 L108,72 M108,48 L84,72', stroke: 'rgba(200,220,255,.55)', 'stroke-width': 4, 'stroke-linecap': 'round', fill: 'none' }, btnSvg);
    var okRing = u.svgEl('circle', { cx: 236, cy: 60, r: 36, fill: 'rgba(127,166,224,.16)', stroke: 'rgba(190,215,255,.5)', 'stroke-width': 2 }, btnSvg);
    u.svgEl('path', { d: 'M221,61 L232,72 L253,48', stroke: '#dfeaff', 'stroke-width': 4.5, 'stroke-linecap': 'round', 'stroke-linejoin': 'round', fill: 'none' }, btnSvg);
    u.el('div', { cls: 'abs', parent: scr, style: { left: '106px', top: '676px', width: '120px', height: '6px', borderRadius: '3px', background: 'rgba(200,220,255,.35)' } });
    var CARD_C = { x: 40 + 14 + 28 + 138, y: 316 + 14 + 122 + 146 };     // word centre on screen, phone at rest

    function phonePose(t) {
      var a = seg(t, T_PHONE, T_PHONE + 0.6, eP3o), b = seg(t, T_PHONE_OUT, T_PHONE_OUT + 0.45, eP3i);
      var fl = Math.sin(Math.min(t, FREEZE) * 0.9) * 4;
      return { y: 90 * (1 - a) + 760 * b + fl, op: a * (1 - b * b), rx: 14 * (1 - a) - 16 * b, sc: 0.96 + 0.04 * a };
    }
    function swipeIndex(t) { var k = 0; while (k < SW.length && SW[k].t <= t) k++; return k; }

    // ================= the line and the title =================
    var line = u.text(root, '从小学，背到考研。', 'line', { x: 978, y: 196, style: { fontSize: '60px', color: '#d6e3fa', textShadow: '0 0 22px rgba(127,166,224,.35)' } });
    var lineCh = u.splitChars(line);
    gsap.set(lineCh, { opacity: 0, y: 30, filter: 'blur(7px)' });
    tl.to(lineCh, { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.6, ease: 'expo.out', stagger: 0.05 }, T_LINE);
    (function () {                                   // 考研 lights up with its row (beat 6)
      var cs = [lineCh[6], lineCh[7]];
      tl.to(cs, { color: '#ffffff', textShadow: '0 0 26px rgba(190,220,255,.95)', duration: 0.12, ease: 'power2.out' }, T_ROW[4]);
      tl.to(cs, { color: '#d6e3fa', textShadow: '0 0 22px rgba(127,166,224,.35)', duration: 0.9, ease: 'power2.inOut' }, T_ROW[4] + 0.16);
    })();
    tl.to(lineCh, { opacity: 0, y: -18, filter: 'blur(6px)', duration: 0.24, ease: 'power2.in', stagger: 0.015 }, T_LINE_OUT - 0.24 - 0.015 * (lineCh.length - 1) - 0.02);

    var title1 = u.text(root, '你背过的单词，', 'headline', { x: 984, y: 160, style: { fontSize: '96px', color: '#e6eefc' } });
    var title2 = u.text(root, '后来都去哪了？', 'headline', { x: 966, y: 300, style: { fontSize: '96px', color: '#e6eefc' } });
    var tc1 = u.splitChars(title1), tc2 = u.splitChars(title2);

    // measure every glyph before any tween moves it: the shards are cut from exactly these boxes
    var rr = root.getBoundingClientRect(), kk = rr.width ? W / rr.width : 1;
    var GL = tc1.concat(tc2).map(function (ch, i) {
      var r = ch.getBoundingClientRect();
      return { el: ch, line: i < tc1.length ? 0 : 1, x: (r.left - rr.left) * kk, y: (r.top - rr.top) * kk, w: r.width * kk, h: r.height * kk, text: ch.textContent };
    });
    gsap.set(tc1.concat(tc2), { opacity: 0, y: 24, filter: 'blur(8px)' });
    tl.to(tc1, { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.7, ease: 'power4.out', stagger: 0.05 }, T_T1);
    tl.to(tc2, { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.7, ease: 'power4.out', stagger: 0.05 }, T_T2);

    // ---- shatter on beat 2 of bar 12: glyphs break left to right inside one 16th; each becomes 4 or 5 shards ----
    var Rs = u.rand('s02-shards');
    var brk = GL.slice().sort(function (a, b) { return (a.x + a.w / 2) - (b.x + b.w / 2) || a.line - b.line; });
    brk.forEach(function (gl, i) { gl.tb = T_BREAK + i * (S16 / brk.length); });
    GL.forEach(function (gl) {
      tl.to(gl.el, { color: '#ffffff', textShadow: '0 0 30px rgba(210,230,255,1)', duration: 0.04, ease: 'none' }, gl.tb);
      tl.set(gl.el, { opacity: 0 }, gl.tb + 0.05);
    });
    var SHARDS = [];
    GL.forEach(function (gl) {
      // glyph raster for the shard faces
      var pad = 12, cw = Math.ceil(gl.w + 2 * pad), chh = Math.ceil(gl.h + 2 * pad), res = dpr;
      var cv = document.createElement('canvas'); cv.width = Math.ceil(cw * res); cv.height = Math.ceil(chh * res);
      var gg = cv.getContext('2d'); gg.scale(res, res);
      gg.font = '900 96px "Noto Sans SC"'; gg.fillStyle = '#f4f8ff'; gg.textBaseline = 'middle'; gg.textAlign = 'left';
      gg.shadowColor = 'rgba(170,205,255,.9)'; gg.shadowBlur = 10;
      gg.fillText(gl.text, pad, pad + gl.h / 2 + 2);
      gl.cv = cv; gl.pad = pad; gl.cw = cw; gl.chh = chh;
      var bx0 = gl.x - 4, by0 = gl.y + gl.h * 0.08, bx1 = gl.x + gl.w + 4, by1 = gl.y + gl.h * 0.95;
      var cx = lerp(bx0, bx1, Rs.range(0.38, 0.62)), cy = lerp(by0, by1, Rs.range(0.4, 0.6));
      var ring = [[bx0, by0], [lerp(bx0, bx1, Rs.range(0.35, 0.65)), by0], [bx1, by0], [bx1, by1], [lerp(bx0, bx1, Rs.range(0.35, 0.65)), by1], [bx0, by1]];
      var tris = Rs() < 0.5 ? [[0, 2], [2, 3], [3, 5], [5, 0]] : [[0, 1], [1, 2], [2, 3], [3, 5], [5, 0]];
      tris.forEach(function (tr) {
        var pts = [[cx, cy]], a = tr[0], b = tr[1];
        for (var j = a; j !== (b + 1) % 6; j = (j + 1) % 6) pts.push(ring[j]);
        var mx = 0, my = 0; pts.forEach(function (p) { mx += p[0]; my += p[1]; }); mx /= pts.length; my /= pts.length;
        var dx = mx - cx, dy = my - cy, dl = Math.sqrt(dx * dx + dy * dy) || 1;
        SHARDS.push({ gl: gl, pts: pts, mx: mx, my: my, vx: dx / dl, vy: dy / dl, spin: Rs.range(-1, 1), kick: Rs.range(18, 46), up: Rs.range(90, 200), side: Rs.range(-90, 90) });
      });
    });
    // every shard goes to one of the last dark windows, left of the title to the left of the city; all land on beat 3
    SHARDS.sort(function (a, b) { return a.mx - b.mx; });
    (function assign() {
      var dark = WINS.filter(function (w) { return w.kind === 0; }).sort(function (a, b) { return a.x - b.x || a.y - b.y; });
      var n = SHARDS.length, picked = [];
      var Rp = u.rand('s02-pick');
      for (var j = 0; j < n; j++) {
        var lo = Math.floor(j * dark.length / n), hi = Math.max(lo + 1, Math.floor((j + 1) * dark.length / n));
        var w = dark[lo + Math.floor(Rp() * (hi - lo))];
        if (w && w.kind === 0) { w.kind = 3; w.ton = T_FULL; w.flash = 1.5; picked.push(w); } else picked.push(null);
      }
      SHARDS.forEach(function (sh, j) { sh.win = picked[j]; sh.arr = T_FULL; });
    })();
    // ambient windows: the city lights itself faster and faster, always on a 16th.
    // bar 10: only the cards (2 per beat); bar 11: 1 to 6 more on every 16th; bar 12 beat 1: big waves, left to right
    (function ambient() {
      var rest = order.filter(function (w) { return w.kind === 0; });
      var n11 = [1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6], k = 0;
      n11.forEach(function (c, j) { for (var q = 0; q < c && k < rest.length; q++, k++) { rest[k].kind = 2; rest[k].ton = B(12) + j * S16; rest[k].flash = 0.6; } });
      var left = rest.slice(k), Nn = u.makeNoise('s02-wave');
      left.forEach(function (w) { w.key = w.x + 260 * Nn.noise2(w.x * 0.01, w.y * 0.013) + 0.4 * (BASE - w.y); });
      left.sort(function (a, b) { return a.key - b.key; });
      var wts = [0.21, 0.24, 0.26, 0.29], acc = 0, idx = 0;
      wts.forEach(function (wt, j) {
        acc += wt; var end = Math.round(acc * left.length);
        for (; idx < end; idx++) { left[idx].kind = 2; left[idx].ton = B(15) + j * S16; left[idx].flash = 0.75; }
      });
      // safety: anything still dark lights on the last beat with the shards
      WINS.forEach(function (w) { if (w.kind === 0) { w.kind = 5; w.ton = T_FULL; w.flash = 0.8; } });
    })();

    // ================= additive light canvas: bokeh, motes, flying words, shards, the dot, the head glow =================
    var BOKEH = [[1860, 1010, 150], [1250, 1090, 110], [160, 1060, 90], [980, 1120, 130]].map(function (p, i) {
      return { x: p[0], y: p[1], r: p[2], a: 0.045 + 0.015 * (i % 2), ph: i * 1.7 };
    });
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
    function bez(p0, p1, p2, p3, s) {
      var a = 1 - s;
      return [a * a * a * p0[0] + 3 * a * a * s * p1[0] + 3 * a * s * s * p2[0] + s * s * s * p3[0],
        a * a * a * p0[1] + 3 * a * a * s * p1[1] + 3 * a * s * s * p2[1] + s * s * s * p3[1]];
    }
    function tail(g, pts, r0, rgb, a) {
      var n = pts.length - 1; if (n < 2) return;
      var Lf = [], Rt = [];
      for (var k = 0; k <= n; k++) {
        var pa = pts[Math.max(0, k - 1)], pb = pts[Math.min(n, k + 1)], tx = pb[0] - pa[0], ty = pb[1] - pa[1], tl2 = Math.sqrt(tx * tx + ty * ty) || 1;
        var hw = r0 * Math.pow(1 - k / n, 1.25);
        Lf.push([pts[k][0] - ty / tl2 * hw, pts[k][1] + tx / tl2 * hw]); Rt.push([pts[k][0] + ty / tl2 * hw, pts[k][1] - tx / tl2 * hw]);
      }
      var tg = g.createLinearGradient(pts[0][0], pts[0][1], pts[n][0], pts[n][1]);
      tg.addColorStop(0, rgb + a.toFixed(4) + ')'); tg.addColorStop(1, rgb + '0)');
      g.fillStyle = tg; g.beginPath(); g.moveTo(Lf[0][0], Lf[0][1]);
      for (var k3 = 1; k3 <= n; k3++) g.lineTo(Lf[k3][0], Lf[k3][1]);
      for (var k4 = n; k4 >= 0; k4--) g.lineTo(Rt[k4][0], Rt[k4][1]);
      g.closePath(); g.fill();
    }
    function winScreen(w, t) { var c = cam(t, 1); return mp(c, w.x + WW / 2, w.y + WH / 2 - riseOff(w.b, t)); }

    // ---- the motif dot ----
    function tittleScreen(t) { var c = cam(t, 1); return mp(c, TT.x, TT.y); }
    function dotPos(t) {
      if (t < 0) return tittleScreen(0);
      var m = eSine(seg(t, T_EV_OUT - 0.2, T_EV_OUT + 0.4));
      var c = cam(t, 1), wx = lerp(TT.x, WP.x, m), wy = lerp(TT.y, WP.y - 1, m), p = mp(c, wx, wy), x = t - T_LAND;
      if (x < 0.4) p[1] += 5 * Math.exp(-x / 0.08) * Math.sin(x * 34);          // the landing bounce
      return p;
    }
    function dotB(t) {
      var tt = Math.min(t, FREEZE + 0.7);
      var b = lerp(0.72, 0.95, seg(tt, 0, 0.6)) + 0.12 * eN(tt) * seg(tt, 0.3, 1.0);
      b += 1.1 * pulse(tt - T_LAND, 0.01, 0.12) + 0.45 * pulse(tt - T_FL1, 0.01, 0.05) + 0.6 * pulse(tt - T_EV, 0.01, 0.25);
      b += 0.6 * pulse(tt - (T_EV_OUT - 0.25), 0.05, 0.4) + 0.5 * pulse(tt - T_FULL, 0.01, 0.3);
      return b;
    }
    function drawDot(g, t) {
      var b = dotB(t), p = dotPos(t), s = cam(t, 1).s, k = s / 2, sc = 0.874 * Math.max(k, 0.5), en = eN(t);
      var bb = Math.min(b, 1.2);
      glowDisc(g, p[0], p[1], 210 * sc * (0.9 + 0.25 * bb), 'rgba(110,150,230,', 0.10 * Math.min(b, 1.8));
      glowDisc(g, p[0], p[1], 60 * sc * (0.85 + 0.3 * bb + 0.15 * en), 'rgba(160,200,255,', 0.42 * Math.min(b, 1.6));
      glowDisc(g, p[0], p[1], DOT_R01 * 3.1 * sc, 'rgba(207,230,255,', 0.85 * Math.min(b, 1.3));
      var rc = Math.max(3.4, lerp(DOT_R01 * 0.874, TR * s, seg(t, 0, 0.25, eP2o)));
      g.globalCompositeOperation = 'source-over';
      g.globalAlpha = clamp(0.55 + 0.6 * b, 0, 1);
      var cg = g.createRadialGradient(p[0], p[1], 0, p[0], p[1], rc);
      cg.addColorStop(0, '#ffffff'); cg.addColorStop(0.55, '#f4f9ff'); cg.addColorStop(0.85, '#d9ebff'); cg.addColorStop(1, 'rgba(207,230,255,0)');
      g.fillStyle = cg; g.beginPath(); g.arc(p[0], p[1], rc, 0, 6.2832); g.fill();
      g.globalAlpha = 1; g.globalCompositeOperation = 'lighter';
      var fl = 0.1 * Math.min(b, 1) + 0.7 * pulse(t - T_LAND, 0.01, 0.2) + 0.5 * pulse(t - T_EV, 0.01, 0.25);
      streak(g, p[0], p[1], 420 * sc * (0.7 + 0.6 * Math.min(fl, 1)), fl);
      var lr = t - T_LAND;
      if (lr >= 0 && lr < 0.7) {
        g.strokeStyle = 'rgba(214,234,255,' + (0.38 * Math.pow(1 - lr / 0.7, 1.8)).toFixed(4) + ')';
        g.lineWidth = 1.4 * (1 - lr / 0.7) + 0.4;
        g.beginPath(); g.arc(p[0], p[1], (8 + 80 * eExpo(lr / 0.7)) * k, 0, 6.2832); g.stroke();
      }
    }

    var fxCv = u.canvas(root, function (g, t) {
      var en = eN(t);
      g.globalCompositeOperation = 'lighter';
      // foreground bokeh (out-of-focus street lights, depth 1.5)
      var envB = seg(t, 1.2, 3.2, eP2o);
      if (envB > 0) {
        var cb = cam(t, 1.5), tb = Math.min(t, FREEZE);
        for (var i = 0; i < BOKEH.length; i++) {
          var bo = BOKEH[i], bp = mp(cb, bo.x + Math.sin(bo.ph + tb * 0.2) * 12, bo.y + Math.cos(bo.ph + tb * 0.16) * 8);
          var ba = bo.a * envB * (0.75 + 0.5 * en), rad = bo.r * cb.s;
          var gg = g.createRadialGradient(bp[0], bp[1], 0, bp[0], bp[1], rad);
          gg.addColorStop(0, 'rgba(127,166,224,' + (ba * 0.9).toFixed(4) + ')'); gg.addColorStop(0.6, 'rgba(127,166,224,' + (ba * 0.6).toFixed(4) + ')'); gg.addColorStop(1, 'rgba(127,166,224,0)');
          g.fillStyle = gg; g.beginPath(); g.arc(bp[0], bp[1], rad, 0, 6.2832); g.fill();
        }
      }
      // the learner's head lamp (40 % cold blue, a small flash for every window the cards light)
      var cl = cam(t, LRN.d), lp = mp(cl, LRN.x + 3 + 5 * look(t), LRN.y - 237 - 3 * look(t)), hb = headB(t);
      if (lp[1] < H + 200) { glowDisc(g, lp[0], lp[1], 92 * cl.s, 'rgba(127,166,224,', 0.30 * hb); glowDisc(g, lp[0], lp[1], 34 * cl.s, 'rgba(190,215,255,', 0.32 * hb); }

      // word motes: card -> window; the flight gets shorter as the cards get faster
      var po = phonePose(t);
      for (var k = 0; k < SW.length; k++) {
        var sw = SW[k], t0 = sw.t + 0.02, t1 = sw.land;
        if (t < t0 || t > t1 + 0.05 || !sw.win) continue;
        var P0 = [CARD_C.x, CARD_C.y + po.y], P3 = winScreen(sw.win, t);
        var P1 = [P0[0] + 150, Math.max(P0[1] - 260, 400)];
        var P2 = [P3[0] - 110, P3[1] - 230]; if (P2[0] > 520 && P2[0] < 1400) P2[1] = Math.max(P2[1], 390);
        var big = sw.ph < 3, dur = t1 - t0;
        var at = (function (P0, P1, P2, P3, t0, dur) { return function (tt) { return bez(P0, P1, P2, P3, eP2io(clamp((tt - t0) / dur, 0, 1))); }; })(P0, P1, P2, P3, t0, dur);
        var x = clamp((t - t0) / dur, 0, 1), hp = at(t);
        var trail = [hp], step = Math.min(0.016, dur / 18);
        for (var j = 1; j <= 14; j++) { var tj = t - j * step; if (tj < t0) break; trail.push(at(tj)); }
        var fade = 1 - seg(t, t1, t1 + 0.05);
        var me = 0.85 + 0.3 * en;
        tail(g, trail, big ? 4.2 : 3.2, 'rgba(190,215,255,', (big ? 0.55 : 0.5) * fade);
        glowDisc(g, hp[0], hp[1], (big ? 34 : 26) * me, 'rgba(150,190,255,', 0.55 * fade);
        glowDisc(g, hp[0], hp[1], (big ? 8 : 6.5), 'rgba(235,244,255,', 1.0 * fade);
        if (big) {
          var fs = lerp(cardFont(sw.word), 11, eP3i(x)), wa = (1 - seg(x, 0.82, 1)) * fade;
          if (wa > 0.01) {
            g.globalAlpha = wa; g.font = '400 ' + fs.toFixed(2) + 'px "Source Serif 4 Display"';
            g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillStyle = '#e8f1ff';
            g.shadowColor = 'rgba(150,190,255,.9)'; g.shadowBlur = 14;
            g.fillText(sw.word, hp[0], hp[1] - fs * 0.05); g.shadowBlur = 0; g.globalAlpha = 1;
          }
        }
        // the landing spark
        var lx = t - t1;
        if (lx > -0.02 && lx < 0.4) glowDisc(g, P3[0], P3[1], 46, 'rgba(200,225,255,', 0.6 * Math.exp(-Math.max(0, lx) / 0.12));
      }

      // the title's shards: burst, then one beat of power3.in flight into the last dark windows
      if (t >= T_BREAK) {
        for (var si = 0; si < SHARDS.length; si++) {
          var sh = SHARDS[si], gl = sh.gl, x0 = t - gl.tb - 0.05;
          if (x0 < 0) continue;
          var ex = eExpo(clamp(x0 / 0.4, 0, 1));
          var ox = sh.vx * sh.kick * ex, oy = sh.vy * sh.kick * ex - 26 * ex;
          var faceA = 1 - seg(x0, 0.03, 0.24), moteA = seg(x0, 0.02, 0.18);
          var rel = gl.tb + 0.12, Pp = [sh.mx + ox, sh.my + oy];
          if (faceA > 0.01) {
            g.save(); g.globalAlpha = faceA;
            g.translate(Pp[0], Pp[1]); g.rotate(sh.spin * 0.9 * ex); g.scale(1 - 0.35 * ex, 1 - 0.35 * ex); g.translate(-sh.mx, -sh.my);
            g.beginPath(); g.moveTo(sh.pts[0][0], sh.pts[0][1]); for (var pi = 1; pi < sh.pts.length; pi++) g.lineTo(sh.pts[pi][0], sh.pts[pi][1]); g.closePath(); g.clip();
            g.drawImage(gl.cv, gl.x - gl.pad, gl.y - gl.pad, gl.cw, gl.chh);
            g.restore();
          }
          if (!sh.win) continue;
          var Q3 = winScreen(sh.win, t), S0 = [sh.mx + sh.vx * sh.kick, sh.my + sh.vy * sh.kick - 26];
          var S1 = [S0[0] + sh.side * 0.6 + sh.vx * 40, S0[1] - sh.up], S2 = [Q3[0] + sh.side * 0.4, Q3[1] - 300 - sh.up * 0.6];
          var fat = (function (sh, gl, rel, S0, S1, S2, Q3) {
            var fdur = sh.arr - rel;
            return function (tt) {
              var e2 = eExpo(clamp((tt - gl.tb - 0.05) / 0.4, 0, 1));
              var pe = [sh.mx + sh.vx * sh.kick * e2, sh.my + (sh.vy * sh.kick - 26) * e2];
              if (tt <= rel) return pe;
              var f = eP3i(clamp((tt - rel) / fdur, 0, 1));
              var pS = bez(S0, S1, S2, Q3, f);
              var bl = 1 - seg(tt, rel, rel + 0.18);              // blend from the burst drift into the flight
              return [lerp(pS[0], pe[0], bl), lerp(pS[1], pe[1], bl)];
            };
          })(sh, gl, rel, S0, S1, S2, Q3);
          var hp2 = fat(t), tr2 = [];
          if (t > sh.arr + 0.03) { var la = t - sh.arr; if (la < 0.45) glowDisc(g, Q3[0], Q3[1], 58, 'rgba(205,228,255,', 0.75 * Math.exp(-la / 0.14)); continue; }
          tr2.push(hp2);
          for (var j2 = 1; j2 <= 12; j2++) { var tj2 = t - j2 * 0.016; if (tj2 < gl.tb + 0.07) break; tr2.push(fat(tj2)); }
          var fa = moteA * (1 - seg(t, sh.arr, sh.arr + 0.03));
          tail(g, tr2, 3.4, 'rgba(200,225,255,', 0.55 * fa);
          glowDisc(g, hp2[0], hp2[1], 26 * (0.9 + 0.3 * en), 'rgba(150,190,255,', 0.55 * fa);
          glowDisc(g, hp2[0], hp2[1], 6.5, 'rgba(240,247,255,', 1.0 * fa);
        }
      }

      // bloom: the whole city on the last beat
      var xf = t - T_FULL, bl = 0;
      if (xf >= 0) bl = xf < 0.04 ? xf / 0.04 : 1 - eP2o(clamp((xf - 0.04) / 0.5, 0, 1));
      ellGrad(g, 0.58 * W, 0.62 * H, 0.70 * W, 0.55 * H, [[0, 'rgba(180,212,255,.30)'], [0.45, 'rgba(150,190,255,.10)'], [0.75, 'rgba(150,190,255,0)'], [1, 'rgba(150,190,255,0)']], bl);
      // the motif dot (screen blend like s01)
      drawDot(g, t);
      g.globalAlpha = 1; g.globalCompositeOperation = 'source-over';
    });
    fxCv.canvas.style.mixBlendMode = 'screen';

    // stacking: sky, s01 bg, stars, city, evidence window, nearDom (evidence), labels, learner, phone, fx, line + title
    [starCv.canvas, cityCv.canvas, evCv.canvas, nearDom].concat(labels).concat([figCv.canvas, phoneWrap, fxCv.canvas, line, title1, title2]).forEach(function (e) { root.appendChild(e); });

    // overlays: s01's heavy vignette (fades), s02's own vignette
    var VIG01 = [[0, 'rgba(2,3,7,0)'], [0.46, 'rgba(2,3,7,0)'], [0.82, 'rgba(2,3,7,.5)'], [1, 'rgba(2,3,7,.82)']];
    var VIG = [[0, 'rgba(2,4,10,0)'], [0.55, 'rgba(2,4,10,0)'], [0.88, 'rgba(2,4,10,.42)'], [1, 'rgba(2,4,10,.62)']];
    u.canvas(root, function (g, t) {
      var k = eSine(seg(t, 0.2, 2.4));
      ellGrad(g, 0.5 * W, 0.46 * H, 0.72 * W, 0.66 * H, VIG01, 1 - k);          // s01's heavy vignette hands over
      ellGrad(g, 0.5 * W, 0.48 * H, 0.80 * W, 0.74 * H, VIG, k);                // to s02's lighter one
    });

    // ================= per frame: camera onto DOM, evidence flicker, labels, phone, cards, title glow =================
    u.onFrame(function (t) {
      var c = cam(t, 1);
      cityCv.state.opacity = seg(t, 0.0, 3 * S16, eP2o);
      nearDom.style.transform = 'matrix(' + c.s.toFixed(5) + ',0,0,' + c.s.toFixed(5) + ',' + c.ox.toFixed(3) + ',' + c.oy.toFixed(3) + ')';
      // evidence: glimpses on the two flickers, on at 0.3125, melts into the window light on the shatter beat
      var L = evLight(t), op = evOpacity(t);
      ev.style.opacity = op.toFixed(4);
      var melt = seg(t, T_EV_OUT - 2 * S16, T_EV_OUT);
      ev.style.filter = melt > 0.001 ? 'blur(' + (5 * melt).toFixed(2) + 'px)' : '';
      ev.style.textShadow = '0 0 ' + (8 + 16 * Math.min(L, 1.3) + 20 * melt).toFixed(1) + 'px rgba(170,205,255,' + (0.35 + 0.4 * Math.min(L, 1.3)).toFixed(3) + ')';
      // labels follow their districts on the street (screen space, unscaled)
      labels.forEach(function (wr, di) {
        var p = mp(c, DIST[di].cx, BASE + 46);
        p[0] = clamp(p[0], 80, W - 80); p[1] = Math.min(p[1], H - 52);       // inside the frame while the camera still pulls
        wr.style.transform = 'translate(' + p[0].toFixed(2) + 'px,' + p[1].toFixed(2) + 'px)';
      });
      // the question glows with the music
      var gr = 8 + 16 * eN(t) + 6 * u.hitPulse(Math.min(t, FREEZE), 0.3);
      var tsh = '0 0 ' + (gr * 0.45).toFixed(1) + 'px rgba(169,200,255,.85), 0 0 ' + gr.toFixed(1) + 'px rgba(169,200,255,.45), 0 0 ' + (gr * 2.2).toFixed(1) + 'px rgba(169,200,255,.25)';
      title1.style.textShadow = tsh; title2.style.textShadow = tsh;
      // phone
      var po = phonePose(t);
      phone.style.opacity = po.op.toFixed(4); phone.style.visibility = po.op > 0.0005 ? 'visible' : 'hidden';
      phone.style.transform = 'translate3d(0,' + po.y.toFixed(2) + 'px,0) rotateY(9deg) rotateZ(-1.5deg) rotateX(' + po.rx.toFixed(2) + 'deg) scale(' + po.sc.toFixed(4) + ')';
      var k = swipeIndex(t);
      progFill.style.transform = 'scaleX(' + (k / SW.length).toFixed(4) + ')';
      var last = k > 0 ? SW[k - 1] : null, pl = last ? clamp((t - last.t) / last.ls, 0, 1) : 1;
      okRing.setAttribute('fill', 'rgba(127,166,224,' + (0.16 + 0.5 * (last ? pulse(t - last.t, 0.01, 0.18) : 0)).toFixed(3) + ')');
      // slots: card i lives in slot i % 4; visible cards are k-1 (leaving), k (current), k+1, k+2 (stack)
      slots.forEach(function (sl, si) {
        var idx = -1;
        for (var q = k - 1; q <= k + 2; q++) if (q >= 0 && ((q % 4) + 4) % 4 === si) idx = q;
        function hide() {                                      // a hidden slot is reset too: every frame is a pure function of t
          if (sl.idx !== -1) { sl.idx = -1; sl.word.textContent = ''; sl.word.style.fontSize = '64px'; }
          sl.el.style.transform = 'none'; sl.el.style.opacity = '0'; sl.el.style.zIndex = '0'; sl.word.style.opacity = '0';
        }
        if (idx < 0 || idx >= CARDS.length) { hide(); return; }
        if (sl.idx !== idx) { sl.idx = idx; sl.word.textContent = CARDS[idx]; sl.word.style.fontSize = cardFont(CARDS[idx]).toFixed(1) + 'px'; }
        var tr, o, wo;
        if (idx === k - 1) {                                   // leaving: flick to the left with a 3D tilt
          if (pl >= 1) { hide(); return; }
          var pe = eP2i(pl);
          tr = 'translate3d(' + (-470 * pe).toFixed(2) + 'px,' + (-36 * pe).toFixed(2) + 'px,' + (40 * pe).toFixed(1) + 'px) rotate(' + (-17 * pe).toFixed(2) + 'deg) rotateY(' + (-38 * pe).toFixed(2) + 'deg)';
          o = 1 - pe * pe; wo = last.ph < 3 ? 0 : 1 - seg(pl, 0, 0.3);
        } else {
          var slot = idx - k;                                  // 0 current, 1, 2 stacked behind
          var from = slot + 1, q2 = last ? eP3o(pl) : 1;
          var sp = lerp(from, slot, q2);
          tr = 'translate3d(0,' + (17 * sp).toFixed(2) + 'px,' + (-30 * sp).toFixed(1) + 'px) scale(' + (1 - 0.055 * sp).toFixed(4) + ')';
          o = clamp(1 - 0.28 * sp, 0, 1) * (slot === 2 ? q2 : 1);
          wo = slot === 0 ? (last ? seg(pl, 0.4, 1) : 1) : 0;
        }
        sl.el.style.transform = tr; sl.el.style.opacity = o.toFixed(4); sl.el.style.zIndex = String(idx === k - 1 ? 9 : 5 - (idx - k));
        sl.word.style.opacity = (wo * clamp((po.op - 0.4) / 0.6, 0, 1)).toFixed(4);
      });
    });

    // keep the timeline exactly as long as the scene
    tl.set({}, {}, D);
  });
})();
