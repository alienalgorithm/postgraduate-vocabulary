# copies chosen files to src/ and writes clean <file>.license.txt (re-fetches the page; saves page snapshot to pages/)
import os, re, html, shutil, subprocess, datetime, json, sys
M='/tmp/claude-0/-home-user-postgraduate-vocabulary/3d87cc6c-41dd-58c2-802f-d51dc0c78527/scratchpad/anim/music'
SRC=M+'/src'; os.makedirs(SRC,exist_ok=True)
def get(u): return subprocess.run(['curl','-sS','-m','40',u],capture_output=True,text=True).stdout
def txt(s): return re.sub(r'\s+',' ',html.unescape(re.sub(r'<[^>]+>',' ',s))).strip()
def kv(path,key):
    for l in open(path):
        if l.startswith(key+':'): return l.split(':',1)[1].strip()
    return ''
today=datetime.date.today().isoformat()
jobs=json.load(open(sys.argv[1]))
for j in jobs:
    src=j['from']; dst=os.path.join(SRC,j['name'])
    if not os.path.exists(dst): shutil.copy2(src,dst)
    lic_old=j.get('license_from',src+'.license.txt')
    page=kv(lic_old,'Track page URL'); dl=j.get('download_url') or kv(lic_old,'Downloaded from')
    h=get(page); snap=os.path.join(M,'pages','page__'+os.path.splitext(j['name'])[0]+'.html'); open(snap,'w').write(h)
    if 'freemusicarchive.org' in page:
        t=txt(h); i=t.find(' is licensed under a '); k=t.find('License',i)
        stmt=t[max(0,i-200):k+7] if i>0 else '?'
        ti=stmt.rfind(j['title'][:20]); stmt=stmt[ti:] if ti>=0 else stmt
        lurl=re.findall(r'href="(https?://creativecommons.org/(?:publicdomain|licenses)/[^"]+)"',h); lurl=lurl[0] if lurl else '?'
        album=page.rstrip('/').split('/')[-2].replace('_',' ')
        src_site='Free Music Archive (freemusicarchive.org)'
        extra=f"Album (from page URL): {album}\nArtist page URL: {kv(lic_old,'Artist page URL')}\nFMA track id: {kv(lic_old,'FMA track id')}"
    else:
        t=txt(h[h.find('field-name-author-submitter'):])
        m=re.search(r'License\(s\):\s*(.*?)\s*(?:Collections|Favorites|Preview)',t); stmt='License(s): '+(m.group(1) if m else '?')+'  (OpenGameArt.org page field)'
        lurl='https://creativecommons.org/publicdomain/zero/1.0/'
        a=re.search(r'Copyright/Attribution Notice:\s*(.*?)\s*File\(s\):',t)
        src_site='OpenGameArt.org'
        extra=f"Submitted: {kv(lic_old,'Submitted')}\nCopyright/Attribution Notice on page: {a.group(1) if a else '(none)'}"
    assert ('CC0' in stmt) or ('publicdomain' in lurl), (j['name'],stmt,lurl)
    open(dst+'.license.txt','w').write(f"""File: {j['name']}
Title: {j['title']}
Artist: {j['artist']}
Source: {src_site}
Track page URL: {page}
Downloaded from: {dl}
{extra}
License statement on the page (exact text): {stmt}
License: Creative Commons CC0 1.0 Universal (Public Domain Dedication) - no attribution required, commercial use and modification allowed.
License URL: {lurl}
Page snapshot saved: {snap}
Retrieved: {today}
Notes: {j.get('notes','')}
""")
    print('OK',j['name'],'|',stmt[:110])
