import json, warnings; warnings.filterwarnings('ignore')
import numpy as np, soundfile as sf, librosa
from scipy.ndimage import gaussian_filter1d, median_filter, minimum_filter1d
y,sr=sf.read('score.wav',dtype='float64'); mono=y.mean(1).astype(np.float32)
m=json.load(open('map.json')); BEAT=m['beat']; L0=m['beat_offset']; secs=m['sections']
HOP=128; fps=sr/HOP
S=np.abs(librosa.stft(mono,n_fft=2048,hop_length=HOP)); f=librosa.fft_frequencies(sr=sr,n_fft=2048)
def banddb(lo,hi):
    e=(S[(f>=lo)&(f<hi)]**2).sum(0); return 10*np.log10(gaussian_filter1d(e,1.0)+1e-12)
def attacks(db, rise_db, win_s, gap_s, floor_db):
    w=int(win_s*fps)
    mn=minimum_filter1d(db,size=w,origin=(w-1)//2)   # min over the previous w frames
    rise=db-mn
    pk=librosa.util.peak_pick(rise,pre_max=8,post_max=8,pre_avg=1,post_avg=1,delta=0,wait=int(gap_s*fps))
    out=[]
    for p in pk:
        if rise[p]<rise_db or db[p]<floor_db: continue
        # attack start: last frame before p where db is within 1 dB of the local minimum
        a=p
        while a>p-w and db[a-1]>mn[p]+1.0: a-=1
        out.append((a/fps, float(rise[p]), float(db[p])))
    return out
def report(name,ev):
    print('==',name,len(ev))
    for s in secs:
        sel=[e for e in ev if s['start']<=e[0]<s['end']]
        if not sel: print(f"   {s['name']:16s} 0"); continue
        dev=[abs(((e[0]-L0)/BEAT*4-round((e[0]-L0)/BEAT*4))*BEAT/4*1000) for e in sel]
        print(f"   {s['name']:16s} {len(sel):4d}  on16th(<25ms) {sum(d<25 for d in dev)/len(sel):.0%}  median dev {np.median(dev):.0f} ms")
top=np.percentile(banddb(20,20000),99.5)
low=banddb(25,160); full=banddb(25,16000); hi=banddb(2000,16000)
report('kicks rise>6dB/60ms', attacks(low,6,0.06,0.15,top-40))
report('kicks rise>9dB/60ms', attacks(low,9,0.06,0.15,top-40))
report('full rise>4dB/50ms', attacks(full,4,0.05,0.10,top-40))
report('hi rise>6dB/40ms', attacks(hi,6,0.04,0.08,top-55))
