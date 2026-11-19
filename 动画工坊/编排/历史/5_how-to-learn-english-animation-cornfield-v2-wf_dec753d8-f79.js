export const meta = {
  name: 'how-to-learn-english-animation-cornfield-v2',
  description: 'Rebuild the 4K music-only animated short with Cornfield Chase as the main BGM edited (segments, loops, optional CC0 blend) to a content-driven length; storyboard timed to the edit; scenes; assembly; director polish; QA; CC0 backup version',
  phases: [
    { title: 'Music', detail: 'analyze Cornfield Chase: bars, sections, loopable phrases, key' },
    { title: 'Plan', detail: 'content-driven structure and length' },
    { title: 'Edit', detail: 'build the BGM edit to the plan; music QA' },
    { title: 'Story', detail: 'final storyboard timed to the edit; fact check' },
    { title: 'Scenes', detail: 'adapt or build each scene, adversarial review' },
    { title: 'Assemble', detail: '4K render, mux, 1080p, covers, B站 copy' },
    { title: 'Polish', detail: 'director review, fixes, reassemble' },
    { title: 'QA', detail: 'final visual and audio QA' },
    { title: 'Backup', detail: 'same picture with a CC0 score' },
  ],
}

const A = args.A
const BRIEF = `Read ${A}/BRIEF.md first and obey every rule in it. The 配乐定稿 section, and especially its 用户 2026-11-19 更正 bullet (the video length is set by the content; the BGM may be segmented, looped or blended, but the rhythm must be perfect), overrides older music rules. Also obey the 经典级标准, the 全技巧工具箱, the 4K spec, the contracts and the hard rules.`
const DONE = { type: 'object', properties: { ok: { type: 'boolean' }, notes: { type: 'string' }, files: { type: 'array', items: { type: 'string' } } }, required: ['ok', 'notes'] }
const REVIEW = { type: 'object', properties: { id: { type: 'string' }, verdict: { type: 'string', enum: ['pass', 'fixed', 'fail'] }, issues: { type: 'array', items: { type: 'string' } }, fixes: { type: 'array', items: { type: 'string' } } }, required: ['id', 'verdict', 'issues', 'fixes'] }
const SB = { type: 'object', properties: { title: { type: 'string' }, total: { type: 'number' }, rationale: { type: 'string' },
  scenes: { type: 'array', items: { type: 'object', properties: { id: { type: 'string' }, start: { type: 'number' }, duration: { type: 'number' }, summary: { type: 'string' }, derived_from: { type: 'array', items: { type: 'string' } } }, required: ['id', 'start', 'duration', 'summary'] } } },
  required: ['title', 'total', 'scenes', 'rationale'] }
const POLISH = { type: 'object', properties: { verdict: { type: 'string' }, targets: { type: 'array', items: { type: 'object', properties: { scene: { type: 'string' }, problem: { type: 'string' }, improvement: { type: 'string' } }, required: ['scene', 'problem', 'improvement'] } } }, required: ['verdict', 'targets'] }

// ---------------- Music analysis ----------------
phase('Music')
await agent(`${BRIEF}

Analyze the user's licensed track ${A}/music/user/cornfield_chase.mp3 (Hans Zimmer, Cornfield Chase, 127.0 s) so an editor can cut, loop and blend it with bar-level precision. A previous run that was stopped may have left partial work in ${A}/music/analysis*/, ${A}/music/work/, ${A}/music/stems/ and similar folders; reuse anything that is correct.
Use librosa (pip install librosa soundfile if needed). Find:
- tempo, meter, key or tonal centre, every beat and every bar line;
- the phrase structure: which bars form complete phrases, and where each layer enters (organ ostinato, piano, strings, synth, percussion);
- the build, the fullest climax and the ending;
- loopable phrases: candidate loop points where the end of a phrase can return to an earlier bar without an audible seam. Score each candidate on spectral and RMS similarity and on phase continuity, and test-render a few loops so you can check the seam numerically.
Save plots (energy, novelty and self-similarity, with bars and sections marked) and Read them.
Write ${A}/music/analysis.md with the structure and loop candidates, with timecodes, and write ${A}/music/cc_map.json (the source map: bpm, meter, key, beat_offset, bar, beats, bars, phrases, sections, climax, and loop_candidates with quality scores).
Also write ${A}/music/LICENSES.md, recording the user's statement of 2026-11-19 that the license for using Hans Zimmer's Cornfield Chase (Interstellar soundtrack) in this B站 video has been obtained, plus the description credit line: 配乐 Hans Zimmer《Cornfield Chase》（《星际穿越》原声），已获授权. If any CC0 track is blended in later, it is added there too.
Return ok, notes (tempo, bars, sections, climax, best loop points) and files.`, { label: 'music-analysis', phase: 'Music', schema: DONE })

