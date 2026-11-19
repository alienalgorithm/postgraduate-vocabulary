# 证据库：《如何真正学好英语》（动画短片，只用文字和配乐）

写给分镜和场景作者。画面上的事实和数字，只能从本文件的“屏幕句”和“可上屏数字”里取，原样用，不加码、不改大。

## 0. 怎么核实的（先读）

- 核实日期：2026-11-19。
- 用 WebSearch（标准和 extended 两种模式）逐条核对了每篇文献的作者、年份、题目、期刊卷期页码和摘要里的结论。
- WebFetch 在本会话打不开论文原文：psychology.ecu.edu、www.brucehayes.org、journals.plos.org 都报“域名无法解析”（会话网络白名单不含这些站）。按规定没有再换站硬试。所以每条都标了“核实方式”：
  - 【摘要核实】：搜索结果直接给出了论文摘要原句或多处一致的摘要内容。
  - 【二手一致】：数字来自多个二手综述，互相一致，并和教科书常识一致，但没读到原文图表。
  - 【教科书】：学界公认的教科书事实，本次没能打开原文，只依靠公认内容。
- 规则：凡是只到【二手一致】的数字，上屏时一律用“约”“不到”“八成”这类保守说法，不写小数点。
- 屏幕文字规则提醒（来自 BRIEF）：不用破折号；不写国别、身份类字样（清单见 动画工坊/tools/ci/text_rules.py 的 BANNED）（所以下面屏幕句里不提研究在哪个国家做的，也不用“外语”二字，用“新语言”“第二语言”或直接说“英语”）；不写承诺。

## 1. 这些研究合起来支持的方法（故事主线）

研究本身各管一段，下面这条“方法链”是把它们串起来的合理推论，可以作为片子的观点；但不能说成“某项研究证明了这整套方法”。

1. 问题：学了就忘，而且忘得最快的是最开始（F1）。最常见的做法，反复看、划重点，效果其实偏低（F4）；反复看会让人“觉得会了”，一周后却记得更少（F3）。
2. 转折（恍然大悟点）：记住东西靠的不是多看一遍，而是合上书把它想起来（F3），并且隔开时间再想一次（F2）。
3. 单词从哪来：先学最常用的词，性价比最高（F7）；一个生词要在上下文里遇到很多次才扎下根（F8）。
4. 所以要大量读、大量听自己基本看得懂的内容（F5、F9），挑材料的标准：一页里绝大多数词都认识，约 98%（F6）。
5. 光输入不够，还要用出来，并且留意自己卡在哪里（F10、F11）。
6. 能坚持下去，靠兴趣和动机（F12），靠每天在固定时间做一点，偶尔漏一天也没关系（F13）。

可作高潮句的候选（都是忠实于证据的概括，不含数字）：
- “多看一遍，不如合上书想一遍。”（F3）
- “不是重复看，而是反复想起。”（F3、F2）
- “单词不是背会的，是在读得懂的句子里一次次遇见、一次次想起来的。”（F3、F6、F8 的概括）

---

## 2. 证据条目（13 条）

### F1 遗忘曲线（艾宾浩斯）
- 屏幕句：不复习，新学的东西会很快忘掉，而且一开始忘得最快。
- 角标：Ebbinghaus, 1885
- 出处：
  - Ebbinghaus, H. (1885). *Über das Gedächtnis: Untersuchungen zur experimentellen Psychologie*. Leipzig: Duncker & Humblot.（英译本 *Memory: A Contribution to Experimental Psychology*, 1913）
  - 重复验证：Murre, J. M. J., & Dros, J. (2015). Replication and analysis of Ebbinghaus' forgetting curve. *PLOS ONE*, 10(7), e0120644.
- 说明了什么：记忆保持量随时间下降，前几个小时下降最快，之后越来越慢。2015 年按原方法重做，曲线形状基本重现（24 小时处有一个小的回升）。
- 没说明什么（局限）：
  - 艾宾浩斯只有他自己一个被试，学的是无意义音节（如 WID、ZOF），不是有意义的单词或句子；有意义的材料忘得慢得多。
  - 他测的是“重学节省率”（再学一遍省下多少时间），不是“还记得百分之几”。常见的“20 分钟忘掉 42%”“1 天忘掉 67%”是把节省率误读成了回忆率。
  - 他没有提出任何“第 1、2、4、7、15 天复习”的时间表，这类表格不是艾宾浩斯的。
