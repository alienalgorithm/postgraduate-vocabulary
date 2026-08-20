#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
单词检察官 v4 · 量化层
=====================
v2/v3（tools/单词检察官*.html）是正则规则引擎，抓的是文字缺陷。
本工具补上它们抓不到的那一半：**结构均衡、重点词价值、论证骨架、跨篇唯一性**。

第02篇的两处硬伤（关键词分布 13·13·3·10·11、§4 局部密度 26.3%、40% 白送词）
v3 一条都报不出来——这就是 v4 存在的理由。

用法
----
    python3 scripts/inspector.py              # 审全库，出排名
    python3 scripts/inspector.py 02           # 只审第02篇，出明细
    python3 scripts/inspector.py --html out.html   # 另出 HTML 报告

依赖：wordfreq（可选。缺失时 VAL-01 自动降级为内置词表）
"""
import json, re, sys, subprocess, glob, os, math
from collections import Counter, defaultdict

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BOLD = re.compile(r"\*\*(.+?)\*\*")
# 拼写出来的数词同样是数字（eight outcomes / three bits），否则 STR-02 误报
SPELLED = r"\b(one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|twenty|thirty|forty|fifty|sixty|seventy|eighty|ninety|hundred|thousand|million|billion|half|twice|dozen)\b"
HAS_NUM = re.compile(r"\d|" + SPELLED, re.I)
ZH_PAIR = re.compile(r"\*\*(.+?)\*\*\(([A-Za-z][A-Za-z'’\-]*)\)")
SENT = re.compile(r"(?<=[.!?])\s+")

# ── 参数 ────────────────────────────────────────────────────────────────
# 词数区间 249—271，且**不得为整十**（250 / 260 / 270 一律禁止）。
#
# 缘由：23 篇里 13 篇卡在 270，占 57%。哪有那么巧的事——
# **读者一眼就看出是机器生成的。** 整十是人工凑数最明显的指纹。
# 270 从来是上限不是目标，而「削到合规就停手」把上限变成了目标。
#
# 密度上限随之由 20.0 放宽至 20.2：50 词在 249 词下密度 20.08%。
# 这是有意的取舍——20.0 是我自己定的数，没有外部依据；
# 而「每篇都是整十」是读者看得见的破绽。0.08 个百分点换掉一个机器指纹，划算。
WORDS_MIN, WORDS_MAX = 249, 271
KEYWORDS_EXACT       = 50
DENSITY_MAX          = 20.2   # 容纳 249 词下的 20.08%
PARA_EXACT           = 5
PARA_DENSITY_HARD    = 24.0      # 单段局部密度硬上限（范文实测最高 21.3%）
PARA_DENSITY_WARN    = 22.0      # 提醒线
PARA_DENSITY_MIN     = 13.0      # 低于此值说明该段在偷懒
KW_SPREAD_MAX        = 2         # 各段关键词数极差上限（理想 0）
PARA_WORDS_MIN       = 40
PARA_WORDS_MAX       = 72
ZIPF_CHEAP           = 5.0       # ≥ 此值＝确定白送（return 5.19 / support 5.53 / deep 5.05）
ZIPF_SOFT            = 4.6       # 4.6—5.0 为边缘词，只计数不判硬伤
CHEAP_MAX            = 6         # 确定白送词的容忍上限
SOFT_MAX             = 18        # 白送+边缘的容忍上限

# wordfreq 缺失时的兜底词表（本次审计中实测出的高频基础词）
FALLBACK_CHEAP = set("""
deep camera rise temperature return photograph floor shell crack surrounding roughly
contain sample chemical chain support species discovery flow primary energy water air
light dark heat cold large small long short high low fast slow good bad new old
time year day part place thing work make take give find know think come see look
use want need feel become leave put mean keep let begin seem help talk turn start
show hear play run move like live believe hold bring happen write provide sit stand
lose pay meet include continue set learn change lead understand watch follow stop
create speak read allow add spend grow open walk win offer remember love consider
appear buy wait serve die send expect build stay fall cut reach kill remain
""".split())

try:
    from wordfreq import zipf_frequency
    HAVE_WF = True
except Exception:
    HAVE_WF = False

# 铁律映射：规则 ID → 《最终版本铁律》条款。检察官报告时引用它执行的是哪一条。
try:
    _CM = json.load(open(os.path.join(ROOT, "data/reference/charter-map.json"),
                         encoding="utf-8"))["clauses"]
    CHARTER = {r: (k, v["title"]) for k, v in _CM.items() for r in v.get("rules", [])}
except Exception:
    _CM, CHARTER = {}, {}


def charter_of(rid):
    """返回该规则执行的铁律条款，形如 ('第零条之三·二', '不许为凑满50个而硬塞重点词')。"""
    return CHARTER.get(rid)


# spaCy 句法解析：把「抽象主语」「被动语态」「句长节奏」从正则猜测升级为真读句子
try:
    import spacy
    NLP = spacy.load("en_core_web_sm")
except Exception:
    NLP = None

# 写作规范 §3.3 所指的抽象主语
ABSTRACT_SUBJ = {
    "discovery", "insight", "analysis", "approach", "method", "result", "finding",
    "idea", "concept", "process", "development", "conclusion", "explanation",
    "work", "theory", "system", "relation", "scale", "framework", "narrative",
}
# ── 阈值来自真实语料，不是拍脑袋 ────────────────────────────────────
# data/reference/prose-profile.json：NLTK Brown 语料 learned + belles_lettres
# + editorial 三类（说理散文 41.7 万词）的实测档案。
# 关键修正：该语料的被动率是 22.4%，而我先前把上限定在 15%——比母语标准还严。
try:
    PROSE = json.load(open(os.path.join(ROOT, "data/reference/prose-profile.json"),
                           encoding="utf-8"))
except Exception:
    PROSE = {"passive_pct": 22.4, "sent_len_mean": 21.2, "sent_len_stdev": 12.0,
             "long_sent_pct": 12.9}

PASSIVE_MAX = PROSE["passive_pct"] + 5      # 27.4%：高于母语说理散文才算过量
STDEV_MIN = 4.5         # 句长标准差下限（270词上限下无法达到语料的 12.0）
REPEAT_MAX = 0.35       # 邻句实词重复均值上限
LONG_SENT = 40          # 单句词数上限（语料 12.9% 的句子超过 34 词，34 定得过严）
RHYTHM_MIN = 5.5        # 本体裁可达到的节奏下限

def cheapness(word):
    """返回 (等级, zipf)。等级: 'cheap' 确定白送 / 'soft' 边缘 / None 合格"""
    w = re.sub(r"[^a-zA-Z]", "", word).lower()
    if not w:
        return None, None
    if HAVE_WF:
        z = round(zipf_frequency(w, "en"), 2)
        if z >= ZIPF_CHEAP: return "cheap", z
        if z >= ZIPF_SOFT:  return "soft", z
        return None, z
    return ("cheap", None) if w in FALLBACK_CHEAP else (None, None)

# ── 载入 ────────────────────────────────────────────────────────────────
def load_articles():
    files = ["data/articles.js"] + sorted(glob.glob(os.path.join(ROOT, "data", "article-*.js")))
    files = [f if os.path.isabs(f) else os.path.join(ROOT, f) for f in files]
    js = "globalThis.window=globalThis;" + "".join(
        "require(%s);" % json.dumps(f) for f in files
    ) + "process.stdout.write(JSON.stringify(globalThis.SITE.ARTICLES))"
    out = subprocess.run(["node", "-e", js], capture_output=True, text=True)
    if out.returncode != 0:
        sys.exit("无法载入数据层：\n" + out.stderr)
    arts = json.loads(out.stdout)
    return sorted(arts, key=lambda a: str(a["id"]))

def norm(s):
    return re.sub(r"[^a-z]", "", str(s).lower())

from core import count_words, plain, sentences, content_words   # 唯一权威实现，见 core.py

# ── 单条发现 ────────────────────────────────────────────────────────────
class Finding:
    __slots__ = ("rid", "layer", "sev", "title", "detail", "fix")
    def __init__(self, rid, layer, sev, title, detail, fix=""):
        self.rid, self.layer, self.sev = rid, layer, sev
        self.title, self.detail, self.fix = title, detail, fix

WEIGHT = {"hard": 8, "check": 3, "info": 0}

# ── 规则 ────────────────────────────────────────────────────────────────
STOP_EN = set('''the a an and or of to in on at for from by as that this these those it its
their they was were is are be been had have has do does did will would could should may
might must can not but with without into onto over under about after before during through
between among across against out up down off again more most much many some any all each
every both few other another such same own very just also only even still yet there here
one two three four five six seven eight nine ten first second third what when where which
who while than then how why never ever always'''.split())


def inspect(a, archive):
    F = []
    paras   = a.get("paras", [])
    gloss   = a.get("glossary", [])
    metrics = a.get("metrics", {})

    pw   = [count_words(p["en"]) for p in paras]
    pk   = [BOLD.findall(p["en"]) for p in paras]
    pkn  = [len(x) for x in pk]
    total_w, total_k = sum(pw), sum(pkn)
    dens = round(total_k / total_w * 100, 1) if total_w else 0
    allk = [w for grp in pk for w in grp]

    # ── 第一层 MET · 硬指标 ──────────────────────────────────────────
    if not (WORDS_MIN <= total_w <= WORDS_MAX):
        F.append(Finding("MET-01", "指标", "hard", "词数越界",
            f"实测 {total_w} 词，规定 {WORDS_MIN}—{WORDS_MAX}", "压缩同义复述，勿删论证骨架"))
    if total_k != KEYWORDS_EXACT:
        F.append(Finding("MET-02", "指标", "hard", "重点词数不等于50", f"实测 {total_k} 个"))
    # 词数落在哪里由减法轮决定，**不设「不许整十」这类规则**。
    # 曾把「整十=硬伤」定为规则，随即为脱离整十而逐篇削一个词——
    # 例如 The inquest of 1628 → The 1628 inquest，不是因为原句冗余，
    # 而是因为要减掉一个词。那仍是凑数，只不过从「凑到270」换成了「凑到不是270」。
    # 真正要防的是「贴着上限停手」，那由减法轮解决：
    # 逐词问「删掉它读者会不会觉得少了东西」，削到自己该落的地方为止。
    if dens > DENSITY_MAX:
        F.append(Finding("MET-03", "指标", "hard", "整体密度超限", f"{dens}% > {DENSITY_MAX}%"))
    if metrics.get("words") != total_w or metrics.get("keywords") != total_k \
       or abs(metrics.get("density", 0) - dens) > 0.05:
        F.append(Finding("MET-04", "指标", "hard", "metrics 与实测不符",
            f"实测 {total_w}/{total_k}/{dens}%，metrics 为 "
            f"{metrics.get('words')}/{metrics.get('keywords')}/{metrics.get('density')}%"))
    if len(paras) != PARA_EXACT:
        F.append(Finding("MET-05", "指标", "hard", "段落数不等于5", f"实测 {len(paras)} 段"))
    if len(gloss) != KEYWORDS_EXACT:
        F.append(Finding("MET-06", "指标", "hard", "速查表条数不等于50", f"实测 {len(gloss)} 条"))
    for i, p in enumerate(paras, 1):
        en_c = Counter(norm(x) for x in BOLD.findall(p["en"]))
        zh_c = Counter(norm(m.group(2)) for m in ZH_PAIR.finditer(p["zh"]))
        miss = en_c - zh_c
        extra = zh_c - en_c
        if miss:
            F.append(Finding("MET-07", "指标", "hard", f"§{i} 中文缺对应",
                "、".join(sorted(miss)), "中文加粗后须紧跟 (english) 括注"))
        if extra:
            F.append(Finding("MET-08", "指标", "hard", f"§{i} 中文多出对应", "、".join(sorted(extra))))

    # ── 第二层 BAL · 分布与均衡（v3 完全没有的一层）───────────────────
    if pkn:
        spread = max(pkn) - min(pkn)
        if spread > KW_SPREAD_MAX:
            F.append(Finding("BAL-01", "均衡", "hard", "各段重点词数极差过大",
                f"分布 {'·'.join(map(str, pkn))}，极差 {spread}（上限 {KW_SPREAD_MAX}，理想 0）",
                "把重点词摊平到每段10个；密集段外移，稀疏段补实词"))
    for i, (w, k) in enumerate(zip(pw, pkn), 1):
        d = k / w * 100 if w else 0
        if d > PARA_DENSITY_HARD:
            F.append(Finding("BAL-02", "均衡", "check", f"§{i} 局部密度偏高",
                f"{w}词塞 {k} 个重点词 = {d:.1f}%（硬上限 {PARA_DENSITY_HARD}%）",
                "该段读不动了：外移重点词或加实句"))
        elif d > PARA_DENSITY_WARN:
            F.append(Finding("BAL-02b", "均衡", "check", f"§{i} 局部密度偏高", f"{d:.1f}%"))
        elif d < PARA_DENSITY_MIN:
            F.append(Finding("BAL-03", "均衡", "check", f"§{i} 局部密度过低",
                f"{w}词只有 {k} 个重点词 = {d:.1f}%", "该段在偷懒：它承担的论证不足以配得上篇幅"))
        if w < PARA_WORDS_MIN:
            F.append(Finding("BAL-04", "均衡", "check", f"§{i} 是残段", f"仅 {w} 词",
                "合并进相邻段，或补足它该承担的论证"))
        elif w > PARA_WORDS_MAX:
            F.append(Finding("BAL-05", "均衡", "check", f"§{i} 过长", f"{w} 词",
                "一段只做一件事；拆分或压缩"))
    if pw and (max(pw) - min(pw)) > 25:
        F.append(Finding("BAL-06", "均衡", "check", "段落长短悬殊",
            f"{'/'.join(map(str, pw))}，极差 {max(pw)-min(pw)}"))

    # ── 第三层 VAL · 重点词价值（v3 完全没有的一层）───────────────────
    cheap, soft = [], []
    for w in allk:
        lv, z = cheapness(w)
        if lv == "cheap": cheap.append((w, z))
        elif lv == "soft": soft.append((w, z))
    fmt = lambda L: "、".join(f"{w}({z})" if z else w for w, z in L)
    if len(cheap) > CHEAP_MAX:
        F.append(Finding("VAL-01", "词价", "hard", "白送词占用名额过多",
            f"{len(cheap)}/{total_k} 个 Zipf≥{ZIPF_CHEAP} 的超高频基础词：{fmt(cheap)}",
            "考研生早已掌握这些词，占名额＝浪费教学预算；换成承重实词"))
    elif cheap:
        F.append(Finding("VAL-02", "词价", "check", "含白送词", fmt(cheap),
        "**处置：取消它的加粗，把名额让给同段另一个词——不要为避开它而改动英文。**\n"
        "        自然的说法留在正文，只是不占名额。本项目曾为避开 Zipf 把\n"
        "        blood groups 改成 blood antigens、kitchen hand 改成 scullery worker、\n"
        "        for nothing 改成 idly，三处都损伤了英文，两处还伤了史实准确度。"))
    if len(cheap) + len(soft) > SOFT_MAX:
        F.append(Finding("VAL-02b", "词价", "check", "低价值词偏多",
            f"确定白送 {len(cheap)} + 边缘 {len(soft)} = {len(cheap)+len(soft)}/{total_k}",
            f"边缘词：{fmt(soft)}"))

    for i, p in enumerate(paras, 1):
        for m in re.finditer(r"\*\*([^*]+)\*\*\s+\*\*([^*]+)\*\*", p["en"]):
            F.append(Finding("VAL-03", "词价", "info", f"§{i} 相邻加粗",
                f"**{m.group(1)}** **{m.group(2)}**",
                "确认不是一个词条被拆成两个名额（如 tube worm / food chain）"))
        plain = p["en"]
        for m in BOLD.finditer(plain):
            w = m.group(1)
            if not w[:1].isupper():
                continue
            before = plain[:m.start()].replace("**", "").rstrip()
            if not before or before.endswith((".", "!", "?", ":", ";")):
                continue          # 句首大写，正常
            last = before.split()[-1] if before.split() else ""
            if last[:1].isupper():
                F.append(Finding("VAL-04", "词价", "hard", f"§{i} 专名内部加粗",
                    f"{last} **{w}**", "专名的一部分不构成一个可学的词；取消加粗，名额另用"))

    ns = [norm(x) for x in allk]
    dup = [x for x, c in Counter(ns).items() if c > 1]
    if dup:
        F.append(Finding("VAL-05", "词价", "hard", "篇内重点词重复", "、".join(dup)))
    gl = [norm(g["w"]) for g in gloss]
    gdup = [x for x, c in Counter(gl).items() if c > 1]
    if gdup:
        F.append(Finding("VAL-06", "词价", "hard", "速查表词元重复", "、".join(gdup)))

    o_lem, o_srf = set(), set()
    for x in archive:
        if x["id"] == a["id"]:
            continue
        for g in x.get("glossary", []):
            o_lem.add(norm(g["w"]))
        for p in x.get("paras", []):
            for m in BOLD.findall(p["en"]):
                o_srf.add(norm(m))
    hit_l = sorted({norm(g["w"]) for g in gloss} & o_lem)
    hit_s = sorted(set(ns) & o_srf)
    if hit_l:
        F.append(Finding("VAL-07", "词价", "hard", "词元与其他篇重复", "、".join(hit_l)))
    if hit_s:
        F.append(Finding("VAL-08", "词价", "hard", "加粗表面形式与其他篇重复", "、".join(hit_s)))

    # ── 第四层 STR · 论证骨架 ────────────────────────────────────────
    body = " ".join(p["en"].replace("**", "") for p in paras)
    # 句首的人名不该被漏掉（Joseph Henry's discovery…），但要排除 In September / The Board 这类
    LEAD = r"(?:In|On|At|By|The|A|An|After|Before|During|When|While|From|For|To|With|It|He|She|They|" \
           r"This|That|Both|Each|Every|Later|Today|Now|Then|Its|His|Her|Their|Only|No|Not|Yet|But|And|Of)"
    names = [m for m in re.findall(
        r"\b([A-Z][a-z]+\s+(?:van\s+|de\s+|von\s+|der\s+)?[A-Z][a-z]+)\b", body)
        if not re.match(LEAD + r"\s", m)]
    if not names:
        F.append(Finding("STR-01", "骨架", "check", "全篇无人名",
            "写作规范 §3.3：主语用人或具体物",
            "把动作还给具体的人：谁做了什么、预期什么、被什么推翻"))

    for i, p in enumerate(paras, 1):
        if i == len(paras):
            continue                      # 末段是升华段，不强求数字
        if not HAS_NUM.search(p["en"]):
            F.append(Finding("STR-02", "骨架", "check", f"§{i} 无任何数字",
                "写作规范 §3.2：给数字，不给形容词"))

    if paras:
        last = [s for s in SENT.split(paras[-1]["en"].replace("**", "")) if s.strip()]
        if len(last) >= 2:
            a2, a1 = last[-2], last[-1]
            # 具名实体（Nobel / Oppau / Smithsonian…）或数词都说明这是事实句，不是格言
            PROPER = re.compile(r"(?<![.!?]\s)(?<!^)\b[A-Z][a-z]{2,}")
            def aphoristic(s):
                if HAS_NUM.search(s) or PROPER.search(s.strip()):
                    return False
                return count_words(s) <= 18
            if aphoristic(a2) and aphoristic(a1):
                F.append(Finding("STR-03", "骨架", "check", "结尾两句格言相邻",
                    f"…{a2} / {a1}", "两条箴言互相削弱；中间垫一句具体事实，或只留一条"))

    premise_re = re.compile(r"\b(expect(?:ed|ing)?|assum(?:ed|ing)|thought|believed|had been|used to|before \d{4})\b", re.I)
    # instead/but 也常用于纯粹的对照描述（"squeezed her upward instead of inward"），
    # 不构成需要前提的『异常』。只认真正标示反常的措辞。
    anomaly_re = re.compile(r"\b(nobody|no one|impossible|astonish\w*|no visible|"
                            r"could not explain|should not have|puzzl\w*|unexpected)\b", re.I)
    p_idx = [i for i, p in enumerate(paras, 1) if premise_re.search(p["en"])]
    a_idx = [i for i, p in enumerate(paras, 1) if anomaly_re.search(p["en"])]
    if p_idx and a_idx and min(p_idx) > min(a_idx) + 1:
        F.append(Finding("STR-04", "骨架", "check", "前提晚于它所解释的异常",
            f"异常最早出现在 §{min(a_idx)}，前提却迟至 §{min(p_idx)}",
            "读者先被要求震惊，之后才拿到该震惊的理由；把前提移到与目击并置"))

    for i, p in enumerate(paras, 1):
        for s in SENT.split(p["en"].replace("**", "")):
            s = s.strip()
            m = re.match(r"^(It|That|This|They)\s+\w+", s)
            if m and not re.search(r"\b(is|was|were|are)\b\s+(a|an|the)\b", s[:40]):
                F.append(Finding("STR-05", "骨架", "info", f"§{i} 代词开头需核指代",
                    s[:70] + ("…" if len(s) > 70 else ""),
                    "确认 it/that/this 有唯一且具体的先行词"))

    # ── 判断提示（机器判不了，只提示人工复核；权重 0，不计分）────────
    body_ps = [p["en"].replace("**", "") for p in paras]
    PIVOT = re.compile(r"\b(instead|yet|but|however|rather than|nobody|no one|never)\b", re.I)
    if not PIVOT.search(" ".join(body_ps[1:-1] or body_ps)):
        F.append(Finding("JDG-01", "提示", "info", "中段没有任何转折词",
            "instead / yet / but / however / rather than 一个都没有",
            "确认这篇是在论证，而不是在编年；无反转的叙述读完不会有豁然开朗感"))
    ABS = re.compile(r"(?:^|\.\s+)(The\s+(?:discovery|insight|analysis|approach|method|result|finding|"
                     r"idea|concept|process|development|conclusion|explanation))\b", re.I)
    for m in ABS.finditer(" ".join(body_ps)):
        F.append(Finding("JDG-02", "提示", "info", "抽象名词作主语",
            m.group(1), "写作规范 §3.3：主语用人或具体物；中文会跟着别扭"))
    EVAL = re.compile(r"\b(remarkably|astonishingly|importantly|crucially|famously|notably|"
                      r"of course|clearly|obviously|undoubtedly)\b", re.I)
    for i, t in enumerate(body_ps[:-1], 1):
        for m in EVAL.finditer(t):
            F.append(Finding("JDG-03", "提示", "info", f"§{i} 正文出现评论性副词",
                m.group(0), "点评留给末段；正文只让事实推进"))

    # ── 第五层 GLO · 速查表完整性（2026-08-16 加：本会话发现的两处静默损坏）──
    CJK = re.compile(r"[\u4e00-\u9fff]")
    surf = [(w, k) for k, pa in enumerate(paras, 1) for w in BOLD.findall(pa["en"])]
    for g in gloss:
        if not CJK.search(str(g.get("zh", ""))):
            F.append(Finding("GLO-01", "速查表", "hard", "释义不是中文",
                f"{g['w']} → {g.get('zh')}",
                "重建速查表时 fallback 写入了英文原词；fallback 绝不能写源语言内容，"
                "那会把『缺失』伪装成『已完成』并静默通过全部校验"))
    if len(gloss) == len(surf):
        for g, (w, pi) in zip(gloss, surf):
            if g.get("p") != pi:
                F.append(Finding("GLO-02", "速查表", "hard", "条目与正文段落错位",
                    f"{g['w']} 标为 §{g.get('p')}，实际出现在 §{pi}"))
                break
            gw, lw = norm(g["w"]), norm(w)
            # 不规则动词：词元与表面形式可以完全不同（draw/drew、sink/sunk、strike/struck）
            IRREG = {("draw","drew"),("sink","sunk"),("strike","struck"),("breed","bred"),
                     ("break","broken"),("sweep","swept"),("write","wrote"),("handwrite","handwrote"),
                     ("drink","drank"),("hide","hid"),("lie","lying"),("go","gone"),
                     ("seize","seized"),("bear","bore"),("hold","held"),("run","ran"),
                     # 2026-08-16 第22篇补：lay/laid、lie/lain 是英语最易混的一对不规则动词
                     ("lay","laid"),("lie","lain"),("lie","lay"),("find","found"),
                     # -y → -ied 的常规变化，词干器会切成 buri/bury 两形
                     ("bury","buried"),("carry","carried"),("study","studied"),
                     ("apply","applied"),("try","tried"),("rely","relied"),
                     ("feed","fed"),("hear","heard"),("keep","kept"),("leave","left"),
                     ("lose","lost"),("mean","meant"),("meet","met"),("pay","paid"),
                     ("sell","sold"),("send","sent"),("teach","taught"),("tell","told"),
                     ("think","thought"),("catch","caught"),("buy","bought"),("bring","brought")}
            def stem3(x):
                for suf in ("ations","ation","ings","ing","ied","ies","ed","es","s","e"):
                    if x.endswith(suf) and len(x) - len(suf) >= 3: return x[:-len(suf)]
                return x
            same = (lw.startswith(gw[:4]) or gw.startswith(lw[:4])
                    or stem3(gw) == stem3(lw)
                    or (gw, lw) in IRREG or (lw, gw) in IRREG)
            if not same:
                F.append(Finding("GLO-02", "速查表", "hard", "条目与正文加粗对不上",
                    f"第{surf.index((w,pi))+1}条 速查表『{g['w']}』 ≠ 正文『{w}』",
                    "中英语序天然不同（a **physician** who lived **nearby** ↔ 住在**附近**的**内科医生**），"
                    "配对必须用括注里的英文词作显式键，不能按位置"))
                break
    INFLECT = ("ing", "ed", "es", "s")
    for g in gloss:
        w = g["w"]
        base = w[:-3] if w.endswith("ing") else (w[:-2] if w.endswith("ed") else w[:-1])
        if (any(w.endswith(x) for x in INFLECT) and len(w) > 5
                and any(g2["w"] == base or g2["w"] == base + "e" for a2 in archive
                        for g2 in a2.get("glossary", []))):
            F.append(Finding("GLO-03", "速查表", "info", "词元疑似非原形", w,
                "速查表应给词典原形，便于背记"))

    # ── 第六层 ZH · 中文可读性 ────────────────────────────────────────
    ZH_OK = set("氢氯氮碳钢铂酸熵氨键阀缸轴极钾硫铀核云氧铅冰雪海岸船网帧年米度秒吨剂针管壁衬"
                "柱片弧尺缘半段斑病省链轮货毒界位谱仪电零钟脑肺肝肾")
    PAIR = re.compile(r"\*\*([^*]+)\*\*\(([A-Za-z][A-Za-z'’\-]*)\)")
    for i, p in enumerate(paras, 1):
        zs = list(PAIR.finditer(p["zh"]))
        for m in zs:
            z = m.group(1)
            if len(z) == 1 and z not in ZH_OK:
                F.append(Finding("ZH-01", "中文", "info", f"§{i} 单字加粗需确认",
                    f"**{z}**({m.group(2)})　…{p['zh'][max(0,m.start()-10):m.end()+8]}…",
                    "为对上英文词而挤出的单字，在中文里未必立得住"))
        for m1, m2 in zip(zs, zs[1:]):
            if m2.start() - m1.end() <= 1 and len(m1.group(1)) == 1 and len(m2.group(1)) == 1:
                F.append(Finding("ZH-02", "中文", "check", f"§{i} 一个中文词疑被拆成两个名额",
                    f"**{m1.group(1)}**({m1.group(2)})**{m2.group(1)}**({m2.group(2)})"
                    f" → 「{m1.group(1)}{m2.group(1)}」",
                    "如「追授」被拆成 posthumously+awarded、「骤跌」被拆成 sudden+slump；"
                    "改英文用词，让一个中文词只对一个英文词"))

    # ── 第七层 FACT · 数字必须有出处（2026-08-16 加）───────────────────
    # 正文改过几百次，数字最易随改动飘走而无人察觉。
    NUMRE = re.compile(r"\d[\d,.]*")
    def numset(t):
        out = set()
        for m in NUMRE.finditer(t.replace("**", "")):
            v = m.group(0).rstrip(".").replace(",", "")
            if not v:
                continue
            out.add(v)
            if "." in v:                      # 39.2 → 也认 39
                out.add(v.split(".")[0])
        return out
    facts_txt = " ".join(a.get("facts") or [])
    if not facts_txt:
        F.append(Finding("FACT-00", "史实", "hard", "无史实核对", "facts 为空",
                         "每条可核查的事实都须给出处，否则无法复核"))
    else:
        fn = numset(facts_txt)
        body_txt = " ".join(p["en"] for p in paras)
        for v in sorted(numset(body_txt)):
            if v in ("1", "2", "3", "4", "5") or len(v) < 2:
                continue
            if v in fn:
                continue
            # 容许千分位与区间写法：320000↔320,000、1886–87 的 87
            if any(v == f or v in f for f in fn):
                continue
            # 中文核对里常写作 10⁻⁵ / 3.2×10⁵ / 32万 等科学或中式计数
            SCI = {"320000": ("3.2×10⁵", "32万"), "100000": ("10⁻⁵", "十万分之一")}
            if v in SCI and any(x in facts_txt for x in SCI[v]):
                continue
            F.append(Finding("FACT-01", "史实", "check", "正文数字在核对中查无出处", v,
                             "补进 facts 并附来源；数字是这套文章最容易在改写中飘走的东西"))

    # ── 第八层 SYN · 句法（spaCy 真解析，2026-08-16 加）─────────────────
    if NLP is not None:
        import statistics as _st
        STOPL = set("the a an and or of to in on at for from by as that this it its their "
                    "they he she we you not but was were is are be been had have has do "
                    "does did will would could should may might must can".split())
        lens, npass, nsent, absubj, rep, pairs, longs = [], 0, 0, [], 0, 0, []
        for i, p in enumerate(paras, 1):
            doc = NLP(p["en"].replace("**", ""))
            prev = None
            for sent in doc.sents:
                n = sum(1 for t in sent if not t.is_punct)
                if n < 3:
                    continue
                lens.append(n); nsent += 1
                if n > LONG_SENT:
                    longs.append((i, n, sent.text.strip()[:70]))
                # 带 by 施事的被动是有意为之（The circular was **signed** by Pickering
                # ——要突出署名者不是她），不计入过量
                if any(t.dep_ in ("nsubjpass", "auxpass") for t in sent) and not any(
                        t.dep_ == "agent" for t in sent):
                    npass += 1
                for t in sent:
                    if t.dep_ == "nsubj" and t.lemma_.lower() in ABSTRACT_SUBJ:
                        absubj.append((i, t.text, sent.text.strip()[:70]))
                cur = {t.lemma_.lower() for t in sent
                       if t.pos_ in ("NOUN", "VERB") and t.lemma_.lower() not in STOPL}
                if prev is not None:
                    pairs += 1; rep += len(prev & cur)
                prev = cur
        if nsent:
            pr = npass / nsent * 100
            if pr > PASSIVE_MAX:
                F.append(Finding("SYN-01", "句法", "check", "被动语态偏多",
                    f"{npass}/{nsent} 句 = {pr:.0f}%（上限 {PASSIVE_MAX}%，范文多在 0—11%）",
                    "写作规范 §3.3：主语用人或具体物；被动句把施事藏起来了"))
            sd = _st.pstdev(lens) if len(lens) > 1 else 0
            mn = _st.mean(lens)
            if sd < RHYTHM_MIN:
                F.append(Finding("SYN-02", "句法", "check", "句长节奏偏平",
                    f"均长 {mn:.1f} 差 {sd:.1f}　参照：优秀说理散文 均长 "
                    f"{PROSE['sent_len_mean']} 差 {PROSE['sent_len_stdev']}",
                    "长短句交替才有呼吸。本体裁受 270 词与 50 重点词双重约束，"
                    "达不到语料的 12.0，但差值低于 5.5 会读成一句一句往外蹦"))
        for i, n, t in longs:
            F.append(Finding("SYN-03", "句法", "check", f"§{i} 单句过长",
                f"{n} 词：{t}…", "一句只装一个意思"))
        for i, w, t in absubj:
            F.append(Finding("SYN-04", "句法", "check", f"§{i} 抽象名词作主语",
                f"{w} —— {t}…", "写作规范 §3.3：把动作还给具体的人或物"))
        if pairs and rep / pairs > REPEAT_MAX:
            F.append(Finding("SYN-05", "句法", "info", "邻句实词重复偏多",
                f"每对相邻句平均重复 {rep/pairs:.2f} 个实词（上限 {REPEAT_MAX}）",
                "接力靠的是推进，不是复述同一个名词"))
    # ── 第十层 REG · 质量回归（2026-08-16 加）───────────────────────────
    # 前九层查「当前状态合不合规」，本层查「这次改动有没有把东西弄坏」。
    # 二者不是同一件事：本项目六起真实事故全部通过了前九层——
    #   为省词删掉 question → 标题 Only That Question Had a Number 失去落点
    #   消无施事被动 → 造出 The harbour had shown the fault（码头不会「演示」毛病）
    #   避词冲突改用 planking → 人在甲板上跑，不在「铺板」上跑
    #   压词数把 at the Vasa Museum 缩成 there → 先行词全篇消失
    #   为消「结尾格言相邻」在五篇末段硬插无关事实 → 五处全成新毛病
    # 只在该篇存在快照时启用：scripts/regress.py <篇号> snapshot
    try:
        import regress as _R
        _snap = os.path.join(ROOT, "notes/.regress", f"{a['id']}.json")
        if os.path.exists(_snap):
            _old = json.load(open(_snap, encoding="utf-8"))
            for _rid, _t, _d, _why in _R.check(a["id"], _old, _R.profile(a)):
                F.append(Finding(_rid, "回归", "check", _t, _d, _why))
    except Exception:
        pass
    # ── 第十一层 ANCHOR · 标题与导语的落点（2026-08-16 加）─────────────
    # REG-01/02 只在「改动前后对比」时才报；但一篇从没改过的文章，
    # 标题里的词也可能从来就没在正文出现过。这里做绝对检查。
    body_l = " ".join(p["en"] for p in paras).replace("**", "").lower()
    title_words = {w.lower() for w in re.findall(r"[A-Za-z]{4,}", a.get("title", ""))} - STOP_EN
    def stem_t(x):
        for suf in ("ations", "ation", "ings", "ing", "ies", "ied", "ed", "es", "s", "e"):
            if x.endswith(suf) and len(x) - len(suf) >= 4:
                return x[: -len(suf)]
        return x
    body_stems = {stem_t(w) for w in re.findall(r"[a-z]{3,}", body_l)}
    # 屈折形式不算缺（changed↔change、patches↔patch、arrived↔arrive、descending↔descent）
    # 前四字母相同也算落地（descending↔descent、broken↔break 由 IRREG 另表兜）
    TITLE_IRREG = {"broken": "break", "left": "leave", "trapped": "trap",
                   "returned": "return", "twice": "two", "ruler": "rule"}
    body_pre4 = {w[:4] for w in re.findall(r"[a-z]{4,}", body_l)}
    def landed(w):
        if stem_t(w) in body_stems or w[:4] in body_pre4:
            return True
        alt = TITLE_IRREG.get(w)
        return bool(alt and (stem_t(alt) in body_stems or alt[:4] in body_pre4))
    lost = sorted(w for w in title_words if not landed(w))
    for w in lost:
        F.append(Finding("ANC-01", "锚点", "info", "标题里的词正文没有原形", w,
            "**须人工判定，不是硬伤。** 标题用同义或隐喻是正常的——"
            "第02篇 sunlight 落在末句的 never needed sun，第14篇 trapped 落在 gripped。\n"
            "        真正要防的是「改动把落点删掉了」：第22篇为省词删掉末句的 question，"
            "而标题正是 Only That Question Had a Number。那一类由 REG-01 差分捕捉。"))
    sf = a.get("standfirst", "")
    if sf:
        body_nums = numset(" ".join(p["en"] for p in paras))
        for m in re.finditer(r"\d[\d,.]*", sf):
            v = m.group(0).rstrip(".").replace(",", "")
            if len(v) >= 2 and v not in body_nums:
                F.append(Finding("ANC-02", "锚点", "check", "导语的数字正文没有", v,
                    "导语不能承诺正文没有的东西"))
    # ── 第十二层 SRC · 事实的来源（2026-08-16 加）─────────────────────
    # FACT-01 只查「正文的数字在 facts 里有没有出处」——而 facts 是我自己写的，
    # 我写错了它就跟着错。第05篇末句「史密森学会留着那张包装纸」是错的
    # （史密森未收藏那包口香糖，展出过的是复制品，馆藏的是最初十台扫描仪之一），
    # 十一层规则、十二轮精修、六条审计全没抓到——**因为没有一层在查「这是不是真的」**。
    # 本层不判断真假（机器判不了），只查「这条到底核过没有」：
    # 带得出可点开的来源链接，才算核过。
    facts_list = a.get("facts") or []
    if facts_list:
        nolink = [i for i, c in enumerate(facts_list, 1) if "http" not in c]
        if nolink:
            F.append(Finding("SRC-01", "来源", "info",
                f"{len(nolink)}/{len(facts_list)} 条史实无来源链接",
                "第 " + "、".join(str(i) for i in nolink) + " 条",
                "**本层不判真假，只逼出「这条核过没有」。** 带得出可点开的链接才算核过。\n"
                "        第05篇实证：末句 The Smithsonian keeps the wrapper 是错的——"
                "史密森未收藏那包口香糖，展出过的是复制品，馆藏的是最初十台扫描仪之一。\n"
                "        那条 facts 当时没有链接。**没链接的那条，就是没核过的那条。**"))
        # 关键事实（含数字或专名的那几条）尤其不能缺链接
        keyless = [i for i, c in enumerate(facts_list, 1)
                   if "http" not in c and (re.search(r"\d{3,}", c) or re.search(r"[A-Z][a-z]{3,}", c))]
        if keyless:
            F.append(Finding("SRC-02", "来源", "check",
                f"{len(keyless)} 条含数字或专名的史实无来源",
                "第 " + "、".join(str(i) for i in keyless) + " 条",
                "含具体数字或人名地名的断言最容易记错，也最该给出处"))
    # ── 第十三层 FIT · 重点词是不是硬塞的（2026-08-16 加）─────────────
    # 铁律第零条之三：重点词是从写好的文章里挑出来的，不是往文章里塞进去的。
    # 本层查三种「硬塞」的形迹——它们都不是绝对错误，须逐条人工判定。
    for i, p in enumerate(paras, 1):
        plain_en = p["en"].replace("**", "")
        bolds = BOLD.findall(p["en"])
        # ① 同位语／插入语里连着两个加粗：多半是为凑名额而加的补充成分
        for m in re.finditer(r"[,—-]\s*(?:a|an|the)?\s*\*\*[^*]+\*\*\s+\*\*[^*]+\*\*", p["en"]):
            F.append(Finding("FIT-01", "选词", "info", f"§{i} 插入成分里连着两个加粗",
                m.group(0).strip()[:56],
                "同位语与插入语最容易被用来塞词。确认这个成分是论证需要的，"
                "而非为凑满 10 个而加"))
        # ② 一句话里加粗超过 4 个：句子可能被词撑变形
        # 按密度判，不按个数判：长句里有五六个加粗是本体裁常态
        # （50 词分在 16—19 句里，均值本就约 3 个）。
        # 真正的形迹是**短句里塞了太多**——那种句子多半已被词撑得变形。
        for sent in re.split(r"(?<=[.!?])\s+", p["en"]):
            nb = len(BOLD.findall(sent))
            nw = count_words(sent)
            if nw >= 5 and nb / nw > 0.42:
                F.append(Finding("FIT-02", "选词", "check",
                    f"§{i} 单句加粗密度 {nb}/{nw} = {nb/nw*100:.0f}%",
                    re.sub(r"\*\*", "", sent).strip()[:62],
                    "全篇均值约 18%。**密度高不等于硬塞，须逐句读。**\n"
                    "        判据是：把其中一个加粗词删掉（连同它所在的成分），"
                    "句子会不会因此松掉？\n"
                    "        会松 → 那些词是承重的，保留；\n"
                    "        不会松 → 那个词是塞进来凑名额的，取消加粗、把名额让给别处。\n"
                    "        实例：Prevailing medical opinion blamed the foul air.（4/7=57%）"
                    "四个词各自精准，删任一个句子都松，保留。"))
        # ③ 形容词副词连用作加粗：最常见的凑数手法
        for m in re.finditer(r"\*\*(\w+ly)\*\*\s+\*\*(\w+)\*\*", p["en"]):
            F.append(Finding("FIT-03", "选词", "info", f"§{i} 副词＋形容词连着加粗",
                f"{m.group(1)} {m.group(2)}",
                "副词最容易被塞进来凑名额。删掉它，句子若毫无损失，它就是凑数的"))
    # ── 第十四层 REF · 已撤销（2026-08-16）──────────────────────────
    # 曾试图用规则查「句中代词无先行词」，三次校准全部失败，记录于此以免重走：
    #
    #   一 只看同段 → 一次点名 8 篇，逐条核实**全是跨段正常承接**
    #     （段首代词接上一段末句是本体裁常态）。
    #   二 改为跨段看前两句 → 零误报，但第03、04篇那两处真错误**也抓不住了**，
    #     规则等于没有。
    #   三 收窄为只查 they/them/their、且要求「名+姓」两个大写词
    #     （防 Nimbus-7、Halley Bay 被误当人名）→ 两个方向的单测都过了，
    #     但全库跑出 12 处，逐条核实**十一处的 they 指的是物**
    #     （细菌、条带、符号、地震波、鸽子）——**they 指物是英文常态**。
    #
    # 结论：代词是否有落点，取决于「最近的那个名词是不是它」，
    # 而机器分不清人名与产品名、也分不清 they 指人还是指物。
    # **这一类只能靠第九轮的刁钻一问。** 已在 polish.py 第9轮④写明两个实例：
    #   第03篇 they checked —— 前文只有 Nimbus-7 与 its processing
    #   第04篇 granted him £8,750 —— him 紧跟 Kendall，获奖的却是 Harrison
    # ── 第十五层 AUD · 审读进度（2026-08-16 加）─────────────────────
    # 依据 18 篇实测：抓到问题的来源分布为
    #   史实核查（上网核）11 · 刁钻一问（人读）7 · 机器规则 6
    #   句序/接缝/因果/中文/词价 合计约 2
    # **最致命的三处全部来自人读，机器永远抓不到**：
    #   第04篇 granted him £8,750（him 紧跟 Kendall，获奖的是 Harrison）
    #   第07篇 named it entropy（「熵」这个名字是冯·诺依曼建议的）
    #   第13篇 the first woman（居里夫人 1911 年就独得过化学奖）
    # 故本层不查文本，只查「那两件最高产的事做了没有」。
    _fl = a.get("facts") or []
    if _fl and not any(("已核" in c) or ("已确认" in c) for c in _fl):
        F.append(Finding("AUD-01", "审读", "check", "史实未逐条上网核",
            f"{len(_fl)} 条史实无一标注「已核」",
            "**这是抓到问题最多的一条（11/26）**。核过的条目应在 facts 写明「已核」并附链接"))
    if not os.path.exists(os.path.join(ROOT, "notes/.regress", f"{a['id']}.json")):
        F.append(Finding("AUD-02", "审读", "check", "未存快照",
            "REG 差分层对本篇不生效",
            "改动弄坏了什么无从发现。跑 python3 scripts/regress.py %s snapshot" % a["id"]))
    if not os.path.exists(os.path.join(ROOT, f"notes/精修台账-{a['id']}.md")):
        F.append(Finding("AUD-03", "审读", "check", "未跑刁钻一问与最弱一句",
            "polish 第9轮 ④⑤ 未执行",
            "**抓到问题第二多（7/26），且那三处最致命的错误全出自这里**"
            "（him 指错人／entropy 归属错／首位女性漏限定）。"
            "跑 python3 scripts/polish.py %s round 9" % a["id"]))

    return F, dict(pw=pw, pkn=pkn, total_w=total_w, total_k=total_k, dens=dens,
                   cheap=cheap, soft=soft, names=sorted(set(names)))

def score(findings):
    """合规分：衡量硬约束的达标程度，**不是**文章质量分。
    文章好不好（论证力、反转、结尾升华）经全库相关性检验证明无法由表层特征可靠判定，
    故不纳入计分，只在『提示』层给人工判断线索。"""
    s = 100 - sum(WEIGHT[f.sev] for f in findings)
    return max(0, s)

# ── 输出 ────────────────────────────────────────────────────────────────
BAR = "─" * 66

def report_one(a, F, st, verbose=True):
    sc = score(F)
    hard = sum(1 for f in F if f.sev == "hard")
    chk  = sum(1 for f in F if f.sev == "check")
    print(BAR)
    print(f"{a['id']} · {a['title']}    合规分 {sc}/100   硬伤 {hard} · 待核 {chk}")
    print(f"   {st['total_w']}词 / {st['total_k']}重点词 / {st['dens']}%")
    print(f"   段落词数  {'·'.join(map(str, st['pw']))}")
    print(f"   关键词分布 {'·'.join(map(str, st['pkn']))}   极差 {max(st['pkn'])-min(st['pkn'])}")
    print(f"   局部密度  {'·'.join(f'{k/w*100:.1f}' for w, k in zip(st['pw'], st['pkn']))}")
    print(f"   白送词    {len(st['cheap'])} 确定 + {len(st['soft'])} 边缘 /50    人名 {len(st['names'])}")
    if not verbose:
        return
    if not F:
        print("   ✓ 全部通过")
        return
    order = {"hard": 0, "check": 1, "info": 2}
    for f in sorted(F, key=lambda x: (order[x.sev], x.rid)):
        tag = {"hard": "✗硬伤", "check": "·待核", "info": "  提示"}[f.sev]
        _c = charter_of(f.rid)
        _cs = f"　　铁律{_c[0]}" if _c else ""
        print(f"   {tag} [{f.rid}] {f.title}{_cs}")
        print(f"        {f.detail}")
        if f.fix:
            print(f"        → {f.fix}")

# ── HTML 报告 ──────────────────────────────────────────────────────────
def write_html(results, path):
    def esc(x):
        return (str(x).replace("&","&amp;").replace("<","&lt;").replace(">","&gt;"))
    ranked = sorted(results, key=lambda r: score(r[1]))
    rows = []
    for a, F, st in ranked:
        sc = score(F)
        hard = sum(1 for f in F if f.sev == "hard")
        chk  = sum(1 for f in F if f.sev == "check")
        spread = max(st["pkn"]) - min(st["pkn"])
        dens = [k / w * 100 for w, k in zip(st["pw"], st["pkn"])]
        bars = "".join(
            f'<i class="{"bad" if d > PARA_DENSITY_HARD else "warn" if d > PARA_DENSITY_WARN else "ok"}"'
            f' style="height:{min(100, d*3.4):.0f}%" title="§{i+1} {st["pw"][i]}词/{st["pkn"][i]}词 {d:.1f}%"></i>'
            for i, d in enumerate(dens))
        items = "".join(
            f'<li class="{f.sev}"><b>[{f.rid}] {esc(f.title)}</b>'
            f'<span>{esc(f.detail)}</span>'
            + (f'<em>→ {esc(f.fix)}</em>' if f.fix else "") + "</li>"
            for f in sorted(F, key=lambda x: ({"hard":0,"check":1,"info":2}[x.sev], x.rid)))
        cls = "s-hi" if sc >= 90 else "s-mid" if sc >= 75 else "s-lo"
        rows.append(f"""<details class="card"><summary>
