#!/usr/bin/env python3
"""Render an edit of Cornfield Chase from a JSON spec (bar-line cuts only).
usage: python3 render.py spec.json out.wav out_edit.json
spec = {"segments": [
   {"bars": [a, b]}                      # source bars a .. b-1 (b = the bar line where playback leaves; 65 = the hard stop)
   {"bars": [46, 65], "tail_bars": 2}    # keep the original reverb tail after the stop for 2 bars of time (overlay)
   {"bars": [a, b], "gain_db": g}        # constant gain on this segment (segments are mixed, so gain moves with the clip)
 ],
 "xf": {"k": {"len": s, "place": "pre|center|post", "pre_ms": 10}}   # junction k = start of segment k (1-based index into segments)
 "fade_out": {"start_bar": n_out, "len_s": s, "db": -48}             # optional final fade (output bar index, 1-based)
}
Every junction is an equal-power crossfade whose gains are corrected for the measured correlation of the two
signals inside the fade (a^2 + b^2 + 2 rho a b = 1, so the power stays constant whether the two sides are
correlated or not). Default: 156 ms, ending 10 ms before the bar line (so the downbeat attack comes only from the
incoming side)."""
import sys, json, numpy as np, soundfile as sf
from lib import *


def xf_gains(n, rho):
    ph = (np.arange(n) + 0.5) / n
    th = ph * np.pi / 2
    a, b = np.cos(th), np.sin(th)
    rho = float(np.clip(rho, -0.6, 1.0))
    k = 1.0 / np.sqrt(1.0 + rho * np.sin(2 * th))
    return a * k, b * k


