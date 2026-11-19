import sys, json, numpy as np, soundfile as sf, scipy.signal as ss
import matplotlib; matplotlib.use('Agg'); import matplotlib.pyplot as plt
from lib import *
z,_=sf.read(sys.argv[1],dtype='float64'); info=json.load(open(sys.argv[2])); out=sys.argv[3]
scenes=[('s01',0.0),('s02',11.217),('s03',22.467),('s04',35.592),('s05',55.592),('s06',74.342),('s07',96.842),('s08',111.842),('s09',124.967),('s10',143.092)]
t1,m=loud_curve(z,0.4,0.05); t3,s=loud_curve(z,3.0,0.1)
fig,(a,b)=plt.subplots(2,1,figsize=(16,7),sharex=True,gridspec_kw=dict(height_ratios=[1,1.3]))
a.plot(t1,m,lw=0.5,color='0.6',label='momentary'); a.plot(t3,s,lw=1.5,color='C3',label='short-term 3 s')
a.axhline(-14,color='k',ls=':',lw=0.8); a.set_ylim(-50,-4); a.set_ylabel('LUFS'); a.legend(loc='upper left',fontsize=8)
for sid,st in scenes:
    for ax in (a,b): ax.axvline(st,color='c',lw=0.8)
    a.text(st+0.3,-6,sid,fontsize=9,color='c')
for tt,lab in [(55.592,'burst'),(111.842,'AHA'),(117.467,'stop'),(121.217,'return'),(165.592,'F')]:
    a.axvline(tt,color='orange',ls='--',lw=0.8); a.text(tt+0.3,-47,lab,fontsize=8,color='orange')
for j in info['junctions']:
    a.plot([j['t']],[-10],'kv',ms=5)
f,tt,Z=ss.stft(z.mean(1)[::2],SR//2,nperseg=4096,noverlap=4096-1200)
fl=np.geomspace(40,11000,200); P=20*np.log10(np.abs(Z[np.searchsorted(f,fl)])+1e-7)
b.pcolormesh(tt,fl,P,shading='auto',cmap='magma',vmin=-110,vmax=-25); b.set_yscale('log'); b.set_ylabel('Hz'); b.set_xlabel('s')
fig.tight_layout(); fig.savefig(out,dpi=65)
print(out)
