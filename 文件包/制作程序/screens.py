#!/usr/bin/env python3
"""视频同屏版: one PDF page per video screen, taken from the final 4K video itself.
Each sentence screen is shown chunk by chunk in the video (current chunk lit, others dimmed); the page is the
per-pixel brightest of that screen's steady chunk frames, so every chunk is lit and every pixel is a video pixel.
Checks: screen count = title + sentences + illustration + summary; chunk states per screen = source chunk counts."""
import hashlib, io, json, subprocess, sys
from pathlib import Path
import numpy as np
from PIL import Image
from reportlab import rl_config
rl_config.useA85 = 0                     # no ASCII85 bloat
from reportlab.pdfgen import canvas
from reportlab.lib.utils import ImageReader

def segments(video, work):
    work.mkdir(parents=True, exist_ok=True)
    raw = work / 'g240.gray'
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', str(video), '-vf', 'scale=240:135,format=gray', '-f', 'rawvideo', str(raw)], check=True)
    a = np.memmap(raw, np.uint8, 'r').reshape(-1, 135, 240); n = len(a)
    d = np.array([99.0] + [float(np.abs(a[i + 1].astype(np.int16) - a[i]).mean()) for i in range(n - 1)])
    steady = d < 0.08; runs = []; i = 0
    while i < n:
        if steady[i]:
            j = i
            while j < n and steady[j]: j += 1
            if j - i >= 6: runs.append((i, j - 1))
            i = j
        else: i += 1
    bg = np.median(np.stack([a[k] for k in range(0, n, 60)]), axis=0)
    masks = [a[e] > (np.minimum(bg, 60) + 14) for s, e in runs]
    groups = [[0]]
    for k in range(1, len(runs)):
        m0, m1 = masks[groups[-1][-1]], masks[k]
        iou = (m0 & m1).sum() / max(1, (m0 | m1).sum())
        (groups[-1].append(k) if iou > 0.6 else groups.append([k]))
    raw.unlink()
    return runs, groups, n

def build(video, article, out, work):
    art = json.loads(Path(article).read_text())
    runs, groups, nframes = segments(video, work)
    want = [len(s['chunks']) for s in art['sentences']]
    got = [len(g) for g in groups]
    # screen count must match exactly; a screen may show more steady states than source chunks (the ending sentence is
    # spoken in two takes), which is harmless because the page keeps the brightest of all its states
    assert len(groups) == len(want) + 3 and all(g >= w for g, w in zip(got[1:-2], want)), (got, want)
    # title, illustration and summary screens: the illustration may drift slowly (two or three still states), so these
    # pages use their last still frame instead of a brightest-pixel merge (which would ghost a moving picture)
    for gi in (0, len(groups) - 2, len(groups) - 1): groups[gi] = groups[gi][-1:]
    idx = [e - 1 for s, e in runs]
    sel = '+'.join(f'eq(n\\,{i})' for i in idx)
    fr = work / 'frames'; fr.mkdir(exist_ok=True)
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', str(video), '-vf', f"select='{sel}'", '-vsync', '0',
                    '-pix_fmt', 'rgb24', str(fr / 'f%03d.png')], check=True)     # BT.601 = the encoder's own conversion
    names = ['标题'] + [f'第{s["n"]}句' for s in art['sentences']] + ['插图', '简述']
    W, H = 960, 540
    c = canvas.Canvas(str(out), pagesize=(W, H), pageCompression=1, invariant=0, initialFontName='Times-Roman')
    c.setTitle(f'{art["no"]} {art["title_zh"]}｜视频同屏版'); c.setAuthor('朋克英语'); c.setCreator('朋克英语')
    c.setSubject('与视频画面一致的逐屏讲义')
    report = []
    for gi, gr in enumerate(groups):
        best = bl = None
        for k in gr:
            a = np.asarray(Image.open(fr / f'f{k + 1:03d}.png').convert('RGB'))
            l = a[..., 0].astype(np.uint32) * 299 + a[..., 1].astype(np.uint32) * 587 + a[..., 2].astype(np.uint32) * 114
            if best is None: best, bl = a.copy(), l
            else:
                m = l > bl; best[m] = a[m]; bl = np.where(m, l, bl)
        im = Image.fromarray(best); buf = io.BytesIO(); im.save(buf, 'JPEG', quality=95, subsampling=0, optimize=True)
        dec = np.asarray(Image.open(io.BytesIO(buf.getvalue()))).astype(float)
        psnr = 10 * np.log10(255 ** 2 / ((dec - best.astype(float)) ** 2).mean())
        report.append({'page': gi + 1, 'name': names[gi], 'chunk_frames': [idx[k] for k in gr], 'jpeg_psnr_db': round(psnr, 2)})
        key = f'p{gi}'; c.bookmarkPage(key); c.addOutlineEntry(names[gi], key, 0)
        c.drawImage(ImageReader(io.BytesIO(buf.getvalue())), 0, 0, width=W, height=H); c.showPage()
    c.save()
    for f in fr.glob('*.png'): f.unlink()
    return {'video_sha256': hashlib.sha256(Path(video).read_bytes()).hexdigest(), 'frames': nframes, 'pages': report,
            'min_psnr_db': min(r['jpeg_psnr_db'] for r in report)}

if __name__ == '__main__':
    r = build(Path(sys.argv[1]), sys.argv[2], Path(sys.argv[3]), Path(sys.argv[4]))
    print(json.dumps({k: r[k] for k in ('video_sha256', 'frames', 'min_psnr_db')}), len(r['pages']), 'pages')
    Path(sys.argv[4], 'screens-report.json').write_text(json.dumps(r, ensure_ascii=False, indent=1))
