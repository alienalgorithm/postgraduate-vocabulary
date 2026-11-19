# mix automation (data-driven section targets), loudness normalisation to -14 LUFS, true-peak limiting
# to -1.2 dBTP, TPDF dither, 24-bit WAV.  usage: python3 -I stage2.py <fixed_48.npy> <workdir> <out.wav>
import sys, json, re, subprocess
import numpy as np, scipy.signal as ss, soundfile as sf
from scipy.ndimage import minimum_filter1d
sys.path.insert(0, sys.argv[0].rsplit('/', 1)[0])
from kloud import short_term

inp, work, outwav = sys.argv[1:4]
import os
SR, CEIL_TP = 48000, -1.2
TARGET_I = float(os.environ.get('TARGET_I', '-14.0'))
x = np.load(inp); n = len(x); tt = np.arange(n) / SR
# gentle low shelf (RBJ biquad, one pass, minimum phase): the source's sub-bass pad is very heavy once its
# anti-phase low end is folded to mono; trimming it lets the mid range (what phones and laptops play) come up
SHELF_F, SHELF_DB = float(os.environ.get('SHELF_F', '90')), float(os.environ.get('SHELF_DB', '-3'))
if SHELF_DB:
    A_ = 10 ** (SHELF_DB / 40); w0 = 2 * np.pi * SHELF_F / SR; al = np.sin(w0) / 2 * np.sqrt(2); cw = np.cos(w0)
    bq = np.array([A_ * ((A_ + 1) - (A_ - 1) * cw + 2 * np.sqrt(A_) * al), 2 * A_ * ((A_ - 1) - (A_ + 1) * cw),
                   A_ * ((A_ + 1) - (A_ - 1) * cw - 2 * np.sqrt(A_) * al)])
    aq = np.array([(A_ + 1) + (A_ - 1) * cw + 2 * np.sqrt(A_) * al, -2 * ((A_ - 1) + (A_ + 1) * cw),
                   (A_ + 1) + (A_ - 1) * cw - 2 * np.sqrt(A_) * al])
    x = ss.lfilter(bq / aq[0], aq / aq[0], x, axis=0)
tc, st = short_term(x, SR, 3.0)
med = lambda a, b: float(np.median(st[(tc >= a) & (tc <= b)]))
REF = med(112.5, 116.9)                                   # the climax (3 s windows fully inside it)
# section: (measure window) -> wanted level relative to the climax (LU)
W = [float(v) for v in os.environ.get('WANT', '-5.0,-3.0,-3.25,-2.75,-4.0,-14.0').split(',')]
want = dict(intro=(3.5, 18.0, W[0]), theme1=(24.0, 36.0, W[1]), theme2a=(57.0, 72.0, W[2]), theme2b=(78.0, 95.0, W[3]),
            tail=(124.0, 139.0, W[4]), ending=(161.2, 165.6, W[5]))
