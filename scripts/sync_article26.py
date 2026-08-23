#!/usr/bin/env python3
from pathlib import Path
ROOT = Path(__file__).resolve().parent.parent

def rw(path, pairs):
    text = path.read_text(encoding='utf-8')
    for a,b in pairs:
        text = text.replace(a,b)
    path.write_text(text, encoding='utf-8')

def insert_after(path, needle, line):
    text = path.read_text(encoding='utf-8')
    if line in text: return
    lines = text.splitlines()
    for i,x in enumerate(lines):
        if needle in x and x.lstrip().startswith('|'):
            lines.insert(i+1,line)
            path.write_text('\n'.join(lines)+'\n',encoding='utf-8')
            return
    path.write_text(text.rstrip()+'\n\n'+line+'\n',encoding='utf-8')

readme=ROOT/'README.md'
rw(readme,[('25篇文章、1250个重点词','26篇文章、1300个重点词'),('1000词索引','1300词索引'),('1250词索引','1300词索引')])
insert_after(readme,'The Patient Came Before the Envelope','| **26** | ***The Image Arrived Two Days Later*** | **1957—1979年Cormack、Hounsfield与计算机断层成像** | **270词 · 50词 · 18.5%** | [网页](https://alienrocketbus.github.io/postgraduate-vocabulary/article.html?a=the-image-arrived-two-days-later) · [Markdown](articles/26-the-image-arrived-two-days-later.md) |')

handoff=ROOT/'notes'/'对话交接文档.md'
rw(handoff,[('二十五篇最终定稿，1250个重点词','二十六篇最终定稿，1300个重点词'),('25篇 / 1250','26篇 / 1300'),('25 篇 / 1250','26 篇 / 1300')])
insert_after(handoff,'The Patient Came Before the Envelope','| **26** | ***The Image Arrived Two Days Later*** | **1957—1979年Cormack、Hounsfield与计算机断层成像** | **270 / 50 / 18.5%** | **第二十六篇最终精进锁定稿** |')

for name in ('index.html','article.html','words.html'):
    p=ROOT/name
    text=p.read_text(encoding='utf-8')
    t25='<script src="data/article-25.js"></script>'
    t26='<script src="data/article-26.js"></script>'
    if t26 not in text and t25 in text: text=text.replace(t25,t25+'\n  '+t26)
    for a,b in [('第二十五篇已入库','第二十六篇已入库'),('二十五篇','二十六篇'),('25篇','26篇'),('1250词','1300词'),('1250个词','1300个词'),('1250 个词','1300 个词'),('01—25','01—26')]: text=text.replace(a,b)
    p.write_text(text,encoding='utf-8')

s=ROOT/'sitemap.xml'; text=s.read_text(encoding='utf-8')
u='  <url><loc>https://alienrocketbus.github.io/postgraduate-vocabulary/article.html?a=the-image-arrived-two-days-later</loc></url>'
if u not in text: text=text.replace('</urlset>',u+'\n</urlset>')
s.write_text(text,encoding='utf-8')

g=ROOT/'scripts'/'final-version-guard.js'; text=g.read_text(encoding='utf-8')
if "'26': { source:" not in text:
    marker="\n};\n\nconst VERSION_IDS = {"
    insert="\n  '26': { source: '2026-08-23第26篇CT主题最终终审锁定稿；经史实、技术术语、功劳边界与前1250词双层去重，并由仓库构建器验证26篇/1300词全部通过', verification: 'conversation-latest-final' },"
    text=text.replace(marker,insert+marker,1)
if "'26': '26-270-word-final-locked'" not in text:
    text=text.replace("  '25': '25-270-word-final-locked',\n", "  '25': '25-270-word-final-locked',\n  '26': '26-270-word-final-locked',\n",1)
text=text.replace("25篇文章、1250个重点词","26篇文章、1300个重点词")
text=text.replace("二十五篇最终定稿，1250个重点词","二十六篇最终定稿，1300个重点词")
text=text.replace("if (!readme.includes('The Patient Came Before the Envelope')) errors.push('README article 25 missing');","if (!readme.includes('The Patient Came Before the Envelope')) errors.push('README article 25 missing');\n  if (!readme.includes('The Image Arrived Two Days Later')) errors.push('README article 26 missing');")
text=text.replace("if (!handoff.includes('第二十五篇最终精进锁定稿')) errors.push('handoff article 25 missing');","if (!handoff.includes('第二十五篇最终精进锁定稿')) errors.push('handoff article 25 missing');\n  if (!handoff.includes('第二十六篇最终精进锁定稿')) errors.push('handoff article 26 missing');")
text=text.replace('第01—25篇','第01—26篇').replace('25篇 / 1250个重点词','26篇 / 1300个重点词').replace('主分支的25篇均以manifest指纹为唯一权威身份；第25篇为当前最新最终精进锁定稿。','主分支的26篇均以manifest指纹为唯一权威身份；第26篇为当前最新最终精进锁定稿。')
g.write_text(text,encoding='utf-8')

record=ROOT/'notes'/'第二十六篇入库记录_2026-08-23.md'
record.write_text('''# 第二十六篇入库记录 · 2026-08-23\n\n- 标题：*The Image Arrived Two Days Later* / 《图像两天后才出现》\n- 状态：第二十六篇最终精进锁定稿\n- 指标：270词 / 50重点词 / 18.5%\n- 全库：26篇 / 1300重点词\n- 终审：修复全部跨篇词元与加粗表面形式冲突；最终仓库构建器输出“26 篇已生成 · 1300 个重点词 · 全部通过”。\n- 版本规则：正文、中文、50词表、Markdown、manifest、网站入口、README、交接文档和sitemap同步后方可合并main。\n''',encoding='utf-8')

# One-shot synchronizer removes itself after producing the final state.
Path(__file__).unlink()
