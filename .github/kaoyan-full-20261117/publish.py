"""Publish the full 考研学人 materials as a Release (user 2026-11-17).
Two ZIPs hold one folder "考研学人全套资料": the two textbooks at the top, and 70 article folders
("序号 中文标题 英文标题"), each with its video ("序号 中文名.mp4", user 2026-11-16 naming rule) and six PDFs.
A third ZIP holds the shop images and listing text. Every file is fetched from its pinned commit and checked
against the manifest's bytes and SHA-256 (videos are not re-encoded); each ZIP is checked member by member,
uploaded, the Release published, and every public ZIP downloaded again and checked."""
import hashlib, json, os, re, subprocess, time, urllib.parse, urllib.request, zipfile
from collections import defaultdict
from pathlib import Path, PurePosixPath
HERE = Path(__file__).resolve().parent
REPO = 'alienalgorithm/postgraduate-vocabulary'
LIMIT = 2 * 1024**3
TOP = '考研学人全套资料'
BAD = set('<>:"\\|?*')

def need(ok, msg):
    if not ok: raise SystemExit('STOP: ' + msg)

def api(path, method='GET', data=None, missing_ok=False):
    cmd = ['gh', 'api', 'repos/' + REPO + '/' + path] + (['-X', method] if method != 'GET' else []) + (['--input', '-'] if data is not None else [])
    r = subprocess.run(cmd, input=None if data is None else json.dumps(data).encode(), capture_output=True)
    if missing_ok and r.returncode and b'(HTTP 404)' in r.stderr: return None
    need(r.returncode == 0, r.stderr.decode(errors='replace'))
    return json.loads(r.stdout)

def fetch(url, path=None, want=None):
    for attempt in range(6):
        try:
            h, n = hashlib.sha256(), 0
            with urllib.request.urlopen(urllib.request.Request(url, headers={'User-Agent': 'release-check'}), timeout=300) as src:
                out = open(path, 'wb') if path else None
                while chunk := src.read(1 << 20):
                    h.update(chunk); n += len(chunk)
                    if out: out.write(chunk)
                if out: out.close()
            if want and (n, h.hexdigest()) != want:
                print('mismatch, retry', url, n, flush=True); time.sleep(5 * (attempt + 1)); continue
            return n, h.hexdigest()
        except (OSError, urllib.error.URLError) as e:
            print('retry', attempt + 1, url, e, flush=True); time.sleep(5 * (attempt + 1))
    need(False, 'download failed or mismatched: ' + url)

def get(f, path):
    if os.environ.get('LOCAL_GIT'):   # local rehearsal only
        with open(path, 'wb') as o: subprocess.run(['git', 'cat-file', 'blob', f"{f['commit']}:{f['repo_path']}"], cwd=os.environ['LOCAL_GIT'], stdout=o, check=True)
        d = path.read_bytes(); need((len(d), hashlib.sha256(d).hexdigest()) == (f['bytes'], f['sha256']), 'local blob ' + f['repo_path'])
    else:
        url = f"https://raw.githubusercontent.com/{REPO}/{f['commit']}/" + urllib.parse.quote(f['repo_path'], safe='/')
        fetch(url, path, (f['bytes'], f['sha256']))

def check_manifest(c):
    need(re.fullmatch(r'[A-Za-z0-9._-]+', c['tag']) and len(c['assets']) == 3, 'tag/assets')
    for a in c['assets']:
        need(re.fullmatch(r'[A-Za-z0-9._-]+\.zip', a['asset_name']) and a['label'].endswith('.zip'), 'asset name ' + a['asset_name'])
        need(sum(f['bytes'] for f in a['files']) == a['total_bytes'] < LIMIT - (64 << 20), 'asset total ' + a['asset_name'])
        need(len({f['zip_path'] for f in a['files']}) == len(a['files']), 'duplicate zip paths')
        for f in a['files']:
            need(re.fullmatch('[0-9a-f]{40}', f['commit']) and re.fullmatch('[0-9a-f]{64}', f['sha256']) and f['bytes'] > 0, 'identity ' + f['zip_path'])
            parts = PurePosixPath(f['zip_path']).parts
            need('..' not in parts and '..' not in PurePosixPath(f['repo_path']).parts and not any(set(p) & BAD or p != p.strip() or p.endswith('.') for p in parts), 'path ' + f['zip_path'])
    # folder layout the user asked for: two textbooks at the top, then exactly 70 article folders with 7 files each
    full = [f['zip_path'] for a in c['assets'][:2] for f in a['files']]
    need(all(p.startswith(TOP + '/') for p in full), 'top folder')
    top_files = sorted(p for p in full if p.count('/') == 1)
    need(top_files == sorted([f'{TOP}/考研学人 教材 普通版.pdf', f'{TOP}/考研学人 教材 羊皮纸古书版.pdf']), 'textbooks at the top: ' + str(top_files))
    folders = defaultdict(list)
    for p in full:
        if p.count('/') == 2: folders[p.split('/')[1]].append(p.split('/')[2])
        else: need(p.count('/') == 1, 'unexpected depth ' + p)
    need(len(folders) == 70, f'{len(folders)} article folders')
    nums = sorted(int(k.split(' ')[0]) for k in folders); need(nums == list(range(1, 71)), 'folder numbers')
    for k, files in folders.items():
        n = k.split(' ')[0]
        need(not n.startswith('0'), 'no leading zero: ' + k)
        mp4 = [x for x in files if x.endswith('.mp4')]
        need(len(files) == 7 and len(mp4) == 1 and sum(x.endswith('.pdf') for x in files) == 6, 'folder content ' + k + ' ' + str(files))
        stem = mp4[0][:-4]   # "序号 中文名"
        need(stem.startswith(n + ' ') and k.startswith(stem + ' ') and all(x.startswith(stem + ' ') for x in files if x.endswith('.pdf')), 'names in ' + k)

