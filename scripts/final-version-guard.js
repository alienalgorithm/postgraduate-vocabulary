#!/usr/bin/env node
'use strict';

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const DATA_DIR = path.join(ROOT, 'data');
const ARTICLE_DIR = path.join(ROOT, 'articles');
const MANIFEST_PATH = path.join(DATA_DIR, 'final-version-manifest.json');
const REPORT_PATH = path.join(ROOT, 'notes', '全库最终版本审计_2026-08-13.md');
const README_PATH = path.join(ROOT, 'README.md');
const HANDOFF_PATH = path.join(ROOT, 'notes', '对话交接文档.md');
const IRON_RULE_PATH = path.join(ROOT, 'notes', '最终版本铁律.md');

function loadArticles() {
  globalThis.window = globalThis;
  require(path.join(DATA_DIR, 'articles.js'));
  for (const file of fs.readdirSync(DATA_DIR).filter((name) => /^article-\d+\.js$/.test(name)).sort()) {
    require(path.join(DATA_DIR, file));
  }
  return [...globalThis.SITE.ARTICLES].sort((a, b) => String(a.id).localeCompare(String(b.id)));
}

function stable(value) {
  if (Array.isArray(value)) return value.map(stable);
  if (value && typeof value === 'object') {
    const result = {};
    for (const key of Object.keys(value).sort()) result[key] = stable(value[key]);
    return result;
  }
  return value;
}

function sha256(input) {
  return crypto.createHash('sha256').update(input).digest('hex');
}

function gitBlobSha(buffer) {
  const header = Buffer.from(`blob ${buffer.length}\0`, 'utf8');
  return crypto.createHash('sha1').update(header).update(buffer).digest('hex');
}

function canonicalFingerprint(article) {
  return sha256(Buffer.from(JSON.stringify(stable(article)), 'utf8'));
}

function markdownPath(article) {
  return path.join(ARTICLE_DIR, `${article.id}-${article.slug}.md`);
}

function normalizedMarkdown(file) {
  return fs.readFileSync(file, 'utf8').replace(/\r\n?/g, '\n');
}

function densityDisplay(value) {
  return Number(value).toFixed(1);
}

function readManifest() {
  if (!fs.existsSync(MANIFEST_PATH)) return { schema_version: 1, policy: 'latest-final-only', articles: [] };
  return JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8'));
}

function createManifest(articles, previous) {
  const oldById = new Map((previous.articles || []).map((entry) => [entry.id, entry]));
  const entries = articles.map((article) => {
    const old = oldById.get(article.id) || {};
    const file = markdownPath(article);
    if (!fs.existsSync(file)) throw new Error(`missing Markdown: ${path.relative(ROOT, file)}`);
    const raw = fs.readFileSync(file);
    const normalized = Buffer.from(normalizedMarkdown(file), 'utf8');
    return {
      id: article.id,
      slug: article.slug,
      title: article.title,
      title_zh: article.titleZh,
      version_id: old.version_id || `${article.id}-${article.metrics.words}-word-final-locked`,
      status: article.status,
      date: article.date,
      words: article.metrics.words,
      keywords: article.metrics.keywords,
      density: Number(article.metrics.density),
      source: old.source || 'current authoritative archive',
      source_verification: old.source_verification || 'conversation-latest-final',
      approved_source_blob_sha: old.approved_source_blob_sha || null,
      canonical_fingerprint_sha256: canonicalFingerprint(article),
      markdown_sha256: sha256(normalized),
      markdown_git_blob_sha: gitBlobSha(raw),
      superseded_signatures: old.superseded_signatures || [],
    };
  });
  return {
    schema_version: 1,
    policy: 'latest-final-only',
    audited_at: '2026-08-23',
    article_count: entries.length,
    keyword_count: entries.reduce((sum, entry) => sum + entry.keywords, 0),
    articles: entries,
  };
}

