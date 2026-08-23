#!/usr/bin/env python3
from pathlib import Path
import re, subprocess

ROOT = Path(__file__).resolve().parent.parent

def read(p): return (ROOT/p).read_text(encoding='utf-8')
def write(p,s): (ROOT/p).write_text(s,encoding='utf-8')

def add_article_scripts(text):
    for n in range(21,26):
        tag=f'<script src="data/article-{n:02d}.js"></script>'
        if tag not in text:
            text=text.replace('<script src="assets/site.js"></script>', tag+'\n<script src="assets/site.js"></script>')
    return text

# Website entry points: make runtime match canonical 25-article data layer.
idx=add_article_scripts(read('index.html'))
repls={
'二十篇《经济学人》风格双语科普短文':'二十五篇《经济学人》风格双语科普短文',
'1000个考研重点词':'1250个考研重点词',
'把1000个考研词':'把1250个考研词',
'第二十篇已入库':'第二十五篇已入库',
'NEW · 20':'NEW · 25',
'二十篇知识故事':'二十五篇知识故事',
'浏览1000词词库':'浏览1250词词库',
'1000词索引':'1250词索引',
'二十篇 · 1000重点词':'二十五篇 · 1250重点词',
'article.html?a=the-market-came-after-the-limit':'article.html?a=the-patient-came-before-the-envelope',
'法律先设定二氧化硫排放上限，监测系统逐吨核算；交易只负责寻找成本更低的减排路径。':'先确认患者符合条件，再打开随机分配的密封信封；答案只有在病人已经入组后才能被看见。',
'从霍乱、深海生态与臭氧洞，到原子结构、登月软件，以及一套先设总量、再让价格寻找减排路径的酸雨制度。':'从霍乱、深海生态与臭氧洞，到原子结构、登月软件、工程失效与临床试验；每篇用一个可检验的机制承载50个重点词。'
}
for a,b in repls.items(): idx=idx.replace(a,b)
write('index.html',idx)

art=add_article_scripts(read('article.html'))
art=art.replace('二十篇考研词汇双语科普文章','二十五篇考研词汇双语科普文章').replace('1000词索引','1250词索引')
write('article.html',art)

words=add_article_scripts(read('words.html'))
for a,b in {
'1000词词库':'1250词词库','二十篇双语科普文章':'二十五篇双语科普文章','1000个考研重点词':'1250个考研重点词',
'VOCABULARY INDEX · 01—20':'VOCABULARY INDEX · 01—25','1000个词，':'1250个词，','1000个词元 · 20篇文章':'1250个词元 · 25篇文章',
'article.html?a=the-market-came-after-the-limit':'article.html?a=the-patient-came-before-the-envelope'
}.items(): words=words.replace(a,b)
write('words.html',words)

# README: current archive count and row 25.
readme=read('README.md')
readme=readme.replace('截至2026-08-13，共有 **24篇文章、1200个重点词**','截至2026-08-23，共有 **25篇文章、1250个重点词**')
row25='| **25** | ***The Patient Came Before the Envelope*** | **1947—1948年英国MRC链霉素肺结核试验、随机序列与分配隐藏** | **270词 · 50词 · 18.5%** | [网页](https://alienrocketbus.github.io/postgraduate-vocabulary/article.html?a=the-patient-came-before-the-envelope) · [Markdown](articles/25-the-patient-came-before-the-envelope.md) |\n'
if row25 not in readme:
    marker='| **24** | ***The Change That Doubled the Load***'
    pos=readme.find(marker)
    if pos!=-1:
        end=readme.find('\n',pos)+1
        readme=readme[:end]+row25+readme[end:]
    else:
        readme += '\n'+row25
write('README.md',readme)

# Handoff: make header/count/table coherent.
h=read('notes/对话交接文档.md')
h=h.replace('当前权威状态：**二十四篇最终定稿，1200个重点词','当前权威状态：**二十五篇最终定稿，1250个重点词')
h=h.replace('## 3. 当前二十篇最终定稿','## 3. 当前二十五篇最终定稿')
h=h.replace('- 20篇\n- 1000个重点词','- 25篇\n- 1250个重点词').replace('1000个速查表词元','1250个速查表词元').replace('1000个英文加粗表面形式','1250个英文加粗表面形式')
rowh='| **25** | ***The Patient Came Before the Envelope*** | **1947—1948年英国MRC链霉素肺结核试验、随机序列与分配隐藏** | **270 / 50 / 18.5%** | **第二十五篇最终精进锁定稿** |\n'
if rowh not in h:
    marker='| **24** | ***The Change That Doubled the Load***'
    pos=h.find(marker)
    if pos!=-1:
        end=h.find('\n',pos)+1
        h=h[:end]+rowh+h[end:]
write('notes/对话交接文档.md',h)

# Final-version guard: register article 25 as a first-class authoritative final.
g=read('scripts/final-version-guard.js')
source="  '25': { source: '2026-08-23对话中经多轮史实核对与整体精修形成的270词最终精进锁定稿；修正六个月死亡数为4/55对14/52，并严格区分随机序列、分配隐藏与结局盲法', verification: 'conversation-latest-final' },\n"
if "'25': { source:" not in g:
    g=g.replace('\n};\n\nconst VERSION_IDS = {', '\n'+source+'};\n\nconst VERSION_IDS = {',1)
vid="  '25': '25-270-word-final-locked',\n"
if "'25': '25-270-word-final-locked'" not in g:
    idx=g.index('\n};\n\nconst SUPERSEDED_SIGNATURES =')
    g=g[:idx]+'\n'+vid+g[idx:]
