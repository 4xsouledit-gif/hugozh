+++
title = "内容格式"
linkTitle = "内容格式"
description = "Hugo 支持的各类内容格式、外部程序依赖、markup 与安全策略配置；含构建验证方法与最常配错的地方。"
date = 2026-10-01
weight = 10
source = "https://gohugo.io/content-management/formats/"
aliases = ["/content-management/content-formats/", "/content/markdown-extras/", "/content/supported-formats/", "/doc/supported-formats/"]

[params.teach]
difficulty = "入门"
time = "15–20 分钟"
prereq = [
  "会写带前置元数据的内容文件，知道项目配置 `hugo.toml` 在哪。",
  "能执行 `hugo` 并看到构建日志。",
]
outcomes = [
  "说清 Hugo 如何判断一个文件用哪种格式渲染，以及 `markup` 覆盖扩展名的优先级；",
  "在项目配置里放开被默认安全策略拒绝的格式，并知道这会连带影响哪些格式；",
  "判断某个格式是原生渲染还是需要外部程序，外部程序缺失时读懂报错；",
  "决定新内容该用 Markdown 还是其它格式。",
]
next = ["/content-management/front-matter/", "/configuration/markup/", "/configuration/security/"]

+++

## 这一页解决什么问题

内容格式（content format）指内容源文件所使用的标记语言。Hugo 首先依据前置元数据（front matter）里的 `markup` 标识符选择内容渲染器，只有未提供该字段时才回退到文件扩展名。格式是逐文件判定的，因此同一个站点里可以混用多种格式：

```tree
content/
└── posts/
    ├── post-1.md
    ├── post-2.adoc
    ├── post-3.org
    ├── post-4.pandoc
    ├── post-5.rst
    └── post-6.html
```

无论使用哪种格式，内容文件都必须带有前置元数据，最好同时写出 `title` 与 `date`，详见[前置元数据](/content-management/front-matter/)。

内容格式决定了「这份文件由谁来渲染」。它看起来只是一个扩展名问题，实际上有四层：**扩展名 → `markup` 标识符 → 渲染器（原生/外部）→ 安全策略是否放行**。任何一层没对上，构建就会失败或输出不符预期。

实务上会遇到的两类问题，本页都给出可验证的做法：

1. **格式被安全策略拒绝**——HTML 与 Emacs Org Mode 默认不可用，必须显式放行；
2. **外部渲染器缺失**——AsciiDoc / Pandoc / reStructuredText 需要本机安装命令，而且报错常常**指向你的模板文件**，不在格式文件上。

**验证某个格式是否可用**：直接建一个最小文件并构建。

```bash
hugo --renderToMemory
```

**你应当看到什么**（**实测：Hugo 0.167**）：

| 你写的文件 | 直接构建的结果 |
| --- | --- |
| `content/plain.html`（HTML 内容） | 失败：`access denied: "text/html" is not whitelisted in policy "security.allowContent"` |
| `content/org.org`（Org Mode 内容） | 失败：`access denied: "text/org" is not whitelisted in policy "security.allowContent"` |
| `content/rst.rst`（本机没装 `rst2html`） | 失败：`rst2html / rst2html.py not found in $PATH, cannot render "rst.rst"`，**外层还包着一层指向模板 `.Content` 的报错** |

也就是说：**格式问题的报错不一定说「格式」，可能说「$PATH 里没有某个命令」，甚至指向 `layouts/` 里的模板文件**。看到这类报错先确认内容文件的扩展名和本机是否装了对应程序。

> [!WARNING]
> `security.allowContent` 是一张**白名单**：一旦在项目配置里写了这个表，就只放行你列出的类型。**实测（Hugo 0.167）**：只写 `[security.allowContent] html = true`，构建会因为 `"text/markdown" is not whitelisted` 而失败——连原本可用的 Markdown 都被挡在门外。放行任何格式时，记得把 `markdown = true` 一起写上。

## 支持的格式

| 内容格式 | 媒体类型 | 标识符 | 文件扩展名 |
| --- | --- | --- | --- |
| Markdown | `text/markdown` | `markdown` | `markdown`、`md`、`mdown` |
| HTML | `text/html` | `html` | `htm`、`html` |
| Emacs Org Mode | `text/org` | `org` | `org` |
| AsciiDoc | `text/asciidoc` | `asciidoc` | `ad`、`adoc`、`asciidoc` |
| Pandoc | `text/pandoc` | `pandoc` | `pandoc`、`pdc` |
| reStructuredText | `text/rst` | `rst` | `rst` |

**什么时候用 `markup` 字段**：文件扩展名与真实格式不一致时（例如一段 Markdown 存在 `.txt` 里），在前置元数据写 `markup = 'markdown'` 显式指定；其余情况不必写。

## Markdown

