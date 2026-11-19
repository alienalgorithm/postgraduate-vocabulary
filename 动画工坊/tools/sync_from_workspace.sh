#!/usr/bin/env bash
# 把动画工作目录 A 的最新状态同步进仓库里的作品目录 F（幂等，可反复跑）。
# 用法：bash 动画工坊/tools/sync_from_workspace.sh <工作目录A> <作品目录F>
#
# 做的事：
#   1. 镜像 engine/ scenes/ story/ assets/ fonts/ scenes_v1/（A 里删了的，F 里也删），
#      排除 node_modules、stills、*.mp4、.render-*、__pycache__ 和所有音频文件；
#      fonts/ 里 F 自带的许可证（OFL-*.txt）保留。
#   2. 复制 BRIEF.md；out/ 只取小文件（*.md、cover*.png、*.json）。
#   3. 生成 F/package.json：依赖固定为 A 实际装的版本，再加 playwright；
#      依赖变了才重新生成 package-lock.json（保证 CI 里 npm ci 可用）。
#   4. 跑 engine_patches/apply.sh，重新套用工坊对引擎的小改动；再跑 clean_words.py，把内部规则文件和词表里的
#      禁用字样改写掉（说明文字换成“清单见 BANNED”，程序里换成 \u 转义，行为不变）。
#   5. 若有 tools/music/package_music.sh，就调用它处理配乐（加密进仓库）；没有就提示跳过。
# 不碰 F 里的 film.json、music/、node_modules/。只用 tar、node、python3，不依赖 rsync。
# 还在做的场景不进仓库（半成品不上线）：SKIP_SCENES=s08,s09 bash ... 同步时不带这些场景文件和 assets/<场景>/；做完再同步一次就带上。
set -euo pipefail

[ $# -eq 2 ] || { echo "用法：bash $0 <工作目录A> <作品目录F>" >&2; exit 2; }
[ -d "$1/engine" ] || { echo "错误：$1 下没有 engine/，不是动画工作目录" >&2; exit 2; }
A=$(cd "$1" && pwd)
mkdir -p "$2"
F=$(cd "$2" && pwd)
K=$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)
case "$F/" in "$A"/*) echo "错误：作品目录不能在工作目录里面" >&2; exit 2;; esac

EXC=(--exclude=node_modules --exclude=stills --exclude='*.mp4' --exclude='.render-*' --exclude=__pycache__
     --exclude='*.wav' --exclude='*.mp3' --exclude='*.flac' --exclude='*.m4a' --exclude='*.ogg' --exclude='*.aac')
TMP="$F/.sync-tmp"

# mirror <子目录> [保留的文件模式...]：把 A/<子目录> 原样换到 F/<子目录>
mirror() {
  local d=$1; shift
  if [ ! -d "$A/$d" ]; then echo "  跳过 $d/（A 里没有）"; return; fi
  rm -rf "$TMP"; mkdir -p "$TMP"
  tar -C "$A" "${EXC[@]}" -cf - "$d" | tar -C "$TMP" -xf -
  local pat f
  for pat in "$@"; do
    for f in "$F/$d"/$pat; do [ -f "$f" ] && [ ! -e "$TMP/$d/${f##*/}" ] && cp -p "$f" "$TMP/$d/"; done
  done
  rm -rf "${F:?}/$d"; mv "$TMP/$d" "$F/$d"; rm -rf "$TMP"
  echo "  $d/  $(find "$F/$d" -type f | wc -l) 个文件"
}

