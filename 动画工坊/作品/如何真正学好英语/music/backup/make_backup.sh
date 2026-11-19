#!/usr/bin/env bash
# Rebuild A/music/backup/score_backup.wav (CC0 backup score: John Bartmann "Epic Vista") from the downloaded MP3, end to end.
set -euo pipefail
BK="$(cd "$(dirname "$0")" && pwd)"; M="$(cd "$BK/.." && pwd)"; T="$BK/tools"; W="$BK/work"; mkdir -p "$W"
MP3="$M/src/John_Bartmann__Epic_Vista.mp3"; [ -f "$MP3" ] || MP3="$M/cc0/John_Bartmann__Epic_Vista.mp3"   # work dir keeps it in src/, the repo in cc0/
python3 -I "$M/director/decode.py" "$MP3" "$W/ev_src.npy"
python3 -I "$T/build.py" "$W/ev_src.npy" "$W/edit_441.npy" "$W/edit_meta.json"
python3 -I "$T/stage1.py" "$W/edit_441.npy" "$W" "$W/fixed_48.npy"
python3 -I "$T/stage2.py" "$W/fixed_48.npy" "$W" "$BK/score_backup.wav"
python3 -I "$T/seamcheck.py" "$BK/score_backup.wav" 48000 "$W/edit_meta.json"
python3 -I "$T/verify.py" "$BK/score_backup.wav" "$W/edit_meta.json" "$W/ev_src.npy"
ffmpeg -hide_banner -nostats -i "$BK/score_backup.wav" -af ebur128=peak=true -f null - 2>&1 | sed -n '/Summary/,$p' | tr -s ' '
ffmpeg -hide_banner -nostats -i "$BK/score_backup.wav" -af astats=measure_perchannel=none -f null - 2>&1 | grep -E "Peak level|RMS level|Flat factor|Peak count|DC offset|Number of samples" | sed 's/.*\] //'
ffmpeg -hide_banner -nostats -i "$BK/score_backup.wav" -af silencedetect=noise=-60dB:d=0.5 -f null - 2>&1 | grep -E "silence_(start|end)" | sed 's/.*\] //'
ffprobe -v error -show_entries stream=codec_name,sample_rate,channels,bits_per_raw_sample,duration_ts,duration -of compact "$BK/score_backup.wav"
sha256sum "$BK/score_backup.wav"
python3 -I "$T/spectro.py" "$BK/score_backup.wav" "$W/spectro.png"
ffmpeg -v error -y -i "$BK/score_backup.wav" -c:a flac -sample_fmt s32 -bits_per_raw_sample 24 -compression_level 8 "$BK/score.flac"   # what the render uses (film.json music.backup.file)
rm -f "$W"/*.npy "$W"/*.wav          # large intermediates (about 0.9 GB); everything is rebuilt from the MP3
