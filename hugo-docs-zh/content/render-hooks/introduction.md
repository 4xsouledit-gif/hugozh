+++
title = "简介"
linkTitle = "简介"
description = "渲染钩子的共同机制：模板位置与命名、查找顺序，以及默认渲染与自定义渲染的关系。"
date = 2026-10-01
weight = 10
source = "https://gohugo.io/render-hooks/introduction/"
+++

## 默认渲染与自定义渲染

把 Markdown 渲染为 HTML 时，渲染钩子会覆盖这一转换过程。每个钩子都是一个模板，受支持的元素类型各对应一个模板：

- [引用块](/render-hooks/blockquotes/)
- [代码块](/render-hooks/code-blocks/)
- [标题](/render-hooks/headings/)
- [图片](/render-hooks/images/)
- [链接](/render-hooks/links/)
- [原样透传元素](/render-hooks/passthrough/)
- [表格](/render-hooks/tables/)

> [!NOTE]
> Hugo 支持多种[内容格式](/content-management/content-formats/)，包括 Markdown、HTML、AsciiDoc、Emacs Org Mode、Pandoc 与 reStructuredText。
>
> 渲染钩子的能力仅限于 Markdown，无法为其他内容格式创建渲染钩子。

例如下面这段 Markdown：

```md
[Hugo](https://gohugo.io)

![kitten](kitten.jpg)
```

在没有链接钩子与图片钩子时，它被渲染为：

```html
<p><a href="https://gohugo.io">Hugo</a></p>
<p><img alt="kitten" src="kitten.jpg"></p>
```

创建链接与图片渲染钩子之后，就可以改变这段 Markdown 到 HTML 的转换结果。例如：

```html
<p><a href="https://gohugo.io" rel="external">Hugo</a></p>
<p><img alt="kitten" src="kitten.jpg" width="600" height="400"></p>
```

## 钩子模板的位置与命名

钩子模板放在 `layouts/_markup/` 目录中，文件名与元素类型一一对应：

```tree
layouts/
  └── _markup/
      ├── render-blockquote.html
      ├── render-codeblock.html
      ├── render-heading.html
      ├── render-image.html
      ├── render-link.html
      ├── render-passthrough.html
      └── render-table.html
```

某个元素类型只有提供了对应模板才会启用钩子；没有提供模板的元素继续使用 Hugo 的默认渲染方式，因此可以只覆盖自己关心的那一类元素。

## 查找顺序

模板查找顺序允许你为不同的页面类型（type）、页面种类（kind）、语言与输出格式分别创建不同的渲染钩子。例如：

```tree
layouts/
├── _markup/
│   ├── render-link.html
│   └── render-link.rss.xml
├── books/
│   └── _markup/
│       ├── render-link.html
│       └── render-link.rss.xml
└── films/
    └── _markup/
        ├── render-link.html
        └── render-link.rss.xml
```

上例在项目根级 `_markup` 目录中定义了默认的链接钩子，又为 `books`、`films` 两种页面类型各自定义了不同的链接钩子，并为 RSS 输出格式准备了单独的模板。代码块钩子还可以按语言细化命名，例如 `render-codeblock-mermaid.html` 只处理 `mermaid` 代码块。

钩子模板就是普通模板，可以调用局部模板、函数与页面方法，也可以与其他模板共享同一套渲染代码。

## 各页内容

本章其余各页逐一介绍每种渲染钩子，包括示例以及每个模板可以接收的上下文变量。除了共有的 `Page`（当前页面）与 `PageInner`（通过 `RenderShortcodes` 方法嵌套的页面）之外，各钩子提供的字段并不相同，具体见对应页面：[链接](/render-hooks/links/)、[图片](/render-hooks/images/)、[标题](/render-hooks/headings/)、[代码块](/render-hooks/code-blocks/)、[引用块](/render-hooks/blockquotes/)、[表格](/render-hooks/tables/)、[原样透传](/render-hooks/passthrough/)。
