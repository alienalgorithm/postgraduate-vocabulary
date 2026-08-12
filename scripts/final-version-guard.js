#!/usr/bin/env node
'use strict';

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const DATA_DIR = path.join(ROOT, 'data');
const ARTICLE_DIR = path.join(ROOT, 'articles');
const MANIFEST_PATH = path.join(DATA_DIR, 'final-version-manifest.json');
const REPORT_PATH = path.join(ROOT, 'notes', '全库最终版本审计_2026-08-12.md');
const README_PATH = path.join(ROOT, 'README.md');
const HANDOFF_PATH = path.join(ROOT, 'notes', '对话交接文档.md');
const IRON_RULE_PATH = path.join(ROOT, 'notes', '最终版本铁律.md');

const SOURCE_AUDIT = {
  '01': { source: '原始第1篇定稿；作者的第2—7篇最终包未包含第1篇，因此保持不变', verification: 'preserved-canonical' },
  '02': { source: '60e62742-146f-4af4-9399-3d25039d6455.zip + 最终定稿校正记录_2026-08-10.md', verification: 'final-package-corrected-canonical' },
  '03': { source: '60e62742-146f-4af4-9399-3d25039d6455.zip + 最终定稿校正记录_2026-08-10.md', verification: 'final-package-body-confirmed' },
  '04': { source: '60e62742-146f-4af4-9399-3d25039d6455.zip + 最终定稿校正记录_2026-08-10.md', verification: '260-word-final-package' },
  '05': { source: '60e62742-146f-4af4-9399-3d25039d6455.zip + 最终定稿校正记录_2026-08-10.md', verification: 'final-package-body-confirmed' },
  '06': { source: '60e62742-146f-4af4-9399-3d25039d6455.zip', verification: 'exact-uploaded-markdown', blob: 'fd60aa1a0fae0a7a2879edbed990c81b2f9a66a6' },
  '07': { source: '60e62742-146f-4af4-9399-3d25039d6455.zip', verification: 'exact-uploaded-markdown', blob: 'bab78bed27496fcda094e7d0dace94a10763268b' },
  '08': { source: '6fed2f3c-24a7-4849-91e0-119f8b7073e8.md', verification: 'exact-uploaded-markdown', blob: 'c692c268881b96619931af559872ec97521cfc05' },
  '09': { source: 'f69e64e9-6ed8-4f44-9e01-7b1c86000e73.md', verification: 'exact-uploaded-markdown', blob: '9b78d5575735bc2bd78abb1bc50f34af3efd8b21' },
  '10': { source: 'be410145-0b0e-4ec1-9889-1b0f758ab2ef.md', verification: 'exact-uploaded-markdown', blob: '0cae816f2e21cbf438527ba6b4c7c28556ee03d3' },
  '11': { source: '842ff92f-706b-46ec-a89a-ba75cb26b786.md', verification: 'exact-uploaded-markdown', blob: '31786c670e5ddb48a92c8e8ceee1de27cf29159a' },
  '12': { source: 'dd6d1d8e-7405-4dab-a7fd-ffc0a177c3d2.zip', verification: 'exact-uploaded-markdown', blob: '5cc60c63acb1e8dff617120d6b8f273cb99d0270' },
  '13': { source: 'dd6d1d8e-7405-4dab-a7fd-ffc0a177c3d2.zip', verification: 'exact-uploaded-markdown', blob: 'c4c95be922ce46a972e375d561d167bb75f46013' },
  '14': { source: 'dd6d1d8e-7405-4dab-a7fd-ffc0a177c3d2.zip', verification: 'exact-uploaded-markdown', blob: '63279e6e988966680c8a164db3fb0e19b4a08972' },
  '15': { source: 'dd6d1d8e-7405-4dab-a7fd-ffc0a177c3d2.zip', verification: 'exact-uploaded-markdown', blob: 'bab945342134b4d45bb8d005569f11c9fb2a97fe' },
  '16': { source: '2026-08-12对话中形成的263词最终精进稿', verification: 'conversation-latest-final' },
  '17': { source: '2026-08-12对话中形成并由PR #8合并的268词最终精进稿', verification: 'conversation-latest-final' },
};

