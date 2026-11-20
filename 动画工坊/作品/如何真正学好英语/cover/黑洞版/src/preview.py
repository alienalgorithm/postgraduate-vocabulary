import sys, json, numpy as np
from PIL import Image
cfg = json.load(open(sys.argv[1])); W, H = cfg['W'], cfg['H']
a = np.fromfile(sys.argv[2], dtype=np.float32).reshape(H, W, 3)[::-1]
exp = float(sys.argv[4]) if len(sys.argv) > 4 else 1.0
x = a*exp
x = x/(1+x)  # reinhard
x = np.clip(x, 0, 1)**(1/2.2)
Image.fromarray((x*255+0.5).astype(np.uint8)).save(sys.argv[3])
print('max', a.max(), 'mean', a.mean(), 'p99', np.percentile(a, 99.5))
