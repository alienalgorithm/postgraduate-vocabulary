import numpy as np, soundfile as sf, librosa, sys
x,sr=sf.read(sys.argv[1],dtype='float32'); y=x.mean(1)
y22=librosa.resample(y,orig_sr=sr,target_sr=22050); sr2=22050; hop=128
oenv=librosa.onset.onset_strength(y=y22,sr=sr2,hop_length=hop,aggregate=np.median)
fr=sr2/hop
np.save('oenv.npy',oenv)
for a,b in [(0,42),(42,84),(84,119.4),(0,119.4),(2,30)]:
    seg=oenv[int(a*fr):int(b*fr)]
    t=librosa.feature.tempo(onset_envelope=seg,sr=sr2,hop_length=hop,aggregate=None,start_bpm=100)
    tg=librosa.feature.tempo(onset_envelope=seg,sr=sr2,hop_length=hop,start_bpm=100)
    # autocorr peaks
    s=seg-seg.mean(); ac=np.correlate(s,s,'full')[len(s)-1:]; ac/=ac[0]
    lags=np.arange(len(ac))/fr
    cand=[(lags[i],ac[i]) for i in range(int(0.12*fr),int(6*fr)) if ac[i]>ac[i-1] and ac[i]>=ac[i+1] and ac[i]>0.1]
    cand=sorted(cand,key=lambda c:-c[1])[:12]
    print(f'{a}-{b}: tempo {tg[0]:.2f}', ' AC peaks', ', '.join(f'{l:.3f}s({v:.2f})' for l,v in sorted(cand)))
tb,beats=librosa.beat.beat_track(onset_envelope=oenv,sr=sr2,hop_length=hop,start_bpm=100,tightness=400)
bt=librosa.frames_to_time(beats,sr=sr2,hop_length=hop)
print('beat_track',tb, len(bt), np.round(bt[:12],3), np.round(np.diff(bt).mean(),4), np.round(np.diff(bt).std(),4))
