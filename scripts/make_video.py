#!/usr/bin/env python3
"""make_video.py —— 把一篇文章渲成 16:9 的黑板朗读视频（mp4）。

★ 由来（2026-09-04，用户要「跟网页一样风格的 mp4，要有配音」）：
  listen.html 是网页版；这个是同一套画面渲成视频，能直接发出去、能上传。
  画面：木框 + 黑板，英文一行、中文一行，**重点词金色**，其余粉笔白。
  音频：直接拼 build_reader.py 已经合成好的逐句 opus，不重新合成——
  **重合成每次波形都有尾差**（见 say-en《原理》第七节），拼旧文件才对得上时间轴。

用法：
  python3 scripts/make_video.py 01                    # → reader/a01.mp4
  python3 scripts/make_video.py 01 --gap 0.35         # 句间停顿（秒）
  python3 scripts/make_video.py 01 --size 1280x720
先跑 build_reader.py 生成音频与数据。
"""
import os
import re
import sys
import json
import math
import shutil
import subprocess

from PIL import Image, ImageDraw, ImageFont

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
READER = os.path.join(ROOT, "reader")
F_EN = "/usr/share/fonts/truetype/google-fonts/Poppins-Bold.ttf"
F_ZH = "/usr/share/fonts/opentype/noto/NotoSansCJK-Black.ttc"

GOLD = (245, 197, 66)
CHALK = (255, 255, 255)
BOARD = (14, 109, 105)
BOARD_2 = (10, 82, 78)
FRAME = (224, 167, 95)
FRAME_D = (176, 120, 52)
FRAME_L = (240, 196, 138)

BOLD = re.compile(r"\*\*([^*]+)\*\*")
ZH_GLOSS = re.compile(r"\*\*([^*]+)\*\*\(([^)]+)\)")


def font(path, size, index=0):
    try:
        return ImageFont.truetype(path, size, index=index)
    except Exception:
        return ImageFont.truetype(path, size)


