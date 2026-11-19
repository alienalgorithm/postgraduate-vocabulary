#!/usr/bin/env python3
# evaluate single joins i->j (4 bars each side) with several crossfades
import sys, json, itertools, numpy as np
from lib import *
from render import render
from seams import check
def ev(i, j, cfgs, ctx=3, tail=0):
    out = []
    for cfg in cfgs:
        a0 = max(1, i - ctx)
        spec = {"segments": [{"bars": [a0, i], **({"tail_bars": tail} if tail else {})}, {"bars": [j, min(65, j + ctx)]}], "xf": {"1": cfg}}
        y, info = render(spec)
        rows, bad = check(y, info, verbose=False)
        r = rows[0]; r['cfg'] = cfg; out.append(r)
    return out
def show(rs):
    for r in rs:
        c = r['cfg']
        print(f"{r['join']:>7s} {c['len']*1000:4.0f}{c['place'][0]} rho {r['rho']:5.2f} jump {r['jump']:.3f}/{r['jump_nat']:.3f} click {r['click']:4.1f}/{r['click_nat']:4.1f} "
              f"dip {r['dip']:5.2f} bump {r['bump']:4.2f} | fs {r['flux_s']:4.2f}({r['nat_s']:4.2f}) {r['pct_s']:3.0f} | fb {r['flux_b']:4.2f}({r['nat_b']:4.2f}) {r['pct_b']:3.0f} | lag {r['pulse_ms']:5.1f} c {r['pulse_c']:.2f} {','.join(r['fail'])}")
CF = [dict(len=0.04, place='pre', pre_ms=10), dict(len=0.156, place='pre', pre_ms=10), dict(len=0.3125, place='pre', pre_ms=10),
      dict(len=0.625, place='pre', pre_ms=10), dict(len=0.156, place='center'), dict(len=0.625, place='center')]
if __name__ == '__main__':
    for p in sys.argv[1:]:
        i, j = map(int, p.split('-'))
        show(ev(i, j, CF)); print()