Markdown 是 Hugo 的默认内容格式，由内置的 Goldmark 渲染器直接渲染为 HTML。Goldmark 速度快，并遵循 CommonMark 与 GitHub Flavored Markdown 规范，可以在项目配置的 `[markup.goldmark]` 区段中调整。

Hugo 在 Markdown 之上提供了这些专有能力：

- 属性（attributes）：把 `class`、`id` 等 HTML 属性施加到图片以及引用块、围栏代码块、标题、水平线、列表、段落、表格等块级元素上，见[Markdown 属性](/content-management/markdown-attributes/)。
- 扩展（extensions）：启用内置 Markdown 扩展，用来书写表格、定义列表、脚注、任务列表、插入文本、标记文本、下标、上标等。
- 数学公式（mathematics）：用 LaTeX 标记书写数学公式与表达式，见[数学公式](/content-management/mathematics/)。
- 渲染钩子（render hooks）：在渲染围栏代码块、标题、图片与链接时覆盖 Markdown 到 HTML 的转换逻辑，例如把每个独立图片渲染为 HTML 的 `figure` 元素，见[渲染钩子](/render-hooks/)。

## HTML

把内容写在 HTML 标记中，前面照常加前置元数据。内容通常相当于 HTML 文档 `body` 或 `main` 元素里会放置的部分，由 Hugo 直接输出，不再做 Markdown 转换。

> [!NOTE]
> HTML 内容格式默认被拒绝，需要配置 [`security.allowContent`](/configuration/security/) 才可使用（**实测：Hugo 0.167**，错误信息为 `"text/html" is not whitelisted`）。

## Emacs Org Mode

