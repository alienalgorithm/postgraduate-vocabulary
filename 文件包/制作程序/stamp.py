#!/usr/bin/env python3
"""Stamp the default-hidden attribution layer (v4 provenance.py) and prove: same page count, identical default
rendering at 40 dpi, and the layer becomes visible on every page when switched on."""
import hashlib, importlib.util, json, sys
import pymupdf
V4 = '/home/user/postgraduate-vocabulary/考研学人印刷版/2026-11-13-v4/制作程序/来源署名/provenance.py'
spec = importlib.util.spec_from_file_location('prov', V4); P = importlib.util.module_from_spec(spec); spec.loader.exec_module(P)

def stamp(src, out, label):
    P.stamp_pdf(src, out, source_commit=label)
    with pymupdf.open(src) as a, pymupdf.open(out) as b:
        assert len(a) == len(b)
        same = sum(1 for x, y in zip(a, b) if x.get_pixmap(dpi=40, alpha=False).samples == y.get_pixmap(dpi=40, alpha=False).samples)
        ui = next(u for u in b.layer_ui_configs() if u['text'] == P.LAYER_NAME); b.set_layer_ui_config(ui['number'], action=0)
        shown = sum(1 for x, y in zip(a, b) if x.get_pixmap(dpi=40, alpha=False).samples != y.get_pixmap(dpi=40, alpha=False).samples)
        r = {'pages': len(a), 'default_identical_pages': same, 'layer_visible_pages': shown}
    assert r['default_identical_pages'] == r['pages'] == r['layer_visible_pages'], r
    return r

if __name__ == '__main__':
    print(json.dumps(stamp(sys.argv[1], sys.argv[2], sys.argv[3]), ensure_ascii=False))
