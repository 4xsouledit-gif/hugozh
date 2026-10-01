+++
title = "渲染钩子"
linkTitle = "渲染钩子"
description = "用模板覆盖 Markdown 元素到 HTML 的转换，逐类控制链接、图片、标题与代码块输出。"
date = 2026-10-01
weight = 80
source = "https://gohugo.io/render-hooks/"
+++

## 渲染钩子是什么

把 Markdown 转换为 HTML 时，渲染钩子（render hook）可以覆盖默认的转换结果。每个钩子都是一个模板，受支持的元素类型各对应一个模板，模板放在项目的 `layouts/_markup/` 目录中。

## 能覆盖哪些元素

目前可以创建渲染钩子的元素类型包括：

- 引用块（`render-blockquote.html`）
- 代码块（`render-codeblock.html`）
- 标题（`render-heading.html`）
- 图片（`render-image.html`）
- 链接（`render-link.html`）
- 透传元素（`render-passthrough.html`）
- 表格（`render-table.html`）

只有在项目中提供了对应模板的元素才会改用钩子输出，没有提供模板的元素仍按默认方式渲染。渲染钩子只适用于 Markdown，无法为 Hugo 支持的其他内容格式创建钩子。

## 钩子能做什么

- 给站外链接补上 `rel="external"` 之类的属性，或改写链接与图片的目标地址。
- 把独立图片渲染进 `figure` 元素，并附带题注。
- 为标题追加锚点链接，或调整标题的属性与层级输出。
- 把代码块交给内建语法高亮器（Chroma）处理，或交给自定义渲染，例如 Mermaid 图表。
- 按引用块的类型区分普通引用与警示块，输出不同的结构。
- 用渲染钩子把公式交给 KaTeX 在构建时渲染，而不是等浏览器执行 JavaScript。

## 本章各页分工

[简介](/render-hooks/introduction/)介绍钩子的共同机制：模板位置与命名、查找顺序、默认渲染与自定义渲染的关系。其余各页按元素类型展开，逐项列出该钩子可用的上下文变量与典型用法：[链接](/render-hooks/links/)、[图片](/render-hooks/images/)、[标题](/render-hooks/headings/)、[代码块](/render-hooks/code-blocks/)、[引用块](/render-hooks/blockquotes/)、[表格](/render-hooks/tables/)、[原样透传](/render-hooks/passthrough/)。

建议先读简介，再按需要查阅具体元素类型。
