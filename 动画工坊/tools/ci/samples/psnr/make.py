#!/usr/bin/env python3
"""重做 PSNR 样本（一般不用跑，PNG 已提交）：python3 make.py <作品目录/fonts>
ref.png   参考图：深色底、卡片、evidence、n. 证据、先记住这个词。
good.png  机器差异：整片蓝通道 +1，再随机 0.05% 的像素 ±2（模拟换 CPU 后最低位不同）；必须放行
bad.png   错一个字：“证据”变成“证剧”（模拟字形回落或改错字）；必须抓住"""
import os
import sys

import numpy as np
from PIL import Image, ImageDraw, ImageFont

fonts = sys.argv[1]
here = os.path.dirname(os.path.abspath(__file__))


def draw(word):
    im = Image.new('RGB', (1920, 1080), (10, 16, 32))
    d = ImageDraw.Draw(im)
    d.rounded_rectangle([560, 220, 1360, 600], 28, fill=(22, 32, 56), outline=(90, 120, 170), width=3)
    d.text((960, 360), 'evidence', font=ImageFont.truetype(os.path.join(fonts, 'SourceSerif4Display-Italic.ttf'), 120), fill=(230, 238, 252), anchor='mm')
    d.text((960, 500), 'n. ' + word, font=ImageFont.truetype(os.path.join(fonts, 'NotoSansSC-500.ttf'), 56), fill=(207, 230, 255), anchor='mm')
    d.text((960, 760), '先记住这个词。', font=ImageFont.truetype(os.path.join(fonts, 'NotoSansSC-700.ttf'), 64), fill=(255, 243, 223), anchor='mm')
    return im


ref = draw('证据')
ref.save(os.path.join(here, 'ref.png'), optimize=True)
a = np.asarray(ref).astype(np.int16)
rng = np.random.default_rng(7)
g = a.copy()
g[..., 2] += 1
m = rng.random(a.shape[:2]) < 0.0005
g[m] += rng.integers(-2, 3, size=(int(m.sum()), 3))
Image.fromarray(np.clip(g, 0, 255).astype(np.uint8)).save(os.path.join(here, 'good.png'), optimize=True)
draw('证剧').save(os.path.join(here, 'bad.png'), optimize=True)
