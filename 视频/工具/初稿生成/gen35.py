import json,re,glob,os
# 第35篇初稿（逐词对照）：S = [(段, [chunk, ...])]，chunk = ([(英文组, 中文组), ...], 可选 note)
# 2026-10-29 重点词中文沿用文章定稿（铁律），只按《翻译风格》调格式；短语型用法整体标（T22）；不用破折号（T36）。
S=[
(1,[[[("On 3 June 1952","1952年6月3日，"),("Rosario Mazzeo","罗萨里奥·马泽奥"),("released a Manx shearwater in Boston.","在波士顿放飞了一只大西洋鹱。")],
     "（Manx shearwater：大西洋鹱，一种海鸟；\nin Boston：地点状语）"]]),
(1,[[[("It","它"),("came by **rail**","先坐**火车**(rail)，"),("and **airliner**","再搭**客机**(airliner)，"),("from its **burrow**","从自己的**洞巢**(burrow)一路被带到这里；"),("on Skokholm,","洞巢在斯科克霍姆，"),("an **isle** off Wales,","那是威尔士外海的一座**小岛**(isle)。")],
     "（come by rail and airliner：乘火车和客机来，by 表示交通方式；\nan isle off Wales：同位语，补充说明 Skokholm；off：在……外海）"],
    [[("and Mazzeo","马泽奥"),("posted a letter at once.","随即寄出一封信。")],
     "（at once：立刻，马上）"]]),
(1,[[[("After a roughly","经过约"),("3,200-mile","三千二百英里的"),("**odyssey**","**远征**(odyssey)，"),("across","飞越"),("the **unbroken** Atlantic,","**一望无际的**(unbroken)大西洋，")],
     "（After…：时间状语；\nacross the unbroken Atlantic：后置定语，修饰 odyssey）"],
    [[("the **feathered**","这位**披着羽毛的**(feathered)"),("**traveller**","**旅行者**(traveller)"),("was back on its **doorstep** twelve and a half days later.","十二天半后回到了自家**门口**(doorstep)。")],
     "（the feathered traveller：披着羽毛的旅行者，指这只鹱；\nbe back on its doorstep：回到自家门口）"]]),
(1,[[[("The letter","那封信"),("arrived **afterwards**.","是**随后**(afterwards)才到的。")],
     "（afterwards：之后，随后，\n这里指鸟回到洞巢之后）"]]),
(2,[[[("The first **hints** of a compass","最初的罗盘**线索**(hints)"),("were **celestial**.","来自**天上**(celestial)。")],
     "（hints of a compass：关于鸟的罗盘的线索；\ncelestial：天上的，这里指太阳和星星）"]]),
(2,[[[("In the 1950s","20世纪50年代，"),("Kramer","克雷默"),("kept starlings","把椋鸟"),("**cooped**","**关进**(cooped)"),("in cages","笼子里，")],
     "（keep A cooped in…：把 A 关在……里；\ncooped：过去分词作宾语补足语）"],
    [[("and","再"),("moved the apparent sun with mirrors.","用镜子挪动太阳的视位置。")],
     "（the apparent sun：太阳的视位置，\n即从地面看到的太阳位置）"]]),
(2,[[[("The **duped** birds","**受骗的**(duped)鸟"),("**swivelled** to match,","随之**转身**(swivelled)，")],
     "（swivel to match：转身与之对应；\nto match：不定式作结果状语）"],
    [[("allowing for","而且会顾及"),("the sun's","太阳"),("daily","每天划过的"),("**arc**.","**弧线**(arc)。")],
     "（allowing for…：现在分词短语作伴随状语；\nallow for：考虑到，顾及）"]]),
(2,[[[("In the 1960s","20世纪60年代，"),("Emlen","埃姆伦"),("**curtained off** stars in a planetarium's **vault**.","在天文馆的**穹顶**(vault)上把星星一片片**遮住**(curtained off)。")],
     "（curtain off：用帘子遮挡；\nin a planetarium's vault：地点状语）"]]),
(2,[[[("His buntings","他的靛蓝彩鹀"),("steered by stars around the **pole-star**,","依靠**北极星**(pole-star)周围的星星辨向，")],
     "（buntings：这里指靛蓝彩鹀；steer by…：依靠……辨向；\naround the pole-star：后置定语，修饰 stars）"],
    [[("the **axis** of the **nightly** **whirl**.","北极星正是星空**每夜**(nightly)都绕着**旋转**(whirl)的**轴心**(axis)。")],
     "（the axis of the nightly whirl：同位语，补充说明 the pole-star；\nwhirl：旋转，这里指星空整夜绕北极星转动）"]]),
(3,[[[("In 1972","1972年，"),("the Wiltschkos","维尔奇科夫妇"),("showed that","证明，")],
     "（the Wiltschkos：维尔奇科夫妇；\nthat 引导宾语从句）"],
    [[("**robins**","**知更鸟**(robins)"),("read","读取"),("Earth's","地球"),("**magnetic** field","**磁场**(magnetic)时，"),("by **inclination**,","看的是**倾角**(inclination)，"),("not **polarity**,","而不是**极性**(polarity)，")],
     "（by inclination：靠倾角，by 表示方式；\ninclination：倾角，磁力线与地面的夹角）"],
    [[("unlike","这一点和"),("a **sailor**'s","**水手**(sailor)的"),("**needle**.","罗盘**指针**(needle)不同。")],
     "（unlike…：介词短语，和……不同）"]]),
(3,[[[("In 1978","1978年，"),("Schulten","舒尔滕"),("proposed","提出，"),("a **light-triggered** reaction","一种**由光触发的**(light-triggered)化学反应"),("to **decode** the field.","可以**解读**(decode)磁场。")],
     "（to decode the field：不定式作后置定语，修饰 reaction；\nthe field：指地球磁场）"]]),
(3,[[[("Proposed in 2000,","2000年被提出的"),("cryptochrome,","隐花色素，"),("a protein in the **retina**,","是**视网膜**(retina)中的一种蛋白质，")],
     "（Proposed in 2000：过去分词短语作状语；\na protein in the retina：同位语，\n补充说明 cryptochrome）"],
    [[("is now","如今它是"),("the **foremost** suspect.","**头号**(foremost)嫌疑对象。")],
     "（the foremost suspect：头号嫌疑对象，\n指最可能负责感知磁场的分子）"]]),
(3,[[[("In 2021","2021年，"),("robin","知更鸟的"),("cryptochrome","隐花色素"),("proved more **finely** **tuned** in the laboratory","在实验室里被证明**调校**(tuned)得更**精细**(finely)，"),("than that of chickens or **pigeons**.","胜过鸡和**鸽子**(pigeons)的。")],
     "（proved more finely tuned…than…：比较结构，\n证明比……调校得更精细；\nthat of chickens or pigeons：that 指 cryptochrome）"]]),
(3,[[[("Proof in a living bird","在活鸟身上的证据，"),("is **awaited**.","仍**有待**(awaited)取得。")],
     "（in a living bird：后置定语，修饰 proof；\nbe awaited：被动，有待……）"]]),
(4,[[[("In 2014","2014年，"),("came","事情出现了"),("an **eerie**,","一个**诡异的**(eerie)、"),("**man-made**","**人为的**(man-made)"),("twist.","转折。")],
     "（In 2014 came…：倒装句，\n主语是 an eerie, man-made twist）"]]),
(4,[[[("At Oldenburg University,","在奥尔登堡大学，"),("robins in campus **huts**","校园**小木屋**(huts)里的知更鸟"),("lost","失去了"),("that sense.","这种感知。")],
     "（in campus huts：后置定语，修饰 robins；\nthat sense：指读取磁场的能力）"]]),
(4,[[[("In huts **clad** in grounded aluminium,","在**包覆**(clad)接地铝板的小屋里，")],
     "（clad in…：过去分词短语作后置定语，修饰 huts；\ngrounded：接地的）"],
    [[("they","它们"),("**reclaimed**","**找回了**(reclaimed)"),("their **bearings**.","**方向感**(bearings)。")],
     "（reclaim one's bearings：找回方向感；\nbearings：方位，方向感）"]]),
(4,[[[("Removing the grounding,","拆掉接地，"),("or **piping** radio noise **in**,","或往屋里**灌入**(piping in)无线电噪声，")],
     "（Removing…, or piping…：两个动名词短语作主语；\npipe in：用管道输入，这里指把噪声输进屋里）"],
    [[("**bewildered** them again","又让它们**晕头转向**(bewildered)，"),("in","在"),("double-blind","双盲"),("tests.","实验中也是如此。")],
     "（bewilder：使困惑，使晕头转向；\nin double-blind tests：在双盲实验中）"]]),
(4,[[[("The **interference**,","这种**干扰**(interference)"),("a **murmur** from everyday **appliances**,","只是日常**电器**(appliances)发出的一阵电磁**低语**(murmur)，")],
     "（a murmur from everyday appliances：同位语，补充说明 interference；\nmurmur：低语，这里比喻微弱的电磁噪声）"],
    [[("sat far below","强度远低于"),("WHO","世卫组织的"),("safety","安全"),("limits.","限值。")],
     "（sit far below…：远低于……；\nWHO：世界卫生组织）"]]),
(5,[[[("How a **wanderer** knows where it is","一位**漫游者**(wanderer)如何知道自己身在何处，"),("remains **unanswered**.","至今仍**没有答案**(unanswered)。")],
     "（How a wanderer knows…：主语从句；\nwhere it is：宾语从句，作 knows 的宾语）"]]),
(5,[[[("The compass","罗盘的"),("code","密码"),("is partly **cracked**,","已**破解了**(cracked)一部分，")],
     "（is partly cracked：被动，已被部分破解）"],
    [[("but","但"),("the **atlas** that steered the shearwater","指引那只大西洋鹱的那张**地图**(atlas)，"),("has yet to be read.","还没有人读懂。")],
     "（that steered the shearwater：定语从句，修饰 atlas；\nhas yet to be read：尚未被读懂）\n"
     "（简述：1952年6月3日，马泽奥在波士顿放飞了一只来自威尔士外海斯科克霍姆岛的大西洋鹱，\n"
     "它飞越约三千二百英里的大西洋，十二天半后回到洞巢，比他随即寄出的信还早。\n"
     "20世纪50年代，克雷默用镜子挪动太阳的视位置，椋鸟随之转身；\n"
     "20世纪60年代，埃姆伦在天文馆遮住星星，发现靛蓝彩鹀依靠北极星周围的星星辨向。\n"
     "1972年，维尔奇科夫妇证明知更鸟读取磁场看的是倾角而不是极性；\n"
     "1978年舒尔滕提出由光触发的化学反应，2000年视网膜中的隐花色素被提出，如今是头号嫌疑对象，\n"
     "但在活鸟身上的证据仍有待取得。2014年，奥尔登堡大学发现，日常电器发出的微弱电磁干扰\n"
     "会让知更鸟失去方向感，接地铝板屏蔽后它们又找回了方向感。\n"
     "鸟如何知道自己身在何处，至今仍没有答案。）"]]),
]
CONF={"合组":{
 "S1 released a Manx shearwater in Boston":"对齐不了：in Boston 是地点状语，中文“在波士顿放飞了一只大西洋鹱”地点必须放到动词前；Manx shearwater 是一个鸟名“大西洋鹱”",
 "S2 posted a letter at once":"对齐不了：at once 是时间状语，中文“随即寄出一封信”，“随即”必须放到动词前",
 "S3 was back on its doorstep twelve and a half days later":"对齐不了：twelve and a half days later 是时间状语，中文“十二天半后回到了自家门口”，时间必须放到动词前",
 "S6 kept starlings":"对齐不了：keep A cooped in B 中文是“把”字句“把 A 关进 B”，kept 不单独译，化进“把”和“关进”",
 "S6 moved the apparent sun with mirrors":"对齐不了：with mirrors 是方式状语，中文“用镜子挪动太阳的视位置”必须放到动词前；the apparent sun 中文“太阳的视位置”是一个词组",
 "S8 curtained off stars in a planetarium's vault":"对齐不了：in a planetarium's vault 是地点状语，中文“在天文馆的穹顶上把星星一片片遮住”地点必须放到动词前，“把”字句动词放最后",
 "S9 steered by stars around the pole-star":"对齐不了：steer by A 中文“依靠 A 辨向”，动词“辨向”必须放到最后；around the pole-star 是后置定语，修饰 stars，中文“北极星周围的星星”必须提前",
 "S13 proved more finely tuned in the laboratory":"对齐不了：in the laboratory 是地点状语，中文“在实验室里被证明……”必须放到动词前；more finely tuned 中文“调校得更精细”，程度补语放到动词后",
 "S14 Proof in a living bird":"对齐不了：in a living bird 是后置定语，修饰 proof，中文“在活鸟身上的证据”定语必须提前",
 "S16 robins in campus huts":"对齐不了：in campus huts 是后置定语，修饰 robins，中文“校园小木屋里的知更鸟”定语必须提前",
 "S17 In huts clad in grounded aluminium":"对齐不了：clad in grounded aluminium 是后置定语，修饰 huts，中文“在包覆接地铝板的小屋里”定语必须提前",
 "S18 or piping radio noise in":"对齐不了：pipe A in 中文“往屋里灌入 A”，in 和 piping 合成一个动作，必须放在 A 前面",
 "S19 sat far below":"对齐不了：sit far below 是固定说法“远低于”，sat 不单独译；中文补出主语“强度”",
 "S21 the atlas that steered the shearwater":"对齐不了：that steered the shearwater 是定语从句，修饰 atlas，中文“指引那只大西洋鹱的那张地图”从句必须提前"},
"已告诉用户被去掉的重点词":"2026-10-29 已在会话中把 protein（与16 proteins 撞词，用户 2026-10-17 定留在16，35 改回普通词）原样告诉用户"}
CONF["停顿位置"]={"S12 retina, / is @3.995":"2026-10-29 逐段看声音实测（S12 w）：retina 的 ə 在 3.96 收尾（-24 dB），3.97 -31、3.98 -44、3.99 -57 dB，3.995 是两词之间最低处；4.01 起是吸气（-42～-46 dB、重心 2–3.4 kHz、低频 -8～-25 dB，已写进非人声区间 [4.0, 4.2275] 删掉），4.245 起 is 的声门起音；插在 retina 收尾后的静音里，不切词（A42）",
 "S15 eerie, / man-made @2.025":"2026-10-29 逐段看声音实测（S15 w）：eerie 的 i 在 1.995 收尾（-37 dB），2.005 -50、2.025 -61 dB 是两词之间最低处；2.035 起是吸气（-49～-57 dB、重心 1.9–2.4 kHz，已写进非人声区间 [2.04, 2.21] 删掉），2.235 起 man-made 的 /m/（-24 dB、重心 654 Hz）；插在最低处，不切词（A42）"}
