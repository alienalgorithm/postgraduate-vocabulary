import numpy as np, soundfile as sf, librosa, sys
p=sys.argv[1]
x,sr=sf.read(p,dtype='float32'); m=x.mean(1)
print('sr',sr,'len',len(m)/sr)
# per 0.5s RMS dB
hop=sr//2
for i in range(0,len(m),hop):
    seg=x[i:i+hop]; r=np.sqrt((seg**2).mean()+1e-20); pk=np.abs(seg).max()
    if i/sr<6 or i/sr>118 or int(i/sr)%2==0:
        print(f'{i/sr:6.1f} rms {20*np.log10(r):6.1f} pk {20*np.log10(pk+1e-20):6.1f}')
# tail: last nonzero sample etc
nz=np.where(np.abs(x).max(1)>0)[0]
print('first nonzero',nz[0]/sr,'last nonzero',nz[-1]/sr)
for th in [-40,-50,-60,-70,-80,-90]:
    a=np.where(np.abs(x).max(1)>10**(th/20))[0]
    print(th,'dB first',a[0]/sr,'last',a[-1]/sr)
