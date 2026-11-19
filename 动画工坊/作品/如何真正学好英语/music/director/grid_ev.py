import sys, warnings; warnings.filterwarnings('ignore')
import numpy as np, librosa, json
p=sys.argv[1]
y,sr=librosa.load(p,sr=44100,mono=True)
hop=128; fps=sr/hop
oenv=librosa.onset.onset_strength(y=y,sr=sr,hop_length=hop,n_fft=2048,lag=2,max_size=3)
t=np.arange(len(oenv))/fps
# fit grid: for candidate period and offset maximize sum of onset strength at beat positions (with small tolerance)
def score(period,off,a,b):
    bt=np.arange(off,b,period); bt=bt[bt>=a]
    idx=np.round(bt*fps).astype(int); idx=idx[idx<len(oenv)]
    # max within +/-1 frame
    v=np.maximum.reduce([oenv[np.clip(idx+d,0,len(oenv)-1)] for d in (-2,-1,0,1,2)])
    return v.mean()
def fit(a,b,bpm0,span=1.0):
    best=(0,0,0)
    for bpm in np.arange(bpm0-span,bpm0+span,0.005):
        per=60/bpm
        for off in np.arange(0,per,0.004):
            s=score(per,off,a,b)
            if s>best[0]: best=(s,bpm,off)
    return best
for a,b in [(0,57),(20,57),(72,118),(118,146),(0,160)]:
    s,bpm,off=fit(a,b,94.0,0.6)
    print(f"seg {a}-{b}: bpm {bpm:.3f} offset {off:.3f} score {s/oenv.mean():.2f}")
print('--- fixed bpm tests')
for bpm in (93.9,93.95,94.0,94.05):
    per=60/bpm
    row=[]
    for a,b in [(0,21),(21,40),(40,57),(57,72),(72,95),(95,118),(118,146),(146,158)]:
        best=max(((score(per,off,a,b),off) for off in np.arange(0,per,0.002)))
        row.append(f"{a}-{b}:{best[1]:.3f}({best[0]/oenv.mean():.1f})")
    print(bpm,' '.join(row))
