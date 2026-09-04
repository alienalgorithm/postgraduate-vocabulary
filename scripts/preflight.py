#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
起飞前检查 · preflight
=====================
推送前跑这一个命令就够了。

存在的理由：本会话出现过两次「本地全绿、CI 却红」——
指标改一次要同步三处，其中 .github/workflows 里的硬编码期望值本地根本跑不到。
本脚本把 CI 里的每一步都在本地复跑一遍，包括那一步。

    python3 scripts/preflight.py
"""
import json, os, re, subprocess, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
os.chdir(ROOT)
BAR = "─" * 66
fails = []

def run(name, cmd, ok_if=None):
    r = subprocess.run(cmd, shell=True, capture_output=True, text=True, timeout=300)
    out = (r.stdout + r.stderr).strip()
    good = (r.returncode == 0) if ok_if is None else ok_if(out)
    print(f"{'✓' if good else '✗'} {name}")
    if not good:
        fails.append(name)
        print("\n".join("    " + l for l in out.splitlines()[-12:]))
    return out

print(BAR); print("起飞前检查"); print(BAR)

run("工具回归测试（锁住每个已修缺陷）", "python3 scripts/test_tools.py",
    lambda o: "失败 0" in o)
# ★《总令》里的数是脚本从库里注进去的，不是手写的。
# 库变了而没刷新，下次会话就会从过期的地图出发——**实测手工更新的数，
# 两遍都在一小时内就旧了**，故挂进 preflight，过期即红。
run("《总令》与库同步", "python3 scripts/render_charter.py --check",
    lambda o: "与库同步" in o)
run("markdown 构建与全部结构校验", "python3 scripts/build_markdown.py",
    lambda o: "全部通过" in o)
run("markdown 与数据层同步", "git diff --exit-code -- articles")
run("意群对齐检查员（每篇 reader/aNN.json 零 A 级）",
    "python3 scripts/check_chunks.py --selftest >/dev/null && for f in reader/a[0-9][0-9].json; do [ -e \"$f\" ] || continue; n=$(basename $f .json); python3 scripts/check_chunks.py ${n#a} --quiet >/dev/null || exit 1; done")
run("学习大纲与数据层同步", "python3 scripts/syllabus.py >/dev/null && git diff --exit-code -- exports/syllabus.json exports/学习大纲.md")
run("Anki 导出与数据层同步", "python3 scripts/export_anki.py >/dev/null && git diff --exit-code -- exports/anki-3500.tsv")
# **写 manifest 前必须先跑 build_markdown。** 顺序颠倒会导致指纹对不上：
# manifest 记的是写入时刻的 markdown 指纹，若之后 markdown 又被重建，
# 本地 guard 可能因缓存通过，而 CI 从零构建必红。2026-08-16 第10篇实际踩到。
run("最终版本守卫（指纹 / 指标 / 批准来源）", "node scripts/final-version-guard.js",
    lambda o: "全部一致" in o)
insp = run("检察官（合规分）", "python3 scripts/inspector.py",
           lambda o: "硬伤合计 0 条" in o)
m = re.search(r"平均分 ([\d.]+)", insp)
if m:
    print(f"    平均合规分 {m.group(1)}")

# ── 95 分门槛（2026-09-01 立）─────────────────────────────────────
# **立此闸之由**：用户读出后几篇「读都读不通顺，写得太懒」，量过之后属实——
#   **第01—20篇均分 95.0、第21—35篇 94.0，而第36—45篇 86.8、第46—54篇 82.7**；
#   **前 35 篇有 26 篇拿到 94 分以上，后 19 篇一篇都没有。**
# **病根是我在填格子**：每轮「补 5 个名额、削 8 词」，来回二十次，句子被磨钝。
#   而《总令》早写着「指标是用来找病灶的，不是用来达标的」。
# **故立此闸：任何一篇低于 95 分即红，推不上去。**
# **★ 但要写明这条闸的限度**：合规分衡量的是**待核条数**（每条扣 3 分），
#   **不是文章好坏**。修它的正确做法是**逐条判「该修还是该保留」**，
#   而不是为消掉报出去改坏句子——**后者正是这条闸要防的那个病本身。**
# ★★ 闸口须认「已写进 facts 的保留判断」，否则它会永远红下去——
#   **而永远红的闸等于没有闸。**（2026-09-01 第49篇之后补）
#   **但豁免必须留痕、可审**：只有在该篇 facts 里同时写了
#   「⚠」「判为保留」与那条规则的编号，才算数。
#   **口头说「判为保留」不作数，必须写进仓库。**
#   现有三篇五条：第19篇 STR-03、第49篇 ANC-02/BAL-02、第51篇 BAL-02b/FIT-02。
_KEEP = {}
try:
    _kjs = ("globalThis.window=globalThis;"
            + "".join("require(%s);" % json.dumps(os.path.join(ROOT, "data", _f))
                      for _f in sorted(os.listdir(os.path.join(ROOT, "data")))
                      if _f.endswith(".js"))
            + "process.stdout.write(JSON.stringify(globalThis.SITE.ARTICLES))")
    for _a in json.loads(subprocess.run(["node", "-e", _kjs], cwd=ROOT,
                                        capture_output=True, text=True).stdout):
        _f = " ".join(_a.get("facts") or [])
        if "⚠" in _f and "判为保留" in _f:
            _KEEP[_a["id"]] = set(re.findall(r"\b([A-Z]{2,4}-\d{2}[a-z]?)\b", _f))
except Exception:
    pass

# ★ 从 core 取，全库只此一份（2026-09-02 同源第八处）
sys.path.insert(0, os.path.join(ROOT, "scripts"))
import core as _core
_SCORE_FLOOR = _core.SCORE_FLOOR
_low = []
for _ln in insp.splitlines():
    _mm = re.match(r"\s*(\d\d) · .*合规分 (\d+)/100", _ln)
    if _mm and int(_mm.group(2)) < _SCORE_FLOOR:
        _aid = _mm.group(1)
        if _KEEP.get(_aid):
            print("  · 第%s篇 %d 分 —— facts 里已写明保留判断（%s），豁免"
                  % (_aid, int(_mm.group(2)), "、".join(sorted(_KEEP[_aid]))))
            continue
        _low.append((_aid, int(_mm.group(2))))
if _low:
    print("✗ 合规分门槛（每篇须 ≥ %d）" % _SCORE_FLOOR)
    print("    %d 篇未达标：%s" % (len(_low),
          "、".join("第%s篇 %d" % x for x in _low[:12])
          + ("……" if len(_low) > 12 else "")))
    print("    **逐条判「该修还是该保留」，不要为消掉报出而改坏句子。**")
    fails.append("合规分门槛（每篇须 ≥ %d）" % _SCORE_FLOOR)
else:
    print("✓ 合规分门槛（每篇须 ≥ %d）" % _SCORE_FLOOR)

# ── 快照覆盖：没有快照 = REG 层静默失效 ────────────────────────────
import glob as _g
_snapdir = os.path.join(ROOT, "notes/.regress")
_have = {os.path.basename(x)[:2] for x in _g.glob(os.path.join(_snapdir, "*.json"))}
_all = {a["id"] for a in arts_all} if "arts_all" in dir() else set()
if not _all:
    _js = ("globalThis.window=globalThis;const p=require('path'),f=require('fs');"
           "require(p.resolve('data/articles.js'));"
           "for(const x of f.readdirSync('data').filter(y=>/^article-\\d+\\.js$/.test(y)).sort())"
           "require(p.resolve('data',x));process.stdout.write(JSON.stringify(SITE.ARTICLES))")
    _all = {a["id"] for a in json.loads(subprocess.run(["node", "-e", _js],
            capture_output=True, text=True).stdout)}
_miss = sorted(_all - _have)
if _miss:
    print(f"⚠ {len(_miss)} 篇无快照，这些篇的 REG 回归层未启用：{'、'.join(_miss)}")
    print("   要改哪篇，先跑：python3 scripts/regress.py <篇号> snapshot")
else:
    print(f"✓ 快照覆盖 {len(_have)}/{len(_all)} 篇，REG 回归层全部启用")

# ── CI 独有的一步：工作流里对 16—20 篇写死的期望值 ──────────────────
print(BAR); print("CI 独有检查（本地跑不到、最容易漏的一步）"); print(BAR)
wf = open(".github/workflows/validate-content.yml", encoding="utf-8").read()
exp = {a: (int(w), float(d)) for a, w, d in
       re.findall(r"'(\d\d)': \{ words: (\d+), keywords: 50, density: ([\d.]+)", wf)}
js = ("globalThis.window=globalThis;const p=require('path'),f=require('fs');"
      "require(p.resolve('data/articles.js'));"
      "for(const x of f.readdirSync('data').filter(y=>/^article-\\d+\\.js$/.test(y)).sort())"
      "require(p.resolve('data',x));process.stdout.write(JSON.stringify(SITE.ARTICLES))")
arts = {a["id"]: a for a in json.loads(
    subprocess.run(["node", "-e", js], capture_output=True, text=True).stdout)}
bad = [(k, exp[k], (arts[k]["metrics"]["words"], arts[k]["metrics"]["density"]))
       for k in exp if (arts[k]["metrics"]["words"], arts[k]["metrics"]["density"]) != exp[k]]
if bad:
    fails.append("工作流硬编码指标")
    print("✗ 工作流硬编码指标与数据层不符")
    for k, e, g in bad:
        print(f"    {k}: 工作流写 {e}，实际 {g}")
else:
    print(f"✓ 工作流硬编码指标（{len(exp)} 篇）与数据层一致")

# ── 指标一改要同步的三处，一次列清 ─────────────────────────────────
print(BAR)
if fails:
    print("未通过：" + " / ".join(fails))
    print("\n提醒：任何一篇的 words/density 一改，必须同步三处——")
    print("  1. data/*.js 的 metrics")
    print("  2. scripts/final-version-guard.js 里 README / 交接文档的行校验")
    print("  3. .github/workflows/validate-content.yml 里 16—20 篇的硬编码期望值")
    sys.exit(1)
print("全部通过，可以推送。")
