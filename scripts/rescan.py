#!/usr/bin/env python3
"""改动回扫（2026-08-20 立）

立此扫之由（本次跑轮实测）：十三处翻案里，**七处是我自己改动引入的**——
  第21篇为塞新信息丢了 the motion；第22篇把 the test 挤成 it；
  第35篇 the admiral 无铺垫、advise 后缺 that、deputies 用错国家；
  第09篇 held 撞车；第11篇 built on it。
**改动本身就是新的风险源**，而此前没有任何一道工序在改完之后回扫改动那一句。

    python3 scripts/rescan.py 16          # 拿当前版本与快照比，只扫改动过的句子

扫四样（都是实测栽过的）：
  一 新引入的代词，先行词在不在
  二 主语有没有被新信息挤掉
  三 新引入的词在本篇别处是否已有同义说法（同物两名）
  四 改动句里有没有同一个词出现两次而意思不同
"""
import json, os, re, subprocess, sys, difflib

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(ROOT, "scripts"))
from core import sentences, keywords                      # noqa: E402

PRON = re.compile(r"\b(it|its|they|them|their|he|his|him|she|her)\b", re.I)


def load(aid):
    f = os.path.join(ROOT, "data", f"article-{aid}.js")
    if not os.path.exists(f):
        f = os.path.join(ROOT, "data", "articles.js")
    js = ("globalThis.window=globalThis;require(%s);"
          "process.stdout.write(JSON.stringify(globalThis.SITE.ARTICLES))" % json.dumps(f))
    arts = json.loads(subprocess.run(["node", "-e", js], capture_output=True, text=True).stdout)
    return next(a for a in arts if a["id"] == aid)


def snap(aid):
    """取 git 上一次提交里的正文。快照存的是画像不是原文，故用 git —— 更准。"""
    f = f"data/article-{aid}.js"
    if not os.path.exists(os.path.join(ROOT, f)):
        f = "data/articles.js"
    r = subprocess.run(["git", "show", f"HEAD:{f}"], cwd=ROOT,
                       capture_output=True, text=True)
    if r.returncode:
        return None
    tmp = os.path.join("/tmp", f"_prev_{aid}.js")
    open(tmp, "w", encoding="utf-8").write(r.stdout)
    js = ("globalThis.window=globalThis;require(%s);"
          "process.stdout.write(JSON.stringify(globalThis.SITE.ARTICLES))" % json.dumps(tmp))
    out = subprocess.run(["node", "-e", js], capture_output=True, text=True).stdout
    if not out:
        return None
    return next((x for x in json.loads(out) if x["id"] == aid), None)


def main():
    aid = sys.argv[1].zfill(2)
    now = load(aid)
    old = snap(aid)
    cur = [s.strip() for p in now["paras"] for s in sentences(p["en"].replace("**", ""))]
    if not old:
        print("取不到上一版（git 里还没有这一篇）——跳过回扫")
        return
    prev = [s.strip() for p in old.get("paras", []) for s in sentences(p["en"].replace("**", ""))]
    changed = [s for s in cur if s not in prev]
    print("=" * 62)
    print(f"改动回扫 · 第{aid}篇 —— 改动句 {len(changed)} 句")
    print("=" * 62)
    if not changed:
        print("✓ 与快照相同，无改动可扫")
        return
    body = " ".join(cur)
    flags = 0
    for s in changed:
        print(f"\n▸ {s}")
        # 一 · 新引入的代词
        for m in PRON.finditer(s):
            if m.start() == 0:
                continue
            before = s[:m.start()]
            nouns = re.findall(r"\b([a-z]{3,})\b", before)
            print(f"    · 代词「{m.group(0)}」最近名词 {nouns[-1] if nouns else '（本句之前无名词）'}"
                  "　→ 走五问")
            flags += 1
        # 二 · 主语被挤掉：句首是否直接是动词或介词短语
        if re.match(r"^(By|At|On|In|With|From|Through|After|Before)\b", s) and \
           not re.search(r",\s*[A-Z]?[a-z']+\s+\w+ed\b|,\s*\w+\s+\w+", s[:60]):
            print("    · 句首为状语，确认主语没被新信息挤掉")
            flags += 1
        # 三 · 同物两名
        for w in re.findall(r"\b([a-z]{5,})\b", s):
            fam = {"connection": "joint", "joint": "connection", "ruling": "finding",
                   "finding": "ruling", "anchor": "foothold", "foothold": "anchor",
                   "forecast": "outlook", "outlook": "forecast", "bench": "committee"}
            if w in fam and re.search(r"\b" + fam[w] + r"\b", body):
                print(f"    · 同物两名：本句用 {w}，而全篇别处有 {fam[w]}")
                flags += 1
        # 五 · 新引入的具名称呼，前文有没有铺垫（第35篇 the admiral 就是这么漏掉的）
        for m in re.finditer(r"\bthe ([a-z]{4,})\b", s):
            noun = m.group(1)
            head = body[:body.find(s)] if s in body else ""
            if noun not in head.lower() and noun not in {
                    "same", "other", "first", "last", "whole", "very", "only", "rest",
                    "time", "case", "work", "line", "year", "next", "most", "more"}:
                print(f"    · 新称呼「the {noun}」前文未出现过——读者要停下来想这是谁/什么")
                print("      **改法（三次实测得出，三次正解完全一致）**："
                      "不要另造一个名词，**用前文已经立住的那个词**；")
                print("      若前文根本没有，就**回到前一句把它具名**——"
                      "第23篇 the claimant→前句改 a Ghanaian mother；")
                print("      第25篇 the intake→改用 §2 已有的 enrolment；"
                      "第24篇 the girder→改用 §4 首句已有的 box beam。")
                flags += 1
        # 四 · 句内同词两义
        ws = [w.lower() for w in re.findall(r"\b([a-z]{4,})\b", s)]
        dup = {w for w in ws if ws.count(w) > 1}
        for w in sorted(dup):
            print(f"    · 句内重复：「{w}」在同一句出现 {ws.count(w)} 次——两次是同一个意思吗？")
            flags += 1
    print()
    print("=" * 62)
    print(f"共 {flags} 处待人工判。**机器不下结论，只把改动引入的风险摆出来。**"
          if flags else "✓ 改动句未触发任何风险项")


if __name__ == "__main__":
    main()