const VERSION_IDS = {
  '01': '01-original-final',
  '02': '02-final-rewrite-reaction',
  '03': '03-refined-final',
  '04': '04-260-word-final',
  '05': '05-final-refined',
  '06': '06-final-locked',
  '07': '07-final-proofed',
  '08': '08-final-proofed',
  '09': '09-final-proofed',
  '10': '10-final-proofed',
  '11': '11-final-proofed',
  '12': '12-final-proofed',
  '13': '13-final-proofed',
  '14': '14-final-proofed',
  '15': '15-final-proofed',
  '16': '16-263-word-final-polish',
  '17': '17-268-word-final-polish',
};

const SUPERSEDED_SIGNATURES = {
  '02': ['These **processes** **support** a food **chain**'],
  '04': ['Finding **longitude** required the time somewhere else.', '295 词 / 50 重点词 / 密度 16.9%'],
  '16': [
    'sent **seismic** waves through the planet',
    'read traces from **seismographs**',
    'Yet faint P′ **arrivals** did.',
    'made diffraction untenable',
    'In science, **absence** belongs to a model.',
    '264 词 / 50 重点词 / 密度 18.9%',
    '296 词 / 50 重点词 / 密度 16.9%',
  ],
  '17': [
    'Measurements upheld the **empirical** **framework**.',
    "compresses this into one man's **revelation**",
    '263 词 / 50 重点词 / 密度 19.0%',
  ],
};

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

function normalizedMarkdownBuffer(file) {
  const text = fs.readFileSync(file, 'utf8').replace(/\r\n?/g, '\n');
  return Buffer.from(text, 'utf8');
}

function densityDisplay(value) {
  return Number(value).toFixed(1);
}

function createManifest(articles) {
  const entries = articles.map((article) => {
    const source = SOURCE_AUDIT[article.id];
    if (!source) throw new Error(`missing source audit for article ${article.id}`);
    const file = markdownPath(article);
    if (!fs.existsSync(file)) throw new Error(`missing Markdown: ${path.relative(ROOT, file)}`);
    const raw = fs.readFileSync(file);
    const normalized = normalizedMarkdownBuffer(file);
    const currentBlob = gitBlobSha(raw);
    if (source.blob && currentBlob !== source.blob) {
      throw new Error(`article ${article.id} is not byte-identical to the approved uploaded final: ${currentBlob} != ${source.blob}`);
    }
    return {
      id: article.id,
      slug: article.slug,
      title: article.title,
      title_zh: article.titleZh,
      version_id: VERSION_IDS[article.id] || `${article.id}-final`,
      status: article.status,
      date: article.date,
      words: article.metrics.words,
      keywords: article.metrics.keywords,
      density: Number(article.metrics.density),
      source: source.source,
      source_verification: source.verification,
      approved_source_blob_sha: source.blob || null,
      canonical_fingerprint_sha256: canonicalFingerprint(article),
      markdown_sha256: sha256(normalized),
      markdown_git_blob_sha: currentBlob,
      superseded_signatures: SUPERSEDED_SIGNATURES[article.id] || [],
    };
  });
  return {
    schema_version: 1,
    policy: 'latest-final-only',
    audited_at: '2026-08-12',
    article_count: entries.length,
    keyword_count: entries.reduce((sum, entry) => sum + entry.keywords, 0),
    articles: entries,
  };
}

