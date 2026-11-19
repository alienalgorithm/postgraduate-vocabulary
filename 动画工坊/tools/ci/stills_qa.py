#!/usr/bin/env python3
"""静帧检查：出静帧、收集引擎自带 QA、和参考静帧比 PSNR、拼联系表。只看画面本身。

用法：python3 stills_qa.py <作品目录> --out 输出目录 [--scale 1] [--no-ref]
      python3 stills_qa.py <作品目录> --make-refs [--times s01:5.6,s02:4.0,...]   重出 qa/ref/ 参考静帧（update_refs.sh 调它）
1. 时刻：每个已写好的场景（scenes/ 里有它的文件）取场景中点，加上每行字完整显示的中点（(in+out)/2），
   相隔不到 0.25 秒的合并；再加上 qa/ref/manifest.json 里的参考时刻
2. 每个场景跑一次 engine/still.js（1080p），收集它的 QA：small（字小于 40px）、dash（破折号）、font（不是作品字体）、
   outside（字出画）、overlap（两块字重叠）；有任何一条或引擎报错就不通过
3. 参考静帧对比：manifest 里每张参考图记着出图时的输入指纹（引擎、字体、素材、依赖、该场景文件、分镜里该场景和全局设置）。
   指纹相同（这场景没人改过）才比：整帧 PSNR 低于 40 dB 或最差的 64x64 小块低于 28 dB 判不通过。
   指纹不同说明场景被有意改过，只提示“参考图过期，跑 tools/ci/update_refs.sh”，不卡（不是质量问题）。
   阈值的理由：同一软件在不同 CPU 上只会差最低几位（Skia、SwiftShader 走不同指令集），
   整帧 ±2 的差 PSNR 也在 42 dB 以上；test.js 容忍的光栅噪声（不到 0.1% 的像素差 8/255 以内）即使挤在一个小块里，
   小块 PSNR 也在 33 dB 以上。反过来，只要错一个字（字形回落、少字、错位），那个小块的 PSNR 就掉到 20 dB 以下，
   整帧也会低于 40 dB。所以 40/28 能放过机器差异、抓住任何看得见的变化。
4. 联系表 contact.jpg：全部静帧缩略图，有 QA 问题的红框，参考图对比不通过的橙框。
"""
import argparse
import hashlib
import json
import math
import os
import re
import subprocess
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import ci_common as C  # noqa: E402

PSNR_MIN = 40.0
TILE_PSNR_MIN = 28.0
TILE = 64
MERGE = 0.25
DESCRIPTIVE = ('version', 'rationale', 'changes_from_plan', 'review_changes')


# ---------------------------------------------------------------- 图像对比
def psnr_pair(a_path, b_path):
    import numpy as np
    from PIL import Image
    a = np.asarray(Image.open(a_path).convert('RGB'), np.float64)
    b = np.asarray(Image.open(b_path).convert('RGB'), np.float64)
    if a.shape != b.shape:
        return {'psnr': 0.0, 'tile_psnr': 0.0, 'note': f'尺寸不同 {a.shape[1]}x{a.shape[0]} / {b.shape[1]}x{b.shape[0]}'}
    d2 = ((a - b) ** 2).mean(axis=2)
    def p(mse):
        return 99.0 if mse <= 0 else min(99.0, 10 * math.log10(255.0 ** 2 / mse))
    worst, where = 99.0, (0, 0)
    h, w = d2.shape
    for y in range(0, h, TILE):
        for x in range(0, w, TILE):
            v = p(float(d2[y:y + TILE, x:x + TILE].mean()))
            if v < worst:
                worst, where = v, (x, y)
    return {'psnr': round(p(float(d2.mean())), 2), 'tile_psnr': round(worst, 2), 'worst_tile_xy': where,
            'max_diff': int(np.abs(a - b).max())}


def psnr_ok(r):
    return r['psnr'] >= PSNR_MIN and r['tile_psnr'] >= TILE_PSNR_MIN


# ---------------------------------------------------------------- 输入指纹
def _hash_tree(h, root, sub):
    base = os.path.join(root, sub)
    if os.path.isfile(base):
        h.update(sub.encode() + b'\0')
        h.update(open(base, 'rb').read())
        return
    for dp, dns, fns in os.walk(base):
        dns[:] = sorted(d for d in dns if d not in ('__pycache__', 'node_modules', 'test'))
        for fn in sorted(fns):
            if fn.endswith('.md'):
                continue                                # 说明文字不影响画面
            p = os.path.join(dp, fn)
            h.update(os.path.relpath(p, root).encode() + b'\0')
            with open(p, 'rb') as f:
                for blk in iter(lambda: f.read(1 << 20), b''):
                    h.update(blk)


