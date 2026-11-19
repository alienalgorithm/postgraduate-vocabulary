import numpy as np, sys, json, soundfile as sf, librosa
from scipy.ndimage import uniform_filter1d
wav,mp=sys.argv[1],sys.argv[2]; m=json.load(open(mp))
y,sr=sf.read(wav,dtype='float32')
hop=96; fr=sr/hop
S=librosa.feature.melspectrogram(y=y.mean(1),sr=sr,n_fft=2048,hop_length=hop,n_mels=128,fmax=16000); L=librosa.power_to_db(S,ref=np.max)
flux=np.r_[0,np.maximum(0,np.diff(L,axis=1)).mean(0)]
w=int(4*fr); mu=uniform_filter1d(flux,w); sd=np.sqrt(uniform_filter1d((flux-mu)**2,w))+1e-6; z=np.clip((flux-mu)/sd,0,None)
T=0.15625
def phase(a,b):
    phis=np.arange(0,T,0.0005); best=None
    for p in phis:
        ts=p+np.arange(int(np.ceil((a-p)/T)),int((b-p)/T)+1)*T; v=np.interp(ts*fr,np.arange(len(z)),z).mean()
        if best is None or v>best[0]: best=(v,p)
    return best[1]
mus=m['music_end']; res=[]
for a in np.arange(44,mus-4,4.0):
    res.append(phase(a,a+4))
res=np.array(res)*1000
print(f"{wav}: total {m['total']} s; tatum-grid phase in 4-s windows after 44 s: median {np.median(res):.1f} ms, IQR {np.percentile(res,25):.1f}-{np.percentile(res,75):.1f} ms (expected about 123 ms if the 96-BPM grid is unbroken)")
print('  windows off by >40 ms:',int((np.abs(((res-123)+78)%156-78)>40).sum()),'of',len(res))
print('  junctions:',[(j['out_time'],f"{j['out_bar']}->{j['in_bar']}",j['harmonic_match']) for j in m['junctions']],' warnings:',m['warnings'])
print('  peak',m['peak_dbfs'],'dBFS  max sample step',m['max_sample_step'],'(source max 0.162)')