// ---------------- Content-driven plan ----------------
phase('Plan')
const plan = await agent(`${BRIEF}

Decide the film's structure and length from the CONTENT, not from the music length. Read:
- the previous full storyboard ${A}/story/v1_epicvista/storyboard.json and its script.md (11 scenes, about 205 s);
- ${A}/story/content.json and content.md (the motif, color script, signature shots and techniques);
- ${A}/story/EVIDENCE.md;
- ${A}/music/analysis.md and cc_map.json, so you know what Cornfield Chase can offer: its quiet ostinato, its layer entries, its build and climax.

Choose the length that gives the best pacing for B站, about 150 to 190 s. Plan the scenes (keep reusable scenes, merge or trim weak ones) so that the thesis is clear, the three signature shots and the motif survive, and nothing drags. For each scene give:
- its id;
- its target duration in seconds;
- its energy (1 to 10);
- the musical role it needs: quiet ostinato, layer entry, build, climax or resolution;
- derived_from (previous scene ids; s01 to s05 have working code in ${A}/scenes_v1/);
- a one-line summary.
Mark the aha line's scene and where in the scene it should land.
Write ${A}/story/plan.json and ${A}/story/plan.md. Return the scene list with target durations, the total, the title and the rationale.`, { label: 'plan', phase: 'Plan', schema: SB })

// ---------------- BGM edit ----------------
phase('Edit')
await agent(`${BRIEF}

You are the music editor. Build the film's BGM to fit the content plan ${A}/story/plan.json and plan.md (scene target durations, energy, musical roles and the aha moment). Use the analysis in ${A}/music/analysis.md and ${A}/music/cc_map.json, and the source track ${A}/music/user/cornfield_chase.mp3.
Make an edit of Cornfield Chase whose energy follows the plan: a quiet ostinato under the opening, layers entering as the revelations come, a build, its fullest climax exactly where the aha line lands, and a warm, clean resolution under the method card and credit. To reach the planned length you may use segments, loop complete phrases or repeat sections. Blend a CC0 track from ${A}/music/src/ or ${A}/music/pool/ only if it clearly improves the result and harmonises in key, tempo and timbre; otherwise use only Cornfield Chase.
Rules:
- cut only at bar lines, with equal-power crossfades;
- no audible seams; it must sound composed;
- no pitch change;
- tempo change only if unavoidable, and no more than 3 percent;
- the ending resolves rather than stopping abruptly, unless it ends on a deliberate final hit.
Snap the plan's scene boundaries to the nearest bar lines of YOUR edit; scene lengths may move slightly to keep the musical phrases whole.
Render ${A}/music/score.wav (48 kHz, stereo, 24-bit) and master it: about -14 LUFS, true peak at most -1 dBTP, no clipping or clicks, and no unintended silence.
Write these files:
- ${A}/music/map.json, for the EDITED score's own timeline: bpm, beat_offset, bar, beats, bars, sections, climax, total, plus scene_slots [{id, start, duration}] snapped to bars;
- ${A}/music/energy.json (fps 60, values, hits);
- ${A}/music/edit.md (every cut and loop with source and target times, and why);
- the updated LICENSES.md, if a CC0 track was blended in.
Check every seam numerically (sample-jump scan, RMS and spectrum continuity) and with spectrogram crops you Read. Return ok, notes and files.`, { label: 'music-edit', phase: 'Edit', schema: DONE })

