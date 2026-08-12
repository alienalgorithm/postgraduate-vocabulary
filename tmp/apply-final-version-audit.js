const fs = require('fs');
const path = require('path');

function read(file) {
  return fs.readFileSync(file, 'utf8');
}

function write(file, content) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, content, 'utf8');
}

function lines(items) {
  return items.join('\n') + '\n';
}

function replaceOnce(text, oldText, newText, label) {
  const index = text.indexOf(oldText);
  if (index < 0) throw new Error(`missing expected text: ${label}`);
  if (text.indexOf(oldText, index + oldText.length) >= 0) {
    throw new Error(`expected a single match but found more than one: ${label}`);
  }
  return text.slice(0, index) + newText + text.slice(index + oldText.length);
}

// Promote the later 263-word article-16 manuscript that had been completed in
// the conversation but was not synchronized to the repository.
const dataPath = 'data/article-16.js';
let data = read(dataPath);
const replacements = [
  ['"status": "第十六篇最终精校稿"', '"status": "第十六篇最终精进锁定稿"', 'article 16 status'],
  ['"words": 264', '"words": 263', 'article 16 words'],
  ['"density": 18.9', '"density": 19.0', 'article 16 density'],
  [
    "On 17 June 1929, an **earthquake** near Murchison, New Zealand, sent **seismic** waves through the planet. In Copenhagen, Danish **mathematician** and seismologist Inge Lehmann read traces from **seismographs**. Each **vibration** was an indirect **probe** of Earth's **interior**. Yet **worldwide** records carried a faint **mark** whose origin was **obscure**.",
    "A 17 June 1929 **earthquake** near Murchison, New Zealand, sent **seismic** waves through Earth. In Copenhagen, Danish **mathematician** and seismologist Inge Lehmann read traces drawn by **seismographs**. Each **vibration** was an indirect **probe** of Earth's **interior**. Yet **worldwide** records carried a faint **mark** whose origin was **obscure**.",
    'article 16 English paragraph 1',
  ],
  [
    "1929年6月17日，新西兰默奇森附近发生一场**地震**(earthquake)，产生的**地震波**(seismic)穿过地球，传向全球。在哥本哈根，丹麦**数学家**(mathematician)兼地震学家英格·莱曼研读各台**地震仪**(seismographs)留下的曲线。每一次地面**振动**(vibration)，都像一枚间接**探针**(probe)，让人们得以探查地球**内部**(interior)。然而，来自**世界各地的**(worldwide)记录中有一道微弱**痕迹**(mark)，来源仍然**晦暗不明**(obscure)。",
    "1929年6月17日，新西兰默奇森附近的一场**地震**(earthquake)让**地震波**(seismic)穿过地球。在哥本哈根，丹麦**数学家**(mathematician)兼地震学家英格·莱曼研读各台**地震仪**(seismographs)绘出的曲线。每一次地面**振动**(vibration)，都是探查地球**内部**(interior)的一枚间接**探针**(probe)。然而，来自**世界各地的**(worldwide)记录中有一道微弱**痕迹**(mark)，来由仍**晦暗不明**(obscure)。",
    'article 16 Chinese paragraph 1',
  ],
  [
    "The accepted model placed a rocky mantle around one fluid core. P waves **compress** **matter** and cross **solid** or **liquid** material; S waves **shear** it but cannot **penetrate** a liquid **outer** core. At the boundary, P waves **refract**; the new **angle** leaves a **shadow** 104°–140° from the source, where direct P waves should not arrive.",
    "The accepted model placed a rocky mantle around a fluid core. P waves **compress** **matter** and cross **solid** or **liquid** material; S waves **shear** it but cannot **penetrate** a liquid **outer** core. P waves **refract** at the boundary; the change in **angle** creates a **shadow** 104°–140° from the source, where direct P waves should not arrive.",
    'article 16 English paragraph 2',
  ],
  [
    "当时公认的模型认为，岩石地幔包围着一个流体地核。P波会**压缩**(compress)**物质**(matter)，并能穿过**固态**(solid)或**液态**(liquid)介质；S波则使物质发生**剪切**(shear)，无法**穿透**(penetrate)液态**外核**(outer)。P波在地核边界发生**折射**(refract)；新的传播**角度**(angle)会在距震源104至140度处留下一片**阴影区**(shadow)，直达P波本不应抵达那里。",
    "当时公认的模型认为，岩石地幔包围着一个流体地核。P波会**压缩**(compress)**物质**(matter)，并能穿过**固态**(solid)或**液态**(liquid)介质；S波则使物质发生**剪切**(shear)，无法**穿透**(penetrate)液态**外核**(outer)。P波会在地核边界发生**折射**(refract)；传播**角度**(angle)的改变，会在距震源104至140度处形成一片**阴影区**(shadow)，直达P波本不应抵达那里。",
    'article 16 Chinese paragraph 2',
  ],
  [
    "Yet faint P′ **arrivals** did. Some researchers **attributed** them to **diffraction** around the core. Lehmann **examined** Murchison and other records. Though **scattered**, their travel times matched a **path** refracted by a faster **central** **sphere**. In 1936 she proposed an inner core in which greater **velocity** would **redirect** energy into the shadow.",
    "Yet faint P′ **arrivals** appeared there. Some **attributed** them to **diffraction** around the core. Lehmann **examined** Murchison and other earthquake records. Though **scattered**, their travel times matched a **path** through a faster **central** **sphere**. In 1936 she proposed an inner core where higher **velocity** could **redirect** energy into the shadow.",
    'article 16 English paragraph 3',
  ],
  [
    "但微弱P′波的**到达记录**(arrivals)偏偏出现了。有些研究者把它们**归因于**(attributed)地核周围的**衍射**(diffraction)。莱曼**查验了**(examined)默奇森地震及其他地震的记录。资料虽很**零散**(scattered)，传播时间却符合一条**路径**(path)：它会在一个波速更快的**中央**(central)**球体**(sphere)处发生折射。1936年，她提出地球存在一个内核；P波在那里具有更高的**速度**(velocity)，因而会被**重新导向**(redirect)阴影区。",
    "但微弱P′波的**到达记录**(arrivals)偏偏出现在那里。有人把它们**归因于**(attributed)地核周围的**衍射**(diffraction)。莱曼**查验了**(examined)默奇森地震以及其他地震的记录。资料虽然**零散**(scattered)，传播时间却符合一条**路径**(path)：它会穿过一个波速更快的**中央**(central)**球体**(sphere)。1936年，她提出地球存在一个内核；P波在那里具有更高的**速度**(velocity)，因而可能被**重新导向**(redirect)阴影区。",
    'article 16 Chinese paragraph 3',
  ],
  [
    "Her paper, titled “P′”, was **cautious**: an inner core was a **possibility**, its state **uncertain**. Later **scrutiny** and **numerical** work made diffraction untenable. Models then treated the inner core as **rigid**; in 1952 Francis Birch called **crystalline** iron the simplest explanation. Its **radius** is about 1,220 kilometres, its **diameter** smaller than the Moon's; liquid metal **encloses** it.",
    "In “P′”, Lehmann was **cautious**: an inner core was a **possibility**, its state **uncertain**. Later **scrutiny** and **numerical** work ruled out the diffraction explanation. Models treated the inner core as **rigid**; in 1952 Francis Birch called **crystalline** iron the simplest explanation. Its 1,220-kilometre **radius** gives it a **diameter** smaller than the Moon's; liquid metal **encloses** it.",
    'article 16 English paragraph 4',
  ],
  [
    "她那篇题目仅为“P′”的论文十分**谨慎**(cautious)：内核只是一种**可能性**(possibility)，其状态仍**无法确定**(uncertain)。后来的严格**审视**(scrutiny)与**数值**(numerical)分析表明，衍射解释已经无法成立。此后的模型把内核视为具有**刚性**(rigid)；1952年，弗朗西斯·伯奇认为，最简洁的解释是它由**晶体状的**(crystalline)铁构成。它的**半径**(radius)约1220公里，**直径**(diameter)比月球还小；液态金属从外部**包围着**(encloses)它。",
    "在《P′》中，莱曼十分**谨慎**(cautious)：内核只是一种**可能性**(possibility)，其状态仍**无法确定**(uncertain)。后来的严格**审视**(scrutiny)与**数值**(numerical)分析排除了衍射解释。此后的模型把内核视为具有**刚性**(rigid)；1952年，弗朗西斯·伯奇认为，最简洁的解释是它由**晶体状的**(crystalline)铁构成。它约1220公里的**半径**(radius)，意味着其**直径**(diameter)小于月球；外层的液态金属将它**包围**(encloses)。",
    'article 16 Chinese paragraph 4',
  ],
  [
    "Lehmann made a **discrepancy** obey a new **geometry**. Her model gave each arrival a **timing** and each path a **constraint**. The **revision** became **persuasive** because it predicted where such signals should appear. In science, **absence** belongs to a model. Change the model, and apparent noise can become the **schedule** of an **invisible** **structure**.",
    "Lehmann made a **discrepancy** obey a new **geometry**. Her model gave each arrival a **timing** and each path a **constraint**. The **revision** became **persuasive** because it predicted where the signals should appear. An expected **absence** is itself a prediction. A wave arriving off **schedule** need not be noise: it can reveal an **invisible** **structure**.",
    'article 16 English paragraph 5',
  ],
  [
    "莱曼让这处**不一致**(discrepancy)服从一套新的**几何关系**(geometry)。她的模型为每束波规定了一个**到达时刻**(timing)，也为每条路径设下一个**约束条件**(constraint)。这次**修正**(revision)之所以**令人信服**(persuasive)，是因为它能够预言同类信号会出现在哪里。在科学中，**缺失**(absence)并不空洞：它只相对于某个模型成立。换一个模型，看似噪声的东西，便可能成为一张**时间表**(schedule)，标出一处**不可见的**(invisible)**结构**(structure)。",
    "莱曼让这处**不一致**(discrepancy)服从一套新的**几何关系**(geometry)。她的模型为每次到达给出一个**时刻**(timing)，也为每条路径设下一项**约束条件**(constraint)。这次**修正**(revision)之所以**令人信服**(persuasive)，是因为它预言了这些信号会出现在哪里。模型预期的**缺失**(absence)本身就是一项预测。一束没有按**时间表**(schedule)抵达的波，未必只是噪声：它也可能揭示一处**不可见的**(invisible)**结构**(structure)。",
    'article 16 Chinese paragraph 5',
  ],
];
for (const [oldText, newText, label] of replacements) {
  data = replaceOnce(data, oldText, newText, label);
}
write(dataPath, data);

