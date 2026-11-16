# 《考研学人》文后词表重整规范（用户 2026-11-16 要求）

用户原话要点：词表里的单词要还原成原形；一定写词性（adj. 形容词，vt. 及物动词，vi. 不及物动词，adv. 副词……）；中文意思要根据原文语境，写出跟这篇文章语境最接近的那个意思；不要写成照着译文抠出来、过于贴着文章的说法；一定要非常完美。

## 输入
`/tmp/claude-0/-home-user/3d87cc6c-41dd-58c2-802f-d51dc0c78527/scratchpad/vocab2/input/NN.json`：
- entries[]：id、para（段落）、en（文中形式）、zh_video（视频里的中文，过于贴文章，只作理解语境用）、sentence_en / sentence_zh（所在句子）、old_table_definition（旧词表，仅供参考）、reviewed_booklet（若有：单词精解册里已审校的 headword、pos、senses，可参考但仍要自己判断）。

## 输出
`/tmp/claude-0/-home-user/3d87cc6c-41dd-58c2-802f-d51dc0c78527/scratchpad/vocab2/out/NN.json`：
```
{"no": "NN", "entries": [{"id": 1, "lemma": "keeper", "pos": "n.", "zh": "饲养员", "merge_into": null}, ...]}
```
每个输入 id 都要有一条，顺序与输入相同。

## lemma（原形）
- 动词写原形：crept → creep，endured → endure，was withdrawn → withdraw。
- 名词复数写单数：keepers → keeper，shipping lanes → shipping lane；只有复数形式或复数另有词义的保持复数（goods、remains、means、authorities 作“当局”）。
- 形容词、副词的比较级、最高级写原级。
- 分词在文中作形容词、且词典单列为形容词的，写形容词本身并标 adj.：stranded（the stranded men）、doomed、exhausting、marooned、deserted。在文中是动词用法（谓语、被动、非谓语动词作状语等）的，写动词原形。
- 词典单列的动名词名词保持原样：whaling n.、shipping n.。
- 短语写词典形式，被宾语隔开的补上 sb / sth：salutes … for → salute sb for sth；held … together → hold sb/sth together；departed for → depart for；embarked on → embark on。
- 小写；专有名词和缩写保持原样大写（New Zealand、DNA）。

## pos（词性，只用下列写法）
n.　vt.　vi.　link v.　aux. v.　modal v.　adj.　adv.　prep.　conj.　pron.　num.　art.　int.　phr.
- 单个动词必须分 vt. 或 vi.，按它在这句话里的用法：带宾语或用于被动语态 → vt.；不带宾语 → vi.；系动词（become、seem、remain 作“仍是”等）→ link v.。不许只写 v.。
- 多词：名词性复合词写 n.（shipping lane、dead reckoning、rescue attempt）；固定的介词短语、连词短语、副词短语可写 prep. / conj. / adv.（because of、as well as、at least）；动词短语和其他习语写 phr.（hinge on、hold together、salute sb for sth）。
- 单个词不许写 phr.。

## zh（中文意思）
- 写词典式释义，取最贴合本文语境的那个义项。可以写 1 到 2 个近义说法，用全角分号“；”隔开，两个都必须适合这句话：endure → 忍受；熬过。不要写词典里与本文无关的义项。
- 不要照抄视频中文的具体说法：动词不带“了、过、着”，不带本文特有的宾语或数量；名词、形容词也不要带本文特有的修饰。例：endured（熬过了五个多月）→ 忍受；熬过；split（浮冰裂开了）→ 裂开；破裂；exactly（恰好是一年前）→ 恰好；正好。
- 含义必须与视频中文一致，不能另起一个不同的意思；视频中文是对的语境意思，你要把它还原成词典里的标准说法。
- 熟词僻义一定按本文意思写：culture（细菌）→（细菌等的）培养物；reason（马会推理吗）→ 推理；思考；stand for → 代表。
- 必要时可用括号补充对象或范围：（细菌等的）培养物，（船）驶离。
- 短语中间有空位用“……”：salute sb for sth → 因……而赞扬某人。
- 简短：一般不超过 12 个字（括号内容计入），最多不超过 16 个字。
- 不用粗体、破折号、引号、英文字母（专有名词例外）。

## 同一篇里不重复
- lemma 和 pos 都与本篇前面某一条相同的，这一条写 "merge_into": 前面那条的 id，lemma、pos 照抄那条，zh 可留空字符串 ""；必要时把前面那条的 zh 扩充到两种用法都覆盖（仍然不超过 16 字）。
- lemma 相同但 pos 不同（split n. 和 split vi.）的，两条都保留。
- 不同的短语（embark in 和 embark on）不算重复。

## 核对程序
`python3 /tmp/claude-0/-home-user/3d87cc6c-41dd-58c2-802f-d51dc0c78527/scratchpad/vocab2/check_vocab2.py NN`
必须输出 OK；WARN 行是提示，要逐条看一遍，确认没问题再保留。
