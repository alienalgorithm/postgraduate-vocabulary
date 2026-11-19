#!/usr/bin/env python3
"""出片计划：读渲染请求和作品清单，按帧号把要渲染的范围切成 N 段，输出 GitHub Actions 的 matrix。

用法：python3 plan.py --request 渲染请求.json [--out plan.json]
请求格式（动画工坊/渲染请求.json，字段都可省，省了用作品清单里的值）：
  {"id":"唯一串","film":"如何真正学好英语","scale":2,"fps":60,"from":null,"to":null,
   "music":"main","shards":20,"release":false,"note":"说明"}
切法：f0=round(from*fps)，f1=round(to*fps)（和 render.js 一样的 Math.round），第 i 段是
[f0+round(N*i/K), f0+round(N*(i+1)/K))，传给 render.js 的 --from/--to 是 帧号/fps，首尾相接，不重不漏。
能明确改正的（段数超范围、段太短）自动改并提示；意思不明的（片名不存在、scale 不是 1 或 2）报错退出 1。
"""
import argparse
import json
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import ci_common as C  # noqa: E402

MAX_SHARDS = 20          # 公开仓库免费账号同时最多 20 个作业
MIN_SHARD_FRAMES = 60    # 每段至少 1 秒，否则启动开销比渲染还大


def to_num(v):
    if v is None or v == '' or (isinstance(v, str) and v.strip().lower() in ('null', 'none')):
        return None
    return float(v)


def to_bool(v):
    if isinstance(v, bool):
        return v
    return str(v).strip().lower() in ('1', 'true', 'yes', 'y', '是')


