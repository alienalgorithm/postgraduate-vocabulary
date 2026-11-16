#!/usr/bin/env python3
"""build_manifest.py <final ref>: write RELEASE-MANIFEST.json from that ref's 最终定稿/当前清单.json,
check every alias path's blob at the ref, and fill a local cache (named by SHA-256) for the rehearsal."""
import hashlib, json, subprocess, sys
from pathlib import Path
REPO = Path('/home/user/postgraduate-vocabulary'); S = Path('/tmp/claude-0/-home-user/3d87cc6c-41dd-58c2-802f-d51dc0c78527/scratchpad')
W = S / 'relwf'; cache = S / 'release/bysha'; cache.mkdir(parents=True, exist_ok=True)
ref = sys.argv[1]
g = lambda *a: subprocess.run(['git', *a], cwd=REPO, capture_output=True, check=True).stdout
commit = g('rev-parse', ref).decode().strip()
cur = json.loads(g('show', f'{commit}:视频修订定稿/最终定稿/当前清单.json'))
vids = sorted(cur['videos'], key=lambda v: int(v['current_video_order']))
assert [int(v['current_video_order']) for v in vids] == list(range(1, 71)), 'need all 70'
rows = []
for v in vids:
    no = int(v['current_video_order']); path = '视频修订定稿/' + v['alias_path']
    blob = g('ls-tree', commit, '--', path).decode().split()
    assert blob and blob[2] == v['git_blob_sha'], (no, path, blob)
    f = cache / f"{v['sha256']}.mp4"
    if not (f.exists() and f.stat().st_size == v['bytes']):
        pk = S / f"pkg/{no:02d}/video.mp4"
        data = pk.read_bytes() if pk.exists() and pk.stat().st_size == v['bytes'] else g('cat-file', '-p', v['git_blob_sha'])
        f.write_bytes(data)
    h = hashlib.sha256(f.read_bytes()).hexdigest(); assert h == v['sha256'], (no, h)
    rows.append({'video_order': no, 'title_zh': v['title_zh'], 'release_name': f"{no} {v['title_zh']}.mp4",
                 'bytes': v['bytes'], 'sha256': v['sha256'], 'commit': commit, 'repo_path': path})
m = {'tag': 'all70-final-4k-20261116-v1',
     'title': '考研学人｜70篇4K定稿全集（2026-11-16）',
     'zip_asset_name': 'kaoyan-70-final-4k-20261116.zip', 'zip_label': '考研学人70篇4K定稿.zip', 'zip_folder': '考研学人70篇4K定稿',
     'notes': '70 篇全部 4K 定稿视频，打成一个 ZIP。\n\n'
              f'文件名是“序号 空格 中文名”，例如“{rows[0]["release_name"]}”“{rows[55]["release_name"]}”，按视频序号排列。\n'
              '第 49、53 篇是 2026-11-16 新定稿的版本。\n'
              '视频原样打包，没有重新编码；包内附 MANIFEST.json 和 SHA256SUMS.txt，可以逐个核对。',
     'source_commit': commit, 'total_bytes': sum(r['bytes'] for r in rows), 'videos': rows}
(W / '.github/all70-final-4k/RELEASE-MANIFEST.json').write_text(json.dumps(m, ensure_ascii=False, indent=2) + '\n')
print(commit, len(rows), m['total_bytes'])
