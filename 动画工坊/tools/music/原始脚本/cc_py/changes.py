import numpy as np
from scipy.signal import find_peaks
C=np.load('cqt12.npy'); fr=22050/256
pn=['C','C#','D','D#','E','F','F#','G','G#','A','A#','B']
T=0.15625; b0=-0.033
tat=b0+np.arange(0,int(127/T))*T
def pcv(lo,hi,a,b):
    v=C[lo:hi,int(a*fr):max(int(a*fr)+1,int(b*fr))].mean(1)**2; o=np.zeros(12)
    for j,e in enumerate(v): o[(lo+j)%12]+=e
    return o
bass=np.array([pcv(0,30,t,t+T) for t in tat[:-1]])
full=np.array([pcv(24,72,t,t+T) for t in tat[:-1]])
def nov(M,w):
    Mn=M/(np.linalg.norm(M,axis=1,keepdims=True)+1e-12); out=np.zeros(len(M))
    for i in range(w,len(M)-w):
        a=Mn[i-w:i].mean(0); b=Mn[i:i+w].mean(0)
        out[i]=1-np.dot(a,b)/(np.linalg.norm(a)*np.linalg.norm(b)+1e-12)
    return out
nb=nov(bass,8)   # +-2 beats
nf=nov(full,8)
pk,_=find_peaks(nb,height=0.08,distance=8)
print('bass changes: time, tatum idx from b0, beat idx, beat%3, beat%4, before->after, strength')
for i in pk:
    t=tat[i]; k=i/4
    a=pn[np.argmax(bass[max(0,i-8):i].sum(0))]; b=pn[np.argmax(bass[i:i+8].sum(0))]
    print(f'{t:8.3f}  tat {i:4d}  beat {k:6.2f}  m3 {k%3:4.2f} m4 {k%4:4.2f}  {a:>2}->{b:<2}  {nb[i]:.2f}')
np.savez('tatfeat.npz',bass=bass,full=full,nb=nb,nf=nf,tat=tat)
