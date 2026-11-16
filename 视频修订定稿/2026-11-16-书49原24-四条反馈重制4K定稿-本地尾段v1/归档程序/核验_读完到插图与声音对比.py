import subprocess, numpy as np, imageio_ffmpeg, sys
FF=imageio_ffmpeg.get_ffmpeg_exe()
def pcm(p):
    r=subprocess.run([FF,'-v','error','-i',p,'-map','0:a:0','-ac','1','-ar','48000','-f','f32le','-'],capture_output=True,check=True).stdout
    return np.frombuffer(r,np.float32).astype(np.float64)
def vend(x):
    hop=240;n=len(x)//hop;st=max(0,n-1000);pw=(x[:n*hop].reshape(n,hop)**2).sum(1)/hop;e={}
    for t in(-60,-70,-80):
        idx=[i for i in range(st,n) if pw[i]>10**(t/10)]; e[t]=(idx[-1]+1)*hop/48000
    return max(e.values()),e
new,old=sys.argv[1],sys.argv[2]
a=pcm(new); b=pcm(old)
E,e=vend(a); print('new voice_end',E,e,'len',len(a)/48000)
Eo,eo=vend(b); print('old voice_end',Eo,eo,'len',len(b)/48000)
# frames: thumbnails
r=subprocess.run([FF,'-v','error','-i',new,'-vf','scale=96:54','-f','rawvideo','-pix_fmt','gray','-'],capture_output=True,check=True).stdout
fr=np.frombuffer(r,np.uint8).reshape(-1,54,96).astype(float); print('frames',len(fr))
d=[np.abs(fr[i]-fr[i-1]).mean() for i in range(1,len(fr))]
ch=[i for i in range(1,len(fr)) if d[i-1]>2]; print('scene changes (last 6):',ch[-6:])
ill=ch[-2]; summ=ch[-1]; print('illustration start frame',ill,ill/30,'summary',summ,'gap voice->ill',ill/30-E)
ref=fr[int(np.ceil(E*30))-1]; print('hold MAE max', max(np.abs(fr[i]-ref).mean() for i in range(int(np.ceil(E*30)),ill)))
for T in (142.0,142.255,144.0,148.9):
    n=int(T*48000); print('max |new-old| before',T,'s:',np.abs(a[:n]-b[:n]).max())
n=int(142.0*48000); print('first diff sample s:', (np.nonzero(np.abs(a[:len(b)]-b[:len(a)])>1e-6)[0][:1]/48000))
