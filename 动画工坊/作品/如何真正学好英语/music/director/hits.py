# attack detector used for energy.json hits/kicks (QA 2026-11-19: replaces the per-half-beat detector, whose
# 5 ms low-band envelope triggered on waveform ripple and pad gating, so its hits were spread evenly across the
# beat instead of sitting on the music. This one only looks at the 16th-note grid of the exact 94 BPM edit and
# keeps an attack only when it stands out from the same band over the surrounding two bars.)
import numpy as np, scipy.signal as ss

def _env_db(mono, sr, lo, hi, win):
    sos = ss.butter(4, [lo, hi], 'band', fs=sr, output='sos')
    x = ss.sosfiltfilt(sos, mono)
    n = int(win * sr); w = np.hanning(n); w /= w.sum()
    p = ss.fftconvolve(x ** 2, w, 'same')[::sr // 1000]          # 1 ms hop
    return 10 * np.log10(np.maximum(p, 0) + 1e-14)

BANDS = (  # name, lo, hi, smoothing window, min rise dB, min prominence dB, power weight
    ('low', 30, 150, 0.040, 4.0, 2.5, 1.0),
    ('full', 40, 16000, 0.015, 3.0, 2.5, 1.0),
    ('hf', 2000, 15000, 0.008, 6.0, 4.0, 4.0),
)

def select_hits_grid(mono, sr, grid, drop_t, ctx_n=32):
    """Grid-locked attack detector. grid = 16th-note times (s). For every grid point and band: rise = peak level in
    [g-10, g+80] ms minus mean level in [g-70, g-15] ms; prominence = rise minus the median rise of the same band
    over the surrounding +-ctx_n grid points (so steady gating, tremolo and envelope ripple do not count as hits).
    Returns list of (t, strength, band) with t = half-rise point (dB) of the winning band."""
    envs = {b[0]: _env_db(mono, sr, b[1], b[2], b[3]) for b in BANDS}
    G = np.asarray(grid); n = len(next(iter(envs.values())))
    G = G[(G * 1000 > 130) & (G * 1000 < n - 130)]
    feats = {}
    for name, lo, hi, win, rmin, pmin, wgt in BANDS:
        e = envs[name]; lin = 10 ** (e / 10)
        pre = np.array([10 * np.log10(lin[int(g * 1000) - 70:int(g * 1000) - 15].mean()) for g in G])
        pki = np.array([int(g * 1000) - 10 + int(np.argmax(e[int(g * 1000) - 10:int(g * 1000) + 80])) for g in G])
        post = e[pki]; rise = post - pre
        ctx = np.array([np.median(np.r_[rise[max(0, i - ctx_n):i], rise[i + 1:i + 1 + ctx_n]]) for i in range(len(G))])
        prom = rise - ctx
        jump = (10 ** (post / 10) - 10 ** (pre / 10)) * wgt
        ok = (rise >= rmin) & (prom >= pmin)
        feats[name] = dict(pre=pre, post=post, pki=pki, rise=rise, prom=prom, jump=jump, ok=ok)
    alljumps = np.concatenate([f['jump'][f['ok']] for f in feats.values()])
    far = np.concatenate([np.abs(G[f['ok']] - drop_t) > 0.15 for f in feats.values()])
    ref = np.percentile(alljumps[far], 99) if far.any() else 1.0
    out = []
    sbest = np.zeros(len(G))
    for name, *_ in BANDS:
        f = feats[name]
        sb = np.where(f['ok'], np.minimum(0.95, (np.maximum(f['jump'], 0) / ref) ** (1 / 3) * np.minimum(1.0, f['prom'] / 6.0)), 0)
        sbest = np.maximum(sbest, sb)
    for i, g in enumerate(G):
        if sbest[i] < sbest[max(0, i - 2):i + 3].max():
            continue
        if abs(g - drop_t) < 0.15:
            continue
        best = None
        for name, *_ in BANDS:
            f = feats[name]
            if not f['ok'][i]:
                continue
            s = min(0.95, (max(f['jump'][i], 0) / ref) ** (1 / 3) * min(1.0, f['prom'][i] / 6.0))
            if best is None or s > best[1]:
                best = (name, s)
        if best is None:
            continue
        name, s = best; f = feats[name]; e = envs[name]
        p = f['pki'][i]; a0 = int(g * 1000) - 40
        seg = e[a0:p + 1]; m = a0 + int(np.argmin(seg))
        half = f['post'][i] - 0.5 * (f['post'][i] - e[m])
        j = np.where(e[m:p + 1] >= half)[0]
        t = (m + (j[0] if len(j) else p - m)) / 1000.0
        out.append((round(t, 3), round(float(s), 3), name, round(float(g), 4)))
    out.append((round(drop_t, 4), 1.0, 'low', round(float(drop_t), 4)))
    return sorted(out)
