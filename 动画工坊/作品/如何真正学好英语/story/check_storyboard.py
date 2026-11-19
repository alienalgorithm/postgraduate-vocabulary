#!/usr/bin/env python3
"""Check A/story/storyboard.json against the music and the reading-time rule.
Usage: python3 -I check_storyboard.py [A]   (A defaults to the parent of this file's folder)
Exit code 0 = all checks pass."""
import json, os, re, sys, wave

A = sys.argv[1] if len(sys.argv) > 1 else os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sb = json.load(open(os.path.join(A, 'story/storyboard.json')))
mp = json.load(open(os.path.join(A, 'music/map.json')))
m = sb['music']
fails, notes = [], []

def fail(msg): fails.append(msg)

def need_text(s):
    n = len(re.sub(r'\s', '', s))
    return max(1.6, 0.6 + n / 6)

def need_fragment(s):
    return max(2.4, 0.6 + len(s.split()) / 3.5)

bars = m['bars']
beats = m['beats']
scenes = sb['scenes']
total = sb['total']

# 1. music fields copied from map.json
for k in ['file', 'bpm', 'beat_offset', 'bar', 'beats', 'bars', 'sections', 'climax', 'total']:
    if m.get(k) != mp.get(k):
        fail('music.%s differs from music/map.json' % k)

# 2. bar alignment
for s in scenes:
    d = min(abs(b - s['start']) for b in bars)
    if d > 0.05:
        fail('%s start %.4f is %.3f s off the nearest bar line' % (s['id'], s['start'], d))
    k = min(range(len(bars)), key=lambda i: abs(bars[i] - s['start']))
    if s.get('bar') is not None and s['bar'] != k:
        fail('%s says bar %s but starts on bar %d' % (s['id'], s['bar'], k))

# 3. contiguity
if abs(scenes[0]['start']) > 1e-9:
    fail('first scene does not start at 0')
for a, b in zip(scenes, scenes[1:]):
    if abs(a['start'] + a['duration'] - b['start']) > 0.002:
        fail('%s ends %.4f but %s starts %.4f' % (a['id'], a['start'] + a['duration'], b['id'], b['start']))
last_end = scenes[-1]['start'] + scenes[-1]['duration']
if abs(last_end - total) > 0.002:
    fail('last scene ends %.4f, total is %.4f' % (last_end, total))

# 4. total equals the score length (map total and the wav itself)
if abs(total - m['total']) > 0.002:
    fail('total %.4f != music.total %.4f' % (total, m['total']))
wav = os.path.join(A, m['file'][2:] if m['file'].startswith('A/') else m['file'])
with wave.open(wav) as w:
    wav_len = w.getnframes() / w.getframerate()
if abs(total - wav_len) > 0.005:
    fail('total %.4f != score.wav length %.4f' % (total, wav_len))

# 5. aha line exactly at the climax
aha = sb['aha']
sc = next(s for s in scenes if s['id'] == aha['scene'])
aha_texts = [t for t in sc['texts'] if t.get('aha')]
if not aha_texts:
    fail('no aha text in %s' % aha['scene'])
else:
    first = min(aha_texts, key=lambda t: t['in'])
    g = sc['start'] + first['in']
    if abs(g - m['climax']) > 0.05:
        fail('aha line appears at %.4f, climax is %.4f' % (g, m['climax']))
    if abs(g - aha['at']) > 0.002:
        fail('aha.at %.4f does not match the text (%.4f)' % (aha['at'], g))
    joined = ''.join(t['text'] for t in sorted(aha_texts, key=lambda t: t['in']))
    if joined != aha['text']:
        fail('aha texts "%s" != aha.text "%s"' % (joined, aha['text']))
    notes.append('aha "%s" at %.4f, climax %.4f, diff %.1f ms' % (joined, g, m['climax'], abs(g - m['climax']) * 1000))

