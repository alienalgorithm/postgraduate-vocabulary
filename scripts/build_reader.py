#!/usr/bin/env python3
"""build_reader.py —— 给一篇文章合成逐句音频，产出带逐词时间轴与中英对照高亮的数据。

★ 由来（2026-09-04，用户要一个「能放出声、像黑板视频那样」的网页）：
  七十篇有了，学习大纲有了，可它还是只能「读」。这一步把一篇文章变成能听、能跟读的东西。
  离线 TTS 用用户提供的 say-en（kokoro-onnx）；**不改任何铁律，纯从数据层派生。**

产出（reader/ 下）：
  audio/aNN-SS.m4a/.opus 每句一段音频，两种格式（m4a 给 iOS，opus 给其余）
  aNN.json              每句：英文、中文、逐词时间轴、重点词在中英两侧的位置

高亮怎么配：
  每句里的加粗重点词，英文一处、中文括注一处，两边用同一个色号——
  这就是那张黑板图里 was / content to / formulas 与「满足于」「公式」同色的做法。

用法：
  python3 scripts/build_reader.py 01                 # 第 1 篇
  python3 scripts/build_reader.py 01 --voice bm_george --speed 0.92
  python3 scripts/build_reader.py 02 --n 8      # 这趟最多做 8 句；反复跑同一条命令推进
  python3 scripts/build_reader.py 02 --fresh    # 不续跑，从头重做
需要：say-en 解压在 /tmp/say/say-en（或 --say 指定），模型已下好。
"""
import os
import re
import sys
import json
import shutil
import subprocess

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BOLD = re.compile(r"\*\*([^*]+)\*\*")
ZH_GLOSS = re.compile(r"\*\*([^*]+)\*\*\(([^)]+)\)")
SAY_DEFAULT = "/tmp/say/say-en"


def load_all():
    js = ('globalThis.window=globalThis;'
          + ''.join('require(%s);' % json.dumps(os.path.join(ROOT, 'data', f))
                    for f in sorted(os.listdir(os.path.join(ROOT, 'data'))) if f.endswith('.js'))
          + 'process.stdout.write(JSON.stringify(globalThis.SITE.ARTICLES))')
    out = subprocess.run(['node', '-e', js], capture_output=True, text=True, cwd=ROOT).stdout
    return {a['id']: a for a in json.loads(out)}


