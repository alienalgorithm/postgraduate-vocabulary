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
# ★ 窗口由 ±1 放宽到 ±3（2026-08-20）：138 条人判后 7 条真错，
#   全是「挂上附近某个名词的意思」，而 ±1 只逮到一部分。
_w9 = art(["The strokes **gathered** at the pump, then **thinned** to nothing, "
           "and the **blocks** beyond stayed clear of it entirely. "
           "Every household there drew water from a different source."],
          ["笔画在水泵旁**聚拢**(gathered)，随后**稀疏**(thinned)下去，"
           "再往外的**片区**(blocks)一处也没有。那里每家取水的来处都不同。"],
          gloss=[{"w": "gathered", "zh": "片区；街区（复）", "p": 1},
                 {"w": "thinned", "zh": "聚拢", "p": 1},
                 {"w": "blocks", "zh": "片区；街区（复）", "p": 1}])
check("隔位挂错也报出（窗口 ±3）", "MET-09" in ids(I.inspect(_w9, arts)[0]),
      "gathered 挂着两位之后 blocks 的意思，±1 的窗口逮不到")


# ── 功率计按实测重配（2026-08-20）────────────────────────────
# 改此之由：旧配法下 **503 轮次里 62% 低于 9 分、中位数 6，而下限正是 6**——
#   一半的轮次刚好压线通过，功率计没起到分档作用。
# 逐项量「低分轮的命中率」，区分度差一个数量级：
#   彻底否决 0%（最强）／有否决 9%／给出理由 17% ‖ 走过判据 50%／指名道姓 52%（几乎没区分度）
# **旧配法把最强的信号给 3 分、最弱的两项各给 2 分，配反了。**
print("\n[功率计] 按实测重配的权重与上限")
import polish as _P
check("上限恒为 POWER_MAX（产出与否决二选一）",
      _P.power_of("§2 抓出一处，改前 A → 改后 B，因为…；三处**逐处判为保留**，"
                  "保留的代价是…**开工四问**：①②③④，逐条走过")[0] == _P.POWER_MAX,
      "两项同权 4 分，都做到时只应计一次")
check("纯否决也能跑满",
      _P.power_of("**开工四问**：①②③④。§2、§3、§5 三处**逐处判为保留**，"
                  "保留的代价是…因为…改前 A → 改后不动，逐条走过")[0] >= _P.POWER_FULL,
      "判「不落刀」是正当结论，不该拿不到满分")
check("空洞台账拿不到分", _P.power_of("这一轮读了一遍，没发现问题。")[0] < _P.POWER_FLOOR)
check("下限已由 6 提到 8", _P.POWER_FLOOR == 8)


# ── 待核分级输出（2026-08-20）──────────────────────────────────
# 立此之由：**39 条提示级规则里，11 条在全库 503 轮次台账中从未被援引过。**
#   它们每篇都在报，却从没影响过任何判断——**纯噪声，把真信号淹掉。**
# 处置：**不删规则**（可能某天真的逮到东西），改为按实际采纳率分档输出。
print("\n[检察官] 待核分级输出")
_src = open(os.path.join(ROOT, "scripts/inspector.py"), encoding="utf-8").read()
check("高采纳规则标星", "★常被采纳" in _src)
check("低采纳规则折叠", "低采纳，全库台账中从未被援引，折叠" in _src)
check("硬伤永远排最前", "if x.sev == \"hard\":\n            return (0, 0, x.rid)" in _src,
      "分级只作用于待核，硬伤不能被排到后面")
check("规则本身未被删除",
      all(r in _src for r in ("AUD-01", "BAL-03", "SYN-01", "VAL-02b")),
      "折叠不等于删除——它们可能某天真的逮到东西")


# ── 冷读队列 coldread.py（2026-08-20 立）──────────────────────
# 立此之由：**第13轮极限轮是全项目唯一受时间约束的活**——
#   隔会话跑才算数（第32篇翻案1处、第33篇2处；同场跑一律零翻案，而那个零是假的）。
#   一次会话里做不成，跨会话又没人记得欠了哪几篇，于是积了 30 多篇假的第13轮。
print("\n[冷读队列] coldread.py")
import importlib.util as _ilu
_spec = _ilu.spec_from_file_location("coldread", os.path.join(ROOT, "scripts/coldread.py"))
_cr = _ilu.module_from_spec(_spec); _spec.loader.exec_module(_cr)

check("明写「非隔会话」判为 fake", _cr.status("32")[0] == "fake",
      "第32篇台账自己写着「同一次会话（条件不满足）」")
check("翻出东西即判为 real", _cr.status("33")[0] == "real",
      "★ 翻案 ≥1 处本身就是「读得够冷」的证据，比标注更硬")
check("未标注者保守当作未跑", _cr.status("28")[0] in ("unmarked", "real"),
      "宁可多读一遍，不可漏")
_src = open(os.path.join(ROOT, "scripts/coldread.py"), encoding="utf-8").read()
check("闸门拦的是会话不是篇", "last_issue" in _src and "last_batch" in _src,
      "★ 第一版只跳过刚领过的那几篇、接着发下一批——"
      "等于同一会话能把全库领完，队列形同虚设")
check("销账与判定共用同一判据", 'if stt != "real":' in _src,
      "★ 另立标准会出现「status 判 real、销账却拒收」的自相矛盾（第33篇实测踩到）")
check("时间锚点取自 git 提交", "git" in _src and "%cI" in _src,
      "不另建时间戳文件——git 的提交时间是既有的、不会被改错的事实")


# ── 《总令》自动刷新 render_charter.py（2026-08-20 立）──────────
# 立此之由：《总令》里混着两类东西——
#   **机器做不了的判断**（判据／选题四条／十三轮的活／红线／进化五问）必须人写；
#   **从库里就能算的数**（篇数／词元／均分／测试数／层族／题材表／欠账）手写就一定过期。
# 实测：**同一会话里手工更新过两遍，两遍都在一小时内就旧了**
#   ——不是不勤快，是设计错了。
print("\n[总令] 易变部分自动刷新")
_ch = open(os.path.join(ROOT, "notes/总令.md"), encoding="utf-8").read()
check("六段易变部分都有占位标记",
      all(("auto:%s" % k) in _ch for k in
          ("header", "models", "topics", "families", "tests", "owed")),
      "缺标记的段落刷新时会被跳过")
check("标记成对", _ch.count("<!--auto:") == _ch.count("<!--/auto:") == 6)
# ★ 空档单子必须由人维护 —— 机器算得出「写过哪些题材」，算不出「哪些题材值得写」。
check("空档单子不在 auto 块内",
      "auto:" not in _ch[_ch.index("空档"):_ch.index("空档") + 1200],
      "★ 机器能从 topic 字段生成「已写过什么」，但「什么值得写」是判断，须人维护")
# ★ 2026-09-01 起：手写空档单子已废，改用「先扫域、再找题材」。
# **实证**：2026-08-20 开的八条空档，到第50篇只用掉两条（营养→44／建筑防火→45），
# **而第46—50 篇全是扫域挑出来的，单子上根本没有**。
# **手写单子跟不上，因为它凭的是我想得到什么，扫域凭的是库里还剩什么。**
check("《总令》写明改用扫域法", "先扫域、再找题材" in _ch)
check("三步俱全（扫域／brief 报数／上网核）",
      "低于三成的别碰" in _ch and "低于 14 个就换角度" in _ch and "逐条上网核" in _ch)
check("写明「换角度不是换题材」", "换角度不是换题材" in _ch,
      "★ 同一件事换个切入点，要用的词就变了 —— 第44、49、50 篇实测")
check("保留唯一已核的旧空档", "时间制度与法定时" in _ch and "两根分针" in _ch)
check("人写的部分不在标记内",
      "auto:" not in _ch[_ch.index("## 一、判据"):_ch.index("## 二、动手之前")],
      "★ 判据这一节必须由人维护，绝不能被脚本覆写")
