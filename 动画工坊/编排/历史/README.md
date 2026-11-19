# 编排历史：《如何真正学好英语》的五版工作流脚本

2026-11-19 这一天，主会话用 Claude Code 的 Workflow 工具指挥多个代理做这部纯音乐 4K 动画，前后写了五版脚本。这里原样保存，文件名前的数字是先后顺序，后面的 wf_ 编号对应当时的运行记录。脚本里所有路径都来自参数 `args.A`（当时的工作目录），没有写死的本机路径，也没有个人信息。

以后做新片不要直接用这些脚本，用上一级的 `新片.workflow.js` 和 `改片.workflow.js`；这里只用来查“当时为什么这样做”。

| 版 | 文件 | 时间 | 阶段 | 代理调用处 | 结果 |
|---|---|---|---|---|---|
| 1 | 1_how-to-learn-english-animation-wf_06c3a7f7-068.js | 05:55 | Story、Engine、Scenes、Music、Assemble | 12 | 刚开跑就停 |
| 2 | 2_how-to-learn-english-animation-4k-wf_614ec310-5ef.js | 06:02 | Prepare、Music、Story、Scenes、Assemble | 15 | 跑到选曲就停 |
| 3 | 3_how-to-learn-english-animation-4k-v2-wf_ed1ee8af-443.js | 06:18 | Prepare、Music、Story、Scenes、Assemble、Polish | 17 | 跑到第 7 场，配乐换曲后停 |
| 4 | 4_how-to-learn-english-animation-cornfield-wf_ce2b8fc9-771.js | 12:03 | Music、Story、Scenes、Assemble、Polish、QA、Backup | 13 | 刚分析曲子就停 |
| 5 | 5_how-to-learn-english-animation-cornfield-v2-wf_dec753d8-f79.js | 12:08 | Music、Plan、Edit、Story、Scenes、Assemble、Polish、QA、Backup | 15 | 正式版 |

