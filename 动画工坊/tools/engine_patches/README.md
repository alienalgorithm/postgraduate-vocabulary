# 引擎补丁

引擎原件在动画工作目录 A 里开发，同步进仓库时会整份覆盖作品目录的 engine/。工坊对引擎只有几处小改动，全部写在 apply.sh 里，每次同步后自动重新套用，所以反复同步不会丢。补丁不改任何渲染逻辑，同样的分镜和场景出的画面逐字节相同（已实测）。

用法：

    bash 动画工坊/tools/engine_patches/apply.sh <作品目录>

sync_from_workspace.sh 和 new_film.sh 会自动调用，平时不用手动跑。已套过的补丁会跳过；某处引擎写法变了导致没套上，会打印提醒并继续，不会让同步停下。

## 现有改动

| 文件 | 改动 | 原因 |
|---|---|---|
| engine/asset.js | ILLUS_DIR 的默认值从本机绝对路径改成 作品目录/sources/illus | 仓库里不能有本机临时目录；换台机器也能用 |
| engine/asset.js | PKG_DIR 的默认值改成 作品目录/sources/pkg | 同上 |
| engine/asset.js | 找不到插图或原片时，报错里写明设置 ILLUS_DIR、PKG_DIR 或把文件放进 sources/ | 缺素材时一眼知道怎么办 |
| engine/asset.js | 文件头注释同步说明新的默认路径 | 和代码一致 |
| engine/README.md | 第 5 行 A 的本机绝对路径换成“作品目录” | 文档里不留本机路径 |

asset.js 只在导入用户自己的插图和 4K 视频帧时用（node engine/asset.js illus 05 之类），出片和 CI 都不用它。sources/ 已写进 动画工坊/.gitignore，不进仓库。

apply.sh 最后会检查 engine/ 里是否还有 /tmp/claude、/home/user、/root/ 这类本机路径，有就列出来。

## 加一处新改动

在 apply.sh 里加一行 patch(文件, 名字, 已套标记, 正则, 替换)：

- 已套标记：改完后文件里一定会出现、改之前一定没有的一小段文字，用来保证幂等；
- 正则：匹配原件里要改的那一处，只改一处；
- 改完在上表加一行，再跑一次同步，确认输出是“没套上 0”。
