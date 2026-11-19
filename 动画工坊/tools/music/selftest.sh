#!/usr/bin/env bash
# 配乐工具自测：每条检查一个好样本、若干坏样本，逐条跑；decrypt_music.sh 的每条退路也逐条跑。CI 和本地共用。
# 用法：bash selftest.sh [CC0 曲子]   （默认找 作品/*/music/cc0/ 下第一首；找不到就用合成的乐音）
# 不用真密钥：加密测试用一个公开的测试口令。全部通过以 0 退出，有一条不对以 1 退出。
set -uo pipefail
HERE="$(cd "$(dirname "$0")" && pwd)"
SRC="${1:-$(ls "$HERE"/../../作品/*/music/cc0/*.mp3 2>/dev/null | head -1)}"
[ -n "$SRC" ] && [ -f "$SRC" ] || SRC=""                     # 给的文件不存在就用合成乐音
T="$(mktemp -d "${TMPDIR:-/tmp}/music_selftest.XXXXXX")"; trap 'rm -rf "$T"' EXIT
pass=0; fail=0
ok() { echo "  通过  $1"; pass=$((pass + 1)); }
no() { echo "  不对  $1"; fail=$((fail + 1)); }

echo "1. 做样本（${SRC:-合成乐音}）"
python3 -I - "$HERE" "$T" "${SRC:-}" <<'PY'
import sys, numpy as np, soundfile as sf
sys.path.insert(0, sys.argv[1]); import scorelib as L
T, src = sys.argv[2], sys.argv[3]
SR = 48000
if src:
    x = L.decode(src)
    n = len(x); a = max(0, n // 2 - 15 * SR); x = x[a:a + 30 * SR].copy()
else:                                        # 合成：三和弦长音 + 十六分音符琶音 + 一点噪声
    t = np.arange(30 * SR) / SR; x = np.zeros((len(t), 2))
    for f in (220, 277.18, 329.63): x += 0.1 * np.sin(2 * np.pi * f * t)[:, None]
    env = np.exp(-((t % 0.15625) / 0.04)); x += (0.08 * env * np.sin(2 * np.pi * 659.25 * t))[:, None]
    x += 0.002 * np.random.default_rng(1).standard_normal(x.shape)
f = int(0.5 * SR); r = 0.5 - 0.5 * np.cos(np.linspace(0, np.pi, f))
x[:f] *= r[:, None]; x[-f:] *= r[::-1, None]
z, meta = L.master(x, dict(target_lufs=-14.0, ceiling_dbtp=-1.2), None, log=lambda *a: None)
w = lambda name, y, sr=SR: sf.write(f'{T}/{name}.wav', y, sr, subtype='PCM_24')
w('good', z)
w('bad_loud', np.clip(z * 4.0, -1, 1))                                  # 响度、真峰值、削波
g = z.copy(); g[15 * SR:16 * SR] = 0; w('bad_gap', g)                   # 片中掉成无声
c = z.copy(); i = 12 * SR + 777; c[i] += 0.6; c[i + 1] -= 0.6; w('bad_click', np.clip(c, -0.89, 0.89))  # 数字咔哒
w('bad_dc', z * 0.97 + 0.01)                                             # 直流偏移
w('backup', z * 0.5)                                                     # 解密测试用的备用配乐
PY
[ -f "$T/good.wav" ] || { echo "做样本失败"; exit 1; }
ffmpeg -v error -y -i "$T/good.wav" -ar 44100 -c:a pcm_s24le "$T/bad_format.wav"

echo "2. check_score.py：好样本全过，坏样本各自在该挡的那一项上不通过"
REF=(); [ -n "${SRC:-}" ] && REF=(--ref "$SRC")
run() { python3 -I "$HERE/check_score.py" "$T/$1.wav" "${REF[@]+"${REF[@]}"}" --edge 1.0 --json "$T/$1.json" > "$T/$1.txt" 2>&1; }
failed() { python3 -I -c "import json,sys; r=json.load(open(sys.argv[1])); print(' '.join(x['check'] for x in r if not x['ok']))" "$T/$1.json"; }
if run good; then ok "好样本 全部通过"; else no "好样本 应该全过：$(failed good)"; cat "$T/good.txt"; fi
for pair in "bad_format:格式" "bad_loud:响度" "bad_loud:真峰值" "bad_loud:削波" "bad_gap:静音" "bad_click:咔哒" "bad_dc:直流"; do
  s="${pair%%:*}"; c="${pair#*:}"
  [ -f "$T/$s.json" ] || run "$s"
  if [ -z "${SRC:-}" ] && [ "$c" = "咔哒" ]; then echo "  跳过  $s（没有原曲做参照，咔哒检查不运行）"; continue; fi
  if failed "$s" | grep -qw "$c"; then ok "坏样本 $s 在“$c”上被挡住"; else no "坏样本 $s 应该在“$c”上不通过（实际不通过：$(failed "$s")）"; cat "$T/$s.txt"; fi
done

echo "3. decrypt_music.sh：主配乐、各种退路，永远以 0 退出"
FD="$T/film"; mkdir -p "$FD/music/private" "$FD/music/backup"
cat > "$FD/film.json" <<'J'
{"title":"自测","music":{"main":{"label":"主配乐（自测）","encrypted":"music/private/score.flac.enc","secret":"MUSIC_KEY","decrypt_to":"music/score.wav"},
 "backup":{"label":"备用配乐（自测）","file":"music/backup/score.flac","decrypt_to":"music/score.wav"}}}
J
TK="selftest-public-test-passphrase"
ffmpeg -v error -y -i "$T/good.wav" -c:a flac -bitexact -map_metadata -1 "$T/main.flac"
ffmpeg -v error -y -i "$T/backup.wav" -c:a flac -bitexact -map_metadata -1 "$FD/music/backup/score.flac"
MUSIC_KEY="$TK" openssl enc -aes-256-cbc -pbkdf2 -iter 200000 -salt -pass env:MUSIC_KEY -in "$T/main.flac" -out "$FD/music/private/score.flac.enc"
md5s24() { ffmpeg -v error -i "$1" -map 0:a:0 -c:a pcm_s24le -f md5 - | sed 's/^MD5=//'; }
printf 'sha256 %s score.flac\naudio_md5_s24 %s score.flac\n' "$(sha256sum "$T/main.flac" | cut -d' ' -f1)" "$(md5s24 "$T/good.wav")" > "$FD/music/private/SHA256SUMS"
cp "$FD/music/private/SHA256SUMS" "$T/SUMS.ok"; cp "$FD/music/private/score.flac.enc" "$T/enc.ok"
case_() {  # 名字 期望 期望的音频（good/backup/空）
  local name="$1" want="$2" audio="$3" out rc last
  out="$(cd "$T" && bash "$HERE/decrypt_music.sh" "$FD" 2>&1)"; rc=$?; last="$(echo "$out" | tail -1)"
  if [ $rc -ne 0 ]; then no "$name：退出码 $rc，应为 0"; return; fi
  if [ "$last" != "MUSIC=$want" ]; then no "$name：最后一行 $last，应为 MUSIC=$want"; echo "$out"; return; fi
  if [ -n "$audio" ]; then
    if [ "$(md5s24 "$FD/music/score.wav")" = "$(md5s24 "$T/$audio.wav")" ]; then ok "$name -> MUSIC=$want，音频逐样本一致"
    else no "$name：解出的音频和 $audio 不一致"; fi
  elif [ -e "$FD/music/score.wav" ]; then no "$name：无声时不该留下 music/score.wav"
  else ok "$name -> MUSIC=$want，没有留下音频文件"; fi
}
MUSIC_KEY="$TK" case_ "有密钥" main good
unset MUSIC_KEY; case_ "没有密钥" backup backup
MUSIC_KEY="wrong-key" case_ "密钥不对" backup backup
python3 -I -c "import sys; p=sys.argv[1]; b=bytearray(open(p,'rb').read()); b[len(b)//2]^=0xFF; open(p,'wb').write(b)" "$FD/music/private/score.flac.enc"
MUSIC_KEY="$TK" case_ "加密文件损坏" backup backup
cp "$T/enc.ok" "$FD/music/private/score.flac.enc"; sed -i 's/^audio_md5_s24 [0-9a-f]*/audio_md5_s24 00000000000000000000000000000000/' "$FD/music/private/SHA256SUMS"
MUSIC_KEY="$TK" case_ "记录的音频指纹不符" backup backup
cp "$T/SUMS.ok" "$FD/music/private/SHA256SUMS"; rm -f "$FD/music/backup/score.flac"
MUSIC_KEY="" case_ "没有密钥也没有备用" none ""
rm -f "$FD/film.json"; case_ "没有 film.json" none ""

echo "selftest：通过 $pass 条，不对 $fail 条"
[ "$fail" = 0 ]