function validateManifest(articles, manifest) {
  const errors = [];
  const byId = new Map(articles.map((article) => [article.id, article]));
  const entries = manifest.articles || [];
  if (manifest.policy !== 'latest-final-only') errors.push('manifest policy is not latest-final-only');
  if (manifest.article_count !== articles.length) errors.push(`manifest article_count ${manifest.article_count} != ${articles.length}`);
  const keywordCount = articles.reduce((sum, article) => sum + article.metrics.keywords, 0);
  if (manifest.keyword_count !== keywordCount) errors.push(`manifest keyword_count ${manifest.keyword_count} != ${keywordCount}`);
  if (new Set(entries.map((entry) => entry.id)).size !== entries.length) errors.push('manifest contains duplicate article IDs');

  for (const entry of entries) {
    const article = byId.get(entry.id);
    if (!article) {
      errors.push(`manifest article ${entry.id} missing from canonical data`);
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
      if (entry[field] !== value) errors.push(`article ${entry.id} ${field} mismatch`);
    }

    const file = markdownPath(article);
    if (!fs.existsSync(file)) {
      errors.push(`article ${entry.id} Markdown missing`);
      continue;
    }
    const raw = fs.readFileSync(file);
    const normalized = normalizedMarkdownBuffer(file);
    const markdownText = normalized.toString('utf8');
    const actualBlob = gitBlobSha(raw);
    const actualMarkdownSha = sha256(normalized);
    if (entry.markdown_git_blob_sha !== actualBlob) errors.push(`article ${entry.id} Markdown Git blob changed`);
    if (entry.markdown_sha256 !== actualMarkdownSha) errors.push(`article ${entry.id} Markdown SHA-256 changed`);
    if (entry.approved_source_blob_sha && actualBlob !== entry.approved_source_blob_sha) {
      errors.push(`article ${entry.id} no longer matches its exact uploaded final`);
    }
    const metricLine = `> 指标：${entry.words} 词 / ${entry.keywords} 重点词 / 密度 ${densityDisplay(entry.density)}%`;
    if (!markdownText.includes(metricLine)) errors.push(`article ${entry.id} Markdown metrics are stale`);
    if (!markdownText.includes(`> 状态：**${entry.status}**`)) errors.push(`article ${entry.id} Markdown status is stale`);

    const activeText = JSON.stringify(article) + '\n' + markdownText;
    for (const signature of entry.superseded_signatures || []) {
      if (activeText.includes(signature)) errors.push(`article ${entry.id} contains superseded signature: ${signature}`);
    }
  }

  for (const article of articles) {
    if (!entries.some((entry) => entry.id === article.id)) errors.push(`canonical article ${article.id} missing from manifest`);
  }

  if (!fs.existsSync(IRON_RULE_PATH)) errors.push('notes/最终版本铁律.md missing');
  const readme = fs.existsSync(README_PATH) ? fs.readFileSync(README_PATH, 'utf8') : '';
  const handoff = fs.existsSync(HANDOFF_PATH) ? fs.readFileSync(HANDOFF_PATH, 'utf8') : '';
  if (!readme.includes('## 最终版本铁律')) errors.push('README final-version rule missing');
  if (!readme.includes('| 16 | *The Wave That Should Not Have Arrived* | 1929—1952年英格·莱曼、P波阴影区与地球内核 | 263词 · 50词 · 19.0% |')) {
    errors.push('README article 16 final row is stale');
  }
  if (!readme.includes('| **17** | ***The Few That Came Back*** | **1909—1913年盖革—马斯登散射实验与卢瑟福核式原子** | **268词 · 50词 · 18.7%** |')) {
    errors.push('README article 17 final row is stale');
  }
  if (!handoff.includes('## 2. 最终版本铁律（最高优先级）')) errors.push('handoff final-version rule missing');
  if (!handoff.includes('| 16 | *The Wave That Should Not Have Arrived* | 1929—1952年英格·莱曼、P波阴影区与地球内核 | 263 / 50 / 19.0% | 第十六篇最终精进锁定稿 |')) {
    errors.push('handoff article 16 final row is stale');
  }
  return errors;
}

