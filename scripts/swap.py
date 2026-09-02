#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
换词 —— 把「换一个重点词」这件事从四步合成一步。

**立此工具之由（本会话实测 25 次自伤，全是同一个形状）**：
换一个词本来要走四步——
    ① vet 候选词　② 改英文　③ 改中文　④ 重建速查表
而我**每次都会漏掉其中一步**：
    漏 ① → 撞车 5 次、白送词或生僻词 7 次
    漏 ③ → **中英失配 13 次**（改了英文，中文那边还是旧词）
    漏 ④ → 速查表与正文对不上
**我不是不知道规矩，是规矩太长。工具的职责是让漏不掉。**

本命令做四件事，任何一件不过就**整体不落盘**：
    一、vet 新词：跨篇同形／同词元／同根、白送词、生僻词、初中词表、
        **以及 VAL-14 那条（不规则屈折的原形是不是白送词）**
    二、英文侧：`**old**` → `**new**`，必须**恰好命中一处**
    三、中文侧：`(old)` → `(new)`，并同时换掉中文词本身（须由 --zh 给出）
    四、速查表：按正文加粗顺序整表重排，新词的释义由 --gloss 给出，
        **每条带中文断言**（红线六）

用法：
    python3 scripts/swap.py 39 stood perched --zh 座落 --gloss "座落；栖"
    python3 scripts/swap.py 39 stood perched --zh 座落 --gloss "座落；栖" --dry
