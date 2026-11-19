import numpy as np, sys, json, hashlib
sys.path.insert(0,'py'); from grid_def import *
pairs={(r['out_bar'],r['in_bar']):r for r in json.load(open('pairs.json'))}
seam={(r['out_bar'],r['in_bar']):r for r in json.load(open('seamtests.json'))}
ver=json.load(open('verify.json')); vc=ver['cands']
bf=np.load('barfeat.npy')
SEC_DESC={
 'intro_a':'Opening swell from near-silence (bars 1-2, RMS -60 to -45 dB), then the first chord cycle: sustained organ-like chords F (4 bars incl. swell) - G - Am - G under a constant high E pedal with D#/F neighbour notes (the soft "ticking" ostinato). Quiet, dark.',
 'intro_b':'Second chord cycle F - G - Am - G, same texture but gradually brighter: 3-8 kHz band rises about +6 dB at bar 11 and keeps climbing to bar 18 (upper-register layer joins, slow crescendo). Bar 18 is a 2-beat bar, so the last G lasts 5 beats.',
 'lift':'Bass drops out; a close, bright mid-register 16th-note figure around E4-E5 takes over (300 Hz-1 kHz +10 dB), ticking pulse clearly audible, no chord change (E pedal). Bar 23 (40.592 s) is the riser: low end and 3-8 kHz swell into the hit.',
 'arrival':'THE BURST at 42.467 s: massive low-register entry (+16 dB below 120 Hz, sample peak -0.2 dBFS, strongest transient of the piece), full organ texture, driving 16ths. Short chord cycle F - G - Am (no closing G).',
 'drive_1':'First full main cycle F - G - Am - G (15.000 s). High register grows: 3-8 kHz +5 dB, >8 kHz +7 dB by bar 34 (61.2 s).',
 'drive_2':'Second main cycle, brighter (spectral centroid 1.05 -> 1.3 kHz; >8 kHz +3 dB from bar 42, 76.2 s); low end still thin.',
 'build_1':'Deep low end returns at 83.717 s (+20 dB below 120 Hz): the second big lift, RMS steps up about 3.5 dB. Full, dense texture.',
 'build_2':'Steady crescendo, every band +1 to +4 dB across the cycle; the most loop-friendly material in the piece.',
 'peak':'Fullest and loudest bars (RMS about 3 dB above build_1, all bands at maximum). The music stops dead at 119.342 s, on a bar line in the middle of the G chord.',
 'tail':'Reverb tail after the hard stop: -6 dB at 119.35 s, -40 dB at 124.2 s, about -60 dB at 126 s; file ends 126.960 s.'}
SEC_MOOD={'intro_a':'cold, suspended, searching','intro_b':'slowly warming, curiosity','lift':'held breath, anticipation','arrival':'impact, revelation','drive_1':'momentum','drive_2':'momentum, brighter','build_1':'second lift, power','build_2':'rising, inevitability','peak':'fullest, triumphant','tail':'stillness after the stop'}
bars=[]
for n in range(1,66):
    b=dict(n=n,start=round(bar_t(n),3),beats=(2 if n==18 else 3) if n<65 else 0)
    if n<65:
        b['end']=round(bar_t(n+1),3); p=CHORD[n]
        b['chord']=({'A':'Am'}.get(ROOT[p],ROOT[p])) if p!='L' else 'E-pedal'
        b['chord_bar']=(p%2+1) if p!='L' else None
        if p=='L': b['lift_bar']=n-18
        b['cycle_pos']=p if p!='L' else None
        b['section']=section_of(n)
        r=bf[n-1]; b['rms_db']=round(float(r[3]),1); b['band_db']={k:round(float(v),1) for k,v in zip(['lt120','120_300','300_1k','1k_3k','3k_8k','gt8k'],r[4:10])}
    else:
        b.update(end=None,chord=None,section='music_end',note='hard stop of the music (bar line); reverb tail follows')
    bars.append(b)