_rc = open(os.path.join(ROOT, "scripts/render_charter.py"), encoding="utf-8").read()
check("提供 --check 供 CI 调用", "--check" in _rc and 'sys.exit(1)' in _rc,
      "过期时须能让 CI 红，否则等于没有")


# ── NUM-01 并列数一拼写一阿拉伯（2026-08-20 立）────────────────
# 立此层之由：**第39篇把 601 写成 six hundred and one、第42篇把 6 of 29 写成
#   six of twenty-nine——两次都是判别性证据被拼写式稀释，而两次都是人眼发现的。**
# **先量**：全库拼写式写数 84 处 / 30 篇，**数量太大，不可能全是病**。
# **判据废掉两个才定住**：
#   ①「凡拼写式即报」→ 84 处，**误收 Thirty drowned.**（第21篇的重锤，正因短促才有力）；
#   ②「同句内混用」→ 21 处，**仍误收 4.55 ± 0.07 billion years**（billion 是单位不是数）。
#   定住的形状：**同一句的一组并列数里，一部分阿拉伯、一部分拼写。**
print("\n[NUM-01] 并列数一拼写一阿拉伯")
_b1 = art(["It killed 800 people, destroyed 133 ships and damaged ninety."],
          ["它夺去800条人命，毁掉133艘船，另有90艘受损。"])
check("三项并列一拼写两阿拉伯 → NUM-01", "NUM-01" in ids(I.inspect(_b1, arts)[0]),
      "读者会以为 ninety 是另一类东西")
_g1 = art(["It killed 800 people, destroyed 133 ships and damaged 90."],
          ["它夺去800条人命，毁掉133艘船，另有90艘受损。"])
check("改齐后不再报", "NUM-01" not in ids(I.inspect(_g1, arts)[0]))
_k1 = art(["Thirty drowned. The hull heeled, and the water came in."],
          ["三十人溺毙。船身倾侧，水灌了进来。"])
check("纯拼写的重锤不误报", "NUM-01" not in ids(I.inspect(_k1, arts)[0]),
      "★ Thirty drowned. 正因短促才有力，不该逼它改成 30")
_u1 = art(["His 1956 report fixed it at 4.55 billion years, and the figure held."],
          ["他1956年的报告把它定在45.5亿年，这个数字站住了。"])
check("数字加单位不误报", "NUM-01" not in ids(I.inspect(_u1, arts)[0]),
      "★ billion 紧跟阿拉伯数字时是单位不是数")
check("NUM-01 已挂铁律", bool(I.charter_of("NUM-01")))


# ── agent.py vet · 补名额前核验（2026-08-20 立）─────────────────
# 立此命令之由：**brief 是动笔前建词池用的，而我犯错的场景恰恰不是动笔时——
#   是入库之后临时补一个名额**：那时词池早已不在手边，于是凭感觉抓一个词填进去。
# **本次会话里这一步栽了六次**（比任何一条规则的犯错频次都高）：
#   第39篇 covered 撞第33篇、square 撞第17篇、remote 撞第01篇（**连撞三次才想起先查**）；
#   第40篇 rode 撞第32篇；第42篇 word(5.26) 与 term(5.23) 两个都是白送词（**同一处连栽两回**）。
# **六次的共同点：我知道该查，但补词时手边没有一个「一条命令查完」的东西。**
print("\n[agent vet] 补名额前核验候选词")
_src = open(os.path.join(ROOT, "scripts/agent.py"), encoding="utf-8").read()
check("vet 命令已挂进 CLI", 'cmd == "vet"' in _src)
check("查跨篇同形（VAL-08）", "VAL-08" in _src and "同形" in _src)
check("查跨篇同词元与同根（VAL-07）", "VAL-07" in _src and "同根" in _src)
check("查白送词与生僻词（VAL-02h / VAL-09）",
      "VAL-02h" in _src and "VAL-09" in _src)
check("查初中词表（VAL-12）", "VAL-12" in _src)
check("明写本命令查不出什么",
      "查不出中英失配与篇内重复" in _src,
      "★ 工具须说清自己的边界，否则人会以为跑过就万事大吉")
_r = subprocess.run([sys.executable, os.path.join(ROOT, "scripts/agent.py"),
                     "vet", "42", "word", "technical"],
                    capture_output=True, text=True, timeout=180).stdout
check("实测：白送词被逮出", "word" in _r and "VAL-02h" in _r)
check("实测：可用词放行", "可用：technical" in _r)


# ── NUM-02 同一个数中英两种写法（2026-08-20 立）─────────────────
# 立此层之由：**本次会话「中英失配」共 12 次、分布 8 篇，是自伤里最多的一族**
#   （补名额撞车 5 次、补名额是白送词 5 次）。
# **而 MET-07/08 只查「加粗词有没有对应括注」，查不出数字本身的写法不一致。**
# **判据废掉两个才定住**：
#   ①「中英数字集合不相等」→ 67 处 / 38 篇，**几乎全是误报**
#     （September 对「9月」、Nimbus-7 对「云雨七号」——中英数字表示法本就不同）；
#   ②「英文有阿拉伯、中文有大写」→ 15 处，**仍误收 14 处**
#     （「1983 / 三十二年后」是英文写年份、中文写时长的惯例）。
#   定住的形状：**同一个数，英文写阿拉伯、中文写大写。**
print("\n[NUM-02] 同一个数中英两种写法")
_b2 = art(["Late on the 15th, 2,500 metres down, the sled surfaced."],
          ["15日深夜，在两千五百米深处，雪橇浮出水面。"])
check("同数两写 → NUM-02", "NUM-02" in ids(I.inspect(_b2, arts)[0]),
      "英文 2,500 而中文「两千五百」，两边对不齐")
_g2 = art(["Late on the 15th, 2,500 metres down, the sled surfaced."],
          ["15日深夜，在2500米深处，雪橇浮出水面。"])
check("中文改用阿拉伯后不再报", "NUM-02" not in ids(I.inspect(_g2, arts)[0]))
_k2 = art(["In 1983, thirty-two years after that symposium, she took the prize."],
          ["1983年，那次研讨会之后三十二年，她拿到了奖。"])
check("英文年份/中文时长不误报", "NUM-02" not in ids(I.inspect(_k2, arts)[0]),
      "★ 这是两边各自的惯例，不是失配")
check("NUM-02 已挂铁律", bool(I.charter_of("NUM-02")))


# ── 铁律第零条 · 全库七层零重复（2026-08-20 加）─────────────────
# **用户两次追问「所有重点词前前后后有没有重复交叉」，这是铁律。**
# VAL-05/07/08 逐篇查，但**没有一条测试从全库整体验过这件事**——本条补上。
# **实测发现 5 组纯屈折跨篇**（pound/pounds、sailed/sails、shallows/shallow、
#   smeared/smears、vessels/vessel）——**同一个词让学习者在两篇里背两次**，已全部改掉。
print("\n[铁律第零条] 全库七层零重复")
import agent as _AG
_all = _AG.load()
_g = [(x["w"].lower(), a["id"]) for a in _all for x in a["glossary"]]
_b = [(w.lower(), a["id"]) for a in _all
      for p in a["paras"] for w in _core.keywords(p["en"])]
check("速查表词条原样零重复", len(_g) == len({w for w, _ in _g}),
      "2150 条词条，去重后须仍是 2150")
check("正文加粗表面形式零重复", len(_b) == len({w for w, _ in _b}),
      "★ 这是学习者眼睛真正看到的那一层")
check("篇内零重复",
      all(len([w for p in a["paras"] for w in _core.keywords(p["en"])])
          == len({w.lower() for p in a["paras"] for w in _core.keywords(p["en"])})
          for a in _all))
_n = {}
for _w, _a in _g + _b:
    _n.setdefault(_AG.norm(_w), set()).add(_a)