- 可上屏数字：不建议上屏任何百分比。曲线只画形状，纵轴写“记得的”，不标刻度数字。如果一定要数字，只能写“一天后，重学只省下约三分之一的时间”（原始数据 1 天节省约 34%），但这句难懂，不推荐。
- 可信度：高（形状）；数字只适用于原实验条件。
- 核实方式：【二手一致】节省率 20 分钟约 58%、1 小时约 44%、1 天约 34%、31 天约 21%，多处一致；【摘要核实】Murre & Dros 2015 的设计和结论。

### F2 间隔效应：隔开复习比挤在一起记得更久
- 屏幕句：同样复习几次，把复习隔开几天，比一口气复习完记得更久。
- 角标：Cepeda et al., 2006
- 出处：
  - Cepeda, N. J., Pashler, H., Vul, E., Wixted, J. T., & Rohrer, D. (2006). Distributed practice in verbal recall tasks: A review and quantitative synthesis. *Psychological Bulletin*, 132(3), 354-380.（汇总 184 篇文章、317 个实验、839 次测量）
  - Cepeda, N. J., Vul, E., Rohrer, D., Wixted, J. T., & Pashler, H. (2008). Spacing effects in learning: A temporal ridgeline of optimal retention. *Psychological Science*, 19(11), 1095-1102.
  - 第二语言专门的汇总：Kim, S. K., & Webb, S. (2022). The effects of spaced practice on second language learning: A meta-analysis. *Language Learning*, 72(1), 269-319.（48 个实验，98 个效应量，N = 3,411；间隔练习有中到大的效果）
  - 词汇长期研究：Bahrick, H. P., Bahrick, L. E., Bahrick, A. S., & Bahrick, P. E. (1993). Maintenance of foreign language vocabulary and the spacing effect. *Psychological Science*, 4(5), 316-321.
- 说明了什么：总复习量相同，分散到不同时间比集中在一次效果好，在词汇学习上同样成立。最佳间隔随“要记多久”变长而变长。Kim & Webb (2022)：短间隔在即时测验里和长间隔差不多，但在延后测验里不如长间隔；等距和逐渐拉长的间隔效果差不多。
- 没说明什么：没有一个对所有人都最优的固定间隔天数；间隔太长、中间完全忘光，效果也会下降。不能说“间隔越长越好”，也不能说“必须按某张固定时间表”。
- 可上屏数字：建议不上屏数字。Bahrick 1993 摘要原意是“每 56 天复习一次共 13 次，与每 14 天复习一次共 26 次，多年后的保持相近”，但只有 4 名被试（作者一家人），且每次都练到固定标准，长间隔组每次实际练得更多，所以不推荐上屏。
- 可信度：高（间隔效应本身是记忆研究里最稳的结论之一）。
- 核实方式：【摘要核实】Cepeda 2006 卷期页码和规模；Kim & Webb 2022 摘要结论；Bahrick 1993 摘要设计与结论。

### F3 提取练习（测试效应）：合上书回想，比再看一遍记得更牢
- 屏幕句：合上书把它想起来，比再看一遍记得更牢。
- 补充屏幕句（“错觉”）：反复看，当下觉得记住了；一周后，反而记得更少。
- 角标：Roediger & Karpicke, 2006；Karpicke & Roediger, 2008
- 出处：
  - Roediger, H. L., III, & Karpicke, J. D. (2006). Test-enhanced learning: Taking memory tests improves long-term retention. *Psychological Science*, 17(3), 249-255.
  - Karpicke, J. D., & Roediger, H. L., III. (2008). The critical importance of retrieval for learning. *Science*, 319(5865), 966-968.
- 说明了什么：
  - 2006（学生读短文）：实验 2 里，一组把短文读 4 遍，一组读 1 遍后自己回忆 3 次。5 分钟后测，读 4 遍的一组更好；一周后测，回忆组约 61%，读 4 遍组约 40%。实验 1 一周后：回忆组约 56%，重读组约 42%。
  - 2008（40 对斯瓦希里语和英语的单词对）：一个词已经能想起来以后，继续反复测（回想）一周后记得约 80%；不再测、只继续看的，一周后不到 40%。摘要原意：“学会之后反复学习对延后回忆没有作用，反复测试有很大的正面作用”；学生对自己成绩的预测和实际成绩不相关。
