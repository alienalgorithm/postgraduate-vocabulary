import sys, warnings; warnings.filterwarnings('ignore')
import numpy as np, librosa
p=sys.argv[1]; t0=float(sys.argv[2]); t1=float(sys.argv[3]); off=float(sys.argv[4]); bar=float(sys.argv[5])
y,sr=librosa.load(p,sr=44100,mono=True,offset=t0,duration=t1-t0)
hop=64
o=librosa.onset.onset_strength(y=y,sr=sr,hop_length=hop,n_fft=1024,lag=1,max_size=1)
pk=librosa.util.peak_pick(o,pre_max=40,post_max=40,pre_avg=200,post_avg=200,delta=np.percentile(o,90)*0.5,wait=60)
beat=bar/4
for i in pk:
    t=t0+i*hop/sr; pos=(t-off)/beat
    print(f"{t:8.3f}  beat {pos:7.2f} (bar {int(pos//4)}.{int(pos%4)+1} dev {((pos-round(pos))*beat)*1000:+5.0f} ms) str {o[i]:.1f}")
