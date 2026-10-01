+++
title = "strings.Count"
linkTitle = "Count"
description = "返回给定子串在给定字符串中不重叠出现的次数。"
date = 2026-10-02
weight = 60
source = "https://gohugo.io/functions/strings/count/"

[params.functions_and_methods]
signatures = ["strings.Count SUBSTR STRING"]
returnType = "int"
+++

如果 `SUBSTR` 是空字符串，该函数返回 `STRING` 中 Unicode 码点（code point）的数量加 1。

```go-html-template
{{ "aaabaab" | strings.Count "a" }} → 5
{{ "aaabaab" | strings.Count "aa" }} → 2
{{ "aaabaab" | strings.Count "aaa" }} → 1
{{ "aaabaab" | strings.Count "" }} → 8
```
