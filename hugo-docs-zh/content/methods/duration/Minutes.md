+++
title = "Minutes"
linkTitle = "Minutes"
description = "以浮点数形式返回该 time.Duration 值对应的分钟数。"
date = 2026-10-02
weight = 50
source = "https://gohugo.io/methods/duration/minutes/"

[params.functions_and_methods]
signatures = ["DURATION.Minutes"]
returnType = "float64"
+++

```go-html-template
{{ $d = time.ParseDuration "3.5h2.5m1.5s" }}
{{ $d.Minutes }} → 212.525
```
