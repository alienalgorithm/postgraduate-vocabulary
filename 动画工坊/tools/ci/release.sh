#!/usr/bin/env bash
# 把 assemble.py 的输出发成 GitHub Release（只在 Actions 里用，靠 GITHUB_TOKEN；本机的 gh 令牌无效，不要在本机跑）。
# 用法：bash release.sh <assemble 输出目录> <tag_prefix>
# 标签 <tag_prefix>-r<run_number>；附件只用 ASCII 文件名（*_4k.mp4、*_1080p.mp4、SHA256SUMS.txt）；
# 标题和说明来自 release_title.txt、release_notes.md（中文，配乐是备用或无时标题里注明）。
# 不设为 Latest，免得把仓库首页的资料 Release 挤下去。同一次运行重跑（Re-run）时标签已在，就覆盖上传附件。
set -euo pipefail
OUT=$1; PREFIX=$2
TAG="${PREFIX}-r${GITHUB_RUN_NUMBER:?只在 GitHub Actions 里用}"
TITLE=$(head -n1 "$OUT/release_title.txt")
mapfile -t FILES < <(cd "$OUT" && ls -1 *.mp4 SHA256SUMS.txt | sed "s|^|$OUT/|")
if gh release view "$TAG" --repo "$GITHUB_REPOSITORY" >/dev/null 2>&1; then
  gh release upload "$TAG" "${FILES[@]}" --repo "$GITHUB_REPOSITORY" --clobber
  gh release edit "$TAG" --repo "$GITHUB_REPOSITORY" --title "$TITLE" --notes-file "$OUT/release_notes.md"
else
  gh release create "$TAG" "${FILES[@]}" --repo "$GITHUB_REPOSITORY" --target "$GITHUB_SHA" \
    --title "$TITLE" --notes-file "$OUT/release_notes.md" --latest=false
fi
URL="https://github.com/$GITHUB_REPOSITORY/releases/tag/$TAG"
echo "::notice title=Release::$TITLE  $URL"
echo "- Release：[$TITLE]($URL)" >> "${GITHUB_STEP_SUMMARY:-/dev/null}"
