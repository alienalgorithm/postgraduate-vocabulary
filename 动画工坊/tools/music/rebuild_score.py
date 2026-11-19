#!/usr/bin/env python3
"""从原曲和剪辑方案重建配乐 score.wav（只在小节线剪，等功率交叉淡化，宏观增益，-14 LUFS，真峰值限幅，24 bit 抖动）。

用法：
  python3 rebuild_score.py --source 原曲.mp3 --plan 作品/<片名>/music/edit_plan.json --out score.wav
         [--info edit_info.json]   写出剪辑后的小节表、接口、母带数据（做 map.json 用）
         [--compare 参考.wav]      和参考逐样本对比，打印最大差值（dB）

本片原曲是加密的：先 export MUSIC_KEY=...，再
  openssl enc -d -aes-256-cbc -pbkdf2 -iter 200000 -salt -pass env:MUSIC_KEY \
      -in 作品/如何真正学好英语/music/private/source_cornfield_chase.mp3.enc -out /tmp/cc.mp3
退出码：0 成功；1 参数或输入错误；2 加了 --compare 且不一致。
"""
import argparse
import json
import os
import sys
import time

import numpy as np
import soundfile as sf

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import scorelib as L  # noqa: E402


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument('--source', required=True)
    ap.add_argument('--plan', required=True)
    ap.add_argument('--out', required=True)
    ap.add_argument('--info')
    ap.add_argument('--compare')
    a = ap.parse_args()
    t0 = time.time()
    plan = json.load(open(a.plan))
    want = plan.get('source', {}).get('sha256')
    got = L.sha256_file(a.source)
    if want and want != got:
        print(f'提醒：原曲 sha256 {got[:12]}… 和方案里的 {want[:12]}… 不同，结果不会和原片逐样本一致', flush=True)
    print(f'解码 {a.source} ...', flush=True)
    x = L.decode(a.source, plan.get('master', {}).get('sample_rate', L.SR))
    grid = L.Grid(plan['grid'])
    edit = plan['edit']
    y, info = L.render(edit, x, grid)
    print(f'剪辑：{len(edit["segments"])} 段，{len(info["junctions"])} 个接口，{info["total"]:.3f} 秒', flush=True)
    for j in info['junctions']:
        print(f'  J{j["k"]} 输出 {j["t"]:.3f}：原曲小节线 {j["out_bar"]} -> {j["in_bar"]}，淡化 {j["xf_len"] * 1000:.0f} ms {j["place"]}，rho {j["rho"]}')
    zq, meta = L.master(y, plan.get('master', {}), edit.get('macro_db'))
    os.makedirs(os.path.dirname(os.path.abspath(a.out)), exist_ok=True)
    sf.write(a.out, zq, L.SR, subtype='PCM_24')
    I, LRA, TP = L.ebur(a.out)
    meta['ffmpeg'] = dict(I=I, LRA=LRA, TP=TP)
    meta['sha256'] = L.sha256_file(a.out)
    print(f'写出 {a.out}：{meta["total_s"]:.3f} 秒，{I} LUFS，真峰值 {TP} dBTP，LRA {LRA} LU，用时 {time.time() - t0:.0f} 秒')
    exp = plan.get('expected', {})
    if exp.get('score_wav_sha256'):
        same = exp['score_wav_sha256'] == meta['sha256']
        print('sha256 和方案记录的成品' + ('一致（逐字节相同）' if same else '不同'))
    if a.info:
        info['spec'] = edit
        info['master'] = meta
        json.dump(info, open(a.info, 'w'), indent=1, ensure_ascii=False)
    if a.compare:
        r = L.compare(a.out, a.compare)
        if r.get('identical'):
            print(f'逐样本对比：和 {a.compare} 完全一致（{r["frames"][0]} 帧，0 个样本不同）')
        else:
            print('逐样本对比：不一致 ' + json.dumps(r, ensure_ascii=False))
            return 2
    return 0


if __name__ == '__main__':
    sys.exit(main())
