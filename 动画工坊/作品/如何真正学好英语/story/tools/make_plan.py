# Build story/plan.json and story/plan.md (v2, Cornfield Chase): scene plan on the bar grid of the proposed cut.
# usage: python3 -I make_plan.py <A>
import json, os, re, sys

A = sys.argv[1]
cc = json.load(open(os.path.join(A, 'music/cc_map.json')))
SRC = {b['n']: b for b in cc['bars']}
BEAT = 0.625

# ---- proposed cut: source bars in playback order (TAIL = 2 bars of the original stop's reverb tail) ----
SEGMENTS = [
    ('A', list(range(1, 10)), 'intro_a, bars 1-9'),
    ('B', list(range(6, 22)), '10->6 loop (B 50.4): bars 6-21 = intro_a end, intro_b, lift 19-21'),
    ('C', [20, 21], '22->20 loop (A 70.6): lift +2 bars'),
    ('D', list(range(21, 38)), '22->21 loop (A 76.7): lift +1 bar, then 22-23, burst 24, arrival, drive_1'),
    ('E', list(range(46, 65)), '38->46 skip (A, drive_2 left out): build_1, build_2, peak 62-64, hard stop on the bar-65 line'),
    ('T', ['tail', 'tail'], 'the stop: 2 bars (3.750 s) of the original reverb tail, source 119.342 to 123.092'),
    ('F', [11, 12, 13], 'intro_b F enters softly on the next bar line (625 ms equal-power under the tail)'),
    ('G', list(range(10, 19)), '14->10 loop (B 57.1): bars 10-18'),
    ('H', list(range(3, 10)), 'bar-19 line -> bar 3 (G -> F, like the listed 11->3 and 19->11 joins): the opening swell returns'),
    ('I', list(range(6, 11)), '10->6 loop (B 50.4): bars 6-10, fade out over the last 2 bars (3.750 s)'),
]
bars = []
t = 0.0
for seg, srcs, _ in SEGMENTS:
    for s in srcs:
        if s == 'tail':
            beats, chord, sec = 3, 'G (tail)', 'stop_tail'
        else:
            b = SRC[s]; beats, chord, sec = b['beats'], b['chord'], b['section']
        dur = beats * BEAT - (0.033 if not bars else 0.0)
        bars.append({'n': len(bars) + 1, 'src': s, 'seg': seg, 'start': round(t, 3), 'beats': beats,
                     'chord': chord, 'section': sec})
        t += dur
TOTAL = round(t, 3)

# ---- scenes: (id, first output bar, last output bar) ----
SPLIT = [('s01', 1, 6), ('s02', 7, 12), ('s03', 13, 19), ('s04', 20, 30), ('s05', 31, 40), ('s06', 41, 52),
         ('s07', 53, 60), ('s08', 61, 67), ('s09', 68, 77), ('s10', 78, 89)]

S = {}
S['s01'] = dict(
    energy=2, role='quiet ostinato', derived_from=['s01'], temp=1, signature=None,
    music='开头的渐入（第 1 到 4 小节 F，从接近无声起来，第 3 小节起听得见），第 5 小节第一次换和弦到 G。',
    summary='冷开场钩子：黑暗里一粒冷光点穿过词尘，画出单词卡，落在 evidence 的 ı 上当那个点；“片尾，考你。”砸在第一次换和弦上。',
    cues=[(0, 0, '光点在近黑里随渐入呼吸'), (1, 0, '光点沿弧线穿过三层词尘，拖线画出磨砂单词卡'),
          (2, 0, '光点落在 ı 上（渐入刚好听得见）'), (4, 0, '“片尾，考你。”砸下，冲击波推开词尘，倒计时细弧预告'),
          (5, 0, '单词卡 3D 翻走，光点飘向夜城')],
    texts=[(2.6, 10.6, 'en', 'evidence'), ((2, 1), 10.6, 'line', 'n. 证据'), ((2, 2), 7.35, 'line', '先记住这个词。'),
           ((4, 0), 10.9, 'headline', '片尾，考你。')],
    reuse='scenes_v1/s01.js：改按 3/4 拍网格重排时间（10.23 秒改 11.22 秒）')
S['s02'] = dict(
    energy=3, role='quiet ostinato', derived_from=['s02'], temp=1.5, signature=None,
    music='前奏 G、Am 的长音和弦加顶上 E 持续音的“滴答”，冷、悬着（含一次 4 小节前奏循环）。问题第二行落在 Am（小调）上。',
    summary='扎心：夜城第一扇窗是 evidence；小学到考研五排楼一拍一排升起；“你背过的单词，后来都去哪了？”',
    cues=[(0, 0, '光点落进第一扇窗，窗像灯管一样闪亮'), (0, 1, '小学、初中、高中、大学、考研五排楼一拍一排升起'),
          (2, 0, '手机划词卡，每张卡亮一扇窗，越来越快'), (3, 0, '问题第一行'), (4, 0, '问题第二行落在 Am'),
          (5, 0, '标题碎成光块飞进最后几扇暗窗，全城冷白全亮，定住')],
    texts=[(0.3, 4.4, 'en', 'evidence'), ((0, 1), 7.4, 'small', '小学'), ((0, 2), 7.4, 'small', '初中'),
           ((1, 0), 7.4, 'small', '高中'), ((1, 1), 7.4, 'small', '大学'), ((1, 2), 7.4, 'small', '考研'),
           ((1, 0), 5.4, 'line', '从小学，背到考研。'), ((3, 0), 11.0, 'headline', '你背过的单词，'),
           ((4, 0), 11.0, 'headline', '后来都去哪了？')],
    reuse='scenes_v1/s02.js：20.4 秒压到 11.25 秒（手机划卡段缩短）')
