/* s08  合书点火，万家灯火 (global 111.842 to 124.967 s, 13.125 s, bars 61 to 67 of the Cornfield Chase edit).
 * The climax of the film. One bar = 1.875 s = 3 beats of 0.625 s; 16th = 0.15625 s. Local times below.
 *
 * Music: 0.000 is the fullest moment of the whole score (bar 61 F downbeat, strength 1.0); 1.875 the next downbeat
 *   (0.8); 3.75 the loudest bar (G, energy climbs to 1.00 around 5.36); 5.625 the score's own hard stop (silence and a
 *   reverb tail, no flash); 9.375 the F floats back softly (0.35); 11.25 the second F.
 *
 * One continuous world: the night city of s02/s03 IS a brain. 120 rows of buildings run along the depth axis z; the
 * outline of the rows is the top view of a brain (two D-shaped hemispheres), the gap between them is the light river
 * of s05 (the longitudinal fissure), and about 60 meandering streets carved through the blocks are the sulci. Every
 * row's skyline is a memory curve: cold and sagging (a forgetting curve from each outer edge toward the fissure);
 * the golden "recall" wave first turns it into a sawtooth (spaced recall), then lifts it into a flat, glowing line.
 * The world is drawn on one 2D canvas by our own perspective camera (x' = f x / z), deterministic and seekable;
 * the crane is a single camera path from street level (pitch -5.7 deg) to a vertical top view (90 deg).
 *
 *  0.000  CLIMAX, aha line 1. Out of s07's black: the light trapped in the book spine bursts, a warm white column
 *         shoots up (x 960, s07's seam), the motif dot rides it into the learner's head (100 % warm gold), white gold
 *         flash for 3 frames that falls off in 0.5 s (expo.out), lens flare and chroma kick, camera shake 2 %.
 *         不是重复看， slams out of the flash (scale 1.3 to 1, blur 12 to 0 px, 0.35 s). A golden spherical shockwave
 *         leaves the head; its rim refracts the air (the frame inside the rim is pushed outward) and carries a red /
 *         blue fringe; its ground circle runs to the horizon. Wherever the rim passes, cold blue turns warm and the
 *         windows light up gold. It leaves the frame on 1.875.
 *  1.875  aha line 2 slams in, shake 2 px, soft flash. The letters that fell in s03 come back: ~400 letters rise
 *         from the abyss below the street in a reversed waterfall (power3.out, 0.01 s stagger) and spell their
 *         words again inside the windows (56 real headwords from the user's stories). The sky blooms from deep blue
 *         through rose to a gold horizon; god rays from the vanishing point. Roediger & Karpicke, 2006.
 *  2.500  retrieval is written by a pen of light, glyph outline by glyph outline (DrawSVG on the real Source Serif
 *         italic outlines, 1.25 s); the tittle of the i is a gold dot. The last stroke ends on 3.75.
 *  3.750  The loudest bar: the crane starts (accelerating, then uniform); behind the street front 120 rows of
 *         skylines appear, cold blue and sagging. A wall of gold light pushes through them on every 16th (4 rows
 *         per 16th): each row it passes jumps into a sawtooth, then lifts into a flat gold line; fireflies (and a
 *         few tiny words) rise from the lifted roofs. Glow and particle counts keep building up to 5.36 (117.2).
 *  5.625  HARD STOP: every motion in the world freezes on this frame (letters hang in mid air, the gold wall stops,
 *         rows stay half lifted, fireflies hang). No flash; the glow stays at full, it no longer follows the
 *         energy. Only the camera keeps rising, at a constant speed, through the silence; grain keeps running.
 *  7.050  The aha lines and retrieval break into gold motes that drift up (gone on 7.3).
 *  7.500  Theme line 1 surfaces in the silence, Hu & Nation, 2000 · Webb, 2007.
 *  8.125  Theme line 2 surfaces.
 *  9.375  The F floats back: the camera arrives at the vertical top view: the golden city is a glowing brain,
 *         two hemispheres, the light river as the fissure, the learner's lit head at the root of the river. The
 *         world clock restarts (wave and letters at full speed, fireflies at 40 %), the gold wall sweeps the rest of
 *         the brain within one bar, and a line of light traces both hemispheres (one bar).
 *  11.25  Second F: on every beat a few light pulses run along the sulci and the fissure like nerve signals.
 *  12.50  Last beat: the streets are pulled straight and pressed flat, the buildings sink, and a gold grid
 *         (1 px, 15 %) takes over: the graph paper of s09.
 *
 * Techniques (toolbox numbers): 11 light (white gold flash, spherical shockwave, lens flare, chroma kick, bloom,
 *   god rays, glowing windows and rooflines, volumetric beam), 7 light transition (the shockwave refracts the air
 *   and flips cold blue to warm gold), 5 particles (reversed waterfall of letters that re-spell words, fireflies
 *   and floating words, text dissolving into motes, nerve pulses), 4 data visualisation (120 skylines = memory
 *   curves: sag, sawtooth, flat gold line; schematic only, no numbers), 6 3D (one perspective world, crane from
 *   street level to a top view; the city is a brain), 8 text effects (two slams out of the flash, a light pen
 *   writing real glyph outlines with DrawSVG, text breaking into motes, theme line surfacing char by char), 1 vector
 *   character (faceless learner, head lamp 100 % warm gold), 3 DrawSVG and path tracing (glyphs, brain outline),
 *   13 music (three strongest downbeats each own one event, 16th steps of the wave, energy drives glow and
 *   particles until the stop, then everything holds).
 *
 * HANDOFF in (cut from s07 at 111.842): s07's last half beat is black. s07's seam (the trapped light) was the line
 *   x = 960, y 371 to 838, the dot at (960, 715): the column bursts on x = 960 out of the closed book held at the
 *   learner's chest, and the dot rises into the head at (960, 735) within the 3 frames of white.
 * HANDOFF out (cut to s09 at 124.967): last frame: vertical top view of the brain city, flattened to about 15 %
 *   height and dimmed, ground #1a1208 (warm dark), a gold grid of 1 px lines at 15 %: vertical lines at
 *   x = 960 + 60 n, horizontal lines at y = 860 - 60 n (so x 960 and y 860 are grid lines); the fissure is the
 *   vertical line x = 960. window.__s08Handoff holds these numbers.
 */
