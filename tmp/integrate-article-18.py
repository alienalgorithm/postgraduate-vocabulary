from pathlib import Path
import re

ROOT = Path('.')


def read(path):
    return (ROOT / path).read_text(encoding='utf-8')


def write(path, text):
    target = ROOT / path
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_text(text, encoding='utf-8')


def replace_once(text, old, new, label):
    count = text.count(old)
    if count != 1:
        raise RuntimeError(f'{label}: expected one match, found {count}')
    return text.replace(old, new, 1)


def update(path, replacements):
    text = read(path)
    for old, new, label in replacements:
        text = replace_once(text, old, new, f'{path}: {label}')
    write(path, text)


# Website entry points and current counts.
update('index.html', [
    ('十七篇《经济学人》风格双语科普短文，850个考研重点词', '十八篇《经济学人》风格双语科普短文，900个考研重点词', 'meta description'),
    ('把850个考研词放回值得读完的知识故事里。', '把900个考研词放回值得读完的知识故事里。', 'og description'),
    ('考研词汇 · 双语科普读本 · 第十七篇已入库', '考研词汇 · 双语科普读本 · 第十八篇已入库', 'hero eyebrow'),
    ('href="article.html?a=the-few-that-came-back">阅读最新一篇', 'href="article.html?a=the-sky-would-not-go-quiet">阅读最新一篇', 'latest link'),
    ('浏览850词词库', '浏览900词词库', 'hero word count'),
    ('<span class="measure-label">ONE IN 8,000</span>', '<span class="measure-label">3.5 K ABOVE EXPECTATION</span>', 'measure label'),
    ('<span class="measure-caption">THE FEW THAT CAME BACK</span>', '<span class="measure-caption">THE SKY WOULD NOT GO QUIET</span>', 'measure caption'),
    ('<p class="eyebrow">NEW · 17</p>', '<p class="eyebrow">NEW · 18</p>', 'latest number'),
    ('绝大多数粒子穿过薄箔；约每8000个中有一个折返。团队没有删去少数异常，而是让它改写原子模型。', '设备、地面、季节和鸽子逐一被排除；当所有本地嫌疑都消失，号角天线仍然听见来自整片天空的嘶声。', 'latest summary'),
    ('<h2 id="archiveHeading">十七篇知识故事</h2>', '<h2 id="archiveHeading">十八篇知识故事</h2>', 'archive heading'),
    ('从霍乱、深海生态与臭氧洞，到转座元件、地球内核，以及少数折返粒子揭开的原子结构。', '从霍乱、深海生态与臭氧洞，到地球内核、原子结构，以及一片无法被本地噪声解释的宇宙余辉。', 'archive summary'),
    ('<a href="words.html">850词索引</a>', '<a href="words.html">900词索引</a>', 'footer index'),
    ('十七篇 · 850重点词 · 每篇密度低于20%', '十八篇 · 900重点词 · 每篇密度低于20%', 'footer note'),
    ('<script src="data/article-17.js"></script>\n<script src="assets/site.js"></script>', '<script src="data/article-17.js"></script>\n<script src="data/article-18.js"></script>\n<script src="assets/site.js"></script>', 'article 18 script'),
])

update('article.html', [
    ('十七篇考研词汇双语科普文章的对照阅读、连线与挖空自测。', '十八篇考研词汇双语科普文章的对照阅读、连线与挖空自测。', 'meta description'),
    ('<a href="words.html">850词索引</a>', '<a href="words.html">900词索引</a>', 'footer index'),
    ('<script src="data/article-17.js"></script>\n<script src="assets/site.js"></script>', '<script src="data/article-17.js"></script>\n<script src="data/article-18.js"></script>\n<script src="assets/site.js"></script>', 'article 18 script'),
])

update('words.html', [
    ('<title>850词词库 · 记词</title>', '<title>900词词库 · 记词</title>', 'title'),
    ('十七篇双语科普文章使用过的850个考研重点词', '十八篇双语科普文章使用过的900个考研重点词', 'meta description'),
    ('VOCABULARY INDEX · 01—17', 'VOCABULARY INDEX · 01—18', 'eyebrow'),
    ('<h1>850个词，', '<h1>900个词，', 'hero count'),
    ('href="article.html?a=the-few-that-came-back">最新文章', 'href="article.html?a=the-sky-would-not-go-quiet">最新文章', 'latest link'),
    ('850个词元 · 17篇文章 · 可追溯到原文', '900个词元 · 18篇文章 · 可追溯到原文', 'footer note'),
    ('<script src="data/article-17.js"></script>\n<script src="assets/site.js"></script>', '<script src="data/article-17.js"></script>\n<script src="data/article-18.js"></script>\n<script src="assets/site.js"></script>', 'article 18 script'),
])

