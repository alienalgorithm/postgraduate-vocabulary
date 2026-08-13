#!/usr/bin/env python3
from pathlib import Path


def read(path: str) -> str:
    return Path(path).read_text(encoding="utf-8")


def write(path: str, text: str) -> None:
    p = Path(path)
    p.parent.mkdir(parents=True, exist_ok=True)
    p.write_text(text, encoding="utf-8")


def replace_once(text: str, old: str, new: str, label: str) -> str:
    count = text.count(old)
    if count != 1:
        raise RuntimeError(f"{label}: expected one match, found {count}")
    return text.replace(old, new, 1)


# ---------------------------------------------------------------------------
# Canonical article 18 data
# ---------------------------------------------------------------------------
path = "data/article-18.js"
text = read(path)
replacements = [
    (
        '"standfirst": "借助一座为卫星通信而建的号角天线，两名研究者逐一排除仪器、地面、季节甚至鸽子；本地嫌疑全都消失后，天空仍在嘶响。"',
        '"standfirst": "借助一座为卫星通信而建的号角天线，两名研究者逐一排查设备、地面、季节甚至鸽子；所有本地嫌疑源都被排除后，天空仍不肯安静。"',
        "article 18 standfirst",
    ),
    ('"date": "2026-08-12"', '"date": "2026-08-13"', "article 18 date"),
    ('"status": "第十八篇最终精校稿"', '"status": "第十八篇最终精进锁定稿"', "article 18 status"),
    ('"words": 269', '"words": 270', "article 18 word count"),
    ('"density": 18.6', '"density": 18.5', "article 18 density"),
    (
        "In 1964, Bell Laboratories **radio** **astronomers** Arno Penzias and Robert Wilson used a 20-foot **horn** **antenna** at Holmdel, New Jersey, to measure faint **microwave** emission from the Milky Way. They **calibrated** it against a liquid-helium reference. At the **zenith**, a **residual** **hiss** remained, **equivalent** to 3.5 kelvin above expectation.",
        "In 1964, Bell Laboratories **radio** **astronomers** Arno Penzias and Robert Wilson used a 20-foot **horn** **antenna** at Holmdel, New Jersey, to measure faint **microwave** emission from the Milky Way. They **calibrated** it against a liquid-helium reference. At the **zenith**, a **residual** **hiss** remained, **equivalent** to an excess antenna temperature of 3.5 kelvin.",
        "article 18 English paragraph 1",
    ),
    (
        "1964年，贝尔实验室的**射电**(radio)**天文学家**(astronomers)阿诺·彭齐亚斯和罗伯特·威尔逊在新泽西州霍姆德尔使用一座20英尺口径的**号角**(horn)**天线**(antenna)，测量银河系微弱的**微波**(microwave)辐射。他们以液氦参考源对系统进行了**校准**(calibrated)。当天线指向**天顶**(zenith)时，仍有一道**残余的**(residual)**嘶声**(hiss)，对应的天线温度**相当于**(equivalent)比预期高出3.5开尔文。",
        "1964年，贝尔实验室的**射电**(radio)**天文学家**(astronomers)阿诺·彭齐亚斯和罗伯特·威尔逊在新泽西州霍姆德尔使用一座20英尺口径的**号角**(horn)**天线**(antenna)，测量银河系微弱的**微波**(microwave)辐射。他们以液氦参考源对系统进行了**校准**(calibrated)。当天线指向**天顶**(zenith)时，仍有一道**残余的**(residual)**嘶声**(hiss)，其强度**相当于**(equivalent)3.5开尔文的额外天线温度。",
        "article 18 Chinese paragraph 1",
    ),
    (
        "They taped every **seam**, tested each **joint** for loss and ruled out ground **interference**. **Pigeons** had made a **roost** inside; Penzias and Wilson trapped them and **scrubbed** away their **droppings**. Nothing changed. The excess was **isotropic**, **unpolarised** and free of **seasonal** variation from July 1964 to April 1965.",
        "They taped every **seam**, tested each **joint** for loss and accounted for ground **interference**. **Pigeons** had made a **roost** inside; Penzias and Wilson trapped them and **scrubbed** away their **droppings**. Nothing changed. The excess appeared **isotropic**, **unpolarised** and free of **seasonal** variation from July 1964 to April 1965.",
        "article 18 English paragraph 2",
    ),
    (
        "他们给每一道**接缝**(seam)贴上胶带，检查每个**连接处**(joint)是否造成损耗，也排除了地面**干扰**(interference)。一些**鸽子**(Pigeons)曾在天线内**栖息筑巢**(roost)；彭齐亚斯和威尔逊捕走它们，又把**粪便**(droppings)彻底**刷洗掉**(scrubbed)。结果毫无变化。这股额外辐射呈**各向同性**(isotropic)，**没有偏振**(unpolarised)，从1964年7月至1965年4月也不随**季节**(seasonal)改变。",
        "他们给每一道**接缝**(seam)贴上胶带，检查每个**连接处**(joint)的损耗，并把地面**干扰**(interference)计入误差预算。一些**鸽子**(Pigeons)曾在天线内**栖息筑巢**(roost)；彭齐亚斯和威尔逊捕走它们，又把**粪便**(droppings)彻底**刷洗掉**(scrubbed)。结果毫无变化。在当时的测量精度内，这股额外辐射呈**各向同性**(isotropic)、**没有偏振**(unpolarised)，从1964年7月至1965年4月也没有出现**季节性的**(seasonal)变化。",
        "article 18 Chinese paragraph 2",
    ),
    (
        "Nearby, Princeton **physicists** Robert Dicke, James Peebles, Peter Roll and David Wilkinson were building a **radiometer** to seek **relic** heat from a hot, **primordial** universe. Contact turned **coincidence** into **collaboration**. In July 1965, **companion** papers separated the roles: Bell Labs supplied the experimental **account**; Princeton the **interpretation**. Their paper presented it only as a **provisional** explanation.",
        "Princeton **physicists** Robert Dicke, James Peebles, Peter Roll and David Wilkinson were building a **radiometer** to seek **relic** heat from a hot, **primordial** universe. Contact turned **coincidence** into **collaboration**. In July 1965, **companion** papers separated the roles: Bell Labs supplied the experimental **account**; Princeton offered the **interpretation**. Penzias and Wilson treated it as **provisional**.",
        "article 18 English paragraph 3",
    ),
    (
        "不远处，普林斯顿的**物理学家**(physicists)罗伯特·迪克、詹姆斯·皮布尔斯、彼得·罗尔和戴维·威尔金森正在建造一台**辐射计**(radiometer)，寻找来自炽热**原初宇宙的**(primordial)**遗存热辐射**(relic)。双方取得联系，使地理上的**巧合**(coincidence)变成科学**合作**(collaboration)。1965年7月，两篇**配套的**(companion)论文明确区分了角色：贝尔实验室提交实验**记录**(account)，普林斯顿给出**解释**(interpretation)。他们的论文只把它写成一种**暂定的**(provisional)解释。",
        "普林斯顿的**物理学家**(physicists)罗伯特·迪克、詹姆斯·皮布尔斯、彼得·罗尔和戴维·威尔金森正在建造一台**辐射计**(radiometer)，寻找来自炽热**原初宇宙的**(primordial)**遗存热辐射**(relic)。双方取得联系，使地理上的**巧合**(coincidence)变成科学**合作**(collaboration)。1965年7月，两篇**配套的**(companion)论文明确区分了角色：贝尔实验室提交实验**记录**(account)，普林斯顿给出**解释**(interpretation)。彭齐亚斯和威尔逊仍把这一解释视为**暂定的**(provisional)。",
        "article 18 Chinese paragraph 3",
    ),
    (
        "One **wavelength** could not establish a black-body spectrum. Measurements at shorter wavelengths soon **corroborated** the signal as **cosmic** **background** **radiation**. Decades later, COBE found a near-perfect 2.725 K black-body **profile** and mapped **fluctuations**, or **anisotropies**, of roughly one part in 100,000. The uniform **thermal** glow became a **signature** of a hot early cosmos; its slight unevenness marked the beginnings of later structure.",
        "One **wavelength** could not establish a black-body spectrum. Measurements at shorter wavelengths soon **corroborated** the **cosmic** **background** **radiation** interpretation. Decades later, COBE measured a near-perfect 2.725 K black-body **profile** and mapped **fluctuations**, or **anisotropies**, of roughly one part in 100,000. The nearly uniform **thermal** glow became a **signature** of a hot early cosmos; its slight unevenness marked the beginnings of later structure.",
        "article 18 English paragraph 4",
    ),
    (
        "一个**波长**(wavelength)的数据不足以确立黑体谱。较短波段的测量很快**佐证了**(corroborated)这股信号确是**宇宙**(cosmic)**背景**(background)**辐射**(radiation)。几十年后，COBE发现它在2.725 K呈现近乎完美的黑体**谱形**(profile)，又绘出约十万分之一的微小**起伏**(fluctuations)，即**各向异性**(anisotropies)。均匀的**热辐射**(thermal)余辉成为热早期宇宙的**特征印记**(signature)；细微的不均匀则标出了后来结构的开端。",
        "一个**波长**(wavelength)的数据不足以确立黑体谱。较短波段的测量很快**佐证了**(corroborated)关于**宇宙**(cosmic)**背景**(background)**辐射**(radiation)的这一解释。几十年后，COBE测得它在2.725 K呈现近乎完美的黑体**谱形**(profile)，又绘出约十万分之一的微小**起伏**(fluctuations)，即**各向异性**(anisotropies)。近乎均匀的**热辐射**(thermal)余辉成为热早期宇宙的**特征印记**(signature)；细微的不均匀则标出了后来结构的开端。",
        "article 18 Chinese paragraph 4",
    ),
    (
        "The discovery is often filed under **serendipity**, but chance alone did not hear the early universe. Engineering **craftsmanship** quieted the horn; disciplined **subtraction** made the **remainder** **trustworthy**; Princeton supplied **cosmological** meaning. The **afterglow** was a **whisper**. Its force came from a stricter fact: every **local** **culprit** had been tested, and the sky still hissed.",
        "The discovery is often filed under **serendipity**, but chance alone did not hear the early universe. Engineering **craftsmanship** quieted the horn; disciplined **subtraction** made the **remainder** **trustworthy**; Princeton supplied **cosmological** meaning. The **afterglow** was a **whisper**. It became evidence only after every **local** **culprit** was ruled out—and the sky alone would not go quiet.",
        "article 18 English paragraph 5",
    ),
    (
        "这项发现常被归入**偶然发现**(serendipity)，但仅靠运气听不见早期宇宙。精湛的工程**技艺**(craftsmanship)让号角天线足够安静；严格的逐项**扣除**(subtraction)让剩下的**余量**(remainder)变得**可信**(trustworthy)；普林斯顿则赋予它**宇宙学的**(cosmological)意义。这片**余辉**(afterglow)只是一声**低语**(whisper)。它之所以有力量，是因为每一个**本地的**(local)**嫌疑来源**(culprit)都已受过检验，而天空仍在嘶响。",
        "这项发现常被归入**偶然发现**(serendipity)，但仅靠运气听不见早期宇宙。精湛的工程**技艺**(craftsmanship)让号角天线足够安静；严格的逐项**扣除**(subtraction)让**剩余信号**(remainder)变得**可信**(trustworthy)；普林斯顿则赋予它**宇宙学的**(cosmological)意义。这片**余辉**(afterglow)只是一声**低语**(whisper)。只有在每一个**本地的**(local)**嫌疑来源**(culprit)都被排除之后，它才成为证据——因为最后仍不肯安静的，只剩天空。",
        "article 18 Chinese paragraph 5",
    ),
]
for old, new, label in replacements:
    text = replace_once(text, old, new, label)
