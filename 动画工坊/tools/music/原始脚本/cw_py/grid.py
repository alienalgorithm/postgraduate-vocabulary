import numpy as np, soundfile as sf, librosa, sys
x,sr=sf.read(sys.argv[1],dtype='float32'); y=x.mean(1)
hop=96  # 2 ms at 48k
S=librosa.feature.melspectrogram(y=y,sr=sr,n_fft=2048,hop_length=hop,n_mels=128,fmax=16000)
L=librosa.power_to_db(S,ref=np.max)
flux=np.maximum(0,np.diff(L,axis=1)).mean(0); flux=np.concatenate([[0],flux])
fr=sr/hop; t=np.arange(len(flux))/fr
# local normalisation (so quiet intro counts)
from scipy.ndimage import uniform_filter1d, maximum_filter1d
w=int(4*fr)
mu=uniform_filter1d(flux,w); sd=np.sqrt(uniform_filter1d((flux-mu)**2,w))+1e-6
z=np.clip((flux-mu)/sd,0,None)
np.savez('flux.npz',flux=flux,z=z,fr=fr)
def score(T,phi,a,b):
    k0=int(np.ceil((a-phi)/T)); k1=int((b-phi)/T)
    ts=phi+np.arange(k0,k1+1)*T
    return np.interp(ts*fr,np.arange(len(z)),z).mean()
def best(a,b,Ts):
    res=[]
    for T in Ts:
        phis=np.arange(0,T,0.001)
        sc=[score(T,p,a,b) for p in phis]
        i=int(np.argmax(sc)); res.append((sc[i],T,phis[i]))
    return max(res)
Ts=np.arange(0.150,0.163,0.0001)
g=best(2,119.3,Ts); print('global tatum',g)
T=g[1]
Ts2=np.arange(T-0.0004,T+0.0004,0.00001)
g2=best(2,119.3,Ts2); print('refined',g2, 'bpm(4 tatum/beat)',60/(4*g2[1]))
T=g2[1]; phi=g2[2]
# local phase check in 8 s windows with T fixed
for a in np.arange(0,119,8):
    b=min(a+8,119.3)
    phis=np.arange(0,T,0.0005); sc=[score(T,p,a,b) for p in phis]
    i=int(np.argmax(sc)); d=(phis[i]-phi+T/2)%T-T/2
    print(f'{a:5.0f}-{b:5.1f} best phase offset vs global {d*1000:+6.1f} ms  strength {sc[i]:.2f} (mean {np.mean(sc):.2f})')
