#!/usr/bin/env python3
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent


def read(path: str) -> str:
    return (ROOT / path).read_text(encoding="utf-8")


def write(path: str, text: str) -> None:
    (ROOT / path).write_text(text, encoding="utf-8")


def replace_once(text: str, old: str, new: str, label: str) -> str:
    count = text.count(old)
    if count != 1:
        raise RuntimeError(f"{label}: expected one occurrence, found {count}")
    return text.replace(old, new, 1)


# Canonical article prose: improve precision, idiom and sentence control without
# changing the 270-word ceiling or any of the 50 highlighted terms.
path = "data/article-19.js"
text = read(path)
replacements = [
    (
        "The **rendezvous** **radar** stayed active as a **contingency** if an abort required return to orbit. A mode **configuration** and electrical **mismatch** generated rapid counter **requests**. The landing program already imposed a heavy **workload**; a periodic display job erased the narrow **headroom**. Tasks began to **queue** faster than the processor could finish them, triggering **overflow**.",
        "The **rendezvous** **radar** remained on as a **contingency** if an abort required a return to orbit. Its mode **configuration** exposed an electrical **mismatch**, generating rapid counter **requests**. Landing already imposed a heavy **workload**; a periodic display job consumed the remaining **headroom**. Tasks began to **queue** faster than the processor could finish them, triggering **overflow**.",
        "English paragraph 2",
    ),
    (
        "为在中止下降时仍能返回轨道，**交会**(rendezvous)**雷达**(radar)保持开启，作为一项**应急安排**(contingency)。一种模式**配置**(configuration)叠加电气**失配**(mismatch)，不断产生计数器**请求**(requests)。登月程序本已带来沉重**工作负载**(workload)；一个周期性显示任务耗尽了狭窄的性能**余量**(headroom)。任务开始**排队**(queue)，涌入速度超过处理器的完成速度，最终触发执行程序**溢出**(overflow)。",
        "如果中止下降后需要返回轨道，**交会**(rendezvous)**雷达**(radar)便是一项**应急安排**(contingency)，因此始终保持开启。它的模式**配置**(configuration)暴露出一处电气**失配**(mismatch)，不断产生计数器**请求**(requests)。登月程序本已带来沉重**工作负载**(workload)；一个周期性显示任务又耗尽了剩余的性能**余量**(headroom)。任务开始**排队**(queue)，涌入速度超过处理器的完成速度，最终触发执行程序**溢出**(overflow)。",
        "Chinese paragraph 2",
    ),
    (
        "Yet the alarm showed a defence working. The computer’s **executive** assigned every job a **priority**. When the **allocator** ran out of room, a **restart** cleared unfinished jobs and returned selected programs to protected **checkpoints**. It could **retain** **critical** state, **discard** lower-ranked monitor work, then **resume** guidance without losing the landing **trajectory**.",
        "Yet each alarm showed a defence working. The computer’s **executive** assigned every job a **priority**. When the **allocator** ran out of room, a **restart** cleared unfinished jobs and restored selected programs from protected **checkpoints**. It could **retain** **critical** state, **discard** less urgent work, then **resume** guidance without losing the landing **trajectory**.",
        "English paragraph 3",
    ),
    (
        "但警报也说明，一道防线正在发挥作用。计算机的**执行程序**(executive)为每项任务分配**优先级**(priority)。当任务**分配程序**(allocator)无处再放新作业时，一次**重新启动**(restart)会清除未完成任务，并让选定程序回到受保护的**检查点**(checkpoints)。系统能够**保留**(retain)**关键的**(critical)状态，**丢弃**(discard)优先级较低的监测显示任务，再**恢复**(resume)制导，使飞船不至偏离着陆**轨迹**(trajectory)。",
        "但每一次警报也说明，一道防线正在发挥作用。计算机的**执行程序**(executive)为每项任务分配**优先级**(priority)。当任务**分配程序**(allocator)无处再放新作业时，一次**重新启动**(restart)会清除未完成任务，并从受保护的**检查点**(checkpoints)恢复选定程序。系统能够**保留**(retain)**关键的**(critical)状态，**丢弃**(discard)不那么紧迫的工作，再**恢复**(resume)制导，使飞船不至偏离着陆**轨迹**(trajectory)。",
        "Chinese paragraph 3",
    ),
    (
        "They checked **telemetry**: the readings remained **coherent**, with **speed**, **attitude** and the landing path under control.",
        "They checked **telemetry**: the readings remained **coherent**; **speed**, **attitude** and the landing path were under control.",
        "English paragraph 4 telemetry sentence",
    ),
    (
        "他们核对**遥测数据**(telemetry)：各项读数仍然**相互吻合**(coherent)，**速度**(speed)、**姿态**(attitude)和着陆路径都受控制。",
        "他们核对**遥测数据**(telemetry)：各项读数仍然**相互吻合**(coherent)；**速度**(speed)、**姿态**(attitude)和着陆路径都在控制之中。",
        "Chinese paragraph 4 telemetry sentence",
    ),
    (
        "The deeper lesson lay in **architecture**. A **resilient** system did not promise never to overload; its **hierarchy** decided which work to **sacrifice**. The sacrifice was **selective**: expendable jobs vanished to **safeguard** navigation.",
        "The lesson lay in **architecture**. A **resilient** system did not promise never to overload; its **hierarchy** decided which work to **sacrifice**. The sacrifice was **selective**: expendable jobs were dropped to **safeguard** navigation.",
        "English paragraph 5",
    ),
    (
        "更深一层的答案藏在系统**架构**(architecture)里。一套**有韧性的**(resilient)系统并不承诺永不过载；它的任务**层级**(hierarchy)决定应当**舍弃**(sacrifice)哪些工作。这种舍弃是**有选择的**(selective)：可放弃的任务被清除，以**保障**(safeguard)导航。",
        "关键在于系统**架构**(architecture)。一套**有韧性的**(resilient)系统并不承诺永不过载；它的任务**层级**(hierarchy)决定应当**舍弃**(sacrifice)哪些工作。这种舍弃是**有选择的**(selective)：可放弃的任务会被剔除，以**保障**(safeguard)导航。",
        "Chinese paragraph 5",
    ),
]
for old, new, label in replacements:
    text = replace_once(text, old, new, label)