“代理调用处”是脚本里 agent( 出现的次数；按场景展开后实际代理次数更多（每场 2 个：构建、审查）。

## 第 1 版：先跑通整条线（自己合成配乐）

做了什么：
- Story 和 Engine 两条线并行。Story：先查证据写 EVIDENCE.md（evidence），再从三个角度各写一版分镜（myth 破除误区、journey 学习者的旅程、system 数据可视化），导演（director）合成一版，事实核查（fact-check）。Engine：做一个能逐帧 seek 的 GSAP 渲染框架，still.js 出静帧，render.js 把帧用管道直接送进 ffmpeg，支持 --scale 2 出 4K。
- Scenes 和 Music 两条线并行。Scenes 每场“构建，然后对抗式审查”（pipeline）。Music 用 numpy、scipy 自己合成配乐（compose），固定 100 BPM、一小节 2.4 秒，再审查（music-review）。
- Assemble：渲染、混音、响度、封面，最后画面和声音两路终检。

运行：只启动了 evidence 和 engine 两个代理就停了。

为什么改：用户 2026-11-19 改了两条要求。一是画面要 4K（这一版已经写进去了，下一版成为正式规格：3840×2160、60 fps、文件控制在 1.9 GB 内、用 Release 交付）。二是配乐不再自己合成，改用网上可以自由使用的现成音乐（CC0 优先，CC-BY 只作备选，NC、ND、许可不明的一律不用），并且先定音乐、再按音乐定画面时间。

## 第 2 版（-4k）：免版权音乐，先音乐后画面

做了什么：
- Prepare 三条线并行：内容（证据、三个角度的草稿、导演合成 content.json）、引擎、两路选曲（music-search:freepd+fma 查 freepd.com 和 freemusicarchive.org；music-search:oga+incompetech 查 opengameart.org 和 incompetech.com）。每首候选曲都要下载、记许可原文、用 librosa 分析速度、拍点、能量曲线、段落，出能量图。
- Music：音乐总监（music-director）按内容的能量起伏选曲、只在小节线剪、母带到 -14 LUFS，写 map.json（拍点、小节、段落、高潮）；音乐质检（music-qa）。
- Story：按剪好的音乐重排分镜时间（retime），每场开始落在小节线上，“恍然大悟”那句落在高潮；事实核查。
- Scenes、Assemble 同上，成片 4K 加 1080p 预览、封面。

运行要点（journal）：evidence 写出 13 条证据（F1 到 F13，每条有可上屏的中文句、角落出处、完整出处、能说明什么不能说明什么、可上屏的数字、可信度）。跑到选曲就停了。

为什么改：用户再次强调两件事。一是要“经典级”：让大家觉得这是一个很经典、特别惊艳的视频。二是“全技巧”：不能只用文字，要把所有可能用到的技巧都考虑到，挑最好的。于是 BRIEF.md 加了《经典级标准》和《全技巧工具箱》（13 种手法）两节。

## 第 3 版（-4k-v2）：经典级标准加全技巧工具箱

做了什么：
- 三个角度的草稿都必须用全技巧工具箱：每场至少 3 种手法，至少 3 个名场面，一个贯穿全片的视觉母题，一条色彩剧本（开头冷暗，从“恍然大悟”起变亮变暖）；导演合成时标出最关键的“恍然大悟”那句和它所在的场景。
- 引擎升级：注册 GSAP 的全部免费插件（SplitText、MorphSVG、DrawSVG、MotionPath、CustomEase、ScrambleText、Physics2D），加确定性的粒子、SVG 滤镜、three.js 三维、按音乐能量驱动的 energy(t)、引擎级 0.3 秒交叉淡化；用 demo 场景从头到尾实测 4K 速度。
- 新增 Polish 阶段：导演看完整片，挑 3 到 5 个最弱的地方给出具体改法，每条一个代理并行修，然后重新合成，再做终检。

运行要点（journal）：
- 三版草稿：myth 196 秒、journey 192 秒、system 190 秒；导演合成 194 秒。
- 引擎实测：6 秒样片在 1080p 和 4K 都正好 360 帧，任意顺序 seek 画面逐字节相同；整部 3 分钟 4K 片约 2 小时 12 分，在 3 小时预算内，three.js 名场面可以用。
- 选曲：音乐总监选了 John Bartmann 的 Epic Vista（CC0）。理由是它自己的结构就有“低音抽空、几乎无声、全乐队爆发、温暖收尾”，94 BPM 网格稳定，能在小节线上精确剪。其他候选被否：Tender Moment 太闷，Fantasy Orchestral 只有一路渐强没有爆发，Elevate 是舞曲底鼓，其余是 CC-BY 或许可来源存疑。剪成 205.168 秒，3 个接口都在小节线上。
- 音乐质检抓到一个真问题：原曲 MP3 的低频左右声道反相，手机等单声道外放时低音会抵消（前奏少 7.7 dB），已修。
- 分镜按音乐重排为 205.168 秒、11 场；s01 到 s07 已开始构建（s01 到 s05 的代码后来归档到 scenes_v1/ 复用）。

为什么改：用户决定配乐改用 Hans Zimmer《Cornfield Chase》（《星际穿越》原声），说明版权已经谈好。之前按 Epic Vista 做的分镜和场景归档到 story/v1_epicvista/ 和 scenes_v1/，Epic Vista 改作备用配乐。

## 第 4 版（-cornfield）：改用 Cornfield Chase

做了什么：
- Music：分析并调好增益，得到拍点、小节、段落、高潮、能量曲线。
- Story：按这首曲子重剪分镜（recut），片长等于原曲有效长度（约 127 秒），压缩到 8 或 9 场；事实核查和音乐质检并行。新增 derived_from 字段，记录每场复用了旧版哪一场，s01 到 s05 优先改旧代码。
- 后面依次是 Scenes、Assemble、Polish、QA，新增 Backup 阶段：同一套画面配 CC0 的 Epic Vista 出备用版，B站 如果因版权静音或下架可以直接换。

运行：只启动了 music-analysis 就停了。

为什么改：用户当天更正：片长由内容决定，不由配乐长度决定。配乐可以只用某一段，可以反复用某些段落，也可以和别的 CC0 曲子混，怎么剪由我们定，但节奏必须绝对完美（只在小节线剪、等功率交叉淡化听不出接缝、不改音高、变速不超过 3%、全片最满的一刻放“恍然大悟”、结尾自然收住）。

## 第 5 版（-cornfield-v2）：内容定片长，配乐灵活剪辑（正式版）

做了什么：
- Music：精确分析原曲（速度、拍号、调、每个拍点和小节线、乐句、各声部进入点、推进、高潮、结尾），找可循环的乐句并试渲染检查接缝；写 analysis.md、cc_map.json、LICENSES.md（记下用户 2026-11-19 关于授权的说明和简介署名）。
- Plan：先按内容定结构和片长（150 到 190 秒），每场给目标时长、能量、需要的音乐角色（安静的固定音型、声部进入、推进、高潮、收尾）、derived_from，标出“恍然大悟”所在场景和位置。
- Edit：音乐剪辑师按计划剪配乐（段落、循环、可选混 CC0），场景边界吸附到剪辑后配乐的小节线，母带 -14 LUFS、真峰值不超过 -1 dBTP；写 map.json（含 scene_slots）、energy.json、edit.md。音乐质检对抗式复查每个接缝。
- Story：按 scene_slots 写最终分镜，场景首尾相接、都在小节线上，“恍然大悟”落在 map.climax；事实核查。
- Scenes、Assemble、Polish、QA、Backup 同第 4 版。

运行要点（journal）：
- 原曲分析：96 BPM，一拍 0.625 秒，32 到 119 秒的节拍漂移小于 5 毫秒。
- 计划：10 场，约 165.6 秒；剪辑后配乐 169.342 秒，只用 Cornfield Chase（混 CC0 只会多出音色和调性的接缝），-14.0 LUFS，真峰值 -1.2 dBTP，无削波。
- 音乐质检抓到一个真问题：母带限幅器每次起音时增益一个采样内跳变，在 55.716 秒留下 1 毫秒、比原曲高 12 dB 的高频尖刺；已改成平滑起音。
- 分镜 169.342 秒、10 场；场景按 derived_from 改写旧代码，每场都做了确定性测试（顺序、乱序、分块起点三种 seek 逐字节相同）和 1080p 检查片。

## 五版之间学到的（已经写进新模板）

- 先定内容，再剪音乐，再按剪好的音乐定画面时间；音乐只在小节线剪。
- 音乐总监和音乐质检都“只能看数字、不能用耳朵”，所以每个接缝都要做数值检查（采样跳变、RMS、频谱连续、相位）加频谱图；两次都靠对抗式质检抓到了真问题。
- 每场“构建，然后对抗式审查”用 pipeline，不等全部场景构建完再审。
- 导演打磨只挑 3 到 5 个最弱处，每处一个代理并行修，只改自己那一场。
- 改需求时把旧版归档（story/v1_epicvista、scenes_v1）并用 derived_from 复用，省一半构建成本。
- 4K 重活在本机很慢（整片约 2 小时，还占满 CPU），新模板改成推送到 GitHub，由 Actions 分片并行出 4K，本机只出 1080p 检查片段。
