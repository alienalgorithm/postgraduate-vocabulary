"""Clean only six completed operation-record Git caches after fsck and dual refs."""
from pathlib import Path
import datetime
import json
import shutil
import subprocess

B=Path(__file__).resolve().parent
OPERATIONS=['operations-source36-normal18-029-051','operations-sources17-33-normal18','operations-source14-normal18-v2','operations-sources13-15-26-27-normal18-v2','operations-sources34-47-newsourceQA-normal18','operations-source62-new-repaired-sourceQA-normal18']
def load(p):return json.loads(p.read_text())
def main():
    rows=[]
    for name in OPERATIONS:
        w=B/name;bare=w/'assets.git'
        if not bare.exists():continue
        assert bare.is_dir() and not bare.is_symlink() and bare.parent==w and w.parent==B
        closure=load(w/'final-archive-receipt.json');assert closure['status']=='permanent_double_repository_archive_verified' and closure['archived_passed_count']==58
        assert len(closure['archives'])==2 and all(r['all_new_blob_sizes_and_identities_verified'] for r in closure['archives'])
        primary=load(w/'assets-primary.json');backup=load(w/'assets-backup.json');assert primary['asset_commit']==backup['asset_commit'] and primary['video_tree_sha']==backup['video_tree_sha']
        assert (w/'payload-file-index.json').is_file() and (w/'payload').is_dir()
        refs=[]
        for repo in ['alienalgorithm/postgraduate-vocabulary','AlienCodes/literate-enigma']:
            actual=subprocess.check_output(['gh','api','repos/'+repo+'/git/ref/heads/'+primary['asset_branch'],'--jq','.object.sha'],text=True).strip();assert actual==primary['asset_commit'];refs.append({'repository':repo,'actual_asset_commit':actual})
        check=subprocess.run(['git','--git-dir='+str(bare),'fsck','--full','--no-reflogs'],text=True,capture_output=True);assert check.returncode==0
        size=sum(p.stat().st_size for p in bare.rglob('*') if p.is_file());shutil.rmtree(bare)
        row={'operation':name,'only_deleted_own_closed_Git_cache':str(bare),'logical_bytes_removed':size,'dual_actual_asset_refs':refs,'git_fsck_exit_code':0,'git_fsck_output':check.stdout+check.stderr,'payload_media_QA_manuscripts_and_all_receipts_retained':True}
        rows.append(row);(w/'closed-own-operation-Git-cache-cleanup.json').write_text(json.dumps(row,ensure_ascii=False,indent=2)+'\n')
    result={'kind':'closed-six-normal18-operation-Git-cache-cleanup','observed_utc':datetime.datetime.now(datetime.timezone.utc).isoformat(),'rows':rows,'total_cache_bytes_removed':sum(r['logical_bytes_removed'] for r in rows),'remote_refs_or_media_or_sources_or_PDF_modified':False}
    (B/'normal18-six-closed-operation-cache-cleanup.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n');print(json.dumps(result,ensure_ascii=False))
if __name__=='__main__':main()
