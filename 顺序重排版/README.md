# 70篇新顺序版：PDF小册子与4K视频

按用户确认的完整顺序重新编号为01—70。例如原第22篇“会烤化汽车的大楼”现为第02篇；原第07篇“越狱的章鱼”现为第03篇。原篇号版保留。

## 下载

[打开新顺序版Release](https://github.com/alienalgorithm/postgraduate-vocabulary/releases/tag/reading-reordered-2026.11.13-v1)

- `70-STORIES-NEW-ORDER.pdf`：完整新顺序合订本，474页，含可点击目录。
- `PDF-BOOKLETS-NEW-ORDER.zip`：70份分篇PDF，每篇均使用新编号。
- `4K-VIDEOS-NEW-ORDER.zip`：70部完整4K视频，按新编号01—70排列。

分篇包内仅有70个PDF；视频包内仅有70个MP4。

视频名称严格采用“01 中文名 英文名.mp4”，例如：

```text
01 以为柠檬汁能隐身的劫匪 The Robber Who Thought Lemon Juice Made Him Invisible.mp4
02 会烤化汽车的大楼 The Building That Melted a Car.mp4
03 越狱的章鱼 The Octopus That Escaped.mp4
```

文件系统不允许的冒号、问号等字符在文件名中移除，正文标题保持原文。片名中的“第37手”“79天”等故事内容不随篇号改变。

## 核对依据

PDF封面、页脚、合订目录及书签统一使用新篇号。70篇的英文、中文、词汇、练习、简述和插图均沿用已验收版本。每页已与原PDF核对，编号区域以外的分篇PDF画面和正文保持一致。

全部视频仅重新命名，逐文件SHA-256与原定稿完全一致，配音和画面不重新编码。

`篇号对照.json`、`篇号对照.csv`、`manifest.json`及各篇`renumber-qc.json`保留新旧篇号、文件名、哈希和版面核验。源码与记录保存在仓库中；下载包按用户要求仅包含PDF或MP4。

重新制作PDF需要主仓库中的`插图阅读小册`共享字体与排版程序：依次运行`build_reordered.py`、`combine_reordered.py`和`finalize_manifest.py`。`release_reordered.py --verify-only`只核对当前已完成文件，不会改动视频或PDF。
