from pathlib import Path
p=Path('scripts/final-version-guard.js')
s=p.read_text(encoding='utf-8')
def one(a,b,label):
 global s
 n=s.count(a)
 if n!=1: raise SystemExit(f'{label}: {n}')
 s=s.replace(a,b,1)
one("  '20': { source: '2026-08-13对话中形成并完成环境经济学机制审查与1000词全库复验的269词最终精进锁定稿', verification: 'conversation-latest-final' },","  '20': { source: '2026-08-13对话中完成术语、监测、成本归因与制度边界终审的269词最终精进锁定稿', verification: 'conversation-latest-final' },",'source')
one("  '20': '20-269-word-final-max',","  '20': '20-269-word-definitive-final',",'version')
old="""  '20': [
    'Congress did not **prescribe** **uniform** machinery.',
    '**purchase** permits',
    'Continuous **monitors** measured each stack',
    'the **excess**',
    '**freight** cost',
    '**railway** **competition**',
    '263 词 / 50 重点词 / 密度 19.0%',
    'The **institutional** lesson is sharper.',
  ],"""
new="""  '20': [
    'Congress did not **prescribe** **uniform** machinery.',
    '**purchase** permits',
    'Continuous **monitors** measured each stack',
    'the **excess**',
    '**freight** cost',
    '**railway** **competition**',
    '263 词 / 50 重点词 / 密度 19.0%',
    'The **institutional** lesson is sharper.',
    'US **legislation** confronted acid rain',
    'a **precursor** to acidic **deposition**',
    '**procure** permits',
    'sell a **surplus**; unused units',
    'Markets worked only because',
    'brought an automatic **penalty** and required',
    'local air-quality rules',
    'compliance **expense** fell below',
    '**competition** among **carriers**',
    'the **acceptable** total',
    'most **cheaply**',
    'a **bounded** quantity',
    '**ration** **permission**',
  ],"""
one(old,new,'signatures')
s=s.replace('第01—19篇继续保持此前锁定指纹；第20篇269词最终精进锁定稿已完成制度机制、功劳边界、语言精度和1000词全库复验。','第01—19篇继续保持此前锁定指纹；第20篇269词最终精进锁定稿已完成术语、监测、成本归因、制度边界与1000词全库复验。')
s=s.replace('第20篇：269词最终精进锁定稿以美国酸雨计划为机制主线，严格区分法律设定总量、额度交易选择路径、监测与年度对账保障执行，以及运输、工程和后续规则的共同贡献。','第20篇：269词最终精进锁定稿严格区分法定总量、额度再配置、连续监测、未来额度弥补、铁路运输成本、边际减排成本和后续法规的不同作用。')
p.write_text(s,encoding='utf-8')
print('guard patched')
