#!/usr/bin/env python3
"""Write A/story/script.md (readable storyboard with timecodes) from A/story/storyboard.json (v2).
Usage: python3 -I build_script_v2.py A"""
import json, os, sys
A = sys.argv[1]
sb = json.load(open(os.path.join(A, 'story/storyboard.json')))
m = sb['music']
L = []
w = L.append

def tc(t):
    mnt = int(t // 60)
    return '%d:%06.3f' % (mnt, t - 60 * mnt)

def bt(b):
    return ('%.3f' % b).rstrip('0').rstrip('.')

SEC_CN = {'intro_a': '前奏', 'intro_b': '前奏第二轮', 'lift': '屏息段', 'arrival': '爆发', 'drive': '向前推', 'build_1': '深低音回来',
          'build_2': '整轮渐强', 'peak': '高潮', 'stop': '急停和尾音', 'coda': '尾声', 'recall': '开头回来', 'ending': '落定和淡出'}
ROLE_CN = {'headline': '标题', 'line': '说明', 'small': '小字', 'en': '英文', 'source': '出处', 'texture': '图形文字'}
sig = {s['scene']: s for s in sb['signature_shots']}

w('# %s：分镜脚本（%s，按《Cornfield Chase》剪辑版定时）' % (sb['title'], sb.get('version', 'v2').split('：')[0]))
w('')
w('机器可读版本是同目录的 `storyboard.json`，本文件由 `story/tools/build_script_v2.py` 从它生成，两者一致。时间码是全片时间（分:秒.毫秒），“场内”是相对场景开头的秒数；“第 n 小节第 b 拍”用剪辑后配乐的小节号（和 `music/map.json` 的 bar_info 一致，第 1 小节从 0 秒开始），b 带小数时是八分或十六分音符。')
w('')
w('## 一眼看完')
w('')
w('- 总长：%s（%.3f 秒），等于剪辑后的配乐 `A/music/score.wav`，10 个场景，开始时间全部等于 `map.json` 的 scene_slots（都在小节线上，首尾相接）。' % (tc(sb['total']), sb['total']))
w('- 配乐：Hans Zimmer《Cornfield Chase》（《星际穿越》原声，用户说明已获授权），只在小节线剪辑。%g BPM，%s 拍，一拍 %.3f 秒，一小节 %.3f 秒，十六分音符 %.5f 秒；第 22、77 小节只有 2 拍（原曲第 18 小节）。' % (m['bpm'], m['meter'], m['beat'], m['bar'], m['sixteenth']))
w('- 恍然大悟：%s（%.3f 秒，s08 第 0 秒，原曲第 62 小节 F 强拍，全片最满的一刻）“不是重复看，”随闪光砸入，和 music.climax 相差 %.1f 毫秒；%s“而是反复想起。”在下一个强拍砸入。位置在全片 %d%% 处。s07 最后半拍全黑。'
  % (tc(sb['aha']['at']), sb['aha']['at'], abs(sb['aha']['at'] - m['climax']) * 1000, tc(sb['aha']['second_line_at']), round(sb['aha']['fraction_of_film'] * 100)))
w('- 全曲最强的一击（爆发）：%s（%.3f 秒），s05 第 0 秒，全片第一缕暖光。原曲急停：%s（%.3f 秒），s08 里画面在这一帧定格。' % (tc(m['burst']), m['burst'], tc(m['stop']), m['stop']))
w('- 评论区金句：“%s”（s10，%s 起写，句号就是母题光点，落在 %s 的 G 强拍上）。' % (sb['quote']['text'], tc(sb['quote']['at']), tc(sb['quote']['full_stop_at'])))
w('- 母题：%s。' % sb['motif']['name'])
w('- 检查：`python3 -I A/story/check_storyboard.py` 逐条核对：场景等于 map 的 scene_slots、小节线、首尾相接、总长等于 score.wav、高潮句落在高潮、每条文字的可读时间、出处不同屏、visual_text、名场面卡在拍上（含高潮和爆发）、每个卡点都在十六分音符网格上、evidence 出现次数、禁用词。')
w('')
w('## 配乐段落和场景')
w('')
w('| 段落 | 时间 | 音乐在做什么 | 场景 |')
w('|---|---|---|---|')
for s in m['sections']:
    scs = [x['id'] for x in sb['scenes'] if x['start'] < s['end'] - 0.01 and x['start'] + x['duration'] > s['start'] + 0.01]
    w('| %s %s | %s 到 %s | %s | %s |' % (s['name'], SEC_CN.get(s['name'], ''), tc(s['start']), tc(s['end']), s.get('note', ''), '、'.join(scs)))
w('')
w('## 场景总表')
w('')
w('| 场 | 时间 | 时长 | 小节 | 能量（计划 / 实测均值） | 来自 | 这一场讲什么 | 名场面 |')
w('|---|---|---|---|---|---|---|---|')
for s in sb['scenes']:
    end = s['start'] + s['duration']
    w('| %s | %s 到 %s | %.3f 秒 | 第 %d 到 %d 小节（%d） | %s / %.2f | %s | %s | %s |' % (
        s['id'], tc(s['start']), tc(end), s['duration'], s['first_bar'], s['first_bar'] + s['bars_span'] - 1, s['bars_span'],
        s['energy'], s['energy_measured']['mean'], '、'.join(s['derived_from']), s['purpose'].split('。')[0][:46], s.get('signature', '')))
w('')
w('能量曲线（实测均值，0 到 1）：')
w('')
w('```')
for s in sb['scenes']:
    e = s['energy_measured']['mean']
    w('%s %s %s %.2f' % (s['id'], tc(s['start']), '█' * int(round(e * 30)) + '░' * (30 - int(round(e * 30))), e))
w('```')
w('')
w('## 为什么这样定')
w('')
for r in sb['rationale']:
    w('- %s' % r)
w('')
if sb.get('review_changes'):
    w('## 核查修改（%s，2026-11-19 事实与节奏核查）' % sb.get('version', 'v2').split('：')[0])
    w('')
    for r in sb['review_changes']:
        w('- %s' % r)
    w('')
w('## 相对 plan.json 的改动')
w('')
for r in sb['changes_from_plan']:
    w('- %s' % r)
w('')
w('## 名场面（每个都卡在最强的音乐时刻上）')
w('')
for s in sb['signature_shots']:
    w('- **%s「%s」**：%s' % (s['scene'], s['name'], s['what']))
    for mm in s['music_moments']:
        w('  - %s（第 %d 小节第 %s 拍%s）%s' % (tc(mm['t']), mm['bar'], bt(mm['beat']), ('，强度 %.2f' % mm['strength']) if 'strength' in mm else '', mm['what']))
w('')
w('## 母题')
w('')
w('- %s' % sb['motif']['rule'])
for p in sb['motif']['path']:
    w('  - %s' % p)
w('- 第二母题：%s' % sb['motif']['second_motif'])
w('- 角色：%s' % sb['motif']['character'])
w('- evidence：%s' % sb['evidence_thread']['rule'])
w('')
w('## 色彩剧本')
w('')
w('| 场 | 温度 | 情绪 | 颜色 |')
w('|---|---|---|---|')
for c in sb['color_script']:
    w('| %s | %s | %s | %s |' % (c['scene'], c['temp'], c['mood'], c['look']))
w('')
w('## 逐场')
for s in sb['scenes']:
    st = s['start']
    end = st + s['duration']
    w('')
    w('### %s　%s 到 %s（%.3f 秒，第 %d 到 %d 小节，%s）%s' % (s['id'], tc(st), tc(end), s['duration'], s['first_bar'], s['first_bar'] + s['bars_span'] - 1,
                                                       '、'.join(SEC_CN.get(x, x) for x in s['section']), ('　名场面「%s」' % s['signature']) if s.get('signature') else ''))
    w('')
    w('**这一场**：%s' % s['purpose'])
    w('')
    w('**来自**：%s；色温 %s；能量（计划）%s，实测均值 %.2f、峰值 %.2f。' % ('、'.join(s['derived_from']), s['color_temp'], s['energy'], s['energy_measured']['mean'], s['energy_measured']['max']))
    w('')
    w('**音乐**：%s' % s['music'])
    w('')
    w('**小节线**：' + '；'.join('%s 第 %d 小节 %s%s' % (tc(b['global']), b['bar'], b['chord'], '（2 拍）' if b['beats'] == 2 else '') for b in s['bar_lines']))
    w('')
    w('**卡点（动作落在哪一拍）**')
    w('')
    w('| 全片 | 场内 | 小节 | 拍 | 发生什么 |')
    w('|---|---|---|---|---|')
    for c in s['cues']:
        w('| %s | %.3f | %d | %s | %s |' % (tc(c['global']), c['t'], c['bar'], bt(c['beat']), c['what'].replace('|', '\\|')))
    w('')
    w('**屏幕文字**')
    w('')
    w('| 出现 | 消失 | 场内 | 停留 | 需要 | 类型 | 文字 |')
    w('|---|---|---|---|---|---|---|')
    for t in sorted(s['texts'], key=lambda t: (t['in'], t['out'])):
        n = len(''.join(t['text'].split()))
        need = max(1.6, 0.6 + n / 6)
        w('| %s | %s | %.3f 到 %.3f | %.2f 秒 | %.2f 秒 | %s | %s |' % (tc(st + t['in']), tc(st + t['out']), t['in'], t['out'], t['out'] - t['in'], need,
                                                                   ROLE_CN.get(t['role'], t['role']) + ('（高潮句）' if t.get('aha') else ''), t['text'].replace('|', '\\|')))
    if s.get('visual_text'):
        w('')
        w('**画面图形里的英文（visual_text）**')
        w('')
        w('| 出现 | 消失 | 场内 | 停留 | 槽位 | 篇号 | 文字 |')
        w('|---|---|---|---|---|---|---|')
        for v in s['visual_text']:
            w('| %s | %s | %.3f 到 %.3f | %.2f 秒 | %s | %s | %s |' % (tc(st + v['in']), tc(st + v['out']), v['in'], v['out'], v['out'] - v['in'],
                                                               v.get('slot', '整页'), v.get('article', '51'), v['text']))
    w('')
    w('**画面**：%s' % s['visual'])
    w('')
    mo = s['motion'].split('\n')
    w('**动作和卡拍**：%s' % mo[0])
    w('')
    w('%s' % mo[-1])
    w('')
    w('**手法**：')
    for t in s['techniques']:
        w('- %s' % t)
    w('')
    w(('**出处**：%s' % '；'.join(s['sources'])) if s['sources'] else '**出处**：无')
    w('')
    tr = s['transition']
    w('**转场（进入本场）**：%s%s' % (tr.get('type'), ('，' + tr['note']) if tr.get('note') else ''))
w('')
w('## 彩蛋')
w('')
for e in sb['easter_eggs']:
    w('- %s' % e)
w('')
open(os.path.join(A, 'story/script.md'), 'w').write('\n'.join(L))
print('wrote script.md', len(L), 'lines')
