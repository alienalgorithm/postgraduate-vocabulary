import numpy as np
C=np.load('cqt12.npy'); fr=22050/256
T=0.15625; b0=-0.033
def tatframes(lo,hi,a,b):
    ts=b0+np.arange(int(np.ceil((a-b0)/T)),int((b-b0)/T))*T
    M=np.array([C[lo:hi,int(t*fr):int((t+T)*fr)].mean(1) for t in ts])
    M=np.log1p(M/ M.max()*1000)
    M=M-M.mean(0)
    return M/(np.linalg.norm(M,axis=1,keepdims=True)+1e-9)
for lo,hi,name in [(36,84,'C4-B7 mid/high'),(0,36,'C1-B3 low')]:
  for a,b in [(8,33),(33.2,42.3),(44,84),(84,119.2)]:
    M=tatframes(lo,hi,a,b)
    out=[]
    for L in [1,2,3,4,6,8,12,16,18,20,24,32,36,48,64,72,96]:
        if L<len(M): out.append(f'{L}:{np.mean(np.sum(M[L:]*M[:-L],1)):+.2f}')
    print(f'{name:14s} {a}-{b}: '+' '.join(out))
