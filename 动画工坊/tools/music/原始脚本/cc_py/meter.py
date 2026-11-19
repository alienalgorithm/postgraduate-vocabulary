import numpy as np, librosa
d=np.load('feat.npz'); sr=int(d['sr']); hop=int(d['hop']); fr=sr/hop
chroma=d['chroma']; C=d['C']; n=chroma.shape[1]
B=0.625; b0=-0.033
beats=b0+np.arange(0,200)*B; beats=beats[beats<119.3]
def seg_mean(M,a,b):
    i0=max(0,int(a*fr)); i1=min(M.shape[1],int(b*fr)); return M[:,i0:i1].mean(1)
# chroma per beat (use middle 70% of beat to avoid smear)
cb=np.array([seg_mean(chroma,t+0.1*B,t+0.8*B) for t in beats[:-1]])
cbn=cb/np.linalg.norm(cb,axis=1,keepdims=True)
chg=1-np.sum(cbn[1:]*cbn[:-1],axis=1)   # change at beat k+1 (vs k)
idx=np.arange(1,len(cb))
# bass chroma (C1-C3) per beat
Cl=C[:36]; bass=np.array([seg_mean(Cl,t+0.1*B,t+0.8*B) for t in beats[:-1]])
bc=np.zeros((len(bass),12))
for i in range(36): bc[:,i%12]+=bass[:,i]
bcn=bc/np.linalg.norm(bc,axis=1,keepdims=True)
bchg=1-np.sum(bcn[1:]*bcn[:-1],axis=1)
def fold(v,idx,m,lo,hi):
    tt=beats[idx]; s=(tt>lo)&(tt<hi)
    return [float(np.mean(v[s][(idx[s]%m)==r])) for r in range(m)]
for lo,hi in [(0,33),(33,42),(42,84),(84,119.3),(42,119.3)]:
    print(f'{lo}-{hi} chroma-change by beat mod4',np.round(fold(chg,idx,4,lo,hi),3),' mod8',np.round(fold(chg,idx,8,lo,hi),3))
    print(f'{lo}-{hi}  bass-change  by beat mod4',np.round(fold(bchg,idx,4,lo,hi),3),' mod8',np.round(fold(bchg,idx,8,lo,hi),3))
# print beat-wise list of big bass changes
pn=['C','C#','D','D#','E','F','F#','G','G#','A','A#','B']
print('beat k, time, bass root, top chroma, chg')
for k in range(len(cb)):
    top=np.argsort(cb[k])[::-1][:3]
    print(k, f'{beats[k]:.3f}', pn[np.argmax(bc[k])], ''.join(pn[t]+' ' for t in top), f'{(chg[k-1] if k>0 else 0):.3f} {(bchg[k-1] if k>0 else 0):.3f}')
