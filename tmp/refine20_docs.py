from pathlib import Path

def patch(path,repls):
 p=Path(path);s=p.read_text(encoding='utf-8')
 for old,new,label in repls:
  n=s.count(old)
  if n!=1: raise SystemExit(f'{label}: {n}')
  s=s.replace(old,new,1)
 p.write_text(s,encoding='utf-8')

patch('README.md',[(
'第20篇以269词最终精进锁定稿为准。文章把酸雨计划拆成四个不可调换的环节：法律先设895万吨总量上限；一吨一份的额度让企业选择洗涤器、低硫煤或交易；连续监测、年度交回、自动处罚与次年弥补保证总量可核验；价格只揭示减排在哪里更便宜，不能替大气决定预算。',
'第20篇以269词最终精进锁定稿为准。终审彻底区分了 `allowance` 与一般意义上的 `permit`，把额度缺口明确写成自动处罚并用未来额度弥补，将铁路承运商竞争限定为运输成本来源，并以 `statutory / marginal / reallocate` 三个更准确的词收紧制度结论：法律先设法定总量，交易只重新配置许可并暴露相对边际成本。','readme')])

repls=[
('> In 1990, US **legislation** confronted acid rain from power-plant **smokestacks**.','> In 1990, US **legislation** targeted acid-rain pollution from power-plant **smokestacks**.','opening'),
('> A market can **ration** **permission**—but it cannot choose the atmosphere’s budget.','> A market can **reallocate** **permission**—but it cannot set the atmosphere’s budget.','ending'),
('2. 每份额度对应一吨排放；企业可以使用、出售或留存额度，但交易不能扩大总量上限。','2. 每份额度对应一吨排放；企业可以使用、出售、购入或留存额度。留存会使单年排放波动，但交易不能扩大法定额度供给。','boundary2'),
('5. 持有额度不代表可以违反地方空气质量和公共健康标准。','5. 持有额度不代表可以突破以保护公众健康为目的的其他空气质量限值。','boundary5'),
('7. 低硫煤运输成本、承运商竞争、工程改进和后续规则共同影响了减排速度与成本，不能把全部功劳归给交易。','7. 铁路承运商竞争主要降低运输成本；工程改进、后续法规和能源结构变化也影响减排，不能把全部功劳归给交易。','boundary7'),
('8. 结尾的独特论点是：法律决定大气预算，市场只在这个有边界的预算内寻找更低成本的减排地点。','8. 结尾的独特论点是：法律先设法定排放上限，交易再重新配置许可并揭示较低的边际减排成本；市场不能反过来设定大气预算。','boundary8'),
('''- 使用 `uniform / purchase / monitors / excess / freight / railway` 这一组与前文重复的候选词
- 把额度交易写成市场自行决定可以污染多少
- 省略连续监测、年度对账、处罚或次年弥补机制
- 把全部减排与成本下降只归功于交易''','''- 使用 `uniform / purchase / monitors / excess / freight / railway` 这一组与前文重复的候选词
- 使用 `procure permits`，混淆排放额度与一般许可证
- 使用 `acceptable / cheaply / ration`，把法定边界、边际成本和额度再配置写得过宽
- 把额度交易写成市场自行决定可以污染多少
- 省略连续监测、年度对账、自动处罚或未来额度弥补机制
- 把铁路竞争直接写成全部减排的原因，或把全部成果只归功于交易''','obsolete')]
patch('notes/对话交接文档.md',repls)
print('docs patched')