update('404.html', [
    ('打开850词词库', '打开900词词库', '404 word count'),
])

update('manifest.webmanifest', [
    ('十七篇双语科普短文与850个考研重点词。', '十八篇双语科普短文与900个考研重点词。', 'manifest description'),
])

update('assets/share-card.svg', [
    ('十七篇双语科普短文 · 850个考研重点词', '十八篇双语科普短文 · 900个考研重点词', 'share card count'),
    ('WORDS IN CONTEXT · 01—17', 'WORDS IN CONTEXT · 01—18', 'share card range'),
])

sitemap = read('sitemap.xml')
sitemap = replace_once(
    sitemap,
    '  <url><loc>https://alienrocketbus.github.io/postgraduate-vocabulary/article.html?a=the-few-that-came-back</loc></url>\n</urlset>',
    '  <url><loc>https://alienrocketbus.github.io/postgraduate-vocabulary/article.html?a=the-few-that-came-back</loc></url>\n  <url><loc>https://alienrocketbus.github.io/postgraduate-vocabulary/article.html?a=the-sky-would-not-go-quiet</loc></url>\n</urlset>',
    'sitemap article 18',
)
write('sitemap.xml', sitemap)

# README: promote article 18 as the current latest final.
readme = read('README.md')
readme = readme.replace('850词索引', '900词索引')
readme = replace_once(readme, '截至2026-08-12，共有 **17篇文章、850个重点词**。', '截至2026-08-12，共有 **18篇文章、900个重点词**。', 'README archive count')
old_row = '| **17** | ***The Few That Came Back*** | **1909—1913年盖革—马斯登散射实验与卢瑟福核式原子** | **268词 · 50词 · 18.7%** | [网页](https://alienrocketbus.github.io/postgraduate-vocabulary/article.html?a=the-few-that-came-back) · [Markdown](articles/17-the-few-that-came-back.md) |'
new_rows = '| 17 | *The Few That Came Back* | 1909—1913年盖革—马斯登散射实验与卢瑟福核式原子 | 268词 · 50词 · 18.7% | [网页](https://alienrocketbus.github.io/postgraduate-vocabulary/article.html?a=the-few-that-came-back) · [Markdown](articles/17-the-few-that-came-back.md) |\n| **18** | ***The Sky Would Not Go Quiet*** | **1964—1992年彭齐亚斯、威尔逊、普林斯顿团队与宇宙微波背景** | **269词 · 50词 · 18.6%** | [网页](https://alienrocketbus.github.io/postgraduate-vocabulary/article.html?a=the-sky-would-not-go-quiet) · [Markdown](articles/18-the-sky-would-not-go-quiet.md) |'
readme = replace_once(readme, old_row, new_rows, 'README latest rows')
old_latest = '第17篇以268词最终精进锁定稿为准。它不把历史压缩成“卢瑟福做了一次金箔实验”：马斯登逐一计数折返闪光，盖革维持实验严谨性，卢瑟福提出中心集中模型；1909年的异常观察又在1911年的定量理论和1912—1913年的系统测量中经受检验。正文还明确指出“约每8000个中有一个折返”来自铂实验，避免把具体数字误套到流行的金箔叙事。'
new_latest = '第18篇以269词最终精校稿为准。文章不把宇宙微波背景写成“清理鸽子后突然想到大爆炸”的偶然传奇：贝尔实验室逐项排除接缝、连接处、地面响应、季节变化和鸟粪；普林斯顿团队提供热早期宇宙的解释；后续短波测量与COBE再分别补全黑体谱和十万分之一量级的各向异性。'
readme = replace_once(readme, old_latest, new_latest, 'README latest article note')
for old, new in [
    ('第01—17篇', '第01—18篇'),
    ('17篇、850个重点词和1695个尚未使用词元', '18篇、900个重点词和1645个尚未使用词元'),
    ('第17篇作为最新定稿专题展示', '第18篇作为最新定稿专题展示'),
    ('十七篇文章卡片', '十八篇文章卡片'),
    ('### 850词词库', '### 900词词库'),
    ('data/article-17.js    # 第17篇\n```', 'data/article-17.js    # 第17篇\ndata/article-18.js    # 第18篇\n```'),
    ('17篇全量校验', '18篇全量校验'),
    ('├── words.html                 850词索引', '├── words.html                 900词索引'),
    ('│   └── article-08.js—article-17.js', '│   └── article-08.js—article-18.js'),
    ('│   └── 01—17 Markdown定稿', '│   └── 01—18 Markdown定稿'),
    ('    └── 第十七篇入库记录_2026-08-12.md', '    ├── 第十七篇入库记录_2026-08-12.md\n    └── 第十八篇入库记录_2026-08-12.md'),
]:
    readme = replace_once(readme, old, new, f'README replacement {old[:28]}')
