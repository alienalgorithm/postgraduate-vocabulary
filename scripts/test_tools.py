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

# ── VAL-09：过专业的行话词 ──────────────────────────────────────
print("\n[VAL-09] 行话词")
_jg = art(["**a**."]*5)
_jg["glossary"] = [{"w": "sulphonamide", "zh": "磺胺基", "p": 1}]
_F, _ = I.inspect(_jg, arts)
check("行话词 → VAL-09", "VAL-09" in ids(_F),
      "考研词汇表里没有 sulphonamide(0.0)、tomogram(1.1) 这类词")
_hy = art(["**a**."]*5)
_hy["glossary"] = [{"w": "test-tube", "zh": "试管", "p": 1}]
_F2, _ = I.inspect(_hy, arts)
check("连字符复合词不误判", "VAL-09" not in ids(_F2),
      "wordfreq 查不到 test-tube/fourth-floor，返回 0.0 是查询失败不是行话")

# ── VAL-10：动词短语的小品词不得单独占名额 ──────────────────────
print("\n[VAL-10] 动词短语")
_pv = art(["They took the parts **apart** here."] + ["**b%d**." % i for i in range(4)])
_F, _ = I.inspect(_pv, arts)
check("小品词单独加粗 → VAL-10", "VAL-10" in ids(_F),
      "take apart 本是一个短语，拆开学没意义")
_ok2 = art(["They **dismantled** the compound here."] + ["**b%d**." % i for i in range(4)])
_F2, _ = I.inspect(_ok2, arts)
check("换成完整动词后不报", "VAL-10" not in ids(_F2))

# ── VAL-11：专名与数词不得占名额 ──────────────────────────────
print("\n[VAL-11] 专名与数词")
_pn = art(["**a**."]*5); _pn["glossary"] = [{"w": "Halley", "zh": "哈雷", "p": 1}]
check("专名占名额 → VAL-11", "VAL-11" in ids(I.inspect(_pn, arts)[0]),
      "人名地名背不走，占名额纯属浪费")
_nm = art(["**a**."]*5); _nm["glossary"] = [{"w": "sixty-five", "zh": "六十五", "p": 1}]
check("数词占名额 → VAL-11", "VAL-11" in ids(I.inspect(_nm, arts)[0]),
      "拼写出来的数词考研不会考")
_ok3 = art(["**a**."]*5); _ok3["glossary"] = [{"w": "loophole", "zh": "空子", "p": 1}]
check("通用词不误判", "VAL-11" not in ids(I.inspect(_ok3, arts)[0]))

# ── VAL-12：过于简单的词 ────────────────────────────────────────
print("\n[VAL-12] 过于简单的词")
_sp = art(["**a**."]*5); _sp["glossary"] = [{"w": "eleven", "zh": "十一", "p": 1}]
check("初中词占名额 → VAL-12", "VAL-12" in ids(I.inspect(_sp, arts)[0]),
      "eleven／clean／drink 考研与雅思都不会考")
_sp2 = art(["**a**."]*5); _sp2["glossary"] = [{"w": "winter", "zh": "冬天", "p": 1}]
check("winter 亦判过简", "VAL-12" in ids(I.inspect(_sp2, arts)[0]))
_ok4 = art(["**a**."]*5); _ok4["glossary"] = [{"w": "nuance", "zh": "细微差别", "p": 1}]
check("同频的 nuance 不误判", "VAL-12" not in ids(I.inspect(_ok4, arts)[0]),
      "**词频判不出这一层**：eleven(4.1) 与 nuance(4.1) 频率相同，价值不同")


# ── PRO-01：指代逐个报位（雷 19）──────────────────────────────────
# 立此测之由：全库极限轮翻案 21 处里指代占 10 处，
# 而此前只有 STR-05 查句首代词，句中的一概漏掉。
print("\n[PRO-01] 指代逐个报位")
_pr = art(["Inuit hunters found her remnants on the shore. They had travelled frozen into the drift. "
           "The wreckage lay there for years and nobody moved it at all in that time."])
check("句中代词被报出 → PRO-01", "PRO-01" in ids(I.inspect(_pr, arts)[0]),
      "极限轮 10 处指代翻案全在句中，STR-05 只查句首")
_pr2 = art(["A slow gale crossed the sea and wrecked the fleet. Eight hundred people died that night. "
            "The harbour lay empty for a week and the boats never came back to the town."])