_common_cache = {}


def ref_fingerprint(film_dir, sb, scene_id):
    """影响这个场景画面的全部输入的 sha256（前 16 位）。.md 说明文件不算。"""
    if film_dir not in _common_cache:
        h = hashlib.sha256()
        for sub in ('engine', 'fonts', 'assets', 'package-lock.json', 'music/energy.json'):
            if os.path.exists(os.path.join(film_dir, sub)):
                _hash_tree(h, film_dir, sub)
        top = {k: v for k, v in sb.items() if k != 'scenes' and k not in DESCRIPTIVE}
        h.update(json.dumps(top, sort_keys=True, ensure_ascii=False).encode())
        _common_cache[film_dir] = h.digest()
    h = hashlib.sha256(_common_cache[film_dir])
    sc = next(s for s in sb['scenes'] if s['id'] == scene_id)
    h.update(json.dumps(sc, sort_keys=True, ensure_ascii=False).encode())
    p = os.path.join(film_dir, 'scenes', C.scene_file(sc))
    h.update(open(p, 'rb').read() if os.path.isfile(p) else b'missing')
    return h.hexdigest()[:16]


# ---------------------------------------------------------------- 选时刻、出图
def ready_scenes(film_dir, sb):
    return [s for s in sb['scenes'] if os.path.isfile(os.path.join(film_dir, 'scenes', C.scene_file(s)))]


def qa_times(s):
    dur = float(s['duration'])
    cand = [dur / 2]
    for t in s.get('texts') or []:
        try:
            a, b = float(t['in']), float(t.get('out', dur))
        except (KeyError, TypeError, ValueError):
            continue
        if b > a:
            cand.append(min(max((a + b) / 2, 0.0), dur - 1e-3))
    out = []
    for t in sorted(cand):
        if not out or t - out[-1] >= MERGE:
            out.append(t)
    return [round(float(s['start']) + t, 3) for t in out]


LINE = re.compile(r'^(\S.*\.png)\s+(\d+)x(\d+)(?:\s+QA (\d+) issue)?')
ISSUE = re.compile(r'^\s{4}(\S+)\s+\[([^\]]*)\]\s+"(.*)"\s+(.*)$')


def run_still(film_dir, times, outdir, scale, prefix=''):
    """跑 still.js；返回 ({png路径: [问题...]}, 引擎错误列表, 退出码)。"""
    os.makedirs(outdir, exist_ok=True)
    cmd = ['node', 'engine/still.js', '--scale', str(scale), '--outdir', os.path.abspath(outdir)]
    if prefix:
        cmd += ['--prefix', prefix]
    r = subprocess.run(cmd + [repr(t) for t in times], cwd=film_dir, capture_output=True, text=True)
    stills, cur, errors = {}, None, []
    for ln in r.stdout.splitlines():
        m = LINE.match(ln)
        if m:
            cur = m.group(1)
            stills[cur] = []
            continue
        m = ISSUE.match(ln)
        if m and cur:
            stills[cur].append({'type': m.group(1), 'scene': m.group(2), 'text': m.group(3), 'detail': m.group(4)})
    for ln in r.stderr.splitlines():
        if ln.startswith('ERROR') or ln.startswith('still.js failed'):
            errors.append(ln.strip())
    if r.returncode not in (0, 3) and not errors:
        errors.append(f'still.js 退出码 {r.returncode}：' + (r.stderr.strip().splitlines() or [''])[-1])
    return stills, errors, r.returncode


