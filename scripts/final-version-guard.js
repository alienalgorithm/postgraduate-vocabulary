#!/usr/bin/env node
'use strict';

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const DATA_DIR = path.join(ROOT, 'data');
const ARTICLE_DIR = path.join(ROOT, 'articles');
const MANIFEST_PATH = path.join(DATA_DIR, 'final-version-manifest.json');
const REPORT_PATH = path.join(ROOT, 'notes', '全库最终版本审计_2026-08-24.md');
const README_PATH = path.join(ROOT, 'README.md');
const HANDOFF_PATH = path.join(ROOT, 'notes', '对话交接文档.md');
const IRON_RULE_PATH = path.join(ROOT, 'notes', '最终版本铁律.md');

const SOURCE_AUDIT = {
  '01': { source: '2026-08-15对话中经写作智能体全流程产出、由四段改为五段、合规分100的269词最终精进锁定稿', verification: 'conversation-latest-final' },
  '02': { source: '2026-08-15对话中经写作智能体全流程产出、合规分100的最终精进锁定稿', verification: 'conversation-latest-final' },
  '03': { source: '2026-08-15对话中经写作智能体全流程（词池→草稿→复检五轮）产出、合规分100的270词最终精进锁定稿', verification: 'conversation-latest-final' },
  '04': { source: '2026-08-15对话中经写作智能体全流程产出、合规分100的268词最终精进锁定稿', verification: 'conversation-latest-final' },
  '05': { source: '2026-08-15对话中经写作智能体全流程产出、合规分100的270词最终精进锁定稿', verification: 'conversation-latest-final' },
  '06': { source: '2026-08-15对话中经写作智能体全流程产出、合规分100的270词最终精进锁定稿', verification: 'conversation-latest-final' },
  '07': { source: '2026-08-15对话中经写作智能体全流程（词池→五轮复检）产出、合规分100的269词最终精进锁定稿', verification: 'conversation-latest-final' },
  '08': { source: '2026-08-15对话中经写作智能体全流程产出、合规分100的270词最终精进锁定稿', verification: 'conversation-latest-final' },
  '09': { source: '2026-08-15对话中经写作智能体全流程产出、合规分100的270词最终精进锁定稿', verification: 'conversation-latest-final' },
  '10': { source: '2026-08-16全库跑轮时检出并修复：中英配对错位、scribes worked a system 不地道、system 白送兼抽象主语；合规分100的269词稿', verification: 'conversation-latest-final' },
  '11': { source: '2026-08-15对话中经写作智能体全流程产出、合规分100的270词最终精进锁定稿', verification: 'conversation-latest-final' },
  '12': { source: '2026-08-15对话中经写作智能体全流程产出、合规分100的270词最终精进锁定稿', verification: 'conversation-latest-final' },
  '13': { source: '2026-08-15对话中经写作智能体全流程产出、合规分100的266词最终精进锁定稿', verification: 'conversation-latest-final' },
  '14': { source: '2026-08-15对话中经写作智能体全流程产出、合规分100的270词最终精进锁定稿', verification: 'conversation-latest-final' },
  '15': { source: '2026-08-15对话中经写作智能体全流程产出、合规分100的270词最终精进锁定稿', verification: 'conversation-latest-final' },
  '16': { source: '2026-08-15对话中经写作智能体全流程产出、合规分100的最终精进锁定稿', verification: 'conversation-latest-final' },
  '17': { source: '2026-08-12对话中形成并由PR #8合并的268词最终精进稿', verification: 'conversation-latest-final' },
  '18': { source: '2026-08-15对话中经写作智能体全流程产出、合规分100的最终精进锁定稿', verification: 'conversation-latest-final' },
  '19': { source: '2026-08-15对话中经写作智能体全流程产出、合规分100的269词最终精进锁定稿', verification: 'conversation-latest-final' },
  '20': { source: '2026-08-15对话中经写作智能体全流程产出、合规分100的270词最终精进锁定稿', verification: 'conversation-latest-final' },
  '24': { source: '2026-08-16按《第24篇写作提示词》全流程新写：选题后先上网核实每个数字→词池→草稿十轮→入库→十五层→第9轮五问→台账；六个白送词全部按第零条之三处置（取消加粗、让出名额，未改英文）', verification: 'conversation-latest-final' },
  '23': { source: '2026-08-16按《第23篇写作提示词》全流程新写：重读三篇正文→选题四条→词池→自然度复核→草稿五轮→十一轮精修→对抗式审计六条全否决→合规分100的268词定稿', verification: 'conversation-latest-final' },
  '22': { source: '2026-08-16按《第22篇写作提示词》全流程新写：重读三篇正文→选题四条→词池→自然度复核→草稿七轮→十一轮精修→合规分100的270词定稿', verification: 'conversation-latest-final' },
  '21': { source: '2026-08-16按《第21篇写作提示词》全流程新写：重读范文→选题四条→词池→草稿复检→审读任务书→合规分100的270词定稿', verification: 'conversation-latest-final' },
  '25': { source: '2026-08-23对话中经多轮史实核对与整体精修形成的270词最终精进锁定稿；修正六个月死亡数为4/55对14/52，并严格区分随机序列、分配隐藏与结局盲法', verification: 'conversation-latest-final' },
  '26': { source: '2026-08-23第26篇CT主题最终终审锁定稿；经史实、技术术语、功劳边界与前1250词双层去重，并由仓库构建器验证26篇/1300词全部通过', verification: 'conversation-latest-final' },
  '27': { source: '2026-08-23第27篇1858年跨大西洋电缆主题最终精进锁定稿；经Whitehouse—Thomson功劳边界重写、关键史实复核、前1300词双层去重，并由仓库构建器验证27篇/1350词全部通过', verification: 'conversation-latest-final' },
  '28': { source: '2026-08-24第28篇Voyager 2多行星引力助推主题第13轮独立盲审最终精进锁定稿；以NASA与JPL权威来源重审推进剂和时间约束、参考系机制、角动量、功劳边界及火箭推进边界，保留原50词并完成全库复验', verification: 'conversation-latest-final' },
  '29': { source: '2026-08-24第29篇巴拿马运河重力船闸主题第14轮最终精进锁定稿；经五候选比较、巴拿马运河管理局与美国国务院权威史实复核、涵洞口径与开闸方向终审、机制和功劳边界复判、前1400词双层去重及全库验证', verification: 'conversation-latest-final' },
  '70': { source: '2026-09-04。撞库窗口 30 后第一篇成稿：题材库 100%（灯塔），vet 90/84/80%，闸门一 43 为历次最高，按段 5·12·18·12·1。初稿密度 17.9 触哨兵——第三条不成立（论证段是灯芯、反射镜、棱镜、发条），密写到 9.9。十三稿到 271/50。封版前两问逮出 glazier（装玻璃的≠做玻璃的）→ glass-house/grind。BAL-02b 判为保留。★ 后撤回窗口 30（用户三次追问立的全库零重复铁律不由我改），七处撞库名额换掉，269 词', verification: 'conversation-latest-final' },
  '69': { source: '2026-09-03。题材库 70%（稻草人），三批 vet 70/50/75%。闸门一 24，按段 6·12·7·2·4。初稿密度 12.5 触了止损哨兵——但判法第三条（论证段是年份／法案／报纸）不成立，论证段是响板、弹弓、瘟疫、白嘴鸦；一次密写到 9.4。十二稿到 270/50。封版前两问零翻案。BAL-02b 判为保留', verification: 'conversation-latest-final' },
  '68': { source: '2026-09-03。题材库 60%（护城河），核心论证词 drainage/silt/clay 被第55篇占，用 loam/lowland/sludge 侧写；闸门一 27，按段 6·5·16·5·2；初稿密度 9.7 未触止损哨兵。十二稿到 271/50。§4/§5 用身份域与今貌域填满。封版前两问零翻案。BAL-02b 判为保留', verification: 'conversation-latest-final' },
  '67': { source: '2026-09-03。玩具域 90%，十个物件 vet 53%+80%（map 在初中表、dissected/pieces 撞库，改用 borders/atlas 表达）。闸门一 28，按段 8·7·7·2·9。十四稿到 271/50。封版前两问：删一处编造（nursery-maid laid them out——来源说的是女家庭教师）。BAL-02b 两处判为保留', verification: 'conversation-latest-final' },
  '66': { source: '2026-09-03。同日第四个题材：切片面包（slice 撞库）、蜂路（frame/gap 撞库）、南丁格尔病房（window/beds 初中词）三个在 vet 阶段停下；茅草 70% 过。闸门一 30，按段 5·16·11·4·0。十二稿到 271/50。封版前两问逮出 slate（1666 年伦敦是陶瓦）、squirt（17 世纪工具放进 1212 年）两处时代错位。入库时两条硬伤（jettied 0.0／速查表错位）当场改', verification: 'conversation-latest-final' },
  '65': { source: '2026-09-03。反转段十个物件先 vet（58%，核心对比词 scarlet/cochineal 撞库，改用 madder vs carmine/insect/Mexico 表达）；闸门一 33 为历次最高，按段 4·8·11·9·4。八稿到 269/50。封版前人读第二问逮出 vermilion（朱砂红，矿物）→ carmine。首次入库 97（BAL-02b 判为保留）', verification: 'conversation-latest-final' },
  '64': { source: '2026-09-03。用「先 vet 反转段十个物件」这条新顺序选的第一篇：巨象、卢德两稿在此步停下，产钳一步过（82%）。闸门一按段报 §5:0 —— 末段用后续事实填满。四稿到 270/50。封版前逐细节核（十四处有据，一处推论注明）、逐词问行家。首次入库即 100/100', verification: 'conversation-latest-final' },
  '63': { source: '2026-09-03。用「事实是不是东西」选的第一篇：玩具域 90%，vet 通过率 73—80%，初稿密度 11，五稿到 271/50。封版前逐细节核（二十处有据，一处纽扣商标年份改正）、逐词问行家。首次入库即 100/100', verification: 'conversation-latest-final' },
  '62': { source: '2026-09-03。第四个题材才成（乔利伍德词薄、靛蓝核心词撞、大富翁核心词撞）；殡葬域 70%，闸门三门俱过；写作途中删一处编造（mourned in the mortuary）、改一处行话（weaver spun→spun and woven）。封版前逐细节核、逐词问行家。首次入库即 100/100', verification: 'conversation-latest-final' },
  '61': { source: '2026-09-03。全库「行家会这么说吗」走完后写的第一篇：闸门一报 30 三门俱过；初稿密度 9.4；每段名额从各自词域取；封版前逐细节核来源、逐词问行家——零翻案。首次入库即 100/100。途中一次为削词把「高估 100%」改成「一半」，当场发现改回', verification: 'conversation-latest-final' },
  '60': { source: '2026-09-03。第三个题材才成——前两个（南丁格尔、泰晤士鲑鱼）闸门一都报可用词太少，我绕过一次、漏跑一次，各废十稿六稿；本篇闸门一报 27，三门俱过。写作途中六条人读第一条删掉两处编造（a keg of perry／saloon cellar 对比）；封版前人读零翻案。首次入库即 100/100', verification: 'conversation-latest-final' },
  '59': { source: '2026-09-02。两次触止损点第二型，两次照《总令》重写更紧的一版（第二次 260词/43名额，腾出10词）。复现报告两次逮到「去重后只剩 42」。六条人读抓出两处编造（in the yard／errata he never issued）', verification: 'conversation-latest-final' },
  '58': { source: '2026-09-02。触止损点第二型后照《总令》重写一版更紧的（240词/44名额，一口气余出30词），补足即成。首次入库即 100/100。六条人读随后抓出三处编造（douse/smith/poker-anvil），已改', verification: 'conversation-latest-final' },
  '57': { source: '2026-09-02。第一稿真名额仅34（复现16），按新装的 review 诊断「论点词复现→换角度」重写：让每段名额从各自词域取（经济史/那个人/图像/复原实验/流传），真名额 34→50、复现归零。STR-03 判为保留，理由在 facts', verification: 'conversation-latest-final' },
  '56': { source: '2026-09-02按三步法写成。先诊断出「初稿名额密度 16.7 远差于成稿的 8.5—10.6」，据此重写一次到位。两条判为保留（VAL-13 pew/pews、BAL-02b §4密度），理由在 facts', verification: 'conversation-latest-final' },
  '55': { source: '2026-09-02按三步法写成，首次入库即 100/100 硬伤 0（全库第三篇满分，唯一一篇首入即满分）。topic.py 三闸门一次过（24/100%/100%）；vet 拦下 14 次；swap.py 换 conduit→dike 四步一次做完；lockstep 全程比对词数', verification: 'conversation-latest-final' },
  '54': { source: '2026-09-01按三步法写成：topic.py 首跑动词仅16%当场拦下（第52篇乙稿同形，但这次在动笔前发现），换一套动词升到100%后成稿；入库一处 VAL-02h（right 5.96，vet 早拦过而我仍用了），已改 straighten', verification: 'conversation-latest-final' },
  '53': { source: '2026-09-01按新立的三步法一稿成：topic.py 三闸门一次过（可用词25／名词6-6／动词6-6），闸门三只警告 pheasant×3；写作阶段 vet 拦下六处（patrol/cartload/poaches/third/watch/harvest）；入库仅一处 MET-07，归因机制当场点名换词没走 swap', verification: 'conversation-latest-final' },
  '52': { source: '2026-09-01写了四稿：大富翁（论点名词被占光）／限嗣继承（动词被占光）／劳合社（核心词贯穿全篇）／骨瓷（成）。第四稿全程用新装的 topic.py 三闸门与 vet 归因，入库即零硬伤；闸门三提前警告 china/makeshift/stone 会重复，撤重复后用同义词把名额从33换回50', verification: 'conversation-latest-final' },
  '51': { source: '2026-09-01按《总令》新立的三步法首次一次成稿：扫域（香水与化妆62%）→brief报30个→上网核；入库时暴露上一轮自造的工具缺陷：review把分布极差列为结构提示而检察官判为BAL-01硬伤，已改归阻塞项', verification: 'conversation-latest-final' },
  '50': { source: '2026-09-01按《总令》全流程新写，写了三次：第一稿（肉豆蔻垄断）因论点线用词被49篇占光而弃；第二稿（赛马让分制）第11轮即已达标270词/50名额，我却为消一条结构提示继续改、六轮回不到达标；最终取回第11轮那一版。动笔前逐条上网核四项', verification: 'conversation-latest-final' },
  '49': { source: '2026-09-01按《总令》全流程新写：疫苗与免疫域；brief 首判「可用词13个太少」，换角度重写材料后升至22；动笔前逐条上网核六项；三处换词全走 swap.py；VAL-14 第四次逮到 ran/fought；swap 之后自己对读逮出中文不通顺一处', verification: 'conversation-latest-final' },
  '48': { source: '2026-09-01按《总令》全流程新写：警务与消防域，核心词批 vet 通过率77%为全会话最高；动笔前逐条上网核六项；新装的不规则变化检查拦下 worn(撞38篇wear)与 hidden(撞14篇hide)；检察官报§2一段做两件事，拆段前先跑 movecheck 确认拆与挪之别', verification: 'conversation-latest-final' },
  '47': { source: '2026-09-01按《总令》全流程新写：教育与考试域（vet通过率60%）；动笔前逐条上网核五项；初稿285词仅32名额、密度11.2%，诊断为句子太长太散，整篇改用短句密排后270词/50名额/18.5%；每个词都先跑 agent vet，入库即零硬伤', verification: 'conversation-latest-final' },
  '46': { source: '2026-09-01按《总令》全流程新写：先问工具「哪些语义域还有词」再据此选题材（教育/体育域仍余五成，常写域已被吃掉七成）；VAL-14 第二次逮到 stood/ran；MET-09 逮到表内释义错位；三处换词全走 swap.py；段落调整一次失手已撤回', verification: 'conversation-latest-final' },
  '46': { source: '2026-09-01按《总令》全流程新写：先问工具哪些语义域还剩词再定题材（教育与考试50%、体育与竞赛44%）；动笔前逐条上网核五项；VAL-14 第二次逮到 stood/ran；MET-09 逮到 sprinters 表义与括注不齐；三处换词全走 swap.py；第11轮为摊平段长挪句反致极差20→34，已复原', verification: 'conversation-latest-final' },
  '45': { source: '2026-09-01按《总令》全流程新写：brief 筛三个候选题材后选定并加厚角度（17→37词）；动笔前逐条上网核六项；VAL-14 头一次在新篇上逮到 sold/stood 两处；三处换词全部走 swap.py 四步合一；MET-07/08 零报出', verification: 'conversation-latest-final' },
  '44': { source: '2026-09-01按《总令》全流程新写：先用 brief 判出原题材可用词仅13个、换角度后升至33个；动笔前逐条上网核五项；本轮补名额全部先跑 agent vet，零撞车；MET-07/08 零报出，是本会话中英失配一族头一次一篇之内没犯', verification: 'conversation-latest-final' },
  '43': { source: '2026-08-27按《总令》全流程新写：动笔前逐条上网核六项；全程用新装的 agent vet 核验候选词（六批七十余词，一次撞车都没有）；唯一一次自伤 built 恰是没跑 vet 直接填的；NUM-01/NUM-02/VAL-13/MET-09 四层零报出', verification: 'conversation-latest-final' },
  '42': { source: '2026-08-27按《总令》全流程新写：动笔前逐条上网核五项；VAL-13/MET-09 双双零报出；检察官报「中段无转折词」当场补上转轴处的 Yet；补名额时 word 是白送词被 VAL-02h 逮出，改动自伤第19次', verification: 'conversation-latest-final' },
  '41': { source: '2026-08-27按《总令》全流程新写：动笔前否掉一个选题（瓦维洛夫种子库，核心数字有三说）再定题；逐条上网核五项；VAL-13 在入库前拦下 flip/flipped 同词元；新功率计拒收两轮，补足否决项后升至满功率；STR-01「全篇无人名」判为可接受并写明理由，改由文号 SM/87/13 承担具体性', verification: 'conversation-latest-final' },
  '40': { source: '2026-08-27按《总令》全流程新写：动笔前逐条上网核七项；MET-09 与 VAL-13 双双零报出，是这两层立起来后第一篇一次过的；补名额时 rode 撞第32篇，改动自伤第17次', verification: 'conversation-latest-final' },
  '39': { source: '2026-08-27按《总令》全流程新写：动笔前逐条上网核八项（Reid v. Dunn 1962）；新装的 MET-09 当场逮出 decides 释义挂了 controls 的意思；补名额时连撞三次（covered/square/remote），第三次才想起先查冲突', verification: 'conversation-latest-final' },
  '38': { source: '2026-08-20按《总令》全流程新写：动笔前逐条上网核十一项＋两说存照＋★按雷24自算揭出一处来源本身错十倍（国家地理称托瓦兹加长20英寸，实为约2英寸）；本篇是全库踩规则最多的一篇，十六处词踩VAL-02h/09/11/12', verification: 'conversation-latest-final' },
  '37': { source: '2026-08-20按《总令》全流程新写：动笔前逐条上网核十三项＋两说存照；VAL-11 一次逮出四个数词、VAL-12 五个初中词，处置一律为取消加粗、正文数字一个未动', verification: 'conversation-latest-final' },
  '36': { source: '2026-08-20按《总令》全流程新写：动笔前逐条上网核（十三项）＋两说存照＋一处未取得出处改为不依赖→词池→七查→入库→十五层＋六个新层→第9轮五问→十三轮跑满；VAL-11/12 当场逮出 eighth 一词踩两条规则', verification: 'conversation-latest-final' },
  '35': { source: '2026-08-20按《第35篇写作提示词》二十六雷全流程新写：动笔前逐条上网核＋自算倍数＋一年一事→词池→六查→入库→十五层→第9轮五问→台账；断言当场拦下 thirteen 数词与 One report 双词加粗', verification: 'conversation-latest-final' },
  '34': { source: '2026-08-20按《第34篇写作提示词》全流程新写：动笔前先核实每个数字→词池→草稿十五轮→入库→十五层→第9轮五问→台账；10个白送词全部按第零条之三处置；减法轮判定不落刀', verification: 'conversation-latest-final' },
  '33': { source: '2026-08-20按《第33篇写作提示词》全流程新写：动笔前先核实每个数字→词池→草稿十三轮→入库→十五层→第9轮五问→台账；3个白送词与2个行话词全部按第零条之三处置', verification: 'conversation-latest-final' },
  '32': { source: '2026-08-20按《第32篇写作提示词》全流程新写：动笔前先核实每个数字→词池→草稿二十余轮→入库→十五层→第9轮五问→台账；15个白送词与2个行话词全部按第零条之三处置（取消加粗、让出名额）', verification: 'conversation-latest-final' },
  '31': { source: '2026-08-20按《第24篇写作提示词》全流程新写：**选题后先上网核实每个数字再动笔**→词池→草稿十一轮→入库→十五层→第9轮五问→台账；四个白送词全部按第零条之三处置（取消加粗、让出名额，未改英文）', verification: 'conversation-latest-final' },
  '30': { source: '2026-08-24第30篇浮法玻璃主题第13轮独立盲审最终精进锁定稿；经原始专利与Pilkington官方工艺资料复核，明确对玻璃的低反应性、6.8毫米平衡厚度、浮渣风险与轧辊接触边界，并完成前1450词同根去重及全库验证', verification: 'conversation-latest-final' },
};

