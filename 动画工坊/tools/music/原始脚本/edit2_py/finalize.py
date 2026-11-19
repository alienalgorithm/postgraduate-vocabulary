#!/usr/bin/env python3
"""Write A/music/map.json and A/music/energy.json for the mastered score.
usage: python3 finalize.py score.wav work_dir plan.json"""
import sys, os, json, hashlib, numpy as np, soundfile as sf
from lib import *

score, work, plan_p = sys.argv[1:4]
z, sr = sf.read(score, dtype='float64'); assert sr == SR
info = json.load(open(os.path.join(work, 'edit_info.json')))
meta = json.load(open(os.path.join(work, 'master_meta.json')))
ver = json.load(open(os.path.join(work, 'verify.json')))
plan = json.load(open(plan_p))
total = round(len(z) / SR, 4)
bars = info['bars']

# ---------------- bar and beat grid of the edited score ----------------
bar_info = []
for i, b in enumerate(bars):
    t = round(max(0.0, b['true_start']), 3)
    bar_info.append(dict(n=i + 1, t=t, beats=b['beats'], src_bar=b['src_bar'], chord=b['chord'], section=b['section']))
bar_times = [b['t'] for b in bar_info]
beats = []
for b, bi in zip(bars, bar_info):
    for q in range(b['beats']):
        tb = b['true_start'] + q * BEAT
        if q == 0: tb = max(0.0, tb)
        if tb < total - 1e-6: beats.append(round(tb, 3))
irregular = [dict(n=b['n'], t=b['t'], beats=b['beats'], src_bar=b['src_bar']) for b in bar_info if b['beats'] != 3]

S = [('intro_a', 0.0, 26.217, '开头：从寂静渐入的管风琴长音和弦，顶上 E 持续音的轻轻“滴答”；冷，悬着（原曲第 1 到 10 小节，含一次 4 小节循环）'),
     ('intro_b', 26.217, 40.592, '第二轮 F G Am G：高音区一层加入，慢慢变亮（原曲第 11 到 18 小节，第 18 小节只有 2 拍）'),
     ('lift', 40.592, 55.592, '屏息：低音撤掉，E 持续音上紧密明亮的十六分音符像钟表滴答，不换和弦；最后一小节（53.717）起势（原曲第 19 到 23 小节，加长 3 小节）'),
     ('arrival', 55.592, 66.842, '爆发：巨大的低音区进入，满编，十六分音符推着走；F G Am 短循环（原曲第 24 到 29 小节）'),
     ('drive', 66.842, 81.842, '向前推：完整的 F G Am G，高音层增长，74.342 起 8 kHz 以上的光泽层（原曲第 30 到 37 小节）'),
     ('build_1', 81.842, 96.842, '深低音回来，第二次抬升，饱满密集（原曲第 46 到 53 小节）'),
     ('build_2', 96.842, 111.842, '整轮稳定渐强，势不可挡，直推高潮（原曲第 54 到 61 小节）'),
     ('peak', 111.842, 117.467, '全片最响最满的 5.6 秒（原曲第 62 到 64 小节）：111.842 是落点（F 强拍，满编和深低音同时落下，这一小节总能量全片最高），恍然大悟落在这里；之后继续渐强，最后一小节（115.592 起）K 加权响度最高，117.2 秒前后到顶，117.467 急停'),
     ('stop', 117.467, 121.217, '原曲自己的戛然而止，之后两小节混响尾音（寂静）'),
     ('coda', 121.217, 143.092, 'intro_b 的 F 轻轻回来：温暖、安静的 F G Am G；最后的 G 渐弱（原曲第 11 到 18 小节，含一次 4 小节循环）'),
     ('recall', 143.092, 165.592, '开头的渐入回来（原曲第 3 小节起）：音乐自己“想起”开头；146.842 的 G 和开头 7.467 的 G 是同一个和弦位置'),
     ('ending', 165.592, total, '最后落在 F（大七和弦的温暖色彩，E 在顶上），一拍后两小节内淡出到无声')]
sections = [dict(name=n, start=s, end=round(e, 3), note=d) for n, s, e, d in S]