check("归一化后跨篇零重复", not any(len(v) > 1 for v in _n.values()),
      "去掉复数/时态的表层差异后再查一遍")
_INFL = ("s", "es", "ed", "ing", "d")
_st = {}
for _w, _a in _g + _b:
    _st.setdefault(_AG.stem(_w), set()).add((_w, _a))
_pure = 0
for _k, _v in _st.items():
    if len({a for _, a in _v}) < 2:
        continue
    _f = sorted({w for w, _ in _v}, key=len)
    if all(x == _f[0] or x[len(_f[0]):] in _INFL or x.rstrip("s") == _f[0].rstrip("s")
           for x in _f):
        _pure += 1
# ★★ 第六层：不规则变化（2026-08-20 加）
# **用户第三次追问后加的。前两次的网都抓不到这一类**——
#   词干化只削后缀，**grow/grew/grown、seek/sought、show/shown、withdraw/withdrew
#   一个都逮不住**，而它们同样是「一个词让学习者背两次」。
# **实测查出 7 组，逐组人判后 4 组是真重复**（grew/grown、seek/sought、
#   showed/shown、withdrew/withdrawn），已全部改掉；
# **另 3 组判为不是重复**：bit 是「比特」不是 bite 的过去式；
#   hide 作「兽皮」是名词、与动词 hid 是两个词；freeze「封冻」与 froze「冻结申请」义项分开。
_IRR = (
        "bear bore borne;begin began begun;bind bound;bite bit bitten;"
        "blow blew blown;break broke broken;bring brought;build built;"
        "buy bought;catch caught;choose chose chosen;cling clung;"
        "come came;creep crept;deal dealt;dig dug;draw drew drawn;"
        "drink drank drunk;drive drove driven;eat ate eaten;fall fell fallen;"
        "feed fed;feel felt;fight fought;find found;flee fled;fling flung;"
        "fly flew flown;forget forgot forgotten;freeze froze frozen;"
        "give gave given;grind ground;grow grew grown;hang hung;hear heard;"
        "hide hid hidden;hold held;keep kept;know knew known;lay laid;"
        "lead led;leave left;lend lent;lie lain;lose lost;mean meant;"
        "meet met;pay paid;ride rode ridden;ring rang rung;rise rose risen;"
        "run ran;say said;see saw seen;seek sought;sell sold;send sent;"
        "shake shook shaken;shine shone;shoot shot;show showed shown;"
        "shrink shrank shrunk;sing sang sung;sink sank sunk;sit sat;"
        "sleep slept;slide slid;speak spoke spoken;spend spent;spin spun;"
        "spring sprang sprung;stand stood;steal stole stolen;stick stuck;"
        "sting stung;strike struck;swear swore sworn;sweep swept;"
        "swim swam swum;swing swung;take took taken;teach taught;"
        "tear tore torn;tell told;think thought;throw threw thrown;"
        "tread trod trodden;understand understood;wear wore worn;"
        "weave wove woven;win won;wind wound;withdraw withdrew withdrawn;"
        "write wrote written"
    )
_W = {}
for _w, _a in _g + _b:
    _W.setdefault(_w, set()).add(_a)
# ★★ 三组逐词读过后判为「不是重复」，写明理由豁免 —— 不是一笔带过：
#   bite(36「咬」) / bit(07「**比特**」)   —— **bit 是信息论的单位，与 bite 无关**
#   hide(14「**兽皮**」) / hid(32「藏起」) —— **名词 hide 与动词 hide 是两个词**
#   freeze(14「封冻」) / froze(37「**冻结申请**」) —— 冰情 vs 行政中止，义项分开
# **豁免只针对这三对具体的形，不放宽判据本身**；换了别的词照样报。
_EXEMPT = {("bite", "bit"), ("hide", "hid"), ("freeze", "froze")}
_irrbad = []
for _grp in _IRR.split(";"):
    _pres = [(f, _W[f]) for f in _grp.split() if f in _W]
    _ids = set()
    for _, _v in _pres:
        _ids |= _v
    if len(_pres) > 1 and len(_ids) > 1:
        if frozenset(f for f, _ in _pres) in {frozenset(x) for x in _EXEMPT}:
            continue
        _irrbad.append(_grp.split()[0])
# ★★★ 第七层：篇内不规则变化（2026-08-20 加）
# **VAL-05 查篇内重复，但它同样用词干化 —— 对不规则变化无效。**
# 实测：**全库只有第22篇命中，而逐词读过后判为「不是重复」**：
#   该篇正文实际加粗的是 **laid**（§1，lay-laid-laid，及物「提交」）
#   与 **lain**（§5，lie-lay-lain，不及物「躺」）——**分属两个不同的动词**。
#   速查表存的 lay / lie 是词根形，未占正文名额。
# **★ 之所以会命中，是因为 lay 既是 lay 的原形、又是 lie 的过去式**——
#   两组变位表在这个形上交叉。**判据必须能分开它们，否则以后每次都误报。**
# 故本层只查**正文实际加粗的形**，不查速查表词根形。
_IRR2 = _IRR   # ★ 两层共用同一张表 —— 否则一严一松，等于没查
_inbad = []
for _a in _all:
    _bw = {w.lower() for p in _a["paras"] for w in _core.keywords(p["en"])}
    for _grp in _IRR2.split(";"):
        _f = [x for x in _grp.split() if x in _bw]
        if len(set(_f)) > 1:
            _inbad.append((_a["id"], _f))
check("篇内不规则变化零重复", not _inbad,
      "★ VAL-05 用词干化查篇内重复，对 grow/grew 这类无效 —— 须另立词表",
      )
check("不规则变化跨篇零重复", not _irrbad,
      "★ 词干化只削后缀，grow/grew/grown 一个都逮不住 —— 须另立词表查",
      )
check("纯屈折跨篇零重复", _pure == 0,
      "★ vessel 与 vessels 是同一个词 —— 派生（survive/survival）不算，屈折算")


# ── VAL-14 屈折形绕过白送词/初中词检查（2026-08-20 立）──────────
# 立此层之由：**VAL-02h 查白送词、VAL-12 查初中词，查的都是「加粗的那个表面形」。**
# 而**不规则变化的词频远低于原形**：run 5.49→ran 4.87、show 5.68→showed 4.86、
#   keep 5.66→kept 5.00。**原形是白送词，屈折形却能过 5.0 这条线。**
# **判据废掉一个才定住**：
#   ①「凡屈折形的原形是白送词就报」→ 126 处，**误收 processing／readings／numbering**
#     ——它们是动名词或名词化，**词性变了，是独立词条**。
#   定住的形状：**只查不规则变化**——词性必然不变，学的还是同一个基本词。
# **实测查出 11 处并全部改掉**：drank／broken／fell／shown／rode／meant／sold／
#   flew／spoke／stood／taught。
print("\n[VAL-14] 屈折形绕过白送词/初中词检查")
_bad14 = art(["The niece **drank** the same bottle and died the next day."],
             ["外甥女**喝**(drank)了同一瓶水，第二天也死了。"],
             gloss=[{"w": "drank", "zh": "喝", "p": 1}])
check("屈折形绕过 → VAL-14", "VAL-14" in ids(I.inspect(_bad14, arts)[0]),
      "drank 3.95 过了线，而原形 drink 在初中词表")
_ok14 = art(["The niece **sipped** the same bottle and died the next day."],
            ["外甥女**啜**(sipped)了同一瓶水，第二天也死了。"],
            gloss=[{"w": "sipped", "zh": "啜饮", "p": 1}])
check("换掉后不再报", "VAL-14" not in ids(I.inspect(_ok14, arts)[0]))
_dv14 = art(["Its **processing** flagged **readings** under 180 Dobson units."],
            ["它的**数据处理**(processing)会把低于180单位的**读数**(readings)标出来。"],
            gloss=[{"w": "processing", "zh": "数据处理", "p": 1},
                   {"w": "readings", "zh": "读数", "p": 1}])
