#!/usr/bin/env python3
"""Article package data: sentences (from the final video's roundtrip source) + vocabulary (same rule as v5 book)."""
import importlib.util, json, re, sys
from pathlib import Path
S = Path('/tmp/claude-0/-home-user/3d87cc6c-41dd-58c2-802f-d51dc0c78527/scratchpad')
spec = importlib.util.spec_from_file_location('b5', S / 'v5/build_v5.py'); B5 = importlib.util.module_from_spec(spec)
_argv = sys.argv; sys.argv = ['x']; spec.loader.exec_module(B5); sys.argv = _argv   # build_v5 parses argv on import

def zh_plain(m):
    m = re.sub(r'\{\{[^{}]*\}\}', '', m)
    m = re.sub(r'\*\*([^*]+)\*\*\([^)]*\)', r'\1', m)
    return m.replace('**', '').replace('\n', '')

def en_plain(m): return re.sub(r'\s{2,}', ' ', re.sub(r'\{\{[^{}]*\}\}', '', m)).replace('**', '').strip()   # {{一行}} etc. are layout hints

def prep(no):
    d = json.loads((S / f'v5/data/{no}.json').read_text())
    src = json.loads(Path(d['source_paths']['JSON']).read_text())
    sents = []
    for i, s in enumerate(src['sentences'], 1):
        ch = s['chunks']
        sents.append({'n': i, 'para': s['para'],
                      'en': ' '.join(en_plain(c['en']) for c in ch),
                      'zh': ''.join(zh_plain(c['zh']) for c in ch),
                      'en_markup': ' '.join(c['en'] for c in ch),
                      'zh_markup': ''.join(c['zh'] for c in ch),
                      'video_notes': [c['note'].split('\n（简述')[0].replace('\n', '') for c in ch if c.get('note')] +
                                     [g for c in ch for g in re.findall(r'\{\{([^|{}]*)\|[^{}]*\}\}', c['zh'])],
                      'chunks': [{'en': en_plain(c['en']), 'zh': zh_plain(c['zh'])} for c in ch],
                      'align': [[en_plain(e).strip(), zh_plain(z).strip()] for c in ch for e, z in c.get('align', [])]})
    # consistency with the book text
    for p, txt in enumerate(d['english_paragraphs'], 1):
        joined = ' '.join(s['en'] for s in sents if s['para'] == p)
        assert joined == txt, (p, joined[:80], txt[:80])
    for p, txt in enumerate(d['chinese_paragraphs'], 1):
        joined = ''.join(s['zh'] for s in sents if s['para'] == p)
        if joined != txt: print('zh paragraph differs', p, '\n ', joined, '\n ', txt)
    vocab, k = [], 0
    vmeta = {v['source_term'].lower(): v for v in d['vocabulary']}
    for pi, items in B5.vocab_by_paragraph(d):
        for en, zh in items:
            k += 1
            sn = next((s['n'] for s in sents if s['para'] == pi + 1 and re.search(r'\*\*' + re.escape(en) + r'\*\*|\b' + re.escape(en) + r'\b', s['en_markup'], re.I)), None)
            if sn is None:   # split phrases (elevated … to, caught him unawares): the words in order, gaps allowed
                ws = re.findall(r"[A-Za-z0-9'’]+", en)
                gp = r'(?<![A-Za-z])' + r'(?![A-Za-z]).*?(?<![A-Za-z])'.join(re.escape(w) for w in ws) + r'(?![A-Za-z])'
                sn = next((s['n'] for s in sents if s['para'] == pi + 1 and re.search(gp, s['en'], re.I)), None)
            m = vmeta.get(en.lower(), {})
            vocab.append({'id': k, 'para': pi + 1, 'sentence': sn, 'en': en, 'zh_video': zh,
                          'headword': m.get('headword'), 'pos': m.get('pos'),
                          'table_definition': m.get('current_table_definition')})
    out = {'no': no, 'title_en': d['title_en'], 'title_zh': d['title_zh'], 'source_id': d['source_id'],
           'source_hashes': d['source_hashes'], 'summary': d['approved_summary'],
           'sentences': sents, 'vocab': vocab}
    (S / f'pkg/{no}').mkdir(parents=True, exist_ok=True)
    (S / f'pkg/{no}/article.json').write_text(json.dumps(out, ensure_ascii=False, indent=1))
    return out

if __name__ == '__main__':
    o = prep(sys.argv[1] if len(sys.argv) > 1 else '01')
    print(len(o['sentences']), 'sentences', len(o['vocab']), 'vocab', sum(1 for v in o['vocab'] if v['sentence'] is None), 'unlocated')
    print([ (v['en'], v['zh_video'], v['sentence'], v['headword'], v['pos']) for v in o['vocab']])
