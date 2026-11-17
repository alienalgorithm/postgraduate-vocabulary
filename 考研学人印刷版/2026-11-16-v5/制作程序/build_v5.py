#!/usr/bin/env python3
"""《考研学人》v5 — whole-book single-document build.

Changes vs v4 (see report): video order; text/summary/vocabulary from each video's final source;
same illustration as the video; no bold weights anywhere (key words by colour); no "（续）" headings
(running heads instead); mirrored book margins; book serif faces; justified CJK with the approved
line-break rules; continuous flow (no half-empty pages); dictionary-form vocabulary; chapter-level
outline; per-image JPEG at visually-lossless settings; real metadata dates.
"""
import argparse, importlib.util, io, json, math, re, sys
from datetime import datetime, timezone
from html import escape
from pathlib import Path
from reportlab import rl_config
rl_config.useA85 = 0                     # no ASCII85 bloat
from reportlab.pdfgen import canvas
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.lib import colors
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.enums import TA_JUSTIFY, TA_LEFT
from reportlab.platypus import Paragraph

HERE = Path(__file__).resolve().parent; S = HERE.parent      # v5 version folder
V4 = S.parent / '2026-11-13-v4'
FONTS = S / 'fonts'
spec = importlib.util.spec_from_file_location('cjk', V4 / '制作程序/批准版式/cjk_layout.py')
CJK = importlib.util.module_from_spec(spec); spec.loader.exec_module(CJK)

MM = 72 / 25.4
W, H = 176 * MM, 250 * MM
INNER, OUTER, TOP, BOTTOM = 21 * MM, 16 * MM, 23 * MM, 22 * MM
TW = W - INNER - OUTER
INK = '#1F2B27'; ACCENT = '#2A6B57'; MUTED = '#86918A'; RULE = '#C9D3CC'
import os
THEME = os.environ.get('KAOYAN_THEME', 'plain')   # 'parchment' = 羊皮纸古书版 (user 2026-11-16); same text, same layout
if THEME == 'parchment':
    INK = '#2E2216'; ACCENT = '#7E3B1E'; MUTED = '#7C6650'; RULE = '#B39A73'

def diamond(c, cx, cy, r, color=None):
    c.setFillColor(colors.HexColor(color or ACCENT))
    p = c.beginPath(); p.moveTo(cx, cy + r); p.lineTo(cx + r * 0.62, cy); p.lineTo(cx, cy - r); p.lineTo(cx - r * 0.62, cy); p.close()
    c.drawPath(p, stroke=0, fill=1)

def parchment_page(c, page):
    """Aged-paper background (procedural, 制作程序/parchment.py; spine shade on the binding side) + double rule frame."""
    c.drawImage(str(S / '插图JPEG' / ('parchment-recto.jpg' if page % 2 else 'parchment-verso.jpg')), 0, 0, width=W, height=H)
    c.setStrokeColor(colors.HexColor(RULE)); c.setLineWidth(0.9); c.rect(9 * MM, 9 * MM, W - 18 * MM, H - 18 * MM, stroke=1, fill=0)
    c.setLineWidth(0.35); c.rect(10.4 * MM, 10.4 * MM, W - 20.8 * MM, H - 20.8 * MM, stroke=1, fill=0)
    for (x, y) in [(9, 9), (W / MM - 9, 9), (9, H / MM - 9), (W / MM - 9, H / MM - 9)]:
        diamond(c, x * MM, y * MM, 2.3, RULE)
for name, f in [('EN', 'SourceSerif4Text-Regular.ttf'), ('ENI', 'SourceSerif4Text-Italic.ttf'),
                ('END', 'SourceSerif4Display-Regular.ttf'), ('ENDI', 'SourceSerif4Display-Italic.ttf'),
                ('ZH', 'NotoSerifSC-Regular.ttf')]:
    pdfmetrics.registerFont(TTFont(name, str(FONTS / f)))
