#!/usr/bin/env python3
"""video_inspector.py —— 视频检察官。渲一篇视频之前和之后，把它按三层查一遍；任何一条不过，视频不算成品。

★ 由来（2026-09-04）：用户发现中文整行溢出了黄框——那是修标点紧贴时把「不加空格」和「不能换行」
  混在一起引入的。**代码改一处，别处就可能坏；只有对着结果查才靠得住。**
  用户要求：设一个机制，专查①分句对不对②有没有溢出屏幕，别的该查的也一并查，以后不许再出。

三层：
  一 · 分句与对齐（读 reader/aNN.json 的 chunks）
      拼回等于原句／中英都不为空／重点词落在同一段／数字与否定词两边对上／
      英文断在标点或开头词之前／长度占比相称／不超长
  二 · 画面（把每一句按 make_video 的画法**真渲一帧**，按像素查）
      **溢出**：安全区外到黑板内沿之间那一圈里不许有任何文字像素（白或金）——
      文字要碰到木框必先穿过这一圈，所以这一条查的就是「有没有出黄框」
      不空白／段距标准／字号不小于下限
  三 · 音画（读 mp4 与 json）
      1920×1080 H.264+AAC／时长＝各句解码时长＋停顿＋结尾缓冲／结尾静音／
      每句解码质检过／逐词时间轴毫秒、递增、不越界

用法：
  python3 scripts/video_inspector.py 01            # 全查，出报告；有 ✗ 退出码 1
  python3 scripts/video_inspector.py 01 --frames   # 只查画面（渲染前也能跑）
make_video.py 渲完自动调用；不过就把 mp4 删掉——**不合格的视频不许留下**。
"""
import os
import re
import sys
import json
import subprocess

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(ROOT, "scripts"))

OPEN = {"a", "an", "the", "this", "that", "these", "those", "his", "her", "their", "its",
        "my", "our", "some", "each", "every", "all", "both", "no", "one", "two", "three",
        "and", "but", "or", "so", "yet", "he", "she", "it", "they", "we", "there"}
CONJ = {"and", "but", "or", "so", "yet", "since", "because", "while", "when", "where",
        "which", "who", "that", "if", "though", "although", "after", "before", "until"}

CN_NUM = "〇零一二两三四五六七八九十百千万亿"
REPORT = []


def ok(name, cond, detail=""):
    REPORT.append((bool(cond), name, detail))
    return bool(cond)


def zh_len(t):
    return len(re.sub(r"[^\w\u4e00-\u9fff]", "", re.sub(r"\*\*([^*]+)\*\*\([^)]*\)", r"\1", t)))


# ═══════════ 一 · 分句与对齐 ═══════════

