+++
title = "Abs"
linkTitle = "Abs"
description = "返回给定 time.Duration 值的绝对值。"
date = 2026-10-02
weight = 10
source = "https://gohugo.io/methods/duration/abs/"

[params.functions_and_methods]
signatures = ["DURATION.Abs"]
returnType = "time.Duration"
+++

```go-html-template
{{ $d = time.ParseDuration "-3h" }}
{{ $d.Abs }} → 3h0m0s
```
