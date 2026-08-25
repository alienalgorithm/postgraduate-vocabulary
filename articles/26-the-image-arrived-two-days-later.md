# 26 · The Image Arrived Two Days Later

> 题材：1957—1979年Cormack、Hounsfield与计算机断层成像：从线积分到临床CT重建
> 状态：**第二十六篇最终精进锁定稿**（2026-08-23）
> 指标：266 词 / 50 重点词 / 密度 18.8%
> CT真正改变的不是X射线本身，而是如何把许多方向上的不完整测量重建成一张切片。1971年首位患者扫描结束后，图像还不存在；数据送去计算，两天后，病灶的位置才真正显现。

---

## 英文正文

Before CT, an X-ray image compressed depth onto film. Bone and soft tissue were stacked by **superimposition**; one structure could **mask** another. Film recorded **attenuation** as losses **accumulated** along each beam, but left their depth **ambiguous**. Computed **tomography** changed the question: gather **projections** from different directions, then **deduce** a **cross-section**—a **tomogram**.

Around 1957, Cormack recast imaging as mathematics. Line **integrals** could recover spatial **variation** in the attenuation **coefficient**. He **devised** a **formulation** published in 1963–64 without knowing Radon’s **theorem**. The physicist encountered Radon’s work later. At EMI, Hounsfield **separately** developed an **instrument**. Their contributions were **complementary**, without settling every claim to **precedence**.

Hounsfield’s **prototype** turned mathematics into measurement. A source and **detector** completed a **traverse**, **rotated** one degree, then repeated it. Each pass was **digitised**; **sampling** populated a data **matrix**. His bench system needed nine days for 28,000 readings. The clinical scanner later acquired two slices in five minutes; **iterative** **computation** then ran on an off-site **mainframe**.

On 1 October 1971, radiologist James Ambrose scanned a patient with suspected **intracranial** tumour. Two days later, reconstruction revealed a cystic frontal-lobe mass. Its **localisation** was clear; subsequent scans distinguished soft tissue, **haemorrhage** and **lesions** within the skull. Density **discrimination** offset modest spatial **resolution**. For a **radiologist**, CT turned **neuroanatomy** into a **non-invasive** **diagnostic** map.

The image was a **reconstruction**: an **algorithm** combined measurements according to **acquisition** geometry. Commercial systems replaced iteration with faster **convolution** **back-projection**. Each **pixel** encoded **radiodensity** as a numerical **index**. Those two days solved an **inverse** problem: external measurements revealed internal structure. That **synthesis** mattered—no single ray showed the tumour; together, rays made location calculable.

---

## 中文译文

> 铁律：英文加粗词在中文里对应的译法同样加粗，后附 `(english)` 括注词源。
> 中文按最自然的说法写，加粗落在自然说法上——不为对齐扭曲句法。

CT出现之前，一张X光片会把深度压到同一平面。骨骼与软组织因**影像叠加**(superimposition)重合，一个结构可能**遮住**(mask)另一个。胶片记录的是沿每一束射线不断**累积**(accumulated)的**衰减**(attenuation)，却无法判断这些损失来自哪一深度，位置仍然**含混**(ambiguous)。计算机**断层成像**(tomography)改变了问题：从不同方向收集**投影**(projections)，再**推导出**(deduce)一个**横断面**(cross-section)——一幅**断层图**(tomogram)。

约在1957年，Cormack把成像重新表述为一个数学问题。若知道一组直线**积分**(integrals)，就能恢复衰减**系数**(coefficient)在空间中的**变化**(variation)。他**设计出**(devised)一套**数学表述**(formulation)，1963—64年发表时并不知道Radon**定理**(theorem)。后来，这位物理学家才接触到Radon的工作。在EMI，Hounsfield则**另行**(separately)开发一套**仪器**(instrument)。两人的贡献彼此**互补**(complementary)，却没有因此裁定历史上所有关于**优先权**(precedence)的主张。

Hounsfield的**原型机**(prototype)把数学变成测量。射线源和**探测器**(detector)完成一次直线**横移**(traverse)，再**旋转**(rotated)一度，随后重复。每一轮读数都被**数字化**(digitised)；**采样**(sampling)数据被填入一个**矩阵**(matrix)。他的实验台装置为了28,000次读数需要9天。后来的临床扫描仪采集两个切片约需5分钟；**迭代式**(iterative)**计算**(computation)则在院外的**大型主机**(mainframe)上运行。

1971年10月1日，放射科医生James Ambrose为一名疑似**颅内**(intracranial)肿瘤患者做扫描。两天后，重建图像显示额叶一个囊性肿块，**定位**(localisation)十分清楚。随后的扫描能够在颅骨内区分软组织、**出血**(haemorrhage)和其他**病灶**(lesions)。密度**鉴别能力**(discrimination)弥补了空间**分辨率**(resolution)并不高的不足。对**放射科医生**(radiologist)而言，CT把**神经解剖结构**(neuroanatomy)变成一张**无创的**(non-invasive)**诊断**(diagnostic)地图。

