export const meta = {
  name: 'how-to-learn-english-animation-4k',
  description: 'Music-only 4K animated short on how to truly learn English: evidence and storyboard, render engine, royalty-free music search and edit, storyboard retimed to the music, per-scene build and review, assembly and QA',
  phases: [
    { title: 'Prepare', detail: 'evidence and story drafts, render engine, royalty-free music search (in parallel)' },
    { title: 'Music', detail: 'choose, edit and master the track; map beats and sections; audio QA' },
    { title: 'Story', detail: 'final storyboard timed to the music; fact and timing check' },
    { title: 'Scenes', detail: 'build each scene, then adversarial visual review' },
    { title: 'Assemble', detail: '4K render, mux, 1080p preview, covers, final QA' },
  ],
}

const A = args.A
const BRIEF = `Read ${A}/BRIEF.md first and obey every rule in it (user request, 4K spec, royalty-free music rules, music-first timing, directory layout, storyboard contract, engine contract).`
const DONE = { type: 'object', properties: { ok: { type: 'boolean' }, notes: { type: 'string' }, files: { type: 'array', items: { type: 'string' } } }, required: ['ok', 'notes'] }
const REVIEW = { type: 'object', properties: { id: { type: 'string' }, verdict: { type: 'string', enum: ['pass', 'fixed', 'fail'] }, issues: { type: 'array', items: { type: 'string' } }, fixes: { type: 'array', items: { type: 'string' } } }, required: ['id', 'verdict', 'issues', 'fixes'] }
const SB = { type: 'object', properties: { title: { type: 'string' }, total: { type: 'number' }, rationale: { type: 'string' },
  scenes: { type: 'array', items: { type: 'object', properties: { id: { type: 'string' }, start: { type: 'number' }, duration: { type: 'number' }, summary: { type: 'string' } }, required: ['id', 'start', 'duration', 'summary'] } } },
  required: ['title', 'total', 'scenes', 'rationale'] }
const CANDS = { type: 'object', properties: { candidates: { type: 'array', items: { type: 'object', properties: {
  file: { type: 'string' }, title: { type: 'string' }, artist: { type: 'string' }, license: { type: 'string' }, page_url: { type: 'string' }, duration: { type: 'number' }, bpm: { type: 'number' }, mood: { type: 'string' }, arc: { type: 'string' }, fit: { type: 'string' } },
  required: ['file', 'title', 'artist', 'license', 'page_url', 'duration', 'bpm', 'mood', 'arc', 'fit'] } }, notes: { type: 'string' } }, required: ['candidates', 'notes'] }

