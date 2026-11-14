"""Doc and video-serving controls only; all current media and QA aliases preserved."""
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor
import base64,hashlib,json,subprocess,urllib.request,urllib.parse,urllib.error
import build_latest_requests_registry as registry
R=Path(__file__).parent;B=Path('/workspace/work/video-archive-batches-20261114');MASTER='6355a02864ebae616b693200d9d26f74f5da80e9'
def load(p):return json.loads(p.read_text())
def save(p,x):p.write_text(json.dumps(x,ensure_ascii=False,indent=2)+'\n')
def enc(x):return (json.dumps(x,ensure_ascii=False,indent=2)+'\n').encode()
def blob(raw):return hashlib.sha1(b'blob '+str(len(raw)).encode()+b'\0'+raw).hexdigest()
state=load(R/'CURRENT-ARCHIVE-STATE.json');latest=registry.build(state);save(R/'latest_requests.json',latest)
rules={'kind':'latest-user-request-bound-video-serving-policy','authority_user_reviews':['079','090','100','101','102','104','109'],'latest_user_revision_required':True,'pending_or_unbound_new_revision_blocks_old_current_delivery':True,'old_accepted_index_is_history_not_latest_request_completion':True,'missing_accepted_row_does_not_prove_no_newer_media_exists':True,'selection_requires_matching_user_scope_source_GEN_MD_video_SHA_tail_QA_and_dual_archive':True,'source_GEN_role_and_derived_GEN_role_must_remain_distinct':True,'new_complete_final_replaces_one_current_source_row_with_previous_versions_preserved':True,'each_actual_final_install_updates_latest_requests_same_commit':True,'video_order_090_is_persistent_for_all_future_installs':True,'frozen_book_order_is_quality_history_not_current_video_sequence':True,'default_completed_final_delivery':'GitHub_permanent_cloud_final_under079','single_article_download_exception':{'source_id':'19','frozen_book_order':'38','user_review':'109','only_after_actual_final_quality_and_dual_archive':True},'current_latest_review_release_request':{'from_current_video_order':'38','through_current_video_order':'70','newest_actual_files_only':True,'pending_items_must_not_be_filled_with_legacy_media':True},'post_reading_pause_seconds':0.6,'illustration_seconds':2,'summary_card_seconds':2,'PDF_work_paused':True,'book_catalog_and_PDF_order_unchanged':True}
addition='''
## 2026-11-14 最新文件选择、云端定稿与视频顺序

本节按用户079、090、100—104及109更新，优先于此前每篇都发布下载链接的旧要求。每次制作、归档和交付必须使用该篇最新获授权修订的真实文件。将用户修订、实际源稿与GEN/MD及词表、视频SHA-256、插图和简述尾段、质量状态、修改记录关联保存。

- `视频修订定稿/latest_requests.json`记录逐篇最新要求及完成状态；旧的已验收总清单仅说明旧版曾通过，不能单独作为“最新版本”选择器。新修订尚在制作或尚未完成质量核验和双仓保存时，必须标为制作中，禁止用旧current或历史文件静默补位。没有已验收行也不代表不存在更新文件，应核对实际已有版本及其状态。
- 最新成片真实通过完整核验并完成双仓保存后，原子更新该篇current、最终视频别名和latest_requests；旧源稿、旧视频、旧质量记录及previous_versions完整保留，不改旧Release或旧下载包。
- 按用户079，已完成修订的定稿默认保存GitHub云端即可，不再逐篇另发Release或下载链接。用户另行明确要求时单独交付；用户109明确要求第38篇郁金香新版完成后提供直接MP4下载链接供审核，此例外只适用于该篇。
- 用户090只改变视频顺序：前10个source依次为07、01、12、10、22、06、11、39、21、51；其余保持原相对顺序，因此第11—13位为03、05、04，原第14—70位不动。现行视频顺序以最终视频目录的`视频顺序.json`为准，后续任何安装都须保留该映射；原书序、旧质量记录和PDF排序不变。
- 用户102所要的第38—70篇审核包也必须按每篇最新实际文件选择，尚未就绪的篇目如实标为制作中，不用旧版拼成“全部最新”。此前历史混合审核包保留历史用途。
- 所有新版本继续遵守末句实际读完后原正文停留0.6秒，再接原插图2秒及原简述2秒；保持重点词与词表同步。全部PDF工作仍暂停，不读取、修改、生成或上传PDF，直到用户明确恢复。
'''
token=subprocess.check_output(['gh','auth','token'],text=True).strip()
def api(repo,path,method='GET',data=None):
 q=urllib.request.Request('https://api.github.com/repos/'+repo+'/'+urllib.parse.quote(path,safe='/?=&%'),data=None if data is None else json.dumps(data).encode(),method=method,headers={'Authorization':'Bearer '+token,'Accept':'application/vnd.github+json','Content-Type':'application/json'})
 try:
  with urllib.request.urlopen(q,timeout=90)as resp:return json.loads(resp.read())
 except urllib.error.HTTPError as e:
  body=e.read().decode();save(R/('latest-policy-'+repo.split('/')[0]+'-HTTP-error.json'),{'path':path,'method':method,'status':e.code,'body':body})
  if e.code==422 and path=='git/trees' and method=='POST' and 'timed out' in body and 'base_tree'not in data:
   items=data['tree'];raw=b''.join((str(int(x['mode']))+' '+x['path']).encode()+b'\0'+bytes.fromhex(x['sha'])for x in sorted(items,key=lambda x:(x['path']+('/'if x['type']=='tree'else'')).encode()))
   expected=hashlib.sha1(b'tree '+str(len(raw)).encode()+b'\0'+raw).hexdigest();got=api(repo,'git/trees/'+expected)
   a={(x['path'],x['mode'],x['type'],x['sha'])for x in items};z={(x['path'],x['mode'],x['type'],x['sha'])for x in got['tree']};assert a==z
   save(R/('latest-policy-'+repo.split('/')[0]+'-actual-created-tree-after-timeout.json'),{'actual_GET_tree_after_POST_timeout':True,'expected_Git_tree_SHA':expected,'actual_direct_entry_count':len(z),'all_modes_types_paths_and_SHA_equal':True});return got
  raise
