"""Read-only effective model input and DSP comparison; never synthesize audio."""
import hashlib,importlib.util,json
from pathlib import Path
H=Path(__file__).parent;B=H.parent;F=B/'next-passed-native/43543967031/62/artifact-files'
sha=lambda p:hashlib.sha256(Path(p).read_bytes()).hexdigest()
s=importlib.util.spec_from_file_location('unchanged_original_input_capture',B/'audio14-color-review-input-invariance/inspect14_audio_inputs.py');m=importlib.util.module_from_spec(s);s.loader.exec_module(m)
assert hashlib.sha256(m.r.m.source.encode()).hexdigest()=='4c85e1fbdd2e82c5646d5f58df63c85eca60af4ef521f1d36f765575a568d6f3'
paths={'request':H/'before/视频/脚本/62.json','accepted_actual':F/'62-actual-working-source.json','candidate':H/'candidate-payload/视频/脚本/62.json'}
rows={k:m.source_inputs(p)for k,p in paths.items()}
for d in rows.values():
 semantic=d['audio_semantics'];semantic.pop('S12_and_other_legacy_DSP_conditions');semantic['article_control_condition']='62>=26 and >=46: original automatic gain and tail guard conditions remain unchanged';d['audio_semantics_sha256']=hashlib.sha256(m.canonical(semantic)).hexdigest()
a=rows['request']['audio_semantics'];assert rows['accepted_actual']['audio_semantics']==a
import copy
normalized=copy.deepcopy(rows['candidate']['audio_semantics'])
assert normalized['waveform_control_top_level']['停顿插入点']['S15']['2'][0]==3.584083
normalized['waveform_control_top_level']['停顿插入点']['S15']['2'][0]=3.580083
assert normalized['sentence_rows'][14]['source_DSP']['停顿插入点']['2'][0]==3.584083
normalized['sentence_rows'][14]['source_DSP']['停顿插入点']['2'][0]=3.580083
assert normalized==a
prep=F/'62-checker-reference-preparation.json';p=json.loads(prep.read_text());calls=p['reference_calls'];matched=[]
for plan in a['model_input_plans']:
 hit=[r for r in calls if r['exact_native_cache_key']==plan['expected_exact_cache_key']]
 matched.append({'sentence':plan['sentence'],'role':plan['role'],'method':plan['method'],'expected_cache_key':plan['expected_exact_cache_key'],'actual_old_native_key_observed':bool(hit),'actual_old_effective_input_sha_match':any(r['cache_input_text_sha256']==plan['effective_input_sha256']for r in hit),'is_separate_donor':plan['sentence']=='供体'})
# Ending-specific raw/timed mothers can be absent from the checker registry; never fabricate cache provenance.
assert all(x['actual_old_effective_input_sha_match']for x in matched if x['actual_old_native_key_observed'])
report={'approved_audio_repair_conclusion_path':'/workspace/work/dolly62-audio-user-review-20261114/FULL-CANDIDATE-AUDIO-REVIEW-CONCLUSION.json','approved_audio_repair_conclusion_sha256':'848d0c7ce21dd7f3bdf7f120ea25df294a80f770de25b12298917e54a0cfc78e','article':'62','book_order':'34','kind':'read-only-original-effective-model-input-and-DSP-invariance','passed_input_invariance':True,'new_video_or_audio_generated':False,'new_video_quality_acceptance':False,'original_maker_sha256':hashlib.sha256(m.r.m.source.encode()).hexdigest(),'title_all_19_spoken_model_inputs_chunks_paragraphs_and_untouched_DSP_exact':True,'only_source_DSP_delta_is_root049_S15_2_plus96samples':True,'all_effective_model_input_plans_equal':True,'actual_effective_model_input_count':len(a['model_input_plans']),'actual_old_native_preparation':{'path':str(prep),'sha256':sha(prep),'crosschecks':matched,'model_sha256':p['models_sha256'],'fixed_voice_file_sha256':p['fixed_voice_sha256']},'audio_semantics_sha256':rows['candidate']['audio_semantics_sha256'],'sources':rows,'control_top_level':m.controls,'plain_pipeline':'Original render.strip_gloss, emphasis removal and exact chunk join; original spoken numeric/quote normalization and original pronunciation wrapper; model and voice cache keys captured without TTS or cache writes.','qualification':'Input equality is proved for this own actual accepted36 preparation. The new native MP4 must pass all official audio and ASR gates and match newly approved c533 WAV/b85f AAC, then inline must preserve new canonical packets; old AAC is intentionally changed only in the documented local codec support after authorized render; this report does not claim a new MP4 exists.'}
out=H/'original-audio-input-invariance.json';out.write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n');print(json.dumps({'passed':True,'plans':len(a['model_input_plans']),'sha256':sha(out)},ensure_ascii=False))
