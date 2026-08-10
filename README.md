# 记词 · 考研词汇双语读本

用新东方考研词汇写《经济学人》风格科普短文，中英加粗一一对应，
配一套自建的缺陷检查工具，把每次写坏的句子固化成可复用的规则。

**网站** → https://alienrocketbus.github.io/postgraduate-vocabulary/

---

## 当前定稿

六篇共使用 300 个重点词；英文加粗词、中文括注与速查表逐项对应，重点词在字面、词元和透明现代词族层面均不重复。

| 编号 | 文章 | 题材 | 指标 | 阅读 |
|---|---|---|---|---|
| 01 | *Snow and the Broad Street Pump* | 1854 年伦敦霍乱 | 252 词 · 50 重点词 · 19.8% | [网页](https://alienrocketbus.github.io/postgraduate-vocabulary/article.html?a=snow-cholera) · [Markdown](articles/01-snow-cholera.md) |
| 02 | *A Garden Without Sunlight* | 1977 年加拉帕戈斯热液喷口 | 259 词 · 50 重点词 · 19.3% | [网页](https://alienrocketbus.github.io/postgraduate-vocabulary/article.html?a=a-garden-without-sunlight) · [Markdown](articles/02-a-garden-without-sunlight.md) |
| 03 | *The Graph That Changed the Sky* | 1985 年南极臭氧洞 | 255 词 · 50 重点词 · 19.6% | [网页](https://alienrocketbus.github.io/postgraduate-vocabulary/article.html?a=the-graph-that-changed-the-sky) · [Markdown](articles/03-the-graph-that-changed-the-sky.md) |
| 04 | *Fifteen Degrees an Hour* | 约翰·哈里森与海上经度 | 295 词 · 50 重点词 · 16.9% | [网页](https://alienrocketbus.github.io/postgraduate-vocabulary/article.html?a=fifteen-degrees-an-hour) · [Markdown](articles/04-fifteen-degrees-an-hour.md) |
| 05 | *The Price Was Elsewhere* | UPC 条形码与零售信息基础设施 | 270 词 · 50 重点词 · 18.5% | [网页](https://alienrocketbus.github.io/postgraduate-vocabulary/article.html?a=the-price-was-elsewhere) · [Markdown](articles/05-the-price-was-elsewhere.md) |
| 06 | *The Reaction That Had to Be Invented Twice* | Haber–Bosch 合成氨与工业放大 | 265 词 · 50 重点词 · 18.9% | [网页](https://alienrocketbus.github.io/postgraduate-vocabulary/article.html?a=the-reaction-invented-twice) · [Markdown](articles/06-the-reaction-invented-twice.md) |

---

## 网站有什么

| 页面 | 作用 |
|---|---|
| 首页 | 文章列表、存量统计（已用掉多少词、还剩多少） |
| 文章页 | 中英左右对照。**悬停或点一个重点词，一条线跨过中缝连到它的中文译法**。可切换「显示词源」和「挖空自测」 |
| 词库 | 所有写过的词按 A–Z 排，可搜中文或英文，点右侧编号跳回原文 |
| 检察官 | 缺陷检查工具，三层 51 条规则（v3） |

**挖空自测**：英文重点词全部盖住，只留中文，点一个揭一个。中文侧的英文括注会自动隐藏，不泄题。

---

## 加一篇新文章

只需要改一个文件。

**1. 编辑 `data/articles.js`**，在 `ARTICLES` 数组末尾追加：

```js
{
  id: "02",
  slug: "your-slug",              // 决定网址 article.html?a=your-slug
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

加粗写法：英文 `**word**`，中文 `**译法**(word)` —— 括号里必须是英文里那个词的**原样形态**（`blamed` 就写 `blamed`，不要写 `blame`），否则连不上。

**2. 运行同步脚本**

```bash
python3 scripts/build_markdown.py
```

它做两件事：生成 `articles/*.md`（方便在 GitHub 上直接读），并**校验**——

- 英文加粗数 = 中文加粗数 = 词表条数 = `metrics.keywords`
- 中英加粗是否一一配得上，缺哪个多哪个会点名
- 实测词数、实测密度与 `metrics` 是否对得上
- 密度是否越过 20% 红线

有问题会逐条打印并以非零码退出。网站和 markdown 都从这一处数据生成，不会两边打架。

---

## 硬性指标

| 项目 | 要求 |
|---|---|
| 词数 | 250–300 |
| 关键词 | 恰好 50 个 |
| 密度 | **≤ 20%** |
| 文体 | 经济学人科普社论，必须含具体案例，结尾必须升华 |

密度是最要命的一条：

| 密度 | 后果 |
|---|---|
| ≤18% | 安全，可以优先选最地道的词 |
| 18–22% | 紧张，偶尔被迫拿名单上的词顶替最准的词 |
| >22% | **句子被系统性压坏**，绝大多数英文缺陷产于此区间 |

要求更短时必须同时降关键词数，不能只压词数。

---

## 铁律

英文加粗的重点词，中文译文里对应的译法也必须加粗，中英一一对应。

实现方式：**中文按最自然的说法写 → 加粗落在那个自然说法上 → 后附 `(english)` 括注词源。**
不为对齐扭曲中文句法——那是所有中文译文问题的总根源。

在网站上这条铁律是可交互的：悬停英文词，线会告诉你它落在中文的哪一处。

---

## 目录

```
├── index.html / article.html / words.html   网站页面
├── assets/            样式与脚本
├── data/articles.js   ★ 唯一数据源，改这里
├── scripts/           同步 + 校验脚本
├── articles/          由脚本生成的 markdown，勿手改
├── tools/             单词检察官 v3（v2 留档）
├── vocabulary/        词表 xlsx
└── notes/             写作规范 · 缺陷库 · 交接文档
```

| 我想… | 打开 |
|---|---|
| 写新文章前先看规矩 | [`notes/写作规范.md`](notes/写作规范.md) |
| 查以前踩过什么坑 | [`notes/缺陷库.md`](notes/缺陷库.md) |

---

## 词表说明

- 原 docx 标称 List 1–40，**实际缺 List 26–30**，只有 35 个 List
- 共 2552 条（2545 个不重复单词，7 个词跨 List 重复）
- 源文件已知瑕疵，按原样保留未擅改：`incidentally` / `pave` 无中文释义；
  `phisicist` 是 physicist 的拼写错误；List 17 的 `setting` 释义里"北京"应为"背景"

---

## 单词检察官 v3

`tools/单词检察官v3.html` —— 单文件，双击即用，无外部依赖。

| 层 | 内容 | 条数 |
|---|---|---|
| 一 | 英文词法句法（正则） | 28 |
| 二 | 中文译法（正则） | 11 |
| 三 | 篇章与事实（函数式判断） | 12 |

会真算的几条：

- **ST-02** 自动提取文中年份算跨度，与「a century / another N years」比对，不符即报
- **ST-06** 逐个限定词双向查中英对应（merely / arguably / effective…漏译就报）
- **ST-08 回归检测** 记住上一次运行的结果，改稿后重跑会告诉你**这一轮改动带出了哪些新问题**。带相似度闸门，换成另一篇文章不会误报
- **ST-09** 地名未定位（Soho 在伦敦也在纽约）；全文有地理锚点就不报
- **ST-10** 数字前后不一：找出相差 8% 以内的两个数，那多半是同一件事写了两种说法

`check` 级不是判错，是要你确认。斯诺篇跑出来的两条都是这一级：
没有祈使句（叙事型文章落在原则上也成立）、末句 `handle` 与前文呼应（刻意回环则忽略）。

v2 留在 `tools/` 里备查。