echo "同步 $A -> $F"
for d in engine scenes story assets scenes_v1; do mirror "$d"; done
SKIP_SCENES=${SKIP_SCENES:-}
for s in ${SKIP_SCENES//,/ }; do
  [[ "$s" =~ ^[A-Za-z0-9_-]+$ ]] || continue
  [ -f "$F/scenes/$s.js" ] && rm -f "$F/scenes/$s.js" && echo "  scenes/$s.js 还在做，这次不同步（SKIP_SCENES）"
  [ -d "$F/assets/$s" ] && rm -rf "${F:?}/assets/$s" && echo "  assets/$s/ 还在做，这次不同步（SKIP_SCENES）"
done
mirror fonts 'OFL-*.txt' 'LICENSE*'
if [ -f "$A/BRIEF.md" ]; then cp -p "$A/BRIEF.md" "$F/BRIEF.md"; echo "  BRIEF.md"; fi

# out/：只要小文件
rm -rf "${F:?}/out"
if [ -d "$A/out" ]; then
  n=0
  while IFS= read -r -d '' f; do
    mkdir -p "$F/$(dirname "$f")"; cp -p "$A/$f" "$F/$f"; n=$((n + 1))
  done < <(cd "$A" && find out -type f \( -name '*.md' -o -name 'cover*.png' -o -name '*.json' \) -size -5M -print0)
  echo "  out/  $n 个小文件"
fi

# package.json：固定版本 + playwright
PW_VERSION=$(cd "$A/engine" && node -p "require(require.resolve('playwright/package.json',{paths:[process.cwd()]})).version" 2>/dev/null || echo 1.63.0)
node - "$A" "$F" "$PW_VERSION" <<'EOF'
const fs = require('fs'), path = require('path');
const [A, F, PW] = process.argv.slice(2);
const src = JSON.parse(fs.readFileSync(path.join(A, 'package.json'), 'utf8'));
let name = 'film';
try { name = JSON.parse(fs.readFileSync(path.join(F, 'film.json'), 'utf8')).release.asset_basename || name; } catch (e) {}
const deps = {};
for (const [k, v] of Object.entries(src.dependencies || {})) {
  let ver = String(v).replace(/^[\^~=]/, '');
  try { ver = JSON.parse(fs.readFileSync(path.join(A, 'node_modules', k, 'package.json'), 'utf8')).version; } catch (e) {}
  deps[k] = ver;
}
deps.playwright = PW;
const sorted = Object.fromEntries(Object.keys(deps).sort().map(k => [k, deps[k]]));
const out = {
  name, version: '1.0.0', private: true,
  description: '动画工坊作品：引擎 engine/，场景 scenes/，分镜 story/storyboard.json',
  scripts: { still: 'node engine/still.js', render: 'node engine/render.js', test: 'node engine/test.js' },
  dependencies: sorted
};
const file = path.join(F, 'package.json'), text = JSON.stringify(out, null, 2) + '\n';
if (!fs.existsSync(file) || fs.readFileSync(file, 'utf8') !== text) fs.writeFileSync(file, text);
console.log('  package.json  ' + Object.entries(sorted).map(([k, v]) => k + '@' + v).join(' '));
EOF

lock_ok=$(node -e '
const fs=require("fs");try{const p=JSON.parse(fs.readFileSync(process.argv[1]+"/package.json")),l=JSON.parse(fs.readFileSync(process.argv[1]+"/package-lock.json"));
const a=JSON.stringify(p.dependencies),b=JSON.stringify(l.packages[""].dependencies);console.log(a===b&&l.name===p.name?"yes":"no")}catch(e){console.log("no")}' "$F")
if [ "$lock_ok" = yes ]; then
  echo "  package-lock.json  已是最新"
elif (cd "$F" && npm install --package-lock-only --ignore-scripts --no-audit --no-fund >/dev/null 2>&1); then
  echo "  package-lock.json  已重新生成"
else
  echo "  提醒：package-lock.json 没生成成功（多半是连不上 npm 源），联网后再跑一次本脚本" >&2
fi

bash "$K/tools/engine_patches/apply.sh" "$F"
python3 "$K/tools/clean_words.py" "$F"

if [ -f "$K/tools/music/package_music.sh" ]; then
  bash "$K/tools/music/package_music.sh" "$A" "$F"
else
  echo "  配乐：没有 tools/music/package_music.sh，跳过"
fi
echo "同步完成。下一步：cd \"$F\" && npm ci && node engine/still.js --scale 1 --outdir /tmp/stills 10"
