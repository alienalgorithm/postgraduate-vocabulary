#!/usr/bin/env bash
# 渲染一段（GitHub 上每个 render 作业跑一次，本机也能跑）。
# 用法：bash render_shard.sh <作品目录> <输出.mp4> <from秒> <to秒> <scale> <fps> [并行数，默认 3] [分镜，默认 film.json 里的]
# 只出画面（--audio none），配乐在 assemble 一次混入，保证各段能 -c copy 无损拼接。
# 失败自动重试一次（浏览器偶发崩溃之类不是质量问题，不许卡住）；两次都失败才以 1 退出。
# 旁边写 <输出>.json：帧数、渲染速度（帧/秒）、用时，assemble 汇总进摘要。
set -uo pipefail
F=$(cd "$1" && pwd -P); OUT=$2; FROM=$3; TO=$4; SCALE=$5; FPS=$6; PAR=${7:-3}
SB=${8:-$(python3 -I -c 'import json,sys; print(json.load(open(sys.argv[1])).get("storyboard","story/storyboard.json"))' "$F/film.json")}
HERE=$(cd "$(dirname "$0")" && pwd)
mkdir -p "$(dirname "$OUT")"; OUT=$(cd "$(dirname "$OUT")" && pwd)/$(basename "$OUT")
EXPECT=$(python3 -I -c 'import math,sys; f=lambda x: math.floor(float(x)*int(sys.argv[3])+0.5); print(f(sys.argv[2])-f(sys.argv[1]))' "$FROM" "$TO" "$FPS")
LOG=$OUT.log
ann() { if [ -n "${GITHUB_ACTIONS:-}" ]; then echo "::$1 title=$2::$3"; else echo "[$1] $2: $3"; fi; }

for try in 1 2; do
  t0=$(date +%s)
  (cd "$F" && node engine/render.js --out "$OUT" --from "$FROM" --to "$TO" --scale "$SCALE" --fps "$FPS" \
      --audio none --parallel "$PAR" --storyboard "$F/$SB") 2>&1 | tee "$LOG"
  rc=${PIPESTATUS[0]}
  t1=$(date +%s)
  if [ "$rc" = 0 ] && python3 -I "$HERE/verify_video.py" "$OUT" --frames "$EXPECT" --fps "$FPS" --width $((1920 * SCALE)) --height $((1080 * SCALE)) --audio no --quiet; then
    python3 -I - "$OUT" "$EXPECT" "$((t1 - t0))" "$try" "$LOG" <<'EOF'
import json, re, sys
out, n, sec, tries, log = sys.argv[1], int(sys.argv[2]), int(sys.argv[3]), int(sys.argv[4]), sys.argv[5]
m = re.search(r'render \S+ \(([\d.]+) fps', open(log, encoding='utf-8', errors='replace').read())
info = {'frames': n, 'seconds': sec, 'render_fps': float(m.group(1)) if m else round(n / max(sec, 1), 2), 'tries': tries}
json.dump(info, open(out + '.json', 'w'))
print(json.dumps(info))
EOF
    ann notice "分段 $(basename "$OUT")" "帧 $EXPECT，用时 $((t1 - t0)) 秒，第 $try 次成功"
    exit 0
  fi
  [ "$try" = 1 ] && ann warning "分段 $(basename "$OUT")" "第 1 次渲染失败（退出码 $rc），自动重试一次"
done
ann error "分段 $(basename "$OUT")" "重试后仍失败，见日志；Actions 页面点 Re-run failed jobs 只重跑失败的段"
exit 1
