#!/usr/bin/env python3
"""Insert the user's 0.6 s (18-frame) last-page hold into a QA-passed native 4K video.

Lossless everywhere except the 18 new hold frames:
  * body frames [0, ceil)            -> original coded pictures, stream copy
  * 18 hold frames                   -> clone of decoded frame ceil-1 (yuv420p, no RGB trip),
                                        x264 with the same settings illustrated_tail.py uses
  * illustration60 + summary60       -> original coded pictures, stream copy (shifted +0.6 s)
  * AAC                              -> original packets, stream copy (payload + timing identical)
No TTS, no audio DSP, no re-encode of approved pictures.
"""
import argparse, hashlib, json, math, subprocess, sys, tempfile, importlib.util
from fractions import Fraction
from pathlib import Path
import numpy as np

FPS = 30
W, H = 3840, 2160
TW, TH = 384, 216
sys.path.insert(0, str(Path(__file__).resolve().parent))
from voice_end import voice_end  # exact official method


def run(args, capture=False):
    r = subprocess.run([str(a) for a in args], check=True,
                       stdout=subprocess.PIPE if capture else None,
                       stderr=subprocess.PIPE if capture else None)
    return r.stdout


def sha(p):
    h = hashlib.sha256()
    with open(p, 'rb') as f:
        for b in iter(lambda: f.read(1 << 20), b''):
            h.update(b)
    return h.hexdigest()


def probe(p):
    return json.loads(run(['ffprobe', '-v', 'error', '-show_streams', '-show_format', '-of', 'json', p], True))


def packets(p, stream, payload=False):
    a = ['ffprobe', '-v', 'error', '-select_streams', stream, '-show_packets']
    if payload:
        a += ['-show_data_hash', 'sha256']
    a += ['-show_entries', 'packet=pts,dts,duration,pts_time,dts_time,duration_time,flags,size'
          + (',data_hash:packet_side_data' if payload else ''), '-of', 'json', p]
    return json.loads(run(a, True))['packets']


def timing(rows):
    keys = ('pts', 'dts', 'duration', 'pts_time', 'dts_time', 'duration_time', 'flags')
    return [{k: r[k] for k in keys if k in r} for r in rows]


def coded_sha(p, start_frame, count):
    """SHA of VCL NAL units (types 1-5) only, for `count` frames from `start_frame` (a keyframe)."""
    a = ['ffmpeg', '-v', 'error']
    if start_frame:
        a += ['-ss', f'{(start_frame + 0.25) / FPS:.9f}']
    a += ['-i', p, '-map', '0:v:0', '-an', '-c:v', 'copy', '-frames:v', str(count), '-bsf:v',
          'h264_mp4toannexb,filter_units=pass_types=1-5', '-f', 'h264', '-']
    return hashlib.sha256(run(a, True)).hexdigest()


def thumbs(p, start_frame, count):
    raw = run(['ffmpeg', '-v', 'error', '-ss', f'{(start_frame - .25) / FPS:.9f}', '-i', p, '-map', '0:v:0',
               '-an', '-frames:v', str(count), '-vf', f'scale={TW}:{TH}:flags=area', '-pix_fmt', 'rgb24',
               '-f', 'rawvideo', '-'], True)
    a = np.frombuffer(raw, np.uint8).reshape(-1, TH, TW, 3).astype(np.float64)
    assert len(a) == count, (len(a), count)
    return a