- 没说明什么：
  - 被试是大学生，材料是短文或单词对，测的是回忆，不是整体英语水平。
  - “测试”指自己主动回想（自测、卡片、默写），不是“多参加考试”“刷题越多越好”。
  - 不是说“阅读没用”：阅读是获取新内容，提取是把学过的东西记牢，两者不冲突。
  - 2008 年那句“反复学习没有作用”只指“已经能想起来之后再多看”，不能泛化成“看书没用”。
- 可上屏数字（原样用）：
  - “一周后：合上书回想的一组记得约 61%，反复读 4 遍的一组约 40%”（Roediger & Karpicke, 2006，实验 2）。
  - “一周后：反复回想的单词记住约 80%，只看不想的不到 40%”（Karpicke & Roediger, 2008）。
  - “5 分钟后，反复读的一组反而更好”（2006，可用于表现“错觉”，不配数字）。
- 可信度：高（测试效应被大量重复验证）；具体百分比为中高（二手来源一致，未读原文图）。
- 核实方式：【摘要核实】两篇的卷期页码、设计和摘要结论；【二手一致】61% 对 40%、56% 对 42%、约 80% 对 36%（或 33%，所以上屏写“不到 40%”）。

### F4 最常用的方法（重读、划线）效果偏低
- 屏幕句：最常见的学习方法，反复读、划重点，研究评估效果偏低。
- 补充屏幕句：自测和分散复习，被评为效果最好的两种方法。
- 角标：Dunlosky et al., 2013
- 出处：Dunlosky, J., Rawson, K. A., Marsh, E. J., Nathan, M. J., & Willingham, D. T. (2013). Improving students' learning with effective learning techniques: Promising directions from cognitive and educational psychology. *Psychological Science in the Public Interest*, 14(1), 4-58.
- 辅助：Karpicke, J. D., Butler, A. C., & Roediger, H. L., III. (2009). Metacognitive strategies in student learning: Do students practise retrieval when they study on their own? *Memory*, 17(4), 471-479.（学生自学时最常报告的是重读，普遍意识不到自测的好处）
- 说明了什么：综述评估了 10 种学习方法。高效用：自测（practice testing）、分散练习（distributed practice）。中等：精细提问、自我解释、交错练习。低效用：总结、划线、关键词记忆法、文本意象法、重读。
- 没说明什么：“低效用”不等于“完全没用”，是指效果不稳定、适用面窄；综述主要针对学生学习课程内容，不是专门针对第二语言。作者也提醒：方法只对愿意用、会用的学生有效。
- 可上屏数字：“10 种学习方法里，被评为效果最高的只有 2 种：自测和分散复习”。不要上屏“84% 的学生只会重读”（该数字未核实到原文；另一研究 Hartwig & Dunlosky 2012 报告的是 83.6% 的学生最常用重读，如要用必须改标这篇，且建议不用）。
- 可信度：高。
- 核实方式：【摘要核实】期刊卷期、10 种方法和高中低分级。

### F5 可理解输入：读得懂、听得懂的大量输入是基础
- 屏幕句：大量接触自己基本能听懂、读懂的内容，是学会一门语言的基础。
- 角标：Krashen, 1982
- 出处：
  - Krashen, S. D. (1982). *Principles and Practice in Second Language Acquisition*. Oxford: Pergamon.
  - Krashen, S. D. (1985). *The Input Hypothesis: Issues and Implications*. London: Longman.
- 说明了什么：这是一个影响很大的理论：语言主要在“理解信息”的过程中习得，输入要能懂，最好比现有水平稍难一点（i+1）。大量研究支持“输入的量和可理解程度很重要”这一核心。
- 没说明什么：它是理论假说，不是实验结论。“只靠输入、不用学语法、不用开口”的强版本被广泛批评（概念难以测量、难以证伪；见 McLaughlin 1987 等）；沉浸式课堂的研究表明只有输入时，口语和写作会落后（见 F10）。“i+1”没有可测量的定义，不能上屏当公式。
- 可上屏数字：无。英文视觉元素可用 “comprehensible input”（拼写如此）。
- 可信度：中（核心“输入很重要”可信度高；强版本不可用）。
- 核实方式：【教科书】书目信息；【二手一致】批评要点。