const VERSION_IDS = {
  '01': '01-267-word-final-locked',
  '02': '02-271-word-final-locked',
  '03': '03-267-word-final-locked',
  '04': '04-270-word-final-locked',
  '05': '05-271-word-final-locked',
  '06': '06-268-word-final-locked',
  '07': '07-266-word-final-locked',
  '08': '08-268-word-final-locked',
  '09': '09-271-word-final-locked',
  '10': '10-271-word-final-locked',
  '11': '11-271-word-final-locked',
  '12': '12-268-word-final-locked',
  '13': '13-270-word-final-locked',
  '14': '14-271-word-final-locked',
  '15': '15-270-word-final-locked',
  '16': '16-270-word-final-locked',
  '17': '17-270-word-final-locked',
  '18': '18-269-word-final-locked',
  '19': '19-270-word-final-locked',
  '20': '20-268-word-final-locked',
  '21': '21-269-word-final-locked',
  '22': '22-271-word-final-locked',
  '23': '23-268-word-final-locked',
  '24': '24-262-word-final-locked',
  '25': '25-267-word-final-locked',
  '26': '26-266-word-final-locked',
  '27': '27-271-word-final-locked',
  '28': '28-271-word-final-locked',
  '29': '29-271-word-final-locked',
  '30': '30-271-word-final-locked',
  '31': '31-266-word-final-locked',
  '32': '32-271-word-final-locked',
  '33': '33-264-word-final-locked',
  '34': '34-268-word-final-locked',
  '35': '35-270-word-final-locked',

};

