# Masters, B站 upload JPGs, feed previews, side_by_side, and all program checks for the d3_cinematic covers.
# Reads work/r16*.{png,json} and work/r43*.{png,json} written by shoot.js. Exit code 1 if any check fails.
import json, math, os, re, shutil, sys
import numpy as np
from PIL import Image

D = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FMT = {'16x9': dict(src='r16', size=(3840, 2160), up=(1920, 1080), feed=(320, 180)),
       '4x3': dict(src='r43', size=(2880, 2160), up=(1440, 1080), feed=(240, 180))}
SAFE = 0.82            # nothing may enter the bottom 18 %
MIN_FEED_INK = 14.0    # headline glyph height at feed size, px
FORBID = ['最', '第一', '保证', '100%', '美国', '外国', '老外', '母语', 'native', '--']
DASHES = '‐‑‒–—―−⸺⸻﹘﹣－-'
EMOJI = re.compile('[\U0001F000-\U0001FAFF☀-➿️]')

def lin(c):
    c = c / 255.0
    return c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4
def lum(rgb): return 0.2126 * lin(rgb[0]) + 0.7152 * lin(rgb[1]) + 0.0722 * lin(rgb[2])
def ratio(a, b):
    la, lb = lum(a), lum(b); hi, lo = max(la, lb), min(la, lb); return (hi + 0.05) / (lo + 0.05)
def hexrgb(h):
    h = h.strip().lstrip('#'); return tuple(int(h[i:i + 2], 16) for i in (0, 2, 4))

def learner_feet_y(F=700, CY=532, ZL=-51):
    # same projection as scenes/s08.js at street level (cam y 2.4, z -58, pitch -5.71 deg), 1080p units -> 4K
    phi = math.radians(-5.71); sp, cp = math.sin(phi), math.cos(phi)
    def py(y, z):
        dy, dz = y - 2.4, z + 58; zc = dz * cp - dy * sp; yc = dy * cp + dz * sp; return (CY - F * yc / zc) * 2
    lw = 0.045 * F / ((ZL + 58) * cp + 2.4 * sp) * 2      # stroke width at the feet (round caps)
    return py(0, ZL) + lw / 2, py(1.6, ZL)

report = {}; ok = True
def need(cond, msg):
    global ok
    if not cond: ok = False; print('FAIL', msg)
    return cond