# ---------------- scene slots (plan scenes snapped to the edit's bar lines) ----------------
slots = []
pl = plan['scenes']
for k, s in enumerate(pl):
    st = s['start']
    i = int(np.argmin([abs(t - st) for t in bar_times]))
    st2 = bar_times[i]
    en = pl[k + 1]['start'] if k + 1 < len(pl) else total
    j = len(bar_times) if k + 1 == len(pl) else int(np.argmin([abs(t - en) for t in bar_times]))
    en2 = total if k + 1 == len(pl) else bar_times[j]
    slots.append(dict(id=s['id'], start=st2, duration=round(en2 - st2, 3), end=round(en2, 3), first_bar=i + 1, bars=j - i,
                      plan_start=s['start'], plan_duration=s['duration'], moved_ms=round((st2 - st) * 1000, 1),
                      length_change_s=round((en2 - st2) - s['duration'], 3)))

# ---------------- junctions (cuts) ----------------
cuts = []
for j in info['junctions']:
    cuts.append(dict(out_time=round(j['t'], 3), source_out_line=dict(bar=j['out_bar'], t=round(j['src_out'], 3)),
                     source_in_line=dict(bar=j['in_bar'], t=round(j['src_in'], 3)),
                     crossfade=dict(length_s=j['xf_len'], start=round(j['xf_start'], 3), end=round(j['xf_end'], 3),
                                    law='equal-power, gains corrected for the measured correlation rho (a^2+b^2+2 rho a b = 1)', rho=j['rho']),
                     after_tail_bars=j.get('tail_bars', 0)))

anchors = [
    (0.0, 1, '开头：从寂静渐入（1.2 秒升余弦淡入，之后是原曲自己的渐入）'),
    (7.467, 5, '第一次换和弦到 G（s01“片尾，考你。”）'),
    (22.467, 13, '高音区一层第一次加入（原曲第 9 小节），s03 开始'),
    (26.217, 15, 'intro_b：第二轮，继续变亮'),
    (40.592, 23, '屏息段开始：低音撤掉，十六分音符接管'),
    (53.717, 30, '起势小节，涌向爆发'),
    (55.592, 31, '爆发：全曲最强的一击（原曲 42.467 秒）'),
    (74.342, 41, '8 kHz 以上的光泽层进来'),
    (81.842, 45, '深低音回来，第二次抬升（跳过 drive_2 的接口，听起来就是原曲第 46 小节的转折）'),
    (96.842, 53, 'build_2：整轮渐强'),
    (111.842, 61, '高潮落点：F 强拍，满编和深低音同时落下（这一小节总能量全片最高），恍然大悟第一行；之后三小节继续渐强，117.2 秒前后最响'),
    (113.717, 62, '恍然大悟第二行（下一个强拍）'),
    (117.467, 64, '戛然而止（原曲第 65 小节线），之后两小节混响尾音'),
    (121.217, 66, 'F 轻轻回来（1.25 秒淡入）'),
    (132.467, 72, 'G 强拍（s09 翻牌）'),
    (139.967, 76, '最后一个 G 开始渐弱（两小节内 -9 dB）'),
    (143.092, 78, '开头的渐入回来（原曲第 3 小节）'),
    (146.842, 80, 'G：解码 evidence，与 7.467 同一个和弦位置'),
    (154.342, 84, 'G 强拍（金句句号）'),
    (158.092, 86, 'Am 强拍（方法卡落定）'),
    (161.842, 88, '最后一个 G 强拍'),
    (165.592, 90, '最后的 F：温暖落地；166.217 起淡出，169.342 结束'),
]

