#!/usr/bin/env python3
"""逐句精讲 (A4): per sentence: the sentence (key words coloured) and the video's Chinese, sentence trunk,
constituent table, layered structure analysis, grammar points (examples under the hard ones), knowledge points,
translation notes. Content: written then independently checked (see 核验); the text and Chinese are the video's."""
import json, re, sys
from pathlib import Path
from doc import *

IND = 12 * MM; CW = TW - IND
ZHC = '#56645C'   # constituent Chinese: a little lighter than body text

def zh_markup_runs(m):
    return B.zh_runs(re.sub(r'\{\{[^{}]*\}\}', '', m))

def trunk_label(item):
    oc = item['trunk']['object_or_complement'].strip()
    if not oc: return None
    for comp in item['components']:
        t = comp['text'].rstrip('.,;:')
        if t and (t in oc or oc in t):
            for k in ['宾语补足语', '表语', '双宾语', '宾语']:
                if k in comp['role']: return k
    ex = item['trunk']['explain']
    for k, lab in [('主系表', '表语'), ('宾补', '宾语 · 宾补'), ('主谓宾', '宾语')]:
        if k in ex: return lab
    return '宾语'

def build(article, content, out):
    a = json.loads(Path(article).read_text()); items = {i['n']: i for i in json.loads(Path(content).read_text())}
    assert sorted(items) == [s['n'] for s in a['sentences']]
    d = Doc(out, f'{a["no"]}  {a["title_zh"]}｜逐句精讲', f'{a["no"]} {a["title_zh"]}｜逐句精讲', '逐句精讲：主干、成分、结构、语法、知识点')
    d.new_page(); d.title_block(a['no'], a['title_zh'], a['title_en'], '逐句精讲')
    d.label('全文脉络'); d.mark('全文脉络')
    for name, text in a['summary']:
        p = CJKPara([(name + '：', 'ZH', ACCENT)] + mixed(text.replace('▹', '')), 10.2, 17)
        d.c.setFillColor(C(ACCENT)); d.c.circle(L + 2.4, d.y - 6.4, 1.6, stroke=0, fill=1)
        d.flow(p, 4, indent=10)
    d.y -= 10
    cur_para = None
    for s in a['sentences']:
        it = items[s['n']]
        if s['para'] != cur_para:
            cur_para = s['para']; d.need(120); d.y -= 6
            d.c.setFont('ZH', 13); d.c.setFillColor(C(INK)); d.c.drawString(L, d.y - 13, ZH_NUM(cur_para - 1))
            d.c.setStrokeColor(C(RULE)); d.c.setLineWidth(0.5); d.c.line(L + 46, d.y - 8.5, W - R, d.y - 8.5)
            d.mark(ZH_NUM(cur_para - 1)); d.y -= 26
        # ---- sentence head: number, sentence, the video's Chinese (kept together)
        en = en_markup(s['en_markup'], 12.2, 18.4); _, eh = en.wrap(CW, 1e6)
        zh = CJKPara(zh_markup_runs(s['zh_markup']), 10.4, 17.4); _, zh_h = zh.wrap(CW, 1e6)
        d.need(16 + eh + 6 + zh_h + 60)
        d.mark(f'第{s["n"]}句', 1)
        c = d.c; c.setFont('END', 20); c.setFillColor(C(ACCENT)); c.drawRightString(L + IND - 9, d.y - 17, str(s['n']))
        if it['long_difficult']: d.tag(L + IND, d.y - 9, '长难句'); d.y -= 15
        d.flow(en, 5, IND); d.flow(zh, 10, IND)
        # ---- trunk
        tr = it['trunk']; lab = trunk_label(it)
        runs = [('主语  ', 'ZHS', MUTED)] + mixed(tr['subject']) + [('     谓语  ', 'ZHS', MUTED)] + mixed(tr['predicate'])
        if lab: runs += [(f'     {lab}  ', 'ZHS', MUTED)] + mixed(tr['object_or_complement'])
        d.label('句子主干', IND, 40); d.flow(CJKPara(runs, 10.6, 17), 3, IND)
        d.flow(CJKPara(mixed(tr['explain']), 10, 16.6), 8, IND)
        # ---- constituents
        d.label('成分划分', IND, 30)
        lw = CW * 0.50; rw = CW - lw - 8
        for comp in it['components']:
            lp = en_markup(comp['text'], 10.4, 15); _, lh = lp.wrap(lw, 1e6)
            zp = CJKPara(mixed(comp.get('zh', ''), ZHC), 9.8, 14.6); zp.ragged = True; _, zh_ = zp.wrap(lw, 1e6)   # user 2026-11-16: every constituent with its Chinese (the video's wording)
            rp = CJKPara(mixed(comp['role'], ACCENT), 9.6, 15); rp.ragged = True; _, rh = rp.wrap(rw, 1e6)
            h = max(lh + 1 + zh_, rh) + 7; d.need(h)
            lp.w = lw; lp.draw(c, L + IND, d.y - 2); zp.draw(c, L + IND, d.y - 3 - lh); rp.draw(c, L + IND + lw + 8, d.y - 2)
            c.setStrokeColor(C(RULE)); c.setLineWidth(0.3); c.line(L + IND, d.y - h + 1, L + TW, d.y - h + 1)
            d.y -= h
        d.y -= 8
        # ---- structure
        d.label('结构分析', IND, 34)
        for part in [p for p in re.split(r'\n+|(?=[②③④⑤⑥⑦⑧⑨])', it['structure']) if p.strip()]:
            d.flow(CJKPara(mixed(part.strip()), 10, 16.6), 4, IND)
        d.y -= 6
        # ---- grammar
        if it['grammar']:
            d.label('语法点', IND, 34)
            for gi, g in enumerate(it['grammar'], 1):
                t = CJKPara([(f'{gi}  ', 'EN', ACCENT)] + mixed(g['title'], ACCENT), 10.4, 16.6); _, th = t.wrap(CW - (34 if g['difficult'] else 0), 1e6)
                d.need(th + 34)
                if g['difficult']: d.tag(L + TW - 26, d.y - 10, '难点')
                d.flow(t, 2, IND, width=TW - (34 if g['difficult'] else 0))
                d.flow(CJKPara(mixed(g['explain']), 10, 16.6), 4, IND)
                for ex in g['examples']:
                    ep = B.ENWrap(Paragraph(escape(ex['en']), ParagraphStyle('x', fontName='ENI', fontSize=10.2, leading=15, textColor=C(INK))))
                    _, eh2 = ep.wrap(CW - 16, 1e6); zp = CJKPara(mixed(ex['zh'], MUTED), 9.6, 15); _, zh2 = zp.wrap(CW - 16, 1e6)
                    d.need(eh2 + zh2 + 4)
                    c.setFont('ZHS', 8.4); c.setFillColor(C(ACCENT)); c.drawString(L + IND, d.y - 10.2, '例')
                    d.flow(ep, 1, IND + 16); d.flow(zp, 5, IND + 16)
                d.y -= 3
            d.y -= 4
        # ---- knowledge
        if it['knowledge']:
            d.label('知识点', IND, 34)
            for k in it['knowledge']:
                d.flow(CJKPara(mixed(k['term'], ACCENT) + [('：', 'ZH', ACCENT)] + mixed(k['explain']), 10, 16.6), 5, IND)
            d.y -= 4
        # ---- translation
        if it['translation_tip'].strip():
            d.label('译法提示', IND, 34)
            for part in [p for p in re.split(r'\n+|(?=[②③④⑤⑥⑦⑧⑨])', it['translation_tip']) if p.strip()]:
                d.flow(CJKPara(mixed(part.strip()), 10, 16.6), 4, IND)
        d.y -= 8
        if s['n'] != a['sentences'][-1]['n']:
            d.need(24); c.setStrokeColor(C(RULE)); c.setLineWidth(0.5); c.line(L + IND, d.y - 6, L + TW, d.y - 6); d.y -= 20
    d.save(); return d.page

if __name__ == '__main__':
    print(build(sys.argv[1], sys.argv[2], sys.argv[3]), 'pages')
