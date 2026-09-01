#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
单词检察官 · 写作智能体（agent）
================================
检察官 v5 已经证明：文章好不好，表层特征判不了（见 notes/检察官说明.md §2）。
所以本智能体不做"事后打分"，只做三件机器真正擅长、而人做起来极慢的事：

  1. brief   把研究材料变成「本题材可用、且词价合格」的重点词池 —— 让冲突不可能发生
  2. review  把草稿变成「按优先级排序的修改指令」 —— 而不是一堆平铺的报错
  3. skeleton 给出从范文反推的五段功能骨架 —— 每段该干什么活
  4. vet     补名额前核验候选词，一次给出全部否决理由 —— 让「凭感觉补词」不可能发生

  ★ brief 末尾会给一句「可用词够不够」的分档 —— 低于 14 个就该换角度，别硬写

判断力仍然在人（或 LLM）那一侧：反转够不够狠、结尾能不能迁移，本工具只负责
把所有可机械保证的事情机械地保证掉，并把需要判断的地方精确地标出来。

用法
----
    python3 scripts/agent.py brief  notes.txt [--exclude 03] [--top 120]
    python3 scripts/agent.py review draft.md  [--exclude 03]
    python3 scripts/agent.py skeleton
"""
import json, re, os, sys, glob, subprocess
from collections import Counter, defaultdict

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(ROOT, "scripts"))
BOLD = re.compile(r"\*\*(.+?)\*\*")
# 拼写出来的数词同样是数字（eight outcomes / three bits），否则 STR-02 误报
SPELLED = r"\b(one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|twenty|thirty|forty|fifty|sixty|seventy|eighty|ninety|hundred|thousand|million|billion|half|twice|dozen)\b"
HAS_NUM = re.compile(r"\d|" + SPELLED, re.I)
BAR = "─" * 68

try:
    from wordfreq import zipf_frequency
except Exception:
    sys.exit("需要 wordfreq：pip install wordfreq --break-system-packages")

WORDS_MIN, WORDS_MAX, KW = 240, 270, 50
ZIPF_OK_LO, ZIPF_OK_HI = 2.5, 4.6      # 合格带
ZIPF_CHEAP = 5.0                        # ≥ 白送
KW_SPREAD_MAX = 2

# ── 数据层 ──────────────────────────────────────────────────────────────
def load():
    files = ["data/articles.js"] + sorted(glob.glob(os.path.join(ROOT, "data", "article-*.js")))
    files = [f if os.path.isabs(f) else os.path.join(ROOT, f) for f in files]
    js = "globalThis.window=globalThis;" + "".join("require(%s);" % json.dumps(f) for f in files) \
         + "process.stdout.write(JSON.stringify(globalThis.SITE.ARTICLES))"
    r = subprocess.run(["node", "-e", js], capture_output=True, text=True)
    if r.returncode:
        sys.exit(r.stderr)
    return sorted(json.loads(r.stdout), key=lambda a: str(a["id"]))

def norm(s):
    return re.sub(r"[^a-z]", "", str(s).lower())

SUFFIX = ("ations", "ation", "ities", "ility", "ingly", "ising", "izing", "iness",
          "ments", "ment", "ness", "ially", "ally", "ible", "able", "ings",
          "ing", "ions", "ion", "ives", "ive", "ies", "ied", "ous", "ers",
          "est", "ed", "es", "ly", "er", "al", "s")

def stem(w):
    w = norm(w)
    for suf in SUFFIX:
        if len(w) - len(suf) >= 4 and w.endswith(suf):
            return w[: -len(suf)]
    return w

def kin(a, b):
    """同族判定：词干相同，或共享 ≥5 字符前缀且长度差 ≤3。
    补救词干器的盲区（occurrence vs occurrences → occurrenc，两者不等）。"""
    a, b = norm(a), norm(b)
    if a == b or stem(a) == stem(b):
        return True
    n = min(len(a), len(b))
    return n >= 5 and a[:n] == b[:n] and abs(len(a) - len(b)) <= 3

def used_index(arts, exclude=None):
    """词元 / 加粗表面形式 / 词干 / 同族前缀 四条通道，防止同根撞车。"""
    exact, stems, owner = set(), set(), defaultdict(set)
    for a in arts:
        if exclude and a["id"] == exclude:
            continue
        ws = [g["w"] for g in a.get("glossary", [])]
        for p in a.get("paras", []):
            ws += BOLD.findall(p["en"])
        for w in ws:
            exact.add(norm(w)); stems.add(stem(w)); owner[norm(w)].add(a["id"]); owner[stem(w)].add(a["id"])
    return exact, stems, owner

from core import count_words                                    # 唯一权威实现，见 core.py

# ── 1. brief：题材可用词池 ──────────────────────────────────────────────
STOP = set("""the a an and or of to in on at for from by as that this these those it its their his her they
he she we you i not but was were is are be been being had have has do does did will would could should may
might must can if then than when where which who whom what while with without within into onto over under
about after before during through between among across against out up down off again more most much many
some any all each every both few other another such same own very just also only even still yet there here
one two three four five six seven eight nine ten first second third new old like get got make made take took
said say says use used using per via etc""".split())

def brief(arts, notes_path, exclude=None, top=120):
    text = open(notes_path, encoding="utf-8").read()
    exact, stems, owner = used_index(arts, exclude)
    toks = re.findall(r"[A-Za-z][A-Za-z\-']{2,}", text)
    freq = Counter(t.lower().strip("-'") for t in toks)
    # 专名判定：材料中从未以小写形式出现过 → 是专名，不构成可学词，一律排除
    lower_seen = Counter(t for t in toks if t[:1].islower())
    proper = {t.lower() for t in toks if t[:1].isupper() and not lower_seen.get(t.lower())}

    rows = []
    for w, c in freq.items():
        if w in STOP or len(w) < 3:
            continue
        z = round(zipf_frequency(w, "en"), 2)
        n, s = norm(w), stem(w)
        akin = [k for k in exact if kin(w, k)]
        if n in exact or s in stems or akin:
            src = owner.get(n) or owner.get(s) or (owner.get(akin[0]) if akin else set())
            rows.append(("冲突", w, z, c, "、".join(sorted(src))))
        elif w in proper:
            continue
        elif z >= ZIPF_CHEAP:
            rows.append(("白送", w, z, c, ""))
        elif z > ZIPF_OK_HI:
            rows.append(("边缘", w, z, c, ""))
        elif z < ZIPF_OK_LO:
            rows.append(("生僻", w, z, c, ""))
        else:
            rows.append(("可用", w, z, c, ""))

    order = {"可用": 0, "生僻": 1, "边缘": 2, "白送": 3, "冲突": 4}
    rows.sort(key=lambda r: (order[r[0]], -r[3], r[2]))
    buckets = defaultdict(list)
    for r in rows:
        buckets[r[0]].append(r)

    print(BAR); print(f"写作简报 · 材料 {os.path.basename(notes_path)}"
          + (f" · 改写第 {exclude} 篇" if exclude else " · 新篇"))
    print(BAR)
    print(f"目标：{WORDS_MIN}—{WORDS_MAX} 词 / 恰好 {KW} 个重点词 / 密度 ≤20% / 5 段 / "
          f"各段重点词极差 ≤{KW_SPREAD_MAX}（理想 0，即 10·10·10·10·10）")
    print()
    # ★ 动笔前的第一个判断：这个题材还剩多少词可用（2026-09-01 第44篇实测立）
    # **判据被实测否掉一次**：最初想用「可用率百分比」——
    #   而第43篇 42% 写得最顺、一次撞车都没有；第44篇 47% 却是最吃力的一篇。
    #   **百分比与难易不相关，甚至是倒着的。**
    # **真正相关的是绝对数**：本行报出的这个可用词个数
    #   （第43篇 20 个写得顺，第44篇 13 个明显吃力）——
    #   **一篇要 50 个名额，池子里有几个能用，才决定要替换多少次。**
    _nav = len(buckets["可用"])
    print(f"【可用高价值词】{_nav} 个 —— 从这里挑满 50 个")
    if _nav < 14:
        print("   ✗ **太少（<14）。整篇会被替换词拖着走 —— 换个角度或换个题材。**")
        print("     同一件事换个切入点，要用的词就变了。")
    elif _nav < 18:
        print("   · 偏少（14—17），写的时候会频繁替换。**先想清楚角度再动笔。**")
    for r in buckets["可用"][:top]:
        print(f"   {r[1]:<18}{r[2]:>5.2f}  材料出现 {r[3]}次")
    if len(buckets["可用"]) > top:
        print(f"   …还有 {len(buckets['可用']) - top} 个")
    print()
    if buckets["生僻"]:
        print(f"【题材必需的生僻词】{len(buckets['生僻'])} 个 —— 非考研词，只在绕不开时用")
        print("   " + "  ".join(f"{r[1]}({r[2]})" for r in buckets["生僻"][:24]))
        print()
    if buckets["冲突"]:
        print(f"【必须避开 · 已被占用】{len(buckets['冲突'])} 个")
        for r in buckets["冲突"][:30]:
            print(f"   {r[1]:<18}被第 {r[4]} 篇占用")
        if len(buckets["冲突"]) > 30:
            print(f"   …还有 {len(buckets['冲突']) - 30} 个")
        print()
    print(f"【不要浪费名额】白送 {len(buckets['白送'])} · 边缘 {len(buckets['边缘'])}")
    print("   白送：" + "  ".join(r[1] for r in buckets["白送"][:20]))
    print()
    skeleton()

# ── 2. skeleton：从范文反推的五段功能骨架 ───────────────────────────────
SKELETON = [
    ("§1 布景与装置", "谁、何时、何地、用什么。给出这一篇赖以成立的物理条件。"
     "末句抛出触发点（异常读数 / 一封信 / 一次失败）。", "第17篇：1909年曼彻斯特暗室、放射源、铅屏、荧光屏，末句是闪光。"),
    ("§2 异常本身", "把反常事实连同「为什么这反常」一起给出——不要把前提留到末段。"
     "读者必须在此刻就知道它违反了什么。", "第17篇：多数穿过，少数折返；『考虑到动量，这种掉头令人震惊』就在同段。"),
    ("§3 当时的解释为何不够", "摆出主流模型，指出它能解释什么、不能解释什么。这是论证的支点。",
     "第17篇：汤姆孙原子每次只给微弱一推；卢瑟福1911年的分析要求一次强冲量。"),
    ("§4 判别性证据", "给出能在两种解释之间做出判决的那一组数字或那一次实验。"
     "本段通常是全篇最长、也是引擎。", "第17篇：盖革-马斯登1912—13年的定量测量检验了角分布预言。"),
    ("§5 意义与升华", "先给可迁移的一般命题，再用一句具体的话收束。"
     "评论只准出现在这一段；两句格言不要相邻。", "第17篇：『让少数折返者推翻多数看似证实的模型。』"),
]

def skeleton():
    print(BAR); print("五段功能骨架（自第17/12/19篇反推）"); print(BAR)
    for name, job, ex in SKELETON:
        print(f"{name}")
        print(f"   任务：{job}")
        print(f"   范例：{ex}")
    print()
    print("每段 10 个重点词、约 50—58 词。正文只让事实推进，判断留到 §5。")

# ── 3. review：按优先级排序的修改指令 ───────────────────────────────────
def review(arts, path, exclude=None):
    text = open(path, encoding="utf-8").read()
    ps = [b.strip() for b in re.split(r"\n\s*\n", text) if b.strip()]
    pw = [count_words(b) for b in ps]
    pk = [BOLD.findall(b) for b in ps]
    pkn = [len(x) for x in pk]
    tw, tk = sum(pw), sum(pkn)
    dens = tk / tw * 100 if tw else 0
    exact, stems, owner = used_index(arts, exclude)

    blocking, structural, vocab, judge = [], [], [], []

    if not (WORDS_MIN <= tw <= WORDS_MAX):
        d = tw - WORDS_MAX if tw > WORDS_MAX else WORDS_MIN - tw
        blocking.append(f"词数 {tw}，{'超' if tw > WORDS_MAX else '不足'} {d} 词。"
                        f"删同义复述与迟到的背景，保留前提/异常/推论/证据边界/末段新框架。")
    if tk != KW:
        blocking.append(f"重点词 {tk} 个，须 {KW}。")
    if dens > 20:
        blocking.append(f"密度 {dens:.1f}% 超 20%。")
    if len(ps) != 5:
        blocking.append(f"段落 {len(ps)} 段，须 5 段。")

    if pkn:
        sp = max(pkn) - min(pkn)
        if sp > KW_SPREAD_MAX:
            worst_hi = pkn.index(max(pkn)) + 1
            worst_lo = pkn.index(min(pkn)) + 1
            structural.append(f"关键词分布 {'·'.join(map(str,pkn))}，极差 {sp}。"
                              f"从 §{worst_hi} 移出 {(max(pkn)-min(pkn))//2} 个到 §{worst_lo}，目标 10·10·10·10·10。")
    for i, (w, k) in enumerate(zip(pw, pkn), 1):
        if w < 40:
            structural.append(f"§{i} 只有 {w} 词，是残段。它承担的论证不足以配得上一段——"
                              f"要么并入相邻段，要么补足它该做的活（见骨架）。")
        elif w > 72:
            structural.append(f"§{i} 有 {w} 词，一段做了不止一件事，考虑拆分。")

    allk = [w for g in pk for w in g]
    ns = [norm(x) for x in allk]
    dup = [x for x, c in Counter(ns).items() if c > 1]
    if dup:
        blocking.append("篇内重点词重复：" + "、".join(dup))
    clash = []
    for w in allk:
        n, s = norm(w), stem(w)
        akin = [k for k in exact if kin(w, k)]
        if n in exact or s in stems or akin:
            src = owner.get(n) or owner.get(s) or (owner.get(akin[0]) if akin else set())
            clash.append((w, "、".join(sorted(src))))
    if clash:
        blocking.append("与其他篇冲突（含同根）：" + "；".join(f"{w}→第{o}篇" for w, o in clash))
    cheap = [(w, round(zipf_frequency(norm(w), "en"), 2)) for w in allk
             if zipf_frequency(norm(w), "en") >= ZIPF_CHEAP]
    if len(cheap) > 6:
        vocab.append(f"白送词 {len(cheap)} 个占用名额："
                     + "、".join(f"{w}({z})" for w, z in cheap)
                     + "。换成承重实词——考研生早已掌握这些。")
    for i, p in enumerate(ps, 1):
        for m in re.finditer(r"\*\*([^*]+)\*\*\s+\*\*([^*]+)\*\*", p):
            judge.append(f"§{i} 相邻加粗 **{m.group(1)}** **{m.group(2)}**：确认不是一个词条占两个名额。")
        for m in BOLD.finditer(p):
            w = m.group(1)
            if w[:1].isupper():
                before = p[:m.start()].replace("**", "").rstrip()
                if before and not before.endswith((".", "!", "?", ":", ";")):
                    last = before.split()[-1]
                    if last[:1].isupper():
                        blocking.append(f"§{i} 专名内部加粗：{last} **{w}**。专名的一部分不是可学的词。")
    body = " ".join(p.replace("**", "") for p in ps)
    LEAD = (r"(?:In|On|At|By|The|A|An|After|Before|During|When|While|From|For|To|With|It|He|She|They|"
            r"This|That|Both|Each|Every|Later|Today|Now|Then|Its|His|Her|Their|Only|No|Not|Yet|But|And|Of)")
    _names = [m for m in re.findall(
        r"\b([A-Z][a-z]+\s+(?:van\s+|de\s+|von\s+|der\s+)?[A-Z][a-z]+)\b", body)
        if not re.match(LEAD + r"\s", m)]
    if not _names:
        structural.append("全篇没有人名。写作规范 §3.3：主语用人或具体物——把动作还给具体的人。")
    if not re.search(r"\b(instead|yet|but|however|rather than|nobody|no one)\b",
                     " ".join(ps[1:-1]) if len(ps) > 2 else body, re.I):
        judge.append("中段没有任何转折词。确认这是在论证而不是在编年——无反转的叙述读完不会有豁然开朗感。")
    for i, p in enumerate(ps[:-1], 1):
        if not HAS_NUM.search(p):
            judge.append(f"§{i} 没有任何数字。写作规范 §3.2：给数字，不给形容词。")

    print(BAR); print(f"修改指令 · {os.path.basename(path)}"); print(BAR)
    print(f"{tw}词 / {tk}重点词 / {dens:.1f}%    分布 {'·'.join(map(str,pkn))}    段落词数 {'·'.join(map(str,pw))}")
    print()
    n = 0
    for title, items in [("一、阻塞项（不修则不能入库）", blocking),
                         ("二、结构（决定这篇能到什么水平）", structural),
                         ("三、词价（决定教学价值）", vocab),
                         ("四、需人工判断（机器只能提示）", judge)]:
        if not items:
            continue
        print(title)
        for it in items:
            n += 1
            print(f"  {n}. {it}")
        print()
    if n == 0:
        print("机械层面全部通过。剩下的只有判断：反转够不够狠？结尾能不能迁移？")
    else:
        print("按顺序修：一 → 二 → 三 → 四。每修一处回查是否碰坏别处（约1/3的新缺陷是修改引入的）。")


# ── 4. audit：机器出题，人来判断 ────────────────────────────────────────
# 本会话证明：句序、因果、接缝这些决定「丝滑」的东西，表层特征判不了。
# 但机器能把「该在哪里做判断」精确地指出来，并把上下文摆好。
# 这就是主动质检：机器不下结论，机器出题。

SEAM_Q = "读这两句：后一句是否承接前一句交给它的东西？若前一句的名词/动作在后一句里接不上，就是断档。"
EARLY_Q = "这句的回报（它解释的、它铺垫的）出现在哪里？若在两段之后，它多半来得太早。"
CAUSAL = re.compile(r"\b(therefore|so|thus|hence|because|since|that is why|as a result)\b", re.I)
ABSTRACT = re.compile(r"\b(lesson|principle|system|means|matters|is itself|can|cannot|need not|"
                      r"what made|the point)\b", re.I)

def audit(arts, ids=None):
    SENT = re.compile(r"(?<=[.!?])\s+")
    for a in arts:
        if ids and a["id"] not in ids:
            continue
        ps = [p["en"].replace("**", "") for p in a["paras"]]
        print(BAR); print(f"审读任务书 · {a['id']} {a['title']}"); print(BAR)
        n = 0
        # ① 段落接缝
        print("\n【一】段落接缝 —— " + SEAM_Q)
        for i in range(len(ps) - 1):
            prev = [x.strip() for x in SENT.split(ps[i]) if x.strip()][-1]
            nxt = [x.strip() for x in SENT.split(ps[i+1]) if x.strip()][0]
            n += 1
            print(f"  Q{n}. §{i+1}末 → §{i+2}首")
            print(f"      ←…{prev[-84:]}")
            print(f"      →{nxt[:84]}…")
        # ② 因果连接词是否成立
        hits = [(i+1, m.group(0), s2.strip())
                for i, t in enumerate(ps)
                for s2 in SENT.split(t) if (m := CAUSAL.search(s2))]
        if hits:
            print("\n【二】因果连接词 —— 前一句真的推得出这一句吗？（第13篇的『所以』就推不出）")
            for pi, kw, s2 in hits:
                n += 1
                print(f"  Q{n}. §{pi} 「{kw}」：{s2[:92]}")
        # ③ 抽象句的位置
        print("\n【三】抽象与具体的次序 —— 一般性结论是否等事实说尽才出现？")
        for i, t in enumerate(ps, 1):
            ss = [x.strip() for x in SENT.split(t) if x.strip()]
            for j, s2 in enumerate(ss):
                if ABSTRACT.search(s2) and not re.search(r"\d", s2) and j < len(ss) - 1:
                    n += 1
                    print(f"  Q{n}. §{i} 第{j+1}/{len(ss)}句是结论式表述，其后还有 {len(ss)-j-1} 句具体内容：")
                    print(f"      {s2[:92]}")
        # ④ 每句的回报位置（找「来得太早」）
        print("\n【四】逐句回报 —— " + EARLY_Q)
        for i, t in enumerate(ps, 1):
            ss = [x.strip() for x in SENT.split(t) if x.strip()]
            for j, s2 in enumerate(ss):
                key = {w.lower().rstrip("s") for w in re.findall(r"[A-Za-z]{5,}", s2)} - STOP
                later = [k2 for k2 in range(i, len(ps)) if key & {
                    w.lower().rstrip("s") for w in re.findall(r"[A-Za-z]{5,}", ps[k2])}]
                near = [w for w in (ss[j-1] if j else "", ss[j+1] if j < len(ss)-1 else "")]
                nearkey = {w.lower().rstrip("s") for x in near for w in re.findall(r"[A-Za-z]{5,}", x)}
                if not (key & nearkey) and later and later[0] >= i + 1:
                    n += 1
                    print(f"  Q{n}. §{i} 第{j+1}句与前后句无实词交集，其内容在 §{later[0]+1} 才有回应：")
                    print(f"      {s2[:92]}")
        print(f"\n共 {n} 题。逐题作答后，把结论写进 notes/审读记录.md。")
        print("判据：改一处若要牺牲另一处（论证、中文、词价、指标），即为临界点，停手。")

def vet(arts, aid, words):
    """补名额前核验候选词 —— 一次给出全部否决理由。

    **立此命令之由**：`brief` 是动笔前建词池用的，而我犯错的场景恰恰不是动笔时——
    **是入库之后临时补一个名额**：那时词池早已不在手边，于是凭感觉抓一个词填进去。
    **本次会话里这一步栽了六次**：
      第39篇 covered 撞第33篇、square 撞第17篇、remote 撞第01篇（连撞三次才想起先查）；
      第40篇 rode 撞第32篇；
      第42篇 word(5.26) 与 term(5.23) 两个都是白送词（同一处连栽两回）。
    **六次的共同点：我知道该查，但补词时手边没有一个「一条命令查完」的东西。**
    """
    from wordfreq import zipf_frequency as z
    exact, stems, owner = used_index(arts, aid)
    basic = set(open(os.path.join(ROOT, "data/reference/basic-wordlist.txt"),
                     encoding="utf-8").read().split())
    cur = {m.group(1).lower()
           for a in arts if a["id"] == aid
           for p in a["paras"]
           for m in re.finditer(r"\*\*([^*]+?)\*\*", p["en"])}
    print("=" * 64)
    print("补名额核验 · 第%s篇 · %d 个候选" % (aid, len(words)))
    print("=" * 64)
    ok_list = []
    for w in words:
        wl = w.lower()
        why = []
        if wl in cur:
            why.append("本篇已用")
        if wl in basic or wl.rstrip("s") in basic:
            why.append("初中词表内（VAL-12）")
        f = z(wl, "en")
        if f >= 5.0:
            why.append("白送词 %.2f（VAL-02h）" % f)
        elif f <= 2.2:
            why.append("过于生僻 %.2f（VAL-09）" % f)
        def _who(key):
            v = owner.get(key)
            if isinstance(v, (set, frozenset, list, tuple)):
                return "、".join(sorted(str(x) for x in v))
            return str(v) if v else "?"
        if norm(wl) in exact:
            why.append("与第%s篇同形（VAL-08）" % _who(norm(wl)))
        elif stem(wl) in stems:
            why.append("与第%s篇同词元（VAL-07）" % _who(stem(wl)))
        else:
            k = [x for x in exact if kin(wl, x)]
            if k:
                why.append("与第%s篇同根（%s）" % (_who(k[0]), k[0]))
        if why:
            print("  ✗ %-16s %s" % (w, "／".join(why)))
        else:
            print("  ✓ %-16s 词频 %.2f　可用" % (w, f))
            ok_list.append(w)
    print()
    if ok_list:
        print("  可用：%s" % "、".join(ok_list))
    else:
        print("  **一个都不能用。换一批再来 —— 不要凭感觉直接填。**")
    # ★ 通过率随篇数下降，这是 45 篇之后的必然（2026-09-01 量出）
    # 第43篇约 65% ／ 第44篇约 60% ／ 第46篇 46%。
    # **常用 8000 词里词价合格的 5850 个，尚未被占用的 4068 个（69%）**——
    # 总量还宽，**但每写一篇，某个题材域内可用的那一批就薄一层**。
    # **通过率低不是状态差，是进度本身。低于五成时该考虑换题材，而不是硬凑。**
    if len(words) >= 8:
        _rate = len(ok_list) * 100 // len(words)
        print("\n  本批通过率 %d%%（%d/%d）" % (_rate, len(ok_list), len(words)))
        if _rate < 40:
            print("    ✗ **低于四成 —— 这个题材域的词快用尽了，换角度比硬凑省事。**")
            print("      （实测：第43篇约65%%、第44篇约60%%、第46篇46%%，随篇数逐档下降）")
    print()
    print("  ★★ 本命令的价值有实测对照（2026-09-01 第44篇一篇之内）：")
    print("     **跑了 vet 的 19 个词，零撞车；没跑就直接填的 7 个，全撞**")
    print("     （seek 撞18／mattered 撞34／remedy 与 parts 撞15／test 撞22／")
    print("      judgement 撞40／moment 撞17）。")
    print("     **19:7 —— 装了工具还漏跑，说明「知道该跑」不够。补名额就跑，别判断要不要跑。**")
    print("\n  ★ 补完之后仍须跑 build_markdown 与 inspector：\n"
          "    本命令只查词价与跨篇冲突，查不出中英失配与篇内重复。")


def main():
    if len(sys.argv) < 2:
        print(__doc__); return
    cmd = sys.argv[1]
    argv = sys.argv[2:]
    ex = argv[argv.index("--exclude") + 1].zfill(2) if "--exclude" in argv else None
    top = int(argv[argv.index("--top") + 1]) if "--top" in argv else 120
    pos = [a for a in argv if not a.startswith("--")
           and a not in ({ex, ex.lstrip("0")} if ex else set()) and a != str(top)]
    arts = load()
    if cmd == "audit":
        audit(arts, {x.zfill(2) for x in pos} if pos else None)
        return
    if cmd == "brief":
        brief(arts, pos[0], ex, top)
    elif cmd == "review":
        review(arts, pos[0], ex)
    elif cmd == "vet":
        if len(pos) < 2:
            print("用法：python3 scripts/agent.py vet NN word1 word2 …")
            return
        vet(arts, pos[0].zfill(2), pos[1:])
    elif cmd == "skeleton":
        skeleton()
    else:
        print(__doc__)

if __name__ == "__main__":
    main()
