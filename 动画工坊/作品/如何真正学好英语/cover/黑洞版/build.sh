#!/usr/bin/env bash
# Rebuild the cover from scratch (deterministic, seeded). Needs node + playwright (chromium),
# python3 + numpy + scipy + pillow. About 15 minutes on 4 CPUs (SwiftShader WebGL).
#   bash build.sh            full build: masters, uploads, feeds, pair sheet, checks
#   bash build.sh preview    half-resolution, 4 samples per pixel, writes work/prev_<fmt>.png only
set -euo pipefail
cd "$(dirname "$0")"
mkdir -p work
MODE="${1:-full}"

python3 src/words.py work                       # word textures for the accretion disk

for fmt in 16x9 4x3; do
  if [ "$MODE" = preview ]; then
    python3 src/mkcfg.py "$fmt" 0.5 4
    dsf=1; out="work/prev_${fmt}.png"
  else
    python3 src/mkcfg.py "$fmt" 1
    dsf=2; out="master_${fmt}.png"
  fi
  node src/render_bh.js "work/rcfg_${fmt}.json" "work/hdr_${fmt}.f32"   # GLSL ray tracer -> linear HDR
  python3 src/post.py "$fmt"                                            # ridge, astronaut, bloom, grade
  node src/text.js "$fmt" "$dsf"                                        # HTML/CSS typography layer
  python3 src/compose.py "$fmt" "$out"                                  # layer styles, grain
done

if [ "$MODE" != preview ]; then
  python3 src/finalize.py      # upload JPEGs, feed previews, pair sheet
  python3 src/checks.py        # program checks; non-zero exit if any fails
fi
