# GitHub 自动化：三个工作流

重活全放在 GitHub Actions 上：公开仓库免费，每台运行器 ubuntu-24.04（4 核、16 GB），最多 20 台同时跑。本机只写场景、出静帧和几秒的检查片段。程序和检查的细节在 `tools/ci/README.md`，本页讲怎么用。

| 工作流 | 文件 | 什么时候跑 | 做什么 |
|---|---|---|---|
| anim-render 动画出片 | .github/workflows/anim-render.yml | 推送改动了 `动画工坊/渲染请求.json`；或 Actions 页面点 Run workflow | 切段、多台并行渲染、拼片、混配乐、核对、出 1080p、写校验值；可选发 Release |
| anim-check 动画检查 | .github/workflows/anim-check.yml | 推送改动了 `动画工坊/` 下任何文件（渲染请求除外）或 `anim-*.yml`；或手动 | 坏样本必抓好样本必放、画面文字规矩、分镜检查、引擎确定性、静帧 QA、参考静帧对比、联系表 |
| anim-music 配乐检查 | .github/workflows/anim-music.yml | 推送改动了 `动画工坊/tools/music/`、作品的 `music/` 或这个工作流；或手动 | 配乐工具自测、有密钥时从原曲重建配乐并逐样本对比、check_score、响度、CC0 曲子分析冒烟测试 |

推送触发只认两个分支：`claude/article-packages-20261116` 和 `main`。Run workflow 按钮只在工作流文件进了默认分支 main 以后才出现。三个工作流都只稀疏检出 `动画工坊` 和 `.github`，不下载仓库里别的大文件。

## 一、出片（anim-render）

### 怎么触发

方法一（任何时候都能用）：改 `动画工坊/渲染请求.json`，换一个新 id，提交推送。

    git add --sparse 动画工坊/渲染请求.json
    git commit -m "出片：<说明>"
    git push

方法二（合并到 main 以后）：Actions → anim-render 动画出片 → Run workflow，表单里的 10 个输入和请求文件的字段一一对应。

### 参数

| 字段 | 意思 | 默认 |
|---|---|---|
| id | 随便写一个唯一的串，方便在记录里找；改了 id 再推就是一次新的出片 | manual |
| film | `动画工坊/作品/` 下的目录名（片名里不要有空格） | 如何真正学好英语 |
| scale | 2 = 4K（3840x2160），1 = 1080p | 作品 film.json 的 scale |
| fps | 帧率 | 60 |
| from、to | 秒；null 或空表示片头、片尾；只出一段时用 | 整片 |
| music | main 用加密主配乐（缺密钥自动退到备用，再没有就无声）；backup 直接用备用；none 无声 | main |
| shards | 分几段并行，1 到 20；超出范围或每段不到 60 帧时自动改正并提示 | 12 |
| release | true 时出完发 Release | false |
| note | 说明，写进 Release | 空 |

常用请求：

    整片 4K 并发布：
    {"id":"full-4k-1","film":"如何真正学好英语","scale":2,"fps":60,"from":null,"to":null,"music":"main","shards":12,"release":true,"note":"整片 4K"}

    一段 1080p 预览（不发布）：
    {"id":"preview-s05","film":"如何真正学好英语","scale":1,"fps":60,"from":55.592,"to":74.342,"music":"main","shards":2,"release":false,"note":"看 s05"}

    备用配乐版（B站 因版权静音时换用）：
    {"id":"full-4k-backup-1","film":"如何真正学好英语","scale":2,"fps":60,"from":null,"to":null,"music":"backup","shards":12,"release":true,"note":"备用配乐版"}

### 过程

1. plan：读请求和作品的 film.json，按帧号切段（取整和 render.js 一样用 Math.round），逐段断言首尾相接、不重不漏。片名不存在、scale 不是 1 或 2 之类意思不明的错误直接停；段数超范围之类能明确改正的自动改并提示。
2. render：每段一台运行器，`node engine/render.js --audio none --parallel 3`，只出画面。浏览器崩溃之类失败自动重试一次。有 npm 缓存和 playwright 浏览器缓存；字体配置指向空配置，画面上的字只来自作品的 `fonts/`。
3. assemble：`concat -c copy` 无损拼接；`tools/music/decrypt_music.sh` 准备配乐；混音参数和 render.js 一样（AAC 320k、48 kHz 立体声）；核对帧数、帧率、尺寸、编码、BT.709、音轨长度，真峰值超过 0 dBTP 判不通过；测积分响度；4K 时另出 1080p；写 SHA256SUMS.txt 和 report.json。核对不通过就停，不发 Release。

