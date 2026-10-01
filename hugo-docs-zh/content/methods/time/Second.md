+++
title = "Second"
linkTitle = "Second"
description = "返回给定 time.Time 值在分钟内的秒偏移，范围为 [0, 59]。"
date = 2026-10-02
weight = 170
source = "https://gohugo.io/methods/time/second/"

[params.functions_and_methods]
signatures = ["TIME.Second"]
returnType = "int"
+++

```go-html-template
{{ $t := time.AsTime "2023-01-27T23:44:58-08:00" }}
{{ $t.Second }} → 58
```
