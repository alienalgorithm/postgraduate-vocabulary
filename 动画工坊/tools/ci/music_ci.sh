#!/usr/bin/env bash
# 配乐的重活放到 GitHub 上跑（anim-music.yml 调它，本机也能跑）。只查声音本身。
# 用法：bash music_ci.sh <作品目录> <输出目录>（先 pip install -r 动画工坊/tools/music/requirements.txt）
#   1. tools/music/selftest.sh：check_score 每项的坏样本必抓、好样本必放，decrypt_music 每条退路各跑一次
#   2. 有 MUSIC_KEY：rebuild_from_repo.sh 从加密原曲重建 score.wav，和加密保存的成品逐样本对比（不一致以 2 退出 = 不通过）；
#      再用 check_score.py 查重建结果（带原曲做咔哒参照），测响度、真峰值
#   3. 对 CC0 曲子跑 analyze_track.py 冒烟测试（有没有密钥都跑，它也是新片选曲的第一步）
#   4. 有备用配乐 music/backup/score.flac 就用 check_score.py 查它（它会进成片）
# 明文音频只在临时目录，结束删掉；输出目录里只有报告（json、md、png），绝不上传音频。
set -uo pipefail
F=$(cd "${1:?用法：music_ci.sh <作品目录> <输出目录>}" && pwd); OUT=$2; mkdir -p "$OUT"; OUT=$(cd "$OUT" && pwd)
M=$(cd "$(dirname "$0")/../music" && pwd)
T=$(mktemp -d "${TMPDIR:-/tmp}/music_ci.XXXXXX"); trap 'rm -rf "$T"' EXIT
fail=0
ann() { if [ -n "${GITHUB_ACTIONS:-}" ]; then echo "::$1 title=配乐::$2"; else echo "[$1] $2"; fi; }
sum() { [ -n "${GITHUB_STEP_SUMMARY:-}" ] && echo "$1" >> "$GITHUB_STEP_SUMMARY"; echo "$1"; }
sum "### 配乐检查（$(basename "$F")）"

# 1. 自测
if bash "$M/selftest.sh" > "$OUT/selftest.txt" 2>&1; then
  sum "- 自测通过：$(grep -c '通过' "$OUT/selftest.txt") 项"; ann notice "selftest.sh 全部通过（$(grep -c '通过' "$OUT/selftest.txt") 项）"
else
  fail=1; sum "- 自测不通过：$(grep '不对' "$OUT/selftest.txt" | head -5 | tr '\n' ' ')"; ann error "selftest.sh 有不对的项，见 selftest.txt"
fi

# 2. 重建并逐样本对比
if [ -n "${MUSIC_KEY:-}" ]; then
  bash "$M/rebuild_from_repo.sh" "$F" "$T/rebuilt.wav" > "$OUT/rebuild.txt" 2>&1; rc=$?
  if [ "$rc" = 2 ]; then fail=1; ann error "重建的配乐和仓库里的成品不是逐样本一致"; sum "- 重建：不一致（见 rebuild.txt）"
  elif [ "$rc" != 0 ] || [ ! -f "$T/rebuilt.wav" ]; then fail=1; ann error "重建失败（退出码 $rc）"; sum "- 重建：失败"
  else
    line=$(grep '逐样本对比' "$OUT/rebuild.txt" | tail -1); sum "- 重建：$line"; ann notice "重建：$line"
    src=$(ls "$F"/music/private/source_*.enc 2>/dev/null | head -1); ref=()
    if [ -n "$src" ] && openssl enc -d -aes-256-cbc -pbkdf2 -iter 200000 -salt -pass env:MUSIC_KEY -in "$src" -out "$T/source" 2>/dev/null; then ref=(--ref "$T/source"); fi
    if python3 -I "$M/check_score.py" "$T/rebuilt.wav" "${ref[@]+"${ref[@]}"}" --json "$OUT/check_score_main.json" > "$OUT/check_score_main.txt" 2>&1; then
      sum "- 主配乐 check_score：通过"; ann notice "主配乐 check_score 通过：$(tail -1 "$OUT/check_score_main.txt")"
    else fail=1; sum "- 主配乐 check_score：不通过"; ann error "主配乐 check_score 不通过：$(tail -3 "$OUT/check_score_main.txt" | tr '\n' ' ')"; fi
    ld=$(ffmpeg -hide_banner -nostats -i "$T/rebuilt.wav" -af ebur128=peak=true -f null - 2>&1 | awk '/Summary:/{s=1} s&&/I:/{i=$2} s&&/Peak:/{p=$2} END{print "积分响度 " i " LUFS，真峰值 " p " dBTP"}')
    sum "- 主配乐响度：$ld"; ann notice "主配乐 $ld"
    rm -f "$T/rebuilt.wav" "$T/source"
  fi
else
  sum "- 没有 MUSIC_KEY：跳过主配乐重建（仓库 Settings > Secrets and variables > Actions 添加 MUSIC_KEY 后自动跑）"
  ann warning "没有 MUSIC_KEY，跳过主配乐重建；只跑自测和 CC0 冒烟测试"
fi

# 3. CC0 曲子冒烟测试
cc0=$(ls "$F"/music/cc0/*.mp3 2>/dev/null | head -1)
if [ -n "$cc0" ]; then
  if python3 -I "$M/analyze_track.py" "$cc0" --out "$OUT/cc0_analysis" --png > "$OUT/cc0_analysis.txt" 2>&1 && \
     python3 -I -c 'import json,sys; a=json.load(open(sys.argv[1])); assert a["bpm"] > 0 and len(a["beats"]) > 8 and len(a["bars"]) > 2, a.get("bpm"); print("bpm %.2f，%d 拍，%d 小节" % (a["bpm"], len(a["beats"]), len(a["bars"])))' "$OUT/cc0_analysis/analysis.json" > "$T/a.txt" 2>&1; then
    sum "- CC0 冒烟测试（$(basename "$cc0")）：$(cat "$T/a.txt")"; ann notice "analyze_track 冒烟测试通过：$(cat "$T/a.txt")"
  else fail=1; sum "- CC0 冒烟测试不通过（见 cc0_analysis.txt）"; ann error "analyze_track 冒烟测试不通过：$(tail -2 "$OUT/cc0_analysis.txt" "$T/a.txt" 2>/dev/null | tr '\n' ' ')"; fi
fi

# 4. 备用配乐
bk="$F/music/backup/score.flac"
if [ -f "$bk" ]; then
  if python3 -I "$M/check_score.py" "$bk" --json "$OUT/check_score_backup.json" > "$OUT/check_score_backup.txt" 2>&1; then
    sum "- 备用配乐 check_score：通过"; ann notice "备用配乐 check_score 通过"
  else fail=1; sum "- 备用配乐 check_score：不通过"; ann error "备用配乐 check_score 不通过：$(tail -3 "$OUT/check_score_backup.txt" | tr '\n' ' ')"; fi
fi
find "$OUT" -type f \( -name '*.wav' -o -name '*.mp3' -o -name '*.flac' \) -delete
exit $fail
