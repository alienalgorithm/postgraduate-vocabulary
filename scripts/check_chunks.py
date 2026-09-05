#!/usr/bin/env python3
"""check_chunks.py —— 意群对齐检查员。每次 build_reader 跑完自动过一遍，有 A 级就红。

★ 由来（2026-09-04）：用户三次亲眼挑出对齐错误（「1854 年 9 月」没落在「In September 1854」底下、
  「lost nobody,」该拆没拆、「and died」归错段），要一个专门的机器人以后替他挑。

★ 设计原则：**检查员不能复用对齐算法的打分。** 算法优化的是它自己的代价函数，再拿同一套函数去查，
  等于让考生自己阅卷。这里的判据全部独立、全部可解释：每条报出来都能说清是哪一条、为什么。

★ 能保证什么、不能保证什么（老实话）：
  · 结构性的错——拼不回原句、锚点跑到别段、否定词/数字两边不对、英文断在半路、中文悬着「的」、
    该拆没拆、语序倒置——**全能逮到，而且是确定性的，跑一万次结果一样。**
  · 纯语义的错——两段各自完整、锚点也对、只是意思配错了——**规则逮不到**。
    这一层只有 `--llm` 模式（五个独立模型实例各读一遍）或真人能给。没有密钥时它会明说。

用法：
  python3 scripts/check_chunks.py 01                 # 查 reader/a01.json，写 notes/对齐检查-01.md
  python3 scripts/check_chunks.py 01 --quiet         # 只打印一行结论（preflight 用）
  python3 scripts/check_chunks.py 01 --llm           # 再加五个模型实例复核（需 ANTHROPIC_API_KEY）
  python3 scripts/check_chunks.py --selftest         # 拿已知的坏对齐验一遍检查员自己
退出码：有 A 级 → 1；否则 0。
"""
import os
import re
import sys
import json
from collections import Counter

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CN_NUM = "〇零一二两三四五六七八九十百千万亿"
BOLD = re.compile(r"\*\*([^*]+)\*\*")
GLOSS = re.compile(r"\*\*([^*]+)\*\*\(([^)]+)\)")

EN_NEG = re.compile(r"\b(?:not|no|never|nothing|nobody|none|nor|neither|without)\b", re.I)
ZH_NEG = re.compile(r"不(?!过|但|仅|管|论|只|光|久)|没|无(?!论)|未(?!必)|非(?!常)")
MONTH = {m: i for i, m in enumerate(
    ["january", "february", "march", "april", "may", "june", "july",
     "august", "september", "october", "november", "december"], 1)}
# 英文段不该以这些词收尾（介词/连词/冠词/不定式 to）——那是把词组劈开了
EN_BAD_TAIL = {"a", "an", "the", "of", "to", "in", "on", "at", "by", "for", "with", "from",
               "into", "than", "as", "and", "or", "but", "nor", "that", "which", "who", "whom",
               "whose", "where", "when", "while", "if", "because", "since", "though", "although",
               "so", "very", "his", "her", "their", "its", "my", "our", "your"}
# 中文段不该以这些字收尾（结构助词/介词/连词悬着）
ZH_BAD_TAIL = "的地得把被和与在给让对向从跟同及并而或却也就才还都"
# 英文段开头允许的「开头词」：非标点处断在它们前面算自然停顿
OPENERS = {"a", "an", "the", "this", "that", "these", "those", "his", "her", "their", "its",
           "my", "our", "some", "each", "every", "all", "both", "no", "one", "two", "three",
           "and", "but", "or", "so", "yet", "he", "she", "it", "they", "we", "there", "since",
           "because", "while", "when", "where", "which", "who", "if", "though", "although",
           "after", "before", "until"}


def zh_len(t):
    return len(re.sub(r"[^\w\u4e00-\u9fff]", "", GLOSS.sub(r"\1", t)))


def en_words(t):
    return BOLD.sub(r"\1", t).split()


def en_keys(t):
    return [w.lower().strip(",.;:!?—") for w in BOLD.findall(t)]


def zh_keys(t):
    return [g.lower() for _, g in GLOSS.findall(t)]


