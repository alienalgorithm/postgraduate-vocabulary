import numpy as np, sys
sys.path.insert(0,'py'); from grid_def import *
C=np.load('cqt12.npy'); fr=22050/256
pn=['C','C#','D','D#','E','F','F#','G','G#','A','A#','B']
def pcv(lo,hi,a,b):
    v=C[lo:hi,max(0,int(a*fr)):int(b*fr)].mean(1)**2; o=np.zeros(12)
    for j,e in enumerate(v): o[(lo+j)%12]+=e
    return o
ok=0; bad=[]
out=[]
for n in range(1,65):
    a=max(0,bar_t(n))+0.1; b=bar_t(n+1)-0.05
    bs=pcv(0,30,a,b); ms=pcv(24,60,a,b)
    root=pn[int(np.argmax(bs))]; tri=''.join(pn[i] for i in np.argsort(ms)[::-1][:4] )
    lab=ROOT[CHORD[n]]
    flag='' if (lab==root or lab=='E-pedal') else ' <-- '
    if flag: bad.append(n)
    out.append(f'{n:2d} {bar_t(n):7.3f} lab {lab:>7} pos {CHORD[n]!s:>2} | bass {root:>2} mid {tri:10s}{flag}')
for i in range(0,64,2): print(out[i].ljust(70),out[i+1] if i+1<64 else '')
print('mismatch bars',bad)
