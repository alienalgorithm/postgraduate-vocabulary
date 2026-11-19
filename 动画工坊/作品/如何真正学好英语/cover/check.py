# python3 check.py : upload JPGs, feed previews, side_by_side.jpg and the five program checks (exit 1 on any failure)
import os, re, json, sys
import numpy as np
from PIL import Image

D = os.path.dirname(os.path.abspath(__file__))
FEED = {'16x9': (320, 180), '4x3': (240, 180)}
UPLOAD = {'16x9': (1920, 1080), '4x3': (1440, 1080)}
MASTER = {'16x9': (3840, 2160), '4x3': (2880, 2160)}
fails = []
def ok(cond, msg):
    print(('PASS ' if cond else 'FAIL ') + msg)
    if not cond: fails.append(msg)

# ---------- outputs: upload JPGs (q>=92, <2 MB), feed previews, side by side ----------
for k in ('16x9', '4x3'):
    m = Image.open(os.path.join(D, 'master_%s.png' % k)).convert('RGB')
    up = m.resize(UPLOAD[k], Image.LANCZOS)
    f = os.path.join(D, 'upload_%s.jpg' % k)
    for q in (96, 95, 94, 93, 92):
        up.save(f, quality=q, subsampling=0, optimize=True)
        if os.path.getsize(f) < 2 * 1024 * 1024: break
    print('upload %s saved at quality %d' % (k, q)); json.dump({'quality': q}, open(os.path.join(D, 'work', 'jpgq_%s.json' % k), 'w'))
    m.resize(FEED[k], Image.LANCZOS).save(os.path.join(D, 'feed_%s.png' % k))
a = Image.open(os.path.join(D, 'feed_16x9.png')); b = Image.open(os.path.join(D, 'feed_4x3.png'))
pad = 48
sbs = Image.new('RGB', (pad * 3 + 640 + 480, pad * 2 + 360), (128, 128, 128))
sbs.paste(a.resize((640, 360), Image.NEAREST), (pad, pad)); sbs.paste(b.resize((480, 360), Image.NEAREST), (pad * 2 + 640, pad))
sbs.save(os.path.join(D, 'side_by_side.jpg'), quality=95)

# ---------- 1. sizes ----------
print('\n[1] pixel sizes and file sizes')
for name, want in [('master_16x9.png', (3840, 2160)), ('master_4x3.png', (2880, 2160)),
                   ('upload_16x9.jpg', (1920, 1080)), ('upload_4x3.jpg', (1440, 1080))]:
    p = os.path.join(D, name); im = Image.open(p); sz = os.path.getsize(p)
    extra = ''
    if name.endswith('.jpg'):
        qq = json.load(open(os.path.join(D, 'work', 'jpgq_%s.json' % name[7:-4])))['quality']; extra = ', JPEG quality %d, 4:4:4' % qq
        ok(qq >= 92, '%s JPEG quality %d >= 92' % (name, qq))
        ok(sz < 2 * 1024 * 1024, '%s file size %d bytes < 2 MB' % (name, sz))
    ok(im.size == want, '%s is %dx%d, %d bytes%s' % (name, im.size[0], im.size[1], sz, extra))

def lum(c):
    c = np.asarray(c, dtype=float) / 255.0
    c = np.where(c <= 0.04045, c / 12.92, ((c + 0.055) / 1.055) ** 2.4)
    return 0.2126 * c[..., 0] + 0.7152 * c[..., 1] + 0.0722 * c[..., 2]
def cr(c1, c2):
    l1, l2 = float(lum(c1)), float(lum(c2)); hi, lo = max(l1, l2), min(l1, l2)
    return (hi + 0.05) / (lo + 0.05)
def rgbs(s):
    return [tuple(int(float(v)) for v in m.split(',')[:3]) for m in re.findall(r'rgba?\(([^)]*)\)', s or '')]

