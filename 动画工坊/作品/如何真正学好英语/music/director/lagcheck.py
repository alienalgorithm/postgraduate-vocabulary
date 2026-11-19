# cross-correlate audio of bar a vs bar b to find exact lag (period check)
import sys, warnings; warnings.filterwarnings('ignore')
import numpy as np, subprocess, scipy.signal as ss
p=sys.argv[1]; off=float(sys.argv[2]); bar=float(sys.argv[3])
raw=subprocess.run(['ffmpeg','-v','error','-i',p,'-ac','1','-ar','44100','-f','f32le','-'],capture_output=True).stdout
y=np.frombuffer(raw,np.float32).astype(np.float64); sr=44100
b,a=ss.butter(4,[80/(sr/2),5000/(sr/2)],'band'); yf=ss.filtfilt(b,a,y)
pairs=[tuple(map(int,x.split(','))) for x in sys.argv[4:]]
for A,B in pairs:
    ta=off+A*bar; tb=off+B*bar
    L=int(2*bar*sr)  # window: 2 bars? use 1 bar
    L=int(bar*sr)
    xa=yf[int(ta*sr):int(ta*sr)+L]
    best=(-1,0)
    W=int(0.06*sr)
    seg=yf[int(tb*sr)-W:int(tb*sr)+L+W]
    c=ss.correlate(seg,xa,mode='valid')
    n=np.sqrt(np.convolve(seg**2,np.ones(L),'valid'))*np.sqrt((xa**2).sum())+1e-12
    cn=c/n; j=np.argmax(cn); lag=(j-W)/sr
    print(f"bar {A:2d} vs {B:2d}: nominal dt {(B-A)*bar:8.4f}  best lag {lag*1000:6.1f} ms  corr {cn[j]:.3f}  implied bar {((B-A)*bar+lag)/(B-A):.5f}")
