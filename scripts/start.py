#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""开局自检 —— 一条命令把自己装好，不必任何人发任何东西。

**立此工具之由（2026-09-01 用户提出）**：
用户问「《总令》每次是不是要我发给你」。**答案是不必**——
它就在 `notes/总令.md`，随 `git clone` 一起回来。
本会话中途容器被重置，我用 token 重新 clone，**总令跟着回来了，
用的是仓库里那份，不是用户发的那份。**

**而我此前做错两件事**：
  一、往 outputs 拷了约十五次《总令》——**那是给用户制造活儿，他不需要拿它做任何事**；
  二、**没有把「开局怎么自己拿到它」写成机制**，于是用户会以为要靠他发。

本命令补的就是第二件：开局跑一次，把环境、工具、欠账一次报清。

用法：
    python3 scripts/start.py
"""
import os
import re
import subprocess
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CH = os.path.join(ROOT, "notes", "总令.md")
bad = []


def run(cmd, timeout=900):
    return subprocess.run(cmd, cwd=ROOT, shell=True, capture_output=True,
                          text=True, timeout=timeout).stdout


print("=" * 66)
print("开局自检")
print("=" * 66)

# ── 一、环境（容器重置后这两样必丢）────────────────────────────────
try:
    import wordfreq  # noqa: F401
    print("  ✓ wordfreq 已装")
except ImportError:
    bad.append("wordfreq")
    print("  ✗ wordfreq 未装 —— **词价层会跑不动并误报硬伤**")
    print("      pip install wordfreq --break-system-packages")

email = run("git config user.email").strip()
if email:
    print("  ✓ git 身份已设（%s）" % email)
else:
    bad.append("git 身份")
    print("  ✗ git 身份未设 —— **commit 会失败**")
    print('      git config user.email "..." && git config user.name "..."')

# ── 二、《总令》就在仓库里，不必任何人发 ──────────────────────────
if os.path.exists(CH):
    n = len(open(CH, encoding="utf-8").read().split("\n"))
    print("  ✓ 《总令》在 notes/总令.md（%d 行）—— **随 clone 一起回来，不必谁发**" % n)
else:
    bad.append("总令")
    print("  ✗ 找不到 notes/总令.md")

# ── 三、工具是否齐、是否都写进了《总令》────────────────────────────
out = run("python3 scripts/test_tools.py")
m = re.search(r"通过 (\d+) · 失败 (\d+)", out)
if m and m.group(2) == "0":
    print("  ✓ 回归测试 %s 条全过（含「每一件工具都在《总令》里出现过」）" % m.group(1))
else:
    bad.append("回归测试")
    print("  ✗ 回归测试未全过：%s" % (m.group(0) if m else "跑不动"))

# ── 四、当前状态 ──────────────────────────────────────────────────
out = run("python3 scripts/inspector.py")
m = re.search(r"全库 (\d+) 篇 · 硬伤合计 (\d+) 条 · 平均分 ([\d.]+)", out)
if m:
    tag = "✓" if m.group(2) == "0" else "✗"
    if m.group(2) != "0":
        bad.append("硬伤")
    print("  %s 全库 %s 篇 · 硬伤 %s · 均分 %s"
          % (tag, m.group(1), m.group(2), m.group(3)))

st = run("git status --porcelain").strip()
print("  %s 工作区%s" % ("✓" if not st else "·",
                        "干净" if not st else "有未提交改动 %d 处" % len(st.split("\n"))))

# ── 五、欠账：唯一受时间约束的活 ──────────────────────────────────
try:
    import importlib.util as ilu
    sp = ilu.spec_from_file_location("coldread",
                                     os.path.join(ROOT, "scripts", "coldread.py"))
    cr = ilu.module_from_spec(sp)
    sp.loader.exec_module(cr)
    rows = cr.survey()
    p = cr.pending(rows)
    if p:
        print("  · 冷读队列：%d 篇待读（**唯一受时间约束的活**）"
              % len(p))
        print("      欠得最久：%s" % "、".join(x["aid"] + "篇" for x in p[:5]))
        print("      python3 scripts/coldread.py next")
    else:
        print("  ✓ 冷读队列已清空")
except Exception as e:
    print("  · 冷读队列读不出：%s" % str(e)[:60])

# ── 六、空档 ──────────────────────────────────────────────────────
if os.path.exists(CH):
    t = open(CH, encoding="utf-8").read()
    m = re.search(r"\|\s*\*\*★([^|]+)\*\*\s*\|", t)
    if m:
        print("  · 下一篇可直接动笔的题材：**%s**（已核，有真反转）" % m.group(1).strip())

print()
if bad:
    print("  ✗ 先修这些：%s" % "、".join(bad))
    sys.exit(1)
print("  ✓ 装好了。**用户什么都不必发** —— 直接说「跑NN」「写NN」或「冷读」。")
