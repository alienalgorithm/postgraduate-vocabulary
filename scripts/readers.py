#!/usr/bin/env python3
"""readers.py —— 审读团：把一篇文章打成五个观众各自的阅读包，并生成报告骨架。

用法：
  python3 scripts/readers.py 70              # 打印阅读包（观众一二三只见英文；四五见中英）
  python3 scripts/readers.py 70 --init       # 生成 notes/审读-70.md 骨架（已存在则不覆盖）
  python3 scripts/readers.py --status        # 哪些篇已审、各有几条 A/B

章程见 notes/审读团.md。观众由模型扮演；每条发现必须落到句、标等级。
"""
import os
import re
import sys
import json
import subprocess

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BOLD = re.compile(r"\*\*([^*]+)\*\*")
READERS = [
    ("一", "专业英文评鉴师", "英文，逐句三遍：语法标点／搭配语域／句间衔接；连字符复合词是否真实存在"),
    ("二", "英语母语读者", "英文，一口气读完再回想：停顿点、翻译腔、加粗词自然度、反转是否被说服、结尾会不会转述"),
    ("三", "博士", "英文，审稿：论点—证据—推论链哪一环是断言；数字一致；因果还是并列；末段道理是否推得出"),
    ("四", "硕士生", "中英，先看加粗与括注：值不值得背、能否猜出、括注准不准、该加粗没加粗"),
    ("五", "本科生", "中英，一段一段：卡在哪、假定了什么背景、哪段读完不知所云、一句话总结对不对"),
]


def load_all():
    js = ('globalThis.window=globalThis;'
          + ''.join('require(%s);' % json.dumps(os.path.join(ROOT, 'data', f))
                    for f in sorted(os.listdir(os.path.join(ROOT, 'data'))) if f.endswith('.js'))
          + 'process.stdout.write(JSON.stringify(globalThis.SITE.ARTICLES))')
    out = subprocess.run(['node', '-e', js], capture_output=True, text=True, cwd=ROOT).stdout
    return {a['id']: a for a in json.loads(out)}


def packet(a, with_zh):
    lines = ["# 第%s篇 · %s" % (a['id'], a['title']), ""]
    for i, p in enumerate(a['paras'], 1):
        lines.append("§%d %s" % (i, p['en']))
        if with_zh:
            lines.append("　　%s" % p['zh'])
        lines.append("")
    return "\n".join(lines)


def skeleton(a):
    s = ["# 审读 · 第%s篇《%s》" % (a['id'], a['title']), "",
         "> 章程：notes/审读团.md。每条发现：§段 + 原句片段 + 问题 + 改法 + 等级（A 必改／B 应改／C 可改）。", ""]
    for k, name, how in READERS:
        s += ["## 观众%s · %s" % (k, name), "", "_%s_" % how, "", "（逐条）", ""]
    s += ["## 汇总", "", "| 句 | 谁点到 | 等级 | 改法 |", "|---|---|---|---|", "", "## 改动", "", "（改了什么，lockstep 是否等长，检察官分数）", ""]
    return "\n".join(s)


def status():
    rows = []
    for f in sorted(os.listdir(os.path.join(ROOT, 'notes'))):
        m = re.match(r"审读-(\d+)\.md$", f)
        if not m:
            continue
        t = open(os.path.join(ROOT, 'notes', f), encoding='utf-8').read()
        a_ = len(re.findall(r"\|\s*A\s*\|", t)) + len(re.findall(r"【A】", t))
        b_ = len(re.findall(r"\|\s*B\s*\|", t)) + len(re.findall(r"【B】", t))
        rows.append((m.group(1), a_, b_))
    print("已审 %d 篇" % len(rows))
    for aid, a_, b_ in rows:
        print("  第%s篇  A×%d  B×%d" % (aid, a_, b_))


def main():
    args = sys.argv[1:]
    if "--status" in args:
        return status()
    aid = [x for x in args if x.isdigit()][0].zfill(2)
    a = load_all()[aid]
    if "--init" in args:
        path = os.path.join(ROOT, 'notes', '审读-%s.md' % aid)
        if os.path.exists(path):
            print("已存在：", os.path.relpath(path, ROOT))
        else:
            open(path, 'w', encoding='utf-8').write(skeleton(a))
            print("已建：", os.path.relpath(path, ROOT))
        return
    print("=" * 70)
    print("观众一二三的阅读包（只有英文）")
    print("=" * 70)
    print(packet(a, False))
    print("=" * 70)
    print("观众四五的阅读包（中英）")
    print("=" * 70)
    print(packet(a, True))


if __name__ == "__main__":
    main()
