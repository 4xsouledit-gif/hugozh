+++
title = "After"
linkTitle = "After"
description = "报告 TIME1 是否晚于 TIME2。"
date = 2026-10-02
weight = 40
source = "https://gohugo.io/methods/time/after/"

[params.functions_and_methods]
signatures = ["TIME1.After TIME2"]
returnType = "bool"
+++

```go-html-template
{{ $t1 := time.AsTime "2023-01-01T17:00:00-08:00" }}
{{ $t2 := time.AsTime "2010-01-01T17:00:00-08:00" }}

{{ $t1.After $t2 }} → true
```