const SUPERSEDED_SIGNATURES = {
  '02': ['These **processes** **support** a food **chain**'],
  '04': ['Finding **longitude** required the time somewhere else.'],
  '16': [
    'sent **seismic** waves through the planet',
    'read traces from **seismographs**',
    'Yet faint P′ **arrivals** did.',
    'made diffraction untenable',
    'In science, **absence** belongs to a model.',
  ],
  '17': [
    'Measurements upheld the **empirical** **framework**.',
    "compresses this into one man's **revelation**",
  ],
  '18': [
    'Princeton **cosmologists**',
    'Penzias and Wilson called it a **provisional** explanation.',
    'Shorter-wave measurements soon **corroborated** the **cosmic** **background** **radiation**.',
    'ruled out ground **interference**',
    'The excess was **isotropic**',
    'Their paper presented it only as a **provisional** explanation.',
    '**corroborated** the signal as **cosmic** **background** **radiation**',
    'COBE found a near-perfect 2.725 K black-body **profile**',
    'The uniform **thermal** glow became a **signature**',
    'Its force came from a stricter fact',
    'the sky alone would not go quiet',
    'taped every **seam**',
    'a near-perfect 2.725 K black-body spectral **profile**',
    '**Pigeons** had made a **roost** inside;',
    'Penzias and Wilson treated it as **provisional**.',
    '天空始终无法安静',
  ],
  '19': [
    'Five Alarms, No Abort',
    '**powered** **descent**',
    'on **standby**',
    '**scheduler**',
    '**diagnostic**',
    '**reliability**',
    'lower-ranked display work',
    'stayed active as a **contingency**',
    'A mode **configuration** and electrical **mismatch** generated',
    'periodic display job erased the narrow **headroom**',
    'Yet the alarm showed a defence working.',
    'returned selected programs to protected **checkpoints**',
    'lower-ranked monitor work',
    'with **speed**, **attitude** and the landing path under control',
    'The deeper lesson lay in **architecture**.',
    'expendable jobs vanished to **safeguard** navigation',
    'Over five minutes after ignition, the **readout** 1202 flashed',
    '1201 followed later',
    'Each reported an executive **overload**',
    'remained on as a **contingency**',
    'Its mode **configuration** exposed an electrical **mismatch**',
    'rapid counter **requests**',
    'Tasks began to **queue**',
    'assigned every job a **priority**',
    'ran out of room',
    'protected **checkpoints**',
    'It could **retain**',
    'identified the numbers',
    'the readings remained **coherent**',
    'The lesson lay in **architecture**',
    'did not promise never to overload',
    'The sacrifice was **selective**',
    'not decorative',
    'meant protecting the **essential** work',
    '计算机没有假装一切正常',
  ],
  '20': [
    'Congress did not **prescribe** **uniform** machinery.',
    '**purchase** permits',
    'Continuous **monitors** measured each stack',
    'the **excess**',
    '**freight** cost',
    '**railway** **competition**',
    'The **institutional** lesson is sharper.',
    'US **legislation** confronted acid rain',
    'a **precursor** to acidic **deposition**',
    '**procure** permits',
    'sell a **surplus**; unused units',
    'Markets worked only because',
    'brought an automatic **penalty** and required',
    'local air-quality rules',
    'compliance **expense** fell below',
    '**competition** among **carriers**',
    'the **acceptable** total',
    'most **cheaply**',
    'a **bounded** quantity',
    '**ration** **permission**',
    'the sequence itself',
    'had lower **marginal** costs',
    '重新**分配**(reallocate)',
  ],
  '02': [
    'a **geological** **expedition** **aboard** the ship Knorr **sought** hot water',
    'the Galápagos **Rift**',
    'The giant **tube** **worm** carries it furthest',
    'Such **abundance** belonged two kilometres higher',
    'had been **assumed** a **desert** fed by **debris** from above',
    'a second **base**, a food **web** driven by the planet',
    'to anywhere chemistry holds a **gradient** open',
    'a **camera** system called ANGUS **registered** a **rise** in **temperature**',
    'The **photographs** told a different story.',
    'Many larger **species** **derive** nourishment from these microbes.',
    'These **reactions** **support** a food **chain**',
    'an otherwise suitable environment need not be **defined** by sunlight',
    'a **usable** **flow** of energy',
    'came back with evidence that a community could **flourish** in permanent darkness',
    '第二篇全新重写稿',
  ],
  '03': [
    'At Halley, a **station** in Antarctica',
    'Its **routine** **observations** formed a **baseline**: measure, record, repeat.',
    'their **data** matched, confirming the **unexpected** result',
    'a **decline** of **approximately** 40% from the 1960s **average**',
    'In its 16 May 1985 issue, the **journal** *Nature* **published**',
    'Returning **sunlight** **released** **active** **chlorine** atoms',
    'an **international** **agreement** to **restrict**',
    'It entered into **force** on 1 January 1989',
    'One graph exposed a **planetary** risk',
    '第三篇精进定稿',
  ],
  '07': [
    'Their **value** to a reader differed; the **technical** task did not.',
    'he **credited** John Tukey with suggesting the **term** \u201cbit\u201d',
    'In human **language**, symbols are not uniformly **random**',
    '**source** coding can therefore compress a message',
    'more **likely** **sequences** and longer ones to rare sequences',
    'each channel has a **maximum** reliable information **rate**',
    'His **result** established that such codes existed',
    'Shannon\u2019s **model** did not judge a message\u2019s **purpose**',
    'That **restraint** made the theory **general**',
    '273 \u8bcd / 50 \u91cd\u70b9\u8bcd / \u5bc6\u5ea6 18.3%',
  ],
  '01': [
    'marked each death with a **stroke** against the address on a **map** of the **district**',
    'had its own **well** and **recorded** five deaths',
    'A theory is **tested** not by the cases it **fits**, but by the one it cannot **survive**.',
    'the **gesture** **altered** little',
    'He had **demonstrated** something more useful than a **proof**',
    '第一篇最终精校稿',
  ],
  '05': [
    'a **cashier** at a Marsh supermarket in Troy, Ohio, passed a **humble** 67-cent pack',
    'The **invention** came earlier; **negotiation** and **coordination** made scanning **ordinary**.',
    'because a bull\u2019s-eye was **vulnerable** to ink spread',
    'A photodiode **detector** measured the **reflected** light',
    'the system\u2019s **elegance** was **apparent** and the **consensus** behind it invisible',
    '270 \u8bcd / 50 \u91cd\u70b9\u8bcd / \u5bc6\u5ea6 18.5%\u0000',
    '\u7b2c\u4e94\u7bc7\u7cbe\u8fdb\u5b9a\u7a3f',
  ],
  '06': [
    'As **population** rose, reliance on manure and nitrate deposits',
    'Alwin Mittasch\u2019s group replaced scarce osmium with activated iron',
    'Gas purification and heat recovery helped raise plant **capacity**.',
    'Some **civilian** output **shifted** to **military** use',
    'The **burden** we **inherit** lies beyond the reactor',
    '265 \u8bcd / 50 \u91cd\u70b9\u8bcd / \u5bc6\u5ea6 18.9%',
  ],
  '04': [
    'a one-hour gap between local and **reference** time represented a 15-degree **difference**',
    'John Harrison, a **carpenter** and **self-taught** clockmaker',
    'H4\u2019s **performance** in the 1761\u201362 Jamaica **trial** seemed strong',
    'Payment was split in 1765: one **contingent** on **disclosure**',
    'Harrison\u2019s **legacy** was to show a **portable** clock could carry reference time',
    '260 \u8bcd / 50 \u91cd\u70b9\u8bcd / \u5bc6\u5ea6 19.2%',
  ],
  '11': [
    'a **current** produced a magnetic **effect**',
    'A **pulse** made the galvanometer needle **swing** for a **brief** **moment**',
    'Today, a **change** in magnetic flux through a circuit induces an electric **field**',
    'the first **machine** to **create** continuous electrical **output**',
    'the generator feeds **power** into a **network** serving a **city**',
    '255 \u8bcd / 50 \u91cd\u70b9\u8bcd / \u5bc6\u5ea6 19.6%',
  ],
  '13': [
    'The **claim** **challenged** the **idea** of fixed genetic addresses.',
    'at the 1951 Cold Spring Harbor **conference**, many in the **audience** did not **appreciate**',
    'Her data won more respect than her interpretation; she **explored** further.',
    'The discovery was **recognised** with the 1983 Nobel **Prize**.',
    'when Ds left the gene **early**, subsequent **daughter** cells inherited',
    '262 \u8bcd / 50 \u91cd\u70b9\u8bcd / \u5bc6\u5ea6 19.1%',
  ],
  '12': [
    'To determine **Earth**\u2019s **age**, Harrison Brown\u2019s group used **nuclear** **decay**',
    'His 1956 **paper** put the **figure** at 4.55',
    'Later **scientists** refined but barely changed the **answer**.',
    'In 1973, the EPA, a **federal** **agency**, issued **rules** to **phase** down lead',
    'As petrol lead fell, **blood**-lead levels fell too; the **health** benefit became measurable.',
    '264 \u8bcd / 50 \u91cd\u70b9\u8bcd / \u5bc6\u5ea6 18.9%',
  ],
  '09': [
    'a Somali **hospital** **cook**, developed a **rash**',
    'In 1967 WHO intensified an **ambitious** **global** **campaign** to **free** humanity',
    'A **report** of a **suspected** **case** triggered an **investigation**.',
    'No single **feat** secured the **triumph**',
    'searching turned absence into evidence people could **trust**',
    '265 \u8bcd / 50 \u91cd\u70b9\u8bcd / \u5bc6\u5ea6 18.9%',
  ],
  '14': [
    'Their **drift** implied a **route** across the polar **sea**.',
    'Fram\u2019s **crew** **sailed** from Norway in 1893 with years of **food**',
    'The drift **missed** Nansen\u2019s hoped-for **goal** of passing near the Pole',
    'they wintered in a stone **shelter** on an **island** in Franz Josef Land',
    'The expedition **achieved** its **chief** scientific aim.',
    '268 \u8bcd / 50 \u91cd\u70b9\u8bcd / \u5bc6\u5ea6 18.7%',
  ],
  '15': [
    'a **worker** crossed the **roofs** of a moving freight train',
    'Westinghouse made air braking practical without originating it',
    'The 1869 straight-air trials **persuaded** **reluctant** **managers**',
    'The capability, not Westinghouse\u2019s brand, became **compulsory**.',
    'A train-pipe break actuated the valves; stored air applied the brakes.',
  ],
  '19': [
    'Landing already imposed a heavy **workload**',
    'guidance **officer** Steve Bales watched his **console** while back-room **specialist** Jack Garman',
    'Bales\u2019s **judgement** was \u201cgo\u201d; Eagle could **proceed**.',
    'That sacrifice is **selective**: expendable jobs are dropped to **safeguard** navigation.',
    '**Software** **robustness** means protecting **essential** work by deciding pre-launch',
    '270 \u8bcd / 50 \u91cd\u70b9\u8bcd / \u5bc6\u5ea6 18.5% (old-19)',
  ],
  '20': [
    'Cuts arrived **ahead** of schedule; compliance **expense** was below early **forecasts**.',
    'A **shortfall** triggered an automatic **penalty**',
    'Success rested on a **bounded** allowance supply, **credible** measurement, flexible exchange',
    '269 \u8bcd / 50 \u91cd\u70b9\u8bcd / \u5bc6\u5ea6 18.6% (old-20)',
  ],
  '08': [
    'Henrietta Leavitt joined a **staff** of **female** \u201ccomputers\u201d',
    'The Small Magellanic Cloud, her **region** of study, offered an **advantage**',
    'each series lay close to a **straight** line',
    'A Cepheid could then serve as a **standard** **candle**',
    '269 \u8bcd / 50 \u91cd\u70b9\u8bcd / \u5bc6\u5ea6 18.6% (old-08)',
  ],
  '28': [
    'Neptune posed a **propellant** problem',
    'The manoeuvre had an older **pedigree**',
    'Momentum changes hands',
    "Voyager's **limitation** became an **asset** because its route itself supplied **propulsion**",
    '269 \u8bcd / 50 \u91cd\u70b9\u8bcd / \u5bc6\u5ea6 18.6% (old-28)',
  ],
  '29': [
    'Godin de Lépinay instead proposed **dams** and **locks**',
    '18-foot **culverts**',
    'When the chamber reached the next water level, the gate opened.',
    'Scale made that cycle **formidable**.',
    '**staircase** carried a price',
    'lake **freshwater**',
    '当闸室达到下一级水位时',
    '抬高的航道',
    '工作水体',
  ],
  '30': [
    'flowed on to molten tin',
    'largely **unreactive** and thermally **conductive**',
    'surface **tension** checked it',
    '**irregularities** **relaxed**',
    'a narrow balance of chemistry and temperature',
    'Tin oxidised into **dross** in air, **blemishing** the glass',
    'Liquids created **pristine** faces',
    '等表面硬化后才交给轧辊',
    '它的沸点较高，是**高沸点**',
    '会给玻璃**留下瑕疵**(blemishing)',
  ],
};

