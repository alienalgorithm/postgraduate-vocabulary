# usage: bars.py file bpm first_downbeat -> per-bar table: bar#, start s, RMS dB, novelty (feature change vs previous bar), top novelty bars
import sys, warnings; warnings.filterwarnings('ignore')
import numpy as np, librosa
f,bpm,d0=sys.argv[1],float(sys.argv[2]),float(sys.argv[3]); bar=240/bpm
y,sr=librosa.load(f,sr=22050,mono=True); hop=512; dur=len(y)/sr
S=np.abs(librosa.stft(y,hop_length=hop)); rms=librosa.feature.rms(S=S,hop_length=hop)[0]
ch=librosa.feature.chroma_stft(S=S**2,sr=sr); mf=librosa.feature.mfcc(S=librosa.power_to_db(librosa.feature.melspectrogram(S=S**2,sr=sr)),n_mfcc=13)
F=np.vstack([ch*2,mf/np.std(mf,axis=1,keepdims=True)])
t=librosa.frames_to_time(np.arange(S.shape[1]),sr=sr,hop_length=hop)
starts=np.arange(d0-bar*int(d0/bar),dur,bar)
rows=[]
for i,s in enumerate(starts):
    m=(t>=s)&(t<s+bar)
    if m.sum()<3: continue
    rows.append((i,s,20*np.log10(np.sqrt(np.mean(rms[m]**2))+1e-9),F[:,m].mean(1)))
ref=max(r[2] for r in rows)
nov=[0]+[float(np.linalg.norm(rows[k][3]-rows[k-1][3])) for k in range(1,len(rows))]
nv=np.array(nov); nv=nv/ (np.percentile(nv,90)+1e-9)
print(f"{f.split('/')[-1]}  bpm {bpm}  bar {bar:.4f}s  bar0 at {starts[0]:.3f}s  (bars indexed from bar0)")
line=[]
for (i,s,db,_),n in zip(rows,nv):
    line.append(f"{i:3d}|{s:6.2f}|{db-ref:5.1f}|{'*' if n>1.3 else ('+' if n>1.0 else ' ')}")
for k in range(0,len(line),6): print('  '.join(line[k:k+6]))
top=np.argsort(-nv)[:14]; print('top novelty bars:',' '.join(f"{rows[k][0]}@{rows[k][1]:.2f}" for k in sorted(top)))
