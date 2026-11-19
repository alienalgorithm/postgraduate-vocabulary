# usage: specimg.py file out.png t0 t1 [grid_offset bar]
import sys, warnings; warnings.filterwarnings('ignore')
import numpy as np, librosa, librosa.display
import matplotlib; matplotlib.use('Agg'); import matplotlib.pyplot as plt
p,out,t0,t1=sys.argv[1],sys.argv[2],float(sys.argv[3]),float(sys.argv[4])
y,sr=librosa.load(p,sr=22050,mono=True,offset=t0,duration=t1-t0)
S=librosa.amplitude_to_db(np.abs(librosa.stft(y,n_fft=2048,hop_length=256)),ref=np.max)
fig,ax=plt.subplots(2,1,figsize=(22,9),gridspec_kw={'height_ratios':[3,1]},sharex=True)
librosa.display.specshow(S,sr=sr,hop_length=256,x_axis='time',y_axis='log',ax=ax[0],vmin=-80,vmax=0,cmap='magma')
t=np.arange(len(y))/sr
rms=librosa.feature.rms(y=y,hop_length=256)[0]; tr=np.arange(len(rms))*256/sr
ax[1].plot(tr,20*np.log10(rms+1e-6)); ax[1].set_ylim(-60,0)
if len(sys.argv)>6:
    off,bar=float(sys.argv[5]),float(sys.argv[6])
    k0=int(np.ceil((t0-off)/bar)); 
    for k in range(k0,k0+int((t1-t0)/bar)+2):
        x=off+k*bar-t0
        if 0<=x<=t1-t0:
            for a in ax: a.axvline(x,color='cyan' if k%4==0 else 'w',lw=0.8 if k%4 else 1.6,alpha=0.7)
            ax[0].text(x+0.05,8000,str(k),color='w',fontsize=8)
ticks=np.arange(0,t1-t0,5); ax[1].set_xticks(ticks); ax[1].set_xticklabels([f"{t0+x:.0f}" for x in ticks])
plt.tight_layout(); plt.savefig(out,dpi=60)
