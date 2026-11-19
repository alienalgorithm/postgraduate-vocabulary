export const meta = {
  name: 'how-to-learn-english-animation-4k-v2',
  description: 'Classic-level music-only 4K animated short on how to truly learn English using the full technique toolbox: story, engine, royalty-free music, music-timed storyboard, per-scene build and review, assembly, director polish, QA',
  phases: [
    { title: 'Prepare', detail: 'story drafts with full toolbox, engine upgrade, music search (parallel)' },
    { title: 'Music', detail: 'choose, edit, master; beat map and energy envelope' },
    { title: 'Story', detail: 'final storyboard timed to music; fact and timing check' },
    { title: 'Scenes', detail: 'build each scene with 3+ techniques, adversarial review' },
    { title: 'Assemble', detail: '4K render, mux, preview, covers' },
    { title: 'Polish', detail: 'director watches the whole film, fixes the weakest moments, final QA' },
  ],
}

const A = args.A
const BRIEF = `Read ${A}/BRIEF.md first and obey every rule in it. It covers: the user request, the 4K spec, the royalty-free music rules, music-first timing, the 经典级标准, the 全技巧工具箱, the directory layout, the storyboard contract and the engine contract.`
const DONE = { type: 'object', properties: { ok: { type: 'boolean' }, notes: { type: 'string' }, files: { type: 'array', items: { type: 'string' } } }, required: ['ok', 'notes'] }
const REVIEW = { type: 'object', properties: { id: { type: 'string' }, verdict: { type: 'string', enum: ['pass', 'fixed', 'fail'] }, issues: { type: 'array', items: { type: 'string' } }, fixes: { type: 'array', items: { type: 'string' } } }, required: ['id', 'verdict', 'issues', 'fixes'] }
const SB = { type: 'object', properties: { title: { type: 'string' }, total: { type: 'number' }, rationale: { type: 'string' },
  scenes: { type: 'array', items: { type: 'object', properties: { id: { type: 'string' }, start: { type: 'number' }, duration: { type: 'number' }, summary: { type: 'string' } }, required: ['id', 'start', 'duration', 'summary'] } } },
  required: ['title', 'total', 'scenes', 'rationale'] }
const CANDS = { type: 'object', properties: { candidates: { type: 'array', items: { type: 'object', properties: {
  file: { type: 'string' }, title: { type: 'string' }, artist: { type: 'string' }, license: { type: 'string' }, page_url: { type: 'string' }, duration: { type: 'number' }, bpm: { type: 'number' }, mood: { type: 'string' }, arc: { type: 'string' }, fit: { type: 'string' } },
  required: ['file', 'title', 'artist', 'license', 'page_url', 'duration', 'bpm', 'mood', 'arc', 'fit'] } }, notes: { type: 'string' } }, required: ['candidates', 'notes'] }
const POLISH = { type: 'object', properties: { verdict: { type: 'string' }, targets: { type: 'array', items: { type: 'object', properties: { scene: { type: 'string' }, problem: { type: 'string' }, improvement: { type: 'string' } }, required: ['scene', 'problem', 'improvement'] } } }, required: ['verdict', 'targets'] }

