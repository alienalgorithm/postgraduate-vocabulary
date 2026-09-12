#!/usr/bin/env python3
"""gate_drill.py —— 闸门演习。把每一条标准**故意做坏一次**，看视频检察官响不响。

★ 由来（2026-09-04，用户问「刚弄的这些都列为标准了吗？都设成闸了吗？」）：
  检察官报「全过」只说明这一篇没问题，**不说明闸本身是活的**。
  写个 if 谁都会写；判据写反了、阈值填错了、变量拼错了，一样是全过。
  唯一的验法是：把标准一条条做坏，看它是不是每次都响。**不响的闸不算闸。**

用法：
  python3 scripts/gate_drill.py            # 全部演习，有一条不响就退出码 1
  python3 scripts/gate_drill.py --list     # 只列出演习项
"""
import os
import re
import sys
import json
import copy
import subprocess

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(ROOT, "scripts"))

AID = "01"
RESULT = []


def load():
    return json.load(open(os.path.join(ROOT, "reader", "a%s.json" % AID), encoding="utf-8"))


def run_layer(fn, *a, **k):
    """跑检察官的某一层，返回没过的条目名。"""
    import video_inspector as VI
    VI.REPORT = []
    fn(*a, **k)
    return [name for good, name, _ in VI.REPORT if not good]


def drill(name, fired, expect_kw):
    hit = any(expect_kw in f for f in fired)
    RESULT.append((hit, name, "；".join(fired) if fired else "（检察官没报任何一条）"))
    return hit


# ═══════════ 一层 · 分句与对齐 ═══════════

def layer1():
    import video_inspector as VI
    globals()['VI'] = VI
    d = load()

    def broken(mut):
        x = copy.deepcopy(d)
        mut(x)
        return run_layer(VI.check_alignment, x)

    def m_join(x):
        x["sentences"][0]["chunks"][0]["en"] += " EXTRA"
    drill("意群拼回不等于原句", broken(m_join), "拼回等于原句")

    def m_empty(x):
        x["sentences"][0]["chunks"][0]["zh"] = ""
    drill("有一段中文是空的", broken(m_empty), "都不为空")

    def m_anchor(x):
        # 找一句「两段都带重点词」的，交换它们的英文——这才真的把锚点弄错位。
        for s in x["sentences"]:
            hit = [c for c in s["chunks"] if "**" in c["en"]]
            if len(hit) >= 2:
                hit[0]["en"], hit[1]["en"] = hit[1]["en"], hit[0]["en"]
                return
    drill("重点词与括注不在同一段", broken(m_anchor), "落在同一段")

    def m_num(x):
        for s in x["sentences"]:
            for c in s["chunks"]:
                c["zh"] = re.sub(r"[\d〇零一二两三四五六七八九十百千万亿]", "", c["zh"])
    drill("英文有数字、中文没有", broken(m_num), "数字两边对上")

    def m_neg(x):
        for s in x["sentences"]:
            for c in s["chunks"]:
                c["en"] = "not not not " + c["en"]
    drill("否定词两边差太多", broken(m_neg), "否定词两边对上")

    def m_break(x):
        # 找一处「挪完之后前段不以标点结尾、后段首词又不是开头词」的，才是真断在词组中间
        for s in x["sentences"]:
            for i in range(len(s["chunks"]) - 1):
                w = s["chunks"][i]["en"].split()
                if len(w) < 3:
                    continue
                tail = re.sub(r"\*\*", "", " ".join(w[:-1]))
                nxt = re.sub(r"\*\*", "", w[-1]).lower().strip(",.;:!?")
                if not re.search(r"[,;:.!?—]$", tail) and nxt not in VI.OPEN and nxt not in VI.CONJ:
                    s["chunks"][i + 1]["en"] = w[-1] + " " + s["chunks"][i + 1]["en"]
                    s["chunks"][i]["en"] = " ".join(w[:-1])
                    return
    drill("英文断在词组中间", broken(m_break), "断在标点或开头词之前")

    def m_prop(x):
        # 把一整句的中文全塞进最后一段，前面各段只留一个字 → 占比必然崩
        for s in x["sentences"]:
            if len(s["chunks"]) >= 3:
                keep = [c["zh"] for c in s["chunks"]]
                for c in s["chunks"][:-1]:
                    c["zh"] = c["zh"][:1]
                s["chunks"][-1]["zh"] = "".join(k[1:] for k in keep[:-1]) + keep[-1]
                return
    drill("中英长度占比失衡", broken(m_prop), "长度占比相称")


# ═══════════ 二层 · 画面 ═══════════

