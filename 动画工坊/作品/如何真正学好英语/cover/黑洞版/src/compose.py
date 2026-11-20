# Composite the HTML text layer over the graded render, with layer styles: dark backing,
# headline glow, white-hot glow on 记忆的黑洞, sub-line glow and light bar, blue wormhole glow
# on 虫洞, gold glow on 抢回来, headline bevel and warm rim light, then film grain.
# Usage: python3 compose.py <fmt> <out.png>
import json, os, sys
import numpy as np
from PIL import Image
from scipy import ndimage as ndi

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
WORK = os.path.join(ROOT, "work")
sys.path.insert(0, HERE)
from post import blur  # noqa: E402


def load(fmt, mode):
    a = np.asarray(Image.open(os.path.join(WORK, f"text_{fmt}_{mode}.png")).convert("RGBA"), dtype=np.float32) / 255.0
    return a[..., :3], a[..., 3]


def screen(base, add):
    return 1.0 - (1.0 - base) * (1.0 - np.clip(add, 0, 1))


def glow(alpha, spec, sc):
    g = np.zeros_like(alpha)
    for s, k in spec:
        g += k * blur(alpha, s * sc)
    return g


def main():
    fmt, outp = sys.argv[1], sys.argv[2]
    F = json.load(open(os.path.join(HERE, "formats.json")))[fmt]
    X = F["text"]["fx"]
    hole = F["post"]["hole_xy"]
    bg = np.load(os.path.join(WORK, f"bg_{fmt}.npy"))
    H, W = bg.shape[:2]
    sc = W / 3840.0
    rgb_all, a_all = load(fmt, "all")
    a = {m: load(fmt, m)[1] for m in ("mask", "head", "hot", "sub", "acc", "gold")}
    assert rgb_all.shape[:2] == (H, W), (rgb_all.shape, bg.shape)
    T = json.load(open(os.path.join(WORK, f"text_{fmt}.json")))
    k = W / T["cssW"]

    out = bg.copy()
    # 1. soft dark backing behind all text (separates type from stars and glow)
    s, kk = X["backing"]
    back = blur(a["mask"], s * sc)
    out *= (1.0 - kk * np.clip(back * 1.6, 0, 1))[..., None]
    # 2. glows
    out = screen(out, glow(a["head"], [X["glow1"], X["glow2"], X["glow3"]], sc)[..., None] * np.array(X["glow_col"], np.float32))
    out = screen(out, glow(a["hot"], X["hot_glow"], sc)[..., None] * np.array(X["hot_col"], np.float32))
    out = screen(out, glow(a["sub"], X["sub_glow"], sc)[..., None] * np.array(X["sub_col"], np.float32))
    out = screen(out, glow(a["acc"], X["acc_glow"], sc)[..., None] * np.array(X["acc_col"], np.float32))
    out = screen(out, glow(a["gold"], X["gold_glow"], sc)[..., None] * np.array(X["gold_col"], np.float32))
    # 3. thin light bar under the sub line: luminous hairline that fades at both ends
    B = X["bar"]
    x0, y0, x1, y1 = [v * k for v in T["rects"]["sub"]["box"]]
    yb = y1 + B["y_off"] * k
    xx = np.arange(W, dtype=np.float32)[None, :]
    yy = np.arange(H, dtype=np.float32)[:, None]
    cx, half = (x0 + x1) / 2, (x1 - x0) / 2 * B["len_frac"]
    u = np.clip(np.abs(xx - cx) / half, 0, 1)
    along = (1 - u ** 2) ** 2 * (0.35 + 0.65 * np.clip((xx - x0) / (x1 - x0), 0, 1))
    line = np.exp(-0.5 * ((yy - yb) / (B["thick"] * k / 2.355)) ** 2)
    halo = np.exp(-np.abs(yy - yb) / (B["glow"] * k))
    bar = along * (line * B["gain"] + halo * B["glow_gain"])
    out = screen(out, bar[..., None] * np.array(B["col"], np.float32))
    # 4. text fill (CSS gradients / colours)
    out = out * (1 - a_all[..., None]) + rgb_all * a_all[..., None]
    # 5. bevel on the headline: light from above, slightly from the hole side
    ah = a["head"]
    hgt = blur(ah, X["bevel_sigma"] * sc)
    gy, gx = np.gradient(hgt)
    hx, hy = hole[0] * W, hole[1] * H
    cy_, cx_ = np.mean(np.argwhere(ah > 0.5), axis=0)
    n = np.hypot(hx - cx_, hy - cy_)
    lx, ly = 0.35 * (hx - cx_) / n, -0.94 + 0.35 * (hy - cy_) / n
    ln = np.hypot(lx, ly)
    lx, ly = lx / ln, ly / ln
    shade = (gx * lx + gy * ly) / (np.hypot(gx, gy).max() + 1e-6)
    hi = np.clip(shade, 0, None) * ah
    lo = np.clip(-shade, 0, None) * ah
    out = out + (X["bevel_hi"] * hi * 2.2)[..., None] - (X["bevel_lo"] * lo * 2.2)[..., None] * out
    # 6. warm rim light on the headline edges that face the black hole
    dx, dy = (hx - cx_) / n, (hy - cy_) / n
    shifted = ndi.shift(ah, (-dy * X["rim_px"] * sc * 2, -dx * X["rim_px"] * sc * 2), order=1, mode="constant")
    rim = np.clip(ah - shifted, 0, 1)
    out = screen(out, (rim * X["rim_gain"])[..., None] * np.array(X["rim_col"], np.float32))
    out = np.clip(out, 0, 1)
    # 7. film grain (seeded), softer on the type
    rng = np.random.default_rng(20261119)
    g = rng.normal(0, 1, (H, W)).astype(np.float32)
    g = ndi.gaussian_filter(g, 0.55 * max(sc, 0.5) * 2) * 1.9
    L = out.mean(axis=2)
    amp = X["grain"] * (0.45 + 1.6 * L * (1 - L)) * (1 - (1 - X["grain_text"]) * a["mask"])
    out = out + (g * amp)[..., None]
    d = rng.uniform(-0.5, 0.5, (H, W, 1)).astype(np.float32) / 255.0
    img = np.clip(out + d, 0, 1)
    Image.fromarray((img * 255 + 0.5).astype(np.uint8)).save(outp)
    print("composed", fmt, W, H, "->", outp)


if __name__ == "__main__":
    main()
