# The s02/s03 city of words (22.2 s, every window holds a real exam word) with its lights going out from the left
# and coming back gold toward the light on the right (s03 lights-out, s08 golden re-lighting).
# Writes assets/city_<ver>.png at still resolution (3840x2160); cover.html positions it.
import sys, numpy as np
from PIL import Image
from scipy import ndimage as ndi
D = '/tmp/claude-0/-home-user-postgraduate-vocabulary/3d87cc6c-41dd-58c2-802f-d51dc0c78527/scratchpad/cv/d4_question'
src = np.asarray(Image.open(D + '/stills/k_22.2.png').convert('RGB')).astype(np.float32)
a = src.copy()
# 1. remove the learner standing at x 899..1119, y 1400..1967 (he is placed as his own layer): clone the strip 210 px to the left
m = np.zeros(a.shape[:2], np.float32); m[1385:2000, 885:1085] = 1; m = ndi.gaussian_filter(m, 8)
shifted = np.roll(a, 210, axis=1)
a = a * (1 - m[..., None]) + shifted * m[..., None]
# 2. find the windows
L = a.mean(2)
mask = ndi.binary_closing(L > 112, iterations=3)
lab, n = ndi.label(mask)
objs = ndi.find_objects(lab)
wins = []
for i, o in enumerate(objs):
    y0, y1, x0, x1 = o[0].start, o[0].stop, o[1].start, o[1].stop
    w, h = x1 - x0, y1 - y0
    if y1 > 1720 or w > 160 or h > 70 or w < 4 or h < 4: continue      # skip reflections, crowns, slivers
    wins.append((x0, y0, x1, y1))
print('windows', len(wins))

def smooth(e0, e1, x): t = np.clip((x - e0) / (e1 - e0), 0, 1); return t * t * (3 - 2 * t)

def build(ver, xL, xR, seed):
    rng = np.random.default_rng(seed)
    out = a.copy()
    lit = np.zeros(a.shape[:2], np.float32)
    cnt = {'off': 0, 'ghost': 0, 'cold': 0, 'gold': 0}
    for (x0, y0, x1, y1) in wins:
        t = ((x0 + x1) / 2 - xL) / (xR - xL)
        pg = smooth(0.58, 0.92, t)
        pc = (1 - pg) * (0.06 + 0.42 * smooth(0.15, 0.7, t))
        r = rng.random()
        st = 'gold' if r < pg else 'cold' if r < pg + pc else ('ghost' if rng.random() < 0.38 else 'off')
        cnt[st] += 1
        pad = 3
        ys, xs = slice(max(0, y0 - pad), y1 + pad), slice(max(0, x0 - pad), x1 + pad)
        reg = a[ys, xs]
        ring = np.concatenate([a[max(0, y0 - pad - 3):max(0, y0 - pad), xs].reshape(-1, 3), a[y1 + pad:y1 + pad + 3, xs].reshape(-1, 3)])
        wall = np.median(ring, 0) if len(ring) else np.array([20, 28, 50], np.float32)
        wall = np.minimum(wall, [40, 52, 84])
        if st == 'off':   out[ys, xs] = wall * 0.85 + (reg - wall) * 0.035
        elif st == 'ghost': out[ys, xs] = wall + (reg - wall) * 0.16
        elif st == 'gold':
            lum = np.clip((reg.mean(2) - 50) / 170, 0, 1)[..., None]
            out[ys, xs] = np.array([66, 38, 12]) * (1 - lum) + np.array([255, 212, 132]) * lum
        if st in ('cold', 'gold'): lit[ys, xs] = 1
    # lights out: the walls, haze and reflections fade toward the left; lit windows keep their light
    xs_ = np.arange(out.shape[1], dtype=np.float32)
    f = 0.42 + 0.58 * smooth(0.05, 0.8, (xs_ - xL) / (xR - xL))
    keep = ndi.gaussian_filter(lit, 1.5)[..., None]
    out = out * (keep + (1 - keep) * f[None, :, None])
    print(ver, cnt)
    Image.fromarray(np.clip(out, 0, 255).astype(np.uint8), 'RGB').save(D + f'/assets/city_{ver}.png')

build('16x9', 300, 2900, 1)
build('4x3', 300, 2900, 2)
