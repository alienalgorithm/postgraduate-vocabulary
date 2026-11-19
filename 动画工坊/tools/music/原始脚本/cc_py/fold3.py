import numpy as np
d=np.load('feat.npz'); fr=int(d['sr'])/int(d['hop'])
B=0.625; b0=-0.033
env=(d['on_full']/d['on_full'].mean()+d['on_low']/d['on_low'].mean()+d['on_perc']/d['on_perc'].mean())/3
ks=np.arange(0,192)
v=np.array([env[max(0,int((b0+k*B-0.03)*fr)):int((b0+k*B+0.06)*fr)].max() for k in ks])
for a in range(0,192,15):
    s=ks[(ks>=a)&(ks<a+15)]
    vv=v[s]; vv=vv/vv.mean()
    prof=[vv[(s%3)==p].mean() for p in range(3)]
    print(f'beats {a:3d}-{a+14:3d} ({b0+a*B:6.2f}s) m3 profile k%3=0,1,2: '+' '.join(f'{x:.2f}' for x in prof),'  argmax',int(np.argmax(prof)))