write(path, text)

# Human-facing version records.
path = "README.md"
text = read(path)
old = "第19篇以270词最终精进锁定稿为准。文章把五次1201/1202警报拆成三层：雷达接口与周期显示共同压缩计算余量；优先级执行程序通过重启、保留关键状态和丢弃可等待任务维持制导；Steve Bales与Jack Garman再依据遥测作出‘继续’判断。结尾不把可靠性写成‘永不失败’，而是写成系统在过载前已经决定什么可以等待。"
new = "第19篇以270词最终精进锁定稿为准。文章把五次1201/1202警报拆成三层：雷达接口与周期显示共同压缩计算余量；优先级执行程序通过重启、保留关键状态和丢弃可等待任务维持制导；Steve Bales与Jack Garman再依据遥测作出‘继续’判断。最终语言精修把负载因果、检查点恢复和遥测句法进一步写清；结尾不把可靠性写成‘永不失败’，而是写成系统在过载前已经决定什么可以等待。"
text = replace_once(text, old, new, "README article 19 note")
write(path, text)

path = "notes/对话交接文档.md"
text = read(path)
old = "- 把“go”判断归功于软件自动完成\n- 指标不是270词 / 50重点词 / 18.5%"
new = "- 把“go”判断归功于软件自动完成\n- 仍使用 `stayed active`、`returned selected programs to protected checkpoints`、`lower-ranked monitor work` 或 `expendable jobs vanished` 等中间稿表达\n- 指标不是270词 / 50重点词 / 18.5%"
text = replace_once(text, old, new, "handoff superseded article 19 wording")
write(path, text)

path = "notes/第十九篇入库记录_2026-08-13.md"
text = read(path)
old = "5. 结尾把可靠性重新定义为：系统在失败前已经决定什么可以等待。\n\n## 三、词库结果"
new = "5. 结尾把可靠性重新定义为：系统在失败前已经决定什么可以等待。\n\n最终语言精修进一步完成四项确定性提升：把负载来源写成‘配置暴露电气失配’，把程序恢复改为‘从检查点恢复’，把含混的 `lower-ranked monitor work` 收紧为 `less urgent work`，并修复遥测句的悬垂结构。全文仍为270词。\n\n## 三、词库结果"
text = replace_once(text, old, new, "article 19 record polish note")
write(path, text)

# Permanent fingerprint guard and superseded wording list.
path = "scripts/final-version-guard.js"
text = read(path)
text = replace_once(
    text,
    "'19': { source: '2026-08-13对话中形成并完成950词全库复验的270词最终精进锁定稿', verification: 'conversation-latest-final' },",
    "'19': { source: '2026-08-13对话中形成并完成最终语言精修与950词全库复验的270词最终精进锁定稿', verification: 'conversation-latest-final' },",
    "guard article 19 source",
)
old = """    'lower-ranked display work',
  ],
};"""
new = """    'lower-ranked display work',
    'stayed active as a **contingency**',
    'A mode **configuration** and electrical **mismatch** generated',
    'periodic display job erased the narrow **headroom**',
    'Yet the alarm showed a defence working.',
    'returned selected programs to protected **checkpoints**',
    'lower-ranked monitor work',
    'with **speed**, **attitude** and the landing path under control',
    'The deeper lesson lay in **architecture**.',
    'expendable jobs vanished to **safeguard** navigation',
  ],
};"""
text = replace_once(text, old, new, "guard superseded article 19 prose")
text = replace_once(
    text,
    "- 第19篇：270词最终精进锁定稿以阿波罗11号五次程序警报为叙事锚点，区分过载原因、优先级重启机制与地面‘继续’判断，并新增50个无重复词元。",
    "- 第19篇：270词最终精进锁定稿以阿波罗11号五次程序警报为叙事锚点，区分过载原因、优先级重启机制与地面‘继续’判断；最终语言精修又消除了负载因果、检查点恢复和遥测句法中的剩余硬点。",
    "guard audit article 19 description",
)
write(path, text)

print("article 19 definitive language polish prepared")
