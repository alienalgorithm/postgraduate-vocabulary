#!/bin/bash
# finish (render + stamp) the given articles, copy their packages and evidence into the repo, commit and push
S=/tmp/claude-0/-home-user/3d87cc6c-41dd-58c2-802f-d51dc0c78527/scratchpad; R=/home/user/postgraduate-vocabulary/文件包
cd $S && python3 pkgtools/batch_b.py "$@" 2>&1 | grep -v NOTE
cd /home/user/postgraduate-vocabulary
for n in "$@"; do P=$(ls -d $S/pkg/$n/pack/*/); t=$(basename "$P"); [ $(ls "$P" | wc -l) -eq 7 ] || { echo "$n incomplete"; continue; }
  mkdir -p "$R/$t/核验/初稿"; cp "$P"* "$R/$t/"
  for f in sent words_a words_b corrections_sent corrections_words_a corrections_words_b final_sent final_words; do [ -f $S/pkg/$n/content/$f.json ] && cp $S/pkg/$n/content/$f.json "$R/$t/核验/"; done
  cp $S/pkg/$n/content/draft/*.json "$R/$t/核验/初稿/" 2>/dev/null; rm -rf "$R/_未完成的精讲与单词稿/$n"; done
git add --sparse -A 文件包 && git commit -q -m "文件包：$* 精讲与单词精解册完成（写稿、独立审校、程序核对），7 样齐全

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_018Kg61y5YeZxoNzSXSuyt8u" && for i in 1 2 3 4; do git -c push.negotiate=true push origin claude/article-packages-20261116 2>&1 | tail -1 && break || sleep $((2**i)); done
