#!/usr/bin/env python3
"""Spectrogram crops around junctions: row 1 = the edit around T, row 2 = original around the out line si (what
would have continued), row 3 = original around the in line sj (what the in side grew out of). Same colour scale.
usage: python3 specimg.py edit.wav edit.json out_prefix [half_s] [k1,k2,...]"""
import sys, json, numpy as np, soundfile as sf, scipy.signal as ss
import matplotlib; matplotlib.use('Agg')
import matplotlib.pyplot as plt
from lib import *

X = src()


def spec(sig, t0, t1):
    a = max(0, int(t0 * SR)); b = min(len(sig), int(t1 * SR))
    m = sig[a:b].mean(1)
    pad0 = max(0, -int(t0 * SR)); m = np.r_[np.zeros(pad0), m]
    f, t, Z = ss.stft(m, SR, nperseg=4096, noverlap=4096 - 240)
    P = 20 * np.log10(np.abs(Z) + 1e-7)
    # log-frequency resample 40 Hz .. 16 kHz, 160 rows
    fl = np.geomspace(40, 16000, 160)
    idx = np.searchsorted(f, fl)
    return t + t0, fl, P[idx]


def rms(sig, t0, t1, win=0.02, hop=0.005):
    ts = t0 + np.arange(int((t1 - t0) / hop)) * hop
    out = []
    for t in ts:
        a = int((t - win / 2) * SR); b = int((t + win / 2) * SR)
        s = sig[max(a, 0):max(b, 1)]
        out.append(10 * np.log10((s ** 2).mean() + 1e-20) if len(s) else -100)
    return ts, np.array(out)


GM = None; NORM = 0.0


def plot(y, info, k, path, half=3.0):
    j = info['junctions'][k - 1]
    T = j['t']; si = j['src_out']; sj = j['src_in']
    gT = (GM[int(T * SR)] if GM is not None else 0.0) + NORM
    g_out = 10 ** ((info['place'][k - 1]['gain_db'] + gT) / 20); g_in = 10 ** ((info['place'][k]['gain_db'] + gT) / 20)
    Xo = X * g_out; Xi = X * g_in
    rows = [('edit  J%d %s  out %.3f s' % (k, f"{j['out_bar']}->{j['in_bar']}", T), y, T)]
    if not j.get('tail_bars'):
        rows.append(('original at out line (bar %s, %.3f s), same gain' % (j['out_bar'], si), Xo, si))
    else:
        rows.append(('original: the tail 2 bars after the stop (%.3f s), same gain' % (si + 2 * BAR), Xo, si + 2 * BAR))
    rows.append(('original at in line (bar %s, %.3f s), same gain' % (j['in_bar'], sj), Xi, sj))
    fig, axs = plt.subplots(len(rows), 1, figsize=(13, 3.0 * len(rows)), sharex=True)
    for ax, (title, sig, c) in zip(axs, rows):
        t, fl, P = spec(sig, c - half, c + half)
        ax.pcolormesh(t - c, fl, P, shading='auto', cmap='magma', vmin=-110, vmax=-20)
        ax.set_yscale('log'); ax.set_ylim(40, 16000); ax.set_title(title, fontsize=10)
        ax.axvline(0, color='c', lw=0.8, ls='--')
        if sig is y:
            ax.axvspan(j['xf_start'] - T, j['xf_end'] - T, color='c', alpha=0.12)
        for q in range(-6, 7):
            ax.axvline(q * BEAT, color='w', lw=0.3, alpha=0.4)
        ts, r = rms(sig, c - half, c + half)
        ax2 = ax.twinx(); ax2.plot(ts - c, r, color='lime', lw=0.8); ax2.set_ylim(-70, 0); ax2.set_ylabel('RMS dB', fontsize=7)
    axs[-1].set_xlabel('seconds from the bar line (white = beats)')
    fig.tight_layout(); fig.savefig(path, dpi=70); plt.close(fig)


if __name__ == '__main__':
    y, sr = sf.read(sys.argv[1], dtype='float64')
    info = json.load(open(sys.argv[2]))
    import os
    wd = os.path.dirname(sys.argv[2])
    if os.path.exists(os.path.join(wd, 'macro_gain_db.npy')):
        GM = np.load(os.path.join(wd, 'macro_gain_db.npy')).astype(float)
        NORM = json.load(open(os.path.join(wd, 'master_meta.json')))['norm_gain_db']
    half = float(sys.argv[4]) if len(sys.argv) > 4 else 3.0
    ks = [int(v) for v in sys.argv[5].split(',')] if len(sys.argv) > 5 else [j['k'] for j in info['junctions']]
    for k in ks:
        plot(y, info, k, f'{sys.argv[3]}_J{k}.png', half)
        print(f'{sys.argv[3]}_J{k}.png')
