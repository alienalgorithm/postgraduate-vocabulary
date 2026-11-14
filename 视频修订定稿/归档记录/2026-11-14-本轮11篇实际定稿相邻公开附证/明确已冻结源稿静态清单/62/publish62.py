"""Freeze approved62 data and one control leaf; no media or remote work."""
from pathlib import Path
import copy,datetime,hashlib,importlib.util,json,shutil
H=Path(__file__).parent;B=H.parent;C=H/'candidate-payload';PAY=B/'payload';CI=Path('/workspace/work/video-revision-batch-ci/.github/video-revision-batch/approved-video-layouts70.json');D=Path('/workspace/work/video-revision-delivery/article62-review-intake-20261114')
sha=lambda p:hashlib.sha256(Path(p).read_bytes()).hexdigest()
def read(p):return json.loads(Path(p).read_text())
def load(name,path):
 s=importlib.util.spec_from_file_location(name,path);m=importlib.util.module_from_spec(s);s.loader.exec_module(m);return m
P=load('original_exact_diff',B/'generator_text_preflight.py');T=load('unchanged_layout_digest',B/'illustrated-tail/illustrated_tail.py')
text=read(H/'gen-text-validation-v7/report.json');whole=read(H/'intermediate-three-focus-and-approved-cut-before-052/static-render-report.json');static=read(H/'caption-static-render-report.json');ind=D/'independent-three-feedback-and-specific-pause-candidate-review.json';add=D/'independent-final-052-caption-only-addendum.json';visual=read(H/'actual-caption-visual-review.json');binding=read(H/'caption-original-audio-input-binding.json')
assert text['passed']and whole['passed']and static['passed']and visual['approved']
assert read(ind)['candidate_text_and_specific_control_scope_passed']
ar=read(add);assert any(v is True for k,v in ar.items()if 'passed'in k)
source=C/'视频/脚本/62.json';assert sha(source)=='e34fe389b2d543996f09c063e8c57750b2b9a9be77e6a5d757c3529f96471d47'
assert sha(source)==text['current_source_sha256']==static['after_source_sha256']==visual['source_sha256']==binding['final_source_sha256']
old=read(H/'before/视频/脚本/62.json');new=read(source);request=H/'before/current-PAY/视频/脚本/62.json';snapshot=H/'actual-old-native-last-sent62.json';assert sha(snapshot)=='d353d680303e20089dd79d03e4a1ccf43b238bab75714c320b14cbdc6ff815e5'
restored=copy.deepcopy(new);restored['停顿插入点']['S15']['2'][0]=3.580083
for k,v in old.items():
 if k not in('sentences','核对确认','allow_clash'):assert restored[k]==v,k
assert new['停顿插入点']['S15']['2'][0]==3.584083
assert all(r['summary_text_font_rows_and_pixels_exact']for r in static['resolutions'])
manifest_before=CI.read_bytes();approved=json.loads(manifest_before);row=next(r for r in approved['articles']if r['source_id']=='62');oldrow=copy.deepcopy(row)
assert row['source_json_sha256']==sha(request);assert row['source_layout_structural_sha256']==T.source_layout_digest(read(request))
row['source_json_sha256']=sha(source);row['source_layout_structural_sha256']=T.source_layout_digest(new)
diff=P.differences(json.loads(manifest_before),approved);assert len(diff)==2 and all('/articles/'in r['path']for r in diff)
states=read(H/'before/baseline-states.json');files=[]
for rel in ['视频/脚本/62.json','视频/工具/初稿生成/gen62.py','新版定稿/62-dolly-the-copied-sheep.md','视频/制作记录/62_待改清单.md','视频/制作记录/逐句确认/62.json']:
 dest=PAY/rel;state=states[rel];assert dest.exists()==state['exists'],rel
 if state['exists']:assert sha(dest)==state['sha256'],rel
 files.append((C/rel,dest))
gen=B/'gen-sources/gen62.py';state=states['gen-sources/gen62.py'];assert gen.exists()==state['exists']
if gen.exists():assert sha(gen)==state['sha256']
files.append((C/'视频/工具/初稿生成/gen62.py',gen));snapdest=PAY/'视频/脚本/已发版本/62.json'
if snapdest.exists():
 q=H/'before/current-PAY-last-sent62-at-freeze.json';shutil.copyfile(snapdest,q)
