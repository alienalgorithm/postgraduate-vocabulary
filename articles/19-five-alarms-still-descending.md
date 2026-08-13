# 19 · Five Alarms, Still Descending

> 题材：1969年阿波罗11号1201/1202程序警报、优先级软件与地面“继续”判断
> 状态：**第十九篇最终精进锁定稿**（2026-08-13）
> 指标：270 词 / 50 重点词 / 密度 18.5%
> “鹰号”在最后下降阶段连续报出1201和1202；计算机没有假装一切正常，而是在过载中丢弃可等待的任务，地面团队则必须判断它是否仍能安全继续。

---

## 英文正文

On 20 July 1969, Apollo 11’s **lunar** **lander** Eagle began its powered **descent**. Over five minutes after ignition, the **readout** 1202 flashed in the **cockpit**. Neil Armstrong called “program **alarm**”; 1201 followed later. Five alarms appeared before **touchdown**. Each reported an executive **overload** in the guidance **processor**. The question was immediate: continue, or **abort**?

The **rendezvous** **radar** stayed active as a **contingency** if an abort required return to orbit. A mode **configuration** and electrical **mismatch** generated rapid counter **requests**. The landing program already imposed a heavy **workload**; a periodic display job erased the narrow **headroom**. Tasks began to **queue** faster than the processor could finish them, triggering **overflow**.

Yet the alarm showed a defence working. The computer’s **executive** assigned every job a **priority**. When the **allocator** ran out of room, a **restart** cleared unfinished jobs and returned selected programs to protected **checkpoints**. It could **retain** **critical** state, **discard** lower-ranked display work, then **resume** guidance without losing the landing **trajectory**.

Software alone did not make the call. At Mission Control, guidance **officer** Steve Bales watched his **console** while back-room **specialist** Jack Garman identified the numbers from a list he had **compiled**. They checked **telemetry**: the readings remained **coherent**, with **speed**, **attitude** and the landing path under control. Bales’s **judgement** was “go”; Eagle could **proceed**.

The deeper lesson lay in **architecture**. A **resilient** system did not promise never to overload; its **hierarchy** decided which work to **sacrifice**. The sacrifice was **selective**: expendable jobs vanished to **safeguard** navigation. The alarms were **actionable**, not decorative. **Software** **robustness** meant protecting the **essential** work by deciding, before launch, what could wait while the lander kept descending.

---

## 中文译文

> 铁律：英文加粗词在中文里对应的译法同样加粗，后附 `(english)` 括注词源。
> 中文按最自然的说法写，加粗落在自然说法上——不为对齐扭曲句法。

1969年7月20日，阿波罗11号的**月球**(lunar)**着陆器**(lander)“鹰号”开始进行有动力的**下降**(descent)。点火五分多钟后，**显示屏读数**(readout)1202在**驾驶舱**(cockpit)内亮起。尼尔·阿姆斯特朗报告“程序**警报**(alarm)”；稍后又出现1201。**着陆**(touchdown)前一共响起五次警报。每一次都表示制导**处理器**(processor)发生执行程序**过载**(overload)。问题必须立刻回答：继续，还是**中止**(abort)？

为在中止下降时仍能返回轨道，**交会**(rendezvous)**雷达**(radar)保持开启，作为一项**应急安排**(contingency)。一种模式**配置**(configuration)叠加电气**失配**(mismatch)，不断产生计数器**请求**(requests)。登月程序本已带来沉重**工作负载**(workload)；一个周期性显示任务耗尽了狭窄的性能**余量**(headroom)。任务开始**排队**(queue)，涌入速度超过处理器的完成速度，最终触发执行程序**溢出**(overflow)。

但警报也说明，一道防线正在发挥作用。计算机的**执行程序**(executive)为每项任务分配**优先级**(priority)。当任务**分配程序**(allocator)无处再放新作业时，一次**重新启动**(restart)会清除未完成任务，并让选定程序回到受保护的**检查点**(checkpoints)。系统能够**保留**(retain)**关键的**(critical)状态，**丢弃**(discard)优先级较低的显示任务，再**恢复**(resume)制导，使飞船不至偏离着陆**轨迹**(trajectory)。

但决定并非由软件独自作出。在任务控制中心，制导**控制员**(officer)史蒂夫·贝尔斯盯着自己的**控制台**(console)，后室**专家**(specialist)杰克·加尔曼则根据自己事先**编制的**(compiled)清单辨认警报编号。他们核对**遥测数据**(telemetry)：各项读数仍然**相互吻合**(coherent)，**速度**(speed)、**姿态**(attitude)和着陆路径都受控制。贝尔斯的**判断**(judgement)是“继续”；“鹰号”可以**继续下降**(proceed)。

更深一层的答案藏在系统**架构**(architecture)里。一套**有韧性的**(resilient)系统并不承诺永不过载；它的任务**层级**(hierarchy)决定应当**舍弃**(sacrifice)哪些工作。这种舍弃是**有选择的**(selective)：可放弃的任务被清除，以**保障**(safeguard)导航。警报提供的是**可供行动的**(actionable)信息，而不是装饰。**软件**(Software)的**稳健性**(robustness)，在于发射前就决定哪些任务可以等待，从而保护最**不可或缺的**(essential)工作，让着陆器继续下降。

---

## 50 词速查表

