/* 记词 · shared application bootstrap */
(function(){
  'use strict';
  var S=window.SITE||{ARTICLES:[],vocabTotal:0};
  var A=(S.ARTICLES||[]).slice().sort(function(a,b){return String(a.id).localeCompare(String(b.id),undefined,{numeric:true});});
  function $(s,r){return (r||document).querySelector(s)}
  function $$(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s))}
  function esc(v){return String(v==null?'':v).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
  function norm(v){return String(v||'').toLowerCase().replace(/[^a-z]/g,'')}
  function href(a,p){return 'article.html?a='+encodeURIComponent(a.slug)+(p?'#p'+p:'')}
  function en(t){var out='',last=0,re=/\*\*(.+?)\*\*/g,m;t=String(t||'');while((m=re.exec(t))){out+=esc(t.slice(last,m.index));out+='<mark class="keyword en-key" tabindex="0" data-key="'+norm(m[1])+'">'+esc(m[1])+'</mark>';last=m.index+m[0].length}return out+esc(t.slice(last))}
  function zh(t){var out='',last=0,re=/\*\*(.+?)\*\*\(([A-Za-z][A-Za-z’\-]*)\)/g,m;t=String(t||'');while((m=re.exec(t))){out+=esc(t.slice(last,m.index));out+='<mark class="keyword zh-key" tabindex="0" data-key="'+norm(m[2])+'">'+esc(m[1])+'<span class="source-form">('+esc(m[2])+')</span></mark>';last=m.index+m[0].length}return out+esc(t.slice(last))}
  function links(t){var out='',last=0,re=/\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/g,m;t=String(t||'');while((m=re.exec(t))){out+=esc(t.slice(last,m.index));out+='<a href="'+esc(m[2])+'" target="_blank" rel="noopener noreferrer">'+esc(m[1])+'</a>';last=m.index+m[0].length}return out+esc(t.slice(last))}
  var J={SITE:S,ARTICLES:A,$:$,$$:$$,esc:esc,norm:norm,href:href,renderEN:en,renderZH:zh,renderLinks:links,reduced:matchMedia&&matchMedia('(prefers-reduced-motion:reduce)').matches};
  window.JICI=J;
  var page=document.body.dataset.page||'';
  $$('[data-nav]').forEach(function(n){if(n.dataset.nav===(page==='article'?'index':page))n.setAttribute('aria-current','page')});
  $$('[data-theme-toggle]').forEach(function(b){b.addEventListener('click',function(){var n=document.documentElement.dataset.theme==='dark'?'light':'dark';document.documentElement.dataset.theme=n;try{localStorage.setItem('jici-theme',n)}catch(e){};window.dispatchEvent(new Event('jici-theme-change'))})});
  var h=$('#siteHeader');function sc(){if(h)h.classList.toggle('is-scrolled',scrollY>8)}sc();addEventListener('scroll',sc,{passive:true});
  var back=$('[data-back-top]');if(back){function bt(){back.classList.toggle('is-visible',scrollY>600)}bt();addEventListener('scroll',bt,{passive:true});back.onclick=function(){scrollTo({top:0,behavior:J.reduced?'auto':'smooth'})}}
  var src=page==='index'?'index':page==='article'?'article':page==='words'?'words':'';
  if(src){var s=document.createElement('script');s.src='assets/js/'+src+'.js';s.defer=false;document.body.appendChild(s)}
})();
