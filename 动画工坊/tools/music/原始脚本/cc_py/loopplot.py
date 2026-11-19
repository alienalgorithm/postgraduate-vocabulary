import json, numpy as np, matplotlib; matplotlib.use('Agg'); import matplotlib.pyplot as plt, soundfile as sf
from matplotlib.patches import Arc
m=json.load(open('../cc_map.json'))
x,sr=sf.read('../cw/dec48.wav',dtype='float32'); w=int(0.1*sr); k=len(x)//w
rms=10*np.log10((x[:k*w].reshape(k,w,2)**2).mean(axis=(1,2))+1e-12); t=np.arange(k)*0.1
cols=['#4c78a8','#72b7b2','#54a24b','#eeca3b','#f58518','#e45756','#b279a2','#ff9da6','#9d755d','#bab0ac']
fig,ax=plt.subplots(2,1,figsize=(22,11),gridspec_kw={'height_ratios':[2.2,1]})
A=ax[0]
A.plot(t,rms,color='k',lw=1)
for s,c in zip(m['sections'],cols):
    A.axvspan(s['start'],s['end'],color=c,alpha=0.18); A.text((s['start']+s['end'])/2,-62,s['name'],ha='center',fontsize=10)
for b in m['bars']:
    A.axvline(max(0,b['start']),color='gray',lw=0.3,alpha=0.6)
    if b['n']%2==1 and b['n']<65: A.text(max(0,b['start'])+0.1,-66,str(b['n']),fontsize=6,color='gray')
for c in m['chord_changes']: A.text(c['t']+0.1,-5,c['chord'],fontsize=7,color='navy')
A.axvline(m['climax'],color='red',lw=2); A.text(m['climax']+0.3,-3,'climax 113.717',color='red')
A.axvline(m['burst'],color='darkorange',lw=2); A.text(m['burst']+0.3,-3,'burst 42.467',color='darkorange')
A.axvline(119.342,color='k',lw=1.5,ls='--'); A.text(119.6,-12,'hard stop\n119.342',fontsize=8)
A.set_ylim(-68,0); A.set_xlim(0,127); A.set_ylabel('RMS dBFS (0.1 s)'); A.set_title('Cornfield Chase: sections, bars (3/4, 96 BPM), chord changes, and graded loop / skip candidates (arcs: out-point -> in-point)')
B=ax[1]; B.set_xlim(0,127); B.set_ylim(0,1.15); B.set_yticks([])
show=[c for c in m['loop_candidates'] if c['grade'] in ('A','B')]+[c for c in m['skip_candidates'] if c['grade']=='A']
gc={'A':'#1a9850','B':'#fdae61'}
for c in show:
    a,b=sorted([c['in_t'],c['out_t']]); mid=(a+b)/2; wdt=b-a; h=min(1.0,0.12+wdt/40)
    style='-' if c['in_t']<c['out_t'] else '--'
    B.add_patch(Arc((mid,0),wdt,2*h,theta1=0,theta2=180,color=gc[c['grade']],lw=2,ls=style))
    B.text(mid,h+0.01,f"{c['out_bar']}->{c['in_bar']} {c['grade']}",ha='center',fontsize=7)
for s,c in zip(m['sections'],cols): B.axvspan(s['start'],s['end'],color=c,alpha=0.12)
B.set_xlabel('seconds (solid arc = loop back, dashed = skip forward; green A, orange B)'); B.set_xticks(np.arange(0,128,5))
plt.tight_layout(); plt.savefig('plots/loops.png',dpi=60)
