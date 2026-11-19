import numpy as np
d=np.load('flux.npz'); z=d['z']; fr=float(d['fr'])
def score(T,phi,a,b):
    k0=int(np.ceil((a-phi)/T)); k1=int((b-phi)/T)
    ts=phi+np.arange(k0,k1+1)*T
    return np.interp(ts*fr,np.arange(len(z)),z).mean()
for (a,b) in [(1,32),(8,32),(1,16),(16,32)]:
    res=[]
    for T in np.arange(0.140,0.175,0.0001):
        phis=np.arange(0,T,0.001); sc=[score(T,p,a,b) for p in phis]; i=int(np.argmax(sc)); res.append((sc[i],T,phis[i]))
    res.sort(reverse=True)
    print(a,b,[ (round(s,3),round(T,5),round(p,4)) for s,T,p in res[:5]])
    # also beat-level periods
    res=[]
    for T in np.arange(0.55,0.70,0.0005):
        phis=np.arange(0,T,0.002); sc=[score(T,p,a,b) for p in phis]; i=int(np.argmax(sc)); res.append((sc[i],T,phis[i]))
    res.sort(reverse=True)
    print('  beat-level',[ (round(s,3),round(T,4),round(p,4)) for s,T,p in res[:5]])