check("派生不误报", "VAL-14" not in ids(I.inspect(_dv14, arts)[0]),
      "★ processing／readings 是名词化，词性变了，是独立词条")
check("VAL-14 已挂铁律", bool(I.charter_of("VAL-14")))


# ── swap.py 换词四步合一（2026-08-20 立）──────────────────────
# **立此工具之由：本会话「换一个词」引发的自伤共 25 次，全是同一个形状。**
#   换词本要走四步：① vet 候选　② 改英文　③ 改中文　④ 重建速查表
#   而**每次都会漏掉其中一步**：
#     漏 ① → 撞车 5 次、白送词或生僻词 7 次（vended 1.2、severed 撞第20篇…）
#     漏 ③ → **中英失配 13 次**（改了英文，中文那边还是旧词）
#     漏 ④ → 速查表与正文对不上
# **我不是不知道规矩，是规矩太长。工具的职责是让漏不掉。**
# 四件事任何一件不过就**整体不落盘**——半途而废正是那 13 次的来源。
print("\n[swap] 换词四步合一")
_sw = open(os.path.join(ROOT, "scripts/swap.py"), encoding="utf-8").read()
check("vet 含全部四类否决", all(k in _sw for k in
      ("VAL-08", "VAL-07", "VAL-02h", "VAL-09", "VAL-12", "VAL-14")),
      "★ 含 VAL-14：不规则屈折的原形是不是白送词")
check("英文侧要求恰好命中一处", 'n_en != 1' in _sw,
      "多处或零处都说明上下文没看清，须先看原文")
check("中文侧要求恰好命中一处", 'n_zh != 1' in _sw,
      "★ 中英失配那 13 次，正是因为这一步被跳过")
check("中文侧自动认出原词并同步替换",
      '"**%s**(%s)" % (zh_old, a.old)' in _sw,
      "不要求人再输一遍旧中文词 —— 少一个可填错的地方")
check("释义须为中文（红线六）", "红线六" in _sw and "\u4e00" in _sw)
check("任一步不过则整体不落盘", "整体未落盘" in _sw)
check("速查表整表按正文顺序重排", "for w in core.keywords(pa[\"en\"])" in _sw)
check("落盘后自动跑检察官复查", "inspector.py" in _sw)
check("明写后续仍须跑什么", "build_markdown → rescan → regress accept" in _sw,
      "★ 工具须说清自己的边界，否则人会以为跑过就万事大吉")


# ── check.py 改后复查三合一（2026-08-20 立）───────────────────
# **立此工具之由（先把事实说准）**：
#   本会话 25 次自伤**全部被 preflight 拦下、无一上到 GitHub**
#   （preflight 卡「硬伤合计 0 条」）——**所以代价从来不是仓库坏掉，
#   而是「我多花一轮」。**
# **而多花那一轮的原因是发现得太晚**：改完要跑
#   build_markdown → inspector → rescan 三样，我常常只跑第二样。
# **swap.py 管「改的时候别漏」，check.py 管「改完立刻知道」——两头都要有。**
print("\n[check] 改后复查三合一")
_ck = open(os.path.join(ROOT, "scripts/check.py"), encoding="utf-8").read()
check("三样都跑", all(k in _ck for k in
      ("build_markdown", "inspector.py", "rescan.py")))
check("默认查全库不只查一篇", 'python3 scripts/inspector.py"' in _ck,
      "★ 改一篇常会碰坏另一篇 —— severed 撞第20篇就是改第09篇时撞出来的")
check("不通过则退出码非零", "sys.exit(1)" in _ck,
      "否则我会以为跑过就没事")
check("明写回扫仍须人判", "机器不替人下结论" in _ck)
check("说清「不把问题拖到 preflight 那一刻」",
      "不把问题拖到 preflight" in _ck)


# ── 《总令》须提到每一件工具（2026-09-01 立）───────────────────
# **立此测试之由**：本会话新建了 swap.py／check.py／coldread.py／render_charter.py
#   与 agent.py vet 五件工具，而**《总令》里 swap.py、check.py、vet 一次都没提**。
# **下一次会话开局读的是《总令》——它没写，这一整场的东西对下一个人就不存在，
#   那 25 次自伤会原样再来一遍。**
# 规则（NUM-01/VAL-14…）不必写进总令：**它们装在检察官里，自己会报**；
# **但工具不会自己跳出来说「我在这儿」，必须写。**
print("\n[总令] 须提到每一件工具")
_ch2 = open(os.path.join(ROOT, "notes/总令.md"), encoding="utf-8").read()
_scripts = sorted(f for f in os.listdir(os.path.join(ROOT, "scripts"))
                  if f.endswith((".py", ".js")) and not f.startswith("_")
                  and f not in ("core.py", "export_one.py", "test_tools.py",
                                "audit_ledger.py"))
_missing = [f for f in _scripts if f not in _ch2]
check("每一件工具都在《总令》里出现过", not _missing,
      "缺：%s —— **工具不会自己跳出来说「我在这儿」**" % "、".join(_missing))
check("swap.py 写明「任一步不过则整体不落盘」",
      "整体不落盘" in _ch2)
check("check.py 写明「默认查全库」",
      "默认查全库" in _ch2,
      "★ 改一篇常会碰坏另一篇")
check("agent vet 写明「跑了的零失手，没跑的当场栽」",
      "跑了 vet 的零失手" in _ch2)


# ── start.py 开局自检（2026-09-01 立）─────────────────────────
# **立此工具之由**：用户问「《总令》每次是不是要我发给你」。**答案是不必**——
#   它就在 notes/总令.md，**随 git clone 一起回来**。
#   本会话中途容器被重置，我用 token 重新 clone，**用的是仓库里那份**。
# **而我此前做错两件事**：
#   一、往 outputs 拷了约十五次《总令》——**那是给用户制造活儿**；
#   二、**没把「开局怎么自己拿到它」写成机制**，于是用户会以为要靠他发。
print("\n[start] 开局自检")
_stp = open(os.path.join(ROOT, "scripts/start.py"), encoding="utf-8").read()
check("查容器重置后必丢的两样", "wordfreq" in _stp and "user.email" in _stp,
      "★ 不补会导致词价层误报硬伤、commit 失败 —— 本会话两样都栽过")
check("报冷读欠账", "coldread" in _stp, "唯一受时间约束的活")
check("报下一篇可动笔的题材", "已核，有真反转" in _stp)
check("明写「用户什么都不必发」", "用户什么都不必发" in _stp)
_ch3 = open(os.path.join(ROOT, "notes/总令.md"), encoding="utf-8").read()
check("《总令》开篇即写明开局一条命令",
      "开局第一条命令" in _ch3 and "start.py" in _ch3[:2000])
check("《总令》写明不必用户发", "随 `git clone` 一起回来" in _ch3)


# ── brief 的「可用词够不够」分档（2026-09-01 立）────────────────
# **立此判据之由**：写第44篇（时间制度）时 brief 只吐出 13 个可用词，
#   我一度判断「43 篇之后词空间窄了」。**量过之后这个判断是错的**——
#   **词价合格的候选池整体还剩 79%（14342/18142），名义上够写 286 篇。**
#   **瓶颈不在总量，在「这个题材要用的那批词」。**
# **★ 而第一版判据（可用率百分比）被四篇实测当场否掉**：
#   第43篇 42% 判为「太低」，**可它写得最顺、一次撞车都没有**；
#   第44篇 47% 判为「偏紧」，**却是最吃力的一篇**。
#   **百分比与难易不相关，甚至是倒着的。**
# **改用绝对数**：brief 吐出的可用高价值词个数（43篇 20 顺／44篇 13 吃力）——
#   **一篇要 50 个名额，池子里有几个能用，才决定要替换多少次。**
# **★ 另记一坑**：我一度另建了 `runway` 命令来算这个，
#   **而 brief 本来就在报这个数 —— 重复造轮子，已撤，改为并进 brief 输出。**
print("\n[brief] 可用词够不够的分档")
_ag = open(os.path.join(ROOT, "scripts/agent.py"), encoding="utf-8").read()
check("分档并在 brief 里，未另建命令", "_nav = len(buckets" in _ag
      and "def runway(" not in _ag,
      "★ brief 本来就在报这个数 —— 另建 runway 是重复造轮子")
