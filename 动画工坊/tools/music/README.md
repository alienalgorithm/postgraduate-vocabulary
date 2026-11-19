# 配乐工具

从一首曲子到成片配乐的全部方法和程序：分析曲子、写剪辑方案、重建配乐、检查声音、加密入库、出片前解密。
《如何真正学好英语》的配乐（Hans Zimmer《Cornfield Chase》剪辑版）就是这样做的，用这里的程序可以从原曲逐字节重建出成片用的 score.wav。

## 1. 文件

| 文件 | 做什么 |
|---|---|
| `analyze_track.py` | 分析任意一首曲子：速度、拍点、拍号、小节线、段落、高潮、爆发、急停、调性、循环和跳转候选；输出 analysis.json、energy.json、analysis.md 草稿 |
| `rebuild_score.py` | 从原曲和剪辑方案 edit_plan.json 重建 score.wav，可以和参考文件逐样本对比 |
| `check_score.py` | 只查声音本身：格式、响度、真峰值、削波、片中静音、咔哒、直流；不通过以 1 退出 |
| `package_music.sh` | 把一部片子的配乐放进仓库：成品和原曲加密，小文件明文复制，备用配乐和 CC0 原曲放进去，最后核对受限明文没有进仓库 |
| `decrypt_music.sh` | 出片前准备配乐（CI 和本地共用）：主配乐解密，不行就用备用，再不行就无声；永远以 0 退出，最后一行 `MUSIC=main/backup/none` |
| `rebuild_from_repo.sh` | 只用仓库里的东西重建配乐并和加密保存的成品逐样本对比 |
| `make_edit_plan.py` | 把小节表和剪辑规格合成一个自带全部信息的 edit_plan.json（package_music.sh 会调用） |
| `scorelib.py` | 共用函数：解码、小节线剪辑渲染、母带、逐样本对比 |
| `selftest.sh` | 自测：check_score 每一项一个好样本、一个坏样本；decrypt_music 的每条退路各跑一次 |
| `requirements.txt` | Python 依赖，固定为做本片时的实际版本 |
| `examples/epic_vista/` | analyze_track.py 在一首 CC0 曲子（John Bartmann《Epic Vista》）上的实测输出 |
| `原始脚本/` | 做本片配乐时写的原脚本，原样保存作为历史，见里面的说明.md |

## 2. 方法和理由

1. 只在小节线剪。循环和跳转都是整小节，拍网格从头到尾连续；同一个原曲小节在剪辑里出现两次，两处的波形延迟是 0 毫秒。
2. 和弦要接得上。出点前和入点前、出点后和入点后的和弦要一样（比如都是 Am 换到 G），接口最好放在换和弦的地方，音色变化被换和弦盖住。
3. 等功率交叉淡化，按两边信号实测的相关系数 rho 修正增益（a² + b² + 2·rho·a·b = 1），中声道和侧声道各用自己的 rho，接口处不鼓包、不凹陷、声像不变窄。默认“前置”：淡化在小节线前 10 毫秒结束，下一小节的强拍只来自进入的一边。安静段落用长淡化（300 到 1250 毫秒），密集段落用短淡化（40 到 160 毫秒）。
4. 不变调；变速不超过 3%（本片 0%）。
5. 片长由内容决定。先定场景表，再按小节线剪音乐去贴场景，不是让画面迁就原曲长度。本片最后多加 2 小节，让音乐落在 F 和弦上收住。
6. 高潮对准“恍然大悟”，而且只经过一次。本片 111.842 秒是原曲第 62 小节的强拍（满编和深低音同时落下），恍然大悟第一行落在这里。
7. BGM 可循环、可截段、可混搭：同速同调、在小节线上接，就能循环加长、截掉一段、或者接另一首。本片没混，因为原曲自己就有安静开头、推进、爆发、高潮、急停和可以回来的前奏，混别的只会多出接缝。
8. 安静段落整体抬高（宏观增益，断点之间余弦缓变，没有阶跃），手机外放也听得见；爆发前后的落差原样保留。
9. 母带：积分响度 -14 LUFS，真峰值不超过 -1 dBTP（本片限幅上限 -1.2）。限幅器 4 倍过采样检测，4 毫秒前视，汉宁平滑起音，100 毫秒释放，增益不许瞬间跳变；最后 TPDF 抖动到 24 bit（固定随机种子，结果可重复）。
10. 检查只查声音本身，每条检查配坏样本和好样本（selftest.sh）。

