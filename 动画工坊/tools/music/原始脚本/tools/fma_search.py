import re, html, json, sys, subprocess, urllib.parse, os
OUT='/tmp/claude-0/-home-user-postgraduate-vocabulary/3d87cc6c-41dd-58c2-802f-d51dc0c78527/scratchpad/anim/music/pages/fma_hits.json'
def fetch(url):
    return subprocess.run(['curl','-sS','-m','40',url],capture_output=True,text=True).stdout
def search(q, pages=1, size=100, genre=None):
    out=[]
    for p in range(1,pages+1):
        params=[('adv','1')]
        if q: params.append(('quicksearch',q))
        params+= [('music-filter-public-domain','1'),('pageSize',str(size)),('page',str(p))]
        if genre: params.append(('search-genre',genre))
        s=fetch('https://freemusicarchive.org/search?'+urllib.parse.urlencode(params))
        rows=s.split("data-track-info='")[1:]
        for r in rows:
            info=json.loads(html.unescape(r[:r.index("'")]))
            head=r.split('class="absolute inline-flex bg-gray-light')[0]
            info['genres']=re.findall(r'/genre/([^/"]+)/"',head)
            dur=re.search(r'align-self-end pl-6">\s*([\d:]+)',head)
            info['dur']=dur.group(1) if dur else ''
            out.append(info)
        if len(rows)<size: break
    return out
def secs(d):
    try:
        p=[int(x) for x in d.split(':')]; return p[0]*60+p[1] if len(p)==2 else p[0]*3600+p[1]*60+p[2]
    except: return 0
if __name__=='__main__':
    seen=json.load(open(OUT)) if os.path.exists(OUT) else {}
    lo,hi=int(os.environ.get('LO','100')),int(os.environ.get('HI','330'))
    for q in sys.argv[1:]:
        hits=search(q, pages=int(os.environ.get('PAGES','1')))
        n=0
        for t in hits:
            new=t['id'] not in seen
            seen[t['id']]=t
            if new and lo<=secs(t['dur'])<=hi:
                n+=1
                print(f"{q[:10]:10s}|{t['dur']:>6s}|{t['artistName'][:20]:20s}|{t['title'][:46]:46s}|{','.join(t['genres'])[:44]}|{t['id']}")
        print(f'## {q}: {len(hits)} hits, {n} new in range', file=sys.stderr)
    json.dump(seen,open(OUT,'w'))