// Always display one decimal place, so 19.0% never silently becomes 19%.
const builderPath = 'scripts/build_markdown.py';
let builder = read(builderPath);
builder = replaceOnce(
  builder,
  "f'> 指标：{metrics[\"words\"]} 词 / {metrics[\"keywords\"]} 重点词 / 密度 {metrics[\"density\"]}%',",
  "f'> 指标：{metrics[\"words\"]} 词 / {metrics[\"keywords\"]} 重点词 / 密度 {float(metrics[\"density\"]):.1f}%',",
  'one-decimal density formatting',
);
write(builderPath, builder);

// README: correct article 16 and publish the permanent rule.
const readmePath = 'README.md';
let readme = read(readmePath);
readme = replaceOnce(
  readme,
  '| 16 | *The Wave That Should Not Have Arrived* | 1929—1952年英格·莱曼、P波阴影区与地球内核 | 264词 · 50词 · 18.9% |',
  '| 16 | *The Wave That Should Not Have Arrived* | 1929—1952年英格·莱曼、P波阴影区与地球内核 | 263词 · 50词 · 19.0% |',
  'README article 16 row',
);
const readmePolicy = lines([
  '## 最终版本铁律',
  '',
  '- 一旦某篇文章形成新的最终稿、最终精校稿或最终锁定稿，必须在同一次变更中同步权威数据、Markdown、网站、README、交接文档、入库记录和最终版本清单。',
  '- 新最终稿一经进入主分支，旧稿立即失去权威性；旧内容只能留在Git历史中，不得继续留在活动数据文件、正式Markdown、网站入口或未合并分支中制造歧义。',
  '- 只有从 `main` 回读确认新正文，并且全量校验成功后，才可以声称“已经存到云端”。',
  '- `data/final-version-manifest.json` 保存每篇文章的完整内容指纹；`node scripts/final-version-guard.js` 会阻止旧稿、错误指标或未同步文件重新进入主分支。',
  '',
  '完整规则见 [notes/最终版本铁律.md](notes/最终版本铁律.md)。',
  '',
  '---',
  '',
]);
readme = replaceOnce(readme, '## 网站已完成的同步\n', readmePolicy + '## 网站已完成的同步\n', 'README final-version policy');
write(readmePath, readme);