g=g.replace('第01—20篇的权威数据','第01—25篇的权威数据')
g=g.replace('本次同步完成后，主分支的20篇均为当前已知的最后最终版本；第20篇269词最终精进稿是当前唯一权威版本。','本次同步完成后，主分支的25篇均为当前已知的最后最终版本；第25篇270词最终精进锁定稿是当前最新权威版本。')
write('scripts/final-version-guard.js',g)

# Validation workflow: archive counts, runtime entry points, and latest identity.
w=read('.github/workflows/validate-content.yml')
w=w.replace('24 篇已生成 · 1200 个重点词 · 全部通过','25 篇已生成 · 1250 个重点词 · 全部通过')
w=w.replace("grep -q '二十篇《经济学人》风格双语科普短文' index.html","grep -q '二十五篇《经济学人》风格双语科普短文' index.html")
w=w.replace("grep -q '1000词词库' words.html","grep -q '1250词词库' words.html")
w=w.replace("grep -q '共有 \\*\\*24篇文章、1200个重点词\\*\\*' README.md","grep -q '共有 \\*\\*25篇文章、1250个重点词\\*\\*' README.md")
w=w.replace("grep -q '当前权威状态：\\*\\*二十四篇最终定稿，1200个重点词' notes/对话交接文档.md","grep -q '当前权威状态：\\*\\*二十五篇最终定稿，1250个重点词' notes/对话交接文档.md")
w=w.replace("grep -q '下一篇编号为 \\*\\*21\\*\\*' notes/对话交接文档.md","grep -q '第二十五篇最终精进锁定稿' notes/对话交接文档.md")
for page in ['index.html','article.html','words.html']:
    pass
if "grep -q 'data/article-25.js' \"$page\"" not in w:
    w=w.replace("grep -q 'data/article-20.js' \"$page\"","grep -q 'data/article-20.js' \"$page\"\n            grep -q 'data/article-25.js' \"$page\"")
if "grep -q 'the-patient-came-before-the-envelope' index.html" not in w:
    w=w.replace("grep -q 'the-market-came-after-the-limit' index.html","grep -q 'the-market-came-after-the-limit' index.html\n          grep -q 'the-patient-came-before-the-envelope' index.html")
# extend explicit identity test
needle="            '20': { words: 267, keywords: 50, density: 18.7, status: '第二十篇最终精进锁定稿' }\n"
if "'25': { words: 270" not in w and needle in w:
    replacement=needle.rstrip()+",\n            '21': { words: 270, keywords: 50, density: 18.5, status: '第二十一篇定稿' },\n            '22': { words: 270, keywords: 50, density: 18.5, status: '第二十二篇定稿' },\n            '23': { words: 269, keywords: 50, density: 18.6, status: '第二十三篇定稿' },\n            '24': { words: 263, keywords: 50, density: 19.0, status: '第二十四篇定稿' },\n            '25': { words: 270, keywords: 50, density: 18.5, status: '第二十五篇最终精进锁定稿' }\n"
    w=w.replace(needle,replacement)
w=w.replace('Check articles 16 to 20 final identities','Check articles 16 to 25 final identities').replace("console.log('articles 16 to 20 latest final identities verified');","console.log('articles 16 to 25 latest final identities verified');")
write('.github/workflows/validate-content.yml',w)

# Sitemap entry.
smap=read('sitemap.xml')
slug='the-patient-came-before-the-envelope'
if slug not in smap:
    entry=f'  <url><loc>https://alienrocketbus.github.io/postgraduate-vocabulary/article.html?a={slug}</loc></url>\n'
    smap=smap.replace('</urlset>',entry+'</urlset>')
write('sitemap.xml',smap)

# Intake note.
note=ROOT/'notes/第二十五篇入库记录_2026-08-23.md'
note.write_text('''# 第二十五篇入库记录 · 2026-08-23\n\n- 标题：*The Patient Came Before the Envelope* / 《先定病人，再开信封》\n- 题材：1947—1948年英国MRC链霉素肺结核试验、随机序列与分配隐藏\n- 状态：第二十五篇最终精进锁定稿\n- 指标：270词 / 50重点词 / 18.5%\n- 核心机制：患者资格必须先固定，随后才允许打开按随机数序列准备的密封信封；随机数使顺序不可预测，隐藏分配使已经生成的答案不可提前读取。\n- 史实终审：六个月死亡数采用原始报告口径——链霉素组4/55，对照组14/52；影像学“considerable improvement”为28对4。\n- 边界：不宣称这是历史上第一次随机分配；治疗本身未在病床旁盲法，但胸片与细菌学结局评定实行盲法。\n- 同步要求：权威数据、Markdown、1250词库、网站入口、README、交接、manifest、审计、sitemap与CI必须同时一致。\n''',encoding='utf-8')

# Generate canonical Markdown and enforce cross-archive uniqueness.
subprocess.run(['python3','scripts/build_markdown.py'],cwd=ROOT,check=True)
# Generate fingerprints/manifest after every synchronized surface is present.
subprocess.run(['node','scripts/final-version-guard.js','--write-manifest'],cwd=ROOT,check=True)
# Revalidate generated manifest immediately.
subprocess.run(['node','scripts/final-version-guard.js'],cwd=ROOT,check=True)

# Remove one-shot machinery before the commit produced by the workflow.
for p in [ROOT/'scripts/sync_article25.py', ROOT/'.github/workflows/sync-article25.yml']:
    if p.exists(): p.unlink()
