# spectrogram panels of the finished backup score (whole score + the edit points that matter for the picture)
import sys, numpy as np, soundfile as sf, scipy.signal as ss
import matplotlib; matplotlib.use('Agg'); import matplotlib.pyplot as plt
x, sr = sf.read(sys.argv[1], dtype='float64'); m = x.mean(1)
f, t, Z = ss.stft(m, sr, nperseg=4096, noverlap=4096 - 512); S = 20 * np.log10(np.abs(Z) + 1e-9)
regions = [(0, 169.342, 'whole score (cyan: scene starts and anchors)'), (50.0, 57.5, 'breath, swell into lead-in bar 53.04, theme 55.592'),
           (84.5, 88.0, 'two-bar repeat seam 86.230'), (109.5, 123.5, 'gap, explosion 111.842, stop 117.467, hall tail, return 121.217'),
           (155, 169.342, 'method card 158.092, ending, release')]
fig, ax = plt.subplots(5, 1, figsize=(14, 16))
for a_, (a, b, nm) in zip(ax, regions):
    sel = (t >= a) & (t <= b); fs = f <= 16000
    a_.pcolormesh(t[sel], f[fs], S[np.ix_(fs, sel)], vmin=-120, vmax=-20, shading='auto', cmap='magma')
    a_.set_yscale('symlog', linthresh=200); a_.set_ylim(30, 16000); a_.set_title(nm)
    for v in [0, 11.217, 22.467, 35.592, 55.592, 74.342, 96.842, 111.842, 117.467, 121.217, 124.967, 143.092, 158.092, 165.592]:
        if a <= v <= b: a_.axvline(v, color='c', lw=0.8)
plt.tight_layout(); plt.savefig(sys.argv[2], dpi=70)