把内容写在 Emacs Org Mode 格式中，前面加前置元数据。前置元数据也可以用 Org Mode 关键字书写，详见[前置元数据中的 Org Mode 写法](/content-management/front-matter/#emacs-org-mode-写法)。

> [!NOTE]
> Emacs Org Mode 内容格式默认被拒绝，需要配置 [`security.allowContent`](/configuration/security/) 才可使用（**实测：Hugo 0.167**，错误信息为 `"text/org" is not whitelisted`）。

## AsciiDoc

把内容写在 AsciiDoc 格式中，前面加前置元数据。Hugo 调用 `asciidoctor` 可执行文件把 AsciiDoc 渲染为 HTML，因此必须在本机安装 `asciidoctor` 及其依赖（Ruby）。

> [!NOTE]
> Hugo 的默认安全策略不允许执行 `asciidoctor` 二进制文件，必须把它加入项目配置中的 [`security.exec.allow`](/configuration/security/) 列表。

可以在项目配置中配置 AsciiDoc 渲染器。默认配置下，Hugo 调用 `asciidoctor` 时传入的命令行标志为：

```sh
--no-header-footer
```

传入的标志取决于配置，构建时可以查看实际使用的标志：

```sh
hugo build --logLevel info
```

**你应当看到什么**：日志里出现一行以 `INFO` 开头、包含 `asciidoctor` 与完整参数列表的记录。如果本机没装 `asciidoctor`，构建会失败并提示找不到该命令——这与上面的安全策略拒绝是两种不同的失败，先看清报错说的是「不允许执行」还是「找不到命令」。

## Pandoc

把内容写在 Pandoc 格式中，前面加前置元数据。Hugo 调用 `pandoc` 可执行文件把 Pandoc 渲染为 HTML，因此必须在本机安装 `pandoc`。

> [!NOTE]
> Hugo 的默认安全策略不允许执行 `pandoc` 二进制文件，必须把它加入项目配置中的 [`security.exec.allow`](/configuration/security/) 列表。

Hugo 调用 `pandoc` 时传入的标志取决于本机安装的 Pandoc 版本。如果安装的版本支持 Pandoc 3.11 引入的 `--math-method` 标志：

```sh
--citeproc --math-method=mathjax
```

否则：

```sh
--citeproc --mathjax
```

（0.164.0 新增）`--citeproc` 标志启用 Pandoc 的引文处理。使用 Pandoc 的文献与引文功能时，文献文件路径、引文样式、行内引用定义等设置通过内容文件里的元数据块控制，例如：

```md {file="content/example.pdc"}
---
title: home
---

This is a paragraph followed by a metadata block.

---
bibliography: foo.bib
citation-style: ieee.csl
link-citations: true
---

This is a citation: @einstein1905physics

This is another citation: [@WatsonCrick1953, p. 33]
```

> [!NOTE]
> 文献文件与引文样式文件必须位于本地文件系统上，不能从 Hugo 模块导入；路径可以相对于项目根目录，也可以是绝对路径。

## reStructuredText

把内容写在 reStructuredText 格式中，前面加前置元数据。Hugo 通过 Docutils 的 `rst2html` 把 reStructuredText 渲染为 HTML，因此必须安装 Docutils 及其依赖（Python）。

> [!NOTE]
> Hugo 的默认安全策略不允许执行 `rst2html` 二进制文件，必须把它加入项目配置中的 [`security.exec.allow`](/configuration/security/) 列表。

Hugo 调用 `rst2html` 时传入的命令行标志为：

```sh
--leave-comments --initial-header-level=2
```

**实测（Hugo 0.167）**：本机未安装 `rst2html` 时，构建报错形如

```text
failed to render pages: render of "content/rst.rst" failed:
"layouts/all.html:1:15": execute of template failed: …
error calling Content: "content/rst.rst:1:1": rst2html / rst2html.py not found in $PATH, cannot render "rst.rst"
```

注意报错里同时出现了**你的模板文件**和**内容文件**——前面那半句是模板执行链，最后一句才是真因。

## 渲染器分类与配置

把内容转换为 HTML 时，Hugo 使用：

- 原生渲染器：Markdown、HTML、Emacs Org Mode。
- 外部渲染器：AsciiDoc、Pandoc、reStructuredText。

原生渲染器比外部渲染器更快。外部渲染器相关的选项位于项目配置的 `[markup]` 区段中并按格式分节，例如 AsciiDoc 的选项在 `[markup.asciidocExt]`；这些格式能否使用，取决于构建机器上是否装好了对应的外部程序，程序缺失时构建会报错。模板与内容格式无关：无论源文件用什么格式，渲染后的页面都由同一套模板输出。

## 什么时候用哪种格式、什么时候别用

| 情形 | 该用 | 理由 |
| --- | --- | --- |
| 新写内容（绝大多数情况） | Markdown | 原生渲染、最快、工具链最全，本站全站如此 |
| 从已有 HTML 站点迁移、内容本身就是完整 HTML 片段 | HTML（需放行） | 避免二次转换；但要接受 Hugo 不再做 Markdown 处理 |
| 团队本来就用 Org Mode 写文档 | Emacs Org Mode（需放行） | 原生渲染；注意默认被安全策略拒绝 |
| 已有大量 AsciiDoc 文档 | AsciiDoc | 需自装 `asciidoctor` 与 Ruby，并加入执行白名单；构建依赖本机环境 |
| 需要 Pandoc 的多格式转换与引文处理 | Pandoc | 需自装 `pandoc` 并加入执行白名单 |
| **别用**：为了「尝鲜」给新内容换成外部渲染格式 | —— | 构建机上少一个二进制就整站构建失败，CI 与协作者都要跟着装 |
| **别用**：在同一个目录里混用多种格式却没有统一模板预期 | —— | 格式不同、渲染细节不同，模板要按输出结构写，容易出不一致 |
| **别用**：把 `security.allowContent` 写成只放行一种格式 | —— | 它是白名单，会让其它格式（包括 Markdown）一起失效（实测：Hugo 0.167） |

## 常见坑

| 类别 | 症状 | 真因 | 怎么修 |
| --- | --- | --- | --- |
| 构建失败 | `access denied: "text/html" is not whitelisted in policy "security.allowContent"` | HTML / Org Mode 默认被拒绝 | 在项目配置的 `[security.allowContent]` 里放行，**同时保留 `markdown = true`** |
| 构建失败 | 报错说 `"text/markdown" is not whitelisted`，可是内容全是 Markdown | 写了 `[security.allowContent]` 却漏掉 `markdown`——白名单被整体替换 | 把要用到的类型全部列上，见本页开头的提示 |
| 构建失败 | `xxx not found in $PATH, cannot render "…"` | 外部渲染器对应的命令没安装（`asciidoctor`、`pandoc`、`rst2html`） | 在构建机与 CI 上安装对应程序；本地开发可用容器统一环境 |
| 构建失败 | `access denied: … not permitted in policy "security.exec.allow"` | 命令存在但被安全策略禁止执行 | 把命令加入 `security.exec.allow`（支持正则） |
| 报错看不懂 | 报错指向 `layouts/…` 里的模板，看不出和内容格式有关 | 外部渲染失败被包在模板 `.Content` 调用的执行链里 | 往报错末尾看最后一句，通常就是「哪个命令找不到 / 哪个文件不能渲染」 |
| 没报错但结果不对 | 文件扩展名与内容实际格式不符，页面输出乱七八糟 | Hugo 按扩展名选渲染器，内容却不是那种格式 | 要么改扩展名，要么在前置元数据写 `markup = 'markdown'` 显式指定 |
| 没报错但结果不对 | 页面输出里出现了 Markdown 语法原文 | 文件被当成 HTML 或其它格式处理，Markdown 没有被解析 | 检查扩展名与 `markup` 字段，用 `hugo list all` 确认页面存在，再看产物 HTML |

更多排查入口见[故障排查](/troubleshooting/)。
