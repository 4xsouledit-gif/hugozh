+++
title = "Nanoseconds"
linkTitle = "Nanoseconds"
description = "以整数形式返回该 time.Duration 值对应的纳秒数。"
date = 2026-10-02
weight = 60
source = "https://gohugo.io/methods/duration/nanoseconds/"

[params.functions_and_methods]
signatures = ["DURATION.Nanoseconds"]
returnType = "int64"
+++

```go-html-template
{{ $d = time.ParseDuration "3.5h2.5m1.5s" }}
{{ $d.Nanoseconds }} → 12751500000000
```
