# 用法：每个参数、每种场景

---

## 命令行速查

```
python say.py [文字] [选项]

位置参数
  文字                  要念的英文；与 --file 二选一

输入
  --file FILE           文本文件，每行一句
  
输出
  --out DIR             输出目录，默认当前目录
  --format opus|wav     默认 opus（体积小）；wav 是无损
  --timeline            同时产出 timeline.json（逐词时间轴）

音色与语速
  --voice VOICE         默认 bf_emma
  --all-voices          四种音色各出一份
  --speed FLOAT         默认 1.0；0.8 慢一点，1.2 快一点
  --list-voices         列出四种音色

其他
  --models DIR          模型目录，默认 models
  --check DIR           检查这个目录下的音频，不做合成
```

---

## 场景一：念一句话

```bash
python say.py "The whale sang the same song as the others."
```

```
✓ 001.opus   3.19s  峰值 0.643  The whale sang the same song as the o
```

输出到当前目录的 `001.opus`。

**换个地方放**：

```bash
python say.py "Hello there." --out ~/Desktop/audio
```

---

## 场景二：念整篇文章

先把文章按句分行存成 txt：

```
Most social scientists stubbornly resist the idea that animals have culture.
But patient observation has begun to reveal behaviour learned from other whales.
Humpback populations in different oceans sing different songs.
```

```bash
python say.py --file passage.txt --out audio/
```

```
✓ 001.opus   4.82s  峰值 0.612  Most social scientists stubbornly res
✓ 002.opus   6.61s  峰值 0.616  But patient observation has begun to
✓ 003.opus   3.51s  峰值 0.751  Humpback populations in different oce

  合成 3 段 → audio/
```

**空行会被自动跳过**，所以段落之间空一行不影响。

---

## 场景三：四种音色都要

```bash
python say.py "Culture is another biological adaptation." --all-voices --out audio/
```

```
✓ bf_emma_001.opus       3.05s  峰值 0.630
✓ bm_george_001.opus     3.78s  峰值 0.504
✓ af_heart_001.opus      3.13s  峰值 0.606
✓ am_michael_001.opus    3.62s  峰值 0.691
```

文件名带上了音色前缀。

**与 `--file` 一起用**：三句 × 四音色 = 12 个文件。

---

## 场景四：要逐词时间轴

做跟读高亮（光标随朗读逐词移动）需要它。

```bash
python say.py "Culture is simply another biological adaptation." --timeline
```

多产出一个 `timeline.json`：

```json
{
 "001.opus": {
  "text": "Culture is simply another biological adaptation.",
  "ms": [0, 30, 900, 2050, 2510, 3010]
 }
}
```

`ms` 里是每个词的**起点，单位毫秒**。
六个词对应六个数，第一个总是 0。

**前端怎么用**（JavaScript）：

```javascript
const audio = new Audio('001.opus');
const times = [0, 30, 900, 2050, 2510, 3010];
const words = document.querySelectorAll('.word');

audio.play();
function tick() {
  const ms = audio.currentTime * 1000;      // 注意乘 1000
  let i = 0;
  while (i + 1 < times.length && times[i+1] <= ms) i++;
  words.forEach((w, k) => w.classList.toggle('on', k === i));
  if (!audio.paused) requestAnimationFrame(tick);
}
tick();
```

**`currentTime` 是秒，时间轴是毫秒** —— 乘 1000 这一步不能漏。

---

## 场景五：调语速

```bash
python say.py "Hello there." --speed 0.85     # 慢，适合初学者
python say.py "Hello there." --speed 1.15     # 快，接近母语者语速
```

建议范围 **0.7 到 1.3**。
再慢会拖音，再快会吞音。

---

## 场景六：要无损音频

```bash
python say.py "Hello there." --format wav
```

体积约是 opus 的十倍，但没有编码损失。
需要再做后期处理（混音、变调、拼接）时用它。

**不需要 ffmpeg** —— wav 由 soundfile 直接写出。

---

## 场景七：检查已有音频

```bash
python say.py --check audio/
```

```
  查了 40 个，0 个有问题 —— 全部合格 ✓
```