// ---------------- Prepare ----------------
phase('Prepare')
const storyContent = async () => {
  const ANGLES = [
    { key: 'myth', brief: 'Myth-busting arc: open with a painful, relatable truth (years of English, words forgotten, still cannot understand), reveal WHY by visualizing how memory and acquisition really work, then the method as a few unforgettable rules, end with a quotable line and a screenshot-worthy method card.' },
    { key: 'journey', brief: 'Emotional journey arc: a faceless learner (a vector silhouette or a glowing dot) travels from frustration through discovery to fluency; each stage reveals one principle with a strong illustrated metaphor (a dark city lighting up word by word, a river of input, a seed growing into a tree of words, a constellation of words connecting).' },
    { key: 'system', brief: 'Data-visualization arc that makes the invisible visible: forgetting curves flattening under spaced retrieval, coverage meters for reading, a word lighting up after many encounters in context, a feedback-loop diagram; cinematic and precise like a premium science explainer, with a true 3D signature shot; ends with the full learning loop and a method card.' },
  ]
  const drafts = (await parallel(ANGLES.map(a => () => agent(`${BRIEF}

${A}/story/EVIDENCE.md is already written. Use only its facts.
Draft the CONTENT of the music-only animated short from this angle: ${a.brief}

THE MOST IMPORTANT REQUIREMENT, from the user: it must NOT be a text slideshow. Use the full technique toolbox in BRIEF.md:
- vector illustration and a faceless character, shape morphing, path drawing and motion paths, data visualization, particle and generative systems, 2.5D and three.js 3D, liquid/ink/light transitions, text effects, UI mockups, split-screen comparisons, light and texture, the user's own illustrations and 4K video frames as real examples, and music-reactive visuals.
- For every scene, list the techniques it uses (at least 3) and describe exactly what is drawn and how it moves.
- Plan at least 3 signature shots ("名场面") that people will screenshot and rewatch.
- Keep one visual motif through the whole film, and follow a color script: cold and dark at the start, bright and warm from the "恍然大悟" moment on.

Music will be chosen later and the timing fitted to it. So give each scene an approximate duration and an energy level from 1 to 10. The arc is: calm intro, tension, build, a big "恍然大悟" climax at about 65 to 80 percent of the runtime, resolution, ending.

Length: about 150 to 200 seconds, in 8 to 12 scenes.
On-screen text: Chinese, deeply convincing, short and quotable. Use big headline lines, small supporting lines and small source labels.
Ending: a method card worth screenshotting, and the credit "B站UP主 朋克英语".

Write your draft as JSON (the storyboard contract fields, plus "energy" and "techniques" per scene) to ${A}/story/draft_${a.key}.json. Return the scene list, total, title and rationale.`, { label: 'draft:' + a.key, phase: 'Prepare', schema: SB })))).filter(Boolean)
  return agent(`${BRIEF}

You are the director. Read ${A}/story/draft_myth.json, draft_journey.json, draft_system.json and ${A}/story/EVIDENCE.md, then create the single best CONTENT plan. Take the strongest arc and graft in the best ideas, lines, signature shots and visual techniques from the other two drafts.

The plan must:
- have a clear thesis the viewer ends up agreeing with;
- be a visually rich film, not a text slideshow. Every scene uses at least 3 toolbox techniques, and the film mixes illustration, a character, data visualization, particles or 3D, morphing and transitions, plus the user's own assets as real examples;
- have at least 3 signature shots, one visual motif and a clear color script;
- run 8 to 12 scenes, about 150 to 200 s;
- use no dashes;
- use facts only from EVIDENCE.md, with small source labels.

Also:
- Mark the single most important "恍然大悟" line and its scene.
- Give each scene an energy level from 1 to 10 and an approximate duration.
- Choose a premium cinematic palette with the color script.

Write ${A}/story/content.json: the contract fields with provisional timings, plus "energy" and "techniques" per scene, "aha": {"scene","text"}, "motif", "color_script" and "signature_shots". Also write ${A}/story/content.md as a readable version for the music director and the scene builders.

Return the provisional scene list, the total, the title and your rationale.`, { label: 'director', phase: 'Prepare', schema: SB })
}

