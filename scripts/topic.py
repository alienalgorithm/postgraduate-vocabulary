#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""选题三闸门 —— 动笔前一次跑完，不必记。

**立此工具之由**：选题那三步此前只写在《总令》里，全靠我读到并记住。
**第52篇因此栽了三次，每次都写到一半才发现**：
　**甲（大富翁）**：论点的**名词**被占光（board／squares／tokens／player／turn）；
　**乙（限嗣继承）**：论点的**动词**被占光（bargain／traded／bound／settled／exchanged）；
　**丙（劳合社）**：名词动词都够，**但核心词天然反复出现**——
　　syndicate 5 次、spiral 4 次、guarantee 4 次，**而名额只认第一次**，
　　撤掉重复加粗后名额从 48 掉到 36。

**三道闸门**：
　**一 · 可用词总量** —— `brief` 报的可用高价值词数，**低于 14 就换角度**；
　**二 · 名词与动词各过半** —— 论点句里的名词和动词分别 vet，**两边都要一半以上可用**；
　**三 · 没有一个词要贯穿五段** —— 数材料里各实词的出现次数，
　　**有词出现 ≥4 次就警告**（第47、51 篇之所以成稿，是因为每段换一批词）。

用法：
    python3 scripts/topic.py 材料.txt --nouns a b c --verbs x y z
    python3 scripts/topic.py 材料.txt          # 只跑闸门一与三
"""

import argparse
import os
import re
import subprocess
import sys
from collections import Counter

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
AG = os.path.join(ROOT, "scripts", "agent.py")


def run(args):
    return subprocess.run([sys.executable, AG] + args, cwd=ROOT,
                          capture_output=True, text=True, timeout=600).stdout


def main():
    ap = argparse.ArgumentParser(description="选题三闸门")
    ap.add_argument("notes")
    ap.add_argument("--nouns", nargs="*", default=[])
    ap.add_argument("--verbs", nargs="*", default=[])
    a = ap.parse_args()

    print("=" * 66)
    print("选题三闸门 · %s" % os.path.basename(a.notes))
    print("=" * 66)
    bad = []

    # ── 闸门一 ────────────────────────────────────────────────────
    out = run(["brief", a.notes])
    m = re.search(r"【可用高价值词】(\d+) 个", out)
    n = int(m.group(1)) if m else 0
    if n >= 18:
        print("  ✓ 一、可用词 %d 个 —— 够用。" % n)
    elif n >= 14:
        print("  · 一、可用词 %d 个 —— 偏少，写的时候会频繁替换。" % n)
    else:
        bad.append("闸门一")
        print("  ✗ 一、可用词 %d 个 —— **太少（<14）。换角度或换题材。**" % n)

    # ── 闸门二 ────────────────────────────────────────────────────
    # **这一门是第52篇乙稿的教训：名词全有、动词全无，写到一半才发现。**
    if a.nouns or a.verbs:
        for lbl, ws in (("名词", a.nouns), ("动词", a.verbs)):
            if not ws:
                continue
            o = run(["vet", "99"] + list(ws))
            ok = len(re.findall(r"^  ✓", o, re.M))
            rate = ok * 100 // len(ws)
            tag = "✓" if rate >= 50 else "✗"
            if rate < 50:
                bad.append("闸门二·" + lbl)
            print("  %s 二、%s %d/%d = %d%%" % (tag, lbl, ok, len(ws), rate))
            if rate < 50:
                print("      **缺哪一边都写不下去。**"
                      "（第52篇乙稿：名词全有、动词全无，写到一半才发现。）")
    else:
        print("  · 二、未给 --nouns/--verbs，此门跳过 —— "
              "**而第52篇乙稿正是栽在这一门上。**")

    # ── 闸门三 ────────────────────────────────────────────────────
    # **第52篇丙稿的教训：核心词天然反复出现，而名额只认第一次。**
    txt = open(a.notes, encoding="utf-8").read().lower()
    words = re.findall(r"[a-z][a-z\-']{4,}", txt)
    STOP = {"which", "their", "there", "these", "those", "would", "could",
            "about", "after", "before", "other", "under", "where", "while",
            "every", "first", "later", "never", "still", "until", "being",
            "because", "through", "against", "between", "however"}
    c = Counter(w for w in words if w not in STOP)
    # ★ 阈值定为 3，且此门只警告不否决 —— 判据经实测调过一次：
    # **最初定 ≥4，而丙稿材料里最高只有 syndicate×3，放了过去**；
    # **等到正文写出来才升到 syndicate×4、guaranteed×4。**
    # **材料阶段本就看不出正文会重复到什么程度**，故此门只能提示，
    #   真正的裁决在 review 的「篇内重点词重复」那一条。
    hot = [(w, k) for w, k in c.most_common(8) if k >= 3]
    if hot:
        print("  · 三、这些词在材料里已反复出现：%s"
              % "、".join("%s×%d" % (w, k) for w, k in hot))
        print("      **材料里出现 3 次，正文多半会到 4—5 次，而名额只认第一次。**")
        print("      第52篇丙稿写到 48 个名额，撤掉重复加粗后掉到 36。")
        print("      **第47、51 篇之所以成稿，是因为每一段换一批词。**")
        print("      **动笔时留意：这几个词每段只能加粗一次。**")
    else:
        print("  ✓ 三、材料里无实词出现 ≥3 次。")

    print()
    if bad:
        print("  ✗ 未过：%s" % "、".join(bad))
        print("  **否掉一个选题不是浪费，是省下十三轮。**")
        if "闸门一" in bad:
            print("  ★★ **不许用「域探到多少」去绕**（2026-09-03 立，废了十六稿才立）：")
            print("     第60篇南丁格尔 —— 本闸报可用词 12，我用「域探到 76%」绕过，十稿 285/45 废；")
            print("     第60篇泰晤士鲑鱼 —— 没跑本闸，事后补跑报 10，六稿 284/36 废。")
            print("     **域是域，论点是论点。本闸量的是论点能长出多少词。**")
            print("     **两篇的病相反（骨头太多／骨头太少），本闸用同一个数都逮住了。**")
        sys.exit(1)
    print("  ✓ 三门俱过，可以动笔。")
    print("  ★ 但仍须：**动笔前逐条上网核事实**（FACT-02 会查 facts 有无出处）。")


if __name__ == "__main__":
    main()
