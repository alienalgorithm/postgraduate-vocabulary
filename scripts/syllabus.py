#!/usr/bin/env python3
"""syllabus.py —— 把 3,500 个词元和 70 篇文章排成一份能照着背的学习大纲。

★ 由来（2026-09-04，路三定案之后）：
  七十篇写完了，两个审读团各跑完一轮，语料库到顶了。可它还只是「存在」，不是「能背下来」——
  Anki 卡按篇号 1→70 堆着，学生第一天就撞上 sky-pieces 和 plinth；
  七十篇没有难度分级，没有主题索引，也没有「先读哪五篇」。
  **这一步不写新篇、不改任何铁律，纯从数据层派生。**

产出（写到 exports/）：
  syllabus.json    机器读：每个词的档位与序号、每篇的难度与主题、推荐顺序
  学习大纲.md      人读：四档词、七十篇的难度梯队与主题索引、十二周路径

分档（按 wordfreq 的 zipf 值，取词的第一个成分）：
  核心 ≥4.5   考研高频，先背，也是读任何一篇的地基
  常用 3.8—4.5
  进阶 3.0—3.8  考研阅读的主力区
  冷僻 <3.0    认得即可，不必主动产出

篇难度 = 该篇 50 个词的平均 zipf（越低越难）＋ 冷僻词占比。

用法：
  python3 scripts/syllabus.py            # 生成 exports/syllabus.json 与 exports/学习大纲.md
  python3 scripts/syllabus.py --check    # 只校验，不写文件（preflight 用）
"""
import os
import re
import sys
import json
import subprocess
from collections import Counter, defaultdict

from wordfreq import zipf_frequency as zf

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "exports")
BANDS = [("核心", 4.5, 99.0), ("常用", 3.8, 4.5), ("进阶", 3.0, 3.8), ("冷僻", 0.0, 3.0)]
# 主题：按篇名与 facts 里的关键词归类，人工核过一遍
THEMES = {
    "医与生": "01 02 09 12 13 16 18 22 23 25 26 31 34 44 49 64",
    "度量与标准": "04 05 32 38 39 40 41 46 47 50",
    "机械与材料": "06 07 11 14 15 17 21 24 28 29 30 33 35 36 37 45 52 54 56 70",
    "农、食与生计": "03 08 10 19 20 27 42 43 51 53 55 57 59 60 61 63 65 66 67 68 69",
    "法、税与制度": "43 48 58 62",
}


def load_all():
    js = ('globalThis.window=globalThis;'
          + ''.join('require(%s);' % json.dumps(os.path.join(ROOT, 'data', f))
                    for f in sorted(os.listdir(os.path.join(ROOT, 'data'))) if f.endswith('.js'))
          + 'process.stdout.write(JSON.stringify(globalThis.SITE.ARTICLES))')
    out = subprocess.run(['node', '-e', js], capture_output=True, text=True, cwd=ROOT).stdout
    return sorted(json.loads(out), key=lambda a: int(a['id']))


def freq(w):
    """复合词（bird-boy、oil-lamp）按最不常见的那一半算——那才是难点所在。"""
    parts = [p for p in re.split(r"[-\s]", w.lower()) if p]
    if not parts:
        return 0.0
    return min(zf(p, 'en') for p in parts)


def band(f):
    for name, lo, hi in BANDS:
        if lo <= f < hi:
            return name
    return "冷僻"


def build():
    arts = load_all()
    words = []
    for a in arts:
        for g in a['glossary']:
            f = freq(g['w'])
            words.append({"w": g['w'], "zh": g['zh'], "a": a['id'], "p": g['p'],
                          "f": round(f, 2), "band": band(f)})
    # 词序：档位优先，档内按词频从高到低——先背用得上的
    order = {n: i for i, (n, _, _) in enumerate(BANDS)}
    words.sort(key=lambda x: (order[x['band']], -x['f'], x['w']))
    for i, x in enumerate(words, 1):
        x['n'] = i

    # 篇难度
    byart = defaultdict(list)
    for x in words:
        byart[x['a']].append(x)
    arts_meta = []
    for a in arts:
        ws = byart[a['id']]
        avg = sum(x['f'] for x in ws) / len(ws)
        rare = sum(1 for x in ws if x['band'] == "冷僻") / len(ws)
        arts_meta.append({"id": a['id'], "title": a['title'], "avg": round(avg, 2),
                          "rare": round(rare, 3), "score": round(avg - rare, 3)})
    arts_meta.sort(key=lambda m: -m['score'])          # 好读的在前
    for i, m in enumerate(arts_meta, 1):
        m['rank'] = i
        m['tier'] = "入门" if i <= 18 else "进阶" if i <= 40 else "挑战" if i <= 58 else "硬骨头"

    theme = {}
    for name, ids in THEMES.items():
        for i in ids.split():
            theme.setdefault(i, []).append(name)
    for m in arts_meta:
        m['themes'] = theme.get(m['id'], ["其他"])

    return words, arts_meta