### F6 词汇覆盖率：一页约 98% 的词认识，读起来才轻松
- 屏幕句：一篇文章里约 98% 的词都认识，也就是每 50 个词里最多 1 个生词，大多数人才能比较轻松地独立读懂。
- 短版屏幕句：每 50 个词，最多 1 个生词，读起来才轻松。
- 角标：Hu & Nation, 2000
- 出处：
  - Hu, M., & Nation, I. S. P. (2000). Unknown vocabulary density and reading comprehension. *Reading in a Foreign Language*, 13(1), 403-430.
  - Laufer, B., & Ravenhorst-Kalovski, G. (2010). Lexical threshold revisited: Lexical text coverage, learners' vocabulary size and reading comprehension. *Reading in a Foreign Language*, 22(1), 15-30.（摘要：98% 为“理想”门槛，约需 8,000 词族；95% 为“最低”门槛，约需 4,000 到 5,000 词族）
  - Nation, I. S. P. (2006). How large a vocabulary is needed for reading and listening? *Canadian Modern Language Review*, 63(1), 59-82.（按 98% 计：书面约 8,000 到 9,000 词族，口语约 6,000 到 7,000 词族）
  - 重复研究：Kremmel, B., Indrarathne, B., Kormos, J., & Suzuki, S. (2023). Unknown vocabulary density and reading comprehension: Replicating Hu and Nation (2000). *Language Learning*（2023 年在线发表，doi:10.1111/lang.12622）。
- 说明了什么：认识的词越多，理解越好；98% 常被当作“不查词典也能读得顺”的参考线，95% 是勉强能读的下限。这正好给“挑什么材料读”一个标准：太多生词的材料读不下去，也学不到。
- 没说明什么：
  - 98% 不是硬门槛，覆盖率和理解是连续关系，不是到了 98% 突然读懂。
  - 原研究样本只有 66 名大学生；2023 年的重复研究“未能完全重现”原结果，作者质疑是否存在一个通用的固定门槛。
  - 听力的要求可能低一些（van Zeeland & Schmitt 2013 认为约 95% 可能就够）。
- 可上屏数字：“约 98%”“每 50 个词，最多 1 个生词”（两种说法等价，可二选一或连用）。不要上屏“8,000 词”之类词汇量数字（单位是“词族”，观众会误解成单词数，而且各研究给的数不同）。
- 可信度：中高（作为参考线被广泛采用；精确门槛有争议）。
- 核实方式：【摘要核实】Laufer & Ravenhorst-Kalovski 2010、Nation 2006、Kremmel 等 2023 的摘要；【教科书】Hu & Nation 2000 的期刊卷期页码（搜索确认了 98% 结论，未直接显示卷期）。

### F7 高频词：最常用的约 2000 个词族，覆盖约八成文字
- 屏幕句：最常用的约 2000 个词族，就占了一般文章里约八成的词。先学它们，最划算。
- 角标：Nation & Waring, 1997；Nation, 2013
- 出处：
  - Nation, P., & Waring, R. (1997). Vocabulary size, text coverage and word lists. In N. Schmitt & M. McCarthy (Eds.), *Vocabulary: Description, Acquisition and Pedagogy* (pp. 6-19). Cambridge University Press.
  - Nation, I. S. P. (2013). *Learning Vocabulary in Another Language* (2nd ed.). Cambridge University Press.
  - 学术文本补充：Coxhead, A. (2000). A new academic word list. *TESOL Quarterly*, 34(2), 213-238.（570 个学术词族约占学术文本 10.0% 的词）
- 说明了什么：词的使用频率极不均匀，少数高频词反复出现，占了文本里大部分的词次。所以高频词最值得先学、学透。
- 没说明什么：“约八成”是按词次（running words）算的，不是说认识 2000 个词就能看懂八成内容；剩下两成的低频词往往才是关键信息词，单靠 2000 词远远读不懂一般文章（读懂要约 98%，见 F6）。具体比例随语料类型不同而变化（学术文本略低）。
- 可上屏数字：“约 2000 个词族”“约八成（约 80%）的词”。必须写“词族”或写“最常用的约 2000 个词（词族）”，不能写“2000 个单词就够用”。
- 可信度：高（现象本身）；“80%”为中高（常引数字，语料不同略有差异）。
- 核实方式：【二手一致】“2000 词族约 80%”多处一致；【摘要核实】Coxhead 2000 的 570 词族、约 10%。

