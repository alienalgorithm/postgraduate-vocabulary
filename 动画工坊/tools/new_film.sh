#!/usr/bin/env bash
# 新开一部动画：从现成作品复制引擎、字体、依赖清单，放一个能直接出图的两场小样。
# 用法：bash 动画工坊/tools/new_film.sh <新片名> [英文短名]
#   英文短名只用小写字母、数字、连字符，用于 Release 标签和文件名；不给就用 film-年月日。
#   模板作品默认是 作品/如何真正学好英语，可用环境变量 TEMPLATE=<作品目录> 换。
set -euo pipefail
[ $# -ge 1 ] && [ -n "$1" ] || { echo "用法：bash $0 <新片名> [英文短名]" >&2; exit 2; }
NAME=$1
SLUG=${2:-film-$(date +%Y%m%d)}
[[ $SLUG =~ ^[a-z0-9][a-z0-9-]*$ ]] || { echo "错误：英文短名只能用小写字母、数字、连字符：$SLUG" >&2; exit 2; }
case "$NAME" in */*|.*|*\"*|*\\*) echo "错误：片名里不能有 / \" \\，也不能以 . 开头" >&2; exit 2;; esac
K=$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)
TPL=${TEMPLATE:-$K/作品/如何真正学好英语}
NEW=$K/作品/$NAME
[ -d "$TPL/engine" ] || { echo "错误：模板作品 $TPL 里没有 engine/" >&2; exit 2; }
[ ! -e "$NEW" ] || { echo "错误：$NEW 已存在" >&2; exit 2; }

mkdir -p "$NEW"/{story,scenes,assets,music/private,music/backup}
cp -a "$TPL/engine" "$TPL/fonts" "$NEW/"
cp -p "$TPL/package.json" "$TPL/package-lock.json" "$NEW/"
rm -rf "$NEW/engine/__pycache__"

# 依赖清单改成新片的名字（package.json 和 lock 要一致，npm ci 才认）
node - "$NEW" "$SLUG" <<'EOF'
const fs = require('fs'), [dir, slug] = process.argv.slice(2);
for (const f of ['package.json', 'package-lock.json']) {
  const p = dir + '/' + f, j = JSON.parse(fs.readFileSync(p, 'utf8'));
  j.name = slug; if (j.packages && j.packages['']) j.packages[''].name = slug;
  fs.writeFileSync(p, JSON.stringify(j, null, 2) + '\n');
}
EOF

# 作品清单
node - "$NEW" "$NAME" "$SLUG" <<'EOF'
const fs = require('fs'), [dir, name, slug] = process.argv.slice(2);
const film = {
  title: name, fps: 60, scale: 2, storyboard: 'story/storyboard.json',
  music: {
    main: { label: '主配乐（加密存放）', encrypted: 'music/private/score.flac.enc', secret: 'MUSIC_KEY', decrypt_to: 'music/score.wav' },
    backup: { label: '备用配乐（CC0）', file: 'music/backup/score.flac', decrypt_to: 'music/score.wav' }
  },
  release: { tag_prefix: 'anim-' + slug, asset_basename: slug, display_name: name }
};
fs.writeFileSync(dir + '/film.json', JSON.stringify(film, null, 2) + '\n');
EOF

# 最小分镜：两场各 4 秒，120 bpm（每小节 2 秒），能量曲线先用引擎自带的样例
cat > "$NEW/story/storyboard.json" <<EOF
{
  "title": "$NAME",
  "fps": 60, "width": 1920, "height": 1080,
  "palette": { "bg": "#07080d", "bg2": "#141a2e", "ink": "#f5efe4", "dim": "#9aa3b8", "accent": "#ffb547", "accent2": "#ff6a3d", "cool": "#5ec8ff" },
  "music": { "file": "music/score.wav", "energy": "engine/test/energy_demo.json", "bpm": 120, "beat_offset": 0, "bar": 2.0,
             "sections": [{ "name": "intro", "start": 0, "end": 8 }], "climax": 4.0 },
  "scenes": [
    { "id": "s01", "start": 0, "duration": 4, "purpose": "开场标题",
      "texts": [{ "in": 0.2, "out": 3.4, "text": "第一场", "role": "headline" }] },
    { "id": "s02", "start": 4, "duration": 4, "purpose": "第二场，墨迹转场进入", "transition": { "type": "ink", "duration": 0.6, "rim": "#ffb547" },
      "texts": [{ "in": 0.3, "out": 3.6, "text": "第二场", "role": "headline" }, { "in": 0.8, "out": 3.6, "text": "a small start", "role": "en" }] }
  ],
  "total": 8
}
EOF

cat > "$NEW/scenes/s01.js" <<'EOF'
// 第一场：标题逐字升起，结尾淡出。写法见 engine/README.md 第 2 节。
registerScene('s01', function build(tl, root, ctx) {
  var u = ctx.util;
  var h = u.text(root, '第一场', 'headline', { y: 520 });
  var st = u.split(h, { type: 'chars', mask: 'chars' });
  tl.from(st.chars, { yPercent: 110, duration: 0.9, ease: 'expo.out', stagger: 0.08 }, 0.2);
  tl.to(h, { opacity: 0, duration: 0.5 }, ctx.duration - 0.6);
});
EOF
cat > "$NEW/scenes/s02.js" <<'EOF'
// 第二场：中文标题加一行英文，跟着节拍出现。
registerScene('s02', function build(tl, root, ctx) {
  var u = ctx.util;
  var h = u.text(root, '第二场', 'headline', { y: 470 });
  var en = u.text(root, 'a small start', 'en', { y: 640 });
  tl.from(h, { opacity: 0, y: '+=40', duration: 0.8, ease: 'power3.out' }, 0.3);
  tl.from(en, { opacity: 0, duration: 0.8 }, 0.8);
});
EOF

bash "$K/tools/engine_patches/apply.sh" "$NEW" >/dev/null
echo "新片目录：$NEW"
cat <<EOF
下一步：
  1. cd "$NEW" && npm ci
  2. node engine/still.js --scale 1 --outdir /tmp/stills 1 5     # 出两张 1080p 小样，带文字检查
  3. 写 story/storyboard.json 和 scenes/sNN.js（接口见 engine/README.md）
  4. 配乐：主配乐加密成 music/private/score.flac.enc（见 tools/music），或放 CC0 的 music/backup/score.flac
  5. git add --sparse 动画工坊/作品/$NAME，推送后由 GitHub Actions 出片
EOF
