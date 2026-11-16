#!/usr/bin/env python3
"""书53（原68）4K 定稿尾段：末句读完后原末正文页停 0.6 秒（30fps 多 18 帧）→ 批准插图 2 秒 → 简述 2 秒。

做法（不另起画法、不动声音样本）：
  * 用 定稿.sh 出 4K 时 make_video 留下的同一批 4K 画面（work_68/NNNN.png）和时间表 list.txt；
    只改最后一页正文的时长（到 ceil(读完)+18 帧）并在简述页前插入批准插图 60 帧，简述 60 帧。
  * 声音 = 同一个 work_68/a.wav，只在末尾补数字静音到画面总长；照 make_video 原参数 AF（afftdn）+ AAC 256k。
  * x264 参数与 make_video 正式出片完全相同（-tune stillimage -crf 16 -preset slow -pix_fmt yuv420p -r 30）。
"""
import argparse, json, math, os, subprocess, sys
from fractions import Fraction
import numpy as np, soundfile as sf

ap = argparse.ArgumentParser()
ap.add_argument('--work', required=True)          # 出片工作目录（含 work_68、make_video 用的 tts AF）
ap.add_argument('--illustration', required=True)  # 批准插图 4K PNG
ap.add_argument('--voice-end', required=True, type=float)  # 定稿 4K 成片实测读完时刻（voice_end 同法）
ap.add_argument('--out', required=True)
ap.add_argument('--ffmpeg', required=True)
ap.add_argument('--af', required=True)
a = ap.parse_args()
W = a.work; wk = f'{W}/work_68'
lines = [l for l in open(f'{wk}/list.txt').read().splitlines() if l.strip()]
ent = []
i = 0
while i < len(lines):
    assert lines[i].startswith("file '"), lines[i]
    f = lines[i][6:-1]; d = None
    if i + 1 < len(lines) and lines[i + 1].startswith('duration '): d = Fraction(lines[i + 1].split()[1]); i += 2
    else: i += 1
    ent.append([f, d])
# 结构：…正文…, 最后一页正文, 简述(2.000), 末尾重复项（concat 惯例，无 duration）
sumi = [k for k, (f, d) in enumerate(ent) if '_简述' in os.path.basename(f) and d is not None]
assert len(sumi) == 1, sumi
s = sumi[0]; assert ent[s][1] == Fraction('2.000'), ent[s]
body_before = sum(d for f, d in ent[:s - 1])
ceil = math.ceil(Fraction(str(a.voice_end)) * 30)
body_end = ceil + 18
last = Fraction(body_end, 30) - body_before
assert last > 0
new = ent[:s - 1] + [[ent[s - 1][0], last], [os.path.abspath(a.illustration), Fraction(2)], [ent[s][0], Fraction(2)]]
lst = f'{wk}/list_尾段53.txt'
with open(lst, 'w') as fo:
    for f, d in new: fo.write(f"file '{f}'\nduration {float(d):.6f}\n")
    fo.write(f"file '{new[-1][0]}'\n")
total = Fraction(body_end + 120, 30)
A, sr = sf.read(f'{wk}/a.wav', dtype='float32')
n_need = int(total * sr)
assert n_need >= len(A), (n_need, len(A))
P = np.concatenate([A, np.zeros(n_need - len(A), np.float32)])
assert np.array_equal(P[:len(A)], A)
sf.write(f'{wk}/a_尾段53.wav', P, sr, subtype=sf.info(f'{wk}/a.wav').subtype)
subprocess.run([a.ffmpeg, '-y', '-loglevel', 'error', '-f', 'concat', '-safe', '0', '-i', lst, '-i', f'{wk}/a_尾段53.wav',
                '-af', a.af, '-c:v', 'libx264', '-tune', 'stillimage', '-crf', '16', '-preset', 'slow', '-pix_fmt', 'yuv420p', '-r', '30',
                '-c:a', 'aac', '-b:a', '256k', '-shortest', '-movflags', '+faststart', a.out], check=True)
print(json.dumps({'voice_end': a.voice_end, 'speech_ceiling_frame': ceil, 'body_end_frame': body_end,
                  'illustration_frames': [body_end, body_end + 60], 'summary_frames': [body_end + 60, body_end + 120],
                  'output_frames_expected': body_end + 120, 'last_body_page': os.path.basename(ent[s - 1][0]),
                  'last_body_page_seconds': float(last), 'a_wav_samples': len(A), 'padded_samples': len(P)}, ensure_ascii=False))
