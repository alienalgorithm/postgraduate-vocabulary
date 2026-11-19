#!/usr/bin/env python3
"""拼片、混音、核对、出 1080p、写 SHA256SUMS 和 Release 说明（GitHub 的 assemble 作业跑它，本机也能跑）。

用法：python3 assemble.py --plan plan.json --shards 分段目录 --out 输出目录 [--root 仓库根]
  1. 分段按 plan 逐个核对帧数，concat 分离器 -c copy 无损拼接（和 render.js 拼自己的小块是同一做法）
  2. 配乐：plan.music=main 时跑 tools/music/decrypt_music.sh（有 MUSIC_KEY 解密主配乐，否则自动退到备用，
     再没有就无声）；=backup 时不给密钥直接用备用；=none 无声。最后用了哪种写进摘要和 Release 标题
  3. 混音参数和 render.js 完全一样：-ss from -t 帧数/fps，AAC 320k 48 kHz 立体声，画面 -c copy，+faststart
  4. 核对（verify_video.py）：帧数 = 时长 x fps、帧率、尺寸、编码、音轨长度、真峰值；测积分响度
  5. scale=2 时另出 1080p（lanczos 缩小，CRF 17，同样核对帧数）；写 SHA256SUMS.txt、report.json、
     release_title.txt、release_notes.md
文件名只用 ASCII：<asset_basename>_4k.mp4、<asset_basename>_1080p.mp4、SHA256SUMS.txt。
只有质量问题（帧数不对、音轨短、削波）以 1 退出；缺密钥之类只提示。
"""
import argparse
import hashlib
import json
import os
import subprocess
import sys
import time

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import ci_common as C  # noqa: E402
import verify_video as VV  # noqa: E402



def sha256(path):
    h = hashlib.sha256()
    with open(path, 'rb') as f:
        for b in iter(lambda: f.read(1 << 20), b''):
            h.update(b)
    return h.hexdigest()