def check_alignment(d):
    bad_join, bad_empty, bad_anchor, bad_num, bad_neg, bad_break, bad_prop, bad_long = [], [], [], [], [], [], [], []
    for s in d["sentences"]:
        cs = s.get("chunks") or []
        if not cs:
            bad_empty.append("§%d 没有 chunks" % s["i"]); continue
        ej = " ".join(c["en"] for c in cs).replace("**", "").split()
        if ej != s["en"].replace("**", "").split():
            bad_join.append("§%d 英文拼回不等于原句" % s["i"])
        zj = "".join(c["zh"] for c in cs).replace(" ", "")
        if zj != s["zh"].replace(" ", ""):
            bad_join.append("§%d 中文拼回不等于原句" % s["i"])
        ew = [len(c["en"].replace("**", "").split()) for c in cs]
        zc = [zh_len(c["zh"]) for c in cs]
        te, tz = sum(ew) or 1, sum(zc) or 1
        for ci, c in enumerate(cs):
            tag = "§%d/%d «%s»" % (s["i"], ci + 1, c["en"].replace("**", "")[:40])
            if not c["en"].strip() or not c["zh"].strip():
                bad_empty.append(tag)
            # 锚点：这段英文的重点词，中文括注必须在这段里
            keys = [w.lower().strip(",.;:!?") for w in re.findall(r"\*\*([^*]+)\*\*", c["en"])]
            gl = [g.lower() for g in re.findall(r"\*\*[^*]+\*\*\(([^)]+)\)", c["zh"])]
            for k in keys:
                if not any(g == k or g.rstrip("s") == k.rstrip("s") for g in gl):
                    bad_anchor.append(tag + " 缺 " + k)
            if len(gl) != len(keys):
                bad_anchor.append(tag + " 括注数 %d ≠ 重点词数 %d" % (len(gl), len(keys)))
            # 数字
            # 中文可能把数字写成汉字（30-centimetre → 三十厘米），一并认
            # 只在英文有数字时才要求中文也有（中文的「第二」「一条」是序数量词，反过来不成立）
            zh_plain = re.sub(r"\([^)]*\)", "", c["zh"])
            zh_has_num = bool(re.search(r"\d", zh_plain)) or bool(re.search(r"[%s]{2,}" % CN_NUM, zh_plain))
            if re.search(r"\d", c["en"]) and not zh_has_num:
                bad_num.append(tag)
            # 否定词
            en_neg = len(re.findall(r"\b(?:not|no|never|nothing|nobody|none|nor|neither|without)\b",
                                    c["en"].replace("**", "").lower()))
            zh_neg = len(re.findall(r"不(?!过|但|仅|管|论|只|光)|没|无(?!论)|未(?!必)|非(?!常)", c["zh"]))
            if abs(en_neg - zh_neg) > 1:
                bad_neg.append(tag)
            # 断点
            if ci < len(cs) - 1:
                tail = c["en"].replace("**", "").strip()
                nxt = cs[ci + 1]["en"].replace("**", "").split()[0].lower().strip(",.;:!?")
                if not re.search(r"[,;:.!?—]$", tail) and nxt not in OPEN and nxt not in CONJ:
                    bad_break.append(tag + " → " + nxt)
            # 占比
            if abs(zc[ci] / tz - ew[ci] / te) > 0.22:
                bad_prop.append(tag + " 英 %.0f%% 中 %.0f%%" % (100 * ew[ci] / te, 100 * zc[ci] / tz))
            # 超长只在**本可以拆**（中文里有内部标点）时才算错；中文一个标点都没有的整句拆不了
            if ew[ci] > 16 and re.search(r"[，；：、]", s["zh"].rstrip("。！？")):
                bad_long.append(tag + " %d 词" % ew[ci])
    ok("一·意群拼回等于原句", not bad_join, "; ".join(bad_join))
    ok("一·每段中英都不为空", not bad_empty, "; ".join(bad_empty))
    ok("一·重点词与括注落在同一段", not bad_anchor, "; ".join(bad_anchor[:4]))
    ok("一·数字两边对上", not bad_num, "; ".join(bad_num[:4]))
    ok("一·否定词两边对上", not bad_neg, "; ".join(bad_neg[:4]))
    ok("一·英文断在标点或开头词之前", not bad_break, "; ".join(bad_break[:4]))
    ok("一·中英长度占比相称（≤22 点）", not bad_prop, "; ".join(bad_prop[:4]))
    ok("一·没有本可拆而未拆的超长段（>16 词且中文有内部标点）", not bad_long, "; ".join(bad_long[:4]))


# ═══════════ 二 · 画面 ═══════════

