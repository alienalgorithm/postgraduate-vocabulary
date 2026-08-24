(function(){
  'use strict';
  var slug=new URLSearchParams(location.search).get('a');
  if(slug!=='the-cable-stretched-every-pulse')return;
  var facts=document.getElementById('factsSection');
  if(!facts||document.getElementById('visualSection'))return;
  var section=document.createElement('section');
  section.className='content-section visual-section';
  section.id='visualSection';
  section.setAttribute('aria-labelledby','visualHeading');
  section.innerHTML='\
    <div class="content-heading">\
      <div><p class="eyebrow">VISUAL MECHANISM</p><h2 id="visualHeading">机制图解</h2></div>\
      <p>两张原创示意图，把第27篇最关键的物理机制直接画出来。</p>\
    </div>\
    <div class="article-visual-grid">\
      <figure class="article-visual-card">\
        <img src="assets/images/article-27/pulse-dispersion.svg" alt="示意图：短电报脉冲进入长海底电缆后被拉宽，相邻脉冲逐渐发生重叠" loading="lazy">\
        <figcaption><b>长电缆如何把脉冲拉宽</b>左侧是时间上彼此分开的短脉冲；经过长距离海底电缆后，波形被拉宽，符号间原有的时间分离开始缩小。示意图不按比例。<br><a href="https://www.cambridge.org/core/books/imperial-science/wildman-whitehouse-william-thomson-and-the-first-atlantic-cable/28CC0EE56CCC49F8170F92A364BBBEF9" target="_blank" rel="noopener noreferrer">机制参考：Cambridge University Press</a></figcaption>\
      </figure>\
      <figure class="article-visual-card">\
        <img src="assets/images/article-27/mirror-galvanometer.svg" alt="示意图：Thomson镜式检流计用悬镜和反射光点把极微小的电流偏转放大到远处刻度" loading="lazy">\
        <figcaption><b>镜式检流计如何放大微弱电流</b>极小电流只让悬镜转过很小角度；反射光走到远处刻度后，这个角度变化变成明显的光点位移，因此无需继续提高发送端电压也能读出更弱的信号。<br><a href="https://collection.sciencemuseumgroup.org.uk/objects/co6228/mirror-galvanometer-for-the-transatlantic-telegraph-1858" target="_blank" rel="noopener noreferrer">实物与机制参考：Science Museum Group</a></figcaption>\
      </figure>\
      <p class="article-visual-note">图片为本项目原创机制示意图，不是对博物馆照片或历史版画的描摹；历史资料只用于核实装置和传输机制。</p>\
    </div>';
  facts.parentNode.insertBefore(section,facts);
})();
