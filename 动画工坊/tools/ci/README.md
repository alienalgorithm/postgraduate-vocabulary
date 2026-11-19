# 在 GitHub 上出片和检查（动画工坊 CI）

一句话：改一行 动画工坊/渲染请求.json 推上来，GitHub 自动用十几台机器并行渲染、拼片、混配乐、核对、发 Release。本机只写场景，不跑重活。

## 三个工作流

| 工作流 | 文件 | 什么时候跑 | 做什么 |
|---|---|---|---|
| 动画出片 | .github/workflows/anim-render.yml | 推送改动了 动画工坊/渲染请求.json（分支 claude/article-packages-20261116 或 main）；或 Actions 页面 Run workflow | plan 切段，render 并行渲染，assemble 拼片、混音、核对、出 1080p、SHA256SUMS、可选发 Release |
| 动画检查 | .github/workflows/anim-check.yml | 推送改动了 动画工坊/ 下任何文件（渲染请求除外）或 anim-*.yml；或手动 | 坏样本必抓好样本必放、画面文字规矩、分镜检查、引擎确定性、静帧和引擎 QA、参考静帧 PSNR、联系表 |
| 配乐检查 | .github/workflows/anim-music.yml | 推送改动了 动画工坊/tools/music/、作品的 music/ 或这个工作流；或手动 | 配乐工具自测、有密钥时重建配乐并逐样本对比、check_score、响度、CC0 曲子分析冒烟测试 |

Actions 页面的 Run workflow 按钮只在工作流文件进了默认分支（main）以后才出现；在别的分支上，用改请求文件推送的方式出片。

## 出片

动画工坊/渲染请求.json：

    {"id":"唯一串","film":"如何真正学好英语","scale":2,"fps":60,"from":null,"to":null,
     "music":"main","shards":12,"release":false,"note":"说明"}

| 字段 | 意思 |
|---|---|
| id | 随便写一个唯一的串，方便在记录里找；改了 id 再推就是一次新的出片 |
| film | 动画工坊/作品/ 下的目录名 |
| scale | 2 = 4K（3840x2160），1 = 1080p |
| fps | 帧率，一般 60 |
| from、to | 秒；null 表示片头、片尾。只出一段时用 |
| music | main 用加密的主配乐，缺密钥自动退到备用配乐（CC0），再没有就无声；backup 直接用备用；none 无声 |
| shards | 分几段并行，1 到 20（公开仓库免费账号最多同时 20 个作业）；每段至少 1 秒 |
| release | true 时出完发 Release |
| note | 说明，写进 Release |

过程：

1. plan：按帧号切段。f0 = round(from x fps)，f1 = round(to x fps)，第 i 段是 [f0 + round(N x i / K), f0 + round(N x (i+1) / K))，和 render.js 用同一个取整（Math.round），首尾相接，不重不漏。
2. render：每段一台 ubuntu-24.04（4 核 16 GB），node engine/render.js --scale --from --to --audio none --parallel 3。浏览器崩溃之类自动重试一次；一段两次都失败，到 Actions 页面点 Re-run failed jobs，只重跑失败的段，已经出好的段不重出。
3. assemble：concat 分离器 -c copy 无损拼接；decrypt_music.sh 准备配乐；混音参数和 render.js 一样（-ss from -t 帧数/fps，AAC 320k，48 kHz 立体声）；核对帧数 = 时长 x fps、帧率、尺寸、编码、音轨长度、真峰值不超过 0 dBTP；测积分响度；4K 时另出 1080p；写 SHA256SUMS.txt。
4. 结果：Actions 运行页面的 artifact film-r编号（保存 30 天）；release 为 true 时发 Release，标签 anim-how-to-learn-english-r编号，附件 how-to-learn-english_4k.mp4、how-to-learn-english_1080p.mp4、SHA256SUMS.txt。配乐是备用或无时，Release 标题里写明。Release 不设为 Latest，不会把仓库首页的资料 Release 挤下去。

速度参考：本机（4 核，同时还有别的渲染）1080p 约 3 帧/秒、4K 约 0.7 帧/秒（单进程）。全片 10161 帧 4K 分 12 段，每段约 850 帧，预计每段 10 到 20 分钟。

## 配乐密钥

主配乐在仓库里只有加密文件（公开仓库，明文会招来 DMCA）。GitHub 上解密要一个仓库密钥：仓库 Settings > Secrets and variables > Actions > New repository secret，名字 MUSIC_KEY，值是本机密钥文件的内容。没有它不报错：出片自动用备用配乐并在摘要和 Release 标题里注明，配乐检查跳过重建。artifact 和 Release 里绝不放配乐明文。

## 检查（只查片子本身）

