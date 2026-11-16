"""A4 handout pages in the book's style: flowing CJK/English paragraphs, labels, running head, folio."""
import re
from html import escape
from reportlab.pdfgen import canvas
from reportlab.platypus import Paragraph
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.enums import TA_LEFT, TA_JUSTIFY
from common import *

W, H = A4; L = R = 20 * MM; T = 20 * MM; BOT = 18 * MM; TW = W - L - R
IPA_CH = set('ɐɑɒɓɔɕɖɗɘəɚɛɜɝɞɟɠɡɢɣɤɥɦɧɨɩɪɫɬɭɮɯɰɱɲɳɴɵɶɷɸɹɺɻɼɽɾɿʀʁʂʃʄʅʆʇʈʉʊʋʌʍʎʏʐʑʒʓʔʕʖʗʘʙʚʛʜʝʞʟʠʡʢʣʤʥʦʧʨʩʪʫʬʭʮʯːˑˈˌæðθŋᵻ')
CJK_RE = r'[　-〿一-鿿＀-￯“”‘’]'

class MixPara(B.CJKPara):
    """CJKPara for explanation text with much English: justification spreads space at CJK boundaries AND between
    English words, capped so a line never looks gappy (otherwise the line is set ragged)."""
    def split(self, width, avail):
        parts = super().split(width, avail)
        out = []
        for q in parts:
            m = MixPara(q.runs, q.size, q.leading, q.lines, q.last_is_end, q.first_indent)
            if getattr(q, 'continued', False): m.continued = True
            out.append(m)
        return out
    def draw(self, c, x, top):
        CJK = B.CJK; y = top - self.size * 0.98
        for i, line in enumerate(self.lines):
            indent = self.first_indent if (i == 0 and not getattr(self, 'continued', False)) else 0
            natural = sum(CJK.token_width(t) for t in line)
            gaps = [j for j in range(1, len(line)) if CJK.whitespace(line[j - 1]) or (not CJK.whitespace(line[j]) and (
                    re.match(r'[　-鿿＀-￯]', CJK.first(line[j])) or re.match(r'[　-鿿＀-￯]', CJK.last(line[j - 1]))))]
            last = (i == len(self.lines) - 1) and self.last_is_end
            extra = 0 if last or not gaps or getattr(self, 'ragged', False) else (self.width - indent - natural) / len(gaps)
            if extra > self.size * 0.24: extra = 0
            xx = x + indent
            for j, tok in enumerate(line):
                if j in gaps: xx += extra
                for ch, (font, size, color) in tok:
                    c.setFont(font, size); c.setFillColor(C(color)); c.drawString(xx, y, ch)
                    xx += pdfmetrics.stringWidth(ch, font, size)
            y -= self.leading
CJKPara = MixPara

def clean(text):
    text = text.replace('\n', '')
    return re.sub(r'(?<=' + CJK_RE + r')[ \t]+|[ \t]+(?=' + CJK_RE + r')', '', text)

def mixed(text, color=INK, zh='ZH', en='EN'):
    """Runs for CJKPara: Latin in the English face, IPA in Noto Serif, the rest in the Chinese face."""
    text = clean(text); runs = []
    def kind(i, ch):
        if ch in IPA_CH: return 'IPA'
        if ch == '…':                                         # single … after Latin = English; …… = Chinese
            dbl = (i + 1 < len(text) and text[i + 1] == '…') or (i and text[i - 1] == '…')
            return zh if dbl else en
        if ch in '’‘' : return en if (i and re.match(r'[A-Za-z]', text[i - 1])) else zh
        return en if 0x20 <= ord(ch) < 0x7f else zh
    for i, ch in enumerate(text):
        k = kind(i, ch)
        if runs and runs[-1][1] == k: runs[-1][0] += ch
        else: runs.append([ch, k, color])
    return [tuple(r) for r in runs]

