# Finishing of the HDR black hole render: foreground ridge + astronaut, horizon glow,
# bloom, anamorphic streaks, diffraction spikes, filmic tone map, grade, vignette.
# Deterministic (seeded). Usage: python3 post.py <fmt> [--preview]
# In : work/hdr_<fmt>.f32 (linear RGB float32, rows bottom-to-top)
# Out: work/bg_<fmt>.npy (display-referred float32 0..1, text-free, no grain)
#      work/bg_<fmt>.png (8-bit preview) and work/fg_<fmt>.json (astronaut/ridge geometry)
import json, os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import numpy as np
from PIL import Image, ImageDraw
from scipy import ndimage as ndi

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
WORK = os.path.join(ROOT, "work")


def blur(img, sigma):
    """Gaussian blur; large sigmas run on a downsampled copy (pyramid) for speed."""
    if sigma <= 6:
        return ndi.gaussian_filter(img, (sigma, sigma, 0) if img.ndim == 3 else sigma, mode="nearest")
    f = int(2 ** np.floor(np.log2(sigma / 3.0)))
    h, w = img.shape[:2]
    hs, ws = (h + f - 1) // f, (w + f - 1) // f
    pad = ((0, hs * f - h), (0, ws * f - w)) + (((0, 0),) if img.ndim == 3 else ())
    p = np.pad(img, pad, mode="edge")
    small = p.reshape(hs, f, ws, f, *img.shape[2:]).mean(axis=(1, 3))
    s = sigma / f
    small = ndi.gaussian_filter(small, (s, s, 0) if img.ndim == 3 else s, mode="nearest")
    zoom = (f, f, 1) if img.ndim == 3 else (f, f)
    up = ndi.zoom(small, zoom, order=1, mode="nearest", grid_mode=True)
    return up[:h, :w]


def aces(x):
    return np.clip((x * (2.51 * x + 0.03)) / (x * (2.43 * x + 0.59) + 0.14), 0, 1)


def srgb(x):
    x = np.clip(x, 0, 1)
    return np.where(x <= 0.0031308, 12.92 * x, 1.055 * np.power(x, 1 / 2.4) - 0.055)


def lum(x):
    return 0.2126 * x[..., 0] + 0.7152 * x[..., 1] + 0.0722 * x[..., 2]


# ---------------------------------------------------------------- foreground
P_DECAY = 0.6


def ridge_profile(W, rng, base, peak_x, peak_y, amp, rough, summit=True):
    """Rocky ridge line (y in px from top) whose highest point is the summit (peak_x, peak_y)."""
    x = np.arange(W, dtype=np.float64)
    d = (x - peak_x) / W
    # mountain shape: steep near the summit, flattening out towards the frame edges
    y = peak_y + amp * (1 - np.exp(-(np.abs(d) / 0.16) ** 1.6)) + amp * 0.35 * np.abs(d)
    # midpoint-displacement roughness, starting at mid frequencies
    prof = rng.normal(0, rough, 17)
    scale = rough * 0.55
    while len(prof) < W:
        mid = (prof[:-1] + prof[1:]) / 2 + rng.normal(0, scale, len(prof) - 1)
        new = np.empty(len(prof) * 2 - 1)
        new[0::2] = prof
        new[1::2] = mid
        prof = new
        scale *= P_DECAY
    prof = np.interp(np.linspace(0, len(prof) - 1, W), np.arange(len(prof)), prof)
    prof -= np.interp(peak_x, x, prof)
    taper = 1 - np.exp(-(np.abs(d) / 0.025) ** 2)
    y = y + prof * taper
    if not summit:          # far ridge: free crest line (a clamp here cuts flat mesa tops)
        return y
    # the summit is the highest point; a small flat spot to stand on
    y = np.maximum(y, peak_y + 0.004 * W * np.abs(d) * 10)
    spot = np.exp(-((x - peak_x) / (W * 0.006)) ** 2)
    return y * (1 - spot) + peak_y * spot


