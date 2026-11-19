import numpy as np
d=np.load('feat.npz'); fr=int(d['sr'])/int(d['hop'])
T=0.15625; b0=-0.033
def tatval(env,t): 
    i0=int((t-0.03)*fr); i1=int((t+0.06)*fr); return env[max(0,i0):i1].max()
for name in ['on_full','on_low','on_perc']:
    env=d[name]
    for a,b,ref in [(0,33,0),(44,119.2,2),(44,84,2),(84,119.2,2)]:
        # tatum index relative to cycle start: cycle of 24 tatums (6 beats), phase so chord change = 0
        ks=np.arange(int(np.ceil((a-b0)/T)),int((b-b0)/T))
        vals=np.array([tatval(env,b0+k*T) for k in ks])
        pos=(ks-ref*4)%24
        prof=np.array([vals[pos==p].mean() for p in range(24)]); prof/=prof.mean()
        s=' '.join(('|' if p%4==0 else '')+f'{prof[p]:.2f}' for p in range(24))
        print(f'{name:8s} {a:5.1f}-{b:5.1f} 6-beat fold: {s}')
