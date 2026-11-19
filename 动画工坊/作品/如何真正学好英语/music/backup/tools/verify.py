# Verify score_backup.wav: format/length, loudness profile, lifts, onsets on anchors, sample-jump scan at every
# edit point, HF-spike scan against the source, mono compatibility.
# usage: python3 -I verify.py <score_backup.wav> <edit_meta.json> <ev_src.npy>
import sys, json, numpy as np, soundfile as sf, scipy.signal as ss
sys.path.insert(0, sys.argv[0].rsplit('/', 1)[0])
from kloud import short_term
wav, meta, srcp = sys.argv[1], json.load(open(sys.argv[2])), sys.argv[3]
x, sr = sf.read(wav, dtype='float64'); info = sf.info(wav)
print('format: %s %s, %d Hz, %d ch, %d samples = %.6f s (target 169.342 s = %d samples)' % (info.format, info.subtype, sr, info.channels, len(x), len(x) / sr, round(169.342 * sr)))
print('first/last sample: %s / %s' % (x[0], x[-1]))
src = np.load(srcp); SR0 = 44100

# ---- loudness profile -------------------------------------------------------------------
tc, st = short_term(x, sr, 3.0, 0.1); tm, mo = short_term(x, sr, 0.4, 0.05)
secs = [(0, 11.217, 's01'), (11.217, 22.467, 's02'), (22.467, 35.592, 's03'), (35.592, 55.592, 's04'), (55.592, 74.342, 's05'),
        (74.342, 96.842, 's06'), (96.842, 111.842, 's07'), (111.842, 117.467, 's08 climax'), (117.467, 121.217, 'stop tail'),
        (121.217, 124.967, 's08 return'), (124.967, 143.092, 's09'), (143.092, 158.092, 's10'), (158.092, 169.342, 's10 card+end')]
print('\nsection          short-term S (3 s) median / max     momentary M (0.4 s) max')
for a, b, nm in secs:
    m = (tc >= a) & (tc <= b); mm = (tm >= a) & (tm <= b)
    print('  %-14s %7.2f-%7.2f   %6.1f / %6.1f LUFS          %6.1f' % (nm, a, b, np.median(st[m]), st[m].max(), mo[mm].max()))
# lifts: momentary loudness 0.4 s after minus 0.4 s before, at every 50 ms
d = int(round(0.4 / 0.05))
mof = np.maximum(mo, -40.0)
lift = mof[2 * d:] - mof[:-2 * d]; tl = tm[d:-d]
order = np.argsort(lift)[::-1]; picked = []
for i in order:
    if all(abs(tl[i] - p) > 2.0 for p, _ in picked): picked.append((tl[i], lift[i]))
    if len(picked) == 6: break
print('\nbiggest loudness lifts (M 0.4 s after minus 0.4 s before, floor -40 LUFS, i.e. inaudible on phone/laptop playback):', ', '.join('%.2f s +%.1f LU' % p for p in picked))
def Sx(a, b):
    seg = x[int(a * sr):int(b * sr)]
    from kloud import kweight
    return -0.691 + 10 * np.log10((kweight(seg, sr) ** 2).sum(1).mean() + 1e-20)
for a in (55.592, 111.842, 121.217):
    print('  level step at %.3f: 2 s before %.1f LUFS -> 2 s after %.1f LUFS (%+.1f LU)' % (a, Sx(a - 2, a), Sx(a, a + 2), Sx(a, a + 2) - Sx(a - 2, a)))
loud2 = max(((Sx(t0, t0 + 2), t0) for t0 in np.arange(0, 167, 0.25)))
print('  loudest 2-s window of the whole score starts at %.2f s (%.1f LUFS)' % (loud2[1], loud2[0]))
# onsets near anchors (broadband spectral flux, 2.7 ms hop)
mono = x.mean(1)
f, tt, Z = ss.stft(mono, sr, nperseg=1024, noverlap=1024 - 128)
Lg = np.log1p(1000 * np.abs(Z)); flux = np.r_[0, np.maximum(0, np.diff(Lg, axis=1)).sum(0)]
for a in (55.592, 111.842):
    sel = (tt > a - 0.08) & (tt < a + 0.08); i = np.argmax(flux[sel]); print('strongest onset within 80 ms of %.3f: %.4f s (flux %.0f, median flux %.0f)' % (a, tt[sel][i], flux[sel][i], np.median(flux)))
top = np.argsort(flux)[::-1]; tops = []
for i in top:
    if all(abs(tt[i] - u) > 1.0 for u, _ in tops): tops.append((tt[i], flux[i]))
    if len(tops) == 5: break
print('strongest onsets in the whole score:', ', '.join('%.3f s (%.0f)' % u for u in tops))

