#!/usr/bin/env python3
from pathlib import Path

path = Path('scripts/final-version-guard.js')
text = path.read_text(encoding='utf-8')
old_readme = "| **19** | ***Five Alarms, Still Descending*** | **1969年阿波罗11号1201/1202程序警报、优先级软件与地面‘继续’判断** | **270词 · 50词 · 18.5%** |"
new_readme = "| 19 | *Five Alarms, Still Descending* | 1969年阿波罗11号1201/1202程序警报、优先级软件与地面‘继续’判断 | 270词 · 50词 · 18.5% |"
old_handoff = "| **19** | ***Five Alarms, Still Descending*** | **1969年阿波罗11号1201/1202程序警报、优先级软件与地面‘继续’判断** | **270 / 50 / 18.5%** | **第十九篇最终精进锁定稿** |"
new_handoff = "| 19 | *Five Alarms, Still Descending* | 1969年阿波罗11号1201/1202程序警报、优先级软件与地面‘继续’判断 | 270 / 50 / 18.5% | 第十九篇最终精进锁定稿 |"
for old, new, label in ((old_readme, new_readme, 'README article 19 row'), (old_handoff, new_handoff, 'handoff article 19 row')):
    if text.count(old) != 1:
        raise SystemExit(f'{label}: expected one match, found {text.count(old)}')
    text = text.replace(old, new, 1)
path.write_text(text, encoding='utf-8')
print('article 19 row guards aligned with article 20 release')
