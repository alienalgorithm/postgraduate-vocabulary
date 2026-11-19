#!/usr/bin/env python3
"""坏样本必被抓，好样本必放行：把 CI 里的每一道检查拿样本真跑一遍（执行主义）。

用法：python3 run_samples.py [--film 作品目录] [--only 名字,...] [--no-browser]
样本在 samples/：
  plan/      渲染请求（scale、music、范围、片名不对的必须拒绝；好的必须切得首尾相接）
  text/      画面文字（破折号、禁用字样必须抓，写成转义的也要抓；注释、正则、非画面字段、含这几个字母的长词不许误报）
  psnr/      参考静帧（错一个字必须抓；整片最低位差异必须放行）
  engine/    引擎 QA（字小、破折号必须抓）和确定性（画面依赖 seek 次数必须抓）的场景和分镜
  媒体样本   运行时用 ffmpeg 现做（mp4 不进仓库）：少一帧、帧率不对、尺寸不对、没音轨、音轨短、削波必须抓
  分镜检查   用作品自己的分镜派生：把一个场景挪离小节线必须抓，原分镜必须放行
  文件字样   运行时现做：说明文字、Python 词表、JS 词表里有禁用字样必须抓，clean_words.py 改写后必须一处不剩、程序读到的值不变；
             只有“国家”和含这几个字母的长词的文件不许误报、不许被改
--no-browser 跳过要浏览器的两组（引擎 QA、确定性）；CI 里不跳。
"""
import argparse
import json
import os
import shutil
import subprocess
import sys
import tempfile

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
os.environ['ANIM_SAMPLE_RUN'] = '1'
import ci_common as C  # noqa: E402
import stills_qa as SQ  # noqa: E402
import text_rules as TR  # noqa: E402
import verify_video as VV  # noqa: E402

S = os.path.join(HERE, 'samples')
RESULTS = []


def record(check, sample, expect_fail, failed, detail=''):
    ok = failed == expect_fail
    RESULTS.append((check, sample, expect_fail, failed, ok, detail))
    tag = ('抓住' if failed else '漏掉') if expect_fail else ('放行' if not failed else '误报')
    print(f'{"OK " if ok else "BAD"} {check:<10} {sample:<28} {tag}  {detail[:160]}', flush=True)


def sh(cmd, **kw):
    return subprocess.run(cmd, capture_output=True, text=True, **kw)


# ---------------------------------------------------------------- 出片计划
def t_plan(tmp):
    k = os.path.join(S, 'plan', 'k')
    for f in sorted(os.listdir(os.path.join(S, 'plan'))):
        if not f.endswith('.json'):
            continue
        out = os.path.join(tmp, 'plan_' + f)
        r = sh([sys.executable, os.path.join(HERE, 'plan.py'), '--request', os.path.join(S, 'plan', f), '--k', k, '--out', out])
        failed = r.returncode != 0
        detail = (r.stdout + r.stderr).strip().splitlines()[-1:] or ['']
        if not failed:
            p = json.load(open(out))
            sh_ = p['shards']
            cont = sh_[0]['f0'] == p['f0'] and sh_[-1]['f1'] == p['f1'] and all(
                sh_[i]['f1'] == sh_[i + 1]['f0'] for i in range(len(sh_) - 1)) and sum(s['frames'] for s in sh_) == p['frames']
            if not cont:
                failed = True
            detail = [f'{len(sh_)} 段，帧 {p["f0"]}..{p["f1"]}，{"首尾相接" if cont else "切错了"}']
        record('出片计划', f, f.startswith('bad'), failed, detail[0])


