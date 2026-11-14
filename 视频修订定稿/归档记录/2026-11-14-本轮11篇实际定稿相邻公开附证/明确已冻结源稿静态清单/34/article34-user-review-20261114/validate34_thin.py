"""Original GEN/text checks in a production-tools + canonical-data thin mirror."""
from pathlib import Path
import hashlib,importlib.util,json,os,shutil,sys
H=Path(__file__).parent;B=H.parent;BASE=B/'preflight-frozen66-v2-part1/mirror';C=H/'candidate-payload';V=H/'thin-validation';M=V/'mirror';W=M/'_text-work'
sha=lambda p:hashlib.sha256(Path(p).read_bytes()).hexdigest()
s=importlib.util.spec_from_file_location('original_data_preflight',B/'generator_text_preflight.py');P=importlib.util.module_from_spec(s);s.loader.exec_module(P)
if not M.exists():
 (M/'视频').mkdir(parents=True);shutil.copytree(BASE/'视频/工具',M/'视频/工具',copy_function=__import__('os').link,ignore=shutil.ignore_patterns('__pycache__','*.pyc'));shutil.copytree(BASE/'新版定稿',M/'新版定稿')
 (M/'视频/制作记录').mkdir()
 for root in [BASE,B/'payload']:
  for p in (root/'视频/制作记录').glob('*'):
   if p.is_file()and p.suffix in('.md','.json')and(p.name.startswith('34')or p.name=='重点词被去掉.json'):shutil.copyfile(p,M/'视频/制作记录'/p.name)
  for p in (root/'视频').glob('*.md'):shutil.copyfile(p,M/'视频'/p.name)
  for p in (root/'新版定稿').glob('*.md'):shutil.copyfile(p,M/'新版定稿'/p.name)
 W.mkdir();(W/'scripts').mkdir()
 for p in (B/'payload/视频/脚本').glob('[0-9][0-9].json'):shutil.copyfile(p,W/'scripts'/p.name)
 (W/'fonts').symlink_to(M/'视频/工具/fonts',target_is_directory=True)
 resource=M/'视频/资源/字体';resource.parent.mkdir(parents=True);resource.symlink_to(M/'视频/工具/fonts',target_is_directory=True)
(M/'视频/脚本').mkdir(exist_ok=True)
for p in (B/'payload/视频/脚本').glob('[0-9][0-9].json'):shutil.copyfile(p,M/'视频/脚本'/p.name)
for root in [BASE,B/'payload']:
 for p in (root/'视频/制作记录').glob('*'):
  if p.is_file()and p.suffix in('.md','.json'):shutil.copyfile(p,M/'视频/制作记录'/p.name)
for rel in ['视频/脚本/34.json','视频/工具/初稿生成/gen34.py','新版定稿/34-the-game-that-escaped-the-soviet-union.md','视频/工具/用户同意记录.json']:
 (M/rel).unlink(missing_ok=True);shutil.copyfile(C/rel,M/rel)
shutil.copyfile(C/'视频/制作记录/34_待改清单.md',M/'视频/制作记录/34_待改清单.md')
record_src=B/'payload/视频/制作记录/逐句确认/34.json'
if not record_src.exists():record_src=BASE/'视频/制作记录/逐句确认/34.json'
record_dest=M/'视频/制作记录/逐句确认/34.json';record_dest.parent.mkdir(exist_ok=True);shutil.copyfile(record_src,record_dest)
snapshot=H/'actual-old-native-last-sent34.json';assert sha(snapshot)=='b6ff63c80d80149615227a3a09b1ee644ab00689b658ed0078490f4a16d8e99e';snapdest=M/'视频/脚本/已发版本/34.json';snapdest.parent.mkdir(parents=True,exist_ok=True);shutil.copyfile(snapshot,snapdest)
logs=V/'logs-v3';logs.mkdir(exist_ok=True);core={p:sha(M/p)for p in P.CORE_FILES};expected=json.loads((C/'视频/脚本/34.json').read_text());source_sha=sha(C/'视频/脚本/34.json');workjson=W/'scripts/34.json';workjson.unlink(missing_ok=True)
env={**os.environ,'XG_P':str(M),'XG_TOOLS':str(M/'视频/工具'),'XG_WORK':str(W),'PYTHONDONTWRITEBYTECODE':'1','VIDEO_S':'1'};env['PATH']=str(Path(sys.executable).parent)+os.pathsep+env.get('PATH','')
for k in ['YAOWENBEN','AUDIO_ONLY','OLD_IV_VOID']:env.pop(k,None)
code,text=P.execute([sys.executable,M/'视频/工具/初稿生成/gen34.py'],W,env,logs/'34-original-GEN.log');got=json.loads(workjson.read_text());delta=P.differences(expected,got);assert code==0 and not delta
reasons={
'S5':'T1没加信息：原句和既有用户说明都围绕苏联时期单位职务发明由国家占有产权，正文、说明和事实完整。T3词性：salaried形容词工资的；designer和proprietor名词设计者和所有者；intellectual property名词短语知识产权；entitlement名词权利。T6不生硬：国家而非领薪设计者为所有者的对照清楚。T7通顺：国家拥有产权、作者没有相应权利的原三块整句连续通读。T8看得懂：原用户关于领薪工作、单位电脑、职务发明及个人无权占有的说明完整，句读清楚。T21贴合语境：intellectual property指这份游戏的知识产权，proprietor指拥有该产权者，内容对应原英文state对照设计者的叙述。',
'S9':'T1没加信息：只按用户041把原因为由改为由于，保留西方公司之间重叠交易及上下文版权转卖的全部事实。T3词性：shuffled过去分词、onward副词、chaotic形容词、muddle名词、overlapping现在分词作定语、magnate名词。T6不生硬：用户指定由于替代原因为由，原其余中文完整连接到这种情况。T7通顺：原三块版权在混乱中倒手、西方公司交易重叠、其中一家公司归马克斯韦尔所有都连贯。T8看得懂：原shuffle和onward、among Western firms及one owned by原说明完整。T21贴合语境：overlapping指各公司权利互相重叠造成版权混乱，本次仅修用户指定开头两个字，其余释义语序与重点均一致。',
'S17':'T1没加信息：作者后来参与决定谁能出售游戏，原正文数字及原五点简述逐字核对既有批准内容。T3词性：puzzle名词益智游戏；whose引导定语从句、who引导decide宾语从句。T6不生硬：无偿流布、后来参与管理版权的原收束语自然。T7通顺：原由早期免费流传到作者参与决定售卖权的转变衔接全文。T8看得懂：原whose、for nothing、who could sell it说明完整，结语与独立简述实际核图。T21贴合语境：puzzle特指俄罗斯方块游戏，收束作者版权命运的变化。T33简述讲全：诞生说明1984年文字电脑字符方块；归属说明国家掌版权、复制品经软盘流传；混乱交代斯坦因未得正式权利便转卖以及层层转售；突破交代1989年罗杰斯谈判和任天堂掌机主机权及3500万份；转变说明约1995年收益和1996年成立公司管理版权。'}
reviews=[]
for sid,why in reasons.items():
 review_code,review_text=P.execute([sys.executable,M/'视频/工具/逐句确认.py','34',sid,why],W,env,logs/f'34-original-{sid}-text-review.log');assert review_code==0;reviews.append({'sentence':sid,'exit':review_code})