def plan(arts_meta):
    """十二周路径：每周五到六篇，由易到难，同周内主题岔开，免得一周全是机械。"""
    weeks, pool = [], list(arts_meta)
    per = 6
    while pool:
        take, seen = [], Counter()
        for m in list(pool):
            if len(take) >= per:
                break
            t = m['themes'][0]
            if seen[t] >= 2 and len(pool) > per:      # 同一主题一周最多两篇
                continue
            take.append(m); seen[t] += 1; pool.remove(m)
        while len(take) < per and pool:
            take.append(pool.pop(0))
        weeks.append(take)
    return weeks


def write(words, arts_meta):
    os.makedirs(OUT, exist_ok=True)
    weeks = plan(arts_meta)
    json.dump({"words": words, "articles": arts_meta,
               "weeks": [[m['id'] for m in w] for w in weeks]},
              open(os.path.join(OUT, "syllabus.json"), 'w', encoding='utf-8'),
              ensure_ascii=False, indent=1)

    cnt = Counter(x['band'] for x in words)
    L = ["# 学习大纲 · 3,500 词 · 70 篇", "",
         "> `scripts/syllabus.py` 从数据层生成，不手改。词按「先背用得上的」排，篇按由易到难排。", "",
         "## 一、词分四档", "",
         "| 档 | 词频 | 数量 | 占比 | 怎么用 |", "|---|---|---|---|---|"]
    how = {"核心": "先背，也是读任何一篇的地基", "常用": "考研作文要能主动写出来",
           "进阶": "考研阅读的主力区，认得＋能猜", "冷僻": "认得即可，不必主动产出"}
    for name, lo, hi in BANDS:
        rng = "≥%.1f" % lo if hi > 90 else "%.1f—%.1f" % (lo, hi)
        L.append("| **%s** | %s | %d | %.1f%% | %s |" % (name, rng, cnt[name], 100 * cnt[name] / len(words), how[name]))
    L += ["", "**背词顺序就是 `syllabus.json` 里的 `n`**：核心 → 常用 → 进阶 → 冷僻，档内按词频从高到低。",
          "Anki 卡已按这个序号排好（`exports/anki-3500.tsv` 的排序字段），导入后按「添加顺序」学即可。", ""]

    L += ["## 二、七十篇的难度梯队", "",
          "篇难度 = 该篇 50 个词的平均词频 − 冷僻词占比。**读的顺序不必是篇号顺序。**", "",
          "| 名次 | 篇 | 标题 | 梯队 | 主题 | 难度分 |", "|---|---|---|---|---|---|"]
    for m in arts_meta:
        L.append("| %d | %s | %s | %s | %s | %.2f |" % (m['rank'], m['id'], m['title'], m['tier'], "、".join(m['themes']), m['score']))

    L += ["", "## 三、十二周路径", "",
          "每周五到六篇，由易到难；同一主题一周最多两篇，免得一周全是机械或全是医学。",
          "每周：**读 6 篇 → 背这 6 篇的 300 个词 → 第 7 天只复习不读新篇。**", ""]
    for i, w in enumerate(weeks, 1):
        L.append("**第 %d 周**　%s" % (i, "　".join("%s《%s》" % (m['id'], m['title']) for m in w)))
    L += ["", "## 四、间隔复习", "",
          "Anki 默认参数即可。这套语料的特点是**每个词都带它的原句**，所以复习时先读句再想词，",
          "比孤零零一个单词记得牢。一天新卡 30 张、复习上不封顶，十二周正好走完 3,500 张。", ""]
    open(os.path.join(OUT, "学习大纲.md"), 'w', encoding='utf-8').write("\n".join(L))
    return cnt, weeks


def main():
    words, arts_meta = build()
    assert len(words) == 3500, len(words)
    assert len({(x['a'], x['w']) for x in words}) == 3500
    assert len(arts_meta) == 70
    if "--check" in sys.argv:
        print("词 %d · 篇 %d · 分档 %s" % (len(words), len(arts_meta),
                                        dict(Counter(x['band'] for x in words))))
        return
    cnt, weeks = write(words, arts_meta)
    print("词 3,500 → 核心 %d · 常用 %d · 进阶 %d · 冷僻 %d" % tuple(cnt[n] for n, _, _ in BANDS))
    print("篇 70 → 最好读：%s《%s》　最难：%s《%s》" %
          (arts_meta[0]['id'], arts_meta[0]['title'], arts_meta[-1]['id'], arts_meta[-1]['title']))
    print("路径 %d 周 · 已写 exports/syllabus.json、exports/学习大纲.md" % len(weeks))


if __name__ == "__main__":
    main()
