# Build the bar-line edit of "Epic Vista" (John Bartmann, CC0) at the source rate (44.1 kHz).
# usage: python3 -I build.py <src.npy> <out.npy> <out_meta.json>
# Source grid is exact: 94.000 BPM, bar = 240/94 s, bar k starts at OFF + k*BAR (OFF measured from
# the attack of bar 0 and of the drop at bar 28; both agree within 0.3 ms).
import sys, json
import numpy as np
import scipy.signal as ss

SR = 44100
BAR = 240.0 / 94.0
OFF = 0.3196
LEAD = 0.020            # output starts 20 ms before bar 0's attack, so output bar 0 sits at 0.020 s


def t(k):
    return OFF + k * BAR


def S(sec):
    return int(round(sec * SR))


src = np.load(sys.argv[1])
N = len(src)


def corr(a, b):
    a = a.mean(1) - a.mean(); b = b.mean(1) - b.mean()
    d = np.sqrt((a * a).sum() * (b * b).sum()) + 1e-20
    return float((a * b).sum() / d)


def onset_env(seg):
    mono = seg.mean(1)
    f, tt, Z = ss.stft(mono, SR, nperseg=1024, noverlap=1024 - 64)
    L = np.log1p(200 * np.abs(Z))
    return np.concatenate([[0], np.maximum(0, np.diff(L, axis=1)).sum(0)])


def best_lag(ref_start, cand_start, length, search):
    """lag (s) to add to cand_start so its onset pattern matches ref (both src times)."""
    ref = onset_env(src[S(ref_start):S(ref_start + length)])
    best = (-9, 0.0)
    for lag in np.arange(-search, search + 1e-9, 0.0005):
        c = onset_env(src[S(cand_start + lag):S(cand_start + lag + length)])
        n = min(len(ref), len(c))
        r = np.corrcoef(ref[:n], c[:n])[0, 1]
        if r > best[0]:
            best = (r, float(lag))
    return best


# --- the edit (source bar ranges, all cuts on bar lines) ------------------------------------
# A: bars 0-6   (intro, first statement up to the bar before the lead-in)
# B: bars 3-23  (intro bars 3-6 again = 4 extra intro bars, lead-in bar 7, theme 8-21, the
#                thinned "breath" 22-23)
# C: bars 8-57  (theme again 8-21, real breakdown 22-27 with the composed silence, the drop at
#                bar 28, climax 28-45, resolution 46-56, final chord bar 57)
# D: bars 60-61 + tail (last two bars of the ending figure and the natural release)
lag3 = best_lag(t(58), t(60), BAR * 1.0, 0.04)   # align ending ticks of bar 60 to where bar 58 was
segs = [
    dict(name='A', src0=t(0) - LEAD, src1=t(7), bars=(0, 6)),
    dict(name='B', src0=t(3), src1=t(24), bars=(3, 23)),
    dict(name='C', src0=t(8), src1=t(58), bars=(8, 57)),
    dict(name='D', src0=t(60) + lag3[1], src1=159.50, bars=(60, 62)),
]
# crossfade windows around each joint: (pre, post) seconds relative to the joint
xf = [
    dict(pre=0.40, post=0.03, note='intro 6->3: near-identical repeat (bar 3 == bar 7 harmonically, audio corr 0.86)'),
    dict(pre=0.64, post=0.015, note='breath 23->8: one-beat blend into the lead-in glide of bar 7, theme re-enters on the downbeat'),
    dict(pre=0.20, post=0.04, note='ending 57->60: inside the gap between ticks, ticks aligned by onset correlation'),
]

out = []
joints = []
pos = 0  # output sample position
for i, sg in enumerate(segs):
    a0, a1 = S(sg['src0']), S(sg['src1'])
    if i == 0:
        piece = src[a0:a1].copy()
        out.append(piece); pos += len(piece)
        continue
    prev = segs[i - 1]
    x = xf[i - 1]
    pre, post = S(x['pre']), S(x['post'])
    # outgoing continuation (prev segment continues past its nominal end by `post`)
    p1 = S(prev['src1'])
    outgoing = src[p1 - pre:p1 + post]
    incoming = src[a0 - pre:a0 + post]
    rho = max(0.0, min(0.9, corr(outgoing, incoming)))
    u = (np.arange(pre + post) + 0.5) / (pre + post)
    th = 0.5 * np.pi * u
    k = np.sqrt(1.0 + rho * np.sin(2 * th))
    g_out = (np.cos(th) / k)[:, None]
    g_in = (np.sin(th) / k)[:, None]
    # remove the last `pre` samples already written (they belong to the window)
    last = out[-1]
    out[-1] = last[:len(last) - pre]
    pos -= pre
    mix = outgoing * g_out + incoming * g_in
    out.append(mix)
    joint_out = pos + pre  # output sample of the joint (bar line)
    joints.append(dict(joint_s=joint_out / SR, src_out_end=prev['src1'], src_in_start=sg['src0'], rho=rho,
                       pre=x['pre'], post=x['post'], note=x['note']))
    pos += len(mix)
    rest = src[a0 + post:a1].copy()
    out.append(rest); pos += len(rest)

y = np.concatenate(out)
# end: cosine fade over the last 1.5 s (tail already below -60 dBFS there), start: 5 ms fade-in
fe = S(1.5); y[-fe:] *= (0.5 + 0.5 * np.cos(np.pi * np.arange(fe) / fe))[:, None]
fi = S(0.005); y[:fi] *= (0.5 - 0.5 * np.cos(np.pi * np.arange(fi) / fi))[:, None]
np.save(sys.argv[2], y)

# output bar map: output bar e -> source bar
bar_src = list(range(0, 7)) + list(range(3, 24)) + list(range(8, 58)) + [60, 61, 62]
bars_out = []
for e, b in enumerate(bar_src):
    tt = LEAD + e * BAR
    if e >= 78:                       # after the ending joint the material is shifted by -lag3
        tt -= lag3[1]
    bars_out.append(dict(e=e, src_bar=b, t=round(tt, 4)))
meta = dict(sr=SR, bar=BAR, off_src=OFF, lead=LEAD, total=len(y) / SR, lag3=lag3, joints=joints,
            segments=segs, bars=bars_out)
json.dump(meta, open(sys.argv[3], 'w'), indent=1)
print('total', round(len(y) / SR, 3), 's; lag3', lag3)
for j in joints:
    print('joint at %.3f s  src %.3f -> %.3f  rho %.2f  %s' % (j['joint_s'], j['src_out_end'], j['src_in_start'], j['rho'], j['note']))
print('drop (src bar 28) at output', [b['t'] for b in bars_out if b['src_bar'] == 28])
