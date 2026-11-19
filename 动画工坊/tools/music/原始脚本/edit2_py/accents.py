import numpy as np, scipy.signal as ss
from lib import *
def flux_env(z, lo=40, hi=12000):
    m = z.mean(1)
    f, tt, Z = ss.stft(m, SR, nperseg=2048, noverlap=2048 - 48, boundary=None, padded=False)
    sel = (f >= lo) & (f <= hi)
    # band-weighted log-magnitude flux (mel-like weighting by 1/sqrt(f) to keep lows audible)
    L = np.log(np.abs(Z[sel]) + 1e-5)
    d = np.maximum(np.diff(L, axis=1), 0)
    w = 1 / np.sqrt(f[sel] / 100 + 1)
    e = (d * w[:, None]).sum(0) / w.sum()
    t = tt[1:]
    return t, e
def grid16(bars_info, total):
    g = []
    for i, b in enumerate(bars_info):
        t0 = b['true_start']; nb = b['beats']
        for q in range(nb * 4):
            tq = t0 + q * BEAT / 4
            if 0.05 < tq < total - 0.1: g.append((tq, q))
    return g
def accents(z, bars_info, total):
    t, e = flux_env(z)
    G = grid16(bars_info, total)
    val = []
    for tq, q in G:
        a = np.searchsorted(t, tq - 0.015); b = np.searchsorted(t, tq + 0.06)
        p0 = np.searchsorted(t, tq - 0.08); p1 = np.searchsorted(t, tq - 0.02)
        pk = e[a:b].max(); pre = np.median(e[p0:p1]) if p1 > p0 else 0
        val.append((tq, q, pk - pre, t[a + int(np.argmax(e[a:b]))]))
    v = np.array([x[2] for x in val])
    out = []
    for i, (tq, q, s, tp) in enumerate(val):
        ctx = np.r_[v[max(0, i - 24):i], v[i + 1:i + 25]]
        prom = s - np.median(ctx)
        out.append((tq, q, s, prom, tp))
    return out
