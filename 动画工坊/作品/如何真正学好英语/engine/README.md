# Film engine: API for scene authors

The engine renders the film from `A/story/storyboard.json` and one script per scene in `A/scenes/`. Each frame is
a pure function of time, so any frame can be rendered in any order, in parallel chunks, at 1080p or 4K, and comes
out the same. (`A` = 作品目录：动画工坊/作品/<片名>，里面有 engine/ scenes/ story/ fonts/ assets/。)

- Lay everything out in 1920x1080 CSS px. The 4K render uses deviceScaleFactor 2, so text, SVG, canvas and WebGL are
  all drawn at 3840x2160.
- Working references: `A/scenes/demo.js` uses every helper below. To look at them, run
  `node engine/still.js --demo 1.6 4.6` and `node engine/still.js --demo=gallery 0.8 3.2 5`.

## 1. Commands

| what | command (run from `A/engine`) |
|---|---|
| stills (1080p, with QA) | `node still.js 12.5 30 61.2` → `A/stills/t_12.5.png ...` |
| stills of one scene, local times | `node still.js --scene s04 0 1.5 3` |
| 4K stills (detail check) | `node still.js --scale 2 30` |
| render a range | `node render.js --from 20 --to 40 --out ../out/s05.mp4 --parallel 4` |
| final film | `node render.js --scale 2 --parallel 4 --out ../out/film_4k.mp4` (whole storyboard, music muxed) |
| determinism test | `node test.js` (demo + gallery) or `node test.js --storyboard ../story/storyboard.json --times 3,7.5,12` |
| preview in a browser | `node serve.js` then open the printed URL (scrubber + play with music) |
| import the user's assets | `node asset.js illus 05`, `node asset.js frame 05 12.5`, `node asset.js clip 05 12 3` |

Shared flags of `still.js`, `render.js` and `test.js`:
- `--demo` or `--demo=gallery`: use a built-in storyboard.
- `--storyboard path`: use another storyboard.
- `--param k=v`: set `ctx.params.k`; repeat the flag for more keys.
- `--nothree`: do not load three.js.
- `--barcode`: draw a frame-index barcode, used for checking chunk joins.

### render.js

```
node render.js --out file.mp4 [--from s] [--to s] [--fps 60] [--scale 1|2] [--crf 17] [--preset medium]
               [--parallel 4] [--chunks K] [--audio auto|none|file] [--capture png|jpeg] [--force] [--keep-chunks]
```
- **No frame files.** Each frame is seeked, captured as PNG and piped into ffmpeg. Nothing is written to disk except
  the chunk mp4s.
- **Chunks.** The frame range is split into contiguous chunks: at least `--parallel`, up to 6 per worker, each at
  least 90 frames. `--parallel` workers each run one browser and take chunks from a queue. Every chunk gets a fresh
  page that builds only the scenes it needs, plus their neighbours, and a fresh ffmpeg process.
- **Joining.** Chunks are joined with the concat demuxer using `-c copy`, so they are not re-encoded. Frame i of the
  output is global time `from + i/fps`, exactly once.
- **Verified frame count.** Every chunk and the final file are checked with ffprobe (`nb_read_packets == frames`,
  size).
- **Encoding.** libx264 high, yuv420p, BT.709 tags, level 5.2 at 4K60 and 4.2 at 1080p60, `-crf 17 -preset medium`,
  GOP 2 s.
- **Audio.** `--audio auto` (the default) muxes `storyboard.music.file`, trimmed to `[from, to]`, as AAC 320k 48 kHz.
- **Errors.** Any engine error aborts the render. `--force` renders anyway, for drafts only.
- **Report.** The end of the run prints wall time, fps, ms per frame and a projection for a 3-minute film.

## 2. Scene contract

