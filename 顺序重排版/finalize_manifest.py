from pathlib import Path
import hashlib,json
import build_reordered as R

ROOT=R.ROOT;BASE=R.BASE

def finish():
    rows=R.read(ROOT/'篇号对照.json')['rows'];old={x['id']:x for x in R.read(BASE/'manifest.json')['chapters']};items=[]
    assert [int(x['source_id']) for x in rows]==R.ORDER
    for row in rows:
        n=row['new_id'];src=BASE/f'content/articles/{row["source_id"]}.json';a=R.read(src);b=R.read(ROOT/f'content/articles/{n}.json')
        assert R.sha(src)==old[row['source_id']]['content_sha256']
        assert all(a[k]==b[k] for k in a if k!='id'),n
        q=R.read(ROOT/f'分篇PDF/{n}/qc.json');v=R.read(ROOT/f'分篇PDF/{n}/renumber-qc.json');assert q['passed'] and v['passed'] and v['pixels_outside_number_regions_identical'] and v['all_body_text_unchanged']
        pdf=ROOT/row['pdf'];video=ROOT/row['video'];assert R.sha(pdf)==q['pdf_sha256'];assert R.sha(video)==row['video_sha256'];assert pdf.stem==video.stem==R.filename(n,a,'pdf')[:-4]
        pm=R.read(ROOT/f'分篇PDF/{n}/preview-manifest.json');assert len(pm['pages'])==q['pages'];assert q['pages']==row['source_pages']
        items.append({**row,'pages':q['pages'],'pdf_sha256':q['pdf_sha256'],'video_bytes':video.stat().st_size,'content_sha256':R.sha(ROOT/f'content/articles/{n}.json'),'source_content_sha256':R.sha(src),'previews':[{'path':f'分篇PDF/{n}/'+Path(p['path']).name,'sha256':p['sha256']} for p in pm['pages']],'body_text_and_pixels_preserved':True,'video_bytes_identical_to_original':True})
    assert sum(x['pages'] for x in items)==467 and sum(len(x['previews']) for x in items)==467
    q=R.read(ROOT/'合订本/qc.json');assert q['passed'];assert R.sha(ROOT/q['pdf'])==q['pdf_sha256']
    data={'edition':'按用户指定顺序重新编号版','release_tag':'reading-reordered-2026.11.13-v1','original_release':'reading-complete-2026.11.13-v2','original_source_commit':'a34158de8fc24f4815db55d5a0836b852e084f3e','order_source_ids':[f'{n:02}' for n in R.ORDER],'articles':items,'combined_pdf':{'path':q['pdf'],'sha256':q['pdf_sha256'],'pages':474,'contents_pages':7,'contents_links':70},'download_scope':'PDF and MP4 only; no source files, images, manifests or audit documents in download ZIPs','video_filename_format':'NN 中文名 英文名.mp4','videos_reencoded':False,'audio_changed':False,'all_non_number_text_and_pixels_preserved':True,'individual_PDFs':70,'videos':70,'chapter_PDF_pages':467,'passed':True}
    R.write(ROOT/'manifest.json',data)
    print(json.dumps({'passed':True,'new_numbering':'01–70','videos':70,'individual_PDFs':70,'combined_pages':474,'video_byte_identity':True,'PDF_non_number_content_preserved':True},ensure_ascii=False),flush=True)

if __name__=='__main__':finish()
