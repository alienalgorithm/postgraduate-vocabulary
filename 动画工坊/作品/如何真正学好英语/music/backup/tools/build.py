# Bar-line edit of "Epic Vista" (John Bartmann, CC0) for the backup score, at the source rate 44.1 kHz.
# usage: python3 -I build.py <ev_src.npy> <edit_441.npy> <edit_meta.json>
# Source grid (measured earlier, exact to 0.3 ms): 94.000 BPM 4/4, bar k starts at OFF + k*BAR.
import sys, json
import numpy as np
import scipy.signal as ss

SR = 44100
BAR = 240.0 / 94.0
OFF = 0.3196
t = lambda k: OFF + k * BAR                       # source time of source bar k
S = lambda sec: int(round(sec * SR))

# ---- picture anchors (storyboard.json, seconds) ----
BURST, EXPL, STOP, RETURN, CARD, TOTAL = 55.592, 111.842, 117.467, 121.217, 158.092, 169.342
G0 = BURST - 21 * BAR            # output time of output bar k=0 (grid before the explosion)
O = lambda k: G0 + k * BAR
GAP = EXPL - O(43)               # extra near-silence inserted before the explosion (0.0798 s)
H48 = CARD - 14 * BAR            # output time of the first source bar 48 after the stop

import os
REP = int(os.environ.get('REP', '19'))          # two-bar repeat: play source bars 7..REP, then REP-1..27
src = np.load(sys.argv[1])
NOUT = S(TOTAL + 0.5)
out = np.zeros((NOUT, 2))


def corr(a, b):
    a = a.mean(1) - a.mean(); b = b.mean(1) - b.mean()
    d = np.sqrt((a * a).sum() * (b * b).sum()) + 1e-20
    return float((a * b).sum() / d)


def onset_env(seg):
    f, tt, Z = ss.stft(seg.mean(1), SR, nperseg=1024, noverlap=1024 - 64)
    L = np.log1p(200 * np.abs(Z))
    return np.concatenate([[0], np.maximum(0, np.diff(L, axis=1)).sum(0)])


def best_lag(ref_start, cand_start, length, search):
    ref = onset_env(src[S(ref_start):S(ref_start + length)])
    best = (-9, 0.0)
    for lag in np.arange(-search, search + 1e-9, 0.0005):
        c = onset_env(src[S(cand_start + lag):S(cand_start + lag + length)])
        n = min(len(ref), len(c)); r = np.corrcoef(ref[:n], c[:n])[0, 1]
        if r > best[0]:
            best = (r, float(lag))
    return best


lag57 = best_lag(t(58), t(60), BAR, 0.04)[1]     # align the ending ticks of bar 60 to where bar 58 was
P_GAP = t(28) - 0.35                               # inside the near-silent last beat of bar 27 (-56 dB)

# ---- segments: output start (s), source time at that output start, output end (s) ----
segs = [
    dict(name='A1 intro (pre-roll from bar 3, bars 4-6)', o0=0.0, s0=t(4) - G0, o1=O(3)),
    dict(name='A2 intro bars 3-7, theme bars 8-13', o0=O(3), s0=t(3), o1=O(14)),
    dict(name='A3 breath: breakdown bars 22-27', o0=O(14), s0=t(22), o1=O(20)),
    dict(name='B1 lead-in bar 7, theme bars 8-%d' % REP, o0=O(20), s0=t(7), o1=O(20 + REP - 6)),
    dict(name='B2 theme bars %d-21, breakdown 22-27 (to the gap)' % (REP - 1), o0=O(20 + REP - 6), s0=t(REP - 1), o1=O(20 + REP - 6) + (P_GAP - t(REP - 1))),
    dict(name='C near-silence + explosion bar 28, climax 28-30 (to the stop)', o0=O(20 + REP - 6) + (P_GAP - t(REP - 1)), s0=P_GAP - GAP, o1=STOP),
    dict(name='D1 warm tail bars 48-53 (fade-in from bar 47)', o0=RETURN, s0=t(48) - (H48 - RETURN), o1=H48 + 6 * BAR),
    dict(name='D2 warm tail bars 48-57', o0=H48 + 6 * BAR, s0=t(48), o1=H48 + 16 * BAR),
    dict(name='D3 ending bars 60-61 and release', o0=H48 + 16 * BAR, s0=t(60) + lag57, o1=TOTAL + 0.4),
]
# seams between consecutive segments (index i joins segs[i] -> segs[i+1]); pre/post = crossfade window around the line
seams = {
    0: dict(pre=0.40, post=0.03, rho='measure', note='intro 6->3: 4-bar loop repeat (bar 7 = bar 3), audio corr 0.93 before / 0.78 after the line'),
    1: dict(pre=0.30, post=0.02, rho='measure', note='theme 13->22: bar 13 is the same loop bar as 21 (corr 0.66), so the breath enters exactly as after bar 21; fade done before the bass of bar 14 sounds'),
    2: dict(pre=0.638, post=0.0, rho=0.0, note='breath 27->7: bar 27 has died away (-56 dB); the last beat of bar 6 swells in (equal power) into the lead-in bar 7; nothing of bar 28 is used'),
    3: dict(pre=0.005, post=0.10, rho='measure', note='theme %d->%d: two-bar repeat (the two F minor bars of the 4-bar loop played twice), fade sits on the downbeat' % (REP, REP - 1)),
    4: dict(pre=0.02, post=0.02, rho=0.0, note='gap: 79.8 ms of the near-silence before the explosion repeated (-56 dB room tone), so the explosion lands on the picture'),
    6: dict(pre=0.30, post=0.05, rho='measure', note='tail 53->48: 6-bar loop repeat (bar 53 = bar 47), corr 0.97/0.95'),
    7: dict(pre=0.20, post=0.04, rho='measure', note='ending 57->60: inside the gap between ticks, bar 60 aligned to bar 58 by onset correlation'),
}

