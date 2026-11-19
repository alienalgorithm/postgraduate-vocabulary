export const meta = {
  name: 'how-to-learn-english-animation-cornfield',
  description: 'Rebuild the 4K music-only animated short around Hans Zimmer Cornfield Chase: analyze the track, recut the storyboard to its bars and climax, adapt/build scenes with review, assemble, director polish, QA, plus a CC0 backup-music version',
  phases: [
    { title: 'Music', detail: 'analyze and gain-master Cornfield Chase; beat map, sections, climax, energy' },
    { title: 'Story', detail: 'recut storyboard to the track; fact and timing check; music QA' },
    { title: 'Scenes', detail: 'adapt existing scene code or build new, then adversarial review' },
    { title: 'Assemble', detail: '4K render, mux, 1080p, covers, B站 copy' },
    { title: 'Polish', detail: 'director review of the full film, fixes, reassemble' },
    { title: 'QA', detail: 'final visual and audio QA' },
    { title: 'Backup', detail: 'same picture with CC0 Epic Vista edited to fit' },
  ],
}

const A = args.A
const BRIEF = `Read ${A}/BRIEF.md first and obey every rule in it. The newest section, 配乐定稿 (Cornfield Chase), overrides older music rules wherever they conflict. Other sections cover the 经典级标准, the 全技巧工具箱, the 4K spec, the contracts and the hard rules.`
const DONE = { type: 'object', properties: { ok: { type: 'boolean' }, notes: { type: 'string' }, files: { type: 'array', items: { type: 'string' } } }, required: ['ok', 'notes'] }
const REVIEW = { type: 'object', properties: { id: { type: 'string' }, verdict: { type: 'string', enum: ['pass', 'fixed', 'fail'] }, issues: { type: 'array', items: { type: 'string' } }, fixes: { type: 'array', items: { type: 'string' } } }, required: ['id', 'verdict', 'issues', 'fixes'] }
const SB = { type: 'object', properties: { title: { type: 'string' }, total: { type: 'number' }, rationale: { type: 'string' },
  scenes: { type: 'array', items: { type: 'object', properties: { id: { type: 'string' }, start: { type: 'number' }, duration: { type: 'number' }, summary: { type: 'string' }, derived_from: { type: 'array', items: { type: 'string' } } }, required: ['id', 'start', 'duration', 'summary'] } } },
  required: ['title', 'total', 'scenes', 'rationale'] }
const POLISH = { type: 'object', properties: { verdict: { type: 'string' }, targets: { type: 'array', items: { type: 'object', properties: { scene: { type: 'string' }, problem: { type: 'string' }, improvement: { type: 'string' } }, required: ['scene', 'problem', 'improvement'] } } }, required: ['verdict', 'targets'] }

// ---------------- Music ----------------
phase('Music')
await agent(`${BRIEF}

Analyze and prepare the user's licensed track ${A}/music/user/cornfield_chase.mp3 (Hans Zimmer, Cornfield Chase, 127.0 s, ending in about 1 s of silence). Use librosa; it may already be installed, otherwise pip install librosa soundfile.

1. Find the tempo and meter, every beat and every bar line (beat_offset is the first downbeat), and the musical sections: the quiet organ ostinato intro, each layer entry, the build, the biggest and fullest climax, and the ending or cut-off. Use onset strength, RMS, spectral novelty and a self-similarity matrix. Save plots (an energy curve and a novelty curve with the bars and sections marked) and Read them to confirm. Write ${A}/music/analysis.md describing the structure with timecodes.
2. Master to ${A}/music/score.wav (48 kHz, stereo, 24-bit). Apply gain only: no cuts, no time change, no dynamic compression. Bring true peak to at most -1 dBTP, with loudness as close to the original as that allows (about -14 LUFS). Decide whether the trailing silence is kept as a natural tail. Measure the result with ffmpeg ebur128.
3. Write ${A}/music/map.json with: bpm, meter, beat_offset, bar, beats, bars, sections [{name, start, end}], climax (time of the fullest moment), and total (effective film length). Write ${A}/music/energy.json with: fps 60, values (smoothed normalized RMS per 1/60 s, 0 to 1), and hits (strong onsets).
4. Write ${A}/music/LICENSES.md, recording that the user (B站UP主 朋克英语) states on 2026-11-19 that the license for using Hans Zimmer's Cornfield Chase (from the Interstellar soundtrack) in this B站 video has been obtained. Give the credit line for the description: 配乐 Hans Zimmer《Cornfield Chase》（《星际穿越》原声），已获授权.
Return ok, notes (tempo, bars, sections, climax time, loudness) and files.`, { label: 'music-analysis', phase: 'Music', schema: DONE })

