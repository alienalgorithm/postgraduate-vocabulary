export const meta = {
  name: 'how-to-learn-english-animation',
  description: 'Make a stunning music-only 4K animated short on how to truly learn English: research, storyboard panel, render engine, per-scene build+review, original synthesized score, assembly and QA',
  phases: [
    { title: 'Story', detail: 'evidence research, 3 storyboard angles, synthesis, fact-check' },
    { title: 'Engine', detail: 'seekable GSAP render engine, stills and streaming render' },
    { title: 'Scenes', detail: 'build each scene, then adversarial visual review' },
    { title: 'Music', detail: 'original synthesized score synced to bars, audio QA' },
    { title: 'Assemble', detail: 'full render, mux, loudness, cover, final QA' },
  ],
}

const A = args.A
const BRIEF = `Read ${A}/BRIEF.md first and obey every rule in it (user request, hard rules, directory layout, storyboard contract, engine contract).`

const SB_SCHEMA = { type: 'object', properties: {
  title: { type: 'string' }, total: { type: 'number' }, rationale: { type: 'string' },
  scenes: { type: 'array', items: { type: 'object', properties: { id: { type: 'string' }, start: { type: 'number' }, duration: { type: 'number' }, summary: { type: 'string' } }, required: ['id', 'start', 'duration', 'summary'] } } },
  required: ['title', 'total', 'scenes', 'rationale'] }
const DONE = { type: 'object', properties: { ok: { type: 'boolean' }, notes: { type: 'string' }, files: { type: 'array', items: { type: 'string' } } }, required: ['ok', 'notes'] }
const REVIEW = { type: 'object', properties: { id: { type: 'string' }, verdict: { type: 'string', enum: ['pass', 'fixed', 'fail'] }, issues: { type: 'array', items: { type: 'string' } }, fixes: { type: 'array', items: { type: 'string' } } }, required: ['id', 'verdict', 'issues', 'fixes'] }

