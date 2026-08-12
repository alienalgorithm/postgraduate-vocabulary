const fs = require('fs');
const path = require('path');

globalThis.window = globalThis;
require(path.resolve('data/articles.js'));
require(path.resolve('data/article-17.js'));

const article = globalThis.SITE.ARTICLES.find((item) => item.id === '17');
if (!article) throw new Error('article 17 missing');

article.status = '第十七篇最终精进锁定稿';
article.metrics = { words: 268, keywords: 50, density: 18.7 };
article.paras = [
  {
    en: "In 1909, **undergraduate** Ernest Marsden joined Hans Geiger in a dark Manchester laboratory to test an **unusual** suggestion from Ernest Rutherford. A **radioactive** **emitter** sent **alpha** particles towards metal **foil**. A lead **shield** blocked the direct beam; a **fluorescent** zinc-sulphide **screen** produced a **flash** when struck by a returning particle.",
    zh: "1909年，在曼彻斯特一间昏暗的实验室里，**本科生**(undergraduate)欧内斯特·马斯登与汉斯·盖革一起检验欧内斯特·卢瑟福提出的一个**不同寻常的**(unusual)设想。一个**放射性**(radioactive)**发射源**(emitter)把**阿尔法**(alpha)粒子射向金属**薄箔**(foil)。铅制**屏障**(shield)挡住直达粒子束；若有折返粒子撞上**荧光的**(fluorescent)硫化锌**屏幕**(screen)，屏上便会出现一次**闪光**(flash)。"
  },
  {
    en: "Most passed through the foil or changed direction only **slightly**. Yet a few underwent **backward** scattering, returning to the side of **incidence**. In one **platinum** test, roughly one in 8,000 was reflected. The **majority** followed the expected route; a tiny **fraction** underwent a large **deflection**. Given the particles' **momentum**, such reversal was **astonishing**: repeated weak **collisions** could scarcely explain it.",
    zh: "大多数粒子穿过薄箔，或只发生**轻微**(slightly)偏转。但仍有少数发生**反向的**(backward)散射，回到**入射**(incidence)一侧。在一次使用**铂**(platinum)箔的试验中，大约每8000个粒子就有一个被反射。**绝大多数**(majority)沿预期路线前进；只有极小一**部分**(fraction)粒子发生了大角度**偏转**(deflection)。考虑到粒子的**动量**(momentum)，这种掉头极其**令人震惊**(astonishing)：连续的微弱**碰撞**(collisions)几乎无法解释这种结果。"
  },
  {
    en: "Thomson's atom contained **electrons** **embedded** in **diffuse** positive charge. Each **encounter** delivered only a weak push. Rutherford's 1911 analysis required an **intense** **impulse** from a compact centre. Most of the **atomic** **volume** was empty; mass and charge were **concentrated** in the tiny body later called the **nucleus**.",
    zh: "汤姆孙的原子模型认为，**电子**(electrons)**嵌在**(embedded)**弥散的**(diffuse)正电荷中。每次**相遇**(encounter)只能给阿尔法粒子一个微弱推力。卢瑟福1911年的分析则要求粒子从一个紧凑中心获得一次**强烈的**(intense)**冲量**(impulse)。**原子的**(atomic)大部分**体积**(volume)其实是空的；质量和电荷则**集中在**(concentrated)一个后来被称为**原子核**(nucleus)的微小实体中。"
  },
  {
    en: "Rutherford's theory did more than explain the anomaly: it risked being wrong. At a fixed large angle, its **formula** predicted counts **proportional** to foil **thickness** and the **square** of the central charge, but **inversely** proportional to the **fourth** power of alpha velocity. Geiger and Marsden's **systematic** 1912–13 measurements tested those **quantitative** predictions; the angular **distribution** provided **confirmation**.",
    zh: "卢瑟福的理论不只解释了这处异常，还把自己置于可能被测量推翻的位置。在一个给定的大角度上，它的**公式**(formula)预测，粒子计数应与薄箔**厚度**(thickness)和中心电荷的**平方**(square)成**正比**(proportional)，却应与阿尔法粒子速度的**四次方**(fourth)成**反比**(inversely)。盖革和马斯登在1912至1913年**系统开展的**(systematic)测量检验了这些**定量的**(quantitative)预测；散射粒子的角**分布**(distribution)为理论提供了**佐证**(confirmation)。"
  },
  {
    en: "The discovery was **collective**: Marsden counted flashes, Geiger brought experimental **discipline**, Rutherford made the **deduction**. Their **empirical** **framework** linked observation to prediction. A **textbook** **narrative** compresses the sequence into a single **revelation**. The **outliers** mattered because a team counted them—and let the few that came back **overturn** the model the many seemed to confirm.",
    zh: "这项发现是**集体完成的**(collective)：马斯登逐一计数闪光，盖革保证实验**严谨有序**(discipline)，卢瑟福则得出关键**推论**(deduction)。他们建立的这套**以观察为依据的**(empirical)**框架**(framework)，把观测与预测连接起来。一套**教科书式的**(textbook)**叙事**(narrative)常把这一连串过程压缩成一次**顿悟**(revelation)。但真正重要的，是那些**离群结果**(outliers)被一支团队认真计数；正是少数折返的粒子，最终**推翻了**(overturn)多数粒子似乎正在证实的模型。"
  }
];

