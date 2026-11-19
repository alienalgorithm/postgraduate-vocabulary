import numpy as np, matplotlib; matplotlib.use('Agg'); import matplotlib.pyplot as plt, librosa, sys
C=np.load('cqt12.npy'); fr=22050/256
d=np.load('feat.npz')
Cd=librosa.amplitude_to_db(C,ref=np.max)
B=0.625; b0=-0.033
wins=[tuple(map(float,w.split(':'))) for w in sys.argv[2:]]
fig,ax=plt.subplots(len(wins),1,figsize=(20,4.6*len(wins)))
ax=np.atleast_1d(ax)
for a,(t0,t1) in zip(ax,wins):
    i0,i1=int(t0*fr),int(t1*fr)
    a.imshow(Cd[12:,i0:i1],origin='lower',aspect='auto',extent=[t0,t1,12,96],cmap='magma',vmin=-75,vmax=0)
    for k in range(int(np.ceil((t0-b0)/B)),int((t1-b0)/B)+1):
        t=b0+k*B
        a.axvline(t,color='w',lw=0.5,alpha=0.5)
        a.text(t+0.02,93,str(k),color='w',fontsize=8)
        if k%3==0: a.axvline(t,color='cyan',lw=2,ymin=0.5,ymax=1)
        if k%3==2: a.axvline(t,color='lime',lw=2,ymin=0,ymax=0.5)
    on=d['on_full'][i0:i1]; tt=np.arange(i0,i1)/fr
    a.plot(tt,on/on.max()*20+14,color='yellow',lw=0.7)
    a.set_yticks(range(12,96,12)); a.set_yticklabels([f'C{o+2}' for o in range(7)])
    a.set_title(f'{t0}-{t1}s beat numbers k (t=-0.033+0.625k); cyan top = k%3==0 (intro bar grid), lime bottom = k%3==2 (main bar grid)')
plt.tight_layout(); plt.savefig(sys.argv[1],dpi=65)
