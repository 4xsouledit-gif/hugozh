+++
title = "动态"
linkTitle = "动态"
description = "说清本站「动态」章节的范围——只有这一页索引，没有逐条发布说明——并给出查看官方发布说明的入口与升级前的六步检查清单。"
date = 2026-10-02
weight = 10
source = "https://gohugo.io/news/"
aliases = ["/release-notes/"]

[params.teach]
difficulty = "入门"
time = "10–15 分钟"
prereq = [
  "已经装好 Hugo，并且能执行 `hugo version`；没装的话先看[安装 Hugo](/installation/)。",
  "站点能构建成功：在站点根目录执行 `hugo --ignoreCache --renderToMemory --quiet`，退出码为 0。",
]
outcomes = [
  "说清本站「动态」章节的范围：只有这一页索引，没有逐条发布说明；",
  "在 GitHub Releases 与上游动态页之间选对入口，找到某个版本的变更列表；",
  "按「先看版本号、再找破坏性变更、最后看新增与修复」的顺序，判断一次升级是否与自己相关；",
  "用一份六步清单完成升级，并在构建日志出现 `deprecated` 时知道去哪里对照。",
]
next = ["/troubleshooting/deprecation/", "/installation/", "/troubleshooting/"]
+++

## 这一页解决什么问题

你听说 Hugo 出了新版本，想知道「这次更新跟我有没有关系」「现在要不要升级」。这一页就是回答这两个问题的入口。

先把本站的范围说清楚：**上游的 `news/` 是一组发布说明，本站只保留了这一页索引，没有搬运任何逐条发布说明。** 所以你在本站搜不到「某个版本改了什么」；这一页的作用是把你送到能看到原文的地方，并给出升级前后的检查步骤。

> [!NOTE]
> 实测（条件：Hugo v0.167.0+extended，windows/amd64；本站为单语言站点 zh-cn）：`content/news/` 下只有 `_index.md` 一个文件；执行 `hugo list all`，与 `news` 有关的输出只有一行；构建产物中 `/news/` 只有 `index.html`、`index.md`、`index.xml` 三个文件，没有任何版本条目页面。下一节给出复核方法，你可以自己验证。

这一页适合刚升级或准备升级 Hugo、想知道去哪儿读变更列表的读者。如果你要查的是某个函数怎么用，请直接看[函数](/functions/)或[方法](/methods/)参考页。

## 读完本章你应该能够

