#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
质量回归 · 快照管理器
====================
**检查逻辑已并入检察官第十层（REG）**，跑 `inspector.py <篇号>` 即自动执行。
本文件只负责两件事：存快照、把当前状态设为新基准。
（`profile()` 与 `check()` 由 inspector 直接调用。）

前九层查「当前状态合不合规」，第十层查「这次改动有没有把东西弄坏」
——**两者查的不是同一件事**。

存在的理由：本项目反复出现同一种事故，每一次都通过了全部合规检查：

  · 为省词删掉 question → 标题 Only That **Question** Had a Number 失去落点
  · 消除无施事被动 → 造出 The harbour had shown the fault（码头不会「演示」毛病）
  · 避开词冲突改用 planking → 人在甲板上跑，不在「铺板」上跑
  · 压词数把 at the Vasa Museum 缩成 there → 先行词全篇消失
  · 为消「结尾格言相邻」硬插五句无关事实 → 五处新毛病
  · 改英文后中文「一个」失去落点

**这些都不是硬伤，绝对规则查不出来。它们只有和改动前对比才看得见。**

用法
----
    python3 scripts/regress.py 22 snapshot     # 动手改之前，存快照
    ...编辑...
    python3 scripts/inspector.py 22            # 检察官自动带上 REG 层
    python3 scripts/regress.py 22 accept       # 确认无碍，把当前状态设为新基准

