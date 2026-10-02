+++
title = "内容格式"
linkTitle = "内容格式"
description = "用于书写内容的标记语言，例如 Markdown 或 HTML。"
date = 2026-10-02
weight = 260
source = "https://gohugo.io/quick-reference/glossary/content-format/"

[params.teach]
difficulty = "参考"
prereq = ["在文档里遇到不认识的 Hugo 术语时查阅"]
outcomes = ["判断一份内容会按哪套规则渲染，并认出格式与写法不匹配时的现象"]
next = ["/content-management/formats/"]
+++

## 内容格式

_内容格式_（content format）是用于创建内容的标记语言。通常是 Markdown，也可以是 HTML、AsciiDoc、Org、Pandoc 或 reStructuredText。

参见：[内容格式](/content-management/formats/)

## 为什么重要

内容格式决定正文按哪套规则解析：Markdown 下渲染钩子、块级属性与短代码都会生效，换成 HTML、AsciiDoc 等格式后行为不同，部分格式还需要项目配置与外部程序支持。Hugo 先看前置元数据里的 `markup` 字段，没有再回退到文件扩展名，所以同一站点可以混用多种格式。最常见的现象是把大段裸 HTML 写进 `.md`，或格式与扩展名对不上，正文原样输出而构建不报错。

延伸阅读：[Markdown 属性](/content-management/markdown-attributes/) · [标记配置](/configuration/markup/)
