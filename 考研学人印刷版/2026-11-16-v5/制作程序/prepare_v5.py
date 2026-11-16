import json, sys, traceback
from pathlib import Path
S='/tmp/claude-0/-home-user/3d87cc6c-41dd-58c2-802f-d51dc0c78527/scratchpad'; R='/home/user/postgraduate-vocabulary'
sys.path.insert(0,S+'/tools'); import prepare_v5_lib as L
fs=json.load(open(S+'/book/final_sources.json')); md=json.load(open(S+'/book/final_mds.json'))
b2v={x['source_id']:x['book_no'] for x in json.load(open(S+'/book/book_to_video.json'))}; b2v.setdefault('60','36')
extra={'56':('视频修订定稿/2026-11-14-已验收1篇-run43533004625-原56/V3逐项核验/final-source','current final video source'),
       '23':('视频修订定稿/2026-11-14-已验收1篇-native-inline-run43543967031-原23/V3逐项核验/final-source','PREVIOUS accepted source; new native 43755903301 text not in repo'),
       '24':('/tmp/claude-0/-home-user/3d87cc6c-41dd-58c2-802f-d51dc0c78527/scratchpad/src4953new','2026-11-16 final video source (commit d0f7d583: 视频/脚本/24.json, 新版定稿/24-*.md)'),
       '68':('/tmp/claude-0/-home-user/3d87cc6c-41dd-58c2-802f-d51dc0c78527/scratchpad/src4953new','2026-11-16 final video source (commit d0f7d583: 视频/脚本/68.json, 新版定稿/68-*.md)')}
order=json.load(open(R+'/视频修订定稿/最终定稿/视频顺序.json'))['video_order']
L.INPUTS={}; status={}
for row in order:
    sid=row['source_id']; img=f"{S}/book/img/book{b2v[sid]}.png"
    if sid in fs: L.INPUTS[sid]={'json':Path(R)/fs[sid],'md':Path(R)/md[sid],'image':img}; status[sid]='final video source (hash-bound)'
    else:
        root,why=extra[sid]; L.INPUTS[sid]={'json':Path(R)/root/f'视频/脚本/{sid}.json','md':next((Path(R)/root/'新版定稿').glob(f'{sid}-*.md')),'image':img}; status[sid]=why
C=L.checker(); out=Path(S+'/v5/data'); out.mkdir(parents=True,exist_ok=True); errs={}
for row in order:
    sid=row['source_id']; vno=int(row['video_order'])
    try:
        d=L.convert(sid,vno,C); d['text_basis']=status[sid]; d['book_order_v4']=b2v[sid]
        (out/f'{vno:02d}.json').write_text(json.dumps(d,ensure_ascii=False,indent=1))
    except Exception as e: errs[f'{vno:02d}/src{sid}']=repr(e)[:300]
print('converted',70-len(errs),'errors',len(errs))
for k,v in errs.items(): print(' ',k,v)
