+++
title = "Nanosecond"
linkTitle = "Nanosecond"
description = "返回给定 time.Time 值在秒内的纳秒偏移，范围为 [0, 999999999]。"
date = 2026-10-02
weight = 150
source = "https://gohugo.io/methods/time/nanosecond/"

[params.functions_and_methods]
signatures = ["TIME.Nanosecond"]
returnType = "int"
+++

```go-html-template
{{ $t := time.AsTime "2023-01-27T23:44:58-08:00" }}
{{ $t.Nanosecond }} → 0
```
