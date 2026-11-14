"""Freeze only scalar source/PCM/codec bindings for the approved native supplement."""
from pathlib import Path
import json,tempfile,copy,hashlib,re
import numpy as np,soundfile as sf
OUT=Path('/workspace/work/dolly62-audio-user-review-20261114')
defs=OUT/'private_full_candidate_original_qc.py'
exec(compile(defs.read_text().split('\nreport={')[0],str(defs)+'#definitions-only','exec'))
DEST=Path('/workspace/work/video-audit70-20261113/article62-user-review-20261114/native-audio-helper');DEST.mkdir(parents=True,exist_ok=True)
source_path=Path('/workspace/work/video-audit70-20261113/payload/视频/脚本/62.json');gen=source_path.parents[1]/'工具/初稿生成/gen62.py';approved=json.loads(source_path.read_text());proof=json.loads((OUT/'private-full-candidate-original-QC.json').read_text())
canon=lambda value:hashlib.sha256(json.dumps(value,ensure_ascii=False,sort_keys=True,separators=(',',':')).encode()).hexdigest()
spoken=lambda data:[data['title_en']]+[' '.join(re.sub(r'\{\{.*?\}\}|\*\*','',c['en'])for c in s['chunks'])for s in data['sentences']]
assert spoken(approved)==spoken(d)
keys=['高亮按实际开口','高亮开口门槛','非人声区间','词尾除阻','除阻加强','停顿插入点','停顿删除区间','结尾句','合成标点','分段增益dB','分段包络dB']
candidate_controls={k:approved.get(k)for k in keys};old_controls={k:d.get(k)for k in keys}
restore=copy.deepcopy(candidate_controls);restore['停顿插入点']['S15']['2'][0]=3.580083;assert restore==old_controls
with tempfile.TemporaryDirectory(prefix='private62-native-profile-',dir='/dev/shm')as td:
 td=Path(td);cache=td/'cache';cache.mkdir()
 old,oldparts=r.build(d,cache);oldwav=td/'old.wav';sf.write(oldwav,old,24000);assert sha(oldwav.read_bytes())==bind['reconstructed_pcm_sha256'];old16=sf.read(oldwav,dtype='int16')[0]
 new,newparts=r.build(approved,cache);newwav=td/'62.wav';sf.write(newwav,new,24000);assert sha(newwav.read_bytes())==proof['candidate_identity']['WAV_sha256'];new16=sf.read(newwav,dtype='int16')[0]
 crops=[]
 for row in oldparts:
  if row['sentence']=='S15':continue
  start=round(row['start_s']*24000);end=start+row['sample_count'];assert np.array_equal(old16[start:end],new16[start:end])
  crops.append({'sentence':row['sentence'],'sample_span_24k':[start,end],'PCM16_sample_bytes_sha256':sha(old16[start:end].tobytes()),'start_s':row['start_s'],'end_s':row['end_s']})
 support=proof['PCM_preservation']['changed_float_sample_span'];outside=[]
 for name,start,end in [('prefix',0,support[0]),('suffix',support[1],len(old16))]:
  assert np.array_equal(old16[start:end],new16[start:end]);outside.append({'name':name,'sample_span_24k':[start,end],'PCM16_sample_bytes_sha256':sha(old16[start:end].tobytes())})
 vowel=[round(113.845*24000),round(113.870*24000)];assert np.array_equal(old16[slice(*vowel)],new16[slice(*vowel)])
 sc,txt,w,tm,agn=build_one(approved,cache)
 start=next(x for x in newparts if x['sentence']=='S15')['start_s'];groups=[{'段':i+1,'增益':agn.get(i+1,agn.get(str(i+1),0.0)),'停顿':.4 if i<len(tm)-1 else None,'时刻':[start+float(row[2]),start+float(row[3])]}for i,row in enumerate(tm)]
 controls_sha=canon(candidate_controls);core={k:v for k,v in approved.items()if k not in ('核对确认','区间声音指纹')}
 profile={'article':'62','enabled':True,'state':'approved-exact-one-96-sample-pause-insertion-boundary-move','source_authorization_ids':['049','051','052'],'fingerprints':{'request_source_sha256':sha(source_path.read_bytes()),'request_generator_sha256':sha(gen.read_bytes()),'accepted_video_sha256':sha(mp.read_bytes()),'accepted_AAC_ADTS_sha256':bind['reconstructed_AAC_sha256'],'actual_raw_WAV_sha256':proof['candidate_identity']['WAV_sha256'],'canonical_AAC_ADTS_sha256':proof['candidate_identity']['AAC_ADTS_sha256']},'old_baseline_source_absolute_path':bind['source_file'],'old_baseline_source_sha256':bind['source_sha256'],'old_baseline_WAV_sha256':bind['reconstructed_pcm_sha256'],'approved_nonreview_document_sha256':canon(core),'review_only_top_level_keys':['核对确认','区间声音指纹'],'approved_audio_controls':candidate_controls,'original_audio_controls':old_controls,'spoken_title_and_sentences_sha256':canon(spoken(approved)),'source_control_leaf':{'path':['停顿插入点','S15','2',0],'old_JSON_numeric_literal':3.580083,'new_JSON_numeric_literal':3.584083,'old_sample_round_24k':85922,'new_sample_round_24k':86018,'move_samples':96,'samples_deleted':0,'pause_samples':9600,'original_A42_fades_ms':8},'raw_WAV_shape':{'rate':24000,'channels':1,'width':2,'samples':len(new16)},'unchanged_title_and_other_18_sentences':crops,'raw_outside_changed_support':outside,'raw_changed_float_support_samples':support,'raw_four_vowel':{'sample_span_24k':vowel,'PCM16_sample_bytes_sha256':sha(old16[slice(*vowel)].tobytes())},'approved_S15_producer_group_metadata':groups,'group_time_tolerance_s':1/24000+.00001,'actual_old_public_pause_boundaries_s':[113.45008333333334,113.85008333333333],'approved_new_public_pause_boundaries_s':[113.45408333333334,113.85408333333333],'AAC_packet_count':7488,'changed_AAC_packet_indices_0_based':proof['codec_preservation']['changed_packet_indices_0_based'],'public_decoded_change_support_s':proof['codec_preservation']['public_decoded_change_support_s'],'public_decoded_samples_total':proof['codec_preservation']['public_decoded_samples_total'],'F0_control_public_span_s':[113.9,115.05],'original_tool_sha256':{'make_video.py':bind['original_maker_sha256'],'clean.py':'86b3872cbca83437e24da2c7ada5fffd916f06cacdd2b32fee2a78c9b134178d','响度一致性核对.py':'2bb89e427ec014a7fc1b4cc46ea6a11f91a786930f91e8cec720e0307940b85b','音频体检.py':'708a28bb13a270e250e2ba1354cd3856beac29f183e84e6f5bf469fe0ccb8757','音频体检基准.json':'5624187514c9ad391f155a315d771de4770ad64027a9ab05e416bedadcb2c7d1'},'numeric_utilities_sha256':'3a2bd846386b16bd74e9785c548e97283131efcad9989b9e886f64e86e57c7c6','original_thresholds':{'whole_track_delta_LU':.8,'pitch_median_cents':40,'pitch_p90_cents':150},'candidate_private_numeric_evidence_sha256':sha((OUT/'private-full-candidate-original-QC.json').read_bytes()),'diagnostic_subjective_or_ASR_pass_not_claimed':True,'private_mother_PCM_cache_GT_not_exported':True,'temporary_original_algorithm_derived_level_rows':list(ns['derived'])}
 profile['source_authorization_records']=[{'id':n,'file':'USER-REVIEW-2026-11-14-'+n+'.json','sha256':sha(Path('/workspace/work/first50-review-release/USER-REVIEW-2026-11-14-'+n+'.json').read_bytes())}for n in ['049','051','052']]
 (DEST/'audio62-controlled-qc-reference.json').write_text(json.dumps(profile,ensure_ascii=False,indent=2)+'\n');print('reference',sha((DEST/'audio62-controlled-qc-reference.json').read_bytes()));print('derived',json.dumps(ns['derived'],ensure_ascii=False));print('S15groups',json.dumps(groups,ensure_ascii=False))
