import sys; sys.path.insert(0, sys.argv[0].rsplit('/', 1)[0])
import numpy as np, soundfile as sf, scipy.signal as ss, json
from kloud import short_term
x, sr = sf.read(sys.argv[1], dtype='float64')
hp = ss.sosfiltfilt(ss.butter(4, 250, 'high', fs=sr, output='sos'), x, axis=0)
out = []
for sig, nm in ((x, 'K'), (hp, '>250Hz')):
    tc, st = short_term(sig, sr, 3.0)
    r = []
    for a, b, n in [(1, 20, 'intro'), (23, 36, 'th1'), (57, 74, 's05'), (76, 96, 's06'), (112.3, 117.2, 'CLIMAX'), (122.5, 158, 'tail'), (161, 165.6, 'end')]:
        m = (tc >= a + 1.5) & (tc <= b - 1.5) if b - a > 3.5 else (tc >= a) & (tc <= b)
        r.append('%s %.1f' % (n, np.median(st[m])))
    out.append(nm + ': ' + ', '.join(r))
print(' | '.join(out))
m = json.load(open(sys.argv[2])); print('norm %.2f  maxGR %.2f  limited %.1f s  >1dB %.2f s' % (m['norm_gain_db'], m['limiter_max_gr_db'], m['limited_seconds'], m['over_1db_seconds']))
