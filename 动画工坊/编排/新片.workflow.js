export const meta = {
  name: 'anim-new-film',
  description: '从零做一部纯音乐 4K 动画短片：立项、证据、配乐分析、内容计划、配乐剪辑与质检、分镜与事实核查、逐场构建与审查、推送 GitHub 出 4K、导演打磨、备用配乐、终检、发布',
  whenToUse: '做一部新的纯音乐横屏 4K 动画（B站）。参数和用法见 动画工坊/编排/README.md',
  phases: [
    { title: 'Setup', detail: '建作品目录，写本片 BRIEF.md' },
    { title: 'Music', detail: '配乐分析（search 模式先选曲），同时查证据、写内容草稿' },
    { title: 'Plan', detail: '合成内容计划：论点、结构、片长由内容定' },
    { title: 'Edit', detail: '按计划剪配乐，对抗式音乐质检，通过后入库（受限音频只存加密文件）' },
    { title: 'Story', detail: '按剪好的配乐写分镜，事实核查' },
    { title: 'Scenes', detail: '逐场构建，然后对抗式审查（pipeline）' },
    { title: 'Assemble', detail: '本机只出 1080p 检查片段；推送，GitHub 分片出 4K 预览' },
    { title: 'Polish', detail: '导演看全片挑 3 到 5 处，每处一个代理修' },
    { title: 'Backup', detail: '同一套画面配 CC0 备用配乐（licensed 模式）' },
    { title: 'QA', detail: '画面、声音两路终检' },
    { title: 'Release', detail: '推送，GitHub 出 4K 并发布 Release' },
  ],
}

// ---------------- 参数（全部走 args，见 动画工坊/编排/README.md） ----------------
const a = args || {}
const need = (v, name) => { if (v === undefined || v === null || v === '') throw new Error('缺少参数 ' + name + '（见 动画工坊/编排/README.md）'); return v }
const W = need(a.film, 'film（作品目录，仓库里的 动画工坊/作品/<片名>）')
const S = need(a.work, 'work（工作目录，仓库外，放受限音频明文和大文件）')
const TITLE = need(a.title, 'title（片名）')
const SLUG = need(a.slug, 'slug（英文短名：小写字母、数字、连字符）')
const TOPIC = need(a.topic, 'topic（主题和想让观众认同的观点）')
const STYLE = a.style || '经典级、特别惊艳、让人愿意反复看；纯音乐、无配音，用文字和动画表达；不是文字幻灯片'
const DUR = Array.isArray(a.duration) && a.duration.length === 2 ? a.duration : [150, 190]
const DUR_TXT = DUR[0] + ' 到 ' + DUR[1]
const M = a.music || {}
const MODE = M.mode || 'search'
if (!['licensed', 'cc0', 'search'].includes(MODE)) throw new Error('music.mode 只能是 licensed、cc0、search')
if (MODE !== 'search') need(M.file, 'music.file（licensed、cc0 模式的曲子文件）')
if (MODE === 'licensed') need(M.key_file, 'music.key_file（本机密钥文件，只用 export MUSIC_KEY="$(cat 文件)" 读）')
const BACKUP = M.backup || 'freepd.com 等 CC0 曲库里和主配乐气质最接近的一首'
const CREDIT = a.credit || 'B站UP主 朋克英语'
const TPL = a.template || '动画工坊/作品/如何真正学好英语'
const P = a.prompts || '动画工坊/编排/提示词'
const BRANCH = need(a.branch, 'branch（推送的分支，必须在 anim-render.yml 的触发分支里）')
const SHARDS = a.shards || 12
const RELEASE = a.release !== false
const SKIP = new Set(a.skip || [])          // 可选：drafts、polish、backup、preview
const REUSE = a.reuse || ''                 // 旧版场景代码目录（分镜 derived_from 指向的），没有就空
const AUDIO = a.audio || (S + '/music/score.wav')
const SRC = MODE === 'licensed' ? S + '/music/user/' + String(M.file).split('/').pop()
  : MODE === 'cc0' ? M.file : '音乐分析阶段选定的曲子（见 ' + S + '/music/analysis.md）'
