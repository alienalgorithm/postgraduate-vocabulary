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

const INITIAL_APPROVALS = {
  '01': { source: '原始第1篇定稿；未被后续最终稿包替换', mode: 'canonical-preserved' },
  '02': { source: '60e62742-146f-4af4-9399-3d25039d6455.zip', mode: 'approved-core', core: 'cb3ec71e69f08dbbd4415550b39edc089d035e5e6357d73b2ad08de27d8287f6' },
  '03': { source: '60e62742-146f-4af4-9399-3d25039d6455.zip', mode: 'approved-core', core: 'd163910886d53180f90a35416450daaa9b43963e9aa6844c309c06590f11bc67' },
  '04': { source: '60e62742-146f-4af4-9399-3d25039d6455.zip', mode: 'approved-core', core: 'a574b3314cd29dda0f5c98f826125cfd463d96d5d54cbccb342c09d917871180' },
  '05': { source: '60e62742-146f-4af4-9399-3d25039d6455.zip', mode: 'approved-core', core: 'e1e210852f72fb93c2949bc3a847c3522cf6a5b65778b503bf3f6b654c26fd55' },
  '06': { source: '60e62742-146f-4af4-9399-3d25039d6455.zip', mode: 'exact-markdown-and-core', core: '5b1dbeafb04258c911513e91a751d686316098afcaf131a3e9cf2214c94fb409', blob: 'fd60aa1a0fae0a7a2879edbed990c81b2f9a66a6' },
  '07': { source: '60e62742-146f-4af4-9399-3d25039d6455.zip', mode: 'exact-markdown-and-core', core: '97d0757752d3dbb514e2a0b2c6569197a480d15cd6bdb4e4226d3fed71e87d79', blob: 'bab78bed27496fcda094e7d0dace94a10763268b' },
  '08': { source: '6fed2f3c-24a7-4849-91e0-119f8b7073e8.md', mode: 'exact-markdown-and-core', core: '5da95659f035158441616f592935e9dda1a7fbe1ea3078ca6deb6c9c782b2b4e', blob: 'c692c268881b96619931af559872ec97521cfc05' },
  '09': { source: 'f69e64e9-6ed8-4f44-9e01-7b1c86000e73.md', mode: 'exact-markdown-and-core', core: '9ae2b57fe73168c2e7c84efe508c485ac67d84eac68f332ae977f52416f31087', blob: '9b78d5575735bc2bd78abb1bc50f34af3efd8b21' },
  '10': { source: 'be410145-0b0e-4ec1-9889-1b0f758ab2ef.md', mode: 'exact-markdown-and-core', core: '6ce78718b6532d337e13054dd51cddfc1817b6960d31853a9de495c216d9fa08', blob: '0cae816f2e21cbf438527ba6b4c7c28556ee03d3' },
  '11': { source: '842ff92f-706b-46ec-a89a-ba75cb26b786.md', mode: 'exact-markdown-and-core', core: 'c1de3f9a1bb1cdf701151ecc7ed6638ad947031e6e0be0330e2f6ff090d0b05d', blob: '31786c670e5ddb48a92c8e8ceee1de27cf29159a' },
  '12': { source: 'dd6d1d8e-7405-4dab-a7fd-ffc0a177c3d2.zip', mode: 'exact-markdown-and-core', core: '2cda5d6d263e4d48b979594dda5d679b576f899a9d704bd22ba4a4b6694ebc6a', blob: '5cc60c63acb1e8dff617120d6b8f273cb99d0270' },
  '13': { source: 'dd6d1d8e-7405-4dab-a7fd-ffc0a177c3d2.zip', mode: 'exact-markdown-and-core', core: 'b83b05f601e65416ae9c98250c278f91c9581055c5015e652670d67292e706f4', blob: 'c4c95be922ce46a972e375d561d167bb75f46013' },
  '14': { source: 'dd6d1d8e-7405-4dab-a7fd-ffc0a177c3d2.zip', mode: 'exact-markdown-and-core', core: 'd0f68c0f48ae8b9ac209077113f1447d6c42b6f06c677090dcb525c208fa7534', blob: '63279e6e988966680c8a164db3fb0e19b4a08972' },
  '15': { source: 'dd6d1d8e-7405-4dab-a7fd-ffc0a177c3d2.zip', mode: 'exact-markdown-and-core', core: '961840be2b429009d2c7d5c47de5b94f67fd25bff182e69992ebe3f84f204d24', blob: 'bab945342134b4d45bb8d005569f11c9fb2a97fe' },
  '16': { source: '2026-08-12对话中确认的263词最终精进稿', mode: 'conversation-final' },
  '17': { source: '2026-08-12对话中确认并已合并的268词最终精进稿', mode: 'conversation-final' },
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
  '04': ['Finding **longitude** required the time somewhere else.', '295 词'],
  '16': [
    'sent **seismic** waves through the planet',
    'Yet faint P′ **arrivals** did.',
    'made diffraction untenable',
    'In science, **absence** belongs to a model.',
    '264 词 / 50 重点词 / 密度 18.9%',
    '296 词 / 50 重点词 / 密度 16.9%',
  ],
  '17': [
    'Measurements upheld the **empirical** **framework**.',
    'compresses this into one man\'s **revelation**',
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
    const out = {};
    for (const key of Object.keys(value).sort()) out[key] = stable(value[key]);
    return out;
  }
  return value;
}

