import glob, io, json, sys, numpy as np
from PIL import Image
from multiprocessing import Pool
B=sys.argv[1]
def curve(f):
    im=Image.open(f).convert('RGB'); a=np.asarray(im).astype(float); out=[]
    for sub in (0,2):
        for q in range(80,98):
            b=io.BytesIO(); im.save(b,'JPEG',quality=q,subsampling=sub,optimize=True,progressive=True)
            r=np.asarray(Image.open(io.BytesIO(b.getvalue())).convert('RGB')).astype(float)
            m=((a-r)**2).mean(); out.append({'sub':sub,'q':q,'bytes':b.tell(),'psnr':10*np.log10(255**2/m)})
    return f.split('/')[-1],out
if __name__=='__main__':
    files=sorted(glob.glob(B+'/img/book*.png'))
    with Pool(4) as p: res=dict(p.map(curve,files))
    json.dump(res,open(B+'/jpeg_curves.json','w'))
    print('curves',len(res))
