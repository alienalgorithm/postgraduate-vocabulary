#!/usr/bin/env python3
"""Cut / loop Cornfield Chase at bar lines and write the edited audio plus its timing map.
usage: python3 cc_edit.py plan.json out.wav out_map.json
plan.json: {"segments": [[in_bar, out_bar], ...]}   bar numbers from cc_map.json; out_bar is the bar line where
           playback leaves (exclusive); the last segment may use "end" (= keep the original hard stop + reverb tail).
           optional "fade_out_s": seconds of equal-power fade at the very end.
           optional "xfades": {"<out_bar>-><in_bar>": {"length_s":..,"placement":"center|pre","law":"equal-power|equal-gain"}}
Every junction is crossfaded at the bar line; default crossfade = the best one measured in cc_map loop/skip tests,
otherwise 0.156 s equal-power ending 10 ms before the bar line. Audio is not normalised (mastering is a later step)."""
import sys, os, json, numpy as np, soundfile as sf
HERE=os.path.dirname(os.path.abspath(__file__)); ROOT=os.path.dirname(HERE)
MAP=json.load(open(os.path.join(os.path.dirname(ROOT),'cc_map.json')))
SR=48000
SRC=os.path.join(ROOT,'..','cw','dec48.wav') if os.path.exists(os.path.join(ROOT,'..','cw','dec48.wav')) else None
def load_src():
    p=SRC
    if p is None or not os.path.exists(p):
        p=os.path.join(ROOT,'dec48.wav')
        if not os.path.exists(p):
            os.system(f"ffmpeg -v error -y -i '{os.path.join(os.path.dirname(ROOT),'user','cornfield_chase.mp3')}' -ar 48000 -c:a pcm_f32le '{p}'")
    x,sr=sf.read(p,dtype='float32'); assert sr==SR; return x
BARS={b['n']:b for b in MAP['bars']}
def bt(n): return BARS[n]['start']
def label(n): b=BARS.get(n); return None if b is None else (b['chord'],b.get('chord_bar'))
TESTED={}
for c in MAP['loop_candidates']+MAP.get('skip_candidates',[])+MAP.get('dramatic_joins',[]):
    TESTED[(c['out_bar'],c['in_bar'])]=c
def xfade_for(i,j,plan):
    k=f'{i}->{j}'
    if k in plan.get('xfades',{}): return plan['xfades'][k]
    if (i,j) in TESTED and 'xfade' in TESTED[(i,j)]: return TESTED[(i,j)]['xfade']
    return {'length_s':0.156,'placement':'pre','law':'equal-power'}
def main(plan_path,out_wav,out_map):
    plan=json.load(open(plan_path)); x=load_src(); segs=plan['segments']
    y=np.zeros((0,2),np.float32); junctions=[]; out_bars=[]; warn=[]
    pos_src=None   # source sample where the current segment's audio continues from
    for k,(a,b) in enumerate(segs):
        sa=max(0,int(round(bt(a)*SR)))
        sb=len(x) if b=='end' else int(round(bt(b)*SR))
        if b=='end' and k!=len(segs)-1: raise SystemExit('"end" only allowed on the last segment')
        if k==0:
            y=x[sa:sb].copy(); offset=0.0-max(0.0,bt(a)) if a==1 else -bt(a)
            seg_out_start=0.0
        else:
            i=segs[k-1][1]; j=a
            xf=xfade_for(i,j,plan); n=int(round(xf['length_s']*SR))
            off=-n//2 if xf['placement']=='center' else -n-int(0.01*SR)
            ph=(np.arange(n)+0.5)/n
            fo,fi=(np.cos(ph*np.pi/2),np.sin(ph*np.pi/2)) if xf['law']=='equal-power' else (1-ph,ph)
            # y currently ends exactly at the out bar line (source sample si); extend it with the out side's own audio for the crossfade tail
            si=int(round(bt(i)*SR)); sj=int(round(bt(j)*SR))
            cut=len(y)+off                     # output index where crossfade starts
            out_tail=x[si+off:si+off+n]        # out-side audio under the fade-out
            in_head=x[sj+off:sj+off+n]
            y=np.concatenate([y[:cut],out_tail*fo[:,None]+in_head*fi[:,None],x[sj+off+n:sb]])
            seg_out_start=junctions_time=(cut-off)/SR
            hm=label(i)==label(j) and label(i-1)==label(j-1)
            if not hm: warn.append(f'junction {i}->{j}: chord context differs ({label(i-1)},{label(i)}) vs ({label(j-1)},{label(j)})')
            t=TESTED.get((i,j))
            junctions.append(dict(out_time=round(seg_out_start,3),src_out=round(bt(i),3),src_in=round(bt(j),3),out_bar=i,in_bar=j,xfade=xf,harmonic_match=bool(hm),
                                  tested_score=None if t is None else t.get('score'),seam_pass=None if t is None else t.get('seam_pass')))
            offset=seg_out_start-bt(j)
        last=(b if b!='end' else 65)
        for n in range(a,last):
            ts=bt(n)+offset
            out_bars.append(dict(n=len(out_bars)+1,start=round(max(0.0,ts),3),true_start=round(ts,3),src_bar=n,beats=BARS[n]['beats'],chord=BARS[n]['chord'],section=BARS[n]['section']))
        music_end=bt(last)+offset
    fo=float(plan.get('fade_out_s',0))
    if fo>0:
        n=int(fo*SR); y[-n:]*=np.cos((np.arange(n)+0.5)/n*np.pi/2)[:,None]
    elif segs[-1][1]!='end': warn.append('last segment ends on a bar line without fade (set "fade_out_s" in the plan, or end with "end")')
    dur=len(y)/SR
    beats=[round(b_['true_start']+q*MAP['beat'],3) for b_ in out_bars for q in range(b_['beats']) if b_['true_start']+q*MAP['beat']>=0]
    secs=[]
    for b_ in out_bars:
        if not secs or secs[-1]['src']!=b_['section'] or abs(secs[-1]['end']-b_['true_start'])>1e-3:
            secs.append(dict(name=b_['section'],src=b_['section'],start=b_['start'],end=None))
        secs[-1]['end']=round(b_['true_start']+b_['beats']*MAP['beat'],3)
    for s in secs: s.pop('src')
    peakbar=[b_ for b_ in out_bars if b_['src_bar']==MAP['climax_bar']]
    burst=[b_ for b_ in out_bars if b_['src_bar']==MAP['burst_bar']]
    m=dict(source='Hans Zimmer, Cornfield Chase (user-licensed)',file=os.path.basename(out_wav),bpm=MAP['bpm'],meter=MAP['meter'],bar=MAP['bar'],beat=MAP['beat'],
           beat_offset=out_bars[0]['true_start'],total=round(dur,3),music_end=round(music_end,3),
           climax=peakbar[-1]['start'] if peakbar else None,burst=[b_['start'] for b_ in burst],
           sections=secs,bars=out_bars,beats=beats,junctions=junctions,warnings=warn,plan=plan)
    pk=float(np.abs(y).max())
    m['peak_dbfs']=round(20*np.log10(pk+1e-12),2); m['max_sample_step']=round(float(np.abs(np.diff(y,axis=0)).max()),4)
    sf.write(out_wav,y,SR,subtype='FLOAT'); json.dump(m,open(out_map,'w'),indent=1,ensure_ascii=False)
    print(f'{out_wav}: {dur:.3f} s, music ends {music_end:.3f} s, {len(junctions)} junctions, peak {m["peak_dbfs"]} dBFS, warnings {len(warn)}')
    for w in warn: print('  WARN',w)
if __name__=='__main__': main(*sys.argv[1:4])
