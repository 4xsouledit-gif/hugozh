+++
title = "Minute"
linkTitle = "Minute"
description = "返回给定 time.Time 值在小时内的分钟偏移，范围为 [0, 59]。"
date = 2026-10-02
weight = 130
source = "https://gohugo.io/methods/time/minute/"

[params.functions_and_methods]
signatures = ["TIME.Minute"]
returnType = "int"
+++

```go-html-template
{{ $t := time.AsTime "2023-01-27T23:44:58-08:00" }}
{{ $t.Minute }} → 44
```
