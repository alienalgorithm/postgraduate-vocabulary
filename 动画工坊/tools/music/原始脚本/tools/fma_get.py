# usage: fma_get.py OUTDIR id1 id2 ...  -> downloads mp3 + writes <file>.license.txt (CC0/PD only)
import sys, json, re, html, subprocess, os, datetime
M='/tmp/claude-0/-home-user-postgraduate-vocabulary/3d87cc6c-41dd-58c2-802f-d51dc0c78527/scratchpad/anim/music'
d=json.load(open(M+'/pages/fma_hits.json'))
out=sys.argv[1]; os.makedirs(out,exist_ok=True)
def sh(*a): return subprocess.run(list(a),capture_output=True,text=True).stdout
def slug(s): return re.sub(r'[^A-Za-z0-9]+','_',s).strip('_')[:40]
for tid in sys.argv[2:]:
    t=d[tid]
    page=sh('curl','-sS','-m','40',t['url'])
    i=page.find('is licensed under a')
    sent=re.sub(r'\s+',' ',html.unescape(re.sub(r'<[^>]+>',' ',page[max(0,i-600):i+300]))).strip()
    m=re.search(r'(\S[^.]*? by [^.]*? is licensed under a [^.]*?License)',sent)
    sent=m.group(1) if m else sent
    lic=re.findall(r'href="(https?://creativecommons.org/(?:publicdomain|licenses)/[^"]+)"',page[i-3000:i+3000]) if i>0 else []
    lic=lic[0] if lic else ''
    if 'publicdomain' not in lic:
        print('SKIP (not PD)',tid,t['title'],lic); continue
    loc=re.search(r'location:\s*(\S+)',sh('curl','-sS','-m','40','-D','-','-o','/dev/null',t['playbackUrl']),re.I)
    if not loc: print('NOSTREAM',tid); continue
    fn=f"{slug(t['artistName'])}__{slug(t['title'])}.mp3"
    dst=os.path.join(out,fn)
    if not os.path.exists(dst):
        subprocess.run(['curl','-sS','-m','120','-o',dst,loc.group(1)])
    open(dst+'.license.txt','w').write(
f"""Title: {t['title']}
Artist: {t['artistName']}
Source: Free Music Archive (freemusicarchive.org)
Track page URL: {t['url']}
Artist page URL: {t['artistUrl']}
Downloaded from: {loc.group(1)}
FMA track id: {tid}
License (as stated on the track page): {sent}
License URL: {lic}
Retrieved: {datetime.date.today().isoformat()}
""")
    print('OK',tid,fn,os.path.getsize(dst), lic)
