+++
title = "Year"
linkTitle = "Year"
description = "返回给定 time.Time 值所在的年份。"
date = 2026-10-02
weight = 260
source = "https://gohugo.io/methods/time/year/"

[params.functions_and_methods]
signatures = ["TIME.Year"]
returnType = "int"
+++

```go-html-template
{{ $t := time.AsTime "2023-01-27T23:44:58-08:00" }}
{{ $t.Year }} → 2023
```
