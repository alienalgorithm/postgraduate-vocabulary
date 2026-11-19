/* 坏样本：画面字符串里写成转义的禁用词和破折号，还原后照样上画面，必须被抓。 */
(function () {
  registerScene('s01', function (tl, root, ctx) {
    var a = ctx.util.text(root, 'Think like a \u004eative speaker', { cls: 't-en' });
    var b = `第二行 \u2014 单个破折号也不行`;
  });
})();