<span class="sc {cls}">{sc}</span>
<span class="no">{esc(a['id'])}</span>
<span class="ti">{esc(a['title'])}</span>
<span class="bars">{bars}</span>
<span class="tags">{'<b class="h">硬伤'+str(hard)+'</b>' if hard else ''}{'<b class="c">待核'+str(chk)+'</b>' if chk else ''}</span>
</summary>
<div class="body">
<table><tr><th>词数</th><td>{st['total_w']}</td><th>重点词</th><td>{st['total_k']}</td><th>密度</th><td>{st['dens']}%</td></tr>
<tr><th>段落词数</th><td colspan="5">{' · '.join(map(str, st['pw']))}</td></tr>
<tr><th>关键词分布</th><td colspan="5">{' · '.join(map(str, st['pkn']))} <b>（极差 {spread}）</b></td></tr>
<tr><th>局部密度</th><td colspan="5">{' · '.join(f'{d:.1f}%' for d in dens)}</td></tr>
<tr><th>白送词</th><td colspan="3">{len(st['cheap'])} 确定 + {len(st['soft'])} 边缘</td><th>人名</th><td>{len(st['names'])}</td></tr>
</table>
<ul>{items or '<li class="ok">全部通过</li>'}</ul></div></details>""")
    avg = sum(score(F) for _, F, _ in results) / len(results)
    th = sum(1 for _, F, _ in results for f in F if f.sev == "hard")
    open(path, "w", encoding="utf-8").write(f"""<!doctype html><html lang="zh-CN"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1"><title>单词检察官 v4 · 全库审计</title><style>
