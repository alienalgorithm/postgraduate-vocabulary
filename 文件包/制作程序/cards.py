#!/usr/bin/env python3
"""汉译英 / 英译汉 听写卡 (A4). Items = the word list printed after the article in the v5 book, in the new form the user
asked for on 2026-11-16/17: English base form (原形; phrases in dictionary form with sb/sth), part of speech, and the
dictionary sense that fits this article (data/NN.json → vocab_book; entries merged in the book are left out here too)."""
import json, sys
from pathlib import Path
from reportlab.pdfgen import canvas
from reportlab.pdfbase import pdfmetrics
from common import *

W, H = A4; L, R, T, BOT = 20 * MM, 20 * MM, 20 * MM, 18 * MM
TW = W - L - R
BOOK_DATA = V5 / 'data'

def book_items(a):
    """The book's word list for this article, aligned entry by entry with the video word list in article.json."""
    d = json.loads((BOOK_DATA / f'{a["no"]}.json').read_text())
    vb = d['vocab_book']
    assert d['title_zh'] == a['title_zh'], (a['no'], 'title differs from the book')
    assert [(v['para'], v['term']) for v in vb] == [(v['para'], v['en']) for v in a['vocab']], (a['no'], 'word list differs from the book')
    return [v for v in vb if not v['drop']]

def sense(pos, zh, size, leading, width, color=INK):
    """pos + sense: one line when it fits; otherwise break after the full-width semicolon between the two senses,
    or at a natural point inside one long sense; lines are set flush left."""
    head = [(pos + ' ', 'ENI', MUTED)] if pos else []
    def P(runs):
        p = CJKPara(runs, size, leading); p.wrap(width, 1000); p.ragged = True; return p
    one = P(head + [(zh, 'ZH', color)])
    if len(one.lines) == 1: return [one]
    tries = []
    if '；' in zh:
        a, b = zh.split('；', 1); tries.append((a + '；', b))
    for test in (lambda i: zh[i] in '并给', lambda i: zh[i - 1] == '）', lambda i: zh[i:i + 2] == '……'):
        tries += [(zh[:i], zh[i:]) for i in range(len(zh) - 1, 1, -1) if test(i)]
    for a, b in tries:
        ps = [P(head + [(a, 'ZH', color)]), P([(b, 'ZH', color)])]
        if all(len(p.lines) == 1 for p in ps): return ps
    return [one]

def en_lines(text, font, size, width):
    """Greedy word wrap for an English base form or phrase."""
    out, cur = [], ''
    for w in text.split(' '):
        t = (cur + ' ' + w).strip()
        if cur and pdfmetrics.stringWidth(t, font, size) > width: out.append(cur); cur = w
        else: cur = t
    return out + [cur]

