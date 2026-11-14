"""Append London120/121 scope to the actual serving ledger; no media changes."""
from pathlib import Path
import base64,hashlib,json,subprocess,urllib.request,urllib.parse,urllib.error
R=Path(__file__).parent
def load(p):return json.loads(p.read_text())
def save(p,x):p.write_text(json.dumps(x,ensure_ascii=False,indent=2)+'\n')
state=load(R/'CURRENT-ARCHIVE-STATE.json');previous=(R/'latest_requests.json').read_bytes();new=(R/'latest_requests-through121-review.json').read_bytes();a=json.loads(previous);b=json.loads(new)
assert all(x==y for x,y in zip(a['articles'],b['articles'])if x['source_id']!='52')
assert next(x for x in b['articles']if x['source_id']=='52')['newest_user_revision_records']==['117','118','119','120','121']
token=subprocess.check_output(['gh','auth','token'],text=True).strip()
def api(repo,path,method='GET',data=None):
 q=urllib.request.Request('https://api.github.com/repos/'+repo+'/'+urllib.parse.quote(path,safe='/?=&%'),data=None if data is None else json.dumps(data).encode(),method=method,headers={'Authorization':'Bearer '+token,'Accept':'application/vnd.github+json','Content-Type':'application/json'})
 try:
  with urllib.request.urlopen(q,timeout=90)as x:return json.loads(x.read())
 except urllib.error.HTTPError as e:
  body=e.read().decode();save(R/('latest121-'+repo.split('/')[0]+'-HTTP-error.json'),{'path':path,'method':method,'status':e.code,'body':body})
  if e.code==422 and path=='git/trees'and method=='POST'and 'timed out'in body:
   items=data['tree'];raw=b''.join((str(int(x['mode']))+' '+x['path']).encode()+b'\0'+bytes.fromhex(x['sha'])for x in sorted(items,key=lambda x:(x['path']+('/'if x['type']=='tree'else'')).encode()));sha=hashlib.sha1(b'tree '+str(len(raw)).encode()+b'\0'+raw).hexdigest();got=api(repo,'git/trees/'+sha);assert {(x['path'],x['mode'],x['type'],x['sha'])for x in items}=={(x['path'],x['mode'],x['type'],x['sha'])for x in got['tree']};return got
  raise
def tree(repo,sha):return {x['path']:x for x in api(repo,'git/trees/'+sha)['tree']}
def rows(t):return [{k:r[k]for k in ['path','mode','type','sha']}for r in t.values()]
prepared=[]
for role,repo,branch,parent in [('primary','alienalgorithm/postgraduate-vocabulary','main',state['primary_main']),('backup','AlienCodes/literate-enigma','codex/all-deliverables-20261113',state['backup_head'])]:
 assert api(repo,'git/ref/heads/'+branch)['object']['sha']==parent;rt=tree(repo,api(repo,'git/commits/'+parent)['tree']['sha']);vt=tree(repo,rt['视频修订定稿']['sha']);assert rt['视频修订定稿']['sha']==state['video_subtree'];assert base64.b64decode(api(repo,'git/blobs/'+vt['latest_requests.json']['sha'])['content'])==previous
 bs=api(repo,'git/blobs','POST',{'encoding':'base64','content':base64.b64encode(new).decode()})['sha'];nv=dict(vt);nv['latest_requests.json']={'path':'latest_requests.json','mode':'100644','type':'blob','sha':bs};vsha=api(repo,'git/trees','POST',{'tree':rows(nv)})['sha'];nr=dict(rt);nr['视频修订定稿']={'path':'视频修订定稿','mode':'040000','type':'tree','sha':vsha};rsha=api(repo,'git/trees','POST',{'tree':rows(nr)})['sha'];commit=api(repo,'git/commits','POST',{'message':'记录伦敦最新120重点词与121待接受小字建议，保留既有视频与全部定稿历史 [skip ci]','tree':rsha,'parents':[parent]})['sha'];prepared.append((role,repo,branch,parent,commit,vsha,rsha,rt,vt,bs))
assert len({r[5]for r in prepared})==1
out=[]
for role,repo,branch,parent,commit,vsha,rsha,rt,vt,bs in prepared:
 assert api(repo,'git/ref/heads/'+branch)['object']['sha']==parent;api(repo,'git/refs/heads/'+branch,'PATCH',{'sha':commit,'force':False});assert api(repo,'git/ref/heads/'+branch)['object']['sha']==commit
 rr=tree(repo,rsha);vv=tree(repo,vsha);assert {k:r['sha']for k,r in rt.items()if k!='视频修订定稿'}=={k:r['sha']for k,r in rr.items()if k!='视频修订定稿'};assert {k:r['sha']for k,r in vt.items()if k!='latest_requests.json'}=={k:r['sha']for k,r in vv.items()if k!='latest_requests.json'};assert base64.b64decode(api(repo,'git/blobs/'+bs)['content'])==new
 assert api('AlienCodes/literate-enigma','git/ref/heads/master')['object']['sha']=='6355a02864ebae616b693200d9d26f74f5da80e9';out.append({'role':role,'repository':repo,'branch':branch,'parent':parent,'commit':commit,'video_subtree':vsha,'registry_git_blob':bs})
save(R/'actual-latest-requests-through121-dual-closure.json',{'kind':'actual-public-latest-request-scope120121-only-update','archives':out,'only_source52_latest_request_scope_changed':True,'all_current_media_index_final_alias_QA_PDF_master_unchanged':True,'actual_full_blob_readbacks':2})
state.update(primary_main=out[0]['commit'],backup_head=out[1]['commit'],video_subtree=out[0]['video_subtree']);save(R/'CURRENT-ARCHIVE-STATE.json',state);(R/'latest_requests.json').write_bytes(new);print(json.dumps(out),flush=True)
