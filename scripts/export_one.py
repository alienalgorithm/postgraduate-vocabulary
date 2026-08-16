#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
单篇导出 · export_one
====================
把一篇文章导成一个独立文件，六个区块：
  标题与指标 / 英文 / 中文 / 速查表 / 逐段对照 / 史实核对 / 纯净版

存在的理由：全库文件有二十多篇，看一篇要翻半天。
写完或精修完一篇，跑这个，直接得到那一篇。

    python3 scripts/export_one.py 21
    python3 scripts/export_one.py 21 --out /path/to/dir
"""
import json, os, subprocess, sys, argparse

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
os.chdir(ROOT)

def load(aid):
    files = ["data/articles.js"] + sorted("data/" + x for x in os.listdir("data")
                                          if x.startswith("article-"))
    js = ("globalThis.window=globalThis;" +
          "".join("require(%s);" % json.dumps(os.path.abspath(f)) for f in files) +
          "process.stdout.write(JSON.stringify(globalThis.SITE.ARTICLES))")
    arts = json.loads(subprocess.run(["node", "-e", js], capture_output=True,
                                     text=True).stdout)
    a = next((x for x in arts if x["id"] == aid), None)
    if a is None:
        sys.exit(f"找不到第 {aid} 篇")
    return a

def render(a):
    m = a["metrics"]
    o = [f"# {a['id']} · {a['title']}\n\n## {a.get('titleZh','')}\n\n"]
    if a.get("standfirst"):
        o.append(f"> {a['standfirst']}\n\n")
    o.append(f"**{a.get('topic','')}**　|　{m['words']}词 · {m['keywords']}重点词 "
             f"· 密度{m['density']}%　|　{a.get('status','')}\n\n---\n\n")
    o.append("## 英文\n")
    for i, p in enumerate(a["paras"], 1):
        o.append(f"\n**§{i}**　{p['en']}\n")
    o.append("\n---\n\n## 中文\n")
    for i, p in enumerate(a["paras"], 1):
        o.append(f"\n**§{i}**　{p['zh']}\n")
    o.append("\n---\n\n## 速查表（50词）\n\n| # | 单词 | 释义 | 段 |\n|---|---|---|---|\n")
    for i, g in enumerate(a["glossary"], 1):
        o.append(f"| {i} | **{g['w']}** | {g['zh']} | §{g['p']} |\n")
    o.append("\n---\n\n## 对照阅读（逐段）\n")
    for i, p in enumerate(a["paras"], 1):
        o.append(f"\n### §{i}\n\n{p['en']}\n\n{p['zh']}\n")
    if a.get("facts"):
        o.append("\n---\n\n## 史实核对\n\n")
        for i, f in enumerate(a["facts"], 1):
            o.append(f"{i}. {f}\n\n")
    o.append("---\n\n## 纯净版（无加粗，供冷读）\n\n")
    for p in a["paras"]:
        o.append(p["en"].replace("**", "") + "\n\n")
    for p in a["paras"]:
        o.append(p["zh"].replace("**", "") + "\n\n")
    return "".join(o)

if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("aid")
    ap.add_argument("--out", default="/mnt/user-data/outputs")
    args = ap.parse_args()
    a = load(args.aid.zfill(2))
    os.makedirs(args.out, exist_ok=True)
    path = os.path.join(args.out, f"第{int(a['id'])}篇-{a['title']}.md")
    open(path, "w", encoding="utf-8").write(render(a))
    print(f"✓ {path}")
