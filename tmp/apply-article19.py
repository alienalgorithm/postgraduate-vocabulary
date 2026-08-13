#!/usr/bin/env python3
from __future__ import annotations

import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent


def read(path: str) -> str:
    return (ROOT / path).read_text(encoding="utf-8")


def write(path: str, text: str) -> None:
    target = ROOT / path
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_text(text, encoding="utf-8")


def replace_once(text: str, old: str, new: str, label: str) -> str:
    count = text.count(old)
    if count != 1:
        raise RuntimeError(f"{label}: expected one occurrence, found {count}")
    return text.replace(old, new, 1)


# 1. Final microscopic prose correction before synchronization.
data_path = "data/article-19.js"
data = read(data_path)
data = replace_once(data, "**discard** lower-ranked display work", "**discard** lower-ranked monitor work", "article 19 precise discarded work")
data = replace_once(data, "**丢弃**(discard)优先级较低的显示任务", "**丢弃**(discard)优先级较低的监测显示任务", "article 19 Chinese precise discarded work")
write(data_path, data)

# 2. Website entry points and public metadata.
index = read("index.html")
for old, new, label in [
    ("十八篇《经济学人》风格双语科普短文，900个考研重点词", "十九篇《经济学人》风格双语科普短文，950个考研重点词", "index description"),
    ("把900个考研词放回值得读完的知识故事里。", "把950个考研词放回值得读完的知识故事里。", "index og description"),
    ("考研词汇 · 双语科普读本 · 第十八篇已入库", "考研词汇 · 双语科普读本 · 第十九篇已入库", "index eyebrow"),
    ('href="article.html?a=the-sky-would-not-go-quiet">阅读最新一篇', 'href="article.html?a=five-alarms-still-descending">阅读最新一篇', "index latest link"),
    (">浏览900词词库<", ">浏览950词词库<", "index word bank button"),
    ("3.5 K ABOVE EXPECTATION", "1201 / 1202 · EXEC OVERFLOW", "index hero label"),
    ("THE SKY WOULD NOT GO QUIET", "FIVE ALARMS, STILL DESCENDING", "index hero caption"),
    ("NEW · 18", "NEW · 19", "index latest number"),
    ("设备损耗、地面响应、季节变化和鸽子逐一被排查；当所有合理的本地嫌疑源都被排除，号角天线仍听见整片天空的嘶声。", "五次程序警报在下降途中亮起；计算机丢弃可等待的任务，地面团队则必须判断过载后的‘鹰号’是否仍能继续。", "index latest summary"),
    ("十八篇知识故事", "十九篇知识故事", "index archive title"),
    ("从霍乱、深海生态与臭氧洞，到地球内核、原子结构，以及一片无法被本地噪声解释的宇宙余辉。", "从霍乱、深海生态与臭氧洞，到地球内核、原子结构、宇宙余辉，以及一台在过载中继续导航的登月计算机。", "index archive summary"),
    (">900词索引<", ">950词索引<", "index footer word bank"),
    ("十八篇 · 900重点词", "十九篇 · 950重点词", "index footer count"),
]:
    index = replace_once(index, old, new, label)
index = replace_once(index, '<script src="data/article-18.js"></script>\n<script src="assets/site.js"></script>', '<script src="data/article-18.js"></script>\n<script src="data/article-19.js"></script>\n<script src="assets/site.js"></script>', "index article 19 loader")
write("index.html", index)

article_page = read("article.html")
article_page = replace_once(article_page, "十八篇考研词汇双语科普文章", "十九篇考研词汇双语科普文章", "article page description")
article_page = replace_once(article_page, ">900词索引<", ">950词索引<", "article page footer")
article_page = replace_once(article_page, '<script src="data/article-18.js"></script>\n<script src="assets/site.js"></script>', '<script src="data/article-18.js"></script>\n<script src="data/article-19.js"></script>\n<script src="assets/site.js"></script>', "article page loader")
write("article.html", article_page)