# 6. reading time for every text, texts inside their scene, no dashes, one source at a time
n_texts = 0
for s in scenes:
    for t in s['texts']:
        n_texts += 1
        have = t['out'] - t['in']
        need = need_text(t['text'])
        if have + 1e-6 < need:
            fail('%s "%s" stays %.3f s, needs %.3f s' % (s['id'], t['text'][:30], have, need))
        if t['in'] < -1e-9 or t['out'] > s['duration'] + 1e-6:
            fail('%s "%s" [%.3f, %.3f] is outside the scene (0, %.4f)' % (s['id'], t['text'][:30], t['in'], t['out'], s['duration']))
        if re.search(r'[—–]', t['text']):
            fail('%s "%s" contains a dash' % (s['id'], t['text']))
    srcs = {}
    for t in s['texts']:
        if t['role'] == 'source':
            key = t.get('block') or t['text']
            a, b = srcs.get(key, (t['in'], t['out']))
            srcs[key] = (min(a, t['in']), max(b, t['out']))
    iv = sorted(srcs.items(), key=lambda kv: kv[1][0])
    for (k1, (a1, b1)), (k2, (a2, b2)) in zip(iv, iv[1:]):
        if a2 < b1 - 1e-6:
            fail('%s two sources on screen at once: "%s" and "%s"' % (s['id'], k1[:25], k2[:25]))

# 7. visual_text: fragments readable as English glances, at most 3 on screen, slots never collide
n_vis = 0
for s in scenes:
    vt = s.get('visual_text', [])
    frs = [v for v in vt if v['role'] != 'texture']
    for v in vt:
        n_vis += 1
        if v['in'] < -1e-9 or v['out'] > s['duration'] + 1e-6:
            fail('%s visual_text %s outside the scene' % (s['id'], v['id']))
        if re.search(r'[—–]', v['text']):
            fail('%s visual_text %s contains a dash' % (s['id'], v['id']))
    for v in frs:
        if v['out'] - v['in'] + 1e-6 < need_fragment(v['text']):
            fail('%s fragment %s stays %.2f s, needs %.2f s' % (s['id'], v['id'], v['out'] - v['in'], need_fragment(v['text'])))
    for v in frs:
        on = [w for w in frs if w['in'] <= v['in'] + 1e-9 and w['out'] > v['in'] + 1e-9]
        if len(on) > 3:
            fail('%s %d fragments on screen at %.3f' % (s['id'], len(on), v['in']))
    for slot in set(v.get('slot') for v in frs):
        sl = sorted([v for v in frs if v.get('slot') == slot], key=lambda v: v['in'])
        for a, b in zip(sl, sl[1:]):
            if b['in'] < a['out'] - 1e-6:
                fail('%s slot %s: %s and %s overlap' % (s['id'], slot, a['id'], b['id']))
    if frs:
        gaps = [round(b['in'] - a['in'], 3) for a, b in zip(frs, frs[1:])]
        notes.append('%s fragment intervals (s): %s' % (s['id'], gaps))

# 8. signature shots land on beats of the strongest musical moments
anchor_ts = [a['t'] for a in m['anchors']]
for sh in sb['signature_shots']:
    for mm in sh.get('music_moments', []):
        db = min(abs(b - mm['t']) for b in beats)
        if db > 0.05:
            fail('signature %s moment %.3f is off the beat grid' % (sh['scene'], mm['t']))
    tags = ['%.3f(bar %d)' % (mm['t'], mm['bar']) for mm in sh.get('music_moments', [])]
    notes.append('signature %s %s: %s' % (sh['scene'], sh['name'], ', '.join(tags)))
drop = [mm for sh in sb['signature_shots'] for mm in sh.get('music_moments', []) if abs(mm['t'] - m['climax']) < 0.05]
if not drop:
    fail('no signature shot lands on the climax')

# 9. cues on the grid
for s in scenes:
    for c in s.get('cues', []):
        if c['t'] < -1e-9 or c['t'] > s['duration'] + 1e-6:
            fail('%s cue %.3f outside the scene' % (s['id'], c['t']))
        if abs(s['start'] + c['t'] - c['global']) > 0.002:
            fail('%s cue %.3f global mismatch' % (s['id'], c['t']))

# 10. evidence count used by the closing quiz scene ("十几次"; v2: s10, the scene of sb['quote'])
quiz = sb.get('quote', {}).get('scene', scenes[-1]['id'])
count = 0
for s in scenes:
    if s['id'] == quiz:
        continue
    count += sum(t['text'].count('evidence') for t in s['texts'])
    count += sum(1 for v in s.get('visual_text', []) if 'evidence' in v['text'])
