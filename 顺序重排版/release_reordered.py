"""Verify and publish only the requested PDF/MP4 downloads. Standard library only."""
from pathlib import Path
import concurrent.futures,hashlib,json,os,re,shutil,subprocess,zipfile,base64
from urllib.parse import quote

ROOT=Path(__file__).resolve().parent
OUT=Path(os.environ.get('RELEASE_ASSET_DIR','/tmp/reordered-reading-assets'))
TAG=os.environ.get('RELEASE_TAG','reading-reordered-2026.11.13-v1')
REPO=os.environ.get('GITHUB_REPOSITORY','alienalgorithm/postgraduate-vocabulary')

def sha(p):
    h=hashlib.sha256()
    with p.open('rb') as f:
        for b in iter(lambda:f.read(4*1024*1024),b''):h.update(b)
    return h.hexdigest()
def read(p):return json.loads(Path(p).read_text())
def run(*args):
    p=subprocess.run(['gh',*args],capture_output=True,text=True)
    if p.returncode:raise RuntimeError(p.stderr[-2500:])
    return p.stdout
def api(path):return json.loads(run('api',path))
def post(path,data,method='POST'):
    p=subprocess.run(['gh','api','--method',method,path,'--input','-'],input=json.dumps(data),capture_output=True,text=True)
    if p.returncode:raise RuntimeError(p.stderr[-2500:])
    return json.loads(p.stdout)

def verify():
    m=read(ROOT/'manifest.json');assert m['passed'] and len(m['articles'])==70
    assert [x['new_id'] for x in m['articles']]==[f'{n:02}' for n in range(1,71)]
    assert [x['source_id'] for x in m['articles']]==m['order_source_ids'] and len(set(m['order_source_ids']))==70
    for x in m['articles']:
        pdf=ROOT/x['pdf'];video=ROOT/x['video'];assert pdf.stem==video.stem and video.name.startswith(x['new_id']+' ')
        assert sha(pdf)==x['pdf_sha256'] and sha(video)==x['video_sha256'] and video.stat().st_size==x['video_bytes']
        assert x['body_text_and_pixels_preserved'] and x['video_bytes_identical_to_original']
        assert sha(ROOT/f'content/articles/{x["new_id"]}.json')==x['content_sha256']
    assert sha(ROOT/m['combined_pdf']['path'])==m['combined_pdf']['sha256']
    print(json.dumps({'verified':True,'PDFs':70,'videos':70,'new_order':True,'unchanged_video_bytes':True}),flush=True);return m

def zip_only(name,entries,extension):
    OUT.mkdir(parents=True,exist_ok=True);path=OUT/name
    with zipfile.ZipFile(path,'w',allowZip64=True) as z:
        for src in entries:
            info=zipfile.ZipInfo(src.name,(2026,11,13,0,0,0));info.create_system=3;info.external_attr=0o100644<<16;info.compress_type=zipfile.ZIP_STORED
            with src.open('rb') as a,z.open(info,'w',force_zip64=True) as b:shutil.copyfileobj(a,b,4*1024*1024)
    with zipfile.ZipFile(path) as z:
        names=z.namelist();assert len(names)==70 and names==sorted(names) and all(n.endswith(extension) and '/' not in n for n in names)
        assert [n[:2] for n in names]==[f'{n:02}' for n in range(1,71)] and z.testzip() is None
    return path

def build(m):
    files=[zip_only('PDF-BOOKLETS-NEW-ORDER.zip',[ROOT/x['pdf'] for x in m['articles']],'.pdf'),zip_only('4K-VIDEOS-NEW-ORDER.zip',[ROOT/x['video'] for x in m['articles']],'.mp4')]
    full=OUT/'70-STORIES-NEW-ORDER.pdf';shutil.copy2(ROOT/m['combined_pdf']['path'],full);files.append(full)
    assert len(list(OUT.iterdir()))==3,'Only PDF and MP4 download packages belong here'
    for f in files:print(json.dumps({'asset':f.name,'bytes':f.stat().st_size,'sha256':sha(f)},ensure_ascii=False),flush=True)
    return files

def publish(m,files):
    commit=os.environ.get('GITHUB_SHA') or subprocess.check_output(['git','rev-parse','HEAD'],cwd=ROOT,text=True).strip()
    matches=[x for x in api(f'repos/{REPO}/releases?per_page=100') if x['tag_name']==TAG];assert len(matches)<=1
    notes=(ROOT/'RELEASE-NOTES.md').read_text()
    release=matches[0] if matches else post(f'repos/{REPO}/releases',{'tag_name':TAG,'target_commitish':commit,'draft':True,'make_latest':'false','name':'70篇新顺序版：PDF小册子与4K视频','body':notes})
    assert release['draft'],'Do not overwrite a published version';rid=release['id'];prior={x['name']:x for x in release['assets']}
    def upload(f):
        h=sha(f);old=prior.get(f.name)
        if old:assert old['size']==f.stat().st_size and old.get('digest')=='sha256:'+h
        else:run('release','upload',TAG,str(f),'--repo',REPO)
        actual=next(x for x in api(f'repos/{REPO}/releases/{rid}/assets?per_page=100') if x['name']==f.name)
        assert actual['size']==f.stat().st_size and actual['digest']=='sha256:'+h
        result={'name':f.name,'bytes':actual['size'],'sha256':h,'asset_id':actual['id'],'url':actual['browser_download_url'],'remote_verified':True};print(json.dumps(result,ensure_ascii=False),flush=True);return result
    with concurrent.futures.ThreadPoolExecutor(max_workers=2) as pool:assets=list(pool.map(upload,files))
    assert len(api(f'repos/{REPO}/releases/{rid}/assets?per_page=100'))==3
    run('release','edit',TAG,'--repo',REPO,'--draft=false','--latest=true','--target',commit)
    result=api(f'repos/{REPO}/releases/tags/{TAG}');assert not result['draft']
    ref=api(f'repos/{REPO}/git/ref/tags/{TAG}');assert ref['object']['sha']==commit
    report={'passed':True,'repository':REPO,'tag':TAG,'source_commit':commit,'release_url':result['html_url'],'assets':assets,'download_contents':'Only70individualPDFs,onecompletePDF,and70MP4s;ZIPmembersonlyPDForMP4','new_numbering':'01–70','source_order':m['order_source_ids'],'video_filename_format':'NN 中文名 英文名.mp4','video_bytes_identical':True,'original_edition_preserved':True}
    # Keep verification records in Git, outside the user's download packages.
    record='顺序重排版/核验/'+TAG+'-发布记录.json';body={'message':'保存新顺序版Release上传后逐附件SHA256核验记录 [skip ci]','content':base64.b64encode((json.dumps(report,ensure_ascii=False,indent=2)+'\n').encode()).decode(),'branch':'main'}
    post(f'repos/{REPO}/contents/'+quote(record,safe='/'),body,'PUT')
    print(json.dumps({'published':True,'url':result['html_url'],'assets':3,'verification_record':record},ensure_ascii=False),flush=True)

if __name__=='__main__':
    import argparse
    p=argparse.ArgumentParser();p.add_argument('--verify-only',action='store_true');a=p.parse_args();m=verify()
    if not a.verify_only:publish(m,build(m))