M = dict(
    file='A/music/score.wav', sample_rate=SR, channels=2, bit_depth=24,
    source='Hans Zimmer, Cornfield Chase (Interstellar OST, deluxe edition track 2), user-licensed; A/music/user/cornfield_chase.mp3',
    bpm=96.0, bpm_measured=96.0, meter='3/4', beat=BEAT, bar=BAR, beat_offset=0.0,
    beat_offset_note='第 1 小节的强拍在文件开头前 33 ms（原曲文件从强拍里开始），这里按 0.0 记；之后每拍 0.625 秒，网格从头到尾连续，没有变速。',
    beats=beats, bars=bar_times, bar_info=bar_info,
    irregular_bars=irregular,
    irregular_bars_note=('原曲第 18 小节只有 2 拍（拍号在这里整体挪 2 拍），剪辑里出现两次：第 %d 小节（%.3f 秒，进屏息段前）和第 %d 小节（%.3f 秒，进 s10 前）。'
                         'bars 列表已经按真实小节线给出。注意：engine.js 的 musicGrid 目前从 beats 每 3 拍推一条小节线，不读 bars，'
                         '在 %.3f 秒之后会错一拍；场景里用 u.bar()/barPulse 卡小节线之前，engine 需要改成有 music.bars 时直接用它。'
                         % (irregular[0]['n'], irregular[0]['t'], irregular[1]['n'], irregular[1]['t'], irregular[0]['t'])) if len(irregular) >= 2 else '',
    sections=sections, climax=111.842, aha=111.842, burst=55.592, stop=117.467, music_end=total, total=total,
    anchors=[dict(t=t, bar=b, what=w) for t, b, w in anchors],
    scene_slots=slots,
    junctions=cuts,
    dynamics=dict(
        segment_gain_db={'coda (121.217 to end)': 7.0},
        macro_automation_db=meta['macro_db'],
        macro_note='安静段落整体抬高，让手机外放也听得见：开头到 35.592 秒 +7 dB；35.592 到 40.56 秒缓降到 +4.5 dB（屏息段进来时仍有约 +6.8 LU 的台阶，和原曲一样）；'
                   '屏息段从 +4.5 dB 缓降到爆发前 55.55 秒的 0 dB（爆发和高潮的落差完整保留）；急停之后的尾声 +7 dB（混响尾音不抬）。所有变化都是余弦缓变，没有阶跃。',
        diminuendo='139.967 到 143.092 秒（s09 最后的 G）在 dB 上线性渐弱 9 dB，接开头的渐入',
        fade_in='0 到 1.2 秒升余弦淡入（盖住原曲文件开头前一首留下的低频余音），之后是原曲自己的渐入',
        fade_out=dict(start=info.get('fade', {}).get('start'), end=total, shape='dB 曲线 -50*u^1.5，最后四分之一再乘余弦，落到 0'),
        normalisation_gain_db=meta['norm_gain_db'], limiter=dict(ceiling_dbtp=meta['limiter_ceiling_dbtp'], max_gain_reduction_db=meta['limiter_max_gr_db'],
                                                                 seconds_limited=meta['limited_seconds'], seconds_over_0p5db=meta['limited_over_0p5db_seconds'],
                                                                 lookahead_ms=4, release_ms=100, detector='4x oversampled true peak', attack='8 ms Hann ramp, no instantaneous gain steps (max 0.007 dB per sample)'),
        dither='TPDF, 24 bit'),
    loudness=dict(integrated_lufs=ver['ebur128']['I'], lra_lu=ver['ebur128']['LRA'], true_peak_dbtp=ver['ebur128']['TP'],
                  sample_peak_dbfs=ver['sample_peak_dbfs'], clipped_samples=ver['clipped_samples'], measured_with='ffmpeg 6.1 ebur128=peak=true'),
    grid_check=dict(method='同一个原曲小节在剪辑里出现两次时，两处波形做互相关，延迟应为 0',
                    repeats=[dict(src_bar=p['src_bar'], out=p['out'], lag_ms=p['lag_ms'], corr=p['corr']) for p in ver['grid_repeats']]),
    sha256=hashlib.sha256(open(score, 'rb').read()).hexdigest(),
)
json.dump(M, open(os.path.join(MUS, 'map.json'), 'w'), indent=1, ensure_ascii=False)

# ---------------- energy.json ----------------
fps = 60
nf = int(np.ceil(total * fps))
k = kweight(z); p = (k ** 2).sum(1)
c = np.cumsum(np.r_[0, p])


def loud_at(tc, win):
    a = int((tc - win / 2) * SR); b = a + int(win * SR)
    a = max(a, 0); b = min(b, len(p))
    if b - a < 16: return -120.0
    return -0.691 + 10 * np.log10((c[b] - c[a]) / (b - a) + 1e-20)


ts = np.arange(nf) / fps
fast = np.array([loud_at(t, 0.1) for t in ts])
slow = np.array([loud_at(t, 3.0) for t in ts])
LO = -40.0; HI = float(np.percentile(fast, 99.5)); G = 1.6


def mapv(d): return np.clip((d - LO) / (HI - LO), 0, 1) ** G