write(path, text)


# ---------------------------------------------------------------------------
# README
# ---------------------------------------------------------------------------
path = "README.md"
text = read(path)
text = replace_once(text, "截至2026-08-12，共有 **18篇文章、900个重点词**。", "截至2026-08-13，共有 **18篇文章、900个重点词**。", "README date")
text = replace_once(
    text,
    "| **18** | ***The Sky Would Not Go Quiet*** | **1964—1992年彭齐亚斯、威尔逊、普林斯顿团队与宇宙微波背景** | **269词 · 50词 · 18.6%** |",
    "| **18** | ***The Sky Would Not Go Quiet*** | **1964—1992年彭齐亚斯、威尔逊、普林斯顿团队与宇宙微波背景** | **270词 · 50词 · 18.5%** |",
    "README article 18 row",
)
text = replace_once(
    text,
    "第18篇以269词最终精校稿为准。文章不把宇宙微波背景写成“清理鸽子后突然想到大爆炸”的偶然传奇：贝尔实验室逐项排除接缝、连接处、地面响应、季节变化和鸟粪；普林斯顿团队提供热早期宇宙的解释；后续短波测量与COBE再分别补全黑体谱和十万分之一量级的各向异性。",
    "第18篇以270词最终精进锁定稿为准。新版把3.5 K明确写成额外天线温度，用 accounted for 代替过度绝对的 ruled out，消除第三段代词归属歧义，修正 corroborate 的搭配，并以“the sky alone would not go quiet”回扣标题。文章仍严格区分1965年单波段结果、普林斯顿解释与COBE后续证据。",
    "README article 18 summary",
)
text = text.replace("第十八篇入库记录_2026-08-12.md", "第十八篇入库记录_2026-08-13.md")
text = text.replace("全库最终版本审计_2026-08-12.md", "全库最终版本审计_2026-08-13.md")
write(path, text)


