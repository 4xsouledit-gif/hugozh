+++
title = "Hugo 静态站点技能包"
linkTitle = "技能包"
description = "把建站经验打包给 AI 编码代理：一份可复用的 Hugo 技能包，含 26 个真实踩坑、SEO、多主题、日期与短代码的参考手册。"
date = 2026-10-01
weight = 5

[params.teach]
difficulty = "进阶"
time = "安装 2 分钟；通读约 20 分钟"
prereq = [
  "你要么在用某个 AI 编码代理（想要它别再犯 Hugo 的坑），要么自己在维护 Hugo 站点（想直接看踩坑清单）。",
  "不需要写代码——技能包就是一组 Markdown 文件。",
]
outcomes = [
  "把这个技能包装进 DSH 或任意 AI 编码代理，让它「加载后就知道该查什么、该避什么」；",
  "不用任何工具也能直接读：把 `references/` 当文档看，其中 G1–G28 逐条是「症状 → 真因 → 修法」；",
  "分清技能包里的断言哪些是「官方文档明文」、哪些是「实测观察」，知道该信到什么程度；",
  "自己写一条新的踩坑记录投稿：附最小复现与 `hugo version`，这比结论本身更有价值。",
]
next = ["/skill/SKILL.md", "/skill/references/gotchas.md", "/troubleshooting/"]
+++

{{< banner >}}

这个站点是靠一个 **AI 编码代理**建起来的——20 个章节、约 950 个文件、两个主题、SEO 与版本控制。过程中踩的坑、被文档静默坑过的地方、以及最后固化成规则的做法，全部打包成了这个技能包：**`hugo-static-site`**。

它不是教程，而是**给代理用的作业手册**：当有人要求「给这个 Hugo 站加一个短代码」「把页面时间做成中文」「为什么构建失败了」，代理加载它之后应当直接知道该查什么、该避什么。

## 安装

### 直接复制这句提示词给你的代理

把下面整段（含第一行）复制粘贴给你的 AI 代理，**不需要你再补充任何路径**。同一内容的纯文本版也会随技能包发布，可以直接取用：<https://hugozh.cn/skill/INSTALL-PROMPT.txt>。

```text
安装 hugo-static-site 技能包：先读清单 https://hugozh.cn/skill/skill-manifest.json，
按 files[].path 与 files[].sha256 列出 13 个文件（SKILL.md、README.md、INSTALL-PROMPT.txt、references/ 下 10 个），
逐个从 files[].url 取回并落盘。落盘后用 sha256 逐个校验，任何一个不一致就报告并停止。

安装前先确认你自己的身份与约定，别照抄别人的目录：说明你是哪个代理（产品名 + 版本），
以及你采用哪套技能/规则目录与加载机制（例如项目内的 ./.你的代理名/... 或用户级的 ~/.你的代理名/...），
并写出你的依据（你自己的文档、内置默认，或本项目的既有配置）。

先看当前项目里有没有既有的代理配置（AGENTS.md、CLAUDE.md、.cursor/rules、
.你的代理名/ 等）：有就按它的约定装到项目内、与它保持一致；没有就在项目内创建
你的默认技能目录并落盘，同时把「装了本技能」这件事写进该项目对应的代理配置文件
（没有该文件就创建），让下次会话能自动加载。

装完报告四项：① 你的身份与依据；② 你选了哪个目录、为什么；③ 13 个文件的 sha256
校验结果；④ 需要重启会话还是立刻生效。最后读一遍 SKILL.md，用一句话复述它的第一条铁律。

（固定要求，不要改动：目录名与内部相对路径必须与清单一致 —— SKILL.md 与
references/gotchas.md 等不得拍平或改名；哈希必须逐文件校验。除此之外的安装位置与加载方式
由你按自己的约定决定。）
```

### 这句提示词为什么这么写

它**不含任何具体产品的路径**——没有 `.dsh`、没有 `.claude`。原因是：不同代理的技能目录、加载机制、是否支持项目级安装都不一样，任何写死的目录都会对别的代理失效（本站自己就踩过两次：先写死 `~/.dsh/skills/`，后又把 `.dsh` 当默认）。

所以它要求代理**先自报身份再动手**：先说明自己是谁、依据哪份文档或哪条内置默认，再决定目录。这样即使某个代理的约定我们完全不了解，它也能按自己的规范装对；而我们仍然能验收结果。

它把四件**与环境无关**的事固定下来，其余交给代理：

| 固定（否则无法验收） | 交给代理（它比文档清楚） |
| --- | --- |
| 清单里的 `path` 与 `sha256`，共 13 个文件 | 装到哪个目录、叫什么名字 |
| 内部相对路径不变（`references/` 不能拍平） | 用哪种注册/加载机制 |
| 落盘后必须逐文件校验哈希 | 项目级还是用户级 |
| 必须先自报身份与依据，再动手 | 是否需要重启会话 |

`files[]` 里同时给了两个下载地址（`url` 站内镜像、`rawUrl` 仓库原文），因此代理没有网络工具之外的依赖；`sha256` 对应**发布字节**（UTF-8 无 BOM、LF），验证的是「与发布一致」，不验证「适合你的项目」。