# ---------------------------------------------------------------- 文字规矩
def t_text(tmp):
    bad, _, _ = TR.scan(os.path.join(S, 'text', 'bad'))
    # 期望抓到的 6 处（用转义写，仓库文件里不出现这些字样）
    want = ['\u5148\u8bb0\u4f4f\u8fd9\u4e2a\u8bcd\u2014', '\u8001\u5916', '\u6bcd\u8bed',
            '\u004eative', '\u7b2c\u4e8c\u884c \u2014', '1\u20132']
    missing = [w for w in want if not any(w in b for b in bad)]
    places = {b.split(' 有')[0] for b in bad}
    record('文字规矩', 'text/bad（6 处）', True, len(places) == len(want) and not missing,
           f'抓到 {len(places)} 处 {len(bad)} 个' + (f'，漏了 {len(missing)} 处' if missing else ''))
    good, n, _ = TR.scan(os.path.join(S, 'text', 'good'))
    record('文字规矩', 'text/good', False, bool(good), f'查了 {n} 处' + (f'，误报 {good}' if good else ''))
    # 运行时现做的“刁钻好样本”：注释、正则里有真破折号和禁用词，字符串里有含这几个字母的长词，都不许误报
    g2 = os.path.join(tmp, 'text_good_tricky')
    shutil.copytree(os.path.join(S, 'text', 'good'), g2)
    dash, word = '\u2014', '\u5916\u56fd'
    extra = (f'// {word} {dash}{dash} n\x61tive\n/* {word} {dash} */\n'
             f'var r1 = /[{dash}\\u2013]/g, r2 = x / 2 / 3;\n'
             'var w = ["altern\x61tive", "n\x61tivity", "denomin\x61tive"].join(" ");\n')
    with open(os.path.join(g2, 'scenes', 's01.js'), 'a', encoding='utf-8') as f:
        f.write(extra)
    good2, n2, _ = TR.scan(g2)
    record('文字规矩', 'text/good+注释正则（现做）', False, bool(good2), f'查了 {n2} 处' + (f'，误报 {good2}' if good2 else ''))


# ---------------------------------------------------------------- 文件里的禁用字样（clean_words.py）
def t_clean(tmp):
    import ast
    cw = os.path.join(os.path.dirname(HERE), 'clean_words.py')
    w1, w2, en = '\u56fd\u7c4d', '\u5916\u56fd', 'n\x61tive'
    bad = os.path.join(tmp, 'clean_bad')
    os.makedirs(bad)
    lit = repr([w1, w2, '\u4fdd\u8bc1'])
    files = {'BRIEF.md': f'- \u7edd\u4e0d\u51fa\u73b0{w1}\u3001{w2}\u4e4b\u7c7b\u5b57\u6837\u3002\n',
             'tools.py': f'BANNED = {lit}\n', 'demo.js': f"var W = ['fluent', '{en}'];\n"}
    for n, t in files.items():
        open(os.path.join(bad, n), 'w', encoding='utf-8').write(t)
    caught = sh([sys.executable, cw, '--check', bad]).returncode != 0
    sh([sys.executable, cw, bad])
    left = sh([sys.executable, cw, '--check', bad]).returncode != 0
    py = open(os.path.join(bad, 'tools.py'), encoding='utf-8').read().split('=', 1)[1].strip()
    js = open(os.path.join(bad, 'demo.js'), encoding='utf-8').read().split('=', 1)[1].strip().rstrip(';')
    same = ast.literal_eval(py) == ast.literal_eval(lit) and ast.literal_eval(js) == ['fluent', en]
    record('文件字样', 'clean/bad（现做 3 个文件）', True, caught and not left and same,
           f'{"抓住" if caught else "没抓住"}；改写后{"还剩" if left else "一处不剩"}；程序读到的值{"不变" if same else "变了"}')
    good = os.path.join(tmp, 'clean_good')
    os.makedirs(good)
    gt = '- \u4e0d\u63d0\u7814\u7a76\u5728\u54ea\u4e2a\u56fd\u5bb6\u505a\u7684\u3002 altern\x61tive, denomin\x61tive\n'
    open(os.path.join(good, 'note.md'), 'w', encoding='utf-8').write(gt)
    flagged = sh([sys.executable, cw, '--check', good]).returncode != 0
    sh([sys.executable, cw, good])
    touched = open(os.path.join(good, 'note.md'), encoding='utf-8').read() != gt
    record('文件字样', 'clean/good（现做）', False, flagged or touched, '误报' if flagged else '被改了' if touched else '放行且没改')


# ---------------------------------------------------------------- 参考静帧 PSNR
def t_psnr(tmp):
    for name, exp in (('bad.png', True), ('good.png', False)):
        r = SQ.psnr_pair(os.path.join(S, 'psnr', 'ref.png'), os.path.join(S, 'psnr', name))
        record('参考静帧', 'psnr/' + name, exp, not SQ.psnr_ok(r), f'整帧 {r["psnr"]} dB，最差小块 {r["tile_psnr"]} dB')