def board_bg(W, H):
    """木框 + 黑板底。只画一次，之后每帧复制。
    ★ 渐晕用 numpy 算平滑径向衰减——早先用嵌套矩形描边画，屏幕上是一圈同心方框，像靶子。"""
    import numpy as np
    pad = int(W * 0.028)

    # 木框：低频噪声做木纹，比等距条纹自然
    rng = np.random.default_rng(7)
    grain = rng.normal(0, 1, (H, W // 6 + 2))
    k = np.ones(9) / 9
    grain = np.apply_along_axis(lambda r: np.convolve(r, k, mode="same"), 1, grain)
    grain = np.repeat(grain, 6, axis=1)[:, :W]
    grain = np.apply_along_axis(lambda c: np.convolve(c, np.ones(31) / 31, mode="same"), 0, grain)
    grain = grain / (np.abs(grain).max() + 1e-9)
    base = np.array(FRAME, dtype=float)
    amp = np.array([26, 30, 26], dtype=float)
    img = base[None, None, :] + grain[:, :, None] * amp[None, None, :]

    # 黑板：中心亮、四角暗的平滑渐晕
    yy, xx = np.mgrid[0:H, 0:W]
    cx, cy = W / 2, H * 0.46
    r = np.sqrt(((xx - cx) / (W * 0.62)) ** 2 + ((yy - cy) / (H * 0.62)) ** 2)
    v = np.clip(1 - 0.42 * r ** 1.7, 0.55, 1.0)
    board = np.array(BOARD, dtype=float)[None, None, :] * v[:, :, None]
    # 粉笔灰：极轻的噪点，免得纯色发死
    board += rng.normal(0, 2.2, (H, W, 1))

    inner = np.zeros((H, W), dtype=bool)
    inner[pad:H - pad, pad:W - pad] = True
    img = np.where(inner[:, :, None], board, img)
    img = np.clip(img, 0, 255).astype("uint8")
    im = Image.fromarray(img, "RGB")

    d = ImageDraw.Draw(im)
    lw = max(2, W // 420)
    d.rectangle([pad, pad, W - pad, H - pad], outline=(6, 58, 55), width=lw)      # 板沿
    d.rectangle([pad - lw, pad - lw, W - pad + lw, H - pad + lw], outline=FRAME_D, width=lw)
    d.rectangle([0, 0, W - 1, H - 1], outline=FRAME_D, width=lw)
    return im


def wrap(draw, tokens, fnt, maxw, space):
    """tokens: [(文字, 是否重点词)]。按宽度折行，返回 [[(tok,gold,w)]…]"""
    lines, cur, curw = [], [], 0
    for tok, gold in tokens:
        w = draw.textlength(tok, font=fnt)
        add = w + (space if cur else 0)
        if cur and curw + add > maxw:
            lines.append(cur); cur, curw = [], 0
            add = w
        cur.append((tok, gold, w)); curw += add
    if cur:
        lines.append(cur)
    return lines


def en_tokens(en):
    """英文按词切，重点词标 gold。"""
    out = []
    for chunk in re.split(r"(\*\*[^*]+\*\*)", en):
        if not chunk:
            continue
        if chunk.startswith("**"):
            for w in chunk[2:-2].split():
                out.append((w, True))
        else:
            for w in chunk.split():
                out.append((w, False))
    return out


def zh_tokens(zh):
    """中文按字切（重点词整块标 gold），括注不上屏。"""
    out = []
    pos = 0
    for m in ZH_GLOSS.finditer(zh):
        for ch in zh[pos:m.start()]:
            out.append((ch, False))
        for ch in m.group(1):
            out.append((ch, True))
        pos = m.end()
    for ch in zh[pos:]:
        out.append((ch, False))
    return [(c, g) for c, g in out if c not in "*"]


def draw_sentence(bg, s, W, H):
    im = bg.copy()
    d = ImageDraw.Draw(im)
    pad = int(W * 0.028)
    maxw = W - 2 * pad - int(W * 0.075)

    # 字号：句子越长越小，保证一屏放得下
    en_toks = en_tokens(s['en'])
    zh_toks = zh_tokens(s['zh'])
    for scale in (1.0, .92, .84, .76, .68, .6, .54):
        fe = font(F_EN, int(H * 0.072 * scale))
        fz = font(F_ZH, int(H * 0.062 * scale), index=2)
        sp_e = d.textlength(" ", font=fe)
        le = wrap(d, en_toks, fe, maxw, sp_e)
        lz = wrap(d, zh_toks, fz, maxw, 0)
        lh_e = int(H * 0.098 * scale)
        lh_z = int(H * 0.086 * scale)
        total = len(le) * lh_e + int(H * 0.028) + len(lz) * lh_z
        if total < H - 2 * pad - int(H * 0.06):
            break

    y = (H - total) // 2
    for ln in le:
        wsum = sum(w for _, _, w in ln) + sp_e * (len(ln) - 1)
        x = (W - wsum) / 2
        for tok, gold, w in ln:
            d.text((x, y), tok, font=fe, fill=GOLD if gold else CHALK)
            x += w + sp_e
        y += lh_e
    y += int(H * 0.028)
    for ln in lz:
        wsum = sum(w for _, _, w in ln)
        x = (W - wsum) / 2
        for tok, gold, w in ln:
            d.text((x, y), tok, font=fz, fill=GOLD if gold else CHALK)
            x += w
        y += lh_z
    return im


def main():
    args = [x for x in sys.argv[1:] if not x.startswith("--")]
    aid = (args[0] if args else "01").zfill(2)
    gap = float(sys.argv[sys.argv.index("--gap") + 1]) if "--gap" in sys.argv else 0.32
    size = sys.argv[sys.argv.index("--size") + 1] if "--size" in sys.argv else "1920x1080"
    W, H = (int(x) for x in size.split("x"))

    data = json.load(open(os.path.join(READER, "a%s.json" % aid), encoding="utf-8"))
    work = os.path.join(READER, "_v%s" % aid)
    shutil.rmtree(work, ignore_errors=True)
    os.makedirs(work)

    bg = board_bg(W, H)
    concat_img, concat_aud = [], []
    for s in data['sentences']:
        png = os.path.join(work, "f%02d.png" % s['i'])
        draw_sentence(bg, s, W, H).save(png)
        # 每句时长 = 音频解码时长 + 句间停顿（用 qc 里量到的真时长，不是原始波形）
        dur = s.get('qc', {}).get('opus', {}).get('dur') or s['dur']
        concat_img.append("file '%s'\nduration %.3f\n" % (png, dur + gap))
        concat_aud.append("file '%s'\n" % os.path.join(READER, s['audioAlt']))
        print("  %2d  %5.2fs  %s" % (s['i'], dur + gap, s['plain'][:50]))
    concat_img.append("file '%s'\n" % png)          # ffmpeg concat 要求最后一张再列一次

    open(os.path.join(work, "img.txt"), "w").write("".join(concat_img))
    open(os.path.join(work, "aud.txt"), "w").write("".join(concat_aud))

    # 音频：逐句拼接，每句后补 gap 秒静音
    parts = []
    for i, s in enumerate(data['sentences']):
        parts.append("[%d:a]" % i)
    inputs = []
    for s in data['sentences']:
        inputs += ["-i", os.path.join(READER, s['audioAlt'])]
    filt = "".join("[%d:a]apad=pad_dur=%.3f[a%d];" % (i, gap, i) for i in range(len(data['sentences'])))
    filt += "".join("[a%d]" % i for i in range(len(data['sentences'])))
    filt += "concat=n=%d:v=0:a=1[out]" % len(data['sentences'])
    wav = os.path.join(work, "all.wav")
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error"] + inputs +
                   ["-filter_complex", filt, "-map", "[out]", "-ar", "44100", "-ac", "1", wav], check=True)

    out = os.path.join(READER, "a%s.mp4" % aid)
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error",
                    "-f", "concat", "-safe", "0", "-i", os.path.join(work, "img.txt"),
                    "-i", wav,
                    "-c:v", "libx264", "-pix_fmt", "yuv420p", "-r", "25",
                    "-vf", "scale=%d:%d,format=yuv420p" % (W, H),
                    "-c:a", "aac", "-b:a", "128k",
                    "-shortest", "-movflags", "+faststart", out], check=True)
    shutil.rmtree(work, ignore_errors=True)
    d = subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration",
                        "-of", "csv=p=0", out], capture_output=True, text=True).stdout.strip()
    print("\n第%s篇 → %s  %sx%s  %.1f 秒  %.1f MB"
          % (aid, os.path.relpath(out, ROOT), W, H, float(d), os.path.getsize(out) / 1e6))


if __name__ == "__main__":
    main()
