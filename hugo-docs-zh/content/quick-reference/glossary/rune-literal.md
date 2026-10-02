+++
title = "rune 字面量（rune literal）"
linkTitle = "rune 字面量"
description = "模板中 rune 的文本表示，由单引号括起的字符序列组成。"
date = 2026-10-02
weight = 1170
source = "https://gohugo.io/quick-reference/glossary/rune-literal/"

[params.teach]
difficulty = "参考"
prereq = ["在文档里遇到不认识的 Hugo 术语时查阅"]
outcomes = ["能区分模板里的 rune 字面量与字符串字面量，并在类型不符的报错里定位到引号写法"]
next = ["/functions/strings/"]
+++

rune 字面量（rune literal）是 [template](g) 中 [rune](g) 的文本表示。它由单引号括起的字符序列组成，例如 `'x'`、`'\n'` 或 `'ü'`。

与表示字符序列的 [interpreted string literals](g) 或 [raw string literals](g) 不同，rune 字面量表示一个标识 Unicode [code point](g) 的单个 [integer](g) 值。引号内部可以出现除换行符和未转义的单引号以外的任何字符。以反斜杠（`\`）开头的多字符序列可用于编码特定值，例如 `\n` 表示换行，`\u00FC` 表示字母 `ü`。

参见：[Go 语言规范：rune 字面量](https://go.dev/ref/spec#Rune_literals)

## 为什么重要

Hugo 模板里单引号与双引号含义不同：`'x'` 是 rune（数值），`"x"` 是字符串。需要按码点比较、或给 `printf "%c"` 传参时用 rune 字面量；该用单引号却写成双引号，类型不符会让比较永远不成立，或者直接报错。

延伸阅读：[字符串函数](/functions/strings/)、[模板简介](/templates/introduction/)
