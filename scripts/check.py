#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""改完立刻查 —— 把「改后要跑三样」合成一步。

**立此工具之由**：本会话 25 次自伤全部被 preflight 拦下、无一上到 GitHub，
**所以代价从来不是仓库坏掉，而是「我多花一轮」。**
而多花那一轮的原因是**发现得太晚**：改完之后要跑
    build_markdown → inspector → rescan
三样，我常常只跑第二样，于是 markdown 与数据层脱节、自伤无人发现。

**这一条命令把三样合一，且默认查全库**——因为改一篇常会碰坏另一篇
（本会话 severed 撞第20篇，就是改第09篇时撞出来的）。

用法：
    python3 scripts/check.py            # 全库
    python3 scripts/check.py 39         # 只查一篇（仍会跑全库跨篇校验）
"""
import os
import subprocess
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
aid = sys.argv[1].zfill(2) if len(sys.argv) > 1 else None
bad = []

print("=" * 64)
print("改后复查 · " + (("第%s篇" % aid) if aid else "全库"))
print("=" * 64)


def step(name, cmd, ok, note=""):
    r = subprocess.run(cmd, cwd=ROOT, shell=True,
                       capture_output=True, text=True, timeout=900)
    good = ok(r.stdout)
    print("  %s %s" % ("✓" if good else "✗", name))
    if not good:
        bad.append(name)
        for ln in r.stdout.split("\n"):
            if "✗" in ln:
                print("      " + ln.strip()[:96])
        if note:
            print("      → " + note)
    return r.stdout


# 一、markdown 与数据层：漏跑这一步，网页与数据就对不上
step("markdown 构建（含跨篇重复校验）",
     "python3 scripts/build_markdown.py",
     lambda o: "全部通过" in o,
     "**跨篇同形/同词元就在这一步报**——改一篇常会撞到另一篇")

# 二、检察官：硬伤必须为零
out = step("检察官（全库硬伤须为 0）",
           "python3 scripts/inspector.py",
           lambda o: "硬伤合计 0 条" in o,
           "MET-07/08 报中英失配、VAL-07/08 报跨篇撞车、VAL-14 报屈折绕过")
for ln in out.split("\n"):
    if "硬伤合计" in ln:
        print("      " + ln.strip())

# 三、回扫：改动引入的风险，机器不下结论，只摆出来
if aid:
    r = subprocess.run("python3 scripts/rescan.py %s" % aid, cwd=ROOT,
                       shell=True, capture_output=True, text=True, timeout=300)
    n = [x for x in r.stdout.split("\n") if "待人工判" in x]
    print("  · 回扫（改动引入的风险，须人判）：%s"
          % (n[0].strip() if n else "无上一版可比"))

print()
if bad:
    print("  ✗ 未通过：%s" % "、".join(bad))
    print("  **改完立刻查，就是为了不把问题拖到 preflight 那一刻。**")
    sys.exit(1)
print("  ✓ 全部通过。**回扫报出的项仍须逐处人判**——机器不替人下结论。")
