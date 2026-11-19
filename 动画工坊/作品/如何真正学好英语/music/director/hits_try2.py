import json, sys, warnings; warnings.filterwarnings('ignore')
sys.path.insert(0, sys.argv[1])
import numpy as np, soundfile as sf
from hits import band_env, attacks
y,sr=sf.read('score.wav',dtype='float64'); mono=y.mean(1)
m=json.load(open('map.json')); BEAT=m['beat']; L0=m['beat_offset']; secs=m['sections']
lowdb,fps=band_env(mono,sr,0,160); hidb,_=band_env(mono,sr,2000,15000); 
top_low=np.percentile(lowdb,99.5); top_hi=np.percentile(hidb,99.5)
def report(name,ev):
    print('==',name,len(ev))
    for s in secs:
        sel=[e for e in ev if s['start']<=e[0]<s['end']]
        if not sel: print(f"   {s['name']:16s} 0"); continue
        d=[((e[0]-L0)/(BEAT/4)-round((e[0]-L0)/(BEAT/4)))*BEAT/4*1000 for e in sel]
        print(f"   {s['name']:16s} {len(sel):4d}  dev from 16th grid: median {np.median(d):+.0f} ms, IQR {np.percentile(d,25):+.0f}..{np.percentile(d,75):+.0f}")
for r in (9,12):
    report(f'kicks rise>{r}', attacks(lowdb,fps,r,0.08,0.18,top_low-35))
for r in (8,12):
    report(f'hf rise>{r}', attacks(hidb,fps,r,0.04,0.09,top_hi-40))