for key, f in FMT.items():
    W, H = f['size']
    lay = json.load(open(os.path.join(D, 'work', f['src'] + '_layout.json')))
    final = Image.open(os.path.join(D, 'work', f['src'] + '.png')).convert('RGB')
    bg = np.asarray(Image.open(os.path.join(D, 'work', f['src'] + '_notext.png')).convert('RGB'), dtype=np.float64)
    r = report[key] = {}
    # 1. files
    master = os.path.join(D, f'cover_{key}_master.png'); final.save(master, compress_level=9)
    up = os.path.join(D, f'cover_{key}_upload.jpg'); small = final.resize(f['up'], Image.LANCZOS)
    for q, sub in [(95, 0), (95, 2), (94, 2), (93, 2), (92, 2)]:
        small.save(up, quality=q, subsampling=sub, optimize=True)
        if os.path.getsize(up) < 2 * 1024 * 1024: break
    r['files'] = {}
    for p, want in ((master, f['size']), (up, f['up'])):
        sz = Image.open(p).size; fb = os.path.getsize(p)
        r['files'][os.path.basename(p)] = dict(px=f'{sz[0]}x{sz[1]}', bytes=fb, MB=round(fb / 1048576, 3))
        need(sz == want, f'{p} size {sz} != {want}')
        if p.endswith('.jpg'): need(fb < 2 * 1024 * 1024, f'{p} is {fb} bytes'); r['files'][os.path.basename(p)]['jpeg_quality'] = q; r['files'][os.path.basename(p)]['subsampling'] = '4:4:4' if sub == 0 else '4:2:0'
    # 2. feed preview + headline glyph height at feed size
    feed = final.resize(f['feed'], Image.LANCZOS); feed.save(os.path.join(D, f'feed_{key}.png'))
    k = f['feed'][0] / W
    ink = sorted(i['h'] for i in lay['ink'])
    r['feed_ink_px'] = dict(scale=round(k, 5), min=round(ink[0] * k, 2), median=round(ink[len(ink) // 2] * k, 2), max=round(ink[-1] * k, 2), font_px_master=[e['fontSize'] for e in lay['els'] if e['role'] == 'headline'][0])
    need(ink[0] * k >= MIN_FEED_INK, f'{key} headline ink at feed {ink[0] * k:.2f} < {MIN_FEED_INK}')
    # 3. safe zone (boxes from getBoundingClientRect) + text element count + headline lines
    lim = SAFE * H; r['safe_limit_y'] = lim; r['boxes'] = {}
    need(len(lay['els']) <= 3, f'{key} has {len(lay["els"])} text elements')
    for e in lay['els']:
        for name, b in [(e['id'], e['box'])] + [(e['id'] + ':' + l['text'], l['box']) for l in e['lines'] if len(e['lines']) > 1]:
            r['boxes'][name] = [round(b['x0']), round(b['y0']), round(b['x1']), round(b['y1'])]
            need(b['y1'] <= lim and b['y0'] >= 0 and b['x0'] >= 0 and b['x1'] <= W, f'{key} {name} box {b} outside safe area (y1 <= {lim})')
    hl = [e for e in lay['els'] if e['role'] == 'headline'][0]
    r['headline_lines'] = len(hl['lines']); need(len(hl['lines']) <= 2, 'headline > 2 lines')
    lh = (hl['box']['y1'] - hl['box']['y0']) / len(hl['lines']); need(lh < hl['fontSize'] * 1.2, 'headline wrapped')
    feet, head = learner_feet_y(); r['learner'] = dict(head_y=round(head), feet_y=round(feet), ok=feet <= lim)
    need(feet <= lim, f'learner feet {feet} enter bottom zone')
    # 4. contrast: each line's fill stops vs the mean background colour under its box (text-free render)
    r['contrast'] = {}
    for e in lay['els']:
        need_min = 4.5 if e['role'] == 'headline' else 3.0
        for l in e['lines']:
            b = l['box']; x0, y0, x1, y1 = [int(round(v)) for v in (b['x0'], b['y0'], b['x1'], b['y1'])]
            patch = bg[max(0, y0):min(H, y1), max(0, x0):min(W, x1)].reshape(-1, 3)
            mean = tuple(patch.mean(0)); fills = [hexrgb(c) for c in l['fill']]
            cr = min(ratio(c, mean) for c in fills)
            L = 0.2126 * patch[:, 0] + 0.7152 * patch[:, 1] + 0.0722 * patch[:, 2]
            p95 = patch[np.argsort(L)[int(len(L) * 0.95)]]
            cr95 = min(ratio(c, tuple(p95)) for c in fills)
            # the drop shadow (black, 65 %) composited over the mean background, vs the fill
            sh = tuple(0.35 * m for m in mean); crs = min(ratio(c, sh) for c in fills)
            r['contrast'][e['id'] + ':' + l['text']] = dict(fill=l['fill'], bg_mean='#%02x%02x%02x' % tuple(int(round(v)) for v in mean), ratio=round(cr, 2), need=need_min, ratio_vs_p95_bg=round(cr95, 2), fill_vs_shadow=round(crs, 2))
            need(cr >= need_min, f'{key} {e["id"]} {l["text"]} contrast {cr:.2f} < {need_min}')
            # stricter, glyph level: every character's own box (ink cell) must pass the same threshold
            gl = []
            for g in l['glyphs']:
                gb = g['box']; gx0, gy0, gx1, gy1 = int(gb['x0']), int(gb['y0'] + 0.18 * (gb['y1'] - gb['y0'])), int(gb['x1']), int(gb['y1'] - 0.18 * (gb['y1'] - gb['y0']))
                gp = bg[max(0, gy0):min(H, gy1), max(0, gx0):min(W, gx1)].reshape(-1, 3)
                if not len(gp): continue
                gl.append((g['ch'], min(ratio(c, tuple(gp.mean(0))) for c in fills)))
            worst = min(gl, key=lambda t: t[1])
            r['contrast'][e['id'] + ':' + l['text']]['glyph_min'] = [worst[0], round(worst[1], 2)]
            need(worst[1] >= need_min, f'{key} {e["id"]} glyph {worst[0]} contrast {worst[1]:.2f} < {need_min}')
    # 5. forbidden words over every string placed on the cover
    strings = [e['raw'] for e in lay['els']] + [lay['allText']]
    hits = []
    for s in strings:
        for w in FORBID:
            if w.lower() in s.lower(): hits.append(w)
        hits += [c for c in s if c in DASHES]
        hits += EMOJI.findall(s)
    r['texts'] = [e['text'] for e in lay['els']]
    r['forbidden_hits'] = sorted(set(hits)); need(not hits, f'{key} forbidden: {hits}')

# side by side: both feed previews at 2x on mid grey
a = Image.open(os.path.join(D, 'feed_16x9.png')).resize((640, 360), Image.LANCZOS)
b = Image.open(os.path.join(D, 'feed_4x3.png')).resize((480, 360), Image.LANCZOS)
sbs = Image.new('RGB', (40 + 640 + 40 + 480 + 40, 440), (128, 128, 128)); sbs.paste(a, (40, 40)); sbs.paste(b, (720, 40))
sbs.save(os.path.join(D, 'side_by_side.jpg'), quality=94)
report['all_pass'] = ok
json.dump(report, open(os.path.join(D, 'checks.json'), 'w'), ensure_ascii=False, indent=1)
print(json.dumps(report, ensure_ascii=False, indent=1))
print('ALL CHECKS PASS' if ok else 'SOME CHECKS FAILED')
sys.exit(0 if ok else 1)
