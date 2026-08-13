#!/usr/bin/env python3
from pathlib import Path

def r(p): return Path(p).read_text(encoding='utf-8')
def w(p,s): Path(p).write_text(s,encoding='utf-8')
def one(s,a,b,label):
    if s.count(a)!=1: raise SystemExit(f'{label}: {s.count(a)} matches')
    return s.replace(a,b,1)

p='scripts/final-version-guard.js';s=r(p)
s=one(s,"  '19': { source: '2026-08-13对话中形成并完成最终上限审查、因果链精修与950词全库复验的270词最终精进锁定稿', verification: 'conversation-latest-final' },\n};","  '19': { source: '2026-08-13对话中形成并完成最终上限审查、因果链精修与950词全库复验的270词最终精进锁定稿', verification: 'conversation-latest-final' },\n  '20': { source: '2026-08-13对话中形成并完成环境经济学机制审查与1000词全库复验的269词最终精进锁定稿', verification: 'conversation-latest-final' },\n};",'guard source20')
s=one(s,"  '19': '19-270-word-definitive-final',\n};","  '19': '19-270-word-definitive-final',\n  '20': '20-269-word-final-max',\n};",'guard version20')
needle="    '计算机没有假装一切正常',\n  ],\n};\n\nfunction loadArticles()"
insert="    '计算机没有假装一切正常',\n  ],\n  '20': [\n    'Congress did not **prescribe** **uniform** machinery.',\n    '**purchase** permits',\n    'Continuous **monitors** measured each stack',\n    'the **excess**',\n    '**freight** cost',\n    '**railway** **competition**',\n    '263 词 / 50 重点词 / 密度 19.0%',\n    'The **institutional** lesson is sharper.',\n  ],\n};\n\nfunction loadArticles()"
s=one(s,needle,insert,'guard superseded20')
readme_check="""  if (!readme.includes('| **20** | ***The Market Came After the Limit*** | **1990—2010年美国酸雨计划、二氧化硫总量控制与排放权交易** | **269词 · 50词 · 18.6%** |')) {
    errors.push('README article 20 final row is stale');
  }
"""
s=one(s,"  if (!handoff.includes('## 2. 最终版本铁律（最高优先级）')) errors.push('handoff final-version rule missing');",readme_check+"  if (!handoff.includes('## 2. 最终版本铁律（最高优先级）')) errors.push('handoff final-version rule missing');",'guard README20')
handoff_check="""  if (!handoff.includes('| **20** | ***The Market Came After the Limit*** | **1990—2010年美国酸雨计划、二氧化硫总量控制与排放权交易** | **269 / 50 / 18.6%** | **第二十篇最终精进锁定稿** |')) {
    errors.push('handoff article 20 final row is stale');
  }
"""
s=one(s,'  return errors;\n}\n\nfunction auditReport',handoff_check+'  return errors;\n}\n\nfunction auditReport','guard handoff20')
s=s.replace('第01—19篇的权威数据','第01—20篇的权威数据')
s=s.replace('第01—18篇继续保持此前锁定指纹；第19篇270词最终精进锁定稿已完成最终上限审查，警报计数、雷达负载因果、优先级调度、检查点恢复、地面判断与结尾定义均已收紧，并通过950词全库复验。','第01—19篇继续保持此前锁定指纹；第20篇269词最终精进锁定稿已完成制度机制、功劳边界、语言精度和1000词全库复验。')
old="    '- 第19篇：270词最终精进锁定稿以阿波罗11号五次程序警报为叙事锚点，区分过载原因、优先级重启机制与地面“继续”判断；最终上限审查进一步明确四次1202与一次1201、开关配置与交流相位失配、按优先级调度、记录检查点恢复，以及警报并非自动中止命令。',"
new=old+"\n    '- 第20篇：269词最终精进锁定稿以美国酸雨计划为机制主线，严格区分法律设定总量、额度交易选择路径、监测与年度对账保障执行，以及运输、工程和后续规则的共同贡献。',"
s=one(s,old,new,'guard audit20')
s=s.replace('主分支的19篇均为当前已知的最后最终版本；第19篇270词最终精进稿是当前唯一权威版本。','主分支的20篇均为当前已知的最后最终版本；第20篇269词最终精进稿是当前唯一权威版本。')
w(p,s)

p='.github/workflows/validate-content.yml';s=r(p)
s=s.replace('19 篇已生成 · 950 个重点词 · 全部通过','20 篇已生成 · 1000 个重点词 · 全部通过')
s=s.replace('test -f notes/第十九篇入库记录_2026-08-13.md','test -f notes/第十九篇入库记录_2026-08-13.md\n          test -f notes/第二十篇入库记录_2026-08-13.md')
s=s.replace("            grep -q 'data/article-19.js' \"$page\"","            grep -q 'data/article-19.js' \"$page\"\n            grep -q 'data/article-20.js' \"$page\"")
s=s.replace("grep -q '十九篇《经济学人》风格双语科普短文' index.html","grep -q '二十篇《经济学人》风格双语科普短文' index.html")
s=s.replace("grep -q '950词词库' words.html","grep -q '1000词词库' words.html")
s=s.replace("grep -q 'five-alarms-still-descending' index.html","grep -q 'the-market-came-after-the-limit' index.html")
s=s.replace("grep -q 'five-alarms-still-descending' sitemap.xml","grep -q 'the-market-came-after-the-limit' sitemap.xml")
s=s.replace("grep -q '共有 \\*\\*19篇文章、950个重点词\\*\\*' README.md","grep -q '共有 \\*\\*20篇文章、1000个重点词\\*\\*' README.md")
s=s.replace("grep -q '当前权威状态：\\*\\*十九篇最终定稿，950个重点词' notes/对话交接文档.md","grep -q '当前权威状态：\\*\\*二十篇最终定稿，1000个重点词' notes/对话交接文档.md")
s=s.replace("grep -q '下一篇编号为 \\*\\*20\\*\\*' notes/对话交接文档.md","grep -q '下一篇编号为 \\*\\*21\\*\\*' notes/对话交接文档.md")
s=s.replace('Check articles 16 to 19 final identities','Check articles 16 to 20 final identities')
s=one(s,"            '19': { words: 270, keywords: 50, density: 18.5, status: '第十九篇最终精进锁定稿' }","            '19': { words: 270, keywords: 50, density: 18.5, status: '第十九篇最终精进锁定稿' },\n            '20': { words: 269, keywords: 50, density: 18.6, status: '第二十篇最终精进锁定稿' }",'CI expected20')
s=s.replace("console.log('articles 16 to 19 latest final identities verified');","console.log('articles 16 to 20 latest final identities verified');")
w(p,s)
print('final guard and CI updated')