// ---------------- Story and Engine in parallel ----------------
const storyBranch = async () => {
  await agent(`${BRIEF}

Task: build the evidence base for an animated short "如何真正学好英语" that must be deeply convincing. Write ${A}/story/EVIDENCE.md: 8 to 14 well-established findings from second-language acquisition and learning science that support a coherent method (for example: Ebbinghaus forgetting curve; spacing effect; retrieval practice / testing effect (Roediger & Karpicke 2006); comprehensible input (Krashen); vocabulary coverage needed for reading comprehension (Laufer; Hu & Nation 2000); number of encounters to learn a word in context (e.g. Webb 2007; Nation); extensive reading; output and noticing (Swain; Schmidt); interest and motivation; deliberate, consistent daily practice). For each: one-sentence plain Chinese statement safe to put on screen, the exact citation (author, year, title, venue), what the finding does and does NOT show (limits), any number allowed on screen and its exact wording, and confidence (high/medium). Use WebSearch (mode extended where needed) and WebFetch to verify; when a source cannot be opened, rely only on well-established textbook facts and say so. Also list claims that must NOT be made (myths, overclaims). Return ok and notes.`, { label: 'evidence', phase: 'Story', schema: DONE })

  const ANGLES = [
    { key: 'myth', brief: 'Myth-busting arc: open with a painful, relatable truth (years of English, words forgotten, still cannot understand), reveal WHY (how memory and acquisition actually work, visualized), then the method as a few unforgettable rules, end with a quotable line and a screenshot-worthy method card.' },
    { key: 'journey', brief: 'Emotional journey arc: a learner (abstract character or a glowing dot, no human face) moves from frustration through discovery to fluency; each stage reveals one principle with a strong visual metaphor (a dark city lighting up word by word, a river of input, a constellation of words connecting).' },
    { key: 'system', brief: 'Data-visualization arc: make the invisible visible: forgetting curves flattening with spaced retrieval, coverage meters for reading, a word lighting up after many encounters in context, a feedback loop diagram; cinematic, precise, like a premium science explainer; end with the full learning loop and a method card.' },
  ]
  const drafts = (await parallel(ANGLES.map(a => () => agent(`${BRIEF}

Read ${A}/story/EVIDENCE.md (only use its facts). Write a complete storyboard for the music-only animated short, from this angle: ${a.brief}
Requirements: total 150 to 200 seconds; every scene start and duration a multiple of 2.4 s; 8 to 12 scenes; Chinese on-screen texts written to be deeply convincing, short and quotable (big headline lines, small supporting lines, small source labels); obey reading-time rule; describe visuals and motion concretely (shapes, typography moves, particles, light, transitions, beat hits on bar lines), and the music for each scene (mood, instruments, intensity curve, where the big hit/drop lands). Make it stunning and rewatchable: visual surprises, satisfying reveals, a strong climax around 65 to 80 percent of the runtime, and an ending method card worth screenshotting, plus a final line with the credit "B站UP主 朋克英语". Write your storyboard JSON (following the storyboard contract exactly) to ${A}/story/draft_${a.key}.json. Return the scene list, total, title and a rationale.`, { label: 'storyboard:' + a.key, phase: 'Story', schema: SB_SCHEMA })))).filter(Boolean)

  await agent(`${BRIEF}

You are the director. Three storyboard drafts are in ${A}/story/draft_myth.json, draft_journey.json, draft_system.json (summaries below). Read all three and ${A}/story/EVIDENCE.md. Create the single best final storyboard: pick the strongest arc and graft the best ideas, lines and visuals from the others. It must be deeply convincing (a clear thesis the viewer agrees with), stunning, rewatchable, 150 to 200 s, 8 to 12 scenes, all timings multiples of 2.4 s, reading-time rule satisfied for every text, no dashes, facts only from EVIDENCE.md with small source labels where a finding is cited, ending with a screenshot-worthy method card and the credit "B站UP主 朋克英语". Choose a palette (put it in storyboard.json "palette") that looks premium and cinematic. Write ${A}/story/storyboard.json and a readable ${A}/story/script.md (scene by scene with timecodes, all on-screen texts, visuals, music). Then run a small python check that every start/duration is a multiple of 2.4, scenes are contiguous from 0, total matches, and every text satisfies out-in >= max(1.6, 0.6 + chars/6). Fix until it passes.
DRAFT SUMMARIES: ${JSON.stringify(drafts)}`, { label: 'director', phase: 'Story', schema: DONE })

  return agent(`${BRIEF}

Adversarially fact-check and polish ${A}/story/storyboard.json and script.md. Check: every claim and number against ${A}/story/EVIDENCE.md (remove or soften anything not supported; source labels exact); no overclaims or promises; no dashes; Chinese wording natural, punchy and correct (typos, punctuation); English words spelled correctly; reading-time rule for every text; timing contract (multiples of 2.4, contiguous, total); persona (only B站UP主 朋克英语, no nationality). Fix both files directly and re-run the timing check. Return the final scene list (id, start, duration, one-line summary), total, title, and a rationale listing what you changed.`, { label: 'fact-check', phase: 'Story', schema: SB_SCHEMA })
}

const engineBranch = () => agent(`${BRIEF}

Task: build the render engine exactly per the engine contract in BRIEF.md, in ${A}/engine/. It must be rock solid because 8 to 12 scene authors will build on it.
Implement: index.html (loads ${A}/node_modules/gsap/dist/gsap.min.js via a relative path, @font-face for the fonts in ${A}/fonts, design.css, a scene loader that reads ${A}/story/storyboard.json when present and otherwise a demo storyboard), design.css (a premium cinematic design system: CSS variables for a palette that index.html overrides from storyboard.palette, typography classes for huge Chinese headlines in Noto Sans SC 900, lines, small labels, English serif words, glow and gradient text, vignettes, grain), and ctx.util with deterministic helpers: rand(seed), splitChars(element) for per-character animation of Chinese and English, particle field builder (DOM or canvas drawn from timeline time only), number counter tween, line/curve drawing (SVG stroke-dashoffset), glow sweep, beat helper (beat = 0.6 s, bar = 2.4 s). Scenes must be shown only during their time range; implement a short engine-level crossfade (about 0.3 s) between consecutive scenes. window.seek(t) must be deterministic and wait for fonts and images. still.js and render.js as specified: render.js streams frames to ffmpeg via a pipe (no frame files on disk), supports --from/--to/--fps/--out and a --parallel 4 mode that renders 4 time chunks concurrently then concatenates losslessly; verify that chunk joins have no duplicated or missing frames.
The final film is 4K (3840x2160 via deviceScaleFactor 2 with a 1920x1080 CSS layout): make sure canvas-based effects draw at devicePixelRatio so they are sharp in 4K, and render.js/still.js support --scale 1|2. Prove it end to end: write a demo scene ${A}/scenes/demo.js (headline reveal, particles, a drawn curve, a counter), render 6 seconds at 60 fps with --parallel 4 both at --scale 1 and at --scale 2, check frame counts with ffprobe (exactly 360 each) and the 4K resolution (3840x2160), extract stills and Read them to verify sharpness; measure render speed (frames per second) at both scales and report it. Write ${A}/engine/README.md documenting the API for scene authors with a short example. Return ok, notes (including measured render speed), files.`, { label: 'engine', phase: 'Engine', schema: DONE })

