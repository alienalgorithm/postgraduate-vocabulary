#!/usr/bin/env python3
"""配乐工具的共用函数：解码、按小节线剪辑渲染、母带（宏观增益、-14 LUFS、真峰值限幅、TPDF 抖动）、逐样本对比。

数值运算和 2026-11-19《如何真正学好英语》配乐的原始脚本逐行一致
（原始脚本/edit2_py/lib.py、render.py、master.py），同样的输入、同样的库版本（requirements.txt）
得到逐样本相同的 score.wav。改这里的任何运算都会让旧片子重建不再逐样本一致，改之前先跑
rebuild_score.py --compare 看差多少。
"""
import hashlib
import json
import re
import subprocess

import numpy as np
import scipy.signal as ss
import soundfile as sf
from scipy.ndimage import minimum_filter1d

SR = 48000


# ---------------------------------------------------------------- 解码
def probe(path):
    r = subprocess.run(['ffprobe', '-v', 'error', '-select_streams', 'a:0', '-show_entries',
                        'stream=sample_rate,channels', '-of', 'json', path], capture_output=True, text=True, check=True)
    s = json.loads(r.stdout)['streams'][0]
    return int(s['sample_rate']), int(s['channels'])


def decode(path, sr=SR):
    """任意音频 -> (N, 2) float64，采样率 sr。
    做法和原片完全一样：ffmpeg 在原采样率解码成 float32，再用 soxr VHQ（float32）重采样到 48 kHz。
    （analysis.md 里写的 `ffmpeg -ar 48000` 是笔误：那条命令用 ffmpeg 自带重采样，和成片用的源差 2e-4。）"""
    sr0, ch = probe(path)
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', path, '-map', '0:a:0', '-c:a', 'pcm_f32le', '-f', 'f32le', '-'],
                         capture_output=True, check=True).stdout
    x = np.frombuffer(raw, np.float32).reshape(-1, ch).copy()
    if ch == 1:
        x = np.repeat(x, 2, 1)
    elif ch > 2:
        x = x[:, :2].copy()
    if sr0 != sr:
        import soxr
        x = soxr.resample(x, sr0, sr, quality='VHQ')
    return x.astype(np.float64)


def sha256_file(path):
    h = hashlib.sha256()
    with open(path, 'rb') as f:
        for b in iter(lambda: f.read(1 << 20), b''):
            h.update(b)
    return h.hexdigest()


# ---------------------------------------------------------------- 响度（BS.1770，48 kHz 系数）
def kweight(x, sr=SR):
    b1 = [1.53512485958697, -2.69169618940638, 1.19839281085285]
    a1 = [1.0, -1.69065929318241, 0.73248077421585]
    b2 = [1.0, -2.0, 1.0]
    a2 = [1.0, -1.99004745483398, 0.99007225036621]
    y = ss.lfilter(b1, a1, x, axis=0)
    return ss.lfilter(b2, a2, y, axis=0)


def integrated(x, sr=SR):
    k = kweight(x, sr); p = (k ** 2).sum(1)
    n = int(0.4 * sr); h = int(0.1 * sr)
    c = np.cumsum(np.r_[0, p])
    zs = np.array([(c[i + n] - c[i]) / n for i in range(0, len(p) - n, h)])
    l = -0.691 + 10 * np.log10(zs + 1e-20)
    g = zs[l > -70]
    rel = -0.691 + 10 * np.log10(g.mean()) - 10
    g2 = zs[(l > -70) & (l > rel)]
    return -0.691 + 10 * np.log10(g2.mean())


def ebur(path):
    """ffmpeg ebur128：返回 (积分响度 LUFS, 响度范围 LU, 真峰值 dBTP)。"""
    r = subprocess.run(['ffmpeg', '-hide_banner', '-nostats', '-i', path, '-af', 'ebur128=peak=true', '-f', 'null', '-'],
                       capture_output=True, text=True).stderr
    s = r[r.rfind('Summary:'):]
    I = float(re.search(r'I:\s*([-\d.]+) LUFS', s).group(1))
    LRA = float(re.search(r'LRA:\s*([-\d.]+) LU', s).group(1))
    TP = float(re.search(r'Peak:\s*([-\d.]+) dBFS', s).group(1))
    return I, LRA, TP