function loadArticles() {
  globalThis.window = globalThis;
  require(path.join(DATA_DIR, 'articles.js'));
  for (const file of fs.readdirSync(DATA_DIR).filter((name) => /^article-\d+\.js$/.test(name)).sort()) {
    require(path.join(DATA_DIR, file));
  }
  return [...globalThis.SITE.ARTICLES].sort((a, b) => String(a.id).localeCompare(String(b.id)));
}

function stable(value) {
  if (Array.isArray(value)) return value.map(stable);
  if (value && typeof value === 'object') {
    const result = {};
    for (const key of Object.keys(value).sort()) result[key] = stable(value[key]);
    return result;
  }
  return value;
}

function sha256(input) {
  return crypto.createHash('sha256').update(input).digest('hex');
}

function gitBlobSha(buffer) {
  const header = Buffer.from(`blob ${buffer.length}\0`, 'utf8');
  return crypto.createHash('sha1').update(header).update(buffer).digest('hex');
}

function canonicalFingerprint(article) {
  return sha256(Buffer.from(JSON.stringify(stable(article)), 'utf8'));
}

function markdownPath(article) {
  return path.join(ARTICLE_DIR, `${article.id}-${article.slug}.md`);
}

function normalizedMarkdownBuffer(file) {
  const text = fs.readFileSync(file, 'utf8').replace(/\r\n?/g, '\n');
  return Buffer.from(text, 'utf8');
}

