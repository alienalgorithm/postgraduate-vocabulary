"""Publish the 70 final 4K videos as one ZIP Release.
Each MP4 is downloaded from the pinned commit, checked against the manifest's bytes and SHA-256,
stored unchanged (no re-encoding) as "序号 中文名.mp4" (user 2026-11-16: number without leading zero, a space, the Chinese title),
then the ZIP is uploaded, its digest checked, the Release published, and the public file downloaded again and checked."""
import hashlib, json, os, re, shutil, subprocess, time, urllib.parse, urllib.request, zipfile
from pathlib import Path, PurePosixPath
HERE = Path(__file__).resolve().parent
REPO = 'alienalgorithm/postgraduate-vocabulary'
LIMIT = 2 * 1024**3

def need(ok, msg):
    if not ok: raise SystemExit('STOP: ' + msg)

def api(path, method='GET', data=None, missing_ok=False):
    cmd = ['gh', 'api', 'repos/' + REPO + '/' + path] + (['-X', method] if method != 'GET' else []) + (['--input', '-'] if data is not None else [])
    r = subprocess.run(cmd, input=None if data is None else json.dumps(data).encode(), capture_output=True)
    if missing_ok and r.returncode and b'(HTTP 404)' in r.stderr: return None
    need(r.returncode == 0, r.stderr.decode(errors='replace'))
    return json.loads(r.stdout)

def fetch(url, path=None, want=None):
    for attempt in range(5):
        try:
            h, n = hashlib.sha256(), 0
            with urllib.request.urlopen(urllib.request.Request(url, headers={'User-Agent': 'release-check'}), timeout=300) as src:
                out = open(path, 'wb') if path else None
                while chunk := src.read(1 << 20):
                    h.update(chunk); n += len(chunk)
                    if out: out.write(chunk)
                if out: out.close()
            if want: need((n, h.hexdigest()) == want, f'{url}: got {n} {h.hexdigest()}, want {want}')
            return n, h.hexdigest()
        except (OSError, urllib.error.URLError) as e:
            print('retry', attempt + 1, url, e, flush=True); time.sleep(5 * (attempt + 1))
    need(False, 'download failed: ' + url)

