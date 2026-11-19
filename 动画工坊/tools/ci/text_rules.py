#!/usr/bin/env python3
r"""画面文字规矩扫描：只看会出现在画面上的字。

用法：python3 text_rules.py <作品目录> [更多作品目录 ...]
扫描范围：
  storyboard.json  每个场景的 texts[].text、visual_text[].text，以及 aha.text、quote.text
  scenes/*.js      分镜用到的场景文件里的所有字符串和模板字符串（注释不算，注释不上画面）
规矩：
  破折号     不许有 U+2014、U+2015、U+2013 三种破折号字符（视频里一律不用破折号）
  禁用字样   不许有 BANNED 清单里的国别、身份类字样，以及英文单词 n-a-t-i-v-e（整词，不分大小写）
             （清单用 \u 转义写，这个文件本身也不出现这些字样）
JS 字符串里的转义（\u2014、\u{2014}、\x41 等）先还原再查，写成转义的破折号照样会上画面。
有问题逐条打印，以 1 退出。
"""
import json
import os
import re
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import ci_common as C  # noqa: E402

DASH = re.compile('[\u2014\u2013\u2015]')
BANNED = ['\u7f8e\u56fd', '\u5916\u56fd', '\u8001\u5916', '\u6bcd\u8bed', '\u82f1\u56fd', '\u56fd\u7c4d']
WORDS = re.compile('|'.join(BANNED) + r'|(?<![A-Za-z])(?i:n\x61tive)(?![A-Za-z])')
REGEX_PREV = set('(,=:[!&|?{};+-*%<>~^')


ESC = {'n': '\n', 't': '\t', 'r': '\r', 'b': '\b', 'f': '\f', 'v': '\v', '0': '\0', '\n': ''}


def js_unescape(s):
    """还原 JS 字符串转义：\\uXXXX、\\u{X...}、\\xXX、\\n 之类；不认识的转义就是字符本身。"""
    def rep(m):
        e = m.group(1)
        if e.startswith('u{'):
            return chr(int(e[2:-1], 16))
        if e[0] in 'ux' and len(e) > 1:
            return chr(int(e[1:], 16))
        return ESC.get(e, e)
    return re.sub(r'\\(u\{[0-9a-fA-F]+\}|u[0-9a-fA-F]{4}|x[0-9a-fA-F]{2}|[\s\S])', rep, s)


def js_strings(src):
    """JS 源码里的字符串字面量和模板字符串（不含注释、不含正则字面量），返回 [(行号, 内容)]。"""
    out, i, n, line = [], 0, len(src), 1
    prev = ''                       # 上一个有意义的字符，用来分辨 / 是除号还是正则
    prev_word = ''
    while i < n:
        c = src[i]
        if c == '\n':
            line += 1
            i += 1
            continue
        if c in ' \t\r':
            i += 1
            continue
        if src.startswith('//', i):
            j = src.find('\n', i)
            i = n if j < 0 else j
            continue
        if src.startswith('/*', i):
            j = src.find('*/', i + 2)
            j = n if j < 0 else j + 2
            line += src.count('\n', i, j)
            i = j
            continue
        if c in '\'"`':
            q, j, buf, start = c, i + 1, [], line
            while j < n and src[j] != q:
                if src[j] == '\\' and j + 1 < n:
                    buf.append(src[j:j + 2])
                    j += 2
                    continue
                if src[j] == '\n':
                    line += 1
                    if q != '`':
                        break
                buf.append(src[j])
                j += 1
            out.append((start, js_unescape(''.join(buf))))
            i = j + 1
            prev, prev_word = 'x', ''
            continue
        if c == '/' and (prev in REGEX_PREV or prev == '' or prev_word in ('return', 'typeof', 'case', 'in', 'of', 'void')):
            j, cls = i + 1, False
            while j < n and src[j] != '\n':
                if src[j] == '\\':
                    j += 2
                    continue
                if src[j] == '[':
                    cls = True
                elif src[j] == ']':
                    cls = False
                elif src[j] == '/' and not cls:
                    break
                j += 1
            i = j + 1
            while i < n and src[i].isalpha():
                i += 1
            prev, prev_word = 'x', ''
            continue
        if c.isalnum() or c in '_$':
            j = i
            while j < n and (src[j].isalnum() or src[j] in '_$'):
                j += 1
            prev_word = src[i:j]
            prev = 'x'
            i = j
            continue
        prev, prev_word = c, ''
        i += 1
    return out


def screen_texts(sb):
    """分镜里会上画面的字：[(位置, 文字)]。"""
    out = []
    for s in sb.get('scenes', []):
        for key in ('texts', 'visual_text'):
            for k, t in enumerate(s.get(key) or []):
                if isinstance(t, dict) and isinstance(t.get('text'), str):
                    out.append((f'{s.get("id")}.{key}[{k}]', t['text']))
                elif isinstance(t, str):
                    out.append((f'{s.get("id")}.{key}[{k}]', t))
    for key in ('aha', 'quote'):
        if isinstance(sb.get(key), dict) and isinstance(sb[key].get('text'), str):
            out.append((f'{key}.text', sb[key]['text']))
    return out


def scan(film_dir):
    problems = []
    film, sb, sb_path = C.load_film(film_dir)
    items = [(os.path.relpath(sb_path, film_dir) + ' ' + where, txt) for where, txt in screen_texts(sb)]
    files = sorted({C.scene_file(s) for s in sb.get('scenes', [])})
    scanned = 0
    for f in files:
        p = os.path.join(film_dir, 'scenes', f)
        if not os.path.isfile(p):
            continue                                    # 还没写的场景，不算文字问题
        scanned += 1
        for ln, s in js_strings(open(p, encoding='utf-8').read()):
            items.append((f'scenes/{f}:{ln}', s))
    for where, txt in items:
        for m in DASH.finditer(txt):
            problems.append(f'{where} 有破折号 {m.group()!r}：{txt[:40]}')
        for m in WORDS.finditer(txt):
            problems.append(f'{where} 有禁用字样 {m.group()!r}：{txt[:40]}')
    return problems, len(items), scanned


def main():
    if len(sys.argv) < 2:
        print(__doc__)
        return 2
    total_bad = 0
    for d in sys.argv[1:]:
        problems, n_items, n_files = scan(d)
        name = os.path.basename(os.path.normpath(d))
        for p in problems:
            C.error(p, f'文字规矩 {name}')
        msg = f'{name}：查了 {n_items} 处画面文字（{n_files} 个场景文件），问题 {len(problems)} 个'
        (C.notice if not problems else C.error)(msg, '文字规矩')
        C.summary(f'### 文字规矩：{"通过" if not problems else "不通过"}\n\n{msg}' + ''.join(f'\n- {p}' for p in problems[:50]))
        total_bad += len(problems)
    return 1 if total_bad else 0


if __name__ == '__main__':
    sys.exit(main())
