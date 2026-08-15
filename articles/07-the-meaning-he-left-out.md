# 07 · The Meaning He Left Out

> 题材：1948 年香农与信息论
> 状态：**第七篇最终精进锁定稿**（2026-08-15）
> 指标：269 词 / 50 重点词 / 密度 18.6%
> 香农在第一页就把含义搁到一边——正是这份克制，让一条信道不必读懂消息也能把它完好送到。

---

## 英文正文

In 1948 Claude Shannon published a theory of **messages** and set their meaning aside. A line might carry a love letter, a market **quotation** or an **arbitrary** string of **glyphs**; to the engineer the **contents** were **irrelevant**. His question was narrower: could a **receiver**, given the signal, **retrieve** exactly what the **sender** had **picked**?

The question made information **countable**. If eight **outcomes** are **equally** **probable**, identifying one takes three yes-or-no decisions: three **bits**. A certain event says nothing; a **surprising** one says more. He measured surprise with **probability** and named it **entropy**; base two gave the unit, a **contraction** of **binary** digit, named by John Tukey.

Written English is **lopsided**. Letters counted **singly** give 4.14 bits each, but letters are **predictable** from neighbours, and **guessing** experiments he published in 1951 put the true figure at 0.6 to 1.3. That gap is **redundancy**; **shrinking** a file means selling it back: **shorter** **codewords** for **frequent** **characters**, longer ones for the rest.

**Noise** inverts the argument. A channel **corrupts** symbols, so an **encoder** puts redundancy back **deliberately**, spacing codewords so a damaged one still **decodes** correctly. Every channel has a ceiling on **throughput**: below it, long codes drive the **error** rate **arbitrarily** near zero; above it, no **scheme** keeps **transmission** reliable.

The proof was not **constructive**. He showed good codes exist without **exhibiting** one. Richard Hamming, down the **corridor** on **unreliable** **vacuum**-tube machines, built one in 1950 from **parity** checks that **correct** as well as detect. At the **destination**, meaning may matter again. That **restraint** is what made the theory general: a channel need not understand a message to carry it **intact**.

---

## 中文译文

> 铁律：英文加粗词在中文里对应的译法同样加粗，后附 `(english)` 括注词源。
> 中文按最自然的说法写，加粗落在自然说法上——不为对齐扭曲句法。

1948年，克劳德·香农发表了一套关于**消息**(messages)的理论，并把消息的含义搁在一边。一条线路上传的可能是情书，可能是行情**报价**(quotation)，也可能是一串**任意的**(arbitrary)**符号**(glyphs)；在工程师看来，这些**内容**(contents)都**无关紧要**(irrelevant)。他问的是更窄的问题：**接收端**(receiver)拿到抵达的信号后，能不能原样**取回**(retrieve)**发送端**(sender)当初**挑中**(picked)的那一条？

这个窄问题让信息变得**可数**(countable)。若八种**结果**(outcomes)**等**(equally)**概率**(probable)，认出其中一种需要三次是非判断，也就是三个**比特**(bits)。必然发生的事什么也没说；**出人意料的**(surprising)那件说得更多。他用**概率**(probability)去度量这份意外，管它叫**熵**(entropy)；以2为底给出了单位，即**二进制**(binary)数字的**缩写**(contraction)，由约翰·图基起名。

书面英语是**偏斜的**(lopsided)。把字母**逐个**(singly)来数，每个字母是4.14比特；可字母能从相邻字母**推得出来**(predictable)，香农1951年发表的**猜字**(guessing)实验把真实值压到0.6至1.3之间。这中间的落差就是**冗余**(redundancy)；**压缩**(shrinking)一个文件，就是把这份冗余卖回去：给**高频**(frequent)**字符**(characters)配**更短的**(shorter)**码字**(codewords)，其余的配长的。

**噪声**(Noise)把这套逻辑反了过来。信道会**弄坏**(corrupts)符号，于是**编码器**(encoder)**刻意**(deliberately)把冗余加回去，让码字彼此隔得够开，坏掉一个仍能正确**译回**(decodes)。每条信道都有一个**吞吐量**(throughput)上限：在上限之下，足够长的码能把**错误**(error)率压到**任意**(arbitrarily)接近零；在上限之上，没有任何**方案**(scheme)能让**传输**(transmission)可靠。

