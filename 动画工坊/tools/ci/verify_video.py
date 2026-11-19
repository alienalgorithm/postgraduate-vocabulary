#!/usr/bin/env python3
"""成片核对：只查片子本身（画面帧数、帧率、尺寸、编码，声音的有无、长度、响度、真峰值）。

用法：python3 verify_video.py 片子.mp4 --frames N --fps 60 --width 3840 --height 2160 --audio yes|no
                               [--tp-max 0.0] [--audio-tol 0.05] [--json 结果.json] [--quiet]
不通过的项逐条打印，以 1 退出；通过以 0 退出。
  帧数     逐包数出来的帧数 = N（N = 时长 x fps，render.js 的同一算法）
  帧率     r_frame_rate = fps；尺寸 = width x height；H.264、yuv420p、BT.709
  声音     --audio yes：AAC、48 kHz、立体声，长度和画面差不超过 audio-tol 秒（不许片尾先没声）；
           真峰值不超过 tp-max dBTP（超过 0 dBTP 播放时会削波）。积分响度只报告不卡（片段的响度本来就和全片不同）
           --audio no：不许有音轨
"""
import argparse
import json
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import ci_common as C  # noqa: E402


def verify(path, frames, fps, width, height, audio, tp_max=0.0, audio_tol=0.05):
    bad, info = [], {'file': os.path.basename(path)}
    try:
        p = C.probe(path)
    except Exception as e:  # noqa: BLE001
        return [f'ffprobe 读不了：{e}'], info
    v = p['video']
    info['size_mb'] = round(p['size'] / 1048576, 1)
    if not v:
        return ['没有视频流'], info
    info.update(frames=v['frames'], fps=v['fps'], width=v['width'], height=v['height'], codec=v['codec'], pix_fmt=v['pix_fmt'])
    if v['frames'] != frames:
        bad.append(f'帧数 {v["frames"]}，应为 {frames}')
    if abs(v['fps'] - fps) > 1e-6:
        bad.append(f'帧率 {v["fps"]:.3f}，应为 {fps}')
    if (v['width'], v['height']) != (width, height):
        bad.append(f'尺寸 {v["width"]}x{v["height"]}，应为 {width}x{height}')
    if v['codec'] != 'h264' or v['pix_fmt'] != 'yuv420p':
        bad.append(f'编码 {v["codec"]} {v["pix_fmt"]}，应为 h264 yuv420p')
    if v.get('color') not in (None, 'bt709'):
        bad.append(f'色彩标记 {v["color"]}，应为 bt709')
    a = p['audio']
    vdur = frames / fps
    if audio:
        if not a:
            bad.append('没有音轨')
        else:
            info.update(audio_codec=a['codec'], sample_rate=a['sample_rate'], channels=a['channels'], audio_duration=a['duration'])
            if (a['codec'], a['sample_rate'], a['channels']) != ('aac', 48000, 2):
                bad.append(f'音轨 {a["codec"]} {a["sample_rate"]} Hz {a["channels"]} 声道，应为 aac 48000 Hz 立体声')
            if abs(a['duration'] - vdur) > audio_tol:
                bad.append(f'音轨长 {a["duration"]:.3f} 秒，画面 {vdur:.3f} 秒，相差超过 {audio_tol} 秒')
            ld = C.loudness(path)
            if not ld:
                bad.append('测不出响度（音轨解不开？）')
            else:
                info.update(lufs=ld['I'], lra=ld['LRA'], true_peak=ld['TP'])
                if ld['TP'] is not None and ld['TP'] > tp_max:
                    bad.append(f'真峰值 {ld["TP"]:.1f} dBTP，超过 {tp_max} dBTP（会削波）')
    elif a:
        bad.append('不该有音轨却有')
    return bad, info


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument('file')
    ap.add_argument('--frames', type=int, required=True)
    ap.add_argument('--fps', type=float, required=True)
    ap.add_argument('--width', type=int, required=True)
    ap.add_argument('--height', type=int, required=True)
    ap.add_argument('--audio', choices=['yes', 'no'], required=True)
    ap.add_argument('--tp-max', type=float, default=0.0)
    ap.add_argument('--audio-tol', type=float, default=0.05)
    ap.add_argument('--json')
    ap.add_argument('--quiet', action='store_true')
    a = ap.parse_args()
    bad, info = verify(a.file, a.frames, a.fps, a.width, a.height, a.audio == 'yes', a.tp_max, a.audio_tol)
    info['ok'] = not bad
    info['problems'] = bad
    if a.json:
        json.dump(info, open(a.json, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    for b in bad:
        print(f'不通过 {os.path.basename(a.file)}：{b}', flush=True)
    if not a.quiet or bad:
        print(('通过 ' if not bad else '不通过 ') + json.dumps(info, ensure_ascii=False), flush=True)
    return 1 if bad else 0


if __name__ == '__main__':
    sys.exit(main())
