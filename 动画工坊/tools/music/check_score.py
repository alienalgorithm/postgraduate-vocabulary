#!/usr/bin/env python3
"""配乐成品检查：只查声音本身。不通过就以 1 退出（质量问题才卡流程）。

用法：python3 check_score.py score.wav [--ref 原曲] [--lufs -14] [--tol 0.5] [--tp -1.0] [--edge 2.0] [--json 结果.json]
检查项（每项都有坏样本，selftest.sh 逐条跑）：
  格式     48000 Hz、立体声
  响度     积分响度在 目标 ± tol LUFS 以内（ffmpeg ebur128）
  真峰值   不超过 tp dBTP（ffmpeg ebur128 peak=true）
  削波     满幅采样（|x| >= 0.9999）个数为 0
  静音     开头和结尾 edge 秒以外，没有低于 -60 dBFS 的 0.5 秒窗口（片中不许掉成无声）
  咔哒     6 kHz 以上 2 ms 能量高出周围 0.5 秒中位数的最大值，不许比原曲自己的最大值高 1 dB 以上（剪辑不许新增咔哒）。
           要给 --ref 原曲才查：不同曲子自己的尖峰从 11 dB（Cornfield Chase）到 50 dB（带鼓的曲子）都有，
           没有原曲做参照就定不出不误报的门限，所以没给 --ref 时这项写“跳过”，不算不通过
  直流     每声道均值绝对值 < 0.001
"""
import argparse
import json
import os
import sys

import numpy as np
import scipy.signal as ss
import soundfile as sf

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import scorelib as L  # noqa: E402


def hf_spike_max(x, sr):
    m = x.mean(1)
    h = ss.sosfilt(ss.butter(6, 6000, 'high', fs=sr, output='sos'), m)
    n = int(0.002 * sr); nb = len(h) // n
    e = 10 * np.log10((h[:nb * n].reshape(nb, n) ** 2).mean(1) + 1e-20)
    med = ss.medfilt(e, 251)
    d = e - med
    ok = e > -100
    i = int(np.argmax(np.where(ok, d, -999)))
    return float(d[i]), round(i * 0.002, 3)


def silent_windows(x, sr, edge):
    p = (x ** 2).mean(1); c = np.cumsum(np.r_[0, p]); w = sr // 2; hop = sr // 10
    total = len(p) / sr
    out = []
    for i in range(0, len(p) - w, hop):
        t = i / sr
        if t < edge or t + 0.5 > total - edge: continue
        if 10 * np.log10((c[i + w] - c[i]) / w + 1e-20) < -60: out.append(round(t, 1))
    return out


def check(path, ref=None, lufs=-14.0, tol=0.5, tp=-1.0, edge=2.0):
    R = []
    info = sf.info(path)
    R.append(('格式', info.samplerate == 48000 and info.channels == 2, f'{info.samplerate} Hz，{info.channels} 声道，{info.subtype}'))
    x, sr = sf.read(path, dtype='float64', always_2d=True)
    I, LRA, TP = L.ebur(path)
    R.append(('响度', abs(I - lufs) <= tol, f'{I} LUFS（目标 {lufs} ± {tol}），LRA {LRA} LU'))
    R.append(('真峰值', TP <= tp, f'{TP} dBTP（上限 {tp}）'))
    clip = int((np.abs(x) >= 0.9999).sum())
    R.append(('削波', clip == 0, f'{clip} 个满幅采样'))
    sil = silent_windows(x, sr, edge)
    R.append(('静音', not sil, f'片中低于 -60 dBFS 的 0.5 秒窗口 {len(sil)} 个' + (f'，第一个在 {sil[0]} 秒' if sil else '')))
    hmax, ht = hf_spike_max(x, sr)
    if ref:
        xr = L.decode(ref, sr)
        rmax, _ = hf_spike_max(xr, sr)
        R.append(('咔哒', hmax <= rmax + 1.0, f'高频尖峰最大 {hmax:.1f} dB（{ht} 秒），原曲自己 {rmax:.1f} dB'))
    else:
        R.append(('咔哒', True, f'跳过（没给 --ref 原曲）；高频尖峰最大 {hmax:.1f} dB（{ht} 秒）'))
    dc = [float(v) for v in x.mean(0)]
    R.append(('直流', max(abs(v) for v in dc) < 1e-3, '均值 ' + ', '.join(f'{v:.2e}' for v in dc)))
    return R


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument('score')
    ap.add_argument('--ref')
    ap.add_argument('--lufs', type=float, default=-14.0)
    ap.add_argument('--tol', type=float, default=0.5)
    ap.add_argument('--tp', type=float, default=-1.0)
    ap.add_argument('--edge', type=float, default=2.0)
    ap.add_argument('--json')
    a = ap.parse_args()
    R = check(a.score, a.ref, a.lufs, a.tol, a.tp, a.edge)
    bad = [r for r in R if not r[1]]
    for name, ok, msg in R:
        print(f'  {"通过" if ok else "不通过"}  {name}：{msg}')
    print(f'{a.score}：' + ('全部通过' if not bad else '不通过：' + '、'.join(r[0] for r in bad)))
    if a.json:
        json.dump([dict(check=n, ok=bool(o), detail=m) for n, o, m in R], open(a.json, 'w'), ensure_ascii=False, indent=1)
    return 1 if bad else 0


if __name__ == '__main__':
    sys.exit(main())