phase('Story')
const [story, engine] = await parallel([storyBranch, engineBranch])
if (!story || !story.scenes || !story.scenes.length) throw new Error('storyboard missing')
log(`storyboard: ${story.scenes.length} scenes, ${story.total}s; engine ok=${engine && engine.ok}`)

// ---------------- Scenes and Music in parallel ----------------
phase('Scenes')
const sceneBranch = () => pipeline(story.scenes,
  s => agent(`${BRIEF}

Build scene ${s.id} (start ${s.start}s, duration ${s.duration}s; summary: ${s.summary}). Read ${A}/story/storyboard.json (your scene entry is the spec: every text exactly as written, with its in/out times), ${A}/story/script.md, ${A}/engine/README.md and ${A}/engine/design.css. Implement ${A}/scenes/${s.id}.js using the engine API only (deterministic, seekable). Make it genuinely stunning: layered depth, kinetic typography, light, particles, satisfying beat-synced moves on the 0.6 s beat and 2.4 s bar grid, and smooth in/out that hands off well to neighbouring scenes; but text must stay large, legible and never overflow or overlap. Check visually: node ${A}/engine/still.js at least 8 times across your scene (including every text's in and out moments and the last 0.2 s), Read each PNG, and iterate until it looks excellent. Also render your scene alone as a quick check at 1080p: node ${A}/engine/render.js --from ${s.start} --to ${s.start + s.duration} --out ${A}/out/check_${s.id}.mp4 --parallel 4 --scale 1, and verify with ffprobe. The final film is 4K: take at least two stills with --scale 2 and zoom in to confirm text, lines and particles are crisp at 3840x2160 (no blurry bitmaps). Return ok, notes, files.`, { label: 'build:' + s.id, phase: 'Scenes', schema: DONE }),
  (b, s) => agent(`${BRIEF}

Adversarially review scene ${s.id} (start ${s.start}s, duration ${s.duration}s) in ${A}/scenes/${s.id}.js against its spec in ${A}/story/storyboard.json. Builder notes: ${b ? b.notes : '(builder failed: build it yourself)'}.
Take stills with node ${A}/engine/still.js at many times (every 0.3 s around text entrances and exits, plus random points), Read them, and zoom into regions with python PIL when text is small. Check: every on-screen text exactly matches the storyboard (character for character), appears at its in time and stays readable until its out time (reading-time rule), no overflow, overlap, clipping or illegible text, no dashes, determinism (seek to the same time twice gives identical PNGs; verify with a pixel diff), no visual glitches at scene start/end, and the wow factor (would a B站 viewer find this stunning?). Fix everything yourself, re-check, and return verdict, issues, fixes.`, { label: 'review:' + s.id, phase: 'Scenes', schema: REVIEW }),
)

const musicBranch = async () => {
  const m = await agent(`${BRIEF}

Compose and synthesize the original score for the film with numpy/scipy only (no downloaded audio or samples). Read ${A}/story/storyboard.json and script.md: follow each scene's music notes and the overall arc (intro, build, climax at the big reveal, resolution, ending). 100 BPM, 4/4, bar = 2.4 s, exact length = storyboard total + a 2.4 s tail fade. Make it sound professional and modern (cinematic electronic: warm detuned pads, plucks/arpeggios, sub bass, tight kick/snare/hats with proper envelopes, risers and impacts exactly on the bar lines where scenes change, a clear drop at the climax), with stereo width, gentle reverb (convolution with a synthesized impulse response is fine) and no harsh frequencies. Write ${A}/music/score.py (deterministic) and render ${A}/music/score.wav (48 kHz, stereo, 24-bit). Master it: integrated loudness about -14 LUFS, true peak at most -1 dBTP (measure with ffmpeg ebur128/loudnorm), no clipping, no clicks at note boundaries (apply short fades), no unintended silence. Also write ${A}/music/cues.json listing the time of every major hit/drop. Return ok, notes (measured LUFS and true peak), files.`, { label: 'compose', phase: 'Music', schema: DONE })
  const r = await agent(`${BRIEF}

Adversarially review the score ${A}/music/score.wav (made by ${A}/music/score.py). The user's audio standard is zero compromise. Measure with ffmpeg: duration (must equal storyboard total + 2.4 s), sample rate/channels, integrated loudness (target about -14 LUFS), true peak (<= -1 dBTP), clipping (astats peak, number of samples at full scale), DC offset, silence detection (silencedetect) for unintended gaps, and look for clicks (sudden sample jumps) with a numpy scan. Check musical alignment: major hits on bar lines and at scene boundaries from storyboard.json; render a spectrogram PNG and Read it to spot harsh bands or holes. Listen-proxy checks: per-section RMS curve should follow the arc (intro quieter, climax loudest, ending resolving). Fix problems by editing score.py and re-rendering; re-measure. Return verdict, issues, fixes (with final measurements).`, { label: 'music-review', phase: 'Music', schema: REVIEW })
  return { m, r }
}