### 产物在哪

| 产物 | 在哪 | 保存多久 |
|---|---|---|
| 成片 | 运行页面最下面的 artifact `film-r编号`：`how-to-learn-english_4k.mp4`、`how-to-learn-english_1080p.mp4`、`SHA256SUMS.txt`、`report.json`（scale=1 时只有 1080p） | 30 天 |
| Release（release:true 时） | 仓库 Releases 页面，标签 `anim-how-to-learn-english-r编号`，附件同上（不含 report.json） | 永久 |
| 每段的片子 | artifact `shard-000` 到 `shard-011` | 3 天 |

Release 标题形如“如何真正学好英语 4K 动画 r编号”，只出一段时加“（片段 a 到 b 秒）”，没拿到主配乐时加“（备用配乐）”或“（无配乐）”。Release 不设为 Latest，不会把仓库首页的资料 Release 挤下去；附件文件名只用英文字母。下载后可以 `sha256sum -c SHA256SUMS.txt` 核对。

注意：anim-render 只核对成片本身（帧数、尺寸、声音），不查画面文字规矩；那是 anim-check 的事，两个工作流互不等待。release:true 之前，先确认同一次提交的 anim-check 是绿的。

### 大概耗时

| 步 | 预计 |
|---|---|
| plan | 1 分钟 |
| render（4K 整片分 12 段，每段约 850 帧） | 每段 10 到 20 分钟，各段同时跑 |
| assemble（拼接、混音、出 1080p） | 5 到 10 分钟 |
| 合计 | 30 到 45 分钟 |

这是按本机速度推算的（本机单进程 4K 约 0.7 帧/秒、1080p 约 3 帧/秒）；第一次在 GitHub 上跑完后，以运行摘要里的实测渲染速度为准。1080p 预览大约快 4 倍。

## 二、检查（anim-check）

每次推送 `动画工坊/` 下的改动都会跑，同一分支新推送会取消旧的运行。只查片子本身：声音、文字、画面。

| 作业 | 检查 | 不通过的条件 |
|---|---|---|
| rules | run_samples.py | 任何一道检查的坏样本没被抓住，或好样本被误抓 |
| rules | text_rules.py | 分镜和场景文件里出现破折号字符，或 text_rules.py 里 BANNED 清单的字样 |
| rules | clean_words.py --check | 动画工坊/ 和工作流的任何文本文件里有 BANNED 清单字样（说明和程序里也不许有） |
| rules | check_story.py（跑作品自己的 story/check_storyboard.py） | 小节对齐、片长、高潮、阅读时间、禁用词等任何一项 |
| picture | engine/test.js | 同一时刻顺序出帧、乱序出帧、分块首帧三种方式画面不一致 |
| picture | stills_qa.py | 已写好的场景在中点和每行字完整显示时，引擎报字小于 40px、破折号、非作品字体、出画、重叠或引擎错误；或场景没改过却和 `qa/ref/` 参考图不一样（整帧 PSNR 低于 40 dB 或最差 64x64 小块低于 28 dB） |

产物：artifact `contact-sheet`（全部静帧的联系表 contact.jpg 和 qa.json，有问题的红框、和参考图不符的橙框，保存 14 天）；不通过时另有 `stills-all`（全部静帧，7 天）。

不卡的情况（不是质量问题）：没有密钥时分镜检查的配乐长度一项按 `music/map.json` 核对；场景有意改过时参考图只提示过期；还没写的场景不出静帧。

预计 10 到 15 分钟（本机实测：样本 32 秒、test.js 2 分 38 秒、静帧 27 秒，加上装环境）。

## 三、配乐检查（anim-music）

用 Python 3.13 装 `tools/music/requirements.txt`（版本固定），跑 `tools/ci/music_ci.sh`：

1. `tools/music/selftest.sh`：check_score 每一项的坏样本必抓、好样本必放，decrypt_music 每条退路各跑一次。
2. 有 MUSIC_KEY：`rebuild_from_repo.sh` 从加密原曲重建 score.wav，和加密保存的成品逐样本对比；再跑 check_score（拿原曲做咔哒参照）、测响度。没有密钥就跳过这一步，不报错。
3. CC0 曲子跑 `analyze_track.py` 冒烟测试。
4. 有备用配乐就对它跑 check_score。

