#!/usr/bin/env python3
"""Numerical seam check of an edit rendered by render.py.
usage: python3 seams.py edit.wav edit.json [gain_json]
For every junction (output bar line T, out side = source line si, in side = source line sj):
  jump   : max |sample step| within +-0.25 s of T, against the largest step the original has within +-0.25 s of si and sj
  click  : 2-ms energy above 6 kHz around T: the highest 2-ms value vs the median of the surrounding second (dB), against
           the same statistic in the original at si and sj
  rms    : 20-ms RMS of the edit inside the crossfade window and +-0.4 s around it, compared with the curve the listener
           would expect (original at si before T, original at sj after T); worst deviation in dB (dip < 0, bump > 0)
  flux   : log-mel distance between 0.3 s before and after T (and between the bar before and the bar after), against the
           distribution of the same distance at every natural bar line of the original (percentile), and against the
           natural distance at si and at sj (the music's own change at those two bar lines)
  pulse  : 16th-note phase (onset envelope above 2 kHz) in the 3 s before and after T; difference in ms
Outputs a table and returns non-zero if a seam fails: jump > 1.25 x natural, click > natural + 3 dB, |rms| > 1.5 dB,
flux percentile > 90 with flux above both natural changes + 1 dB, |pulse| > 8 ms."""
import sys, json, numpy as np, soundfile as sf, scipy.signal as ss
from lib import *
from onset import lag

X = src()


