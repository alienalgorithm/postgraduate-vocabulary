#!/usr/bin/env bash
# 重出参考静帧（作品目录/qa/ref/）：场景画面定了、或有意改了画面以后跑一次，和改动一起提交。
# 用法：bash update_refs.sh <作品目录> [s01:5.6,s02:4.0,...]（场景内秒数；不给就自动选 s01 到 s05 每场字最多的时刻，再加一个离它们最远的检查时刻）
# 需要作品目录里已经 npm ci 过（node_modules 里有 playwright）。出 1080p PNG，文件名带场景和全片秒数，
# manifest.json 记下每张图的输入指纹；CI 的 stills_qa.py 只在指纹相同时比 PSNR，指纹不同就提示过期、不卡。
set -euo pipefail
F=$(cd "${1:?用法：update_refs.sh <作品目录> [时刻]}" && pwd -P)
HERE=$(cd "$(dirname "$0")" && pwd)
python3 "$HERE/stills_qa.py" "$F" --make-refs ${2:+--times "$2"}
