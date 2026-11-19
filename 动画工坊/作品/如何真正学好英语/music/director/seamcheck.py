# Objective seam check: compare each edit joint with every natural bar line of the same audio.
# usage: python3 -I seamcheck.py <audio.npy|.wav> <sr> <meta.json>
import sys, json
import numpy as np
import scipy.signal as ss

path, sr, meta = sys.argv[1], int(sys.argv[2]), json.load(open(sys.argv[3]))
if path.endswith('.npy'):
    y = np.load(path)
else:
    import soundfile as sf
    y, sr = sf.read(path, dtype='float64')
mono = y.mean(1)
f, tt, Z = ss.stft(mono, sr, nperseg=2048, noverlap=2048 - 256)
A = np.abs(Z) + 1e-9
L = 20 * np.log10(A)
hop = 256 / sr


def feat(tb):
    i = int(round(tb / hop))
    w = int(0.20 / hop)
    pre = L[:, max(0, i - w):i - 1].mean(1)
    post = L[:, i + 1:i + w].mean(1)
    band = (f > 60) & (f < 12000)
    dist = np.sqrt(((pre[band] - post[band]) ** 2).mean())      # spectral change across the bar line (dB)
    lvl = 10 * np.log10((A[:, i + 1:i + w] ** 2).sum(0).mean() / (A[:, max(0, i - w):i - 1] ** 2).sum(0).mean())
    return dist, lvl


def env_dip(tb, pre, post):
    a = int((tb - pre - 0.15) * sr); b = int((tb + post + 0.15) * sr)
    seg = mono[a:b]
    n = int(0.01 * sr)
    r = np.sqrt(np.convolve(seg ** 2, np.ones(n) / n, 'valid'))
    rd = 20 * np.log10(r + 1e-12)
    edge = np.r_[rd[:int(0.1 * sr)], rd[-int(0.1 * sr):]]
    return float(rd[int(0.15 * sr):-int(0.15 * sr)].min() - np.median(edge))


def clicks(tb, span=0.25):
    a = int((tb - span) * sr); b = int((tb + span) * sr)
    seg = mono[a:b]
    hp = ss.sosfilt(ss.butter(4, 6000, 'hp', fs=sr, output='sos'), seg)
    n = int(0.002 * sr)
    e = np.sqrt(np.convolve(hp ** 2, np.ones(n) / n, 'same'))
    return float(20 * np.log10(e.max() / (np.median(e) + 1e-12)))


bars = [b['t'] for b in meta['bars']]
joint_t = [j['joint_s'] for j in meta['joints']]
nat = []
for tb in bars:
    if tb < 1 or tb > len(mono) / sr - 1:
        continue
    if min(abs(tb - jt) for jt in joint_t) < 0.5:
        continue
    d, lv = feat(tb)
    nat.append((tb, d, lv, clicks(tb)))
nat = np.array(nat)
print('natural bar lines: n=%d  spectral change median %.2f dB, p90 %.2f, max %.2f; HF-click ratio median %.1f dB, p90 %.1f, max %.1f'
      % (len(nat), np.median(nat[:, 1]), np.percentile(nat[:, 1], 90), nat[:, 1].max(),
         np.median(nat[:, 3]), np.percentile(nat[:, 3], 90), nat[:, 3].max()))
for j in meta['joints']:
    tb = j['joint_s']
    d, lv = feat(tb)
    # rank against natural bar lines in the same neighbourhood (+-12 bars)
    near = nat[np.abs(nat[:, 0] - tb) < 12 * meta['bar']]
    pct = (near[:, 1] < d).mean() * 100
    c = clicks(tb)
    dip = env_dip(tb, j['pre'], j['post'])
    print('joint %.3f s: spectral change %.2f dB (higher than %.0f%% of nearby natural bar lines; nearby median %.2f, max %.2f), '
          'level step %+.1f dB, HF-click ratio %.1f dB, crossfade envelope dip %+.1f dB'
          % (tb, d, pct, np.median(near[:, 1]), near[:, 1].max(), lv, c, dip))