check("无代词不误报", "PRO-01" not in ids(I.inspect(_pr2, arts)[0]))
check("PRO-01 已挂铁律", I.charter_of("PRO-01")[0] if I.charter_of("PRO-01") else False,
      "没挂铁律的规则 = 不知道它在执行什么")

# ── 台账套话闸门（雷 9，已犯三次）────────────────────────────────
print("\n[雷9] 台账套话闸门")
import importlib
_pl = importlib.import_module("polish")
check("同一段模板换轮号 → 判为套话",
      _pl._overlap("第1轮：十五层逐条判，硬伤0。六查全清：太常见0／太生僻0／小品词0。",
                   "第5轮：十五层逐条判，硬伤0。六查全清：太常见0／太生僻0／小品词0。") >= 0.60,
      "已犯三次：清掉 141 笔、8 笔、57 笔")
check("真结论各异 → 不误判",
      _pl._overlap("§3 那句 convened on 是生造搭配，已改 sat to scrutinise。",
                   "§5 apiece 是分配义用错了，已改 outright。") < 0.60)
check("polish.py 装了闸门", "check_boilerplate" in open(
      os.path.join(ROOT, "scripts/polish.py"), encoding="utf-8").read(),
      "提示词写了三次仍三次犯，故必须是闸门而非规则")


# ── PHR-01/02/03：短语名额（2026-08-20 立）──────────────────────
# 立此测之由：许短语占名额，是把 50 个名额从「挑单词」升到「挑最好的语言单位」。
# 但闸门必须同时立起来，否则随手两个词粘一起也能占名额。
print("\n[PHR] 短语名额")
_ph = art(["The board **gave way to** pressure from the ports and restored the service. "
           "Members pressed the case for a week in every session that winter. "
           "The record shows that nobody argued the other way at all."],
          ["理事会**让位于**(gave way to)各港口的压力，恢复了这项业务。"
           "议员整整一周在每一场会上力陈此事。记录显示当时无人持相反意见。"])
check("库内短语不报错", "PHR-01" not in ids(I.inspect(_ph, arts)[0]),
      "gave way to 在 phrase-wordlist.txt 内")
_ph2 = art(["The board **heard the** pressure from the ports and restored the service. "
            "Members pressed the case for a week in every session that winter. "
            "The record shows that nobody argued the other way at all."],
           ["理事会**听到了**(heard the)各港口的压力，恢复了这项业务。"
            "议员整整一周在每一场会上力陈此事。记录显示当时无人持相反意见。"])
check("随手粘两个词 → PHR-01", "PHR-01" in ids(I.inspect(_ph2, arts)[0]),
      "整体义须偏离逐词义；否则不配占一个名额")
check("PHR 三条已挂铁律",
      all(I.charter_of(r) for r in ("PHR-01", "PHR-02", "PHR-03")),
      "没挂铁律的规则 = 不知道它在执行什么")
_phl = {l.strip() for l in open(os.path.join(ROOT, "data/reference/phrase-wordlist.txt"),
                                encoding="utf-8") if l.strip() and not l.startswith("#")}
check("短语库非空且全为多词", _phl and all(" " in p for p in _phl),
      "单词不该进短语库——它走的是另一条路")
check("polish.py 第6轮已升为七查",
      "未升格" in open(os.path.join(ROOT, "scripts/polish.py"), encoding="utf-8").read(),
      "检察官与跑轮必须同时认这条新规")


# ── 功率计（2026-08-20 立）─────────────────────────────────────
# 立此测之由（全库 341 轮次实测）：第13轮产出率 94%、第9轮 63%，
# **其余十一轮全在 4%—39%**——第3轮 4%、第12轮 5%、第10轮 6%。
# 机器此前只查「有没有记账」，查不出「这一轮使了几成力」。
print("\n[功率计] 一轮使了几成力")
import importlib
_pl2 = importlib.import_module("polish")
_lo = "第3轮：四处接缝成立；中文无单字硬凑；抽象主语零。"
_hi = ("**开工四问**：\u2460要查接缝；\u2461应说得出靠什么接；\u2462没对读；\u2463对读确认。"
       "**抓出一处**：\u00a72 末句 showed him 两次，改前\u2192改后 vindicated，因为句内复读。"
       "另 \u00a74 逐个走五问后判为保留。")
check("走过场的备注 → 功率不及格", _pl2.power_of(_lo)[0] < _pl2.POWER_FLOOR,
      "一轮跑到三四成就交差，等于这一轮没跑")
