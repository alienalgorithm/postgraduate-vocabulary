# Find HF transients in score.wav that do not exist at the matching place in the source (= edit artefacts)
import json, numpy as np, soundfile as sf, scipy.signal as ss
meta=json.load(open('work/edit_meta.json'))
y,sr=sf.read('score.wav',dtype='float64'); src=np.load('work/ev_src.npy'); sr0=44100
def spikes(x, fs, thr_db=18):
    sos=ss.butter(6,7000,'hp',fs=fs,output='sos'); h=ss.sosfilt(sos,x.mean(1))
    n=int(0.002*fs); e=10*np.log10(np.convolve(h**2,np.ones(n)/n,'same')+1e-16)
    hop=int(0.001*fs); e=e[::hop]                       # 1 ms grid
    from scipy.ndimage import median_filter
    med=median_filter(e,size=401)
    r=e-med
    pk,_=ss.find_peaks(r,height=thr_db,distance=20)
    return pk*hop/fs, r[pk], e[pk]
to,ro,eo=spikes(y,sr); ts,rs,es=spikes(src,sr0)
# map output time -> source time
segs=meta['segments']; joints=[0.0]+[j['joint_s'] for j in meta['joints']]
starts=[]; pos=0.0
for i,sg in enumerate(segs):
    o0 = 0.0 if i==0 else meta['joints'][i-1]['joint_s']
    starts.append((o0, sg['src0']))
def o2s(t):
    k=max(i for i,(o0,_) in enumerate(starts) if o0<=t)
    return starts[k][1]+(t-starts[k][0])
bad=[]
for t,r,e in zip(to,ro,eo):
    st=o2s(t)
    near=np.abs(ts-st)
    ok = len(near) and near.min()<0.006
    if not ok and e>-100: bad.append((round(t,3),round(st,3),round(r,1),round(e,1)))
print('HF spikes in score.wav:',len(to),' in source:',len(ts))
print('spikes with no source counterpart (t_out, t_src, ratio dB, level dB):',len(bad))
for b in bad[:30]: print('  ',b)
print("joints:",[round(j,3) for j in joints[1:]]); print("source spikes:",[(round(a,3),round(b,1),round(c,1)) for a,b,c in zip(ts,rs,es)])