S['s03'] = dict(
    energy=4, role='layer entry', derived_from=['s03'], temp=1, signature='熄灯之城，遗忘瀑布',
    music='第 3 小节起进入 intro_b：高音区一层加入、慢慢渐强。熄灯在 G 上，曲线在 F（新的一层进来）上画出，瀑布随渐强越涌越满。',
    summary='原因一：不复习就会忘，一开始忘得最快。熄灯后剩下的亮窗就是遗忘曲线，几千个真实考研词从悬崖瀑布般坠落；“不是你笨。”',
    cues=[(0, 0, '全城从左到右一拍一大片熄灯'), (1, 0, '只剩零星几扇，一拍几扇闪灭'),
          (2, 0, 'intro_b 新的一层进来：冰白曲线沿亮窗顶端描出，坐标轴画出，楼退到 15%'),
          (2, 1, 'evıdence 沿曲线俯冲两拍，再在平尾爬行，每过一个标记掉一个字母'),
          (4, 0, '名场面：遗忘瀑布，几千个真实考研词贴曲线流下、从悬崖倾泻进深渊'),
          (5, 0, '“不是你笨。”（瀑布还在落）'), (6, 0, '曲线平尾折成之字线（匹配转场到楼梯）')],
    texts=[((2, 0, 0.15), 12.9, 'small', '记得的'), ((2, 0, 0.15), 12.9, 'small', '时间'),
           ((2, 0, 0.25), 8.9, 'en', 'forgetting curve'), ((2, 0, 0.25), 8.9, 'en', 'evidence'),
           ((2, 0, 0.15), 8.9, 'headline', '不复习，新学的东西会很快忘掉，'), (4.8, 8.9, 'line', '而且一开始，忘得最快。'),
           ((2, 0, 0.15), 12.9, 'source', 'Ebbinghaus, 1885 · Murre & Dros, 2015'),
           ((5, 0), 12.9, 'headline', '不是你笨。')],
    reuse='scenes_v1/s03.js：17.9 秒压到 13.1 秒')
S['s04'] = dict(
    energy=5, role='build', derived_from=['s04'], temp=2, signature='abandon 无限楼梯',
    music='intro_b 最后的 Am、G，然后第 4 小节起是“屏息段”（lift）：低音撤掉，E 持续音上紧密明亮的十六分音符像钟表滴答，不换和弦，原地打转；最后一小节起势涌向爆发。屏息段加长 3 小节（两个 A 级循环）。',
    summary='原因二：反复看在原地打转。单词书搭成的彭罗斯楼梯，每层都是 abandon；“反复看，当下觉得记住了；一周后，反而记得更少。”楼梯塌成 10 张方法卡，效果最高的 2 张扣着悬在光里。',
    cues=[(0, 0, '之字线长成书脊台阶的彭罗斯楼梯，学习者一拍一级往上爬'),
          (1, 0, '每个平台一笔不发光的荧光笔；“熟悉感”仪表跳一格，“真的记得”不动'),
          (2, 0, '竖直光缝劈开画面：此刻 | 一周后，右边划线下的字母漏光'),
          (3, 0, '屏息段开始：低音撤掉，十六分音符滴答；进度条按十六分音符涨满、每两小节清零'),
          (4, 0, '楼梯塌落，书脊翻成 10 张方法卡，一拍一张落到三层架上'),
          (7, 0, '顶层两张扣着的卡挂在冷白体积光里，随滴答轻摆'),
          (10, 0, '起势小节：架子化成一细股词沙往下漏，扣着的卡背光点一跳一跳')],
    texts=[(0.6, 6.8, 'en', 'abandon'), (0.9, 6.8, 'small', '熟悉感'), (0.9, 6.8, 'small', '真的记得'),
           (0.6, 3.65, 'line', '反复看，当下觉得记住了；'), (0.6, 6.8, 'source', 'Roediger & Karpicke, 2006'),
           ((2, 0), 6.8, 'small', '此刻'), ((2, 0), 6.8, 'small', '一周后'),
           ((2, 0), 6.8, 'headline', '一周后，反而记得更少。'),
           ((4, 0, 0.3), 18.0, 'small', '效果高'), ((4, 0, 0.3), 18.0, 'small', '中等'), ((4, 0, 0.3), 18.0, 'small', '偏低'),
           ((4, 1), 18.0, 'small', '精细提问'), ((4, 1), 18.0, 'small', '自我解释'), ((4, 1), 18.0, 'small', '交错练习'),
           ((4, 2), 18.0, 'small', '总结'), ((4, 2), 18.0, 'small', '划线'), ((4, 2), 18.0, 'small', '关键词记忆法'),
           ((4, 2), 18.0, 'small', '文本意象法'), ((4, 2), 18.0, 'small', '重读'),
           ((4, 0), 12.2, 'line', '最常见的学习方法，反复读、划重点，研究评估效果偏低。'),
           ((4, 0), 18.0, 'source', 'Dunlosky et al., 2013'),
           ((7, 0), 18.0, 'line', '10 种学习方法里，被评为效果最高的只有 2 种。')],
    reuse='scenes_v1/s04.js：23.0 秒压到 20.0 秒；楼梯段放在 intro_b 尾巴，塌落和扣卡放在屏息段')
