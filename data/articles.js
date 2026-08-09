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
          en: "On 8 September the **parish** **removed** the pump **handle**. The **outbreak** was already **fading** and the **gesture** **altered** little; the board had not **accepted** his **explanation**, only his **advice**. Snow died in 1858 with the **profession** still **unconvinced**. He had **demonstrated** something more useful than a **proof**: that when being wrong costs a handle and being right saves a street, **certainty** is the wrong thing to wait for.",
          zh: "9月8日，**教区**(parish)**拆除**(removed)了水泵的**手柄**(handle)。这场**疫情**(outbreak)本已在**消退**(fading)，这一**举措**(gesture)**改变**(altered)甚微；委员会并未**接受**(accepted)他的**解释**(explanation)，只接受了他的**建议**(advice)。1858年斯诺去世时，整个**医界**(profession)仍**未被说服**(unconvinced)。而他已经**证明**(demonstrated)了一件比**证明**(proof)本身更有用的事：当猜错了不过是搭上一根手柄、而猜对了能救下一整条街，**确定性**(certainty)就不是那个值得等的东西。"
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
        { w: "explanation", zh: "解释",     p: 4 },
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
        "斯诺 1858 年去世，病菌说数十年后才被接受。"
      ]
    }
  ]
};