words = read("words.html")
for old, new, label in [
    ("<title>900词词库 · 记词</title>", "<title>950词词库 · 记词</title>", "words title"),
    ("十八篇双语科普文章使用过的900个考研重点词", "十九篇双语科普文章使用过的950个考研重点词", "words description"),
    ("VOCABULARY INDEX · 01—18", "VOCABULARY INDEX · 01—19", "words range"),
    ("<h1>900个词，", "<h1>950个词，", "words heading"),
    ('href="article.html?a=the-sky-would-not-go-quiet">最新文章', 'href="article.html?a=five-alarms-still-descending">最新文章', "words latest link"),
    ("900个词元 · 18篇文章", "950个词元 · 19篇文章", "words footer count"),
]:
    words = replace_once(words, old, new, label)
words = replace_once(words, '<script src="data/article-18.js"></script>\n<script src="assets/site.js"></script>', '<script src="data/article-18.js"></script>\n<script src="data/article-19.js"></script>\n<script src="assets/site.js"></script>', "words loader")
write("words.html", words)

not_found = read("404.html")
not_found = replace_once(not_found, "打开900词词库", "打开950词词库", "404 word bank")
write("404.html", not_found)

manifest = read("manifest.webmanifest")
manifest = replace_once(manifest, '"description": "十八篇双语科普短文与900个考研重点词。"', '"description": "十九篇双语科普短文与950个考研重点词。"', "web manifest description")
write("manifest.webmanifest", manifest)

share = read("assets/share-card.svg")
share = replace_once(share, "十八篇双语科普短文 · 900个考研重点词", "十九篇双语科普短文 · 950个考研重点词", "share card count")
share = replace_once(share, "WORDS IN CONTEXT · 01—18", "WORDS IN CONTEXT · 01—19", "share card range")
write("assets/share-card.svg", share)

sitemap = read("sitemap.xml")
sitemap = replace_once(sitemap, "  <url><loc>https://alienrocketbus.github.io/postgraduate-vocabulary/article.html?a=the-sky-would-not-go-quiet</loc></url>\n</urlset>", "  <url><loc>https://alienrocketbus.github.io/postgraduate-vocabulary/article.html?a=the-sky-would-not-go-quiet</loc></url>\n  <url><loc>https://alienrocketbus.github.io/postgraduate-vocabulary/article.html?a=five-alarms-still-descending</loc></url>\n</urlset>", "sitemap article 19")
write("sitemap.xml", sitemap)

# 3. README: make article 19 the only latest row and update active counts.
readme = read("README.md")
for old, new, label in [
    ("打印和900词索引", "打印和950词索引", "README intro count"),
    ("共有 **18篇文章、900个重点词**", "共有 **19篇文章、950个重点词**", "README archive count"),
    ("网站当前实际加载第01—18篇，并自动计算18篇、900个重点词和1645个尚未使用词元。", "网站当前实际加载第01—19篇，并自动计算19篇、950个重点词和1595个尚未使用词元。", "README site stats"),
    ("第18篇作为最新定稿专题展示", "第19篇作为最新定稿专题展示", "README latest feature"),
    ("十八篇文章卡片", "十九篇文章卡片", "README cards"),
    ("### 900词词库", "### 950词词库", "README word bank heading"),
    ("01—18 Markdown定稿", "01—19 Markdown定稿", "README Markdown range"),
    ("同一套18篇全量校验", "同一套19篇全量校验", "README CI count"),
    ("words.html                 900词索引", "words.html                 950词索引", "README tree word bank"),
]:
    readme = replace_once(readme, old, new, label)
