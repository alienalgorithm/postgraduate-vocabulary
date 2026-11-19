#!/usr/bin/env python3
"""CI 脚本共用的小函数：GitHub 注解和摘要、和引擎一致的取整、读作品清单、ffprobe、响度测量。
本机直接跑也行：没有 GITHUB_STEP_SUMMARY 时摘要打印到标准错误。"""
import json
import math
import os
import re
import subprocess
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
K = os.path.dirname(os.path.dirname(HERE))          # 动画工坊/


def _esc(s, prop=False):
    s = str(s).replace('%', '%25').replace('\r', '%0D').replace('\n', '%0A')
    return s.replace(':', '%3A').replace(',', '%2C') if prop else s


def annotate(level, msg, title=None):
    """level = notice | warning | error。注解会出现在 Actions 页面，也能用 check-runs annotations 接口读到。
    跑坏样本时（环境变量 ANIM_SAMPLE_RUN=1）只打印普通文字，免得样本的“不通过”变成页面上的红字。"""
    if os.environ.get('ANIM_SAMPLE_RUN'):
        print(f'[{level}] {title or ""}: {msg}', flush=True)
        return
    head = f'::{level} title={_esc(title, True)}::' if title else f'::{level}::'
    print(head + _esc(msg), flush=True)


def notice(msg, title=None):
    annotate('notice', msg, title)


def warning(msg, title=None):
    annotate('warning', msg, title)


def error(msg, title=None):
    annotate('error', msg, title)


def summary(md):
    p = None if os.environ.get('ANIM_SAMPLE_RUN') else os.environ.get('GITHUB_STEP_SUMMARY')
    if p:
        with open(p, 'a', encoding='utf-8') as f:
            f.write(md.rstrip('\n') + '\n\n')
    else:
        sys.stderr.write(md.rstrip('\n') + '\n\n')


def set_output(**kv):
    """写 GITHUB_OUTPUT；本机没有时打印出来。"""
    p = None if os.environ.get('ANIM_SAMPLE_RUN') else os.environ.get('GITHUB_OUTPUT')
    lines = []
    for k, v in kv.items():
        v = v if isinstance(v, str) else json.dumps(v, ensure_ascii=False, separators=(',', ':'))
        if '\n' in v:
            lines.append(f'{k}<<__EOF__\n{v}\n__EOF__')
        else:
            lines.append(f'{k}={v}')
    if p:
        with open(p, 'a', encoding='utf-8') as f:
            f.write('\n'.join(lines) + '\n')
    else:
        for line in lines:
            print('output ' + line)


def js_round(x):
    """和 JavaScript 的 Math.round 一样（.5 向上取整），render.js 就是这样把秒换成帧号的。"""
    return math.floor(x + 0.5)


def frame_time(f, fps):
    """帧号 -> 秒，用最短能还原的十进制写法，JS 读回来再乘 fps 一定取整回同一帧。"""
    return repr(f / fps) if f else '0'


def load_film(film_dir):
    film = json.load(open(os.path.join(film_dir, 'film.json'), encoding='utf-8'))
    sb_path = os.path.join(film_dir, film.get('storyboard', 'story/storyboard.json'))
    sb = json.load(open(sb_path, encoding='utf-8'))
    return film, sb, sb_path


def scene_file(s):
    return s.get('file') or (s.get('build') or s['id']) + '.js'


def run(cmd, **kw):
    return subprocess.run(cmd, check=True, capture_output=True, text=True, **kw).stdout


def probe(path):
    """视频：帧数（逐包数）、fps、宽高、编码；音频：编码、采样率、声道、时长。"""
    j = json.loads(run(['ffprobe', '-v', 'error', '-count_packets', '-show_entries',
                        'stream=index,codec_type,codec_name,profile,width,height,r_frame_rate,avg_frame_rate,'
                        'nb_read_packets,pix_fmt,sample_rate,channels,duration,color_primaries,color_transfer,color_space'
                        ':format=duration,size', '-of', 'json', path]))
    v = next((s for s in j['streams'] if s['codec_type'] == 'video'), None)
    a = next((s for s in j['streams'] if s['codec_type'] == 'audio'), None)
    out = {'duration': float(j['format'].get('duration', 0)), 'size': int(j['format'].get('size', 0)), 'video': None, 'audio': None}
    if v:
        n, d = (int(x) for x in v['r_frame_rate'].split('/'))
        out['video'] = {'codec': v['codec_name'], 'profile': v.get('profile'), 'width': v['width'], 'height': v['height'],
                        'fps': n / d, 'frames': int(v['nb_read_packets']), 'pix_fmt': v.get('pix_fmt'),
                        'duration': float(v.get('duration', 0)), 'color': v.get('color_primaries')}
    if a:
        out['audio'] = {'codec': a['codec_name'], 'sample_rate': int(a['sample_rate']), 'channels': a['channels'],
                        'duration': float(a.get('duration', 0))}
    return out


def loudness(path):
    """EBU R128：积分响度 I（LUFS）、响度范围 LRA（LU）、真峰值 TP（dBTP）。没有音频返回 None。"""
    r = subprocess.run(['ffmpeg', '-hide_banner', '-nostats', '-i', path, '-map', '0:a:0', '-af', 'ebur128=peak=true',
                        '-f', 'null', '-'], capture_output=True, text=True)
    txt = r.stderr
    k = txt.rfind('Summary:')
    if r.returncode != 0 or k < 0:
        return None
    s = txt[k:]
    def grab(pat):
        m = re.search(pat, s)
        return float(m.group(1)) if m else None
    return {'I': grab(r'I:\s+(-?[\d.]+|-inf) LUFS'), 'LRA': grab(r'LRA:\s+(-?[\d.]+) LU'),
            'TP': grab(r'True peak:\s+Peak:\s+(-?[\d.]+|-inf) dBFS')}


def fmt_s(x):
    return f'{x:.3f}'