def same_key(a, b):
    return a == b or a.rstrip("s") == b.rstrip("s")


def nums_en(t):
    out = [x for x in re.findall(r"\d+", BOLD.sub(r"\1", t))]
    for w in BOLD.sub(r"\1", t).lower().split():
        w = w.strip(",.;:!?")
        if w in MONTH:
            out.append(str(MONTH[w]))
    return Counter(out)


CN_DIGIT = {"〇": "0", "零": "0", "一": "1", "二": "2", "两": "2", "三": "3", "四": "4",
            "五": "5", "六": "6", "七": "7", "八": "8", "九": "9"}


def _cn2num(t):
    """把「三十」「五十」「两」这类汉字数字折成阿拉伯数字，好跟英文比。
    ★ 英文 30-centimetre / 50 metres，中文写「三十厘米」「五十米」——
      只认阿拉伯数字会误判成「一边有数字一边没有」（第02篇 §5 就是这么被误报 A 的）。"""
    out = []
    for m in re.finditer(r"[〇零一二两三四五六七八九十百千万亿]+", t):
        w = m.group(0)
        # ★ 只认两字以上的汉字数字（三十／五十／一千）。单字「一位」「两处」「第二」
        #   在中文里几乎都是量词或序数，算成数字会把「一位寡妇」当成有数字（自测逮到的）。
        if len(w) < 2:
            continue
        if w == "十":
            out.append("10"); continue
        mm = re.fullmatch(r"([一二两三四五六七八九])?十([一二三四五六七八九])?", w)
        if mm:
            tens = CN_DIGIT.get(mm.group(1) or "一", "1")
            out.append(tens + (CN_DIGIT.get(mm.group(2), "0") if mm.group(2) else "0")); continue
        if all(c in CN_DIGIT for c in w):
            out.append("".join(CN_DIGIT[c] for c in w))
    return out


def nums_zh(t):
    t = GLOSS.sub(r"\1", t)
    return Counter(re.findall(r"\d+", t) + _cn2num(t))


# ═══════════ 单句检查 ═══════════