def split_sentences(en, zh):
    """英中对齐。**中文切在哪，由这句英文的重点词在中文里的落点决定**，不靠标点数目。

    ★ 为什么不按标点（2026-09-04 实测）：第01篇末段英文 5 句、中文 4 句——中文用分号把两句并了。
      按标点对齐会整段退化成一句（实测 21.75 秒的一句）。重点词是中英两边唯一严格对应的锚点。
    """
    def cut_en(text):
        parts, buf = [], ""
        for ch in text:
            buf += ch
            if ch in ".!?":
                parts.append(buf.strip()); buf = ""
        if buf.strip():
            parts.append(buf.strip())
        out = []
        for s in parts:                       # 小数点误切，合回去
            if out and re.search(r"\d\.$", out[-1]) and re.match(r"^\d", s):
                out[-1] += " " + s
            else:
                out.append(s)
        return out

    es = cut_en(en)
    if len(es) <= 1:
        return [(en.strip(), zh.strip())]
    # 中文里每个括注的位置：[(结束下标, 英文词)]
    marks_zh = [(m.end(), m.group(2).lower()) for m in ZH_GLOSS.finditer(zh)]
    pos, out, mi = 0, [], 0
    for si, e in enumerate(es):
        keys = [w.lower().strip(",.;:") for w in BOLD.findall(e)]
        last = pos
        for kk in keys:                        # 走到这句最后一个重点词在中文里的落点
            for j in range(mi, len(marks_zh)):
                end, w = marks_zh[j]
                if w == kk or w.rstrip('s') == kk.rstrip('s'):
                    last = max(last, end); mi = j + 1; break
        if si == len(es) - 1:
            cutpos = len(zh)
        else:
            # 从落点往后找断句处。★ 不能一律按「。比；强」排优先：实测第01篇 §5，
            # 「。」比「；」远得多，优先它就会一句吞掉下一句的中文。
            # 但**限定在下一句第一个锚点之前**去找句号是安全的——找得到就用它，
            # 找不到再退回最近的任意标点。（修好了「第二天也死了」跑到下一句的错位。）
            nxt_anchor = None
            for jj in range(si + 1, len(es)):
                kk2 = [w.lower().strip(",.;:") for w in BOLD.findall(es[jj])]
                for k2 in kk2:
                    for j2 in range(mi, len(marks_zh)):
                        end2, w2 = marks_zh[j2]
                        if w2 == k2 or w2.rstrip('s') == k2.rstrip('s'):
                            nxt_anchor = end2 - 1; break
                    if nxt_anchor is not None: break
                if nxt_anchor is not None: break
            cutpos = None
            if nxt_anchor and nxt_anchor > last:
                seg = zh[last:nxt_anchor]
                hard = [seg.find(c) for c in "。！？" if seg.find(c) >= 0]
                if hard:
                    cutpos = last + min(hard) + 1
            if cutpos is None:
                # 候选标点不止一个时**按英文词数比例**挑最接近的，别一律取最近的那个——
                # 「委员会接受的也不是他的结论，只是他的建议；」取最近就切在「结论，」，
                # 「只是他的建议；」会漏到下一句去。
                cand = []
                for c in "。！？；，":
                    x = zh.find(c, last)
                    while x >= 0:
                        cand.append(x + 1); x = zh.find(c, x + 1)
                cand = sorted(set(x for x in cand if x > pos))
                if cand:
                    # ★ 比例要算在**去掉括注的纯中文**上：括注 (fading)(accepted) 这些
                    #   长短不一，按原始下标算会把目标位置带偏几十个字符。
                    rest = sum(len(BOLD.sub(r"\1", t).split()) for t in es[si:]) or 1
                    ratio = len(BOLD.sub(r"\1", e).split()) / rest
                    whole = _zh_len(zh[pos:]) or 1
                    cutpos = min(cand, key=lambda x: abs(_zh_len(zh[pos:x]) / whole - ratio))
                else:
                    cutpos = len(zh)
        chunk = zh[pos:cutpos].strip()
        if not chunk:                          # 这句英文在中文里没有落点，并进上一句
            if out:
                out[-1] = (out[-1][0] + " " + e, out[-1][1]); continue
            chunk = zh[pos:cutpos]
        out.append((e, chunk)); pos = cutpos
    if pos < len(zh) and out:                  # 中文剩尾巴，贴回最后一句
        out[-1] = (out[-1][0], (out[-1][1] + zh[pos:]).strip())
    return out


# ── 意群拆分（2026-09-04，用户要「不要上面一整句英文、下面一整句中文」）──────
#    每一小段英文底下就跟着它自己的中文。中文切在哪，仍旧靠重点词括注当锚点。
ZH_PUNCT = "，。；：、！？—"


def _all_idx(t, ch):
    out, i = [], t.find(ch)
    while i >= 0:
        out.append(i); i = t.find(ch, i + 1)
    return out


CONJ = {"and", "but", "or", "so", "yet", "since", "because", "while", "when", "where",
        "which", "who", "that", "if", "though", "although", "after", "before", "until"}
OPEN = {"a", "an", "the", "this", "that", "these", "those", "his", "her", "their",
        "its", "my", "our", "some", "each", "every", "all", "both", "no", "one", "two",
        "three", "and", "but", "or", "so", "yet", "he", "she", "it", "they", "we", "there"}
FUNC = {"a", "an", "the", "and", "or", "but", "of", "to", "in", "on", "at", "by", "for",
        "with", "from", "since", "that", "who", "which", "as", "into", "than", "was",
        "were", "is", "are", "had", "has", "have", "his", "her", "its", "their", "this",
        "these", "no", "not", "one", "two", "he", "she", "it", "they", "you", "we"}


def _zh_len(t):
    """中文实际字数：只数汉字、字母、数字，标点空格不算。"""
    return len(re.sub(r"[^\w\u4e00-\u9fff]", "", ZH_GLOSS.sub(r"\1", t)))


