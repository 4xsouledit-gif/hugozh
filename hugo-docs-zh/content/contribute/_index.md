+++
title = "参与贡献"
linkTitle = "参与贡献"
description = "参与 Hugo 项目与该中文文档站的三条路径：开发、文档、主题；先分清「改哪个仓库」，再按最小可验证的步骤提交第一个拉取请求。"
date = 2026-10-01
weight = 160
source = "https://gohugo.io/contribute/"

[params.teach]
difficulty = "入门"
time = "10 分钟读本章，单页动手 20–40 分钟"
prereq = [
  "本地能构建本站或任意 Hugo 站点：在站点根目录执行 `hugo --renderToMemory` 退出码为 0。",
  "有一个 GitHub 账号，机器上能执行 `git`（`git --version` 有输出）。",
  "知道「fork、clone、branch、commit、push、pull request」这几个词大致指什么；完全没接触过也能读，[参与开发](/contribute/development/) 会把第一步到第五步逐个写出来。",
]
outcomes = [
  "说清「上游 Hugo 项目」与「本站（中文文档站）」是两个不同的贡献对象，知道自己的改动该提到哪个仓库；",
  "按自己的情况选一条路径：改代码、改译文与教学层、提交主题；",
  "用 `git --version`、`hugo version` 两条命令确认环境就绪，并知道缺哪个该装哪个；",
  "用「构建退出码 0 + 站内链接全小写 + 教学层四件套齐全」三条标准判断自己的改动是否可以提交；",
  "遇到「Hugo 命令找不到 / 没报错但结果不对 / 报错看不懂」时，知道先查本页的常见坑表，再到[故障排查](/troubleshooting/)按现象查。",
]
next = ["/contribute/development/", "/contribute/documentation/", "/contribute/themes/", "/troubleshooting/"]
+++

## 这一页解决什么问题

这一章回答的是「我想出点力，但从哪下手」。上游的贡献章节写得克制：它假设你已经会 Git、会挑仓库、也知道改完要跑什么验证。这里补的正是这层：**先分清你要改的是哪个仓库，再给你一条能走完、且每一步都能验证的路径。**

最容易走错的一步不是技术，而是**提错仓库**：

