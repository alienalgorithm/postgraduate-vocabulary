"""Create the requested numbered edition from the reviewed originals."""
from pathlib import Path
import argparse,copy,csv,hashlib,json,os,re,shutil,sys
import fitz

ROOT=Path(__file__).resolve().parent
BASE=ROOT.parent/'插图阅读小册'
sys.path.insert(0,str(BASE))
import build_all70 as P
from booklet_utils import validate_article

ORDER=[1,22,7,3,12,10,6,51,5,11,39,4,21,55,44,50,20,2,49,42,14,27,13,61,15,17,26,36,28,33,67,47,34,62,53,60,65,19,29,43,52,48,37,31,16,40,54,46,24,70,38,9,68,35,30,69,66,8,63,32,57,23,64,18,56,41,58,25,59,45]
assert len(ORDER)==len(set(ORDER))==70 and sorted(ORDER)==list(range(1,71))
P.ROOT=ROOT
P.DEST=ROOT/'分篇PDF';P.DEST.mkdir(exist_ok=True)
W,H,M,CW=P.W,P.H,P.M,P.CW

def read(p):return json.loads(Path(p).read_text())
def write(p,d):
    p=Path(p);p.parent.mkdir(parents=True,exist_ok=True)
    t=p.with_name(p.name+'.tmp');t.write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n');t.replace(p)
def sha(p):
    h=hashlib.sha256()
    with Path(p).open('rb') as f:
        for b in iter(lambda:f.read(4*1024*1024),b''):h.update(b)
    return h.hexdigest()
def file_part(t):return re.sub(r'\s+',' ',re.sub(r'[<>:"/\\|?*]',' ',t)).strip().rstrip('.')
def filename(n,d,ext):return f'{n} {file_part(d["title_zh"])} {file_part(d["title_en"])}.{ext}'
def link(src,dest):
    dest.parent.mkdir(parents=True,exist_ok=True)
    if dest.exists():
        assert sha(src)==sha(dest),str(dest);return
    try:os.link(src,dest)
    except OSError:shutil.copy2(src,dest)

def prepare():
    assert ORDER==[int(n) for n in read(BASE/'recommended-order.json')['order']]
    original=read(BASE/'manifest.json');meta={x['id']:x for x in original['chapters']}
    source_index=ROOT.parent/'成果归档/视频定稿文件清单.json'
    if source_index.exists():write(ROOT/'来源视频清单.json',read(source_index))
    videos={x['id']:x for x in read(ROOT/'来源视频清单.json')['videos']}
    rows=[]
    for position,old in enumerate(ORDER,1):
        n=f'{position:02}';old=f'{old:02}';d=read(BASE/f'content/articles/{old}.json');validate_article(d)
        q=copy.deepcopy(d);q.update(id=n,source_article_id=old);write(ROOT/f'content/articles/{n}.json',q)
        s=read(BASE/f'sources/{old}.json');s.update(id=n,source_article_id=old);write(ROOT/f'sources/{n}.json',s)
        image=BASE/meta[old]['illustration'];dest=ROOT/f'illustrations/{n}.png'
        if image.exists():link(image,dest)
        assert sha(dest)==meta[old]['illustration_sha256']
        old_video=ROOT.parent/videos[old]['path'];new_video=ROOT/'视频'/filename(n,d,'mp4')
        if old_video.exists():link(old_video,new_video)
        if new_video.exists():assert sha(new_video)==videos[old]['sha256']
        rows.append({'new_id':n,'source_id':old,'title_zh':d['title_zh'],'title_en':d['title_en'],'video':str(new_video.relative_to(ROOT)),'video_sha256':videos[old]['sha256'],'source_video':videos[old]['path'],'pdf':f'分篇PDF/{n}/'+filename(n,d,'pdf'),'source_pdf':meta[old]['pdf'],'source_pdf_sha256':meta[old]['pdf_sha256'],'source_pages':meta[old]['pages'],'illustration':f'illustrations/{n}.png','illustration_sha256':meta[old]['illustration_sha256']})
    link(ROOT/'illustrations/01.png',ROOT/'illustrations/01-preview.png')
    (ROOT/'output').mkdir(exist_ok=True)
    for name in ['01-layout-audit.json']:
        src=BASE/'output'/name
        if src.exists():shutil.copy2(src,ROOT/'output'/name)
    frozen=BASE/'output/01-柠檬汁劫匪-插图阅读小册.pdf'
    if frozen.exists():link(frozen,ROOT/'output/01-frozen.pdf')
    write(ROOT/'篇号对照.json',{'order_source':'User specified full70 order; new numbering01–70','order':[f'{n:02}' for n in ORDER],'rows':rows})
    with (ROOT/'篇号对照.csv').open('w',encoding='utf-8-sig',newline='') as f:
        w=csv.writer(f);w.writerow(['新篇号','原篇号','中文名','英文名','视频文件名','PDF文件名'])
        for x in rows:w.writerow([x['new_id'],x['source_id'],x['title_zh'],x['title_en'],Path(x['video']).name,Path(x['pdf']).name])
    (ROOT/'视频名称清单.txt').write_text(''.join(Path(x['video']).name+'\n' for x in rows))
    (ROOT/'播放顺序.m3u8').write_text('#EXTM3U\n'+''.join(f'#EXTINF:-1,{x["new_id"]} {x["title_zh"]} {x["title_en"]}\n{x["video"]}\n' for x in rows))
    return rows

