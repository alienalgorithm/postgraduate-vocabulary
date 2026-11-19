import numpy as np, soundfile as sf, librosa, sys
src=sys.argv[1]
x,sr=sf.read(src,dtype='float32'); y=x.mean(1)
y2=librosa.resample(y,orig_sr=sr,target_sr=22050,res_type='soxr_hq'); sr2=22050; hop=256
S=np.abs(librosa.stft(y2,n_fft=2048,hop_length=hop))
H,P=librosa.decompose.hpss(S,margin=1.0)
mel=librosa.feature.melspectrogram(S=S**2,sr=sr2,n_mels=128,fmax=11025)
C=np.abs(librosa.cqt(y2,sr=sr2,hop_length=hop,fmin=librosa.note_to_hz('C1'),n_bins=96,bins_per_octave=12))
chroma=librosa.feature.chroma_cqt(C=C,sr=sr2,hop_length=hop)
f=librosa.fft_frequencies(sr=sr2,n_fft=2048)
edges=[0,120,300,1000,3000,8000,11025]
bands=np.array([(S[(f>=a)&(f<b)]**2).sum(0) for a,b in zip(edges[:-1],edges[1:])])
Hb=np.array([(H[(f>=a)&(f<b)]**2).sum(0) for a,b in zip(edges[:-1],edges[1:])])
Pb=np.array([(P[(f>=a)&(f<b)]**2).sum(0) for a,b in zip(edges[:-1],edges[1:])])
rms=np.sqrt((S**2).sum(0))/1024
cent=librosa.feature.spectral_centroid(S=S,sr=sr2)[0]
flat=librosa.feature.spectral_flatness(S=S)[0]
mfcc=librosa.feature.mfcc(S=librosa.power_to_db(mel),n_mfcc=20)
on_full=librosa.onset.onset_strength(S=librosa.power_to_db(mel),sr=sr2,hop_length=hop)
on_perc=librosa.onset.onset_strength(S=librosa.power_to_db(librosa.feature.melspectrogram(S=P**2,sr=sr2,n_mels=128)),sr=sr2,hop_length=hop)
on_low=librosa.onset.onset_strength(S=librosa.power_to_db(mel[:24]),sr=sr2,hop_length=hop)
np.savez_compressed('feat.npz',sr=sr2,hop=hop,mel=mel.astype('float32'),C=C.astype('float32'),chroma=chroma.astype('float32'),bands=bands,Hb=Hb,Pb=Pb,rms=rms,cent=cent,flat=flat,mfcc=mfcc,on_full=on_full,on_perc=on_perc,on_low=on_low,edges=edges)
print('frames',S.shape, 'dur',len(y2)/sr2)