env_total = np.zeros(NOUT)
seam_meta = []
for i, sg in enumerate(segs):
    pre_in = seams[i - 1]['pre'] if (i - 1) in seams else 0.0
    post_out = seams[i]['post'] if i in seams else 0.0
    a = sg['o0'] - pre_in; b = min(sg['o1'] + post_out, NOUT / SR)
    oa, ob = S(a), S(b)
    sa = S(sg['s0'] - (sg['o0'] - a))
    piece = src[sa:sa + (ob - oa)].copy()
    if len(piece) < ob - oa:
        piece = np.r_[piece, np.zeros((ob - oa - len(piece), 2))]
    env = np.ones(ob - oa)
    sg['piece'], sg['oa'], sg['env'] = piece, oa, env
for i in range(len(segs) - 1):
    if i not in seams:
        continue
    x = seams[i]; A, Bn = segs[i], segs[i + 1]
    T = Bn['o0']; w0, w1 = S(T - x['pre']), S(T + x['post'])
    oa_, ob_ = A['oa'], Bn['oa']
    outgoing = A['piece'][w0 - oa_:w1 - oa_]
    incoming = Bn['piece'][w0 - ob_:w1 - ob_]
    rho = x['rho'] if x['rho'] != 'measure' else max(-0.3, min(0.9, corr(outgoing, incoming)))
    n = w1 - w0
    u = (np.arange(n) + 0.5) / n
    th = 0.5 * np.pi * u
    k = np.sqrt(1.0 + rho * np.sin(2 * th))
    A['env'][w0 - oa_:w1 - oa_] = np.cos(th) / k
    A['env'][w1 - oa_:] = 0.0
    Bn['env'][:w0 - ob_] = 0.0
    Bn['env'][w0 - ob_:w1 - ob_] = np.sin(th) / k
    seam_meta.append(dict(at=round(T, 4), out_seg=A['name'], in_seg=Bn['name'], pre=x['pre'], post=x['post'],
                          rho=round(float(rho), 3), src_out=round(A['s0'] + (T - A['o0']), 4), src_in=round(Bn['s0'], 4), note=x['note']))

# --- special envelopes --------------------------------------------------------------------------
# opening: 1.975 s fade-in (sin^2) on the pre-roll, bar 4 arrives at full level on the first output bar line
A1 = segs[0]; n0 = S(G0)
A1['env'][:n0] *= np.sin(0.5 * np.pi * (np.arange(n0) + 0.5) / n0) ** 2
# the stop: dry music cut with a 40 ms equal-power fade ending on the picture's freeze frame
C = segs[5]
st0, st1 = S(STOP - 0.040), S(STOP)
C['env'][st0 - C['oa']:st1 - C['oa']] *= np.cos(0.5 * np.pi * (np.arange(st1 - st0) + 0.5) / (st1 - st0))
C['env'][st1 - C['oa']:] = 0.0
# the return: warm tail floats back in over the 1.13 s before bar 48 (raised cosine)
D1 = segs[6]; r0, r1 = S(RETURN), S(H48)
D1['env'][:r1 - r0] *= 0.5 - 0.5 * np.cos(np.pi * (np.arange(r1 - r0) + 0.5) / (r1 - r0))

for sg in segs:
    seg = sg['piece'] * sg['env'][:, None]
    out[sg['oa']:sg['oa'] + len(seg)] += seg[:NOUT - sg['oa']]