const OUT_MUSIC = MODE === 'licensed' ? 'main' : 'backup'
const DEFAULT_ANGLES = [
  { key: 'myth', brief: '破除误区：从一个扎心又常见的真相开场，用可视化讲清背后的真实机制，再给几条忘不掉的方法，以一句可引用的话和一张值得截图的方法卡收尾。' },
  { key: 'journey', brief: '情感旅程：一个无脸的学习者（剪影、线条小人或发光的点）从挫败走向发现再到熟练，每一站用一个强有力的插画隐喻揭示一条原理。' },
  { key: 'system', brief: '数据可视化：让看不见的东西被看见，像高级科普片一样精确又有电影感，有一个真三维名场面，结尾是完整的方法闭环和方法卡。' },
]
const ANGLES = SKIP.has('drafts') ? [] : (a.angles || DEFAULT_ANGLES)

// ---------------- 小工具 ----------------
const BASE = { 作品目录: W, 工作目录: S }
const use = (file, vars, extra) => '读 ' + P + '/' + file + '.md，严格照做。变量：\n' +
  Object.entries(Object.assign({}, BASE, vars || {})).map(([k, v]) => '- {' + k + '} = ' + v).join('\n') +
  (extra ? '\n\n补充：' + extra : '')
const DONE = { type: 'object', properties: { ok: { type: 'boolean' }, notes: { type: 'string' }, files: { type: 'array', items: { type: 'string' } } }, required: ['ok', 'notes'] }
const REVIEW = { type: 'object', properties: { id: { type: 'string' }, verdict: { type: 'string', enum: ['pass', 'fixed', 'fail'] }, issues: { type: 'array', items: { type: 'string' } }, fixes: { type: 'array', items: { type: 'string' } } }, required: ['verdict', 'issues', 'fixes'] }
const SB = { type: 'object', properties: { title: { type: 'string' }, total: { type: 'number' }, rationale: { type: 'string' },
  scenes: { type: 'array', items: { type: 'object', properties: { id: { type: 'string' }, start: { type: 'number' }, duration: { type: 'number' }, summary: { type: 'string' }, derived_from: { type: 'array', items: { type: 'string' } } }, required: ['id', 'start', 'duration', 'summary'] } } },
  required: ['title', 'total', 'scenes', 'rationale'] }
const POLISH = { type: 'object', properties: { verdict: { type: 'string' }, targets: { type: 'array', items: { type: 'object', properties: { scene: { type: 'string' }, problem: { type: 'string' }, improvement: { type: 'string' } }, required: ['scene', 'problem', 'improvement'] } } }, required: ['verdict', 'targets'] }
const RUN = { type: 'object', properties: { ok: { type: 'boolean' }, notes: { type: 'string' }, run_url: { type: 'string' }, release_url: { type: 'string' },
  metrics: { type: 'object', properties: { frames: { type: 'number' }, fps: { type: 'number' }, lufs: { type: 'number' }, true_peak: { type: 'number' }, music: { type: 'string' } } },
  files: { type: 'array', items: { type: 'string' } } }, required: ['ok', 'notes'] }
const RENDER = (o) => use('出片', { 片名: TITLE, 英文短名: SLUG, 分支: BRANCH, 配乐: OUT_MUSIC, 段数: SHARDS, 本机配乐: AUDIO,
  发布: o.release ? 'true' : 'false', 说明: o.note, 检查片段: o.clips, 封面: o.cover ? 'yes' : 'no' }, o.extra)

// ---------------- Setup ----------------
phase('Setup')
const setup = await agent(use('立项', { 片名: TITLE, 英文短名: SLUG, 模板作品: TPL, 主题: TOPIC, 风格: STYLE, 片长范围: DUR_TXT,
  配乐模式: MODE, 配乐文件: M.file || '无（search 模式）', 配乐说明: M.note || '无', 备用配乐: BACKUP, 署名: CREDIT },
  a.evidence ? '已有证据文件 ' + a.evidence + '：复制成 ' + W + '/story/EVIDENCE.md，后面不再查证据。' : ''),
  { label: 'setup', phase: 'Setup', schema: DONE })