g = {k: round(w - (med(a, b) - REF), 2) for k, (a, b, w) in want.items()}
# (section levels are measured before the climax presence shelf, so the shelf lifts the climax only)
# climax presence: RBJ high shelf on the climax and its stop tail only (111.842 to the silence before 121.217);
# switched in and out inside near-silence (bar 27's last beat, -56 dB, and the digital silence after the tail)
PRES_F, PRES_DB = float(os.environ.get('PRES_F', '1300')), float(os.environ.get('PRES_DB', '3.5'))
if PRES_DB:
    A_ = 10 ** (PRES_DB / 40); w0 = 2 * np.pi * PRES_F / SR; al = np.sin(w0) / 2 * np.sqrt(2); cw = np.cos(w0)
    bh = np.array([A_ * ((A_ + 1) + (A_ - 1) * cw + 2 * np.sqrt(A_) * al), -2 * A_ * ((A_ - 1) + (A_ + 1) * cw),
                   A_ * ((A_ + 1) + (A_ - 1) * cw - 2 * np.sqrt(A_) * al)])
    ah = np.array([(A_ + 1) - (A_ - 1) * cw + 2 * np.sqrt(A_) * al, 2 * ((A_ - 1) - (A_ + 1) * cw),
                   (A_ + 1) - (A_ - 1) * cw - 2 * np.sqrt(A_) * al])
    a0, a1, b0, b1 = [int(round(v * SR)) for v in (111.30, 111.60, 120.80, 121.10)]
    seg = x[a0 - SR:b1 + SR]
    hs = ss.lfilter(bh / ah[0], ah / ah[0], seg, axis=0)
    w = np.zeros(len(seg)); o = a0 - SR
    w[a0 - o:a1 - o] = 0.5 - 0.5 * np.cos(np.pi * np.arange(a1 - a0) / (a1 - a0)); w[a1 - o:b0 - o] = 1.0
    w[b0 - o:b1 - o] = 0.5 + 0.5 * np.cos(np.pi * np.arange(b1 - b0) / (b1 - b0))
    x = x.copy(); x[a0 - SR:b1 + SR] = seg * (1 - w)[:, None] + hs * w[:, None]
# breakpoints (time, dB), cosine-smoothed in between; all changes on or near bar lines, no steps
bp = [(0.0, g['intro']), (19.85, g['intro']), (22.40, g['theme1']), (37.72, g['theme1']), (52.40, g['theme1']),
      (53.04, g['theme2a'] - 2.0), (55.30, g['theme2a'] - 2.0), (55.58, g['theme2a']),   # lead-in bar 2 dB down, opens into the downbeat
      (57.0, g['theme2a']), (72.0, g['theme2a']), (78.0, g['theme2b']), (96.44, g['theme2b']), (108.0, 0.0),
      (117.6, 0.0), (121.0, g['tail']), (139.97, g['tail']), (142.77, g['tail'] - 5.0), (146.20, g['tail']),
      (159.37, g['tail']), (160.645, g['ending']), (n / SR, g['ending'])]
gdb = np.zeros(n)
for (t0, d0), (t1, d1) in zip(bp[:-1], bp[1:]):
    m = (tt >= t0) & (tt < t1); u = (tt[m] - t0) / max(t1 - t0, 1e-9)
    gdb[m] = d0 + (d1 - d0) * (0.5 - 0.5 * np.cos(np.pi * u))
gdb[tt >= bp[-1][0]] = bp[-1][1]
y = x * (10 ** (gdb / 20))[:, None]
# end: make the release reach exact zero on the last sample (raised cosine over the last 1.84 s, material is ~-60 dB there)
fe = int(round(1.842 * SR)); y[-fe:] *= (0.5 + 0.5 * np.cos(np.pi * (np.arange(fe) + 1) / fe))[:, None]


def ebur(path):
    r = subprocess.run(['ffmpeg', '-hide_banner', '-nostats', '-i', path, '-af', 'ebur128=peak=true', '-f', 'null', '-'],
                       capture_output=True, text=True).stderr
    s = r[r.rfind('Summary:'):]
    return (float(re.search(r'I:\s*([-\d.]+) LUFS', s).group(1)), float(re.search(r'LRA:\s*([-\d.]+) LU', s).group(1)),
            float(re.search(r'Peak:\s*([-\d.]+) dBFS', s).group(1)))


def tp_env(sig, os_=4, chunk=480000, pad=256):
    out = np.empty(len(sig))
    for a in range(0, len(sig), chunk):
        b = min(len(sig), a + chunk); a0 = max(0, a - pad); b0 = min(len(sig), b + pad)
        up = ss.resample_poly(sig[a0:b0], os_, 1, axis=0, window=('kaiser', 10.0))
        e = np.abs(up).max(1)[:(b0 - a0) * os_].reshape(-1, os_).max(1)
        out[a:b] = e[a - a0:a - a0 + (b - a)]
    return out


