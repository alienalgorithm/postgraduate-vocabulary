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
                cand = [zh.find(c, last) for c in "。！？；，"]
                cand = [x for x in cand if x >= 0]
                cutpos = (min(cand) + 1) if cand else len(zh)
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


def en_chunks(en):
    """英文按**标点**切成小句。不在连词/介词处再切——
    ★ 实测：切到「and went house / to house asking」这种程度，中文根本配不上去。
      中文的语序和英文不一样（定语前置），切得越碎错位越多。标点是两边都认的边界。"""
    parts = [x.strip() for x in re.split(r"(?<=[,;:])\s+|\s+—\s+", en) if x and x.strip()]
    return parts or [en.strip()]


def align_chunks(en, zh):
    """把英文小句与中文片段配对，返回 [(en, zh)]。

    ★ 核心一条（2026-09-04 用户要「拆细一点」之后实测出来的）：
      **拆到中英语序仍然一致为止，语序一颠倒就把那两段合回去。**
      「John Snow, / a physician who lived nearby,」在中文里是「住在附近的内科医生约翰·斯诺」——
      顺序反的。硬拆就会出现「John Snow,」底下配「住在附近的」。
      判据就是重点词括注在中文里的位置：后一段的锚点若跑到前一段前面，说明语序翻了，合并。
    """
    ecs = en_chunks(en)
    if len(ecs) <= 1:
        return [(en.strip(), zh.strip())]
    gl = [(m.start(), m.end(), m.group(2).lower()) for m in ZH_GLOSS.finditer(zh)]
    if not gl:
        return [(en.strip(), zh.strip())]

    def anchors(e, used):
        """这段英文的重点词在中文里的 (最早起点, 最晚终点)；不看顺序，全篇找。"""
        first = last = None
        for w in BOLD.findall(e):
            k = w.lower().strip(",.;:")
            for j, (st, en_, gw) in enumerate(gl):
                if j in used:
                    continue
                if gw == k or gw.rstrip('s') == k.rstrip('s'):
                    used.add(j)
                    first = st if first is None else min(first, st)
                    last = en_ if last is None else max(last, en_)
                    break
        return first, last

    used = set()
    items = [[e, *anchors(e, used)] for e in ecs]

    merged = [list(x) for x in items]

    # 一 · 语序一翻就合并（后一段的起点跑到前一段终点之前）
    #     「John Snow, / a physician who lived nearby,」在中文里是「住在附近的内科医生约翰·斯诺」——
    #     顺序反的，硬拆就会出现「John Snow,」底下配「住在」。
    k = 0
    while k < len(merged) - 1:
        a_, b_ = merged[k], merged[k + 1]
        if b_[1] is not None and a_[2] is not None and b_[1] < a_[2]:
            merged[k] = [a_[0] + " " + b_[0],
                         min(x for x in (a_[1], b_[1]) if x is not None),
                         max(x for x in (a_[2], b_[2]) if x is not None)]
            del merged[k + 1]
            k = max(0, k - 1)
        else:
            k += 1
    if len(merged) <= 1:
        return [(en.strip(), zh.strip())]

    def next_anchor(k):
        for j in range(k + 1, len(merged)):
            if merged[j][1] is not None:
                return merged[j][1]
        return None

    # 二 · 切中文
    out, pos = [], 0
    for k, (e, f, l) in enumerate(merged):
        if k == len(merged) - 1:
            cut = len(zh)
        else:
            nf = next_anchor(k)
            if l is not None:
                # 有锚点：从本段终点往后，遇到的第一个标点就切
                seg = zh[l:nf] if (nf and nf > l) else zh[l:]
                hit = [seg.find(c) for c in ZH_PUNCT if seg.find(c) >= 0]
                cut = (l + min(hit) + 1) if hit else (nf if nf and nf > pos else len(zh))
            elif nf is not None and nf > pos:
                # 没锚点（这段英文里一个重点词都没有）：切在下一段锚点**之前最后一个**标点上。
                # ★ 切不出来就让它空着，下面并给后一段——这是「John Snow,」那种情况。
                # 候选标点不止一个时，按**英文词数比例**挑最接近的那个——
                # 一律取最后一个的话，「Snow had no microscope,」会吃掉「没有细菌，」。
                seg = zh[pos:nf]
                hits = sorted({i2 for c in ZH_PUNCT for i2 in _all_idx(seg, c)})
                if hits:
                    j2 = k
                    while j2 < len(merged) and merged[j2][1] is None:
                        j2 += 1
                    span = sum(len(merged[t][0].split()) for t in range(k, min(j2 + 1, len(merged)))) or 1
                    ratio = len(e.split()) / span
                    target = ratio * len(seg)
                    best = min(hits, key=lambda x: abs(x + 1 - target))
                    cut = pos + best + 1
                else:
                    cut = pos
            else:
                cut = pos
        out.append([e.strip(), zh[pos:cut].strip()]); pos = cut

    # 三 · 中文为空的段并给后一段（并不动就并给前一段）
    k = 0
    while k < len(out):
        if not out[k][1]:
            if k + 1 < len(out):
                out[k + 1][0] = out[k][0] + " " + out[k + 1][0]; del out[k]; continue
            if k > 0:
                out[k - 1][0] += " " + out[k][0]; del out[k]; continue
        k += 1
    if pos < len(zh) and out:
        out[-1][1] = (out[-1][1] + zh[pos:]).strip()
    return [(x[0], x[1]) for x in out if x[0].strip() and x[1].strip()] or [(en.strip(), zh.strip())]


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
