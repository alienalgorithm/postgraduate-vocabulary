"""User-authorized immediate existing-video delivery; no new audio QA claims."""
import hashlib,json,os,shutil,subprocess,urllib.parse,urllib.request,zipfile,zlib
from pathlib import Path
from delivery_contract import *
HERE=Path(__file__).resolve().parent
def file_sha(path):
    with Path(path).open('rb') as source:
        return hashlib.file_digest(source, 'sha256').hexdigest()

def api(path, method='GET', data=None, missing_ok=False):
    cmd = ['gh', 'api', 'repos/' + PRIMARY + '/' + path]
    if method != 'GET':
        cmd += ['-X', method]
    if data is not None:
        cmd += ['--input', '-']
    r = subprocess.run(cmd, input=None if data is None else json.dumps(data).encode(), capture_output=True)
    if missing_ok and r.returncode and b'(HTTP 404)' in r.stderr:
        return None
    if r.returncode:
        raise RuntimeError(r.stderr.decode(errors='replace'))
    return json.loads(r.stdout)

def download_video(repo, head, v, path=None):
    location=v['delivery_source'];repo=location['repository'];head=location['commit']
    url = 'https://raw.githubusercontent.com/' + repo + '/' + head + '/' + urllib.parse.quote(location['repo_path'], safe='/')
    h, size = hashlib.sha256(), 0
    with urllib.request.urlopen(urllib.request.Request(url, headers={'User-Agent':'all70-current-MP4-whole-byte-readback'}), timeout=180) as source:
        need(source.status == 200, 'Actual complete MP4 read failed')
        if path is not None:
            with Path(path).open('xb') as out:
                while chunk := source.read(1024*1024):
                    h.update(chunk); size += len(chunk); out.write(chunk)
        else:
            while chunk := source.read(1024*1024):
                h.update(chunk); size += len(chunk)
    need((size, h.hexdigest()) == (v['bytes'], v['sha256']), 'Actual delivery MP4 differs from pinned file bytes')
    return {'repository':repo, 'commit':head, 'video_order':v['current_video_order'],
            'source_id':v['source_id'], 'bytes':size, 'sha256':h.hexdigest(), 'http_status':200}

def zip_info(name):
    info = zipfile.ZipInfo(name, (2026,11,15,0,0,0))
    info.compress_type = zipfile.ZIP_STORED
    info.external_attr = 0o100644 << 16
    return info

def make_bundle(path, members, all_videos, directory, part_number, part_count):
    manifest, checksums = inner_lists(all_videos,members,part_number,part_count)
    with zipfile.ZipFile(path,'x',allowZip64=True) as archive:
        for v in members:
            with (directory/v['release_name']).open('rb') as source, archive.open(zip_info(v['release_name']),'w') as target:
                shutil.copyfileobj(source,target,1024*1024)
        archive.writestr(zip_info('MANIFEST.json'),manifest)
        archive.writestr(zip_info('SHA256SUMS.txt'),checksums)
    need(path.stat().st_size < LIMIT, 'Actual ZIP exceeds GitHub per-asset2GiB limit; do not upload')
    need(path.stat().st_size == exact_stored_zip_bytes(members,all_videos,part_number,part_count),
         'Actual ZIP layout differs from exact size calculation; do not publish')
    with zipfile.ZipFile(path) as archive:
        need(archive.namelist() == [v['release_name'] for v in members]+['MANIFEST.json','SHA256SUMS.txt'],
             'Unexpected ZIP member; never include source/model/private/environment files')
        for v in members:
            h, n, crc = hashlib.sha256(), 0, 0
            with archive.open(v['release_name']) as source:
                while chunk := source.read(1024*1024):
                    h.update(chunk); n += len(chunk); crc = zlib.crc32(chunk,crc)
            need((n,h.hexdigest()) == (v['bytes'],v['sha256']) and
                 (crc & 0xffffffff) == archive.getinfo(v['release_name']).CRC,
                 'ZIP internal MP4 SHA/CRC differs from the actual accepted media')
        need(archive.read('MANIFEST.json') == manifest and archive.read('SHA256SUMS.txt') == checksums,
             'ZIP integrity metadata changed')
    return {'name':path.name,'bytes':path.stat().st_size,'sha256':file_sha(path),
            'included_video_orders':[v['current_video_order'] for v in members],
            'all_internal_MP4_bytes_SHA_and_CRC_verified':True}

