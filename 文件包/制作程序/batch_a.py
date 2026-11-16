#!/usr/bin/env python3
"""Phase A for one article: data, final video (from the manifest's git blob), 视频同屏版, two cards, 阅读版, stamps."""
import json, subprocess, sys, hashlib
from pathlib import Path
S = Path('/tmp/claude-0/-home-user/3d87cc6c-41dd-58c2-802f-d51dc0c78527/scratchpad'); T = S / 'pkgtools'
REPO = Path('/home/user/postgraduate-vocabulary')
def run(*a): subprocess.run([str(x) for x in a], check=True, cwd=T, capture_output=True, text=True)
def main(no):
    man = {v['current_video_order']: v for v in json.loads((S / 'current_manifest_pr33.json').read_text())['videos']}
    v = man[no]; W = S / f'pkg/{no}'; out = W / 'out'; out.mkdir(parents=True, exist_ok=True)
    run('python3', T / 'prep.py', no)
    a = json.loads((W / 'article.json').read_text())
    vid = W / 'video.mp4'
    if not vid.exists() or hashlib.sha256(vid.read_bytes()).hexdigest() != v['sha256']:
        with open(vid, 'wb') as f: subprocess.run(['git', 'cat-file', '-p', v['git_blob_sha']], check=True, cwd=REPO, stdout=f)
    assert hashlib.sha256(vid.read_bytes()).hexdigest() == v['sha256'], 'video sha'
    run('python3', T / 'screens.py', vid, W / 'article.json', out / 'screens-unsigned.pdf', W / 'work')
    run('python3', T / 'cards.py', W / 'article.json', out / 'zh2en-unsigned.pdf', 'zh2en')
    run('python3', T / 'cards.py', W / 'article.json', out / 'en2zh-unsigned.pdf', 'en2zh')
    run('python3', T / 'reading.py', no, out / 'reading-unsigned.pdf')
    title = f'{no} {a["title_zh"]}'; P = W / 'pack' / title; P.mkdir(parents=True, exist_ok=True)
    for k, n in [('screens', '1 视频同屏版'), ('zh2en', '2 汉译英听写卡'), ('en2zh', '3 英译汉听写卡'), ('reading', '6 阅读版')]:
        run('python3', T / 'stamp.py', out / f'{k}-unsigned.pdf', P / f'{title} {n}.pdf', f'package {no} {k}')
    (P / f'{title} 7 视频.mp4').write_bytes(vid.read_bytes())
    print(no, 'ok', len(a['sentences']), 'sentences', len(a['vocab']), 'words', flush=True)
if __name__ == '__main__':
    for no in sys.argv[1:]:
        try: main(no)
        except subprocess.CalledProcessError as e: print(no, 'FAIL', (e.stderr or '')[-600:], flush=True)
        except Exception as e: print(no, 'FAIL', repr(e)[:600], flush=True)
