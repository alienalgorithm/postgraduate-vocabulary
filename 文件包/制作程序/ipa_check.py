#!/usr/bin/env python3
"""Machine cross-check of the US IPA against the CMU Pronouncing Dictionary: consonant skeleton and primary-stress
position. Dictionary conventions differ on vowels, so vowels are not compared. Mismatches are reported for review."""
import json, re, sys
import cmudict
CMU = cmudict.dict()
ARPA_C = {'B': 'b', 'CH': 'ʧ', 'D': 'd', 'DH': 'ð', 'F': 'f', 'G': 'g', 'HH': 'h', 'JH': 'ʤ', 'K': 'k', 'L': 'l', 'M': 'm',
          'N': 'n', 'NG': 'ŋ', 'P': 'p', 'R': 'r', 'S': 's', 'SH': 'ʃ', 'T': 't', 'TH': 'θ', 'V': 'v', 'W': 'w', 'Y': 'j',
          'Z': 'z', 'ZH': 'ʒ'}
VOW = set('aeiouæɑɒɔəɛɜɪʊʌɚɝɐɨʉøœɯɤyɘɵ')

def ipa_skeleton(ipa):
    s = re.sub(r'[/\[\]().ːˑ‿͡\s]', '', ipa).replace('tʃ', 'ʧ').replace('dʒ', 'ʤ').replace('ɹ', 'r').replace('ɡ', 'g')
    s = s.replace('ɾ', 't').replace('ʔ', '').replace('ɫ', 'l').replace('ɚ', 'ər').replace('ɝ', 'ɜr').replace('̩', '')
    cons = ''.join(ch for ch in s if ch not in VOW and ch not in 'ˈˌ')
    cons = re.sub(r'r+', 'r', cons)
    # primary stress: number of vowel groups before ˈ
    pre = s.split('ˈ')[0] if 'ˈ' in s else None
    groups = None if pre is None else len(re.findall('[' + ''.join(VOW) + ']+', pre))
    return cons, groups

def arpa_skeleton(phones):
    cons = ''.join(ARPA_C.get(p.rstrip('012'), '') if p.rstrip('012') in ARPA_C else ('r' if p.startswith('ER') else '') for p in phones)
    cons = re.sub(r'r+', 'r', cons)
    vow = [p for p in phones if p[-1] in '012']
    stress = next((i for i, p in enumerate(vow) if p.endswith('1')), None)
    return cons, stress

def check(word, ipa_us):
    words = re.findall(r"[A-Za-z']+", word.lower())
    variants = [[]]
    for w in words:
        prons = CMU.get(w)
        if not prons: return 'not in CMU'
        variants = [v + p for v in variants for p in prons][:64]
    got_c, got_s = ipa_skeleton(ipa_us)
    best = None
    for v in variants:
        c, st = arpa_skeleton(v)
        ok_c = c == got_c; ok_s = len(words) > 1 or got_s is None or st == got_s
        if ok_c and ok_s: return None
        best = best or (c, st)
    return f'IPA consonants {got_c} stress@{got_s} vs CMU {best[0]} stress@{best[1]}'

if __name__ == '__main__':
    items = json.load(open(sys.argv[1]))
    bad = [(i['id'], i['headword'], i['ipa_us'], r) for i in items for r in [check(i['headword'], i['ipa_us'])] if r]
    print(json.dumps(bad, ensure_ascii=False, indent=0))
