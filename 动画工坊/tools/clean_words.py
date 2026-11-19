#!/usr/bin/env python3
r"""把作品目录里所有文本文件中的禁用字样去掉（幂等，sync_from_workspace.sh 每次同步后自动跑）。

用法：python3 动画工坊/tools/clean_words.py <作品目录>          改写（同步时自动跑）
      python3 动画工坊/tools/clean_words.py --check <目录...>  只查不改，有就逐条打印并以 1 退出（anim-check 每次推送查整个 动画工坊/）
禁用字样和 tools/ci/text_rules.py 用同一份 BANNED 清单（国别、身份类字样，以及那个英文整词），这里不重复写。
仓库公开，任何文件里都不许出现这些字样；工作目录里的内部规则文件（BRIEF.md、EVIDENCE.md）和检查程序的词表
却需要提到它们，所以同步进仓库时由程序改写，不靠人记：
  .md .txt 等说明文字：连在一起的一串（含“国家”和引号、“者”、“之类字样”）整体换成
                       “国别、身份类字样（清单见 动画工坊/tools/ci/text_rules.py 的 BANNED）”；零散的换成“（BANNED 清单字样）”
  .py .js .json：      换成 \u 转义，程序读到的字符串一模一样，行为不变（.py 里的 r'' 原始字符串除外，遇到会提醒）
  .html：              换成 &#x....; 实体
不改画面：上画面的字由 text_rules.py 在 CI 里查，那里查出来是质量问题，要改分镜或场景，不在这里遮掉。
"""
import os
import re
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, 'ci'))
from text_rules import BANNED, WORDS  # noqa: E402

SKIP_DIRS = {'node_modules', 'stills', '.git', '__pycache__', 'private', 'sources', '.sync-tmp'}
PROSE = {'.md', '.txt', '.sh', '.yml', '.yaml', '.csv', '.tsv'}
ESCAPE = {'.py', '.js', '.mjs', '.cjs', '.json'}
HTML = {'.html', '.htm', '.svg'}
REPL = '国别、身份类字样（清单见 动画工坊/tools/ci/text_rules.py 的 BANNED）'
TOKEN = '[“"]?(?:' + '|'.join(BANNED) + '|国家)者?[”"]?'          # 国家 = 国家，者 = 者
RUN = re.compile(TOKEN + '(?:[、,，]?' + TOKEN + ')*(?:之类的?)?(?:字样)?')  # 之类（的）字样


def prose(text):
    def run(m):
        return REPL if WORDS.search(m.group(0)) else m.group(0)
    text = RUN.sub(run, text)
    return WORDS.sub('（BANNED 清单字样）', text)


def escape(text):
    return WORDS.sub(lambda m: ''.join('\\u%04x' % ord(c) for c in m.group(0)), text)


def entity(text):
    return WORDS.sub(lambda m: ''.join('&#x%x;' % ord(c) for c in m.group(0)), text)


def text_files(top):
    for root, dirs, files in os.walk(top):
        dirs[:] = sorted(d for d in dirs if d not in SKIP_DIRS)
        for name in sorted(files):
            ext = os.path.splitext(name)[1].lower()
            fn = prose if ext in PROSE else escape if ext in ESCAPE else entity if ext in HTML else None
            if not fn:
                continue
            p = os.path.join(root, name)
            try:
                s = open(p, encoding='utf-8').read()
            except (UnicodeDecodeError, OSError):
                continue
            yield p, ext, fn, s


def check(tops):
    hits = []
    for top in tops:
        for p, _, _, s in text_files(top):
            for m in WORDS.finditer(s):
                hits.append('%s:%d' % (p, s.count('\n', 0, m.start()) + 1))
    for h in hits:
        print('::error title=文件里的禁用字样::%s 有 BANNED 清单字样（跑 tools/clean_words.py 改写）' % h)
    print('文件禁用字样：查了 %s，%s' % ('、'.join(tops), '问题 %d 处' % len(hits) if hits else '没有'))
    return 1 if hits else 0


def main():
    args = sys.argv[1:]
    if args[:1] == ['--check']:
        return check(args[1:] or ['.'])
    if len(args) != 1 or not os.path.isdir(args[0]):
        print('用法：python3 clean_words.py <作品目录> | --check <目录...>', file=sys.stderr)
        return 2
    changed, warn = [], []
    for p, ext, fn, s in text_files(args[0]):
        if not WORDS.search(s):
            continue
        if ext == '.py' and re.search(r'''\b[rR][bB]?(['"]).*?(''' + WORDS.pattern + r''').*?\1''', s):
            warn.append(os.path.relpath(p, args[0]))
        s2 = fn(s)
        if s2 != s:
            open(p, 'w', encoding='utf-8').write(s2)
            changed.append(os.path.relpath(p, args[0]))
    print('  禁用字样：' + ('改写 %d 个文件（%s）' % (len(changed), '、'.join(changed)) if changed else '没有'))
    for w in warn:
        print('  提醒：%s 的原始字符串里有禁用字样，转义后含义会变，请手动改写' % w)
    return 0


if __name__ == '__main__':
    sys.exit(main())