beats=[round(B0+k*BEAT,3) for k in range(0,192)]
secs=[]
for nm,a,c in SECTIONS:
    secs.append(dict(name=nm,start=round(max(0.0,bar_t(a)),3),end=round(bar_t(c+1),3),bars=[a,c],mood=SEC_MOOD[nm],description=SEC_DESC[nm]))
secs.append(dict(name='tail',start=119.342,end=126.96,bars=None,mood=SEC_MOOD['tail'],description=SEC_DESC['tail']))
phr=[('P1',1,10,'F(4 bars incl. swell) G Am G'),('P2',11,18,'F G Am G (last G 5 beats: bar 18 has 2 beats)'),('P3',19,23,'E pedal only (4 bars + riser bar)'),
     ('P4',24,29,'F G Am (short cycle, 6 bars)'),('P5',30,37,'F G Am G'),('P6',38,45,'F G Am G'),('P7',46,53,'F G Am G'),('P8',54,61,'F G Am G'),('P9',62,64,'F G, then hard stop at bar line 65')]
phrases=[dict(name=p,bars=[a,c],start=round(max(0.0,bar_t(a)),3),end=round(bar_t(c+1),3),length_s=round(bar_t(c+1)-max(0.0,bar_t(a)),3),
              length_bars=c-a+1,section=section_of(a),chords=ch,complete=(p not in ('P9',))) for p,a,c,ch in phr]
chg=[]
for n in range(2,65):
    if bars[n-1]['chord']!=bars[n-2]['chord']: chg.append(dict(t=bars[n-1]['start'],bar=n,chord=bars[n-1]['chord']))
def cand(i,j):
    p=pairs.get((i,j)); s=seam[(i,j)]; v=vc[f'{i}->{j}']
    q=p['quality'] if p else None
    sc=0.5*(q or 0)+0.25*(100-v['pct_vs_natural_short'])+0.25*(100-v['pct_vs_natural_bar'])
    if not s['seam_pass']: sc*=0.8
    grade='A' if (sc>=65 and s['seam_pass'] and v['pct_vs_natural_short']<=75 and v['pct_vs_natural_bar']<=75) else ('B' if sc>=50 and s['seam_pass'] else 'C')
    d=dict(out_bar=i,in_bar=j,out_t=round(bar_t(i),3),in_t=round(bar_t(j),3),length_s=round(bar_t(i)-bar_t(j),3),
           length_bars=i-j,length_beats=int(round((bar_t(i)-bar_t(j))/BEAT)),out_section=section_of(i-1),in_section=section_of(j),
           out_chord=bars[i-1]['chord'] if i<65 else 'G (cut)',in_chord=bars[j-1]['chord'],harmonic_match=bool(harmonic_match(i,j)) if j>=19 and j<=23 and i<=23 else bool(harmonic_match(i,j)),
           score=round(sc,1),grade=grade,quality=q,seam_pass=s['seam_pass'],xfade=s['best_xfade'],
           similarity=None if not p else {k2:(None if p[k1] is None else round(float(p[k1]),3)) for k1,k2 in [('d_spec_pre_short_db','spec_pre_short_db'),('d_spec_post_short_db','spec_post_short_db'),('d_spec_pre_bar_db','spec_pre_bar_db'),('d_spec_post_bar_db','spec_post_bar_db'),('chroma_pre','chroma_pre'),('chroma_post','chroma_post'),('level_jump_db','level_jump_db'),('phase_rho','phase_rho')]},
           seam_test=s['seam'],rendered_seam=dict(novelty_short_db=v['seam_novelty_short_db'],novelty_bar_db=v['seam_novelty_bar_db'],pct_vs_natural_bar_lines_short=v['pct_vs_natural_short'],pct_vs_natural_bar_lines_bar=v['pct_vs_natural_bar']))
    if section_of(i-1)=='lift' and section_of(j)=='lift': d['harmonic_match']=True; d['note']='lift texture loop: E pedal, no chord change'
    if p and p['level_jump_db']>=1.5 and j<i:
        d['grade']='C'; d['caution']=f"level changes {p['level_jump_db']:.1f} dB at the seam (crosses an intensity step); audible as a drop"
    if j>i or j in (3,11,19,24,30,46,54,62):
        rs=v['seam_novelty_short_db']/max(v['natural_at_in_bar_short'],1e-6); rb=v['seam_novelty_bar_db']/max(v['natural_at_in_bar_bar'],1e-6)
        d['rendered_seam']['vs_composer_boundary_at_in_bar']=dict(short=round(rs,2),bar=round(rb,2))
        if j>i:
            d['grade']='A' if (s['seam_pass'] and d['harmonic_match'] and rs<=1.1 and rb<=1.1) else ('B' if (s['seam_pass'] and d['harmonic_match'] and rs<=1.3 and rb<=1.3) else 'C')
            d['score']=round(100*np.exp(-max(0,rs-1)-max(0,rb-1))*(1 if s['seam_pass'] else 0.8)*(1 if d['harmonic_match'] else 0.7),1)
    return d