有问题的话会逐个列出来：

```
  ✗ 007.opus               削波
  ✗ 023.opus               过轻

  查了 40 个，2 个有问题
```

**它查三样**：

| 项 | 判据 | 说明 |
|---|---|---|
| 削波 | 峰值 > 0.999 | 波峰被削平，听着刺耳 |
| 过轻 | RMS < 0.02 | 音量太小，可能是空文件或合成失败 |
| 过短 | 时长 < 0.25 秒 | 大概率是没合成成功 |

递归查子目录，`.opus` 与 `.wav` 都查。

**退出码**：全合格返回 0，有问题返回 1 —— 可以接进自动化流程。

---

## 场景八：批量做整个项目

一次几百段用 `make_audio.py`，它针对大批量做了三件事：

```bash
python make_audio.py <slug>                  # 跑全套
python make_audio.py <slug> --voice=bf_emma  # 只跑一个音色
python make_audio.py <slug> --part=vocab     # 只跑生词部分
python make_audio.py <slug> --n=12           # 这趟最多做 12 段
```

**它比 say.py 多做的**：

1. **断点续跑** —— 每次启动先读 `audio.json`，跳过已完成的
2. **增量存盘** —— 每 8 段存一次，中途被打断也不白跑
3. **限流** —— `--n` 控制每趟做多少，防止内存被吃满

**为什么需要这些**：合成几百段会吃掉大量内存，
容器或低配机器上进程会被系统直接杀掉，**没有任何报错**。
所以反复跑同一条命令推进，是最稳的做法。

注意 `make_audio.py` 是为 IELTS 阅读库定制的，
它读 `passages/<slug>/content.py`。
要用在别的项目上，改 `load()` 与 `main()` 里取文本那几行即可。

---

## 当模块用

```python
import sys
sys.path.insert(0, '/path/to/say-en')
import say

# 加载一次，反复用
k = say._load_model('models')

# 合成
wav = say.synth(k, 'Hello there.', voice='bf_emma', speed=1.0)

# 存盘
say.write(wav, 'out.opus')                  # opus
say.write(wav, 'out.wav', fmt='wav')        # wav

# 时间轴
text = 'Hello there.'
times = say.word_times(wav, len(text.split()))
print(times)        # [0, 480]

# 质检
info = say.inspect('out.opus')
print(info)         # {'ok': True, 'why': '', 'dur': 1.24,
                    #  'peak': 0.643, 'rms': 0.089}
```

完整函数说明见 `API.md`。

---

## 排错

### 找不到模型

```
找不到 models/kokoro-v1.0.onnx
请照文件开头的说明下载模型。
```

模型没下，或者不在 `models/` 目录。用 `--models 路径` 指别处。

### ffmpeg 编码失败

```
ffmpeg 编码失败——装了吗？apt install ffmpeg
```

装 ffmpeg，或者加 `--format wav` 绕过它。

### 跑到一半进程没了，什么也没打印

内存被吃满，系统直接杀了进程。

```bash
free -h        # 看看还剩多少
```

用 `make_audio.py` 加 `--n=10` 分批跑。

### 合成出来是静音或很短

多半是文字里有模型处理不了的字符。
先把非 ASCII 字符清掉试试：

```python
text = ''.join(c for c in text if ord(c) < 128)
```

### 两次合成同一句，文件大小不一样

正常，见 `PRINCIPLE.md` 第七节。
听感与质量指标都一致。

---

## 一条完整的流水线示例

```bash
# 1  准备文本
cat > passage.txt <<'EOF'
Most social scientists stubbornly resist the idea that animals have culture.
But patient observation has begun to reveal behaviour learned from other whales.
EOF

# 2  合成，四音色，带时间轴
python say.py --file passage.txt --all-voices --timeline --out audio/

# 3  质检
python say.py --check audio/

# 4  看看时间轴
python -c "
import json
t = json.load(open('audio/timeline.json', encoding='utf-8'))
for k, v in t.items():
    print(k, len(v['text'].split()), '词 →', len(v['ms']), '项')
"
```