# ---------------------------------------------------------------- 成片核对（媒体样本现做）
def t_media(tmp):
    W, H = 192, 108
    def mk(name, v='testsrc2=s=192x108:r=60', frames=60, a='sine=f=440:sample_rate=48000', adur=1.0, gain='-20dB'):
        out = os.path.join(tmp, name)
        cmd = ['ffmpeg', '-v', 'error', '-y', '-f', 'lavfi', '-i', v]
        if a:
            cmd += ['-f', 'lavfi', '-t', str(adur), '-i', a]
        cmd += ['-frames:v', str(frames), '-c:v', 'libx264', '-preset', 'veryfast', '-pix_fmt', 'yuv420p',
                '-color_primaries', 'bt709', '-color_trc', 'bt709', '-colorspace', 'bt709']
        if a:
            cmd += ['-af', f'volume={gain},aformat=channel_layouts=stereo', '-c:a', 'aac', '-b:a', '192k', '-ar', '48000', '-ac', '2']
        subprocess.run(cmd + [out], check=True)
        return out
    cases = [
        ('good.mp4', mk('good.mp4'), dict(), False),
        ('good_noaudio.mp4', mk('good_noaudio.mp4', a=None), dict(audio=False), False),
        ('bad_少一帧.mp4', mk('bad_frames.mp4', frames=59), dict(), True),
        ('bad_帧率30.mp4', mk('bad_fps.mp4', v='testsrc2=s=192x108:r=30'), dict(), True),
        ('bad_尺寸.mp4', mk('bad_size.mp4', v='testsrc2=s=160x90:r=60'), dict(), True),
        ('bad_没音轨.mp4', mk('bad_noaudio.mp4', a=None), dict(), True),
        ('bad_音轨短.mp4', mk('bad_short.mp4', adur=0.5), dict(), True),
        ('bad_削波.mp4', mk('bad_clip.mp4', gain='30dB'), dict(), True),
        ('bad_多音轨.mp4', os.path.join(tmp, 'good.mp4'), dict(audio=False), True),
    ]
    for name, path, kw, exp in cases:
        args = dict(frames=60, fps=60, width=W, height=H, audio=True)
        args.update(kw)
        bad, info = VV.verify(path, **args)
        record('成片核对', name, exp, bool(bad), '；'.join(bad) or f'真峰值 {info.get("true_peak")} dBTP')


# ---------------------------------------------------------------- 分镜检查（作品自己的 check_storyboard.py）
def t_story(tmp, film):
    if not os.path.isfile(os.path.join(film, 'story', 'check_storyboard.py')):
        print('跳过分镜检查样本：作品没有 story/check_storyboard.py')
        return
    sb = json.load(open(os.path.join(film, 'story', 'storyboard.json'), encoding='utf-8'))
    bad = os.path.join(tmp, 'storyboard_shifted.json')
    sb['scenes'][1]['start'] = round(sb['scenes'][1]['start'] + 0.3, 3)
    json.dump(sb, open(bad, 'w', encoding='utf-8'), ensure_ascii=False)
    for name, extra, exp in (('第 2 场挪 0.3 秒', ['--storyboard', bad], True), ('原分镜', [], False)):
        r = sh([sys.executable, os.path.join(HERE, 'check_story.py'), film] + extra)
        tail = [ln for ln in r.stdout.splitlines() if ln.startswith(('PASS', 'FAIL', '  -'))]
        record('分镜检查', name, exp, r.returncode != 0, ' '.join(tail[:2]))


# ---------------------------------------------------------------- 引擎 QA 和确定性（要浏览器）
def engine_view(tmp, film, scene, sbfile):
    v = tempfile.mkdtemp(prefix='view_', dir=tmp)
    shutil.copytree(os.path.join(film, 'engine'), os.path.join(v, 'engine'), ignore=shutil.ignore_patterns('__pycache__'))
    for d in ('fonts', 'node_modules'):
        os.symlink(os.path.join(film, d), os.path.join(v, d))
    os.makedirs(os.path.join(v, 'scenes'))
    os.makedirs(os.path.join(v, 'story'))
    shutil.copy(os.path.join(S, 'engine', scene), os.path.join(v, 'scenes', scene))
    shutil.copy(os.path.join(S, 'engine', sbfile), os.path.join(v, 'story', 'storyboard.json'))
    return v


