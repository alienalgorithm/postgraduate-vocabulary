# usage: spec.py OUT.png file1 file2 ... -> stacked log-mel spectrograms (full length)
import sys, warnings; warnings.filterwarnings('ignore')
import numpy as np, librosa, librosa.display
import matplotlib; matplotlib.use('Agg'); import matplotlib.pyplot as plt
fs=sys.argv[2:]; fig,ax=plt.subplots(len(fs),1,figsize=(16,2.6*len(fs)))
for a,f in zip(np.atleast_1d(ax),fs):
    y,sr=librosa.load(f,sr=22050,mono=True)
    S=librosa.power_to_db(librosa.feature.melspectrogram(y=y,sr=sr,n_mels=96,hop_length=1024,fmax=10000),ref=np.max)
    librosa.display.specshow(S,sr=sr,hop_length=1024,x_axis='time',y_axis='mel',fmax=10000,ax=a,cmap='magma',vmin=-70)
    a.set_title(f.split('/')[-1],fontsize=9); a.set_xlabel(''); a.xaxis.set_major_locator(plt.MultipleLocator(10))
plt.tight_layout(); plt.savefig(sys.argv[1],dpi=70)
