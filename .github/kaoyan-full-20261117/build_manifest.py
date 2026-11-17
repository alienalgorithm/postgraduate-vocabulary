import json, subprocess, hashlib
R='/home/user/postgraduate-vocabulary'; S='/tmp/claude-0/-home-user/3d87cc6c-41dd-58c2-802f-d51dc0c78527/scratchpad'
COMMIT=subprocess.run(['git','rev-parse','HEAD'],cwd=R,capture_output=True,text=True,check=True).stdout.strip()
V5='考研学人印刷版/2026-11-16-v5/'
paths=['文件包', V5+'考研学人-v5.pdf', V5+'考研学人-v5-羊皮纸版.pdf', '推广文案/商品图-2026-11-17', '推广文案/网店上架-2026-11-17']
tree={}
out=subprocess.run(['git','-c','core.quotepath=off','ls-tree','-r','-l',COMMIT,'--',*paths],cwd=R,capture_output=True,text=True,check=True,timeout=300).stdout
for l in out.splitlines():
    meta,p=l.split('\t',1); m=meta.split(); tree[p]=(m[2],int(m[3]))
def ident(p):
    blob,size=tree[p]
    h=hashlib.sha256(); pr=subprocess.Popen(['git','cat-file','blob',blob],cwd=R,stdout=subprocess.PIPE)
    n=0
    while ch:=pr.stdout.read(1<<20): h.update(ch); n+=len(ch)
    assert pr.wait()==0 and n==size, p
    return {'repo_path':p,'commit':COMMIT,'bytes':size,'sha256':h.hexdigest()}
bad=set('<>:"/\\|?*')
def safe(s):
    s=s.replace(': ','：').replace(':','：').replace('?','？')
    assert not (set(s)&bad) and s==s.strip() and not s.endswith('.'), s
    return s
TOP='考研学人全套资料'
fin={int(v['current_video_order']):v for v in json.load(open(S+'/current_manifest_final.json'))['videos']}
parts=[[],[]]
parts[0].append(dict(ident(V5+'考研学人-v5.pdf'), zip_path=f'{TOP}/考研学人 教材 普通版.pdf'))
parts[0].append(dict(ident(V5+'考研学人-v5-羊皮纸版.pdf'), zip_path=f'{TOP}/考研学人 教材 羊皮纸古书版.pdf'))
items=['视频同屏版','汉译英听写卡','英译汉听写卡','逐句精讲','单词精解册','阅读版']
for n in range(1,71):
    no=f'{n:02d}'; d=json.load(open(f'{S}/kbuild/2026-11-16-v5/data/{no}.json'))
    zh=d['title_zh']; en=safe(d['title_en']); assert safe(zh)==zh and fin[n]['title_zh']==zh, n
    src=f'文件包/{no} {zh}/{no} {zh} '; folder=f'{TOP}/{n} {zh} {en}'
    v=ident(src+'7 视频.mp4'); assert v['sha256']==fin[n]['sha256'], ('video sha differs from final', n)
    files=[dict(v, zip_path=f'{folder}/{n} {zh}.mp4')]
    for k,it in enumerate(items,1): files.append(dict(ident(src+f'{k} {it}.pdf'), zip_path=f'{folder}/{n} {zh} {k} {it}.pdf'))
    parts[0 if n<=35 else 1].extend(files)
    if n%10==0: print('article',n,flush=True)
shop=[]
for p in sorted(tree):
    if p.startswith('推广文案/商品图-2026-11-17/') and p.endswith(('.png','.jpg')) and '/制作源文件/' not in p:
        shop.append(dict(ident(p), zip_path='考研学人 商品图与上架说明/商品图/'+p.split('/')[-1]))
for f in ('商品详情说明.txt','标题与定价.md'):
    shop.append(dict(ident('推广文案/网店上架-2026-11-17/'+f), zip_path='考研学人 商品图与上架说明/'+f))
assets=[
 {'asset_name':'kaoyan-xueren-full-part1-books-and-01-35.zip','label':'考研学人全套资料 第1部分（两本教材＋第1到35篇）.zip','files':parts[0]},
 {'asset_name':'kaoyan-xueren-full-part2-36-70.zip','label':'考研学人全套资料 第2部分（第36到70篇）.zip','files':parts[1]},
 {'asset_name':'kaoyan-xueren-shop-images-and-listing.zip','label':'考研学人 商品图与上架说明.zip','files':shop},
]
for a in assets:
    a['total_bytes']=sum(f['bytes'] for f in a['files']); print(a['asset_name'], len(a['files']), round(a['total_bytes']/2**30,3),'GiB',flush=True)
    assert a['total_bytes'] < 2*2**30 - 50*2**20 and len({f['zip_path'] for f in a['files']})==len(a['files'])
notes='''《考研学人》全套资料与网店商品图（2026-11-17）。

全套资料分两个压缩包，解压到同一个位置后合成一个“考研学人全套资料”文件夹：
- 最外层：两本《考研学人》教材 PDF（普通版、羊皮纸古书版），各 356 页。
- 70 个文章文件夹，一篇一个，文件夹名是“序号 中文标题 英文标题”。每个文件夹里有 7 样：4K 精读视频（“序号 中文名.mp4”）、视频同屏版、汉译英听写卡、英译汉听写卡、逐句精讲、单词精解册、阅读版。
- 第 1 部分：两本教材＋第 1 到 35 篇；第 2 部分：第 36 到 70 篇。

另一个压缩包是网店用的商品图（1:1，1600×1600，PNG 和 JPG，含 eBay 用的无字白底主图）和上架说明（商品标题、定价建议、详细说明）。

每个文件都按提交 %s 里的原文件逐字节核对 SHA-256，视频未重新编码；上传后又把每个压缩包重新下载核对。''' % COMMIT[:8]
man={'tag':'kaoyan-xueren-full-20261117-v1','title':'考研学人全套资料（70篇文件夹＋两本教材）与商品图 2026-11-17','notes':notes,'assets':assets}
json.dump(man, open(S+'/rel/RELEASE-MANIFEST.json','w'), ensure_ascii=False, indent=1)
print('files', sum(len(a['files']) for a in assets), 'commit', COMMIT[:8])