old_row18 = "| **18** | ***The Sky Would Not Go Quiet*** | **1964—1992年彭齐亚斯、威尔逊、普林斯顿团队与宇宙微波背景** | **270词 · 50词 · 18.5%** | [网页](https://alienrocketbus.github.io/postgraduate-vocabulary/article.html?a=the-sky-would-not-go-quiet) · [Markdown](articles/18-the-sky-would-not-go-quiet.md) |"
new_rows = "| 18 | *The Sky Would Not Go Quiet* | 1964—1992年彭齐亚斯、威尔逊、普林斯顿团队与宇宙微波背景 | 270词 · 50词 · 18.5% | [网页](https://alienrocketbus.github.io/postgraduate-vocabulary/article.html?a=the-sky-would-not-go-quiet) · [Markdown](articles/18-the-sky-would-not-go-quiet.md) |\n| **19** | ***Five Alarms, Still Descending*** | **1969年阿波罗11号1201/1202程序警报、优先级软件与地面‘继续’判断** | **270词 · 50词 · 18.5%** | [网页](https://alienrocketbus.github.io/postgraduate-vocabulary/article.html?a=five-alarms-still-descending) · [Markdown](articles/19-five-alarms-still-descending.md) |"
readme = replace_once(readme, old_row18, new_rows, "README latest rows")
article19_note = "第19篇以270词最终精进锁定稿为准。文章把五次1201/1202警报拆成三层：雷达接口与周期显示共同压缩计算余量；优先级执行程序通过重启、保留关键状态和丢弃可等待任务维持制导；Steve Bales与Jack Garman再依据遥测作出‘继续’判断。结尾不把可靠性写成‘永不失败’，而是写成系统在过载前已经决定什么可以等待。\n\n"
readme = replace_once(readme, "第18篇以270词最终精进锁定稿为准。", article19_note + "第18篇以270词最终精进锁定稿为准。", "README article 19 note")
readme = replace_once(readme, "data/article-18.js    # 第18篇\n```", "data/article-18.js    # 第18篇\ndata/article-19.js    # 第19篇\n```", "README data list")
readme = replace_once(readme, "    └── 第十八篇入库记录_2026-08-13.md", "    ├── 第十八篇入库记录_2026-08-13.md\n    └── 第十九篇入库记录_2026-08-13.md", "README notes tree")
write("README.md", readme)

# 4. Handoff: current state, table, article identity, data order and next step.
handoff = read("notes/对话交接文档.md")
handoff = replace_once(handoff, "当前权威状态：**十八篇最终定稿，900个重点词，第18篇与18篇网站均已进入主分支。**", "当前权威状态：**十九篇最终定稿，950个重点词，第19篇与19篇网站均已进入主分支。**", "handoff current state")
handoff = replace_once(handoff, "## 3. 当前十八篇最终定稿", "## 3. 当前十九篇最终定稿", "handoff table heading")
old_handoff_row18 = "| **18** | ***The Sky Would Not Go Quiet*** | **1964—1992年彭齐亚斯、威尔逊、普林斯顿团队与宇宙微波背景** | **270 / 50 / 18.5%** | **第十八篇最终精进锁定稿** |"
new_handoff_rows = "| 18 | *The Sky Would Not Go Quiet* | 1964—1992年彭齐亚斯、威尔逊、普林斯顿团队与宇宙微波背景 | 270 / 50 / 18.5% | 第十八篇最终精进锁定稿 |\n| **19** | ***Five Alarms, Still Descending*** | **1969年阿波罗11号1201/1202程序警报、优先级软件与地面‘继续’判断** | **270 / 50 / 18.5%** | **第十九篇最终精进锁定稿** |"
handoff = replace_once(handoff, old_handoff_row18, new_handoff_rows, "handoff latest rows")
for old, new in [
    ("- 18篇\n- 900个重点词", "- 19篇\n- 950个重点词"),
    ("- 900个速查表词元无跨篇精确重复", "- 950个速查表词元无跨篇精确重复"),
    ("- 900个英文加粗表面形式无跨篇精确重复", "- 950个英文加粗表面形式无跨篇精确重复"),
    ("下一篇编号为 **19**", "下一篇编号为 **20**"),
    ("下一篇编号：19", "下一篇编号：20"),
    ("第01—18篇", "第01—19篇"),
    ("18篇、900", "19篇、950"),
    ("首页会自动显示18篇、900个重点词，并把第18篇作为最新专题。", "首页会自动显示19篇、950个重点词，并把第19篇作为最新专题。"),
    ("核对900个已用词", "核对950个已用词"),
    ("前900词", "前950词"),
    ("1645个", "1595个"),
]:
    handoff = handoff.replace(old, new)

def bump_heading(match: re.Match[str]) -> str:
    n = int(match.group(1))
    return f"## {n + 1}. " if n >= 4 else match.group(0)