check("阈值用绝对数不用百分比", "_nav < 14" in _ag and "_nav < 18" in _ag)
check("写明百分比与难易不相关", "百分比与难易不相关" in _ag,
      "★ 四篇实测把第一版判据否掉了，如实记下")
check("太少时给出出路", "换个角度或换个题材" in _ag,
      "同一件事换个切入点，要用的词就变了")


# ── vet 的 19:7 实测对照（2026-09-01 第44篇）─────────────────
# **装了 vet 之后我仍在一篇之内漏跑七次**，对照极干净：
#   **跑了 vet 的 19 个词零撞车**（sailors／ounce／colonies／imperial／copper／casks／
#     gums／bruises／heal／potency／divides／cure／recipe／ascorbic／mocked／dubbed／
#     stuck／outlived／celebrates）；
#   **没跑就直接填的 7 个全撞**（seek 撞18／mattered 撞34／remedy 与 parts 撞15／
#     test 撞22／judgement 撞40／moment 撞17）。
# **结论：「知道该跑」不够 —— 补名额就跑，不要先判断这次要不要跑。**
print("\n[vet] 19:7 实测对照已写进工具与《总令》")
_ag2 = open(os.path.join(ROOT, "scripts/agent.py"), encoding="utf-8").read()
check("vet 输出里写明 19:7", "19:7" in _ag2)
check("写明「补名额就跑，别判断要不要跑」",
      "别判断要不要跑" in _ag2)
_ch4 = open(os.path.join(ROOT, "notes/总令.md"), encoding="utf-8").read()
check("《总令》里也写了这条对照", "19:7" in _ch4,
      "★ 下一次会话开局读的是《总令》")


# ── NUM-03 同句两个及以上拼写式数字（2026-09-01 立）──────────────
# **立此层之由：同一个错我犯了三次**——
#   第39篇 six hundred and one／six hundred and eleven；
#   第42篇 six of twenty-nine／some sixty；第45篇 Twenty-seven of the thirty。
# **三次都是判别性证据被拼写式稀释，三次都是人眼发现的。**
# **而 NUM-01 逮不到**：它只查「同句里阿拉伯与拼写混用」，
#   这三处是**整组都写成拼写式**，没有混用可查。
# **判据废掉两个才定住**：
#   ①「≥20 的拼写式数字即报」→ 65 处 / 28 篇，**太粗**（ten weeks、six pairs 都是好的）；
#   ②「拼写式的 X of Y 对照」→ **0 处**，正则收得太死。
#   定住的形状：**同一句里两个及以上拼写式数字**——
#   机器认不出「哪句是判别性证据」，**但判别性证据几乎总是一组对照，
#   而一组对照就是同句里的两个数。**
# 实测 15 处，逐条人判后修掉第33篇（144,000 对 282,000 是全篇的对照，
#   **且中文原写「一百四十四千英镑」——这本身还是个译法错误**）。
print("\n[NUM-03] 同句两个及以上拼写式数字")
_b3 = art(["Of the annual outlay, only a hundred and forty-four thousand tracked distance; "
           "two hundred and eighty-two thousand did not."],
          ["在全年开支里，只有一百四十四千是随距离走的；另外二十八万二千则不是。"])
check("整组拼写式 → NUM-03", "NUM-03" in ids(I.inspect(_b3, arts)[0]),
      "判别性证据被文字稀释，读者要在脑子里换算")
_g3 = art(["Of the annual outlay, only 144,000 tracked distance; 282,000 did not."],
          ["在全年开支里，只有144,000是随距离走的；另外282,000则不是。"])
check("改用阿拉伯后不再报", "NUM-03" not in ids(I.inspect(_g3, arts)[0]))
_k3 = art(["Scurvy took eighty of the men in ten weeks, and six pairs were chosen."],
          ["坏血病十周里带走八十人，选出六对。"])
check("单个拼写式不误报", "NUM-03" not in ids(I.inspect(_k3, arts)[0]),
      "★ ten weeks／six pairs 都是好的 —— 判据只查同句两个及以上")
check("NUM-03 已挂铁律", bool(I.charter_of("NUM-03")))


# ── 中文数字译法（2026-09-01 加）────────────────────────────────
# **立此测试之由**：修 NUM-03 时顺带撞见一处**不同性质的错**——
#   第33篇中文写「一百四十四千英镑」，那是把 144,000 按英文的千进位直译，
#   **不是格式问题，是把数译错了**。
# **一次出现就该查是不是系统性的。** 已全库量过两轮：
#   ①「…千／百千」这类英文千进位直译痕迹 → **0 处**（第33篇那处已修）；
#   ②逐段比对中文汉字数与英文数是否等值 → 21 处「中文有英文无」，
#     **抽查后全部为正常对应**（76 million↔七千六百万、ten million↔一千万、
#     four hundred thousand↔四十万、a quarter of a million↔二十五万）——
#     **中文的万进位与英文的千进位换算正确，不是错。**
# **结论：孤例，非系统性。** 本测试只锁「直译痕迹」这一条，防止再犯。
print("\n[中文数字] 无英文千进位直译痕迹")
import re as _re2
_bad_cn = []
for _a in _all:
    _z = " ".join(p["zh"] for p in _a["paras"])
    for _pat in (r"[一二三四五六七八九十百]{2,}千(?![米克瓦分])", r"百千"):
        for _m in _re2.finditer(_pat, _z):
            _bad_cn.append("%s篇「%s」" % (_a["id"], _m.group(0)))
check("中文无「…千」式的英文直译", not _bad_cn,
      "缺陷：%s —— **中文当用万进位**（144,000 是「十四万四千」不是「一百四十四千」）"
      % "、".join(_bad_cn[:5]))


# ── movecheck.py 挪句预演（2026-09-01 立）─────────────────────
# **立此工具之由：同一个错犯了两次。**
#   **第34篇**段长极差 22 → 我把 §1 的一句挪进 §2 → **变成 38**
#     （§1 本就是最短段，我却从它身上再拿走一句）；
#   **第46篇**极差 20 → 我把 §3 的一句挪到 §4 → **变成 34**（§3 挪走后反成最短段）。
# **两次病根相同：知道该摊平，但没算「挪完会是多少」就动手。**
# **而这件事完全可以机械算** —— 本命令把每一种挪法都算一遍，变差的标 ✗。
# **实测回验**：对第46篇跑，我当时挪的那一句（26词）被标 ✗ 极差 32；
#   对第34篇跑，它指出该动的是 §4 而非 §1。
print("\n[movecheck] 挪句预演")
_mc = open(os.path.join(ROOT, "scripts/movecheck.py"), encoding="utf-8").read()
check("列出每一种挪法的结果", "for j in (i - 1, i + 1)" in _mc)
check("变差的标 ✗", '"✗"' in _mc)
check("没有一种能改善时明说不要挪", "不要挪" in _mc)
check("写明只算长度、不管论证",
      "极差改善不等于文章变好" in _mc,
      "★ 第34、46 两篇最终都判为「不挪」—— 那几句拆开就断")
_ch5 = open(os.path.join(ROOT, "notes/总令.md"), encoding="utf-8").read()
check("《总令》写明要挪句先跑它", "movecheck.py" in _ch5)


