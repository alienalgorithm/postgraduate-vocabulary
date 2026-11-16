"""Exact re-implementation of the official run.py voice_end() (5 ms RMS, -60/-70/-80 dB)."""
import subprocess, sys, json
import numpy as np
def voice_end(path):
    raw = subprocess.run(['ffmpeg','-v','error','-i',path,'-map','0:a:0','-ac','1','-ar','48000','-f','f32le','-'],
                         check=True, capture_output=True).stdout
    pcm = np.frombuffer(raw, dtype=np.float32).astype(np.float64)
    hop = 240
    n = len(pcm) // hop
    start = max(0, n - 1000)
    power = (pcm[:n*hop].reshape(n, hop) ** 2).sum(axis=1) / hop
    ends = {}
    for thr in (-60, -70, -80):
        idx = [i for i in range(start, n) if power[i] > 10 ** (thr / 10)]
        assert idx, 'No speech detected near the end.'
        ends[str(thr)] = (idx[-1] + 1) * hop / 48000
    assert abs(ends['-80'] - ends['-70']) < .06, ('Uncertain voice endpoint', ends)
    return max(ends.values()), ends, len(pcm)
if __name__ == '__main__':
    for p in sys.argv[1:]:
        end, ends, ns = voice_end(p)
        print(json.dumps({'file': p.split('/')[-1], 'speech_end': end, 'ends': ends, 'samples': ns}))
