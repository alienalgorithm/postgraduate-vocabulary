# usage: python3 -I compare.py file...   -> per-window texture/key profile
import sys, warnings; warnings.filterwarnings('ignore')
import numpy as np, librosa
maj=np.array([6.35,2.23,3.48,2.33,4.38,4.09,2.52,5.19,2.39,3.66,2.29,2.88])
mnr=np.array([6.33,2.68,3.52,5.38,2.60,3.53,2.54,4.75,3.98,2.69,3.34,3.17])
names='C C# D D# E F F# G G# A A# B'.split()
def key(ch):
    v=ch.mean(1); best=(-9,'')
    for i in range(12):
        for prof,m in ((maj,'maj'),(mnr,'min')):
            r=np.corrcoef(np.roll(prof,i),v)[0,1]
            if r>best[0]: best=(r,names[i]+m)
    return best
for p in sys.argv[1:]:
    y,sr=librosa.load(p,sr=22050,mono=True)
    hop=512
    S=np.abs(librosa.stft(y,n_fft=4096,hop_length=hop))
    f=librosa.fft_frequencies(sr=sr,n_fft=4096)
    H,P=librosa.decompose.hpss(S)
    ch=librosa.feature.chroma_cqt(y=y,sr=sr,hop_length=hop)
    t=librosa.frames_to_time(np.arange(S.shape[1]),sr=sr,hop_length=hop)
    print('==',p.split('/')[-1],'global key',key(ch))
    bands=[(20,120),(120,400),(400,2000),(2000,6000),(6000,11000)]
    W=6.0
    print(' t     dB   sub  low  mid  hi  air   perc%  key')
    for a in np.arange(0,t[-1],W):
        m=(t>=a)&(t<a+W)
        if m.sum()<5: continue
        e=(S[:,m]**2).sum(0).mean()
        db=10*np.log10(e+1e-12)
        bs=[10*np.log10((S[(f>=lo)&(f<hi)][:,m]**2).sum(0).mean()+1e-12)-db for lo,hi in bands]
        pr=(P[:,m]**2).sum()/((H[:,m]**2).sum()+(P[:,m]**2).sum()+1e-12)
        k=key(ch[:,m])
        print(f"{a:5.0f} {db-60:5.1f} "+' '.join(f"{b:4.0f}" for b in bs)+f"  {pr*100:4.0f}   {k[1]} {k[0]:.2f}")
