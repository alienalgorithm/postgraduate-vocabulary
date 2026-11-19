# 编排：用多代理工作流做动画

这里保存指挥多个代理做动画的工作流模板和提示词。做《如何真正学好英语》时一共写了五版脚本（见 `历史/`），从中提炼出两个能反复用的模板：做新片用 `新片.workflow.js`，改几场用 `改片.workflow.js`。4K 整片一律推送到 GitHub，由 Actions 分片并行出片，本机只出 1080p 检查片段。

## 目录

| 文件 | 做什么 |
|---|---|
| 新片.workflow.js | 从零做一部片：立项、证据、配乐分析、内容计划、配乐剪辑和质检、分镜、事实核查、逐场构建和审查、GitHub 预览、导演打磨、备用配乐、终检、GitHub 出 4K 并发布 |
| 改片.workflow.js | 只重做指定场景：修改、审查、推送、GitHub 出 4K |
| 提示词/ | 每一步的提示词，是唯一的正本；模板只传变量。不用工作流时可以直接发给一个会话用，见 `提示词/README.md` |
| 示例/ | 参数示例：新片（search 选曲）、新片（已授权配乐）、改片 |
| 试跑.js | 不启动代理，用假数据把模板从头跑到尾，核对提示词文件和变量一一对上 |
| 历史/ | 这次的五版原始脚本和每版为什么改 |

## 先选最省的路

| 要做的事 | 用什么 | 代理次数 |
|---|---|---|
| 改字、改字出现的时间、重新出片、发 Release | 零代理：改 storyboard.json，推送 | 0 |
| 改几场的画面 | 改片.workflow.js | 每场 2 个（修改、审查），加 1 个出片 |
| 做一部新片 | 新片.workflow.js | 16 + 2×场景数 + 导演修改处数（licensed 模式多 1 个备用配乐；10 场约 40；全用 skip 最少 10 + 2×场景数） |

### 零代理：只改文字或重新出片

场景代码一般从 `ctx.texts` 读字（分镜里 texts 的 text、in、out），这样的场景改字不用改代码（本片 s02 到 s06 是这样；s01 的字写在代码里，改它的字要用改片模板）：

1. 改 `动画工坊/作品/<片名>/story/storyboard.json` 里那一行的 text（或 in、out；场景的 start、duration 卡在配乐小节线上，不要动）。
2. 想先在本机看一眼：`python3 动画工坊/tools/ci/check_story.py 动画工坊/作品/<片名>` 和 `python3 动画工坊/tools/ci/text_rules.py 动画工坊/作品/<片名>`，再用 `node 动画工坊/作品/<片名>/engine/still.js --scale 1 <时刻>` 出一张图。
3. 改 `动画工坊/渲染请求.json`：换一个新的 id，film 写片名，release 写 true 就会发 Release。
4. `git add --sparse 动画工坊/作品/<片名>/story/storyboard.json 动画工坊/渲染请求.json`，提交，推送。GitHub 上 anim-check 查字和画面（静帧 QA、文字规矩、确定性），anim-render 分片出 4K、混音、核对、出 1080p，按请求发 Release。

只有两种情况要用改片模板：某行字写死在场景代码里，或者字变长后放不下需要重新排版（anim-check 的静帧 QA 会报“出画”“重叠”）。

合并到 main 以后，也可以在 GitHub 的 Actions 页面选 anim-render 点 Run workflow 出片，连推送都不用。

### 改片.workflow.js

只动指定场景，别的场景文件一个字节都不碰。每场一个代理按要求改（`提示词/场景修改.md`），改完立刻由另一个代理对抗式审查（`提示词/场景审查.md`），审查不过就停下报告（质量问题）；都过了，一个代理做本机检查、推送、等 GitHub 出片（`提示词/出片.md`）。

### 新片.workflow.js

