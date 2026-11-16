#!/usr/bin/env python3
"""Procedural parchment page (no third-party art): warm base, soft mottling, fine grain, faint fibres, a few
foxing spots, darker uneven edges and a gutter shade on the spine side. Seeded, so every build is identical.
Writes parchment-recto.jpg (spine on the left) and parchment-verso.jpg (mirror)."""
import sys
from pathlib import Path
import numpy as np
from PIL import Image, ImageFilter

W, H = 1040, 1477                     # B5 176x250 mm at 150 dpi; the texture is soft, so this is ample
rng = np.random.default_rng(20261116)

def smooth_noise(scale, octaves=4):
    out = np.zeros((H, W))
    for o in range(octaves):
        s = max(2, int(scale / 2 ** o))
        g = rng.random((H // s + 2, W // s + 2))
        im = Image.fromarray((g * 255).astype(np.uint8)).resize((W + 2 * s, H + 2 * s), Image.BICUBIC)
        out += (np.asarray(im, float)[s:s + H, s:s + W] / 255 - 0.5) / 2 ** o
    return out

base = np.array([238, 225, 196], float)                     # parchment
edge = np.array([222, 200, 160], float)                     # aged edge (user 2026-11-16: lighter edges)
y, x = np.mgrid[0:H, 0:W]
dx = np.minimum(x, W - 1 - x) / W; dy = np.minimum(y, H - 1 - y) / H
d = np.minimum(dx * 1.0, dy * 0.70)                         # distance to nearest edge (page units)
wobble = smooth_noise(160, 3) * 0.035
t = np.clip(1 - (d + wobble) / 0.06, 0, 1) ** 2.6 * 0.85    # 0 inside, up to 0.85 at the edge
gutter = np.clip(1 - x / (W * 0.09), 0, 1) ** 2.4 * 0.22     # spine side (left on a recto)
mott = smooth_noise(220, 5)
grain = rng.normal(0, 1, (H, W))
fib = np.asarray(Image.fromarray(((rng.random((H, W)) > 0.9985) * 255).astype(np.uint8)).filter(
    ImageFilter.GaussianBlur(0.6)).resize((W, H)), float) / 255
fib = np.asarray(Image.fromarray((fib * 255).astype(np.uint8)).filter(ImageFilter.BoxBlur(1)), float) / 255
img = base[None, None, :] * np.ones((H, W, 1))
img += mott[..., None] * np.array([11, 11, 13])            # gentle mottling
img += grain[..., None] * 2.6
img -= fib[..., None] * np.array([10, 12, 16])
mix = np.clip(t + gutter, 0, 1)[..., None]
img = img * (1 - mix) + edge * mix + mott[..., None] * mix * 9
for _ in range(9):                                          # faint foxing spots, mostly near the margins
    cy, cx = rng.integers(0, H), rng.choice([rng.integers(0, W // 6), rng.integers(W * 5 // 6, W), rng.integers(0, W)])
    r = rng.uniform(6, 20); a = rng.uniform(0.03, 0.07)
    m = np.exp(-(((y - cy) ** 2 + (x - cx) ** 2) / (2 * r * r)))[..., None]
    img = img * (1 - m * a) + np.array([170, 120, 70]) * m * a
img = np.clip(img, 0, 255).astype(np.uint8)
out = Path(sys.argv[1]); out.mkdir(parents=True, exist_ok=True)
Image.fromarray(img).save(out / 'parchment-recto.jpg', quality=84, subsampling=0, optimize=True)
Image.fromarray(img[:, ::-1]).save(out / 'parchment-verso.jpg', quality=84, subsampling=0, optimize=True)
print('ok', [(p.name, p.stat().st_size) for p in sorted(out.glob('parchment-*.jpg'))])