const mqa = await agent(`${BRIEF}

Adversarially QA the edited BGM ${A}/music/score.wav, checking it against ${A}/music/edit.md, map.json, energy.json and the source ${A}/music/user/cornfield_chase.mp3. The user wants it absolutely perfect.
Check:
- every seam and loop point is inaudible: sample-jump scan, RMS and spectral continuity, phase. Render spectrogram crops around each seam and Read them;
- no clicks, no clipping, no unintended silence;
- loudness is about -14 LUFS and true peak is at most -1 dBTP;
- the edit follows the plan's energy arc (compare with ${A}/story/plan.json);
- the climax in map.json really is the fullest moment;
- the beats and bars in map.json match the audio (re-run beat tracking);
- energy.json matches the audio;
- no pitch change, and any tempo change is no more than 3 percent;
- the ending resolves;
- any blended CC0 track is credited in LICENSES.md.
Fix problems by re-editing (update map.json, energy.json and edit.md if times change). Return verdict, issues and fixes.`, { label: 'music-qa', phase: 'Edit', schema: REVIEW })

// ---------------- Final storyboard ----------------
phase('Story')
const timed = await agent(`${BRIEF}

Write the final ${A}/story/storyboard.json (storyboard contract; copy music fields from ${A}/music/map.json) fitted to the edited BGM. Sources:
- ${A}/story/plan.json and plan.md;
- the previous storyboard ${A}/story/v1_epicvista/storyboard.json and script.md (texts, visuals, techniques);
- ${A}/story/content.json;
- ${A}/story/EVIDENCE.md;
- ${A}/music/map.json, especially scene_slots, climax and beats.

Timing rules:
- the scenes use exactly map.json's scene_slots: every start is on a bar line and they are contiguous;
- total equals the edited score length;
- the aha line appears exactly at map.climax;
- the signature shots land on the strongest musical moments;
- every text meets the reading-time rule; prefer fewer, stronger words over rushed text.
In each scene's "motion", say which moves land on which beats or hits. Keep "techniques", "motif", "color_script", "signature_shots" and "derived_from".

Then write ${A}/story/script.md as a readable version with timecodes. Run a python check (adapt ${A}/story/check_storyboard.py) covering: bar alignment, contiguity, total, aha at climax, and reading time. Fix until it passes. Return the scene list (with derived_from), total, title and rationale.`, { label: 'storyboard', phase: 'Story', schema: SB })

const story = await agent(`${BRIEF}

Adversarially fact-check and polish ${A}/story/storyboard.json and script.md. Check each of these:
- every claim and number against ${A}/story/EVIDENCE.md, with exact source labels;
- no overclaims;
- no dashes;
- the Chinese is natural, punchy and correct;
- English is spelled correctly;
- every text meets the reading-time rule;
- the timing rules hold against ${A}/music/map.json;
- the persona is only "B站UP主 朋克英语";
- every scene uses at least 3 techniques and is not text-led;
- the picture rides the music: quiet start, revelations on layer entries, build, aha at the climax, and resolution.
Fix both files and re-run the checks. Return the final scene list (keep derived_from), total, title and a rationale listing your changes.`, { label: 'fact-check', phase: 'Story', schema: SB })
const SC = (story && story.scenes && story.scenes.length) ? story : timed
log(`storyboard: ${SC.scenes.length} scenes, ${SC.total}s; music QA ${mqa && mqa.verdict}`)

