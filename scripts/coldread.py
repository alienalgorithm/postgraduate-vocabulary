#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
冷读队列 —— 管理全项目唯一一件受时间约束的活。

**为什么需要它**
第13轮极限轮的判据是「不读台账、只读正文冷读」。
实测两条规律（写在《总令》第四节）：
    隔一次会话跑最准 —— 第32篇翻案 1 处、第33篇 3 处；
    同场跑的一律零翻案，**而那个零是假的**。
问题在于：**一次会话里做不成这件事，而跨会话又没人记得欠了哪几篇。**
于是 38 篇里积了 30 多篇标着「非隔会话，可信度低」的第13轮。

**这个脚本做的事**
从台账里认出哪些篇的极限轮还没真正跑过，按「欠了多久」排序，
每次吐出一批，并把领取记录写进 notes/冷读队列.json。
下次开新会话，只要发「冷读」，它就说得出这次该读哪几篇、上次隔了多久。

用法：
    python3 scripts/coldread.py            # 看队列全貌
    python3 scripts/coldread.py next       # 领一批（默认 6 篇）
    python3 scripts/coldread.py next -n 3  # 领 3 篇
    python3 scripts/coldread.py done 16    # 第16篇冷读跑完，销账
    python3 scripts/coldread.py check 16   # 只查某篇当前状态
