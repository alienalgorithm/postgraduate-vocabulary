"""Real private original-cache candidate positive and local mutation negative tests."""
from pathlib import Path
import json,copy,tempfile,hashlib,importlib.util,types,sys
import numpy as np,soundfile as sf
OUT=Path('/workspace/work/dolly62-audio-user-review-20261114')
defs=OUT/'private_full_candidate_original_qc.py'
exec(compile(defs.read_text().split('\nreport={')[0],str(defs)+'#definitions-only','exec'))
H=Path('/workspace/work/video-audit70-20261113/article62-user-review-20261114/native-audio-helper')
spec=importlib.util.spec_from_file_location('native62helper_under_test',H/'audio62-controlled-qc.py');helper=importlib.util.module_from_spec(spec);spec.loader.exec_module(helper)
request=Path('/workspace/work/video-audit70-20261113/payload');source=json.loads((request/'视频/脚本/62.json').read_text());profile=json.loads((H/'audio62-controlled-qc-reference.json').read_text())
tests=[]
with tempfile.TemporaryDirectory(prefix='private62-helper-actual-tests-',dir='/dev/shm')as td:
 td=Path(td);cache=td/'cache';cache.mkdir();work=td/'work';(work/'scripts').mkdir(parents=True);(work/'work_62').mkdir();actual_source=work/'scripts/62.json';actual_source.write_bytes((request/'视频/脚本/62.json').read_bytes())
 wave,parts=r.build(source,cache);wav=work/'work_62/a.wav';sf.write(wav,wave,24000);assert sha(wav.read_bytes())==profile['fingerprints']['actual_raw_WAV_sha256']
 encoded=td/'candidate.m4a';run([r.FF,'-y','-v','error','-nostdin','-i',str(wav),'-af',r.AF,'-c:a','aac','-b:a','256k','-movflags','+faststart',str(encoded)]);assert sha(adts(encoded))==profile['fingerprints']['canonical_AAC_ADTS_sha256']
 (work/'work_62/分段.json').write_text(json.dumps({'S15':profile['approved_S15_producer_group_metadata']},ensure_ascii=False))
 args=types.SimpleNamespace(article='62',reference=str(H/'audio62-controlled-qc-reference.json'),numeric_utilities='/workspace/work/video-revision-batch-ci/.github/video-revision-batch/audio-qc.py',accepted_source=str(mp),canonical_video=str(encoded),work=str(work),request=str(request),actual_source=str(actual_source),raw_pcm=str(wav),tools='/workspace/work/audit-repo/视频/工具',official_status=None,diagnostic=True,output=str(OUT/'native62-helper-actual-positive.json'))
 status=helper.audit(args);positive=json.loads(Path(args.output).read_text());tests.append({'case':'actual-final-PAY-original-cache-WAV-and-AAC-positive','exit':status,'passed':positive['passed'],'failing_checks':[r['name']for r in positive['checks']if not r['passed']],'error':positive.get('error')});assert status==0,tests[-1]
 wrong=copy.deepcopy(source);wrong['停顿插入点']['S15']['2'][0]=3.587667;actual_source.write_text(json.dumps(wrong,ensure_ascii=False));args.output=str(OUT/'native62-helper-wrong-control-negative.json');status=helper.audit(args);negative=json.loads(Path(args.output).read_text());tests.append({'case':'actual-local-wrong-cut3_587667-source-negative','exit':status,'rejected':not negative['passed'],'failing_checks':[r['name']for r in negative['checks']if not r['passed']]});assert status!=0
 actual_source.write_bytes((request/'视频/脚本/62.json').read_bytes());data=sf.read(wav,dtype='int16')[0];data[round(113.84*24000)]=32767;wrongwav=td/'wrong-clipped-raw.wav';sf.write(wrongwav,data,24000,subtype='PCM_16');args.raw_pcm=str(wrongwav);args.output=str(OUT/'native62-helper-wrong-raw-negative.json');status=helper.audit(args);negative=json.loads(Path(args.output).read_text());tests.append({'case':'actual-local-raw-clipping-and-SHA-negative','exit':status,'rejected':not negative['passed'],'failing_checks':[r['name']for r in negative['checks']if not r['passed']]});assert status!=0
 numeric=positive['checks'][-1];assert numeric['actual_local_clipping_mutation_rejected']
 tests.append({'case':'actual-decoded-local-digital-clipping-numeric-negative','mutation_sample_s':113.86,'mutation_value':1.0,'rejected':numeric['actual_local_clipping_mutation_rejected']})
report={'kind':'source62-real-private-native-helper-positive-and-local-negative-validation','program_sha256':sha((H/'audio62-controlled-qc.py').read_bytes()),'profile_sha256':sha((H/'audio62-controlled-qc-reference.json').read_bytes()),'actual_final_source_sha256':sha((request/'视频/脚本/62.json').read_bytes()),'tests':tests,'native_ASR_or_4K_production_not_claimed':True,'all_pcm_and_original_cache_in_dev_shm_deleted':True,'formal_sources_or_shared_helpers_modified':False}
(OUT/'native62-helper-real-validation-summary.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n');print(json.dumps(report,ensure_ascii=False))
