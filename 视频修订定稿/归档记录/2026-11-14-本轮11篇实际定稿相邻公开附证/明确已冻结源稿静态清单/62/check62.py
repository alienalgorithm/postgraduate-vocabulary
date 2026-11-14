"""Unchanged official GEN/full text checks in a small independent data mirror."""
from pathlib import Path
import hashlib,importlib.util,json,os,shutil,sys
H=Path(__file__).parent;B=H.parent;BASE=B/'article14-user-review-20261114/gen-text-validation/mirror';M=H/'thin-validation/mirror';W=M/'_text-work62';C=H/'candidate-payload';OUT=H/'gen-text-validation-v7';OUT.mkdir(parents=True,exist_ok=True)
sha=lambda p:hashlib.sha256(Path(p).read_bytes()).hexdigest()
s=importlib.util.spec_from_file_location('original_data_preflight',B/'generator_text_preflight.py');P=importlib.util.module_from_spec(s);s.loader.exec_module(P)
T=M/'视频/工具';T.mkdir(parents=True,exist_ok=True)
for name in ['CLAUDE.md','AGENTS.md','README.md']:
 q=M/name
 if not q.exists():q.symlink_to(BASE/name)
REC=M/'视频/制作记录/逐句确认'
if REC.is_symlink():REC.unlink()
REC.mkdir(parents=True,exist_ok=True)
for p in (BASE/'视频/制作记录').iterdir():
 q=M/'视频/制作记录'/p.name;q.parent.mkdir(parents=True,exist_ok=True)
 if not q.exists():q.symlink_to(p,target_is_directory=p.is_dir())
for name in ['对照文本','工作进度']:
 q=M/'视频'/name
 if not q.exists():q.symlink_to(BASE/'视频'/name,target_is_directory=True)
for p in (BASE/'视频/工具').iterdir():
 q=T/p.name
 if p.name in ('初稿生成','用户同意记录.json'):continue
 if not q.exists():q.symlink_to(p,target_is_directory=p.is_dir())
G=T/'初稿生成';G.mkdir(exist_ok=True)
for p in (BASE/'视频/工具/初稿生成').iterdir():
 if p.name=='gen62.py' or p.name=='__pycache__':continue
 q=G/p.name
 if not q.exists():q.symlink_to(p,target_is_directory=p.is_dir())
context={}
for folder,pattern in [('视频/脚本','[0-9][0-9].json'),('新版定稿','[0-9][0-9]-*.md')]:
 for root in [BASE,B/'payload']:
  for p in (root/folder).glob(pattern):
   q=M/folder/p.name;q.parent.mkdir(parents=True,exist_ok=True);shutil.copyfile(p,q)
 for p in (M/folder).glob(pattern):context[str(p.relative_to(M))]=sha(p)
for p in (BASE/'视频').glob('*.md'):
 q=M/'视频'/p.name;shutil.copyfile(p,q)
for p in (BASE/'视频/制作记录').glob('62*'):
 if not p.is_file()or p.suffix not in('.md','.json'):continue
 q=M/'视频/制作记录'/p.name;q.parent.mkdir(parents=True,exist_ok=True)
 if q.is_symlink():q.unlink()
 shutil.copyfile(p,q)
for rel in ['视频/脚本/已发版本/62.json','视频/制作记录/逐句确认/62.json']:
 p=BASE/rel
 if p.is_file():q=M/rel;q.parent.mkdir(parents=True,exist_ok=True);shutil.copyfile(p,q)
for rel in ['视频/脚本/62.json','视频/工具/初稿生成/gen62.py','新版定稿/62-dolly-the-copied-sheep.md','视频/制作记录/62_待改清单.md','视频/工具/用户同意记录.json']:
 q=M/rel;q.parent.mkdir(parents=True,exist_ok=True);shutil.copyfile(C/rel,q)
