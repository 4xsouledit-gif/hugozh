+++
title = "YearDay"
linkTitle = "YearDay"
description = "返回给定 time.Time 值在一年中的第几天：平年为 [1, 365]，闰年为 [1, 366]。"
date = 2026-10-02
weight = 270
source = "https://gohugo.io/methods/time/yearday/"

[params.functions_and_methods]
signatures = ["TIME.YearDay"]
returnType = "int"
+++

```go-html-template
{{ $t := time.AsTime "2023-01-27T23:44:58-08:00" }}
{{ $t.YearDay }} → 27
```