# ── vet 补上不规则变化跨篇（2026-09-01）─────────────────────────
# **这是 vet 的一个真漏洞，写第47篇时暴露出来。**
#   换 borne→wore 时 **vet 放行了 wore，而它与第38篇的 wear 是同一动词**——
#   **靠封版时的「七层零重复」测试才逮住，等于白跑一趟 vet。**
#   病根：**vet 原先只查同形／同词元／同根，而词干化对 wear/wore、bear/bore 完全无效。**
# **★ 而我给这个补丁打了三次才装上**：前两次 str_replace 断言失败、
#   我却没核实就往下走 —— **改完不核实，等于没改。**
print("\n[vet] 不规则变化跨篇")
_ag3 = open(os.path.join(ROOT, "scripts/agent.py"), encoding="utf-8").read()
check("vet 里有不规则动词组表", "_IRR_GRP" in _ag3)
check("接进了 why 的判断链", "是同一动词（不规则变化）" in _ag3)
check("写明这是真漏洞及其来历",
      "靠封版时的" in _ag3 and "白跑一趟 vet" in _ag3)
_r3 = subprocess.run([sys.executable, os.path.join(ROOT, "scripts/agent.py"),
                      "vet", "47", "wore", "shackle"],
                     capture_output=True, text=True, timeout=180).stdout
check("实测：wore 被拦下（撞第38篇 wear）",
      "wore" in _r3 and "同一动词" in _r3)
# ★ 反例原用 flew，而新装的 VAL-14 正确地把它拦下了
#   （原形 fly 在初中词表，flew 不在 —— 屈折形绕过初中词检查）。
#   **判据没错，是反例挑错了词**：换成 shackle（无任何冲突）。
check("实测：不撞的词仍放行", "可用：shackle" in _r3)


# ── vet 篇内查四层（2026-09-01）───────────────────────────────
# **第三次同形的漏洞：vet 放行、封版才拦。**
#   第47篇 wore（撞第38篇 wear）→ 补上「不规则变化跨篇」；
#   第48篇 sworn（撞第39篇 swear）→ 那是在补丁之前 vet 的，漏了过去；
#   **本轮实测：第48篇已有 tucked／stiff，而 vet 放行了 tuck／stiffen**——
#   **篇内那一路原先只比对表面形。**
# **而 test_tools 第五层「篇内不规则变化零重复」早就查这个。**
# **两道网的判据必须一致，否则前一道等于摆设。**
# 现在 vet 的篇内查四层：表面形／同词元／同一动词的另一形／同根。
print("\n[vet] 篇内查四层")
_ag4 = open(os.path.join(ROOT, "scripts/agent.py"), encoding="utf-8").read()
check("篇内查同词元", "本篇已用同词元" in _ag4)
check("篇内查不规则另一形", "本篇已用同一动词的另一形" in _ag4)
check("篇内查同根", "与本篇的 %s 同根" in _ag4)
check("写明这是第三次同形的漏洞",
      "两道网的判据必须一致" in _ag4)
_r4 = subprocess.run([sys.executable, os.path.join(ROOT, "scripts/agent.py"),
                      "vet", "48", "tuck", "pledged"],
                     capture_output=True, text=True, timeout=180).stdout
check("实测：tuck 被拦下（本篇已有 tucked）",
      "tuck" in _r4 and "本篇已用同词元" in _r4)
check("实测：不撞的词仍放行", "pledged" in _r4 and "可用：" in _r4)


# ── VAL-15 不规则变化重复（2026-09-01 立）───────────────────────
# **同一形状的漏洞，第48篇是第三次暴露，这次补的是最后一道：**
#   第47篇 wore → 补了 vet 的「不规则跨篇」；
#   本轮 tuck → 补了 vet 的「篇内四层」；
#   **而检察官（逐篇）仍在用词干化比，对 wear/wore 无效**——
#   **第48篇实证：检察官报硬伤 0，而七层测试报 sworn 撞 swear。**
#   **一篇能过逐篇检查、却过不了全库测试，逐篇那道就等于摆设。**
# 现在三道网判据一致：**vet（写之前）／检察官 VAL-15（逐篇）／七层测试（封版）**。
print("\n[VAL-15] 不规则变化重复")
_ins = open(os.path.join(ROOT, "scripts/inspector.py"), encoding="utf-8").read()
check("VAL-15 已装进检察官", "VAL-15" in _ins and "_IRRG" in _ins)
check("查跨篇也查篇内",
      "第%s篇的 %s（同一动词）" in _ins and "本篇的 %s（同一动词）" in _ins)
check("豁免表与七层测试逐字一致",
      all(k in _ins for k in ("bite", "bit", "hide", "hid", "freeze", "froze"))
      and "_EX15" in _ins,
      "★ 两道网若豁免不同，等于又不一致")
check("写明三道网的分工",
      "一篇能过逐篇检查" in _ins or "逐篇那道等于摆设" in _ins
      or "两道网的判据必须一致" in _ins)
check("VAL-15 已挂铁律", bool(I.charter_of("VAL-15")))
# 造一处真错：本篇内部同时出现同一动词的两个形（不依赖全库）
_b15 = art(["He **wore** the coat all winter and had **worn** it the year before."],
           ["他整个冬天都**穿**(wore)那件外衣，前一年也**穿过**(worn)。"])
check("造错能逮住（篇内同一动词两形）",
      "VAL-15" in ids(I.inspect(_b15, arts)[0]),
      "wore 与 worn 是同一动词")
# ★ 反例整句都不能含不规则动词的任一形 ——
#   先试 kept（撞别篇 keep），再试保留 wore（它本身就撞第38篇 wear），两次都误判。
#   **这说明反例难挑，恰恰证明这层网眼很密。**
_g15 = art(["The **frayed** coat lasted the whole winter and never **split**."],
           ["那件**磨破的**(frayed)外衣撑过了整个冬天，一直没**裂**(split)。"])
check("不撞时不误报", "VAL-15" not in ids(I.inspect(_g15, arts)[0]))


# ── review 的停手信号（2026-09-01 第50篇实测立）──────────────────
# **第50篇第二稿在第11轮即已达标**：270 词 / 50 名额 / 阻塞项全清。
# **我却没停** —— 去改「§1 只有 36 词是残段」这条【二、结构】提示，
# **此后六轮再没回到达标**（279/49、267/47、270/47、276/49、267/47、279/49），
# **最终只能取回第11轮那一版 —— 不是继续改，是回头。**
# **病根：review 分了四节，却没说清只有第一节必须清零。**
print("\n[review] 阻塞项清零即明说可以停手")
_ag5 = open(os.path.join(ROOT, "scripts/agent.py"), encoding="utf-8").read()
check("阻塞项清零时印出停手信号", "阻塞项已清零" in _ag5)
check("说明后几节不必清零", "不是必须清零的东西" in _ag5)
check("给出一个可执行的自问", "这一处不改，这篇会差在哪里" in _ag5)
check("附上第50篇的实测教训", "白改六轮" in _ag5)
_ch6 = open(os.path.join(ROOT, "notes/总令.md"), encoding="utf-8").read()
check("《总令》也写了这条", "阻塞项清零就该停手" in _ch6,
      "★ 下一次会话开局读的是《总令》")


# ── review 与检察官的分级必须一致（2026-09-01 第51篇实测立）──────
# **上一轮刚给 review 装了「阻塞项清零即可停手」的信号，
#   而这一轮就发现：信号本身建在一条错的分类上。**
# **检察官把「关键词分布极差超限」判为 BAL-01 硬伤，
#   而 review 原先只把它列进【二、结构】。**
# 于是第51篇出现这一幕：**review 印出「阻塞项已清零，可以入库」，
#   入库后检察官立刻报 BAL-01 硬伤。**
# **这是我已修过三次的「两道网判据不一致」——而这次是我自己上一轮造的。**
# **以检察官为准：分布极差超限归【一、阻塞项】。**
print("\n[review] 分级与检察官一致")
_ag6 = open(os.path.join(ROOT, "scripts/agent.py"), encoding="utf-8").read()
check("分布极差归入阻塞项", "blocking.append(f\"关键词分布" in _ag6)
check("提示里点名 BAL-01", "BAL-01 判为硬伤" in _ag6,
      "★ 让人一眼看出这条是硬伤而非建议")
