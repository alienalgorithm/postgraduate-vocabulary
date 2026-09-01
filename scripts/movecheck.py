#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""挪句预演 —— 挪之前先算挪完会是多少。

**立此工具之由（同一个错犯了两次）**：
　**第34篇**：段长极差 22，我把 §1 的一句挪进 §2 想摊平——
　　**结果极差变成 38，比动手前更差**（§1 本就是最短段，我却从它身上再拿走一句）。
　**第46篇**：段长极差 20，我把 §3 的一句挪到 §4——
　　**结果极差变成 34**（§3 挪走一句后反成最短段）。
**两次的病根完全相同：我知道该摊平，但没算「挪完会是多少」就动手了。**
这件事完全可以机械算——本命令把每一种可能的挪法都算一遍，一次列全。

**用法**：
    python3 scripts/movecheck.py 46

**输出**：当前段长与极差，然后逐句列出「把这句挪到相邻段」之后的极差，
按改善幅度排序。**变差的用 ✗ 标出，好让人一眼看见「不该挪」。**

**★ 本命令只算长度。** 句子挪过去读不读得通、论证还成不成立，机器不管——
**极差改善不等于文章变好**（第34、46 两篇最终都判为「不挪」，因为那几句拆开就断）。
"""

import json
import os
import subprocess
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(ROOT, "scripts"))
import core  # noqa: E402

if len(sys.argv) < 2:
    print(__doc__)
    sys.exit(0)
aid = sys.argv[1].zfill(2)

fs = [os.path.join(ROOT, "data", "articles.js")] + sorted(
    os.path.join(ROOT, "data", f)
    for f in os.listdir(os.path.join(ROOT, "data"))
    if f.startswith("article-") and f.endswith(".js"))
js = ("globalThis.window=globalThis;"
      + "".join("require(%s);" % json.dumps(f) for f in fs)
      + "process.stdout.write(JSON.stringify(globalThis.SITE.ARTICLES))")
r = subprocess.run(["node", "-e", js], cwd=ROOT, capture_output=True, text=True)
arts = json.loads(r.stdout)
hit = [x for x in arts if x["id"] == aid]
if not hit:
    print("没有第%s篇" % aid)
    sys.exit(1)
art = hit[0]

sents = [[s for s in core.sentences(p["en"])] for p in art["paras"]]
lens = [core.count_words(p["en"]) for p in art["paras"]]
now = max(lens) - min(lens)

print("=" * 66)
print("挪句预演 · 第%s篇" % aid)
print("=" * 66)
print("  当前段长 %s　极差 **%d**　（范文 7—17）" % (lens, now))
print()

rows = []
for i, ss in enumerate(sents):
    if len(ss) < 2:          # 只剩一句的段不能再挪走
        continue
    for k, s in enumerate(ss):
        w = core.count_words(s)
        for j in (i - 1, i + 1):
            if not 0 <= j < len(lens):
                continue
            new = list(lens)
            new[i] -= w
            new[j] += w
            rows.append((max(new) - min(new), i + 1, j + 1, w,
                         core.plain(s).strip()[:44], new))

if not rows:
    print("  没有可挪的句子（每段都只剩一句）。")
    sys.exit(0)

rows.sort(key=lambda x: x[0])
print("  把某一句挪到相邻段之后，极差会变成：")
print()
best = rows[0][0]
for g, i, j, w, txt, new in rows[:12]:
    tag = "✓" if g < now else ("·" if g == now else "✗")
    print("  %s 极差 %2d  §%d→§%d（%d词） %s" % (tag, g, i, j, w, new))
    print("        「%s…」" % txt)
print()
if best >= now:
    print("  ✗ **没有任何一种挪法能改善极差。不要挪。**")
    print("    （第34、46 两篇都是在这一步动了手，结果比动手前更差。）")
else:
    print("  · 最好的一种能把极差降到 %d。" % best)
print()
print("  ★ **本命令只算长度。** 挪过去读不读得通、论证还成不成立，机器不管——")
print("    **极差改善不等于文章变好**：第34、46 两篇最终都判为「不挪」，")
print("    因为那几句装的是完整机制链，拆开哪一节都断。")
