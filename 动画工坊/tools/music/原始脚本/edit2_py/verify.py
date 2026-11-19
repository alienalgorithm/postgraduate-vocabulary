#!/usr/bin/env python3
"""Whole-file and per-seam verification of the mastered score.
usage: python3 verify.py score.wav work_dir out_json
- seams: seams.check() on the pre-master divided by its macro gain (so the references line up), every junction
- whole file (on the 24-bit master): clipped samples, DC, sample-jump scan and 2-ms HF click scan against the same
  scans of the source (same statistic, same thresholds), silence scan (500-ms windows below -60 dBFS), loudness via
  ffmpeg ebur128, grid check (repeated source bars must line up with lag 0 in the output)"""
import sys, os, json, subprocess, re, numpy as np, soundfile as sf, scipy.signal as ss
from lib import *
from seams import check
from master import ebur, tp_env

score, work, out = sys.argv[1:4]
z, sr = sf.read(score, dtype='float64'); assert sr == SR
info = json.load(open(os.path.join(work, 'edit_info.json')))
meta = json.load(open(os.path.join(work, 'master_meta.json')))
pre, _ = sf.read(os.path.join(work, 'pre_master.wav'), dtype='float64')
gm = np.load(os.path.join(work, 'macro_gain_db.npy')).astype(np.float64)
R = {}

# ---- seams on the pre-master with the macro automation divided out (segment gains stay, seams.check knows them)
y = pre / (10 ** (gm / 20))[:, None]
rows, bad = check(y, info)
R['seams'] = rows; R['seams_failing'] = bad

# ---- whole-file scans
X = src()
R['clipped_samples'] = int((np.abs(z) >= 0.9999).sum())
R['sample_peak_dbfs'] = round(float(20 * np.log10(np.abs(z).max())), 3)
R['dc'] = [round(float(v), 7) for v in z.mean(0)]
I, LRA, TP = ebur(score); R['ebur128'] = dict(I=I, LRA=LRA, TP=TP)
R['true_peak_own_dbtp'] = round(float(20 * np.log10(tp_env(z).max())), 3)


def step_ratio(sig, blk=0.01):
    """per 10-ms block: max |sample step| / block RMS (a click is a large step relative to the local level)."""
    m = sig.mean(1); n = int(blk * SR); nb = len(m) // n
    d = np.abs(np.diff(m, prepend=m[0]))[:nb * n].reshape(nb, n).max(1)
    r = np.sqrt((m[:nb * n].reshape(nb, n) ** 2).mean(1)) + 1e-9
    return d / r, r


def hf_spikes(sig, frame=0.002):
    m = sig.mean(1)
    h = ss.sosfilt(ss.butter(6, 6000, 'high', fs=SR, output='sos'), m)
    n = int(frame * SR); nb = len(h) // n
    e = 10 * np.log10((h[:nb * n].reshape(nb, n) ** 2).mean(1) + 1e-20)
    med = ss.medfilt(e, 251)                                # +-0.25 s running median
    return e - med, e


sr_z, rz = step_ratio(z); sr_x, rx = step_ratio(X)
ok_z = rz > 10 ** (-50 / 20); ok_x = rx > 10 ** (-50 / 20)
R['step_ratio_max'] = dict(edit=round(float(sr_z[ok_z].max()), 3), source=round(float(sr_x[ok_x].max()), 3),
                           edit_p999=round(float(np.percentile(sr_z[ok_z], 99.9)), 3), source_p999=round(float(np.percentile(sr_x[ok_x], 99.9)), 3))
hz, ez = hf_spikes(z); hx, ex = hf_spikes(X)
loud_z = ez > -100; loud_x = ex > -100
thr = float(hx[loud_x].max())
R['hf_spike_db'] = dict(edit_max=round(float(hz[loud_z].max()), 2), source_max=round(thr, 2),
                        edit_over_source_max=[round(i * 0.002, 3) for i in np.where((hz > thr) & loud_z)[0]][:20])
# silence: 500-ms windows (hop 100 ms) below -60 dBFS RMS
m = (z ** 2).mean(1); c = np.cumsum(np.r_[0, m]); w = SR // 2; hop = SR // 10
sil = []
for i in range(0, len(m) - w, hop):
    v = (c[i + w] - c[i]) / w
    if 10 * np.log10(v + 1e-20) < -60: sil.append(i / SR)
R['silent_windows'] = dict(count=len(sil), first=round(sil[0], 2) if sil else None, last=round(sil[-1], 2) if sil else None,
                           note='500-ms windows below -60 dBFS RMS (expected only inside the final fade)')
# grid: output bars that carry the same source bar must line up with lag 0
bars = info['bars']
pairs = []
by_src = {}
for i, b in enumerate(bars):
    if isinstance(b['src_bar'], int): by_src.setdefault(b['src_bar'], []).append(i)
for sb_, idx in by_src.items():
    if len(idx) < 2: continue
    a, b2 = idx[0], idx[1]
    ta, tb = bars[a]['true_start'], bars[b2]['true_start']
    if ta < 0.1: continue
    L = int(0.6 * SR); A_ = z[int(ta * SR) + 4800: int(ta * SR) + 4800 + L].mean(1); B_ = z[int(tb * SR) + 4800 - 480: int(tb * SR) + 4800 + L + 480].mean(1)
    cc = ss.correlate(B_, A_, 'valid'); k = int(np.argmax(cc)) - 480
    pairs.append(dict(src_bar=sb_, out=[round(ta, 3), round(tb, 3)], lag_ms=round(k / 48, 2),
                      corr=round(float(cc.max() / (np.linalg.norm(A_) * np.linalg.norm(B_[480 + k:480 + k + L]) + 1e-12)), 3)))
R['grid_repeats'] = pairs
R['meta'] = meta
json.dump(R, open(out, 'w'), indent=1)
print(json.dumps({k: v for k, v in R.items() if k not in ('seams', 'meta', 'grid_repeats')}, indent=1))
print('grid repeats (lag ms, corr):', [(p['src_bar'], p['lag_ms'], p['corr']) for p in pairs])
