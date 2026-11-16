import json,sys,numpy as np,soundfile as sf
O,N=sys.argv[1],sys.argv[2]
ao,sr=sf.read(O+'/work_68/a.wav',dtype='int16',always_2d=True); an,sr2=sf.read(N+'/work_68/a.wav',dtype='int16',always_2d=True)
assert sr==sr2
so=json.load(open(O+'/work_68/分段.json')); sn=json.load(open(N+'/work_68/分段.json'))
rng=lambda s,k:(s[k][0]['时刻'][0],s[k][-1]['时刻'][1])
print('sr',sr,'len old',len(ao)/sr,'new',len(an)/sr, 'channels',ao.shape[1])
res={}
for k in so:
    (a0,a1),(b0,b1)=rng(so,k),rng(sn,k)
    x=ao[round(a0*sr):round(a1*sr)]; y=an[round(b0*sr):round(b1*sr)]
    same = len(x)==len(y) and np.array_equal(x,y)
    res[k]=dict(old=[a0,a1],new=[b0,b1],samples_old=len(x),samples_new=len(y),identical=bool(same))
    print(k,a0,a1,b0,b1,len(x),len(y),'IDENTICAL' if same else 'DIFF')
# whole-file outside S2
s2o,s2n=rng(so,'S2'),rng(sn,'S2')
pre_o=ao[:round(s2o[0]*sr)]; pre_n=an[:round(s2n[0]*sr)]
post_o=ao[round(s2o[1]*sr):]; post_n=an[round(s2n[1]*sr):]
print('before S2 identical:',len(pre_o)==len(pre_n) and np.array_equal(pre_o,pre_n),len(pre_o))
print('after S2 identical:',len(post_o)==len(post_n) and np.array_equal(post_o,post_n),len(post_o))
res['_outside_S2']=dict(before_identical=bool(np.array_equal(pre_o,pre_n)),after_identical=bool(len(post_o)==len(post_n) and np.array_equal(post_o,post_n)),before_samples=len(pre_o),after_samples=len(post_o),sr=sr,S2_old=s2o,S2_new=s2n)
json.dump(res,open(sys.argv[3],'w'),indent=1)
