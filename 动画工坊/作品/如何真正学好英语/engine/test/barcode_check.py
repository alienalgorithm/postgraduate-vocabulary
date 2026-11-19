#!/usr/bin/env python3
"""barcode_check.py <video.mp4> [first_frame_index]
Reads the engine's frame-index barcode (render.js --barcode) from every decoded frame and checks that the
output contains each frame exactly once, in order (no duplicates, no gaps, no reordering at chunk joins)."""
import subprocess, sys, json
import numpy as np
f = sys.argv[1]; first = int(sys.argv[2]) if len(sys.argv) > 2 else 0
info = json.loads(subprocess.check_output(['ffprobe', '-v', 'error', '-select_streams', 'v:0', '-show_entries', 'stream=width,height', '-of', 'json', f]))['streams'][0]
s = info['width'] / 1920.0
bits = 22; cell = 48 * s
x0 = 0; y0 = info['height'] - cell
# sample the centre of each 48 px cell
raw = subprocess.check_output(['ffmpeg', '-v', 'error', '-i', f, '-vf', f'crop={int(cell*bits)}:{int(cell)}:{int(x0)}:{int(y0)},scale={bits*4}:4:flags=area,format=gray', '-f', 'rawvideo', '-'])
fr = np.frombuffer(raw, np.uint8).reshape(-1, 4, bits * 4)
vals = fr[:, 1:3, :].reshape(fr.shape[0], 2, bits, 4)[:, :, :, 1:3].mean(axis=(1, 3))
b = vals > 128
bad = []
idx = []
for i, row in enumerate(b):
    if not (row[0] and not row[1]):
        bad.append((i, 'no sync')); idx.append(-1); continue
    n = sum(int(v) << k for k, v in enumerate(row[2:]))
    idx.append(n)
    if n != first + i: bad.append((i, n))
print(f'{f}: {len(idx)} frames, indices {idx[0] if idx else None}..{idx[-1] if idx else None}, mismatches: {len(bad)}')
for x in bad[:20]: print('  frame', x)
sys.exit(1 if bad else 0)