def build_zip(a, out):
    zp = out / a['asset_name']; tmp = out / 'tmp.bin'
    with zipfile.ZipFile(zp, 'x', compression=zipfile.ZIP_STORED, allowZip64=True) as z:
        for f in a['files']:
            get(f, tmp); z.write(tmp, f['zip_path']); tmp.unlink()
    need(zp.stat().st_size < LIMIT, 'zip over 2 GiB')
    with zipfile.ZipFile(zp) as z:
        need(z.namelist() == [f['zip_path'] for f in a['files']], 'zip members ' + a['asset_name'])
        for f in a['files']:
            h = hashlib.sha256()
            with z.open(f['zip_path']) as s:
                while chunk := s.read(1 << 20): h.update(chunk)
            need(h.hexdigest() == f['sha256'], 'zip member sha ' + f['zip_path'])
    h = hashlib.sha256()
    with open(zp, 'rb') as s:
        while chunk := s.read(1 << 20): h.update(chunk)
    print('zip', zp.name, zp.stat().st_size, h.hexdigest(), flush=True)
    return zp, zp.stat().st_size, h.hexdigest()

def main():
    c = json.loads((HERE / 'RELEASE-MANIFEST.json').read_text())
    check_manifest(c)
    only = os.environ.get('ONLY')   # local rehearsal: build just this asset
    out = Path(os.environ['GITHUB_WORKSPACE']) / 'release-output'; out.mkdir(exist_ok=True)
    built = []
    for a in c['assets']:
        if only and a['asset_name'] != only: continue
        built.append((a,) + build_zip(a, out))
    if os.environ.get('DRY'): return
    head = os.environ['GITHUB_SHA']; marker = 'manifest-sha256: ' + hashlib.sha256((HERE / 'RELEASE-MANIFEST.json').read_bytes()).hexdigest()
    tag = c['tag']
    t = api('git/ref/tags/' + tag, missing_ok=True)
    if t is not None: need(t['object']['sha'] == head, 'tag exists on another commit; never retarget')
    rel = api('releases/tags/' + tag, missing_ok=True)
    if rel is None:
        rel = api('releases', 'POST', {'tag_name': tag, 'target_commitish': head, 'name': c['title'], 'body': c['notes'] + f'\n\n<!-- {marker} -->', 'draft': True})
    need(marker in (rel.get('body') or ''), 'release body belongs to another manifest')
    for a, zp, size, sha in built:
        assets = {x['name']: x for x in api(f"releases/{rel['id']}/assets?per_page=100")}
        if a['asset_name'] in assets:
            need(assets[a['asset_name']]['size'] == size and assets[a['asset_name']].get('digest') == 'sha256:' + sha, 'existing asset differs; not overwriting')
        else:
            subprocess.run(['gh', 'release', 'upload', tag, f"{zp}#{a['label']}", '--repo', REPO], check=True)
    assets = {x['name']: x for x in api(f"releases/{rel['id']}/assets?per_page=100")}
    need(sorted(assets) == sorted(a['asset_name'] for a, *_ in built), 'asset list ' + str(sorted(assets)))
    for a, zp, size, sha in built:
        x = assets[a['asset_name']]
        need(x['state'] == 'uploaded' and x['size'] == size and x.get('digest') == 'sha256:' + sha, 'uploaded asset check ' + a['asset_name'])
    if rel['draft']: api(f"releases/{rel['id']}", 'PATCH', {'draft': False, 'prerelease': False, 'make_latest': 'true'})
    rel = api(f"releases/{rel['id']}"); need(not rel['draft'], 'release still draft')
    receipt = {'release_url': rel['html_url'], 'head': head, 'assets': []}
    for a, zp, size, sha in built:
        url = next(x['browser_download_url'] for x in rel['assets'] if x['name'] == a['asset_name'])
        fetch(url, None, (size, sha))
        receipt['assets'].append({'name': a['asset_name'], 'label': a['label'], 'download_url': url, 'bytes': size, 'sha256': sha, 'files': len(a['files']),
                                  'public_zip_redownloaded_and_sha256_matched': True})
    (out / 'RELEASE-VERIFICATION.json').write_text(json.dumps(receipt, ensure_ascii=False, indent=2) + '\n')
    print(json.dumps(receipt, ensure_ascii=False), flush=True)

if __name__ == '__main__': main()
