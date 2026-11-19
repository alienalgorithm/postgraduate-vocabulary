# usage: oga_get.py OUTDIR pageurl::fileurl ...   (only CC0-only pages accepted)
import sys, json, re, os, subprocess, datetime, urllib.parse
sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
from oga_page import one
out=sys.argv[1]
def slug(s): return re.sub(r'[^A-Za-z0-9]+','_',s).strip('_')[:40]
for arg in sys.argv[2:]:
    page,furl=arg.split('::')
    r=one(page)
    if r['licenses'].strip()!='CC0': print('SKIP license',r['licenses'],page); continue
    title=r['title'].split('|')[0].strip(); author=re.sub(r'\s*\(.*','',r['author'])
    ext=os.path.splitext(urllib.parse.unquote(furl))[1]
    fn=f"{slug(author)}__{slug(title)}{ext}"; dst=os.path.join(out,fn)
    if not os.path.exists(dst): subprocess.run(['curl','-sS','-m','300','-o',dst,furl])
    open(dst+'.license.txt','w').write(f"""Title: {title}
Artist: {author}
Source: OpenGameArt.org
Track page URL: {page}
Downloaded from: {furl}
Submitted: {r['author']}
License (as stated on the page, field "License(s)"): {r['licenses']}
License URL: https://creativecommons.org/publicdomain/zero/1.0/
Copyright/Attribution Notice on page: {r['attrib'] or '(none)'}
Page description: {r['desc'][:400]}
Retrieved: {datetime.date.today().isoformat()}
""")
    print('OK',fn,os.path.getsize(dst))