# ---------------------------------------------------------------- 小节网格
class Grid:
    """剪辑方案里的原曲小节表：bars[n] = {start: 小节线时间（秒，原曲解码后的时间轴）, beats, chord, section}。"""

    def __init__(self, grid):
        self.beat = grid['beat']
        self.bar = grid['bar']
        self.bars = {b['n']: b for b in grid['bars']}
        self.tail_chord = grid.get('tail_chord', 'tail')

    def bt(self, n):
        return self.bars[n]['start']

    def nbeats(self, n):
        return self.bars[n]['beats']


# ---------------------------------------------------------------- 剪辑渲染（只在小节线上剪）
def xf_gains(n, rho):
    """等功率交叉淡化，按两边实测相关系数 rho 修正：a^2 + b^2 + 2 rho a b = 1。"""
    ph = (np.arange(n) + 0.5) / n
    th = ph * np.pi / 2
    a, b = np.cos(th), np.sin(th)
    rho = float(np.clip(rho, -0.6, 1.0))
    k = 1.0 / np.sqrt(1.0 + rho * np.sin(2 * th))
    return a * k, b * k


def render(spec, x, grid):
    """spec = 剪辑方案的 edit 部分：segments、xf、fade_out、fade_in_ms（见 README）。x = 解码后的原曲。"""
    bt, BAR = grid.bt, grid.bar
    segs = spec['segments']
    xfs = spec.get('xf', {})
    place = []
    for k, s in enumerate(segs):
        a, b = s['bars']
        if k == 0:
            off = 0.0 - max(0.0, bt(a)) if a == 1 else -bt(a)
        else:
            prev = place[-1]
            pa, pb = prev['bars']
            t_line = bt(pb) + prev['off']
            t_line += prev.get('tail_bars', 0) * BAR
            off = t_line - bt(a)
        place.append(dict(bars=[a, b], off=off, gain_db=s.get('gain_db', 0.0), tail_bars=s.get('tail_bars', 0)))
    last = place[-1]
    total = bt(last['bars'][1]) + last['off'] + last['tail_bars'] * BAR
    N = int(round(total * SR))
    y = np.zeros((N, 2))
    junc = []
    env_in = [None] * len(place)
    env_out = [None] * len(place)
    for k in range(1, len(place)):
        p0, p1 = place[k - 1], place[k]
        cfg = dict(len=0.156, place='pre', pre_ms=10)
        cfg.update(xfs.get(str(k), {}))
        n = int(round(cfg['len'] * SR))
        T = int(round((bt(p1['bars'][0]) + p1['off']) * SR))
        if cfg['place'] == 'pre':
            s0 = T - n - int(cfg['pre_ms'] * SR / 1000)
        elif cfg['place'] == 'center':
            s0 = T - n // 2
        else:
            s0 = T + int(cfg.get('post_ms', 0) * SR / 1000)

        def seg_audio(p, o0, o1):
            a0 = int(round(o0 - p['off'] * SR)); a1 = a0 + (o1 - o0)
            return x[a0:a1] * 10 ** (p['gain_db'] / 20)
        A_ = seg_audio(p0, s0, s0 + n); B_ = seg_audio(p1, s0, s0 + n)
        rho = float((A_ * B_).sum() / np.sqrt((A_ ** 2).sum() * (B_ ** 2).sum() + 1e-20))
        Am = (A_[:, 0] + A_[:, 1]) / 2; As = (A_[:, 0] - A_[:, 1]) / 2
        Bm = (B_[:, 0] + B_[:, 1]) / 2; Bs = (B_[:, 0] - B_[:, 1]) / 2
        rm = float((Am * Bm).sum() / np.sqrt((Am ** 2).sum() * (Bm ** 2).sum() + 1e-20))
        rs = float((As * Bs).sum() / np.sqrt((As ** 2).sum() * (Bs ** 2).sum() + 1e-20))
        if cfg.get('rho') is not None: rm = rs = cfg['rho']
        gam, gbm = xf_gains(n, rm); gas, gbs = xf_gains(n, rs)
        ga = np.stack([gam, gas], 1); gb = np.stack([gbm, gbs], 1)
        env_out[k - 1] = (s0, n, ga)
        env_in[k] = (s0, n, gb)
        junc.append(dict(k=k, out_bar=p0['bars'][1], in_bar=p1['bars'][0], t=T / SR, src_out=bt(p0['bars'][1]), src_in=bt(p1['bars'][0]),
                         xf_len=cfg['len'], place=cfg['place'], xf_start=s0 / SR, xf_end=(s0 + n) / SR, rho=round(rho, 3),
                         rho_mid=round(rm, 3), rho_side=round(rs, 3), tail_bars=p0['tail_bars']))
    for k, p in enumerate(place):
        a, b = p['bars']
        o_start = 0 if k == 0 else env_in[k][0]
        if k == len(place) - 1:
            o_end = N
        else:
            o_end = env_out[k][0] + env_out[k][1]
        src0 = int(round(o_start - p['off'] * SR))
        src1 = src0 + (o_end - o_start)
        if src1 > len(x):
            src1 = len(x); o_end = o_start + (src1 - src0)
        seg = x[src0:src1].copy() * 10 ** (p['gain_db'] / 20)
        g = np.ones((len(seg), 2))
        env = segs[k].get('env')
        if env:   # [[原曲时间秒, dB], ...]，之间按 dB 线性
            ts_src = (src0 + np.arange(len(seg))) / SR
            pts = np.array(env, float)
            g = g * (10 ** (np.interp(ts_src, pts[:, 0], pts[:, 1]) / 20))[:, None]
        if k > 0:
            s0, n, gb = env_in[k]; g[:n] = gb
        if k < len(place) - 1:
            s0, n, ga = env_out[k]; i0 = s0 - o_start
            g[i0:i0 + n] *= ga; g[i0 + n:] = 0
        mid = (seg[:, 0] + seg[:, 1]) / 2 * g[:, 0]; side = (seg[:, 0] - seg[:, 1]) / 2 * g[:, 1]
        y[o_start:o_end] += np.stack([mid + side, mid - side], 1)
    bars = []
    for k, p in enumerate(place):
        a, b = p['bars']
        for nb in range(a, b):
            ts = bt(nb) + p['off']
            bars.append(dict(src_bar=nb, true_start=round(ts, 4), start=round(max(0.0, ts), 4), beats=grid.nbeats(nb),
                             chord=grid.bars[nb].get('chord'), section=grid.bars[nb].get('section'), seg=k))
        for q in range(p['tail_bars']):
            ts = bt(b) + p['off'] + q * BAR
            bars.append(dict(src_bar='tail', true_start=round(ts, 4), start=round(ts, 4), beats=3, chord=grid.tail_chord, section='tail', seg=k))
    fo = spec.get('fade_out')
    fade = None
    if fo:
        t0 = bars[fo['start_bar'] - 1]['start'] + fo.get('delay_s', 0.0)
        n0 = int(round(t0 * SR)); n1 = N
        L = n1 - n0
        u = (np.arange(L) + 0.5) / L
        db = fo.get('db', -48.0); pw = fo.get('pow', 1.0)
        g = 10 ** (db * u ** pw / 20)
        tail = max(1, int(0.25 * L))
        g[-tail:] *= np.cos((np.arange(tail) + 0.5) / tail * np.pi / 2)
        y[n0:n1] *= g[:, None]
        fade = dict(start=t0, end=n1 / SR, db=db, pow=pw)
    fi = spec.get('fade_in_ms', 0)
    if fi:
        n = int(fi * SR / 1000); y[:n] *= (0.5 - 0.5 * np.cos((np.arange(n) + 0.5) / n * np.pi))[:, None]
    return y, dict(total=N / SR, bars=bars, junctions=junc, place=place, fade=fade)


