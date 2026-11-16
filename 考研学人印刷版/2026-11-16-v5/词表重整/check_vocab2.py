#!/usr/bin/env python3
"""check_vocab2.py NN [NN ...]: deterministic checks for the reworked book vocabulary (SPEC-vocab2.md).
Prints ERR lines (must fix), WARN lines (look at each), and OK when no ERR."""
import json, re, sys
from pathlib import Path
V = Path('/tmp/claude-0/-home-user/3d87cc6c-41dd-58c2-802f-d51dc0c78527/scratchpad/vocab2')
POS = {'n.', 'vt.', 'vi.', 'link v.', 'aux. v.', 'modal v.', 'adj.', 'adv.', 'prep.', 'conj.', 'pron.', 'num.', 'art.', 'int.', 'phr.'}
MULTI_POS = {'n.', 'phr.', 'prep.', 'conj.', 'adv.', 'adj.'}
VERB = {'vt.', 'vi.', 'link v.', 'aux. v.', 'modal v.'}
CJK = re.compile(r'[一-鿿]')
OKED = {'need', 'feed', 'bleed', 'breed', 'shed', 'embed', 'exceed', 'proceed', 'succeed', 'speed', 'seed', 'heed', 'weed', 'shred', 'wed', 'bed', 'red', 'led'}

def check(no):
    inp = json.loads((V / f'input/{no}.json').read_text())['entries']
    p = V / f'out/{no}.json'
    if not p.exists(): return [f'ERR {no}: missing {p}'], []
    out = json.loads(p.read_text())
    errs, warns = [], []
    ents = out.get('entries', [])
    if [e.get('id') for e in ents] != [e['id'] for e in inp]:
        return [f'ERR {no}: ids must be exactly {[e["id"] for e in inp]} in order'], []
    seen = {}
    for src, e in zip(inp, ents):
        i = e['id']; lem = (e.get('lemma') or '').strip(); pos = (e.get('pos') or '').strip(); zh = e.get('zh') or ''; mi = e.get('merge_into')
        tag = f'{no} id={i} {src["en"]!r} -> {lem!r} {pos} {zh!r}'
        if not lem: errs.append(f'ERR {tag}: empty lemma'); continue
        if not re.fullmatch(r"[A-Za-z][A-Za-z .'\-/]*", lem): errs.append(f'ERR {tag}: lemma has characters outside letters, space, hyphen, apostrophe, slash')
        if pos not in POS: errs.append(f'ERR {tag}: pos must be one of {sorted(POS)}')
        words = [w for w in re.split(r'[ /]', lem) if w not in ('sb', 'sth', "one's", 'oneself', 'sb/sth')]
        multi = ' ' in lem
        if multi and pos not in MULTI_POS: errs.append(f'ERR {tag}: multi-word entry must be n., phr., prep., conj., adv. or adj.')
        if not multi and pos == 'phr.': errs.append(f'ERR {tag}: single word cannot be phr.')
        key = (lem.lower(), pos)
        if mi is not None:
            tgt = next((x for x in ents if x['id'] == mi), None)
            if tgt is None or mi >= i: errs.append(f'ERR {tag}: merge_into must point to an earlier id')
            elif (tgt['lemma'].strip().lower(), tgt['pos'].strip()) != key: errs.append(f'ERR {tag}: merge_into target {mi} has a different lemma/pos')
            continue
        if key in seen: errs.append(f'ERR {tag}: same lemma and pos as id={seen[key]}; set "merge_into": {seen[key]}')
        seen[key] = i
        if not CJK.search(zh): errs.append(f'ERR {tag}: zh must be Chinese'); continue
        if re.search(r'\*\*|[—–]|——|["“”`#]', zh): errs.append(f'ERR {tag}: zh has bold/dash/quote/markdown')
        if len(zh) > 16: errs.append(f'ERR {tag}: zh longer than 16 characters ({len(zh)})')
        elif len(zh) > 12: warns.append(f'WARN {tag}: zh is {len(zh)} characters; shorten if possible')
        senses = [s for s in zh.split('；')]
        if len(senses) > 3 or any(not s.strip() for s in senses): errs.append(f'ERR {tag}: use at most 3 senses separated by "；" and no empty sense')
        if pos in VERB or pos == 'phr.':
            for s in senses:
                if re.search(r'[了过着]$', re.sub(r'（[^）]*）$', '', s)) and not re.search(r'(为了|除了|罢了|不过|超过|通过|经过|难过|错过|度过|渡过|跳过|越过|绕过|透过|胜过|穿过|闪过|路过|熬过|挺过|撑过|放过|跨过|掠过|划过|翻过|躲过|漏过|赶过|胜不过|显着|沿着|顺着|朝着|向着|对着|随着|按着|照着|接着|凭着|本着|意味着|有着)$', s):
                    errs.append(f'ERR {tag}: verb sense "{s}" ends with an aspect particle (了/过/着); write the dictionary form')
                elif re.search('了', re.sub(r'了解|为了|除了|了不起|了结|明了|了却|了望|受不了|免不了|少不了|忘不了', '', s)):
                    errs.append(f'ERR {tag}: verb sense "{s}" contains the aspect particle 了; write the dictionary form')
        if re.search(r'[A-Za-z]', zh) and not re.search(r'[A-Z]{2,}', zh): warns.append(f'WARN {tag}: zh contains Latin letters')
        if src.get('zh_video') and zh == src['zh_video'] and re.search(r'了|过|着', zh): warns.append(f'WARN {tag}: zh copied verbatim from the video wording')
        # lemma vs text form heuristics
        en = src['en'].lower(); last = en.split()[0] if en.split() else en
        lw = lem.lower().split()[0]
        if pos in VERB and not multi and re.search(r'(ed|ing)$', lw) and lw not in OKED and lw == last:
            warns.append(f'WARN {tag}: verb lemma looks inflected; use the base form unless this really is the base form')
        if pos == 'n.' and not multi and lw.endswith('s') and lw == last and not lw.endswith(('ss', 'us', 'is', 'ics', 'ness', 'ous', 'ys')):
            warns.append(f'WARN {tag}: noun lemma ends in -s; singular unless plural-only or a distinct plural sense')
        if lem[:1].isupper() and not re.search(r'[A-Z]{2,}', lem) and src['en'][:1].isupper() and src['en'].split()[0].lower() == lem.split()[0].lower() and not multi:
            warns.append(f'WARN {tag}: capitalised lemma; lowercase unless a proper noun')
    return errs, warns

if __name__ == '__main__':
    bad = 0
    for no in sys.argv[1:]:
        errs, warns = check(no)
        for x in errs + warns: print(x)
        bad += len(errs)
    print('OK' if bad == 0 else f'{bad} ERR')