check("写明这是自造的不一致", "而这次是上一轮我自己造的" in _ag6
      or "这次是上一轮我自己造的" in _ag6)
# 检察官侧：确认 BAL-01 确为 hard
check("检察官 BAL-01 确为硬伤级",
      'Finding("BAL-01", "均衡", "hard"' in _ins)


# ── review 补齐纯英文侧的六条硬伤（2026-09-01）─────────────────
# **病根**：检察官有 29 条硬伤，而 review 的阻塞项原先只覆盖 9 条形状。
# 其中大半（MET-07/08/09、GLO-01/02、MET-06）**是中英对应与速查表，
#   写英文稿时中文还不存在，review 查不了也不该查**。
# **但另外六条是纯英文侧的，review 本可以查而没查**——
#   于是本会话每一篇都在入库后返工同样几条：
#   **第45篇 VAL-09 bascule + VAL-14 sold/stood；第46篇 VAL-10 apart + VAL-12 starts
#     + VAL-14 stood/ran；第48篇 VAL-14 worn/sworn；第49篇 VAL-02h beat + VAL-14 ran/fought；
#     第51篇 VAL-11 专名 Fougère。**
#   **每一次都是「英文定稿→入库→检察官报硬伤→回头改英文→中文跟着改」，
#     而这几条在写英文时就能查出来。**
# **实测回验**：拿第46、49、51 篇入库前那一版跑，
#   当时栽过的那几个词全部当场报出。
print("\n[review] 补齐纯英文侧硬伤")
_ag7 = open(os.path.join(ROOT, "scripts/agent.py"), encoding="utf-8").read()
for _rid in ("VAL-09", "VAL-10", "VAL-12", "VAL-14", "VAL-15", "MET-05"):
    check("review 阻塞项含 %s" % _rid, _rid in _ag7)
check("每条都点名「检察官判为硬伤」", _ag7.count("（检察官判为硬伤）") >= 2,
      "★ 让人一眼看出这是硬伤而非建议")
check("写明为什么不查中英对应那几条",
      "写英文稿时中文还不存在" in _ag7,
      "★ MET-07/08/09、GLO-01/02 此时查不了也不该查")
_r7 = subprocess.run([sys.executable, os.path.join(ROOT, "scripts/agent.py"),
                      "review", os.path.join(ROOT, "notes/第51篇-英文草稿-让分制.md")],
                     capture_output=True, text=True, timeout=300).stdout \
      if os.path.exists(os.path.join(ROOT, "notes/第51篇-英文草稿-让分制.md")) else ""
check("六条俱全（形状检查）",
      all(k in _ag7 for k in ("_v09", "_v10", "_v12", "_v14", "_v15", "_m05")))


# ── 选题第一步半：这样东西有没有别的说法（2026-09-01 立）────────
# **两篇因此弃稿**：第50篇第一稿讲「一份清单」、第52篇讲「一张棋盘」，
#   两族核心词都被前面的篇目占光，**都改到第十轮才发现、密度上不到 18%**。
# **★ 而我试过把它做成机械判据，被自己的数据否掉：**
#   按「核心物名词可用率」量，四篇成稿是 12／75／100／87 %，两篇弃稿是 0／25 %，
#   **而第47篇（12%）比第52篇（25%）还低，却成了稿。**
#   原因：**第47篇讲「排名制」，rank/order/merit 同样被占，但它改用
#   desert／placing／pecking order／scoreboard 绕开了。**
#   **「清单」与「棋盘」是物，物的名字不好换；「排名」是关系，说法可以换。**
# **故不立规则，只写进《总令》作为动笔前的一句自问。**
print("\n[选题] 这样东西有没有别的说法")
_ch7 = open(os.path.join(ROOT, "notes/总令.md"), encoding="utf-8").read()
check("《总令》写了这一步", "这样东西，我有没有第二种叫法" in _ch7)
check("举出两次弃稿的实例", "第50篇第一稿" in _ch7 and "第52篇" in _ch7)
check("写明第47篇是反例", "第47篇讲「排名制」" in _ch7,
      "★ 12% 却成了稿 —— 因为它绕开了")
check("写明为什么不立规则", "判不开，故不立规则" in _ch7)
# ★ 第52篇第二稿又栽一次：那一问要分名词与动词两半问。
# **名词全有**（entail／resettlement／freehold／covenant／perpetuity），
# **动词全无**（bargain／traded／swapped／surrendered／bound／binding／
#   settled／renewed／exchanged／struck 全被占），而那篇的论点是「一场交易」。
# **我只问了名词，写到一半才发现动词没了。**
check("那一问要分名词与动词两半", "名词与动词各问一遍" in _ch7)
check("给出可执行的做法", "一起丢给" in _ch7 and "两边都要有一半以上可用" in _ch7)
# ★ 第三种病（2026-09-01 第52篇第三稿实测）：论点太集中于少数几个词。
# 劳合社那稿名词动词都够，**但 syndicate 5 次、spiral 4 次、guarantee 4 次、
#   circle 3 次、pool 3 次 —— 正文非反复提不可，而名额只认第一次**，
#   撤掉重复加粗后名额从 48 掉到 36。
# **判别法：论点那句话里有没有一个词要贯穿五段。有就换角度。**
check("写了第三种病", "论点太集中于少数几个词" in _ch7)
check("给出判别法", "有没有一个词要贯穿五段" in _ch7)
# ★ 52 篇之后动词侧的实测（2026-09-01）：量过三遍，两次推翻自己。
# ① 按词尾粗分 → 动词形 60% 未占用，看着还宽；
# ② 套上 vet 的同根过滤 → 仍有 1155 个，看着仍宽；
# ③ **随机抽样去看** → 剩下的绝大多数是屈折形、专名、口语与形容词，
#    **真正可用的「过程动词」所剩无几。**
# **教训：只看数目会得出错误结论，必须抽样去看那些词长什么样。**
check("写明只看数目会骗人", "只看数目会得出错误结论" in _ch7)
check("写明必须抽样去看", "抽样去看那些词长什么样" in _ch7)
# ★ 第52篇丁稿实测：闸门三的警告应验后，正解是换说法而非硬凑。
# 撤重复加粗后名额 46→33，**用十四个同义词换掉重复处的第二次出现，换回 50**，
# **且换出来的词往往更准**（配方里本就是硅与瓷石，不是泛称的土与石）。
check("写了警告应验后的正解", "处置不是硬凑，是换说法" in _ch7)
check("给出实测的替换清单", "kaolin" in _ch7 and "stoneware" in _ch7)
check("举出成稿的反例", "每一段换一批词" in _ch7,
      "★ 第47、51 篇每段换一批词，故成稿")


# ── 把「靠记」的两条变成「自己会跑」（2026-09-01）──────────────
# **用户问：踩过的坑，写新文章时会自己从头查一遍吗？**
# **诚实的答案是：一半会，一半不会。** 逐条量过之后：
#   **十三条装在检察官里、每篇必跑**（中英失配／表义错位／白送词／生僻词／
#     初中词／小品词／专名／屈折绕过／不规则重复／段落词数／分布极差／数字写法）；
#   **四条有工具但要我主动去按**（vet／swap／movecheck／check）；
#   **六条连工具都没有，全靠读到并记住。**
# 本轮把第三类里能机械化的两条拿了出来：
#   **FACT-02**：facts 须带出处链接（硬伤级）——
#     实测全库 51 篇有 3 篇（40、42、51）只写「已核」而无链接，已补；
#   **topic.py**：选题三闸门一条命令跑完——
#     **回验第52篇乙稿当场被拦（名词 100%、动词 0%）。**
print("\n[机制] 把靠记的两条变成自己会跑")
_ins2 = open(os.path.join(ROOT, "scripts/inspector.py"), encoding="utf-8").read()
check("FACT-02 已装且为硬伤级",
      'Finding("FACT-02", "史实", "hard"' in _ins2)
