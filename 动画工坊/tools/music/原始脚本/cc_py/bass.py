import numpy as np, soundfile as sf, librosa
x,sr=sf.read('../cw/dec48.wav',dtype='float32'); y=x.mean(1)
y2=librosa.resample(y,orig_sr=sr,target_sr=22050,res_type='soxr_hq'); sr2=22050; hop=256; fr=sr2/hop
C=np.abs(librosa.cqt(y2,sr=sr2,hop_length=hop,fmin=librosa.note_to_hz('C1'),n_bins=96,bins_per_octave=12,tuning=0.0))
np.save('cqt12.npy',C.astype('float32'))
pn=['C','C#','D','D#','E','F','F#','G','G#','A','A#','B']
B=0.625; b0=-0.033
beats=b0+np.arange(0,192)*B
def pcs(lo,hi,t):
    i0=max(0,int((t+0.08)*fr)); i1=int((t+B-0.05)*fr)
    v=C[lo:hi,i0:i1].mean(1)**2; out=np.zeros(12)
    for j,e in enumerate(v): out[(lo+j)%12]+=e
    return out
rows=[]
for k,t in enumerate(beats):
    if t>119.4: break
    b=pcs(0,30,t)   # C1..F#3
    m=pcs(36,60,t)  # C4..B5
    bs=np.argsort(b)[::-1]; ms=np.argsort(m)[::-1]
    rows.append((k,t,pn[bs[0]],pn[bs[1]],b[bs[1]]/b[bs[0]],''.join(pn[i]+' ' for i in ms[:4])))
for bar in range(0,48):
    r=rows[bar*4:bar*4+4]
    if not r: break
    print(f'bar{bar+1:3d} {r[0][1]:7.3f}s  bass '+' '.join(f'{q[2]:>2}' for q in r)+'   mid '+' | '.join(q[5] for q in r))