# ---------------------------------------------------------------- 母带
def macro_curve(n, pts):
    """宏观增益：断点 [[输出时间秒, dB], ...]，断点之间余弦缓变，没有阶跃。"""
    t = np.arange(n) / SR
    pts = sorted(pts)
    g = np.full(n, pts[-1][1], float)
    g[t < pts[0][0]] = pts[0][1]
    for (t0, d0), (t1, d1) in zip(pts[:-1], pts[1:]):
        m = (t >= t0) & (t < t1)
        u = (t[m] - t0) / max(t1 - t0, 1e-9)
        g[m] = d0 + (d1 - d0) * (0.5 - 0.5 * np.cos(np.pi * u))
    return g


def tp_env(sig, os_=4):
    up = ss.resample_poly(sig, os_, 1, axis=0, window=('kaiser', 10.0))
    a = np.abs(up).max(1)
    return a[:len(sig) * os_].reshape(-1, os_).max(1)


def limiter(sig, ceil_db, look_ms=4.0, rel_ms=100.0):
    """真峰值限幅：4 倍过采样检测，look_ms 前视，汉宁平滑起音（没有瞬间跳变），单极点释放。"""
    c = 10 ** (ceil_db / 20)
    env = tp_env(sig)
    greq = np.minimum(1.0, c / np.maximum(env, 1e-12))
    L = max(1, int(SR * look_ms / 1000))
    gmin = minimum_filter1d(np.r_[greq, np.ones(L)], size=2 * L + 1)[:len(greq)]
    w = np.hanning(2 * L + 3)[1:-1]; w /= w.sum()
    gs = np.convolve(np.r_[np.ones(L), gmin, np.ones(L)], w, 'valid')[:len(greq)]
    gs = np.minimum(gs, greq)
    a = np.exp(-1.0 / (SR * rel_ms / 1000))
    idx = np.where(gs < 0.99999)[0]
    out = np.ones_like(gs)
    if len(idx):
        lo = max(0, idx[0] - 1); hi = min(len(gs), idx[-1] + int(SR * rel_ms / 1000 * 8))
        prev = 1.0
        seg = gs[lo:hi]; o = np.empty_like(seg)
        for i in range(len(seg)):
            v = seg[i]
            prev = v if v < prev else a * prev + (1 - a) * v
            o[i] = prev
        out[lo:hi] = o
    return sig * out[:, None], out


