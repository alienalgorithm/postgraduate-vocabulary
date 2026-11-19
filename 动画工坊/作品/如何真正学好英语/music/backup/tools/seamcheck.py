# Objective seam check: each edit seam vs every natural bar line of the same output audio.
# usage: python3 -I seamcheck.py <audio.npy|.wav> <sr> <edit_meta.json>
import sys, json, numpy as np, scipy.signal as ss
path, sr, meta = sys.argv[1], int(sys.argv[2]), json.load(open(sys.argv[3]))
if path.endswith('.npy'): y = np.load(path)
else:
    import soundfile as sf; y, sr = sf.read(path, dtype='float64')
mono = y.mean(1)
f, tt, Z = ss.stft(mono, sr, nperseg=2048, noverlap=2048 - 256)
A = np.abs(Z) + 1e-9; L = 20 * np.log10(A); hop = 256 / sr
band = (f > 60) & (f < 12000)
def feat(tb):
    i = int(round(tb / hop)); w = int(0.20 / hop)
    pre = L[:, max(0, i - w):i - 1].mean(1); post = L[:, i + 1:i + w].mean(1)
    dist = np.sqrt(((pre[band] - post[band]) ** 2).mean())
    lvl = 10 * np.log10((A[:, i + 1:i + w] ** 2).sum(0).mean() / (A[:, max(0, i - w):i - 1] ** 2).sum(0).mean())
    return dist, lvl
def clicks(tb, span=0.25):
    a = int((tb - 2 * span) * sr); b = int((tb + 2 * span) * sr); k = int(span * sr)
    hp = ss.sosfiltfilt(ss.butter(4, 6000, 'hp', fs=sr, output='sos'), mono[a:b])
    n = int(0.002 * sr); e = np.sqrt(np.convolve(hp ** 2, np.ones(n) / n, 'same'))[k:-k]   # edges dropped
    return float(20 * np.log10(e.max() / (np.median(e) + 1e-12)))
def env_dip(tb, pre, post):
    a = int((tb - pre - 0.15) * sr); b = int((tb + post + 0.15) * sr); seg = mono[a:b]
    n = int(0.01 * sr); rd = 20 * np.log10(np.sqrt(np.convolve(seg ** 2, np.ones(n) / n, 'valid')) + 1e-12)
    edge = np.r_[rd[:int(0.1 * sr)], rd[-int(0.1 * sr):]]
    return float(rd[int(0.15 * sr):-int(0.15 * sr)].min() - np.median(edge))
seam_t = [s['at'] for s in meta['seams']]
nat = []
for b in meta['bars']:
    tb = b['t']
    if tb < 1 or tb > len(mono) / sr - 1 or min(abs(tb - s) for s in seam_t) < 0.5: continue
    d, lv = feat(tb); nat.append((tb, d, lv, clicks(tb), env_dip(tb, 0.05, 0.05)))
nat = np.array(nat)
print('natural bar lines n=%d: spectral change median %.2f dB (p90 %.2f, max %.2f); HF-click median %.1f dB (p90 %.1f, max %.1f); 10 ms envelope dip median %+.1f dB'
      % (len(nat), np.median(nat[:, 1]), np.percentile(nat[:, 1], 90), nat[:, 1].max(), np.median(nat[:, 3]), np.percentile(nat[:, 3], 90), nat[:, 3].max(), np.median(nat[:, 4])))
for s in meta['seams']:
    tb = s['at']; d, lv = feat(tb)
    near = nat[np.abs(nat[:, 0] - tb) < 12 * meta['bar']]
    print('seam %8.3f: spectral change %5.2f dB (> %3.0f%% of nearby natural bar lines; nearby median %.2f max %.2f), level step %+5.1f dB, HF-click %4.1f dB (nearby max %.1f), dip %+5.1f dB (nearby median %+.1f)  [%s]'
          % (tb, d, (near[:, 1] < d).mean() * 100, np.median(near[:, 1]), near[:, 1].max(), lv, clicks(tb), near[:, 3].max(), env_dip(tb, s['pre'], s['post']), np.median(near[:, 4]), s['note'][:28]))
