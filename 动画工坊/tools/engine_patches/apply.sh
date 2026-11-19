#!/usr/bin/env bash
# 给作品目录里的引擎套上工坊的小改动（幂等：已套过的跳过）。不改任何渲染逻辑。
# 用法：bash 动画工坊/tools/engine_patches/apply.sh <作品目录F>
# 每处改动的说明见同目录 README.md。sync_from_workspace.sh 和 new_film.sh 会自动调用。
set -euo pipefail
[ $# -eq 1 ] && [ -d "$1/engine" ] || { echo "用法：bash $0 <作品目录F>（里面要有 engine/）" >&2; exit 2; }
python3 - "$1/engine" <<'EOF'
import re, sys, pathlib
eng = pathlib.Path(sys.argv[1])
ok = skip = miss = 0

def patch(fname, name, done_marker, pattern, repl, count=1):
    """pattern 是正则；文件里已有 done_marker 就算已套过。"""
    global ok, skip, miss
    p = eng / fname
    if not p.exists():
        print(f'  补丁 {name}：没有 {fname}，跳过'); return
    s = p.read_text(encoding='utf-8')
    if done_marker in s:
        skip += 1; return
    s2, n = re.subn(pattern, repl, s, count=count)
    if n == 0:
        miss += 1; print(f'  提醒：补丁 {name} 没套上（{fname} 的写法变了），请对照 engine_patches/README.md 手动改'); return
    p.write_text(s2, encoding='utf-8'); ok += 1

# 1. asset.js：素材来源目录不再写死本机绝对路径
patch('asset.js', 'ILLUS_DIR', "path.join(L.ROOT, 'sources', 'illus')",
      r"const ILLUS_DIR = process\.env\.ILLUS_DIR \|\| '[^']*';",
      "const ILLUS_DIR = process.env.ILLUS_DIR || path.join(L.ROOT, 'sources', 'illus');")
patch('asset.js', 'PKG_DIR', "path.join(L.ROOT, 'sources', 'pkg')",
      r"const PKG_DIR = process\.env\.PKG_DIR \|\| '[^']*';",
      "const PKG_DIR = process.env.PKG_DIR || path.join(L.ROOT, 'sources', 'pkg');")
# 2. asset.js：找不到素材时说清楚怎么办
patch('asset.js', 'illus 报错', "set ILLUS_DIR",
      r"throw new Error\('not found: ' \+ src\);",
      "throw new Error('not found: ' + src + ' (set ILLUS_DIR to the folder with NN.jpg, or put the files in <film>/sources/illus)');")
patch('asset.js', 'video 报错', "set PKG_DIR",
      r"throw new Error\('video not found: ' \+ p\);",
      "throw new Error('video not found: ' + p + ' (set PKG_DIR to the folder with NN/video.mp4, or put them in <film>/sources/pkg)');")
patch('asset.js', '说明注释', "default <film>/sources/",
      r"// Paths of the sources can be overridden with ILLUS_DIR and PKG_DIR\.",
      "// Sources: ILLUS_DIR (default <film>/sources/illus/NN.jpg) and PKG_DIR (default <film>/sources/pkg/NN/video.mp4).")
# 3. README.md：A 的本机绝对路径换成“作品目录”
patch('README.md', 'README 路径', "`A` = 作品目录",
      r"\(`A` = `/[^`]*`\.\)",
      "(`A` = 作品目录：动画工坊/作品/<片名>，里面有 engine/ scenes/ story/ fonts/ assets/。)")

left = [str(f.relative_to(eng)) for f in eng.rglob('*') if f.is_file() and f.suffix in ('.js', '.md', '.html', '.css')
        and re.search(r'/tmp/claude|/home/user|/root/', f.read_text(encoding='utf-8', errors='ignore'))]
print(f'  引擎补丁：新套 {ok}，已套过 {skip}，没套上 {miss}' + (f'；仍含本机绝对路径：{", ".join(left)}' if left else ''))
EOF