handoff = re.sub(r"^## (\d+)\. ", bump_heading, handoff, flags=re.MULTILINE)
article19_section = """## 4. 第19篇不可误认的版本特征

### 19 · Five Alarms, Still Descending

中文标题：**《五次警报，仍在下降》**。正式指标：**270词 / 50重点词 / 18.5%**。

正式开头：

> On 20 July 1969, Apollo 11’s **lunar** **lander** Eagle began its powered **descent**.

正式结尾：

> **Software** **robustness** meant protecting the **essential** work by deciding, before launch, what could wait while the lander kept descending.

核心边界：

1. 着陆前的五次执行程序警报顺序为1202、1202、1201、1202、1202；不把点火前另一次500系列雷达位置警报混入。
2. 1201表示没有可用VAC区，1202表示没有可用核心集；两者都是真实的执行程序溢出并触发软件重启，不是“虚假警报”。
3. 交会雷达保持开启有中止下降后返回轨道的用途；不能把事故简化成宇航员随手按错开关。
4. 事后原因包括雷达接口的电气相位失配、虚假计数更新，以及周期性显示任务对剩余计算余量的进一步消耗。
5. 重启保护会恢复选定的重要程序、保留关键状态，并不再恢复较低优先级的额外工作；它不是让计算机从未过载。
6. Steve Bales与Jack Garman的地面判断不可省略：软件能恢复，不等于任务自动安全；控制团队还要检查遥测是否允许继续。
7. 优先级执行程序与飞行软件来自长期的集体工程，包括Hal Laning、Margaret Hamilton领导的软件团队及大量开发与测试人员。
8. 结尾的独特论点是：可靠性不等于永不失败，而是系统在失败前已经决定哪些工作可以等待。

任何出现以下特征的版本都不是当前定稿：

- 英文标题为 `Five Alarms, No Abort`
- 把交会雷达写成没有用途的误操作
- 使用 `standby / scheduler / diagnostic / reliability` 这一组早期候选重点词
- 把1201/1202写成计算机没有真正过载
- 把“go”判断归功于软件自动完成
- 指标不是270词 / 50重点词 / 18.5%

---

"""
handoff = replace_once(handoff, "## 5. 第18篇不可误认的版本特征\n", article19_section + "## 5. 第18篇不可误认的版本特征\n", "handoff article 19 section")
if "data/article-19.js" not in handoff:
    handoff = handoff.replace("data/article-18.js\n", "data/article-18.js\ndata/article-19.js\n", 1)
write("notes/对话交接文档.md", handoff)

# 5. Permanent version guard.
guard = read("scripts/final-version-guard.js")
guard = replace_once(guard, "  '18': { source: '2026-08-13对话中形成并完成最终语言收口与全库复验的270词最终精进锁定稿', verification: 'conversation-latest-final' },\n};", "  '18': { source: '2026-08-13对话中形成并完成最终语言收口与全库复验的270词最终精进锁定稿', verification: 'conversation-latest-final' },\n  '19': { source: '2026-08-13对话中形成并完成950词全库复验的270词最终精进锁定稿', verification: 'conversation-latest-final' },\n};", "guard source audit 19")
guard = replace_once(guard, "  '18': '18-270-word-final-max',\n};", "  '18': '18-270-word-final-max',\n  '19': '19-270-word-final-max',\n};", "guard version id 19")
guard = replace_once(guard, "  ],\n};\n\nfunction loadArticles()", "  ],\n  '19': [\n    'Five Alarms, No Abort',\n    '**powered** **descent**',\n    'on **standby**',\n    '**scheduler**',\n    '**diagnostic**',\n    '**reliability**',\n    'lower-ranked display work',\n  ],\n};\n\nfunction loadArticles()", "guard superseded article 19")
old_readme_check18 = """  if (!readme.includes('| **18** | ***The Sky Would Not Go Quiet*** | **1964—1992年彭齐亚斯、威尔逊、普林斯顿团队与宇宙微波背景** | **270词 · 50词 · 18.5%** |')) {
    errors.push('README article 18 final row is stale');
  }"""
new_readme_checks = """  if (!readme.includes('| 18 | *The Sky Would Not Go Quiet* | 1964—1992年彭齐亚斯、威尔逊、普林斯顿团队与宇宙微波背景 | 270词 · 50词 · 18.5% |')) {
    errors.push('README article 18 final row is stale');
  }
  if (!readme.includes('| **19** | ***Five Alarms, Still Descending*** | **1969年阿波罗11号1201/1202程序警报、优先级软件与地面‘继续’判断** | **270词 · 50词 · 18.5%** |')) {
    errors.push('README article 19 final row is stale');
  }"""
