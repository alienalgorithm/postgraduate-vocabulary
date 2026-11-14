"""Install actual passed source60 under exact title077; keep video090 order."""
from pathlib import Path
import hashlib,json,subprocess,sys,os,shutil
ROOT=Path(__file__).parent;B=Path('/workspace/work/video-archive-batches-20261114')
W=Path('/dev/shm/user077-source60-isolated-assets-5uvr0vmp/run43626183061-60-user077-review-normal18-v1')
def load(p):return json.loads(p.read_text())
def save(p,d):p.write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n')
def spec(p):return {'path':str(p),'bytes':p.stat().st_size,'sha256':hashlib.sha256(p.read_bytes()).hexdigest()}
def main():
 state=load(ROOT/'CURRENT-ARCHIVE-STATE.json');prior=Path(state['actual_inventory']);before=load(prior);old=next(r for r in before['articles']if r['source_id']=='60')
 assert old['new_id']=='36' and before['video_order_overlay']['video_order'][0]['source_id']=='07'
 ready=load(W.parent/'ready-user077-source60.json');m=load(W/'prepared-archive.json');row=m['articles'][0]
 assert ready['asset_commit']=='6bf93f6b45ca2583598bd7b90d22dff86828c691'
 assert row['sha256']=='cbd7103a1019b50bb5a94cea9c3d770f50c3dbf7b4012b38d44c8087a242e817' and row['bytes']==16316507
 assert row['title_zh']=='爱因斯坦的诺奖之路' and row['source_native_audio_repair_applied'] is True
 assert load(W/'actual-dual-asset-blob-verification.json')['actual_dual_blob_rows']==672
 assert load(W/'remote-video-byte-verification.json')['passed'] is True
 import archive_revision_policy as revisions
 u=Path('/dev/shm/archive-writer-user-review-20261114/USER-REVIEW-2026-11-14-077.json');h=Path(ready['real_V3_handoff'])
 auth={'kind':'explicit-completed-user-review-video-revision-archive-authorization','requirements':{'old_asset_blobs_and_history_preserved':True,'unique_article_count_increased_by_revisions':False,'all_other_article_rows_unchanged':True,'published_review40_release_unchanged':True,'real_new_native_handoff_and_full_dual_byte_verification_still_required':True},'authorized_revisions':[{'source_id':'60','new_id':'36','previous_row':old,'previous_row_sha256':revisions.identity(old),'review_record':spec(u),'actual_new_title_handoff':spec(h)}]}
 ap=ROOT/'user077-source60-current-final-authorization.json';save(ap,auth);op=ROOT/'operations-user077-source60-current-final';assert not op.exists()
 for name in ['prepare_operation.py','archive_batch.py','integrate_verified_batch.py']:shutil.copyfile(B/name,ROOT/name)
 env={**os.environ,'PYTHONPATH':str(B),'PYTHONDONTWRITEBYTECODE':'1','TMPDIR':str(ROOT)}
 cmd=[sys.executable,ROOT/'prepare_operation.py','--work-dir',op,'--batch','2026-11-14-用户077书36新名及最小声修完整验收云端定稿','--asset-branch','codex/user077-source60-current-final-records','--previous-inventory',prior,'--revision-authorization',ap,'--article-work-dir',W]
 for p in [B/'video_title_authorization.py',B/'video_order_authorization.py',Path('/dev/shm/archive-writer-user-review-20261114/USER-REVIEW-2026-11-14-079.json')]:cmd+=['--attach',p]
 subprocess.run(list(map(str,cmd)),check=True,env=env)
 for repo in ['alienalgorithm/postgraduate-vocabulary','AlienCodes/literate-enigma']:subprocess.run([sys.executable,str(ROOT/'archive_batch.py'),'push','--work-dir',str(op),'--repo',repo],check=True,timeout=85,env=env)
 plan={'writer_window_granted_by_root':True,'expected_heads':{'primary':state['primary_main'],'backup':state['backup_head']},'previous_inventory':str(prior),'operation_work_dir':str(op),'article_work_dirs':[str(W)],'revision_authorization':str(ap),'result_count':60,'source_run':m['source_run'],'message':'按用户077保存爱因斯坦新版及真实最小声修全验收，保090排序与079云端定稿 [skip ci]'}
 pp=ROOT/'integration-plan-user077-source60.json';save(pp,plan);subprocess.run([sys.executable,str(ROOT/'integrate_verified_batch.py'),'--plan',str(pp),'--execute'],check=True,env=env)
 after=load(ROOT/'CURRENT-ARCHIVE-STATE.json');inv=load(Path(after['actual_inventory']));now={r['source_id']:r for r in inv['articles']};prev={r['source_id']:r for r in before['articles']}
 assert len(now)==len(prev)==60 and all(now[sid]==r for sid,r in prev.items()if sid!='60')
 assert inv['video_order_overlay']==before['video_order_overlay'] and now['60']['previous_versions'][-1]==old
 out={'kind':'actual-user077-source60-new-title-and-controlled-audio-cloud-final-closure','primary_main':after['primary_main'],'backup_delivery':after['backup_head'],'unique_count':60,'only_source60_row_revised':True,'other59_rows_and_user090_video_order_exact':True,'new_title_zh':'爱因斯坦的诺奖之路','new_final_bytes':16316507,'new_final_sha256':row['sha256'],'actual_repair_applied':True,'current_new_AAC_packet_count':6976,'post_reading_pause_seconds':0.6,'original_book_catalog_PDF_and_master_unchanged':True,'old_revisions_preserved':True,'no_single_Release_under079':True,'archive_receipt':after['last_completed_receipt']};save(ROOT/'actual-user077-source60-current-final-closure.json',out);print(json.dumps(out,ensure_ascii=False),flush=True)
if __name__=='__main__':main()
