+++
title = "Day"
linkTitle = "Day"
description = "返回给定 time.Time 值所在月份的日期。"
date = 2026-10-02
weight = 60
source = "https://gohugo.io/methods/time/day/"

[params.functions_and_methods]
signatures = ["TIME.Day"]
returnType = "int"
+++

```go-html-template
{{ $t := time.AsTime "2023-01-27T23:44:58-08:00" }}
{{ $t.Day }} → 27
```
