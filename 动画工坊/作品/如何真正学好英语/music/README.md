# 本片配乐

主配乐：Hans Zimmer《Cornfield Chase》剪辑版（用户说明已获授权），169.342 秒，-14.0 LUFS，真峰值 -1.2 dBTP。
仓库是公开的，原曲和成品只以加密文件保存；工具和方法见 动画工坊/tools/music/README.md。

| 文件 | 内容 |
|---|---|
| `private/score.flac.enc` | 成品配乐（无损 FLAC，24 bit，48 kHz）加密 |
| `private/source_cornfield_chase.mp3.enc` | 用户提供的原曲 MP3 加密 |
| `private/SHA256SUMS` | 加密前明文的 sha256 和音频逐样本 md5 |
| `edit_plan.json` | 剪辑方案：原曲小节表、9 段剪辑、8 个接口的淡化、宏观增益、母带参数、成品指纹；rebuild_score.py 读它 |
| `edit.md` | 剪辑记录：每个接口为什么这样接、检查结果、复核 |
| `analysis.md`、`cc_map.json` | 原曲结构分析：速度、拍号、段落、和弦、小节表、循环和跳转候选 |
| `map.json` | 成品时间轴：小节线、拍点、段落、接口、锚点、场景位置（分镜用） |
| `energy.json` | 成品能量曲线：每 1/60 秒的 values、slow，hits、events（引擎用） |
| `LICENSES.md` | 配乐许可记录和 B站简介署名 |
| `cc0/` | CC0 曲子《Epic Vista》（John Bartmann）原曲和许可记录，`cc0/epic_vista/` 是它旧时间轴版本的剪辑资料 |
| `backup/score.flac` | 和本片时间轴对齐的备用配乐（CC0），做好后由 package_music.sh 放进来 |
| `director/` | 备用配乐旧版本的剪辑脚本（历史） |

出片前：`bash 动画工坊/tools/music/decrypt_music.sh 动画工坊/作品/如何真正学好英语`，解出 `music/score.wav`（被 .gitignore 挡住，不会提交）。
有密钥时复核：`bash 动画工坊/tools/music/rebuild_from_repo.sh 动画工坊/作品/如何真正学好英语`，从原曲重建并和成品逐样本对比。