产物：artifact `music-report`（只有报告，绝不含音频，保存 14 天）。预计 5 分钟以内（本机带密钥实测 1 分 18 秒）。

## 四、密钥 MUSIC_KEY

主配乐在仓库里只有加密文件（仓库公开，明文会招来 DMCA，可能让整个仓库被下架）。GitHub 上解密要一个仓库密钥，只能由仓库主人手动加一次：

1. 打开仓库页面 → Settings → Secrets and variables → Actions。
2. New repository secret，Name 填 `MUSIC_KEY`，Secret 填配乐密钥（制作时生成的密钥文件的内容）。
3. Add secret。之后的运行自动用上，不用改任何文件。

缺密钥时的退路（全部自动，只提示，不报错）：

| 情况 | 出片用什么 | 写在哪 |
|---|---|---|
| 有密钥，解密和逐样本核对都通过 | 主配乐 | 摘要：配乐 main |
| 没有密钥、密钥错、文件损坏或指纹不符 | 备用配乐 `music/backup/score.flac` | 摘要和 warning 注解写原因；Release 标题加“（备用配乐）” |
| 备用配乐也没有 | 无声 | 同上；Release 标题加“（无配乐）” |

密钥只放在环境变量里，程序不打印它；artifact 和 Release 里绝不放配乐明文。

## 五、怎么看结果

在浏览器里：仓库 → Actions → 点那次运行。运行摘要里有成片核对结果、每段帧数和渲染速度、总帧数、积分响度、真峰值、用了哪种配乐、静帧数、QA 问题数、PSNR、样本结果；同样的数字也写成了注解（notice、warning、error），显示在运行页面上。

在会话里，不下载日志也能读（api.github.com 的读接口）：

    R=alienalgorithm/postgraduate-vocabulary
    # 最近几次出片
    curl -s "https://api.github.com/repos/$R/actions/workflows/anim-render.yml/runs?per_page=3" \
      | python3 -c 'import json,sys; [print(r["id"], r["run_number"], r["status"], r["conclusion"], r["head_branch"]) for r in json.load(sys.stdin)["workflow_runs"]]'
    # 某次运行的各作业和结论
    curl -s "https://api.github.com/repos/$R/actions/runs/<run_id>/jobs" \
      | python3 -c 'import json,sys; [print(j["name"], j["conclusion"], j["check_run_url"]) for j in json.load(sys.stdin)["jobs"]]'
    # 某个作业的注解（关键数字都在这里）
    curl -s "https://api.github.com/repos/$R/check-runs/<check_run_id>/annotations" \
      | python3 -c 'import json,sys; [print(a["annotation_level"], a["title"], a["message"]) for a in json.load(sys.stdin)]'

gh 命令行在会话里的令牌无效，不要用它发 Release；Release 由 Actions 里的 GITHUB_TOKEN 发。

## 六、出了问题怎么办

| 现象 | 做法 |
|---|---|
| 某一段两次都失败 | 运行页面点 Re-run failed jobs，只重跑失败的段 |
| 整片在某段报 engine error（缺场景文件、场景报错） | 质量问题，该停。补上场景或修好代码再推 |
| assemble 报成片核对不通过 | 看摘要里列出的项（帧数、尺寸、音轨长度、真峰值），修好再出 |
| anim-check 的静帧 QA 不通过 | 下载 contact-sheet 看红框，按 qa.json 的问题改场景或分镜 |
| 参考图过期提示 | 画面定了以后 `bash 动画工坊/tools/ci/update_refs.sh 动画工坊/作品/<片名>`，和改动一起提交 |
| 参考图因为运行器 CPU 不同而不通过 | 从 stills-all 取运行器出的图换进 `qa/ref/`（见 踩坑与经验.md） |
| anim-music 重建不一致 | 摘要里有最大差值；多半是依赖版本变了，按 requirements.txt 固定 |

## 七、改工作流或检查

- 加一道检查：在 `tools/ci/run_samples.py` 里配一个坏样本和一个好样本，先在本机跑 `python3 动画工坊/tools/ci/run_samples.py`（没有浏览器时加 `--no-browser`），全部符合再推。
- 不做“检查的检查”：检查只看片子本身。非质量问题（缺密钥、机器偶发故障、参考图过期）一律自动退路或只提示。
- 新片不用改工作流：请求里写新片名，anim-check 自动查 `作品/` 下的每一部。