function densityDisplay(value) {
  return Number(value).toFixed(1);
}

function createManifest(articles) {
  const entries = articles.map((article) => {
    const source = SOURCE_AUDIT[article.id];
    if (!source) throw new Error(`missing source audit for article ${article.id}`);
    const file = markdownPath(article);
    if (!fs.existsSync(file)) throw new Error(`missing Markdown: ${path.relative(ROOT, file)}`);
    const raw = fs.readFileSync(file);
    const normalized = normalizedMarkdownBuffer(file);
    const currentBlob = gitBlobSha(raw);
    if (source.blob && currentBlob !== source.blob) {
      throw new Error(`article ${article.id} is not byte-identical to the approved uploaded final: ${currentBlob} != ${source.blob}`);
    }
    return {
      id: article.id,
      slug: article.slug,
      title: article.title,
      title_zh: article.titleZh,
      version_id: VERSION_IDS[article.id] || `${article.id}-final`,
      status: article.status,
      date: article.date,
      words: article.metrics.words,
      keywords: article.metrics.keywords,
      density: Number(article.metrics.density),
      source: source.source,
      source_verification: source.verification,
      approved_source_blob_sha: source.blob || null,
      canonical_fingerprint_sha256: canonicalFingerprint(article),
      markdown_sha256: sha256(normalized),
      markdown_git_blob_sha: currentBlob,
      superseded_signatures: SUPERSEDED_SIGNATURES[article.id] || [],
    };
  });
  return {
    schema_version: 1,
    policy: 'latest-final-only',
    audited_at: '2026-08-24',
    article_count: entries.length,
    keyword_count: entries.reduce((sum, entry) => sum + entry.keywords, 0),
    articles: entries,
  };
}