if (!setup || !setup.ok) throw new Error('立项没完成：' + (setup ? setup.notes : '代理没有返回'))

// ---------------- Music：配乐分析，同时查证据、写草稿 ----------------
phase('Music')
const [ana, drafts] = await parallel([
  () => agent(use('音乐分析', { 配乐模式: MODE, 配乐文件: M.file || '无（search 模式，先选曲）' }), { label: 'music-analysis', phase: 'Music', schema: DONE }),
  async () => {
    if (!a.evidence) await agent(use('证据', { 主题: TOPIC }), { label: 'evidence', phase: 'Music', schema: DONE })
    if (ANGLES.length < 2) return []
    return parallel(ANGLES.map(g => () => agent(use('内容草稿', { 主题: TOPIC, 角度名: g.key, 角度: g.brief, 片长范围: DUR_TXT, 署名: CREDIT }),
      { label: 'draft:' + g.key, phase: 'Music', schema: SB })))
  },
])
if (!ana || !ana.ok) throw new Error('配乐分析没完成：' + (ana ? ana.notes : '代理没有返回'))
log('配乐分析完成；内容草稿 ' + (drafts || []).filter(Boolean).length + ' 份')

// ---------------- Plan ----------------
phase('Plan')
const plan = await agent(use('内容计划', { 主题: TOPIC, 片长范围: DUR_TXT, 署名: CREDIT }), { label: 'plan', phase: 'Plan', schema: SB })
if (!plan || !plan.scenes || !plan.scenes.length) throw new Error('内容计划没有场景')

// ---------------- Edit：剪配乐，质检不过就再剪一轮 ----------------
phase('Edit')
let mqa = null
for (let round = 1; round <= 2; round++) {
  const fix = mqa && mqa.issues && mqa.issues.length ? '上一轮音乐质检没通过，先解决这些问题：' + mqa.issues.join('；') : ''
  await agent(use('音乐剪辑', { 原曲: SRC }, fix), { label: 'music-edit' + (round > 1 ? '#' + round : ''), phase: 'Edit', schema: DONE })
  mqa = await agent(use('音乐质检', { 原曲: SRC, 配乐模式: MODE, 密钥文件: M.key_file || '无（不是 licensed 模式，不加密）' }),
    { label: 'music-qa' + (round > 1 ? '#' + round : ''), phase: 'Edit', schema: REVIEW })
  if (mqa && mqa.verdict !== 'fail') break
}
if (!mqa || mqa.verdict === 'fail') throw new Error('配乐质检两轮没通过（质量问题，必须停）：' + (mqa ? mqa.issues.join('；') : '代理没有返回'))

// ---------------- Story ----------------
phase('Story')
const timed = await agent(use('分镜', {}), { label: 'storyboard', phase: 'Story', schema: SB })
const fact = await agent(use('事实核查', { 署名: CREDIT }), { label: 'fact-check', phase: 'Story', schema: SB })
const SC = fact && fact.scenes && fact.scenes.length ? fact : timed
if (!SC || !SC.scenes || !SC.scenes.length) throw new Error('分镜没有场景')
log('分镜：' + SC.scenes.length + ' 场，' + SC.total + ' 秒；音乐质检 ' + mqa.verdict)

