#!/bin/bash
# 检查合成出来的音频合不合格
cd "$(dirname "$0")/.."
python say.py --check examples/out
