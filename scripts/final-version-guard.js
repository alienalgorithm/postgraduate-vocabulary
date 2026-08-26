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
  '34': { source: '2026-08-20按《第34篇写作提示词》全流程新写：动笔前先核实每个数字→词池→草稿十五轮→入库→十五层→第9轮五问→台账；10个白送词全部按第零条之三处置；减法轮判定不落刀', verification: 'conversation-latest-final' },
  '33': { source: '2026-08-20按《第33篇写作提示词》全流程新写：动笔前先核实每个数字→词池→草稿十三轮→入库→十五层→第9轮五问→台账；3个白送词与2个行话词全部按第零条之三处置', verification: 'conversation-latest-final' },
  '32': { source: '2026-08-20按《第32篇写作提示词》全流程新写：动笔前先核实每个数字→词池→草稿二十余轮→入库→十五层→第9轮五问→台账；15个白送词与2个行话词全部按第零条之三处置（取消加粗、让出名额）', verification: 'conversation-latest-final' },
  '31': { source: '2026-08-20按《第24篇写作提示词》全流程新写：**选题后先上网核实每个数字再动笔**→词池→草稿十一轮→入库→十五层→第9轮五问→台账；四个白送词全部按第零条之三处置（取消加粗、让出名额，未改英文）', verification: 'conversation-latest-final' },
  '30': { source: '2026-08-24第30篇浮法玻璃主题第13轮独立盲审最终精进锁定稿；经原始专利与Pilkington官方工艺资料复核，明确对玻璃的低反应性、6.8毫米平衡厚度、浮渣风险与轧辊接触边界，并完成前1450词同根去重及全库验证', verification: 'conversation-latest-final' },
};

const VERSION_IDS = {
  '01': '01-270-word-final-locked',
  '02': '02-271-word-final-locked',
  '03': '03-267-word-final-locked',
  '04': '04-269-word-final-locked',
  '05': '05-271-word-final-locked',
  '06': '06-271-word-final-locked',
  '07': '07-269-word-final-locked',
  '08': '08-271-word-final-locked',
  '09': '09-269-word-final-locked',
  '10': '10-271-word-final-locked',
  '11': '11-271-word-final-locked',
  '12': '12-269-word-final-locked',
  '13': '13-265-word-final-locked',
  '14': '14-270-word-final-locked',
  '15': '15-268-word-final-locked',
  '16': '16-270-word-final-locked',
  '17': '17-268-word-final-locked',
  '18': '18-271-word-final-locked',
  '19': '19-267-word-final-locked',
  '20': '20-267-word-final-locked',
  '21': '21-271-word-final-locked',
  '22': '22-271-word-final-locked',
  '23': '23-271-word-final-locked',
  '24': '24-262-word-final-locked',
  '25': '25-267-word-final-locked',
  '26': '26-267-word-final-locked',
  '27': '27-271-word-final-locked',
  '28': '28-271-word-final-locked',
  '29': '29-271-word-final-locked',
  '30': '30-271-word-final-locked',
  '31': '31-267-word-final-locked',
  '32': '32-271-word-final-locked',
  '33': '33-271-word-final-locked',
  '34': '34-271-word-final-locked',

};

