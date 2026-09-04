#!/usr/bin/env python3
"""readers.py —— 审读团 bot：五个观众各是一次独立的模型调用，各读一遍，脚本汇总、升级、写报告。

用法：
  python3 scripts/readers.py 70                  # 打印阅读包（观众一二三只见英文；四五见中英）
  python3 scripts/readers.py 70 --init           # 生成 notes/审读-70.md 骨架（人读时用）
  python3 scripts/readers.py 70 --run            # ★ bot：五次独立调用 → notes/审读-70.md（需要 ANTHROPIC_API_KEY）
  python3 scripts/readers.py 70 --run --dry-run  # 只打印五个观众的完整提示，不调用
  python3 scripts/readers.py 70 --run --repeat 2 # 每个观众跑两遍，交集为稳定发现
  python3 scripts/readers.py --status            # 哪些篇已审、各有几条 A/B

★ 为什么是五次独立调用而不是一次：每个观众一个上下文，互不知情——本科生不知道评鉴师看到了什么。
  同一观众可重复跑，只留两遍都报的句子。汇总由脚本做（同一句被 ≥2 个观众点到 → 升一级），不再调模型。
★ 每个观众的系统提示 = notes/审读团.md 里它自己那一节 + 总规则；输出为 JSON 发现列表，字段：para / quote / problem / fix / grade。
★ 模型默认 claude-sonnet-5（可 --model 改）。密钥从环境变量 ANTHROPIC_API_KEY 读；这个沙箱里没有，只能 dry-run。
"""
import os
import re
import sys
import json
import time
import subprocess
import urllib.request

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BOLD = re.compile(r"\*\*([^*]+)\*\*")
CHARTER = os.path.join(ROOT, "notes", "审读团.md")
READERS = [
    ("一", "专业英文评鉴师", False),
    ("二", "英语母语读者", False),
    ("三", "博士", False),
    ("四", "硕士生", True),
    ("五", "本科生", True),
]
API = "https://api.anthropic.com/v1/messages"


# ── 数据 ────────────────────────────────────────────────────────────
def load_all():
    js = ('globalThis.window=globalThis;'
          + ''.join('require(%s);' % json.dumps(os.path.join(ROOT, 'data', f))
                    for f in sorted(os.listdir(os.path.join(ROOT, 'data'))) if f.endswith('.js'))
          + 'process.stdout.write(JSON.stringify(globalThis.SITE.ARTICLES))')
    out = subprocess.run(['node', '-e', js], capture_output=True, text=True, cwd=ROOT).stdout
    return {a['id']: a for a in json.loads(out)}


def packet(a, with_zh):
    lines = ["第%s篇 · %s" % (a['id'], a['title']), ""]
    for i, p in enumerate(a['paras'], 1):
        lines.append("§%d %s" % (i, p['en']))
        if with_zh:
            lines.append("　　%s" % p['zh'])
        lines.append("")
    return "\n".join(lines)


def charter_sections():
    t = open(CHARTER, encoding='utf-8').read()
    parts = re.split(r"\n## ", t)
    sec = {}
    for p in parts:
        head, _, body = p.partition("\n")
        sec[head.strip()] = body.strip()
    return sec


def system_prompt(k, name):
    sec = charter_sections()
    mine = next(v for h, v in sec.items() if h.startswith("观众%s" % k))
    rules = sec.get("总规则", "")
    return (
        "你是审读团的一个观众，读一篇 270 词、含 50 个加粗重点词的中英双语考研词汇文章。\n"
        "只按下面这个观众的身份、读法和判据读；不替作者找理由；没有句的意见不算发现。\n\n"
        "【总规则】\n" + rules + "\n\n"
        "【你是谁、怎么读、盯什么】\n观众%s · %s\n%s\n\n"
        "【输出格式】只输出一个 JSON 数组，不要别的文字。每个元素：\n"
        '{"para": 段号(整数), "quote": "原句片段（原样抄，含加粗星号）", "problem": "问题（用你这个观众的口气）", '
        '"fix": "改法（给具体改后的英文；没有就写空串）", "grade": "A|B|C"}\n'
        "读完没有发现就输出 []。" % (k, name, mine)
    )


