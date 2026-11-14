"""Read current final-folder Git identities for the eleven already accepted videos."""
from pathlib import Path
import argparse
import datetime
import hashlib
import json
import subprocess
import urllib.parse
import urllib.request

B=Path(__file__).resolve().parent
def load(p):return json.loads(Path(p).read_text())
def main():
    ap=argparse.ArgumentParser();ap.add_argument('--receipt',required=True);ap.add_argument('--inventory',required=True);ap.add_argument('--output',required=True);a=ap.parse_args()
    receipt=load(a.receipt);inv=load(a.inventory)
    assert receipt['status']=='permanent_double_repository_archive_verified' and receipt['final_directory_synchronized_atomically_with_inventory'] is True
    assert inv['archived_passed_count']==58 and len(inv['articles'])==58
    quality=load('/workspace/work/video-revision-delivery/hold18-intake-preparation-20261114/actual-normal18-eleven-completed-20261114.json')
    assert quality['all_normal11_actual_V3_passed'] is True and len(quality['rows'])==11
    current={r['source_id']:r for r in inv['articles']};selected=[]
    for q in quality['rows']:
        sid=q['source_id'];row=current[sid]
        assert row['new_id']==q['new_id'] and row['sha256']==q['actual_final']['sha256'] and row['bytes']==q['actual_final']['bytes']
        assert row['passed_per_article'] is True
        if 'postprocessing_full_V3_handoff_sha256' in row:
            assert row['postprocessing_full_V3_handoff_sha256']==q['handoff']['sha256']
        else:
            assert sid in {'17','33','36'}, 'Only earlier frozen rows omit this optional field'
            work=B/f"run{row['source_run']}-{sid}-normal-hold18-postonly-v1"
            assets=load(work/'assets-primary.json');assert assets['asset_commit']==row['asset_commit']
            matches=[r for r in assets['files_index'] if r['sha256']==q['handoff']['sha256'] and r['bytes']==q['handoff']['bytes']]
            assert matches, 'Exact full V3 handoff must exist in permanent verified asset'
        assert row['production_delivery_eligible'] is True and row['preview_only'] is False and row['post_reading_pause_seconds']==0.6 and row['nominal_extra_hold_frames_at_30fps']==18
        assert q['actual_tail']['extra_body_hold_frames']==18 and q['actual_tail']['illustration_frames']==q['actual_tail']['summary_frames']==60
        selected.append({'source_id':sid,'book_order':row['new_id'],'title_zh':row['title_zh'],'bytes':row['bytes'],'sha256':row['sha256'],'native_source_run':row['source_run'],'final_full_V3_handoff_sha256':q['handoff']['sha256'],'post_reading_pause_seconds':0.6,'actual_gap_seconds':q['actual_tail']['voice_to_illustration_gap_seconds'],'preview_only':False,'source_audio_repaired_relative_to_declared_baseline':q['audio_repaired_relative_to_declared_accepted_baseline'],'tail_postprocessing_changed_audio':False,'final_alias_repo_path':'视频修订定稿/最终定稿/视频/'+row['new_id']+' '+row['title_zh']+'.mp4','asset_commit':row['asset_commit']})
    token=subprocess.check_output(['gh','auth','token'],text=True).strip()
    def api(repo,path):
        url='https://api.github.com/repos/'+repo+'/'+urllib.parse.quote(path,safe='/?=&%')
        req=urllib.request.Request(url,headers={'Authorization':'Bearer '+token,'Accept':'application/vnd.github+json','User-Agent':'Codex-readonly-current-eleven-final-Git-identities'})
        with urllib.request.urlopen(req,timeout=30) as r:return json.loads(r.read())
    observations=[]
    for archive,branch in zip(receipt['archives'],['main','codex/all-deliverables-20261113']):
        repo=archive['repository'];assert api(repo,'git/ref/heads/'+branch)['object']['sha']==archive['commit']
        tree=api(repo,'git/trees/'+archive['final_directory']['final_tree_sha']+'?recursive=1');assert not tree.get('truncated')
        leaves={r['path']:r for r in tree['tree'] if r['type']=='blob'};assert len(leaves)==118
        manifests=next(r for p,r in leaves.items() if p.endswith('.json') and '/' not in p)
        raw=api(repo,'git/blobs/'+manifests['sha']);import base64
        manifest=json.loads(base64.b64decode(raw['content']));videos={r['source_id']:r for r in manifest['videos']}
        for row in selected:
            info=videos[row['source_id']];relative=row['final_alias_repo_path'].removeprefix('视频修订定稿/最终定稿/')
            node=leaves[relative]
            assert info['sha256']==row['sha256'] and info['bytes']==row['bytes']
            assert node['sha']==info['git_blob_sha'] and node['size']==row['bytes'] and node['mode']=='100644'
            if 'Git_blob_SHA' in row:assert row['Git_blob_SHA']==node['sha']
            row['Git_blob_SHA']=node['sha']
        observations.append({'repository':repo,'branch':branch,'actual_commit':archive['commit'],'final_folder_tree':archive['final_directory']['final_tree_sha'],'actual_current58_final_file_count':58,'all_eleven_current_aliases_exact_original_Git_blob_size_mode':True})
    assert len({r['final_folder_tree'] for r in observations})==1
    proof={'kind':'actual-eleven-normal06-final-alias-Git-identity-closure','observed_utc':datetime.datetime.now(datetime.timezone.utc).isoformat(),'normal_current_eleven':sorted(selected,key=lambda r:int(r['book_order'])),'actual_repositories':observations,'all_eleven_actual_full_V3_and_dual_asset_http_proofs_retained':True,'unique_final_article_count':58,'whole70_complete_claimed':False,'source28_kept_separate_preview_only':True,'PDF_files_accessed_or_modified':False,'new_video_or_audio_quality_tests_run':False}
    Path(a.output).write_text(json.dumps(proof,ensure_ascii=False,indent=2)+'\n');print(json.dumps({'output':a.output,'all_eleven_current_aliases_exact':True,'actual_heads':[r['actual_commit'] for r in observations],'unique_count':58},ensure_ascii=False))
if __name__=='__main__':main()
