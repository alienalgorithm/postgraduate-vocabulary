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
import re

# ── 正则：全项目共用同一套，不得各自另写 ────────────────────────────
# ★★★ 共用阈值 —— 全库只此一份（2026-09-02 立，同源第八处）
# **主动扫出：词数上限 270 散在 8 个文件里，下限 240 散在 3 个，
#   词频线 2.2／5.0 散在 4 个。目前数值一致，但改一个就会漏掉七个。**
# **与不规则动词表、守卫指标同例：让数据只有一个来源。**
# ⚠ 新代码一律引用这里；已有的散落值下次触碰时顺手改成引用。
WORD_MAX = 270          # 正文词数上限（MET-01）
WORD_MIN = 240          # 正文词数下限（MET-01）
PARA_MAX = 75           # 单段词数上限（MET-05）
PARA_MIN = 45           # 单段词数下限（MET-05）
SLOTS = 50              # 每篇重点词名额（MET-02）
RARE_MAX = 2.2          # 过于生僻线，zipf ≤ 此值即 VAL-09
CHEAP_MIN = 5.0         # 白送词线，zipf ≥ 此值即 VAL-02h
SCORE_FLOOR = 95        # 合规分门槛（preflight）

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


def metrics(paras):
    """一篇文章的三项指标。metrics 字段必须与本函数一致。"""
    w = sum(count_words(p["en"]) for p in paras)
    k = sum(len(keywords(p["en"])) for p in paras)
    return {"words": w, "keywords": k,
            "density": round(k / w * 100, 1) if w else 0.0}
