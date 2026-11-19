# onset strength on the 16th grid for given source bars (spectral flux, max within +-25 ms of each 16th)
import sys, numpy as np, scipy.signal as ss
SR=44100; BAR=240/94; OFF=0.3196; S16=BAR/16
y=np.load(sys.argv[1]); m=y.mean(1)
hop=128
f,t,Z=ss.stft(m,SR,nperseg=1024,noverlap=1024-hop)
L=np.log1p(1000*np.abs(Z)); fl=np.r_[0,np.maximum(0,np.diff(L,axis=1)).sum(0)]
t=t
# short-time level 20 ms
n=int(0.02*SR); lev=10*np.log10(np.convolve(m**2,np.ones(n)/n,'same')+1e-12)
for k in map(int,sys.argv[2:]):
    row=[]; lv=[]
    for i in range(16):
        tc=OFF+k*BAR+i*S16
        sel=(t>tc-0.025)&(t<tc+0.025)
        row.append(fl[sel].max())
        lv.append(lev[int((tc+0.06)*SR)])
    print('%2d '%k+' '.join('%4.0f'%v for v in row))
    print('   '+' '.join('%4.0f'%v for v in lv))
