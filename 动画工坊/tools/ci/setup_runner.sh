#!/usr/bin/env bash
# GitHub 运行器（ubuntu-24.04）准备：ffmpeg、作品依赖、playwright 的 Chromium、空字体配置。各工作流共用。
# 用法：bash setup_runner.sh <作品目录> [ffmpeg] [browser] [pylibs]
#   ffmpeg   apt 装 ffmpeg（运行器上是 6.1.1，和本机一致）；已有就跳过
#   browser  npm ci + playwright install --with-deps --only-shell chromium（版本由 package-lock.json 固定）
#            + 把 fontconfig 指向空配置：画面上的字只来自作品的 fonts/，系统字体完全不参与（见 tools/fonts.md）
#   pylibs   pip 装 numpy、pillow（静帧对比和联系表用）
set -euo pipefail
F=$1; shift
for what in "$@"; do
  case $what in
    ffmpeg)
      if ! command -v ffmpeg >/dev/null; then
        sudo apt-get update -qq && sudo DEBIAN_FRONTEND=noninteractive apt-get install -y -qq --no-install-recommends ffmpeg >/dev/null
      fi
      ffmpeg -version | head -n1 ;;
    browser)
      (cd "$F" && npm ci --no-audit --no-fund --loglevel=error && npx playwright install --with-deps --only-shell chromium)
      T=${RUNNER_TEMP:-/tmp}
      mkdir -p "$T/fc/cache"
      printf '<?xml version="1.0"?>\n<!DOCTYPE fontconfig SYSTEM "urn:fontconfig:fonts.dtd">\n<fontconfig><cachedir>%s/fc/cache</cachedir></fontconfig>\n' "$T" > "$T/fc/fonts.conf"
      if [ -n "${GITHUB_ENV:-}" ]; then echo "FONTCONFIG_FILE=$T/fc/fonts.conf" >> "$GITHUB_ENV"; fi
      echo "fontconfig 用空配置 $T/fc/fonts.conf（系统字体 0 个）" ;;
    pylibs)
      python3 -c 'import numpy, PIL' 2>/dev/null || python3 -m pip install -q --disable-pip-version-check numpy pillow ;;
    *) echo "不认识的准备项 $what" >&2; exit 2 ;;
  esac
done
