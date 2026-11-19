/* 好样本：注释、正则字面量、除号都不是画面文字；run_samples.py 还会在运行时往这里加一段
   含真破折号和禁用词的注释、正则，证明它们不会被误报（这些字不写进仓库文件）。 */
(function () {
  registerScene('s01', function (tl, root, ctx) {
    var re = /["'\/]/g;                        // 正则字面量里的引号不是字符串开头
    var ratio = 3 / 4, half = ratio / 2;       // 除号不是正则
    var a = ctx.util.text(root, 'evidence', { cls: 't-en' });
    var b = `合上书，${'想一遍'}。`;
  });
})();
