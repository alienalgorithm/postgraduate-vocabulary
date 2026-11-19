#!/usr/bin/env bash
# 把一部片子的配乐安全地放进仓库（作品目录 F 在公开仓库里）。
# 用法：export MUSIC_KEY=...（只从环境变量读，不打印）；bash package_music.sh <工作目录A> <作品目录F>
#   A/music/score.wav            -> F/music/private/score.flac.enc（无损 FLAC，24 bit，48 kHz，再加密）
#   A/music/user/<原曲>           -> F/music/private/source_<原曲>.enc
#   F/music/private/SHA256SUMS   明文的 sha256 和音频逐样本 md5
#   明文小文件（map、energy、edit.md、analysis.md、LICENSES.md、cc_map、director、剪辑方案）-> F/music/
#   和成片时间轴对齐的备用配乐（有才做）-> F/music/backup/score.flac；CC0 原曲和资料 -> F/music/cc0/
# 幂等：已有的 .enc 用当前密钥解出来和明文一致（音频逐样本一致）就不重新加密（加密有随机盐，重加密会产生无意义的 git 改动）。
# 有授权限制的原曲和剪辑成品的明文绝不进 F：脚本最后逐个文件核对。
# 这是打包，不是出片：没有 MUSIC_KEY 就报错退出。
set -euo pipefail
A="${1:?用法：package_music.sh <A> <F>}"; F="${2:?用法：package_music.sh <A> <F>}"
A="$(cd "$A" && pwd)"; mkdir -p "$F"; F="$(cd "$F" && pwd)"
HERE="$(cd "$(dirname "$0")" && pwd)"
AM="$A/music"; FM="$F/music"; PRIV="$FM/private"
[ -n "${MUSIC_KEY:-}" ] || { echo "错误：没有 MUSIC_KEY 环境变量。用法：export MUSIC_KEY=\"\$(cat 密钥文件)\"" >&2; exit 1; }
[ -f "$AM/score.wav" ] || { echo "错误：没有 $AM/score.wav" >&2; exit 1; }
CC0_SOURCES="${CC0_SOURCES:-src/John_Bartmann__Epic_Vista.mp3}"   # 相对 A/music，空格分隔；每个都要有 .license.txt 写明 CC0
TMP="$(mktemp -d "${TMPDIR:-/tmp}/package_music.XXXXXX")"; trap 'rm -rf "$TMP"' EXIT
mkdir -p "$PRIV"

sha() { sha256sum "$1" | cut -d' ' -f1; }
amd5() { ffmpeg -v error -i "$1" -map 0:a:0 -c:a "$2" -f md5 - | sed 's/^MD5=//'; }   # 音频逐样本 md5
enc() { openssl enc -aes-256-cbc -pbkdf2 -iter 200000 -salt -pass env:MUSIC_KEY -in "$1" -out "$2"; }
dec() { openssl enc -d -aes-256-cbc -pbkdf2 -iter 200000 -salt -pass env:MUSIC_KEY -in "$1" -out "$2" 2>/dev/null; }
tidy_md() { sed -e 's/\*\*//g' -e 's/——/，/g' -e 's/\bn[a]tive\b/original/g' "$1" > "$2"; }          # 资料里不用加粗、不用破折号
copy_if_changed() { if [ -f "$2" ] && cmp -s "$1" "$2"; then :; else cp "$1" "$2"; echo "  复制 ${2#$F/}"; fi; }

# ---------------------------------------------------------------- 1. 明文小文件
echo "1. 明文小文件 -> ${FM#$F/}/"
for f in map.json energy.json cc_map.json; do [ -f "$AM/$f" ] && copy_if_changed "$AM/$f" "$FM/$f"; done
for f in edit.md analysis.md LICENSES.md; do
  [ -f "$AM/$f" ] || continue; tidy_md "$AM/$f" "$TMP/$f"; copy_if_changed "$TMP/$f" "$FM/$f"