def main():
 if os.environ.get('GITHUB_REPOSITORY')!=PRIMARY:return
 config=json.loads((HERE/'DELIVERY-MANIFEST.json').read_text());videos=validate_manifest(config)
 out=Path(os.environ['GITHUB_WORKSPACE'])/'all70-delivery-output';out.mkdir(exist_ok=False)
 need(shutil.disk_usage(out).free>2*config['total_MP4_bytes']+1024**3,'Runner storage insufficient')
 reads=[]
 for v in videos:reads.append(download_video(None,None,v,out/v['release_name']))
 parts=archive_parts(videos);bundles=[]
 for n,members in enumerate(parts,1):
  name=ZIP_NAME if len(parts)==1 else f'01-70-4K-CURRENT-DELIVERY.part{n:02}-of-{len(parts):02}.zip'
  bundles.append(make_bundle(out/name,members,videos,out,n,len(parts)))
 head=os.environ['GITHUB_SHA'];marker='Immediate delivery manifest SHA-256: '+file_sha(HERE/'DELIVERY-MANIFEST.json')
 tag=api('git/ref/tags/'+TAG,missing_ok=True)
 if tag is not None:need(tag['object']['type']=='commit'and tag['object']['sha']==head,'Never retarget a Release tag')
 release=api('releases/tags/'+TAG,missing_ok=True)
 if release is None:
  release=api('releases','POST',{'tag_name':TAG,'target_commitish':head,'name':'70篇4K现有视频交付全集｜3篇音频核查暂缓','body':'按最新用户要求立即打包现有70篇4K视频，省去新增核验。其中66篇沿用已完成的定稿记录；第62篇使用已通过sourceQA的现有原生4K视频，未等待normal18尾段，不冒称已完成最终尾段验收。第49篇（源24）、第53篇（源68）、第65篇（源56）的音频核查按要求暂缓，未声称这3篇通过完整音频验收；各篇实际版本、尾段和归档状态见包内清单，未将未知尾段标为0.6秒。仅含70个原MP4、MANIFEST.json、SHA256SUMS.txt，未重新编码。\n\n<!-- '+marker+' -->','draft':True,'prerelease':False})
 need(marker in(release.get('body')or'')and release['target_commitish']==head,'Release identity collision')
 assets=api('releases/'+str(release['id'])+'/assets?per_page=100');expected={b['name']:b for b in bundles}
 need(all(x['name']in expected for x in assets)and len(assets)<=len(bundles),'Unexpected old assets')
 for b in bundles:
  x=next((a for a in assets if a['name']==b['name']),None)
  if x:need(x['size']==b['bytes']and x.get('digest')=='sha256:'+b['sha256'],'Existing asset differs; no clobber')
  else:subprocess.run(['gh','release','upload',TAG,str(out/b['name']),'--repo',PRIMARY],check=True)
 assets=api('releases/'+str(release['id'])+'/assets?per_page=100');need(len(assets)==len(bundles),'Missing ZIP upload')
 for x in assets:
  b=expected[x['name']];need(x['state']=='uploaded'and x['size']==b['bytes']and x.get('digest')=='sha256:'+b['sha256'],'Uploaded ZIP digest differs')
 if release['draft']:api('releases/'+str(release['id']),'PATCH',{'draft':False,'prerelease':False,'make_latest':'false'})
 release=api('releases/'+str(release['id']));need(not release['draft'],'Release not public')
 assets=api('releases/'+str(release['id'])+'/assets?per_page=100')
 links=[]
 for x in assets:
  with urllib.request.urlopen(x['browser_download_url'],timeout=180)as response:
   need(response.status==200 and bool(response.read(1)),'Public download response not reachable')
  links.append({**expected[x['name']],'download_url':x['browser_download_url'],'public_download_response_HTTP200_first_byte':True,'full_public_zip_redownload_performed':False})
 receipt={'delivery_published':True,'strict_all70_qualified':False,'video_count':70,'audio_review_deferred_source_ids':['24','68','56'],'qualified_audio_passed_for_deferred':False,'additional_audio_QA_probe_and_second_repository_rechecks_performed':False,'release_id':release['id'],'release_url':release['html_url'],'ZIP_assets':links,'actual_MP4_source_downloads':reads,'only_MP4_manifest_checksums_inside_ZIP':True,'no_reencoding':True,'latest_user_authority_sha256':AUTH_SHA,'delivery_manifest_sha256':file_sha(HERE/'DELIVERY-MANIFEST.json'),'native_actions_run_id':os.environ['GITHUB_RUN_ID'],'native_actions_head_sha':head}
 (out/'DELIVERY-RELEASE-VERIFICATION.json').write_text(json.dumps(receipt,ensure_ascii=False,indent=2)+'\n');print(json.dumps(receipt,ensure_ascii=False),flush=True)
if __name__=='__main__':main()