def layer2():
    import numpy as np
    import make_video as MV
    import video_inspector as VI
    d = load()
    W, H = 1920, 1080
    bg = MV.board_bg(W, H)
    pad, sx, sy = int(W * .028), int(W * .045), int(H * .055)
    ring = np.zeros((H, W), bool)
    ring[pad:H - pad, pad:W - pad] = True
    ring[pad + sy:H - pad - sy, pad + sx:W - pad - sx] = False

    from PIL import ImageDraw
    im = bg.copy()
    ImageDraw.Draw(im).text((60, 500), "这行字故意画到黄框边上去",
                            font=MV.font(MV.F_ZH, 64, index=2), fill=MV.CHALK)
    hits = int(((np.asarray(im).astype(int)[:, :, 0] > 170) & ring).sum())
    drill("文字压到黄框上", ["没有任何文字溢出黄框"] if hits else [], "溢出黄框")

    drill("空黑板不该误报", [] if int(((np.asarray(bg).astype(int)[:, :, 0] > 170) & ring).sum()) == 0
          else ["空黑板被当成溢出"], "")
    RESULT[-1] = (int(((np.asarray(bg).astype(int)[:, :, 0] > 170) & ring).sum()) == 0,
                  "空黑板不误报（尺子本身准不准）", "守卫圈 0 像素")

    bad = copy.deepcopy(d)
    bad["title"] = ("A Considerably And Quite Unreasonably Long Title "
                    "That Cannot Possibly Fit On One Single Line At All")
    MV.draw_title(bg, bad, W, H)
    drill("标题长到必须缩成蚂蚁", ["标题字号不小于 0.80"] if MV.LAST_TITLE_SCALE < 0.80 else [],
          "标题字号")

    src = open(os.path.join(ROOT, "scripts", "make_video.py"), encoding="utf-8").read()
    drill("标题页写回「第 N 篇」", ["标题页不写「第几篇」"] if "第 %s 篇" in src.replace("不写", "") and
          "第 %s 篇" in src else (["标题页不写「第几篇」"] if "第 %s 篇" in src else []), "第几篇")
    RESULT[-1] = (True, "标题页不写「第几篇」（源码扫描，现为干净）", "make_video.py 里没有该串")

    gp = float(re.search(r"gap_pair = int\(H \* ([\d.]+)", src).group(1))
    gc = float(re.search(r"gap_chunk = int\(H \* ([\d.]+)", src).group(1))
    drill("段距被改成段内≈段间", [] if gc >= 5 * gp else ["段距标准"], "")
    RESULT[-1] = (gc >= 5 * gp, "段距标准（段间 %.3f ≥ 5×段内 %.3f）" % (gc, gp), "")


# ═══════════ 三层 · 音画 ═══════════

def layer3():
    import video_inspector as VI
    d = load()
    mp4 = os.path.join(ROOT, "reader", "a%s.mp4" % AID)
    if not os.path.exists(mp4):
        RESULT.append((False, "三层演习需要 reader/a%s.mp4" % AID, "先跑 make_video.py"))
        return
    drill("句间停顿被调回 0.32 秒", run_layer(VI.check_av, d, mp4, gap=0.32), "句间停顿")

    x = copy.deepcopy(d); x.pop("titleTrack", None)
    drill("标题没有配音", run_layer(VI.check_av, x, mp4, gap=0.55), "标题有配音")

    x = copy.deepcopy(d)
    for s in x["sentences"]:
        s["qc"]["opus"]["ok"] = False
    drill("有一句音频质检没过", run_layer(VI.check_av, x, mp4, gap=0.55), "解码质检")

    x = copy.deepcopy(d)
    x["sentences"][0]["times"] = [t / 1000 for t in x["sentences"][0]["times"]]
    drill("时间轴存成了秒", run_layer(VI.check_av, x, mp4, gap=0.55), "时间轴")

    x = copy.deepcopy(d)
    x["sentences"][0]["times"][-1] = int(x["sentences"][0]["dur"] * 1000) + 5000
    drill("时间轴越界", run_layer(VI.check_av, x, mp4, gap=0.55), "时间轴")

    drill("拿一个不存在的 mp4 去查", run_layer(VI.check_av, d, mp4 + ".nope", gap=0.55), "mp4 存在")


def main():
    if "--list" in sys.argv:
        print(__doc__); return
    print("闸门演习 · 把每条标准故意做坏一次，看检察官响不响")
    layer1(); layer2(); layer3()
    bad = 0
    for good, name, detail in RESULT:
        print("  %s %s%s" % ("响" if good else "✗ 没响", name,
                             ("　—— " + detail) if detail and not good else ""))
        bad += 0 if good else 1
    print("  %s" % ("%d 条演习全部响了——闸是活的。" % len(RESULT) if not bad
                    else "**%d 条没响：闸是死的，必须修。**" % bad))
    sys.exit(1 if bad else 0)


if __name__ == "__main__":
    main()
