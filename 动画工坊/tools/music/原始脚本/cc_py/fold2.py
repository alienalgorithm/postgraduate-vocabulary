import numpy as np
d=np.load('feat.npz'); fr=int(d['sr'])/int(d['hop'])
B=0.625; b0=-0.033
rng=np.random.default_rng(0)
for name in ['on_full','on_perc','on_low']:
    env=d[name]
    for a,b in [(44,84),(84,119.2),(3,33)]:
        ks=np.arange(int(np.ceil((a-b0)/B)),int((b-b0)/B))
        v=np.array([env[int((b0+k*B-0.03)*fr):int((b0+k*B+0.06)*fr)].max() for k in ks]); v=v/v.mean()
        out=[]
        for m in [2,3,4,6,8]:
            prof=np.array([v[(ks%m)==p].mean() for p in range(m)])
            # null: shuffle
            null=[]
            for _ in range(200):
                vv=rng.permutation(v); null.append(np.std([vv[(ks%m)==p].mean() for p in range(m)]))
            z=(prof.std()-np.mean(null))/np.std(null)
            out.append(f'm{m}: z={z:+.1f} prof[{" ".join(f"{x:.2f}" for x in prof)}]')
        print(f'{name} {a}-{b}: '+' ; '.join(out))
