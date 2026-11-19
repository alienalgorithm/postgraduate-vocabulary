/* 坏样本：字小于 40px，还带破折号。still.js 的引擎 QA 必须报 small 和 dash，退出码 3。 */
(function () {
  registerScene('qa_bad', function (tl, root) {
    var a = document.createElement('div');
    a.style.cssText = 'position:absolute;left:200px;top:300px;font-family:"Noto Sans SC";font-weight:700;font-size:24px;color:#fff';
    a.textContent = '字太小，还有破折号\u2014\u2014不行';
    root.appendChild(a);
    tl.to({ v: 0 }, { v: 1, duration: 2 }, 0);
  });
})();
