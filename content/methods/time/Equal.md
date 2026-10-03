+++
title = "Equal"
linkTitle = "Equal"
description = "报告 TIME1 是否等于 TIME2。"
date = 2026-10-02
weight = 70
source = "https://gohugo.io/methods/time/equal/"

[params.functions_and_methods]
signatures = ["TIME1.Equal TIME2"]
returnType = "bool"
+++

```go-html-template
{{ $t1 := time.AsTime "2023-01-01T17:00:00-08:00" }}
{{ $t2 := time.AsTime "2023-01-01T20:00:00-05:00" }}

{{ $t1.Equal $t2 }} → true
```