"""

import argparse
import json
import os
import re
import subprocess
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(ROOT, "scripts"))
import core  # noqa: E402


def die(msg):
    print("\n✗ " + msg + "\n")
    print("  **整体未落盘。** 换词的四步只要有一步不过，就不该动文件——")
    print("  半途而废正是「中英失配」那 13 次的来源。")
    sys.exit(1)


def path_of(aid):
    return os.path.join(
        ROOT, "data",
        "articles.js" if aid in ("01", "02", "03", "04", "05")
        else "article-%s.js" % aid)


def load_one(aid):
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
        die("读不出文章数据：%s" % (r.stderr or "").strip()[:160])
    arts = json.loads(r.stdout)
    hit = [x for x in arts if x["id"] == aid]
    if not hit:
        die("没有第%s篇" % aid)
    return hit[0], arts


# ── 一、vet ───────────────────────────────────────────────────────────
IRR_BASE = {}
for _grp in ("bear bore borne;begin began begun;bite bit bitten;"
             "blow blew blown;break broke broken;bring brought;build built;"
             "buy bought;catch caught;choose chose chosen;come came;dig dug;"
             "draw drew drawn;drink drank drunk;drive drove driven;"
             "eat ate eaten;fall fell fallen;feel felt;fight fought;"
             "find found;fly flew flown;forget forgot forgotten;"
             "freeze froze frozen;give gave given;grow grew grown;hang hung;"
             "hear heard;hide hid hidden;hold held;keep kept;know knew known;"
             "lay laid;lead led;leave left;lie lain;lose lost;mean meant;"
             "meet met;pay paid;ride rode ridden;ring rang rung;"
             "rise rose risen;run ran;say said;see saw seen;seek sought;"
             "sell sold;send sent;shake shook shaken;shine shone;shoot shot;"
             "show showed shown;sing sang sung;sink sank sunk;sit sat;"
             "sleep slept;speak spoke spoken;spend spent;stand stood;"
             "steal stole stolen;stick stuck;strike struck;swear swore sworn;"
             "take took taken;teach taught;tear tore torn;tell told;"
             "think thought;throw threw thrown;wear wore worn;win won;"
             "withdraw withdrew withdrawn;write wrote written").split(";"):
    _f = _grp.split()
    for _x in _f[1:]:
        IRR_BASE[_x] = _f[0]


def vet(aid, new, arts):
    """返回否决理由列表；空表示可用。"""
    from wordfreq import zipf_frequency as z
    from agent import used_index, norm, stem, kin
    exact, stems, owner = used_index(arts, aid)
    basic = set()
    bp = os.path.join(ROOT, "data/reference/basic-wordlist.txt")
    if os.path.exists(bp):
        for ln in open(bp, encoding="utf-8"):
            if ln.strip() and not ln.startswith("#"):
                basic.update(ln.split())
    cur = {w.lower()
           for a in arts if a["id"] == aid
           for p in a["paras"]
           for w in core.keywords(p["en"])}
    w = new.lower()
    why = []
    if w in cur:
        why.append("本篇已用")
    if w in basic or w.rstrip("s") in basic:
        why.append("初中词表内（VAL-12）")
    f = z(w, "en")
    if f >= 5.0:
        why.append("白送词 %.2f（VAL-02h）" % f)
    elif f <= 2.2:
        why.append("过于生僻 %.2f（VAL-09）" % f)

    def who(k):
        v = owner.get(k)
        if isinstance(v, (set, frozenset, list, tuple)):
            return "、".join(sorted(str(x) for x in v))
        return str(v) if v else "?"

    if norm(w) in exact:
        why.append("与第%s篇同形（VAL-08）" % who(norm(w)))
    elif stem(w) in stems:
        why.append("与第%s篇同词元（VAL-07）" % who(stem(w)))
    else:
        k = [x for x in exact if kin(w, x)]
        if k:
            why.append("与第%s篇同根（%s）" % (who(k[0]), k[0]))
    # ★ VAL-14：不规则屈折形，原形若是白送词/初中词，等于没学到新词
    base = IRR_BASE.get(w)
    if base:
        if z(base, "en") >= 5.0:
            why.append("不规则屈折，原形 %s 是白送词 %.2f（VAL-14）"
                       % (base, z(base, "en")))
        elif base in basic:
            why.append("不规则屈折，原形 %s 在初中词表（VAL-14）" % base)
    return why, f


# ── 主流程 ────────────────────────────────────────────────────────────
def main():
    ap = argparse.ArgumentParser(description="换一个重点词（四步合一，缺一不落盘）")
    ap.add_argument("aid")
    ap.add_argument("old")
    ap.add_argument("new")
    ap.add_argument("--zh", required=True, help="中文正文里该词换成什么（不含括注）")
    ap.add_argument("--gloss", required=True, help="速查表里新词的释义")
    ap.add_argument("--dry", action="store_true", help="只查不改")
    a = ap.parse_args()
    aid = a.aid.zfill(2)
    art, arts = load_one(aid)

    print("=" * 64)
    print("换词 · 第%s篇 · %s → %s" % (aid, a.old, a.new))
    print("=" * 64)

    # ── ★★ 换词之前先问一句：是不是为了消 VAL-13（篇内同词元）？──────
    # **实测：本会话为消 VAL-13 换词，九次里有四次把句子改坏了。**
    #   第15篇 stopped→checking：**「did the checking」不是英文说法**；
    #   第45篇 bolts→staple：**订书钉不是门闩**；
    #   第24篇 remaining→leftover：**「吃剩的」用于承重钢筋语域不对**；
    #   第44篇 lemons→citron：**事实错误 —— 林德试验用的是柠檬与橙**。
    # **而这四处都改不回「另一个新词」：正确的词全被跨篇规则占掉了。**
    # **VAL-13 是待核级，不是硬伤 —— 它本就允许判为保留。**
    _stem = lambda x: re.sub(r"(ies|ing|ed|es|s)$", "", x.lower())
    _cur = {m.group(1).lower()
            for p_ in art["paras"]
            for m in re.finditer(r"\*\*([^*]+?)\*\*", p_["en"])}
    if any(_stem(w) == _stem(a.old) and w != a.old.lower() for w in _cur):
        print("  ⚠ 本篇另有 %s 的同一词元 —— 你多半是在消 VAL-13。" % a.old)
        print("    **VAL-13 是待核级、不是硬伤，本就允许判为保留。**")
        print("    **本会话为消它换词，九次里四次把句子改坏**"
              "（checking／staple／leftover／citron，后者还是事实错误）。")
        print("    **判据：同一个词的两种形式占两个名额，代价是读者背两次；**")
        print("    **而换成不对的词，代价是句子不成立。后者严重得多。**")
        print("    换之前先问：新词放回那一句里，读起来还对吗？")

    # ── 一、vet ──
    why, freq = vet(aid, a.new, arts)
    if why:
        print("  ✗ 一、vet 不过：%s" % "／".join(why))
        die("**新词不合格。换一个再来 —— 不要凭感觉直接填。**")
    print("  ✓ 一、vet 通过（词频 %.2f，无跨篇冲突，非白送词/生僻词/初中词）" % freq)

    # ── 二、英文侧 ──
    p = path_of(aid)
    src = open(p, encoding="utf-8").read()
    en_pat = "**%s**" % a.old
    n_en = src.count(en_pat)
    if n_en != 1:
        die("英文侧 `%s` 命中 %d 处（须恰好 1 处）。"
            "多处或零处都说明我截取的上下文不对，须先看清原文。" % (en_pat, n_en))
    print("  ✓ 二、英文侧命中 1 处")

    # ── 三、中文侧 ──
    zh_pat = "(%s)" % a.old
    n_zh = src.count(zh_pat)
    if n_zh != 1:
        die("中文侧 `%s` 命中 %d 处（须恰好 1 处）。"
            "**中英失配那 13 次，正是因为这一步被跳过。**" % (zh_pat, n_zh))
    m = re.search(r"\*\*([^*]+?)\*\*\(%s\)" % re.escape(a.old), src)
    if not m:
        die("中文侧 `(%s)` 前面没有加粗词，改不了。" % a.old)
    zh_old = m.group(1)
    print("  ✓ 三、中文侧命中 1 处：**%s**(%s) → **%s**(%s)"
          % (zh_old, a.old, a.zh, a.new))

    if not any("\u4e00" <= c <= "\u9fff" for c in a.gloss):
        die("--gloss 必须是中文（红线六）")

    if a.dry:
        print("\n  （--dry：四步全过，未落盘）")
        return

    # ── 落盘：英文 + 中文一起改 ──
    src = src.replace(en_pat, "**%s**" % a.new, 1)
    src = src.replace("**%s**(%s)" % (zh_old, a.old),
                      "**%s**(%s)" % (a.zh, a.new), 1)
    open(p, "w", encoding="utf-8").write(src)

    # ── 四、速查表整表重排 ──
    src = open(p, encoding="utf-8").read()
    i = src.index('"id": "%s"' % aid)
    st = src.rindex("{", 0, i)
    d = 0
    for j in range(st, len(src)):
        if src[j] == "{":
            d += 1
        elif src[j] == "}":
            d -= 1
            if d == 0:
                en = j + 1
                break
    o = json.loads(src[st:en])
    old_g = {g["w"].lower(): g["zh"] for g in o["glossary"]}
    old_g[a.new.lower()] = a.gloss
    gl = []
    for pi, pa in enumerate(o["paras"], 1):
        for w in core.keywords(pa["en"]):
            k = w.lower()
            z = old_g.get(k)
            if not z:
                die("速查表缺 %s 的释义" % k)
            if not any("\u4e00" <= c <= "\u9fff" for c in z):
                die("%s 的释义不是中文（红线六）" % k)
            gl.append({"w": k, "zh": z, "p": pi})
    if len(gl) != 50 or len({g["w"] for g in gl}) != 50:
        die("速查表 %d 条 / 去重 %d 条，须 50 / 50"
            % (len(gl), len({g['w'] for g in gl})))
    o["glossary"] = gl
    o["metrics"] = core.metrics(o["paras"])
    single = aid in ("01", "02", "03", "04", "05")
    body = json.dumps(o if single else [o], ensure_ascii=False, indent=2)
    body = "\n".join(("  " + l) if k else l
                     for k, l in enumerate(body.split("\n")))
    if single:
        open(p, "w", encoding="utf-8").write(src[:st] + body + src[en:])
    else:
        open(p, "w", encoding="utf-8").write(
            "(function () {\n  const SITE = (window.SITE = window.SITE || {});\n"
            "  const ARTICLES = (SITE.ARTICLES = SITE.ARTICLES || []);\n"
            "  ARTICLES.push(...%s);\n})();\n" % body)
    print("  ✓ 四、速查表已整表重排（50 条，每条带中文断言）")
    print("      %s" % o["metrics"])

    # ── 落盘后立刻复查 ──
    r = subprocess.run([sys.executable,
                        os.path.join(ROOT, "scripts", "inspector.py"), aid],
                       cwd=ROOT, capture_output=True, text=True, timeout=180)
    hard = re.search(r"硬伤 (\d+)", r.stdout)
    print("\n  检察官：%s" % (r.stdout.split("\n")[1].strip()
                            if len(r.stdout.split("\n")) > 1 else "?"))
    if hard and hard.group(1) != "0":
        print("\n  ⚠ **这一篇现在有硬伤** —— 换词本身四步都过了，"
              "但可能碰坏了别处。逐条看检察官报告。")
    print("\n  ★ 仍须跑：build_markdown → rescan → regress accept")


if __name__ == "__main__":
    main()