def tree(repo,sha):return {x['path']:x for x in api(repo,'git/trees/'+sha)['tree']}
def shallow(x):return [{k:r[k]for k in ['path','mode','type','sha']}for r in x.values()]
def prepare(role,repo,branch,parent):
 assert api(repo,'git/ref/heads/'+branch)['object']['sha']==parent
 root=tree(repo,api(repo,'git/commits/'+parent)['tree']['sha']);video=tree(repo,root['视频修订定稿']['sha']);assert root['视频修订定稿']['sha']==state['video_subtree']
 old=base64.b64decode(api(repo,'git/blobs/'+root['AGENTS.md']['sha'])['content']);assert addition.strip()not in old.decode()
 docs={'AGENTS.md':old+addition.encode(),'视频修订定稿/latest_requests.json':enc(latest),'视频修订定稿/最新视频选择规则.json':enc(rules)};sha={}
 for name,raw in docs.items():
  sha[name]=api(repo,'git/blobs','POST',{'content':base64.b64encode(raw).decode(),'encoding':'base64'})['sha'];assert sha[name]==blob(raw)
 nv=dict(video)
 for name in ['latest_requests.json','最新视频选择规则.json']:nv[name]={'path':name,'mode':'100644','type':'blob','sha':sha['视频修订定稿/'+name]}
 vs=api(repo,'git/trees','POST',{'tree':shallow(nv)})['sha'];nr=dict(root);nr['视频修订定稿']={'path':'视频修订定稿','mode':'040000','type':'tree','sha':vs};nr['AGENTS.md']={'path':'AGENTS.md','mode':'100644','type':'blob','sha':sha['AGENTS.md']}
 rt=api(repo,'git/trees','POST',{'tree':shallow(nr)})['sha'];commit=api(repo,'git/commits','POST',{'message':'按最新用户规则绑定逐篇最新文件，待制作拒绝旧版补位；保现有成片和090视频顺序 [skip ci]','tree':rt,'parents':[parent]})['sha']
 return {'role':role,'repository':repo,'branch':branch,'parent':parent,'commit':commit,'root_tree':rt,'video_tree':vs,'previous_root':root,'previous_video':video,'documents':docs,'blob_shas':sha}
assert api('AlienCodes/literate-enigma','git/ref/heads/master')['object']['sha']==MASTER
with ThreadPoolExecutor(max_workers=2)as pool:
 f=pool.submit(prepare,'primary','alienalgorithm/postgraduate-vocabulary','main',state['primary_main']);g=pool.submit(prepare,'backup','AlienCodes/literate-enigma','codex/all-deliverables-20261113',state['backup_head']);prepared=[f.result(),g.result()]
save(R/'latest-selection-prepared-commits.json',[{k:v for k,v in r.items()if k not in ['previous_root','previous_video','documents']}for r in prepared])
assert len({r['video_tree']for r in prepared})==1
out=[]
for r in prepared:
 repo=r['repository'];assert api(repo,'git/ref/heads/'+r['branch'])['object']['sha']==r['parent'];api(repo,'git/refs/heads/'+r['branch'],'PATCH',{'sha':r['commit'],'force':False});assert api(repo,'git/ref/heads/'+r['branch'])['object']['sha']==r['commit']
 root=tree(repo,r['root_tree']);video=tree(repo,r['video_tree']);assert {k:v['sha']for k,v in root.items()if k not in ['AGENTS.md','视频修订定稿']}=={k:v['sha']for k,v in r['previous_root'].items()if k not in ['AGENTS.md','视频修订定稿']}
 assert {k:v['sha']for k,v in video.items()if k not in ['latest_requests.json','最新视频选择规则.json']}=={k:v['sha']for k,v in r['previous_video'].items()if k not in ['latest_requests.json','最新视频选择规则.json']}
 for name,raw in r['documents'].items():assert base64.b64decode(api(repo,'git/blobs/'+r['blob_shas'][name])['content'])==raw
 out.append({k:r[k]for k in ['role','repository','branch','parent','commit','video_tree','blob_shas']})
 assert api('AlienCodes/literate-enigma','git/ref/heads/master')['object']['sha']==MASTER
save(R/'actual-latest-selection-rules-dual-closure.json',{'kind':'actual-public-latest-video-request-policy-only-dual-closure','archives':out,'only_AGENTS_and_two_video_policy_documents_changed':True,'current_inventory_final_directory_all_media_QA_catalog_PDF_and_master_unchanged':True,'actual_full_immutable_blob_readbacks':6,'latest_requests_rows':70,'completed_latest_requested_revisions':36,'all70_complete_claimed':False})
state.update(primary_main=out[0]['commit'],backup_head=out[1]['commit'],video_subtree=prepared[0]['video_tree']);state['last_latest_selection_policy_receipt']=str(R/'actual-latest-selection-rules-dual-closure.json');save(R/'CURRENT-ARCHIVE-STATE.json',state)
print(json.dumps({'main':out[0]['commit'],'backup':out[1]['commit'],'rows':70,'latest_requested_complete':36,'only_policy_documents_changed':True},ensure_ascii=False),flush=True)