FORBID = ['最', '第一', '保证', '100%', '—', '――', '–', '‒', '―', '－', '--', '-', '美国', '外国', '老外', '母语', 'native']
EMOJI = re.compile('[\U0001F000-\U0001FAFF☀-➿️‍]')
all_strings = []
for k in ('16x9', '4x3'):
    W, H = MASTER[k]; fw, fh = FEED[k]; sc = fw / W
    L = json.load(open(os.path.join(D, 'work', 'layout_%s.json' % k)))
    full = np.asarray(Image.open(os.path.join(D, 'master_%s.png' % k)).convert('RGB')).astype(float)
    bare = np.asarray(Image.open(os.path.join(D, 'work', 'notext_%s.png' % k)).convert('RGB')).astype(float)
    texts = L['texts']
    print('\n==== %s (%dx%d) ====' % (k, W, H))
    # ---------- 2. feed-size headline cap height ----------
    head = [t for t in texts if t['role'] == 'headline'][0]
    lines = round((head['box'][3] - head['box'][1]) / (head['size'] * 1.1))
    cap_layout = L['headInk'] * sc
    x0, y0, x1, y1 = [int(round(v)) for v in head['box']]
    diff = np.abs(full[y0:y1, x0:x1] - bare[y0:y1, x0:x1]).max(axis=2)
    rows = np.where((diff > 60).sum(axis=1) > 8)[0]
    cap_px = (rows.max() - rows.min() + 1) * sc if len(rows) else 0
    print('[2] headline "%s": font %dpx, %d line(s), glyph ink height %.0f px at master' % (head['text'], head['size'], lines, L['headInk']))
    ok(lines <= 2, 'headline lines = %d (<= 2)' % lines)
    ok(cap_layout >= 14, 'headline cap height at feed %dx%d from layout = %.1f px (>= 14)' % (fw, fh, cap_layout))
    print('     cross-check from rendered pixels: %.1f px' % cap_px)
    # ---------- 3. safe zone ----------
    lim = 0.82 * H
    print('[3] safe zone: bottom 18%% starts at y = %.0f' % lim)
    for t in texts:
        bx = t['box']
        ok(bx[3] <= lim and bx[1] >= 0 and bx[0] >= 0 and bx[2] <= W, '%-8s box (%.0f, %.0f, %.0f, %.0f) bottom %.0f <= %.0f, %.1f%% of height' % (t['role'], *bx, bx[3], lim, 100 * bx[3] / H))
        for sp in t['spans']:
            ok(sp['box'][3] <= lim, '   span "%s" bottom %.0f' % (sp['text'], sp['box'][3]))
    ext = L['ext']
    ok(ext['sand'][1] <= lim, 'key visual: visible sand grains lowest y %.0f <= %.0f' % (ext['sand'][1], lim))
    ok(ext['band'][3] <= lim, 'key visual: highlighter layer box bottom %.0f <= %.0f' % (ext['band'][3], lim))
    # ---------- 4. contrast ----------
    print('[4] contrast (fill vs mean of the text-free background under the box)')
    for t in texts:
        need = 4.5 if t['role'] == 'headline' else 3.0
        parts = t['spans'] if t['spans'] else [{'text': t['text'], 'color': t['color'], 'gradient': '', 'box': t['box']}]
        for sp in parts:
            x0, y0, x1, y1 = [int(round(v)) for v in sp['box']]
            bg = bare[max(0, y0):y1, max(0, x0):x1].reshape(-1, 3)
            mean = bg.mean(axis=0)
            fills = rgbs(sp.get('gradient')) or rgbs(sp['color'])
            if sp.get('fill') and 'rgba(0, 0, 0, 0)' not in sp['fill'] and not sp.get('gradient', '').startswith('linear'):
                fills = rgbs(sp['fill']) or fills
            worst = min(cr(f, mean) for f in fills)
            # also the brightest 5% of background pixels under the box (worst case for light type)
            L5 = np.percentile(lum(bg), 95)
            p95 = min((max(float(lum(f)), L5) + 0.05) / (min(float(lum(f)), L5) + 0.05) for f in fills)
            ok(worst >= need, '%-8s "%s" fill %s vs bg mean (%d,%d,%d): %.2f (need %.1f); vs 95th-pct bg pixel %.2f'
               % (t['role'], sp['text'], '/'.join('#%02x%02x%02x' % f for f in fills), *mean, worst, need, p95))
        if t.get('filter') and 'drop-shadow' in t['filter']:
            sh = rgbs(t['filter'])
            if sh:
                fills = [f for sp in parts for f in (rgbs(sp.get('gradient')) or rgbs(sp['color']))]
                print('     %s also relies on a dark drop-shadow %s: fill vs shadow min %.2f' % (t['role'], '#%02x%02x%02x' % sh[0], min(cr(f, sh[0]) for f in fills)))
    all_strings += [t['text'] for t in texts]

# ---------- 5. forbidden words ----------
print('\n[5] forbidden-word scan over every string on the cover')
html = open(os.path.join(D, 'cover.html'), encoding='utf-8').read()
placed = sorted(set(all_strings))
for s in placed:
    hits = [w for w in FORBID if w.lower() in s.lower()] + EMOJI.findall(s)
    ok(not hits, 'string "%s": hits %s' % (s, hits))
# every visible text node in the HTML body markup, too (in case something is placed outside .txt)
body = re.sub(r'<script.*?</script>|<style.*?</style>|<head>.*?</head>', '', html, flags=re.S)
nodes = [n.strip() for n in re.sub(r'<[^>]+>', '\n', body).split('\n') if n.strip()]
ok(all(any(n in s for s in placed) for n in nodes), 'body text nodes all accounted for: %s' % nodes)
ok(len(set(all_strings)) <= 3, 'text elements on the cover: %d (<= 3)' % len(set(all_strings)))

print('\nRESULT: %s (%d failures)' % ('ALL PASS' if not fails else 'FAIL', len(fails)))
sys.exit(1 if fails else 0)
