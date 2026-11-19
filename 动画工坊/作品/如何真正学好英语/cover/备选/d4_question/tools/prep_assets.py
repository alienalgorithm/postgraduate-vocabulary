# Build cover assets from the 4K film stills:
#   assets/brain.png  RGBA cut-out of the golden brain (s08 end, 124.6 s), background removed, halo kept
#   assets/wf.png     the s03 forgetting waterfall (30.0 s, text and axes hidden), JPEG-free PNG copy
import numpy as np
from PIL import Image
from scipy import ndimage as ndi
D = '/tmp/claude-0/-home-user-postgraduate-vocabulary/3d87cc6c-41dd-58c2-802f-d51dc0c78527/scratchpad/cv/d4_question'
a = np.asarray(Image.open(D + '/stills/c_124.6.png').convert('RGB')).astype(np.float32)
x0, y0, x1, y1 = 1180, 520, 2680, 2160
c = a[y0:y1, x0:x1]
L = c.mean(2)
# background estimate: heavy median of the border ring -> smooth field
bg = ndi.gaussian_filter(np.where(L < 55, L, np.nan).copy(), 1) if False else None
core = L > 70
core = ndi.binary_closing(core, iterations=12)
core = ndi.binary_fill_holes(core)
lab, n = ndi.label(core); sizes = ndi.sum(core, lab, range(1, n + 1)); core = lab == (1 + int(np.argmax(sizes)))
core = ndi.binary_erosion(core, iterations=2)
soft = ndi.gaussian_filter(core.astype(np.float32), 2.0)
# halo: keep the glow outside the shape, proportional to brightness above the dark floor
floor = 34.0
halo = np.clip((L - floor) / 90.0, 0, 1) ** 1.2
alpha = np.maximum(soft, halo)
# un-premultiply against the brown floor so the halo colour stays golden, not muddy
bgc = np.array([24, 18, 9], np.float32)
rgb = np.where(alpha[..., None] > 1e-3, (c - bgc * (1 - alpha[..., None])) / np.maximum(alpha[..., None], 1e-3), 0)
rgb = np.clip(rgb, 0, 255)
out = np.dstack([rgb, alpha * 255]).astype(np.uint8)
im = Image.fromarray(out, 'RGBA')
bb = im.getbbox(); print('brain crop', (x0, y0, x1, y1), 'alpha bbox', bb, 'core bbox', ndi.find_objects(core.astype(int))[0])
im.save(D + '/assets/brain.png')
Image.open(D + '/stills/k_30.png').convert('RGB').save(D + '/assets/wf.png')
print('ok')

# assets/figure.png  RGBA cut-out of the lonely learner (s03, 30.0 s), backpack interior kept opaque
k = np.asarray(Image.open(D + '/stills/k_30.png').convert('RGB')).astype(np.float32)
fx0, fy0, fx1, fy1 = 236, 1326, 430, 1936
f = k[fy0:fy1, fx0:fx1]
Lf = f.mean(2)
m = ndi.binary_fill_holes(ndi.binary_closing(Lf > 55, iterations=3))
lab, n = ndi.label(m); sizes = ndi.sum(m, lab, range(1, n + 1)); m = lab == (1 + int(np.argmax(sizes)))
sm = ndi.gaussian_filter(m.astype(np.float32), 0.9)
halo = np.clip((Lf - 16) / 70.0, 0, 1)
af = np.maximum(sm, halo * 0.9)
fbg = np.array([8, 11, 17], np.float32)
frgb = np.clip(np.where(af[..., None] > 1e-3, (f - fbg * (1 - af[..., None])) / np.maximum(af[..., None], 1e-3), 0), 0, 255)
Image.fromarray(np.dstack([frgb, af * 255]).astype(np.uint8), 'RGBA').save(D + '/assets/figure.png')
print('figure', (fx0, fy0, fx1, fy1), 'mask bbox', ndi.find_objects(m.astype(int))[0])

# waterfall layer without the learner (he is placed as his own layer): paint his box with the night colour, feathered
w = k.copy()
yy, xx = np.mgrid[0:w.shape[0], 0:w.shape[1]]
box = np.zeros(w.shape[:2], np.float32); box[1300:1960, 220:446] = 1
box = ndi.gaussian_filter(box, 10)
w = w * (1 - box[..., None]) + fbg * box[..., None]
Image.fromarray(np.clip(w, 0, 255).astype(np.uint8), 'RGB').save(D + '/assets/wf.png')
print('wf saved')
