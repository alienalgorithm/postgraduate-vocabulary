export const meta = {
  name: 'anim-revise-scenes',
  description: '省 token 改片：只重做指定场景（修改、对抗式审查），然后推送，由 GitHub 出 4K（可发布 Release）；不碰其他场景',
  whenToUse: '已有作品只改几场的画面或字。只改分镜文字不需要它（直接改 storyboard.json 推送即可，见 动画工坊/编排/README.md）',
  phases: [
    { title: 'Fix', detail: '每场一个代理按要求修改，改完立刻对抗式审查（pipeline）' },
    { title: 'Render', detail: '本机只出改动场景的 1080p 检查片段；推送，GitHub 出 4K' },
  ],
}

// ---------------- 参数（见 动画工坊/编排/README.md） ----------------
const a = args || {}
const need = (v, name) => { if (v === undefined || v === null || v === '' || (Array.isArray(v) && !v.length)) throw new Error('缺少参数 ' + name + '（见 动画工坊/编排/README.md）'); return v }
const W = need(a.film, 'film（作品目录，仓库里的 动画工坊/作品/<片名>）')
const LIST = need(a.scenes, 'scenes（场景号列表，例如 ["s03","s07"]）')
const REQ = need(a.request, 'request（修改要求：一句话对所有场景，或 {"s03":"...","s07":"..."} 逐场）')
const TITLE = need(a.title, 'title（片名，和 film.json 的 title 一样）')
const SLUG = need(a.slug, 'slug（英文短名，用于渲染请求 id）')
const BRANCH = need(a.branch, 'branch（推送的分支，必须在 anim-render.yml 的触发分支里）')
const S = a.work || '${TMPDIR:-/tmp}/anim-work/' + SLUG   // 工作目录（仓库外，放临时文件；代理在 shell 里展开）
const AUDIO = a.audio || (S + '/music/score.wav')
const P = a.prompts || '动画工坊/编排/提示词'
const MUSIC = a.music || 'main'
const SHARDS = a.shards || 12
const RELEASE = a.release !== false
const REVIEW_ON = a.review !== false
const RENDER_ON = a.render !== false
const reqOf = id => typeof REQ === 'string' ? REQ : (REQ[id] || '')
const missing = LIST.filter(id => !reqOf(id))
if (missing.length) throw new Error('这些场景没有修改要求：' + missing.join(', '))

const BASE = { 作品目录: W, 工作目录: S }
const use = (file, vars, extra) => '读 ' + P + '/' + file + '.md，严格照做。变量：\n' +
  Object.entries(Object.assign({}, BASE, vars || {})).map(([k, v]) => '- {' + k + '} = ' + v).join('\n') +
  (extra ? '\n\n补充：' + extra : '')
const REVIEW = { type: 'object', properties: { id: { type: 'string' }, verdict: { type: 'string', enum: ['pass', 'fixed', 'fail'] }, issues: { type: 'array', items: { type: 'string' } }, fixes: { type: 'array', items: { type: 'string' } } }, required: ['verdict', 'issues', 'fixes'] }
const RUN = { type: 'object', properties: { ok: { type: 'boolean' }, notes: { type: 'string' }, run_url: { type: 'string' }, release_url: { type: 'string' },
  metrics: { type: 'object', properties: { frames: { type: 'number' }, fps: { type: 'number' }, lufs: { type: 'number' }, true_peak: { type: 'number' }, music: { type: 'string' } } },
  files: { type: 'array', items: { type: 'string' } } }, required: ['ok', 'notes'] }
const FROM_SB = '（读 ' + W + '/story/storyboard.json 里本场的 start 和 duration）'

// ---------------- Fix ----------------
phase('Fix')
const stages = [
  id => agent(use('场景修改', { 场景: id, 问题: '用户要求修改这一场', 改法: reqOf(id) },
    '只改 scenes/' + id + '.js（要求改字时只改 storyboard.json 里本场的 texts）。别的场景同时在被别的代理修改，不要碰。'),
    { label: 'fix:' + id, phase: 'Fix', schema: REVIEW }),
]
if (REVIEW_ON) stages.push((r, id) => agent(use('场景审查', { 场景: id, 开始: FROM_SB, 时长: FROM_SB,
  构建说明: '这一场刚按要求改过：' + reqOf(id) + '。修改者的说明：' + (r ? r.fixes.join('；') : '修改代理失败了，你按要求改完再审') }),
  { label: 'review:' + id, phase: 'Fix', schema: REVIEW }))
const fixed = await pipeline(LIST, ...stages)
log('改片：' + LIST.map((id, i) => id + ':' + (fixed[i] ? fixed[i].verdict : 'null')).join(', '))
const bad = LIST.filter((id, i) => !fixed[i] || fixed[i].verdict === 'fail')
if (bad.length) throw new Error('这些场景审查没通过（质量问题，先不出片）：' + bad.join(', ') + '。详情见各代理的 issues')

// ---------------- Render ----------------
phase('Render')
const run = RENDER_ON ? await agent(use('出片', { 片名: TITLE, 英文短名: SLUG, 分支: BRANCH, 配乐: MUSIC, 段数: SHARDS, 本机配乐: AUDIO,
  发布: RELEASE ? 'true' : 'false', 说明: TITLE + ' 改片：' + LIST.join('、'), 封面: 'no',
  检查片段: '只出改动的场景 ' + LIST.join('、') + ' 各自的时间段' + FROM_SB },
  '只提交这次改动的场景文件、storyboard.json 和渲染请求；封面镜头在改动场景里时重做封面。'),
  { label: 'render:github', phase: 'Render', schema: RUN }) : null

return { scenes: LIST.map((id, i) => ({ id, verdict: fixed[i] ? fixed[i].verdict : null, issues: fixed[i] ? fixed[i].issues : [] })), render: run }