def align_chunks(en, zh):
    """把一句英文与它的中文切成一一对应的意群，返回 [(en, zh)]。

    ★ 做法（2026-09-04，用户两次要求「对得精准一些」之后重写）：
      **不再是「按英文标点切、再去中文里找地方下刀」**——那样只能用英文的标点，
      而中英标点根本不一样。用户指出的正是这个：英文「In September 1854 a few streets of Soho,」
      是一整段，中文却在「1854 年 9 月，」后面就有逗号，于是「1854 年 9 月」落不到
      「In September 1854」底下。

      现在是**两边同时出切点、动态规划找整体最优的对齐**：
        · 中文候选切点＝每个标点之后；英文候选切点＝每个词之后（标点处加分）。
        · 每一段的代价 = 长度占比不符 + 锚点错位 + 段落过长过短；段数本身给一点奖励，
          所以在同样准的前提下会尽量切细。
        · 锚点＝重点词的中文括注：这一段英文里的重点词，它的中文必须落在这一段中文里。

      这样得到的就是：「In September 1854 / 1854 年 9 月，」「a few streets of Soho, in central
      London, / 伦敦市中心苏活区的几条街道，」「lost 616 people to cholera in ten days. / 在十天里…」
    """
    toks = en.split()
    n = len(toks)
    if n < 6:
        return [(en.strip(), zh.strip())]

    # 中文候选切点（标点之后）
    zcuts = [0]
    for idx, ch in enumerate(zh):
        if ch in "，。；：、！？—":
            nxt = idx + 1
            while nxt < len(zh) and zh[nxt] in "，。；：、！？— ":
                nxt += 1
            if nxt not in zcuts:
                zcuts.append(nxt)
    if len(zh) not in zcuts:
        zcuts.append(len(zh))
    zcuts = sorted(set(zcuts))
    if len(zcuts) < 3:                      # 中文没得切
        return [(en.strip(), zh.strip())]

    TE = n
    TZ = _zh_len(zh) or 1
    # 每个重点词的中文位置
    gl = [(m.start(), m.end(), m.group(2).lower()) for m in ZH_GLOSS.finditer(zh)]

    def seg_cost(a, b, za, zb):
        ew = b - a
        piece = zh[zcuts[za]:zcuts[zb]]
        zc = _zh_len(piece)
        if ew < 2 or zc < 2:
            return 1e6
        # 一 · 长度占比（用户看出来的错就是这个）。留 3 个百分点的容差，
        #      免得为了抠比例把英文在半路截断。
        cost = 300 * max(0.0, abs(zc / TZ - ew / TE) - 0.03)
        # 二 · 锚点：这段英文里的重点词，中文得落在这段里
        keys = [BOLD.sub(r"\1", w).lower().strip(",.;:!?") for w in toks[a:b] if "**" in w]
        keys = [k for k in keys if k]
        lo, hi = zcuts[za], zcuts[zb]
        for k in keys:
            ok = any((gw == k or gw.rstrip('s') == k.rstrip('s')) and lo <= st < hi
                     for st, _, gw in gl)
            if not ok:
                cost += 34
        inside = sum(1 for st, _, _ in gl if lo <= st < hi)
        cost += 26 * abs(inside - len(keys))
        # 三 · 段落别太长太短
        if ew > 13:
            cost += 2.4 * (ew - 13)
        if ew < 3:
            cost += 7
        # 四 · 英文必须断在像样的地方——不然会切出「In September 1854 a」「on Broad」这种半截
        if b < n:
            tail = BOLD.sub(r"\1", toks[b - 1])
            nxt = BOLD.sub(r"\1", toks[b]).lower().strip(",.;:!?")
            if not re.search(r"[,;:.!?—]$", tail):
                # 英文这里没有标点，但**下一个词是冠词/连词/代词这类开头词**的话，
                # 本来就是一处自然停顿——「In September 1854 | a few streets…」。
                # 下一个词是 to / of / Street 这种，就是把词组劈开了，重罚。
                cost += 7 if nxt in OPEN else 26
            if tail.lower().strip(",.;:!?") in FUNC:
                cost += 34                      # 断在虚词后面（a / the / and / of…），更重
            # 断在连词/从句引导词**之前**是天然的意群边界，给奖励——
            # 「…and died / the next day.」这种把动词和它的时间状语劈开的切法，靠这一条纠正。
            if nxt in CONJ:
                cost -= 18
        return cost

    NEG = 15.0                              # 每多切一段给的奖励：同样准就尽量切细
    INF = float("inf")
    best = {(0, 0): (0.0, None)}
    order = [(a, z) for a in range(n + 1) for z in range(len(zcuts))]
    for a, z in order:
        if (a, z) not in best:
            continue
        base = best[(a, z)][0]
        if a == n and z == len(zcuts) - 1:
            continue
        for b in range(a + 2, n + 1):
            for zb in range(z + 1, len(zcuts)):
                if (b == n) != (zb == len(zcuts) - 1):
                    continue
                c = seg_cost(a, b, z, zb)
                if c >= 1e5:
                    continue
                v = base + c - NEG
                if v < best.get((b, zb), (INF, None))[0]:
                    best[(b, zb)] = (v, (a, z))
    end = (n, len(zcuts) - 1)
    if end not in best:
        return [(en.strip(), zh.strip())]
    path, cur = [], end
    while cur != (0, 0):
        prev = best[cur][1]
        path.append((prev, cur)); cur = prev
    path.reverse()
    out = [(" ".join(toks[p[0]:c[0]]).strip(), zh[zcuts[p[1]]:zcuts[c[1]]].strip())
           for p, c in path]
    out = [(a, b) for a, b in out if a and b]
    return out or [(en.strip(), zh.strip())]


