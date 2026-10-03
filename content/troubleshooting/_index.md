+++
title = "故障排查"
linkTitle = "故障排查"
description = "构建失败、页面缺失或输出不对时的分诊台：先按症状定位，再按「可能原因 → 怎么确认 → 怎么修」处理，并给出本章的阅读顺序。"
date = 2026-10-01
weight = 120
source = "https://gohugo.io/troubleshooting/"

[params.teach]
difficulty = "入门"
time = "按需查阅，通读约 40 分钟"
prereq = [
  "已经跑通过一个站点（至少完成[快速开始](/getting-started/quick-start/)），否则无从对比「正常长什么样」。",
  "能打开终端并复制报错全文——排错的一半功夫在于把现象**完整**描述出来。",
]
outcomes = [
  "把任何一个问题分进三类之一：命令找不到 / 构建成功但结果不对 / 报错看不懂；",
  "用 `hugo env`、`hugo config`、`hugo list`、`--logLevel`、`--printPathWarnings` 把猜测换成可核对的输出；",
  "在模板里用 `debug.Dump`、`warnf`、`debug.Timer` 取出中间值；",
  "写出一份别人能照着复现的最小问题报告。",
]
next = ["/troubleshooting/faq/", "/troubleshooting/inspection/", "/troubleshooting/audit/"]
+++

出问题时，最先要做的不是改代码，而是**分诊**：先判断症状属于哪一类，再按「可能原因 → 怎么确认 → 怎么修」三段走。本章每一页都按这个结构组织，你也可以直接从下面的分诊表跳到属于自己的那一节。

排查的基本顺序始终是：**先确认输入（内容文件与配置），再确认模板（`layouts/`），最后确认输出（发布目录里真正的 HTML）**。沿着这条链路逐段核对，多数问题都能定位到具体的一环。

## 读完本章你应该能够

- 把问题分进三类之一：**命令找不到**、**构建成功但结果不对**、**构建失败且报错看不懂**；
- 用 `hugo env`、`hugo config`、`hugo list`、`--logLevel`、`--printPathWarnings` 把猜测变成可核对的输出；
- 在模板内部用 `debug.Dump`、`warnf` / `errorf`、`debug.Timer` 取出中间值；
- 在部署前跑一遍[审计](/troubleshooting/audit/)，抓住构建阶段不报错、却会出现在线上站点的问题；
- 写出一份能让别人复现问题的最小报告。

## 阅读顺序

本章页面默认按「先救急、再深入」排列，建议按这个顺序读：

1. [常见问题](/troubleshooting/faq/) —— 先扫一遍，多数新手问题在这里有现成答案；
2. [检查与调试](/troubleshooting/inspection/) —— 问题不在 FAQ 里，就需要自己把中间值打出来看；
3. [日志](/troubleshooting/logging/) —— 用日志级别与 `warnf` / `errorf` 让构建过程留下可判断的线索；
4. [审计](/troubleshooting/audit/) —— 站点能构建、但担心线上出问题时，做一次集中体检；
5. [弃用说明](/troubleshooting/deprecation/) —— 升级 Hugo 之后必看，弃用提示只有 3 个次版本的 INFO 窗口；
6. [性能](/troubleshooting/performance/) —— 构建变慢时再读，先量后调。

## 三分钟分诊

