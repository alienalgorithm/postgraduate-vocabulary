# resample the 44.1 kHz edit to 48 kHz (soxr), trim to exactly TOTAL*48000 samples, low-end mono fix
# usage: python3 -I stage1.py <edit_441.npy> <workdir> <fixed_48.npy>
import sys, subprocess, numpy as np, scipy.signal as ss, soundfile as sf
edit, work, outp = sys.argv[1:4]
SR0, SR, TOTAL = 44100, 48000, 169.342
NT = int(round(TOTAL * SR)); assert NT == 8128416
y = np.load(edit)
sf.write(f'{work}/edit_441.wav', y, SR0, subtype='DOUBLE')
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', f'{work}/edit_441.wav', '-af',
                'aresample=48000:resampler=soxr:precision=33:dither_method=0', '-c:a', 'pcm_f64le',
                f'{work}/edit_48.wav'], check=True)
x, sr = sf.read(f'{work}/edit_48.wav', dtype='float64'); assert sr == SR
x = x[:NT] if len(x) >= NT else np.r_[x, np.zeros((NT - len(x), 2))]
# low-end mono fix (same as the main EV master, measured on this source): below 200 Hz R ~= -1.3 L
LOW_FC, R_ANTI = 200.0, 1.30
BETA = (np.sqrt((1 + R_ANTI ** 2) / 2) - 1) / (1 + R_ANTI); ALPHA = 1 + BETA
low = ss.sosfiltfilt(ss.butter(4, LOW_FC, 'low', fs=SR, output='sos'), x, axis=0)
x = (x - low) + (ALPHA * low[:, 0] - BETA * low[:, 1])[:, None]
np.save(outp, x)
print('samples', len(x), 'alpha %.4f beta %.4f' % (ALPHA, BETA))
