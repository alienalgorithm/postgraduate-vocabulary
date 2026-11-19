# Low-end mono fix + mix automation + resample to 48 kHz + loudness normalize (-14 LUFS) + true-peak limit (-1.2 dBTP)
# + TPDF dither -> 24-bit WAV.
# usage: python3 -I master.py <edit_441.npy> <edit_meta.json> <workdir> <out.wav>
import sys, json, subprocess, re
import numpy as np
import scipy.signal as ss
import soundfile as sf

edit, meta, work, outwav = sys.argv[1], json.load(open(sys.argv[2])), sys.argv[3], sys.argv[4]
SR0, SR = 44100, 48000
BAR, LEAD = meta['bar'], meta['lead']
TARGET_I, CEIL_TP = -14.0, -1.2
E = lambda k: LEAD + k * BAR           # output time of edit bar k (exact up to bar 78)

y = np.load(edit)
n = len(y)
tt = np.arange(n) / SR0

# --- low-end mono fix (QA 2026-11-19) ----------------------------------------------------------
# The source mix carries its sub/bass pad in anti-phase between the channels (below ~200 Hz,
# R ~= -1.3 x L; L/R correlation -0.98 in the intro and the afterglow). Summed to mono (one phone or
# Bluetooth speaker, a TV, laptop speakers in the room) that low end cancels: the intro lost 7.7 dB
# and the afterglow 10.4 dB. Fix: zero-phase split at LOW_FC, the band below becomes one mono signal
# ALPHA*L - BETA*R (in-phase content kept at unity, the anti-phase element folded in at its average
# L/R power), the band above is untouched (split is exactly complementary: high = x - low).
LOW_FC, R_ANTI = 200.0, 1.30
BETA = (np.sqrt((1 + R_ANTI ** 2) / 2) - 1) / (1 + R_ANTI)   # a-coefficient ALPHA + BETA*R_ANTI = rms(1, R_ANTI)
ALPHA = 1 + BETA                                               # b-coefficient ALPHA - BETA = 1
_low = ss.sosfiltfilt(ss.butter(4, LOW_FC, 'low', fs=SR0, output='sos'), y, axis=0)
y = (y - _low) + (ALPHA * _low[:, 0] - BETA * _low[:, 1])[:, None]
del _low

# --- macro dynamics (dB), breakpoints on bar lines, cosine-smoothed between them --------------
# intro hushed (s01-s02), theme 1 a little below (s03-s04), breath lifts, theme 2 rises (s05-s06),
# breakdown/climax/resolution/ending untouched (0 dB) so the drop is the loudest moment.
bp = [(0.0, -5.0), (E(10), -5.0), (E(12), -4.0), (E(26), -3.4), (E(28), -2.8), (E(41), -1.8),
      (E(44), 0.0), (E(76.5), 0.0), (E(77.5), 3.0), (n / SR0, 3.0)]
g_db = np.zeros(n)
for (t0, d0), (t1, d1) in zip(bp[:-1], bp[1:]):
    m = (tt >= t0) & (tt < t1)
    u = (tt[m] - t0) / max(t1 - t0, 1e-9)
    g_db[m] = d0 + (d1 - d0) * (0.5 - 0.5 * np.cos(np.pi * u))
g_db[tt >= bp[-1][0]] = bp[-1][1]
y = y * (10 ** (g_db / 20))[:, None]
sf.write(f'{work}/auto_441.wav', y, SR0, subtype='DOUBLE')

# --- resample with soxr (very high quality) -----------------------------------------------------
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', f'{work}/auto_441.wav', '-af',
                'aresample=48000:resampler=soxr:precision=33:dither_method=0', '-c:a', 'pcm_f64le',
                f'{work}/auto_48.wav'], check=True)
x, sr = sf.read(f'{work}/auto_48.wav', dtype='float64')
assert sr == SR


def ebur(path):
    r = subprocess.run(['ffmpeg', '-hide_banner', '-nostats', '-i', path, '-af', 'ebur128=peak=true', '-f', 'null', '-'],
                       capture_output=True, text=True).stderr
    s = r[r.rfind('Summary:'):]
    I = float(re.search(r'I:\s*([-\d.]+) LUFS', s).group(1))
    LRA = float(re.search(r'LRA:\s*([-\d.]+) LU', s).group(1))
    TP = float(re.search(r'Peak:\s*([-\d.]+) dBFS', s).group(1))
    return I, LRA, TP


def true_peak_env(sig, os_=4):
    up = ss.resample_poly(sig, os_, 1, axis=0, window=('kaiser', 10.0))
    a = np.abs(up).max(1)
    a = a[:len(sig) * os_].reshape(-1, os_).max(1)
    return a


def limiter(sig, ceil_db, look_ms=2.0, rel_ms=120.0):
    c = 10 ** (ceil_db / 20)
    env = true_peak_env(sig)
    greq = np.minimum(1.0, c / np.maximum(env, 1e-12))
    L = max(1, int(SR * look_ms / 1000))
    # forward-looking minimum over L samples, then L-sample moving average (gain is down by the peak)
    pad = np.r_[greq, np.ones(L)]
    from scipy.ndimage import minimum_filter1d
    gmin = minimum_filter1d(pad, size=L, origin=-(L // 2))[:len(greq)]
    gmin = np.minimum(gmin, greq)
    gsm = np.convolve(np.r_[np.ones(L - 1), gmin], np.ones(L) / L, 'valid')
    gsm = np.minimum(gsm, gmin)
    # release: one-pole recovery toward 1
    a = np.exp(-1.0 / (SR * rel_ms / 1000))
    g = gsm.copy()
    from scipy.signal import lfilter
    # recursive max(g_target, smoothed) implemented in chunks via python loop on reduced set
    out = np.empty_like(g); prev = 1.0
    for i in range(len(g)):
        v = g[i]
        prev = v if v < prev else (a * prev + (1 - a) * v)
        out[i] = prev
    return sig * out[:, None], out


gain_db = TARGET_I - ebur(f'{work}/auto_48.wav')[0]
for it in range(4):
    z = x * 10 ** (gain_db / 20)
    z, g = limiter(z, CEIL_TP)
    sf.write(f'{work}/pre_dither.wav', z, SR, subtype='DOUBLE')
    I, LRA, TP = ebur(f'{work}/pre_dither.wav')
    gr = 20 * np.log10(g.min())
    print(f'iter {it}: gain {gain_db:+.2f} dB -> I {I:.2f} LUFS, LRA {LRA:.1f}, TP {TP:.2f} dBTP, max GR {gr:.2f} dB, '
          f'samples limited {(g < 0.9999).sum()}')
    if abs(I - TARGET_I) < 0.05 and TP <= -1.0:
        break
    gain_db += TARGET_I - I

# --- TPDF dither to 24 bit ----------------------------------------------------------------------
rng = np.random.default_rng(20261119)
q = 2.0 ** -23
d = (rng.random(z.shape) - rng.random(z.shape)) * q
zq = np.round((z + d) / q) * q
zq = np.clip(zq, -1.0, 1.0 - q)
sf.write(outwav, zq, SR, subtype='PCM_24')
json.dump(dict(low_mono_fc_hz=LOW_FC, low_mono_alpha=ALPHA, low_mono_beta=BETA, automation_db=bp, gain_db=gain_db, ceiling_dbtp=CEIL_TP, limiter_max_gr_db=float(20 * np.log10(g.min())),
               limited_samples=int((g < 0.9999).sum())), open(f'{work}/master_meta.json', 'w'), indent=1)
print('wrote', outwav)
