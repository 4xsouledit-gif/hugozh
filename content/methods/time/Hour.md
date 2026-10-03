+++
title = "Hour"
linkTitle = "Hour"
description = "返回给定 time.Time 值在一天中的小时数，范围为 [0, 23]。"
date = 2026-10-02
weight = 90
source = "https://gohugo.io/methods/time/hour/"

[params.functions_and_methods]
signatures = ["TIME.Hour"]
returnType = "int"
+++

```go-html-template
{{ $t := time.AsTime "2023-01-27T23:44:58-08:00" }}
{{ $t.Hour }} → 23
```
