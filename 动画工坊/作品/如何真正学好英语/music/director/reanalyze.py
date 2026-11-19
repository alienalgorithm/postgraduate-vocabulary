# Re-analyze score.wav: verify the bar grid from the audio itself, build map.json and energy.json.
# usage: python3 -I reanalyze.py <score.wav> <edit_meta.json> <map.json> <energy.json>
import sys, json, warnings
warnings.filterwarnings('ignore')
import numpy as np
import soundfile as sf
import librosa
import scipy.signal as ss
from scipy.ndimage import gaussian_filter1d

wav, meta, out_map, out_energy = sys.argv[1:5]
meta = json.load(open(meta))
y, sr = sf.read(wav, dtype='float64')
total = len(y) / sr
mono = y.mean(1)
BAR = meta['bar']; BEAT = BAR / 4; LEAD = meta['lead']; lag3 = meta['lag3'][1]

# ---------------------------------------------------------------- 1. verify tempo/grid from audio
y22 = librosa.resample(mono.astype(np.float32), orig_sr=sr, target_sr=22050)
hop = 64; fps_o = 22050 / hop
onv = librosa.onset.onset_strength(y=y22, sr=22050, hop_length=hop, n_fft=1024, lag=1, max_size=3)
# low band (bass / kick) onset envelope
S = np.abs(librosa.stft(y22, n_fft=2048, hop_length=hop))
fr = librosa.fft_frequencies(sr=22050, n_fft=2048)
low = np.log1p(100 * S[fr < 180]); onlow = np.r_[0, np.maximum(0, np.diff(low, axis=1)).sum(0)]


def grid_score(env, bpm, off, a, b):
    per = 60 / bpm
    bt = np.arange(off, b, per); bt = bt[bt >= a]
    idx = np.round(bt * fps_o).astype(int); idx = idx[idx < len(env) - 3]
    v = np.maximum.reduce([env[np.clip(idx + d, 0, len(env) - 1)] for d in range(-2, 3)])
    return v.mean() / (env[int(a * fps_o):int(b * fps_o)].mean() + 1e-9)


# bar period measured from the audio: cross-correlate output bars that carry repeated material
bp_ = ss.butter(4, [80, 5000], 'band', fs=sr, output='sos'); yf = ss.sosfiltfilt(bp_, mono)
def lag_ms(ea, eb, search=0.03):
    ta, tb = LEAD + ea * BAR, LEAD + eb * BAR
    Lw = int(BAR * sr); W = int(search * sr)
    xa = yf[int(ta * sr):int(ta * sr) + Lw]
    seg = yf[int(tb * sr) - W:int(tb * sr) + Lw + W]
    c = ss.correlate(seg, xa, mode='valid')
    nrm = np.sqrt(np.convolve(seg ** 2, np.ones(Lw), 'valid')) * np.sqrt((xa ** 2).sum()) + 1e-12
    cn = c / nrm; j = int(np.argmax(cn))
    return (j - W) / sr * 1000, float(cn[j])
pairs = [(48, 54), (49, 55), (50, 56), (51, 57), (52, 58), (67, 73), (68, 74), (69, 75), (2, 6), (0, 4),
         (13, 21), (15, 23), (29, 37), (31, 39), (15, 31), (16, 32), (2, 14)]
lagres = []
for ea, eb in pairs:
    lm, cc = lag_ms(ea, eb)
    lagres.append(dict(bars=[ea, eb], lag_ms=round(lm, 2), corr=round(cc, 3)))
good = [r for r in lagres if r['corr'] > 0.5]
span = np.array([r['bars'][1] - r['bars'][0] for r in good]); lg = np.array([r['lag_ms'] for r in good])
bar_meas = float(np.mean(BAR + lg / 1000 / span))
bpm_fit = 240.0 / bar_meas
# per-section beat-phase check at 94.000 BPM (phase of flux peaks; soft attacks peak ~20-60 ms late)
sections_chk = [('intro', 0.5, 30.6), ('tension', 30.7, 66.4), ('lift', 71.5, 107.2), ('breakdown', 107.3, 121.5),
                ('climax', 122.6, 168.5), ('afterglow', 168.6, 196.5)]