def text_without_labels(page,index):
    text=[]
    for block in page.get_text('dict')['blocks']:
        for line in block.get('lines',[]):
            for span in line['spans']:
                x0,y0,x1,y1=span['bbox']
                if y0>H-50:continue
                if index==0 and x0>W-80 and y1<75:continue
                text.append(span['text'])
    return re.sub(r'\s+',' ',''.join(text)).strip()

def compare_original(row,path):
    original=BASE/row['source_pdf']
    if not original.exists():return {'original_available':False}
    assert sha(original)==row['source_pdf_sha256']
    with fitz.open(original) as a,fitz.open(path) as b:
        assert len(a)==len(b)==row['source_pages']
        for index,(before,after) in enumerate(zip(a,b)):
            assert before.rect==after.rect
            assert text_without_labels(before,index)==text_without_labels(after,index),(row['new_id'],index,'non-number text changed')
            clips=[fitz.Rect(0,0,W,H-50)] if index else [fitz.Rect(0,0,W-80,H-50),fitz.Rect(W-80,75,W,H-50)]
            for clip in clips:
                p=before.get_pixmap(matrix=fitz.Matrix(1,1),clip=clip,alpha=False)
                q=after.get_pixmap(matrix=fitz.Matrix(1,1),clip=clip,alpha=False)
                assert p.samples==q.samples,(row['new_id'],index,'pixels outside number regions changed')
            footer=after.get_textbox(fitz.Rect(34,H-37,W-30,H-12))
            assert re.search(r'\b'+row['new_id']+r'\b',footer),(row['new_id'],index,'footer new number missing')
        cover=b[0].get_textbox(fitz.Rect(W-80,15,W-25,70));assert row['new_id'] in cover
    return {'original_available':True,'all_body_text_unchanged':True,'pixels_outside_number_regions_identical':True,'every_footer_new_number_verified':True}

def chapter(row):
    n=row['new_id'];folder=P.DEST/n;folder.mkdir(exist_ok=True);path=ROOT/row['pdf'];d=read(ROOT/f'content/articles/{n}.json');qc=folder/'qc.json';delta=folder/'renumber-qc.json'
    if qc.exists() and delta.exists():
        q=read(qc);v=read(delta)
        if q.get('content_sha256')==sha(ROOT/f'content/articles/{n}.json') and path.exists() and sha(path)==q['pdf_sha256'] and v.get('passed'):return q
    if n=='01':shutil.copy2(ROOT/'output/01-frozen.pdf',path)
    else:
        book=P.Book(d);book.path=path;book.build()
    P.qa_and_preview(n,path,d)
    unchanged=compare_original(row,path)
    write(delta,{'new_id':n,'source_id':row['source_id'],'passed':True,'pdf_sha256':sha(path),'new_pdf_pages':read(qc)['pages'],**unchanged})
    result=read(qc);print(json.dumps({'new':n,'old':row['source_id'],'pages':result['pages'],'passed':True},ensure_ascii=False),flush=True);return result

def main():
    a=argparse.ArgumentParser();a.add_argument('--ids',nargs='*');a.add_argument('--prepare-only',action='store_true');args=a.parse_args();rows=prepare()
    if args.prepare_only:print(json.dumps({'prepared':70,'first_two':rows[:2]},ensure_ascii=False));return
    wanted={f'{int(n):02}' for n in args.ids} if args.ids else None
    for row in rows:
        if wanted is None or row['new_id'] in wanted:chapter(row)

if __name__=='__main__':main()
