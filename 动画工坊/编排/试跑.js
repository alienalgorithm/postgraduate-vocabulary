#!/usr/bin/env node
// 试跑工作流模板（不启动任何代理）：用假的 agent/parallel/pipeline 把模板从头跑到尾，
// 打印每次代理调用（阶段、标签、用的提示词），并核对提示词文件存在、模板传的变量和提示词要的变量一一对上。
// 用法：node 试跑.js <模板.workflow.js> <参数.json> [--fail 标签,标签] [--expect-throw]
//   --fail 让这些代理返回 fail，走失败分支；--expect-throw 表示这次预期模板会停下（例如配乐质检两轮不过）
// 改了模板或提示词就跑一次；退出码 0 通过，1 有问题。
'use strict';
const fs = require('fs');
const path = require('path');
const [file, argsFile, ...rest] = process.argv.slice(2);
if (!file || !argsFile) { console.error('用法：node 试跑.js <模板.workflow.js> <参数.json> [--fail 标签,...]'); process.exit(2); }
const failSet = new Set((rest[rest.indexOf('--fail') + 1] || '').split(',').filter(x => rest.includes('--fail') && x));
const root = path.resolve(__dirname, '..', '..');            // 仓库根
const src = fs.readFileSync(file, 'utf8');
const m = src.match(/^export const meta = (\{[\s\S]*?\n\})\n/);
if (!m) { console.error('没有 export const meta'); process.exit(1); }
const meta = Function('return ' + m[1])();                    // meta 必须是纯字面量
if (/Date\.now\(|Math\.random\(|new Date\(\)/.test(src)) { console.error('模板里不能用 Date.now()、Math.random()、new Date()'); process.exit(1); }
const body = src.slice(m[0].length);
const args = JSON.parse(fs.readFileSync(argsFile, 'utf8'));
const problems = [];
const calls = [];
const phases = new Set(meta.phases.map(p => p.title));
const fake = (schema, label) => {
  const req = (schema && schema.required) || [];
  const bad = [...failSet].some(f => label.startsWith(f));
  if (req.includes('scenes')) return { title: '试跑', total: 30, rationale: 'r', scenes: [
    { id: 's01', start: 0, duration: 10, summary: '一', derived_from: ['s01'] },
    { id: 's02', start: 10, duration: 10, summary: '二', derived_from: [] },
    { id: 's03', start: 20, duration: 10, summary: '三' }] };
  if (req.includes('verdict') && req.includes('issues')) return { verdict: bad ? 'fail' : 'pass', issues: bad ? ['假问题'] : [], fixes: [] };
  if (req.includes('targets')) return { verdict: '好', targets: [{ scene: 's02', problem: 'p', improvement: 'i' }, { scene: 's03', problem: 'p', improvement: 'i' }] };
  return { ok: !bad, notes: bad ? '假失败' : '', run_url: 'https://example/run', metrics: {} };
};
const checkPrompt = (prompt, label) => {
  const h = prompt.match(/^读 (.+?)\.md，严格照做。变量：\n((?:- \{[^}]+\} = .*\n?)*)/);
  if (!h) { problems.push(label + '：提示词开头不是“读 <文件>.md，严格照做。变量：”'); return '?'; }
  const md = path.resolve(root, h[1] + '.md');
  if (!fs.existsSync(md)) { problems.push(label + '：提示词文件不存在 ' + md); return h[1]; }
  const given = new Set([...h[2].matchAll(/^- \{([^}]+)\} = (.*)$/gm)].map(x => { if (/undefined|\[object Object\]/.test(x[2])) problems.push(label + '：变量 ' + x[1] + ' 的值是 ' + x[2]); return x[1]; }));
  const text = fs.readFileSync(md, 'utf8');
  const decl = new Set([...(text.match(/^变量：(.*)$/m) || ['', ''])[1].matchAll(/\{([^}]+)\}/g)].map(x => x[1]));
  const used = new Set([...text.matchAll(/\{([一-龥]+)\}/g)].map(x => x[1]));
  for (const v of used) if (!decl.has(v)) problems.push(path.basename(md) + '：正文用了 {' + v + '}，但“变量：”一行没有列');
  for (const v of decl) if (!given.has(v)) problems.push(label + '：' + path.basename(md) + ' 要 {' + v + '}，模板没给');
  for (const v of given) if (!decl.has(v) && !['作品目录', '工作目录'].includes(v)) problems.push(label + '：给了 {' + v + '}，' + path.basename(md) + ' 没用');
  return path.basename(md);
};
let cur = '';
const env = {
  args,
  phase: t => { cur = t; if (!phases.has(t)) problems.push('phase(' + t + ') 不在 meta.phases 里'); },
  log: s => console.log('  log: ' + s),
  agent: async (prompt, o = {}) => {
    const label = o.label || '?', ph = o.phase || cur;
    if (o.phase && !phases.has(o.phase)) problems.push(label + '：phase ' + o.phase + ' 不在 meta.phases 里');
    if (calls.some(c => c.label === label)) problems.push('标签重复：' + label + '（续跑缓存会错位）');
    calls.push({ label, phase: ph, md: checkPrompt(prompt, label) });
    return fake(o.schema, label);
  },
  parallel: async thunks => Promise.all(thunks.map(t => Promise.resolve().then(t).catch(e => { problems.push('parallel 里抛错：' + e.message); return null; }))),
  pipeline: async (items, ...stages) => Promise.all(items.map(async (it, i) => {
    let r = it; for (const st of stages) { try { r = await st(r, it, i); } catch (e) { problems.push('pipeline 里抛错：' + e.message); return null; } } return r;
  })),
};
(async () => {
  const fn = new (Object.getPrototypeOf(async function () {}).constructor)(...Object.keys(env), body);
  let ret;
  try { ret = await fn(...Object.values(env)); } catch (e) { console.log('模板抛错：' + e.message); ret = undefined; if (!rest.includes('--expect-throw')) problems.push('模板抛错：' + e.message); }
  const byPhase = {};
  for (const c of calls) (byPhase[c.phase] = byPhase[c.phase] || []).push(c.label + '（' + c.md + '）');
  for (const [p, l] of Object.entries(byPhase)) console.log(p + '：' + l.join('，'));
  console.log('代理次数：' + calls.length + '（假数据：分镜 3 场，导演挑 2 处）');
  if (ret !== undefined) console.log('返回字段：' + Object.keys(ret).join('、'));
  if (problems.length) { console.log('问题 ' + problems.length + ' 条：\n- ' + [...new Set(problems)].join('\n- ')); process.exit(1); }
  console.log('通过');
})();