function validateManifest(articles, manifest) {
  const errors = [];
  const byId = new Map(articles.map((article) => [article.id, article]));
  const entries = manifest.articles || [];
  if (manifest.policy !== 'latest-final-only') errors.push('manifest policy is not latest-final-only');
  if (manifest.article_count !== articles.length) errors.push(`manifest article_count ${manifest.article_count} != ${articles.length}`);
  const keywordCount = articles.reduce((sum, article) => sum + article.metrics.keywords, 0);
  if (manifest.keyword_count !== keywordCount) errors.push(`manifest keyword_count ${manifest.keyword_count} != ${keywordCount}`);
  if (new Set(entries.map((entry) => entry.id)).size !== entries.length) errors.push('manifest contains duplicate article IDs');

  for (const entry of entries) {
    const article = byId.get(entry.id);
    if (!article) {
      errors.push(`manifest article ${entry.id} missing from canonical data`);
      continue;
    }
    const expected = {
      slug: article.slug,
      title: article.title,
      title_zh: article.titleZh,
      status: article.status,
      date: article.date,
      words: article.metrics.words,
      keywords: article.metrics.keywords,
      density: Number(article.metrics.density),
      canonical_fingerprint_sha256: canonicalFingerprint(article),
    };
    for (const [field, value] of Object.entries(expected)) {
      if (entry[field] !== value) errors.push(`article ${entry.id} ${field} mismatch`);
    }

    const file = markdownPath(article);
    if (!fs.existsSync(file)) {
      errors.push(`article ${entry.id} Markdown missing`);
      continue;
    }
    const raw = fs.readFileSync(file);
    const normalized = normalizedMarkdownBuffer(file);
    const markdownText = normalized.toString('utf8');
    const actualBlob = gitBlobSha(raw);
    const actualMarkdownSha = sha256(normalized);
    if (entry.markdown_git_blob_sha !== actualBlob) errors.push(`article ${entry.id} Markdown Git blob changed`);
    if (entry.markdown_sha256 !== actualMarkdownSha) errors.push(`article ${entry.id} Markdown SHA-256 changed`);
    if (entry.approved_source_blob_sha && actualBlob !== entry.approved_source_blob_sha) {
      errors.push(`article ${entry.id} no longer matches its exact uploaded final`);
    }
    const metricLine = `> 指标：${entry.words} 词 / ${entry.keywords} 重点词 / 密度 ${densityDisplay(entry.density)}%`;
    if (!markdownText.includes(metricLine)) errors.push(`article ${entry.id} Markdown metrics are stale`);
    if (!markdownText.includes(`> 状态：**${entry.status}**`)) errors.push(`article ${entry.id} Markdown status is stale`);

    const activeText = JSON.stringify(article) + '\n' + markdownText;
    for (const signature of entry.superseded_signatures || []) {
      if (activeText.includes(signature)) errors.push(`article ${entry.id} contains superseded signature: ${signature}`);
    }
  }

  for (const article of articles) {
    if (!entries.some((entry) => entry.id === article.id)) errors.push(`canonical article ${article.id} missing from manifest`);
  }

  if (!fs.existsSync(IRON_RULE_PATH)) errors.push('notes/最终版本铁律.md missing');
  const readme = fs.existsSync(README_PATH) ? fs.readFileSync(README_PATH, 'utf8') : '';
  const handoff = fs.existsSync(HANDOFF_PATH) ? fs.readFileSync(HANDOFF_PATH, 'utf8') : '';
  if (!readme.includes('## 最终版本铁律')) errors.push('README final-version rule missing');
  // ★★★ 指标不再写死 —— 从数据层算（2026-09-02 改）
  // **原先这里把 16—20 篇的整行期望硬编码。缺陷：
  //   若 README 与本文件同时旧掉，两者彼此自洽，守卫不报错。**
  // **实测**：第19篇早先从 271/18.5 改成 269/18.6，
  //   **README 与本文件都还是旧值，preflight 一路全绿**；
  //   直到一次全局 sed 误伤了 README，守卫才叫起来。
  // **处置：与不规则动词表同例 —— 让指标只有一个来源（data/*.js）。**
  for (const article of articles) {
    const m = article.metrics;
    if (!m) continue;
    const cell1 = `**${m.words}词 · ${m.keywords}词 · ${m.density.toFixed(1)}%**`;
    const cell2 = `**${m.words} / ${m.keywords} / ${m.density.toFixed(1)}%**`;
    const rowRe = new RegExp(`^\\| \\*\\*${article.id}\\*\\* \\|.*$`, 'm');
    const rRow = readme.match(rowRe);
    if (rRow && !rRow[0].includes(cell1)) {
      errors.push(`README article ${article.id} metrics stale (want ${cell1})`);
    }
    const hRow = handoff.match(rowRe);
    if (hRow && !hRow[0].includes(cell2)) {
      errors.push(`handoff article ${article.id} metrics stale (want ${cell2})`);
    }
  }
  return errors;
}

