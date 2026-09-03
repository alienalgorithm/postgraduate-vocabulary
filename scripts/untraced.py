#!/usr/bin/env python3
"""untraced.py —— 找出正文里有、而 facts 里没有的具体数字。

★ 立此工具的由来（2026-09-02）：
  六条人读的第一条改写为「每一个具体细节，是核过的还是我为凑名额现造的」之后，
  **手工在第27、39、42、46、50、54 篇上走了一遍，查出三处问题**：
    · 第50篇「站了三小时的观众」「最后 2 个弗隆」——**为满足『给数字』的规范塞的**；
    · 第46篇「那个成绩保持了 14 年」——**实为 15 年，八家来源一致。**
  **而三处的分诊都是同一个动作：把正文里的数字与 facts 比一遍，看哪个没记。**

★★ 为什么这条该做成工具，而前四条筛法不该：
  **这是算术**（这个数在 facts 里出现过吗），**不是趣味判断**。
  前四条（标题像不像引原句／末句像不像重说／句子密不密／加粗裸列）
  筛出来的都是好句子；**这一条筛出来的是一个可数的缺口。**

★★★ 它只做分诊，不下判断：
  报出来的数未必是错的——可能只是漏记了出处。
  **核实与判断仍由人做**，工具只负责把「该看哪几处」缩到几十个。

用法：
  python3 scripts/untraced.py            # 扫全库
  python3 scripts/untraced.py 46         # 扫单篇
"""
import json
import os
import re
import subprocess
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# 不必追溯出处的数：篇号、名额数、以及「一/二/三」这类结构性的小数字
SKIP = {"1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "50", "270"}

# 数字连同它后面的量词一起取，便于人一眼看出这是什么数
NUM = re.compile(r"(\d[\d,.]*)\s*([A-Za-z\u4e00-\u9fff]{0,12})")

# ★ 拼写出来的数也要逮（2026-09-02 补）：
#   **第28篇「a direct flight could take thirty years」与
#   「weighed ten thousand candidate trajectories」两处都无出处，
#   而第一版因为它们是拼写形式，一个都没报。**
#   （核后两处都有据 —— NASA/JPL 事实页作「30 年缩短为 12 年」「研究过一万条以上」，已补注。）
#   **判据不变（这个数在 facts 里出现过吗），只是把拼写形式也换算成数字再比。**
_WORDNUM = {
    "twelve": "12", "thirteen": "13", "fourteen": "14", "fifteen": "15",
    "sixteen": "16", "seventeen": "17", "eighteen": "18", "nineteen": "19",
    "twenty": "20", "thirty": "30", "forty": "40", "fifty": "50",
    "sixty": "60", "seventy": "70", "eighty": "80", "ninety": "90",
    "hundred": "100", "thousand": "1000", "million": "1000000",
}
SPELLED = re.compile(
    r"\b((?:twenty|thirty|forty|fifty|sixty|seventy|eighty|ninety)(?:-\w+)?"
    r"|twelve|thirteen|fourteen|fifteen|sixteen|seventeen|eighteen|nineteen"
    r"|(?:one |two |three |four |five |six |seven |eight |nine |ten )?"
    r"(?:hundred|thousand|million))\b", re.I)


def load(aid=None):
    files = sorted(f for f in os.listdir(os.path.join(ROOT, "data"))
                   if re.fullmatch(r"article-\d+\.js", f))
    if aid:
        files = [f for f in files if f == "article-%s.js" % aid.zfill(2)]
    js = ("globalThis.window=globalThis;"
          + "".join("require(%s);" % json.dumps(os.path.join(ROOT, "data", f))
                    for f in files)
          + "process.stdout.write(JSON.stringify(globalThis.SITE.ARTICLES))")
    out = subprocess.run(["node", "-e", js], capture_output=True, text=True).stdout
    return json.loads(out) if out.strip() else []


def _expand(text):
    """把「7.2 万」「1.6 million」「fifteen」这类写法换算成阿拉伯数，追加到文本末尾，
    好让比对能对上。（2026-09-03 补：第61篇四处假阳性全出在这里。）"""
    extra = []
    for m in re.finditer(r"(\d+(?:\.\d+)?)\s*万", text):
        extra.append(str(int(round(float(m.group(1)) * 10000))))
    for m in re.finditer(r"(\d+(?:\.\d+)?)\s*(million|billion|thousand)", text, re.I):
        mult = {"million": 1e6, "billion": 1e9, "thousand": 1e3}[m.group(2).lower()]
        extra.append(str(int(round(float(m.group(1)) * mult))))
    # ★ 中文数词 → 阿拉伯（2026-09-03 补：全库 12 处命中里 11 处是 facts 用了「九成／十万／五千／二十五万／两百」）
    _cnd = {"零": 0, "一": 1, "二": 2, "两": 2, "三": 3, "四": 4, "五": 5, "六": 6, "七": 7, "八": 8, "九": 9}
    def _cn2n(t):
        t = t.replace("零", "")
        total, num = 0, 0
        for ch in t:
            if ch in _cnd:
                num = _cnd[ch]
            elif ch == "十":
                total += (num or 1) * 10; num = 0
            elif ch == "百":
                total += (num or 1) * 100; num = 0
            elif ch == "千":
                total += (num or 1) * 1000; num = 0
            elif ch == "万":
                total = (total + num) * 10000; num = 0
            elif ch == "亿":
                total = (total + num) * 100000000; num = 0
        return total + num
    for m in re.finditer(r"[零一二两三四五六七八九十百千万亿]{2,}", text):
        try:
            _v = _cn2n(m.group(0))
            if _v > 0:
                extra.append(str(_v))
        except Exception:
            pass
    # 「九成」= 90%
    for m in re.finditer(r"([一二两三四五六七八九])成", text):
        extra.append(str(_cnd[m.group(1)] * 10))
    _small = {"eleven": 11, "twelve": 12, "thirteen": 13, "fourteen": 14, "fifteen": 15,
              "sixteen": 16, "seventeen": 17, "eighteen": 18, "nineteen": 19,
              "twenty": 20, "thirty": 30, "forty": 40, "fifty": 50, "sixty": 60,
              "seventy": 70, "eighty": 80, "ninety": 90}
    for w, n in _small.items():
        if re.search(r"\b%s\b" % w, text, re.I):
            extra.append(str(n))
    return text + " " + " ".join(extra)


def scan(art):
    body = " ".join(p["en"] + " " + p["zh"] for p in art["paras"])
    facts = _expand(" ".join(art.get("facts", [])))
    stand = _expand(art.get("standfirst", ""))
    hits = []
    seen = set()
    # ★ 正文里「N 万」这种写法：直接按换算后的数去 facts 里找，找到即不报
    for m in re.finditer(r"(\d+(?:\.\d+)?)\s*万", body):
        _v = str(int(round(float(m.group(1)) * 10000)))
        seen.add(m.group(1))
        if _v not in facts.replace(",", "") and _v not in stand.replace(",", ""):
            i = m.start()
            hits.append((m.group(0), "", body[max(0, i - 46):i + 34].replace("\n", " ")))
    for m in NUM.finditer(body):
        num, tail = m.group(1), m.group(2).strip()
        if num in SKIP or num in seen:
            continue
        seen.add(num)
        # ★ 归一化后再比 —— 第一版在这里错了两次（2026-09-02 实测 89% 假阳性）：
        #   一 · **千位逗号**：正文 1,777 与 facts 的 1777 比不上；
        #   二 · **量词粘连**：把数字连同后面的词一起取，比对时却拿整串去比。
        # **判据本身没错（这个数在 facts 里出现过吗），错的是实现。**
        _n = num.replace(",", "").rstrip(".")
        _f = facts.replace(",", "")
        _s = stand.replace(",", "")
        if _n in _f or _n in _s:
            continue
        # 年份还可能写作「1974年」「一九七四」等中文形式
        if len(_n) == 4 and _n.isdigit() and (_n + "年") in (_f + _s):
            continue
        i = m.start()
        hits.append((num, tail, body[max(0, i - 46):i + 34].replace("\n", " ")))
    # ★ 拼写形式：换算成数字后同样比一遍
    _cn = {"11": "十一", "12": "十二", "13": "十三", "14": "十四", "15": "十五", "16": "十六",
           "17": "十七", "18": "十八", "19": "十九", "20": "二十", "30": "三十", "40": "四十",
           "50": "五十", "60": "六十", "70": "七十", "80": "八十", "90": "九十"}
    for m in SPELLED.finditer(body):
        w = m.group(1).lower()
        key = w.split("-")[-1] if "-" in w else w.split()[-1]
        num = _WORDNUM.get(key)
        if not num or w in seen:
            continue
        seen.add(w)
        # ★ 「five thousand」「two hundred」「quarter of a million」：前半个词是乘数（2026-09-03 补）
        _ones = {"one": 1, "two": 2, "three": 3, "four": 4, "five": 5, "six": 6,
                 "seven": 7, "eight": 8, "nine": 9, "ten": 10}
        _head = w.split()[0] if " " in w else None
        if _head in _ones and key in ("hundred", "thousand", "million"):
            num = str(_ones[_head] * int(num))
        elif key in ("hundred", "thousand", "million"):
            _pre8 = body[max(0, m.start() - 14):m.start()].lower()
            if "quarter of a" in _pre8:
                num = str(int(num) // 4)
            elif "half a" in _pre8:
                num = str(int(num) // 2)
        blob = (facts + stand).replace(",", "").lower()
        # 「1.6 million」这类：前面有数字，按乘积去比
        _pre = body[max(0, m.start() - 8):m.start()]
        _pm = re.search(r"(\d+(?:\.\d+)?)\s*$", _pre)
        if _pm and key in ("million", "billion", "thousand"):
            _mult = {"million": 1e6, "billion": 1e9, "thousand": 1e3}[key]
            num = str(int(round(float(_pm.group(1)) * _mult)))
        if num in blob or w in blob or _cn.get(num, "\x00") in blob:
            continue
        i = m.start()
        hits.append((w, "（拼写）", body[max(0, i - 46):i + 34].replace("\n", " ")))
    return hits


def main():
    aid = sys.argv[1] if len(sys.argv) > 1 else None
    arts = load(aid)
    total = 0
    print("=" * 66)
    print("正文里有、而 facts 与导语里都没有的数 —— 只做分诊，不下判断")
    print("=" * 66)
    for art in arts:
        hits = scan(art)
        if not hits:
            continue
        total += len(hits)
        print("\n第%s篇 · %s" % (art["id"], art["title"]))
        for num, tail, ctx in hits:
            label = ("%s %s" % (num, tail)).strip()
            print("   %-14s …%s…" % (label, ctx))
    print("\n" + "-" * 66)
    print("合计 %d 处待人核。" % total)
    if total:
        print("**逐处判三种情形**：")
        print("  一 · **有据但漏记**  → 补进 facts（如第39篇的『黑栎』）")
        print("  二 · **为凑规范塞的** → 删（如第50篇的『三小时』『2 个弗隆』）")
        print("  三 · **核出来是错的** → 改（如第46篇的『14 年』实为 15 年）")
        print("**★ 工具只负责把该看的缩到这几十处；核实与判断仍由人做。**")


if __name__ == "__main__":
    main()
