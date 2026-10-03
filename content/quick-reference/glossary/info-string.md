+++
title = "信息字符串（info string）"
linkTitle = "信息字符串"
description = "围栏代码块起始围栏之后的文本，用第一个词指定代码语言。"
date = 2026-10-02
weight = 560
source = "https://gohugo.io/quick-reference/glossary/info-string/"

[params.teach]
difficulty = "参考"
prereq = ["在文档里遇到不认识的 Hugo 术语时查阅"]
outcomes = ["能看懂代码块围栏后的语言名与 `{file=…}` 属性各起什么作用，并判断高亮为什么没生效"]
next = ["/content-management/syntax-highlighting/"]
+++

信息字符串（info string）是围栏代码块中起始围栏之后的文本。第一个词指定代码示例的语言。Hugo 会把其余内容解析为以空格或逗号分隔的属性。

参见：[Info strings](https://spec.commonmark.org/current/#info-string)

## 为什么重要

写 Markdown 时，代码块起始围栏后面跟的那个词就是信息字符串，它既决定语法高亮的语言，也承载 `{file="…"}` 这类属性——本站主题会把 `file` 渲染成代码块上方的文件名标题。语言名写错时 Hugo 不报错，只是不高亮，或按另一种语言高亮，你只能从渲染效果上发现。示例片段不需要高亮时，写 `text` 比猜一个语言名更稳妥。

延伸阅读：[语法高亮](/content-management/syntax-highlighting/)、[代码块](/render-hooks/code-blocks/)
