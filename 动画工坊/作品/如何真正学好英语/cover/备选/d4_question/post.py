# python3 post.py : upload JPGs, feed previews, side_by_side.jpg and every program check -> checks.txt (exit 1 on any fail)
import json, os, re, sys
import numpy as np
from PIL import Image

D = os.path.dirname(os.path.abspath(__file__))
out, fails = [], []
def log(s): out.append(s); print(s)
def check(ok, what):
    log(('PASS ' if ok else 'FAIL ') + what)
    if not ok: fails.append(what)

def lin(c):
    c = np.asarray(c, float) / 255
    return np.where(c <= 0.04045, c / 12.92, ((c + 0.055) / 1.055) ** 2.4)
def lum(rgb): r, g, b = lin(rgb); return 0.2126 * r + 0.7152 * g + 0.0722 * b
def ratio(a, b):
    la, lb = lum(a), lum(b); hi, lo = max(la, lb), min(la, lb); return (hi + 0.05) / (lo + 0.05)
def css_rgb(s): return [int(float(v)) for v in re.findall(r'[\d.]+', s)[:3]]

FORBID = ['最', '第一', '保证', '100%', '—', '——', '–', '--', '美国', '外国', '老外', '母语', 'native']
EMOJI = re.compile('[\U0001F000-\U0001FAFF☀-➿️]')

