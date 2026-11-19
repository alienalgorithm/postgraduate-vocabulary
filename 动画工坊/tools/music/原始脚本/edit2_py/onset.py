import numpy as np, scipy.signal as ss
from lib import *
HOP = 48   # 1 ms
def flux(sig, t0, t1, lo=200, hi=10000):
    a = max(0, int(t0 * SR) - 1024); b = min(len(sig), int(t1 * SR) + 1024)
    m = sig[a:b].mean(1)
    f, tt, Z = ss.stft(m, SR, nperseg=1024, noverlap=1024 - HOP, boundary=None, padded=False)
    sel = (f >= lo) & (f <= hi)
    L = np.log(np.abs(Z[sel]) + 1e-6)
    d = np.maximum(np.diff(L, axis=1), 0).sum(0)
    t = a / SR + tt[1:]
    keep = (t >= t0) & (t < t1)
    return t[keep], d[keep]
def lag(sig1, t1, sig2, t2, dur=1.875, maxlag=0.03):
    """lag (s) of sig2 at t2 relative to sig1 at t1: positive = events in sig2 come later relative to its bar line."""
    _, a = flux(sig1, t1 - maxlag, t1 + dur + maxlag)
    _, b = flux(sig2, t2 - maxlag, t2 + dur + maxlag)
    n = min(len(a), len(b)); a = a[:n] - a[:n].mean(); b = b[:n] - b[:n].mean()
    L = int(maxlag * 1000)
    c = [np.dot(a[L:n - L], b[L + k:n - L + k]) for k in range(-L, L + 1)]
    c = np.array(c) / (np.linalg.norm(a[L:n - L]) * np.linalg.norm(b[L:n - L]) + 1e-12)
    k = int(np.argmax(c))
    return (k - L) / 1000.0, float(c[k]), float(c[L])