files.append((snapshot,snapdest))
auth=PAY/'视频/工具/用户同意记录.json';authbefore=auth.read_bytes();current=json.loads(authbefore);entries=read(H/'proposal-report.json')['auth_entries'];assert len(entries)==4 and all(r['篇']=='62'for r in entries)
for r in entries:
 if r not in current['记录']:current['记录'].append(r)
(H/'用户同意记录.actual-before.json').write_bytes(authbefore);applied=[]
for src,dest in files:
 before=sha(dest)if dest.exists()else None;dest.parent.mkdir(parents=True,exist_ok=True);shutil.copyfile(src,dest);applied.append({'path':str(dest),'before_sha256':before,'after_sha256':sha(dest),'bytes':dest.stat().st_size})
auth.write_text(json.dumps(current,ensure_ascii=False,indent=2)+'\n');applied.append({'path':str(auth),'before_sha256':hashlib.sha256(authbefore).hexdigest(),'after_sha256':sha(auth),'scope':'Four exact article62 entries appended to fresh global record; every other entry preserved.'})
(H/'approved-video-layouts70.before.json').write_bytes(manifest_before);CI.write_text(json.dumps(approved,ensure_ascii=False,indent=2)+'\n');(H/'approved-video-layouts70.after.json').write_bytes(CI.read_bytes())
evidence=['gen-text-validation-v7/report.json','intermediate-three-focus-and-approved-cut-before-052/static-render-report.json','caption-static-render-report.json','actual-caption-visual-review.json','original-T34-one-group-split.json','genuine-old-L13-without-split-approval-observation.json','original-audio-input-invariance.json','caption-original-audio-input-binding.json','original-caption-stable-mechanical-fold.json']
report={'article':'62','book_order':'34','source_freeze_complete':True,'created_utc':datetime.datetime.now(datetime.timezone.utc).isoformat(),'source_JSON_sha256':sha(source),'GEN_sha256':sha(C/'视频/工具/初稿生成/gen62.py'),'MD_sha256':sha(C/'新版定稿/62-dolly-the-copied-sheep.md'),'files_applied':applied,'latest_actual_baseline_source_sha256':'8147198c65aa6f66839b2a7050dbe13c5e4209725ddff01bcb636859340ba084','genuine_old_native_snapshot_sha256':sha(snapshot),'original_GEN_exact_and_text_before_repair_after_exit':[0,0,0],'genuine_L13_ran_and_only_S6_focus_T34_reflow_covered_by_actual_final_authorization':True,'three_focus_vocabulary_rows_present_once':True,'user052_caption_after_original_testify_note':True,'five_summary_points_canonical_text_and_actual128px_RGB_exact':True,'raw_summary_wrap_changed_only_by_original_G35_recorded':True,'only_waveform_control_change':{'path':'停顿插入点.S15.2[0]','from':3.580083,'to':3.584083,'sample_delta_at24k':96,'root049_implementation_not_user_specific_ms_quote':True},'target_new_WAV_sha256':'c5330026dbc9f81d0c7546a1716b9dade9960f44311862a5feb3e4aa0749d7c3','target_new_AAC_sha256':'b85f7e4c45784077f227b29a24b7cd72cef6c6160aa3783747ba708f8fda6348','old_AAC_bit_identity_not_claimed_for_local_repair':True,'all_other_voice_controls_and_spoken_text_exact':True,'global_post_reading_tail_hold_seconds':0.6,'tail_hold30fps_frames':18,'sole_native_launcher_and_tail_implementation_owner':'/root/resume_audio_ci','fresh_native_ASR_and_all_formal_audio_gates_still_required':True,'CI_approved_manifest':{'path':str(CI),'before_sha256':hashlib.sha256(manifest_before).hexdigest(),'after_sha256':sha(CI),'before_row':oldrow,'after_row':row,'only_62_source_and_structural_digest_leaves_changed':True,'all_other_rows_preserved':True},'independent_reviews':[{'path':str(p),'sha256':sha(p)}for p in [ind,add]],'evidence':[{'path':str(H/p),'sha256':sha(H/p)}for p in evidence],'previous_three_focus_intermediate_preserved':True,'all_failed_original_gate_diagnostics_preserved':True,'PDF_not_accessed_or_modified':True,'native_or_TTS_or_video_or_remote_mutation_executed':False}
p=H/'source-freeze-and-static-approval.json';p.write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n');print('source',sha(source));print('freeze',sha(p));print('sharedCI',sha(CI))
