# compare each joint in the edit with the equivalent natural transitions in the source
import sys, json, numpy as np, scipy.signal as ss
sr=44100
src=np.load('work/ev_src.npy'); ed=np.load(sys.argv[1]); meta=json.load(open(sys.argv[2]))
OFF=0.3196; BAR=240/94
def tools(y):
    mono=y.mean(1)
    f,tt,Z=ss.stft(mono,sr,nperseg=2048,noverlap=2048-256); A=np.abs(Z)+1e-9; L=20*np.log10(A); hop=256/sr
    def feat(tb):
        i=int(round(tb/hop)); w=int(0.2/hop); band=(f>60)&(f<12000)
        pre=L[:,i-w:i-1].mean(1); post=L[:,i+1:i+w].mean(1)
        return np.sqrt(((pre[band]-post[band])**2).mean()), 10*np.log10((A[:,i+1:i+w]**2).sum(0).mean()/(A[:,i-w:i-1]**2).sum(0).mean())
    def env(tb,pre,post):
        a=int((tb-pre-0.15)*sr); b=int((tb+post+0.15)*sr); seg=mono[a:b]; n=int(0.01*sr)
        r=20*np.log10(np.sqrt(np.convolve(seg**2,np.ones(n)/n,'valid'))+1e-12)
        return r[int(0.15*sr):-int(0.15*sr)].min()-max(np.median(r[:int(0.1*sr)]),np.median(r[-int(0.1*sr):])) , r[int(0.15*sr):-int(0.15*sr)].min()-min(np.median(r[:int(0.1*sr)]),np.median(r[-int(0.1*sr):]))
    return feat,env
fe,ee=tools(ed); fs,es=tools(src)
t=lambda k: OFF+k*BAR
eq={0:[3,7],1:[8,24],2:[58,60]}
for i,j in enumerate(meta['joints']):
    d,l=fe(j['joint_s']); e=ee(j['joint_s'],j['pre'],j['post'])
    print(f"JOINT {j['joint_s']:.3f}: change {d:.2f} dB, step {l:+.1f} dB, window min vs louder edge {e[0]:+.1f}, vs quieter edge {e[1]:+.1f}")
    for k in eq[i]:
        d,l=fs(t(k)); e=es(t(k),j['pre'],j['post'])
        print(f"   natural src bar {k-1}->{k}: change {d:.2f} dB, step {l:+.1f} dB, window min vs louder edge {e[0]:+.1f}, vs quieter edge {e[1]:+.1f}")
# raw correlation of the joint-2 windows
x=src
p1=int(round(t(24)*sr)); a0=int(round(t(8)*sr)); pre=int(0.64*sr); post=int(0.015*sr)
o=x[p1-pre:p1+post].mean(1); i_=x[a0-pre:a0+post].mean(1)
print('raw rho joint2', np.corrcoef(o,i_)[0,1], 'levels out/in dB', 10*np.log10((o**2).mean()), 10*np.log10((i_**2).mean()))
