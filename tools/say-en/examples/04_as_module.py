#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""当模块用：合成一篇、算时间轴、逐个质检。"""
import json
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.dirname(HERE))
import say

lines = [l.strip() for l in
         open(os.path.join(HERE, 'passage.txt'), encoding='utf-8') if l.strip()]

k = say._load_model(os.path.join(os.path.dirname(HERE), 'models'))
out = os.path.join(HERE, 'out')
os.makedirs(out, exist_ok=True)

timeline = {}
bad = 0
for i, line in enumerate(lines, 1):
    wav = say.synth(k, line, voice='bf_emma')
    name = f'mod_{i:03d}.opus'
    say.write(wav, os.path.join(out, name))

    info = say.inspect(os.path.join(out, name))
    mark = '✓' if info['ok'] else '✗'
    if not info['ok']:
        bad += 1
    print(f'  {mark} {name}  {info["dur"]:5.2f}s  峰值 {info["peak"]:.3f}')

    timeline[name] = {'text': line,
                      'ms': say.word_times(wav, len(line.split()))}

json.dump(timeline, open(os.path.join(out, 'mod_timeline.json'),
                         'w', encoding='utf-8'), ensure_ascii=False, indent=1)
print(f'\n  合成 {len(lines)} 段，{bad} 段有问题')
