# 字体：本机和 GitHub 运行器出一模一样的字

## 结论

画面上的每一个字都来自作品目录 fonts/ 里的字体文件，不用任何系统字体。字体文件跟着仓库走，GitHub 运行器上不需要装任何字体包。只要 Chromium 版本相同（playwright 1.63.0 自带的 chrome-headless-shell 153.0.8010.12，修订号 1243），字形就和本机一致。

引擎的 engine/index.html 用 @font-face 声明了下面 7 个字体，路径是 ../fonts/文件名，由引擎自带的本地服务器从作品目录读取。font-display: block 加上 engine.js 里的预加载，保证不会先画出后备字体。index.html 的字体声明不要改。

| 文件 | 字体名 | 字重 | 版本 | 用在哪 |
|---|---|---|---|---|
| NotoSansSC-500.ttf | Noto Sans SC | 500 | 2.004 | 说明行、正文（--sans，t-body、t-small） |
| NotoSansSC-700.ttf | Noto Sans SC | 700 | 2.004 | 说明行（t-line、t-label） |
| NotoSansSC-900.ttf | Noto Sans SC | 900 | 2.004 | 标题（t-mega、t-headline、t-title），s02 的 canvas 字 |
| NotoSerifSC-600.ttf | Noto Serif SC | 600 | 2.003 | 中文衬线小字（t-serif-l），--serif-en 的中文后备 |
| NotoSerifSC-900.ttf | Noto Serif SC | 900 | 2.003 | 金句、四个大字（t-serif，按分镜在 s08、s10） |
| SourceSerif4Display-Regular.ttf | Source Serif 4 Display | 400 正体 | 4.004 | 英文正体（t-en-roman），s02 的 canvas 英文 |
| SourceSerif4Display-Italic.ttf | Source Serif 4 Display | 400 斜体 | 4.004 | 英文斜体（t-en、t-source），s01 到 s06 都有 |

许可证：三套字体都是 SIL Open Font License 1.1，可以再分发、可以随作品一起放进公开仓库。许可证原文在 fonts/OFL-NotoSansSC.txt、OFL-NotoSerifSC.txt、OFL-SourceSerif4.txt（同步时会保留，不会被删）。OFL 不允许单独出售字体文件本身；Noto Sans SC 和 Source Serif 4 有保留字体名 Source，不改字体文件就不涉及。

## 怎么证明的（2026-11-19，场景 s01 到 s06）

1. 逐字对照：全片每 0.5 秒定位一帧，收集 DOM 和 SVG 文字（计算后的字体、字重、字形）以及 canvas 的 fillText、strokeText（记录 ctx.font 和文字），再用 fontTools 查每个字在字体栈里第一个能显示它的字体文件。结果：Noto Sans SC 显示 353 个不同的字，Source Serif 4 Display 显示 56 个，回落到系统字体的 0 个。canvas 里只用了 Noto Sans SC 和 Source Serif 4 Display 两种。
2. 去掉全部系统字体再出图：让 fontconfig 读一个没有任何字体目录的配置（fc-list 显示 0 个字体），在 5、15、30、45、64、80 秒出 1080p 图，和正常环境出的图逐字节相同。这说明既没有字回落到系统字体，本机 fontconfig 的渲染设置（hinting、subpixel 等）也不影响画面；引擎启动参数里的 --font-render-hinting=none、--disable-lcd-text 已经把这些固定住了。

本机实际情况：本机系统里另有 Inter、DejaVu、文泉驿正黑、IPA 哥特等字体，sans-serif 默认匹配 Inter；但上面两步证明画面里一个都没用到。

## CI 要做的确切步骤

在作品目录（动画工坊/作品/<片名>）里：

    npm ci
    npx playwright install --with-deps --only-shell chromium

然后把 fontconfig 指向一个空配置，让运行器上的系统字体完全不参与（运行器装了什么字体包都不影响画面）：

    mkdir -p "$RUNNER_TEMP/fc"
    printf '<?xml version="1.0"?>\n<!DOCTYPE fontconfig SYSTEM "urn:fontconfig:fonts.dtd">\n<fontconfig><cachedir>%s/fc/cache</cachedir></fontconfig>\n' "$RUNNER_TEMP" > "$RUNNER_TEMP/fc/fonts.conf"
    echo "FONTCONFIG_FILE=$RUNNER_TEMP/fc/fonts.conf" >> "$GITHUB_ENV"

不需要做的：不用 apt 装字体包，不用往 ~/.fonts 复制字体，不用 fc-cache。字体是网页字体，引擎直接从作品目录的 fonts/ 读。

要点：

- playwright 的版本固定在 package.json 和 package-lock.json 里（1.63.0），npm ci 装的就是它；浏览器用 playwright install 装同一修订号的 headless shell。升级 playwright 等于换 Chromium，要重新核对画面。
- 用空字体配置后，万一以后的场景写了 fonts/ 里没有的字，运行器上会显示成方块，本机会显示成系统字体：两边都不对，属于文字质量问题，要在写场景时换字或补字体，不能靠系统字体兜底。
- 新片（new_film.sh 建的）直接复制这套 fonts/，步骤相同。要加新字体：把可再分发的字体文件和许可证放进 A/fonts，在 index.html 和 design.css 里声明，engine.js 的字体检查名单（FAMILIES）也要加上。

## 仍需在运行器上确认的一点（不是字体问题）

本机 CPU 是带 AVX-512 的 Intel Xeon，GitHub 的 ubuntu-24.04 运行器多半是只有 AVX2 的 AMD EPYC。WebGL 走 SwiftShader（CPU 模拟），Skia 也按 CPU 指令集选不同的代码路径，个别像素的最低位可能不同。建议 CI 第一次跑时在固定时刻出几张图，和本机同一时刻的图算 PSNR，确认肉眼无差别。
