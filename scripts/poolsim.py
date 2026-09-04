#!/usr/bin/env python3
"""poolsim.py —— 量一量「撞库只在相邻 N 篇内算」会放出多少题材。

★ 由来（2026-09-04）：
  六十九篇之后选题成功率掉到 1:5。《总令》「词池现状」给了三条路，路二是放宽撞库规则。
  **这个脚本不改规则，只量：把撞库窗口从「全库」缩到最近 N 篇，题材库里过线（≥60%）的题材从几条变成几条。**
  用户看着数字定，比看着我的判断定要稳。

用法：
  python3 scripts/poolsim.py            # 窗口 69／40／30／20，各报一遍
  python3 scripts/poolsim.py 25         # 单看一个窗口
"""
import os
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(ROOT, "scripts"))


def rate(topics, arts_window, basic, z, norm, stem, kin, used_index):
    exact, stems, _ = used_index(arts_window, None)

    def usable(w):
        w = w.lower()
        if w in basic or w.rstrip("s") in basic:
            return False
        if norm(w) in exact or stem(w) in stems:
            return False
        if any(kin(w, x) for x in exact):
            return False
        return 2.4 < z(w, "en") < 4.8

    out = []
    for name, rev, words, done in topics:
        ws = words.split()
        ok = sum(1 for w in ws if usable(w))
        out.append((name, ok * 100 // len(ws), done))
    return out


def main():
    from agent import load, used_index, norm, stem, kin
    from wordfreq import zipf_frequency as z
    from topics import TOPICS
    arts = load()
    basic = set(open(os.path.join(ROOT, "data/reference/basic-wordlist.txt"),
                     encoding="utf-8").read().split())
    cand = [t for t in TOPICS if not t[3]]
    archived = [t for t in TOPICS if t[3] and ("存档" in t[1] or "零稿" in t[1] or "一稿" in t[1])]
    windows = [int(sys.argv[1])] if len(sys.argv) > 1 else [len(arts), 40, 30, 20]
    print("=" * 70)
    print("撞库窗口模拟 · 题材库 %d 条候选 + %d 条已存档" % (len(cand), len(archived)))
    print("=" * 70)
    print("  窗口   候选≥60%   候选均值   已存档≥60%   已存档均值")
    for n in windows:
        win = arts[-n:] if n < len(arts) else arts
        c = rate(cand, win, basic, z, norm, stem, kin, used_index)
        a = rate(archived, win, basic, z, norm, stem, kin, used_index)
        cp = sum(1 for _, p, _ in c if p >= 60)
        ap = sum(1 for _, p, _ in a if p >= 60)
        cm = sum(p for _, p, _ in c) / max(1, len(c))
        am = sum(p for _, p, _ in a) / max(1, len(a))
        print("  %3d 篇   %2d/%-2d      %3.0f%%       %2d/%-2d        %3.0f%%"
              % (n, cp, len(c), cm, ap, len(a), am))
    print("-" * 70)
    print("**★ 这是模拟，不是规则。规则在铁律 VAL-07/08，改不改由用户定。**")
    print("**★★ 「已存档」那一列是今天被词池挡下来的好材料；窗口一缩它们能回来多少，就是路二的价值。**")


if __name__ == "__main__":
    main()