### F8 一个生词要在上下文里反复遇见很多次
- 屏幕句：一个生词，在上下文里遇到约 10 次，才会有明显的收获；想真正掌握，往往还要更多次。
- 短版屏幕句：一个生词，要遇见很多次，才能扎下根。
- 角标：Webb, 2007
- 出处：
  - Webb, S. (2007). The effects of repetition on vocabulary knowledge. *Applied Linguistics*, 28(1), 46-65.
  - Uchihara, T., Webb, S., & Yanagisawa, A. (2019). The effects of repetition on incidental vocabulary learning: A meta-analysis of correlational studies. *Language Learning*, 69(3), 559-599.（26 项研究，N = 1,918；遇见次数与习得为中等相关，r = .34）
  - Waring, R., & Takaki, M. (2003). At what rate do learners learn and retain new vocabulary from reading a graded reader? *Reading in a Foreign Language*, 15(2), 130-163.（读一本分级读物记住的新词很少，需要大量阅读）
- 说明了什么：遇见次数越多，对一个词的各方面知识（拼写、意思、搭配、用法）掌握得越好。Webb 2007：121 名学习者，分别在 1、3、7、10 次语境中遇见生词；次数每增加，至少一个方面的知识有提高；10 次时收获可观；要全面掌握，可能需要超过 10 次。
- 没说明什么：没有一个“遇见 N 次就一定记住”的魔法数字；次数只是影响因素之一（相关 r = .34 为中等），词本身难度、语境是否清楚、是否有间隔、是否主动回想都很重要。Webb 2007 的语境是短句，不是整本书。
- 可上屏数字：“约 10 次”，必须连着“才会有明显收获”或“往往还要更多次”一起出现。不得写“10 次就能记住”“7 次记住”。
- 可信度：中高（“需要多次遇见”高；“约 10 次”为单项研究，中）。
- 核实方式：【摘要核实】Webb 2007 的设计（1、3、7、10 次，121 人）和结论；Uchihara 等 2019 的 r = .34 与样本；Waring & Takaki 2003 的结论。

### F9 泛读：大量读自己读得懂的书，阅读能力明显提高
- 屏幕句：大量阅读自己读得懂、感兴趣的材料，阅读能力会明显提高。
- 角标：Nakanishi, 2015；Jeon & Day, 2016
- 出处：
  - Nakanishi, T. (2015). A meta-analysis of extensive reading research. *TESOL Quarterly*, 49(1), 6-37.（34 项研究，43 个效应量，3,942 名被试；组间比较 d = 0.46，前后测 d = 0.71）
  - Jeon, E.-Y., & Day, R. R. (2016). The effectiveness of ER on reading proficiency: A meta-analysis. *Reading in a Foreign Language*, 28(2), 246-265.（两种设计下都为小到中等效果；成人效果高于儿童和青少年）
- 说明了什么：多项研究汇总显示，泛读（大量、轻松、自选的阅读）对阅读能力有稳定的正面效果，对阅读速度的效果尤其明显。
- 没说明什么：效应量为小到中等，不是“奇迹”；研究质量参差，持续时间越长效果越好；单靠泛读学到的新词有限（见 F8 的 Waring & Takaki），最好配合主动学词和回想。
- 可上屏数字：建议不上屏效应量（观众会误读成“提高 46%”）。可写“多项研究汇总”（Nakanishi 汇总了 34 项研究，可写“34 项研究的汇总”）。
- 可信度：中高。
- 核实方式：【摘要核实】Nakanishi 2015 的规模和效应量；Jeon & Day 2016 的卷期和结论（具体数值来自作者配套文章，未上屏）。

### F10 输出：光听光读不够，还要用出来
- 屏幕句：只听只读，说和写会落后；把学到的说出来、写出来，才会发现自己哪里还不会。
- 角标：Swain, 1985
- 出处：
  - Swain, M. (1985). Communicative competence: Some roles of comprehensible input and comprehensible output in its development. In S. Gass & C. Madden (Eds.), *Input in Second Language Acquisition* (pp. 235-253). Rowley, MA: Newbury House.
  - Swain, M. (1995). Three functions of output in second language learning. In G. Cook & B. Seidlhofer (Eds.), *Principle and Practice in Applied Linguistics* (pp. 125-144). Oxford University Press.