# ── 调用 ────────────────────────────────────────────────────────────
def call(system, user, model, key):
    body = json.dumps({
        "model": model,
        "max_tokens": 4000,
        "temperature": 0.2,
        "system": system,
        "messages": [{"role": "user", "content": user}],
    }).encode("utf-8")
    req = urllib.request.Request(API, data=body, headers={
        "Content-Type": "application/json",
        "x-api-key": key,
        "anthropic-version": "2023-06-01",
    })
    for attempt in range(3):
        try:
            with urllib.request.urlopen(req, timeout=120) as r:
                data = json.loads(r.read().decode("utf-8"))
            return "".join(b.get("text", "") for b in data.get("content", []) if b.get("type") == "text")
        except Exception as e:  # noqa: BLE001
            if attempt == 2:
                raise
            time.sleep(3 * (attempt + 1))


def parse_findings(text):
    text = text.strip()
    text = re.sub(r"^```(?:json)?|```$", "", text, flags=re.M).strip()
    m = re.search(r"\[.*\]", text, re.S)
    if not m:
        return []
    try:
        arr = json.loads(m.group(0))
    except json.JSONDecodeError:
        return []
    out = []
    for f in arr:
        if not isinstance(f, dict):
            continue
        g = str(f.get("grade", "C")).strip().upper()[:1]
        out.append({"para": int(f.get("para", 0) or 0), "quote": str(f.get("quote", "")).strip(),
                    "problem": str(f.get("problem", "")).strip(), "fix": str(f.get("fix", "")).strip(),
                    "grade": g if g in "ABC" else "C"})
    return out


# ── 汇总（确定性，不调模型）────────────────────────────────────────
def _key(q):
    q = BOLD.sub(r"\1", q).lower()
    return re.sub(r"[^a-z0-9 ]", "", q).split()


def _overlap(a, b):
    a, b = _key(a), _key(b)
    if not a or not b:
        return False
    sa = {" ".join(a[i:i + 4]) for i in range(max(1, len(a) - 3))}
    sb = {" ".join(b[i:i + 4]) for i in range(max(1, len(b) - 3))}
    return bool(sa & sb) or (" ".join(a) in " ".join(b)) or (" ".join(b) in " ".join(a))


UP = {"C": "B", "B": "A", "A": "A"}


def merge(reports):
    """reports: {观众号: [findings]} → 汇总行：同一段、片段重叠的合为一句；≥2 个观众 → 升一级。"""
    rows = []
    for k, fs in reports.items():
        for f in fs:
            for r in rows:
                if r["para"] == f["para"] and _overlap(r["quote"], f["quote"]):
                    r["who"].add(k)
                    r["grades"].append(f["grade"])
                    if f["fix"] and not r["fix"]:
                        r["fix"] = f["fix"]
                    break
            else:
                rows.append({"para": f["para"], "quote": f["quote"], "who": {k}, "grades": [f["grade"]], "fix": f["fix"]})
    for r in rows:
        best = min(r["grades"])          # A < B < C
        r["grade"] = UP[best] if len(r["who"]) >= 2 else best
        if {"二", "五"} <= r["who"]:      # 母语者与本科生同时停 → 必改
            r["grade"] = "A"
    order = {"A": 0, "B": 1, "C": 2}
    rows.sort(key=lambda r: (order[r["grade"]], r["para"]))
    return rows


def write_report(a, reports, rows, model, repeat):
    s = ["# 审读 · 第%s篇《%s》" % (a['id'], a['title']), "",
         "> bot 生成：五个观众各一次独立调用（模型 %s，每观众 %d 遍），汇总由脚本按章程做。章程：notes/审读团.md。" % (model, repeat), ""]
    for k, name, _ in READERS:
        s += ["## 观众%s · %s" % (k, name), ""]
        fs = reports.get(k, [])
        if not fs:
            s += ["（无发现）", ""]
        for i, f in enumerate(fs, 1):
            s.append("%d. §%d «%s» %s%s【%s】" % (i, f["para"], f["quote"], f["problem"],
                                                   ("　改：%s" % f["fix"]) if f["fix"] else "", f["grade"]))
        s.append("")
    s += ["## 汇总", "", "| 句 | 谁点到 | 等级 | 改法 |", "|---|---|---|---|"]
    for r in rows:
        s.append("| §%d %s | %s | %s | %s |" % (r["para"], r["quote"].replace("|", "｜"), "".join(sorted(r["who"])),
                                              ("**A**" if r["grade"] == "A" else r["grade"]), r["fix"].replace("|", "｜")))
    na = sum(1 for r in rows if r["grade"] == "A")
    s += ["", "**%d 处 A，%d 处 B。**" % (na, sum(1 for r in rows if r["grade"] == "B")), "", "## 改动", "", "（改了什么，lockstep 是否等长，检察官分数）", ""]
    path = os.path.join(ROOT, 'notes', '审读-%s.md' % a['id'])
    open(path, 'w', encoding='utf-8').write("\n".join(s))
    return path, na