```js
// A/scenes/s04.js
registerScene('s04', function build(tl, root, ctx) {
  var u = ctx.util;
  var h = u.text(root, '遗忘不是你的错', 'headline', { y: 470 });
  var st = u.split(h, { type: 'chars', mask: 'chars' });
  tl.from(st.chars, { yPercent: 110, duration: 0.9, ease: 'expo.out', stagger: 0.05 }, u.beat(0));
  tl.to(h, { opacity: 0, duration: 0.5 }, ctx.duration - 0.6);
});
```
- `tl` is a paused GSAP timeline that starts at 0. Put every animation on it with `tl.to`, `tl.from`, `tl.fromTo`,
  `tl.add` or `tl.set`. A tween that is not on `tl` is killed, and the engine warns.
- `root` is a 1920x1080 div that belongs to you. You may transform it, for example `tl.to(root, {scale: 1.04})` for
  a camera push. The engine owns the wrapper around it (`div.scene`, which has the opaque background) and uses the
  wrapper for transitions.
- **Forbidden:** `setTimeout`, `setInterval`, `requestAnimationFrame`, CSS animations or transitions (disabled
  globally), wall clock, `<video>` playback and accumulated state.
  - For per-frame logic, use `ctx.util.onFrame(fn)`. Compute everything from `t`.
  - For randomness, use `ctx.util.rand(seed)`. `Math.random` is re-seeded per scene and per frame, so it is
    deterministic, but do not rely on it.
  - Do not use `tl.call()` or `onComplete` side effects that are not pure functions of the current state.
- **Hooks can see times outside the scene.**
  - During transitions an `onFrame` hook can get `t < 0`: the scene is visible under the outgoing scene with `tl`
    at 0. It can also get `t > duration` with `align: 'after'`.
  - Canvas and three.js layers keep moving because they draw from `t`.
- **Per-frame order:**
  1. `tl.totalTime(t)`
  2. your `onFrame` callbacks, in registration order
  3. the helpers' render hooks (canvas, particles, three.js, filters, counters and so on)

  So an `onFrame` callback may set a helper's state, for example `liq.state.amount = f(t)`, and the helper uses it in
  the same frame. Never let a tween and a hook write the same property.
- **Build can be async.** Return a promise if you must await something. Images do not need it, because the engine
  awaits them itself.
- **Text rules.** These are checked by `window.qa()` in `still.js` and by storyboard checks:
  - every visible text at least 40 px, and main titles at least 72 px;
  - fonts only from `A/fonts`;
  - no text outside the frame, no overlapping text blocks, and no dashes (— or –);
  - every `texts[]` item stays on screen at least `max(1.6, 0.6 + chars/6)` s.

  Scene starts must be on bar lines, within 0.05 s.

### ctx

| field | meaning |
|---|---|
| `ctx.id, start, end, duration` | scene id and global times (s) |
| `ctx.width, height, dpr` | 1920, 1080, devicePixelRatio (1 or 2) |
| `ctx.palette` | storyboard palette, merged with the CSS variables `--bg --bg2 --ink --dim --accent --accent2 --cool --hot --line` |
| `ctx.scene, ctx.texts, ctx.storyboard` | this scene's storyboard entry, its `texts[]`, the whole storyboard |
| `ctx.music` | `{bpm, beat, bar, beatsPerBar, offset, sections, climax, climaxLocal}`; `beat` and `bar` are lengths in s, `climaxLocal` is the climax in scene time |
| `ctx.beats, ctx.bars` | beat and bar-line times inside this scene (local s) |
| `ctx.params` | `--param k=v` values (numbers are parsed) |
| `ctx.THREE` | the three.js module (r169), or null with `--nothree` |
| `ctx.transitionIn(spec)` / `ctx.transitionOut(spec)` | override the transition into or out of this scene (§6) |
| `ctx.util` | the helpers below |

## 3. Time, music, energy