const [scenes, music] = await parallel([sceneBranch, musicBranch])
log(`scenes reviewed: ${scenes.filter(Boolean).map(x => x.id + ':' + x.verdict).join(', ')}`)

// ---------------- Assemble and final QA ----------------
phase('Assemble')
const asm = await agent(`${BRIEF}

Assemble the film. 1) Render the full picture in 4K: node ${A}/engine/render.js --from 0 --to <storyboard total + 2.4> --out ${A}/out/picture_4k.mp4 --fps 60 --scale 2 --parallel 4 (the last 2.4 s can hold the end card while the music tail fades). Verify frame count and 3840x2160 with ffprobe. 2) Mux with ${A}/music/score.wav into ${A}/out/如何真正学好英语_4K.mp4 (H.264 high, level 5.2, yuv420p, 60 fps, AAC 320k 48 kHz, +faststart; copy the video stream, do not re-encode). Quality first; it is delivered via GitHub Release, so only keep it under 1.9 GB. Also make a 1080p version ${A}/out/如何真正学好英语_1080p.mp4 by downscaling (lanczos) for quick previews. 3) Verify the final 4K file: resolution 3840x2160, 60 fps, duration, streams, audio loudness and true peak again, and A/V sync (audio length equals video length). 4) Make two B站 covers from the most striking frame (or a composed cover using the engine): ${A}/out/cover_16x9.png (1920x1080) and ${A}/out/cover_4x3.png (1440x1080), with a short big title on the cover. 5) Write ${A}/out/bilibili.md with 3 title options (attractive, honest, no 最/第一/保证), a description (what the video says, sources list from EVIDENCE.md), and tags. Return ok, notes (file size, duration, loudness), files.`, { label: 'assemble', phase: 'Assemble', schema: DONE })

const qa = await parallel([
  () => agent(`${BRIEF}

Final visual QA of the 4K film ${A}/out/如何真正学好英语_4K.mp4 (also check the 1080p version exists and matches). Extract frames with ffmpeg every 1 s and additionally at every text in/out time from storyboard.json; Read them (contact sheets are fine for speed, but zoom into any doubtful frame). Check for: any text overflow/overlap/clipping, typos versus storyboard, text visible too briefly to read, glitches or blank frames at scene joins, stutter (compare consecutive frames around joins), and overall polish. Fix problems in the scene files or engine, re-render only what is needed (4K, --scale 2), re-mux, regenerate the 1080p version, and re-check; also zoom into 4K frames to confirm sharpness. Return verdict, issues, fixes.`, { label: 'final-visual-qa', phase: 'Assemble', schema: REVIEW }),
  () => agent(`${BRIEF}

Final audio and delivery QA of ${A}/out/如何真正学好英语_4K.mp4 (and the 1080p version): measure integrated loudness and true peak of the muxed AAC audio, check for clipping and clicks after encoding, check A/V sync and that the music's big hits land on the visual scene changes (compare ${A}/music/cues.json with storyboard scene starts and with frames at those times), check the file plays from the start with no initial silence glitch and ends cleanly. Fix anything (re-master or re-mux), and return verdict, issues, fixes.`, { label: 'final-audio-qa', phase: 'Assemble', schema: REVIEW }),
])

return { title: story.title, total: story.total, scenes: story.scenes, engine: engine && engine.notes, music: music && { compose: music.m && music.m.notes, review: music.r && music.r.verdict }, assemble: asm, qa }
