/* 好样本：位置只由时间决定。test.js 三种出帧顺序必须逐字节相同。 */
(function () {
  registerScene('det_good', function (tl, root) {
    var box = document.createElement('div');
    box.style.cssText = 'position:absolute;left:0;top:440px;width:200px;height:200px;background:#ffb547';
    root.appendChild(box);
    tl.fromTo(box, { x: 0 }, { x: 1600, duration: 2, ease: 'none' }, 0);
  });
})();
