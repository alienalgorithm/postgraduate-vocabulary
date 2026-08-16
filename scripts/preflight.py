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

run("markdown 构建与全部结构校验", "python3 scripts/build_markdown.py",
    lambda o: "全部通过" in o)
run("markdown 与数据层同步", "git diff --exit-code -- articles")
run("最终版本守卫（指纹 / 指标 / 批准来源）", "node scripts/final-version-guard.js",
    lambda o: "全部一致" in o)
insp = run("检察官（合规分）", "python3 scripts/inspector.py",
           lambda o: "硬伤合计 0 条" in o)
m = re.search(r"平均分 ([\d.]+)", insp)
if m:
    print(f"    平均合规分 {m.group(1)}")

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
