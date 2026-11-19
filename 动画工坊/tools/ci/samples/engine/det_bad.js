/* 坏样本：画面依赖“被 seek 过几次”（每次更新都累加），顺序出帧和乱序出帧不一样。test.js 必须判不通过。 */
(function () {
  registerScene('det_bad', function (tl, root) {
    var box = document.createElement('div');
    box.style.cssText = 'position:absolute;left:0;top:440px;width:200px;height:200px;background:#ffb547';
    root.appendChild(box);
    var n = 0;
    tl.to({ v: 0 }, { v: 1, duration: 2, ease: 'none', onUpdate: function () { n += 1; box.style.left = (n * 37 % 1600) + 'px'; } }, 0);
  });
})();
