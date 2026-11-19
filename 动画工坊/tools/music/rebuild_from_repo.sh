#!/usr/bin/env bash
# 只用仓库里的东西从原曲重建配乐，并和仓库里加密保存的成品逐样本对比（本地和 GitHub Actions 都能跑）。
# 用法：export MUSIC_KEY=...；bash rebuild_from_repo.sh <作品目录F> [输出.wav]
# 没有 MUSIC_KEY：说明一下就以 0 退出（不卡流程）。重建结果和成品不一致：以 2 退出。
set -uo pipefail
F="$(cd "${1:?用法：rebuild_from_repo.sh <作品目录F> [输出.wav]}" && pwd)"; HERE="$(cd "$(dirname "$0")" && pwd)"
OUT="${2:-}"
[ -n "${MUSIC_KEY:-}" ] || { echo "提示：没有 MUSIC_KEY，跳过重建（原曲是加密的）"; exit 0; }
T="$(mktemp -d "${TMPDIR:-/tmp}/rebuild.XXXXXX")"; trap 'rm -rf "$T"' EXIT
PRIV="$F/music/private"
SRC_ENC="$(ls "$PRIV"/source_*.enc 2>/dev/null | head -1)"
[ -n "$SRC_ENC" ] || { echo "提示：$PRIV 下没有加密的原曲，跳过"; exit 0; }
name="$(basename "$SRC_ENC" .enc)"; name="${name#source_}"
d() { openssl enc -d -aes-256-cbc -pbkdf2 -iter 200000 -salt -pass env:MUSIC_KEY -in "$1" -out "$2" 2>/dev/null; }
d "$SRC_ENC" "$T/$name" || { echo "提示：原曲解密失败（密钥不对？），跳过"; exit 0; }
d "$PRIV/score.flac.enc" "$T/score.flac" && python3 -I -c "import soundfile as sf, sys; d, sr = sf.read(sys.argv[1], dtype='int32'); sf.write(sys.argv[2], d, sr, subtype='PCM_24')" "$T/score.flac" "$T/ref.wav"
CMP=(); [ -f "$T/ref.wav" ] && CMP=(--compare "$T/ref.wav")
python3 -I "$HERE/rebuild_score.py" --source "$T/$name" --plan "$F/music/edit_plan.json" --out "${OUT:-$T/rebuilt.wav}" "${CMP[@]+"${CMP[@]}"}"
