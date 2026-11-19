import numpy as np, sys, json, soundfile as sf, librosa
sys.path.insert(0,'py'); from grid_def import *
from seamtest import splice, x
res={(r['out_bar'],r['in_bar']):r for r in json.load(open('seamtests.json'))}
pairs={(r['out_bar'],r['in_bar']):r for r in json.load(open('pairs.json'))}
hop=480
def logmel(sig): return librosa.power_to_db(librosa.feature.melspectrogram(y=sig.mean(1),sr=SR,n_fft=2048,hop_length=hop,n_mels=64,fmax=16000)+1e-10)
def nov(M,t,K):
    c=int(round(t*SR/hop)); k=int(round(K*SR/hop))
    if c-k<0 or c+k>M.shape[1]: return np.nan
    return float(np.sqrt(np.mean((M[:,c-k:c].mean(1)-M[:,c:c+k].mean(1))**2)))
MX=logmel(x)
nat_bars=[n for n in range(4,64) if n not in (19,20,23,24,25,46)]
natS=np.array([nov(MX,bar_t(n),0.3) for n in nat_bars]); natL=np.array([nov(MX,bar_t(n),1.875) for n in nat_bars])
print('natural bar-line novelty (0.3s / 1 bar) median %.2f/%.2f p90 %.2f/%.2f max %.2f/%.2f'%(np.median(natS),np.median(natL),np.percentile(natS,90),np.percentile(natL,90),natS.max(),natL.max()))
sel=list(res.keys())
out={}
for (i,j) in sel:
    r=res[(i,j)]; L=r['best_xfade']['length_s']; place=r['best_xfade']['placement']; law='power' if r['best_xfade']['law']=='equal-power' else 'gain'
    y,a0,n=splice(i,j,L,place,law)
    s=(a0+n//2)/SR if place=='center' else (a0+n+int(0.01*SR))/SR   # seam reference = the bar line position in output
    s=bar_t(i)   # in output timeline the out bar line stays at its original time
    MY=logmel(y[int((s-6)*SR):int((s+6)*SR)])
    vS=nov(MY,6.0,0.3); vL=nov(MY,6.0,1.875)
    oS=nov(MX,bar_t(i),0.3); oL=nov(MX,bar_t(i),1.875)
    jS=nov(MX,bar_t(j),0.3); jL=nov(MX,bar_t(j),1.875)
    pS=float((natS<vS).mean()*100); pL=float((natL<vL).mean()*100)
    # peak / clipping check in a +-2 s window
    w=y[int((s-2)*SR):int((s+2)*SR)]; pk=20*np.log10(np.abs(w).max()+1e-12)
    d2=np.abs(np.diff(w,axis=0)).max()
    out[f'{i}->{j}']=dict(seam_novelty_short_db=round(vS,2),seam_novelty_bar_db=round(vL,2),natural_at_out_bar_short=round(oS,2),natural_at_out_bar_bar=round(oL,2),natural_at_in_bar_short=round(jS,2),natural_at_in_bar_bar=round(jL,2),
        pct_vs_natural_short=round(pS,1),pct_vs_natural_bar=round(pL,1),peak_dbfs=round(pk,2),max_step=round(float(d2),4))
    print(f'{i:2d}->{j:2d} Q={pairs[(i,j)]["quality"]:5.1f} seam nov {vS:4.2f}/{vL:4.2f} dB (natural at out-bar {oS:4.2f}/{oL:4.2f}) pct-vs-natural {pS:5.1f}/{pL:5.1f}  peak {pk:5.1f} dBFS maxstep {d2:.4f}')
json.dump(dict(natural=dict(short_median=float(np.median(natS)),bar_median=float(np.median(natL)),short_p90=float(np.percentile(natS,90)),bar_p90=float(np.percentile(natL,90))),cands=out),open('verify.json','w'),indent=1)
# baseline max sample step in original (to judge clicks)
print('original max sample step overall', float(np.abs(np.diff(x,axis=0)).max()))
