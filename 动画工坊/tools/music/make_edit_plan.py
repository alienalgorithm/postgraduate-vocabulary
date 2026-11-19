#!/usr/bin/env python3
"""把剪辑工作文件合成一个自带全部信息的剪辑方案 edit_plan.json（rebuild_score.py 读它）。

用法：
  python3 make_edit_plan.py --map 原曲小节表.json --edit 剪辑.json --score 成品.wav --out edit_plan.json
         [--meta master_meta.json] [--title 标题] [--source-name 曲名] [--source-sha256 原曲sha256]
--map   原曲的小节表（本片是 cc_map.json：bars[n, start, beats, chord, section]、bpm、beat、bar、meter、beat_offset、source）
--edit  剪辑规格（本片是 edit2/final.json：segments、xf、fade_out、fade_in_ms、macro_db）
--score 成品 score.wav：记下它的长度和 sha256，重建时用来核对
输出是确定的：输入不变，输出逐字节不变（不会产生无意义的 git 改动）。
"""
import argparse
import collections
import json
import os
import sys

import soundfile as sf

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import scorelib as L  # noqa: E402

OD = collections.OrderedDict


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument('--map', required=True)
    ap.add_argument('--edit', required=True)
    ap.add_argument('--score', required=True)
    ap.add_argument('--out', required=True)
    ap.add_argument('--meta')
    ap.add_argument('--title')
    ap.add_argument('--source-name')
    ap.add_argument('--source-file')
    ap.add_argument('--source-sha256', default='')
    ap.add_argument('--target-lufs', type=float, default=-14.0)
    ap.add_argument('--ceiling', type=float, default=-1.2)
    ap.add_argument('--seed', type=int, default=20261119)
    a = ap.parse_args()
    cm = json.load(open(a.map))
    ed = json.load(open(a.edit), object_pairs_hook=OD)
    src = cm.get('source', {}) if isinstance(cm.get('source'), dict) else {}
    # 标题、曲名、说明这些手写的字段：命令行没给就沿用已有方案里的
    old = json.load(open(a.out), object_pairs_hook=OD) if os.path.exists(a.out) else {}
    osrc = old.get('source', {})
    a.title = a.title or old.get('title') or '配乐剪辑方案'
    a.source_name = a.source_name or osrc.get('name', '')
    a.source_file = a.source_file or osrc.get('file', '')
    plan = OD()
    plan['title'] = a.title
    plan['note'] = old.get('note') or ('rebuild_score.py 读这个文件，从原曲逐样本重建 score.wav。grid 是原曲的小节表（时间以原曲解码到 48 kHz 后的第一个采样为 0），'
                    'edit 是剪辑（每段原曲小节、每个接口的交叉淡化、段增益、淡入淡出、宏观增益），master 是母带参数，expected 是成品应有的结果。'
                    '剪辑理由见同目录 edit.md，原曲结构见 analysis.md。')
    plan['source'] = OD(name=a.source_name, file=a.source_file, sha256=a.source_sha256 or src.get('sha256', ''),
                        format=osrc.get('format') or src.get('format', ''),
                        decode='ffmpeg 在原采样率解码为 float32，soxr VHQ（float32）重采样到 48 kHz，再转 float64')
    bars = [OD(n=b['n'], start=b['start'], beats=b['beats'], chord=b.get('chord'), section=b.get('section')) for b in cm['bars']]
    plan['grid'] = OD(bpm=cm.get('bpm'), meter=cm.get('meter'), beat=cm['beat'], bar=cm['bar'], beat_offset=cm.get('beat_offset'),
                      note=old.get('grid', {}).get('note', ''), tail_chord=old.get('grid', {}).get('tail_chord', 'tail'), bars=bars)
    plan['edit'] = ed
    plan['master'] = OD(target_lufs=a.target_lufs, ceiling_dbtp=a.ceiling, lookahead_ms=4.0, release_ms=100.0, oversample=4,
                        max_iter=6, dither='TPDF', dither_seed=a.seed, bits=24, sample_rate=48000)
    info = sf.info(a.score)
    exp = OD(samples=info.frames, total_s=round(info.frames / info.samplerate, 4))
    if a.meta and os.path.exists(a.meta):
        m = json.load(open(a.meta))
        for k in ('norm_gain_db', 'limiter_max_gr_db'):
            if k in m: exp[k] = m[k]
        if 'ffmpeg' in m:
            exp['integrated_lufs'] = m['ffmpeg'].get('I'); exp['true_peak_dbtp'] = m['ffmpeg'].get('TP'); exp['lra_lu'] = m['ffmpeg'].get('LRA')
    exp['score_wav_sha256'] = L.sha256_file(a.score)
    plan['expected'] = exp
    s = json.dumps(plan, ensure_ascii=False, indent=1) + '\n'
    if os.path.exists(a.out) and open(a.out).read() == s:
        print(f'{a.out} 没变')
    else:
        open(a.out, 'w').write(s)
        print(f'写出 {a.out}')


if __name__ == '__main__':
    main()
