#!/bin/bash
# 整篇文章，四音色，带逐词时间轴
cd "$(dirname "$0")/.."
python say.py --file examples/passage.txt --all-voices --timeline --out examples/out
