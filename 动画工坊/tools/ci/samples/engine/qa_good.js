/* 好样本：56px 作品字体，没有破折号，不出画、不重叠。引擎 QA 必须 0 个问题。 */
(function () {
  registerScene('qa_good', function (tl, root) {
    var a = document.createElement('div');
    a.style.cssText = 'position:absolute;left:200px;top:300px;font-family:"Noto Sans SC";font-weight:700;font-size:56px;color:#fff';
    a.textContent = '多看一遍，不如合上书想一遍。';
    root.appendChild(a);
    tl.to({ v: 0 }, { v: 1, duration: 2 }, 0);
  });
})();
