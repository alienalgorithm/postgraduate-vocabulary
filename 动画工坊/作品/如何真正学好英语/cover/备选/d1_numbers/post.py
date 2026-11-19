# python3 post.py : after `node render.js`, writes the 4 deliverables, feed previews, side_by_side.jpg and runs every check.
# Exit code 0 only if all checks pass.
import json, os, re, sys
import numpy as np
from PIL import Image

D = os.path.dirname(os.path.abspath(__file__))
P = lambda n: os.path.join(D, n)
FEED = {'16x9': (320, 180), '4x3': (240, 180)}
UPLOAD = {'16x9': (1920, 1080), '4x3': (1440, 1080)}
MASTER = {'16x9': (3840, 2160), '4x3': (2880, 2160)}
FORBIDDEN = ['最', '第一', '保证', '100%', '—', '——', '–', '--', '-', '‐', '‑', '‒', '―', '美国', '外国', '老外', '母语', 'native']
EMOJI = re.compile('[\U0001F000-\U0001FAFF☀-➿️‍]')

fails, rep = [], []
def check(ok, msg):
    rep.append(('PASS ' if ok else 'FAIL ') + msg)
    if not ok: fails.append(msg)

def lum(rgb):
    c = np.asarray(rgb, dtype=float) / 255.0
    c = np.where(c <= 0.04045, c / 12.92, ((c + 0.055) / 1.055) ** 2.4)
    return 0.2126 * c[..., 0] + 0.7152 * c[..., 1] + 0.0722 * c[..., 2]
def cr(l1, l2):
    a, b = max(l1, l2), min(l1, l2)
    return (a + 0.05) / (b + 0.05)
def hex2rgb(h):
    h = h.lstrip('#'); return [int(h[i:i + 2], 16) for i in (0, 2, 4)]