## 3. 本片的完整流程

| 步 | 做了什么 | 程序 |
|---|---|---|
| 1 解码 | 用户给的 MP3（320 kbps，44.1 kHz）用 ffmpeg 在原采样率解码成 float32，再用 soxr VHQ 重采样到 48 kHz | `scorelib.decode` |
| 2 分析 | 96 BPM，3/4，一小节 1.875 秒；第 18 小节只有 2 拍；A 小调，F G Am G 每和弦 2 小节；42.467 爆发，113.717 最满，119.342 急停 | 原始脚本 cc_py、cw_py；结果在 作品/如何真正学好英语/music/analysis.md、cc_map.json |
| 3 剪辑方案 | 9 段原曲、8 个接口、每个接口的淡化、段增益、宏观增益、淡入淡出 | 作品/如何真正学好英语/music/edit_plan.json（理由见同目录 edit.md） |
| 4 渲染和母带 | 剪辑 → 宏观增益 → 归一到 -14 LUFS → 真峰值限幅 → 24 bit 抖动 | `rebuild_score.py` |
| 5 检查 | 每个接口看跳变、咔哒、凹陷鼓包、频谱变化、十六分音符相位；整条看削波、静音、高频尖峰、网格 | `check_score.py`；原始脚本 edit2_py/seams.py、verify.py、specimg.py |
| 6 时间轴数据 | map.json（小节线、段落、接口、锚点）给分镜，energy.json（每 1/60 秒能量、hits、events）给引擎 | 原始脚本 edit2_py/finalize.py；新片对成品跑 `analyze_track.py` 也能得到 energy.json |
| 7 入库 | 成品转 FLAC 后加密，原曲加密，小文件明文 | `package_music.sh` |
| 8 出片 | 解密主配乐，没有密钥就用备用 | `decrypt_music.sh` |

注意：作品目录里 analysis.md 写的解码命令 `ffmpeg -i ... -ar 48000` 是笔误，那条命令用 ffmpeg 自带的重采样，和成片实际用的源最多差 2e-4；按笔误解码，重建就不会逐样本一致。

## 4. 怎么跑

```bash
sudo apt-get install -y ffmpeg                          # ubuntu-24.04 自带 6.1.1，和做片时一样
pip install -r 动画工坊/tools/music/requirements.txt     # Python 3.13
M=动画工坊/tools/music; F=动画工坊/作品/如何真正学好英语

# 新片选曲、剪辑前：分析曲子（拍子不对就加 --bpm 96 --meter 3）
python3 $M/analyze_track.py 曲子.mp3 --out 分析结果 --png
# 写好 edit_plan.json 后重建、检查
python3 $M/rebuild_score.py --source 曲子.mp3 --plan edit_plan.json --out score.wav --compare 参考.wav
python3 $M/check_score.py score.wav --ref 曲子.mp3
# 入库（需要 MUSIC_KEY）
export MUSIC_KEY="$(cat 密钥文件)"; bash $M/package_music.sh 工作目录 $F
# 出片前（CI 里同一条命令）
bash $M/decrypt_music.sh $F        # 最后一行 MUSIC=main / backup / none
# 只用仓库复核：重建并和加密保存的成品逐样本对比
bash $M/rebuild_from_repo.sh $F
# 自测
bash $M/selftest.sh
```

## 5. edit_plan.json

| 字段 | 内容 |
|---|---|
| `source` | 原曲名字、加密文件位置、sha256（重建时核对，不一致会提醒）、解码方法 |
| `grid` | 原曲小节表：`bars` 每行 `n`（小节号）、`start`（小节线时间，秒）、`beats`、`chord`、`section`；最后一行可以是 0 拍的“停止线” |
| `edit.segments` | 按播放顺序的原曲段：`bars: [a, b]` 播原曲第 a 到 b-1 小节，从第 b 条小节线离开；`gain_db` 段增益；`tail_bars` 停止线之后保留几小节尾音；`env` 段内渐变 `[[原曲时间, dB], ...]` |
| `edit.xf` | 第 k 个接口（第 k 段的开头）的淡化：`len` 秒，`place` 为 `pre`（小节线前 `pre_ms` 毫秒结束）、`center` 或 `post`（从小节线开始）；不写就是 156 毫秒前置 |
| `edit.fade_in_ms`、`edit.fade_out` | 开头升余弦淡入；结尾从输出第 `start_bar` 小节加 `delay_s` 开始淡出，dB 曲线 `db·u^pow`，最后四分之一再乘余弦落到 0 |
| `edit.macro_db` | 宏观增益断点 `[[输出时间, dB], ...]`，之间余弦缓变 |
| `master` | 目标响度、限幅上限、前视、释放、抖动种子 |
| `expected` | 成品的帧数、长度、响度、sha256：重建时核对 |