def en_markup(markup, size=12, leading=18, color=INK, font='EN', align=TA_LEFT):
    parts = re.split(r'(\*\*[^*]+\*\*)', markup)
    html = ''.join(f'<font color="{ACCENT}">{escape(p[2:-2])}</font>' if p.startswith('**') else escape(p) for p in parts)
    return B.ENWrap(Paragraph(html, ParagraphStyle('s', fontName=font, fontSize=size, leading=leading, textColor=C(color), alignment=align)))

class Doc:
    def __init__(self, path, head, title, subject):
        self.c = canvas.Canvas(str(path), pagesize=A4, pageCompression=1, invariant=0, initialFontName='EN')
        self.c.setTitle(title); self.c.setAuthor('朋克英语'); self.c.setCreator('朋克英语'); self.c.setSubject(subject)
        self.page = 0; self.head = head; self.y = 0; self.keys = 0
    def new_page(self):
        if self.page: self.end_page()
        self.page += 1; self.y = H - T
    def end_page(self):
        c = self.c
        if self.page > 1:
            c.setFont('ZHS', 7.6); c.setFillColor(C(MUTED)); c.drawString(L, H - 12 * MM, self.head)
            c.setStrokeColor(C(RULE)); c.setLineWidth(0.3); c.line(L, H - 13.6 * MM, W - R, H - 13.6 * MM)
        c.setFont('EN', 8.6); c.setFillColor(C(MUTED)); c.drawCentredString(W / 2, 10.5 * MM, str(self.page))
        c.showPage()
    def save(self): self.end_page(); self.c.save()
    def mark(self, title, level=0):
        k = f'k{self.keys}'; self.keys += 1; self.c.bookmarkPage(k); self.c.addOutlineEntry(title, k, level, closed=level == 0)
    def avail(self): return self.y - BOT
    def need(self, h):
        if self.avail() < h: self.new_page()
    def flow(self, f, gap=0.0, indent=0.0, width=None):
        w = (width or TW) - indent
        while True:
            _, h = f.wrap(w, self.avail()); f.w = w
            if h <= self.avail() + 0.01:
                f.draw(self.c, L + indent, self.y); self.y -= h + gap; return h
            parts = f.split(w, self.avail())
            if len(parts) == 2:
                parts[0].wrap(w, self.avail()); parts[0].w = w; parts[0].draw(self.c, L + indent, self.y)
                self.new_page(); f = parts[1]
            else:
                if self.y >= H - T - 0.5: raise ValueError(f'element taller than a page on p{self.page}')
                self.new_page()
    def label(self, text, indent=0.0, keep=40):
        self.need(16 + keep); c = self.c; x = L + indent
        c.setStrokeColor(C(ACCENT)); c.setLineWidth(0.8); c.line(x, self.y - 5.2, x + 10, self.y - 5.2)
        c.setFont('ZHS', 9); c.setFillColor(C(ACCENT)); c.drawString(x + 15, self.y - 8.4, text)
        self.y -= 17
    def tag(self, x, y, text):
        """small outlined tag such as 长难句 / 难点"""
        c = self.c; w = pdfmetrics.stringWidth(text, 'ZHS', 7.6) + 7
        c.setStrokeColor(C(ACCENT)); c.setLineWidth(0.5); c.roundRect(x, y - 3, w, 11.4, 2, stroke=1, fill=0)
        c.setFont('ZHS', 7.6); c.setFillColor(C(ACCENT)); c.drawString(x + 3.5, y, text)
        return w
    def title_block(self, no, title_zh, title_en, name):
        c = self.c; y = self.y
        c.setFont('ZHS', 9.6); c.setFillColor(C(ACCENT)); c.drawString(L, y - 9, f'{no}  {title_zh}')
        c.setFont('ENI', 9.6); c.setFillColor(C(MUTED)); c.drawRightString(W - R, y - 9, title_en)
        c.setFont('ZH', 22); c.setFillColor(C(INK)); c.drawString(L, y - 44, name)
        c.setStrokeColor(C(RULE)); c.setLineWidth(0.5); c.line(L, y - 56, W - R, y - 56)
        self.y -= 74
