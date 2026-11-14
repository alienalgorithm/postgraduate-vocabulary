"""Three user focus edits and the sole root-approved four-ms cut shift."""
import copy,datetime,hashlib,importlib.util,json,re,shutil
from pathlib import Path
B=Path('/workspace/work/video-audit70-20261113');PAY=B/'payload';H=Path(__file__).parent;C=H/'candidate-payload';OLD=H/'before';D=Path('/workspace/work/video-revision-delivery/next-passed-validated/43543967031/62/final-source');MD='新版定稿/62-dolly-the-copied-sheep.md'
sha=lambda p:hashlib.sha256(Path(p).read_bytes()).hexdigest()
s=importlib.util.spec_from_file_location('original_pure_data',B/'generator_text_preflight.py');P=importlib.util.module_from_spec(s);s.loader.exec_module(P)
states={}
for rel in ['视频/脚本/62.json','视频/工具/初稿生成/gen62.py',MD,'视频/制作记录/62_待改清单.md','视频/制作记录/逐句确认/62.json','视频/工具/用户同意记录.json']:
 p=PAY/rel;states[rel]={'exists':p.exists(),'sha256':sha(p)if p.exists()else None}
 if p.exists():
  q=OLD/'current-PAY'/rel;q.parent.mkdir(parents=True,exist_ok=True)
  if not q.exists():shutil.copyfile(p,q)
  q=C/rel;q.parent.mkdir(parents=True,exist_ok=True);shutil.copyfile(p,q)
for rel in ['视频/脚本/62.json',MD]:
 p=D/rel
 for base in [OLD,C]:
  q=base/rel;q.parent.mkdir(parents=True,exist_ok=True);shutil.copyfile(p,q)
assert sha(OLD/'视频/脚本/62.json')=='8147198c65aa6f66839b2a7050dbe13c5e4209725ddff01bcb636859340ba084'
assert sha(OLD/MD)=='e9c838ba99403703c71b8360d6b070f861d480397f70ce2caf1377ae2be6d840'
assert sha(H/'actual-old-native-last-sent62.json')=='d353d680303e20089dd79d03e4a1ccf43b238bab75714c320b14cbdc6ff815e5'
genbase=B/'gen-sources/gen62.py';states['gen-sources/gen62.py']={'exists':genbase.exists(),'sha256':sha(genbase)if genbase.exists()else None}
if genbase.exists()and not(OLD/'gen-sources-gen62.py').exists():shutil.copyfile(genbase,OLD/'gen-sources-gen62.py')
(OLD/'baseline-states.json').write_text(json.dumps(states,ensure_ascii=False,indent=2)+'\n')
old=json.loads((OLD/'视频/脚本/62.json').read_text());new=copy.deepcopy(old)
c=new['sentences'][5]['chunks'][2];assert c['align'][1]==['embryo-derived **duo**, Megan and Morag, in 1995.','于1995年由胚胎衍生的**一对**(duo)绵羊：梅根和莫拉格。'];c['align'][1]=['embryo-**derived** **duo**, Megan and Morag, in 1995.','于1995年由胚胎**衍生的**(derived)**一对**(duo)绵羊：梅根和莫拉格。']
c=new['sentences'][9]['chunks'][0];assert c['align'][4]==['funding','资金'];c['align'][4]=['**funding**','**提供资金**(funding)']
c=new['sentences'][14]['chunks'][1];assert c['align'][0]==['were ageing normally,','正在正常衰老，'];c['align'][0]=['were **ageing** normally,','正在正常**衰老**(ageing)，']
for si,ci in [(5,2),(9,0),(14,1)]:
 c=new['sentences'][si]['chunks'][ci];c['en']=' '.join(a for a,b in c['align']if a!='\n');c['zh']=''.join(b for a,b in c['align'])
assert new['停顿插入点']['S15']['2'][0]==3.580083;new['停顿插入点']['S15']['2'][0]=3.584083
new['allow_clash']=list(dict.fromkeys(new.get('allow_clash',[])+['derived','funding','ageing']))
bare=lambda x:re.sub(r'\([^()]*\)','',x.replace('**',''))
for si,(u,v)in enumerate(zip(old['sentences'],new['sentences']),1):
 assert u['para']==v['para']and len(u['chunks'])==len(v['chunks'])
 for ci,(a,b)in enumerate(zip(u['chunks'],v['chunks']),1):
  assert a['en'].replace('**','')==b['en'].replace('**','')
  assert a.get('note')==b.get('note')
  expected=bare(a['zh'])
  if(si,ci)==(10,1):expected=expected.replace('联邦资金用于','联邦提供资金用于')
  assert expected==bare(b['zh']),(si,ci)
assert old['sentences'][11]==new['sentences'][11]and old['sentences'][-1]==new['sentences'][-1]
control=copy.deepcopy(new);control['停顿插入点']['S15']['2'][0]=3.580083
for k in old:
 if k not in('sentences','allow_clash'):assert old[k]==control[k],k
