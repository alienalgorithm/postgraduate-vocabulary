#!/usr/bin/env python3
"""台账套话审计（雷 9）

立此审之由：「台账写套话」已犯三次——清掉 141 笔、8 笔、10 笔，
且第三次是在把这条规则写进提示词之后当场犯的。
提示词层面拦不住它，故一面在 polish.py 装闸门拦新的，一面用本脚本扫旧的。

    python3 scripts/audit_ledger.py          # 全库扫描
    python3 scripts/audit_ledger.py 35       # 单篇
"""
import os, re, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
THRESHOLD = 0.60


def shingles(t, k=6):
    t = re.sub(r"第\d+轮", "", t)
    t = re.sub(r"\s+", "", t)
    return {t[i:i + k] for i in range(max(0, len(t) - k + 1))}


def overlap(a, b):
    A, B = shingles(a), shingles(b)
    return len(A & B) / min(len(A), len(B)) if A and B else 0.0


def blocks(path):
    t = open(path, encoding="utf-8").read()
    out = []
    for blk in re.split(r"(?=### 第\d+轮)", t):
        m = re.match(r"### 第(\d+)轮", blk)
        if m:
            body = blk.split("\n", 1)[1] if "\n" in blk else ""
            if body.strip():
                out.append((int(m.group(1)), body))
    return out


def audit(aid):
    f = os.path.join(ROOT, "notes", f"精修台账-{aid}.md")
    if not os.path.exists(f):
        return None
    bs = blocks(f)
    groups, seen = [], set()
    for i, (n1, b1) in enumerate(bs):
        if n1 in seen:
            continue
        g = [n1]
        for n2, b2 in bs[i + 1:]:
            if n2 not in seen and overlap(b1, b2) >= THRESHOLD:
                g.append(n2); seen.add(n2)
        if len(g) > 1:
            seen.add(n1); groups.append((g, round(overlap(b1, bs[[x[0] for x in bs].index(g[1])][0] if False else 0)[0] if False else overlap(b1, dict(bs)[g[1]]) * 100)))
    return bs, groups


def main():
    ids = [sys.argv[1].zfill(2)] if len(sys.argv) > 1 else \
        sorted(f[-5:-3] for f in os.listdir(os.path.join(ROOT, "notes")) if f.startswith("精修台账-"))
    bad = tot = 0
    print("=" * 62)
    print("台账套话审计 · 雷 9（阈值 %d%% 重合）" % (THRESHOLD * 100))
    print("=" * 62)
    for aid in ids:
        r = audit(aid)
        if not r:
            continue
        bs, groups = r
        if not groups:
            continue
        print(f"\n第{aid}篇 · {len(bs)} 轮")
        for g, pct in groups:
            n = len(g) - 1
            bad += n; tot += 1
            print(f"  ✗ 第{'、'.join(map(str, g))}轮 备注重合 {pct}% —— {n} 笔应重跑")
    print()
    print("=" * 62)
    if bad:
        print(f"✗ 共 {tot} 组、{bad} 笔套话台账 —— 这些轮等于没跑，须逐轮重跑")
        sys.exit(1)
    print("✓ 无套话台账")


if __name__ == "__main__":
    main()
