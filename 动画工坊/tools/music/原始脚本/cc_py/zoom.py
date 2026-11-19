import numpy as np, matplotlib; matplotlib.use('Agg'); import matplotlib.pyplot as plt, librosa
d=np.load('feat.npz'); sr=int(d['sr']); hop=int(d['hop']); fr=sr/hop
C=librosa.amplitude_to_db(d['C'],ref=np.max)
T=0.15625; ph=0.1235
wins=[(0,6),(9,15),(30,36),(40.5,46.5),(90,96),(113,119.5)]
fig,ax=plt.subplots(len(wins),1,figsize=(18,4*len(wins)))
for a,(t0,t1) in zip(ax,wins):
    i0,i1=int(t0*fr),int(t1*fr)
    a.imshow(C[:,i0:i1],origin='lower',aspect='auto',extent=[t0,t1,0,96],cmap='magma',vmin=-80,vmax=0)
    k0=int(np.ceil((t0-ph)/T)); k1=int((t1-ph)/T)
    for k in range(k0,k1+1):
        tt=ph+k*T; pos=k%4
        a.axvline(tt,color='cyan' if pos==3 else 'w',lw=1.6 if pos==3 else 0.4,alpha=0.9 if pos==3 else 0.35)
    on=d['on_full'][i0:i1]; tt=np.arange(i0,i1)/fr
    a.plot(tt,on/on.max()*30+60,color='lime',lw=0.8)
    a.set_yticks(range(0,96,12)); a.set_yticklabels([f'C{o+1}' for o in range(8)])
    a.set_title(f'{t0}-{t1}s  CQT; white thin = tatum grid 0.15625s phase 0.1235; cyan = tatum pos3 (beat cand. -0.033+k*0.625)')
plt.tight_layout(); plt.savefig('plots/zoom_grid.png',dpi=70)
