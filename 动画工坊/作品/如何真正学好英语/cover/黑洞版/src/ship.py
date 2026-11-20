# Light-speed spacecraft escaping the black hole toward the wormhole, added to linear HDR:
# a warp shimmer that bends the background around the trail, a white-hot streak with a blue
# sheath and layered curved speed lines, chromatic shimmer fringes, a faint warp bubble, a lit
# dart-shaped ship with cockpit and twin engines, and the rescued words caught in its wake
# (laid out by a small solver so they never collide). Sizes are in px at 2160 px frame height.
import os
import numpy as np
from PIL import Image, ImageDraw, ImageFont
from scipy import ndimage as ndi

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
FONT = os.path.join(ROOT, "fonts", "SourceSerif4Display-Italic.ttf")


def smooth(e0, e1, x):
    t = np.clip((x - e0) / (e1 - e0), 0.0, 1.0)
    return t * t * (3 - 2 * t)


def bezier(p0, p1, p2, n):
    t = np.linspace(0.0, 1.0, n)[:, None]
    pts = (1 - t) ** 2 * p0 + 2 * (1 - t) * t * p1 + t ** 2 * p2
    tan = 2 * (1 - t) * (p1 - p0) + 2 * t * (p2 - p1)
    tan /= np.linalg.norm(tan, axis=1, keepdims=True)
    nrm = np.stack([tan[:, 1], -tan[:, 0]], 1)
    if nrm[:, 1].mean() > 0:          # normals point up the screen
        nrm = -nrm
    return pts, tan, nrm


def path_coords(shape, pts, tan, nrm, pad):
    """For the region around the path: arc length from the start (s, px), signed normal offset
    (n, px, positive = up the screen) and the path parameter of the nearest point (t, 0..1)."""
    H, W = shape
    x0, y0 = int(max(0, pts[:, 0].min() - pad)), int(max(0, pts[:, 1].min() - pad))
    x1, y1 = int(min(W, pts[:, 0].max() + pad)), int(min(H, pts[:, 1].max() + pad))
    h, w = y1 - y0, x1 - x0
    N = len(pts)
    img = Image.new("I", (w, h), 0)
    d = ImageDraw.Draw(img)
    q = pts - [x0, y0]
    for i in range(N - 1):
        d.line([tuple(q[i]), tuple(q[i + 1])], fill=i + 1, width=1)
    a = np.asarray(img, dtype=np.int64)
    _, (iy, ix) = ndi.distance_transform_edt(a == 0, return_indices=True)
    idx = np.clip(a[iy, ix] - 1, 0, N - 1)
    yy, xx = np.mgrid[y0:y1, x0:x1].astype(np.float64)
    dx, dy = xx - pts[idx, 0], yy - pts[idx, 1]
    n = dx * nrm[idx, 0] + dy * nrm[idx, 1]
    along = dx * tan[idx, 0] + dy * tan[idx, 1]
    seg = np.hypot(*np.diff(pts, axis=0).T)
    scum = np.concatenate([[0.0], np.cumsum(seg)])
    s = scum[idx] + along
    t = s / scum[-1]
    return (x0, y0, x1, y1), s.astype(np.float32), n.astype(np.float32), t.astype(np.float32), float(scum[-1]), idx


def rotate_rgba(img, ang, pivot):
    """Rotate a float HxWxC image by ang (rad, screen coords, +y down) about pivot (x, y).
    Returns the rotated image and the new pivot position."""
    deg = -np.degrees(ang)
    r = np.stack([ndi.rotate(img[..., c], deg, reshape=True, order=1) for c in range(img.shape[2])], -1)
    h, w = img.shape[:2]
    v = np.array(pivot, np.float64) - [w / 2, h / 2]
    ca, sa = np.cos(ang), np.sin(ang)
    vr = np.array([ca * v[0] - sa * v[1], sa * v[0] + ca * v[1]])
    rh, rw = r.shape[:2]
    return np.clip(r, 0, None), (rw / 2 + vr[0], rh / 2 + vr[1])


def paste(hdr, src, at, pivot, mode):
    """Composite src (HxWx4: rgb + alpha, or HxWx3 additive) with its pivot at `at`. Returns the box."""
    H, W = hdr.shape[:2]
    X0, Y0 = int(round(at[0] - pivot[0])), int(round(at[1] - pivot[1]))
    rh, rw = src.shape[:2]
    xs0, ys0, xs1, ys1 = max(0, X0), max(0, Y0), min(W, X0 + rw), min(H, Y0 + rh)
    if xs1 <= xs0 or ys1 <= ys0:
        return None
    sub = src[ys0 - Y0:ys1 - Y0, xs0 - X0:xs1 - X0]
    reg = hdr[ys0:ys1, xs0:xs1]
    if mode == "over":
        a = np.clip(sub[..., 3:4], 0, 1)
        reg[...] = reg * (1 - a) + sub[..., :3]
    else:
        reg += sub[..., :3]
    return (xs0, ys0, xs1, ys1)


