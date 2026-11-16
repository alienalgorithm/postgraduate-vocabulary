"""Shared look for the article packages: same fonts, colours and CJK line breaking as the v5 book; no bold anywhere."""
import importlib.util, sys
from pathlib import Path
from reportlab import rl_config
rl_config.useA85 = 0
V5 = Path('/home/user/postgraduate-vocabulary/考研学人印刷版/2026-11-16-v5')
spec = importlib.util.spec_from_file_location('build_v5', V5 / '制作程序/build_v5.py')
B = importlib.util.module_from_spec(spec); _argv = sys.argv; sys.argv = ['x']; spec.loader.exec_module(B); sys.argv = _argv
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.pdfbase import pdfmetrics
MM = B.MM; INK, ACCENT, MUTED, RULE = B.INK, B.ACCENT, B.MUTED, B.RULE
CJKPara = B.CJKPara
C = colors.HexColor
ZH_NUM = B.para_name
from reportlab.pdfbase.ttfonts import TTFont
pdfmetrics.registerFont(TTFont('IPA', str(Path(__file__).resolve().parent / 'fonts/NotoSerif-Regular.ttf')))   # full IPA set (OFL)
