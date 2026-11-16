export const meta = {
  name: 'article-package-content',
  description: 'Write and adversarially verify the sentence-by-sentence analysis and the word explanations for one article package',
  phases: [{ title: 'Write' }, { title: 'Verify' }],
}

const A = args.article
const EX = { type: 'object', properties: { en: { type: 'string' }, zh: { type: 'string' } }, required: ['en', 'zh'] }
const SENT_ITEM = {
  type: 'object',
  properties: {
    n: { type: 'integer' },
    trunk: { type: 'object', properties: { subject: { type: 'string' }, predicate: { type: 'string' }, object_or_complement: { type: 'string' }, explain: { type: 'string' } }, required: ['subject', 'predicate', 'object_or_complement', 'explain'] },
    components: { type: 'array', items: { type: 'object', properties: { text: { type: 'string' }, role: { type: 'string' } }, required: ['text', 'role'] } },
    structure: { type: 'string' },
    long_difficult: { type: 'boolean' },
    grammar: { type: 'array', items: { type: 'object', properties: { title: { type: 'string' }, explain: { type: 'string' }, difficult: { type: 'boolean' }, examples: { type: 'array', items: EX } }, required: ['title', 'explain', 'difficult', 'examples'] } },
    knowledge: { type: 'array', items: { type: 'object', properties: { term: { type: 'string' }, explain: { type: 'string' } }, required: ['term', 'explain'] } },
    translation_tip: { type: 'string' },
  },
  required: ['n', 'trunk', 'components', 'structure', 'long_difficult', 'grammar', 'knowledge', 'translation_tip'],
}
const WORD_ITEM = {
  type: 'object',
  properties: {
    id: { type: 'integer' }, headword: { type: 'string' }, ipa_uk: { type: 'string' }, ipa_us: { type: 'string' },
    pos: { type: 'string' }, form_note: { type: 'string' }, context_usage: { type: 'string' }, etymology: { type: 'string' },
    senses: { type: 'array', items: { type: 'object', properties: { pos: { type: 'string' }, zh: { type: 'string' } }, required: ['pos', 'zh'] } },
    collocations: { type: 'array', items: EX },
    usage_detail: { type: 'string' }, distinction: { type: 'string' },
    related: { type: 'array', items: { type: 'object', properties: { en: { type: 'string' }, pos: { type: 'string' }, zh: { type: 'string' } }, required: ['en', 'pos', 'zh'] } },
    example: EX,
  },
  required: ['id', 'headword', 'ipa_uk', 'ipa_us', 'pos', 'form_note', 'context_usage', 'etymology', 'senses', 'collocations', 'usage_detail', 'distinction', 'related', 'example'],
}
const CORR = { type: 'array', items: { type: 'object', properties: { id: { type: 'integer' }, field: { type: 'string' }, before: { type: 'string' }, after: { type: 'string' }, reason: { type: 'string' } }, required: ['id', 'field', 'before', 'after', 'reason'] } }
const SENT_OUT = { type: 'object', properties: { items: { type: 'array', items: SENT_ITEM } }, required: ['items'] }
const WORD_OUT = { type: 'object', properties: { items: { type: 'array', items: WORD_ITEM } }, required: ['items'] }
const SENT_V = { type: 'object', properties: { items: { type: 'array', items: SENT_ITEM }, corrections: CORR }, required: ['items', 'corrections'] }
const WORD_V = { type: 'object', properties: { items: { type: 'array', items: WORD_ITEM }, corrections: CORR }, required: ['items', 'corrections'] }

const RULES = `
通用规矩（全部必须遵守）：
1. 读者是准备考研英语的中国学生。讲解用简体中文，专业、准确、具体，像资深考研英语老师写的讲义；不要空话、套话、客套话，不要“让我们”“值得注意的是”“总之”“首先其次最后”这类腔调，不要“怎么理解”“如何理解”这类说法。
2. 绝对不用破折号（—— 或 — 或 –）；需要时用冒号、逗号或括号。不用任何粗体或 Markdown 记号（不要 ** 、#、反引号）。
3. 英文例句里三项及以上并列，一律加牛津逗号。例句必须地道、语法完全正确，语域接近外刊和考研阅读，不用文章原句，并配准确通顺的中文翻译。
4. 文章的中文译文和重点词的中文意思都是用户审定过的视频文字（在 article.json 的 zh、zh_video 字段），讲解必须与之一致，不得另立译法、不得说视频译文有误。视频里已有的说明（video_notes）是审定内容，你的分析必须与它们一致。
5. 事实、背景、词源只写有把握、权威词典（Oxford、Cambridge、Merriam-Webster、Etymonline）能查到的内容；没把握就不写，宁缺毋滥。绝不编造。
6. 语法术语用国内考研通行叫法：主语、谓语、宾语、表语、宾语补足语、定语、状语、同位语、定语从句（限制性/非限制性）、名词性从句（主语从句/宾语从句/表语从句/同位语从句）、状语从句、非谓语动词（不定式/现在分词/过去分词/动名词）、独立主格、倒装、省略等。
`

