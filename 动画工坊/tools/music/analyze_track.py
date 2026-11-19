#!/usr/bin/env python3
"""分析任意一首曲子，给选曲和剪辑用：速度、拍点、拍号、小节线、段落、能量曲线、调性、循环和跳转候选。

用法：
  python3 analyze_track.py 曲子.mp3 --out 输出目录 [--bpm 96] [--meter 3] [--title 名字] [--png]
输出：
  analysis.json  全部数字（bpm、beats、bars、sections、climax、burst、stops、loops、skips、key）
  energy.json    能量曲线，格式和引擎读的 music/energy.json 一样（fps 60，values、slow、hits、hit_strength、events）
  analysis.md    中文分析草稿：先看它，再用耳朵和频谱图确认，然后写剪辑方案
  overview.png   （加 --png）响度曲线、小节线、段落、高潮
时间轴：0 = 解码到 48 kHz 后的第一个采样（和 rebuild_score.py 用的同一个时间轴）。
对成品 score.wav 跑一次，得到的 energy.json 可以直接给引擎用。
"""
import argparse
import json
import os
import sys
import warnings

import numpy as np

warnings.filterwarnings('ignore')
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import scorelib as L  # noqa: E402

SR = L.SR
KEYS = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
MAJ = np.array([6.35, 2.23, 3.48, 2.33, 4.38, 4.09, 2.52, 5.19, 2.39, 3.66, 2.29, 2.88])
MIN = np.array([6.33, 2.68, 3.52, 5.38, 2.60, 3.53, 2.54, 4.75, 3.98, 2.69, 3.34, 3.17])


def loud_curve(x, fps, win):
    """K 加权响度（LUFS），每 1/fps 秒一帧，窗口 win 秒，居中。"""
    k = L.kweight(x); p = (k ** 2).sum(1)
    c = np.cumsum(np.r_[0, p])
    n = len(p); total = n / SR
    ts = np.arange(int(np.ceil(total * fps))) / fps
    a = np.clip(((ts - win / 2) * SR).astype(int), 0, n); b = np.clip(a + int(win * SR), 0, n)
    v = np.where(b - a >= 16, (c[b] - c[a]) / np.maximum(b - a, 1), 0.0)
    return ts, -0.691 + 10 * np.log10(v + 1e-20)