英文质量是重点：本工具的九项检查里有七项只针对英文。
"""
import json, os, re, sys, subprocess, argparse, statistics as st
import core as _core   # 数词、切句、实词的唯一权威实现

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(ROOT, "scripts"))
os.chdir(ROOT)
BAR = "─" * 70
SENT = re.compile(r"(?<=[.!?])\s+")
BOLD = re.compile(r"\*\*(.+?)\*\*")
SNAP = os.path.join(ROOT, "notes", ".regress")

STOP = set("""the a an and or of to in on at for from by as that this these those it its their his her
they he she we you i not but was were is are be been being had have has do does did will would could
should may might must can if then than when where which who what while with without within into onto
over under about after before during through between among across against out up down off again more
most much many some any all each every both few other another such same own very just also only even
still yet there here one two three four five six seven eight nine ten first second third new old like
get got make made take took said say says use used using per via etc so no nobody nothing them him us
me my our your had been could not did does what where when who into""".split())

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

def plain(t):
    return t.replace("**", "")

def sents(p):
    return [x.strip() for x in SENT.split(plain(p)) if x.strip()]

def content(s):
    return {w.lower().rstrip("s") for w in re.findall(r"[A-Za-z]{4,}", s)
            if w.lower() not in STOP}

def bigrams(t):
    ws = [w.lower() for w in re.findall(r"[A-Za-z']+", plain(t))]
    return set(zip(ws, ws[1:]))

# ── 九项特征提取：改动前后各算一次，只报变差的 ───────────────────────
def profile(a):
    body = " ".join(p["en"] for p in a["paras"])
    ss = [s for p in a["paras"] for s in sents(p["en"])]
    lens = _core.sentence_lengths(" ".join(p["en"] for p in a["paras"]))

    # ① 标题锚：标题里的实词，正文还有没有
    tw = {w.lower() for w in re.findall(r"[A-Za-z]{4,}", a["title"])} - STOP
    body_l = plain(body).lower()
    title_lost = sorted(w for w in tw if w not in body_l)

    # ② 导语锚：导语里的数字，正文还有没有
    sf = a.get("standfirst", "")
    nums_sf = {m.group(0) for m in re.finditer(r"\d[\d,.]*", sf)}
    nums_body = {m.group(0).replace(",", "") for m in re.finditer(r"\d[\d,.]*", body)}
    sf_lost = sorted(n for n in nums_sf if n.replace(",", "") not in nums_body)

    # ③ 悬空代词：句首的 it/this/that/there/one 等，前一句有没有可指的名词
    # there 作地点代词时必须能指回一个已出现的处所名词
    PLACE = re.compile(r"\b(museum|laboratory|lab|institute|society|office|yard|"
                       r"harbour|harbor|quay|college|school|hospital|works|station)\b", re.I)
    dangling = []
    flat = [(pi, s) for pi, p in enumerate(a["paras"], 1) for s in sents(p["en"])]
    for k, (pi, s) in enumerate(flat):
        for m in re.finditer(r"\b(there)\b", s):
            before = " ".join(x for _, x in flat[:k + 1])
            if not PLACE.search(before):
                dangling.append(f"§{pi} there（前文无处所名词）")
        if re.match(r"(They|It|This|That|These|Those)\b", s) and k > 0:
            prev = flat[k - 1][1]
            if not [w for w in re.findall(r"\b[A-Za-z]{4,}\b", prev)
                    if w.lower() not in STOP]:
                dangling.append(f"§{pi} {s.split()[0]}（前句无可指名词）")
    # ④ 接缝共享词
    seams = []
    for i in range(len(a["paras"]) - 1):
        prev = sents(a["paras"][i]["en"])[-1]
        nxt = sents(a["paras"][i + 1]["en"])[0]
        seams.append(len(content(prev) & content(nxt)))

    # ⑤ 词价
    try:
        from wordfreq import zipf_frequency as z
        zs = [z(re.sub(r"[^a-zA-Z]", "", w).lower(), "en")
              for p in a["paras"] for w in BOLD.findall(p["en"])]
        cheap = sum(1 for x in zs if x >= core.CHEAP_MIN)
        edge = sum(1 for x in zs if 4.6 <= x < 5.0)
    except Exception:
        cheap = edge = -1

    # ⑥ 句长节奏
    sd = st.pstdev(lens) if len(lens) > 1 else 0
    runs = sum(1 for k in range(2, len(lens))
               if lens[k] <= 9 and lens[k-1] <= 9 and lens[k-2] <= 9)

    # ⑦ 无施事被动
    passive = len(re.findall(r"\b(?:was|were|been|be|is|are)\s+\w+ed\b(?!\s+by\b)", body))

    # ⑧ 邻句实词重复
    rep = pairs = 0
    for p in a["paras"]:
        ps = sents(p["en"]); prev = None
        for s in ps:
            cur = content(s)
            if prev is not None:
                pairs += 1; rep += len(prev & cur)
            prev = cur
    repeat = round(rep / max(pairs, 1), 3)

    return {"title_lost": title_lost, "sf_lost": sf_lost, "dangling": dangling,
            "seams": seams, "cheap": cheap, "edge": edge, "sd": round(sd, 2),
            "runs": runs, "passive": passive, "repeat": repeat,
            "bigrams": sorted(f"{x} {y}" for x, y in bigrams(body)),
            "words": a["metrics"]["words"], "body": body}

def load_colloc():
    p = os.path.join(ROOT, "data/reference/collocations.json")
    if not os.path.exists(p):
        return None
    return json.load(open(p, encoding="utf-8"))

def check(aid, old, new):
    C = load_colloc()
    bad = []
    def warn(rid, title, detail, why=""):
        bad.append((rid, title, detail, why))

    # ① 标题锚点丢失
    for w in new["title_lost"]:
        if w not in old["title_lost"]:
            warn("REG-01", "标题的词在正文里没了", w,
                 "标题会指向一个正文中不存在的词。第22篇实际发生过："
                 "为省词删掉 question，而标题是 Only That Question Had a Number")
    # ② 导语数字丢失
    for n in new["sf_lost"]:
        if n not in old["sf_lost"]:
            warn("REG-02", "导语的数字在正文里没了", n, "导语不能承诺正文没有的东西")
    # ③ 新增悬空代词
    for d in new["dangling"]:
        if d not in old["dangling"]:
            warn("REG-03", "新增悬空代词", d, "第21篇实际发生过：at the Vasa Museum 压成 there")
    # ④ 接缝共享词变少
    for i, (o, n) in enumerate(zip(old["seams"], new["seams"]), 1):
        if n < o:
            warn("REG-04", f"§{i}→§{i+1} 接缝变松", f"共享实词 {o} → {n}",
                 "共享变少不一定是坏事（概念承接也算），但要确认不是改动切断了承接")
    # ⑤ 词价变差
    if new["cheap"] > old["cheap"]:
        warn("REG-05", "白送词增加", f"{old['cheap']} → {new['cheap']}", "改动引入了 Zipf≥5.0 的词")
    if new["edge"] > old["edge"]:
        warn("REG-05", "边缘词增加", f"{old['edge']} → {new['edge']}")
    # ⑥ 节奏变差
    if new["sd"] < old["sd"] - 0.3:
        warn("REG-06", "句长节奏变平", f"标准差 {old['sd']} → {new['sd']}",
             "长短句交替是呼吸；差值下降说明句子在趋同")
    if new["runs"] > old["runs"]:
        warn("REG-06", "新增短句连排", f"{old['runs']} → {new['runs']}",
             "三个 9 词以内的句子连排，读起来像一句一句往外蹦")
    # ⑦ 无施事被动增加
    if new["passive"] > old["passive"]:
        warn("REG-07", "无施事被动增加", f"{old['passive']} → {new['passive']}",
             "被动本身不是错，藏起施事才是")
    # ⑧ 邻句重复增加
    if new["repeat"] > old["repeat"] + 0.02:
        warn("REG-08", "邻句实词重复增加", f"{old['repeat']} → {new['repeat']}",
             "接力靠推进，不是复述同一个名词")
    # ⑨ 新引入的搭配在语料中零命中
    if C:
        added = set(new["bigrams"]) - set(old["bigrams"])
        for bg in sorted(added):
            a1, b1 = bg.split(" ", 1)
            if a1 in STOP or b1 in STOP:
                continue
            if C["uni"].get(a1, 0) < 15 or C["uni"].get(b1, 0) < 15:
                continue          # 生僻词语料覆盖不足，跳过
            if C["bi"].get(bg, 0) == 0:
                warn("REG-09", "改动引入了语料中未见的搭配", bg,
                     "两个词各自常见，组合却在 446 万词里一次没出现——"
                     "多半不是母语者的说法。第21篇实际发生过：ran across her upper planking")
    return bad

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("aid", help="篇号，或 all 表示全库")
    ap.add_argument("cmd", choices=["snapshot", "check", "accept", "show"])
    args = ap.parse_args()
    os.makedirs(SNAP, exist_ok=True)
    if args.aid.lower() == "all":
        if args.cmd not in ("snapshot", "accept"):
            sys.exit("all 只支持 snapshot / accept")
        files = ["data/articles.js"] + sorted("data/" + x for x in os.listdir("data")
                                              if x.startswith("article-"))
        js = ("globalThis.window=globalThis;" +
              "".join("require(%s);" % json.dumps(os.path.abspath(f)) for f in files) +
              "process.stdout.write(JSON.stringify(globalThis.SITE.ARTICLES))")
        for art in json.loads(subprocess.run(["node", "-e", js],
                              capture_output=True, text=True).stdout):
            json.dump(profile(art), open(os.path.join(SNAP, f"{art['id']}.json"), "w"),
                      ensure_ascii=False)
        print(f"✓ 全库快照已存。以后任何一篇被改动，检察官的 REG 层立即生效。")
        return
    aid = args.aid.zfill(2)
    path = os.path.join(SNAP, f"{aid}.json")
    a = load(aid)

    if args.cmd in ("snapshot", "accept"):
        json.dump(profile(a), open(path, "w"), ensure_ascii=False)
        print(f"✓ 第{aid}篇快照已存（{a['metrics']['words']}词）。"
              f"改完后跑：python3 scripts/regress.py {aid} check")
        return
    if not os.path.exists(path):
        sys.exit(f"没有快照。先跑：python3 scripts/regress.py {aid} snapshot")
    old = json.load(open(path, encoding="utf-8"))
    new = profile(a)
    if args.cmd == "show":
        for k in ("words", "cheap", "edge", "sd", "runs", "passive", "repeat", "seams"):
            print(f"  {k:<10}{old[k]}  →  {new[k]}")
        return
    bad = check(aid, old, new)
    print(BAR); print(f"回归检查 · 第{aid}篇　{old['words']}词 → {new['words']}词"); print(BAR)
    if not bad:
        print("\n✓ 未发现质量回退。九项特征均未变差。\n")
        print("  确认接受后：python3 scripts/regress.py %s accept" % aid)
        return
    print(f"\n发现 {len(bad)} 处可能的质量回退：\n")
    for rid, title, detail, why in bad:
        print(f"  ✗ [{rid}] {title}")
        print(f"       {detail}")
        if why:
            print(f"       → {why}")
        print()
    print("每一条都要么改回来，要么写明为什么这次退让是值得的。")
    sys.exit(1)

if __name__ == "__main__":
    main()
