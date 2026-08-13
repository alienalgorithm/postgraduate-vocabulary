#!/usr/bin/env node
'use strict';
const fs=require('fs');
const path=require('path');
globalThis.window=globalThis;
require(path.resolve('data/article-20.js'));
const a=globalThis.SITE.ARTICLES.find(x=>x.id==='20');
a.status='第二十篇最终精进锁定稿';
a.metrics={words:269,keywords:50,density:18.6};
a.standfirst='1990年，美国没有让市场决定可以污染多少；法律先设定二氧化硫总量，监测系统逐吨记账，交易只决定减排在哪里发生。';
a.paras[0]={
 en:'In 1990, US **legislation** confronted acid rain from power-plant **smokestacks**. Coal-fired **utilities** released **sulphur** **dioxide**, a **precursor** to acidic **deposition** that damaged lakes and forests. Congress did not **prescribe** **standardised** machinery. It imposed a binding national **ceiling**: by 2010, annual emissions were capped at 8.95 million tons, about half the 1980 level.',
 zh:'1990年，美国通过**立法**(legislation)治理发电厂**烟囱**(smokestacks)造成的酸雨。燃煤**公用事业企业**(utilities)排放**硫**(sulphur)**二氧化物**(dioxide)；它是酸性**沉降**(deposition)的**前体物**(precursor)，后者会损害湖泊和森林。国会没有**规定**(prescribe)所有电厂采用**标准化的**(standardised)设备，而是设下一道具有约束力的全国**上限**(ceiling)：到2010年，年度排放总量不得超过895万吨，约为1980年水平的一半。'
};
a.paras[2]={
 en:"Markets worked only because the **accounting** was hard-edged. Stack **sensors** measured emissions continuously; each allowance carried a **serial** number in a public **registry**. At year's end, plants had to **surrender** allowances matching actual emissions. A **shortfall** brought an automatic **penalty** and required the **overrun** to be **offset** next year. Allowances could not **override** local air-quality rules.",
 zh:'这套市场之所以能运转，是因为排放**核算**(accounting)毫不含糊。烟囱上的**传感器**(sensors)持续测量排放；每份额度都带有**序列编号**(serial)，并记录在公开**登记系统**(registry)中。每年结束时，电厂必须**交回**(surrender)与实际排放量相等的额度。额度**不足**(shortfall)会自动触发**处罚**(penalty)，企业还须在下一年**抵消**(offset)这部分**超额量**(overrun)。排放额度也不能**凌驾于**(override)地方空气质量规则之上。'
};
a.paras[3]={
 en:'Phase I began in 1995. Some plants were **retrofitted** with scrubbers; others bought low-sulphur coal whose **haulage** cost had fallen. Reductions arrived **ahead** of schedule; compliance **expense** fell below early **forecasts**. By 2008, emissions were below the 2010 cap. But trading was not the sole **contributor**: **competition** among **carriers**, engineering **improvements** and later rules also **accelerated** the decline.',
 zh:'第一阶段于1995年启动。一些电厂**加装了**(retrofitted)洗涤器；另一些则购买因**运输**(haulage)成本下降而更便宜的低硫煤。减排进度**早于**(ahead)计划，合规**开支**(expense)也低于早期**预测**(forecasts)。到2008年，排放量已经低于2010年才正式生效的总量上限。但交易并不是唯一的**促成因素**(contributor)：**承运商**(carriers)之间的**竞争**(competition)、工程技术**改进**(improvements)和后续规则也**加快了**(accelerated)下降。'
};
a.paras[4].en=a.paras[4].en.replace('lies in the sequence.','lies in the sequence itself.');
a.paras[4].zh=a.paras[4].zh.replace('启示在于这个顺序：','启示在于这一顺序本身：');
const text=`/* 20 · ${a.title}\n   Canonical data extension. Loaded after data/articles.js.\n*/\n(function (root) {\n  'use strict';\n  var article = ${JSON.stringify(a,null,2)};\n  root.SITE = root.SITE || {};\n  root.SITE.ARTICLES = root.SITE.ARTICLES || [];\n  if (!root.SITE.ARTICLES.some(function (item) { return item.id === article.id; })) {\n    root.SITE.ARTICLES.push(article);\n  }\n})(typeof window !== 'undefined' ? window : globalThis);\n`;
fs.writeFileSync('data/article-20.js',text,'utf8');
