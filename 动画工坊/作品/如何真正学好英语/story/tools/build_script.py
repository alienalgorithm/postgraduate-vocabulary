#!/usr/bin/env python3
import json, os, sys, re
A = sys.argv[1]
sb = json.load(open(os.path.join(A, 'story/storyboard.json')))
m = sb['music']
L = []
w = L.append

def tc(t):
    mnt = int(t // 60)
    return '%d:%05.2f' % (mnt, t - 60 * mnt)

SEC_CN = {'intro': '前奏', 'tension': '主题（低音脉冲）', 'breath': '呼吸（低音退场）', 'lift': '主题回来、升温',
          'breakdown_riser': '抽空', 'climax': '爆发和高潮', 'afterglow': '温暖尾段', 'outro': '结尾'}
ROLE_CN = {'headline': '标题', 'line': '说明', 'small': '小字', 'en': '英文', 'source': '出处', 'texture': '图形文字'}

w('# %s：分镜脚本（按配乐定时）' % sb['title'])
w('')
w('机器可读版本是同目录的 `storyboard.json`，本文件由它生成，两者一致。时间码是全片时间（分:秒），括号里是场景内时间。')
w('')
w('## 一眼看完')
w('')
w('- 总长：%s（%.4f 秒），等于剪辑后的配乐 `A/music/score.wav`。' % (tc(sb['total']), sb['total']))
w('- 配乐：John Bartmann《Epic Vista》，CC0。94 BPM，4/4 拍，一小节 %.4f 秒，一拍 %.4f 秒；第 k 小节起点 = 0.020 + k × %.7f 秒。' % (m['bar'], m['beat'], m['bar']))
w('- 恍然大悟：%s（%.4f 秒，第 48 小节爆发点）“不是重复看，”随闪光砸入，和音乐爆发点相差 %.1f 毫秒；%s 第 3 拍“而是反复想起。”砸入。爆发前 121.619 到 122.573 秒是作曲自带的近乎无声，画面全黑。'
  % (tc(sb['aha']['at']), sb['aha']['at'], abs(sb['aha']['at'] - m['climax']) * 1000, tc(sb['aha']['second_line_at'])))
w('- 评论区金句：%s（s11，句号就是母题光点，落在全曲最后一记和弦上）。' % sb['quote']['text'])
w('- 母题：%s。' % sb['motif']['name'])
w('- 检查：`python3 -I A/story/check_storyboard.py` 逐条核对小节线、首尾相接、总长、高潮句、每条文字的可读时间。engine 载入本分镜（node engine/test.js --storyboard ../story/storyboard.json）：除了 scenes/s01.js 到 s11.js 还没写所报的“缺场景文件”，没有别的警告和错误。')
w('')
w('## 配乐段落和场景')
w('')
w('| 段落 | 时间 | 小节 | 音乐在做什么 | 场景 |')
w('|---|---|---|---|---|')
for s in m['sections']:
    k0 = min(range(len(m['bars'])), key=lambda i: abs(m['bars'][i] - s['start']))
    k1 = min(range(len(m['bars'])), key=lambda i: abs(m['bars'][i] - s['end']))
    scs = [x['id'] for x in sb['scenes'] if x['start'] < s['end'] - 0.01 and x['start'] + x['duration'] > s['start'] + 0.01]
    w('| %s %s | %s 到 %s | %d 到 %d | %s | %s |' % (s['name'], SEC_CN.get(s['name'], ''), tc(s['start']), tc(s['end']), k0, k1 - 1 if s['name'] != 'outro' else 80, s.get('note', ''), '、'.join(scs)))
w('')
w('## 场景总表')
w('')
w('| 场 | 时间 | 时长 | 小节 | 能量 | 这一场讲什么 | 名场面 |')
w('|---|---|---|---|---|---|---|')
sig = {s['scene']: s['name'] for s in sb['signature_shots']}
for s in sb['scenes']:
    end = s['start'] + s['duration']
    w('| %s | %s 到 %s | %.2f 秒 | %d 到 %d（%s 小节） | %s | %s | %s |' % (
        s['id'], tc(s['start']), tc(end), s['duration'], s['bars_span'][0], s['bars_span'][1] - 1 if s['id'] != 's11' else 80,
        ('%d' % (s['bars_span'][1] - s['bars_span'][0])) if s['id'] != 's11' else '10.35', s['energy'], s['purpose'].split('：')[0].split('。')[0][:40], sig.get(s['id'], '')))
w('')
w('## 为什么这样切')
w('')
w('- 每个场景都从音乐的事件上开始：s03 从主题第一记低音开始熄灯（第 12 小节），s05 的第一缕暖光就是主题回来时全片第一个温暖的和弦（第 28 小节），s07 从低音完全离开开始讲“还会忘”（第 44 小节），s08 第 0 秒就是爆发点（第 48 小节）。')
w('- s04 末尾两张扣着的卡正好悬在“呼吸”段（第 26、27 小节，低音退场、和声悬住）；s06 的“往往还要更多次”和完整的星图落在抽空段开头那口悬着的气上（第 42、43 小节）。')
w('- 名场面都踩最强的音乐时刻：熄灯踩主题第一记低音、楼梯塌落踩第 24 小节强低音、视频扫光和相遇加速踩第 38、40 小节强低音、合书点火踩爆发点、俯视大脑踩高潮第二个乐句开头（第 54 小节）、方法卡踩音乐落定（第 77 小节），句号踩全曲最后一记和弦（第 76 小节）。')
w('- 时长的取舍：爆发前的 48 小节里，前奏有 12 小节（30.7 秒），比内容需要的长，所以 s02 占满前奏第 2、3 遍，让“越背越快”和问题句有呼吸；s06 是信息最密的名场面，给了 9 小节（23.0 秒）；代价是 s07 只有 4 小节（10.2 秒），三句话的停留时间比原稿短 0.5 到 0.7 秒，但都高于可读时间，节奏变成“快速下坠，全黑，爆发”。爆发后的切法（9、6、7 小节加结尾）是唯一能让 s08、s09、s11 都不短于原稿、s10 只差 0.13 秒、方法卡又正好落在第 77 小节的切法。')
w('- 可读时间：texts 里的每一条（中文、英文、出处都算）都满足 max(1.6, 0.6 + 字符数/6) 秒，和 engine 的检查一致。s06 的 50 词阅读页和 8 个相遇片段是画面图形里的英文，放在 visual_text 里：阅读页逐词点亮，不按字幕读；相遇片段按英文扫读标准停留 max(2.4, 0.6 + 词数/3.5) 秒，同屏最多 3 条。')
w('- 出处为满足可读时间做了重组，内容一条没少：s08 拆成 retrieval 配 Roediger & Karpicke, 2006、spacing 配 Cepeda et al., 2006；s10 合成三段；Schmidt, 1990 挪到 s06 的 noticing 段；s11 方法卡的出处排成三行。')
w('')
w('## 名场面')
w('')
for s in sb['signature_shots']:
    w('- **%s「%s」**：%s' % (s['scene'], s['name'], s['what']))
    for mm in s['music_moments']:
        w('  - %s（第 %d 小节）%s' % (tc(mm['t']), mm['bar'], mm['what']))
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
    w('### %s　%s 到 %s（%.2f 秒，第 %d 到 %s 小节，%s）' % (s['id'], tc(st), tc(end), s['duration'], s['bars_span'][0],
                                                     (s['bars_span'][1] - 1) if s['id'] != 's11' else '80', SEC_CN.get(s['section'], s['section'])))
    w('')
    w('**这一场**：%s' % s['purpose'])
    w('')
    w('**音乐**：%s' % s['music'])
    w('')
    w('**卡点**')
    w('')
    w('| 全片 | 场内 | 小节 | 拍 | 发生什么 |')
    w('|---|---|---|---|---|')
    for c in s['cues']:
        bt = c['beat']; lab = ('%g' % bt) if abs(bt * 2 - round(bt * 2)) < 0.02 else '（不卡拍）'
        w('| %s | %.3f | %d | %s | %s |' % (tc(c['global']), c['t'], c['bar'], lab, c['what']))
    w('')
    w('**屏幕文字**')
    w('')
    w('| 出现 | 消失 | 场内 | 停留 | 类型 | 文字 |')
    w('|---|---|---|---|---|---|')
    for t in sorted(s['texts'], key=lambda t: (t['in'], t['out'])):
        w('| %s | %s | %.3f 到 %.3f | %.2f 秒 | %s | %s |' % (tc(st + t['in']), tc(st + t['out']), t['in'], t['out'], t['out'] - t['in'],
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
    w('**动作和卡拍**：%s' % s['motion'])
    w('')
    w('**手法**：')
    for t in s['techniques']:
        w('- %s' % t)
    w('')
    w('**出处**：%s' % '；'.join(s['sources']) if s['sources'] else '**出处**：无')
    w('')
    tr = s['transition']
    w('**转场**：%s%s' % (tr.get('type'), ('，' + tr['note']) if tr.get('note') else ''))
w('')
w('## 彩蛋')
w('')
for e in sb['easter_eggs']:
    w('- %s' % e)
w('')
w('## 和 content.json 相比改了哪些文字时间')
w('')
w('| 场 | 文字 | 变化 | 原来 | 现在 |')
w('|---|---|---|---|---|')
for n in sb['retime_notes']:
    w('| %s | %s | %s | %s | %s |' % (n['scene'], n['text'].replace('|', '\\|'), n['change'], ('%.2f 秒' % n['was']) if 'was' in n else '', ('%.2f 秒' % n['now']) if 'now' in n else ''))
w('')
open(os.path.join(A, 'story/script.md'), 'w').write('\n'.join(L))
print('wrote script.md', len(L), 'lines')