def check_sentence(s):
    """返回 [(等级, 段号或None, 判据, 说明, 建议)]。"""
    F = []
    en, zh = s["en"], s["zh"]
    chunks = s.get("chunks") or []
    if not chunks:
        return [("A", None, "无意群", "这句没有 chunks", "重跑 build_reader")]

    # 一 · 拼回去必须等于原句——丢词丢字是最不能忍的
    en_join = " ".join(c["en"] for c in chunks)
    if BOLD.sub(r"\1", en_join).split() != BOLD.sub(r"\1", en).split():
        F.append(("A", None, "英文拼不回原句", "各段英文拼起来与原句不同（丢词或多词）", "重跑 build_reader"))
    if GLOSS.sub(r"\1", "".join(c["zh"] for c in chunks)).replace(" ", "") != GLOSS.sub(r"\1", zh).replace(" ", ""):
        F.append(("A", None, "中文拼不回原句", "各段中文拼起来与原句不同（丢字或多字）", "重跑 build_reader"))

    TE = len(en_words(en)) or 1
    TZ = zh_len(zh) or 1
    all_en_keys = en_keys(en)
    all_zh_keys = zh_keys(zh)

    # 二 · 跨段锚点顺序必须单调：英文重点词按段出现的顺序 = 中文括注按段出现的顺序
    order_en = [(i, k) for i, c in enumerate(chunks) for k in en_keys(c["en"])]
    order_zh = [(i, k) for i, c in enumerate(chunks) for k in zh_keys(c["zh"])]
    for (ie, ke) in order_en:
        hit = [iz for iz, kz in order_zh if same_key(ke, kz)]
        if hit and hit[0] != ie:
            F.append(("A", ie + 1, "锚点跑到别段", "重点词「%s」在英文第 %d 段，它的中文括注在第 %d 段" % (ke, ie + 1, hit[0] + 1),
                      "这两段的边界切错了，合并或移动边界"))

    for i, c in enumerate(chunks, 1):
        ce, cz = c["en"], c["zh"]
        we, wz = en_words(ce), zh_len(cz)
        if not ce.strip() or not cz.strip():
            F.append(("A", i, "空段", "英文或中文为空", "合并到邻段")); continue

        # 三 · 段内锚点数目对上（英文几个重点词，中文就该几个括注）
        ke, kz = en_keys(ce), zh_keys(cz)
        if len(ke) != len(kz):
            F.append(("A", i, "锚点数不等", "英文 %d 个重点词、中文 %d 个括注" % (len(ke), len(kz)), "边界切错"))
        for k in ke:
            if not any(same_key(k, z) for z in kz):
                F.append(("A", i, "锚点缺失", "英文重点词「%s」的中文括注不在这段里" % k, "边界切错"))

        # 四 · 否定词：单段一边多一边少只提醒——中文常拿「不」译实义词（doubted→不信，wrong→不该），
        #      不能算错。**相邻两段互换**（这段英多中少、下段英少中多）才是语序倒置的指纹，见下面「四之二」。
        ne, nz = len(EN_NEG.findall(BOLD.sub(r"\1", ce))), len(ZH_NEG.findall(GLOSS.sub(r"\1", cz)))
        if ne > nz:
            F.append(("B", i, "否定词英多中少", "英文 %d 个否定词、中文 %d 个" % (ne, nz), "看看否定有没有译丢"))
        elif nz > ne:
            F.append(("C", i, "否定词中多英少", "英文 %d 个否定词、中文 %d 个（多半是「不信／不该」译实义词）" % (ne, nz), "一般无碍"))

        # 五 · 数字两边对上（月份名折成数字；中文允许多出年月日里的序数）
        # ★ 只在**英文有数字**时才要求中文也有：反过来不成立——中文的「第二」「一条」「两处」
        #   是序数和量词，不是英文里的数字（第02篇 §13—15 全被这样误报成 A）。
        a, b = nums_en(ce), nums_zh(cz)
        if a and not b:
            F.append(("A", i, "数字不对", "英文 %s、中文 %s" % (dict(a), dict(b) or "无"), "带数字的那半句归错段了"))
        else:
            missing = [x for x in a if a[x] > b.get(x, 0)]
            if missing:
                F.append(("B", i, "数字不全", "英文里的 %s 在这段中文里找不到" % missing, "核一下年月日的写法"))

        # 六 · 长度占比
        d = abs(wz / TZ - len(we) / TE)
        if d > 0.20:
            F.append(("A", i, "长短悬殊", "英文占 %.0f%%、中文占 %.0f%%" % (100 * len(we) / TE, 100 * wz / TZ), "边界切错"))
        elif d > 0.13:
            F.append(("B", i, "长短偏", "英文占 %.0f%%、中文占 %.0f%%" % (100 * len(we) / TE, 100 * wz / TZ), "看一眼"))

        # 七 · 英文断在半路
        if i < len(chunks):
            tail = we[-1] if we else ""
            nxt = en_words(chunks[i]["en"])[0].lower().strip(",.;:!?") if en_words(chunks[i]["en"]) else ""
            bare = tail.lower().strip(",.;:!?—")
            # ★ 带标点收尾的不算劈开：「To settle which,」是原文自带的完整状语，
            #   中文「为了判定究竟是哪一种，」也正好对上（第03篇 §10 被误报成 A）。
            #   真正被劈开的是「and went house」「the dead drew」这种**后面没有标点**的。
            if bare in EN_BAD_TAIL and not re.search(r"[,;:.!?—]$", tail):
                F.append(("A", i, "英文断在半路", "这段以「%s」收尾，词组被劈开了" % tail, "边界前移或后移"))
            elif not re.search(r"[,;:.!?—]$", tail) and nxt not in OPENERS:
                F.append(("B", i, "英文无标点断开", "「%s | %s」之间没有标点，下一词也不是开头词" % (tail, nxt), "看一眼是否自然"))
        if len(we) < 2:
            F.append(("B", i, "英文段过短", "只有 %d 个词" % len(we), "并入邻段"))

        # 八 · 中文悬尾
        plain = GLOSS.sub(r"\1", cz).rstrip("，。；：、！？— ")
        # ★ 「是…的」「而…的」「得…的」是完整的判断句，不是悬尾（第03篇 §9「而设的」、
        #   §10「就是错的」被误报成 A）。真正的悬尾是「住在附近的」这种光杆定语。
        de_ok = plain.endswith("的") and re.search(r"[是为而得就]", plain[-6:-1] or "")
        if plain and plain[-1] in ZH_BAD_TAIL and i < len(chunks) and not de_ok:
            F.append(("A", i, "中文悬尾", "这段以「%s」收尾，结构没收住" % plain[-1], "边界后移"))
        if wz < 2:
            F.append(("B", i, "中文段过短", "只有 %d 个字" % wz, "并入邻段"))

    # 四之二 · 否定词互换：相邻两段一边英多中少、另一边英少中多 → 语序倒置
    negs = [(len(EN_NEG.findall(BOLD.sub(r"\1", c["en"]))), len(ZH_NEG.findall(GLOSS.sub(r"\1", c["zh"]))))
            for c in chunks]
    for i in range(len(negs) - 1):
        (a1, b1), (a2, b2) = negs[i], negs[i + 1]
        if (a1 > b1 and a2 < b2) or (a1 < b1 and a2 > b2):
            F.append(("A", i + 1, "否定词互换", "第 %d 段与第 %d 段的否定词一边多一边少、正好相反" % (i + 1, i + 2),
                      "语序倒置（英 A, not B ↔ 中 不是B，只是A）——合并这两段"))

    # 九 · 该拆没拆：英文有从句标点、中文有两个以上标点、锚点也不冲突，却只有一段
    if len(chunks) == 1:
        en_p = len(re.findall(r"[,;:]\s", BOLD.sub(r"\1", en)))
        zh_p = len(re.findall(r"[，；：]", GLOSS.sub(r"\1", zh)))
        if en_p >= 1 and zh_p >= 1 and len(en_words(en)) >= 10:
            F.append(("B", None, "可能漏拆", "英文有 %d 处从句标点、中文有 %d 处，却只有一段" % (en_p, zh_p),
                      "看看两边的标点能不能对上；对得上就该拆"))

    # 十 · 语序倒置（段内）：同一段里若有 ≥2 个锚点且英文顺序与中文顺序相反，标记（不算错，但提醒不能再拆）
    for i, c in enumerate(chunks, 1):
        ke, kz = en_keys(c["en"]), zh_keys(c["zh"])
        if len(ke) >= 2 and len(kz) >= 2:
            pos = []
            for k in ke:
                for j, z in enumerate(kz):
                    if same_key(k, z):
                        pos.append(j); break
            if len(pos) == len(ke) and pos == sorted(pos, reverse=True) and len(set(pos)) > 1:
                F.append(("C", i, "段内语序相反", "这段里重点词的中英顺序是反的（%s）" % "、".join(ke), "正常，中文定语前置；但这段不可再拆"))
    return F


