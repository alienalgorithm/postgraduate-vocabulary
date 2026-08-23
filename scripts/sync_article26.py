#!/usr/bin/env python3
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent


def replace_many(path, pairs):
    text = path.read_text(encoding='utf-8')
    for old, new in pairs:
        text = text.replace(old, new)
    path.write_text(text, encoding='utf-8')


def insert_after_matching_line(path, needle, line_to_add):
    text = path.read_text(encoding='utf-8')
    if line_to_add in text:
        return
    lines = text.splitlines()
    for i, line in enumerate(lines):
        if needle in line and line.lstrip().startswith('|'):
            lines.insert(i + 1, line_to_add)
            path.write_text('\n'.join(lines) + '\n', encoding='utf-8')
            return
    path.write_text(text.rstrip() + '\n\n' + line_to_add + '\n', encoding='utf-8')


# README
readme = ROOT / 'README.md'
replace_many(readme, [
    ('25篇文章、1250个重点词', '26篇文章、1300个重点词'),
    ('25 篇文章、1250 个重点词', '26 篇文章、1300 个重点词'),
    ('1250词索引', '1300词索引'),
    ('1250 个重点词', '1300 个重点词'),
])
insert_after_matching_line(
    readme,
    'The Patient Came Before the Envelope',
    '| **26** | *The Image Arrived Two Days Later* | 1957—1979年Cormack、Hounsfield与计算机断层成像 | **270词 · 50词 · 18.5%** |'
)

# Handoff
handoff = ROOT / 'notes' / '对话交接文档.md'
replace_many(handoff, [
    ('二十五篇最终定稿，1250个重点词', '二十六篇最终定稿，1300个重点词'),
    ('25篇 / 1250', '26篇 / 1300'),
    ('25 篇 / 1250', '26 篇 / 1300'),
])
insert_after_matching_line(
    handoff,
    'The Patient Came Before the Envelope',
    '| **26** | ***The Image Arrived Two Days Later*** | **1957—1979年Cormack、Hounsfield与计算机断层成像** | **270 / 50 / 18.5%** | **第二十六篇最终精进锁定稿** |'
)

# Website surfaces
site_pairs = [
    ('第二十五篇已入库', '第二十六篇已入库'),
    ('二十五篇', '二十六篇'),
    ('25篇', '26篇'),
    ('1250词', '1300词'),
    ('1250 个词', '1300 个词'),
    ('1250个词', '1300个词'),
    ('01—25', '01—26'),
]
for name in ('index.html', 'article.html', 'words.html'):
    path = ROOT / name
    text = path.read_text(encoding='utf-8')
    tag25 = '<script src="data/article-25.js"></script>'
    tag26 = '<script src="data/article-26.js"></script>'
    if tag26 not in text and tag25 in text:
        text = text.replace(tag25, tag25 + '\n  ' + tag26)
    for old, new in site_pairs:
        text = text.replace(old, new)
    path.write_text(text, encoding='utf-8')

# Sitemap
sitemap = ROOT / 'sitemap.xml'
text = sitemap.read_text(encoding='utf-8')
url = '  <url><loc>https://alienrocketbus.github.io/postgraduate-vocabulary/article.html?a=the-image-arrived-two-days-later</loc></url>'
if url not in text:
    text = text.replace('</urlset>', url + '\n</urlset>')
sitemap.write_text(text, encoding='utf-8')

# Final-version guard: lift latest-archive hardcodes to Article 26.
guard = ROOT / 'scripts' / 'final-version-guard.js'
text = guard.read_text(encoding='utf-8')
text = text.replace("if (!readme.includes('25篇文章、1250个重点词')) errors.push('README archive count is stale');",
                    "if (!readme.includes('26篇文章、1300个重点词')) errors.push('README archive count is stale');")
text = text.replace("if (!readme.includes('The Patient Came Before the Envelope')) errors.push('README article 25 missing');",
                    "if (!readme.includes('The Patient Came Before the Envelope')) errors.push('README article 25 missing');\n  if (!readme.includes('The Image Arrived Two Days Later')) errors.push('README article 26 missing');")
text = text.replace("if (!handoff.includes('二十五篇最终定稿，1250个重点词')) errors.push('handoff archive count is stale');",
                    "if (!handoff.includes('二十六篇最终定稿，1300个重点词')) errors.push('handoff archive count is stale');")
text = text.replace("if (!handoff.includes('第二十五篇最终精进锁定稿')) errors.push('handoff article 25 missing');",
                    "if (!handoff.includes('第二十五篇最终精进锁定稿')) errors.push('handoff article 25 missing');\n  if (!handoff.includes('第二十六篇最终精进锁定稿')) errors.push('handoff article 26 missing');")
text = text.replace('第01—25篇', '第01—26篇')
text = text.replace('25篇 / 1250个重点词', '26篇 / 1300个重点词')
text = text.replace('主分支的25篇均以manifest指纹为唯一权威身份；第25篇为当前最新最终精进锁定稿。',
                    '主分支的26篇均以manifest指纹为唯一权威身份；第26篇为当前最新最终精进锁定稿。')
guard.write_text(text, encoding='utf-8')

# Remove one-shot machinery from the final tree after it has done its job.
for rel in ('scripts/sync_article26.py', '.github/workflows/sync-article26.yml'):
    p = ROOT / rel
    if p.exists():
        p.unlink()
