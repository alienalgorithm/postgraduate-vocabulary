# say-en · 英文朗读合成器

给它英文，它给你音频。四种音色，逐词时间轴，自带质量检查。
完全离线运行 —— 模型下完之后不需要联网，也不需要任何 API key。

```bash
python say.py "The whale sang the same song as the others."
```

```
✓ 001.opus   3.19s  峰值 0.643
```

---

## 目录

| 文件 | 是什么 |
|---|---|
| `say.py` | **主程序**。命令行合成器，也可以当模块导入 |
| `make_audio.py` | 批量版。给整篇文章一次做完几百段（原本给 IELTS 阅读库用的） |
| `docs/PRINCIPLE.md` | **原理**：语音合成怎么工作，逐词时间轴怎么算出来的 |
| `docs/USAGE.md` | **用法**：每个参数、每种场景，带完整例子 |
| `docs/PITFALLS.md` | **踩过的坑**：八个真实 bug 与它们的修法 |
| `docs/API.md` | 当模块用时的函数说明 |
| `examples/` | 可以直接跑的示例 |
| `models/` | **模型已包含**：kokoro-v1.0.onnx 310 MB + voices-v1.0.bin 27 MB |

**第一次用，按顺序读**：本文的「五分钟上手」 → `docs/USAGE.md`。
**想知道为什么这么写**：`docs/PRINCIPLE.md` 与 `docs/PITFALLS.md`。

---

## 两分钟上手

### 1 · 装依赖

```bash
pip install kokoro-onnx soundfile numpy
```

还要 ffmpeg（用来编码 opus）：

```bash
apt install ffmpeg        # Ubuntu / Debian
brew install ffmpeg       # macOS
# Windows: 去 ffmpeg.org 下，解压后把 bin 目录加进 PATH
```

验一下装好了没：

```bash
python -c "import kokoro_onnx, soundfile, numpy; print('库 OK')"
ffmpeg -version | head -1
```

### 2 · 跑起来

**模型已经在包里了，不用下载。**

```bash
python say.py "Hello, this is a test."
```

看到 `✓ 001.opus` 就成了。

---

## 常用的几种

```bash
# 一句话
python say.py "The whale sang the same song."

# 整篇文件，每行一句
python say.py --file passage.txt --out audio/

# 四种音色各出一份
python say.py "Hello there." --all-voices

# 逐词时间轴（做跟读高亮用）
python say.py "Hello there." --timeline

# 换音色、调语速
python say.py "Hello there." --voice bm_george --speed 0.9

# 存成无损 wav
python say.py "Hello there." --format wav

# 检查已有音频合不合格
python say.py --check audio/
```

---

## 四种音色

| id | 说明 |
|---|---|
| `bf_emma` | 英音女声（默认） |
| `bm_george` | 英音男声 |
| `af_heart` | 美音女声 |
| `am_michael` | 美音男声 |

```bash
python say.py --list-voices
```

---

## 它替你守住三条

这三条都是踩过坑才写进去的，详见 `docs/PITFALLS.md`。

**① 不削波** —— 峰值超过 0.95 自动归一。
否则重读的地方会失真，听着发毛刺。

**② 时间轴存毫秒，严格递增，不超出音频时长**
存成秒的话逐词高亮会一格不动，而且**什么错都不报** —— 这个坑藏了很久。

**③ 静音裁边** —— 掐掉首尾空白，但留 60 毫秒气口。
不留的话听着像被剪断了。

---

## 当模块用

```python
import sys
sys.path.insert(0, 'path/to/say-en')
import say

k = say._load_model('models')
wav = say.synth(k, 'Hello there.', voice='bf_emma', speed=1.0)
say.write(wav, 'out.opus')

times = say.word_times(wav, len('Hello there.'.split()))
print(times)          # [0, 480]  毫秒

info = say.inspect('out.opus')
print(info)           # {'ok': True, 'dur': 1.2, 'peak': 0.64, 'rms': 0.09}
```

完整说明见 `docs/API.md`。

---

## 硬件要求

```
内存    2 GB 够用；一次做几百段的话建议 4 GB
CPU     不需要 GPU。合成一句约 1–3 秒
磁盘    模型 340 MB + 音频（opus 每分钟约 350 KB）
```

**内存不够会被系统直接杀掉进程**，没有报错信息。
批量合成请用 `make_audio.py`，它做了断点续跑。

---

## 常见问题

**跑起来说找不到模型**
模型就在包里的 `models/` 目录。如果报这个错，多半是解压时漏了文件，
或者你在别的目录跑 —— 用 `--models 路径` 指定模型位置。

**说 ffmpeg 编码失败**
没装 ffmpeg，或者不在 PATH 里。也可以加 `--format wav` 绕过它。

**批量合成跑到一半没了**
内存被吃满，进程被杀。用 `make_audio.py`，它每 8 段存一次盘，
反复跑同一条命令就能推进，不会重做。

**两次合成同一句，波形不完全一样**
正常。ONNX 推理有浮点尾差，同一模型重跑一次波形不会逐位相同。
听感上没有区别，三项质量指标也都一样。

---

## 许可与来源

合成模型是 [kokoro-onnx](https://github.com/thewh1teagle/kokoro-onnx)，
基于 [Kokoro-82M](https://huggingface.co/hexgrad/Kokoro-82M)（Apache 2.0）。
本包的代码可自由使用与修改。