p=C/'视频/脚本/62.json';p.write_text(json.dumps(new,ensure_ascii=False,indent=2)+'\n');gen,issues=P.pure_generator(new);assert not issues,issues;(C/'视频/工具/初稿生成/gen62.py').write_text(gen)
md=(OLD/MD).read_text()
for a,b in [('Roslin\'s embryo-derived **duo**',"Roslin's embryo-**derived** **duo**"),('**prohibited** federal funding for such experiments.','**prohibited** federal **funding** for such experiments.'),('were ageing normally,','were **ageing** normally,'),('于1995年由胚胎衍生的**一对**(duo)','于1995年由胚胎**衍生的**(derived)**一对**(duo)'),('联邦资金用于这类实验。','联邦**提供资金**(funding)用于这类实验。'),('正在正常衰老，没有','正在正常**衰老**(ageing)，没有')]:
 assert md.count(a)==1,(a,md.count(a));md=md.replace(a,b)
tables=[('derived','duo','| derived | 本文：衍生的；adj. 衍生的；derive v. 源自，衍生（embryo-derived；derive from） | 2 |'),('funding','chromosome','| funding | 本文：提供资金（资助、资金支持）；n. 资助，资金支持（federal funding）；fund v. 提供资金 | 3 |'),('ageing','hypertension','| ageing | 本文：衰老；v. (age) 变老，衰老（ageing normally；英式拼写 ageing） | 4 |')]
for term,after,line in tables:
 assert not re.search(r'^\|\s*'+re.escape(term)+r'\s*\|',md,re.M)
 md=md.replace('| '+after+' |',line+'\n| '+after+' |',1)
 assert len(re.findall(r'^\|\s*'+re.escape(term)+r'\s*\|',md,re.M))==1
(C/MD).write_text(md)
pending=(C/'视频/制作记录/62_待改清单.md').read_text();pending+='\n\n## 2026-11-14 用户审核后定稿\n\n- S6C3 embryo-derived只标derived，中文衍生的；S10 funding标提供资金，词表注明本句名词资助/资金支持及fund动词义。\n- 仅S15C2 ageing标衰老，保英式拼写及S12原样；三项同步本篇必记速查表，查重后各一条。\n- 用户046要求thirteen clones→four接缝与全篇音频核查，048准予定稿；root049按原母客观测量批准唯一停顿插入点.S15.2[0]3.580083→3.584083，0.4秒停顿与所有其他母声保持。不是用户指定4ms的原话。\n- 正式native仍须原完整音频/ASR门；末句后0.3秒由唯一audio_ci处理，不由文本脚本改变已验音频。\n';(C/'视频/制作记录/62_待改清单.md').write_text(pending)
conclusion=Path('/workspace/work/dolly62-audio-user-review-20261114/FULL-CANDIDATE-AUDIO-REVIEW-CONCLUSION.json');assert sha(conclusion)=='848d0c7ce21dd7f3bdf7f120ea25df294a80f770de25b12298917e54a0cfc78e'
report={'article':'62','book_order':'34','kind':'three-user-focus-and-root-approved-one-leaf-audio-repair-proposal','quality_acceptance':False,'before_actual_source_sha256':sha(OLD/'视频/脚本/62.json'),'before_actual_MD_sha256':sha(OLD/MD),'after_source_sha256':sha(p),'generator_sha256':sha(C/'视频/工具/初稿生成/gen62.py'),'manuscript_sha256':sha(C/MD),'exact_JSON_diff':P.differences(old,new),'all_original_spoken_English_chunk_boundaries_exact':True,'all_original_small_notes_and_five_point_summary_exact':True,'only_bare_Chinese_change_is_S10_funding_zijin_to_tigongzijin':True,'S12_ageing_untouched':True,'voice_control_diff_only_approved_S15_2_sample96_shift':True,'approved_control':{'before':3.580083,'after':3.584083,'old_sample':round(3.580083*24000),'new_sample':round(3.584083*24000),'sample_difference':round(3.584083*24000)-round(3.580083*24000)},'audio_candidate_conclusion_path':str(conclusion),'audio_candidate_conclusion_sha256':sha(conclusion),'genuine_last_sent_snapshot_sha256':sha(H/'actual-old-native-last-sent62.json'),'baseline_states':states,'review_records':[{'path':str(q),'sha256':sha(q)}for n in range(44,50)for q in [Path('/workspace/work/first50-review-release')/f'USER-REVIEW-2026-11-14-{n:03}.json']],'native_or_TTS_or_video_or_PDF_not_executed':True,'created_utc':datetime.datetime.now(datetime.timezone.utc).isoformat()}
(H/'proposal-report.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n');print(json.dumps({k:report[k]for k in ['after_source_sha256','generator_sha256','manuscript_sha256']},ensure_ascii=False))