def hf_click(sig, t, half=0.5):
    a = max(0, int((t - half) * SR)); b = min(len(sig), int((t + half) * SR))
    s = sig[a:b].mean(1)
    h = ss.sosfilt(ss.butter(6, 6000, 'high', fs=SR, output='sos'), s)
    n = int(0.002 * SR)
    e = np.array([(h[i:i + n] ** 2).mean() for i in range(0, len(h) - n, n // 2)])
    e = 10 * np.log10(e + 1e-20)
    mid = len(e) // 2; w = int(0.06 / 0.001)          # +-60 ms around the bar line
    return float(e[mid - w:mid + w].max() - np.median(e))


def max_step(sig, t, half=0.25):
    a = max(1, int((t - half) * SR)); b = min(len(sig), int((t + half) * SR))
    return float(np.abs(np.diff(sig[a - 1:b], axis=0)).max())


NPTS = None
def rms_curve(sig, t0, t1, win=0.02, hop=0.005):
    ts = t0 + np.arange(NPTS if NPTS else int(round((t1 - t0) / hop))) * hop
    out = []
    for t in ts:
        a = int((t - win / 2) * SR); b = int((t + win / 2) * SR)
        s = sig[max(a, 0):max(b, 1)]
        out.append(10 * np.log10((s ** 2).mean() + 1e-20))
    return ts, np.array(out)


def spec_dist(sig, t, w):
    a = logmel(sig, t - w, t); b = logmel(sig, t, t + w)
    # level-normalised spectral shape change + level change, both in dB
    return float(np.sqrt(np.mean((a - b) ** 2)))


_NAT = None


def natural():
    global _NAT
    if _NAT is None:
        sh, br = [], []
        for n in range(3, 65):
            if n in (19, 24, 46): continue        # composer section boundaries are not "ordinary" bar lines
            t = bt(n)
            sh.append(spec_dist(X, t, 0.3)); br.append(spec_dist(X, t, 1.8))
        _NAT = (np.array(sh), np.array(br))
    return _NAT


def pct(v, arr):
    return float((arr < v).mean() * 100)


def pulse_phase(sig, t0, t1):
    a = max(0, int(t0 * SR)); b = min(len(sig), int(t1 * SR))
    s = sig[a:b].mean(1)
    h = ss.sosfilt(ss.butter(4, 2000, 'high', fs=SR, output='sos'), s)
    e = np.sqrt(ss.fftconvolve(h ** 2, np.hanning(240) / 120, 'same'))[::48]          # 1 ms
    d = np.maximum(np.diff(np.log(e + 1e-9)), 0)
    P = 156.25
    tt = (a / SR + np.arange(len(d)) / 1000.0)
    ph = np.exp(2j * np.pi * tt * 1000 / P)
    z = (d * ph).sum() / (d.sum() + 1e-12)
    return float(np.angle(z) / (2 * np.pi) * P), float(abs(z))


def check(y, info, verbose=True):
    shN, brN = natural()
    rows = []; bad = 0
    for j in info['junctions']:
        T = j['t']; si = j['src_out']; sj = j['src_in']
        tail = j.get('tail_bars', 0)
        if tail:
            si = None   # out side is the reverb tail after the stop: compare the incoming side only
        r = dict(k=j['k'], t=T, join=f"{j['out_bar']}->{j['in_bar']}", xf=f"{j['xf_len']*1000:.0f}{j['place'][0]}", rho=j['rho'])
        g_in_ = 10 ** (info['place'][j['k']]['gain_db'] / 20); g_out_ = 10 ** (info['place'][j['k'] - 1]['gain_db'] / 20)
        nat_step = max([max_step(X, sj) * g_in_] + ([max_step(X, si) * g_out_] if si else []))
        r['jump'] = max_step(y, T); r['jump_nat'] = nat_step
        nat_click = max([hf_click(X, sj)] + ([hf_click(X, si)] if si else []))
        r['click'] = hf_click(y, T); r['click_nat'] = nat_click
        # rms deviation inside the crossfade region: expected = original out side before T, original in side after T
        t0, t1 = min(j['xf_start'], T) - 0.4, max(j['xf_end'], T) + 0.4
        global NPTS
        NPTS = int(round((t1 - t0) / 0.005))
        ts, ey = rms_curve(y, t0, t1)
        g_in = info['place'][j['k']]['gain_db']; g_out = info['place'][j['k'] - 1]['gain_db']
        _, eb = rms_curve(X, t0 - T + sj, t1 - T + sj); eb = eb + g_in
        if si:
            _, ea = rms_curve(X, t0 - T + si, t1 - T + si); ea = ea + g_out
            lo = np.minimum(ea, eb); hi = np.maximum(ea, eb)
            m = (ts >= j['xf_start'] - 0.01) & (ts <= j['xf_end'] + 0.01)
            exp_ = np.where(ts < T, ea, eb)
            dip = float((ey[m] - lo[m]).min()) if m.any() else 0.0
            bump = float((ey[m] - hi[m]).max()) if m.any() else 0.0
            outside = (ts < j['xf_start'] - 0.03) | (ts > j['xf_end'] + 0.03)
            off = float(np.abs(ey[outside] - exp_[outside]).max())
        else:
            m = ts > j['xf_end'] + 0.03
            dip = 0.0; bump = 0.0; off = float(np.abs(ey[m] - eb[m]).max())
        r['dip'] = min(dip, 0.0); r['bump'] = max(bump, 0.0); r['off'] = off
        # spectral change at T
        fs_ = spec_dist(y, T, 0.3); fb_ = spec_dist(y, T, 1.8)
        nat_s = [spec_dist(X, sj, 0.3)] + ([spec_dist(X, si, 0.3)] if si else [])
        nat_b = [spec_dist(X, sj, 1.8)] + ([spec_dist(X, si, 1.8)] if si else [])
        r['flux_s'] = fs_; r['flux_b'] = fb_; r['pct_s'] = pct(fs_, shN); r['pct_b'] = pct(fb_, brN)
        r['nat_s'] = max(nat_s); r['nat_b'] = max(nat_b)
        if si:
            l1 = lag(X, si - BAR, X, sj - BAR); l2 = lag(X, si, X, sj)
            c = min(l1[1], l2[1]); lg = (l1[0] + l2[0]) / 2 * 1000
            r['pulse_ms'] = lg if c >= 0.2 else float('nan'); r['pulse_c'] = c
        else:
            r['pulse_ms'] = float('nan'); r['pulse_c'] = 0
        fails = []
        if r['jump'] > 1.25 * r['jump_nat'] and r['jump'] > 0.02: fails.append('jump')
        if r['click'] > r['click_nat'] + 3: fails.append('click')
        if r['dip'] < -1.5 or r['bump'] > 1.5: fails.append('rms')
        if r['pct_s'] > 90 and r['flux_s'] > r['nat_s'] + 1.0: fails.append('flux_s')
        if r['pct_b'] > 90 and r['flux_b'] > r['nat_b'] + 1.0: fails.append('flux_b')
        if not np.isnan(r['pulse_ms']) and abs(r['pulse_ms']) > 5: fails.append('pulse')
        r['fail'] = fails; bad += bool(fails)
        rows.append(r)
    if verbose:
        print(' J   out_t    join    xf    rho  jump/nat      click/nat   dip  bump  off | flux_s(nat) pct | flux_b(nat) pct | pulse ms  fail')
        for r in rows:
            print(f"{r['k']:2d} {r['t']:8.3f} {r['join']:>7s} {r['xf']:>5s} {r['rho']:5.2f} {r['jump']:.3f}/{r['jump_nat']:.3f} {r['click']:5.1f}/{r['click_nat']:5.1f} "
                  f"{r['dip']:5.2f} {r['bump']:4.2f} {r['off']:4.1f} | {r['flux_s']:4.2f}({r['nat_s']:4.2f}) {r['pct_s']:3.0f} | {r['flux_b']:4.2f}({r['nat_b']:4.2f}) {r['pct_b']:3.0f} | "
                  f"{r['pulse_ms']:6.1f} {','.join(r['fail'])}")
    return rows, bad


if __name__ == '__main__':
    y, sr = sf.read(sys.argv[1], dtype='float64'); assert sr == SR
    info = json.load(open(sys.argv[2]))
    rows, bad = check(y, info)
    print('seams failing:', bad)