const engineBranch = () => agent(`${BRIEF}

Task: finish and upgrade the render engine in ${A}/engine/. A previous run was stopped midway and left partial files: engine.js, util.js, lib.js, design.css, index.html and still.js. Read them, keep what is good and complete everything, following the engine contract in BRIEF.md. It must be rock solid, because 8 to 12 scene authors build on it.

Requirements:
- Use GSAP 3.13 from ${A}/node_modules/gsap/dist/ and register its free plugins: SplitText, MorphSVGPlugin, DrawSVGPlugin, MotionPathPlugin, CustomEase, ScrambleTextPlugin and Physics2DPlugin. Verify each one stays deterministic under timeline seek.
- ctx.util must provide these helpers, all deterministic:
  - rand(seed);
  - splitChars;
  - a particle and generative-field builder (canvas drawn from the timeline time only, at devicePixelRatio so it is sharp in 4K);
  - a number counter;
  - SVG line and curve drawing;
  - a glow sweep;
  - SVG filter helpers for liquid, ink and displacement transitions;
  - an image helper for the user's assets (illustrations and 4K video frames);
  - energy(t), which reads ${A}/music/energy.json (per-1/60 s values from 0 to 1, plus drum hit times) and returns 0.5 if the file is missing;
  - beat and bar helpers that read storyboard.music;
  - a three.js helper ctx.util.three(root, setup), which creates a WebGL canvas at devicePixelRatio and renders it from timeline time only, using three from ${A}/node_modules/three/build/three.module.min.js.
- Scenes are shown only in their own time range. Add an engine-level crossfade of about 0.3 s, and let scenes opt into custom transitions instead.
- window.seek(t) must be deterministic and wait for fonts and images.
- still.js and render.js must follow the contract, including --scale 1|2 for 4K.
- render.js streams frames to ffmpeg through a pipe, with no frame files on disk. It supports --from, --to, --fps, --out, --crf and --parallel 4, and concatenates chunks losslessly with no duplicated or missing frames.

Prove it end to end:
- Write a demo scene ${A}/scenes/demo.js with a SplitText headline, a MorphSVG shape morph, DrawSVG path drawing, particles, a three.js rotating sphere of word sprites, and an energy-driven glow.
- Render 6 s at 60 fps with --parallel 4, once at --scale 1 and once at --scale 2.
- Use ffprobe to confirm exactly 360 frames and 3840x2160 at scale 2.
- Read stills to confirm sharpness and that WebGL actually renders in headless chromium.
- Measure render speed at both scales, with and without the three.js layer.
- If three.js at 4K is too slow (the whole 3-minute film would take more than about 3 hours), document a fallback (CSS 3D or canvas 2.5D) and say so.

Write ${A}/engine/README.md with the full API for scene authors and short examples of every helper. Return ok, notes (with measured speeds) and files.`, { label: 'engine', phase: 'Prepare', schema: DONE })

const MUSIC_TASK = `Find royalty-free background music for a music-only 4K animated short "如何真正学好英语" on B站.
Emotional arc: calm, slightly melancholic intro (the struggle); curiosity and build; a big uplifting "恍然大悟" climax at about 65 to 80 percent; a warm, confident resolution; an ending. Total about 150 to 200 s.
Style: premium, modern and cinematic, such as inspiring piano with strings, cinematic electronic, or uplifting ambient. Avoid cheesy corporate ukulele and vocals with lyrics.
Licenses: CC0/public domain preferred; CC-BY only as a backup (attribution required); never NC, ND or unclear.
A previous stopped run may have left partial downloads in ${A}/music/pool/ and ${A}/music/pages/; reuse them if useful.
Install analysis tools if needed (pip install librosa soundfile). Download at least 8 promising tracks into ${A}/music/src/. For each track:
- record the page URL, artist, title and exact license text in ${A}/music/src/<file>.license.txt;
- analyze with librosa: duration, BPM, beat times, onset-strength and RMS energy curve, and section boundaries;
- save an energy plot PNG with the sections marked and Read it;
- judge whether its arc fits and whether it can be edited at bar lines to the needed length.
Return ranked candidates with notes.`
const musicSearch = () => parallel([
  () => agent(`${BRIEF}

${MUSIC_TASK}
Search these sources: freepd.com (all of it is CC0; check genre pages such as Epic, Upbeat, Electronic, Piano and Romantic) and freemusicarchive.org (CC0 only; files download from files.freemusicarchive.org).`, { label: 'music-search:freepd+fma', phase: 'Prepare', schema: CANDS }),
  () => agent(`${BRIEF}

${MUSIC_TASK}
Search these sources: opengameart.org (the music art type, CC0 only; cinematic, orchestral, ambient or inspiring tracks) and incompetech.com (Kevin MacLeod, CC-BY 4.0; backup only, record the exact attribution line).`, { label: 'music-search:oga+incompetech', phase: 'Prepare', schema: CANDS }),
])

const [content, engine, searches] = await parallel([storyContent, engineBranch, musicSearch])
if (!content) throw new Error('content plan missing')
const cands = (searches || []).filter(Boolean).flatMap(s => s.candidates)
log(`content ${content.scenes.length} scenes; engine ok=${engine && engine.ok}; ${cands.length} music candidates`)