// Handoff: place the latest-final-only rule above the article table and correct 16.
const handoffPath = 'notes/对话交接文档.md';
let handoff = read(handoffPath);
handoff = handoff.replace(/^## (\d+)\. /gm, (match, number) => {
  const n = Number(number);
  return n >= 2 ? `## ${n + 1}. ` : match;
});
const ironRuleSection = lines([
  '## 2. 最终版本铁律（最高优先级）',
  '',
  '1. 对话中一旦明确形成“更好的最终稿、最终精校稿、最终精进稿或锁定稿”，必须立即同步到GitHub主分支；不得只留在聊天中。',
  '2. 同步必须是原子性的：权威数据、生成Markdown、网站入口、README、交接文档、入库记录和最终版本清单必须同时更新。',
  '3. 新最终稿进入主分支后，前一版本立即作废；旧版本只允许存在于Git历史中，不得继续作为活动文件、网站内容或长期分支存在。',
  '4. 未完成“主分支回读 + 全量校验成功”之前，不得宣称已经保存到云端。',
  '5. 每篇文章以 `data/final-version-manifest.json` 中的内容指纹为最终身份；标题相同、词数接近但指纹不同，仍视为不同版本。',
  '6. 开始下一篇之前必须先运行 `node scripts/final-version-guard.js`，确认前文无回滚、无旧稿残留。',
  '',
  '完整执行细则见 `notes/最终版本铁律.md`。',
  '',
  '---',
  '',
]);
handoff = replaceOnce(handoff, '## 3. 当前十七篇最终定稿\n', ironRuleSection + '## 3. 当前十七篇最终定稿\n', 'handoff iron-rule insertion');
handoff = replaceOnce(
  handoff,
  '| 16 | *The Wave That Should Not Have Arrived* | 1929—1952年英格·莱曼、P波阴影区与地球内核 | 264 / 50 / 18.9% | 第十六篇最终精校稿 |',
  '| 16 | *The Wave That Should Not Have Arrived* | 1929—1952年英格·莱曼、P波阴影区与地球内核 | 263 / 50 / 19.0% | 第十六篇最终精进锁定稿 |',
  'handoff article 16 row',
);
handoff = replaceOnce(
  handoff,
  '中文标题：**《本不该抵达的波》**。正式指标：**264词 / 50重点词 / 18.9%**。',
  '中文标题：**《本不该抵达的波》**。正式指标：**263词 / 50重点词 / 19.0%**。',
  'handoff article 16 metrics',
);
handoff = replaceOnce(
  handoff,
  '- 旧的296词版本已经废弃。',
  lines([
    '- 296词初稿与264词中间稿均已废弃。',
    '- 263词最终稿必须包含 `traces drawn by seismographs`、`arrivals appeared there`、`ruled out the diffraction explanation`，并以 `An expected absence is itself a prediction` 收束。',
  ]).trimEnd(),
  'handoff article 16 supersession',
);
write(handoffPath, handoff);

