+++
title = "解释型字符串字面量（interpreted string literal）"
linkTitle = "解释型字符串字面量"
description = "双引号之间的字符序列，其中的反斜杠转义会被解释。"
date = 2026-10-02
weight = 610
source = "https://gohugo.io/quick-reference/glossary/interpreted-string-literal/"

[params.teach]
difficulty = "参考"
prereq = ["在文档里遇到不认识的 Hugo 术语时查阅"]
outcomes = ["能判断模板里的字符串该用双引号还是反引号，并解释转义为什么会改变内容"]
next = ["/templates/introduction/"]
+++

解释型字符串字面量（interpreted string literal）是双引号之间的字符序列，例如 `"foo"`。引号之内可以出现除换行符和未转义的双引号之外的任何字符。引号之间的文本构成该字面量的值，其中的反斜杠转义会被解释。

参见：[Go 语言规范：字符串字面量](https://go.dev/ref/spec#String_literals)

## 为什么重要

在模板里写字符串时，双引号内的反斜杠会被解释：`"\n"` 是换行，而 Windows 路径里的 `\U` 会被当成转义，导致报错或内容变成别的字符。拼接路径、正则表达式或 LaTeX 片段时，改用 [raw string literal](g)（原始字符串字面量，反引号包裹）能省掉成串的反斜杠。分不清这两种字面量，最常见的症状是字符串与预期差一个字符，或模板直接解析失败。

延伸阅读：[模板简介](/templates/introduction/)