def master(y, mcfg, macro_db=None, log=print):
    """y：渲染好的剪辑（float64）。返回 (24 bit 量化后的 float64, meta)。"""
    target = mcfg.get('target_lufs', -14.0)
    ceil = mcfg.get('ceiling_dbtp', -1.2)
    look, rel = mcfg.get('lookahead_ms', 4.0), mcfg.get('release_ms', 100.0)
    n = len(y)
    g_macro = macro_curve(n, macro_db or [[0, 0]])
    y = y * (10 ** (g_macro / 20))[:, None]
    gain = target - integrated(y)
    for it in range(mcfg.get('max_iter', 6)):
        z, g = limiter(y * 10 ** (gain / 20), ceil, look, rel)
        I = integrated(z)
        tp = 20 * np.log10(tp_env(z).max())
        log(f'  母带第 {it + 1} 轮：增益 {gain:+.3f} dB -> {I:.3f} LUFS，真峰值 {tp:.2f} dBTP，最大限幅 {20 * np.log10(g.min()):.2f} dB')
        if abs(I - target) < 0.02: break
        gain += target - I
    rng = np.random.default_rng(mcfg.get('dither_seed', 20261119))
    q = 2.0 ** -23
    d = (rng.random(z.shape) - rng.random(z.shape)) * q
    zq = np.clip(np.round((z + d) / q) * q, -1.0, 1.0 - q)
    gr = 20 * np.log10(g)
    meta = dict(target_lufs=target, limiter_ceiling_dbtp=ceil, norm_gain_db=round(gain, 3), macro_db=macro_db,
                limiter_max_gr_db=round(float(gr.min()), 3), limited_seconds=round(float((g < 0.9999).sum() / SR), 3),
                limited_over_0p5db_seconds=round(float((gr < -0.5).sum() / SR), 3), samples=int(n), total_s=n / SR)
    return zq, meta


# ---------------------------------------------------------------- 逐样本对比
def compare(a_path, b_path):
    """两条音频逐样本对比。返回 dict：identical、max_diff_lsb24、max_diff_dbfs、diff_samples、length。"""
    ia, ib = sf.info(a_path), sf.info(b_path)
    a, _ = sf.read(a_path, dtype='int32', always_2d=True)
    b, _ = sf.read(b_path, dtype='int32', always_2d=True)
    n = min(len(a), len(b))
    r = dict(a=a_path, b=b_path, sr=[ia.samplerate, ib.samplerate], channels=[ia.channels, ib.channels],
             frames=[len(a), len(b)], subtype=[ia.subtype, ib.subtype])
    if a.shape[1] != b.shape[1] or n == 0:
        r.update(identical=False, note='声道数不同或为空')
        return r
    d = np.abs(a[:n].astype(np.int64) - b[:n].astype(np.int64))
    mx = int(d.max())
    r.update(identical=bool(mx == 0 and len(a) == len(b) and ia.samplerate == ib.samplerate),
             diff_samples=int((d > 0).sum()), max_diff_lsb24=mx / 256.0,
             max_diff_dbfs=(round(20 * np.log10(mx / 2.0 ** 31), 2) if mx else None))
    return r