def make_plan(req, k_dir):
    errs, notes = [], []
    film_name = str(req.get('film') or '').strip()
    if not film_name or '/' in film_name or film_name.startswith('.'):
        raise ValueError(f'film 不对：{film_name!r}（填 动画工坊/作品/ 下的目录名）')
    film_dir = os.path.join(k_dir, '作品', film_name)
    if not os.path.isfile(os.path.join(film_dir, 'film.json')):
        raise ValueError(f'作品不存在：{film_dir}/film.json')
    film, sb, sb_path = C.load_film(film_dir)

    scale = req.get('scale')
    scale = int(film.get('scale', 2)) if scale in (None, '') else int(float(scale))
    if scale not in (1, 2):
        raise ValueError(f'scale 只能是 1（1080p）或 2（4K），收到 {scale}')
    fps = req.get('fps')
    fps = int(film.get('fps', sb.get('fps', 60))) if fps in (None, '') else int(float(fps))
    if not 1 <= fps <= 120:
        raise ValueError(f'fps 不对：{fps}')
    music = str(req.get('music') or 'main').strip().lower()
    if music not in ('main', 'backup', 'none'):
        raise ValueError(f'music 只能是 main、backup、none，收到 {music!r}')

    total = float(sb['total'])
    t_from = to_num(req.get('from'))
    t_to = to_num(req.get('to'))
    t_from = 0.0 if t_from is None else t_from
    t_to = total if t_to is None else t_to
    if t_to > total + 1e-9:
        notes.append(f'to={t_to} 超过片长 {total}，改成片长')
        t_to = total
    if not (0 <= t_from < t_to):
        raise ValueError(f'范围不对：from={t_from} to={t_to}（片长 {total}）')
    f0, f1 = C.js_round(t_from * fps), C.js_round(t_to * fps)
    n = f1 - f0
    if n <= 0:
        raise ValueError(f'范围里没有帧：frames {f0}..{f1}')

    shards = req.get('shards')
    k = 20 if shards in (None, '') else int(float(shards))
    k0 = k
    k = max(1, min(k, MAX_SHARDS, max(1, n // MIN_SHARD_FRAMES)))
    if k != k0:
        notes.append(f'段数 {k0} 改成 {k}（1 到 {MAX_SHARDS} 段，每段至少 {MIN_SHARD_FRAMES} 帧）')

    bounds = [f0 + (2 * n * i + k) // (2 * k) for i in range(k + 1)]   # f0 + round(n*i/k)，整数运算
    shard_list = []
    for i in range(k):
        a, b = bounds[i], bounds[i + 1]
        sa, sb_ = C.frame_time(a, fps), C.frame_time(b, fps)
        # render.js 会做 Math.round(from*fps)：确认读回来正好是这一帧
        assert C.js_round(float(sa) * fps) == a and C.js_round(float(sb_) * fps) == b, (a, b, sa, sb_)
        shard_list.append({'idx': i, 'name': f'{i:03d}', 'from': sa, 'to': sb_, 'f0': a, 'f1': b, 'frames': b - a})
    assert bounds[0] == f0 and bounds[-1] == f1 and sum(s['frames'] for s in shard_list) == n
    assert all(s['frames'] > 0 for s in shard_list)
    assert all(shard_list[i]['f1'] == shard_list[i + 1]['f0'] for i in range(k - 1))

    lock = os.path.join(film_dir, 'package-lock.json')
    pw = 'none'
    if os.path.isfile(lock):
        pkgs = json.load(open(lock)).get('packages', {})
        pw = pkgs.get('node_modules/playwright', {}).get('version', 'none')
    rel = film.get('release', {})
    full = f0 == 0 and f1 == C.js_round(total * fps)
    plan = {
        'id': str(req.get('id') or ''), 'note': str(req.get('note') or ''),
        'film': film_name, 'film_dir': os.path.relpath(film_dir, os.path.dirname(k_dir)),
        'title': film.get('title', film_name), 'storyboard': os.path.relpath(sb_path, film_dir),
        'scale': scale, 'fps': fps, 'width': 1920 * scale, 'height': 1080 * scale,
        'music': music, 'release': to_bool(req.get('release', False)),
        'from': C.frame_time(f0, fps), 'to': C.frame_time(f1, fps), 'f0': f0, 'f1': f1, 'frames': n,
        'duration': n / fps, 'film_total': total, 'full': full,
        'shards': shard_list, 'playwright': pw,
        'tag_prefix': rel.get('tag_prefix', 'anim'), 'asset_basename': rel.get('asset_basename', 'film'),
        'display_name': rel.get('display_name', film.get('title', film_name)),
    }
    return plan, notes


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument('--request', required=True)
    ap.add_argument('--k', default=C.K, help='动画工坊目录（默认是本脚本上两级）')
    ap.add_argument('--out')
    a = ap.parse_args()
    try:
        req = json.load(open(a.request, encoding='utf-8'))
        if not isinstance(req, dict):
            raise ValueError('请求必须是一个 JSON 对象')
        plan, notes = make_plan(req, os.path.abspath(a.k))
    except (ValueError, KeyError, OSError, json.JSONDecodeError) as e:
        C.error(f'渲染请求有问题：{e}', '出片计划')
        return 1
    for n in notes:
        C.notice(n, '出片计划')
    if a.out:
        json.dump(plan, open(a.out, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    matrix = {'include': [{'idx': s['idx'], 'name': s['name'], 'from': s['from'], 'to': s['to'], 'frames': s['frames']}
                          for s in plan['shards']]}
    C.set_output(matrix=matrix, plan=plan, film_dir=plan['film_dir'], playwright=plan['playwright'],
                 release=str(plan['release']).lower(), music=plan['music'])
    msg = (f'{plan["title"]}：{plan["width"]}x{plan["height"]} {plan["fps"]} fps，帧 {plan["f0"]} 到 {plan["f1"] - 1}，'
           f'共 {plan["frames"]} 帧（{plan["duration"]:.3f} 秒），切 {len(plan["shards"])} 段，配乐 {plan["music"]}，'
           f'发布 {"是" if plan["release"] else "否"}')
    C.notice(msg, '出片计划')
    rows = '\n'.join(f'| {s["name"]} | {s["f0"]} | {s["f1"] - 1} | {s["frames"]} | {s["from"]} | {s["to"]} |' for s in plan['shards'])
    C.summary(f'## 出片计划\n\n{msg}\n\n请求 id：{plan["id"] or "（无）"}；说明：{plan["note"] or "（无）"}\n\n'
              f'| 段 | 首帧 | 末帧 | 帧数 | from | to |\n|---|---|---|---|---|---|\n{rows}')
    return 0


if __name__ == '__main__':
    sys.exit(main())