check("FACT-02 写明「已核二字不是出处」", "「已核」二字不是出处" in _ins2)
check("FACT-02 已挂铁律", bool(I.charter_of("FACT-02")))
_tp = open(os.path.join(ROOT, "scripts/topic.py"), encoding="utf-8").read()
check("topic.py 三门俱全",
      "闸门一" not in _tp or all(k in _tp for k in ("可用词", "名词", "动词")))
check("闸门二缺一即否决", 'bad.append("闸门二·"' in _tp)
check("闸门三只提示不否决", "此门只警告不否决" in _tp,
      "★ 判据实测调过一次：≥4 放过了丙稿，改为 ≥3 且只提示")
check("《总令》写明这三步有命令可跑",
      "topic.py" in open(os.path.join(ROOT, "notes/总令.md"), encoding="utf-8").read())


# ── 让事后的检查点名被跳过的那一步（2026-09-01）──────────────────
# **四条「有工具但要我主动去按」的坑，其失败其实都被逮住了，只是逮得晚**：
#   补名额没跑 vet      → review「与其他篇冲突」／检察官 VAL-07/08（栽 6 次）
#   换词没走 swap       → 检察官 MET-07/08「中英失配」（栽 13 次）
#   挪句没跑 movecheck  → 检察官 BAL-01（栽 2 次）
#   改完没跑 check      → preflight 兜底（25 次自伤）
# **而报出来的时候，它只说「有冲突」，不说「这说明你没跑 vet」。**
# **本轮让这四处各自点名被跳过的那一步**——
#   不能阻止跳过，但能让跳过这件事当场可见、可归因。
print("\n[归因] 事后的检查点名被跳过的那一步")
_ins3 = open(os.path.join(ROOT, "scripts/inspector.py"), encoding="utf-8").read()
_ag8 = open(os.path.join(ROOT, "scripts/agent.py"), encoding="utf-8").read()
check("MET-07 点名 swap.py", "没走 `swap.py`" in _ins3,
      "★ 中英失配 13 次，全是英文先定、中文另起一轮")
check("MET-08 点名撤加粗也要两边改", "撤加粗不走 `swap.py`" in _ins3)
check("BAL-01 点名 movecheck", "movecheck.py NN" in _ins3,
      "★ 第34、46 篇没算就挪，极差 22→38、20→34")
check("review 冲突处点名 vet", "没跑过 `agent.py vet`" in _ag8,
      "★ 实测 19:7 —— 跑了的零撞车，没跑的全撞")
check("四处都附了实测次数",
      "13 次" in _ins3 and "19:7" in _ag8)


# ── 修既有篇目只做等长动作（2026-09-01 立，同一个错犯了三次）─────
# **第27篇**为消 STR-03 插一句，271→282 词，十轮削词越削越碎，中途掉到 68 分；
# **第19篇**插一句 19 词没同步削，88→77；改口说「等长替换」却又写更长，掉到 68。
# **两次都靠 git checkout 回滚才救回来。**
# **规矩：换一个词／改一个数字写法／拆一处中文括注 —— 只此三类。**
# **要插句就必须同段等量削词，否则把那条判为保留。**
print("\n[修订] 只做三类等长动作")
_ch8 = open(os.path.join(ROOT, "notes/总令.md"), encoding="utf-8").read()
check("《总令》写了这条", "只做三类等长动作" in _ch8)
check("三类动作写明", "换一个词" in _ch8 and "改一个数字的写法" in _ch8
      and "拆一处中文括注" in _ch8)
check("附上三次实测", "88→77" in _ch8 and "掉到 68" in _ch8)
check("写明判为保留是正当结论", "判为保留是正当结论" in _ch8,
      "★ 第19篇 STR-03、第41篇 STR-01 均判保留，理由写进 facts")


# ── vet 补齐 VAL-13 与 VAL-14（2026-09-01，第四次判据不一致）────────
# **两处都在修第37/45/47篇时暴露，vet 放行而检察官当场逮住**：
#   **bars** —— vet 放行，检察官 VAL-13 报「bars/barred 同词元」。
#     病根：**agent.stem 把 bars 削成 bars、barred 削成 barr，判为不同词**；
#     而 VAL-13 自带的 _lem 会去掉重复尾辅音（barred→bar）。
#     **处置：vet 改用与检察官逐字相同的 _lem13。**
#   **stood** —— vet 放行，检察官 VAL-14 报「原形 stand 是白送词 5.14」。
#     病根：**vet 里有 _IRR_GRP，却只用来查重复，没查原形是不是白送词。**
# **★ 而我第一版把 VAL-14 的条件写漏了一半**（只写「原形是白送词」，
#   漏了「而屈折形不是」），**把 flew 也拦了，回归测试当场报红**——
#   **照抄检察官的判据，不要自己另写。**
print("\n[vet] 补齐 VAL-13 与 VAL-14")
_ag9 = open(os.path.join(ROOT, "scripts/agent.py"), encoding="utf-8").read()
check("vet 用与检察官相同的 _lem13", "_lem13" in _ag9
      and "两道网必须用同一套判据" in _ag9)
check("vet 查屈折形绕过白送词", "屈折形绕过白送词检查" in _ag9)
check("条件与检察官逐字相同（两半都在）",
      "_zb >= 5.0 and _zw < 5.0" in _ag9
      and "_b14 in basic and wl not in basic" in _ag9,
      "★ 第一版漏了后半个条件，把 flew 也拦了")
_r9 = subprocess.run([sys.executable, os.path.join(ROOT, "scripts/agent.py"),
                      "vet", "45", "bars", "shackle"],
                     capture_output=True, text=True, timeout=180).stdout
check("实测：bars 被拦（撞本篇 barred）",
      "bars" in _r9 and "本篇已用同词元" in _r9)
check("实测：无冲突的词仍放行", "shackle" in _r9 and "可用：" in _r9)


# ── lockstep.py 等长改（2026-09-01 立，同一次会话犯了五次）──────────
# **修既有篇目时反复「插一句却不同步削词」，每次都要 git checkout 回滚**：
#   **第27篇** 271→282 词，随后十轮削词越削越碎，中途掉到 68 分；
#   **第19篇** 插一句 19 词，88→77；改口说「等长替换」却又写更长，掉到 68；
#   **第48篇** 加 6 词、**第51篇** 加 3 词，两篇同时变差。
# **★ 而《总令》里「只做三类等长动作」那条是我自己写的，写完两小时内又犯了两次。**
# **——写进文档挡不住，必须让机器拦。**
# 用法：`with guard('48'): ...改动...`，退出时比对词数，长了就抛错、改动不落盘。
print("\n[lockstep] 等长改，长了不落盘")
_ls = open(os.path.join(ROOT, "scripts/lockstep.py"), encoding="utf-8").read()
check("guard 比对改动前后词数", "def guard(" in _ls and "before = _read" in _ls)
check("长了即抛错", "raise AssertionError" in _ls and "插句必须同段等量削词" in _ls)
check("写明这是第几次犯", "犯了五次" in _ls or "第六次" in _ls)
check("留了显式加长的出口", "allow_growth" in _ls,
      "★ 确要加长时须显式写出，不能默认放过")
_r10 = subprocess.run([sys.executable, os.path.join(ROOT, "scripts/lockstep.py"), "48"],
                      capture_output=True, text=True, timeout=120).stdout
check("命令行可查单篇词数", "第48篇" in _r10 and "词" in _r10)

print("=" * 62)
print(f"通过 {ok} · 失败 {fail}")
sys.exit(1 if fail else 0)
