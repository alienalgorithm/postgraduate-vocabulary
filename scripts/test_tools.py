#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
工具回归测试
============
本会话修过十来个工具缺陷，每一个都是偶然发现的——
误报把范文判成不合格、漏报让几百条错误静默通过。
没有测试，同样的 bug 会再回来。

规则：**每修一个工具缺陷，就在这里加一条用例。**

    python3 scripts/test_tools.py
"""
import os, re, sys, json, subprocess

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(ROOT, "scripts"))
os.chdir(ROOT)
import inspector as I
import agent as A

ok = fail = 0
def check(name, cond, detail=""):
    global ok, fail
    if cond:
        ok += 1
        print(f"  ✓ {name}")
    else:
        fail += 1
        print(f"  ✗ {name}  {detail}")

def art(paras_en, paras_zh=None, gloss=None, facts=None, **kw):
    """构造最小文章对象；未指定处自动补足以免触发无关规则。"""
    n = len(paras_en)
    zh = paras_zh or ["占位。"] * n
    kws = [w for p in paras_en for w in re.findall(r"\*\*(.+?)\*\*", p)]
    d = {"id": "99", "title": "T", "paras": [{"en": e, "zh": z} for e, z in zip(paras_en, zh)],
         "glossary": gloss if gloss is not None else
                     [{"w": w.lower(), "zh": "占位", "p": 1} for w in kws],
         "facts": facts if facts is not None else ["占位出处"],
         "metrics": {"words": 0, "keywords": 0, "density": 0}}
    d.update(kw)
    return d

def ids(findings):
    return {f.rid for f in findings}

print("=" * 62)
print("工具回归测试 · 每条对应一个已修缺陷")
print("=" * 62)

# ── inspector 阈值校准 ────────────────────────────────────────────
print("\n[阈值] 不得把范文判成不合格")
files = ["data/articles.js"] + sorted("data/" + x for x in os.listdir("data")
                                      if x.startswith("article-"))
js = ("globalThis.window=globalThis;" +
      "".join("require(%s);" % json.dumps(os.path.abspath(f)) for f in files) +
      "process.stdout.write(JSON.stringify(globalThis.SITE.ARTICLES))")
arts = sorted(json.loads(subprocess.run(["node", "-e", js], capture_output=True,
                                        text=True).stdout), key=lambda x: x["id"])
for ref in ("17", "12", "19"):
    a = next(x for x in arts if x["id"] == ref)
    F, _ = I.inspect(a, arts)
    check(f"范文第{ref}篇零硬伤", not [f for f in F if f.sev == "hard"],
          [f"{f.rid}:{f.title}" for f in F if f.sev == "hard"])

# ── STR-01 句首人名（曾漏报，把有名字的文章判成「全篇无人名」）──────
print("\n[STR-01] 句首人名不得漏（曾误判第11篇无人名）")
F, _ = I.inspect(art(["**Alpha** ran.", "Joseph Henry found **beta** first.",
                      "**Gamma** held.", "**Delta** fell.", "**Epsilon** rose."]), arts)
check("句首 Joseph Henry 被识别", "STR-01" not in ids(F))
F, _ = I.inspect(art(["In September the **alpha** ran.", "The **beta** held.",
                      "**Gamma** fell.", "**Delta** rose.", "**Epsilon** ended."]), arts)
check("In September 不被误认成人名", "STR-01" in ids(F))

# ── STR-02 拼写数词（曾漏报，把 eight/three 当作无数字）─────────────
print("\n[STR-02] 拼写出来的数词算数字（曾误判第07篇§2无数字）")
F, _ = I.inspect(art(["If eight **outcomes** are equal, three **bits** suffice.",
                      "A **beta**.", "A **gamma**.", "A **delta**.", "An **epsilon**."]), arts)
check("eight / three 被当作数字", not [f for f in F if f.rid == "STR-02" and "§1" in f.title])

# ── STR-03 含专名或数词的短句不是格言（曾误判事实句）────────────────
print("\n[STR-03] 事实句不得判成格言（曾误判第06篇诺奖句）")
F, _ = I.inspect(art(["**A** one.", "**B** two.", "**C** three.", "**D** four.",
                      "Both men took Nobel prizes. A rule is a rule."]), arts)
check("含 Nobel 的短句不算格言", "STR-03" not in ids(F))

# ── STR-04 描述性 instead 不构成异常（曾误判第14篇）─────────────────
print("\n[STR-04] 描述性 instead 不算异常（曾误判第14篇）")
F, _ = I.inspect(art(["The **pack** squeezed her upward instead of inward.",
                      "**B**.", "**C**.", "**D**.",
                      "They had expected a shallow floor."]), arts)
check("instead 用于对照时不触发前提检查", "STR-04" not in ids(F))

# ── GLO-01 释义写成英文（曾 98 处静默通过）──────────────────────────
print("\n[GLO-01] 释义写成英文必须报硬伤（曾 98 处静默通过）")
F, _ = I.inspect(art(["**blamed** it."] + ["**b%d**." % i for i in range(4)],
                     gloss=[{"w": "blamed", "zh": "blamed", "p": 1}] +
                           [{"w": "b%d" % i, "zh": "占位", "p": i + 2} for i in range(4)]), arts)
check("zh 字段是英文 → GLO-01", "GLO-01" in ids(F))

# ── GLO-02 条目错位；但不规则动词与常规还原不得误报 ─────────────────
print("\n[GLO-02] 条目错位要报，正常词元还原不得误报（曾 270 处错位）")
F, _ = I.inspect(art(["**alpha** and **beta**.", "**c**.", "**d**.", "**e**.", "**f**."],
                     gloss=[{"w": "beta", "zh": "乙", "p": 1}, {"w": "alpha", "zh": "甲", "p": 1}] +
                           [{"w": x, "zh": "占位", "p": i + 2} for i, x in enumerate("cdef")]), arts)
check("次序颠倒 → GLO-02", "GLO-02" in ids(F))
for lemma, surf in (("draw", "drew"), ("sink", "sunk"), ("fade", "fading"),
                    ("strike", "struck"), ("break", "broken")):
    F, _ = I.inspect(art(["**%s** it." % surf] + ["**b%d**." % i for i in range(4)],
                         gloss=[{"w": lemma, "zh": "占位", "p": 1}] +
                               [{"w": "b%d" % i, "zh": "占位", "p": i + 2} for i in range(4)]), arts)
    check(f"{lemma}/{surf} 不误报", "GLO-02" not in ids(F))

# ── ZH-02 一个中文词被拆成两个名额 ────────────────────────────────
print("\n[ZH-02] 一个中文词被拆成两个名额（追授 / 骤跌 / 摇轮）")
F, _ = I.inspect(art(["It was **awarded** **posthumously**.", "**b**.", "**c**.", "**d**.", "**e**."],
                     paras_zh=["它被**追**(awarded)**授**(posthumously)。", "占位。", "占位。", "占位。", "占位。"]), arts)
check("追授被拆 → ZH-02", "ZH-02" in ids(F))

# ── FACT-01 正文数字须在核对中有出处 ──────────────────────────────
print("\n[FACT-01] 正文数字必须有出处")
F, _ = I.inspect(art(["It lost 5.1 seconds over 81 days: **alpha**.",
                      "**b**.", "**c**.", "**d**.", "**e**."],
                     facts=["航程共81天。"]), arts)
check("5.1 无出处 → FACT-01", "FACT-01" in ids(F))
F, _ = I.inspect(art(["It lost 5.1 seconds over 81 days: **alpha**.",
                      "**b**.", "**c**.", "**d**.", "**e**."],
                     facts=["81天航程中慢了5.1秒。"]), arts)
check("有出处则不报", "FACT-01" not in ids(F))

# ── agent 的同族判定（曾漏 occurrence/occurrences）──────────────────
print("\n[agent.kin] 同族词判定（曾漏 occurrence/occurrences 致入库后才发现冲突）")
for x, y in (("occurrence", "occurrences"), ("confirm", "confirmation"),
             ("return", "returns"), ("seasonal", "season")):
    check(f"{x} ~ {y}", A.kin(x, y))
for x, y in (("basalt", "basin"), ("vent", "vault"), ("clock", "cloak")):
    check(f"{x} ≁ {y}", not A.kin(x, y))

# ── 词价阈值（曾把范文的合格词判成白送）────────────────────────────
print("\n[VAL-01] 词价阈值不得把承重词判成白送")
for w in ("basalt", "fissure", "shield", "alpha", "encounter"):
    check(f"{w} 非白送", I.cheapness(w)[0] != "cheap")
for w in ("return", "support", "deep"):
    check(f"{w} 判白送", I.cheapness(w)[0] == "cheap")

# ── SYN 句法层（spaCy）────────────────────────────────────────────
print("\n[SYN] 句法层（spaCy 真解析）")
if I.NLP is None:
    print("  ⚠ spaCy 未安装，跳过（pip install spacy + en_core_web_sm）")
else:
    F, _ = I.inspect(art(["The **discovery** changed things.", "**b**.", "**c**.", "**d**.", "**e**."]), arts)
    check("抽象名词作主语 → SYN-04", "SYN-04" in ids(F))
    F, _ = I.inspect(art(["Marsden **counted** flashes.", "**b**.", "**c**.", "**d**.", "**e**."]), arts)
    check("具体人物作主语不报", "SYN-04" not in ids(F))
    # 带 by 施事的被动是有意为之，不计入过量
    F, _ = I.inspect(art(["The circular was **signed** by Pickering.",
                          "It was **read** by many.", "It was **kept** by few.",
                          "It was **held** by one.", "It was **seen** by all."]), arts)
    check("带 by 施事的被动不计过量", "SYN-01" not in ids(F))
    F, _ = I.inspect(art(["It was **done**.", "It was **made**.", "It was **kept**.",
                          "It was **sent**.", "It was **lost**."]), arts)
    check("无施事被动过量 → SYN-01", "SYN-01" in ids(F))

# ── 阈值必须来自真实语料，不得拍脑袋 ────────────────────────────────
print("\n[基准] 阈值来自 data/reference/prose-profile.json")
import json as _j, os as _o
prof = _j.load(open(_o.path.join(ROOT, "data/reference/prose-profile.json"), encoding="utf-8"))
check("参照档案存在且注明来源", "Brown" in prof["source"])
check("被动上限高于语料实测（曾定 15%，语料是 22.4%）",
      I.PASSIVE_MAX > prof["passive_pct"], f"{I.PASSIVE_MAX} vs {prof['passive_pct']}")
check("长句上限不严于语料（语料 12.9% 的句子超 34 词）", I.LONG_SENT >= 40, I.LONG_SENT)

# ── 质量回归守卫：抓的是「合规但变差」，绝对规则查不出的那一类 ──────
print("\n[REG] 质量回归守卫（差分检查）")
import importlib.util as _il
_sp = _il.spec_from_file_location("regress", _o.path.join(ROOT, "scripts/regress.py"))
_rg = _il.module_from_spec(_sp)
try:
    _sp.loader.exec_module(_rg)
    _has = True
except SystemExit:
    _has = True
except Exception as _e:
    _has = False
    print(f"  ⚠ 无法载入 regress.py：{_e}")
if _has:
    _C = _rg.load_colloc()
    check("搭配库已入库", _C is not None and len(_C["bi"]) > 10000)
    if _C:
        check("一元表覆盖改动可能引入的新词（wore 有频次）", _C["uni"].get("wore", 0) > 0,
              "一元表若只含本篇词汇，新引入的词查不到频次，REG-09 会静默漏报")
        check("语料确实收录常见搭配（human skull）",
              _C["bi"].get("human skull", 0) > 0 or _C["uni"].get("skull", 0) > 0)
    # 标题锚检查：删掉标题里的词必须报警
    _fake = {"id": "99", "title": "The Missing Anchor", "standfirst": "",
             "metrics": {"words": 10},
             "paras": [{"en": "A **cat** sat.", "zh": "占"} for _ in range(5)]}
    _p = _rg.profile(_fake)
    check("标题实词不在正文 → 被记录", "missing" in _p["title_lost"] and "anchor" in _p["title_lost"])
    # REG 层必须在检察官内部，不能只存在于独立脚本
    _src = open(_o.path.join(ROOT, "scripts/inspector.py"), encoding="utf-8").read()
    check("REG 层已并入检察官（非独立程序）",
          "import regress" in _src and "REG-" not in _src.split("def inspect")[0],
          "用户明确要求并入检察官；若退回独立脚本，跑 inspector 时会漏查回归")

print("=" * 62)
print(f"通过 {ok} · 失败 {fail}")
sys.exit(1 if fail else 0)
