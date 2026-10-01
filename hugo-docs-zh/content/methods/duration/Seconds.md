+++
title = "Seconds"
linkTitle = "Seconds"
description = "以浮点数形式返回该 time.Duration 值对应的秒数。"
date = 2026-10-02
weight = 80
source = "https://gohugo.io/methods/duration/seconds/"

[params.functions_and_methods]
signatures = ["DURATION.Seconds"]
returnType = "float64"
+++

```go-html-template
{{ $d = time.ParseDuration "3.5h2.5m1.5s" }}
{{ $d.Seconds }} → 12751.5
```
