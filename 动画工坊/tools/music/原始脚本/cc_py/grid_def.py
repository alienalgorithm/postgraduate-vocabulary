import numpy as np
BPM=96.0; BEAT=0.625; B0=-0.033
def beat_t(k): return B0+k*BEAT
# bar start beats: bars 1-17 at 0,3,..,48 ; bar 18 at 51 (2 beats); bars 19.. at 53+3(n-19); last music bar 64 (188-190); bar 65 = cut at 191
BAR_BEATS=[3*i for i in range(17)]+[51]+[53+3*i for i in range(47)]  # up to 191
def bar_t(n): return beat_t(BAR_BEATS[n-1])
SR=48000
def bar_s(n): return int(round(bar_t(n)*SR))   # sample index (may be negative for bar 1)
# chord label per bar (root + cycle position 0..7 of the F-F-G-G-A-A-G-G cycle); 'L' = lift (no bass)
CHORD={}
for n in range(1,19):
    pos=[None,None,0,1,2,3,4,5,6,7,0,1,2,3,4,5,6,7][n-1]
    if n<=2: pos=n-1+0   # bars 1-2: F swell (treated as cycle positions 0,1)
    CHORD[n]=pos
for n in range(19,24): CHORD[n]='L'
for n in range(24,30): CHORD[n]=n-24          # F F G G A A (short cycle, no closing G G)
for n in range(30,66): CHORD[n]=(n-30)%8
ROOT={0:'F',1:'F',2:'G',3:'G',4:'A',5:'A',6:'G',7:'G','L':'E-pedal'}
SECTIONS=[('intro_a',1,10),('intro_b',11,18),('lift',19,23),('arrival',24,29),('drive_1',30,37),('drive_2',38,45),('build_1',46,53),('build_2',54,61),('peak',62,64)]
def section_of(n):
    for nm,a,b in SECTIONS:
        if a<=n<=b: return nm
    return 'tail'
def label(n):
    p=CHORD.get(n)
    if p is None: return None
    if p=='L': return ('E-pedal',n-19)   # lift bars are individually distinct (5-bar phrase)
    return (ROOT[p],p%2)
def harmonic_match(i,j):
    return label(i)==label(j) and label(i-1)==label(j-1) and label(i) is not None