W.mkdir(exist_ok=True);(W/'scripts').mkdir(exist_ok=True)
for p in (M/'视频/脚本').glob('[0-9][0-9].json'):shutil.copyfile(p,W/'scripts'/p.name)
if not(W/'fonts').exists():(W/'fonts').symlink_to(T/'fonts',target_is_directory=True)
RF=M/'视频/资源/字体';RF.parent.mkdir(parents=True,exist_ok=True)
if not RF.exists():RF.symlink_to(T/'fonts',target_is_directory=True)
snapshot=M/'视频/脚本/已发版本/62.json';snapshot.parent.mkdir(parents=True,exist_ok=True);shutil.copyfile(H/'actual-old-native-last-sent62.json',snapshot);assert sha(snapshot)=='d353d680303e20089dd79d03e4a1ccf43b238bab75714c320b14cbdc6ff815e5'
core={p:sha(M/p)for p in P.CORE_FILES};candidate=json.loads((C/'视频/脚本/62.json').read_text());before=sha(C/'视频/脚本/62.json');workjson=W/'scripts/62.json';workjson.unlink(missing_ok=True)
env={**os.environ,'XG_P':str(M),'XG_TOOLS':str(T),'XG_WORK':str(W),'PYTHONDONTWRITEBYTECODE':'1','VIDEO_S':'1'};env['PATH']=str(Path(sys.executable).parent)+os.pathsep+env.get('PATH','')
for k in ['YAOWENBEN','AUDIO_ONLY','OLD_IV_VOID']:env.pop(k,None)
code,_=P.execute([sys.executable,G/'gen62.py'],W,env,OUT/'original-GEN.log');got=json.loads(workjson.read_text())if workjson.exists()else{};delta=P.differences(candidate,got)
report={'article':'62','book_order':'34','kind':'actual-original-full-JSON-GEN-and-text-checks','thin_mirror_context_current_file_hashes':context,'current_source_sha256':before,'generator_sha256':sha(C/'视频/工具/初稿生成/gen62.py'),'manuscript_sha256':sha(C/'新版定稿/62-dolly-the-copied-sheep.md'),'original_generator_exit':code,'whole_JSON_roundtrip_exact':not delta and code==0,'JSON_differences':delta,'original_core_before_sha256':core,'native_video_or_audio_or_dispatch_produced':False,'genuine_old_native_last_sent_snapshot_sha256':sha(snapshot),'genuine_L13_comparison_enabled':True}
(OUT/'report.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n')
assert code==0 and not delta
why6='T1没加信息：仅embryo-derived的derived补重点衍生的，全部原note逐字保留。T3词性：derived为过去分词构成形容词修饰duo，duo名词一对，predecessors名词前几代、transplanted过去分词移植保持原注。T6不生硬：中文原句于1995年由胚胎衍生的一对绵羊完整沿用。T7通顺：只标衍生的，年号与名词同位语位置保持原稿。T8看得懂：读者明确此前已有由胚胎细胞培育的一对羊梅根和莫拉格。T21贴合语境：derived在embryo-derived中指来源于胚胎，用户指定衍生的与语境一致。'
why10='T1没加信息：只按用户将资金改为提供资金并标funding，英文原句逐字保留。T3词性：funding在federal funding中为名词，含义资助或资金支持；词表另准确说明fund动词提供资金；prohibited过去式动词禁止保持原注。T6不生硬：按用户中文提供资金理解联邦给予资助的行为。T7通顺：克林顿禁止联邦提供资金用于这类实验，资金支持方向明确。T8看得懂：读者明白禁令针对联邦对该类实验的资助。T21贴合语境：funding属于联邦资助名词，不把它误标为本句动词。'
why15='T1没加信息：只在本句ageing补重点衰老；原four插入语小字与全部文字保持。T3词性：ageing为age现在分词，谓语were ageing表示正在衰老；hypertension和diabetes名词高血压和糖尿病沿用。T6不生硬：中文沿用正在正常衰老，正常前置适合汉语。T7通顺：2016年13只克隆羊正常衰老，没有高血压或糖尿病，插入语四只来源清楚。T8看得懂：后续羊群正常衰老对比前文早衰猜测。T21贴合语境：ageing指正常变老过程，保英式spelling；另S12原样沿用。'
why19='T1没加信息：用户052明确接受白脸解释小字，照原文新增，原testify to注释及全部五点简述逐字保留。T3词性：plainly副词清楚地，testifies to动词结构证明，ancestry名词祖源，全部沿用原注。T6不生硬：正文原译与新小字通俗解释母羊代孕和遗传物质来源。T7通顺：新增小字紧随原词汇注释，正文语序与原稿一致。T8看得懂：说明白脸特征来自提供遗传物质的芬兰多塞特羊，而代孕母羊属于另一品种。T21贴合语境：白脸证明祖源，解释与原句Finn Dorset ancestry相符。T33简述讲全：诞生、突破、争议、离世、复核五点逐字保持，277次仅一只存活、成年细胞突破、伦理和早衰争论、疾病和六岁离世、后续正常衰老复核都完整。'
confirmation=[]
for si,why in [(6,why6),(10,why10),(15,why15),(19,why19)]:
 rc,stdout=P.execute([sys.executable,T/'逐句确认.py','62',f'S{si}',why],W,env,OUT/f'original-sentence-confirmation-S{si}.log');assert rc==0
 confirmation.append({'sentence':si,'exit':rc,'conclusion':why})
rec=M/'视频/制作记录/逐句确认/62.json';report['original_sentence_confirmation']={'user_changed_sentences':[6,10,15,19],'records':confirmation,'before_mechanical_wrap_record_sha256':sha(rec)}
raw,rawtext=P.execute([sys.executable,T/'踩坑核查.py','62','出片'],W,env,OUT/'original-text-before-repair.log')
repair,_=P.execute([sys.executable,T/'新管/修.py','62'],W,env,OUT/'original-mechanical-repair.log')
actual=json.loads(workjson.read_text());shutil.copyfile(workjson,OUT/'62-original-auto-repaired.json')
dest=C/'视频/制作记录/逐句确认/62.json';dest.parent.mkdir(parents=True,exist_ok=True);shutil.copyfile(rec,dest);report['original_sentence_confirmation']['after_mechanical_wrap_record_sha256']=sha(rec)
final,finaltext=P.execute([sys.executable,T/'踩坑核查.py','62','出片'],W,env,OUT/'original-text-after-repair.log')
report.update(original_text_before_repair_exit=raw,original_repair_exit=repair,original_text_after_repair_exit=final,original_text_hard_errors=[l for l in finaltext.splitlines()if l.strip().startswith('✘')],original_pending_confirmations=[l for l in finaltext.splitlines()if l.strip().startswith('？')],original_mechanical_repair_differences=P.differences(candidate,actual),original_core_after_sha256={p:sha(M/p)for p in P.CORE_FILES},candidate_source_unchanged=sha(C/'视频/脚本/62.json')==before)
report['passed']=report['whole_JSON_roundtrip_exact']and raw==repair==final==0 and report['original_core_before_sha256']==report['original_core_after_sha256']and report['candidate_source_unchanged']
(OUT/'report.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n');print(json.dumps({'passed':report['passed'],'GEN_exact':report['whole_JSON_roundtrip_exact'],'text_before':raw,'text_after':final,'report_sha256':sha(OUT/'report.json')},ensure_ascii=False));sys.exit(0 if report['passed']else 1)