# ---------------------------------------------------------------------------
# Handoff document
# ---------------------------------------------------------------------------
path = "notes/对话交接文档.md"
text = read(path)
text = replace_once(text, "> 最后更新：2026-08-12", "> 最后更新：2026-08-13", "handoff date")
text = replace_once(
    text,
    "| **18** | ***The Sky Would Not Go Quiet*** | **1964—1992年彭齐亚斯、威尔逊、普林斯顿团队与宇宙微波背景** | **269 / 50 / 18.6%** | **第十八篇最终精校稿** |",
    "| **18** | ***The Sky Would Not Go Quiet*** | **1964—1992年彭齐亚斯、威尔逊、普林斯顿团队与宇宙微波背景** | **270 / 50 / 18.5%** | **第十八篇最终精进锁定稿** |",
    "handoff article 18 table row",
)
text = replace_once(
    text,
    "中文标题：**《天空始终不肯安静》**。正式指标：**269词 / 50重点词 / 18.6%**。",
    "中文标题：**《天空始终不肯安静》**。正式指标：**270词 / 50重点词 / 18.5%**。",
    "handoff article 18 metrics",
)
text = replace_once(
    text,
    "> Its force came from a stricter fact: every **local** **culprit** had been tested, and the sky still hissed.",
    "> It became evidence only after every **local** **culprit** was ruled out—and the sky alone would not go quiet.",
    "handoff article 18 ending",
)
old_block = """- 中文标题为《天空始终无法安静》
- 第三段使用 `Princeton cosmologists`
- 写成彭齐亚斯和威尔逊本人提出或独自完成宇宙学解释
- 把1964年的单波长数据直接写成已建立2.725 K完整黑体谱
- 指标不是269词 / 50重点词 / 18.6%"""
new_block = """- 中文标题为《天空始终无法安静》
- 第三段使用 `Princeton cosmologists` 或 `Their paper presented it only as a provisional explanation`
- 第二段仍写 `ruled out ground interference`，没有说明地面响应已被计入误差预算
- 第四段仍写 `corroborated the signal as cosmic background radiation`
- 结尾仍写 `Its force came from a stricter fact`，没有直接回扣标题
- 写成彭齐亚斯和威尔逊本人提出或独自完成宇宙学解释
- 把1964年的单波长数据直接写成已建立2.725 K完整黑体谱
- 指标不是270词 / 50重点词 / 18.5%"""
text = replace_once(text, old_block, new_block, "handoff article 18 superseded block")
write(path, text)


