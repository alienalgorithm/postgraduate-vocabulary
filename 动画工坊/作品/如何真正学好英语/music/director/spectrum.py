import sys, warnings; warnings.filterwarnings('ignore')
import numpy as np, subprocess
for p in sys.argv[1:]:
    raw=subprocess.run(['ffmpeg','-v','error','-i',p,'-ac','1','-ar','44100','-f','f32le','-'],capture_output=True).stdout
    y=np.frombuffer(raw,np.float32)
    n=8192; w=np.hanning(n)
    X=np.zeros(n//2+1)
    for i in range(0,len(y)-n,n*4): X+=np.abs(np.fft.rfft(y[i:i+n]*w))**2
    f=np.fft.rfftfreq(n,1/44100)
    db=10*np.log10(X/X.max()+1e-20)
    out=[]
    for fc in [500,1000,2000,4000,6000,8000,10000,12000,14000,15000,16000,17000,18000,19000,20000]:
        m=(f>fc*0.95)&(f<fc*1.05); out.append(f"{fc//1000 if fc>=1000 else fc/1000:g}k:{db[m].mean():.0f}")
    print(p.split('/')[-1][:40].ljust(40),' '.join(out))
