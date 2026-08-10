#!/usr/bin/env python3
"""从 data/articles.js 生成 articles/*.md

数据源只有一处：data/articles.js
markdown 是派生产物，方便在 GitHub 上直接阅读。
改完数据后运行：
    python3 scripts/build_markdown.py
"""
import json
import re
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DATA = ROOT / "data" / "articles.js"
OUT = ROOT / "articles"


def load():
    """用 node 求值那个 JS 文件，拿到纯数据。"""
    js = f"""
      globalThis.window = globalThis;
      require({json.dumps(str(DATA))});
      process.stdout.write(JSON.stringify(window.SITE));
    """
    r = subprocess.run(["node", "-e", js], capture_output=True, text=True)
    if r.returncode:
        sys.exit("读取 data/articles.js 失败：\n" + r.stderr)
    return json.loads(r.stdout)


def strip_src(zh):
    """中文里的 (english) 括注在 markdown 中保留 —— 那是纸面上的对应方式。"""
    return zh


def build(a):
    m = a["metrics"]
    L = []
    L.append(f'# {a["id"]} · {a["title"]}')
    L.append("")
    L.append(f'> 题材：{a["topic"]}')
    L.append(f'> 状态：**{a["status"]}**（{a["date"]}）')
    L.append(f'> 指标：{m["words"]} 词 / {m["keywords"]} 重点词 / 密度 {m["density"]}%')
    if a.get("standfirst"):
        L.append(f'> {a["standfirst"]}')
    L.append("")
    L.append("---")
    L.append("")
    L.append("## 英文正文")
    L.append("")
    for p in a["paras"]:
        L.append(p["en"])
        L.append("")
    L.append("---")
    L.append("")
    L.append("## 中文译文")
    L.append("")
    L.append("> 铁律：英文加粗词在中文里对应的译法同样加粗，后附 `(english)` 括注词源。")
    L.append("> 中文按最自然的说法写，加粗落在自然说法上——不为对齐扭曲句法。")
    L.append("")
    for p in a["paras"]:
        L.append(strip_src(p["zh"]))
        L.append("")
    L.append("---")
    L.append("")
    L.append(f'## {m["keywords"]} 词速查表')
    L.append("")
    by_p = {}
    for g in a["glossary"]:
        by_p.setdefault(g["p"], []).append(g)
    for p in sorted(by_p):
        items = "｜".join(f'{g["w"]} {g["zh"]}' for g in by_p[p])
        L.append(f'**§{p}**（{len(by_p[p])}词）{items}')
        L.append("")
    if a.get("facts"):
        L.append("---")
        L.append("")
        L.append("## 史实核对")
        L.append("")
        L.append("以下关键信息已据所列来源核对：")
        L.append("")
        for f in a["facts"]:
            L.append(f"- {f}")
        L.append("")
    return "\n".join(L)


def check(a):
    """英文加粗数、中文加粗数、词表条数必须三者一致。"""
    problems = []
    total_en = total_zh = 0
    for i, p in enumerate(a["paras"], 1):
        en = [k.lower() for k in re.findall(r"\*\*(.+?)\*\*", p["en"])]
        zh = [k.lower() for k in re.findall(r"\*\*.+?\*\*\(([A-Za-z-]+)\)", p["zh"])]
        total_en += len(en)
        total_zh += len(zh)
        miss = set(en) - set(zh)
        extra = set(zh) - set(en)
        if miss:
            problems.append(f'  §{i} 中文缺对应：{", ".join(sorted(miss))}')
        if extra:
            problems.append(f'  §{i} 中文多出：{", ".join(sorted(extra))}')
    if total_en != a["metrics"]["keywords"]:
        problems.append(f'  英文加粗 {total_en} 个，但 metrics 写的是 {a["metrics"]["keywords"]}')
    if len(a["glossary"]) != a["metrics"]["keywords"]:
        problems.append(f'  词表 {len(a["glossary"])} 条，但 metrics 写的是 {a["metrics"]["keywords"]}')

    def count(text):
        toks = text.replace("**", "").split()
        return sum(1 for t in toks if re.search(r"[A-Za-z0-9]", t))

    words = sum(count(p["en"]) for p in a["paras"])
    if abs(words - a["metrics"]["words"]) > 3:
        problems.append(f'  实测 {words} 词，metrics 写的是 {a["metrics"]["words"]}')
    density = round(total_en / words * 100, 1) if words else 0
    if abs(density - a["metrics"]["density"]) > 0.4:
        problems.append(f'  实测密度 {density}%，metrics 写的是 {a["metrics"]["density"]}%')
    if density > 20:
        problems.append(f'  ⚠ 密度 {density}% 已越过 20% 红线')
    return problems, words, total_en, density


def main():
    site = load()
    OUT.mkdir(exist_ok=True)
    bad = 0
    for a in site["ARTICLES"]:
        problems, words, kw, density = check(a)
        path = OUT / f'{a["id"]}-{a["slug"]}.md'
        path.write_text(build(a), encoding="utf-8")
        flag = "✗" if problems else "✓"
        print(f'{flag} {path.relative_to(ROOT)}  {words} 词 · {kw} 重点词 · {density}%')
        for p in problems:
            print(p)
        bad += len(problems)
    print(f'\n{len(site["ARTICLES"])} 篇已生成' + (f"，{bad} 处问题" if bad else "，无问题"))
    return 1 if bad else 0


if __name__ == "__main__":
    sys.exit(main())