| 检查 | 程序 | 不通过的条件 |
|---|---|---|
| 成片核对 | verify_video.py | 帧数、帧率、尺寸、编码、色彩标记不对；没有音轨或音轨比画面短 0.05 秒以上；真峰值超过 0 dBTP |
| 画面文字规矩 | text_rules.py | 分镜 texts、visual_text、aha、quote 和场景文件的字符串（转义还原后）里有破折号字符，或有 text_rules.py 里 BANNED 清单的国别、身份类字样和那个英文整词 |
| 文件里的禁用字样 | clean_words.py --check（在 tools/ 下） | 动画工坊/ 和工作流的任何文本文件里有 BANNED 清单字样（仓库公开，说明和程序里也不许有；同步时 clean_words.py 会自动改写） |
| 分镜检查 | check_story.py（跑作品自己的 story/check_storyboard.py） | 小节对齐、片长、高潮、阅读时间、禁用词等任何一项；没有密钥时配乐长度一项按 music/map.json 核对 |
| 引擎确定性 | engine/test.js | 同一时刻顺序出帧、乱序出帧、分块首帧三种方式不一致 |
| 静帧和引擎 QA | stills_qa.py（调 engine/still.js） | 每个已写好的场景的中点和每行字完整显示时，引擎报 small（字小于 40px）、dash、font、outside、overlap 或引擎错误 |
| 参考静帧 | stills_qa.py | 场景没改过（输入指纹相同）却和 qa/ref/ 的参考图不一样：整帧 PSNR 低于 40 dB 或最差 64x64 小块低于 28 dB |
| 配乐 | music_ci.sh（调 tools/music/ 的程序） | 自测不对、重建和成品不是逐样本一致、check_score 不通过、CC0 分析出错 |

每道检查都有坏样本和好样本（samples/），run_samples.py 逐条真跑：坏样本必须被抓，好样本必须放行。现在 31 个样本（坏 19、好 12），本机实测全部符合。改了检查或加了检查，先在本机跑 python3 动画工坊/tools/ci/run_samples.py。

非质量问题不卡：缺密钥用备用配乐；场景有意改过时参考图只提示过期；还没写的场景不出静帧、不算文字问题；分段失败自动重试。

## 不下载日志就看结果

关键数字（每段帧数和渲染速度、总帧数、响度、真峰值、用了哪种配乐、静帧数、QA 问题数、PSNR、样本结果）都写成 ::notice:: 注解，同时写进运行摘要。注解可以用 API 读：

    GET /repos/{owner}/{repo}/actions/runs/{run_id}/jobs          找到作业的 check_run_url
    GET /repos/{owner}/{repo}/check-runs/{check_run_id}/annotations

## 本机怎么跑（都在仓库根目录）

    python3 动画工坊/tools/ci/plan.py --request 动画工坊/渲染请求.json --out /tmp/plan.json
    bash 动画工坊/tools/ci/render_shard.sh 作品目录 /tmp/shards/shard_000.mp4 0 1.0 1 60 1
    python3 动画工坊/tools/ci/assemble.py --plan /tmp/plan.json --shards /tmp/shards --out /tmp/final
    python3 动画工坊/tools/ci/stills_qa.py 作品目录 --out /tmp/stills [--scenes s01,s02]
    python3 动画工坊/tools/ci/text_rules.py 作品目录
    python3 动画工坊/tools/ci/check_story.py 作品目录
    python3 动画工坊/tools/ci/run_samples.py [--no-browser]
    bash 动画工坊/tools/ci/update_refs.sh 作品目录
    bash 动画工坊/tools/ci/music_ci.sh 作品目录 /tmp/music

shard 文件名必须是 shard_三位段号.mp4（assemble 按这个找）。要用主配乐先 export MUSIC_KEY="$(cat 密钥文件)"。

## 文件

| 文件 | 做什么 |
|---|---|
| ci_common.py | 共用：注解、摘要、和 JS 一样的取整、ffprobe、EBU R128 响度 |
| plan.py | 读请求，切段，输出 matrix |
| setup_runner.sh | 运行器准备：ffmpeg、npm ci、playwright 的 Chromium、空字体配置（见 ../fonts.md）、numpy 和 pillow |
| render_shard.sh | 渲染一段，失败重试一次，写渲染速度 |
| assemble.py | 拼片、混音、核对、1080p、SHA256SUMS、Release 标题和说明 |
| release.sh | 用 GITHUB_TOKEN 发 Release（只在 Actions 里用） |
| verify_video.py | 成片核对 |
| text_rules.py | 画面文字规矩 |
| check_story.py | 跑作品自己的分镜检查 |
| stills_qa.py | 静帧、引擎 QA、参考静帧 PSNR、联系表；--make-refs 重出参考图 |
| update_refs.sh | 重出参考静帧 |
| music_ci.sh | 配乐检查 |
| run_samples.py | 坏样本必抓、好样本必放 |
| samples/ | 样本：plan、text、psnr、engine（引擎 QA 和确定性） |

## 新片

new_film.sh 建好新作品目录、写好 film.json 以后，这三个工作流不用改：出片时请求里写新片名；检查自动查 作品/ 下的每一部。片名里不要有空格。画面定了以后跑一次 update_refs.sh 生成参考静帧。