```js
u.beat(0); u.beat(4); u.beat(2.5)   // local time of beat n (beat 0 = first beat at or after the scene start)
u.bar(1)                             // local time of bar line 1
u.snap(1.37, 'beat')                 // nearest beat ('bar', 'half' also)
u.beatPulse(t, 0.18)                 // 1 on each beat, decaying (0..1)
u.barPulse(t, 0.35)
u.energy(t)                          // music energy 0..1 at local t (A/music/energy.json, linear interpolation)
u.energy(t, 0.1)                     // averaged over a 0.1 s window
u.energyAt(T)                        // same at GLOBAL time T
u.hitPulse(t, 0.22)                  // 1 at each drum hit, decaying; u.hits = hit times inside the scene (local)
u.energyVars(el)                     // sets CSS vars --e, --hit, --beat on el every frame
u.energyGlow(h, { color: 'var(--accent)', min: 10, max: 46, hit: 0.6, mode: 'text' })  // glow follows the music
tl.to(h, { scale: 1.1, duration: 0.4, ease: 'back.out(3)' }, ctx.music.climaxLocal)   // land on the climax
```
**The energy file.** `energy.json` holds `{"fps":60, "energy":[0..1 per frame], "hits":[seconds...]}`.
- Aliases are also read: `values`, `rms` and `env` for the energy array; `drums`, `onsets` and `kicks` for the hits.
  `hits` may also be an object of arrays.
- When the file is missing, `energy()` returns 0.5 and `hitPulse()` returns 0.
- `storyboard.music.energy` can point somewhere else.

## 4. Text

```js
var h = u.text(root, '一屏只讲一个意思', 'headline', { x: 960, y: 480, anchor: 'center', cls: 'grad-gold glow' });
// roles: mega 220 | headline 120 | title 88 | serif 112 | line 60 | body 48 | en 96 (serif italic) | small/label/source 40
// anchor: center | left | right | top | bottom | top-left | ... ; maxWidth: wraps; u.fitText(el, 1600) shrinks to fit (min 40)

var st = u.split(h, { type: 'chars,words', mask: 'chars' });   // GSAP SplitText (st.chars, st.words, st.lines)
tl.from(st.chars, { yPercent: 110, stagger: 0.04, duration: 0.8, ease: 'expo.out' }, 0.2);

var chars = u.splitChars(el);       // CJK-aware split: never breaks a word or starts a line with "，"
tl.from(chars, { opacity: 0, y: 30, stagger: { each: 0.05, from: 'center' } }, 0);

tl.add(u.typewriter(el, { duration: 1.2, cursor: true }), 0.5);
tl.to(en, { duration: 1.2, scrambleText: { text: 'comprehensible input', chars: 'lowerCase', revealDelay: 0.3 } }, 1);
tl.add(u.glowSweep(h, { duration: 1.0 }), 2.0);   // create it BEFORE from() tweens move the chars
tl.add(u.counter(el, { from: 0, to: 5500, duration: 1.4, separator: ',', suffix: ' 词' }), 1.0);
```
- **Gradient fills.** `.grad-gold`, `.grad-cool`, `.grad-fire` and `.grad-text` survive splitting: each char gets its
  own slice of the gradient.
- **Glows.** Use the classes `.glow`, `.glow-ink` and `.glow-cool`.
- **Colours.** Use the classes `.accent`, `.cool` and `.dim`.
- **Digits.** `.tnum` gives fixed-width digits.

## 5. Visual helpers

**SVG drawing, morphing, motion paths (GSAP plugins).**
```js
var s = u.svg(root);                                             // full-frame <svg>, user units = CSS px
var p = u.path(s, u.curve([[160,250],[720,700],[1760,868]]), { stroke: 'var(--cool)', 'stroke-width': 5 });
tl.from(p, { drawSVG: 0, duration: 1.6, ease: 'power2.inOut' }, 0.2);                 // DrawSVGPlugin
tl.to(dot, { motionPath: { path: p, align: p, alignOrigin: [0.5, 0.5] }, duration: 1.6 }, 0.2);   // MotionPathPlugin
tl.to(shape, { morphSVG: starPathD, duration: 0.8, ease: 'expo.inOut' }, u.beat(2));  // MorphSVGPlugin
tl.add(u.drawPath(p, { duration: 1.2, head: dotEl }), 0);        // the same without the plugin (head rides the tip)
var l = u.line(s, 100, 900, 1800, 900); u.pointAt(p, 0.5);       // straight path; {x,y} at 50 % of the length
CustomEase.create('punch', 'M0,0 C0.12,0.7 0.24,1.18 0.42,1.04 0.58,0.96 0.75,1 1,1');   // then ease: 'punch'
tl.to(spark, { physics2D: { velocity: 800, angle: -60, gravity: 900 }, duration: 1.5, ease: 'none' }, 2);
```

