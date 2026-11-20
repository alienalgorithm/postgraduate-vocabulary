# Write the render config for a format (optionally scaled / with other spp) to work/rcfg_<fmt>.json
import json, os, sys
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.dirname(HERE)
fmt = sys.argv[1]; scale = float(sys.argv[2]) if len(sys.argv) > 2 else 1.0
spp = int(sys.argv[3]) if len(sys.argv) > 3 else None
R = dict(json.load(open(os.path.join(HERE, 'formats.json')))[fmt]['render'])
R['W'] = int(round(R['W'] * scale)); R['H'] = int(round(R['H'] * scale))
if spp: R['spp'] = spp
R['wordsDir'] = os.path.join(ROOT, 'work')
json.dump(R, open(os.path.join(ROOT, 'work', f'rcfg_{fmt}.json'), 'w'))
print(R['W'], R['H'], R['spp'])