// ---------------- Scenes：每场构建后立刻审查 ----------------
phase('Scenes')
const reuseOf = s => (REUSE && s.derived_from && s.derived_from.length) ? REUSE + ' 里的 ' + s.derived_from.join('、') : '无'
const scenes = await pipeline(SC.scenes,
  s => agent(use('场景构建', { 场景: s.id, 开始: s.start, 时长: s.duration, 概要: s.summary, 复用: reuseOf(s), 本机配乐: AUDIO }),
    { label: 'build:' + s.id, phase: 'Scenes', schema: DONE }),
  (b, s) => agent(use('场景审查', { 场景: s.id, 开始: s.start, 时长: s.duration, 构建说明: b ? b.notes : '构建代理失败了，你来从头构建这一场（按 ' + P + '/场景构建.md）' }),
    { label: 'review:' + s.id, phase: 'Scenes', schema: REVIEW }),
)
const failed = SC.scenes.filter((s, i) => !scenes[i] || scenes[i].verdict === 'fail')
if (failed.length) {
  log('审查没通过的场景再修一轮：' + failed.map(s => s.id).join(', '))
  await parallel(failed.map(s => () => agent(use('场景修改', { 场景: s.id,
    问题: (scenes[SC.scenes.indexOf(s)] || { issues: ['审查代理没有返回'] }).issues.join('；'), 改法: '逐条解决这些问题，再按 ' + P + '/场景审查.md 自查一遍' }),
    { label: 'refix:' + s.id, phase: 'Scenes', schema: REVIEW })))
}
log('场景：' + scenes.map((x, i) => SC.scenes[i].id + ':' + (x ? x.verdict : 'null')).join(', '))

// ---------------- Assemble（预览）、Polish、Backup 并行 ----------------
const aha = '“恍然大悟”那句前后各 6 秒（时刻见 ' + W + '/music/map.json 的 climax）'
const CLIPS = '片头 0 到 6 秒；' + aha + '；片尾最后 6 秒'
phase('Assemble')
const [preview, review, backup] = await parallel([
  () => SKIP.has('preview') ? null : agent(RENDER({ release: false, cover: true, clips: CLIPS, note: TITLE + ' 预览（打磨前）',
    extra: '这次是预览：GitHub 运行失败只报告原因和注解，不改场景文件、不重推（打磨和终检阶段会处理）。备用配乐正在并行制作，这次不提交 music/backup/。' }),
    { label: 'assemble:github-preview', phase: 'Assemble', schema: RUN }),
  () => SKIP.has('polish') ? null : agent(use('导演打磨', {}), { label: 'director-review', phase: 'Polish', schema: POLISH }),
  () => (MODE !== 'licensed' || SKIP.has('backup')) ? null : agent(use('备用配乐', { 备用曲: BACKUP }), { label: 'backup-music', phase: 'Backup', schema: DONE }),
])
if (preview) log('GitHub 预览：' + (preview.ok ? '通过' : '有问题') + ' ' + (preview.run_url || ''))

phase('Polish')
const targets = ((review && review.targets) || []).slice(0, 5)
const polish = await parallel(targets.map((t, i) => () => agent(use('场景修改', { 场景: t.scene, 问题: t.problem, 改法: t.improvement }),
  { label: 'polish:' + t.scene + ':' + i, phase: 'Polish', schema: REVIEW })))

// ---------------- QA ----------------
phase('QA')
const qa = await parallel(['画面', '声音'].map(x => () => agent(use('最终质检', { 方面: x, 本机配乐: AUDIO }),
  { label: 'final-qa:' + x, phase: 'QA', schema: REVIEW })))

// ---------------- Release ----------------
phase('Release')
const rel = await agent(RENDER({ release: RELEASE, cover: SKIP.has('preview'), clips: aha, note: TITLE + (RELEASE ? ' 正式版' : ' 终检后版本'),
  extra: '导演打磨改过的场景（' + (targets.map(t => t.scene).join('、') || '无') + '）如果包含封面镜头，重做封面。' }),
  { label: 'release:github', phase: 'Release', schema: RUN })

return {
  title: SC.title, total: SC.total, scenes: SC.scenes.map((s, i) => ({ id: s.id, start: s.start, duration: s.duration, verdict: scenes[i] ? scenes[i].verdict : null })),
  musicQA: { verdict: mqa.verdict, issues: mqa.issues }, preview, director: review, polish, qa, backup, release: rel,
}
