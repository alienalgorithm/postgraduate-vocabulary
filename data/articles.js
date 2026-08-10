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
  vocabTotal: 2545,          // 词表不重复单词总数
  vocabNote: "新东方考研英语词汇 · 乱序版 · 35 个 List",

  ARTICLES: [
    {
      id: "01",
      slug: "snow-cholera",
      title: "Snow and the Broad Street Pump",
      titleZh: "斯诺与宽街水泵",
      standfirst: "一张地图，一个远在几英里外的寡妇，和一个不必等确定性的决定。",
      topic: "1854 年伦敦霍乱",
      date: "2026-08-09",
      status: "定稿",
      metrics: { words: 252, keywords: 50, density: 19.8 },

      paras: [
        {
          en: "In September 1854 a few streets of Soho, in central London, lost 616 people to cholera in ten days. **Prevailing** medical **opinion** **blamed** the **foul** air. John Snow, a **physician** who lived **nearby**, conducted a house-to-house **survey**, asking where the dead had **drawn** their water, and marked each death with a **stroke** against the address on a **map** of the **district**. The strokes **gathered** around one **pump** on Broad Street.",
          zh: "1854年9月，伦敦市中心苏活区的几条街，十天之内因霍乱失去了616条人命。**主流的**(prevailing)医学**观点**(opinion)把病因**归咎于**(blamed)**污浊的**(foul)空气。住在**附近**(nearby)的**内科医生**(physician)约翰·斯诺挨家挨户做**调查**(survey)，询问死者生前从何处**汲取**(drawn)饮水，再按门牌把每一例死亡**划**(stroke)作一道短线，落在**辖区**(district)**地图**(map)上。这些短线**聚拢**(gathered)在宽街的一口**水泵**(pump)周围。"
        },
        {
          en: "The **pattern** showed him where to look; the **exceptions** showed him he was right. A workhouse of 535 **inmates** inside the death **zone** had its own **well** and **recorded** five deaths. A brewery **beside** the pump lost nobody, since the men were **supplied** with beer. And a **widow** in Hampstead, **remote** from any Soho air, died — she had preferred the **taste** of Broad Street water and had it **delivered** weekly.",
          zh: "**分布形态**(pattern)告诉他该往哪里看；**例外**(exceptions)才告诉他他看对了。死亡**区域**(zone)之内，一所收容535名**院民**(inmates)的济贫院自有一口**水井**(well)，**记录在案**(recorded)的死亡仅五例。**紧邻**(beside)水泵的一家啤酒厂无一人染病，因为厂方向工人**供应**(supplied)啤酒。而汉普斯特德的一位**寡妇**(widow)，**远离**(remote)苏活的任何空气，却死了——她偏爱宽街之水的**味道**(taste)，一直让人每周**送**(delivered)去。"
        },
        {
          en: "Foul air **explained** the 616. Only the widow could **refute** it. Snow had no **microscope**, no **germ**, no **theory** of **infection** — only a map and an **anomaly**. A theory is **tested** not by the cases it **fits**, but by the one it cannot **survive**.",
          zh: "污浊的空气**解释**(explained)得了那616人。能**驳倒**(refute)它的，只有那个寡妇。斯诺没有**显微镜**(microscope)，没有**病菌**(germ)，没有**传染**(infection)**理论**(theory)——只有一张地图和一个**异常个案**(anomaly)。**检验**(tested)一个理论的，从来不是那些与它**吻合**(fits)的案例，而是那一个它**经受不住**(survive)的案例。"
        },
        {
          en: "On 8 September the **parish** **removed** the pump **handle**. The **outbreak** was already **fading** and the **gesture** **altered** little; the board had not **accepted** his **conclusion**, only his **advice**. Snow died in 1858 with the **profession** still **unconvinced**. He had **demonstrated** something more useful than a **proof**: that when being wrong costs a handle and being right saves a street, **certainty** is the wrong thing to wait for.",
          zh: "9月8日，**教区**(parish)**拆除**(removed)了水泵的**手柄**(handle)。这场**疫情**(outbreak)本已在**消退**(fading)，这一**举措**(gesture)**改变**(altered)甚微；委员会并未**接受**(accepted)他的**结论**(conclusion)，只接受了他的**建议**(advice)。1858年斯诺去世时，整个**医界**(profession)仍**未被说服**(unconvinced)。而他已经**证明**(demonstrated)了一件比**证明**(proof)本身更有用的事：当猜错了不过是搭上一根手柄、而猜对了能救下一整条街，**确定性**(certainty)就不是那个值得等的东西。"
        }
      ],

      glossary: [
        { w: "prevailing",  zh: "主流的",   p: 1 },
        { w: "opinion",     zh: "观点",     p: 1 },
        { w: "blame",       zh: "归咎于",   p: 1 },
        { w: "foul",        zh: "污浊的",   p: 1 },
        { w: "physician",   zh: "内科医生", p: 1 },
        { w: "nearby",      zh: "附近的",   p: 1 },
        { w: "survey",      zh: "调查",     p: 1 },
        { w: "draw",        zh: "汲取",     p: 1 },
        { w: "stroke",      zh: "一划",     p: 1 },
        { w: "map",         zh: "地图",     p: 1 },
        { w: "district",    zh: "辖区",     p: 1 },
        { w: "gather",      zh: "聚拢",     p: 1 },
        { w: "pump",        zh: "水泵",     p: 1 },

        { w: "pattern",     zh: "分布形态", p: 2 },
        { w: "exception",   zh: "例外",     p: 2 },
        { w: "inmate",      zh: "院民",     p: 2 },
        { w: "zone",        zh: "区域",     p: 2 },
        { w: "well",        zh: "水井",     p: 2 },
        { w: "record",      zh: "记录在案", p: 2 },
        { w: "beside",      zh: "紧邻",     p: 2 },
        { w: "supply",      zh: "供应",     p: 2 },
        { w: "widow",       zh: "寡妇",     p: 2 },
        { w: "remote",      zh: "远离的",   p: 2 },
        { w: "taste",       zh: "味道",     p: 2 },
        { w: "deliver",     zh: "递送",     p: 2 },

        { w: "explain",     zh: "解释",     p: 3 },
        { w: "refute",      zh: "驳倒",     p: 3 },
        { w: "microscope",  zh: "显微镜",   p: 3 },
        { w: "germ",        zh: "病菌",     p: 3 },
        { w: "infection",   zh: "传染",     p: 3 },
        { w: "theory",      zh: "理论",     p: 3 },
        { w: "anomaly",     zh: "异常个案", p: 3 },
        { w: "test",        zh: "检验",     p: 3 },
        { w: "fit",         zh: "吻合",     p: 3 },
        { w: "survive",     zh: "经受住",   p: 3 },

        { w: "parish",      zh: "教区",     p: 4 },
        { w: "remove",      zh: "拆除",     p: 4 },
        { w: "handle",      zh: "手柄",     p: 4 },
        { w: "outbreak",    zh: "疫情",     p: 4 },
        { w: "fade",        zh: "消退",     p: 4 },
        { w: "gesture",     zh: "举措",     p: 4 },
        { w: "alter",       zh: "改变",     p: 4 },
        { w: "accept",      zh: "接受",     p: 4 },
        { w: "conclusion",  zh: "结论",     p: 4 },
        { w: "advice",      zh: "建议",     p: 4 },
        { w: "profession",  zh: "医界",     p: 4 },
        { w: "unconvinced", zh: "未被说服的", p: 4 },
        { w: "demonstrate", zh: "证明",     p: 4 },
        { w: "proof",       zh: "证明",     p: 4 },
        { w: "certainty",   zh: "确定性",   p: 4 }
      ],

      facts: [
        "616 人死于十日内；9 月 8 日拆除泵柄。",
        "波兰街济贫院 535 名院民，仅 5 例死亡（自有水井）。",
        "狮子啤酒厂员工零感染（喝厂里啤酒 + 自有深井）。",
        "汉普斯特德寡妇苏珊娜·伊利（Susannah Eley），因偏爱宽街水口味而定期取水，病死。",
        "拆泵柄时疫情本已在消退 —— 这个不体面的细节必须保留，是文章诚实性的关键。",
        "斯诺 1858 年去世，病菌说数十年后才被接受。",
        "来源：[John Snow 1855年《霍乱的传播方式》原著](https://wellcomecollection.org/works/uqa27qrt)",
        "来源：[1855年圣詹姆斯教区霍乱调查报告](https://wellcomecollection.org/works/z8xczc2r)",
        "来源：[伦敦卫生与热带医学院：宽街水泵与1854年疫情](https://www.lshtm.ac.uk/newsevents/news/2019/john-snow-memorial-pump-marking-historic-cholera-outbreak-reinstalled-its)"
      ]
    },
    {
      "id": "02",
      "slug": "a-garden-without-sunlight",
      "title": "A Garden Without Sunlight",
      "titleZh": "不见阳光的花园",
      "standfirst": "一场寻找海底热水的考察，如何发现了一个不依赖阳光的生命世界。",
      "topic": "1977 年加拉帕戈斯热液喷口",
      "date": "2026-08-09",
      "status": "第二篇最终锁定稿",
      "metrics": {
        "words": 259,
        "keywords": 50,
        "density": 19.3
      },
      "paras": [
        {
          "en": "Late on 15 February 1977, a **geological** **expedition** **aboard** the ship Knorr **sought** hot water **leaking** from the ocean **floor** at the Galápagos Rift, off Ecuador. No biologist was on the team. Some 2,500 metres **deep**, a **camera** system called ANGUS **registered** a **rise** in **temperature**. After three minutes, the reading **returned** to 2°C. The **photographs** told a different story.",
          "zh": "1977年2月15日深夜，一支**地质**(geological)**考察队**(expedition)**乘坐**(aboard)“诺尔”号，在厄瓜多尔以西的加拉帕戈斯裂谷**寻找**(sought)从**海床**(floor)**渗出**(leaking)的热水。队伍里没有生物学家。在海下约2500米**深处**(deep)，一套名为ANGUS的**摄影设备**(camera)**记录到**(registered)一次**温度**(temperature)**上升**(rise)。三分钟后，读数**回落**(returned)到2摄氏度。但**照片**(photographs)讲述了另一个故事。"
        },
        {
          "en": "ANGUS took 3,000 images; most showed **barren** lava. But 13 **successive** **frames** from that **interval** **revealed** hundreds of white clams and mussel **shells**. On 17 February, the submersible Alvin **descended** on dive 713. From lava **cracks** came **shimmering** 8°C water, about six degrees warmer than the **surrounding** bottom water. Clams up to 30 centimetres long **clustered** within a **roughly** 50-metre-wide area. The team found a **community**.",
          "zh": "ANGUS拍了3000张图像，大多只有**荒芜的**(barren)熔岩。但在那段升温**时段**(interval)拍下的13幅**连续**(successive)**画面**(frames)，却**呈现出**(revealed)数百只白色蛤蜊和贻贝**贝壳**(shells)。2月17日，深潜器“阿尔文”号在第713次潜航中**下潜**(descended)。熔岩**裂缝**(cracks)里涌出8摄氏度、**微微闪烁的**(shimmering)水流，比**周围**(surrounding)的底层海水高约6摄氏度。最长可达30厘米的蛤蜊**聚集**(clustered)在一片**大约**(roughly)50米宽的区域。考察队找到的是一个**生物群落**(community)。"
        },
        {
          "en": "Nobody knew what the animals ate. With little formaldehyde, the team used vodka to preserve **specimens**. A water **sample** smelled of rotten eggs: it **contained** hydrogen sulphide.",
          "zh": "没人知道这些动物吃什么。由于甲醛不多，队员只好用伏特加保存一部分**标本**(specimens)。一份**水样**(sample)散发着臭鸡蛋味，其中**含有**(contained)硫化氢。"
        },
        {
          "en": "Later work showed some **microbes** oxidise hydrogen sulphide, using **chemical** energy to **convert** carbon dioxide into **organic** matter. Many larger **species** **derive** nourishment from these microbes. These **processes** **support** a food **chain** based on chemosynthesis rather than **photosynthesis**.",
          "zh": "后来的研究表明，一些**微生物**(microbes)会氧化硫化氢，利用释放出的**化学能**(chemical)，把二氧化碳**转化**(convert)成**有机物**(organic)。许多体型较大的**物种**(species)则从这些微生物中**获得**(derive)养分。这些**过程**(processes)**维系着**(support)一条以化能合成而非**光合作用**(photosynthesis)为基础的食物**链**(chain)。"
        },
        {
          "en": "The **discovery** **extended** the known **boundaries** of life. Most **ecosystems** ultimately depend on sunlight, but Galápagos showed that **primary** production need not. That **insight** broadened what counts as **habitable**: an otherwise suitable environment need not be **defined** by sunlight if chemistry provides a **usable** **flow** of energy. The expedition went down to trace Earth's heat and came back with evidence that a community could **flourish** in permanent darkness.",
          "zh": "这次**发现**(discovery)**拓展了**(extended)人们已知的生命**边界**(boundaries)。大多数**生态系统**(ecosystems)归根结底依赖阳光，但加拉帕戈斯裂谷表明，**初级**(primary)生产未必需要阳光。这一**认识**(insight)拓宽了“**宜居**(habitable)”的范围：只要其他条件合适，一个环境是否适合生命生存，便不必由阳光来**界定**(defined)；化学过程也可以提供一股**可利用的**(usable)能量**流**(flow)。这支考察队下潜，是为了追踪地球的热量；带回的证据却表明，一个生物群落也能在终年不见光的地方**繁盛**(flourish)。"
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
          "zh": "考察、考察队",
          "p": 1
        },
        {
          "w": "aboard",
          "zh": "在船上",
          "p": 1
        },
        {
          "w": "seek",
          "zh": "寻找",
          "p": 1
        },
        {
          "w": "leak",
          "zh": "渗出",
          "p": 1
        },
        {
          "w": "floor",
          "zh": "海床、底部",
          "p": 1
        },
        {
          "w": "deep",
          "zh": "深处、深的",
          "p": 1
        },
        {
          "w": "camera",
          "zh": "摄影设备",
          "p": 1
        },
        {
          "w": "register",
          "zh": "记录到",
          "p": 1
        },
        {
          "w": "rise",
          "zh": "上升",
          "p": 1
        },
        {
          "w": "temperature",
          "zh": "温度",
          "p": 1
        },
        {
          "w": "return",
          "zh": "回落、返回",
          "p": 1
        },
        {
          "w": "photograph",
          "zh": "照片",
          "p": 1
        },
        {
          "w": "barren",
          "zh": "荒芜的",
          "p": 2
        },
        {
          "w": "successive",
          "zh": "连续的",
          "p": 2
        },
        {
          "w": "frame",
          "zh": "画面、帧",
          "p": 2
        },
        {
          "w": "interval",
          "zh": "时段、间隔",
          "p": 2
        },
        {
          "w": "reveal",
          "zh": "呈现出",
          "p": 2
        },
        {
          "w": "shell",
          "zh": "贝壳",
          "p": 2
        },
        {
          "w": "descend",
          "zh": "下潜",
          "p": 2
        },
        {
          "w": "crack",
          "zh": "裂缝",
          "p": 2
        },
        {
          "w": "shimmer",
          "zh": "闪烁",
          "p": 2
        },
        {
          "w": "surrounding",
          "zh": "周围的",
          "p": 2
        },
        {
          "w": "cluster",
          "zh": "聚集",
          "p": 2
        },
        {
          "w": "roughly",
          "zh": "大约",
          "p": 2
        },
        {
          "w": "community",
          "zh": "生物群落",
          "p": 2
        },
        {
          "w": "specimen",
          "zh": "标本",
          "p": 3
        },
        {
          "w": "sample",
          "zh": "样本、水样",
          "p": 3
        },
        {
          "w": "contain",
          "zh": "含有",
          "p": 3
        },
        {
          "w": "microbe",
          "zh": "微生物",
          "p": 4
        },
        {
          "w": "chemical",
          "zh": "化学的",
          "p": 4
        },
        {
          "w": "convert",
          "zh": "转化",
          "p": 4
        },
        {
          "w": "organic",
          "zh": "有机的",
          "p": 4
        },
        {
          "w": "species",
          "zh": "物种",
          "p": 4
        },
        {
          "w": "derive",
          "zh": "获得",
          "p": 4
        },
        {
          "w": "process",
          "zh": "过程",
          "p": 4
        },
        {
          "w": "support",
          "zh": "维系",
          "p": 4
        },
        {
          "w": "chain",
          "zh": "链",
          "p": 4
        },
        {
          "w": "photosynthesis",
          "zh": "光合作用",
          "p": 4
        },
        {
          "w": "discovery",
          "zh": "发现",
          "p": 5
        },
        {
          "w": "extend",
          "zh": "拓展",
          "p": 5
        },
        {
          "w": "boundary",
          "zh": "边界",
          "p": 5
        },
        {
          "w": "ecosystem",
          "zh": "生态系统",
          "p": 5
        },
        {
          "w": "primary",
          "zh": "初级的",
          "p": 5
        },
        {
          "w": "insight",
          "zh": "认识、洞见",
          "p": 5
        },
        {
          "w": "habitable",
          "zh": "宜居的",
          "p": 5
        },
        {
          "w": "define",
          "zh": "界定",
          "p": 5
        },
        {
          "w": "usable",
          "zh": "可利用的",
          "p": 5
        },
        {
          "w": "flow",
          "zh": "流",
          "p": 5
        },
        {
          "w": "flourish",
          "zh": "繁盛",
          "p": 5
        }
      ],
      "facts": [
        "1977年2月15日深夜，深拖摄影系统ANGUS在约2500米深处记录到持续约三分钟的温度异常；水温随后回到约2摄氏度。",
        "ANGUS共拍摄3000张照片；升温时段附近的13幅连续画面中，原本荒芜的熔岩海床突然出现大量白色蛤蜊和贻贝壳。",
        "2月17日，“阿尔文”号第713次下潜发现8摄氏度的温暖水流；最长约30厘米的蛤蜊聚集在约50米宽的区域。",
        "船上没有生物学家，额外标本曾用烈性伏特加保存；喷口水样中的硫化氢成为后来解释化能合成食物链的重要线索。",
        "依据：[WHOI：1977年热液喷口发现记录](https://www.whoi.edu/feature/history-hydrothermal-vents/discovery/1977.html)｜[WHOI：热液喷口如何改变人类对生命的认识](https://www.whoi.edu/feature/history-hydrothermal-vents/impacts/view.html)｜[NOAA：光合作用与化能合成](https://oceanexplorer.noaa.gov/ocean-fact/photochemo/)｜[USGS：1979年原始研究记录](https://www.usgs.gov/publications/submarine-thermal-springs-galapagos-rift)"
      ]
    },
    {
      "id": "03",
      "slug": "the-graph-that-changed-the-sky",
      "title": "The Graph That Changed the Sky",
      "titleZh": "改变天空的那张图",
      "standfirst": "几十年的重复测量，把南极上空看不见的损失变成了全球行动。",
      "topic": "1985 年南极臭氧洞",
      "date": "2026-08-09",
      "status": "第三篇最终锁定稿",
      "metrics": {
        "words": 255,
        "keywords": 50,
        "density": 19.6
      },
      "paras": [
        {
          "en": "At Halley, a **station** in Antarctica, scientists had **monitored** **atmospheric** **ozone** since 1956. For nearly three **decades**, a Dobson **instrument** compared ultraviolet intensities at selected wavelengths. Its **routine** **observations** formed a **baseline**: measure, record, repeat.",
          "zh": "在南极的哈雷**科研站**(station)，科学家自1956年起便持续**监测**(monitored)**大气中的**(atmospheric)**臭氧**(ozone)。近**三十年**(decades)间，一台多布森**仪器**(instrument)不断比较特定波长处的紫外光强。那些**常规的**(routine)**观测记录**(observations)构成了一条**基线**(baseline)：测量、记录、重复。"
        },
        {
          "en": "In 1982, Jonathan Shanklin **checked** old and new instruments; their **data** matched, confirming the **unexpected** result. In the Antarctic **spring** of 1984, October **measurements** of total-column ozone showed a **decline** of **approximately** 40% from the 1960s **average**. The loss mattered because stratospheric ozone absorbs harmful ultraviolet radiation. In its 16 May 1985 issue, the **journal** *Nature* **published** the **findings** of Joe Farman, Brian Gardiner and Shanklin. Calculations for 30°N predicted little change; Antarctica exposed the failed extrapolation.",
          "zh": "1982年，乔纳森·尚克林**核查了**(checked)新旧两台仪器的读数；两组**数据**(data)相互吻合，证实了那个**出乎意料的**(unexpected)结果。到1984年南极**春季**(spring)，10月的臭氧总柱量**测量结果**(measurements)显示，其数值较20世纪60年代的**平均水平**(average)**下降**(decline)了**约**(approximately)40%。这一损失之所以重要，是因为平流层臭氧能够吸收有害的紫外辐射。1985年5月16日，**期刊**(journal)《自然》**发表了**(published)乔·法曼、布赖恩·加德纳和尚克林的**研究发现**(findings)。针对北纬30度的计算只预测到轻微变化；南极的结果暴露了这种外推的错误。"
        },
        {
          "en": "Later work explained why **extreme** Antarctic **conditions** amplified damage from chlorine derived from chlorofluorocarbons (CFCs). When temperatures fell below about −78°C, **polar** stratospheric **clouds** formed. Reactions on their **particles** converted **stable** chlorine reservoirs into light-sensitive forms. Returning **sunlight** **released** **active** **chlorine** atoms, each able to **destroy** ozone **molecules** repeatedly.",
          "zh": "后续研究解释了，为什么南极的**极端**(extreme)**条件**(conditions)会让源自氯氟烃（chlorofluorocarbons，CFCs）的氯造成更严重的破坏。当温度低于约零下78摄氏度，**极地**(polar)平流层**云**(clouds)便会形成。云**粒子**(particles)表面的反应，会把原本很**稳定**(stable)、暂时封存着氯的化合物转变为对光敏感的形态。随后，重返南极的**阳光**(sunlight)会**释放出**(released)**活性**(active)**氯**(chlorine)原子；每个氯原子都能反复**破坏**(destroy)臭氧**分子**(molecules)。"
        },
        {
          "en": "In 1986, Nimbus-7 **satellite** data **confirmed** the **continental** **scale** of the loss. On 16 September 1987, **governments** **adopted** the Montreal Protocol, an **international** **agreement** to **restrict** production and consumption of ozone-depleting **substances**. It entered into **force** on 1 January 1989; later amendments tightened its controls.",
          "zh": "1986年，“Nimbus-7”**卫星**(satellite)的数据**证实**(confirmed)，臭氧损失已经达到**大陆级**(continental)**规模**(scale)。1987年9月16日，各国**政府**(governments)**通过了**(adopted)《蒙特利尔议定书》；这项**国际**(international)**协定**(agreement)旨在**限制**(restrict)消耗臭氧层**物质**(substances)的生产和消费。议定书于1989年1月1日正式**生效**(force)；后续修正案又收紧了管制。"
        },
        {
          "en": "The hole still returns each spring. With continued compliance, Antarctic ozone is **projected** to **recover** to 1980 **levels** around 2066. One graph exposed a **planetary** risk; global **cooperation** helped accelerate controls in just over two years, while **repair** of the ozone layer may remain **gradual** for about eight decades.",
          "zh": "南极臭氧洞每逢春季仍会出现。只要各国继续履约，**预计**(projected)到2066年左右，南极上空的臭氧将**恢复**(recover)到1980年的**水平**(levels)。一张图揭示了**关乎整个地球的**(planetary)风险；全球**合作**(cooperation)使管制措施在短短两年多内加速推进，而臭氧层的**修复**(repair)却可能仍要**缓慢推进**(gradual)约八十年。"
        }
      ],
      "glossary": [
        {
          "w": "station",
          "zh": "科研站",
          "p": 1
        },
        {
          "w": "monitor",
          "zh": "监测",
          "p": 1
        },
        {
          "w": "atmospheric",
          "zh": "大气中的",
          "p": 1
        },
        {
          "w": "ozone",
          "zh": "臭氧",
          "p": 1
        },
        {
          "w": "decade",
          "zh": "十年",
          "p": 1
        },
        {
          "w": "instrument",
          "zh": "仪器",
          "p": 1
        },
        {
          "w": "routine",
          "zh": "常规的",
          "p": 1
        },
        {
          "w": "observation",
          "zh": "观测记录",
          "p": 1
        },
        {
          "w": "baseline",
          "zh": "基线",
          "p": 1
        },
        {
          "w": "check",
          "zh": "核查",
          "p": 2
        },
        {
          "w": "data",
          "zh": "数据",
          "p": 2
        },
        {
          "w": "unexpected",
          "zh": "出乎意料的",
          "p": 2
        },
        {
          "w": "spring",
          "zh": "春季",
          "p": 2
        },
        {
          "w": "measurement",
          "zh": "测量结果",
          "p": 2
        },
        {
          "w": "decline",
          "zh": "下降",
          "p": 2
        },
        {
          "w": "approximately",
          "zh": "约、大约",
          "p": 2
        },
        {
          "w": "average",
          "zh": "平均水平",
          "p": 2
        },
        {
          "w": "journal",
          "zh": "期刊",
          "p": 2
        },
        {
          "w": "publish",
          "zh": "发表",
          "p": 2
        },
        {
          "w": "finding",
          "zh": "研究发现",
          "p": 2
        },
        {
          "w": "extreme",
          "zh": "极端的",
          "p": 3
        },
        {
          "w": "condition",
          "zh": "条件",
          "p": 3
        },
        {
          "w": "polar",
          "zh": "极地的",
          "p": 3
        },
        {
          "w": "cloud",
          "zh": "云",
          "p": 3
        },
        {
          "w": "particle",
          "zh": "粒子",
          "p": 3
        },
        {
          "w": "stable",
          "zh": "稳定的",
          "p": 3
        },
        {
          "w": "sunlight",
          "zh": "阳光",
          "p": 3
        },
        {
          "w": "release",
          "zh": "释放",
          "p": 3
        },
        {
          "w": "active",
          "zh": "有活性的",
          "p": 3
        },
        {
          "w": "chlorine",
          "zh": "氯",
          "p": 3
        },
        {
          "w": "destroy",
          "zh": "破坏",
          "p": 3
        },
        {
          "w": "molecule",
          "zh": "分子",
          "p": 3
        },
        {
          "w": "satellite",
          "zh": "卫星",
          "p": 4
        },
        {
          "w": "confirm",
          "zh": "证实",
          "p": 4
        },
        {
          "w": "continental",
          "zh": "大陆级的",
          "p": 4
        },
        {
          "w": "scale",
          "zh": "规模",
          "p": 4
        },
        {
          "w": "government",
          "zh": "政府",
          "p": 4
        },
        {
          "w": "adopt",
          "zh": "通过、采纳",
          "p": 4
        },
        {
          "w": "international",
          "zh": "国际的",
          "p": 4
        },
        {
          "w": "agreement",
          "zh": "协定",
          "p": 4
        },
        {
          "w": "restrict",
          "zh": "限制",
          "p": 4
        },
        {
          "w": "substance",
          "zh": "物质",
          "p": 4
        },
        {
          "w": "force",
          "zh": "生效（enter into force）",
          "p": 4
        },
        {
          "w": "project",
          "zh": "预计",
          "p": 5
        },
        {
          "w": "recover",
          "zh": "恢复",
          "p": 5
        },
        {
          "w": "level",
          "zh": "水平",
          "p": 5
        },
        {
          "w": "planetary",
          "zh": "关乎整个地球的",
          "p": 5
        },
        {
          "w": "cooperation",
          "zh": "合作",
          "p": 5
        },
        {
          "w": "repair",
          "zh": "修复",
          "p": 5
        },
        {
          "w": "gradual",
          "zh": "缓慢的、渐进的",
          "p": 5
        }
      ],
      "facts": [
        "哈雷站自1956年起持续进行臭氧观测；1982年，新旧两台多布森分光光度计的同期读数吻合，帮助排除旧仪器故障，而长期趋势来自此前累积的观测记录。",
        "1984年南极春季的臭氧总柱量较20世纪60年代水平下降约40%；Joe Farman、Brian Gardiner和Jonathan Shanklin的论文刊于1985年5月16日的《Nature》。原论文还指出，以北纬30度为基础的一维模型常被默认成全球估计，而南极观测暴露了这种外推的不足。",
        "完整的极地化学机制由后续研究逐步厘清：约−78°C以下形成极地平流层云，云粒子表面的过程使稳定的含氯储库物种转为对光敏感的形态，冬末阳光返回后开始快速破坏臭氧。",
        "1986年，Nimbus-7卫星资料确认臭氧损失具有南极大陆尺度；本文没有采用“NASA算法删除异常数据”这一被过度简化的流行说法。",
        "《蒙特利尔议定书》于1987年9月16日通过、1989年1月1日生效，并通过后续调整和修正逐步加强对消耗臭氧层物质的管制；1985年的发现加快了行动，但并不是国际政策进程的唯一开端。",
        "世界气象组织的评估带有明确条件：若现行政策继续实施，南极臭氧预计约在2066年恢复至1980年水平；单个年份的臭氧洞大小仍会受到气象条件影响。",
        "来源：[British Antarctic Survey：哈雷站长期观测与两台仪器的核验](https://www.bas.ac.uk/blogpost/seventy-years-on-the-ice-the-extraordinary-story-of-halley-research-station/)",
        "来源：[Nature：1985年臭氧洞原始论文](https://www.nature.com/articles/315207a0)",
        "来源：[NASA：臭氧研究史与1984年约40%的下降](https://acd-ext.gsfc.nasa.gov/People/Stolarski/history.html)",
        "来源：[NASA NTRS：1986年Nimbus-7卫星确认](https://ntrs.nasa.gov/citations/19870029585)",
        "来源：[British Antarctic Survey：极地平流层云、温度与阳光机制](https://www.bas.ac.uk/polar-operations/sites-and-facilities/facility/halley/dobson-spectrophotometer/)",
        "来源：[UNEP：蒙特利尔议定书的分阶段管制](https://www.unep.org/ozonaction/index.php/who-we-are/about-montreal-protocol)",
        "来源：[联合国法律资料：通过日期与生效日期](https://legal.un.org/avl/ha/vcpol/vcpol.html)",
        "来源：[世界气象组织：南极臭氧约2066年恢复至1980年水平](https://wmo.int/media/news/ozone-layer-recovery-track-helping-avoid-global-warming-05degc)"
      ]
    },
    {
      "id": "04",
      "slug": "fifteen-degrees-an-hour",
      "title": "Fifteen Degrees an Hour",
      "titleZh": "一小时，十五度",
      "standfirst": "要知道船在东西方向的位置，航海者必须把一条已知经线的时间带上船。",
      "topic": "约翰·哈里森与海上经度",
      "date": "2026-08-10",
      "status": "第四篇最终锁定稿",
      "metrics": {
        "words": 260,
        "keywords": 50,
        "density": 19.2
      },
      "paras": [
        {
          "en": "At sea, the Sun could reveal **latitude**; **longitude** required a known meridian's time. Given Earth's 24-hour **rotation**, a one-hour gap between local and **reference** time represented a 15-degree **difference** in longitude. An **accurate** clock helped **determine** a ship's east-west **position**.",
          "zh": "在海上，太阳可以帮助航海者推算**纬度**(latitude)；要确定**经度**(longitude)，则必须知道一条已知经线上的时间。地球每24小时完成一次**自转**(rotation)，因此，当地时间与**参照地**(reference)时间相差一小时，就表示两地存在15度的**经度差**(difference)。一台足够**准确的**(accurate)时钟，便能帮助航海者**确定**(determine)船只东西向的**位置**(position)。"
        },
        {
          "en": "In 1714 **Parliament** offered **rewards**—up to £20,000 for a **method** accurate within half a degree. John Harrison, a **carpenter** and **self-taught** clockmaker, pursued a **practical** **solution**: a clock that withstood **motion**, reduced **friction** and preserved **precision**. H1's 1736 Lisbon trial showed promise.",
          "zh": "1714年，英国**议会**(Parliament)设立了分级**奖金**(rewards)：若能提出一种将误差控制在半度以内的**方法**(method)，最高可获2万英镑。约翰·哈里森原是一名**木匠**(carpenter)，也是一位**自学成才的**(self-taught)制表师。他着手寻找一个**切实可行的**(practical)**解决方案**(solution)：让时钟经受住船体**摇晃**(motion)，减少**摩擦**(friction)，并保持计时**精度**(precision)。H1在1736年的里斯本试航中展现出潜力。"
        },
        {
          "en": "A **flaw** kept H2 ashore. Harrison spent 19 years **refining** H3; it fell short of the required standard. The work **produced** useful **mechanisms**, including a bimetallic strip to **compensate** for temperature **variation**. The **compact** H4, completed in 1759, resembled a pocket watch—a **departure** from H3. Its high-**frequency** balance beat five times a second, helping make H4 a **reliable** timekeeper.",
          "zh": "H2因一处**缺陷**(flaw)而始终未能出海试验。此后，哈里森用19年不断**改进**(refining)H3；它仍未达到所需标准。不过，这项研发也**产生了**(produced)实用的**机械装置**(mechanisms)，其中包括用来**补偿**(compensate)温度**变化**(variation)的双金属片。1759年完成的H4则**小巧紧凑**(compact)，外形像一只怀表——相较H3，这是一次明显的**转向**(departure)。H4摆轮以很高的**频率**(frequency)运行，每秒跳动五次，这有助于H4成为一台**可靠的**(reliable)计时器。"
        },
        {
          "en": "H4's **performance** in the 1761–62 Jamaica **trial** seemed strong, yet Port Royal's uncertain longitude made the evidence **inadequate**. H4 **satisfied** the Act's strictest **criteria** at Barbados in 1764. Payment was split in 1765: one **contingent** on **disclosure** of H4's **principles** and transfer of timekeepers for public use, the other on successful **replication**. Kendall's 1769 copy, K1, showed the design could be **shared**. In 1773 Harrison **petitioned** Parliament, which **granted** £8,750—not the formal prize.",
          "zh": "H4在1761至1762年牙买加航程中的**表现**(performance)看似出色，但由于皇家港的经度尚不确定，这次**试验**(trial)的证据仍然**不够充分**(inadequate)。1764年的巴巴多斯试验中，H4**达到了**(satisfied)法案最严格的**标准**(criteria)。1765年，款项被分成两部分：一部分能否发放，**取决于**(contingent)哈里森是否**公开**(disclosure)H4的**原理**(principles)，并把这些计时器移交供公众使用；另一部分则须等他人成功完成**复制验证**(replication)后再发放。肯德尔在1769年完成的复制品K1表明，这套设计可以**传给另一位制表师**(shared)。1773年，哈里森向议会**请愿**(petitioned)，议会随后向他**拨款**(granted)8750英镑；但这并不是正式大奖。"
        },
        {
          "en": "Early **marine** timekeepers were too **expensive** for wide use. Other makers **eventually** **simplified** them; lower **cost** brought **broader** **availability** after 1800. Harrison's **legacy** was to show a **portable** clock could carry reference time across an ocean. At local noon, its reading revealed the ship's east-west **location**.",
          "zh": "早期的**航海用**(marine)计时器价格过于**昂贵**(expensive)，难以广泛使用。后来，其他制表师**最终**(eventually)将这类计时器**简化**(simplified)；随着**成本**(cost)下降，1800年以后，它们才在**更多地方**(broader)变得**容易获得**(availability)。哈里森的**长远贡献**(legacy)，在于证明一台**便携式**(portable)时钟能够把参照时间带过大洋。到了当地正午，航海者便可根据它的读数推算船只东西向的**位置**(location)。"
        }
      ],
      "glossary": [
        {
          "w": "latitude",
          "zh": "纬度",
          "p": 1
        },
        {
          "w": "longitude",
          "zh": "经度",
          "p": 1
        },
        {
          "w": "rotation",
          "zh": "自转",
          "p": 1
        },
        {
          "w": "reference",
          "zh": "参照地、参照的",
          "p": 1
        },
        {
          "w": "difference",
          "zh": "差值、差异",
          "p": 1
        },
        {
          "w": "accurate",
          "zh": "准确的",
          "p": 1
        },
        {
          "w": "determine",
          "zh": "确定",
          "p": 1
        },
        {
          "w": "position",
          "zh": "船位、位置",
          "p": 1
        },
        {
          "w": "Parliament",
          "zh": "议会",
          "p": 2
        },
        {
          "w": "reward",
          "zh": "奖金",
          "p": 2
        },
        {
          "w": "method",
          "zh": "方法",
          "p": 2
        },
        {
          "w": "carpenter",
          "zh": "木匠",
          "p": 2
        },
        {
          "w": "self-taught",
          "zh": "自学成才的",
          "p": 2
        },
        {
          "w": "practical",
          "zh": "实用的",
          "p": 2
        },
        {
          "w": "solution",
          "zh": "解决方案",
          "p": 2
        },
        {
          "w": "motion",
          "zh": "摇晃、运动",
          "p": 2
        },
        {
          "w": "friction",
          "zh": "摩擦",
          "p": 2
        },
        {
          "w": "precision",
          "zh": "精度",
          "p": 2
        },
        {
          "w": "flaw",
          "zh": "缺陷",
          "p": 3
        },
        {
          "w": "refine",
          "zh": "改进",
          "p": 3
        },
        {
          "w": "produce",
          "zh": "产生",
          "p": 3
        },
        {
          "w": "mechanism",
          "zh": "机械装置、机械结构",
          "p": 3
        },
        {
          "w": "compensate",
          "zh": "补偿",
          "p": 3
        },
        {
          "w": "variation",
          "zh": "变化",
          "p": 3
        },
        {
          "w": "compact",
          "zh": "小巧紧凑的",
          "p": 3
        },
        {
          "w": "departure",
          "zh": "转向、背离旧方案",
          "p": 3
        },
        {
          "w": "frequency",
          "zh": "频率",
          "p": 3
        },
        {
          "w": "reliable",
          "zh": "可靠的",
          "p": 3
        },
        {
          "w": "performance",
          "zh": "表现",
          "p": 4
        },
        {
          "w": "trial",
          "zh": "海试、试验",
          "p": 4
        },
        {
          "w": "inadequate",
          "zh": "不充分的",
          "p": 4
        },
        {
          "w": "satisfy",
          "zh": "达到标准",
          "p": 4
        },
        {
          "w": "criterion",
          "zh": "标准（复数criteria）",
          "p": 4
        },
        {
          "w": "contingent",
          "zh": "取决于……的",
          "p": 4
        },
        {
          "w": "disclosure",
          "zh": "公开",
          "p": 4
        },
        {
          "w": "principle",
          "zh": "原理",
          "p": 4
        },
        {
          "w": "replication",
          "zh": "复制验证",
          "p": 4
        },
        {
          "w": "share",
          "zh": "传给他人的、共享",
          "p": 4
        },
        {
          "w": "petition",
          "zh": "请愿",
          "p": 4
        },
        {
          "w": "grant",
          "zh": "给予、拨款",
          "p": 4
        },
        {
          "w": "marine",
          "zh": "航海的",
          "p": 5
        },
        {
          "w": "expensive",
          "zh": "昂贵的",
          "p": 5
        },
        {
          "w": "eventually",
          "zh": "最终",
          "p": 5
        },
        {
          "w": "simplify",
          "zh": "简化",
          "p": 5
        },
        {
          "w": "cost",
          "zh": "成本",
          "p": 5
        },
        {
          "w": "broad",
          "zh": "更广的",
          "p": 5
        },
        {
          "w": "availability",
          "zh": "可获得性、供应情况",
          "p": 5
        },
        {
          "w": "legacy",
          "zh": "长远贡献、遗产",
          "p": 5
        },
        {
          "w": "portable",
          "zh": "便携式的、可携带的",
          "p": 5
        },
        {
          "w": "location",
          "zh": "所在位置",
          "p": 5
        }
      ],
      "facts": [
        "经度钟法比较当地太阳时与一个已知参照经线的时间；地球24小时自转360度，因此1小时对应15度、4分钟对应1度。18世纪的参照经线并非只能是后来国际统一的格林尼治本初子午线。",
        "1714年《经度法》设置分级奖金，最高2万英镑；最高档要求误差不超过半度，即法案所称30 geographical miles。本文没有把所有奖金档次写成同一门槛。",
        "H1在1736年里斯本试航的去程表现不佳，返程结果明显改善；H2因根本设计缺陷没有参加海试；哈里森随后用19年建造、试验并调整H3，双金属片是其创新之一。",
        "H4于1759年完成，外形近似大号怀表，高频摆轮每秒跳动五次。1761—1762年牙买加试验结果看似出色，但皇家港的经度本身仍未可靠确定，委员会因此不能据此完成决定性比较；1764年巴巴多斯试验后，委员会确认H4达到法案最严格标准。",
        "1765年的付款安排分成两步：一部分要求公开H4原理并移交计时器供公众使用，余款则要求其他制表师依照这些原理制造的计时器经试验达到标准。肯德尔于1769年完成K1，并在次年接受委员会检查，补上了从精巧孤品到可复制技术的关键证据。",
        "1773年，议会另行拨给哈里森8750英镑，但并非正式颁发原经度大奖。本文没有把经度委员会简化成阻挠天才的反派，也没有写成哈里森在1761年直接领取2万英镑。",
        "早期航海计时器依然昂贵；后继制表师简化设计、降低成本后，使用范围才从19世纪初逐渐扩大。因此，正文把哈里森的贡献限定为证明精确参照时间可以跨洋携带，而没有把后来的普及也完全归于他一人。",
        "来源：[英国皇家格林尼治博物馆：经度与时间差的换算原理](https://www.rmg.co.uk/stories/time/what-longitude)",
        "来源：[英国皇家格林尼治博物馆：哈里森经度计的完整历程](https://www.rmg.co.uk/stories/time/harrisons-clocks-longitude-problem)",
        "来源：[英国皇家格林尼治博物馆馆藏：H3](https://www.rmg.co.uk/collections/objects/rmgc-object-79141)",
        "来源：[英国皇家格林尼治博物馆馆藏：H4](https://www.rmg.co.uk/collections/objects/rmgc-object-79142)",
        "来源：[英国皇家格林尼治博物馆馆藏：牙买加试验与皇家港经度基准](https://www.rmg.co.uk/collections/objects/rmgc-object-540348)",
        "来源：[英国皇家格林尼治博物馆馆藏：1765年付款与复制条件原始提案](https://www.rmg.co.uk/collections/objects/rmgc-object-478820)",
        "来源：[英国皇家格林尼治博物馆馆藏：肯德尔复制的K1](https://www.rmg.co.uk/collections/objects/rmgc-object-79143)",
        "来源：[英国国家统计局：1773年8750英镑的议会追加拨款](https://blog.ons.gov.uk/2020/01/17/valuing-john-harrisons-work-how-much-is-that-20000-longitude-reward-worth-today/)",
        "来源：[剑桥大学：经度委员会档案与“孤独天才”叙事的局限](https://www.cam.ac.uk/research/news/the-longitude-problem-300-year-old-archive-opened-to-the-world)"
      ]
    },
    {
      "id": "05",
      "slug": "the-price-was-elsewhere",
      "title": "The Price Was Elsewhere",
      "titleZh": "价格在别处",
      "standfirst": "条纹里只有稳定的身份；价格留在数据库，共识把二者连接成基础设施。",
      "topic": "UPC 条形码与零售信息基础设施",
      "date": "2026-08-09",
      "status": "第五篇最终锁定稿",
      "metrics": {
        "words": 270,
        "keywords": 50,
        "density": 18.5
      },
      "paras": [
        {
          "en": "On 26 June 1974, a **cashier** at a Marsh supermarket in Troy, Ohio, passed a **humble** 67-cent pack of Wrigley’s Juicy Fruit over a Universal Product Code (UPC) **scanner**. The scanner read neither name nor price. Yet the **purchase** was **historic**: the first **retail** transaction recorded by scanning a UPC. The **invention** came earlier; **negotiation** and **coordination** made scanning **ordinary**.",
          "zh": "1974年6月26日，在俄亥俄州特洛伊市的一家Marsh超市，一名**收银员**(cashier)把一包售价67美分、**不起眼的**(humble)箭牌“黄箭”口香糖从一台通用商品代码（Universal Product Code，UPC）**扫描器**(scanner)上方划过。扫描器既没有读出商品名称，也没有读出价格；但这笔**购买**(purchase)依然**具有历史意义**(historic)：它是第一笔通过UPC扫描记录的**零售**(retail)交易。那项**发明**(invention)出现得更早；真正让扫描结账变得**平常**(ordinary)的，是行业内的**协商**(negotiation)与**协调**(coordination)。"
        },
        {
          "en": "In 1949 Norman Woodland and Bernard Silver applied for a **patent** on an **optical** system to **classify** **goods** using printed marks. The 1952 document **depicted** linear and **circular** patterns. The **concept** was **feasible** in principle but **premature**: lasers did not exist, **computing** was costly and no common code spanned the industry.",
          "zh": "1949年，诺曼·伍德兰和伯纳德·西尔弗为一套**光学**(optical)系统申请了**专利**(patent)；这套系统利用印刷标记来**分类**(classify)**商品**(goods)。1952年的专利文件**描绘了**(depicted)直线和**圆形**(circular)图案。这一**构想**(concept)在原理上**可行**(feasible)，却**为时过早**(premature)：当时激光尚未问世，**计算技术**(computing)成本高昂，行业也没有通用代码。"
        },
        {
          "en": "By 1970 grocers had agreed on a product code but not a machine-readable **symbol**. IBM **engineer** George Laurer’s team proposed **vertical** bars because a bull’s-eye was **vulnerable** to ink spread. A **committee** **selected** IBM’s **proposal** in 1973. The UPC-A **format** turned a 12-**digit** **identifier** into geometry; the final figure helped catch misreads.",
          "zh": "到1970年，食品零售商已经就商品代码达成一致，却还没有共同认可的机器可读**符号**(symbol)。IBM**工程师**(engineer)乔治·劳雷尔带领的团队提出使用**纵向的**(vertical)条纹，因为靶心图案**容易受油墨扩散影响**(vulnerable)。1973年，一个行业**委员会**(committee)**选中了**(selected)IBM的**方案**(proposal)。UPC-A的**格式**(format)把一个12**位**(digit)**识别码**(identifier)转化为几何图形；末位数字则帮助发现误读。"
        },
        {
          "en": "In Troy, a **mirror** swept a **laser** **beam** over the label. A photodiode **detector** measured the **reflected** light; the system **translated** bar-and-space **widths** into a number.",
          "zh": "在特洛伊的那套设备中，一面**反射镜**(mirror)使**激光器**(laser)发出的**光束**(beam)扫过标签。一只光电二极管**探测器**(detector)测量标签**反射的**(reflected)光；系统再把条纹与间隙的**宽度**(widths)**转换成**(translated)编号。"
        },
        {
          "en": "The gum’s code carried neither **description** nor price. A database **provided** both, allowing price changes without reprinting packages. Each sale could update **inventory**. Machinery alone was no system. Stores **maintained** records, **vendors** built **compatible** readers and manufacturers printed codes. A **proprietary** system might serve one chain; **infrastructure** required **competitors** to follow one **specification** within an industry-wide numbering system. At checkout, the system’s **elegance** was **apparent** and the **consensus** behind it invisible: the bars held the number, while the price was elsewhere.",
          "zh": "这包口香糖的代码既不含商品**描述**(description)，也不含价格；两者由数据库**提供**(provided)，因此改价无需重印包装。系统还可根据每笔交易更新**库存**(inventory)。但机器本身还称不上一个系统。商店**维护**(maintained)商品记录，设备**供应商**(vendors)制造与统一编码**兼容的**(compatible)读取器，制造商则印上代码。一套**专有的**(proprietary)系统或许能服务一家连锁企业；要让它成为**基础设施**(infrastructure)，彼此**竞争的企业**(competitors)就必须遵循同一套**规范**(specification)，并使用行业统一的编号体系。到了收银台前，系统的**精巧之处**(elegance)**显而易见**(apparent)，支撑它的行业**共识**(consensus)却藏在幕后：线条里存着编号，价格则在别处。"
        }
      ],
      "glossary": [
        {
          "w": "cashier",
          "zh": "收银员",
          "p": 1
        },
        {
          "w": "humble",
          "zh": "不起眼的",
          "p": 1
        },
        {
          "w": "scanner",
          "zh": "扫描器",
          "p": 1
        },
        {
          "w": "purchase",
          "zh": "购买",
          "p": 1
        },
        {
          "w": "historic",
          "zh": "具有历史意义的",
          "p": 1
        },
        {
          "w": "retail",
          "zh": "零售的、零售业",
          "p": 1
        },
        {
          "w": "invention",
          "zh": "发明",
          "p": 1
        },
        {
          "w": "negotiation",
          "zh": "协商",
          "p": 1
        },
        {
          "w": "coordination",
          "zh": "协调",
          "p": 1
        },
        {
          "w": "ordinary",
          "zh": "平常的",
          "p": 1
        },
        {
          "w": "patent",
          "zh": "专利",
          "p": 2
        },
        {
          "w": "optical",
          "zh": "光学的",
          "p": 2
        },
        {
          "w": "classify",
          "zh": "分类",
          "p": 2
        },
        {
          "w": "goods",
          "zh": "商品",
          "p": 2
        },
        {
          "w": "depict",
          "zh": "描绘",
          "p": 2
        },
        {
          "w": "circular",
          "zh": "圆形的",
          "p": 2
        },
        {
          "w": "concept",
          "zh": "构想",
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
          "zh": "计算技术、算力",
          "p": 2
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
          "w": "vertical",
          "zh": "纵向的",
          "p": 3
        },
        {
          "w": "vulnerable",
          "zh": "容易受……影响的",
          "p": 3
        },
        {
          "w": "committee",
          "zh": "委员会",
          "p": 3
        },
        {
          "w": "select",
          "zh": "选中",
          "p": 3
        },
        {
          "w": "proposal",
          "zh": "方案",
          "p": 3
        },
        {
          "w": "format",
          "zh": "格式",
          "p": 3
        },
        {
          "w": "digit",
          "zh": "位、数字位",
          "p": 3
        },
        {
          "w": "identifier",
          "zh": "识别码",
          "p": 3
        },
        {
          "w": "mirror",
          "zh": "反射镜",
          "p": 4
        },
        {
          "w": "laser",
          "zh": "激光器",
          "p": 4
        },
        {
          "w": "beam",
          "zh": "光束",
          "p": 4
        },
        {
          "w": "detector",
          "zh": "探测器",
          "p": 4
        },
        {
          "w": "reflect",
          "zh": "反射",
          "p": 4
        },
        {
          "w": "translate",
          "zh": "转换",
          "p": 4
        },
        {
          "w": "width",
          "zh": "宽度",
          "p": 4
        },
        {
          "w": "description",
          "zh": "描述",
          "p": 5
        },
        {
          "w": "provide",
          "zh": "提供",
          "p": 5
        },
        {
          "w": "inventory",
          "zh": "库存",
          "p": 5
        },
        {
          "w": "maintain",
          "zh": "维护",
          "p": 5
        },
        {
          "w": "vendor",
          "zh": "供应商",
          "p": 5
        },
        {
          "w": "compatible",
          "zh": "兼容的",
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
          "w": "competitor",
          "zh": "竞争对手、彼此竞争的企业",
          "p": 5
        },
        {
          "w": "specification",
          "zh": "规范",
          "p": 5
        },
        {
          "w": "elegance",
          "zh": "精巧之处",
          "p": 5
        },
        {
          "w": "apparent",
          "zh": "显而易见的",
          "p": 5
        },
        {
          "w": "consensus",
          "zh": "共识",
          "p": 5
        }
      ],
      "facts": [
        "1974年6月26日，俄亥俄州特洛伊市的Marsh超市启用了首批UPC扫描器；一包售价67美分的Wrigley’s Juicy Fruit口香糖成为第一笔由UPC读取的零售购买。本文没有把它写成“人类第一次扫描条形码”，因为其他自动识别系统此前已经投入试验。",
        "Norman Joseph Woodland与Bernard Silver于1949年申请、1952年10月7日获授美国专利2,612,994。专利同时描述了直线与同心圆图样；它是条形码的早期基础概念，并非1973年最终采用的UPC本身。",
        "到1970年，美国食品零售业已经先行确定一套十位商品编号，随后才征求把编号交给机器读取的统一符号。1973年的精确采用日期在IBM与GS1资料间略有差异，因此正文只写年份。入选的矩形符号由George Laurer领导的IBM团队开发，选择与标准化则由行业委员会完成。",
        "UPC-A承载12位GTIN-12商品识别码，末位是按前11位计算得出的校验位。它能帮助发现误读，但不能保证识别所有错误，也不是单件商品的序列号。",
        "特洛伊市首批设备由Spectra Physics提供激光扫描器、NCR提供计算机收银机。激光经旋转镜面扫过标签，反射光由光电二极管检测，收银系统再到存储的商品数据库中检索信息；本文没有把整套结账硬件归功于IBM。",
        "UPC通常只编码稳定的商品标识，不直接存放商品名称或价格；这些可变信息由零售商的数据库返回，因此改价不必重印商品代码。销售记录可以支持库存管理，但这一收益依赖制造商、零售商与设备商逐步采用同一规范，并非1974年一次扫描就立即实现。",
        "跨企业通用还需要统一的编号管理。Uniform Product Code Council于1974年被指定管理这一体系，后来才更名为Uniform Code Council；正文将这一点概括为“行业统一的编号体系”，没有把商品编号全部归于单一机构，也没有把基础设施归结为某一种条纹图案或某一家公司的单独发明。",
        "来源：[美国国家历史博物馆：1974年首批超市扫描器、光路、数据库与设备归属](https://americanhistory.si.edu/collections/object/nmah_892778)",
        "来源：[IBM：UPC发展史、George Laurer团队与67美分口香糖](https://www.ibm.com/history/upc)",
        "来源：[IBM：先统一商品编号、再征求机器可读符号的零售结账系统史](https://www.ibm.com/history/point-of-sale)",
        "来源：[IBM：George Laurer与入选的矩形UPC方案](https://www.ibm.com/history/george-laurer)",
        "来源：[美国专利2,612,994原件：1949年申请、1952年授权及两类图样](https://patents.google.com/patent/US2612994A/en)",
        "来源：[美国国家历史博物馆：Woodland档案与1970—1973年行业标准化过程](https://www.americanhistory.si.edu/pt/collections/archival-item/sova-nmah-ac-1433-ref17)",
        "来源：[GS1 US：GTIN-12的前11位与校验位](https://www.help.gs1us.org/check-digit-calculator)",
        "来源：[GS1：UPC是12位商品识别码](https://support.gs1.org/support/solutions/articles/43000734124-what-is-the-difference-between-a-gs1-gtin-a-barcode-an-ean-and-a-upc-)",
        "来源：[GS1：商品名称与价格通常不在条形码中](https://support.gs1.org/support/solutions/articles/43000734158-are-the-description-and-price-of-the-item-included-in-the-barcode-)",
        "来源：[GS1体系架构：实体承载识别键，相关数据在数字系统中关联](https://www.gs1.org/standards/gs1-system-architecture-document/current-standard)",
        "来源：[GS1历史时间线：1974年任命统一商品代码体系的管理机构](https://support.gs1.org/support/solutions/articles/43000734073-gs1-historical-timeline)"
      ]
    }
  ]
};
