# API：当模块用

```python
import sys
sys.path.insert(0, '/path/to/say-en')
import say
```

---

## `_load_model(models_dir) -> Kokoro`

加载模型。**只需加载一次**，之后反复用同一个对象。

```python
k = say._load_model('models')
```

加载约需 2–5 秒。找不到模型文件会直接退出并提示。

---

## `synth(k, text, voice='bf_emma', speed=1.0) -> ndarray`

合成一句，返回 numpy 波形数组（24000 Hz，单声道，float32）。

```python
wav = say.synth(k, 'Hello there.', voice='bm_george', speed=0.9)
print(len(wav) / say.SR, '秒')
```

**内部已经做了两件事**：静音裁边（留 60ms 气口）、峰值超 0.95 归一。
所以拿到的波形可以直接存盘。

| 参数 | 说明 |
|---|---|
| `k` | `_load_model()` 返回的对象 |
| `text` | 英文文本，一句话 |
| `voice` | `bf_emma` / `bm_george` / `af_heart` / `am_michael` |
| `speed` | 1.0 是常速，建议 0.7–1.3 |

---

## `word_times(wav, n_words) -> list[int]`

算逐词起点，单位**毫秒**。

```python
text = 'Culture is simply another biological adaptation.'
wav = say.synth(k, text)
times = say.word_times(wav, len(text.split()))
print(times)      # [0, 30, 900, 2050, 2510, 3010]
```

返回的列表长度等于 `n_words`，第一项总是 0，严格递增，
末项不超出音频时长。

原理见 `PRINCIPLE.md` 第三节。

---

## `write(wav, path, fmt='opus', bitrate='48k') -> bool`

存盘。目录不存在会自动建。

```python
say.write(wav, 'out/001.opus')                    # opus，需要 ffmpeg
say.write(wav, 'out/001.wav', fmt='wav')          # wav，不需要 ffmpeg
say.write(wav, 'out/hi.opus', bitrate='64k')      # 提高码率
```

语音用 48k 已经听不出损失。

---

## `inspect(path) -> dict`

解码一个音频文件，回报健康状况。

```python
info = say.inspect('out/001.opus')
# {'ok': True, 'why': '', 'dur': 3.19, 'peak': 0.643, 'rms': 0.0897}
```

| 字段 | 说明 |
|---|---|
| `ok` | 三项都过为 True |
| `why` | 问题描述，用 `·` 分隔；没问题是空串 |
| `dur` | 时长，秒 |
| `peak` | 峰值，> 0.999 算削波 |
| `rms` | 均方根音量，< 0.02 算过轻 |

解码失败时返回 `{'ok': False, 'why': '解码失败'}`，没有其他字段。

---

## 常量

```python
say.VOICES        # {'bf_emma': 'Emma · 英音女声', ...}
say.SR            # 24000  采样率
say.PEAK_LIMIT    # 0.95   峰值上限
say.HEADROOM_MS   # 60     静音裁边留的气口
```

---

## 完整例子：合成一篇并检查

```python
import sys, os, json
sys.path.insert(0, '/path/to/say-en')
import say

lines = [l.strip() for l in open('passage.txt', encoding='utf-8') if l.strip()]
k = say._load_model('models')
os.makedirs('audio', exist_ok=True)

timeline = {}
for i, line in enumerate(lines, 1):
    wav = say.synth(k, line, voice='bf_emma')
    name = f'{i:03d}.opus'
    say.write(wav, f'audio/{name}')

    info = say.inspect(f'audio/{name}')
    if not info['ok']:
        print(f'  ✗ {name}  {info["why"]}')

    timeline[name] = {
        'text': line,
        'ms': say.word_times(wav, len(line.split())),
    }

json.dump(timeline, open('audio/timeline.json', 'w', encoding='utf-8'),
          ensure_ascii=False, indent=1)
print(f'  完成 {len(lines)} 段')
```
