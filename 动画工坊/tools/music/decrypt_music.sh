#!/usr/bin/env bash
# 出片前把配乐准备好（CI 和本地共用）。用法：bash decrypt_music.sh <作品目录F>
# 按 F/film.json 的 music：
#   1. main：有 MUSIC_KEY 就把 encrypted 解密（FLAC）并转成 decrypt_to（24 bit WAV），按 private/SHA256SUMS 核对音频逐样本一致
#   2. backup：没有密钥、解密失败或核对不一致，就用备用配乐（CC0）
#   3. none：再没有就无声出片
# 丝滑：永远以 0 退出；stdout 最后一行是 MUSIC=main、MUSIC=backup 或 MUSIC=none。
# 在 GitHub Actions 里还会写进步骤摘要（GITHUB_STEP_SUMMARY）和 warning。密钥只从环境变量读，绝不打印。
set -uo pipefail
F="${1:-.}"
cd "$F" 2>/dev/null || { echo "提示：作品目录 $F 不存在，无声出片"; echo "MUSIC=none"; exit 0; }
F="$(pwd)"
TMP="$(mktemp -d "${TMPDIR:-/tmp}/decrypt_music.XXXXXX")"; trap 'rm -rf "$TMP"' EXIT

note() { echo "$1"; [ -n "${GITHUB_STEP_SUMMARY:-}" ] && echo "- $1" >> "$GITHUB_STEP_SUMMARY"; return 0; }
warn() { echo "提示：$1"; [ -n "${GITHUB_ACTIONS:-}" ] && echo "::warning title=配乐::$1"; [ -n "${GITHUB_STEP_SUMMARY:-}" ] && echo "- 提示：$1" >> "$GITHUB_STEP_SUMMARY"; return 0; }
amd5() { ffmpeg -v error -i "$1" -map 0:a:0 -c:a pcm_s24le -f md5 - 2>/dev/null | sed 's/^MD5=//'; }

# 读 film.json（python3 标准库）
J="$(python3 -I -c '
import json, shlex
try:
    m = json.load(open("film.json")).get("music", {})
except Exception as e:
    m = {}
mn, bk = m.get("main", {}) or {}, m.get("backup", {}) or {}
for k, v in (("MAIN_ENC", mn.get("encrypted", "")), ("MAIN_LABEL", mn.get("label", "主配乐")), ("SECRET", mn.get("secret", "MUSIC_KEY")),
             ("MAIN_TO", mn.get("decrypt_to", "")), ("BK_FILE", bk.get("file", "")), ("BK_LABEL", bk.get("label", "备用配乐")),
             ("BK_TO", bk.get("decrypt_to", mn.get("decrypt_to", "")))):
    print(k + "=" + shlex.quote(str(v)))
' 2>/dev/null)"
eval "$J" 2>/dev/null || true
MAIN_ENC="${MAIN_ENC:-}"; MAIN_TO="${MAIN_TO:-}"; BK_FILE="${BK_FILE:-}"; BK_TO="${BK_TO:-$MAIN_TO}"
MAIN_LABEL="${MAIN_LABEL:-主配乐}"; BK_LABEL="${BK_LABEL:-备用配乐}"; SECRET="${SECRET:-MUSIC_KEY}"
[[ "$SECRET" =~ ^[A-Za-z_][A-Za-z0-9_]*$ ]] || SECRET=MUSIC_KEY
[ -n "$MAIN_TO$BK_TO" ] || { warn "film.json 里没有 music.main.decrypt_to，无声出片"; echo "MUSIC=none"; exit 0; }
rm -f "$MAIN_TO" "$BK_TO"                            # 不留上一次的明文，免得拿错

# to_wav <输入> <输出>：转成 48 kHz 立体声 24 bit WAV；有 python soundfile 时和原文件逐字节相同，否则用 ffmpeg（逐样本相同）
to_wav() {
  mkdir -p "$(dirname "$2")"
  if python3 -I -c "import soundfile as sf, sys; d, sr = sf.read(sys.argv[1], dtype='int32'); sf.write(sys.argv[2], d, sr, subtype='PCM_24')" "$1" "$2" 2>/dev/null; then return 0; fi
  ffmpeg -v error -y -i "$1" -map 0:a:0 -ar 48000 -ac 2 -c:a pcm_s24le "$2"
}

# ---------------------------------------------------------------- 1. 主配乐
why=""
KEYVAL="${!SECRET:-}"
if [ -z "$MAIN_ENC" ] || [ ! -f "$MAIN_ENC" ]; then why="没有加密的主配乐文件 ${MAIN_ENC:-（film.json 没写）}"
elif [ -z "$KEYVAL" ]; then why="没有 $SECRET 密钥（GitHub 仓库 Settings > Secrets and variables > Actions 里添加 $SECRET）"
elif ! MUSIC_KEY="$KEYVAL" openssl enc -d -aes-256-cbc -pbkdf2 -iter 200000 -salt -pass env:MUSIC_KEY -in "$MAIN_ENC" -out "$TMP/main" 2>/dev/null; then
  why="主配乐解密失败（密钥不对？）"
else
  SUMS="$(dirname "$MAIN_ENC")/SHA256SUMS"; base="$(basename "$MAIN_ENC" .enc)"
  want_sha="$(awk -v n="$base" '$1=="sha256" && $3==n {print $2}' "$SUMS" 2>/dev/null)"
  want_md5="$(awk -v n="$base" '$1=="audio_md5_s24" && $3==n {print $2}' "$SUMS" 2>/dev/null)"
  if [ -n "$want_sha" ] && [ "$(sha256sum "$TMP/main" | cut -d' ' -f1)" != "$want_sha" ]; then
    why="主配乐解出来和 SHA256SUMS 记录的不一致（密钥不对或文件损坏）"
  elif ! to_wav "$TMP/main" "$MAIN_TO"; then why="主配乐转 WAV 失败"; rm -f "$MAIN_TO"
  elif [ -n "$want_md5" ] && [ "$(amd5 "$MAIN_TO")" != "$want_md5" ]; then why="主配乐 WAV 和记录的音频不是逐样本一致"; rm -f "$MAIN_TO"
  else
    note "配乐：${MAIN_LABEL}（$MAIN_TO，已核对逐样本一致）"; echo "MUSIC=main"; exit 0
  fi
fi
unset KEYVAL

# ---------------------------------------------------------------- 2. 备用配乐
if [ -n "$BK_FILE" ] && [ -f "$BK_FILE" ] && to_wav "$BK_FILE" "$BK_TO" && [ -s "$BK_TO" ]; then
  warn "$why；改用${BK_LABEL}（$BK_FILE）"
  echo "MUSIC=backup"; exit 0
fi
rm -f "$BK_TO"
# ---------------------------------------------------------------- 3. 无声
warn "$why；也没有备用配乐（${BK_FILE:-film.json 没写}），这次无声出片"
echo "MUSIC=none"; exit 0
