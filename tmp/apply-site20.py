#!/usr/bin/env python3
from pathlib import Path

def r(p): return Path(p).read_text(encoding='utf-8')
def w(p,s): Path(p).write_text(s,encoding='utf-8')
def one(s,a,b,label):
    if s.count(a)!=1: raise SystemExit(f'{label}: {s.count(a)} matches')
    return s.replace(a,b,1)

for p in ('index.html','article.html','words.html'):
    s=r(p)
    s=one(s,'<script src="data/article-19.js"></script>\n','<script src="data/article-19.js"></script>\n<script src="data/article-20.js"></script>\n',p+' script20')
    w(p,s)

p='index.html';s=r(p)
for a,b in (
('十九篇《经济学人》风格双语科普短文，950个考研重点词','二十篇《经济学人》风格双语科普短文，1000个考研重点词'),
('把950个考研词放回值得读完的知识故事里。','把1000个考研词放回值得读完的知识故事里。'),
('考研词汇 · 双语科普读本 · 第十九篇已入库','考研词汇 · 双语科普读本 · 第二十篇已入库'),
('article.html?a=five-alarms-still-descending','article.html?a=the-market-came-after-the-limit'),
('浏览950词词库','浏览1000词词库'),
('1201 / 1202 · EXEC OVERFLOW','8.95M-TON CAP · ONE-TON ALLOWANCES'),
('FIVE ALARMS, STILL DESCENDING','THE MARKET CAME AFTER THE LIMIT'),
('NEW · 19','NEW · 20'),
('五次程序警报在下降途中亮起；计算机丢弃可等待的任务，地面团队则必须判断过载后的‘鹰号’是否仍能继续。','法律先设定二氧化硫排放上限，监测系统逐吨核算；交易只负责寻找成本更低的减排路径。'),
('十九篇知识故事','二十篇知识故事'),
('从霍乱、深海生态与臭氧洞，到地球内核、原子结构、宇宙余辉，以及一台在过载中继续导航的登月计算机。','从霍乱、深海生态与臭氧洞，到原子结构、登月软件，以及一套先设总量、再让价格寻找减排路径的酸雨制度。'),
('950词索引','1000词索引'),
('十九篇 · 950重点词 · 每篇密度低于20%','二十篇 · 1000重点词 · 每篇密度低于20%')):
    s=one(s,a,b,'index '+a[:16])
w(p,s)

p='article.html';s=r(p).replace('十九篇考研词汇双语科普文章','二十篇考研词汇双语科普文章').replace('950词索引','1000词索引');w(p,s)
p='words.html';s=r(p)
for a,b in (
('<title>950词词库 · 记词</title>','<title>1000词词库 · 记词</title>'),
('十九篇双语科普文章使用过的950个考研重点词','二十篇双语科普文章使用过的1000个考研重点词'),
('VOCABULARY INDEX · 01—19','VOCABULARY INDEX · 01—20'),
('950个词，','1000个词，'),
('article.html?a=five-alarms-still-descending','article.html?a=the-market-came-after-the-limit'),
('950个词元 · 19篇文章 · 可追溯到原文','1000个词元 · 20篇文章 · 可追溯到原文')):
    s=one(s,a,b,'words '+a)
w(p,s)

w('404.html',r('404.html').replace('打开950词词库','打开1000词词库'))
w('manifest.webmanifest',r('manifest.webmanifest').replace('十九篇双语科普短文与950个考研重点词。','二十篇双语科普短文与1000个考研重点词。'))
w('assets/share-card.svg',r('assets/share-card.svg').replace('十九篇双语科普短文 · 950个考研重点词','二十篇双语科普短文 · 1000个考研重点词').replace('WORDS IN CONTEXT · 01—19','WORDS IN CONTEXT · 01—20'))
p='sitemap.xml';s=r(p);s=one(s,'  <url><loc>https://alienrocketbus.github.io/postgraduate-vocabulary/article.html?a=five-alarms-still-descending</loc></url>\n</urlset>','  <url><loc>https://alienrocketbus.github.io/postgraduate-vocabulary/article.html?a=five-alarms-still-descending</loc></url>\n  <url><loc>https://alienrocketbus.github.io/postgraduate-vocabulary/article.html?a=the-market-came-after-the-limit</loc></url>\n</urlset>','sitemap20');w(p,s)

p='README.md';s=r(p)
s=s.replace('打印和950词索引','打印和1000词索引')
s=one(s,'截至2026-08-13，共有 **19篇文章、950个重点词**。','截至2026-08-13，共有 **20篇文章、1000个重点词**。','README count')
old="| **19** | ***Five Alarms, Still Descending*** | **1969年阿波罗11号1201/1202程序警报、优先级软件与地面‘继续’判断** | **270词 · 50词 · 18.5%** | [网页](https://alienrocketbus.github.io/postgraduate-vocabulary/article.html?a=five-alarms-still-descending) · [Markdown](articles/19-five-alarms-still-descending.md) |"
new=old+"\n| **20** | ***The Market Came After the Limit*** | **1990—2010年美国酸雨计划、二氧化硫总量控制与排放权交易** | **269词 · 50词 · 18.6%** | [网页](https://alienrocketbus.github.io/postgraduate-vocabulary/article.html?a=the-market-came-after-the-limit) · [Markdown](articles/20-the-market-came-after-the-limit.md) |"
s=one(s,old,new,'README row20')
summary='第20篇以269词最终精进锁定稿为准。文章把酸雨计划拆成四个不可调换的环节：法律先设895万吨总量上限；一吨一份的额度让企业选择洗涤器、低硫煤或交易；连续监测、年度交回、自动处罚与次年弥补保证总量可核验；价格只揭示减排在哪里更便宜，不能替大气决定预算。\n\n'
s=one(s,'第19篇以270词最终精进锁定稿为准。',summary+'第19篇以270词最终精进锁定稿为准。','README summary20')
s=s.replace('网站当前实际加载第01—19篇，并自动计算19篇、950个重点词和1595个尚未使用词元。','网站当前实际加载第01—20篇，并自动计算20篇、1000个重点词和1545个尚未使用词元。')
s=s.replace('第19篇作为最新定稿专题展示','第20篇作为最新定稿专题展示').replace('十九篇文章卡片','二十篇文章卡片').replace('### 950词词库','### 1000词词库')
s=s.replace('data/article-19.js    # 第19篇','data/article-19.js    # 第19篇\ndata/article-20.js    # 第20篇').replace('article-08.js—article-18.js','article-08.js—article-20.js').replace('01—19 Markdown定稿','01—20 Markdown定稿')
w(p,s)
print('site and README updated')