| 阶段 | 代理 | 做什么 |
|---|---|---|
| Setup | setup | 用 `tools/new_film.sh` 建作品目录，按模板作品的 BRIEF.md 写本片规矩 |
| Music | music-analysis；evidence、draft×3 | 配乐分析（search 模式先选曲），同时查证据、从三个角度写内容草稿 |
| Plan | plan | 合成内容计划：论点、“恍然大悟”、场景、片长由内容定 |
| Edit | music-edit、music-qa | 用 tools/music 的程序剪配乐，对抗式质检，通过后入库；不过就再剪一轮，两轮不过就停 |
| Story | storyboard、fact-check | 按剪好的配乐写分镜（场景在小节线上，aha 在高潮），事实核查 |
| Scenes | build:sNN、review:sNN | pipeline：每场构建完立刻审查；审查不过的再修一轮 |
| Assemble | assemble:github-preview | 本机 1080p 检查片段，封面和 B站 文案，推送，GitHub 出 4K 预览 |
| Polish、Backup | director-review、polish:sNN、backup-music | 导演看全片挑 3 到 5 处，每处一个代理修；同时做 CC0 备用配乐（licensed 模式） |
| QA | final-qa:画面、final-qa:声音 | 两路终检 |
| Release | release:github | 推送，GitHub 出 4K，发布 Release |

## 在 Claude Code 里怎么用

对 Claude Code 说“用 动画工坊/编排/新片.workflow.js 做一部新片”，并给出参数；它会这样调用 Workflow 工具：

```json
{
  "scriptPath": "<仓库根>/动画工坊/编排/新片.workflow.js",
  "args": {
    "film": "动画工坊/作品/单词是怎么记住的",
    "work": "/tmp/anim-work/how-words-stick",
    "title": "单词是怎么记住的",
    "slug": "how-words-stick",
    "topic": "单词不是背会的，是在有意思的文章里反复相遇、主动回想记住的",
    "duration": [150, 190],
    "music": { "mode": "search" },
    "branch": "claude/article-packages-20261116"
  }
}
```

改片：

```json
{
  "scriptPath": "<仓库根>/动画工坊/编排/改片.workflow.js",
  "args": {
    "film": "动画工坊/作品/如何真正学好英语",
    "title": "如何真正学好英语",
    "slug": "how-to-learn-english",
    "scenes": ["s03", "s07"],
    "request": { "s03": "瀑布落下的词再密一倍", "s07": "方法卡落定时加一次轻微的镜头回弹" },
    "branch": "claude/article-packages-20261116"
  }
}
```

args 要传真正的 JSON 对象，不要传 JSON 字符串。相对路径都相对仓库根（会话的工作目录）。运行中断后用同样的 scriptPath 和 args，加上 `resumeFromRunId` 续跑，已完成的代理直接用缓存结果，不重花 token。完整示例在 `示例/`。

### 新片参数

| 参数 | 必填 | 说明 |
|---|---|---|
| film | 是 | 作品目录，`动画工坊/作品/<片名>`；不存在就新建 |
| work | 是 | 工作目录，在仓库外，放受限音频明文和大中间文件 |
| title、slug | 是 | 片名；英文短名（小写字母、数字、连字符，用于 Release 标签和文件名） |
| topic | 是 | 主题和想让观众认同的观点 |
| branch | 是 | 推送的分支，必须在 `.github/workflows/anim-render.yml` 的触发分支里 |
| style | 否 | 风格要求，默认经典级、惊艳、纯音乐、不是文字幻灯片 |
| duration | 否 | 片长范围（秒），默认 [150, 190]；最终片长由内容定 |
| music.mode | 否 | licensed（用户给的已授权曲子，入库时加密）、cc0（给定 CC0 曲子）、search（默认，从免版权网站选曲） |
| music.file | licensed、cc0 必填 | 曲子文件 |
| music.note | 否 | 授权说明和 B站 简介署名 |
| music.key_file | licensed 必填 | 本机密钥文件，只用 `export MUSIC_KEY="$(cat 文件)"` 读，不打印 |
| music.backup | 否 | 备用配乐首选曲（licensed 模式才做备用版） |
| credit | 否 | 署名，默认“B站UP主 朋克英语” |
| template | 否 | 模板作品，默认 `动画工坊/作品/如何真正学好英语`（复制引擎、BRIEF 底本） |
| reuse | 否 | 旧版场景代码目录，分镜 derived_from 指向的场景可以改写复用 |
| evidence | 否 | 已有的 EVIDENCE.md，给了就不再查证据 |
| angles | 否 | 内容草稿的角度 [{key, brief}]，默认三个（破除误区、情感旅程、数据可视化） |
| skip | 否 | 跳过：drafts（不写多角度草稿）、polish（不做导演打磨）、backup（不做备用配乐）、preview（不做 GitHub 预览） |
| shards | 否 | GitHub 分几段并行出 4K，默认 12 |
| release | 否 | 最后是否发 Release，默认 true |
| audio | 否 | 本机检查片段用的配乐，默认 `<work>/music/score.wav` |
| prompts | 否 | 提示词目录，默认 `动画工坊/编排/提示词` |