def build_ship(L, S, ss=8):
    """Sleek delta-wing dart pointing +x, lit: returns premultiplied RGBA (float) and pivot (nose base)."""
    Wd = L * 0.85
    PW, PH = int(L * 1.3) + 8, int(Wd) + 8
    cx, cy = 4 + L * 0.2, PH / 2

    def P(u, v):
        return ((cx + u * L) * ss, (cy + v * L) * ss)

    hull = [(0.95, 0.0), (0.55, 0.040), (0.18, 0.070), (0.02, 0.36), (-0.09, 0.36), (-0.03, 0.090),
            (-0.16, 0.065), (-0.16, -0.065), (-0.03, -0.090), (-0.09, -0.36), (0.02, -0.36), (0.18, -0.070),
            (0.55, -0.040)]
    big = (PW * ss, PH * ss)
    m = Image.new("L", big, 0)
    ImageDraw.Draw(m).polygon([P(u, v) for u, v in hull], fill=255)
    spine = Image.new("L", big, 0)
    ImageDraw.Draw(spine).line([P(0.92, 0.0), P(-0.12, 0.0)], fill=255, width=max(1, int(0.018 * L * ss)))
    cock = Image.new("L", big, 0)
    ImageDraw.Draw(cock).ellipse([P(0.36, -0.028), P(0.60, 0.028)], fill=255)
    down = lambda im: np.asarray(im.resize((PW, PH), Image.LANCZOS), dtype=np.float32) / 255.0
    a, sp, ck = down(m), down(spine), down(cock)
    # light: warm from behind (the black hole, -x), cool from ahead (the portal, +x), soft from above
    yy, xx = np.mgrid[0:PH, 0:PW].astype(np.float32)
    u = (xx - cx) / L
    v = (yy - cy) / L
    base = np.array(S["hull_col"], np.float32)
    shade = 0.55 + 0.45 * np.clip(-v * 2.5 + 0.3, 0, 1)
    rgb = base[None, None, :] * shade[..., None]
    edge = np.clip(a - ndi.grey_erosion(a, size=(3, 3)), 0, 1)
    gy, gx = np.gradient(ndi.gaussian_filter(a, 0.7))
    back = np.clip(gx * 3.0, 0, 1)            # edges facing -x (toward the hole)
    front = np.clip(-gx * 3.0, 0, 1)          # edges facing +x (toward the portal)
    rgb = rgb + edge[..., None] * np.array(S["edge_col"], np.float32) * S["edge_gain"]
    rgb = rgb + back[..., None] * np.array([1.0, 0.72, 0.42], np.float32) * S["rim_gain"]
    rgb = rgb + front[..., None] * np.array([0.55, 0.80, 1.0], np.float32) * S["rim_gain"] * 0.8
    rgb = rgb + (sp * a)[..., None] * np.array([0.85, 0.92, 1.0], np.float32) * S["spine_gain"]
    rgb = rgb + ck[..., None] * np.array([0.45, 0.90, 1.0], np.float32) * S["cockpit_gain"]
    rgba = np.concatenate([rgb * a[..., None], a[..., None]], -1)
    tail = (cx - 0.16 * L, cy)
    return rgba, (cx, cy), tail


def word_patch(w, fs, g, flip, sh):
    f = ImageFont.truetype(FONT, int(fs))
    mg = int(28 * sh) + 6
    tw = int(f.getlength(w)) + 2 * mg
    th = int(fs * 1.35) + 2 * mg
    im = Image.new("L", (tw, th), 0)
    ImageDraw.Draw(im).text((mg, mg), w, font=f, fill=255)
    a = np.asarray(im, dtype=np.float32) / 255.0
    ink = np.argwhere(a > 0.2)
    # faint motion ghost behind the letters (the words travel with the ship)
    ghost = np.zeros_like(a)
    step = max(1, int(3 * sh))
    for k in range(1, 7):
        ghost += np.roll(a, (1 if flip else -1) * k * step, axis=1) * (0.6 ** k)
    ghost *= 0.22
    glow = ndi.gaussian_filter(a, 2.5 * sh, mode="constant") * 0.9 + ndi.gaussian_filter(a, 9 * sh, mode="constant") * 0.45
    rgb = (a * g)[..., None] * np.array([1.0, 0.94, 0.80], np.float32) \
        + ((glow * 0.55 + ghost) * g)[..., None] * np.array([1.0, 0.74, 0.40], np.float32)
    box = (ink[:, 1].min(), ink[:, 0].min(), ink[:, 1].max(), ink[:, 0].max())
    cxy = ((box[0] + box[2]) / 2, (box[1] + box[3]) / 2)
    return rgb, cxy, (box[2] - box[0], box[3] - box[1])


