# usage: gridcheck.py ANALYSISDIR file ... : per 20s window, local best offset (ms) of onsets vs the fitted grid, and on/off-grid ratio
import sys, os, json, warnings; warnings.filterwarnings('ignore')
import numpy as np, librosa
A=sys.argv[1]
for path in sys.argv[2:]:
    stem=os.path.splitext(os.path.basename(path))[0]; d=json.load(open(os.path.join(A,stem+'.json')))
    P=d['grid_beat_period']; b0=d['grid_first_beat']
    y,sr=librosa.load(path,sr=22050,mono=True); hop=128
    o=librosa.onset.onset_strength(y=y,sr=sr,hop_length=hop); t=librosa.frames_to_time(np.arange(len(o)),sr=sr,hop_length=hop)
    out=[]
    for w0 in np.arange(0,t[-1]-10,20):
        m=(t>=w0)&(t<w0+20)
        if o[m].sum()==0: continue
        offs=np.arange(-0.5,0.5,0.01)*P
        sc=[]
        for off in offs:
            ph=((t[m]-b0-off)%P)/P; ph=np.minimum(ph,1-ph)
            sc.append(np.sum(o[m]*(ph<0.06))/ (np.sum(o[m])+1e-9))
        i=int(np.argmax(sc)); ph=((t[m]-b0)%P)/P; ph=np.minimum(ph,1-ph)
        on=np.sum(o[m]*(ph<0.06))/np.sum(o[m])
        out.append(f"{int(w0):3d}s:{offs[i]*1000:+4.0f}ms/{on/0.12:.1f}")
    print(stem[:40], ' '.join(out))