S['s05'] = dict(
    energy=7, role='layer entry', derived_from=['s05'], temp=4, signature='一河星光（次要名场面）',
    music='第 0 秒是全曲最强的一击（原曲 42.467 秒）：巨大的低音区进入、满编，十六分音符推着走；第 7 小节起 drive_1，高音层增长。',
    summary='转折，全片第一缕暖光：爆发那一拍，词沙冲成一条由真实英文句子流成的光河；“大量接触自己基本能听懂、读懂的内容，是学会一门语言的基础。”河上漂来用户水彩插图做的纸灯笼：“找到你真正想看、想读的英语。”',
    cues=[(0, 0, '爆发：词沙在强拍上冲开河道，几千个光点成河（青到暖金），第一缕暖光；学习者头灯转淡金'),
          (2, 0, '镜头从俯视压到 35 度斜视，真实句子光带沿河流动'),
          (4, 0, '三只纸灯笼（用户水彩插图）在这小节的三拍上依次漂入'),
          (6, 0, 'drive_1 高音层进来：河面变宽变亮'), (8, 0, '句子光带开始拉直（预告下一场的阅读页）')],
    texts=[((0, 1), 7.0, 'en', 'comprehensible input'), ((0, 1), 7.2, 'headline', '大量接触自己基本能听懂、读懂的内容，'),
           ((1, 0), 7.2, 'line', '是学会一门语言的基础。'), ((0, 1), 7.0, 'source', 'Krashen, 1982'),
           ((4, 0), 11.1, 'headline', '找到你真正想看、想读的英语。'), ((4, 0), 11.1, 'small', '越狱的章鱼'),
           ((4, 1), 11.1, 'small', '鲸歌易帜'), ((4, 2), 11.1, 'small', '写给外星人的一张唱片'),
           (7.0, 11.2, 'source', 'Masgoret & Gardner, 2003'),
           ((6, 0), 18.4, 'line', '34 项研究的汇总：大量阅读能明显提高阅读能力。'), ((6, 0), 18.4, 'source', 'Nakanishi, 2015')],
    reuse='scenes_v1/s05.js：17.9 秒改 18.75 秒，0 秒对准爆发')
S['s06'] = dict(
    energy=7, role='layer entry', derived_from=['s06'], temp=5, signature='第 50 个词，相遇星图',
    music='第 0 秒 8 kHz 以上的“光泽层”进来（原曲第 34 小节）；第 5 小节跳过 drive_2 直接进 build_1（A 级），深低音回来，第二次抬升：星图在这里开始加速。',
    summary='单词怎么扎根：一页正好 50 个词，49 个逐个点亮，只剩 evidence（约 98%，留意生词）；它溶进用户自己的 4K 精读画面，再在 70 篇故事里真实遇见 8 次连成星图；“一个生词，在上下文里遇到约 10 次，才会有明显收获；想真正掌握，往往还要更多次。”',
    cues=[(0, 0, '光带拉直成一页 50 个词（第 51 篇第 9 到 12 句），光泽层一进来，词按十六分音符逐个点亮，每个飞一粒光进 98% 圆环'),
          (2, 0, '绿色圆环收紧圈住唯一没亮的 evidence：noticing'),
          (4, 0, '深低音回来：页面液体溶解成用户 4K 精读画面（51 篇 86.5 秒），一道扫光'),
          (6, 0, '星图：evidence 在 70 篇故事里另外 8 处真实出现，先每两拍一颗星'),
          (8, 0, '改为每拍一颗，光线连向中央的词，每连一次亮一档'),
          (10, 0, '星图完整，中央的词转暖金')],
    texts=[(0.3, 6.8, 'headline', '每 50 个词，最多 1 个生词，'), ((0, 2), 6.8, 'line', '读起来才轻松。'),
           ((1, 1), 6.8, 'small', '约 98%'), (0.3, 3.75, 'source', 'Hu & Nation, 2000'),
           ((2, 0, 0.15), 7.3, 'en', 'noticing'), ((2, 0, 0.15), 7.3, 'source', 'Schmidt, 1990'),
           ((4, 0, 0.3), 11.0, 'small', '第 51 篇《林下之网》精读视频'), ((6, 0), 22.3, 'small', '遇见'),
           ((8, 0), 22.3, 'headline', '一个生词，在上下文里遇到约 10 次，'), ((8, 1), 22.3, 'headline', '才会有明显收获；'),
           ((9, 0), 22.3, 'line', '想真正掌握，往往还要更多次。'), ((8, 0), 22.3, 'source', 'Webb, 2007')],
    reuse='无现成代码，按 v1 分镜 s06 写（50 词段落与 8 个片段照 v1 的 visual_text）')
S['s07'] = dict(
    energy=8, role='build', derived_from=['s07'], temp=2.5, signature=None,
    music='build_2：整轮稳定渐强，势不可挡，直推到高潮。画面反着走：颜色退回冷暗，张力跟着音乐往上顶；最后半拍画面全黑，音乐不停。',
    summary='低谷蓄力：“可是，遇见了，还会忘。光是读过，还不够。”几百条下垂的记忆线折成一本书，学习者在台灯下“合上书。”，光被夹在书脊里越闪越快，最后半拍全黑。',
    cues=[(0, 0, '颜色退回冷蓝黑：星图的线变成 evidence 的亮度时间线，每次遇见一个鼓包，鼓包之间一拍一段冷色阴影'),
          (2, 0, '镜头拉远：几百条同样下垂的线'), (4, 0, '线收拢折成书页，叠成一本打开的书；台灯、学习者背影'),
          (6, 0, '“砰”地合上书卡在强拍；台灯光被夹成竖缝，光点困在书脊'),
          (7, 0, '其余全熄，微光被吸进书脊，闪烁跟十六分音符越来越快'),
          (7, 2.5, '最后半拍：画面全黑（只有极淡颗粒），音乐继续冲向高潮')],
    texts=[(0.3, 4.4, 'en', 'evidence'), (0.3, 4.4, 'headline', '可是，遇见了，还会忘。'),
           (0.3, 4.4, 'source', 'Ebbinghaus, 1885'), (4.4, 8.4, 'line', '光是读过，还不够。'),
           (4.4, 8.4, 'source', 'Uchihara et al., 2019'), ((6, 0), 14.3, 'headline', '合上书。')],
    reuse='无现成代码，按 v1 分镜 s07 写（10.2 秒放宽到 15 秒）')
