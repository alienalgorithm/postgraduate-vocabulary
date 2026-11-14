"""Verify append-only public instructions with every other Git root entry preserved."""
from pathlib import Path
import base64
import datetime
import hashlib
import json
import subprocess
import urllib.parse
import urllib.request

HERE=Path(__file__).resolve().parent
B=HERE.parent
TARGETS=[('primary','alienalgorithm/postgraduate-vocabulary','main','cfd094489817a9baf3f4218c8de25e141e00648a','3894e845474fd848d990257568f2ceb4c5048f3f'),('backup','AlienCodes/literate-enigma','codex/all-deliverables-20261113','3352873db279d8bc008d1a5a34c990d325aa3f33','d1b866af22b3acec973300285584a789acb2456d')]
def main():
    token=subprocess.check_output(['gh','auth','token'],text=True).strip()
    def api(repo,path):
        req=urllib.request.Request('https://api.github.com/repos/'+repo+'/'+urllib.parse.quote(path,safe='/?=&%'),headers={'Authorization':'Bearer '+token,'Accept':'application/vnd.github+json'})
        with urllib.request.urlopen(req,timeout=30) as r:return json.loads(r.read())
    rows=[]
    for role,repo,branch,parent,head in TARGETS:
        assert api(repo,'git/ref/heads/'+branch)['object']['sha']==head
        before=api(repo,'git/commits/'+parent);after=api(repo,'git/commits/'+head);assert [p['sha'] for p in after['parents']]==[parent]
        old={r['path']:r for r in api(repo,'git/trees/'+before['tree']['sha'])['tree']};new={r['path']:r for r in api(repo,'git/trees/'+after['tree']['sha'])['tree']}
        assert old.keys()==new.keys() and all(old[k]==new[k] for k in old if k!='AGENTS.md')
        assert old['AGENTS.md']['sha']!=new['AGENTS.md']['sha']
        original=(HERE/(role+'-AGENTS-before.md')).read_bytes();expected=(HERE/(role+'-AGENTS-after.md')).read_bytes();assert expected.startswith(original)
        remote=api(repo,'git/blobs/'+new['AGENTS.md']['sha']);actual=base64.b64decode(remote['content']);assert actual==expected
        assert hashlib.sha1(b'blob '+str(len(actual)).encode()+b'\0'+actual).hexdigest()==new['AGENTS.md']['sha']
        assert all(text.encode() in actual[len(original):] for text in ['2026-11-14','0.6 秒','18 帧','HTTPS MP4 或 ZIP','不读取、修改、生成或上传任何 PDF 文件'])
        rows.append({'repository':repo,'branch':branch,'previous_commit':parent,'commit':head,'single_changed_file':'AGENTS.md','original_full_document_prefix_preserved':True,'exact_new_document_sha256':hashlib.sha256(actual).hexdigest(),'new_Git_blob_SHA':new['AGENTS.md']['sha'],'new_bytes':len(actual),'video_archive_directory_and_cumulative_index_tree_unchanged':new['视频修订定稿']['sha']==old['视频修订定稿']['sha'],'all_other_root_entries_including_PDF_trees_preserved':True,'actual_all_unchanged_root_entries':{k:{'mode':r['mode'],'type':r['type'],'sha':r['sha']} for k,r in new.items() if k!='AGENTS.md'}})
    master=api('AlienCodes/literate-enigma','git/ref/heads/master')['object']['sha'];assert master=='6355a02864ebae616b693200d9d26f74f5da80e9'
    proof={'kind':'actual-append-only-AGENTS-public-user-rules-doc-commit-verification','observed_utc':datetime.datetime.now(datetime.timezone.utc).isoformat(),'archives':rows,'backup_master_unchanged':master,'only_MD_read_and_changed_no_PDF_file_access':True,'media_source_QA_or_final_alias_modified':False,'internal_ROOT_state_or_restricted_registry_payload_included':False,'backup_initial_connector_internal_error_verified_no_mutation_before_one_retry':True}
    (HERE/'ACTUAL-DOC-ONLY-DUAL-VERIFICATION.json').write_text(json.dumps(proof,ensure_ascii=False,indent=2)+'\n')
    state_path=B/'CURRENT-ARCHIVE-STATE.json';state=json.loads(state_path.read_text());state['primary_main']=TARGETS[0][4];state['backup_head']=TARGETS[1][4];state['last_doc_only_HEAD_update']={'scope':'AGENTS.md only; unchanged final58 inventory and video trees','actual_receipt':str(HERE/'ACTUAL-DOC-ONLY-DUAL-VERIFICATION.json'),'previous_video_archive_commits':{'primary':TARGETS[0][3],'backup':TARGETS[1][3]}};state_path.write_text(json.dumps(state,ensure_ascii=False,indent=2)+'\n')
    print(json.dumps({'primary':TARGETS[0][4],'backup':TARGETS[1][4],'only_AGENTS_md_changed':True,'all_video_index_PDF_trees_and_master_unchanged':True,'local_CURRENT_archive_heads_updated':True},ensure_ascii=False))
if __name__=='__main__':main()
