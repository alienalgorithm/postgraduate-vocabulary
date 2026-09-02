#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""等长改 —— 改完自动比对词数，长了就不落盘。

**立此工具之由（同一次会话里犯了五次）**：
　修既有篇目时我反复「插一句却不同步削词」，每次都要靠 `git checkout` 回滚：
　　**第27篇** 271→282 词，随后十轮削词越削越碎，**中途掉到 68 分**；
　　**第19篇** 插一句 19 词，**88→77**；改口说「等长替换」却又写更长，**掉到 68**；
　　**第48篇** 加 6 词、**第51篇** 加 3 词，两篇同时变差。
**《总令》里「只做三类等长动作」那条是我自己写的，写完两小时内又犯了两次。**
**——写进文档挡不住，必须让机器拦。**

**用法**（在改动脚本里）：

    from lockstep import guard
    with guard('48'):      # 进入时记下词数
        ...改动...          # 退出时比对；长了就抛错，改动不落盘

或直接命令行核验某篇当前词数是否仍在 240—270：

    python3 scripts/lockstep.py 48
"""

import contextlib
import json
import os
import subprocess
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(ROOT, "scripts"))
import core  # noqa: E402

WORD_MAX = 270


def _read(aid):
    p = os.path.join(ROOT, "data", "article-%s.js" % aid)
    if not os.path.exists(p):
        p = os.path.join(ROOT, "data", "articles.js")
    js = ("globalThis.window=globalThis;require(%s);"
          "process.stdout.write(JSON.stringify(globalThis.SITE.ARTICLES))"
          % json.dumps(p))
    A = json.loads(subprocess.run(["node", "-e", js], cwd=ROOT,
                                  capture_output=True, text=True).stdout)
    a = [x for x in A if x["id"] == aid][0]
    return core.metrics(a["paras"])["words"]


def _path(aid):
    p = os.path.join(ROOT, "data", "article-%s.js" % aid)
    return p if os.path.exists(p) else os.path.join(ROOT, "data", "articles.js")


@contextlib.contextmanager
def guard(aid, allow_growth=0):
    """改动前后比对词数。**长了就抛错并把文件回滚**，除非显式给出 allow_growth。

    ★ 第一版只抛错不回滚，而 save() 在 guard 退出前就已落盘 ——
      **拦下了却没拦住**（第51篇实测：报错了，文件已经改了）。
      现在进入时留一份副本，出错即写回。
    """
    before = _read(aid)
    _p = _path(aid)
    _backup = open(_p, encoding="utf-8").read()
    yield
    after = _read(aid)
    d = after - before
    if d > allow_growth:
        open(_p, "w", encoding="utf-8").write(_backup)   # ★ 真回滚
        raise AssertionError(
            "第%s篇词数从 %d 涨到 %d（+%d）。\n"
            "  **插句必须同段等量削词** —— 这是同一次会话里犯的第六次。\n"
            "  要么削掉 %d 个词，要么把那条待核判为保留。\n"
            "  （如确要加长，显式写 guard('%s', allow_growth=%d)）"
            % (aid, before, after, d, d, aid, d))
    if after > WORD_MAX:
        open(_p, "w", encoding="utf-8").write(_backup)
        raise AssertionError("第%s篇 %d 词，超上限 %d。已回滚。" % (aid, after, WORD_MAX))
    print("  ✓ 等长（%d → %d）" % (before, after))


if __name__ == "__main__":
    aid = sys.argv[1].zfill(2) if len(sys.argv) > 1 else None
    if not aid:
        print(__doc__)
        sys.exit(0)
    w = _read(aid)
    print("第%s篇 %d 词 %s" % (aid, w, "✓" if 240 <= w <= WORD_MAX else "✗ 越界"))