check("真跑的备注 → 功率满分", _pl2.power_of(_hi)[0] >= 11)
check("polish.py 装了功率计", "check_power" in open(
      os.path.join(ROOT, "scripts/polish.py"), encoding="utf-8").read())

# ── 弱轮换判据 ────────────────────────────────────────────────
print("\n[弱轮] 第3/10/12轮已换判据")
for _n, _kw2 in ((3, "更好的写法作对照"), (10, "读者会误解成什么"), (12, "候选刀单")):
    check(f"第{_n}轮判据已从「查对不对」改为「逼出比较」", _kw2 in _pl2.ROUNDS[_n][1],
          "产出率 4—6% 是因为它只问有没有问题，不问最好能到什么样子")

# ── 改动回扫 ──────────────────────────────────────────────────
# 立此测之由：十三处翻案里**七处是我自己改动引入的**。
print("\n[回扫] 改动本身是新的风险源")
_rs = open(os.path.join(ROOT, "scripts/rescan.py"), encoding="utf-8").read()
check("rescan.py 存在且扫五样", all(k in _rs for k in
      ("代词", "主语没被新信息挤掉", "同物两名", "句内重复", "新称呼")),
      "五样都是实测栽过的：第21/22/35/09/11 篇")
check("回扫用 git 取上一版", "git" in _rs and "HEAD:" in _rs,
      "快照存的是画像不是原文")


# ── DEN-01：信息密度（2026-08-20 立）──────────────────────────
# 立此测之由：跑轮此前只有「指代」一族眼睛——十三处翻案全出自那一族。
# 加这一族之前量过四个判据，三个被数据否掉：
#   数硬事实（零事实的句子里全是好句）／数新实词（中位数100%）／空评价句（全库0句）。
# 只有「句内无数字却用量级形容词」量出了真东西。
print("\n[DEN-01] 信息密度 · 形容词代替数字")
_dn = art(["The plague struck the port in autumn and left many survivors marked for life. "
           "Officials counted the dead each morning and buried them beyond the wall. "
           "The register they kept became the only record anyone could later consult."])
check("量级形容词而句内无数 → DEN-01", "DEN-01" in ids(I.inspect(_dn, arts)[0]),
      "写作规范 §3.2 给数字，不给形容词")
_dn2 = art(["The plague struck the port in autumn and marked two-thirds of the survivors. "
            "Officials counted the dead each morning and buried them beyond the wall. "
            "The register they kept became the only record anyone could later consult."])
check("换成数字后不再报", "DEN-01" not in ids(I.inspect(_dn2, arts)[0]))
_dn3 = art(["High pressure favoured the reaction and heat hastened it beyond all reckoning. "
            "Officials counted the dead each morning and buried them beyond the wall. "
            "The register they kept became the only record anyone could later consult."])
check("术语搭配 high pressure 不误报", "DEN-01" not in ids(I.inspect(_dn3, arts)[0]),
      "全库18处里十七处是术语搭配或专名，故本层只提示不计硬伤")
check("DEN-01 已挂铁律", bool(I.charter_of("DEN-01")))


# ── 功率计 · 彻底否决项（2026-08-20 补）─────────────────────────
# 立此补之由（全库 352 轮次实测）：**30 轮（9%）是「查过而全部判为保留」**，
# 它们在原判据下永远拿不到「有真产出」那 3 分——
# 可总令第四节明写：判「无处可升格」「不落刀」是**正当结论**。判据有缺口。
# 但门槛要够高：须逐处点名并给出保留的代价，否则「都没问题」四个字也能骗到分。
print("\n[功率计] 彻底否决项")
_rej = ("**开工四问**：\u2460\u2026\u2461\u2026\u2462\u2026\u2463\u2026。"
        "**逐处判为保留**：\u00a72 三个状语因为三十分钟会丢，不落刀；"
        "\u00a73 逐句比过后判为保留，因为是同一事实两面。改前\u2192改后无。")
_lazy = "**开工四问**：\u2460\u2026\u2461\u2026\u2462\u2026\u2463\u2026。都没问题，全部保留。"
check("逐处点名否决 → 满功率", _pl2.power_of(_rej)[0] >= 11,
      "零产出但逐处查过，是正当结论")
check("笼统说「都没问题」→ 不及格", _pl2.power_of(_lazy)[0] < _pl2.POWER_FLOOR,
      "否则四个字就能骗到分")