phase = {}
for name, a, b in sections_chk:
    sc = [(grid_score(onv, 94.0, off, a, b), off) for off in np.arange(0, BEAT, 0.002)]
    s, off = max(sc)
    d = ((off - LEAD + BEAT / 2) % BEAT) - BEAT / 2
    phase[name] = dict(peak_phase_s=round(float(off), 3), offset_vs_grid_ms=round(float(d) * 1000, 1), strength=round(float(s), 2))
# the drop attack, measured on the waveform
pk = np.abs(y).max(1)
i0 = int(122.3 * sr)
drop_t = float((i0 + np.where(pk[i0:] > 10 ** (-30 / 20))[0][0]) / sr)
first_t = float(np.where(pk > 10 ** (-40 / 20))[0][0] / sr)

# ---------------------------------------------------------------- 2. bars, beats
bars = [b['t'] for b in meta['bars'] if b['t'] < total]
beats = []
for e, tb in enumerate(bars):
    for q in range(4):
        tq = tb + q * BEAT
        if tq < total - 0.05:
            beats.append(round(tq, 4))
E = lambda k: bars[k]
sections = [
    dict(name='intro', start=0.0, end=E(12), note='hushed sustained pad chords (4-bar loop, played 3 times); bar 11 is the lead-in glide'),
    dict(name='tension', start=E(12), end=E(26), note='theme enters: bass pulse ostinato on every bar, circling 4-bar chord cycle'),
    dict(name='breath', start=E(26), end=E(28), note='bass drops out, suspended pad (G-C-B) and clock-like ticks; harmony left hanging'),
    dict(name='lift', start=E(28), end=E(42), note='theme returns on the downbeat, slowly louder to the end'),
    dict(name='breakdown_riser', start=E(42), end=E(48), note='bass leaves, pad and ticks thin out bar by bar, then near-silence'),
    dict(name='climax', start=E(48), end=E(66), note='THE DROP at bar 48: full band, three 6-bar phrases (bars 48, 54, 60)'),
    dict(name='afterglow', start=E(66), end=E(77), note='warm, calmer: bass pulses and soft pads return, 6-bar phrases'),
    dict(name='outro', start=E(77), end=round(total, 4), note='final chord with gentle ticking figure, natural release, fade to digital silence'),
]
for s in sections:
    s['start'] = round(s['start'], 4); s['end'] = round(s['end'], 4)

# near-silence before the drop (10 ms RMS below -50 dBFS)
n10 = int(0.01 * sr)
r10 = 20 * np.log10(np.sqrt(np.convolve(mono ** 2, np.ones(n10) / n10, 'same')) + 1e-12)
tt = np.arange(len(r10)) / sr
m = (tt > 118) & (tt < drop_t) & (r10 < -50)
q = np.where(m)[0]
# longest contiguous run ending at the drop
run_end = q[-1]; k = len(q) - 1
while k > 0 and q[k - 1] == q[k] - 1:
    k -= 1
silence = [round(float(tt[q[k]]), 3), round(float(tt[run_end]), 3)]

anchors = [
    dict(t=round(E(0), 3), bar=0, what='first downbeat: soft pad chord, the music starts from silence'),
    dict(t=round(E(4), 3), bar=4, what='intro 4-bar loop starts again (pass 2)'),
    dict(t=round(E(8), 3), bar=8, what='intro 4-bar loop pass 3'),
    dict(t=round(E(11), 3), bar=11, what='lead-in bar: rising glide into the theme'),
    dict(t=round(E(12), 3), bar=12, what='theme entry: first deep bass hit (attack about 66 ms after the bar line)'),
    dict(t=round(E(16), 3), bar=16, what='theme 4-bar cycle restarts (also bars 20, 24)'),
    dict(t=round(E(26), 3), bar=26, what='breath: bass drops out, suspended harmony (G-C-B), clock-like ticks'),
    dict(t=round(E(28), 3), bar=28, what='theme re-enters on the downbeat: the warm return (cycle restarts at 32, 36, 40)'),
    dict(t=round(E(42), 3), bar=42, what='breakdown starts (thinning)'),
    dict(t=round(E(44), 3), bar=44, what='bass gone: only pad and ticks, fading bar by bar'),
    dict(t=silence[0], bar=None, what='near-silence starts (below -50 dBFS) and lasts until the drop'),
    dict(t=round(drop_t, 4), bar=48, what='THE DROP: biggest lift of the piece, for the aha line'),
    dict(t=round(E(54), 3), bar=54, what='climax 6-bar phrase 2'),
    dict(t=round(E(60), 3), bar=60, what='climax 6-bar phrase 3'),
    dict(t=round(E(66), 3), bar=66, what='afterglow: the band thins to warm bass pulses and soft pads'),
    dict(t=round(E(67), 3), bar=67, what='afterglow 6-bar phrase 1'),
    dict(t=round(E(73), 3), bar=73, what='afterglow 6-bar phrase 2'),
    dict(t=round(E(76), 3), bar=76, what='last chord attack of the piece (last strong beat)'),
    dict(t=round(E(77), 3), bar=77, what='the music settles: bass releases, soft ticking coda on the final chord '
                                          '(recommended landing of the method card; 8.5 s of sustain and fade follow)'),
    dict(t=round(E(79), 3), bar=79, what='last bar of the coda figure, then the natural release and a fade to digital silence'),
]
# scene layout that keeps every planned scene at least as long as in content.json, all starts on bar lines
plan = [('s01', 0, 4), ('s02', 4, 6), ('s03', 10, 7), ('s04', 17, 9), ('s05', 26, 7), ('s06', 33, 9), ('s07', 42, 6),
        ('s08', 48, 9), ('s09', 57, 6), ('s10', 63, 7), ('s11', 70, None)]