write('README.md', readme)

# Handoff: advance the authoritative state, preserve article 17, and add article 18 boundaries.
handoff = read('notes/对话交接文档.md')
handoff = replace_once(
    handoff,
    '当前权威状态：**十七篇最终定稿，850个重点词，第17篇与17篇网站均已进入主分支。**',
    '当前权威状态：**十八篇最终定稿，900个重点词，第18篇与18篇网站均已进入主分支。**',
    'handoff status',
)
handoff = replace_once(handoff, '## 3. 当前十七篇最终定稿', '## 3. 当前十八篇最终定稿', 'handoff archive heading')
old_row = '| **17** | ***The Few That Came Back*** | **1909—1913年盖革—马斯登散射实验与卢瑟福核式原子** | **268 / 50 / 18.7%** | **第十七篇最终精进锁定稿** |'
new_rows = '| 17 | *The Few That Came Back* | 1909—1913年盖革—马斯登散射实验与卢瑟福核式原子 | 268 / 50 / 18.7% | 第十七篇最终精进锁定稿 |\n| **18** | ***The Sky Would Not Go Quiet*** | **1964—1992年彭齐亚斯、威尔逊、普林斯顿团队与宇宙微波背景** | **269 / 50 / 18.6%** | **第十八篇最终精校稿** |'
handoff = replace_once(handoff, old_row, new_rows, 'handoff latest rows')
for old, new in [
    ('- 17篇\n- 850个重点词', '- 18篇\n- 900个重点词'),
    ('- 850个速查表词元无跨篇精确重复', '- 900个速查表词元无跨篇精确重复'),
    ('- 850个英文加粗表面形式无跨篇精确重复', '- 900个英文加粗表面形式无跨篇精确重复'),
]:
    handoff = replace_once(handoff, old, new, f'handoff total {old[:20]}')
# Shift the existing numbered sections so article 18 becomes section 4.
def shift_heading(match):
    number = int(match.group(1))
    return f'## {number + 1}. ' if number >= 4 else match.group(0)