// Replace article 16's version record so it cannot identify the intermediate
// 264-word manuscript as final again.
write('notes/第十六篇入库记录_2026-08-12.md', lines([
  '# 第十六篇入库记录 · 2026-08-12',
  '',
  '## 一、当前唯一最终稿',
  '',
  '- 编号：16',
  '- 英文标题：*The Wave That Should Not Have Arrived*',
  '- 中文标题：《本不该抵达的波》',
  '- 题材：1929—1952年英格·莱曼、P波阴影区与地球内核',
  '- 状态：第十六篇最终精进锁定稿',
  '- 英文正文：263词',
  '- 重点词：50个',
  '- 关键词密度：19.0%',
  '- 段落：5段，每段10个重点词',
  '',
  '## 二、版本沿革',
  '',
  '1. 296词初稿：史实完整，但解释偏多，已废弃。',
  '2. 264词压缩稿：进入过主分支，但随后逐句审查发现仍有明确可提升处，现已废弃。',
  '3. 263词最终精进稿：修复英语省略、并列关系、科学因果和结尾回扣，成为当前唯一权威版本。',
  '',
  '旧稿只允许保留在Git历史中，不得回到活动数据、正式Markdown或网站。',
  '',
  '## 三、263词版本的不可误认特征',
  '',
  '正式开头：',
  '',
  '> A 17 June 1929 **earthquake** near Murchison, New Zealand, sent **seismic** waves through Earth.',
  '',
  '关键句：',
  '',
  '> In Copenhagen, Danish **mathematician** and seismologist Inge Lehmann read traces drawn by **seismographs**.',
  '',
  '> Yet faint P′ **arrivals** appeared there.',
  '',
  '> Later **scrutiny** and **numerical** work ruled out the diffraction explanation.',
  '',
  '正式结尾：',
  '',
  '> An expected **absence** is itself a prediction. A wave arriving off **schedule** need not be noise: it can reveal an **invisible** **structure**.',
  '',
  '凡出现以下特征的版本均不是当前定稿：',
  '',
  '- 296词 / 16.9%',
  '- 264词 / 18.9%',
  '- `sent seismic waves through the planet`',
  '- `Yet faint P′ arrivals did`',
  '- `made diffraction untenable`',
  '- `In science, absence belongs to a model`',
  '',
  '## 四、本轮真正提升',
  '',
  '- `read traces from seismographs` 改为 `read traces drawn by seismographs`，明确仪器与记录之间的关系。',
  '- `the new angle leaves a shadow` 改为 `the change in angle creates a shadow`，补全折射—角度变化—阴影区的因果链。',
  '- `Yet faint P′ arrivals did` 改为自然、明确的 `arrivals appeared there`。',
  '- `Murchison and other records` 改为 `Murchison and other earthquake records`，消除不平行并列。',
  '- `made diffraction untenable` 改为 `ruled out the diffraction explanation`，区分物理现象与错误解释。',
  '- 结尾重新抓住标题中的“本不该抵达的波”，把异常、预测和不可见结构收束为同一逻辑。',
  '- 中文同步消除“从外部包围”“为每束波规定时刻”等翻译腔。',
  '',
  '## 五、最终版本保护',
  '',
  '本篇已纳入：',
  '',
  '- `data/final-version-manifest.json` 内容指纹',
  '- `scripts/final-version-guard.js` 回滚检测',
  '- `.github/workflows/validate-content.yml` 主分支强制校验',
  '',
  '最终校验口径：',
  '',
  '```text',
  '17篇已生成 · 850个重点词 · 全部通过',
  '第16篇：263词 · 50重点词 · 19.0%',
  '```',
]));