const SUPERSEDED_SIGNATURES = {
  '02': ['These **processes** **support** a food **chain**'],
  '04': ['Finding **longitude** required the time somewhere else.', '295 词 / 50 重点词 / 密度 16.9%'],
  '16': [
    'sent **seismic** waves through the planet',
    'read traces from **seismographs**',
    'Yet faint P′ **arrivals** did.',
    'made diffraction untenable',
    'In science, **absence** belongs to a model.',
    '296 词 / 50 重点词 / 密度 16.9%',
  ],
  '17': [
    'Measurements upheld the **empirical** **framework**.',
    "compresses this into one man's **revelation**",
    '263 词 / 50 重点词 / 密度 19.0%',
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
    '269 词 / 50 重点词 / 密度 18.6%',
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
    '263 词 / 50 重点词 / 密度 19.0%',
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
    '259 词 / 50 重点词 / 密度 19.3%',
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
    '255 词 / 50 重点词 / 密度 19.6%',
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
    '252 词 / 50 重点词 / 密度 19.8%',
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
  if (!readme.includes('| **16** | *The Wave That Should Not Have Arrived* | 1929—1952年英格·莱曼、P波阴影区与地球内核 | **270词 · 50词 · 18.5%** |')) {
    errors.push('README article 16 final row is stale');
  }
  if (!readme.includes('| 17 | *The Few That Came Back* | 1909—1913年盖革—马斯登散射实验与卢瑟福核式原子 | **268词 · 50词 · 18.7%** |')) {
    errors.push('README article 17 final row is stale');
  }
  if (!readme.includes('| **18** | *The Sky Would Not Go Quiet* | 1964—1992年彭齐亚斯、威尔逊、普林斯顿团队与宇宙微波背景 | **271词 · 50词 · 18.5%** |')) {
    errors.push('README article 18 final row is stale');
  }
  if (!readme.includes('| **19** | ***Five Alarms, Still Descending*** | **1969年阿波罗11号1201/1202程序警报、优先级软件与地面‘继续’判断** | **267词 · 50词 · 18.7%** |')) {
    errors.push('README article 19 final row is stale');
  }
  if (!readme.includes('| **20** | ***The Market Came After the Limit*** | **1990—2010年美国酸雨计划、二氧化硫总量控制与排放权交易** | **267词 · 50词 · 18.7%** |')) {
    errors.push('README article 20 final row is stale');
  }
  if (!readme.includes('| **28** | ***The Route Became the Engine*** | **20世纪60年代—1989年多行星引力助推、Grand Tour轨道设计与Voyager 2外行星飞掠** | **271词 · 50词 · 18.5%** |')) {
    errors.push('README article 28 final row is stale');
  }
  if (!readme.includes('| **29** | ***The Ships Climbed on Rainwater*** | **1879—1914年巴拿马运河船闸方案、加通湖与重力供水机制** | **271词 · 50词 · 18.5%** |')) {
    errors.push('README article 29 final row is stale');
  }
  if (!readme.includes('| **30** | ***The Window Floated on Tin*** | **1952—1959年皮尔金顿浮法玻璃、熔锡浴与液体自整平机制** | **271词 · 50词 · 18.5%** |')) {
    errors.push('README article 30 final row is stale');
  }
  if (!handoff.includes('## 2. 最终版本铁律（最高优先级）')) errors.push('handoff final-version rule missing');
  if (!handoff.includes('| **16** | ***The Wave That Should Not Have Arrived*** | **1929—1952年英格·莱曼、P波阴影区与地球内核** | **270 / 50 / 18.5%** | **第十六篇最终精进锁定稿** |')) {
    errors.push('handoff article 16 final row is stale');
  }
  if (!handoff.includes('| **18** | ***The Sky Would Not Go Quiet*** | **1964—1992年彭齐亚斯、威尔逊、普林斯顿团队与宇宙微波背景** | **271 / 50 / 18.5%** | **第十八篇最终精进锁定稿** |')) {
    errors.push('handoff article 18 final row is stale');
  }
  if (!handoff.includes('| **19** | ***Five Alarms, Still Descending*** | **1969年阿波罗11号1201/1202程序警报、优先级软件与地面‘继续’判断** | **267 / 50 / 18.7%** | **第十九篇最终精进锁定稿** |')) {
    errors.push('handoff article 19 final row is stale');
  }
  if (!handoff.includes('| **20** | ***The Market Came After the Limit*** | **1990—2010年美国酸雨计划、二氧化硫总量控制与排放权交易** | **267 / 50 / 18.7%** | **第二十篇最终精进锁定稿** |')) {
    errors.push('handoff article 20 final row is stale');
  }
  if (!handoff.includes('| **28** | ***The Route Became the Engine*** | **20世纪60年代—1989年多行星引力助推、Grand Tour轨道设计与Voyager 2外行星飞掠** | **271 / 50 / 18.5%** | **第二十八篇最终精进锁定稿** |')) {
    errors.push('handoff article 28 final row is stale');
  }
  if (!handoff.includes('| **29** | ***The Ships Climbed on Rainwater*** | **1879—1914年巴拿马运河船闸方案、加通湖与重力供水机制** | **271 / 50 / 18.5%** | **第二十九篇最终精进锁定稿** |')) {
    errors.push('handoff article 29 final row is stale');
  }
  if (!handoff.includes('| **30** | ***The Window Floated on Tin*** | **1952—1959年皮尔金顿浮法玻璃、熔锡浴与液体自整平机制** | **271 / 50 / 18.5%** | **第三十篇最终精进锁定稿** |')) {
    errors.push('handoff article 30 final row is stale');
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
