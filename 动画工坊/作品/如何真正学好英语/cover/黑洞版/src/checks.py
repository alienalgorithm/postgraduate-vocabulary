# Program checks for the cover (no AI review). Exit code 0 only if every check passes.
#  1 exact pixel sizes, file sizes, JPEG quality
#  2 main headline cap height at feed size (>= 18 px at 320x180, >= 16 px at 240x180)
#  3 bottom 18 % (B站 overlay strip): no DOM text box, not the black hole shadow centre
#  4 WCAG contrast of every text fill vs the text-free render under its box
#  5 forbidden-word scan over every string on the cover
import json, os, re, sys
import numpy as np
from PIL import Image
from scipy import ndimage as ndi

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
WORK = os.path.join(ROOT, "work")
results = []


def check(name, ok, detail):
    results.append((name, bool(ok), detail))


def jpeg_quality(path):
    """Estimate libjpeg quality by matching the luminance quantisation table."""
    std = np.array([16, 11, 10, 16, 24, 40, 51, 61, 12, 12, 14, 19, 26, 58, 60, 55, 14, 13, 16, 24, 40, 57, 69, 56,
                    14, 17, 22, 29, 51, 87, 80, 62, 18, 22, 37, 56, 68, 109, 103, 77, 24, 35, 55, 64, 81, 104, 113, 92,
                    49, 64, 78, 87, 103, 121, 120, 101, 72, 92, 95, 98, 112, 100, 103, 99])
    zz = [0, 1, 8, 16, 9, 2, 3, 10, 17, 24, 32, 25, 18, 11, 4, 5, 12, 19, 26, 33, 40, 48, 41, 34, 27, 20, 13, 6, 7, 14, 21,
          28, 35, 42, 49, 56, 57, 50, 43, 36, 29, 22, 15, 23, 30, 37, 44, 51, 58, 59, 52, 45, 38, 31, 39, 46, 53, 60, 61,
          54, 47, 55, 62, 63]
    q0 = np.array(Image.open(path).quantization[0])
    best = None
    for q in range(1, 101):
        sc = 5000 / q if q < 50 else 200 - 2 * q
        t = np.clip(np.floor((std * sc + 50) / 100), 1, 255)
        for order in (t, t[np.argsort(zz)], t[zz]):
            if np.array_equal(order, q0):
                best = q
    return best


def srgb_to_lin(c):
    c = np.asarray(c, dtype=np.float64)
    return np.where(c <= 0.04045, c / 12.92, ((c + 0.055) / 1.055) ** 2.4)


def rel_lum(rgb):
    lin = srgb_to_lin(rgb)
    return 0.2126 * lin[..., 0] + 0.7152 * lin[..., 1] + 0.0722 * lin[..., 2]


def contrast(a, b):
    hi, lo = max(a, b), min(a, b)
    return (hi + 0.05) / (lo + 0.05)


def shadow_centre(bg):
    """Centre of the black hole shadow: the dark blob most strongly ringed by bright light."""
    L = rel_lum(bg)
    dark = L < 0.004
    lab, n = ndi.label(dark)
    best, bestv = None, -1
    H, W = L.shape
    for i in range(1, n + 1):
        m = lab == i
        area = m.sum()
        if area < (0.03 * H) ** 2:
            continue
        ring = ndi.binary_dilation(m, iterations=int(0.01 * H)) & ~m
        v = L[ring].mean()
        if v > bestv:
            best, bestv = m, v
    ys, xs = np.nonzero(best)
    return float(xs.mean()), float(ys.mean()), float(bestv), (int(xs.min()), int(ys.min()), int(xs.max()), int(ys.max()))


