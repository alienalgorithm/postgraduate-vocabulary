from lib import *
from render import render
from master import macro_curve, tp_env
import json, itertools
spec=json.load(open('../d2.json'))
# render with zero coda gain; apply gains analytically
for s in spec['segments']: s.pop('gain_db',None)
y0,info=render(spec)
n=len(y0); t=np.arange(n)/SR
coda=t>=121.217-0.001
k=kweight(y0); p=(k**2).sum(1)
env=tp_env(y0)
def design(gi,gl,gm,gc):
    pts=[[0,gi],[35.592,gi],[40.56,gl],[40.592,gl],[55.55,gm],[78.092,gm],[81.83,gm*0.5],[96.842,gm*0.5],[109.967,0.0]]
    g=macro_curve(n,pts); g[coda]=gc
    return g
def I_of(g):
    pp=p*10**(g/10)
    nb=int(0.4*SR); h=int(0.1*SR); c=np.cumsum(np.r_[0,pp])
    zs=(c[nb::h][:len(range(0,len(pp)-nb,h))]-c[0:len(pp)-nb:h])/nb
    l=-0.691+10*np.log10(zs+1e-20); g1=zs[l>-70]; rel=-0.691+10*np.log10(g1.mean())-10
    return -0.691+10*np.log10(zs[(l>-70)&(l>rel)].mean())
def st_max(g):
    pp=p*10**(g/10); nb=3*SR; c=np.cumsum(np.r_[0,pp])
    v=(c[nb::SR//10]-c[:len(c)-nb:SR//10][:len(c[nb::SR//10])])/nb
    return -0.691+10*np.log10(v.max())
for gi,gl,gm,gc in [(9,5.5,0,9),(7,4.5,0,7),(7,4.5,1.5,7),(8,5,1.5,8),(8,5,2,8),(6,4,1.5,6),(7,4.5,2.5,7),(6,4,0,6),(5,3,0,5)]:
    g=design(gi,gl,gm,gc); I=I_of(g); norm=-14-I
    tp=20*np.log10((env*10**(g/20)).max())+norm
    over=((env*10**((g+norm)/20))>10**(-1.2/20)).sum()/SR
    print(f'intro {gi} lift {gl} mid {gm} coda {gc}: I_pre {I:.2f} norm {norm:+.2f} TP_final {tp:+.2f} dBTP, ST max {st_max(g)+norm:.2f}, s over -1.2: {over:.2f}, intro ST ~ {-35+gi+norm:.1f}')
print('---')
for gi in (7.5,8,8.5):
    g=design(gi,5,0,gi); I=I_of(g); norm=-14-I
    a=env*10**((g+norm)/20); tpd=20*np.log10(a.max())
    idx=np.where(a>10**(-1.2/20))[0]/SR
    cl=[]
    for tt in idx:
        if not cl or tt-cl[-1][1]>0.05: cl.append([tt,tt])
        else: cl[-1][1]=tt
    print(gi, f'I_pre {I:.2f} norm {norm:+.2f} TP {tpd:+.2f}', len(cl), 'clusters', [round(c[0],2) for c in cl][:30])
