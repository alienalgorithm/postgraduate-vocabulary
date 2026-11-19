# usage: barsim.py file off bar nbars out.png
import sys, warnings; warnings.filterwarnings('ignore')
import numpy as np, librosa
import matplotlib; matplotlib.use('Agg'); import matplotlib.pyplot as plt
p=sys.argv[1]; off=float(sys.argv[2]); bar=float(sys.argv[3]); nb=int(sys.argv[4]); out=sys.argv[5]
y,sr=librosa.load(p,sr=22050,mono=True)
hop=256
C=librosa.feature.chroma_cqt(y=y,sr=sr,hop_length=hop,bins_per_octave=36)
M=librosa.feature.mfcc(y=y,sr=sr,hop_length=hop,n_mfcc=20)
R=librosa.feature.rms(y=y,hop_length=hop)[0]
fps=sr/hop
feats=[];ens=[]
for k in range(nb):
    a=off+k*bar
    sub=[]
    for q in range(4):
        i0=int((a+q*bar/4)*fps); i1=int((a+(q+1)*bar/4)*fps)
        sub.append(C[:,i0:i1].mean(1))
    ch=np.concatenate(sub); ch/=np.linalg.norm(ch)+1e-9
    i0=int(a*fps); i1=int((a+bar)*fps)
    mf=M[1:,i0:i1].mean(1)
    feats.append((ch,mf)); ens.append(20*np.log10(R[i0:i1].mean()+1e-9))
mfs=np.array([f[1] for f in feats]); mfs=(mfs-mfs.mean(0))/(mfs.std(0)+1e-9)
N=len(feats); Sc=np.zeros((N,N)); Sm=np.zeros((N,N))
for i in range(N):
    for j in range(N):
        Sc[i,j]=feats[i][0]@feats[j][0]
        Sm[i,j]=np.exp(-np.linalg.norm(mfs[i]-mfs[j])/6)
S=Sc*Sm
np.save(out.replace('.png','.npy'),np.stack([Sc,Sm]))
fig,ax=plt.subplots(1,2,figsize=(20,10))
ax[0].imshow(Sc,origin='lower',cmap='magma',vmin=0.5,vmax=1); ax[0].set_title('chroma sim (bars)')
ax[1].imshow(S,origin='lower',cmap='magma',vmin=0.2,vmax=1); ax[1].set_title('chroma*timbre sim')
for a in ax: a.set_xticks(range(0,N,4)); a.set_yticks(range(0,N,4)); a.grid(color='w',alpha=0.2)
plt.tight_layout(); plt.savefig(out,dpi=55)
for k in range(N):
    order=np.argsort(-S[k]); top=[(j,S[k,j]) for j in order if j!=k][:5]
    print(f"bar {k:2d} t={off+k*bar:6.2f} {ens[k]:6.1f}dB  "+'  '.join(f"{j}:{s:.2f}/{Sc[k,j]:.2f}" for j,s in top))
