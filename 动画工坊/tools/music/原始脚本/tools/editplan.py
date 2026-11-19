# usage: editplan.py OUT.png plans.json -> per plan: original RMS with labeled sections + edited (concatenated segments, 1-bar equal-power xfade ignored) RMS with climax marker
import sys, json, warnings; warnings.filterwarnings('ignore')
import numpy as np, librosa
import matplotlib; matplotlib.use('Agg'); import matplotlib.pyplot as plt
plans=json.load(open(sys.argv[2])); fig,ax=plt.subplots(len(plans)*2,1,figsize=(16,3.0*len(plans)*2))
for k,p in enumerate(plans):
    y,sr=librosa.load(p['file'],sr=22050,mono=True); hop=512; r=librosa.feature.rms(y=y,hop_length=hop)[0]
    t=librosa.frames_to_time(np.arange(len(r)),sr=sr,hop_length=hop); db=20*np.log10(r/r.max()+1e-6)
    sm=lambda x,n=40: np.convolve(np.pad(x,(n,n),mode='edge'),np.hanning(2*n+1)/np.hanning(2*n+1).sum(),'valid')
    a=ax[2*k]; a.plot(t,sm(db),color='#c0392b',lw=1.4); a.set_ylim(-45,2); a.set_xlim(0,t[-1])
    for name,s,e in p['sections']:
        a.axvspan(s,e,alpha=.08,color='C%d'%(hash(name)%9)); a.axvline(s,color='#8e44ad',lw=.8); a.text(s+.5,-3,f'{name}\n{s:.2f}',fontsize=7,va='top')
    for s,e in p.get('cuts',[]): a.axvspan(s,e,color='k',alpha=.25)
    a.set_title(p['title']+'  |  original, grey = removed',fontsize=9)
    segs=p['segments']; parts=[]; off=0; amap=[]
    for s,e in segs:
        m=(t>=s)&(t<e); parts.append(db[m]); amap.append((s,e,off)); off+=e-s
    ed=np.concatenate(parts); te=np.arange(len(ed))*hop/sr; tot=off
    def map_t(x):
        for s,e,o in amap:
            if s<=x<e: return x-s+o
        return None
    b=ax[2*k+1]; b.plot(te,sm(ed),color='#16a085',lw=1.4); b.set_ylim(-45,2); b.set_xlim(0,max(tot,t[-1]))
    b.axvspan(tot*.65,tot*.80,color='gold',alpha=.15)
    for s,e,o in amap[1:]: b.axvline(o,color='k',ls='--',lw=1)
    c=map_t(p['climax_src']); b.axvline(c,color='orange',lw=2.5)
    b.set_title(f"edited: {len(segs)} segment(s), total {tot:.1f}s, 'aha' at {c:.2f}s = {c/tot:.0%} (gold = 65-80%)",fontsize=9)
    print(p['title'],'total',round(tot,2),'aha',round(c,2),f'{c/tot:.1%}')
plt.tight_layout(); plt.savefig(sys.argv[1],dpi=65)