# ---- edit points: sample-jump scan -------------------------------------------------------
pts = [(s['at'], 'seam ' + s['note'][:24]) for s in meta['seams']]
pts += [(0.0 + 1e-3, 'start'), (meta['G0'], 'end of opening fade-in'), (meta['stop'] - 0.04, 'stop fade start'), (meta['stop'], 'stop (dry gone)'),
        (meta['ret'], 'return fade-in start'), (meta['H48'], 'return fade-in end'), (169.342 - 1.842, 'final fade start'), (169.342 - 1e-3, 'end')]
def jump_ratio(t, w=0.010, ref=1.0):
    a = int(round(t * sr)); d1 = np.abs(np.diff(x, axis=0)).max(1); d2 = np.abs(np.diff(x, 2, axis=0)).max(1)
    lo, hi = max(1, a - int(w * sr)), min(len(d1) - 1, a + int(w * sr))
    r0, r1 = max(0, a - int(ref * sr)), min(len(d1), a + int(ref * sr))
    r1 = min(r1, len(d2)); mask = np.ones(r1 - r0, bool); mask[lo - r0:hi - r0] = False
    q1 = np.percentile(d1[r0:r1][mask], 99.9) + 1e-9; q2 = np.percentile(d2[r0:r1][mask], 99.9) + 1e-9
    return d1[lo:hi].max() / q1, d2[lo:hi].max() / q2, 20 * np.log10(d1[lo:hi].max() + 1e-12)
print('\nsample-jump scan at every edit point (max |x[n]-x[n-1]| and |2nd difference| within +-10 ms, divided by the 99.9th percentile of the surrounding +-1 s; > 1 would mean a jump bigger than the music itself makes)')
worst = 0
for t, nm in sorted(pts):
    r1, r2, lv = jump_ratio(t); worst = max(worst, r1, r2)
    print('  %8.3f s  %-34s  1st diff %.2f   2nd diff %.2f   (largest step %.1f dBFS)' % (t, nm, r1, r2, lv))
nat = [jump_ratio(b['t']) for b in meta['bars'] if 1 < b['t'] < 168 and min(abs(b['t'] - p) for p, _ in pts) > 0.5]
nat = np.array(nat)
print('  natural bar lines for comparison (n=%d): 1st diff median %.2f max %.2f; 2nd diff median %.2f max %.2f; worst edit point %.2f'
      % (len(nat), np.median(nat[:, 0]), nat[:, 0].max(), np.median(nat[:, 1]), nat[:, 1].max(), worst))

# ---- HF spike scan against the source ------------------------------------------------------
def spikes(sig, fs, thr_db=18):
    h = ss.sosfilt(ss.butter(6, 7000, 'hp', fs=fs, output='sos'), sig.mean(1))
    n = int(0.002 * fs); e = 10 * np.log10(np.convolve(h ** 2, np.ones(n) / n, 'same') + 1e-16)
    hop = int(0.001 * fs); e = e[::hop]
    from scipy.ndimage import median_filter
    r = e - median_filter(e, size=401)
    pk, _ = ss.find_peaks(r, height=thr_db, distance=20)
    return pk * hop / fs, r[pk], e[pk]
to, ro, eo = spikes(x, sr); ts, rs, es = spikes(src, SR0)
segs = meta['segments']
def o2s(t):
    cand = [s for s in segs if s['o0'] - 1e-6 <= t < s['o1'] + 0.05]
    if not cand: return None
    s = cand[-1]; return s['s0'] + (t - s['o0'])
bad, synth = [], []
for t, r, e in zip(to, ro, eo):
    if meta['stop'] - 0.05 <= t < meta['ret']:
        synth.append((round(t, 3), round(r, 1), round(e, 1))); continue
    s_ = o2s(t)
    if s_ is None or np.abs(ts - s_).min() > 0.006:
        if e > -100: bad.append((round(t, 3), None if s_ is None else round(s_, 3), round(r, 1), round(e, 1)))
print('\nHF spike scan (7 kHz high-pass, 2 ms energy 18 dB over the local median): %d in the output, %d in the source; output spikes with no source counterpart within 6 ms: %d %s; inside the stop tail: %d %s'
      % (len(to), len(ts), len(bad), bad[:10], len(synth), synth[:5]))

# ---- stereo / mono ----------------------------------------------------------------------------
c = np.corrcoef(x[:, 0], x[:, 1])[0, 1]
lo = ss.sosfiltfilt(ss.butter(4, 200, 'low', fs=sr, output='sos'), x, axis=0); cl = np.corrcoef(lo[:, 0], lo[:, 1])[0, 1]
mono_loss = []
for a, b, nm in secs:
    seg = x[int(a * sr):int(b * sr)]; st_ = (seg ** 2).mean(); mn = (seg.mean(1) ** 2).mean() * 2
    mono_loss.append('%s %.1f' % (nm.split()[0], 10 * np.log10(mn / st_)))
print('\nL/R correlation %.2f (below 200 Hz %.2f); mono fold-down vs stereo per section (dB): %s' % (c, cl, ', '.join(mono_loss)))