图像是一种**重建**(reconstruction)：一个**算法**(algorithm)按照**采集**(acquisition)几何关系组合测量值。商业系统后来用更快的**卷积**(convolution)**反投影**(back-projection)取代迭代法。每个**像素**(pixel)都把**放射密度**(radiodensity)编码成一个数值**指标**(index)。那两天里解开的是一个**逆问题**(inverse)：从体外测量反推出内部结构。真正关键的是这种**综合**(synthesis)——没有任何一束射线能够单独显示肿瘤；把所有射线合在一起，它的位置才变得可计算。

---

## 50 词速查表

**§1**（10词）superimposition 影像叠加；叠置｜mask 遮住；掩蔽｜attenuation 衰减｜accumulate 累积；积聚｜ambiguous 含混的；不明确的｜tomography 断层成像；断层摄影｜projection 投影；投射｜deduce 推导；推断｜cross-section 横断面；剖面｜tomogram 断层图；断层影像

**§2**（10词）integral 积分；完整的｜variation 变化；变异｜coefficient 系数｜devise 设计；想出｜formulation 表述；公式化｜theorem 定理｜separately 另行；分别地｜instrument 仪器；工具｜complementary 互补的；相辅相成的｜precedence 优先权；先后次序

**§3**（10词）prototype 原型机；原型｜detector 探测器；检测器｜traverse 横移；横穿｜rotate 旋转；转动｜digitise 数字化｜sampling 采样；抽样｜matrix 矩阵；基体｜iterative 迭代的；反复改进的｜computation 计算；运算｜mainframe 大型主机

**§4**（10词）intracranial 颅内的｜localisation 定位；局部化｜haemorrhage 出血；大出血｜lesion 病灶；损伤｜discrimination 鉴别能力；辨别｜resolution 分辨率；解决｜radiologist 放射科医生｜neuroanatomy 神经解剖结构；神经解剖学｜non-invasive 无创的；非侵入性的｜diagnostic 诊断的；诊断性的

**§5**（10词）reconstruction 重建；重构｜algorithm 算法｜acquisition 采集；获取｜convolution 卷积；盘绕｜back-projection 反投影｜pixel 像素｜radiodensity 放射密度；X射线密度｜index 指标；指数｜inverse 逆向的；相反的｜synthesis 综合；合成

---

## 史实核对

以下关键信息已据所列来源核对：

- Cormack约在1957年开始研究如何由X射线线积分恢复截面内的衰减信息，并于1963、1964年发表关键论文；他后来回忆，自己多年后才知道Radon在1917年发表的更一般数学结果。[Nobel Prize：Allan M. Cormack – Facts](https://www.nobelprize.org/prizes/medicine/1979/cormack/facts/)
- Hounsfield在EMI独立推进工程实现，把多角度X射线测量、数字计算和断层重建结合成可用于临床的系统。1979年诺贝尔生理学或医学奖由Cormack与Hounsfield共同获得，授奖理由为‘for the development of computer assisted tomography’。[Nobel Prize 1979](https://www.nobelprize.org/prizes/medicine/1979/summary/)
- Hounsfield早期实验装置为了约28,000次测量需要约9天；后来的临床原型机完成两个切片的采集约需5分钟。早期临床数据还需要送往院外大型主机进行重建。[Nobel Prize：The Nobel Prize in Physiology or Medicine 1979 – Perspectives](https://www.nobelprize.org/prizes/medicine/1979/perspectives/)
- 1971年10月1日，James Ambrose为首位患者完成头部CT扫描。由于重建计算不在扫描现场完成，他两天后才看到图像；图像显示额叶囊性病变，随后获得手术证实。[Nobel Prize 1979 Perspectives](https://www.nobelprize.org/prizes/medicine/1979/perspectives/)
- 早期CT使用迭代方法重建图像，商业系统随后采用速度更快的convolution/back-projection一类方法。CT的核心不是某一束X射线直接形成切片，而是由多方向测量求解一个逆问题。[PMC：Computed tomography—old ideas and new technology](https://pmc.ncbi.nlm.nih.gov/articles/PMC8555965/)
- **已核（2026-08-20 逐条上网）**：核心事实全部无误——1971年10月1日在伦敦 Atkinson Morley 医院，放射科医师詹姆斯·安布罗斯用 EMI 原型头颅扫描仪为一名疑似额叶肿瘤的女患者完成首次临床 CT；**「两天后」有确切来源**：拉斯克基金会记载，两人把数据送往伦敦另一头 EMI 的主机计算，10月3日结果送回医院时，二人「像刚踢进制胜球的球员一样跳了起来」，亨斯菲尔德写道「额叶正中有一个漂亮的圆形囊肿」，手术证实为囊性肿瘤。科马克 1950 年代把成像重述为数学问题、1963—64 年发表其解法且当时不知拉东定理，亦经核实。
**一处分歧已核**：BMJ 讣告记为「1971年9月」，而 impactscan、EBSCO、AuntMinnie、Radiology、JMI 五处一致为 **10月1日**。本文取多数。[Lasker Foundation：Looking Deep into the Body](https://laskerfoundation.org/looking-deep-into-the-body/)｜[impactscan：A brief history of CT](http://www.impactscan.org/CThistory.htm)｜[Radiology：Milestones in CT](https://pubs.rsna.org/doi/full/10.1148/radiol.230803)