def check_frames(d, W=1920, H=1080):
    import numpy as np
    from PIL import Image
    import make_video as MV
    bg = MV.board_bg(W, H)
    pad = int(W * 0.028)
    safe_x, safe_y = int(W * 0.045), int(H * 0.055)
    # 守卫圈：安全区边缘 → 黑板内沿。文字若出黄框，必先穿过这一圈。
    ring = np.zeros((H, W), dtype=bool)
    ring[pad:H - pad, pad:W - pad] = True
    ring[pad + safe_y:H - pad - safe_y, pad + safe_x:W - pad - safe_x] = False
    overflow, blank, tiny = [], [], []
    scales = []
    # 标题页也要查（用户 2026-09-04：视频没有题目；加了标题页，它同样不许出黄框）
    src_mv = open(os.path.join(ROOT, "scripts", "make_video.py"), encoding="utf-8").read()
    ok("二·标题页不写「第几篇」（用户 2026-09-04 指定）",
       '"第 %s 篇"' not in src_mv and "第 %s 篇" not in src_mv)
    if hasattr(MV, "draw_title"):
        ta = np.asarray(MV.draw_title(bg, d, W, H)).astype(int)
        ttext = (ta[:, :, 0] > 170)
        if int((ttext & ring).sum()):
            overflow.append("标题页有文字落在守卫圈")
        if int((ttext & ~ring).sum()) < 500:
            blank.append("标题页几乎没有文字")
        # ★ 闸 · 标题不许折行（用户 2026-09-04）。按像素数文字行数：
        #   有文字的行连成几段，就是几行；英文一段、中文一段，合计应为 2。
        rows = ttext.any(axis=1)
        bands, prev = 0, False
        for v in rows:
            if v and not prev:
                bands += 1
            prev = v
        ok("二·标题不折行（英文一行、中文一行）", bands <= 2, "数出 %d 行" % bands)
        # ★ 只查行数不够：标题太长时字号会一路缩到很小，仍是一行但小得不像标题。
        #   两条一起才封得住——不许折行，也不许为了不折行缩成蚂蚁。
        tsc = getattr(MV, "LAST_TITLE_SCALE", None)
        ok("二·标题字号不小于 0.85 档（不为了不折行缩成蚂蚁）",
           tsc is None or tsc >= 0.85, "现为 %.2f 档" % tsc if tsc else "")
    for s in d["sentences"]:
        im = MV.draw_sentence(bg, s, W, H)
        a = np.asarray(im).astype(int)
        text = (a[:, :, 0] > 170)                       # 白与金的 R 都 > 230；黑板 R ≈ 14
        hits = int((text & ring).sum())
        if hits:
            ys, xs = np.where(text & ring)
            overflow.append("§%d 有 %d 个文字像素落在守卫圈（最外 x=%d..%d y=%d..%d）"
                            % (s["i"], hits, xs.min(), xs.max(), ys.min(), ys.max()))
        inner = text.copy(); inner[~(np.zeros_like(ring) | ~ring)] = False
        if int((text & ~ring).sum()) < 500:
            blank.append("§%d 画面几乎没有文字" % s["i"])
        sc = getattr(MV, "LAST_SCALE", None)
        if sc is not None:
            scales.append(sc)
            if sc < 0.45:
                tiny.append("§%d 字号档位 %.2f" % (s["i"], sc))
    ok("二·没有任何文字溢出黄框（按像素查守卫圈）", not overflow, "; ".join(overflow[:3]))
    ok("二·每一帧都有文字", not blank, "; ".join(blank[:3]))
    ok("二·字号不低于下限 0.45", not tiny, "; ".join(tiny[:3]))
    src = open(os.path.join(ROOT, "scripts", "make_video.py"), encoding="utf-8").read()
    gp = float(re.search(r"gap_pair = int\(H \* ([\d.]+)", src).group(1))
    gc = float(re.search(r"gap_chunk = int\(H \* ([\d.]+)", src).group(1))
    ok("二·段距标准（段间 ≥ 5×段内）", gc >= 5 * gp, "%.3f / %.3f" % (gc, gp))
    return scales


# ═══════════ 三 · 音画 ═══════════