// ---------------- Scenes ----------------
phase('Scenes')
const scenes = await pipeline(SC.scenes,
  s => agent(`${BRIEF}

Build scene ${s.id} (start ${s.start}s, duration ${s.duration}s). Summary: ${s.summary}. Derived from: ${(s.derived_from || []).join(', ') || 'none'}.
Read these first:
- ${A}/story/storyboard.json (your scene entry is the spec: use every text exactly, with its in/out times, and follow the techniques, motion and beat notes, the motif and the color script);
- ${A}/story/script.md;
- ${A}/engine/README.md and ${A}/engine/design.css;
- any previous code for derived_from scenes in ${A}/scenes_v1/ (s01 to s05). Reuse and adapt it to the new timing, texts and beats.

Write ${A}/scenes/${s.id}.js using only the engine API, so the scene stays deterministic and seekable. It must be a classic-level shot, not a text slide:
- use at least 3 toolbox techniques;
- give it depth, light, motion and the motif;
- land moves on the edited BGM's beats and hits, and drive glow and particles with ctx.util.energy(t);
- make smooth handoffs to the neighbouring scenes;
- keep text large and legible, with no overflow or overlap.

Check your work:
- take at least 10 stills (node ${A}/engine/still.js), including every text's in and out times, and Read them;
- take two stills at --scale 2 and zoom in;
- render a 1080p check: node ${A}/engine/render.js --from ${s.start} --to ${s.start + s.duration} --out ${A}/out/check_${s.id}.mp4 --parallel 4 --scale 1.

Return ok, notes and files.`, { label: 'build:' + s.id, phase: 'Scenes', schema: DONE }),
  (b, s) => agent(`${BRIEF}

Adversarially review scene ${s.id} (start ${s.start}s, duration ${s.duration}s) in ${A}/scenes/${s.id}.js against ${A}/story/storyboard.json. Builder notes: ${b ? b.notes : '(the builder failed, so build the scene yourself)'}.
Take many stills: every 0.3 s around text entrances and exits, plus some random times. Read them, and zoom in with PIL where needed.
Check each of these:
- the texts match the storyboard exactly;
- each text stays on screen long enough to read;
- no overflow, overlap or clipping;
- no dashes;
- the scene is deterministic (pixel-diff two seeks to the same time);
- it is crisp in 4K at --scale 2;
- moves land on the beats in map.json;
- no glitches at the scene's start or end;
- it uses at least 3 techniques and is not a text slide;
- it has classic-level wow factor.
Fix everything yourself and re-check. Return verdict, issues and fixes.`, { label: 'review:' + s.id, phase: 'Scenes', schema: REVIEW }),
)
log(`scenes: ${scenes.filter(Boolean).map(x => x.id + ':' + x.verdict).join(', ')}`)

// ---------------- Assemble ----------------
phase('Assemble')
const ASSEMBLE = `1) Render the full 4K picture: node ${A}/engine/render.js --from 0 --to <storyboard total> --out ${A}/out/picture_4k.mp4 --fps 60 --scale 2 --parallel 4. Verify the frame count and 3840x2160 with ffprobe.
2) Mux it with ${A}/music/score.wav into ${A}/out/如何真正学好英语_4K.mp4: copy the video stream; H.264 high, level 5.2, yuv420p, 60 fps; AAC 320k at 48 kHz; +faststart. Keep the file under 1.9 GB.
3) Make the 1080p preview ${A}/out/如何真正学好英语_1080p.mp4 (lanczos downscale).
4) Verify both files: resolution, fps, duration, streams, loudness and true peak after AAC, and A/V sync.`
const asm = await agent(`${BRIEF}

Assemble the film.
${ASSEMBLE}
5) Make two B站 covers from the strongest signature shot: ${A}/out/cover_16x9.png (3840x2160) and ${A}/out/cover_4x3.png (2880x2160), each with a short big title.
6) Write ${A}/out/bilibili.md with:
   - 3 title options that are honest and attractive (no 最/第一/保证);
   - a description;
   - a sources list from EVIDENCE.md;
   - the music credits exactly as in ${A}/music/LICENSES.md;
   - tags.
Return ok, notes and files.`, { label: 'assemble', phase: 'Assemble', schema: DONE })