def run(aid, model, dry, repeat):
    a = load_all()[aid]
    key = os.environ.get("ANTHROPIC_API_KEY", "")
    reports = {}
    for k, name, with_zh in READERS:
        sysp = system_prompt(k, name)
        user = packet(a, with_zh)
        if dry:
            print("=" * 70); print("观众%s · %s ── 系统提示" % (k, name)); print("=" * 70); print(sysp)
            print("-" * 70); print("用户消息（阅读包）"); print("-" * 70); print(user)
            continue
        if not key:
            sys.exit("没有 ANTHROPIC_API_KEY。这个沙箱里没有密钥；在本机 export 后再跑，或先 --dry-run 看提示。")
        runs = []
        for _ in range(repeat):
            runs.append(parse_findings(call(sysp, user, model, key)))
            time.sleep(1)
        if repeat > 1:   # 交集：两遍都点到的句子才留
            stable = []
            for f in runs[0]:
                if all(any(f["para"] == g["para"] and _overlap(f["quote"], g["quote"]) for g in other) for other in runs[1:]):
                    stable.append(f)
            reports[k] = stable
        else:
            reports[k] = runs[0]
        print("观众%s · %s：%d 条" % (k, name, len(reports[k])))
    if dry:
        return
    rows = merge(reports)
    path, na = write_report(a, reports, rows, model, repeat)
    print("已写：%s　　A×%d" % (os.path.relpath(path, ROOT), na))


# ── 其余 ────────────────────────────────────────────────────────────
def skeleton(a):
    s = ["# 审读 · 第%s篇《%s》" % (a['id'], a['title']), "",
         "> 章程：notes/审读团.md。每条发现：§段 + 原句片段 + 问题 + 改法 + 等级（A 必改／B 应改／C 可改）。", ""]
    for k, name, _ in READERS:
        s += ["## 观众%s · %s" % (k, name), "", "（逐条）", ""]
    s += ["## 汇总", "", "| 句 | 谁点到 | 等级 | 改法 |", "|---|---|---|---|", "", "## 改动", "", ""]
    return "\n".join(s)


def status():
    rows = []
    for f in sorted(os.listdir(os.path.join(ROOT, 'notes'))):
        m = re.match(r"审读-(\d+)\.md$", f)
        if not m:
            continue
        t = open(os.path.join(ROOT, 'notes', f), encoding='utf-8').read()
        a_ = len(re.findall(r"\|\s*\*\*A\*\*\s*\|", t)) + len(re.findall(r"\|\s*A\s*\|", t))
        b_ = len(re.findall(r"\|\s*B\s*\|", t))
        rows.append((m.group(1), a_, b_, "bot" if "bot 生成" in t else "人读"))
    print("已审 %d 篇" % len(rows))
    for aid, a_, b_, how in rows:
        print("  第%s篇  A×%d  B×%d  （%s）" % (aid, a_, b_, how))


def main():
    args = sys.argv[1:]
    if "--status" in args:
        return status()
    aid = [x for x in args if x.isdigit()][0].zfill(2)
    if "--run" in args:
        model = args[args.index("--model") + 1] if "--model" in args else "claude-sonnet-5"
        repeat = int(args[args.index("--repeat") + 1]) if "--repeat" in args else 1
        return run(aid, model, "--dry-run" in args, repeat)
    a = load_all()[aid]
    if "--init" in args:
        path = os.path.join(ROOT, 'notes', '审读-%s.md' % aid)
        if os.path.exists(path):
            print("已存在：", os.path.relpath(path, ROOT))
        else:
            open(path, 'w', encoding='utf-8').write(skeleton(a))
            print("已建：", os.path.relpath(path, ROOT))
        return
    print(packet(a, False)); print("=" * 70); print(packet(a, True))


if __name__ == "__main__":
    main()