// ---------------- Music ----------------
phase('Music')
await agent(`${BRIEF}

You are the music director. Read the content plan ${A}/story/content.json and ${A}/story/content.md: the energy per scene, the "aha" line, the signature shots and the arc. Candidate tracks with license proofs and analyses are in ${A}/music/src/:
${JSON.stringify(cands)}

1. Compare each candidate's energy curve and sections with the content arc, and choose the single best track. If no single track fits, you may join two that match in key and tempo, with a seamless transition. Prefer CC0.
2. Design the edit to about 150 to 200 s. Cut, repeat or skip sections only at bar lines, using equal-power crossfades. The music's biggest lift must land where the aha line should appear, and the ending must resolve cleanly. Do not change pitch. Change tempo only if unavoidable, and by no more than 3 percent.
3. Render ${A}/music/score.wav (48 kHz, stereo, 24-bit) and master it: about -14 LUFS integrated, true peak at most -1 dBTP, no clipping or clicks, no unintended silence. Measure with ffmpeg ebur128 and astats.
4. Re-analyze score.wav and write ${A}/music/map.json with: bpm, beat_offset, bar, beats, bars, sections [{name, start, end}], climax and total.
5. Write ${A}/music/energy.json containing: fps 60, values (normalized RMS energy per 1/60 s, smoothed, from 0 to 1) and hits (drum and onset hit times).
6. Write ${A}/music/LICENSES.md (every source with page URL, artist, title and license; for CC-BY, the exact attribution line) and ${A}/music/edit.md (what was cut where, and why).

Return ok, notes and files.`, { label: 'music-director', phase: 'Music', schema: DONE })

const musicQA = () => agent(`${BRIEF}

Adversarially QA the edited score ${A}/music/score.wav against ${A}/music/map.json, energy.json, edit.md and LICENSES.md. The user's audio standard is zero compromise. Check each of the following:
- Licenses: every source is CC0, or CC-BY with an attribution line. None is NC, ND or unclear. Re-open the license pages where possible.
- Loudness: about -14 LUFS integrated, true peak at most -1 dBTP, and no clipping.
- Clicks: none. Run a numpy scan for sample jumps, especially at every edit point listed in edit.md.
- Seams: none audible. Compare the spectrum and RMS on each side of every cut, render a spectrogram around each cut, and Read it.
- Silence: no unintended silence (silencedetect).
- Beat map: the beats in map.json match the actual beats (re-run librosa and compare).
- Climax: it really is the biggest lift.
- Energy envelope: energy.json matches the audio.
Fix any problem and update the maps if any time changes. Return verdict, issues and fixes.`, { label: 'music-qa', phase: 'Music', schema: REVIEW })

// ---------------- Story timed to music ----------------
phase('Story')
const timed = await agent(`${BRIEF}

Fit the content plan to the chosen music. Read ${A}/story/content.json, content.md and EVIDENCE.md, plus ${A}/music/map.json, energy.json and edit.md.

Write the final ${A}/story/storyboard.json following the storyboard contract. Keep "techniques", "motif", "color_script" and "signature_shots", and copy the music map fields into "music". The timing rules are:
- every scene starts on a bar line, within 0.05 s;
- scene durations follow the music's sections and energy;
- the aha line appears exactly at music.climax;
- signature shots land on the strongest musical moments;
- total equals the score length;
- every text satisfies the reading-time rule.
In each scene's "motion", say which moves land on which beats or hits.

Keep every text, fact and visual idea unless timing forces a cut. Then write ${A}/story/script.md: a readable version with timecodes, all texts, the visuals and techniques, and what the music is doing.

Run a python check for: bar alignment, contiguity, total equal to the score length, the aha line at the climax, and reading time for every text. Fix until the check passes. Return the final scene list, total, title and rationale.`, { label: 'retime', phase: 'Story', schema: SB })

const story = await agent(`${BRIEF}

Adversarially fact-check and polish ${A}/story/storyboard.json and script.md. Check each of these:
- every claim and number against ${A}/story/EVIDENCE.md: remove or soften anything unsupported, and make the source labels exact;
- no overclaims and no promises;
- no dashes;
- the Chinese reads naturally, punchy and correct, with no typos or punctuation errors;
- English words are spelled correctly;
- every text satisfies the reading-time rule;
- the timing rules hold against ${A}/music/map.json;
- the persona is only "B站UP主 朋克英语", with no hint of nationality;
- every scene really uses at least 3 toolbox techniques and is not text-led. Strengthen any scene that is mostly text.
Fix both files directly and re-run the checks. Return the final scene list, total, title, and a rationale that lists your changes.`, { label: 'fact-check', phase: 'Story', schema: SB })
const SC = (story && story.scenes && story.scenes.length) ? story : timed
log(`final storyboard: ${SC.scenes.length} scenes, ${SC.total}s`)

