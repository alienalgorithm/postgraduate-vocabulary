# Shared helpers for the Cornfield Chase edit (A/music/edit2).
import os, json, numpy as np, soundfile as sf, scipy.signal as ss

HERE = os.path.dirname(os.path.abspath(__file__))
E2 = os.path.dirname(HERE)                 # A/music/edit2
MUS = os.path.dirname(E2)                  # A/music
A = os.path.dirname(MUS)
SR = 48000
BEAT = 0.625
BAR = 1.875
MAP = json.load(open(os.path.join(MUS, 'cc_map.json')))
BARS = {b['n']: b for b in MAP['bars']}    # 1..65 (65 = stop line)
STOP = 119.342


def bt(n):
    """source time of bar line n (bar 1 line = -0.033 s, treated as 0 when it is the very first sample)."""
    return BARS[n]['start']


def bs(n):
    return int(round(bt(n) * SR))


def nbeats(n):
    return BARS[n]['beats']


_SRC = None


def src():
    global _SRC
    if _SRC is None:
        x, sr = sf.read(os.path.join(E2, 'wav', 'src48.wav'), dtype='float64')
        assert sr == SR
        _SRC = x
    return _SRC


# ---------------- K-weighted loudness (BS.1770) ----------------
def kweight(x, sr=SR):
    # stage 1 shelf, stage 2 high-pass (coefficients from BS.1770-4 for 48 kHz)
    b1 = [1.53512485958697, -2.69169618940638, 1.19839281085285]
    a1 = [1.0, -1.69065929318241, 0.73248077421585]
    b2 = [1.0, -2.0, 1.0]
    a2 = [1.0, -1.99004745483398, 0.99007225036621]
    y = ss.lfilter(b1, a1, x, axis=0)
    return ss.lfilter(b2, a2, y, axis=0)


def loud_curve(x, win=0.4, hop=0.05, sr=SR):
    """momentary (win=0.4) or short-term (win=3) loudness in LUFS, frames centred at t."""
    k = kweight(x, sr)
    p = (k ** 2).sum(1)
    n = int(win * sr); h = int(hop * sr)
    c = np.cumsum(np.r_[0, p])
    t = np.arange(0, len(p) / sr, hop)
    out = np.full(len(t), -120.0)
    for i, tc in enumerate(t):
        a = int(tc * sr) - n // 2; b = a + n
        a = max(a, 0); b = min(b, len(p))
        if b - a > n // 4:
            out[i] = -0.691 + 10 * np.log10((c[b] - c[a]) / (b - a) + 1e-20)
    return t, out


def integrated(x, sr=SR):
    k = kweight(x, sr); p = (k ** 2).sum(1)
    n = int(0.4 * sr); h = int(0.1 * sr)
    c = np.cumsum(np.r_[0, p])
    zs = np.array([(c[i + n] - c[i]) / n for i in range(0, len(p) - n, h)])
    l = -0.691 + 10 * np.log10(zs + 1e-20)
    g = zs[l > -70]
    rel = -0.691 + 10 * np.log10(g.mean()) - 10
    g2 = zs[(l > -70) & (l > rel)]
    return -0.691 + 10 * np.log10(g2.mean())


# ---------------- spectra ----------------
def mel_fb(n_fft=4096, n_mels=64, fmin=40, fmax=16000, sr=SR):
    def hz2mel(f): return 2595 * np.log10(1 + f / 700)
    def mel2hz(m): return 700 * (10 ** (m / 2595) - 1)
    m = np.linspace(hz2mel(fmin), hz2mel(fmax), n_mels + 2)
    f = mel2hz(m)
    bins = np.fft.rfftfreq(n_fft, 1 / sr)
    fb = np.zeros((n_mels, len(bins)))
    for i in range(n_mels):
        l, c, r = f[i], f[i + 1], f[i + 2]
        fb[i] = np.clip(np.minimum((bins - l) / (c - l), (r - bins) / (r - c)), 0, None)
    return fb


_FB = None


def logmel(x, t0, t1, n_fft=4096, hop=1024):
    """mean log-mel spectrum (dB) of mono mix between t0 and t1 (s)."""
    global _FB
    if _FB is None: _FB = mel_fb(n_fft)
    m = x.mean(1) if x.ndim == 2 else x
    a = max(0, int(t0 * SR)); b = min(len(m), int(t1 * SR))
    seg = m[a:b]
    if len(seg) < n_fft: seg = np.r_[seg, np.zeros(n_fft - len(seg))]
    w = np.hanning(n_fft)
    fr = [np.abs(np.fft.rfft(seg[i:i + n_fft] * w)) ** 2 for i in range(0, len(seg) - n_fft + 1, hop)]
    P = np.mean(fr, 0)
    return 10 * np.log10(_FB @ P + 1e-12)


def logmel_frames(x, t0, t1, n_fft=2048, hop=480):
    global _FB2
    try: _FB2
    except NameError: _FB2 = None
    if _FB2 is None: _FB2 = mel_fb(n_fft)
    m = x.mean(1) if x.ndim == 2 else x
    a = max(0, int(t0 * SR)); b = min(len(m), int(t1 * SR))
    seg = m[a:b]; w = np.hanning(n_fft)
    F = np.array([np.abs(np.fft.rfft(seg[i:i + n_fft] * w)) ** 2 for i in range(0, len(seg) - n_fft + 1, hop)])
    return 10 * np.log10(F @ _FB2.T + 1e-12), (a + np.arange(len(F)) * hop + n_fft // 2) / SR


def rms_db(x, t0, t1):
    a = max(0, int(t0 * SR)); b = min(len(x), int(t1 * SR))
    s = x[a:b]
    return 10 * np.log10((s ** 2).mean() + 1e-20)


def env_db(x, win=0.010, hop=0.001):
    m = (x ** 2).mean(1) if x.ndim == 2 else x ** 2
    n = int(win * SR); w = np.hanning(n); w /= w.sum()
    e = ss.fftconvolve(m, w, 'same')[::int(hop * SR)]
    return 10 * np.log10(np.maximum(e, 0) + 1e-14)