**Particles and generative fields.** These are canvases at devicePixelRatio, drawn from `t` only.
```js
var dust = u.particles(root, { count: 260, seed: 'dust', colors: ['var(--accent)', 'var(--ink)'], size: [1, 3.2],
  speed: [10, 34], angle: -90, energy: 0.6 });            // energy: brightness and size follow the music
tl.fromTo(dust.state, { opacity: 0 }, { opacity: 1, duration: 1 }, 0);   // state: opacity morph scale x y spread brightness speed

var pts = u.textPoints('English', { font: '400 300px "Source Serif 4 Display"', step: 6, max: 1600 });
var cloud = u.particles(root, { count: 1600, targets: pts, size: [1, 2.2] });
tl.to(cloud.state, { morph: 1, duration: 1.2, ease: 'power3.inOut' }, 0.5);   // a word assembles from dust

var fl = u.flow(root, { count: 420, colors: ['var(--accent)', '#fff3d6'], strength: 120, trail: 0.5, energy: 0.7 });
// flow state: opacity brightness strength speed x y

u.canvas(root, function (g, t, info) {          // anything else: g is a 2D context already scaled to CSS px
  g.fillStyle = '#ffb547'; g.beginPath(); g.arc(960 + 300 * Math.cos(t), 540, 20, 0, 6.283); g.fill();
});
u.noise3(x, y, t); u.noise2(x, y); u.fbm(x, y, z, 4); u.makeNoise(seed)   // seeded simplex noise, -1..1
```

**SVG filter effects.** Each filter is removed when its amount is 0, so it costs nothing.
```js
var liq = u.liquid(el, { scale: 60, freq: 0.012 });   tl.fromTo(liq.state, { amount: 1 }, { amount: 0, duration: 1.4 }, 0);
var ik  = u.ink(el, { rim: 'var(--accent2)', from: { x: 0, y: 60 } });  tl.to(ik.state, { p: 1, duration: 1.4 }, 0.2);
var dp  = u.displace(el, { map: 'assets/map.png', scale: 40 });   // or no map = noise; state.amount
var ch  = u.chroma(el, { amount: 0 });  u.onFrame(function (t) { ch.state.amount = 2 + 10 * u.beatPulse(t); });
var mr  = u.maskReveal(el, { type: 'linear', angle: 90, soft: 140 });  tl.to(mr.state, { p: 1, duration: 0.8 }, 0);
// maskReveal type 'radial' with {x, y} = iris; invert: true hides instead
```
SVG filters cost a lot at 4K. Use them on elements, not on the full frame, for longer than about 1 s.

**Camera, depth, light.**
```js
var cam = u.parallax(root, [0.3, 1, 1.8], { shake: 6 });   // layers: back, mid, foreground
tl.fromTo(cam.state, { zoom: 1, x: 0 }, { zoom: 1.08, x: -60, duration: ctx.duration, ease: 'sine.inOut' }, 0);
u.particles(cam.layers[2], { count: 18, size: [14, 30], soft: true }).canvas.style.filter = 'blur(6px)'; // bokeh
var r = u.rays(cam.layers[0], { x: 960, y: -160, color: 'var(--accent)', opacity: 0.45 });   // volumetric light
tl.to(r.state, { opacity: 0.8 }, ctx.music.climaxLocal);
```
- The engine adds a vignette and film grain on top of every scene. The grain changes 24 times per second.
- Use `storyboard.look = {vignette: 0.5, grain: 0.05, grainMove: true}` to tune them.

