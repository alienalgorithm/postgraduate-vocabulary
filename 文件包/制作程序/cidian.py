#!/usr/bin/env python3
"""单词精解册 (A4): every key word of the article in article order (same list as the book and the cards).
Per word: headword, UK/US IPA, part of speech, this article's meaning (the video's Chinese, verbatim), form in the
text, use in this context, word origin and formation, common senses, collocations, detailed usage, near-synonym
distinction, related words, the article sentence (with the video's Chinese) and one sentence from outside the article."""
import json, re, sys
from pathlib import Path
from doc import *

LW = 17 * MM

def highlight(sentence, term):
    m = re.search(r'(?<![A-Za-z])' + re.escape(term) + r'(?![A-Za-z])', sentence, re.I)
    assert m, (term, sentence)
    return sentence[:m.start()] + '**' + sentence[m.start():m.end()] + '**' + sentence[m.end():]

def build(article, content, out):
    a = json.loads(Path(article).read_text()); items = {i['id']: i for i in json.loads(Path(content).read_text())}
    assert sorted(items) == [v['id'] for v in a['vocab']], 'every listed word needs an entry'
    sents = {s['n']: s for s in a['sentences']}
    d = Doc(out, f'{a["no"]}  {a["title_zh"]}｜单词精解册', f'{a["no"]} {a["title_zh"]}｜单词精解册', '重点词：本文语境、词源构词、用法、例句')
    d.new_page(); d.title_block(a['no'], a['title_zh'], a['title_en'], '单词精解册')
    d.c.setFont('ZHS', 9.6); d.c.setFillColor(C(MUTED)); d.c.drawString(L, d.y + 6, '按文中出现的先后排列；“本文”后的中文与视频一致。'); d.y -= 8
    cur = None; c = d.c
    for v in a['vocab']:
        it = items[v['id']]; s = sents[v['sentence']]
        if v['para'] != cur:
            cur = v['para']; d.need(110); d.y -= 4
            c.setFont('ZH', 13); c.setFillColor(C(INK)); c.drawString(L, d.y - 13, ZH_NUM(cur - 1))
            c.setStrokeColor(C(RULE)); c.setLineWidth(0.5); c.line(L + 46, d.y - 8.5, W - R, d.y - 8.5)
            d.mark(ZH_NUM(cur - 1)); d.y -= 24
        # ---- head line: number, headword, pos | IPA
        d.need(26 + 17 + 4 * 16.4)
        d.mark(f'{v["id"]}  {it["headword"]}', 1)
        y = d.y - 17
        c.setFont('EN', 9); c.setFillColor(C(ACCENT)); c.drawRightString(L + 7 * MM, y + 1, str(v['id']))
        c.setFont('END', 17); c.setFillColor(C(INK)); c.drawString(L + 9 * MM, y, it['headword'])
        hw = pdfmetrics.stringWidth(it['headword'], 'END', 17)
        pp = CJKPara(mixed(it['pos'], MUTED, en='ENI'), 10.4, 13); pp.wrap(80 * MM, 100); pp.draw(c, L + 9 * MM + hw + 7, y + 10.2)
        ipa = [('英 ', 'ZHS', MUTED), (it['ipa_uk'], 'IPA', INK), ('    美 ', 'ZHS', MUTED), (it['ipa_us'], 'IPA', INK)]
        ip = CJKPara(ipa, 9.8, 13); ip.wrap(TW, 100)
        iw = sum(pdfmetrics.stringWidth(t, f, 9.8) for t, f, _ in ipa)
        ip.draw(c, W - R - iw, y + 10)
        d.y -= 26
        IN = 9 * MM
        def sect(name, runs, gap=4):
            p = CJKPara(runs, 10, 16.4); _, h = p.wrap(TW - IN - LW, 1e6); d.need(min(h, 2 * 16.4))
            c.setFont('ZHS', 9.2); c.setFillColor(C(ACCENT)); c.drawString(L + IN, d.y - 10.6, name)
            d.flow(p, gap, IN + LW)
        meaning = [('本文　', 'ZHS', ACCENT), (v['zh_video'], 'ZH', ACCENT)]
        if it['form_note'].strip() and it['form_note'].strip() != '文中为原形':
            meaning += [('　　', 'ZH', INK)] + mixed(it['form_note'], MUTED)
        d.flow(CJKPara(meaning, 10.4, 16.4), 5, IN)
        for name, key in [('本文语境', 'context_usage'), ('词源构词', 'etymology')]:
            if it[key].strip(): sect(name, mixed(it[key]))
        if it['senses']:
            runs = []
            for k, sv in enumerate(it['senses']):
                runs += ([('；', 'ZH', INK)] if k else []) + mixed(sv['pos'] + ' ', MUTED, en='ENI') + mixed(sv['zh'])
            sect('常用义项', runs)
        if it['collocations']:
            runs = []
            for k, col in enumerate(it['collocations']):
                runs += ([('；', 'ZH', INK)] if k else []) + mixed(col['en'], ACCENT) + mixed('（' + col['zh'] + '）')
            sect('常见搭配', runs)
        for name, key in [('用法详解', 'usage_detail'), ('近义辨析', 'distinction')]:
            if it[key].strip(): sect(name, mixed(it[key]))
        if it['related']:
            runs = []
            for k, r in enumerate(it['related']):
                runs += ([('；', 'ZH', INK)] if k else []) + mixed(r['en']) + mixed(' ' + r['pos'] + ' ', MUTED, en='ENI') + mixed(r['zh'])
            sect('同根词', runs)
        # ---- examples: one from the article (with the video's Chinese), one from outside
        d.need(64)
        c.setFont('ZHS', 9.2); c.setFillColor(C(ACCENT)); c.drawString(L + IN, d.y - 10.4, '文中例句')
        d.flow(en_markup(highlight(s['en'], v['en']), 10.4, 15.6), 1, IN + LW)
        d.flow(CJKPara(mixed(s['zh'], MUTED), 9.6, 15), 5, IN + LW)
        c.setFont('ZHS', 9.2); c.setFillColor(C(ACCENT)); c.drawString(L + IN, d.y - 10.4, '文外例句')
        d.flow(en_markup(it['example']['en'], 10.4, 15.6, font='ENI'), 1, IN + LW)
        d.flow(CJKPara(mixed(it['example']['zh'], MUTED), 9.6, 15), 8, IN + LW)
        d.need(14); c.setStrokeColor(C(RULE)); c.setLineWidth(0.4); c.line(L + IN, d.y - 2, W - R, d.y - 2); d.y -= 12
    d.save(); return d.page

if __name__ == '__main__':
    print(build(sys.argv[1], sys.argv[2], sys.argv[3]), 'pages')
