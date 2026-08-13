/* 19 · Five Alarms, Still Descending
   Canonical data extension. Loaded after data/articles.js.
*/
(function (root) {
  'use strict';
  var article = {
  "id": "19",
  "slug": "five-alarms-still-descending",
  "title": "Five Alarms, Still Descending",
  "titleZh": "五次警报，仍在下降",
  "standfirst": "“鹰号”在下降途中五次报出1201/1202；制导计算机确实过载，却通过重启与优先级保护核心任务，地面团队仍须根据遥测判断是否继续。",
  "topic": "1969年阿波罗11号1201/1202程序警报、优先级软件与地面“继续”判断",
  "date": "2026-08-13",
  "status": "第十九篇最终精进锁定稿",
  "metrics": {
    "words": 270,
    "keywords": 50,
    "density": 18.5
  },
  "paras": [
    {
      "en": "On 20 July 1969, Apollo 11’s **lunar** **lander** Eagle began its powered **descent**. Just over five minutes after ignition, 1202 flashed on the **cockpit** **readout**. Neil Armstrong called “program **alarm**”. Before **touchdown**, four 1202s and one 1201 appeared. Each signalled a computational **overload** of the guidance **processor**. The question was immediate: continue, or **abort**?",
      "zh": "1969年7月20日，阿波罗11号的**月球**(lunar)**着陆器**(lander)“鹰号”开始进入动力**下降**(descent)阶段。点火刚过五分钟，1202在**驾驶舱**(cockpit)**显示屏**(readout)上闪现。尼尔·阿姆斯特朗报告“程序**警报**(alarm)”。在**着陆**(touchdown)前，1202共出现四次，1201出现一次。每一次都表明制导**处理器**(processor)发生了计算**过载**(overload)。问题必须立即回答：继续，还是**中止**(abort)？"
    },
    {
      "en": "The **rendezvous** **radar** remained on for one **contingency**: an abort requiring a return to orbit. Its switch **configuration**, coupled with an AC phase **mismatch**, generated spurious angle-counter **requests**. Landing already imposed a heavy **workload**; a periodic display job consumed remaining **headroom**. Jobs entered the **queue** faster than the processor could finish them, triggering **overflow**.",
      "zh": "为了应对中止下降后必须返回轨道这一**应急情况**(contingency)，**交会**(rendezvous)**雷达**(radar)始终保持开启。当时的开关**配置**(configuration)与交流电相位**失配**(mismatch)共同作用，不断产生虚假的角度计数器**请求**(requests)。着陆程序本已带来沉重**工作负载**(workload)；一个周期性显示任务又耗尽了剩余的性能**余量**(headroom)。新任务涌入**队列**(queue)的速度超过处理器完成已有任务的速度，最终触发执行程序**溢出**(overflow)。"
    },
    {
      "en": "Yet each alarm showed a defence working. The computer’s **executive** scheduled jobs by **priority**. When the **allocator** found no free workspace, a **restart** cleared unfinished jobs and restored selected programs from recorded **checkpoints**. The computer could **retain** **critical** state, **discard** less urgent work, then **resume** guidance along the landing **trajectory**.",
      "zh": "但每一次警报也说明，一道防线正在发挥作用。计算机的**执行程序**(executive)按**优先级**(priority)调度任务。当任务**分配程序**(allocator)找不到空闲工作区时，一次**重新启动**(restart)会清除未完成任务，并从已记录的**检查点**(checkpoints)恢复选定程序。计算机能够**保留**(retain)**关键的**(critical)状态，**丢弃**(discard)不那么紧迫的工作，再**恢复**(resume)制导，使飞船继续沿着着陆**轨迹**(trajectory)前进。"
    },
    {
      "en": "Software alone did not make the call. At Mission Control, guidance **officer** Steve Bales watched his **console** while back-room **specialist** Jack Garman recognised the codes from a list he had **compiled**. They checked **telemetry**: readings remained **coherent**; **speed**, **attitude** and the landing path were under control. Bales’s **judgement** was “go”; Eagle could **proceed**.",
      "zh": "但最终决定并非由软件独自作出。在任务控制中心，制导**控制员**(officer)史蒂夫·贝尔斯盯着自己的**控制台**(console)，后室**专家**(specialist)杰克·加尔曼则根据自己事先**编制的**(compiled)清单辨认出这些警报代码。他们核对**遥测数据**(telemetry)：各项读数依然**相互吻合**(coherent)；**速度**(speed)、**姿态**(attitude)和着陆路径都在控制之中。贝尔斯的**判断**(judgement)是“继续”；“鹰号”可以**继续下降**(proceed)。"
    },
    {
      "en": "The deeper answer lay in system **architecture**. A **resilient** system can overload without collapsing; its **hierarchy** decides what to **sacrifice**. That sacrifice is **selective**: expendable jobs are dropped to **safeguard** navigation. The alarms were **actionable** warnings, not an automatic command to abort. **Software** **robustness** means protecting **essential** work by deciding pre-launch what can wait while the lander keeps descending.",
      "zh": "更深一层的答案在于系统**架构**(architecture)。一套**有韧性的**(resilient)系统即使过载，也不必崩溃；它的任务**层级**(hierarchy)会决定什么可以**舍弃**(sacrifice)。这种舍弃是**有选择的**(selective)：可放弃的任务会被剔除，以**保障**(safeguard)导航。这些警报给出的是**可供行动的**(actionable)警示，并不会自动判定任务必须中止。**软件**(Software)的**稳健性**(robustness)，在于发射前就决定哪些任务可以等待，从而保护**不可或缺的**(essential)工作，让着陆器继续下降。"
    }
  ],
  "glossary": [
    {"w": "lunar", "zh": "月球的；月球上的", "p": 1},
    {"w": "lander", "zh": "着陆器；登月舱", "p": 1},
    {"w": "descent", "zh": "下降；降落阶段", "p": 1},
    {"w": "cockpit", "zh": "驾驶舱", "p": 1},
    {"w": "alarm", "zh": "警报", "p": 1},
    {"w": "readout", "zh": "显示读数；读出结果", "p": 1},
    {"w": "overload", "zh": "过载；使负荷过重", "p": 1},
    {"w": "processor", "zh": "处理器；加工者", "p": 1},
    {"w": "abort", "zh": "中止；中止任务", "p": 1},
    {"w": "touchdown", "zh": "着陆；触地", "p": 1},
    {"w": "rendezvous", "zh": "交会；会合", "p": 2},
    {"w": "radar", "zh": "雷达", "p": 2},
    {"w": "contingency", "zh": "应急安排；意外情况", "p": 2},
    {"w": "configuration", "zh": "配置；构造", "p": 2},
    {"w": "mismatch", "zh": "失配；不相符", "p": 2},
    {"w": "request", "zh": "请求；要求", "p": 2},
    {"w": "workload", "zh": "工作负载；工作量", "p": 2},
    {"w": "queue", "zh": "排队；队列", "p": 2},
    {"w": "headroom", "zh": "余量；净空", "p": 2},
    {"w": "overflow", "zh": "溢出；超出容量", "p": 2},
    {"w": "executive", "zh": "执行程序；主管", "p": 3},
    {"w": "priority", "zh": "优先级；优先事项", "p": 3},
    {"w": "allocator", "zh": "分配程序；分配者", "p": 3},
    {"w": "restart", "zh": "重新启动；重新开始", "p": 3},
    {"w": "checkpoint", "zh": "检查点；核验点", "p": 3},
    {"w": "retain", "zh": "保留；保持", "p": 3},
    {"w": "critical", "zh": "关键的；危急的", "p": 3},
    {"w": "discard", "zh": "丢弃；抛弃", "p": 3},
    {"w": "resume", "zh": "恢复；继续", "p": 3},
    {"w": "trajectory", "zh": "轨迹；发展路径", "p": 3},
    {"w": "officer", "zh": "控制员；官员", "p": 4},
    {"w": "console", "zh": "控制台；安慰", "p": 4},
    {"w": "specialist", "zh": "专家；专科医生", "p": 4},
    {"w": "compile", "zh": "编制；汇编", "p": 4},
    {"w": "telemetry", "zh": "遥测；遥测数据", "p": 4},
    {"w": "coherent", "zh": "连贯的；相互吻合的", "p": 4},
    {"w": "speed", "zh": "速度；加速", "p": 4},
    {"w": "attitude", "zh": "姿态；态度", "p": 4},
    {"w": "judgement", "zh": "判断；判断力", "p": 4},
    {"w": "proceed", "zh": "继续进行；前进", "p": 4},
    {"w": "architecture", "zh": "架构；建筑学", "p": 5},
    {"w": "resilient", "zh": "有韧性的；能恢复的", "p": 5},
    {"w": "hierarchy", "zh": "层级；等级体系", "p": 5},
    {"w": "sacrifice", "zh": "牺牲；舍弃", "p": 5},
    {"w": "selective", "zh": "有选择的；选择性的", "p": 5},
    {"w": "safeguard", "zh": "保障；保护措施", "p": 5},
    {"w": "actionable", "zh": "可供行动的；可执行的", "p": 5},
    {"w": "software", "zh": "软件", "p": 5},
    {"w": "robustness", "zh": "稳健性；强健程度", "p": 5},
    {"w": "essential", "zh": "不可或缺的；本质的", "p": 5}
  ],
  "facts": [
    "1969年7月20日，‘鹰号’在动力下降开始约五分钟后首次报出1202。着陆前先后出现1202、1202、1201、1202、1202共五次程序警报；正文中的‘五次’不包含点火前另一次500系列雷达位置警报。[NASA Apollo 11 Lunar Surface Journal：着陆实录](https://www.nasa.gov/wp-content/uploads/static/history/alsj/a11/a11.landing.html)",
    "1201与1202都属于执行程序溢出警报：1201表示没有可用VAC区，1202表示没有可用核心集。两种情况都会触发软件重新启动；正文把‘警报’与‘硬件完全失控’严格区分。[Apollo 11飞行软件工程师Peter Adler：1201/1202程序警报](https://www.nasa.gov/wp-content/uploads/static/history/alsj/a11/a11.1201-pa.html)｜[Apollo 11 Luminary源代码：ALARM AND ABORT](https://www.ibiblio.org/apollo/listings/Luminary099/ALARM_AND_ABORT.agc.html)",
    "交会雷达保持开启并非简单的‘宇航员按错开关’：它在中止下降、返回轨道时具有用途。事后分析把异常负载追溯到雷达接口的电气相位问题，虚假的角度计数更新偷走了约13%的计算周期；Aldrin同时调用的周期性显示又进一步压缩余量。[Apollo 11技术组员复盘](https://www.nasa.gov/wp-content/uploads/static/history/alsj/a11/a11tcdb.html)｜[Don Eyles《Tales from the Lunar Module Guidance Computer》](https://klabs.org/history/apollo_11_alarms/eyles_2004/eyles_2004.htm)",
    "执行程序并不是把警报‘忽略掉’。它会重新初始化计算机、恢复选定的重要程序，并不再恢复错误排入的大量雷达任务；制导、发动机控制与人机显示因优先级更高而继续运行。正文因此使用‘保留关键状态、丢弃较低优先级工作’，而没有写成计算机从未真正过载。[Peter Adler：程序警报与重启机制](https://www.nasa.gov/wp-content/uploads/static/history/alsj/a11/a11.1201-pa.html)",
    "地面‘继续’判断同样不可省略。制导控制员Steve Bales向后室的Jack Garman询问；Garman事先整理了警报表，认出1202意味着暂时过载，Bales随后作出‘go’判断。正文没有把软件自动恢复等同于任务自动安全。[NASA：Jack Garman与1202判断](https://www.nasa.gov/image-article/apollo-era-hero-john-jack-garman-dies/)",
    "优先级架构来自多人长期工作，而非一次临场灵感。Hal Laning编写了Apollo计算机的执行程序；Margaret Hamilton领导MIT仪器实验室的软件工程部门，相关工作包括异步软件、优先级调度、优先级显示与人在回路中的决策能力。正文把最后论点落在‘预先决定什么可以等待’，而不是制造单一英雄。[MIT Infinite：Hal Laning与Apollo Executive](https://infinite.mit.edu/video/apollo-guidance-computer-project-mit-conference-series-part-2-9142001/)｜[MIT News：Margaret Hamilton与Apollo软件](https://news.mit.edu/2016/apollo-code-developer-margaret-hamilton-receives-presidential-medal-of-freedom-1117)",
    "1201/1202警报之外，Armstrong后来还为避开巨石区接管了部分手动控制；警报恢复并不意味着余下着陆没有风险。本文只讨论计算机过载与‘继续’判断，不把整个登月成功归结为单一软件机制。[NASA：Apollo 11着陆经过](https://www.nasa.gov/history/50-years-ago-one-small-step-one-giant-leap/)"
  ]
};

  root.SITE = root.SITE || {};
  root.SITE.ARTICLES = root.SITE.ARTICLES || [];
  if (!root.SITE.ARTICLES.some(function (item) { return item.id === article.id; })) {
    root.SITE.ARTICLES.push(article);
  }
})(typeof window !== 'undefined' ? window : globalThis);
