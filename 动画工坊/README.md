# 动画工坊

一句话：在这个仓库里，用程序把“分镜 + 场景代码 + 配乐”做成纯音乐 4K 动画；重活全在 GitHub Actions 上跑，改一行字推送上去就自动出片、发 Release。第一部作品是 B站UP主 朋克英语 的《如何真正学好英语》。

先读本页，再按要做的事只读一份文档：

| 要做的事 | 读哪份 |
|---|---|
| 想知道这部片为什么这样做、标准是什么 | 方法与理念.md |
| 做一部新片 | 新片配方.md |
| 在 GitHub 上出片、看结果、加密钥 | GitHub自动化.md |
| 遇到问题 | 踩坑与经验.md |
| 查用户原话 | 用户原话.md |
| 这部片本身 | 作品/如何真正学好英语/README.md |

## 三条路

### 路一：在 GitHub 上一键重出这部片

前提：作品目录里 10 个场景文件都在（见本页“现在的状态”）。

1. 改 `动画工坊/渲染请求.json`，换一个新的 id：

       {"id":"full-4k-1","film":"如何真正学好英语","scale":2,"fps":60,"from":null,"to":null,
        "music":"main","shards":12,"release":true,"note":"整片 4K"}

2. 提交并推送到 `claude/article-packages-20261116` 或 `main`（只有这两个分支会触发出片）：

       git add --sparse 动画工坊/渲染请求.json
       git commit -m "出片：整片 4K"
       git push

3. 等 GitHub 跑完（预计 30 到 45 分钟），到仓库 Releases 页面下载 `how-to-learn-english_4k.mp4`、`how-to-learn-english_1080p.mp4`，或在 Actions 运行页面下载 artifact `film-r编号`。

工作流文件合并到 main 以后，也可以不改文件：Actions 页面选 “anim-render 动画出片”，点 Run workflow，填同样的参数。

### 路二：只改文字或时间，推送就出片（零代理）

适合改字、改字出现和消失的时刻、重新出片、发 Release。不用开代理，不花 token。

1. 改 `动画工坊/作品/如何真正学好英语/story/storyboard.json` 里那一行的 `text`、`in` 或 `out`。场景的 `start`、`duration` 卡在配乐小节线上，不要动。s02 到 s06 的字从分镜读；s01 的字写在 `scenes/s01.js` 里，要改代码（见路三的改片模板）。
2. 可选，本机先查一遍（在仓库根目录）：

       python3 动画工坊/tools/ci/text_rules.py 动画工坊/作品/如何真正学好英语
       python3 动画工坊/tools/ci/check_story.py 动画工坊/作品/如何真正学好英语

3. 改 `动画工坊/渲染请求.json`：换新 id，要发布就写 `"release":true`。
4. `git add --sparse` 这两个文件，提交，推送。anim-check 自动查字和画面，anim-render 自动出片。

注意：anim-render 不等 anim-check 的结果（两个工作流各跑各的）。发 Release 前，先在 Actions 页面确认同一次提交的 anim-check 是绿的。

### 路三：做一部新片（最少 token）

1. `bash 动画工坊/tools/new_film.sh <片名> <英文短名>` 建作品目录（复制引擎、字体、依赖，放一个能出图的两场小样）。
2. 有 Claude Code 的 Workflow 工具时，用 `动画工坊/编排/新片.workflow.js` 一次跑完：立项、证据、配乐、内容、分镜、逐场构建和审查、导演打磨、终检、GitHub 出 4K、发 Release。参数和省 token 的开关（`skip`、`reuse`、`evidence`）见 `编排/README.md`。只改几场用 `编排/改片.workflow.js`。
3. 没有 Workflow 工具时，照 `新片配方.md` 一步一步做，每步的提示词在 `编排/提示词/`，开一个新会话把那一份发过去即可。

