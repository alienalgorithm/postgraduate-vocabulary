# Warm "inner light" grade for the brain cut-out: lift the brown grooves toward amber so it reads as glowing, not striped.
import numpy as np
from PIL import Image
from scipy import ndimage as ndi
D = '/tmp/claude-0/-home-user-postgraduate-vocabulary/3d87cc6c-41dd-58c2-802f-d51dc0c78527/scratchpad/cv/d4_question'
im = np.asarray(Image.open(D + '/assets/brain.png')).astype(np.float32)
rgb, al = im[..., :3] / 255, im[..., 3:] / 255
lum = rgb.mean(2, keepdims=True)
t = np.clip(lum, 0, 1)
amber = np.array([0.80, 0.40, 0.06])
w = np.clip(1 - t / 0.6, 0, 1) ** 1.5 * 0.55          # only the grooves move, toward a saturated amber
out = rgb + (amber - rgb) * w
out = np.clip(out * 1.04, 0, 1)
Image.fromarray(np.dstack([np.clip(out, 0, 1) * 255, al * 255]).astype(np.uint8), 'RGBA').save(D + '/assets/brain_g.png')
print('ok')
