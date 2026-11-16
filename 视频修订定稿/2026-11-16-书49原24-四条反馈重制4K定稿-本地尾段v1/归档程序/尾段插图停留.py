#!/usr/bin/env python3
"""尾段：末句读完后原末正文页再停 0.6 秒（30fps 18 帧），接原插图 2 秒，再接简述 2 秒（AGENTS.md 2026-11-14 规则）。
在出片工作目录运行，用 定稿.sh（XG_NOPUSH=1）刚出的 4K 的同一份画面清单 work_NN/list.txt 和声音 work_NN/a.wav：
  末句读完的时刻 E 用 62/65 归档同一口径（voice_end：5 ms RMS，-60/-70/-80 dB 取最晚）在 a.wav 上量；
  画面：末正文页延到第 ceil(E×30)+18 帧结束（= 读完后 0.6 秒，hold18_geometry 同一几何），接插图 60 帧、简述 60 帧；其余每屏、每个时长原样。
  声音：在 ceil(E×30)/30 处（已在读完之后、必须是 -60 dB 以下）补数字静音到画面总长；之前的样本逐个不动，不重新合成。
  （书49 2026-11-16：末句 view. 的嘎裂尾音一直读到简述页开始之后 15 ms，原来“在简述页开始处插静音”会切进末句，改按实测读完时刻。）
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
A, SR = sf.read(f'{work}/a.wav', dtype='float32')
def voice_end(x, sr):   # 62/65 归档 voice_end.py 同一算法（5 ms RMS，-60/-70/-80 dB，取最晚）
    hop = int(0.005 * sr); n = len(x) // hop; st = max(0, n - 1000); pw = (x[:n * hop].astype(np.float64).reshape(n, hop) ** 2).mean(axis=1); e = {}
    for thr in (-60, -70, -80):
        idx = np.nonzero(pw[st:] > 10 ** (thr / 10))[0]
        if not len(idx): raise SystemExit('【停止】结尾附近量不到人声')
        e[thr] = (st + idx[-1] + 1) * hop / sr
    if abs(e[-80] - e[-70]) >= 0.06: raise SystemExit(f'【停止】读完时刻不确定 {e}')
    return max(e.values()), e
E_, ends = voice_end(A, SR)
ceil_f = int(np.ceil(round(E_ * 30, 9))); body_end = ceil_f + 18
t_before = sum(float(d) for _, d in ent[:k - 1])   # 末正文页开始的秒
last_dur = body_end / 30 - t_before
if last_dur < float(ent[k - 1][1]): raise SystemExit('【停止】末正文页会比原来短')
ent2 = ent[:k - 1] + [(ent[k - 1][0], f'{last_dur:.6f}'), (artp, f'{ART:.3f}'), (ent[k][0], f'{float(ent[k][1]):.3f}')]
lst = f'{work}/list_尾段.txt'
with open(lst, 'w') as f:
    for fn, du in ent2: f.write(f"file '{fn}'\nduration {du}\n")
    f.write(f"file '{ent2[-1][0]}'\n")
cut = int(round(ceil_f / 30 * SR)); total = int(round((body_end + 120) / 30 * SR))
if cut < int(round(E_ * SR)) or (len(A) > cut and np.abs(A[cut:]).max() > 10 ** (-60 / 20)): raise SystemExit('【停止】插静音处还有声音（会切进末句）')
if total < len(A): raise SystemExit('【停止】声音比画面长')
B = np.concatenate([A[:cut], np.zeros(total - len(A), np.float32), A[cut:]])
sf.write(f'{work}/a_尾段.wav', B, SR, subtype=sf.info(f'{work}/a.wav').subtype)
t_sum = sum(float(d) for _, d in ent[:k])
AF = open('../tts/AF.txt').read().strip(); FF = imageio_ffmpeg.get_ffmpeg_exe()
# 画面分三段编码再无损拼接（书49 2026-11-16 实测：concat 图片的时间戳只有 1/25 秒一格，转 30fps 时页界只能落在 4487 或 4489 帧，
# 落不到 ceil(E×30)+18；所以正文段用出片同一条命令、截到第 body_end 帧，插图、简述各用 30fps 单图正好 60 帧，三段同参数 x264 后 -c copy 拼起来）
V = ['-c:v', 'libx264', '-tune', 'stillimage', '-crf', '16', '-preset', 'slow', '-pix_fmt', 'yuv420p', '-r', '30', '-an']
lst_b = f'{work}/list_正文段.txt'
with open(lst_b, 'w') as f:
    for fn, du in ent2[:k - 1] + [(ent[k - 1][0], f'{last_dur + 1:.6f}')]: f.write(f"file '{fn}'\nduration {du}\n")
    f.write(f"file '{ent[k - 1][0]}'\n")
pieces = [f'{work}/尾段_正文.mp4', f'{work}/尾段_插图.mp4', f'{work}/尾段_简述.mp4']
subprocess.run([FF, '-y', '-loglevel', 'error', '-f', 'concat', '-safe', '0', '-i', lst_b] + V + ['-frames:v', str(body_end), pieces[0]], check=True)
for img, pc in ((artp, pieces[1]), (ent[k][0], pieces[2])):
    subprocess.run([FF, '-y', '-loglevel', 'error', '-framerate', '30', '-loop', '1', '-i', img] + V + ['-frames:v', '60', pc], check=True)
with open(f'{work}/尾段_拼接.txt', 'w') as f:
    for pc in pieces: f.write(f"file '{os.path.abspath(pc)}'\n")
aud = f'{work}/尾段_声音.m4a'
subprocess.run([FF, '-y', '-loglevel', 'error', '-i', f'{work}/a_尾段.wav', '-af', AF, '-c:a', 'aac', '-b:a', '256k', aud], check=True)
subprocess.run([FF, '-y', '-loglevel', 'error', '-f', 'concat', '-safe', '0', '-i', f'{work}/尾段_拼接.txt', '-i', aud, '-map', '0:v', '-map', '1:a',
                '-c', 'copy', '-movflags', '+faststart', out], check=True)
json.dump({'简述页开始秒_原片': round(t_sum, 4), '读完时刻E': E_, '读完各门槛': ends, '末正文页结束帧': body_end, '插图开始秒': body_end / 30, '读完到插图秒': body_end / 30 - E_, '插入静音样本起点': cut, '插图': os.path.basename(art)},
          open(f'{work}/尾段.json', 'w'), ensure_ascii=False, indent=1)
print(out, f'读完 {E_:.4f}s，插图从第 {body_end} 帧（{body_end / 30:.4f}s）起，读完到插图 {body_end / 30 - E_:.4f}s')
