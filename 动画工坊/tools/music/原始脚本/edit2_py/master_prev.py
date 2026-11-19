#!/usr/bin/env python3
"""Render the edit from spec, apply the macro gain automation, normalise to -14 LUFS, true-peak limit, dither to
24-bit and write A/music/score.wav.
usage: python3 master.py spec.json out.wav work_dir
Writes work_dir/edit_info.json (bars, junctions, gains) and work_dir/master_meta.json."""
import sys, os, json, subprocess, re, numpy as np, soundfile as sf, scipy.signal as ss
from scipy.ndimage import minimum_filter1d
from lib import *
from render import render

TARGET_I = -14.0
CEIL = -1.2          # limiter ceiling in dBTP (4x oversampled detector); measured result must be <= -1.0


def macro_curve(n, pts):
    t = np.arange(n) / SR
    pts = sorted(pts)
    g = np.full(n, pts[-1][1], float)
    g[t < pts[0][0]] = pts[0][1]
    for (t0, d0), (t1, d1) in zip(pts[:-1], pts[1:]):
        m = (t >= t0) & (t < t1)
        u = (t[m] - t0) / max(t1 - t0, 1e-9)
        g[m] = d0 + (d1 - d0) * (0.5 - 0.5 * np.cos(np.pi * u))
    return g


def tp_env(sig, os_=4):
    up = ss.resample_poly(sig, os_, 1, axis=0, window=('kaiser', 10.0))
    a = np.abs(up).max(1)
    return a[:len(sig) * os_].reshape(-1, os_).max(1)


def limiter(sig, ceil_db, look_ms=4.0, rel_ms=100.0):
    c = 10 ** (ceil_db / 20)
    env = tp_env(sig)
    greq = np.minimum(1.0, c / np.maximum(env, 1e-12))
    L = max(1, int(SR * look_ms / 1000))
    gmin = minimum_filter1d(np.r_[greq, np.ones(L)], size=2 * L + 1)[:len(greq)]
    w = np.hanning(2 * L + 3)[1:-1]; w /= w.sum()
    gs = np.convolve(np.r_[np.ones(L), gmin, np.ones(L)], w, 'valid')[:len(greq)]
    gs = np.minimum(gs, gmin)
    gs = np.minimum(gs, greq)
    # release: one-pole recovery toward 1 (only where gain rises)
    a = np.exp(-1.0 / (SR * rel_ms / 1000))
    idx = np.where(gs < 0.99999)[0]
    out = np.ones_like(gs)
    if len(idx):
        lo = max(0, idx[0] - 1); hi = min(len(gs), idx[-1] + int(SR * rel_ms / 1000 * 8))
        prev = 1.0
        seg = gs[lo:hi]; o = np.empty_like(seg)
        for i in range(len(seg)):
            v = seg[i]
            prev = v if v < prev else a * prev + (1 - a) * v
            o[i] = prev
        out[lo:hi] = o
    return sig * out[:, None], out


def ebur(path):
    r = subprocess.run(['ffmpeg', '-hide_banner', '-nostats', '-i', path, '-af', 'ebur128=peak=true', '-f', 'null', '-'],
                       capture_output=True, text=True).stderr
    s = r[r.rfind('Summary:'):]
    I = float(re.search(r'I:\s*([-\d.]+) LUFS', s).group(1))
    LRA = float(re.search(r'LRA:\s*([-\d.]+) LU', s).group(1))
    TP = float(re.search(r'Peak:\s*([-\d.]+) dBFS', s).group(1))
    return I, LRA, TP


def main(spec_path, out_wav, work):
    spec = json.load(open(spec_path))
    y, info = render(spec)
    n = len(y)
    g_macro = macro_curve(n, spec.get('macro_db', [[0, 0]]))
    y = y * (10 ** (g_macro / 20))[:, None]
    sf.write(os.path.join(work, 'pre_master.wav'), y.astype(np.float32), SR, subtype='FLOAT')
    gain = TARGET_I - integrated(y)
    for it in range(6):
        z, g = limiter(y * 10 ** (gain / 20), CEIL)
        I = integrated(z)
        tp = 20 * np.log10(tp_env(z).max())
        print(f'iter {it}: gain {gain:+.3f} dB -> I {I:.3f} LUFS, TP {tp:.2f} dBTP, max GR {20*np.log10(g.min()):.2f} dB, '
              f'limited {(g < 0.9999).sum()} samples ({(g < 0.9999).sum()/SR:.2f} s)')
        if abs(I - TARGET_I) < 0.02: break
        gain += TARGET_I - I
    rng = np.random.default_rng(20261119)
    q = 2.0 ** -23
    d = (rng.random(z.shape) - rng.random(z.shape)) * q
    zq = np.clip(np.round((z + d) / q) * q, -1.0, 1.0 - q)
    sf.write(out_wav, zq, SR, subtype='PCM_24')
    I, LRA, TP = ebur(out_wav)
    print(f'ffmpeg ebur128 on {out_wav}: I {I} LUFS, LRA {LRA} LU, true peak {TP} dBTP')
    info['spec'] = spec
    info['norm_gain_db'] = gain
    json.dump(info, open(os.path.join(work, 'edit_info.json'), 'w'), indent=1)
    gr = 20 * np.log10(g)
    meta = dict(target_lufs=TARGET_I, limiter_ceiling_dbtp=CEIL, norm_gain_db=round(gain, 3), macro_db=spec.get('macro_db'),
                limiter_max_gr_db=round(float(gr.min()), 3), limited_seconds=round(float((g < 0.9999).sum() / SR), 3),
                limited_over_0p5db_seconds=round(float((gr < -0.5).sum() / SR), 3),
                ffmpeg=dict(I=I, LRA=LRA, TP=TP), integrated_own=round(integrated(zq), 3),
                sample_peak_dbfs=round(float(20 * np.log10(np.abs(zq).max())), 3), samples=int(n), total_s=n / SR)
    json.dump(meta, open(os.path.join(work, 'master_meta.json'), 'w'), indent=1)
    np.save(os.path.join(work, 'limiter_gain.npy'), g.astype(np.float32))
    np.save(os.path.join(work, 'macro_gain_db.npy'), g_macro.astype(np.float32))
    print(json.dumps(meta, indent=1))


if __name__ == '__main__':
    main(*sys.argv[1:4])