S['s08'] = dict(
    energy=10, role='climax', derived_from=['s08'], temp=10, signature='合书点火，万家灯火',
    music='0 秒是全曲最满的一刻（原曲第 62 小节 F 强拍，113.717 秒）；三小节全频段到顶后，在原曲自己的小节线上戛然而止，混响尾音响两小节（屏息的寂静）；第 6 小节 intro_b 的 F 轻轻回来。高潮只出现这一次。',
    summary='恍然大悟：书脊里的光炸开，“不是重复看，而是反复想起。”金色冲击波把整座城重新点亮、掉下去的词倒飞回窗里；音乐戛然而止，镜头在寂静里升空，上百行天际线被托成金色，俯视整座城是一颗发光的大脑。',
    cues=[(0, 0, 'AHA 第一行：书脊光柱炸开、白金闪光、光点飞进学习者的头（100% 暖金）'),
          (1, 0, 'AHA 第二行；金色球形冲击波点亮全城，s03 掉下去的词倒着飞回窗里（瀑布倒放）'),
          (2, 0, '摇臂开始升空：身后约 120 行天际线（每行一个词的记忆曲线）被金色“想起”波一行行托起'),
          (3, 0, '音乐戛然而止（原曲的急停，混响在响）：镜头在寂静里继续升'),
          (4, 0, '主旨句出现'), (5, 0, 'intro_b 的 F 轻轻进来：垂直俯视，整座金色的城是一颗大脑，定住')],
    texts=[(0.0, 7.3, 'headline', '不是重复看，'), ((1, 0), 7.3, 'headline', '而是反复想起。'),
           ((1, 1), 7.3, 'en', 'retrieval'), ((1, 0), 13.0, 'source', 'Roediger & Karpicke, 2006'),
           ((4, 0), 13.0, 'headline', '在读得懂的句子里，'), ((4, 0, 0.3), 13.0, 'headline', '一次次遇见，一次次想起来。')],
    reuse='无现成代码，按 v1 分镜 s08 写（23 秒压到 13.1 秒；间隔复习图移到 s09）')
S['s09'] = dict(
    energy=4, role='resolution', derived_from=['s09', 's08'], temp=8.5, signature=None,
    music='intro_b 安静、慢慢变亮的 G、F、G、Am、G（含一次 4 小节循环），温暖笃定。翻牌在 G 的强拍上。',
    summary='钉牢：一周后，反复回想的单词约 80%，只看不想的不到 40%；s04 扣着的两张卡落下翻开：自测、分散复习；分散复习的卡面展开成间隔复习曲线：“合上书，把它想起来；隔几天，再想一次。”',
    cues=[(0, 0, '大脑的街道网格压平成金色坐标纸，两栋楼从地平线升起（金楼窗全亮、楼顶站着光点；灰楼不发光）'),
          (2, 0, '数字滚动落定'), (3, 0, 's04 那两张扣着的卡从上方落下'),
          (4, 0, '强拍上 3D 翻牌：自测、分散复习'),
          (6, 0, '“分散复习”卡面展开成间隔复习图：每拍一道金色“想起”脉冲把曲线托起，下降一次比一次平、间隔一次比一次宽'),
          (9, 0, '金色曲线弯成一道圆弧（下一场的倒计时圈）')],
    texts=[(0.3, 7.3, 'small', '一周后'), (0.6, 7.3, 'small', '反复回想的单词'), (0.6, 7.3, 'small', '只看不想的'),
           (1.0, 7.3, 'headline', '约 80%'), (1.0, 7.3, 'headline', '不到 40%'),
           (0.3, 7.3, 'source', 'Karpicke & Roediger, 2008'),
           ((4, 0), 11.7, 'headline', '自测'), ((4, 0), 11.7, 'headline', '分散复习'),
           ((4, 0, 0.05), 11.7, 'line', '自测和分散复习，被评为效果最好的两种方法。'),
           ((4, 0), 11.7, 'source', 'Dunlosky et al., 2013'),
           (11.75, 17.9, 'line', '合上书，把它想起来；隔几天，再想一次。'), (12.0, 17.9, 'en', 'spacing'),
           (12.0, 17.9, 'small', '示意'), (11.75, 17.9, 'source', 'Cepeda et al., 2006')],
    reuse='无现成代码，按 v1 分镜 s09（一组实验）加 s08 的间隔复习图写')
