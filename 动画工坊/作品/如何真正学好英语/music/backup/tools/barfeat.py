# per-bar features of the EV source: levels by band, beat-level RMS, chroma top notes
import sys, numpy as np, scipy.signal as ss
SR=44100; BAR=240/94; OFF=0.3196
y=np.load(sys.argv[1]); m=y.mean(1)
def band(x,lo,hi):
    if lo<=0: sos=ss.butter(4,hi,'low',fs=SR,output='sos')
    elif hi>=SR/2: sos=ss.butter(4,lo,'high',fs=SR,output='sos')
    else: sos=ss.butter(4,[lo,hi],'band',fs=SR,output='sos')
    return ss.sosfiltfilt(sos,x)
lo=band(m,0,150); mid=band(m,150,2000); hi=band(m,2000,22000)
names=['C','C#','D','D#','E','F','F#','G','G#','A','A#','B']
def db(x): return 10*np.log10((x**2).mean()+1e-20)
nb=int((len(m)/SR-OFF)/BAR)+1
for k in range(-1,nb):
    a=int((OFF+k*BAR)*SR); b=int((OFF+(k+1)*BAR)*SR); a=max(a,0); b=min(b,len(m))
    if b-a<1000: continue
    seg=m[a:b]
    # beat rms
    beats=[db(seg[int(i*len(seg)/4):int((i+1)*len(seg)/4)]) for i in range(4)]
    F=np.abs(np.fft.rfft(seg*np.hanning(len(seg)))); f=np.fft.rfftfreq(len(seg),1/SR)
    sel=(f>60)&(f<2000); pc=np.zeros(12)
    midi=69+12*np.log2(f[sel]/440); np.add.at(pc,np.round(midi).astype(int)%12,F[sel]**2)
    top=[names[i] for i in np.argsort(pc)[::-1][:4]]
    print('%3d %6.2f  all %6.1f lo %6.1f mid %6.1f hi %6.1f  beats %s  %s'%(k,OFF+k*BAR,db(seg),db(lo[a:b]),db(mid[a:b]),db(hi[a:b]),' '.join('%5.1f'%v for v in beats),' '.join(top)))