guard = replace_once(guard, old_readme_check18, new_readme_checks, "guard README checks 18-19")
old_handoff_check18 = """  if (!handoff.includes('| **18** | ***The Sky Would Not Go Quiet*** | **1964—1992年彭齐亚斯、威尔逊、普林斯顿团队与宇宙微波背景** | **270 / 50 / 18.5%** | **第十八篇最终精进锁定稿** |')) {
    errors.push('handoff article 18 final row is stale');
  }"""
new_handoff_checks = """  if (!handoff.includes('| 18 | *The Sky Would Not Go Quiet* | 1964—1992年彭齐亚斯、威尔逊、普林斯顿团队与宇宙微波背景 | 270 / 50 / 18.5% | 第十八篇最终精进锁定稿 |')) {
    errors.push('handoff article 18 final row is stale');
  }
  if (!handoff.includes('| **19** | ***Five Alarms, Still Descending*** | **1969年阿波罗11号1201/1202程序警报、优先级软件与地面‘继续’判断** | **270 / 50 / 18.5%** | **第十九篇最终精进锁定稿** |')) {
    errors.push('handoff article 19 final row is stale');
  }"""
guard = replace_once(guard, old_handoff_check18, new_handoff_checks, "guard handoff checks 18-19")
guard = replace_once(guard, "> 审计范围：第01—18篇的权威数据、正式Markdown、用户上传最终稿、最终校正记录、README、交接文档和主分支校验。", "> 审计范围：第01—19篇的权威数据、正式Markdown、用户上传最终稿、最终校正记录、README、交接文档和主分支校验。", "guard audit scope")
guard = replace_once(guard, "> 结论：第01—17篇继续保持此前锁定指纹；第18篇270词最终精进锁定稿已完成最后一轮语言收口，并通过900词全库复验。", "> 结论：第01—18篇继续保持此前锁定指纹；第19篇270词最终精进锁定稿已完成题材、词库、史实、网站和950词全库复验。", "guard audit conclusion")
guard = replace_once(guard, "    '- 第18篇：270词最终精进锁定稿完成语言、科学口径、结尾闭环与最终语言收口，并淘汰264词工作稿和269词中间定稿。',\n", "    '- 第18篇：270词最终精进锁定稿完成语言、科学口径、结尾闭环与最终语言收口，并淘汰264词工作稿和269词中间定稿。',\n    '- 第19篇：270词最终精进锁定稿以阿波罗11号五次程序警报为叙事锚点，区分过载原因、优先级重启机制与地面‘继续’判断，并新增50个无重复词元。',\n", "guard audit article 19 bullet")
guard = replace_once(guard, "本次同步完成后，主分支的18篇均为当前已知的最后最终版本；第18篇270词最终精进稿是当前唯一权威版本。", "本次同步完成后，主分支的19篇均为当前已知的最后最终版本；第19篇270词最终精进稿是当前唯一权威版本。", "guard audit final judgement")
write("scripts/final-version-guard.js", guard)

# 6. Permanent CI.
workflow = read(".github/workflows/validate-content.yml")
workflow = replace_once(workflow, "18 篇已生成 · 900 个重点词 · 全部通过", "19 篇已生成 · 950 个重点词 · 全部通过", "CI archive total")
workflow = replace_once(workflow, "grep -q 'data/article-18.js' \"$page\"", "grep -q 'data/article-18.js' \"$page\"\n            grep -q 'data/article-19.js' \"$page\"", "CI page loaders")
for old, new, label in [
    ("grep -q '十八篇《经济学人》风格双语科普短文' index.html", "grep -q '十九篇《经济学人》风格双语科普短文' index.html", "CI index count"),
    ("grep -q '900词词库' words.html", "grep -q '950词词库' words.html", "CI word bank count"),
    ("grep -q 'the-sky-would-not-go-quiet' index.html", "grep -q 'five-alarms-still-descending' index.html", "CI latest index slug"),
    ("grep -q 'the-sky-would-not-go-quiet' sitemap.xml", "grep -q 'five-alarms-still-descending' sitemap.xml", "CI sitemap slug"),
    ("grep -q '共有 \\*\\*18篇文章、900个重点词\\*\\*' README.md", "grep -q '共有 \\*\\*19篇文章、950个重点词\\*\\*' README.md", "CI README count"),
    ("grep -q '当前权威状态：\\*\\*十八篇最终定稿，900个重点词' notes/对话交接文档.md", "grep -q '当前权威状态：\\*\\*十九篇最终定稿，950个重点词' notes/对话交接文档.md", "CI handoff count"),
    ("grep -q '下一篇编号为 \\*\\*19\\*\\*' notes/对话交接文档.md", "grep -q '下一篇编号为 \\*\\*20\\*\\*' notes/对话交接文档.md", "CI next article"),
    ("- name: Check articles 16 to 18 final identities", "- name: Check articles 16 to 19 final identities", "CI job name"),
    ("'18': { words: 270, keywords: 50, density: 18.5, status: '第十八篇最终精进锁定稿' }\n", "'18': { words: 270, keywords: 50, density: 18.5, status: '第十八篇最终精进锁定稿' },\n            '19': { words: 270, keywords: 50, density: 18.5, status: '第十九篇最终精进锁定稿' }\n", "CI expected article 19"),
    ("articles 16 to 18 latest final identities verified", "articles 16 to 19 latest final identities verified", "CI identity message"),
]:
    workflow = replace_once(workflow, old, new, label)
