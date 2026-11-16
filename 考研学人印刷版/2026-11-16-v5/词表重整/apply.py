#!/usr/bin/env python3
"""apply.py NN [NN ...]: put the checked vocab2/out/NN.json into the book data (field vocab_book) of the
build mirror and the repo. Refuses unless check_vocab2.py passes for that article."""
import json, subprocess, sys
from pathlib import Path
S = Path('/tmp/claude-0/-home-user/3d87cc6c-41dd-58c2-802f-d51dc0c78527/scratchpad'); V = S / 'vocab2'
DATA = [S / 'kbuild/2026-11-16-v5/data']   # build mirror only; the repo gets the reviewed data in one commit
for no in sys.argv[1:]:
    r = subprocess.run(['python3', V / 'check_vocab2.py', no], capture_output=True, text=True).stdout.strip().splitlines()
    assert r and r[-1] == 'OK', (no, r[-5:])
    inp = json.loads((V / f'input/{no}.json').read_text())['entries']
    out = {e['id']: e for e in json.loads((V / f'out/{no}.json').read_text())['entries']}
    vb = [{'para': e['para'], 'term': e['en'], 'lemma': out[e['id']]['lemma'].strip(), 'pos': out[e['id']]['pos'].strip(),
           'zh': (out[e['id']].get('zh') or '').strip(), 'drop': out[e['id']].get('merge_into') is not None} for e in inp]
    for D in DATA:
        p = D / f'{no}.json'; d = json.loads(p.read_text()); d['vocab_book'] = vb
        p.write_text(json.dumps(d, ensure_ascii=False, indent=1))
    print(no, len(vb), 'entries', sum(v['drop'] for v in vb), 'merged')