loops=[];skips=[];dram=[]
for (i,j) in seam:
    c=cand(i,j)
    if j<i and (c['harmonic_match']) and not (i>=46 and j<=18): loops.append(c)
    elif j>i: skips.append(c)
    else: dram.append(c)
loops.sort(key=lambda c:(c['grade'],-c['score'])); skips.sort(key=lambda c:(c['grade'],-c['score'])); dram.sort(key=lambda c:-c['score'])
NOTE={(57,49):'best overall: one full build cycle, seam inside the sustained G chord; equal-gain (signals correlated, rho 0.56)',
      (55,47):'one full build cycle, seam inside F',(59,51):'one full build cycle, seam inside Am',(61,57):'half-cycle (4 bars) loop right before the peak: keeps the intensity highest',
      (43,35):'one full drive cycle',(54,46):'phrase-aligned: replays the whole build_1 cycle from its F downbeat (bass re-entry accent is replayed)',
      (22,20):'lengthens the held-breath lift before the burst by 2 bars',(23,21):'lengthens the lift by 2 bars (out before the riser bar)',(22,21):'lengthens the lift by 1 bar',
      (10,6):'4-bar intro loop (G Am G G)',(14,10):'4-bar intro loop across intro_a/intro_b (timbre dips back for one bar)',(56,48):'one full build cycle (seam on G downbeat)'}
for c in loops:
    k=(c['out_bar'],c['in_bar'])
    if k in NOTE: c['note']=NOTE[k]