# ═══════════ 报告 ═══════════

def audit(aid, write=True, quiet=False):
    path = os.path.join(ROOT, "reader", "a%s.json" % aid)
    d = json.load(open(path, encoding="utf-8"))
    rows, nA, nB, nC = [], 0, 0, 0
    for s in d["sentences"]:
        fs = check_sentence(s)
        for g, ci, rule, why, fix in fs:
            rows.append((s["i"], g, ci, rule, why, fix))
            nA += g == "A"; nB += g == "B"; nC += g == "C"
    total = sum(len(s.get("chunks") or []) for s in d["sentences"])
    verdict = "✗ %d 处 A" % nA if nA else "✓ 零 A"
    line = "对齐检查 · 第%s篇 · %d 句 %d 段 · %s · B×%d · C×%d" % (aid, len(d["sentences"]), total, verdict, nB, nC)
    if write:
        L = ["# 对齐检查 · 第%s篇《%s》" % (aid, d["title"]), "",
             "> `scripts/check_chunks.py` 自动生成。判据与对齐算法**相互独立**；A 必改、B 该看、C 只是提醒。",
             "> 规则逮得住结构性的错；纯语义的配错要 `--llm` 或真人。", "",
             "**%s**" % line, ""]
        if rows:
            L += ["| 句 | 段 | 级 | 判据 | 说明 | 建议 |", "|---|---|---|---|---|---|"]
            for si, g, ci, rule, why, fix in rows:
                L.append("| %d | %s | **%s** | %s | %s | %s |" % (si, ci or "—", g, rule, why.replace("|", "｜"), fix))
        else:
            L.append("十条判据全过。")
        L += ["", "## 每句的意群（供人眼复核）", ""]
        for s in d["sentences"]:
            L.append("**§%d**" % s["i"])
            for c in s.get("chunks") or []:
                L.append("- " + BOLD.sub(r"[\1]", c["en"]))
                L.append("  " + GLOSS.sub(r"[\1]", c["zh"]))
            L.append("")
        out = os.path.join(ROOT, "notes", "对齐检查-%s.md" % aid)
        open(out, "w", encoding="utf-8").write("\n".join(L))
        if not quiet:
            print("已写", os.path.relpath(out, ROOT))
    if not quiet:
        for si, g, ci, rule, why, fix in rows:
            if g != "C":
                print("  %s §%d%s  %s：%s" % (g, si, (" 段%d" % ci) if ci else "", rule, why))
    print(line)
    return nA