function sentPrompt(ids) {
  return `你要为考研英语精读文章写“逐句精讲”。文章数据在 ${A}（JSON：sentences 里每句有 n、para、en 英文原句、zh 视频审定中文、chunks 视频分屏意群、video_notes 视频里的审定说明；vocab 是重点词及视频中文意思）。先用 Read 读完整篇文章，理解上下文，再只为第 ${ids.join('、')} 句写精讲。
${RULES}
每句字段要求：
- trunk：句子主干。subject 主语原文、predicate 谓语原文（含助动词、情态动词、否定词，如 had resided、will do、came to discriminate 按实际结构给出）、object_or_complement 宾语/表语/宾补原文（没有就写空字符串），explain 用一两句中文说明主干是什么句型（如 主谓宾、主系表、主谓），以及谓语的时态语态。
- components：按原句顺序把整句切成连续的成分片段，text 原样取自原句（大小写、标点都不改，标点跟在前一个片段末尾），所有片段按顺序用一个空格连起来必须与 en 完全相同。role 写这个片段在句中的成分，要具体，例如“时间状语（介词短语）”“主语”“谓语”“宾语”“地点状语”“后置定语（介词短语）”“非限制性定语从句，修饰 a drain”“伴随状语（现在分词短语）”“同位语，解释 two strangers”。从句作为一个整体片段即可，从句内部结构在 structure 里讲。
- structure：句子结构的完整分析。长句要逐层拆：先说主句，再说每个从句、非谓语、插入语分别修饰谁、起什么作用、引导词在从句里作什么成分（例如 whose 在从句里作定语、which 在从句里作主语）。短句也要讲清句型和关键结构。写成连贯的中文段落，可分几小段，每层用“①②③”标号。
- long_difficult：本句是否属于长难句（有从句嵌套、非谓语、插入、省略、倒装或修饰关系复杂的算 true）。
- grammar：本句的语法知识点，1 到 4 条，挑真正值得讲的（从句类型、非谓语作用、时态用法、省略、特殊句式、系动词用法、介词用法等）。explain 要讲规则本身、在本句里的体现、考研里常见的考法或易错点。difficult 为 true 的知识点必须给 1 到 2 个文外例句（examples），false 的也建议给 1 个；例句要示范同一个语法点。
- knowledge：本句的知识点，包括重点词组和搭配的用法（如 stem from、will do、go unreported、at the outset）、熟词僻义、必要的背景知识（地名、机构、文件、法律等，只写确切事实）。每条 term 写词或短语，explain 写讲解。重点词的详细词义另有单词册，这里只讲它在句中的用法要点，不要重复长篇词义。
- translation_tip：结合视频审定中文，说明这一句翻译时做了哪些处理（语序调整、拆句、定语从句的译法、分词短语的译法、增补等），帮助学生做考研翻译。只解释现有译文，不提出新译文。
只输出第 ${ids.join('、')} 句，items 按 n 排列。`
}

function wordPrompt(ids) {
  return `你要为考研英语精读文章写“单词精解册”。文章数据在 ${A}（JSON：sentences 是全文逐句，vocab 是重点词表：id、para、sentence 所在句号、en 文中形式、zh_video 视频审定中文意思、headword、pos、table_definition 旧词表释义仅供参考）。先用 Read 读完整篇文章，再只为 vocab 中 id 为 ${ids.join('、')} 的词写精解。
${RULES}
每个词字段要求：
- headword：词典原形（如 crept 写 creep，stems from 写 stem from，keepers 写 keeper）；专有名词保持原样（如 New Zealand、the Pacific）。
- ipa_uk、ipa_us：英式、美式国际音标，按 Oxford/Cambridge 词典体例，带斜杠和重音符号，如 /ˈkiːpə(r)/、/ˈkiːpər/。短语逐词标在一起，如 /stem frɒm/。两者相同也分别填写。
- pos：词性（n. v. adj. adv. prep. phr. 等，短语动词写 phr. v.，名词短语写 n. phr.，专有名词写 n.（专有名词））。
- form_note：文中形式说明，例如“crept 是 creep 的过去式，creep 的过去式和过去分词都是 crept”“keepers 是复数”；原形就在文中时写“文中为原形”。
- context_usage：本文语境下的用法，写清：它在原句里作什么成分、和哪些词搭配、为什么在这里取视频给出的中文意思（zh_video），语气或感情色彩。要具体到这句话。
- etymology：词的由来与构成：前缀、词根、后缀拆分及含义，来源语言（拉丁语、古法语、古英语等）和原义如何发展到今义。只写权威词源词典能证实的；复合词讲组成部分；专有名词讲名称由来（有把握才写，否则写名称的组成或简要背景）。
- senses：常用义项，按常用程度列 2 到 5 条（pos + 中文），其中要包含本文意思。
- collocations：常见搭配或固定用法 2 到 5 条，en 写搭配，zh 写中文。
- usage_detail：详细用法说明：及物/不及物、常接的介词或结构、可数性、正式程度、语域、考研阅读或写作中的常见用法、易错点。要具体，有信息量。
- distinction：近义词辨析（与一两个易混词比较区别）；确实没有值得辨析的写空字符串。
- related：同根词、派生词 1 到 5 个（en、pos、zh），只列真实存在的词。
- example：一个文外例句（不用本文句子），en 为地道例句，用的是本文这个意思或最常用的意思，zh 为准确翻译。
只输出 id 为 ${ids.join('、')} 的词，items 按 id 排列。`
}

