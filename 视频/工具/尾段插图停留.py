#!/usr/bin/env python3
"""尾段：末句读完后原末正文页再停 0.6 秒（30fps 18 帧），接原插图 2 秒，再接简述 2 秒（AGENTS.md 2026-11-14 规则）。
在出片工作目录运行，用 定稿.sh（XG_NOPUSH=1）刚出的 4K 的同一份画面清单 work_NN/list.txt 和声音 work_NN/a.wav：
  画面：简述页之前，末正文页时长 +0.6 秒，插入插图页 2 秒；其余每屏、每个时长原样。
  声音：a.wav 在简述页开始处（= 末句读完、句后停顿之后的那一刻）插入 2.6 秒数字静音；之前的样本逐个不动，不重新合成。
  编码：与 make_video 出片同一条 ffmpeg 命令（同一 AF 降噪、x264 crf16 slow stillimage、AAC 256k）。
用法：python3 尾段插图停留.py NN 插图.png 输出.mp4"""
import sys, os, re, json, numpy as np, soundfile as sf, imageio_ffmpeg, subprocess
from PIL import Image
no, art, out = sys.argv[1], sys.argv[2], sys.argv[3]
HOLD, ART = 0.6, 2.0
work = f'work_{no}'
ent = re.findall(r"file '([^']+)'\nduration ([\d.]+)", open(f'{work}/list.txt').read())
k = next(i for i, (f, _) in enumerate(ent) if '_简述' in f)
if k != len(ent) - 1: raise SystemExit('【停止】简述页不是最后一屏')
im = Image.open(art).convert('RGB')
if im.size != Image.open(ent[k][0]).size: raise SystemExit(f'【停止】插图尺寸 {im.size} 与画面不同')
artp = os.path.abspath(f'{work}/插图_尾段.png'); im.save(artp)
ent2 = ent[:k - 1] + [(ent[k - 1][0], f'{float(ent[k - 1][1]) + HOLD:.3f}'), (artp, f'{ART:.3f}')] + ent[k:]
lst = f'{work}/list_尾段.txt'
with open(lst, 'w') as f:
    for fn, du in ent2: f.write(f"file '{fn}'\nduration {du}\n")
    f.write(f"file '{ent2[-1][0]}'\n")
A, SR = sf.read(f'{work}/a.wav', dtype='float32')
t_sum = sum(float(d) for _, d in ent[:k])   # 简述页开始的秒
cut = int(round(t_sum * SR))
if np.abs(A[cut:]).max() > 10 ** (-60 / 20): raise SystemExit('【停止】简述页开始后还有声音（插静音会切进末句）')
B = np.concatenate([A[:cut], np.zeros(int(round((HOLD + ART) * SR)), np.float32), A[cut:]])
sf.write(f'{work}/a_尾段.wav', B, SR, subtype=sf.info(f'{work}/a.wav').subtype)
AF = open('../tts/AF.txt').read().strip(); FF = imageio_ffmpeg.get_ffmpeg_exe()
subprocess.run([FF, '-y', '-loglevel', 'error', '-f', 'concat', '-safe', '0', '-i', lst, '-i', f'{work}/a_尾段.wav',
                '-af', AF, '-c:v', 'libx264', '-tune', 'stillimage', '-crf', '16', '-preset', 'slow', '-pix_fmt', 'yuv420p', '-r', '30',
                '-c:a', 'aac', '-b:a', '256k', '-shortest', '-movflags', '+faststart', out], check=True)
json.dump({'简述页开始秒_原片': round(t_sum, 4), '插入静音样本起点': cut, '插入秒': HOLD + ART, '插图': os.path.basename(art)},
          open(f'{work}/尾段.json', 'w'), ensure_ascii=False, indent=1)
print(out, '简述页原开始', round(t_sum, 3), 's；插入 0.6 秒停留 + 2 秒插图')
