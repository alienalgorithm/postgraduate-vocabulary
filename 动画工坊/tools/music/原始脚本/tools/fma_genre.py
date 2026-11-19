import sys, json, collections
sys.path.insert(0,'/tmp/claude-0/-home-user-postgraduate-vocabulary/3d87cc6c-41dd-58c2-802f-d51dc0c78527/scratchpad/anim/music/tools')
import fma_search as F
OUT=F.OUT
seen=json.load(open(OUT))
for g,pages in [('Instrumental',26),('Classical',15)]:
    hits=F.search(None,pages=pages,size=100,genre=g)
    print(g,len(hits),file=sys.stderr)
    for t in hits: seen[t['id']]=t
json.dump(seen,open(OUT,'w'))