out = {}
for a in ('16x9', '4x3'):
    W, H = MASTER[a]
    m = Image.open(P(f'cover_{a}_master.png')).convert('RGB')
    assert m.size == (W, H), m.size
    master = P(f'cover_{a}.png'); m.save(master, optimize=True)
    up = m.resize(UPLOAD[a], Image.LANCZOS)
    upf = P(f'cover_{a}_upload.jpg'); up.save(upf, quality=95, subsampling=0, optimize=True, progressive=True)
    if os.path.getsize(upf) >= 2_000_000:
        up.save(upf, quality=92, subsampling=0, optimize=True, progressive=True)
    feed = m.resize(FEED[a], Image.LANCZOS); feed.save(P(f'feed_{a}.png'))
    out[a] = dict(master=master, upload=upf, feed=feed)

    # 1. sizes
    for f, sz in ((master, MASTER[a]), (upf, UPLOAD[a])):
        im = Image.open(f); b = os.path.getsize(f)
        ok = im.size == sz and (not f.endswith('.jpg') or (b < 2_000_000 and im.format == 'JPEG'))
        check(ok, f'size {os.path.basename(f)}: {im.size[0]}x{im.size[1]} {im.format}, {b} bytes ({b/1e6:.2f} MB)')

    L = json.load(open(P(f'layout_{a}.json')))
    els = L['elements']
    check(len(els) <= 3, f'{a} text elements: {len(els)} (max 3)')
    check(all('loaded' in f for f in L['fonts']), f'{a} fonts loaded: {L["fonts"]}')

    # 2. headline cap (ink) height at feed size
    k = FEED[a][1] / H
    head = [e for e in els if e['role'] == 'headline'][0]
    hmin = min(s['inkHeight'] for s in head['spans'])
    lines = round((head['box'][3] - head['box'][1]) / (head['spans'][0]['fontSize'] * 1.2))
    check(lines <= 2, f'{a} headline lines: {lines} (max 2)')
    check(hmin * k >= 14, f'{a} headline glyph height at feed {FEED[a][0]}x{FEED[a][1]}: {hmin*k:.1f} px (4K ink {hmin:.0f} px, font {head["spans"][0]["fontSize"]:.0f} px; need >= 14)')
    for e in els:
        if e['role'] != 'headline':
            d = [s for s in e['spans'] if s['name'] == 'dig'][0]; p = [s for s in e['spans'] if s['name'] == 'pre'][0]
            rep.append(f'INFO {a} {e["role"]} at feed: digits {d["inkHeight"]*k:.1f} px, prefix "{p["text"]}" {p["inkHeight"]*k:.1f} px')

    # 3. safe zone: nothing in the bottom 18 %, nothing outside the frame
    lim = 0.82 * H
    for e in els:
        bx = e['box']
        check(bx[3] <= lim, f'{a} safe zone {e["role"]}: box bottom {bx[3]:.0f} <= {lim:.0f} (box {[round(v) for v in bx]})')
        mg = min(bx[0], bx[1], W - bx[2], H - bx[3])
        check(mg >= 40, f'{a} inside frame {e["role"]}: min margin {mg:.0f} px')
    # key subject (towers) bottom = horizon
    bgim = Image.open(P(f'bg_{a}.png')).convert('RGB'); bg = np.asarray(bgim).astype(float)

    # 4. contrast: fill vs mean background under the box (text-free render); also vs the 90th-percentile-bright bg pixel
    for e in els:
        need = 4.5 if e['role'] == 'headline' else 3.0
        worst = 99
        for s in e['spans']:
            x0, _, x1, _ = s['box']; _, y0, _, y1 = s['ink']
            for nm, (yy0, yy1) in (('ink', (y0, y1)), ('box', (s['box'][1], s['box'][3]))):
                patch = bg[int(max(0, yy0)):int(min(H, yy1)), int(max(0, x0)):int(min(W, x1))].reshape(-1, 3)
                mean = patch.mean(0); lm = float(lum(mean)); l90 = float(np.percentile(lum(patch), 90))
                fills = [s['fill']] if s['fill'] else s['gradient']
                for f in fills:
                    lf = float(lum(hex2rgb(f)))
                    c, c90 = cr(lf, lm), cr(lf, l90)
                    worst = min(worst, c)
                    rep.append(f'INFO {a} contrast {e["role"]}.{s["name"]} "{s["text"]}" fill {f} vs mean bg ({nm}) rgb({mean[0]:.0f},{mean[1]:.0f},{mean[2]:.0f}): {c:.2f}  (vs 90th-pct bright bg: {c90:.2f})')
        check(worst >= need, f'{a} contrast {e["role"]}: min {worst:.2f} (need >= {need})')

    # 5. forbidden words over every string placed on the cover
    strings = [e['text'] for e in els] + [s['text'] for e in els for s in e['spans']]
    hits = [(w, t) for t in strings for w in FORBIDDEN if w.lower() in t.lower()] + [('emoji', t) for t in strings if EMOJI.search(t)]
    check(not hits, f'{a} forbidden-word scan over {len(strings)} strings {sorted(set(strings))}: hits {hits}')

# also scan the HTML source text nodes (anything that could ever render)
src = open(P('cover.html'), encoding='utf-8').read()
body = re.sub(r'<script.*?</script>|<style.*?</style>|<!--.*?-->', '', src, flags=re.S)
txt = re.sub(r'<[^>]+>', ' ', body)
hits = [w for w in FORBIDDEN if w.lower() in txt.lower()]
check(not hits, f'HTML visible text scan: {" ".join(txt.split())!r} hits {hits}')

# side by side: both feed previews at 2x on mid grey
f16 = out['16x9']['feed'].resize((640, 360), Image.LANCZOS)
f43 = out['4x3']['feed'].resize((480, 360), Image.LANCZOS)
sb = Image.new('RGB', (40 + 640 + 40 + 480 + 40, 40 + 360 + 40), (128, 128, 128))
sb.paste(f16, (40, 40)); sb.paste(f43, (40 + 640 + 40, 40))
sb.save(P('side_by_side.jpg'), quality=95)

print('\n'.join(rep))
print('\nALL CHECKS PASS' if not fails else f'\n{len(fails)} CHECK(S) FAILED')
sys.exit(1 if fails else 0)