// ---------------- Prepare: story content, engine, music search ----------------
phase('Prepare')
const storyContent = async () => {
  await agent(`${BRIEF}

Task: build the evidence base for the animated short "如何真正学好英语", which must be deeply convincing. Write ${A}/story/EVIDENCE.md with 8 to 14 well-established findings from second-language acquisition and learning science that support a coherent method. Examples: the Ebbinghaus forgetting curve; the spacing effect; retrieval practice / testing effect (Roediger & Karpicke 2006); comprehensible input (Krashen); vocabulary coverage needed for reading comprehension (Laufer; Hu & Nation 2000); encounters needed to learn a word from context (e.g. Webb 2007; Nation); extensive reading; output and noticing (Swain; Schmidt); interest and motivation; consistent daily practice.
For each finding give:
- a one-sentence plain Chinese statement that is safe to put on screen;
- the exact citation (author, year, title, venue);
- what it shows and does NOT show (its limits);
- any number allowed on screen, with its exact wording;
- confidence (high or medium).
Verify with WebSearch (mode extended where needed) and WebFetch. Where a source cannot be opened, rely only on well-established textbook facts and say so. Also list claims that must NOT be made (myths, overclaims). Return ok and notes.`, { label: 'evidence', phase: 'Prepare', schema: DONE })
  const ANGLES = [
    { key: 'myth', brief: 'Myth-busting arc. Open with a painful, relatable truth (years of English, words forgotten, still cannot understand). Reveal WHY, by visualizing how memory and acquisition actually work. Then give the method as a few unforgettable rules. End with a quotable line and a method card worth screenshotting.' },
    { key: 'journey', brief: 'Emotional journey arc. A learner (an abstract character or a glowing dot, no human face) moves from frustration through discovery to fluency. Each stage reveals one principle through a strong visual metaphor: a dark city lighting up word by word, a river of input, a constellation of words connecting.' },
    { key: 'system', brief: 'Data-visualization arc that makes the invisible visible: forgetting curves flattening under spaced retrieval, coverage meters for reading, a word lighting up after many encounters in context, a feedback-loop diagram. Cinematic and precise, like a premium science explainer. End with the full learning loop and a method card.' },
  ]
  const drafts = (await parallel(ANGLES.map(a => () => agent(`${BRIEF}

Read ${A}/story/EVIDENCE.md and use only its facts. Draft the CONTENT of the music-only animated short from this angle: ${a.brief}
Music is chosen later and the timing will be fitted to it, so give each scene an approximate duration and an energy level (1 to 10). The energy curve should be: calm intro, tension, build, a big "恍然大悟" climax at about 65 to 80 percent of the runtime, resolution, then ending.
Requirements:
- Total about 150 to 200 seconds, in 8 to 12 scenes.
- Chinese on-screen texts that are deeply convincing, short and quotable: big headline lines, small supporting lines, and small source labels.
- Describe visuals and motion concretely: shapes, typography moves, particles, light, transitions, and where beat hits should land.
- Make it stunning and rewatchable, with visual surprises and satisfying reveals.
- End with a method card worth screenshotting and the credit "B站UP主 朋克英语".
Write your draft as JSON (storyboard contract fields, plus "energy" per scene) to ${A}/story/draft_${a.key}.json. Return the scene list, total, title and rationale.`, { label: 'draft:' + a.key, phase: 'Prepare', schema: SB })))).filter(Boolean)
  return agent(`${BRIEF}

You are the director. Read the three drafts ${A}/story/draft_myth.json, draft_journey.json and draft_system.json, plus ${A}/story/EVIDENCE.md. Create the single best CONTENT plan: take the strongest arc and graft in the best ideas, lines and visuals from the others. It must have a clear thesis the viewer ends up agreeing with, be stunning and rewatchable, run 8 to 12 scenes and about 150 to 200 s, use no dashes, and use facts only from EVIDENCE.md, with small source labels.
Mark the single most important "恍然大悟" line and its scene. Give each scene an energy level (1 to 10) and an approximate duration, since the final timing will be fitted to the chosen music. Choose a premium cinematic palette.
Write ${A}/story/content.json (storyboard contract fields; timings are provisional; add "energy" per scene and "aha": {"scene","text"}). Also write ${A}/story/content.md, a readable version for the music director.
Return the scene list (provisional), total, title and rationale.`, { label: 'director', phase: 'Prepare', schema: SB })
}

const engineBranch = () => agent(`${BRIEF}

Task: build the render engine in ${A}/engine/ exactly as the engine contract in BRIEF.md specifies. It must be rock solid, because 8 to 12 scene authors will build on it.

Implement these files:
- index.html: loads ${A}/node_modules/gsap/dist/gsap.min.js by relative path, declares @font-face for the fonts in ${A}/fonts, loads design.css, and has a scene loader. The loader reads ${A}/story/storyboard.json when it exists and otherwise uses a demo storyboard.
- design.css: a premium cinematic design system. CSS variables for a palette that index.html overrides from storyboard.palette; typography classes for huge Chinese headlines in Noto Sans SC 900, lines, small labels and English serif words; glow and gradient text, vignettes and grain.
- ctx.util, with deterministic helpers only:
  - rand(seed)
  - splitChars(element), for per-character animation of Chinese and English
  - a particle field builder (DOM, or canvas drawn from timeline time only, at devicePixelRatio so it is sharp in 4K)
  - a number counter tween
  - line and curve drawing (SVG stroke-dashoffset)
  - a glow sweep
  - beat helpers that read storyboard.music (bpm, beat_offset, beats) and return the beat and bar times inside a scene, so scene authors can land moves exactly on the music's beats.

Behaviour:
- A scene is shown only during its own time range.
- Consecutive scenes get an engine-level crossfade of about 0.3 s.
- window.seek(t) must be deterministic and must wait for fonts and images.

still.js and render.js must follow the contract, including --scale 1|2 (4K output). render.js streams frames to ffmpeg through a pipe, with no frame files on disk. It supports --from, --to, --fps, --out, --crf and --parallel 4; parallel mode renders time chunks concurrently, then concatenates them losslessly. Verify that chunk joins have no duplicated or missing frames.

Prove it end to end:
- Write a demo scene ${A}/scenes/demo.js with a headline reveal, particles, a drawn curve and a counter.
- Render 6 seconds at 60 fps with --parallel 4, once at --scale 1 and once at --scale 2.
- With ffprobe, check that each render has exactly 360 frames and that the --scale 2 render is 3840x2160.
- Extract stills, Read them, and check sharpness.
- Measure render speed (frames per second) at both scales.

Write ${A}/engine/README.md documenting the API for scene authors, with a short example. Return ok, notes (including the measured render speeds) and files.`, { label: 'engine', phase: 'Prepare', schema: DONE })