def render(spec):
    x = src()
    segs = spec['segments']
    xfs = spec.get('xf', {})
    # 1. place segments on the output timeline: out_start[k] = output time (s) of the in bar line of segment k
    place = []
    t_out = 0.0
    for k, s in enumerate(segs):
        a, b = s['bars']
        if k == 0:
            off = 0.0 - max(0.0, bt(a)) if a == 1 else -bt(a)   # output = source + off
        else:
            prev = place[-1]
            pa, pb = prev['bars']
            t_line = bt(pb) + prev['off']                         # output time of the previous segment's out line
            t_line += prev.get('tail_bars', 0) * BAR
            off = t_line - bt(a)
        place.append(dict(bars=[a, b], off=off, gain_db=s.get('gain_db', 0.0), tail_bars=s.get('tail_bars', 0)))
    last = place[-1]
    total = bt(last['bars'][1]) + last['off'] + last['tail_bars'] * BAR
    N = int(round(total * SR))
    y = np.zeros((N, 2))
    # 2. per segment: source span incl. crossfade margins, gain envelope
    junc = []
    env_in = [None] * len(place)
    env_out = [None] * len(place)
    for k in range(1, len(place)):
        p0, p1 = place[k - 1], place[k]
        cfg = dict(len=0.156, place='pre', pre_ms=10)
        cfg.update(xfs.get(str(k), {}))
        n = int(round(cfg['len'] * SR))
        T = int(round((bt(p1['bars'][0]) + p1['off']) * SR))     # output sample of the junction bar line
        if cfg['place'] == 'pre':
            s0 = T - n - int(cfg['pre_ms'] * SR / 1000)
        elif cfg['place'] == 'center':
            s0 = T - n // 2
        else:  # post: fade starts at the bar line (+ optional ms)
            s0 = T + int(cfg.get('post_ms', 0) * SR / 1000)
        # the two signals inside the fade window (out side continues its own source, in side starts early)
        def seg_audio(p, o0, o1):
            a0 = int(round(o0 - p['off'] * SR)); a1 = a0 + (o1 - o0)
            return x[a0:a1] * 10 ** (p['gain_db'] / 20)
        A_ = seg_audio(p0, s0, s0 + n); B_ = seg_audio(p1, s0, s0 + n)
        rho = float((A_ * B_).sum() / np.sqrt((A_ ** 2).sum() * (B_ ** 2).sum() + 1e-20))
        # mid/side: each component keeps constant power with its own correlation (the stereo image does not narrow or widen)
        Am = (A_[:, 0] + A_[:, 1]) / 2; As = (A_[:, 0] - A_[:, 1]) / 2
        Bm = (B_[:, 0] + B_[:, 1]) / 2; Bs = (B_[:, 0] - B_[:, 1]) / 2
        rm = float((Am * Bm).sum() / np.sqrt((Am ** 2).sum() * (Bm ** 2).sum() + 1e-20))
        rs = float((As * Bs).sum() / np.sqrt((As ** 2).sum() * (Bs ** 2).sum() + 1e-20))
        if cfg.get('rho') is not None: rm = rs = cfg['rho']
        gam, gbm = xf_gains(n, rm); gas, gbs = xf_gains(n, rs)
        ga = np.stack([gam, gas], 1); gb = np.stack([gbm, gbs], 1)
        env_out[k - 1] = (s0, n, ga)
        env_in[k] = (s0, n, gb)
        junc.append(dict(k=k, out_bar=p0['bars'][1], in_bar=p1['bars'][0], t=T / SR, src_out=bt(p0['bars'][1]), src_in=bt(p1['bars'][0]),
                         xf_len=cfg['len'], place=cfg['place'], xf_start=s0 / SR, xf_end=(s0 + n) / SR, rho=round(rho, 3), rho_mid=round(rm, 3), rho_side=round(rs, 3),
                         tail_bars=p0['tail_bars']))
    for k, p in enumerate(place):
        a, b = p['bars']
        o_start = 0 if k == 0 else env_in[k][0]
        o_line_end = int(round((bt(b) + p['off']) * SR))
        if k == len(place) - 1:
            o_end = N
        else:
            o_end = env_out[k][0] + env_out[k][1]
        src0 = int(round(o_start - p['off'] * SR))
        src1 = src0 + (o_end - o_start)
        if src1 > len(x):
            src1 = len(x); o_end = o_start + (src1 - src0)
        seg = x[src0:src1].copy() * 10 ** (p['gain_db'] / 20)
        g = np.ones((len(seg), 2))
        env = segs[k].get('env')
        if env:   # breakpoints [[source_time_s, dB], ...], dB-linear between them, held outside
            ts_src = (src0 + np.arange(len(seg))) / SR
            pts = np.array(env, float)
            g = g * (10 ** (np.interp(ts_src, pts[:, 0], pts[:, 1]) / 20))[:, None]
        if k > 0:
            s0, n, gb = env_in[k]; g[:n] = gb
        if k < len(place) - 1:
            s0, n, ga = env_out[k]; i0 = s0 - o_start
            g[i0:i0 + n] *= ga; g[i0 + n:] = 0
        mid = (seg[:, 0] + seg[:, 1]) / 2 * g[:, 0]; side = (seg[:, 0] - seg[:, 1]) / 2 * g[:, 1]
        y[o_start:o_end] += np.stack([mid + side, mid - side], 1)
    # 3. output bar table
    bars = []
    for k, p in enumerate(place):
        a, b = p['bars']
        for nb in range(a, b):
            ts = bt(nb) + p['off']
            bars.append(dict(src_bar=nb, true_start=round(ts, 4), start=round(max(0.0, ts), 4), beats=nbeats(nb), chord=BARS[nb]['chord'],
                             section=BARS[nb]['section'], seg=k))
        for q in range(p['tail_bars']):
            ts = bt(b) + p['off'] + q * BAR
            bars.append(dict(src_bar='tail', true_start=round(ts, 4), start=round(ts, 4), beats=3, chord='G (tail)', section='tail', seg=k))
    fo = spec.get('fade_out')
    fade = None
    if fo:
        t0 = bars[fo['start_bar'] - 1]['start'] + fo.get('delay_s', 0.0)
        n0 = int(round(t0 * SR)); n1 = N
        L = n1 - n0
        u = (np.arange(L) + 0.5) / L
        db = fo.get('db', -48.0); pw = fo.get('pow', 1.0)
        g = 10 ** (db * u ** pw / 20)
        tail = max(1, int(0.25 * L))                      # last quarter also multiplied by a cosine so it lands on exactly 0
        g[-tail:] *= np.cos((np.arange(tail) + 0.5) / tail * np.pi / 2)
        y[n0:n1] *= g[:, None]
        fade = dict(start=t0, end=n1 / SR, db=db, pow=pw)
    fi = spec.get('fade_in_ms', 0)
    if fi:
        n = int(fi * SR / 1000); y[:n] *= (0.5 - 0.5 * np.cos((np.arange(n) + 0.5) / n * np.pi))[:, None]   # raised cosine
    return y, dict(total=N / SR, bars=bars, junctions=junc, place=place, fade=fade)


if __name__ == '__main__':
    spec = json.load(open(sys.argv[1]))
    y, info = render(spec)
    sf.write(sys.argv[2], y.astype(np.float32), SR, subtype='FLOAT')
    info['spec'] = spec
    json.dump(info, open(sys.argv[3], 'w'), indent=1)
    print(f"{sys.argv[2]}: {info['total']:.4f} s, {len(info['bars'])} bars, peak {20*np.log10(np.abs(y).max()):.2f} dBFS")
    for j in info['junctions']:
        print(f"  J{j['k']}: out {j['t']:.3f}  {j['out_bar']}->{j['in_bar']} (src {j['src_out']:.3f}->{j['src_in']:.3f}) xf {j['xf_len']*1000:.0f} ms {j['place']} rho {j['rho']}")
