#!/usr/bin/env python3
"""export_anki.py —— 把全库词元导成 Anki 能直接导入的卡片（TSV），每张卡带它所在的那一句。

★ 由来（2026-09-04）：
  七十篇、3,500 个词元，网页能读，却没有一样东西能进间隔复习软件。
  这个项目的用户是背考研词汇的人；对他们最有用的不是第七十一篇，是把已经有的 3,500 个词按上下文导出来。
  **不动任何铁律，纯从数据层派生。**

每张卡：
  正面  = 英文词（原形式，即正文里加粗的那个词）
  背面  = 中文释义 ｜ 所在句（该词加粗、其余加粗去掉）｜ 篇名 ＋ 网页链接
  标签  = 篇号、段号

用法：
  python3 scripts/export_anki.py            # 写到 exports/anki-3500.tsv（全库）
  python3 scripts/export_anki.py 61 70      # 只导第 61—70 篇
导入 Anki：文件 → 导入 → 选 TSV，字段分隔符 Tab，勾选「允许 HTML」。
"""
import os
import re
import sys
import json
import subprocess

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BOLD = re.compile(r"\*\*([^*]+)\*\*")
SITE = "https://alienrocketbus.github.io/postgraduate-vocabulary/article.html?a="


def load_all():
    js = ('globalThis.window=globalThis;'
          + ''.join('require(%s);' % json.dumps(os.path.join(ROOT, 'data', f))
                    for f in sorted(os.listdir(os.path.join(ROOT, 'data'))) if f.endswith('.js'))
          + 'process.stdout.write(JSON.stringify(globalThis.SITE.ARTICLES))')
    out = subprocess.run(['node', '-e', js], capture_output=True, text=True, cwd=ROOT).stdout
    return sorted(json.loads(out), key=lambda a: int(a['id']))


def sentences(text):
    # 按句号／问号／叹号切；保留分号内的整句
    return [s.strip() for s in re.split(r"(?<=[.!?])\s+", text) if s.strip()]


sys.path.insert(0, os.path.join(ROOT, "scripts"))
from agent import stem as _stem, norm as _norm  # noqa: E402


def _root(w):
    w = _norm(w).lower()
    if w.endswith("ies") and len(w) > 4:
        w = w[:-3] + "y"
    elif w.endswith("ied") and len(w) > 4:
        w = w[:-3] + "y"
    for suf in ("ing", "ed", "es", "s"):
        if w.endswith(suf) and len(w) - len(suf) >= 3:
            w = w[: -len(suf)]
            break
    if len(w) > 3 and w[-1] == w[-2] and w[-1] not in "aeiou":   # scrubbed→scrub
        w = w[:-1]
    if w.endswith("e") and len(w) > 3:                            # contaminate/contaminat、date/dat
        w = w[:-1]
    return w


try:
    from agent import _IRR_GRP as _IRR   # lay/laid 这类不规则变化
except Exception:
    _IRR = {}


def _same_word(a, b):
    a, b = _norm(a), _norm(b)
    if a == b or _stem(a) == _stem(b) or a.rstrip("s") == b.rstrip("s") or _root(a) == _root(b):
        return True
    ga, gb = _IRR.get(a.lower()), _IRR.get(b.lower())
    return bool(ga and gb and ga == gb)


def context_for(word, para_en):
    """找到含该词的那一句；只保留这个词的加粗，其余加粗去掉。
    早期篇目词表存原形、正文加粗屈折形（message/messages），按词干匹配；大小写不分。"""
    for s in sentences(para_en):
        for m in BOLD.finditer(s):
            surface = m.group(1)
            if _same_word(surface, word):
                keep = s[:m.start()] + "\x00" + s[m.end():]
                keep = BOLD.sub(r"\1", keep)
                return keep.replace("\x00", "<b>%s</b>" % surface)
    # 找不到（理论上不会）：退回整段去粗
    return BOLD.sub(r"\1", para_en)


def main():
    arts = load_all()
    lo, hi = (int(sys.argv[1]), int(sys.argv[2])) if len(sys.argv) >= 3 else (1, 10**6)
    rows = []
    for a in arts:
        aid = int(a['id'])
        if not (lo <= aid <= hi):
            continue
        paras = a['paras']
        for g in a['glossary']:
            w, zh, p = g['w'], g['zh'], g['p']
            en = paras[p - 1]['en']
            ctx = context_for(w, en)
            back = "%s<br><br><i>%s</i><br><br>%s · <a href=\"%s%s\">第%s篇</a>" % (
                zh, ctx, a['title'], SITE, a['slug'], a['id'])
            rows.append((w, back, "art%s p%d" % (a['id'], p)))
    os.makedirs(os.path.join(ROOT, 'exports'), exist_ok=True)
    name = 'anki-3500.tsv' if len(sys.argv) < 3 else 'anki-%02d-%02d.tsv' % (lo, hi)
    path = os.path.join(ROOT, 'exports', name)
    with open(path, 'w', encoding='utf-8') as f:
        f.write("#separator:tab\n#html:true\n#tags column:3\n")
        for w, back, tags in rows:
            f.write("%s\t%s\t%s\n" % (w, back.replace("\t", " ").replace("\n", " "), tags))
    print("导出 %d 张卡 → %s" % (len(rows), os.path.relpath(path, ROOT)))
    # 自检：每张卡的上下文都含加粗词
    bad = [w for w, back, _ in rows if "<b>" not in back]
    print("上下文缺词：%d" % len(bad), bad[:5] if bad else "")


if __name__ == "__main__":
    main()
