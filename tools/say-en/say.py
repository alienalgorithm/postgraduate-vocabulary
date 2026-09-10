#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""英文朗读合成器 · 独立版

给它英文，它给你音频。四种音色，逐词时间轴，自带质量检查。

────────────────────────────────────────────────────
安装（第一次用）
────────────────────────────────────────────────────

    pip install kokoro-onnx soundfile numpy
    # 还需要 ffmpeg：Ubuntu 用 apt install ffmpeg，Mac 用 brew install ffmpeg

    # 下载模型（约 340 MB，下完就完全离线）
    mkdir -p models && cd models
    curl -L -O https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.0/kokoro-v1.0.onnx
    curl -L -O https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.0/voices-v1.0.bin

────────────────────────────────────────────────────
怎么用
────────────────────────────────────────────────────

一句话：

    python say.py "The whale sang the same song as the others."

整个文件（每行一句，逐句出音频）：

    python say.py --file passage.txt --out audio/

换音色、调语速：

    python say.py "Hello there." --voice bm_george --speed 0.9

四种音色：

    bf_emma      英音女声      bm_george    英音男声
    af_heart     美音女声      am_michael   美音男声

四种一起出（同一句四个版本）：

    python say.py "Hello there." --all-voices

要逐词时间轴（做跟读高亮用）：

    python say.py "Hello there." --timeline

检查已有音频合不合格：

    python say.py --check audio/

────────────────────────────────────────────────────
它替你守住的三条
────────────────────────────────────────────────────

1  不削波 —— 峰值超过 0.95 自动归一。
   否则重读的地方会失真，听着发毛刺。

2  时间轴存毫秒，严格递增，不超出音频时长。
   存成秒的话，逐词高亮会一格不动，而且什么错都不报。

3  静音裁边 —— 掐掉首尾的空白，但留 60 毫秒气口。
   不留的话听着像被剪断了。