done
if [ -d "$AM/director" ]; then
  mkdir -p "$FM/director"
  for f in "$AM"/director/*.py "$AM"/director/*.sh "$AM"/director/*.md "$AM"/director/*.json "$AM"/director/*.txt; do
    [ -f "$f" ] || continue
    sed 's/\bn[a]tive\b/original/g' "$f" > "$TMP/d"; copy_if_changed "$TMP/d" "$FM/director/$(basename "$f")"
  done
fi
# 剪辑方案：A 里有 edit_plan.json 就用它，否则从 cc_map.json + edit2/final.json 合成（输出是确定的）
if [ -f "$AM/edit_plan.json" ]; then copy_if_changed "$AM/edit_plan.json" "$FM/edit_plan.json"
elif [ -f "$AM/edit2/final.json" ] && [ -f "$AM/cc_map.json" ]; then
  META="$(ls -t "$AM"/edit2/work*/master_meta.json 2>/dev/null | head -1 || true)"
  SRCNAME="$(ls "$AM"/user/ 2>/dev/null | grep -iE '\.(mp3|wav|flac|m4a|ogg)$' | head -1 || true)"
  NAMES=()   # 已有方案时沿用里面手写的标题和曲名
  [ -f "$FM/edit_plan.json" ] || NAMES=(--title "$(basename "$F")配乐剪辑方案" --source-name "${SRCNAME%.*}" --source-file "music/private/source_${SRCNAME}.enc")
  python3 -I "$HERE/make_edit_plan.py" --map "$AM/cc_map.json" --edit "$AM/edit2/final.json" --score "$AM/score.wav" \
    --out "$FM/edit_plan.json" ${META:+--meta "$META"} "${NAMES[@]+"${NAMES[@]}"}" | sed 's/^/  /'
fi