- 说清本站「动态」章节的范围：只有这一页索引，没有逐条发布说明；
- 在 [GitHub Releases](https://github.com/gohugoio/hugo/releases) 与[上游动态页](https://gohugo.io/news/)之间选对入口，找到某个版本的变更列表；
- 按「先看版本号、再找破坏性变更、最后看新增与修复」的顺序，判断一次升级是否与自己相关；
- 用一份六步清单完成升级，并在构建日志出现 `deprecated` 时知道去哪里对照。

## 建议阅读顺序

本章只有一页，所以「顺序」就是本页从前往后的顺序：

1. [上游的动态页里有什么](#上游的动态页里有什么) —— 先弄清本站与上游的差别，避免白找；
2. [去哪里看发布说明](#去哪里看发布说明) —— 五个常见问题各自对应哪个官方入口；
3. [读一条发布说明时看什么](#读一条发布说明时看什么) —— 用几分钟判断这次升级的风险；
4. [动手确认：本站没有发布条目](#动手确认本站没有发布条目) —— 两条命令验证本页的范围说明；
5. [升级前的检查清单](#升级前的检查清单) —— 真要升级时照着做。

## 上游的动态页里有什么

在官方站点上，[动态页](https://gohugo.io/news/)是一个**发布说明汇总**：每个 Hugo 版本占一条，标题形如 `Release v0.167.0`，链接指向该版本在 GitHub 上的发布页。上游的 `content/news/_index.md` 本身没有正文，条目由同目录下的 `_content.gotmpl` 生成（据上游仓库的该文件）：它构建时从 `https://api.github.com/repos/gohugoio/hugo/releases` 取数据，排除草稿与预发布版本，取最新 24 条，为每条生成一个页面。

本站没有搬这套机制，原因是它**依赖构建时联网**：条目内容随抓取时刻变化，构建结果不再只由仓库里的文件决定，也无法离线复现。因此本站 `content/news/` 只保留这一页索引，**不复制、不缓存任何版本条目**；旧地址 `/release-notes/` 通过别名重定向到本页。

## 去哪里看发布说明

| 你想知道什么 | 去哪里看 | 那里有什么 |
| --- | --- | --- |
| 最近发布了哪些版本 | [GitHub Releases](https://github.com/gohugoio/hugo/releases) | 每个版本一条记录；上游动态页的每一条都指向这里 |
| 官方整理好的列表 | [gohugo.io/news/](https://gohugo.io/news/) | 把上面的发布抓取成最新 24 条的列表页 |
| 这次升级会不会让我的站点构建失败 | [弃用说明](/troubleshooting/deprecation/) | 弃用的三个阶段各持续多久，以及升级后怎么把提示捞出来 |
| 某个函数、方法或配置项是哪个版本加的 | [函数](/functions/)、[方法](/methods/)、[配置](/configuration/) | 对应的参考页；本站按上游标注「（x.y.z 新增）」「（x.y.z 起弃用）」 |
| 怎么安装、怎么换版本 | [安装 Hugo](/installation/) | 各平台的安装方式与版本确认方法 |

> [!TIP]
> 只想判断「要不要动」的话，先看 [GitHub Releases](https://github.com/gohugoio/hugo/releases) 里最新一条就够了。真正需要你动手改的线索，通常出现在你自己站点的构建日志里（`deprecated` 行），而不在发布说明里。

## 读一条发布说明时看什么

官方发布说明逐条写法不完全一样（上游没有规定统一格式）。按下面的顺序扫，几分钟就能判断与自己的站点有没有关系：

1. **先看版本号**。版本号形如 `v0.167.1`：第二段数字变大是**次版本**（例如 `v0.167.0` → `v0.168.0`），第三段数字变大是修订版本（`v0.167.0` → `v0.167.1`）。Hugo 弃用节奏里说的「3 个次版本」指的就是第二段数字，定义见[弃用说明](/troubleshooting/deprecation/)。
2. **再找破坏性变更**。这类条目会在升级后直接让构建失败，或悄悄改变输出结果。发布说明一般会把它们单独列出，或用醒目字样标出（各版本写法不一致，以原文为准）。
3. **最后看新增与修复**。新函数、新配置项只在用得上时才需要细读；修复项里如果提到你正踩着的坑，那就是这次升级的理由。

判断完仍然拿不准时，不要凭发布说明下结论——**用自己的站点实跑一次**，见下面的「动手确认」与「升级前的检查清单」。

## 动手确认：本站没有发布条目

两条命令就能复核本页开头那段范围说明，不需要联网。请在**站点根目录**（`hugo.toml` 所在的那一层）执行。

先看目录里有什么：

```bash
ls content/news/
```

Windows PowerShell 用：

```powershell
Get-ChildItem content/news
```

**你应当看到什么**：只有 `_index.md` 一行。若这里列出了 `release-v0-167-0.md` 之类的文件，说明你手上的是上游仓库或另一个站点，不是本站。

再看 Hugo 自己认为有哪些页面：

```bash
hugo list all | grep news
```

Windows PowerShell 用：

```powershell
hugo list all | Select-String news
```

**你应当看到什么**：只有一行，以 `content/news/_index.md` 开头，倒数两列是 `section,news`。实测（v0.167.0）的输出如下；日期列取自你检出的内容，不必逐字比对：

```text
path,slug,title,date,expiryDate,publishDate,draft,permalink,kind,section
content/news/_index.md,,动态,2026-10-02T00:00:00+08:00,0001-01-01T00:00:00Z,2026-10-02T00:00:00+08:00,false,https://hugozh.cn/news/,section,news
```

最后打开线上或本地的 `/news/` 页面：

- 页面顶部是「动态」标题与导语，正文就是本页内容；
- 页面**没有**「本章内容」列表——本站的章节模板只在章节存在子页时才渲染这个列表（实测：v0.167.0 构建出的 `news/index.html`，正文之后没有页面列表）；
- 想要机器可读的版本，打开 `/news/index.md`，它的末尾写着「本章没有子页面。」；
- 订阅用 `/news/index.xml`（RSS）。这三种输出由站点配置里 `[outputs]` 的 section 一项决定，见[配置](/configuration/)。

## 升级前的检查清单

| 步骤 | 你做什么 | 你应当看到什么 |
| --- | --- | --- |
| 1 | 记录当前版本：`hugo version` | 一行形如 `hugo v0.167.0+extended windows/amd64 ...` 的输出，先抄下来 |
| 2 | 把当前站点提交到版本库：`git status` | 显示工作区干净；不干净就先提交，升级出问题时才退得回去 |
| 3 | 升级 Hugo | 再执行 `hugo version`，版本号已经变成新的 |
| 4 | 完整构建一次：`hugo --ignoreCache --renderToMemory` | 退出码 0；把构建统计里的页面总数与第 1 步的记录对比，应当一致 |
| 5 | 捞出弃用提示：`hugo build --logLevel info`（Windows 加 `\| Select-String deprecate`） | 出现以 `INFO` 开头、含 `deprecated` 的行就逐条处理，判据与做法见[弃用说明](/troubleshooting/deprecation/) |
| 6 | 本地预览并抽查 | 首页、一个内容页、一个列表页都正常；站内链接没有 404 |

两步的写法各有原因：第 4 步加 `--renderToMemory` 是为了不写 `public/`，升级验证阶段没必要产出文件；第 5 步要留档，所以用 `hugo build` 而不是 `hugo server`——开发服务器的输出会被文件监视信息刷掉，容易漏掉开头那几行。

## 常见坑

| 症状 | 真因 | 怎么修 |
| --- | --- | --- |
| 在本站站内搜索某个版本的发布说明，什么也搜不到 | 本站只有这一页索引，没有逐条发布说明（本页「动手确认」一节可以自证） | 去 [GitHub Releases](https://github.com/gohugoio/hugo/releases) 或 [gohugo.io/news/](https://gohugo.io/news/) 看；站内其它问题从[故障排查](/troubleshooting/)进入 |
| 在别处听说「动态里能看到每个版本的发布说明」，在本站却没找到 | 那些条目页由上游在构建时联网抓取生成，本站没有搬这套机制（见「上游的动态页里有什么」） | 改用上面的官方入口；顺手确认自己没有把上游仓库当成本站来构建 |
| 升级后构建失败，报错指向一个看起来没问题的文件 | Hugo 把错误归因到「正在渲染的那一页」，真因常在别处（未转义的短代码、配置编码等） | 按[报错看不懂](/troubleshooting/#症状-c报错看不懂)分诊；完整流程见[故障排查](/troubleshooting/) |
| 升级后构建成功，但线上样式或站内链接变了 | 弃用项改变了默认行为，或 `baseURL` 等配置与当前版本不再匹配 | 查[弃用说明](/troubleshooting/deprecation/)，再按[配置](/configuration/)逐项核对 |
| 构建一路成功，日志里却出现 `INFO ... deprecated` | 弃用初期只记 INFO 级别，默认日志级别看不到，也不会让构建失败 | 别等它变成 ERROR：按[弃用说明](/troubleshooting/deprecation/)在窗口期内替换掉 |
| `hugo list all \| grep news` 报 `grep: command not found` | Windows 默认没有 `grep` | 改用 `Select-String`，写法见本页「动手确认」一节 |

## 接着读

- [弃用说明](/troubleshooting/deprecation/) —— 升级 Hugo 之后的必读页，讲清 INFO → WARN → ERROR 的节奏；
- [安装 Hugo](/installation/) —— 换版本、换安装方式的完整做法；
- [故障排查](/troubleshooting/) —— 构建失败、页面缺失、结果不对时的分诊台。
