#!/usr/bin/env python3
"""Every Chinese character must be drawn in a Chinese font (no tofu boxes); report spans that break this."""
import re, sys, pymupdf
def check(path):
    bad = []
    for i, p in enumerate(pymupdf.open(path)):
        for b in p.get_text('rawdict')['blocks']:
            for l in b.get('lines', []):
                for s in l['spans']:
                    txt = ''.join(ch['c'] for ch in s['chars'])
                    if re.search(r'[一-鿿（），。；：“”]', txt) and not re.search(r'SC|Attribution', s['font']): bad.append((i + 1, s['font'], txt[:30]))
    return bad
if __name__ == '__main__':
    for f in sys.argv[1:]: print(f.split('/')[-1], check(f)[:5])