> ⚠ 清单里的 `path` 是**技能包内部的相对路径**（`SKILL.md`、`references/gotchas.md`…），必须保持这个结构。曾经出现过的错误做法是把安装目录写死成某个产品的路径——那对其它代理直接失效。

### 代理不支持技能机制 / 完全不想安装

技能包就是 13 个 Markdown 文件，没有可执行代码，所以这两种情况不需要任何安装步骤：

- **代理有「规则」但没有「技能」** → 把要点写进它支持的规则文件，或直接让它读这些文件；
- **只想读** → 直接看本站镜像 [`SKILL.md`](/skill/SKILL.md)、[`references/gotchas.md`](/skill/references/gotchas.md)（其余文件同在 `/skill/` 下），或下载仓库 ZIP：<https://codeload.github.com/hencter/hugozh/zip/refs/heads/main>。

**「读文档」和「装成技能」在内容上没有任何区别**，只是加载时机的差别。

> 用 `git clone` 取文件的话，`git` 会**转换行尾**。若你的平台是 Windows，克隆后哈希可能与清单不一致；需要精确匹配时按清单里的 `url` 逐个取回（那才是「原样」）。差异只在 CRLF/LF，不影响内容。

技能包就是 Markdown：直接看本站镜像 [`SKILL.md`](/skill/SKILL.md) 与 [`references/gotchas.md`](/skill/references/gotchas.md)（其余文件同在 `/skill/` 下），或下载仓库 ZIP：<https://codeload.github.com/hencter/hugozh/zip/refs/heads/main>。

## 它解决的真实问题

技能包里的每一条都来自真实故障，而不是转述文档。举三个：

| 现象 | 真因 | 为什么难查 |
| --- | --- | --- |
| 一个**没有任何花括号**的页面报「短代码未闭合」，重写整页也无效 | 正文里出现了字面串 H&#xfeff;AHAHUGOSHORTCODE（Hugo 短代码占位符前缀） | 错误被归因到该页面，但字符串看起来只是普通文字；上游文档用零宽字符 `H&#xfeff;AHAHUGOSHORTCODE` 绕开它 |
| `theme` 明明写在配置里，却报「找不到任何 kind 的模板」，页面数从 226 掉到 21 | TOML 作用域：`[table]` 之后的裸键会归入该表，`theme` 变成了 `frontmatter.theme` | 配置语法完全合法，Hugo 不报错 |
| 中文站的日期显示成 `October 1, 2026` | Hugo 的 `:date_*` 本地化 token 数据不覆盖 `zh`，静默回退英文 | 同一模板下德语正常，配置看起来毫无问题 |

## 里面有什么

| 文件 | 内容 |
| --- | --- |
| `SKILL.md` | 铁律与工作流：什么会让**整站**构建失败、无 shell 时怎么降级、快速迭代循环 |
| `INSTALL-PROMPT.txt` | 上一节那段可复制的安装提示词（纯文本，便于直接粘贴或让代理按 URL 取用） |
| `references/gotchas.md` | **G1–G28** 逐条「症状 → 真因 → 修法」，并标注 documented / observed / not documented |
| `references/seo.md` | 逐标签清单、结构化数据的 `jsonify` 陷阱、robots/sitemap、性能 |
| `references/shortcodes.md` | 短代码撰写：两种记法与渲染顺序、`.Inner` 的真实取值、内置短代码清单、「在文档页里展示真实产物」的演示框写法、与 render hook 的分工 |
| `references/dates.md` | 三个日期字段与回退链、时区、本地化格式与相对时间 |
| `references/i18n.md` | **可选**：多语言结构、切换器、字符串表与占位符 |
| `references/versioning.md` | Git 该跟踪什么、`enableGitInfo`、提交驱动的「最后更新」 |
| `references/site-structure.md` | 主题分层、前置元数据契约、导航与多语言约定 |
| `references/versions.md` | 0.140 → 0.167 的逐版本改名与默认值变化 |
| `references/commands.md` | 命令笔记：只列工作流用到的标志，完整参考交给 `hugo gen doc` |
| `references/teaching-layer.md` | 人机同源的教学层契约：教学块字段、两个出口共用一份数据、覆盖度审计 |

## 它刻意不做的事

- **不写脚本**：能由 Hugo 自己回答的（`--printPathWarnings`、`hugo config`、`hugo list`、`hugo gen doc`）就不另造工具，避免与二进制跑偏；
- **不转抄可生成的内容**：CLI 手册、设置清单、高亮样式分别交给 `hugo gen doc`、`hugo config`、`hugo gen chromastyles`；
- **不把推断当文档**：无法指到来源的结论会标注为「实测」或「未记载」。

## 许可与贡献

技能包采用 **MIT** 许可，可自由取用、修改、再分发（本仓库的译文部分另有其许可，见[许可说明](/about/license/)）。

发现新的坑、或想补充某一类清单，欢迎提 Issue / PR——请尽量附上**可复现的最小例子**与 `hugo version`，这比结论本身更有价值。
