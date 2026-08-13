#!/usr/bin/env python3
from pathlib import Path


def read(path):
    return Path(path).read_text(encoding='utf-8')


def write(path, text):
    Path(path).write_text(text, encoding='utf-8')


def replace_once(text, old, new, label):
    count = text.count(old)
    if count != 1:
        raise RuntimeError(f'{label}: expected one match, found {count}')
    return text.replace(old, new, 1)


# Canonical article data
path = 'data/article-18.js'
text = read(path)
changes = [
    (
        'They taped every **seam**, tested each **joint** for loss and accounted for ground **interference**.',
        'They taped the **seams**, tested each **joint** for loss and accounted for ground **interference**.',
        'English paragraph 2 seam precision',
    ),
    (
        '他们给每一道**接缝**(seam)贴上胶带，检查每个**连接处**(joint)的损耗，并把地面**干扰**(interference)计入误差预算。',
        '他们给各处**接缝**(seams)贴上胶带，检查每个**连接处**(joint)的损耗，并把地面**干扰**(interference)计入误差预算。',
        'Chinese paragraph 2 seam precision',
    ),
    (
        'to seek **relic** heat from a hot, **primordial** universe.',
        'to seek **relic** heat from a **primordial** universe.',
        'English paragraph 3 remove redundant hot',
    ),
    (
        'COBE measured a near-perfect 2.725 K black-body **profile**',
        'COBE measured a near-perfect 2.725 K black-body spectral **profile**',
        'English paragraph 4 spectral profile',
    ),
    (
        'It became evidence only after every **local** **culprit** was ruled out—and the sky alone would not go quiet.',
        'It became evidence only after every plausible **local** **culprit** was ruled out—and the sky would not go quiet.',
        'English title-loop precision',
    ),
    (
        '只有在每一个**本地的**(local)**嫌疑来源**(culprit)都被排除之后，它才成为证据——因为最后仍不肯安静的，只剩天空。',
        '只有在每一个看似合理的**本地**(local)**嫌疑来源**(culprit)都被排除之后，它才成为证据——因为天空仍不肯安静。',
        'Chinese title-loop precision',
    ),
]
for old, new, label in changes:
    text = replace_once(text, old, new, label)
write(path, text)

# README exact final sentence
path = 'README.md'
text = read(path)
text = replace_once(
    text,
    '并以“the sky alone would not go quiet”回扣标题。',
    '并以“the sky would not go quiet”直接回扣标题。最终微调还把 `every seam` 收紧为 `the seams`，把 `black-body profile` 完整为 `black-body spectral profile`，并以 `every plausible local culprit` 避免过度绝对化。',
    'README article 18 final summary',
)
write(path, text)

# Handoff final identity
path = 'notes/对话交接文档.md'
text = read(path)
text = replace_once(
    text,
    '> It became evidence only after every **local** **culprit** was ruled out—and the sky alone would not go quiet.',
    '> It became evidence only after every plausible **local** **culprit** was ruled out—and the sky would not go quiet.',
    'handoff ending',
)
text = replace_once(
    text,
    '- 结尾仍写 `Its force came from a stricter fact`，没有直接回扣标题',
    '- 结尾仍写 `Its force came from a stricter fact` 或 `the sky alone would not go quiet`，没有采用当前更严谨的标题回扣\n- 第二段仍写 `every seam`，或第四段仍写 `black-body profile` 而不是 `black-body spectral profile`',
    'handoff superseded traits',
)
write(path, text)

# Article 18 record
path = 'notes/第十八篇入库记录_2026-08-13.md'
text = read(path)
text = replace_once(
    text,
    '3. 270词最终精进锁定稿：明确3.5 K的物理含义，收紧误差语言，消除代词歧义，修正科学搭配，并以标题完成结尾闭环；成为当前唯一权威版本。',
    '3. 270词最终精进锁定稿：明确3.5 K的物理含义，收紧误差语言，消除代词歧义，修正科学搭配，并以标题完成结尾闭环。最终微调进一步收紧接缝表述、补全 spectral profile，并用 plausible 限定本地嫌疑范围；成为当前唯一权威版本。',
    'record version history',
)
text = replace_once(
    text,
    '- 最后一句改为 `It became evidence only after every local culprit was ruled out—and the sky alone would not go quiet.`，把排除法、证据资格和标题收束成同一逻辑。',
    '- 最后一句最终锁定为 `It became evidence only after every plausible local culprit was ruled out—and the sky would not go quiet.`，既把排除法、证据资格和标题收束成同一逻辑，也避免声称穷尽一切可能来源。\n- `every seam` 收紧为 `the seams`；删除重复表达热意的 `hot`，把节省出的词用于更自然、专业的 `black-body spectral profile`。',
    'record improvements',
)
text = replace_once(
    text,
    '> It became evidence only after every **local** **culprit** was ruled out—and the sky alone would not go quiet.',
    '> It became evidence only after every plausible **local** **culprit** was ruled out—and the sky would not go quiet.',
    'record final ending',
)
text = replace_once(
    text,
    '- `Its force came from a stricter fact`',
    '- `Its force came from a stricter fact`\n- `the sky alone would not go quiet`\n- `every seam`\n- `black-body profile`（缺少 spectral）',
    'record superseded signatures',
)
write(path, text)

# Final-version guard: unique version identity and stale signatures
path = 'scripts/final-version-guard.js'
text = read(path)
text = replace_once(
    text,
    "'18': { source: '2026-08-13对话中形成并完成全库复验的270词最终精进锁定稿', verification: 'conversation-latest-final' },",
    "'18': { source: '2026-08-13对话中形成并完成最终微调与全库复验的270词最终精进锁定稿', verification: 'conversation-latest-final' },",
    'guard source description',
)
text = replace_once(
    text,
    "'18': '18-270-word-final-polish',",
    "'18': '18-270-word-final-max',",
    'guard version id',
)
text = replace_once(
    text,
    "    'Its force came from a stricter fact',",
    "    'Its force came from a stricter fact',\n    'the sky alone would not go quiet',\n    'taped every **seam**',\n    'black-body **profile** and mapped',",
    'guard stale signatures',
)
text = replace_once(
    text,
    '> 结论：第01—17篇继续保持此前锁定指纹；第18篇已由269词中间定稿升级为270词最终精进锁定稿，并完成900词全库复验。',
    '> 结论：第01—17篇继续保持此前锁定指纹；第18篇270词最终精进锁定稿已完成最后一轮无增词微调，并通过900词全库复验。',
    'audit conclusion',
)
text = replace_once(
    text,
    '- 第18篇：270词最终精进锁定稿完成语言、科学口径与结尾闭环升级，并淘汰264词工作稿和269词中间定稿。',
    '- 第18篇：270词最终精进锁定稿完成语言、科学口径、结尾闭环与最后一轮无增词微调，并淘汰264词工作稿和269词中间定稿。',
    'audit article line',
)
write(path, text)

print('final article 18 micro-polish prepared')
