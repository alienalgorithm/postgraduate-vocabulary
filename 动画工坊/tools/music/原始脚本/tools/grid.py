# usage: grid.py ANALYSISDIR file:approxbpm ...  -> constant-tempo beat grid fit; updates <stem>.json with grid_*
import sys, os, json, warnings; warnings.filterwarnings('ignore')
import numpy as np, librosa
A=sys.argv[1]
def fold_score(t,w,P,nb=200):
    ph=(t%P)/P; h,_=np.histogram(ph,bins=nb,range=(0,1),weights=w)
    h=np.convolve(np.r_[h[-3:],h,h[:3]],np.hanning(7),'valid')
    i=int(np.argmax(h)); return h[i]/ (h.mean()+1e-9), (i+0.5)/nb*P
for arg in sys.argv[2:]:
    path,bpm0=arg.rsplit(':',1); bpm0=float(bpm0)
    y,sr=librosa.load(path,sr=22050,mono=True); hop=128
    o=librosa.onset.onset_strength(y=y,sr=sr,hop_length=hop)
    S=np.abs(librosa.stft(y,n_fft=2048,hop_length=hop)); fr=librosa.fft_frequencies(sr=sr,n_fft=2048)
    low=librosa.onset.onset_strength(S=librosa.amplitude_to_db(S[fr<180]),sr=sr,hop_length=hop)
    t=librosa.frames_to_time(np.arange(len(o)),sr=sr,hop_length=hop)
    # keep only peaks to sharpen
    pk=librosa.util.peak_pick(o,pre_max=3,post_max=3,pre_avg=20,post_avg=20,delta=np.std(o)*0.3,wait=5)
    tp,wp=t[pk],o[pk]
    best=(0,0,0)
    for bpm in np.arange(bpm0*0.96,bpm0*1.04,0.01):
        s,ph=fold_score(tp,wp,60/bpm)
        if s>best[0]: best=(s,bpm,ph)
    s,bpm,ph=best; P=60/bpm
    # halves check
    h1=fold_score(tp[tp<t[-1]/2],wp[tp<t[-1]/2],P); h2=fold_score(tp[tp>=t[-1]/2],wp[tp>=t[-1]/2],P)
    beats=np.arange(ph,t[-1],P)
    def env_at(e,ts): return e[np.clip(np.round(ts*sr/hop).astype(int),0,len(e)-1)]
    res={}
    for meter in (4,3):
        sc=[np.mean(env_at(low,beats[k::meter]))/np.mean(low)+0.5*np.mean(env_at(o,beats[k::meter]))/np.mean(o) for k in range(meter)]
        res[meter]=(max(sc)/np.mean(sc),int(np.argmax(sc)))
    k=res[4][1]; down=beats[k::4]
    stem=os.path.splitext(os.path.basename(path))[0]; jf=os.path.join(A,stem+'.json')
    d=json.load(open(jf)) if os.path.exists(jf) else {}
    d.update(grid_bpm=round(float(bpm),3),grid_beat_period=round(float(P),5),grid_first_beat=round(float(ph),4),
             grid_first_downbeat=round(float(down[0]),4),grid_bar=round(float(4*P),5),grid_fit=round(float(s),2),
             grid_fit_halves=[round(float(h1[0]),2),round(float(h2[0]),2)],grid_phase_drift_s=round(float(((h2[1]-h1[1]+P/2)%P)-P/2),4),
             meter_contrast={'4':round(float(res[4][0]),3),'3':round(float(res[3][0]),3)},
             grid_downbeats=[round(float(x),3) for x in down])
    json.dump(d,open(jf,'w'))
    print(f"{stem[:44]:44s} bpm {bpm:8.3f} beat0 {ph:6.3f} down0 {down[0]:6.3f} bar {4*P:7.4f} fit {s:5.2f} halves {h1[0]:.2f}/{h2[0]:.2f} drift {d['grid_phase_drift_s']*1000:+.0f}ms meter4 {res[4][0]:.3f} meter3 {res[3][0]:.3f}",flush=True)
