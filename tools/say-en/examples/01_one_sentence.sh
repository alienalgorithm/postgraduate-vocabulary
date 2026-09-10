#!/bin/bash
# 最简单的用法：念一句话
cd "$(dirname "$0")/.."
python say.py "The whale sang the same song as all the others." --out examples/out
