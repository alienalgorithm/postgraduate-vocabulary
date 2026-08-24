#!/usr/bin/env python3
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent


def rw(path, pairs):
    text = path.read_text(encoding='utf-8')
    for a, b in pairs:
        text = text.replace(a, b)
    path.write_text(text, encoding='utf-8')


def insert_after_line(path, needle, line):
    text = path.read_text(encoding='utf-8')
    if line in text:
        return
    lines = text.splitlines()
    for i, current in enumerate(lines):
        if needle in current:
            lines.insert(i + 1, line)
            path.write_text('\n'.join(lines) + '\n', encoding='utf-8')
            return
    raise RuntimeError(f'needle not found in {path}: {needle}')


# 1) Lock canonical Article 27 status.
article = ROOT / 'data' / 'article-27.js'
rw(article, [('第二十七篇最终精进锁定候选稿', '第二十七篇最终精进锁定稿')])

# 2) README.
readme = ROOT / 'README.md'
rw(readme, [
    ('网站提供中英连线、单语阅读、挖空自测、字号切换、打印和1300词索引。',
     '网站提供中英连线、单语阅读、挖空自测、字号切换、打印和1350词索引。'),
    ('截至2026-08-23，共有 **26篇文章、1300个重点词**。',
     '截至2026-08-23，共有 **27篇文章、1350个重点词**。'),
])
insert_after_line(
    readme,
    'articles/26-the-image-arrived-two-days-later.md',
    '| **27** | ***The Cable Stretched Every Pulse*** | **1858年第一条跨大西洋电报电缆、Thomson、Whitehouse与长距离信号迟滞** | **270词 · 50词 · 18.5%** | [网页](https://alienrocketbus.github.io/postgraduate-vocabulary/article.html?a=the-cable-stretched-every-pulse) · [Markdown](articles/27-the-cable-stretched-every-pulse.md) |'
)

# 3) Handoff.
handoff = ROOT / 'notes' / '对话交接文档.md'
rw(handoff, [
    ('> 最后更新：2026-08-13', '> 最后更新：2026-08-23'),
    ('> 当前权威状态：**二十六篇最终定稿，1300个重点词，第20篇与20篇网站均已进入主分支。**',
     '> 当前权威状态：**二十七篇最终定稿，1350个重点词；第27篇为当前最新最终精进锁定稿。**'),
    ('## 3. 当前二十五篇最终定稿', '## 3. 当前二十七篇最终定稿'),
    ('- 25篇\n- 1250个重点词', '- 27篇\n- 1350个重点词'),
    ('- 1250个速查表词元无跨篇精确重复', '- 1350个速查表词元无跨篇精确重复'),
    ('- 1250个英文加粗表面形式无跨篇精确重复', '- 1350个英文加粗表面形式无跨篇精确重复'),
])
insert_after_line(
    handoff,
    'The Image Arrived Two Days Later',
    '| **27** | ***The Cable Stretched Every Pulse*** | **1858年第一条跨大西洋电报电缆、Thomson、Whitehouse与长距离信号迟滞** | **270 / 50 / 18.5%** | **第二十七篇最终精进锁定稿** |'
)

# 4) Website entry points.
for name in ('index.html', 'article.html', 'words.html'):
    p = ROOT / name
    text = p.read_text(encoding='utf-8')
    t26 = '<script src="data/article-26.js"></script>'
    t27 = '<script src="data/article-27.js"></script>'
    if t27 not in text and t26 in text:
        text = text.replace(t26, t26 + '\n<script src="data/article-27.js"></script>')
    text = text.replace('1300词', '1350词').replace('1300个词', '1350个词').replace('1300 个词', '1350 个词')
    text = text.replace('二十六篇', '二十七篇').replace('26篇', '27篇').replace('01—26', '01—27')
    text = text.replace('article.html?a=the-image-arrived-two-days-later', 'article.html?a=the-cable-stretched-every-pulse')
    p.write_text(text, encoding='utf-8')