S['s10'] = dict(
    energy=3, role='resolution', derived_from=['s11', 's10'], temp=9, signature='光点归位，方法卡定格',
    music='开头的渐入回来了（原曲第 3 小节 F 起）：音乐自己“想起”了开头。解码落在第 3 小节 G 上，正是 s01“片尾，考你。”落的那个和弦；方法卡落在 Am（主和弦）强拍上，之后在 G 上两小节淡出。',
    summary='兑现承诺：“还记得开头那个词吗？”观众自己想，乱码解码出 evidence，光点落回 ı 上；“这个视频里，你已经遇见它十几次；刚才想起它的那一下，就是方法本身。”金句“多看一遍，不如合上书想一遍。”方法卡在主和弦上落定，署名，淡出。',
    cues=[(0, 0, '暖奶油纸面上只剩光点，像光标一样闪；开头那段音乐回来'),
          (1, 0, '开头那张单词卡回来（暖白、金边），8 个空格，倒计时圈两拍画满'),
          (2, 0, '名场面：乱码解码出 evidence，光点落回 ı（与 s01 同一个和弦位置）'),
          (2, 1, '14 个缩略图按十六分音符沿金弧依次亮起，化成微粒吸进光点'),
          (5, 0, '金句第一行'), (6, 0, '金句句号就是光点，落在 G 强拍'),
          (8, 0, '方法卡在 Am 强拍落定，四行按拍依次落下（读、想、隔、用）'),
          (10, 0, '最后一个强拍：金光扫过卡面，光点停在卡片右上角；音乐两小节淡出，画面定格')],
    texts=[(0.3, 3.6, 'line', '还记得开头那个词吗？'), ((1, 0), 9.3, 'line', 'n. 证据'), ((2, 0), 9.3, 'en', 'evidence'),
           (4.4, 9.3, 'line', '这个视频里，你已经遇见它十几次；'), ((3, 0), 9.3, 'line', '刚才想起它的那一下，就是方法本身。'),
           ((5, 0), 14.8, 'headline', '多看一遍，'), ((5, 1), 14.8, 'headline', '不如合上书想一遍。'),
           ((8, 0), 22.5, 'headline', '如何真正学好英语'), ((8, 0), 22.5, 'line', '读  爱读的、读得懂的，大量读，大量听。'),
           ((8, 1), 22.5, 'line', '想  合上书，把它想起来。'), ((8, 2), 22.5, 'line', '隔  隔几天，再想一次。'),
           ((9, 0), 22.5, 'line', '用  说出来，写出来，看看卡在哪。'),
           ((9, 1), 22.5, 'line', '每天定时做一点，慢慢成习惯；偶尔漏一天，影响不大。'),
           ((8, 0), 22.5, 'source', 'Hu & Nation, 2000 · Nakanishi, 2015'),
           ((8, 0), 22.5, 'source', 'Roediger & Karpicke, 2006 · Cepeda et al., 2006'),
           ((8, 0), 22.5, 'source', 'Swain, 1985 · Lally et al., 2010'), ((8, 0), 22.5, 'line', 'B站UP主 朋克英语')],
    reuse='无现成代码，按 v1 分镜 s11 写；v1 s10 的回路并入方法卡（四行按拍落下，底部可放 66 格打卡条、空一格的彩蛋）')

RATIONALE = [
    '片长 165.6 秒（2 分 45.6 秒），按内容定，不按配乐长度定。一条完整的论证链（痛点、遗忘、错觉、输入、遇见、合上书想、证据、自己试一次、方法）加上每条中文都留足阅读时间，五个名场面都有呼吸，算下来就是 165 秒左右。再长只能靠 C 级循环或让字幕空等，就拖了；再短就得砍证据或压阅读时间。正好落在 B站 2 分半到 3 分钟的区间。',
    '结构让《Cornfield Chase》本身的起伏去托内容。冷开头（s01 到 s03）用前奏：从接近无声渐入，冷、悬着；遗忘瀑布骑在 intro_b 新进来的高音层和渐强上。',
    's04 的“原地打转”用屏息段：低音撤掉，E 持续音上的十六分音符像钟表滴答，和声一直不动，正好配永远回到原点的楼梯，以及扣着不翻的两张卡；起势小节把人推向爆发。',
    '全曲最强的一击（原曲 42.467 秒）给 s05，那是全片第一缕暖光：词沙冲成光河。s06 的星图骑在两次新声部进入上（光泽层进来、深低音回来）。',
    's07 的“合上书”放在 build_2 整轮渐强里：颜色退冷，张力往上顶；最后半拍画面全黑，音乐不停，这就是“高潮前留半拍空白”。',
    '恍然大悟放在全曲最满的一刻：原曲第 62 小节 F 强拍，剪辑后 111.842 秒，在全片 67.5% 处。高潮在剪辑里只经过一次，就是最后一次。',
    '高潮后用 Zimmer 自己写的急停：混响尾音里的寂静，留给“俯视整座城是一颗大脑”。然后前奏回来，作温暖的尾声。',
    's10 问“还记得开头那个词吗？”时，响的正是开头那段渐入；答案解码落在和 s01“片尾，考你。”同一个和弦（原曲第 5 小节 G）上，配乐自己也在“想起”。方法卡落在 Am（主和弦）强拍上，然后两小节淡出。第二遍看才会发现这个对位。',
    '剪辑只在小节线上，只用 A 级、B 级循环和 A 级跳转 38->46，拍网格从头到尾连续。唯一两处听得出的变化都是作曲本身的动作：一处是原曲的急停和它自己的尾音，另一处是急停之后回到前奏。这是一口气，不是藏起来的接缝。',
]
CHANGES = [
    'v1 共 11 场 205.2 秒，改为 10 场 165.6 秒。',
    'v1 s10 的方法回路（读想隔用圆环、66 格打卡条）并进最后的方法卡：四行按拍落下，打卡条可作卡片底部彩蛋。',
    'v1 s09 的两组实验只留一组，用和单词直接相关的 Karpicke & Roediger 2008（约 80% 对不到 40%）；2006 那组已经在 s04 用作“错觉”。',
    'v1 s08 的间隔复习锯齿图挪到 s09，成为“分散复习”那张卡翻开后的卡面；s08 只留点火、冲击波、升空、大脑和主旨句。',
    '压缩：s02 20.4 秒改 11.25 秒，s03 17.9 秒改 13.1 秒，s04 23.0 秒改 20.0 秒，s08 23.0 秒改 13.1 秒，s11（现 s10）26.4 秒改 22.5 秒。放宽：s07 10.2 秒改 15.0 秒（整轮 build_2）。',
    '保留：五个名场面、母题光点的完整路线、城市即记忆的第二母题、无脸学习者、色彩剧本、evidence 可读出现 14 次（片尾说“十几次”）。所有屏幕句和数字都沿用 v1 已核对的 EVIDENCE 原句。',
]
NOTES = [
    '配乐：按 music.segments 剪。急停之后的部分（2 小节尾音，然后 11-13、10-18、3-9、6-10，最后 2 小节淡出）cc_edit.py 不能直接表达，需要单独处理；两处故意的接口（尾音接第 11 小节、第 18 小节接第 3 小节）要试听并跑接缝、响度和咔哒检查，不行就按 music.fallbacks 换，场景长度不变。剪完重新生成 map.json 和 energy.json。',
    '分镜检查：story/check_storyboard.py 第 10 条把 s11 写死为片尾考题场；v2 的片尾考题场是 s10，要改。',
    '复用代码：scenes_v1 的 s01 到 s05 是按 Epic Vista（4/4，94 BPM，一小节 2.553 秒）卡的点，要改成 3/4、96 BPM（一小节 1.875 秒，一拍 0.625 秒，十六分音符 0.15625 秒），时长按本表改。',
    '卡点：《Cornfield Chase》没有鼓，“鼓点处闪光”改为卡小节强拍、新声部进入点（见各场 bar_lines 和 cues）和十六分音符。',
    's06 的 visual_text（50 词段落、8 个含 evidence 的原文片段，同屏不超过 3 个）照 v1 分镜 s06 搬过来。',
    '备用版（Epic Vista，CC0）：同一套画面剪到 165.592 秒，场景切换和 111.842 秒的恍然大悟尽量对齐它的小节线和爆发点；这是单独的一步。',
]

