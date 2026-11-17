# 网页帖子配图设计规范

- 用途：发在网站帖子里的横向配图，宽 1080 CSS 像素，按 2 倍截图（PNG 宽 2160）；高度按内容，一般 700 到 1500。不要 1:1。
- 截图命令：`node /tmp/claude-0/-home-user/3d87cc6c-41dd-58c2-802f-d51dc0c78527/scratchpad/post/shot_any.js <html> 1080 <out.png>`（全页截图）。截完一定用 Read 打开 PNG 亲眼检查：无文字溢出、无重叠、无截断、字够大（正文不小于 15px）、对齐整齐。
- 字体与颜色：在 HTML 里 `<link rel="stylesheet" href="../../shop/html/style.css">`（HTML 放在 post/html/ 下），已含字体 'SC'（Noto Sans SC 500/700/900）、'SERIFSC'、'EN'（Source Serif 4）和颜色变量：--navy #10264a，--blue #1f4fa3，--gold #f2b544，--red #e4572e，--cream #fbf5ea，--ink，--muted。注意 style.css 把 html/body 设成 800×800 且 overflow hidden，你的页面必须覆盖：`html,body{width:1080px;height:auto;overflow:visible}`。
- 风格：和网店商品图一致（深蓝/金色/米色），干净、有层次、像精品知识付费产品的详情页；标题用 900 粗体，说明用 500；每张图顶部一个小标签（如“全套内容”）＋大标题＋一句副标题；真实截图要清晰可读，用圆角、阴影、编号标注（①②③）和指引线/标注框说明“这一块是什么、有什么用”。
- 真实素材（优先用，必要时用 pymupdf 以 200 dpi 以上重新渲染并裁剪需要的区域，裁剪图存到 post/assets/）：
  - 已渲染素材：/tmp/claude-0/-home-user/3d87cc6c-41dd-58c2-802f-d51dc0c78527/scratchpad/shop/assets/（cover.jpg 封面；scr01_0/1/2… 视频画面＝视频同屏版页面，16:9；book_N/parch_N 教材第 N 页；jj01_p1/p2 逐句精讲；cd01_p1/p2 单词精解；card_zh2en/card_en2zh/card_ans 听写卡；read01_p1 阅读版；illNN.jpg 插图）
  - 原始 PDF：第 1 篇文件包 /tmp/claude-0/-home-user/3d87cc6c-41dd-58c2-802f-d51dc0c78527/scratchpad/pkg/01/pack/01 越狱的章鱼/（“01 越狱的章鱼 1 视频同屏版.pdf”…“6 阅读版.pdf”）；其他篇 pkg/NN/pack/NN 标题/。教材：…/scratchpad/trial/考研学人-v5.pdf 与 考研学人-v5-羊皮纸版.pdf（第 1 篇在第 5 到 9 页）。插图：…/scratchpad/kbuild/2026-11-16-v5/插图JPEG/NN.jpg。
- 文字规则见 FACTS.md：身份只说 B站UP主；不出现美国/外国等；不用绝对化用语；不用破折号；数字照抄事实清单。

## 用户 2026-11-17 新要求（优先于上面的说法）
- 图上绝对不要出现“卖点”“卖点1/2/3”“加送”“怎么用”“全套内容”这类分类小标签或任何让人一看就觉得“这是专门设计来让我买”的营销字眼。
- 左上角如果要放东西，只放一句和内容有关、让人好奇想看下去的小引语（例如“章鱼越狱、劫匪抹柠檬汁、人类向鸸鹋宣战”），用一条细色块开头，不用胶囊标签样式。
- 例外：讲用法的图，左上角可以用标签“如何使用”（用户 2026-11-17 明确要求保留这几个字）。
