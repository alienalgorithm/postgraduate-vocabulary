# 记词 · 考研词汇双语读本

用新东方考研词汇写《经济学人》风格科普短文，中英加粗一一对应，
配一套自建的缺陷检查工具，把每次写坏的句子固化成可复用的规则。

**网站** → https://alienrocketbus.github.io/postgraduate-vocabulary/

---

## 当前定稿

七篇共使用 **350 个重点词**；英文加粗词、中文括注与速查表逐项对应，
重点词在英文表面形式和速查表词元层面均无跨篇重复。

> 2026-08-10 已按作者提供的最终定稿包重新校正。第2篇以 `reaction` 取代仓库旧版的 `process`；第4篇恢复为260词最终稿；第7篇正式入库。完整差异见 [`notes/最终定稿校正记录_2026-08-10.md`](notes/最终定稿校正记录_2026-08-10.md)。

| 编号 | 文章 | 题材 | 指标 | 阅读 |
|---|---|---|---|---|
| 01 | *Snow and the Broad Street Pump* | 1854 年伦敦霍乱 | 252 词 · 50 重点词 · 19.8% | [网页](https://alienrocketbus.github.io/postgraduate-vocabulary/article.html?a=snow-cholera) · [Markdown](articles/01-snow-cholera.md) |
| 02 | *A Garden Without Sunlight* | 1977 年加拉帕戈斯热液喷口 | 259 词 · 50 重点词 · 19.3% | [网页](https://alienrocketbus.github.io/postgraduate-vocabulary/article.html?a=a-garden-without-sunlight) · [Markdown](articles/02-a-garden-without-sunlight.md) |
| 03 | *The Graph That Changed the Sky* | 1985 年南极臭氧洞 | 255 词 · 50 重点词 · 19.6% | [网页](https://alienrocketbus.github.io/postgraduate-vocabulary/article.html?a=the-graph-that-changed-the-sky) · [Markdown](articles/03-the-graph-that-changed-the-sky.md) |
| 04 | *Fifteen Degrees an Hour* | 约翰·哈里森与海上经度 | **260 词 · 50 重点词 · 19.2%** | [网页](https://alienrocketbus.github.io/postgraduate-vocabulary/article.html?a=fifteen-degrees-an-hour) · [Markdown](articles/04-fifteen-degrees-an-hour.md) |
| 05 | *The Price Was Elsewhere* | UPC 条形码与零售信息基础设施 | 270 词 · 50 重点词 · 18.5% | [网页](https://alienrocketbus.github.io/postgraduate-vocabulary/article.html?a=the-price-was-elsewhere) · [Markdown](articles/05-the-price-was-elsewhere.md) |
| 06 | *The Reaction That Had to Be Invented Twice* | Haber–Bosch 合成氨与工业放大 | 265 词 · 50 重点词 · 18.9% | [网页](https://alienrocketbus.github.io/postgraduate-vocabulary/article.html?a=the-reaction-invented-twice) · [Markdown](articles/06-the-reaction-invented-twice.md) |
| 07 | *The Meaning He Left Out* | 1948 年香农与信息论 | **273 词 · 50 重点词 · 18.3%** | [网页](https://alienrocketbus.github.io/postgraduate-vocabulary/article.html?a=the-meaning-he-left-out) · [Markdown](articles/07-the-meaning-he-left-out.md) |

---

## 网站有什么

| 页面 | 作用 |
|---|---|
| 首页 | 文章列表、存量统计（已用掉多少词、还剩多少） |
| 文章页 | 中英左右对照。悬停或点一个重点词，一条线跨过中缝连到它的中文译法；可切换「显示词源」和「挖空自测」 |
| 词库 | 所有写过的词按 A–Z 排列，可搜中文或英文，点右侧编号跳回原文 |
| 检察官 | 缺陷检查工具，三层51条规则（v3） |

**挖空自测**：英文重点词全部盖住，只留中文，点一个揭一个。中文侧的英文括注会自动隐藏，不泄题。

---

## 唯一数据源

网站和文章 Markdown 都以 `data/articles.js` 为唯一数据源。

- 网站直接读取 `data/articles.js`
- `scripts/build_markdown.py` 从同一数据源生成 `articles/*.md`
- `articles/*.md` 是派生产物，不应脱离数据源单独修改

本次最终定稿校正已同时更新数据源和派生 Markdown，避免网站、词库与仓库阅读稿互相打架。

---

## 加一篇新文章

**1. 编辑 `data/articles.js`**，在 `ARTICLES` 数组末尾追加一条：

```js
{
  id: "08",
  slug: "your-slug",
  title: "English Title",
  titleZh: "中文标题",
  standfirst: "一句话导语。",
  topic: "题材",
  date: "2026-08-20",
  status: "定稿",
  metrics: { words: 260, keywords: 50, density: 19.2 },
  paras: [
    { en: "...**word**...", zh: "...**译法**(word)..." }
  ],
  glossary: [ { w: "word", zh: "译法", p: 1 } ],
  facts: [ "史实核对条目" ]
}
```

加粗写法：英文 `**word**`，中文 `**译法**(word)`。括号里必须是英文正文中那个词的**原样形态**；英文是 `blamed`，中文括注就写 `(blamed)`，否则网站无法配对。

**2. 运行同步脚本**

```bash
python3 scripts/build_markdown.py
```

脚本会生成 `articles/*.md` 并校验：

- 英文加粗数 = 中文加粗数 = 词表条数 = `metrics.keywords`
- 中英加粗是否一一对应
- 实测词数和密度是否与 `metrics` 一致
- 密度是否越过20%红线

有问题会逐条打印，并以非零状态码退出。

---

## 硬性指标

| 项目 | 要求 |
|---|---|
| 词数 | 250–300 |
| 关键词 | 恰好50个 |
| 密度 | **≤20%** |
| 文体 | 《经济学人》风格科普社论 |
| 内容 | 必须有具体案例、日期、人物或数字 |
| 结尾 | 必须完成升华，不能只复述正文 |

密度经验：

| 密度 | 判断 |
|---|---|
| ≤18% | 安全，可优先选择最自然准确的词 |
| 18–20% | 可控，但必须仔细检查是否为了塞词牺牲句法 |
| >20% | 越过项目红线，容易系统性损坏英文 |

要求更短时必须同时降低关键词数量，不能只压缩总词数。

---

## 铁律

英文加粗的重点词，中文译文里对应的自然译法也必须加粗，并在其后附英文原样括注。

实现顺序：

> 中文先按最自然的方式写 → 把真正对应的中文加粗 → 后附 `(english)` 词源括注。

不要为了逐词对齐而扭曲中文句法。

---

## 目录

```text
├── index.html / article.html / words.html   网站页面
├── assets/            样式与脚本
├── data/articles.js   ★ 唯一数据源
├── scripts/           同步与校验脚本
├── articles/          由脚本生成的 Markdown
├── tools/             单词检察官 v3（v2留档）
├── vocabulary/        原始词表 xlsx
└── notes/
    ├── 对话交接文档.md
    ├── 写作规范.md
    ├── 缺陷库.md
    └── 最终定稿校正记录_2026-08-10.md
```

| 我想…… | 打开 |
|---|---|
| 写新文章前先看规矩 | [`notes/写作规范.md`](notes/写作规范.md) |
| 查以前踩过什么坑 | [`notes/缺陷库.md`](notes/缺陷库.md) |
| 接手整个项目 | [`notes/对话交接文档.md`](notes/对话交接文档.md) |
| 核对本次最终稿校正 | [`notes/最终定稿校正记录_2026-08-10.md`](notes/最终定稿校正记录_2026-08-10.md) |

---

## 词表说明

- 原 docx 标称 List 1–40，实际缺 List 26–30，只有35个 List
- 共2552条，包含2545个不重复单词，7个词跨 List 重复
- 当前七篇共使用350个互不重复的重点词，按词元粗算尚余约2195词
- 源文件已知瑕疵按原样保留：`incidentally` / `pave` 无中文释义；`phisicist` 是 `physicist` 的拼写错误；List 17 的 `setting` 释义中“北京”应为“背景”

---

## 单词检察官 v3

`tools/单词检察官v3.html` 是单文件工具，双击即可使用，无外部依赖。

| 层 | 内容 | 条数 |
|---|---|---|
| 一 | 英文词法句法（正则） | 28 |
| 二 | 中文译法（正则） | 11 |
| 三 | 篇章与事实（函数式判断） | 12 |

其中包括：年份跨度检查、限定词中英对应、回归检测、地名定位和近似数字冲突检查。新规则写完必须用定稿做假阳性与假阴性测试。
