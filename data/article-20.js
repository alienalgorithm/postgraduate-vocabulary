/* 20 · The Market Came After the Limit
   Canonical data extension. Loaded after data/articles.js.
*/
(function (root) {
  'use strict';
  var article = {
  "id": "20",
  "slug": "the-market-came-after-the-limit",
  "title": "The Market Came After the Limit",
  "titleZh": "市场在上限之后",
  "standfirst": "1990年美国没有让市场决定可以污染多少；法律先锁定二氧化硫总量，监测系统逐吨记账，交易只决定减排在哪里发生。",
  "topic": "1990—2010年美国酸雨计划、二氧化硫总量控制与排放权交易",
  "date": "2026-08-13",
  "status": "第二十篇最终精校稿",
  "metrics": {"words":263,"keywords":50,"density":19.0},
  "paras": []
};
  root.SITE = root.SITE || {};
  root.SITE.ARTICLES = root.SITE.ARTICLES || [];
  if (!root.SITE.ARTICLES.some(function (item) { return item.id === article.id; })) root.SITE.ARTICLES.push(article);
})(typeof window !== 'undefined' ? window : globalThis);