def main():
    F = json.load(open(os.path.join(HERE, "formats.json")))
    sizes = {"master_16x9.png": (3840, 2160), "master_4x3.png": (2880, 2160), "upload_16x9.jpg": (1920, 1080),
             "upload_4x3.jpg": (1440, 1080), "feed_16x9.png": (320, 180), "feed_4x3.png": (240, 180)}
    # ---- 1. sizes
    for f, wh in sizes.items():
        p = os.path.join(ROOT, f)
        im = Image.open(p)
        kb = os.path.getsize(p) / 1024
        detail = f"{im.size[0]}x{im.size[1]} {im.mode} {kb:.0f} KB"
        ok = im.size == wh and im.mode == "RGB"
        if f.endswith(".jpg"):
            q = jpeg_quality(p)
            detail += f" q={q}"
            ok = ok and kb * 1024 < 2 * 1024 * 1024 and q is not None and q >= 92
        check(f"1 size {f}", ok, detail)
    pair = Image.open(os.path.join(ROOT, "pair.jpg"))
    check("1 size pair.jpg", pair.size == (3480, 1560), f"{pair.size[0]}x{pair.size[1]}")

    strings = []
    for fmt, feed_w, feed_h, need, need_sub in (("16x9", 320, 180, 18, 9), ("4x3", 240, 180, 16, 8)):
        T = json.load(open(os.path.join(WORK, f"text_{fmt}.json")))
        cssW, cssH = T["cssW"], T["cssH"]
        bg = np.load(os.path.join(WORK, f"bg_{fmt}.npy"))
        H, W = bg.shape[:2]
        s = W / cssW
        k = feed_w / cssW
        # ---- 2. cap height at feed size: ink height of each glyph after a lanczos downscale
        def ink_heights(mode, line):
            m = np.asarray(Image.open(os.path.join(WORK, f"text_{fmt}_{mode}.png")).convert("RGBA"))[..., 3]
            small = np.asarray(Image.fromarray(m).resize((feed_w, feed_h), Image.LANCZOS), dtype=np.float32) / 255
            hs = []
            for c in T["rects"]["chars"]:
                if c["line"] != line or c["ch"] in "，？。、！：；":
                    continue
                x0, y0, x1, y1 = c["box"]
                # the glyph's range box is the font content area (~1.45 em) and overlaps the
                # neighbouring line, so the vertical window is the glyph's own line box (1 em) + 1 px
                lb = T["rects"][{"l1": "head1", "l2": "head2", "sub": "sub"}[line]]["box"]
                X0, X1 = int(np.floor(x0 * k)), int(np.ceil(x1 * k))
                Y0, Y1 = max(0, int(np.floor(lb[1] * k)) - 1), min(feed_h, int(np.ceil(lb[3] * k)) + 1)
                rows = np.nonzero((small[Y0:Y1, X0:X1] > 0.5).any(axis=1))[0]
                hs.append(int(rows.max() - rows.min() + 1) if len(rows) else 0)
            return hs
        caps = {ln: ink_heights("head", ln) for ln in ("l1", "l2")}
        med = {ln: float(np.median(v)) for ln, v in caps.items()}
        check(f"2 headline cap height {fmt} @ {feed_w}x{feed_h}", min(med.values()) >= need,
              f"median glyph ink height line1 {med['l1']:.0f} px, line2 {med['l2']:.0f} px (need >= {need}); per glyph {caps}")
        subh = ink_heights("sub", "sub")
        msub = float(np.median(subh))
        check(f"2 sub line cap height {fmt} @ {feed_w}x{feed_h}", msub >= need_sub,
              f"median glyph ink height {msub:.0f} px (need >= {need_sub}); "
              f"{msub / min(med.values()) * 100:.0f}% of the headline; per glyph {subh}")
        # ---- 3. bottom 18 %: text boxes, shadow centre, wormhole and ship
        limit = 0.82 * cssH
        boxes = {k2: v["box"] for k2, v in T["rects"].items() if isinstance(v, dict) and "box" in v}
        worst = max(b[3] for b in boxes.values())
        check(f"3 no text in bottom 18% {fmt}", worst <= limit,
              f"lowest text box bottom {worst:.1f} css px, strip starts at {limit:.1f}")
        cx, cy, ringv, bb = shadow_centre(bg)
        check(f"3 shadow centre above strip {fmt}", cy < 0.82 * H,
              f"shadow centre ({cx:.0f},{cy:.0f}) px = ({cx / W:.3f},{cy / H:.3f}) of frame, bbox {bb}")
        R = F[fmt]["render"]
        wh = R.get("wh")
        fg = json.load(open(os.path.join(WORK, f"fg_{fmt}.json")))
        if wh:
            wy_bot = (wh["y"] + wh["r"]) * H
            sx, sy = fg["ship"]["ship_xy"]
            check(f"3 wormhole and ship above strip {fmt}", wy_bot < 0.82 * H and sy < 0.82 * H,
                  f"wormhole bottom at {wy_bot / H:.3f} H, ship at {sy / H:.3f} H (strip from 0.82 H)")
            # wormhole circle (plus 15 % glow margin) must not touch any text box
            wx, wyc, wr = wh["x"] * W, wh["y"] * H, wh["r"] * H * 1.15
            gaps = []
            for k2, b in boxes.items():
                bx0, by0, bx1, by1 = [v * s for v in b]
                dx = max(bx0 - wx, 0, wx - bx1)
                dy = max(by0 - wyc, 0, wyc - by1)
                gaps.append((np.hypot(dx, dy) - wr) / H)
            check(f"3 wormhole clear of text {fmt}", min(gaps) > 0,
                  f"smallest gap between wormhole glow and a text box {min(gaps):.3f} H")
        # black hole as the hero: bright structure fully inside the frame, clear of all text
        # measured on the ray-traced render (disk light only, before ridge, ship, glow and bloom)
        Rr = json.load(open(os.path.join(WORK, f"rcfg_{fmt}.json")))
        raw = np.fromfile(os.path.join(WORK, f"hdr_{fmt}.f32"), np.float32).reshape(Rr["H"], Rr["W"], 3)[::-1]
        bright = ndi.binary_opening(raw.mean(2) > 0.08)
        if bright.shape != (H, W):
            yi = (np.arange(H) * Rr["H"] / H).astype(int)
            xi = (np.arange(W) * Rr["W"] / W).astype(int)
            bright = bright[yi][:, xi]
        lab, nl = ndi.label(bright)
        ys_, xs_ = np.nonzero(lab)
        ringd = np.hypot(xs_ - cx, ys_ - cy)
        near_ids = np.unique(lab[ys_[ringd < 0.25 * H], xs_[ringd < 0.25 * H]])
        hole = np.isin(lab, near_ids[near_ids > 0])
        hy_, hx_ = np.nonzero(hole)
        bx0, bx1, by0, by1 = hx_.min(), hx_.max(), hy_.min(), hy_.max()
        check(f"3 black hole size and framing {fmt}", (0.45 <= (bx1 - bx0) / W <= 0.55) and bx0 > 0.02 * W and bx1 < 0.98 * W and by0 > 0.02 * H,
              f"bright disk spans x {bx0 / W:.3f}..{bx1 / W:.3f} = {(bx1 - bx0) / W:.3f} W, y {by0 / H:.3f}..{by1 / H:.3f}; "
              f"margins left {bx0 / W:.3f} W, right {1 - bx1 / W:.3f} W, top {by0 / H:.3f} H")
        tmask = np.zeros((H, W), bool)
        for b in boxes.values():
            X0, Y0, X1, Y1 = [int(round(v * s)) for v in b]
            tmask[max(0, Y0):Y1, max(0, X0):X1] = True
        dist_t = ndi.distance_transform_edt(~tmask)
        gap_h = float(dist_t[hole].min()) / H
        check(f"3 black hole clear of text {fmt}", gap_h > 0.02,
              f"smallest gap between the bright disk and a text box {gap_h:.3f} H")
        if fg.get("ship", {}).get("wake_boxes"):
            wb = fg["ship"]["wake_boxes"]
            low = max(b[3] for b in wb) / H
            ov = 0
            for i in range(len(wb)):
                for j in range(i + 1, len(wb)):
                    a_, b_ = wb[i], wb[j]
                    if min(a_[2], b_[2]) > max(a_[0], b_[0]) and min(a_[3], b_[3]) > max(a_[1], b_[1]):
                        ov += 1
            tg = min(float(dist_t[int(max(0, b[1])):int(b[3]), int(max(0, b[0])):int(b[2])].min()) for b in wb) / H
            check(f"3 wake words placed {fmt}", low < 0.82 and ov == 0 and tg > 0.02,
                  f"{len(wb)} words {fg['ship']['wake_words']}, lowest word bottom {low:.3f} H, overlapping pairs {ov}, "
                  f"smallest gap to text {tg:.3f} H, cap size {np.median([b[3] - b[1] for b in wb]) / H * 1080:.0f} px at 1080p (box height)")
        # ---- 4. contrast: fill (from the rendered CSS text layer) vs text-free render under the box
        rgba = np.asarray(Image.open(os.path.join(WORK, f"text_{fmt}_all.png")).convert("RGBA"), dtype=np.float64) / 255
        need_c = {"head1": 4.5, "head2": 4.5, "hot": 4.5, "sub": 3.0, "acc": 3.0, "gold": 3.0}
        for key, thr in need_c.items():
            if key not in T["rects"]:
                continue
            x0, y0, x1, y1 = [v * s for v in T["rects"][key]["box"]]
            X0, Y0, X1, Y1 = int(x0), int(y0), int(np.ceil(x1)), int(np.ceil(y1))
            reg = rgba[Y0:Y1, X0:X1].copy()
            if key == "sub":   # the plain part of the sub line (accents are checked separately)
                for acc in ("acc", "gold"):
                    a0, _, a1, _ = [v * s for v in T["rects"][acc]["box"]]
                    reg[:, max(0, int(a0) - X0):max(0, int(np.ceil(a1)) - X0), 3] = 0
            fill = reg[..., :3][reg[..., 3] > 0.95]
            Lf = rel_lum(fill)
            under = bg[Y0:Y1, X0:X1].reshape(-1, 3)
            Lb = rel_lum(under)
            c_mean = contrast(float(rel_lum(fill.mean(axis=0))), float(rel_lum(under.mean(axis=0))))
            c_worst = contrast(float(np.percentile(Lf, 10)), float(np.percentile(Lb, 90)))
            check(f"4 contrast {fmt} {key} '{T['rects'][key]['text']}'", c_mean >= thr,
                  f"fill mean vs bg mean {c_mean:.2f} (need >= {thr}); worst case fill p10 vs bg p90 {c_worst:.2f}")
        strings.append(T["strings"])
        strings += [v["text"] for v in T["rects"].values() if isinstance(v, dict) and "text" in v]
        for mode in ("all", "mask", "head", "hot", "sub", "acc", "gold"):
            strings.append(open(os.path.join(WORK, f"text_{fmt}_{mode}.html"), encoding="utf-8").read())
        p_w = os.path.join(WORK, f"wake_words_{fmt}.txt")
        if os.path.exists(p_w):
            strings += open(p_w, encoding="utf-8").read().split()
    # ---- 5. forbidden words over every string on the cover (copy, DOM text, HTML, disk words)
    copy = json.load(open(os.path.join(HERE, "copy.json"), encoding="utf-8"))
    strings += list(copy.values())
    full = [copy["head1"], copy["head2_hot"] + copy["head2_rest"],
            copy["sub_a"] + copy["sub_acc"] + copy["sub_b"] + copy["sub_gold"] + copy["sub_c"]]
    check("5 exact texts", full == ["你的单词正在被", "记忆的黑洞所吞噬", "如何穿越虫洞，把单词抢回来？"], " / ".join(full))
    disk = open(os.path.join(WORK, "disk_words.txt"), encoding="utf-8").read().split()
    for fmt in ("16x9", "4x3"):
        p_w = os.path.join(WORK, f"wake_words_{fmt}.txt")
        if os.path.exists(p_w):
            disk += open(p_w, encoding="utf-8").read().split()
    strings += disk
    visible = full + list(copy.values()) + disk + [s_ for s_ in strings if "<" not in s_]
    banned = ["最", "第一", "保证", "100%", "80%", "4K", "配乐", "星际穿越", "—", "–", "‒", "―", "--", "美国", "外国", "老外", "母语", "native",
              "中国", "国人", "外籍", "海外", "留学", "foreign", "america", "british", "chinese", "abroad", "nationality"]
    hits = []
    for st in visible:
        low = st.lower()
        for b in banned:
            if b.lower() in low:
                hits.append((b, st[:40]))
        if re.search(r"\s-\s", st):
            hits.append(("spaced hyphen", st[:40]))
    emoji = re.compile("[\U0001F000-\U0001FAFF☀-➿️‍⬀-⯿]")
    for st in strings:
        if emoji.search(st):
            hits.append(("emoji", st[:40]))
    n_html = sum(1 for st in strings if "<" in st)
    check("5 forbidden words", not hits, f"scanned {len(visible)} visible strings incl. {len(disk)} disk words, "
          f"plus {n_html} HTML sources for emoji; hits: {hits}")

    width = max(len(n) for n, _, _ in results)
    allok = True
    for n, ok, d in results:
        allok &= ok
        print(f"{'PASS' if ok else 'FAIL'}  {n.ljust(width)}  {d}")
    print("ALL CHECKS PASS" if allok else "SOME CHECKS FAILED")
    json.dump([{"check": n, "pass": ok, "detail": d} for n, ok, d in results],
              open(os.path.join(ROOT, "checks_report.json"), "w"), ensure_ascii=False, indent=1)
    sys.exit(0 if allok else 1)


if __name__ == "__main__":
    main()