(function () {
  'use strict';

  // outlines of "retrieval" in Source Serif 4 Display Italic (fontTools, font units, y up, upm 1000)
  var RET = {"upm":1000,"width":3474,"asc":1036,"desc":-335,"xh":475,"cap":670,"glyphs":[{"ch":"r","x":0,"adv":397,"contours":["M179.0,253.0 L168.0,298.0 L179.0,298.0 Q204.0,347.0 232.0,389.0 Q260.0,431.0 290.5,456.5 Q321.0,482.0 351.0,482.0 Q372.0,482.0 389.0,475.5 Q406.0,469.0 416.0,451.0 Q415.0,427.0 401.0,412.0 Q387.0,397.0 363.0,397.0 Q347.0,397.0 329.0,407.0 Q311.0,417.0 294.0,433.0 L282.0,445.0 L326.0,448.0 L326.0,442.0 Q297.0,423.0 272.0,394.5 Q247.0,366.0 224.0,330.5 Q201.0,295.0 179.0,253.0 Z","M59.0,0.0 L146.0,412.0 L162.0,399.0 L47.0,408.0 L51.0,433.0 L211.0,482.0 L223.0,473.0 L196.0,317.0 L192.0,300.0 L172.0,208.0 Q161.0,156.0 152.0,104.5 Q143.0,53.0 134.0,0.0 L68.0,-8.0 Z"]},{"ch":"e","x":397,"adv":400,"contours":["M180.0,-13.0 Q138.0,-13.0 105.0,6.5 Q72.0,26.0 53.0,65.0 Q34.0,104.0 34.0,164.0 Q34.0,226.0 55.5,283.0 Q77.0,340.0 113.0,385.0 Q149.0,430.0 195.5,456.0 Q242.0,482.0 292.0,482.0 Q339.0,482.0 365.0,459.5 Q391.0,437.0 391.0,394.0 Q391.0,369.0 377.0,340.5 Q363.0,312.0 328.0,282.0 Q293.0,252.0 233.0,224.0 Q173.0,196.0 81.0,171.0 L77.0,204.0 Q170.0,228.0 224.5,259.5 Q279.0,291.0 302.5,324.0 Q326.0,357.0 326.0,387.0 Q326.0,413.0 312.0,429.0 Q298.0,445.0 274.0,445.0 Q249.0,445.0 219.0,424.5 Q189.0,404.0 162.5,367.5 Q136.0,331.0 118.5,284.0 Q101.0,237.0 101.0,184.0 Q101.0,114.0 129.5,83.0 Q158.0,52.0 205.0,52.0 Q235.0,52.0 260.5,63.0 Q286.0,74.0 305.5,91.0 Q325.0,108.0 339.0,125.0 L359.0,109.0 Q343.0,84.0 324.0,62.0 Q305.0,40.0 282.0,23.0 Q259.0,6.0 234.0,-3.5 Q209.0,-13.0 180.0,-13.0 Z"]},{"ch":"t","x":797,"adv":318,"contours":["M45.0,428.0 L51.0,461.0 L181.0,473.0 L181.0,469.0 L347.0,469.0 L338.0,423.0 L176.0,427.0 L174.0,428.0 Z","M120.0,-13.0 Q98.0,-13.0 82.5,0.0 Q67.0,13.0 67.0,37.0 Q67.0,48.0 68.5,63.0 Q70.0,78.0 76.0,107.0 L150.0,452.0 L209.0,608.0 L252.0,608.0 L151.0,128.0 Q147.0,109.0 144.5,95.5 Q142.0,82.0 142.0,73.0 Q142.0,63.0 149.0,57.5 Q156.0,52.0 164.0,52.0 Q178.0,52.0 192.5,60.0 Q207.0,68.0 224.0,83.5 Q241.0,99.0 261.0,122.0 L282.0,106.0 Q263.0,77.0 237.5,49.5 Q212.0,22.0 182.5,4.5 Q153.0,-13.0 120.0,-13.0 Z"]},{"ch":"r","x":1115,"adv":397,"contours":["M179.0,253.0 L168.0,298.0 L179.0,298.0 Q204.0,347.0 232.0,389.0 Q260.0,431.0 290.5,456.5 Q321.0,482.0 351.0,482.0 Q372.0,482.0 389.0,475.5 Q406.0,469.0 416.0,451.0 Q415.0,427.0 401.0,412.0 Q387.0,397.0 363.0,397.0 Q347.0,397.0 329.0,407.0 Q311.0,417.0 294.0,433.0 L282.0,445.0 L326.0,448.0 L326.0,442.0 Q297.0,423.0 272.0,394.5 Q247.0,366.0 224.0,330.5 Q201.0,295.0 179.0,253.0 Z","M59.0,0.0 L146.0,412.0 L162.0,399.0 L47.0,408.0 L51.0,433.0 L211.0,482.0 L223.0,473.0 L196.0,317.0 L192.0,300.0 L172.0,208.0 Q161.0,156.0 152.0,104.5 Q143.0,53.0 134.0,0.0 L68.0,-8.0 Z"]},{"ch":"i","x":1512,"adv":300,"contours":["M72.0,37.0 Q72.0,47.0 73.5,62.0 Q75.0,77.0 81.0,107.0 L145.0,412.0 L162.0,399.0 L47.0,408.0 L51.0,433.0 L215.0,482.0 L227.0,473.0 L156.0,128.0 Q152.0,110.0 149.5,95.5 Q147.0,81.0 147.0,73.0 Q147.0,63.0 153.5,57.5 Q160.0,52.0 168.0,52.0 Q185.0,52.0 209.5,70.0 Q234.0,88.0 263.0,122.0 L284.0,106.0 Q264.0,77.0 240.0,49.5 Q216.0,22.0 187.5,4.5 Q159.0,-13.0 125.0,-13.0 Q104.0,-13.0 88.0,-0.5 Q72.0,12.0 72.0,37.0 Z","M223.0,613.0 Q202.0,613.0 188.5,626.5 Q175.0,640.0 175.0,664.0 Q175.0,689.0 191.5,707.5 Q208.0,726.0 230.0,726.0 Q252.0,726.0 266.0,712.0 Q280.0,698.0 280.0,675.0 Q280.0,649.0 263.0,631.0 Q246.0,613.0 223.0,613.0 Z"]},{"ch":"e","x":1812,"adv":400,"contours":["M180.0,-13.0 Q138.0,-13.0 105.0,6.5 Q72.0,26.0 53.0,65.0 Q34.0,104.0 34.0,164.0 Q34.0,226.0 55.5,283.0 Q77.0,340.0 113.0,385.0 Q149.0,430.0 195.5,456.0 Q242.0,482.0 292.0,482.0 Q339.0,482.0 365.0,459.5 Q391.0,437.0 391.0,394.0 Q391.0,369.0 377.0,340.5 Q363.0,312.0 328.0,282.0 Q293.0,252.0 233.0,224.0 Q173.0,196.0 81.0,171.0 L77.0,204.0 Q170.0,228.0 224.5,259.5 Q279.0,291.0 302.5,324.0 Q326.0,357.0 326.0,387.0 Q326.0,413.0 312.0,429.0 Q298.0,445.0 274.0,445.0 Q249.0,445.0 219.0,424.5 Q189.0,404.0 162.5,367.5 Q136.0,331.0 118.5,284.0 Q101.0,237.0 101.0,184.0 Q101.0,114.0 129.5,83.0 Q158.0,52.0 205.0,52.0 Q235.0,52.0 260.5,63.0 Q286.0,74.0 305.5,91.0 Q325.0,108.0 339.0,125.0 L359.0,109.0 Q343.0,84.0 324.0,62.0 Q305.0,40.0 282.0,23.0 Q259.0,6.0 234.0,-3.5 Q209.0,-13.0 180.0,-13.0 Z"]},{"ch":"v","x":2212,"adv":468,"contours":["M156.0,-1.0 Q155.0,77.0 151.5,141.0 Q148.0,205.0 143.0,261.0 Q138.0,317.0 131.0,369.0 Q127.0,400.0 120.5,409.0 Q114.0,418.0 103.0,418.0 Q90.0,418.0 75.5,404.0 Q61.0,390.0 35.0,350.0 L15.0,364.0 Q40.0,422.0 70.5,452.0 Q101.0,482.0 136.0,482.0 Q166.0,482.0 180.5,463.5 Q195.0,445.0 202.0,404.0 Q210.0,357.0 214.0,300.0 Q218.0,243.0 219.5,182.0 Q221.0,121.0 221.0,61.0 L211.0,62.0 L215.0,67.0 Q242.0,99.0 266.0,130.5 Q290.0,162.0 311.5,193.5 Q333.0,225.0 352.5,257.5 Q372.0,290.0 389.0,325.0 Q394.0,335.0 398.0,344.0 Q402.0,353.0 406.0,362.0 L399.0,306.0 L387.0,367.0 Q385.0,383.0 383.0,395.5 Q381.0,408.0 381.0,416.0 Q381.0,452.0 395.0,467.0 Q409.0,482.0 431.0,482.0 Q444.0,482.0 454.0,478.0 Q464.0,474.0 468.0,469.0 Q471.0,465.0 472.0,459.0 Q473.0,453.0 473.0,442.0 Q473.0,428.0 469.0,411.0 Q465.0,394.0 454.5,369.5 Q444.0,345.0 424.0,307.0 Q407.0,275.0 383.0,236.5 Q359.0,198.0 328.5,157.5 Q298.0,117.0 263.0,76.5 Q228.0,36.0 191.0,-3.0 L163.0,-6.0 Z"]},{"ch":"a","x":2680,"adv":516,"contours":["M122.0,-13.0 Q98.0,-13.0 77.0,-0.5 Q56.0,12.0 42.5,38.0 Q29.0,64.0 29.0,106.0 Q29.0,156.0 47.5,209.0 Q66.0,262.0 97.5,310.5 Q129.0,359.0 168.0,397.5 Q207.0,436.0 248.5,459.0 Q290.0,482.0 329.0,482.0 Q350.0,482.0 366.5,472.0 Q383.0,462.0 397.0,445.0 Q411.0,428.0 424.0,406.0 L390.0,377.0 Q372.0,393.0 348.5,407.5 Q325.0,422.0 297.0,422.0 Q280.0,422.0 261.5,415.0 Q243.0,408.0 224.0,395.0 Q205.0,382.0 188.0,364.0 Q164.0,337.0 144.5,301.5 Q125.0,266.0 114.5,225.0 Q104.0,184.0 104.0,143.0 Q104.0,97.0 119.0,74.0 Q134.0,51.0 162.0,51.0 Q183.0,51.0 207.5,64.0 Q232.0,77.0 264.0,106.5 Q296.0,136.0 338.0,186.0 L349.0,169.0 L347.0,169.0 Q312.0,117.0 273.5,76.0 Q235.0,35.0 197.0,11.0 Q159.0,-13.0 122.0,-13.0 Z","M343.0,-13.0 Q323.0,-13.0 307.0,1.0 Q291.0,15.0 291.0,43.0 Q291.0,56.0 292.0,67.0 Q293.0,78.0 295.5,93.0 Q298.0,108.0 302.0,129.0 L303.0,134.0 L368.0,438.0 L375.0,444.0 L435.0,492.0 L450.0,483.0 L372.0,127.0 Q368.0,109.0 365.5,95.0 Q363.0,81.0 363.0,72.0 Q363.0,63.0 369.5,57.5 Q376.0,52.0 385.0,52.0 Q404.0,52.0 430.0,71.5 Q456.0,91.0 482.0,122.0 L503.0,106.0 Q485.0,78.0 460.0,50.5 Q435.0,23.0 405.5,5.0 Q376.0,-13.0 343.0,-13.0 Z"]},{"ch":"l","x":3196,"adv":278,"contours":["M109.0,-13.0 Q87.0,-13.0 71.5,1.0 Q56.0,15.0 56.0,42.0 Q56.0,52.0 58.0,66.5 Q60.0,81.0 64.0,107.0 L141.0,492.0 Q151.0,541.0 160.0,589.5 Q169.0,638.0 175.0,687.0 L194.0,658.0 L81.0,668.0 L85.0,693.0 L251.0,741.0 L261.0,733.0 L138.0,130.0 Q135.0,111.0 132.5,96.5 Q130.0,82.0 130.0,74.0 Q130.0,63.0 137.0,57.5 Q144.0,52.0 153.0,52.0 Q169.0,52.0 193.5,70.5 Q218.0,89.0 247.0,122.0 L267.0,106.0 Q247.0,78.0 223.5,50.0 Q200.0,22.0 172.0,4.5 Q144.0,-13.0 109.0,-13.0 Z"]}]};

  // real headwords from the user's 70 stories (the same list as s03; never "evidence" or "abandon")
  var WORDS = 'drudgery remarkably transition satirical haunting fusion migration huddle airship computation capsule fallout sharpen simplicity unreported blameless mosaic frustrate carton amateur outlet successor horizontal grieve berth stuffed panic confess sever absurd pseudonym verdict fastener consume inclination workhouse spores frustration secretive diligent reactor overhaul reassuring premium jingle ration decorate pinpoint disloyal remark spotted naturally circle adjustable ambitious claimed detect seminar relic disposal muscle portion dealer radiation naval unplanned glitch seemingly submission ignorant shutter retrieve react momentary migrate slumber pension utility signage cosmos identity flatten ether meadow vision restore esteemed accumulate earnest convention clearance hound familiarity inheritance outdated lawmaker float tourism productive streaked formation widespread bewilder deity purely president sharp briefly frontier unfinished pliable trustworthy factor scarcity slope niche invoke inventor compress closure tighten loose spacewalk seize welfare sniff evacuate upkeep invisible variety replicate relocate ridicule sentient remedial backbone ambition plainly turnaround provincial restless staggering eclipse humidity volcano disquieting lattice handheld alive voyage circuit eject anatomy scorer widen excessive unanimous spray mandatory maturity hoist regenerate comic blast whisper correctly trickle misty doctrine profitable upgrade summary character rough compute prevalent counterfeit wander attachment aspen moisture stint ordinarily surrogate animation confession performer dockworker screening initiative baffling artwork relay expectancy household deserted accurately contest dweller impulsive boost marker infamous rumble puzzle elastic propulsion masterpiece originally steer boundary biological faculty referendum patent chamber fungus surrounding nervousness tenure label coolness uniformly provenance invoice component sibling luxury undue snatch unproven packaging cultural unsettled execute sanction hitch legislator prosecute maker fabric climber drill pretext nonetheless chiefly amendment inadequate mismatch publication physiology preface prosper mislead perilous conceptual viewer imminent revisit mileage hatch fleeting programmer conclude badge employment solitary beneficiary intensive competitor flagship counterpart attentively frosted airborne acquire satellite signify double malfunction tariff shave locality remote eagerly'.split(' ');

  registerScene('s08', async function build(tl, root, ctx) {
    // every face drawn on a canvas (or sampled by textPoints) must be loaded before the first frame, on any page
    await Promise.all(['400 24px "Source Serif 4 Display"', 'italic 400 24px "Source Serif 4 Display"', '900 24px "Noto Sans SC"']
      .map(function (f) { return document.fonts.load(f, 'retrievalAa'); }));
    var u = ctx.util, gsap = window.gsap, D = ctx.duration, W = 1920, H = 1080;
    var clamp = u.clamp, lerp = u.lerp, dpr = window.devicePixelRatio || 1;
    function E(n) { return gsap.parseEase(n); }
    var eP2o = E('power2.out'), eP2io = E('power2.inOut'), eP3o = E('power3.out'), eP3io = E('power3.inOut'),
      eExpo = E('expo.out'), eSine = E('sine.inOut'), eP2i = E('power2.in');
    function seg(t, a, b, ease) { var x = clamp((t - a) / (b - a), 0, 1); return ease ? ease(x) : x; }
    function TX(s) {
      for (var i = 0; i < ctx.texts.length; i++) if (ctx.texts[i].text === s) return ctx.texts[i];
      throw new Error('s08: text missing from the storyboard: ' + s);
    }
    function hsh(i, s) { return u.hash(i, 's08:' + s); }
    function hex(h) { var x = parseInt(h.slice(1), 16); return [x >> 16, (x >> 8) & 255, x & 255]; }
    function mixc(a, b, k) { return [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k, a[2] + (b[2] - a[2]) * k]; }
    function rgb(c, a) {
      var s = ((c[0] + 0.5) | 0) + ',' + ((c[1] + 0.5) | 0) + ',' + ((c[2] + 0.5) | 0);
      return a == null || a >= 1 ? 'rgb(' + s + ')' : 'rgba(' + s + ',' + Math.max(0, a).toFixed(3) + ')';
    }

    // ------------------------------------------------------------------ timing (local s, on the music grid)
    var BEAT = 0.625, S16 = BEAT / 4;
    // bar lines from this scene's own storyboard entry (the engine's bar grid is one beat off after bar 22, see
    // storyboard music.irregular_bars_note); beats from u.beat() are correct
    var BARS = (ctx.scene.bar_lines || []).map(function (b) { return +b.t; });
    if (BARS.length < 7) BARS = [0, 1, 2, 3, 4, 5, 6].map(function (n) { return n * 1.875; });
    function BAR(n) { return BARS[n]; }
    var tx = {
      l1: TX('不是重复看，'), l2: TX('而是反复想起。'), ret: TX('retrieval'), src1: TX('Roediger & Karpicke, 2006'),
      th1: TX('在读得懂的句子里，'), th2: TX('一次次遇见，一次次想起来。'), src2: TX('Hu & Nation, 2000 · Webb, 2007')
    };
    var T_L2 = tx.l2.in;            // 1.875 second downbeat
    var T_RET = tx.ret.in;          // 2.5   bar 62 beat 2
    var T_CRANE = BAR(2);           // 3.75  loudest bar
    var T_STOP = BAR(3);            // 5.625 hard stop
    var T_OUT1 = tx.l1.out;         // 7.3
    var T_TH1 = tx.th1.in;          // 7.5
    var T_TH2 = tx.th2.in;          // 8.125
    var T_F = BAR(5);               // 9.375 the F floats back
    var T_F2 = BAR(6);              // 11.25 second F
    var T_LAST = u.beat(20);        // 12.5  last beat
    var T_OUT2 = tx.th1.out;        // 13.0
    var T_PEAK = 117.2 - ctx.start; // 5.358 loudest point
    var RING_T = T_L2;              // the shockwave leaves the frame on the second downbeat
    var T_DIS = T_OUT1 - 0.25;      // the aha lines break into motes

    // world clocks: tauW drives the wave, the rows and the letters; tauP the fireflies. Both freeze on the stop.
    function tauW(t) { return t < T_STOP ? t : t < T_F ? T_STOP : T_STOP + (t - T_F); }
    function tauP(t) { return t < T_STOP ? t : t < T_F ? T_STOP : T_STOP + 0.4 * (t - T_F); }
    function realOfW(tw) { return tw < T_STOP ? tw : T_F + (tw - T_STOP); }

    // glow: follows the music (and builds up to the peak) until the stop, then holds full, then breathes softly
    function glowRaw(t) { var e = u.energy(t, 0.12); return 0.6 + 0.26 * e + 0.2 * seg(t, T_CRANE, T_PEAK, eSine); }
    var G_HOLD = glowRaw(T_STOP - 0.02);
    function glowLevel(t) {
      if (t < T_STOP - 0.02) return glowRaw(t);
      if (t < T_F) return G_HOLD;
      return lerp(G_HOLD, 0.92, seg(t, T_F, T_F + 1.2, eSine)) + 0.08 * u.energy(t, 0.2);
    }

    // ------------------------------------------------------------------ camera (our own perspective projection)
    var F = 1000, CX = 960, CY = 540, NEAR = 0.6;
    function mono(xs, ys) {   // monotone cubic (Fritsch-Carlson): smooth, no overshoot
      var n = xs.length, d = [], m = [], i;
      for (i = 0; i < n - 1; i++) d.push((ys[i + 1] - ys[i]) / (xs[i + 1] - xs[i]));
      m[0] = d[0]; m[n - 1] = d[n - 2];
      for (i = 1; i < n - 1; i++) m[i] = d[i - 1] * d[i] <= 0 ? 0 : (d[i - 1] + d[i]) / 2;
      for (i = 0; i < n - 1; i++) {
        if (d[i] === 0) { m[i] = m[i + 1] = 0; continue; }
        var a = m[i] / d[i], b = m[i + 1] / d[i], s = a * a + b * b;
        if (s > 9) { var k = 3 / Math.sqrt(s); m[i] = k * a * d[i]; m[i + 1] = k * b * d[i]; }
      }
      return function (x) {
        if (x <= xs[0]) return ys[0]; if (x >= xs[n - 1]) return ys[n - 1];
        var j = 0; while (x > xs[j + 1]) j++;
        var h = xs[j + 1] - xs[j], t = (x - xs[j]) / h, t2 = t * t, t3 = t2 * t;
        return (2 * t3 - 3 * t2 + 1) * ys[j] + (t3 - 2 * t2 + t) * h * m[j] + (-2 * t3 + 3 * t2) * ys[j + 1] + (t3 - t2) * h * m[j + 1];
      };
    }
    // crane progress p(t): 0 until 3.75, accelerates for 1 s, uniform through the silence, settles on 9.375
    var CAM_L = T_F - T_CRANE, ACC = 0.6, DEC = 1.15, PN = 1200, PT = new Float64Array(PN + 1);
    (function () {
      function vel(s) { if (s <= 0 || s >= CAM_L) return 0; return (s < ACC ? u.smooth(s / ACC) : 1) * (s > CAM_L - DEC ? u.smooth((CAM_L - s) / DEC) : 1); }
      var acc = 0; for (var i = 0; i <= PN; i++) { PT[i] = acc; acc += vel((i + 0.5) * CAM_L / PN) * CAM_L / PN; }
      for (var j = 0; j <= PN; j++) PT[j] /= PT[PN];
    })();
    function camP(t) { if (t <= T_CRANE) return 0; if (t >= T_F) return 1; var x = (t - T_CRANE) / CAM_L * PN, i = Math.floor(x); return lerp(PT[i], PT[Math.min(PN, i + 1)], x - i); }
    var KP = [0, 0.1, 0.3, 0.55, 0.8, 1];
    var fY = mono(KP, [2.4, 46, 380, 800, 1150, 1371].map(Math.log));
    var fZ = mono(KP, [-58, -82, -190, 20, 400, 686]);
    var fA = mono(KP, [-5.71, 7, 33, 56, 77, 90]);
    var cam = { x: 0, y: 2.4, z: -58, phi: 0, sp: 0, cp: 1, deg: 0 };
    function setCam(t) {
      var p = camP(t);
      cam.y = Math.exp(fY(p)); cam.z = fZ(p); cam.deg = fA(p);
      if (t > T_F) cam.y *= 1 - 0.035 * seg(t, T_F, D, eSine);   // a slow settle after the reveal
      cam.phi = cam.deg * Math.PI / 180; cam.sp = Math.sin(cam.phi); cam.cp = Math.cos(cam.phi);
    }
    var PX = 0, PY = 0, PZ = 0;
    function proj(x, y, z) {
      var dy = y - cam.y, dz = z - cam.z, zc = dz * cam.cp - dy * cam.sp;
      PZ = zc; if (zc < NEAR) return false;
      var yc = dy * cam.cp + dz * cam.sp;
      PX = CX + F * (x - cam.x) / zc; PY = CY - F * yc / zc; return true;
    }
    function horizonY() { return cam.deg > 84 ? -1e5 : CY - F * Math.tan(cam.phi); }

    // ------------------------------------------------------------------ the brain-shaped city
    var NR = 120, DZ = 8, DEP = 7.3, ZB0 = 2, ZC = 482, BZ = 482, G = 9, AW = 362, NEXP = 2.4, RC = 30, HMAX = 44;
    function outerX(z) {
      var a = Math.abs((z - ZC) / BZ); if (a >= 1) return G;
      var egg = 1 + 0.08 * (ZC - z) / BZ;   // a little wider toward the back (near end, bottom of the top view)
      var lobes = 1 + 0.028 * Math.sin(z * 0.021 + 0.6) + 0.016 * Math.sin(z * 0.052 + 2.1);   // gentle lobes
      return G + AW * egg * lobes * Math.pow(1 - Math.pow(a, NEXP), 1 / NEXP);
    }
    function innerX(z) { var e = BZ - Math.abs(z - ZC); if (e >= RC) return G; if (e <= 0) return G + RC; var k = RC - e; return G + RC - Math.sqrt(RC * RC - k * k); }

    // sulci: meandering streets carved through the blocks (world x, z), right hemisphere first, left mirrored with
    // its own seed (a brain is never exactly symmetric)
    var NZ = u.makeNoise('s08-sulci');
    var SUL = [];
    function genSulci(side, seed) {
      var r = u.rand('s08-sul-' + seed), out = [], i, s;
      var NM = 15;
      for (i = 0; i < NM; i++) {
        var z = 48 + (i + 0.5 + r.range(-0.25, 0.25)) * (868 / NM);
        var x = innerX(z) + r.range(2, 14), base = r.range(-0.3, 0.3) + (z < ZC ? -0.22 : 0.22), ph = r() * 6.283, amp = r.range(0.7, 1.05), fq = r.range(0.42, 0.62);
        var pts = [[side * x, z]], ang = base, stop = r.range(8, 26);
        for (s = 0; s < 160; s++) {
          ang = base + amp * Math.sin(s * fq + ph) + 0.55 * NZ.noise2(i * 3.7 + seed * 11.1, s * 0.11);
          x += Math.cos(ang) * 4; z += Math.sin(ang) * 4;
          if (x > outerX(z) - stop || z < 24 || z > 940) break;
          pts.push([side * x, z]);
          if (s > 6 && s % 17 === 9 && r() < 0.6) {   // a side branch
            var bxp = x, bzp = z, ba = ang + (r() < 0.5 ? 1.3 : -1.3), bp = [[side * bxp, bzp]];
            for (var q = 0; q < r.int(4, 9); q++) { ba += 0.5 * Math.sin(q * 0.9 + ph); bxp += Math.cos(ba) * 4; bzp += Math.sin(ba) * 4; if (bxp > outerX(bzp) - 12 || bxp < innerX(bzp) + 8) break; bp.push([side * bxp, bzp]); }
            if (bp.length > 2) out.push(bp);
          }
        }
        if (pts.length > 4) out.push(pts);
      }
      for (i = 0; i < 30; i++) {   // short secondary sulci between the main ones
        var z2 = r.range(60, 905), xo = outerX(z2), xi = innerX(z2);
        if (xo - xi < 60) continue;
        var x2 = r.range(xi + 18, xo - 22), a2 = r.range(-0.6, 0.6) + (r() < 0.5 ? 0 : Math.PI), p2 = [[side * x2, z2]], n2 = r.int(5, 12), ph2 = r() * 6.283;
        for (s = 0; s < n2; s++) {
          var a = a2 + 0.95 * Math.sin(s * 0.75 + ph2);
          x2 += Math.cos(a) * 4; z2 += Math.sin(a) * 4;
          if (x2 > outerX(z2) - 12 || x2 < innerX(z2) + 8) break;
          p2.push([side * x2, z2]);
        }
        if (p2.length > 3) out.push(p2);
      }
      return out;
    }
    SUL = genSulci(1, 1).concat(genSulci(-1, 2));
    var SUL_BB = SUL.map(function (pl) {
      var b = [1e9, 1e9, -1e9, -1e9];
      pl.forEach(function (p) { b[0] = Math.min(b[0], p[0]); b[1] = Math.min(b[1], p[1]); b[2] = Math.max(b[2], p[0]); b[3] = Math.max(b[3], p[1]); });
      return b;
    });
    var SW = 4.1;   // half width of a sulcus street
    function sulcusDist(x, z, cap) {
      var best = cap * cap;
      for (var i = 0; i < SUL.length; i++) {
        var b = SUL_BB[i]; if (x < b[0] - cap || x > b[2] + cap || z < b[1] - cap || z > b[3] + cap) continue;
        var pl = SUL[i];
        for (var j = 0; j < pl.length - 1; j++) {
          var ax = pl[j][0], az = pl[j][1], vx = pl[j + 1][0] - ax, vz = pl[j + 1][1] - az;
          var L2 = vx * vx + vz * vz, k = L2 > 0 ? clamp(((x - ax) * vx + (z - az) * vz) / L2, 0, 1) : 0;
          var dx = x - ax - vx * k, dz = z - az - vz * k, d2 = dx * dx + dz * dz;
          if (d2 < best) best = d2;
        }
      }
      return Math.sqrt(best);
    }
    function inSulcus(x, z) {
      for (var i = 0; i < SUL.length; i++) {
        var b = SUL_BB[i]; if (x < b[0] - SW || x > b[2] + SW || z < b[1] - SW || z > b[3] + SW) continue;
        var pl = SUL[i];
        for (var j = 0; j < pl.length - 1; j++) {
          var ax = pl[j][0], az = pl[j][1], bx = pl[j + 1][0], bz = pl[j + 1][1], vx = bx - ax, vz = bz - az;
          var L2 = vx * vx + vz * vz, k = L2 > 0 ? clamp(((x - ax) * vx + (z - az) * vz) / L2, 0, 1) : 0;
          var dx = x - ax - vx * k, dz = z - az - vz * k;
          if (dx * dx + dz * dz < SW * SW) return true;
        }
      }
      return false;
    }

    // memory-curve skyline of a row: u = 0 at the outer edge (the moment it was learnt) .. 1 at the fissure
    function profCold(uu) { return 0.2 + 0.8 * Math.exp(-3.2 * uu); }
    var SAW_F = [0.42, 0.6, 0.72, 0.8], SAW_L = [3.6, 2.7, 2.0, 1.5];
    function profSaw(uu) { var k = Math.min(3, Math.floor(uu * 4)), s = uu * 4 - k; return SAW_F[k] + (0.97 - SAW_F[k]) * Math.exp(-SAW_L[k] * s); }
    function profGold(uu, ph, lv) { return lv + 0.03 * Math.sin(uu * 7 + ph); }
    function prof(uu, q, ph, lv) {
      if (lv == null) lv = 0.9;
      if (q <= 0) return profCold(uu);
      if (q >= 1) return profGold(uu, ph, lv);
      var sw = lerp(profCold(uu), profSaw(uu), lv / 0.9);
      if (q < 0.42) return lerp(profCold(uu), sw, eP2io(q / 0.42));
      return lerp(sw, profGold(uu, ph, lv), eP3io((q - 0.42) / 0.58));
    }
    var NFIRST = 48, LIFT = 0.72;
    var SWEEP = 1.15;
    function rowStart(k) { return k < NFIRST ? T_CRANE + Math.floor(k / 4) * S16 : T_STOP + 0.04 + (k - NFIRST) / (NR - NFIRST) * SWEEP; }
    function wallRow(tw) {
      if (tw < T_CRANE) return -1;
      if (tw < T_STOP) { var x = (tw - T_CRANE) / S16, n = Math.floor(x), f = x - n; return 4 * n + 4 * eP3o(clamp(f / 0.6, 0, 1)); }
      return Math.max(NFIRST, NFIRST + (tw - T_STOP - 0.04) / SWEEP * (NR - NFIRST));
    }

    // the shockwave: a screen circle around the learner's head, radius r(t), out of the frame on 1.875
    var HEAD_S = { x: 960, y: 735 }, RMAX = 1330;
    function ringR(t) { return t <= 0 ? 0 : t >= RING_T ? RMAX : RMAX * (1 - Math.pow(1 - t / RING_T, 2.2)); }
    function ringInv(d) { return d >= RMAX ? RING_T : RING_T * (1 - Math.pow(1 - d / RMAX, 1 / 2.2)); }

    // learner (a billboard in the world): feet at z = ZL, 7 units in front of the camera at street level
    var ZL = -51;

    // build the rows
    setCam(0);
    if (proj(0, 1.6, ZL)) { HEAD_S.x = PX; HEAD_S.y = PY; }
    var R0 = u.rand('s08-rows'), rows = [];
    for (var k = 0; k < NR; k++) {
      var z0 = ZB0 + k * DZ, zm = z0 + DEP / 2, xi = innerX(zm), xo = outerX(zm);
      var R = { k: k, z0: z0, z1: z0 + DEP, zm: zm, xi: xi, xo: xo, H: HMAX * lerp(1, 0.52, u.smooth((k - 3) / 16)) * (0.9 + 0.2 * R0()), ph: R0() * 6.283,
        x0: [], x1: [], uu: [], hv: [], tw: [], rb: [], sh: [], start: rowStart(k), words: {}, lv: lerp(0.42, 0.9, u.smooth((k - 2) / 14)) };
      if (xo - xi > 4) {
        for (var side = -1; side <= 1; side += 2) {
          var x = xi + R0.range(0.3, 1.0);
          while (x < xo - 1.5) {
            var w = k < 8 ? R0.range(3.4, 6.4) : R0.range(6, 11), xe = Math.min(x + w, xo);
            if (xe - x < 1.6) break;
            var xc = (x + xe) / 2;
            if (!inSulcus(side * xc, zm)) {
              var uu = clamp((xo - xc) / (xo - xi), 0, 1), hv = 0.72 + 0.28 * R0(), towerProb = R0(), towerH = R0.range(6, 20);
              // towers only near the street front, and only toward the sides of the opening shot (clear of the text)
              var tower = (k < 7 && xc / (z0 - (-58)) > 0.62 && towerProb < 0.32) ? towerH : 0;
              R.x0.push(side > 0 ? x : -xe); R.x1.push(side > 0 ? xe : -x);
              var dS = sulcusDist(side * xc, zm, 26), shade = u.smooth((dS - SW) / 15) * u.smooth((xo - xc) / 46) * (0.55 + 0.45 * u.smooth((xc - xi) / 22));
              var rbv = clamp(Math.round((0.12 + 0.88 * shade) * (0.86 + 0.14 * R0()) * 5), 0, 5);
              R.uu.push(uu); R.hv.push(hv); R.tw.push(tower); R.rb.push(rbv); R.sh.push(Infinity);
            }
            x = xe + R0.range(0.6, 1.3);
          }
        }
      }
      R.n = R.x0.length;
      rows.push(R);
    }
    function bHeight(R, i, q, flat) { return (R.H * prof(R.uu[i], q, R.ph, R.lv) * R.hv[i] + R.tw[i]) * flat; }

    // shock times: the near rows light up when the rim of the shockwave passes their face (opening camera)
    var KS = 16;
    for (var ks = 0; ks < KS; ks++) {
      var RS = rows[ks];
      for (var bi = 0; bi < RS.n; bi++) {
        var hc = bHeight(RS, bi, 0, 1);
        var dsh;
        if (proj((RS.x0[bi] + RS.x1[bi]) / 2, hc * 0.5, RS.z0)) dsh = Math.hypot(PX - HEAD_S.x, PY - HEAD_S.y); else dsh = RMAX;
        RS.sh[bi] = ringInv(Math.min(dsh, RMAX - 1)) + 0.05 * hsh(ks * 1000 + bi, 'shj');
      }
    }

    // windows: a cell is 1.55 wide and 1.85 tall in world units; lit when hash > 0.16
    var WIN_W = 1.55, WIN_H = 1.85;
    function winLit(k, i, c, f) { return hsh(((k * 211 + i) * 31 + c) * 97 + f, 'wl') > 0.16; }
    function winCol(k, i, c, f) { return Math.floor(hsh(((k * 211 + i) * 31 + c) * 97 + f, 'wc') * 3); }

    // ------------------------------------------------------------------ the reversed waterfall (letters back to windows)
    var row0 = rows[0], GAP0 = F * row0.xi / (row0.z0 - (-58));   // half width of the street-front opening on screen
    var targets = [];
    (function () {
      var cand = [];
      for (var kk = 0; kk < 4; kk++) {
        var Rr = rows[kk];
        for (var i = 0; i < Rr.n; i++) {
          var x0 = Rr.x0[i], x1 = Rr.x1[i], h = bHeight(Rr, i, 0, 1), cols = Math.max(1, Math.floor((x1 - x0) / WIN_W));
          var floors = Math.floor((h - 0.6) / WIN_H), cw = (x1 - x0) / cols;
          for (var c = 0; c < cols; c++) for (var f = 0; f < Math.min(floors, 5); f++) {
            if (!winLit(kk, i, c, f)) continue;
            var wx0 = x0 + c * cw + cw * 0.14, wx1 = x0 + (c + 1) * cw - cw * 0.14, wy0 = 0.6 + f * WIN_H + 0.32, wy1 = wy0 + 1.12;
            if (!proj(wx0, wy0, Rr.z0)) continue; var ax = PX, ay = PY;
            if (!proj(wx1, wy1, Rr.z0)) continue; var bx = PX, by = PY;
            var cx = (ax + bx) / 2, cy = (ay + by) / 2;
            if (bx - ax < 21 || cx < 80 || cx > 1840 || cy < 360 || cy > 700) continue;
            if (kk > 0 && Math.abs(cx - 960) > GAP0 - 14) continue;   // hidden behind the street front
            if (Math.abs(cx - 960) < 190 && cy < 600) continue;        // keep the air around "retrieval" clear
            cand.push({ k: kk, i: i, c: c, f: f, wx0: wx0, wx1: wx1, wy0: wy0, wy1: wy1, z: Rr.z0, sx: cx, sy: cy });
          }
        }
      }
      var r = u.rand('s08-targets'), pick = r.shuffle(cand), used = [];
      for (var j = 0; j < pick.length && used.length < 56; j++) {
        var p = pick[j], ok = true;
        for (var m = 0; m < used.length; m++) if (Math.abs(used[m].sx - p.sx) < 36 && Math.abs(used[m].sy - p.sy) < 22) { ok = false; break; }
        if (ok) used.push(p);
      }
      var wr = u.rand('s08-words'), pool = wr.shuffle(WORDS.filter(function (w) { return w.length >= 4 && w.length <= 9; }));
      used.sort(function (a, b) { return hsh(a.sx * 7 + a.sy, 'ord') - hsh(b.sx * 7 + b.sy, 'ord'); });
      used.forEach(function (p, j) { p.word = pool[j]; p.launch = T_L2 + 0.02 + j * (2.95 / used.length); });
      targets = used;
    })();
    var letters = [];
    (function () {
      var r = u.rand('s08-letters');
      targets.forEach(function (tg) {
        var wd = tg.word, n = wd.length, span = (tg.wx1 - tg.wx0) * 0.86, x0 = tg.wx0 + (tg.wx1 - tg.wx0) * 0.07;
        var lastLand = 0;
        for (var i = 0; i < n; i++) {
          var lx = x0 + (i + 0.5) * span / n, ly = (tg.wy0 + tg.wy1) / 2, lz = tg.z - 0.02;
          var sx = lx * 0.55 + r.range(-22, 22), sy = -r.range(20, 52), sz = lz - r.range(14, 40);
          var L = { tg: tg, ch: wd[i], p0: [sx, sy, sz], p2: [lx, ly, lz], p1: [lerp(sx, lx, 0.35) + r.range(-12, 12), ly + r.range(5, 16), lerp(sz, lz, 0.55)],
            t0: tg.launch + i * 0.01, dur: r.range(1.0, 1.35), size: (tg.wy1 - tg.wy0) * 0.62, rot: r.range(-1.2, 1.2) };
          lastLand = Math.max(lastLand, L.t0 + L.dur);
          letters.push(L);
        }
        tg.land = lastLand;
        var Rr = rows[tg.k]; (Rr.words[tg.i] = Rr.words[tg.i] || []).push(tg);
      });
    })();
    // loose grains of the waterfall (the ash of s03 rising again)
    var grains = [];
    (function () {
      var r = u.rand('s08-grains');
      for (var i = 0; i < 620; i++) {
        var k2 = r.int(0, 5), Rr = rows[k2], tx2 = r.range(-60, 60), ty = r.range(3, 26), tz = Rr.z0 - r.range(0.5, 3);
        var sx = tx2 * 0.5 + r.range(-30, 30), sy = -r.range(15, 60), sz = tz - r.range(12, 44);
        grains.push({ p0: [sx, sy, sz], p1: [lerp(sx, tx2, 0.4), ty + r.range(4, 14), lerp(sz, tz, 0.5)], p2: [tx2, ty, tz],
          t0: r.range(T_L2, T_L2 + 3.3), dur: r.range(0.9, 1.6), s: r.range(0.08, 0.2), c: r.int(0, 2) });
      }
    })();
    function bez(L, e, out) {
      var a = (1 - e) * (1 - e), b = 2 * (1 - e) * e, c = e * e;
      out[0] = a * L.p0[0] + b * L.p1[0] + c * L.p2[0]; out[1] = a * L.p0[1] + b * L.p1[1] + c * L.p2[1]; out[2] = a * L.p0[2] + b * L.p1[2] + c * L.p2[2];
    }

    // fireflies: rise from the lifted roofs, some carry a tiny word
    var flies = [];
    (function () {
      var r = u.rand('s08-flies');
      for (var i = 0; i < 1300; i++) {
        var k3 = Math.min(NR - 1, Math.floor(Math.pow(r(), 1.15) * NR)), Rr = rows[k3];
        if (Rr.xo - Rr.xi < 6) continue;
        var side = r() < 0.5 ? -1 : 1, x = side * r.range(Rr.xi + 2, Rr.xo - 2);
        var spawn = realOfW(Rr.start + 0.22 + r() * 0.85);
        flies.push({ x: x, z: Rr.z0 + r() * DEP, y0: Rr.H * 0.86 + r.range(0, 6), v: r.range(5, 12), dx: r.range(-2.5, 2.5), dz: r.range(-2.5, 2.5),
          sw: r.range(0.8, 2.4), ph: r() * 6.283, spawnP: tauP(spawn), r: r.range(0.18, 0.42), word: i % 11 === 0 ? r.pick(WORDS) : null,
          c: r.int(0, 2), life: r.range(3.2, 5.2) });
      }
    })();

    // outskirts: the dark world around the brain, never lit (cold)
    var outs = [];
    (function () {
      var r = u.rand('s08-outs');
      while (outs.length < 760) {
        var x = r.range(-1250, 1250), z = r.range(-420, 1600);
        var inB = z > 0 && z < 964 && Math.abs(x) < outerX(z) + 30;
        if (inB || (Math.abs(x) < 40 && z < 0)) continue;
        outs.push({ x: x, z: z, s: r.range(0.8, 2.6), a: r.range(0.12, 0.45) });
      }
    })();

    // hemisphere outlines (world) for the trace of light, and the sulci for the nerve pulses
    var HEMI = [];
    (function () {
      for (var sd = -1; sd <= 1; sd += 2) {
        var outer = [], inner = [];
        for (var z = 0; z <= 964; z += 3) { var a = outerX(z), b = innerX(z); if (a > b + 0.3) { outer.push([sd * a, z]); inner.push([sd * b, z]); } }
        HEMI.push(outer.concat(inner.reverse()).concat([outer[0]]));
      }
    })();

    // ------------------------------------------------------------------ DOM layers
    var worldWrap = u.el('div', { cls: 'fill', parent: root });
    var flashEl = u.el('div', { cls: 'fill', parent: root, style: { background: '#fff3d6', opacity: 0 } });
    var scrimA = u.el('div', { cls: 'fill', parent: root, style: { background: 'radial-gradient(ellipse 60% 40% at 50% 34%, rgba(10,5,2,.78) 0%, rgba(10,5,2,.5) 55%, rgba(10,5,2,0) 100%)', opacity: 0 } });
    var scrimB = u.el('div', { cls: 'fill', parent: root, style: { background: 'radial-gradient(ellipse 66% 27% at 50% 17%, rgba(14,8,2,.85) 0%, rgba(14,8,2,.5) 55%, rgba(14,8,2,0) 100%)', opacity: 0 } });
    var scrimC = u.el('div', { cls: 'fill', parent: root, style: { background: 'radial-gradient(ellipse 30% 16% at 85% 93%, rgba(12,6,2,.78) 0%, rgba(12,6,2,.4) 55%, rgba(12,6,2,0) 100%)', opacity: 0 } });
    var textL = u.el('div', { cls: 'fill', parent: root });

    // ------------------------------------------------------------------ the world canvas
    var SPR = {};
    function glowSprite(col) {
      if (SPR[col]) return SPR[col];
      var R = Math.round(32 * dpr), c = document.createElement('canvas'); c.width = c.height = R * 2;
      var g = c.getContext('2d'), gr = g.createRadialGradient(R, R, 0, R, R, R), cc = hex(col);
      gr.addColorStop(0, 'rgba(255,250,235,1)'); gr.addColorStop(0.12, rgb(cc, 1)); gr.addColorStop(0.35, rgb(cc, 0.38));
      gr.addColorStop(0.7, rgb(cc, 0.08)); gr.addColorStop(1, rgb(cc, 0));
      g.fillStyle = gr; g.fillRect(0, 0, R * 2, R * 2); SPR[col] = c; return c;
    }
    var GOLDS = ['#ffcf70', '#ffb547', '#fff1c9'];
    var C = {
      fCold: hex('#0e1729'), fWarm: hex('#2a1709'), sCold: hex('#0a111f'), sWarm: hex('#1b0f06'),
      rCold: hex('#090f1c'), rColdHi: hex('#1a2642'), rWarmLo: hex('#4a2a0c'), rWarmHi: hex('#ffd889'),
      lCold: hex('#7fa6e0'), lWarm: hex('#ffcf70'), wCold: hex('#16213a'), wColdLit: hex('#6f8fc4'),
      wGold: GOLDS.map(hex), wDarkWarm: hex('#1e1206')
    };
    var SKY_O = [-760, -420, -230, -110, -40, 0];
    var SKY_COLD = ['#04060b', '#070b16', '#0a1020', '#0e172c', '#131d35', '#1a2540'].map(hex);
    var SKY_DW = ['#0b0705', '#120a06', '#1b0f08', '#28170b', '#321d0e', '#3d2511'].map(hex);
    var SKY_BL = ['#0a0f2a', '#24183f', '#7a3956', '#ef7464', '#ff9a4c', '#ffdcab'].map(hex);
    function skyCols(b) { return SKY_DW.map(function (c, i) { return mixc(c, SKY_BL[i], b); }); }
    function skyFill(g, hy, cols) {
      var gr = g.createLinearGradient(0, hy - 760, 0, hy);
      for (var i = 0; i < cols.length; i++) gr.addColorStop(1 + SKY_O[i] / 760, rgb(cols[i]));
      return gr;
    }
    var GROUND_FAR_C = hex('#141d33'), GROUND_NEAR_C = hex('#04060b'), GROUND_FAR_W = hex('#4a2a12'), GROUND_NEAR_W = hex('#0e0805');
    var GROUND_TOP = hex('#1a1208');

    var bloomA = document.createElement('canvas'), bloomB = document.createElement('canvas');
    var BW1 = Math.round(W * dpr / 4), BH1 = Math.round(H * dpr / 4), BW2 = Math.round(W * dpr / 10), BH2 = Math.round(H * dpr / 10);
    bloomA.width = BW1; bloomA.height = BH1; bloomB.width = BW2; bloomB.height = BH2;
    var bgA = bloomA.getContext('2d'), bgB = bloomB.getContext('2d');

    var order = []; for (var oi = 0; oi < NR; oi++) order.push(oi);
    var TMP = [0, 0, 0];
    var skyB = 0, warmGlobal = 0;

    function resetCtx(g) {   // canvas state survives between frames: start every frame from the same state
      g.lineCap = 'butt'; g.lineJoin = 'miter'; g.lineWidth = 1; g.setLineDash([]); g.lineDashOffset = 0; g.filter = 'none';
      g.textAlign = 'start'; g.textBaseline = 'alphabetic'; g.font = '10px sans-serif'; g.fillStyle = '#000'; g.strokeStyle = '#000';
      g.shadowBlur = 0; g.shadowColor = 'rgba(0,0,0,0)'; g.imageSmoothingEnabled = true; g.miterLimit = 10;
    }
    u.canvas(worldWrap, function (g, t, info) {
      resetCtx(g);
      var tc = clamp(t, 0, D);
      setCam(tc);
      var tw = tauW(tc), tp = tauP(tc), GL = glowLevel(tc);
      var hy = horizonY(), r = ringR(tc);
      skyB = 0.95 * seg(tc, T_L2 - 0.1, T_L2 + 1.6, eP2o);
      warmGlobal = tc >= RING_T ? 1 : 0;
      var fogAmt = 1 - seg(cam.deg, 6, 28);
      var flat = 1 - 0.85 * seg(tc, T_LAST, D + 0.05, eP2io);

      // ---- sky and ground
      drawSkyGround(g, tc, hy, r);
      // ---- god rays and the golden vanishing point
      var sunK = skyB * (1 - seg(cam.deg, 2, 13));
      if (hy > -200 && hy < H + 200 && sunK > 0.01) {
        var vg = g.createRadialGradient(CX, hy, 0, CX, hy, 760);
        vg.addColorStop(0, rgb(hex('#fff1c9'), 0.4 * sunK)); vg.addColorStop(0.25, rgb(hex('#ffb547'), 0.22 * sunK)); vg.addColorStop(1, 'rgba(255,140,60,0)');
        g.globalCompositeOperation = 'lighter'; g.fillStyle = vg; g.fillRect(0, Math.max(0, hy - 760), W, Math.min(H, hy + 18) - Math.max(0, hy - 760));
        var rg = g.createRadialGradient(CX, hy, 0, CX, hy, 1100);
        rg.addColorStop(0, rgb(hex('#ffd27a'), 0.16 * sunK * GL)); rg.addColorStop(1, 'rgba(255,200,120,0)');
        g.fillStyle = rg; g.beginPath();
        for (var ri = 0; ri < 11; ri++) {
          var a0 = -Math.PI + 0.18 + ri * 0.255 + 0.04 * Math.sin(tc * 0.4 + ri), wd = 0.05 + 0.04 * hsh(ri, 'ray');
          g.moveTo(CX, hy); g.lineTo(CX + Math.cos(a0) * 1400, hy + Math.sin(a0) * 1400); g.lineTo(CX + Math.cos(a0 + wd) * 1400, hy + Math.sin(a0 + wd) * 1400); g.closePath();
        }
        g.fill(); g.globalCompositeOperation = 'source-over';
      }
      drawOutskirts(g, tc);
      drawRiver(g, tc, GL);
      drawRows(g, tc, tw, GL, fogAmt, flat);
      drawReflection(g, info, tc);
      drawWall(g, tc, tw, GL);
      drawFlies(g, tc, tp, GL, flat);
      drawLetters(g, tc, tp, GL);
      drawLearner(g, tc, GL);
      drawBeam(g, tc, GL);
      drawOutline(g, tc, flat);
      drawPulses(g, tc);
      drawGrid(g, tc);
      bloom(g, info, (0.55 + 0.45 * GL) * (tc < 0.6 ? 1 + 0.6 * (1 - tc / 0.6) : 1));
      drawRing(g, info, tc, r);
      drawFlare(g, tc, GL);
    });

    var reflC = document.createElement('canvas'); reflC.width = BW1; reflC.height = BH1; var rfg = reflC.getContext('2d');
    function drawReflection(g, info, tc) {
      var k = 1 - seg(cam.deg, 0, 7); if (k <= 0.01) return;
      if (!proj(0, 0, rows[0].z0)) return; var yb = PY;
      var sx = BW1 / W, sy = BH1 / H;
      rfg.setTransform(1, 0, 0, 1, 0, 0); rfg.globalCompositeOperation = 'source-over'; rfg.clearRect(0, 0, BW1, BH1);
      rfg.setTransform(sx, 0, 0, -sy * 1.7, 0, sy * yb * 2.7); rfg.filter = 'blur(1.2px)';
      rfg.drawImage(info.canvas, 0, 0, info.canvas.width, Math.round(yb * info.dpr), 0, 0, W, Math.round(yb * info.dpr) / info.dpr); rfg.filter = 'none';
      rfg.setTransform(sx, 0, 0, sy, 0, 0); rfg.clearRect(0, 0, W, yb);
      rfg.globalCompositeOperation = 'destination-in';
      var gr = rfg.createLinearGradient(0, yb, 0, yb + 330); gr.addColorStop(0, 'rgba(0,0,0,1)'); gr.addColorStop(0.35, 'rgba(0,0,0,0.45)'); gr.addColorStop(1, 'rgba(0,0,0,0)');
      rfg.fillStyle = gr; rfg.fillRect(0, yb, W, H - yb);
      g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.globalCompositeOperation = 'lighter'; g.globalAlpha = 0.5 * k;
      g.drawImage(reflC, 0, 0, info.canvas.width, info.canvas.height); g.restore();
    }
    function drawSkyGround(g, tc, hy, r) {
      var cols = skyCols(skyB * (1 - 0.8 * seg(cam.deg, 3, 20)));
      var groundWarmFar = mixc(GROUND_FAR_W, hex('#7a3f1c'), skyB), gFar, gNear;
      if (hy > 0) {
        var bot = Math.min(H, hy);
        if (tc < RING_T) {
          g.fillStyle = skyFill(g, hy, SKY_COLD); g.fillRect(0, 0, W, bot);
          g.save(); g.beginPath(); g.arc(HEAD_S.x, HEAD_S.y, r, 0, 6.2832); g.clip();
          g.fillStyle = skyFill(g, hy, cols); g.fillRect(0, 0, W, bot); g.restore();
        } else { g.fillStyle = skyFill(g, hy, cols); g.fillRect(0, 0, W, bot); }
      }
      if (hy < H) {
        var top = Math.max(0, hy);
        function ground(far, near) {
          if (cam.deg > 84) return rgb(mixc(near, GROUND_TOP, 1));
          var gr = g.createLinearGradient(0, hy, 0, hy + 520);
          gr.addColorStop(0, rgb(far)); gr.addColorStop(0.18, rgb(mixc(far, near, 0.55))); gr.addColorStop(1, rgb(near));
          return gr;
        }
        var topK = seg(cam.deg, 40, 88);
        var nearW = mixc(GROUND_NEAR_W, GROUND_TOP, topK);
        if (tc < RING_T) {
          g.fillStyle = ground(GROUND_FAR_C, GROUND_NEAR_C); g.fillRect(0, top, W, H - top);
          g.save(); g.beginPath(); g.arc(HEAD_S.x, HEAD_S.y, r, 0, 6.2832); g.clip();
          g.fillStyle = ground(groundWarmFar, nearW); g.fillRect(0, top, W, H - top); g.restore();
        } else { g.fillStyle = ground(groundWarmFar, nearW); g.fillRect(0, top, W, H - top); }
      }
      if (hy > -60 && hy < H + 60 && tc >= RING_T) {   // haze on the horizon line
        var hz = g.createLinearGradient(0, hy - 46, 0, hy + 30), hc = mixc(hex('#5a2f16'), hex('#ffb547'), skyB * (1 - seg(cam.deg, 2, 16)));
        hz.addColorStop(0, rgb(hc, 0)); hz.addColorStop(0.62, rgb(hc, 0.55)); hz.addColorStop(1, rgb(hc, 0));
        g.fillStyle = hz; g.fillRect(0, hy - 46, W, 76);
      }
    }

    function drawOutskirts(g, tc) {
      g.fillStyle = '#7fa6e0';
      for (var i = 0; i < outs.length; i++) {
        var o = outs[i]; if (!proj(o.x, 0.2, o.z)) continue;
        if (PX < -10 || PX > W + 10 || PY < -10 || PY > H + 10) continue;
        var s = Math.max(0.7, o.s * F / PZ * 0.5);
        g.globalAlpha = o.a * (0.55 + 0.45 * seg(cam.deg, 20, 80)); g.fillRect(PX - s / 2, PY - s / 2, s, s);
      }
      g.globalAlpha = 1;
    }

    function riverHalf(z) { return z < -24 ? 0.42 : lerp(0.42, 7.2, u.smooth((z + 24) / 44)); }
    function drawRiver(g, tc, GL) {
      var warm = seg(tc, 0.02, 0.35), L = [], Rr = [];
      for (var z = ZL - 2; z <= 964; z += (z < 20 ? 1.5 : z < 200 ? 6 : 16)) {
        var hw = riverHalf(z);
        if (!proj(-hw, 0.05, z)) continue; var lx = PX, ly = PY;
        proj(hw, 0.05, z); L.push(lx, ly); Rr.push(PX, PY);
      }
      if (L.length < 4) return;
      g.globalCompositeOperation = 'lighter';
      for (var pass = 0; pass < 2; pass++) {
        g.beginPath();
        var cx0 = (L[0] + Rr[0]) / 2, grow = pass === 0 ? 2.4 : 1;
        for (var i = 0; i < L.length; i += 2) { var mx = (L[i] + Rr[i]) / 2, my = (L[i + 1] + Rr[i + 1]) / 2; g[i ? 'lineTo' : 'moveTo'](mx + (L[i] - mx) * grow, my + (L[i + 1] - my) * grow); }
        for (var j = Rr.length - 2; j >= 0; j -= 2) { var mx2 = (L[j] + Rr[j]) / 2, my2 = (L[j + 1] + Rr[j + 1]) / 2; g.lineTo(mx2 + (Rr[j] - mx2) * grow, my2 + (Rr[j + 1] - my2) * grow); }
        g.closePath();
        var col = mixc(hex('#3a5a8a'), pass === 0 ? hex('#ff9a3c') : hex('#ffe2a0'), warm), A = (pass === 0 ? 0.13 : 0.36) * (0.4 + 0.6 * warm) * (0.7 + 0.3 * GL);
        // dim at the learner's feet so the figure reads, full where it flows into the brain
        var nearOK = proj(0, 0.05, ZL + 1.5), nx = PX, ny = PY, farOK = proj(0, 0.05, 60);
        if (nearOK && farOK && Math.hypot(PX - nx, PY - ny) > 4) {
          var rgd = g.createLinearGradient(nx, ny, PX, PY); rgd.addColorStop(0, rgb(col, A * 0.2)); rgd.addColorStop(0.5, rgb(col, A * 0.4)); rgd.addColorStop(1, rgb(col, A)); g.fillStyle = rgd;
        } else g.fillStyle = rgb(col, A);
        g.fill();
      }
      g.globalCompositeOperation = 'source-over';
    }

    // ---- the rows (painter's order, far first; per row: side faces, roofs, fronts, windows, roofline)
    var dist = new Float64Array(NR);
    function drawRows(g, tc, tw, GL, fogAmt, flat) {
      for (var i = 0; i < NR; i++) dist[i] = Math.abs(rows[i].zm - cam.z);
      for (var oi0 = 0; oi0 < NR; oi0++) order[oi0] = oi0;   // fresh every frame: no dependence on the last frame
      order.sort(function (a, b) { return (dist[b] - dist[a]) || (b - a); });
      var fogC = mixc(hex('#1a2540'), hex('#6a3a3c'), skyB);
      var lineA = 1 - 0.82 * seg(cam.deg, 52, 86);
      for (var oi = 0; oi < NR; oi++) drawRow(g, rows[order[oi]], tc, tw, GL, fogAmt, fogC, lineA, flat);
    }
    var FP = [], SP = [], RP = [];
    function colorKey(arr, key) { return arr[key] || (arr[key] = new Path2D()); }
    function drawRow(g, R, tc, tw, GL, fogAmt, fogC, lineA, flat) {
      if (!R.n) return;
      var roofK = lerp(0.6, 1, seg(cam.deg, 44, 84));
      var q = seg(tw, R.start, R.start + (R.k < NFIRST ? LIFT : 0.6));
      var zf = cam.z < R.z0 ? R.z0 : (cam.z > R.z1 ? R.z1 : NaN);
      var dd = Math.hypot(R.zm - cam.z, cam.y);
      var fog = fogAmt * clamp((dd - 150) / 900, 0, 0.7);
      var fronts = {}, sides = {}, roofs = {};
      var keysF = [], keysS = [], keysR = [];
      var bx = R.bx || (R.bx = new Float32Array(R.n * 6));   // per building: front rect for windows (x0,y0,x1,y1,h,ok)
      var roofVis = true, rowWarm = q;
      for (var i = 0; i < R.n; i++) {
        var x0 = R.x0[i], x1 = R.x1[i], h = bHeight(R, i, q, flat);
        bx[i * 6 + 5] = 0;
        // cull fast with the front-bottom-centre point
        if (!proj((x0 + x1) / 2, h * 0.5, R.zm)) continue;
        var sc = F / PZ, mx = PX, my = PY, rad = (x1 - x0 + h + DEP) * sc;
        if (mx + rad < -20 || mx - rad > W + 20 || my + rad < -20 || my - rad > H + 20) continue;
        var wS = tc >= R.sh[i] ? Math.min(1, (tc - R.sh[i]) / 0.22) : 0, wv = Math.max(wS, q);
        if (wv > rowWarm) rowWarm = wv;
        var lev = Math.round(wv * 4), rk = lev + '|' + R.rb[i];
        // side face toward the camera (camera x = 0)
        var xs = x0 > 0 ? x0 : (x1 < 0 ? x1 : NaN), ok = true;
        if (xs === xs) {
          var sp = sides[lev]; if (!sp) { sp = sides[lev] = new Path2D(); keysS.push(lev); }
          if (proj(xs, 0, R.z0)) { var a1 = PX, a2 = PY; if (proj(xs, 0, R.z1)) { var b1 = PX, b2 = PY; if (proj(xs, h, R.z1)) { var c1 = PX, c2 = PY; if (proj(xs, h, R.z0)) { sp.moveTo(a1, a2); sp.lineTo(b1, b2); sp.lineTo(c1, c2); sp.lineTo(PX, PY); sp.closePath(); } } } }
        }
        if (cam.y > h) {
          var rp = roofs[rk]; if (!rp) { rp = roofs[rk] = new Path2D(); keysR.push(rk); }
          if (proj(x0, h, R.z0)) { var d1 = PX, d2 = PY; if (proj(x1, h, R.z0)) { var e1 = PX, e2 = PY; if (proj(x1, h, R.z1)) { var f1 = PX, f2 = PY; if (proj(x0, h, R.z1)) { rp.moveTo(d1, d2); rp.lineTo(e1, e2); rp.lineTo(f1, f2); rp.lineTo(PX, PY); rp.closePath(); } } } }
        }
        if (zf === zf) {
          var fp = fronts[lev]; if (!fp) { fp = fronts[lev] = new Path2D(); keysF.push(lev); }
          if (proj(x0, 0, zf)) { var g1 = PX, g2 = PY; if (proj(x1, 0, zf)) { var h1 = PX, h2 = PY; if (proj(x1, h, zf)) { var i1 = PX, i2 = PY; if (proj(x0, h, zf)) {
            fp.moveTo(g1, g2); fp.lineTo(h1, h2); fp.lineTo(i1, i2); fp.lineTo(PX, PY); fp.closePath();
            bx[i * 6] = Math.min(g1, PX); bx[i * 6 + 1] = Math.min(PY, i2); bx[i * 6 + 2] = Math.max(h1, i1); bx[i * 6 + 3] = Math.max(g2, h2); bx[i * 6 + 4] = h; bx[i * 6 + 5] = wv + 1;
          } } } }
        }
      }
      var j;
      for (j = 0; j < keysS.length; j++) { var ls = keysS[j] / 4; g.fillStyle = rgb(mixc(mixc(C.sCold, C.sWarm, ls), fogC, fog)); g.fill(sides[keysS[j]]); }
      for (j = 0; j < keysR.length; j++) {
        var kp = keysR[j].split('|'), lr = +kp[0] / 4, rb = +kp[1] / 5;
        var coldC = mixc(C.rCold, C.rColdHi, rb), warmC = mixc(C.rWarmLo, C.rWarmHi, clamp((0.08 + 0.92 * rb) * roofK * clamp(GL, 0, 1.1) * (0.35 + 0.65 * flat), 0, 1));
        var rc = mixc(coldC, warmC, lr);
        g.fillStyle = rgb(mixc(rc, fogC, fog)); g.fill(roofs[keysR[j]]);
      }
      for (j = 0; j < keysF.length; j++) { var lf = keysF[j] / 4; g.fillStyle = rgb(mixc(mixc(C.fCold, C.fWarm, lf), fogC, fog)); g.fill(fronts[keysF[j]]); }
      // windows on big faces (near rows only)
      if (R.k < 18 && zf === zf) drawWindows(g, R, tc, tw, GL, fog, fogC, zf);
      // the roofline: the memory curve of this row
      var la = lineA * Math.max(seg(cam.deg, 1, 12), q > 0 ? 1 : 0) * seg(dd, 90, 220);
      if (la > 0.02) drawRoofline(g, R, q, rowWarm, GL, fog, fogC, la, flat, zf === zf ? zf : R.z0);
    }
    function drawWindows(g, R, tc, tw, GL, fog, fogC, zf) {
      var bx = R.bx, tp = tauP(tc);
      for (var i = 0; i < R.n; i++) {
        var o = i * 6; if (!bx[o + 5]) continue;
        var fw = bx[o + 2] - bx[o], fh = bx[o + 3] - bx[o + 1];
        if (fh < 34 || fw < 12) continue;
        var wv = bx[o + 5] - 1, h = bx[o + 4], x0 = R.x0[i], x1 = R.x1[i];
        var cols = Math.max(1, Math.floor((x1 - x0) / WIN_W)), floors = Math.floor((h - 0.6) / WIN_H), cw = (x1 - x0) / cols;
        if (floors < 1) continue;
        var wl = R.words[i];
        for (var c = 0; c < cols; c++) for (var f = 0; f < floors; f++) {
          var wx0 = x0 + c * cw + cw * 0.14, wx1 = x0 + (c + 1) * cw - cw * 0.14, wy0 = 0.6 + f * WIN_H + 0.32, wy1 = wy0 + 1.12;
          if (!proj(wx0, wy0, zf)) continue; var ax = PX, ay = PY;
          if (!proj(wx1, wy1, zf)) continue;
          var rx = Math.min(ax, PX), ry = Math.min(ay, PY), rw = Math.abs(PX - ax), rh = Math.abs(PY - ay);
          if (rw < 0.6 || rh < 0.6) continue;
          var lit = winLit(R.k, i, c, f), col;
          if (wv < 0.5) { col = lit && hsh(c * 13 + f + i * 7 + R.k * 1000, 'cl') > 0.86 ? rgb(mixc(C.wColdLit, fogC, fog), 0.35) : rgb(mixc(C.wCold, fogC, fog), 0.9); }
          else if (!lit) col = rgb(C.wDarkWarm);
          else { var gc = C.wGold[winCol(R.k, i, c, f)], tw2 = 0.78 + 0.22 * Math.sin(tc * 2.1 + c * 1.7 + f * 2.3 + i); col = rgb(mixc(mixc(C.fWarm, gc, clamp((0.55 + 0.45 * GL) * tw2, 0, 1)), fogC, fog * 0.5)); }
          g.fillStyle = col; g.fillRect(rx, ry, rw, rh);
          // a word that came back to this window
          if (wl && lit && wv >= 0.5) {
            for (var m = 0; m < wl.length; m++) {
              var tg = wl[m]; if (tg.c !== c || tg.f !== f) continue;
              // the letters land one by one and wait in the window; the word takes over once the last one is in
              if (tp >= tg.land - 1e-6 && rh > 6) {
                g.fillStyle = 'rgba(42,22,6,0.92)'; g.font = '400 ' + (rh * 0.62).toFixed(1) + 'px "Source Serif 4 Display"';
                g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(tg.word, rx + rw / 2, ry + rh * 0.54, rw * 0.92);
                var fl = 1 - clamp((tp - tg.land) / 0.35, 0, 1);
                if (fl > 0) { g.globalCompositeOperation = 'lighter'; g.fillStyle = 'rgba(255,241,201,' + (0.8 * fl).toFixed(3) + ')'; g.fillRect(rx - 3, ry - 3, rw + 6, rh + 6); g.globalCompositeOperation = 'source-over'; }
              }
            }
          }
        }
      }
    }
    function drawRoofline(g, R, q, rowWarm, GL, fog, fogC, lineA, flat, zl) {
      var col = mixc(C.lCold, C.lWarm, rowWarm), wq = clamp(q, 0, 1);
      for (var sd = -1; sd <= 1; sd += 2) {
        g.beginPath(); var started = false;
        for (var j = 0; j <= 26; j++) {
          var uu = j / 26, x = sd * (R.xo - uu * (R.xo - R.xi)), y = R.H * prof(uu, q, R.ph, R.lv) * flat + 0.25;
          if (!proj(x, y, zl)) { started = false; continue; }
          if (!started) { g.moveTo(PX, PY); started = true; } else g.lineTo(PX, PY);
        }
        var base = (0.5 + 0.5 * rowWarm) * lineA * (1 - fog * 0.6);
        g.lineJoin = 'round'; g.lineCap = 'round';
        if (rowWarm > 0.05) {
          g.globalCompositeOperation = 'lighter';
          g.strokeStyle = rgb(col, 0.2 * base * GL); g.lineWidth = 5 + 5 * wq; g.stroke();
          g.globalCompositeOperation = 'source-over';
        }
        g.strokeStyle = rgb(mixc(col, fogC, fog * 0.6), base); g.lineWidth = 1.1 + 1.3 * wq; g.stroke();
      }
    }

    // ---- the gold wall of the recall wave
    function drawWall(g, tc, tw, GL) {
      var wr = wallRow(tw); if (wr < 0 || wr > NR + 3) return;
      var z = ZB0 + wr * DZ - 1, xm = Math.max(outerX(Math.min(963, Math.max(1, z))), 30) + 6;
      var fade = 1 - seg(wr, NR - 8, NR + 3), pulse = 0;
      if (tw < T_STOP) { var x = (tw - T_CRANE) / S16; pulse = Math.exp(-(x - Math.floor(x)) * S16 / 0.06); }
      var a = (0.6 + 0.4 * pulse) * fade * (0.75 + 0.25 * GL) * seg(tw, T_CRANE, T_CRANE + 0.12);
      if (a <= 0.01) return;
      var hW = 64;
      if (!proj(-xm, 0, z)) return; var p1x = PX, p1y = PY;
      if (!proj(xm, 0, z)) return; var p2x = PX, p2y = PY;
      if (!proj(xm, hW, z)) return; var p3x = PX, p3y = PY;
      if (!proj(-xm, hW, z)) return; var p4x = PX, p4y = PY;
      var gr = g.createLinearGradient((p1x + p2x) / 2, (p1y + p2y) / 2, (p3x + p4x) / 2, (p3y + p4y) / 2);
      gr.addColorStop(0, rgb(hex('#ffd98f'), 0.5 * a)); gr.addColorStop(0.2, rgb(hex('#ffb547'), 0.24 * a)); gr.addColorStop(1, 'rgba(255,160,60,0)');
      g.globalCompositeOperation = 'lighter';
      g.fillStyle = gr; g.beginPath(); g.moveTo(p1x, p1y); g.lineTo(p2x, p2y); g.lineTo(p3x, p3y); g.lineTo(p4x, p4y); g.closePath(); g.fill();
      g.strokeStyle = rgb(hex('#ffe7b0'), 0.9 * a); g.lineWidth = 2.4; g.beginPath(); g.moveTo(p1x, p1y); g.lineTo(p2x, p2y); g.stroke();
      g.globalCompositeOperation = 'source-over';
    }

    function drawFlies(g, tc, tp, GL, flat) {
      g.globalCompositeOperation = 'lighter';
      g.textAlign = 'center'; g.textBaseline = 'middle';
      var amt = (0.5 + 0.5 * GL) * (0.4 + 0.6 * flat);
      for (var i = 0; i < flies.length; i++) {
        var f = flies[i], age = tp - f.spawnP; if (age <= 0) continue;
        var al = seg(age, 0, 0.35) * (1 - seg(age, f.life - 1, f.life)); if (al <= 0.01) continue;
        var x = f.x + f.dx * age + Math.sin(f.ph + age * f.sw) * 1.2, y = f.y0 * flat + f.v * age, z = f.z + f.dz * age;
        if (!proj(x, y, z)) continue;
        if (PX < -30 || PX > W + 30 || PY < -30 || PY > H + 30) continue;
        var s = f.r * F / PZ;
        if (f.word && s > 0.9) {
          var fs = 4.2 * s; if (fs >= 7) { g.globalAlpha = al * amt * 0.85; g.fillStyle = GOLDS[f.c]; g.font = 'italic 400 ' + fs.toFixed(1) + 'px "Source Serif 4 Display"'; g.fillText(f.word, PX, PY); continue; }
        }
        var sz = Math.max(2.2, s * 4.2);
        g.globalAlpha = clamp(al * amt * 1.15, 0, 1); g.drawImage(glowSprite(GOLDS[f.c]), PX - sz, PY - sz, sz * 2, sz * 2);
      }
      g.globalAlpha = 1; g.globalCompositeOperation = 'source-over';
    }

    function drawLetters(g, tc, tp, GL) {
      if (tc < T_L2) return;
      g.textAlign = 'center'; g.textBaseline = 'middle';
      var i, L, e, age;
      // grains first (behind the letters)
      g.globalCompositeOperation = 'lighter';
      for (i = 0; i < grains.length; i++) {
        L = grains[i]; age = tp - L.t0; if (age <= 0) continue;
        e = eP3o(clamp(age / L.dur, 0, 1)); var al = (1 - seg(age, L.dur * 0.75, L.dur + 0.4)) * seg(age, 0, 0.12);
        if (al <= 0.01) continue;
        bez(L, e, TMP); if (!proj(TMP[0], TMP[1], TMP[2])) continue;
        if (PX < -20 || PX > W + 20 || PY < -20 || PY > H + 20) continue;
        var sz = Math.max(1.2, L.s * F / PZ * 3);
        g.globalAlpha = al * 0.8; g.drawImage(glowSprite(GOLDS[L.c]), PX - sz, PY - sz, sz * 2, sz * 2);
      }
      g.globalAlpha = 1;
      for (i = 0; i < letters.length; i++) {
        L = letters[i]; age = tp - L.t0; if (age <= 0) continue;
        var pr = clamp(age / L.dur, 0, 1); if (pr >= 1 && tp >= L.tg.land) continue;
        e = eP3o(pr); bez(L, e, TMP); if (!proj(TMP[0], TMP[1], TMP[2])) continue;
        if (PX < -40 || PX > W + 40 || PY < -40 || PY > H + 40) continue;
        var fs = L.size * F / PZ * (1 + 1.5 * (1 - e));
        if (fs < 3) continue;
        // a short trail toward where it came from
        var e2 = eP3o(Math.max(0, pr - 0.035)); bez(L, e2, TMP);
        var px = PX, py = PY;
        if (proj(TMP[0], TMP[1], TMP[2])) {
          var tr = g.createLinearGradient(PX, PY, px, py); tr.addColorStop(0, 'rgba(255,181,71,0)'); tr.addColorStop(1, 'rgba(255,207,112,0.55)');
          g.strokeStyle = tr; g.lineWidth = Math.max(1, fs * 0.16); g.lineCap = 'round'; g.beginPath(); g.moveTo(PX, PY); g.lineTo(px, py); g.stroke();
        }
        g.save(); g.translate(px, py); g.rotate(L.rot * (1 - e));
        g.font = 'italic 400 ' + fs.toFixed(1) + 'px "Source Serif 4 Display"';
        g.fillStyle = 'rgba(255,214,140,' + (0.5 + 0.5 * GL * (0.6 + 0.4 * e)).toFixed(3) + ')';
        g.fillText(L.ch, 0, 0);
        g.restore();
      }
      g.globalCompositeOperation = 'source-over';
    }

    // ---- the learner: faceless line figure, head lamp 100 % warm gold from the first frame
    var LP = { head: 1.6, neck: 1.42, sh: 1.34, hip: 0.86, book: 1.08 };
    function drawLearner(g, tc, GL) {
      if (!proj(0, LP.head, ZL)) return; var hx = PX, hyy = PY, sc = F / PZ;
      if (hyy - 60 > H || hx < -100 || hx > W + 100) return;
      var pts = {}, list = [['neck', 0, LP.neck], ['hip', 0, LP.hip], ['fl', -0.15, 0], ['fr', 0.14, 0], ['sl', -0.13, LP.sh], ['sr', 0.13, LP.sh],
        ['el', -0.2, 1.12], ['er', 0.2, 1.12], ['hl', -0.1, LP.book], ['hr', 0.1, LP.book], ['bl', -0.17, 0.98], ['br', 0.17, 1.2]];
      for (var i = 0; i < list.length; i++) { if (!proj(list[i][1], list[i][2], ZL)) return; pts[list[i][0]] = [PX, PY]; }
      var lw = Math.max(1, 0.045 * sc);
      g.strokeStyle = 'rgba(255,243,223,0.92)'; g.lineWidth = lw; g.lineCap = 'round'; g.lineJoin = 'round';
      g.beginPath();
      g.moveTo(pts.neck[0], pts.neck[1]); g.lineTo(pts.hip[0], pts.hip[1]);
      g.moveTo(pts.fl[0], pts.fl[1]); g.lineTo(pts.hip[0], pts.hip[1]); g.lineTo(pts.fr[0], pts.fr[1]);
      g.moveTo(pts.hl[0], pts.hl[1]); g.lineTo(pts.el[0], pts.el[1]); g.lineTo(pts.sl[0], pts.sl[1]); g.lineTo(pts.sr[0], pts.sr[1]); g.lineTo(pts.er[0], pts.er[1]); g.lineTo(pts.hr[0], pts.hr[1]);
      g.stroke();
      // the closed book at the chest, its spine still glowing a little
      g.fillStyle = '#20140a'; g.fillRect(pts.bl[0], pts.br[1], pts.br[0] - pts.bl[0], pts.bl[1] - pts.br[1]);
      g.strokeStyle = 'rgba(255,243,223,0.85)'; g.lineWidth = Math.max(1, lw * 0.6); g.strokeRect(pts.bl[0], pts.br[1], pts.br[0] - pts.bl[0], pts.bl[1] - pts.br[1]);
      var spine = 0.25 + 0.75 * Math.exp(-tc / 0.5);
      g.globalCompositeOperation = 'lighter'; g.strokeStyle = 'rgba(255,241,201,' + spine.toFixed(3) + ')'; g.lineWidth = Math.max(1, lw * 0.7);
      g.beginPath(); g.moveTo(hx, pts.br[1]); g.lineTo(hx, pts.bl[1]); g.stroke();
      // head: the motif dot rides the column up into it in the first 0.12 s
      var rise = seg(tc, 0, 0.12, eP2o), dotY = lerp(pts.bl[1] - (pts.bl[1] - pts.br[1]) * 0.4, hyy, rise);
      var hr = 0.16 * sc, lamp = lerp(0.25, 1, rise);
      var halo = hr * (2.3 + 1.1 * GL) * (1 + 1.4 * Math.exp(-tc / 0.3));
      var hg = g.createRadialGradient(hx, hyy, hr * 0.8, hx, hyy, halo);
      hg.addColorStop(0, 'rgba(255,207,112,' + (0.5 * lamp).toFixed(3) + ')'); hg.addColorStop(0.35, 'rgba(255,170,70,' + (0.16 * lamp).toFixed(3) + ')'); hg.addColorStop(1, 'rgba(255,150,60,0)');
      g.fillStyle = hg; g.beginPath(); g.arc(hx, hyy, halo, 0, 6.2832); g.fill();
      g.globalCompositeOperation = 'source-over';
      g.strokeStyle = 'rgba(42,20,4,0.75)'; g.lineWidth = Math.max(1, hr * 0.12); g.beginPath(); g.arc(hx, hyy, hr * 1.06, 0, 6.2832); g.stroke();
      g.fillStyle = rgb(mixc(hex('#c9a46a'), hex('#ffcf70'), lamp)); g.beginPath(); g.arc(hx, hyy, hr, 0, 6.2832); g.fill();
      g.fillStyle = 'rgba(255,250,235,' + (0.85 * lamp).toFixed(3) + ')'; g.beginPath(); g.arc(hx, hyy, hr * 0.55, 0, 6.2832); g.fill();
      if (rise < 1) { g.globalCompositeOperation = 'lighter'; var ds = Math.max(4, hr * 0.7); g.drawImage(glowSprite('#fff1c9'), hx - ds * 3, dotY - ds * 3, ds * 6, ds * 6); g.globalCompositeOperation = 'source-over'; }
    }

    function drawBeam(g, tc, GL) {
      var a = Math.exp(-tc / 0.42) * seg(tc, -0.01, 0.0001); if (a < 0.01) return;
      if (!proj(0, LP.book, ZL)) return; var bx = PX, by = PY;
      var wv = 70 * (0.5 + 0.5 * a) + 30;
      g.globalCompositeOperation = 'lighter';
      var gr = g.createLinearGradient(bx - wv, 0, bx + wv, 0);
      gr.addColorStop(0, 'rgba(255,170,70,0)'); gr.addColorStop(0.35, 'rgba(255,190,90,' + (0.18 * a).toFixed(3) + ')');
      gr.addColorStop(0.5, 'rgba(255,248,230,' + (0.95 * a).toFixed(3) + ')'); gr.addColorStop(0.65, 'rgba(255,190,90,' + (0.18 * a).toFixed(3) + ')'); gr.addColorStop(1, 'rgba(255,170,70,0)');
      g.fillStyle = gr; g.fillRect(bx - wv, -20, wv * 2, by + 20);
      var core = Math.max(2, 6 * a); g.fillStyle = 'rgba(255,252,242,' + Math.min(1, a * 1.2).toFixed(3) + ')'; g.fillRect(bx - core / 2, -20, core, by + 20);
      g.globalCompositeOperation = 'source-over';
    }

    function polyProj(pl, y) {
      var out = [];
      for (var i = 0; i < pl.length; i++) { if (proj(pl[i][0], y, pl[i][1])) out.push(PX, PY); }
      return out;
    }
    function strokePartial(g, pts, p) {
      if (pts.length < 4 || p <= 0) return null;
      var Ls = [0], i; for (i = 2; i < pts.length; i += 2) Ls.push(Ls[Ls.length - 1] + Math.hypot(pts[i] - pts[i - 2], pts[i + 1] - pts[i - 1]));
      var tot = Ls[Ls.length - 1], lim = tot * clamp(p, 0, 1), head = [pts[0], pts[1]];
      g.beginPath(); g.moveTo(pts[0], pts[1]);
      for (i = 1; i < Ls.length; i++) {
        if (Ls[i] <= lim) { g.lineTo(pts[i * 2], pts[i * 2 + 1]); head = [pts[i * 2], pts[i * 2 + 1]]; continue; }
        var k = (lim - Ls[i - 1]) / Math.max(1e-6, Ls[i] - Ls[i - 1]);
        head = [lerp(pts[i * 2 - 2], pts[i * 2], k), lerp(pts[i * 2 - 1], pts[i * 2 + 1], k)]; g.lineTo(head[0], head[1]); break;
      }
      g.stroke(); return head;
    }
    function drawOutline(g, tc, flat) {
      if (tc < T_F) return;
      var p = seg(tc, T_F, T_F2, eP2io), a = (0.55 + 0.45 * (1 - seg(tc, T_F2, T_F2 + 0.8))) * (0.3 + 0.7 * flat);
      g.globalCompositeOperation = 'lighter'; g.lineCap = 'round'; g.lineJoin = 'round';
      for (var hI = 0; hI < 2; hI++) {
        var pts = polyProj(HEMI[hI], 1);
        g.strokeStyle = 'rgba(255,190,90,' + (0.22 * a).toFixed(3) + ')'; g.lineWidth = 9; strokePartial(g, pts, p);
        g.strokeStyle = 'rgba(255,241,201,' + (0.9 * a).toFixed(3) + ')'; g.lineWidth = 2.2;
        var head = strokePartial(g, pts, p);
        if (head && p < 1) { var s = 14; g.drawImage(glowSprite('#fff1c9'), head[0] - s, head[1] - s, s * 2, s * 2); }
      }
      g.globalCompositeOperation = 'source-over';
    }
    // nerve pulses on the beats of the second F
    var PULSES = [];
    (function () {
      var r = u.rand('s08-pulses');
      [T_F2, T_F2 + BEAT, T_F2 + 2 * BEAT].forEach(function (t0, bI) {
        var ids = r.shuffle(SUL.map(function (_, i) { return i; })).slice(0, 7);
        ids.forEach(function (id) { PULSES.push({ pl: SUL[id], t0: t0 + r.range(0, 0.08), dur: r.range(0.7, 1.0), rev: r() < 0.25 }); });
        PULSES.push({ pl: [[0, 0], [0, 964]], t0: t0, dur: 1.0, rev: false, fissure: true });
      });
    })();
    function drawPulses(g, tc) {
      if (tc < T_F2) return;
      g.globalCompositeOperation = 'lighter';
      var fadeAll = 1 - 0.6 * seg(tc, T_LAST + 0.2, D);
      for (var i = 0; i < PULSES.length; i++) {
        var P = PULSES[i], pr = (tc - P.t0) / P.dur; if (pr <= 0 || pr > 1.25) continue;
        var pts = polyProj(P.pl, 1.5); if (pts.length < 4) continue;
        if (P.rev) { var rv = []; for (var j = pts.length - 2; j >= 0; j -= 2) rv.push(pts[j], pts[j + 1]); pts = rv; }
        var Ls = [0]; for (j = 2; j < pts.length; j += 2) Ls.push(Ls[Ls.length - 1] + Math.hypot(pts[j] - pts[j - 2], pts[j + 1] - pts[j - 1]));
        var tot = Ls[Ls.length - 1];
        for (var m = 0; m < 7; m++) {
          var pp = pr - m * 0.035; if (pp < 0 || pp > 1) continue;
          var Lh = tot * eSine(pp), q = 1; while (q < Ls.length - 1 && Ls[q] < Lh) q++;
          var kk = (Lh - Ls[q - 1]) / Math.max(1e-6, Ls[q] - Ls[q - 1]), x = lerp(pts[q * 2 - 2], pts[q * 2], kk), y = lerp(pts[q * 2 - 1], pts[q * 2 + 1], kk);
          var al = (1 - m / 7) * (1 - seg(pr, 0.85, 1.2)) * 0.75 * fadeAll, s = (P.fissure ? 13 : 10) * (1 - m * 0.08);
          g.globalAlpha = al; g.drawImage(glowSprite('#fff1c9'), x - s, y - s, s * 2, s * 2);
        }
      }
      g.globalAlpha = 1; g.globalCompositeOperation = 'source-over';
    }
    // flatten into s09's graph paper: streets pulled straight, a gold grid
    function drawGrid(g, tc) {
      var f = seg(tc, T_LAST, D + 0.05, eP2io); if (f <= 0) return;
      g.strokeStyle = 'rgba(255,207,112,' + (0.15 * f).toFixed(3) + ')'; g.lineWidth = 1;
      g.beginPath();
      var n;
      for (n = -16; n <= 16; n++) { var x = 960 + 60 * n; if (x < 0 || x > W) continue; var ext = clamp(f * 1.6 - Math.abs(n) * 0.04, 0, 1); g.moveTo(x + 0.5, 540 - 560 * ext); g.lineTo(x + 0.5, 540 + 560 * ext); }
      for (n = 0; n <= 15; n++) { var y = 860 - 60 * n; if (y < 0 || y > H) continue; var ex2 = clamp(f * 1.6 - Math.abs(y - 690) / 900, 0, 1); g.moveTo(960 - 980 * ex2, y + 0.5); g.lineTo(960 + 980 * ex2, y + 0.5); }
      g.stroke();
      // the sulci, pulled straight onto the grid
      g.globalCompositeOperation = 'lighter'; g.strokeStyle = 'rgba(255,207,112,' + (0.4 * f * (1 - 0.5 * f)).toFixed(3) + ')'; g.lineWidth = 1.4;
      for (var i = 0; i < SUL.length; i++) {
        var pts = polyProj(SUL[i], 0.5); if (pts.length < 4) continue;
        var my = 0; for (var j = 1; j < pts.length; j += 2) my += pts[j]; my /= pts.length / 2;
        var snap = 860 - 60 * Math.round((860 - my) / 60);
        g.beginPath();
        for (j = 0; j < pts.length; j += 2) { var yy = lerp(pts[j + 1], snap, f); if (j) g.lineTo(pts[j], yy); else g.moveTo(pts[j], yy); }
        g.stroke();
      }
      g.globalCompositeOperation = 'source-over';
    }

    function bloom(g, info, amt) {
      if (amt <= 0.01) return;
      var cv = info.canvas;
      bgA.setTransform(1, 0, 0, 1, 0, 0); bgA.globalCompositeOperation = 'copy'; bgA.globalAlpha = 1;
      bgA.filter = 'contrast(1.9) saturate(0.8) brightness(0.92) blur(' + (1.6 * dpr / 2 + 1).toFixed(1) + 'px)';
      bgA.drawImage(cv, 0, 0, BW1, BH1); bgA.filter = 'none';
      bgB.setTransform(1, 0, 0, 1, 0, 0); bgB.globalCompositeOperation = 'copy'; bgB.filter = 'blur(' + (2.2 * dpr / 2 + 1.5).toFixed(1) + 'px)';
      bgB.drawImage(bloomA, 0, 0, BW2, BH2); bgB.filter = 'none';
      g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.globalCompositeOperation = 'lighter';
      g.globalAlpha = clamp(0.42 * amt, 0, 1); g.drawImage(bloomA, 0, 0, cv.width, cv.height);
      g.globalAlpha = clamp(0.55 * amt, 0, 1); g.drawImage(bloomB, 0, 0, cv.width, cv.height);
      g.restore();
    }

    function drawRing(g, info, tc, r) {
      if (tc <= 0 || tc > RING_T + 0.15) return;
      var a = Math.pow(1 - clamp(tc / (RING_T + 0.15), 0, 1), 0.55), cx = HEAD_S.x, cy = HEAD_S.y, cv = info.canvas, d = info.dpr;
      // refraction: the frame inside the rim is pushed outward (the air in front of the wave)
      if (r > 30) {
        g.save(); g.beginPath(); g.arc(cx, cy, r + 4, 0, 6.2832); g.arc(cx, cy, Math.max(0, r - 70), 0, 6.2832, true); g.clip();
        g.setTransform(1, 0, 0, 1, 0, 0);
        var kk = 1 + 0.05 * a, ox = cx * d, oy = cy * d;
        g.globalAlpha = 0.85; g.drawImage(cv, ox - ox * kk, oy - oy * kk, cv.width * kk, cv.height * kk);
        g.restore();
      }
      g.globalCompositeOperation = 'lighter';
      var inner = Math.max(0, r - 90), gr = g.createRadialGradient(cx, cy, inner, cx, cy, r + 26);
      var span = r + 26 - inner;
      gr.addColorStop(0, 'rgba(255,170,60,0)'); gr.addColorStop(clamp((r - 30 - inner) / span, 0, 1), 'rgba(255,190,90,' + (0.22 * a).toFixed(3) + ')');
      gr.addColorStop(clamp((r - inner) / span, 0, 1), 'rgba(255,246,222,' + (0.85 * a).toFixed(3) + ')'); gr.addColorStop(clamp((r + 10 - inner) / span, 0, 1), 'rgba(255,190,90,' + (0.25 * a).toFixed(3) + ')');
      gr.addColorStop(1, 'rgba(255,170,60,0)');
      g.fillStyle = gr; g.beginPath(); g.arc(cx, cy, r + 26, 0, 6.2832); g.arc(cx, cy, inner, 0, 6.2832, true); g.fill();
      g.lineWidth = 3;
      g.strokeStyle = 'rgba(255,70,50,' + (0.42 * a).toFixed(3) + ')'; g.beginPath(); g.arc(cx, cy, r + 9, 0, 6.2832); g.stroke();
      g.strokeStyle = 'rgba(70,140,255,' + (0.42 * a).toFixed(3) + ')'; g.beginPath(); g.arc(cx, cy, Math.max(0, r - 9), 0, 6.2832); g.stroke();
      // its circle on the ground, running out to the horizon
      var Rw = 2 + Math.pow(r / RMAX, 1.5) * 1000, started = false;
      g.beginPath();
      for (var j = 0; j <= 96; j++) {
        var th = Math.PI * j / 96, x = Math.cos(th) * Rw, z = ZL + Math.sin(th) * Rw;
        if (!proj(x, 0.05, z) || PY < 0) { started = false; continue; }
        if (!started) { g.moveTo(PX, PY); started = true; } else g.lineTo(PX, PY);
      }
      g.strokeStyle = 'rgba(255,190,100,' + (0.22 * a).toFixed(3) + ')'; g.lineWidth = 10; g.stroke();
      g.strokeStyle = 'rgba(255,226,170,' + (0.5 * a).toFixed(3) + ')'; g.lineWidth = 1.6; g.stroke();
      g.globalCompositeOperation = 'source-over';
    }

    function drawFlare(g, tc, GL) {
      if (!proj(0, LP.head, ZL)) return; var hx = PX, hyy = PY;
      if (hyy > H + 80) return;
      var a = Math.exp(-tc / 0.32) + 0.35 * Math.exp(-Math.max(0, tc - T_L2) / 0.3) * (tc >= T_L2 ? 1 : 0) + 0.12 * GL * (1 - seg(tc, T_CRANE, T_CRANE + 0.8));
      if (a < 0.01) return;
      g.globalCompositeOperation = 'lighter';
      g.save(); g.translate(hx, hyy); g.scale(1, 0.022);
      var sg = g.createRadialGradient(0, 0, 0, 0, 0, 980);
      sg.addColorStop(0, 'rgba(255,246,222,' + Math.min(1, 0.9 * a).toFixed(3) + ')'); sg.addColorStop(0.3, 'rgba(255,190,90,' + (0.3 * a).toFixed(3) + ')'); sg.addColorStop(1, 'rgba(255,160,60,0)');
      g.fillStyle = sg; g.beginPath(); g.arc(0, 0, 980, 0, 6.2832); g.fill(); g.restore();
      g.strokeStyle = 'rgba(255,236,200,' + (0.35 * a).toFixed(3) + ')'; g.lineWidth = 1.5;
      g.beginPath();
      for (var i = 0; i < 6; i++) { var an = i * Math.PI / 3 + 0.3 + tc * 0.15, L = 120 + 160 * a; g.moveTo(hx + Math.cos(an) * 14, hyy + Math.sin(an) * 14); g.lineTo(hx + Math.cos(an) * L, hyy + Math.sin(an) * L); }
      g.stroke();
      g.globalCompositeOperation = 'source-over';
    }

    // camera shake (2 % on the climax, 2 px on the second downbeat) and the chroma kick
    var NS = u.makeNoise('s08-shake');
    var chSvg = u.svgEl('svg', { width: 0, height: 0, class: 'abs' }, root); chSvg.style.position = 'absolute';
    var chF = u.svgEl('filter', { id: 's08-chroma', x: '-2%', y: '-2%', width: '104%', height: '104%', 'color-interpolation-filters': 'sRGB' }, u.svgEl('defs', {}, chSvg));
    u.svgEl('feColorMatrix', { in: 'SourceGraphic', type: 'matrix', values: '1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0', result: 'r' }, chF);
    u.svgEl('feColorMatrix', { in: 'SourceGraphic', type: 'matrix', values: '0 0 0 0 0  0 1 0 0 0  0 0 0 0 0  0 0 0 1 0', result: 'g' }, chF);
    u.svgEl('feColorMatrix', { in: 'SourceGraphic', type: 'matrix', values: '0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0', result: 'b' }, chF);
    var chR = u.svgEl('feOffset', { in: 'r', dx: 0, dy: 0, result: 'ro' }, chF), chB = u.svgEl('feOffset', { in: 'b', dx: 0, dy: 0, result: 'bo' }, chF);
    u.svgEl('feBlend', { in: 'ro', in2: 'g', mode: 'screen', result: 'rg' }, chF); u.svgEl('feBlend', { in: 'rg', in2: 'bo', mode: 'screen' }, chF);
    var chW = { state: { amount: 0 } };
    u.onFrame(function (t) {
      var tc = clamp(t, 0, D);
      var A1 = 38 * Math.exp(-tc / 0.13) * (tc >= 0 ? 1 : 0), A2 = tc >= T_L2 ? 2.2 * Math.exp(-(tc - T_L2) / 0.1) : 0;
      var sx = NS.noise2(tc * 22, 1.3) * A1 + NS.noise2(tc * 30, 7.1) * A2, sy = NS.noise2(4.2, tc * 22) * A1 + NS.noise2(9.9, tc * 30) * A2;
      var sc = 1 + 0.03 * Math.exp(-tc / 0.2);
      worldWrap.style.transform = 'translate(' + sx.toFixed(2) + 'px,' + sy.toFixed(2) + 'px) scale(' + sc.toFixed(5) + ')';
      textL.style.transform = 'translate(' + (sx * 0.35).toFixed(2) + 'px,' + (sy * 0.35).toFixed(2) + 'px)';
      chW.state.amount = 9 * Math.exp(-tc / 0.12) * (tc < 0.6 ? 1 : 0) + (tc >= T_L2 && tc < T_L2 + 0.4 ? 3 * Math.exp(-(tc - T_L2) / 0.1) : 0);
      var chOn = chW.state.amount > 0.05, chA = chOn ? chW.state.amount.toFixed(2) : '0';
      chR.setAttribute('dx', chA); chB.setAttribute('dx', chOn ? (-chW.state.amount).toFixed(2) : '0');
      worldWrap.style.filter = chOn ? 'url(#s08-chroma)' : '';
      // flash: 3 frames of white gold, then 0.5 s expo.out; a soft one on the second downbeat (no flash on the stop)
      var fl = tc < 0.05 ? 1 : Math.max(0, 1 - eExpo(seg(tc, 0.05, 0.55)));
      if (tc >= T_L2) fl = Math.max(fl, 0.28 * (1 - eExpo(seg(tc, T_L2, T_L2 + 0.35))));
      flashEl.style.opacity = fl.toFixed(4); flashEl.style.visibility = fl > 0.001 ? '' : 'hidden';
      scrimA.style.opacity = (seg(tc, T_CRANE - 0.3, T_CRANE + 0.9, eSine) * (1 - seg(tc, T_OUT1 - 0.2, T_OUT1 + 0.3))).toFixed(4);
      scrimB.style.opacity = (seg(tc, T_OUT1 - 0.1, T_TH1 + 0.5, eSine) * (1 - seg(tc, T_OUT2 - 0.1, D + 0.05))).toFixed(4);
      scrimC.style.opacity = (seg(tc, T_CRANE + 0.4, T_CRANE + 1.2, eSine) * (1 - seg(tc, T_F - 0.6, T_F + 0.4))).toFixed(4);
    });

    // ------------------------------------------------------------------ texts
    var GLOW_C = '255,207,112';
    function auraText(e, GL, base) {
      var r = (12 + 30 * GL) * base;
      e.style.textShadow = '0 0 ' + (r * 0.4).toFixed(1) + 'px rgba(' + GLOW_C + ',.85), 0 0 ' + r.toFixed(1) + 'px rgba(' + GLOW_C + ',.42), 0 0 ' + (r * 2.2).toFixed(1) + 'px rgba(255,170,70,.22), 0 3px 16px rgba(18,8,0,.55)';
    }
    var l1 = u.text(textL, tx.l1.text, 'headline', { x: 960, y: 180, style: { fontSize: '150px', lineHeight: '1.08', color: '#fff3df' } });
    var l2 = u.text(textL, tx.l2.text, 'headline', { x: 960, y: 400, style: { fontSize: '150px', lineHeight: '1.08', color: '#fff3df' } });
    l1.style.transformOrigin = '50% 50%'; l2.style.transformOrigin = '50% -18%';   // line 2 grows downward, never into line 1
    u.onFrame(function (t) { var GL = glowLevel(clamp(t, 0, D)); auraText(l1, GL, 1); auraText(l2, GL, 1); });
    gsap.set(l2, { opacity: 0 });
    tl.fromTo(l1, { scale: 1.3, filter: 'blur(12px)' }, { scale: 1, filter: 'blur(0px)', duration: 0.35, ease: 'expo.out' }, 0);
    tl.set(l1, { filter: 'none' }, 0.36);
    tl.set(l2, { opacity: 1 }, T_L2);
    tl.fromTo(l2, { scale: 1.3, filter: 'blur(12px)' }, { scale: 1, filter: 'blur(0px)', duration: 0.35, ease: 'expo.out', immediateRender: false }, T_L2);
    tl.set(l2, { filter: 'none' }, T_L2 + 0.36);
    tl.to([l1, l2], { opacity: 0, duration: T_OUT1 - T_DIS, ease: 'power1.in' }, T_DIS);

    var src1 = u.text(textL, tx.src1.text, 'source', { x: 1856, y: 1030, anchor: 'bottom-right', style: { color: 'rgba(255,236,206,.72)' } });
    gsap.set(src1, { opacity: 0 });
    tl.fromTo(src1, { opacity: 0, x: 24 }, { opacity: 1, x: 0, duration: 0.5, ease: 'power2.out', immediateRender: false }, tx.src1.in);
    tl.to(src1, { opacity: 0, duration: 0.25, ease: 'power2.in' }, tx.src1.out - 0.25);

    // retrieval: the real glyph outlines of Source Serif 4 Display Italic, written by a pen of light
    var RET_PX = 80, RS = RET_PX / RET.upm, RET_Y = 552;
    var retW = RET.width * RS, svgW = 520, svgH = 170, ox = (svgW - retW) / 2, base = svgH / 2 + RET.xh * RS / 2;
    var retSvg = u.svgEl('svg', { width: svgW, height: svgH, viewBox: '0 0 ' + svgW + ' ' + svgH, class: 'abs' }, textL);
    retSvg.style.left = (960 - svgW / 2) + 'px'; retSvg.style.top = (RET_Y - svgH / 2) + 'px'; retSvg.style.overflow = 'visible';
    retSvg.setAttribute('aria-label', 'retrieval');
    var defs = u.svgEl('defs', {}, retSvg);
    var lg = u.svgEl('linearGradient', { id: 's08-retfill', x1: 0, y1: 0, x2: 0, y2: 1 }, defs);
    u.svgEl('stop', { offset: '0', 'stop-color': '#fff6e4' }, lg); u.svgEl('stop', { offset: '0.55', 'stop-color': '#ffe0a0' }, lg); u.svgEl('stop', { offset: '1', 'stop-color': '#ffbf5e' }, lg);
    var under = u.svgEl('ellipse', { cx: svgW / 2, cy: base - RET.xh * RS * 0.45, rx: retW * 0.66, ry: 50, fill: 'rgba(46,18,4,0.55)' }, retSvg);
    under.style.filter = 'blur(20px)';
    var retG = u.svgEl('g', {}, retSvg);
    var strokes = [], fills = [], dotEl = null, total = 0;
    function bboxOf(d) {
      var nums = d.match(/-?\d+(?:\.\d+)?/g).map(Number), b = { x0: 1e9, y0: 1e9, x1: -1e9, y1: -1e9 };
      for (var i = 0; i + 1 < nums.length; i += 2) { b.x0 = Math.min(b.x0, nums[i]); b.x1 = Math.max(b.x1, nums[i]); b.y0 = Math.min(b.y0, nums[i + 1]); b.y1 = Math.max(b.y1, nums[i + 1]); }
      return b;
    }
    RET.glyphs.forEach(function (gl, gi) {
      var gg = u.svgEl('g', { transform: 'translate(' + (ox + gl.x * RS).toFixed(2) + ',' + base.toFixed(2) + ') scale(' + RS + ',' + (-RS) + ')' }, retG);
      var keep = [];
      gl.contours.forEach(function (cd) {
        var bb = bboxOf(cd);
        if (gl.ch === 'i' && bb.y0 > 400) {   // the tittle of the i is the motif: a gold dot, not a stroke
          dotEl = { cx: ox + (gl.x + (bb.x0 + bb.x1) / 2) * RS, cy: base - (bb.y0 + bb.y1) / 2 * RS, r: Math.max(bb.x1 - bb.x0, bb.y1 - bb.y0) * RS * 0.58, gi: gi };
          return;
        }
        keep.push(cd);
      });
      var fill = u.svgEl('path', { d: keep.join(' '), fill: 'url(#s08-retfill)', opacity: 0 }, gg);
      fills.push(fill);
      keep.forEach(function (cd) {
        var p = u.svgEl('path', { d: cd, fill: 'none', stroke: '#ffe6ac', 'stroke-width': (1.7 / RS).toFixed(2), 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, gg);
        var L = p.getTotalLength();
        strokes.push({ p: p, L: L, gi: gi, gg: gl }); total += L;
      });
    });
    var dotG = u.svgEl('g', {}, retSvg);
    var dotHalo = u.svgEl('circle', { cx: dotEl.cx, cy: dotEl.cy, r: dotEl.r * 3.2, fill: 'rgba(255,207,112,0.35)' }, dotG); dotHalo.style.filter = 'blur(6px)';
    var dotCore = u.svgEl('circle', { cx: dotEl.cx, cy: dotEl.cy, r: dotEl.r, fill: '#fff1c9' }, dotG);
    var pen = u.svgEl('g', {}, retSvg);
    var penHalo = u.svgEl('circle', { cx: 0, cy: 0, r: 15, fill: 'rgba(255,207,112,0.45)' }, pen); penHalo.style.filter = 'blur(5px)';
    u.svgEl('circle', { cx: 0, cy: 0, r: 3.6, fill: '#fffaf0' }, pen);
    var RET_DUR = T_CRANE - T_RET;   // 1.25 s: the last stroke ends on the 3.75 downbeat
    var acc = 0, sched = [];
    strokes.forEach(function (s, i) {
      var st = T_RET + RET_DUR * acc / total, du = RET_DUR * s.L / total; acc += s.L;
      sched.push({ s: s, st: st, du: du });
      tl.fromTo(s.p, { drawSVG: '0% 0%' }, { drawSVG: '0% 100%', duration: du, ease: 'none' }, st);
      tl.to(s.p, { attr: { 'stroke-width': (0.9 / RS).toFixed(2) }, opacity: 0.55, duration: 0.5, ease: 'power2.out' }, st + du + 0.1);
    });
    // fills: each glyph fills in as soon as its last outline is closed
    RET.glyphs.forEach(function (gl, gi) {
      var end = 0; sched.forEach(function (sc) { if (sc.s.gi === gi) end = Math.max(end, sc.st + sc.du); });
      tl.fromTo(fills[gi], { opacity: 0 }, { opacity: 1, duration: 0.3, ease: 'power2.out', immediateRender: false }, end - 0.04);
      if (dotEl && dotEl.gi === gi) tl.fromTo(dotG, { scale: 0, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.35, ease: 'back.out(3)', immediateRender: false }, end);
    });
    gsap.set(dotG, { svgOrigin: dotEl.cx + ' ' + dotEl.cy, scale: 0, opacity: 0 });
    gsap.set(under, { opacity: 0 });
    tl.to(under, { opacity: 1, duration: 0.6, ease: 'power2.out' }, T_RET);
    // the pen rides the tip of whichever outline is being drawn (pure function of t)
    u.onFrame(function (t) {
      var tc = clamp(t, 0, D), on = null, f = 0;
      for (var i = 0; i < sched.length; i++) { var sc = sched[i]; if (tc >= sc.st && tc <= sc.st + sc.du) { on = sc; f = (tc - sc.st) / sc.du; break; } }
      var vis = tc >= T_RET && tc <= T_CRANE + 0.25;
      if (!on && vis) { on = sched[sched.length - 1]; f = 1; }
      if (!on || !vis) { pen.style.opacity = '0'; pen.setAttribute('transform', 'translate(-60,-60)'); return; }
      var pt = on.s.p.getPointAtLength(on.s.L * f), gl = on.s.gg;
      var x = ox + (gl.x + pt.x) * RS, y = base - pt.y * RS;
      pen.setAttribute('transform', 'translate(' + x.toFixed(2) + ',' + y.toFixed(2) + ')');
      pen.style.opacity = (tc > T_CRANE ? 1 - (tc - T_CRANE) / 0.25 : 1).toFixed(3);
    });
    tl.to(retSvg, { opacity: 0, duration: T_OUT1 - T_DIS, ease: 'power1.in' }, T_DIS);

    // the aha lines and retrieval break into gold motes that drift up
    var motes = [];
    (function () {
      var r = u.rand('s08-motes');
      function add(str, font, x, y, ls, n) {
        var pts = u.textPoints(str, { font: font, x: x, y: y, step: 4, max: n, letterSpacing: ls, seed: 's08' + str });
        pts.forEach(function (p) { motes.push({ x: p.x, y: p.y, d: (p.x - 380) / 1160 * 0.22 + r.range(0, 0.08), v: r.range(50, 130), wx: r.range(-30, 30), ph: r() * 6.283, s: r.range(1.1, 2.4), life: r.range(1.0, 1.7), c: r.int(0, 2) }); });
      }
      add(tx.l1.text, '900 150px "Noto Sans SC"', 960, 180, 4.5, 900);
      add(tx.l2.text, '900 150px "Noto Sans SC"', 960, 400, 4.5, 1000);
      add('retrieval', 'italic 400 80px "Source Serif 4 Display"', 960, RET_Y - 4, 0, 260);
    })();
    var moteCv = u.canvas(root, function (g, t) {
      resetCtx(g);
      var tc = clamp(t, 0, D); if (tc < T_DIS - 0.01 || tc > T_DIS + 2.2) return;
      g.globalCompositeOperation = 'lighter';
      for (var i = 0; i < motes.length; i++) {
        var m = motes[i], age = tc - T_DIS - m.d; if (age <= 0) continue;
        var al = seg(age, 0, 0.08) * (1 - seg(age, m.life * 0.4, m.life)); if (al <= 0.01) continue;
        var x = m.x + Math.sin(m.ph + age * 2.2) * 6 + m.wx * age, y = m.y - m.v * age - 40 * age * age, s = m.s * (1 + 0.6 * age) * 2.6;
        g.globalAlpha = al; g.drawImage(glowSprite(GOLDS[m.c]), x - s, y - s, s * 2, s * 2);
      }
      g.globalAlpha = 1; g.globalCompositeOperation = 'source-over';
    });

    // theme line: surfaces in the silence, char by char (warm white with a gold edge, strong contrast)
    function themeLine(txt, y) {
      var e = u.text(textL, txt, 'headline', { x: 960, y: y, style: { fontSize: '100px', lineHeight: '1.1', color: '#fff6e6', letterSpacing: '.04em' } });
      e.style.textShadow = '0 0 1.5px rgba(255,207,112,.95), 0 0 16px rgba(255,190,90,.5), 0 0 40px rgba(255,170,70,.22), 0 4px 22px rgba(10,5,0,.8)';
      return e;
    }
    var th1 = themeLine(tx.th1.text, 112), th2 = themeLine(tx.th2.text, 264);
    [[th1, T_TH1], [th2, T_TH2]].forEach(function (pr) {
      var chars = u.splitChars(pr[0]);
      gsap.set(chars, { opacity: 0 });
      tl.fromTo(chars, { opacity: 0, y: 22, filter: 'blur(9px)' }, { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.95, ease: 'power2.out', stagger: 0.045, immediateRender: false }, pr[1]);
      tl.set(chars, { filter: 'none' }, pr[1] + 0.95 + 0.045 * chars.length + 0.02);
      tl.to(pr[0], { opacity: 0, duration: 0.3, ease: 'power2.in' }, T_OUT2 - 0.3);
    });
    var src2 = u.text(textL, tx.src2.text, 'source', { x: 1856, y: 1030, anchor: 'bottom-right', style: { color: 'rgba(255,236,206,.72)' } });
    gsap.set(src2, { opacity: 0 });
    tl.fromTo(src2, { opacity: 0, x: 24 }, { opacity: 1, x: 0, duration: 0.6, ease: 'power2.out', immediateRender: false }, tx.src2.in);
    tl.to(src2, { opacity: 0, duration: 0.3, ease: 'power2.in' }, tx.src2.out - 0.3);

    window.__s08Handoff = { grid: { step: 60, x0: 960, y0: 860, alpha: 0.15, color: '#ffcf70' }, ground: '#1a1208', fissureX: 960,
      brain: { top: 337, bottom: 1040, centerY: 689 } };
  });
})();