def marks(en_sent, zh_sent):
    """把重点词在英中两侧的位置配成对：同一个词，两边同色号。"""
    en_words = BOLD.findall(en_sent)
    zh_pairs = ZH_GLOSS.findall(zh_sent)          # (中文, 英文括注)
    pairs = []
    used = set()
    for i, w in enumerate(en_words):
        key = w.lower().strip(",.;:")
        hit = None
        for j, (zh_w, en_w) in enumerate(zh_pairs):
            if j in used:
                continue
            if en_w.lower() == key or en_w.lower().rstrip('s') == key.rstrip('s'):
                hit = (j, zh_w, en_w); break
        if hit is None and i < len(zh_pairs) and i not in used:
            j = i; hit = (j, zh_pairs[j][0], zh_pairs[j][1])
        if hit:
            used.add(hit[0])
            pairs.append({"en": w, "zh": hit[1], "gloss": hit[2], "c": len(pairs) % 6})
    return pairs


def plain(en_sent):
    return BOLD.sub(r"\1", en_sent)


def main():
    args = [x for x in sys.argv[1:] if not x.startswith("--")]
    aid = (args[0] if args else "01").zfill(2)
    voice = sys.argv[sys.argv.index("--voice") + 1] if "--voice" in sys.argv else "bf_emma"
    speed = float(sys.argv[sys.argv.index("--speed") + 1]) if "--speed" in sys.argv else 0.95
    saydir = sys.argv[sys.argv.index("--say") + 1] if "--say" in sys.argv else SAY_DEFAULT
    sys.path.insert(0, saydir)
    import say as SAY

    art = load_all()[aid]
    outdir = os.path.join(ROOT, "reader")
    audio = os.path.join(outdir, "audio")
    os.makedirs(audio, exist_ok=True)

    # ★ 断点续跑（say-en《踩过的坑》第五条：批量合成会被 OOM killer 直接杀掉，
    #   没有任何报错。70 篇约 1,200 段，必须能反复跑同一条命令推进）。
    jpath = os.path.join(outdir, "a%s.json" % aid)
    done = {}
    if os.path.exists(jpath) and "--fresh" not in sys.argv:
        try:
            old = json.load(open(jpath, encoding='utf-8'))
            for x in old.get("sentences", []):
                if os.path.exists(os.path.join(outdir, x["audio"])):
                    done[x["i"]] = x
        except Exception:
            done = {}
    limit = int(sys.argv[sys.argv.index("--n") + 1]) if "--n" in sys.argv else 10 ** 6

    k = SAY._load_model(os.path.join(saydir, "models"))
    sents = []
    problems = []
    n = 0
    made = 0
    for pi, p in enumerate(art['paras'], 1):
        for en_s, zh_s in split_sentences(p['en'], p['zh']):
            n += 1
            if n in done:                       # 已做过，跳过
                sents.append(done[n]); continue
            if made >= limit:
                sents.append(done.get(n)) if False else None
                continue
            made += 1
            txt = plain(en_s)
            wav = SAY.synth(k, txt, voice=voice, speed=speed)
            times = SAY.word_times(wav, len(txt.split()))
            # ★ 两种格式都出（2026-09-04 实测踩到两次）：
            #   · 只出 opus → **iOS Safari 放不出来**，而这个站的读者多半在手机上；
            #   · 只出 m4a  → 开源 Chromium 不含 AAC，本地根本验不了「到底响没响」。
            #   两个加起来一篇也才 1.2 MB。opus 走 say.write()（官方 API），m4a 另编。
            base = "a%s-%02d" % (aid, n)
            opus = os.path.join(audio, base + ".opus")
            m4a = os.path.join(audio, base + ".m4a")
            SAY.write(wav, opus)
            import soundfile as sf
            tmp = os.path.join(audio, "_t.wav")
            sf.write(tmp, wav, SAY.SR)
            subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", tmp,
                            "-c:a", "aac", "-b:a", "48k", "-ac", "1",
                            "-movflags", "+faststart", m4a], check=True)
            os.remove(tmp)

            # ★★ 解码质检（say-en《踩过的坑》第三、七条：元数据全对不代表声音是对的，
            #     那次八项检查全过、却有 34 段削波，就是因为一次都没解码过）。
            #     顺便按第四条：时间轴末项要对着**编码后**的时长比——重新编码会改时长。
            qc = {}
            for tag, path in (("m4a", m4a), ("opus", opus)):
                info = SAY.inspect(path)
                qc[tag] = {"ok": info["ok"], "why": info["why"],
                           "dur": round(info.get("dur", 0), 3),
                           "peak": round(info.get("peak", 0), 3),
                           "rms": round(info.get("rms", 0), 4)}
                if not info["ok"]:
                    problems.append("%s %s" % (base + "." + tag, info["why"]))
                d2 = info.get("dur", 0)
                if d2 and times[-1] / 1000 > d2 - 0.03:
                    lim = int((d2 - 0.03) * 1000)          # 截到时长内
                    times = [min(x, lim) for x in times]
                    for z in range(1, len(times)):          # 截完必须重新保证递增
                        if times[z] < times[z - 1]:
                            times[z] = times[z - 1]
                    problems.append("%s 时间轴末项超出解码时长，已截" % (base + "." + tag))
            # 第一条：一句话读完至少一秒，末项 < 1000 就是存成秒了
            if len(wav) / SAY.SR > 1.5 and times[-1] < 1000:
                problems.append("%s 时间轴末项 %d < 1000，疑似存成秒" % (base, times[-1]))
            name = base + ".m4a"
            dur = round(len(wav) / SAY.SR, 3)
            sents.append({"i": n, "para": pi, "en": en_s, "zh": zh_s, "plain": txt,
                          "words": txt.split(), "times": times, "dur": dur,
                          "audio": "audio/" + base + ".m4a",
                          "audioAlt": "audio/" + base + ".opus",
                          "qc": qc, "marks": marks(en_s, zh_s),
                          "chunks": [{"en": ce, "zh": cz, "marks": marks(ce, cz)}
                                     for ce, cz in align_chunks(en_s, zh_s)]})
            print("  %2d  %5.2fs  %s" % (n, dur, txt[:56]))

    sents = [x for x in sents if x]
    sents.sort(key=lambda x: x['i'])
    data = {"id": aid, "title": art['title'], "voice": voice, "speed": speed,
            "total": round(sum(s['dur'] for s in sents), 1), "sentences": sents}
    json.dump(data, open(jpath, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    print("\n第%s篇 · %d/%d 句 · %.1f 秒 · %s → reader/a%s.json"
          % (aid, len(sents), n, data['total'], voice, aid))
    if problems:
        print("  ⚠ 质检报了 %d 条：" % len(problems))
        for x in problems[:10]:
            print("    ·", x)
    else:
        print("  ✓ 解码质检全过（削波／过轻／过短／时间轴越界／单位）")
    if len(sents) < n:
        print("  ↻ 还差 %d 句，再跑一次同样的命令即可（断点续跑）" % (n - len(sents)))


if __name__ == "__main__":
    main()