"""
import argparse
import glob
import io
import json
import os
import re
import subprocess
import sys

VOICES = {
    'bf_emma':    'Emma · 英音女声',
    'bm_george':  'George · 英音男声',
    'af_heart':   'Heart · 美音女声',
    'am_michael': 'Michael · 美音男声',
}
SR = 24000
PEAK_LIMIT = 0.95
HEADROOM_MS = 60          # 首尾各留这么多气口


# ═══════════ 合成 ═══════════

def _load_model(models_dir):
    try:
        from kokoro_onnx import Kokoro
    except ImportError:
        sys.exit('缺 kokoro-onnx：pip install kokoro-onnx soundfile numpy')
    onnx = os.path.join(models_dir, 'kokoro-v1.0.onnx')
    bins = os.path.join(models_dir, 'voices-v1.0.bin')
    for p in (onnx, bins):
        if not os.path.isfile(p):
            sys.exit(f'找不到 {p}\n请照文件开头的说明下载模型。')
    return Kokoro(onnx, bins)


def _trim(wav, np):
    """掐掉首尾静音，两端各留 60 毫秒气口。"""
    if not len(wav):
        return wav
    thr = float(abs(wav).max()) * 0.02
    idx = (abs(wav) > thr).nonzero()[0]
    if not len(idx):
        return wav
    pad = SR * HEADROOM_MS // 1000
    a = max(0, idx[0] - pad)
    b = min(len(wav), idx[-1] + pad)
    return wav[a:b]


def synth(k, text, voice='bf_emma', speed=1.0):
    """合成一句，返回波形。峰值超限自动归一。"""
    import numpy as np
    wav, _ = k.create(text, voice=voice, speed=speed, lang='en-us')
    wav = _trim(wav, np)
    peak = float(np.abs(wav).max()) if len(wav) else 0.0
    if peak > PEAK_LIMIT:
        wav = wav / peak * PEAK_LIMIT
    return wav


def word_times(wav, n_words):
    """逐词起点，单位毫秒。

    按短时能量找出最长的 n-1 个静音段当词界——
    比等分准得多，停顿长的地方本来就是词界。
    """
    import numpy as np
    hop = SR // 100                       # 10ms 一帧
    frames = len(wav) // hop
    if frames < n_words * 2 or n_words < 2:
        dur = len(wav) / SR * 1000
        return [round(i * dur / max(n_words, 1)) for i in range(n_words)]

    e = np.array([np.abs(wav[i * hop:(i + 1) * hop]).mean()
                  for i in range(frames)])
    e = np.convolve(e, np.ones(5) / 5, mode='same')     # 平滑掉单帧噪声
    quiet = e < e.mean() * 0.35

    gaps, i = [], 0
    while i < frames:
        if quiet[i]:
            j = i
            while j < frames and quiet[j]:
                j += 1
            if j - i >= 2:
                gaps.append(((i + j) // 2, j - i))
            i = j
        else:
            i += 1

    gaps.sort(key=lambda g: -g[1])
    cuts = sorted(g[0] for g in gaps[:n_words - 1])
    if len(cuts) < n_words - 1:                          # 不够就按比例补
        extra = [round((i + 1) * frames / n_words) for i in range(n_words - 1)]
        cuts = sorted(set(cuts) | set(extra))[:n_words - 1]

    t = [0] + [c * hop * 1000 // SR for c in cuts]
    for i in range(1, len(t)):                           # 严格递增
        if t[i] <= t[i - 1]:
            t[i] = t[i - 1] + 30
    dur_ms = int(len(wav) / SR * 1000)
    return [min(x, dur_ms - 30) for x in t[:n_words]]


def write(wav, path, fmt='opus', bitrate='48k'):
    """存盘。opus 体积小，wav 无损。"""
    import soundfile as sf
    os.makedirs(os.path.dirname(os.path.abspath(path)) or '.', exist_ok=True)
    if fmt == 'wav':
        sf.write(path, wav, SR)
        return True
    buf = io.BytesIO()
    sf.write(buf, wav, SR, format='WAV')
    r = subprocess.run(
        ['ffmpeg', '-v', 'quiet', '-y', '-i', 'pipe:0',
         '-c:a', 'libopus', '-b:a', bitrate, path],
        input=buf.getvalue(), capture_output=True)
    if r.returncode:
        sys.exit('ffmpeg 编码失败——装了吗？apt install ffmpeg')
    return True


# ═══════════ 质量检查 ═══════════

def inspect(path):
    """解码一个音频，回报它的健康状况。"""
    import numpy as np
    import soundfile as sf
    r = subprocess.run(['ffmpeg', '-v', 'quiet', '-i', path, '-f', 'wav', '-'],
                       capture_output=True)
    if r.returncode:
        return {'ok': False, 'why': '解码失败'}
    y, sr = sf.read(io.BytesIO(r.stdout))
    if getattr(y, 'ndim', 1) > 1:
        y = y.mean(axis=1)
    dur = len(y) / sr
    peak = float(abs(y).max()) if len(y) else 0.0
    rms = float((y ** 2).mean() ** 0.5) if len(y) else 0.0
    bad = []
    if peak > 0.999:
        bad.append('削波')
    if rms < 0.02:
        bad.append('过轻')
    if dur < 0.25:
        bad.append('过短')
    return {'ok': not bad, 'why': '·'.join(bad), 'dur': dur,
            'peak': peak, 'rms': rms}


# ═══════════ 命令行 ═══════════

def main():
    ap = argparse.ArgumentParser(
        description='英文朗读合成器',
        formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument('text', nargs='?', help='要念的英文')
    ap.add_argument('--file', help='文本文件，每行一句')
    ap.add_argument('--out', default='.', help='输出目录（默认当前目录）')
    ap.add_argument('--voice', default='bf_emma', choices=list(VOICES))
    ap.add_argument('--all-voices', action='store_true', help='四种音色都出一份')
    ap.add_argument('--speed', type=float, default=1.0, help='语速，1.0 是常速')
    ap.add_argument('--format', default='opus', choices=['opus', 'wav'])
    ap.add_argument('--timeline', action='store_true', help='同时产出逐词时间轴')
    ap.add_argument('--models', default='models', help='模型目录')
    ap.add_argument('--check', help='检查这个目录下的音频')
    ap.add_argument('--list-voices', action='store_true')
    a = ap.parse_args()

    if a.list_voices:
        for k, v in VOICES.items():
            print(f'  {k:<14}{v}')
        return 0

    if a.check:
        files = sorted(glob.glob(os.path.join(a.check, '**', '*.opus'),
                                 recursive=True)
                       + glob.glob(os.path.join(a.check, '**', '*.wav'),
                                   recursive=True))
        if not files:
            print('  没找到音频文件')
            return 1
        bad = 0
        for f in files:
            r = inspect(f)
            if not r['ok']:
                bad += 1
                print(f'  ✗ {os.path.basename(f):<24}{r["why"]}')
        print(f'\n  查了 {len(files)} 个，{bad} 个有问题'
              + ('' if bad else ' —— 全部合格 ✓'))
        return 1 if bad else 0

    # 收集要念的句子
    if a.file:
        lines = [l.strip() for l in io.open(a.file, encoding='utf-8')
                 if l.strip()]
    elif a.text:
        lines = [a.text]
    else:
        ap.print_help()
        return 1

    k = _load_model(a.models)
    voices = list(VOICES) if a.all_voices else [a.voice]
    os.makedirs(a.out, exist_ok=True)
    timeline = {}
    n = 0

    for v in voices:
        for i, line in enumerate(lines, 1):
            wav = synth(k, line, v, a.speed)
            name = (f'{i:03d}.{a.format}' if len(voices) == 1
                    else f'{v}_{i:03d}.{a.format}')
            path = os.path.join(a.out, name)
            write(wav, path, a.format)
            n += 1
            info = inspect(path)
            mark = '✓' if info['ok'] else '✗'
            print(f'  {mark} {name:<22}{info["dur"]:5.2f}s  '
                  f'峰值 {info["peak"]:.3f}  {line[:40]}')
            if a.timeline:
                timeline[name] = {
                    'text': line,
                    'ms': word_times(wav, len(line.split())),
                }

    if a.timeline:
        tp = os.path.join(a.out, 'timeline.json')
        json.dump(timeline, io.open(tp, 'w', encoding='utf-8'),
                  ensure_ascii=False, indent=1)
        print(f'\n  时间轴 → {tp}')

    print(f'\n  合成 {n} 段 → {a.out}')
    return 0


if __name__ == '__main__':
    sys.exit(main())
