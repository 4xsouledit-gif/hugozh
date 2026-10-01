+++
title = "strings.CountRunes"
linkTitle = "CountRunes"
description = "返回给定字符串中除空白字符之外的 rune 数量。"
date = 2026-10-02
weight = 70
source = "https://gohugo.io/functions/strings/countrunes/"

[params.functions_and_methods]
signatures = ["strings.CountRunes STRING"]
returnType = "int"
aliases = ["countrunes"]
+++

[`strings.RuneCount`][] 函数统计字符串中的每一个 rune，而 `strings.CountRunes` 会排除空白字符。

```go-html-template
{{ "Hello, 世界" | strings.CountRunes }} → 8
```

[`strings.RuneCount`]: /functions/strings/runecount/
