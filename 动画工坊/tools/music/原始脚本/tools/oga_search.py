# usage: oga_search.py kw1 kw2 ...  -> prints CC0 music items (url|title), appends to pages/oga_hits.json
import re, html, json, sys, subprocess, urllib.parse, os
M='/tmp/claude-0/-home-user-postgraduate-vocabulary/3d87cc6c-41dd-58c2-802f-d51dc0c78527/scratchpad/anim/music'
OUT=M+'/pages/oga_hits.json'
seen=json.load(open(OUT)) if os.path.exists(OUT) else {}
for kw in sys.argv[1:]:
    q=urllib.parse.urlencode([('keys',kw),('field_art_type_tid[]','12'),('field_art_licenses_tid[]','4'),('sort_by','count'),('sort_order','DESC'),('items_per_page','144')])
    s=subprocess.run(['curl','-sS','-m','40','https://opengameart.org/art-search-advanced?'+q],capture_output=True,text=True).stdout
    items=re.findall(r'<div class="field-item even"><a href="(/content/[^"]+)">([^<]+)</a>',s)
    if not items: items=re.findall(r'href="(/content/[^"]+)"[^>]*>([^<]+)</a>',s)
    n=0
    for u,t in items:
        if u in ('/content/faq',) or u in seen: continue
        seen[u]=html.unescape(t); n+=1
        print(f'{kw[:10]:10s}| https://opengameart.org{u} | {html.unescape(t)}')
    print(f'## {kw}: {len(items)} items, {n} new',file=sys.stderr)
json.dump(seen,open(OUT,'w'))