- 说明了什么：长期在沉浸式课堂里学习的学生，听读理解接近很高水平，但口语和写作里仍保留不少错误；课堂上学生很少有机会长段输出。输出能让学习者注意到“想说却说不出”的缺口，检验自己的假设，并促进反思。
- 没说明什么：Swain 本人也没说输出是语言能力的主要来源；输出和输入是互补关系。研究对象是特定沉浸式项目的儿童，不能推成“不开口就永远学不会”。
- 可上屏数字：无。屏幕上不要提研究所在国家（BRIEF 规定），写“沉浸式课堂的学生”即可。英文视觉元素可用 “output”。
- 可信度：中。
- 核实方式：【二手一致】书目与发现；原文未打开。

### F11 注意：注意到了，才更容易学进去
- 屏幕句：留意到的东西，才更容易学进去。读的时候，留意新词和新用法。
- 角标：Schmidt, 1990
- 出处：Schmidt, R. W. (1990). The role of consciousness in second language learning. *Applied Linguistics*, 11(2), 129-158.
- 说明了什么：注意（noticing）在把输入变成“吸收”的过程中起重要作用。
- 没说明什么：原版“注意是习得的必要且充分条件”的强说法受到批评（如 Truscott, 1998, *Second Language Research*, 14(2), 103-135），Schmidt 后来也把说法放宽为“注意有帮助”。不能说“没注意到就学不会”。
- 可上屏数字：无。英文视觉元素可用 “noticing”。
- 可信度：中（弱版本“注意有帮助”可用）。
- 核实方式：【摘要核实】卷期页码和摘要论点；【二手一致】后续修正与批评。

### F12 动机和兴趣：越想学，学得越好
- 屏幕句：越想学、越有兴趣的人，往往学得越好。找到你真正想看、想读的英语。
- 角标：Masgoret & Gardner, 2003
- 出处：Masgoret, A.-M., & Gardner, R. C. (2003). Attitudes, motivation, and second language learning: A meta-analysis of studies conducted by Gardner and associates. *Language Learning*, 53(1), 123-163.（另见 53(S1) 增刊版，167-210）
- 说明了什么：汇总 75 个独立样本、10,489 人：在各种态度和动机变量中，“动机”与第二语言成绩的相关最高。
- 没说明什么：这是相关，不是因果；也可能是学得好让人更有动机。都是 Gardner 团队的研究，测量工具一致但来源单一。不能说“兴趣决定一切”。
- 可上屏数字：无（建议不上屏相关系数）。
- 可信度：中。
- 核实方式：【摘要核实】样本规模与主要结论。

### F13 每天一点：习惯靠重复，偶尔漏一天没关系
- 屏幕句：每天在固定的时间做一点，慢慢就成了习惯；偶尔漏一天，影响不大。
- 补充屏幕句：养成一个习惯，研究里中位数约 66 天，因人而异。
- 角标：Lally et al., 2010
- 出处：Lally, P., van Jaarsveld, C. H. M., Potts, H. W. W., & Wardle, J. (2010). How are habits formed: Modelling habit formation in the real world. *European Journal of Social Psychology*, 40(6), 998-1009.
- 说明了什么：96 名志愿者每天在同一情境下做一件新的饮食或运动小事，持续 12 周。达到自动化程度平台的 95%，所需时间中位数约 66 天，个人差异从 18 天到 254 天。摘要原句意思：“漏掉一次机会，并没有实质影响习惯形成。”
- 没说明什么：研究的是饮食、运动类小行为，不是学英语；254 天是模型外推（研究只做了 84 天）；能拟合的只有部分被试（约 39 人）。“21 天养成习惯”没有依据。
- 可上屏数字：“中位数约 66 天”或“往往要两个月左右”，必须带“因人而异”。不要写“66 天一定养成”。
- 可信度：中（单项研究，但被广泛引用，结论温和）。
- 核实方式：【摘要核实】期刊卷期、被试、66 天中位数、18 到 254 天、“漏一次不影响”原句。

---

## 3. 可上屏数字总表（只许用这些，措辞照抄）

