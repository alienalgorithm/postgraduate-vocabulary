import numpy as np, sys
sys.path.insert(0,'py'); from grid_def import *
d=np.load('feat.npz'); fr=int(d['sr'])/int(d['hop'])
nb=len(BAR_BEATS)
rows=[]
for n in range(1,nb):
    a=bar_t(n); b=bar_t(n+1); i0=max(0,int(a*fr)); i1=int(b*fr)
    bands=10*np.log10(d['bands'][:,i0:i1].mean(1)+1e-12)
    Hb=d['Hb'][:,i0:i1].mean(1); Pb=d['Pb'][:,i0:i1].mean(1)
    pr=10*np.log10(Pb.sum()/Hb.sum())
    rms=20*np.log10(d['rms'][i0:i1].mean()+1e-9)
    cent=d['cent'][i0:i1].mean(); flat=d['flat'][i0:i1].mean()
    onr=d['on_full'][i0:i1].mean(); onp=d['on_perc'][i0:i1].mean()
    rows.append((n,a,b,rms,*bands,pr,cent,onr,onp,10*np.log10(Pb[0]/Hb[0]),10*np.log10(Pb[4]/Hb[4])))
rows=np.array(rows); np.save('barfeat.npy',rows)
print(' bar  start    rms | <120 120-300 300-1k 1-3k 3-8k >8k | P/H  cent  onset onsP  PHlow PHhi')
for r in rows: print(f'{int(r[0]):4d} {r[1]:7.3f} {r[3]:6.1f} | '+' '.join(f'{v:6.1f}' for v in r[4:10])+f' | {r[10]:5.1f} {r[11]:5.0f} {r[12]:5.2f} {r[13]:5.2f} {r[14]:5.1f} {r[15]:5.1f}')
