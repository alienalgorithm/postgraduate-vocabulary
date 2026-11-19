# usage: python3 -I analyze.py OUTDIR file1.mp3 file2.mp3 ...
# writes OUTDIR/<stem>.json and OUTDIR/<stem>.png ; prints a one-line summary per track
import sys, os, json, warnings
warnings.filterwarnings('ignore')
import numpy as np, librosa
import matplotlib; matplotlib.use('Agg'); import matplotlib.pyplot as plt

def smooth(x, n):
    n=max(1,int(n)); k=np.hanning(n*2+1); k/=k.sum()
    return np.convolve(np.pad(x,(n,n),mode='edge'),k,mode='valid')

def analyze(path, outdir):
    stem=os.path.splitext(os.path.basename(path))[0]
    y,sr=librosa.load(path,sr=22050,mono=True)
    dur=len(y)/sr
    hop=512; fps=sr/hop
    oenv=librosa.onset.onset_strength(y=y,sr=sr,hop_length=hop)
    tempo,beats=librosa.beat.beat_track(onset_envelope=oenv,sr=sr,hop_length=hop,trim=False)
    tempo=float(np.atleast_1d(tempo)[0])
    bt=librosa.frames_to_time(beats,sr=sr,hop_length=hop)
    # downbeat phase: low-band onset (kick/bass) + full onset, choose phase of 4
    S=np.abs(librosa.stft(y,hop_length=hop))
    freqs=librosa.fft_frequencies(sr=sr)
    low=librosa.onset.onset_strength(S=librosa.amplitude_to_db(S[freqs<200]),sr=sr,hop_length=hop)
    def at(env,fr): fr=np.clip(fr,0,len(env)-1); return env[fr]
    sc=[]
    for ph in range(4):
        idx=beats[ph::4]
        sc.append(np.mean(at(low,idx))/ (np.mean(low)+1e-9) + 0.5*np.mean(at(oenv,idx))/(np.mean(oenv)+1e-9))
    ph=int(np.argmax(sc)); downs=bt[ph::4]
    bar=float(np.median(np.diff(downs))) if len(downs)>2 else 240/tempo
    # energy
    rms=librosa.feature.rms(S=S,frame_length=2048,hop_length=hop)[0]
    rdb=librosa.amplitude_to_db(rms,ref=np.max(rms))
    rsm=smooth(rdb,fps*1.5)
    osm=smooth(oenv,fps*1.5); osm=osm/(osm.max()+1e-9)
    t=librosa.frames_to_time(np.arange(len(rms)),sr=sr,hop_length=hop)
    # sections: beat-synced chroma+mfcc+rms, agglomerative, snapped to downbeats
    chroma=librosa.feature.chroma_cqt(y=y,sr=sr,hop_length=hop)
    mfcc=librosa.feature.mfcc(y=y,sr=sr,hop_length=hop,n_mfcc=13)
    F=np.vstack([librosa.util.normalize(chroma,axis=0),mfcc/ (np.std(mfcc,axis=1,keepdims=True)+1e-9),(rdb[None,:len(chroma[0])]/10)])
    Fs=librosa.util.sync(F,beats,aggregate=np.median)
    k=int(np.clip(round(dur/24)+1,4,12))
    bnd=librosa.segment.agglomerative(Fs,k)
    btimes=librosa.frames_to_time(librosa.util.fix_frames(beats,x_min=0)[bnd],sr=sr,hop_length=hop)
    snapped=sorted(set([0.0]+[float(downs[np.argmin(np.abs(downs-b))]) for b in btimes if b>2]+[dur]))
    secs=[]
    for a,b in zip(snapped[:-1],snapped[1:]):
        if b-a<1: continue
        m=(t>=a)&(t<b)
        secs.append({'start':round(a,3),'end':round(b,3),'rms_db':round(float(np.mean(rdb[m])),1),'onset':round(float(np.mean(osm[m])),2)})
    # climax: max of 8s-smoothed rms, ignoring last 5% / first 5%
    r8=smooth(rdb,fps*4)
    m=(t>dur*0.05)&(t<dur*0.97)
    ci=np.argmax(np.where(m,r8,-1e9)); climax=float(t[ci])
    # biggest rise (build into a drop): max positive diff of 2s-smoothed rms over 4s
    r2=smooth(rdb,fps*1.0); lag=int(fps*4)
    rise=r2[lag:]-r2[:-lag]; rise[:int(fps*10)]=-99; rise[-int(fps*6):]=-99; ri=int(np.argmax(rise)); rise_t=float(t[ri+lag]); rise_db=float(rise[ri])
    # vocal hint: harmonic-ness in 300-3400Hz not decisive; skip
    cent=float(np.mean(librosa.feature.spectral_centroid(S=S,sr=sr)))
    q=[float(np.mean(rdb[(t>=dur*a)&(t<dur*b)])) for a,b in [(0,.25),(.25,.5),(.5,.75),(.75,1)]]
    res={'file':os.path.basename(path),'duration':round(dur,3),'bpm':round(tempo,2),'beat_offset':round(float(downs[0]),3) if len(downs) else 0,
         'bar':round(bar,4),'downbeat_phase':ph,'beats':[round(float(x),3) for x in bt],'downbeats':[round(float(x),3) for x in downs],
         'sections':secs,'climax_s':round(climax,2),'climax_frac':round(climax/dur,3),'biggest_rise_s':round(rise_t,2),'biggest_rise_db':round(rise_db,1),
         'quarter_rms_db':[round(x,1) for x in q],'centroid_hz':round(cent),
         'rms_curve_2hz':[round(float(x),1) for x in rsm[::int(fps/2)]]}
    json.dump(res,open(os.path.join(outdir,stem+'.json'),'w'))
    # plot
    fig,ax=plt.subplots(2,1,figsize=(16,6.5),sharex=True,gridspec_kw={'height_ratios':[3,1]})
    ax[0].plot(t,rdb,color='#bbb',lw=0.3); ax[0].plot(t,rsm,color='#c0392b',lw=1.6,label='RMS dB (1.5s)')
    ax[0].plot(t,r8,color='#2c3e50',lw=1,ls='--',label='RMS dB (4s)')
    ax[0].plot(t,osm*30-45,color='#27ae60',lw=1,label='onset strength (scaled)')
    for s in secs:
        ax[0].axvline(s['start'],color='#8e44ad',lw=1)
        ax[0].text(s['start']+0.5,-2,f"{s['start']:.0f}s\n{s['rms_db']}",fontsize=7,va='top',color='#8e44ad')
    ax[0].axvline(climax,color='orange',lw=2.5,alpha=.7,label=f'climax {climax:.1f}s ({climax/dur:.0%})')
    ax[0].axvline(rise_t,color='blue',lw=1.5,ls=':',label=f'biggest rise {rise_t:.1f}s (+{rise_db:.0f}dB)')
    ax[0].axvspan(dur*.65,dur*.80,color='gold',alpha=.12)
    ax[0].set_ylim(-48,1); ax[0].legend(loc='lower center',fontsize=7,ncol=5); ax[0].set_ylabel('dB')
    ax[0].set_title(f"{stem}  |  {dur:.1f}s  {tempo:.1f} BPM  bar {bar:.3f}s  first downbeat {downs[0]:.2f}s",fontsize=10)
    for d in downs: ax[1].axvline(d,color='#999',lw=0.4)
    ax[1].plot(t,smooth(low,fps*0.5)/ (low.max()+1e-9),color='#34495e',lw=0.6)
    ax[1].set_ylabel('low-band onset\n+ bar lines',fontsize=7); ax[1].set_xlabel('s')
    ax[1].set_xticks(np.arange(0,dur,10))
    plt.tight_layout(); plt.savefig(os.path.join(outdir,stem+'.png'),dpi=80); plt.close()
    print(f"{stem[:48]:48s} {dur:6.1f}s {tempo:6.1f}bpm bar{bar:5.2f} climax {climax:6.1f}s ({climax/dur:.0%}) rise {rise_t:6.1f}s +{rise_db:4.1f}dB quarters {q[0]:.0f}/{q[1]:.0f}/{q[2]:.0f}/{q[3]:.0f} cent {cent:.0f} secs {len(secs)}",flush=True)

out=sys.argv[1]; os.makedirs(out,exist_ok=True)
for p in sys.argv[2:]:
    try: analyze(p,out)
    except Exception as e: print('ERR',p,e)
