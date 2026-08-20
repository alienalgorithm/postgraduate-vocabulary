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

# ── 共享核心：文本基本解释只能有一份实现 ────────────────────────────
print("\n[CORE] 共享核心（防止同一算法被抄成多份而各自漂移）")
import core as _core
check("core.py 存在且可导入", hasattr(_core, "count_words"))
# 三个工具都必须 import，不得自带实现
for _f in ("inspector", "agent", "regress"):
    _src = open(_o.path.join(ROOT, f"scripts/{_f}.py"), encoding="utf-8").read()
    _own = re.search(r"^def count_words\(", _src, re.M)
    _imp = "from core import" in _src or "import core" in _src
    check(f"{_f}.py 引用 core 而非自带实现", _imp and not _own,
          "count_words 曾被抄进三个文件；一处改了另两处不改，会出现"
          "「草稿说270词、入库说272词」这种极难查的不一致")
# 语义正确性
check("count_words 剥离加粗", _core.count_words("**a** b c") == 3)
check("count_words 忽略纯标点单元", _core.count_words("a b — c") == 3)
check("metrics 与 count_words 一致",
      _core.metrics([{"en": "**one** two three"}])["words"] == 3)
check("annotations 按括注取键而非按位置",
      _core.annotations("住在**附近**(nearby)的**内科医生**(physician)")
      == [("附近", "nearby"), ("内科医生", "physician")],
      "中英语序天然不同，按位置配对会整体串位——曾造成 270 处错位")

# ── 不得存在外部词汇表的任何痕迹 ────────────────────────────────
print("\n[VOCAB] 不得存在外部词汇表")
import subprocess as _sp
# 只查活代码与配置；notes/ 下的历史记录与铁律说明允许提及（那是留痕，不是使用）
_hit = _sp.run(["grep", "-rn", "-e", "vocabTotal", "-e", "新东方", "-e", "乱序版",
                "--include=*.js", "--include=*.html", "--include=*.yml",
                "data", "assets", "scripts", ".github", "."],
               capture_output=True, text=True).stdout
_bad = [l for l in _hit.splitlines()
        if "node_modules" not in l and "test_tools" not in l and "/notes/" not in l]
check("全库无外部词汇表痕迹", not _bad,
      "文章质量优先于选词：绝不从词表取词。首个命中：" + (_bad[0][:80] if _bad else ""))

# ── SRC 层：事实必须带得出来源 ──────────────────────────────────
print("\n[SRC] 事实来源层")
_f_nolink = art(["**a**."]*5, facts=["1974年首次扫描发生在俄亥俄州特洛伊。"])
_F, _ = I.inspect(_f_nolink, arts)
check("无链接的史实 → SRC-01", "SRC-01" in ids(_F),
      "本层不判真假，只逼出「这条核过没有」——第05篇末句错在史密森藏品，"
      "而那条 facts 当时正好没有链接")
_f_link = art(["**a**."]*5,
              facts=["1974年首次扫描发生在俄亥俄州特洛伊。[来源](https://example.org/x)"])
_F2, _ = I.inspect(_f_link, arts)
check("有链接则不报", "SRC-01" not in ids(_F2))

# ── 词数不许整十、分布不许过窄 ────────────────────────────────────
print("\n[WORDS] 词数指纹")
_w = [x["metrics"]["words"] for x in arts]
# **不检查「整十」。** 词数落在哪里由减法轮决定；
# 为脱离整十而削一个词，与为贴上限而停手，同样是凑数。
check("词数落在 249—271", all(249 <= x <= 271 for x in _w))
import statistics as _st
# **不设「分布跨度」下限。** 那样会制造凑数压力——为让跨度变大就得把某篇撑长或削狠，
# 而那正是第零条铁律禁止的：指标反过来指挥文章。
# 差异只能是削出来的，不是分配的：每篇跑减法轮，落在自己该落的地方。
print(f"     词数分布：{sorted(set(_w))}（仅供观察，不设阈值）")

# ── FIT 层：重点词是不是硬塞的 ────────────────────────────────────
print("\n[FIT] 重点词硬塞检测（铁律第零条之三）")
# 长句里五六个加粗是本体裁常态，不得误报
_ok = art(["The **survey** had **measured** total-column **ozone** since 1956 with a "
           "**Dobson** **spectrophotometer**, a prism **instrument** weighing rays."] + ["**b%d**." % i for i in range(4)])
_F, _ = I.inspect(_ok, arts)
check("长句多加粗不误报（本体裁常态）", "FIT-02" not in ids(_F),
      "50 词分在 16—19 句，均值本就约 3 个；按个数判会淹没真问题，须按密度判")