def build(article, out, mode):
    a = json.loads(Path(article).read_text())
    items = book_items(a)
    zh2en = mode == 'zh2en'
    name = '汉译英听写卡' if zh2en else '英译汉听写卡'
    hint = ('看词性和中文意思，在横线上写出英文。单词写原形，短语写词典形式。' if zh2en
            else '看英文和词性，在横线上写出它在本篇中的中文意思。')
    c = canvas.Canvas(str(out), pagesize=A4, pageCompression=1, invariant=0, initialFontName='EN')
    c.setTitle(f'{a["no"]} {a["title_zh"]}｜{name}'); c.setAuthor('朋克英语'); c.setCreator('朋克英语')
    st = {'page': 0, 'y': 0}
    def foot():
        c.setFont('EN', 8.6); c.setFillColor(C(MUTED)); c.drawCentredString(W / 2, 11 * MM, str(st['page']))
    def new_page(first=False):
        if st['page']: foot(); c.showPage()
        st['page'] += 1; y = H - T
        if first:
            c.setFont('ZHS', 9.6); c.setFillColor(C(ACCENT)); c.drawString(L, y - 9, f'{a["no"]}  {a["title_zh"]}')
            c.setFont('ENI', 9.6); c.setFillColor(C(MUTED)); c.drawRightString(W - R, y - 9, a['title_en'])
            c.setFont('ZH', 22); c.setFillColor(C(INK)); c.drawString(L, y - 44, name)
            c.setFont('ZHS', 9.6); c.setFillColor(C(MUTED)); c.drawRightString(W - R, y - 42, '日期 ________    正确 ________')
            c.setStrokeColor(C(RULE)); c.setLineWidth(0.5); c.line(L, y - 56, W - R, y - 56)
            c.setFont('ZHS', 9.6); c.setFillColor(C(MUTED)); c.drawString(L, y - 72, hint)
            y -= 90
        else:
            c.setFont('ZHS', 7.6); c.setFillColor(C(MUTED)); c.drawString(L, H - 12 * MM, f'{a["no"]}  {a["title_zh"]}｜{name}')
        st['y'] = y
    new_page(True)
    ROW = 9.4 * MM; numw = 9 * MM; promptw = 64 * MM; line_x = L + numw + promptw + 6 * MM
    PS, PL = 11, 13.5                                   # prompt size / leading (Chinese)
    paras = []
    for v in items:
        if not paras or paras[-1][0] != v['para']: paras.append((v['para'], []))
        paras[-1][1].append(v)
    k = 0
    for gi, (pi, group) in enumerate(paras):
        if gi: st['y'] -= 6
        first_h = ROW
        if st['y'] - (16 + first_h) < BOT: new_page()
        y = st['y']
        c.setFont('ZHS', 8.8); c.setFillColor(C(MUTED)); c.drawString(L, y - 9, ZH_NUM(pi - 1))
        c.setStrokeColor(C(RULE)); c.setLineWidth(0.4); c.line(L + 34, y - 6, W - R, y - 6)
        st['y'] -= 16
        for v in group:
            k += 1
            if zh2en:
                ps = sense(v['pos'], v['zh'], PS, PL, promptw); n = sum(len(p.lines) for p in ps)
            else:
                en_size = 11.6
                while en_size > 9.6 and pdfmetrics.stringWidth(v['lemma'], 'EN', en_size) + 4 + pdfmetrics.stringWidth(v['pos'], 'ENI', 10) > promptw: en_size -= 0.2
                n = 1
            rh = ROW + PL * (n - 1)
            if st['y'] - rh < BOT: new_page()
            y = st['y']; base = y - rh + 2.6 * MM
            c.setFont('EN', 9.4); c.setFillColor(C(ACCENT)); c.drawRightString(L + numw - 3 * MM, base, str(k))
            if zh2en:
                top = base + PS * 0.98 + PL * (n - 1)
                for p in ps: p.draw(c, L + numw, top); top -= PL * len(p.lines)
            else:
                c.setFont('EN', en_size); c.setFillColor(C(INK)); c.drawString(L + numw, base, v['lemma'])
                x = L + numw + pdfmetrics.stringWidth(v['lemma'], 'EN', en_size) + 4
                c.setFont('ENI', 10); c.setFillColor(C(MUTED)); c.drawString(x, base, v['pos'])
            c.setStrokeColor(C('#9AA59E')); c.setLineWidth(0.6); c.line(line_x, base - 1.5, W - R, base - 1.5)
            st['y'] -= rh
    # answer key on its own page(s), so the sheet can be used without seeing it
    new_page()
    y0 = st['y']; c.setFont('ZH', 16); c.setFillColor(C(INK)); c.drawString(L, y0 - 16, '答案'); y0 -= 34
    cols, gut = 3, 6 * MM; colw = (TW - gut * (cols - 1)) / cols; tw = colw - 9 * MM
    AS, AL = 10, 12.4                                   # answer size / leading
    cells = []
    for i, v in enumerate(items):
        if zh2en:
            lines = en_lines(v['lemma'], 'EN', 10.2, tw); cells.append((i + 1, lines, None, len(lines)))
        else:
            ps = sense('', v['zh'], AS, AL, tw); cells.append((i + 1, None, ps, sum(len(p.lines) for p in ps)))
    ci, y = 0, y0
    for n, lines, ps, nl in cells:
        h = max(15, AL * nl + 2.6)
        if y - h < BOT:
            ci += 1; y = y0
            if ci == cols: new_page(); ci = 0; y0 = st['y']; y = y0
        x = L + ci * (colw + gut)
        c.setFont('EN', 8.8); c.setFillColor(C(ACCENT)); c.drawRightString(x + 7 * MM, y - 10, str(n))
        if lines:
            c.setFont('EN', 10.2); c.setFillColor(C(INK))
            for j, t in enumerate(lines): c.drawString(x + 9 * MM, y - 10 - AL * j, t)
        else:
            top = y - 1
            for p in ps: p.draw(c, x + 9 * MM, top); top -= AL * len(p.lines)
        y -= h
    foot(); c.showPage(); c.save()
    return st['page'], len(items)

if __name__ == '__main__':
    print(*build(sys.argv[1], sys.argv[2], sys.argv[3]), 'pages/items')