// ---------------- Scenes ----------------
phase('Scenes')
const sceneBranch = () => pipeline(SC.scenes,
  s => agent(`${BRIEF}

Build scene ${s.id} (start ${s.start}s, duration ${s.duration}s; summary: ${s.summary}).
Read these first:
- ${A}/story/storyboard.json: your scene entry is the spec. Use every text exactly, with its in and out times, plus the listed techniques, motion and beat notes, motif and color script.
- ${A}/story/script.md
- ${A}/engine/README.md and ${A}/engine/design.css

Implement ${A}/scenes/${s.id}.js using the engine API only, so it stays deterministic and seekable.
Make it a classic-level shot, not a text slide:
- build the scene with the listed techniques (at least 3);
- add layered depth, light, motion and the visual motif;
- land moves on this scene's beats and hits, and drive glow and particle intensity with ctx.util.energy(t);
- make in and out transitions that hand off well to the neighbouring scenes;
- keep every text large and legible, never overflowing or overlapping.

Check the scene visually:
- Run node ${A}/engine/still.js at least 10 times across the scene, including every text's in and out moments and the last 0.2 s. Read each PNG and iterate until it looks excellent.
- Take at least two stills with --scale 2 and zoom in to confirm crispness in 4K.
- Render a 1080p check with node ${A}/engine/render.js --from ${s.start} --to ${s.start + s.duration} --out ${A}/out/check_${s.id}.mp4 --parallel 4 --scale 1 and verify it with ffprobe.

Return ok, notes and files.`, { label: 'build:' + s.id, phase: 'Scenes', schema: DONE }),
  (b, s) => agent(`${BRIEF}

Adversarially review scene ${s.id} (start ${s.start}s, duration ${s.duration}s) in ${A}/scenes/${s.id}.js against its spec in ${A}/story/storyboard.json. Builder notes: ${b ? b.notes : '(the builder failed, so build the scene yourself)'}.

Take stills with node ${A}/engine/still.js at many times: every 0.3 s around text entrances and exits, plus random points. Read them, and zoom into small text with python PIL.

Check each of these:
- every text exactly matches the storyboard, character for character;
- every text appears at its in time and stays readable until its out time;
- no overflow, overlap, clipping or illegible text;
- no dashes;
- determinism: seek to the same time twice and pixel-diff the two frames;
- crispness in 4K at --scale 2;
- moves land on the music beats;
- no glitches at the start or end of the scene;
- the scene really uses at least 3 techniques and is not a text slide;
- it is classic-level: would a B站 viewer screenshot it, or rewatch it?

Fix everything yourself and re-check. Return verdict, issues and fixes.`, { label: 'review:' + s.id, phase: 'Scenes', schema: REVIEW }),
)
const [scenes, mqa] = await parallel([sceneBranch, musicQA])
log(`scenes: ${scenes.filter(Boolean).map(x => x.id + ':' + x.verdict).join(', ')}; music QA: ${mqa && mqa.verdict}`)

// ---------------- Assemble ----------------
phase('Assemble')
const ASSEMBLE = `1) Render the full 4K picture: node ${A}/engine/render.js --from 0 --to <storyboard total> --out ${A}/out/picture_4k.mp4 --fps 60 --scale 2 --parallel 4. Use ffprobe to verify the frame count and that it is 3840x2160.
2) Mux it with ${A}/music/score.wav into ${A}/out/如何真正学好英语_4K.mp4: copy the video stream without re-encoding; H.264 high, level 5.2, yuv420p, 60 fps; AAC 320k at 48 kHz; +faststart. The file must stay under 1.9 GB.
3) Make the 1080p preview ${A}/out/如何真正学好英语_1080p.mp4 by downscaling with lanczos.
4) Verify both files: resolution, fps, duration, streams, loudness and true peak after AAC encoding, and A/V sync.`
const asm = await agent(`${BRIEF}

Assemble the film.
${ASSEMBLE}
5) Make two B站 covers from the most striking signature shot, either a frame or a composed cover built with the engine: ${A}/out/cover_16x9.png (3840x2160) and ${A}/out/cover_4x3.png (2880x2160), each with a short big title.
6) Write ${A}/out/bilibili.md with:
   - 3 title options, attractive and honest, with no 最, 第一 or 保证;
   - a description: what the video says, a sources list taken from EVIDENCE.md, and the music credits exactly as LICENSES.md requires;
   - tags.
Return ok, notes (file sizes, duration, loudness) and files.`, { label: 'assemble', phase: 'Assemble', schema: DONE })

