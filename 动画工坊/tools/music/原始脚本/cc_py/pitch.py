import numpy as np, soundfile as sf, librosa
x,sr=sf.read('../cw/dec48.wav',dtype='float32'); y=x.mean(1)
y2=librosa.resample(y,orig_sr=sr,target_sr=22050,res_type='soxr_hq'); sr2=22050
print('tuning (fraction of bin):',librosa.estimate_tuning(y=y2,sr=sr2))
pn=['C','C#','D','D#','E','F','F#','G','G#','A','A#','B']
# high-res spectrum peaks per section
for a,b in [(2,32),(33,42),(43,84),(85,119)]:
    seg=y2[int(a*sr2):int(b*sr2)]
    S=np.abs(librosa.stft(seg,n_fft=16384,hop_length=4096))**2
    p=S.mean(1); f=librosa.fft_frequencies(sr=sr2,n_fft=16384)
    m=(f>40)&(f<2000); pf=p[m]; ff=f[m]
    from scipy.signal import find_peaks
    pk,_=find_peaks(10*np.log10(pf+1e-12),prominence=6)
    top=pk[np.argsort(pf[pk])[::-1][:14]]
    out=[]
    for i in sorted(top):
        midi=69+12*np.log2(ff[i]/440); n=int(round(midi)); out.append(f'{ff[i]:.1f}Hz {pn[n%12]}{n//12-1}({(midi-n)*100:+.0f}c,{10*np.log10(pf[i]/pf[top].max()):.0f}dB)')
    print(f'{a}-{b}:',', '.join(out))
# chroma totals with 36-bin cqt -> chroma
C=np.abs(librosa.cqt(y2,sr=sr2,hop_length=512,fmin=librosa.note_to_hz('C1'),n_bins=288,bins_per_octave=36,tuning=0.0))
ch=librosa.feature.chroma_cqt(C=C,sr=sr2,bins_per_octave=36,n_chroma=12,tuning=0.0)
fr=sr2/512
for a,b in [(2,32),(33,42),(43,84),(85,119),(0,119.3)]:
    v=ch[:,int(a*fr):int(b*fr)].mean(1); v=v/v.max()
    print(f'{a}-{b} chroma', ' '.join(f'{pn[i]}:{v[i]:.2f}' for i in range(12)))
    # KS key
    maj=np.array([6.35,2.23,3.48,2.33,4.38,4.09,2.52,5.19,2.39,3.66,2.29,2.88]); mnr=np.array([6.33,2.68,3.52,5.38,2.60,3.53,2.54,4.75,3.98,2.69,3.34,3.17])
    sc=[(np.corrcoef(v,np.roll(maj,k))[0,1],pn[k]+' major') for k in range(12)]+[(np.corrcoef(v,np.roll(mnr,k))[0,1],pn[k]+' minor') for k in range(12)]
    sc.sort(reverse=True); print('   key',[(n,round(s,3)) for s,n in sc[:4]])
