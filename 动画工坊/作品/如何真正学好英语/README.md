# 如何真正学好英语（动画）

B站UP主 朋克英语 的纯音乐动画短片：不说话，只用配乐、文字和动画，讲清“记住一个单词，不靠一遍遍重复看；靠在读得懂的句子里一次次遇见它，再一次次合上书把它想起来，隔几天再想一次”。整部片由程序逐帧渲染，GitHub Actions 出 4K。

## 规格

| 项目 | 值 |
|---|---|
| 时长 | 169.342 秒（2:49.3），10 个场景 |
| 画面 | 3840x2160，60 fps，10161 帧，H.264 High，yuv420p，BT.709，crf 17；另出 1080p |
| 声音 | AAC 320k，48 kHz 立体声；配乐 -14.0 LUFS，真峰值 -1.2 dBTP |
| 恍然大悟 | 111.842 秒（全片 66% 处，配乐高潮落点）：“不是重复看，而是反复想起。” |
| 评论区金句 | “多看一遍，不如合上书想一遍。” |
| 署名 | B站UP主 朋克英语 |

## 场景表

时间按剪辑后配乐的小节线（96 BPM，3/4 拍，一小节 1.875 秒）。

| 场 | 开始 | 时长 | 讲什么 | 名场面 |
|---|---|---|---|---|
| s01 | 0:00.000 | 11.217 | 冷开场：先让观众记住 evidence，“片尾，考你。” | |
| s02 | 0:11.217 | 11.250 | 扎心：从小学背到考研，背过的单词后来都去哪了 | |
| s03 | 0:22.467 | 13.125 | 原因一：不复习就会忘，一开始忘得最快；不是你笨 | 熄灯之城，遗忘瀑布 |
| s04 | 0:35.592 | 20.000 | 原因二：反复看当下觉得记住了，一周后反而记得更少；最好的两种方法先扣着 | abandon 无限楼梯 |
| s05 | 0:55.592 | 18.750 | 转折，第一缕暖光：大量接触基本能读懂、听懂，又真正想读的内容 | 一河星光 |
| s06 | 1:14.342 | 22.500 | 单词怎么扎根：挑读得懂的材料，留意生词，在上下文里遇见约 10 次 | 第 50 个词，相遇星图 |
| s07 | 1:36.842 | 15.000 | 低谷和蓄力：遇见了，还会忘；光是读过，还不够；合上书 | |
| s08 | 1:51.842 | 13.125 | 恍然大悟，全片高潮：不是重复看，而是反复想起 | 合书点火，万家灯火 |
| s09 | 2:04.967 | 18.125 | 用真实数字钉牢：一周后反复回想的约 80%，只看不想的不到 40%；翻开两张卡 | |
| s10 | 2:23.092 | 26.250 | 兑现承诺：当场考开头那个词；金句；方法卡定格 | 光点归位，方法卡定格 |

完整分镜（每个动作卡在第几小节第几拍、母题、色彩剧本、彩蛋）在 `story/script.md`，机器读的是 `story/storyboard.json`。证据在 `story/EVIDENCE.md`。

## 配乐

- 主配乐：Hans Zimmer《Cornfield Chase》剪辑版（用户说明已获授权）。只用这一首，9 段、8 个接口，全部在小节线上；不改音高、不变速。仓库公开，原曲和成品只以加密文件保存在 `music/private/`，GitHub 上用仓库密钥 MUSIC_KEY 解密。
- 备用配乐：CC0 曲子 John Bartmann《Epic Vista》，要剪成和本片时间轴一样长后放在 `music/backup/score.flac`（还没做）。B站 因版权识别静音或下架时，用备用版。
- B站 简介必须写：配乐 Hans Zimmer《Cornfield Chase》（《星际穿越》原声），已获授权。
- `music/map.json`（小节线、场景位置）和 `music/energy.json`（每 1/60 秒的能量，驱动画面律动）是出片必需的数据，明文保存。
- 剪辑方案和理由：`music/edit_plan.json`、`music/edit.md`；文件说明：`music/README.md`；许可记录：`music/LICENSES.md`。