pdfmetrics.registerFont(TTFont('ZHS', str(FONTS / 'NotoSansSC-Regular.ttf')))

# ------------------------------------------------------------------ CJK justified paragraph
class CJKPara:
    """Line breaking = approved cjk_layout rules (NO_START/NO_END, atoms); every line but the
    paragraph's last is justified by spreading space at CJK boundaries."""
    def __init__(self, runs, size, leading, lines=None, last_is_end=True, first_indent=0):
        self.runs, self.size, self.leading = runs, size, leading
        self.lines, self.last_is_end, self.first_indent = lines, last_is_end, first_indent
    def _chars(self):
        out = []
        for text, font, color in self.runs:
            for ch in text:
                if out:   # standard Chinese typesetting: a small space between Latin words and Han characters
                    p = out[-1][0]
                    if (re.match(r'[A-Za-z]', p) and re.match(r'[一-鿿]', ch)) or (re.match(r'[一-鿿]', p) and re.match(r'[A-Za-z]', ch)):
                        out.append((' ', (font, self.size, color)))
                out.append((ch, (font, self.size, color)))
        return out
    def _break(self, width):
        out, line, used = [], [], 0.0
        limit = width - 0.6
        for token in CJK.tokens(self._chars()):
            if token is None: continue
            if not line and CJK.whitespace(token): continue
            tw = CJK.token_width(token); lim = limit - (self.first_indent if not out else 0)
            if line and used + tw > lim:
                carry = []
                while line and CJK.whitespace(line[-1]): line.pop()
                while line and (CJK.last(line[-1]) in CJK.NO_END or CJK.first(carry[0] if carry else token) in CJK.NO_START):
                    carry.insert(0, line.pop())
                while line and CJK.whitespace(line[-1]): line.pop()
                if not line: raise ValueError('protected token wider than line')
                out.append(line); line = carry; used = sum(CJK.token_width(t) for t in carry)
                if CJK.whitespace(token): continue
            line.append(token); used += tw
        while line and CJK.whitespace(line[-1]): line.pop()
        if line: out.append(line)
        return out
    def wrap(self, width, avail):
        self.width = width
        if self.lines is None:
            self.lines = self._break(width)
            # no lone Han character on a paragraph's last line (孤字): pull one token down from the line above
            vis = lambda ln: sum(1 for t in ln for ch, _ in t if re.match(r'[一-鿿A-Za-z0-9]', ch))
            while len(self.lines) >= 2 and vis(self.lines[-1]) < 2 and len(self.lines[-2]) > 3:
                prev = self.lines[-2]
                if CJK.first(prev[-1]) in CJK.NO_START or CJK.whitespace(prev[-1]): break
                self.lines[-1].insert(0, prev.pop())
                while prev and CJK.whitespace(prev[-1]): prev.pop()
                if prev and CJK.last(prev[-1]) in CJK.NO_END: break
        return width, len(self.lines) * self.leading
    def split(self, width, avail):
        self.wrap(width, avail); n = int(avail // self.leading)
        if n >= len(self.lines): return [self]
        if len(self.lines) < 4 or n < 2: return []
        n = min(n, len(self.lines) - 2)            # no widows / orphans
        a = CJKPara(self.runs, self.size, self.leading, self.lines[:n], False, self.first_indent)
        b = CJKPara(self.runs, self.size, self.leading, self.lines[n:], self.last_is_end, 0)
        b.continued = True
        return [a, b]
    def draw(self, c, x, top):
        y = top - self.size * 0.98
        for i, line in enumerate(self.lines):
            indent = self.first_indent if (i == 0 and not getattr(self, 'continued', False)) else 0
            natural = sum(CJK.token_width(t) for t in line)
            gaps = [j for j in range(1, len(line)) if not CJK.whitespace(line[j]) and (
                    re.match(r'[　-鿿＀-￯]', CJK.first(line[j])) or re.match(r'[　-鿿＀-￯]', CJK.last(line[j-1])))]
            last = (i == len(self.lines) - 1) and self.last_is_end
            extra = 0 if last or not gaps or getattr(self, 'ragged', False) else (self.width - indent - natural) / len(gaps)
            if extra > self.size * 0.6: extra = 0          # never stretch a short line grotesquely
            xx = x + indent
            for j, tok in enumerate(line):
                if j in gaps: xx += extra
                for ch, (font, size, color) in tok:
                    c.setFont(font, size); c.setFillColor(colors.HexColor(color)); c.drawString(xx, y, ch)
                    xx += pdfmetrics.stringWidth(ch, font, size)
            y -= self.leading

def zh_runs(markup, size_font='ZH', key=ACCENT, ink=INK, aside=MUTED):
    """**词**(english) -> key colour; full-width （…） insertions -> muted; no bold anywhere."""
    t = re.sub(r'\*\*([^*]+)\*\*\([^)]*\)', r'**\1**', markup)
    runs = []
    for part in re.split(r'(\*\*[^*]+\*\*)', t):
        if not part: continue
        if part.startswith('**'): runs.append((part[2:-2], size_font, key)); continue
        for sub in re.split(r'(（[^（）]*）)', part):
            if sub: runs.append((sub, size_font, aside if sub.startswith('（') and len(sub) <= 16 else ink))
    return runs

# ------------------------------------------------------------------ English paragraph (ReportLab, splittable)
EN_STYLE = ParagraphStyle('en', fontName='EN', fontSize=10.7, leading=16.2, textColor=colors.HexColor(INK),
                          alignment=TA_JUSTIFY, allowWidows=0, allowOrphans=0, firstLineIndent=0)
def en_para(markup, style=EN_STYLE):
    parts = re.split(r'(\*\*[^*]+\*\*)', markup)
    html = ''.join(f'<font color="{ACCENT}">{escape(p[2:-2])}</font>' if p.startswith('**') else escape(p) for p in parts)
    return Paragraph(html, style)

class ENWrap:   # adapter so ReportLab paragraphs and CJKPara share one flow loop
    def __init__(self, p): self.p = p
    def wrap(self, w, a): return self.p.wrap(w, a)
    def split(self, w, a): return [ENWrap(x) for x in self.p.split(w, a)]
    def draw(self, c, x, top): _, h = self.p.wrap(self.w, 10**6); self.p.drawOn(c, x, top - h)

# ------------------------------------------------------------------ document / pagination
class Book:
    def __init__(self, path, toc_pages=None):
        self.c = canvas.Canvas(str(path), pagesize=(W, H), pageCompression=1, invariant=0, initialFontName='EN', initialFontSize=10)
        self.page = 0; self.y = 0; self.head = None; self.opener = True; self.toc_pages = toc_pages or {}
        self.chapter_pages = {}; self.outline_keys = 0
    def x0(self): return INNER if self.page % 2 == 1 else OUTER
    def new_page(self, head=None, opener=False):
        if self.page: self.end_page()
        self.page += 1; self.head = head; self.opener = opener; self.y = H - TOP
        if THEME == 'parchment': parchment_page(self.c, self.page)
    def end_page(self):
        c = self.c
        old = THEME == 'parchment'
        hy, fy = (H - 16 * MM, 14.6 * MM) if old else (H - 13 * MM, 12 * MM)
        if self.head and not self.opener:
            c.setFont('ZHS', 7.6); c.setFillColor(colors.HexColor(MUTED))
            if old: c.drawCentredString(W / 2, hy, '考研学人' if self.page % 2 == 0 else self.head)
            elif self.page % 2 == 0: c.drawString(OUTER, hy, '考研学人')
            else: c.drawRightString(W - OUTER, hy, self.head)
        if self.head:
            c.setFont('EN', 8.6); c.setFillColor(colors.HexColor(MUTED))
            if old:                                   # centred folio between two small diamonds
                c.drawCentredString(W / 2, fy, str(self.page)); w2 = pdfmetrics.stringWidth(str(self.page), 'EN', 8.6) / 2
                diamond(c, W / 2 - w2 - 7, fy + 3, 1.9, RULE); diamond(c, W / 2 + w2 + 7, fy + 3, 1.9, RULE)
            elif self.page % 2 == 0: c.drawString(OUTER, fy, str(self.page))
            else: c.drawRightString(W - OUTER, fy, str(self.page))
        c.showPage()
    def mark(self, title, level):
        key = f'k{self.outline_keys}'; self.outline_keys += 1
        self.c.bookmarkPage(key); self.c.addOutlineEntry(title, key, level, closed=(level == 0))
    def avail(self): return self.y - BOTTOM
    def flow(self, f, gap_after=0.0, indent=0.0):
        w = TW - indent
        while True:
            _, h = f.wrap(w, self.avail()); f.w = w
            if h <= self.avail() + 0.01:
                f.draw(self.c, self.x0() + indent, self.y); self.y -= h + gap_after; return
            parts = f.split(w, self.avail())
            if len(parts) == 2:
                parts[0].wrap(w, self.avail()); parts[0].w = w
                parts[0].draw(self.c, self.x0() + indent, self.y)
                self.new_page(self.head); f = parts[1]
            else:
                if self.y >= H - TOP - 0.5:      # already on a fresh page and still no fit: fail loudly, never loop
                    raise ValueError(f'element taller than a page on p{self.page}: {h:.0f}pt')
                self.new_page(self.head)
    def need(self, h):
        if self.avail() < h: self.new_page(self.head)
    def label(self, text):
        """Section label (no '（续）' ever): small accent rule + Chinese label, kept with 4 lines."""
        self.need(13 + 18 + 4 * 16.2)
        c = self.c; x = self.x0()
        c.setStrokeColor(colors.HexColor(ACCENT)); c.setLineWidth(0.8); c.line(x, self.y - 1, x + 14, self.y - 1)
        c.setFont('ZHS', 9.6); c.setFillColor(colors.HexColor(ACCENT)); c.drawString(x + 20, self.y - 4.2, text)
        self.y -= 22

# ------------------------------------------------------------------ chapter parts
def opener(b, d, img):
    head = f'{d["id"]}  {d["title_zh"]}'
    b.new_page(head, opener=True); b.chapter_pages[d['id']] = b.page; c = b.c; x = b.x0()
    b.mark(f'{d["id"]}  {d["title_zh"]}', 0)
    t0 = CJKPara([(d['title_zh'], 'ZH', INK)], 21, 29); t0.wrap(TW, 400)
    pe = Paragraph(escape(d['title_en']), ParagraphStyle('m', fontName='ENDI', fontSize=13.5, leading=17.5)); _, peh = pe.wrap(TW, 200)
    block = 52 + len(t0.lines) * 29 + 2 + peh + 16 + TW * 1024 / 1536 + 22 + 50
    spare = max(0.0, (H - TOP - BOTTOM) - block)
    y = H - 21 * MM - spare * 0.38                       # optical centre, slightly above middle
    c.setFont('END', 30); c.setFillColor(colors.HexColor(ACCENT)); c.drawString(x, y - 26, d['id'])
    c.setStrokeColor(colors.HexColor(RULE)); c.setLineWidth(0.6); c.line(x + 44, y - 16, x + TW - (8 if THEME == 'parchment' else 0), y - 16)
    if THEME == 'parchment': diamond(c, x + TW - 3, y - 16, 2.8)
    y -= 52
    t = CJKPara([(d['title_zh'], 'ZH', INK)], 21, 29); t.size = 21; t.runs = [(d['title_zh'], 'ZH', INK)]
    t.wrap(TW, 400); t.last_is_end = True; t.draw(c, x, y); y -= len(t.lines) * 29 + 2
    st = ParagraphStyle('ent', fontName='ENDI', fontSize=13.5, leading=17.5, textColor=colors.HexColor(MUTED))
    p = Paragraph(escape(d['title_en']), st); _, h = p.wrap(TW, 200); p.drawOn(c, x, y - h); y -= h + 16
    ih = TW * 1024 / 1536
    c.drawImage(str(img), x, y - ih, width=TW, height=ih)
    if THEME == 'parchment':                         # framed like a tipped-in plate
        c.setStrokeColor(colors.HexColor(RULE)); c.setLineWidth(0.6); c.rect(x - 3, y - ih - 3, TW + 6, ih + 6, stroke=1, fill=0)
        c.setLineWidth(0.3); c.rect(x - 5.5, y - ih - 5.5, TW + 11, ih + 11, stroke=1, fill=0)
    y -= ih + 22
    c.setFillColor(colors.HexColor(ACCENT)); c.rect(x, y - 30, 2.2, 30, stroke=0, fill=1)
    q = CJKPara([(d['cover_question'], 'ZH', INK)], 12, 19); q.wrap(TW - 14, 200); q.draw(c, x + 12, y - 1)
    # user 2026-11-16: no word counts / key-word counts on the opener

ZH_NUM = '一二三四五六七八九十'
def para_name(i):
    return '第' + (ZH_NUM[i] if i < 10 else '十' + (ZH_NUM[i - 10] if i > 10 else '')) + '段' if i < 20 else f'第{i+1}段'

def vocab_by_paragraph(d):
    """User 2026-11-16: per paragraph, article order, English + the video's Chinese only,
    first occurrence per article only. Pairs come verbatim from the video script markup **中文**(english)."""
    seen, groups = set(), []
    article = ' '.join(d['english_paragraphs'])
    for pi, (en_m, zh_m) in enumerate(zip(d['english_markup_paragraphs'], d['chinese_markup_paragraphs'])):
        pairs = {}
        for zh, en in re.findall(r'\*\*([^*]+)\*\*\(([^)]*)\)', zh_m):
            pairs.setdefault(en.strip(), []).append(zh)
        en_plain = re.sub(r'\*\*', '', en_m)
        bolds = [m.start() for m in re.finditer(r'\*\*([^*]+)\*\*', en_m)]
        def pos(term):
            first = term.split()[0].lower()
            for m in re.finditer(r'\*\*([^*]+)\*\*', en_m):
                seg = m.group(1).lower()
                if seg == term.lower() or term.lower().startswith(seg) or seg.split()[0] == first: return m.start()
            k = en_plain.lower().find(term.lower()); return 10**6 + (k if k >= 0 else 0)
        items = []
        for en, zhs in pairs.items():
            key = en.lower()
            if key in seen: continue
            seen.add(key)
            shown = en
            if ' ' not in en and en[:1].isupper() and en[1:].islower():           # sentence-initial capital of a common word
                if not re.search(r'(?<![.!?] )(?<!^)\b' + re.escape(en) + r'\b', article[1:]): shown = en[0].lower() + en[1:]
            items.append((pos(en), shown, '……'.join(dict.fromkeys(zhs))))
        items.sort(key=lambda x: x[0])
        if items: groups.append((pi, [(a, b) for _, a, b in items]))
    return groups

def book_vocab(d):
    """User 2026-11-16 (second request): the list under each article shows the dictionary form, the part of speech
    (n. vt. vi. adj. adv. ... phr.) and the dictionary sense that fits this article's context. Those come from
    d['vocab_book'] (reworked entry by entry, reviewed, checked by vocab2/check_vocab2.py); entries whose lemma and
    part of speech repeat an earlier one in the same article are dropped. Without vocab_book: the old video pairs."""
    if 'vocab_book' not in d:
        return [(pi, [(en, None, zh) for en, zh in items]) for pi, items in vocab_by_paragraph(d)]
    old = [(pi, en) for pi, items in vocab_by_paragraph(d) for en, _ in items]
    vb = d['vocab_book']
    assert [(v['para'] - 1, v['term']) for v in vb] == old, (d['id'], 'vocab_book does not match the video word list')
    groups = {}
    for v in vb:
        if not v.get('drop'): groups.setdefault(v['para'] - 1, []).append((v['lemma'], v['pos'], v['zh']))
    return sorted(groups.items())

class VocabSense:
    """Part of speech + Chinese sense under a word-list entry. One line when it fits; otherwise break after
    the full-width semicolon between the two senses, and set the lines flush left (no letter-spaced justification)."""
    def __init__(self, pos, zh):
        head = [(pos + ' ', 'ENI', MUTED)] if pos else []
        one = CJKPara(head + [(zh, 'ZH', INK)], 9.4, 13.6)
        self.paras = [one]
        if '；' in zh:
            a, b = zh.split('；', 1)
            self.alt = [CJKPara(head + [(a + '；', 'ZH', INK)], 9.4, 13.6), CJKPara([(b, 'ZH', INK)], 9.4, 13.6)]
        else:   # one long sense: break at a natural point (before 并/给, after a closing bracket, before ……)
            self.alt = None
            for test in (lambda i: zh[i] in '并给', lambda i: zh[i - 1] == '）', lambda i: zh[i:i + 2] == '……'):
                cuts = [i for i in range(len(zh) - 1, 1, -1) if test(i)]
                if cuts: self.alts = getattr(self, 'alts', []) + [[CJKPara(head + [(zh[:i], 'ZH', INK)], 9.4, 13.6), CJKPara([(zh[i:], 'ZH', INK)], 9.4, 13.6)] for i in cuts]
    def wrap(self, width, avail):
        if self.alt is None and self.paras[0].wrap(width, avail)[1] > 13.6:
            for alt in getattr(self, 'alts', []):
                if all(p.wrap(width, avail)[1] <= 13.6 for p in alt): self.alt = alt; break
        if self.paras[0].wrap(width, avail)[1] > 13.6 and self.alt and all(p.wrap(width, avail)[1] <= 13.6 for p in self.alt):
            self.paras = self.alt
        for p in self.paras: p.wrap(width, avail); p.ragged = True
        return width, sum(len(p.lines) for p in self.paras) * 13.6
    def draw(self, c, x, top):
        for p in self.paras:
            p.draw(c, x, top); top -= len(p.lines) * 13.6

def vocabulary(b, d):
    groups = book_vocab(d)
    cols, gutter = 3, 12
    colw = (TW - gutter * (cols - 1)) / cols
    est = ParagraphStyle('ve', fontName='EN', fontSize=10.2, leading=13, textColor=colors.HexColor(ACCENT))
    b.label('词汇与表达')
    for gi, (pi, items) in enumerate(groups):
        cells = []
        for en, pos, zh in items:
            ep = Paragraph(escape(en), est); eh = ep.wrap(colw, 1000)[1]
            zp = VocabSense(pos, zh); zh_h = zp.wrap(colw, 1000)[1]
            cells.append((ep, eh, zp, zh_h))
        rows = [cells[i:i + cols] for i in range(0, len(cells), cols)]
        heights = [max(e + z for _, e, _, z in r) + 7 for r in rows]
        b.need(18 + heights[0])                          # paragraph heading kept with its first row
        if gi: b.y -= 4
        b.c.setFont('ZHS', 8.8); b.c.setFillColor(colors.HexColor(MUTED)); b.c.drawString(b.x0(), b.y - 9, para_name(pi))
        b.c.setStrokeColor(colors.HexColor(RULE)); b.c.setLineWidth(0.4)
        b.c.line(b.x0() + 34, b.y - 6, b.x0() + TW, b.y - 6); b.y -= 18
        for r, rh in zip(rows, heights):
            b.need(rh)
            for ci, (ep, eh, zp, zh_h) in enumerate(r):
                x = b.x0() + ci * (colw + gutter)
                ep.drawOn(b.c, x, b.y - eh); zp.draw(b.c, x, b.y - eh)
            b.y -= rh
    return sum(len(i) for _, i in groups)

def summary(b, d):
    b.y -= 10; b.label('文章简述')
    for name, text in d['approved_summary']:
        text = text.replace('▹', '')
        p = CJKPara([(name + '：', 'ZH', ACCENT), (text, 'ZH', INK)], 10.4, 18.2)
        _, h = p.wrap(TW - 12, 10**6)
        b.need(min(h, 3 * 18.2))
        b.c.setFillColor(colors.HexColor(ACCENT)); b.c.circle(b.x0() + 2.4, b.y - 6.6, 1.7, stroke=0, fill=1)
        b.flow(p, 6, indent=12)

def chapter(b, d, img):
    opener(b, d, img)
    b.new_page(f'{d["id"]}  {d["title_zh"]}')
    b.mark('英文原文', 1); b.label('英文原文')
    for m in d['english_markup_paragraphs']: b.flow(ENWrap(en_para(m)), 7.5)
    b.y -= 12; b.need(22 + 4 * 18.6)
    b.mark('中文译文', 1); b.label('中文译文')
    for m in d['chinese_markup_paragraphs']: b.flow(CJKPara(zh_runs(m), 10.5, 18.6, first_indent=21), 7)
    b.y -= 12
    b.mark('词汇与表达', 1); vocabulary(b, d)
    b.mark('文章简述', 1); summary(b, d)
    if THEME == 'parchment' and b.avail() > 34:      # end-of-story fleuron
        cx = b.x0() + TW / 2; cy = b.y - 20
        diamond(b.c, cx, cy, 3.4); diamond(b.c, cx - 11, cy, 2.1); diamond(b.c, cx + 11, cy, 2.1)
        b.y -= 34

# ------------------------------------------------------------------ front / back matter
def front(b, meta, chapters, cover_img, n_vocab):
    c = b.c
    b.new_page(None, opener=True); c.drawImage(str(cover_img), 0, 0, width=W, height=H); b.mark('封面', 0)
    # user 2026-11-16: no title page (扉页) — preface follows the cover
    b.new_page('前言'); b.mark('前言', 0)
    pf = meta['preface_v5']                          # user 2026-11-16: more engaging preface, "4300"
    assert 4100 <= n_vocab <= 4500, n_vocab          # keeps the wording “4300个左右” true (user: “就说4300 上下左右”)
    page0, x = b.page, b.x0()
    c.setFont('ZH', 24); c.setFillColor(colors.HexColor(INK)); c.drawString(x, b.y - 24, '前言')
    c.setFont('ENDI', 12.5); c.setFillColor(colors.HexColor(ACCENT)); c.drawString(x + 58, b.y - 23, 'Preface')
    b.y -= 36
    c.setStrokeColor(colors.HexColor(ACCENT)); c.setLineWidth(0.8); c.line(x, b.y, x + 14, b.y)
    b.y -= 20
    top = b.y
    for year, text in pf['hooks']:                   # four story openers: year in accent, thin rule at left
        b.flow(CJKPara([(year, 'ZH', ACCENT), (text, 'ZH', INK)], 11, 19.4), 6, indent=13)
    c.setStrokeColor(colors.HexColor(RULE)); c.setLineWidth(1.1); c.line(x + 1.5, top - 3, x + 1.5, b.y + 12)
    b.y -= 10
    for ptxt in pf['paragraphs']:
        b.flow(CJKPara([(ptxt, 'ZH', INK)], 10.6, 19, first_indent=21.2), 6)
    b.y -= 10
    c.setFont('ZHS', 10); c.setFillColor(colors.HexColor(MUTED)); c.drawRightString(x + TW, b.y - 10, pf['signoff'])
    assert b.page == page0 and b.y - 10 > BOTTOM, ('preface must stay on one page', b.page - page0, b.y, BOTTOM)
    for k in range(2):
        rows = chapters[:35] if k == 0 else chapters[35:]
        if not rows: continue
        b.new_page('目录')
        if k == 0: b.mark('目录', 0); c.setFont('ZH', 22); c.setFillColor(colors.HexColor(INK)); c.drawString(b.x0(), b.y - 22, '目录'); b.y -= 48
        step = min((b.y - BOTTOM) / len(rows), 17.0)
        for d in rows:
            x = b.x0(); y = b.y - 9
            c.setFont('END', 9.6); c.setFillColor(colors.HexColor(ACCENT)); c.drawString(x, y, d['id'])
            c.setFont('ZH', 9.6); c.setFillColor(colors.HexColor(INK)); c.drawString(x + 20, y, d['title_zh'])
            tw = pdfmetrics.stringWidth(d['title_zh'], 'ZH', 9.6)
            c.setFont('ENI', 8.2); c.setFillColor(colors.HexColor(MUTED))
            en = d['title_en']; room = TW - 20 - tw - 40
            while pdfmetrics.stringWidth(en, 'ENI', 8.2) > room and len(en) > 4: en = en[:-2].rstrip() + '…' if not en.endswith('…') else en[:-2] + '…'
            c.drawString(x + 20 + tw + 8, y, en)
            c.setFont('EN', 9.6); c.setFillColor(colors.HexColor(INK)); c.drawRightString(x + TW, y, str(b.toc_pages.get(d['id'], '')))
            b.y -= step

def back(b, img):
    b.new_page(None, opener=True); b.c.drawImage(str(img), 0, 0, width=W, height=H); b.mark('封底', 0)

# ------------------------------------------------------------------ main
def build(out, data_dir, img_dir, meta, cover, backc, only=None, toc_pages=None):
    files = sorted(Path(data_dir).glob('*.json'))
    chapters = [json.loads(f.read_text()) for f in files]
    if only: chapters = [d for d in chapters if d['id'] in only]
    every = [json.loads(f.read_text()) for f in files]            # count over the whole book, even in a prototype
    n_vocab = sum(len(i) for d in every for _, i in book_vocab(d))      # entries actually listed in the book
    b = Book(out, toc_pages)
    c = b.c
    c.setTitle('考研学人｜70篇趣味英语阅读' + ('（羊皮纸版）' if THEME == 'parchment' else '')); c.setAuthor('朋克英语'); c.setSubject('70篇故事 · 中英双语 · 重点词与短语 · 文章简述'); c.setCreator('朋克英语'); c.setKeywords('考研英语, 阅读, 词汇')
    front(b, meta, chapters, cover, n_vocab)
    for d in chapters:
        chapter(b, d, Path(img_dir) / f'{d["id"]}.jpg'); print('chapter', d['id'], 'page', b.page, flush=True)
    back(b, backc); b.end_page(); c.save()
    return b.chapter_pages, b.page

if __name__ == '__main__':
    ap = argparse.ArgumentParser(); ap.add_argument('--out', required=True); ap.add_argument('--only', nargs='*'); a = ap.parse_args()
    meta = json.loads((V4 / '书稿/前言与封底批准稿.json').read_text())
    meta['preface_v5'] = json.loads((S / '书稿/前言.json').read_text())
    D = S
    pages, n = build(Path(a.out).with_suffix('.pass1.pdf'), D / 'data', D / '插图JPEG', meta, D / '插图JPEG/cover.jpg', D / '插图JPEG/back.jpg', a.only)
    pages, n = build(a.out, D / 'data', D / '插图JPEG', meta, D / '插图JPEG/cover.jpg', D / '插图JPEG/back.jpg', a.only, toc_pages=pages)
    print(json.dumps({'pages': n, 'chapter_first_pages': pages}, ensure_ascii=False))
