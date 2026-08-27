/* 站点数据源 —— 唯一真相
 *
 * 加新文章：在 ARTICLES 数组末尾追加一条，然后运行
 *     python3 scripts/build_markdown.py
 * 即可同步生成 articles/*.md
 *
 * 加粗写法：
 *   英文  **word**
 *   中文  **译法**(word)      ← 括号里必须是英文里那个词的原样形态
 */

window.SITE = {
  "ARTICLES": [
    {
    "id": "01",
    "slug": "snow-cholera",
    "title": "Snow and the Broad Street Pump",
    "titleZh": "斯诺与宽街水泵",
    "standfirst": "一张地图，一个远在几英里外的寡妇，和一个不必等确定性的决定。",
    "topic": "1854 年伦敦霍乱",
    "date": "2026-08-15",
    "status": "第一篇最终精进锁定稿",
    "metrics": {
      "words": 266,
      "keywords": 50,
      "density": 18.8
    },
    "paras": [
      {
        "en": "In September 1854 a few streets of Soho, in central London, lost 616 people to **cholera** in ten days. **Prevailing** medical **opinion** **blamed** the **foul** air. John Snow, a **physician** who lived **nearby**, **doubted** it, and went house to house asking where the dead **drew** their **supply**.",
        "zh": "1854年9月，伦敦市中心苏活区的几条街道，在十天里因**霍乱**(cholera)死了616人。**当时主流的**(Prevailing)医学**意见**(opinion)把账**算在**(blamed)**污浊的**(foul)空气头上。住在**附近**(nearby)的**内科医生**(physician)约翰·斯诺**不信**(doubted)这套说法，挨家挨户去问：死者平日从哪里**打**(drew)水、用的是哪一处**水源**(supply)。"
      },
      {
        "en": "He set a **stroke** against each **address** on a chart of the **neighbourhood**, one for every death. The **strokes** **gathered** around a single **pump** on Broad Street, and **thinned** to nothing two **blocks** off. The pattern showed him where to look; the **exceptions**, where the water differed, **vindicated** him.",
        "zh": "他在**街区**(neighbourhood)图上按**片区**(blocks)，按**门牌**(address)为每一例死亡划下一道**短线**(stroke)。这些**短线**(strokes)**聚拢**(gathered)在宽街的一口**水泵**(pump)周围，出去两个街区就**稀疏**(thinned)得几乎没有了。分布告诉他该往哪儿看；那些水源不同的**例外**(exceptions)**证实**(vindicated)了他。"
      },
      {
        "en": "A **workhouse** of 535 **inmates** inside the death **zone** had its own **borehole** and **recorded** five deaths. A **brewery** **beside** the pump lost nobody, since the men were **supplied** with beer. Both stood in the same **stench** as the tenements being **emptied** around them: same air, different water.",
        "zh": "死亡**区域**(zone)之内，一所收容535名**院民**(inmates)的**济贫院**(workhouse)有自己的**钻井**(borehole)，**记录在案**(recorded)的死亡只有五例。紧**挨着**(beside)水泵的一家**酿酒厂**(brewery)一个人也没死，因为工人的**配给**(supplied)是啤酒。两处都浸在与周围正被**清空**(emptied)的出租屋同样的**恶臭**(stench)里；空气一模一样，水不是。"
      },
      {
        "en": "Susannah Eley, a **widow** in Hampstead **remote** from Soho air, died on 2 September; she preferred the **taste** of Broad Street water and had it **delivered**. Her **niece**, visiting from Islington, **drank** the same bottle and died next day. Those two deaths **refute** the **miasma** by themselves. Snow had no microscope, no germ, no **infection** theory: a map and two **anomalies**.",
        "zh": "苏珊娜·伊利是位住在汉普斯特德的**寡妇**(widow)，那里**远离**(remote)苏活的任何空气，她却在9月2日死了：她偏爱宽街水的**口感**(taste)，一直让人**送**(delivered)过去。她那位从伊斯灵顿来串门的**外甥女**(niece)**喝**(drank)了同一瓶水，第二天也死了。这两个人单凭自己就**驳倒**(refute)了**瘴气说**(miasma)。斯诺没有显微镜，没有细菌，也没有**传染**(infection)理论，只有一张地图和两处**异常**(anomalies)。"
      },
      {
        "en": "On 8 September the **parish** **removed** the pump **handle**. **Diggers** later found the leaking **cesspit** two feet eight inches away. The outbreak was already **fading**; the board **accepted** his advice, not his conclusion. He died in 1858, his **profession** still **unconvinced**. When being wrong costs a handle and being right saves a street, **certainty** is the wrong thing to wait for.",
        "zh": "9月8日，**教区**(parish)**卸下**(removed)了水泵的**把手**(handle)。后来，**挖掘工**(Diggers)才在两英尺八英寸外找到那口渗漏的**粪坑**(cesspit)。疫情本已在**消退**(fading)，委员会**接受**(accepted)的也不是他的结论，只是他的建议；他1858年去世时，他那个**行当**(profession)仍然**不信**(unconvinced)。当错了不过是丢一个把手、对了却能救下一条街，**确定性**(certainty)就是那件不该等的东西。"
      }
    ],
    "glossary": [
      {
        "w": "cholera",
        "zh": "霍乱",
        "p": 1
      },
      {
        "w": "prevailing",
        "zh": "主流的；盛行的",
        "p": 1
      },
      {
        "w": "opinion",
        "zh": "意见",
        "p": 1
      },
      {
        "w": "blamed",
        "zh": "算在",
        "p": 1
      },
      {
        "w": "foul",
        "zh": "污浊的",
        "p": 1
      },
      {
        "w": "physician",
        "zh": "内科医生",
        "p": 1
      },
      {
        "w": "nearby",
        "zh": "附近的",
        "p": 1
      },
      {
        "w": "doubted",
        "zh": "怀疑；不信",
        "p": 1
      },
      {
        "w": "drew",
        "zh": "打",
        "p": 1
      },
      {
        "w": "supply",
        "zh": "水源；供给",
        "p": 1
      },
      {
        "w": "stroke",
        "zh": "短线；一划",
        "p": 2
      },
      {
        "w": "address",
        "zh": "门牌；地址",
        "p": 2
      },
      {
        "w": "neighbourhood",
        "zh": "街区",
        "p": 2
      },
      {
        "w": "strokes",
        "zh": "短线；一划",
        "p": 2
      },
      {
        "w": "gathered",
        "zh": "地图",
        "p": 2
      },
      {
        "w": "pump",
        "zh": "水泵",
        "p": 2
      },
      {
        "w": "thinned",
        "zh": "聚拢",
        "p": 2
      },
      {
        "w": "blocks",
        "zh": "片区；街区（复）",
        "p": 2
      },
      {
        "w": "exceptions",
        "zh": "例外",
        "p": 2
      },
      {
        "w": "vindicated",
        "zh": "证实；为…正名",
        "p": 2
      },
      {
        "w": "workhouse",
        "zh": "济贫院",
        "p": 3
      },
      {
        "w": "inmates",
        "zh": "院民；被收容者",
        "p": 3
      },
      {
        "w": "zone",
        "zh": "区域",
        "p": 3
      },
      {
        "w": "borehole",
        "zh": "钻井",
        "p": 3
      },
      {
        "w": "recorded",
        "zh": "记录在案",
        "p": 3
      },
      {
        "w": "brewery",
        "zh": "酿酒厂",
        "p": 3
      },
      {
        "w": "beside",
        "zh": "紧挨着",
        "p": 3
      },
      {
        "w": "supplied",
        "zh": "水源；供给",
        "p": 3
      },
      {
        "w": "stench",
        "zh": "恶臭",
        "p": 3
      },
      {
        "w": "emptied",
        "zh": "清空",
        "p": 3
      },
      {
        "w": "widow",
        "zh": "寡妇",
        "p": 4
      },
      {
        "w": "remote",
        "zh": "远离的；偏远的",
        "p": 4
      },
      {
        "w": "taste",
        "zh": "口感；味道",
        "p": 4
      },
      {
        "w": "delivered",
        "zh": "送递",
        "p": 4
      },
      {
        "w": "niece",
        "zh": "外甥女；侄女",
        "p": 4
      },
      {
        "w": "drank",
        "zh": "喝",
        "p": 4
      },
      {
        "w": "refute",
        "zh": "驳倒",
        "p": 4
      },
      {
        "w": "miasma",
        "zh": "瘴气",
        "p": 4
      },
      {
        "w": "infection",
        "zh": "传染",
        "p": 4
      },
      {
        "w": "anomalies",
        "zh": "异常",
        "p": 4
      },
      {
        "w": "parish",
        "zh": "教区",
        "p": 5
      },
      {
        "w": "removed",
        "zh": "卸下",
        "p": 5
      },
      {
        "w": "handle",
        "zh": "把手",
        "p": 5
      },
      {
        "w": "diggers",
        "zh": "挖掘工",
        "p": 5
      },
      {
        "w": "cesspit",
        "zh": "粪坑",
        "p": 5
      },
      {
        "w": "fading",
        "zh": "消退",
        "p": 5
      },
      {
        "w": "accepted",
        "zh": "接受",
        "p": 5
      },
      {
        "w": "profession",
        "zh": "行当；职业",
        "p": 5
      },
      {
        "w": "unconvinced",
        "zh": "不相信的",
        "p": 5
      },
      {
        "w": "certainty",
        "zh": "确定性",
        "p": 5
      }
    ],
    "facts": [
      "616 人死于十日内；9 月 8 日拆除泵柄。　[Wikipedia：1854 Broad Street cholera outbreak](https://en.wikipedia.org/wiki/1854_Broad_Street_cholera_outbreak)",
      "波兰街济贫院 535 名院民，仅 5 例死亡（自有水井）。　**已核**：St James／Poland Street 济贫院 535 名院民仅 5 例死亡，因自有水源。[Look Up London](https://lookup.london/john-snow-water-pump/)",
      "狮子啤酒厂员工零感染（喝厂里啤酒 + 自有深井）。　**已核**：狮子啤酒厂员工零感染——喝作为工资一部分的啤酒，并用厂内自有深井。[Gavi：John Snow and the Pump Handle of Public Health](https://www.gavi.org/vaccineswork/john-snow-and-pump-handle-public-health)",
      "汉普斯特德寡妇苏珊娜·伊利（Susannah Eley），因偏爱宽街水口味而定期取水，病死。　**已核**：苏珊娜·伊利 9 月 2 日病死于汉普斯特德，因偏爱宽街水而定期取水；其到访的侄女饮同一瓶水后次日死亡。[Britain Untold](https://www.britainuntold.co.uk/articles/the-day-dr-john-snow-removed-the-broad-street-pump-handle-and-saved-london)",
      "拆泵柄时疫情本已在消退 —— 这个不体面的细节必须保留，是文章诚实性的关键。　[PMC：John Snow, Cholera, the Broad Street Pump](https://pmc.ncbi.nlm.nih.gov/articles/PMC7150208/)",
      "斯诺 1858 年去世，病菌说数十年后才被接受。　[Wikipedia：John Snow](https://en.wikipedia.org/wiki/John_Snow)",
      "来源：[John Snow 1855年《霍乱的传播方式》原著](https://wellcomecollection.org/works/uqa27qrt)",
      "来源：[1855年圣詹姆斯教区霍乱调查报告](https://wellcomecollection.org/works/z8xczc2r)",
      "来源：[伦敦卫生与热带医学院：宽街水泵与1854年疫情](https://www.lshtm.ac.uk/newsevents/news/2019/john-snow-memorial-pump-marking-historic-cholera-outbreak-reinstalled-its)",
      "**已核（2026-08-20 逐条上网）· 五项无误，一处时间点已改为不依赖**：\n**无误五项**：十天内 **616 人**死亡（维基「1854 Broad Street cholera outbreak」明载）；波兰街济贫院 **535 人中仅 5 人**病故，因其自有水井；狮牌啤酒厂工人无一人死，因喝自酿啤酒并用自家深井；**1854年9月8日拆下泵柄**（斯诺 7 日晚向教区委员会陈情，8 日晨工人拆柄）；斯诺 **1858年6月16日卒**（10 日中风，六日后去世，年 45），未及见巴斯德与科赫证实其说。\n**粪坑距井 两英尺八英寸**（0.81 米）与他处所记「不到一米」「约三英尺」相符，砖砌已朽。\n**一处时间点已改为不依赖**：原文作「that autumn」（1854年秋）。实况是——怀特黑德 1854 年 11 月才加入教区霍乱调查委员会，**查出索引病例（40号 Broad Street 的婴儿 Frances Lewis）与开挖粪坑均在 1855 年**，委员会报告 1855 年 7 月才刊出。已改为 **later**，不再指认季节。[Wikipedia：1854 Broad Street cholera outbreak](https://en.wikipedia.org/wiki/1854_Broad_Street_cholera_outbreak)｜[Sick City Project：John Snow and cholera](https://sickcityproject.wordpress.com/2013/03/11/john-snow-and-cholera/)｜[Look Up London：The Deadly History of This Soho Water Pump](https://lookup.london/john-snow-water-pump/)"
    ]
  },
    {
    "id": "02",
    "slug": "a-garden-without-sunlight",
    "title": "A Garden Without Sunlight",
    "titleZh": "不见阳光的花园",
    "standfirst": "一支没有生物学家的地质考察队，去两千五百米深处找热水，却撞见一个不靠阳光活着的世界——以及一种放弃了进食、把自己变成宿主的动物。",
    "topic": "1977 年加拉帕戈斯热液喷口",
    "date": "2026-08-15",
    "status": "第二篇最终精进锁定稿",
    "metrics": {
      "words": 271,
      "keywords": 50,
      "density": 18.5
    },
    "paras": [
      {
        "en": "In February 1977 a **geological** **expedition** **aboard** the Knorr **towed** a camera **sled**, ANGUS, over the Galápagos Rift, hunting warm water that **tectonic** theory said should **seep** from young **basalt**. Late on the 15th, 2,500 metres down, ANGUS **registered** a three-minute **spike** in temperature, then read 2°C again.",
        "zh": "1977年2月，一支**地质**(geological)**考察队**(expedition)**乘**(aboard)“诺尔”号来到加拉帕戈斯裂谷，**拖**(towed)着一台叫ANGUS的相机**拖橇**(sled)贴着海底走，要找的是**板块**(tectonic)理论预言应当从年轻**玄武岩**(basalt)里**渗出**(seep)的热水。15日深夜，在两千五百米深处，ANGUS**记录到**(registered)一次持续三分钟的温度**骤升**(spike)，随后读数又回到2摄氏度。"
      },
      {
        "en": "ANGUS surfaced with 3,000 **frames**, almost all **barren**; thirteen **successive** ones held hundreds of clams. Two days later Jack Corliss and Tjeerd van Andel took the **submersible** Alvin down on dive 713, **expecting** the usual seabed: a **sparse** scatter fed by **debris** above. Instead 8°C water **wavered** from **fissures**, and 30-centimetre clams **crowded** 50 metres of lava.",
        "zh": "ANGUS带回3000**帧**(frames)照片，几乎全是**荒芜的**(barren)岩面；只有**连续**(successive)十三幅上出现了几百只白蛤。两天后，杰克·科利斯和特尔德·范安德尔乘**深潜器**(submersible)“阿尔文”号下潜第713次。他们**预期**(expecting)的是寻常的海床：**稀疏**(sparse)散布的动物，靠上层透光水域沉下来的**碎屑**(debris)为生。实际看到的却是8摄氏度的水从**裂隙**(fissures)里**晃**(wavered)着涌出，三十厘米长的蛤蜊**挤满**(crowded)了五十米宽的熔岩。"
      },
      {
        "en": "No **biologist** had gone along; nobody thought one necessary. So nobody could say what they ate, and the **formaldehyde** ran out, sending **specimens** into vodka. A **vial** of **vent** water opened on deck stank of rotten eggs: hydrogen **sulphide** near 300 micromoles a litre, **toxic** to nearly all life, **dissolved** around the **colony**. The **abundance** had no visible source.",
        "zh": "船上没有**生物学家**(biologist)同行——没人觉得需要。于是没人说得出这些动物吃什么，**甲醛**(formaldehyde)也用完了，**标本**(specimens)只好泡进伏特加。一**小瓶**(vial)**喷口**(vent)水在甲板上打开，一股臭鸡蛋味：每升约300微摩尔的硫化**氢**(sulphide)——几乎对一切活物都有**毒**(toxic)——就**溶解**(dissolved)在这个**群落**(colony)周围的水里。这份**繁盛**(abundance)找不到来源。"
      },
      {
        "en": "Biologists later found the source in **bacteria** that **oxidise** sulphide and build **organic** matter from carbon dioxide — chemosynthesis, not **photosynthesis**. Clams **graze** them; the giant tube **worm** goes further. An adult two metres long has no mouth and no **gut**, only an organ **housing** the **microbes**: an animal that gave up feeding to become a **host**.",
        "zh": "后来生物学家找到了来源：**细菌**(bacteria)**氧化**(oxidise)硫化氢，把二氧化碳造成**有机**(organic)物——化能合成，而不是**光合作用**(photosynthesis)。蛤蜊**啃食**(graze)它们；巨型管**虫**(worm)走得更远。两米长的成年个体没有嘴，也没有**肠道**(gut)，只有一个**养着**(housing)**微生物**(microbes)的器官：一种放弃了进食、把自己变成**宿主**(host)的动物。"
      },
      {
        "en": "Galápagos **revealed** a second **footing** for life, a food **web** **sustained** by the **planet** rather than the sun. That **widened** the **habitable** **boundary**: a place needs a **gradient** held open, by light or by **chemistry**. They went down for Earth's heat and came back with a garden that never needed sun.",
        "zh": "加拉帕戈斯**揭示**(revealed)了生命的第二个**立足点**(footing)：一条由**行星**(planet)本身而非太阳**支撑**(sustained)的食物**网**(web)。这**拓宽**(widened)了“**宜居**(habitable)”的**边界**(boundary)：一个地方需要的是一道被撑开的**梯度**(gradient)——由光撑开，或由**化学过程**(chemistry)撑开。他们下去是为了追踪地球的热量，带回来的却是一座从不需要阳光的花园。"
      }
    ],
    "glossary": [
      {
        "w": "geological",
        "zh": "地质的",
        "p": 1
      },
      {
        "w": "expedition",
        "zh": "考察队；远征",
        "p": 1
      },
      {
        "w": "aboard",
        "zh": "乘（船/机）；在船上",
        "p": 1
      },
      {
        "w": "towed",
        "zh": "拖",
        "p": 1
      },
      {
        "w": "sled",
        "zh": "拖橇；雪橇",
        "p": 1
      },
      {
        "w": "tectonic",
        "zh": "板块构造的",
        "p": 1
      },
      {
        "w": "seep",
        "zh": "渗出",
        "p": 1
      },
      {
        "w": "basalt",
        "zh": "玄武岩",
        "p": 1
      },
      {
        "w": "registered",
        "zh": "记录到；登记",
        "p": 1
      },
      {
        "w": "spike",
        "zh": "骤升；尖峰",
        "p": 1
      },
      {
        "w": "frames",
        "zh": "帧；画面",
        "p": 2
      },
      {
        "w": "barren",
        "zh": "荒芜的；贫瘠的",
        "p": 2
      },
      {
        "w": "successive",
        "zh": "连续的",
        "p": 2
      },
      {
        "w": "submersible",
        "zh": "深潜器；可潜的",
        "p": 2
      },
      {
        "w": "expecting",
        "zh": "预期",
        "p": 2
      },
      {
        "w": "sparse",
        "zh": "稀疏的",
        "p": 2
      },
      {
        "w": "debris",
        "zh": "碎屑；残骸",
        "p": 2
      },
      {
        "w": "wavered",
        "zh": "摇晃",
        "p": 2
      },
      {
        "w": "fissures",
        "zh": "裂隙",
        "p": 2
      },
      {
        "w": "crowded",
        "zh": "挤满；人群",
        "p": 2
      },
      {
        "w": "biologist",
        "zh": "生物学家",
        "p": 3
      },
      {
        "w": "formaldehyde",
        "zh": "甲醛",
        "p": 3
      },
      {
        "w": "specimens",
        "zh": "标本",
        "p": 3
      },
      {
        "w": "vial",
        "zh": "小瓶",
        "p": 3
      },
      {
        "w": "vent",
        "zh": "喷口；出口",
        "p": 3
      },
      {
        "w": "sulphide",
        "zh": "硫化物",
        "p": 3
      },
      {
        "w": "toxic",
        "zh": "有毒的",
        "p": 3
      },
      {
        "w": "dissolved",
        "zh": "溶解",
        "p": 3
      },
      {
        "w": "colony",
        "zh": "群落；殖民地",
        "p": 3
      },
      {
        "w": "abundance",
        "zh": "繁盛；丰富",
        "p": 3
      },
      {
        "w": "bacteria",
        "zh": "细菌",
        "p": 4
      },
      {
        "w": "oxidise",
        "zh": "氧化",
        "p": 4
      },
      {
        "w": "organic",
        "zh": "有机的",
        "p": 4
      },
      {
        "w": "photosynthesis",
        "zh": "光合作用",
        "p": 4
      },
      {
        "w": "graze",
        "zh": "啃食；放牧",
        "p": 4
      },
      {
        "w": "worm",
        "zh": "虫",
        "p": 4
      },
      {
        "w": "gut",
        "zh": "肠道",
        "p": 4
      },
      {
        "w": "housing",
        "zh": "养着",
        "p": 4
      },
      {
        "w": "microbes",
        "zh": "微生物",
        "p": 4
      },
      {
        "w": "host",
        "zh": "宿主；主人",
        "p": 4
      },
      {
        "w": "revealed",
        "zh": "揭示",
        "p": 5
      },
      {
        "w": "footing",
        "zh": "立足处；基础",
        "p": 5
      },
      {
        "w": "web",
        "zh": "网",
        "p": 5
      },
      {
        "w": "sustained",
        "zh": "支撑；维持",
        "p": 5
      },
      {
        "w": "planet",
        "zh": "行星",
        "p": 5
      },
      {
        "w": "widened",
        "zh": "拓宽",
        "p": 5
      },
      {
        "w": "habitable",
        "zh": "宜居的",
        "p": 5
      },
      {
        "w": "boundary",
        "zh": "边界",
        "p": 5
      },
      {
        "w": "gradient",
        "zh": "梯度；坡度",
        "p": 5
      },
      {
        "w": "chemistry",
        "zh": "化学过程；化学",
        "p": 5
      }
    ],
    "facts": [
      "1977年2月，“诺尔”号在厄瓜多尔以西约640公里的加拉帕戈斯裂谷拖曳深拖摄影系统ANGUS，任务是地质与地球化学，船上没有深海生物学家。2月15日深夜，ANGUS在约2500米深处记录到持续约三分钟的温度异常，随后读数回到约2摄氏度。[WHOI：热液喷口的发现](https://www.whoi.edu/oceanus/feature/the-discovery-of-hydrothermal-vents/)｜[Earth Magazine：1977年2月17日](https://www.earthmagazine.org/article/benchmarks-february-17-1977-hydrothermal-vents-are-discovered)",
      "ANGUS共拍摄约3000张照片。巴拉德记载：温度异常前一瞬的照片只有荒芜的新鲜熔岩，而对应异常时段的十三幅连续画面上，熔岩被数百只白色蛤蜊和褐色贻贝壳覆盖。正文的“十三连幅”与“那三分钟”即据此。[Earth Magazine：1977年2月17日](https://www.earthmagazine.org/article/benchmarks-february-17-1977-hydrothermal-vents-are-discovered)",
      "2月17日“阿尔文”号第713潜：驾驶员杰克·唐纳利，观察者为俄勒冈州立大学的杰克·科利斯与斯坦福大学的特尔德·范安德尔，二人通过无线电向水面船实时描述所见。喷口处涌出约8摄氏度的微晃水流，与约2摄氏度的底层水形成对比；白蛤长达约30厘米，聚集范围约50米宽。[Grokipedia：Riftia](https://grokipedia.com/page/Riftia)｜[WHOI：发现之路](https://divediscover.whoi.edu/archives/ventcd/vent_discovery/thediscovery/trail_77_page5.html)",
      "甲醛耗尽后，队员改用烈性伏特加保存部分标本；船上打开喷口水样时的臭鸡蛋气味，指向硫化氢——它对绝大多数动物有毒，却是化能合成微生物的能量来源。这是解开“它们吃什么”的决定性线索。[ScienceBlog：无阳光生态系统](https://scienceblog.com/t-deep-sea-dive-hydrothermal-vents-ecosystem-without-sunlight/)",
      "化能合成微生物氧化硫化氢获取能量，并像光合生物一样把二氧化碳固定为有机物。巨型管虫Riftia pachyptila于1977年加拉帕戈斯考察中被发现，成年个体没有嘴、没有消化道与可用的肠，体内以专门器官（营养体）供养共生的化能自养细菌，完全依靠其产物生活——共生机制系1981年前后由后续研究确立，故正文写“后来的研究”。[Grokipedia：Riftia](https://grokipedia.com/page/Riftia)｜[NOAA：光合作用与化能合成](https://oceanexplorer.noaa.gov/ocean-fact/photochemo/)",
      "在1977年之前，深海海床被视为食物匮乏的“荒漠”，稀疏的动物依靠自上层透光带缓慢沉降的有机碎屑为生；加拉帕戈斯的发现确立了不依赖阳光的第二类食物网基础，并改变了“宜居”的判据。此次考察的一处喷口场即被命名为“伊甸园”(Garden of Eden)。[Springer：热液喷口生物学导论](https://link.springer.com/chapter/10.1007/978-1-4899-0402-7_27)｜[Grokipedia：Riftia](https://grokipedia.com/page/Riftia)",
      "**已核（2026-08-16 逐条上网）**：全部无误——1977年2月17日 Alvin **第713次下潜**，驾驶员唐纳利，科学观察员杰克·科利斯与特杰尔德·范安德尔，下潜约2500米；**艇上传感器实测水温 8°C**（WHOI 原文 measured water temperatures of 8°C）；热液自玄武岩裂缝涌出、因锰等矿物析出而泛蓝；ANGUS 拖曳相机先期拍摄约3000张照片，其中十三张连续画面显示大量白蛤与褐贻贝，而其前后的熔岩一片荒芜；**船上没有生物学家、也没备生物样本容器**，福尔马林用尽后以伏特加保存标本。[WHOI Dive & Discover：The Trail of Discovery](https://divediscover.whoi.edu/archives/ventcd/vent_discovery/thediscovery/trail_77_page5.html)｜[EARTH Magazine：Benchmarks — 17 Feb 1977](https://www.earthmagazine.org/article/benchmarks-february-17-1977-hydrothermal-vents-are-discovered)",
      "**已核（2026-08-20 逐条上网）· 十三项无误，一项未取得直接出处**：\n**无误十三项**：1977年2月**15日**深夜 ANGUS 拖曳记录到约**三分钟**温度尖峰、随后回落至 **2°C** 本底；作业水深 **2,500 米**；胶卷冲出后共约 **3,000 帧**，其中**十三帧**连续出现成百的白蛤与褐贻贝，前后各帧皆为裸露熔岩；**2月17日 Alvin 第 713 潜次**，驾驶员 Jack Donnelly，观察者 Jack Corliss（俄勒冈州立）与 Tjeerd van Andel（斯坦福）；喷口水温 **8°C**（WHOI 原文：Alvin's temperature sensors measured water temperatures of 8°C）；白蛤长达 **30 厘米**、聚集范围约 **50 米**；**船上没有生物学家**（此行为地质地化任务）；**福尔马林用尽，标本改浸伏特加**；甲板上开启喷口水样时**一股臭鸡蛋味**（硫化氢）。\n**一项本轮未取得直接出处**：硫化氢浓度「near 300 micromoles a litre」。该量级与已发表的加拉帕戈斯喷口流体化学相符，且正文已用 **near** 留了余地；**如实标注待复核**。\n另：巨型管虫成体长约两米、无口无肠、体内含菌器官——Riftia pachyptila 成体可达 2—3 米，1977 年首见时所记为约 45 厘米（发现当时的个体），两者不冲突。[WHOI Dive & Discover：The Trail of Discovery](https://divediscover.whoi.edu/archives/ventcd/vent_discovery/thediscovery/trail_77_page5.html)｜[Earth Magazine：February 17, 1977](https://www.earthmagazine.org/article/benchmarks-february-17-1977-hydrothermal-vents-are-discovered)｜[Schmidt Ocean Institute：The 13-Frame Discovery](https://schmidtocean.org/cruise/hydrothermal-vents-of-the-galapagos/)"
    ]
  },
    {
    "id": "03",
    "slug": "the-graph-that-changed-the-sky",
    "title": "The Graph That Changed the Sky",
    "titleZh": "改变天空的那张图",
    "standfirst": "一台1956年的地面仪器，为什么比头顶的卫星先看见臭氧洞——以及一道为逮住坏仪器而设的过滤器，如何分不清坏掉的是仪器还是天。",
    "topic": "1985 年南极臭氧洞",
    "date": "2026-08-15",
    "status": "第三篇最终精进锁定稿",
    "metrics": {
      "words": 267,
      "keywords": 50,
      "density": 18.7
    },
    "paras": [
      {
        "en": "At Halley Bay the British Antarctic Survey had measured total-column **ozone** since 1956 with a Dobson spectrophotometer, a **prism** **weighing** **ultraviolet** **intensities** at two **bands**. Every **springtime**, the same reading, on the same days, from the same **hut**. A **baseline** earns its keep by being **dull**.",
        "zh": "在南极哈雷湾，英国南极调查局自1956年起就用一台多布森分光光度计——一具**棱镜**(prism)仪器——测量**臭氧**(ozone)总柱量。那是一台棱镜仪器，靠**称量**(weighing)两个**波段**(bands)上的**紫外**(ultraviolet)光**强度**(intensities)。每年**春季**(springtime)，同样的读数，同样的日子，同一间**小屋**(hut)。一条**基线**(baseline)的价值，正在于它**枯燥**(dull)。"
      },
      {
        "en": "From 1981 the October **readings** fell. Joe Farman **reckoned** his **ageing** optics were slipping and ordered a **replacement**; both instruments **agreed**. A second **outpost** a thousand miles away showed the same **recurring** **decline**. By October 1984 the total stood 40% below its 1960s value, yet the team **hesitated**: nothing had come from **orbit**.",
        "zh": "从1981年起，10月的**读数**(readings)开始下滑。乔·法曼**判断**(reckoned)是自己那台**老化**(ageing)的光学件走偏了，便订了一台**替换机**(replacement)；两台读数**吻合**(agreed)。一千英里外的另一处**观测点**(outpost)，也出现了同样**年复一年**(recurring)的**下降**(decline)。到1984年10月，总量已比1960年代低了40%。可队里仍在**犹豫**(hesitated)：**轨道**(orbit)上一直没有消息。"
      },
      {
        "en": "Nimbus-7 had carried an ozone **mapper** since 1978. Its **processing** **flagged** readings under 180 Dobson units — a **threshold** set for a **faulty** **lens**, not a real change. To **settle** which, NASA staff read the South Pole record — itself **erroneous**, its **calibration** long lost. Nobody went back; the low numbers stayed **unconfirmed**. Farman published anyway.",
        "zh": "“云雨七号”自1978年起就载着一台臭氧**测绘仪**(mapper)。它的数据**处理**(processing)会把低于180多布森单位的读数**标记**(flagged)出来——这个**阈值**(threshold)是为逮住**故障的**(faulty)**镜头**(lens)而设的，不是为发现真实的变化。为了**判定**(settle)究竟是哪一种，NASA 的人拿这些可疑值去比对南极点的地面记录，而那份记录**本身**就是**错的**(erroneous)，**标定**(calibration)早已丢失。没有人再回头，低值就这样一直**未获证实**(unconfirmed)。法曼还是发表了。"
      },
      {
        "en": "*Nature* ran Farman, Gardiner and Shanklin on 16 May 1985. No model had **anticipated** losses that large: calculations **tuned** near 30°N gave a few per cent, and nobody had **simulated** a polar winter. Below −78°C, **stratospheric** clouds **condense** at the **altitude** of the layer; on their **particles**, **dormant** **chlorine** compounds become forms that light **cleaves**.",
        "zh": "1985年5月16日，《自然》刊出了法曼、加德纳与尚克林的论文。没有哪个模型**预见到**(anticipated)这么大的损失：在北纬30度附近**调校**(tuned)出来的计算只给出百分之几，而没有一个人**模拟**(simulated)过极地的冬天。零下78摄氏度以下，**平流层的**(stratospheric)云会在臭氧层的**高度**(altitude)上**凝结**(condense)；在云**粒子**(particles)表面，原本**蛰伏**(dormant)的含**氯**(chlorine)化合物变成了会被光**劈开**(cleaves)的形态。"
      },
      {
        "en": "Returning sunlight **liberates** those atoms, each destroying ozone **repeatedly**. Reprocessed satellite **scans** showed a **continent-wide** loss in 1986; governments **adopted** the Montreal Protocol on 16 September 1987, and **amendments** **tightened** it. Antarctic ozone is **projected** to **regain** its 1980 **concentration** near 2066. A filter built to catch a broken instrument cannot tell a broken instrument from a broken sky.",
        "zh": "春天回来的阳光**释放**(liberates)出这些原子，每一个都能**反复**(repeatedly)摧毁臭氧。1986年重新处理的卫星**扫描**(scans)显示，损失已是**覆盖整个大陆**(continent-wide)的规模；1987年9月16日，各国政府**通过**(adopted)了《蒙特利尔议定书》，其后的**修正案**(amendments)又**收紧**(tightened)了管制。南极臭氧**预计**(projected)将在2066年前后**重回**(regain)1980年的**浓度**(concentration)。一道为逮住坏仪器而设的过滤器，分不清坏掉的是仪器，还是天。"
      }
    ],
    "glossary": [
      {
        "w": "ozone",
        "zh": "臭氧",
        "p": 1
      },
      {
        "w": "prism",
        "zh": "棱镜",
        "p": 1
      },
      {
        "w": "weighing",
        "zh": "称量；权衡",
        "p": 1
      },
      {
        "w": "ultraviolet",
        "zh": "紫外的",
        "p": 1
      },
      {
        "w": "intensities",
        "zh": "强度",
        "p": 1
      },
      {
        "w": "bands",
        "zh": "波段；带",
        "p": 1
      },
      {
        "w": "springtime",
        "zh": "春季",
        "p": 1
      },
      {
        "w": "hut",
        "zh": "小屋",
        "p": 1
      },
      {
        "w": "baseline",
        "zh": "基线",
        "p": 1
      },
      {
        "w": "dull",
        "zh": "枯燥的；钝的",
        "p": 1
      },
      {
        "w": "readings",
        "zh": "读数",
        "p": 2
      },
      {
        "w": "reckoned",
        "zh": "判断；认为",
        "p": 2
      },
      {
        "w": "ageing",
        "zh": "老化的",
        "p": 2
      },
      {
        "w": "replacement",
        "zh": "替换机；替换",
        "p": 2
      },
      {
        "w": "agreed",
        "zh": "吻合",
        "p": 2
      },
      {
        "w": "outpost",
        "zh": "观测点；前哨",
        "p": 2
      },
      {
        "w": "recurring",
        "zh": "反复出现的",
        "p": 2
      },
      {
        "w": "decline",
        "zh": "下降",
        "p": 2
      },
      {
        "w": "hesitated",
        "zh": "犹豫",
        "p": 2
      },
      {
        "w": "orbit",
        "zh": "轨道",
        "p": 2
      },
      {
        "w": "mapper",
        "zh": "测绘仪",
        "p": 3
      },
      {
        "w": "processing",
        "zh": "数据处理",
        "p": 3
      },
      {
        "w": "flagged",
        "zh": "标记",
        "p": 3
      },
      {
        "w": "threshold",
        "zh": "阈值；门槛",
        "p": 3
      },
      {
        "w": "faulty",
        "zh": "故障的",
        "p": 3
      },
      {
        "w": "lens",
        "zh": "镜头；透镜",
        "p": 3
      },
      {
        "w": "settle",
        "zh": "判定；解决",
        "p": 3
      },
      {
        "w": "erroneous",
        "zh": "错误的",
        "p": 3
      },
      {
        "w": "calibration",
        "zh": "标定；校准",
        "p": 3
      },
      {
        "w": "unconfirmed",
        "zh": "未获证实的",
        "p": 3
      },
      {
        "w": "anticipated",
        "zh": "预见到",
        "p": 4
      },
      {
        "w": "tuned",
        "zh": "调校",
        "p": 4
      },
      {
        "w": "simulated",
        "zh": "模拟",
        "p": 4
      },
      {
        "w": "stratospheric",
        "zh": "平流层的",
        "p": 4
      },
      {
        "w": "condense",
        "zh": "凝结",
        "p": 4
      },
      {
        "w": "altitude",
        "zh": "高度",
        "p": 4
      },
      {
        "w": "particles",
        "zh": "粒子",
        "p": 4
      },
      {
        "w": "dormant",
        "zh": "蛰伏的；休眠的",
        "p": 4
      },
      {
        "w": "chlorine",
        "zh": "氯",
        "p": 4
      },
      {
        "w": "cleaves",
        "zh": "劈开",
        "p": 4
      },
      {
        "w": "liberates",
        "zh": "释放；解放",
        "p": 5
      },
      {
        "w": "repeatedly",
        "zh": "反复地",
        "p": 5
      },
      {
        "w": "scans",
        "zh": "扫描",
        "p": 5
      },
      {
        "w": "continent-wide",
        "zh": "覆盖整个大陆的",
        "p": 5
      },
      {
        "w": "adopted",
        "zh": "通过；采纳",
        "p": 5
      },
      {
        "w": "amendments",
        "zh": "修正案",
        "p": 5
      },
      {
        "w": "tightened",
        "zh": "收紧",
        "p": 5
      },
      {
        "w": "projected",
        "zh": "预计",
        "p": 5
      },
      {
        "w": "regain",
        "zh": "重回；重获",
        "p": 5
      },
      {
        "w": "concentration",
        "zh": "浓度；集中",
        "p": 5
      }
    ],
    "facts": [
      "哈雷湾自1956年起以多布森分光光度计连续观测臭氧总柱量；仪器通过比较选定波段的紫外光强度反演臭氧。1981年起10月读数持续偏低，法曼一度怀疑仪器老化，遂启用新机，新旧读数一致；一千英里外的阿根廷群岛站也记录到同样的春季下降。[British Antarctic Survey：多布森分光光度计](https://www.bas.ac.uk/polar-operations/sites-and-facilities/facility/halley/dobson-spectrophotometer/)｜[EBSCO：臭氧洞发现始末](https://www.ebsco.com/research-starters/environmental-sciences/researchers-discover-hole-ozone-layer)",
      "1984年10月总柱量较1960年代低约40%。团队迟迟未发表的原因之一，正是自1978年起在轨的Nimbus-7从未报告过异常——若卫星看不到，地面读数就可能是错的。[Nature：1985年原始论文](https://www.nature.com/articles/315207a0)｜[EBSCO](https://www.ebsco.com/research-starters/environmental-sciences/researchers-discover-hole-ozone-layer)",
      "**本文不采用“NASA把异常数据删除”这一流行说法。**实情是：TOMS的处理流程把低于约180多布森单位的读数标记出来待查，该阈值基于逐日数据、目的是识别仪器故障，而非发现真实的系统性变化；团队拿南极点的地面多布森记录去核对，可那段记录“错误且无法修正”，因此无法判断异常源自仪器还是真实现象，低值遂长期未获证实。[Debunking the myth about ozone holes and outlier removal](https://aakinshin.net/posts/outliers-ozon-holes/)｜[Hyndman：How NASA didn't discover the hole](https://robjhyndman.com/hyndsight/ozone-hole-anomaly.html)",
      "1983年10月10日，尚克林曾致信NASA沃洛普斯岛中心，报告哈雷湾约200多布森单位的低值，并询问能否由卫星数据证实。[ScienceDirect：南极臭氧洞的发现](https://www.sciencedirect.com/science/article/pii/S1631071318301196)",
      "论文刊于1985年5月16日《Nature》，作者为Joe Farman、Brian Gardiner、Jonathan Shanklin。当时的模型多以北纬30度为基础调校，预测仅有百分之几的变化，无人对极地冬季建模，南极观测因此暴露了外推的失效。[Nature](https://www.nature.com/articles/315207a0)｜[NASA：臭氧研究史](https://acd-ext.gsfc.nasa.gov/People/Stolarski/history.html)",
      "机制由后续研究厘清：约−78°C以下，极地平流层云在臭氧层高度凝结；只有在云粒子表面、且有阳光作催化条件时，稳定的含氯储库物种才转为对光敏感的形态，冬末阳光返回后释放氯原子，单个氯原子可反复破坏臭氧分子。1986年重新处理的卫星资料确认损失具南极大陆尺度；《蒙特利尔议定书》1987年9月16日通过、1989年1月1日生效，后续修正案持续收紧；世界气象组织评估在现行政策延续的条件下，南极臭氧约2066年恢复至1980年水平。[British Antarctic Survey](https://www.bas.ac.uk/polar-operations/sites-and-facilities/facility/halley/dobson-spectrophotometer/)｜[NASA NTRS：1986年确认](https://ntrs.nasa.gov/citations/19870029585)｜[WMO：约2066年恢复](https://wmo.int/media/news/ozone-layer-recovery-track-helping-avoid-global-warming-05degc)",
      "**已核（2026-08-16 逐条上网）**：法曼团队自1956年起在哈雷湾以多布森分光光度计测量臭氧总量；Nimbus-7 的数据处理把低于180多布森单位的读数标记为疑似仪器故障；1985年5月《自然》刊出法曼、加德纳、尚克林三人论文；1987年9月16日各国签署《蒙特利尔议定书》，其后的修正案不断收紧；南极臭氧预计在2066年前后恢复到1980年水平。[Wikipedia：Ozone depletion](https://en.wikipedia.org/wiki/Ozone_depletion)",
      "**已核（2026-08-20 逐条上网）· 八项无误，一处机制存两说**：\n**无误八项**：哈雷湾自 **1956 年**起用多布森分光光度计测柱臭氧；**NASA 把低于 180 多布森单位的读数标为异常**（Hyndman：flagging observations as anomalous when they were below 180 DU），该阈值本为识别仪器故障而设；Nimbus-7 自 **1978 年**起载有臭氧测绘仪；1981 年起十月读数下降；**千里之外的第二站（阿根廷群岛／法拉第）出现同样的逐年下降**；**1984 年十月总量约较 1960 年代低四成**（另有来源作「约剩三分之二」与「近五成」，量级一致）；**1985 年 5 月 16 日《自然》刊出 Farman、Gardiner、Shanklin 三人文章**；**低于 −78°C 平流层云在臭氧层高度凝结**；**1987 年 9 月 16 日通过《蒙特利尔议定书》**；南极臭氧预计 **2066 年**前后回到 1980 年水平（WMO 评估）。\n**一处机制存两说**：正文 §3 作「NASA staff read the South Pole record — itself erroneous, its calibration long lost」。Hyndman 的记述则是：**当时可比对的其他地面数据显示约 300 DU（正常值），故认定是卫星传感器故障**。两说指向同一结果（低值被弃），但机制不同——一说是比对基准本身坏了，一说是比对基准显示正常。**本轮未取得「标定丢失」的直接出处，如实标为待复核。**\n**另一处两说**：卫星数据重处理后确认全洲范围亏损的年份——Bhartia 等 **1985 年 8 月**在布拉格会议首次展示 TOMS 臭氧洞图；而 Stolarski 等的正式论文刊于 **1986 年**。正文取 1986（正式发表），两说并此存照。[Rob J Hyndman：How NASA didn't discover the hole in the ozone layer](https://robjhyndman.com/hyndsight/ozone-hole-anomaly.html)｜[Nature：The discovery of the Antarctic ozone hole](https://www.nature.com/articles/d41586-019-02837-5)｜[KMI：The ozone hole](https://ozone.meteo.be/research-themes/ozone/the-ozone-hole)"
    ]
  },
    {
    "id": "04",
    "slug": "fifteen-degrees-an-hour",
    "title": "Fifteen Degrees an Hour",
    "titleZh": "一小时，十五度",
    "standfirst": "每小时十五度的算术从来没人怀疑；难的是在颠簸的甲板上把那一小时守住——而替哈里森测量的人，正是竞争方案的主人。",
    "topic": "约翰·哈里森与海上经度",
    "date": "2026-08-15",
    "status": "第四篇最终精进锁定稿",
    "metrics": {
      "words": 269,
      "keywords": 50,
      "density": 18.6
    },
    "paras": [
      {
        "en": "At sea the Sun gives **latitude** **readily**. **Longitude** needs the hour at a known **meridian**. Earth turns once in twenty-four hours, so an hour between local **noon** and **reference** time is fifteen degrees of **arc**. The **arithmetic** was never in doubt; **keeping** the hour on a rolling **deck** was.",
        "zh": "在海上，太阳**轻易**(readily)就能给出**纬度**(latitude)；**经度**(longitude)要的却是某条已知**子午线**(meridian)上的时刻。地球二十四小时自转一周，所以当地**正午**(noon)与**参照**(reference)时刻之间每差一小时，就是十五度**弧**(arc)。这套**算术**(arithmetic)从来没人怀疑；难的是在颠簸的**甲板**(deck)上把那一小时**守**(keeping)住。"
      },
      {
        "en": "In 1714 Parliament offered £20,000 for half a degree: thirty **nautical** miles at the **equator**. John Harrison, a Lincolnshire **carpenter**, answered with machinery that **resisted** **motion**, friction and **heat**. H1 went to Lisbon in 1736; a **flaw** kept H2 **ashore**; nineteen years of **refining** H3 still fell short.",
        "zh": "1714年，英国议会为半度的精度悬赏两万英镑——在**赤道**(equator)上就是三十**海**(nautical)里。林肯郡的**木匠**(carpenter)约翰·哈里森的答案是一套能**抵抗**(resisted)**晃动**(motion)、摩擦与**温度**(heat)的机械。H1在1736年去了里斯本；一处**缺陷**(flaw)让H2留在了**岸上**(ashore)；十九年**打磨**(refining)H3，仍然不够。"
      },
      {
        "en": "H4, finished in 1759, was no clock but a **portable** watch five **inches** wide: a **balance** beating five times a second, a bimetallic **strip** offsetting **temperature**, **jewelled** **pivots** cutting **friction**. His son William carried it to Jamaica; over eighty-one days it lost 5.1 seconds, a **gap** under one nautical mile where thirty were **tolerated**.",
        "zh": "1759年完成的H4不是钟，而是一只五**英寸**(inches)宽的**便携**(portable)表：**摆轮**(balance)每秒振动五次，一条双金属**片**(strip)抵消**温度**(temperature)，**嵌宝石**(jewelled)的**枢轴**(pivots)减小**摩擦**(friction)。他的儿子威廉带着它去牙买加；八十一天航程里它只慢了5.1秒——**差**(gap)不到一海里，而**容许**(tolerated)的是三十海里。"
      },
      {
        "en": "The **commissioners** **balked**. Nevil Maskelyne, who **championed** the **lunar** method, took the **astronomical** **observations** at H4's Barbados trial and published both. The watch **erred** 39 seconds in forty-seven days, three times better than the Act required. The Board split the payment: half for the **principles**, half once other **makers** could **replicate** it.",
        "zh": "**评审委员**(commissioners)们**迟疑**(balked)了。**力主**(championed)**月**(lunar)距法的内维尔·马斯基林，亲自在H4的巴巴多斯海试中做了**天文**(astronomical)**观测**(observations)，并把两种方法的结果一并发表。这只表在四十七天里**误差**(erred)39秒，比法案要求好三倍。委员会把奖金拆成两半：一半付给公开**原理**(principles)，另一半要等别的**制表匠**(makers)能**复制**(replicate)出来。"
      },
      {
        "en": "Larcum Kendall finished K1 in 1769; it sailed three years with James Cook, its daily **gain** never **exceeding** eight seconds. In 1773 Parliament **granted** Harrison £8,750, never the prize. He died in 1776, months after Cook sailed home **praising** the copy. **Chronometers** stayed **costly**, so **navigators** kept **sighting** the Moon with **sextant** and **almanac** for **decades**. The clock did not beat the sky; it joined it.",
        "zh": "拉尔卡姆·肯德尔1769年做出K1；它随詹姆斯·库克航行三年，日**走差**(gain)从未**超过**(exceeding)八秒。1773年议会**拨给**(granted)哈里森8750英镑，始终不是那笔奖金。他1776年去世，距库克**盛赞**(praising)着那块仿表归航仅数月。**航海钟**(Chronometers)一直**昂贵**(costly)，**航海者**(navigators)于是继续靠**六分仪**(sextant)与**天文年历**(almanac)**观测**(sighting)月亮达数十**年**(decades)。钟没有打败天空；它加入了天空。"
      }
    ],
    "glossary": [
      {
        "w": "latitude",
        "zh": "纬度",
        "p": 1
      },
      {
        "w": "readily",
        "zh": "轻易地",
        "p": 1
      },
      {
        "w": "longitude",
        "zh": "经度",
        "p": 1
      },
      {
        "w": "meridian",
        "zh": "子午线",
        "p": 1
      },
      {
        "w": "noon",
        "zh": "正午",
        "p": 1
      },
      {
        "w": "reference",
        "zh": "参照",
        "p": 1
      },
      {
        "w": "arc",
        "zh": "弧",
        "p": 1
      },
      {
        "w": "arithmetic",
        "zh": "算术",
        "p": 1
      },
      {
        "w": "keeping",
        "zh": "守住；保持",
        "p": 1
      },
      {
        "w": "deck",
        "zh": "甲板",
        "p": 1
      },
      {
        "w": "nautical",
        "zh": "海上的；航海的",
        "p": 2
      },
      {
        "w": "equator",
        "zh": "赤道",
        "p": 2
      },
      {
        "w": "carpenter",
        "zh": "木匠",
        "p": 2
      },
      {
        "w": "resist",
        "zh": "抵抗",
        "p": 2
      },
      {
        "w": "motion",
        "zh": "晃动；运动",
        "p": 2
      },
      {
        "w": "heat",
        "zh": "温度；热",
        "p": 2
      },
      {
        "w": "flaw",
        "zh": "缺陷",
        "p": 2
      },
      {
        "w": "ashore",
        "zh": "在岸上",
        "p": 2
      },
      {
        "w": "refine",
        "zh": "打磨",
        "p": 2
      },
      {
        "w": "portable",
        "zh": "便携的",
        "p": 3
      },
      {
        "w": "inch",
        "zh": "英寸",
        "p": 3
      },
      {
        "w": "balance",
        "zh": "摆轮；平衡",
        "p": 3
      },
      {
        "w": "strip",
        "zh": "片；条",
        "p": 3
      },
      {
        "w": "temperature",
        "zh": "温度",
        "p": 3
      },
      {
        "w": "jewelled",
        "zh": "嵌宝石的",
        "p": 3
      },
      {
        "w": "pivot",
        "zh": "枢轴",
        "p": 3
      },
      {
        "w": "friction",
        "zh": "摩擦",
        "p": 3
      },
      {
        "w": "gap",
        "zh": "差；缺口",
        "p": 3
      },
      {
        "w": "tolerate",
        "zh": "容许",
        "p": 3
      },
      {
        "w": "commissioner",
        "zh": "评审委员；专员",
        "p": 4
      },
      {
        "w": "balk",
        "zh": "迟疑；退缩",
        "p": 4
      },
      {
        "w": "champion",
        "zh": "力主；拥护",
        "p": 4
      },
      {
        "w": "lunar",
        "zh": "月球的；太阴的",
        "p": 4
      },
      {
        "w": "astronomical",
        "zh": "天文的",
        "p": 4
      },
      {
        "w": "observation",
        "zh": "观测",
        "p": 4
      },
      {
        "w": "err",
        "zh": "误差",
        "p": 4
      },
      {
        "w": "principle",
        "zh": "原理",
        "p": 4
      },
      {
        "w": "maker",
        "zh": "制作者",
        "p": 4
      },
      {
        "w": "replicate",
        "zh": "复制",
        "p": 4
      },
      {
        "w": "gain",
        "zh": "走差；增益",
        "p": 5
      },
      {
        "w": "exceed",
        "zh": "超过",
        "p": 5
      },
      {
        "w": "grant",
        "zh": "拨给；授予",
        "p": 5
      },
      {
        "w": "praising",
        "zh": "称赞",
        "p": 5
      },
      {
        "w": "chronometer",
        "zh": "航海钟",
        "p": 5
      },
      {
        "w": "costly",
        "zh": "昂贵的",
        "p": 5
      },
      {
        "w": "navigator",
        "zh": "航海者",
        "p": 5
      },
      {
        "w": "sight",
        "zh": "观测",
        "p": 5
      },
      {
        "w": "sextant",
        "zh": "六分仪",
        "p": 5
      },
      {
        "w": "almanac",
        "zh": "天文年历",
        "p": 5
      },
      {
        "w": "decade",
        "zh": "十年",
        "p": 5
      }
    ],
    "facts": [
      "地球24小时自转360度，故每小时对应15度经度；半度精度在赤道约合30海里。1714年《经度法案》最高悬赏两万英镑。[Royal Museums Greenwich：Harrison's timekeepers](https://www.rmg.co.uk/stories/time/harrisons-clocks-longitude-problem)",
      "哈里森为林肯郡木匠出身、自学成才的钟表匠。H1于1736年赴里斯本试航；H2因缺陷未出海；H3历十九年改进仍未达标。H4于1759年完成，形制为直径约五英寸的怀表，摆轮每秒振动五次，采用双金属片作温度补偿、嵌宝石轴承减摩。[Grokipedia：Longitude by chronometer](https://grokipedia.com/page/Longitude_by_chronometer)",
      "**1761—62年牙买加海试**：其子威廉携H4乘HMS Deptford，81天航程中仅慢5.1秒，折合经度误差不足1海里，而法案容许30海里。[Kronecker Wallis：The Longitude Problem Solved](https://www.kroneckerwallis.com/the-longitude-problem-how-a-carpenters-clock-beat-the-astronomers/)｜[Seiko Museum：John Harrison](https://museum.seiko.co.jp/en/knowledge/inventors_02/)",
      "**关键的利益冲突**：内维尔·马斯基林力主与钟表法竞争的月距法，1765年就任皇家天文学家并为经度委员会成员；1764年巴巴多斯海试期间，正是由他执行天文观测，并将两种方法的结果一并发表。哈里森一方认为该发表方式有失公允。[Spacedaily：Harrison 与经度委员会](https://spacedaily.com/k-a-self-taught-yorkshire-carpenters-son-spent-forty-years-building-four-increasingly-precise-sea-clocks-to-solve-a-navigation-problem-that-was-killing-sailors-by-the-thousands-and-won-a-20000-prize/)｜[American Scientist：The Harrison-Maskelyne Affair](https://www.americanscientist.org/article/the-harrison-maskelyne-affair)",
      "巴巴多斯海试中H4在47天内误差39.2秒，为法案要求的三倍精度。委员会认为不能排除偶然，遂将奖金分为两部分：一半在公开H4原理后支付，另一半须待其他制表匠能造出同类计时器。1765年2月，委员会确认H4已满足1714年法案最严格的限度。[Royal Museums Greenwich](https://www.rmg.co.uk/stories/time/harrisons-clocks-longitude-problem)｜[NMM：Harrison and the Longitude problem](http://pro.unibz.it/staff2/fzavatti/corso/harrison.html)",
      "拉尔卡姆·肯德尔的复制品K1于1769年完成，随库克第二次远航三年，日差始终未超过8秒（赤道上约合2海里）。1773年议会另行拨给哈里森8750英镑，并非正式奖金；哈里森1776年去世。因航海钟长期昂贵，月距法连同马斯基林创办的《航海天文年历》又沿用了一个多世纪。[NMM](http://pro.unibz.it/staff2/fzavatti/corso/harrison.html)｜[American Scientist](https://www.americanscientist.org/article/the-harrison-maskelyne-affair)",
      "**指代订正（2026-08-16）**：§5 原写 In 1773 Parliament granted **him** £8,750，而 him 紧跟在 Larcum Kendall 之后——**实际获奖者是哈里森**，非肯德尔。已改为具名。**已核**：1773年6月议会通过法案授予哈里森 £8,750；他从未获得那笔 £20,000 奖金，而该奖金实际上从未授予任何人。库克带 K1 出海三年、1775年7月归航，盛赞其为「我们穿越各种气候的忠实向导」，K1 日走差全程未超八秒；哈里森1776年3月24日、他83岁生日当天在伦敦红狮广场寓所去世——**已知不确定他是否得知库克此行的成功**。[Royal Museums Greenwich／NMM：John Harrison and the Longitude problem](http://pro.unibz.it/staff2/fzavatti/corso/harrison.html)｜[Royal Naval Museum：John Harrison biography](https://www.royalnavalmuseum.org/info_sheets_john_harrison.html)",
      "**已核（2026-08-20 逐条上网）· §5 一处指代已订正**：库克第二次远航（1772年7月13日—1775年7月30日，HMS Resolution）带的是**肯德尔的 K1**，而非哈里森的 H4；1775 年他向海军部报告「肯德尔的表已超出其最热忱拥护者的期望」，航海日志称它「我们可信赖的朋友——那块表」「我们从不失灵的向导——那块表」。**正是 K1 向仍在怀疑的学界证明了 H4 的成功不是侥幸**（同航另有阿诺德所制三只天文钟全部停摆）。原文写 Cook sailed home **praising it**——**it 悬空，读者会以为夸的是哈里森那块表**；已改为 praising **the copy**。哈里森 1776 年去世，距库克 1775 年 7 月归航约八个月，「months after」无误。[Wikiwand：Larcum Kendall](https://www.wikiwand.com/en/Larcum_Kendall)｜[Wikipedia：Second voyage of James Cook](https://en.wikipedia.org/wiki/Second_voyage_of_James_Cook)"
    ]
  },
    {
    "id": "05",
    "slug": "the-price-was-elsewhere",
    "title": "The Price Was Elsewhere",
    "titleZh": "价格在别处",
    "standfirst": "史上第一次扫码就当场证明了这件事：收银机打出的价，比货架上标的低两分——因为包装上的条码不可能知道店里在做促销。",
    "topic": "UPC 条形码与零售信息基础设施",
    "date": "2026-08-15",
    "status": "第五篇最终精进锁定稿",
    "metrics": {
      "words": 271,
      "keywords": 50,
      "density": 18.5
    },
    "paras": [
      {
        "en": "At 8:01 on 26 June 1974, in a Marsh **supermarket** in Troy, Ohio, Clyde Dawson handed **cashier** Sharon Buchanan a pack of **gum**. She passed it over a laser **scanner** **sunk** in the **checkout**. It read neither name nor price. The till showed 67 **cents**, two under the **shelf** price: a **promotion** no **wrapper** could know about.",
        "zh": "1974年6月26日8点01分，在俄亥俄州特洛伊镇的马什**超市**(supermarket)，克莱德·道森把一条十包装的箭牌**口香糖**(gum)递给**收银员**(cashier)莎伦·布坎南。她把它从嵌在**收银台**(checkout)里的激光**扫描器**(scanner)上划过——那台**沉**(sunk)在台面下的机器，既没读到名称，也没读到价格。收款机显示67**美分**(cents)，比**货架**(shelf)价低两分：店里在做**促销**(promotion)，而**包装纸**(wrapper)不可能知道这回事。"
      },
      {
        "en": "The **invention** was old. Woodland and Silver filed in 1949 for a patent on **optical** ways of **classifying** goods; the 1952 document **depicted** **linear** and **circular** patterns alike. Both were **feasible** but **premature**: lasers did not exist, **computing** was costly, and no common **numbering** ran across the trade.",
        "zh": "这项**发明**(invention)其实很老。1949年，诺曼·伍德兰与伯纳德·西尔弗为一种用印刷标记给货品**分类**(classifying)的**光学**(optical)方法提交了专利申请；1952年授权的文件里，**直线**(linear)与**圆环**(circular)两种图形都**画**(depicted)了出来。它们都**可行**(feasible)，只是**为时过早**(premature)：激光尚不存在，**计算**(computing)昂贵，全行业也没有一套通用的**编号**(numbering)。"
      },
      {
        "en": "By 1970 the **grocers** had a number for every product but no **symbol** a machine could read. George Laurer, an IBM **engineer**, refused his manager's plea to keep the **bullseye**: it **smeared** when **printed** on **packaging**. He pushed for **vertical** bars; an industry **panel** chose IBM's **proposal** in 1973 and named it UPC-A.",
        "zh": "到1970年，**杂货商**(grocers)们已经给每件商品定了号，却还没有一种机器读得懂的**符号**(symbol)。IBM**工程师**(engineer)乔治·劳雷尔顶回了上司要他保留**牛眼环**(bullseye)的要求：那种图形**印**(printed)在**包装**(packaging)上会**洇开**(smeared)。他坚持用**竖**(vertical)条；1973年，行业**评审组**(panel)选中了IBM的**方案**(proposal)，定名UPC-A。"
      },
      {
        "en": "The UPC-A **format** turned twelve **digits** into geometry, the last a **checksum** **catching** a **misread**. A **mirror** **swept** the beam over the **label**; a photodiode read the **reflected** beam, and bar **widths** became a number. On that gum the number gave a maker and an item, nothing more.",
        "zh": "UPC-A**格式**(format)把十二个**数字**(digits)变成几何图形，最后一位是**校验和**(checksum)，**能逮住**(catching)**误读**(misread)。在特洛伊，一面**反射镜**(mirror)把光束**扫**(swept)过**标签**(label)；光电二极管读取**反射**(reflected)回的光，条与空的**宽度**(widths)于是变成一串数。那包口香糖上，这串数给出的是：一个厂商，一件商品，此外什么也没有。"
      },
      {
        "en": "A **database** held the **description** and price: prices changed without reprinting wrappers, and each sale updated **inventory**. Machinery alone was no system. Spectra-Physics built the **laser**, NCR the till; rival **vendors** followed, makers printed codes. A **proprietary** scheme serves one chain; **infrastructure** needs **competitors** to **obey** one **specification**. The Smithsonian keeps one of those first scanners: the bars held a number, the price was elsewhere.",
        "zh": "**描述**(description)和价格存在**数据库**(database)里，于是价格可以改动而不必重印任何一张包装纸，每一笔销售都能更新**库存**(inventory)。光有机器不成体系。斯佩克特拉物理造**激光**(laser)器，NCR造收银机；互为对手的**供应商**(vendors)跟上，厂商把码印上去。一套**专有的**(proprietary)方案只服务一家连锁；**基础设施**(infrastructure)要求**竞争者**(competitors)共同**遵守**(obey)一份**规范**(specification)。史密森学会留着最初那批扫描器中的一台：条纹里装的是一串数，价格在别处。"
      }
    ],
    "glossary": [
      {
        "w": "supermarket",
        "zh": "超市",
        "p": 1
      },
      {
        "w": "cashier",
        "zh": "收银员",
        "p": 1
      },
      {
        "w": "gum",
        "zh": "口香糖",
        "p": 1
      },
      {
        "w": "scanner",
        "zh": "扫描器",
        "p": 1
      },
      {
        "w": "sunk",
        "zh": "沉",
        "p": 1
      },
      {
        "w": "checkout",
        "zh": "收银台；结账",
        "p": 1
      },
      {
        "w": "cents",
        "zh": "美分",
        "p": 1
      },
      {
        "w": "shelf",
        "zh": "货架",
        "p": 1
      },
      {
        "w": "promotion",
        "zh": "促销；晋升",
        "p": 1
      },
      {
        "w": "wrapper",
        "zh": "包装纸",
        "p": 1
      },
      {
        "w": "invention",
        "zh": "发明",
        "p": 2
      },
      {
        "w": "optical",
        "zh": "光学的",
        "p": 2
      },
      {
        "w": "classifying",
        "zh": "分类",
        "p": 2
      },
      {
        "w": "depicted",
        "zh": "描绘",
        "p": 2
      },
      {
        "w": "linear",
        "zh": "直线的",
        "p": 2
      },
      {
        "w": "circular",
        "zh": "圆环的",
        "p": 2
      },
      {
        "w": "feasible",
        "zh": "可行的",
        "p": 2
      },
      {
        "w": "premature",
        "zh": "为时过早的",
        "p": 2
      },
      {
        "w": "computing",
        "zh": "计算",
        "p": 2
      },
      {
        "w": "numbering",
        "zh": "编号",
        "p": 2
      },
      {
        "w": "grocers",
        "zh": "杂货商",
        "p": 3
      },
      {
        "w": "symbol",
        "zh": "符号",
        "p": 3
      },
      {
        "w": "engineer",
        "zh": "工程师",
        "p": 3
      },
      {
        "w": "bullseye",
        "zh": "牛眼环；靶心",
        "p": 3
      },
      {
        "w": "smeared",
        "zh": "洇开；涂抹",
        "p": 3
      },
      {
        "w": "printed",
        "zh": "印刷",
        "p": 3
      },
      {
        "w": "packaging",
        "zh": "包装",
        "p": 3
      },
      {
        "w": "vertical",
        "zh": "竖直的",
        "p": 3
      },
      {
        "w": "panel",
        "zh": "评审组；面板",
        "p": 3
      },
      {
        "w": "proposal",
        "zh": "方案；提议",
        "p": 3
      },
      {
        "w": "format",
        "zh": "格式",
        "p": 4
      },
      {
        "w": "digits",
        "zh": "数字；位",
        "p": 4
      },
      {
        "w": "checksum",
        "zh": "校验和",
        "p": 4
      },
      {
        "w": "catching",
        "zh": "逮住；捕捉",
        "p": 4
      },
      {
        "w": "misread",
        "zh": "误读",
        "p": 4
      },
      {
        "w": "mirror",
        "zh": "反射镜",
        "p": 4
      },
      {
        "w": "swept",
        "zh": "扫",
        "p": 4
      },
      {
        "w": "label",
        "zh": "标签",
        "p": 4
      },
      {
        "w": "reflected",
        "zh": "光线",
        "p": 4
      },
      {
        "w": "widths",
        "zh": "宽度",
        "p": 4
      },
      {
        "w": "database",
        "zh": "数据库",
        "p": 5
      },
      {
        "w": "description",
        "zh": "描述",
        "p": 5
      },
      {
        "w": "inventory",
        "zh": "库存",
        "p": 5
      },
      {
        "w": "laser",
        "zh": "激光",
        "p": 5
      },
      {
        "w": "vendors",
        "zh": "供应商",
        "p": 5
      },
      {
        "w": "proprietary",
        "zh": "专有的",
        "p": 5
      },
      {
        "w": "infrastructure",
        "zh": "基础设施",
        "p": 5
      },
      {
        "w": "competitors",
        "zh": "竞争者",
        "p": 5
      },
      {
        "w": "obey",
        "zh": "遵守",
        "p": 5
      },
      {
        "w": "specification",
        "zh": "规范",
        "p": 5
      }
    ],
    "facts": [
      "1974年6月26日8时01分，俄亥俄州特洛伊镇马什超市，马什研发主管克莱德·道森从购物车中取出一条十包装箭牌Juicy Fruit口香糖，由收银员莎伦·布坎南完成史上第一次UPC零售扫描，NCR收款机打出67美分。该包装现藏于史密森学会美国历史博物馆。[Grokipedia：UPC](https://grokipedia.com/page/Universal_Product_Code)｜[IBM：The UPC](https://www.ibm.com/history/upc)",
      "**当日货架标价为69美分，店内正做两分钱促销，系统读码后在后台数据库中完成比对并即时应用折扣。**这是本文论点的现场证据：条码本身不含价格，促销是包装无从知晓的信息。[First UPC Barcode Product Scanned](https://posts.terabox.com/hub/what-product-had-the-first-upc-barcode-stamped-on-it)",
      "1949年诺曼·伍德兰与伯纳德·西尔弗提出用印刷标记作光学分类的专利申请，1952年获授权，文件同时描绘直线与同心圆两类图形。受限于当时无激光、计算昂贵、缺乏全行业通用编号，构想可行却过早。[HISTORY：How the Barcode Was Invented](https://www.history.com/articles/upc-barcode-invention-ibm-laurer)",
      "1970年前后杂货业已就每件商品的编号达成一致，尚缺机器可读的符号。IBM工程师乔治·劳雷尔认为同心圆在包装印刷时容易洇开，拒绝了上司要求沿用牛眼图形的意见，转而主张线性竖条；1973年委员会选定IBM方案。[IBM：The UPC](https://www.ibm.com/history/upc)｜[HISTORY](https://www.history.com/articles/upc-barcode-invention-ibm-laurer)",
      "UPC-A为十二位数字，末位为校验位，用于识别误读。该条口香糖的UPC为036000291452。扫描端由反射镜扫掠激光束、光电二极管测量反射光强，条与空的宽度被译为数字。[Grokipedia：UPC](https://grokipedia.com/page/Universal_Product_Code)",
      "编码本身只指向厂商与商品，描述与价格存于零售商数据库，因此调价无需重印包装，且每笔销售可即时更新库存。系统的成立依赖商店建账、互相竞争的设备商制造兼容读头、制造商在包装上印码——专有方案可服务单一连锁，基础设施则要求竞争者共同遵守同一份规范。[IBM：The UPC](https://www.ibm.com/history/upc)",
      "**史实更正（2026-08-16）**：本文原末句写「史密森学会留着那张包装纸」，并在 §4 给出 UPC 号码 036000291452，两处均无据。《史密森尼杂志》2017年6月26日的编者按明确更正：该刊原文曾推测史密森国家美国历史博物馆收藏并展出了那包箭牌口香糖，实则**史密森并未收藏那包口香糖**，曾展出的是一件复制品。博物馆实际收藏的是最初十台扫描仪之一——Spectra Physics A 型价格扫描器，其工作原理为氦氖激光经旋转反射镜投射，光电二极管接收标签反射光。而首次扫描那包口香糖的实际 UPC 号码，检索未见可靠来源，故正文改为不给具体数字。[Smithsonian Magazine：The History of the Bar Code（含编者按）](https://www.smithsonianmag.com/innovation/history-bar-code-180956704/)｜[Smithsonian 藏品：Supermarket Scanner](https://si.edu/object/supermarket-scanner%3Anmah_892778)",
      "**已核（2026-08-16 逐条上网）**：1974年6月26日上午在俄亥俄州特洛伊市Marsh 超市完成史上第一次商用条码扫描；伍德兰与西尔弗1949年提交光学分类法专利、1952年获授权（含直线与同心圆两种图形）；乔治·劳雷尔在IBM主张竖条方案，1973年行业委员会选定并定名 UPC-A；十二位数字末位为校验码。**另有两处已在前次跑轮中订正**：史密森学会收藏的是最初十台扫描仪之一而非那张包装纸（《史密森尼杂志》编者按明确更正）；原文给出的 UPC 号码检索无据，已改为不给数字。[Smithsonian Magazine（含编者按）](https://www.smithsonianmag.com/innovation/history-bar-code-180956704/)",
      "**已核（2026-08-20 逐条上网）· §5 那句史密森是对的，且正好验证了第23篇的教训**：史密森美国历史博物馆藏品页明载 This Spectra Physics model A price scanner is **one of those first ten scanners**——**本文「收藏其中一台最早的扫描仪」无误**。**而同一页还写着：那包被扫的口香糖留在了 Clyde Dawson 手里，从未进过史密森**（The scanned package of chewing gum remained with Clyde Dawson of Marsh Supermarkets and never came to the Smithsonian）——**第23篇当年正是在这一点上出的错，来源就是这一页**。注意：多处二手资料仍误称那包口香糖藏于史密森。\n另核实无误：1974年6月26日8:01、Marsh 超市、Troy 俄亥俄、Clyde Dawson（Marsh 研发负责人）、收银员 Sharon Buchanan、**67美分（Wrigley 标价69美分，减2美分促销）**、伍德兰与西尔弗1949年申请/1952年获专利、牛眼码印在包装上会晕开、1973年委员会选中IBM方案并命名 UPC-A、氦氖激光经旋转镜照到玻璃面再由光电二极管接收、该店共装十台、每台四千美元。**§5 末尾三句泛论已改实**：原为「商店建账、对手造兼容读头、厂商印码」，现改为 **Spectra-Physics 造激光器、NCR 造收银机**——同一藏品页载「两家共同开发，分别提供激光扫描器与计算机化收银机」。[Smithsonian NMAH：Supermarket Scanner](https://americanhistory.si.edu/collections/object/nmah_892778)｜[Smithsonian Magazine：The History of the Bar Code](https://www.smithsonianmag.com/innovation/history-bar-code-180956704/)"
    ]
  },
    {
    "id": "06",
    "slug": "the-reaction-invented-twice",
    "title": "The Reaction That Had to Be Invented Twice",
    "titleZh": "一种不得不发明两次的反应",
    "standfirst": "哈伯的台式装置每小时产氨125毫升；四年后奥保工厂每天四十吨。同一个反应，中间隔着一次完全独立的发明。",
    "topic": "Haber–Bosch 合成氨与工业放大",
    "date": "2026-08-15",
    "status": "第六篇最终精进锁定稿",
    "metrics": {
      "words": 269,
      "keywords": 50,
      "density": 18.6
    },
    "paras": [
      {
        "en": "Air is four fifths **nitrogen**, yet no **crop** can use N₂ as it stands; roots take it up only as **compounds**. The **molecule** is **inert**, its atoms held by a triple **bond**. Farming **leaned** on **manure** and **nitrate** **mined** in Chile, so harvests hung on a distant deposit.",
        "zh": "空气里五**分之**四是**氮**(nitrogen)，可**作物**(crop)用不了N₂；根系只能以**化合物**(compounds)的形式吸收它。这个**分子**(molecule)**惰性**(inert)十足，原子被一根三重**键**(bond)锁死。农业只好**倚靠**(leaned)**厩肥**(manure)，以及在智利**开采**(mined)的**硝石**(nitrate)——收成于是系在一处远方的矿藏上。"
      },
      {
        "en": "In July 1909 Fritz Haber and Robert Le Rossignol ran a bench **apparatus** at Karlsruhe. Hydrogen and nitrogen **circulated** over an osmium **catalyst** at two hundred **atmospheres** and five hundred degrees. High pressure **favoured** **ammonia**; heat **hastened** it but cut **equilibrium** **yield**. Cooling condensed the product; a pump **recycled** the rest. It made 125 millilitres an hour.",
        "zh": "1909年7月，弗里茨·哈伯与罗伯特·勒罗西尼奥尔在卡尔斯鲁厄支起一台台式**装置**(apparatus)。氢与氮在约两百个**大气压**(atmospheres)、五百度下**循环**(circulated)通过锇**催化剂**(catalyst)。高压**有利于**(favoured)生成**氨**(ammonia)；升温**加快**(hastened)反应，却压低了**平衡**(equilibrium)**产率**(yield)。冷却让产物凝出，泵把没反应的气**回收**(recycled)。这台装置每小时产氨125毫升。"
      },
      {
        "en": "The factory was another matter. Hot hydrogen entered **steel** and stripped its **carbon**, leaving **vessels** brittle. Bosch answered with a double-**walled** tube whose **liner** vented hydrogen before it **weakened** the shell. Osmium was too rare for commerce; Alwin Mittasch **sifted** 2,500 **catalysts** through 6,500 runs and settled on magnetite, whose **potassium** and **alumina** made cheap iron work.",
        "zh": "工厂是另一回事。热氢钻进**钢**(steel)里，把其中的**碳**(carbon)夺走，**容器**(vessels)因此变脆。博施的答案是一根双层**壁**(walled)管：内**衬**(liner)在氢**削弱**(weakened)承压外壳之前就把它放掉。锇对商业化来说太稀有；阿尔文·米塔施把2500种**催化剂**(catalysts)**筛**(sifted)过6500轮，最后选中瑞典磁铁矿——其中微量的**钾**(potassium)与**铝土**(alumina)让便宜的铁也管用。"
      },
      {
        "en": "Oppau opened in September 1913. By 1914 it made forty **tonnes** a day — one reaction **magnified** twenty thousandfold. **Fertiliser** lifted **harvests** across Europe, and famine forecasts went quiet. Then a naval **blockade** **severed** Chilean supply; ammonia became **nitric** acid and the same **reactors** fed **explosives** and **munitions**.",
        "zh": "1913年9月，奥保工厂开工。到1914年，它每天产氨四十**吨**(tonnes)：同一个反应，**放大**(magnified)了两万倍。**化肥**(fertiliser)抬高了全欧的**收成**(harvests)，饥荒预言就此沉寂。随后海上**封锁**(blockade)**切断**(severed)了智利的供应；氨被氧化成**硝**(nitric)酸，同一批**反应器**(reactors)开始供给**炸药**(explosives)与**弹药**(munitions)。"
      },
      {
        "en": "Ammonia is **indispensable**, and making it **consumes** one or two per cent of world energy, drawing **hydrogen** from **fossil** fuels and pushing **emissions** **upstream**. **Renewable** electricity can **substitute** for those fuels, and better **efficiency** can curb the **excess**: half of all applied nitrogen never reaches a crop. The chemistry has hardly changed; the plant must be invented a third time.",
        "zh": "如今氨已**不可或缺**(indispensable)，而合成它**消耗**(consumes)全世界百分之一到二的能源，其**氢**(hydrogen)取自**化石**(fossil)燃料，**排放**(emissions)被推到了**上游**(upstream)。**可再生**(renewable)电力可以**替代**(substitute)那些化石燃料，更高的施肥**效率**(efficiency)可以收住那些**过量**(excess)的部分——全世界施下去的氮，约有一半从未进入作物。这套化学几乎没变；要重新发明的，是第三次的工厂。"
      }
    ],
    "glossary": [
      {
        "w": "nitrogen",
        "zh": "氮",
        "p": 1
      },
      {
        "w": "crop",
        "zh": "作物",
        "p": 1
      },
      {
        "w": "compounds",
        "zh": "化合物",
        "p": 1
      },
      {
        "w": "molecule",
        "zh": "分子",
        "p": 1
      },
      {
        "w": "inert",
        "zh": "惰性的",
        "p": 1
      },
      {
        "w": "bond",
        "zh": "键；纽带",
        "p": 1
      },
      {
        "w": "leaned",
        "zh": "倚靠",
        "p": 1
      },
      {
        "w": "manure",
        "zh": "厩肥",
        "p": 1
      },
      {
        "w": "nitrate",
        "zh": "硝石；硝酸盐",
        "p": 1
      },
      {
        "w": "mined",
        "zh": "开采",
        "p": 1
      },
      {
        "w": "apparatus",
        "zh": "装置",
        "p": 2
      },
      {
        "w": "circulated",
        "zh": "循环",
        "p": 2
      },
      {
        "w": "catalyst",
        "zh": "催化剂",
        "p": 2
      },
      {
        "w": "atmospheres",
        "zh": "大气压；气氛",
        "p": 2
      },
      {
        "w": "favoured",
        "zh": "有利于",
        "p": 2
      },
      {
        "w": "ammonia",
        "zh": "氨",
        "p": 2
      },
      {
        "w": "hastened",
        "zh": "加快；促进",
        "p": 2
      },
      {
        "w": "equilibrium",
        "zh": "平衡",
        "p": 2
      },
      {
        "w": "yield",
        "zh": "产率；产出",
        "p": 2
      },
      {
        "w": "recycled",
        "zh": "回收",
        "p": 2
      },
      {
        "w": "steel",
        "zh": "钢",
        "p": 3
      },
      {
        "w": "carbon",
        "zh": "碳",
        "p": 3
      },
      {
        "w": "vessels",
        "zh": "容器",
        "p": 3
      },
      {
        "w": "walled",
        "zh": "有壁的",
        "p": 3
      },
      {
        "w": "liner",
        "zh": "内衬",
        "p": 3
      },
      {
        "w": "weakened",
        "zh": "削弱",
        "p": 3
      },
      {
        "w": "sifted",
        "zh": "筛选",
        "p": 3
      },
      {
        "w": "catalysts",
        "zh": "催化剂",
        "p": 3
      },
      {
        "w": "potassium",
        "zh": "钾",
        "p": 3
      },
      {
        "w": "alumina",
        "zh": "铝土；氧化铝",
        "p": 3
      },
      {
        "w": "tonnes",
        "zh": "吨",
        "p": 4
      },
      {
        "w": "magnified",
        "zh": "放大",
        "p": 4
      },
      {
        "w": "fertiliser",
        "zh": "化肥",
        "p": 4
      },
      {
        "w": "harvests",
        "zh": "收成",
        "p": 4
      },
      {
        "w": "blockade",
        "zh": "封锁",
        "p": 4
      },
      {
        "w": "severed",
        "zh": "切断",
        "p": 4
      },
      {
        "w": "nitric",
        "zh": "硝的",
        "p": 4
      },
      {
        "w": "reactors",
        "zh": "反应器",
        "p": 4
      },
      {
        "w": "explosives",
        "zh": "炸药",
        "p": 4
      },
      {
        "w": "munitions",
        "zh": "弹药",
        "p": 4
      },
      {
        "w": "indispensable",
        "zh": "不可或缺的",
        "p": 5
      },
      {
        "w": "consumes",
        "zh": "消耗",
        "p": 5
      },
      {
        "w": "hydrogen",
        "zh": "氢",
        "p": 5
      },
      {
        "w": "fossil",
        "zh": "化石的",
        "p": 5
      },
      {
        "w": "emissions",
        "zh": "排放",
        "p": 5
      },
      {
        "w": "upstream",
        "zh": "上游的",
        "p": 5
      },
      {
        "w": "renewable",
        "zh": "可再生的",
        "p": 5
      },
      {
        "w": "substitute",
        "zh": "替代",
        "p": 5
      },
      {
        "w": "efficiency",
        "zh": "效率",
        "p": 5
      },
      {
        "w": "excess",
        "zh": "过量的",
        "p": 5
      }
    ],
    "facts": [
      "空气约五分之四为氮气，但N₂三重键极稳定，作物无法直接利用，须以化合物形式经根系吸收。哈伯法出现前，农业依赖厩肥与智利硝石，收成受制于单一远方矿藏。[Grokipedia：History of the Haber process](https://grokipedia.com/page/History_of_the_Haber_process)",
      "1909年7月，弗里茨·哈伯与罗伯特·勒罗西尼奥尔在卡尔斯鲁厄的台式装置以锇为催化剂，在约200个大气压、500℃量级条件下运行，**产氨速率约每小时125毫升**。高压有利于氨的生成，升温加快反应但降低平衡产率；冷凝取氨、循环回收未反应气体构成闭环。[Grokipedia：Haber process](https://grokipedia.com/page/Haber_process)",
      "工业化是另一类问题。热氢渗入钢材并夺取其中的碳，导致容器脆化、无法承压；博施团队以双层结构（内衬泄氢、外壳承载）解决。此为氢脆/脱碳问题的经典工程对策。[Grokipedia：Haber process](https://grokipedia.com/page/Haber_process)",
      "锇稀缺不足以支撑商业化。**阿尔文·米塔施系统筛选约2500种催化剂、进行约6500次试验**，最终选定含钾与氧化铝助剂的瑞典磁铁矿基铁催化剂——1913年奥保投产时，这成为工业多相催化的首个实例。[ScienceDirect：Haber-Bosch Process](https://www.sciencedirect.com/topics/chemistry/haber-bosch-process)｜[Chemistry World：A fixation with nitrogen](https://www.chemistryworld.com/features/a-fixation-with-nitrogen/6076.article)",
      "奥保工厂1913年9月投产，距1909年7月的台式演示四年零两个月；**1914年日产氨约40吨，约为实验室每小时125毫升的32万倍**。一战期间英国海上封锁切断智利硝石供应，氨经氧化制硝酸，转而供给炸药与弹药。哈伯、博施分获1918与1931年诺贝尔化学奖。[Execution Atlas：Haber-Bosch 数据与时间线](https://execution-atlas.com/en/articles/haber-bosch-process/)｜[Chemistry World](https://www.chemistryworld.com/features/a-fixation-with-nitrogen/6076.article)",
      "当代合成氨仍沿用可辨识的哈伯法，只是改用铁基催化剂并强化热回收；其能耗约占全球能源的1%—2%，所需氢多来自化石燃料，排放集中在上游。可再生电力制氢可替代该部分氢源，提高施肥效率则可抑制过量氮向水体与大气的流失。[Cambridge Core：HB 工艺综述](https://resolve.cambridge.org/core/product/F1159C9DB99D2B99D3B78518CCB4E90D/core-reader)",
      "**放大倍数的算法**：实验室每小时125毫升氨（密度约0.73 g/L，约0.09克/小时，合约2.2克/日）；1914年奥保日产40吨。两者相差约3.2×10⁵倍，正文取「放大32万倍」。　**已核且标注存疑**：125 毫升/小时、奥保 1913 年 9 月启用、米塔施筛选逾 2500 种配方，三项均获来源印证。但「1914 年日产 40 吨」**两说并存**：Wikipedia／HandWiki 记为 20 吨/日，另有来源记为 40 吨/日并据此给出「约 32 万倍」。正文取 40 吨与 320,000 倍，采自后者；若采前者则约为 16 万倍。**此数字存争议，读者宜知。**[Wikipedia：Haber process](https://handwiki.org/wiki/Chemistry:Haber_process)",
      "**已核（2026-08-20 逐条上网）· 抓出一处倍数算错**：\n**原文作「the same reaction magnified 320,000 times」——这个倍数经不起算。**\n125 毫升/时的液氨（密度约 0.682 g/mL）约合 85 克/时、即 **约 2 公斤/日**；日产 40 吨 ÷ 2 公斤/日 ≈ **两万倍**。按小时算亦同：40 吨/日 = 1,667 公斤/时，÷ 0.085 公斤/时 ≈ **19,600 倍**。\n**三十二万这个数是怎么来的**：把 40 吨当作 40,000,000 毫升（即按 1 g/mL 计）再除以 125 毫升 = 320,000——**这是拿「一天的产量」去除「一小时的产量」，单位对不上**。已改为 **twenty thousandfold**／「放大了两万倍」。\n**无误三项**：1909 年夏哈伯与勒罗西尼奥尔的台式装置产氨 **约 125 毫升/时**（多处一致，1909年7月2日以锇作催化剂作最终演示）；**米塔施至 1910 年在 6,500 次试验中筛过 2,500 种以上配方**（Fertilizer.org 原文：Until 1910 more that 2500 different formulas were tested in 6500 runs）；**奥堡 1913 年 9 月 9 日投产**。\n**一处两说并存**：1914 年日产量——维基／HandWiki／Infogalactic 作 **20 吨/日**；Grokipedia 作「初期 30 吨/日，首年末达 **40 吨/日**」；execution-atlas 亦作 40 吨/日。本文取 40（首年末），两说此存照。[Fertilizer.org：The Haber-Bosch Heritage](https://www.fertilizer.org/wp-content/uploads/2023/01/HABER.pdf)｜[Royal Society：Robert Le Rossignol, 1884–1976](https://royalsocietypublishing.org/rsnr/article/71/3/263/48636/Robert-Le-Rossignol-1884-1976-Engineer-of-the)"
    ]
  },
    {
    "id": "07",
    "slug": "the-meaning-he-left-out",
    "title": "The Meaning He Left Out",
    "titleZh": "他暂时略去的意义",
    "standfirst": "香农在第一页就把含义搁到一边——正是这份克制，让一条信道不必读懂消息也能把它完好送到。",
    "topic": "1948 年香农与信息论",
    "date": "2026-08-15",
    "status": "第七篇最终精进锁定稿",
    "metrics": {
      "words": 269,
      "keywords": 50,
      "density": 18.6
    },
    "paras": [
      {
        "en": "In 1948 Claude Shannon published a theory of **messages** and set meaning aside. A line might carry a love letter, a market **quotation** or an **arbitrary** string of **glyphs**; to the engineer the **contents** were **irrelevant**. His question was narrower: could a **receiver**, given the signal, **retrieve** exactly what the **sender** had **picked**?",
        "zh": "1948年，克劳德·香农发表了一套关于**消息**(messages)的理论，并把消息的含义搁在一边。一条线路上传的可能是情书，可能是行情**报价**(quotation)，也可能是一串**任意的**(arbitrary)**符号**(glyphs)；在工程师看来，这些**内容**(contents)都**无关紧要**(irrelevant)。他问的是更窄的问题：**接收端**(receiver)拿到抵达的信号后，能不能原样**取回**(retrieve)**发送端**(sender)当初**挑中**(picked)的那一条？"
      },
      {
        "en": "The question made information **countable**. If eight **outcomes** are **equally** **probable**, identifying one takes three yes-or-no decisions: three **bits**. A certain event says nothing; a **surprising** one says more. He measured surprise with **probability**; von Neumann urged the name **entropy**, base two gave the unit, a **contraction** of **binary** digit, named by John Tukey.",
        "zh": "这个窄问题让信息变得**可数**(countable)。若八种**结果**(outcomes)**等**(equally)**概率**(probable)，认出其中一种需要三次是非判断，也就是三个**比特**(bits)。必然发生的事什么也没说；**出人意料的**(surprising)那件说得更多。他用**概率**(probability)去度量这份意外；冯·诺依曼劝他叫它**熵**(entropy)，以2为底给出了单位，即**二进制**(binary)数字的**缩写**(contraction)，由约翰·图基起名。"
      },
      {
        "en": "Written English is **lopsided**. Letters counted **singly** give 4.14 bits each, but they are **predictable** from neighbours, and **guessing** experiments he published in 1951 put the true figure at 0.6 to 1.3. That gap is **redundancy**; **shrinking** a file means spending it: **shorter** **codewords** for **frequent** **characters**, longer ones for the rest.",
        "zh": "书面英语是**偏斜的**(lopsided)。把字母**逐个**(singly)来数，每个字母是4.14比特；可字母能从相邻字母**推得出来**(predictable)，香农1951年发表的**猜字**(guessing)实验把真实值压到0.6至1.3之间。这中间的落差就是**冗余**(redundancy)；**压缩**(shrinking)一个文件，就是把这份冗余花掉：给**高频**(frequent)**字符**(characters)配**更短的**(shorter)**码字**(codewords)，其余的配长的。"
      },
      {
        "en": "**Noise** inverts the argument. A channel **corrupts** symbols, so an **encoder** puts redundancy back **deliberately**, spacing codewords so a damaged one still **decodes** correctly. Every channel has a ceiling on **throughput**: below it, long codes drive the **error** rate **arbitrarily** near zero; above it, no **scheme** keeps **transmission** reliable.",
        "zh": "**噪声**(Noise)把这套逻辑反了过来。信道会**弄坏**(corrupts)符号，于是**编码器**(encoder)**刻意**(deliberately)把冗余加回去，让码字彼此隔得够开，坏掉一个仍能正确**译回**(decodes)。每条信道都有一个**吞吐量**(throughput)上限：在上限之下，足够长的码能把**错误**(error)率压到**任意**(arbitrarily)接近零；在上限之上，没有任何**方案**(scheme)能让**传输**(transmission)可靠。"
      },
      {
        "en": "The proof was not **constructive**. He showed good codes exist without **exhibiting** one. Richard Hamming, down the **corridor** on **unreliable** **vacuum**-tube machines, built one in 1950 from **parity** checks that **correct** as well as detect. At the **destination**, meaning may matter again. That **restraint** is what made the theory general: a channel need not understand a message to carry it **intact**.",
        "zh": "这个证明不是**构造性的**(constructive)。他证明了好码存在，却没**拿出**(exhibiting)一个。理查德·汉明就在同一条**走廊**(corridor)上，对着**不可靠的**(unreliable)**真空**(vacuum)管机器，1950年用**奇偶**(parity)校验造出了一个——不只查错，还能**纠**(correct)错。到了**终点**(destination)，含义可以重新变得要紧。正是那份**克制**(restraint)让这套理论具有普遍性：一条信道不必读懂一条消息，也能把它**完好**(intact)送到。"
      }
    ],
    "glossary": [
      {
        "w": "message",
        "zh": "消息；信息",
        "p": 1
      },
      {
        "w": "quotation",
        "zh": "报价；引文",
        "p": 1
      },
      {
        "w": "arbitrary",
        "zh": "任意的",
        "p": 1
      },
      {
        "w": "glyph",
        "zh": "符号；字形",
        "p": 1
      },
      {
        "w": "contents",
        "zh": "内容",
        "p": 1
      },
      {
        "w": "irrelevant",
        "zh": "无关紧要的",
        "p": 1
      },
      {
        "w": "receiver",
        "zh": "接收端；接收器",
        "p": 1
      },
      {
        "w": "retrieve",
        "zh": "取回；检索",
        "p": 1
      },
      {
        "w": "sender",
        "zh": "发送端",
        "p": 1
      },
      {
        "w": "pick",
        "zh": "挑中；选择",
        "p": 1
      },
      {
        "w": "countable",
        "zh": "可数的",
        "p": 2
      },
      {
        "w": "outcome",
        "zh": "结果",
        "p": 2
      },
      {
        "w": "equally",
        "zh": "同等地",
        "p": 2
      },
      {
        "w": "probable",
        "zh": "可能的；或然的",
        "p": 2
      },
      {
        "w": "bit",
        "zh": "比特；位",
        "p": 2
      },
      {
        "w": "surprising",
        "zh": "出人意料的",
        "p": 2
      },
      {
        "w": "probability",
        "zh": "概率",
        "p": 2
      },
      {
        "w": "entropy",
        "zh": "熵",
        "p": 2
      },
      {
        "w": "contraction",
        "zh": "缩写；收缩",
        "p": 2
      },
      {
        "w": "binary",
        "zh": "二进制的",
        "p": 2
      },
      {
        "w": "lopsided",
        "zh": "偏斜的；不均衡的",
        "p": 3
      },
      {
        "w": "singly",
        "zh": "逐个地；单独地",
        "p": 3
      },
      {
        "w": "predictable",
        "zh": "可推知的",
        "p": 3
      },
      {
        "w": "guessing",
        "zh": "猜测",
        "p": 3
      },
      {
        "w": "redundancy",
        "zh": "冗余",
        "p": 3
      },
      {
        "w": "shrink",
        "zh": "压缩；缩小",
        "p": 3
      },
      {
        "w": "shorter",
        "zh": "更短的",
        "p": 3
      },
      {
        "w": "codeword",
        "zh": "码字",
        "p": 3
      },
      {
        "w": "frequent",
        "zh": "高频的",
        "p": 3
      },
      {
        "w": "character",
        "zh": "字符；性格",
        "p": 3
      },
      {
        "w": "noise",
        "zh": "噪声",
        "p": 4
      },
      {
        "w": "corrupt",
        "zh": "弄坏；使腐化",
        "p": 4
      },
      {
        "w": "encoder",
        "zh": "编码器",
        "p": 4
      },
      {
        "w": "deliberately",
        "zh": "刻意地",
        "p": 4
      },
      {
        "w": "decode",
        "zh": "译回；解码",
        "p": 4
      },
      {
        "w": "throughput",
        "zh": "吞吐量",
        "p": 4
      },
      {
        "w": "error",
        "zh": "错误",
        "p": 4
      },
      {
        "w": "arbitrarily",
        "zh": "任意地",
        "p": 4
      },
      {
        "w": "scheme",
        "zh": "方案",
        "p": 4
      },
      {
        "w": "transmission",
        "zh": "传输",
        "p": 4
      },
      {
        "w": "constructive",
        "zh": "构造性的；建设性的",
        "p": 5
      },
      {
        "w": "exhibit",
        "zh": "拿出；展示",
        "p": 5
      },
      {
        "w": "corridor",
        "zh": "走廊",
        "p": 5
      },
      {
        "w": "unreliable",
        "zh": "不可靠的",
        "p": 5
      },
      {
        "w": "vacuum",
        "zh": "真空",
        "p": 5
      },
      {
        "w": "parity",
        "zh": "奇偶校验；同等",
        "p": 5
      },
      {
        "w": "correct",
        "zh": "纠正",
        "p": 5
      },
      {
        "w": "destination",
        "zh": "终点；目的地",
        "p": 5
      },
      {
        "w": "restraint",
        "zh": "克制",
        "p": 5
      },
      {
        "w": "intact",
        "zh": "完好的",
        "p": 5
      }
    ],
    "facts": [
      "香农《A Mathematical Theory of Communication》分两期刊于《Bell System Technical Journal》第27卷，1948年7月（pp.379–423）与10月（pp.623–656）。论文开篇即写明：消息常常带有含义，但这与工程问题无关；工程问题是在一点精确或近似地再现在另一点选定的消息。[Shannon 1948 原文](https://people.math.harvard.edu/~ctm/home/text/others/shannon/entropy/entropy.pdf)",
      "以2为底时单位称为二进制数字（binary digits），简称 bit，该词由 J. W. Tukey 建议。八个等概率结果需3个比特，因 log₂8 = 3。[Shannon 1948 原文](https://people.math.harvard.edu/~ctm/home/text/others/shannon/entropy/entropy.pdf)",
      "香农1951年《Prediction and Entropy of Printed English》（BSTJ 30:1, pp.50–64）中，仅按单字母频率计算得 F₁ = 4.14 比特/字母；而通过让受试者逐字母猜测的实验，他把英文的真实熵估计在 0.6—1.3 比特/字母之间。二者之差即冗余。[Shannon 1951 原文](https://www.princeton.edu/~wbialek/rome/refs/shannon_51.pdf)｜[熵估计区间](https://image-ppubs.uspto.gov/dirsearch-public/print/downloadPdf/5960385)",
      "信源编码利用统计不均匀性压缩；信道编码则反向操作，刻意加入冗余以纠错。香农证明每条信道存在容量：低于容量时，足够长的码可使错误概率任意小；高于容量时，任何方案都无法保证可靠传输。　**已核**：信源编码利用统计不均匀性压缩，信道编码反向加入冗余以纠错；香农证明每条信道存在容量，低于容量时足够长的码可使错误概率任意小，高于容量时任何方案都无法保证可靠传输。[Shannon 1948《A Mathematical Theory of Communication》](https://people.math.harvard.edu/~ctm/home/text/others/shannon/entropy/entropy.pdf)",
      "**香农的证明是非构造性的**：他证明了好码存在，却未给出构造方法，这被视为留给编码理论界的挑战。理查德·汉明当时在同一实验室研究以真空管搭建的、极不可靠的计算机，于1950年在《BSTJ》29卷2期 pp.147–160 发表纠错码，用奇偶校验实现检错与纠错，成为编码理论的奠基石。[CIO：60 years of Hamming codes](https://www.cio.com/article/205691/cio-blast-from-the-past-60-years-of-hamming-codes.html)｜[Hamming 1950 著录](https://arxiv.org/pdf/1211.2853)",
      "正文写“到了终点，含义可以重新变得要紧”，对应香农原文将通信系统划分为信源、发射机、信道、接收机与终点（destination）；理论只保证消息在信道上被完好复现，不评判消息的用途。[Shannon 1948 原文](https://people.math.harvard.edu/~ctm/home/text/others/shannon/entropy/entropy.pdf)",
      "**订正与来源（2026-08-16）**：§2 原写「他……管它叫熵」；**「熵」这个名字实际是冯·诺依曼建议香农采用的**（而非香农自取），已改为 von Neumann urged the name。**已核**：香农1951年《Prediction and Entropy of Printed English》给出单字母 4.14 bits，而借猜字实验测得印刷英语的熵在 **0.6—1.3 bits/字母** 之间——正文两个数字均与原文一致。「bit」一名由约翰·图基所起。[Shannon 1951 原文（Princeton 存档 PDF）](https://www.princeton.edu/~wbialek/rome/refs/shannon_51.pdf)｜[Mahoney：Refining the Estimated Entropy of English](https://mattmahoney.net/dc/entropy1.html)",
      "**已核（2026-08-20 逐条上网）· 八项全对，零翻案**：\n**4.14 比特／字母** —— **香农 1951 年原文即此数**：「F₁ = −Σ p(i) log₂ p(i) = **4.14 bits per letter**」（不计空格；计空格时为 4.03）。正文写「Letters counted singly give 4.14 bits each」，与 F₁ 的定义完全对应。\n**0.6 至 1.3 比特** —— 猜字实验所得区间，多处引述一致（Shannon, Prediction and Entropy of Printed English, BSTJ 30:50-64, **1951**）。实验以《Jefferson the Virginian》中 100 段各 100 字为材料，受试者为其夫人，对每段取 n=1…15 与 100，共 1,600 次观测。\n**冯·诺依曼建议命名为「熵」** —— Tribus 1961 年当面所问、香农所答，原话「no one knows what entropy really is, so in a debate you will always have the advantage」。\n**bit 一词由 John Tukey 所造** —— 香农 1948 年论文中即明确归功于图基。\n另核无误：1948 年发表《通信的数学理论》；八个等概结果需三次是非判断（log₂8=3）；汉明 **1950 年**以奇偶校验造出既能检错又能纠错的码。[Shannon 1951 原文 PDF（普林斯顿存档）](https://www.princeton.edu/~wbialek/rome/refs/shannon_51.pdf)｜[arXiv：Entropy? Honest!（冯·诺依曼原话出处）](https://arxiv.org/pdf/1705.02223)｜[PMC：Entropy Rate Estimation for English](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC7514546/)"
    ]
  }
  ]
};