# ── GRA-01：冠词与数不一致（2026-08-20 立）────────────────────
# 立此测之由：**语法完整性已犯到第三次**——
#   第10篇 several 后缺名词／第23篇 rejected X was Y／第34篇 a second grounds。
# 而第11轮只写「查语法完整性」，**没有任何一条机器规则在查**。
# 立层之前量过三个判据，两个被否：分句无限定动词（68处，前十条全是好句）／
# 分号前半有谓语后半没有（2处，都是检测器漏判）。只有第三个零误报。
print("\n[GRA-01] 冠词与数不一致")
_ga = art(["Halley added a second grounds for the choice and set the London bills aside. "
           "The town was small and stable, with little migration in either direction. "
           "A cleric had kept the annals, and they gave the age at death for each entry."])
check("a + 复数名词 → GRA-01", "GRA-01" in ids(I.inspect(_ga, arts)[0]),
      "a/an 只配单数；grounds 本就是复数形态")
_ga2 = art(["Halley had second grounds for the choice and set the London bills aside. "
            "The town was small and stable, with little migration in either direction. "
            "A cleric had kept the annals, and they gave the age at death for each entry."])
check("去掉冠词后不再报", "GRA-01" not in ids(I.inspect(_ga2, arts)[0]))
_ga3 = art(["The analysis rested on a series of parish annals kept by one cleric alone. "
            "The town was small and stable, with little migration in either direction. "
            "A census gave the age at death for every entry that the register recorded."])
check("a series／a census 不误报", "GRA-01" not in ids(I.inspect(_ga3, arts)[0]),
      "series／census 本就是单数形态，须在白名单内")
check("GRA-01 已挂铁律", bool(I.charter_of("GRA-01")))


# ── VAL-02h：普通义白送词升为硬伤（2026-08-20 立）──────────────
# 立此分级之由：VAL-02 是提示级，**拦不住**——全库实测仍有 9 个普通义白送词
# 占名额（pick／list／bank／test／hold／rest／mark／built／followed），分布 7 篇；
# **而 followed 正是上一轮在第34篇亲手换进去的，换的时候没查 Zipf。**
# 直接升硬伤会误伤术语（bit 是信息论本词），故分级：
# **多词短语与连字符复合词免判，术语白名单免判，其余单词普通义拦为硬伤。**
print("\n[VAL-02h] 普通义白送词")
_vh = art(["The chemists **built** a **scarlet** dye that clung to wool and would not wash out. "
           "Her father worked at the works and brought a sample home for the family. "
           "The colour outlasted every rival on the market for a decade or more."])
check("普通义白送词 built → VAL-02h", "VAL-02h" in ids(I.inspect(_vh, arts)[0]),
      "built(5.07) 是普通义，考研生早已掌握")
_vh2 = art(["The chemists **concocted** a **scarlet** dye that clung to wool and would not wash out. "
            "Her father worked at the works and brought a sample home for the family. "
            "The colour outlasted every rival on the market for a decade or more."])
check("换掉后不再报", "VAL-02h" not in ids(I.inspect(_vh2, arts)[0]))
check("VAL-02h 已挂铁律", bool(I.charter_of("VAL-02h")))


# ── rescan 改法规矩（2026-08-20 立）───────────────────────────
# 立此规矩之由：「把无铺垫代词换成无铺垫名词」**已犯到第三次**——
#   第23篇 the claimant／第25篇 the intake／第24篇 the girder。
# **三次全靠 rescan 事后拦下，而三次的正解完全一致**：
#   不要另造名词，用前文已经立住的那个词；前文没有就回到前一句把它具名。
# **这不是判据缺（rescan 已能报出），是改法缺规矩**，故写进 rescan 的提示里。
print("\n[rescan] 改法规矩")
_rs2 = open(os.path.join(ROOT, "scripts/rescan.py"), encoding="utf-8").read()
check("报出新称呼时同时给出改法", "用前文已经立住的那个词" in _rs2,
      "只报问题不给改法，同一个错法会犯第四次")
check("改法附三次实测出处", all(k in _rs2 for k in ("claimant", "intake", "girder")),
      "规矩须带实例，否则读的人不知道它从哪来")


