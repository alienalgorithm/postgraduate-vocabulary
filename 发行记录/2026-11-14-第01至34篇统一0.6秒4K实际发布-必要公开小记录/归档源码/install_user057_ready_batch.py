"""Install only already dual-verified existing first34 rows; no video production."""
from pathlib import Path
import argparse,json,subprocess,sys
from archive_batch import load,write,digest
import archive_revision_policy as revisions
B=Path(__file__).resolve().parent
def main():
    p=argparse.ArgumentParser();p.add_argument('--books',required=True);a=p.parse_args();books=a.books.split(',');state=load(B/'CURRENT-ARCHIVE-STATE.json');previous=Path(state['actual_inventory']);old={r['source_id']:r for r in load(previous)['articles']}
    auth=load(B/'user057-reuse-tu29-archive-authorization.json');auth['authorized_revisions']=[];auth['authorized_new_sources']=[];works=[];runs=[];new_count=0
    for book in books:
        ready=load(B/f'ready-user057-book{book}.json');w=Path(ready['metadata_files']['prepared-archive.json']).parent;m=load(w/'prepared-archive.json');r=m['articles'][0];assert r['new_id']==book
        h=Path(ready['real_V3_handoff']);permit={'source_id':r['source_id'],'new_id':book,'review_record':auth['user057_record'],'actual_scope057_handoff':{'path':str(h),'bytes':h.stat().st_size,'sha256':digest(h)}}
        if r['source_id'] in old:
            assert old[r['source_id']]['sha256']!=r['sha256'], 'Already installed item must not be installed again'
            permit.update(previous_row=old[r['source_id']],previous_row_sha256=revisions.identity(old[r['source_id']]))
            auth['authorized_revisions'].append(permit)
        else:
            assert (r['source_id'],book) in {('05','09'),('67','31')}
            assert not any(o['new_id']==book for o in old.values())
            permit['previous_accepted_row_exists']=False;auth['authorized_new_sources'].append(permit);new_count+=1
        works.append(w);runs.append(m['source_run'])
    label='-'.join(books);authpath=B/f'user057-books{label}-archive-authorization.json';write(authpath,auth);op=B/f'operations-user057-books{label}';assert not op.exists()
    cmd=[sys.executable,str(B/'prepare_operation.py'),'--work-dir',str(op),'--batch','2026-11-14-用户057书'+label+'统一0.6秒','--asset-branch','codex/user057-operations-books'+label,'--previous-inventory',str(previous),'--revision-authorization',str(authpath)]
    for w in works:cmd+=['--article-work-dir',str(w)]
    for path in [B/'first34_scope057_archive_policy.py',B/'prepare_first34_scope057_normal_asset.py',B/'emit_first34_final_release_inputs.py',B/'integrate_verified_batch.py',B/'first34-uniform06-057-scope-20261114/actual-user057-AGENTS-doc-only-append.json']:cmd+=['--attach',str(path)]
    subprocess.run(cmd,check=True)
    for repo in ['alienalgorithm/postgraduate-vocabulary','AlienCodes/literate-enigma']:subprocess.run([sys.executable,str(B/'archive_batch.py'),'push','--work-dir',str(op),'--repo',repo],check=True)
    plan={'writer_window_granted_by_root':True,'expected_heads':{'primary':state['primary_main'],'backup':state['backup_head']},'previous_inventory':str(previous),'operation_work_dir':str(op),'article_work_dirs':[str(w) for w in works],'revision_authorization':str(authpath),'result_count':len(old)+new_count,'source_run':runs,'message':'按用户057保存书'+label+'已完整验收0.6秒版本并同步最终目录 [skip ci]'};pp=B/f'integration-plan-user057-books{label}.json';write(pp,plan)
    subprocess.run([sys.executable,str(B/'integrate_verified_batch.py'),'--plan',str(pp),'--execute'],check=True)
    cmd=[sys.executable,str(B/'emit_first34_final_release_inputs.py')]
    for w in works:cmd+=['--installed-work-dir',str(w)]
    subprocess.run(cmd,check=True)
if __name__=='__main__':main()
