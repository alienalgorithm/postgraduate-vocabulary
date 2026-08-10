# 07 · The Meaning He Left Out

> 题材：1948 年香农与信息论
> 状态：**第七篇最终精校稿**（2026-08-10）
> 指标：273 词 / 50 重点词 / 密度 18.3%
> 香农暂时把意义留在工程问题之外，由此看清：压缩要删减冗余，抗噪却要主动加入冗余。

---

## 英文正文

In 1948 Claude Shannon published a paper about **messages**—and deliberately set their **meaning** aside. A telephone line might carry a love letter, a market **quotation** or an arbitrary string. Their **value** to a reader differed; the **technical** task did not. Could a **receiver**, given the arriving signal, **retrieve** the exact message the **sender** had chosen?

That narrower question made information countable. If eight **outcomes** were **equally** likely, identifying one required three yes-or-no **choices**: three **bits**. A guaranteed event conveyed nothing new; a **rare** one conveyed more. Shannon used **probability** to calculate that **quantity**; he **credited** John Tukey with suggesting the **term** “bit”, short for **binary** digit.

In human **language**, symbols are not uniformly **random**: E occurs more **often** than Q, and TH than XP. This **predictability** creates **redundancy**; **source** coding can therefore compress a message, **assigning** shorter representations to more **likely** **sequences** and longer ones to rare sequences. Compression saves bits by exploiting the language’s statistical regularities.

In a **channel**, **noise** reverses the logic: it may **damage** a **signal**, so a **code** adds **deliberate** redundancy that helps correct errors. Shannon showed that each channel has a **maximum** reliable information **rate**. Below this **limit**, properly designed, **sufficiently** long codes can make the probability of **error** arbitrarily small; above it, no code can make **transmission** reliable.

His **result** established that such codes existed; it did not offer a **convenient** way to **construct** them. At the **destination**, meaning could matter again. Shannon’s **model** did not judge a message’s **purpose**; it asked only whether a chosen message could be **preserved**. That **restraint** made the theory **general**: a channel need not **understand** a message to carry it **intact**.

---

## 中文译文

> 铁律：英文加粗词在中文里对应的译法同样加粗，后附 `(english)` 括注词源。
> 中文按最自然的说法写，加粗落在自然说法上——不为对齐扭曲句法。

1948年，克劳德·香农发表了一篇关于**消息**(messages)的论文，却有意暂时搁置它们的**意义**(meaning)。一条电话线可能传送情书、市场**报价**(quotation)，也可能传送一串任意字符。对读者而言，它们的**价值**(value)各不相同；**技术层面**(technical)的任务却没有区别：**接收端**(receiver)能否仅凭到达的信号，**还原出**(retrieve)**发送端**(sender)选中的那条消息？

问题一经这样收窄，信息便有了可以计算的尺度。若八种**结果**(outcomes)出现的概率**完全相同**(equally)，确定其中一种只需做三次“是或否”的**选择**(choices)，即三**比特**(bits)。必然发生的结果不会带来新信息；越**罕见的**(rare)结果，所含信息越多。香农借助**概率**(probability)计算这种**信息量**(quantity)；他还明确将“bit”一词**归功于**(credited)约翰·图基。这个**术语**(term)是“**二进制**(binary)数位”的简称。

在人类**语言**(language)中，各种符号并非均匀**随机**(random)出现：E比Q**更常出现**(often)，TH也比XP常见。这种**可预测性**(predictability)形成了**冗余**(redundancy)；因此，**信源**(source)编码可以通过**分配**(assigning)长短不同的表示来压缩消息：越**可能出现的**(likely)**序列**(sequences)，表示越短；越罕见，表示越长。压缩正是利用这些统计规律来节省比特。

在**信道**(channel)中，**噪声**(noise)使逻辑反转：它可能**损坏**(damage)**信号**(signal)，因此**编码**(code)会加入**有意设计的**(deliberate)冗余，帮助纠错。香农证明，每条信道都有一个能够可靠传输信息的**最高**(maximum)**速率**(rate)。低于这个**上限**(limit)，采用设计得当且**足够**(sufficiently)长的编码，就能把**出错**(error)概率降到任意小；超过它，任何编码都无法实现可靠**传输**(transmission)。