def astronaut_mask(height, ss=8):
    """Back view of a standing astronaut, feet at the bottom centre. Returns float alpha."""
    H = int(height)
    Wd = int(height * 0.62)
    S = ss
    im = Image.new("L", (Wd * S, (H + 4) * S), 0)
    d = ImageDraw.Draw(im)
    u = H / 100.0  # design units: 100 = full height

    def P(x, y):
        return ((Wd / 2 + x * u) * S, (H - y * u) * S)

    def ell(cx, cy, rx, ry):
        (x0, y0), (x1, y1) = P(cx - rx, cy + ry), P(cx + rx, cy - ry)
        d.ellipse([x0, y0, x1, y1], fill=255)

    def poly(pts):
        d.polygon([P(*p) for p in pts], fill=255)

    def rrect(x0, y0, x1, y1, r):
        (a, b), (c, e) = P(x0, y1), P(x1, y0)
        d.rounded_rectangle([a, b, c, e], radius=r * u * S, fill=255)

    ell(0, 88, 10.5, 10.5)                          # helmet
    rrect(-14.5, 47, 14.5, 80, 5)                   # backpack (life support)
    rrect(-13, 40, 13, 78, 6)                       # torso
    poly([(-12.5, 76), (-17.5, 72), (-20.5, 52), (-19, 41), (-14.5, 41), (-15, 52), (-11.5, 66)])   # left arm
    ell(-17.2, 40.5, 3.2, 3.6)                      # left glove
    poly([(12.5, 76), (17.5, 72), (21.5, 55), (21.5, 45), (17.5, 44.5), (16.5, 54), (11.5, 66)])    # right arm, slightly out
    ell(19.6, 44, 3.2, 3.6)                         # right glove
    poly([(-12.5, 43), (-1.5, 43), (-2.2, 5), (-10.8, 5)])      # left leg
    poly([(1.5, 43), (12.5, 43), (11.2, 5), (2.6, 5)])          # right leg
    rrect(-12.5, 0, -1.2, 7, 2)                     # boots
    rrect(1.6, 0, 13.2, 7, 2)
    d.line([P(9, 80), P(10.5, 96)], fill=255, width=max(1, int(1.1 * u * S)))   # antenna
    ell(10.5, 96.5, 0.9, 0.9)
    small = im.resize((Wd, H + 4), Image.LANCZOS)
    return np.asarray(small, dtype=np.float32) / 255.0


def build_foreground(W, H, P, rng):
    """Returns (alpha, rim) arrays (H, W) for ridge + astronaut and geometry info."""
    yy = np.arange(H, dtype=np.float32)[:, None]
    near = ridge_profile(W, rng, P["ridge_base"] * H, P["astro_x"] * W, P["astro_feet"] * H,
                         P["ridge_amp"] * H, P["ridge_rough"] * H)
    far = ridge_profile(W, rng, P["far_base"] * H, P["far_peak_x"] * W, P["far_peak_y"] * H,
                        P["far_amp"] * H, P["far_rough"] * H, summit=False)
    # anti-aliased fills (vertical coverage of each column)
    a_near = np.clip(yy - near[None, :].astype(np.float32) + 0.5, 0, 1)
    a_far = np.clip(yy - far[None, :].astype(np.float32) + 0.5, 0, 1)
    # astronaut
    ah = int(P["astro_h"] * H)
    m = astronaut_mask(ah)
    mh, mw = m.shape
    ax = int(round(P["astro_x"] * W - mw / 2))
    ay = int(round(P["astro_feet"] * H - (mh - 4) + 1))
    a_ast = np.zeros((H, W), np.float32)
    if P.get("astro_on", True):
        a_ast[ay:ay + mh, ax:ax + mw] = m
    return near, far, a_near, a_far, a_ast, (ax, ay, mw, mh)


def rim_light(alpha, dx, dy, width):
    """Thin highlight on the edges of a silhouette that face direction (dx, dy)."""
    sh = ndi.shift(alpha, (-dy * width, -dx * width), order=1, mode="constant")
    return np.clip(alpha - sh, 0, 1)