# --- reverb tail after the stop (the climax's own last 1.2 s through a decaying stereo hall) ------
rng = np.random.default_rng(1885)
IRL = S(4.0); ti = np.arange(IRL) / SR
ir = np.zeros((IRL, 2))
bands = [(None, 400, 3.0), (400, 4000, 2.6), (4000, None, 1.2)]
for ch in range(2):
    nz = rng.standard_normal(IRL)
    acc = np.zeros(IRL)
    for lo, hi, rt in bands:
        if lo is None: sos = ss.butter(4, hi, 'low', fs=SR, output='sos')
        elif hi is None: sos = ss.butter(4, lo, 'high', fs=SR, output='sos')
        else: sos = ss.butter(4, [lo, hi], 'band', fs=SR, output='sos')
        acc += ss.sosfiltfilt(sos, nz) * np.exp(-6.9078 * ti / rt)
    ir[:, ch] = acc
pd = S(0.012); ir = np.r_[np.zeros((pd, 2)), ir[:-pd]]
on = S(0.025); ir[pd:pd + on] *= (np.arange(on) / on)[:, None]
ir /= np.sqrt((ir ** 2).sum(0, keepdims=True))
# send: the dry music before the stop, windowed (ramps up 2.0 -> 1.2 s before the stop, full until the stop)
sa, sb = S(STOP - 2.0), S(STOP)
dry = segs[5]['piece'] * segs[5]['env'][:, None]           # already includes the stop fade
dsend = out[sa:sb].copy()
wr = S(0.8); ramp = 0.5 - 0.5 * np.cos(np.pi * np.arange(wr) / wr)
dsend[:wr] *= ramp[:, None]
wet = np.stack([ss.fftconvolve(dsend[:, c], ir[:, c]) for c in range(2)], 1)  # wet[0] aligned with sa
# gate: the wet is heard only from the stop on (equal-power against the dry 40 ms fade)
gate = np.zeros(len(wet))
g0, g1 = st0 - sa, st1 - sa
gate[g0:g1] = np.sin(0.5 * np.pi * (np.arange(g1 - g0) + 0.5) / (g1 - g0)); gate[g1:] = 1.0
wet *= gate[:, None]
ref = np.sqrt((out[S(STOP - 0.34):S(STOP - 0.04)] ** 2).mean())
wl = np.sqrt((wet[g1:g1 + S(0.10)] ** 2).mean())
WET_DB = -8.0
wet *= 10 ** (WET_DB / 20) * ref / wl
wend = min(NOUT, sa + len(wet))
out[sa:wend] += wet[:wend - sa]
# the wet must be gone before the warm tail returns
assert np.abs(wet[S(RETURN) - sa:]).max() < 10 ** (-70 / 20) if S(RETURN) - sa < len(wet) else True

np.save(sys.argv[2], out)

# ---- output bar map --------------------------------------------------------------------------
bars = []
src_seq_A = [4, 5, 6] + list(range(3, 14)) + list(range(22, 28)) + [7] + list(range(8, REP + 1)) + list(range(REP - 1, 28))
assert len(src_seq_A) == 43
for k, b in enumerate(src_seq_A):
    tt = O(k) + (GAP if k >= 43 else 0.0)
    bars.append(dict(t=round(tt, 4), src_bar=b))
for j, b in enumerate([28, 29, 30]):
    bars.append(dict(t=round(EXPL + j * BAR, 4), src_bar=b, note='climax' if j < 2 else 'stopped at 117.467'))
tail_seq = list(range(48, 54)) + list(range(48, 58)) + [60, 61]
for j, b in enumerate(tail_seq):
    bars.append(dict(t=round(H48 + j * BAR - (lag57 if j >= 16 else 0.0), 4), src_bar=b))
meta = dict(rep=REP, sr=SR, bar=BAR, beat=BAR / 4, bpm=94.0, off_src=OFF, G0=G0, gap=GAP, H48=H48, lag57=lag57, p_gap=P_GAP,
            wet_db=WET_DB, rt60=dict(low=3.0, mid=2.6, high=1.2), stop=STOP, ret=RETURN,
            segments=[{k: (round(v, 5) if isinstance(v, float) else v) for k, v in sg.items() if k in ('name', 'o0', 's0', 'o1')} for sg in segs],
            seams=seam_meta, bars=bars, total=TOTAL)
json.dump(meta, open(sys.argv[3], 'w'), indent=1, ensure_ascii=False)
print('G0 %.4f  gap %.4f s  H48 %.4f  lag57 %.4f' % (G0, GAP, H48, lag57))
for s_ in seam_meta:
    print('seam %8.3f  rho %+.2f  src %.3f -> %.3f  %s' % (s_['at'], s_['rho'], s_['src_out'], s_['src_in'], s_['note'][:60]))