这一**结果**(result)证明，此类编码确实存在；但香农并未给出一种**便于实际使用的**(convenient)方法来**构造**(construct)它们。当消息抵达**目的地**(destination)，意义才可能重新变得重要。香农的**模型**(model)不判断消息的**用途**(purpose)，只问发送时选中的那条消息能否**保持原样**(preserved)。这种**克制**(restraint)让理论得以**普遍适用**(general)：信道无需**理解**(understand)消息，也能将它**完整无损地**(intact)送达。

---

## 50 词速查表

**§1**（8词）message 消息、讯息｜meaning 含义、意义｜quotation 报价、引语｜value 价值｜technical 技术的、技术层面的｜receiver 接收器、接收端｜retrieve 取回、检索、还原｜sender 发送者、发送端

**§2**（10词）outcome 结果｜equally 相等地、同样地｜choice 选择｜bit 比特、二进制位｜rare 罕见的｜probability 概率、可能性｜quantity 数量、量｜credit 把功劳归于｜term 术语、用语｜binary 二进制的

**§3**（9词）language 语言｜random 随机的｜often 常常、经常｜predictability 可预测性｜redundancy 冗余、多余信息｜source 来源、信源｜assign 分配、指派｜likely 可能的、很可能发生的｜sequence 序列、顺序

**§4**（12词）channel 信道、渠道｜noise 噪声｜damage 损坏、破坏｜signal 信号｜code 编码、代码｜deliberate 有意的、经过考虑的｜maximum 最高的、最大值｜rate 速率、比率｜limit 上限、限制｜sufficiently 足够地｜error 错误、误差｜transmission 传输、传送

**§5**（11词）result 结果、结论｜convenient 方便的、便于使用的｜construct 构造、建造｜destination 目的地、接收终点｜model 模型｜purpose 用途、目的｜preserve 保存、保留｜restraint 克制、约束｜general 普遍的、普适的｜understand 理解｜intact 完整无损的

---

## 史实核对

以下关键信息已据所列来源核对：

- Claude Shannon的《A Mathematical Theory of Communication》发表于1948年《Bell System Technical Journal》第27卷，分载于7月与10月两期，页码分别为379–423和623–656。正文只写年份，以免日期压过论证。
- 香农在论文开头把通信的基本问题界定为：在另一点准确或近似地重现从一组可能消息中选中的那一条。他说语义层面与这一工程问题无关，并不是宣称意义对人类交流不重要。
- 以2为底取对数时，信息单位是binary digit，简称bit。香农在原文中明确注明“bit”一词由J. W. Tukey建议；因此正文没有把这个词的发明单独归给香农。八个等概率结果对应log₂8 = 3比特。
- 香农研究了英语的统计结构与冗余。信源编码可利用不等概率，把较短表示分配给更常见的符号或序列，从而压缩消息；正文没有把压缩写成删除语义。
- 在有噪信道中，冗余若以合适方式加入，可帮助发现并纠正错误。本文把压缩时删除的统计冗余与传输时加入的结构化冗余分开处理，没有把二者写成矛盾。
- 有噪信道编码定理的限定必须完整：信息率低于信道容量时，足够长且合适的编码能使错误概率任意小；超过容量，则不可能把错误压到任意小。正文没有写成有限长度编码可保证绝对零错误。
- 香农的证明建立了此类编码的存在性，却没有给出一种普遍而实用的构造方法。原论文也明确承认这种证明在实际编码方面的不足。
- 香农在原论文开头明确承认Harry Nyquist与Ralph Hartley的先行工作；本文将1948年的贡献表述为建立一般理论与极限，而非从零发明二进制或全部数字通信。
- 来源：[Nokia Bell Labs：香农1948年论文的原始发表页与引言](https://www.nokia.com/bell-labs/publications-and-media/publications/a-mathematical-theory-of-communication/)
- 来源：[香农论文校订重印本：完整定义、bit归功、语言冗余与信道编码定理](https://people.math.harvard.edu/~ctm/home/text/others/shannon/entropy/entropy.pdf)
- 来源：[MIT：Shannon limit、存在性证明与实用构造之间的区别](https://news.mit.edu/2010/explained-shannon-0115)
