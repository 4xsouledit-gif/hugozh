+++
title = "内容格式"
linkTitle = "内容格式"
description = "Hugo 支持的各类内容格式、外部程序依赖与 markup 配置分节。"
date = 2026-10-01
weight = 10
source = "https://gohugo.io/content-management/formats/"
+++

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

## 支持的格式

| 内容格式 | 媒体类型 | 标识符 | 文件扩展名 |
| --- | --- | --- | --- |
| Markdown | `text/markdown` | `markdown` | `markdown`、`md`、`mdown` |
| HTML | `text/html` | `html` | `htm`、`html` |
| Emacs Org Mode | `text/org` | `org` | `org` |
| AsciiDoc | `text/asciidoc` | `asciidoc` | `ad`、`adoc`、`asciidoc` |
| Pandoc | `text/pandoc` | `pandoc` | `pandoc`、`pdc` |
| reStructuredText | `text/rst` | `rst` | `rst` |

## Markdown

Markdown 是 Hugo 的默认内容格式，由内置的 Goldmark 渲染器直接渲染为 HTML。Goldmark 速度快，并遵循 CommonMark 与 GitHub Flavored Markdown 规范，可以在项目配置的 `[markup.goldmark]` 区段中调整。

Hugo 在 Markdown 之上提供了这些专有能力：

- 属性（attributes）：把 `class`、`id` 等 HTML 属性施加到图片以及引用块、围栏代码块、标题、水平线、列表、段落、表格等块级元素上，见[内容格式属性](/content-management/markdown-attributes/)。
- 扩展（extensions）：启用内置 Markdown 扩展，用来书写表格、定义列表、脚注、任务列表、插入文本、标记文本、下标、上标等。
- 数学公式（mathematics）：用 LaTeX 标记书写数学公式与表达式，见[数学公式](/content-management/mathematics/)。
- 渲染钩子（render hooks）：在渲染围栏代码块、标题、图片与链接时覆盖 Markdown 到 HTML 的转换逻辑，例如把每个独立图片渲染为 HTML 的 `figure` 元素，见[渲染钩子](/render-hooks/)。

## HTML

把内容写在 HTML 标记中，前面照常加前置元数据。内容通常相当于 HTML 文档 `body` 或 `main` 元素里会放置的部分，由 Hugo 直接输出，不再做 Markdown 转换。

> **注意**：HTML 内容格式默认被拒绝，需要配置 `security.allowContent` 才可使用。

## Emacs Org Mode

把内容写在 Emacs Org Mode 格式中，前面加前置元数据。前置元数据也可以用 Org Mode 关键字书写，详见[前置元数据中的 Org Mode 写法](/content-management/front-matter/)。

> **注意**：Emacs Org Mode 内容格式默认被拒绝，需要配置 `security.allowContent` 才可使用。

## AsciiDoc

把内容写在 AsciiDoc 格式中，前面加前置元数据。Hugo 调用 `asciidoctor` 可执行文件把 AsciiDoc 渲染为 HTML，因此必须在本机安装 `asciidoctor` 及其依赖（Ruby）。

> **注意**：Hugo 的默认安全策略不允许执行 `asciidoctor` 二进制文件，必须把它加入项目配置中的 `security.exec.allow` 列表。

可以在项目配置中配置 AsciiDoc 渲染器。默认配置下，Hugo 调用 `asciidoctor` 时传入的命令行标志为：

```sh
--no-header-footer
```

传入的标志取决于配置，构建时可以查看实际使用的标志：

```sh
hugo build --logLevel info
```

## Pandoc

把内容写在 Pandoc 格式中，前面加前置元数据。Hugo 调用 `pandoc` 可执行文件把 Pandoc 渲染为 HTML，因此必须在本机安装 `pandoc`。

> **注意**：Hugo 的默认安全策略不允许执行 `pandoc` 二进制文件，必须把它加入项目配置中的 `security.exec.allow` 列表。

Hugo 调用 `pandoc` 时传入的标志取决于本机安装的 Pandoc 版本。如果安装的版本支持 Pandoc 3.11 引入的 `--math-method` 标志：

```sh
--citeproc --math-method=mathjax
```

否则：

```sh
--citeproc --mathjax
```

（自 Hugo 0.164.0 起提供。）`--citeproc` 标志启用 Pandoc 的引文处理。使用 Pandoc 的文献与引文功能时，文献文件路径、引文样式、行内引用定义等设置通过内容文件里的元数据块控制，例如：

```md
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
```

> **注意**：文献文件与引文样式文件必须位于本地文件系统上，不能从 Hugo 模块导入；路径可以相对于项目根目录，也可以是绝对路径。

## reStructuredText

把内容写在 reStructuredText 格式中，前面加前置元数据。Hugo 通过 Docutils 的 `rst2html` 把 reStructuredText 渲染为 HTML，因此必须安装 Docutils 及其依赖（Python）。

> **注意**：Hugo 的默认安全策略不允许执行 `rst2html` 二进制文件，必须把它加入项目配置中的 `security.exec.allow` 列表。

Hugo 调用 `rst2html` 时传入的命令行标志为：

```sh
--leave-comments --initial-header-level=2
```

## 渲染器分类与配置

把内容转换为 HTML 时，Hugo 使用：

- 原生渲染器：Markdown、HTML、Emacs Org Mode。
- 外部渲染器：AsciiDoc、Pandoc、reStructuredText。

原生渲染器比外部渲染器更快。外部渲染器相关的选项位于项目配置的 `[markup]` 区段中并按格式分节，例如 AsciiDoc 的选项在 `[markup.asciidocExt]`；这些格式能否使用，取决于构建机器上是否装好了对应的外部程序，程序缺失时构建会报错。模板与内容格式无关：无论源文件用什么格式，渲染后的页面都由同一套模板输出。