# ── 已废签名表不许存指标串（2026-08-20 立）─────────────────────
# 立此测之由：**已犯两次**——第02篇某旧版恰为 271词/18.5%，改完又回到同一数值，
# 被误判「退回旧版」；**本轮第18篇 269词/18.6% 又撞上同一颗雷**。
# 指标是会重复的（词数密度就那么些组合），**只有正文句子才能识别版本**。
print("\n[废版表] 不许存指标串")
_fv = open(os.path.join(ROOT, "scripts/final-version-guard.js"), encoding="utf-8").read()
_bad = re.findall(r"'\d+ 词 / \d+ 重点词[^']*'", _fv)
check("废版表里无指标串", not _bad,
      f"指标会重复，只有正文句子能识别版本；命中：{_bad[:3]}")


# ── VAL-13 篇内词元重复（2026-08-20 立）─────────────────────────
# 立此层之由：**VAL-07 只查跨篇词元重复，篇内只比表面形式**——
#   assay ≠ assayed、root ≠ roots，就这么放过去了。
# **先量**：全库 13 个名额被同词元占掉，分布 9 篇。
#   纯屈折（单复数／时态）第二个零教学价值；派生（transmitter/transmitting）尚可辩护，
#   故本层为**提示级**，由人逐对判。
print("\n[VAL-13] 篇内同一词元占两个名额")
_v13 = art(["The **magnet** turned in the coil and the current rose at once. "
            "Two **magnets** were mounted facing one another on the frame. "
            "The reading held steady through the whole of that afternoon."])
check("同词元两次 → VAL-13", "VAL-13" in ids(I.inspect(_v13, arts)[0]),
      "magnet/magnets 占了两个名额，第二个零教学价值")
_v13b = art(["The **magnet** turned in the coil and the current rose at once. "
             "Two **armatures** were mounted facing one another on the frame. "
             "The reading held steady through the whole of that afternoon."])
check("换掉后不再报", "VAL-13" not in ids(I.inspect(_v13b, arts)[0]))
check("VAL-13 已挂铁律", bool(I.charter_of("VAL-13")))


# ── MET-09 速查表释义与正文括注错位（2026-08-20 立）──────────────
# 立此层之由：**MET-07/08 只查「加粗英文词在中文里有没有一条对应括注」，
#   括注在不在它查，落得对不对它不查。**
# 逐条验义项时发现第04篇速查表连着十二条挂着**下一个词**的意思——
#   学习者查 commissioners，查到的是 balked 的「迟疑；退缩」。
# **先量**：全库 22 条真错位（04篇12／24篇4／32篇6），正文括注全对、错的只是表。
# **判据废掉两个才定住**：①「本条括注落在邻条释义上」→ 误收措辞变体；
#   ②「括注不足三字就跳过」→ **中文括注多是两字词，真错位全被滤掉**。
#   定住的形状：**本条的释义，其实是邻条那个词的括注。**
print("\n[MET-09] 速查表释义与正文括注错位")
_P9 = [{"en": "The **commissioners** met, the board **balked**, and Nevil **championed** it.",
        "zh": "**评审委员**(commissioners)开了会，委员会**迟疑**(balked)，而内维尔**力主**(championed)。"}]
_b9 = art([_P9[0]["en"]], [_P9[0]["zh"]],
          gloss=[{"w": "commissioners", "zh": "迟疑；退缩", "p": 1},
                 {"w": "balked", "zh": "力主；拥护", "p": 1},
                 {"w": "championed", "zh": "观测", "p": 1}])
check("整条错位 → MET-09", "MET-09" in ids(I.inspect(_b9, arts)[0]),
      "表内挂的是下一个词的意思，学习者查表会查到别的词")
_g9 = art([_P9[0]["en"]], [_P9[0]["zh"]],
          gloss=[{"w": "commissioners", "zh": "专员（复）；委员", "p": 1},
                 {"w": "balked", "zh": "迟疑；退缩", "p": 1},
                 {"w": "championed", "zh": "力主；拥护", "p": 1}])
check("改对后不再报", "MET-09" not in ids(I.inspect(_g9, arts)[0]))
_v9 = art(["He **lingered** months **awaiting** word."],
          ["他**等**(lingered)了几个月，**等**(awaiting)消息。"],
          gloss=[{"w": "lingered", "zh": "逗留；耽搁", "p": 1},
                 {"w": "awaiting", "zh": "等待", "p": 1}])
check("措辞变体不误报", "MET-09" not in ids(I.inspect(_v9, arts)[0]),
      "正文用更短的语境译法，本条其实是对的")
check("MET-09 已挂铁律", bool(I.charter_of("MET-09")))

print("=" * 62)
print(f"通过 {ok} · 失败 {fail}")
sys.exit(1 if fail else 0)
