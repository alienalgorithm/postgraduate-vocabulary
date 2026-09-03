#!/usr/bin/env python3
"""samesource.py —— 哨兵：同一个阈值不许在两处各写一份。

★ 为什么要这个哨兵（2026-09-02 立）
  「同一份数据存了两份」这个错，本会话犯了**九次**：
    一 · VAL-13 词干化两套（bars/barred 判据不同）
    二 · VAL-14 条件写漏一半（把 flew 也拦了）
    三 · vet 的 _lem 与检察官的 _lem 不同源
    四 · review 的阻塞项与检察官的硬伤不一致
    五 · vet 与七层测试各写一份不规则动词表（sweep/swept 只在后者）
    六 · 守卫与 README 各存一份指标（第19篇旧值瞒了很久）
    七 · inspector.py 与 swap.py 又各存一份不规则表（差 21 组）
    八 · **我立共用常量时凭印象抄了八个值，错了四个**
         （WORD_MAX 270→271、WORD_MIN 240→249、PARA_MAX 75→72、PARA_MIN 45→40）
    九 · agent.py 里两套段落判据，**就在同一个文件里隔着五行**（45—75 vs 40/72）

  **★ 九次全是撞出来的**：症状先出现（测试报红、多篇同时越界、换的词撞车），
  我才回头找到根。**第八次差点造成实害——判据错了，而它指挥的是删改十三篇正文。**

★★ 这个哨兵做的事
  维护一张**登记表**：哪些阈值是共用的，各自的唯一出处在哪。
  然后扫全部脚本，**凡有别处裸写同一个值去做比较，就报出来。**

★★★ 为什么它不会变成噪声
  **只查登记表里那几个值**，不做「凡重复的数字都报」——
  后者实测 13 处里有 7 处是格式符（`:<18`、`:>5.2f`）造成的假阳性。
  **判据窄，才用得久。**（前四条筛法就是判据太宽而作废的。）

用法：
  python3 scripts/samesource.py        # 报出违例，有违例则退出码 1
"""
import os
import re
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SCRIPTS = os.path.join(ROOT, "scripts")

# ── 登记表：阈值 → （唯一出处, 该怎么取, 说明）─────────────────────────
# ⚠ 新增共用阈值时必须登记在这里，否则哨兵管不到它。
# ⚠ 第三个字段是**语义关键词**：同一行里必须出现其中之一才算命中。
#   **不加这个条件时实测 18 处命中，其中 8 处是假阳性**——
#   **`40` 一个值在库里有三种含义**：段落词数下限、vet 通过率下限、长句上限；
#   `2.2` 也曾命中 polish.py 里一句印给人看的说明文字。
#   **判据窄，才用得久。**
REGISTRY = {
    "5.0": ("inspector.py", "core.CHEAP_MIN", "白送词线 ZIPF_CHEAP（VAL-02h）",
            ("zipf", "_z", "freq", "白送", "cheap")),
    "2.2": ("inspector.py", "core.RARE_MAX", "过于生僻线（VAL-09）",
            ("zipf", "_z", "freq", "生僻", "rare")),
    "271": ("inspector.py", "core.WORD_MAX", "正文词数上限（MET-01）",
            ("word", "words", "词数", "count_words")),
    "249": ("inspector.py", "core.WORD_MIN", "正文词数下限（MET-01）",
            ("word", "words", "词数", "count_words")),
    "72": ("inspector.py", "core.PARA_MAX", "单段词数上限",
           ("para", "pw", "段", "seg")),
    "40": ("inspector.py", "core.PARA_MIN", "单段词数下限",
           ("para", "pw", "段", "seg")),
    "95": ("preflight.py", "core.SCORE_FLOOR", "合规分门槛",
           ("score", "合规分", "门槛", "floor")),
}

# 只看「拿这个数做比较」的地方；格式符与注释不算
CMP = re.compile(r"(?:[<>]=?\s*|\s*[<>]=?\s*)$")
FMT = re.compile(r"[:{}][<>^]?\d")


def offenders(value, home, keys=()):
    """找出除 home 之外，还有哪些文件裸写这个值去做比较。"""
    hits = []
    for fn in sorted(os.listdir(SCRIPTS)):
        if not fn.endswith(".py") or fn in (home, "samesource.py", "core.py"):
            continue
        for no, line in enumerate(
                open(os.path.join(SCRIPTS, fn), encoding="utf-8").split("\n")
                if False else
                open(os.path.join(SCRIPTS, fn), encoding="utf-8").read().split("\n"), 1):
            bare = line.split("#")[0]
            if value not in bare:
                continue
            # ★ 排除字符串字面量里的（polish.py 里有印给人看的说明文字）
            if bare.count('"') >= 2 or bare.count("'") >= 2:
                _q = re.sub(r'"[^"]*"|\'[^\']*\'', "", bare)
                if value not in _q:
                    continue
                bare = _q
            # ★ 语义关键词：同一行必须提到它是什么阈值
            if keys and not any(k.lower() in bare.lower() for k in keys):
                continue
            # 排除格式符（:<18、:>5.2f 之类）
            if FMT.search(bare):
                continue
            # 必须是比较运算的一侧
            for m in re.finditer(re.escape(value), bare):
                before = bare[max(0, m.start() - 6):m.start()]
                after = bare[m.end():m.end() + 6]
                # 值的两侧不能是别的数字（避免 271 命中 12710）
                if (m.start() and bare[m.start() - 1].isdigit()) or \
                   (m.end() < len(bare) and bare[m.end()] in "0123456789."):
                    continue
                if re.search(r"[<>]=?\s*$", before) or re.match(r"\s*[<>]=?", after):
                    hits.append((fn, no, line.strip()[:76]))
                    break
    return hits


def main():
    print("=" * 68)
    print("哨兵 · 同一个阈值不许在两处各写一份")
    print("=" * 68)
    bad = 0
    for value, (home, how, what, keys) in REGISTRY.items():
        hits = offenders(value, home, keys)
        if not hits:
            continue
        bad += len(hits)
        print("\n✗ %s（%s）—— 唯一出处应为 %s，别处请用 %s" % (value, what, home, how))
        for fn, no, line in hits:
            print("   %s:%d  %s" % (fn, no, line))
    print("\n" + "-" * 68)
    if bad:
        print("**%d 处裸写了登记表里的阈值。**" % bad)
        print("**改法：改成从 core 取（core 已从 inspector 读），不要抄一份值过来。**")
        print("**★ 抄一份值过来，不叫同源；从原处读，才叫同源。**")
        return 1
    print("✓ 登记表里的 %d 个阈值都只有一份。" % len(REGISTRY))
    return 0


if __name__ == "__main__":
    sys.exit(main())
