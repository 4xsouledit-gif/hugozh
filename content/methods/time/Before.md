+++
title = "Before"
linkTitle = "Before"
description = "报告 TIME1 是否早于 TIME2。"
date = 2026-10-02
weight = 50
source = "https://gohugo.io/methods/time/before/"

[params.functions_and_methods]
signatures = ["TIME1.Before TIME2"]
returnType = "bool"
+++

```go-html-template
{{ $t1 := time.AsTime "2023-01-01T17:00:00-08:00" }}
{{ $t2 := time.AsTime "2030-01-01T17:00:00-08:00" }}

{{ $t1.Before $t2 }} → true
```
