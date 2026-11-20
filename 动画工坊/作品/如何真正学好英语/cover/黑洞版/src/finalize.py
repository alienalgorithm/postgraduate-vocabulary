# Derive the upload JPEGs, feed previews and the pair sheet from the two masters.
import os
from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
LIMIT = 2 * 1024 * 1024


def save_jpeg(img, path):
    # highest quality (>= 92) that stays under 2 MB; 4:4:4 chroma keeps the type crisp
    for q in range(97, 91, -1):
        for sub in (0, 1, 2):
            img.save(path, "JPEG", quality=q, subsampling=sub, optimize=True, progressive=False)
            if os.path.getsize(path) < LIMIT:
                return q, sub
    raise SystemExit(f"cannot fit {path} under 2 MB at quality >= 92")


def main():
    m16 = Image.open(os.path.join(ROOT, "master_16x9.png")).convert("RGB")
    m43 = Image.open(os.path.join(ROOT, "master_4x3.png")).convert("RGB")
    u16 = m16.resize((1920, 1080), Image.LANCZOS)
    u43 = m43.resize((1440, 1080), Image.LANCZOS)
    q1 = save_jpeg(u16, os.path.join(ROOT, "upload_16x9.jpg"))
    q2 = save_jpeg(u43, os.path.join(ROOT, "upload_4x3.jpg"))
    f16 = m16.resize((320, 180), Image.LANCZOS)
    f43 = m43.resize((240, 180), Image.LANCZOS)
    f16.save(os.path.join(ROOT, "feed_16x9.png"))
    f43.save(os.path.join(ROOT, "feed_4x3.png"))
    # pair sheet: both uploads side by side, both feed previews at 2x underneath, on mid-grey
    g, pad = (128, 128, 128), 40
    Wd = pad + 1920 + pad + 1440 + pad
    Hd = pad + 1080 + pad + 360 + pad
    sheet = Image.new("RGB", (Wd, Hd), g)
    sheet.paste(u16, (pad, pad))
    sheet.paste(u43, (pad + 1920 + pad, pad))
    sheet.paste(f16.resize((640, 360), Image.NEAREST), (pad, pad + 1080 + pad))
    sheet.paste(f43.resize((480, 360), Image.NEAREST), (pad + 1920 + pad, pad + 1080 + pad))
    sheet.save(os.path.join(ROOT, "pair.jpg"), "JPEG", quality=92, subsampling=0, optimize=True)
    print("upload_16x9.jpg quality/subsampling", q1, "upload_4x3.jpg", q2)


if __name__ == "__main__":
    main()