// ---------------- Director polish ----------------
phase('Polish')
const review = await agent(`${BRIEF}

You are the film's director, watching the cut ${A}/out/如何真正学好英语_1080p.mp4 as a demanding B站 audience would. Extract frames at 2 fps into contact sheets (ffmpeg tile filter), Read all of them, and zoom into important moments. Judge the whole film against 经典级标准 and the 全技巧工具箱: pacing and breathing, the impact of the aha moment, the strength of the signature shots, visual variety without becoming a collage, motif continuity, the color script, music sync, and whether any part feels like a text slideshow or drags.
Return an overall verdict, then 3 to 5 concrete targets: the weakest moments, each with its scene id, the problem, and a precise improvement that a scene author can implement.`, { label: 'director-review', phase: 'Polish', schema: POLISH })
const targets = (review && review.targets) || []
const fixes = await parallel(targets.map((t, i) => () => agent(`${BRIEF}

The director's note for scene ${t.scene}: PROBLEM: ${t.problem}. IMPROVEMENT: ${t.improvement}.
Implement the improvement in ${A}/scenes/${t.scene}.js. Keep every text, its timing, the facts and the music sync, unless the note says otherwise. Do not touch other scenes' files.
Verify with stills (at --scale 1 and --scale 2), Read them, and confirm the scene is clearly better, still deterministic, and has no overflow or overlap. Return verdict, issues and fixes.`, { label: 'polish:' + t.scene + ':' + i, phase: 'Polish', schema: REVIEW })))
const reasm = targets.length ? await agent(`${BRIEF}

Scenes ${targets.map(t => t.scene).join(', ')} were improved after the director's review. Rebuild the deliverables:
${ASSEMBLE}
Update the covers if the cover shot changed. Return ok, notes and files.`, { label: 'reassemble', phase: 'Polish', schema: DONE }) : null

const qa = await parallel([
  () => agent(`${BRIEF}

Final visual QA of the 4K film ${A}/out/如何真正学好英语_4K.mp4, and check that the 1080p version matches it. Extract frames every 1 s and at every text in and out time from storyboard.json, then Read them (contact sheets are fine; zoom into anything doubtful). Check for:
- text overflow, overlap or clipping;
- typos compared with the storyboard;
- text shown too briefly to read;
- glitches or blank frames at scene joins;
- stutter;
- sharpness in 4K;
- overall polish.
Fix any problem, re-render only what is needed (4K, --scale 2), re-mux, regenerate the 1080p file and re-check. Return verdict, issues and fixes.`, { label: 'final-visual-qa', phase: 'Polish', schema: REVIEW }),
  () => agent(`${BRIEF}

Final audio, sync and delivery QA of ${A}/out/如何真正学好英语_4K.mp4 and the 1080p version. Check:
- integrated loudness and true peak of the muxed AAC audio;
- no clipping and no clicks;
- A/V sync;
- the music's climax and section changes land on the intended visual moments: compare ${A}/music/map.json with the scene starts, the aha line and the signature shots, and look at those frames;
- the film starts and ends cleanly;
- the music credits in ${A}/out/bilibili.md match ${A}/music/LICENSES.md.
Fix anything wrong. Return verdict, issues and fixes.`, { label: 'final-audio-qa', phase: 'Polish', schema: REVIEW }),
])

return { title: SC.title, total: SC.total, scenes: SC.scenes, engine: engine && engine.notes, musicQA: mqa && { verdict: mqa.verdict, issues: mqa.issues }, assemble: asm, director: review, polish: fixes, reassemble: reasm, qa }