# ═══════════ 模型复核（可选）═══════════

def llm_review(aid, repeat=1):
    """五个独立实例各读一遍：只管「每一小段英文与它底下的中文是不是同一个意思」。
    需要 ANTHROPIC_API_KEY；没有就明说，不假装查过。"""
    key = os.environ.get("ANTHROPIC_API_KEY", "")
    if not key:
        print("  （--llm 跳过：这个环境没有 ANTHROPIC_API_KEY。规则层已查完；语义层只有模型或真人能给。）")
        return None
    sys.path.insert(0, os.path.join(ROOT, "scripts"))
    import readers as R
    d = json.load(open(os.path.join(ROOT, "reader", "a%s.json" % aid), encoding="utf-8"))
    sysp = ("你是中英对齐校对员。下面每一句都被切成了若干小段，每段一行英文、紧跟一行中文。"
            "你只回答一个问题：**每一段英文和它底下那行中文，是不是同一个意思、同一个范围？**"
            "不管翻译好坏，不管文风。多了半句、少了半句、错位、语序反了——都报。"
            "只输出 JSON 数组，每项 {\"para\": 句号, \"quote\": \"那段英文\", \"problem\": \"哪里不对\", "
            "\"fix\": \"该怎么切\", \"grade\": \"A|B\"}；全对就输出 []。")
    user = []
    for s in d["sentences"]:
        user.append("§%d" % s["i"])
        for c in s.get("chunks") or []:
            user.append(BOLD.sub(r"\1", c["en"]))
            user.append("  " + GLOSS.sub(r"\1", c["zh"]))
        user.append("")
    text = "\n".join(user)
    found = []
    for k in range(5):
        for _ in range(repeat):
            found += R.parse_findings(R.call(sysp, text, "claude-sonnet-5", key))
    rows = R.merge({str(i): [f for f in found[i::5]] for i in range(5)})
    print("  模型复核：%d 条（%d 处被 ≥2 个实例点到）" % (len(rows), sum(1 for r in rows if len(r["who"]) >= 2)))
    return rows


# ═══════════ 自测：拿已知的坏对齐验检查员 ═══════════

