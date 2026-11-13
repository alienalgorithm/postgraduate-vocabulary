from pathlib import Path
import json,math
from html import escape
import fitz
from reportlab.pdfgen import canvas
import build_reordered as R

ROOT=R.ROOT;P=R.P;B=P.B;W,H,M,CW=R.W,R.H,R.M,R.CW

def build():
    rows=R.read(ROOT/'篇号对照.json')['rows'];items=[];offset=8
    for row in rows:
        q=R.read(ROOT/f'分篇PDF/{row["new_id"]}/qc.json');p=ROOT/row['pdf'];assert q['passed'] and R.sha(p)==q['pdf_sha256']
        v=R.read(ROOT/f'分篇PDF/{row["new_id"]}/renumber-qc.json');assert v['passed']
        items.append({**row,'pages':q['pages'],'start_page':offset,'pdf_sha256':q['pdf_sha256']});offset+=q['pages']
    out=ROOT/'合订本';out.mkdir(exist_ok=True);toc=out/'目录.pdf';c=canvas.Canvas(str(toc),pagesize=(W,H),pageCompression=1);links=[]
    for group in range(7):
        c.setFillColor(B.PAPER);c.rect(0,0,W,H,stroke=0,fill=1)
        B.text(c,'STORIES TO READ AND REMEMBER',M,H-39,'SANS',8.1,B.FOREST)
        B.text(c,'70篇插图英语阅读小册',M,H-79,'CNB',22,B.FOREST)
        B.text(c,f'新顺序版 · 第{group*10+1:02}—{group*10+10:02}篇',M,H-108,'CN',12.5,B.FOREST)
        B.para(c,'篇号已按新顺序统一编号为01—70。点击篇目即可跳转；每篇依次包含插图、英文、中文、词汇与回想。',M,H-130,CW,'CN',9.5,14,B.MUTED)
        y=H-177;B.rule(c,M,y,CW);y-=16;B.text(c,'新篇号',M,y,'CN',8.3,B.MUTED);c.setFont('CN',8.3);c.setFillColor(B.MUTED);c.drawRightString(W-M,y,'全本页码');y-=17
        for item in items[group*10:(group+1)*10]:
            top=y;B.text(c,item['new_id'],M,y-12,'SANS',10,B.FOREST)
            bottom=B.para(c,escape(item['title_zh']),M+43,y,CW-85,'CNB',11.2,14.5,B.FOREST)
            bottom=min(bottom-10,y-33);c.setFont('SANS',9.2);c.setFillColor(B.FOREST);c.drawRightString(W-M,y-13,str(item['start_page']));B.rule(c,M,bottom,CW,B.LINE,.4)
            links.append({'toc_page':group,'rect':[M,H-top,W-M,H-bottom],'target':item['start_page']-1,'new_id':item['new_id']});y=bottom-8
        assert y>53;B.rule(c,M,36,CW);B.text(c,f'新顺序版 · 目录{group+1}/7',M,22,'CN',8.1,B.MUTED);c.showPage()
    c.save();doc=fitz.open(toc)
    for item in items:
        with fitz.open(ROOT/item['pdf']) as d:doc.insert_pdf(d,links=True,annots=True)
    for l in links:doc[l['toc_page']].insert_link({'kind':fitz.LINK_GOTO,'from':fitz.Rect(l['rect']),'page':l['target']})
    doc.set_toc([[1,'新顺序目录',1]]+[[1,f'第{x["new_id"]}篇 {x["title_zh"]}',x['start_page']] for x in items])
    doc.set_metadata({'title':'70篇插图英语阅读小册 新顺序合订本','author':'英文阅读小册','subject':'按新篇号01—70排序的完整双语阅读小册'})
    before=[p.get_text() for p in doc];images=sorted((i[2],i[3]) for p in doc for i in p.get_images());raw=doc.tobytes(garbage=4,deflate=True);doc.close()
    final=out/'70篇插图英语阅读小册 新顺序合订本.pdf'
    for quality in [96,94,92]:
        d=fitz.open(stream=raw,filetype='pdf');d.rewrite_images(dpi_target=0,quality=quality,bitonal=False);d.save(final,garbage=4,deflate=True);d.close()
        if final.stat().st_size<99_000_000:break
    assert final.stat().st_size<100_000_000,'Keep the standalone PDF below the GitHub normal-blob limit'
    with fitz.open(final) as d:
        assert len(d)==offset-1==474 and [p.get_text() for p in d]==before
        assert sorted((i[2],i[3]) for p in d for i in p.get_images())==images
        assert sum(len(d[i].get_links()) for i in range(7))==70
        for l in links:
            matches=[x for x in d[l['toc_page']].get_links() if fitz.Rect(x['from']).intersects(fitz.Rect(l['rect']))]
            assert len(matches)==1 and matches[0]['page']==l['target']
            assert l['new_id'] in d[l['toc_page']].get_textbox(fitz.Rect(l['rect']))
        assert len(d.get_toc())==71
        for item in items:
            with fitz.open(ROOT/item['pdf']) as src:
                for k,p in enumerate(src):assert p.rect==d[item['start_page']-1+k].rect and p.get_text()==d[item['start_page']-1+k].get_text()
        for i in range(7):d[i].get_pixmap(matrix=fitz.Matrix(1.8,1.8),alpha=False).save(out/f'目录-{i+1:02}.png')
    result={'passed':True,'pdf':str(final.relative_to(ROOT)),'pages':474,'chapter_pages':467,'contents_pages':7,'articles':70,'internal_contents_links':70,'jpeg_quality':quality,'image_dimensions_preserved':True,'all_chapter_text_and_geometry_unchanged':True,'bytes':final.stat().st_size,'pdf_sha256':R.sha(final),'chapters':items}
    R.write(out/'qc.json',result);print(json.dumps({k:result[k] for k in ['passed','pages','bytes','jpeg_quality','pdf_sha256']},ensure_ascii=False),flush=True)

if __name__=='__main__':build()
