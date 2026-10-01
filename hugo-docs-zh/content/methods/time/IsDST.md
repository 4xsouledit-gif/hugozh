+++
title = "IsDST"
linkTitle = "IsDST"
description = "报告给定 time.Time 值是否处于夏令时。"
date = 2026-10-02
weight = 100
source = "https://gohugo.io/methods/time/isdst/"

[params.functions_and_methods]
signatures = ["TIME.IsDST"]
returnType = "bool"
+++

```go-html-template
{{ $t1 := time.AsTime "2023-01-01T00:00:00-08:00" }}
{{ $t2 := time.AsTime "2023-07-01T00:00:00-07:00" }}

{{ $t1.IsDST }} → false
{{ $t2.IsDST }} → true
```
