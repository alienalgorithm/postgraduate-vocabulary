#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""给一篇文章合成整套朗读音频。

    python tools/make_audio.py <slug>                  跑全套
    python tools/make_audio.py <slug> --voice=bf_emma  只跑一个音色
    python tools/make_audio.py <slug> --part=vocab     只跑生词与句式
    python tools/make_audio.py <slug> --n=12           这一趟最多做几段

产出 passages/<slug>/audio.json 与 audio/ 目录：
    正文每句 × 4 音色，带逐词时间轴
    每个生词一条、每条例句一条、每条句式示范一条

── 三条硬规矩，都是踩过坑才写下的 ──

1. 时间轴必须存毫秒。
   reader.js 里是 audioEl.currentTime * 1000 去比对的，
   存成秒的话逐词跟读一格不动，而页面一个错都不报。

2. MV.voices 必须是 [{id, label}]。
   写成字符串数组的话 hvInit() 里 v.id 取不到，
   整套朗读放不出声，同样不报错。

3. 峰值超过 0.95 就归一。
   否则重读处会削波，听感上是轻微失真。

── 断点续跑 ──

容器内存有限，一次跑完几百段会被系统杀掉。
所以每次启动先读 audio.json 跳过已完成的，每 8 段存一次盘。
反复跑同一条命令就能推进，不会重做。
"""
import importlib.util
import io
import json
import os
import re
import subprocess
import sys

import numpy as np
import soundfile as sf
from kokoro_onnx import Kokoro

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PASS = os.path.join(ROOT, 'passages')
MODELS = os.path.join(ROOT, 'models')

VOICES = ['bf_emma', 'bm_george', 'af_heart', 'am_michael']
LABELS = {
    'bf_emma':    'Emma \u00b7 \u82f1\u97f3\u5973\u58f0',
    'bm_george':  'George \u00b7 \u82f1\u97f3\u7537\u58f0',
    'af_heart':   'Heart \u00b7 \u7f8e\u97f3\u5973\u58f0',
    'am_michael': 'Michael \u00b7 \u7f8e\u97f3\u7537\u58f0',
}
SR = 24000
LIMIT = [9999]        # --n 限流，防止被内存杀掉


def load(slug):
    p = os.path.join(PASS, slug, 'content.py')
    spec = importlib.util.spec_from_file_location('a_' + slug, p)
    m = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(m)
    return m


def clean(en):
    """去掉 [[ ]] 标记，留下要朗读的文字"""
    return re.sub(r'\s+', ' ', re.sub(r'\[\[(.*?)\]\]', r'\1', str(en))).strip()


def encode(wav, path, bitrate='48k'):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    buf = io.BytesIO()
    sf.write(buf, wav, SR, format='WAV')
    r = subprocess.run(
        ['ffmpeg', '-v', 'quiet', '-y', '-i', 'pipe:0',
         '-c:a', 'libopus', '-b:a', bitrate, path],
        input=buf.getvalue(), capture_output=True)
    return r.returncode == 0


def word_times(wav, n):
    """按能量包络切出 n 个词的起点，单位毫秒。

    做法：算短时能量，找出最长的 n-1 个静音段当词界。
    比等分准得多——停顿长的地方自然就是词界。
    """
    hop = 240                       # 10ms 一帧
    frames = len(wav) // hop
    if frames < n * 2 or n < 2:
        dur = len(wav) / SR * 1000
        return [round(i * dur / max(n, 1)) for i in range(n)]
    e = np.array([np.abs(wav[i * hop:(i + 1) * hop]).mean()
                  for i in range(frames)])
    e = np.convolve(e, np.ones(5) / 5, mode='same')     # 平滑，免得被单帧噪声骗
    quiet = e < e.mean() * 0.35
    gaps = []
    i = 0
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
    cuts = sorted(g[0] for g in gaps[:n - 1])
    if len(cuts) < n - 1:                                # 不够就按比例补齐
        extra = [round((i + 1) * frames / n) for i in range(n - 1)]
        cuts = sorted(set(cuts) | set(extra))[:n - 1]
    t = [0] + [c * hop * 1000 // SR for c in cuts]
    for i in range(1, len(t)):                           # 保证严格递增
        if t[i] <= t[i - 1]:
            t[i] = t[i - 1] + 30
    return t[:n]


def synth(k, text, voice, speed=1.0):
    wav, _ = k.create(text, voice=voice, speed=speed, lang='en-us')
    peak = float(np.abs(wav).max()) if len(wav) else 0.0
    if peak > 0.95:                 # 防削波
        wav = wav / peak * 0.95
    return wav


def main():
    if len(sys.argv) < 2:
        print(__doc__)
        return 1
    slug = sys.argv[1]
    only_voice = None
    part = None
    for a in sys.argv[2:]:
        if a.startswith('--voice='):
            only_voice = a.split('=', 1)[1]
        elif a.startswith('--part='):
            part = a.split('=', 1)[1]
        elif a.startswith('--n='):
            LIMIT[0] = int(a.split('=', 1)[1])

    m = load(slug)
    base = os.path.join(PASS, slug)
    out = os.path.join(base, 'audio.json')
    k = Kokoro(os.path.join(MODELS, 'kokoro-v1.0.onnx'),
               os.path.join(MODELS, 'voices-v1.0.bin'))

    sents = [(f'{L}{i}', clean(en))
             for L, ss in m.PASSAGE for i, (en, _) in enumerate(ss, 1)]
    print(f'  \u6b63\u6587 {len(sents)} \u53e5 \u00d7 {len(VOICES)} '
          f'\u97f3\u8272 = {len(sents) * len(VOICES)} \u6bb5')

    # 断点续跑：读回已完成的部分
    if os.path.isfile(out):
        old = json.load(open(out, encoding='utf-8'))
        MV, AUDIO = old['MV'], old.get('AUDIO_DATA', {})
    else:
        MV = {'voices': [{'id': v, 'label': LABELS[v]} for v in VOICES],
              'audio': {}}
        AUDIO = {}

    todo = [] if part == 'vocab' else ([only_voice] if only_voice else VOICES)
    for v in todo:
        MV['audio'].setdefault(v, {})
        done = 0
        for key, text in sents:
            if key in MV['audio'][v]:
                continue
            if done >= LIMIT[0]:
                break
            done += 1
            wav = synth(k, text, v)
            rel = f'audio/{v}/{key}.opus'
            encode(wav, os.path.join(base, rel))
            MV['audio'][v][key] = {'a': rel,
                                   't': word_times(wav, len(text.split()))}
            if done % 8 == 0:       # 每 8 段存一次，被打断也不白跑
                json.dump({'MV': MV, 'AUDIO_DATA': AUDIO},
                          open(out, 'w', encoding='utf-8'), ensure_ascii=False)
        print(f'    {v}: {len(MV["audio"][v])}/{len(sents)}')

    if part not in (None, 'vocab'):
        json.dump({'MV': MV, 'AUDIO_DATA': AUDIO},
                  open(out, 'w', encoding='utf-8'), ensure_ascii=False)
        print(f'  \u5df2\u5b58\u76d8')
        return 0

    made = 0
    n = 0
    for L, dd in m.VOCAB.items():
        for sn, items in dd.items():
            for it in items:
                n += 1
                for tag, txt in [('w', it[0]), ('x', it[4])]:
                    if f'{tag}{n}' in AUDIO or made >= LIMIT[0]:
                        continue
                    wav = synth(k, txt, 'af_heart')
                    rel = f'audio/vocab/{tag}{n}.opus'
                    encode(wav, os.path.join(base, rel))
                    AUDIO[f'{tag}{n}'] = rel
                    made += 1
                    if made % 12 == 0:
                        json.dump({'MV': MV, 'AUDIO_DATA': AUDIO},
                                  open(out, 'w', encoding='utf-8'),
                                  ensure_ascii=False)
    print(f'  \u751f\u8bcd {n} \u4e2a\uff08\u8bcd + \u4f8b\u53e5\u5171 '
          f'{n * 2} \u6bb5\uff09')

    p = 0
    for L, items in m.PATTERNS.items():
        for t in items:
            p += 1
            if f'p{p}' in AUDIO or made >= LIMIT[0]:
                continue
            wav = synth(k, t[4], 'bm_george')
            rel = f'audio/pat/p{p}.opus'
            encode(wav, os.path.join(base, rel))
            AUDIO[f'p{p}'] = rel
            made += 1
            if made % 12 == 0:
                json.dump({'MV': MV, 'AUDIO_DATA': AUDIO},
                          open(out, 'w', encoding='utf-8'), ensure_ascii=False)
    print(f'  \u53e5\u5f0f\u793a\u8303 {p} \u6bb5')

    json.dump({'MV': MV, 'AUDIO_DATA': AUDIO},
              open(out, 'w', encoding='utf-8'), ensure_ascii=False)
    total = sum(len(x) for x in MV['audio'].values()) + len(AUDIO)
    print(f'  \u5408\u8ba1 {total} \u6bb5 \u2192 audio.json')
    return 0


if __name__ == '__main__':
    sys.exit(main())