function verifyPrompt(job, draft) {
  const what = job.kind === 'sent' ? '逐句精讲' : '单词精解'
  return `你是严格的考研英语审校专家。下面是同事为 ${A} 这篇文章写的${what}草稿（${job.label}）。先用 Read 读文章数据，再逐条、逐字段核查草稿，目标是找出并改正每一个错误。默认怀疑，每个判断都要自己重新推一遍。
${RULES}
重点核查：
${job.kind === 'sent' ? `- 主干的主语、谓语、宾语/表语是否找对；谓语是否完整（助动词、情态动词）；句型、时态、语态是否说对。
- components：片段是否按原句顺序、原样（大小写、标点）、用一个空格相连后与原句 en 完全一致；成分标注是否正确（定语从句修饰对象、分词短语作定语还是状语、同位语等）。
- structure：从句引导词在从句中的成分、修饰关系、层次是否正确；与视频说明 video_notes 是否一致。
- grammar：规则讲得对不对，术语对不对；difficult 的条目是否有文外例句；例句是否语法正确、地道、真正示范该语法点，中文翻译是否准确。
- knowledge：词组用法与背景事实是否准确（日期、机构、法律名称等与原文一致），有无编造。
- translation_tip：是否与视频中文一致，是否只解释、不另立译文。` : `- headword、词性、form_note（时态、复数等形式）是否正确。
- 音标：英式、美式逐个核对音素和重音位置，按 Oxford/Cambridge 体例；有错就改。
- context_usage：句中成分、搭配是否说对，是否与视频中文意思 zh_video 一致。
- etymology：逐条核对词源，凡是不能被权威词源词典证实、或拆分错误的，改正或删去；不许留下臆测。
- senses、collocations、related：义项、搭配是否真实常用，派生词是否真实存在、词性和中文是否对。
- usage_detail、distinction：说法是否准确，有无误导。
- example：例句是否地道、语法正确、没有用原文句子，中文翻译是否准确。`}
- 是否违反通用规矩（破折号、粗体记号、“怎么理解”、空话套话、牛津逗号）。
同时提升质量：讲得太空泛的地方补上具体内容；但不要删掉正确有用的内容。
输出：items 为改正后的完整条目（字段齐全，条数与草稿相同，顺序不变）；corrections 逐条列出你做的每一处实质改动（id 写句号或词 id，field 字段名，before 原文要点，after 改后要点，reason 理由）。没有改动时 corrections 为空数组。

草稿：
${JSON.stringify(draft)}`
}

const jobs = [
  ...args.sentence_batches.map(ids => ({ kind: 'sent', ids, label: `sentences ${ids[0]}-${ids[ids.length - 1]}` })),
  ...args.word_batches.map(ids => ({ kind: 'word', ids, label: `words ${ids[0]}-${ids[ids.length - 1]}` })),
]

const results = await pipeline(jobs,
  job => agent(job.kind === 'sent' ? sentPrompt(job.ids) : wordPrompt(job.ids),
    { label: 'write:' + job.label, phase: 'Write', schema: job.kind === 'sent' ? SENT_OUT : WORD_OUT }),
  (draft, job) => agent(verifyPrompt(job, draft),
    { label: 'verify:' + job.label, phase: 'Verify', schema: job.kind === 'sent' ? SENT_V : WORD_V, effort: 'high' })
    .then(v => ({ kind: job.kind, ids: job.ids, draft, verified: v })),
)
return results
