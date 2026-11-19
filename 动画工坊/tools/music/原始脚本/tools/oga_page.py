# usage: oga_page.py url1 url2 ... -> json lines: url,title,author,licenses,files[(url,size)],desc
import re, html, json, sys, subprocess
from concurrent.futures import ThreadPoolExecutor
def txt(s): return re.sub(r'\s+',' ',html.unescape(re.sub(r'<[^>]+>',' ',s))).strip()
def one(u):
    s=subprocess.run(['curl','-sS','-m','40',u],capture_output=True,text=True).stdout
    def field(name,n=1500):
        i=s.find(name); return s[i:i+n] if i>0 else ''
    lic=re.findall(r'<a href="https?://creativecommons.org/[^"]*"[^>]*>([^<]*)</a>|title="([^"]*)" alt="[^"]*" src="/sites/default/files/license_images',field('field-name-field-art-licenses',2500))
    full=txt(s[s.find('field-name-author-submitter'):])
    m=re.search(r'License\(s\):\s*(.*?)\s*(?:Collections|Favorites|Preview)',full); lic_txt=m.group(1) if m else '?'
    files=re.findall(r'<a href="(https://opengameart.org/sites/default/files/[^"]+)"[^>]*>[^<]*</a>\s*<span class="file-size">([^<]*)</span>',s)
    if not files: files=[(f,'') for f in re.findall(r'href="(https://opengameart.org/sites/default/files/[^"]+\.(?:mp3|ogg|wav|flac))"',s)]
    title=txt(re.search(r'<title>([^<]*)</title>',s).group(1)) if '<title>' in s else ''
    m=re.search(r'Author:\s*(.*?)\s+(?:Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday),\s*(\w+ \d+, \d{4})',full); author=(m.group(1)+' ('+m.group(2)+')') if m else '?'
    fs=re.findall(r'File\(s\):\s*(.*?)Log in',full); fsz=fs[0][:300] if fs else ''
    desc=full[full.find('Preview'):][:0]+txt(field('field-name-body',3000)).split('field-label-hidden">')[-1][:400]
    att=txt(field('field-name-field-copyright-notice',800))[:200]
    return dict(url=u,title=title,author=author,licenses=lic_txt[:120],files=files,filesizes=fsz,desc=desc,attrib=att)
urls=sys.argv[1:]
with ThreadPoolExecutor(6) as ex:
    for r in ex.map(one,urls): print(json.dumps(r,ensure_ascii=False),flush=True)