def prepare_music(plan, film_dir, film):
    """返回 (实际用的配乐 main|backup|none, wav 路径或 None, 配乐说明)。"""
    want = plan['music']
    if want == 'none':
        return 'none', None, '无配乐（请求如此）'
    script = os.path.join(C.K, 'tools', 'music', 'decrypt_music.sh')
    env = dict(os.environ)
    secret = film.get('music', {}).get('main', {}).get('secret', 'MUSIC_KEY')
    if want == 'backup' or not env.get(secret):
        env.pop(secret, None)                                   # 空密钥等于没有
    got = 'none'
    if os.path.isfile(script):
        r = subprocess.run(['bash', script, film_dir], capture_output=True, text=True, env=env)
        sys.stdout.write(r.stdout)
        sys.stderr.write(r.stderr)
        lines = [x for x in r.stdout.strip().splitlines() if x.startswith('MUSIC=')]
        got = lines[-1].split('=', 1)[1].strip() if lines else 'none'
    else:
        C.warning(f'没有 {script}，无声出片', '配乐')
    if got not in ('main', 'backup'):
        return 'none', None, '无配乐（没有密钥也没有备用配乐）'
    m = film.get('music', {}).get(got, {})
    wav = os.path.join(film_dir, m.get('decrypt_to') or film['music']['main']['decrypt_to'])
    if not os.path.isfile(wav):
        C.warning(f'解密脚本说用 {got}，但 {wav} 不存在，无声出片', '配乐')
        return 'none', None, '无配乐'
    if want == 'main' and got != 'main':
        C.warning('请求用主配乐，但这次只能用备用配乐（见上面的原因）', '配乐')
    return got, wav, m.get('label', got)


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument('--plan', required=True)
    ap.add_argument('--shards', required=True)
    ap.add_argument('--out', required=True)
    ap.add_argument('--root', default=os.path.dirname(C.K), help='仓库根目录（plan.film_dir 相对它）')
    ap.add_argument('--run-number', default=os.environ.get('GITHUB_RUN_NUMBER', 'local'))
    a = ap.parse_args()
    t_start = time.time()
    plan = json.load(open(a.plan, encoding='utf-8'))
    film_dir = os.path.join(a.root, plan['film_dir'])
    film, sb, _ = C.load_film(film_dir)
    os.makedirs(a.out, exist_ok=True)
    fps, n = plan['fps'], plan['frames']
    w, h = plan['width'], plan['height']
    base = plan['asset_basename']
    problems = []

    # 1. 分段
    files, rows = [], []
    for s in plan['shards']:
        f = os.path.join(a.shards, f'shard_{s["name"]}.mp4')
        if not os.path.isfile(f):
            problems.append(f'缺分段 {s["name"]}')
            continue
        bad, info = VV.verify(f, s['frames'], fps, w, h, audio=False)
        problems += [f'分段 {s["name"]}：{b}' for b in bad]
        meta = {}
        if os.path.isfile(f + '.json'):
            meta = json.load(open(f + '.json'))
        rows.append((s['name'], s['f0'], s['f1'] - 1, info.get('frames'), info.get('fps'), meta.get('render_fps'), meta.get('seconds'), meta.get('tries')))
        files.append(f)
    shard_md = '| 段 | 首帧 | 末帧 | 帧数 | 视频 fps | 渲染速度（帧/秒） | 用时（秒） | 第几次成功 |\n|---|---|---|---|---|---|---|---|\n'
    shard_md += '\n'.join('| ' + ' | '.join('' if x is None else str(x) for x in r) + ' |' for r in rows)
    speeds = [r[5] for r in rows if r[5]]
    if speeds:
        C.notice(f'{len(rows)} 段，渲染速度每段 {min(speeds):.2f} 到 {max(speeds):.2f} 帧/秒，'
                 f'各段视频 fps {sorted(set(r[4] for r in rows))}', '分段')
    if problems:
        for p in problems:
            C.error(p, '分段')
        C.summary('## 拼片失败\n\n' + '\n'.join('- ' + p for p in problems) + '\n\n' + shard_md)
        return 1

    # 2. 配乐
    used, wav, label = prepare_music(plan, film_dir, film)
    C.notice(f'配乐：{used}（{label}）', '配乐')

    # 3. 拼接 + 混音（参数和 render.js 一致）
    lst = os.path.join(a.out, 'concat.txt')
    with open(lst, 'w') as fh:
        fh.write(''.join("file '" + os.path.abspath(f).replace("'", "'\\''") + "'\n" for f in files))
    main_name = f'{base}_4k.mp4' if plan['scale'] == 2 else f'{base}_1080p.mp4'
    main_out = os.path.join(a.out, main_name)
    args = ['ffmpeg', '-hide_banner', '-loglevel', 'error', '-y', '-f', 'concat', '-safe', '0', '-i', lst]
    if wav:
        args += ['-ss', plan['from'], '-t', repr(n / fps), '-i', wav, '-map', '0:v:0', '-map', '1:a:0',
                 '-c:a', 'aac', '-b:a', '320k', '-ar', '48000', '-ac', '2']
    else:
        args += ['-map', '0:v:0']
    args += ['-c:v', 'copy', '-movflags', '+faststart', main_out]
    subprocess.run(args, check=True)
    os.remove(lst)

    # 4. 核对
    bad, info = VV.verify(main_out, n, fps, w, h, audio=bool(wav))
    problems += bad
    outputs = [(main_name, info)]

    # 5. 1080p
    if plan['scale'] == 2 and not bad:
        small = f'{base}_1080p.mp4'
        so = os.path.join(a.out, small)
        args = ['ffmpeg', '-hide_banner', '-loglevel', 'error', '-y', '-i', main_out, '-map', '0:v:0']
        if wav:
            args += ['-map', '0:a:0', '-c:a', 'copy']
        args += ['-vf', 'scale=1920:1080:flags=lanczos+accurate_rnd+full_chroma_int,format=yuv420p',
                 '-c:v', 'libx264', '-preset', 'medium', '-crf', '17', '-profile:v', 'high', '-level:v', '4.2',
                 '-pix_fmt', 'yuv420p', '-g', str(fps * 2), '-keyint_min', str(round(fps / 2)),
                 '-color_primaries', 'bt709', '-color_trc', 'bt709', '-colorspace', 'bt709', '-color_range', 'tv',
                 '-r', str(fps), '-movflags', '+faststart', so]
        subprocess.run(args, check=True)
        b2, i2 = VV.verify(so, n, fps, 1920, 1080, audio=bool(wav))
        problems += [f'1080p：{b}' for b in b2]
        outputs.append((small, i2))

    # 6. SHA256SUMS、报告
    sums = [(sha256(os.path.join(a.out, f)), f) for f, _ in outputs]
    with open(os.path.join(a.out, 'SHA256SUMS.txt'), 'w') as fh:
        fh.write(''.join(f'{x}  {f}\n' for x, f in sums))
    ld = {k: info.get(k) for k in ('lufs', 'lra', 'true_peak')}
    report = {'plan': {k: plan[k] for k in ('id', 'note', 'film', 'scale', 'fps', 'from', 'to', 'frames', 'duration', 'full')},
              'music': used, 'music_label': label, 'loudness': ld, 'outputs': dict(outputs), 'sha256': dict((f, x) for x, f in sums),
              'shards': [dict(zip(('name', 'f0', 'f1', 'frames', 'fps', 'render_fps', 'seconds', 'tries'), r)) for r in rows],
              'problems': problems, 'commit': os.environ.get('GITHUB_SHA', ''), 'run': a.run_number,
              'assemble_seconds': round(time.time() - t_start)}
    json.dump(report, open(os.path.join(a.out, 'report.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)

    loud = (f'积分响度 {ld["lufs"]} LUFS，响度范围 {ld["lra"]} LU，真峰值 {ld["true_peak"]} dBTP' if wav else '无音轨')
    head = (f'{info.get("width")}x{info.get("height")} {info.get("fps")} fps，总帧数 {info.get("frames")}'
            f'（应为 {n}），{n / fps:.3f} 秒，{info.get("size_mb")} MB')
    C.notice(head, '成片')
    C.notice(f'{loud}；配乐 {used}', '声音')
    if wav and plan['full'] and ld['lufs'] is not None and abs(ld['lufs'] + 14) > 1:
        C.warning(f'全片积分响度 {ld["lufs"]} LUFS，离 -14 LUFS 超过 1 LU', '声音')
    for p in problems:
        C.error(p, '成片核对')

    # 7. Release 标题和说明
    suffix = {'main': '', 'backup': '（备用配乐）', 'none': '（无配乐）'}[used]
    part = '' if plan['full'] else f'（片段 {float(plan["from"]):.3f} 到 {float(plan["to"]):.3f} 秒）'
    res = '4K' if plan['scale'] == 2 else '1080p'
    title = f'{plan["display_name"]} {res} 动画 r{a.run_number}{part}{suffix}'
    open(os.path.join(a.out, 'release_title.txt'), 'w', encoding='utf-8').write(title + '\n')
    files_md = '\n'.join(f'- {f}：{i.get("width")}x{i.get("height")}，{i.get("frames")} 帧，{i.get("size_mb")} MB' for f, i in outputs)
    notes = (f'# {title}\n\n'
             f'配乐：{label}\n\n'
             f'画面：{head}\n\n声音：{loud}\n\n'
             f'附件：\n{files_md}\n- SHA256SUMS.txt：校验值，下载后可用 sha256sum -c SHA256SUMS.txt 核对\n\n'
             f'出片请求：{plan["id"] or "（无 id）"}；{plan["note"] or ""}\n\n'
             f'提交：{report["commit"] or "本机"}；由 GitHub Actions 自动渲染（分 {len(rows)} 段并行，-c copy 无损拼接），'
             f'帧数、帧率、尺寸、音轨长度、真峰值已逐项核对。\n')
    open(os.path.join(a.out, 'release_notes.md'), 'w', encoding='utf-8').write(notes)

    ok = '通过' if not problems else '不通过'
    C.summary(f'## 成片核对：{ok}\n\n- 画面：{head}\n- 声音：{loud}\n- 配乐：{used}（{label}）\n'
              + ''.join(f'- {f}：{i.get("frames")} 帧，{i.get("size_mb")} MB，sha256 {dict((y, x) for x, y in sums)[f][:16]}…\n' for f, i in outputs)
              + ''.join(f'- 问题：{p}\n' for p in problems)
              + f'\n### 分段\n\n{shard_md}')
    print(json.dumps({'ok': not problems, 'music': used, 'loudness': ld, 'outputs': [f for f, _ in outputs]}, ensure_ascii=False))
    return 1 if problems else 0


if __name__ == '__main__':
    sys.exit(main())