def t_engine(tmp, film):
    if not os.path.isdir(os.path.join(film, 'node_modules', 'playwright')):
        record('引擎', '（没有 node_modules）', False, True, f'先在 {film} 里 npm ci')
        return
    for name, exp in (('qa_bad', True), ('qa_good', False)):
        v = engine_view(tmp, film, name + '.js', f'storyboard_{name}.json')
        r = sh(['node', 'engine/still.js', '--scale', '1', '--outdir', os.path.join(v, 'out'), '1.0'], cwd=v)
        types = sorted({ln.split()[0] for ln in r.stdout.splitlines() if ln.startswith('    ')})
        failed = r.returncode != 0
        if exp and failed and not {'small', 'dash'} <= set(types):
            failed = False                              # 退出了但没报出该报的两类，算漏
        record('引擎 QA', f'engine/{name}.js', exp, failed, f'退出码 {r.returncode}，问题类型 {types}' + ('' if r.returncode in (0, 3) else ' ' + r.stderr[-200:]))
    for name, exp in (('det_bad', True), ('det_good', False)):
        v = engine_view(tmp, film, name + '.js', f'storyboard_{name}.json')
        r = sh(['node', 'engine/test.js', '--storyboard', os.path.join(v, 'story', 'storyboard.json'),
                '--times', '0.2,0.7,1.1,1.6'], cwd=v)
        last = [ln for ln in r.stdout.splitlines() if 'instants' in ln][-1:] or [r.stdout.strip()[-120:] + r.stderr.strip()[-200:]]
        record('确定性', f'engine/{name}.js', exp, r.returncode != 0, last[0])


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument('--film', default=os.path.join(C.K, '作品', '如何真正学好英语'))
    ap.add_argument('--only', help='plan,text,psnr,media,story,clean,engine')
    ap.add_argument('--no-browser', action='store_true')
    a = ap.parse_args()
    film = os.path.abspath(a.film)
    only = set(a.only.split(',')) if a.only else None
    tmp = tempfile.mkdtemp(prefix='anim_samples_')
    try:
        groups = [('plan', lambda: t_plan(tmp)), ('text', lambda: t_text(tmp)), ('psnr', lambda: t_psnr(tmp)),
                  ('media', lambda: t_media(tmp)), ('story', lambda: t_story(tmp, film)),
                  ('clean', lambda: t_clean(tmp))]
        if not a.no_browser:
            groups.append(('engine', lambda: t_engine(tmp, film)))
        for g, fn in groups:
            if only and g not in only:
                continue
            try:
                fn()
            except Exception as e:  # noqa: BLE001
                record(g, '（运行出错）', False, True, repr(e))
    finally:
        shutil.rmtree(tmp, ignore_errors=True)
    os.environ.pop('ANIM_SAMPLE_RUN', None)
    bad = [r for r in RESULTS if not r[4]]
    nb = sum(1 for r in RESULTS if r[2])
    msg = f'{len(RESULTS)} 个样本：坏样本 {nb} 个，抓住 {sum(1 for r in RESULTS if r[2] and r[3])} 个；好样本 {len(RESULTS) - nb} 个，放行 {sum(1 for r in RESULTS if not r[2] and not r[3])} 个'
    rows = '\n'.join(f'| {r[0]} | {r[1]} | {"坏" if r[2] else "好"} | {"对" if r[4] else "错"} | {r[5][:80].replace("|", "/")} |' for r in RESULTS)
    C.summary(f'### 坏样本必抓、好样本必放：{"通过" if not bad else "不通过"}\n\n{msg}\n\n| 检查 | 样本 | 类型 | 结果 | 说明 |\n|---|---|---|---|---|\n{rows}')
    (C.notice if not bad else C.error)(msg, '样本')
    for r in bad:
        C.error(f'{r[0]} {r[1]}：{"坏样本没抓住" if r[2] else "好样本被误报"}（{r[5][:200]}）', '样本')
    return 1 if bad else 0


if __name__ == '__main__':
    sys.exit(main())
