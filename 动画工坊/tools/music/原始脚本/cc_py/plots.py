import numpy as np, sys, matplotlib; matplotlib.use('Agg'); import matplotlib.pyplot as plt, librosa
sys.path.insert(0,'py'); from grid_def import *
d=np.load('feat.npz'); fr=int(d['sr'])/int(d['hop']); C=np.load('cqt12.npy')
NB=64  # music bars 1..64, bar 65 line = cut
bt=[max(0.0,bar_t(n)) for n in range(1,66)]
SECS=[('Intro A',0,18.717),('Intro B',18.717,33.092),('Lift',33.092,42.467),('Arrival',42.467,53.717),('Drive 1',53.717,68.717),('Drive 2',68.717,83.717),('Final build 1',83.717,98.717),('Final build 2',98.717,113.717),('Peak',113.717,119.342),('Tail',119.342,126.96)]
cols=['#4c78a8','#72b7b2','#54a24b','#eeca3b','#f58518','#e45756','#b279a2','#ff9da6','#9d755d','#bab0ac']
# bar features
pn=['C','C#','D','D#','E','F','F#','G','G#','A','A#','B']
def pc(lo,hi,a,b):
    v=C[lo:hi,int(a*fr):int(b*fr)].mean(1)**2; o=np.zeros(12)
    for j,e in enumerate(v): o[(lo+j)%12]+=e
    return o/ (np.linalg.norm(o)+1e-12)
mf=d['mfcc']
F_ch=np.array([pc(12,84,bt[i],bt[i+1]) for i in range(NB)])
F_tb=np.array([mf[1:14,int(bt[i]*fr):int(bt[i+1]*fr)].mean(1) for i in range(NB)])
F_bd=np.array([10*np.log10(d['bands'][:,int(bt[i]*fr):int(bt[i+1]*fr)].mean(1)+1e-12) for i in range(NB)])
def ssm(F):
    F=(F-F.mean(0))/(F.std(0)+1e-9); F=F/np.linalg.norm(F,axis=1,keepdims=True); return F@F.T
S_h=F_ch@F_ch.T; S_t=ssm(np.hstack([F_tb,F_bd]))
def novelty(S,k=4):
    g=np.outer(np.r_[-np.ones(k),np.ones(k)],np.r_[-np.ones(k),np.ones(k)])*-1
    n=len(S); out=np.zeros(n+1)
    for i in range(k,n-k+1):
        out[i]=-(S[i-k:i+k,i-k:i+k]*g).sum()
    return out
N_t=novelty(S_t); N_h=novelty(S_h)
np.savez('barssm.npz',S_h=S_h,S_t=S_t,N_t=N_t,N_h=N_h,bt=bt)
# ---- figure 1: overview
t=np.arange(C.shape[1])/fr
rms=20*np.log10(d['rms']+1e-9)
from scipy.ndimage import uniform_filter1d
fig,ax=plt.subplots(4,1,figsize=(22,15),sharex=True,gridspec_kw={'height_ratios':[3,1.6,1.2,1.2]})
ax[0].imshow(librosa.amplitude_to_db(C,ref=np.max),origin='lower',aspect='auto',extent=[0,t[-1],0,96],cmap='magma',vmin=-70,vmax=0)
ax[0].set_yticks(range(0,96,12)); ax[0].set_yticklabels([f'C{o+1}' for o in range(8)]); ax[0].set_title('Cornfield Chase: CQT, bar lines (white, 3/4 @96 BPM), chord-cycle starts (cyan), sections')
for n,x in enumerate(bt,1):
    ax[0].axvline(x,color='w',lw=0.4,alpha=0.5)
for x in [3.717,18.717,42.467,53.717,68.717,83.717,98.717,113.717]: ax[0].axvline(x,color='cyan',lw=1.5)
for (nm,a,b),c in zip(SECS,cols):
    for A in ax: A.axvspan(a,b,color=c,alpha=0.10)
    ax[1].text((a+b)/2,-8,nm,ha='center',fontsize=9)
lab=['<120','120-300','300-1k','1-3k','3-8k','>8k']
for i in range(6):
    v=10*np.log10(uniform_filter1d(d['bands'][i],int(fr*0.5))+1e-12); ax[1].plot(t,v,lw=1,label=lab[i])
ax[1].plot(t,uniform_filter1d(rms,int(fr*0.5))*1+60,color='k',lw=1.5,label='RMS dB +60')
ax[1].legend(ncol=7,fontsize=8,loc='upper left'); ax[1].set_ylabel('band energy dB'); ax[1].set_ylim(-45,50)
ax[2].plot(t,uniform_filter1d(d['on_full'],int(fr*0.3)),label='onset strength (0.3s mean)'); ax[2].plot(t,uniform_filter1d(d['on_perc'],int(fr*0.3)),label='percussive onset'); ax[2].legend(fontsize=8)
bc=np.array(bt[:-1])
ax[3].step(bt[:NB],N_t[:NB]/N_t.max(),where='post',label='timbre/energy novelty (bars)'); ax[3].step(bt[:NB],N_h[:NB]/N_h.max(),where='post',label='harmonic novelty (bars)'); ax[3].legend(fontsize=8)
for A in ax[1:]:
    for x in [3.717,18.717,33.092,42.467,53.717,68.717,83.717,98.717,113.717,119.342]: A.axvline(x,color='gray',lw=0.8,ls='--')
ax[3].set_xlabel('seconds'); ax[3].set_xticks(np.arange(0,128,5))
plt.tight_layout(); plt.savefig('plots/overview.png',dpi=60)
# ---- figure 2: SSMs
fig,ax=plt.subplots(1,2,figsize=(18,8.5))
for A,S,nm in [(ax[0],S_t,'timbre+band-energy SSM (bars)'),(ax[1],S_h,'chroma SSM (bars)')]:
    A.imshow(S,origin='lower',cmap='viridis',extent=[0.5,NB+0.5,0.5,NB+0.5]); A.set_title(nm)
    for b in [3,11,19,24,30,38,46,54,62]: A.axvline(b-0.5,color='w',lw=0.8); A.axhline(b-0.5,color='w',lw=0.8)
    A.set_xticks(range(1,NB+1,3)); A.set_yticks(range(1,NB+1,3)); A.set_xlabel('bar'); A.set_ylabel('bar')
plt.tight_layout(); plt.savefig('plots/ssm.png',dpi=60)
print('novelty top bars (timbre):',[ (int(i)+1, round(N_t[i]/N_t.max(),2)) for i in np.argsort(N_t)[::-1][:10]])
print('novelty top bars (harm):',[ (int(i)+1, round(N_h[i]/N_h.max(),2)) for i in np.argsort(N_h)[::-1][:10]])
