#!/usr/bin/env python3
"""跑作品自己的分镜检查 story/check_storyboard.py（小节对齐、片长、高潮、阅读时间、禁用词等）。

用法：python3 check_story.py <作品目录> [--music main|backup|none] [--storyboard 另一个storyboard.json]
check_storyboard.py 要读配乐 score.wav 核对片长。只有主配乐（--music main，decrypt_music.sh 解出来的）
才是真正的配乐；没有密钥时用一个和 music/map.json 的 total 等长的无声占位 WAV，这一项就退化成
“分镜片长 = map.json 片长”（另一项本来就查），并提示一句，不卡流程。
在临时目录里拼一个作品视图（story/、music/map.json、music/score.wav），不在作品目录里写任何东西。
退出码跟 check_storyboard.py 一样：0 通过，非 0 不通过。
"""
import argparse
import json
import os
import shutil
import subprocess
import sys
import tempfile
import wave

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import ci_common as C  # noqa: E402


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument('film')
    ap.add_argument('--music', default='none', choices=['main', 'backup', 'none'])
    ap.add_argument('--storyboard', help='换一个分镜文件来查（坏样本测试用）')
    a = ap.parse_args()
    F = os.path.abspath(a.film)
    checker = os.path.join(F, 'story', 'check_storyboard.py')
    name = os.path.basename(F)
    if not os.path.isfile(checker):
        C.notice(f'{name} 没有 story/check_storyboard.py，跳过分镜检查', '分镜检查')
        return 0
    film = json.load(open(os.path.join(F, 'film.json'), encoding='utf-8'))
    sb_src = a.storyboard or os.path.join(F, film.get('storyboard', 'story/storyboard.json'))
    sb = json.load(open(sb_src, encoding='utf-8'))
    tmp = tempfile.mkdtemp(prefix='check_story_')
    try:
        os.makedirs(os.path.join(tmp, 'story'))
        os.makedirs(os.path.join(tmp, 'music'))
        shutil.copy(checker, os.path.join(tmp, 'story', 'check_storyboard.py'))
        shutil.copy(sb_src, os.path.join(tmp, 'story', 'storyboard.json'))
        mp = os.path.join(F, 'music', 'map.json')
        if os.path.isfile(mp):
            shutil.copy(mp, os.path.join(tmp, 'music', 'map.json'))
        mfile = (sb.get('music') or {}).get('file') or 'music/score.wav'
        rel = mfile[2:] if mfile.startswith('A/') else mfile
        dst = os.path.join(tmp, rel)
        os.makedirs(os.path.dirname(dst), exist_ok=True)
        real = os.path.join(F, rel)
        if a.music == 'main' and os.path.isfile(real):
            os.symlink(real, dst)
        else:
            total = json.load(open(mp)).get('total', sb.get('total', 0)) if os.path.isfile(mp) else sb.get('total', 0)
            sr = 8000
            with wave.open(dst, 'wb') as w:                      # 无声占位，只用它的长度
                w.setnchannels(1)
                w.setsampwidth(1)
                w.setframerate(sr)
                w.writeframes(b'\x80' * round(float(total) * sr))
            C.notice('没有主配乐（无密钥），配乐长度一项按 music/map.json 的 total 核对', '分镜检查')
        r = subprocess.run([sys.executable, '-I', os.path.join(tmp, 'story', 'check_storyboard.py'), tmp],
                           capture_output=True, text=True)
        out = (r.stdout + r.stderr).strip()
        print(out)
        last = out.splitlines()[-1] if out else ''
        if r.returncode == 0:
            C.notice(f'{name}：{last[:300]}', '分镜检查')
        else:
            fails = [ln.strip() for ln in out.splitlines() if 'FAIL' in ln or ln.startswith('  -')][:20]
            C.error(f'{name}：check_storyboard.py 不通过（退出码 {r.returncode}）：' + ' | '.join(fails or [last])[:900], '分镜检查')
        C.summary(f'### 分镜检查：{"通过" if r.returncode == 0 else "不通过"}\n\n```\n{out[-3000:]}\n```')
        return r.returncode
    finally:
        shutil.rmtree(tmp, ignore_errors=True)


if __name__ == '__main__':
    sys.exit(main())
