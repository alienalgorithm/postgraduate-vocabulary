#!/usr/bin/env python3
"""阅读版: this article exactly as typeset in the v5 book (same code, same data, same image), as its own booklet
with page numbers from 1."""
import json, sys
from pathlib import Path
from common import *

def build(no, out):
    d = json.loads((V5 / f'data/{no}.json').read_text())
    b = B.Book(out); c = b.c
    c.setTitle(f'{no} {d["title_zh"]}｜阅读版'); c.setAuthor('朋克英语'); c.setCreator('朋克英语')
    c.setSubject('英文原文 · 中文译文 · 词汇与表达 · 文章简述')
    B.chapter(b, d, V5 / f'插图JPEG/{no}.jpg'); b.end_page(); c.save()
    return b.page

if __name__ == '__main__':
    print(build(sys.argv[1], sys.argv[2]), 'pages')