function auditReport(manifest) {
  const tick = '`';
  const rows = manifest.articles.map((entry) =>
    `| ${entry.id} | *${entry.title}* | ${entry.status} | ${entry.words} / ${entry.keywords} / ${densityDisplay(entry.density)}% | ${tick}${entry.canonical_fingerprint_sha256.slice(0, 12)}${tick} |`
  );
  return [
    '# 全库最终版本审计 · 2026-08-12',
    '',
    '> 审计范围：第01—17篇的权威数据、正式Markdown、用户上传最终稿、最终校正记录、README、交接文档和主分支校验。',
    '> 结论：审计发现第16篇云端仍停留在264词中间稿；本次已替换为对话中更晚形成的263词最终精进稿。其余16篇未发现晚于云端版本的未同步最终稿。',
    '',
    '## 一、逐篇锁定清单',
    '',
    '| 编号 | 标题 | 当前状态 | 指标 | 内容指纹前12位 |',
    '|---|---|---|---:|---|',
    ...rows,
    '',
    `合计：${manifest.article_count}篇、${manifest.keyword_count}个重点词。`,
    '',
    '## 二、原始最终稿复核',
    '',
    '- 第01篇：不在第2—7篇最终包中，按作者此前决定保持原定稿。',
    '- 第02—07篇：重新对照 `60e62742-146f-4af4-9399-3d25039d6455.zip` 与《最终定稿校正记录》。第2篇保持 `reaction/reactions/反应`；第4篇保持260词版本；第3、5、6正文一致；第7篇为新增最终稿。第2篇正文按作者稿保留，指标使用项目实测259词 / 19.3%。',
    '- 第08—11篇：正式Markdown的Git blob与用户上传文件逐字一致。',
    '- 第12—15篇：正式Markdown的Git blob与 `dd6d1d8e-7405-4dab-a7fd-ffc0a177c3d2.zip` 中四份最终稿逐字一致。',
    '- 第16篇：发现真实遗漏。对话中已经形成更强的263词版本，但主分支仍是264词版本；本次已完成替换并登记旧稿特征。',
    '- 第17篇：268词最终精进稿已在PR #8进入主分支，本次复核保持不变。',
    '',
    '## 三、逐字一致的上传文件证据',
    '',
    '| 编号 | 批准来源Git blob SHA |',
    '|---|---|',
    ...manifest.articles.filter((entry) => entry.approved_source_blob_sha).map((entry) => `| ${entry.id} | ${tick}${entry.approved_source_blob_sha}${tick} |`),
    '',
    '第02—05篇的源文件包含不同的元数据或修订说明，因此不以整文件blob判断；本次依据作者最终包和校正记录核对正文、译文及50词表。',
    '',
    '## 四、永久防回滚措施',
    '',
    '1. 新增 `notes/最终版本铁律.md`。',
    '2. 新增 `data/final-version-manifest.json`，为每篇保存完整内容指纹。',
    '3. 新增 `scripts/final-version-guard.js`，检查指标、状态、全文指纹、Markdown指纹和旧稿特征。',
    '4. GitHub Actions在PR与主分支提交中运行最终版本守卫。',
    '5. 新最终稿只有在合并到 `main`、主分支回读正确且CI成功后，才算真正存到云端。',
    '6. 已合并或承载旧稿的临时分支应删除，避免旧版本继续被误认。',
    '',
    '## 五、最终判定',
    '',
    '本次修正完成后，主分支的17篇均为当前已知的最后最终版本；第16篇263词稿和第17篇268词稿分别是当前唯一权威版本。',
    '',
  ].join('\n');
}

function main() {
  const writeManifest = process.argv.includes('--write-manifest');
  const articles = loadArticles();
  let manifest;

  if (writeManifest) {
    manifest = createManifest(articles);
    fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2) + '\n', 'utf8');
    fs.writeFileSync(REPORT_PATH, auditReport(manifest), 'utf8');
    console.log(`wrote ${path.relative(ROOT, MANIFEST_PATH)} and ${path.relative(ROOT, REPORT_PATH)}`);
  } else {
    if (!fs.existsSync(MANIFEST_PATH)) throw new Error('final-version manifest missing');
    manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8'));
  }

  const errors = validateManifest(articles, manifest);
  if (errors.length) {
    for (const error of errors) console.error(`✗ ${error}`);
    process.exit(1);
  }
  for (const entry of manifest.articles) {
    console.log(`✓ ${entry.id} ${entry.words}词 · ${entry.keywords}重点词 · ${densityDisplay(entry.density)}% · ${entry.canonical_fingerprint_sha256.slice(0, 12)}`);
  }
  console.log(`\n${manifest.article_count}篇最终版本 · ${manifest.keyword_count}个重点词 · 指纹、指标与批准来源全部一致`);
}

main();