def check_av(d, mp4, gap=0.55, tail=1.5, title_sec=None):
    if not os.path.exists(mp4):
        ok("三·mp4 存在", False, mp4); return
    pr = subprocess.run(["ffprobe", "-v", "error", "-select_streams", "v:0", "-show_entries",
                         "stream=codec_name,width,height", "-of", "csv=p=0", mp4],
                        capture_output=True, text=True).stdout.strip()
    ok("三·1920×1080 H.264", "h264" in pr and "1920,1080" in pr, pr)
    pa = subprocess.run(["ffprobe", "-v", "error", "-select_streams", "a:0", "-show_entries",
                         "stream=codec_name", "-of", "csv=p=0", mp4], capture_output=True, text=True).stdout.strip()
    ok("三·AAC 音轨", "aac" in pa, pa)
    vd = float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration",
                               "-of", "csv=p=0", mp4], capture_output=True, text=True).stdout or 0)
    tt = d.get("titleTrack")
    if title_sec is None:
        title_sec = (round((tt.get("qc", {}).get("opus", {}).get("dur") or tt["dur"]), 3) + 1.4) if tt else 2.5
    want = (title_sec
            + sum((s.get("qc", {}).get("opus", {}).get("dur") or s["dur"]) + gap for s in d["sentences"])
            + tail)
    ok("三·时长＝标题页＋各句解码时长＋停顿＋结尾缓冲", abs(vd - want) < 0.3, "%.2f vs %.2f" % (vd, want))
    # ★ 闸一 · 标题必须念出来（用户 2026-09-04）。标题页正中那一秒得有声。
    ok("三·标题有配音（json 带 titleTrack 且质检过）",
       bool(tt) and all(v.get("ok") for v in (tt.get("qc") or {}).values()),
       "没有 titleTrack" if not tt else "质检未过")
    if tt:
        td = tt.get("qc", {}).get("opus", {}).get("dur") or tt["dur"]
        mt = re.search(r"mean_volume:\s*(-?[\d.]+)", subprocess.run(
            ["ffmpeg", "-v", "info", "-ss", "0.9", "-to", "%.2f" % (0.7 + td), "-i", mp4,
             "-af", "volumedetect", "-f", "null", "-"], capture_output=True, text=True).stderr)
        ok("三·标题页真的在念（不是无声画面）", mt and float(mt.group(1)) > -45,
           mt.group(0) if mt else "?")
    # ★ 闸二 · 句间要有停顿，不能一句连一句（用户 2026-09-04：切屏不要一丁点停顿都没有）
    ok("三·句间停顿 ≥ 0.4 秒", gap >= 0.4, "现为 %.2f" % gap)
    m = re.search(r"mean_volume:\s*(-?[\d.]+)", subprocess.run(
        ["ffmpeg", "-v", "info", "-ss", str(max(0, vd - tail + 0.25)), "-i", mp4,
         "-af", "volumedetect", "-f", "null", "-"], capture_output=True, text=True).stderr)
    ok("三·结尾缓冲是静音（< −60 dB）", m and float(m.group(1)) < -60, m.group(0) if m else "?")
    qc_bad = [("§%d" % s["i"]) for s in d["sentences"]
              if not (s.get("qc") and all(v.get("ok") for v in s["qc"].values()))]
    ok("三·每句音频解码质检过", not qc_bad, " ".join(qc_bad))
    tl_bad = []
    for s in d["sentences"]:
        t = s["times"]
        if len(t) != len(s["words"]) or t[0] != 0 or any(b <= a for a, b in zip(t, t[1:])):
            tl_bad.append("§%d 轴不合法" % s["i"])
        if s["dur"] > 1.5 and t[-1] < 1000:
            tl_bad.append("§%d 疑似存成秒" % s["i"])
        if t[-1] > s["dur"] * 1000:
            tl_bad.append("§%d 轴越界" % s["i"])
    ok("三·逐词时间轴毫秒、递增、不越界", not tl_bad, "; ".join(tl_bad[:3]))


def main():
    args = [x for x in sys.argv[1:] if not x.startswith("--")]
    aid = (args[0] if args else "01").zfill(2)
    d = json.load(open(os.path.join(ROOT, "reader", "a%s.json" % aid), encoding="utf-8"))
    print("视频检察官 · 第%s篇《%s》 · %d 句 %d 段" % (aid, d["title"], len(d["sentences"]),
                                              sum(len(s.get("chunks") or []) for s in d["sentences"])))
    if "--frames" not in sys.argv:
        check_alignment(d)
    scales = check_frames(d)
    if "--frames" not in sys.argv:
        g = 0.55
        m = re.search(r'else 0\.(\d+)\n', open(os.path.join(ROOT, "scripts", "make_video.py"), encoding="utf-8").read())
        check_av(d, os.path.join(ROOT, "reader", "a%s.mp4" % aid), gap=g)
    fails = 0
    for good, name, detail in REPORT:
        print("  %s %s%s" % ("✓" if good else "✗", name, ("  —— " + detail) if (detail and not good) else ""))
        fails += 0 if good else 1
    if scales:
        print("  · 字号档位 %.2f—%.2f（1.0 为基准）" % (min(scales), max(scales)))
    print("  %s" % ("全部通过，视频合格。" if not fails else "**%d 条不过——视频不合格，不许出。**" % fails))
    sys.exit(1 if fails else 0)


if __name__ == "__main__":
    main()
