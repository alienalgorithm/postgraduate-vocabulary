import numpy as np, soundfile as sf
C=np.load('cqt12.npy'); fr=22050/256
T=0.15625; b0=-0.033
# B section tatum-level CQT frames C4-B7, k from 53*4 to 68*4
ks=np.arange(53*4,68*4)
M=np.array([C[36:84,int((b0+k*T)*fr):int((b0+(k+1)*T)*fr)].mean(1) for k in ks])
M=np.log1p(M/M.max()*1000); M-=M.mean(0); M/=np.linalg.norm(M,axis=1,keepdims=True)
print('B lag sims (tatums):',' '.join(f'{L}:{np.mean(np.sum(M[L:]*M[:-L],1)):+.2f}' for L in range(1,33)))
# dominant pitch per tatum in B (C4-B6)
pn=['C','C#','D','D#','E','F','F#','G','G#','A','A#','B']
row=[]
for k in ks[:64]:
    v=C[36:72,int((b0+k*T)*fr):int((b0+(k+1)*T)*fr)].mean(1); i=np.argmax(v); row.append(f'{pn[i%12]}{4+i//12}')
for r in range(0,64,16): print(' '.join(row[r:r+16]))
# hit onset precise
x,sr=sf.read('../cw/dec48.wav',dtype='float32'); m=np.abs(x).max(1)
for a,b in [(42.2,42.7),(33.0,33.2),(119.0,119.6)]:
    seg=m[int(a*sr):int(b*sr)]; 
    w=int(0.002*sr); env=np.array([seg[i:i+w].max() for i in range(0,len(seg)-w,w)])
    edb=20*np.log10(env+1e-9); t=a+np.arange(len(env))*0.002
    if b<100:
        base=np.median(edb[:30]); j=np.argmax(edb>base+6); print(f'{a}-{b}: base {base:.1f} dB, first +6dB rise at {t[j]:.3f}s; max at {t[np.argmax(edb)]:.3f}')
    else:
        lvl=np.median(edb[:50]); j=np.where(edb<lvl-6)[0][0]; print(f'cut region: level {lvl:.1f}, first -6dB at {t[j]:.3f}s'); print(' '.join(f'{tt:.3f}:{e:.0f}' for tt,e in zip(t[::10],edb[::10])))
