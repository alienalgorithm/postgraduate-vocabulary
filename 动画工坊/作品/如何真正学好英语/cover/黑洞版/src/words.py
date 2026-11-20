# Word texture for the accretion disk (log-polar layout, seeded, deterministic).
# Output: work/words_tex.png (8192 x 4096, L) where x = angle (reading direction),
# y = radius (top = outer edge). One long strip of real exam vocabulary, wrapped
# into lanes; each lane wraps seamlessly around the circle.
import os, random, sys
from PIL import Image, ImageDraw, ImageFont

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
W, H = 8192, 4096
LANE = 104          # lane pitch in texels
SIZE = 66           # base font size in texels

WORDS = """
abandon abstract academic accelerate accommodate accumulate accurate acknowledge acquire adapt
adequate adjust advocate aesthetic affirm aggregate allocate alter ambiguous ambition amend analogy
anticipate apparent appeal appreciate arbitrary assert assess assume attribute authentic autonomy
barrier bias boost breakthrough budget capacity capture category cease challenge clarify coherent
collapse commit compensate compile complement comply component comprehend compromise conceive
concentrate concept conclude concrete confine conflict conform confront consensus consequence
conserve considerable consist constitute constrain consume contemplate contemporary contradict
contribute controversy convention convert convey convince cooperate coordinate correspond crucial
cultivate curiosity decline dedicate deficit define delicate demonstrate deny depict derive deserve
detect deteriorate devote dilemma diminish discipline disclose dispute distinct distort diverse
domain dominate durable dynamic efficient elaborate eliminate embrace emerge emphasize empirical
enable encounter endure enhance enormous ensure equivalent erode essential establish estimate
evaluate evident evolve exaggerate exceed exclusive execute exhibit expand explicit exploit expose
extend facilitate feasible flexible fluctuate forecast formulate foster fragile framework
fundamental generate genuine hypothesis identical ignore illustrate impose incentive incline
incorporate indicate inevitable infer inherent inhibit initiate innovate insight inspire integrate
integrity intense interpret intervene intrinsic investigate isolate justify launch legitimate
maintain manipulate margin mature mechanism mediate migrate minimize modify monitor motivate mutual
negotiate neutral notion obscure obtain obvious occupy offset optimistic orient outcome overlook
paradox parallel perceive persist perspective phenomenon plausible potential precise predict
preliminary presume prevail principle priority proceed profound prohibit prominent promote prospect
provoke pursue radical rational recall recognize recover refine reform reinforce reject release
relevant reluctant rely remark render resolve restore restrict retain retrieve reveal reverse revise
rigid scenario scope scrutiny sector sophisticated specify speculate stimulate strategy subsequent
substantial substitute subtle sufficient suspend sustain symbolic tackle temporary tension terminate
thrive trace transform transition transmit trigger ultimate undergo undermine unique utilize valid
vary verify versatile viable vital vulnerable withdraw yield memory remember forget review recall
retrieve retain vocabulary meaning context sentence silence orbit gravity horizon distance echo
""".split()

FORBIDDEN_SUBSTR = ["native", "foreign", "america", "british", "chinese", "abroad", "nation", "overseas"]


def word_list():
    out = []
    for w in WORDS:
        assert w.isalpha() and w.islower(), w
        assert not any(f in w for f in FORBIDDEN_SUBSTR), w
        out.append(w)
    return out


def lane_strip(rnd, words, f, sh, used):
    fonts = [ImageFont.truetype(os.path.join(ROOT, "fonts", n), f)
             for n in ("SourceSerif4Display-Regular.ttf", "SourceSerif4Display-Italic.ttf")]
    strip = Image.new("L", (W, sh), 0)
    d = ImageDraw.Draw(strip)
    x = rnd.randint(0, 600)
    start_x = x
    while True:
        w = rnd.choice(words)
        if rnd.random() < 0.16:
            w = w.upper()
        fo = fonts[1] if rnd.random() < 0.3 else fonts[0]
        val = int(255 * rnd.uniform(0.45, 1.0))
        wpx = d.textlength(w, font=fo)
        if x + wpx > start_x + W - f * 0.6:
            break
        for ox in (0, -W):
            d.text((x + ox, 0), w, font=fo, fill=val, anchor='la')
        used.append(w)
        x += wpx + rnd.randint(int(f * 0.8), int(f * 2.2))
    return strip


def build(out_dir, stretch=5.0, decay=0.9, size0=80.0, big_lanes=4, decay2=0.8, stretch2=2.6, floor=15.0):
    """words_far.png: glyphs upright for the far half (seen over the top of the hole).
    words_near.png: each lane rotated 180 degrees, so the near half also reads upright."""
    rnd = random.Random(20261119)
    words = word_list()
    far = Image.new("L", (W, H), 0)
    near = Image.new("L", (W, H), 0)
    used = []
    y0, size, lane = 0, size0, 0
    while True:
        f = int(round(size))
        asc, desc = ImageFont.truetype(os.path.join(ROOT, "fonts", "SourceSerif4Display-Regular.ttf"), f).getmetrics()
        sh = int(asc * 0.98 + desc * 0.95)
        st = stretch if lane < big_lanes else max(stretch2, stretch * (0.85 ** (lane - big_lanes + 1)))
        th = int(round(sh * st))
        pitch = th + int(round(f * st * 0.12))
        if y0 + pitch > H:
            break
        for img, rot in ((far, False), (near, True)):
            strip = lane_strip(rnd, words, f, sh, used)
            tall = strip.resize((W, th), Image.LANCZOS)
            if rot:
                tall = tall.rotate(180)
            img.paste(tall, (0, y0 + (pitch - th) // 2))
        y0 += pitch
        lane += 1
        size = max(size * (decay if lane < big_lanes else decay2), floor)
    far.save(os.path.join(out_dir, "words_far.png"))
    near.save(os.path.join(out_dir, "words_near.png"))
    with open(os.path.join(out_dir, "disk_words.txt"), "w") as fh:
        fh.write("\n".join(sorted(set(used))) + "\n")
    print("lanes", lane, "rows used", y0, "words drawn", len(used))


if __name__ == "__main__":
    build(sys.argv[1] if len(sys.argv) > 1 else os.path.join(ROOT, "work"))