write(".github/workflows/validate-content.yml", workflow)

# 7. Dedicated ingestion record.
record = """# 第十九篇入库记录 · 2026-08-13

## 一、当前唯一权威稿

- 编号：19
- 英文标题：*Five Alarms, Still Descending*
- 中文标题：《五次警报，仍在下降》
- 题材：1969年阿波罗11号1201/1202程序警报、优先级软件与地面“继续”判断
- 状态：第十九篇最终精进锁定稿
- 英文正文：270词
- 重点词：50个
- 关键词密度：18.5%
- 结构：5段，每段10个重点词

## 二、选题与叙事发动机

第19篇没有沿用“异常出现—逐项排除—发现新实体”的结构，而是拆解一次高风险系统如何在真实过载中继续工作：

1. 五次程序警报把“继续还是中止”变成当场问题。
2. 雷达接口、电气失配与周期显示任务共同解释负载从何而来。
3. 优先级执行程序通过重启、检查点与任务舍弃解释计算机为何没有全面崩溃。
4. Steve Bales与Jack Garman的遥测判断说明软件恢复并不自动等于任务安全。
5. 结尾把可靠性重新定义为：系统在失败前已经决定什么可以等待。

## 三、词库结果

- 新增50个重点词。
- 与前900个速查表词元无精确重复。
- 与前900个英文加粗表面形式无精确重复。
- 主动淘汰了与既有词族过近的早期候选：`powered / scheduler / diagnostic / reliability`。
- 最终使用 `touchdown / allocator / actionable / robustness` 等更独立的词元。

## 四、不可误认的史实边界

- 着陆前共有五次1201/1202执行程序警报，不包括点火前的500系列雷达位置警报。
- 交会雷达保持开启具有中止下降后返回轨道的用途，不应简化为无意义误操作。
- 1201与1202分别对应VAC区和核心集耗尽，都会触发软件重启。
- 重启保护恢复关键程序并舍弃较低优先级工作；它没有否认计算机确实发生过载。
- 周期性显示进一步压缩计算余量，但不是唯一原因。
- 地面“go”判断由Steve Bales、Jack Garman及控制团队基于警报类型与遥测作出。
- Hal Laning的执行程序、Margaret Hamilton领导的软件团队以及大量工程与测试工作共同构成长期技术基础。
- 本文不把整个登月成功归功于程序警报机制；避开巨石区、人工操纵与燃料约束属于另一条风险链。

## 五、最终版本身份

正式开头：

> On 20 July 1969, Apollo 11’s **lunar** **lander** Eagle began its powered **descent**.

正式结尾：

> **Software** **robustness** meant protecting the **essential** work by deciding, before launch, what could wait while the lander kept descending.

正式指标：

```text
270词 / 50重点词 / 18.5%
```

## 六、全库同步

已同步权威数据、正式Markdown、首页、阅读器、950词词库、README、交接文档、站点地图、PWA描述、分享卡、404页、最终版本清单、全库审计和永久CI。

最终校验口径：

```text
19篇已生成 · 950个重点词 · 全部通过
第19篇：270词 · 50重点词 · 18.5%
下一篇编号：20
```
"""
write("notes/第十九篇入库记录_2026-08-13.md", record)

print("article 19 synchronization prepared")