const MUSIC_TASK = `Find royalty-free background music for a music-only 4K animated short "如何真正学好英语" on B站. The emotional arc: calm, slightly melancholic intro (the struggle), curiosity and build, a big uplifting "恍然大悟" climax at about 65 to 80 percent, a warm confident resolution, and an ending. Total about 150 to 200 s. The style should feel premium, modern and cinematic: inspiring piano and strings, cinematic electronic, or uplifting ambient. Avoid cheesy corporate ukulele, and avoid vocals with lyrics.
Rules: CC0/public domain preferred; CC-BY only as a backup (it needs attribution); never NC, ND or an unclear license.
Install analysis tools if needed (pip install librosa soundfile). Download at least 8 promising tracks into ${A}/music/src/. For each track:
- record the page URL, artist, title and exact license text in ${A}/music/src/<file>.license.txt;
- analyze it with librosa: duration, tempo/BPM, beat times, an onset-strength and RMS energy curve, and section boundaries (librosa.segment or novelty curve);
- save an energy plot PNG with the section boundaries marked, and Read it;
- judge whether its arc fits (where is its build, where is its peak?) and whether it can be edited at bar lines to the needed length.
Return the candidates, ranked best first, with notes.`
const musicSearch = () => parallel([
  () => agent(`${BRIEF}

${MUSIC_TASK}
Search these sources: freepd.com (all of FreePD is CC0; check its genre pages such as Epic, Upbeat, Electronic, Piano, Romantic) and freemusicarchive.org (filter for CC0 only, through its search and license filters; downloads come from files.freemusicarchive.org).`, { label: 'music-search:freepd+fma', phase: 'Prepare', schema: CANDS }),
  () => agent(`${BRIEF}

${MUSIC_TASK}
Search these sources: opengameart.org (music art type, filtered to CC0 only; cinematic, orchestral, ambient and inspiring), and incompetech.com (Kevin MacLeod; CC-BY 4.0, as a backup only, recording the exact attribution line).`, { label: 'music-search:oga+incompetech', phase: 'Prepare', schema: CANDS }),
])

const [content, engine, searches] = await parallel([storyContent, engineBranch, musicSearch])
if (!content) throw new Error('content plan missing')
const cands = (searches || []).filter(Boolean).flatMap(s => s.candidates)
log(`content ${content.scenes.length} scenes; engine ok=${engine && engine.ok}; ${cands.length} music candidates`)

// ---------------- Music: choose, edit, master, map ----------------
phase('Music')
const musicPick = await agent(`${BRIEF}

You are the music director. Read the content plan ${A}/story/content.json and ${A}/story/content.md: the energy per scene, the "aha" climax line, and the arc. Candidates with license proofs and analyses are in ${A}/music/src/:
${JSON.stringify(cands)}

1. Listen-by-analysis: compare each candidate's energy curve and sections against the content arc. Choose the single best track. If no single track fits, you may join two tracks that match in key and tempo with a seamless transition. Prefer CC0.
2. Design the edit so the total is about 150 to 200 s:
   - cut, repeat or skip sections only at bar lines, with equal-power crossfades;
   - the music's biggest lift lands where the aha line should appear;
   - the ending resolves cleanly.
   Do not change pitch; change tempo only if unavoidable and by no more than 3 percent.
3. Render the edited score to ${A}/music/score.wav (48 kHz, stereo, 24-bit) and master it: about -14 LUFS integrated, true peak at most -1 dBTP, no clipping or clicks, no unintended silence. Measure with ffmpeg ebur128 and astats.
4. Re-analyze score.wav and write ${A}/music/map.json: bpm, beat_offset, bar, beats (all beat times), bars (all bar-line times), sections [{name, start, end}], climax (time of the big lift), total.
5. Write ${A}/music/LICENSES.md (every source used, with page URL, artist, title and license; if CC-BY, the exact attribution line for the B站 description) and ${A}/music/edit.md (what was cut where, and why).
Return ok, notes and files.`, { label: 'music-director', phase: 'Music', schema: DONE })