const wrapper = `/* 17 · The Few That Came Back\n   Canonical data extension. Loaded after data/articles.js.\n*/\n(function (root) {\n  'use strict';\n  var article = ${JSON.stringify(article, null, 2)};\n  root.SITE = root.SITE || { vocabTotal: 2545, ARTICLES: [] };\n  root.SITE.ARTICLES = root.SITE.ARTICLES || [];\n  var index = root.SITE.ARTICLES.findIndex(function (item) { return item.id === article.id || item.slug === article.slug; });\n  if (index >= 0) root.SITE.ARTICLES[index] = article;\n  else root.SITE.ARTICLES.push(article);\n})(typeof window !== 'undefined' ? window : globalThis);\n`;
fs.writeFileSync('data/article-17.js', wrapper, 'utf8');

function replaceOnce(file, oldText, newText, label) {
  let text = fs.readFileSync(file, 'utf8');
  if (!text.includes(oldText)) throw new Error(`missing expected text: ${label}`);
  text = text.replace(oldText, newText);
  fs.writeFileSync(file, text, 'utf8');
}

replaceOnce('README.md', '**263词 · 50词 · 19.0%**', '**268词 · 50词 · 18.7%**', 'README metric');
replaceOnce('README.md', '第17篇以263词最终精校稿为准。', '第17篇以268词最终精进锁定稿为准。', 'README status');

replaceOnce('notes/对话交接文档.md', '**263 / 50 / 19.0%** | **第十七篇最终精校稿**', '**268 / 50 / 18.7%** | **第十七篇最终精进锁定稿**', 'handoff table');
replaceOnce('notes/对话交接文档.md', '正式指标：**263词 / 50重点词 / 19.0%**。', '正式指标：**268词 / 50重点词 / 18.7%**。', 'handoff metric');
replaceOnce('notes/对话交接文档.md', '> In a dark Manchester laboratory in 1909, **undergraduate** Ernest Marsden joined Hans Geiger in testing an **unusual** suggestion from Ernest Rutherford.', '> In 1909, **undergraduate** Ernest Marsden joined Hans Geiger in a dark Manchester laboratory to test an **unusual** suggestion from Ernest Rutherford.', 'handoff opening');
replaceOnce('notes/对话交接文档.md', '- 指标不是263词 / 50重点词 / 19.0%', '- 指标不是268词 / 50重点词 / 18.7%', 'handoff invalid metric');

replaceOnce('notes/第十七篇入库记录_2026-08-12.md', '> 状态：第十七篇最终精校稿', '> 状态：第十七篇最终精进锁定稿', 'record status');
replaceOnce('notes/第十七篇入库记录_2026-08-12.md', '- 英文正文：263词', '- 英文正文：268词', 'record words');
replaceOnce('notes/第十七篇入库记录_2026-08-12.md', '- 关键词密度：19.0%', '- 关键词密度：18.7%', 'record density');
replaceOnce('notes/第十七篇入库记录_2026-08-12.md', '最终锁定为263词 / 50重点词 / 19.0%。', '最终精进锁定为268词 / 50重点词 / 18.7%。新增的五个词用于补全荧光屏受击因果、反向散射术语、固定散射角条件，以及“观测—预测”方法论链条，不属于冗余扩写。', 'record final line');

replaceOnce('.github/workflows/validate-content.yml', "'17': { words: 263, keywords: 50, density: 19.0 }", "'17': { words: 268, keywords: 50, density: 18.7 }", 'validation metrics');