scenes = []
for sid, b0, nb in plan:
    st = 0.0 if b0 == 0 else E(b0)
    en = total if nb is None else E(b0 + nb)
    scenes.append(dict(id=sid, bar=b0, start=round(st, 4), duration=round(en - st, 4)))
alt = [('s01', 0, 4), ('s02', 4, 8), ('s03', 12, 7), ('s04', 19, 9), ('s05', 28, 7), ('s06', 35, 7), ('s07', 42, 6),
       ('s08', 48, 9), ('s09', 57, 6), ('s10', 63, 7), ('s11', 70, None)]
scenes_alt = []
for sid, b0, nb in alt:
    st = 0.0 if b0 == 0 else E(b0)
    en = total if nb is None else E(b0 + nb)
    scenes_alt.append(dict(id=sid, bar=b0, start=round(st, 4), duration=round(en - st, 4)))

mp = dict(
    file='A/music/score.wav', sample_rate=sr, channels=2, bit_depth=24,
    bpm=94.0, bpm_measured=round(bpm_fit, 4),
    beat_offset=round(LEAD, 4), bar=round(BAR, 7), beat=round(BEAT, 7), meter='4/4',
    beats=beats, bars=[round(b, 4) for b in bars],
    sections=sections, climax=round(drop_t, 4), total=round(total, 4),
    silence_before_climax=silence,
    anchors=anchors,
    suggested_scenes=dict(note='Option A keeps every scene at least as long as content.json asks (s01-s06 = 42 bars exactly); '
                               'the theme entry then lands 2 bars into s03 and the warm return 2 bars into s05. Option B starts '
                               's03, s05 on those musical events and puts the breath at the end of s04, but s06 gets 7 bars '
                               '(17.87 s) instead of 22 s. Both: s08 starts on the drop, the method card lands on bar 77 (the music settles); '
                               'landing it on bar 76 (last chord attack) would need s10 one bar shorter. s10 = 7 bars is 17.87 s, '
                               '0.03 s under the 17.9 s of its last text in content.json.',
                          option_A=scenes, option_B=scenes_alt),
    grid_check=dict(method='bar period measured on score.wav by cross-correlating output bars that carry repeated '
                           'material (lag 0 = exactly on the 94.000 BPM grid); the drop attack and the first attack are '
                           'measured on the waveform',
                    repeat_lags=lagres, bar_measured=round(bar_meas, 6),
                    onset_flux_phase_by_section=phase, drop_attack_measured=round(drop_t, 4), drop_bar_line=round(E(48), 4),
                    first_attack_measured=round(first_t, 4),
                    note_after_bar_78='bars 78-80 are shifted +%.1f ms by the ending joint (ticks aligned by onset correlation)' % (-lag3 * 1000)),
)
json.dump(mp, open(out_map, 'w'), indent=1, ensure_ascii=False)