const musicQA = () => agent(`${BRIEF}

Adversarially QA the edited score ${A}/music/score.wav against ${A}/music/map.json, ${A}/music/edit.md and ${A}/music/LICENSES.md. The user's audio standard is zero compromise.

Checks:
- Licenses: every source is CC0 or CC-BY with an attribution line, and none is NC, ND or unclear. Re-open the page URLs to confirm the license where possible.
- Loudness: about -14 LUFS integrated, true peak at most -1 dBTP.
- Clipping: none.
- Clicks: none. Find them with a numpy scan for sample jumps, paying special attention to every edit point listed in edit.md.
- Seams: no audible seams. Compare spectra and RMS before and after each cut, and render a spectrogram around each cut, then Read it.
- Silence: no unintended silence (silencedetect).
- Beat map: the map.json beats match the actual beats (re-run librosa beat tracking and compare).
- Climax: the climax time really is the biggest lift.

Fix any problem by re-editing and re-mastering, and update map.json if any times change. Return verdict, issues and fixes.`, { label: 'music-qa', phase: 'Music', schema: REVIEW })

// ---------------- Story: final timing fitted to the music ----------------
phase('Story')
const timed = await agent(`${BRIEF}

Fit the content plan to the chosen music. Read ${A}/story/content.json, ${A}/story/content.md, ${A}/story/EVIDENCE.md, ${A}/music/map.json and ${A}/music/edit.md.
Write the final ${A}/story/storyboard.json, following the storyboard contract and copying music map fields into "music":
- every scene starts on a bar line, within 0.05 s;
- the scene durations follow the music's sections and energy;
- the aha line appears exactly at music.climax;
- total equals the score length;
- all text in/out times satisfy the reading-time rule;
- in each scene's "motion" field, say which moves land on which beats.
Keep every text and fact from the content plan unless timing forces a cut.
Then write ${A}/story/script.md: a readable version with timecodes, every on-screen text, the visuals, and what the music is doing.
Run a python check for: bar alignment, contiguity, total equal to score length, the aha line at the climax, and reading time for every text. Fix until it passes. Return the final scene list, total, title and rationale.`, { label: 'retime', phase: 'Story', schema: SB })

const story = await agent(`${BRIEF}

Adversarially fact-check and polish ${A}/story/storyboard.json and script.md. Check:
- every claim and number against ${A}/story/EVIDENCE.md: remove or soften anything unsupported, and make source labels exact;
- no overclaims or promises;
- no dashes;
- Chinese wording that is natural, punchy and correct (typos, punctuation);
- English words spelled correctly;
- the reading-time rule for every text;
- the timing rules against ${A}/music/map.json (bar alignment, contiguity, total, aha at climax);
- persona: only "B站UP主 朋克英语", with no hint of nationality.
Fix both files directly and re-run the checks. Return the final scene list, total, title and a rationale that lists your changes.`, { label: 'fact-check', phase: 'Story', schema: SB })
const SC = (story && story.scenes && story.scenes.length) ? story : timed
log(`final storyboard: ${SC.scenes.length} scenes, ${SC.total}s`)

// ---------------- Scenes (with music QA in parallel) ----------------
phase('Scenes')
const sceneBranch = () => pipeline(SC.scenes,
  s => agent(`${BRIEF}

Build scene ${s.id} (start ${s.start}s, duration ${s.duration}s; summary: ${s.summary}). Read these first:
- ${A}/story/storyboard.json: your scene entry is the spec. Use every text exactly as written, with its in/out times; also read the music map and the beat notes in "motion".
- ${A}/story/script.md
- ${A}/engine/README.md
- ${A}/engine/design.css

Implement ${A}/scenes/${s.id}.js using the engine API only, so it stays deterministic and seekable. Make it genuinely stunning:
- layered depth, kinetic typography, light and particles;
- satisfying moves that land exactly on this scene's music beats and bar lines (use the engine's beat helpers);
- smooth in and out transitions that hand off well to the neighbouring scenes.
Text must stay large and legible, and must never overflow or overlap.

Check it visually:
- Run node ${A}/engine/still.js at least 8 times across your scene, including every text's in and out moments and the last 0.2 s. Read each PNG and iterate until it looks excellent.
- Take at least two stills with --scale 2 and zoom in to confirm crispness in 4K.
- Render the scene alone at 1080p with node ${A}/engine/render.js --from ${s.start} --to ${s.start + s.duration} --out ${A}/out/check_${s.id}.mp4 --parallel 4 --scale 1, and verify it with ffprobe.

Return ok, notes and files.`, { label: 'build:' + s.id, phase: 'Scenes', schema: DONE }),
  (b, s) => agent(`${BRIEF}

Adversarially review scene ${s.id} (start ${s.start}s, duration ${s.duration}s) in ${A}/scenes/${s.id}.js against its spec in ${A}/story/storyboard.json. Builder notes: ${b ? b.notes : '(the builder failed, so build it yourself)'}.
Take stills with node ${A}/engine/still.js at many times: every 0.3 s around text entrances and exits, plus random points. Read them, and when text is small, zoom into the region with python PIL.

Check:
- every on-screen text matches the storyboard exactly, character for character;
- each text appears at its in time and stays readable until its out time (reading-time rule);
- no overflow, overlap, clipping or illegible text, and no dashes;
- determinism: seeking to the same time twice gives identical PNGs (verify with a pixel diff);
- 4K crispness at --scale 2;
- moves land on the music beats listed in the storyboard;
- no visual glitches at scene start or end;
- the wow factor: would a B站 viewer find this stunning?

Fix everything yourself, re-check, and return verdict, issues and fixes.`, { label: 'review:' + s.id, phase: 'Scenes', schema: REVIEW }),
)
const [scenes, mqa] = await parallel([sceneBranch, musicQA])
log(`scenes: ${scenes.filter(Boolean).map(x => x.id + ':' + x.verdict).join(', ')}; music QA: ${mqa && mqa.verdict}`)