| 你想改的东西 | 该提到哪个仓库 | 说明 |
| --- | --- | --- |
| Hugo 的源代码、CLI 行为、模板语法 | 上游 [Hugo 项目仓库](https://github.com/gohugoio/hugo/) | 见[参与开发](/contribute/development/) |
| Hugo 英文官方文档 | 上游[文档仓库](https://github.com/gohugoio/hugoDocs/) | 见[参与文档](/contribute/documentation/) 与[本站的贡献口径](#本站中文文档站的贡献口径) |
| **本站的中文译文、教学层、主题与模板** | 本站自己的仓库（见下一节） | 一个 PR 里只放一类改动，便于审查 |
| Hugo 社区主题目录 | 上游[主题仓库](https://github.com/gohugoio/hugoThemesSiteBuilder) | 见[参与主题](/contribute/themes/) |

> [!NOTE]
> 工作区里的 `hugoDocs/` 是上游英文仓库的**只读克隆**，只用来对照原文，**不要**修改它、也不要把它当成可以提交的分支。所有本站的改动都落在 `hugo-docs-zh/` 下。

## 三种参与方式

Hugo 是一个由社区驱动的开源项目，任何人都可以参与其中。整体上，参与贡献可以分成三类工作：

- 参与开发：报告与修复缺陷、改进功能、在论坛回答提问、关注议题队列、创建或改进主题，并按照规范的 GitHub 工作流提交补丁（详见[参与开发](/contribute/development/)）。
- 参与文档：官方文档位于独立的仓库，欢迎对既有文档的修正与改进；新功能的文档通常随代码一并发起拉取请求（详见[参与文档](/contribute/documentation/)）。
- 参与主题：把自制主题提交到社区主题站点，供其他用户浏览与使用（详见[参与主题](/contribute/themes/)）。

这三类工作在**本站**也能做，但口径与上游不同，见下面的「本站（中文文档站）的贡献口径」。本章的写作口径是：**每一页都写成「跟着做就能做完」的样子**——给出环境准备、分步操作、每一步的验证标准和失败排查入口，而不是罗列规则。

## 读完本章你应该能够

- 判断一次改动属于**开发 / 文档 / 主题**中的哪一类，并找到对应的仓库与页面；
- 在自己的操作系统上把贡献所需的环境准备好，并用 `git --version` 与 `hugo version` 确认；
- 走完一条完整链路：fork → clone → 建分支 → 改 → **本地验证** → commit → push → 开 PR；
- 面对本站的内容改动，按「六个前置字段齐全、正文从 `##` 开始、站内链接根相对且全小写、教学层四件套」这套标准自查；
- 遇到命令找不到、构建失败或结果不对时，先定位到**是哪一环**出了问题，再决定去查文档还是问人。

## 建议阅读顺序

1. **本页**——先花几分钟分清仓库与路径，避免把改动提到错误的地方。
2. 按你要做的事选一页深入：
   - 想改代码、想从源码构建 Hugo → [参与开发](/contribute/development/)；
   - 想改译文或教学层（**中文读者最常做的一类**）→ [参与文档](/contribute/documentation/)；
   - 想提交一个主题 → [参与主题](/contribute/themes/)。
3. 准备提交之前，回到本页的[提交前的自查清单](#提交前的自查清单)逐条过一遍。
4. 被报错卡住时，到[故障排查](/troubleshooting/)按现象查；想先给站点做一次体检，见[审计](/troubleshooting/audit/)。

## 本站（中文文档站）的贡献口径

这一段是**本地化增补**（上游文档没有对应内容），写的是本站自己的规矩。

先看清本站是什么：

- 本站是 **Hugo 官方文档的社区简体中文翻译站（非官方）**，站点地址 <https://hugozh.cn/>，源码仓库 <https://github.com/hencter/hugozh>；上游原文仓库是 <https://github.com/gohugoio/hugoDocs>，上游文档站点是 <https://gohugo.io/>。
- 规模与结构（依据仓库根目录的 `README.md`）：全站 **948 个 Markdown 文件**、20 个一级章节目录，其中 19 章与上游 1:1 对应，另有 1 章是本站原创的「技能包」。
- 站点配置在 `hugo-docs-zh/hugo.toml`，`baseURL` 已指向线上域名；内容在 `hugo-docs-zh/content/`，版式在 `hugo-docs-zh/themes/` 的两个主题里。

### 本站欢迎什么样的改动

- **译文修正**：错译、漏译、术语不一致、中文语病。译文以对上游英文原文的翻译为准，技术细节（命令、参数、默认值、签名、表格、代码块、外链）**一行都不能丢**。
- **教学层增补**：补「这一页解决什么问题」「你应当看到什么」的验证标准、常见坑（症状 → 真因 → 怎么修）。这是本站与上游直译最大的区别，也是最缺人手的地方。
- **本站模板与样式**：`hugo-docs-zh/layouts/` 与两个主题里的模板、CSS。
- **上游那条线**：改英文原文请提到上游文档仓库；改 Hugo 源码请提到上游项目仓库。两条线的流程见本章后两页。

### 与上游的三点不同

1. **正文语法与上游不完全一样**。本站只有两个短代码：`note` 与 `quick-reference`。上游的 `code-toggle`、`new-in`、`include` 等在本站不存在，照抄会让**整站构建失败**（不是单页失败），改写方法见[参与文档](/contribute/documentation/)。
2. **前置元数据是本站自己的六字段契约**：`title` / `linkTitle` / `description` / `date` / `weight` / `source`，缺一不可，且**必须写在任何表头之前**。
3. **验收标准写成了可执行的脚本**，见下一节。上游没有对应工具。

### 验收标准（跑得出结果的那种）

所有命令都在**仓库根目录**（即工作区根目录，`hugo-docs-zh/` 的上一级）执行：

| 检查 | 命令 | 通过的样子 |
| --- | --- | --- |
| 站点能构建 | `cd hugo-docs-zh; hugo --ignoreCache --renderToMemory --quiet` | 退出码 0，终端没有 `ERROR` |
| 教学层覆盖 | `pwsh -NoProfile -File .translation/audit-teach.ps1` | 输出一张按章节统计的表；教程章节（`getting-started` / `installation` / `troubleshooting`）应为全绿 |
| 站内链接（区分大小写） | `pwsh -NoProfile -File .translation/audit-links-case.ps1` | 末行「全部站内链接大小写与存在性均正确 ✓」；该脚本需要先构建出 `public/` |
| 一键验收 | `pwsh -NoProfile -File .translation/accept.ps1` | 依次跑覆盖率、权重归一、严格构建、链接检查与铁律扫描，构建那一步打印 `build exit=0` |

> [!TIP]
> 前两条检查不需要 PowerShell 7 也能跑（`powershell` 也行）；只有当你**用重定向写文件**时才必须避开 Windows PowerShell 5.1，原因见下一节的常见坑。

## 提交前的自查清单

内容类改动（译文、教学层）逐条对照，全部满足再开 PR：

- [ ] `hugo --ignoreCache --renderToMemory --quiet` **退出码为 0**；
- [ ] 六个前置字段齐全，且都在 `[params.teach]` 之类的表头**之前**；
- [ ] 正文从 `##` 开始，没有额外的一级标题；
- [ ] 站内链接是**根相对**（`/getting-started/quick-start/`）且**全小写**——Hugo 生成的 URL 一律小写，写成驼峰就是死链；
- [ ] 上游的技术细节没有被删：命令、参数、默认值、表格、代码块、外链都在；
- [ ] 正文里没有**未转义的短代码定界符**（除了 `note` / `quick-reference` 的正式调用），展示语法时写成转义形式；
- [ ] 没有出现被禁止的字面串（Hugo 的短代码占位符前缀，写法见[参与文档](/contribute/documentation/)）；
- [ ] 新增的中文结论标了「实测」，并写清测量条件（Hugo 版本、单语言还是多语言站点等）；**没有把握的就不要写成结论**。

## 常见坑

| 症状 | 真因 | 怎么修 |
| --- | --- | --- |
| 命令找不到：`hugo: command not found`，或 Windows 上提示「不是内部或外部命令」 | Hugo 没装，或装了但可执行文件不在 `PATH` 里 | 按平台安装并确认 `hugo version` 有输出，见[安装 Hugo](/installation/)、[快速开始](/getting-started/quick-start/) |
| 命令找不到：`git: command not found` | 没装 Git，或安装后没重开终端 | 安装 Git 后**重开终端**再试；用 `git --version` 验证 |
| 命令找不到：`go: command not found`（只有从源码构建才需要 Go） | Go 没装，或 `go install` 的输出目录不在 `PATH` | `go env GOPATH` 看二进制落在哪里，再把其下的 `bin` 加入 `PATH`；见[安装 Hugo](/installation/) 里的「从源码构建」一节 |
| 没报错但结果不对：改了页面，本地预览和线上都没变化 | 文件放错了位置（例如放进了 `content/` 的根而不是章节目录），或页面被 `draft`、`date` 挡在构建之外 | 确认文件在 `content/<章节>/` 下且前置字段正确；用 `hugo list drafts`、`hugo list future` 查它去哪了 |
| 没报错但结果不对：正文顶部那行「英文原文：…」消失 | `source` 字段被写到了某个表头之后，TOML 把它归进了那张表 | 把六个标量字段整体移到所有表头之前——Hugo **不会报错**，只是静默丢失 |
| 报错看不懂：`toml: invalid character at start of key: U+00FF` | 配置文件被写成了 UTF-16LE + BOM（Windows PowerShell 5.1 的 `>>`、`Set-Content` 默认如此） | 用编辑器或 PowerShell 7（`pwsh`）改文件；内容文件一律用编辑工具写，不要用 shell 重定向 |
| 报错看不懂：`failed to extract shortcode: template for shortcode "…" not found` | 正文里有未转义的短代码定界符，而本站没有这个短代码 | 改成纯 Markdown，或写成转义形式；见[参与文档](/contribute/documentation/) |
| 报错看不懂：`illegal state in content; shortcode token missing end delim`，且报错指向的页面看不出问题 | 正文里出现了 Hugo 的短代码占位符前缀字面串 | 见[参与文档](/contribute/documentation/)；报错归因到别的页面是已知现象 |
| 构建成功，但线上某个链接 404 | 站内链接写成了驼峰（Hugo 输出全小写），或目标页面已改名 | 跑 `.translation/audit-links-case.ps1` 定位，把链接改成全小写 |

分诊与更系统的排查见[故障排查](/troubleshooting/)；上线前想先给站点做一次体检，见[审计](/troubleshooting/audit/)。

## 下一步

- 想改代码 → [参与开发](/contribute/development/)
- 想改译文或教学层 → [参与文档](/contribute/documentation/)
- 想提交主题 → [参与主题](/contribute/themes/)