**Images and the user's 4K video frames.** Copy the files into `A/assets` first with `asset.js`.
```js
var img = u.image('assets/illus/05.jpg', { x: 560, y: 540, width: 760, radius: 18 });   // 1536 px wide: show <= 768 css px
var fr  = u.image('assets/frames/05_12.5.jpg', { x: 960, y: 540, width: 1920 });          // 3840 px: full frame is sharp
var seq = u.sequence('assets/clips/05_12_3', { x: 1420, y: 540, width: 860 });             // moving clip, frame = f(t)
u.preload('assets/bg.jpg');                       // for CSS background-image / SVG <image>: the engine waits for it
```
- **Waiting.** The engine waits until every image and sequence frame is decoded before a frame is captured.
- **Soft images.** `image()` warns if the picture is narrower than 2 x its displayed width, because it would look soft
  at 4K. `maxScale` accounts for later zooms; `allowSoft: true` silences the warning.

**three.js (r169), the hero 3D shots.**
```js
var g3 = u.three(root, function (THREE, g) {      // WebGL canvas at devicePixelRatio, transparent
  var group = new THREE.Group(); g.scene.add(group);
  var sp = g.textSprite('remember', { font: '400 56px "Source Serif 4 Display"', px: 24, color: '#ffc56b', blending: 'additive' });
  group.add(sp);
  return function update(t) { group.rotation.y = t * 0.5; g.camera.position.z = 10 - u.energy(t) * 0.8; };
}, { fov: 35, antialias: true });
tl.fromTo(g3.state, { opacity: 0 }, { opacity: 1, duration: 0.8 }, 0);   // opacity 0 = rendering skipped
```
- `g` holds `{THREE, renderer, scene, camera, canvas, width, height, dpr, state, textTexture(), textSprite(), pxToWorld(dist)}`.
- Render only from `t`: no clocks and no `AnimationMixer.update(delta)`. Use `mixer.setTime(t)` instead.
- Textures from images: load them with `new THREE.TextureLoader().loadAsync(u.asset(...))` inside an async build
  (await it).
- `u.three()` returns null, and the engine records an error, if WebGL is unavailable.

**Other helpers.**
- Elements: `u.el(tag, {cls, text, html, style, attrs, parent})` and `u.svgEl(tag, attrs, parent)`.
- Randomness: `u.rand(seed)` returns `r()`, plus `r.range`, `r.int`, `r.pick`, `r.shuffle` and `r.gauss`.
  `u.hash(i, seed)` is stateless.
- Maths: `u.clamp`, `u.lerp`, `u.remap(v, a, b, c, d)` and `u.smooth`.
- Colours: `u.mixColor(a, b, t)`, `u.withAlpha(c, a)`, `u.rgba(c)` and `u.cssVar('var(--accent)')`.
- Paths: `u.asset(path)` gives a URL for a file under A.

## 6. Transitions between scenes

**Default.** Every scene boundary gets a 0.3 s crossfade.
- The outgoing scene fades out during its last 0.3 s.
- The incoming scene is visible underneath with its timeline at 0, so its entrance animations still start exactly
  on its bar line.
- Scenes are shown only in their own time range, plus the transition window.

**Choosing a transition.** Set it on the incoming scene in the storyboard:
```json
{"id": "s05", "start": 24.0, "duration": 9.6, "transition": {"type": "ink", "duration": 0.8, "rim": "#ffb547"}}
```
or in code (`ctx.transitionIn` beats `ctx.transitionOut` of the previous scene, which beats the storyboard):
```js
ctx.transitionIn({ type: 'iris', duration: 0.6, x: 960, y: 540 });
ctx.transitionIn({ type: 'cut' });     // match cuts: the scenes line up their own shapes, the engine does nothing
ctx.transitionIn({ type: 'custom', duration: 0.5, fn: function (p, i) {
  // p = eased progress 0..1; i = {out, in (wrappers), outRoot, inRoot, t, linear, duration, outScene, inScene}
  if (i.out) { i.out.style.transform = 'translateY(' + (-180 * p) + 'px)'; i.out.style.opacity = 1 - p; }
} });
```
| type | options | effect |
|---|---|---|
| `fade` | | crossfade (default, 0.3 s, `sine.inOut`) |
| `cut` / `none` | | hard cut on the boundary |
| `wipe` | `angle` (90 = left to right), `soft` px | soft-edged wipe |
| `iris` | `x, y, soft` | the new scene opens in a growing circle |
| `ink` | `seed, freq, octaves, sharpness, from:{x,y}, noise, rim, rimWidth` | ink and burn dissolve with a glowing rim |
| `liquid` | `scale, freq, octaves, seed` | both scenes melt through a displacement field |
| `blur` | `radius` | blur dissolve |
| `zoom` | `scale` | old scene flies past the camera, new one settles |
| `push` | `angle` | new scene pushes the old one out |
| `flash` | `color` | flash to a colour (`#fff7e6`) and out, for drops |
| `custom` | `fn(p, info)` | anything; the engine resets wrapper styles every frame |