// ---------------- Story recut + music QA ----------------
phase('Story')
const recut = await agent(`${BRIEF}

Recut the film to Cornfield Chase. Read these first:
- ${A}/music/map.json and ${A}/music/analysis.md (the track's bars, sections and climax);
- the previous storyboard ${A}/story/v1_epicvista/storyboard.json and its script.md (11 scenes, about 205 s, timed to another track);
- ${A}/story/content.json and content.md (the full content plan: motif, color script, signature shots, techniques);
- ${A}/story/EVIDENCE.md.

Write a new ${A}/story/storyboard.json that follows the storyboard contract, with music copied from map.json. The film's length equals the track's effective length, so tighten it to 8 or 9 scenes. Keep:
- the strongest ideas and the clear thesis;
- the three signature shots, the motif and the color script;
- the visual richness (at least 3 toolbox techniques per scene).

Fit the structure to the music, phrase by phrase:
- the quiet ostinato intro carries the painful truth;
- each layer entry brings a new revelation;
- the big build drives toward the aha;
- the "恍然大悟" line lands exactly at music.climax;
- the resolution and method card sit on the last phrases;
- the credit "B站UP主 朋克英语" goes at the end.

Timing rules:
- every scene starts on a bar line, within 0.05 s;
- the scenes are contiguous;
- total equals the track's effective length;
- every text satisfies the reading-time rule (fewer, stronger words are better than rushed text).

In each scene's "motion", say which moves land on which beats or onsets. For each scene, add "derived_from": the ids of previous-storyboard scenes it reuses. Scenes s01 to s05 already have working code in ${A}/scenes_v1/, so prefer reusing their visuals where they fit.

Write ${A}/story/script.md as a readable version with timecodes. Run ${A}/story/check_storyboard.py, adapting it if needed, or an equivalent python check: bar alignment, contiguity, total, aha at climax, reading time. Fix until it passes. Return the scene list (with derived_from), total, title and rationale.`, { label: 'recut', phase: 'Story', schema: SB })

const [story, mqa] = await parallel([
  () => agent(`${BRIEF}

Adversarially fact-check and polish ${A}/story/storyboard.json and script.md. Check each of these:
- every claim and number against ${A}/story/EVIDENCE.md, with exact source labels;
- no overclaims;
- no dashes;
- natural, punchy, correct Chinese;
- correct English spelling;
- reading time for every text;
- the timing rules against ${A}/music/map.json: bar alignment, contiguity, total, aha at the climax;
- persona: only "B站UP主 朋克英语";
- every scene uses at least 3 techniques and is not text-led;
- the structure really rides the music (quiet intro, layer entries, build, climax, resolution).
Fix both files directly and re-run the checks. Return the final scene list (keep derived_from), total, title, and a rationale that lists your changes.`, { label: 'fact-check', phase: 'Story', schema: SB }),
  () => agent(`${BRIEF}

QA the prepared track ${A}/music/score.wav against the original ${A}/music/user/cornfield_chase.mp3 and ${A}/music/map.json. Check each of these:
- it is the same music, with no cuts and no tempo or pitch change: compare durations and cross-correlate;
- only gain was applied;
- true peak is at most -1 dBTP and loudness is reported;
- no clipping;
- no clicks at the start or end;
- the beat map matches the audio: re-run beat tracking and compare;
- the climax time is the fullest moment;
- energy.json matches the audio.
Fix anything wrong and return verdict, issues and fixes.`, { label: 'music-qa', phase: 'Story', schema: REVIEW }),
])
const SC = (story && story.scenes && story.scenes.length) ? story : recut
log(`storyboard: ${SC.scenes.length} scenes, ${SC.total}s; music QA ${mqa && mqa.verdict}`)

