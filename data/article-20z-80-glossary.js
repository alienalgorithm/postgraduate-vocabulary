(function(root){
  var a=root.SITE.ARTICLES.find(function(x){return x.id==='20';});
  var defs=[
    '立法；法律','烟囱；大烟囱','公用事业企业；效用','硫','二氧化物','前体物；先驱','沉降；沉积','规定；开处方','统一的；制服','上限；天花板',
    '预算','排放额度；津贴','授权；允许','洗涤器；刷洗工具','购买；购得物','剩余；盈余','存留；银行','灵活性','替代方案；可供选择的','配额；限额',
    '核算；会计','监测仪；监控','序列的；连续剧','登记系统；注册处','交回；放弃','不足；缺口','处罚；罚金','超额；过量','抵消；补偿','凌驾于；推翻',
    '加装；改造','货运；货物','提前；在前面','开支；代价','预测；预报','促成因素；贡献者','铁路','竞争；比赛','改进；改善','加快；加速',
    '制度层面的；机构的','立法者','可接受的','揭示；披露','低成本地；便宜地','有边界的；受限制的','可信的','对账；调和','配给；定量供应','许可；准许'
  ];
  function lemma(w){
    w=w.toLowerCase();
    if(w.endsWith('ies')) return w.slice(0,-3)+'y';
    if(w.endsWith('ising')) return w.slice(0,-3)+'e';
    if(w.endsWith('tted')) return w.slice(0,-3);
    if(w.endsWith('ated')||w.endsWith('osed')) return w.slice(0,-1);
    if(w.endsWith('ded')) return w;
    if(w.endsWith('ed')) return w.slice(0,-2);
    if(w.endsWith('s')&&!w.endsWith('ss')) return w.slice(0,-1);
    return w;
  }
  var out=[],n=0;
  a.paras.forEach(function(p,i){(p.en.match(/\*\*(.+?)\*\*/g)||[]).forEach(function(raw){out.push({w:lemma(raw.slice(2,-2)),zh:defs[n++],p:i+1});});});
  a.glossary=out;
})(typeof window!=='undefined'?window:globalThis);