Common options:
- `duration` (s; at most half of the shorter scene)
- `ease` (any GSAP ease, default `power2.inOut`)
- `align`: `'before'` (default; the window ends on the boundary), `'center'`, or `'after'` (the window starts on the
  boundary; the old scene holds its last frame)

## 7. Assets

```
node asset.js illus 05                        -> A/assets/illus/05.jpg (1536x1024)
node asset.js frame 05 12.5 [--png]           -> A/assets/frames/05_12.5.jpg (3840x2160 from pkg/05/video.mp4)
node asset.js clip 05 12 3 --fps 30 --width 1920 -> A/assets/clips/05_12_3/f_0001.jpg ... + manifest.json
node asset.js list
```
- **Where files must live.** The page can only load files inside A. A path outside A is refused with a warning.
- **Sharpness.** The width you show at 4K needs 2 x CSS px of source pixels.

## 8. Determinism: what is guaranteed and how it is checked

**What the engine does to make every frame a pure function of time.**
- `window.seek(t)` renders global time t, awaits fonts, images and sequence frames, and resolves. Calls are
  serialised.
- Every scene timeline is primed right after it is built (rendered to its end and back to 0). This means every
  tween records its start values in timeline order, whatever frame a render chunk starts on.
- `Math.random` is re-seeded per scene build (`build:<id>`) and per scene per frame (`<id>@<t>`).
- `ScrambleTextPlugin` is patched so its glyphs are a pure function of (tween, time). Out of the box they depend on
  the previous render.
- Physics2D with friction recomputes from 0 when seeking backwards, which is deterministic.
- SplitText runs once at build, after fonts have loaded, and never auto-splits.

**`node test.js`** renders 30 instants of the demo and 28 of the gallery three ways:
- A: sequentially;
- B: shuffled, with backward jumps and repeated instants;
- C: a fresh page per instant that builds only the scenes around it, like a render chunk.

It compares the PNG bytes and a hash of the full normalised DOM state plus canvas checksums.

**Results** (2026-11-19, chromium 153 headless, SwiftShader WebGL):
- **demo:** 30/30 instants byte-identical. This covers SplitText, MorphSVG, DrawSVG, MotionPath, CustomEase,
  ScrambleText, Physics2D, particles, the flow field, the liquid filter, the ink transition and three.js.
- **gallery:** 26/28 byte-identical. The other 2 have identical DOM state, with 1/255 differences on up to 253
  pixels:
  - The cause is Chrome's compositor reusing rasterised tiles while a custom transition scales a translucent
    rounded card. It is not the scene's state.
  - `test.js` tolerates up to 8/255 on fewer than 0.1 % of pixels when the state hash matches, and reports it as
    raster-cache noise.
  - The effect is invisible, and smaller than the x264 quantisation at crf 17.
- **chunk joins:** checked with `--barcode` and `engine/test/barcode_check.py`. Every decoded frame carries its own
  index, with no gaps and no duplicates (see §9).

## 9. Measured render speed (6 s demo = 360 frames, 4 workers, 4 CPUs)

All runs below: the demo storyboard, `--parallel 4`, crf 17, preset medium, PNG capture, ffmpeg inside the loop.
"3-min film" means 10 800 frames at the same speed. Every output was checked with ffprobe: 360 frames, High profile,
yuv420p, BT.709, 60/1, 6.000 s.

