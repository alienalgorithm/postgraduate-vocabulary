import numpy as np, sys, json, soundfile as sf, librosa
from scipy.signal import butter, sosfiltfilt
sys.path.insert(0,'py'); from grid_def import *
x,sr=sf.read('../cw/dec48.wav',dtype='float32')
sos=butter(4,6000,'hp',fs=SR,output='sos')
def splice(i,j,L,place,law):
    """play x up to bar line i, continue from bar line j. Crossfade length L s.
    place='center': xfade [t-L/2,t+L/2]; 'pre': xfade [t-L-0.01, t-0.01]"""
    si=int(round(bar_t(i)*SR)); sj=int(round(bar_t(j)*SR)); n=int(round(L*SR))
    off=-n//2 if place=='center' else -n-int(0.01*SR)
    a0=si+off; b0=sj+off          # crossfade starts here in out/in signals
    ph=(np.arange(n)+0.5)/n
    if law=='power': fo,fi=np.cos(ph*np.pi/2),np.sin(ph*np.pi/2)
    else: fo,fi=1-ph,ph
    A=x[:a0]; X=x[a0:a0+n]*fo[:,None]+x[b0:b0+n]*fi[:,None]; Bp=x[b0+n:]
    y=np.concatenate([A,X,Bp]); return y,a0,n   # seam region in y: [a0, a0+n)
def env(sig,win):
    w=int(win*SR); k=len(sig)//w; s=sig[:k*w].reshape(k,w,-1); return 10*np.log10((s**2).mean(axis=(1,2))+1e-12)
def melflux(sig):
    M=librosa.power_to_db(librosa.feature.melspectrogram(y=sig.mean(1),sr=SR,n_fft=1024,hop_length=240,n_mels=64,fmax=16000)+1e-10)
    return np.r_[0,np.maximum(0,np.diff(M,axis=1)).mean(0)],M
def metrics(y,a0,n,i,j):
    """compare rendered seam with the two original contexts (out side around bar i, in side around bar j)"""
    si=int(round(bar_t(i)*SR)); sj=int(round(bar_t(j)*SR))
    seam_c=a0+n//2                     # centre of crossfade in y
    W=int(1.0*SR)
    def win(sig,c): return sig[max(0,c-W):c+W]
    oc=a0-(a0-si) if False else None
    # aligned windows: rendered around seam; out-original around same relative point; in-original likewise
    rel=seam_c-a0                      # offset of seam centre from crossfade start
    o_c=si+(a0-si)+rel; i_c=sj+(a0-si)+rel   # same relative position in originals
    Y=win(y,seam_c); O=win(x,o_c); I=win(x,i_c)
    m=min(len(Y),len(O),len(I)); Y,O,I=Y[:m],O[:m],I[:m]
    eY,eO,eI=env(Y,0.01),env(O,0.01),env(I,0.01)
    c=len(eY)//2; h=max(3,int(n/SR/0.01/2)+3)
    seg=slice(c-h,c+h)
    lo=np.minimum(eO,eI)[seg]; hi=np.maximum(eO,eI)[seg]; ey=eY[seg]
    from scipy.ndimage import uniform_filter1d
    ey=uniform_filter1d(ey,2); lo=uniform_filter1d(lo,2); hi=uniform_filter1d(hi,2)
    dip=float(max(0,np.max(lo-ey))); bump=float(max(0,np.max(ey-hi)))
    fY,MY=melflux(Y); fO,MO=melflux(O); fI,MI=melflux(I)
    cf=len(fY)//2; hf=int((n/SR/2+0.03)*SR/240)+1
    flux_ratio=float(fY[cf-hf:cf+hf].max()/max(fO[cf-hf:cf+hf].max(),fI[cf-hf:cf+hf].max(),1e-9))
    hY=sosfiltfilt(sos,Y.mean(1)); hO=sosfiltfilt(sos,O.mean(1)); hI=sosfiltfilt(sos,I.mean(1))
    def e1(s): w=int(0.001*SR); k=len(s)//w; return 10*np.log10((s[:k*w].reshape(k,w)**2).mean(1)+1e-14)
    a,b,cc=e1(hY),e1(hO),e1(hI); c1=len(a)//2; h1=int(n/SR/2*1000)+8
    click=float(a[c1-h1:c1+h1].max()-max(b[c1-h1:c1+h1].max(),cc[c1-h1:c1+h1].max()))
    # spectral jump across seam vs natural change at bar i in original
    q=int(0.3*SR/240)
    def jump(M,c): return float(np.sqrt(np.mean((M[:,c-q:c].mean(1)-M[:,c:c+q].mean(1))**2)))
    sj_=jump(MY,cf)-max(jump(MO,cf),jump(MI,cf))
    return dict(dip_db=round(dip,2),bump_db=round(bump,2),flux_ratio=round(flux_ratio,3),click_db=round(click,2),spec_jump_excess_db=round(sj_,2))
def passes(mt): return mt['dip_db']<=1.5 and mt['bump_db']<=1.5 and mt['flux_ratio']<=1.15 and mt['click_db']<=1.0 and mt['spec_jump_excess_db']<=1.5
if __name__=='__main__':
    allp=json.load(open('pairs.json'))
    cands=[(r['out_bar'],r['in_bar']) for r in allp if r['kind']=='loop' and r['harmonic_match'] and r['quality']>=48]
    cands+=[(r['out_bar'],r['in_bar']) for r in allp if r['kind']=='loop' and r['in_sec']=='lift' and r['out_sec']=='lift' and r['out_bar']<=23]
    cands+=[(11,24),(19,24),(18,24),(30,46),(38,46),(30,54),(38,54),(24,46),(62,11),(62,3),(54,11),(46,11),(65,11),(11,3),(19,11)]
    cands=list(dict.fromkeys(cands))
    pairs={(r['out_bar'],r['in_bar']):r for r in json.load(open('pairs.json'))}
    res=[]
    for (i,j) in cands:
        best=None
        for L in [0.04,0.156,0.3125,0.625]:
            for place in ['center','pre']:
                for law in ['power','gain']:
                    y,a0,n=splice(i,j,L,place,law); mt=metrics(y,a0,n,i,j)
                    bad=mt['dip_db']+mt['bump_db']+5*max(0,mt['flux_ratio']-1)+max(0,mt['click_db'])+max(0,mt['spec_jump_excess_db'])
                    if best is None or bad<best[0]: best=(bad,L,place,law,mt)
        bad,L,place,law,mt=best
        p=pairs.get((i,j),{})
        r=dict(out_bar=i,in_bar=j,out_t=round(bar_t(i),3),in_t=round(bar_t(j),3),delta_s=round(bar_t(i)-bar_t(j),3),
               quality=p.get('quality'),best_xfade=dict(length_s=L,placement=place,law=('equal-power' if law=='power' else 'equal-gain')),seam=mt,seam_pass=passes(mt),seam_badness=round(bad,2))
        res.append(r)
        print(f"{i:2d}->{j:2d} ({bar_t(i):7.3f}->{bar_t(j):7.3f}, d={bar_t(i)-bar_t(j):7.3f}) Q={p.get('quality')}  best L={L} {place:6s} {law:5s} {mt} pass={passes(mt)}")
    json.dump(res,open('seamtests.json','w'),indent=1)