m=dict(title='Hans Zimmer - Cornfield Chase (Interstellar OST, deluxe edition track 2): source map',
  source=dict(file='A/music/user/cornfield_chase.mp3',sha256=hashlib.sha256(open('../user/cornfield_chase.mp3','rb').read()).hexdigest(),
      format='MP3 320 kbps, 44.1 kHz stereo',decode_command='ffmpeg -i cornfield_chase.mp3 -ar 48000 -c:a pcm_f32le dec48.wav  (time 0 = first decoded sample; every time in this map uses this timeline)',
      decoded='A/music/cw/dec48.wav',sr=48000,duration=126.96,integrated_lufs=-13.2,true_peak_dbfs=-0.2,loudness_range_lu=24.4,license='user statement 2026-11-19: licensed for this video (see A/music/LICENSES.md)'),
  bpm=96.0,beat=0.625,tatum_16th=0.15625,meter='3/4',bar=1.875,chord_unit_bars=2,cycle_bars=8,cycle_s=15.0,
  beat_offset=round(B0,3),
  beat_offset_note='beat k is at -0.033 + 0.625*k s (k = 0..191). Beat 0 = bar 1 downbeat sits 33 ms before the first sample (the file opens on the downbeat). Grid accuracy about +-10 ms; tempo is constant 96.000 BPM for the whole piece (no measurable drift over 88 s, < 5 ms). One beat = 30000 samples at 48 kHz, one bar = 90000, one cycle = 720000, so every loop or cut below is sample-exact on the click.',
  meter_note='Triple meter: chords change every 6 beats (2 bars of 3/4) and onset accents repeat every 3 beats (z = +2.3 to +3.2 vs 2- and 4-beat folds at z <= 0). Bar 18 (31.842 s) has only 2 beats: bar lines before it fall on beats = 0 mod 3, after it on beats = 2 mod 3. Bars are numbered 1..64 for music, bar line 65 = the hard stop at 119.342 s.',
  key=dict(tonal_centre='A minor (A Aeolian; same notes as C major)',pedal='E (E4/E5 pedal with D# and F neighbour notes on top of every chord)',
      progression='F - G - Am - G, 2 bars (6 beats, 3.75 s) per chord, 8-bar cycle = 15.000 s (VI - VII - i - VII in A minor)',
      key_profile_correlation={'E minor':0.795,'A minor':0.697,'C major':0.673},
      note='Key-profile correlation picks E minor only because the E pedal is constant; the bass (F, G, A) and the chords say A minor / C major. The cycle never cadences, which is why the piece feels suspended and forward-moving.'),
  beats=beats,bars=bars,chord_changes=chg,phrases=phrases,sections=secs,
  layers=[
   dict(t=0.0,bar=1,layer='Organ-like sustained chords + low pedal, fading in from near-silence (bars 1-4)',evidence='RMS -60 dB (bar 1) -> -38 dB (bar 4); <120 Hz band +22 dB by bar 4'),
   dict(t=0.0,bar=1,layer='High E pedal ostinato with D#/F neighbours (soft "ticking" figure), present in every section until the stop',evidence='E4 (329.7 Hz) is the strongest spectral peak in every section; D# and F follow it in the mid chroma'),
   dict(t=14.967,bar=9,layer='Upper-register layer / brightening (likely higher organ ranks or synth)',evidence='3-8 kHz band +4 dB at bar 9, then +13 dB in total by bar 18'),
   dict(t=33.092,bar=19,layer='Bass out; close bright 16th-note arpeggio around E4-E5 (piano or organ, inferred)',evidence='<120 Hz -8 dB, 300 Hz-1 kHz +10 dB, onset strength x1.3, sharp attack at 33.098 s'),
   dict(t=40.592,bar=23,layer='Riser into the burst',evidence='<120 Hz +15 dB and 3-8 kHz +14 dB within the bar'),
   dict(t=42.467,bar=24,layer='Full organ / massive low register entry (the burst)',evidence='<120 Hz +16 dB vs bar 23, sample peak -0.2 dBFS; harmonic, not percussive (percussive/harmonic ratio -14 dB)'),
   dict(t=53.717,bar=30,layer='High layer grows (strings or high organ, inferred)',evidence='3-8 kHz +3 to +5 dB over bars 30-33'),
   dict(t=61.217,bar=34,layer='Top shimmer (>8 kHz)',evidence='>8 kHz +5 dB at bar 34'),
   dict(t=76.217,bar=42,layer='Further brightening',evidence='>8 kHz +3 dB, centroid 1.3 kHz'),
   dict(t=83.717,bar=46,layer='Deep bass / organ pedal returns: final build starts',evidence='<120 Hz +20 dB vs bar 45, RMS +3.4 dB'),
   dict(t=113.717,bar=62,layer='Everything at maximum (peak)',evidence='highest RMS and every band at its maximum')],
  percussion_note='No drum kit or percussion layer was found: the percussive/harmonic energy ratio stays between -12 and -19 dB in every bar. The rhythmic drive comes from the 16th-note ostinato (tatum 0.156 s); the only hit-like event is the harmonic low-register entry at 42.467 s.',
  instrument_note='Layer names are inferred from the spectrum (band energies, register, attack, harmonic/percussive split); they are not confirmed by ear.',
  climax=113.717,climax_bar=62,climax_window=[113.717,119.342],climax_note='Fullest, loudest bars of the piece (bar 62 = F downbeat of the last cycle). Place the "aha" line on 113.717 (or on the equivalent bar after loops).',
  burst=42.467,burst_bar=24,burst_note='Biggest single impact (low-register entry). Natural place for the first big reveal; 9.375 s of lift (bars 19-23) leads into it.',
  ending=dict(music_stop=119.342,stop_bar_line=65,tail_end=126.96,minus40db=124.19,minus60db=126.0,
      options=['E1 (original): play through the peak, the music stops dead on the bar line 119.342 s, keep the reverb tail (fade the last 1 s after about 125.9 s). Dramatic stop, good for a final title card held in silence.',
               'E2 (warm epilogue): after the peak, join to intro F (bar 11, 18.717 s, or bar 3, 3.717 s) at an F downbeat with a 0.625 s equal-power crossfade and let the quiet cycle fade out. Harmony continues (G -> F), the level drops about 20 dB on purpose (a breath, not a hidden seam).',
               'E3: stop + tail as in E1, then bring back the opening swell (0 - 7.5 s, bars 1-4) under or after the tail and fade it out: the film ends where it began.']),
  edit_rules=['Cut, loop and join only at bar lines (beat k = -0.033 + 0.625 k; bar lines listed in bars[]). Every loop length below is a whole number of bars, so the beat and bar grid after a loop continues exactly (the edited track keeps 96 BPM and the same grid).',
      'For a seamless loop the chord context must match on both sides (same chord and same bar-of-chord before and after the bar line): main body loops of 8 bars (15.000 s) or 4 bars (7.5 s) inside the same G-G pair.',
      'Use the crossfade stored with each candidate (length, placement, law). "pre" = the fade ends 10 ms before the bar line, so the new downbeat attack comes cleanly from the in-side; equal-gain only where the two signals are strongly correlated (phase_rho > 0.5).',
      'Do not loop back from build_1/build_2/peak into drive or intro: the deep bass that enters at 83.717 s would vanish (level jump 2-4 dB).',
      'Tool: A/music/cc/py/cc_edit.py plan.json out.wav out_map.json renders any bar-level plan and writes the edited timing map (beats, bars, sections, climax, junctions).'],
  loop_candidates=loops,skip_candidates=skips,dramatic_joins=dram,
  scoring=dict(quality='0-100 context similarity of the two sides of the jump: 25% log-mel spectrum 0.4 s around the bar line, 20% log-mel over one bar, 25% chroma (harmony), 15% level match, 15% waveform correlation at the splice (phase continuity)',
      seam_test='test render with crossfades of 40, 156, 312 and 625 ms, centre or pre placement, equal-power or equal-gain; best one kept. Pass = level dip and bump <= 1.5 dB vs both original sides, spectral-flux ratio <= 1.15, no new click above 6 kHz (<= +1 dB), spectral jump across the seam no more than 1.5 dB above the natural change at that bar line',
      rendered_seam='log-mel change across the seam in the rendered file (0.3 s and 1 bar each side), as a percentile of the same change at natural bar lines inside sections of the original. Below 75 means at least a quarter of the composer\'s own bar lines change the sound more than this seam; below 50 means the seam changes less than a typical bar line.',
      score='0.5 x quality + 0.25 x (100 - pct short) + 0.25 x (100 - pct bar); x0.8 if the seam test fails. Grade A = score >= 65, seam pass and both percentiles <= 75; B = score >= 50 and seam pass; else C.'),
  natural_bar_line_novelty_db=ver['natural'])
json.dump(m,open('../cc_map.json','w'),indent=1,ensure_ascii=False)
print('loops',len(loops),'skips',len(skips),'dramatic',len(dram))
for c in loops[:24]: print(c['grade'],c['score'],c['out_bar'],'->',c['in_bar'],c['out_t'],'->',c['in_t'],c['length_s'],c['out_section'],c['in_section'],c['xfade'],c['rendered_seam']['pct_vs_natural_bar_lines_short'],c['rendered_seam']['pct_vs_natural_bar_lines_bar'])
print('skips'); [print(c['grade'],c['score'],c['out_bar'],'->',c['in_bar'],c['seam_pass'],c['harmonic_match'],c['rendered_seam']) for c in skips]
print('dram'); [print(c['grade'],c['score'],c['out_bar'],'->',c['in_bar'],c['seam_pass']) for c in dram]