handoff = re.sub(r'^## (\d+)\. ', shift_heading, handoff, flags=re.M)
article18_section = '''## 4. 第18篇不可误认的版本特征

### 18 · The Sky Would Not Go Quiet

中文标题：**《天空始终不肯安静》**。正式指标：**269词 / 50重点词 / 18.6%**。

正式开头：

> In 1964, Bell Laboratories **radio** **astronomers** Arno Penzias and Robert Wilson used a 20-foot **horn** **antenna** at Holmdel, New Jersey, to measure faint **microwave** emission from the Milky Way.

正式结尾：

> Its force came from a stricter fact: every **local** **culprit** had been tested, and the sky still hissed.

核心边界：

1. 霍姆德尔号角天线最初服务于Echo卫星通信；低噪声通信工程是后来测出微弱背景的技术前提。
2. 1965年原论文报告的是4080 Mc/s单一波段的3.5±1.0 K未解释天线温度，不可倒写成当时已精确测得现代2.725 K黑体谱。
3. 接缝、旋转接头、地面后瓣响应、季节变化和鸽子均属于排查链；鸽子故事来自当事人后来的回忆，不在三页原论文正文中。
4. 观测在误差范围内各向同性、未偏振，且1964年7月至1965年4月没有季节变化；这削弱了本地和银河系来源解释。
5. 普林斯顿团队当时正在建造辐射计寻找热早期宇宙遗存辐射；1965年两篇配套论文分别承担实验报告与宇宙学解释，不是一篇合著论文。
6. 彭齐亚斯和威尔逊论文只称普林斯顿解释为一种possible explanation；单一波长不能独自确立黑体谱。
7. 1966年及后续短波测量补全谱形；COBE后来测得2.725 K近乎完美黑体谱，并在1992年绘出约十万分之一的各向异性。
8. 文章结尾拒绝把发现只归于运气：偶然让两条线索相遇，严格校准和逐项扣除才让剩余信号可信。

任何出现以下特征的版本都不是当前定稿：

- 中文标题为《天空始终无法安静》
- 第三段使用 `Princeton cosmologists`
- 写成彭齐亚斯和威尔逊本人提出或独自完成宇宙学解释
- 把1964年的单波长数据直接写成已建立2.725 K完整黑体谱
- 指标不是269词 / 50重点词 / 18.6%

---

'''
handoff = replace_once(handoff, '## 5. 第17篇不可误认的版本特征\n', article18_section + '## 5. 第17篇不可误认的版本特征\n', 'insert article 18 section')
for old, new in [
    ('data/article-17.js\n```', 'data/article-17.js\ndata/article-18.js\n```'),
    ('同步为17篇、850词', '同步为18篇、900词'),
    ('自动显示17篇、850个重点词，并把第17篇作为最新专题', '自动显示18篇、900个重点词，并把第18篇作为最新专题'),
    ('核对850个已用词', '核对900个已用词'),
    ('下一篇编号为 **18**', '下一篇编号为 **19**'),
    ('避免与前850词精确重复', '避免与前900词精确重复'),
    ('当前粗略剩余词元：1695个', '当前粗略剩余词元：1645个'),
]:
    handoff = replace_once(handoff, old, new, f'handoff replacement {old[:28]}')
write('notes/对话交接文档.md', handoff)

# Article 18 permanent ingest record.
write('notes/第十八篇入库记录_2026-08-12.md', '''# 第十八篇入库记录 · 2026-08-12

## 一、唯一权威稿

- 编号：18
- 英文标题：*The Sky Would Not Go Quiet*
- 中文标题：《天空始终不肯安静》
- 题材：1964—1992年彭齐亚斯、威尔逊、普林斯顿团队与宇宙微波背景
- 状态：第十八篇最终精校稿
- 英文正文：269词
- 重点词：50个
- 关键词密度：18.6%
- 结构：5段，每段10个重点词

## 二、论证结构

1. 用液氦参考源校准霍姆德尔号角天线，留下比预期高3.5 K的残余嘶声。
2. 逐项排除接缝、连接损耗、地面干扰、鸽子、偏振和季节变化。
3. 贝尔实验室的观测与普林斯顿团队寻找原初余热的理论计划相遇；两篇配套论文分开实验与解释。
4. 后续短波测量和COBE分别补全黑体谱与十万分之一量级的各向异性。
5. 结尾把“偶然发现”改写为可验证的排除法：偶然提供相遇，严格扣除让余量可信。

## 三、不可误认的事实边界

- 号角天线原本用于Echo卫星通信，低噪声设计是发现的工程前提。
- 1965年原论文给出的未解释部分是3.5±1.0 K，不是现代2.725 K最终温度。
- 鸽子与鸟粪排查来自后来的当事人回忆和科学史记录，不见于1965年三页论文。
- 1965年观测在精度范围内各向同性、未偏振且无季节变化，但单一波长不足以证明完整黑体谱。
- 早期宇宙背景预测早于普林斯顿1965年工作；正文没有把最初预言归给迪克团队。
- 两篇论文同刊于1965年7月《天体物理学杂志》，一篇报告观测，一篇解释宇宙学意义。
- COBE于1989年发射；FIRAS测得近乎完美的2.725 K黑体谱，DMR于1992年报告约十万分之一的本征各向异性。
- 1978年诺贝尔物理学奖的一半授予彭齐亚斯和威尔逊，表彰其发现宇宙微波背景辐射。

## 四、版本锁定

早期264词工作稿已经废弃。当前269词版本的身份特征包括：

- `Princeton **physicists**`
- `Their paper presented it only as a **provisional** explanation.`
- `Measurements at shorter wavelengths soon **corroborated** the signal`
- `The uniform **thermal** glow became a **signature**`
- 中文标题《天空始终不肯安静》

## 五、全库校验

```text
18篇已生成 · 900个重点词 · 全部通过
第18篇：269词 · 50重点词 · 18.6%
与前850个速查表词元无精确重复
与前850个英文加粗表面形式无精确重复
```

下一篇编号：19。
''')