write('notes/最终版本铁律.md', lines([
  '# 最终版本铁律',
  '',
  '> 优先级：本项目文章版本管理的最高规则。',
  '> 目的：确保对话中形成的最后定稿不会只停留在聊天里，也不会被旧稿覆盖。',
  '',
  '## 一、什么才算“最终版本”',
  '',
  '当用户或当前任务明确把一版称为“最终稿、最终精校稿、最终精进稿、锁定稿”，或明确判断某一精进版优于现有稿并要求继续按最终标准推进时，该版本即成为待同步的最新最终版本。',
  '',
  '最终版本同时包括英文正文、中文译文、50个重点词、速查表、史实核对、来源、标题、导语、状态、日期和指标。任一部分不同，都属于不同版本。',
  '',
  '## 二、原子同步铁律',
  '',
  '新的最终版本形成后，必须在同一次任务中同步：',
  '',
  '1. 权威数据文件：`data/articles.js` 或 `data/article-NN.js`',
  '2. 生成稿：`articles/NN-*.md`',
  '3. 网站：首页、文章阅读器和词库入口',
  '4. `README.md`',
  '5. `notes/对话交接文档.md`',
  '6. 对应入库记录',
  '7. `data/final-version-manifest.json`',
  '8. 永久校验规则',
  '',
  '不得出现“聊天里已经改好，但GitHub仍是旧稿”的状态。',
  '',
  '## 三、旧稿淘汰铁律',
  '',
  '- 新最终稿进入 `main` 后，前一版立即失去权威性。',
  '- 旧稿只允许存在于Git提交历史中，用于追溯；不得继续存在于活动数据文件、正式Markdown、网站内容或长期开发分支中。',
  '- 不得保留 `final-v2`、`final-new`、`latest-final` 等并行活动文件。每篇文章只能有一个活动权威版本。',
  '- 版本回滚必须由用户明确要求；任何自动化、生成脚本或后续模型都不得自行恢复旧稿。',
  '',
  '## 四、云端完成判定',
  '',
  '只有同时满足以下四项，才能声称“已经存到云端”：',
  '',
  '1. 新版本已提交并合并到 `main`；',
  '2. 从 `main` 重新读取，正文与指标确为新版本；',
  '3. GitHub Actions全量校验为 `success`；',
  '4. README、交接文档和最终版本清单均已同步。',
  '',
  '分支、PR、聊天文本或本地文件都不能单独算作云端最终完成。',
  '',
  '## 五、内容指纹铁律',
  '',
  '- `data/final-version-manifest.json` 为每篇文章保存完整内容指纹。',
  '- 指纹覆盖标题、导语、状态、指标、英文、中文、速查表、史实与来源。',
  '- `node scripts/final-version-guard.js` 必须在每次PR和主分支提交中运行。',
  '- 标题相同、词数相同但正文不同，指纹仍会变化，校验必须阻止未登记的覆盖。',
  '',
  '## 六、后续固定流程',
  '',
  '1. 写作或精进完成；',
  '2. 明确最新最终稿；',
  '3. 立即更新全部权威表面；',
  '4. 重新生成Markdown；',
  '5. 更新最终版本清单与指纹；',
  '6. 运行全库校验；',
  '7. 合并到 `main`；',
  '8. 回读 `main` 并确认CI成功；',
  '9. 删除承载旧稿或已合并稿的临时分支。',
  '',
  '未完成第8步，不得结束任务。',
]));

const normsPath = 'notes/写作规范.md';
let norms = read(normsPath);
if (!norms.includes('## 最终版本同步铁律')) {
  norms += '\n' + lines([
    '---',
    '',
    '## 最终版本同步铁律',
    '',
    '- 一旦形成新的最终稿，必须立即更新GitHub主分支，不得只在对话中展示。',
    '- 新最终稿必须同时更新权威数据、Markdown、网站、README、交接文档、入库记录和最终版本清单。',
    '- 前一版本立即作废，只可留在Git历史中；活动文件和长期分支不得继续承载旧稿。',
    '- 完成标准是：主分支回读正确、内容指纹一致、全量CI成功。',
    '- 开始下一篇之前，必须先运行 `node scripts/final-version-guard.js`。',
    '',
    '详细规则：`notes/最终版本铁律.md`。',
  ]);
}
write(normsPath, norms);

console.log('prepared article 16 final reconciliation and final-version policy');