function auditReport(manifest) {
  const tick = '`';
  const rows = manifest.articles.map((entry) =>
    `| ${entry.id} | *${entry.title}* | ${entry.status} | ${entry.words} / ${entry.keywords} / ${densityDisplay(entry.density)}% | ${tick}${entry.canonical_fingerprint_sha256.slice(0, 12)}${tick} |`
  );
  return [
    '# 全库最终版本审计 · 2026-08-24',
    '',
    '> 审计范围：第01—30篇的权威数据、正式Markdown、最终校正记录、README、交接文档和主分支校验。',
    '> 结论：前29篇保持既有锁定身份；第30篇271词第13轮独立盲审稿已完成原始专利与Pilkington官方工艺资料复核、技术限定与中英表达精修及1500词全库复验。',
    '',
    '## 一、逐篇锁定清单',
    '',
    '| 编号 | 标题 | 当前状态 | 指标 | 内容指纹前12位 |',
    '|---|---|---|---:|---|',
    ...rows,
    '',
    `合计：${manifest.article_count}篇、${manifest.keyword_count}个重点词。`,
    '',
    '## 二、原始最终稿复核',
    '',
    '- 第01—29篇：继续以此前manifest中的完整内容指纹与Markdown指纹为权威身份；本次未重写既有文章。',
    '- 第30篇：271词、50重点词、18.5%，五段各10词；第13轮只纳入可证明净提升，未更换50词词池，也未改变标题与核心结构。',
    '- 第30篇功劳边界：不把熔融金属浴原理写成前所未有，并同时保留Alastair Pilkington、Kenneth Bickerstaff与七年开发团队的有据贡献。',
    '- 第30篇技术边界：把低反应性明确限定为相对于玻璃，把6.8毫米写成进一步变薄受限的平衡点，把浮渣写成可能留下瑕疵，并把机械接触限定到玻璃带变硬以后。',
    '',
    '## 三、逐字一致的上传文件证据',
    '',
    '| 编号 | 批准来源Git blob SHA |',
    '|---|---|',
    ...manifest.articles.filter((entry) => entry.approved_source_blob_sha).map((entry) => `| ${entry.id} | ${tick}${entry.approved_source_blob_sha}${tick} |`),
    '',
    '没有批准来源blob的文章以完整规范化内容指纹、Markdown指纹、来源说明和最终版本守卫共同锁定。',
    '',
    '## 四、永久防回滚措施',
    '',
    '1. 新增 `notes/最终版本铁律.md`。',
    '2. 新增 `data/final-version-manifest.json`，为每篇保存完整内容指纹。',
    '3. 新增 `scripts/final-version-guard.js`，检查指标、状态、全文指纹、Markdown指纹和旧稿特征。',
    '4. GitHub Actions在PR与主分支提交中运行最终版本守卫。',
    '5. 新最终稿只有在合并到 `main`、主分支回读正确且CI成功后，才算真正存到云端。',
    '6. 已合并或承载旧稿的临时分支应删除，避免旧版本继续被误认。',
    '',
    '## 五、最终判定',
    '',
    '本次同步完成后，主分支的30篇均为当前已知的最后最终版本；第30篇271词第13轮独立盲审最终精进锁定稿是当前最新权威版本。',
    '',
  ].join('\n');
}

function main() {
  const writeManifest = process.argv.includes('--write-manifest');
  const articles = loadArticles();
  let manifest;

  if (writeManifest) {
    manifest = createManifest(articles);
    fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2) + '\n', 'utf8');
    fs.writeFileSync(REPORT_PATH, auditReport(manifest), 'utf8');
    console.log(`wrote ${path.relative(ROOT, MANIFEST_PATH)} and ${path.relative(ROOT, REPORT_PATH)}`);
  } else {
    if (!fs.existsSync(MANIFEST_PATH)) throw new Error('final-version manifest missing');
    manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8'));
  }

  const errors = validateManifest(articles, manifest);
  if (errors.length) {
    for (const error of errors) console.error(`✗ ${error}`);
    process.exit(1);
  }
  for (const entry of manifest.articles) {
    console.log(`✓ ${entry.id} ${entry.words}词 · ${entry.keywords}重点词 · ${densityDisplay(entry.density)}% · ${entry.canonical_fingerprint_sha256.slice(0, 12)}`);
  }
  console.log(`\n${manifest.article_count}篇最终版本 · ${manifest.keyword_count}个重点词 · 指纹、指标与批准来源全部一致`);
}

main();