record_out=C/'视频/制作记录/逐句确认/34.json';record_out.parent.mkdir(parents=True,exist_ok=True);shutil.copyfile(record_dest,record_out)
raw,rawtext=P.execute([sys.executable,M/'视频/工具/踩坑核查.py','34','出片'],W,env,logs/'34-original-text-before-repair.log');rc,rt=P.execute([sys.executable,M/'视频/工具/新管/修.py','34'],W,env,logs/'34-original-repair.log');actual=json.loads(workjson.read_text());shutil.copyfile(workjson,V/'34-original-auto-repaired.json');
for sid in ['S5','S17']:
 post_review_code,post_review_text=P.execute([sys.executable,M/'视频/工具/逐句确认.py','34',sid,reasons[sid]],W,env,logs/f'34-original-{sid}-after-existing-mechanical-normalization-review.log');assert post_review_code==0
shutil.copyfile(record_dest,record_out);last,lasttext=P.execute([sys.executable,M/'视频/工具/踩坑核查.py','34','出片'],W,env,logs/'34-original-text-after-repair.log')
r={'article':'34','kind':'actual-original-GEN-full-JSON-and-text-thin-mirror','thin_snapshot_scope':'Exact original production tools, all70 canonical MD/JSON and root-level production records required by unchanged selftests; only34 nested sentence review record. No archived proof trees copied.','source_sha256':source_sha,'GEN_sha256':sha(C/'视频/工具/初稿生成/gen34.py'),'MD_sha256':sha(C/'新版定稿/34-the-game-that-escaped-the-soviet-union.md'),'original_generator_exit':code,'whole_JSON_roundtrip_exact':not delta,'JSON_differences':delta,'original_text_before_repair_exit':raw,'original_repair_exit':rc,'original_text_after_repair_exit':last,'original_text_hard_errors':[x for x in lasttext.splitlines()if x.strip().startswith('✘')],'original_text_pending_confirmations':[x for x in lasttext.splitlines()if x.strip().startswith('？')],'original_mechanical_repair_differences':P.differences(expected,actual),'original_sentence_text_reviews':reviews,'sentence_review_before_sha256':sha(record_src),'sentence_review_after_sha256':sha(record_out),'only_requested_sentence_review_records_updated':all(json.loads(record_src.read_text()).get(k)==v for k,v in json.loads(record_out.read_text()).items()if k not in('S5','S9','S17')),'core_before_sha256':core,'core_after_sha256':{p:sha(M/p)for p in P.CORE_FILES},'actual_original_last_sent_snapshot':{'path':str(snapshot),'sha256':sha(snapshot),'exact_original_L13_lookup':str(snapdest),'missing_snapshot_skip_not_used':True},'source_input_unchanged':sha(C/'视频/脚本/34.json')==source_sha,'no_audio_video_or_dispatch':True}
r['passed']=code==raw==rc==last==0 and not delta and r['core_before_sha256']==r['core_after_sha256']and r['source_input_unchanged'];(V/'report.json').write_text(json.dumps(r,ensure_ascii=False,indent=2)+'\n');print(json.dumps({'passed':r['passed'],'GEN_exact':not delta,'text_before':raw,'text_after':last,'report_sha256':sha(V/'report.json')},ensure_ascii=False));sys.exit(0 if r['passed']else 1)