count += 1  # s06 video frame of article 51 (combed through the field evidence.), shown as an image
if not 11 <= count <= 19:
    fail('evidence appears %d times before %s; "十几次" needs 11 to 19' % (count, quiz))
notes.append('evidence readable occurrences before %s: %d' % (quiz, count))

# 11. scenes are exactly map.json's scene_slots (id, start, duration)
slots = mp.get('scene_slots', [])
if [x['id'] for x in slots] != [x['id'] for x in scenes]:
    fail('scene ids %s differ from map.scene_slots %s' % ([x['id'] for x in scenes], [x['id'] for x in slots]))
for sl, s in zip(slots, scenes):
    if abs(sl['start'] - s['start']) > 0.002 or abs(sl['duration'] - s['duration']) > 0.002:
        fail('%s [%.4f, +%.4f] differs from map slot [%.4f, +%.4f]' % (s['id'], s['start'], s['duration'], sl['start'], sl['duration']))

# 12. every cue (a move in "motion") sits on the sixteenth-note grid of the real beats
SIX = m['beat'] / 4
off_grid = 0
for s in scenes:
    for c in s.get('cues', []):
        g = c['global']
        prev = max([b for b in beats if b <= g + 1e-6] or [beats[0]])
        k = (g - prev) / SIX
        if abs(k - round(k)) * SIX > 0.006:
            off_grid += 1
            fail('%s cue at %.4f is %.1f ms off the sixteenth grid' % (s['id'], g, abs(k - round(k)) * SIX * 1000))
notes.append('cues on the sixteenth grid: %d of %d' % (sum(len(s.get('cues', [])) for s in scenes) - off_grid, sum(len(s.get('cues', [])) for s in scenes)))

# 13. the burst also carries a signature shot; storyboard keeps the craft fields
if 'burst' in m and not [mm for sh in sb['signature_shots'] for mm in sh.get('music_moments', []) if abs(mm['t'] - m['burst']) < 0.05]:
    fail('no signature shot lands on the burst (%.3f)' % m['burst'])
for k in ['motif', 'color_script', 'signature_shots']:
    if not sb.get(k):
        fail('storyboard has no %s' % k)
if len(sb.get('color_script', [])) != len(scenes):
    fail('color_script has %d entries for %d scenes' % (len(sb.get('color_script', [])), len(scenes)))
for s in scenes:
    if not s.get('derived_from'):
        fail('%s has no derived_from' % s['id'])
    if len(s.get('techniques', [])) < 3:
        fail('%s uses %d techniques (needs at least 3)' % (s['id'], len(s.get('techniques', []))))
    if not s.get('cues') or not s.get('motion'):
        fail('%s has no cues/motion' % s['id'])

# 14. hard rules on screen text: no identity or nationality words, no promises
BANNED = ['\u5916\u56fd', '\u7f8e\u56fd', '\u82f1\u56fd', '\u6bcd\u8bed', '\u56fd\u7c4d', '\u8001\u5916', '保证', '天流利', '包会']
for s in scenes:
    for t in s['texts'] + s.get('visual_text', []):
        for w in BANNED:
            if w in t['text']:
                fail('%s "%s" contains banned word %s' % (s['id'], t['text'][:30], w))

print('storyboard: %d scenes, %d texts, %d visual_text, total %.4f s (%.0f:%05.2f)' % (len(scenes), n_texts, n_vis, total, total // 60, total % 60))
for s in scenes:
    k = min(range(len(bars)), key=lambda i: abs(bars[i] - s['start']))
    print('  %s  %8.4f  +%7.4f  bar %2d (off %.1f ms)  %s' % (s['id'], s['start'], s['duration'], k, abs(bars[k] - s['start']) * 1000, s.get('section', '')))
for n in notes:
    print('  note:', n)
if fails:
    print('FAIL (%d):' % len(fails))
    for f in fails:
        print('  -', f)
    sys.exit(1)
print('PASS: scene slots = map, bar alignment, contiguity, total = score length, aha at climax, reading time for every text, visual_text, sources, signature beats (climax and burst), cues on the 16th grid, evidence count, craft fields, banned words')