| run | output | wall time | speed | per frame | 3-min film |
|---|---|---|---|---|---|
| 4K (`--scale 2`), with the three.js word sphere | 3840x2160, 42.2 MB | 4m23s | 1.37 fps | 731 ms | **~2h12m** |
| 4K (`--scale 2`), `--nothree` | 3840x2160, 45.7 MB | 3m53s | 1.55 fps | 646 ms | **~1h56m** |
| 1080p (`--scale 1`), with three.js | 1920x1080, 11.2 MB | 57s | 6.28 fps | 159 ms | ~29m |
| 1080p (`--scale 1`), `--nothree` | 1920x1080, 11.7 MB | 1m05s | 5.56 fps | 180 ms | ~32m |

**Cost of each layer** (one worker, no ffmpeg, average of 20 frames; `engine/test` profiling):

| scale | scene d1 (SVG and particles) | scene d2 | d2 with `--nothree` |
|---|---|---|---|
| 4K | 779 ms | 1041 ms | 777 ms |
| 1080p | 197 ms | 252 ms | n/a |

Notes:
- **Where the time goes.** At 4K, three.js adds about 260 ms to each frame (33 %), and only in the scenes that use it.
  Almost all of the time is Chromium rasterising and capturing the frame (about 0.8 s at 4K). Running the scene JS
  takes 7 to 21 ms.
- **ffmpeg's share.** With 4 workers, ffmpeg's 4K x264 encode takes about 40 % of the CPU.
- **JPEG capture.** `--capture jpeg` does not help: 802 ms against 779 ms.
- **The film timings are an upper bound.** The 6 s demo has only 4 chunks, so two workers sat idle for the last
  third of the run. The film gets 24 chunks for 4 workers.
- **Memory.** The peak was 11.2 GB of 15.7 GB during the 4K render.
- **Conclusion.** The whole 3-minute film renders at 4K in about 2 to 2.2 hours, even with three.js shots, which is
  under the 3-hour budget. **three.js is approved for hero shots.**

**Fallback if a three.js scene gets too heavy** (for example thousands of meshes or post-processing):
1. Prefer instanced meshes or `THREE.Points` with one texture atlas over hundreds of sprites, set
   `antialias: false` (4K is already 2x supersampled), and keep `state.opacity` at 0 when the layer is not visible,
   so rendering is skipped.
2. Fake the 3D in 2.5D:
   - a canvas layer (`u.canvas`) projecting 3D points yourself, with `x' = x*f/(z+d)`;
   - or CSS 3D (`perspective` on a parent, `transform: rotateY(...) translateZ(...)` on word divs; a few hundred
     elements are fine).
   Both are deterministic and need no WebGL.
3. Render with `--nothree`, which disables the WebGL layer; scenes should then fall back on their own.

## 10. Pitfalls

- Never create a tween without putting it on `tl`. `gsap.to(...)` alone is killed and gives a warning.
- `glowSweep` and `gradToChars` measure the chars, so call them before any `from()` tween that moves the chars.
- Do not tween and hook the same property. Hooks run after the timeline, so the hook wins, and the result depends on
  the order.
- Put text inside the frame and at least 40 px (QA). Decorative text that is meant to be tiny, such as the words in a
  background starfield, goes on a canvas or WebGL layer. QA does not read those layers, but the 40 px rule still
  applies to anything the viewer is meant to read.
- Avoid full-frame CSS `filter: blur()` or SVG filters for long stretches at 4K, because they are slow. Prefer blurred
  canvases (`soft: true` particles) or pre-blurred layers.
- Use `assets/...` paths. Never use absolute paths outside A.
- **Missing scenes do not block other authors.**
  - A scene whose file is missing or broken is an **error** only when it is visible in the rendered range, including
    its transition window.
  - A missing neighbour that is loaded only for its transition is a warning. You can still render stills and clips of
    your own scene.
- `--nothree` sets `ctx.params.nothree`, and `u.three()` returns null with a warning. Always write
  `if (g3) tl.fromTo(g3.state, ...)`.
- **Waiting for images.** `seek()` waits for images placed with `u.image`, `u.sequence` and `u.preload`. For any other
  `<img>` in the scene it also waits, but a CSS `background-image` needs `u.preload(src)`.
- **Text inside canvases or WebGL is not checked by QA.** Size and placement rules still apply, so check them in the
  stills.