ROLE_EN = {'quiet ostinato': '安静的固定音型', 'layer entry': '新声部进入', 'build': '推进', 'climax': '高潮',
           'resolution': '收束'}


def need_text(s):
    return max(1.6, 0.6 + len(re.sub(r'\s', '', s)) / 6)


plan_scenes, fails = [], []
for sid, b0, b1 in SPLIT:
    sb = bars[b0 - 1:b1]
    start = sb[0]['start']
    end = bars[b1]['start'] if b1 < len(bars) else TOTAL
    dur = round(end - start, 3)
    rel = [round(b['start'] - start, 3) for b in sb]
    d = S[sid]

    def tm(x):
        if isinstance(x, tuple):
            k, beat = x[0], x[1]
            return round(rel[k] + beat * BEAT + (x[2] if len(x) > 2 else 0.0), 3)
        return round(x, 3)

    texts = []
    for a, b, role, txt in d['texts']:
        i, o = tm(a), tm(b)
        texts.append({'in': i, 'out': o, 'role': role, 'text': txt})
        if role == 'source' and sid == 's10':
            pass
        if o - i + 1e-6 < need_text(txt):
            fails.append('%s "%s" %.3f < %.3f' % (sid, txt, o - i, need_text(txt)))
        if i < 0 or o > dur + 1e-6:
            fails.append('%s "%s" outside the scene' % (sid, txt))
        if re.search(r'[—–]', txt):
            fails.append('%s dash in "%s"' % (sid, txt))
    if sid == 's08':
        for tx in texts:
            if tx['text'] in ('不是重复看，', '而是反复想起。'):
                tx['aha'] = True
    srcs = sorted([(t['in'], t['out'], t['text']) for t in texts if t['role'] == 'source'])
    if sid != 's10':  # s10 shows its three source lines as one block
        for (a1, b1_, k1), (a2, b2, k2) in zip(srcs, srcs[1:]):
            if a2 < b1_ - 1e-6:
                fails.append('%s two sources at once: %s / %s' % (sid, k1, k2))
    cues = []
    for k, beat, what in d['cues']:
        tt = round(rel[k] + beat * BEAT, 3)
        cues.append({'t': tt, 'global': round(start + tt, 3), 'bar_in_scene': k + 1, 'beat': beat + 1, 'what': what})
    plan_scenes.append({
        'id': sid, 'start': start, 'duration': dur, 'end': round(end, 3), 'bars': len(sb),
        'energy': d['energy'], 'music_role': d['role'], 'music_role_zh': ROLE_EN[d['role']],
        'derived_from': d['derived_from'], 'summary': d['summary'], 'color_temp': d['temp'],
        'signature': d['signature'], 'music': d['music'],
        'source_bars': [b['src'] for b in sb],
        'bar_lines': [{'t': r, 'global': b['start'], 'src_bar': b['src'], 'chord': b['chord'], 'section': b['section']}
                      for r, b in zip(rel, sb)],
        'cues': cues, 'texts': texts, 'reuse': d['reuse']})

burst = next(b['start'] for b in bars if b['src'] == 24)
climax = next(b['start'] for b in bars if b['src'] == 62)
stop = bars[[b['src'] for b in bars].index('tail')]['start']
sc = {s['id']: s for s in plan_scenes}

