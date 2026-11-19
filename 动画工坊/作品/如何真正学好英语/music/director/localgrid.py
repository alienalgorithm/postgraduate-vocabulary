# local downbeat/beat refinement for a nominal grid
import sys, warnings; warnings.filterwarnings('ignore')
import numpy as np, librosa
p=sys.argv[1]; off=float(sys.argv[2]); bar=float(sys.argv[3]); nb=int(sys.argv[4])
y,sr=librosa.load(p,sr=44100,mono=True)
hop=64; fps=sr/hop
S=np.abs(librosa.stft(y,n_fft=1024,hop_length=hop))
f=librosa.fft_frequencies(sr=sr,n_fft=1024)
def flux(mask):
    L=np.log1p(100*S[mask]); d=np.maximum(0,np.diff(L,axis=1)).sum(0); return np.concatenate([[0],d])
fall=flux(f>0); flow=flux(f<300); fhi=flux(f>2000)
print(' k   nominal   peak_all  d_ms  str   peak_low d_ms  str')
for k in range(nb):
    t=off+k*bar
    for q in range(1):
        tt=t+q*bar/4
        i=int(tt*fps); w=int(0.06*fps)
        seg=fall[i-w:i+w]; j=np.argmax(seg); 
        segl=flow[i-w:i+w]; jl=np.argmax(segl)
        base=np.median(fall[max(0,i-int(fps)):i+int(fps)])+1e-9
        basel=np.median(flow[max(0,i-int(fps)):i+int(fps)])+1e-9
        print(f"{k:2d} {tt:8.3f} {(i-w+j)/fps:9.3f} {((i-w+j)/fps-tt)*1000:5.0f} {seg[j]/base:5.1f}  {(i-w+jl)/fps:9.3f} {((i-w+jl)/fps-tt)*1000:5.0f} {segl[jl]/basel:5.1f}")
