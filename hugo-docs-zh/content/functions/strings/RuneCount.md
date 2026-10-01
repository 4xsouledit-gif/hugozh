+++
title = "strings.RuneCount"
linkTitle = "RuneCount"
description = "返回给定字符串中的 rune 数量。"
date = 2026-10-02
weight = 190
source = "https://gohugo.io/functions/strings/runecount/"

[params.functions_and_methods]
signatures = ["strings.RuneCount STRING"]
returnType = "int"
+++

[`strings.CountRunes`][] 函数会排除空白字符，而 `strings.RuneCount` 统计字符串中的每一个 rune。

```go-html-template
{{ "Hello, 世界" | strings.RuneCount }} → 9
```

[`strings.CountRunes`]: /functions/strings/countrunes/