// ---------------- Assemble and final QA ----------------
phase('Assemble')
const asm = await agent(`${BRIEF}

Assemble the film.
1) Render the full picture in 4K: node ${A}/engine/render.js --from 0 --to <storyboard total> --out ${A}/out/picture_4k.mp4 --fps 60 --scale 2 --parallel 4. Verify the frame count and 3840x2160 with ffprobe.
2) Mux it with ${A}/music/score.wav into ${A}/out/如何真正学好英语_4K.mp4: copy the video stream without re-encoding, H.264 high, level 5.2, yuv420p, 60 fps, AAC 320k at 48 kHz, +faststart. Quality comes first; keep the file under 1.9 GB.
3) Make a 1080p preview ${A}/out/如何真正学好英语_1080p.mp4 by downscaling with lanczos.
4) Verify both files: resolution, fps, duration, streams, loudness and true peak after AAC encoding, and A/V sync (audio length equals video length).
5) Make two B站 covers from the most striking moment (a frame, or a composed cover built with the engine): ${A}/out/cover_16x9.png at 3840x2160 and ${A}/out/cover_4x3.png at 2880x2160, each with a short, big title.
6) Write ${A}/out/bilibili.md containing:
   - 3 title options (attractive and honest, no 最/第一/保证);
   - a description covering what the video says, a sources list from EVIDENCE.md, and the music credits exactly as LICENSES.md requires;
   - tags.
Return ok, notes (file sizes, duration, loudness) and files.`, { label: 'assemble', phase: 'Assemble', schema: DONE })

const qa = await parallel([
  () => agent(`${BRIEF}

Do the final visual QA of the 4K film ${A}/out/如何真正学好英语_4K.mp4, and check that the 1080p version exists and matches it.
Extract frames with ffmpeg every 1 s, plus at every text in/out time from storyboard.json. Read them; contact sheets are fine for speed, but zoom into any doubtful frame. Check for:
- text overflow, overlap or clipping;
- typos versus the storyboard;
- text that is visible too briefly to read;
- glitches or blank frames at scene joins;
- stutter (compare consecutive frames around the joins);
- 4K sharpness;
- overall polish.
Fix problems in the scene files or the engine, re-render only what is needed (4K, --scale 2), re-mux, regenerate the 1080p version, and re-check. Return verdict, issues and fixes.`, { label: 'final-visual-qa', phase: 'Assemble', schema: REVIEW }),
  () => agent(`${BRIEF}

Do the final audio, sync and delivery QA of ${A}/out/如何真正学好英语_4K.mp4 and the 1080p version.
Check:
- integrated loudness and true peak of the muxed AAC audio;
- no clipping or clicks after encoding;
- A/V sync;
- the music's climax and section changes land on the visual moments the storyboard intends: compare ${A}/music/map.json with the scene starts and the aha line time, and look at the frames at those times;
- the file starts cleanly and ends cleanly;
- the music credits in ${A}/out/bilibili.md match ${A}/music/LICENSES.md.
Fix anything (re-master or re-mux). Return verdict, issues and fixes.`, { label: 'final-audio-qa', phase: 'Assemble', schema: REVIEW }),
])

return { title: SC.title, total: SC.total, scenes: SC.scenes, engine: engine && engine.notes, music: musicPick && musicPick.notes, musicQA: mqa && { verdict: mqa.verdict, issues: mqa.issues }, assemble: asm, qa }
