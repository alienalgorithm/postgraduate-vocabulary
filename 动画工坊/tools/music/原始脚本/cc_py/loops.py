import numpy as np, sys, json, soundfile as sf, librosa
sys.path.insert(0,'py'); from grid_def import *
x,sr=sf.read('../cw/dec48.wav',dtype='float32'); assert sr==SR
m=x.mean(1)
hop=480; fr=SR/hop
M=librosa.power_to_db(librosa.feature.melspectrogram(y=m,sr=SR,n_fft=2048,hop_length=hop,n_mels=64,fmax=16000)+1e-10)
Cq=np.load('cqt12.npy'); frq=22050/256
def mel_mean(a,b): return M[:,max(0,int(a*fr)):max(int(a*fr)+1,int(b*fr))].mean(1)
def chroma(a,b):
    v=Cq[12:84,max(0,int(a*frq)):max(int(a*frq)+1,int(b*frq))].mean(1)**2; o=np.zeros(12)
    for j,e in enumerate(v): o[(12+j)%12]+=e
    return o/(np.linalg.norm(o)+1e-12)
def lvl(a,b):
    s=m[max(0,int(a*SR)):int(b*SR)]; return 10*np.log10((s**2).mean()+1e-12)
NBL=65
T=[max(0.0,bar_t(n)) for n in range(1,NBL+1)]   # bar line n -> T[n-1]
BAR=1.875; SH=0.4
feat={}
for n in range(1,NBL+1):
    t=T[n-1]
    f=dict(pre_s=mel_mean(t-SH,t) if t>SH else None, post_s=mel_mean(t,t+SH) if n<NBL else None,
           pre_l=mel_mean(t-BAR,t) if t>=BAR-0.05 else None, post_l=mel_mean(t,t+BAR) if n<NBL else None,
           cpre=chroma(t-BAR,t) if t>=BAR-0.05 else None, cpost=chroma(t,t+BAR) if n<NBL else None,
           lpre=lvl(t-SH,t) if t>SH else None, lpost=lvl(t,t+SH) if n<NBL else None)
    feat[n]=f
def specd(a,b): return float(np.sqrt(np.mean((a-b)**2)))
W=int(0.02*SR)
def rho(i,j):
    si=int(round(bar_t(i)*SR)); sj=int(round(bar_t(j)*SR))
    if si-W<0 or sj-W<0 or si+W>len(x) or sj+W>len(x): return 0.0
    a=x[si-W:si+W]; b=x[sj-W:sj+W]
    r=[np.dot(a[:,c],b[:,c])/np.sqrt(np.dot(a[:,c],a[:,c])*np.dot(b[:,c],b[:,c])+1e-12) for c in range(2)]
    return float(np.mean(r))
rows=[]
for i in range(2,NBL+1):          # out-point (bar line where we leave)
  for j in range(2,NBL):          # in-point (bar line we continue from); bar 1 line is before t=0 -> use 2+
    if i==j: continue
    fi,fj=feat[i],feat[j]
    if fi['pre_s'] is None or fj['pre_s'] is None: continue
    d_pre_s=specd(fi['pre_s'],fj['pre_s']); d_pre_l=specd(fi['pre_l'],fj['pre_l'])
    c_pre=float(np.dot(fi['cpre'],fj['cpre'])); c_post=float(np.dot(fi['cpost'],fj['cpost'])) if fi['cpost'] is not None else None
    if fi['post_s'] is not None:
        d_post_s=specd(fi['post_s'],fj['post_s']); d_post_l=specd(fi['post_l'],fj['post_l'])
        d_lvl=abs(fj['lpost']-fi['lpost'])
    else:   # out at the cut (bar 65): no natural continuation; compare level across seam only
        d_post_s=d_post_l=None; d_lvl=abs(fj['lpost']-fi['lpre'])
    r=rho(i,j)
    s_short=np.exp(-(np.mean([d for d in [d_pre_s,d_post_s] if d is not None]))/4)
    s_long=np.exp(-(np.mean([d for d in [d_pre_l,d_post_l] if d is not None]))/4)
    s_ch=np.clip((np.mean([c for c in [c_pre,c_post] if c is not None])-0.7)/0.3,0,1)
    s_lv=np.exp(-d_lvl/2); s_ph=(1+r)/2
    q=100*(0.25*s_short+0.2*s_long+0.25*s_ch+0.15*s_lv+0.15*s_ph)
    hm=harmonic_match(i,j)
    rows.append(dict(out_bar=i,in_bar=j,out_t=round(bar_t(i),3),in_t=round(bar_t(j),3),delta_s=round(bar_t(i)-bar_t(j),3),
        kind='loop' if j<i else 'skip',out_sec=section_of(i-1),in_sec=section_of(j),harmonic_match=bool(hm),
        d_spec_pre_short_db=round(d_pre_s,2),d_spec_post_short_db=None if d_post_s is None else round(d_post_s,2),
        d_spec_pre_bar_db=round(d_pre_l,2),d_spec_post_bar_db=None if d_post_l is None else round(d_post_l,2),
        chroma_pre=round(c_pre,3),chroma_post=None if c_post is None else round(c_post,3),level_jump_db=round(d_lvl,2),
        phase_rho=round(r,3),quality=round(float(q),1)))
json.dump(rows,open('pairs.json','w'),default=float)
L=[r for r in rows if r['kind']=='loop']
print('n pairs',len(rows))
def show(lst,k=25):
    for r in lst[:k]:
        print(f"out {r['out_bar']:2d}@{r['out_t']:7.3f} -> in {r['in_bar']:2d}@{r['in_t']:7.3f} (-{r['delta_s']:6.3f}s) {r['out_sec']:>8}->{r['in_sec']:<8} hm={int(r['harmonic_match'])} Q={r['quality']:5.1f} spec s/l pre {r['d_spec_pre_short_db']}/{r['d_spec_pre_bar_db']} post {r['d_spec_post_short_db']}/{r['d_spec_post_bar_db']} chroma {r['chroma_pre']}/{r['chroma_post']} lvl {r['level_jump_db']} rho {r['phase_rho']}")
print('--- top loops overall'); show(sorted(L,key=lambda r:-r['quality']),10)
print('--- top loops with harmonic match and length >= 8 bars'); show(sorted([r for r in L if r['harmonic_match'] and r['out_bar']-r['in_bar']>=2],key=lambda r:-r['quality']),45)