// ---------------- Scenes ----------------
phase('Scenes')
const scenes = await pipeline(SC.scenes,
  s => agent(`${BRIEF}

Build scene ${s.id} (start ${s.start}s, duration ${s.duration}s; summary: ${s.summary}; derived from previous scenes: ${(s.derived_from || []).join(', ') || 'none'}).
Read these first:
- ${A}/story/storyboard.json: your scene entry is the spec. Use every text exactly, with its in/out times, and follow the techniques, motion, beat notes, motif and color script.
- ${A}/story/script.md
- ${A}/engine/README.md and ${A}/engine/design.css
- the previous code in ${A}/scenes_v1/ for any derived_from scene that has code there (s01 to s05). Reuse and adapt it: retime it to the new duration, texts and Cornfield Chase beats, and keep its best visuals.

Write ${A}/scenes/${s.id}.js using the engine API only, so it stays deterministic and seekable. Make it a classic-level shot, not a text slide:
- use at least 3 toolbox techniques;
- add depth, light, motion and the motif;
- land moves on the music's beats and onsets, and drive glow and particles with ctx.util.energy(t);
- use smooth handoffs to the neighbouring scenes;
- keep text large and legible, with no overflow or overlap.

Check the result:
- Take at least 10 stills (node ${A}/engine/still.js), including every text's in and out moments, and Read them. Take two stills at --scale 2 and zoom in.
- Render a 1080p check: node ${A}/engine/render.js --from ${s.start} --to ${s.start + s.duration} --out ${A}/out/check_${s.id}.mp4 --parallel 4 --scale 1.

Return ok, notes and files.`, { label: 'build:' + s.id, phase: 'Scenes', schema: DONE }),
  (b, s) => agent(`${BRIEF}

Adversarially review scene ${s.id} (start ${s.start}s, duration ${s.duration}s) in ${A}/scenes/${s.id}.js against ${A}/story/storyboard.json. Builder notes: ${b ? b.notes : '(the builder failed; build it yourself)'}.
Take many stills (every 0.3 s around text entrances and exits, plus random points), Read them, and zoom in with PIL. Check each of these:
- the texts match the storyboard exactly;
- reading time is long enough;
- no overflow, overlap or clipping;
- no dashes;
- determinism (pixel-diff two seeks to the same time);
- crispness at 4K (--scale 2);
- moves land on the Cornfield Chase beats from map.json;
- no glitches at the scene's start or end;
- at least 3 techniques, and not a text slide;
- the classic-level wow factor.
Fix everything yourself, re-check, and return verdict, issues and fixes.`, { label: 'review:' + s.id, phase: 'Scenes', schema: REVIEW }),
)
log(`scenes: ${scenes.filter(Boolean).map(x => x.id + ':' + x.verdict).join(', ')}`)

// ---------------- Assemble ----------------
phase('Assemble')
const ASSEMBLE = `1) Render the full 4K picture: node ${A}/engine/render.js --from 0 --to <storyboard total> --out ${A}/out/picture_4k.mp4 --fps 60 --scale 2 --parallel 4. Verify the frame count and 3840x2160 with ffprobe.
2) Mux with ${A}/music/score.wav into ${A}/out/如何真正学好英语_4K.mp4: copy the video stream; H.264 high, level 5.2, yuv420p, 60 fps; AAC 320k at 48 kHz; +faststart. Keep it under 1.9 GB.
3) Make the 1080p preview ${A}/out/如何真正学好英语_1080p.mp4 (lanczos downscale).
4) Verify both files: resolution, fps, duration, streams, loudness and true peak after AAC encoding, and A/V sync.`
const asm = await agent(`${BRIEF}

Assemble the film.
${ASSEMBLE}
5) Make two B站 covers from the strongest signature shot: ${A}/out/cover_16x9.png (3840x2160) and ${A}/out/cover_4x3.png (2880x2160), each with a short big title.
6) Write ${A}/out/bilibili.md containing:
   - 3 honest, attractive title options, with no 最, 第一 or 保证;
   - a description of what the video says;
   - a sources list from EVIDENCE.md;
   - the music credit exactly as ${A}/music/LICENSES.md gives it;
   - tags.
Return ok, notes and files.`, { label: 'assemble', phase: 'Assemble', schema: DONE })

