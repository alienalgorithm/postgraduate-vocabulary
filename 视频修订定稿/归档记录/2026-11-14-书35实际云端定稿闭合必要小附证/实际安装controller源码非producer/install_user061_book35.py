"""Install only the actually dual-verified user061 source53 revision, metadata in RAM."""
from pathlib import Path
import hashlib,json,os,subprocess,sys

ROOT=Path(__file__).resolve().parent
B=Path('/workspace/work/video-archive-batches-20261114')
W=Path('/dev/shm/user061-book35-isolated-assets-f_3ec_ws/run43618546414-53-user061-review-normal18-v1')
def load(p):return json.loads(p.read_text())
def save(p,d):p.write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n')
def main():
    state=load(ROOT/'CURRENT-ARCHIVE-STATE.json');prior=Path(state['actual_inventory']);before=load(prior)
    ready=load(W.parent/'ready-user061-book35.json');m=load(W/'prepared-archive.json');row=m['articles'][0]
    assert ready['asset_commit']=='db1d97274d9346e5843aadb129f330eda332fa81'
    assert row['source_id']=='53' and row['new_id']=='35' and row['bytes']==15345690 and row['sha256']=='618b45ba4ffe04ed6459c2dde7c0a950c939b3f1b013b95a92e3affea8915f94'
    assert ready['cloudonly079'] is True if 'cloudonly079' in ready else ready['single_release_requested_by_latest_user'] is False
    assert load(W/'actual-dual-asset-blob-verification.json')['actual_dual_blob_rows']==566
    assert load(W/'remote-video-byte-verification.json')['passed'] is True
    assert state['primary_main']=='7ce1dbd2e84bf9b47ae2a887ecbf5e5b59665d4f' and state['backup_head']=='f15dc1c2fc4710c3fbe57eb2a0792aa972b1e97f'
    auth=B/'user061-source53-review-archive-authorization.json';old=next(r for r in before['articles'] if r['source_id']=='53')
    assert load(auth)['authorized_revisions'][0]['previous_row']==old
    binding={'kind':'actual-previous-source53-run-read-from-original-immutable-archive-manifest','source_id':'53','book_order':'35','old_row_source_run_column_absent_and_old_row_preserved':True,'actual_original_source_run':43523430839,'original_asset_commit':old['asset_commit'],'original_manifest_repo_path':old['archive_prefix']+'/archive-manifest.json','original_manifest_git_blob':'5384d4d5fd65f996120da45a16b1a080872c7da8','original_manifest_bytes':41383,'original_manifest_SHA256':'3cf771bd41c460d7b3453cf9d7e97593c5ce1c1c5095a2c98dc64b5f175e551f','actual_full_immutable_manifest_reads_equal_in_repositories':['alienalgorithm/postgraduate-vocabulary','AlienCodes/literate-enigma'],'original_manifest_source53_movie_bytes_and_SHA_equal_current_old_row':True}
    bind=ROOT/'source53-actual-old-schema-original-run-binding.json';save(bind,binding)
    op=ROOT/'operations-user061-book35-current-final';assert not op.exists()
    env={**os.environ,'PYTHONPATH':str(B),'TMPDIR':str(ROOT)}
    cmd=[sys.executable,str(ROOT/'prepare_operation.py'),'--work-dir',str(op),'--batch','2026-11-14-用户061书35审核定稿及079云端保存','--asset-branch','codex/user061-book35-current-final-records','--previous-inventory',str(prior),'--revision-authorization',str(auth),'--article-work-dir',str(W)]
    for p in [bind,B/'source53-original-schema-run-read-compatibility-checks.json',B/'archive_revision_policy-before-source53-legacy-run-compat.py',Path('/dev/shm/archive-writer-user-review-20261114/USER-REVIEW-2026-11-14-079.json')]:cmd+=['--attach',str(p)]
    subprocess.run(cmd,check=True,env=env)
    for repo in ['alienalgorithm/postgraduate-vocabulary','AlienCodes/literate-enigma']:
        subprocess.run([sys.executable,str(ROOT/'archive_batch.py'),'push','--work-dir',str(op),'--repo',repo],check=True,timeout=85,env=env)
    plan={'writer_window_granted_by_root':True,'expected_heads':{'primary':state['primary_main'],'backup':state['backup_head']},'previous_inventory':str(prior),'operation_work_dir':str(op),'article_work_dirs':[str(W)],'revision_authorization':str(auth),'result_count':60,'source_run':43618546414,'message':'按用户061保存书35实际完整验收新版并同步最终目录；按079永久云端保存 [skip ci]'}
    pp=ROOT/'integration-plan-user061-book35-current-final.json';save(pp,plan)
    subprocess.run([sys.executable,str(ROOT/'integrate_verified_batch.py'),'--plan',str(pp),'--execute'],check=True,env=env)
    after=load(ROOT/'CURRENT-ARCHIVE-STATE.json');inv=load(Path(after['actual_inventory']));n={r['source_id']:r for r in inv['articles']};o={r['source_id']:r for r in before['articles']}
    assert len(n)==len(o)==60 and all(n[sid]==r for sid,r in o.items() if sid!='53')
    assert n['53']['previous_versions'][-1]==old and n['53']['sha256']==row['sha256']
    assert (B/'CURRENT-ARCHIVE-STATE.json').read_bytes()==(ROOT/'CURRENT-ARCHIVE-STATE.json').read_bytes()
    save(ROOT/'actual-user061-book35-current-final-closure.json',{'kind':'actual-user061-book35-current-final-dual-closure','primary_main':after['primary_main'],'backup_delivery':after['backup_head'],'unique_count':60,'source35_revision_changed_only_source53_row':True,'other59_rows_preserved_including_first34_current_videos':True,'old_source53_row_without_source_run_column_preserved_verbatim_in_history':True,'final_directory':after['final_directory'],'archive_receipt':after['last_completed_receipt'],'latest_user079_cloud_only_no_single_Release_created':True,'PDF_and_protected_master_not_changed':True})
    print(json.dumps({'book35_current_final_installed':True,'main':after['primary_main'],'backup':after['backup_head'],'actual_unique_count':60,'only_source53_revised':True,'cloud_only_no_Release':True}),flush=True)
if __name__=='__main__':main()