index = ROOT / 'index.html'
rw(index, [
    ('NEW · 26', 'NEW · 27'),
    ('28,000 READINGS · TWO DAYS TO IMAGE', '1858 · ATLANTIC SIGNALS STRETCHED IN TIME'),
    ('THE IMAGE ARRIVED TWO DAYS LATER', 'THE CABLE STRETCHED EVERY PULSE'),
    ('一次扫描先留下许多方向的测量值；真正的切片图像，要等计算把这些投影重新组合起来。',
     '问题不只是信号变弱：长电缆把每个脉冲拉宽。更大的驱动力，无法自动修复已经失去的时间形状。'),
])

# 5) Sitemap.
sitemap = ROOT / 'sitemap.xml'
text = sitemap.read_text(encoding='utf-8')
url = '  <url><loc>https://alienrocketbus.github.io/postgraduate-vocabulary/article.html?a=the-cable-stretched-every-pulse</loc></url>'
if url not in text:
    text = text.replace('</urlset>', url + '\n</urlset>')
sitemap.write_text(text, encoding='utf-8')

# 6) Final-version guard: source identity + version identity + current audit wording.
guard = ROOT / 'scripts' / 'final-version-guard.js'
text = guard.read_text(encoding='utf-8')
source27 = "  '27': { source: '2026-08-23第27篇1858年跨大西洋电缆主题最终精进锁定稿；经Whitehouse—Thomson功劳边界重写、关键史实复核、前1300词双层去重，并由仓库构建器验证27篇/1350词全部通过', verification: 'conversation-latest-final' },"
if source27 not in text:
    text = text.replace("  '26': { source: '2026-08-23第26篇CT主题最终终审锁定稿；经史实、技术术语、功劳边界与前1250词双层去重，并由仓库构建器验证26篇/1300词全部通过', verification: 'conversation-latest-final' },",
                        "  '26': { source: '2026-08-23第26篇CT主题最终终审锁定稿；经史实、技术术语、功劳边界与前1250词双层去重，并由仓库构建器验证26篇/1300词全部通过', verification: 'conversation-latest-final' },\n" + source27)
if "  '27': '27-270-word-final-locked'," not in text:
    text = text.replace("  '26': '26-270-word-final-locked',", "  '26': '26-270-word-final-locked',\n  '27': '27-270-word-final-locked',")
text = text.replace('> 审计范围：第01—26篇的权威数据、正式Markdown、用户上传最终稿、最终校正记录、README、交接文档和主分支校验。',
                    '> 审计范围：第01—27篇的权威数据、正式Markdown、最终校正记录、README、交接文档和主分支校验。')
text = text.replace('本次同步完成后，主分支的25篇均为当前已知的最后最终版本；第25篇270词最终精进锁定稿是当前最新权威版本。',
                    '本次同步完成后，主分支的27篇均为当前已知的最后最终版本；第27篇270词最终精进锁定稿是当前最新权威版本。')
guard.write_text(text, encoding='utf-8')

# 7) Release note.
note = ROOT / 'notes' / '第二十七篇入库记录_2026-08-23.md'
note.write_text('''# 第二十七篇入库记录 · 2026-08-23

## 最终稿

- 英文题目：*The Cable Stretched Every Pulse*
- 中文题目：《电缆把每个脉冲都拉长了》
- 题材：1858年第一条跨大西洋电报电缆、William Thomson、Edward Whitehouse与长距离信号迟滞
- 指标：270词 / 50重点词 / 18.5%
- 状态：第二十七篇最终精进锁定稿

## 本次终审

1. 将人物对立从“Thomson懂科学、Whitehouse只会蛮力”改写为严肃的工程模型之争：两人都看见retardation，分歧在尺度外推、驱动强度和接收灵敏度如何补偿长电缆效应。
2. 核对Whitehouse短线路实验、Thomson镜式检流计、约500V直流与约2000V感应线圈、女王电报16.5小时与重发67分钟、9月1日有效通信停止及10月20日最后记录。
3. 第一轮仓库构建器检出 overlap / magnify / optical / discrepancy / premature / smeared / suspended / mismatch 等跨篇冲突；全部逐项替换。
4. 第二轮仓库构建器实测：27篇 / 1350词 / 全部通过，Article 27 = 270词 / 50词 / 18.5%。
5. 结尾最终落在题材自身的系统原则：弱信号可以增强，但被拉宽的波形已经损失时间分离；更大的驱动力不能自动修复被传输介质改变的形状。
''', encoding='utf-8')

# 8) One-shot script removes itself after successful synchronization work.
Path(__file__).unlink()