| 症状 | 先看这里 |
| --- | --- |
| 终端提示 `hugo: command not found`、「不是内部或外部命令」 | 下文「[症状 A：命令找不到](#症状-a命令找不到)」 |
| 构建退出码是 0，但页面缺失、内容不对、样式丢失 | 下文「[症状 B：没有报错但结果不对](#症状-b没有报错但结果不对)」 |
| 构建失败，报错看不懂，或报错指向的文件看起来没问题 | 下文「[症状 C：报错看不懂](#症状-c报错看不懂)」 |
| 升级 Hugo 后出现不认识的提示 | [弃用说明](/troubleshooting/deprecation/) |
| 构建越来越慢 | [性能](/troubleshooting/performance/) |

## 症状 A：命令找不到

**可能原因**

- Hugo 没有安装，或者装了但安装目录不在 `PATH` 里；
- 装在了另一个终端环境里（例如在 WSL 中安装，却在 Windows PowerShell 中执行）；
- 装了，但版本过旧，不认识当前文档里的子命令写法。

**怎么确认**

```bash
hugo version
```

Windows（PowerShell）还可以查清命令究竟解析到哪个文件：

```powershell
Get-Command hugo
```

macOS / Linux：

```bash
which hugo
```

- 看到 `hugo v0.167.0+extended windows/amd64 ...` 一类输出：安装没问题，问题在别处；
- 看到 `command not found` 或「不是内部或外部命令」：命令确实不在当前环境的 `PATH` 中；
- `Get-Command` / `which` 没有输出，或指向一个陌生目录：`PATH` 配错了。

**怎么修**

1. 按[安装](/installation/)中对应平台的小节重新安装；
2. 确认安装目录已加入 `PATH`，然后**重开终端**——修改 `PATH` 不会让已经打开的终端立刻生效；
3. 核对 `hugo version`。旧版本可能只支持不带子命令的写法，用 `hugo --help` 对照当前版本支持哪些命令。

## 症状 B：没有报错但结果不对

这是最难查的一类：**终端没有信息可看，证据不在日志里，而在产物和数据里**。所以第一步不是改模板，而是先确认「Hugo 到底读到了什么」。

**可能原因与对应的确认方法**

| 可能原因 | 怎么确认 |
| --- | --- |
| 不在项目根目录执行 | 当前目录下是否有 `hugo.toml`；Hugo 打印的页面数是不是明显偏小 |
| 页面被 `draft`、未来的 `date` / `publishDate`、已过的 `expiryDate` 排除 | `hugo list drafts`、`hugo list future`、`hugo list expired` |
| 两个页面发布到同一路径，互相覆盖 | `hugo build --printPathWarnings` |
| 主题没生效（`theme` 写错，或 `themes/<名字>/` 不存在） | `hugo config` 查看生效的 `theme`；确认主题目录存在 |
| 模板拿到的值与自己以为的不一样 | 在模板里用 `debug.Dump` 打出实际值，见[检查与调试](/troubleshooting/inspection/) |
| 看的是上一次构建的旧产物 | 删掉 `public/` 后重新构建，或加 `--ignoreCache` |

**怎么修**

- 先回到项目根目录（`hugo.toml` 所在的那一层）再执行命令；
- 内容被草稿或时间字段排除时，改字段值，或用 `--buildDrafts`、`--buildFuture`、`--buildExpired` 预览，规则见[常见问题](/troubleshooting/faq/)；
- 路径冲突时，检查同一篇文章是否同时存在于 `content/a/b.md` 与 `content/a/b/index.md` 两个位置；
- 数据不符时，**先打印实际值再改模板**，不要凭印象改。

## 症状 C：报错看不懂

**可能原因**

- 报错指向的内容文件里其实没有短代码，但正文存在**未转义的短代码分隔符**。要在正文里展示短代码语法，必须写成 `{{</* name */>}}`；要展示转义写法本身，写成 `{{</*/* name */*/>}}`；
- 配置文件编码不对：Windows PowerShell 5.1 用 `>` / `>>` 重定向会写出 UTF-16LE + BOM，Hugo 报 `toml: invalid character at start of key: U+00FF`；
- 模板语法错误，或引用了不存在的模板、参数、函数；
- Hugo 把错误归因到了正在渲染的那一页，而真正的问题在别的文件里。

**怎么确认**

```bash
hugo --ignoreCache --renderToMemory --logLevel info
```

- `--ignoreCache` 排除缓存造成的假象；
- 报错通常带文件路径与行列号，先打开那个文件对应位置核对；
- 若该文件看起来没问题，用**二分法**缩小范围：先把一半内容文件移出 `content/`，重新构建，看错误是否消失，再对剩下的部分重复。

**怎么修**

- 短代码分隔符问题：改成转义写法；
- 编码问题：用编辑器把文件另存为 UTF-8（不带 BOM），或改用 PowerShell 7 / WSL / Git Bash 执行命令；
- 模板问题：先用一个最小模板替换可疑文件，确认构建能过，再逐步恢复内容；
- 自己判断不了时，把**完整报错**贴到[论坛](https://discourse.gohugo.io)，并附上 `hugo env` 的输出与一个最小复现项目。

## 常用入口

以下命令适合作为排查的起点，完整选项见[命令](/commands/)：

```bash
# 显示默认配置与自定义配置，确认配置是否生效
hugo config

# 显示版本与环境信息，向他人求助时附上这份输出
hugo env

# 提高日志级别，查看构建过程中的细节
hugo build --logLevel debug

# 检查重复的目标路径等警告
hugo build --printPathWarnings
```

配置项的读取顺序与默认值规则见[配置](/configuration/)；目录结构对构建结果的影响见[目录结构](/getting-started/directory-structure/)。构建成功但页面内容不对时，先从内容文件与模板入手；构建直接失败时，日志与错误消息是首要线索。

## 排查的基本思路

先复现，再缩小范围。把问题固定在一个可以反复执行的最小场景上，然后一次只改动一个变量，观察输出如何变化。常见做法包括：

1. 用最小项目复现问题，排除主题、模块与第三方服务的干扰。
2. 关闭与问题无关的构建选项，减少参与渲染的内容。
3. 逐段注释模板，确认问题由哪个模板、哪个区段引起。
4. 在页面中输出中间值，核对 Hugo 实际拿到的数据是否与预期一致，做法见[检查与调试](/troubleshooting/inspection/)。

## 获取帮助

Hugo 论坛是活跃的用户与开发者社区，可以在那里提问、分享经验并找到示例。提问前请先阅读论坛的[求助指南](https://discourse.gohugo.io/t/requesting-help/9132)，并准备好三样东西：

1. `hugo env` 的完整输出（版本、扩展、平台一栏就够别人判断一大半问题）；
2. 完整报错文本，不要只截一句话；
3. 能复现问题的最小项目结构（目录树 + 关键文件内容），以及你期望的结果与实际结果的对比。

论坛地址见 [discourse.gohugo.io](https://discourse.gohugo.io)；提问语言不限，中文提问同样可以发在论坛里（论坛设有中文分类，可在分类列表中查找）。
