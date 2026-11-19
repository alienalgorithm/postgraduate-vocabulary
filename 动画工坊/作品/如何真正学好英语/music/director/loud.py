# short-term loudness profile via ffmpeg ebur128; usage: loud.py file.wav [bar_meta.json]
import sys, subprocess, re, json, numpy as np
f=sys.argv[1]
r=subprocess.run(['ffmpeg','-hide_banner','-nostats','-loglevel','verbose','-i',f,'-af','ebur128=peak=true:framelog=verbose','-f','null','-'],capture_output=True,text=True).stderr
ts=[];S=[];M=[]
for line in r.splitlines():
    m=re.search(r't:\s*([\d.]+)\s+TARGET.*?M:\s*([-\d.]+)\s+S:\s*([-\d.]+)',line)
    if m: ts.append(float(m.group(1))); M.append(float(m.group(2))); S.append(float(m.group(3)))
ts=np.array(ts);S=np.array(S);M=np.array(M)
summ=r[r.rfind('Summary:'):]
print(' '.join(summ.split()))
secs=[('intro',0,30.66),('theme1',30.66,66.4),('breath',66.4,71.5),('theme2',71.5,107.2),('breakdown',107.2,121.0),('climax',122.6,168.6),('resolution',168.6,196.6),('ending',196.6,205)]
for n,a,b in secs:
    m=(ts>a+3)&(ts<=b)
    if m.sum(): print(f"{n:11s} {a:6.1f}-{b:6.1f}  S median {np.median(S[m]):6.1f}  S max {S[m].max():6.1f}  M max {M[(ts>a)&(ts<=b)].max():6.1f}")
