#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
《总令》易变部分自动刷新。

**为什么需要它**
《总令》里混着两类东西：
    一类是**机器做不了的判断**——判据、选题四条、十三轮各自的活、红线、进化五问。
        这些必须人写，也不会过期。
    另一类是**从库里就能算出来的数**——篇数、词元、均分、测试条数、层族、
        铁律与挂载数、题材表、空档、范文三篇、当前欠账。
        **这些手写就一定会过期。**
实测：同一次会话里手工更新过两遍，**两遍都在一小时内就旧了**——
这不是不勤快，是设计错了。

**这个脚本做的事**
认出文里的占位标记，把实时值注进去。人只维护「机器做不了的那几节」。

用法：
    python3 scripts/render_charter.py          # 刷新 notes/总令.md
    python3 scripts/render_charter.py --check   # 只查是否过期（CI 用，不改文件）
    python3 scripts/render_charter.py --out X   # 另存一份
"""

import argparse
import datetime as dt
import json
import os
import re
import subprocess
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CHARTER = os.path.join(ROOT, "notes", "总令.md")

# 标记形如：<!--auto:key-->…内容…<!--/auto:key-->
MARK = r"<!--auto:%s-->.*?<!--/auto:%s-->"
WRAP = "<!--auto:%s-->%s<!--/auto:%s-->"


# ── 从库里取事实 ──────────────────────────────────────────────────────
def load_articles():
    fs = [os.path.join(ROOT, "data", "articles.js")] + sorted(
        os.path.join(ROOT, "data", f)
        for f in os.listdir(os.path.join(ROOT, "data"))
        if f.startswith("article-") and f.endswith(".js"))
    js = ("globalThis.window=globalThis;"
          + "".join("require(%s);" % json.dumps(f) for f in fs)
          + "process.stdout.write(JSON.stringify(globalThis.SITE.ARTICLES))")
    r = subprocess.run(["node", "-e", js], cwd=ROOT,
                       capture_output=True, text=True)
    if r.returncode or not r.stdout:
        sys.exit("✗ 读不出文章数据：%s" % (r.stderr or "").strip()[:200])
    return sorted(json.loads(r.stdout), key=lambda a: a["id"])


def run(cmd, timeout=900):
    return subprocess.run(cmd, cwd=ROOT, capture_output=True,
                          text=True, timeout=timeout).stdout


def facts():
    A = load_articles()
    f = {"n": len(A), "kw": sum(len(a["glossary"]) for a in A)}

    out = run(["python3", os.path.join(ROOT, "scripts", "inspector.py")])
    m = re.search(r"硬伤合计 (\d+) 条 · 平均分 ([\d.]+)", out)
    f["hard"], f["avg"] = (m.group(1), m.group(2)) if m else ("?", "?")

    out = run(["python3", os.path.join(ROOT, "scripts", "test_tools.py")])
    m = re.search(r"通过 (\d+) · 失败 (\d+)", out)
    f["tests"], f["fails"] = (m.group(1), m.group(2)) if m else ("?", "?")

    src = open(os.path.join(ROOT, "scripts", "inspector.py"),
               encoding="utf-8").read()
    f["layers"] = len(set(re.findall(r'Finding\("([A-Z]+)-', src)))
    f["rules"] = len(set(re.findall(r'Finding\("([A-Z]+-[0-9a-z]+)"', src)))

    cm = json.load(open(os.path.join(ROOT, "data", "reference",
                                     "charter-map.json"), encoding="utf-8"))
    f["clauses"] = len(cm["clauses"])
    f["mounted"] = sum(len(v.get("rules", [])) for v in cm["clauses"].values())

    # 十三轮跑满的篇数
    full = 0
    for a in A:
        p = os.path.join(ROOT, "notes", "精修台账-%s.md" % a["id"])
        if not os.path.exists(p):
            continue
        got = {int(x) for x in re.findall(
            r"^### 第(\d+)轮", open(p, encoding="utf-8").read(), re.M)}
        if all(r in got for r in range(1, 14)):
            full += 1
    f["full"] = full

    f["topics"] = [a["topic"] for a in A]
    f["latest"] = A[-1]
    f["date"] = dt.date.today().isoformat()
    return f


def cold_queue():
    """欠账：冷读队列的实时状态。"""
    try:
        import importlib.util as ilu
        spec = ilu.spec_from_file_location(
            "coldread", os.path.join(ROOT, "scripts", "coldread.py"))
        cr = ilu.module_from_spec(spec)
        spec.loader.exec_module(cr)
        rows = cr.survey()
        p = cr.pending(rows)
        return len(rows), len(p), [r["aid"] for r in p[:6]]
    except Exception:
        return None, None, []


# ── 生成各段 ──────────────────────────────────────────────────────────
def block_header(f):
    return (
        "\n>\n> **本版数字于 %s 由 `scripts/render_charter.py` 从库中实取，"
        "非手写。**\n"
        "> 全库 **%d 篇 · %d 词元 · 硬伤 %s · 平均分 %s · %d/%d 篇十三轮跑满**\n"
        "> 工具：`inspector.py` **%d 层族 / %d 条规则**"
        "／`test_tools.py` **%s 条**"
        "／铁律 **%d 条**、挂载 **%d 个**\n\n"
        % (f["date"], f["n"], f["kw"], f["hard"], f["avg"], f["full"], f["n"],
           f["layers"], f["rules"], f["tests"], f["clauses"], f["mounted"]))


def block_models(f):
    return ("\n```\n"
            "articles/16-the-wave-that-should-not-have-arrived.md   （范文）\n"
            "articles/13-the-colour-returned-in-patches.md          （范文）\n"
            "articles/%s-%s.md%s（最近一篇）\n```\n"
            % (f["latest"]["id"], f["latest"]["slug"],
               " " * max(1, 42 - len(f["latest"]["slug"]))))


def block_topics(f):
    body = "·".join(f["topics"])
    lines, cur = [], ""
    for seg in body.split("·"):
        if len(cur) + len(seg) > 46:
            lines.append(cur.rstrip("·"))
            cur = ""
        cur += seg + "·"
    if cur:
        lines.append(cur.rstrip("·"))
    return "\n### 3 · 题材避开已写的 %d 个\n\n%s\n" % (f["n"], "\n".join(lines))


def block_families(src):
    """规则族按 inspector 里实际装了哪些新层推断，不手写。"""
    fam = [("PRO-01", "指代"), ("PHR-01", "短语升格"), ("DEN-01", "信息密度"),
           ("GRA-01", "语法"), ("VAL-13", "词元浪费"), ("MET-09", "释义错位")]
    got = [n for r, n in fam if '"%s"' % r in src]
    got = ["指代", "短语升格", "信息密度", "功率", "改动自伤"] + \
          [n for n in got if n not in ("指代", "短语升格", "信息密度")]
    seen, out = set(), []
    for x in got:
        if x not in seen:
            seen.add(x)
            out.append(x)
    cn = "一二三四五六七八九十"[len(out) - 1] if len(out) <= 10 else str(len(out))
    return "\n现有**%s族**：**%s**\n" % (cn, "／".join(out))


def block_owed():
    tot, left, nxt = cold_queue()
    if tot is None:
        return "\n（冷读队列不可用）\n"
    if not left:
        return "\n**冷读队列已清空——全部 %d 篇的极限轮都是隔会话跑的。**\n" % tot
    return ("\n**第13轮极限轮：%d 篇里还有 %d 篇没有真正隔会话跑过。**\n"
            "下次开新会话发「**冷读**」，或直接跑：\n\n"
            "```bash\npython3 scripts/coldread.py next\n```\n\n"
            "**欠得最久的几篇**：%s\n"
            % (tot, left, "、".join(a + "篇" for a in nxt)))


# ── 注入 ──────────────────────────────────────────────────────────────
def render(text, f):
    src = open(os.path.join(ROOT, "scripts", "inspector.py"),
               encoding="utf-8").read()
    blocks = {
        "header": block_header(f),
        "models": block_models(f),
        "topics": block_topics(f),
        "families": block_families(src),
        "tests": "\npython3 scripts/test_tools.py          # %s 条\n" % f["tests"],
        "owed": block_owed(),
    }
    miss = []
    for k, v in blocks.items():
        pat = MARK % (k, k)
        if not re.search(pat, text, re.S):
            miss.append(k)
            continue
        text = re.sub(pat, lambda _m, v=v, k=k: WRAP % (k, v, k), text,
                      count=1, flags=re.S)
    return text, miss


def main():
    ap = argparse.ArgumentParser(description="刷新《总令》的易变部分")
    ap.add_argument("--check", action="store_true",
                    help="只查是否过期，不改文件（CI 用）")
    ap.add_argument("--out", default=None)
    a = ap.parse_args()

    old = open(CHARTER, encoding="utf-8").read()
    f = facts()
    new, miss = render(old, f)

    if miss:
        print("⚠ 文里缺这些占位标记，对应段落未刷新：%s" % "、".join(miss))
        print("  形如：<!--auto:header-->…<!--/auto:header-->")

    if a.check:
        if new != old:
            print("✗ 《总令》已过期——库里的数与文里的对不上。")
            print("  跑：python3 scripts/render_charter.py")
            sys.exit(1)
        print("✓ 《总令》与库同步")
        return

    path = a.out or CHARTER
    open(path, "w", encoding="utf-8").write(new)
    print("✓ 已刷新 %s" % os.path.relpath(path, ROOT))
    print("  %d 篇 · %d 词元 · 硬伤 %s · 均分 %s · 测试 %s 条 · %d 层族 %d 条规则"
          % (f["n"], f["kw"], f["hard"], f["avg"], f["tests"],
             f["layers"], f["rules"]))


if __name__ == "__main__":
    main()