def add_ship(hdr, S, rng):
    H, W = hdr.shape[:2]
    sh = H / 2160.0
    p0, p1, p2 = [np.array([x * W, y * H], np.float64) for x, y in (S["p0"], S["p1"], S["p2"])]
    pts, tan, nrm = bezier(p0, p1, p2, 2400)
    L = S["ship_len"] * H
    fwd = tan[-1]
    ang = np.arctan2(fwd[1], fwd[0])
    pad = int(260 * sh)
    (x0, y0, x1, y1), s, n, t, total, idx = path_coords((H, W), pts, tan, nrm, pad)
    tc = np.clip(t, 0, 1)
    reg = hdr[y0:y1, x0:x1]

    # 1. warp shimmer: the background ripples across the trail, strongest near the ship
    wsh = S["shimmer"]
    lam = wsh["wavelength"] * sh
    amp = wsh["amp"] * sh * smooth(0.35, 0.95, tc) * (1 - smooth(1.0, 1.04, t)) * np.exp(-np.abs(n) / (wsh["width"] * sh))
    disp = amp * np.sin(2 * np.pi * s / lam)
    nx, ny = nrm[idx, 0], nrm[idx, 1]
    yy, xx = np.mgrid[0:y1 - y0, 0:x1 - x0].astype(np.float32)
    coords = [yy - disp * ny, xx - disp * nx]
    reg[...] = np.stack([ndi.map_coordinates(reg[..., c], coords, order=1, mode="nearest") for c in range(3)], -1)

    # 2. the streak: white-hot core, blue sheath, wide glow; fades in out of the hole's pull
    # past the ship the glow is a rounded cap (true distance to the end point) that fades quickly
    beyond = np.clip(s - total, 0, None)
    inten = S["gain"] * smooth(0.0, 0.25, tc) * (0.25 + 0.75 * tc ** S["fade_pow"]) * np.exp(-beyond / (0.35 * L))
    cw = S["core_w"] * sh * (0.45 + 0.55 * tc)
    gw = S["glow_w"] * sh * (0.45 + 0.55 * tc)
    an = np.hypot(n, beyond)
    core = np.exp(-0.5 * (an / cw) ** 2)
    sheath = np.exp(-an / gw)
    wide = np.exp(-an / (gw * 5.0))
    col_core = np.array([1.0, 0.97, 0.92], np.float32)
    col_sh = np.array(S["sheath_col"], np.float32)
    add = (core * inten)[..., None] * col_core + (sheath * inten * 0.32)[..., None] * col_sh \
        + (wide * inten * 0.06)[..., None] * col_sh
    # 3. layered speed lines that follow the curve, each starting at its own point
    for off, ts0, wl, g, c in S["speed_lines"]:
        o = off * H
        ln = np.exp(-0.5 * ((n - o) / (wl * sh)) ** 2)
        ramp = smooth(ts0, ts0 + 0.18, tc) * (1 - smooth(0.94, 0.99, t)) * (0.3 + 0.7 * tc)
        add += (ln * ramp * g)[..., None] * np.array(c, np.float32)
    # 4. chromatic shimmer fringes riding the sheath edge
    fr = S["fringe"]
    wob = fr["wobble"] * sh * np.sin(2 * np.pi * s / (fr["wavelength"] * sh))
    fz = smooth(0.45, 0.9, tc) * (1 - smooth(0.97, 1.0, t)) * fr["gain"]
    for sign in (1, -1):
        e0 = fr["offset"] * sh + wob * sign
        add += (np.exp(-0.5 * ((n * sign - e0) / (1.3 * sh)) ** 2) * fz)[..., None] * np.array([0.40, 0.85, 1.0], np.float32)
        add += (np.exp(-0.5 * ((n * sign - e0 - 4 * sh) / (1.3 * sh)) ** 2) * fz * 0.6)[..., None] * np.array([0.85, 0.45, 1.0], np.float32)
    # everything fades to exactly zero well inside the working region (no visible box edge)
    win = 1 - smooth(0.55 * pad, 0.95 * pad, an)
    reg += add * win[..., None]

    # 5. warp bubble: a faint chromatic ellipse around the ship
    wb = S["bubble"]
    cxy = p2 + fwd * L * 0.25
    bx0, by0 = int(cxy[0] - L * 2), int(cxy[1] - L * 2)
    by, bx = np.mgrid[by0:by0 + int(L * 4), bx0:bx0 + int(L * 4)].astype(np.float32)
    rx, ry = bx - cxy[0], by - cxy[1]
    u = (rx * fwd[0] + ry * fwd[1]) / (L * wb["rx"])
    v = (-rx * fwd[1] + ry * fwd[0]) / (L * wb["ry"])
    rr = np.sqrt(u * u + v * v)
    front = smooth(0.15, 0.85, u) * (1 - smooth(1.4, 1.6, rr))   # only the bow arc ahead of the nose
    bub = np.exp(-0.5 * ((rr - 1.0) / 0.025) ** 2)[..., None] * np.array([0.45, 0.85, 1.0], np.float32) \
        + np.exp(-0.5 * ((rr - 0.95) / 0.02) ** 2)[..., None] * np.array([0.9, 0.5, 1.0], np.float32) * 0.6
    hdr[by0:by0 + bub.shape[0], bx0:bx0 + bub.shape[1]] += bub * (front * wb["gain"])[..., None]

    # 6. the ship: soft blue glow halo, then the lit hull over it, then twin engines
    rgba, piv, tail = build_ship(L, S)
    rot, rp = rotate_rgba(rgba, ang, piv)
    hp = int(40 * sh) + 4                     # room for the halo to fall to zero
    rot = np.pad(rot, ((hp, hp), (hp, hp), (0, 0)))
    rp = (rp[0] + hp, rp[1] + hp)
    halo = ndi.gaussian_filter(rot[..., 3], 6 * sh, mode="constant") * S["halo_gain"]
    hal = np.concatenate([halo[..., None] * np.array([0.5, 0.75, 1.0], np.float32), np.zeros_like(halo)[..., None]], -1)
    paste(hdr, hal, p2, rp, "add")
    ship_box = paste(hdr, rot, p2, rp, "over")
    ca, sa = np.cos(ang), np.sin(ang)
    for side in (-1, 1):
        off = np.array([tail[0] - piv[0], tail[1] - piv[1] + side * 0.05 * L])
        e = p2 + np.array([ca * off[0] - sa * off[1], sa * off[0] + ca * off[1]])
        r = int(L * 3.0)
        ys, xs = np.mgrid[int(e[1]) - r:int(e[1]) + r, int(e[0]) - r:int(e[0]) + r].astype(np.float32)
        dd = np.hypot(xs - e[0], ys - e[1])
        eg = S["engine_gain"] * (np.exp(-0.5 * (dd / (L * 0.035)) ** 2) + 0.06 * np.exp(-dd / (L * 0.14))) * (1 - smooth(0.6 * r, 0.95 * r, dd))
        hdr[int(e[1]) - r:int(e[1]) + r, int(e[0]) - r:int(e[0]) + r] += eg[..., None] * np.array([0.80, 0.90, 1.0], np.float32)

    # 7. rescued words in the wake, alternating above and below the streak
    seg = np.hypot(*np.diff(pts, axis=0).T)
    scum = np.concatenate([[0.0], np.cumsum(seg)])
    from_ship = scum[-1] - scum
    side_end = {1: S["word_start"] * sh, -1: S["word_start"] * sh + S["word_stagger"] * sh}
    words, boxes = [], []
    last_start = -1e9
    for (w, fs, g, side) in S["words"]:
        fsz = fs * sh
        flipped = True
        rgb, wc, (ww, wh) = word_patch(w, fsz, g, flipped, sh)
        st = max(side_end[side], last_start + S["word_stagger"] * sh)
        mid = st + ww / 2
        if mid + ww / 2 > from_ship[0] - 40 * sh:
            raise SystemExit(f"wake word '{w}' does not fit along the trail")
        i = int(np.argmin(np.abs(from_ship - mid)))
        wa = np.arctan2(tan[i, 1], tan[i, 0])
        if np.cos(wa) < 0:
            wa += np.pi
        c = pts[i] + nrm[i] * side * (S["word_gap"] * sh + wh / 2)
        rimg, rp = rotate_rgba(rgb, wa, wc)
        box = paste(hdr, np.concatenate([rimg, np.zeros_like(rimg[..., :1])], -1), c, rp, "add")
        # tight ink box of the placed word (for the checks)
        hw, hh = ww / 2, wh / 2
        cs, sn = np.cos(wa), np.sin(wa)
        cx_ = [c[0] + cs * a_ - sn * b_ for a_, b_ in ((-hw, -hh), (hw, -hh), (hw, hh), (-hw, hh))]
        cy_ = [c[1] + sn * a_ + cs * b_ for a_, b_ in ((-hw, -hh), (hw, -hh), (hw, hh), (-hw, hh))]
        boxes.append([float(min(cx_)), float(min(cy_)), float(max(cx_)), float(max(cy_))])
        side_end[side] = st + ww + S["word_gap_s"] * sh
        last_start = st
        words.append(w)
    return {"ship_xy": [float(p2[0]), float(p2[1])], "ship_box": list(ship_box) if ship_box else None,
            "trail_start": [float(p0[0]), float(p0[1])], "trail_len_px": float(total),
            "wake_words": words, "wake_boxes": boxes}