| 数字 | 屏幕原样措辞 | 角标 |
|---|---|---|
| 61% 对 40% | 一周后：合上书回想的一组记得约 61%，反复读 4 遍的一组约 40% | Roediger & Karpicke, 2006 |
| 约 80% 对 不到 40% | 一周后：反复回想的单词记住约 80%，只看不想的不到 40% | Karpicke & Roediger, 2008 |
| 10 选 2 | 10 种学习方法里，被评为效果最高的只有 2 种：自测和分散复习 | Dunlosky et al., 2013 |
| 98%、1/50 | 约 98% 的词都认识；每 50 个词，最多 1 个生词 | Hu & Nation, 2000 |
| 2000、八成 | 最常用的约 2000 个词族，占一般文章里约八成的词 | Nation & Waring, 1997 |
| 约 10 次 | 在上下文里遇到约 10 次，才会有明显收获；想真正掌握，往往还要更多次 | Webb, 2007 |
| 34 项研究 | 34 项研究的汇总：大量阅读能明显提高阅读能力 | Nakanishi, 2015 |
| 约 66 天 | 养成一个习惯，研究里中位数约 66 天，因人而异 | Lally et al., 2010 |

注：年份数字（如 “1885”）可作角标或视觉元素。所有百分比前保留“约”。

## 4. 绝对不能说的话（误区和夸大）

1. 任何承诺：“保证学会”“X 天流利”“X 天背完考研词汇”“提分 X 分”。
2. “艾宾浩斯说 20 分钟忘掉 42%、1 天忘掉 67%”：他测的是重学节省率，被试只有他自己，材料是无意义音节。
3. “艾宾浩斯复习时间表（第 1、2、4、7、15 天……）”：不是艾宾浩斯提出的，也没有一张对所有人都最优的固定时间表。
4. “间隔越长越好”：间隔太长、全忘了，效果反而差；最佳间隔取决于要记多久。
5. “测试效应 = 多考试、多刷题”：指的是自己主动回想；“读书没用”同样错误。
6. “遇见 7 次 / 10 次就一定记住”：没有魔法次数。
7. “必须认识 98% 的词才能读懂”“认识 2000 个词就能看懂 80% 的文章”：前者是参考线不是硬门槛；后者把“词次覆盖”误当成“内容理解”。
8. “只要输入就够了，不用学语法、不用开口”（Krashen 的强版本）；或者反过来“不开口就永远学不会”。
9. “背单词没用”：用卡片主动记词并回想是高效的（Nation, 2013；Elgort, 2011, *Language Learning*, 61(2), 367-413），问题在于只看不想、背完不再遇见。
10. “学习金字塔：听讲记住 5%，教别人记住 90%”：这些百分比找不到可靠的研究来源（Letrud, 2012 等），不得使用。
11. “学习风格（视觉型、听觉型）匹配教学效果更好”：缺乏证据支持（Pashler, McDaniel, Rohrer, & Bjork, 2008, *Psychological Science in the Public Interest*, 9(3), 105-119）。
12. “21 天养成一个习惯”：没有依据（见 F13）。
13. “人脑只用了 10%”“左脑型、右脑型学习者”：伪科学。
14. “睡觉时放录音就能学会新单词”：没有可靠证据，不得暗示。
15. “过了某个年龄就学不好英语”或“成年人学英语更快”：关键期问题有争议，任何一个方向的断言都不用。
16. “兴趣决定一切”“动机越强一定学得越好”：只有相关证据。
17. 把效应量写成百分比（例如把 d = 0.46 写成“提高 46%”）。
18. 拿任何群体做比较或贬低（“某某人学得差”“哑巴英语的人”之类），以及国别、身份类字样（清单见 动画工坊/tools/ci/text_rules.py 的 BANNED）。

## 5. 角标速查（画面角落小字，原样用）

Ebbinghaus, 1885 ｜ Murre & Dros, 2015 ｜ Cepeda et al., 2006 ｜ Kim & Webb, 2022 ｜ Roediger & Karpicke, 2006 ｜ Karpicke & Roediger, 2008 ｜ Dunlosky et al., 2013 ｜ Krashen, 1982 ｜ Hu & Nation, 2000 ｜ Laufer & Ravenhorst-Kalovski, 2010 ｜ Nation & Waring, 1997 ｜ Nation, 2013 ｜ Webb, 2007 ｜ Uchihara et al., 2019 ｜ Nakanishi, 2015 ｜ Jeon & Day, 2016 ｜ Swain, 1985 ｜ Schmidt, 1990 ｜ Masgoret & Gardner, 2003 ｜ Lally et al., 2010

## 6. 可作英文视觉元素的词（拼写已核对）

forget, remember, recall, retrieval, spacing, review, input, comprehensible input, output, noticing, context, encounter, extensive reading, habit, motivation, vocabulary, word family, curve