// ---------------- Polish ----------------
phase('Polish')
const review = await agent(`${BRIEF}

You are the film's director. Watch the cut ${A}/out/如何真正学好英语_1080p.mp4 the way a demanding B站 audience would: extract frames at 2 fps into contact sheets, Read all of them, and zoom into the key moments. Judge it against the 经典级标准 and the 全技巧工具箱:
- does it ride Cornfield Chase phrase by phrase?
- does the aha land on the climax?
- are the signature shots strong?
- is the variety cohesive?
- does the motif carry through, and does the color script work?
- does any part feel like a text slideshow or drag?
Return an overall verdict and 3 to 5 concrete targets: the weakest moments, each with its scene id, the problem, and a precise improvement.`, { label: 'director-review', phase: 'Polish', schema: POLISH })
const targets = (review && review.targets) || []
const fixes = await parallel(targets.map((t, i) => () => agent(`${BRIEF}

Director's note for scene ${t.scene}. PROBLEM: ${t.problem}. IMPROVEMENT: ${t.improvement}.
Implement it in ${A}/scenes/${t.scene}.js. Keep the texts, timing, facts and music sync unless the note says otherwise, and do not touch other scenes' files. Verify with stills at --scale 1 and --scale 2, Read them, and confirm the scene is clearly better, still deterministic, and free of overflow or overlap. Return verdict, issues and fixes.`, { label: 'polish:' + t.scene + ':' + i, phase: 'Polish', schema: REVIEW })))
const reasm = targets.length ? await agent(`${BRIEF}

Scenes ${targets.map(t => t.scene).join(', ')} were improved. Rebuild the deliverables:
${ASSEMBLE}
Update the covers if the cover shot changed. Return ok, notes and files.`, { label: 'reassemble', phase: 'Polish', schema: DONE }) : null

// ---------------- QA ----------------
phase('QA')
const qa = await parallel([
  () => agent(`${BRIEF}

Final visual QA of ${A}/out/如何真正学好英语_4K.mp4 and the 1080p version. Extract frames every 1 s and at every text in/out time, and Read them (contact sheets, zooming in where in doubt). Check for:
- overflow, overlap or clipping;
- typos versus the storyboard;
- text shown too briefly to read;
- glitches or blank frames at joins;
- stutter;
- 4K sharpness;
- polish.
Fix problems, re-render only what is needed (4K, --scale 2), re-mux, regenerate the 1080p file, and re-check. Return verdict, issues and fixes.`, { label: 'final-visual-qa', phase: 'QA', schema: REVIEW }),
  () => agent(`${BRIEF}

Final audio, sync and delivery QA of ${A}/out/如何真正学好英语_4K.mp4 and the 1080p version. Check:
- loudness and true peak after AAC;
- no clipping and no clicks;
- A/V sync;
- the Cornfield Chase climax and layer entries land on the intended visual moments (compare map.json with the scene starts, the aha line and the signature-shot frames);
- the start and the end are clean;
- the music credit in bilibili.md matches LICENSES.md.
Fix anything wrong. Return verdict, issues and fixes.`, { label: 'final-audio-qa', phase: 'QA', schema: REVIEW }),
])

// ---------------- Backup version ----------------
phase('Backup')
const backup = await agent(`${BRIEF}

Make the backup-music version: the same picture, scored with the CC0 track Epic Vista (John Bartmann). Its original file is in ${A}/music/epic_vista/ (score.wav was an earlier edit; the original download is in ${A}/music/src/ or ${A}/music/pool/, and the license is in ${A}/music/epic_vista/LICENSES.md).

Edit Epic Vista to the final picture ${A}/out/picture_4k.mp4 (the final storyboard is ${A}/story/storyboard.json):
- the length must equal the picture exactly;
- cut only at Epic Vista bar lines, with equal-power crossfades and no audible seams;
- its biggest lift lands at the aha line's time;
- its section changes fall as close as possible to the scene starts;
- the ending resolves cleanly.
Master it to about -14 LUFS with true peak at most -1 dBTP, no clipping and no clicks.

Then mux:
- ${A}/out/如何真正学好英语_备用配乐_4K.mp4: copy the video stream, AAC 320k.
- ${A}/out/如何真正学好英语_备用配乐_1080p.mp4: downscale from the 1080p preview, or re-mux the 1080p video.

Verify both files: loudness, peaks, sync, durations. Write ${A}/out/backup_music.md with the credit (CC0, no attribution required) and the edit notes. Return ok, notes and files.`, { label: 'backup-music', phase: 'Backup', schema: DONE })

return { title: SC.title, total: SC.total, scenes: SC.scenes, musicQA: mqa && mqa.verdict, assemble: asm, director: review, polish: fixes, reassemble: reasm, qa, backup }