def main():
    c = json.loads((HERE / 'RELEASE-MANIFEST.json').read_text())
    vids = c['videos']; tag, zip_name, folder = c['tag'], c['zip_asset_name'], c['zip_folder']
    need(len(vids) == 70 and [v['video_order'] for v in vids] == list(range(1, 71)), 'need videos 1..70 in order')
    for v in vids:
        need(v['release_name'] == f"{v['video_order']} {v['title_zh']}.mp4" and '/' not in v['release_name'], 'bad file name ' + v['release_name'])
        need(re.fullmatch('[0-9a-f]{40}', v['commit']) and re.fullmatch('[0-9a-f]{64}', v['sha256']) and v['bytes'] > 0, 'bad identity')
        need(v['repo_path'].endswith('.mp4') and '..' not in PurePosixPath(v['repo_path']).parts, 'bad path')
    need(len({v['release_name'] for v in vids}) == 70 and sum(v['bytes'] for v in vids) == c['total_bytes'], 'names/total')
    out = Path(os.environ['GITHUB_WORKSPACE']) / 'release-output'; out.mkdir()
    need(shutil.disk_usage(out).free > 2 * c['total_bytes'] + (1 << 30), 'runner disk too small')
    for v in vids:
        if os.environ.get('LOCAL_DIR'):  # local rehearsal only
            shutil.copyfile(Path(os.environ['LOCAL_DIR']) / f"{v['sha256']}.mp4", out / v['release_name'])
            d = (out / v['release_name']).read_bytes(); need((len(d), hashlib.sha256(d).hexdigest()) == (v['bytes'], v['sha256']), 'local copy')
        else:
            url = f"https://raw.githubusercontent.com/{REPO}/{v['commit']}/" + urllib.parse.quote(v['repo_path'], safe='/')
            fetch(url, out / v['release_name'], (v['bytes'], v['sha256']))
        print('ok', v['release_name'], flush=True)
    manifest = (json.dumps({'title': c['title'], 'count': 70, 'videos': [{k: v[k] for k in ('video_order', 'title_zh', 'release_name', 'bytes', 'sha256', 'repo_path')} for v in vids]}, ensure_ascii=False, indent=2) + '\n').encode()
    sums = ''.join(f"{v['sha256']}  {v['release_name']}\n" for v in vids).encode()
    zp = out / zip_name
    with zipfile.ZipFile(zp, 'x', compression=zipfile.ZIP_STORED, allowZip64=True) as z:
        for v in vids: z.write(out / v['release_name'], f"{folder}/{v['release_name']}")
        z.writestr(f'{folder}/MANIFEST.json', manifest); z.writestr(f'{folder}/SHA256SUMS.txt', sums)
    need(zp.stat().st_size < LIMIT, 'zip over 2 GiB')
    with zipfile.ZipFile(zp) as z:
        need(z.namelist() == [f"{folder}/{v['release_name']}" for v in vids] + [f'{folder}/MANIFEST.json', f'{folder}/SHA256SUMS.txt'], 'zip members')
        for v in vids:
            h = hashlib.sha256()
            with z.open(f"{folder}/{v['release_name']}") as s:
                while chunk := s.read(1 << 20): h.update(chunk)
            need(h.hexdigest() == v['sha256'], 'zip member sha ' + v['release_name'])
    zsize = zp.stat().st_size; zsha = hashlib.sha256(zp.read_bytes()).hexdigest()
    print('zip', zp.name, zsize, zsha, flush=True)
    if os.environ.get('DRY'): return
    head = os.environ['GITHUB_SHA']; marker = 'manifest-sha256: ' + hashlib.sha256((HERE / 'RELEASE-MANIFEST.json').read_bytes()).hexdigest()
    t = api('git/ref/tags/' + tag, missing_ok=True)
    if t is not None: need(t['object']['sha'] == head, 'tag exists on another commit; never retarget')
    rel = api('releases/tags/' + tag, missing_ok=True)
    if rel is None:
        rel = api('releases', 'POST', {'tag_name': tag, 'target_commitish': head, 'name': c['title'], 'body': c['notes'] + f'\n\n<!-- {marker} -->', 'draft': True})
    need(marker in (rel.get('body') or ''), 'release body belongs to another manifest')
    assets = api(f"releases/{rel['id']}/assets?per_page=100")
    old = [a for a in assets if a['name'] == zip_name]
    if old: need(old[0]['size'] == zsize and old[0].get('digest') == 'sha256:' + zsha, 'existing asset differs; not overwriting')
    else:
        subprocess.run(['gh', 'release', 'upload', tag, f"{zp}#{c['zip_label']}", '--repo', REPO], check=True)
    assets = api(f"releases/{rel['id']}/assets?per_page=100")
    need(len(assets) == 1 and assets[0]['state'] == 'uploaded' and assets[0]['size'] == zsize and assets[0].get('digest') == 'sha256:' + zsha, 'uploaded asset check: ' + json.dumps(assets)[:500])
    if rel['draft']: api(f"releases/{rel['id']}", 'PATCH', {'draft': False, 'prerelease': False, 'make_latest': 'true'})
    rel = api(f"releases/{rel['id']}"); need(not rel['draft'], 'release still draft')
    url = rel['assets'][0]['browser_download_url']
    fetch(url, None, (zsize, zsha))
    receipt = {'release_url': rel['html_url'], 'download_url': url, 'zip_bytes': zsize, 'zip_sha256': zsha, 'videos': 70,
               'public_zip_redownloaded_and_sha256_matched': True, 'every_mp4_sha256_matched_manifest': True, 'reencoded': False, 'head': head}
    (out / 'RELEASE-VERIFICATION.json').write_text(json.dumps(receipt, ensure_ascii=False, indent=2) + '\n')
    print(json.dumps(receipt, ensure_ascii=False), flush=True)

if __name__ == '__main__': main()
