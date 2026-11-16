import json,subprocess,sys,hashlib,numpy as np
sys.path.insert(0,sys.argv[1]); from voice_end import voice_end
import importlib.util
spec=importlib.util.spec_from_file_location('G',sys.argv[1]+'/hold18_geometry.py'); G=importlib.util.module_from_spec(spec); spec.loader.exec_module(G)
V='/tmp/claude-0/s68/53_final.mp4'; B=sys.argv[2]+'/68.mp4'; W=sys.argv[2]
run=lambda a: subprocess.run(a,check=True,capture_output=True).stdout
sha=lambda p: hashlib.sha256(open(p,'rb').read()).hexdigest()
pr=json.loads(run(['ffprobe','-v','error','-count_frames','-show_streams','-of','json',V]))
vs=[s for s in pr['streams'] if s['codec_type']=='video'][0]; au=[s for s in pr['streams'] if s['codec_type']=='audio'][0]
n=int(vs['nb_read_frames']); end,ends,_=voice_end(V); endB,_,_=voice_end(B)
geo=G.geometry(end,4225,4225,4285,n,4225/30-end)
TW,TH=384,216
def th(start,count,src=V):
    raw=run(['ffmpeg','-v','error','-ss',f'{(start-.25)/30:.9f}','-i',src,'-map','0:v:0','-an','-frames:v',str(count),'-vf',f'scale={TW}:{TH}:flags=area','-pix_fmt','rgb24','-f','rawvideo','-'])
    return np.frombuffer(raw,np.uint8).reshape(-1,TH,TW,3).astype(float)
def ref(png):
    raw=run(['ffmpeg','-v','error','-i',png,'-frames:v','1','-vf',f'format=yuv420p,scale={TW}:{TH}:flags=area','-pix_fmt','rgb24','-f','rawvideo','-'])
    return np.frombuffer(raw,np.uint8).reshape(TH,TW,3).astype(float)
h=th(4206,19); hold=[float(np.abs(h[i]-h[0]).mean()) for i in range(1,19)]
G.decoded_hold(frame_count=18,hold_seconds=.6,start_frame=4207,end_frame_inclusive=4224,reference_frame=4206,checked_frames=18,thumbnail_mae_each=hold,thumbnail_mae_max=max(hold),actual_geometry=geo)
last=ref(W+'/work_68/0077.png'); lastpage=float(np.abs(h[0]-last).mean())
t=th(4224,122); il=ref('/tmp/claude-0/s68/actual4K.png'); su=ref(W+'/work_68/0078_简述.png')
ill=[float(np.abs(t[i]-il).mean()) for i in range(1,61)]; summ=[float(np.abs(t[i]-su).mean()) for i in range(61,121)]
pre=float(np.abs(t[0]-il).mean())
# body vs passed 4K: sample frames
bf={}
for f in (0,300,1500,3000,4100,4204):
    bf[f]=float(np.abs(th(f,1)[0]-th(f,1,B)[0]).mean())
# audio
dec=lambda p: np.frombuffer(run(['ffmpeg','-v','error','-i',p,'-map','0:a:0','-f','f32le','-']),np.float32)
a=dec(V); b=dec(B); m=min(len(a),len(b)); diff=np.nonzero(a[:m]!=b[:m])[0]
first=int(diff[0]) if len(diff) else None
tailmax=float(np.abs(a[m:]).max()) if len(a)>m else 0.0
peak=float(20*np.log10(np.abs(a).max()))
r=dict(video_sha256=sha(V),bytes=len(open(V,'rb').read()),frames=n,size=[vs['width'],vs['height']],fps=vs['r_frame_rate'],
 audio=dict(codec=au['codec_name'],sample_rate=au['sample_rate']),voice_end=end,voice_end_ends=ends,voice_end_passed4K=endB,geometry=geo,
 hold_mae=hold,hold_mae_max=max(hold),hold_ref_vs_last_body_png_mae=lastpage,illustration_mae_max=max(ill),summary_mae_max=max(summ),
 frame4224_is_body_not_art_mae_vs_art=pre,body_frames_vs_passed4K_mae=bf,
 audio_decoded_samples_new=len(a),audio_decoded_samples_passed4K=len(b),first_differing_sample=first,first_diff_seconds=(first/48000 if first is not None else None),
 identical_through_seconds=(first/48000 if first is not None else m/48000),extra_tail_max_abs=tailmax,peak_dBFS=peak,
 passed4K_sha256=sha(B),passed4K_frames=4265)
print(json.dumps(r,indent=1,ensure_ascii=False))
json.dump(r,open('/tmp/claude-0/s68/verify53.json','w'),indent=1,ensure_ascii=False)
