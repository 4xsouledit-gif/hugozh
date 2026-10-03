+++
title = "Markdown 属性（Markdown attribute）"
linkTitle = "Markdown 属性"
description = "附加到 Markdown 元素上的键值对，用于添加 HTML 属性或样式钩子。"
date = 2026-10-02
weight = 740
source = "https://gohugo.io/quick-reference/glossary/markdown-attribute/"

[params.teach]
difficulty = "参考"
prereq = ["在文档里遇到不认识的 Hugo 术语时查阅"]
outcomes = ["能判断属性该写在元素后面还是单独一行，并解释页面上为什么会多出一行花括号"]
next = ["/content-management/markdown-attributes/"]
+++

Markdown 属性（Markdown attribute）是附加到 Markdown 元素上的键值对。这些属性通常用于在元素渲染为 HTML 时为其添加 `class`、`id` 等 HTML 属性。它们让你可以扩展基本 Markdown 语法，为内容添加更多语义或样式钩子。

参见：[Markdown 属性](/content-management/markdown-attributes/)

## 为什么重要

它让你不写 HTML 就能给元素加 `class`、`id`，主题的样式钩子正是挂在这些属性上。块级属性（例如表格后单独一行的 `{.no-wrap-first-col}`）需要 Goldmark 的 `attribute.block` 打开，没打开时它只会被当成普通文字输出，页面上多出一行奇怪的 `{...}`。行内属性写在元素之后，位置写错同样会失效，而且不会有报错。

延伸阅读：[Markdown 属性](/content-management/markdown-attributes/)、[Markup 配置](/configuration/markup/)