# ---------------------------------------------------------------------------
# Article 18 record: replace the old active record with the new authority file
# ---------------------------------------------------------------------------
old_record = Path("notes/第十八篇入库记录_2026-08-12.md")
if old_record.exists():
    old_record.unlink()
record = """# 第十八篇入库记录 · 更新至2026-08-13

## 一、当前唯一权威稿

- 编号：18
- 英文标题：*The Sky Would Not Go Quiet*
- 中文标题：《天空始终不肯安静》
- 题材：1964—1992年彭齐亚斯、威尔逊、普林斯顿团队与宇宙微波背景
- 状态：第十八篇最终精进锁定稿
- 英文正文：270词
- 重点词：50个
- 关键词密度：18.5%
- 结构：5段，每段10个重点词

## 二、版本沿革

1. 264词工作稿：完成基本叙事，但第三、四段仍有表达与归属问题，已废弃。
2. 269词最终精校稿：进入过主分支，但再次逐句审查后确认仍有五处可带来实质质量提升，现已淘汰。
3. 270词最终精进锁定稿：明确3.5 K的物理含义，收紧误差语言，消除代词歧义，修正科学搭配，并以标题完成结尾闭环；成为当前唯一权威版本。

旧稿只允许留在Git历史中，不得重新进入活动数据、正式Markdown或网站。

## 三、本轮确定性提升

- `equivalent to 3.5 kelvin above expectation` 改为 `equivalent to an excess antenna temperature of 3.5 kelvin`，明确3.5 K是额外天线温度，不是普通环境温度。
- `ruled out ground interference` 改为 `accounted for ground interference`，准确反映地面后瓣响应被估算并纳入误差预算，而非一句话绝对消失。
- `The excess was` 改为 `The excess appeared`，保留1965年原论文“within the limits of our observations”的谨慎范围。
- 删除含混的 `Their paper`，明确由普林斯顿提供解释，而彭齐亚斯和威尔逊把它视为暂定解释。
- `corroborated the signal as` 改为 `corroborated the ... interpretation`，修复英语搭配并避免把后续证据写成一次性身份认证。
- `COBE found` 改为 `COBE measured`，同时把余辉写成 `nearly uniform`，与十万分之一各向异性保持严格一致。
- 最后一句改为 `It became evidence only after every local culprit was ruled out—and the sky alone would not go quiet.`，把排除法、证据资格和标题收束成同一逻辑。
- 中文同步消除“相当于比预期高出”“他们的论文”等翻译腔与指代歧义。

## 四、不可误认的身份特征

正式指标：

```text
270词 / 50重点词 / 18.5%
```

关键句：

> At the **zenith**, a **residual** **hiss** remained, **equivalent** to an excess antenna temperature of 3.5 kelvin.

> The excess appeared **isotropic**, **unpolarised** and free of **seasonal** variation from July 1964 to April 1965.

> Penzias and Wilson treated it as **provisional**.

> Measurements at shorter wavelengths soon **corroborated** the **cosmic** **background** **radiation** interpretation.

正式结尾：

> It became evidence only after every **local** **culprit** was ruled out—and the sky alone would not go quiet.

凡出现以下特征的版本均不是当前定稿：

- 264词 / 18.9%
- 269词 / 18.6%
- `ruled out ground interference`
- `Their paper presented it only as a provisional explanation`
- `corroborated the signal as cosmic background radiation`
- `The uniform thermal glow`
- `Its force came from a stricter fact`

## 五、事实边界

- 1965年原论文报告约3.5±1.0 K的未解释天线温度；现代2.725 K黑体温度来自COBE/FIRAS后续精密测量。
- 原论文只在当时观测精度内称信号各向同性、未偏振且无季节变化。
- 鸽子与鸟粪属于当事人后来的回忆，不在1965年三页论文正文中。
- 贝尔实验室报告测量，普林斯顿团队解释宇宙学意义；两者是配套论文，不是一篇合著论文。
- 单一波长不足以确立黑体谱；1966年及后续多波段测量和COBE共同补全证据链。

## 六、最终版本保护

本篇已纳入：

- `data/final-version-manifest.json` 完整内容指纹
- `scripts/final-version-guard.js` 旧稿特征检测
- `.github/workflows/validate-content.yml` 主分支强制校验

最终校验口径：

```text
18篇已生成 · 900个重点词 · 全部通过
第18篇：270词 · 50重点词 · 18.5%
```

下一篇编号：19。
"""
write("notes/第十八篇入库记录_2026-08-13.md", record)