# ---------------------------------------------------------------- 3. energy.json (60 fps)
FPS = 60
nfr = int(np.ceil(total * FPS))
hopn = sr // FPS  # 800 samples
pw = np.convolve(mono ** 2, np.ones(1600) / 1600, 'same')      # 33 ms RMS window
centers = np.minimum((np.arange(nfr) * hopn + hopn // 2), len(pw) - 1)
rms_db = 10 * np.log10(pw[centers] + 1e-12)
# smoothing: fast rise, slower fall (visual-friendly), then light gaussian
sm = np.empty_like(rms_db); prev = rms_db[0]
a_up, a_dn = np.exp(-1 / (FPS * 0.03)), np.exp(-1 / (FPS * 0.18))
for i, v in enumerate(rms_db):
    a = a_up if v > prev else a_dn
    prev = a * prev + (1 - a) * v
    sm[i] = prev
sm = gaussian_filter1d(sm, 1.0)
top = np.percentile(sm, 99.5); floor = top - 36.0
vals = np.clip((sm - floor) / (top - floor), 0, 1)
slow = np.clip((gaussian_filter1d(rms_db, FPS * 0.6) - floor) / (top - floor), 0, 1)

# hits: grid-locked attacks (16th-note grid of the edit), each must stand out from its band over +-2 bars;
# time = half-rise point (dB) of the winning band
sys.path.insert(0, __import__('os').path.dirname(__file__))
from hits import select_hits_grid
grid16 = [b + j * BEAT / 4 for b in bars for j in range(16)]
allg = [h for h in select_hits_grid(mono, sr, grid16, drop_t) if h[1] >= 0.06]
hits = [(h[0], h[1]) for h in allg if h[1] >= 0.2]
soft = [(h[0], h[1]) for h in allg if h[1] < 0.2]
kicks = [(h[0], h[1]) for h in allg if h[1] >= 0.2 and h[2] == 'low']
en = dict(fps=FPS, duration=round(total, 4), frames=nfr,
          scale='values[i] = smoothed RMS of frame i (t = i/60 s) in dB, mapped so 0 = %.1f dBFS and 1 = %.1f dBFS (99.5th pct)' % (floor, top),
          values=[round(float(v), 4) for v in vals],
          slow=[round(float(v), 4) for v in slow],
          hits=[h[0] for h in hits],
          hit_strength=[h[1] for h in hits],
          kicks=[k[0] for k in kicks],
          kick_strength=[k[1] for k in kicks],
          soft_hits=[h[0] for h in soft],
          soft_hit_strength=[h[1] for h in soft],
          climax=round(drop_t, 4), silence_before_climax=silence,
          notes='hits: attacks on the 16th-note grid that stand out from the same band over the surrounding two bars '
                '(low 30-150 Hz, full band, or 2-15 kHz transients; steady pad gating and tremolo are not hits). time = '
                'where the attack reaches half its rise in dB (what the ear hears as the hit; bar hits in the theme sit '
                'about 70 ms after the bar line because the bass swells in). strength 0-1 = cube root of the power jump '
                'vs the 99th percentile, scaled down when the attack barely stands out; only strength >= 0.2 is listed '
                'in hits, weaker ones (>= 0.06) in soft_hits. kicks = the low-band subset of hits. The engine flashes on '
                'every entry of hits, so it only holds real, audible attacks. Suggested use: flash for strength > 0.6, '
                'gentle pulse for > 0.2. The drop at %.3f s is the only 1.0.' % E(48))
json.dump(en, open(out_energy, 'w'), separators=(',', ':'))
print('bar measured %.6f s (%.4f BPM) from %d repeat pairs, lags %s;' % (bar_meas, bpm_fit, len(good), [r['lag_ms'] for r in lagres]))
print(' drop attack %.4f vs bar line %.4f; first attack %.4f' % (drop_t, E(48), first_t))
print('phase check (flux-peak phase vs grid, ms):', {k: v['offset_vs_grid_ms'] for k, v in phase.items()})
print('silence before climax', silence)
print('energy frames', nfr, 'hits', len(hits), 'kicks', len(kicks))
for name, a, b in sections_chk:
    print('  %-10s hits %3d kicks %3d  mean energy %.2f' % (name, sum(a <= h[0] < b for h in hits), sum(a <= k[0] < b for k in kicks), vals[int(a * FPS):int(b * FPS)].mean()))
print('  outro      mean energy %.2f' % vals[int(197 * FPS):].mean())