# 短句塞满才报
_bad = art(["**Alpha** **beta** **gamma** **delta** **epsilon** ran."] + ["**b%d**." % i for i in range(4)])
_F2, _ = I.inspect(_bad, arts)
check("短句塞满 → FIT-02", "FIT-02" in ids(_F2))
# 副词＋形容词连用
_adv = art(["They were **equally** **probable** here."] + ["**b%d**." % i for i in range(4)])
_F3, _ = I.inspect(_adv, arts)
check("副词＋形容词连着加粗 → FIT-03", "FIT-03" in ids(_F3),
      "副词最容易被塞进来凑名额")

# ── 铁律映射：规则与铁律条款必须对得上 ──────────────────────────
print("\n[CHARTER] 铁律 ↔ 规则映射")
_cm = _j.load(open(_o.path.join(ROOT, "data/reference/charter-map.json"),
                   encoding="utf-8"))["clauses"]
_src = ""
for _f in ("scripts/inspector.py", "scripts/regress.py"):
    _src += open(_o.path.join(ROOT, _f), encoding="utf-8").read()
_dead = [(k, r) for k, v in _cm.items() for r in v.get("rules", [])
         if f'"{r}"' not in _src]
check("映射里的规则都真实存在", not _dead,
      "映射到不存在的规则 = 铁律以为有人在管，其实没有。命中：" +
      "、".join(f"{k}:{r}" for k, r in _dead[:3]))
_ids = set(re.findall(r'Finding\("([A-Z]+-\d+[a-z]?)"', _src))
_mapped = {r for v in _cm.values() for r in v.get("rules", [])}
_orphan = sorted(_ids - _mapped)
check("每条规则都挂在某条铁律下", not _orphan,
      "没挂铁律的规则 = 不知道它在执行什么。命中：" + "、".join(_orphan[:5]))

# ── AUD 层：高产审读项做了没有 ────────────────────────────────
print("\n[AUD] 审读进度层")
_no = art(["**a**."]*5, facts=["1969年首次扫码。"])
_F, _ = I.inspect(_no, arts)
check("史实无「已核」标注 → AUD-01", "AUD-01" in ids(_F),
      "史实核查是抓到问题最多的一条（11/26）")
_yes = art(["**a**."]*5, facts=["1969年首次扫码。**已核**：[来源](https://example.org/x)"])
_F2, _ = I.inspect(_yes, arts)
check("标注「已核」后不报", "AUD-01" not in ids(_F2))

# ── polish 十三轮：结构完整且每轮可跑 ────────────────────────────
print("\n[POLISH] polish 十三轮")
import ast as _ast, subprocess as _sp2
_ps = open(_o.path.join(ROOT, "scripts/polish.py"), encoding="utf-8").read()
try:
    _ast.parse(_ps); _synok = True
except SyntaxError as _e:
    _synok = False
check("polish.py 语法正确", _synok,
      "曾因把多行文本插进 print() 而语法崩溃，立即 git checkout 回滚")
check("十三轮全在 ROUNDS 表里", all(f"{i}: (" in _ps for i in range(1, 14)))
check("GEN 映射覆盖十三轮", all(f"{i}: r{i}" in _ps for i in range(1, 14)))
# 每一轮的材料都能跑出来，不报错
_bad = []
for _i in range(1, 14):
    _r = _sp2.run(["python3", "scripts/polish.py", "01", "round", str(_i)],
                  capture_output=True, text=True, cwd=ROOT, timeout=60)
    if _r.returncode != 0 or "Traceback" in _r.stderr:
        _bad.append(str(_i))
check("十三轮材料逐轮可跑无异常", not _bad, "报错轮次：" + "、".join(_bad))
check("第2轮判据已改（看句与句，不看隔几段）", "下一句接住了吗" in _ps,
      "旧判据「回报隔两段」在 24 篇里零产出")
check("第7轮抽象主语判据带例外表", "这句话说的是一个类，还是一件事" in _ps,
      "24 篇里有五处正当例外，句意讲类概念时抽象主语是对的")
check("第11轮含语法完整性一项", "语法完整性" in _ps,
      "第10篇 several 后缺名词，十五层规则全没抓到")
check("第13轮写死了时间间隔条件", "须隔一次会话再跑" in _ps,
      "同场连跑等于自欺——理由还在脑子里")

print("=" * 62)
print(f"通过 {ok} · 失败 {fail}")
sys.exit(1 if fail else 0)