# Permanent final-version guard: register article 18, reject the 264-word work draft,
# and require README/handoff synchronization.
guard = read('scripts/final-version-guard.js')
guard = replace_once(
    guard,
    "  '17': { source: '2026-08-12对话中形成并由PR #8合并的268词最终精进稿', verification: 'conversation-latest-final' },\n};",
    "  '17': { source: '2026-08-12对话中形成并由PR #8合并的268词最终精进稿', verification: 'conversation-latest-final' },\n  '18': { source: '2026-08-12对话中形成并完成全库复验的269词最终精校稿', verification: 'conversation-latest-final' },\n};",
    'guard source audit',
)
guard = replace_once(
    guard,
    "  '17': '17-268-word-final-polish',\n};",
    "  '17': '17-268-word-final-polish',\n  '18': '18-269-word-final-proofed',\n};",
    'guard version id',
)
guard = replace_once(
    guard,
    "  '17': [\n    'Measurements upheld the **empirical** **framework**.',\n    \"compresses this into one man's **revelation**\",\n    '263 词 / 50 重点词 / 密度 19.0%',\n  ],\n};",
    "  '17': [\n    'Measurements upheld the **empirical** **framework**.',\n    \"compresses this into one man's **revelation**\",\n    '263 词 / 50 重点词 / 密度 19.0%',\n  ],\n  '18': [\n    'Princeton **cosmologists**',\n    'Penzias and Wilson called it a **provisional** explanation.',\n    'Shorter-wave measurements soon **corroborated** the **cosmic** **background** **radiation**.',\n    '264 词 / 50 重点词 / 密度 18.9%',\n    '天空始终无法安静',\n  ],\n};",
    'guard superseded article 18',
)
guard = replace_once(
    guard,
    "  if (!readme.includes('| **17** | ***The Few That Came Back*** | **1909—1913年盖革—马斯登散射实验与卢瑟福核式原子** | **268词 · 50词 · 18.7%** |')) {\n    errors.push('README article 17 final row is stale');\n  }",
    "  if (!readme.includes('| 17 | *The Few That Came Back* | 1909—1913年盖革—马斯登散射实验与卢瑟福核式原子 | 268词 · 50词 · 18.7% |')) {\n    errors.push('README article 17 final row is stale');\n  }\n  if (!readme.includes('| **18** | ***The Sky Would Not Go Quiet*** | **1964—1992年彭齐亚斯、威尔逊、普林斯顿团队与宇宙微波背景** | **269词 · 50词 · 18.6%** |')) {\n    errors.push('README article 18 final row is stale');\n  }",
    'guard README latest rows',
)
guard = replace_once(
    guard,
    "  if (!handoff.includes('| 16 | *The Wave That Should Not Have Arrived* | 1929—1952年英格·莱曼、P波阴影区与地球内核 | 263 / 50 / 19.0% | 第十六篇最终精进锁定稿 |')) {\n    errors.push('handoff article 16 final row is stale');\n  }",
    "  if (!handoff.includes('| 16 | *The Wave That Should Not Have Arrived* | 1929—1952年英格·莱曼、P波阴影区与地球内核 | 263 / 50 / 19.0% | 第十六篇最终精进锁定稿 |')) {\n    errors.push('handoff article 16 final row is stale');\n  }\n  if (!handoff.includes('| **18** | ***The Sky Would Not Go Quiet*** | **1964—1992年彭齐亚斯、威尔逊、普林斯顿团队与宇宙微波背景** | **269 / 50 / 18.6%** | **第十八篇最终精校稿** |')) {\n    errors.push('handoff article 18 final row is stale');\n  }",
    'guard handoff article 18',
)
for old, new, label in [
    ('> 审计范围：第01—17篇的权威数据、正式Markdown、用户上传最终稿、最终校正记录、README、交接文档和主分支校验。', '> 审计范围：第01—18篇的权威数据、正式Markdown、用户上传最终稿、最终校正记录、README、交接文档和主分支校验。', 'guard report scope'),
    ('> 结论：审计发现第16篇云端仍停留在264词中间稿；本次已替换为对话中更晚形成的263词最终精进稿。其余16篇未发现晚于云端版本的未同步最终稿。', '> 结论：第01—17篇继续保持此前锁定指纹；第18篇269词最终精校稿已加入唯一权威数据层，并完成900词全库复验。', 'guard report conclusion'),
    ("    '- 第17篇：268词最终精进稿已在PR #8进入主分支，本次复核保持不变.',", "    '- 第17篇：268词最终精进稿已在PR #8进入主分支，本次复核保持不变。',\n    '- 第18篇：269词最终精校稿完成五段、50词、史实边界和网站同步，并淘汰264词工作稿。',", 'guard report article 18'),
    ("    '本次修正完成后，主分支的17篇均为当前已知的最后最终版本；第16篇263词稿和第17篇268词稿分别是当前唯一权威版本。',", "    '本次同步完成后，主分支的18篇均为当前已知的最后最终版本；第18篇269词稿是当前唯一权威版本。',", 'guard report final verdict'),
]:
    guard = replace_once(guard, old, new, label)