### 改片参数

| 参数 | 必填 | 说明 |
|---|---|---|
| film、title、slug、branch | 是 | 同上 |
| scenes | 是 | 场景号列表，例如 ["s03", "s07"] |
| request | 是 | 修改要求：一句话对所有场景，或 {"s03": "...", "s07": "..."} 逐场 |
| work | 否 | 临时目录，默认 `${TMPDIR:-/tmp}/anim-work/<slug>` |
| review | 否 | 改完是否对抗式审查，默认 true（false 时每场省 1 个代理） |
| render | 否 | 是否推送并由 GitHub 出片，默认 true |
| music | 否 | main、backup、none，默认 main（GitHub 上没有 MUSIC_KEY 时自动退到备用配乐） |
| release、shards、audio、prompts | 否 | 同上 |

## 最省 token 的做法

- 能零代理就零代理：改字、改时间、重新出片、发 Release，都只是改文件加推送，GitHub 免费跑完。
- 重活全在 GitHub：4K 渲染、拼接、混音、核对、出 1080p、发 Release 都在 Actions 上跑（公开仓库免费）。本机只出几秒的 1080p 检查片段，不在本机渲染整片。
- 程序能做的交给程序：选曲和剪辑先跑 `tools/music/analyze_track.py`、`rebuild_score.py`、`check_score.py`，分镜和字先跑 `tools/ci/check_story.py`、`text_rules.py`、`stills_qa.py`，代理只做程序做不了的判断。
- 只改要改的：改片模板只动指定场景；新片可以用 `reuse` 改写旧场景代码，用 `evidence` 复用证据，用 `skip` 去掉草稿、预览等步骤（最少约 10 + 2×场景数个代理）。
- 中断了就续跑（resumeFromRunId），不要从头再来。
- 提示词只在 `提示词/` 改一处；改完跑一次 `node 动画工坊/编排/试跑.js <模板> <参数.json>`，确认变量对得上再用。

## 和 GitHub 的分工

| 在哪里跑 | 做什么 |
|---|---|
| Claude Code（代理） | 需要判断和创作的：证据、内容、剪辑方案、分镜、场景代码、审查、导演意见 |
| 本机（程序） | 秒级到分钟级的检查：静帧、分镜检查、文字规矩、配乐检查、几秒的 1080p 检查片段 |
| GitHub Actions | 分钟到小时级的重活：anim-check（每次推送查字和画面）、anim-render（写 `动画工坊/渲染请求.json` 推送就分片出 4K、混音、核对、出 1080p、发 Release；失败的分片自动重试）、anim-music（配乐重建和逐样本核对） |

配乐有版权限制时，原曲和剪辑成品只以加密文件进仓库；GitHub 上要由仓库主人在 Settings > Secrets and variables > Actions 加一次 MUSIC_KEY。没加也不卡：自动用备用配乐（CC0）出片，再没有就无声出片，并在运行摘要里写明。

## 规矩（模板和提示词都按这些写）

- 五条法则：虫洞（一次推送，GitHub 自动出片）；虹吸（程序能做的交给程序，重活交给 GitHub）；完美主义（声音、文字、画面零妥协，每场必审，配乐必质检）；执行主义（规矩由程序在真实流程里执行）；丝滑（只有质量问题能停下流程，缺密钥、运行器出错之类自动退路或重试）。
- 检查只查片子本身（声音、文字、画面），不做“检查的检查”。
- 模板的 meta 是纯字面量，脚本里不用 Date.now()、Math.random()；需要时间戳的（渲染请求的 id）由代理在 shell 里生成。
- 每次代理调用的标签都不同，续跑缓存才不会错位（试跑.js 会查）。