# ---------------------------------------------------------------- effects
def streaks(hdr, thr, length, tint):
    """Anamorphic horizontal streak from very bright areas."""
    L = lum(hdr)
    b = np.clip(L - thr, 0, None)
    b = np.minimum(b, thr * 6)
    rows = b
    # exponential two-sided kernel via forward/backward IIR filter
    k = np.exp(-1.0 / length)
    from scipy.signal import lfilter
    f = lfilter([1 - k], [1, -k], rows, axis=1)
    g = lfilter([1 - k], [1, -k], rows[:, ::-1], axis=1)[:, ::-1]
    s = (f + g) * 0.5
    s = ndi.gaussian_filter1d(s, 1.6, axis=0)
    return s[..., None] * np.array(tint, np.float32)[None, None, :]


def spikes(H, W, stars, P):
    """Diffraction spikes (4 rays) and soft halo for the chosen bright stars."""
    out = np.zeros((H, W, 3), np.float32)
    ang0 = np.deg2rad(P.get("spike_angle", 12.0))
    for (y, x, b, col) in stars:
        L = P["spike_len"] * P.get("_sc", 1.0) * min(1.0, b ** 0.5)
        r = int(L) + 4
        y0, y1, x0, x1 = max(0, y - r), min(H, y + r + 1), max(0, x - r), min(W, x + r + 1)
        Y, X = np.mgrid[y0:y1, x0:x1].astype(np.float32)
        dy, dx = Y - y, X - x
        acc = np.zeros_like(dx)
        for k in range(4):
            a = ang0 + k * np.pi / 2
            along = dx * np.cos(a) + dy * np.sin(a)
            across = -dx * np.sin(a) + dy * np.cos(a)
            m = (along > 0)
            acc += m * np.exp(-np.abs(along) / (L * 0.28)) * np.exp(-0.5 * (across / 0.9) ** 2)
        rr = np.sqrt(dx * dx + dy * dy)
        halo = np.exp(-rr / (L * 0.05)) * 0.6 + np.exp(-rr / (L * 0.18)) * 0.08
        v = (acc * 0.9 + halo) * b * P["spike_gain"]
        out[y0:y1, x0:x1] += v[..., None] * np.array(col, np.float32)[None, None, :]
    return out


def pick_stars(hdr, diskmask, n, rng, allow):
    L = lum(hdr)
    Lm = np.where(diskmask, 0, L)
    mx = ndi.maximum_filter(Lm, size=25)
    cand = np.argwhere((Lm == mx) & (Lm > 0.3))
    vals = Lm[cand[:, 0], cand[:, 1]]
    order = np.argsort(-vals)
    picked = []
    for i in order:
        y, x = cand[i]
        if not any(x0 <= x <= x1 and y0 <= y <= y1 for (x0, y0, x1, y1) in allow):
            continue
        if any((y - py) ** 2 + (x - px) ** 2 < (hdr.shape[0] * 0.2) ** 2 for (py, px, _, _) in picked):
            continue
        c = hdr[y, x] / max(1e-6, hdr[y, x].max())
        picked.append((int(y), int(x), float(vals[i]), tuple(0.55 + 0.45 * c)))
        if len(picked) >= n:
            break
    return picked