def contact_sheet(entries, path, cols=5, tw=480):
    from PIL import Image, ImageDraw, ImageFont
    if not entries:
        return
    th = tw * 9 // 16
    lab = 22
    rows = math.ceil(len(entries) / cols)
    sheet = Image.new('RGB', (cols * tw, rows * (th + lab)), (24, 24, 28))
    dr = ImageDraw.Draw(sheet)
    try:
        font = ImageFont.load_default(size=16)
    except TypeError:
        font = ImageFont.load_default()
    for k, e in enumerate(entries):
        x, y = (k % cols) * tw, (k // cols) * (th + lab)
        try:
            im = Image.open(e['png']).convert('RGB').resize((tw, th), Image.LANCZOS)
            sheet.paste(im, (x, y + lab))
        except Exception:  # noqa: BLE001
            pass
        color = (255, 70, 70) if e.get('qa') else (255, 160, 40) if e.get('ref_bad') else (200, 200, 200)
        dr.text((x + 6, y + 3), f'{e["scene"]}  t={e["t"]:.3f}s' + (f'  QA {len(e["qa"])}' if e.get('qa') else '')
                + (f'  PSNR {e["psnr"]}' if e.get('psnr') is not None else ''), fill=color, font=font)
        if e.get('qa') or e.get('ref_bad'):
            dr.rectangle([x + 1, y + lab + 1, x + tw - 2, y + lab + th - 2], outline=color, width=4)
    sheet.save(path, quality=88)


# ---------------------------------------------------------------- 主流程
def check(film_dir, out, scale, use_ref=True, only=None):
    film, sb, _ = C.load_film(film_dir)
    name = os.path.basename(os.path.normpath(film_dir))
    ref_dir = os.path.join(film_dir, 'qa', 'ref')
    manifest = json.load(open(os.path.join(ref_dir, 'manifest.json'), encoding='utf-8')) if use_ref and os.path.isfile(os.path.join(ref_dir, 'manifest.json')) else {'refs': []}
    scenes = [s for s in ready_scenes(film_dir, sb) if not only or s['id'] in only]
    plan = {s['id']: qa_times(s) for s in scenes}
    for r in manifest['refs']:
        if r['scene'] in plan and r['t'] not in plan[r['scene']]:
            plan[r['scene']] = sorted(plan[r['scene']] + [r['t']])
    entries, errors, n_qa = [], [], 0
    by_t = {}
    for s in scenes:
        stills, errs, code = run_still(film_dir, plan[s['id']], os.path.join(out, s['id']), scale)
        errors += [f'{s["id"]}：{e}' for e in errs]
        for png, issues in stills.items():
            t = float(os.path.basename(png)[2:-4])
            e = {'scene': s['id'], 't': t, 'png': png, 'qa': issues}
            entries.append(e)
            by_t[(s['id'], round(t, 3))] = e
            n_qa += len(issues)
            for i in issues:
                C.error(f'{s["id"]} t={t:.3f}s {i["type"]} "{i["text"]}" {i["detail"]}', '引擎 QA')
        got = len(stills)
        if got != len(plan[s['id']]) and not errs:
            errors.append(f'{s["id"]}：要出 {len(plan[s["id"]])} 张，只出了 {got} 张')
    for e in errors:
        C.error(e, '静帧')

    # 参考静帧
    ref_rows, ref_bad, stale = [], 0, 0
    for r in manifest['refs']:
        if r['scene'] not in plan and any(s['id'] == r['scene'] for s in sb['scenes']) and (only and r['scene'] not in only):
            continue                                    # 这次没查这个场景（--scenes）
        e = by_t.get((r['scene'], round(r['t'], 3)))
        fp = ref_fingerprint(film_dir, sb, r['scene']) if any(s['id'] == r['scene'] for s in sb['scenes']) else 'gone'
        if fp != r['fingerprint'] or e is None or r.get('scale', 1) != scale:
            stale += 1
            ref_rows.append(f'| {r["file"]} | {r["scene"]} | {r["t"]} | 过期，跳过 | | |')
            continue
        res = psnr_pair(os.path.join(ref_dir, r['file']), e['png'])
        e['psnr'] = res['psnr']
        ok = psnr_ok(res)
        if not ok:
            ref_bad += 1
            e['ref_bad'] = True
            C.error(f'{r["file"]}：整帧 PSNR {res["psnr"]} dB（下限 {PSNR_MIN}），最差小块 {res["tile_psnr"]} dB（下限 {TILE_PSNR_MIN}，'
                    f'位置 {res.get("worst_tile_xy")}），最大差 {res.get("max_diff")}/255', '参考静帧')
        ref_rows.append(f'| {r["file"]} | {r["scene"]} | {r["t"]} | {"通过" if ok else "不通过"} | {res["psnr"]} | {res["tile_psnr"]} |')
    if stale:
        C.notice(f'{stale} 张参考图对应的场景改过了，这次不比；画面定了以后跑 bash 动画工坊/tools/ci/update_refs.sh 作品目录', '参考静帧')

    entries.sort(key=lambda e: e['t'])
    os.makedirs(out, exist_ok=True)
    contact_sheet(entries, os.path.join(out, 'contact.jpg'))
    json.dump({'stills': [{k: v for k, v in e.items()} for e in entries], 'errors': errors},
              open(os.path.join(out, 'qa.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    ok = not errors and not n_qa and not ref_bad
    psnrs = [e['psnr'] for e in entries if e.get('psnr') is not None]
    msg = (f'{name}：{len(scenes)} 个场景出了 {len(entries)} 张 {1080 * scale}p 静帧，引擎 QA 问题 {n_qa} 个，引擎错误 {len(errors)} 个；'
           f'参考图 {len(manifest["refs"])} 张，比了 {len(psnrs)} 张，最低 PSNR {min(psnrs) if psnrs else "无"} dB，不通过 {ref_bad} 张，过期 {stale} 张')
    (C.notice if ok else C.error)(msg, '静帧检查')
    C.summary(f'### 静帧检查：{"通过" if ok else "不通过"}\n\n{msg}\n\n'
              + (f'| 参考图 | 场景 | 秒 | 结果 | PSNR | 最差小块 |\n|---|---|---|---|---|---|\n' + '\n'.join(ref_rows) if ref_rows else ''))
    return 0 if ok else 1


def make_refs(film_dir, spec, scale=1):
    film, sb, _ = C.load_film(film_dir)
    ref_dir = os.path.join(film_dir, 'qa', 'ref')
    os.makedirs(ref_dir, exist_ok=True)
    picks = []
    if spec:
        for item in spec.split(','):
            sid, t = item.split(':')
            sc = next(s for s in sb['scenes'] if s['id'] == sid)
            picks.append((sid, round(float(sc['start']) + float(t), 3)))
    else:                               # 默认：s01 到 s05 每场字最多的那一刻，再加一个离这些时刻最远的检查时刻
        five = ready_scenes(film_dir, sb)[:5]
        for s in five:
            best = max(qa_times(s), key=lambda g: sum(1 for t in s.get('texts') or []
                                                      if float(s['start']) + t['in'] <= g < float(s['start']) + t.get('out', 1e9)))
            picks.append((s['id'], best))
        cand = [(s['id'], t) for s in five for t in qa_times(s)]
        if cand:
            picks.append(max(cand, key=lambda c: min(abs(c[1] - p[1]) for p in picks)))
    for f in os.listdir(ref_dir):
        if f.endswith('.png'):
            os.remove(os.path.join(ref_dir, f))
    refs, bad = [], 0
    for sid in sorted({p[0] for p in picks}):
        ts = sorted(t for s, t in picks if s == sid)
        stills, errs, code = run_still(film_dir, ts, ref_dir, scale, prefix=f'{sid}_')
        for e in errs:
            print('错误 ' + e)
            bad += 1
        for png, issues in stills.items():
            t = float(os.path.basename(png)[len(sid) + 3:-4])
            if issues:
                print(f'提醒 {os.path.basename(png)} 有 QA 问题：{issues}')
            refs.append({'file': os.path.basename(png), 'scene': sid, 't': round(t, 3), 'scale': scale,
                         'fingerprint': ref_fingerprint(film_dir, sb, sid)})
    refs.sort(key=lambda r: r['t'])
    json.dump({'note': '参考静帧，stills_qa.py 用；由 update_refs.sh 生成，不要手改', 'psnr_min': PSNR_MIN,
               'tile_psnr_min': TILE_PSNR_MIN, 'refs': refs},
              open(os.path.join(ref_dir, 'manifest.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    for r in refs:
        print(f'参考图 {r["file"]}  {r["scene"]}  {r["t"]} 秒  指纹 {r["fingerprint"]}')
    return 1 if bad or not refs else 0


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument('film')
    ap.add_argument('--out')
    ap.add_argument('--scale', type=int, default=1)
    ap.add_argument('--no-ref', action='store_true')
    ap.add_argument('--scenes', help='只查这些场景（逗号分隔），本机快速试用')
    ap.add_argument('--make-refs', action='store_true')
    ap.add_argument('--times', help='--make-refs 用：s01:5.6,s02:4.0（场景内秒数）')
    a = ap.parse_args()
    film = os.path.abspath(a.film)
    if a.make_refs:
        return make_refs(film, a.times, a.scale)
    if not a.out:
        ap.error('--out 必填')
    return check(film, os.path.abspath(a.out), a.scale, not a.no_ref, a.scenes.split(',') if a.scenes else None)


if __name__ == '__main__':
    sys.exit(main())
