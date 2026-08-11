# 记词 · 考研词汇双语读本

用新东方考研词汇写《经济学人》风格的双语科普短文。英文重点词加粗，中文自然译法同步加粗并保留英文原样括注；网站提供中英连线、单语阅读、挖空自测、字号切换、打印和550词索引。

**网站** → https://alienrocketbus.github.io/postgraduate-vocabulary/

---

## 当前最终定稿

截至2026-08-11，共有 **11篇文章、550个重点词**。每篇恰好50个重点词，密度均低于20%。

| 编号 | 文章 | 题材 | 指标 | 阅读 |
|---|---|---|---|---|
| 01 | *Snow and the Broad Street Pump* | 1854年伦敦霍乱 | 252词 · 50词 · 19.8% | [网页](https://alienrocketbus.github.io/postgraduate-vocabulary/article.html?a=snow-cholera) · [Markdown](articles/01-snow-cholera.md) |
| 02 | *A Garden Without Sunlight* | 1977年加拉帕戈斯热液喷口 | 259词 · 50词 · 19.3% | [网页](https://alienrocketbus.github.io/postgraduate-vocabulary/article.html?a=a-garden-without-sunlight) · [Markdown](articles/02-a-garden-without-sunlight.md) |
| 03 | *The Graph That Changed the Sky* | 1985年南极臭氧洞 | 255词 · 50词 · 19.6% | [网页](https://alienrocketbus.github.io/postgraduate-vocabulary/article.html?a=the-graph-that-changed-the-sky) · [Markdown](articles/03-the-graph-that-changed-the-sky.md) |
| 04 | *Fifteen Degrees an Hour* | 约翰·哈里森与海上经度 | 260词 · 50词 · 19.2% | [网页](https://alienrocketbus.github.io/postgraduate-vocabulary/article.html?a=fifteen-degrees-an-hour) · [Markdown](articles/04-fifteen-degrees-an-hour.md) |
| 05 | *The Price Was Elsewhere* | UPC条形码与零售信息基础设施 | 270词 · 50词 · 18.5% | [网页](https://alienrocketbus.github.io/postgraduate-vocabulary/article.html?a=the-price-was-elsewhere) · [Markdown](articles/05-the-price-was-elsewhere.md) |
| 06 | *The Reaction That Had to Be Invented Twice* | Haber–Bosch合成氨与工业放大 | 265词 · 50词 · 18.9% | [网页](https://alienrocketbus.github.io/postgraduate-vocabulary/article.html?a=the-reaction-invented-twice) · [Markdown](articles/06-the-reaction-invented-twice.md) |
| 07 | *The Meaning He Left Out* | 1948年香农与信息论 | 273词 · 50词 · 18.3% | [网页](https://alienrocketbus.github.io/postgraduate-vocabulary/article.html?a=the-meaning-he-left-out) · [Markdown](articles/07-the-meaning-he-left-out.md) |
| 08 | *A Ruler Without a Zero* | 1908—1912年莱维特与造父变星周光关系 | 269词 · 50词 · 18.6% | [网页](https://alienrocketbus.github.io/postgraduate-vocabulary/article.html?a=a-ruler-without-a-zero) · [Markdown](articles/08-a-ruler-without-a-zero.md) |
| **09** | ***Zero Was Not Enough*** | **1967—1980年全球天花根除、监测与环形接种** | **265词 · 50词 · 18.9%** | [网页](https://alienrocketbus.github.io/postgraduate-vocabulary/article.html?a=zero-was-not-enough) · [Markdown](articles/09-zero-was-not-enough.md) |
| **10** | ***A Name Inside an Oval*** | **1799—1824年罗塞塔石碑与埃及圣书体破译** | **265词 · 50词 · 18.9%** | [网页](https://alienrocketbus.github.io/postgraduate-vocabulary/article.html?a=a-name-inside-an-oval) · [Markdown](articles/10-a-name-inside-an-oval.md) |
| **11** | ***The Needle Moved Twice*** | **1831年法拉第与电磁感应** | **255词 · 50词 · 19.6%** | [网页](https://alienrocketbus.github.io/postgraduate-vocabulary/article.html?a=the-needle-moved-twice) · [Markdown](articles/11-the-needle-moved-twice.md) |

第9—11篇均以作者在2026-08-10至11日提供的最终精校稿为准：天花篇区分“病例归零”与持续搜寻、认证所形成的根除证据；罗塞塔石碑篇区分两种语言、三种文字及扬—商博良的累积贡献；法拉第篇把“接通—稳态归零—断开反向偏转”作为电磁感应的核心实验结构。

---

## 网站已完成的同步

网站当前实际加载第01—11篇，并自动计算11篇、550个重点词和1995个尚未使用词元。

### 首页

- 自动统计文章数、重点词数、平均篇幅与剩余词量
- 第11篇作为最新定稿专题展示
- 十一篇文章卡片全部由数据层自动生成
- 深浅主题、响应式排版和无障碍焦点状态

### 文章阅读器

- 双语、仅英文、仅中文三种视图
- 英文重点词与中文自然译法悬停／点击连线
- 词源显示开关
- 挖空自测、逐词揭晓与一键重置
- 三档字号、阅读进度、段落导航和打印版式
- 50词速查表点击回到正文
- 史实核对与来源分层展示
- 上一篇／下一篇导航

### 550词词库

- 中英文实时搜索
- 按文章筛选
- A—Z首字母筛选
- 每个词都能回跳到原文段落

---

## 数据层与生成方式

当前权威数据层按以下顺序加载：

```text
data/articles.js      # 第01—07篇
data/article-08.js    # 第08篇
data/article-09.js    # 第09篇
data/article-10.js    # 第10篇
data/article-11.js    # 第11篇
```

它们共同构成 `window.SITE.ARTICLES`。网站三个页面与Markdown生成脚本都加载同一数据层，因此不会出现“网页一版、Markdown另一版”。

生成与校验：

```bash
python3 scripts/build_markdown.py
```

脚本会：

- 生成／刷新 `articles/*.md`
- 校验英文加粗、中文对应括注和速查表数量
- 校验词数、密度和20%红线
- 检查文章编号、slug及跨篇精确重复

---

## 目录

```text
├── index.html                 首页
├── article.html               双语阅读器
├── words.html                 550词索引
├── 404.html
├── manifest.webmanifest
├── robots.txt
├── sitemap.xml
├── assets/
│   ├── site.css
│   ├── site.js
│   ├── favicon.svg
│   └── share-card.svg
├── data/
│   ├── articles.js            第01—07篇
│   ├── article-08.js          第08篇
│   ├── article-09.js          第09篇
│   ├── article-10.js          第10篇
│   └── article-11.js          第11篇
├── articles/
│   └── 01—11 Markdown定稿
├── scripts/
│   └── build_markdown.py
├── tools/
│   ├── 单词检察官v3.html
│   └── 单词检察官v2.html
├── vocabulary/
└── notes/
    ├── 对话交接文档.md
    ├── 写作规范.md
    ├── 缺陷库.md
    ├── 最终定稿校正记录_2026-08-10.md
    ├── 第八篇入库与网站重构记录_2026-08-10.md
    └── 第九至第十一篇入库记录_2026-08-11.md
```

---

## 硬性标准

| 项目 | 要求 |
|---|---|
| 英文词数 | 250—300 |
| 重点词 | 恰好50个 |
| 密度 | ≤20% |
| 文体 | 《经济学人》风格科普社论 |
| 内容 | 人物、日期、数字或具体案例 |
| 中文 | 先自然表达，再建立加粗对应 |
| 结尾 | 提供新的理解框架，不只复述正文 |
| 事实 | 关键数据与叙事边界可追溯 |

铁律：

> 英文加粗的重点词，在中文译文中必须有对应的自然译法；中文译法同样加粗，并在后面附英文原样括注。
