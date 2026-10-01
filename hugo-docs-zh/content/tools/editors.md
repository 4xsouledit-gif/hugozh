+++
title = "编辑器"
linkTitle = "编辑器"
description = "为常用编辑器提供 Hugo 语法支持的插件。"
date = 2026-10-01
weight = 10
source = "https://gohugo.io/tools/editors/"
+++

## 简介

Hugo 社区使用的编辑器相当分散，因此针对几款最流行的文本编辑器，都有人开发了插件，用来自动化工作流中的一部分环节。这些插件大多提供语法高亮、代码片段与补全，个别还会代为调用外部命令。下面按编辑器分组列出。

## Visual Studio Code

[gotmplfmt](https://marketplace.visualstudio.com/items?itemName=GoHugoIO.gotmplfmt)
: 由 Hugo 作者开发并维护，这个扩展借助 [gotmplfmt](https://github.com/gohugoio/gotmplfmt) 命令行工具格式化模板。

[Front Matter](https://marketplace.visualstudio.com/items?itemName=eliostruyf.vscode-front-matter)
: 这个扩展用于维护文章的元数据，例如创建日期、修改日期、slug、标题、SEO 检查等。

[Hugo Helper](https://marketplace.visualstudio.com/items?itemName=rusnasonov.vscode-hugo)
: 这个扩展提供了一些实用的命令。源码见其 [GitHub 仓库](https://github.com/rusnasonov/vscode-hugo)。

[Hugo Language and Syntax Support](https://marketplace.visualstudio.com/items?itemName=budparr.language-hugo-vscode)
: 这个扩展提供语法高亮与代码片段。源码见其 [GitHub 仓库](https://github.com/budparr/language-hugo-vscode)。

[Hugo Shortcodes](https://marketplace.visualstudio.com/items?itemName=thuliteio.hugo-shortcodes)
: 这个扩展为 Markdown 中的短代码加上语法高亮与智能补全，短代码名称与参数会从工作区的模板中自动发现。源码见其 [GitHub 仓库](https://github.com/thuliteio/hugo-shortcodes)。

[Hugo Themer](https://marketplace.visualstudio.com/items?itemName=eliostruyf.vscode-hugo-themer)
: 这个扩展简化了主题开发，便于在主题的各文件之间跳转。

[Hugofy](https://marketplace.visualstudio.com/items?itemName=akmittal.hugofy)
: 这个扩展让项目开发更顺手。源码见其 [GitHub 仓库](https://github.com/akmittal/hugofy-vscode)。

[Syntax Highlighting for Hugo Shortcodes](https://marketplace.visualstudio.com/items?itemName=kaellarkin.hugo-shortcode-syntax)
: 这个扩展为短代码加上语法高亮，使各个片段在视觉上更容易辨认。

## JetBrains IDEs

[Smart Hugo](https://smarthugo.dev)
: 这个插件适用于 IntelliJ IDEA、WebStorm、PhpStorm 等 JetBrains IDE，提供模板支持，包括语法高亮、动作补全、代码格式化，以及可选的高级功能。

## Emacs

[emacs-easy-hugo](https://github.com/masasam/emacs-easy-hugo)
: 这个 Emacs 主模式支持用多种标记格式撰写博客，包括 Markdown、Org mode、AsciiDoc、reStructuredText、mmark 与 HTML。

[ox-hugo.el](https://ox-hugo.scripter.co)
: 这个原生 Org mode 导出器会导出带前置字段的 Blackfriday Markdown。它支持两种常见的 Org 博客工作流：把单个文件中的多棵 Org 子树导出为多篇文章，以及把单个 Org 文件导出为单篇文章。它还利用了 Org 的标签与属性继承特性。更多说明见 [Why ox-hugo?](https://ox-hugo.scripter.co/doc/why-ox-hugo/)。

## Sublime Text

[Hugo Snippets](https://packagecontrol.io/packages/Hugo%20Snippets)
: 这个插件添加自动代码片段。

[Hugofy](https://github.com/akmittal/Hugofy)
: 这个插件让项目开发更顺手。

## Vim

[Vim Hugo Helper](https://github.com/robertbasic/vim-hugo-helper)
: 这个插件便于撰写页面与博客文章。

[vim-hugo](https://github.com/phelipetls/vim-hugo)
: 这个插件为模板提供语法高亮，以及另外几项功能。
