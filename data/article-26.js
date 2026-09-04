(function () {
  const SITE = (window.SITE = window.SITE || {});
  const ARTICLES = (SITE.ARTICLES = SITE.ARTICLES || []);
  ARTICLES.push(...[
    {
      "id": "26",
      "slug": "the-image-arrived-two-days-later",
      "title": "The Image Arrived Two Days Later",
      "titleZh": "图像两天后才出现",
      "standfirst": "CT真正改变的不是X射线本身，而是如何把许多方向上的不完整测量重建成一张切片。1971年首位患者扫描结束后，图像还不存在；数据送去计算，两天后，病灶的位置才真正显现。",
      "topic": "1957—1979年Cormack、Hounsfield与计算机断层成像：从线积分到临床CT重建",
      "date": "2026-08-23",
      "status": "第二十六篇最终精进锁定稿",
      "metrics": {
        "words": 266,
        "keywords": 50,
        "density": 18.8
      },
      "paras": [
        {
          "en": "Before CT, an X-ray image compressed depth onto film. Bone and soft tissue were **stacked** by superimposition; one structure could **mask** another. Film recorded **attenuation** as losses **accumulated** along each beam, but left their depth **ambiguous**. Computed **tomography** changed the question: gather **projections** from different directions, then **deduce** a **cross-section**—a **slice**.",
          "zh": "CT 出现之前，一张 X 光片会把深度压到同一平面。骨骼与软组织**堆叠**(stacked)在一起、因影像叠加而重合，一个结构可能**遮住**(mask)另一个。胶片记录的是沿每一束射线不断**累积**(accumulated)的**衰减**(attenuation)，却无法判断这些损失来自哪一深度，位置仍然**含混**(ambiguous)。计算机**断层成像**(tomography)改变了问题：从不同方向收集**投影**(projections)，再**推导出**(deduce)一个**横断面**(cross-section)——一**片**(slice)断层图。"
        },
        {
          "en": "Around 1957, Cormack recast imaging as mathematics. Line **integrals** could recover spatial **variation** in the attenuation **coefficient**. He **devised** a **formulation**, published in 1963–64, knowing nothing of Radon’s **theorem** until afterwards. At EMI, Hounsfield **separately** developed an **instrument**. Their contributions were **complementary**, without settling every claim to **precedence**.",
          "zh": "约在 1957 年，科马克把成像重新表述为一个数学问题。若知道一组直线**积分**(integrals)，就能恢复衰减**系数**(coefficient)在空间中的**变化**(variation)。他**设计出**(devised)一套**数学表述**(formulation)，1963—64 年发表时并不知道拉东**定理**(theorem)，后来才读到。在 EMI 公司，豪斯菲尔德则**另行**(separately)开发一套**仪器**(instrument)。两人的贡献彼此**互补**(complementary)，却没有因此裁定历史上所有关于**优先权**(precedence)的主张。"
        },
        {
          "en": "Hounsfield’s **prototype** turned mathematics into measurement. A source and **detector** completed a **traverse**, **rotated** one degree, then repeated both moves. Each pass was **digitised**; **sampling** populated a data **matrix**. His bench system needed nine days for 28,000 readings. The clinical scanner later acquired two slices in five minutes; **iterative** **computation** then ran on an off-site **mainframe**.",
          "zh": "豪斯菲尔德的**原型机**(prototype)把数学变成测量。射线源和**探测器**(detector)完成一次直线**横移**(traverse)，再**旋转**(rotated)一度，随后把这两个动作重复下去。每一轮读数都被**数字化**(digitised)；**采样**(sampling)数据被填入一个**矩阵**(matrix)。他的实验台装置为 28,000 次读数花了 9 天。后来的临床扫描仪采集两个切片约需 5 分钟；**迭代式**(iterative)**计算**(computation)则在院外的**大型主机**(mainframe)上运行。"
        },
        {
          "en": "On 1 October 1971, radiologist James Ambrose scanned a patient with a suspected **intracranial** tumour. Two days later, reconstruction revealed a cystic frontal-lobe mass. Its **localisation** was clear; subsequent scans distinguished soft tissue, **haemorrhage** and **lesions** within the skull. Density **discrimination** offset modest spatial **resolution**. For a **radiologist**, CT turned the **brain** into a **non-invasive** **diagnostic** map.",
          "zh": "1971 年 10 月 1 日，放射科医生詹姆斯·安布罗斯为一名疑似**颅内**(intracranial)肿瘤患者做扫描。两天后，重建图像显示额叶一个囊性肿块，**定位**(localisation)十分清楚。随后的扫描能够在颅骨内区分软组织、**出血**(haemorrhage)和其他**病灶**(lesions)。密度**鉴别能力**(discrimination)弥补了空间**分辨率**(resolution)并不高的不足。对**放射科医生**(radiologist)而言，CT 把**大脑**(brain)变成一张**无创的**(non-invasive)**诊断**(diagnostic)地图。"
        },
        {
          "en": "The image was a **reconstruction**: an **algorithm** combined measurements according to **acquisition** geometry. Commercial systems replaced **iteration** with faster **convolution** **back-projection**. Each **pixel** encoded density as a numerical **index**. Those two days solved an **inverse** problem: external measurements revealed internal structure. That **synthesis** mattered—no single ray showed the tumour; together, rays made location calculable.",
          "zh": "图像是一种**重建**(reconstruction)：一个**算法**(algorithm)按照**采集**(acquisition)几何关系组合测量值。商业系统后来用更快的**卷积**(convolution)**反投影**(back-projection)取代了**迭代法**(iteration)。每个**像素**(pixel)都把密度编码成一个数值**指标**(index)。那两天里解开的是一个**逆问题**(inverse)：从体外测量反推出内部结构。真正关键的是这种**综合**(synthesis)——没有任何一束射线能够单独显示肿瘤；把所有射线合在一起，它的位置才变得可计算。"
        }
      ],
      "glossary": [
        {
          "w": "stacked",
          "zh": "堆叠",
          "p": 1
        },
        {
          "w": "mask",
          "zh": "遮住；掩蔽",
          "p": 1
        },
        {
          "w": "attenuation",
          "zh": "衰减",
          "p": 1
        },
        {
          "w": "accumulate",
          "zh": "累积；积聚",
          "p": 1
        },
        {
          "w": "ambiguous",
          "zh": "含混的；不明确的",
          "p": 1
        },
        {
          "w": "tomography",
          "zh": "断层成像；断层摄影",
          "p": 1
        },
        {
          "w": "projection",
          "zh": "投影；投射",
          "p": 1
        },
        {
          "w": "deduce",
          "zh": "推导；推断",
          "p": 1
        },
        {
          "w": "cross-section",
          "zh": "横断面；剖面",
          "p": 1
        },
        {
          "w": "slice",
          "zh": "片；切片",
          "p": 1
        },
        {
          "w": "integral",
          "zh": "积分；完整的",
          "p": 2
        },
        {
          "w": "variation",
          "zh": "变化；变异",
          "p": 2
        },
        {
          "w": "coefficient",
          "zh": "系数",
          "p": 2
        },
        {
          "w": "devise",
          "zh": "设计；想出",
          "p": 2
        },
        {
          "w": "formulation",
          "zh": "表述；公式化",
          "p": 2
        },
        {
          "w": "theorem",
          "zh": "定理",
          "p": 2
        },
        {
          "w": "separately",
          "zh": "另行；分别地",
          "p": 2
        },
        {
          "w": "instrument",
          "zh": "仪器；工具",
          "p": 2
        },
        {
          "w": "complementary",
          "zh": "互补的；相辅相成的",
          "p": 2
        },
        {
          "w": "precedence",
          "zh": "优先权；先后次序",
          "p": 2
        },
        {
          "w": "prototype",
          "zh": "原型机；原型",
          "p": 3
        },
        {
          "w": "detector",
          "zh": "探测器；检测器",
          "p": 3
        },
        {
          "w": "traverse",
          "zh": "横移；横穿",
          "p": 3
        },
        {
          "w": "rotate",
          "zh": "旋转；转动",
          "p": 3
        },
        {
          "w": "digitise",
          "zh": "数字化",
          "p": 3
        },
        {
          "w": "sampling",
          "zh": "采样；抽样",
          "p": 3
        },
        {
          "w": "matrix",
          "zh": "矩阵；基体",
          "p": 3
        },
        {
          "w": "iterative",
          "zh": "迭代的；反复改进的",
          "p": 3
        },
        {
          "w": "computation",
          "zh": "计算；运算",
          "p": 3
        },
        {
          "w": "mainframe",
          "zh": "大型主机",
          "p": 3
        },
        {
          "w": "intracranial",
          "zh": "颅内的",
          "p": 4
        },
        {
          "w": "localisation",
          "zh": "定位；局部化",
          "p": 4
        },
        {
          "w": "haemorrhage",
          "zh": "出血；大出血",
          "p": 4
        },
        {
          "w": "lesion",
          "zh": "病灶；损伤",
          "p": 4
        },
        {
          "w": "discrimination",
          "zh": "鉴别能力；辨别",
          "p": 4
        },
        {
          "w": "resolution",
          "zh": "分辨率；解决",
          "p": 4
        },
        {
          "w": "radiologist",
          "zh": "放射科医生",
          "p": 4
        },
        {
          "w": "brain",
          "zh": "大脑",
          "p": 4
        },
        {
          "w": "non-invasive",
          "zh": "无创的；非侵入性的",
          "p": 4
        },
        {
          "w": "diagnostic",
          "zh": "诊断的；诊断性的",
          "p": 4
        },
        {
          "w": "reconstruction",
          "zh": "重建；重构",
          "p": 5
        },
        {
          "w": "algorithm",
          "zh": "算法",
          "p": 5
        },
        {
          "w": "acquisition",
          "zh": "采集；获取",
          "p": 5
        },
        {
          "w": "iteration",
          "zh": "迭代法",
          "p": 5
        },
        {
          "w": "convolution",
          "zh": "卷积；盘绕",
          "p": 5
        },
        {
          "w": "back-projection",
          "zh": "反投影",
          "p": 5
        },
        {
          "w": "pixel",
          "zh": "像素",
          "p": 5
        },
        {
          "w": "index",
          "zh": "指标；指数",
          "p": 5
        },
        {
          "w": "inverse",
          "zh": "逆向的；相反的",
          "p": 5
        },
        {
          "w": "synthesis",
          "zh": "综合；合成",
          "p": 5
        }
      ],
      "facts": [
        "Cormack约在1957年开始研究如何由X射线线积分恢复截面内的衰减信息，并于1963、1964年发表关键论文；他后来回忆，自己多年后才知道Radon在1917年发表的更一般数学结果。[Nobel Prize：Allan M. Cormack – Facts](https://www.nobelprize.org/prizes/medicine/1979/cormack/facts/)",
        "Hounsfield在EMI独立推进工程实现，把多角度X射线测量、数字计算和断层重建结合成可用于临床的系统。1979年诺贝尔生理学或医学奖由Cormack与Hounsfield共同获得，授奖理由为‘for the development of computer assisted tomography’。[Nobel Prize 1979](https://www.nobelprize.org/prizes/medicine/1979/summary/)",
        "Hounsfield早期实验装置为了约28,000次测量需要约9天；后来的临床原型机完成两个切片的采集约需5分钟。早期临床数据还需要送往院外大型主机进行重建。[Nobel Prize：The Nobel Prize in Physiology or Medicine 1979 – Perspectives](https://www.nobelprize.org/prizes/medicine/1979/perspectives/)",
        "1971年10月1日，James Ambrose为首位患者完成头部CT扫描。由于重建计算不在扫描现场完成，他两天后才看到图像；图像显示额叶囊性病变，随后获得手术证实。[Nobel Prize 1979 Perspectives](https://www.nobelprize.org/prizes/medicine/1979/perspectives/)",
        "早期CT使用迭代方法重建图像，商业系统随后采用速度更快的convolution/back-projection一类方法。CT的核心不是某一束X射线直接形成切片，而是由多方向测量求解一个逆问题。[PMC：Computed tomography—old ideas and new technology](https://pmc.ncbi.nlm.nih.gov/articles/PMC8555965/)",
        "**已核（2026-08-20 逐条上网）**：核心事实全部无误——1971年10月1日在伦敦 Atkinson Morley 医院，放射科医师詹姆斯·安布罗斯用 EMI 原型头颅扫描仪为一名疑似额叶肿瘤的女患者完成首次临床 CT；**「两天后」有确切来源**：拉斯克基金会记载，两人把数据送往伦敦另一头 EMI 的主机计算，10月3日结果送回医院时，二人「像刚踢进制胜球的球员一样跳了起来」，亨斯菲尔德写道「额叶正中有一个漂亮的圆形囊肿」，手术证实为囊性肿瘤。科马克 1950 年代把成像重述为数学问题、1963—64 年发表其解法且当时不知拉东定理，亦经核实。\n**一处分歧已核**：BMJ 讣告记为「1971年9月」，而 impactscan、EBSCO、AuntMinnie、Radiology、JMI 五处一致为 **10月1日**。本文取多数。[Lasker Foundation：Looking Deep into the Body](https://laskerfoundation.org/looking-deep-into-the-body/)｜[impactscan：A brief history of CT](http://www.impactscan.org/CThistory.htm)｜[Radiology：Milestones in CT](https://pubs.rsna.org/doi/full/10.1148/radiol.230803)",
        "**已核（2026-08-20 极限轮）· 事实全对，一处两说存照**：\n**无误五项**：实验台系统采数 **九天**（EBSCO 与 arXiv 均载「nine days for data collection, 2½ hours for reconstruction」）；临床原型机 **一度一转的平移—旋转**；EMI Mark I **双探测器同时采两层**，故「两层五分钟」无误（另有来源作「每层四分钟」，同一事实的两种表述）；**1971年10月1日詹姆斯·安布罗斯扫描首位病人**（41岁女性，疑似额叶肿瘤）；**两天后**磁带送回 EMI 主机重建，显示**左额叶囊性肿瘤**（安布罗斯回忆二人「像刚进制胜球的足球运动员一样跳起来」）。\n**一处两说并存，且出自发明人本人**：霍斯菲尔德 1979 年诺贝尔演讲原文写作「**In 1972** the first patient was scanned by this machine」，而 AuntMinnie、AAPM、Lasker 基金会、诺奖官网 Perspectives 等几乎所有来源均作 **1971年10月1日**。**本文取 1971年10月1日**（多数来源与馆藏记录一致）；发明人自述的 1972 疑为笔误或指例行扫描起始年。[Hounsfield 诺贝尔演讲原文 PDF](https://www.nobelprize.org/uploads/2018/06/hounsfield-lecture.pdf)｜[AuntMinnie Europe：CT's origins](https://www.auntminnieeurope.com/clinical-news/article/15643429/cts-origins-hold-relevance-for-todays-users)｜[Lasker Foundation：Looking Deep into the Body](https://laskerfoundation.org/looking-deep-into-the-body/)",
        "**★★ 审读团（2026-09-04，人读，见 notes/审读-26.md）**：一处 A——§2 两句重复说 Radon 定理，合并。B：with a suspected 补冠词；中文人名音译；数字空格。",
        "**★★ 中文审读团两遍（见 notes/中文审读-26.md）**：零 A。B：「为了 28,000 次读数需要 9 天」改「为 28,000 次读数花了 9 天」；CT／X 光空格。"
      ]
    }
  ]);
})();
