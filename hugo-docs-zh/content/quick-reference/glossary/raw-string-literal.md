+++
title = "原始字符串字面量（raw string literal）"
linkTitle = "原始字符串字面量"
description = "反引号之间的字符序列，其中反斜杠没有特殊含义。"
date = 2026-10-02
weight = 1070
source = "https://gohugo.io/quick-reference/glossary/raw-string-literal/"

[params.teach]
difficulty = "参考"
prereq = ["在文档里遇到不认识的 Hugo 术语时查阅"]
outcomes = ["在模板里写正则或含反斜杠的字符串时选对引号形式，并看懂转义相关的报错"]
next = ["/templates/introduction/"]
+++

原始字符串字面量（raw string literal）是反引号之间的字符序列，例如 `` `bar` ``。反引号内部可以出现除反引号以外的任何字符。反斜杠没有特殊含义，字符串中可以包含换行。原始字符串字面量内部的回车符（`\r`）会从原始字符串值中丢弃。

参见：[Go 语言规范：字符串字面量](https://go.dev/ref/spec#String_literals)

## 为什么重要

模板里写正则、Windows 路径或含引号的字符串时，反引号形式的原始字符串可以省掉成对的反斜杠转义：`` `\d+` `` 与 `"\\d+"` 等价，前者更不容易数错。
反过来，双引号字符串里的反斜杠有特殊含义，正则写成 `"\d+"` 会因为不被识别的转义而报错；拿不准时优先用反引号，或者先看清报错指向的是哪一段字面量。

延伸阅读：[模板简介](/templates/introduction/) · [strings.FindRE](/functions/strings/findre/)
