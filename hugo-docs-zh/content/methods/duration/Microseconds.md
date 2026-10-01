+++
title = "Microseconds"
linkTitle = "Microseconds"
description = "以整数形式返回该 time.Duration 值对应的微秒数。"
date = 2026-10-02
weight = 30
source = "https://gohugo.io/methods/duration/microseconds/"

[params.functions_and_methods]
signatures = ["DURATION.Microseconds"]
returnType = "int64"
+++

```go-html-template
{{ $d = time.ParseDuration "3.5h2.5m1.5s" }}
{{ $d.Microseconds }} → 12751500000
```