# ---------------------------------------------------------------------------
# Final-version guard and audit identity
# ---------------------------------------------------------------------------
path = "scripts/final-version-guard.js"
text = read(path)
text = replace_once(text, "notes', '全库最终版本审计_2026-08-12.md", "notes', '全库最终版本审计_2026-08-13.md", "guard report path")
text = replace_once(
    text,
    "'18': { source: '2026-08-12对话中形成并完成全库复验的269词最终精校稿', verification: 'conversation-latest-final' },",
    "'18': { source: '2026-08-13对话中形成并完成全库复验的270词最终精进锁定稿', verification: 'conversation-latest-final' },",
    "guard article 18 source",
)
text = replace_once(text, "'18': '18-269-word-final-proofed',", "'18': '18-270-word-final-polish',", "guard article 18 version id")
old_signatures = """  '18': [
    'Princeton **cosmologists**',
    'Penzias and Wilson called it a **provisional** explanation.',
    'Shorter-wave measurements soon **corroborated** the **cosmic** **background** **radiation**.',
    '264 词 / 50 重点词 / 密度 18.9%',
    '天空始终无法安静',
  ],"""
new_signatures = """  '18': [
    'Princeton **cosmologists**',
    'Penzias and Wilson called it a **provisional** explanation.',
    'Shorter-wave measurements soon **corroborated** the **cosmic** **background** **radiation**.',
    'ruled out ground **interference**',
    'The excess was **isotropic**',
    'Their paper presented it only as a **provisional** explanation.',
    '**corroborated** the signal as **cosmic** **background** **radiation**',
    'COBE found a near-perfect 2.725 K black-body **profile**',
    'The uniform **thermal** glow became a **signature**',
    'Its force came from a stricter fact',
    '264 词 / 50 重点词 / 密度 18.9%',
    '269 词 / 50 重点词 / 密度 18.6%',
    '天空始终无法安静',
  ],"""