function sha256(text) {
  return crypto.createHash('sha256').update(text, 'utf8').digest('hex');
}

function canonicalFingerprint(article) {
  return sha256(JSON.stringify(stable(article)));
}

function extractSection(markdown, headingPattern) {
  const lines = markdown.replace(/\r\n?/g, '\n').split('\n');
  let start = -1;
  for (let i = 0; i < lines.length; i += 1) {
    if (headingPattern.test(lines[i].trim())) {
      start = i + 1;
      break;
    }
  }
  if (start < 0) return '';
  const out = [];
  for (let i = start; i < lines.length; i += 1) {
    if (/^#{2,3}\s+/.test(lines[i].trim())) break;
    out.push(lines[i]);
  }
  return out.join('\n');
}

function normalizeSection(text) {
  return text
    .replace(/\r\n?/g, '\n')
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .filter((line) => !line.startsWith('> 铁律') && !line.startsWith('> 中文按最自然'))
    .map((line) => line.replace(/^#+\s*/, ''))
    .map((line) => line.replace(/[“”]/g, '"').replace(/[‘’]/g, "'"))
    .map((line) => line.replace(/\s+/g, ' '))
    .join('\n');
}

function approvedCoreHash(markdown) {
  const en = normalizeSection(extractSection(markdown, /^#{2,3}\s*英文正文\s*$/));
  const zh = normalizeSection(extractSection(markdown, /^#{2,3}\s*中文译文\s*$/));
  const glossary = normalizeSection(extractSection(markdown, /^#{2,3}\s*50\s*词速查表\s*$/));
  return sha256(`\n---EN---\n${en}\n---ZH---\n${zh}\n---GL---\n${glossary}`);
}

function densityDisplay(value) {
  return Number(value).toFixed(1);
}

function articleMarkdownPath(article) {
  return path.join(ARTICLE_DIR, `${article.id}-${article.slug}.md`);
}

function buildManifest(articles, existing) {
  const oldById = new Map((existing?.articles || []).map((entry) => [entry.id, entry]));
  const entries = [];
  for (const article of articles) {
    const markdownPath = articleMarkdownPath(article);
    if (!fs.existsSync(markdownPath)) throw new Error(`missing Markdown: ${path.relative(ROOT, markdownPath)}`);
    const markdown = fs.readFileSync(markdownPath, 'utf8');
    const currentCore = approvedCoreHash(markdown);
    const approval = INITIAL_APPROVALS[article.id] || { source: '当前对话最终稿', mode: 'conversation-final' };
    const expectedCore = approval.core || oldById.get(article.id)?.approved_core_sha256 || currentCore;
    if (currentCore !== expectedCore) {
      throw new Error(`article ${article.id} does not match its approved source core: ${currentCore} != ${expectedCore}`);
    }
    entries.push({
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
      source: approval.source,
      source_verification: approval.mode,
      approved_markdown_blob_sha: approval.blob || null,
      approved_core_sha256: expectedCore,
      canonical_fingerprint_sha256: canonicalFingerprint(article),
      superseded_signatures: SUPERSEDED_SIGNATURES[article.id] || [],
    });
  }
  return {
    schema_version: 1,
    policy: 'latest-final-only',
    audited_at: '2026-08-12',
    article_count: entries.length,
    keyword_count: entries.reduce((sum, entry) => sum + entry.keywords, 0),
    articles: entries,
  };
}

function validate(articles, manifest) {
  const errors = [];
  const byId = new Map(articles.map((article) => [article.id, article]));
  if (manifest.article_count !== articles.length) {
    errors.push(`manifest article_count ${manifest.article_count} != canonical ${articles.length}`);
  }
  if (manifest.keyword_count !== articles.reduce((sum, article) => sum + article.metrics.keywords, 0)) {
    errors.push('manifest keyword_count mismatch');
  }
  const manifestIds = manifest.articles.map((entry) => entry.id);
  if (new Set(manifestIds).size !== manifestIds.length) errors.push('manifest contains duplicate article IDs');

  for (const entry of manifest.articles) {
    const article = byId.get(entry.id);
    if (!article) {
      errors.push(`manifest article ${entry.id} missing from canonical data`);
      continue;
    }
    const checks = {
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
    for (const [field, actual] of Object.entries(checks)) {
      if (entry[field] !== actual) errors.push(`article ${entry.id} ${field} mismatch: manifest=${entry[field]} canonical=${actual}`);
    }

    const mdPath = articleMarkdownPath(article);
    if (!fs.existsSync(mdPath)) {
      errors.push(`article ${entry.id} Markdown missing`);
      continue;
    }
    const markdown = fs.readFileSync(mdPath, 'utf8');
    const core = approvedCoreHash(markdown);
    if (core !== entry.approved_core_sha256) {
      errors.push(`article ${entry.id} approved core mismatch: ${core} != ${entry.approved_core_sha256}`);
    }
    const expectedMetricLine = `> 指标：${entry.words} 词 / ${entry.keywords} 重点词 / 密度 ${densityDisplay(entry.density)}%`;
    if (!markdown.includes(expectedMetricLine)) errors.push(`article ${entry.id} Markdown metric line is stale`);
    if (!markdown.includes(`> 状态：**${entry.status}**`)) errors.push(`article ${entry.id} Markdown status is stale`);

    const activeArticleText = JSON.stringify(article);
    for (const signature of entry.superseded_signatures || []) {
      if (activeArticleText.includes(signature) || markdown.includes(signature)) {
        errors.push(`article ${entry.id} contains superseded signature: ${signature}`);
      }
    }
  }

  for (const article of articles) {
    if (!manifestIds.includes(article.id)) errors.push(`canonical article ${article.id} missing from manifest`);
  }
  return errors;
}

function reportMarkdown(manifest) {
  const rows = manifest.articles.map((entry) =>
    `| ${entry.id} | *${entry.title}* | ${entry.status} | ${entry.words} / ${entry.keywords} / ${densityDisplay(entry.density)}% | \`${entry.canonical_fingerprint_sha256.slice(0, 12)}\` |`
  ).join('\n');
  return `# 全库最终版本审计 · 2026-08-12\n\n> 审计范围：第01—17篇的权威数据、正式Markdown、用户上传最终稿、最终校正记录、README、交接文档和主分支校验。\n> 结论：审计发现第16篇云端仍停留在264词中间稿；本次已替换为对话中更晚形成的263词最终精进稿。其余16篇未发现晚于云端版本的未同步最终稿。\n\n## 一、逐篇锁定清单\n\n| 编号 | 标题 | 当前状态 | 指标 | 内容指纹前12位 |\n|---|---|---|---:|---|\n${rows}\n\n合计：${manifest.article_count}篇、${manifest.keyword_count}个重点词。\n\n## 二、原始最终稿复核\n\n- 第01篇：不在第2—7篇最终包中，按作者此前决定保持原定稿。\n- 第02—07篇：重新对照 \`60e62742-146f-4af4-9399-3d25039d6455.zip\` 与《最终定稿校正记录》。第2篇保持 \`reaction/reactions/反应\`；第4篇保持260词版本；第3、5、6正文一致；第7篇为新增最终稿。第2篇正文按作者稿保留，指标使用项目实测259词 / 19.3%。\n- 第08—11篇：正式Markdown的Git blob与用户上传文件逐字一致。\n- 第12—15篇：正式Markdown的Git blob与 \`dd6d1d8e-7405-4dab-a7fd-ffc0a177c3d2.zip\` 中四份最终稿逐字一致。\n- 第16篇：发现真实遗漏。对话中已经形成更强的263词版本，但主分支仍是264词版本；本次已完成替换并登记旧稿特征。\n- 第17篇：268词最终精进稿已在PR #8进入主分支，本次复核保持不变。\n\n## 三、精确文件证据\n\n以下最终稿与上传文件的Git blob SHA完全一致：\n\n| 编号 | Git blob SHA |\n|---|---|\n| 06 | \`fd60aa1a0fae0a7a2879edbed990c81b2f9a66a6\` |\n| 07 | \`bab78bed27496fcda094e7d0dace94a10763268b\` |\n| 08 | \`c692c268881b96619931af559872ec97521cfc05\` |\n| 09 | \`9b78d5575735bc2bd78abb1bc50f34af3efd8b21\` |\n| 10 | \`0cae816f2e21cbf438527ba6b4c7c28556ee03d3\` |\n| 11 | \`31786c670e5ddb48a92c8e8ceee1de27cf29159a\` |\n| 12 | \`5cc60c63acb1e8dff617120d6b8f273cb99d0270\` |\n| 13 | \`c4c95be922ce46a972e375d561d167bb75f46013\` |\n| 14 | \`63279e6e988966680c8a164db3fb0e19b4a08972\` |\n| 15 | \`bab945342134b4d45bb8d005569f11c9fb2a97fe\` |\n\n第02—05篇的源文件包含不同的元数据或修订说明，因此不以整文件blob判断，而是对英文正文、中文译文和50词表做标准化核心哈希比对；四篇均通过。\n\n## 四、永久防回滚措施\n\n1. 新增 \`notes/最终版本铁律.md\`。\n2. 新增 \`data/final-version-manifest.json\`，为每篇保存完整内容指纹与批准核心哈希。\n3. 新增 \`scripts/final-version-guard.js\`，检查指标、状态、全文指纹、核心哈希和旧稿特征。\n4. GitHub Actions在PR与主分支提交中运行最终版本守卫。\n5. 新最终稿只有在合并到 \`main\`、主分支回读正确且CI成功后，才算真正存到云端。\n6. 已合并或承载旧稿的临时分支应删除，避免旧版本继续被误认。\n\n## 五、最终判定\n\n本次修正完成后，主分支的17篇均为当前已知的最后最终版本；第16篇263词稿和第17篇268词稿分别是当前唯一权威版本。\n`;
}

function main() {
  const writeManifest = process.argv.includes('--write-manifest');
  const articles = loadArticles();
  let existing = null;
  if (fs.existsSync(MANIFEST_PATH)) existing = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8'));

  if (writeManifest) {
    const manifest = buildManifest(articles, existing);
    fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2) + '\n', 'utf8');
    fs.mkdirSync(path.dirname(REPORT_PATH), { recursive: true });
    fs.writeFileSync(REPORT_PATH, reportMarkdown(manifest), 'utf8');
    console.log(`wrote ${path.relative(ROOT, MANIFEST_PATH)} and ${path.relative(ROOT, REPORT_PATH)}`);
    existing = manifest;
  }

  if (!existing) throw new Error('final-version manifest is missing; run with --write-manifest only when deliberately locking a new final version');
  const errors = validate(articles, existing);
  if (errors.length) {
    for (const error of errors) console.error(`✗ ${error}`);
    process.exit(1);
  }
  for (const entry of existing.articles) {
    console.log(`✓ ${entry.id} ${entry.words}词 · ${entry.keywords}重点词 · ${densityDisplay(entry.density)}% · ${entry.canonical_fingerprint_sha256.slice(0, 12)}`);
  }
  console.log(`\n${existing.article_count}篇最终版本 · ${existing.keyword_count}个重点词 · 指纹与批准源全部一致`);
}

main();
