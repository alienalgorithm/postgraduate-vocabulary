# decode the source MP3 to float64 stereo at its original 44.1 kHz; usage: decode.py <in.mp3> <out.npy>
import sys, subprocess, numpy as np
raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', sys.argv[1], '-f', 'f64le', '-'], capture_output=True, check=True).stdout
np.save(sys.argv[2], np.frombuffer(raw, np.float64).reshape(-1, 2))
