#!/usr/bin/env bash
# Rebuild cover d4_question from the film: stills -> assets -> masters -> uploads, feed previews, checks.
set -euo pipefail
D="$(cd "$(dirname "$0")" && pwd)"
cd "$D/tools" && node cap.js "$D/stills" 22.2 30.0 124.6     # 4K film stills, on-screen text and s03 axes hidden
cp "$D/stills/k_124.6.png" "$D/stills/c_124.6.png"
python3 "$D/tools/prep_assets.py"    # brain + learner cut-outs
python3 "$D/tools/prep_city.py"      # city of words: lights out on the left, gold on the right
python3 "$D/tools/grade_brain.py"    # amber grooves
cd "$D" && node build.js && python3 post.py
