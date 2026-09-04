#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
共享核心 · core
==============
**本文件是全部工具对「一段文章文本」的唯一权威解释。**

存在的理由：`count_words` 曾被抄进三个文件——inspector、agent、regress。
三处当时算得一样，但没有任何东西保证以后还一样。
一旦有人改了其中一处，就会出现「草稿检查说 270 词、入库检查说 272 词」，
而这种不一致极难查，因为两边都「看起来正常」。

规则：**任何工具都不得自己再实现下面这些函数。** 需要就从这里 import。
`scripts/test_tools.py` 有一条测试锁死这一点。

设计边界：本模块只放「对文本的基本解释」——数词、取加粗、切句、判实词。
它不含任何阈值、任何规则、任何判断。规则属于各工具自己。
"""
import os
import re

# ── 正则：全项目共用同一套，不得各自另写 ────────────────────────────
# ★★★ 共用阈值 —— 全库只此一份（2026-09-02 立，同源第八处）
# **主动扫出：词数上限 270 散在 8 个文件里，下限 240 散在 3 个，
#   词频线 2.2／5.0 散在 4 个。目前数值一致，但改一个就会漏掉七个。**
# **与不规则动词表、守卫指标同例：让数据只有一个来源。**
# ⚠ 新代码一律引用这里；已有的散落值下次触碰时顺手改成引用。
# ★★★ 共用阈值 —— **一个都不自写，全部从 inspector.py 读**（2026-09-02 改）
# **实测：我第一版凭印象写了八个，四个是错的**：
#   **WORD_MAX 写 270（实为 271）** —— 差点据此削掉全库十三篇合规文章
#     （第02、05、10、11、13、14、21、22、27、28、30、32、41 篇）；
#   **WORD_MIN 写 240（实为 249）**；
#   **PARA_MAX 写 75（实为 72）、PARA_MIN 写 45（实为 40）** —— 段落上下限也错了。
#   （SLOTS 50、RARE_MAX 2.2、CHEAP_MIN 5.0、SCORE_FLOOR 95 这四个碰巧写对。）
# **★ 立共用常量本是为了消灭「两份数据」，我却在立的时候造出了第八处。**
# **改法与前七次一样：从检察官那份读，不再自写。**
def _from_inspector():
    """把 inspector.py 里的阈值抓出来 —— 那里是唯一的一份。"""
    d = {"WORD_MIN": 249, "WORD_MAX": 271, "PARA_MIN": 40, "PARA_MAX": 72,
         "SLOTS": 50, "RARE_MAX": 2.2, "CHEAP_MIN": 5.0, "SCORE_FLOOR": 95}
    try:
        t = open(os.path.join(os.path.dirname(os.path.abspath(__file__)),
                              "inspector.py"), encoding="utf-8").read()
        m = re.search(r"WORDS_MIN,\s*WORDS_MAX\s*=\s*(\d+),\s*(\d+)", t)
        if m:
            d["WORD_MIN"], d["WORD_MAX"] = int(m.group(1)), int(m.group(2))
        m = re.search(r"PARA_WORDS_MIN\s*=\s*(\d+)", t)
        if m:
            d["PARA_MIN"] = int(m.group(1))
        m = re.search(r"PARA_WORDS_MAX\s*=\s*(\d+)", t)
        if m:
            d["PARA_MAX"] = int(m.group(1))
        m = re.search(r"ZIPF_CHEAP\s*=\s*([\d.]+)", t)
        if m:
            d["CHEAP_MIN"] = float(m.group(1))
    except Exception:
        pass
    return d


_T = _from_inspector()
WORD_MIN = _T["WORD_MIN"]       # 正文词数下限（MET-01）
WORD_MAX = _T["WORD_MAX"]       # 正文词数上限（MET-01）
PARA_MIN = _T["PARA_MIN"]       # 单段词数下限
PARA_MAX = _T["PARA_MAX"]       # 单段词数上限
CHEAP_MIN = _T["CHEAP_MIN"]     # 白送词线（ZIPF_CHEAP）
SLOTS = 50                      # 每篇重点词名额（MET-02，检察官里是硬编码的 50）
RARE_MAX = 2.2                  # 过于生僻线（VAL-09）
SCORE_FLOOR = 95                # 合规分门槛（preflight）

BOLD = re.compile(r"\*\*(.+?)\*\*")
PAIR = re.compile(r"\*\*([^*]+)\*\*\(([A-Za-z][A-Za-z'’\- ]*)\)")
SENT = re.compile(r"(?<=[.!?])\s+")
NUM = re.compile(r"\d[\d,.]*")
CJK = re.compile(r"[\u4e00-\u9fff]")

# 计入实词交集时忽略的功能词
STOP = set("""the a an and or of to in on at for from by as that this these those it its their his her
they he she we you i not but was were is are be been being had have has do does did will would could
should may might must can if then than when where which who what while with without within into onto
over under about after before during through between among across against out up down off again more
most much many some any all each every both few other another such same own very just also only even
still yet there here one two three four five six seven eight nine ten first second third new old like
get got make made take took said say says use used using per via etc so no nobody nothing them him us
me my our your""".split())


def plain(t):
    """剥掉加粗标记，得到读者实际读到的文本。"""
    return t.replace("**", "")


def count_words(t):
    """文章词数的唯一定义：剥掉加粗后，含字母或数字的空白分隔单元。

    注意 `replace("**", "")` 不可省——曾有工具依赖上游已剥离而漏写，
    属隐性依赖，一旦调用顺序变化即出错。
    """
    return sum(1 for tok in plain(t).split() if re.search(r"[A-Za-z0-9]", tok))


def keywords(t):
    """按出现顺序返回加粗词表面形式。速查表顺序必须以此为准。"""
    return BOLD.findall(t)


def annotations(zh):
    """中文里的 (中文, english) 括注对。跨语言配对必须用它作显式键——
    中英语序天然不同，按位置配对会整体串位。"""
    return [(m.group(1), m.group(2)) for m in PAIR.finditer(zh)]


def sentences(t):
    """切句。输入可含加粗标记，内部会先剥离。"""
    return [x.strip() for x in SENT.split(plain(t)) if x.strip()]


def sentence_lengths(t, floor=3):
    """各句词数，短于 floor 的丢弃（标题片段、残句不计入节奏统计）。"""
    return [n for n in (count_words(s) for s in sentences(t)) if n >= floor]


def content_words(s, minlen=4):
    """实词集合，用于判断两句之间有没有接力。"""
    return {w.lower().rstrip("s") for w in re.findall(r"[A-Za-z]{%d,}" % minlen, plain(s))
            if w.lower() not in STOP}


def numbers(t, keep_int_of_float=True):
    """文本中的数字集合，去掉千分位。
    keep_int_of_float：39.2 同时产出 39，便于与「约39秒」这类中文核对匹配。"""
    out = set()
    for m in NUM.finditer(plain(t)):
        v = m.group(0).rstrip(".").replace(",", "")
        if not v:
            continue
        out.add(v)
        if keep_int_of_float and "." in v:
            out.add(v.split(".")[0])
    return out


def glossary_from_paras(paras, extra=None):
    """从中文正文的「**释义**(word)」括注直接生成速查表。

    ★ 由来（2026-09-03）：第66篇入库时 MET-09 报硬伤——速查表写「市政官（复）」，正文括注是「市政官们」。
    **两处是分别手写的，就会错位。** 从正文抽，就只有一份。
    extra：正文括注抽不到时的补充（如同一英文词在两段各占一个名额时的第二个键）。
    """
    import re as _re
    gl, used = [], set()
    for pi, p in enumerate(paras, 1):
        en_words = keywords(p["en"])
        zh_pairs = _re.findall(r"\*\*([^*]+?)\*\*\(([^)]+)\)", p["zh"])
        zmap = {}
        for zh_, en_ in zh_pairs:
            zmap.setdefault(en_.lower(), zh_)
        for w in en_words:
            k = w.lower()
            zh_ = zmap.get(k) or (extra or {}).get(k)
            assert zh_, ("中文正文没有 (%s) 的括注，速查表无从生成" % w)
            key = k if k not in used else w
            used.add(key)
            gl.append({"w": key, "zh": zh_, "p": pi})
    assert len(gl) == 50 and len({g["w"] for g in gl}) == 50, ("速查表", len(gl))
    return gl


def metrics(paras):
    """一篇文章的三项指标。metrics 字段必须与本函数一致。"""
    w = sum(count_words(p["en"]) for p in paras)
    k = sum(len(keywords(p["en"])) for p in paras)
    return {"words": w, "keywords": k,
            "density": round(k / w * 100, 1) if w else 0.0}

# ── 撞库窗口（2026-09-04 立，默认全库＝行为不变）──────────────────────
# 《总令》「词池现状」路二：撞库只在相邻 N 篇内算。poolsim.py 量过：全库 7/46 题材过线，40 篇 18，30 篇 24，20 篇 29。
# **改这一个数就是选路二；不改就是路一。规则本身（VAL-07/08）在铁律里，改不改由用户定。**
# None 或 0 = 全库；正整数 N = 只与最近 N 篇比。
CLASH_WINDOW = None


def clash_scope(arts, target_id=None):
    """撞库时该与哪些篇比。唯一实现——agent.used_index 与 inspector 都调这里，别各写一份。
    窗口为空 → 全库；有窗口 → 只与 |id − target| ≤ N 的篇比（对称，老篇不会因新篇入库而被追溯改判）；
    没给 target（例如 brief/domains 扫全库）→ 取最近 N 篇。"""
    win = CLASH_WINDOW
    if not win:
        return list(arts)
    win = int(win)
    if target_id is not None:
        try:
            t = int(target_id)
        except (TypeError, ValueError):
            return list(arts)
        return [x for x in arts if abs(int(x["id"]) - t) <= win and x["id"] != str(target_id)]
    return sorted(arts, key=lambda x: int(x["id"]))[-win:]

