"""Save completed ZIP publication and public AGENTS document proofs, no media access."""
from pathlib import Path
import hashlib
import json
import zipfile

B=Path(__file__).resolve().parent
W=B/'final-eleven-bundle-and-AGENTS-record-assets-20261114'
PREFIX=Path('发行记录/2026-11-14-本轮11篇0.6秒4K合集及最新公共规则')
D=Path('/workspace/work/reviewed-eleven-hold06-4k-v1')
DOC=B/'doc-only-agents-user-rules-20261114'
DENIED={'b9a257a23820944ee95d568b67d1cd78947b1c1814bb70dc99a45871f488f778','55026ce1b7cdb7e9c1a72da2f715e3d9e6e6f45050a8ddd575dc052b09dca872','bcb37d8930d804988c95da94b9cfeaaab2c7b026df96e6e4567f9b698ce88fbf'}
def load(p):return json.loads(p.read_text())
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def save(p,v):p.parent.mkdir(parents=True,exist_ok=True);p.write_text(json.dumps(v,ensure_ascii=False,indent=2)+'\n')
def main():
    assert not W.exists();dst=W/'payload'/PREFIX;dst.mkdir(parents=True)
    copied=[]
    def add(p,relative):
        p=Path(p);assert p.suffix in {'.json','.py','.yml','.md','.log','.zip'} and p.stat().st_size<4*1024*1024
        raw=p.read_bytes();digest=hashlib.sha256(raw).hexdigest();assert digest not in DENIED
        target=dst/relative;target.parent.mkdir(parents=True,exist_ok=True);target.write_bytes(raw)
        copied.append({'source_name':p.name,'archive_relative_path':str(relative),'bytes':len(raw),'sha256':digest,'original_bytes_preserved':True})
    receipt=load(D/'RELEASE-VERIFICATION.json');identity=load(D/'ACTUAL-NATIVE-PUBLICATION-IDENTITY.json')
    assert receipt['passed'] is True and receipt['video_count']==11 and receipt['end_reading_pause_seconds']==0.6
    assert receipt['release_id']==445248394 and receipt['native_actions_run_id']==43590830686
    assert receipt['every_zip_MP4_size_and_sha256_verified'] is True and receipt['actual_public_entire_ZIP_download_verified'] is True
    assert receipt['ZIP_bytes']==182222617 and receipt['ZIP_sha256']=='cf52d265da3eb6ed6437f5ae3f8427c39881220f77276c85e19a5557cc20c0bc'
    assert identity['actual_public_complete_HTTP_status']==200 and identity['actual_public_ZIP_CRC_errors']==0 and identity['actual_public_ZIP_entry_count']==12
    q=load(B/'ACTUAL-ELEVEN-NORMAL06-FINAL-ALIAS-CLOSURE.json');current={r['source_id']:r for r in q['normal_current_eleven']}
    for video in receipt['videos']:
        expected=current[video['source_id']];assert expected['book_order']==video['book_order'] and expected['sha256']==video['sha256'] and expected['bytes']==video['bytes']
    small=D/'native-release-verification.zip';assert small.stat().st_size==1588 and sha(small)=='233cdc05365cc15346c951770dc8c324e1d913de618ebae7f1f55a3e5e23206c'
    with zipfile.ZipFile(small) as z:assert z.testzip() is None and z.namelist()==['RELEASE-VERIFICATION.json'] and z.read('RELEASE-VERIFICATION.json')==(D/'RELEASE-VERIFICATION.json').read_bytes()
    assert sha(D/'actual-successful-native-head-publish_single.py')==receipt['publisher_sha256'] and sha(D/'MANIFEST.json')==receipt['manifest_sha256']
    expected_names={'ACTUAL-CONFIG-DUAL-SAVE-AND-PUBLISH-TRIGGER.json','ACTUAL-NATIVE-PUBLICATION-IDENTITY.json','ACTUAL-TRANSPORT-URL-FIX-DUAL-SAVE-AND-RETRY.json','FAILED-RUN-43590440805.log','MANIFEST.json','PUBLIC-RELEASE-OBSERVATION.json','PUBLICATION-PROFILE.json','PUBLICATION-SOURCE-DUAL-SAVE.json','RELEASE-VERIFICATION.json','RUN.json','actual-failed-43590440805-publish_single.py','actual-successful-native-head-publish_single.py','actual-successful-native-head-workflow.yml','native-release-verification.zip','publish-single.yml','publish_single.py'}
    assert {p.name for p in D.iterdir() if p.is_file()}==expected_names
    for name in sorted(expected_names):
        if name=='PUBLICATION-SOURCE-DUAL-SAVE.json':
            source=load(D/name);assert 'directory' in source['profile'];public={**source,'profile':{k:v for k,v in source['profile'].items() if k!='directory'}}
            save(dst/'实际已发布合集小原件'/'PUBLICATION-SOURCE-DUAL-SAVE.public-summary.json',{'kind':'public_publishing_source_save_facts_with_internal_directory_removed','public_facts':public,'original_detailed_receipt_preserved_locally':True});continue
        add(D/name,Path('实际已发布合集小原件')/name)
    for name in ['primary-AGENTS-before.md','primary-AGENTS-after.md','backup-AGENTS-before.md','backup-AGENTS-after.md','verify_doc_only_AGENTS.py','ACTUAL-DOC-ONLY-DUAL-VERIFICATION.json']:add(DOC/name,Path('仅AGENTS公共指令文档修改与实际验证')/name)
    add(Path(__file__),Path('只归档原小记录程序')/Path(__file__).name)
    save(dst/'exact-safe-publication-and-doc-record-bindings.json',{'kind':'actual-eleven-ZIP-and-append-only-AGENTS-completed-public-records','files':copied,'eleven_current_final_alias_identity_matches_actual_ZIP_receipt':True,'only_original_1588_byte_verification_artifact_saved_not_full_ZIP_or_MP4':True,'initial_draft_URL_404_failure_and_actual_fix_code_preserved':True,'no_native_media_TTS_QA_or_PDF_read_or_changed':True,'no_live_ROOT_state_or_restricted_registry_payload_saved':True,'source28_not_in_normal_eleven_final_ZIP':True,'original_detailed_source_save_receipt_remains_local_only_public_summary_saved':True})
    save(W/'prepared-archive.json',{'prefix':str(PREFIX),'asset_branch':'codex/final-eleven-bundle-AGENTS-public-records-20261114','scope':'Only completed public ZIP publication small proof and public AGENTS doc-only history; no media/PDF/internal ROOT state'})
    rows=[{'repo_path':str(p.relative_to(W/'payload')),'bytes':p.stat().st_size,'sha256':sha(p)} for p in sorted((W/'payload').rglob('*')) if p.is_file()];save(W/'payload-file-index.json',rows);print(json.dumps({'files':len(rows),'bytes':sum(r['bytes'] for r in rows),'actual_bundle_release_id':445248394,'MP4_or_full_ZIP_copied':False}))
if __name__=='__main__':main()
