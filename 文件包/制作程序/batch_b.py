#!/usr/bin/env python3
"""Phase B finish for one article: content must pass the checker, then render 逐句精讲 and 单词精解册, font check, stamp."""
import json, subprocess, sys
from pathlib import Path
S = Path('/tmp/claude-0/-home-user/3d87cc6c-41dd-58c2-802f-d51dc0c78527/scratchpad'); T = S / 'pkgtools'
sys.path.insert(0, str(T))
from check_content import check
from fontcheck import check as fcheck
def run(*a): subprocess.run([str(x) for x in a], check=True, cwd=T, capture_output=True, text=True)
def main(no):
    W = S / f'pkg/{no}'; C = W / 'content'; out = W / 'out'; out.mkdir(exist_ok=True)
    bad = check(no, 'all'); assert not bad, bad[:5]
    a = json.loads((W / 'article.json').read_text())
    json.dump(json.loads((C / 'sent.json').read_text()), open(C / 'final_sent.json', 'w'), ensure_ascii=False, indent=1)
    json.dump(json.loads((C / 'words_a.json').read_text()) + json.loads((C / 'words_b.json').read_text()), open(C / 'final_words.json', 'w'), ensure_ascii=False, indent=1)
    run('python3', T / 'jiangjie.py', W / 'article.json', C / 'final_sent.json', out / 'jiangjie-unsigned.pdf')
    run('python3', T / 'cidian.py', W / 'article.json', C / 'final_words.json', out / 'cidian-unsigned.pdf')
    for k in ('jiangjie', 'cidian'):
        fb = fcheck(str(out / f'{k}-unsigned.pdf')); assert not fb, (k, fb[:3])
    title = f'{no} {a["title_zh"]}'; P = W / 'pack' / title; P.mkdir(parents=True, exist_ok=True)
    for k, n in [('jiangjie', '4 逐句精讲'), ('cidian', '5 单词精解册')]:
        run('python3', T / 'stamp.py', out / f'{k}-unsigned.pdf', P / f'{title} {n}.pdf', f'package {no} {k}')
    nc = sum(len(json.loads(f.read_text())) for f in C.glob('corrections_*.json'))
    print(no, 'B ok', 'corrections', nc, flush=True)
if __name__ == '__main__':
    for no in sys.argv[1:]:
        try: main(no)
        except subprocess.CalledProcessError as e: print(no, 'B FAIL', (e.stderr or '')[-500:], flush=True)
        except Exception as e: print(no, 'B FAIL', repr(e)[:500], flush=True)