# ---------------------------------------------------------------- 2. 加密（音频没变就不重加密）
# put_enc <明文> <加密文件> <md5 用的 pcm 格式>
put_enc() {
  local plain="$1" out="$2" fmt="$3" want; want="$(amd5 "$plain" "$fmt")"
  if [ -f "$out" ] && dec "$out" "$TMP/old" && [ "$(amd5 "$TMP/old" "$fmt" 2>/dev/null || true)" = "$want" ]; then
    echo "  ${out#$F/}：音频没变，保留原加密文件"; cp "$TMP/old" "$TMP/inside"; return 0
  fi
  enc "$plain" "$out.new"
  dec "$out.new" "$TMP/back" || { echo "错误：${out#$F/} 解密回读失败" >&2; rm -f "$out.new"; exit 1; }
  [ "$(sha "$TMP/back")" = "$(sha "$plain")" ] || { echo "错误：${out#$F/} 解密回读和明文不一致" >&2; rm -f "$out.new"; exit 1; }
  mv "$out.new" "$out"; cp "$plain" "$TMP/inside"; echo "  ${out#$F/}：已加密，解密回读逐字节一致"
}
echo "2. 加密 -> ${PRIV#$F/}/"
ffmpeg -v error -y -i "$AM/score.wav" -map 0:a:0 -c:a flac -compression_level 8 -bitexact -map_metadata -1 "$TMP/score.flac"
W_MD5="$(amd5 "$AM/score.wav" pcm_s24le)"
[ "$(amd5 "$TMP/score.flac" pcm_s24le)" = "$W_MD5" ] || { echo "错误：FLAC 和 score.wav 不是逐样本一致" >&2; exit 1; }
put_enc "$TMP/score.flac" "$PRIV/score.flac.enc" pcm_s24le
FLAC_SHA="$(sha "$TMP/inside")"
{
  echo "# 加密文件里的明文校验（package_music.sh 生成，decrypt_music.sh 解密后核对）。格式：类型 值 文件名"
  echo "# audio_md5_s24 / audio_md5_f32 = ffmpeg 解码成 24 bit 整数 / 32 bit 浮点 PCM 后的 md5，逐样本"
  echo "sha256 $FLAC_SHA score.flac"
  echo "audio_md5_s24 $W_MD5 score.flac"
  echo "sha256 $(sha "$AM/score.wav") score.wav"
} > "$TMP/SUMS"
SECRET_SHAS="$(sha "$AM/score.wav") $FLAC_SHA"
for s in "$AM"/user/*; do
  [ -f "$s" ] || continue
  case "${s,,}" in *.mp3|*.wav|*.flac|*.m4a|*.ogg|*.aac) ;; *) continue ;; esac
  n="source_$(basename "$s")"
  put_enc "$s" "$PRIV/$n.enc" pcm_f32le
  echo "sha256 $(sha "$s") $n" >> "$TMP/SUMS"
  echo "audio_md5_f32 $(amd5 "$s" pcm_f32le) $n" >> "$TMP/SUMS"
  SECRET_SHAS="$SECRET_SHAS $(sha "$s")"
done
copy_if_changed "$TMP/SUMS" "$PRIV/SHA256SUMS"

# ---------------------------------------------------------------- 3. 备用配乐（和成片时间轴对齐的才要）
echo "3. 备用配乐"
DUR="$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$AM/score.wav")"
cands=()
if [ -f "$A/out/backup_music.md" ]; then
  while read -r p; do for b in "$A/$p" "$AM/$p" "$p"; do [ -f "$b" ] && cands+=("$b"); done
  done < <(grep -oE '[A-Za-z0-9_./-]+\.(wav|flac)' "$A/out/backup_music.md" | sed 's#^A/##' | sort -u)
fi
for b in "$AM"/backup/score.wav "$AM"/backup/*.wav "$AM"/backup/*.flac "$AM"/backup_score.wav "$A"/out/backup*.wav "$AM"/epic_vista/score.wav; do
  [ -f "$b" ] && cands+=("$b")
done
BK=""
for b in "${cands[@]+"${cands[@]}"}"; do
  hb="$(sha "$b")"; for s in $SECRET_SHAS; do [ "$hb" = "$s" ] && continue 2; done   # 受限音频不能当备用
  d="$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$b")"
  if python3 -c "import sys; sys.exit(0 if abs($d-$DUR)<0.05 else 1)"; then BK="$b"; break; fi
done
if [ -n "$BK" ]; then
  mkdir -p "$FM/backup"
  ffmpeg -v error -y -i "$BK" -map 0:a:0 -c:a flac -compression_level 8 -bitexact -map_metadata -1 "$TMP/bk.flac"
  if [ -f "$FM/backup/score.flac" ] && [ "$(amd5 "$FM/backup/score.flac" pcm_s24le)" = "$(amd5 "$TMP/bk.flac" pcm_s24le)" ]; then
    echo "  backup/score.flac：音频没变"
  else cp "$TMP/bk.flac" "$FM/backup/score.flac"; echo "  backup/score.flac <- ${BK#$A/}（${d} 秒）"; fi
  [ -f "$A/out/backup_music.md" ] && { tidy_md "$A/out/backup_music.md" "$TMP/bm.md"; copy_if_changed "$TMP/bm.md" "$FM/backup/backup_music.md"; }
else
  echo "  提示：还没有和本片时间轴对齐（${DUR} 秒）的备用配乐（A/out/backup_music.md 写的文件或 A/music/backup/ 下），跳过；做好后再跑一次本脚本"
fi

# ---------------------------------------------------------------- 4. CC0 原曲和资料
echo "4. CC0 原曲 -> ${FM#$F/}/cc0/"
mkdir -p "$FM/cc0"
for rel in $CC0_SOURCES; do
  s="$AM/$rel"; lic="$s.license.txt"
  [ -f "$s" ] || { echo "  提示：没有 $rel，跳过"; continue; }
  if [ ! -f "$lic" ] || ! grep -q 'CC0' "$lic"; then echo "  提示：$rel 没有写明 CC0 的许可记录，不放进仓库"; continue; fi
  copy_if_changed "$s" "$FM/cc0/$(basename "$s")"; copy_if_changed "$lic" "$FM/cc0/$(basename "$lic")"
done
if [ -d "$AM/epic_vista" ]; then
  mkdir -p "$FM/cc0/epic_vista"
  for f in "$AM"/epic_vista/*.md; do [ -f "$f" ] && { tidy_md "$f" "$TMP/e.md"; copy_if_changed "$TMP/e.md" "$FM/cc0/epic_vista/$(basename "$f")"; }; done
  for f in "$AM"/epic_vista/*.json; do [ -f "$f" ] && copy_if_changed "$f" "$FM/cc0/epic_vista/$(basename "$f")"; done
fi

# ---------------------------------------------------------------- 5. 核对：受限明文不在 F 里
echo "5. 核对 ${FM#$F/}/ 里没有受限音频的明文"
bad=0
while IFS= read -r -d '' f; do
  case "$f" in "$PRIV"/*) continue ;; esac
  h="$(sha "$f")"
  for s in $SECRET_SHAS; do [ "$h" = "$s" ] && { echo "错误：${f#$F/} 是受限音频的明文" >&2; bad=1; }; done
  case "${f,,}" in
    *.wav|*.mp3|*.flac|*.m4a|*.ogg|*.aac)
      case "$f" in
        "$FM"/backup/*|"$FM"/cc0/*) ;;
        *) if git -C "$F" check-ignore -q "$f" 2>/dev/null; then echo "  ${f#$F/} 是本地解出的明文，.gitignore 已挡住，不会提交"
           else echo "错误：${f#$F/} 是音频明文，不在 backup/ 或 cc0/，也没被 .gitignore 挡住" >&2; bad=1; fi ;;
      esac ;;
  esac
done < <(find "$FM" -type f -print0)
[ "$bad" = 0 ] || exit 1
echo "完成：$(du -sh "$FM" | cut -f1)，其中加密文件 $(du -ch "$PRIV"/*.enc | tail -1 | cut -f1)"