def main():
    fmt = sys.argv[1]
    F = json.load(open(os.path.join(HERE, "formats.json")))[fmt]
    R, P = F["render"], F["post"]
    Rr = json.load(open(os.path.join(WORK, f"rcfg_{fmt}.json")))
    W, H = Rr["W"], Rr["H"]
    rng = np.random.default_rng(P.get("seed", 1119))
    hdr = np.fromfile(os.path.join(WORK, f"hdr_{fmt}.f32"), dtype=np.float32).reshape(H, W, 3)[::-1].copy()
    hdr *= P["exposure"]

    # where the disk/hole is (for spike selection and the shadow-centre check)
    diskmask = blur(lum(hdr), 6) > P.get("disk_thr", 0.35)
    diskmask = ndi.binary_dilation(diskmask, iterations=20)

    # ---- sky shaping: deepen the background towards blue-black, keep the disk
    if P.get("sky_gain", 1.0) != 1.0:
        skyw = 1.0 - np.clip(blur(diskmask.astype(np.float32), 30), 0, 1)
        hdr *= (1.0 - skyw * (1.0 - P["sky_gain"]))[..., None]

    # ---- foreground ridge, astronaut, horizon glow
    near, far, a_near, a_far, a_ast, abox = build_foreground(W, H, P, rng)
    xx = np.arange(W, dtype=np.float32)[None, :]
    yy = np.arange(H, dtype=np.float32)[:, None]
    gx = P["glow_x"] * W
    lat = np.exp(-((xx - gx) / (P["glow_w"] * W)) ** 2)
    far_s = ndi.gaussian_filter1d(np.minimum(far, near), 0.04 * W, mode="nearest")   # smooth anchor: no vertical stripes
    above = np.clip(far_s[None, :] - yy, 0, None)
    hg = lat * np.exp(-above / (P["glow_h"] * H))
    glow_col = np.array(P["glow_col"], np.float32)
    hdr += hg[..., None] * glow_col[None, None, :] * P["glow_gain"]
    # a second, cool horizon glow on the other side (depth for the lower half)
    if "glow2" in P:
        G2 = P["glow2"]
        lat2 = np.exp(-((xx - G2["x"] * W) / (G2["w"] * W)) ** 2)
        hg2 = lat2 * np.exp(-above / (G2["h"] * H))
        hdr += hg2[..., None] * np.array(G2["col"], np.float32)[None, None, :] * G2["gain"]
    # far ridge: hazy, lit faintly by the glow
    haze = (P["far_col"] * np.ones(3, np.float32)) if isinstance(P["far_col"], float) else np.array(P["far_col"], np.float32)
    far_fill = haze[None, None, :] * (0.35 + 0.65 * lat[..., None]) * np.exp(-np.clip(yy - far[None, :], 0, None) / (0.05 * H))[..., None]
    hdr = hdr * (1 - a_far[..., None]) + far_fill * a_far[..., None]
    # near ridge: rock texture barely visible, rim light on the crest facing the hole
    tex = blur(rng.normal(0, 1, (H // 4, W // 4)).astype(np.float32), 1.2)
    tex = ndi.zoom(tex, 4, order=1)[:H, :W]
    rock = np.array(P["rock_col"], np.float32)[None, None, :] * (1.0 + 0.5 * tex[..., None])
    hx, hy = P["hole_xy"][0] * W, P["hole_xy"][1] * H
    fg = np.maximum(a_near, a_ast)
    dirx, diry = hx - P["astro_x"] * W, hy - P["astro_feet"] * H
    nrm = np.hypot(dirx, diry)
    sc = W / 3840.0
    rim = rim_light(fg, dirx / nrm, diry / nrm, P["rim_w"] * sc)
    rim_ast = rim_light(a_ast, dirx / nrm, diry / nrm, P["rim_w_astro"] * sc)
    # rim only where the bright horizon glow sits right behind the crest
    closeness = lat * np.exp(-np.clip(yy - P["astro_feet"] * H, 0, None) / (P["rim_fall"] * H))
    rim_col = np.array(P["rim_col"], np.float32)
    hdr = hdr * (1 - fg[..., None]) + rock * fg[..., None]
    hdr += (rim * closeness)[..., None] * rim_col * P["rim_gain"]
    hdr += rim_ast[..., None] * rim_col * P["rim_gain_astro"]
    # tiny visor glint on the helmet
    gxp, gyp = P["astro_x"] * W + P["astro_h"] * H * 0.06, P["astro_feet"] * H - P["astro_h"] * H * 0.92
    gl = np.exp(-(((xx - gxp) ** 2 + (yy - gyp) ** 2) / (2 * (P["astro_h"] * H * P["glint_size"]) ** 2)))
    if P.get("astro_on", True):
        hdr += gl[..., None] * np.array([1.0, 0.85, 0.6], np.float32) * P["glint_gain"]

    # ---- light-speed ship escaping toward the wormhole, rescued words in its wake
    ship_info = {}
    if "ship" in P:
        from ship import add_ship
        S = dict(P["ship"])
        ship_info = add_ship(hdr, S, rng)

    # ---- diffraction spikes on a few bright stars away from text and disk
    allow = [tuple(int(v * s) for v, s in zip(b, (W, H, W, H))) for b in P["spike_boxes"]]
    stars = pick_stars(hdr, diskmask | (fg > 0), P["n_spikes"], rng, allow)
    P["_sc"] = W / 3840.0
    hdr += spikes(H, W, stars, P)

    # ---- bloom (energy-conserving mix of several widths) and anamorphic streaks
    Lb = lum(hdr)
    bright = hdr * (np.clip((Lb - P["bloom_thr"]) / (Lb + 1e-6), 0, 1))[..., None]
    bloom = np.zeros_like(hdr)
    for s, wgt in zip(P["bloom_sigmas"], P["bloom_weights"]):
        bloom += wgt * blur(bright, s * W / 3840)
    rs = np.hypot(xx - hx, yy - hy) / (P["shadow_r"] * H)
    keep = (P["shadow_keep"] + (1 - P["shadow_keep"]) * np.clip((rs - 0.75) / 0.35, 0, 1))[..., None]
    hdr = hdr + bloom * P["bloom_gain"] * keep
    # broad warm halo around the disk (volumetric feel)
    halo = blur(np.minimum(lum(hdr), 20.0), P["halo_sigma"] * W / 3840)[..., None] * np.array(P["halo_col"], np.float32)
    hdr = hdr + halo * P["halo_gain"] * keep
    hdr += streaks(hdr, P["streak_thr"], P["streak_len"] * W / 3840, P["streak_tint"]) * P["streak_gain"] * keep

    # ---- highlight roll-off keeps structure in the Doppler-bright side
    Lh = lum(hdr)
    hdr *= (1.0 / (1.0 + Lh / P["knee"]))[..., None] * (1.0 + 1.0 / P["knee"])
    # ---- tone map and grade
    x = aces(hdr * P["tm_exposure"])
    # split toning: cool shadows, warm highlights
    L = lum(x)[..., None]
    sh = np.array(P["shadow_tint"], np.float32)
    hi = np.array(P["high_tint"], np.float32)
    x = x + sh * (1 - L) ** 4 * P["shadow_amt"] + (hi - 1.0) * x * L ** 1.5 * P["high_amt"]
    # saturation
    L = lum(x)[..., None]
    x = L + (x - L) * P["sat"]
    x = np.clip(x, 0, None)
    # vignette (elliptical, soft) centred slightly towards the hole
    cx, cy = P["vig_c"][0] * W, P["vig_c"][1] * H
    r2 = ((xx - cx) / (W * 0.62)) ** 2 + ((yy - cy) / (H * 0.62)) ** 2
    vig = 1.0 - P["vig_amt"] * np.clip(r2, 0, 1.6) ** 1.4 / 1.6 ** 1.4
    x *= vig[..., None]
    out = srgb(x).astype(np.float32)
    np.save(os.path.join(WORK, f"bg_{fmt}.npy"), out)
    Image.fromarray((np.clip(out, 0, 1) * 255 + 0.5).astype(np.uint8)).save(os.path.join(WORK, f"bg_{fmt}.png"))
    # shadow centre: darkest big blob near the configured hole position
    info = {"astronaut_box": abox if P.get("astro_on", True) else None, "ship": ship_info, "stars": [(int(a), int(b)) for a, b, _, _ in stars],
            "hole_xy_px": [hx, hy]}
    json.dump(info, open(os.path.join(WORK, f"fg_{fmt}.json"), "w"))
    if ship_info:
        with open(os.path.join(WORK, f"wake_words_{fmt}.txt"), "w") as fh:
            fh.write("\n".join(ship_info["wake_words"]) + "\n")
    print("post done", fmt, "spikes", len(stars))


if __name__ == "__main__":
    main()
