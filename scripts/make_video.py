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
  python3 scripts/make_video.py 01 --tail 2.0         # 结尾静音缓冲（秒，默认 1.5）
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
LAST_SCALE = None
LAST_TITLE_SCALE = None
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
    for tok, gold, glue in tokens:
        w = draw.textlength(tok, font=fnt)
        add = w + (0 if (glue or not cur) else space)
        # ★ 「紧贴」只是不加空格；能不能在这里换行是另一回事——
        #   中文每个字都紧贴，但必须能换行（上一版把这两件事混在一起，整行中文不换行，溢出了黄框）。
        #   只有标点不能落到行首。
        nobreak = tok in "，。；：、！？—,.;:!?"
        if cur and curw + add > maxw:
            if nobreak and len(cur) >= 2:
                # ★ 避头尾：标点不能起行，但也**不能把整行撑出安全区**（检察官抓到 §16 末行
                #   「…建议；」左端出了守卫圈 38 像素）。把前一个字连同标点一起挪到下一行。
                last = cur.pop()
                curw -= last[2]
                lines.append(cur)
                cur, curw = [(last[0], last[1], last[2], False)], last[2]
                add = w
            elif not nobreak:
                lines.append(cur); cur, curw = [], 0
                add = w
        cur.append((tok, gold, w, glue and bool(cur))); curw += add
    if cur:
        lines.append(cur)
    return lines


def en_tokens(en):
    """英文按词切，重点词标 gold。返回 [(词, 是否重点, 是否紧贴前一个)]。
    ★ 「**delivered**.」拆开后句号是单独一个 token，画的时候前面会多一个空格，
      成了「delivered .」。紧贴前一个词的标点不加空格（glue）。"""
    out, prev = [], ""
    for chunk in re.split(r"(\*\*[^*]+\*\*)", en):
        if not chunk:
            continue
        # 只有**前一块不以空格结尾、这一块也不以空格开头**才是紧贴（「**delivered**.」的句号）；
        # 「a **widow**」中间有空格，widow 不能贴着 a。
        glue_first = bool(out) and not prev.endswith(" ") and not chunk.startswith(" ")
        words = (chunk[2:-2] if chunk.startswith("**") else chunk).split()
        gold = chunk.startswith("**")
        for i, w in enumerate(words):
            out.append((w, gold, glue_first and i == 0))
        prev = chunk
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
    return [(c, g, True) for c, g in out if c not in "*"]


def draw_sentence(bg, s, W, H):
    """一句一帧：**按意群成对排**——一小段英文，紧跟它自己的中文，然后空一行。
    ★ 不再上面一整句英文、下面一整句中文（用户 2026-09-04 要求）：那样眼睛要在
      长句两端来回找对应，看不通透。意群由 build_reader.align_chunks 切好放在 chunks 里。"""
    im = bg.copy()
    d = ImageDraw.Draw(im)
    pad = int(W * 0.028)
    maxw = W - 2 * pad - int(W * 0.07)
    chunks = s.get('chunks') or [{"en": s['en'], "zh": s['zh']}]

    # ★ 字号：**由大往小搜，取放得下的最大号**（用户 2026-09-04：字要大、但不能碰到木框）。
    #   早先是从 1.0 起往下缩，短句也只能用 1.0，屏幕大片空着。
    #   安全区 = 黑板内沿再往里收一圈，文字永远不贴框。
    safe_x = int(W * 0.045)
    safe_y = int(H * 0.055)
    maxw = W - 2 * pad - 2 * safe_x
    maxh = H - 2 * pad - 2 * safe_y
    scale = 0.4
    for cand in [round(2.4 - 0.02 * i, 2) for i in range(105)]:
        fe = font(F_EN, max(8, int(H * 0.062 * cand)))
        fz = font(F_ZH, max(8, int(H * 0.053 * cand)), index=2)
        sp_e = d.textlength(" ", font=fe)
        lh_e = int(H * 0.082 * cand)
        lh_z = int(H * 0.072 * cand)
        # ★ 段距标准（用户 2026-09-04 定，以后所有视频都照这个）：
        #   段内（英文 → 它自己的中文）贴紧；**段与段之间拉开到一眼看得出是两组**——
        #   段间距 ≈ 段内距的 6 倍。这一条比字号优先：字号往下找的时候段距按比例缩，但比例不变。
        gap_pair = int(H * 0.010 * cand)
        gap_chunk = int(H * 0.062 * cand)
        blocks, total, over = [], 0, False
        for ci, c in enumerate(chunks):
            le = wrap(d, en_tokens(c['en']), fe, maxw, sp_e)
            lz = wrap(d, zh_tokens(c['zh']), fz, maxw, 0)
            # 单个词就超宽（长单词、长中文块）→ 这一档不行
            for ln in le + lz:
                if any(w > maxw for _, _, w, _ in ln):
                    over = True
            blocks.append((le, lz))
            total += len(le) * lh_e + gap_pair + len(lz) * lh_z
            if ci < len(chunks) - 1:
                total += gap_chunk
        if not over and total <= maxh:
            scale = cand
            break
    global LAST_SCALE
    LAST_SCALE = scale                       # 给视频检察官看：这一帧用了哪一档字号

    y = (H - total) // 2
    for ci, (le, lz) in enumerate(blocks):
        for ln in le:
            wsum = sum(w for _, _, w, _ in ln) + sum(sp_e for _, _, _, g in ln[1:] if not g)
            x = (W - wsum) / 2
            for i, (tok, gold, w, glue) in enumerate(ln):
                if i and not glue:
                    x += sp_e
                d.text((x, y), tok, font=fe, fill=GOLD if gold else CHALK)
                x += w
            y += lh_e
        y += gap_pair
        for ln in lz:
            wsum = sum(w for _, _, w, _ in ln)
            x = (W - wsum) / 2
            for tok, gold, w, _ in ln:
                d.text((x, y), tok, font=fz, fill=GOLD if gold else CHALK)
                x += w
            y += lh_z
        if ci < len(blocks) - 1:
            y += gap_chunk
    return im


