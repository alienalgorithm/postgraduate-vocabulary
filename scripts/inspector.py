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
WORDS_MIN, WORDS_MAX = 240, 270
KEYWORDS_EXACT       = 50
DENSITY_MAX          = 20.0
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

def count_words(t):
    return sum(1 for tok in t.replace("**", "").split() if re.search(r"[A-Za-z0-9]", tok))

# ── 单条发现 ────────────────────────────────────────────────────────────
class Finding:
    __slots__ = ("rid", "layer", "sev", "title", "detail", "fix")
    def __init__(self, rid, layer, sev, title, detail, fix=""):
        self.rid, self.layer, self.sev = rid, layer, sev
        self.title, self.detail, self.fix = title, detail, fix

WEIGHT = {"hard": 8, "check": 3, "info": 0}

# ── 规则 ────────────────────────────────────────────────────────────────
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
        F.append(Finding("VAL-02", "词价", "check", "含白送词", fmt(cheap)))
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
    names = re.findall(r"(?<![.!?]\s)\b[A-Z][a-z]+\s+(?:van\s+|de\s+|von\s+|der\s+)?[A-Z][a-z]+\b", body)
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
    anomaly_re = re.compile(r"\b(instead|yet|but|however|nobody|no one|impossible|astonish\w*|no visible)\b", re.I)
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
        print(f"   {tag} [{f.rid}] {f.title}")
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

def main():
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
