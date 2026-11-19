# BS.1770 K-weighted loudness helpers (any sample rate) + section report
import numpy as np, scipy.signal as ss
def kfilter(fs):
    # pre-filter (high shelf) and RLB high-pass, coefficients per BS.1770 / libebur128 derivation
    f0=1681.974450955533; G=3.999843853973347; Q=0.7071752369554196
    K=np.tan(np.pi*f0/fs); Vh=10**(G/20); Vb=Vh**0.4996667741545416
    a0=1+K/Q+K*K
    b1=[(Vh+Vb*K/Q+K*K)/a0, 2*(K*K-Vh)/a0, (Vh-Vb*K/Q+K*K)/a0]; a1=[1, 2*(K*K-1)/a0, (1-K/Q+K*K)/a0]
    f0=38.13547087602444; Q=0.5003270373238773; K=np.tan(np.pi*f0/fs)
    b2=[1,-2,1]; a2=[1, 2*(K*K-1)/(1+K/Q+K*K), (1-K/Q+K*K)/(1+K/Q+K*K)]
    return (b1,a1),(b2,a2)
def kweight(x,fs):
    (b1,a1),(b2,a2)=kfilter(fs)
    return ss.lfilter(b2,a2,ss.lfilter(b1,a1,x,axis=0),axis=0)
def short_term(x,fs,win=3.0,hop=0.1):
    y=kweight(x,fs); p=(y**2).sum(1)
    c=np.r_[0,np.cumsum(p)]; n=int(win*fs); h=int(hop*fs)
    idx=np.arange(0,len(p)-n,h)
    ms=(c[idx+n]-c[idx])/n
    return (idx+n/2)/fs, -0.691+10*np.log10(ms+1e-20)
if __name__=='__main__':
    import sys
    x=np.load(sys.argv[1]); fs=int(sys.argv[2])
    secs=[(0,11.217,'s01'),(11.217,22.467,'s02'),(22.467,35.592,'s03'),(35.592,40.3,'s04a'),(40.3,55.592,'s04b breath'),(55.592,74.342,'s05'),(74.342,96.842,'s06'),(96.842,111.5,'s07 breakdown'),(111.842,117.4,'s08 climax'),(117.5,121.2,'tail'),(121.217,124.967,'s08 return'),(124.967,143.092,'s09'),(143.092,158.092,'s10a'),(158.092,165.6,'s10 card'),(165.6,169.3,'end')]
    tc,st=short_term(x,fs,3.0); tm,mo=short_term(x,fs,0.4)
    for a,b,nm in secs:
        m=(tc>=a+1.5)&(tc<=b-1.5) if b-a>3.5 else (tc>=a)&(tc<=b)
        mm=(tm>=a)&(tm<=b)
        print('%-16s %7.2f-%7.2f  S median %6.1f  max %6.1f | M max %6.1f min %6.1f'%(nm,a,b,np.median(st[m]) if m.any() else np.nan, st[m].max() if m.any() else np.nan, mo[mm].max(), mo[mm].min()))