spec = {'16x9': ((3840, 2160), (1920, 1080), (320, 180)), '4x3': ((2880, 2160), (1440, 1080), (240, 180))}
feeds = {}
all_strings = []
for v, (msz, usz, fsz) in spec.items():
    log(f'==== {v} ====')
    m = Image.open(f'{D}/master_{v}.png').convert('RGB')
    bg = Image.open(f'{D}/work/bg_{v}.png').convert('RGB')
    lay = json.load(open(f'{D}/layout_{v}.json'))
    check(lay['fontsLoaded'], f'{v} fonts loaded in the page (SC900, Serif900, SC500)')
    # 1. sizes
    check(m.size == msz, f'{v} master size {m.size[0]}x{m.size[1]} (want {msz[0]}x{msz[1]}), {os.path.getsize(f"{D}/master_{v}.png")/1e6:.2f} MB')
    up = m.resize(usz, Image.LANCZOS)
    upath = f'{D}/upload_{v}.jpg'
    for q in (95, 94, 93, 92):
        up.save(upath, quality=q, optimize=True, progressive=True, subsampling=0)
        if os.path.getsize(upath) < 2_000_000: break
    ub = os.path.getsize(upath)
    check(Image.open(upath).size == usz and ub < 2_000_000 and q >= 92, f'{v} upload {usz[0]}x{usz[1]} JPG q{q} 4:4:4, {ub} bytes ({ub/1e6:.2f} MB) < 2 MB')
    # 2. feed preview + headline height at feed size
    f = m.resize(fsz, Image.LANCZOS); f.save(f'{D}/feed_{v}.png'); feeds[v] = f
    k = fsz[0] / msz[0]
    texts = {t['id']: t for t in lay['texts']}
    h = texts['head']
    check(len(h['lines']) <= 2, f'{v} headline lines = {len(h["lines"])} (max 2)')
    check(len(lay['texts']) <= 3, f'{v} text elements = {len(lay["texts"])} (max 3), dominant = head {h["size"]:.0f}px vs {max(t["size"] for t in lay["texts"] if t["id"] != "head"):.0f}px')
    # ink height measured from pixels: rows where the text-only difference is strong, per headline line
    diff = np.abs(np.asarray(m, float) - np.asarray(bg, float)).max(2)
    inks = []
    for (x0, y0, x1, y1) in h['lines']:
        reg = diff[int(y0):int(y1), int(x0):int(x1)]
        rows = np.where((reg > 60).sum(1) > 6)[0]
        inks.append(int(rows.max() - rows.min() + 1) if len(rows) else 0)
    font_ink = h['inkHeight']
    cap_feed = min(font_ink, min(inks)) * k
    log(f'{v} headline font {h["size"]:.0f}px, glyph ink height (font metrics) {font_ink:.0f}px, measured per line {inks} px')
    check(cap_feed >= 14, f'{v} headline cap/ink height at feed size {fsz[0]}x{fsz[1]} = {cap_feed:.1f} px (min 14)')
    # 3. safe zone (bottom 18%) for every text box and the key subjects
    limit = 0.82 * msz[1]
    for t in lay['texts']:
        x0, y0, x1, y1 = t['box']
        check(y1 <= limit and x0 >= 0 and x1 <= msz[0] and y0 >= 0, f'{v} text "{t["text"]}" box [{x0:.0f},{y0:.0f},{x1:.0f},{y1:.0f}] bottom {y1:.0f} <= {limit:.0f} (82% line), inside frame')
    for name, (x0, y0, x1, y1) in lay['subjects'].items():
        check(y1 <= limit, f'{v} key subject {name} bottom {y1:.0f} <= {limit:.0f}')
    # 4. contrast: each fill colour vs the mean (and the bright 90th-percentile) background under its own box, from the no-text render
    bga = np.asarray(bg, float)
    for t in lay['texts']:
        need = 4.5 if t['id'] == 'head' else 3.0
        for r in t['runs']:
            if not r['text'].strip(' ·') and t['id'] != 'kicker': continue
            x0, y0, x1, y1 = [int(round(v_)) for v_ in r['box']]
            px = bga[max(0, y0):y1, max(0, x0):x1].reshape(-1, 3)
            mean = px.mean(0)
            L = np.array([lum(p) for p in px[:: max(1, len(px) // 4000)]])
            bright = px[:: max(1, len(px) // 4000)][np.argsort(L)[int(len(L) * 0.9)]]
            fill = css_rgb(r['color'])
            cr, cb = ratio(fill, mean), ratio(fill, bright)
            check(cr >= need, f'{v} contrast {t["id"]} "{r["text"].strip()}" fill rgb{tuple(fill)} vs mean bg rgb{tuple(int(c) for c in mean)} = {cr:.2f}:1 (min {need}); vs bright 90th pct bg = {cb:.2f}:1')
    # 5. strings on the cover
    for t in lay['texts']: all_strings.append(t['text'])

# 5. forbidden words over every placed string (and over the TEXT block in cover.html)
html = open(f'{D}/cover.html', encoding='utf-8').read()
tb = html[html.index('const TEXT = {'):html.index('};', html.index('const TEXT = {'))]
all_strings += re.findall(r"'([^']*)'", tb)
log('strings on the cover: ' + ' | '.join(sorted(set(all_strings))))
hits = [(w, s) for s in set(all_strings) for w in FORBID if w.lower() in s.lower()]
hits += [('emoji', s) for s in set(all_strings) if EMOJI.search(s)]
hits += [('hyphen', s) for s in set(all_strings) if '-' in s]
check(not hits, f'forbidden-word scan over {len(set(all_strings))} strings: {hits if hits else "no hits"}')

# the film image itself carries words (every window of the s02 city is an exam word): scan that list too
A = '/tmp/claude-0/-home-user-postgraduate-vocabulary/3d87cc6c-41dd-58c2-802f-d51dc0c78527/scratchpad/anim'
s02 = open(A + '/scenes/s02.js', encoding='utf-8').read()
win = re.findall(r"'([^']+)'", s02[s02.index('var WIN = ['):s02.index('];', s02.index('var WIN = ['))])
whits = [w for w in win if re.search(r'native|americ|foreign|nation|british|english|guarantee|alien|abroad|--|\u2014|\u2013', w, re.I)]
check(not whits, f'window words baked into the city image ({len(win)} words from s02 WIN list): forbidden or nationality hints = {whits if whits else "none"}')

# side by side: both feed previews at 2x on mid-grey
a, b = feeds['16x9'], feeds['4x3']
pad = 24
sb = Image.new('RGB', (pad * 3 + 2 * a.width + 2 * b.width, pad * 2 + 2 * a.height), (128, 128, 128))
sb.paste(a.resize((a.width * 2, a.height * 2), Image.LANCZOS), (pad, pad))
sb.paste(b.resize((b.width * 2, b.height * 2), Image.LANCZOS), (pad * 2 + 2 * a.width, pad))
sb.save(f'{D}/side_by_side.jpg', quality=93)
log(f'side_by_side.jpg {sb.size[0]}x{sb.size[1]}')
log(f'RESULT: {"ALL PASS" if not fails else str(len(fails)) + " FAIL"}')
open(f'{D}/checks.txt', 'w').write('\n'.join(out) + '\n')
sys.exit(1 if fails else 0)