## 目录地图

    动画工坊/
      README.md            本页
      方法与理念.md         标准、故事设计、证据、画面技巧、音乐卡点、五条法则怎么落实
      新片配方.md           做新片的步骤清单
      GitHub自动化.md       三个工作流、参数、产物、密钥、怎么看结果
      踩坑与经验.md         踩过的坑和解法
      用户原话.md           与动画有关的用户原话
      渲染请求.json         出片请求：改它推送就出片
      .gitignore           明文音频、node_modules、静帧、mp4 不进仓库
      作品/
        如何真正学好英语/    一部片的全部：film.json、engine/、scenes/、story/、music/、fonts/、assets/、qa/ref/
      tools/
        new_film.sh          新建一部片
        sync_from_workspace.sh  把本机动画工作目录同步进作品目录（幂等）
        engine_patches/      同步后自动套用的引擎小改动
        clean_words.py       同步后自动改写文件里的禁用字样；--check 只查（anim-check 每次推送跑）
        fonts.md             字体为什么在任何机器上都一样
        ci/                  GitHub 上跑的程序：切段、渲染、拼片、核对、文字规矩、静帧 QA、样本（说明见 ci/README.md）
        music/               配乐程序：分析、重建、检查、加密、解密（说明见 music/README.md）
      编排/                  多代理工作流模板（新片、改片）、提示词、五版历史脚本

    .github/workflows/
      anim-render.yml      出片
      anim-check.yml       检查（每次推送）
      anim-music.yml       配乐检查

## 第一次使用要做的唯一一步

在 GitHub 仓库页面：Settings → Secrets and variables → Actions → New repository secret，名字填 `MUSIC_KEY`，值填配乐密钥（制作时生成的密钥文件的内容；它不写进仓库和任何文档）。

不加也能出片：主配乐解不开时自动用备用配乐（CC0）；备用配乐还没有时无声出片。用了哪种配乐，会写在运行摘要和 Release 标题里，不会报错卡住。

## 现在的状态（2026-11-19）

- 引擎、字体、分镜（10 场，169.342 秒）、配乐（加密）、三个工作流、检查和样本都已在仓库。
- 场景文件：作品目录里有 s01 到 s07；s08 到 s10 还在本机动画工作目录里制作，做完用 `bash 动画工坊/tools/sync_from_workspace.sh <工作目录> 动画工坊/作品/如何真正学好英语` 同步进来（还没做完的场景用 `SKIP_SCENES=s09,s10` 挡在外面，半成品不进仓库）。在那之前整片出片会因为缺场景而停（这是质量问题，应该停）；只出 s01 到 s07 范围内的片段（0 到 111.842 秒）可以。
- 备用配乐（和本片时间轴对齐的 CC0 版）还没做，`music/backup/score.flac` 不存在。
- 仓库密钥 MUSIC_KEY 还要仓库主人手动加。

## 常见问题

问：GitHub 上出片要钱吗？
答：仓库是公开的，Actions 免费。免费账号同时最多 20 个作业，所以分段数上限是 20。

问：Actions 页面没有 Run workflow 按钮？
答：按钮只在工作流文件进了默认分支 main 以后才出现。在别的分支上，用改 `渲染请求.json` 推送的方式。

问：某一段渲染失败了？
答：每段会自动重试一次。两次都失败时，在 Actions 运行页面点 Re-run failed jobs，只重跑失败的段，已经出好的段不重出。

问：anim-check 报参考图过期？
答：说明场景被有意改过，只是提示，不卡。画面定了以后跑 `bash 动画工坊/tools/ci/update_refs.sh 动画工坊/作品/如何真正学好英语`，把 `qa/ref/` 一起提交。

问：Release 标题里写着“（备用配乐）”或“（无配乐）”？
答：这次没有拿到 MUSIC_KEY。加上密钥后，换个 id 再推一次请求。

问：本机能出片吗？
答：能，但本机 4K 整片要两个多小时、占满 CPU，不推荐。本机只出静帧和几秒的 1080p 片段做检查，命令见 `作品/如何真正学好英语/README.md`。

问：新文件提交不上？
答：仓库是稀疏检出，新文件要用 `git add --sparse`。

问：在哪里看渲染速度、响度、用了哪种配乐？
答：Actions 运行页面的摘要和注解（notice）里都有，不用下载日志，见 `GitHub自动化.md`。
