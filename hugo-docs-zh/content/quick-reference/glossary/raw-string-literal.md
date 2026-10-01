+++
title = "原始字符串字面量（raw string literal）"
linkTitle = "原始字符串字面量"
description = "反引号之间的字符序列，其中反斜杠没有特殊含义。"
date = 2026-10-02
weight = 1070
source = "https://gohugo.io/quick-reference/glossary/raw-string-literal/"
+++

原始字符串字面量（raw string literal）是反引号之间的字符序列，例如 `` `bar` ``。反引号内部可以出现除反引号以外的任何字符。反斜杠没有特殊含义，字符串中可以包含换行。原始字符串字面量内部的回车符（`\r`）会从原始字符串值中丢弃。

参见：[Go 语言规范：字符串字面量](https://go.dev/ref/spec#String_literals)