plan = {
    'title': '如何真正学好英语',
    'version': 'v2 Cornfield Chase（用户 2026-11-19 更正：片长由内容决定）',
    'total': TOTAL, 'total_mmss': '%d:%04.1f' % (TOTAL // 60, TOTAL % 60), 'scene_count': len(plan_scenes),
    'thesis': '记住一个单词，不靠一遍遍重复看；靠在读得懂的句子里一次次遇见它，再一次次合上书把它想起来，隔几天再想一次。',
    'aha': {'scene': 's08', 'text': '不是重复看，而是反复想起。',
            'line1': {'text': '不是重复看，', 'in_scene': 0.0, 'global': climax, 'music': '原曲第 62 小节 F 强拍（全曲最满的一刻），剪辑后第 %d 小节' % ([b['src'] for b in bars].index(62) + 1)},
            'line2': {'text': '而是反复想起。', 'in_scene': 1.875, 'global': round(climax + 1.875, 3), 'music': '下一个强拍（原曲第 63 小节）'},
            'fraction_of_film': round(climax / TOTAL, 3),
            'note': 's07 最后半拍画面全黑；高潮在剪辑里只出现这一次（最后一次经过），之后是原曲自己的急停。'},
    'quote': {'scene': 's10', 'text': '多看一遍，不如合上书想一遍。', 'note': '句号是母题光点，落在 G 强拍'},
    'music': {
        'source': 'A/music/user/cornfield_chase.mp3（96 BPM，3/4，一小节 1.875 秒，一拍 0.625 秒，十六分音符 0.15625 秒）',
        'segments': [{'seg': s, 'source_bars': b, 'note': n} for s, b, n in SEGMENTS],
        'cc_edit_segments_until_stop': [[1, 10], [6, 22], [20, 22], [21, 38], [46, 65]],
        'after_stop': '原曲急停（第 65 小节线）后保留 2 小节混响尾音，然后 [11,14]、[10,19]、[3,10]、[6,11]，最后 2 小节淡出（fade_out_s 3.75）',
        'burst': burst, 'climax': climax, 'music_stop': stop, 'fade_out': [round(TOTAL - 3.75, 3), TOTAL],
        'output_bars': bars,
        'rules_kept': ['只在小节线剪接，循环都是整小节，拍网格连续', '只用 A、B 级循环和 A 级跳转 38->46',
                       '高潮（第 62 到 64 小节）只经过一次，且是最后一次经过', '不改音高，不改速度',
                       '跳回前奏只在急停之后（尾声，故意的一口气，不是藏起来的接缝）'],
        'fallbacks': ['若“尾音 2 小节后进第 11 小节”试听不自然：在第 65 小节线直接接第 11 小节（cc_map 的 E2，625 ms 等功率），或尾音后接第 3 小节，场景长度不变',
                      '若“第 18 小节后进第 3 小节”不自然：改进第 1 或第 2 小节（多 1 到 2 小节近乎无声的思考时间），s10 同步加长整小节',
                      '屏息段加长若觉得太久：改用 23->20（B 级，同样加 3 小节）或只加 2 小节（s04 少 1.875 秒，需重排 s04 文字）']},
    'signature_shots': [
        {'scene': 's03', 'name': '熄灯之城，遗忘瀑布', 'music_moments': [sc['s03']['start'], round(sc['s03']['start'] + 7.5, 3)]},
        {'scene': 's04', 'name': 'abandon 无限楼梯', 'music_moments': [sc['s04']['start'], round(sc['s04']['start'] + 6.875, 3), round(sc['s04']['start'] + 18.125, 3)]},
        {'scene': 's06', 'name': '第 50 个词，相遇星图', 'music_moments': [sc['s06']['start'], round(sc['s06']['start'] + 7.5, 3), round(sc['s06']['start'] + 11.25, 3)]},
        {'scene': 's08', 'name': '合书点火，万家灯火', 'music_moments': [climax, stop, round(climax + 9.375, 3)]},
        {'scene': 's10', 'name': '光点归位，方法卡定格', 'music_moments': [round(sc['s10']['start'] + 3.75, 3), round(sc['s10']['start'] + 15.0, 3), round(sc['s10']['start'] + 18.75, 3)]}],
    'must_keep_three': ['s03 熄灯之城，遗忘瀑布', 's06 第 50 个词，相遇星图', 's08 合书点火，万家灯火'],
    'motif': {'name': '一粒光：evidence 里字母 i 上的那个点，也就是这个词的记忆（亮度 = 还记得多少，色温 = 全片温度计）',
              'path': ['s01 evidence 的 i 点（冷白蓝），离开单词飘走', 's02 城里第一扇亮的窗', 's03 带着 evidence 沿遗忘曲线滑落、变暗到 30%',
                       's04 扣着的两张方法卡卡背中央的光点', 's05 爆发时落进光河，化成河面暖色光点', 's06 50 个词里唯一没亮的 i 点，每遇见一次亮一档',
                       's07 被夹在合上的书脊里，越闪越快', 's08 炸开飞进学习者的头，冲击波点亮全城', 's09 金楼楼顶的星；翻开的两张卡',
                       's10 落回 ı 上（暖金），成为金句句号和方法卡右上角的装饰']},
    'evidence_count_before_s10': 14,
    'rationale': RATIONALE,
    'changes_from_v1': CHANGES,
    'downstream_notes': NOTES,
    'scenes': plan_scenes,
}
if fails:
    print('FAIL'); [print(' ', f) for f in fails]; sys.exit(1)
json.dump(plan, open(os.path.join(A, 'story/plan.json'), 'w'), ensure_ascii=False, indent=1)

# ---- plan.md (same data) ----
L = []
w = L.append
w('# 《如何真正学好英语》v2 场景规划（配乐：Hans Zimmer《Cornfield Chase》）')
w('')
w('机器可读版本是同目录的 plan.json，两者由 story/tools/make_plan.py 一起生成，数字一致。时间单位是秒；“全片”指剪辑后的配乐时间轴，“场内”指相对场景开头。')
w('')
w('## 1. 结论')
w('')
w('- 片名：**%s**' % plan['title'])
w('- 总长：**%.3f 秒（%s）**，10 个场景，全部从剪辑后配乐的小节线开始。' % (TOTAL, plan['total_mmss']))
w('- 恍然大悟：**s08 第 0 秒**，“不是重复看，”落在全片 %.3f 秒（原曲第 62 小节 F 强拍，全曲最满的一刻）；“而是反复想起。”在场内 1.875 秒（全片 %.3f 秒，下一个强拍）砸入。位置在全片 %.1f%%。' % (climax, climax + 1.875, 100 * climax / TOTAL))
w('- 全曲最强的一击（原曲 42.467 秒）在全片 %.3f 秒，是 s05 第 0 秒：全片第一缕暖光。音乐急停在全片 %.3f 秒。' % (burst, stop))
w('- 评论区金句：s10 的“多看一遍，不如合上书想一遍。”')
w('')
w('## 2. 场景表')
w('')
w('| 场 | 开始 | 时长 | 小节 | 能量 | 音乐角色 | 来自 v1 | 这一场讲什么 |')
w('|---|---|---|---|---|---|---|---|')
for s in plan_scenes:
    w('| %s | %.3f | %.3f | %d | %d | %s（%s） | %s | %s |' % (s['id'], s['start'], s['duration'], s['bars'], s['energy'], s['music_role'], s['music_role_zh'], '、'.join(s['derived_from']), s['summary']))
w('| 合计 |  | %.3f | %d |  |  |  |  |' % (TOTAL, len(bars)))
w('')
w('能量曲线（1 到 10）：')
w('')
w('```')
for s in plan_scenes:
    w('%s %7.3fs %s %d  %s' % (s['id'], s['start'], '█' * s['energy'] + '░' * (10 - s['energy']), s['energy'], s['music_role']))
w('```')
w('')
w('s07 画面颜色退冷（低谷），但张力随 build_2 一路上顶到 9；s08 到 10 后音乐急停，s09、s10 是安静温暖的尾声。')
w('')
w('## 3. 为什么这样定')
w('')
for r in RATIONALE:
    w('- ' + r)
w('')
w('## 4. 配乐剪辑方案（只在小节线剪）')
w('')
w('96 BPM，3/4 拍，一小节 1.875 秒，一拍 0.625 秒，十六分音符 0.15625 秒；第 18 小节只有 2 拍。')
w('')
w('| 段 | 原曲小节（按播放顺序） | 说明 |')
w('|---|---|---|')
for sg in plan['music']['segments']:
    w('| %s | %s | %s |' % (sg['seg'], ' '.join(map(str, sg['source_bars'])), sg['note']))
w('')
w('急停前可直接交给 cc_edit.py：`{"segments": %s}` 到第 65 小节线为止；%s。' % (json.dumps(plan['music']['cc_edit_segments_until_stop']), plan['music']['after_stop']))
w('')
w('守住的规则：' + '；'.join(plan['music']['rules_kept']) + '。')
w('')
w('备选：')
w('')
for f in plan['music']['fallbacks']:
    w('- ' + f)
w('')
w('## 5. 名场面与母题')
w('')
for sh in plan['signature_shots']:
    w('- %s「%s」：卡在全片 %s 秒' % (sh['scene'], sh['name'], '、'.join('%.3f' % x for x in sh['music_moments'])))
w('')
w('必须保住的三个：' + '；'.join(plan['must_keep_three']) + '。另外两个（abandon 无限楼梯、光点归位方法卡定格）也全部保留。')
w('')
w('母题：' + plan['motif']['name'])
w('')
for p_ in plan['motif']['path']:
    w('- ' + p_)
w('')
w('## 6. 逐场')
for s in plan_scenes:
    w('')
    w('### %s（全片 %.3f 到 %.3f，%.3f 秒，%d 小节，能量 %d，%s，色温 %s）' % (s['id'], s['start'], s['end'], s['duration'], s['bars'], s['energy'], s['music_role_zh'], s['color_temp']))
    w('')
    w('**讲什么：** ' + s['summary'])
    if s['signature']:
        w('')
        w('**名场面：** ' + s['signature'])
    w('')
    w('**音乐：** ' + s['music'])
    w('')
    w('**小节线（场内秒 / 原曲小节 / 和弦）：** ' + '；'.join('%.3f / %s / %s' % (b['t'], b['src_bar'], b['chord']) for b in s['bar_lines']))
    w('')
    w('**卡点：**')
    w('')
    for c in s['cues']:
        w('- 场内 %.3f（全片 %.3f，第 %d 小节第 %s 拍）：%s' % (c['t'], c['global'], c['bar_in_scene'], ('%g' % c['beat']), c['what']))
    w('')
    w('| 入 | 出 | 角色 | 文字 |')
    w('|---|---|---|---|')
    for t in sorted(s['texts'], key=lambda t: (t['in'], t['role'])):
        w('| %.3f | %.3f | %s | %s%s |' % (t['in'], t['out'], t['role'], t['text'], '（恍然大悟）' if t.get('aha') else ''))
    w('')
    w('**代码：** ' + s['reuse'])
w('')
w('## 7. 相比 v1 的改动')
w('')
for c in CHANGES:
    w('- ' + c)
w('')
w('## 8. 下游注意')
w('')
for n_ in NOTES:
    w('- ' + n_)
w('')
open(os.path.join(A, 'story/plan.md'), 'w').write('\n'.join(L))
print('total %.3f s (%s), burst %.3f, climax %.3f (%.1f%%), stop %.3f' % (TOTAL, plan['total_mmss'], burst, climax, 100 * climax / TOTAL, stop))
for s in plan_scenes:
    print('%s %8.3f %7.3f  %2d bars  E%-2d %-15s %s' % (s['id'], s['start'], s['duration'], s['bars'], s['energy'], s['music_role'], ','.join(map(str, s['source_bars']))))
