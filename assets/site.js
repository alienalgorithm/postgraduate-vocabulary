/* 记词 · 双语对照 —— 页面脚本
 * 三个页面共用：index / article / words
 */
(function () {
  'use strict';

  var S = window.SITE || { ARTICLES: [], vocabTotal: 0 };
  var ARTS = S.ARTICLES || [];
  var PAGE = document.body.dataset.page;
  var REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ── 工具 ───────────────────────────────── */
  function esc(s) {
    return String(s).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }
  function key(s) { return String(s).toLowerCase().replace(/[^a-z]/g, ''); }
  function el(sel, root) { return (root || document).querySelector(sel); }
  function els(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }

  /* 史实区允许安全的 Markdown 外链，其余字符仍统一转义。 */
  function renderLinks(str) {
    var out = '', last = 0, re = /\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/g, m;
    while ((m = re.exec(String(str)))) {
      out += esc(String(str).slice(last, m.index));
      out += '<a href="' + esc(m[2]) + '" target="_blank" rel="noopener noreferrer">' + esc(m[1]) + '</a>';
      last = m.index + m[0].length;
    }
    return out + esc(String(str).slice(last));
  }

  /* 英文：**word** → <mark data-k="word"> */
  function renderEN(str) {
    var out = '', last = 0, re = /\*\*(.+?)\*\*/g, m;
    while ((m = re.exec(str))) {
      out += esc(str.slice(last, m.index));
      out += '<mark class="k en" data-k="' + key(m[1]) + '">' + esc(m[1]) + '</mark>';
      last = m.index + m[0].length;
    }
    return out + esc(str.slice(last));
  }

  /* 中文：**译法**(word) → <mark data-k="word">译法<span class="src">(word)</span> */
  function renderZH(str) {
    var out = '', last = 0, re = /\*\*(.+?)\*\*\(([A-Za-z-]+)\)/g, m;
    while ((m = re.exec(str))) {
      out += esc(str.slice(last, m.index));
      out += '<mark class="k zh" data-k="' + key(m[2]) + '">' + esc(m[1]) +
             '<span class="src">(' + esc(m[2]) + ')</span></mark>';
      last = m.index + m[0].length;
    }
    return out + esc(str.slice(last));
  }

  /* ── 连线 ───────────────────────────────── */
  var wireSeq = 0;

  function clearWires(box) {
    var svg = el('.wires', box);
    if (svg) svg.innerHTML = '';
    els('mark.k.on', box).forEach(function (m) { m.classList.remove('on'); });
  }

  /* 连线只走栏与栏之间的空白，绝不穿过正文。
     并排时横穿中缝，堆叠时纵穿两栏之间的缝。 */
  function drawWire(box, a, b) {
    var svg = el('.wires', box);
    if (!svg || !a || !b) return;
    var base = box.getBoundingClientRect();
    var ra = a.getBoundingClientRect(), rb = b.getBoundingClientRect();
    var ca = a.closest('[data-side]'), cb = b.closest('[data-side]');
    if (!ca || !cb) return;
    var rca = ca.getBoundingClientRect(), rcb = cb.getBoundingClientRect();

    var horiz = rca.right <= rcb.left + 2;   // 英文栏整体在中文栏左侧 = 并排

    var x1, y1, x2, y2, c1x, c1y, c2x, c2y;
    if (horiz) {
      x1 = rca.right - base.left;
      x2 = rcb.left - base.left;
      y1 = ra.top + ra.height / 2 - base.top;
      y2 = rb.top + rb.height / 2 - base.top;
      var mx = (x1 + x2) / 2;
      c1x = mx; c1y = y1; c2x = mx; c2y = y2;
    } else {
      x1 = Math.min(Math.max(ra.left + ra.width / 2, rca.left + 6), rca.right - 6) - base.left;
      y1 = rca.bottom - base.top;
      x2 = Math.min(Math.max(rb.left + rb.width / 2, rcb.left + 6), rcb.right - 6) - base.left;
      y2 = rcb.top - base.top;
      var my = (y1 + y2) / 2;
      c1x = x1; c1y = my; c2x = x2; c2y = my;
    }

    var gid = 'wg' + (++wireSeq);
    var ns = 'http://www.w3.org/2000/svg';
    var defs = document.createElementNS(ns, 'defs');
    var grad = document.createElementNS(ns, 'linearGradient');
    grad.setAttribute('id', gid);
    grad.setAttribute('gradientUnits', 'userSpaceOnUse');
    grad.setAttribute('x1', x1); grad.setAttribute('y1', y1);
    grad.setAttribute('x2', x2); grad.setAttribute('y2', y2);
    [['0%', '#1B4D8F'], ['100%', '#A8362B']].forEach(function (p) {
      var st = document.createElementNS(ns, 'stop');
      st.setAttribute('offset', p[0]);
      st.setAttribute('stop-color', p[1]);
      grad.appendChild(st);
    });
    defs.appendChild(grad);
    svg.appendChild(defs);

    var path = document.createElementNS(ns, 'path');
    path.setAttribute('d', 'M' + x1 + ',' + y1 + ' C' + c1x + ',' + c1y + ' ' + c2x + ',' + c2y + ' ' + x2 + ',' + y2);
    path.setAttribute('stroke', 'url(#' + gid + ')');
    svg.appendChild(path);

    [[x1, y1, '#1B4D8F'], [x2, y2, '#A8362B']].forEach(function (p) {
      var dot = document.createElementNS(ns, 'circle');
      dot.setAttribute('cx', p[0]); dot.setAttribute('cy', p[1]);
      dot.setAttribute('r', 2.6); dot.setAttribute('fill', p[2]);
      svg.appendChild(dot);
    });

    if (!REDUCED) {
      var len = path.getTotalLength();
      path.style.strokeDasharray = len;
      path.style.strokeDashoffset = len;
      path.style.transition = 'stroke-dashoffset .32s cubic-bezier(.3,.8,.3,1)';
      requestAnimationFrame(function () { path.style.strokeDashoffset = '0'; });
    }
  }

  function link(box, k) {
    clearWires(box);
    var a = el('mark.k.en[data-k="' + k + '"]', box);
    var b = el('mark.k.zh[data-k="' + k + '"]', box);
    if (a) a.classList.add('on');
    if (b) b.classList.add('on');
    if (a && b) drawWire(box, a, b);
  }

  /* 给一个含 .wires 的容器接上交互 */
  function bind(box) {
    var pinned = null;

    box.addEventListener('mouseover', function (e) {
      if (pinned) return;
      var m = e.target.closest && e.target.closest('mark.k');
      if (m && box.contains(m)) link(box, m.dataset.k);
    });
    box.addEventListener('mouseleave', function () {
      if (!pinned) clearWires(box);
    });
    box.addEventListener('click', function (e) {
      var m = e.target.closest && e.target.closest('mark.k');
      if (!m) return;
      if (document.body.classList.contains('cloze') && m.classList.contains('en')) {
        m.classList.toggle('shown');
        return;
      }
      if (pinned === m.dataset.k) { pinned = null; clearWires(box); }
      else { pinned = m.dataset.k; link(box, pinned); }
    });

    var t;
    window.addEventListener('resize', function () {
      clearTimeout(t);
      t = setTimeout(function () { if (pinned) link(box, pinned); else clearWires(box); }, 140);
    });
  }

  function svgLayer() { return '<svg class="wires" aria-hidden="true"></svg>'; }

  /* ── 首页 ───────────────────────────────── */
  function buildIndex() {
    var demo = el('#demo');
    if (demo) {
      var en = 'The **pattern** showed him where to look; the **exceptions** showed him he was right.';
      var zh = '**分布形态**(pattern)告诉他该往哪里看；**例外**(exceptions)才告诉他他看对了。';
      demo.innerHTML =
        '<div class="demo-hd"><span class="label">铁律 · 中英一一对应</span>' +
        '<span class="label">§2 · Snow</span></div>' +
        '<div class="demo-line en" data-side="en">' + renderEN(en) + '</div>' +
        '<div class="demo-line zh" data-side="zh">' + renderZH(zh) + '</div>' +
        '<div class="hint">悬停或点一个词，看它连到哪儿</div>' + svgLayer();
      bind(demo);
    }

    var used = {}, kw = 0;
    ARTS.forEach(function (a) {
      (a.glossary || []).forEach(function (g) { used[g.w] = 1; kw++; });
    });
    var uniq = Object.keys(used).length;
    var pct = S.vocabTotal ? (uniq / S.vocabTotal * 100) : 0;

    var tally = el('#tally');
    if (tally) {
      tally.innerHTML = [
        cell('文章', ARTS.length, '篇 · 全部定稿'),
        cell('重点词次', kw, '含跨篇重复'),
        cell('已用单词', uniq, '不重复', pct),
        cell('待用', Math.max(0, S.vocabTotal - uniq), '剩余词量')
      ].join('');
    }

    var list = el('#list');
    if (list) {
      list.innerHTML = ARTS.map(function (a) {
        return '<a class="entry" href="article.html?a=' + encodeURIComponent(a.slug) + '">' +
          '<div class="no">' + esc(a.id) + '</div>' +
          '<div><h3>' + esc(a.title) + '</h3>' +
            '<div class="zhtitle">' + esc(a.titleZh) + '</div>' +
            '<div class="stand">' + esc(a.standfirst || '') + '</div></div>' +
          '<div class="stats"><b>' + a.metrics.words + '</b> words<br>' +
            '<b>' + a.metrics.keywords + '</b> keywords<br>' +
            '<b>' + a.metrics.density + '%</b> density</div></a>';
      }).join('');
    }

    function cell(k, v, n, p) {
      return '<div class="cell"><div class="label">' + k + '</div>' +
        '<div class="v">' + v + '</div>' +
        '<div class="n">' + n + '</div>' +
        (p != null ? '<div class="bar"><i style="width:' + Math.max(0.6, p).toFixed(2) + '%"></i></div>' : '') +
        '</div>';
    }
  }

  /* ── 文章页 ─────────────────────────────── */
  function buildArticle() {
    var slug = new URLSearchParams(location.search).get('a');
    var i = ARTS.findIndex(function (a) { return a.slug === slug; });
    if (i < 0) i = 0;
    var a = ARTS[i];
    if (!a) return;

    document.title = a.title + ' · 记词';

    var d = a.metrics.density;
    var cls = d <= 18 ? 'ok' : (d <= 22 ? 'warn' : 'bad');
    var note = d <= 18 ? '安全' : (d <= 22 ? '紧张' : '危险');

    el('#arthead').innerHTML =
      '<div class="no">NO. ' + esc(a.id) + ' · ' + esc(a.topic) + '</div>' +
      '<h1>' + esc(a.title) + '</h1>' +
      '<div class="zhtitle">' + esc(a.titleZh) + '</div>' +
      (a.standfirst ? '<div class="stand">' + esc(a.standfirst) + '</div>' : '') +
      '<div class="artmeta">' +
        '<span><b>' + a.metrics.words + '</b> 词</span>' +
        '<span><b>' + a.metrics.keywords + '</b> 重点词</span>' +
        '<span>密度 <b class="' + cls + '">' + d + '%</b> ' + note + '</span>' +
        '<span>' + esc(a.date) + '</span>' +
        '<span>' + esc(a.status) + '</span>' +
      '</div>';

    el('#pairs').innerHTML = a.paras.map(function (p, n) {
      return '<div class="pair">' +
        '<div class="pno">§' + (n + 1) + '</div>' +
        '<div class="en" data-side="en">' + renderEN(p.en) + '</div>' +
        '<div class="zh" data-side="zh">' + renderZH(p.zh) + '</div>' +
        svgLayer() + '</div>';
    }).join('');
    els('.pair').forEach(bind);

    // 词表按段分组
    var byP = {};
    (a.glossary || []).forEach(function (g) { (byP[g.p] = byP[g.p] || []).push(g); });
    el('#gloss').innerHTML = Object.keys(byP).sort().map(function (p) {
      return '<div class="gset"><div class="ghd">§' + p + ' · ' + byP[p].length + ' 词</div>' +
        '<div class="gitems">' + byP[p].map(function (g) {
          return '<div class="gitem"><span class="w">' + esc(g.w) + '</span>' +
                 '<span class="m">' + esc(g.zh) + '</span></div>';
        }).join('') + '</div></div>';
    }).join('');

    var fx = el('#facts');
    if (a.facts && a.facts.length) {
      fx.innerHTML = '<h2>史实核对</h2><div class="cap">以下关键信息已据所列来源核对。</div><ul>' +
        a.facts.map(function (f) { return '<li>' + renderLinks(f) + '</li>'; }).join('') + '</ul>';
    } else { fx.remove(); }

    // 上下篇
    var prev = ARTS[i - 1], next = ARTS[i + 1], pg = '';
    if (prev) pg += '<a href="article.html?a=' + encodeURIComponent(prev.slug) + '"><div class="d">← 上一篇</div><div class="t">' + esc(prev.title) + '</div></a>';
    if (next) pg += '<a href="article.html?a=' + encodeURIComponent(next.slug) + '"><div class="d">下一篇 →</div><div class="t">' + esc(next.title) + '</div></a>';
    if (pg) el('#pager').innerHTML = pg; else el('#pager').remove();

    // 工具条
    var bSrc = el('#tSrc'), bCloze = el('#tCloze');
    bSrc.addEventListener('click', function () {
      var off = document.body.classList.toggle('no-src');
      bSrc.setAttribute('aria-pressed', String(!off));
    });
    bCloze.addEventListener('click', function () {
      var on = document.body.classList.toggle('cloze');
      bCloze.setAttribute('aria-pressed', String(on));
      if (!on) els('mark.k.shown').forEach(function (m) { m.classList.remove('shown'); });
    });
  }

  /* ── 词库页 ─────────────────────────────── */
  function buildWords() {
    var map = {};
    ARTS.forEach(function (a) {
      (a.glossary || []).forEach(function (g) {
        var k = g.w.toLowerCase();
        if (!map[k]) map[k] = { w: g.w, zh: [], from: [] };
        if (map[k].zh.indexOf(g.zh) < 0) map[k].zh.push(g.zh);
        map[k].from.push({ id: a.id, slug: a.slug, p: g.p });
      });
    });
    var all = Object.keys(map).sort().map(function (k) { return map[k]; });

    var box = el('#alphabet'), inp = el('#q'), cnt = el('#count');

    function paint(q) {
      q = (q || '').trim().toLowerCase();
      var rows = all.filter(function (r) {
        return !q || r.w.toLowerCase().indexOf(q) >= 0 || r.zh.join('').indexOf(q) >= 0;
      });
      cnt.textContent = rows.length + ' / ' + all.length + ' 词';

      if (!rows.length) {
        box.innerHTML = '<div class="empty">没有匹配的词。<br>换个拼写，或者只输前几个字母。</div>';
        return;
      }
      var groups = {};
      rows.forEach(function (r) { var L = r.w[0].toUpperCase(); (groups[L] = groups[L] || []).push(r); });
      box.innerHTML = Object.keys(groups).sort().map(function (L) {
        return '<section class="alpha"><div class="ltr">' + L + '</div>' +
          groups[L].map(function (r) {
            return '<div class="wrow"><span class="w">' + esc(r.w) + '</span>' +
              '<span class="m">' + esc(r.zh.join(' · ')) + '</span>' +
              r.from.map(function (f) {
                return '<a class="src" href="article.html?a=' + encodeURIComponent(f.slug) + '">' +
                  esc(f.id) + ' §' + f.p + '</a>';
              }).join(' ') + '</div>';
          }).join('') + '</section>';
      }).join('');
    }

    inp.addEventListener('input', function () { paint(inp.value); });
    paint('');

    el('#wstat').textContent = all.length + ' 个单词已用于 ' + ARTS.length + ' 篇文章 · 词表共 ' + S.vocabTotal + ' 词';
  }

  /* ── 启动 ───────────────────────────────── */
  if (PAGE === 'index') buildIndex();
  else if (PAGE === 'article') buildArticle();
  else if (PAGE === 'words') buildWords();
})();