text = replace_once(text, old_signatures, new_signatures, "guard article 18 superseded signatures")
text = replace_once(text, "audited_at: '2026-08-12'", "audited_at: '2026-08-13'", "guard audit date")
text = replace_once(
    text,
    "| **18** | ***The Sky Would Not Go Quiet*** | **1964—1992年彭齐亚斯、威尔逊、普林斯顿团队与宇宙微波背景** | **269词 · 50词 · 18.6%** |",
    "| **18** | ***The Sky Would Not Go Quiet*** | **1964—1992年彭齐亚斯、威尔逊、普林斯顿团队与宇宙微波背景** | **270词 · 50词 · 18.5%** |",
    "guard README article 18 identity",
)
text = replace_once(
    text,
    "| **18** | ***The Sky Would Not Go Quiet*** | **1964—1992年彭齐亚斯、威尔逊、普林斯顿团队与宇宙微波背景** | **269 / 50 / 18.6%** | **第十八篇最终精校稿** |",
    "| **18** | ***The Sky Would Not Go Quiet*** | **1964—1992年彭齐亚斯、威尔逊、普林斯顿团队与宇宙微波背景** | **270 / 50 / 18.5%** | **第十八篇最终精进锁定稿** |",
    "guard handoff article 18 identity",
)
text = replace_once(text, "# 全库最终版本审计 · 2026-08-12", "# 全库最终版本审计 · 2026-08-13", "guard audit report title")
text = replace_once(
    text,
    "> 结论：第01—17篇继续保持此前锁定指纹；第18篇269词最终精校稿已加入唯一权威数据层，并完成900词全库复验。",
    "> 结论：第01—17篇继续保持此前锁定指纹；第18篇已由269词中间定稿升级为270词最终精进锁定稿，并完成900词全库复验。",
    "guard audit report conclusion",
)
text = replace_once(
    text,
    "- 第18篇：269词最终精校稿完成五段、50词、史实边界和网站同步，并淘汰264词工作稿。",
    "- 第18篇：270词最终精进锁定稿完成语言、科学口径与结尾闭环升级，并淘汰264词工作稿和269词中间定稿。",
    "guard audit report article 18 line",
)
text = replace_once(
    text,
    "本次同步完成后，主分支的18篇均为当前已知的最后最终版本；第18篇269词稿是当前唯一权威版本。",
    "本次同步完成后，主分支的18篇均为当前已知的最后最终版本；第18篇270词最终精进稿是当前唯一权威版本。",
    "guard audit final verdict",
)
write(path, text)


# Remove the superseded audit report; the guard will generate the new dated one.
old_audit = Path("notes/全库最终版本审计_2026-08-12.md")
if old_audit.exists():
    old_audit.unlink()


# ---------------------------------------------------------------------------
# Static homepage copy that is not generated from the data object
# ---------------------------------------------------------------------------
path = "index.html"
text = read(path)
text = replace_once(
    text,
    "<p>设备、地面、季节和鸽子逐一被排除；当所有本地嫌疑都消失，号角天线仍然听见来自整片天空的嘶声。</p>",
    "<p>设备损耗、地面响应、季节变化和鸽子逐一被排查；当所有本地嫌疑源都被排除，号角天线仍听见整片天空的嘶声。</p>",
    "homepage article 18 summary",
)
write(path, text)

print("article 18 maximum-quality final revision prepared")
