# score candidate bar-line seams X->Y (play bar X, then bar Y): compare the audio around the end of X
# (= start of X+1) with the audio around the start of Y. corr = waveform correlation of +-W windows,
# sd = log-spectral distance (dB) of +-W windows, pre/post separately.
import sys, numpy as np
SR=44100; BAR=240/94; OFF=0.3196
y=np.load(sys.argv[1]); m=y.mean(1)
def line(k): return int(round((OFF+k*BAR)*SR))
W=int(0.25*SR)
def spec(seg):
    F=np.abs(np.fft.rfft(seg*np.hanning(len(seg))))**2
    f=np.fft.rfftfreq(len(seg),1/SR)
    edges=np.geomspace(60,12000,25); out=[]
    for a,b in zip(edges[:-1],edges[1:]): out.append(10*np.log10(F[(f>=a)&(f<b)].sum()+1e-12))
    return np.array(out)
def score(X,Y):
    a=line(X+1); b=line(Y)
    r=[]
    for s0,s1 in ((-W,0),(0,W)):
        u=m[a+s0:a+s1]; v=m[b+s0:b+s1]
        c=float(np.dot(u,v)/np.sqrt(np.dot(u,u)*np.dot(v,v)+1e-20))
        sd=float(np.sqrt(((spec(u)-spec(v))**2).mean()))
        r+= [c,sd]
    return r
pairs=[tuple(map(int,p.split('-'))) for p in sys.argv[2:]]
for X,Y in pairs:
    c1,s1,c2,s2=score(X,Y)
    print('%2d->%2d  pre corr %+.2f sd %5.1f dB | post corr %+.2f sd %5.1f dB'%(X,Y,c1,s1,c2,s2))