# 非人声区间新加（2026-10-29 逐 10 ms 实测）：S3 [8.935,9.025] doorstep 的 /p/ 除阻 8.9175（-42 dB、重心 2.9 kHz）保留，之后 8.93–9.02 平稳 -51～-55 dB、重心 1.8–2.4 kHz、低频 -3～-16 dB、周期 0.1–0.2 的气声，9.03 起降到 -60 dB 以下，twelve 9.14 起；
#  （S3 doorstep 后 8.93–9.02 不切：紧接 /p/ 除阻、中间没有 -55 dB 的缝，是 /p/ 的送气尾）S6 [1.2525,1.34] fifties 的 /z/ 在 1.2375 结束（重心 3.8 kHz），1.2475–1.33 -53～-57 dB、重心 2–3.3 kHz 的气声，1.34 起 -58 dB 以下，kept 1.547 起；S8 [1.325,1.655] sixties 的 /z/ 在 1.325 结束（重心 5.3 kHz），1.335–1.53 -46～-55 dB、重心 2–2.8 kHz、低频 -8～-22 dB 的吸气，1.535–1.655 -52～-68 dB 的残余气声（重心 2.8–5 kHz），Emlen 1.665 起；
#  S12 [4.0,4.2275]、S15 [2.04,2.21] 见 停顿位置；S19 [3.4875,3.69] appliances 的 /z/ 在 3.4575 结束（重心 4.9 kHz），3.4675–3.68 -41～-53 dB、重心 2.4–3.4 kHz、低频 -7～-24 dB 的吸气，3.70 -52 dB 低频 -2 dB 起是 sat 前的起音，保留；S21 [2.198,2.245] the 收尾后 2.20–2.25 -53～-62 dB 里 2.21 一下 -43 dB、重心 5.8 kHz、低频 -28 dB 的咔声，atlas 2.26 起
out={"no":"35","title_en":"The Bird That Beat the Letter Home","title_zh":"比信先到家的鸟","title_fx":{"hl":["Bird","Letter"],"ghost":[]},"sentences":[],"核对确认":CONF,"结尾解说":"简述",
     "说明放宽特批":{"S21":{"倍数":"整屏","依据":"用户 2026-10-25 看 25 简述截图：“以后以后一定要合理的安排，不要压缩成这个样子……这个地方特批一下”（用户同意记录：原话适用以后各篇，26 起沿用）"}},
     "非人声区间":{"S1":[[2.45,2.725]],"S2":[[3.755,4.061125,"紧贴词头"]],"S6":[[1.2525,1.34],[4.13,4.443708,"紧贴词头"]],"S8":[[1.325,1.655]],"S10":[[6.61,6.97]],"S11":[[1.45,1.645]],"S12":[[4.0,4.2275]],"S13":[[1.855,2.075],[6.225,6.585]],"S15":[[2.04,2.21]],"S18":[[3.39,3.685]],"S19":[[3.4875,3.69]]},
     "高亮按实际开口":True,"高亮开口门槛":40,
     "术语":{"Rosario Mazzeo":"罗萨里奥·马泽奥","Mazzeo":"马泽奥","Manx shearwater":"大西洋鹱","shearwater":"大西洋鹱","Boston":"波士顿","Skokholm":"斯科克霍姆","Wales":"威尔士","Atlantic":"大西洋","Kramer":"克雷默","Emlen":"埃姆伦","buntings":"靛蓝彩鹀","Wiltschkos":"维尔奇科夫妇","Schulten":"舒尔滕","cryptochrome":"隐花色素","Oldenburg University":"奥尔登堡大学","WHO":"世卫组织"}}
import sys; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from 核对 import 生成并核对
生成并核对(S, out)