def draw_title(bg, d, W, H):
    """标题页：第几篇 + 英文标题 + 中文标题。
    ★ 用户 2026-09-04 指出「两篇都没有题目」——视频一上来就是第一句，谁也不知道在讲什么。
      放在正片之前，同一块黑板，字号照样由大往小搜、不碰木框。"""
    im = bg.copy()
    dr = ImageDraw.Draw(im)
    pad = int(W * 0.028)
    safe_x, safe_y = int(W * 0.045), int(H * 0.055)
    maxw = W - 2 * pad - 2 * safe_x
    maxh = H - 2 * pad - 2 * safe_y
    # ★ 用户 2026-09-04：不要写「第几篇」。标题页只放中英标题。
    for cand in [round(2.6 - 0.02 * i, 2) for i in range(120)]:
        fe = font(F_EN, max(8, int(H * 0.082 * cand)))
        # 中文标题跟着英文缩，但比例给足——一行的标题，中文太小会显得没分量
        fz = font(F_ZH, max(8, int(H * 0.072 * cand)), index=2)
        sp = dr.textlength(" ", font=fe)
        le = wrap(dr, [(w, False, False) for w in d['title'].split()], fe, maxw, sp)
        lz = wrap(dr, [(c, True, True) for c in (d.get('titleZh') or "")], fz, maxw, 0)
        lh_e, lh_z = int(H * .108 * cand), int(H * .098 * cand)
        gap_t = int(H * .050 * cand)
        total = len(le) * lh_e + gap_t + len(lz) * lh_z
        over = any(w > maxw for ln in le + lz for _, _, w, _ in ln)
        # ★ 标题**必须各占一行**（用户 2026-09-04：题目不要有折行）。
        #   放不下就把字号往下调，而不是折成两行——标题折行很难看，也不像个题目。
        if not over and total <= maxh and len(le) == 1 and len(lz) <= 1:
            break
    global LAST_TITLE_SCALE
    LAST_TITLE_SCALE = cand                  # 给检察官看：标题缩到了哪一档
    # 版面整体居中（略上移一点点，视觉重心才在中间）
    y = (H - total) // 2 - int(H * 0.012)
    for ln in le:
        wsum = sum(w for _, _, w, _ in ln) + sum(sp for _, _, _, g in ln[1:] if not g)
        x = (W - wsum) / 2
        for i, (tok, _, w, glue) in enumerate(ln):
            if i and not glue:
                x += sp
            dr.text((x, y), tok, font=fe, fill=CHALK); x += w
        y += lh_e
    y += gap_t
    for ln in lz:
        wsum = sum(w for _, _, w, _ in ln)
        x = (W - wsum) / 2
        for tok, _, w, _ in ln:
            dr.text((x, y), tok, font=fz, fill=GOLD); x += w
        y += lh_z
    return im


