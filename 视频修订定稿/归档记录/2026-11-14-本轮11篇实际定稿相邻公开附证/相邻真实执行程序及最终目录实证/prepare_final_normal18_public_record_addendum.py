"""Preserve explicit public supplemental evidence and completed archive receipts."""
from pathlib import Path
import datetime
import hashlib
import json
import os
import shutil
import uuid

B=Path(__file__).resolve().parent
W=B/'final-normal18-public-evidence-addendum-20261114'
P=Path('视频修订定稿/归档记录/2026-11-14-本轮11篇实际定稿相邻公开附证')
DENIED={'b9a257a23820944ee95d568b67d1cd78947b1c1814bb70dc99a45871f488f778','55026ce1b7cdb7e9c1a72da2f715e3d9e6e6f45050a8ddd575dc052b09dca872','bcb37d8930d804988c95da94b9cfeaaab2c7b026df96e6e4567f9b698ce88fbf'}
SAFE={'.json','.py','.sh','.md','.log','.txt','.png','.jpg','.diff','.csv','.yml','.yaml','.patch'}
def load(p):return json.loads(Path(p).read_text())
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def save(p,v):p.parent.mkdir(parents=True,exist_ok=True);p.write_text(json.dumps(v,ensure_ascii=False,indent=2)+'\n')
def main():
    assert not W.exists();W.mkdir();ram=Path('/dev/shm')/('codex-public-approved-small-record-payload-'+uuid.uuid4().hex);ram.mkdir();(W/'payload').symlink_to(ram,target_is_directory=True)
    copied={};bindings=[];existing=[];excluded=[]
    def add(path,relative,size=None,expected=None):
        src=Path(path)
        if expected in DENIED or src.name=='independent-055056-metadata-only-pair-addendum.json':
            excluded.append({'source_path':str(src),'expected_sha256':expected,'excluded_due_to_specific_auto_review_decision':True});return
        assert src.suffix.lower() in SAFE and not src.name.startswith('CURRENT-ROOT-DELIVERY-STATE')
        raw=src.read_bytes();digest=hashlib.sha256(raw).hexdigest();assert digest not in DENIED
        assert size is None or len(raw)==size;assert expected is None or digest==expected
        if digest in copied:
            bindings.append({'original_path':str(src),'bytes':len(raw),'sha256':digest,'stored_repo_path':copied[digest]});return
        rel=P/relative;assert not Path(relative).is_absolute() and '..' not in Path(relative).parts
        dst=W/'payload'/rel;dst.parent.mkdir(parents=True,exist_ok=True);dst.write_bytes(raw);copied[digest]=str(rel)
        bindings.append({'original_path':str(src),'bytes':len(raw),'sha256':digest,'stored_repo_path':str(rel)})
    current=load(B/'operations-source62-new-repaired-sourceQA-normal18/final-remote-cumulative-inventory.json')
    quality=load('/workspace/work/video-revision-delivery/hold18-intake-preparation-20261114/actual-normal18-eleven-completed-20261114.json')
    current_rows={r['source_id']:r for r in current['articles']}
    for q in quality['rows']:
        sid=q['source_id'];nid=q['new_id'];active=current_rows[sid]
        ready=load(B/f'ready-new{sid}-book{nid}-normal18-exact-download-manifest.json');assert ready['sha256']==active['sha256'] and ready['asset_commit']==active['asset_commit']
        asset=load(ready['metadata_files']['assets-primary.json']);known={r['sha256']:r for r in asset['files_index']}
        h=load(q['handoff']['path']);assert sha(Path(q['handoff']['path']))==q['handoff']['sha256']
        handoffs=[('normal18',h)]
        if 'current_source_validation_handoff' in h:
            s=h['current_source_validation_handoff'];assert sha(Path(s['path']))==s['sha256'];handoffs.append(('sourceQA',load(s['path'])))
        seen=set()
        for label,proof in handoffs:
            for i,row in enumerate(proof['articles'][0]['section'].get('evidence',[]),1):
                if row['sha256'] in seen:continue
                seen.add(row['sha256']);src=Path(row['path'])
                if row['sha256'] in known:
                    archived=known[row['sha256']];assert archived['bytes']==row['bytes']
                    existing.append({'source_id':sid,'evidence_sha256':row['sha256'],'bytes':row['bytes'],'immutable_asset_commit':asset['asset_commit'],'repo_path':archived['repo_path'],'Git_blob_SHA':archived['git_blob_sha']});continue
                add(src,Path('按冻结完整V3逐项补存的公开附证')/sid/f'{label}-{i:02d}-{src.name}',row['bytes'],row['sha256'])
    for sid,expected in [('34','1c8add121f5d9552f3c4bc0010e559e1c878d92ae98f96b778fe834bea211db0'),('62','2bf51aa6e26a8a316659c9b5d0593834819ed45bf812a53d3cc580f672b19b7f')]:
        m=Path('/workspace/work/video-audit70-20261113')/f'article{sid}-user-review-20261114/safe-public-evidence-manifest.json';assert sha(m)==expected
        add(m,Path('明确已冻结源稿静态清单')/sid/'safe-public-evidence-manifest.json')
        for i,r in enumerate(load(m)['files'],1):
            src=Path(r.get('path',r.get('source_path','')));rel=r.get('safe_archive_relative_path',r.get('archive_relative_path',r.get('relative_path',f'{i:03d}-{src.name}')))
            add(src,Path('明确已冻结源稿静态清单')/sid/rel,r['bytes'],r['sha256'])
    for name in ['ACTUAL-ELEVEN-NORMAL06-FINAL-ALIAS-CLOSURE.json','verify_current_eleven_final_aliases.py','prepare_final_normal18_public_record_addendum.py','prepare_preview28_current_metadata_sidecar.py','verify_closed_small_record_asset.py','prepare_new_sourceQA_normal18_assets.py','prepare_new_sourceQA_normal18_assets-before-source62-repair-role.py']:
        add(B/name,Path('相邻真实执行程序及最终目录实证')/name)
    for directory in ['operations-source36-normal18-029-051','operations-sources17-33-normal18','operations-source14-normal18-v2','operations-sources13-15-26-27-normal18-v2','operations-sources34-47-newsourceQA-normal18','operations-source62-new-repaired-sourceQA-normal18']:
        add(B/directory/'final-archive-receipt.json',Path('本轮真实canonical收口回执')/directory/'final-archive-receipt.json')
    for name in ['actual-dual-small-record-verification.json','closed-own-record-bare-cleanup-receipt.json']:
        add(B/'preview28-hold18-current-metadata-sidecar-20261114'/name,Path('仅预览引用旁证实际保存回执')/name)
    save(W/'payload'/P/'explicit-new-and-existing-object-bindings.json',{'kind':'explicit-public-supplemental-record-preservation','observed_utc':datetime.datetime.now(datetime.timezone.utc).isoformat(),'new_exact_records':bindings,'already_permanent_exact_objects':existing,'restricted_registry_originals_not_exported_to_backup':True,'restricted_originals_and_related_registry_summary_not_renamed_or_repackaged':True,'media_or_QA_or_canonical_or_Release_modified':False,'all_PDF_work_remains_paused':True})
    local=Path('/workspace/local-only-auto-review-rejection-055056/append-only-sourceQA-exclusion-observation.json');save(local,{'excluded_from_new_dual_packet':excluded,'primary_ledger_originals_preserved':True,'no_backup_workaround_attempted':True})
    save(W/'prepared-archive.json',{'prefix':str(P),'asset_branch':'codex/final-normal18-public-evidence-addendum-20261114','scope':'Explicit public metadata/PNG source and static evidence only; denied registry originals excluded, no media or PDF'})
    files=[{'repo_path':str(p.relative_to(W/'payload')),'bytes':p.stat().st_size,'sha256':sha(p)} for p in sorted((W/'payload').rglob('*')) if p.is_file()]
    save(W/'payload-file-index.json',files);print(json.dumps({'work_dir':str(W),'files':len(files),'bytes':sum(r['bytes'] for r in files),'existing_exact_evidence_references':len(existing),'restricted_records_excluded':len(excluded),'no_media_PDF_or_denied_payload_uploaded':True}))
if __name__=='__main__':main()
