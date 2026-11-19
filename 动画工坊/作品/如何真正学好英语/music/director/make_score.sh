#!/usr/bin/env bash
# Rebuild A/music/score.wav, map.json and energy.json from the downloaded source, end to end.
set -euo pipefail
M="$(cd "$(dirname "$0")/.." && pwd)"
D="$M/director"; W="$M/work"; mkdir -p "$W"
python3 -I "$D/decode.py" "$M/src/John_Bartmann__Epic_Vista.mp3" "$W/ev_src.npy"
python3 -I "$D/build.py" "$W/ev_src.npy" "$W/edit_441.npy" "$W/edit_meta.json"
python3 -I "$D/master.py" "$W/edit_441.npy" "$W/edit_meta.json" "$W" "$M/score.wav"
python3 -I "$D/reanalyze.py" "$M/score.wav" "$W/edit_meta.json" "$M/map.json" "$M/energy.json"
( cd "$M" && python3 -I "$D/seamcheck.py" score.wav 48000 "$W/edit_meta.json" && python3 -I "$D/clickcheck.py" | head -2 )
ffmpeg -hide_banner -nostats -i "$M/score.wav" -af ebur128=peak=true -f null - 2>&1 | sed -n '/Summary/,$p' | tr -s ' '
ffmpeg -hide_banner -nostats -i "$M/score.wav" -af astats=measure_perchannel=none -f null - 2>&1 | grep -E "Peak level|RMS level|Flat factor|DC offset|Number of samples" | sed 's/.*\] //'
sha256sum "$M/score.wav"