// ---------------- Polish ----------------
phase('Polish')
const review = await agent(`${BRIEF}

You are the film's director. Watch ${A}/out/如何真正学好英语_1080p.mp4 the way a demanding B站 audience would: extract frames at 2 fps into contact sheets, Read them all, and zoom in on the key moments. Judge it against the 经典级标准 and the 全技巧工具箱:
- does the picture ride the BGM edit phrase by phrase?
- does the aha land on the climax?
- are the signature shots strong?
- is the variety cohesive?
- does the motif carry through, and does the color script work?
- is there any text-slideshow feel, or any drag?
Return an overall verdict and 3 to 5 concrete targets, each with a scene id, the problem and a precise improvement.`, { label: 'director-review', phase: 'Polish', schema: POLISH })
const targets = (review && review.targets) || []
const fixes = await parallel(targets.map((t, i) => () => agent(`${BRIEF}

Director's note for scene ${t.scene}. PROBLEM: ${t.problem}. IMPROVEMENT: ${t.improvement}.
Implement it in ${A}/scenes/${t.scene}.js. Keep the texts, timing, facts and music sync unless the note says otherwise, and do not touch other scenes' files. Verify with stills at --scale 1 and --scale 2, Read them, and confirm the scene is better, still deterministic, and has no overflow or overlap. Return verdict, issues and fixes.`, { label: 'polish:' + t.scene + ':' + i, phase: 'Polish', schema: REVIEW })))
const reasm = targets.length ? await agent(`${BRIEF}

Scenes ${targets.map(t => t.scene).join(', ')} were improved. Rebuild:
${ASSEMBLE}
Update the covers if the cover shot changed. Return ok, notes and files.`, { label: 'reassemble', phase: 'Polish', schema: DONE }) : null

// ---------------- QA ----------------
phase('QA')
const qa = await parallel([
  () => agent(`${BRIEF}

Do the final visual QA of ${A}/out/如何真正学好英语_4K.mp4 and of the 1080p version. Extract frames every 1 s and at every text in/out time, then Read them (contact sheets are fine; zoom into anything doubtful). Check for:
- overflow, overlap or clipping;
- typos compared with the storyboard;
- text on screen too briefly;
- glitches or blank frames at joins;
- stutter;
- 4K sharpness;
- overall polish.
Fix problems, re-render only what is needed, re-mux, regenerate the 1080p file, and re-check. Return verdict, issues and fixes.`, { label: 'final-visual-qa', phase: 'QA', schema: REVIEW }),
  () => agent(`${BRIEF}

Do the final audio, sync and delivery QA of ${A}/out/如何真正学好英语_4K.mp4 and the 1080p version. Check:
- loudness and true peak after AAC encoding;
- no clipping, no clicks, no seams;
- A/V sync;
- the BGM's climax and phrase changes land on the intended visual moments (compare map.json with the scene starts, the aha line and the signature-shot frames);
- the film starts and ends cleanly;
- the music credits in bilibili.md match LICENSES.md.
Fix anything you find. Return verdict, issues and fixes.`, { label: 'final-audio-qa', phase: 'QA', schema: REVIEW }),
])

// ---------------- Backup ----------------
phase('Backup')
const backup = await agent(`${BRIEF}

Make the backup-music version: the same picture, scored only with CC0 music (no Cornfield Chase), for use if B站 mutes or blocks the main version. Primary candidate: Epic Vista by John Bartmann (CC0). Its earlier edit and license are in ${A}/music/epic_vista/; the original download is in ${A}/music/src/ or ${A}/music/pool/. You may use other CC0 tracks already downloaded there if they fit better.
Edit it to the final picture ${A}/out/picture_4k.mp4 (storyboard ${A}/story/storyboard.json):
- its length equals the picture exactly;
- cut only at bar lines, with equal-power crossfades, so the seams are inaudible;
- its biggest lift lands at the aha line;
- section changes sit as close to scene starts as possible;
- the ending resolves.
Master it to about -14 LUFS with true peak at most -1 dBTP, with no clipping or clicks.
Mux two files: ${A}/out/如何真正学好英语_备用配乐_4K.mp4 (copy the video stream, AAC 320k) and ${A}/out/如何真正学好英语_备用配乐_1080p.mp4.
Verify both files: loudness, peaks, sync and durations. Write ${A}/out/backup_music.md with the credits (CC0, no attribution required) and your edit notes.
Return ok, notes and files.`, { label: 'backup-music', phase: 'Backup', schema: DONE })

return { title: SC.title, total: SC.total, scenes: SC.scenes, plan, musicQA: mqa && { verdict: mqa.verdict, issues: mqa.issues }, assemble: asm, director: review, polish: fixes, reassemble: reasm, qa, backup }
