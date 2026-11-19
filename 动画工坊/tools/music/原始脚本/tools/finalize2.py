# usage: python3 -I finalize2.py jobs2.json -> copies chosen files to src/ and writes <file>.license.txt from a fresh fetch of each page (snapshots kept in pages/snap/)
import os, re, html, shutil, subprocess, datetime, json, sys
M='/tmp/claude-0/-home-user-postgraduate-vocabulary/3d87cc6c-41dd-58c2-802f-d51dc0c78527/scratchpad/anim/music'
SRC=M+'/src'; SNAP=M+'/pages/snap'; os.makedirs(SRC,exist_ok=True); os.makedirs(SNAP,exist_ok=True)
def get(u): return subprocess.run(['curl','-sS','-L','-m','40',u],capture_output=True,text=True).stdout
def txt(s): return re.sub(r'\s+',' ',html.unescape(re.sub(r'<[^>]+>',' ',s))).strip()
today=datetime.date.today().isoformat()
pieces=json.load(open(M+'/pages/incompetech_pieces.json'))
for j in json.load(open(sys.argv[1])):
    dst=os.path.join(SRC,j['name'])
    if not os.path.exists(dst): shutil.copy2(j['from'],dst)
    page=j['page']; h=get(page); snap=os.path.join(SNAP,'page__'+os.path.splitext(j['name'])[0]+'.html'); open(snap,'w').write(h)
    if j['site']=='fma':
        m=re.search(r'property="dc:title"[^>]*>([^<]+)</span>.*?property="cc:attributionName">\s*([^<]+?)\s*</a>\s*is licensed under a <a rel="license" href="[^"]+"[^>]*>([^<]+)</a>',h,re.S)
        stmt=(m.group(1).strip()+' by '+m.group(2).strip()+' is licensed under a '+m.group(3).strip()+'.') if m else '?'
        lurl=re.findall(r'href="(https?://creativecommons.org/(?:publicdomain|licenses)/[^"]+)"',h); lurl=lurl[0] if lurl else '?'
        assert 'CC0' in stmt and 'publicdomain/zero' in lurl, (j['name'],stmt,lurl)
        site='Free Music Archive (freemusicarchive.org)'; lic='Creative Commons CC0 1.0 Universal (public domain dedication): no attribution required; commercial use and modification allowed.'
        extra=f"Album (from page URL): {page.rstrip('/').split('/')[-2].replace('_',' ')}"
        attrib='Not required (CC0). Optional credit: "'+j['title']+'" by '+j['artist']+' (CC0), '+page
    elif j['site']=='oga':
        t=txt(h[h.find('field-name-author-submitter'):])
        m=re.search(r'License\(s\):\s*(.*?)\s*(?:Collections|Favorites|Preview)',t); lf=m.group(1) if m else '?'
        a=re.search(r'Author:\s*(.*?)\s+(?:Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday),\s*(\w+ \d+, \d{4})',t)
        n=re.search(r'Copyright/Attribution Notice:\s*(.*?)\s*File\(s\):',t)
        stmt=f'License(s): {lf}  (OpenGameArt.org page field)'
        assert lf.strip()=='CC0', (j['name'],lf)
        lurl='https://creativecommons.org/publicdomain/zero/1.0/'
        site='OpenGameArt.org'; lic='Creative Commons CC0 1.0 Universal (public domain dedication): no attribution required; commercial use and modification allowed.'
        extra=f"Submitted by: {a.group(1)+' ('+a.group(2)+')' if a else '?'}\nCopyright/Attribution Notice on page: {n.group(1) if n else '(none)'}"
        attrib='Not required (CC0). Optional credit: "'+j['title']+'" by '+j['artist']+' (CC0), '+page
    elif j['site']=='incompetech':
        p=[x for x in pieces if x['title']==j['title']][0]
        assert 'Licensed under Creative Commons: By Attribution 4.0 License' in h and 'http://creativecommons.org/licenses/by/4.0/' in h
        attrib=f'"{p["title"]}" Kevin MacLeod (incompetech.com)\nLicensed under Creative Commons: By Attribution 4.0 License\nhttp://creativecommons.org/licenses/by/4.0/'
        stmt='Attribution Code shown on the track page (exact):\n'+attrib
        lurl='http://creativecommons.org/licenses/by/4.0/'
        site='incompetech.com (Kevin MacLeod)'; lic='Creative Commons Attribution 4.0 International (CC BY 4.0): commercial use and modification allowed; ATTRIBUTION REQUIRED (put the attribution code in the Bilibili description). BACKUP ONLY.'
        extra=f"ISRC: {p['isrc']}\nCatalog length/bpm/feel: {p['length']} / {p['bpm']} / {p['feel']}\nInstruments: {p['instruments']}\nCatalog description: {p['description']}\nCatalog data: https://incompetech.com/music/royalty-free/pieces.json"
    open(dst+'.license.txt','w').write(f"""File: {j['name']}
Title: {j['title']}
Artist: {j['artist']}
Source: {site}
Track page URL: {page}
Downloaded from: {j['download_url']}
{extra}
License statement on the page (exact text): {stmt}
License: {lic}
License URL: {lurl}
Attribution line to use: {attrib}
Page snapshot saved: {snap}
Retrieved: {today}
Notes: {j.get('notes','')}
""")
    print('OK',j['name'],'|',stmt.replace(chr(10),' / ')[:120])
