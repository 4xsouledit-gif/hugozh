+++
title = "Hours"
linkTitle = "Hours"
description = "以浮点数形式返回该 time.Duration 值对应的小时数。"
date = 2026-10-02
weight = 20
source = "https://gohugo.io/methods/duration/hours/"

[params.functions_and_methods]
signatures = ["DURATION.Hours"]
returnType = "float64"
+++

```go-html-template
{{ $d = time.ParseDuration "3.5h2.5m1.5s" }}
{{ $d.Hours }} → 3.5420833333333333
```
