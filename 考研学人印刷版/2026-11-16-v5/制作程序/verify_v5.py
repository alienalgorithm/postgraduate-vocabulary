import json, re, glob, sys, io, numpy as np, pymupdf, importlib.util
from PIL import Image
S='/tmp/claude-0/-home-user/3d87cc6c-41dd-58c2-802f-d51dc0c78527/scratchpad'; R='/home/user/postgraduate-vocabulary'
pdf=sys.argv[1]; doc=pymupdf.open(pdf); res={}
spec=importlib.util.spec_from_file_location('b',S+'/v5/build_v5.py'); B=importlib.util.module_from_spec(spec); spec.loader.exec_module(B)
import os; res['bytes']=os.path.getsize(pdf); res['pages']=len(doc)
fonts={f[3] for p in doc for f in p.get_fonts()}; res['fonts']=sorted(fonts); res['bold_font']=[f for f in fonts if re.search('Bold|Black|Heavy|Semibold|Medium',f)]
imgs={}; 
for p in doc:
    for im in p.get_images(full=True): imgs[im[0]]=(im[2],im[3],doc.xref_get_key(im[0],'Filter')[1])
res['images']=len(imgs); res['image_filters']=sorted({v[2] for v in imgs.values()})
alltext=''.join(p.get_text() for p in doc); res['continued_headings']=alltext.count('（续）')
toc=doc.get_toc(); ch=[(t,pg) for l,t,pg in toc if l==1 and t[:2].isdigit()]
order={x['video_order']:x['source_id'] for x in json.load(open(R+'/视频修订定稿/最终定稿/视频顺序.json'))['video_order']}
reg={a['source_id']:a for a in json.load(open(R+'/视频修订定稿/latest_requests.json'))['articles']}
data={json.load(open(f))['id']:json.load(open(f)) for f in glob.glob(S+'/v5/data/*.json')}
title_bad=[(n,t) for t,_ in ch for n in [t[:2]] if t[4:]!=reg[order[n]]['title_zh']]
res['chapters_in_outline']=len(ch); res['title_or_order_mismatch']=title_bad
# per-chapter text and image checks
norm=lambda s: re.sub(r'\s+','',s)
vids={re.search(r'v(\d+)-',f).group(1):np.asarray(Image.open(f).convert('L').resize((240,135),Image.Resampling.BOX),float) for f in glob.glob(S+'/book/video_ill/v*-s*.png')}
def score(im,v):
    a=np.asarray(im.convert('L').resize((240,160),Image.Resampling.BOX),float); best=min(np.abs(a[y:y+135]-v).mean() for y in range(26))
    f=np.asarray(im.convert('L').resize((202,135),Image.Resampling.BOX),float); return min(best,min(np.abs(f-v[:,x:x+202]).mean() for x in range(14,24)))
missing_text=[]; img_bad=[]; vocab_bad=[]; dup=[]; vocab_total=0
for i,(t,pg) in enumerate(ch):
    n=t[:2]; end=(ch[i+1][1]-1) if i+1<len(ch) else len(doc)-1; d=data[n]
    txt=norm(''.join(doc[k].get_text() for k in range(pg-1,end)))
    for para in d['english_paragraphs']+d['chinese_paragraphs']:
        if norm(para) not in txt: missing_text.append((n,para[:40]))
    x=[im for im in doc[pg-1].get_images(full=True) if (im[2],im[3])!=(1040,1477)][0][0]; pix=pymupdf.Pixmap(doc,x); im=Image.frombytes('RGB',(pix.width,pix.height),pix.samples)   # first image that is not the parchment background
    sc={k:score(im,v) for k,v in vids.items()}; best=min(sc,key=sc.get)
    if best!=n or sc[n]>12: img_bad.append((n,best,round(sc[n],1)))
    src=json.load(open(R+'/'+json.load(open(S+'/book/final_sources.json'))[d['source_id']])) if d['source_id'] in json.load(open(S+'/book/final_sources.json')) else None
    raw=''.join(c['zh'] for s in src['sentences'] for c in s['chunks']) if src else ''.join(d['chinese_markup_paragraphs'])
    keys=set()
    for _,items in B.vocab_by_paragraph(d):
        for en,zh in items:
            vocab_total+=1
            k=en.lower()
            if k in keys: dup.append((n,en))
            keys.add(k)
            for piece in zh.split('……'):
                if not re.search(r'\*\*'+re.escape(piece)+r'\*\*\('+re.escape(en if en in raw else en[0].upper()+en[1:])+r'\)',raw): vocab_bad.append((n,en,zh))
res.update(paragraphs_missing=missing_text[:10],n_paragraphs_missing=len(missing_text),image_not_matching_its_video=img_bad,vocab_entries=vocab_total,vocab_pairs_not_in_video_script=vocab_bad[:10],n_vocab_bad=len(vocab_bad),vocab_repeated_within_article=dup[:10])
print(json.dumps(res,ensure_ascii=False,indent=1))