这个证明不是**构造性的**(constructive)。他证明了好码存在，却没**拿出**(exhibiting)一个。理查德·汉明就在同一条**走廊**(corridor)上，对着**不可靠的**(unreliable)**真空**(vacuum)管机器，1950年用**奇偶**(parity)校验造出了一个——不只查错，还能**纠**(correct)错。到了**终点**(destination)，含义可以重新变得要紧。正是那份**克制**(restraint)让这套理论具有普遍性：一条信道不必读懂一条消息，也能把它**完好**(intact)送到。

---

## 50 词速查表

**§1**（10词）message 消息；信息｜quotation 报价；引文｜arbitrary 任意的｜glyph 符号；字形｜contents 内容｜irrelevant 无关紧要的｜receiver 接收端；接收器｜retrieve 取回；检索｜sender 发送端｜pick 挑中；选择

**§2**（10词）countable 可数的｜outcome 结果｜equally 同等地｜probable 可能的；或然的｜bit 比特；位｜surprising 出人意料的｜probability 概率｜entropy 熵｜contraction 缩写；收缩｜binary 二进制的

**§3**（10词）lopsided 偏斜的；不均衡的｜singly 逐个地；单独地｜predictable 可推知的｜guessing 猜测｜redundancy 冗余｜shrink 压缩；缩小｜shorter 更短的｜codeword 码字｜frequent 高频的｜character 字符；性格

**§4**（10词）noise 噪声｜corrupt 弄坏；使腐化｜encoder 编码器｜deliberately 刻意地｜decode 译回；解码｜throughput 吞吐量｜error 错误｜arbitrarily 任意地｜scheme 方案｜transmission 传输

**§5**（10词）constructive 构造性的；建设性的｜exhibit 拿出；展示｜corridor 走廊｜unreliable 不可靠的｜vacuum 真空｜parity 奇偶校验；同等｜correct 纠正｜destination 终点；目的地｜restraint 克制｜intact 完好的

---

## 史实核对

以下关键信息已据所列来源核对：

- 香农《A Mathematical Theory of Communication》分两期刊于《Bell System Technical Journal》第27卷，1948年7月（pp.379–423）与10月（pp.623–656）。论文开篇即写明：消息常常带有含义，但这与工程问题无关；工程问题是在一点精确或近似地再现在另一点选定的消息。[Shannon 1948 原文](https://people.math.harvard.edu/~ctm/home/text/others/shannon/entropy/entropy.pdf)
- 以2为底时单位称为二进制数字（binary digits），简称 bit，该词由 J. W. Tukey 建议。八个等概率结果需3个比特，因 log₂8 = 3。[Shannon 1948 原文](https://people.math.harvard.edu/~ctm/home/text/others/shannon/entropy/entropy.pdf)
- 香农1951年《Prediction and Entropy of Printed English》（BSTJ 30:1, pp.50–64）中，仅按单字母频率计算得 F₁ = 4.14 比特/字母；而通过让受试者逐字母猜测的实验，他把英文的真实熵估计在 0.6—1.3 比特/字母之间。二者之差即冗余。[Shannon 1951 原文](https://www.princeton.edu/~wbialek/rome/refs/shannon_51.pdf)｜[熵估计区间](https://image-ppubs.uspto.gov/dirsearch-public/print/downloadPdf/5960385)
- 信源编码利用统计不均匀性压缩；信道编码则反向操作，刻意加入冗余以纠错。香农证明每条信道存在容量：低于容量时，足够长的码可使错误概率任意小；高于容量时，任何方案都无法保证可靠传输。
- **香农的证明是非构造性的**：他证明了好码存在，却未给出构造方法，这被视为留给编码理论界的挑战。理查德·汉明当时在同一实验室研究以真空管搭建的、极不可靠的计算机，于1950年在《BSTJ》29卷2期 pp.147–160 发表纠错码，用奇偶校验实现检错与纠错，成为编码理论的奠基石。[CIO：60 years of Hamming codes](https://www.cio.com/article/205691/cio-blast-from-the-past-60-years-of-hamming-codes.html)｜[Hamming 1950 著录](https://arxiv.org/pdf/1211.2853)
- 正文写“到了终点，含义可以重新变得要紧”，对应香农原文将通信系统划分为信源、发射机、信道、接收机与终点（destination）；理论只保证消息在信道上被完好复现，不评判消息的用途。[Shannon 1948 原文](https://people.math.harvard.edu/~ctm/home/text/others/shannon/entropy/entropy.pdf)
