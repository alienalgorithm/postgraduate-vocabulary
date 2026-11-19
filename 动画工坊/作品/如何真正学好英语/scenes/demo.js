/* Engine demo + helper gallery. Reference for scene authors: every engine feature used the intended way.
 * demo1/demo2 = the 6 s engine demo (node engine/render.js --demo ...); gallery1..4 = ?demo=gallery. */
(function () {
  'use strict';

  function circleD(cx, cy, r) { return 'M' + (cx - r) + ',' + cy + ' a' + r + ',' + r + ' 0 1,0 ' + (2 * r) + ',0 a' + r + ',' + r + ' 0 1,0 ' + (-2 * r) + ',0 Z'; }
  function starD(cx, cy, R, r, n) {
    var d = '';
    for (var i = 0; i < n * 2; i++) { var a = -Math.PI / 2 + i * Math.PI / n, rr = i % 2 ? r : R; d += (i ? ' L' : 'M') + (cx + Math.cos(a) * rr).toFixed(2) + ',' + (cy + Math.sin(a) * rr).toFixed(2); }
    return d + ' Z';
  }
  if (window.CustomEase && !window.CustomEase.get('punch')) window.CustomEase.create('punch', 'M0,0 C0.12,0.7 0.24,1.18 0.42,1.04 0.58,0.96 0.75,1 1,1');

  var WORDS = ['remember', 'context', 'story', 'meaning', 'input', 'read', 'listen', 'notice', 'connect', 'review', 'curious', 'habit',
    'abandon', 'evident', 'retain', 'acquire', 'vivid', 'recall', 'pattern', 'insight', 'grasp', 'absorb', 'fluent', '\u006e\u0061\u0074\u0069\u0076\u0065',
    'phrase', 'sentence', 'chapter', 'library', 'journey', 'patience', 'practice', 'progress', 'daily', 'focus', 'memory', 'English'];

  // ------------------------------------------------------------------ demo1
  registerScene('demo1', function (tl, root, ctx) {
    var u = ctx.util;
    // 1. dust particles (energy-reactive), behind everything
    var dust = u.particles(root, { count: 260, seed: 'd1-dust', colors: ['var(--accent)', 'var(--ink)', 'var(--cool)'], size: [1, 3.2], speed: [10, 34], energy: 0.6 });
    tl.fromTo(dust.state, { opacity: 0 }, { opacity: 1, duration: 0.8, ease: 'power2.out' }, 0);

    // 2. a curve drawn with DrawSVG, a dot riding it with MotionPath
    var s = u.svg(root);
    var curve = u.path(s, u.curve([[160, 250], [420, 520], [720, 700], [1040, 800], [1400, 850], [1760, 868]]), { stroke: 'var(--cool)', 'stroke-width': 5, opacity: 0.85 });
    var dot = u.svgEl('circle', { cx: 0, cy: 0, r: 13, fill: 'var(--accent)' }, s);
    dot.style.filter = 'drop-shadow(0 0 12px var(--accent))';
    tl.from(curve, { drawSVG: 0, duration: 1.7, ease: 'power2.inOut' }, 0.15);
    tl.fromTo(dot, { opacity: 0 }, { opacity: 1, duration: 0.2 }, 0.15);
    tl.to(dot, { motionPath: { path: curve, align: curve, alignOrigin: [0.5, 0.5] }, duration: 1.7, ease: 'power2.inOut' }, 0.15);

    // 3. MorphSVG: a circle becomes a star on beat 2 (with a CustomEase punch)
    var shape = u.svgEl('path', { d: circleD(1540, 250, 80), fill: 'var(--accent)', opacity: 0.92 }, s);
    shape.style.filter = 'drop-shadow(0 0 18px rgba(255,181,71,.6))';
    tl.from(shape, { scale: 0, transformOrigin: '50% 50%', duration: 0.6, ease: 'back.out(2)' }, u.beat(0));
    tl.to(shape, { morphSVG: starD(1540, 250, 104, 44, 5), duration: 0.8, ease: 'expo.inOut' }, u.beat(2));
    tl.to(shape, { rotation: 144, transformOrigin: '50% 50%', duration: 0.8, ease: 'punch' }, u.beat(2));

    // 4. SplitText headline: masked chars rise, staggered; then a glow sweep
    var h = u.text(root, '真正学会一个词', 'headline', { x: 960, y: 460, cls: 'ink' });
    var st = u.split(h, { type: 'chars', mask: 'chars' });
    var sweep = u.glowSweep(h, { duration: 1.0 }); // create before the from() tween moves the chars
    tl.from(st.chars, { yPercent: 115, duration: 0.9, ease: 'expo.out', stagger: 0.055 }, 0.1);
    tl.add(sweep, 1.45);

    // 5. counter (tabular digits) and a source label
    var c = u.text(root, '0', 'line', { x: 960, y: 640, cls: 'accent' });
    tl.add(u.counter(c, { from: 0, to: 5500, duration: 1.4, separator: ',', suffix: ' 词', ease: 'power3.out' }), 0.6);
    tl.from(c, { opacity: 0, y: 20, duration: 0.5, ease: 'power2.out' }, 0.6);
    var src = u.text(root, 'Ebbinghaus, 1885', 'source', { x: 1856, y: 1024, anchor: 'bottom-right' });
    tl.from(src, { opacity: 0, x: 30, duration: 0.6, ease: 'punch' }, 1.0);

    // 6. a slow camera push on the whole scene root
    tl.fromTo(root, { scale: 1 }, { scale: 1.035, duration: ctx.duration, ease: 'none' }, 0);
  });

  // ------------------------------------------------------------------ demo2
  registerScene('demo2', function (tl, root, ctx) {
    var u = ctx.util;
    root.style.background = 'radial-gradient(ellipse 70% 60% at 50% 45%, #2b1d0f 0%, #0b0806 75%)';

    // 1. generative flow field (energy-reactive)
    var fl = u.flow(root, { count: 420, seed: 'd2-flow', colors: ['var(--accent)', 'var(--accent2)', '#fff3d6'], strength: 120, alpha: [0.06, 0.3], energy: 0.7 });
    tl.fromTo(fl.state, { opacity: 0 }, { opacity: 1, duration: 1.0 }, 0);

    // 2. three.js: a rotating sphere of word sprites (skipped with --param nothree)
    if (!ctx.params.nothree) {
      var g3 = u.three(root, function (THREE, g) {
        var group = new THREE.Group(); g.scene.add(group);
        var N = 120, R = 2.3, sprites = [], ga = Math.PI * (3 - Math.sqrt(5));
        for (var i = 0; i < N; i++) {
          var yy = 1 - (i + 0.5) * 2 / N, rr = Math.sqrt(1 - yy * yy), th = i * ga;
          var hot = i % 9 === 0;
          var sp = g.textSprite(WORDS[i % WORDS.length], { font: '400 56px "Source Serif 4 Display"', px: hot ? 30 : 21, color: hot ? '#ffc56b' : '#f5efe4', blending: 'additive' });
          sp.position.set(Math.cos(th) * rr * R, yy * R, Math.sin(th) * rr * R);
          group.add(sp); sprites.push(sp);
        }
        var v = new THREE.Vector3();
        return function update(t) {
          group.rotation.y = t * 0.55;
          group.rotation.x = 0.28 + Math.sin(t * 0.6) * 0.08;
          var e = u.energy(t, 0.12);
          g.camera.position.z = 10.4 - e * 0.9 - u.hitPulse(t, 0.2) * 0.25;
          group.updateMatrixWorld();
          for (var k = 0; k < sprites.length; k++) {
            v.setFromMatrixPosition(sprites[k].matrixWorld);
            sprites[k].material.opacity = u.remap(v.z, -R, R, 0.08, 0.62);
          }
        };
      }, { fov: 35 });
      if (g3) tl.fromTo(g3.state, { opacity: 0 }, { opacity: 1, duration: 0.8, ease: 'power2.out' }, 0);
    }

    // 3. the headline lands exactly on the climax (global 4.0 = local 1.0) with an energy-driven glow
    var tC = ctx.music.climaxLocal;
    var h = u.text(root, '恍然大悟', 'mega', { x: 960, y: 500, cls: 'grad-gold' });
    var st = u.split(h, { type: 'chars' });
    tl.from(st.chars, { opacity: 0, scale: 0.4, y: 40, duration: 0.55, ease: 'back.out(2.2)', stagger: 0.06 }, tC - 0.3);
    u.energyGlow(h, { color: 'var(--accent)', min: 10, max: 46, hit: 0.6, mode: 'filter' });

    // 4. Physics2D sparks burst on the climax
    var R = u.rand('sparks');
    for (var i = 0; i < 36; i++) {
      var d = u.el('div', { cls: 'dot', style: { left: '960px', top: '500px', width: R.range(6, 14) + 'px', height: R.range(6, 14) + 'px' } });
      tl.fromTo(d, { opacity: 0 }, { opacity: 1, duration: 0.01 }, tC);
      tl.to(d, { physics2D: { velocity: R.range(500, 1100), angle: R.range(-170, -10), gravity: 900 }, duration: 1.6, ease: 'none' }, tC);
      tl.to(d, { opacity: 0, duration: 0.7, ease: 'power1.in' }, tC + 0.9);
    }

    // 5. ScrambleText decode + a liquid filter that settles while it decodes
    var en = u.text(root, '', 'en', { x: 960, y: 770, cls: 'accent' });
    tl.to(en, { duration: 1.3, scrambleText: { text: 'comprehensible input', chars: 'lowerCase', revealDelay: 0.3, speed: 0.7 }, ease: 'none' }, 0.25);
    var liq = u.liquid(en, { scale: 60, freq: 0.012 });
    tl.fromTo(liq.state, { amount: 1 }, { amount: 0, duration: 1.4, ease: 'power2.out' }, 0.25);
  });

  // ------------------------------------------------------------------ gallery (helpers not used above)
  registerScene('gallery1', function (tl, root, ctx) {
    var u = ctx.util;
    var cam = u.parallax(root, [0.4, 1, 1.8], { shake: 6 });
    u.rays(cam.layers[0], { x: 960, y: -160, color: 'var(--accent)', opacity: 0.35 });
    var ill = u.image('assets/illus/01.jpg', { parent: cam.layers[0], x: 560, y: 540, width: 760, radius: 18 });
    var iris = u.maskReveal(ill, { type: 'radial', soft: 160 });
    tl.to(iris.state, { p: 1, duration: 1.0, ease: 'power2.out' }, 0);
    var seq = u.sequence('assets/clips/01_12_1', { parent: cam.layers[1], x: 1420, y: 540, width: 860, radius: 14 });
    seq.img.style.boxShadow = '0 30px 80px rgba(0,0,0,.5)';
    u.particles(cam.layers[2], { count: 18, seed: 'bokeh', size: [14, 30], soft: true, speed: [6, 14], colors: ['var(--accent)', 'var(--cool)'], twinkle: 0.2 }).canvas.style.filter = 'blur(6px)';
    u.text(cam.layers[1], '水彩插图 + 精读画面', 'line', { x: 960, y: 940 });
    tl.fromTo(cam.state, { zoom: 1, x: 0 }, { zoom: 1.06, x: -40, duration: ctx.duration, ease: 'sine.inOut' }, 0);
  });

  registerScene('gallery2', function (tl, root, ctx) {
    var u = ctx.util;
    var tw = u.text(root, '每天读一个故事', 'title', { x: 960, y: 220 });
    tl.add(u.typewriter(tw, { duration: 0.9, cursor: true }), 0.1);
    var pts = u.textPoints('English', { font: '400 300px "Source Serif 4 Display"', y: 560, step: 6, max: 1600, seed: 2 });
    var cloud = u.particles(root, { count: 1600, targets: pts, seed: 'en', size: [1, 2.2], colors: ['var(--accent)', '#fff3d6'], speed: [20, 60] });
    tl.to(cloud.state, { morph: 1, duration: 1.2, ease: 'power3.inOut' }, 0.2);
    var lab = u.text(root, 'RGB split', 'en', { x: 480, y: 900, cls: 'cool' });
    var ch = u.chroma(lab, { amount: 0 });
    u.onFrame(function (t) { ch.state.amount = 2 + 10 * u.beatPulse(t, 0.15); });
    var box = u.el('div', { cls: 'card', style: { left: '1180px', top: '840px', width: '460px', height: '120px' } });
    var dp = u.displace(box, { scale: 40, freq: 0.02 });
    tl.fromTo(dp.state, { amount: 1 }, { amount: 0, duration: 1.5 }, 0);
  });

  registerScene('gallery3', function (tl, root, ctx) {
    var u = ctx.util;
    ctx.transitionIn({ type: 'custom', duration: 0.5, fn: function (p, i) {
      if (i.out) { i.out.style.transform = 'translateY(' + (-180 * p).toFixed(1) + 'px) scale(' + (1 - 0.08 * p).toFixed(4) + ')'; i.out.style.opacity = (1 - p).toFixed(3); }
    } });
    root.style.background = 'linear-gradient(160deg, #10203a, #07080d)';
    var big = u.text(root, '流动', 'mega', { x: 960, y: 520, cls: 'grad-cool' });
    var lq = u.liquid(big, { scale: 70, freq: 0.01, speed: 0.6 });
    u.onFrame(function (t) { lq.state.amount = 0.5 + 0.5 * Math.sin(t * 3); });
    var inkT = u.text(root, '墨水显影', 'title', { x: 960, y: 820, cls: 'accent' });
    var ik = u.ink(inkT, { rim: 'var(--accent2)', from: { x: 0, y: 60 } });
    tl.to(ik.state, { p: 1, duration: 1.4, ease: 'power1.inOut' }, 0.2);
  });

  var GCOL = { g4: '#3a1830', g5: '#14324a', g6: '#3a3010', g7: '#103a2a', g8: '#2a1a4a' };
  registerScene('gallery4', function (tl, root, ctx) {
    var u = ctx.util;
    root.style.background = GCOL[ctx.id] || '#222';
    var tr = ctx.scene.transition ? (ctx.scene.transition.type || ctx.scene.transition) : '';
    u.text(root, ctx.id + '  ' + tr, 'headline', { x: 960, y: 540 });
    var ring = u.el('div', { style: { position: 'absolute', left: '160px', top: '160px', width: '240px', height: '240px', borderRadius: '50%', border: '16px solid var(--accent)' } });
    // CSS background image: u.preload makes seek() wait for it
    u.el('div', { style: { position: 'absolute', left: '1240px', top: '700px', width: '560px', height: '315px', borderRadius: '14px',
      backgroundImage: 'url(' + u.preload('assets/frames/01_12.jpg') + ')', backgroundSize: 'cover', opacity: 0.85 } });
    tl.to(ring, { rotation: 180, x: 1360, duration: ctx.duration, ease: 'none' }, 0);
  });
})();