## 怎么重出

在 GitHub 上（推荐）：改仓库里的 `动画工坊/渲染请求.json`，换新 id，推送到 `claude/article-packages-20261116` 或 `main`：

    {"id":"full-4k-1","film":"如何真正学好英语","scale":2,"fps":60,"from":null,"to":null,"music":"main","shards":12,"release":true,"note":"整片 4K"}

只出一段看效果：`"scale":1,"from":55.592,"to":74.342,"shards":2,"release":false`。参数和结果怎么看见 `动画工坊/GitHub自动化.md`。

在本机看（只做检查，不出整片 4K）：

    cd 动画工坊/作品/如何真正学好英语
    npm ci                                                         # 装 gsap、three、playwright（版本由 package-lock.json 固定）
    node engine/still.js --scale 1 --outdir /tmp/stills 30 64      # 出 1080p 静帧，同时打印 QA 问题
    node engine/still.js --scale 2 --outdir /tmp/stills 64         # 4K 静帧看细节
    node engine/serve.js                                           # 浏览器预览（拖动条，带配乐）
    node engine/test.js --storyboard story/storyboard.json --times 5,30,64   # 确定性测试
    export MUSIC_KEY="$(cat 密钥文件)"
    bash ../../tools/music/decrypt_music.sh .                      # 解出 music/score.wav（没有密钥就退到备用或无声）
    node engine/render.js --from 55.592 --to 61 --out /tmp/clip.mp4 --parallel 1   # 几秒的 1080p 片段，自动混配乐

本机没有 Chromium 时，`npx playwright install --only-shell chromium`。

## 产物

| 产物 | 在哪 |
|---|---|
| 4K 成片 | Release `anim-how-to-learn-english-r编号` 的 `how-to-learn-english_4k.mp4`；或 Actions 运行的 artifact `film-r编号`（30 天） |
| 1080p 成片 | 同上，`how-to-learn-english_1080p.mp4` |
| 校验值 | 同上，`SHA256SUMS.txt`（下载后 `sha256sum -c SHA256SUMS.txt`） |

## 目录

| 路径 | 内容 |
|---|---|
| film.json | 作品清单：片名、帧率、分镜位置、主配乐和备用配乐、Release 命名 |
| BRIEF.md | 本片制作规范（所有参与者必须遵守） |
| engine/ | 渲染引擎：still.js 静帧、render.js 出片、test.js 确定性测试、serve.js 预览；接口说明 engine/README.md |
| scenes/ | 每场一个 sNN.js；demo.js 是引擎示例；scenes_v1/ 是旧版（Epic Vista 时间轴）场景，供改写复用 |
| story/ | 证据、内容方案、场景规划、分镜和脚本、分镜检查 check_storyboard.py；v1_epicvista/ 是旧版分镜 |
| music/ | 加密配乐、剪辑方案、时间轴和能量数据、许可记录 |
| fonts/ | 7 个字体文件和 OFL 许可证；画面上的字只来自这里 |
| assets/ | 用户自己的插图和精读视频画面（只作真实示例） |
| qa/ref/ | 参考静帧，anim-check 每次比对 |
| package.json、package-lock.json | 依赖固定版本：gsap 3.13.0、three 0.169.0、playwright 1.63.0 |

## 现在的状态（2026-11-19）

- 仓库里的场景文件是 s01 到 s07；s08 到 s10 在本机动画工作目录里制作（还没做完的用 SKIP_SCENES 挡在外面），做完用 `bash 动画工坊/tools/sync_from_workspace.sh <工作目录> 动画工坊/作品/如何真正学好英语` 同步，再跑 `bash 动画工坊/tools/ci/update_refs.sh 动画工坊/作品/如何真正学好英语` 更新参考静帧。
- 在那之前，整片出片会因为缺场景而停；0 到 111.842 秒以内的片段可以出。
- 备用配乐还没做；GitHub 上还没有 MUSIC_KEY 时，出片会无声并在 Release 标题注明。