def cos(a, b):
    return float(a @ b / (np.linalg.norm(a) * np.linalg.norm(b) + 1e-12))


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument('track')
    ap.add_argument('--out', required=True)
    ap.add_argument('--bpm', type=float, help='已知速度（可选，帮助跟拍）')
    ap.add_argument('--meter', type=int, choices=[2, 3, 4], help='已知拍号每小节拍数（可选）')
    ap.add_argument('--title')
    ap.add_argument('--png', action='store_true')
    a = ap.parse_args()
    import librosa
    os.makedirs(a.out, exist_ok=True)
    title = a.title or os.path.splitext(os.path.basename(a.track))[0]
    x = L.decode(a.track)
    dur = len(x) / SR
    # ---------------- 跟拍（22050 Hz 单声道）
    sr = 22050; hop = 256
    y = librosa.resample(x.mean(1), orig_sr=SR, target_sr=sr, res_type='soxr_hq').astype(np.float32)
    oenv = librosa.onset.onset_strength(y=y, sr=sr, hop_length=hop, aggregate=np.median)
    tempo, bfr = librosa.beat.beat_track(onset_envelope=oenv, sr=sr, hop_length=hop, start_bpm=a.bpm or 120.0,
                                         tightness=400 if a.bpm else 100, trim=False)
    tb = librosa.frames_to_time(bfr, sr=sr, hop_length=hop)
    bpm_tracker = float(np.atleast_1d(tempo)[0])
    # 恒速拍网格：候选速度（速度图峰值 + 跟拍结果，或 --bpm）逐个细调周期和相位，看拍点落在起音上有多准
    tf = librosa.times_like(oenv, sr=sr, hop_length=hop)
    osm = np.maximum.reduce([np.roll(oenv, s_) for s_ in (-1, 0, 1)]) / (oenv.mean() + 1e-9)
    def gscore(Tp, ph):
        pos = ph + Tp * np.arange(int((dur - ph) / Tp) + 1)
        return float(np.interp(pos, tf, osm).mean())
    def refine(b0, span=0.01):
        best = (-1, 0, 0)
        for Tp in 60.0 / b0 * (1 + np.linspace(-span, span, 41)):
            for ph in np.linspace(0, Tp, 48, endpoint=False):
                sc = gscore(Tp, ph)
                if sc > best[0]: best = (sc, Tp, ph)
        return best
    if a.bpm:
        cand_bpm = [a.bpm]
    else:
        tg = librosa.feature.tempogram(onset_envelope=oenv, sr=sr, hop_length=hop).mean(1)
        tbpm = librosa.tempo_frequencies(len(tg), sr=sr, hop_length=hop)
        ok = (tbpm > 50) & (tbpm < 220)
        pk = [i for i in range(1, len(tg) - 1) if ok[i] and tg[i] >= tg[i - 1] and tg[i] >= tg[i + 1]]
        pk = sorted(pk, key=lambda i: -tg[i])[:5]
        cand_bpm = sorted(set([round(float(tbpm[i]), 1) for i in pk] + [round(bpm_tracker, 1)]))
    tempo_cands = []
    for b0 in cand_bpm:
        sc, Tp, ph = refine(b0, 0.002 if a.bpm else 0.01)
        sc, Tp, ph = refine(60.0 / Tp, 0.0005)
        prior = np.exp(-0.5 * np.log2(60 / Tp / 110) ** 2)
        tempo_cands.append(dict(bpm=round(60 / Tp, 3), onset_fit=round(sc, 3), score=round(sc * prior, 3), T=Tp, phase=ph))
    tempo_cands.sort(key=lambda d: -d['score'])
    bestc = tempo_cands[0]
    T2, phi = bestc['T'], bestc['phase']
    steady = bestc['onset_fit'] >= 1.15
    resid_ms = float('nan')
    if len(tb) > 4:
        g = phi + T2 * np.round((tb - phi) / T2)
        resid_ms = float(np.median(np.abs(tb - g)) * 1000)
    if steady:
        beats = phi + T2 * np.arange(int((dur - phi) / T2) + 1)
        bpm = 60.0 / T2
    else:
        beats = tb; bpm = bpm_tracker
    for d in tempo_cands:
        d.pop('T'); d.pop('phase')
    beats = np.asarray(beats)
    # ---------------- 拍同步特征
    ch = librosa.feature.chroma_cqt(y=y, sr=sr, hop_length=hop)
    S = np.abs(librosa.stft(y, hop_length=hop))
    mf = librosa.feature.mfcc(S=librosa.power_to_db(librosa.feature.melspectrogram(S=S ** 2, sr=sr)), n_mfcc=13)
    fb = librosa.time_to_frames(beats, sr=sr, hop_length=hop)
    fb = np.clip(fb, 0, ch.shape[1] - 1)
    bounds = np.r_[fb, ch.shape[1]]
    def bsync(F):
        return np.stack([F[:, bounds[i]:max(bounds[i] + 1, bounds[i + 1])].mean(1) for i in range(len(fb))], 1)
    chb = bsync(ch); chb = chb / (np.linalg.norm(chb, axis=0, keepdims=True) + 1e-9)
    onb = np.array([oenv[bounds[i]:max(bounds[i] + 1, bounds[i + 1])].max() for i in range(len(fb))])
    hnov = np.r_[0, 1 - (chb[:, 1:] * chb[:, :-1]).sum(0)]            # 和声变化（每拍）
    acc = onb / (np.median(onb) + 1e-9)
    # ---------------- 拍号和强拍位置
    def phase_scores(m, lo=0, hi=None):
        hi = len(beats) if hi is None else hi
        idx = np.arange(lo, hi)
        mh = hnov[idx].mean() + 1e-9; ma = acc[idx].mean() + 1e-9
        return np.array([hnov[idx][(idx % m) == p].mean() / mh + 0.5 * acc[idx][(idx % m) == p].mean() / ma
                         if ((idx % m) == p).any() else 0 for p in range(m)])
    meter_scores = {m: float(phase_scores(m).max()) for m in (2, 3, 4)}
    if a.meter:
        m = a.meter
    else:
        m = max(meter_scores, key=meter_scores.get)
        if m == 2 and meter_scores[4] >= 0.95 * meter_scores[2]:
            m = 4
    gp = int(np.argmax(phase_scores(m)))
    # 分段找强拍相位（8 小节窗口）：和全曲相位不同的地方可能有不规则小节（比如少一拍），只提示，不改小节线
    W = 8 * m
    phase = np.full(len(beats), gp)
    odd = []
    for c0 in range(0, len(beats), m):
        lo, hi = max(0, c0 - W // 2), min(len(beats), c0 + W // 2)
        sc = phase_scores(m, lo, hi)
        o = np.sort(sc)
        if int(np.argmax(sc)) != gp and (o[-1] - o[-2]) / (o[-1] + 1e-9) > 0.25:
            t_ = float(beats[c0])
            if odd and t_ - odd[-1][1] < 4 * 60.0 / bpm * m: odd[-1][1] = t_
            else: odd.append([t_, t_])
    phase_hints = [[round(u, 1), round(v, 1)] for u, v in odd if v - u >= 2 * m * 60.0 / bpm]
    down = [i for i in range(len(beats)) if (i - phase[i]) % m == 0]
    if down and down[0] > 0:
        down = [0] + down if beats[down[0]] - beats[0] > 0.5 * (60.0 / bpm) else down
    bar_lines = [float(beats[i]) for i in down]
    # ---------------- 响度曲线和每小节数据
    fps = 60
    ts, fast = loud_curve(x, fps, 0.1)
    _, mom = loud_curve(x, fps, 0.4)
    _, slow = loud_curve(x, fps, 3.0)
    def mean_lufs(t0, t1, curve=mom):
        m_ = (ts >= t0) & (ts < t1)
        return float(10 * np.log10(np.mean(10 ** (curve[m_] / 10)) + 1e-20)) if m_.any() else -120.0
    edges = bar_lines + [dur]
    bars = []
    feats = []
    for i in range(len(bar_lines)):
        t0, t1 = edges[i], edges[i + 1]
        bi = [j for j in range(len(beats)) if t0 - 1e-6 <= beats[j] < t1 - 1e-6]
        f0, f1 = librosa.time_to_frames([t0, t1], sr=sr, hop_length=hop)
        f1 = max(f1, f0 + 1)
        c = ch[:, f0:f1].mean(1); c = c / (np.linalg.norm(c) + 1e-9)
        mm = mf[:, f0:f1].mean(1)
        lu = mean_lufs(t0, t1)
        feats.append(np.r_[c, mm, lu])
        bars.append(dict(n=i + 1, start=round(t0, 3), beats=len(bi), lufs=round(lu, 1),
                         chord=KEYS[int(np.argmax(c))]))
    F = np.array(feats)
    Fz = (F - F.mean(0)) / (F.std(0) + 1e-9)
    Fz[:, :12] *= 1.5                                                    # 和声权重高一些
    nov = [0.0] + [float(np.linalg.norm(Fz[i] - Fz[i - 1])) for i in range(1, len(Fz))]
    nn = np.array(nov) / (np.percentile(nov, 90) + 1e-9)
    for b, v in zip(bars, nn):
        b['novelty'] = round(float(v), 2)
    irregular = [b for b in bars[:-1] if b['beats'] != m]
    # ---------------- 段落（按小节聚类，边界在小节线上）
    nsec = int(np.clip(round(dur / 20), 3, 12))
    nsec = min(nsec, max(1, len(bars) // 2))
    lab = librosa.segment.agglomerative(Fz.T, nsec) if len(bars) > 3 else [0]
    sb = sorted(set([0] + [int(v) for v in lab]))
    sections = []
    for si, s0 in enumerate(sb):
        s1 = sb[si + 1] if si + 1 < len(sb) else len(bars)
        t0 = bars[s0]['start'] if s0 > 0 else 0.0
        t1 = bars[s1]['start'] if s1 < len(bars) else dur
        sections.append(dict(name=f'S{si + 1}', bars=[s0 + 1, s1], start=round(t0, 3), end=round(t1, 3),
                             lufs=round(mean_lufs(t0, t1), 1)))
    # ---------------- 能量曲线（和引擎用的 energy.json 同一个算法）
    LO = -40.0; HI = float(np.percentile(fast, 99.5)); G = 1.6
    def mapv(d): return np.clip((d - LO) / (HI - LO), 0, 1) ** G
    v = mapv(fast)
    rel = np.exp(-1 / (fps * 0.2)); out = np.empty_like(v); prev = 0.0
    for i, xv in enumerate(v):
        prev = xv if xv > prev else rel * prev + (1 - rel) * xv
        out[i] = prev
    vs = mapv(slow)
    # 高潮：3 秒响度最高处（去掉头尾 5%），落到最近的小节线；爆发：4 秒内响度涨得最多
    msk = (ts > dur * 0.05) & (ts < dur * 0.97)
    ci = int(np.argmax(np.where(msk, slow, -999)))
    climax_peak = float(ts[ci])
    best_bar = max(range(len(bars)), key=lambda i: (bars[i]['lufs'] if 0.05 * dur < bars[i]['start'] < 0.97 * dur else -999))
    climax = bars[best_bar]['start']
    lag = 4 * fps
    rise = np.full(len(slow), -99.0); rise[lag:] = slow[lag:] - slow[:-lag]
    rise[:min(len(rise), 8 * fps)] = -99
    ri = int(np.argmax(rise))
    # 在这段上升里找 0.5 秒内跳得最多的地方，取跳到 60% 的那一帧，离小节线 0.3 秒以内就落到小节线上
    h = fps // 2
    lo_, hi_ = max(0, ri - 4 * fps), min(len(fast) - h - 1, ri + fps)
    jumps = [fast[i + h] - fast[i] for i in range(lo_, hi_)]
    i0 = lo_ + int(np.argmax(jumps))
    target = fast[i0] + 0.6 * max(jumps)
    i1 = i0
    while i1 < i0 + h and fast[i1] < target: i1 += 1
    burst_t = float(ts[i1])
    near = min(bar_lines, key=lambda t: abs(t - burst_t)) if bar_lines else burst_t
    burst = near if abs(near - burst_t) < 0.3 else burst_t
    burst_db = float(rise[ri])
    # 急停：前 1 秒很响（> -20 LUFS），之后 0.5 到 2.5 秒最多也比前面低 10 dB 以上（混响尾音也算停）；时间取开始往下掉的那一帧
    stops = []
    for i in range(fps, len(fast) - int(2.5 * fps)):
        before = float(np.mean(fast[i - fps:i]))
        if before > -20 and before - fast[i + fps // 2:i + int(2.5 * fps)].max() > 10 and (not stops or ts[i] - stops[-1] > 3):
            k_ = i - fps
            while k_ < i + 2 * fps and fast[k_] > before - 6: k_ += 1
            j = k_
            while j > i - fps and fast[j - 1] < before - 1.5: j -= 1
            stops.append(round(float(ts[j]), 3))
    # hits：段落开头和高新颖度小节（强度跟慢能量走），加上爆发、高潮
    hits = {}
    for b in bars:
        if b['n'] > 1 and b['novelty'] > 1.0:
            e = float(vs[min(len(vs) - 1, int(b['start'] * fps))])
            hits[round(b['start'], 3)] = round(0.2 + 0.45 * e, 3)
    events = []
    for s in sections[1:]:
        hits[round(s['start'], 3)] = max(hits.get(round(s['start'], 3), 0), 0.5)
        events.append(dict(t=s['start'], strength=0.5, name=f'section {s["name"]}'))
    hits[round(burst, 3)] = 1.0; events.append(dict(t=round(burst, 3), strength=1.0, name='BURST (biggest 4-s rise)'))
    hits[round(climax, 3)] = 1.0; events.append(dict(t=round(climax, 3), strength=1.0, name='CLIMAX (loudest bar)'))
    for s in stops:
        hits.pop(round(s, 3), None)
        events.append(dict(t=s, strength=1.0, name='HARD STOP', kind='stop'))
    events.sort(key=lambda e: e['t'])
    ht = sorted(hits)
    energy = dict(fps=fps, duration=round(dur, 3), frames=len(out),
                  scale=f'values[i] = K-weighted loudness (100 ms window) mapped as ((LUFS - ({LO})) / ({HI:.2f} - ({LO})))^{G}, clipped to 0..1, '
                        'instant attack and 0.2 s release; slow[i] = same mapping of the 3-s short-term loudness',
                  values=[round(float(q), 4) for q in out], slow=[round(float(q), 4) for q in vs],
                  hits=ht, hit_strength=[hits[t] for t in ht], events=events,
                  climax=round(climax, 3), burst=round(burst, 3), stop=(stops[0] if stops else None),
                  notes='analyze_track.py: hits = bar lines with high novelty (strength 0.2 to 0.65 follows the slow energy), section starts 0.5, '
                        'burst and climax 1.0; hard stops only in events (kind "stop").')
    # ---------------- 调性
    cm = ch.mean(1)
    kc = sorted([(float(np.corrcoef(np.roll(P, r), cm)[0, 1]), f'{KEYS[r]} {nm}') for r in range(12) for P, nm in ((MAJ, '大调'), (MIN, '小调'))],
                reverse=True)[:3]
    # ---------------- 循环（往回跳）和跳转（往前跳）候选：跳转两边的上下文要像
    def lvl(i): return bars[i]['lufs']
    cands = []
    nb = len(bars)
    for i in range(1, nb):
        for j in range(1, nb):
            if i == j or abs(i - j) < 2: continue
            s = 0.5 * (cos(Fz[i - 1], Fz[j - 1]) + cos(Fz[i], Fz[j]))
            dl = abs(lvl(i) - lvl(j)) + abs(lvl(i - 1) - lvl(j - 1))
            score = s - 0.05 * dl
            cands.append((score, i, j, s, dl))
    cands.sort(reverse=True)
    def pick(back, nmax=10):
        res = []; used = set()
        for score, i, j, s, dl in cands:
            if (j < i) != back: continue
            key = (i // 2, j // 2)
            if key in used: continue
            used.add(key)
            res.append(dict(out_line_bar=i + 1, in_line_bar=j + 1, out_t=bars[i]['start'], in_t=bars[j]['start'],
                            length_bars=abs(i - j), length_s=round(abs(bars[i]['start'] - bars[j]['start']), 3),
                            similarity=round(s, 3), level_diff_db=round(dl, 1), score=round(score, 3)))
            if len(res) >= nmax: break
        return res
    loops, skips = pick(True), pick(False)
    R = dict(title=title, file=os.path.basename(a.track), sha256=L.sha256_file(a.track), duration=round(dur, 3),
             integrated_lufs=round(L.integrated(x), 1), bpm=round(bpm, 3), bpm_tracker=round(bpm_tracker, 2), tempo_candidates=tempo_cands,
             steady_tempo=bool(steady), grid_residual_ms=round(resid_ms, 1), beat=round(60 / bpm, 4), meter=f'{m}/4',
             meter_scores={str(k_): round(v_, 2) for k_, v_ in meter_scores.items()}, beats_per_bar=m,
             beat_offset=round(float(beats[0]), 3) if len(beats) else 0.0, beats=[round(float(b), 3) for b in beats],
             bars=bars, irregular_bars=[dict(n=b['n'], start=b['start'], beats=b['beats']) for b in irregular], phase_hints=phase_hints,
             sections=sections, climax=round(climax, 3), climax_peak_3s=round(climax_peak, 2), burst=round(burst, 3),
             burst_rise_db=round(burst_db, 1), stops=stops, key_candidates=[dict(key=k_, corr=round(c_, 2)) for c_, k_ in kc],
             loops=loops, skips=skips)
    json.dump(R, open(os.path.join(a.out, 'analysis.json'), 'w'), ensure_ascii=False, indent=1)
    json.dump(energy, open(os.path.join(a.out, 'energy.json'), 'w'), separators=(',', ':'))
    write_md(R, os.path.join(a.out, 'analysis.md'))
    if a.png:
        plot(R, ts, mom, slow, os.path.join(a.out, 'overview.png'))
    print(f'{title}：{dur:.1f} 秒，{bpm:.2f} BPM（跟拍 {bpm_tracker:.1f}），{m}/4，{len(bars)} 小节，{len(sections)} 段，'
          f'高潮 {climax:.2f} 秒，爆发 {burst:.2f} 秒（+{burst_db:.1f} dB），急停 {stops}，调性 {kc[0][1]}')
    print(f'写出 {a.out}/analysis.json、energy.json、analysis.md' + ('、overview.png' if a.png else ''))


def write_md(R, path):
    w = []
    w.append(f'# {R["title"]}：结构分析草稿\n')
    w.append('本文由 analyze_track.py 自动生成，是草稿：数字是测出来的，段落名字、乐器、情绪要用耳朵和频谱图确认后再改。'
             '时间以解码到 48 kHz 后的第一个采样为 0。\n')
    w.append('## 1. 基本数据\n')
    w.append('| 项目 | 结果 |\n|---|---|')
    w.append(f'| 文件 | {R["file"]}（sha256 {R["sha256"][:16]}…），{R["duration"]} 秒，积分响度 {R["integrated_lufs"]} LUFS |')
    w.append(f'| 速度 | {R["bpm"]} BPM，一拍 {R["beat"]} 秒（跟拍器原始结果 {R["bpm_tracker"]}；'
             + ('恒速，拍网格按起音整体拟合，和跟拍器拍点的中位偏差 %s ms' % R['grid_residual_ms'] if R['steady_tempo'] else '不是恒速，拍点用跟拍结果') + '） |')
    w.append('| 速度候选 | ' + '；'.join(f'{d["bpm"]} BPM（起音吻合 {d["onset_fit"]}，总分 {d["score"]}）' for d in R['tempo_candidates'])
             + '。拍子可能差一个倍数（比如 96 和 128、192），不对就用 --bpm 指定再跑 |')
    w.append(f'| 拍号 | {R["meter"]}（各拍号得分 {R["meter_scores"]}；按和声变化和重音的周期判断） |')
    w.append(f'| 第一拍 | {R["beat_offset"]} 秒 |')
    irr = '、'.join(f'第 {b["n"]} 小节（{b["start"]} 秒，{b["beats"]} 拍）' for b in R['irregular_bars']) or '没有'
    hint = '、'.join(f'{u} 到 {v} 秒' for u, v in R['phase_hints'])
    w.append(f'| 弱起和不规则小节 | {irr}。' + (f'强拍相位和全曲不一致的地方：{hint}，这里可能有少一拍或多一拍的小节，小节线要用耳朵和和弦位置复核 |' if hint else '全曲强拍相位一致 |'))
    w.append('| 调性候选 | ' + '，'.join(f'{k["key"]} {k["corr"]}' for k in R['key_candidates']) + '（模板相关；持续音很强时会偏，按低音和和弦再判断） |')
    w.append(f'| 高潮 | {R["climax"]} 秒（全曲最响的小节的小节线；3 秒响度最高点 {R["climax_peak_3s"]} 秒） |')
    w.append(f'| 爆发 | {R["burst"]} 秒（4 秒内响度涨 {R["burst_rise_db"]} dB，已落到最近的小节线） |')
    w.append(f'| 急停 | {"、".join(str(s) for s in R["stops"]) or "没有"} |\n')
    w.append('## 2. 段落\n')
    w.append('| 段 | 小节 | 开始 | 结束 | 响度 LUFS | 听感（待填） |\n|---|---|---|---|---|---|')
    for s in R['sections']:
        w.append(f'| {s["name"]} | {s["bars"][0]}–{s["bars"][1]} | {s["start"]} | {s["end"]} | {s["lufs"]} | |')
    w.append('\n## 3. 循环候选（往回跳，加长）\n')
    w.append('“出点”是离开的小节线，“入点”是接着播放的小节线。相似度是跳转两边上下文（前一小节、后一小节）的特征余弦相似度，电平差是两边响度差之和。'
             '只是候选：用 rebuild_score.py 渲染后看接口频谱图、耳听，确认没有咔哒、没有凹陷、和弦接得上，才能用。\n')
    w.append('| 出点小节 → 入点小节 | 出点时间 → 入点时间 | 长度 | 相似度 | 电平差 dB |\n|---|---|---|---|---|')
    for c in R['loops']:
        w.append(f'| {c["out_line_bar"]} → {c["in_line_bar"]} | {c["out_t"]} → {c["in_t"]} | {c["length_bars"]} 小节，{c["length_s"]} 秒 | {c["similarity"]} | {c["level_diff_db"]} |')
    w.append('\n## 4. 跳转候选（往前跳，缩短）\n')
    w.append('| 出点小节 → 入点小节 | 出点时间 → 入点时间 | 跳过 | 相似度 | 电平差 dB |\n|---|---|---|---|---|')
    for c in R['skips']:
        w.append(f'| {c["out_line_bar"]} → {c["in_line_bar"]} | {c["out_t"]} → {c["in_t"]} | {c["length_bars"]} 小节，{c["length_s"]} 秒 | {c["similarity"]} | {c["level_diff_db"]} |')
    w.append('\n## 5. 小节表\n')
    w.append('“和弦”只是色度最强的音（根音提示），新颖度是和上一小节相比的变化（1 = 第 90 百分位）。\n')
    w.append('| 小节 | 开始 | 拍数 | 响度 LUFS | 最强音 | 新颖度 |\n|---|---|---|---|---|---|')
    for b in R['bars']:
        w.append(f'| {b["n"]} | {b["start"]} | {b["beats"]} | {b["lufs"]} | {b["chord"]} | {b["novelty"]} |')
    w.append('\n## 6. 剪辑提醒\n')
    w.append('- 只在小节线剪；循环长度取整小节，和弦前后要一致；交叉淡化用等功率，安静段落用长淡化（300 到 900 ms），密集段落用短淡化（40 到 160 ms）。')
    w.append('- 不变调；变速不超过 3%。片长由内容决定：先定场景表，再按小节线剪音乐去贴场景。')
    w.append('- 高潮只经过一次，放在全片最重要的那一刻（“恍然大悟”）。')
    w.append('- 草稿里的段落边界、不规则小节、拍号都要用频谱图和耳朵复核一遍。')
    open(path, 'w').write('\n'.join(w) + '\n')


def plot(R, ts, mom, slow, path):
    import matplotlib
    matplotlib.use('Agg')
    import matplotlib.pyplot as plt
    fig, ax = plt.subplots(figsize=(16, 4.5))
    ax.plot(ts, mom, color='#bbb', lw=0.4, label='momentary LUFS')
    ax.plot(ts, slow, color='#c0392b', lw=1.4, label='short-term LUFS (3 s)')
    for b in R['bars']:
        ax.axvline(b['start'], color='#ddd', lw=0.4)
    for s in R['sections']:
        ax.axvline(s['start'], color='#8e44ad', lw=1); ax.text(s['start'] + 0.3, -4, s['name'], fontsize=8, color='#8e44ad')
    ax.axvline(R['climax'], color='orange', lw=2.5, alpha=.7, label=f'climax {R["climax"]}')
    ax.axvline(R['burst'], color='blue', lw=1.5, ls=':', label=f'burst {R["burst"]}')
    ax.set_ylim(-60, 0); ax.set_xlim(0, R['duration']); ax.legend(loc='lower right', fontsize=8)
    ax.set_title(f'{R["file"]}  {R["bpm"]} BPM  {R["meter"]}', fontsize=10)
    plt.tight_layout(); plt.savefig(path, dpi=80); plt.close()


if __name__ == '__main__':
    main()