def main():
    args = [x for x in sys.argv[1:] if not x.startswith("--")]
    aid = (args[0] if args else "01").zfill(2)
    # ★ 句间停顿（用户 2026-09-04：切屏不要一丁点停顿都没有）。0.32 秒读起来是连着的，
    #   放到 0.55 秒，一句读完有个换气，画面切换也看得出来。
    gap = float(sys.argv[sys.argv.index("--gap") + 1]) if "--gap" in sys.argv else 0.55
    # ★ 结尾缓冲（用户 2026-09-04）：最后一句读完再留一段静音，画面还在，然后才结束。
    tail = float(sys.argv[sys.argv.index("--tail") + 1]) if "--tail" in sys.argv else 1.5
    size = sys.argv[sys.argv.index("--size") + 1] if "--size" in sys.argv else "1920x1080"
    W, H = (int(x) for x in size.split("x"))

    data = json.load(open(os.path.join(READER, "a%s.json" % aid), encoding="utf-8"))
    # 标题页时长＝念标题的音频长度 ＋ 前后各留一点；--title 可强制指定
    tt = data.get("titleTrack")
    title_sec = (float(sys.argv[sys.argv.index("--title") + 1]) if "--title" in sys.argv
                 else (round((tt.get("qc", {}).get("opus", {}).get("dur") or tt["dur"]), 3) + 1.4
                       if tt else 2.5))
    work = os.path.join(READER, "_v%s" % aid)
    shutil.rmtree(work, ignore_errors=True)
    os.makedirs(work)

    bg = board_bg(W, H)
    concat_img, concat_aud = [], []
    # ★ 标题页：正片之前 TITLE 秒，无声
    tpng = os.path.join(work, "f00.png")
    draw_title(bg, data, W, H).save(tpng)
    concat_img.append("file '%s'\nduration %.3f\n" % (tpng, title_sec))
    print("  00  %5.2fs  【标题·有配音】%s / %s" % (title_sec, data['title'], data.get('titleZh', '')))
    for s in data['sentences']:
        png = os.path.join(work, "f%02d.png" % s['i'])
        draw_sentence(bg, s, W, H).save(png)
        # 每句时长 = 音频解码时长 + 句间停顿（用 qc 里量到的真时长，不是原始波形）
        dur = s.get('qc', {}).get('opus', {}).get('dur') or s['dur']
        last_extra = tail if s is data['sentences'][-1] else 0.0
        concat_img.append("file '%s'\nduration %.3f\n" % (png, dur + gap + last_extra))
        concat_aud.append("file '%s'\n" % os.path.join(READER, s['audioAlt']))
        print("  %2d  %5.2fs  %s" % (s['i'], dur + gap, s['plain'][:50]))
    concat_img.append("file '%s'\n" % png)          # ffmpeg concat 要求最后一张再列一次

    open(os.path.join(work, "img.txt"), "w").write("".join(concat_img))
    open(os.path.join(work, "aud.txt"), "w").write("".join(concat_aud))

    # 音频：逐句拼接，每句后补 gap 秒静音
    parts = []
    for i, s in enumerate(data['sentences']):
        parts.append("[%d:a]" % i)
    # 音轨：标题（念出来）→ 各句 → 结尾缓冲。
    # ★ 标题页原来是补静音；用户 2026-09-04 要求「题目一定要念出来」，改成真接一段标题音频。
    #   标题音频前后各留 0.7 秒余量，正好凑成 title_sec。
    tracks = ([os.path.join(READER, tt['audioAlt'])] if tt else []) + \
             [os.path.join(READER, s['audioAlt']) for s in data['sentences']]
    inputs = []
    for f in tracks:
        inputs += ["-i", f]
    filt = ""
    if tt:
        lead = 0.7
        rest = max(0.05, title_sec - lead - (tt.get('qc', {}).get('opus', {}).get('dur') or tt['dur']))
        filt += "[0:a]adelay=%d:all=1,apad=pad_dur=%.3f[a0];" % (int(lead * 1000), rest)
    for i in range(1 if tt else 0, len(tracks)):
        filt += "[%d:a]apad=pad_dur=%.3f[a%d];" % (i, gap, i)
    filt += "".join("[a%d]" % i for i in range(len(tracks)))
    filt += "concat=n=%d:v=0:a=1[cat];[cat]apad=pad_dur=%.3f[out]" % (len(tracks), tail)
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
    # ★ 渲完必过视频检察官（用户 2026-09-04：文字溢出黄框的视频「完全没法用」，不许再出）。
    #   不过就把 mp4 删掉——不合格的成品不许留在硬盘上。
    if "--no-inspect" not in sys.argv:
        r = subprocess.run([sys.executable, os.path.join(ROOT, "scripts", "video_inspector.py"), aid])
        if r.returncode:
            os.remove(out)
            sys.exit("视频检察官不过，已删除 %s" % os.path.relpath(out, ROOT))


if __name__ == "__main__":
    main()