def mae(a, b):
    return float(np.abs(a - b).mean())


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--input', required=True, type=Path)
    ap.add_argument('--input-sha256', required=True)
    ap.add_argument('--output', required=True, type=Path)
    ap.add_argument('--report', required=True, type=Path)
    ap.add_argument('--work', required=True, type=Path)
    ap.add_argument('--hold18-geometry', required=True, type=Path, help='repo hold18_geometry.py')
    a = ap.parse_args()
    assert sha(a.input) == a.input_sha256, 'Input is not the QA-passed source'
    assert not a.output.exists(), 'Refusing to overwrite'
    spec = importlib.util.spec_from_file_location('hold18_geometry', a.hold18_geometry)
    G = importlib.util.module_from_spec(spec); spec.loader.exec_module(G)

    info = probe(a.input)
    vs = next(s for s in info['streams'] if s['codec_type'] == 'video')
    au = next(s for s in info['streams'] if s['codec_type'] == 'audio')
    assert vs['codec_name'] == 'h264' and (vs['width'], vs['height']) == (W, H) and Fraction(vs['r_frame_rate']) == FPS
    assert au['codec_name'] == 'aac'
    tb = Fraction(vs['time_base']); timescale = tb.denominator
    src_v = packets(a.input, 'v:0'); src_a = packets(a.input, 'a:0', payload=True)
    n_src = len(src_v)

    speech_end, ends, _ = voice_end(str(a.input))
    ceil = math.ceil(Fraction(str(speech_end)) * FPS)
    # Source must be "read-through then illustration60 + summary60" with no hold yet.
    assert n_src == ceil + 120, ('source is not body+art60+summary60 at the speech ceiling', n_src, ceil)
    by_pts = sorted(range(n_src), key=lambda i: int(src_v[i]['pts']))
    pts_frame = {i: round(Fraction(src_v[i]['pts']) * tb * FPS) for i in range(n_src)}
    key_frames = sorted(pts_frame[i] for i in range(n_src) if 'K' in src_v[i]['flags'])
    assert ceil in key_frames and ceil + 60 in key_frames, ('illustration/summary not IDR-aligned', key_frames[-4:])

    work = a.work; work.mkdir(parents=True, exist_ok=True)
    # 1) exact decoded last spoken-page frame (ceil-1), yuv420p
    ref_yuv = work / 'ref.yuv'
    ref_yuv.write_bytes(run(['ffmpeg', '-v', 'error', '-ss', f'{(ceil - 1 - .25) / FPS:.9f}', '-i', a.input,
                             '-map', '0:v:0', '-frames:v', '1', '-pix_fmt', 'yuv420p', '-f', 'rawvideo', '-'], True))
    assert len(ref_yuv.read_bytes()) == W * H * 3 // 2
    # confirm we grabbed the right frame: equals body frame ceil-1, differs strongly from ceil
    src_edge = thumbs(a.input, ceil - 2, 3)
    ref_thumb = np.frombuffer(run(['ffmpeg', '-v', 'error', '-f', 'rawvideo', '-pix_fmt', 'yuv420p', '-s', f'{W}x{H}',
                                   '-i', ref_yuv, '-vf', f'scale={TW}:{TH}:flags=area', '-pix_fmt', 'rgb24', '-f',
                                   'rawvideo', '-'], True), np.uint8).reshape(TH, TW, 3).astype(np.float64)
    assert mae(ref_thumb, src_edge[1]) < 1e-9, 'extracted frame is not frame ceil-1'
    assert mae(src_edge[1], src_edge[2]) > 20, 'frame ceil is not the illustration cut'

    # 2) 18 hold frames, encoded exactly like illustrated_tail.py encodes new tail frames
    hold = work / 'hold18.mp4'
    run(['ffmpeg', '-v', 'error', '-y', '-stream_loop', '17', '-f', 'rawvideo', '-pix_fmt', 'yuv420p', '-s', f'{W}x{H}',
         '-framerate', '30', '-i', ref_yuv, '-an', '-frames:v', '18', '-r', '30', '-fps_mode', 'cfr',
         '-c:v', 'libx264', '-preset', 'fast', '-crf', '10', '-threads', '2', '-g', '60', '-keyint_min', '60',
         '-sc_threshold', '0', '-force_key_frames', '0', '-pix_fmt', 'yuv420p', '-profile:v', 'high',
         '-level:v', '5.1', '-video_track_timescale', timescale, hold])
    assert len(packets(hold, 'v:0')) == 18

    # 3) lossless body prefix and lossless art+summary tail
    body = work / 'body.mp4'; tail = work / 'tail.mp4'
    run(['ffmpeg', '-v', 'error', '-y', '-copyts', '-i', a.input, '-map', '0:v:0', '-an', '-c:v', 'copy',
         '-frames:v', ceil, '-avoid_negative_ts', 'disabled', '-video_track_timescale', timescale, body])
    # seek to the exact IDR time, rounded UP by <1 ns: lands on the IDR itself with no edit-list discard
    seek = math.ceil(Fraction(ceil, FPS) * 10**9) / 10**9
    run(['ffmpeg', '-v', 'error', '-y', '-ss', f'{seek:.9f}', '-i', a.input, '-map', '0:v:0', '-an',
         '-c:v', 'copy', '-video_track_timescale', timescale, tail])
    tail_pk = packets(tail, 'v:0')
    assert len(packets(body, 'v:0')) == ceil and len(tail_pk) == 120
    assert tail_pk[0]['pts'] == 0 and 'K' in tail_pk[0]['flags'] and not any('D' in p['flags'] for p in tail_pk)

    # 4) join; audio = original packets
    cc = work / 'join.ffconcat'
    cc.write_text("ffconcat version 1.0\n"
                  f"file '{body.name}'\nduration {ceil / FPS:.9f}\n"
                  f"file '{hold.name}'\nduration {18 / FPS:.9f}\n"
                  f"file '{tail.name}'\n")
    joined = work / 'joined.mp4'
    run(['ffmpeg', '-v', 'error', '-y', '-copyts', '-f', 'concat', '-safe', '0', '-i', cc, '-i', a.input,
         '-map', '0:v:0', '-map', '1:a:0', '-c', 'copy', '-avoid_negative_ts', 'disabled',
         '-video_track_timescale', timescale, '-movflags', '+faststart', joined])
    for attempt in range(3):
        out_v = packets(joined, 'v:0')
        delta = float(min(Fraction(p['pts']) for p in out_v) * tb) - float(min(Fraction(p['pts']) for p in src_v) * tb)
        if abs(delta) < 1e-5:
            break
        fixed = work / f'fixed{attempt}.mp4'
        run(['ffmpeg', '-v', 'error', '-y', '-copyts', '-itsoffset', f'{-delta:.9f}', '-i', joined, '-i', a.input,
             '-map', '0:v:0', '-map', '1:a:0', '-c', 'copy', '-avoid_negative_ts', 'disabled',
             '-video_track_timescale', timescale, '-movflags', '+faststart', fixed])
        fixed.replace(joined)

    # ---------------- verification of the actual output ----------------
    out_v = packets(joined, 'v:0'); out_a = packets(joined, 'a:0', payload=True)
    total = ceil + 18 + 120
    assert len(out_v) == total, (len(out_v), total)
    # video: no discarded pictures. (audio packet0 carries the standard AAC priming discard; it is asserted
    # byte/timing-identical to the passed source below.)
    assert not any('D' in p['flags'] for p in out_v), 'discard-flagged video packet in output'
    pts = sorted(float(Fraction(p['pts']) * tb) for p in out_v)
    assert all(abs(t - i / FPS) < 2e-6 for i, t in enumerate(pts)), 'frame gap/duplicate'
    assert timing(out_v[:ceil]) == timing(src_v[:ceil]), 'body packet timing changed'
    body_coded = coded_sha(a.input, 0, ceil)
    assert coded_sha(joined, 0, ceil) == body_coded, 'body coded pictures changed'
    tail_coded = coded_sha(a.input, ceil, 120)
    assert coded_sha(joined, ceil + 18, 120) == tail_coded, 'illustration/summary coded pictures changed'
    assert out_a == src_a, 'AAC packet payload/side data/absolute timing changed'
    aac = lambda p: hashlib.sha256(run(['ffmpeg', '-v', 'error', '-i', p, '-map', '0:a:0', '-c:a', 'copy', '-f', 'adts', '-'], True)).hexdigest()
    src_aac = aac(a.input); assert aac(joined) == src_aac
    oi = probe(joined)
    ov = next(s for s in oi['streams'] if s['codec_type'] == 'video'); oa = next(s for s in oi['streams'] if s['codec_type'] == 'audio')
    vkeys = ['codec_name', 'profile', 'level', 'width', 'height', 'pix_fmt', 'sample_aspect_ratio', 'color_range',
             'color_space', 'color_transfer', 'color_primaries', 'chroma_location', 'time_base']
    akeys = ['codec_name', 'profile', 'sample_rate', 'channels', 'channel_layout', 'sample_fmt', 'time_base']
    assert {k: vs.get(k) for k in vkeys} == {k: ov.get(k) for k in vkeys}, 'video parameters changed'
    assert {k: au.get(k) for k in akeys} == {k: oa.get(k) for k in akeys}, 'audio parameters changed'
    assert abs(float(ov['duration']) - total / FPS) < 1e-5
    out_end, out_ends, _ = voice_end(str(joined))
    assert out_end == speech_end and out_ends == ends, 'speech endpoint moved'

    body_end = ceil + 18
    geo = G.geometry(speech_end, body_end, body_end, body_end + 60, total, float(Fraction(body_end, FPS) - Fraction(str(speech_end))))
    held = thumbs(joined, ceil - 1, 19)   # reference frame + 18 held frames
    each = [mae(held[i], held[0]) for i in range(1, 19)]
    G.decoded_hold(frame_count=18, hold_seconds=.6, start_frame=ceil, end_frame_inclusive=body_end - 1,
                   reference_frame=ceil - 1, checked_frames=18, thumbnail_mae_each=each,
                   thumbnail_mae_max=max(each), actual_geometry=geo)
    src_tail = thumbs(a.input, ceil, 120); out_tail = thumbs(joined, body_end, 120)
    tail_err = [mae(out_tail[i], src_tail[i]) for i in range(120)]
    assert max(tail_err) < 1e-9, 'decoded illustration/summary differ from passed source'
    assert mae(out_tail[0], held[-1]) > 20 and mae(out_tail[60], out_tail[59]) > 20, 'cut points not where expected'
    dec = subprocess.run(['ffmpeg', '-v', 'error', '-xerror', '-i', str(joined), '-f', 'null', '-'], capture_output=True, text=True)
    assert dec.returncode == 0 and not dec.stderr.strip(), ('full decode errors', dec.stderr[:500])

    a.output.parent.mkdir(parents=True, exist_ok=True); a.report.parent.mkdir(parents=True, exist_ok=True)
    joined.replace(a.output)
    rep = {
        'kind': 'last-body-hold18-then-approved-book-illustration60-then-approved-summary60',
        'method': 'post-only hold18 insertion; body and art/summary coded pictures and all AAC packets stream-copied from the QA-passed native',
        'input_video_sha256': a.input_sha256, 'input_frames': n_src,
        'source_voice_endpoint_seconds': speech_end, 'endpoint_threshold_checks': ends,
        'endpoint_method': 'official run.py voice_end(): 5 ms RMS, -60/-70/-80 dB, max',
        'speech_ceiling_frame': ceil, 'last_body_hold_frames': 18, 'last_body_hold_seconds': 0.6,
        'hold_start_frame': ceil, 'hold_end_frame_inclusive': body_end - 1, 'frozen_reference_frame': ceil - 1,
        'hold_thumbnail_MAE_each': each, 'hold_thumbnail_MAE_max': max(each),
        'body_frames': body_end, 'illustration_start_frame': body_end, 'summary_start_frame': body_end + 60,
        'illustration_start_seconds': body_end / FPS, 'summary_start_seconds': (body_end + 60) / FPS,
        'delay_after_voice_seconds': geo['voice_to_picture_seconds'], 'hold18_geometry_passed': True,
        'output_frames': total, 'output_seconds': total / FPS,
        'body_coded_pictures_identical': True, 'body_coded_pictures_sha256': body_coded,
        'body_packet_timings_identical': True,
        'illustration_summary_coded_pictures_identical_to_source': True, 'illustration_summary_coded_sha256': tail_coded,
        'illustration_summary_decoded_max_MAE_vs_source': max(tail_err),
        'aac_packet_payload_and_absolute_timings_identical': True, 'aac_packet_count': len(src_a), 'aac_adts_sha256': src_aac,
        'audio_reencoded_or_added_packets': 0, 'body_reencoded_frames': 0, 'new_encoded_frames': 18,
        'video_and_audio_codec_parameters_identical': True, 'full_decode_errors': 0,
        'hold_encoder': 'libx264 preset fast crf10 g60 high@5.1 (same as illustrated_tail.py tail encoder)',
        'output_bytes': a.output.stat().st_size, 'video_sha256': sha(a.output),
    }
    a.report.write_text(json.dumps(rep, ensure_ascii=False, indent=2) + '\n')
    print(json.dumps({k: rep[k] for k in ('video_sha256', 'output_bytes', 'output_frames', 'delay_after_voice_seconds', 'hold_thumbnail_MAE_max')}, ensure_ascii=False))


if __name__ == '__main__':
    main()
