#!/bin/bash
# check a written article and keep its draft before review
S=/tmp/claude-0/-home-user/3d87cc6c-41dd-58c2-802f-d51dc0c78527/scratchpad
for n in "$@"; do r=$(python3 $S/pkgtools/check_content.py $n all | grep -v '^NOTE' | tail -1); mkdir -p $S/pkg/$n/content/draft; cp -n $S/pkg/$n/content/{sent,words_a,words_b}.json $S/pkg/$n/content/draft/ 2>/dev/null; echo "$n $r"; done
