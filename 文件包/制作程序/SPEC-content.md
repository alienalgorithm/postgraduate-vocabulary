# 逐句精讲 / 单词精解 写稿与审校规范（每篇文件包）

## 文件
- 文章数据：`/tmp/claude-0/-home-user/3d87cc6c-41dd-58c2-802f-d51dc0c78527/scratchpad/pkg/NN/article.json`
  - sentences[]：n、para、en（英文原句）、zh（视频审定中文）、align（视频里每个小段的 [英文, 中文] 对照）、video_notes（视频里的审定说明）
  - vocab[]：id、para、sentence（所在句号）、en（文中形式）、zh_video（视频审定中文）、headword、pos、table_definition（旧词表，仅供参考）
- 输出（JSON 数组，UTF-8）：同目录 `content/sent.json`、`content/words_a.json`、`content/words_b.json`
  - words_a 是 vocab 前一半的 id，words_b 是后一半（运行核对程序会告诉你具体 id）
- 范本（深度、语气、格式都照它）：`.../scratchpad/pkg/01/content/sent.json`、`words_a.json`、`words_b.json`（第 01 篇，已审定）
- 核对程序：`python3 /tmp/claude-0/-home-user/3d87cc6c-41dd-58c2-802f-d51dc0c78527/scratchpad/pkgtools/check_content.py NN 部分名`，必须输出 OK 才算完成；NOTE 行是音标提示，要按 Oxford/Cambridge 再核一遍。

## 通用规矩（全部必须遵守）
1. 读者是准备考研英语的中国学生。讲解用简体中文，专业、准确、具体，像资深考研英语老师写的讲义；不要空话套话，不要“让我们”“值得注意的是”“总之”，绝不写“怎么理解”“如何理解”。
2. 绝对不用破折号（—— — –）；不用任何粗体或 Markdown 记号（** # 反引号）。
3. 英文例句里三项及以上并列，一律加牛津逗号。例句必须地道、语法完全正确，语域接近外刊和考研阅读，不用文章原句，并配准确通顺的中文翻译。
4. 文章中文译文和重点词中文意思都是用户审定过的视频文字（sentences[].zh、vocab[].zh_video），讲解必须与之一致，不另立译法，不说视频译文有误。视频说明（video_notes）是审定内容，分析必须与之一致。
5. 事实、背景、词源只写有把握、权威词典（Oxford、Cambridge、Merriam-Webster、Etymonline）能查到的内容；没把握就不写。绝不编造。原文用推测语气（presumably 等）的，讲解也不能写成确定的事实。
6. 语法术语用国内考研通行叫法（主语、谓语、宾语、表语、宾语补足语、定语、状语、同位语、定语从句、名词性从句、状语从句、非谓语动词、独立主格、倒装、省略等）。

## sent.json 每句字段
- n
- trunk：subject 主语原文；predicate 谓语原文（含助动词、情态动词、否定词）；object_or_complement 宾语/表语/宾补原文（没有写 ""）；explain 一两句说明句型和谓语时态语态。
- components：按原句顺序切成连续成分片段。每段 {text, zh, role}：
  - text 原样取自原句（大小写、标点不改，标点跟在前一段末尾），所有 text 用一个空格连起来必须与 en 完全相同。
  - zh：这一段的中文意思，**只能用视频中文（该句 zh 和 align）里的原字**。中文不连续时用“……”连接，如“一只……章鱼”；没有单独对应中文的功能词（系动词、助动词等）写括号说明，如“（系动词，不单独译出）”“（系动词，与 unreported 合译为“没有被报道”）”。核对程序会检查每一段中文都出现在视频中文里。
  - role：成分，要具体，如“时间状语（介词短语）”“非限制性定语从句，修饰 a drain”“伴随状语（现在分词短语）”。从句作为整体一段即可。
- structure：完整结构分析，长句逐层拆：主句、各从句/非谓语/插入语修饰谁、引导词在从句中作什么成分。分小段用“①②③”标号，可用换行分隔。
- long_difficult：是否长难句（布尔）。
- grammar：1 到 4 个语法点 {title, explain, difficult, examples:[{en, zh}]}；explain 讲规则本身、本句中的体现、考研常见考法或易错点；difficult 为 true 的必须给 1 到 2 个文外例句，false 的建议给 1 个。
- knowledge：知识点 [{term, explain}]：重点词组和搭配、熟词僻义、必要的背景（只写确切事实）。不重复单词册的长篇词义。
- translation_tip：结合视频中文说明翻译处理（语序调整、拆句、定语从句和分词短语的译法、增补等），只解释现有译文，不提出新译文。

## words_*.json 每词字段
- id；headword 词典原形（crept 写 creep，stems from 写 stem from，keepers 写 keeper；专名保持原样）
- ipa_uk、ipa_us：Oxford/Cambridge 体例，带斜杠和重音符号，如 /ˈkiːpə(r)/、/ˈkiːpər/；短语逐词标在一起；两者相同也分别填。
- pos：n. v. adj. adv. prep. phr. v. n. phr. 等；专名写“n.（专有名词）”。
- form_note：文中形式说明（时态、复数、比较级等）；原形写“文中为原形”。
- context_usage：本文语境：句中成分、搭配、为什么取视频给出的中文意思（zh_video），语气色彩。要具体到这句话。
- etymology：前缀、词根、后缀拆分及含义，来源语言和原义如何发展到今义；只写权威词源词典能证实的。
- senses：常用义项 2 到 5 条 {pos, zh}，要包含本文意思。
- collocations：常见搭配 2 到 5 条 {en, zh}。
- usage_detail：及物/不及物、常接介词或结构、可数性、正式程度、考研阅读写作中的用法、易错点。
- distinction：近义词辨析（没有值得辨析的写 ""）。
- related：同根词、派生词 1 到 5 个 {en, pos, zh}，只列真实存在的词。
- example：一个文外例句 {en, zh}。

## 审校员（第二个人）的做法
读 article.json 和写好的 JSON，逐条、逐字段默认怀疑地核查：主干和成分是否找对、成分中文是否取自视频、从句引导词在从句中的成分、语法术语和规则、例句是否地道并真正示范该语法点、事实和日期、词源（不能证实的改正或删去）、音标（英美逐个核对音素和重音）、义项和派生词是否真实存在、是否违反通用规矩。发现问题直接在原 JSON 文件里改正（不要删掉正确有用的内容，空泛处补具体），每处实质改动记一条到 `content/corrections_部分名.json`（数组：{key, field, before, after, reason}）。改完运行核对程序直到 OK。