:root{{--ink:#17202a;--soft:#4f5964;--faint:#7c838a;--line:#d9d0c2;--paper:#f5f1e8;--card:#fffdf8;
--red:#aa3e32;--navy:#173d63;--green:#41715d;--gold:#b58b3b;
--serif:"Iowan Old Style","Songti SC",Georgia,serif;--mono:Consolas,Menlo,monospace}}
*{{box-sizing:border-box}}body{{margin:0;background:var(--paper);color:var(--ink);
font:15px/1.7 -apple-system,"Noto Sans SC","Microsoft YaHei",sans-serif}}
.wrap{{max-width:1000px;margin:0 auto;padding:44px 22px 90px}}
h1{{font:520 42px/1.1 var(--serif);letter-spacing:-.03em;margin:0}}
.lede{{color:var(--soft);margin:14px 0 0;max-width:64ch}}
.sum{{display:grid;grid-template-columns:repeat(4,1fr);gap:1px;background:var(--line);
border:1px solid var(--line);border-radius:14px;overflow:hidden;margin:30px 0 34px}}
.sum div{{background:var(--card);padding:18px}}
.sum b{{display:block;font:520 34px/1 var(--serif)}}
.sum span{{display:block;margin-top:7px;color:var(--faint);font:700 10px/1 var(--mono);letter-spacing:.1em}}
.card{{border:1px solid var(--line);border-radius:12px;background:var(--card);margin-bottom:9px;overflow:hidden}}
summary{{list-style:none;cursor:pointer;display:grid;
grid-template-columns:52px 34px 1fr 130px 120px;gap:12px;align-items:center;padding:13px 16px}}
summary::-webkit-details-marker{{display:none}}
summary:hover{{background:#f8f4eb}}
.sc{{font:700 17px/1 var(--mono);text-align:center;padding:8px 0;border-radius:8px;color:#fff}}
.s-hi{{background:var(--green)}}.s-mid{{background:var(--gold)}}.s-lo{{background:var(--red)}}
.no{{font:520 22px/1 var(--serif);color:var(--red)}}
.ti{{font:600 16px/1.3 var(--serif)}}
.bars{{display:flex;align-items:flex-end;gap:3px;height:34px}}
.bars i{{flex:1;border-radius:2px 2px 0 0;min-height:3px}}
.bars .ok{{background:var(--navy);opacity:.55}}.bars .warn{{background:var(--gold)}}.bars .bad{{background:var(--red)}}
.tags{{text-align:right}}.tags b{{display:inline-block;margin-left:5px;padding:4px 8px;border-radius:99px;
font:700 10px/1 var(--mono);color:#fff}}.tags .h{{background:var(--red)}}.tags .c{{background:var(--faint)}}
.body{{border-top:1px solid var(--line);padding:16px 18px 20px}}
table{{width:100%;border-collapse:collapse;margin-bottom:14px;font-size:13.5px}}
th{{text-align:left;color:var(--faint);font:700 10px/1.6 var(--mono);letter-spacing:.08em;
padding:6px 12px 6px 0;white-space:nowrap;width:1%}}
td{{padding:6px 18px 6px 0;font-family:var(--mono);font-size:12.5px}}
ul{{list-style:none;padding:0;margin:0}}
li{{padding:11px 13px;border-left:3px solid var(--line);background:#f8f4eb;border-radius:0 8px 8px 0;margin-bottom:7px}}
li.hard{{border-left-color:var(--red)}}li.check{{border-left-color:var(--faint)}}
li.info{{border-left-color:var(--line);opacity:.72}}li.ok{{border-left-color:var(--green);color:var(--green)}}
li b{{display:block;font:700 13px/1.5 var(--mono)}}
li span{{display:block;color:var(--soft);font-size:13px;margin-top:3px;word-break:break-word}}
li em{{display:block;color:var(--navy);font-style:normal;font-size:12.5px;margin-top:5px}}
@media(max-width:760px){{summary{{grid-template-columns:46px 1fr;row-gap:8px}}
.ti{{grid-column:2}}.bars,.tags{{grid-column:1/3}}.tags{{text-align:left}}}}
</style></head><body><div class="wrap">
<h1>单词检察官 <span style="color:var(--red)">v4</span></h1>
<p class="lede">量化层：段落均衡 · 重点词价值 · 论证骨架 · 跨篇唯一性。
补的是 v2/v3 正则引擎抓不到的那一半——第02篇旧稿的 13·13·3·10·11 分布与 26.3% 局部密度，
正则一条都报不出来。词价判据为 wordfreq 的 Zipf 词频：≥{ZIPF_CHEAP} 判为白送词（考研生早已掌握，
占用名额即浪费教学预算），{ZIPF_SOFT}—{ZIPF_CHEAP} 记为边缘。</p>
<div class="sum">
<div><b>{len(results)}</b><span>篇</span></div>
<div><b>{avg:.0f}</b><span>平均分</span></div>
<div><b>{th}</b><span>硬伤合计</span></div>
<div><b>{sum(1 for _,F,_ in results if not any(f.sev=='hard' for f in F))}</b><span>零硬伤</span></div>
</div>
{''.join(rows)}
</div></body></html>""")
    return path


# ── 词池：写之前就把冲突排除掉 ─────────────────────────────────────────
def build_index(arts, exclude=None):
    """返回 {规范化词: [占用它的篇号]}，涵盖速查表词元与英文加粗表面形式两条通道。"""
    idx = defaultdict(set)
    for a in arts:
        if exclude and a["id"] == exclude:
            continue
        for g in a.get("glossary", []):
            idx[norm(g["w"])].add(a["id"])
        for p in a.get("paras", []):
            for m in BOLD.findall(p["en"]):
                idx[norm(m)].add(a["id"])
    return idx

def grade(word):
    lv, z = cheapness(word)
    if lv == "cheap": return "白送", z
    if lv == "soft":  return "边缘", z
    if z is None:     return "未知", z
    if z < 2.5:       return "生僻", z
    return "合格", z

def cmd_pool(arts, words, exclude=None):
    """逐词判定：是否与全库冲突 + 词价等级。写新文章前先跑这个。"""
    idx = build_index(arts, exclude)
    free, taken, cheapw = [], [], []
    print(BAR)
    print(f"词池检查 · 候选 {len(words)} 个" + (f"（不计第 {exclude} 篇自身）" if exclude else ""))
    print(BAR)
    print(f"{'词':<18}{'Zipf':>6}  {'词价':<6}{'状态'}")
    for w in words:
        n = norm(w)
        g, z = grade(w)
        owner = sorted(idx.get(n, []))
        if owner:
            st = "✗ 已被第 " + "、".join(owner) + " 篇占用"
            taken.append(w)
        elif g in ("白送", "边缘"):
            st = "△ 可用，但价值低（考研生多半已掌握）"
            cheapw.append(w); free.append(w)
        elif g == "生僻":
            st = "△ 可用，但过于生僻（非考研词，仅在题材必需时用）"
            free.append(w)
        else:
            st = "✓ 可用"
            free.append(w)
        print(f"{w:<18}{(z if z is not None else 0):>6.2f}  {g:<6}{st}")
    print(BAR)
    print(f"可用 {len(free)} · 冲突 {len(taken)} · 其中低价值 {len(cheapw)}")
    if taken:
        print("冲突：" + " ".join(taken))
    return free

def cmd_draft(arts, path, exclude=None):
    """起草台：对一份英文草稿做入库前体检——计量、冲突、分布，一次给全。"""
    text = open(path, encoding="utf-8").read()
    blocks = [b.strip() for b in re.split(r"\n\s*\n", text) if b.strip()]
    print(BAR); print(f"起草台 · {path}"); print(BAR)
    pw = [count_words(b) for b in blocks]
    pk = [BOLD.findall(b) for b in blocks]
    pkn = [len(x) for x in pk]
    tw, tk = sum(pw), sum(pkn)
    d = tk / tw * 100 if tw else 0
    ok = lambda c: "✓" if c else "✗"
    print(f"{ok(WORDS_MIN <= tw <= WORDS_MAX)} 词数 {tw}（{WORDS_MIN}—{WORDS_MAX}）")
    print(f"{ok(tk == KEYWORDS_EXACT)} 重点词 {tk}（须 {KEYWORDS_EXACT}）")
    print(f"{ok(d <= DENSITY_MAX)} 密度 {d:.1f}%（≤{DENSITY_MAX}%）")
    print(f"{ok(len(blocks) == PARA_EXACT)} 段落 {len(blocks)}（须 {PARA_EXACT}）")
    if pkn:
        sp = max(pkn) - min(pkn)
        print(f"{ok(sp <= KW_SPREAD_MAX)} 关键词分布 {'·'.join(map(str,pkn))}  极差 {sp}（上限 {KW_SPREAD_MAX}）")
        print(f"  段落词数 {'·'.join(map(str,pw))}")
        print(f"  局部密度 {'·'.join(f'{k/w*100:.1f}%' for w,k in zip(pw,pkn) if w)}")
    allk = [w for g in pk for w in g]
    ns = [norm(x) for x in allk]
    dup = [x for x, c in Counter(ns).items() if c > 1]
    print(f"{ok(not dup)} 篇内重复 " + ("：" + "、".join(dup) if dup else "无"))
    print()
    cmd_pool(arts, allk, exclude)

def cmd_charter():
    """反查覆盖：铁律里哪些条款没有任何规则在执行。"""
    print(BAR); print("铁律 ↔ 检察官规则　对照"); print(BAR)
    if not _CM:
        print("未找到 data/reference/charter-map.json"); return
    # REG-* 定义在 regress.py（由第十层调用），须一并扫
    src = ""
    for f in ("scripts/inspector.py", "scripts/regress.py"):
        try:
            src += open(os.path.join(ROOT, f), encoding="utf-8").read()
        except Exception:
            pass
    for k, v in _CM.items():
        rs = v.get("rules", [])
        live = [r for r in rs if f'"{r}"' in src]
        dead = [r for r in rs if r not in live]
        mark = "✓" if live else ("·" if not rs else "✗")
        print(f"\n{mark} {k} · {v['title']}")
        print(f"    {v['gist']}")
        if live:
            print(f"    由 {len(live)} 条规则执行：{'、'.join(live)}")
        if dead:
            print(f"    ✗ 映射到不存在的规则：{'、'.join(dead)}")
        if not rs:
            print("    **无规则执行——只能靠人的自觉。**")
        if v.get("note"):
            print(f"    → {v['note']}")
    print("\n" + BAR)
    nocov = [k for k, v in _CM.items() if not v.get("rules")]
    print(f"共 {len(_CM)} 条款，其中 {len(nocov)} 条无规则执行：{'、'.join(nocov) or '无'}")
    print("**无规则执行的条款，是这套机制真正的薄弱处。**")


def main():
    if "--charter" in sys.argv:
        cmd_charter(); return
    args = [x for x in sys.argv[1:] if not x.startswith("--")]
    arts = load_articles()
    results = []
    for a in arts:
        F, st = inspect(a, arts)
        results.append((a, F, st))

    argv = sys.argv[1:]
    if "--pool" in argv:
        i = argv.index("--pool")
        ex = None
        if "--exclude" in argv:
            ex = argv[argv.index("--exclude") + 1].zfill(2)
        ws = [w for w in argv[i+1:] if not w.startswith("-")]
        if len(ws) == 1 and os.path.exists(ws[0]):
            ws = open(ws[0], encoding="utf-8").read().split()
        if "--exclude" in argv:
            ws = [w for w in ws if w != ex and w != ex.lstrip("0")]
        cmd_pool(arts, ws, ex)
        return
    if "--draft" in argv:
        i = argv.index("--draft")
        ex = argv[argv.index("--exclude") + 1].zfill(2) if "--exclude" in argv else None
        cmd_draft(arts, argv[i+1], ex)
        return

    if "--html" in sys.argv:
        i = sys.argv.index("--html")
        out = sys.argv[i+1] if len(sys.argv) > i+1 and not sys.argv[i+1].startswith("-") \
              else os.path.join(ROOT, "tools", "检察官报告.html")
        write_html(results, out)
        print("HTML 报告已生成：" + out)
        return

    if args:
        want = {x.zfill(2) for x in args}
        for a, F, st in results:
            if a["id"] in want:
                report_one(a, F, st, verbose=True)
        return

    for a, F, st in results:
        report_one(a, F, st, verbose=False)

    print(BAR)
    print("全库合规排名（低分优先修）· 此分衡量硬约束达标，不衡量文章质量")
    print(BAR)
    ranked = sorted(results, key=lambda r: score(r[1]))
    for a, F, st in ranked:
        hard = sum(1 for f in F if f.sev == "hard")
        spread = max(st["pkn"]) - min(st["pkn"])
        flags = []
        if spread > KW_SPREAD_MAX: flags.append(f"极差{spread}")
        if len(st['cheap']) > CHEAP_MAX: flags.append(f"白送{len(st['cheap'])}")
        if not st["names"]:        flags.append("无人名")
        mx = max(k / w * 100 for w, k in zip(st["pw"], st["pkn"]))
        if mx > PARA_DENSITY_HARD: flags.append(f'局部{mx:.0f}%')
        print(f"  {score(F):3d}  {a['id']} {a['title'][:38]:40s} 硬伤{hard:2d}  {' '.join(flags)}")
    print(BAR)
    tot_hard = sum(1 for _, F, _ in results for f in F if f.sev == "hard")
    print(f"全库 {len(results)} 篇 · 硬伤合计 {tot_hard} 条 · "
          f"平均分 {sum(score(F) for _, F, _ in results)/len(results):.1f}")
    print(f"词价判据：wordfreq {'已启用' if HAVE_WF else '未安装（用兜底词表）'}，"
          f"Zipf ≥ {ZIPF_CHEAP} 确定白送，{ZIPF_SOFT}—{ZIPF_CHEAP} 边缘")

if __name__ == "__main__":
    main()
