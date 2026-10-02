+++
title = "弃用说明"
linkTitle = "弃用说明"
description = "Hugo 弃用功能、方法与配置项的流程：从 INFO 提示到构建失败要走多久，升级后如何把提示捞出来，以及看到提示该怎么处理。"
date = 2026-10-01
weight = 30
source = "https://gohugo.io/troubleshooting/deprecation/"

[params.teach]
difficulty = "入门"
time = "5–10 分钟"
prereq = [
  "已经会执行 `hugo` / `hugo build` 构建站点",
  "刚升级过 Hugo，或在日志里看到过 `deprecated` 字样",
]
outcomes = [
  "说清弃用的三个阶段（INFO → WARN → ERROR 并使构建失败）各持续多久",
  "用 `--logLevel info` 在升级后主动捞出弃用提示，并知道为什么默认看不到",
  "判断手上的提示是「现在就该改」还是「还可以等」",
]
next = ["/troubleshooting/logging/", "/troubleshooting/faq/"]

+++

当一个项目宣布某项内容「弃用」（deprecate）时，它是在告诉用户三件事：

1. 不要再使用「甲」了。
2. 请改用「乙」。
3. 我们会在将来某个时间点移除「甲」。

常见的[弃用原因](https://en.wikipedia.org/wiki/Deprecation)包括：

- 某项功能已被更强大的替代方案取代。
- 某项功能存在设计缺陷。
- 某项功能被认为是多余的，为了简化整个系统，将来会被移除。
- 软件的后续版本会有重大结构调整，导致继续支持旧功能不可能或不切实际。
- 为了统一命名或提高一致性。
- 过去只能独立使用的功能，现在与其配套功能合并。

## 弃用的节奏

项目团队在代码中弃用某项内容之后，Hugo 会：

1. 在 3 个次版本（minor release）中记录 INFO 级别的消息；
2. 再在 12 个次版本中记录 WARN 级别的消息；
3. 此后记录 ERROR 级别的消息，并让构建失败。

这里的次版本指版本号中第二段数字递增的发布，例如 v0.1.1 => v0.2.0 就是一个次版本。

把三个阶段连起来看，一头一尾的差别很大：

| 阶段 | 日志级别 | 持续多久 | 对构建的影响 | 你该做什么 |
| --- | --- | --- | --- | --- |
| 刚弃用 | INFO | 3 个次版本 | 不影响 | 默认看不到，需要主动用 `--logLevel info` 捞 |
| 缓冲期 | WARN | 12 个次版本 | 不影响，但每次构建都会出现 | 排期替换，别拖到最后 |
| 到期 | ERROR | 之后一直如此 | **构建失败** | 必须替换，否则站发不出去 |
| 移除代码 | —— | ERROR 开始后再过 6 个或更多次版本 | 报错，但不再提「弃用」 | 到这一步只能查文档或 issue |

**注意第三行到第四行之间的落差**：代码被移除之后，报错信息里**不再出现「弃用」这个词**，只留下一个普通的函数不存在、配置项无效一类的错误。所以看到弃用提示时尽快处理，比事后从零排查便宜得多。

## 文档的处理

项目团队会：

1. 在弃用日期当天更新文档，加入说明弃用的注记以及相关的替代方案；
2. 在 Hugo 开始记录 ERROR 消息并导致构建失败之后的 6 个或更多次版本后移除代码。到那时 Hugo 仍然会抛出错误，但错误消息中不再提到弃用；
3. 在弃用日期两年之后移除对应的文档。

因此，升级 Hugo 时看到弃用提示，最好当场处理，而不要等到功能被移除。

## 如何查看弃用提示

要看 INFO 级别的消息，必须使用 `--logLevel` 命令行标志：

```bash
hugo build --logLevel info
```

只想保留弃用相关的提示时，可以过滤输出：

```bash
hugo build --logLevel info | grep deprecate
```

Windows PowerShell 没有 `grep`，用 `Select-String` 过滤：

```powershell
hugo build --logLevel info | Select-String deprecate
```

### 你应当看到什么

带 `--logLevel info` 时，终端里除了构建统计，还会出现以级别标签开头的行（实测输出格式为 `INFO  ` 开头，级别标签后跟两个空格）：

```text
INFO  deprecated: <被弃用的东西> was deprecated in vX.Y.Z and will be removed in a future release. Use <替代项> instead.
```

上例中的 `<被弃用的东西>` / `<替代项>` 是占位，具体文案随弃用项不同。判据只有一条：**这一行里含 `deprecated`，并给出替代写法**。按替代写法改完，再运行一次同样的命令，该行消失即修复完成。

> [!NOTE]
> 弃用提示的措辞与所在级别由 Hugo 的版本决定，本文不保证每个版本的文案一致；以你本地 `hugo version` 对应的实际输出为准。

## 升级后的固定动作

1. 记录升级前后的版本：`hugo version`；
2. 用 `hugo build --logLevel info` 完整构建一次（不是 `hugo server`——开发服务器的输出会被文件监视信息淹没，也不适合作为留档）；
3. 过滤 `deprecated`，逐条把替代写法落实；
4. 再构建一次，确认没有新增的 WARN / ERROR。

如果不指定 `--logLevel`，默认只会显示警告与错误，弃用初期的 INFO 提示就被淹没了，因此请在每次升级 Hugo 之后运行上面的命令。日志级别的完整说明见[日志](/troubleshooting/logging/)，`hugo build` 的其他选项见[命令](/commands/)。

## 常见坑

**命令找不到**

- `grep: command not found`（Windows）或 `'grep' 不是内部或外部命令`：改用上面的 `Select-String` 写法；
- `hugo: command not found`：升级后换了安装方式（例如从包管理器换到压缩包），`PATH` 可能指向旧路径，用 `hugo version` 与 `Get-Command hugo` / `which hugo` 确认；
- 管道里的 `deprecate` 拼成 `deprecated` 也能匹配（`grep` 默认按子串匹配），但如果反过来写成 `depr` 之外的短词就会漏。

**没有报错但结果不对**

- **构建「通过」却没有提示**：默认日志级别不含 INFO，弃用初期的提示根本不会打印。这是最常见的一种「看起来没问题」；
- 构建正常但线上行为变了：弃用提示只是前兆，真正的行为变化要查[版本说明](https://gohugo.io/news/)；
- 只看了 `hugo server` 的窗口：开发服务器的输出会滚动刷新，容易漏掉开头的提示，请用 `hugo build` 留档。

**报错看不懂**

- 出现 `ERROR ... deprecated ...` 并使构建失败：说明已经进入第三阶段，按提示给出的替代项替换即可；
- 报错里**没有**「弃用」字样，却突然说某个函数 / 配置项无效：很可能代码已经被移除（表格最后一行），此时只能查对应文档页或上游 issue；
- `hugo build` 本身不被旧版本识别：旧版可能只支持不带子命令的 `hugo`，用 `hugo --help` 确认。

个别提示如果确认与自己无关，可以用消息 ID 屏蔽（`warnidf` / `erroridf` 产生的日志支持 `ignoreLogs`），做法见[日志](/troubleshooting/logging/)。