function validateManifest(articles, manifest) {
  const errors = [];
  const entries = manifest.articles || [];
  const byId = new Map(articles.map((article) => [article.id, article]));

  if (manifest.policy !== 'latest-final-only') errors.push('manifest policy is not latest-final-only');
  if (manifest.article_count !== articles.length) errors.push(`manifest article_count ${manifest.article_count} != ${articles.length}`);
  const keywordCount = articles.reduce((sum, article) => sum + Number(article.metrics.keywords || 0), 0);
  if (manifest.keyword_count !== keywordCount) errors.push(`manifest keyword_count ${manifest.keyword_count} != ${keywordCount}`);
  if (entries.length !== articles.length) errors.push(`manifest entries ${entries.length} != ${articles.length}`);
  if (new Set(entries.map((entry) => entry.id)).size !== entries.length) errors.push('manifest contains duplicate article IDs');

  for (const article of articles) {
    const entry = entries.find((item) => item.id === article.id);
    if (!entry) {
      errors.push(`canonical article ${article.id} missing from manifest`);
      continue;
    }
    const expected = {
      slug: article.slug,
      title: article.title,
      title_zh: article.titleZh,
      status: article.status,
      date: article.date,
      words: article.metrics.words,
      keywords: article.metrics.keywords,
      density: Number(article.metrics.density),
      canonical_fingerprint_sha256: canonicalFingerprint(article),
    };
    for (const [field, value] of Object.entries(expected)) {
      if (entry[field] !== value) errors.push(`article ${article.id} ${field} mismatch`);
    }

    const file = markdownPath(article);
    if (!fs.existsSync(file)) {
      errors.push(`article ${article.id} Markdown missing`);
      continue;
    }
    const raw = fs.readFileSync(file);
    const text = normalizedMarkdown(file);
    const normalized = Buffer.from(text, 'utf8');
    if (entry.markdown_git_blob_sha !== gitBlobSha(raw)) errors.push(`article ${article.id} Markdown Git blob changed`);
    if (entry.markdown_sha256 !== sha256(normalized)) errors.push(`article ${article.id} Markdown SHA-256 changed`);
    const metricLine = `> 指标：${entry.words} 词 / ${entry.keywords} 重点词 / 密度 ${densityDisplay(entry.density)}%`;
    if (!text.includes(metricLine)) errors.push(`article ${article.id} Markdown metrics are stale`);
    if (!text.includes(`> 状态：**${entry.status}**`)) errors.push(`article ${article.id} Markdown status is stale`);
  }

  if (!fs.existsSync(IRON_RULE_PATH)) errors.push('notes/最终版本铁律.md missing');
  const readme = fs.existsSync(README_PATH) ? fs.readFileSync(README_PATH, 'utf8') : '';
  const handoff = fs.existsSync(HANDOFF_PATH) ? fs.readFileSync(HANDOFF_PATH, 'utf8') : '';
  if (!readme.includes('## 最终版本铁律')) errors.push('README final-version rule missing');
  if (!readme.includes('25篇文章、1250个重点词')) errors.push('README archive count is stale');
  if (!readme.includes('The Patient Came Before the Envelope')) errors.push('README article 25 missing');
  if (!handoff.includes('## 2. 最终版本铁律（最高优先级）')) errors.push('handoff final-version rule missing');
  if (!handoff.includes('二十五篇最终定稿，1250个重点词')) errors.push('handoff archive count is stale');
  if (!handoff.includes('第二十五篇最终精进锁定稿')) errors.push('handoff article 25 missing');
  return errors;
}

function auditReport(manifest) {
  const rows = manifest.articles.map((entry) =>
    `| ${entry.id} | *${entry.title}* | ${entry.status} | ${entry.words} / ${entry.keywords} / ${densityDisplay(entry.density)}% | \`${entry.canonical_fingerprint_sha256.slice(0, 12)}\` |`
  );
  return [
    '# 全库最终版本审计 · 2026-08-23',
    '',
    '> 审计范围：第01—25篇权威数据、正式Markdown、最终版本指纹、README、交接文档与网站同步状态。',
    '> 当前结论：25篇 / 1250个重点词；每篇正文、Markdown与manifest以完整SHA指纹锁定。',
    '',
    '## 一、逐篇锁定清单',
    '',
    '| 编号 | 标题 | 当前状态 | 指标 | 内容指纹前12位 |',
    '|---|---|---|---:|---|',
    ...rows,
    '',
    `合计：${manifest.article_count}篇、${manifest.keyword_count}个重点词。`,
    '',
    '## 二、防回滚机制',
    '',
    '1. `data/final-version-manifest.json` 保存每篇权威数据指纹、Markdown SHA-256 与 Git blob SHA。',
    '2. `scripts/build_markdown.py` 检查五段结构、50词、中英对应、词数、密度与跨篇重复。',
    '3. `scripts/final-version-guard.js` 对 canonical 数据与 Markdown 做精确指纹复验。',
    '4. GitHub Actions 在 PR 与 main 提交时执行全库校验。',
    '5. 新最终稿只有合并 main、主分支回读正确且CI通过后才算云端锁定。',
    '',
    '## 三、第25篇终审边界',
    '',
    '- 六个月死亡数：链霉素组 4/55，对照组 14/52。',
    '- 影像学 considerable improvement：28 对 4。',
    '- 不宣称为历史上第一次随机分配；核心里程碑是随机序列与分配隐藏的清楚实施。',
    '- 治疗本身未在病床旁盲法；胸片与细菌学结局评定实行盲法。',
    '',
    '## 四、最终判定',
    '',
    '主分支的25篇均以manifest指纹为唯一权威身份；第25篇为当前最新最终精进锁定稿。',
    '',
  ].join('\n');
}

function main() {
  const articles = loadArticles();
  let manifest = readManifest();
  if (process.argv.includes('--write-manifest')) {
    manifest = createManifest(articles, manifest);
    fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2) + '\n', 'utf8');
    fs.writeFileSync(REPORT_PATH, auditReport(manifest), 'utf8');
    console.log(`wrote ${path.relative(ROOT, MANIFEST_PATH)} and ${path.relative(ROOT, REPORT_PATH)}`);
  }
  const errors = validateManifest(articles, manifest);
  if (errors.length) {
    for (const error of errors) console.error(`✗ ${error}`);
    process.exit(1);
  }
  for (const entry of manifest.articles) {
    console.log(`✓ ${entry.id} ${entry.words}词 · ${entry.keywords}重点词 · ${densityDisplay(entry.density)}% · ${entry.canonical_fingerprint_sha256.slice(0, 12)}`);
  }
  console.log(`\n${manifest.article_count}篇最终版本 · ${manifest.keyword_count}个重点词 · 指纹与Markdown全部一致`);
}

main();
