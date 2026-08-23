#!/usr/bin/env python3
from pathlib import Path
ROOT=Path(__file__).resolve().parent.parent

# Homepage: eliminate stale Article 25 / 1250-word presentation.
p=ROOT/'index.html'; t=p.read_text(encoding='utf-8')
t=t.replace('1250个考研重点词','1300个考研重点词').replace('把1250个考研词','把1300个考研词')
t=t.replace('article.html?a=the-patient-came-before-the-envelope','article.html?a=the-image-arrived-two-days-later')
t=t.replace('NEW · 25','NEW · 26')
t=t.replace('先确认患者符合条件，再打开随机分配的密封信封；答案只有在病人已经入组后才能被看见。','一次扫描先留下许多方向的测量值；真正的切片图像，要等计算把这些投影重新组合起来。')
t=t.replace('8.95M-TON CAP · ONE-TON ALLOWANCES','28,000 READINGS · TWO DAYS TO IMAGE')
t=t.replace('THE MARKET CAME AFTER THE LIMIT','THE IMAGE ARRIVED TWO DAYS LATER')
t=t.replace('二十六篇 · 1250重点词','二十六篇 · 1300重点词')
p.write_text(t,encoding='utf-8')

# Vocabulary page: final count and latest-article link.
p=ROOT/'words.html'; t=p.read_text(encoding='utf-8')
t=t.replace('1250个考研重点词','1300个考研重点词')
t=t.replace('article.html?a=the-patient-came-before-the-envelope','article.html?a=the-image-arrived-two-days-later')
p.write_text(t,encoding='utf-8')

# Final-version audit now records this release date and writes a new audit report.
p=ROOT/'scripts'/'final-version-guard.js'; t=p.read_text(encoding='utf-8')
t=t.replace("'全库最终版本审计_2026-08-13.md'","'全库最终版本审计_2026-08-23.md'")
t=t.replace("audited_at: '2026-08-13'","audited_at: '2026-08-23'")
t=t.replace("'# 全库最终版本审计 · 2026-08-13'","'# 全库最终版本审计 · 2026-08-23'")
p.write_text(t,encoding='utf-8')

# Remove the temporary trigger and this one-shot script from the final tree.
trigger=ROOT/'notes'/'article26-sync-trigger.txt'
if trigger.exists(): trigger.unlink()
Path(__file__).unlink()
