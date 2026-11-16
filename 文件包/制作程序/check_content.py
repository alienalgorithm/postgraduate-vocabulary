#!/usr/bin/env python3
"""Machine checks for one article's 逐句精讲 / 单词精解 content. Usage: check_content.py NN [sent|words_a|words_b|all]
Prints OK or the problems (fix them and re-run)."""
import json, re, sys
from pathlib import Path
S = Path('/tmp/claude-0/-home-user/3d87cc6c-41dd-58c2-802f-d51dc0c78527/scratchpad')
sys.path.insert(0, str(S / 'pkgtools'))
BAN = ['——', '—', '–', '**', '怎么理解', '如何理解', '值得注意的是', '总之', '让我们', '`', '# ']
SENT_KEYS = {'n', 'trunk', 'components', 'structure', 'long_difficult', 'grammar', 'knowledge', 'translation_tip'}
WORD_KEYS = {'id', 'headword', 'ipa_uk', 'ipa_us', 'pos', 'form_note', 'context_usage', 'etymology', 'senses', 'collocations',
             'usage_detail', 'distinction', 'related', 'example'}

def plan(a):
    ids = [v['id'] for v in a['vocab']]; h = (len(ids) + 1) // 2
    return {'sent': [s['n'] for s in a['sentences']], 'words_a': ids[:h], 'words_b': ids[h:]}

def check(no, part):
    a = json.loads((S / f'pkg/{no}/article.json').read_text()); P = plan(a); C = S / f'pkg/{no}/content'
    arts = ' '.join(s['en'] for s in a['sentences']); bad = []
    parts = ['sent', 'words_a', 'words_b'] if part == 'all' else [part]
    for pt in parts:
        f = C / f'{pt}.json'
        if not f.exists(): bad.append(f'{pt}: file missing {f}'); continue
        try: items = json.loads(f.read_text())
        except Exception as e: bad.append(f'{pt}: invalid JSON: {e}'); continue
        key = 'n' if pt == 'sent' else 'id'
        got = [it.get(key) for it in items]
        if got != P[pt]: bad.append(f'{pt}: items must be exactly {key} = {P[pt]} in order; got {got}')
        blob = json.dumps(items, ensure_ascii=False)
        for tok in set(re.findall(r'\S*[–—]\S*', arts)):     # dashes that are in the original English itself (e.g. a 4–1 score) are quoted, not ours
            blob = blob.replace(tok.strip('.,;:!?"“”()'), '')
        for b in BAN:
            if b in blob: bad.append(f'{pt}: forbidden text {b!r} appears {blob.count(b)} times')
        for it in items:
            tag = f"{pt} {key}={it.get(key)}"
            need = SENT_KEYS if pt == 'sent' else WORD_KEYS
            miss = need - set(it)
            if miss: bad.append(f'{tag}: missing fields {sorted(miss)}'); continue
            if pt == 'sent':
                s = a['sentences'][it['n'] - 1]
                if ' '.join(c.get('text', '') for c in it['components']) != s['en']:
                    bad.append(f'{tag}: components joined with single spaces must equal the sentence exactly')
                for c in it['components']:
                    z = (c.get('zh') or '').strip(); r = (c.get('role') or '').strip()
                    if not z or not r: bad.append(f'{tag}: component {c.get("text")!r} needs both zh and role'); continue
                    if z.startswith('（') and z.endswith('）'): continue
                    for piece in z.split('……'):
                        if piece and piece not in s['zh']: bad.append(f'{tag}: component {c["text"]!r} zh piece {piece!r} is not in the video Chinese of this sentence')
                for k in ('subject', 'predicate'):
                    if not str(it['trunk'].get(k, '')).strip(): bad.append(f'{tag}: trunk.{k} empty')
                if not 1 <= len(it['grammar']) <= 4: bad.append(f'{tag}: grammar must have 1 to 4 points')
                for g in it['grammar']:
                    if g.get('difficult') and not g.get('examples'): bad.append(f'{tag}: difficult grammar point {g.get("title")!r} has no example')
                    for e in g.get('examples', []):
                        if e.get('en', '').strip() and e['en'].strip() in arts: bad.append(f'{tag}: example copied from the article')
                        if not e.get('zh', '').strip(): bad.append(f'{tag}: example without Chinese')
            else:
                for f2 in ('ipa_uk', 'ipa_us'):
                    if not re.fullmatch(r'/[^/]+/', str(it[f2]).strip()): bad.append(f'{tag}: {f2} must look like /…/')
                ex = it['example']
                if not ex.get('en', '').strip() or not ex.get('zh', '').strip(): bad.append(f'{tag}: example needs en and zh')
                elif ex['en'].strip() in arts: bad.append(f'{tag}: example copied from the article')
                if not it['senses'] or not it['collocations']: bad.append(f'{tag}: senses and collocations must not be empty')
    if part in ('words_a', 'words_b', 'all'):
        try:
            from ipa_check import check as ipa
            for pt in [p for p in parts if p != 'sent']:
                f = C / f'{pt}.json'
                if f.exists():
                    for it in json.loads(f.read_text()):
                        r = ipa(it.get('headword', ''), it.get('ipa_us', ''))
                        if r and r != 'not in CMU': print(f'NOTE {pt} id={it["id"]} {it["headword"]} {it["ipa_us"]}: {r} (re-check against Oxford/Cambridge; fix if wrong)')
        except Exception as e: print('NOTE ipa check skipped', e)
    return bad

if __name__ == '__main__':
    no = sys.argv[1]; part = sys.argv[2] if len(sys.argv) > 2 else 'all'
    bad = check(no, part)
    print('OK' if not bad else '\n'.join(bad[:60]))
