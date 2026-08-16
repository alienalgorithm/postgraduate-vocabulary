#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
精修守门器 · polish
==================
十轮精修的状态机。它做三件事：

  1. **决定下一轮是哪一轮** —— 不许跳，不许乱序
  2. **生成这一轮需要的材料** —— 把该判断的东西摆到面前，不用自己去翻
  3. **缺证据就不许推进** —— 每轮必须写入台账才能进入下一轮

存在的理由：靠自觉会漏跑，靠清单会敷衍。把「这一轮到底看没看」变成
文件系统里的事实，而不是记忆里的印象。

用法
----
    python3 scripts/polish.py 21 status        # 进行到哪一轮，还缺什么
    python3 scripts/polish.py 21 next          # 生成下一轮的材料
    python3 scripts/polish.py 21 round 4       # 重新生成第4轮材料
    python3 scripts/polish.py 21 done 4 --note "查了6个连接词，3处改，理由…"
    python3 scripts/polish.py 21 log 2 --pos "§1句2" --before "…" --after "…" --why "…"
"""
import json, os, re, sys, subprocess, argparse, statistics as st

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(ROOT, "scripts"))
os.chdir(ROOT)
BAR = "─" * 70
SENT = re.compile(r"(?<=[.!?])\s+")
BOLD = re.compile(r"\*\*(.+?)\*\*")
PAIR = re.compile(r"\*\*([^*]+)\*\*\(([A-Za-z][A-Za-z'’\-]*)\)")

ROUNDS = {
    1: ("机器层", "九层规则 + 审读任务书 + preflight 全部跑过，每条待核都有处置"),
    2: ("句序层", "每一句的回报位置都列出，回报隔两段者逐个判过"),
    3: ("接缝层", "四处段落接缝逐一对读，每处给出承接与否的判断"),
    4: ("因果层", "全篇连接词逐个验证；抽象前置与格言相邻一并查过"),
    5: ("中文层", "遮住英文单读中文；单字加粗与疑似拆词逐条判过"),
    6: ("词价层", "50 个名额逐个问「值不值」；换词均先查同根冲突"),
    7: ("母语者层", "对标散文档案；抽象主语、无施事被动、句长节奏三项查过"),
    8: ("回退审计", "台账每一行都填了「保留/回退/再改」，并回跑过全库"),
    9: ("整体冷读", "放下清单通读，三问都有答案"),
    10: ("临界点判定", "每个「没改」项都答出「改它要牺牲什么」"),
}

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
    return a, arts

def ledger_path(aid):
    return os.path.join(ROOT, "notes", f"精修台账-{aid}.md")

def read_ledger(aid):
    p = ledger_path(aid)
    if not os.path.exists(p):
        return {}, []
    txt = open(p, encoding="utf-8").read()
    done = {int(m.group(1)) for m in re.finditer(r"^### 第(\d+)轮 · 已完成", txt, re.M)}
    changes = re.findall(r"^\| (\d+) \| ([^|]*) \| ([^|]*) \| ([^|]*) \| ([^|]*) \| ([^|]*) \|$",
                         txt, re.M)
    return {k: True for k in done}, changes

def init_ledger(aid, a):
    p = ledger_path(aid)
    if os.path.exists(p):
        return
    open(p, "w", encoding="utf-8").write(
        f"# 精修台账 · 第{aid}篇 {a['title']}\n\n"
        f"> 起始指标：{a['metrics']['words']}词 / {a['metrics']['keywords']}重点词 "
        f"/ {a['metrics']['density']}%\n"
        "> 规则：每处改动一行。第八轮回退审计时逐行复核。\n\n"
        "## 改动台账\n\n"
        "| 轮 | 位置 | 改前 | 改后 | 理由 | 第八轮复核 |\n"
        "|---|---|---|---|---|---|\n\n"
        "## 轮次记录\n\n")

def mark_done(aid, n, note):
    p = ledger_path(aid)
    txt = open(p, encoding="utf-8").read()
    name, req = ROUNDS[n]
    txt += f"### 第{n}轮 · 已完成 · {name}\n\n{note.strip()}\n\n"
    open(p, "w", encoding="utf-8").write(txt)

def log_change(aid, n, pos, before, after, why):
    p = ledger_path(aid)
    txt = open(p, encoding="utf-8").read()
    esc = lambda s: s.replace("|", "\\|").replace("\n", " ")[:120]
    row = f"| {n} | {esc(pos)} | {esc(before)} | {esc(after)} | {esc(why)} | 待审 |\n"
    txt = txt.replace("|---|---|---|---|---|---|\n", "|---|---|---|---|---|---|\n" + row, 1)
    open(p, "w", encoding="utf-8").write(txt)

# ── 各轮材料生成 ────────────────────────────────────────────────────
STOP = set("""the a an and or of to in on at for from by as that this these those it its their his her
they he she we you i not but was were is are be been being had have has do does did will would could
should may might must can if then than when where which who what while with without within into onto
over under about after before during through between among across against out up down off again more
most much many some any all each every both few other another such same own very just also only even
still yet there here one two three four five six seven eight nine ten first second third new old like
get got make made take took said say says use used using per via etc so no nobody nothing them him us
me my our your""".split())
def cw(s):
    return {w.lower().rstrip("s") for w in re.findall(r"[A-Za-z]{4,}", s)
            if w.lower() not in STOP}

def sents(p):
    return [x.strip() for x in SENT.split(p.replace("**", "")) if x.strip()]

def r1(a, arts, aid):
    print("跑三个工具，逐条处置输出中的每一项：\n")
    for cmd in (f"python3 scripts/inspector.py {aid}",
                f"python3 scripts/agent.py audit {aid}",
                "python3 scripts/preflight.py"):
        print(f"  {cmd}")
    print("\n注意：待核与提示不是必改项。判为合理的要写明理由，")
    print("      不要为消掉告警而牺牲文章——本项目曾为此硬插五句无关事实。")

def r2(a, arts, aid):
    ps = [p["en"] for p in a["paras"]]
    print("每一句的回报位置。**回报隔两段者逐个判断是否来早了。**\n")
    for i, t in enumerate(ps, 1):
        ss = sents(t)
        for j, s in enumerate(ss):
            key = cw(s)
            later = [k + 1 for k in range(i, len(ps)) if key & cw(ps[k])]
            prev = cw(ss[j - 1]) if j else set()
            nxt = cw(ss[j + 1]) if j < len(ss) - 1 else set()
            near = "接得上" if (key & prev or key & nxt) else "★前后皆不接"
            far = f"回报最早在 §{later[0]}" if later else "无后续回应"
            flag = "  ⚠" if (near.startswith("★") and later and later[0] >= i + 2) else ""
            print(f"  §{i}句{j+1}  {near:<10}{far:<16}{flag}")
            print(f"          {s[:88]}")
    print("\n判据：删掉它，如果前后两句反而接得更紧，它就是横插进来的。")
    print("修法：不是删，是移到它的回报旁边——从伏笔变成原因。")

def r3(a, arts, aid):
    ps = [p["en"] for p in a["paras"]]
    print("四处段落接缝。**后一句是否承接前一句交给它的东西？**\n")
    for i in range(len(ps) - 1):
        prev, nxt = sents(ps[i])[-1], sents(ps[i + 1])[0]
        shared = cw(prev) & cw(nxt)
        print(f"  接缝 §{i+1}→§{i+2}   共享实词：{'、'.join(sorted(shared)) or '★无'}")
        print(f"    ←…{prev[-86:]}")
        print(f"    →{nxt[:86]}…\n")
    print("注意：共享实词为空不等于断档——好的接缝常靠概念承接而非词面重合。")
    print("      要读，不要只看这一列。")

def r4(a, arts, aid):
    ps = [p["en"] for p in a["paras"]]
    CAUSAL = re.compile(r"\b(therefore|so|thus|hence|because|since|that is why|as a result|"
                        r"which is why|and so)\b", re.I)
    ABSTRACT = re.compile(r"\b(lesson|principle|means|matters|is itself|cannot|need not|"
                          r"what made|the point|a system|a market)\b", re.I)
    print("① 因果连接词 —— 前一句真的推得出这一句吗？\n")
    n = 0
    for i, t in enumerate(ps, 1):
        ss = sents(t)
        for j, s in enumerate(ss):
            if CAUSAL.search(s):
                n += 1
                if j:
                    print(f"  前：{ss[j-1][-80:]}")
                print(f"  ★§{i}句{j+1}：{s[:96]}\n")
    if not n:
        print("  （无连接词）\n")
    print("② 抽象是否跑在具体前面\n")
    for i, t in enumerate(ps, 1):
        ss = sents(t)
        for j, s in enumerate(ss):
            if ABSTRACT.search(s) and not re.search(r"\d", s) and j < len(ss) - 1:
                print(f"  §{i}句{j+1}/{len(ss)}（其后还有 {len(ss)-j-1} 句具体内容）")
                print(f"    {s[:88]}")
    print("\n③ 末段最后两句是否都是格言\n")
    last = sents(ps[-1])[-2:]
    for s in last:
        has = "有数字/专名" if (re.search(r"\d", s) or
                             re.search(r"(?<!^)\b[A-Z][a-z]{2,}", s)) else "★纯议论"
        print(f"  {has}：{s[:88]}")
    print("\n解法不是插一句无关事实——合并成一句，或让其中一句带上具体事实。")

def r5(a, arts, aid):
    OK = set("氢氯氮碳钢铂酸熵氨键阀缸轴极钾硫铀核云氧铅冰雪海岸船网帧年米度秒吨剂针管壁衬"
             "柱片弧尺缘半段斑病省链轮货毒界位谱仪电零钟脑肺肝肾")
    print("① 遮住英文，先把中文整段读一遍：\n")
    for i, p in enumerate(a["paras"], 1):
        print(f"  §{i} {p['zh'].replace('**','')}\n")
    print("② 单字加粗（白名单外，逐条判是否立得住）\n")
    for i, p in enumerate(a["paras"], 1):
        ms = list(PAIR.finditer(p["zh"]))
        for m in ms:
            if len(m.group(1)) == 1 and m.group(1) not in OK:
                ctx = p["zh"][max(0, m.start() - 12):m.end() + 10].replace("**", "")
                print(f"  §{i} **{m.group(1)}**({m.group(2)})　…{ctx}…")
        for x, y in zip(ms, ms[1:]):
            if y.start() - x.end() <= 1 and len(x.group(1)) == 1 and len(y.group(1)) == 1:
                print(f"  §{i} ★疑似拆词：**{x.group(1)}**({x.group(2)})"
                      f"**{y.group(1)}**({y.group(2)}) → 「{x.group(1)}{y.group(1)}」")
    print("\n判据：这是一段中国人会写的中文吗？为对上英文而挤出的单字，多半不是。")

def r6(a, arts, aid):
    from wordfreq import zipf_frequency as z
    print("50 个名额逐个问：一个考研考生学到这个词，值不值？\n")
    rows = []
    for i, p in enumerate(a["paras"], 1):
        for w in BOLD.findall(p["en"]):
            zz = z(re.sub(r"[^a-zA-Z]", "", w).lower(), "en")
            tag = "★白送" if zz >= 5.0 else ("边缘" if zz >= 4.6 else "")
            rows.append((zz, i, w, tag))
    for zz, i, w, tag in sorted(rows, reverse=True):
        print(f"  §{i}  {w:<18}{zz:>5.2f}  {tag}")
    print("\n换词前必须查同根冲突：")
    print("  python3 -c \"import sys;sys.path.insert(0,'scripts')")
    print("  from agent import load,used_index,norm,stem,kin")
    print(f"  arts=load();exact,stems,owner=used_index(arts,'{aid}')")
    print("  ...\"   （见《单篇精修提示词》第六轮）")

def r7(a, arts, aid):
    try:
        import spacy
        nlp = spacy.load("en_core_web_sm")
    except Exception:
        print("spaCy 未装，本轮只能人工读。"); return
    prof = json.load(open("data/reference/prose-profile.json", encoding="utf-8"))
    lens, passive, absubj = [], [], []
    ABS = {"discovery", "insight", "analysis", "approach", "method", "result", "finding",
           "idea", "concept", "process", "development", "conclusion", "explanation",
           "work", "theory", "system", "relation", "scale", "framework", "narrative"}
    for i, p in enumerate(a["paras"], 1):
        for s in nlp(p["en"].replace("**", "")).sents:
            n = sum(1 for t in s if not t.is_punct)
            if n < 3: continue
            lens.append((i, n, s.text.strip()))
            if any(t.dep_ in ("nsubjpass", "auxpass") for t in s):
                agent = any(t.dep_ == "agent" for t in s)
                passive.append((i, agent, s.text.strip()))
            for t in s:
                if t.dep_ == "nsubj" and t.lemma_.lower() in ABS:
                    absubj.append((i, t.text, s.text.strip()))
    ln = [x[1] for x in lens]
    print(f"① 句长节奏　本篇 均{st.mean(ln):.1f} 差{st.pstdev(ln):.1f}"
          f"　参照 均{prof['sent_len_mean']} 差{prof['sent_len_stdev']}\n")
    prev2 = []
    for i, n, s in lens:
        run = "★短句连排" if (len(prev2) == 2 and all(x <= 9 for x in prev2) and n <= 9) else ""
        print(f"  §{i} {n:>2}词 {run}  {s[:76]}")
        prev2 = (prev2 + [n])[-2:]
    print(f"\n② 被动语态（参照语料 {prof['passive_pct']}%，带 by 施事者不算问题）\n")
    for i, ag, s in passive:
        print(f"  §{i} {'有施事 ✓' if ag else '★无施事'}  {s[:76]}")
    if not passive: print("  （无）")
    print("\n③ 抽象名词作主语（写作规范 §3.3，应为 0）\n")
    for i, w, s in absubj:
        print(f"  ★§{i} {w} —— {s[:76]}")
    if not absubj: print("  ✓ 无")

def r8(a, arts, aid):
    _, changes = read_ledger(aid)
    print("台账逐行复核。对每一处问：**这一改是真的更好，还是只是让告警消失了？**\n")
    if not changes:
        print("  台账为空——前七轮若确实改过东西，说明没有记账，无法审计。")
        print("  用 polish.py <篇号> log <轮> --pos --before --after --why 补记。")
        return
    for n, pos, before, after, why, review in changes:
        print(f"  第{n}轮 {pos.strip()}")
        print(f"    改前：{before.strip()}")
        print(f"    改后：{after.strip()}")
        print(f"    理由：{why.strip()}     当前复核：{review.strip()}\n")
    print("判定法：遮住理由，并排读改前改后。选不出哪个更好 → 中性改动 → 回退。")
    print("\n三条自毁模式必查：")
    print("  1 为消告警而牺牲文章（曾在五篇末段硬插无关事实）")
    print("  2 为满足指标而伤中文（曾把「第二个基座」改成不成句的「第二处立足」）")
    print("  3 改动扩散到别篇（曾因 re.sub 未加 count=1 改坏第04篇）")
    print("\n本轮必须回跑全库：python3 scripts/inspector.py")

def r9(a, arts, aid):
    print("放下全部规则，从头读一遍。不查任何东西。\n")
    print(BAR)
    for p in a["paras"]:
        print(p["en"].replace("**", "") + "\n")
    print(BAR)
    for p in a["paras"]:
        print(p["zh"].replace("**", "") + "\n")
    print(BAR)
    print("\n只回答三个问题：")
    print("  1 读到哪里卡了一下？（卡住即问题，哪怕说不出是什么问题）")
    print("  2 哪一句让你想停下来再读一遍？（那是高点，确认没被前几轮磨平）")
    print("  3 明天你还会记得哪一句？（记不住任何一句，说明还没立住）")

def r10(a, arts, aid):
    print("列出前九轮所有「没改」的项目，逐条回答：改它要牺牲什么？\n")
    print("  | 项 | 为什么没改 | 改了会牺牲什么 |")
    print("  |---|---|---|")
    print("  | 例：句长均值低于语料 | 体裁约束 | 270词上限＋50重点词，拉长句必然挤掉论证 |")
    print("\n判定条件：**只要还有一项答不上「改它要牺牲什么」，就说明没到临界点，回去改。**")
    print("\n最终交付：")
    print("  1 notes/精修台账-%s.md（含第八轮复核结论）" % aid)
    print("  2 十轮各自的「改了什么 / 没改什么 / 为什么」")
    print("  3 第九轮冷读的三个答案")
    print("  4 preflight 全绿输出")
    print("  5 两句结论：这篇已到临界点，挡住它的是 ______；第八轮回退了 __ 处")

GEN = {1: r1, 2: r2, 3: r3, 4: r4, 5: r5, 6: r6, 7: r7, 8: r8, 9: r9, 10: r10}

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("aid")
    ap.add_argument("cmd", choices=["status", "next", "round", "done", "log"])
    ap.add_argument("n", nargs="?", type=int)
    ap.add_argument("--note", default="")
    ap.add_argument("--pos", default=""); ap.add_argument("--before", default="")
    ap.add_argument("--after", default=""); ap.add_argument("--why", default="")
    args = ap.parse_args()
    aid = args.aid.zfill(2)
    a, arts = load(aid)
    init_ledger(aid, a)
    done, changes = read_ledger(aid)
    nxt = next((k for k in range(1, 11) if k not in done), None)

    if args.cmd == "status":
        print(BAR); print(f"精修进度 · 第{aid}篇 {a['title']}"); print(BAR)
        for k in range(1, 11):
            name, req = ROUNDS[k]
            mark = "✓" if k in done else ("▶" if k == nxt else "·")
            print(f"  {mark} 第{k:>2}轮 {name:<8}{req}")
        print(BAR)
        print(f"台账 {len(changes)} 处改动"
              f"，待审 {sum(1 for c in changes if '待审' in c[5])} 处")
        print(f"下一轮：第 {nxt} 轮" if nxt else "十轮已跑完，可做最终交付")
        return

    if args.cmd == "log":
        if not args.n: sys.exit("log 需指定轮次")
        log_change(aid, args.n, args.pos, args.before, args.after, args.why)
        print(f"已记入台账：第{args.n}轮 {args.pos}")
        return

    if args.cmd == "done":
        n = args.n or nxt
        if n != nxt:
            sys.exit(f"不许跳轮：当前应完成第 {nxt} 轮，收到第 {n} 轮")
        if len(args.note.strip()) < 30:
            sys.exit("note 太短。必须写明：改了什么 / 什么没改 / 为什么没改")
        mark_done(aid, n, args.note)
        print(f"✓ 第{n}轮已记入台账。下一轮：第 {n+1} 轮" if n < 10 else "✓ 十轮跑完")
        return

    n = args.n if args.cmd == "round" else nxt
    if n is None:
        print("十轮已跑完。"); return
    if args.cmd == "next" and n != nxt:
        sys.exit("顺序错误")
    name, req = ROUNDS[n]
    print(BAR); print(f"第 {n} 轮 · {name}　—　第{aid}篇 {a['title']}")
    print(f"完成标准：{req}"); print(BAR); print()
    GEN[n](a, arts, aid)
    print()
    print(BAR)
    print(f"本轮做完后：python3 scripts/polish.py {aid} done {n} --note \"改了…／没改…／因为…\"")
    print(f"每处改动：  python3 scripts/polish.py {aid} log {n} --pos … --before … --after … --why …")

if __name__ == "__main__":
    main()