## 6. 加密和密钥

- 仓库是公开的。有授权限制的原曲和剪辑成品绝不明文进仓库（防止 DMCA 让整个仓库被下架），只提交加密文件；`.gitignore` 挡住明文音频，只放行 `music/backup/` 和 `music/cc0/`。
- 统一命令：`openssl enc -aes-256-cbc -pbkdf2 -iter 200000 -salt -pass env:MUSIC_KEY`（解密加 `-d`）。密钥只放环境变量，不打印、不写进任何文件。
- GitHub 上要由仓库主人手动加一次仓库密钥：Settings > Secrets and variables > Actions > New repository secret，名字 `MUSIC_KEY`，值是本机密钥文件的内容。
- 没有密钥不卡流程：decrypt_music.sh 自动改用备用配乐（CC0），再没有就无声出片，并在 Actions 摘要里写明原因。
- `private/SHA256SUMS` 记录加密前明文的 sha256 和音频逐样本 md5；解密后逐样本核对，不一致就当解密失败处理。
- package_music.sh 是幂等的：已有的加密文件用当前密钥解出来和明文音频一致就不重新加密（加密带随机盐，每次结果都不同，会产生无意义的 git 改动）。

## 7. 在 GitHub Actions 上用

```yaml
- uses: actions/setup-python@v5
  with: { python-version: '3.13' }
- run: sudo apt-get update && sudo apt-get install -y ffmpeg
- run: pip install -r 动画工坊/tools/music/requirements.txt
- run: bash 动画工坊/tools/music/selftest.sh            # 检查程序自己的好坏样本
- id: music
  env: { MUSIC_KEY: '${{ secrets.MUSIC_KEY }}' }
  run: bash 动画工坊/tools/music/decrypt_music.sh 动画工坊/作品/如何真正学好英语 | tee music.log && tail -1 music.log >> "$GITHUB_OUTPUT"
# 之后 steps.music.outputs.MUSIC 是 main、backup 或 none
```

## 8. 本片的数字

- 成品：48 kHz，立体声，24 bit，169.342 秒，积分 -14.0 LUFS，真峰值 -1.2 dBTP，LRA 18.4 LU，最大限幅 1.3 dB，sha256 c98a3e1d…c36a。
- 重建：rebuild_score.py 从原曲 MP3 重建，和成品逐字节相同（sha256 一致，8128416 帧 0 个样本不同），本机约 40 秒。
- 加密后入库：score.flac.enc 约 28 MB，source_cornfield_chase.mp3.enc 约 5 MB；decrypt_music.sh 解出的 WAV 和成品逐字节相同。

## 9. 踩过的坑

- 限幅器在平滑之后又把增益夹到最小值滤波的结果上，起音变成瞬间跳变（每采样最多 0.32 dB），爆发后 124 毫秒出现比原曲高 12 dB 的高频尖峰。去掉这一步，起音是 8 毫秒平滑斜坡。scorelib.limiter 是修好的版本。
- 原曲文件开头有前一轨留下的低频余音，抬高增益后听得见：开头加 1.2 秒升余弦淡入。
- 原曲开头比高潮低约 26 LU，手机外放几乎听不见：用宏观增益抬高安静段落。
- 从深低音回来之后（原曲 83.717 秒以后）跳回之前，低音会突然消失；从高潮往回跳会掉约 3 dB：高潮只放在最后一次经过。
- 原曲第 18 小节只有 2 拍，按“每 3 拍一条小节线”推会错一拍：时间轴一律用 map.json 的真实小节线 `bars`。
- check_score.py 的咔哒检查必须拿原曲做参照：不同曲子自己的高频尖峰从 11 dB 到 50 dB 都有，固定门限会误报。