"""

import argparse
import datetime as dt
import json
import os
import re
import subprocess
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
LEDGER = os.path.join(ROOT, "notes", "精修台账-%s.md")
STATE = os.path.join(ROOT, "notes", "冷读队列.json")

# 一批的默认篇数。取 6 是因为：一次会话真读六篇正文（约 1600 词）
# 还留得下逐处判、改、记账、封版的余量；再多就会开始糊弄。
BATCH = 6

# 台账里「这一轮不算数」的记号。三种写法都要认——
# 实测台账标题行有三种格式、状态标注有四类。
FAKE = ("非隔会话", "同场", "可信度低", "仍欠", "留待下次会话")
# 「这一轮算数」的记号。写了这些才判为真跑过。
REAL = ("隔会话独立盲审", "隔一次会话", "跨会话")


# ── 读台账 ────────────────────────────────────────────────────────────
def articles():
    """按篇号列出所有有台账的篇。"""
    out = []
    for k in range(1, 100):
        aid = "%02d" % k
        if os.path.exists(LEDGER % aid):
            out.append(aid)
    return out


def round13(aid):
    """取出第13轮那一节的正文；没有则返回 None。"""
    try:
        t = open(LEDGER % aid, encoding="utf-8").read()
    except FileNotFoundError:
        return None
    m = re.search(r"^### 第13轮.*?(?=^### |\Z)", t, re.S | re.M)
    return m.group(0) if m else None


def touched(aid):
    """台账最后一次提交的时间 —— 用它当「上次判断」的锚点。

    不另建时间戳文件：git 的提交时间是既有的、不会被我改错的事实。
    工作区未提交时回落到文件 mtime。
    """
    p = LEDGER % aid
    r = subprocess.run(["git", "log", "-1", "--format=%cI", "--", p],
                       cwd=ROOT, capture_output=True, text=True)
    s = r.stdout.strip()
    if s:
        try:
            return dt.datetime.fromisoformat(s).astimezone(dt.timezone.utc)
        except ValueError:
            pass
    try:
        return dt.datetime.fromtimestamp(os.path.getmtime(p), dt.timezone.utc)
    except OSError:
        return None


def status(aid):
    """判一篇的冷读状态。

    返回 (状态, 说明)：
        missing  —— 连第13轮都还没记
        fake     —— 记了，但明写是同场跑
        unmarked —— 记了，却没说清是不是隔会话（当作未跑，宁可多读一遍）
        real     —— 真的隔会话跑过
    """
    b = round13(aid)
    if b is None:
        return "missing", "第13轮尚未记入台账"
    if any(k in b for k in REAL) and not any(k in b for k in FAKE):
        return "real", "已隔会话跑过"
    if any(k in b for k in FAKE):
        return "fake", "台账明写「非隔会话」"
    # ★ 兜底：翻案 ≥1 处说明冷读真的起了作用，不论当初有没有标注隔会话。
    # 立此之由：第33篇未标注，却实打实翻出 2 处（都是减法轮削坏的）——
    # **翻出东西本身就是「读得够冷」的证据，比标注更硬。**
    m = re.search(r"翻案\s*(\d+)\s*处", b)
    if m and int(m.group(1)) >= 1:
        return "real", "翻出 %s 处，冷读确已起作用" % m.group(1)
    return "unmarked", "未标注是否隔会话（保守当作未跑）"


# ── 领取记录 ──────────────────────────────────────────────────────────
def load_state():
    if os.path.exists(STATE):
        try:
            return json.load(open(STATE, encoding="utf-8"))
        except (json.JSONDecodeError, OSError):
            pass
    return {"issued": {}, "cleared": {}}


def save_state(st):
    os.makedirs(os.path.dirname(STATE), exist_ok=True)
    json.dump(st, open(STATE, "w", encoding="utf-8"),
              ensure_ascii=False, indent=2)


def now():
    return dt.datetime.now(dt.timezone.utc)


def age_h(t):
    return None if t is None else (now() - t).total_seconds() / 3600


def human(h):
    if h is None:
        return "未知"
    if h < 1:
        return "不到一小时"
    if h < 48:
        return "%d 小时" % int(h)
    return "%d 天" % int(h // 24)


# ── 队列 ──────────────────────────────────────────────────────────────
def survey():
    """全库扫一遍，返回每篇的状态与欠了多久。"""
    rows = []
    for aid in articles():
        stt, why = status(aid)
        t = touched(aid)
        rows.append({"aid": aid, "status": stt, "why": why,
                     "touched": t, "age": age_h(t)})
    return rows


def pending(rows):
    """待冷读的篇，按欠得最久的排前面。"""
    p = [r for r in rows if r["status"] != "real"]
    p.sort(key=lambda r: -(r["age"] or 0))
    return p


def cmd_list(_):
    rows = survey()
    p = pending(rows)
    done = len(rows) - len(p)
    print("=" * 64)
    print("冷读队列 · 全库 %d 篇" % len(rows))
    print("=" * 64)
    print("  已隔会话跑过 %d 篇 · 待冷读 %d 篇" % (done, len(p)))
    if not p:
        print("\n  ✓ 全部跑完，队列为空。")
        return
    st = load_state()
    print("\n  待冷读（欠得最久的排前面）：")
    for r in p[:12]:
        iss = st["issued"].get(r["aid"])
        tag = ""
        if iss:
            try:
                ih = age_h(dt.datetime.fromisoformat(iss).astimezone(dt.timezone.utc))
                tag = "　（已领取，距今 %s）" % human(ih)
            except ValueError:
                pass
        print("    %s篇  欠了 %-8s  %s%s"
              % (r["aid"], human(r["age"]), r["why"], tag))
    if len(p) > 12:
        print("    …… 另有 %d 篇" % (len(p) - 12))
    print("\n  下一步：python3 scripts/coldread.py next")


def cmd_next(args):
    rows = survey()
    p = pending(rows)
    if not p:
        print("✓ 队列为空，无需冷读。")
        return
    st = load_state()

    # ★★ 该拦的是「会话」，不是「篇」。
    # 第一版只跳过刚领过的那几篇，于是接着发下一批——
    # **等于同一次会话能把全库领完，队列形同虚设。**
    # 冷读的全部价值就在时间间隔上：这一次会话里已经领过，就不该再领第二批。
    MIN_GAP = 6
    last = st.get("last_issue")
    if last and not args.force:
        try:
            h = age_h(dt.datetime.fromisoformat(last).astimezone(dt.timezone.utc))
            if h is not None and h < MIN_GAP:
                prev = st.get("last_batch", [])
                print("✗ 距上次领取只有 %s，还在同一次会话里。" % human(h))
                if prev:
                    print("  上一批领的是：%s" % "、".join(p_ + "篇" for p_ in prev))
                print("\n  **冷读的全部价值就在时间间隔上——"
                      "同一会话里再领一批，读出来的还是假的零翻案。**")
                print("  先把上一批跑完销账，换个时间再来领下一批。")
                print("  （确要强行领取：加 --force，但台账须如实标注条件不满足）")
                sys.exit(1)
        except ValueError:
            pass

    n = args.n or BATCH
    batch = p[:n]
    ts = now().isoformat()
    for r in batch:
        st["issued"][r["aid"]] = ts
    st["last_issue"] = ts
    st["last_batch"] = [r["aid"] for r in batch]
    save_state(st)

    print("=" * 64)
    print("本批冷读 · %d 篇" % len(batch))
    print("=" * 64)
    for r in batch:
        print("  %s篇   欠了 %-8s  %s" % (r["aid"], human(r["age"]), r["why"]))
    print("""
  **怎么读**（《总令》第四节·第13轮）：
    · 不读台账里的任何理由，只打开 articles/ 下的正文冷读
    · 本轮之前的改动同样要过冷读
    · 零翻案是正当结论，但**须逐处写明查了哪几处、为什么判为保留**

  跑完一篇销账：python3 scripts/coldread.py done NN""")


def cmd_done(args):
    aid = "%02d" % int(args.aid)
    stt, why = status(aid)
    b = round13(aid)
    if b is None:
        print("✗ 第%s篇还没有第13轮，无法销账。" % aid)
        sys.exit(1)
    # ★ 销账的判据必须与 status() 完全一致 —— 否则会出现
    # 「status 判为 real、销账却拒收」的自相矛盾（第33篇实测踩到）。
    # 一律走同一个函数，不另立标准。
    if stt != "real":
        print("✗ 第%s篇销不了账：%s" % (aid, why))
        if stt == "fake":
            print("  **先把第13轮那一节重写成真的隔会话冷读，再来销。**")
        elif stt == "unmarked":
            print("  **须在那一节写明「隔会话」及距上次判断多久**，"
                  "或如实报出翻案几处——否则下次没人知道它算不算数。")
        else:
            print("  **第13轮尚未记入台账。**")
        sys.exit(1)
    st = load_state()
    st["cleared"][aid] = now().isoformat()
    st["issued"].pop(aid, None)
    save_state(st)
    left = len(pending(survey()))
    print("✓ 第%s篇冷读已销账。队列还剩 %d 篇。" % (aid, left))


def cmd_check(args):
    aid = "%02d" % int(args.aid)
    stt, why = status(aid)
    t = touched(aid)
    print("第%s篇 · %s · %s · 台账最后改动距今 %s"
          % (aid, stt, why, human(age_h(t))))


def main():
    ap = argparse.ArgumentParser(description="冷读队列")
    sub = ap.add_subparsers(dest="cmd")
    sub.add_parser("list")
    n = sub.add_parser("next")
    n.add_argument("-n", type=int, default=0)
    n.add_argument("--force", action="store_true",
                   help="同一会话内强行再领一批（台账须如实标注条件不满足）")
    d = sub.add_parser("done")
    d.add_argument("aid")
    c = sub.add_parser("check")
    c.add_argument("aid")
    a = ap.parse_args()
    {"next": cmd_next, "done": cmd_done, "check": cmd_check}.get(
        a.cmd, cmd_list)(a)


if __name__ == "__main__":
    main()