def limiter(sig, ceil_db, look_ms=5.0, rel_ms=150.0):
    c = 10 ** (ceil_db / 20)
    greq = np.minimum(1.0, c / np.maximum(tp_env(sig), 1e-12))
    L = max(1, int(SR * look_ms / 1000))
    gmin = minimum_filter1d(np.r_[greq, np.ones(L)], size=L, origin=-(L // 2))[:len(greq)]
    gmin = np.minimum(gmin, greq)
    gsm = np.minimum(np.convolve(np.r_[np.ones(L - 1), gmin], np.ones(L) / L, 'valid'), gmin)
    a = np.exp(-1.0 / (SR * rel_ms / 1000)); out = np.ones(len(gsm))
    act = np.flatnonzero(gsm < 1.0)
    if len(act):
        # run the release recursion only where the gain moves (+1.5 s after each active stretch)
        starts = np.r_[act[0], act[1:][np.diff(act) > SR]]; ends = np.r_[act[:-1][np.diff(act) > SR], act[-1]]
        for s0, e0 in zip(starts, ends):
            e1 = min(len(gsm), e0 + int(1.5 * SR)); prev = 1.0
            for i in range(s0, e1):
                v = gsm[i]; prev = v if v < prev else (a * prev + (1 - a) * v); out[i] = prev
    return sig * out[:, None], out


sf.write(f'{work}/auto_48.wav', y, SR, subtype='DOUBLE')
gain_db = TARGET_I - ebur(f'{work}/auto_48.wav')[0]
for it in range(5):
    z, gl = limiter(y * 10 ** (gain_db / 20), CEIL_TP)
    sf.write(f'{work}/pre_dither.wav', z, SR, subtype='DOUBLE')
    I, LRA, TP = ebur(f'{work}/pre_dither.wav')
    print(f'iter {it}: gain {gain_db:+.2f} dB -> I {I:.2f} LUFS, LRA {LRA:.1f}, TP {TP:.2f} dBTP, max GR {20*np.log10(gl.min()):.2f} dB')
    if abs(I - TARGET_I) < 0.05 and TP <= -1.0:
        break
    gain_db += TARGET_I - I
grdb = 20 * np.log10(gl)
runs = []
m1 = grdb < -1.0
if m1.any():
    idx = np.flatnonzero(m1); br = np.flatnonzero(np.diff(idx) > int(0.05 * SR))
    for s0, e0 in zip(np.r_[idx[0], idx[br + 1]], np.r_[idx[br], idx[-1]]):
        runs.append([round(s0 / SR, 3), round((e0 - s0) / SR * 1000, 1), round(float(grdb[s0:e0 + 1].min()), 2)])
print('GR > 1 dB stretches (start s, ms, max dB):', runs)
rng = np.random.default_rng(20261119)
q = 2.0 ** -23
zq = np.clip(np.round((z + (rng.random(z.shape) - rng.random(z.shape)) * q) / q) * q, -1.0, 1.0 - q)
zq[-1] = 0.0
sf.write(outwav, zq, SR, subtype='PCM_24')
json.dump(dict(climax_high_shelf=dict(f_hz=PRES_F, gain_db=PRES_DB, span='111.30-111.60 in, 120.80-121.10 out (both near-silent)'), low_shelf=dict(f_hz=SHELF_F, gain_db=SHELF_DB, type='RBJ low shelf, S=1, single pass'), want_rel_lu=want, ref_climax_S=REF, section_gain_db=g, automation_db=bp, norm_gain_db=gain_db, ceiling_dbtp=CEIL_TP,
               limiter_max_gr_db=float(20 * np.log10(gl.min())), limited_seconds=float((gl < 0.9999).sum() / SR),
               over_1db_seconds=float((gl < 10 ** (-1 / 20)).sum() / SR), over_2db_seconds=float((gl < 10 ** (-2 / 20)).sum() / SR), gr_over_1db_runs=runs),
          open(f'{work}/master_meta.json', 'w'), indent=1)
print('section gains', g, 'REF', round(REF, 2))
print('wrote', outwav)
