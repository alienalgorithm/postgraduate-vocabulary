"""Preserve explicit historical tool fixtures, optional decoded frames and public profiles."""
from pathlib import Path
import datetime
import hashlib
import json
import uuid

B=Path(__file__).resolve().parent
W=B/'normal18-tool-history-record-assets-20261114'
PREFIX=Path('视频修订定稿/归档记录/2026-11-14-normal18工具历史与补充实帧')
DENIED={'b9a257a23820944ee95d568b67d1cd78947b1c1814bb70dc99a45871f488f778','55026ce1b7cdb7e9c1a72da2f715e3d9e6e6f45050a8ddd575dc052b09dca872','bcb37d8930d804988c95da94b9cfeaaab2c7b026df96e6e4567f9b698ce88fbf'}
def load(p):return json.loads(p.read_text())
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def save(p,v):p.parent.mkdir(parents=True,exist_ok=True);p.write_text(json.dumps(v,ensure_ascii=False,indent=2)+'\n')
def main():
    assert not W.exists();W.mkdir();ram=Path('/dev/shm')/('codex-public-approved-small-record-payload-'+uuid.uuid4().hex);ram.mkdir();(W/'payload').symlink_to(ram,target_is_directory=True)
    bindings=[]
    def add(path,relative,size=None,expected=None):
        p=Path(path);assert p.suffix in {'.json','.py','.png','.jpg','.log'} and not p.name.startswith('CURRENT-ROOT-DELIVERY-STATE')
        raw=p.read_bytes();digest=hashlib.sha256(raw).hexdigest();assert digest not in DENIED
        assert size is None or size==len(raw);assert expected is None or expected==digest
        target=W/'payload'/PREFIX/relative;target.parent.mkdir(parents=True,exist_ok=True);target.write_bytes(raw)
        bindings.append({'original_path':str(p),'repo_path':str(PREFIX/relative),'bytes':len(raw),'sha256':digest})
    m=Path('/workspace/work/dolly62-audio-user-review-20261114/native62-helper-safe-evidence-manifest-v2.json');assert sha(m)=='a98cda0adbfdaece35d361929f755e1d4e9c8e53b727d77d8c0fae1aa6edb547'
    add(m,Path('实际生产前工具历史')/'native62-helper-safe-evidence-manifest-v2.json')
    for i,r in enumerate(load(m)['entries'],1):add(r['path'],Path('实际生产前工具历史')/f"{i:02d}-{Path(r['path']).name}",r['bytes'],r['sha256'])
    d=Path('/workspace/work/video-audit70-20261113/article17-user-review-20261114/native17/actual-new-vocabulary-and-ending-frames');manifest=d/'files-sha256.json';assert sha(manifest)=='04e19f2bcc1ce4a45f81ed40f767b69b50d29683e98a56dec34417e0be66519e'
    add(manifest,Path('原17本轮改词后已验历史实际4K补帧')/'files-sha256.json')
    for name,r in load(manifest).items():add(d/name,Path('原17本轮改词后已验历史实际4K补帧')/name,r['bytes'],r['sha256'])
    r=Path('/workspace/work/video-audit70-20261113/global-final-hold18-20261114/original-eight-upstream-program-exact-history-recovery.json');add(r,Path('原八篇上游程序历史定位原件')/r.name,expected='4e1db8f16fc2dc227c78095702ed566ef886ede3794b1185712e810d29f28120')
    for name in ['NEW-HOLD18-PUBLICATION-PROFILES-20261114.json','PRIOR-FIVE-HOLD18-PUBLICATION-PROFILES-20261114.json','REMAINING-TWO-HOLD18-PUBLICATION-PROFILES-20261114.json']:
        rows=load(Path('/workspace/work')/name);assert isinstance(rows,list)
        public=[{k:v for k,v in r.items() if k!='directory'} for r in rows]
        assert all(not(isinstance(v,str)and v.startswith(('/workspace/','/dev/shm/','/home/'))) for r in public for v in r.values())
        save(W/'payload'/PREFIX/'历史发布配置公开摘要'/name,{'kind':'public_profile_point_in_time_summary_with_internal_directory_field_removed','rows':public,'historical_prepublication_flags_preserved_as_original_point_in_time':True,'not_a_live_ROOT_delivery_snapshot':True})
    for name in ['normal18-six-closed-operation-cache-cleanup.json','cleanup_closed_normal18_operation_bares.py','prepare_normal18_tool_history_records.py']:
        add(B/name,Path('仅已闭合归档缓存维护记录')/name)
    for op in ['operations-source36-normal18-029-051','operations-sources17-33-normal18','operations-source14-normal18-v2','operations-sources13-15-26-27-normal18-v2','operations-sources34-47-newsourceQA-normal18','operations-source62-new-repaired-sourceQA-normal18']:
        add(B/op/'closed-own-operation-Git-cache-cleanup.json',Path('仅已闭合归档缓存维护记录')/op/'receipt.json')
    save(W/'payload'/PREFIX/'explicit-safe-history-bindings.json',{'kind':'actual-explicit-safe-tool-and-frame-history-only','recorded_utc':datetime.datetime.now(datetime.timezone.utc).isoformat(),'exact_bindings':bindings,'native62_helper_diagnostic_history_not_substituted_for_final_native_73_QA':True,'source17_frames_are_before_hold18_history_of_same_updated_body':True,'current_final_media_or_QA_or_active_aliases_modified':False,'no_private_PCM_GT_cache_or_PDF_exported':True,'no_denied_registry_payload_or_live_ROOT_snapshot_exported':True})
    save(W/'prepared-archive.json',{'prefix':str(PREFIX),'asset_branch':'codex/normal18-tool-history-records-20261114','scope':'Only explicit safe historical helper fixtures/decoded PNG/clean cache receipts and profiles without directory fields'})
    rows=[{'repo_path':str(p.relative_to(W/'payload')),'bytes':p.stat().st_size,'sha256':sha(p)} for p in sorted((W/'payload').rglob('*')) if p.is_file()];save(W/'payload-file-index.json',rows);print(json.dumps({'files':len(rows),'bytes':sum(r['bytes'] for r in rows),'media_or_quality_or_PDF_changes':False}))
if __name__=='__main__':main()
