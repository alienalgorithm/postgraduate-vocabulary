#!/bin/bash
# Rebuild the d3_cinematic B站 covers from scratch. Writes only inside this folder.
set -euo pipefail
D=$(cd "$(dirname "$0")" && pwd)
A=/tmp/claude-0/-home-user-postgraduate-vocabulary/3d87cc6c-41dd-58c2-802f-d51dc0c78527/scratchpad/anim
# 1. clean 4K frame of the s08 climax (115.55 s, the sunburst before the crane), camera reframed: F 700, CY 532, CX 1230
RAW=$D/bg/bg_zl-51_f700_cy532_cx1230_115.55.png
[ -f "$RAW" ] || (cd "$A" && node "$D/tools/bg_render.js" "$D/bg" -51 700 532 1230 115.55)
# 2. movie-poster grade, one per format (the 4:3 frame is its own window on the render, sun at 0.68 of its width)
python3 "$D/tools/grade.py" "$RAW" "$D/bg_16x9_graded.png" --sun 2460 1205 --warm 0.75 --legs 2460 1590 260 300
python3 "$D/tools/grade.py" "$RAW" "$D/bg_4x3_graded.png" --sun 2460 1205 --crop 502 2880 --warm 0.75 --legs 2460 1590 260 300
# 3. typography in Chromium at full size (+ text-free pass and layout numbers for the checks)
mkdir -p "$D/work"
node "$D/tools/shoot.js" "$D/cover_16x9.html" "$D/work/r16"
node "$D/tools/shoot.js" "$D/cover_4x3.html" "$D/work/r43"
# 4. masters, upload JPGs, feed previews, side by side, and every program check
python3 "$D/tools/check.py"