v = mapv(fast)
rel = np.exp(-1 / (fps * 0.2)); out = np.empty_like(v); prev = 0.0
for i, x in enumerate(v):
    prev = x if x > prev else rel * prev + (1 - rel) * x
    out[i] = prev
vs = mapv(slow)

# hits: chord-change downbeats (strength follows the slow energy) + the structural moments (fixed strengths)
named = {7.467: (0.35, 'first chord change (G), s01'), 22.467: (0.35, 'high layer enters'), 26.217: (0.35, 'intro_b, brighter'),
         40.592: (0.6, 'lift: bass drops out, sixteenths take over'), 53.717: (0.45, 'rise into the burst'), 55.592: (1.0, 'BURST'),
         66.842: (0.5, 'drive: high layer grows'), 74.342: (0.45, 'shimmer layer above 8 kHz'), 81.842: (0.85, 'deep bass returns'),
         96.842: (0.55, 'build_2 starts'), 111.842: (1.0, 'CLIMAX / aha line 1'), 113.717: (0.8, 'aha line 2'),
         121.217: (0.35, 'F returns softly'), 132.467: (0.4, 'G downbeat (card flip)'), 143.092: (0.2, 'the opening swell returns'),
         146.842: (0.45, 'G: decode, same chord slot as 7.467'), 154.342: (0.4, 'G downbeat (golden line full stop)'),
         158.092: (0.5, 'Am downbeat (method card)'), 161.842: (0.45, 'last G downbeat'), 165.592: (0.5, 'final F, warm landing')}
hits = {}
prev_chord = None
for b in bar_info:
    ch = b['chord']
    if b['t'] > 0 and ch != prev_chord and ch not in ('G (tail)',) and not (117.4 < b['t'] < 121.2):
        e = float(vs[min(nf - 1, int(b['t'] * fps))])
        hits[round(b['t'], 3)] = round(0.2 + 0.45 * e, 3)
    prev_chord = ch
for t, (s, name) in named.items():
    hits[round(t, 3)] = s
ht = sorted(hits)
events = [dict(t=t, strength=s, name=n) for t, (s, n) in sorted(named.items())]
events.append(dict(t=117.467, strength=1.0, name='HARD STOP (sudden silence, reverb tail)', kind='stop'))
events.sort(key=lambda e: e['t'])
E = dict(fps=fps, duration=total, frames=nf,
         scale=f'values[i] = K-weighted loudness of frame i (t = i/60 s, 100 ms window) mapped as ((LUFS - ({LO})) / ({HI:.2f} - ({LO})))^{G}, clipped to 0..1, '
               'instant attack and 0.2 s release; slow[i] = same mapping of the 3-s short-term loudness',
         values=[round(float(x), 4) for x in out], slow=[round(float(x), 4) for x in vs],
         hits=ht, hit_strength=[hits[t] for t in ht],
         events=events, climax=111.842, burst=55.592, stop=117.467,
         notes='Cornfield Chase has no drums. hits = the downbeats where the harmony changes (every 2 bars; strength 0.2 to 0.65 follows the slow energy) '
               'plus the structural moments in events (burst and climax 1.0, deep-bass return 0.85, aha line 2 0.8, lift 0.6 ...). '
               'The hard stop at 117.467 is listed only in events (kind "stop"): the music cuts to its reverb tail there, it is not a flash. '
               'The 16th-note ostinato (0.15625 s) runs through every section; use the beat grid in map.json for ticks. Suggested use: flash for strength >= 0.8, gentle pulse for >= 0.3.')
json.dump(E, open(os.path.join(MUS, 'energy.json'), 'w'), separators=(',', ':'))
print('map.json: total', total, 'bars', len(bar_times), 'beats', len(beats), 'irregular', irregular)
print('slots:', [(s['id'], s['start'], s['duration'], s['bars'], s['moved_ms'], s['length_change_s']) for s in slots])
print('energy.json: frames', nf, 'HI', round(HI, 2), 'hits', len(ht))
for name, a, b in [('intro', 2, 26), ('lift', 41, 55), ('drive', 67, 81), ('build', 82, 111), ('peak', 112, 117), ('coda', 122, 143), ('recall', 144, 165)]:
    print(f'  energy {name}: mean {out[a*fps:b*fps].mean():.2f}')
