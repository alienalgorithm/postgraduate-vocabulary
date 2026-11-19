import json, numpy as np
from lib import *
from render import render
from seams import check
X=src()
def pw(sig,t,f,win=0.08):
    a=int((t-win/2)*SR); b=int((t+win/2)*SR); s=f(sig[a:b]); return (s**2).mean()
FS=[lambda s:s[:,0],lambda s:s[:,1],lambda s:(s[:,0]+s[:,1])/2,lambda s:(s[:,0]-s[:,1])/2]
def dev(y,info,j):
    T=j['t']; xs,xe=j['xf_start'],j['xf_end']; n=xe-xs; worst=0
    for f in FS:
        for t in np.linspace(xs,xe,9):
            u=np.clip((t-xs)/n,0,1); th=u*np.pi/2
            pa=pw(X,t-T+j['src_out'],f); pb=pw(X,t-T+j['src_in'],f)
            ex=np.cos(th)**2*pa+np.sin(th)**2*pb; d=10*np.log10(pw(y,t,f)/ex)
            worst=max(worst,abs(d))
    return worst
def scan(i,jb,lens,ctx=3):
    for L in lens:
        spec={"segments":[{"bars":[max(1,i-ctx),i]},{"bars":[jb,jb+ctx]}],"xf":{"1":{"len":L,"place":"pre","pre_ms":10}}}
        y,info=render(spec); r,_=check(y,info,verbose=False); r=r[0]
        print(f"{i}->{jb} {L*1000:5.0f} ms: worst 80ms dev {dev(y,info,info['junctions'][0]):.2f} dB | dip {r['dip']:.2f} bump {r['bump']:.2f} fs {r['flux_s']:.2f}({r['pct_s']:.0f}) fb {r['flux_b']:.2f}({r['pct_b']:.0f})")
import sys
for a in sys.argv[1:]:
    i,jb=map(int,a.split('-')); scan(i,jb,[0.156,0.234,0.3125,0.39,0.47,0.625,0.9375])