write('scripts/final-version-guard.js', guard)

# CI: validate 18 articles, 900 words, final-version fingerprints and website entry points.
write('.github/workflows/validate-content.yml', '''name: Validate article archive

on:
  pull_request:
    branches:
      - main
  push:
    branches:
      - main
  workflow_dispatch:

permissions:
  contents: read

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - name: Check out repository
        uses: actions/checkout@v6

      - name: Validate all article data and generated Markdown
        shell: bash
        run: |
          set -euo pipefail
          python3 scripts/build_markdown.py | tee /tmp/build-report.txt
          grep -q "18 篇已生成 · 900 个重点词 · 全部通过" /tmp/build-report.txt
          git diff --exit-code -- articles

      - name: Enforce the latest final version of every article
        shell: bash
        run: |
          set -euo pipefail
          node scripts/final-version-guard.js
          test -f data/final-version-manifest.json
          test -f notes/最终版本铁律.md
          test -f notes/全库最终版本审计_2026-08-12.md

      - name: Check JavaScript syntax
        shell: bash
        run: |
          set -euo pipefail
          for file in data/article-*.js assets/site.js assets/js/*.js scripts/final-version-guard.js; do
            node --check "$file"
          done

      - name: Check synchronized website entry points
        shell: bash
        run: |
          set -euo pipefail
          for page in index.html article.html words.html; do
            grep -q 'data/article-18.js' "$page"
          done
          grep -q '十八篇《经济学人》风格双语科普短文' index.html
          grep -q '900词词库' words.html
          grep -q 'the-sky-would-not-go-quiet' index.html
          grep -q 'the-sky-would-not-go-quiet' sitemap.xml
          grep -q '共有 \*\*18篇文章、900个重点词\*\*' README.md
          grep -q '## 最终版本铁律' README.md
          grep -q '当前权威状态：\*\*十八篇最终定稿，900个重点词' notes/对话交接文档.md
          grep -q '下一篇编号为 \*\*19\*\*' notes/对话交接文档.md

      - name: Check articles 16 to 18 final identities
        shell: bash
        run: |
          set -euo pipefail
          node <<'NODE'
          const fs = require('fs');
          const path = require('path');
          globalThis.window = globalThis;
          require(path.resolve('data/articles.js'));
          for (const file of fs.readdirSync('data').filter(f => /^article-\d+\.js$/.test(f)).sort()) {
            require(path.resolve('data', file));
          }
          const expected = {
            '16': { words: 263, keywords: 50, density: 19.0, status: '第十六篇最终精进锁定稿' },
            '17': { words: 268, keywords: 50, density: 18.7, status: '第十七篇最终精进锁定稿' },
            '18': { words: 269, keywords: 50, density: 18.6, status: '第十八篇最终精校稿' }
          };
          for (const [id, metrics] of Object.entries(expected)) {
            const article = globalThis.SITE.ARTICLES.find(item => item.id === id);
            if (!article) throw new Error(`article ${id} missing`);
            if (article.metrics.words !== metrics.words || article.metrics.keywords !== metrics.keywords || article.metrics.density !== metrics.density || article.status !== metrics.status) {
              throw new Error(`article ${id} final identity mismatch`);
            }
            if (article.metrics.words < 240 || article.metrics.words > 270) {
              throw new Error(`article ${id} word count outside preferred 240-270 range`);
            }
            if (article.paras.length !== 5 || article.glossary.length !== 50) {
              throw new Error(`article ${id} structure mismatch`);
            }
          }
          console.log('articles 16 to 18 latest final identities verified');
          NODE
''')

print('article 18 website, documentation, guard and CI integration prepared')
