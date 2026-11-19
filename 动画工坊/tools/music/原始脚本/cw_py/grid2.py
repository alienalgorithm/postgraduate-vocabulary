import numpy as np
d=np.load('flux.npz'); z=d['z']; fr=float(d['fr'])
def score(T,phi,a,b):
    k0=int(np.ceil((a-phi)/T)); k1=int((b-phi)/T)
    ts=phi+np.arange(k0,k1+1)*T
    return np.interp(ts*fr,np.arange(len(z)),z).mean()
for T in [0.15624,0.15625,0.15626,0.15627,0.15628]:
    phis=np.arange(0,T,0.0002); sc=[score(T,p,32,119.3) for p in phis]; i=int(np.argmax(sc))
    sc2=[score(T,p,2,119.3) for p in phis]; j=int(np.argmax(sc2))
    print(f'T={T:.5f} 32-119 best {sc[i]:.4f} phi {phis[i]:.4f} | 2-119 best {sc2[j]:.4f} phi {phis[j]:.4f}')
# per-window phase with T=0.15625, at 4 s windows, by centroid around best
T=0.15625
for a in np.arange(0,120,4):
    b=min(a+4,119.3)
    phis=np.arange(0,T,0.0005); sc=np.array([score(T,p,a,b) for p in phis]); i=int(np.argmax(sc))
    print(f'{a:5.0f} phase {phis[i]*1000:6.1f} ms  peak {sc[i]:.2f} mean {sc.mean():.2f} contrast {sc[i]/sc.mean():.2f}')
