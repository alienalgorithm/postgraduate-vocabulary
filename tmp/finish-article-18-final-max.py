#!/usr/bin/env python3
from pathlib import Path


def read(path: str) -> str:
    return Path(path).read_text(encoding='utf-8')


def write(path: str, text: str) -> None:
    Path(path).write_text(text, encoding='utf-8')


def replace_once(text: str, old: str, new: str, label: str) -> str:
    count = text.count(old)
    if count != 1:
        raise RuntimeError(f'{label}: expected one match, found {count}')
    return text.replace(old, new, 1)


# Canonical article data
path = 'data/article-18.js'
text = read(path)
changes = [
    (
        '"standfirst": "借助一座为卫星通信而建的号角天线，两名研究者逐一排查设备、地面、季节甚至鸽子；所有本地嫌疑源都被排除后，天空仍不肯安静。"',
        '"standfirst": "借助一座为卫星通信而建的号角天线，两名研究者逐一排查设备、地面、季节甚至鸽子；所有合理的本地嫌疑源都被排除后，天空仍不肯安静。"',
        'standfirst precision',
    ),
    (
        '**Pigeons** had made a **roost** inside;',
        '**Pigeons** had **roosted** inside;',
        'natural English roost verb',
    ),
    (
        'Princeton **physicists** Robert Dicke, James Peebles, Peter Roll and David Wilkinson were building',
        'Nearby, Princeton **physicists** Robert Dicke, James Peebles, Peter Roll and David Wilkinson were building',
        'restore spatial transition',
    ),
    (
        'Penzias and Wilson treated it as **provisional**.',
        'Penzias and Wilson treated that interpretation as **provisional**.',
        'remove pronoun ambiguity',
    ),
    (
        '一些**鸽子**(Pigeons)曾在天线内**栖息筑巢**(roost)；',
        '一些**鸽子**(Pigeons)曾在天线内**栖息**(roosted)；',
        'Chinese roost correspondence',
    ),
    (
        '普林斯顿的**物理学家**(physicists)罗伯特·迪克、詹姆斯·皮布尔斯、彼得·罗尔和戴维·威尔金森正在建造',
        '不远处，普林斯顿的**物理学家**(physicists)罗伯特·迪克、詹姆斯·皮布尔斯、彼得·罗尔和戴维·威尔金森正在建造',
        'Chinese spatial transition',
    ),
    (
        '寻找来自炽热**原初宇宙的**(primordial)**遗存热辐射**(relic)。',
        '寻找**原初宇宙留下的**(primordial)**遗存热辐射**(relic)。',
        'remove unsupported Chinese hot modifier',
    ),
]
for old, new, label in changes:
    text = replace_once(text, old, new, label)
write(path, text)

# Static homepage summary
path = 'index.html'
text = read(path)
text = replace_once(
    text,
    '<p>设备损耗、地面响应、季节变化和鸽子逐一被排查；当所有本地嫌疑源都被排除，号角天线仍听见整片天空的嘶声。</p>',
    '<p>设备损耗、地面响应、季节变化和鸽子逐一被排查；当所有合理的本地嫌疑源都被排除，号角天线仍听见整片天空的嘶声。</p>',
    'homepage summary precision',
)
write(path, text)

# README final rationale
path = 'README.md'
text = read(path)
text = replace_once(
    text,
    '并以 `every plausible local culprit` 避免过度绝对化。',
    '并以 `every plausible local culprit` 避免过度绝对化。最终语言收口又把生硬的 `made a roost` 改为 `roosted`，恢复 `Nearby` 的空间衔接，并用 `that interpretation` 消除代词歧义；中文同步删去英文已不存在的“炽热”。',
    'README final language note',
)
write(path, text)

# Handoff final traits
path = 'notes/对话交接文档.md'
text = read(path)
text = replace_once(
    text,
    '- 第二段仍写 `every seam`，或第四段仍写 `black-body profile` 而不是 `black-body spectral profile`',
    '- 第二段仍写 `every seam` 或 `made a roost`，第三段仍写 `treated it as provisional`，或第四段仍写 `black-body profile` 而不是 `black-body spectral profile`',
    'handoff stale language traits',
)
write(path, text)

# Article version record
path = 'notes/第十八篇入库记录_2026-08-13.md'
text = read(path)
text = replace_once(
    text,
    '最终微调进一步收紧接缝表述、补全 spectral profile，并用 plausible 限定本地嫌疑范围；成为当前唯一权威版本。',
    '最终微调进一步收紧接缝表述、补全 spectral profile，并用 plausible 限定本地嫌疑范围；最后又把 made a roost 改为 roosted，恢复 Nearby 的场景衔接并消除 it 的指代歧义；成为当前唯一权威版本。',
    'record version history finish',
)
text = replace_once(
    text,
    '- `every seam` 收紧为 `the seams`；删除重复表达热意的 `hot`，把节省出的词用于更自然、专业的 `black-body spectral profile`。',
    '- `every seam` 收紧为 `the seams`；删除英文中重复表达热意的 `hot`，把节省出的词用于更自然、专业的 `black-body spectral profile`。\n- `made a roost` 改为母语更自然的 `roosted`；节省的词分别用于恢复 `Nearby` 的空间过渡，并把 `it` 明确为 `that interpretation`。\n- 中文同步删除英文已经删去的“炽热”，避免中译文暗中增加信息。',
    'record final improvements',
)
text = replace_once(
    text,
    '- `black-body profile`（缺少 spectral）',
    '- `black-body profile`（缺少 spectral）\n- `made a roost`\n- `treated it as provisional`',
    'record stale signatures',
)
write(path, text)

# Final-version guard and audit record
path = 'scripts/final-version-guard.js'
text = read(path)
text = replace_once(
    text,
    "'18': { source: '2026-08-13对话中形成并完成最终微调与全库复验的270词最终精进锁定稿', verification: 'conversation-latest-final' },",
    "'18': { source: '2026-08-13对话中形成并完成最终语言收口与全库复验的270词最终精进锁定稿', verification: 'conversation-latest-final' },",
    'guard source description',
)
text = replace_once(
    text,
    "    'black-body **profile** and mapped',",
    "    'black-body **profile** and mapped',\n    '**Pigeons** had made a **roost** inside;',\n    'Penzias and Wilson treated it as **provisional**.',",
    'guard additional stale signatures',
)
text = replace_once(
    text,
    '> 结论：第01—17篇继续保持此前锁定指纹；第18篇270词最终精进锁定稿已完成最后一轮无增词微调，并通过900词全库复验。',
    '> 结论：第01—17篇继续保持此前锁定指纹；第18篇270词最终精进锁定稿已完成最后一轮语言收口，并通过900词全库复验。',
    'audit conclusion finish',
)
text = replace_once(
    text,
    '- 第18篇：270词最终精进锁定稿完成语言、科学口径、结尾闭环与最后一轮无增词微调，并淘汰264词工作稿和269词中间定稿。',
    '- 第18篇：270词最终精进锁定稿完成语言、科学口径、结尾闭环与最终语言收口，并淘汰264词工作稿和269词中间定稿。',
    'audit article 18 finish',
)
write(path, text)

print('definitive article 18 language finish prepared')
