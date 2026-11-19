# Movie-poster grade for the cover background.
# python3 grade.py <in.png> <out.png> --sun X Y (pixels in the full render) [--crop X0 W] [--warm 0..1]
# bloom on highlights (warm), gentle S-curve, cool deep shadows + golden highlights, sky top pushed to deep indigo,
# light falloff (vignette) centred near the sun. Pure numpy/PIL; deterministic.
import sys
import numpy as np
from PIL import Image, ImageFilter

import argparse
ap = argparse.ArgumentParser(); ap.add_argument('src'); ap.add_argument('dst')
ap.add_argument('--sun', nargs=2, type=float, required=True); ap.add_argument('--crop', nargs=2, type=int)
ap.add_argument('--warm', type=float, default=0.35)
ap.add_argument('--legs', nargs=4, type=float, help='cx cy rx ry (full-render px): dim the river around the learner, never the figure')
a = ap.parse_args(); src, dst, WARM = a.src, a.dst, a.warm
im = Image.open(src).convert('RGB')
sunx, suny = a.sun
if a.crop:
    im = im.crop((a.crop[0], 0, a.crop[0] + a.crop[1], im.size[1])); sunx -= a.crop[0]
x = np.asarray(im, dtype=np.float32) / 255.0
if a.legs:
    # the film dims the river at the learner's feet so the figure reads; do a little more of the same here.
    # The white line figure (blue channel > ~0.8) is protected, only the orange river around it gets darker.
    lcx, lcy, lrx, lry = a.legs
    if a.crop: lcx -= a.crop[0]
    hh, ww = x.shape[:2]; yy0, xx0 = np.mgrid[0:hh, 0:ww].astype(np.float32)
    e = np.clip(1 - np.sqrt(((xx0 - lcx) / lrx) ** 2 + ((yy0 - lcy) / lry) ** 2), 0, 1) ** 0.8
    fig = np.clip((x[..., 2] - 0.62) / 0.22, 0, 1)
    x = x * (1 - 0.5 * e * (1 - fig))[..., None]
    del yy0, xx0, e, fig
W, H = im.size
sx, sy = sunx / W, suny / H
lum = 0.2126 * x[..., 0] + 0.7152 * x[..., 1] + 0.0722 * x[..., 2]

def blur(arr, sigma, down=4):
    h, w = arr.shape[:2]
    small = Image.fromarray(np.clip(arr * 255, 0, 255).astype(np.uint8)).resize((w // down, h // down), Image.BILINEAR)
    small = small.filter(ImageFilter.GaussianBlur(sigma / down))
    return np.asarray(small.resize((w, h), Image.BILINEAR), dtype=np.float32) / 255.0

# bloom: bright parts only, two radii, warm tint
mask = np.clip((lum - 0.55) / 0.45, 0, 1) ** 1.6
bright = x * mask[..., None]
bloom = 0.42 * blur(bright, 22) + 0.55 * blur(bright, 90, 8)
tint = np.array([1.0, 0.80, 0.52], np.float32)
x = 1 - (1 - x) * (1 - np.clip(bloom * tint, 0, 1))          # screen

# S-curve (filmic contrast)
s = x * x * (3 - 2 * x)
x = x + 0.28 * (s - x)

# split tone: cool deep shadows, golden highlights
lum = 0.2126 * x[..., 0] + 0.7152 * x[..., 1] + 0.0722 * x[..., 2]
sh = np.clip(1 - lum / 0.35, 0, 1) ** 2
x = x + sh[..., None] * np.array([-0.018, 0.004, 0.030], np.float32)
hi = np.clip((lum - 0.45) / 0.55, 0, 1)
x = x * (1 + hi[..., None] * np.array([0.05, 0.015, -0.10], np.float32))

# sky: magenta toward warm rose-gold near the horizon, top toward deep indigo (only above the horizon)
yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
v = yy / H
sky = np.clip((sy - v) / sy, 0, 1)               # 1 at top, 0 at horizon
top = sky ** 1.6
x = x * (1 - 0.42 * top[..., None]) + top[..., None] * np.array([0.010, 0.014, 0.040], np.float32)
# pull the magenta a little toward amber in the middle sky band
band = np.clip(1 - np.abs(v - sy * 0.62) / (sy * 0.45), 0, 1) * (v < sy)
mag = np.clip((x[..., 0] - x[..., 1]) * 1.5, 0, 1) * np.clip((x[..., 2] - x[..., 1]) * 2.0, 0, 1)
k = (WARM * band * mag)[..., None]
x = x * (1 - k) + k * np.stack([x[..., 0] * 1.02, x[..., 1] * 1.0 + 0.10 * x[..., 0], x[..., 2] * 0.62], -1)

# light falloff around the sun
d = np.sqrt(((xx / W - sx) * (W / H)) ** 2 + (v - sy) ** 2)
vig = 1 - 0.38 * np.clip((d - 0.35) / 1.15, 0, 1) ** 1.3
x = x * vig[..., None]

out = np.clip(x * 255 + 0.5, 0, 255).astype(np.uint8)
Image.fromarray(out).save(dst, optimize=False, compress_level=3)
print(dst, W, H)