**§1**（10词）lunar 月球的；月球上的｜lander 着陆器；登月舱｜descent 下降；降落阶段｜cockpit 驾驶舱｜alarm 警报｜readout 显示读数；读出结果｜overload 过载；使负荷过重｜processor 处理器；加工者｜abort 中止；中止任务｜touchdown 着陆；触地

**§2**（10词）rendezvous 交会；会合｜radar 雷达｜contingency 应急安排；意外情况｜configuration 配置；构造｜mismatch 失配；不相符｜request 请求；要求｜workload 工作负载；工作量｜queue 排队；队列｜headroom 余量；净空｜overflow 溢出；超出容量

**§3**（10词）executive 执行程序；主管｜priority 优先级；优先事项｜allocator 分配程序；分配者｜restart 重新启动；重新开始｜checkpoint 检查点；核验点｜retain 保留；保持｜critical 关键的；危急的｜discard 丢弃；抛弃｜resume 恢复；继续｜trajectory 轨迹；发展路径

**§4**（10词）officer 控制员；官员｜console 控制台；安慰｜specialist 专家；专科医生｜compile 编制；汇编｜telemetry 遥测；遥测数据｜coherent 连贯的；相互吻合的｜speed 速度；加速｜attitude 姿态；态度｜judgement 判断；判断力｜proceed 继续进行；前进

**§5**（10词）architecture 架构；建筑学｜resilient 有韧性的；能恢复的｜hierarchy 层级；等级体系｜sacrifice 牺牲；舍弃｜selective 有选择的；选择性的｜safeguard 保障；保护措施｜actionable 可供行动的；可执行的｜software 软件｜robustness 稳健性；强健程度｜essential 不可或缺的；本质的

---

## 史实核对

以下关键信息已据所列来源核对：

- 1969年7月20日，‘鹰号’在动力下降开始约五分钟后首次报出1202。着陆前先后出现1202、1202、1201、1202、1202共五次程序警报；正文中的‘五次’不包含点火前另一次500系列雷达位置警报。[NASA Apollo 11 Lunar Surface Journal：着陆实录](https://www.nasa.gov/wp-content/uploads/static/history/alsj/a11/a11.landing.html)
- 1201与1202都属于执行程序溢出警报：1201表示没有可用VAC区，1202表示没有可用核心集。两种情况都会触发软件重新启动；正文把‘警报’与‘硬件完全失控’严格区分。[Apollo 11飞行软件工程师Peter Adler：1201/1202程序警报](https://www.nasa.gov/wp-content/uploads/static/history/alsj/a11/a11.1201-pa.html)｜[Apollo 11 Luminary源代码：ALARM AND ABORT](https://www.ibiblio.org/apollo/listings/Luminary099/ALARM_AND_ABORT.agc.html)
- 交会雷达保持开启并非简单的‘宇航员按错开关’：它在中止下降、返回轨道时具有用途。事后分析把异常负载追溯到雷达接口的电气相位问题，虚假的角度计数更新偷走了约13%的计算周期；Aldrin同时调用的周期性显示又进一步压缩余量。[Apollo 11技术组员复盘](https://www.nasa.gov/wp-content/uploads/static/history/alsj/a11/a11tcdb.html)｜[Don Eyles《Tales from the Lunar Module Guidance Computer》](https://klabs.org/history/apollo_11_alarms/eyles_2004/eyles_2004.htm)
- 执行程序并不是把警报‘忽略掉’。它会重新初始化计算机、恢复选定的重要程序，并不再恢复错误排入的大量雷达任务；制导、发动机控制与人机显示因优先级更高而继续运行。正文因此使用‘保留关键状态、丢弃较低优先级工作’，而没有写成计算机从未真正过载。[Peter Adler：程序警报与重启机制](https://www.nasa.gov/wp-content/uploads/static/history/alsj/a11/a11.1201-pa.html)
- 地面‘继续’判断同样不可省略。制导控制员Steve Bales向后室的Jack Garman询问；Garman事先整理了警报表，认出1202意味着暂时过载，Bales随后作出‘go’判断。正文没有把软件自动恢复等同于任务自动安全。[NASA：Jack Garman与1202判断](https://www.nasa.gov/image-article/apollo-era-hero-john-jack-garman-dies/)
- 优先级架构来自多人长期工作，而非一次临场灵感。Hal Laning编写了Apollo计算机的执行程序；Margaret Hamilton领导MIT仪器实验室的软件工程部门，相关工作包括异步软件、优先级调度、优先级显示与人在回路中的决策能力。正文把最后论点落在‘预先决定什么可以等待’，而不是制造单一英雄。[MIT Infinite：Hal Laning与Apollo Executive](https://infinite.mit.edu/video/apollo-guidance-computer-project-mit-conference-series-part-2-9142001/)｜[MIT News：Margaret Hamilton与Apollo软件](https://news.mit.edu/2016/apollo-code-developer-margaret-hamilton-receives-presidential-medal-of-freedom-1117)
- 1201/1202警报之外，Armstrong后来还为避开巨石区接管了部分手动控制；警报恢复并不意味着余下着陆没有风险。本文只讨论计算机过载与‘继续’判断，不把整个登月成功归结为单一软件机制。[NASA：Apollo 11着陆经过](https://www.nasa.gov/history/50-years-ago-one-small-step-one-giant-leap/)
