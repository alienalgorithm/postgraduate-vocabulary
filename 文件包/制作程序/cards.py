#!/usr/bin/env python3
"""汉译英 / 英译汉 听写卡 (A4). Items = the article's vocabulary exactly as listed after the article in the book
(per paragraph, article order, first occurrence only; English as in the text, Chinese = the video's meaning)."""
import json, sys
from pathlib import Path
from reportlab.pdfgen import canvas
from common import *

W, H = A4; L, R, T, BOT = 20 * MM, 20 * MM, 20 * MM, 18 * MM
TW = W - L - R

def build(article, out, mode):
    a = json.loads(Path(article).read_text())
    zh2en = mode == 'zh2en'
    name = '汉译英听写卡' if zh2en else '英译汉听写卡'
    hint = '看中文意思，在横线上写出文中的英文。' if zh2en else '看英文，在横线上写出它在本篇中的中文意思。'
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
    paras = []
    for v in a['vocab']:
        if not paras or paras[-1][0] != v['para']: paras.append((v['para'], []))
        paras[-1][1].append(v)
    k = 0
    for gi, (pi, items) in enumerate(paras):
        if gi: st['y'] -= 6
        if st['y'] - (16 + ROW) < BOT: new_page()
        y = st['y']
        c.setFont('ZHS', 8.8); c.setFillColor(C(MUTED)); c.drawString(L, y - 9, ZH_NUM(pi - 1))
        c.setStrokeColor(C(RULE)); c.setLineWidth(0.4); c.line(L + 34, y - 6, W - R, y - 6)
        st['y'] -= 16
        for v in items:
            k += 1
            if st['y'] - ROW < BOT: new_page()
            y = st['y']; base = y - ROW + 2.6 * MM
            c.setFont('EN', 9.4); c.setFillColor(C(ACCENT)); c.drawRightString(L + numw - 3 * MM, base, str(k))
            if zh2en:
                p = CJKPara([(v['zh_video'], 'ZH', INK)], 11, 13.5); p.wrap(promptw, 100)
                p.draw(c, L + numw, base + 13.5 * (len(p.lines) - 1) + 10.6)
            else:
                c.setFont('EN', 11.6); c.setFillColor(C(INK)); c.drawString(L + numw, base, v['en'])
            c.setStrokeColor(C('#9AA59E')); c.setLineWidth(0.6); c.line(line_x, base - 1.5, W - R, base - 1.5)
            st['y'] -= ROW
    # answer key on its own page(s), so the sheet can be used without seeing it
    new_page()
    y = st['y']; c.setFont('ZH', 16); c.setFillColor(C(INK)); c.drawString(L, y - 16, '答案'); y -= 34
    cols, gut = 3, 6 * MM; colw = (TW - gut * (cols - 1)) / cols; rowh = 15
    ans = [(i + 1, v['en'] if zh2en else v['zh_video']) for i, v in enumerate(a['vocab'])]
    per_col = max(1, int((y - BOT) // rowh)); i = 0
    while i < len(ans):
        for ci in range(cols):
            yy = y
            for n, t in ans[i:i + per_col]:
                x = L + ci * (colw + gut)
                c.setFont('EN', 8.8); c.setFillColor(C(ACCENT)); c.drawRightString(x + 7 * MM, yy - 10, str(n))
                if zh2en: c.setFont('EN', 10.2); c.setFillColor(C(INK)); c.drawString(x + 9 * MM, yy - 10, t)
                else:
                    p = CJKPara([(t, 'ZH', INK)], 10, 12); p.wrap(colw - 9 * MM, 100); p.draw(c, x + 9 * MM, yy - 1)
                yy -= rowh
            i += per_col
            if i >= len(ans): break
        if i < len(ans): new_page(); y = st['y']; per_col = max(1, int((y - BOT) // rowh))
    foot(); c.showPage(); c.save()
    return st['page']

if __name__ == '__main__':
    print(build(sys.argv[1], sys.argv[2], sys.argv[3]), 'pages')
