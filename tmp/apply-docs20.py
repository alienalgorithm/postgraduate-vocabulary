#!/usr/bin/env python3
from pathlib import Path
import re

def r(p): return Path(p).read_text(encoding='utf-8')
def w(p,s): Path(p).parent.mkdir(parents=True,exist_ok=True);Path(p).write_text(s,encoding='utf-8')
def one(s,a,b,label):
    if s.count(a)!=1: raise SystemExit(f'{label}: {s.count(a)} matches')
    return s.replace(a,b,1)

p='notes/对话交接文档.md';s=r(p)
s=s.replace('当前权威状态：**十九篇最终定稿，950个重点词，第19篇与19篇网站均已进入主分支。**','当前权威状态：**二十篇最终定稿，1000个重点词，第20篇与20篇网站均已进入主分支。**')
s=s.replace('## 3. 当前十九篇最终定稿','## 3. 当前二十篇最终定稿')
old="| **19** | ***Five Alarms, Still Descending*** | **1969年阿波罗11号1201/1202程序警报、优先级软件与地面‘继续’判断** | **270 / 50 / 18.5%** | **第十九篇最终精进锁定稿** |"
new=old+"\n| **20** | ***The Market Came After the Limit*** | **1990—2010年美国酸雨计划、二氧化硫总量控制与排放权交易** | **269 / 50 / 18.6%** | **第二十篇最终精进锁定稿** |"
s=one(s,old,new,'handoff row20')
s=s.replace('- 19篇\n- 950个重点词','- 20篇\n- 1000个重点词').replace('- 950个速查表词元无跨篇精确重复','- 1000个速查表词元无跨篇精确重复').replace('- 950个英文加粗表面形式无跨篇精确重复','- 1000个英文加粗表面形式无跨篇精确重复')
s=re.sub(r'^## (\d+)\. ',lambda m:f"## {int(m.group(1))+1}. " if int(m.group(1))>=4 else m.group(0),s,flags=re.M)
section="""## 4. 第20篇不可误认的版本特征

### 20 · The Market Came After the Limit

中文标题：**《市场在上限之后》**。正式指标：**269词 / 50重点词 / 18.6%**。

正式开头：

> In 1990, US **legislation** confronted acid rain from power-plant **smokestacks**.

正式结尾：

> A market can **ration** **permission**—but it cannot choose the atmosphere’s budget.

核心边界：

1. 1990年修法要求电力行业二氧化硫年排放量较1980年永久减少1000万吨；2010年总量上限为895万吨。
2. 每份额度对应一吨排放；企业可以使用、出售或留存额度，但交易不能扩大总量上限。
3. 制度不强制所有电厂安装同一种设备；洗涤器、低硫煤、额度交易和运行调整都是可选路径。
4. 市场必须建立在连续监测、公开账户、年度交回、自动处罚和次年弥补之上；没有可核验的核算，就没有可信的交易。
5. 持有额度不代表可以违反地方空气质量和公共健康标准。
6. 2008年计划覆盖电源的二氧化硫排放已降至760万吨，低于2010年上限；但交易并非唯一原因。
7. 低硫煤运输成本、承运商竞争、工程改进和后续规则共同影响了减排速度与成本，不能把全部功劳归给交易。
8. 结尾的独特论点是：法律决定大气预算，市场只在这个有边界的预算内寻找更低成本的减排地点。

任何出现以下特征的版本都不是当前定稿：

- 指标为263词 / 50重点词 / 19.0%
- 使用 `uniform / purchase / monitors / excess / freight / railway` 这一组与前文重复的候选词
- 把额度交易写成市场自行决定可以污染多少
- 省略连续监测、年度对账、处罚或次年弥补机制
- 把全部减排与成本下降只归功于交易

---

"""
s=one(s,'## 5. 第19篇不可误认的版本特征\n',section+'## 5. 第19篇不可误认的版本特征\n','handoff section20')
s=s.replace('data/article-19.js\n```','data/article-19.js\ndata/article-20.js\n```')
s=s.replace('主分支中的实际页面文件已经同步为19篇、950词','主分支中的实际页面文件已经同步为20篇、1000词').replace('首页会自动显示19篇、950个重点词，并把第18篇作为最新专题。','首页会自动显示20篇、1000个重点词，并把第20篇作为最新专题。')
s=s.replace('核对950个已用词','核对1000个已用词').replace('下一篇编号为 **20**','下一篇编号为 **21**').replace('前950词','前1000词').replace('当前粗略剩余词元：1595个','当前粗略剩余词元：1545个')
w(p,s)

record="""# 第二十篇入库记录 · 2026-08-13

## 一、当前唯一权威稿

- 编号：20
- 英文标题：*The Market Came After the Limit*
- 中文标题：《市场在上限之后》
- 题材：1990—2010年美国酸雨计划、二氧化硫总量控制与排放权交易
- 状态：第二十篇最终精进锁定稿
- 英文正文：269词
- 重点词：50个
- 关键词密度：18.6%
- 结构：5段，每段10个重点词

## 二、独特叙事发动机

本篇不是“异常—排除—发现”，而是拆解一个制度的先后顺序：

1. 法律先确定全国排放总量。
2. 一吨一份的额度把总量变成可核算单位。
3. 企业在设备、燃料与交易之间选择较低成本路径。
4. 连续监测、年度交回、处罚与次年弥补使承诺可执行。
5. 价格只决定减排在哪里更便宜，不能决定大气应承受多少污染。

## 三、词库结果

- 新增50个重点词，五段各10个。
- 与前950个速查表词元无精确重复。
- 与前950个英文加粗表面形式无精确重复。
- 工作稿中的 `uniform / purchase / monitors / excess / freight / railway` 因全库重复已全部淘汰。

## 四、史实边界

- 2010年二氧化硫总量上限为895万吨，约为1980年电力行业排放的一半。
- 一份额度对应一吨排放；交易和留存改变路径，不改变总量。
- 额度不足触发自动处罚，并须用未来额度弥补缺口。
- 额度不能凌驾于地方空气质量标准之上。
- 2008年排放已低于2010年上限，但低硫煤运输、工程进步和后续规则同样发挥作用。

## 五、最终身份

正式开头：

> In 1990, US **legislation** confronted acid rain from power-plant **smokestacks**.

正式结尾：

> A market can **ration** **permission**—but it cannot choose the atmosphere’s budget.

```text
269词 / 50重点词 / 18.6%
```

## 六、同步范围

已同步权威数据、正式Markdown、首页、阅读器、1000词词库、README、交接文档、站点地图、PWA描述、分享卡、404页、最终版本清单、全库审计和永久CI。
"""
w('notes/第二十篇入库记录_2026-08-13.md',record)
print('handoff and article 20 record updated')