BAD_CASES = [
    ("1854 年 9 月没落在 In September 1854 底下", {
        "en": "In September 1854 a few streets of Soho, in central London, lost 616 people to **cholera** in ten days.",
        "zh": "1854 年 9 月，伦敦市中心苏活区的几条街道，在十天里因**霍乱**(cholera)死了 616 人。",
        "chunks": [{"en": "In September 1854 a few streets of Soho,", "zh": "1854 年 9 月，"},
                   {"en": "in central London,", "zh": "伦敦市中心苏活区的几条街道，"},
                   {"en": "lost 616 people to **cholera** in ten days.", "zh": "在十天里因**霍乱**(cholera)死了 616 人。"}]},
     "长短悬殊"),
    ("lost nobody 该拆没拆", {
        "en": "A **brewery** **beside** the pump lost nobody, since the men were **supplied** with beer.",
        "zh": "紧**挨着**(beside)水泵的一家**酿酒厂**(brewery)一个人也没死，因为工人的**配给**(supplied)是啤酒。",
        "chunks": [{"en": "A **brewery** **beside** the pump lost nobody, since the men were **supplied** with beer.",
                    "zh": "紧**挨着**(beside)水泵的一家**酿酒厂**(brewery)一个人也没死，因为工人的**配给**(supplied)是啤酒。"}]},
     "可能漏拆"),
    ("his advice, not his conclusion 语序反了", {
        "en": "the board **accepted** his advice, not his conclusion.",
        "zh": "委员会**接受**(accepted)的也不是他的结论，只是他的建议；",
        "chunks": [{"en": "the board **accepted** his advice,", "zh": "委员会**接受**(accepted)的也不是他的结论，"},
                   {"en": "not his conclusion.", "zh": "只是他的建议；"}]},
     "否定词互换"),
    ("2 September 归错段", {
        "en": "a **widow** in Hampstead, died on 2 September; she preferred the **taste** of water.",
        "zh": "一位**寡妇**(widow)，她却在 9 月 2 日死了：她偏爱水的**口感**(taste)。",
        "chunks": [{"en": "a **widow** in Hampstead, died on 2 September;", "zh": "一位**寡妇**(widow)，"},
                   {"en": "she preferred the **taste** of water.", "zh": "她却在 9 月 2 日死了：她偏爱水的**口感**(taste)。"}]},
     "数字不对"),
    ("and went house / to house 断在半路", {
        "en": "and went house to house asking where the dead **drew** their **supply**.",
        "zh": "挨家挨户去问：死者平日从哪里**打**(drew)水、用的是哪一处**水源**(supply)。",
        "chunks": [{"en": "and went house to", "zh": "挨家挨户去问："},
                   {"en": "house asking where the dead **drew** their **supply**.", "zh": "死者平日从哪里**打**(drew)水、用的是哪一处**水源**(supply)。"}]},
     "英文断在半路"),
    ("John Snow 底下配了半截「住在」", {
        "en": "John Snow, a **physician** who lived **nearby**, **doubted** it,",
        "zh": "住在**附近**(nearby)的**内科医生**(physician)约翰·斯诺**不信**(doubted)这套说法，",
        "chunks": [{"en": "John Snow,", "zh": "住在"},
                   {"en": "a **physician** who lived **nearby**, **doubted** it,", "zh": "**附近**(nearby)的**内科医生**(physician)约翰·斯诺**不信**(doubted)这套说法，"}]},
     "中文悬尾"),
]


def selftest():
    ok = True
    for name, s, expect in BAD_CASES:
        fs = check_sentence(s)
        rules = {r for _, _, r, _, _ in fs}
        hit = expect in rules
        ok &= hit
        print("  %s  %s  → %s" % ("✓" if hit else "✗", name, "、".join(sorted(rules)) or "（没报）"))
    # 好对齐不该报 A
    good = json.load(open(os.path.join(ROOT, "reader", "a01.json"), encoding="utf-8"))
    nA = sum(1 for s in good["sentences"] for g, *_ in check_sentence(s) if g == "A")
    print("  %s  第01篇现版 A 级 = %d" % ("✓" if nA == 0 else "✗", nA))
    ok &= nA == 0
    print("自测", "全过" if ok else "有漏")
    return ok


def main():
    args = [x for x in sys.argv[1:] if not x.startswith("--")]
    if "--selftest" in sys.argv:
        sys.exit(0 if selftest() else 1)
    aid = (args[0] if args else "01").zfill(2)
    nA = audit(aid, write="--quiet" not in sys.argv, quiet="--quiet" in sys.argv)
    if "--llm" in sys.argv:
        llm_review(aid, repeat=int(sys.argv[sys.argv.index("--repeat") + 1]) if "--repeat" in sys.argv else 1)
    sys.exit(1 if nA else 0)


if __name__ == "__main__":
    main()
