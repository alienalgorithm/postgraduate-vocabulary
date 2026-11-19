import numpy as np
from scipy.signal import find_peaks
d=np.load('flux.npz'); z=d['z']; fr=float(d['fr']); flux=d['flux']
t=np.arange(len(z))/fr
# onset peaks
pk,_=find_peaks(z,height=1.5,distance=int(0.06*fr))
pt=pk/fr
def fit(a,b,T0=0.15625,phi0=0.1225,iters=4,tol=0.035):
    T,phi=T0,phi0
    for _ in range(iters):
        m=(pt>a)&(pt<b); x=pt[m]; w=z[pk[m]]
        k=np.round((x-phi)/T); r=x-(phi+k*T); s=np.abs(r)<tol
        A=np.vstack([k[s],np.ones(s.sum())]).T
        W=np.sqrt(w[s])
        sol=np.linalg.lstsq(A*W[:,None],x[s]*W,rcond=None)[0]
        T,phi=sol
        res=x[s]-(phi+k[s]*T)
    return T,phi,res.std(),s.sum(),m.sum(),np.median(res)
for a,b in [(32,119.3),(42,119.3),(32,84),(84,119.3),(0,32),(8,32)]:
    T,phi,sd,n,N,md=fit(a,b)
    print(f'{a}-{b}: tatum {T:.6f} beat {4*T:.5f} bpm {60/(4*T):.3f} phase {phi:.4f} resid sd {sd*1000:.1f}ms med {md*1000:+.1f} used {n}/{N}')
# residual per 8s windows with global fit 32-119.3
T,phi,_,_,_,_=fit(32,119.3)
for a in range(0,120,6):
    m=(pt>a)&(pt<a+6); x=pt[m]; k=np.round((x-phi)/T); r=x-(phi+k*T)
    h=np.histogram(r*1000,bins=np.linspace(-78,78,14))[0]
    print(f'{a:4d}s n={m.sum():3d} medres {np.median(r)*1000:+6.1f}ms  hist {h}')
